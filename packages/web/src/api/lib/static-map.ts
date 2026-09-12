/**
 * Server-rendered map images for the **public** share page.
 *
 * The signed-in app keeps the live Maps JavaScript map. Public share links do not: `/share/:token`
 * is unauthenticated, so shipping a browser key there exposes it to anyone who opens a link, and
 * Maps JS bills per map load. Instead the browser asks our own origin for a PNG and the server
 * calls the Static Maps API with a key that never leaves the sandbox.
 *
 * Nothing here throws — a missing key or a Google outage returns a placeholder SVG so the share
 * page still renders.
 */

/**
 * Prefers a dedicated server key (restrict it by IP in the Google console, not by HTTP referrer),
 * with the browser key behind it.
 *
 * The order alone is not enough: a server key that *exists* but has not had Static Maps enabled on
 * it answers 403, and preferring it would then break every map even though the browser key works.
 * So the keys are a list, and a rejection promotes the next one for the rest of the process —
 * see `fetchStaticMap`.
 */
const KEYS = [process.env.GOOGLE_MAPS_SERVER_KEY, process.env.VITE_GOOGLE_MAPS_API_KEY].filter(
  (k): k is string => !!k,
);
let keyIndex = 0;
const KEY = () => KEYS[keyIndex] ?? "";

/** Google rejects very long URLs; well under the 8192-char limit at this count. */
const MAX_PINS = 40;

const AMBER = "0xE08A00";

/** Mirrors MAP_STYLES in packages/web/src/web/components/evidence-map.tsx, in Static Maps syntax. */
const STYLE = [
  "element:geometry|color:0xF4F6F9",
  "element:labels.text.fill|color:0x5B6676",
  "element:labels.text.stroke|color:0xFFFFFF",
  "feature:administrative|element:geometry.stroke|color:0xD7DDE6",
  "feature:landscape.man_made|element:geometry|color:0xEDF1F6",
  "feature:poi|element:labels|visibility:off",
  "feature:poi.park|element:geometry|color:0xE3EEE2",
  "feature:road|element:geometry|color:0xFFFFFF",
  "feature:road|element:geometry.stroke|color:0xE1E6ED",
  "feature:road.highway|element:geometry|color:0xFFE7BC",
  "feature:road.highway|element:geometry.stroke|color:0xF2CE8C",
  "feature:road|element:labels.text.fill|color:0x6E7B8C",
  "feature:transit|visibility:off",
  "feature:water|element:geometry|color:0xCFE2F3",
  "feature:water|element:labels.text.fill|color:0x7C93A8",
];

export type StaticMapPoint = {
  lat: number;
  lng: number;
  /** Groups route lines the same way the live map does: one path per photographer per day. */
  userId?: string | null;
  capturedAt?: Date | string | null;
};

const coord = (p: StaticMapPoint) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`;

const dayKey = (value: Date | string | null | undefined) =>
  value ? new Date(value).toISOString().slice(0, 10) : "unknown";

const time = (value: Date | string | null | undefined) => (value ? new Date(value).getTime() : 0);

/** One dotted-ish path per photographer per day, in capture order. */
function paths(points: StaticMapPoint[]) {
  const groups = new Map<string, StaticMapPoint[]>();
  for (const p of points) {
    const key = `${p.userId ?? "unknown"}:${dayKey(p.capturedAt)}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(p);
    else groups.set(key, [p]);
  }
  const out: string[] = [];
  for (const bucket of groups.values()) {
    if (bucket.length < 2) continue;
    const ordered = [...bucket].sort((a, b) => time(a.capturedAt) - time(b.capturedAt));
    out.push(`color:${AMBER}CC|weight:3|${ordered.map(coord).join("|")}`);
  }
  return out;
}

export function staticMapUrl(
  points: StaticMapPoint[],
  opts: { width: number; height: number; scale: 1 | 2; showRoute: boolean },
) {
  if (!KEY() || points.length === 0) return null;
  const pins = points.slice(0, MAX_PINS);
  const params = new URLSearchParams();
  params.set("size", `${opts.width}x${opts.height}`);
  params.set("scale", String(opts.scale));
  params.set("maptype", "roadmap");
  params.set("format", "png");
  // No center/zoom: Static Maps fits the markers automatically.
  if (pins.length === 1) params.set("zoom", "16");
  params.set("key", KEY());

  const query: string[] = [params.toString()];
  for (const s of STYLE) query.push(`style=${encodeURIComponent(s)}`);
  if (opts.showRoute) {
    for (const p of paths(pins)) query.push(`path=${encodeURIComponent(p)}`);
  }
  query.push(
    `markers=${encodeURIComponent(`color:${AMBER}|scale:${opts.scale}|${pins.map(coord).join("|")}`)}`,
  );
  return `https://maps.googleapis.com/maps/api/staticmap?${query.join("&")}`;
}

/** Rendered in place of a map when there is no key, no coordinates, or Google is unreachable. */
export function placeholderSvg(label: string, width: number, height: number) {
  const safe = label.replace(/[<>&]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${safe}">
<rect width="${width}" height="${height}" fill="#F4F6F9"/>
<g fill="none" stroke="#E1E6ED" stroke-width="1">
${Array.from({ length: Math.ceil(width / 40) }, (_, i) => `<path d="M${i * 40} 0V${height}"/>`).join("")}
${Array.from({ length: Math.ceil(height / 40) }, (_, i) => `<path d="M0 ${i * 40}H${width}"/>`).join("")}
</g>
<text x="50%" y="50%" text-anchor="middle" font-family="ui-monospace,monospace" font-size="12" letter-spacing="1.5" fill="#5B6676">${safe}</text>
</svg>`;
}

type Cached = { bytes: ArrayBuffer; type: string; at: number };
const cache = new Map<string, Cached>();
const TTL_MS = 5 * 60 * 1000;

/**
 * Fetches (and briefly caches) the map image. Caching matters here: a share link can be opened by
 * many people, and every uncached load is a billable Static Maps request.
 */
export async function fetchStaticMap(
  cacheKey: string,
  url: string,
): Promise<{ bytes: ArrayBuffer; type: string } | null> {
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < TTL_MS) return { bytes: hit.bytes, type: hit.type };
  try {
    let res = await fetch(url);
    // A rejected key is a configuration problem, not a transient one: promote the next key and
    // retry this request with it, so one bad key does not blank out every map on the site.
    if (res.status === 403 && keyIndex + 1 < KEYS.length) {
      const rejected = KEYS[keyIndex]!;
      keyIndex += 1;
      console.warn("[static-map] Maps key rejected (403); falling back to the next key.");
      res = await fetch(url.replace(encodeURIComponent(rejected), encodeURIComponent(KEY())).replace(rejected, KEY()));
    }
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/png";
    if (!type.startsWith("image/")) return null;
    const bytes = await res.arrayBuffer();
    cache.set(cacheKey, { bytes, type, at: Date.now() });
    if (cache.size > 200) {
      for (const [k, v] of cache) if (Date.now() - v.at > TTL_MS) cache.delete(k);
    }
    return { bytes, type };
  } catch {
    return null;
  }
}
