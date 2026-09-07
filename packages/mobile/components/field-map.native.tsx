import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { Text } from "@/components/app-text";
import { Colors, Fonts } from "@/constants/theme";
import { formatStamp } from "@/components/stamp";

export type FieldPin = {
  id: string;
  lat: number | null;
  lng: number | null;
  photoCode?: string | null;
  address?: string | null;
  capturedAt?: string | Date | null;
  userId?: string | null;
  userName?: string | null;
};

export type FieldMapProps = {
  pins: FieldPin[];
  showRoute?: boolean;
  onSelect?: (id: string) => void;
  height?: number;
};

type Located = FieldPin & { lat: number; lng: number };

/** Mirrors MAP_STYLES in packages/web/src/web/components/evidence-map.tsx. */
const MAP_STYLE = [
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

const time = (value: string | Date | null | undefined) =>
  value ? new Date(value).getTime() : 0;

const dayKey = (value: string | Date | null | undefined) =>
  value ? new Date(value).toISOString().slice(0, 10) : "unknown";

function regionOf(pins: Located[]): Region {
  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.006),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.006),
  };
}

/** One polyline per photographer per day — the crew's path through the site. */
function routes(pins: Located[]) {
  const groups = new Map<string, Located[]>();
  for (const pin of pins) {
    const key = `${pin.userId ?? "unknown"}:${dayKey(pin.capturedAt)}`;
    const bucket = groups.get(key);
    if (bucket) bucket.push(pin);
    else groups.set(key, [pin]);
  }
  return [...groups.entries()]
    .filter(([, bucket]) => bucket.length > 1)
    .map(([key, bucket]) => ({
      key,
      coords: [...bucket]
        .sort((a, b) => time(a.capturedAt) - time(b.capturedAt))
        .map((p) => ({ latitude: p.lat, longitude: p.lng })),
    }));
}

export default function FieldMap({
  pins,
  showRoute = true,
  onSelect,
  height = 260,
}: FieldMapProps) {
  const c = Colors.dark;
  const points = useMemo(
    () =>
      pins.filter(
        (p): p is Located => typeof p.lat === "number" && typeof p.lng === "number",
      ),
    [pins],
  );
  const lines = useMemo(() => (showRoute ? routes(points) : []), [points, showRoute]);
  const initial = useRef<Region | null>(null);
  if (!initial.current && points.length > 0) initial.current = regionOf(points);

  if (points.length === 0) {
    return (
      <View style={[styles.empty, { height, borderColor: c.border, backgroundColor: c.card }]}>
        <Ionicons name="map-outline" size={22} color={c.mutedForeground} />
        <Text style={[styles.label, { color: c.mutedForeground, fontFamily: Fonts?.mono }]}>
          NO GEOTAGGED CAPTURES
        </Text>
      </View>
    );
  }

  const latest = [...points].sort((a, b) => time(b.capturedAt) - time(a.capturedAt))[0];

  return (
    <View style={[styles.wrap, { height, borderColor: c.border }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        customMapStyle={MAP_STYLE}
        initialRegion={initial.current ?? undefined}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {lines.map((line) => (
          <Polyline
            key={line.key}
            coordinates={line.coords}
            strokeColor={c.amberDeep ?? c.amber}
            strokeWidth={2}
            lineDashPattern={[6, 6]}
          />
        ))}
        {points.map((pin) => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.lat, longitude: pin.lng }}
            title={pin.photoCode ?? "CAPTURE"}
            description={pin.address ?? undefined}
            pinColor={c.amber}
            onPress={() => onSelect?.(pin.id)}
          />
        ))}
      </MapView>
      <Text style={[styles.caption, { color: c.mutedForeground, fontFamily: Fonts?.mono }]}>
        {points.length} PINS · LAST FIX{" "}
        {formatStamp(latest.capturedAt ? new Date(latest.capturedAt) : new Date()).slice(0, 16)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, overflow: "hidden", position: "relative", borderRadius: 8 },
  empty: { alignItems: "center", justifyContent: "center", borderWidth: 1, gap: 8, borderRadius: 8 },
  label: { fontSize: 10, letterSpacing: 1.4 },
  caption: {
    position: "absolute",
    bottom: 6,
    left: 8,
    fontSize: 9,
    letterSpacing: 1.1,
    backgroundColor: "rgba(11,14,19,0.8)",
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
});
