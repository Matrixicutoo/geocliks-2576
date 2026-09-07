import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { LanguageMenu } from "@/components/language-menu";
import { ProfileMenu } from "@/components/profile-menu";
import { useT } from "@/lib/i18n";
import { formatCoords, formatStamp } from "@/components/stamp";
import { PhotoDetail } from "@/components/photo-detail";
import FieldMap from "@/components/field-map";
import { useMapPins } from "@/queries/photos";
import { useProjects } from "@/queries/projects";

export default function MapScreen() {
  const colors = useColors();
  const t = useT();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showRoute, setShowRoute] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);

  const pins = useMapPins(projectId);
  const projects = useProjects();

  const rows = useMemo(() => pins.data ?? [], [pins.data]);
  const activeProject = useMemo(
    () => projects.data?.find((p) => p.id === projectId),
    [projects.data, projectId],
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.header}>
        <ProfileMenu />
        <Text style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}>
          {t("map.title").toUpperCase()}
        </Text>
        <LanguageMenu />
      </View>

      <View style={styles.controls}>
        <Pressable
          style={[styles.select, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => setPickerOpen(true)}
        >
          <Ionicons name="briefcase-outline" size={13} color={colors.mutedForeground} />
          <Text
            numberOfLines={1}
            style={[styles.selectText, { color: colors.foreground, fontFamily: Fonts?.mono }]}
          >
            {activeProject?.name ?? t("common.allProjects").toUpperCase()}
          </Text>
          <Ionicons name="chevron-down" size={13} color={colors.mutedForeground} />
        </Pressable>
        <Pressable
          style={[
            styles.toggle,
            {
              borderColor: showRoute ? colors.amber : colors.border,
              backgroundColor: showRoute ? colors.amber : colors.card,
            },
          ]}
          onPress={() => setShowRoute((v) => !v)}
        >
          <Text
            style={[
              styles.toggleText,
              {
                color: showRoute ? colors.primaryForeground : colors.mutedForeground,
                fontFamily: Fonts?.mono,
              },
            ]}
          >
            {t("map.route").toUpperCase()}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {pins.isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.amber} />
          </View>
        ) : (
          <FieldMap
            pins={rows}
            showRoute={showRoute}
            height={340}
            onSelect={(id) => {
              setSelected(id);
              setOpenPhoto(id);
            }}
          />
        )}

        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {t("map.coordLog").toUpperCase()}
        </Text>
        {rows.slice(0, 40).map((pin) => (
          <Pressable
            key={pin.id}
            onPress={() => {
              setSelected(pin.id);
              setOpenPhoto(pin.id);
            }}
            style={[
              styles.row,
              {
                borderColor: selected === pin.id ? colors.amber : colors.border,
                backgroundColor: colors.card,
              },
            ]}
          >
            <Text style={[styles.code, { color: colors.amber, fontFamily: Fonts?.mono }]}>
              {pin.photoCode ?? "—"}
            </Text>
            <Text style={[styles.meta, { color: colors.foreground, fontFamily: Fonts?.mono }]}>
              {formatCoords(pin.lat, pin.lng)}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.meta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
            >
              {[pin.userName, pin.address].filter(Boolean).join(" · ") || "—"}
            </Text>
            <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
              {pin.capturedAt ? formatStamp(new Date(pin.capturedAt)) : "—"}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <PhotoDetail photoId={openPhoto} onClose={() => setOpenPhoto(null)} />

      <Modal
        transparent
        visible={pickerOpen}
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text
              style={[styles.sheetTitle, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
            >
              {t("map.filterProject").toUpperCase()}
            </Text>
            <ScrollView style={styles.sheetScroll}>
              {[{ id: null as string | null, name: t("common.allProjects").toUpperCase() }, ...(projects.data ?? [])].map(
                (p) => (
                  <Pressable
                    key={p.id ?? "all"}
                    style={styles.option}
                    onPress={() => {
                      setProjectId(p.id);
                      setPickerOpen(false);
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.optionText,
                        { color: colors.foreground, fontFamily: Fonts?.mono },
                      ]}
                    >
                      {p.name}
                    </Text>
                    {projectId === p.id ? (
                      <Ionicons name="checkmark" size={15} color={colors.amber} />
                    ) : null}
                  </Pressable>
                ),
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: { fontSize: 20, letterSpacing: 1.5 },
  controls: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  select: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectText: { flex: 1, fontSize: 10, letterSpacing: 1 },
  toggle: { borderWidth: 1, paddingHorizontal: 12, justifyContent: "center", borderRadius: 8 },
  toggleText: { fontSize: 10, letterSpacing: 1.2 },
  body: { paddingHorizontal: 16, paddingBottom: 32, gap: 8 },
  loading: { height: 340, alignItems: "center", justifyContent: "center" },
  section: { fontSize: 9, letterSpacing: 1.4, marginTop: 14, marginBottom: 2 },
  row: { borderWidth: 1, padding: 10, gap: 3, borderRadius: 8 },
  code: { fontSize: 10, letterSpacing: 1.1 },
  meta: { fontSize: 9.5, letterSpacing: 0.4 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11,14,19,0.8)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: { borderWidth: 1, padding: 14, maxHeight: 420, borderRadius: 12 },
  sheetTitle: { fontSize: 9, letterSpacing: 1.4, marginBottom: 8 },
  sheetScroll: { maxHeight: 340 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    gap: 8,
  },
  optionText: { flex: 1, fontSize: 11, letterSpacing: 0.8 },
});
