import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput } from "@/components/app-text";
import { AddressInput } from "@/components/address-input";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { useT } from "@/lib/i18n";
import { parseStops, type ParsedStop } from "@/lib/parse-stops";
import { useOrg } from "@/queries/orgs";
import {
  useAddStops,
  useGeocodeStops,
  useOptimizeRoute,
  useRemoveStop,
  useReorderStops,
  useRoute,
  useUpdateStop,
} from "@/queries/routes";
import { canRunDeliveries } from "../../lib/roles";

/** How many parsed rows are shown before the preview says "+n more". */
const PREVIEW_ROWS = 4;

/** A CSV a dispatcher picks off a phone is a list of addresses, never a database dump. */
const MAX_CSV_BYTES = 1_000_000;

type Stop = NonNullable<ReturnType<typeof useRoute>["data"]>["stops"][number];

/**
 * The route builder, on the phone.
 *
 * Everything the desk can do to a list of stops, done standing at the van: paste a batch, import
 * a CSV off the phone, resolve the addresses into pins, order them, fix an address, drop one.
 *
 * Its own screen rather than another section of app/route/[id].tsx on purpose. That screen is the
 * driver's running screen — one stop, one button — and burying a builder in it would put a Delete
 * next to the shutter. A dispatcher opens this one deliberately.
 *
 * Ordering is up/down arrows, not drag-and-drop: a long-press drag inside a ScrollView fights the
 * scroll on Android, and the arrows are also the only version that works with a thumb on a
 * moving van. Each tap is a whole-list `reorder` call, because that is what the server takes.
 */
