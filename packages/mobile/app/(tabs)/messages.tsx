import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { LanguageMenu } from "@/components/language-menu";
import { ProfileMenu } from "@/components/profile-menu";
import { useT } from "@/lib/i18n";
import { useOrg } from "@/queries/orgs";
import {
  useBroadcastMessage,
  useContacts,
  useConversations,
  useOpenConversation,
} from "@/queries/messages";

function initials(name: string | null | undefined) {
  const source = (name ?? "").trim() || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase() || source.slice(0, 2).toUpperCase();
}

function ago(value: Date | string | null) {
  if (!value) return "";
  const at = typeof value === "string" ? new Date(value) : value;
  const mins = Math.floor((Date.now() - at.getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h`;
  return `${Math.floor(mins / 1440)}d`;
}

export default function Messages() {
  const colors = useColors();
  const t = useT();
  const router = useRouter();
  const org = useOrg();
  const conversations = useConversations();
  const contacts = useContacts();
  const open = useOpenConversation();
  const broadcast = useBroadcastMessage();

  const [picker, setPicker] = useState(false);
  const [caster, setCaster] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [text, setText] = useState("");

  // Only owners/admins/managers can push one message to the whole crew.
  const canBroadcast = org.data?.role !== "field";

  const start = async (userId: string) => {
    setPicker(false);
    const thread = await open.mutateAsync({ userId });
    router.push(`/messages/${thread.id}` as never);
  };

  const sendBroadcast = async () => {
    const body = text.trim();
    if (!body) return;
    const out = await broadcast.mutateAsync({ body });
    setText("");
    setCaster(false);
    setNote(t("msg.broadcastSent", { n: out.sent }));
    setTimeout(() => setNote(null), 4000);
  };

  const rows = conversations.data ?? [];

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.header}>
        <ProfileMenu />
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}
        >
          {t("msg.title").toUpperCase()}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <LanguageMenu />
          {canBroadcast ? (
            <Pressable
              accessibilityLabel={t("msg.broadcast")}
              onPress={() => setCaster(true)}
              style={[styles.icon, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Ionicons name="megaphone-outline" size={20} color={colors.foreground} />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityLabel={t("msg.new")}
            onPress={() => setPicker(true)}
            style={[styles.icon, { backgroundColor: colors.amber, borderColor: colors.amber }]}
          >
            <Ionicons name="add" size={22} color={colors.background} />
          </Pressable>
        </View>
      </View>

      {note ? (
        <Text style={[styles.note, { color: colors.success }]}>{note}</Text>
      ) : null}

      {conversations.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.amber} />
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t("msg.none")}</Text>
          <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
            {t("msg.noneHint")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable
              accessibilityLabel={item.other.name}
              onPress={() => router.push(`/messages/${item.id}` as never)}
              style={[styles.row, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.avatarText, { color: colors.foreground }]}>
                  {initials(item.other.name)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text
                    numberOfLines={1}
                    style={[styles.name, { color: colors.foreground, fontFamily: Fonts?.semibold }]}
                  >
                    {item.other.name}
                  </Text>
                  <Text style={[styles.time, { color: colors.mutedForeground }]}>
                    {ago(item.lastMessageAt)}
                  </Text>
                </View>
                <Text numberOfLines={1} style={[styles.preview, { color: colors.mutedForeground }]}>
                  {item.lastMessagePreview || t("msg.empty")}
                </Text>
              </View>
              {item.unread > 0 ? (
                <View style={[styles.badge, { backgroundColor: colors.amber }]}>
                  <Text style={[styles.badgeText, { color: colors.background }]}>{item.unread}</Text>
                </View>
              ) : null}
            </Pressable>
          )}
        />
      )}

      <Modal visible={picker} transparent animationType="slide" onRequestClose={() => setPicker(false)}>
        <View style={[styles.sheetStage, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{t("msg.pick")}</Text>
              <Pressable accessibilityLabel={t("common.close")} onPress={() => setPicker(false)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <FlatList
              data={contacts.data ?? []}
              keyExtractor={(item) => item.userId}
              ListEmptyComponent={
                <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
                  {t("msg.noneHint")}
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  accessibilityLabel={item.name ?? item.email ?? item.userId}
                  onPress={() => void start(item.userId)}
                  style={[styles.contact, { borderBottomColor: colors.border }]}
                >
                  <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.avatarText, { color: colors.foreground }]}>
                      {initials(item.name ?? item.email)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: colors.foreground }]}>
                      {item.name ?? item.email}
                    </Text>
                    <Text style={[styles.time, { color: colors.mutedForeground }]}>{item.role}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={caster} transparent animationType="slide" onRequestClose={() => setCaster(false)}>
        <View style={[styles.sheetStage, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                {t("msg.broadcast")}
              </Text>
              <Pressable accessibilityLabel={t("common.close")} onPress={() => setCaster(false)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <TextInput
              accessibilityLabel={t("msg.broadcast")}
              value={text}
              onChangeText={setText}
              multiline
              placeholder={t("msg.broadcastPlaceholder")}
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
              ]}
            />
            <Pressable
              accessibilityLabel={t("msg.broadcastSend")}
              onPress={() => void sendBroadcast()}
              disabled={broadcast.isPending || !text.trim()}
              style={[
                styles.send,
                { backgroundColor: colors.amber, opacity: broadcast.isPending || !text.trim() ? 0.45 : 1 },
              ]}
            >
              <Text style={[styles.sendText, { color: colors.background }]}>
                {t("msg.broadcastSend")}
              </Text>
            </Pressable>
          </View>
        </View>
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
    paddingVertical: 12,
  },
  title: { fontSize: 18, letterSpacing: 0.8, flexShrink: 1, minWidth: 0, marginHorizontal: 8 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  note: { paddingHorizontal: 16, paddingBottom: 8, fontSize: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  emptyTitle: { fontSize: 16 },
  emptyHint: { fontSize: 12, textAlign: "center", padding: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  avatar: { width: 42, height: 42, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, letterSpacing: 0.5 },
  name: { fontSize: 15, flexShrink: 1 },
  time: { fontSize: 11 },
  preview: { fontSize: 13, marginTop: 2 },
  badge: { minWidth: 22, height: 22, borderRadius: 6, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeText: { fontSize: 11 },
  sheetStage: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    maxHeight: "72%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    paddingBottom: 28,
    overflow: "hidden",
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  sheetTitle: { fontSize: 16, letterSpacing: 0.4 },
  contact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  input: {
    marginHorizontal: 16,
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },
  send: {
    margin: 16,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  sendText: { fontSize: 14, letterSpacing: 0.6 },
});
