/**
 * Turn pasted delivery lists into stops.
 *
 * Dispatchers paste from wherever the list already lives: a spreadsheet column, an exported CSV,
 * an email from the customer. That means tabs, commas or semicolons, quoted fields, an optional
 * header row, and columns in any order. The old parser split on "," and popped the last field as
 * the recipient name, which turned "12 Main St, Moncton NB, E1A 4H2" into a person called
 * "E1A 4H2" — so postal codes became recipients on every Canadian list.
 *
 * Two modes:
 *  - A header row is present -> map columns by name. Exact, no guessing.
 *  - No header -> pull out the email and phone by shape, then treat the rest as the address,
 *    popping a trailing field as the name ONLY when it actually looks like a person's name.
 *
 * Delimiter matters for the address. With tabs or semicolons every cell is a discrete column, so
 * the address is one cell. With commas the address itself contains commas ("12 Main St, Moncton
 * NB"), so unclaimed leading cells are joined back together.
 */

export type ParsedStop = {
  addressRaw: string;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
  reference: string | null;
  notes: string | null;
};

export type StopField = keyof ParsedStop;

export type ParseResult = {
  stops: ParsedStop[];
  /** Which delimiter won, for the UI to explain what it did. */
  delimiter: "tab" | "comma" | "semicolon";
  /** The header cells when one was detected and skipped, else null. */
  headerRow: string[] | null;
  /** Non-empty lines that yielded no address and were dropped. */
  skipped: number;
  /** Header columns that matched no field, so the UI can say what it ignored. */
  ignoredColumns: string[];
};

const HEADER_ALIASES: Record<StopField, string[]> = {
  addressRaw: [
    "address", "addresses", "address1", "address 1", "address2", "address 2", "adresse",
    "street", "street address", "rue", "addr", "location", "destination", "stop",
    "delivery address", "ship to", "apt", "unit", "suite",
    // A spreadsheet usually splits the address across columns. Each of these is one more piece
    // of the same line, so they are joined back together in column order.
    "city", "town", "ville", "municipality", "province", "prov", "state", "region",
    "postal", "postal code", "postalcode", "postcode", "code postal", "zip", "zip code",
    "country", "pays",
  ],
  recipientName: [
    "name", "nom", "recipient", "recipient name", "customer", "client", "contact",
    "destinataire", "attention", "attn",
  ],
  recipientEmail: ["email", "e-mail", "email address", "courriel", "mail"],
  recipientPhone: [
    "phone", "phone number", "telephone", "téléphone", "tel", "mobile", "cell", "cellular",
    "contact number",
  ],
  reference: [
    "reference", "ref", "order", "order #", "order number", "invoice", "po", "po #",
    "commande", "facture", "tracking", "job", "job #",
  ],
  notes: [
    "notes", "note", "comment", "comments", "instructions", "special instructions",
    "remarque", "remarques", "details",
  ],
};

const FIELD_ORDER: StopField[] = [
  "addressRaw", "recipientName", "recipientEmail", "recipientPhone", "reference", "notes",
];

/** Words that mean a field is part of a street address, never a person's name. */
const STREET_WORDS = new Set([
  "st", "st.", "street", "rue", "ave", "ave.", "avenue", "rd", "rd.", "road", "blvd", "blvd.",
  "boulevard", "dr", "dr.", "drive", "lane", "ln", "court", "crt", "ct", "cres", "crescent",
  "way", "place", "pl", "highway", "hwy", "route", "rt", "suite", "ste", "unit", "apt",
  "apartment", "floor", "po", "box", "north", "south", "east", "west", "n", "s", "e", "w",
]);

/** Province / state / country tokens that must never be mistaken for a recipient. */
const REGION_WORDS = new Set([
  "nb", "ns", "pe", "pei", "nl", "qc", "on", "mb", "sk", "ab", "bc", "yt", "nt", "nu",
  "canada", "usa", "us", "united states", "new brunswick", "nouveau-brunswick", "quebec", "québec",
]);

const CA_POSTAL = /^[A-Za-z]\d[A-Za-z][\s-]?\d[A-Za-z]\d$/;
const US_ZIP = /^\d{5}(-\d{4})?$/;

