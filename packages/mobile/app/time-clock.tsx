import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";
import { Text } from "@/components/app-text";
import { useColors } from "@/hooks/use-colors";
import { Fonts } from "@/constants/theme";
import { LanguageMenu } from "@/components/language-menu";
import { ProfileMenu } from "@/components/profile-menu";
import { useT } from "@/lib/i18n";
import { formatCoords } from "@/components/stamp";
import { useOnClock, usePunch, useTimeClock } from "@/queries/time-clock";
import { useOrg } from "@/queries/orgs";
import { canReadAllTimeClock } from "../lib/roles";

/** Local midnight is the boundary a shift is read against — not UTC's. */
function dayKey(date: Date) {
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/**
 * The six-week block a month is drawn in — always six rows, always starting Sunday, so the grid
 * keeps its height as the month changes and the cell under a thumb does not move. The leading
 * and trailing days belong to the neighbouring months and are dimmed but still real and still
 * tappable: a night shift that ran past midnight on the 31st is read on the 1st.
 */
function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

function hoursLabel(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${`${minutes % 60}`.padStart(2, "0")}m`;
}

function timeLabel(at: Date | string) {
  return new Date(at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function secondsLabel(at: Date | string) {
  return new Date(at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/** Device drift, in the units a person reads: under a second is "on time", not "+412 ms". */
function skewLabel(ms: number | null | undefined) {
  if (ms == null) return null;
  const seconds = Math.round(Math.abs(ms) / 1000);
  if (seconds < 1) return "±0s";
  return `${ms < 0 ? "−" : "+"}${seconds}s`;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * The phone's time clock — when this crew member started and stopped, and where they stood.
 *
 * A calendar rather than a list, because what anyone asks a timesheet is about a day: what did
 * I work Tuesday, why is Friday eleven hours. Deliberately no photographs: a punch carries a
 * time and a place and nothing else. The arrival shot that may have produced it lives in
 * Captures, which is where proof-of-presence belongs.
 *
 * Scope is the server's decision, not this screen's — a driver reads their own punches, the
 * office reads the workspace. Same grid either way, with one person's times in it or twenty.
 */
export default function TimeClockScreen() {
  const colors = useColors();
  const t = useT();
  const org = useOrg();
  const office = canReadAllTimeClock(org.data?.role);

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [picked, setPicked] = useState(() => dayKey(new Date()));
  // Office roles start on the workspace; the switch narrows it to their own timesheet.
  const [mineOnly, setMineOnly] = useState(false);
  const [locating, setLocating] = useState(false);
  const [failed, setFailed] = useState(false);

  const grid = useMemo(() => monthGrid(month), [month]);
  const from = grid[0]!.getTime();
  const last = grid[41]!;
  const to = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1).getTime() - 1;

  // `current` answers for whoever is asking, so it is also how this screen learns its own id
  // without a second round trip. A null `userId` on the read means "let the server decide the
  // scope": the whole workspace for the office, this member's own punches for crew.
  const current = useOnClock(null);
  const selfId = current.data?.userId ?? null;
  const clock = useTimeClock({ from, to, userId: office && mineOnly ? selfId : null });
  const punch = usePunch();

  // Memoized on the query result, not read inline: a fresh array each render would make the
  // totals below recompute on every state change on the screen.
  const entries = useMemo(() => clock.data?.entries ?? [], [clock.data]);
  const shifts = useMemo(() => clock.data?.shifts ?? [], [clock.data]);

  /** Minutes and punch counts per local day, so a cell never re-walks the month to draw itself. */
  const perDay = useMemo(() => {
    const totals = new Map<string, { minutes: number; punches: number; open: boolean }>();
    const cell = (key: string) =>
      totals.get(key) ?? { minutes: 0, punches: 0, open: false };
    for (const entry of entries) {
      const key = dayKey(new Date(entry.at));
      const row = cell(key);
      row.punches += 1;
      totals.set(key, row);
    }
    for (const shift of shifts) {
      // Counted on the day it started: a night run ending at 2am is the previous day's work to
      // the person who drove it, and splitting it would read as two shifts.
      const anchor = shift.startedAt ?? shift.endedAt;
      if (!anchor) continue;
      const key = dayKey(new Date(anchor));
      const row = cell(key);
      row.minutes += shift.minutes ?? 0;
      row.open = row.open || shift.openEnded;
      totals.set(key, row);
    }
    return totals;
  }, [entries, shifts]);

  const monthMinutes = useMemo(
    () =>
      shifts.reduce(
        (sum, shift) =>
          shift.startedAt && new Date(shift.startedAt).getMonth() === month.getMonth()
            ? sum + (shift.minutes ?? 0)
            : sum,
        0,
      ),
    [shifts, month],
  );

  const dayEntries = entries.filter((entry) => dayKey(new Date(entry.at)) === picked);
  const dayShifts = shifts.filter((shift) => {
    const anchor = shift.startedAt ?? shift.endedAt;
    return anchor ? dayKey(new Date(anchor)) === picked : false;
  });

  const onClock = current.data?.onClock ?? false;

  /**
   * A punch with no picture. The location is asked for but never required: a driver in a
   * parking garage still has to be able to clock out, so a refused or slow fix punches the
   * time alone rather than blocking the shift.
   */
  const makePunch = useCallback(
    async (kind: "in" | "out") => {
      setFailed(false);
      setLocating(true);
      let lat: number | null = null;
      let lng: number | null = null;
      let accuracyM: number | null = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
          accuracyM = position.coords.accuracy ?? null;
        }
      } catch {
        // No fix. The stamp is still worth recording without one.
      }
      setLocating(false);
      try {
        await punch.mutateAsync({ kind, at: Date.now(), lat, lng, accuracyM });
        setPicked(dayKey(new Date()));
      } catch {
        setFailed(true);
      }
    },
    [punch],
  );

  const busy = locating || punch.isPending;
  const monthLabel = month
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={styles.header}>
        <ProfileMenu />
        <Text style={[styles.title, { color: colors.amber, fontFamily: Fonts?.display }]}>
          {t("tc.title").toUpperCase()}
        </Text>
        <LanguageMenu />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{t("tc.body")}</Text>

        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.dot,
                { backgroundColor: onClock ? colors.verified : colors.mutedForeground },
              ]}
            />
            <Text style={[styles.statusText, { color: colors.foreground }]}>
              {onClock ? t("tc.onClock") : t("tc.offClock")}
            </Text>
            {current.data?.since ? (
              <Text
                style={[styles.mono, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
              >
                {timeLabel(current.data.since)}
              </Text>
            ) : null}
          </View>

          {office ? (
          <View style={styles.punchRow}>
            {(["in", "out"] as const).map((kind) => {
              const primary = kind === "in" ? !onClock : onClock;
              return (
                <Pressable
                  key={kind}
                  disabled={busy}
                  onPress={() => void makePunch(kind)}
                  style={[
                    styles.punchBtn,
                    {
                      backgroundColor: primary ? colors.amber : "transparent",
                      borderColor: primary ? colors.amber : colors.border,
                      opacity: busy ? 0.5 : 1,
                    },
                  ]}
                >
                  {busy && primary ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <>
                      <Ionicons
                        name={kind === "in" ? "log-in-outline" : "log-out-outline"}
                        size={15}
                        color={primary ? colors.background : colors.foreground}
                      />
                      <Text
                        style={[
                          styles.punchText,
                          { color: primary ? colors.background : colors.foreground },
                        ]}
                      >
                        {t(kind === "in" ? "tc.clockIn" : "tc.clockOut")}
                      </Text>
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
          ) : null}

          {office ? (
            <>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                {locating ? t("tc.locating") : t("tc.punchNowHint")}
              </Text>
              {failed ? (
                <Text style={[styles.hint, { color: colors.destructive }]}>
                  {t("tc.punchFailed")}
                </Text>
              ) : null}
            </>
          ) : (
            // Crew have no manual punch, here or on the server. Their hours are worth something
            // because a device recorded them; a button that types a start time would not be.
            <>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                {t("tc.crewNote")}
              </Text>
              <Pressable
                onPress={() => router.replace("/(tabs)" as never)}
                style={[styles.goBtn, { borderColor: colors.amber }]}
              >
                <Ionicons name="camera-outline" size={15} color={colors.amber} />
                <Text style={[styles.goText, { color: colors.amber }]}>{t("tc.goCapture")}</Text>
              </Pressable>
            </>
          )}
        </View>

        {office ? (
          <View style={[styles.toggle, { borderColor: colors.border }]}>
            {([false, true] as const).map((only) => {
              const active = mineOnly === only;
              return (
                <Pressable
                  key={String(only)}
                  onPress={() => setMineOnly(only)}
                  style={[styles.toggleItem, active ? { backgroundColor: colors.amber } : null]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      { color: active ? colors.background : colors.mutedForeground },
                    ]}
                  >
                    {t(only ? "tc.mine" : "tc.everyone")}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.monthRow}>
          <Pressable
            hitSlop={10}
            accessibilityLabel={t("tc.prevMonth")}
            onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            <Ionicons name="chevron-back" size={20} color={colors.mutedForeground} />
          </Pressable>
          <Text style={[styles.monthLabel, { color: colors.foreground, fontFamily: Fonts?.mono }]}>
            {monthLabel}
          </Text>
          <Pressable
            hitSlop={10}
            accessibilityLabel={t("tc.nextMonth")}
            onPress={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.stat, { borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              {t("tc.statMonth")}
            </Text>
            <Text style={[styles.statValue, { color: colors.amber, fontFamily: Fonts?.mono }]}>
              {hoursLabel(monthMinutes)}
            </Text>
            <Text style={[styles.statSub, { color: colors.mutedForeground }]}>
              {t("tc.statMonthSub", { n: shifts.length })}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              const now = new Date();
              setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
              setPicked(dayKey(now));
            }}
            style={[styles.stat, { borderColor: colors.border, justifyContent: "center" }]}
          >
            <Ionicons name="today-outline" size={18} color={colors.amber} />
            <Text style={[styles.statLabel, { color: colors.foreground }]}>{t("tc.today")}</Text>
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((label, i) => (
            <Text
              key={`${label}${i}`}
              style={[styles.weekday, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
            >
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {grid.map((day) => {
            const key = dayKey(day);
            const cell = perDay.get(key);
            const outside = day.getMonth() !== month.getMonth();
            const active = key === picked;
            return (
              <Pressable
                key={key}
                onPress={() => setPicked(key)}
                style={[
                  styles.cell,
                  {
                    borderColor: active ? colors.amber : colors.border,
                    backgroundColor: active ? colors.accent : "transparent",
                    opacity: outside ? 0.45 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cellDay,
                    { color: colors.foreground, fontFamily: Fonts?.mono },
                  ]}
                >
                  {day.getDate()}
                </Text>
                {cell ? (
                  <Text
                    style={[
                      styles.cellMinutes,
                      {
                        color: cell.open ? colors.amber : colors.verified,
                        fontFamily: Fonts?.mono,
                      },
                    ]}
                  >
                    {cell.minutes > 0 ? hoursLabel(cell.minutes) : "·"}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          {t("tc.statDay")} · {picked}
        </Text>

        {clock.isLoading ? <ActivityIndicator color={colors.amber} /> : null}

        {dayEntries.length === 0 && !clock.isLoading ? (
          <View style={[styles.empty, { borderColor: colors.border }]}>
            <Ionicons name="time-outline" size={26} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {t("tc.emptyDay")}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {t("tc.emptyBody")}
            </Text>
          </View>
        ) : null}

        {dayShifts.length > 0 ? (
          <View style={styles.shiftList}>
            {dayShifts.map((shift) => (
              <View
                key={shift.inId ?? shift.outId ?? String(shift.startedAt)}
                style={[styles.shiftRow, { borderColor: colors.border }]}
              >
                <Text style={[styles.mono, { color: colors.foreground, fontFamily: Fonts?.mono }]}>
                  {shift.startedAt ? timeLabel(shift.startedAt) : "--:--"} →{" "}
                  {shift.endedAt ? timeLabel(shift.endedAt) : "--:--"}
                </Text>
                <Text
                  style={[
                    styles.mono,
                    {
                      color: shift.minutes == null ? colors.amber : colors.verified,
                      fontFamily: Fonts?.mono,
                    },
                  ]}
                >
                  {shift.minutes == null
                    ? t(shift.startedAt ? "tc.stillOn" : "tc.missedIn")
                    : hoursLabel(shift.minutes)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/*
          The one place a punch is readable, and the reason it needs every field a photograph's
          stamp carried: there is no picture behind it to go back to. Code, fix, drift, device —
          all of it on the card, so a disputed shift is settled here.
        */}
        {dayEntries.map((entry) => (
          <View
            key={entry.id}
            style={[styles.punchCard, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Ionicons
              name={entry.kind === "in" ? "log-in-outline" : "log-out-outline"}
              size={18}
              color={entry.kind === "in" ? colors.verified : colors.amber}
            />
            <View style={styles.punchBody}>
              <Text style={[styles.punchTime, { color: colors.foreground, fontFamily: Fonts?.mono }]}>
                {secondsLabel(entry.at)} ·{" "}
                {t(entry.kind === "in" ? "tc.in" : "tc.out").toUpperCase()}
              </Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {entry.userName} ·{" "}
                {t(entry.source === "manual" ? "tc.sourceManual" : "tc.sourceCapture")}
                {entry.routeName ? ` · ${entry.routeName}` : ""}
              </Text>

              {entry.code ? (
                <Text style={[styles.code, { color: colors.amber, fontFamily: Fonts?.mono }]}>
                  {entry.code}
                </Text>
              ) : null}

              {/* An office entry has no fix to report, so it says nothing rather than
                  "GPS acquiring…" about a phone that was never involved. */}
              {entry.lat != null && entry.lng != null ? (
                <Text
                  style={[styles.meta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                >
                  {formatCoords(entry.lat, entry.lng)}
                  {entry.accuracyM == null ? "" : ` ±${Math.round(entry.accuracyM)}m`}
                </Text>
              ) : null}
              {entry.address ? (
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {entry.address}
                </Text>
              ) : null}
              {entry.altitudeM != null || entry.heading != null ? (
                <Text
                  style={[styles.meta, { color: colors.mutedForeground, fontFamily: Fonts?.mono }]}
                >
                  {[
                    entry.altitudeM == null
                      ? null
                      : t("tc.altitude", { m: Math.round(entry.altitudeM) }),
                    entry.heading == null
                      ? null
                      : t("tc.heading", { deg: Math.round(entry.heading) }),
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              ) : null}

              {/* Only a punch the phone made can claim a verified clock. What the office typed
                  is already labelled a manual punch above; adding a skew against the server
                  would read as proof it does not have. */}
              {entry.verifiedAt && entry.source !== "manual" ? (
                <Text
                  style={[styles.meta, { color: colors.verified, fontFamily: Fonts?.mono }]}
                >
                  {t("tc.verifiedAt", { time: secondsLabel(entry.verifiedAt) })}
                  {skewLabel(entry.clockSkewMs)
                    ? ` · ${t("tc.skew", { skew: skewLabel(entry.clockSkewMs) ?? "" })}`
                    : ""}
                </Text>
              ) : null}
              {entry.deviceModel || entry.platform ? (
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {[entry.deviceModel, entry.platform].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
              {entry.note ? (
                <Text style={[styles.meta, { color: colors.foreground }]}>{entry.note}</Text>
              ) : null}

              <Text style={[styles.noPhoto, { color: colors.mutedForeground }]}>
                {t("tc.noPhoto")}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
  title: { fontSize: 15, letterSpacing: 1.5, flexShrink: 1, minWidth: 0 },
  scroll: { padding: 16, gap: 12, paddingBottom: 48 },
  body: { fontSize: 12, lineHeight: 18 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: "700", flex: 1 },
  mono: { fontSize: 11, letterSpacing: 0.4 },
  punchRow: { flexDirection: "row", gap: 8 },
  punchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
  },
  punchText: { fontSize: 12, fontWeight: "700" },
  hint: { fontSize: 10, lineHeight: 15 },
  goBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
  },
  goText: { fontSize: 12, fontWeight: "700" },
  toggle: { flexDirection: "row", borderWidth: 1, borderRadius: 10, padding: 3, gap: 3 },
  toggleItem: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 8 },
  toggleText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  monthLabel: { fontSize: 13, letterSpacing: 1.2 },
  statsRow: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, gap: 3, alignItems: "flex-start" },
  statLabel: { fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase" },
  statValue: { fontSize: 16 },
  statSub: { fontSize: 10 },
  weekRow: { flexDirection: "row" },
  weekday: { flex: 1, textAlign: "center", fontSize: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  cellDay: { fontSize: 12 },
  cellMinutes: { fontSize: 8 },
  sectionLabel: { fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", paddingTop: 6 },
  empty: { borderWidth: 1, borderRadius: 12, padding: 18, alignItems: "center", gap: 6 },
  emptyTitle: { fontSize: 13, fontWeight: "700" },
  emptyText: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  shiftList: { gap: 6 },
  shiftRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  punchCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  punchBody: { flex: 1, gap: 2 },
  punchTime: { fontSize: 12 },
  meta: { fontSize: 10, letterSpacing: 0.4 },
  code: { fontSize: 10, letterSpacing: 1.2, fontWeight: "700" },
  noPhoto: { fontSize: 9, letterSpacing: 0.4, fontStyle: "italic", paddingTop: 2 },
});
