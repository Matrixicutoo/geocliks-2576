import { PDFDocument, StandardFonts } from "pdf-lib";
import { AMBER, FOG, GREEN, INK, WHITE, wa } from "./exports";

/**
 * One driver's timesheet as a PDF.
 *
 * This is payroll paperwork, not a photo package, so it is built from punches rather than
 * pictures — and deliberately embeds no images at all. The punches it documents were made with
 * the camera closed: a CLOCK IN on the phone records the moment and the place and nothing else.
 * What makes them worth signing off on is the stamp each one carries, so the stamp is what this
 * document prints: the code, the fix, the device, the server's own clock beside the phone's.
 *
 * Days are cut in the reader's timezone, passed in by the caller. A dispatcher in Denver asking
 * for a driver's week means Denver's week, and the calendar on screen already works this way —
 * a PDF that silently regrouped the same punches into UTC days would not reconcile with it.
 */

export interface TimesheetPunch {
  id: string;
  kind: string;
  at: Date;
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
  altitudeM?: number | null;
  heading?: number | null;
  address: string | null;
  code?: string | null;
  deviceModel?: string | null;
  platform?: string | null;
  verifiedAt?: Date | null;
  clockSkewMs?: number | null;
  timeSource?: string | null;
  integrity?: string | null;
  source?: string | null;
  note?: string | null;
  routeName?: string | null;
}

export interface TimesheetShift {
  inId: string | null;
  outId: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  minutes: number | null;
  openEnded: boolean;
}

export interface TimesheetContext {
  orgName: string;
  driverName: string;
  driverRole: string | null;
  /** Inclusive window, as the caller's own clock drew it. */
  from: Date;
  to: Date;
  /** IANA zone the days are cut in — the reader's, not the server's. */
  timeZone: string;
  punches: TimesheetPunch[];
  shifts: TimesheetShift[];
  /** Who pressed export. A timesheet with no author is not a document anyone can query. */
  preparedBy: string;
}

const W = 595.28;
const H = 841.89;

