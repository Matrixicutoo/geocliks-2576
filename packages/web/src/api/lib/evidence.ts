/**
 * Downloadable evidence for **one** capture.
 *
 * A raw download hands over the stored bytes and nothing else: the timestamp, GPS fix, address,
 * signature and photo code live in the database, so the file on a customer's desktop proves
 * nothing on its own. These two builders put that context inside the file itself.
 *
 *  - `buildEvidencePdf` — one A4 page: the image, a metadata block, a static map of the fix, the
 *    recipient's signature drawn as native PDF lines, and the code + content hash in monospace.
 *  - `buildStampedImage` — the JPEG with the stamp burned into the pixels and a small map inset in
 *    the corner. Survives being forwarded, screenshotted or pasted into a Word document, which a
 *    PDF's metadata block does not.
 *
 * Both are best-effort about the map: no Maps key, no GPS fix or a Google outage degrades to a
 * placeholder (PDF) or to no inset at all (image), never to a failed download.
 *
 * Pixel work goes through jimp rather than sharp on purpose: production runs a single bundled
 * server file, and sharp's native binding does not survive that bundle — it throws while
 * initialising its own format table and takes the boot down with it. jimp is pure JS, so the
 * bundle is just code. The trade is that jimp has no text rendering worth using, which is why the
 * stamp is drawn by ./stamp-font instead of by rasterising SVG.
 */

import { Jimp } from "jimp";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { photos as photosTable, projects as projectsTable } from "../database/schema";
import { photoBytes, stillKey } from "./exports";
import { fetchStaticMap, staticMapUrl } from "./static-map";
import { drawText, fillRect, fitChars, strokeRect, type Surface } from "./stamp-font";

type Photo = typeof photosTable.$inferSelect;
type Project = typeof projectsTable.$inferSelect;

export type EvidenceContext = {
  photo: Photo;
  project: Project | null;
  orgName: string;
  /** Public verify URL printed on the page so a reader can check the code themselves. */
  verifyUrl: string;
};

const INK = rgb(0.05, 0.06, 0.08);
const AMBER = rgb(0.88, 0.54, 0);
const WHITE = rgb(1, 1, 1);
const FOG = rgb(0.42, 0.46, 0.52);
const GREEN = rgb(0.16, 0.66, 0.42);
const PAPER = rgb(0.96, 0.97, 0.98);

const fmtTime = (d: Date | number) =>
  new Date(d).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

const coordLabel = (photo: Photo) =>
  photo.lat != null && photo.lng != null
    ? `${photo.lat.toFixed(6)}, ${photo.lng.toFixed(6)}`
    : "No GPS fix";

/** pdf-lib's standard fonts are WinAnsi-only; anything outside it throws while drawing. */
const wa = (s: string) => s.replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");

