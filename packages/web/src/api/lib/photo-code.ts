/**
 * Normalizes whatever a client types or scans into the stored photo-code shape.
 * Codes are printed as TM-XXXX-XXXX-XXXX but get forwarded lowercased, spaced,
 * without the prefix, or as a full /v/<code> URL, so all of that is tolerated.
 *
 * Shared by the oRPC lookup (routes/verify.ts) and the public map image
 * (lib/verify-map.ts) so both resolve a code exactly the same way.
 */
export function normalizeCode(raw: string): string {
  const tail = raw.trim().split("/").pop() ?? raw;
  const cleaned = tail
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^TM/, "");
  if (cleaned.length < 6) return "";
  const groups = cleaned.match(/.{1,4}/g) ?? [];
  return `TM-${groups.join("-")}`;
}