export default function RouteStops() {
  const colors = useColors();
  const t = useT();
  const router = useRouter();
  const params = useLocalSearchParams<{ routeId?: string }>();
  const routeId = typeof params.routeId === "string" ? params.routeId : null;

  const query = useRoute(routeId);
  const org = useOrg();
  const addStops = useAddStops();
  const geocode = useGeocodeStops();
  const optimize = useOptimizeRoute();
  const reorder = useReorderStops();
  const removeStop = useRemoveStop();
  const updateStop = useUpdateStop();

  const [paste, setPaste] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Stop | null>(null);

  const route = query.data?.route ?? null;
  const stops = useMemo(() => query.data?.stops ?? [], [query.data]);
  const geocodingAvailable = query.data?.geocodingAvailable ?? true;
  const parsed = useMemo(() => (paste.trim() ? parseStops(paste) : null), [paste]);
  const unresolved = stops.filter((s) => s.lat == null || s.lng == null);

  // Same rule as the server: dispatcher and above. A driver who deep-links here is sent back to
  // the run rather than shown buttons every tap would refuse.
  const role = org.data?.role;
  if (role && !canRunDeliveries(role)) {
    router.replace(routeId ? `/route/${routeId}` : "/routes");
    return null;
  }

  const say = (message: string) => {
    setError(null);
    setNotice(message);
  };

  const blame = (e: unknown) => {
    setNotice(null);
    setError(e instanceof Error ? e.message : String(e));
  };

  /** Move one stop by one place, sending the whole new order. */
  const move = (index: number, by: -1 | 1) => {
    const next = [...stops];
    const target = index + by;
    if (target < 0 || target >= next.length) return;
    const held = next[index];
    const swapped = next[target];
    if (!held || !swapped) return;
    next[index] = swapped;
    next[target] = held;
    if (!routeId) return;
    setNotice(null);
    setError(null);
    reorder.mutate(
      { routeId, order: next.map((s) => s.id) },
      { onError: blame },
    );
  };

  const commitPaste = async (stopsToAdd: ParsedStop[], skipped: number) => {
    if (!routeId || stopsToAdd.length === 0) return;
    try {
      const res = await addStops.mutateAsync({ routeId, stops: stopsToAdd });
      setPaste("");
      say(
        skipped > 0
          ? `${t("routes.added", { n: res.added })} · ${t("routes.previewSkipped", { n: skipped })}`
          : t("routes.added", { n: res.added }),
      );
      // Straight on into pins: an address with no coordinates is a stop the driver cannot be
      // navigated to and the optimizer has to leave at the end of the run.
      if (geocodingAvailable) {
        const hit = await geocode.mutateAsync({ routeId, force: false });
        say(t("routes.resolved", { n: hit.resolved, failed: hit.failed }));
      }
    } catch (e) {
      blame(e);
    }
  };

  /**
   * Import a list off the phone.
   *
   * The file is read into the same paste box rather than sent straight up, so the dispatcher
   * sees what was understood — which column became the recipient, how many lines had no address
   * — before anything is added. `copyToCacheDirectory` matters on Android: a content:// URI from
   * Drive or Gmail is not readable directly.
   *
   * Reading it takes two paths because the picker hands back two different things. On a phone
   * the asset is a file on disk, read through expo-file-system. In a browser — the preview —
   * it is a blob the page cannot open by URI at all, and only the browser File object on the
   * asset can be read; going through expo-file-system there fails every time.
   */
  const importCsv = async () => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "text/plain", "application/csv", "*/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (picked.canceled) return;
      const file = picked.assets?.[0];
      if (!file) return;
      if (typeof file.size === "number" && file.size > MAX_CSV_BYTES) {
        blame(new Error(t("routes.csvError")));
        return;
      }
      const text = file.file ? await file.file.text() : await new File(file.uri).text();
      if (!text.trim()) {
        blame(new Error(t("routes.csvError")));
        return;
      }
      setPaste(text);
      say(t("routes.csvLoaded", { file: file.name }));
    } catch {
      blame(new Error(t("routes.csvError")));
    }
  };

  const confirmRemove = (stop: Stop) => {
    Alert.alert(t("routes.removeStop"), t("routes.removeConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("routes.removeStop"),
        style: "destructive",
        onPress: () => {
          setNotice(null);
          setError(null);
          removeStop.mutate({ stopId: stop.id }, { onError: blame });
        },
      },
    ]);
  };

  const busy =
    addStops.isPending ||
    geocode.isPending ||
    optimize.isPending ||
    reorder.isPending ||
    removeStop.isPending;

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
            accessibilityLabel={t("routes.back")}
          >
            <Ionicons name="chevron-back" size={22} color={colors.foreground} />
          </Pressable>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}
          >
            {(route?.name ?? t("routes.builderTitle")).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.count, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}>
          {t("routes.stopsCount", { n: stops.length })}
        </Text>
      </View>

      {query.isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.amber} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {!geocodingAvailable ? (
            <View style={[styles.notice, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.mutedForeground} />
              <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
                {t("routes.noKeyHint")}
              </Text>
            </View>
          ) : null}

          {unresolved.length > 0 && geocodingAvailable ? (
            <View style={[styles.notice, { borderColor: colors.amber, backgroundColor: colors.card }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.amber} />
              <Text style={[styles.noticeText, { color: colors.amber }]}>
                {t("routes.needsAttention", { n: unresolved.length })}
              </Text>
            </View>
          ) : null}

          {/* The two jobs that act on the whole list. Both are metered at Google's end, so both
              are buttons a dispatcher presses rather than anything that fires on its own. */}
          <View style={styles.actions}>
            <Pressable
              onPress={async () => {
                if (!routeId) return;
                try {
                  const res = await geocode.mutateAsync({ routeId, force: false });
                  say(
                    res.available
                      ? t("routes.resolved", { n: res.resolved, failed: res.failed })
                      : t("routes.noKey"),
                  );
                } catch (e) {
                  blame(e);
                }
              }}
              disabled={busy || stops.length === 0}
              accessibilityLabel={t("routes.resolve")}
              style={[
                styles.action,
                { borderColor: colors.border, opacity: busy || stops.length === 0 ? 0.45 : 1 },
              ]}
            >
              {geocode.isPending ? (
                <ActivityIndicator size="small" color={colors.amber} />
              ) : (
                <Ionicons name="location-outline" size={16} color={colors.amber} />
              )}
              <Text style={[styles.actionText, { color: colors.foreground }]}>
                {t("routes.resolve")}
              </Text>
            </Pressable>

            <Pressable
              onPress={async () => {
                if (!routeId) return;
                try {
                  // Local solver only, exactly as the desk does it: the smart backend bills per
                  // stop and is not something to put behind a thumb-sized button in a van.
                  const res = await optimize.mutateAsync({ routeId, backend: "local" });
                  say(
                    t("routes.optimized", {
                      n: res.ordered,
                      km: Math.round(res.metres / 100) / 10,
                    }),
                  );
                } catch (e) {
                  blame(e);
                }
              }}
              disabled={busy || stops.length < 2}
              accessibilityLabel={t("routes.optimize")}
              style={[
                styles.action,
                { borderColor: colors.border, opacity: busy || stops.length < 2 ? 0.45 : 1 },
              ]}
            >
              {optimize.isPending ? (
                <ActivityIndicator size="small" color={colors.amber} />
              ) : (
                <Ionicons name="git-branch-outline" size={16} color={colors.amber} />
              )}
              <Text style={[styles.actionText, { color: colors.foreground }]}>
                {t("routes.optimize")}
              </Text>
            </Pressable>
          </View>

          {notice ? (
            <Text style={[styles.notify, { color: colors.mutedForeground }]}>{notice}</Text>
          ) : null}
          {error ? <Text style={[styles.notify, { color: colors.alert }]}>{error}</Text> : null}

          {stops.length === 0 ? (
            <Text style={[styles.empty, { color: colors.mutedForeground }]}>
              {t("routes.noStops")}
            </Text>
          ) : (
            <>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                {t("routes.reorderHint")}
              </Text>
              <View style={styles.list}>
                {stops.map((stop, index) => {
                  const closed = stop.status !== "pending";
                  const located = stop.lat != null && stop.lng != null;
                  return (
                    <View
                      key={stop.id}
                      style={[
                        styles.row,
                        { borderColor: located ? colors.border : colors.amber, backgroundColor: colors.card },
                      ]}
                    >
                      <View style={styles.rowTop}>
                        <Text
                          style={[styles.seq, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </Text>
                        <View style={styles.rowBody}>
                          <Text style={[styles.address, { color: colors.foreground }]}>
                            {stop.address ?? stop.addressRaw}
                          </Text>
                          {stop.recipientName || stop.recipientPhone || stop.reference ? (
                            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                              {[stop.recipientName, stop.recipientPhone, stop.reference]
                                .filter(Boolean)
                                .join(" · ")}
                            </Text>
                          ) : null}
                          {!located ? (
                            <Text style={[styles.meta, { color: colors.amber }]}>
                              {t("routes.needsAttention", { n: 1 })}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {/* A closed stop keeps its place: the server refuses to delete one, and
                          reordering work that is already photographed would rewrite history. */}
                      {closed ? null : (
                        <View style={styles.rowActions}>
                          <RowButton
                            icon="arrow-up"
                            label={t("routes.moveUp")}
                            disabled={index === 0 || busy}
                            onPress={() => move(index, -1)}
                          />
                          <RowButton
                            icon="arrow-down"
                            label={t("routes.moveDown")}
                            disabled={index === stops.length - 1 || busy}
                            onPress={() => move(index, 1)}
                          />
                          <RowButton
                            icon="create-outline"
                            label={t("routes.editStop")}
                            disabled={busy}
                            onPress={() => {
                              setNotice(null);
                              setError(null);
                              setEditing(stop);
                            }}
                          />
                          <RowButton
                            icon="trash-outline"
                            label={t("routes.removeStop")}
                            disabled={busy}
                            destructive
                            onPress={() => confirmRemove(stop)}
                          />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Paste, or import. Both land in the same box, and nothing is sent until the preview
              below it says what was understood. */}
          <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {t("routes.addTitle")}
            </Text>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              {t("routes.addHint")}
            </Text>
            <TextInput
              value={paste}
              onChangeText={setPaste}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholder={"34-18 Clearview Street, Moncton NB, Jane Doe, jane@example.com"}
              placeholderTextColor={colors.mutedForeground}
              accessibilityLabel={t("routes.addTitle")}
              style={[styles.paste, { borderColor: colors.border, color: colors.foreground }]}
            />

            <Pressable
              onPress={importCsv}
              accessibilityLabel={t("routes.csvChoose")}
              style={[styles.action, { borderColor: colors.border }]}
            >
              <Ionicons name="document-attach-outline" size={16} color={colors.amber} />
              <Text style={[styles.actionText, { color: colors.foreground }]}>
                {t("routes.csvChoose")}
              </Text>
            </Pressable>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              {t("routes.csvHint")}
            </Text>

            {parsed ? (
              <View style={[styles.preview, { borderColor: colors.border }]}>
                <View style={styles.previewHead}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                    {t("routes.previewTitle")}
                  </Text>
                  <Text
                    style={[
                      styles.meta,
                      { color: colors.mutedForeground, fontFamily: Fonts?.mono },
                    ]}
                  >
                    {t("routes.previewCount", { n: parsed.stops.length })}
                  </Text>
                </View>
                {parsed.headerRow ? (
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {t("routes.previewHeader", { cols: parsed.headerRow.join(", ") })}
                  </Text>
                ) : null}
                {parsed.ignoredColumns.length > 0 ? (
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {t("routes.previewIgnored", { cols: parsed.ignoredColumns.join(", ") })}
                  </Text>
                ) : null}
                {parsed.skipped > 0 ? (
                  <Text style={[styles.meta, { color: colors.amber }]}>
                    {t("routes.previewSkipped", { n: parsed.skipped })}
                  </Text>
                ) : null}

                {parsed.stops.slice(0, PREVIEW_ROWS).map((stop, i) => (
                  <View key={`${stop.addressRaw}-${i}`} style={styles.previewRow}>
                    <Text style={[styles.previewCell, { color: colors.foreground }]}>
                      {t("routes.colAddress")}: {stop.addressRaw}
                    </Text>
                    {stop.recipientName ? (
                      <Text style={[styles.previewCell, { color: colors.mutedForeground }]}>
                        {t("routes.colName")}: {stop.recipientName}
                      </Text>
                    ) : null}
                    {stop.recipientEmail ? (
                      <Text style={[styles.previewCell, { color: colors.mutedForeground }]}>
                        {t("routes.colEmail")}: {stop.recipientEmail}
                      </Text>
                    ) : null}
                    {stop.recipientPhone ? (
                      <Text style={[styles.previewCell, { color: colors.mutedForeground }]}>
                        {t("routes.colPhone")}: {stop.recipientPhone}
                      </Text>
                    ) : null}
                  </View>
                ))}
                {parsed.stops.length > PREVIEW_ROWS ? (
                  <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                    {t("routes.previewMore", { n: parsed.stops.length - PREVIEW_ROWS })}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <Pressable
              onPress={() => void commitPaste(parsed?.stops ?? [], parsed?.skipped ?? 0)}
              disabled={busy || !parsed || parsed.stops.length === 0}
              accessibilityLabel={t("routes.addStops")}
              style={[
                styles.primary,
                {
                  backgroundColor: colors.amber,
                  opacity: busy || !parsed || parsed.stops.length === 0 ? 0.45 : 1,
                },
              ]}
            >
              {addStops.isPending ? (
                <ActivityIndicator size="small" color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.primaryText, { color: colors.primaryForeground }]}>
                  {t("routes.addStops").toUpperCase()}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}

      {editing ? (
        <EditStop
          stop={editing}
          pending={updateStop.isPending}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            try {
              await updateStop.mutateAsync({ stopId: editing.id, ...patch });
              setEditing(null);
              // Editing the address clears its pin server-side, so the pins are re-asked for
              // rather than leaving the driver pointed at where the old address was.
              if (routeId && patch.addressRaw && geocodingAvailable) {
                const hit = await geocode.mutateAsync({ routeId, force: false });
                say(t("routes.resolved", { n: hit.resolved, failed: hit.failed }));
              }
            } catch (e) {
              blame(e);
            }
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

/** One square icon button on a stop row. */
function RowButton({
  icon,
  label,
  disabled,
  destructive,
  onPress,
}: {
  icon: "arrow-up" | "arrow-down" | "create-outline" | "trash-outline";
  label: string;
  disabled?: boolean;
  destructive?: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={4}
      style={[
        styles.rowBtn,
        { borderColor: colors.border, opacity: disabled ? 0.35 : 1 },
      ]}
    >
      <Ionicons
        name={icon}
        size={17}
        color={destructive ? colors.destructive : colors.foreground}
      />
    </Pressable>
  );
}

type StopPatch = {
  addressRaw?: string;
  recipientName?: string | null;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  reference?: string | null;
  notes?: string | null;
  requireSignature?: boolean | null;
};

/**
 * Editing one stop, over the list.
 *
 * A panel rather than a route of its own: the dispatcher is half way down a list of thirty
 * addresses and losing that scroll position to fix a typo is worse than the typo. Only fields
 * that actually changed are sent, so an untouched stop cannot be quietly rewritten — and
 * `requireSignature` keeps its three states, because null means "whatever the route says" and is
 * not the same answer as off.
 */
function EditStop({
  stop,
  pending,
  onClose,
  onSave,
}: {
  stop: Stop;
  pending: boolean;
  onClose: () => void;
  onSave: (patch: StopPatch) => void;
}) {
  const colors = useColors();
  const t = useT();
  const [address, setAddress] = useState(stop.addressRaw);
  const [name, setName] = useState(stop.recipientName ?? "");
  const [email, setEmail] = useState(stop.recipientEmail ?? "");
  const [phone, setPhone] = useState(stop.recipientPhone ?? "");
  const [reference, setReference] = useState(stop.reference ?? "");
  const [notes, setNotes] = useState(stop.notes ?? "");
  const [signature, setSignature] = useState<boolean | null>(stop.requireSignature ?? null);

  const submit = () => {
    const patch: StopPatch = {};
    const trimmed = address.trim();
    if (trimmed && trimmed !== stop.addressRaw) patch.addressRaw = trimmed;
    const text = (next: string, was: string | null) => {
      const value = next.trim() || null;
      return value === (was ?? null) ? undefined : value;
    };
    const fields: [keyof StopPatch, string | null | undefined][] = [
      ["recipientName", text(name, stop.recipientName)],
      ["recipientEmail", text(email, stop.recipientEmail)],
      ["recipientPhone", text(phone, stop.recipientPhone)],
      ["reference", text(reference, stop.reference)],
      ["notes", text(notes, stop.notes)],
    ];
    for (const [key, value] of fields) {
      if (value !== undefined) Object.assign(patch, { [key]: value });
    }
    if (signature !== (stop.requireSignature ?? null)) patch.requireSignature = signature;
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }
    onSave(patch);
  };

  return (
    <View style={[styles.sheet, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.sheetBody} keyboardShouldPersistTaps="handled">
        <View style={styles.sheetHead}>
          <Text style={[styles.cardTitle, { color: colors.amber, fontFamily: Fonts?.display }]}>
            {t("routes.editStop").toUpperCase()}
          </Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel={t("common.cancel")}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </Pressable>
        </View>

        <AddressInput
          label={t("routes.colAddress")}
          value={address}
          onChangeText={setAddress}
          placeholder="34-18 Clearview Street, Moncton, NB"
        />

        <SheetField label={t("routes.colName")} value={name} onChangeText={setName} />
        <SheetField
          label={t("routes.colEmail")}
          value={email}
          onChangeText={setEmail}
          keyboard="email-address"
        />
        <SheetField
          label={t("routes.colPhone")}
          value={phone}
          onChangeText={setPhone}
          keyboard="phone-pad"
        />
        <SheetField label={t("run.ref")} value={reference} onChangeText={setReference} />
        <SheetField label={t("run.notes")} value={notes} onChangeText={setNotes} multiline />

        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {t("routes.sigLabel").toUpperCase()}
        </Text>
        <View style={styles.sigRow}>
          {([null, true, false] as const).map((option) => {
            const on = signature === option;
            const label =
              option === null
                ? stop.requireSignature === null
                  ? t("routes.sigRouteOn")
                  : t("routes.sigRouteOff")
                : option
                  ? t("routes.sigOn")
                  : t("routes.sigOff");
            return (
              <Pressable
                key={String(option)}
                onPress={() => setSignature(option)}
                accessibilityLabel={label}
                style={[
                  styles.sig,
                  {
                    borderColor: on ? colors.amber : colors.border,
                    backgroundColor: on ? colors.amber : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sigText,
                    { color: on ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={submit}
          disabled={pending || !address.trim()}
          accessibilityLabel={t("routes.saveStop")}
          style={[
            styles.primary,
            { backgroundColor: colors.amber, opacity: pending || !address.trim() ? 0.45 : 1 },
          ]}
        >
          {pending ? (
            <ActivityIndicator size="small" color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.primaryText, { color: colors.primaryForeground }]}>
              {t("routes.saveStop").toUpperCase()}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SheetField({
  label,
  value,
  onChangeText,
  keyboard,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  keyboard?: "email-address" | "phone-pad";
  multiline?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboard ?? "default"}
        autoCapitalize={keyboard ? "none" : "sentences"}
        multiline={multiline}
        accessibilityLabel={label}
        style={[
          styles.input,
          multiline ? styles.inputTall : null,
          { borderColor: colors.border, color: colors.foreground },
        ]}
      />
    </View>
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
  title: { fontSize: 15, letterSpacing: 1.5, flexShrink: 1, minWidth: 0, marginRight: 10 },
  count: { fontSize: 11 },
  body: { padding: 16, gap: 12, paddingBottom: 48 },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  noticeText: { fontSize: 12, lineHeight: 17, flex: 1 },
  actions: { flexDirection: "row", gap: 8 },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  actionText: { fontSize: 12.5, fontWeight: "600" },
  notify: { fontSize: 12, lineHeight: 17 },
  empty: { fontSize: 13, lineHeight: 19, paddingVertical: 8 },
  hint: { fontSize: 11.5, lineHeight: 16 },
  list: { gap: 8 },
  row: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 },
  rowTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  rowBody: { flex: 1, gap: 3 },
  seq: { fontSize: 12, paddingTop: 2 },
  address: { fontSize: 14.5, fontWeight: "700", lineHeight: 20 },
  meta: { fontSize: 11.5, lineHeight: 16 },
  rowActions: { flexDirection: "row", gap: 8, justifyContent: "flex-end" },
  rowBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  card: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  cardTitle: { fontSize: 13, fontWeight: "700", letterSpacing: 0.4 },
  paste: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 110,
  },
  preview: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 6 },
  previewHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  previewRow: { gap: 2, paddingTop: 6 },
  previewCell: { fontSize: 11.5, lineHeight: 16 },
  primary: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 2 },
  primaryText: { fontSize: 13, fontWeight: "700", letterSpacing: 0.5 },
  sheet: { ...StyleSheet.absoluteFillObject },
  sheetBody: { padding: 16, gap: 12, paddingBottom: 60 },
  sheetHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 2,
  },
  field: { gap: 6 },
  label: { fontSize: 11, letterSpacing: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputTall: { minHeight: 80, textAlignVertical: "top" },
  sigRow: { gap: 8 },
  sig: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  sigText: { fontSize: 12.5, fontWeight: "600" },
});
