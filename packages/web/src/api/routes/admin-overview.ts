import { count, desc, eq, gte, sum } from "drizzle-orm";
import { z } from "zod";
import { db } from "../database";
import * as schema from "../database/schema";
import { authed, staffProc, staffRoleOf } from "../middleware/auth";
import { allPlans, planOf } from "../lib/plans";

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const adminOverview = {
  /** Any signed-in user: is this account platform staff, and is it impersonating someone? */
  me: authed.handler(async ({ context }) => ({
    staffRole: await staffRoleOf(context.actor.id),
    impersonating: context.impersonating
      ? { id: context.user.id, name: context.user.name, email: context.user.email }
      : null,
    actor: { id: context.actor.id, name: context.actor.name, email: context.actor.email },
  })),

  /** Operator home: platform-wide counters, plan mix, MRR estimate and recent audit trail. */
  overview: staffProc.handler(async ({ context }) => {
    const monthStart = startOfMonth();
    const [
      [users],
      [orgsCount],
      [photosTotal],
      [photosMonth],
      [projectsCount],
      [storage],
      planMix,
      events,
      recentUsers,
      [suspended],
    ] = await Promise.all([
      db.select({ value: count() }).from(schema.user),
      db.select({ value: count() }).from(schema.organizations),
      db.select({ value: count() }).from(schema.photos),
      db
        .select({ value: count() })
        .from(schema.photos)
        .where(gte(schema.photos.verifiedAt, monthStart)),
      db.select({ value: count() }).from(schema.projects),
      db.select({ value: sum(schema.photos.bytes) }).from(schema.photos),
      db
        .select({ plan: schema.organizations.plan, value: count(), seats: sum(schema.organizations.seats) })
        .from(schema.organizations)
        .groupBy(schema.organizations.plan),
      db
        .select({
          event: schema.adminEvents,
          actor: { name: schema.user.name, email: schema.user.email },
        })
        .from(schema.adminEvents)
        .leftJoin(schema.user, eq(schema.user.id, schema.adminEvents.actorId))
        .orderBy(desc(schema.adminEvents.at))
        .limit(15),
      db
        .select({
          id: schema.user.id,
          name: schema.user.name,
          email: schema.user.email,
          createdAt: schema.user.createdAt,
        })
        .from(schema.user)
        .orderBy(desc(schema.user.createdAt))
        .limit(6),
      db
        .select({ value: count() })
        .from(schema.userStatus)
        .where(eq(schema.userStatus.suspended, true)),
    ]);

    const mix = planMix.map((row) => {
      const plan = planOf(row.plan);
      const seats = Number(row.seats ?? 0);
      const monthly = plan.priceCents > 0 ? (plan.limits.seats > 1 ? seats : row.value) * plan.priceCents : 0;
      return {
        planId: plan.id,
        name: plan.name,
        workspaces: row.value,
        seats,
        mrrCents: monthly,
      };
    });

    return {
      staffRole: context.staffRole,
      totals: {
        users: users?.value ?? 0,
        workspaces: orgsCount?.value ?? 0,
        photos: photosTotal?.value ?? 0,
        photosThisMonth: photosMonth?.value ?? 0,
        projects: projectsCount?.value ?? 0,
        storageBytes: Number(storage?.value ?? 0),
        suspended: suspended?.value ?? 0,
        planCount: allPlans().length,
      },
      mrrCents: mix.reduce((sumCents, row) => sumCents + row.mrrCents, 0),
      mix,
      recentUsers,
      events: events.map((e) => ({ ...e.event, actor: e.actor?.email ? e.actor : null })),
    };
  }),

  /** Full audit log with paging. */
  events: staffProc
    .input(z.object({ limit: z.number().int().min(1).max(200).default(60) }))
    .handler(async ({ input }) => {
      const rows = await db
        .select({
          event: schema.adminEvents,
          actor: { name: schema.user.name, email: schema.user.email },
        })
        .from(schema.adminEvents)
        .leftJoin(schema.user, eq(schema.user.id, schema.adminEvents.actorId))
        .orderBy(desc(schema.adminEvents.at))
        .limit(input.limit);
      return rows.map((e) => ({ ...e.event, actor: e.actor?.email ? e.actor : null }));
    }),
};
