import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT, type TKey } from "@/lib/i18n";
import { formatStamp } from "@/components/stamp";
import { useProjects } from "@/queries/projects";
import { useCreateReport, useDownloadReport, useRemoveReport, useReports } from "@/queries/reports";

const FORMATS: { id: "pdf" | "xlsx" | "zip" | "kmz"; hint: TKey }[] = [
  { id: "pdf", hint: "reports.hint.pdf" },
  { id: "xlsx", hint: "reports.hint.xlsx" },
  { id: "zip", hint: "reports.hint.zip" },
  { id: "kmz", hint: "reports.hint.kmz" },
];

const LAYOUTS: { id: "grid" | "detailed" | "before_after" | "map"; label: TKey }[] = [
  { id: "grid", label: "reports.layout.grid" },
  { id: "detailed", label: "reports.layout.detailed" },
  { id: "before_after", label: "reports.layout.before_after" },
  { id: "map", label: "reports.layout.map" },
];

function sizeOf(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Native reports screen. Same one-click packages as the office dashboard: pick a job and a
 * format, the server builds it, and the phone opens the finished file in the in-app browser.
 */
export default function Reports() {
  const colors = useColors();
  const router = useRouter();
  const tr = useT();
  const reports = useReports();
  const projects = useProjects();
  const create = useCreateReport();
  const download = useDownloadReport();
  const remove = useRemoveReport();

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [format, setFormat] = useState<"pdf" | "xlsx" | "zip" | "kmz">("pdf");
  const [layout, setLayout] = useState<"grid" | "detailed" | "before_after" | "map">("grid");
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const activeFormat = FORMATS.find((f) => f.id === format);

  const open = async (url: string) => {
    if (Platform.OS === "web") {
      globalThis.location?.assign(url);
      return;
    }
    try {
      await WebBrowser.openBrowserAsync(url, { dismissButtonStyle: "close" });
    } catch {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
    }
  };

  const generate = async () => {
    setError(null);
    const projectName = projects.data?.find((p) => p.id === projectId)?.name;
    const fallback = projectName ?? tr("reports.title");
    try {
      const report = await create.mutateAsync({
        title: title.trim() || fallback,
        projectId,
        format,
        layout,
        limit: 120,
      });
      setTitle("");
      if (report.url) await open(report.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const openExisting = async (id: string) => {
    setError(null);
    try {
      const res = await download.mutateAsync({ id });
      await open(res.url);
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
          {tr("reports.title").toUpperCase()}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lede, { color: colors.mutedForeground }]}>{tr("reports.subtitle")}</Text>

        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
            {tr("reports.build").toUpperCase()}
          </Text>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {tr("reports.titleField")}
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={tr("reports.titleField")}
            placeholderTextColor={colors.mutedForeground}
            accessibilityLabel={tr("reports.titleField")}
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {tr("common.project")}
          </Text>
          <View style={styles.chips}>
            <Pressable
              accessibilityLabel={tr("common.allProjects")}
              onPress={() => setProjectId(null)}
              style={[
                styles.chip,
                { borderColor: projectId === null ? colors.amber : colors.border },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.chipText,
                  { color: projectId === null ? colors.amber : colors.mutedForeground },
                ]}
              >
                {tr("common.allProjects")}
              </Text>
            </Pressable>
            {(projects.data ?? []).map((project) => (
              <Pressable
                key={project.id}
                accessibilityLabel={project.name}
                onPress={() => setProjectId(project.id)}
                style={[
                  styles.chip,
                  { borderColor: projectId === project.id ? colors.amber : colors.border },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.chipText,
                    { color: projectId === project.id ? colors.amber : colors.mutedForeground },
                  ]}
                >
                  {project.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {tr("reports.format")}
          </Text>
          <View style={styles.chips}>
            {FORMATS.map((item) => (
              <Pressable
                key={item.id}
                accessibilityLabel={item.id.toUpperCase()}
                onPress={() => setFormat(item.id)}
                style={[
                  styles.chip,
                  { borderColor: format === item.id ? colors.amber : colors.border },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: format === item.id ? colors.amber : colors.mutedForeground,
                      fontFamily: Fonts?.mono,
                    },
                  ]}
                >
                  {item.id.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
          {activeFormat ? (
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              {tr(activeFormat.hint)}
            </Text>
          ) : null}

          {format === "pdf" ? (
            <>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                {tr("reports.layoutField")}
              </Text>
              <View style={styles.chips}>
                {LAYOUTS.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityLabel={tr(item.label)}
                    onPress={() => setLayout(item.id)}
                    style={[
                      styles.chip,
                      { borderColor: layout === item.id ? colors.amber : colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: layout === item.id ? colors.amber : colors.mutedForeground },
                      ]}
                    >
                      {tr(item.label)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {error ? <Text style={[styles.error, { color: colors.alert }]}>{error}</Text> : null}

          <Pressable
            accessibilityLabel={tr("reports.generate")}
            disabled={create.isPending}
            onPress={() => void generate()}
            style={[styles.primary, { backgroundColor: colors.amber, opacity: create.isPending ? 0.6 : 1 }]}
          >
            {create.isPending ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Ionicons name="document-text-outline" size={15} color={colors.background} />
            )}
            <Text
              style={[styles.primaryText, { color: colors.background, fontFamily: Fonts?.mono }]}
            >
              {(create.isPending ? tr("reports.building") : tr("reports.generate")).toUpperCase()}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {tr("reports.generated").toUpperCase()}
        </Text>

        {reports.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.amber} />
          </View>
        ) : (reports.data ?? []).length === 0 ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Ionicons name="document-outline" size={24} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {tr("reports.empty.title")}
            </Text>
          </View>
        ) : (
          (reports.data ?? []).map((report) => (
            <View
              key={report.id}
              style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <View style={styles.rowBody}>
                <Text
                  numberOfLines={1}
                  style={[styles.rowTitle, { color: colors.foreground, fontFamily: Fonts?.displayMedium }]}
                >
                  {report.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.rowMeta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                >
                  {[
                    report.format.toUpperCase(),
                    tr("projects.photosN", { n: report.photoCount }).toUpperCase(),
                    sizeOf(report.bytes),
                    formatStamp(new Date(report.createdAt)),
                  ].join(" · ")}
                </Text>
                {report.projectName ? (
                  <Text numberOfLines={1} style={[styles.rowMeta, { color: colors.mutedForeground }]}>
                    {report.projectName}
                  </Text>
                ) : null}
                {confirmId === report.id ? (
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
                          await remove.mutateAsync({ id: report.id });
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

              <Pressable
                accessibilityLabel={tr("common.download")}
                onPress={() => void openExisting(report.id)}
                hitSlop={8}
                style={styles.rowIcon}
              >
                <Ionicons name="download-outline" size={18} color={colors.sky} />
              </Pressable>
              <Pressable
                accessibilityLabel={tr("common.delete")}
                onPress={() => setConfirmId(confirmId === report.id ? null : report.id)}
                hitSlop={8}
                style={styles.rowIcon}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={confirmId === report.id ? colors.alert : colors.mutedForeground}
                />
              </Pressable>
            </View>
          ))
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
  section: { fontSize: 10, letterSpacing: 2, marginTop: 4 },
  label: { fontSize: 11, marginTop: 4 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 13,
    borderRadius: 8,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, maxWidth: "100%", borderRadius: 8 },
  chipText: { fontSize: 11, letterSpacing: 0.6 },
  hint: { fontSize: 11, lineHeight: 16 },
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
    gap: 8,
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
