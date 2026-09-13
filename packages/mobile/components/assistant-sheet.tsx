import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isChatMessage, textOf, useAgentChat, type ChatMessage } from "@/lib/agent-chat";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import {
  ASSISTANT_NAME,
  assistantWasRequested,
  onAssistantOpen,
  useAssistantAccess,
} from "@/lib/assistant";

/**
 * The GeoCliks AI Assistant, as a sheet that slides up over whatever screen you are on.
 *
 * It has no handle of its own: it is opened from the assistant link in the drawer footer and at
 * the bottom of Settings, and only for a workspace whose plan includes it. Mounted once at the
 * app root so the transcript survives moving between tabs, and mirrored into AsyncStorage so it
 * survives the app being closed. The store is versioned, so a future change to the stored shape
 * can drop old transcripts instead of crashing on them.
 *
 * It talks to the same `/api/agent/messages` route as the website's panel — one agent, one
 * system prompt, one set of limits.
 */
const KEY = "geocliks.assistant.v1";
const MAX_STORED = 40;

const baseUrl = Constants.expoConfig?.extra?.apiUrl ?? process.env.EXPO_PUBLIC_API_URL;

/**
 * Just enough markdown for a chat bubble: **bold** and `code` inline, and "- " lines as a
 * list. Built as nested <Text> rather than parsed HTML, so model output can never inject
 * anything but characters. Mirrors the website's `Rich`.
 */
