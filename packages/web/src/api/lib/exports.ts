import { readFile } from "node:fs/promises";
import path from "node:path";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getObjectBytes } from "./s3";
import { isLocalAsset } from "./media";
import type { photos as photosTable, projects as projectsTable } from "../database/schema";

export type Photo = typeof photosTable.$inferSelect;
export type Project = typeof projectsTable.$inferSelect;

// Resolved against the server's working directory (packages/web) at runtime.
const PUBLIC_DIR = path.resolve("public");

export async function photoBytes(storageKey: string): Promise<Uint8Array | null> {
  if (isLocalAsset(storageKey)) {
    if (storageKey.startsWith("http")) {
      try {
        const res = await fetch(storageKey);
        if (!res.ok) return null;
        return new Uint8Array(await res.arrayBuffer());
      } catch {
        return null;
      }
    }
    try {
      const file = await readFile(path.join(PUBLIC_DIR, storageKey.replace(/^\//, "")));
      return new Uint8Array(file);
    } catch {
      return null;
    }
  }
  return getObjectBytes(storageKey);
}

/**
 * The key that holds a still frame for a record: the image itself for photos,
 * the extracted poster frame for clips. Used by PDF/XLSX/KMZ, which cannot embed video.
 */
export const stillKey = (photo: Photo) =>
  photo.kind === "video" ? (photo.posterKey ?? null) : photo.storageKey;

/** Filename for a record inside a ZIP/KMZ package. */
export const mediaName = (photo: Photo) =>
  `${photo.photoCode}.${photo.kind === "video" ? "mp4" : "jpg"}`;

const fmtTime = (d: Date) =>
  new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

const coords = (photo: Photo) =>
  photo.lat != null && photo.lng != null
    ? `${photo.lat.toFixed(6)}, ${photo.lng.toFixed(6)}`
    : "No GPS fix";

/**
 * The signature pad emits pure polyline path data — `M x y` followed by ` L x y`, no curves — so
 * every stroke is just a list of points. That lets the PDF draw real vector line segments rather
 * than rasterising, and lets the ZIP ship a standalone .svg per signature.
 */
function signatureStrokes(pathData: string): Array<Array<[number, number]>> {
  const strokes: Array<Array<[number, number]>> = [];
  let current: Array<[number, number]> = [];
  const re = /([ML])\s*(-?\d+(?:\.\d+)?)[\s,]+(-?\d+(?:\.\d+)?)/g;
  let m = re.exec(pathData);
  while (m) {
    const point: [number, number] = [Number(m[2]), Number(m[3])];
    if (m[1] === "M") {
      if (current.length > 1) strokes.push(current);
      current = [point];
    } else {
      current.push(point);
    }
    m = re.exec(pathData);
  }
  if (current.length > 1) strokes.push(current);
  return strokes;
}

/** `"0 0 W H"` viewBox to its width/height, falling back to the pad's default canvas. */
function signatureSize(box: string | null): { w: number; h: number } {
  const parts = (box ?? "").trim().split(/\s+/).map(Number);
  const ok = parts.length === 4 && parts.every((n) => Number.isFinite(n));
  const w = ok && parts[2]! > 0 ? parts[2]! : 320;
  const h = ok && parts[3]! > 0 ? parts[3]! : 150;
  return { w, h };
}

/** Standalone SVG file for the ZIP package — opens in any browser at full quality. */
function signatureSvg(pathData: string, box: string | null) {
  const { w, h } = signatureSize(box);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <path d="${xml(pathData)}" fill="none" stroke="#0B0E13" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

/** pdf-lib's standard fonts are WinAnsi-only. Anything they cannot encode throws and kills the
 *  whole export, so every dynamic string drawn into the PDF is folded down to encodable text. */
const WIN_EXTRA =
  "\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178";

const WA_SUBS: Record<string, string> = {
  "\u2190": "<-",
  "\u2192": "->",
  "\u2191": "^",
  "\u2193": "v",
  "\u2713": "x",
  "\u2714": "x",
  "\u202F": " ",
  "\u2009": " ",
};

function waChar(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  if (c >= 0x20 && c <= 0x7e) return true;
  if (c >= 0xa0 && c <= 0xff) return true;
  return WIN_EXTRA.includes(ch);
}

function wa(input: string): string {
  let out = "";
  for (const ch of input.normalize("NFC")) {
    if (waChar(ch)) {
      out += ch;
      continue;
    }
    const sub = WA_SUBS[ch];
    if (sub !== undefined) {
      out += sub;
      continue;
    }
    // Strip diacritics and keep the base letters when the accented form is not encodable.
    const folded = ch.normalize("NFD").replace(/\p{M}/gu, "");
    if (folded && [...folded].every(waChar)) out += folded;
  }
  return out;
}

const INK = rgb(0.043, 0.055, 0.075);
const AMBER = rgb(1, 0.69, 0.13);
const FOG = rgb(0.55, 0.6, 0.68);
const WHITE = rgb(1, 1, 1);
const GREEN = rgb(0.12, 0.76, 0.42);

interface BuildContext {
  title: string;
  orgName: string;
  project: Project | null;
  photos: Photo[];
  layout: string;
  logoBytes?: Uint8Array | null;
}

async function embed(pdf: PDFDocument, bytes: Uint8Array) {
  try {
    return await pdf.embedJpg(bytes as unknown as ArrayBuffer);
  } catch {
    try {
      return await pdf.embedPng(bytes as unknown as ArrayBuffer);
    } catch {
      return null;
    }
  }
}

/** Closeout-package PDF: cover sheet, then evidence pages with full metadata blocks. */
export async function buildPdf(ctx: BuildContext): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const mono = await pdf.embedFont(StandardFonts.Courier);

  const W = 595.28;
  const H = 841.89;

  // Cover
  const cover = pdf.addPage([W, H]);
  cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: INK });
  cover.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: AMBER });
  cover.drawText("GEOCLIKS", {
    x: 48,
    y: H - 92,
    size: 12,
    font: mono,
    color: AMBER,
  });
  cover.drawText("VERIFIED PHOTO DOCUMENTATION", {
    x: 48,
    y: H - 110,
    size: 9,
    font: mono,
    color: FOG,
  });

  const titleLines = wrap(ctx.title, 26);
  titleLines.forEach((line, i) => {
    cover.drawText(wa(line), { x: 48, y: H - 190 - i * 38, size: 30, font: bold, color: WHITE });
  });

  let y = H - 190 - titleLines.length * 38 - 40;
  const rows: Array<[string, string]> = [
    ["Organization", ctx.orgName],
    ["Project", ctx.project?.name ?? "All projects"],
    ["Client", ctx.project?.client ?? "—"],
    ["Site", ctx.project?.address ?? ctx.project?.locationLabel ?? "—"],
    ["Photos", String(ctx.photos.length)],
    ["Generated", fmtTime(new Date())],
    [
      "Date range",
      ctx.photos.length
        ? `${fmtTime(ctx.photos[ctx.photos.length - 1]!.capturedAt)} – ${fmtTime(ctx.photos[0]!.capturedAt)}`
        : "—",
    ],
  ];
  for (const [label, value] of rows) {
    cover.drawText(label.toUpperCase(), { x: 48, y, size: 8, font: mono, color: FOG });
    cover.drawText(wa(value).slice(0, 60), { x: 170, y: y - 1, size: 11, font, color: WHITE });
    y -= 26;
  }

  cover.drawText(
    "Every photo in this package carries a network-verified timestamp, GPS coordinates and a",
    { x: 48, y: 120, size: 9, font, color: FOG },
  );
  cover.drawText(
    "unique photo code linked to its original metadata. Codes can be verified at geocliks.com.",
    { x: 48, y: 106, size: 9, font, color: FOG },
  );

  // Evidence pages
  const perPage = ctx.layout === "grid" ? 2 : 1;
  for (let i = 0; i < ctx.photos.length; i += perPage) {
    const page = pdf.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
    page.drawRectangle({ x: 0, y: H - 46, width: W, height: 46, color: INK });
    page.drawText(wa(ctx.title).slice(0, 52), {
      x: 40,
      y: H - 29,
      size: 10,
      font: bold,
      color: WHITE,
    });
    page.drawText(`PAGE ${Math.floor(i / perPage) + 2}`, {
      x: W - 96,
      y: H - 29,
      size: 9,
      font: mono,
      color: AMBER,
    });

    const slice = ctx.photos.slice(i, i + perPage);
    const blockH = (H - 100) / perPage;

    for (let s = 0; s < slice.length; s++) {
      const photo = slice[s]!;
      const top = H - 70 - s * blockH;
      const still = stillKey(photo);
      const bytes = still ? await photoBytes(still) : null;
      const image = bytes ? await embed(pdf, bytes) : null;

      // Reserve room for the signature up front so it cannot spill into the next photo block.
      const strokes = photo.signaturePath ? signatureStrokes(photo.signaturePath) : [];
      const sigBox = signatureSize(photo.signatureBox);
      const sigW = 150;
      const sigH = strokes.length ? Math.max(20, Math.min(40, (sigW * sigBox.h) / sigBox.w)) : 0;

      const imgH = blockH - 132 - (sigH ? sigH + 12 : 0);
      const imgW = W - 80;
      if (image) {
        const scale = Math.min(imgW / image.width, imgH / image.height);
        const w = image.width * scale;
        const h = image.height * scale;
        page.drawImage(image, { x: 40 + (imgW - w) / 2, y: top - h, width: w, height: h });
      } else {
        page.drawRectangle({
          x: 40,
          y: top - imgH,
          width: imgW,
          height: imgH,
          color: rgb(0.93, 0.94, 0.96),
        });
        page.drawText("Image unavailable", {
          x: 60,
          y: top - imgH / 2,
          size: 10,
          font,
          color: FOG,
        });
      }

      let my = top - imgH - 18;
      page.drawText(wa(photo.photoCode), { x: 40, y: my, size: 11, font: mono, color: INK });
      page.drawText(photo.integrity === "verified" ? "VERIFIED" : "UNVERIFIED", {
        x: W - 130,
        y: my,
        size: 9,
        font: mono,
        color: photo.integrity === "verified" ? GREEN : rgb(0.9, 0.3, 0.2),
      });
      my -= 16;
      const meta: Array<[string, string]> = [
        ["TIME", `${fmtTime(photo.capturedAt)}  (${photo.timeSource} verified)`],
        ["GPS", `${coords(photo)}${photo.accuracyM ? ` ±${Math.round(photo.accuracyM)}m` : ""}`],
        ["ADDRESS", photo.address ?? "—"],
        ["TAG", `${photo.tag}${photo.assetType ? ` · ${photo.assetType}` : ""}`],
      ];
      if (photo.recipient) meta.push(["RECEIVED BY", photo.recipient]);
      if (photo.note) meta.push(["NOTE", photo.note]);
      for (const [label, value] of meta) {
        page.drawText(label, { x: 40, y: my, size: 7, font: mono, color: FOG });
        page.drawText(wa(value).slice(0, 78), { x: 100, y: my, size: 8.5, font, color: INK });
        my -= 13;
      }

      // Signature — native PDF line segments, so it stays sharp at any zoom level.
      if (strokes.length) {
        const sx = sigW / sigBox.w;
        const sy = sigH / sigBox.h;
        const baseY = my - 2;
        page.drawText("SIGNATURE", {
          x: 40,
          y: baseY - sigH + 3,
          size: 7,
          font: mono,
          color: FOG,
        });
        for (const stroke of strokes) {
          for (let p = 1; p < stroke.length; p++) {
            const from = stroke[p - 1]!;
            const to = stroke[p]!;
            page.drawLine({
              start: { x: 100 + from[0] * sx, y: baseY - from[1] * sy },
              end: { x: 100 + to[0] * sx, y: baseY - to[1] * sy },
              thickness: 0.9,
              color: INK,
            });
          }
        }
      }
    }
  }

  return pdf.save();
}

