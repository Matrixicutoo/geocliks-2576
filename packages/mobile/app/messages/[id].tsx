import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { useVideoPlayer, VideoView } from "expo-video";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import { client } from "@/lib/api";
import { useMarkRead, useRecentCaptures, useSendMessage, useThread } from "@/queries/messages";

function clock(value: Date | string) {
  const at = typeof value === "string" ? new Date(value) : value;
  return at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const apiUrl = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "";

/** Seeded demo photos are public web assets; captures come back as absolute presigned URLs. */
function resolve(url: string) {
  return url.startsWith("http") ? url : `${apiUrl}${url}`;
}

/** Field-first glyph set. Deliberately not an emoji-picker dependency: crews are on mobile data. */
const EMOJI = [
  "👍", "👌", "🙏", "💪", "✅", "❌", "⚠️", "🔥",
  "🚧", "🦺", "🧰", "🔧", "🔨", "🪜", "🏗️", "🚚",
  "📷", "📍", "📅", "⏰", "☀️", "🌧️", "❄️", "💨",
  "😀", "😄", "😅", "😂", "🙂", "😉", "😎", "🤔",
  "😐", "😕", "😢", "😡", "🎉", "👏", "🙌", "🤝",
  "👋", "💯", "⭐", "❤️",
];

/** Full-screen clip playback for a capture opened from a chat bubble. */
function ClipPlayer({ uri, label }: { uri: string; label: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
    p.play();
  });
  return (
    <VideoView
      player={player}
      style={styles.viewerMedia}
      nativeControls
      surfaceType="textureView"
      contentFit="contain"
      accessibilityLabel={label}
    />
  );
}

