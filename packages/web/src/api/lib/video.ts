/**
 * Verified video processing.
 *
 * A clip is uploaded to storage by the device, then this module tries to burn the
 * evidence stamp into the pixels with ffmpeg so the exported file itself carries the
 * proof — not just our player. If ffmpeg is not present in the runtime (or the pass
 * fails), we keep the stamp as signed metadata and every GeoCliks surface renders it
 * as a permanent playback overlay instead. `photos.stampBurned` records which of the
 * two a given clip got, so we never claim burn-in that did not happen.
 */
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { getObjectBytes, putObject } from "./s3";

export interface StampData {
  at: string;
  code: string;
  lat?: number | null;
  lng?: number | null;
  accuracyM?: number | null;
  address?: string | null;
  project?: string | null;
  company?: string | null;
}

/**
 * Minimal shape of a spawned process. The mobile package typechecks this file through
 * the shared router types without Node's full DOM/EventEmitter lib, so we narrow the
 * handle ourselves instead of relying on the ambient ChildProcess type.
 */
type Proc = {
  stdout?: { on(event: string, cb: (chunk: unknown) => void): void } | null;
  stderr?: { on(event: string, cb: (chunk: unknown) => void): void } | null;
  on(event: string, cb: (arg?: unknown) => void): void;
  kill(signal?: string): void;
};

function launch(cmd: string, args: string[], pipeStdout = false): Proc {
  return spawn(cmd, args, {
    stdio: ["ignore", pipeStdout ? "pipe" : "ignore", "pipe"],
  }) as unknown as Proc;
}

function run(cmd: string, args: string[], timeoutMs = 120_000): Promise<{ ok: boolean; err: string }> {
  return new Promise((resolve) => {
    const child = launch(cmd, args);
    let err = "";
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs);
    child.stderr?.on("data", (chunk) => {
      err += String(chunk).slice(0, 4000);
    });
    child.on("error", (e) => {
      clearTimeout(timer);
      resolve({ ok: false, err: e instanceof Error ? e.message : String(e) });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ ok: code === 0, err });
    });
  });
}

let ffmpegAvailable: boolean | null = null;

/** Cached probe — burn-in is only promised when this is true. */
export async function hasFfmpeg(): Promise<boolean> {
  if (ffmpegAvailable !== null) return ffmpegAvailable;
  const res = await run("ffmpeg", ["-version"], 10_000);
  ffmpegAvailable = res.ok;
  return ffmpegAvailable;
}

/** ffmpeg drawtext treats these as syntax. */
function esc(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "’")
    .replace(/%/g, "\\%")
    .replace(/,/g, "\\,")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

export function stampLines(stamp: StampData): string[] {
  const when = new Date(stamp.at);
  const line1 = `${when.toISOString().slice(0, 10)}  ${when.toISOString().slice(11, 19)} UTC`;
  const coords =
    stamp.lat != null && stamp.lng != null
      ? `${stamp.lat.toFixed(6)}, ${stamp.lng.toFixed(6)}${
          stamp.accuracyM != null ? `  +/-${Math.round(stamp.accuracyM)}m` : ""
        }`
      : "NO GPS FIX";
  const lines = [line1, coords];
  if (stamp.address) lines.push(stamp.address.slice(0, 64));
  if (stamp.project) lines.push(stamp.project.slice(0, 48));
  lines.push(stamp.code);
  return lines;
}

const FONT_CANDIDATES = [
  "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  "/usr/share/fonts/TTF/DejaVuSansMono.ttf",
];

