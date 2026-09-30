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

/**
 * Our locale codes, as the BCP-47 tags Google wants for turn text.
 *
 * The driver hears these instructions read aloud, so the language has to be his, not the
 * server's: a Montreal driver on the French UI gets "Tournez à gauche sur Rue Belmont", and
 * the phone's French voice can actually pronounce it. Tagalog is the one gap — Google returns
 * no Filipino turn text, so it falls back to English rather than sending back untranslated
 * placeholders.
 */
const GOOGLE_LANGUAGE: Record<string, string> = {
  en: "en-US",
  "fr-CA": "fr-CA",
  es: "es-ES",
  "pt-BR": "pt-BR",
  de: "de-DE",
  it: "it-IT",
  zh: "zh-CN",
  vi: "vi-VN",
  tl: "en-US",
  ar: "ar-SA",
  pl: "pl-PL",
};

function languageTag(locale: string | null | undefined): string {
  return (locale && GOOGLE_LANGUAGE[locale]) || "en-US";
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

type RoutesApiResponse = {
  routes?: Array<{
    duration?: string;
    distanceMeters?: number;
    polyline?: { encodedPolyline?: string };
    legs?: Array<{
      steps?: Array<{
        distanceMeters?: number;
        staticDuration?: string;
        endLocation?: { latLng?: { latitude?: number; longitude?: number } };
        navigationInstruction?: { maneuver?: string; instructions?: string };
      }>;
    }>;
  }>;
};

/** Routes API durations arrive as a protobuf string like "834s". */
function parseSeconds(value: string | undefined): number {
  if (!value) return 0;
  return Math.round(Number.parseFloat(value.replace(/s$/, "")) || 0);
}

/**
 * Routes API maneuvers are SCREAMING_SNAKE ("TURN_LEFT"); the client's icon map and every
 * existing stored leg speak Google's older kebab-case ("turn-left"). Translate at the edge so
 * nothing downstream has to know which endpoint answered.
 */
function normaliseManeuver(maneuver: string | undefined): string | null {
  if (!maneuver) return null;
  return maneuver.toLowerCase().replace(/_/g, "-");
}

/**
 * The current endpoint: Routes API `computeRoutes`.
 *
 * Google stopped enabling the legacy Directions API on new Cloud projects, which is how this
 * silently became a straight-line app — every request came back REQUEST_DENIED and the
 * fallback did its job too quietly to notice. Returns null on any failure so the caller can
 * try the legacy endpoint before giving up on roads altogether.
 */
async function fetchViaRoutesApi(
  from: LatLng,
  to: LatLng,
  key: string,
  language: string,
): Promise<Directions | null> {
  const fieldMask = [
    "routes.duration",
    "routes.distanceMeters",
    "routes.polyline.encodedPolyline",
    "routes.legs.steps.navigationInstruction",
    "routes.legs.steps.endLocation",
    "routes.legs.steps.distanceMeters",
    "routes.legs.steps.staticDuration",
  ].join(",");

  const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: from.lat, longitude: from.lng } } },
      destination: { location: { latLng: { latitude: to.lat, longitude: to.lng } } },
      travelMode: "DRIVE",
      // TRAFFIC_AWARE is the cheap tier of live traffic: good ETAs without the per-request
      // premium of TRAFFIC_AWARE_OPTIMAL, which a per-leg call does not need.
      routingPreference: "TRAFFIC_AWARE",
      // OVERVIEW smooths corners off the line, which on a phone screen reads as the route
      // cutting through buildings. HIGH_QUALITY costs nothing extra and makes the drawn line
      // actually sit on the road.
      polylineQuality: "HIGH_QUALITY",
      // Turn text has to be asked for by name here, unlike the legacy API.
      computeAlternativeRoutes: false,
      languageCode: language,
      units: "METRIC",
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!res.ok) return null;

  const parsed = (await res.json()) as RoutesApiResponse;
  const route = parsed.routes?.[0];
  if (!route) return null;

  const encoded = route.polyline?.encodedPolyline;
  const path = encoded ? decodePolyline(encoded) : [];
  if (path.length < 2) return null;

  const steps: DirectionStep[] = [];
  for (const leg of route.legs ?? []) {
    for (const step of leg.steps ?? []) {
      const instruction = step.navigationInstruction?.instructions?.trim();
      if (!instruction) continue;
      steps.push({
        instruction: stripHtml(instruction),
        metres: Math.round(step.distanceMeters ?? 0),
        seconds: parseSeconds(step.staticDuration),
        at: {
          lat: step.endLocation?.latLng?.latitude ?? to.lat,
          lng: step.endLocation?.latLng?.longitude ?? to.lng,
        },
        maneuver: normaliseManeuver(step.navigationInstruction?.maneuver),
      });
    }
  }

  return {
    path,
    steps,
    metres: Math.round(route.distanceMeters ?? 0),
    seconds: parseSeconds(route.duration),
    provider: "google",
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
export async function fetchDirections(
  from: LatLng,
  to: LatLng,
  locale?: string | null,
): Promise<Directions> {
  const key = apiKey();
  if (!key) return directLine(from, to);
  const language = languageTag(locale);

  // Routes API first: it is the only one Google enables on projects created these days.
  try {
    const viaRoutes = await fetchViaRoutesApi(from, to, key, language);
    if (viaRoutes) return viaRoutes;
  } catch {
    // Fall through to the legacy endpoint below.
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
    url.searchParams.set("origin", `${from.lat},${from.lng}`);
    url.searchParams.set("destination", `${to.lat},${to.lng}`);
    url.searchParams.set("mode", "driving");
    // Live traffic on the ETA. Without it the number is a timetable, and a driver who is
    // told 12 minutes and drives 25 stops believing the app.
    url.searchParams.set("departure_time", "now");
    url.searchParams.set("language", language);
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