/** Excel log — one row per photo, ready for submission or import. */
export async function buildXlsx(ctx: BuildContext): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "GeoCliks";
  const ws = wb.addWorksheet("Photo log", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  ws.columns = [
    { header: "Photo code", key: "code", width: 20 },
    { header: "Captured (device)", key: "captured", width: 22 },
    { header: "Verified (network)", key: "verified", width: 22 },
    { header: "Clock skew (s)", key: "skew", width: 14 },
    { header: "Latitude", key: "lat", width: 13 },
    { header: "Longitude", key: "lng", width: 13 },
    { header: "Accuracy (m)", key: "acc", width: 13 },
    { header: "Address", key: "address", width: 40 },
    { header: "Tag", key: "tag", width: 12 },
    { header: "Asset", key: "asset", width: 14 },
    { header: "Note", key: "note", width: 40 },
    { header: "Received by", key: "recipient", width: 24 },
    { header: "Signature", key: "signature", width: 12 },
    { header: "Integrity", key: "integrity", width: 12 },
    { header: "Content hash (SHA-256)", key: "hash", width: 42 },
  ];
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B0E13" } };

  for (const photo of ctx.photos) {
    ws.addRow({
      code: photo.photoCode,
      captured: fmtTime(photo.capturedAt),
      verified: fmtTime(photo.verifiedAt),
      skew: Math.round(photo.clockSkewMs / 1000),
      lat: photo.lat ?? "",
      lng: photo.lng ?? "",
      acc: photo.accuracyM ?? "",
      address: photo.address ?? "",
      tag: photo.tag,
      asset: photo.assetType ?? "",
      note: photo.note ?? "",
      recipient: photo.recipient ?? "",
      signature: photo.signaturePath ? "Signed" : "",
      integrity: photo.integrity,
      hash: photo.contentHash ?? "",
    });
  }

  const summary = wb.addWorksheet("Summary");
  summary.columns = [
    { header: "Field", key: "f", width: 24 },
    { header: "Value", key: "v", width: 48 },
  ];
  summary.getRow(1).font = { bold: true };
  summary.addRows([
    { f: "Report", v: ctx.title },
    { f: "Organization", v: ctx.orgName },
    { f: "Project", v: ctx.project?.name ?? "All projects" },
    { f: "Client", v: ctx.project?.client ?? "" },
    { f: "Photos", v: ctx.photos.length },
    { f: "Generated", v: fmtTime(new Date()) },
    {
      f: "Verified photos",
      v: ctx.photos.filter((p) => p.integrity === "verified").length,
    },
  ]);

  const buffer = await wb.xlsx.writeBuffer();
  return new Uint8Array(buffer as ArrayBuffer);
}

