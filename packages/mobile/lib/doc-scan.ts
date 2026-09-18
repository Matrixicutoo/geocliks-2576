import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { PDFDocument } from "pdf-lib";

/**
 * SCAN mode plumbing: pages in, one signed PDF out.
 *
 * Two capture paths on purpose. On a real build the OS document scanner does the work —
 * live edge tracking, auto-shutter, multi-page, its own crop UI — because nothing written
 * in JS over a preview frame competes with VisionKit or ML Kit. That module is native, so
 * it is absent in Expo Go and in the web preview; there the camera takes a plain frame and
 * the crew member straightens it by hand in the review sheet. Same session, same PDF, same
 * queue either way.
 */

export type ScanPage = {
  id: string;
  uri: string;
  width: number | null;
  height: number | null;
};

let nativeScanner: {
  scanDocument: (options: Record<string, unknown>) => Promise<{
    scannedImages?: string[];
    status?: string;
  }>;
} | null = null;
let nativeScannerProbed = false;

/**
 * Resolve the native scanner lazily. Its entry point calls TurboModuleRegistry.getEnforcing,
 * which throws the moment the module is evaluated when there is no native side to bind to —
 * a static import would take the whole capture screen down on web and in Expo Go. Requiring
 * it inside a try/catch turns "not in this build" into a fallback instead of a crash.
 */
export function nativeScanner$(): typeof nativeScanner {
  if (nativeScannerProbed) return nativeScanner;
  nativeScannerProbed = true;
  if (Platform.OS === "web") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("react-native-document-scanner-plugin");
    const scanner = (mod?.default ?? mod) as typeof nativeScanner;
    nativeScanner = typeof scanner?.scanDocument === "function" ? scanner : null;
  } catch {
    nativeScanner = null;
  }
  return nativeScanner;
}

export function hasNativeScanner(): boolean {
  return nativeScanner$() !== null;
}

/**
 * Run the OS scanner. Returns the captured page URIs, an empty array when the user backed
 * out, or null when this build has no native scanner and the caller should fall back.
 */
export async function scanWithNativeScanner(maxPages = 20): Promise<string[] | null> {
  const scanner = nativeScanner$();
  if (!scanner) return null;
  const result = await scanner.scanDocument({
    croppedImageQuality: 80,
    maxNumDocuments: maxPages,
    responseType: "imageFilePath",
  });
  if (result?.status === "cancel") return [];
  return (result?.scannedImages ?? []).filter(Boolean);
}

const rid = () => `pg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export function pageOf(uri: string, width?: number | null, height?: number | null): ScanPage {
  return { id: rid(), uri, width: width ?? null, height: height ?? null };
}

/** Rotate a page by a quarter turn and hand back the rewritten file. */
export async function rotatePage(page: ScanPage, degrees: number): Promise<ScanPage> {
  const image = await ImageManipulator.manipulate(page.uri).rotate(degrees).renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
  return { id: page.id, uri: saved.uri, width: saved.width ?? null, height: saved.height ?? null };
}

/**
 * Crop a page to a rectangle given in fractions of the image (0..1), which is what a crop
 * overlay laid over a scaled preview can actually measure.
 */
export async function cropPage(
  page: ScanPage,
  rect: { x: number; y: number; width: number; height: number },
): Promise<ScanPage> {
  const context = ImageManipulator.manipulate(page.uri);
  const rendered = await context.renderAsync();
  const w = rendered.width;
  const h = rendered.height;
  const originX = Math.max(0, Math.round(rect.x * w));
  const originY = Math.max(0, Math.round(rect.y * h));
  const width = Math.max(16, Math.min(w - originX, Math.round(rect.width * w)));
  const height = Math.max(16, Math.min(h - originY, Math.round(rect.height * h)));
  const cropped = await ImageManipulator.manipulate(rendered)
    .crop({ originX, originY, width, height })
    .renderAsync();
  const saved = await cropped.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
  return { id: page.id, uri: saved.uri, width: saved.width ?? null, height: saved.height ?? null };
}

/** Read any local or bundled image as raw base64, without the data-URI prefix. */
async function readBase64(uri: string): Promise<string> {
  if (uri.startsWith("data:")) return uri.slice(uri.indexOf(",") + 1);
  if (Platform.OS !== "web" && uri.startsWith("file:")) return await new File(uri).base64();
  const blob = await (await fetch(uri)).blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the scanned page"));
    reader.onload = () => {
      const out = String(reader.result ?? "");
      resolve(out.slice(out.indexOf(",") + 1));
    };
    reader.readAsDataURL(blob);
  });
}

/** `Doc Sep 18 174755.pdf` — readable, sortable, and unique to the second. */
export function scanFileName(at: Date = new Date()): string {
  const month = at.toLocaleString("en-US", { month: "short" });
  const two = (n: number) => String(n).padStart(2, "0");
  return `Doc ${month} ${two(at.getDate())} ${two(at.getHours())}${two(at.getMinutes())}${two(
    at.getSeconds(),
  )}.pdf`;
}

/** Longest edge of a PDF page, in points. Keeps a 12MP scan from becoming a 40MB page box. */
const MAX_PAGE_POINTS = 1400;

export type BuiltPdf = { uri: string; pageCount: number; bytes: number };

/**
 * Compose the session's pages into one PDF. Built on the device on purpose: the whole
 * capture pipeline has to survive a dead zone, so the artefact that gets queued has to
 * exist before there is any network to upload it over.
 */
export async function buildScanPdf(pages: ScanPage[], filename: string): Promise<BuiltPdf> {
  if (pages.length === 0) throw new Error("There are no scanned pages to save");
  const pdf = await PDFDocument.create();
  pdf.setProducer("GeoCliks");
  pdf.setCreator("GeoCliks");
  pdf.setCreationDate(new Date());

  for (const page of pages) {
    const base64 = await readBase64(page.uri);
    let embedded;
    try {
      embedded = await pdf.embedJpg(base64);
    } catch {
      // Web's canvas encoder and a few Android OEM scanners hand back PNG regardless of
      // the format that was asked for.
      embedded = await pdf.embedPng(base64);
    }
    const scale = Math.min(1, MAX_PAGE_POINTS / Math.max(embedded.width, embedded.height));
    const width = Math.max(1, Math.round(embedded.width * scale));
    const height = Math.max(1, Math.round(embedded.height * scale));
    const sheet = pdf.addPage([width, height]);
    sheet.drawImage(embedded, { x: 0, y: 0, width, height });
  }

  const base64 = await pdf.saveAsBase64();
  const bytes = Math.round((base64.length * 3) / 4);

  if (Platform.OS === "web") {
    const binary = globalThis.atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) buffer[i] = binary.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));
    return { uri: url, pageCount: pages.length, bytes };
  }

  const dir = new Directory(Paths.cache, "scans");
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const file = new File(dir, filename);
  if (file.exists) file.delete();
  file.create({ overwrite: true, intermediates: true });
  file.write(base64, { encoding: "base64" });
  return { uri: file.uri, pageCount: pages.length, bytes };
}