function wrap(text: string, max: number): string[] {
  const words = wa(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (!line) line = word;
    else if (line.length + 1 + word.length <= max) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** `M x y L x y ...` polyline data from the signature pad → point arrays. */
function signatureStrokes(pathData: string): Array<Array<[number, number]>> {
  const out: Array<Array<[number, number]>> = [];
  let current: Array<[number, number]> = [];
  for (const token of pathData.trim().split(/(?=[ML])/)) {
    const cmd = token[0];
    const nums = token
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => Number.isFinite(n));
    if (nums.length < 2) continue;
    if (cmd === "M") {
      if (current.length > 1) out.push(current);
      current = [[nums[0]!, nums[1]!]];
    } else {
      current.push([nums[0]!, nums[1]!]);
    }
  }
  if (current.length > 1) out.push(current);
  return out;
}

function signatureSize(box: string | null): { w: number; h: number } {
  const parts = (box ?? "").trim().split(/\s+/).map(Number);
  if (parts.length === 4 && parts.every((n) => Number.isFinite(n)) && parts[2]! > 0) {
    return { w: parts[2]!, h: parts[3]! };
  }
  return { w: 600, h: 200 };
}

/** One-pin map for a capture, as PNG bytes. Null whenever a map cannot be produced. */
export async function mapBytes(
  photo: Photo,
  size: { width: number; height: number; scale: 1 | 2 },
): Promise<Uint8Array | null> {
  if (photo.lat == null || photo.lng == null) return null;
  const url = staticMapUrl([{ lat: photo.lat, lng: photo.lng }], { ...size, showRoute: false });
  if (!url) return null;
  const got = await fetchStaticMap(
    `evidence:${photo.photoCode}:${size.width}x${size.height}@${size.scale}`,
    url,
  );
  return got ? new Uint8Array(got.bytes) : null;
}

/** JPEG and PNG both embed; sniffing the magic bytes avoids trusting the stored content type. */
async function embed(pdf: PDFDocument, bytes: Uint8Array) {
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
  try {
    return isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
  } catch {
    try {
      // A mislabelled image still goes through once it is decoded and re-encoded as baseline JPEG.
      const image = await Jimp.fromBuffer(Buffer.from(bytes));
      const re = await image.getBuffer("image/jpeg", { quality: 88 });
      return await pdf.embedJpg(new Uint8Array(re));
    } catch {
      return null;
    }
  }
}

/** Single-photo evidence sheet: image + time + GPS + map + signature + code and hash. */
export async function buildEvidencePdf(ctx: EvidenceContext): Promise<Uint8Array> {
  const { photo, project, orgName, verifyUrl } = ctx;
  const pdf = await PDFDocument.create();
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const mono = await pdf.embedFont(StandardFonts.Courier);

  const W = 595.28;
  const H = 841.89;
  const page = pdf.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });

  // Header band
  page.drawRectangle({ x: 0, y: H - 74, width: W, height: 74, color: INK });
  page.drawRectangle({ x: 0, y: H - 6, width: W, height: 6, color: AMBER });
  page.drawText("GEOCLIKS", { x: 40, y: H - 34, size: 11, font: mono, color: AMBER });
  page.drawText("VERIFIED CAPTURE CERTIFICATE", {
    x: 40,
    y: H - 52,
    size: 8.5,
    font: mono,
    color: FOG,
  });
  page.drawText(wa(photo.photoCode), { x: W - 190, y: H - 40, size: 15, font: bold, color: WHITE });
  page.drawText(photo.integrity === "verified" ? "VERIFIED" : photo.integrity.toUpperCase(), {
    x: W - 190,
    y: H - 55,
    size: 8,
    font: mono,
    color: photo.integrity === "verified" ? GREEN : rgb(0.9, 0.3, 0.2),
  });

  // Image
  const still = stillKey(photo);
  const bytes = still ? await photoBytes(still) : null;
  const image = bytes ? await embed(pdf, bytes) : null;
  const imgTop = H - 96;
  const imgW = W - 80;
  const imgH = 352;
  if (image) {
    const scale = Math.min(imgW / image.width, imgH / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    page.drawImage(image, { x: 40 + (imgW - w) / 2, y: imgTop - h, width: w, height: h });
  } else {
    page.drawRectangle({ x: 40, y: imgTop - imgH, width: imgW, height: imgH, color: PAPER });
    page.drawText("Image unavailable", { x: 60, y: imgTop - imgH / 2, size: 10, font, color: FOG });
  }

  // Metadata column (left) + map (right)
  const blockTop = imgTop - imgH - 26;
  const mapW = 200;
  const mapH = 150;
  const map = await mapBytes(photo, { width: mapW, height: mapH, scale: 2 });
  const mapImage = map ? await embed(pdf, map) : null;
  if (mapImage) {
    page.drawImage(mapImage, { x: W - 40 - mapW, y: blockTop - mapH, width: mapW, height: mapH });
    page.drawRectangle({
      x: W - 40 - mapW,
      y: blockTop - mapH,
      width: mapW,
      height: mapH,
      borderColor: rgb(0.85, 0.87, 0.9),
      borderWidth: 1,
    });
  } else {
    page.drawRectangle({ x: W - 40 - mapW, y: blockTop - mapH, width: mapW, height: mapH, color: PAPER });
    page.drawText(photo.lat == null ? "NO GPS FIX" : "MAP UNAVAILABLE", {
      x: W - 40 - mapW + 16,
      y: blockTop - mapH / 2,
      size: 8,
      font: mono,
      color: FOG,
    });
  }

  let y = blockTop - 4;
  const rows: Array<[string, string]> = [
    ["CAPTURED", `${fmtTime(photo.capturedAt)}  (${photo.timeSource})`],
    ["VERIFIED", fmtTime(photo.verifiedAt)],
    ["GPS", `${coordLabel(photo)}${photo.accuracyM ? ` +/-${Math.round(photo.accuracyM)}m` : ""}`],
    ["ADDRESS", photo.address ?? "Not recorded"],
    ["ORG", orgName],
    ["PROJECT", project?.name ?? "Unassigned"],
    ["TAG", `${photo.tag}${photo.assetType ? ` · ${photo.assetType}` : ""}`],
    ["DEVICE", photo.deviceModel ?? "Not recorded"],
  ];
  if (photo.recipient) rows.push(["RECEIVED BY", photo.recipient]);
  for (const [label, value] of rows) {
    page.drawText(label, { x: 40, y, size: 7, font: mono, color: FOG });
    page.drawText(wa(value).slice(0, 52), { x: 108, y, size: 8.5, font, color: INK });
    y -= 14;
  }

  if (photo.note) {
    y -= 4;
    page.drawText("NOTE", { x: 40, y, size: 7, font: mono, color: FOG });
    const lines = wrap(photo.note, 48).slice(0, 3);
    lines.forEach((line, i) => {
      page.drawText(line, { x: 108, y: y - i * 12, size: 8.5, font, color: INK });
    });
    y -= lines.length * 12 + 4;
  }

  // Signature — native line segments, sharp at any zoom.
  const strokes = photo.signaturePath ? signatureStrokes(photo.signaturePath) : [];
  if (strokes.length) {
    const box = signatureSize(photo.signatureBox);
    const sigW = 170;
    const sigH = Math.max(24, Math.min(52, (sigW * box.h) / box.w));
    // Strokes are drawn downward from `baseY`, so it is the top of the signature: keep it below
    // the last metadata row *and* below the map, or a long note ends up scribbled over.
    const baseY = Math.min(y - 10, blockTop - mapH - 16);
    page.drawText("SIGNATURE", { x: 40, y: baseY - sigH, size: 7, font: mono, color: FOG });
    const sx = sigW / box.w;
    const sy = sigH / box.h;
    for (const stroke of strokes) {
      for (let p = 1; p < stroke.length; p++) {
        const from = stroke[p - 1]!;
        const to = stroke[p]!;
        page.drawLine({
          start: { x: 108 + from[0] * sx, y: baseY - from[1] * sy },
          end: { x: 108 + to[0] * sx, y: baseY - to[1] * sy },
          thickness: 0.9,
          color: INK,
        });
      }
    }
    page.drawLine({
      start: { x: 108, y: baseY - sigH - 4 },
      end: { x: 108 + sigW, y: baseY - sigH - 4 },
      thickness: 0.5,
      color: rgb(0.8, 0.82, 0.85),
    });
  }

  // Seal footer — hash and signature, the part that makes the sheet checkable.
  const footH = 96;
  page.drawRectangle({ x: 0, y: 0, width: W, height: footH, color: PAPER });
  page.drawRectangle({ x: 0, y: footH - 2, width: W, height: 2, color: AMBER });
  page.drawText("CRYPTOGRAPHIC SEAL", { x: 40, y: footH - 22, size: 7, font: mono, color: FOG });
  const seal: Array<[string, string]> = [
    ["SHA-256", photo.contentHash ?? "not recorded"],
    ["HMAC", photo.signature ?? "not recorded"],
  ];
  let sy2 = footH - 40;
  for (const [label, value] of seal) {
    page.drawText(label, { x: 40, y: sy2, size: 7, font: mono, color: FOG });
    // Hashes are 64 hex chars — two lines at this size, so it stays readable and copyable.
    const chunks = wa(value).match(/.{1,44}/g) ?? [];
    chunks.slice(0, 2).forEach((chunk, i) => {
      page.drawText(chunk, { x: 100, y: sy2 - i * 9, size: 6.5, font: mono, color: INK });
    });
    sy2 -= Math.max(1, Math.min(2, chunks.length)) * 9 + 6;
  }
  page.drawText(wa(`Verify this code at ${verifyUrl}`), {
    x: 40,
    y: 12,
    size: 7.5,
    font,
    color: FOG,
  });
  page.drawText(`Generated ${fmtTime(new Date())}`, {
    x: W - 190,
    y: 12,
    size: 7.5,
    font,
    color: FOG,
  });

  return pdf.save();
}

