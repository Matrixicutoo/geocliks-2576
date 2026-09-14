import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
 * A bottom sheet rather than the centred AuthGate card on purpose. The gate answers a tap and
 * has earned the middle of the screen; this one interrupts nothing, so it keeps the viewfinder
 * visible above it and can be swatted away by tapping the picture the user came for. The doors
 * themselves are AuthGate's, so both surfaces read identically.
 */
export function TeamspaceSheet({ visible, onClose }: Props) {
  const colors = useColors();
  const tr = useT();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={tr("common.close")} />
      <View
        style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}
      >
        <View style={styles.grip}>
          <View style={[styles.gripBar, { backgroundColor: colors.border }]} />
        </View>
        <View style={[styles.badge, { borderColor: colors.amber }]}>
          <Ionicons name="people-outline" size={20} color={colors.amber} />
        </View>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: Fonts?.display }]}>
          {tr("nudge.title")}
        </Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{tr("nudge.body")}</Text>

        <AuthDoors onClose={onClose} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    // Clears the home indicator / gesture bar without pulling in a safe-area inset here: the
    // sheet sits over the tab bar, which is already lifted clear of it.
    padding: 22,
    paddingBottom: 34,
    gap: 10,
  },
  grip: { alignItems: "center", marginTop: -10, marginBottom: 4 },
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