/** ZIP of the original images + a CSV manifest. */
export async function buildZip(ctx: BuildContext): Promise<Uint8Array> {
  const zip = new JSZip();
  const folder = zip.folder("photos")!;
  const manifest = [
    "photo_code,file,captured_at,verified_at,latitude,longitude,address,tag,note,integrity,content_hash,recipient,signature_file",
  ];

  for (const photo of ctx.photos) {
    const bytes = await photoBytes(photo.storageKey);
    const name = mediaName(photo);
    if (bytes) folder.file(name, bytes);
    if (photo.signaturePath) {
      zip.file(
        `signatures/${photo.photoCode}.svg`,
        signatureSvg(photo.signaturePath, photo.signatureBox),
      );
    }
    manifest.push(
      [
        photo.photoCode,
        name,
        photo.capturedAt.toISOString(),
        photo.verifiedAt.toISOString(),
        photo.lat ?? "",
        photo.lng ?? "",
        csv(photo.address),
        photo.tag,
        csv(photo.note),
        photo.integrity,
        photo.contentHash ?? "",
        csv(photo.recipient),
        photo.signaturePath ? `signatures/${photo.photoCode}.svg` : "",
      ].join(","),
    );
  }

  zip.file("manifest.csv", manifest.join("\n"));
  zip.file("README.txt", readme(ctx));
  return zip.generateAsync({ type: "uint8array" });
}

