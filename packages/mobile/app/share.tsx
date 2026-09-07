import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share as NativeShare,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT, type TKey } from "@/lib/i18n";
import { formatStamp } from "@/components/stamp";
import { useProjects } from "@/queries/projects";
import { useOrg } from "@/queries/orgs";
import { useCreateShareLink, useRevokeShareLink, useShareLinks } from "@/queries/share";

const apiUrl = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "";

const EXPIRY: { days: number | null; label: TKey }[] = [
  { days: 7, label: "share.in7" },
  { days: 30, label: "share.in30" },
  { days: 90, label: "share.in90" },
  { days: null, label: "share.never" },
];

/**
 * Native share-links screen. Mints the same live client links as the office dashboard and hands
 * them straight to the phone's share sheet — the way a tech actually sends one from a job site.
 */
export default function ShareLinks() {
  const colors = useColors();
  const router = useRouter();
  const tr = useT();
  const links = useShareLinks();
  const projects = useProjects();
  const org = useOrg();
  const create = useCreateShareLink();
  const revoke = useRevokeShareLink();

  const [label, setLabel] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(30);
  const [allowDownload, setAllowDownload] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // A field member may only share a job they are assigned to, so the workspace-wide chip is
  // hidden for them. The server enforces the same rule — this just keeps it off their screen.
  const isField = org.data?.role === "field";
  // Whole-workspace (null) is not a legal scope for a field member, so fall back to their
  // first assigned job until they pick one.
  const scopeId = isField ? (projectId ?? projects.data?.[0]?.id ?? null) : projectId;

  const urlFor = (token: string) => `${apiUrl}/share/${token}`;

  const openUrl = async (url: string) => {
    if (Platform.OS === "web") {
      globalThis.open?.(url, "_blank");
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(url, { dismissButtonStyle: "close" });
    } catch {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
    }
  };

  const sendLink = async (title: string, url: string) => {
    if (Platform.OS === "web") {
      await openUrl(url);
      return;
    }
    try {
      await NativeShare.share({ title, message: `${title}\n${url}`, url });
    } catch {
      await openUrl(url);
    }
  };

  const submit = async () => {
    setError(null);
    const projectName = projects.data?.find((p) => p.id === scopeId)?.name;
    const fallback = projectName ?? tr("share.wholeWorkspace");
    try {
      const link = await create.mutateAsync({
        label: label.trim() || fallback,
        projectId: scopeId,
        allowDownload,
        expiresInDays,
      });
      setLabel("");
      if (link?.token) await sendLink(link.label, urlFor(link.token));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel={tr("common.close")}>
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.amber, fontFamily: Fonts?.display }]}>
          {tr("share.title").toUpperCase()}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lede, { color: colors.mutedForeground }]}>{tr("share.subtitle")}</Text>

        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
            {tr("share.newLink").toUpperCase()}
          </Text>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>{tr("share.label")}</Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder={tr("share.label")}
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel={tr("share.label")}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>{tr("share.scope")}</Text>
          <View style={styles.chips}>
            {isField ? null : (
              <Pressable
                accessibilityLabel={tr("share.wholeWorkspace")}
                onPress={() => setProjectId(null)}
                style={[
                  styles.chip,
                  { borderColor: scopeId === null ? colors.amber : colors.border },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.chipText,
                    { color: scopeId === null ? colors.amber : colors.mutedForeground },
                  ]}
                >
                  {tr("share.wholeWorkspace")}
                </Text>
              </Pressable>
            )}
            {(projects.data ?? []).map((project) => (
              <Pressable
                key={project.id}
                accessibilityLabel={project.name}
                onPress={() => setProjectId(project.id)}
                style={[
                  styles.chip,
                  { borderColor: scopeId === project.id ? colors.amber : colors.border },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.chipText,
                    { color: scopeId === project.id ? colors.amber : colors.mutedForeground },
                  ]}
                >
                  {project.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>{tr("share.expires")}</Text>
          <View style={styles.chips}>
            {EXPIRY.map((item) => (
              <Pressable
                key={String(item.days)}
                accessibilityLabel={tr(item.label)}
                onPress={() => setExpiresInDays(item.days)}
                style={[
                  styles.chip,
                  { borderColor: expiresInDays === item.days ? colors.amber : colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: expiresInDays === item.days ? colors.amber : colors.mutedForeground },
                  ]}
                >
                  {tr(item.label)}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.switchRow}>
            <Text style={[styles.rowText, { color: colors.foreground }]}>
              {tr("share.allowDownloads")}
            </Text>
            <Switch
              value={allowDownload}
              onValueChange={setAllowDownload}
              trackColor={{ true: colors.amber, false: colors.border }}
              thumbColor={colors.background}
              accessibilityLabel={tr("share.allowDownloads")}
            />
          </View>

          {error ? <Text style={[styles.error, { color: colors.alert }]}>{error}</Text> : null}

          <Pressable
            accessibilityLabel={tr("share.createLink")}
            disabled={create.isPending}
            onPress={() => void submit()}
            style={[styles.primary, { backgroundColor: colors.amber, opacity: create.isPending ? 0.6 : 1 }]}
          >
            {create.isPending ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Ionicons name="link-outline" size={15} color={colors.background} />
            )}
            <Text style={[styles.primaryText, { color: colors.background, fontFamily: Fonts?.mono }]}>
              {tr("share.createLink").toUpperCase()}
            </Text>
          </Pressable>
        </View>

        {links.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.amber} />
          </View>
        ) : (links.data ?? []).length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Ionicons name="link-outline" size={24} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {tr("share.empty.hint")}
            </Text>
          </View>
        ) : (
          (links.data ?? []).map((link) => {
            const expired = link.expiresAt ? new Date(link.expiresAt).getTime() < Date.now() : false;
            const dead = link.revoked || expired;
            return (
              <View
                key={link.id}
                style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                <View style={styles.rowBody}>
                  <Text
                    numberOfLines={1}
                    style={[styles.rowTitle, { color: colors.foreground, fontFamily: Fonts?.displayMedium }]}
                  >
                    {link.label}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.rowMeta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                  >
                    {[
                      link.projectName ?? (link.photoId ? tr("common.photo") : tr("share.wholeWorkspace")),
                      link.allowDownload ? tr("share.downloadsOn") : tr("share.viewOnly"),
                      tr("share.viewsN", { n: link.views }),
                      link.expiresAt
                        ? tr("share.expiresAt", { stamp: formatStamp(new Date(link.expiresAt)) })
                        : tr("share.noExpiry"),
                    ]
                      .join(" · ")
                      .toUpperCase()}
                  </Text>
                  {dead ? (
                    <Text style={[styles.rowMeta, { color: colors.alert, fontFamily: Fonts?.mono }]}>
                      {(link.revoked ? tr("share.revoked") : tr("share.expired")).toUpperCase()}
                    </Text>
                  ) : null}
                  {confirmId === link.id ? (
                    <View style={styles.confirmRow}>
                      <Pressable
                        accessibilityLabel={tr("common.cancel")}
                        onPress={() => setConfirmId(null)}
                        style={[styles.smallBtn, { borderColor: colors.border }]}
                      >
                        <Text style={[styles.smallBtnText, { color: colors.mutedForeground }]}>
                          {tr("common.cancel").toUpperCase()}
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel={tr("common.confirm")}
                        onPress={async () => {
                          setError(null);
                          try {
                            await revoke.mutateAsync({ id: link.id });
                            setConfirmId(null);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : String(err));
                          }
                        }}
                        style={[styles.smallBtn, { borderColor: colors.alert }]}
                      >
                        <Text style={[styles.smallBtnText, { color: colors.alert }]}>
                          {tr("common.confirm").toUpperCase()}
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>

                {dead ? null : (
                  <>
                    <Pressable
                      accessibilityLabel={tr("common.share")}
                      onPress={() => void sendLink(link.label, urlFor(link.token))}
                      hitSlop={8}
                      style={styles.rowIcon}
                    >
                      <Ionicons name="share-social-outline" size={18} color={colors.accent} />
                    </Pressable>
                    <Pressable
                      accessibilityLabel={tr("share.open")}
                      onPress={() => void openUrl(urlFor(link.token))}
                      hitSlop={8}
                      style={styles.rowIcon}
                    >
                      <Ionicons name="open-outline" size={18} color={colors.sky} />
                    </Pressable>
                    <Pressable
                      accessibilityLabel={tr("share.revoke")}
                      onPress={() => setConfirmId(confirmId === link.id ? null : link.id)}
                      hitSlop={8}
                      style={styles.rowIcon}
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={18}
                        color={confirmId === link.id ? colors.alert : colors.mutedForeground}
                      />
                    </Pressable>
                  </>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "web" ? 12 : 6,
    paddingBottom: 10,
  },
  topTitle: { fontSize: 14, letterSpacing: 3 },
  topSpacer: { width: 22 },
  content: { paddingHorizontal: 16, paddingBottom: 44, gap: 12 },
  lede: { fontSize: 12.5, lineHeight: 18 },
  card: { borderWidth: 1, padding: 14, gap: 8, borderRadius: 12 },
  section: { fontSize: 10, letterSpacing: 2 },
  label: { fontSize: 11, marginTop: 4 },
  input: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13, borderRadius: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, maxWidth: "100%", borderRadius: 8 },
  chipText: { fontSize: 11, letterSpacing: 0.6 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 6,
  },
  rowText: { fontSize: 12.5, flex: 1 },
  error: { fontSize: 11.5, lineHeight: 16 },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    marginTop: 6,
    borderRadius: 8,
  },
  primaryText: { fontSize: 11, letterSpacing: 1.4 },
  loading: { paddingVertical: 26, alignItems: "center" },
  empty: { borderWidth: 1, padding: 22, gap: 10, alignItems: "center", borderRadius: 12 },
  emptyText: { fontSize: 12.5, textAlign: "center", lineHeight: 18 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  rowBody: { flex: 1, minWidth: 0, gap: 3 },
  rowTitle: { fontSize: 13.5 },
  rowMeta: { fontSize: 10, letterSpacing: 0.6 },
  rowIcon: { padding: 4 },
  confirmRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  smallBtn: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  smallBtnText: { fontSize: 10, letterSpacing: 1.2 },
});
