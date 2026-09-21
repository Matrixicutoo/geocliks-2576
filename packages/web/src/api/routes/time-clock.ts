import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";
import { orgProc, type Role } from "../middleware/auth";

/**
 * The time clock — when crew started and stopped, and where they were standing.
 *
 * Deliberately NOT `routes/clock.ts`. That one is the device time-trust endpoint a phone calls
 * to measure its own clock drift before a capture. This one is attendance. They share a word.
 *
 * Note the naming: `timeClock` below is the oRPC router (the lint rule wants the export to
 * match the filename). The database table is always `schema.timeClockEntries`.
 */

const kindEnum = z.enum(["in", "out"]);

/**
 * Who reads whose times.
 *
 * The office — owner, admin, manager, dispatcher — reads the whole workspace: a dispatcher
 * running a board needs to know which of his drivers is actually on the clock this morning,
 * and payroll is a manager's paperwork. The two crew roles read their own row and nothing
 * else, which is the same rule their captures already follow. There is no in-between: the
 * calendar is either one person's timesheet or the workspace's.
 */
function readsEveryone(role: Role): boolean {
  return role !== "driver" && role !== "field";
}

/** The punch belongs to the person who made it, so a crew member can only ask about himself. */
function scopeUserId(role: Role, selfId: string, asked: string | null | undefined): string | null {
  if (readsEveryone(role)) return asked ?? null;
  if (asked && asked !== selfId) {
    throw new ORPCError("FORBIDDEN", { message: "You can only see your own time clock" });
  }
  return selfId;
}

export type TimeClockRow = typeof schema.timeClockEntries.$inferSelect;

/**
 * Punches in, punches out — a shift each time the two meet.
 *
 * Pairing happens here rather than in the table because a punch is the only thing the phone can
 * record honestly: it knows the moment it happened and nothing about how the day will end. So
 * the rules are the forgiving ones a real shift needs:
 *
 *  - an `out` with no `in` before it closes nothing and is reported on its own, which is what a
 *    driver who forgot to clock in looks like;
 *  - a second `in` while one is already open does not throw the first away — it closes it as
 *    open-ended and starts a new one, so a missed clock-out costs one shift's duration rather
 *    than the rest of the day;
 *  - the last `in` of the day with no `out` after it stays open. `openEnded` says so, and the
 *    duration is null rather than a guess. A crew member still on the clock and one who drove
 *    home without punching out are the same shape here on purpose: only he knows which.
 */
export type Shift = {
  inId: string | null;
  outId: string | null;
  userId: string;
  startedAt: Date | null;
  endedAt: Date | null;
  minutes: number | null;
  openEnded: boolean;
};

export function pairShifts(rows: TimeClockRow[]): Shift[] {
  const shifts: Shift[] = [];
  const open = new Map<string, TimeClockRow>();

  const close = (entry: TimeClockRow | null, punchIn: TimeClockRow) => {
    shifts.push({
      inId: punchIn.id,
      outId: entry?.id ?? null,
      userId: punchIn.userId,
      startedAt: punchIn.at,
      endedAt: entry?.at ?? null,
      minutes: entry ? Math.max(0, Math.round((entry.at.getTime() - punchIn.at.getTime()) / 60000)) : null,
      openEnded: !entry,
    });
  };

  for (const row of [...rows].sort((a, b) => a.at.getTime() - b.at.getTime())) {
    const held = open.get(row.userId) ?? null;
    if (row.kind === "in") {
      // Two clock-ins running: the earlier shift is closed open-ended rather than dropped.
      if (held) close(null, held);
      open.set(row.userId, row);
      continue;
    }
    if (held) {
      close(row, held);
      open.delete(row.userId);
    } else {
      // An `out` nobody clocked in for. Reported, not discarded — it is the evidence that a
      // clock-in was missed, and a timesheet that silently swallowed it would hide the gap.
      shifts.push({
        inId: null,
        outId: row.id,
        userId: row.userId,
        startedAt: null,
        endedAt: row.at,
        minutes: null,
        openEnded: false,
      });
    }
  }
  for (const held of open.values()) close(null, held);
  return shifts.sort((a, b) => {
    const at = (a.startedAt ?? a.endedAt)?.getTime() ?? 0;
    const bt = (b.startedAt ?? b.endedAt)?.getTime() ?? 0;
    return at - bt;
  });
}

