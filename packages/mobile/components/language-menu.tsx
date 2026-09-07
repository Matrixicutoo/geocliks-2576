import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useLocale } from "@/lib/i18n";
import { LOCALES } from "@/i18n/locales";

/**
 * Top-header language dropdown, present on every tab screen.
 * Device-level choice; the workspace default is set in Settings.
 */
export function LanguageMenu() {
  const colors = useColors();
  const { locale, override, t, setLocale, useWorkspaceDefault } = useLocale();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <>
      <Pressable
        accessibilityLabel={t("language.title")}
        onPress={() => setOpen(true)}
        style={[styles.trigger, { borderColor: colors.border, backgroundColor: colors.card }]}
      >
        <Ionicons name="globe-outline" size={13} color={colors.amber} />
        <Text style={[styles.triggerText, { color: colors.foreground, fontFamily: Fonts?.mono }]}>
          {current.code.toUpperCase()}
        </Text>
        <Ionicons name="chevron-down" size={11} color={colors.mutedForeground} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={[styles.heading, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
            >
              {t("language.title").toUpperCase()}
            </Text>
            <ScrollView style={styles.list}>
              <Pressable
                onPress={() => {
                  void useWorkspaceDefault();
                  setOpen(false);
                }}
                style={[styles.row, { borderColor: colors.border }]}
              >
                <Text style={[styles.rowText, { color: colors.foreground }]}>
                  {t("language.followWorkspace")}
                </Text>
                {!override ? (
                  <Ionicons name="checkmark" size={15} color={colors.amber} />
                ) : null}
              </Pressable>
              {LOCALES.map((l) => (
                <Pressable
                  key={l.code}
                  onPress={() => {
                    void setLocale(l.code);
                    setOpen(false);
                  }}
                  style={[styles.row, { borderColor: colors.border }]}
                >
                  <Text style={[styles.rowText, { color: colors.foreground }]}>
                    {l.native}
                    <Text style={{ color: colors.mutedForeground }}> · {l.code.toUpperCase()}</Text>
                  </Text>
                  {override === l.code ? (
                    <Ionicons name="checkmark" size={15} color={colors.amber} />
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  triggerText: { fontSize: 10.5, letterSpacing: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 64,
    paddingHorizontal: 12,
  },
  sheet: { width: 260, borderWidth: 1, maxHeight: 420, borderRadius: 12, overflow: "hidden" },
  heading: { fontSize: 10, letterSpacing: 2, paddingHorizontal: 12, paddingTop: 12 },
  list: { marginTop: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  rowText: { fontSize: 12.5, flex: 1 },
});
