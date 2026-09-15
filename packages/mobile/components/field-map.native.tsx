import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  type MapStyleElement,
  type Region,
} from "react-native-maps";
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
  layerControl?: boolean;
};

type Located = FieldPin & { lat: number; lng: number };

/** Mirrors MAP_STYLES in packages/web/src/web/components/evidence-map.tsx. */
const MAP_STYLE: MapStyleElement[] = [
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

/**
 * Zoomed-in variant of the same look — mirrors MAP_STYLES_DETAILED on the web map. The wide view
 * hides POI and parcel labels so a site reads as pins and streets; zoomed in, those labels are
 * exactly what tells you WHICH building a photo was taken at, so they come back.
 */
const MAP_STYLE_DETAILED: MapStyleElement[] = MAP_STYLE.filter(
  (rule) =>
    !(
      (rule.featureType === "poi" || rule.featureType === "administrative.land_parcel") &&
      rule.elementType === "labels"
    ),
).concat([
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6E7B8C" }] },
  { featureType: "poi.business", elementType: "labels.icon", stylers: [{ saturation: -45 }] },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8A95A5" }],
  },
]);

/**
 * Below this span the view is tight enough that street numbers and business names are readable
 * rather than clutter. ~0.004° of longitude is a couple of blocks — the web map switches at zoom
 * 17, and this is the same view expressed the way react-native-maps reports it.
 */
const DETAIL_SPAN = 0.004;

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
  layerControl = true,
}: FieldMapProps) {
  const c = Colors.dark;
  const [open, setOpen] = useState(false);
  const [mapType, setMapType] = useState<"standard" | "hybrid">("standard");
  const [detail, setDetail] = useState(false);
  // Once the user picks for themselves, zoom stops deciding for them.
  const [detailPinned, setDetailPinned] = useState(false);
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
        // Satellite imagery carries its own labels and Google ignores custom styling over it, so
        // the palette is dropped there. "hybrid" is imagery WITH roads and names — the only
        // satellite worth having for locating a job site.
        mapType={mapType}
        customMapStyle={
          mapType === "hybrid" ? [] : detail ? MAP_STYLE_DETAILED : MAP_STYLE
        }
        initialRegion={initial.current ?? undefined}
        onRegionChangeComplete={(region) => {
          if (detailPinned) return;
          setDetail(region.longitudeDelta <= DETAIL_SPAN);
        }}
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

      {layerControl ? (
        <View style={styles.layers} pointerEvents="box-none">
          <Pressable
            onPress={() => setOpen((v) => !v)}
            accessibilityLabel="Map layers"
            style={[styles.layerBtn, { borderColor: c.border }]}
          >
            <Ionicons name="layers-outline" size={16} color={open ? c.amber : c.mutedForeground} />
          </Pressable>

          {open ? (
            <View style={[styles.layerPanel, { borderColor: c.border }]}>
              <Text
                style={[styles.panelLabel, { color: c.mutedForeground, fontFamily: Fonts?.mono }]}
              >
                MAP TYPE
              </Text>
              <View style={styles.typeRow}>
                {(
                  [
                    { id: "standard", label: "MAP" },
                    { id: "hybrid", label: "SATELLITE" },
                  ] as const
                ).map((option) => (
                  <Pressable
                    key={option.id}
                    onPress={() => setMapType(option.id)}
                    style={[
                      styles.typeBtn,
                      { borderColor: mapType === option.id ? c.amber : c.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        {
                          color: mapType === option.id ? c.amber : c.mutedForeground,
                          fontFamily: Fonts?.mono,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={() => {
                  setDetailPinned(true);
                  setDetail((v) => !v);
                }}
                style={[styles.detailRow, { borderColor: c.border }]}
              >
                <Ionicons
                  name={detail ? "checkbox" : "square-outline"}
                  size={15}
                  color={detail ? c.amber : c.mutedForeground}
                />
                <Text
                  style={[styles.typeText, { color: c.mutedForeground, fontFamily: Fonts?.mono }]}
                >
                  STREET DETAIL
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

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
  layers: { position: "absolute", top: 8, right: 8, alignItems: "flex-end", gap: 8 },
  layerBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "rgba(11,14,19,0.88)",
  },
  layerPanel: {
    width: 176,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
    backgroundColor: "rgba(11,14,19,0.95)",
  },
  panelLabel: { fontSize: 9, letterSpacing: 1.2 },
  typeRow: { flexDirection: "row", gap: 6 },
  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center",
  },
  typeText: { fontSize: 9, letterSpacing: 1.1 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderTopWidth: 1,
    paddingTop: 8,
  },
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
