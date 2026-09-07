import { useMemo } from "react";
import { APIProvider, Map as GoogleMap, Marker } from "@vis.gl/react-google-maps";
import { MapPinOff } from "lucide-react";
import { FitBounds, MAP_STYLES, type Located } from "./evidence-map";
import { cn } from "../lib/utils";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

/**
 * The recipient's map on the public tracking page.
 *
 * Deliberately NOT `RouteMap`: that one numbers stops and draws the driving order, because the
 * order is the whole point of a route. A recipient is shown exactly one place - theirs - so a
 * numbered "1" and a path would be meaningless here, and a path between two pins would imply a
 * journey that never happened.
 *
 * It never renders the driver's position. GeoCliks does not track drivers continuously, and a
 * tracking link is held by a stranger; a live driver pin would hand that stranger someone's
 * whereabouts. The live part of this page is the "N drops ahead" count, not a moving dot.
 *
 * Shares `MAP_STYLES` and `FitBounds` with the evidence map so the three maps never drift apart.
 */
export type TrackPin = {
  id: string;
  lat: number;
  lng: number;
  /** `address` is where it was meant to go, `proof` is where the photo was actually captured. */
  kind: "address" | "proof";
  title: string;
};

const CIRCLE = "M 0,-9 A 9,9 0 1,0 0,9 A 9,9 0 1,0 0,-9 Z";

/** Amber for the destination, green for a captured proof - the same language as the route map. */
const FILL: Record<TrackPin["kind"], string> = {
  address: "#FFB021",
  proof: "#0F9D58",
};

const pinIcon = (kind: TrackPin["kind"]): google.maps.Symbol => ({
  path: CIRCLE,
  fillColor: FILL[kind],
  fillOpacity: 1,
  strokeColor: "#FFFFFF",
  strokeWeight: 2,
  scale: 1,
});

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

export function TrackMap({
  pins,
  className,
  emptyMessage,
  noKeyMessage,
}: {
  pins: TrackPin[];
  className?: string;
  emptyMessage: string;
  noKeyMessage: string;
}) {
  // `FitBounds` speaks the evidence map's pin shape; the id and coordinates are all it reads.
  const bounds = useMemo<Located[]>(
    () => pins.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng })),
    [pins],
  );

  if (!API_KEY) return <Placeholder message={noKeyMessage} className={className} />;
  if (pins.length === 0) return <Placeholder message={emptyMessage} className={className} />;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[12px] border border-line bg-ink-2",
        className,
      )}
    >
      <APIProvider apiKey={API_KEY}>
        <GoogleMap
          defaultCenter={{ lat: pins[0].lat, lng: pins[0].lng }}
          defaultZoom={15}
          styles={MAP_STYLES}
          disableDefaultUI
          zoomControl
          gestureHandling="cooperative"
          className="size-full"
        >
          <FitBounds pins={bounds} />
          {pins.map((p) => (
            <Marker
              key={p.id}
              position={{ lat: p.lat, lng: p.lng }}
              title={p.title}
              icon={pinIcon(p.kind)}
            />
          ))}
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
