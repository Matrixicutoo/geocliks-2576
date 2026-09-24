import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { type TKey, useT } from "@/lib/i18n";
import { useBlockMember, useReportMessage, useUnblockMember } from "@/queries/messages";

/**
 * Reporting and blocking for a 1:1 thread.
 *
 * Every conversation in GeoCliks is between two members of the same workspace, so a report is
 * not a ticket to some outside moderation desk: it goes to the people who can actually act on
 * it — the owner, the admins and the managers of that Teamspace, who can also remove the member
 * from the Team screen. Blocking is the immediate lever the reporter holds themselves, and it is
 * reversible from the same menu.
 *
 * Both live here rather than in the thread screen so the screen keeps to messaging, and so the
 * same sheet can be reached two ways: the header menu (reports the conversation) and a long
 * press on somebody else's bubble (reports that one message).
 */

/** Must match REPORT_REASONS in `api/routes/messages.ts`. */
const REASONS = [
  { value: "harassment", label: "msg.reasonHarassment" },
  { value: "spam", label: "msg.reasonSpam" },
  { value: "inappropriate", label: "msg.reasonInappropriate" },
  { value: "threat", label: "msg.reasonThreat" },
  { value: "other", label: "msg.reasonOther" },
] as const;

type Reason = (typeof REASONS)[number]["value"];

/** What is being reported: one message, or the thread as a whole (`messageId: null`). */
export type ReportTarget = { messageId: string | null };

type Props = {
  conversationId: string;
  other: { id: string; name: string };
  blockedByMe: boolean;
  menuVisible: boolean;
  onCloseMenu: () => void;
  reportTarget: ReportTarget | null;
  onReportTarget: (target: ReportTarget | null) => void;
  /** Surfaced by the thread screen as a one-line confirmation under the header. */
  onNotice: (message: string) => void;
};

