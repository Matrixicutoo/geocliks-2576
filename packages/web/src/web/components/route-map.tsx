import { useEffect, useMemo, useRef } from "react";
import { APIProvider, Map as GoogleMap, Marker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPinOff } from "lucide-react";
import { FitBounds, MAP_STYLES, type Located } from "./evidence-map";
import { cn } from "../lib/utils";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

/**
 * The route builder's map.
 *
 * Deliberately NOT `EvidenceMap`: that one plots photos, labels pins with photo codes and draws a
 * dotted line per photographer per day. A planned route is a different thing — the stops are
 * numbered, the order is the whole point, and the line is one solid path in stop order. It shares
 * `MAP_STYLES` and `FitBounds` with the evidence map so the two never drift visually.
 *
 * Stops that have not been geocoded simply are not on the map; the page says how many so nobody
 * mistakes a short line for a short route.
 */
export type RouteStopPin = {
  id: string;
  lat: number | null;
  lng: number | null;
  address?: string | null;
  addressRaw?: string | null;
  recipientName?: string | null;
  status?: string | null;
};

type PlanStop = RouteStopPin & { lat: number; lng: number; label: string };

/** Where the run starts — the depot, the yard, the driver's own driveway. */
export type StartPin = { lat: number; lng: number; address?: string | null };

/**
 * Marker fill per stop outcome. Light-theme hexes: the map styling is light in both themes.
 *
 * `done` is the same green as `delivered`: older runs closed their stops under that word, and a
 * finished drop showing an amber "still coming" pin is a lie the dispatcher has to chase.
 */
const FILL: Record<string, string> = {
  pending: "#FFB021",
  delivered: "#0F9D58",
  done: "#0F9D58",
  failed: "#D93A28",
  skipped: "#4B5A6E",
};

/** Amber is light enough to need dark digits; the rest carry white. */
const LABEL: Record<string, string> = {
  pending: "#0B0E13",
  delivered: "#FFFFFF",
  done: "#FFFFFF",
  failed: "#FFFFFF",
  skipped: "#FFFFFF",
};

const CIRCLE = "M 0,-11 A 11,11 0 1,0 0,11 A 11,11 0 1,0 0,-11 Z";
/** A square, so the depot never reads as "stop zero" among the round drops. */
const SQUARE = "M -10,-10 L 10,-10 L 10,10 L -10,10 Z";

const stopIcon = (status: string): google.maps.Symbol => ({
  path: CIRCLE,
  fillColor: FILL[status] ?? FILL.pending,
  fillOpacity: 1,
  strokeColor: "#FFFFFF",
  strokeWeight: 2,
  scale: 1,
});

const START_ICON: google.maps.Symbol = {
  path: SQUARE,
  fillColor: "#0B0E13",
  fillOpacity: 1,
  strokeColor: "#FFB021",
  strokeWeight: 2.5,
  scale: 1,
};

/**
 * The driving order, drawn imperatively — this binding has no declarative polyline.
 *
 * Solid rather than the evidence map's dotted line: that one is a trail of where someone has
 * already been, this one is an instruction about where to go next.
 */
function PlanLine({
  stops,
  start,
  returnToStart,
}: {
  stops: PlanStop[];
  start: StartPin | null;
  returnToStart: boolean;
}) {
  const map = useMap();
  const maps = useMapsLibrary("maps");
  const drawn = useRef<google.maps.Polyline | null>(null);

  /**
   * The driving order as the driver actually drives it: out of the yard, round the drops, and
   * back to the yard when the run is booked to return there. Before this the line began at the
   * first drop, which is what made a set start address look like it had been ignored.
   */
  const path = useMemo(() => {
    const points: google.maps.LatLngLiteral[] = stops.map((s) => ({ lat: s.lat, lng: s.lng }));
    if (start) {
      points.unshift({ lat: start.lat, lng: start.lng });
      if (returnToStart) points.push({ lat: start.lat, lng: start.lng });
    }
    return points;
  }, [stops, start, returnToStart]);

  useEffect(() => {
    drawn.current?.setMap(null);
    drawn.current = null;
    if (!map || !maps || path.length < 2) return;

    drawn.current = new maps.Polyline({
      map,
      path,
      strokeColor: "#E08A00",
      strokeOpacity: 0.85,
      strokeWeight: 3,
      geodesic: true,
    });

    return () => {
      drawn.current?.setMap(null);
      drawn.current = null;
    };
  }, [map, maps, path]);

  return null;
}

