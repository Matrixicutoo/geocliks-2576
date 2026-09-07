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
