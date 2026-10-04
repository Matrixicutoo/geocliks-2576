import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

/**
 * How close to the pin counts as "at the address".
 *
 * Was 150 m, plus up to 100 m of GPS slack — so the stop could read "Arrived" from roughly 250 m
 * out, a block before the door. The owner wants the delivery to conclude at the address, not on
 * the way to it. 30 m is the door: a rooftop geocode sits on the building, and a phone with a
 * clear sky reads to within 5–15 m. Tighter than that and the gate would fire on GPS noise
 * rather than distance; a pin on the wrong side of a block still has the stop screen's override.
 */
export const ARRIVAL_RADIUS_M = 30;
/** The most a poor fix may count in the driver's favour. Was 100 m, which defeated the radius. */
const MAX_SLACK_M = 15;

/**
 * Whether the driver is standing at the stop.
 *
 *  - `at`: inside the radius. Deliver away.
 *  - `away`: measured, and he is not there yet. `metres` says how far.
 *  - `unknown`: cannot be measured — the stop has no pin, or location is off, denied, or has
 *    not produced a first fix yet. Never blocks: a gate that fires when the phone simply has
 *    not answered yet would strand a driver holding a parcel on a doorstep.
 */
export type Arrival = { state: "at" | "away" | "unknown"; metres: number | null };

const UNKNOWN: Arrival = { state: "unknown", metres: null };

/** Metres between two pins. Haversine on a sphere — plenty for a doorstep check. */
function metresBetween(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/**
 * Watches the phone's position against one stop's pin.
 *
 * A watcher rather than a one-shot read, because the whole point is the moment he pulls up: the
 * button has to come alive on arrival without him thinking to refresh anything. Distance
 * filtered at 5 m: fine enough to notice the last few steps up to the door, coarse enough that a
 * parked van is not waking the app on every GPS wobble.
 *
 * Permission is requested, not assumed — but a refusal downgrades to `unknown` instead of
 * blocking, since the driver's job cannot depend on a dialog he already dismissed.
 */
export function useArrival(
  target: { lat: number | null; lng: number | null } | null,
  enabled: boolean,
): Arrival {
  const [arrival, setArrival] = useState<Arrival>(UNKNOWN);
  const lat = target?.lat ?? null;
  const lng = target?.lng ?? null;
  // Held in a ref so a new fix does not need the effect torn down and rebuilt.
  const pin = useRef<{ lat: number; lng: number } | null>(null);
  pin.current = lat != null && lng != null ? { lat, lng } : null;

  useEffect(() => {
    if (!enabled || lat == null || lng == null) {
      setArrival(UNKNOWN);
      return;
    }
    let sub: Location.LocationSubscription | null = null;
    let live = true;

    /**
     * expo-location's own teardown throws on web: it cancels the watch, then reaches for
     * `removeSubscription` on an emitter that has no such method, and the exception escapes into
     * the render tree and white-screens the app. The watch itself is already cancelled by the
     * time it throws, so swallowing it costs nothing and keeps the driver's screen alive.
     */
    const stopWatching = () => {
      try {
        sub?.remove();
      } catch {
        // Already unwatched; only the library's listener bookkeeping failed.
      }
      sub = null;
    };

    const apply = (pos: Location.LocationObject) => {
      const p = pin.current;
      if (!live || !p) return;
      const metres = metresBetween(pos.coords.latitude, pos.coords.longitude, p.lat, p.lng);
      // The fix's own accuracy counts in his favour, a little: a 10 m-accurate fix 38 m out could
      // really be 28 m out. Capped, because a 100 m-accurate fix is not evidence he is anywhere.
      const slack = Math.min(pos.coords.accuracy ?? 0, MAX_SLACK_M);
      setArrival({
        state: metres - slack <= ARRIVAL_RADIUS_M ? "at" : "away",
        metres: Math.round(metres),
      });
    };

    void (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!live || status !== "granted") {
          setArrival(UNKNOWN);
          return;
        }
        // High accuracy and a 5 m step: "Balanced" is a 100 m fix on iOS, which cannot tell the
        // door from the end of the street. The watch starts first so the first fix of either
        // kind lands without waiting for the other.
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          apply,
        );
        void Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
          .then(apply)
          .catch(() => {});
        // He left the screen while the first fix was still coming in: drop the watcher now, or
        // it keeps the GPS awake for a stop nobody is looking at.
        if (!live) stopWatching();
      } catch {
        // No location hardware, a web browser refusing, a simulator with nothing set: unknown,
        // which is to say the gate stays open.
        if (live) setArrival(UNKNOWN);
      }
    })();

    return () => {
      live = false;
      stopWatching();
    };
  }, [enabled, lat, lng]);

  return arrival;
}

/** "850 m" / "1.2 km", for telling him how far out he still is. */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres / 10) * 10} m`;
  return `${(metres / 1000).toFixed(metres < 10000 ? 1 : 0)} km`;
}
