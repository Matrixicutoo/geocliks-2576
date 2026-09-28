/**
 * Tamper protection.
 *
 * A photo's proof value comes from three things the device cannot forge on its own:
 *  1. `verifiedAt` — the server clock at upload time. Device time is recorded separately as
 *     `capturedAt`, and the difference is stored as `clockSkewMs`. Changing phone settings
 *     changes `capturedAt` only, which immediately shows up as skew.
 *  2. `contentHash` — SHA-256 of the uploaded image bytes.
 *  3. `signature` — HMAC-SHA256 over the canonical metadata payload (code, hashes, times,
 *     coordinates, owner). Any later edit to image or metadata breaks the signature.
 *
 * A fourth thing covers the case the three above cannot: a phone with no signal, whose
 * clock the holder changes before shooting. `resolveClock` cross-checks the interval the
 * device's wall clock claims against the same interval as measured by its boot-relative
 * hardware counter, which no setting can move. See `elapsedSinceSyncMs` below.
 */

const SECRET = process.env.BETTER_AUTH_SECRET ?? "geocliks-dev-secret";

export interface EvidencePayload {
  photoCode: string;
  orgId: string;
  userId: string;
  storageKey: string;
  capturedAt: number;
  verifiedAt: number;
  lat: number | null;
  lng: number | null;
  contentHash: string | null;
}

export function canonical(payload: EvidencePayload): string {
  return [
    payload.photoCode,
    payload.orgId,
    payload.userId,
    payload.storageKey,
    payload.capturedAt,
    payload.verifiedAt,
    payload.lat ?? "",
    payload.lng ?? "",
    payload.contentHash ?? "",
  ].join("|");
}

async function hmacKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sign(payload: EvidencePayload): Promise<string> {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(canonical(payload)));
  return hex(sig);
}

export async function verifySignature(
  payload: EvidencePayload,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;
  const expected = await sign(payload);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

export async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as unknown as ArrayBuffer);
  return hex(digest);
}

/** Skew above this means the device clock disagrees with network time in a suspicious way. */
export const SKEW_TOLERANCE_MS = 5 * 60 * 1000;

export function timeSourceFor(skewMs: number): "network" | "device" {
  return Math.abs(skewMs) <= SKEW_TOLERANCE_MS ? "network" : "device";
}

/**
 * A clock offset measured longer ago than this is no longer trusted: phones drift,
 * and the user may have changed the clock since the last sync.
 */
export const CLOCK_SYNC_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** An offset larger than this is not a plausible measurement, it is a broken client. */
const MAX_PLAUSIBLE_OFFSET_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * How far the phone's wall clock may disagree with its own hardware elapsed-time counter
 * before the clock is treated as having been changed.
 *
 * The two measure the same interval by different means, so they should agree closely. The
 * slack covers the honest sources of difference — the counter is read a beat after the
 * clock at each end, and a phone's crystal drifts a little — while staying far below any
 * shift worth making: a minute of extra paid time is already well outside it.
 */
export const ELAPSED_DISAGREEMENT_TOLERANCE_MS = 90 * 1000;

export interface ClockInput {
  /** Device clock at capture. */
  capturedAt: number;
  /** Server clock at upload. */
  verifiedAt: number;
  /** serverTime - deviceTime, measured by the device against the server while online. */
  clockOffsetMs?: number | null;
  /** Device clock when that offset was measured. */
  clockSyncedAt?: number | null;
  /**
   * Real time between that sync and the capture, read from the device's boot-relative
   * counter — Android `SystemClock.elapsedRealtime()`, iOS `CLOCK_MONOTONIC`. No setting
   * can move it, so it is the one number here a user cannot rewrite. Null when the device
   * could not measure it honestly (a reboot in between, or an older build).
   */
  elapsedSinceSyncMs?: number | null;
}

/**
 * What the elapsed-time cross-check had to say.
 *  - `consistent`: the counter agrees with the clock, so the clock was not touched.
 *  - `broken`: they disagree. The clock moved between the sync and the capture.
 *  - `unchecked`: no measurement to compare — an older build, or a reboot in between.
 */