const STAMP_WHITE = { r: 255, g: 255, b: 255 };
const STAMP_AMBER = { r: 224, g: 138, b: 0 };
const STAMP_BLACK = { r: 0, g: 0, b: 0 };

/** Cap-line top for a run whose SVG baseline sat at `baseline`. */
const capTop = (baseline: number, size: number) => baseline - 0.72 * size;

/**
 * Burn the stamp bar into the bottom of a capture, sized to the photo so it reads the same on a
 * 12MP capture and a 720p one. Mirrors the on-screen overlay in packages/mobile/components/stamp.tsx,
 * and keeps the layout the SVG version used so old and new downloads look alike.
 *
 * `mapW` is the width of the map inset already placed bottom-right, so the org line stops short
 * of it instead of running underneath.
 */
function drawStamp(
  surface: Surface,
  photo: Photo,
  orgName: string,
  width: number,
  height: number,
  mapW: number,
) {
  const s = Math.max(1, width / 1200);
  const pad = Math.round(18 * s);
  const line1 = fmtTime(photo.capturedAt);
  const line2 = `${coordLabel(photo)}  ${photo.accuracyM ? `+/-${Math.round(photo.accuracyM)}m` : ""}`.trim();
  const line3 = photo.address ?? "";
  const line4 = `${photo.photoCode}  ·  ${orgName}`;
  const f1 = Math.round(30 * s);
  const f2 = Math.round(22 * s);
  const barH = Math.round((line3 ? 150 : 124) * s);
  const barY = height - barH;
  const textX = pad + Math.round(14 * s);
  const right = mapW ? mapW + Math.round(24 * s) : 0;

  fillRect(surface, 0, barY, width, barH, STAMP_BLACK, 0.62);
  fillRect(surface, 0, barY, Math.round(6 * s), barH, STAMP_AMBER, 1);

  // Every line is clipped to the space left of the inset, so a long address or a small capture
  // truncates instead of running off the frame.
  const clip = (text: string, size: number) => text.slice(0, fitChars(width - right - textX, size));

  drawText(surface, clip(line1, f1), {
    x: textX,
    y: capTop(barY + f1 + Math.round(16 * s), f1),
    size: f1,
    color: STAMP_WHITE,
    weight: 0.12,
  });
  drawText(surface, clip(line2, f2), {
    x: textX,
    y: capTop(barY + f1 + f2 + Math.round(26 * s), f2),
    size: f2,
    color: STAMP_WHITE,
    alpha: 0.92,
  });
  if (line3) {
    drawText(surface, clip(line3, f2), {
      x: textX,
      y: capTop(barY + f1 + f2 * 2 + Math.round(34 * s), f2),
      size: f2,
      color: STAMP_WHITE,
      alpha: 0.82,
    });
  }
  drawText(surface, clip(line4, f2), {
    x: width - right - pad,
    y: capTop(barY + barH - Math.round(16 * s), f2),
    size: f2,
    color: STAMP_WHITE,
    alpha: 0.8,
    align: "end",
  });
}