/** Names for the calendar. One query for the page, not one per punch. */
async function withNames(rows: TimeClockRow[]) {
  const ids = [...new Set(rows.map((r) => r.userId))];
  if (ids.length === 0) return [];
  const people = await db
    .select({ id: schema.user.id, name: schema.user.name, email: schema.user.email })
    .from(schema.user)
    .where(inArray(schema.user.id, ids));
  const roles = await db
    .select({ userId: schema.members.userId, role: schema.members.role })
    .from(schema.members)
    .where(inArray(schema.members.userId, ids));
  const byId = new Map(people.map((p) => [p.id, p]));
  const roleById = new Map(roles.map((r) => [r.userId, r.role]));
  return rows.map((row) => {
    const person = byId.get(row.userId);
    return {
      ...row,
      userName: person?.name?.trim() || person?.email?.split("@")[0] || "Crew",
      userRole: roleById.get(row.userId) ?? null,
    };
  });
}

/**
 * Records a punch, unless it is a double-tap.
 *
 * Shared by the capture pipeline and the punch endpoint so both go through the same guard. The
 * window is deliberately generous: a driver who taps CLOCK IN twice because the first tap did
 * not look like it worked has not worked two shifts, and the offline queue can legitimately
 * replay the same capture. Two punches of the same kind inside two minutes are one punch.
 */
export async function recordPunch(entry: {
  orgId: string;
  userId: string;
  kind: "in" | "out";
  at: Date;
  lat?: number | null;
  lng?: number | null;
  accuracyM?: number | null;
  address?: string | null;
  photoId?: string | null;
  routeId?: string | null;
  source?: "capture" | "manual";
  note?: string | null;
}): Promise<TimeClockRow | null> {
  const window = 2 * 60 * 1000;
  const near = await db
    .select()
    .from(schema.timeClockEntries)
    .where(
      and(
        eq(schema.timeClockEntries.userId, entry.userId),
        eq(schema.timeClockEntries.kind, entry.kind),
        gte(schema.timeClockEntries.at, new Date(entry.at.getTime() - window)),
        lte(schema.timeClockEntries.at, new Date(entry.at.getTime() + window)),
      ),
    )
    .limit(1);
  if (near.length > 0) return near[0]!;

  const [row] = await db
    .insert(schema.timeClockEntries)
    .values({
      id: id("tcl"),
      orgId: entry.orgId,
      userId: entry.userId,
      kind: entry.kind,
      at: entry.at,
      lat: entry.lat ?? null,
      lng: entry.lng ?? null,
      accuracyM: entry.accuracyM ?? null,
      address: entry.address ?? null,
      photoId: entry.photoId ?? null,
      routeId: entry.routeId ?? null,
      source: entry.source ?? "capture",
      note: entry.note ?? null,
    })
    // The unique index on photo_id is the second line of defence: a capture re-sent by the
    // offline queue cannot punch the same clock twice even outside the window above.
    .onConflictDoNothing()
    .returning();
  return row ?? null;
}

