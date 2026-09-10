/**
 * Normalizes whatever a client types or scans into the stored photo-code shape.
 * Codes are printed as GC-XXXX-XXXX-XXXX but get forwarded lowercased, spaced,
 * without the prefix, or as a full /v/<code> URL, so all of that is tolerated.
 *
 * Two prefixes exist on purpose. Codes minted before the GeoCliks rename are
 * stored as TM-XXXX-XXXX-XXXX and MUST keep resolving: the code is part of the
 * signed payload in lib/verify.ts, so rewriting stored codes would invalidate
 * every historical signature and flip intact photos to "tampered". Old rows keep
 * their TM code forever, new ones get GC, and a lookup tries both.
 *
 * Shared by the oRPC lookup (routes/verify.ts) and the public map image
 * (lib/verify-map.ts) so both resolve a code exactly the same way.
 */

/** Current prefix for newly minted codes. */
export const CODE_PREFIX = "GC";

/** Every prefix that has ever been printed on a watermark. */
export const CODE_PREFIXES = ["GC", "TM"] as const;

const BODY_LENGTH = 12;

/**
 * Strips decoration and any known prefix, returning the bare 12-character body.
 * Returns "" when the input cannot be a photo code.
 *
 * The prefix is only removed when what remains is exactly a full body, because
 * the code alphabet itself contains G, C, T and M — blindly trimming two leading
 * letters would eat real characters off an unprefixed code.
 */
function codeBody(raw: string): string {
  const tail = raw.trim().split("/").pop() ?? raw;
  const cleaned = tail.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.length === BODY_LENGTH) return cleaned;
  for (const prefix of CODE_PREFIXES) {
    if (cleaned.length === prefix.length + BODY_LENGTH && cleaned.startsWith(prefix)) {
      return cleaned.slice(prefix.length);
    }
  }
  return "";
}

/** Formats a bare body into the printed shape for a given prefix. */
function format(body: string, prefix: string): string {
  return `${prefix}-${(body.match(/.{1,4}/g) ?? []).join("-")}`;
}

/**
 * The canonical current-era form, for display and cache keys.
 * Returns "" when the input is not a usable code.
 */
export function normalizeCode(raw: string): string {
  const body = codeBody(raw);
  return body ? format(body, CODE_PREFIX) : "";
}

/**
 * Every stored form the input could refer to, newest era first. Pass this to an
 * `inArray` lookup rather than matching a single string, so a client holding a
 * pre-rename code still lands on their photo. Empty when the input is unusable.
 *
 * Bodies are 12 random characters, so a GC and a TM row sharing one is not a
 * practical concern.
 */
export function codeCandidates(raw: string): string[] {
  const body = codeBody(raw);
  if (!body) return [];
  return CODE_PREFIXES.map((prefix) => format(body, prefix));
}
