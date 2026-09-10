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

export interface ClockInput {
  /** Device clock at capture. */
  capturedAt: number;
  /** Server clock at upload. */
  verifiedAt: number;
  /** serverTime - deviceTime, measured by the device against the server while online. */
  clockOffsetMs?: number | null;
  /** Device clock when that offset was measured. */
  clockSyncedAt?: number | null;
}

export interface ClockResult {
  /** deviceTime - serverTime: how wrong the phone's clock was at capture. */
  skewMs: number;
  /** How long the capture sat in the offline queue before it reached the server. */
  uploadDelayMs: number;
  timeSource: "network" | "device";
  integrity: "verified" | "unverified";
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

  return {
    skewMs,
    uploadDelayMs,
    timeSource: timeSourceFor(skewMs),
    integrity: Math.abs(skewMs) <= SKEW_TOLERANCE_MS ? "verified" : "unverified",
  };
}
