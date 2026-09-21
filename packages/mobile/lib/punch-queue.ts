import AsyncStorage from "@react-native-async-storage/async-storage";
import { client } from "./api";

const KEY = "geocliks.punches.v1";

/**
 * Clock punches waiting for signal.
 *
 * Separate from the photo queue in lib/queue.ts, and much smaller, because a punch has no file
 * behind it: there is nothing to presign, nothing to upload, nothing to poster. It is one small
 * JSON object, which is exactly why it can be held here and replayed later.
 *
 * It has to be held. A driver's only way to clock in is the CLOCK capture, and depots sit in
 * steel buildings where nothing has bars — a clock-in that silently failed there would cost him
 * the front of his shift. So the punch is written down locally the moment he taps, and sent when
 * the phone can. `at` carries the moment of the tap, and the server accepts a device time up to
 * a day old, so a replayed punch still lands on the minute it happened rather than the minute it
 * finally reached the server.
 */
export type QueuedPunch = {
  /** Local id, so a drain can remove exactly this one. */
  id: string;
  kind: "in" | "out";
  at: number;
  clockOffsetMs: number | null;
  clockSyncedAt: number | null;
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
  altitudeM: number | null;
  heading: number | null;
  address: string | null;
  routeId: string | null;
  deviceModel: string | null;
  platform: string | null;
  note: string | null;
};

export async function readPunches(): Promise<QueuedPunch[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedPunch[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writePunches(items: QueuedPunch[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function enqueuePunch(punch: QueuedPunch): Promise<QueuedPunch[]> {
  const items = [...(await readPunches()), punch];
  await writePunches(items);
  return items;
}

/**
 * Sends everything waiting, oldest first, and keeps whatever still cannot go.
 *
 * Failures stay queued rather than being retried in place — the next tap, or the next visit to
 * the time clock, drains again. Nothing here throws: a drain that blew up would take the
 * capture screen with it.
 */
export async function drainPunches(): Promise<{ sent: number; left: number }> {
  const items = await readPunches();
  if (items.length === 0) return { sent: 0, left: 0 };
  const stuck: QueuedPunch[] = [];
  let sent = 0;
  for (const item of [...items].sort((a, b) => a.at - b.at)) {
    try {
      await client.timeClock.stamp({
        kind: item.kind,
        at: item.at,
        clockOffsetMs: item.clockOffsetMs,
        clockSyncedAt: item.clockSyncedAt,
        lat: item.lat,
        lng: item.lng,
        accuracyM: item.accuracyM,
        altitudeM: item.altitudeM,
        heading: item.heading,
        address: item.address,
        routeId: item.routeId,
        deviceModel: item.deviceModel,
        platform: item.platform,
        note: item.note,
      });
      sent += 1;
    } catch {
      stuck.push(item);
    }
  }
  await writePunches(stuck);
  return { sent, left: stuck.length };
}