async function fontFile(): Promise<string | null> {
  for (const path of FONT_CANDIDATES) {
    try {
      await readFile(path);
      return path;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

export interface BurnResult {
  /** true = the stamp is in the pixels of the stored file. */
  burned: boolean;
  /** New storage key when the burned file replaced the original. */
  storageKey: string;
  posterKey: string | null;
  durationMs: number | null;
  bytes: number | null;
  reason: "burned" | "no_ffmpeg" | "no_font" | "failed" | "missing_object";
}

/**
 * Burn the stamp into a stored clip and extract a poster frame.
 * Never throws — a failure falls back to overlay-at-playback.
 */
export async function burnStamp(storageKey: string, stamp: StampData): Promise<BurnResult> {
  const fallback = (reason: BurnResult["reason"]): BurnResult => ({
    burned: false,
    storageKey,
    posterKey: null,
    durationMs: null,
    bytes: null,
    reason,
  });

  if (!(await hasFfmpeg())) return fallback("no_ffmpeg");
  const font = await fontFile();
  if (!font) return fallback("no_font");

  const bytes = await getObjectBytes(storageKey);
  if (!bytes) return fallback("missing_object");

  const dir = await mkdtemp(join(tmpdir(), "geocliks-vid-"));
  const input = join(dir, "in.mp4");
  const output = join(dir, "out.mp4");
  const poster = join(dir, "poster.jpg");

  try {
    await writeFile(input, bytes);

    const lines = stampLines(stamp);
    // Stamp block sits bottom-left, sized off the frame height so it reads on any resolution.
    const size = "h/30";
    const pad = "h/40";
    const drawtext = lines
      .map((line, i) => {
        const fromBottom = lines.length - i;
        const y = `h-${pad}-(${size}*1.45*${fromBottom})`;
        const color = i === lines.length - 1 ? "0xFFB021" : "white";
        return [
          "drawtext=",
          `fontfile=${font}`,
          `:text='${esc(line)}'`,
          `:fontcolor=${color}`,
          `:fontsize=${size}`,
          `:x=${pad}`,
          `:y=${y}`,
          ":box=1:boxcolor=black@0.55:boxborderw=8",
        ].join("");
      })
      .join(",");

    const burn = await run("ffmpeg", [
      "-y",
      "-i",
      input,
      "-vf",
      drawtext,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "26",
      "-movflags",
      "+faststart",
      "-c:a",
      "copy",
      output,
    ]);
    if (!burn.ok) return fallback("failed");

    const burnedBytes = await readFile(output);
    await putObject(storageKey, burnedBytes, "video/mp4");

    // Poster frame from the burned copy so thumbnails show the stamp too.
    let posterKey: string | null = null;
    const shot = await run("ffmpeg", ["-y", "-i", output, "-frames:v", "1", "-q:v", "3", poster]);
    if (shot.ok) {
      posterKey = `${storageKey.replace(/\.[a-z0-9]+$/i, "")}-poster.jpg`;
      await putObject(posterKey, await readFile(poster), "image/jpeg");
    }

    return {
      burned: true,
      storageKey,
      posterKey,
      durationMs: await probeDurationMs(input),
      bytes: burnedBytes.byteLength,
      reason: "burned",
    };
  } catch {
    return fallback("failed");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * Poster frame + duration only, for clips whose stamp could not be burned in.
 * Without this a gallery has nothing to draw for a video and renders a black tile.
 * Never throws.
 */
export async function posterFrame(
  storageKey: string,
): Promise<{ posterKey: string | null; durationMs: number | null }> {
  const none = { posterKey: null, durationMs: null };
  if (!(await hasFfmpeg())) return none;

  const bytes = await getObjectBytes(storageKey);
  if (!bytes) return none;

  const dir = await mkdtemp(join(tmpdir(), "geocliks-poster-"));
  const input = join(dir, "in.mp4");
  const poster = join(dir, "poster.jpg");
  try {
    await writeFile(input, bytes);
    const durationMs = await probeDurationMs(input);
    const shot = await run("ffmpeg", ["-y", "-i", input, "-frames:v", "1", "-q:v", "3", poster]);
    if (!shot.ok) return { posterKey: null, durationMs };
    const posterKey = `${storageKey.replace(/\.[a-z0-9]+$/i, "")}-poster.jpg`;
    await putObject(posterKey, await readFile(poster), "image/jpeg");
    return { posterKey, durationMs };
  } catch {
    return none;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** ffprobe duration in ms, or null when unavailable. */
async function probeDurationMs(file: string): Promise<number | null> {
  return new Promise((resolve) => {
    const child = launch(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        file,
      ],
      true,
    );
    let out = "";
    child.stdout?.on("data", (c) => {
      out += String(c);
    });
    child.on("error", () => resolve(null));
    child.on("close", () => {
      const seconds = Number.parseFloat(out.trim());
      resolve(Number.isFinite(seconds) ? Math.round(seconds * 1000) : null);
    });
  });
}
