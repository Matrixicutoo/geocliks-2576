import { forwardRef, useImperativeHandle } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { Fonts } from "@/constants/theme";
import { useColors } from "@/hooks/use-colors";

export type NavFix = { lat: number; lng: number; heading: number | null };

export type NavMapHandle = {
  /** Ride the camera behind this fix, turned the way he is driving. A no-op on web. */
  follow: (fix: NavFix) => void;
};

export type NavMapProps = {
  /** Where he is going. Null until the stop has coordinates. */
  pin: { lat: number; lng: number } | null;
  /** The drawn leg, as the server returned it. */
  path: { lat: number; lng: number }[];
  /** Draw the leg dashed, for a straight-line fallback that is not a real road. */
  dashed?: boolean;
  markerTitle?: string | null;
  strokeColor: string;
  /** He moved the map himself, so the camera should stop riding him. */
  onUserPan?: () => void;
};

/**
 * Web fallback — react-native-maps is native-only, so the browser preview says where the map
 * is instead of failing the bundle. The real one is ./nav-map.native.
 */
const NavMap = forwardRef<NavMapHandle, NavMapProps>(function NavMap({ path }, ref) {
  const c = useColors();
  useImperativeHandle(ref, () => ({ follow: () => {} }));
  return (
    <View style={[StyleSheet.absoluteFill, styles.wrap, { backgroundColor: c.card }]}>
      <Ionicons name="navigate-outline" size={22} color={c.mutedForeground} />
      <Text style={[styles.label, { color: c.mutedForeground, fontFamily: Fonts?.mono }]}>
        TURN-BY-TURN AVAILABLE ON DEVICE
      </Text>
      <Text style={[styles.sub, { color: c.mutedForeground, fontFamily: Fonts?.mono }]}>
        {path.length} POINTS ON THIS LEG
      </Text>
    </View>
  );
});

export default NavMap;

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", gap: 8 },
  label: { fontSize: 10, letterSpacing: 1.4 },
  sub: { fontSize: 9, letterSpacing: 1.2, opacity: 0.7 },
});