/** `YYYY-MM-DD` in the reader's zone: the key a punch is filed under. */
function dayKey(at: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

function dayLabel(at: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(at);
}

function clockLabel(at: Date | null | undefined, timeZone: string): string {
  if (!at) return "--:--:--";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(at);
}

function stampLabel(at: Date | null | undefined, timeZone: string): string {
  if (!at) return "—";
  return `${new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at)} ${clockLabel(at, timeZone)}`;
}

/** Minutes as payroll reads them. */
export function hoursLabel(minutes: number | null): string {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

/** Decimal hours, because that is the column that gets multiplied by a rate. */
function decimalHours(minutes: number): string {
  return (minutes / 60).toFixed(2);
}

const coords = (punch: TimesheetPunch): string =>
  punch.lat != null && punch.lng != null
    ? `${punch.lat.toFixed(6)}, ${punch.lng.toFixed(6)}${
        punch.accuracyM != null ? ` (±${Math.round(punch.accuracyM)}m)` : ""
      }`
    : "No GPS fix";

/**
 * The skew read as a sentence rather than a number of milliseconds.
 *
 * A timesheet reader does not care that the phone was 1,400ms fast; they care whether the time
 * on the row is the network's or the handset's own claim.
 */
function clockLine(punch: TimesheetPunch): string {
  // An office entry has no device clock to compare against: the skew is between the server and
  // whatever hour someone typed, which says nothing about when the shift began. Name the origin
  // instead of printing a measurement that looks like evidence.
  if (punch.source === "manual") return "Typed by the office — no device clock to compare";
  const source = punch.timeSource === "device" ? "Device clock" : "Network-verified";
  const skew = punch.clockSkewMs != null ? `${(punch.clockSkewMs / 1000).toFixed(1)}s skew` : null;
  return [source, skew].filter(Boolean).join(" · ");
}

function deviceLine(punch: TimesheetPunch): string {
  const bits = [punch.deviceModel, punch.platform].filter(Boolean) as string[];
  const extras: string[] = [];
  if (punch.altitudeM != null) extras.push(`${Math.round(punch.altitudeM)}m alt`);
  if (punch.heading != null) extras.push(`${Math.round(punch.heading)}° hdg`);
  return [bits.join(" · ") || "Unknown device", ...extras].join(" · ");
}

/** Hard-wrap on width rather than word count, so an address fills the line it is given. */
function fit(text: string, max: number): string {
  const safe = wa(text);
  return safe.length > max ? `${safe.slice(0, max - 1)}…` : safe;
}

interface Sheet {
  page: ReturnType<PDFDocument["addPage"]>;
  y: number;
  index: number;
}

export async function buildTimesheetPdf(ctx: TimesheetContext): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const mono = await pdf.embedFont(StandardFonts.Courier);

  const tz = ctx.timeZone;
  const worked = ctx.shifts.reduce((sum, s) => sum + (s.minutes ?? 0), 0);
  const open = ctx.shifts.filter((s) => s.openEnded).length;
  const orphans = ctx.shifts.filter((s) => !s.inId).length;

  // ── Cover ────────────────────────────────────────────────────────────────────────────────
  const cover = pdf.addPage([W, H]);
  cover.drawRectangle({ x: 0, y: 0, width: W, height: H, color: INK });
  cover.drawRectangle({ x: 0, y: H - 8, width: W, height: 8, color: AMBER });
  cover.drawText("GEOCLIKS", { x: 48, y: H - 92, size: 12, font: mono, color: AMBER });
  cover.drawText("DRIVER TIMESHEET", { x: 48, y: H - 110, size: 9, font: mono, color: FOG });
  cover.drawText(fit(ctx.driverName, 24), {
    x: 48,
    y: H - 180,
    size: 30,
    font: bold,
    color: WHITE,
  });

  const window = `${dayLabel(ctx.from, tz)} – ${dayLabel(ctx.to, tz)}`;
  const rows: Array<[string, string]> = [
    ["Organization", ctx.orgName],
    ["Role", ctx.driverRole ?? "—"],
    ["Period", window],
    ["Timezone", tz],
    ["Shifts", String(ctx.shifts.length)],
    ["Hours worked", `${hoursLabel(worked)}  (${decimalHours(worked)} h)`],
    ["Punches", String(ctx.punches.length)],
    ["Prepared by", ctx.preparedBy],
    ["Generated", stampLabel(new Date(), tz)],
  ];
  let y = H - 240;
  for (const [label, value] of rows) {
    cover.drawText(label.toUpperCase(), { x: 48, y, size: 8, font: mono, color: FOG });
    cover.drawText(fit(value, 52), { x: 180, y: y - 1, size: 11, font, color: WHITE });
    y -= 26;
  }

  // The two things a payroll clerk has to be told about before they sign, said on the cover
  // rather than buried in the log: a shift still open, and an out with no in.
  if (open > 0 || orphans > 0) {
    cover.drawRectangle({ x: 48, y: 158, width: W - 96, height: 56, color: AMBER, opacity: 0.12 });
    cover.drawText("NEEDS REVIEW", { x: 60, y: 194, size: 8, font: mono, color: AMBER });
    const notes = [
      open > 0 ? `${open} shift${open === 1 ? "" : "s"} left open — no clock-out recorded.` : null,
      orphans > 0 ? `${orphans} clock-out${orphans === 1 ? "" : "s"} with no clock-in before it.` : null,
    ].filter(Boolean) as string[];
    notes.forEach((note, i) => {
      cover.drawText(fit(note, 74), { x: 60, y: 176 - i * 14, size: 9, font, color: WHITE });
    });
  }

  // Says what the log actually is. Claiming every row came off the driver's handset would be a
  // lie on any sheet the office had to patch by hand, and the count is the first thing a clerk
  // looking for a padded timesheet wants.
  const typed = ctx.punches.filter((punch) => punch.source === "manual").length;
  const intro =
    typed === 0
      ? "Every punch below was recorded by the driver's own handset with no photo taken:"
      : `${ctx.punches.length - typed} of ${ctx.punches.length} punches below came off the driver's handset, no photo taken:`;
  cover.drawText(fit(intro, 92), { x: 48, y: 112, size: 9, font, color: FOG });
  cover.drawText(
    typed === 0
      ? "time, GPS fix and a unique punch code, signed on arrival at the server."
      : `time, GPS fix and a unique punch code, signed on arrival. ${typed} entered by the office.`,
    { x: 48, y: 98, size: 9, font, color: FOG },
  );

  // ── Log pages ────────────────────────────────────────────────────────────────────────────
  const byId = new Map(ctx.punches.map((p) => [p.id, p]));
  const days = new Map<string, TimesheetShift[]>();
  for (const shift of ctx.shifts) {
    const anchor = shift.startedAt ?? shift.endedAt;
    if (!anchor) continue;
    const key = dayKey(anchor, tz);
    const list = days.get(key);
    if (list) list.push(shift);
    else days.set(key, [shift]);
  }

  const sheet: Sheet = { page: cover, y: 0, index: 1 };
  const header = () => {
    sheet.index += 1;
    const page = pdf.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: WHITE });
    page.drawRectangle({ x: 0, y: H - 46, width: W, height: 46, color: INK });
    page.drawText(fit(`${ctx.driverName} · TIMESHEET`, 52).toUpperCase(), {
      x: 40,
      y: H - 29,
      size: 10,
      font: mono,
      color: WHITE,
    });
    page.drawText(`PAGE ${sheet.index}`, {
      x: W - 96,
      y: H - 29,
      size: 9,
      font: mono,
      color: AMBER,
    });
    sheet.page = page;
    sheet.y = H - 76;
  };
  const room = (need: number) => {
    if (sheet.y - need < 56) header();
  };

  header();

  if (days.size === 0) {
    sheet.page.drawText("No punches in this period.", {
      x: 40,
      y: sheet.y,
      size: 11,
      font,
      color: INK,
    });
  }

  for (const [key, shifts] of [...days.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const anchor = shifts[0]!.startedAt ?? shifts[0]!.endedAt!;
    const dayMinutes = shifts.reduce((sum, s) => sum + (s.minutes ?? 0), 0);
    room(84);
    sheet.page.drawRectangle({ x: 40, y: sheet.y - 6, width: W - 80, height: 22, color: INK });
    sheet.page.drawText(fit(dayLabel(anchor, tz), 40), {
      x: 48,
      y: sheet.y,
      size: 10,
      font: bold,
      color: WHITE,
    });
    const total = `${hoursLabel(dayMinutes)}  ·  ${decimalHours(dayMinutes)} h`;
    sheet.page.drawText(total, {
      x: W - 48 - mono.widthOfTextAtSize(total, 9),
      y: sheet.y,
      size: 9,
      font: mono,
      color: AMBER,
    });
    sheet.y -= 34;
    void key;

    for (const shift of shifts) {
      const punchIn = shift.inId ? byId.get(shift.inId) : undefined;
      const punchOut = shift.outId ? byId.get(shift.outId) : undefined;
      const stamps = [punchIn, punchOut].filter(Boolean) as TimesheetPunch[];
      room(28 + stamps.length * 46);

      const span = `${clockLabel(shift.startedAt, tz)}  ->  ${clockLabel(shift.endedAt, tz)}`;
      sheet.page.drawText(span, { x: 48, y: sheet.y, size: 11, font: mono, color: INK });
      const duration = shift.openEnded ? "STILL ON THE CLOCK" : hoursLabel(shift.minutes);
      sheet.page.drawText(duration, {
        x: W - 48 - bold.widthOfTextAtSize(duration, 9),
        y: sheet.y,
        size: 9,
        font: bold,
        color: shift.openEnded ? AMBER : INK,
      });
      sheet.y -= 16;

      for (const punch of stamps) {
        const verified = punch.integrity !== "unverified";
        sheet.page.drawRectangle({
          x: 48,
          y: sheet.y - 34,
          width: 2,
          height: 44,
          color: verified ? GREEN : AMBER,
        });
        const tag = `${punch.kind === "in" ? "IN " : "OUT"} ${clockLabel(punch.at, tz)}`;
        sheet.page.drawText(tag, { x: 58, y: sheet.y, size: 8.5, font: mono, color: INK });
        sheet.page.drawText(fit(punch.code ?? "—", 22), {
          x: 150,
          y: sheet.y,
          size: 8.5,
          font: mono,
          color: FOG,
        });
        const mark = verified ? "VERIFIED" : "UNVERIFIED";
        sheet.page.drawText(mark, {
          x: W - 48 - mono.widthOfTextAtSize(mark, 7.5),
          y: sheet.y,
          size: 7.5,
          font: mono,
          color: verified ? GREEN : AMBER,
        });
        sheet.y -= 11;

        const lines: string[] = [
          `${coords(punch)}${punch.address ? ` · ${punch.address}` : ""}`,
          `${clockLine(punch)} · server ${stampLabel(punch.verifiedAt, tz)}`,
          `${deviceLine(punch)}${punch.routeName ? ` · run ${punch.routeName}` : ""}${
            punch.source === "manual" ? " · entered by the office" : ""
          }`,
        ];
        if (punch.note) lines.push(`Note: ${punch.note}`);
        for (const line of lines) {
          sheet.page.drawText(fit(line, 92), { x: 58, y: sheet.y, size: 7.5, font, color: FOG });
          sheet.y -= 10;
        }
        sheet.y -= 4;
      }
      sheet.y -= 8;
    }
  }

  // ── Sign-off ─────────────────────────────────────────────────────────────────────────────
  room(120);
  sheet.y -= 10;
  sheet.page.drawRectangle({ x: 40, y: sheet.y - 4, width: W - 80, height: 1, color: FOG });
  sheet.y -= 26;
  const summary = `TOTAL ${hoursLabel(worked)}  ·  ${decimalHours(worked)} HOURS  ·  ${ctx.shifts.length} SHIFTS`;
  sheet.page.drawText(summary, { x: 40, y: sheet.y, size: 11, font: bold, color: INK });
  sheet.y -= 40;
  for (const label of ["Driver signature", "Approved by"]) {
    sheet.page.drawRectangle({ x: 40, y: sheet.y, width: 220, height: 1, color: INK });
    sheet.page.drawText(label.toUpperCase(), {
      x: 40,
      y: sheet.y - 12,
      size: 7.5,
      font: mono,
      color: FOG,
    });
    sheet.y -= 42;
  }

  return await pdf.save();
}

/** What the timesheet is called once it lands in someone's downloads folder. */
export function timesheetFilename(driverName: string, from: Date, to: Date, timeZone: string) {
  const safe = driverName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  const a = dayKey(from, timeZone);
  const b = dayKey(to, timeZone);
  return `timesheet-${safe || "driver"}-${a}${a === b ? "" : `-to-${b}`}.pdf`;
}
