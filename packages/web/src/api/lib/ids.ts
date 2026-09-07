const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford-ish, no I/L/O/U

/** Random id, url safe, sortable-ish by time prefix. */
export function id(prefix: string): string {
  const time = Date.now().toString(36).toUpperCase();
  return `${prefix}_${time}${random(10)}`;
}

export function random(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

/** Human-readable evidence code printed on every photo, e.g. TM-4K9Q-7XR2-B3TD. */
export function photoCode(): string {
  return `TM-${random(4)}-${random(4)}-${random(4)}`;
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "team"
  );
}

export function shareToken(): string {
  return random(22).toLowerCase();
}
