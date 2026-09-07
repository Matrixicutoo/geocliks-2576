import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "./ids";
import { sha256 } from "./verify";

/**
 * Address -> coordinates, with a persistent cache in front of it.
 *
 * Google bills geocoding per request and delivery companies hit the same
 * addresses week after week, so every lookup is cached by a normalized hash of
 * the query text — failures included, so a permanently bad address is not
 * re-billed on every retry. See the cost section of the routes spec.
 *
 * With no server key configured the geocoder degrades quietly: every address
 * comes back `failed`, lands in the route builder's "needs attention" list, and
 * the dispatcher drops the pin by hand. The product still works, it just costs
 * the office a minute per unresolved address.
 */

export type GeocodeResult = {
  ok: boolean;
  address: string | null;
  lat: number | null;
  lng: number | null;
  placeId: string | null;
  /** Where the answer came from — `cache` never costs money. */
  source: "cache" | "google" | "none";
};

export type GeocodeOptions = {
  /** Skip the cache and overwrite it with a fresh answer — the dispatcher's "try again". */
  force?: boolean;
};

const FAILED: GeocodeResult = {
  ok: false,
  address: null,
  lat: null,
  lng: null,
  placeId: null,
  source: "none",
};

/** Collapse whitespace and case so "12  Main St" and "12 Main st" share a cache row. */
function normalize(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

function apiKey(): string | undefined {
  return process.env.GOOGLE_MAPS_SERVER_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
}

/** True when the server can actually geocode — the route builder warns the office if not. */
export function geocodingAvailable(): boolean {
  return Boolean(apiKey());
}

type GoogleGeocodeResponse = {
  status?: string;
  results?: Array<{
    formatted_address?: string;
    place_id?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
  }>;
};

/**
 * One lookup attempt. `cacheable` separates "Google answered, and this is the
 * permanent truth about the address" from "the request itself did not go
 * through". Only the former may be written to the cache — otherwise a misconfigured
 * API key or a spent quota would poison every address it touched, permanently,
 * and the office would keep seeing "Not located" long after the key was fixed.
 */
type Attempt = { result: GeocodeResult; cacheable: boolean };

/** Google statuses that describe the address itself rather than the request. */
const PERMANENT_STATUSES = new Set(["ZERO_RESULTS", "NOT_FOUND"]);

async function callGoogle(query: string, region?: string): Promise<Attempt> {
  const key = apiKey();
  if (!key) return { result: FAILED, cacheable: false };

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("key", key);
  if (region) url.searchParams.set("region", region);

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return { result: FAILED, cacheable: false };
    const body = (await res.json()) as GoogleGeocodeResponse;
    const hit = body.results?.[0];
    const lat = hit?.geometry?.location?.lat;
    const lng = hit?.geometry?.location?.lng;

    if (body.status === "OK" && typeof lat === "number" && typeof lng === "number") {
      return {
        result: {
          ok: true,
          address: hit?.formatted_address ?? null,
          lat,
          lng,
          placeId: hit?.place_id ?? null,
          source: "google",
        },
        cacheable: true,
      };
    }

    // REQUEST_DENIED / OVER_QUERY_LIMIT / INVALID_REQUEST / UNKNOWN_ERROR are all
    // about the request, so they stay retryable once the account is sorted out.
    return { result: FAILED, cacheable: PERMANENT_STATUSES.has(body.status ?? "") };
  } catch {
    // Network trouble is not a permanent failure, so it is deliberately not cached below.
    return { result: FAILED, cacheable: false };
  }
}

/**
 * Geocode one address. Cache hits never touch the network.
 * `region` is a ccTLD bias like "ca" — it stops "Moncton" resolving to another country.
 */
export async function geocode(
  query: string,
  region = "ca",
  opts: GeocodeOptions = {},
): Promise<GeocodeResult> {
  const normalized = normalize(query);
  if (!normalized) return FAILED;

  const hash = await sha256(new TextEncoder().encode(normalized));

  if (!opts.force) {
    const [cached] = await db
      .select()
      .from(schema.geocodes)
      .where(eq(schema.geocodes.queryHash, hash))
      .limit(1);

    if (cached) {
      return {
        ok: cached.result === "ok",
        address: cached.address,
        lat: cached.lat,
        lng: cached.lng,
        placeId: cached.placeId,
        source: "cache",
      };
    }
  }

  if (!apiKey()) return FAILED;

  const { result: fresh, cacheable } = await callGoogle(normalized, region);

  // Only persist a definitive answer about the address itself.
  if (cacheable) {
    const row = {
      address: fresh.address,
      lat: fresh.lat,
      lng: fresh.lng,
      placeId: fresh.placeId,
      result: fresh.ok ? ("ok" as const) : ("failed" as const),
      source: "google",
    };
    try {
      await db
        .insert(schema.geocodes)
        .values({ id: id("geo"), queryHash: hash, query: normalized, ...row })
        .onConflictDoUpdate({ target: schema.geocodes.queryHash, set: row });
    } catch {
      // A racing insert on the same address is harmless — the cache is best effort.
    }
  }

  return fresh;
}

/**
 * Geocode a batch, sequentially with a small gap so a 120-stop paste does not
 * trip Google's per-second quota. Results come back in input order.
 */
export async function geocodeAll(
  queries: string[],
  region = "ca",
  opts: GeocodeOptions = {},
): Promise<GeocodeResult[]> {
  const out: GeocodeResult[] = [];
  for (const query of queries) {
    out.push(await geocode(query, region, opts));
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
  return out;
}
