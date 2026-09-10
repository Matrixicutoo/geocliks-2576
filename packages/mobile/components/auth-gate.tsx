import { Modal, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * The register-or-login prompt shown when a signed-out user reaches for anything beyond
 * the camera.
 *
 * The camera is deliberately public — a new user can open the app and take verified
 * evidence before they have an account. Everything else (Teamspace, projects, routes,
 * messages, video) needs a workspace to belong to, so instead of a silent redirect the
 * user gets an explanation and the two doors: register or log in. A plain redirect was
 * rejected because it leaves the driver staring at a marketing screen with no idea why
 * the tap did not work.
 *
 * Built as a React modal rather than `Alert.alert` so it renders identically on native
 * and in the web preview.
 */
export function AuthGate({ visible, onClose }: Props) {
  const colors = useColors();
  const router = useRouter();
  const tr = useT();

  const go = (href: "/sign-up" | "/sign-in") => {
    onClose();
    router.push(href);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.stage}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={tr("common.close")} />
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.badge, { borderColor: colors.amber }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.amber} />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: Fonts?.display }]}>
            {tr("gate.title")}
          </Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>{tr("gate.body")}</Text>

          <Pressable
            onPress={() => go("/sign-up")}
            style={[styles.primary, { backgroundColor: colors.amber, borderColor: colors.amber }]}
          >
            <Text style={[styles.primaryText, { color: colors.primaryForeground }]}>
              {tr("home.nav.registerFree")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => go("/sign-in")}
            style={[styles.secondary, { borderColor: colors.border }]}
          >
            <Text style={[styles.secondaryText, { color: colors.foreground }]}>
              {tr("home.nav.login")}
            </Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancel} hitSlop={8}>
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
              {tr("gate.cancel")}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  card: { width: "100%", maxWidth: 380, borderWidth: 1, borderRadius: 4, padding: 22, gap: 10 },
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
  primary: { borderWidth: 1, borderRadius: 3, paddingVertical: 13, alignItems: "center" },
  primaryText: { fontSize: 14, letterSpacing: 0.3 },
  secondary: { borderWidth: 1, borderRadius: 3, paddingVertical: 13, alignItems: "center" },
  secondaryText: { fontSize: 14, letterSpacing: 0.3 },
  cancel: { alignItems: "center", paddingVertical: 8 },
  cancelText: { fontSize: 12.5 },
});