/**
 * The capture with its stamp burned into the pixels and a map inset in the bottom-right corner.
 * Falls back to the stamp alone when there is no map to draw.
 */
export async function buildStampedImage(ctx: EvidenceContext): Promise<Uint8Array | null> {
  const { photo, orgName } = ctx;
  const still = stillKey(photo);
  const source = still ? await photoBytes(still) : null;
  if (!source) return null;

  // fromBuffer applies the EXIF orientation, so a phone capture held sideways stamps the right
  // way up rather than with the bar down one edge.
  let image: Awaited<ReturnType<typeof Jimp.fromBuffer>>;
  try {
    image = await Jimp.fromBuffer(Buffer.from(source));
  } catch {
    return null;
  }

  // Cap the long edge: a 12MP original makes a 6MB download nobody needs, and the stamp text
  // scales with the width anyway.
  if (image.bitmap.width > 2400 || image.bitmap.height > 2400) {
    image.scaleToFit({ w: 2400, h: 2400 });
  }
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Map inset first so the stamp bar draws over its bottom edge, not under it.
  const insetW = Math.round(Math.min(320, Math.max(150, width * 0.24)));
  const insetH = Math.round(insetW * 0.72);
  // On a small capture the inset would cover the stamp text, so it is dropped instead.
  const map =
    insetW <= width * 0.3 && insetH <= height * 0.3
      ? await mapBytes(photo, { width: insetW, height: insetH, scale: 2 })
      : null;
  let insetPlaced = 0;
  if (map) {
    try {
      const inset = await Jimp.fromBuffer(Buffer.from(map));
      inset.cover({ w: insetW, h: insetH });
      strokeRect(inset.bitmap as Surface, 0, 0, insetW, insetH, STAMP_AMBER, 3);
      const margin = Math.round(width * 0.015);
      image.composite(
        inset,
        Math.max(0, width - insetW - margin),
        Math.max(0, height - insetH - margin - Math.round(height * 0.14)),
      );
      insetPlaced = insetW;
    } catch {
      insetPlaced = 0;
    }
  }

  drawStamp(image.bitmap as Surface, photo, orgName, width, height, insetPlaced);

  const out = await image.getBuffer("image/jpeg", { quality: 90 });
  return new Uint8Array(out);
}