export const timeClock = {
  /**
   * The calendar's only read: every punch in a window, already paired into shifts.
   *
   * The window arrives as epoch milliseconds computed by the client, not as dates, because the
   * day a punch belongs to is a question about the reader's timezone — a dispatcher in Denver
   * looking at a driver's Tuesday means Denver's Tuesday. Nothing here stores a calendar day;
   * the client draws the grid from `at` in its own zone, which is also why the same shift can
   * legitimately sit on different days for two people reading it.
   */
  list: orgProc
    .input(
      z.object({
        from: z.number(),
        to: z.number(),
        /** One person's timesheet. Ignored for a crew member, who only ever gets their own. */
        userId: z.string().nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      const only = scopeUserId(context.role, context.user.id, input.userId);
      const filters = [
        eq(schema.timeClockEntries.orgId, context.org.id),
        gte(schema.timeClockEntries.at, new Date(input.from)),
        lte(schema.timeClockEntries.at, new Date(input.to)),
      ];
      if (only) filters.push(eq(schema.timeClockEntries.userId, only));

      const rows = await db
        .select()
        .from(schema.timeClockEntries)
        .where(and(...filters))
        .orderBy(asc(schema.timeClockEntries.at));

      return {
        entries: await withNames(rows),
        shifts: pairShifts(rows),
        /** Whether this caller is reading a workspace or their own timesheet. */
        scope: only ? ("self" as const) : ("workspace" as const),
      };
    }),

  /**
   * Where this member stands right now: on the clock since when, or off it.
   *
   * Read from the last punch rather than a status column, so it cannot drift out of step with
   * the punches the calendar shows, and so a punch arriving late from the offline queue
   * corrects it by itself.
   */
  current: orgProc.input(z.object({ userId: z.string().nullish() }).optional()).handler(
    async ({ input, context }) => {
      const who = scopeUserId(context.role, context.user.id, input?.userId) ?? context.user.id;
      const [newest] = await db
        .select()
        .from(schema.timeClockEntries)
        .where(
          and(
            eq(schema.timeClockEntries.orgId, context.org.id),
            eq(schema.timeClockEntries.userId, who),
          ),
        )
        .orderBy(desc(schema.timeClockEntries.at))
        .limit(1);
      return {
        userId: who,
        onClock: newest?.kind === "in",
        since: newest?.kind === "in" ? newest.at : null,
        last: newest ?? null,
      };
    },
  ),

  /**
   * A punch with no picture — location and time only.
   *
   * The CLOCK buttons on the phone call this, and it is also what a workspace that does not
   * want a photo on every arrival uses. A punch that came out of an arrival/departure capture
   * is written by the capture pipeline instead (see `photos.create`), which is what keeps an
   * offline shot punching the clock for the moment it was taken rather than the moment it
   * finally uploaded.
   */
  punch: orgProc
    .input(
      z.object({
        kind: kindEnum,
        /** Device time of the punch. Clamped below — a phone cannot backdate its own shift. */
        at: z.number().nullish(),
        lat: z.number().nullish(),
        lng: z.number().nullish(),
        accuracyM: z.number().nullish(),
        address: z.string().max(240).nullish(),
        routeId: z.string().nullish(),
        note: z.string().max(500).nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      // A punch made right now is worth the server's clock. The device time is accepted only
      // as a correction inside the last day, so a phone with a wrong clock — or one trying to
      // add an hour to its own shift — cannot move payroll.
      const now = Date.now();
      const asked = input.at ?? now;
      const at = new Date(Math.min(now, Math.max(asked, now - 24 * 60 * 60 * 1000)));
      const row = await recordPunch({
        orgId: context.org.id,
        userId: context.user.id,
        kind: input.kind,
        at,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        accuracyM: input.accuracyM ?? null,
        address: input.address ?? null,
        routeId: input.routeId ?? null,
        source: "manual",
        note: input.note ?? null,
      });
      if (!row) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Punch not recorded" });
      return row;
    }),

  /**
   * Corrects a punch. Office only: a timesheet a crew member can edit is not a timesheet.
   *
   * Only the time moves. The place stays whatever the device recorded, because that is the part
   * that was actually witnessed — re-typing an address would turn evidence into a claim.
   */
  amend: orgProc
    .input(z.object({ id: z.string(), at: z.number(), note: z.string().max(500).nullish() }))
    .handler(async ({ input, context }) => {
      if (!readsEveryone(context.role)) {
        throw new ORPCError("FORBIDDEN", { message: "Only the office can correct a punch" });
      }
      const [row] = await db
        .update(schema.timeClockEntries)
        .set({ at: new Date(input.at), note: input.note ?? null, source: "manual" })
        .where(
          and(
            eq(schema.timeClockEntries.id, input.id),
            eq(schema.timeClockEntries.orgId, context.org.id),
          ),
        )
        .returning();
      if (!row) throw new ORPCError("NOT_FOUND", { message: "Punch not found" });
      return row;
    }),

  /** Removes a punch that should never have existed. Office only, same reason as `amend`. */
  remove: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    if (!readsEveryone(context.role)) {
      throw new ORPCError("FORBIDDEN", { message: "Only the office can remove a punch" });
    }
    await db
      .delete(schema.timeClockEntries)
      .where(
        and(
          eq(schema.timeClockEntries.id, input.id),
          eq(schema.timeClockEntries.orgId, context.org.id),
        ),
      );
    return { ok: true };
  }),
};
