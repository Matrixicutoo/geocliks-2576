import { requireOptionalNativeModule } from "expo";

/**
 * Boot-relative elapsed time.
 *
 * The wall clock — `Date.now()` — is whatever the user last told Settings it was. This
 * module reads the counter the hardware keeps from boot instead: Android's
 * `SystemClock.elapsedRealtime()` and Darwin's `CLOCK_MONOTONIC`. Both keep counting
 * while the device sleeps and neither can be moved by changing the date and time, which
 * is what makes them worth something as evidence: they measure how much time really
 * passed between two moments, whatever the clock says.
 *
 * `requireOptionalNativeModule` rather than the strict form on purpose — a build without
 * this native code (Expo Go, or a binary from before it shipped) gets `null` and the
 * caller falls back, instead of crashing the camera.
 */
type MonotonicClockNativeModule = {
  /** Milliseconds since boot, including sleep. Unaffected by wall-clock changes. */
  elapsedRealtime: () => number;
};

const native = requireOptionalNativeModule<MonotonicClockNativeModule>("MonotonicClock");

/** True when this binary has the native counter available. */
export const hasNativeMonotonicClock = native != null;

/** Milliseconds since boot, or null when the native module is not in this build. */
export function elapsedRealtime(): number | null {
  if (!native) return null;
  try {
    const ms = native.elapsedRealtime();
    return Number.isFinite(ms) ? ms : null;
  } catch {
    return null;
  }
}

export default { elapsedRealtime, hasNativeMonotonicClock };