/** KMZ — opens in Google Earth with a placemark and thumbnail per photo. */
export async function buildKmz(ctx: BuildContext): Promise<Uint8Array> {
  const zip = new JSZip();
  const files = zip.folder("files")!;
  const placemarks: string[] = [];

  for (const photo of ctx.photos) {
    if (photo.lat == null || photo.lng == null) continue;
    const still = stillKey(photo);
    const bytes = still ? await photoBytes(still) : null;
    const name = `${photo.photoCode}.jpg`;
    if (bytes) files.file(name, bytes);
    placemarks.push(`    <Placemark>
      <name>${xml(photo.photoCode)}</name>
      <description><![CDATA[
        <img src="files/${name}" width="480" /><br/>
        <b>Captured</b> ${fmtTime(photo.capturedAt)}<br/>
        <b>Verified</b> ${fmtTime(photo.verifiedAt)} (${photo.timeSource})<br/>
        <b>GPS</b> ${coords(photo)}<br/>
        <b>Address</b> ${xml(photo.address ?? "—")}<br/>
        <b>Tag</b> ${xml(photo.tag)}${photo.assetType ? ` · ${xml(photo.assetType)}` : ""}<br/>
        ${photo.note ? `<b>Note</b> ${xml(photo.note)}<br/>` : ""}
        ${photo.recipient ? `<b>Received by</b> ${xml(photo.recipient)}<br/>` : ""}
        <b>Integrity</b> ${xml(photo.integrity)}
      ]]></description>
      <styleUrl>#tm</styleUrl>
      <Point><coordinates>${photo.lng},${photo.lat},${photo.altitudeM ?? 0}</coordinates></Point>
    </Placemark>`);
  }

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${xml(ctx.title)}</name>
    <description>${xml(ctx.orgName)} · ${ctx.photos.length} verified photos · generated by GeoCliks</description>
    <Style id="tm">
      <IconStyle>
        <color>ff21b0ff</color>
        <scale>1.1</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/shapes/camera.png</href></Icon>
      </IconStyle>
    </Style>
${placemarks.join("\n")}
  </Document>
</kml>`;

  zip.file("doc.kml", kml);
  return zip.generateAsync({ type: "uint8array" });
}

function readme(ctx: BuildContext) {
  return [
    `${ctx.title}`,
    `${ctx.orgName}`,
    `Project: ${ctx.project?.name ?? "All projects"}`,
    `Photos: ${ctx.photos.length}`,
    `Generated: ${fmtTime(new Date())}`,
    "",
    "Each file is named by its GeoCliks photo code. manifest.csv links every file to its",
    "original metadata: device capture time, network-verified time, GPS coordinates, street",
    "address, tag, note and the SHA-256 hash of the image bytes. Pickup and delivery records",
    "also carry the recipient name, and their signature is written to signatures/<photo code>.svg.",
  ].join("\n");
}

function csv(value: string | null) {
  if (!value) return "";
  return `"${value.replace(/"/g, '""')}"`;
}

function xml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > max) {
      if (line) lines.push(line.trim());
      line = word;
    } else {
      line += ` ${word}`;
    }
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 3);
}