export type ClockContinuity = "consistent" | "broken" | "unchecked";

export interface ClockResult {
  /** deviceTime - serverTime: how wrong the phone's clock was at capture. */
  skewMs: number;
  /** How long the capture sat in the offline queue before it reached the server. */
  uploadDelayMs: number;
  timeSource: "network" | "device";
  integrity: "verified" | "unverified";
  continuity: ClockContinuity;
  /**
   * Wall-clock gap minus real elapsed time, when both are known. Positive means the clock
   * was pushed forward, negative back. Null when the check did not run.
   */
  clockDriftMs: number | null;
}

/**
 * Separates two things the old code confused for each other:
 *  - the device clock being wrong (real evidence problem), and
 *  - the upload arriving late (normal in a dead zone, not a problem at all).
 *
 * Before this, a delivery photo taken underground and drained an hour later was
 * stamped "unverified" purely because of the queue delay.
 *
 * The device's own offset is only trusted when it was measured against the server
 * recently. A client could always claim `offset = 0`, so a capture stamped in the
 * future relative to the server is rejected no matter what offset it sends.
 */
export function resolveClock(input: ClockInput): ClockResult {
  const uploadDelayMs = Math.max(0, input.verifiedAt - input.capturedAt);
  const legacySkew = input.capturedAt - input.verifiedAt;

  // Claiming a capture time ahead of the server clock cannot be explained by an
  // upload delay — the server has already passed that moment.
  if (input.capturedAt > input.verifiedAt + SKEW_TOLERANCE_MS) {
    return {
      skewMs: legacySkew,
      uploadDelayMs,
      timeSource: "device",
      integrity: "unverified",
      continuity: "unchecked",
      clockDriftMs: null,
    };
  }

  const offset = input.clockOffsetMs;
  const syncedAt = input.clockSyncedAt;
  const usable =
    typeof offset === "number" &&
    Number.isFinite(offset) &&
    Math.abs(offset) <= MAX_PLAUSIBLE_OFFSET_MS &&
    typeof syncedAt === "number" &&
    Number.isFinite(syncedAt) &&
    input.capturedAt - syncedAt >= -SKEW_TOLERANCE_MS &&
    input.capturedAt - syncedAt <= CLOCK_SYNC_MAX_AGE_MS;

  // Old app builds send no offset at all. Fall back to the previous formula rather
  // than silently trusting a client that never proved its clock.
  const skewMs = usable ? -offset! : legacySkew;

  // The offset alone only catches a clock wound backwards, which lands the capture before
  // the last proven sync. Forward is the direction worth money — add an hour to the shift
  // in a dead zone and every number the phone sends still agrees with itself. What does
  // not agree is the hardware counter: it measures the interval the clock claims, and a
  // clock that moved makes the two differ by exactly how far it moved.
  const elapsed = input.elapsedSinceSyncMs;
  const measurable =
    usable && typeof elapsed === "number" && Number.isFinite(elapsed) && elapsed >= 0;
  const clockDriftMs = measurable ? input.capturedAt - syncedAt! - elapsed! : null;
  const continuity: ClockContinuity =
    clockDriftMs === null
      ? "unchecked"
      : Math.abs(clockDriftMs) <= ELAPSED_DISAGREEMENT_TOLERANCE_MS
        ? "consistent"
        : "broken";

  // When they disagree, the drift is the better reading of how wrong the clock was: the
  // offset was honest when it was measured, and the clock has moved by the drift since.
  // Report that, and never pass the capture — a clock changed mid-shift is the thing this
  // whole file exists to make visible, whatever the resulting numbers happen to total.
  if (continuity === "broken") {
    const trueSkew = Math.round(-offset! + clockDriftMs!);
    return {
      skewMs: trueSkew,
      uploadDelayMs,
      timeSource: "device",
      integrity: "unverified",
      continuity,
      clockDriftMs,
    };
  }

  return {
    skewMs,
    uploadDelayMs,
    timeSource: timeSourceFor(skewMs),
    integrity: Math.abs(skewMs) <= SKEW_TOLERANCE_MS ? "verified" : "unverified",
    continuity,
    clockDriftMs,
  };
}