export function ThreadModeration({
  conversationId,
  other,
  blockedByMe,
  menuVisible,
  onCloseMenu,
  reportTarget,
  onReportTarget,
  onNotice,
}: Props) {
  const colors = useColors();
  const t = useT();
  const report = useReportMessage();
  const block = useBlockMember();
  const unblock = useUnblockMember();

  const [reason, setReason] = useState<Reason | null>(null);
  const [note, setNote] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A fresh sheet every time it opens: a half-filled report from last time reappearing would
  // be both confusing and a way to file the wrong reason by accident.
  useEffect(() => {
    if (reportTarget) {
      setReason(null);
      setNote("");
      setAlsoBlock(true);
      setError(null);
    }
  }, [reportTarget]);

  const closeReport = () => onReportTarget(null);

  const submitReport = async () => {
    if (!reason) return;
    setError(null);
    try {
      await report.mutateAsync({
        conversationId,
        messageId: reportTarget?.messageId ?? null,
        reason,
        note: note.trim(),
        block: alsoBlock,
      });
      closeReport();
      onNotice(t("msg.reportSent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("msg.reportFailed"));
    }
  };

  const toggleBlock = async () => {
    setError(null);
    try {
      if (blockedByMe) {
        await unblock.mutateAsync({ userId: other.id });
        onNotice(t("msg.unblocked"));
      } else {
        await block.mutateAsync({ userId: other.id });
        onNotice(t("msg.blocked"));
      }
      setConfirmBlock(false);
      onCloseMenu();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("msg.blockFailed"));
    }
  };

  const busy = report.isPending || block.isPending || unblock.isPending;

  return (
    <>
      {/* Header menu: the two moderation actions, nothing else. */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={onCloseMenu}>
        <View style={styles.stage}>
          <Pressable
            style={styles.backdrop}
            accessibilityLabel={t("common.close")}
            onPress={onCloseMenu}
          />
          <View
            style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <View style={[styles.head, { borderColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: Fonts?.semibold }]}>
                {other.name}
              </Text>
              <Pressable accessibilityLabel={t("common.close")} onPress={onCloseMenu} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <Pressable
              accessibilityLabel={t("msg.reportThread")}
              onPress={() => {
                onCloseMenu();
                onReportTarget({ messageId: null });
              }}
              style={styles.row}
            >
              <Ionicons name="flag-outline" size={20} color={colors.foreground} />
              <Text style={[styles.rowText, { color: colors.foreground }]}>
                {t("msg.reportThread")}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel={blockedByMe ? t("msg.unblock") : t("msg.block")}
              onPress={() => {
                if (blockedByMe) void toggleBlock();
                else setConfirmBlock(true);
              }}
              disabled={busy}
              style={styles.row}
            >
              <Ionicons
                name={blockedByMe ? "person-add-outline" : "hand-left-outline"}
                size={20}
                color={blockedByMe ? colors.foreground : colors.destructive}
              />
              <Text
                style={[
                  styles.rowText,
                  { color: blockedByMe ? colors.foreground : colors.destructive },
                ]}
              >
                {blockedByMe ? t("msg.unblock") : t("msg.block")}
              </Text>
              {busy ? <ActivityIndicator size="small" color={colors.mutedForeground} /> : null}
            </Pressable>

            {error ? (
              <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Blocking is destructive enough to confirm, and the copy says it is reversible. */}
      <Modal
        visible={confirmBlock}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmBlock(false)}
      >
        <View style={styles.centreStage}>
          <View
            style={[styles.dialog, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <Text style={[styles.dialogTitle, { color: colors.foreground, fontFamily: Fonts?.semibold }]}>
              {t("msg.blockTitle", { name: other.name })}
            </Text>
            <Text style={[styles.dialogBody, { color: colors.mutedForeground }]}>
              {t("msg.blockBody")}
            </Text>
            <View style={styles.dialogActions}>
              <Pressable
                accessibilityLabel={t("common.cancel")}
                onPress={() => setConfirmBlock(false)}
                style={[styles.ghostBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.btnText, { color: colors.foreground }]}>
                  {t("common.cancel")}
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel={t("msg.block")}
                onPress={() => void toggleBlock()}
                disabled={busy}
                style={[styles.solidBtn, { backgroundColor: colors.destructive, opacity: busy ? 0.6 : 1 }]}
              >
                <Text style={[styles.btnText, { color: "#FFFFFF" }]}>{t("msg.block")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* The report form. Reason is required; the note and the block are not. */}
      <Modal
        visible={Boolean(reportTarget)}
        transparent
        animationType="slide"
        onRequestClose={closeReport}
      >
        <View style={styles.stage}>
          <Pressable
            style={styles.backdrop}
            accessibilityLabel={t("common.close")}
            onPress={closeReport}
          />
          <View
            style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}
          >
            <View style={[styles.head, { borderColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}>
                {reportTarget?.messageId ? t("msg.reportMessage") : t("msg.reportThread")}
              </Text>
              <Pressable accessibilityLabel={t("common.close")} onPress={closeReport} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
              <Text style={[styles.label, { color: colors.foreground }]}>{t("msg.reportWhy")}</Text>
              {REASONS.map((item) => {
                const picked = reason === item.value;
                return (
                  <Pressable
                    key={item.value}
                    accessibilityLabel={t(item.label as TKey)}
                    onPress={() => setReason(item.value)}
                    style={[
                      styles.option,
                      {
                        borderColor: picked ? colors.amber : colors.border,
                        backgroundColor: picked ? "rgba(245,158,11,0.10)" : colors.card,
                      },
                    ]}
                  >
                    <Ionicons
                      name={picked ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={picked ? colors.amber : colors.mutedForeground}
                    />
                    <Text style={[styles.optionText, { color: colors.foreground }]}>
                      {t(item.label as TKey)}
                    </Text>
                  </Pressable>
                );
              })}

              <TextInput
                accessibilityLabel={t("msg.reportNote")}
                value={note}
                onChangeText={setNote}
                placeholder={t("msg.reportNote")}
                placeholderTextColor={colors.mutedForeground}
                multiline
                maxLength={1000}
                style={[
                  styles.note,
                  {
                    color: colors.foreground,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
              />

              <Pressable
                accessibilityLabel={t("msg.reportAlsoBlock")}
                onPress={() => setAlsoBlock((on) => !on)}
                style={styles.check}
              >
                <Ionicons
                  name={alsoBlock ? "checkbox" : "square-outline"}
                  size={20}
                  color={alsoBlock ? colors.amber : colors.mutedForeground}
                />
                <Text style={[styles.optionText, { color: colors.foreground }]}>
                  {t("msg.reportAlsoBlock")}
                </Text>
              </Pressable>

              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                {t("msg.reportHint")}
              </Text>

              {error ? (
                <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
              ) : null}

              <Pressable
                accessibilityLabel={t("msg.reportSubmit")}
                onPress={() => void submitReport()}
                disabled={!reason || report.isPending}
                style={[
                  styles.solidBtn,
                  {
                    backgroundColor: colors.amber,
                    opacity: !reason || report.isPending ? 0.45 : 1,
                  },
                ]}
              >
                {report.isPending ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={[styles.btnText, { color: colors.background }]}>
                    {t("msg.reportSubmit")}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    maxHeight: "86%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    paddingBottom: 28,
    overflow: "hidden",
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 16, flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowText: { fontSize: 15, flex: 1 },
  form: { padding: 16, gap: 10 },
  label: { fontSize: 13, marginBottom: 2 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionText: { fontSize: 14, flex: 1 },
  note: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: "top",
  },
  check: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  hint: { fontSize: 11, lineHeight: 16 },
  error: { fontSize: 12, paddingHorizontal: 16, paddingBottom: 8 },
  solidBtn: { borderRadius: 10, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  ghostBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { fontSize: 14 },
  centreStage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dialog: { width: "100%", borderWidth: 1, borderRadius: 16, padding: 20, gap: 10 },
  dialogTitle: { fontSize: 16 },
  dialogBody: { fontSize: 13, lineHeight: 19 },
  dialogActions: { flexDirection: "row", gap: 10, marginTop: 8 },
});
