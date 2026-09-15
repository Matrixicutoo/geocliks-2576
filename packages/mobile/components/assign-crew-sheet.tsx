import { useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import { useAssignments, useAssignMember, useTeam } from "@/queries/team";

/**
 * Who works this job. Assignment is what a field member's whole view is scoped to, so every
 * toggle goes through `team.assign` and the row redraws from the server's answer rather than an
 * optimistic guess. Same popup the website shows on the projects list and the project page.
 */
export function AssignCrewSheet({
  projectId,
  projectName,
  onClose,
}: {
  projectId: string;
  projectName?: string | null;
  onClose: () => void;
}) {
  const colors = useColors();
  const t = useT();
  const team = useTeam();
  const assignments = useAssignments(projectId);
  const assign = useAssignMember();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const assigned = new Set(assignments.data?.map((row) => row.userId) ?? []);
  const rows = team.data ?? [];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.head, { borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.title,
                  { color: colors.foreground, fontFamily: Fonts?.displayMedium },
                ]}
              >
                {t("assign.title")}
              </Text>
              {projectName ? (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.sub,
                    { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {projectName.toUpperCase()}
                </Text>
              ) : null}
            </View>
            <Pressable accessibilityLabel={t("common.close")} onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <Text style={[styles.body, { color: colors.mutedForeground }]}>{t("assign.body")}</Text>

          {team.isLoading || assignments.isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.amber} />
            </View>
          ) : rows.length === 0 ? (
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>
              {t("assign.empty")}
            </Text>
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 4 }}>
              {rows.map((member) => {
                const on = assigned.has(member.userId);
                const label = member.user?.name ?? member.user?.email ?? t("team.unknownUser");
                const pending = busy === member.userId && assign.isPending;
                return (
                  <View key={member.id} style={[styles.row, { borderColor: colors.border }]}>
                    {member.user?.image ? (
                      <Image source={{ uri: member.user.image }} style={styles.avatar} />
                    ) : (
                      <View
                        style={[
                          styles.avatar,
                          styles.avatarEmpty,
                          { borderColor: colors.border },
                        ]}
                      >
                        <Text
                          style={[
                            styles.initials,
                            { color: colors.amber, fontFamily: Fonts?.mono },
                          ]}
                        >
                          {label.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={[styles.name, { color: colors.foreground }]}>
                        {label}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.meta,
                          { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                        ]}
                      >
                        {member.role.toUpperCase()}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityLabel={on ? t("assign.remove") : t("assign.add")}
                      disabled={assign.isPending}
                      onPress={async () => {
                        setError(null);
                        setBusy(member.userId);
                        try {
                          await assign.mutateAsync({
                            projectId,
                            userId: member.userId,
                            assigned: !on,
                          });
                        } catch (err) {
                          setError(err instanceof Error ? err.message : String(err));
                        } finally {
                          setBusy(null);
                        }
                      }}
                      style={[
                        styles.toggle,
                        {
                          borderColor: on ? colors.verified : colors.border,
                          opacity: assign.isPending ? 0.6 : 1,
                        },
                      ]}
                    >
                      {pending ? (
                        <ActivityIndicator
                          color={on ? colors.verified : colors.mutedForeground}
                          size="small"
                        />
                      ) : (
                        <Ionicons
                          name={on ? "checkmark" : "person-add-outline"}
                          size={13}
                          color={on ? colors.verified : colors.mutedForeground}
                        />
                      )}
                      <Text
                        style={[
                          styles.toggleText,
                          {
                            color: on ? colors.verified : colors.mutedForeground,
                            fontFamily: Fonts?.mono,
                          },
                        ]}
                      >
                        {(on ? t("assign.assigned") : t("assign.add")).toUpperCase()}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {error ? <Text style={[styles.error, { color: colors.alert }]}>{error}</Text> : null}

          <Pressable
            accessibilityLabel={t("assign.done")}
            onPress={onClose}
            style={[styles.primary, { backgroundColor: colors.amber }]}
          >
            <Text
              style={[styles.primaryText, { color: colors.background, fontFamily: Fonts?.mono }]}
            >
              {t("assign.done").toUpperCase()}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(6,9,13,0.8)",
    justifyContent: "center",
    padding: 16,
  },
  sheet: { borderWidth: 1, borderRadius: 14, paddingBottom: 12, maxHeight: "82%" },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  title: { fontSize: 14.5 },
  sub: { fontSize: 9.5, letterSpacing: 1.2, marginTop: 2 },
  body: { fontSize: 11.5, lineHeight: 17, paddingHorizontal: 14, paddingTop: 10 },
  loading: { paddingVertical: 26 },
  empty: { fontSize: 12, lineHeight: 18, padding: 20, textAlign: "center" },
  list: { marginTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  avatar: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#1A212C" },
  avatarEmpty: { borderWidth: 1, alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 11 },
  name: { fontSize: 13 },
  meta: { fontSize: 9, letterSpacing: 1 },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  toggleText: { fontSize: 9, letterSpacing: 1 },
  error: { fontSize: 11, lineHeight: 16, paddingHorizontal: 14, paddingTop: 8 },
  primary: {
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 11,
  },
  primaryText: { fontSize: 10.5, letterSpacing: 1.4 },
});
