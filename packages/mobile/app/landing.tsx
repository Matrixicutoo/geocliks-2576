import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import { LanguageMenu } from "@/components/language-menu";
import { LogoMark } from "@/components/logo";
import { openWebSignUp } from "@/lib/web-signup";
import { SUPPORT_EMAIL } from "../constants/support";

/**
 * Pre-login screen for the installed app.
 *
 * Deliberately short: whoever opens this already downloaded GeoCliks, so there is
 * nothing left to sell and no app to install. One line of what the product does,
 * then the only two things they can do — sign in or create a free account — plus
 * the public photo-code lookup, which needs no account at all.
 *
 * The full marketing story lives on the website (`/`) and the crew page
 * (`/get-app`); this screen intentionally does not repeat either.
 */

const HEADER_BG = "#0d2137";

export default function Landing() {
  const colors = useColors();
  const t = useT();
  const router = useRouter();

  /**
   * "Register free" does what it says: it opens the website's sign-up page in the browser,
   * because accounts cannot be created natively (Turnstile has no React Native widget).
   * "Login" stays in the app. If every route to a browser is blocked — which happens inside
   * the preview's iframe — we show the address rather than leave a dead button.
   */
  const [blockedUrl, setBlockedUrl] = useState<string | null>(null);

  const register = async () => {
    setBlockedUrl(await openWebSignUp());
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: HEADER_BG }}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.mark}>
            <LogoMark size={30} />
          </View>
          <View>
            <Text style={[styles.brand, { fontFamily: Fonts?.display }]}>
              GEO<Text style={{ color: colors.amber }}>CLIKS</Text>
            </Text>
            <Text style={[styles.brandSub, { fontFamily: Fonts?.mono }]}>FIELD EVIDENCE</Text>
          </View>
        </View>
        <LanguageMenu />
      </View>

      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pill, { borderColor: colors.amber, backgroundColor: `${colors.amber}1A` }]}>
          <Ionicons name="shield-checkmark" size={13} color={colors.amber} />
          <Text style={[styles.pillText, { color: colors.amber, fontFamily: Fonts?.mono }]}>
            {t("home.hero.eyebrow").toUpperCase()}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}>
          {t("home.hero.title1")}{" "}
          {t("home.hero.title2")}
        </Text>

        <Text style={[styles.lede, { color: colors.mutedForeground, fontFamily: Fonts?.sans }]}>
          {t("home.hero.body")}
        </Text>

        <Pressable
          accessibilityLabel={t("home.nav.registerFree")}
          onPress={() => void register()}
          style={[styles.primary, { backgroundColor: colors.amber }]}
        >
          <Text style={[styles.primaryText, { fontFamily: Fonts?.semibold }]}>
            {t("home.nav.registerFree")}
          </Text>
          <Ionicons name="arrow-forward" size={17} color="#0B0E13" />
        </Pressable>

        <Pressable
          accessibilityLabel={t("home.nav.login")}
          onPress={() => router.push("/sign-in")}
          style={[styles.secondary, { borderColor: colors.border }]}
        >
          <Text
            style={[styles.secondaryText, { color: colors.foreground, fontFamily: Fonts?.semibold }]}
          >
            {t("home.nav.login")}
          </Text>
        </Pressable>

        {blockedUrl ? (
          <Text style={[styles.blocked, { color: colors.foreground, fontFamily: Fonts?.sans }]}>
            {t("signin.openInBrowser")} {blockedUrl}
          </Text>
        ) : null}

        <Text style={[styles.fine, { color: colors.mutedForeground, fontFamily: Fonts?.sans }]}>
          {t("getapp.underButtons")}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Pressable
          accessibilityLabel={t("verify.navLink")}
          onPress={() => router.push("/verify")}
          style={[styles.verifyRow, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Ionicons name="qr-code-outline" size={18} color={colors.amber} />
          <Text
            style={[styles.verifyText, { color: colors.foreground, fontFamily: Fonts?.semibold }]}
          >
            {t("verify.navLink")}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </Pressable>

        <Pressable
          accessibilityLabel={t("invite.enterCode")}
          onPress={() => router.push("/join")}
          style={[styles.verifyRow, { borderColor: colors.border, backgroundColor: colors.card }]}
        >
          <Ionicons name="people-outline" size={18} color={colors.amber} />
          <Text
            style={[styles.verifyText, { color: colors.foreground, fontFamily: Fonts?.semibold }]}
          >
            {t("invite.enterCode")}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        </Pressable>

        <Pressable
          accessibilityLabel={t("home.nav.emailSupport")}
          onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          style={styles.supportRow}
        >
          <Text style={[styles.supportText, { color: colors.mutedForeground, fontFamily: Fonts?.sans }]}>
            {t("home.nav.emailSupport")} · {SUPPORT_EMAIL}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: HEADER_BG,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  mark: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  brand: { color: "#ffffff", fontSize: 15, fontWeight: "800", letterSpacing: 0.4 },
  brandSub: { color: "#8C9AAD", fontSize: 8, letterSpacing: 2.4, marginTop: 3 },

  body: { paddingHorizontal: 22, paddingTop: 40, paddingBottom: 48 },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pillText: { fontSize: 9.5, letterSpacing: 1.6 },
  title: { marginTop: 22, fontSize: 26, fontWeight: "800", lineHeight: 31, letterSpacing: -0.5 },
  lede: { marginTop: 16, fontSize: 15, lineHeight: 23 },

  primary: {
    marginTop: 30,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
  },
  primaryText: { color: "#0B0E13", fontSize: 15, fontWeight: "700" },
  secondary: {
    marginTop: 12,
    height: 52,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  secondaryText: { fontSize: 15, fontWeight: "600" },
  fine: { marginTop: 14, fontSize: 12.5, lineHeight: 18, textAlign: "center" },
  blocked: { marginTop: 14, fontSize: 12.5, lineHeight: 18, textAlign: "center" },

  divider: { height: 1, marginTop: 30 },

  verifyRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
  },
  verifyText: { flex: 1, fontSize: 14, fontWeight: "600" },

  supportRow: { marginTop: 22, alignItems: "center" },
  supportText: { fontSize: 12.5 },
});
