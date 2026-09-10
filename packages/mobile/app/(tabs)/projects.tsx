import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { LanguageMenu } from "@/components/language-menu";
import { ProfileMenu } from "@/components/profile-menu";
import { useT } from "@/lib/i18n";
import { formatStamp } from "@/components/stamp";
import { useOrg } from "@/queries/orgs";
import { useCreateProject, useDestroyProject, useProjects } from "@/queries/projects";
import { canManageWorkspace } from "../../lib/roles";

const FORM_FIELDS = [
  ["name", "projects.fName"],
  ["code", "projects.fCode"],
  ["client", "projects.fClient"],
  ["address", "projects.fAddress"],
  ["notes", "projects.fNotes"],
] as const;

const EMPTY_FORM = { name: "", code: "", client: "", address: "", notes: "" };

const STATUS_LABEL: Record<string, string> = {
  active: "ACTIVE",
  on_hold: "ON HOLD",
  complete: "COMPLETE",
  archived: "ARCHIVED",
};

export default function Projects() {
  const colors = useColors();
  const t = useT();
  const router = useRouter();
  const projects = useProjects();
  const destroy = useDestroyProject();
  const createProject = useCreateProject();
  const org = useOrg();
  // Field crews work inside projects; creating and deleting them is manager and above.
  const canManage = canManageWorkspace(org.data?.role);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const submitProject = async () => {
    setFormError(null);
    if (!form.name.trim()) return;
    try {
      await createProject.mutateAsync({
        name: form.name.trim(),
        code: form.code.trim() || null,
        client: form.client.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    }
  };

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
          {t("projects.title").toUpperCase()}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {canManage ? (
            <Pressable
              accessibilityLabel={t("projects.new")}
              onPress={() => {
                setFormError(null);
                setShowForm((prev) => !prev);
              }}
              hitSlop={8}
              style={[styles.iconBtn, { borderColor: colors.amber, backgroundColor: colors.amber }]}
            >
              <Ionicons
                name={showForm ? "close" : "add"}
                size={18}
                color={colors.primaryForeground}
              />
            </Pressable>
          ) : null}
          <LanguageMenu />
        </View>
      </View>

      {canManage && showForm ? (
        <View style={[styles.form, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text
            style={[
              styles.formTitle,
              { color: colors.foreground, fontFamily: Fonts?.displayMedium },
            ]}
          >
            {t("projects.new")}
          </Text>
          {FORM_FIELDS.map(([key, labelKey]) => (
            <View key={key} style={styles.formField}>
              <Text style={[styles.formLabel, { color: colors.mutedForeground }]}>
                {t(labelKey)}
              </Text>
              <TextInput
                value={form[key]}
                onChangeText={(value) => setForm((prev) => ({ ...prev, [key]: value }))}
                placeholder={t(labelKey)}
                placeholderTextColor={colors.mutedForeground}
                accessibilityLabel={t(labelKey)}
                style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
              />
            </View>
          ))}
          {formError ? (
            <Text style={[styles.formError, { color: colors.alert }]}>{formError}</Text>
          ) : null}
          <Pressable
            accessibilityLabel={t("projects.create")}
            disabled={createProject.isPending || !form.name.trim()}
            onPress={() => void submitProject()}
            style={[
              styles.primary,
              {
                backgroundColor: colors.amber,
                opacity: createProject.isPending || !form.name.trim() ? 0.5 : 1,
              },
            ]}
          >
            {createProject.isPending ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Ionicons name="add" size={16} color={colors.background} />
            )}
            <Text
              style={[styles.primaryText, { color: colors.background, fontFamily: Fonts?.mono }]}
            >
              {t("projects.create").toUpperCase()}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {projects.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.amber} />
        </View>
      ) : (
        <FlatList
          data={projects.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={[styles.empty, { borderColor: colors.border }]}>
              <Ionicons name="briefcase-outline" size={26} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {canManage ? t("projects.empty.hint") : t("project.empty.hint")}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const cover = item.coverUrl;
            return (
              <View
                style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}
              >
                <Pressable
                  accessibilityLabel={item.name}
                  onPress={() =>
                    router.push({ pathname: "/teamspace", params: { project: item.id } })
                  }
                  style={styles.cardOpen}
                >
                  {cover ? (
                    <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" />
                  ) : (
                    <View style={[styles.cover, styles.coverEmpty]}>
                      <Ionicons name="image-outline" size={20} color={colors.mutedForeground} />
                    </View>
                  )}
                  <View style={styles.body}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.name,
                        { color: colors.foreground, fontFamily: Fonts?.displayMedium },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.client, { color: colors.mutedForeground }]}
                    >
                      {[item.client, item.locationLabel ?? item.address]
                        .filter(Boolean)
                        .join(" · ") || "No client set"}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text
                        style={[styles.badge, { color: colors.amber, fontFamily: Fonts?.mono }]}
                      >
                        {item.code ?? STATUS_LABEL[item.status] ?? item.status.toUpperCase()}
                      </Text>
                      <Text
                        style={[styles.badge, { color: colors.verified, fontFamily: Fonts?.mono }]}
                      >
                        {item.photoCount} PHOTOS
                      </Text>
                    </View>
                    {item.lastPhotoAt ? (
                      <Text
                        style={[
                          styles.last,
                          { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                        ]}
                      >
                        LAST {formatStamp(new Date(item.lastPhotoAt))}
                      </Text>
                    ) : null}
                    <View style={styles.openRow}>
                      <Text
                        style={[styles.openText, { color: colors.sky, fontFamily: Fonts?.mono }]}
                      >
                        {t("projects.openPhotos").toUpperCase()}
                      </Text>
                      <Ionicons name="chevron-forward" size={13} color={colors.sky} />
                    </View>
                  </View>
                </Pressable>

                {canManage && confirmId === item.id ? (
                  <View style={styles.confirmWrap}>
                    <View style={styles.confirmBox}>
                      <Text style={[styles.confirmText, { color: colors.alert }]}>
                        {t("project.deleteConfirm")}
                      </Text>
                      <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
                        {t("project.deleteHint")}
                      </Text>
                      {error ? (
                        <Text style={[styles.hintText, { color: colors.alert }]}>{error}</Text>
                      ) : null}
                      <View style={styles.confirmRow}>
                        <Pressable
                          accessibilityLabel={t("common.cancel")}
                          onPress={() => {
                            setConfirmId(null);
                            setError(null);
                          }}
                          style={[styles.smallBtn, { borderColor: colors.border }]}
                        >
                          <Text style={[styles.smallBtnText, { color: colors.mutedForeground }]}>
                            {t("common.cancel").toUpperCase()}
                          </Text>
                        </Pressable>
                        <Pressable
                          accessibilityLabel={t("common.confirm")}
                          disabled={destroy.isPending}
                          onPress={async () => {
                            setError(null);
                            try {
                              await destroy.mutateAsync({ id: item.id });
                              setConfirmId(null);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : String(err));
                            }
                          }}
                          style={[styles.smallBtn, { borderColor: colors.alert }]}
                        >
                          <Text style={[styles.smallBtnText, { color: colors.alert }]}>
                            {t("common.confirm").toUpperCase()}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ) : null}

                {canManage ? (
                  <Pressable
                    accessibilityLabel={t("project.delete")}
                    onPress={() => {
                      setError(null);
                      setConfirmId(confirmId === item.id ? null : item.id);
                    }}
                    hitSlop={10}
                    style={styles.trash}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={confirmId === item.id ? colors.alert : colors.mutedForeground}
                    />
                  </Pressable>
                ) : null}
              </View>
            );
          }}
        />
      )}
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
  loading: { paddingTop: 40 },
  list: { padding: 16, gap: 10 },
  card: { borderWidth: 1, padding: 10, borderRadius: 12, overflow: "hidden" },
  cardOpen: { flexDirection: "row", gap: 12 },
  openRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  openText: { fontSize: 9, letterSpacing: 1 },
  confirmWrap: { marginTop: 8 },
  cover: { width: 78, height: 78, backgroundColor: "#1A212C", borderRadius: 8 },
  coverEmpty: { alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 3 },
  name: { fontSize: 14 },
  client: { fontSize: 11 },
  metaRow: { flexDirection: "row", gap: 12, marginTop: 2 },
  badge: { fontSize: 9, letterSpacing: 1 },
  last: { fontSize: 9, letterSpacing: 0.8 },
  trash: { paddingHorizontal: 4, paddingTop: 2 },
  iconBtn: { borderWidth: 1, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 8 },
  form: {
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    gap: 8,
    borderRadius: 12,
  },
  formTitle: { fontSize: 13.5 },
  formField: { gap: 4 },
  formLabel: { fontSize: 10.5 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    borderRadius: 8,
  },
  formError: { fontSize: 11, lineHeight: 16 },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    marginTop: 2,
    borderRadius: 8,
  },
  primaryText: { fontSize: 10.5, letterSpacing: 1.4 },
  confirmBox: { marginTop: 8, gap: 4 },
  confirmText: { fontSize: 11.5, lineHeight: 16 },
  hintText: { fontSize: 10.5, lineHeight: 15 },
  confirmRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  smallBtn: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  smallBtnText: { fontSize: 9.5, letterSpacing: 1.2 },
  empty: { borderWidth: 1, padding: 26, alignItems: "center", gap: 8, borderRadius: 12 },
  emptyText: { fontSize: 12, textAlign: "center", lineHeight: 18 },
});
