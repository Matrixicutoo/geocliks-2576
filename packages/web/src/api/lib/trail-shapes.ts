import { fetchRouteShape, metresBetween, type LatLng } from "./directions";

/**
 * Road-following trails for the evidence map.
 *
 * The map joins each photographer's captures for a day, in shutter order. That used to be a
 * straight dotted line pin to pin, which cut across blocks, rivers and buildings. This asks the
 * same Google routing the Routes page uses (`fetchRouteShape`) for the drive between them, so the
 * trail reads like the route a crew actually drove.
 *
 * It is a drawing aid, not a record: nothing here says the crew took that road. The pins and
 * their timestamps remain the evidence.
 *
 * Billing and noise are the two things to contain:
 * - Captures seconds apart on the same site would each be a routing hop, and Google would route
 *   "around the block" between two shots of the same wall. Consecutive points closer than
 *   `NEAR_M` are dropped before asking (the first and last always stay).
 * - Each trail is cached by its own points. A capture is never moved after the fact, so a trail
 *   only changes when a capture is added, and then the key changes with it.
 * - Only the `MAX_TRAILS` most recent trails are routed per request; older ones stay straight.
 */
const NEAR_M = 40;
const MAX_TRAILS = 30;
const TTL_MS = 12 * 60 * 60 * 1000;
const CACHE_MAX = 500;

export type Trail = { key: string; path: LatLng[]; provider: "google" | "direct" };

type Capture = { userId: string | null; capturedAt: Date | number; lat: number; lng: number };

const cache = new Map<string, { at: number; path: LatLng[] }>();

const pointsKey = (points: LatLng[]) =>
  points.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join(";");

/** The same grouping the browser draws with: one trail per photographer per UTC day. */
export function trailKey(userId: string | null, capturedAt: Date | number): string {
  return `${userId ?? "unknown"}:${new Date(capturedAt).toISOString().slice(0, 10)}`;
}

function thin(points: LatLng[]): LatLng[] {
  if (points.length <= 1) return points;
  const out: LatLng[] = [points[0] as LatLng];
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i] as LatLng;
    if (metresBetween(out[out.length - 1] as LatLng, p) >= NEAR_M) out.push(p);
  }
  const last = points[points.length - 1] as LatLng;
  if (metresBetween(out[out.length - 1] as LatLng, last) >= NEAR_M) out.push(last);
  // The last shot sits on the previous kept point: end the trail there instead, so it still
  // finishes where the crew finished. A single survivor means one spot, nothing to route.
  else if (out.length > 1) out[out.length - 1] = last;
  return out;
}

async function routed(points: LatLng[]): Promise<{ path: LatLng[]; google: boolean }> {
  const key = pointsKey(points);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return { path: hit.path, google: true };

  const shape = await fetchRouteShape(points);
  if (shape.provider !== "google") return { path: shape.path, google: false };

  for (const [k, entry] of cache) if (Date.now() - entry.at >= TTL_MS) cache.delete(k);
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  // Only a real routed answer is cached: a straight fallback would keep the map wrong after
  // the key or the network came back.
  cache.set(key, { at: Date.now(), path: shape.path });
  return { path: shape.path, google: true };
}

export async function buildTrails(captures: Capture[]): Promise<Trail[]> {
  const groups = new Map<string, Capture[]>();
  for (const c of captures) {
    const key = trailKey(c.userId, c.capturedAt);
    const bucket = groups.get(key);
    if (bucket) bucket.push(c);
    else groups.set(key, [c]);
  }

  const time = (v: Date | number) => new Date(v).getTime();
  const candidates = [...groups.entries()]
    .filter(([, bucket]) => bucket.length >= 2)
    .map(([key, bucket]) => {
      const sorted = [...bucket].sort((a, b) => time(a.capturedAt) - time(b.capturedAt));
      return {
        key,
        latest: time(sorted[sorted.length - 1]!.capturedAt),
        points: thin(sorted.map((c) => ({ lat: c.lat, lng: c.lng }))),
      };
    })
    .sort((a, b) => b.latest - a.latest)
    .slice(0, MAX_TRAILS);

  const out: Trail[] = [];
  // A few at a time: a first open of a busy workspace should not fire 30 calls at once.
  for (let i = 0; i < candidates.length; i += 4) {
    const batch = candidates.slice(i, i + 4);
    const done = await Promise.all(
      batch.map(async (c) => {
        // Every shot within a few metres of the first: nothing to route, the pins say it all.
        if (c.points.length < 2) return null;
        try {
          const r = await routed(c.points);
          return r.google ? ({ key: c.key, path: r.path, provider: "google" } as Trail) : null;
        } catch {
          return null;
        }
      }),
    );
    for (const t of done) if (t) out.push(t);
  }
  return out;
}
