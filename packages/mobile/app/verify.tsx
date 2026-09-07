import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import { useVerifyCode } from "@/queries/verify";

function stamp(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function coords(lat?: number | null, lng?: number | null) {
  if (lat == null || lng == null) return "NO GPS FIX";
  return `${Math.abs(lat).toFixed(5)}° ${lat >= 0 ? "N" : "S"}  ${Math.abs(lng).toFixed(5)}° ${
    lng >= 0 ? "E" : "W"
  }`;
}

/**
 * Public photo-code check, reachable signed out from the marketing screen. Same procedure as the
 * web /verify page: metadata always, the image only when the owning workspace published the file.
 */
export default function Verify() {
  const colors = useColors();
  const router = useRouter();
  const tr = useT();
  const params = useLocalSearchParams<{ code?: string }>();
  const initial = typeof params.code === "string" ? params.code : "";
  const [code, setCode] = useState(initial);
  const [input, setInput] = useState(initial);
  const q = useVerifyCode(code);
  const d = q.data;
  const ok = d?.integrity === "verified";

  const row = (label: string, value: string) => (
    <View key={label} style={[styles.row, { borderColor: colors.border }]}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.header, { borderColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel={tr("photo.close")}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {tr("verify.navLink")}
        </Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {tr("verify.lookupLabel")}
          </Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="TM-XXXX-XXXX-XXXX"
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel={tr("verify.lookupLabel")}
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background },
            ]}
          />
          <Pressable
            onPress={() => setCode(input.trim())}
            accessibilityLabel={tr("verify.submit")}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="search" size={16} color={colors.primaryForeground} />
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
              {tr("verify.submit")}
            </Text>
          </Pressable>
        </View>

        {!code ? (
          <View style={styles.block}>
            <Text style={[styles.h1, { color: colors.foreground }]}>{tr("verify.emptyTitle")}</Text>
            <Text style={[styles.body14, { color: colors.mutedForeground }]}>
              {tr("verify.emptyBody")}
            </Text>
          </View>
        ) : q.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.body14, { color: colors.mutedForeground }]}>
              {tr("verify.loading")}
            </Text>
          </View>
        ) : q.isError || !d ? (
          <View style={styles.block}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.alert} />
            <Text style={[styles.h1, { color: colors.foreground }]}>
              {tr("verify.notFoundTitle")}
            </Text>
            <Text style={[styles.body14, { color: colors.mutedForeground }]}>
              {tr("verify.notFoundBody")}
            </Text>
          </View>
        ) : (
          <View style={styles.block}>
            <View style={styles.chips}>
              <Text style={[styles.chip, { borderColor: colors.border, color: colors.mutedForeground }]}>
                {tr("verify.chipLocked")}
              </Text>
              <Text
                style={[
                  styles.chip,
                  {
                    borderColor: ok ? colors.verified : colors.alert,
                    color: ok ? colors.verified : colors.alert,
                  },
                ]}
              >
                {ok ? tr("verify.chipOriginal") : tr("verify.statusUnverified")}
              </Text>
            </View>
            <Text style={[styles.h1, { color: colors.foreground }]}>
              {ok ? tr("verify.headline") : tr("verify.headlineUnverified")}
            </Text>
            <Text style={[styles.code, { color: colors.primary }]}>{d.photoCode}</Text>
            <Text style={[styles.body14, { color: colors.mutedForeground }]}>
              {tr("verify.subhead")}
            </Text>

            {d.published && d.url ? (
              <Image
                source={{ uri: d.kind === "video" ? (d.posterUrl ?? d.url) : d.url }}
                style={[styles.photo, { borderColor: colors.border }]}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.h2, { color: colors.foreground }]}>
                  {tr("verify.notPublishedTitle")}
                </Text>
                <Text style={[styles.body14, { color: colors.mutedForeground }]}>
                  {tr("verify.notPublishedBody")}
                </Text>
              </View>
            )}

            <View
              style={[styles.fields, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {row(
                tr("verify.statusLabel"),
                `${ok ? tr("verify.statusVerified") : tr("verify.statusUnverified")} · ${
                  d.timeSource === "network" ? tr("photo.networkTime") : tr("photo.deviceTime")
                }`,
              )}
              {row(tr("verify.capturedLabel"), stamp(d.capturedAt))}
              {row(tr("verify.verifiedAtLabel"), stamp(d.verifiedAt))}
              {row(tr("verify.locationLabel"), coords(d.lat, d.lng))}
              {row(tr("verify.addressLabel"), d.address || tr("photo.addressUnavailable"))}
              {row(tr("verify.codeLabel"), d.photoCode)}
              {row(tr("verify.hashLabel"), d.contentHash || "—")}
              {row(
                tr("verify.deviceLabel"),
                [d.deviceModel, d.platform].filter(Boolean).join(" · ") || "—",
              )}
              {row(tr("verify.jobLabel"), d.projectName || tr("queue.unassigned"))}
              {row(tr("verify.workspaceLabel"), d.orgName || "—")}
            </View>

            {d.published && d.url && d.allowDownload && (
              <Pressable
                onPress={() => void Linking.openURL(d.url as string)}
                accessibilityLabel={tr("verify.download")}
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="download-outline" size={16} color={colors.primaryForeground} />
                <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
                  {tr("verify.download")}
                </Text>
              </Pressable>
            )}

            <Text style={[styles.small, { color: colors.mutedForeground }]}>
              {tr("verify.disclaimer")}
            </Text>
          </View>
        )}

        <Text style={[styles.small, { color: colors.mutedForeground }]}>
          {tr("verify.footerNote")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iconBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: Fonts.display, fontSize: 16, fontWeight: "700" },
  body: { padding: 16, gap: 16, paddingBottom: 48 },
  card: { borderWidth: 1, padding: 16, gap: 12, borderRadius: 12 },
  label: { fontFamily: Fonts.mono, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase" },
  input: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontFamily: Fonts.mono, fontSize: 13, borderRadius: 8 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  primaryBtnText: { fontFamily: Fonts.sans, fontSize: 14, fontWeight: "700" },
  block: { gap: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontFamily: Fonts.mono,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    borderRadius: 6,
  },
  h1: { fontFamily: Fonts.display, fontSize: 26, fontWeight: "800", lineHeight: 30 },
  h2: { fontFamily: Fonts.display, fontSize: 15, fontWeight: "700" },
  code: { fontFamily: Fonts.mono, fontSize: 15, letterSpacing: 2 },
  body14: { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 21 },
  small: { fontFamily: Fonts.sans, fontSize: 12, lineHeight: 18 },
  photo: { width: "100%", aspectRatio: 4 / 3, borderWidth: 1, backgroundColor: "#000" },
  fields: { borderWidth: 1 },
  row: { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingVertical: 10, gap: 3 },
  rowLabel: { fontFamily: Fonts.mono, fontSize: 10, letterSpacing: 1.1, textTransform: "uppercase" },
  rowValue: { fontFamily: Fonts.mono, fontSize: 12 },
  loading: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 24 },
});
