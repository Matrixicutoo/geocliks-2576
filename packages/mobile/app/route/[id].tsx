import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { LanguageMenu } from "@/components/language-menu";
import { useT, type TKey } from "@/lib/i18n";
import { drainQueue, readQueue, type FailedReason } from "@/lib/queue";
import { useRoute, useSkipStop, useStartRoute } from "@/queries/routes";

const REASONS: { key: FailedReason; label: TKey }[] = [
  { key: "nobody_home", label: "run.reason.nobody_home" },
  { key: "refused", label: "run.reason.refused" },
  { key: "wrong_address", label: "run.reason.wrong_address" },
  { key: "closed", label: "run.reason.closed" },
  { key: "inaccessible", label: "run.reason.inaccessible" },
  { key: "other", label: "run.reason.other" },
];

/** Opens the phone's own maps app. Cheap, and the single most useful button on this screen. */
function navigateTo(address: string, lat: number | null, lng: number | null) {
  const target = lat != null && lng != null ? `${lat},${lng}` : address;
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?daddr=${encodeURIComponent(target)}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`;
  void Linking.openURL(url);
}

export default function RouteRun() {
  const colors = useColors();
  const t = useT();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routeId = typeof id === "string" ? id : null;
  const query = useRoute(routeId);
  const startRoute = useStartRoute();
  const skipStop = useSkipStop();

  // Stops closed offline are still sitting in the upload queue. Show them as done right away
  // so a driver in a dead zone is not staring at a stop they already photographed.
  const [queuedStopIds, setQueuedStopIds] = useState<string[]>([]);
  // Stops whose photo is already sealed on the server but whose close never landed.
  // These are the ones the driver can genuinely fix with Retry.
  const [stuckStopIds, setStuckStopIds] = useState<string[]>([]);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [skipOpen, setSkipOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [reason, setReason] = useState<FailedReason | null>(null);
  const [note, setNote] = useState("");

  const refreshQueue = useCallback(async () => {
    const items = await readQueue();
    setQueuedStopIds(
      items.map((i) => i.routeStopId).filter((s): s is string => typeof s === "string"),
    );
    setStuckStopIds(
      items
        .filter((i) => i.stopOnly)
        .map((i) => i.routeStopId)
        .filter((s): s is string => typeof s === "string"),
    );
  }, []);

  useEffect(() => {
    void refreshQueue();
    const timer = setInterval(() => void refreshQueue(), 5000);
    return () => clearInterval(timer);
  }, [refreshQueue]);

  const route = query.data?.route ?? null;
  const stops = useMemo(() => query.data?.stops ?? [], [query.data]);

  const isClosed = useCallback(
    (stop: (typeof stops)[number]) =>
      stop.status !== "pending" || queuedStopIds.includes(stop.id),
    [queuedStopIds],
  );

  const current = stops.find((s) => !isClosed(s)) ?? null;
  const done = stops.filter((s) => isClosed(s)).length;
  const remaining = stops.filter((s) => !isClosed(s) && s.id !== current?.id);

  const goShoot = (outcome: "delivered" | "failed") => {
    if (!current || !route) return;
    router.push({
      pathname: "/",
      params: {
        stopId: current.id,
        routeId: route.id,
        stopSeq: String(current.seq + 1),
        stopTotal: String(stops.length),
        stopLabel: current.address ?? current.addressRaw,
        recipient: current.recipientName ?? "",
        outcome,
        reason: outcome === "failed" ? (reason ?? "other") : "",
        note: outcome === "failed" ? note.trim() : "",
        // Ticked by the office on the route; without this the camera never asks for one.
        requireSignature: route.requireSignature ? "1" : "",
      },
    });
    setReasonOpen(false);
    setSkipOpen(false);
    setReason(null);
    setNote("");
  };

  const doSkip = () => {
    if (!current) return;
    skipStop.mutate(
      { stopId: current.id, note: note.trim() || undefined },
      {
        onSuccess: () => {
          setSkipOpen(false);
          setNote("");
        },
      },
    );
  };

  // A stop photographed in a dead zone: the photo is sealed but the stop never closed.
  // Draining pushes only the outstanding close, so nothing is uploaded twice.
  const retrySync = useCallback(async () => {
    setRetrying(true);
    try {
      await drainQueue();
    } finally {
      await refreshQueue();
      await query.refetch();
      setRetrying(false);
    }
  }, [refreshQueue, query]);

  const started = route?.status === "active" || route?.status === "completed";

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
            {(route?.name ?? t("routes.title")).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.count, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
            {done} / {stops.length}
          </Text>
          <LanguageMenu />
        </View>
      </View>

      {query.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.amber} />
      ) : (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {stops.length === 0 ? (
            <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {t("run.noStops")}
              </Text>
            </View>
          ) : null}

          {!started && stops.length > 0 ? (
            <Pressable
              onPress={() => routeId && startRoute.mutate({ routeId })}
              disabled={startRoute.isPending}
              style={[styles.primary, { backgroundColor: colors.amber }]}
            >
              {startRoute.isPending ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.primaryText, { color: colors.primaryForeground }]}>
                  {t("run.start").toUpperCase()}
                </Text>
              )}
            </Pressable>
          ) : null}

          {current ? (
            <View style={[styles.card, { borderColor: colors.amber, backgroundColor: colors.card }]}>
              <Text style={[styles.stopOf, { color: colors.amber, fontFamily: Fonts?.mono }]}>
                {t("run.stopOf", { n: current.seq + 1, total: stops.length }).toUpperCase()}
              </Text>
              <Text style={[styles.address, { color: colors.foreground }]}>
                {current.address ?? current.addressRaw}
              </Text>
              {current.recipientName ? (
                <Text style={[styles.line, { color: colors.foreground }]}>
                  {current.recipientName}
                </Text>
              ) : null}
              {current.reference ? (
                <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
                  {t("run.ref").toUpperCase()} · {current.reference}
                </Text>
              ) : null}
              {current.notes ? (
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {t("run.notes")}: {current.notes}
                </Text>
              ) : null}

              <Pressable
                onPress={() =>
                  navigateTo(current.address ?? current.addressRaw, current.lat, current.lng)
                }
                style={[styles.outline, { borderColor: colors.border }]}
              >
                <Ionicons name="navigate-outline" size={16} color={colors.foreground} />
                <Text style={[styles.outlineText, { color: colors.foreground }]}>
                  {t("run.navigate")}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => goShoot("delivered")}
                style={[styles.primary, { backgroundColor: colors.amber }]}
              >
                <Ionicons name="camera" size={17} color={colors.primaryForeground} />
                <Text style={[styles.primaryText, { color: colors.primaryForeground }]}>
                  {t("run.takePhoto").toUpperCase()}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setReasonOpen((v) => !v)}
                style={[styles.outline, { borderColor: colors.border }]}
              >
                <Ionicons name="close-circle-outline" size={16} color={colors.destructive} />
                <Text style={[styles.outlineText, { color: colors.destructive }]}>
                  {t("run.cantDeliver")}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSkipOpen((v) => !v)}
                style={[styles.outline, { borderColor: colors.border }]}
              >
                <Ionicons
                  name="play-skip-forward-outline"
                  size={16}
                  color={colors.mutedForeground}
                />
                <Text style={[styles.outlineText, { color: colors.mutedForeground }]}>
                  {t("run.skip")}
                </Text>
              </Pressable>

              {skipOpen ? (
                <View style={[styles.sheet, { borderColor: colors.border }]}>
                  <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                    {t("run.skipTitle")}
                  </Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {t("run.skipHint")}
                  </Text>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder={t("run.notes")}
                    placeholderTextColor={colors.mutedForeground}
                    accessibilityLabel={t("run.notes")}
                    style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                  />
                  <Pressable
                    onPress={doSkip}
                    disabled={skipStop.isPending}
                    style={[styles.primary, { backgroundColor: colors.amber }]}
                  >
                    {skipStop.isPending ? (
                      <ActivityIndicator size="small" color={colors.primaryForeground} />
                    ) : (
                      <Text style={[styles.primaryText, { color: colors.primaryForeground }]}>
                        {t("run.skipConfirm").toUpperCase()}
                      </Text>
                    )}
                  </Pressable>
                </View>
              ) : null}

              {reasonOpen ? (
                <View style={[styles.sheet, { borderColor: colors.border }]}>
                  <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                    {t("run.reasonTitle")}
                  </Text>
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {t("run.reasonHint")}
                  </Text>
                  <View style={styles.chips}>
                    {REASONS.map((r) => {
                      const on = reason === r.key;
                      return (
                        <Pressable
                          key={r.key}
                          onPress={() => setReason(r.key)}
                          accessibilityLabel={t(r.label)}
                          style={[
                            styles.chip,
                            {
                              borderColor: on ? colors.amber : colors.border,
                              backgroundColor: on ? colors.amber : "transparent",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              { color: on ? colors.primaryForeground : colors.foreground },
                            ]}
                          >
                            {t(r.label)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder={t("run.notes")}
                    placeholderTextColor={colors.mutedForeground}
                    accessibilityLabel={t("run.notes")}
                    style={[
                      styles.input,
                      { borderColor: colors.border, color: colors.foreground },
                    ]}
                  />
                  <Pressable
                    onPress={() => goShoot("failed")}
                    disabled={!reason}
                    style={[
                      styles.primary,
                      { backgroundColor: colors.amber, opacity: reason ? 1 : 0.45 },
                    ]}
                  >
                    <Text style={[styles.primaryText, { color: colors.primaryForeground }]}>
                      {t("run.reasonPhoto").toUpperCase()}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ) : stops.length > 0 ? (
            <View style={[styles.card, { borderColor: colors.verified, backgroundColor: colors.card }]}>
              <Ionicons name="checkmark-circle" size={30} color={colors.verified} />
              <Text style={[styles.doneTitle, { color: colors.foreground }]}>
                {t("run.doneTitle")}
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {t("run.doneBody")}
              </Text>
            </View>
          ) : null}

          {remaining.length > 0 ? (
            <Text style={[styles.section, { color: colors.mutedForeground }]}>
              {t("run.remaining").toUpperCase()}
            </Text>
          ) : null}
          {remaining.map((stop) => (
            <View
              key={stop.id}
              style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Text style={[styles.seq, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
                {stop.seq + 1}
              </Text>
              <View style={styles.rowBody}>
                <Text style={[styles.rowAddress, { color: colors.foreground }]}>
                  {stop.address ?? stop.addressRaw}
                </Text>
                {stop.recipientName ? (
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {stop.recipientName}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}

          {stops.filter((s) => isClosed(s)).length > 0 ? (
            <Text style={[styles.section, { color: colors.mutedForeground }]}>
              {t("routes.progress", { n: done, total: stops.length }).toUpperCase()}
            </Text>
          ) : null}
          {stops
            .filter((s) => isClosed(s))
            .map((stop) => {
              const pending = stop.status === "pending";
              const failed = stop.status === "failed";
              const skipped = stop.status === "skipped";
              const stuck = stuckStopIds.includes(stop.id);
              return (
                <View
                  key={stop.id}
                  style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}
                >
                  <Ionicons
                    name={
                      pending
                        ? "cloud-upload-outline"
                        : failed
                          ? "alert-circle-outline"
                          : skipped
                            ? "play-skip-forward-circle-outline"
                            : "checkmark-circle"
                    }
                    size={18}
                    color={
                      pending
                        ? colors.amber
                        : failed
                          ? colors.destructive
                          : skipped
                            ? colors.mutedForeground
                            : colors.verified
                    }
                  />
                  <View style={styles.rowBody}>
                    <Text style={[styles.rowAddress, { color: colors.mutedForeground }]}>
                      {stop.address ?? stop.addressRaw}
                    </Text>
                    <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                      {pending
                        ? stuck
                          ? t("run.retryHint")
                          : t("run.pendingSync")
                        : failed
                          ? t("run.failedLabel")
                          : skipped
                            ? t("run.skipped")
                            : t("run.delivered")}
                    </Text>
                  </View>
                  {pending ? (
                    <Pressable
                      onPress={() => void retrySync()}
                      disabled={retrying}
                      accessibilityLabel={t("run.retry")}
                      style={[styles.chip, { borderColor: colors.amber, opacity: retrying ? 0.5 : 1 }]}
                    >
                      {retrying ? (
                        <ActivityIndicator size="small" color={colors.amber} />
                      ) : (
                        <Text style={[styles.chipText, { color: colors.amber }]}>
                          {t("run.retry")}
                        </Text>
                      )}
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
        </ScrollView>
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
    paddingTop: 14,
    paddingBottom: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1, minWidth: 0 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 15, letterSpacing: 1.5, flexShrink: 1, minWidth: 0, marginRight: 10 },
  count: { fontSize: 12 },
  body: { padding: 16, gap: 10 },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 8 },
  stopOf: { fontSize: 10, letterSpacing: 1.2 },
  address: { fontSize: 19, fontWeight: "700", lineHeight: 25 },
  line: { fontSize: 14 },
  meta: { fontSize: 11, lineHeight: 16 },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  primaryText: { fontSize: 13, fontWeight: "700", letterSpacing: 0.6 },
  outline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  outlineText: { fontSize: 13, fontWeight: "600" },
  sheet: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 },
  sheetTitle: { fontSize: 14, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  chipText: { fontSize: 12, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, fontSize: 13 },
  section: { fontSize: 10, letterSpacing: 1.2, paddingTop: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  rowBody: { flex: 1, gap: 2 },
  rowAddress: { fontSize: 13, fontWeight: "600" },
  seq: { fontSize: 12, width: 18, textAlign: "center" },
  doneTitle: { fontSize: 16, fontWeight: "700" },
  emptyText: { fontSize: 12, lineHeight: 18 },
});