function normalizeHeader(cell: string): string {
  return cell
    .trim()
    .toLowerCase()
    .replace(/^["']|["']$/g, "")
    .replace(/[_*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split one delimited line, honouring "quoted fields" and "" escapes. */
export function splitLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        current += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
      continue;
    }
    if (ch === delimiter) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

/**
 * Pick the delimiter.
 *
 * A tab anywhere means the list came out of a spreadsheet and tabs are authoritative. Otherwise
 * whichever of ";" or "," appears more often outside quotes wins, defaulting to a comma.
 */
export function detectDelimiter(text: string): { name: ParseResult["delimiter"]; char: string } {
  const outside = text.replace(/"[^"]*"/g, "");
  if (outside.includes("\t")) return { name: "tab", char: "\t" };
  const semis = (outside.match(/;/g) ?? []).length;
  const commas = (outside.match(/,/g) ?? []).length;
  if (semis > 0 && semis >= commas) return { name: "semicolon", char: ";" };
  return { name: "comma", char: "," };
}

/** Map header cells to fields. Returns null when the row is data, not a header. */
export function mapHeader(cells: string[]): (StopField | null)[] | null {
  // An email address in the row means it is data — no header contains one.
  if (cells.some((c) => c.includes("@"))) return null;

  const mapped = cells.map((cell) => {
    const key = normalizeHeader(cell);
    if (!key) return null;
    for (const field of FIELD_ORDER) {
      if (HEADER_ALIASES[field].includes(key)) return field;
    }
    return null;
  });

  const hits = mapped.filter(Boolean).length;
  if (hits === 0) return null;
  // One recognised word alone is too weak unless it is the only column.
  if (hits < 2 && cells.length > 1) return null;
  if (!mapped.includes("addressRaw")) return null;
  return mapped;
}

function digitCount(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function looksLikePhone(value: string): boolean {
  const digits = digitCount(value);
  if (digits < 7 || digits > 15) return false;
  // Phone fields are digits and punctuation; a street address has real words in it.
  return /^[\d\s()+.\-x/]*(ext\.?|poste)?[\d\s()+.\-x/]*$/i.test(value.trim());
}

/** Would this field pass as a person's name? Deliberately strict — a wrong guess is worse. */
function looksLikeName(value: string): boolean {
  const clean = value.trim();
  if (!clean || clean.length > 60) return false;
  if (digitCount(clean) > 0) return false;
  if (CA_POSTAL.test(clean) || US_ZIP.test(clean)) return false;
  if (!/^[\p{L}][\p{L}'\-.\s]*$/u.test(clean)) return false;

  const words = clean.toLowerCase().split(/\s+/);
  if (words.length > 4) return false;
  if (words.some((w) => STREET_WORDS.has(w))) return false;
  if (REGION_WORDS.has(clean.toLowerCase())) return false;
  // "Moncton NB" is the tail of an address, not a recipient. One region token anywhere in the
  // field is enough to disqualify it — a missed name is recoverable, a wrong one is not.
  if (words.some((w) => REGION_WORDS.has(w))) return false;
  return true;
}

function clean(value: string | null | undefined, max: number): string | null {
  const out = (value ?? "").trim();
  if (!out) return null;
  return out.length > max ? out.slice(0, max) : out;
}

function emptyStop(): ParsedStop {
  return {
    addressRaw: "",
    recipientName: null,
    recipientEmail: null,
    recipientPhone: null,
    reference: null,
    notes: null,
  };
}

/** Build a stop from a mapped header row. */
function fromHeader(cells: string[], mapping: (StopField | null)[]): ParsedStop {
  const stop = emptyStop();
  const extras: string[] = [];

  mapping.forEach((field, i) => {
    const value = (cells[i] ?? "").trim();
    if (!value) return;
    if (!field) return;
    if (field === "addressRaw") {
      // Several address columns (street / city / postal) join back into one line.
      extras.push(value);
      return;
    }
    if (!stop[field]) stop[field] = value;
  });

  stop.addressRaw = extras.join(", ");
  return stop;
}

/** Build a stop by shape when there is no header to trust. */
function fromHeuristics(cells: string[], joinAddress: boolean): ParsedStop {
  const stop = emptyStop();
  const remaining: string[] = [];

  for (const cell of cells) {
    if (!cell) continue;
    if (!stop.recipientEmail && looksLikeEmail(cell)) {
      stop.recipientEmail = cell;
      continue;
    }
    if (!stop.recipientPhone && looksLikePhone(cell)) {
      stop.recipientPhone = cell;
      continue;
    }
    remaining.push(cell);
  }

  if (remaining.length === 0) return stop;

  if (joinAddress) {
    // Comma-separated: the address spans cells, so only a trailing real name comes off.
    if (remaining.length > 1 && looksLikeName(remaining[remaining.length - 1])) {
      stop.recipientName = remaining.pop() ?? null;
    }
    stop.addressRaw = remaining.join(", ");
  } else {
    // Tab/semicolon: discrete columns. First is the address, a following name-shaped cell is the
    // recipient, and anything left over is kept as notes rather than thrown away.
    stop.addressRaw = remaining.shift() ?? "";
    const nameAt = remaining.findIndex((c) => looksLikeName(c));
    if (nameAt !== -1) stop.recipientName = remaining.splice(nameAt, 1)[0];
    if (remaining.length) stop.notes = remaining.join(" · ");
  }

  return stop;
}

/** Parse a pasted block into stops, ready for `routes.addStops`. */
export function parseStops(text: string): ParseResult {
  const { name, char } = detectDelimiter(text);
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let headerRow: string[] | null = null;
  let mapping: (StopField | null)[] | null = null;
  const ignoredColumns: string[] = [];

  if (lines.length > 0) {
    const first = splitLine(lines[0], char);
    const candidate = mapHeader(first);
    if (candidate) {
      mapping = candidate;
      headerRow = first;
      candidate.forEach((field, i) => {
        const label = (first[i] ?? "").trim();
        if (!field && label) ignoredColumns.push(label);
      });
      lines.shift();
    }
  }

  const stops: ParsedStop[] = [];
  let skipped = 0;

  for (const line of lines) {
    const cells = splitLine(line, char);
    const stop = mapping
      ? fromHeader(cells, mapping)
      : fromHeuristics(cells, name === "comma");

    const addressRaw = clean(stop.addressRaw, 300);
    if (!addressRaw) {
      skipped++;
      continue;
    }

    stops.push({
      addressRaw,
      recipientName: clean(stop.recipientName, 120),
      recipientEmail: clean(stop.recipientEmail, 200),
      recipientPhone: clean(stop.recipientPhone, 50),
      reference: clean(stop.reference, 80),
      notes: clean(stop.notes, 500),
    });
  }

  return { stops, delimiter: name, headerRow, skipped, ignoredColumns };
}
