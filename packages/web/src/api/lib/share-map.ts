/**
 * Handler behind `GET /api/share/:token/map.png` — the public share page's map.
 *
 * It is a plain HTTP route (not an oRPC procedure) because it returns image bytes, and it is scoped
 * to a valid share token so it can never be used as an open Google Maps proxy.
 */
import { and, desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { fetchStaticMap, placeholderSvg, staticMapUrl, type StaticMapPoint } from "./static-map";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const svg = (label: string, w: number, h: number, status: number) =>
  new Response(placeholderSvg(label, w, h), {
    status,
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "no-store" },
  });

export async function shareMapImage(token: string, url: URL): Promise<Response> {
  const width = clamp(Number(url.searchParams.get("w")) || 1280, 200, 640 * 2);
  const height = clamp(Number(url.searchParams.get("h")) || 360, 120, 640 * 2);
  const showRoute = url.searchParams.get("route") !== "0";

  const [link] = await db
    .select()
    .from(schema.shareLinks)
    .where(eq(schema.shareLinks.token, token));
  const expired = link?.expiresAt ? link.expiresAt.getTime() < Date.now() : false;
  if (!link || link.revoked || expired) return svg("LINK NOT AVAILABLE", width, height, 404);

  // Must match the photos the /share page itself lists: a single-photo link maps that one fix,
  // a project link maps that project, and only a workspace-wide link maps the whole org. Without
  // the photoId case a one-photo link plotted every location in the workspace.
  const filters = [eq(schema.photos.orgId, link.orgId)];
  if (link.photoId) filters.push(eq(schema.photos.id, link.photoId));
  else if (link.projectId) filters.push(eq(schema.photos.projectId, link.projectId));
  const rows = await db
    .select({
      lat: schema.photos.lat,
      lng: schema.photos.lng,
      userId: schema.photos.userId,
      capturedAt: schema.photos.capturedAt,
    })
    .from(schema.photos)
    .where(and(...filters))
    .orderBy(desc(schema.photos.capturedAt))
    .limit(120);

  const points: StaticMapPoint[] = [];
  for (const r of rows) {
    if (typeof r.lat !== "number" || typeof r.lng !== "number") continue;
    points.push({ lat: r.lat, lng: r.lng, userId: r.userId, capturedAt: r.capturedAt });
  }
  if (points.length === 0) return svg("NO GPS FIX", width, height, 200);

  // Static Maps caps a single image at 640px per side; scale=2 doubles the pixels, not the extent.
  const scale = width > 640 || height > 640 ? 2 : 1;
  const requestUrl = staticMapUrl(points, {
    width: Math.round(width / scale),
    height: Math.round(height / scale),
    scale,
    showRoute,
  });
  if (!requestUrl) return svg("MAP UNAVAILABLE", width, height, 200);

  const key = `${token}:${width}x${height}:${showRoute ? 1 : 0}:${points.length}`;
  const image = await fetchStaticMap(key, requestUrl);
  if (!image) return svg("MAP UNAVAILABLE", width, height, 200);

  return new Response(image.bytes, {
    status: 200,
    headers: {
      "content-type": image.type,
      // Short cache: pins move as the crew keeps capturing, but repeat viewers shouldn't each
      // trigger a billable Static Maps request.
      "cache-control": "public, max-age=300",
    },
  });
}