function Rich({ text, color }: { text: string; color: string }) {
  const groups: { bullets: boolean; lines: string[] }[] = [];
  let broken = true;
  for (const line of text.split("\n")) {
    // A blank line ends the current group, so paragraphs keep the gap the model intended.
    if (line.trim() === "") {
      broken = true;
      continue;
    }
    const bullets = /^\s*[-*]\s+/.test(line);
    const last = groups[groups.length - 1];
    if (!broken && last && last.bullets === bullets) last.lines.push(line);
    else groups.push({ bullets, lines: [line] });
    broken = false;
  }

  return (
    <View style={styles.rich}>
      {groups.map((group, gi) =>
        group.bullets ? (
          <View key={gi} style={styles.bullets}>
            {group.lines.map((line, li) => (
              <View key={li} style={styles.bullet}>
                <Text style={[styles.bulletDot, { color }]}>•</Text>
                <Text style={[styles.body, styles.bulletText, { color }]}>
                  <Inline text={line.replace(/^\s*[-*]\s+/, "")} />
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text key={gi} style={[styles.body, { color }]}>
            <Inline text={group.lines.join("\n")} />
          </Text>
        ),
      )}
    </View>
  );
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <Text key={i} style={{ fontFamily: Fonts?.semibold }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <Text key={i} style={{ fontFamily: Fonts?.mono }}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </>
  );
}

export function AssistantSheet() {
  const colors = useColors();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const allowed = useAssistantAccess();
  // Loaded on demand by <AssistantHost />, which mounts it the moment someone asks for the
  // assistant — so it comes up open rather than waiting for a second press.
  const [open, setOpen] = useState(assistantWasRequested);
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const scroller = useRef<ScrollView>(null);

  const { messages, sendMessage, status, stop, error, setMessages, clearError } = useAgentChat(
    `${baseUrl}/api/agent/messages`,
  );

  // Restoring after mount rather than seeding useChat: the sheet is mounted at the app root at
  // launch, long before AsyncStorage answers, and a transcript is worth waiting a frame for.
  const restored = useRef(false);
  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        if (live && Array.isArray(parsed)) {
          // Only what still looks like a message, so a stale shape degrades to an empty chat.
          setMessages((parsed as ChatMessage[]).filter(isChatMessage).slice(-MAX_STORED));
        }
      } catch {
        /* starts empty */
      } finally {
        restored.current = true;
      }
    })();
    return () => {
      live = false;
    };
  }, [setMessages]);

  // Skipping the passes before the restore has finished, so an empty chat is never written over
  // the transcript that is still being read back.
  useEffect(() => {
    if (!restored.current) return;
    void AsyncStorage.setItem(KEY, JSON.stringify(messages.slice(-MAX_STORED))).catch(() => {
      // Blocked storage: the chat still works for this session, it just will not persist.
    });
  }, [messages]);

  // Opened from the drawer and from Settings, which are rendered far from here.
  useEffect(() => onAssistantOpen(() => setOpen(true)), []);

  // Slides up over the screen, and is kept mounted until it has slid back down.
  const height = Dimensions.get("window").height;
  const slide = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    if (open) setMounted(true);
    Animated.timing(slide, {
      toValue: open ? 0 : height,
      duration: open ? 260 : 200,
      easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [open, height, slide]);

  // Following the tail while a reply streams in, and on the pass that opens the sheet — where a
  // restored transcript would otherwise start at its oldest message.
  useEffect(() => {
    if (!mounted) return;
    const frame = requestAnimationFrame(() => scroller.current?.scrollToEnd({ animated: false }));
    return () => cancelAnimationFrame(frame);
  }, [messages, status, mounted]);

  const suggestions = useMemo(
    () => [tr("assistant.suggest1"), tr("assistant.suggest2"), tr("assistant.suggest3")],
    [tr],
  );

  // Losing the plan mid-session (a downgrade, a sign-out) takes the sheet with it, the same way
  // it takes the links that open it.
  if (!allowed) return null;

  const busy = status === "streaming" || status === "submitted";

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    clearError();
    setInput("");
    void sendMessage({ text });
  };

  const ask = (text: string) => {
    clearError();
    void sendMessage({ text });
  };

  const reset = () => {
    setMessages([]);
    clearError();
  };

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={() => setOpen(false)}>
      <View style={styles.stage}>
        {/* A tap on the strip of screen above the sheet puts it away. */}
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityLabel={tr("assistant.close")}
        />
        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              // Clear of the status bar and the notch: the sheet is the tallest overlay in the
              // app and its header would otherwise sit under the clock.
              top: insets.top + 10,
              transform: [{ translateY: slide }],
            },
          ]}
        >
          <KeyboardAvoidingView
            style={styles.fill}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={[styles.head, { borderColor: colors.border }]}>
              <Ionicons name="sparkles" size={16} color={colors.amber} />
              <Text
                numberOfLines={1}
                style={[styles.title, { color: colors.foreground, fontFamily: Fonts?.display }]}
              >
                {ASSISTANT_NAME}
              </Text>
              {messages.length > 0 ? (
                <Pressable
                  onPress={reset}
                  hitSlop={8}
                  accessibilityLabel={tr("assistant.clear")}
                  style={styles.headBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.mutedForeground} />
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={8}
                accessibilityLabel={tr("assistant.close")}
                style={styles.headBtn}
              >
                <Ionicons name="close" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <ScrollView
              ref={scroller}
              contentContainerStyle={styles.transcript}
              keyboardShouldPersistTaps="handled"
            >
              {messages.length === 0 ? (
                <View style={styles.empty}>
                  <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
                    {tr("assistant.greeting")}
                  </Text>
                  {suggestions.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => ask(s)}
                      style={[
                        styles.suggestion,
                        { borderColor: colors.border, backgroundColor: colors.card },
                      ]}
                    >
                      <Text style={[styles.suggestionText, { color: colors.foreground }]}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {messages.map((message) => {
                const text = textOf(message);
                if (!text) return null;
                const mine = message.role === "user";
                return (
                  <View
                    key={message.id}
                    style={[styles.row, mine ? styles.rowMine : styles.rowTheirs]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        mine
                          ? [styles.bubbleMine, { backgroundColor: colors.amber }]
                          : [
                              styles.bubbleTheirs,
                              { backgroundColor: colors.card, borderColor: colors.border },
                            ],
                      ]}
                    >
                      {mine ? (
                        <Text style={[styles.body, { color: colors.primaryForeground }]}>
                          {text}
                        </Text>
                      ) : (
                        <Rich text={text} color={colors.foreground} />
                      )}
                    </View>
                  </View>
                );
              })}

              {status === "submitted" ? (
                <View style={[styles.row, styles.rowTheirs]}>
                  <View
                    style={[
                      styles.bubble,
                      styles.bubbleTheirs,
                      styles.thinking,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <ActivityIndicator size="small" color={colors.mutedForeground} />
                  </View>
                </View>
              ) : null}

              {error ? (
                <Text style={[styles.error, { color: colors.alert }]}>{tr("assistant.error")}</Text>
              ) : null}
            </ScrollView>

            <View
              style={[
                styles.foot,
                // The home-bar inset, so the composer is not sitting on the gesture area.
                { borderColor: colors.border, paddingBottom: Math.max(insets.bottom, 12) },
              ]}
            >
              <View style={styles.composer}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder={tr("assistant.placeholder")}
                  placeholderTextColor={colors.mutedForeground}
                  accessibilityLabel={tr("assistant.placeholder")}
                  multiline
                  style={[
                    styles.input,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      color: colors.foreground,
                    },
                  ]}
                />
                {busy ? (
                  <Pressable
                    onPress={() => stop()}
                    accessibilityLabel={tr("assistant.stop")}
                    style={[
                      styles.sendBtn,
                      { borderColor: colors.border, backgroundColor: colors.card },
                    ]}
                  >
                    <Ionicons name="square" size={16} color={colors.mutedForeground} />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={send}
                    disabled={!input.trim()}
                    accessibilityLabel={tr("assistant.send")}
                    style={[
                      styles.sendBtn,
                      {
                        borderColor: colors.amber,
                        backgroundColor: colors.amber,
                        opacity: input.trim() ? 1 : 0.4,
                      },
                    ]}
                  >
                    <Ionicons name="send" size={16} color={colors.primaryForeground} />
                  </Pressable>
                )}
              </View>
              <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
                {tr("assistant.disclaimer")}
              </Text>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  stage: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  // Stops short of the top edge on purpose: the strip of screen behind it is what says this is
  // a sheet over the app rather than another tab, and it is where you tap to dismiss it.
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: { flex: 1, fontSize: 14 },
  headBtn: { padding: 2 },
  transcript: { padding: 14, gap: 10 },
  empty: { gap: 10, alignItems: "flex-start" },
  greeting: { fontSize: 13, lineHeight: 20 },
  suggestion: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  suggestionText: { fontSize: 12.5, lineHeight: 18 },
  row: { flexDirection: "row" },
  rowMine: { justifyContent: "flex-end" },
  rowTheirs: { justifyContent: "flex-start" },
  bubble: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12 },
  bubbleMine: { maxWidth: "85%", borderBottomRightRadius: 4 },
  bubbleTheirs: { maxWidth: "92%", borderWidth: 1, borderBottomLeftRadius: 4 },
  thinking: { paddingVertical: 12, paddingHorizontal: 16 },
  body: { fontSize: 13, lineHeight: 20 },
  rich: { gap: 8 },
  bullets: { gap: 4 },
  bullet: { flexDirection: "row", gap: 7 },
  bulletDot: { fontSize: 13, lineHeight: 20 },
  bulletText: { flex: 1 },
  error: { fontSize: 12, lineHeight: 18 },
  foot: { borderTopWidth: 1, paddingHorizontal: 12, paddingTop: 10, gap: 8 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 13,
    maxHeight: 120,
  },
  sendBtn: {
    borderWidth: 1,
    borderRadius: 10,
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  disclaimer: { fontSize: 10.5, lineHeight: 15 },
});
