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

/** Marker fill per stop outcome. Light-theme hexes: the map styling is light in both themes. */
const FILL: Record<string, string> = {
  pending: "#FFB021",
  delivered: "#0F9D58",
  failed: "#D93A28",
  skipped: "#4B5A6E",
};

/** Amber is light enough to need dark digits; the rest carry white. */
const LABEL: Record<string, string> = {
  pending: "#0B0E13",
  delivered: "#FFFFFF",
  failed: "#FFFFFF",
  skipped: "#FFFFFF",
};

const CIRCLE = "M 0,-11 A 11,11 0 1,0 0,11 A 11,11 0 1,0 0,-11 Z";

const stopIcon = (status: string): google.maps.Symbol => ({
  path: CIRCLE,
  fillColor: FILL[status] ?? FILL.pending,
  fillOpacity: 1,
  strokeColor: "#FFFFFF",
  strokeWeight: 2,
  scale: 1,
});

/**
 * The driving order, drawn imperatively — this binding has no declarative polyline.
 *
 * Solid rather than the evidence map's dotted line: that one is a trail of where someone has
 * already been, this one is an instruction about where to go next.
 */
function PlanLine({ stops }: { stops: PlanStop[] }) {
  const map = useMap();
  const maps = useMapsLibrary("maps");
  const drawn = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    drawn.current?.setMap(null);
    drawn.current = null;
    if (!map || !maps || stops.length < 2) return;

    drawn.current = new maps.Polyline({
      map,
      path: stops.map((s) => ({ lat: s.lat, lng: s.lng })),
      strokeColor: "#E08A00",
      strokeOpacity: 0.85,
      strokeWeight: 3,
      geodesic: true,
    });

    return () => {
      drawn.current?.setMap(null);
      drawn.current = null;
    };
  }, [map, maps, stops]);

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
  className,
  emptyMessage,
  noKeyMessage,
  onSelect,
}: {
  stops: RouteStopPin[];
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

  // `FitBounds` speaks the evidence map's pin shape; the id and coordinates are all it reads.
  const bounds = useMemo<Located[]>(
    () => points.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng })),
    [points],
  );

  if (!API_KEY) return <Placeholder message={noKeyMessage} className={className} />;
  if (points.length === 0) return <Placeholder message={emptyMessage} className={className} />;

  return (
    <div className={cn("relative overflow-hidden rounded-[12px] border border-line bg-ink-2", className)}>
      <APIProvider apiKey={API_KEY}>
        <GoogleMap
          defaultCenter={{ lat: points[0].lat, lng: points[0].lng }}
          defaultZoom={12}
          styles={MAP_STYLES}
          disableDefaultUI
          zoomControl
          gestureHandling="cooperative"
          className="size-full"
        >
          <PlanLine stops={points} />
          <FitBounds pins={bounds} />
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