function Placeholder({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-[12px] border border-line bg-ink-2 p-6 text-center",
        className,
      )}
    >
      <div>
        <MapPinOff className="mx-auto size-5 text-fog" />
        <p className="mt-2 text-[12.5px] text-fog">{message}</p>
      </div>
    </div>
  );
}

export function RouteMap({
  stops,
  start,
  returnToStart = false,
  startLabel,
  returnLabel,
  className,
  emptyMessage,
  noKeyMessage,
  onSelect,
}: {
  stops: RouteStopPin[];
  /** The run's start point, when it has one that could be placed on the map. */
  start?: { lat: number | null; lng: number | null; address?: string | null } | null;
  returnToStart?: boolean;
  /** Marker tooltips, passed in already translated. */
  startLabel?: string;
  returnLabel?: string;
  className?: string;
  emptyMessage: string;
  noKeyMessage: string;
  onSelect?: (id: string) => void;
}) {
  /**
   * Numbered in the order they appear on the map, not by database `seq`: an unlocated stop in the
   * middle would otherwise leave a gap in the numbers and read like a missing pin.
   */
  const points = useMemo<PlanStop[]>(
    () =>
      stops
        .filter((s): s is RouteStopPin & { lat: number; lng: number } =>
          typeof s.lat === "number" && typeof s.lng === "number",
        )
        .map((s, i) => ({ ...s, label: String(i + 1) })),
    [stops],
  );

  const anchor = useMemo<StartPin | null>(
    () =>
      start && typeof start.lat === "number" && typeof start.lng === "number"
        ? { lat: start.lat, lng: start.lng, address: start.address ?? null }
        : null,
    [start],
  );

  // `FitBounds` speaks the evidence map's pin shape; the id and coordinates are all it reads.
  // The depot is framed with the drops — a start an hour out of town is the whole point of
  // setting one, and a map that crops it out hides the longest leg of the run.
  const bounds = useMemo<Located[]>(() => {
    const pins: Located[] = points.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng }));
    if (anchor) pins.push({ id: "route-start", lat: anchor.lat, lng: anchor.lng });
    return pins;
  }, [points, anchor]);

  const centre = points[0] ?? anchor;

  if (!API_KEY) return <Placeholder message={noKeyMessage} className={className} />;
  if (!centre) return <Placeholder message={emptyMessage} className={className} />;

  return (
    <div className={cn("relative overflow-hidden rounded-[12px] border border-line bg-ink-2", className)}>
      <APIProvider apiKey={API_KEY}>
        <GoogleMap
          defaultCenter={{ lat: centre.lat, lng: centre.lng }}
          defaultZoom={12}
          styles={MAP_STYLES}
          disableDefaultUI
          zoomControl
          /**
           * The dispatcher's map is a thing to work in, not a picture to look at: the wheel zooms
           * directly, satellite and terrain are a click away for reading an industrial park or a
           * rural drop, and fullscreen gets the whole run on the screen at once. `greedy` rather
           * than `cooperative` because this map is never a scroll hazard inside a short page —
           * it is tall enough that the cursor is over it on purpose.
           */
          gestureHandling="greedy"
          mapTypeControl
          mapTypeId="roadmap"
          // No `position`: the enum only exists once the Maps script has loaded, and naming it at
          // module scope throws before the map ever mounts.
          mapTypeControlOptions={{ mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain"] }}
          fullscreenControl
          scaleControl
          streetViewControl
          className="size-full"
        >
          <PlanLine stops={points} start={anchor} returnToStart={returnToStart} />
          <FitBounds pins={bounds} />
          {anchor && (
            <Marker
              position={{ lat: anchor.lat, lng: anchor.lng }}
              title={[startLabel, anchor.address, returnToStart ? returnLabel : null]
                .filter(Boolean)
                .join(" · ")}
              icon={START_ICON}
              label={{ text: "S", color: "#FFB021", fontSize: "10px", fontWeight: "700" }}
              zIndex={2}
            />
          )}
          {points.map((p) => (
            <Marker
              key={p.id}
              position={{ lat: p.lat, lng: p.lng }}
              title={[p.label, p.address ?? p.addressRaw, p.recipientName].filter(Boolean).join(" · ")}
              icon={stopIcon(p.status ?? "pending")}
              label={{
                text: p.label,
                color: LABEL[p.status ?? "pending"] ?? LABEL.pending,
                fontSize: "11px",
                fontWeight: "700",
              }}
              onClick={() => onSelect?.(p.id)}
            />
          ))}
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
