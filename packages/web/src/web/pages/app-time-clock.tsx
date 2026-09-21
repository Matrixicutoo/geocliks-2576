import { useMemo, useState } from "react";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileDown,
  LogIn,
  LogOut,
  MapPin,
  ShieldCheck,
  Smartphone,
  Trash2,
  Users,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
import { PageTitle } from "../components/page-title";
import { StatTile } from "../components/stat-tile";
import { formatCoords } from "../components/evidence-card";
import {
  useAmendPunch,
  useExportTimesheet,
  useOnClock,
  usePunch,
  useRemovePunch,
  useTimeClock,
} from "../queries/time-clock";
import { useOrg } from "../queries/orgs";
import { useTeam } from "../queries/team";
import { canReadAllTimeClock } from "../lib/roles";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

/** Local midnight, which is the boundary a shift is read against — not UTC's. */
function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * The six-week block a month is drawn in.
 *
 * Always six rows, always starting on a Sunday, so the grid does not change height as the
 * month changes and the day under the cursor does not move out from under it. The leading and
 * trailing days belong to the neighbouring months and are drawn dimmed; they are still real
 * days and still clickable, because a shift that ran past midnight on the 31st is read on the
 * 1st and hiding it would lose it.
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
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${`${m}`.padStart(2, "0")}m`;
}

function timeLabel(at: Date | string) {
  return new Date(at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** With seconds, for the punch detail — a disputed minute is argued in seconds. */
function secondsLabel(at: Date | string) {
  return new Date(at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/** Device drift in the units a person reads: under a second is "±0s", not "+412 ms". */
function skewLabel(ms: number | null | undefined) {
  if (ms == null) return null;
  const seconds = Math.round(Math.abs(ms) / 1000);
  if (seconds < 1) return "±0s";
  return `${ms < 0 ? "−" : "+"}${seconds}s`;
}

/** `<input type="time">` wants HH:MM in local time, which is also how a correction is typed. */
function timeInputValue(at: Date | string) {
  const d = new Date(at);
  return `${`${d.getHours()}`.padStart(2, "0")}:${`${d.getMinutes()}`.padStart(2, "0")}`;
}

/**
 * The time clock — who was on it, from when, and where they were standing.
 *
 * A calendar rather than a list because the question asked of a timesheet is nearly always
 * about a day: what did this driver work on Tuesday, was anybody on the clock at 6am, why is
 * Friday eleven hours. The month grid answers the first glance (which days have time on them,
 * how much) and the day panel answers the follow-up.
 *
 * Deliberately no photographs anywhere on this page. A punch carries a time and a place and
 * nothing else — the arrival shot that may have produced it lives in Captures, which is where
 * proof-of-presence belongs. A timesheet that showed faces would be read as one.
 *
 * Open to every role, with the scope decided by the server: the office reads the workspace,
 * a driver reads their own timesheet. Neither gets a page the other cannot use — it is the
 * same grid with one row of data or twenty.
 */
export default function TimeClockPage() {
  const t = useT();
  const org = useOrg();
  const role = org.data?.role;
  const office = canReadAllTimeClock(role);
  const team = useTeam();

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [picked, setPicked] = useState(() => dayKey(new Date()));
  const [who, setWho] = useState<string>("");
  const [editing, setEditing] = useState<string | null>(null);

  const grid = useMemo(() => monthGrid(month), [month]);
  // The read covers the whole visible block, not the calendar month, so the dimmed leading and
  // trailing days carry their real numbers instead of reading empty.
  const from = grid[0]!.getTime();
  const to = new Date(grid[41]!.getFullYear(), grid[41]!.getMonth(), grid[41]!.getDate() + 1).getTime() - 1;

  const clock = useTimeClock({ from, to, userId: office ? who || null : null });
  const current = useOnClock(office && who ? who : null);
  const punch = usePunch();
  const amend = useAmendPunch();
  const remove = useRemovePunch();
  const exportPdf = useExportTimesheet();

  // Memoized on the query result rather than read inline, so the per-day totals below are not
  // recomputed on every keystroke in the correction field.
  const entries = useMemo(() => clock.data?.entries ?? [], [clock.data]);
  const shifts = useMemo(() => clock.data?.shifts ?? [], [clock.data]);

  /** Minutes worked per local day, so a cell can show a number without re-walking the month. */
  const perDay = useMemo(() => {
    const totals = new Map<string, { minutes: number; punches: number; open: boolean }>();
    for (const entry of entries) {
      const key = dayKey(new Date(entry.at));
      const cell = totals.get(key) ?? { minutes: 0, punches: 0, open: false };
      cell.punches += 1;
      totals.set(key, cell);
    }
    for (const shift of shifts) {
      // A shift is counted on the day it started: a night run that ends at 2am is Monday's
      // work to the person who drove it, and splitting it across two cells would read as two
      // shifts on a page whose whole job is counting them.
      const anchor = shift.startedAt ?? shift.endedAt;
      if (!anchor) continue;
      const key = dayKey(new Date(anchor));
      const cell = totals.get(key) ?? { minutes: 0, punches: 0, open: false };
      cell.minutes += shift.minutes ?? 0;
      if (shift.openEnded) cell.open = true;
      totals.set(key, cell);
    }
    return totals;
  }, [entries, shifts]);

  const dayEntries = entries.filter((entry) => dayKey(new Date(entry.at)) === picked);
  const dayShifts = shifts.filter(
    (shift) => dayKey(new Date((shift.startedAt ?? shift.endedAt)!)) === picked,
  );
  const monthMinutes = shifts.reduce((sum, shift) => sum + (shift.minutes ?? 0), 0);
  const openNow = shifts.filter((shift) => shift.openEnded).length;

  const onClock = current.data?.onClock ?? false;

  /**
   * A punch from the browser, with a fix if the browser will give one.
   *
   * The office uses this to fix a morning somebody's phone was dead for, and a crew member on
   * a desktop uses it to clock in at all. Geolocation is asked for but never required — a
   * punch with no coordinates is still a punch, and refusing to record one because a laptop
   * had location switched off would lose the hour it was standing for.
   */
  const stampPunch = (kind: "in" | "out") => {
    const send = (lat?: number, lng?: number, accuracyM?: number) => {
      punch.mutate({ kind, at: Date.now(), lat, lng, accuracyM });
    };
    if (!navigator.geolocation) return send();
    navigator.geolocation.getCurrentPosition(
      (pos) => send(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy),
      () => send(),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const monthLabel = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const pickedLabel = new Date(`${picked}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <DashboardShell title={t("tc.title")} subtitle={t("tc.body")}>
      <PageTitle name={org.data?.org.name} section={t("tc.title")} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Clock}
          label={t("tc.statMonth")}
          value={hoursLabel(monthMinutes)}
          sub={t("tc.statMonthSub", { n: shifts.length })}
          accent="amber"
          loading={clock.isLoading}
        />
        <StatTile
          icon={CalendarClock}
          label={t("tc.statDay")}
          value={hoursLabel(dayShifts.reduce((sum, s) => sum + (s.minutes ?? 0), 0))}
          sub={pickedLabel}
          loading={clock.isLoading}
        />
        <StatTile
          icon={LogIn}
          label={t("tc.statOpen")}
          value={openNow}
          sub={t("tc.statOpenSub")}
          accent={openNow > 0 ? "verified" : "chalk"}
          loading={clock.isLoading}
        />
        {/* Punching by hand is the office's, and only the office's. Crew time comes off a device
            that recorded where and when it happened; a text field a driver can type his own
            start time into is a claim, and mixing the two would make the honest rows worthless.
            The server refuses crew here too — this just stops offering them a dead button. */}
        <div className="rounded-[12px] border border-line bg-ink-2 p-4">
          <span className="label">{office ? t("tc.punchNow") : t("tc.crewNoManual")}</span>
          {office ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => stampPunch("in")}
                  disabled={punch.isPending}
                  className="inline-flex items-center gap-1.5 rounded-[6px] border border-verified/60 bg-verified/10 px-2.5 py-1.5 text-[11px] uppercase tracking-widest text-verified disabled:opacity-50"
                >
                  <LogIn className="size-3.5" />
                  {t("tc.clockIn")}
                </button>
                <button
                  type="button"
                  onClick={() => stampPunch("out")}
                  disabled={punch.isPending}
                  className="inline-flex items-center gap-1.5 rounded-[6px] border border-amber/60 bg-amber/10 px-2.5 py-1.5 text-[11px] uppercase tracking-widest text-amber disabled:opacity-50"
                >
                  <LogOut className="size-3.5" />
                  {t("tc.clockOut")}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-fog">{t("tc.punchNowHint")}</p>
            </>
          ) : (
            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-fog">
              <Smartphone className="mt-0.5 size-3.5 shrink-0" />
              <span>{t("tc.crewNoManualHint")}</span>
            </p>
          )}
        </div>
      </div>

      {/* Whose times. Only the office gets the picker; a crew member has exactly one timesheet
          and the server would refuse anybody else's anyway. */}
      {office && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Users className="size-3.5 text-fog" />
          <select
            value={who}
            onChange={(e) => setWho(e.target.value)}
            className="rounded-[6px] border border-line bg-ink-2 px-2.5 py-1.5 text-[12px] text-chalk"
          >
            <option value="">{t("tc.everyone")}</option>
            {(team.data ?? []).map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.user?.name || member.user?.email || member.userId}
              </option>
            ))}
          </select>
          {who && (
            <span className="mono text-[10.5px] uppercase tracking-widest text-fog">
              {onClock ? t("tc.onClock") : t("tc.offClock")}
              {current.data?.since ? ` · ${timeLabel(current.data.since)}` : ""}
            </span>
          )}

          {/* One sheet per driver per period, which is the only timesheet anybody can sign. So
              the button waits for a person to be picked rather than exporting "everyone" into a
              document nobody could put their name at the bottom of. */}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!who || exportPdf.isPending}
              onClick={() =>
                exportPdf.mutate({
                  userId: who,
                  from,
                  to,
                  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
                })
              }
              className="inline-flex items-center gap-1.5 rounded-[6px] border border-amber/60 bg-amber/10 px-2.5 py-1.5 text-[11px] uppercase tracking-widest text-amber disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileDown className="size-3.5" />
              {exportPdf.isPending ? t("tc.exporting") : t("tc.exportPdf")}
            </button>
            <span className="text-[10.5px] text-fog">
              {who ? t("tc.exportHint", { month: monthLabel }) : t("tc.exportPickOne")}
            </span>
          </div>
        </div>
      )}
      {exportPdf.isError && (
        <p className="mt-2 text-[11px] text-alert">{t("tc.exportFailed")}</p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[12px] border border-line bg-ink-2 p-4">
          <div className="flex items-center justify-between">
            <p className="mono text-[12px] uppercase tracking-widest text-chalk">{monthLabel}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={t("tc.prevMonth")}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                className="rounded-[6px] border border-line p-1.5 text-fog hover:text-chalk"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                  setPicked(dayKey(now));
                }}
                className="rounded-[6px] border border-line px-2 py-1 text-[10.5px] uppercase tracking-widest text-fog hover:text-chalk"
              >
                {t("tc.today")}
              </button>
              <button
                type="button"
                aria-label={t("tc.nextMonth")}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                className="rounded-[6px] border border-line p-1.5 text-fog hover:text-chalk"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((letter, i) => (
              <span
                key={`${letter}-${i}`}
                className="mono py-1 text-center text-[9.5px] uppercase tracking-widest text-fog"
              >
                {letter}
              </span>
            ))}
            {grid.map((day) => {
              const key = dayKey(day);
              const cell = perDay.get(key);
              const outside = day.getMonth() !== month.getMonth();
              const today = key === dayKey(new Date());
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPicked(key)}
                  className={cn(
                    "flex min-h-[64px] flex-col items-start gap-1 rounded-[8px] border p-1.5 text-left transition-colors",
                    picked === key
                      ? "border-amber/60 bg-amber/10"
                      : "border-line hover:border-fog/50",
                    outside && "opacity-40",
                  )}
                >
                  <span
                    className={cn(
                      "mono text-[11px]",
                      today ? "text-amber" : cell ? "text-chalk" : "text-fog",
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {cell ? (
                    <>
                      <span className="mono text-[10px] leading-none text-verified">
                        {cell.minutes > 0 ? hoursLabel(cell.minutes) : t("tc.punchesOnly")}
                      </span>
                      <span className="mono text-[9px] leading-none text-fog">
                        {cell.open ? t("tc.stillOn") : t("tc.punchCount", { n: cell.punches })}
                      </span>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[12px] border border-line bg-ink-2 p-4">
          <p className="mono text-[12px] uppercase tracking-widest text-chalk">{pickedLabel}</p>

          {dayEntries.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={CalendarClock} title={t("tc.emptyDay")} hint={t("tc.emptyBody")} />
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {dayEntries.map((entry) => (
                <div key={entry.id} className="rounded-[8px] border border-line bg-ink p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "mono inline-flex items-center gap-1 text-[10.5px] uppercase tracking-widest",
                        entry.kind === "in" ? "text-verified" : "text-amber",
                      )}
                    >
                      {entry.kind === "in" ? (
                        <LogIn className="size-3" />
                      ) : (
                        <LogOut className="size-3" />
                      )}
                      {t(entry.kind === "in" ? "tc.in" : "tc.out")}
                    </span>
                    <span className="mono text-[12px] text-chalk">{secondsLabel(entry.at)}</span>
                  </div>
                  {clock.data?.scope === "workspace" && (
                    <p className="mt-1.5 text-[11px] text-chalk">{entry.userName}</p>
                  )}

                  {/* Everything a photograph's stamp used to carry, because there is no
                      photograph behind a punch to go back to. This panel is the whole record. */}
                  {entry.code && (
                    <p className="mono mt-1 text-[10.5px] tracking-widest text-amber">
                      {entry.code}
                    </p>
                  )}
                  {/* Skipped whole for an office entry: there is no fix to report about a phone
                      that was never involved, and "NO GPS FIX" would read as one that failed. */}
                  {(entry.lat != null && entry.lng != null) || entry.address ? (
                  <p className="mt-1 flex items-start gap-1.5 text-[11px] text-fog">
                    <MapPin className="mt-0.5 size-3 shrink-0" />
                    <span>
                      {entry.lat != null && entry.lng != null ? (
                      <span className="mono">
                        {formatCoords(entry.lat, entry.lng)}
                        {entry.accuracyM == null ? "" : ` ±${Math.round(entry.accuracyM)}m`}
                      </span>
                      ) : null}
                      {entry.address ? (
                        <span className="block line-clamp-2">{entry.address}</span>
                      ) : null}
                      {entry.altitudeM != null || entry.heading != null ? (
                        <span className="mono block">
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
                        </span>
                      ) : null}
                    </span>
                  </p>
                  ) : null}
                  {/* Only a punch a phone made can claim a verified clock; the line below is
                      omitted for an office entry rather than lending it that proof. */}
                  {entry.verifiedAt && entry.source !== "manual" && (
                    <p className="mono mt-1 flex items-start gap-1.5 text-[10.5px] text-verified">
                      <ShieldCheck className="mt-0.5 size-3 shrink-0" />
                      <span>
                        {t("tc.verifiedAt", { time: secondsLabel(entry.verifiedAt) })}
                        {skewLabel(entry.clockSkewMs)
                          ? ` · ${t("tc.skew", { skew: skewLabel(entry.clockSkewMs) ?? "" })}`
                          : ""}
                      </span>
                    </p>
                  )}
                  {(entry.deviceModel || entry.platform) && (
                    <p className="mt-1 text-[10.5px] text-fog">
                      {[entry.deviceModel, entry.platform].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {/* What he was working on: the run on a delivery workspace, the job on a field
                      one. A punch carries whichever noun its side works in, so the panel reads
                      the same on both products without knowing which it is on. */}
                  {(entry.projectName || entry.routeName) && (
                    <p className="mt-1 text-[10.5px] text-fog">
                      {entry.projectName || entry.routeName}
                    </p>
                  )}
                  {entry.note && <p className="mt-1 text-[11px] text-chalk">{entry.note}</p>}
                  <p className="mono mt-1 text-[9.5px] uppercase tracking-widest text-fog">
                    {t(entry.source === "manual" ? "tc.sourceManual" : "tc.sourceCapture")}
                    {" · "}
                    {t("tc.noPhoto")}
                  </p>

                  {/* Corrections are the office's, not the crew's — a timesheet its subject can
                      rewrite proves nothing. Only the time is editable; the place stays as the
                      device recorded it. */}
                  {office && (
                    <div className="mt-2 flex items-center gap-1.5">
                      {editing === entry.id ? (
                        <input
                          type="time"
                          aria-label={t("tc.amend")}
                          defaultValue={timeInputValue(entry.at)}
                          onBlur={() => setEditing(null)}
                          onChange={(e) => {
                            const [h, m] = e.target.value.split(":").map(Number);
                            if (h == null || m == null || Number.isNaN(h) || Number.isNaN(m)) return;
                            const next = new Date(entry.at);
                            next.setHours(h, m, 0, 0);
                            amend.mutate({ id: entry.id, at: next.getTime() });
                          }}
                          className="rounded-[6px] border border-line bg-ink-2 px-2 py-1 text-[11px] text-chalk"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditing(entry.id)}
                          className="rounded-[6px] border border-line px-2 py-1 text-[10px] uppercase tracking-widest text-fog hover:text-chalk"
                        >
                          {t("tc.amend")}
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label={t("tc.remove")}
                        onClick={() => remove.mutate({ id: entry.id })}
                        className="rounded-[6px] border border-line p-1 text-fog hover:text-alert"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {dayShifts.length > 0 && (
                <div className="border-t border-line pt-2">
                  <p className="label">{t("tc.shifts")}</p>
                  {dayShifts.map((shift) => (
                    <p
                      key={`${shift.inId ?? "none"}-${shift.outId ?? "none"}`}
                      className="mono mt-1 text-[11px] text-fog"
                    >
                      {shift.startedAt ? timeLabel(shift.startedAt) : t("tc.missedIn")}
                      {" → "}
                      {shift.endedAt ? timeLabel(shift.endedAt) : t("tc.stillOn")}
                      {shift.minutes != null ? ` · ${hoursLabel(shift.minutes)}` : ""}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
