import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useLocalSearchParams } from "expo-router";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { LanguageMenu } from "@/components/language-menu";
import { ProfileMenu } from "@/components/profile-menu";
import { useT, type TKey } from "@/lib/i18n";
import { formatCoords, formatStamp } from "@/components/stamp";
import { PhotoDetail } from "@/components/photo-detail";
import { usePhotoStats, usePhotos } from "@/queries/photos";
import { useOrg } from "@/queries/orgs";
import { useProjects } from "@/queries/projects";

const apiUrl = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "";

/** Seeded demo photos are public web assets; captures come back as absolute presigned URLs. */
function resolve(url: string) {
  return url.startsWith("http") ? url : `${apiUrl}${url}`;
}

type Tag =
  | "general"
  | "before"
  | "after"
  | "issue"
  | "arrival"
  | "departure"
  | "pickup"
  | "delivery";

/** Mirrors the website's Teamspace filter order exactly, including "Work" (general). */
const TAGS: (Tag | null)[] = [
  null,
  "arrival",
  "before",
  "general",
  "after",
  "issue",
  "departure",
  "pickup",
  "delivery",
];

const TAG_LABELS: Record<string, TKey> = {
  all: "tag.all",
  arrival: "tag.arrival",
  before: "tag.before",
  after: "tag.after",
  issue: "tag.issue",
  departure: "tag.departure",
  general: "tag.work",
  pickup: "tag.pickup",
  delivery: "tag.delivery",
};

