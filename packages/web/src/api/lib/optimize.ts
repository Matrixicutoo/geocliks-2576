/**
 * Stop ordering for delivery routes.
 *
 * Two backends behind one interface:
 *
 * `local`  — haversine nearest-neighbour seeded, then improved with 2-opt.
 *            Free, needs no API key, and is genuinely good for the <=150 stop
 *            routes this product targets. It is the default.
 *
 * `google` — Google's Route Optimization API, **single-vehicle requests only**.
 *            Google bills per stop in every request, and any request carrying
 *            two or more vehicles falls into the Enterprise Fleet Routing SKU at
 *            $30/1,000 stops instead of $10/1,000. So we assign a driver first
 *            and optimize each driver's route on its own. Never batch drivers.
 *
 * Straight-line distance is converted to road distance with a fixed detour
 * factor and an average urban speed. That is only used for planning ETAs; the
 * real clock is the driver's actual stop completion times.
 */

/** Roads are longer than the crow flies. 1.3 is the usual urban rule of thumb. */
const DETOUR_FACTOR = 1.3;
/** Average door-to-door speed in metres per second (~35 km/h with traffic and parking). */
const AVERAGE_SPEED_MS = 9.7;
const EARTH_RADIUS_M = 6_371_000;

export type OptimizeStop = {
  id: string;
  lat: number;
  lng: number;
  /** Minutes spent at this stop, used for the planned duration. */
  serviceMinutes?: number;
};

export type OptimizePoint = { lat: number; lng: number };

export type OptimizeInput = {
  stops: OptimizeStop[];
  /** Depot / first address. When absent the first stop is used as the anchor. */
  start?: OptimizePoint | null;
  returnToStart?: boolean;
  backend?: "local" | "google";
};

export type OptimizeResult = {
  /** Stop ids in driving order. */
  order: string[];
  /** Planned driving distance in metres, excluding time spent at stops. */
  metres: number;
  /** Planned total seconds: driving + service time. */
  seconds: number;
  optimizer: "local" | "google";
};

/** Great-circle distance in metres. */
export function haversine(a: OptimizePoint, b: OptimizePoint): number {
  const toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad;
  const dLng = (b.lng - a.lng) * toRad;
  const lat1 = a.lat * toRad;
  const lat2 = b.lat * toRad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Road-ish metres between two points. */
function leg(a: OptimizePoint, b: OptimizePoint): number {
  return haversine(a, b) * DETOUR_FACTOR;
}

function totalMetres(points: OptimizePoint[]): number {
  let sum = 0;
  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1];
    const to = points[i];
    if (from && to) sum += leg(from, to);
  }
  return sum;
}

/** Greedy nearest-neighbour ordering from a fixed anchor. */
function nearestNeighbour(stops: OptimizeStop[], anchor: OptimizePoint): OptimizeStop[] {
  const remaining = [...stops];
  const out: OptimizeStop[] = [];
  let cursor: OptimizePoint = anchor;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      if (!candidate) continue;
      const d = haversine(cursor, candidate);
      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = i;
      }
    }
    const [next] = remaining.splice(bestIndex, 1);
    if (!next) break;
    out.push(next);
    cursor = next;
  }

  return out;
}

/**
 * 2-opt improvement: repeatedly reverse a segment when doing so shortens the
 * tour. Capped so a pathological route cannot pin the server.
 */
function twoOpt(
  stops: OptimizeStop[],
  anchor: OptimizePoint,
  end: OptimizePoint | null,
): OptimizeStop[] {
  if (stops.length < 4) return stops;

  const path = [...stops];
  const framed = (): OptimizePoint[] => {
    const points: OptimizePoint[] = [anchor, ...path];
    if (end) points.push(end);
    return points;
  };

  let best = totalMetres(framed());
  let improved = true;
  let passes = 0;
  const maxPasses = 40;

  while (improved && passes < maxPasses) {
    improved = false;
    passes++;
    for (let i = 0; i < path.length - 1; i++) {
      for (let k = i + 1; k < path.length; k++) {
        const trial = [...path.slice(0, i), ...path.slice(i, k + 1).reverse(), ...path.slice(k + 1)];
        const points: OptimizePoint[] = [anchor, ...trial];
        if (end) points.push(end);
        const candidate = totalMetres(points);
        if (candidate < best - 1) {
          path.splice(0, path.length, ...trial);
          best = candidate;
          improved = true;
        }
      }
    }
  }

  return path;
}

function serviceSeconds(stops: OptimizeStop[]): number {
  return stops.reduce((sum, stop) => sum + (stop.serviceMinutes ?? 0) * 60, 0);
}

