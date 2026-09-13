/**
 * The caller's own timezone, and day boundaries measured in it.
 *
 * "Tuesday" means the crew's Tuesday, not UTC's. Moncton runs three or four hours behind UTC,
 * so an evening capture is already tomorrow in UTC: a shot at 11:38pm local on the 9th is
 * stored as 02:38 on the 10th. Bounding a day in UTC therefore drops that crew's whole evening
 * off the day they actually worked and lends it to the next one — and near-midnight captures
 * are normal in this data, not an edge case.
 *
 * Nothing in the schema records a zone (`capturedAt` is the device clock as an instant), so the
 * client sends its own and this resolves the boundaries against it.
 */

/** The zone the client asked for, if it is one this runtime knows. Defaults to UTC. */
export function zoneOf(request: Request): string {
  const asked = request.headers.get("x-geocliks-tz")?.trim();
  // Unvalidated, this string reaches Intl and throws a RangeError on the request path, so a
  // junk header would 500 the endpoint rather than fall back.
  if (!asked || asked.length > 60) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: asked });
    return asked;
  } catch {
    return "UTC";
  }
}

/** How far `zone` sits from UTC at this instant, in milliseconds. DST-aware by construction. */
function offsetAt(at: Date, zone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  // `hour12: false` can render midnight as hour 24; Date.UTC handles the rollover either way.
  const wall = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  // `formatToParts` has no milliseconds, so the wall reading above is truncated to the second.
  // Comparing it against the untruncated instant would fold those milliseconds into the offset
  // and push the end-of-day bound a second into the next local day. Zone offsets are whole
  // minutes, so dropping the same milliseconds from both sides is exact.
  return wall - (at.getTime() - at.getUTCMilliseconds());
}

/**
 * The instant a wall-clock date in `zone` begins or ends.
 *
 * Two passes: the offset has to be read at roughly the right instant, and the first guess can
 * land on the wrong side of a DST change. Re-reading it at the corrected instant settles that.
 */
export function dayBoundsIn(value: string | undefined, end: boolean, zone: string): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number) as [number, number, number];
  const wall = end
    ? Date.UTC(year, month - 1, day, 23, 59, 59, 999)
    : Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  if (Number.isNaN(wall)) return null;

  const first = wall - offsetAt(new Date(wall), zone);
  const settled = wall - offsetAt(new Date(first), zone);
  return new Date(settled);
}

/** Today's date in `zone`, as YYYY-MM-DD — what the model resolves "Tuesday" against. */
export function todayIn(zone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
