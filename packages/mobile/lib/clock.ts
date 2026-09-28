import AsyncStorage from "@react-native-async-storage/async-storage";
import { client } from "./api";
import { clearMonotonicBreak, monotonicNow, touchMonotonic, type MonotonicSource } from "./monotonic";

const KEY = "geocliks.clock.v1";

/**
 * Trusted device-clock offset.
 *
 * A capture's proof value depends on knowing whether the phone's clock was honest at
 * the moment the shutter fired. The server only sees the photo when it uploads, which
 * in the field can be hours later — a delivery driver in a dead zone drains the queue
 * when they get signal back. Judging the clock by the upload time therefore punishes
 * normal offline work: that is the bug this file exists to remove.
 *
 * Instead the phone measures `serverTime - deviceTime` whenever it has a connection and
 * stores it. Every capture carries the last measured offset, so the server can tell a
 * wrong clock apart from a late upload.
 */
export type ClockSync = {
  /** serverTime - deviceTime, in ms. Positive means the phone is running slow. */
  offsetMs: number;
  /** Device clock when the measurement was taken. */
  syncedAtDevice: number;
  /**
   * The hardware elapsed-time counter at that same moment — see lib/monotonic.ts. The
   * offset above proves what the clock read; this proves how much time has passed since,
   * which is what catches a clock wound forward after the sync. Absent on records written
   * by builds from before this shipped.
   */
  monotonicAtSync?: number;
  /** Which counter that reading came from; only like-for-like readings are comparable. */
  monotonicSource?: MonotonicSource;
  /** The JS process the reading was taken in, for the session-scoped fallback counter. */
  monotonicSessionId?: string;
};

/** Beyond this age the server stops trusting the offset, so there is no point sending it. */
export const CLOCK_SYNC_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Re-measure at most this often; a sync is cheap but not free. */
const RESYNC_AFTER_MS = 30 * 60 * 1000;

/** A round trip slower than this gives too loose a bound to be worth recording. */
const MAX_ACCEPTABLE_RTT_MS = 10 * 1000;

let cached: ClockSync | null = null;
let inFlight: Promise<ClockSync | null> | null = null;

export async function readClockSync(): Promise<ClockSync | null> {
  if (cached) return cached;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClockSync;
    if (typeof parsed?.offsetMs !== "number" || typeof parsed?.syncedAtDevice !== "number") {
      return null;
    }
    cached = parsed;
    return parsed;
  } catch {
    return null;
  }
}

async function write(sync: ClockSync) {
  cached = sync;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(sync));
  } catch {
    // A failed write only costs one extra sync next launch.
  }
}

/**
 * Measure the offset against the server, correcting for the round trip: the server's
 * answer describes a moment roughly halfway through the request, so it is compared
 * against the midpoint of the two device readings rather than either end.
 */
export async function syncClock(): Promise<ClockSync | null> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      const before = Date.now();
      const { now } = await client.clock.now();
      const after = Date.now();
      const rtt = after - before;
      if (rtt > MAX_ACCEPTABLE_RTT_MS) return await readClockSync();
      const deviceMidpoint = before + rtt / 2;
      // Anchor the elapsed-time counter to the same instant as the offset. A sync is also
      // the moment a past reboot stops mattering, so the break flag is cleared here.
      const reading = monotonicNow();
      await clearMonotonicBreak(reading);
      const sync: ClockSync = {
        offsetMs: Math.round(now - deviceMidpoint),
        syncedAtDevice: after,
        monotonicAtSync: Math.round(reading.ms),
        monotonicSource: reading.source,
        monotonicSessionId: reading.sessionId,
      };
      await write(sync);
      return sync;
    } catch {
      // Offline is the normal case in the field, not an error. The stored offset from
      // the last time there was signal stays valid for a day.
      return await readClockSync();
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/** Sync only when the stored offset is missing or getting stale. */
export async function ensureClockSync(): Promise<ClockSync | null> {
  const stored = await readClockSync();
  // Read the counter every time through, sync or not: this runs on launch, which is where
  // a reboot taken in a dead zone gets noticed before any capture can be stamped.
  void touchMonotonic();
  if (stored && Date.now() - stored.syncedAtDevice < RESYNC_AFTER_MS) return stored;
  return syncClock();
}

export type ClockStamp = {
  clockOffsetMs: number | null;
  clockSyncedAt: number | null;
  /**
   * Real time elapsed between the sync and this capture, read from the hardware counter
   * rather than the clock. The server checks it against the wall-clock gap; a clock moved
   * in between makes the two disagree. Null whenever it cannot be measured honestly — a
   * reboot since the sync, a build without the native counter, or no sync at all.
   */
  elapsedSinceSyncMs: number | null;
};

const EMPTY_STAMP: ClockStamp = {
  clockOffsetMs: null,
  clockSyncedAt: null,
  elapsedSinceSyncMs: null,
};

/**
 * The offset to attach to a capture, or nulls when there is nothing trustworthy to
 * send. Sending nothing is safe: the server falls back to its old behaviour.
 */
export async function clockStampForCapture(): Promise<ClockStamp> {
  const sync = await readClockSync();
  if (!sync) return EMPTY_STAMP;
  if (Date.now() - sync.syncedAtDevice > CLOCK_SYNC_MAX_AGE_MS) return EMPTY_STAMP;

  // Read the counter at the shutter, and let it report a reset it has seen since the sync.
  const { reading, broken } = await touchMonotonic();
  const comparable =
    !broken &&
    typeof sync.monotonicAtSync === "number" &&
    sync.monotonicSource === reading.source &&
    (reading.source === "boot" || sync.monotonicSessionId === reading.sessionId);
  const elapsed = comparable ? Math.round(reading.ms - sync.monotonicAtSync!) : null;

  return {
    clockOffsetMs: sync.offsetMs,
    clockSyncedAt: sync.syncedAtDevice,
    // A negative elapsed time is a counter that reset without being caught. Say nothing
    // rather than send a measurement that would read as tampering.
    elapsedSinceSyncMs: elapsed !== null && elapsed >= 0 ? elapsed : null,
  };
}
