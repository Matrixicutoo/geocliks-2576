/** Plain coordinate maths shared by the navigation screen and the arrival gate. */

export type LatLng = { lat: number; lng: number };

/** Metres between two pins. Haversine on a sphere — plenty for a doorstep or a lane. */
export function metresBetween(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/**
 * How far a point sits off a line segment, in metres.
 *
 * Projected in a local flat frame — over the tens of metres that decide "is he still on this
 * road", the curvature of the earth is far below the accuracy of the fix, and the alternative
 * is spherical trigonometry on every GPS tick.
 */
function metresToSegment(p: LatLng, a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const scale = Math.cos(p.lat * rad);
  // Degrees, with longitude squeezed to match latitude's ground distance.
  const px = (p.lng - a.lng) * scale;
  const py = p.lat - a.lat;
  const bx = (b.lng - a.lng) * scale;
  const by = b.lat - a.lat;

  const len2 = bx * bx + by * by;
  // A degenerate segment is just its start point.
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (px * bx + py * by) / len2));
  const dx = px - bx * t;
  const dy = py - by * t;
  // 1 degree of latitude is ~111.32 km everywhere.
  return Math.sqrt(dx * dx + dy * dy) * 111_320;
}

/**
 * Distance from the driver to the nearest point of the drawn route.
 *
 * This is the off-route test. A city fix drifts 10–30 m and a road is two lanes wide, so only
 * a large number here means he has actually turned off the plan rather than that the phone is
 * unsure where he is. Returns null when there is no line to measure against.
 */
export function metresOffPath(point: LatLng, path: LatLng[]): number | null {
  if (path.length === 0) return null;
  const first = path[0];
  if (path.length === 1 && first) return metresBetween(point, first);

  let best = Number.POSITIVE_INFINITY;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    if (!a || !b) continue;
    const d = metresToSegment(point, a, b);
    if (d < best) best = d;
  }
  return Number.isFinite(best) ? best : null;
}

/** "850 m" / "1.2 km", for a bar the driver reads at a glance. */
export function formatMetres(metres: number): string {
  if (metres < 1000) return `${Math.round(metres / 10) * 10} m`;
  return `${(metres / 1000).toFixed(metres < 10000 ? 1 : 0)} km`;
}

/** "4 min" / "1 h 12 min". Rounded up: nobody is early because of a rounding rule. */
export function formatDuration(seconds: number): string {
  const mins = Math.max(1, Math.ceil(seconds / 60));
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Clock time of arrival in the phone's own locale, e.g. "14:38". */
export function arrivalClock(seconds: number, now = new Date()): string {
  const at = new Date(now.getTime() + seconds * 1000);
  return at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
