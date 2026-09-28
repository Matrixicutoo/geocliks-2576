import AsyncStorage from "@react-native-async-storage/async-storage";
import { elapsedRealtime } from "@/modules/monotonic-clock";

const KEY = "geocliks.monotonic.v1";

/**
 * A clock the phone's owner cannot move.
 *
 * lib/clock.ts proves what the device clock read against the server the last time there
 * was signal. That catches a clock wound *backwards*: the capture then claims a moment
 * before the last proven sync, and the server rejects it. It does not catch the other
 * direction. Wind the clock forward in a dead zone, shoot, and every number the phone
 * sends is internally consistent — the offset is old but honest, the capture time is
 * after it, nothing contradicts anything.
 *
 * What contradicts it is real elapsed time. This module reads the hardware counter that
 * runs from boot — `SystemClock.elapsedRealtime()` on Android, `CLOCK_MONOTONIC` on iOS —
 * and stores the reading taken at the moment of a sync. At capture the difference between
 * the two readings is how much time actually passed, whatever the clock claims. A clock
 * pushed an hour forward makes the wall-clock gap an hour longer than the counter's. The
 * server compares the two and knows.
 *
 * Two things reset the counter, and both have to be caught or they read as tampering:
 *  - a reboot, which sends it back to zero;
 *  - a build with no native module, where the fallback counter only spans one app session.
 * Both are handled by the heartbeat below, which is why the answer is three-valued: the
 * elapsed measurement is either present and trustworthy, or absent. It is never guessed.
 */
export type MonotonicSource = "boot" | "session";

export type MonotonicReading = {
  ms: number;
  source: MonotonicSource;
  /** Identifies the JS process, so a "session" reading is only compared within one. */
  sessionId: string;
};

/**
 * New on every app launch. `performance.now()` is monotonic — it cannot be moved by
 * changing the clock — but it restarts at zero with the process, so a reading is only
 * comparable to another from the same session.
 */
const SESSION_ID = `s_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

/** Tolerance on the reboot test, so ordinary read jitter is not mistaken for one. */
const REBOOT_SLACK_MS = 2000;

type Heartbeat = {
  ms: number;
  source: MonotonicSource;
  sessionId: string;
  /** Sticky: set when the counter was seen to reset, cleared by the next clock sync. */
  broken: boolean;
};

let cached: Heartbeat | null = null;

/** The counter as it reads right now: the hardware one when this build has it. */
export function monotonicNow(): MonotonicReading {
  const boot = elapsedRealtime();
  if (boot !== null) return { ms: boot, source: "boot", sessionId: SESSION_ID };
  return { ms: performance.now(), source: "session", sessionId: SESSION_ID };
}

async function readHeartbeat(): Promise<Heartbeat | null> {
  if (cached) return cached;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Heartbeat;
    if (typeof parsed?.ms !== "number" || typeof parsed?.sessionId !== "string") return null;
    cached = parsed;
    return parsed;
  } catch {
    return null;
  }
}

async function writeHeartbeat(next: Heartbeat) {
  cached = next;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Losing the heartbeat costs a measurement, never a false accusation: a missing
    // record makes the next reading unusable rather than suspicious.
  }
}

/**
 * Read the counter and record it, noticing a reset.
 *
 * Call it at launch and before every capture. A counter that reads lower than it did last
 * time can only mean the device rebooted (or, without the native module, that the process
 * restarted), so the stored anchor no longer measures anything and is marked broken. That
 * flag is sticky until the next successful sync re-anchors it — an honest reboot in a dead
 * zone therefore costs the elapsed check, and never fabricates a tamper.
 *
 * Because a capture can only be taken with the app open, and the app cannot open without
 * passing through here, no reboot slips past unseen.
 */
export async function touchMonotonic(): Promise<{ reading: MonotonicReading; broken: boolean }> {
  const reading = monotonicNow();
  const last = await readHeartbeat();
  let broken = last?.broken ?? false;

  if (last) {
    const sameCounter =
      last.source === reading.source &&
      (reading.source === "boot" || last.sessionId === reading.sessionId);
    if (!sameCounter || reading.ms < last.ms - REBOOT_SLACK_MS) broken = true;
  }

  await writeHeartbeat({
    ms: reading.ms,
    source: reading.source,
    sessionId: reading.sessionId,
    broken,
  });
  return { reading, broken };
}

/** Called when a fresh sync re-anchors everything: the reset no longer matters. */
export async function clearMonotonicBreak(reading: MonotonicReading) {
  await writeHeartbeat({
    ms: reading.ms,
    source: reading.source,
    sessionId: reading.sessionId,
    broken: false,
  });
}
