/**
 * Driving directions for one leg — the driver's current position to the next stop's pin.
 *
 * This exists because GeoCliks navigates inside itself rather than handing the driver to
 * Google Maps. The handoff was free, but it cost us the screen: once Maps was in front, the
 * app was in the background, and the proof-of-delivery photo depended on the driver
 * remembering to swipe back. Owning the screen means the arrival card can put the camera in
 * front of him the moment he pulls up.
 *
 * Google bills per Directions request, so this is deliberately one request per leg, asked for
 * when the driver opens the map and re-asked only when he has genuinely left the line (see
 * OFF_ROUTE_M on the client). With no server key configured it degrades to a straight line
 * between the two points: the map still draws, the distance is still roughly right, and the
 * driver still gets a pin to steer at — he just gets no turn list.
 */

export type LatLng = { lat: number; lng: number };

export type DirectionStep = {
  /** Plain text, already stripped of Google's HTML. */
  instruction: string;
  metres: number;
  seconds: number;
  /** Where the step ends — what the client highlights as "next turn". */
  at: LatLng;
  /** Google's own maneuver token ("turn-left", "roundabout-right"), for picking an icon. */
  maneuver: string | null;
};

export type Directions = {
  /** The line to draw, origin first. */
  path: LatLng[];
  steps: DirectionStep[];
  metres: number;
  seconds: number;
  /** `direct` means no key or Google refused: the path is the straight line. */
  provider: "google" | "direct";
};

function apiKey(): string | undefined {
  return process.env.GOOGLE_MAPS_SERVER_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
}

/** True when the server can fetch real turn-by-turn. The nav screen says so if not. */
export function directionsAvailable(): boolean {
  return Boolean(apiKey());
}

/**
 * Google's encoded polyline, back to points.
 *
 * The format packs signed deltas of 1e-5 degrees into 5-bit chunks, high bit set on every
 * chunk but the last. Decoding it here rather than shipping a client library keeps the phone
 * bundle unchanged and means the mobile app only ever sees plain coordinates.
 */
export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    for (const axis of ["lat", "lng"] as const) {
      let result = 0;
      let shift = 0;
      let byte: number;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        if (Number.isNaN(byte)) return points;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      // Zig-zag: the low bit is the sign.
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === "lat") lat += delta;
      else lng += delta;
    }
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

/** Google wraps its instructions in markup meant for an info window. */
function stripHtml(html: string): string {
  return html
    .replace(/<div[^>]*>/gi, " · ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Metres between two pins. Haversine — the same one the arrival gate uses. */
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
 * The no-key, no-network answer: a straight line and an honest guess at the drive.
 *
 * 1.35x for the road being longer than the crow's flight and 38 km/h for city driving are the
 * same assumptions the local optimizer makes, so a route's plan and its legs agree.
 */
function directLine(from: LatLng, to: LatLng): Directions {
  const straight = metresBetween(from, to);
  const metres = Math.round(straight * 1.35);
  return {
    path: [from, to],
    steps: [],
    metres,
    seconds: Math.round(metres / (38_000 / 3600)),
    provider: "direct",
  };
}

type GoogleDirectionsResponse = {
  status?: string;
  routes?: Array<{
    overview_polyline?: { points?: string };
    legs?: Array<{
      distance?: { value?: number };
      duration?: { value?: number };
      steps?: Array<{
        html_instructions?: string;
        maneuver?: string;
        distance?: { value?: number };
        duration?: { value?: number };
        end_location?: { lat?: number; lng?: number };
      }>;
    }>;
  }>;
};

/**
 * One leg of driving. Never throws and never returns nothing: a failure of any kind — no key,
 * a spent quota, a dead network in a valley — falls back to the straight line, because a
 * driver holding a parcel needs a direction to point in more than he needs an error.
 */
export async function fetchDirections(from: LatLng, to: LatLng): Promise<Directions> {
  const key = apiKey();
  if (!key) return directLine(from, to);

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
    url.searchParams.set("origin", `${from.lat},${from.lng}`);
    url.searchParams.set("destination", `${to.lat},${to.lng}`);
    url.searchParams.set("mode", "driving");
    // Live traffic on the ETA. Without it the number is a timetable, and a driver who is
    // told 12 minutes and drives 25 stops believing the app.
    url.searchParams.set("departure_time", "now");
    url.searchParams.set("key", key);

    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return directLine(from, to);

    const parsed = (await res.json()) as GoogleDirectionsResponse;
    const route = parsed.routes?.[0];
    const leg = route?.legs?.[0];
    if (parsed.status !== "OK" || !route || !leg) return directLine(from, to);

    const encoded = route.overview_polyline?.points;
    const path = encoded ? decodePolyline(encoded) : [];
    if (path.length < 2) return directLine(from, to);

    const steps: DirectionStep[] = (leg.steps ?? []).map((step) => ({
      instruction: stripHtml(step.html_instructions ?? ""),
      metres: Math.round(step.distance?.value ?? 0),
      seconds: Math.round(step.duration?.value ?? 0),
      at: {
        lat: step.end_location?.lat ?? to.lat,
        lng: step.end_location?.lng ?? to.lng,
      },
      maneuver: step.maneuver ?? null,
    }));

    return {
      path,
      steps: steps.filter((s) => s.instruction.length > 0),
      metres: Math.round(leg.distance?.value ?? 0),
      seconds: Math.round(leg.duration?.value ?? 0),
      provider: "google",
    };
  } catch {
    return directLine(from, to);
  }
}
