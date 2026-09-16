/**
 * Client-side row matching for the dashboard's Projects and Notes panels.
 *
 * Both lists arrive whole and small — eight jobs in a column, a workspace's open notes — so
 * filtering happens here rather than as a round trip. Nothing is sent to the server and nothing
 * re-fetches while someone types.
 *
 * The matching is deliberately forgiving, because the office searches by whatever it has on
 * hand: half an address, a first name, a phone number punctuated differently to how it was
 * saved, a date written the way their region writes dates.
 */

/** Fold accents and case, so `Lévesque` is found by `levesque` and `LEVESQUE`. */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const NON_DIGIT = /\D+/g;

/**
 * The written forms of a stored `YYYY-MM-DD` date.
 *
 * Notes keep ISO dates, but nobody types one into a search box. Both day-first and month-first
 * orders go in: the product ships in eleven locales that disagree on which is which, and an
 * ambiguous `09/07` simply matches a little more generously than it strictly should.
 */
function dateForms(iso: string): string[] {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!parts) return [iso];
  const [, year, month, day] = parts;
  return [
    iso,
    `${month}/${day}/${year}`,
    `${day}/${month}/${year}`,
    `${month}/${day}`,
    `${day}/${month}`,
  ];
}

export type SearchValue = string | null | undefined;

export interface SearchableRow {
  /** Free text: names, codes, clients, addresses, bodies, categories. */
  text: SearchValue[];
  /** ISO `YYYY-MM-DD` dates, matched in the forms above as well as raw. */
  dates?: SearchValue[];
  /** Phone numbers, matched on digits alone so punctuation never blocks a hit. */
  phones?: SearchValue[];
}

/**
 * Does this row satisfy the query?
 *
 * Every whitespace-separated term has to match something, though not all the same something —
 * `smith houston` finds the Smith job on Houston Ave, which is how people narrow a list. An
 * empty query matches everything, so callers can pass the raw input straight through.
 *
 * Fields are joined with a newline rather than a space so two of them never read as one
 * continuous string: a term cannot spill off the end of the client name and onto the front of
 * the address.
 */
export function matchesSearch(query: string, row: SearchableRow): boolean {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = [
    ...row.text,
    ...(row.dates ?? []).flatMap((date) => (date ? dateForms(date) : [])),
    ...(row.phones ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .map(fold)
    .join("\n");

  // Kept apart from the text so `5551234` can match `(555) 123-4567` without letting a bare
  // run of digits match against every house number and job code in the row.
  const phoneDigits = (row.phones ?? [])
    .filter((value): value is string => Boolean(value))
    .map((phone) => phone.replace(NON_DIGIT, ""))
    .join("\n");

  return terms.every((term) => {
    if (haystack.includes(term)) return true;
    const digits = term.replace(NON_DIGIT, "");
    // Three is the shortest run worth matching — below that an extension digit or two would
    // pull in half the list.
    return digits.length >= 3 && phoneDigits.includes(digits);
  });
}