export default function Thread() {
  const params = useLocalSearchParams<{ id?: string }>();
  const conversationId = typeof params.id === "string" ? params.id : null;
  const colors = useColors();
  const t = useT();
  const router = useRouter();
  const thread = useThread(conversationId);
  const captures = useRecentCaptures(null);
  const send = useSendMessage();
  const markRead = useMarkRead();

  const [text, setText] = useState("");
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturePicker, setCapturePicker] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const [viewer, setViewer] = useState<{ url: string; video: boolean; caption: string } | null>(
    null,
  );
  const listRef = useRef<FlatList<never> | null>(null);

  // Reading the thread clears its unread badge. Keyed on the message count so a
  // new inbound message while the screen is open marks itself read too.
  const count = thread.data?.items.length ?? 0;
  const markReadRef = useRef(markRead.mutate);
  markReadRef.current = markRead.mutate;
  useEffect(() => {
    if (!conversationId || count === 0) return;
    markReadRef.current({ conversationId });
  }, [conversationId, count]);

  const clearRefs = () => {
    setImageKey(null);
    setImagePreview(null);
    setPhotoId(null);
  };

  const attachImage = async () => {
    setError(null);
    const granted = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted.granted) return;
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    const asset = picked.assets?.[0];
    if (picked.canceled || !asset) return;
    setUploading(true);
    try {
      const presigned = await client.upload.presignMessageImage({
        filename: asset.fileName ?? "photo.jpg",
        contentType: asset.mimeType ?? "image/jpeg",
      });
      const blob = await (await fetch(asset.uri)).blob();
      const put = await fetch(presigned.url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": asset.mimeType ?? "image/jpeg" },
      });
      if (!put.ok) throw new Error(`Storage rejected the upload (${put.status})`);
      setImageKey(presigned.key);
      setImagePreview(asset.uri);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("msg.failed"));
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!conversationId) return;
    const body = text.trim();
    if (!body && !imageKey && !photoId) return;
    setError(null);
    try {
      await send.mutateAsync({ conversationId, body, imageKey, photoId });
      setText("");
      clearRefs();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("msg.failed"));
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable accessibilityLabel={t("common.close")} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </Pressable>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.foreground, fontFamily: Fonts?.semibold }]}
        >
          {thread.data?.other.name ?? t("msg.title")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        {thread.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.amber} />
          </View>
        ) : (
          <FlatList
            ref={listRef as never}
            data={thread.data?.items ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>{t("msg.empty")}</Text>
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bubble,
                  {
                    alignSelf: item.mine ? "flex-end" : "flex-start",
                    backgroundColor: item.mine ? colors.amber : colors.card,
                    borderColor: item.mine ? colors.amber : colors.border,
                  },
                ]}
              >
                {item.imageUrl ? (
                  <Pressable
                    accessibilityLabel={t("msg.openMedia")}
                    onPress={() =>
                      setViewer({ url: resolve(item.imageUrl ?? ""), video: false, caption: "" })
                    }
                  >
                    <Image source={{ uri: item.imageUrl }} style={styles.attachment} />
                  </Pressable>
                ) : null}
                {item.photo ? (
                  <Pressable
                    accessibilityLabel={t("msg.openMedia")}
                    onPress={() => {
                      const p = item.photo;
                      if (!p) return;
                      setViewer({
                        url: resolve(p.mediaUrl ?? p.url),
                        video: p.kind === "video",
                        caption: p.code,
                      });
                    }}
                    style={styles.refRow}
                  >
                    <View>
                      <Image source={{ uri: item.photo.url }} style={styles.refThumb} />
                      {item.photo.kind === "video" ? (
                        <View style={styles.playBadge}>
                          <Ionicons name="play" size={11} color="#FFFFFF" />
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.refText,
                        { color: item.mine ? colors.background : colors.mutedForeground, fontFamily: Fonts?.mono },
                      ]}
                    >
                      {item.photo.code}
                    </Text>
                  </Pressable>
                ) : null}
                {item.project ? (
                  <Text
                    style={[
                      styles.refText,
                      { color: item.mine ? colors.background : colors.mutedForeground },
                    ]}
                  >
                    {item.project.name}
                  </Text>
                ) : null}
                {item.body ? (
                  <Text
                    style={[styles.body, { color: item.mine ? colors.background : colors.foreground }]}
                  >
                    {item.body}
                  </Text>
                ) : null}
                <Text
                  style={[
                    styles.stamp,
                    { color: item.mine ? colors.background : colors.mutedForeground },
                  ]}
                >
                  {clock(item.createdAt)}
                </Text>
              </View>
            )}
          />
        )}

        {error ? <Text style={[styles.hint, { color: colors.destructive }]}>{error}</Text> : null}

        {imagePreview || photoId ? (
          <View style={[styles.pending, { borderColor: colors.border, backgroundColor: colors.card }]}>
            {imagePreview ? <Image source={{ uri: imagePreview }} style={styles.refThumb} /> : null}
            {photoId ? (
              <Text style={[styles.refText, { color: colors.mutedForeground }]}>
                {t("msg.capture")}
              </Text>
            ) : null}
            <Pressable accessibilityLabel={t("msg.clearRef")} onPress={clearRefs} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>
        ) : null}

        {emoji ? (
          <View
            style={[
              styles.emojiPanel,
              { borderTopColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            {EMOJI.map((glyph) => (
              <Pressable
                key={glyph}
                accessibilityLabel={glyph}
                onPress={() => {
                  setText((current) => current + glyph);
                  setEmoji(false);
                }}
                style={styles.emojiCell}
              >
                <Text style={styles.emojiGlyph}>{glyph}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <Pressable
            accessibilityLabel={t("msg.attachImage")}
            onPress={() => void attachImage()}
            disabled={uploading}
            hitSlop={8}
            style={styles.composerIcon}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.mutedForeground} />
            ) : (
              <Ionicons name="image-outline" size={22} color={colors.mutedForeground} />
            )}
          </Pressable>
          <Pressable
            accessibilityLabel={t("msg.attachCapture")}
            onPress={() => setCapturePicker(true)}
            hitSlop={8}
            style={styles.composerIcon}
          >
            <Ionicons name="camera-outline" size={22} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            accessibilityLabel={t("msg.emoji")}
            onPress={() => setEmoji((open) => !open)}
            hitSlop={8}
            style={styles.composerIcon}
          >
            <Ionicons
              name="happy-outline"
              size={22}
              color={emoji ? colors.amber : colors.mutedForeground}
            />
          </Pressable>
          <TextInput
            accessibilityLabel={t("msg.placeholder")}
            value={text}
            onChangeText={setText}
            placeholder={t("msg.placeholder")}
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={[
              styles.input,
              { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card },
            ]}
          />
          <Pressable
            accessibilityLabel={t("msg.send")}
            onPress={() => void submit()}
            disabled={send.isPending || (!text.trim() && !imageKey && !photoId)}
            style={[
              styles.sendBtn,
              {
                backgroundColor: colors.amber,
                opacity: send.isPending || (!text.trim() && !imageKey && !photoId) ? 0.45 : 1,
              },
            ]}
          >
            <Ionicons name="send" size={18} color={colors.background} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={capturePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setCapturePicker(false)}
      >
        <View style={styles.sheetStage}>
          <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                {t("msg.attachCapture")}
              </Text>
              <Pressable accessibilityLabel={t("common.close")} onPress={() => setCapturePicker(false)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <FlatList
              data={captures.data ?? []}
              keyExtractor={(item) => item.id}
              numColumns={3}
              contentContainerStyle={{ padding: 12, gap: 8 }}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityLabel={item.code}
                  onPress={() => {
                    setPhotoId(item.id);
                    setCapturePicker(false);
                  }}
                  style={styles.captureCell}
                >
                  <Image source={{ uri: item.url }} style={styles.captureThumb} />
                  <Text
                    numberOfLines={1}
                    style={[styles.captureCode, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                  >
                    {item.code}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(viewer)}
        transparent
        animationType="fade"
        onRequestClose={() => setViewer(null)}
      >
        <View style={styles.viewerStage}>
          <View style={styles.viewerBar}>
            <Text style={[styles.viewerCode, { color: colors.amber, fontFamily: Fonts?.mono }]}>
              {viewer?.caption ?? ""}
            </Text>
            <Pressable
              accessibilityLabel={t("msg.closeViewer")}
              onPress={() => setViewer(null)}
              hitSlop={12}
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </Pressable>
          </View>
          {viewer?.video ? (
            <ClipPlayer uri={viewer.url} label={t("msg.openMedia")} />
          ) : viewer ? (
            <Image source={{ uri: viewer.url }} style={styles.viewerMedia} resizeMode="contain" />
          ) : null}
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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 16, flex: 1, textAlign: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hint: { fontSize: 12, textAlign: "center", padding: 12 },
  bubble: { maxWidth: "82%", borderRadius: 12, borderWidth: 1, padding: 10, gap: 6 },
  body: { fontSize: 14, lineHeight: 20 },
  stamp: { fontSize: 10, alignSelf: "flex-end" },
  attachment: { width: 200, height: 150, borderRadius: 8 },
  refRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  refThumb: { width: 40, height: 40, borderRadius: 8 },
  refText: { fontSize: 11, letterSpacing: 0.4 },
  playBadge: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiPanel: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  emojiCell: { width: "12.5%", alignItems: "center", paddingVertical: 6 },
  emojiGlyph: { fontSize: 22 },
  viewerStage: { flex: 1, backgroundColor: "rgba(0,0,0,0.94)", justifyContent: "center" },
  viewerBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  viewerCode: { fontSize: 12, letterSpacing: 0.6 },
  viewerMedia: { width: "100%", height: "72%" },
  pending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerIcon: { paddingBottom: 10 },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sheetStage: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    maxHeight: "70%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    paddingBottom: 24,
    overflow: "hidden",
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  sheetTitle: { fontSize: 16 },
  captureCell: { width: "31%", margin: "1%", gap: 4 },
  captureThumb: { width: "100%", aspectRatio: 1, borderRadius: 8 },
  captureCode: { fontSize: 9 },
});
