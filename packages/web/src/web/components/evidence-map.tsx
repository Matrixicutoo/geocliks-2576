import { useEffect, useMemo, useRef, useState } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  Marker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { MapPinOff } from "lucide-react";
import { formatStamp } from "./evidence-card";
import { cn } from "../lib/utils";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

/**
 * Ink/amber dark map styling — legacy JSON styling so no Cloud-console map ID is required.
 *
 * Exported because the route builder's map (`route-map.tsx`) has to look identical; a second copy
 * of 17 style rules would drift the first time one of them is tweaked.
 */
export const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#F4F6F9" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5B6676" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#D7DDE6" }] },
  { featureType: "administrative.land_parcel", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "landscape.man_made", elementType: "geometry", stylers: [{ color: "#EDF1F6" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#E3EEE2" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#E1E6ED" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#FFE7BC" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#F2CE8C" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6E7B8C" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#CFE2F3" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#7C93A8" }] },
];

export type MapPin = {
  id: string;
  lat: number | null;
  lng: number | null;
  photoCode?: string | null;
  capturedAt?: string | Date | null;
  address?: string | null;
  url?: string | null;
  userId?: string | null;
  userName?: string | null;
};

export type Located = MapPin & { lat: number; lng: number };

const located = (pins: MapPin[]): Located[] =>
  pins.filter((p): p is Located => typeof p.lat === "number" && typeof p.lng === "number");

const dayKey = (value: string | Date | null | undefined) =>
  value ? new Date(value).toISOString().slice(0, 10) : "unknown";

const time = (value: string | Date | null | undefined) =>
  value ? new Date(value).getTime() : 0;

/**
 * One polyline per photographer per day, in capture order — the crew's path through the site.
 * Drawn imperatively because the Maps JS API has no declarative polyline in this binding.
 */
function RouteLines({ pins, enabled }: { pins: Located[]; enabled: boolean }) {
  const map = useMap();
  const maps = useMapsLibrary("maps");
  const drawn = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    for (const line of drawn.current) line.setMap(null);
    drawn.current = [];
    if (!map || !maps || !enabled) return;

    const groups = new Map<string, Located[]>();
    for (const pin of pins) {
      const key = `${pin.userId ?? "unknown"}:${dayKey(pin.capturedAt)}`;
      const bucket = groups.get(key);
      if (bucket) bucket.push(pin);
      else groups.set(key, [pin]);
    }

    for (const bucket of groups.values()) {
      if (bucket.length < 2) continue;
      const path = [...bucket]
        .sort((a, b) => time(a.capturedAt) - time(b.capturedAt))
        .map((p) => ({ lat: p.lat, lng: p.lng }));
      drawn.current.push(
        new maps.Polyline({
          map,
          path,
          strokeColor: "#E08A00",
          strokeOpacity: 0,
          geodesic: true,
          icons: [
            {
              icon: { path: "M 0,-1 0,1", strokeOpacity: 0.75, scale: 3 },
              offset: "0",
              repeat: "12px",
            },
          ],
        }),
      );
    }

    return () => {
      for (const line of drawn.current) line.setMap(null);
      drawn.current = [];
    };
  }, [map, maps, pins, enabled]);

  return null;
}

/**
 * Keeps the viewport around the visible pin set.
 * Also re-fits whenever the container resizes: inside the photo drawer the map mounts
 * while the panel is still animating in, and the Maps JS API paints nothing when it is
 * initialised at zero size unless it is nudged once the real size lands.
 */
export function FitBounds({ pins }: { pins: Located[] }) {
  const map = useMap();
  const core = useMapsLibrary("core");

  useEffect(() => {
    if (!map || !core || pins.length === 0) return;

    const fit = () => {
      if (pins.length === 1) {
        map.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
        map.setZoom(17);
        return;
      }
      const bounds = new core.LatLngBounds();
      for (const pin of pins) bounds.extend({ lat: pin.lat, lng: pin.lng });
      map.fitBounds(bounds, 48);
    };

    fit();

    const div = map.getDiv() as HTMLElement | null;
    let frame = 0;
    const observer =
      div && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
              google.maps.event.trigger(map, "resize");
              fit();
            });
          })
        : null;
    observer?.observe(div as HTMLElement);

    const settle = window.setTimeout(() => {
      google.maps.event.trigger(map, "resize");
      fit();
    }, 250);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [map, core, pins]);

  return null;
}

const pinIcon = (active: boolean): google.maps.Symbol => ({
  path: "M 0,-9 C 4.9,-9 9,-4.9 9,0 C 9,6 0,14 0,14 C 0,14 -9,6 -9,0 C -9,-4.9 -4.9,-9 0,-9 Z",
  fillColor: "#FFB021",
  fillOpacity: active ? 1 : 0.9,
  strokeColor: "#0B0E13",
  strokeWeight: 1.6,
  scale: active ? 1.25 : 1,
  anchor: { x: 0, y: 14 } as google.maps.Point,
});

function PinLayer({
  pins,
  onSelect,
}: {
  pins: Located[];
  onSelect?: (id: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={{ lat: pin.lat, lng: pin.lng }}
          title={`${pin.photoCode ?? ""} · ${pin.address ?? ""}`.trim()}
          icon={pinIcon(active === pin.id)}
          onMouseOver={() => setActive(pin.id)}
          onMouseOut={() => setActive(null)}
          onClick={() => onSelect?.(pin.id)}
        />
      ))}
    </>
  );
}

export function EvidenceMap({
  pins,
  onSelect,
  className,
  showRoute = true,
  zoomControl = true,
}: {
  pins: MapPin[];
  onSelect?: (id: string) => void;
  className?: string;
  showRoute?: boolean;
  zoomControl?: boolean;
}) {
  const points = useMemo(() => located(pins), [pins]);

  if (!API_KEY) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-[12px] border border-line bg-ink-2 blueprint p-6 text-center",
          className,
        )}
      >
        <div>
          <MapPinOff className="mx-auto size-5 text-fog" />
          <p className="mono mt-2 text-[10px] uppercase tracking-widest text-fog">
            Map key missing — set VITE_GOOGLE_MAPS_API_KEY
          </p>
        </div>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div
        className={cn(
          "grid place-items-center rounded-[12px] border border-line bg-ink-2 blueprint p-6 text-center",
          className,
        )}
      >
        <div>
          <MapPinOff className="mx-auto size-5 text-fog" />
          <p className="mono mt-2 text-[10px] uppercase tracking-widest text-fog">
            No geotagged captures in view
          </p>
        </div>
      </div>
    );
  }

  const latest = [...points].sort((a, b) => time(b.capturedAt) - time(a.capturedAt))[0];

  return (
    <div className={cn("relative overflow-hidden rounded-[12px] border border-line bg-ink-2", className)}>
      <APIProvider apiKey={API_KEY}>
        <GoogleMap
          className="size-full"
          defaultCenter={{ lat: points[0].lat, lng: points[0].lng }}
          defaultZoom={15}
          styles={MAP_STYLES}
          disableDefaultUI
          zoomControl={zoomControl}
          gestureHandling="greedy"
          clickableIcons={false}
        >
          <PinLayer pins={points} onSelect={onSelect} />
          <RouteLines pins={points} enabled={showRoute} />
          <FitBounds pins={points} />
        </GoogleMap>
      </APIProvider>
      <p className="mono pointer-events-none absolute bottom-2 left-3 z-10 bg-ink/80 px-1.5 py-1 text-[9.5px] uppercase tracking-widest text-fog">
        {points.length} pins · last fix {formatStamp(latest.capturedAt ?? new Date()).slice(0, 16)}
      </p>
    </div>
  );
}
