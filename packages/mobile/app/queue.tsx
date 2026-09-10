import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { LanguageMenu } from "@/components/language-menu";
import { useT } from "@/lib/i18n";
import { formatCoords, formatStamp } from "@/components/stamp";
import { dequeue, drainQueue, readQueue, type QueuedPhoto } from "@/lib/queue";
import { useInvalidatePhotos } from "@/queries/photos";
import { useHasSession } from "@/hooks/use-session";

export default function Queue() {
  const colors = useColors();
  const t = useT();
  const router = useRouter();
  const [items, setItems] = useState<QueuedPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const invalidate = useInvalidatePhotos();
  const { hasSession } = useHasSession();

  const refresh = useCallback(async () => {
    setItems(await readQueue());
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    return () => clearInterval(timer);
  }, [refresh]);

  const drain = async () => {
    // Signed out there is no session to presign or seal an upload with, so trying would
    // only produce failures. The captures wait here until an account exists, then
    // hooks/use-drain-on-signin.ts drains them by itself.
    if (!hasSession) return;
    setBusy(true);
    setResult(null);
    try {
      const outcome = await drainQueue();
      invalidate();
      await refresh();
      setResult(
        outcome.failed > 0
          ? t("queue.uploadedPartial", { n: outcome.uploaded, failed: outcome.failed })
          : t("queue.uploadedOk", { n: outcome.uploaded }),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityLabel={t("common.close")}
          >
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          </Pressable>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}
          >
            {t("queue.title").toUpperCase()}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <LanguageMenu />
        <Pressable
          onPress={drain}
          disabled={busy || items.length === 0 || !hasSession}
          style={[
            styles.btn,
            {
              backgroundColor: colors.amber,
              opacity: busy || items.length === 0 || !hasSession ? 0.45 : 1,
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={[styles.btnText, { color: colors.background }]}>{t("queue.uploadAll")}</Text>
          )}
        </Pressable>
        </View>
      </View>

      <Text style={[styles.sub, { color: colors.mutedForeground }]}>
        {hasSession ? t("queue.note") : t("queue.signedOutBody")}
      </Text>

      {result ? (
        <Text style={[styles.result, { color: colors.verified, fontFamily: Fonts?.mono }]}>
          {result}
        </Text>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle-outline" size={28} color={colors.verified} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t("queue.clear")}</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {t("queue.clearBody")}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Image source={{ uri: item.uri }} style={styles.thumb} resizeMode="cover" />
            <View style={styles.cardBody}>
              <Text style={[styles.stamp, { color: colors.foreground, fontFamily: Fonts?.mono }]}>
                {formatStamp(new Date(item.capturedAt))}
              </Text>
              <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
                {formatCoords(item.lat, item.lng)}
              </Text>
              <Text style={[styles.meta, { color: colors.amber }]}>
                {(item.projectName ?? t("queue.unassigned")).toUpperCase()} · {item.tag.toUpperCase()}
              </Text>
              {item.error ? (
                <Text style={[styles.err, { color: colors.destructive }]}>{item.error}</Text>
              ) : (
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {t("queue.waiting")}
                </Text>
              )}
            </View>
            <Pressable
              hitSlop={10}
              onPress={async () => {
                setItems(await dequeue(item.id));
              }}
            >
              <Ionicons name="trash-outline" size={17} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  title: { fontSize: 15, letterSpacing: 1.5, flexShrink: 1, minWidth: 0, marginRight: 10 },
  btn: { paddingHorizontal: 12, paddingVertical: 9, minWidth: 84, alignItems: "center", borderRadius: 8 },
  btnText: { fontSize: 12, fontWeight: "700" },
  sub: { fontSize: 12, lineHeight: 18, paddingHorizontal: 16, paddingTop: 10 },
  result: { fontSize: 11, paddingHorizontal: 16, paddingTop: 8 },
  list: { padding: 16, gap: 10 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, padding: 10, borderRadius: 12 },
  thumb: { width: 64, height: 64, backgroundColor: "#1A212C", borderRadius: 8 },
  cardBody: { flex: 1, gap: 2 },
  stamp: { fontSize: 12 },
  meta: { fontSize: 10, letterSpacing: 0.4 },
  err: { fontSize: 10 },
  empty: { borderWidth: 1, padding: 28, alignItems: "center", gap: 8, borderRadius: 12 },
  emptyTitle: { fontSize: 15, fontWeight: "700" },
  emptyText: { fontSize: 12, textAlign: "center", lineHeight: 18 },
});