export default function Teamspace() {
  const colors = useColors();
  const t = useT();
  const org = useOrg();
  const [tag, setTag] = useState<Tag | null>(null);
  const params = useLocalSearchParams<{ project?: string }>();
  const [projectId, setProjectId] = useState<string | null>(params.project ?? null);
  const lastParam = useRef<string | null>(params.project ?? null);
  // Tapping a different project card while Teamspace is already mounted must refocus the filter.
  useEffect(() => {
    const next = params.project ?? null;
    if (next !== lastParam.current) {
      lastParam.current = next;
      setProjectId(next);
    }
  }, [params.project]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);

  const photos = usePhotos({ tag, projectId, limit: 60 });
  const stats = usePhotoStats();
  const projects = useProjects();

  const rows = useMemo(() => photos.data?.photos ?? [], [photos.data]);
  const activeProject = useMemo(
    () => projects.data?.find((p) => p.id === projectId),
    [projects.data, projectId],
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {org.data?.org.name ? (
        <Text
          numberOfLines={1}
          style={[styles.orgLine, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
        >
          {org.data.org.name.toUpperCase()}
        </Text>
      ) : null}

      <View style={styles.header}>
        <ProfileMenu />
        <Text style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}>
          {t("teamspace.title").toUpperCase()}
        </Text>
        <LanguageMenu />
      </View>

      <View style={styles.statRow}>
        {[
          { label: t("evidence.verified"), value: stats.data?.verified ?? 0, color: colors.verified },
          { label: t("teamspace.statGeotagged"), value: stats.data?.located ?? 0, color: colors.sky },
          { label: t("teamspace.statCrew"), value: stats.data?.contributors ?? 0, color: colors.amber },
          {
            label: t("teamspace.statMonth"),
            value: stats.data?.photosThisMonth ?? 0,
            color: colors.foreground,
          },
        ].map((s) => (
          <View key={s.label} style={[styles.stat, { borderColor: colors.border }]}>
            <Text
              numberOfLines={1}
              style={[styles.statValue, { color: s.color, fontFamily: Fonts?.mono }]}
            >
              {s.value}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
              style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
            >
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Evidence-type filter — a dropdown rather than a chip row: nine tags cannot fit
          on a phone width, and this matches the project filter directly beneath it. */}
      <Pressable
        onPress={() => setTagOpen(true)}
        accessibilityLabel={t("capture.evidenceType")}
        style={[styles.select, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Text style={[styles.selectLabel, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {t("capture.evidenceType").toUpperCase()}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.selectValue, { color: tag === null ? colors.foreground : colors.amber }]}
        >
          {t(TAG_LABELS[tag ?? "all"]!)}
        </Text>
        <Ionicons name="chevron-down" size={15} color={colors.mutedForeground} />
      </Pressable>

      <Modal
        visible={tagOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTagOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setTagOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.sheetTitle, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
              {t("capture.evidenceType").toUpperCase()}
            </Text>
            <ScrollView style={styles.sheetScroll}>
              {TAGS.map((tagKey) => {
                const active = tag === tagKey;
                return (
                  <Pressable
                    key={tagKey ?? "all"}
                    onPress={() => {
                      setTag(tagKey);
                      setTagOpen(false);
                    }}
                    style={[styles.option, { borderColor: colors.border }]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.optionText,
                        { color: active ? colors.amber : colors.foreground },
                      ]}
                    >
                      {t(TAG_LABELS[tagKey ?? "all"]!)}
                    </Text>
                    {active ? <Ionicons name="checkmark" size={17} color={colors.amber} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Project filter — a single-line dropdown, so a long project list can't overflow the row. */}
      <Pressable
        onPress={() => setPickerOpen(true)}
        style={[styles.select, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Text style={[styles.selectLabel, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {t("common.project").toUpperCase()}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            styles.selectValue,
            { color: projectId === null ? colors.foreground : colors.sky },
          ]}
        >
          {activeProject?.name ?? t("common.allProjects")}
        </Text>
        <Ionicons name="chevron-down" size={15} color={colors.mutedForeground} />
      </Pressable>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.sheetTitle, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
              {t("teamspace.projectFilter").toUpperCase()}
            </Text>
            <ScrollView style={styles.sheetScroll}>
              {[{ id: null as string | null, name: t("common.allProjects") }, ...(projects.data ?? [])].map(
                (p) => {
                  const active = projectId === p.id;
                  return (
                    <Pressable
                      key={p.id ?? "all"}
                      onPress={() => {
                        setProjectId(p.id);
                        setPickerOpen(false);
                      }}
                      style={[styles.option, { borderColor: colors.border }]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.optionText,
                          { color: active ? colors.sky : colors.foreground },
                        ]}
                      >
                        {p.name}
                      </Text>
                      {active ? <Ionicons name="checkmark" size={17} color={colors.sky} /> : null}
                    </Pressable>
                  );
                },
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {photos.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.amber} />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={[styles.empty, { borderColor: colors.border }]}>
              <Ionicons name="images-outline" size={26} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {t("teamspace.noMatch.title")}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setOpenPhoto(item.id)}
              style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <View>
                {item.kind === "video" && !item.posterUrl ? (
                  <View style={[styles.photo, styles.videoFallback]}>
                    <Ionicons name="videocam-outline" size={26} color={colors.mutedForeground} />
                  </View>
                ) : (
                  <Image
                    source={{ uri: resolve(item.kind === "video" ? item.posterUrl! : item.url) }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                )}
                {item.kind === "video" ? (
                  <View style={styles.playBadge}>
                    <Ionicons name="play" size={16} color="#0B0F14" />
                  </View>
                ) : null}
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={[styles.stamp, { color: colors.foreground, fontFamily: Fonts?.mono }]}>
                    {formatStamp(new Date(item.capturedAt))}
                  </Text>
                  <View style={styles.badge}>
                    <Ionicons
                      name={item.integrity === "verified" ? "shield-checkmark" : "alert-circle"}
                      size={12}
                      color={item.integrity === "verified" ? colors.verified : colors.alert}
                    />
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: item.integrity === "verified" ? colors.verified : colors.alert,
                          fontFamily: Fonts?.mono,
                        },
                      ]}
                    >
                      {item.integrity === "verified" ? "VERIFIED" : "UNVERIFIED"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
                  {formatCoords(item.lat, item.lng)}
                </Text>
                {item.address ? (
                  <Text numberOfLines={1} style={[styles.addr, { color: colors.mutedForeground }]}>
                    {item.address}
                  </Text>
                ) : null}
                <Text style={[styles.code, { color: colors.amber, fontFamily: Fonts?.mono }]}>
                  {item.photoCode} · {item.tag.toUpperCase()}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      <PhotoDetail photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: { fontSize: 15, letterSpacing: 3 },
  orgLine: { fontSize: 10, letterSpacing: 1.5, paddingHorizontal: 16, paddingTop: 10 },
  statRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  stat: { flex: 1, borderWidth: 1, paddingVertical: 9, paddingHorizontal: 8, gap: 2, borderRadius: 8 },
  statValue: { fontSize: 16 },
  statLabel: { fontSize: 8, letterSpacing: 0.6 },
  select: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectLabel: { fontSize: 9, letterSpacing: 1 },
  selectValue: { flex: 1, fontSize: 13 },
  backdrop: { flex: 1, backgroundColor: "rgba(11,14,19,0.72)", justifyContent: "center", padding: 24 },
  sheet: { borderWidth: 1, paddingVertical: 14, maxHeight: "70%", borderRadius: 12, overflow: "hidden" },
  sheetTitle: { fontSize: 9, letterSpacing: 1.4, paddingHorizontal: 16, paddingBottom: 10 },
  sheetScroll: { flexGrow: 0 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderTopWidth: 1,
  },
  optionText: { flex: 1, fontSize: 14 },
  loading: { paddingTop: 40 },
  list: { padding: 16, gap: 12 },
  card: { borderWidth: 1 },
  photo: { width: "100%", height: 190, backgroundColor: "#1A212C" },
  videoFallback: { alignItems: "center", justifyContent: "center" },
  playBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,176,33,0.92)",
  },
  cardBody: { padding: 10, gap: 3 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stamp: { fontSize: 12 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4 },
  badgeText: { fontSize: 9, letterSpacing: 1 },
  meta: { fontSize: 10 },
  addr: { fontSize: 11 },
  code: { fontSize: 10, letterSpacing: 0.8 },
  empty: { borderWidth: 1, padding: 26, alignItems: "center", gap: 8, borderRadius: 12 },
  emptyText: { fontSize: 12, textAlign: "center", lineHeight: 18 },
});
