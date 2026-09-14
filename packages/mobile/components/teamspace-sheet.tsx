import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/app-text";
import { AuthDoors } from "@/components/auth-gate";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * The "create your Teamspace for free" pitch, shown once per install to a signed-out user who
 * has been on the capture tab a while (see hooks/use-teamspace-nudge.ts).
 *
 * It exists because signed-out capture is a dead end the user cannot see: the shots are on the
 * phone, stamped and verified, and nothing tells them that filing, sharing and the shared
 * verified copy are one account away. `capture.savedLocal` says so under the shutter, but it is
 * a line of small print next to a camera.
 *
 * Drops in from the top, like a notification, rather than rising from the bottom like the
 * assistant and the pickers. Two reasons: the controls the user is actually holding — shutter,
 * mode switch, project and evidence pickers — all live along the bottom of the capture screen,
 * so a bottom sheet lands on top of them and its buttons appear exactly where the shutter was;
 * and everything else that slides up here was opened by a tap, while this one arrives
 * unasked, which is the notification idiom. The viewfinder stays visible below it either way.
 *
 * `Modal`'s own `animationType="slide"` only ever comes from the bottom, so the movement is
 * animated by hand (same pattern as assistant-sheet.tsx) and the modal stays mounted until the
 * sheet has slid back out. The doors themselves are AuthGate's, so both surfaces read
 * identically.
 */
export function TeamspaceSheet({ visible, onClose }: Props) {
  const colors = useColors();
  const tr = useT();
  const insets = useSafeAreaInsets();

  // Kept mounted through the exit animation: the parent drops `visible` the moment it is
  // dismissed, which would otherwise cut the slide-out off at its first frame.
  const [mounted, setMounted] = useState(visible);
  const height = Dimensions.get("window").height;
  const slide = useRef(new Animated.Value(-height)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.parallel([
      Animated.timing(slide, {
        toValue: visible ? 0 : -height,
        duration: visible ? 300 : 200,
        easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: visible ? 1 : 0,
        duration: visible ? 220 : 180,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [visible, height, slide, fade]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel={tr("common.close")}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            // Clear of the status bar and the notch: a sheet pinned to the top edge would
            // otherwise print its badge and title under the clock. Floored at the notch
            // height because a modal sits outside the safe-area provider on some hosts
            // (the web preview reports an inset of 0) and the badge lands under the island.
            paddingTop: Math.max(insets.top, 44) + 16,
            transform: [{ translateY: slide }],
          },
        ]}
      >
        <View style={[styles.badge, { borderColor: colors.amber }]}>
          <Ionicons name="people-outline" size={20} color={colors.amber} />
        </View>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: Fonts?.display }]}>
          {tr("nudge.title")}
        </Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{tr("nudge.body")}</Text>

        <AuthDoors onClose={onClose} />

        {/* The grip moves to the bottom edge with the sheet: it marks the edge the sheet came
            from and would be swiped back towards. */}
        <View style={styles.grip}>
          <View style={[styles.gripBar, { backgroundColor: colors.border }]} />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    borderBottomWidth: 1,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    paddingHorizontal: 22,
    paddingBottom: 12,
    gap: 10,
  },
  grip: { alignItems: "center", marginTop: 6, marginBottom: -4 },
  gripBar: { width: 36, height: 3, borderRadius: 2 },
  badge: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 19, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontSize: 13, lineHeight: 19, marginBottom: 6 },
});
