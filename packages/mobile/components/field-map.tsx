import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { Fonts } from "@/constants/theme";
import { useColors } from "@/hooks/use-colors";

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

/**
 * Web fallback — react-native-maps has no browser implementation, so the Expo
 * web preview shows an explicit panel instead of a broken bundle.
 */
export default function FieldMap({ pins, height = 260 }: FieldMapProps) {
  const c = useColors();
  const located = pins.filter((p) => p.lat != null && p.lng != null);
  return (
    <View style={[styles.wrap, { height, borderColor: c.border, backgroundColor: c.card }]}>
      <Ionicons name="map-outline" size={22} color={c.mutedForeground} />
      <Text style={[styles.label, { color: c.mutedForeground, fontFamily: Fonts?.mono }]}>
        LIVE MAP AVAILABLE ON DEVICE
      </Text>
      <Text style={[styles.sub, { color: c.mutedForeground, fontFamily: Fonts?.mono }]}>
        {located.length} GEOTAGGED CAPTURES
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    gap: 8,
    borderRadius: 8,
  },
  label: { fontSize: 10, letterSpacing: 1.4 },
  sub: { fontSize: 9, letterSpacing: 1.2, opacity: 0.7 },
});
