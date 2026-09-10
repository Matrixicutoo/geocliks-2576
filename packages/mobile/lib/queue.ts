import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { client } from "./api";

const KEY = "geocliks.queue.v1";

/** Why a stop could not be delivered — mirrors the server enum in routes.ts. */
export type FailedReason =
  | "nobody_home"
  | "refused"
  | "wrong_address"
  | "closed"
  | "inaccessible"
  | "other";

export type QueuedPhoto = {
  id: string;
  uri: string;
  capturedAt: number;
  /**
   * The device clock offset measured against the server the last time this phone had
   * signal, captured at shutter time and carried through the queue. It is what lets a
   * photo uploaded hours later still prove its capture time was honest. Older queued
   * items predate these keys, so they are optional.
   */
  clockOffsetMs?: number | null;
  clockSyncedAt?: number | null;
  projectId: string | null;
  projectName: string | null;
  tag:
    | "general"
    | "before"
    | "after"
    | "issue"
    | "arrival"
    | "departure"
    | "pickup"
    | "delivery";
  note: string | null;
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
  altitudeM: number | null;
  heading: number | null;
  address: string | null;
  width: number | null;
  height: number | null;
  templateId: string | null;
  recipient?: string | null;
  signaturePath?: string | null;
  signatureBox?: string | null;
  kind?: "photo" | "video";
  durationMs?: number | null;
  error?: string | null;
  // Delivery-route context. When a capture closes out a route stop, the stop is closed
  // by the SAME code path that uploads the photo — so a drop made in a dead zone is
  // recorded the moment the queue drains, with the photo it was gated on.
  routeStopId?: string | null;
  routeId?: string | null;
  routeOutcome?: "delivered" | "failed" | null;
  routeFailedReason?: FailedReason | null;
  routeFailedNote?: string | null;
  /** Set once the photo is sealed on the server, so a retry never re-uploads the bytes. */
  photoId?: string | null;
  /** The photo is already up; only closing the route stop is still owed. */
  stopOnly?: boolean;
};

export async function readQueue(): Promise<QueuedPhoto[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedPhoto[]) : [];
  } catch {
    return [];
  }
}

/**
 * Anything showing a queue count has to hear about changes it did not make itself.
 *
 * The capture screen reads the count when it mounts, but the queue can also drain from
 * somewhere else entirely — signing in drains it from the root layout, so the badge was
 * left claiming "2 queued" over an empty queue. Every mutation goes through writeQueue,
 * so notifying here covers enqueue, dequeue and markError with no caller changes.
 */
const listeners = new Set<(items: QueuedPhoto[]) => void>();

export function subscribeQueue(fn: (items: QueuedPhoto[]) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

async function writeQueue(items: QueuedPhoto[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
  for (const fn of listeners) fn(items);
}

export async function enqueue(item: QueuedPhoto) {
  const items = await readQueue();
  items.unshift(item);
  await writeQueue(items);
  return items;
}

export async function dequeue(id: string) {
  const items = (await readQueue()).filter((item) => item.id !== id);
  await writeQueue(items);
  return items;
}

export async function markError(id: string, error: string) {
  const items = (await readQueue()).map((item) =>
    item.id === id ? { ...item, error } : item,
  );
  await writeQueue(items);
  return items;
}

/** Close the route stop this capture belongs to, with the photo that proves it. */
async function closeStop(item: QueuedPhoto, photoId: string) {
  if (!item.routeStopId) return;
  await client.routes.completeStop({
    stopId: item.routeStopId,
    photoId,
    outcome: item.routeOutcome ?? "delivered",
    failedReason: item.routeFailedReason ?? undefined,
    failedNote: item.routeFailedNote ?? undefined,
    recipientName: item.recipient ?? undefined,
    completedAt: item.capturedAt,
  });
}

/** Upload one queued capture: presign → PUT bytes → register the verified record. */
export async function uploadOne(item: QueuedPhoto) {
  // A stop-only retry. The photo already uploaded and was sealed on a previous attempt;
  // only closing the stop failed — a dead zone at exactly the wrong second. Re-send the
  // close alone, because re-uploading would file the same drop twice. completeStop is
  // idempotent on the same photo, so a duplicate retry is harmless.
  if (item.stopOnly && item.photoId) {
    await closeStop(item, item.photoId);
    await dequeue(item.id);
    return null;
  }

  const isVideo = item.kind === "video";
  const contentType = isVideo ? "video/mp4" : "image/jpeg";
  const filename = `${item.id}.${isVideo ? "mp4" : "jpg"}`;

  const presigned = isVideo
    ? await client.upload.presignVideo({ filename, contentType })
    : (await client.upload.presignBatch({ files: [{ filename, contentType }] }))[0];
  if (!presigned) throw new Error("Could not presign upload");

  const blob = await (await fetch(item.uri)).blob();
  const put = await fetch(presigned.url, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": contentType },
  });
  if (!put.ok) throw new Error(`Storage rejected the upload (${put.status})`);

  const photo = await client.photos.create({
    storageKey: presigned.key,
    projectId: item.projectId,
    capturedAt: item.capturedAt,
    // Measured at capture, not now: judging the clock by upload time is what used to
    // stamp dead-zone deliveries "unverified".
    clockOffsetMs: item.clockOffsetMs ?? null,
    clockSyncedAt: item.clockSyncedAt ?? null,
    lat: item.lat,
    lng: item.lng,
    accuracyM: item.accuracyM,
    altitudeM: item.altitudeM,
    heading: item.heading,
    address: item.address,
    note: item.note,
    tag: item.tag,
    width: item.width,
    height: item.height,
    bytes: blob.size,
    platform: Platform.OS,
    templateId: item.templateId,
    // Proof of delivery: who signed for it and the strokes they drew. Older queued
    // items predate these keys, so default them rather than sending undefined.
    recipient: item.recipient ?? null,
    signaturePath: item.signaturePath ?? null,
    signatureBox: item.signatureBox ?? null,
    // Without these the server registers a clip as a still: no stamp pass, no poster frame, and
    // every gallery renders an <img> pointing at an MP4 — a black tile.
    kind: item.kind ?? "photo",
    durationMs: item.durationMs ?? null,
  });

  // Close the route stop with the photo that was just sealed. This runs inside the
  // upload path on purpose: offline or online, the stop and its proof land together.
  if (item.routeStopId) {
    try {
      await closeStop(item, photo.id);
    } catch (err) {
      // The evidence is stored and sealed; only the stop status is behind. Keep the item
      // queued as a stop-only retry — dropping it would leave the stop open forever with
      // no way back, and requeueing it whole would upload the same photo twice.
      const message = err instanceof Error ? err.message : String(err);
      const items = await readQueue();
      await writeQueue(
        items.map((i) =>
          i.id === item.id ? { ...i, photoId: photo.id, stopOnly: true, error: message } : i,
        ),
      );
      throw err;
    }
  }

  await dequeue(item.id);
  return photo;
}

/** Drain the whole queue; returns how many uploaded and how many failed. */
export async function drainQueue() {
  const items = await readQueue();
  let uploaded = 0;
  let failed = 0;
  for (const item of items) {
    try {
      await uploadOne(item);
      uploaded += 1;
    } catch (err) {
      failed += 1;
      await markError(item.id, err instanceof Error ? err.message : String(err));
    }
  }
  return { uploaded, failed };
}