/** The free solver. */
function optimizeLocal(input: OptimizeInput): OptimizeResult {
  const stops = input.stops;
  const first = stops[0];
  if (stops.length === 0 || !first) {
    return { order: [], metres: 0, seconds: 0, optimizer: "local" };
  }

  const anchor: OptimizePoint = input.start ?? { lat: first.lat, lng: first.lng };
  const end: OptimizePoint | null = input.returnToStart ? anchor : null;

  const seeded = nearestNeighbour(stops, anchor);
  const path = twoOpt(seeded, anchor, end);

  const points: OptimizePoint[] = [anchor, ...path];
  if (end) points.push(end);
  const metres = Math.round(totalMetres(points));

  return {
    order: path.map((s) => s.id),
    metres,
    seconds: Math.round(metres / AVERAGE_SPEED_MS) + serviceSeconds(path),
    optimizer: "local",
  };
}

type GoogleOptimizeResponse = {
  routes?: Array<{
    metrics?: { travelDistanceMeters?: number; travelDuration?: string };
    visits?: Array<{ shipmentIndex?: number }>;
  }>;
};

function parseSeconds(duration: string | undefined): number {
  if (!duration) return 0;
  const n = Number.parseFloat(duration.replace(/s$/, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/**
 * Google Route Optimization, one vehicle per request. Falls back to the local
 * solver on any failure — a route builder must never be blocked by a billing
 * or network problem.
 */
async function optimizeGoogle(input: OptimizeInput): Promise<OptimizeResult> {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY;
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const stops = input.stops;
  const first = stops[0];
  if (!key || !project || !first) return optimizeLocal(input);

  const anchor = input.start ?? { lat: first.lat, lng: first.lng };
  const body = {
    model: {
      shipments: stops.map((stop) => ({
        deliveries: [
          {
            arrivalLocation: { latitude: stop.lat, longitude: stop.lng },
            duration: `${(stop.serviceMinutes ?? 0) * 60}s`,
          },
        ],
      })),
      // Exactly one vehicle. Two or more would move this call to the Enterprise
      // SKU at three times the price per stop.
      vehicles: [
        {
          startLocation: { latitude: anchor.lat, longitude: anchor.lng },
          ...(input.returnToStart
            ? { endLocation: { latitude: anchor.lat, longitude: anchor.lng } }
            : {}),
        },
      ],
    },
  };

  try {
    const res = await fetch(
      `https://routeoptimization.googleapis.com/v1/projects/${project}:optimizeTours?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      },
    );
    if (!res.ok) return optimizeLocal(input);

    const parsed = (await res.json()) as GoogleOptimizeResponse;
    const route = parsed.routes?.[0];
    const visits = route?.visits ?? [];
    const order: string[] = [];
    for (const visit of visits) {
      const stop = typeof visit.shipmentIndex === "number" ? stops[visit.shipmentIndex] : stops[0];
      if (stop && !order.includes(stop.id)) order.push(stop.id);
    }
    if (order.length !== stops.length) return optimizeLocal(input);

    const metres = Math.round(route?.metrics?.travelDistanceMeters ?? 0);
    return {
      order,
      metres,
      seconds: parseSeconds(route?.metrics?.travelDuration) + serviceSeconds(stops),
      optimizer: "google",
    };
  } catch {
    return optimizeLocal(input);
  }
}

/** Order a set of stops. Stops without coordinates must be filtered out by the caller. */
export async function optimizeStops(input: OptimizeInput): Promise<OptimizeResult> {
  if (input.backend === "google") return optimizeGoogle(input);
  return optimizeLocal(input);
}

/**
 * Cheapest-insertion of a single new stop into an already-running order, used by
 * live dispatch mode so a new order never triggers a billed re-optimize.
 * Returns the index the new stop should take. Completed stops are passed as
 * `lockedCount` and are never moved.
 */
export function insertionIndex(
  ordered: OptimizeStop[],
  fresh: OptimizePoint,
  options?: { start?: OptimizePoint | null; lockedCount?: number; returnToStart?: boolean },
): number {
  const locked = Math.max(0, Math.min(options?.lockedCount ?? 0, ordered.length));
  const anchor = options?.start ?? null;

  let bestIndex = ordered.length;
  let bestCost = Number.POSITIVE_INFINITY;

  for (let i = locked; i <= ordered.length; i++) {
    const before = i === 0 ? anchor : (ordered[i - 1] ?? null);
    const after = ordered[i] ?? (options?.returnToStart ? anchor : null);

    const add = (before ? leg(before, fresh) : 0) + (after ? leg(fresh, after) : 0);
    const removed = before && after ? leg(before, after) : 0;
    const cost = add - removed;

    if (cost < bestCost) {
      bestCost = cost;
      bestIndex = i;
    }
  }

  return bestIndex;
}
