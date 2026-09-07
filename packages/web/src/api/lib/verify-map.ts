/**
 * Handler behind `GET /api/verify/:code/map.png` — the map on the public code page (/v/:code).
 *
 * Same reasoning as the share page's map (lib/share-map.ts): it is a plain HTTP route rather than
 * an oRPC procedure because it returns image bytes, and the Maps key stays on the server so an
 * unauthenticated page never carries it. Scoped to a real photo code and to that photo's single
 * GPS fix, so it cannot be used as an open Google Maps proxy.
 *
 * The coordinates it plots are already printed on the same page in the LOCATION field, so this
 * exposes nothing the code lookup did not already return.
 */
import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { normalizeCode } from "./photo-code";
import { fetchStaticMap, placeholderSvg, staticMapUrl } from "./static-map";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const svg = (label: string, w: number, h: number, status: number) =>
  new Response(placeholderSvg(label, w, h), {
    status,
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "no-store" },
  });

export async function verifyMapImage(rawCode: string, url: URL): Promise<Response> {
  const width = clamp(Number(url.searchParams.get("w")) || 1280, 200, 640 * 2);
  const height = clamp(Number(url.searchParams.get("h")) || 320, 120, 640 * 2);

  const code = normalizeCode(rawCode);
  if (!code) return svg("UNKNOWN CODE", width, height, 404);

  const [photo] = await db
    .select({ lat: schema.photos.lat, lng: schema.photos.lng })
    .from(schema.photos)
    .where(eq(schema.photos.photoCode, code));
  if (!photo) return svg("UNKNOWN CODE", width, height, 404);
  if (typeof photo.lat !== "number" || typeof photo.lng !== "number") {
    return svg("NO GPS FIX", width, height, 200);
  }

  // Static Maps caps a single image at 640px per side; scale=2 doubles the pixels, not the extent.
  const scale = width > 640 || height > 640 ? 2 : 1;
  const requestUrl = staticMapUrl([{ lat: photo.lat, lng: photo.lng }], {
    width: Math.round(width / scale),
    height: Math.round(height / scale),
    scale,
    showRoute: false,
  });
  if (!requestUrl) return svg("MAP UNAVAILABLE", width, height, 200);

  const image = await fetchStaticMap(`v:${code}:${width}x${height}`, requestUrl);
  if (!image) return svg("MAP UNAVAILABLE", width, height, 200);

  return new Response(image.bytes, {
    status: 200,
    headers: {
      "content-type": image.type,
      // A verified photo's fix never moves, so this can cache longer than the share page's map.
      "cache-control": "public, max-age=86400",
    },
  });
}
