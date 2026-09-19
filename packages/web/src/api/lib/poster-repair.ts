/**
 * Self-healing poster frames for clips that arrived without one.
 *
 * A video's poster is normally extracted at upload time, either out of the burned-in copy
 * or — when burn-in is unavailable — by `posterFrame`. Both of those go through `hasFfmpeg`,
 * so a single failed ffmpeg probe on the server left the row with `posterKey: null` and
 * nothing ever went back for it. That is not a cosmetic gap: every surface that draws a
 * thumbnail falls back to the raw `storageKey`, which means an `<img>` pointed at an .mp4 —
 * a blank tile in the live feed, the Teamspace grid, message attachments, notifications and
 * project covers, and a missing image in PDF exports. The detail sheet was the only place
 * that still looked right, because a `<video>` element renders its own first frame.
 *
 * So repair is centralised here instead of being retried at the upload site: any read path
 * that surfaces video rows can hand them over, and the poster is rebuilt in the background
 * and persisted. Never throws, never blocks the request it was called from.
 */
import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "./ids";
import { posterFrame } from "./video";

/** Rebuilding a poster costs an ffmpeg pass, so one page of clips never starts a stampede. */
const MAX_PER_SWEEP = 3;

/** Photo ids being repaired right now, so overlapping polls don't do the same work twice. */
const inFlight = new Set<string>();

type Repairable = {
  id: string;
  orgId: string;
  kind: string;
  posterKey: string | null;
  storageKey: string;
  durationMs: number | null;
};

/** Clips that are missing the thumbnail every gallery needs. */
function needsPoster(row: Repairable): boolean {
  return row.kind === "video" && !row.posterKey;
}

/**
 * Extract the poster for one clip and write it to its row.
 * Returns the new poster key, or null when ffmpeg or the stored object was unavailable —
 * in which case the row is left untouched and a later read tries again.
 */
async function repairOne(row: Repairable): Promise<string | null> {
  const shot = await posterFrame(row.storageKey);
  if (!shot.posterKey) return null;

  await db
    .update(schema.photos)
    .set({
      posterKey: shot.posterKey,
      // The device-reported length stands in until ffprobe can measure the real one.
      ...(row.durationMs == null && shot.durationMs != null ? { durationMs: shot.durationMs } : {}),
    })
    .where(eq(schema.photos.id, row.id));

  // The evidence trail says burn-in was skipped and no poster came out of it; this closes
  // that thread rather than silently contradicting it.
  await db.insert(schema.photoEvents).values({
    id: id("evt"),
    photoId: row.id,
    orgId: row.orgId,
    type: "processed",
    actor: "GeoCliks server",
    detail: "Poster frame recovered for this clip (thumbnail rebuilt from frame 1)",
    at: new Date(),
  });

  return shot.posterKey;
}

/**
 * Rebuild posters for any of these rows that lack one, awaiting the result.
 * Use where the caller can absorb an ffmpeg pass; prefer `repairPostersInBackground`
 * on a request path.
 */
export async function repairPosters(rows: Repairable[]): Promise<Map<string, string>> {
  const fixed = new Map<string, string>();
  const targets = rows.filter((row) => needsPoster(row) && !inFlight.has(row.id));

  for (const row of targets.slice(0, MAX_PER_SWEEP)) {
    inFlight.add(row.id);
    try {
      const posterKey = await repairOne(row);
      if (posterKey) fixed.set(row.id, posterKey);
    } catch {
      // Storage or ffmpeg had a bad moment; the next read picks this row up again.
    } finally {
      inFlight.delete(row.id);
    }
  }

  return fixed;
}

/**
 * Same sweep, detached. The caller's response goes out at its normal speed and the poster
 * appears in the feed's next refresh, which is already polling for changes.
 */
export function repairPostersInBackground(rows: Repairable[]): void {
  if (!rows.some(needsPoster)) return;
  void repairPosters(rows).catch(() => {});
}
