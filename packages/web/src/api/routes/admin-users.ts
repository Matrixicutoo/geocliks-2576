import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, like, or, sum } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  createImpersonation,
  logAdmin,
  requireSuperadmin,
  staffProc,
} from "../middleware/auth";
import { allPlans, planOf } from "../lib/plans";
import { id } from "../lib/ids";

export const adminUsers = {
  /** Every user on the platform with workspace, role, staff flag and suspension state. */
  list: staffProc
    .input(
      z.object({
        q: z.string().max(120).optional(),
        limit: z.number().int().min(1).max(200).default(50),
      }),
    )
    .handler(async ({ input }) => {
      const term = input.q?.trim();
      const filter = term
        ? or(like(schema.user.email, `%${term}%`), like(schema.user.name, `%${term}%`))
        : undefined;

      const rows = await db
        .select({
          user: {
            id: schema.user.id,
            name: schema.user.name,
            email: schema.user.email,
            image: schema.user.image,
            createdAt: schema.user.createdAt,
          },
          member: { role: schema.members.role, orgId: schema.members.orgId },
          org: {
            id: schema.organizations.id,
            name: schema.organizations.name,
            plan: schema.organizations.plan,
            seats: schema.organizations.seats,
          },
          staffRole: schema.staff.role,
          suspended: schema.userStatus.suspended,
          suspendReason: schema.userStatus.reason,
        })
        .from(schema.user)
        .leftJoin(schema.members, eq(schema.members.userId, schema.user.id))
        .leftJoin(schema.organizations, eq(schema.organizations.id, schema.members.orgId))
        .leftJoin(schema.staff, eq(schema.staff.userId, schema.user.id))
        .leftJoin(schema.userStatus, eq(schema.userStatus.userId, schema.user.id))
        .where(filter)
        .orderBy(desc(schema.user.createdAt))
        .limit(input.limit);

      const photoCounts = await db
        .select({ userId: schema.photos.userId, value: count() })
        .from(schema.photos)
        .groupBy(schema.photos.userId);
      const byUser = new Map(photoCounts.map((r) => [r.userId, r.value]));

      // A user can belong to several workspaces, so the member join fans out. Collapse to one row
      // per account and show the workspace they own (falling back to their first membership).
      const primary = new Map<string, (typeof rows)[number]>();
      for (const row of rows) {
        const kept = primary.get(row.user.id);
        if (!kept || (kept.member?.role !== "owner" && row.member?.role === "owner")) {
          primary.set(row.user.id, row);
        }
      }

      return [...primary.values()].map((r) => ({
        ...r.user,
        role: r.member?.role ?? null,
        org: r.org?.id ? r.org : null,
        planName: r.org?.plan ? planOf(r.org.plan).name : null,
        staffRole: (r.staffRole as "superadmin" | "admin" | null) ?? null,
        suspended: r.suspended ?? false,
        suspendReason: r.suspendReason ?? null,
        photos: byUser.get(r.user.id) ?? 0,
      }));
    }),

  /** Promote / demote platform staff. */
  setStaff: staffProc
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["superadmin", "admin", "none"]),
      }),
    )
    .handler(async ({ input, context }) => {
      requireSuperadmin(context.staffRole);
      if (input.userId === context.actor.id && input.role !== "superadmin") {
        throw new ORPCError("BAD_REQUEST", { message: "You cannot demote yourself." });
      }

      if (input.role === "none") {
        await db.delete(schema.staff).where(eq(schema.staff.userId, input.userId));
      } else {
        const [existing] = await db
          .select({ id: schema.staff.id })
          .from(schema.staff)
          .where(eq(schema.staff.userId, input.userId))
          .limit(1);
        if (existing) {
          await db
            .update(schema.staff)
            .set({ role: input.role })
            .where(eq(schema.staff.userId, input.userId));
        } else {
          await db.insert(schema.staff).values({
            id: id("stf"),
            userId: input.userId,
            role: input.role,
            createdBy: context.actor.id,
          });
        }
      }
      await logAdmin(context.actor.id, "staff.set", input.userId, input.role);
      return { ok: true };
    }),

  /** Suspend or restore an account — suspended users are locked out of every client. */
  setSuspended: staffProc
    .input(
      z.object({
        userId: z.string(),
        suspended: z.boolean(),
        reason: z.string().max(200).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      if (input.userId === context.actor.id) {
        throw new ORPCError("BAD_REQUEST", { message: "You cannot suspend yourself." });
      }
      const [existing] = await db
        .select({ id: schema.userStatus.id })
        .from(schema.userStatus)
        .where(eq(schema.userStatus.userId, input.userId))
        .limit(1);
      const values = {
        suspended: input.suspended,
        suspendedAt: input.suspended ? new Date() : null,
        reason: input.suspended ? (input.reason ?? null) : null,
      };
      if (existing) {
        await db
          .update(schema.userStatus)
          .set(values)
          .where(eq(schema.userStatus.userId, input.userId));
      } else {
        await db
          .insert(schema.userStatus)
          .values({ id: id("ust"), userId: input.userId, ...values });
      }
      await logAdmin(
        context.actor.id,
        input.suspended ? "user.suspend" : "user.restore",
        input.userId,
        input.reason ?? null,
      );
      return { ok: true };
    }),

  /** Hard delete — removes the account and everything its workspace owns. */
  remove: staffProc.input(z.object({ userId: z.string() })).handler(async ({ input, context }) => {
    requireSuperadmin(context.staffRole);
    if (input.userId === context.actor.id) {
      throw new ORPCError("BAD_REQUEST", { message: "You cannot delete your own account." });
    }
    const [target] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, input.userId))
      .limit(1);
    if (!target) throw new ORPCError("NOT_FOUND", { message: "User not found" });

    const ownedOrgs = await db
      .select({ id: schema.organizations.id })
      .from(schema.organizations)
      .where(eq(schema.organizations.ownerId, input.userId));

    for (const org of ownedOrgs) {
      await db.delete(schema.photoEvents).where(eq(schema.photoEvents.orgId, org.id));
      await db.delete(schema.photos).where(eq(schema.photos.orgId, org.id));
      await db.delete(schema.comparisons).where(eq(schema.comparisons.orgId, org.id));
      await db.delete(schema.reports).where(eq(schema.reports.orgId, org.id));
      await db.delete(schema.shareLinks).where(eq(schema.shareLinks.orgId, org.id));
      await db.delete(schema.watermarkTemplates).where(eq(schema.watermarkTemplates.orgId, org.id));
      await db.delete(schema.projectAssignments).where(eq(schema.projectAssignments.orgId, org.id));
      await db.delete(schema.projects).where(eq(schema.projects.orgId, org.id));
      await db.delete(schema.invites).where(eq(schema.invites.orgId, org.id));
      await db.delete(schema.members).where(eq(schema.members.orgId, org.id));
      await db.delete(schema.subscriptions).where(eq(schema.subscriptions.orgId, org.id));
      await db.delete(schema.organizations).where(eq(schema.organizations.id, org.id));
    }

    await db.delete(schema.members).where(eq(schema.members.userId, input.userId));
    await db.delete(schema.staff).where(eq(schema.staff.userId, input.userId));
    await db.delete(schema.userStatus).where(eq(schema.userStatus.userId, input.userId));
    await db.delete(schema.impersonations).where(eq(schema.impersonations.userId, input.userId));
    await db.delete(schema.session).where(eq(schema.session.userId, input.userId));
    await db.delete(schema.account).where(eq(schema.account.userId, input.userId));
    await db.delete(schema.user).where(eq(schema.user.id, input.userId));

    await logAdmin(context.actor.id, "user.delete", input.userId, target.email);
    return { ok: true };
  }),

  /** Support impersonation — returns a 1h token the client sends as x-geocliks-impersonate. */
  impersonate: staffProc
    .input(z.object({ userId: z.string() }))
    .handler(async ({ input, context }) => {
      const [target] = await db
        .select({ id: schema.user.id, name: schema.user.name, email: schema.user.email })
        .from(schema.user)
        .where(eq(schema.user.id, input.userId))
        .limit(1);
      if (!target) throw new ORPCError("NOT_FOUND", { message: "User not found" });

      const grant = await createImpersonation(context.actor.id, input.userId);
      await logAdmin(context.actor.id, "user.impersonate", input.userId, target.email);
      return { ...grant, user: target };
    }),

  /** All workspaces with usage, plan and owner. */
  workspaces: staffProc
    .input(z.object({ q: z.string().max(120).optional() }))
    .handler(async ({ input }) => {
      const term = input.q?.trim();
      const rows = await db
        .select({
          org: schema.organizations,
          owner: { id: schema.user.id, name: schema.user.name, email: schema.user.email },
          sub: {
            provider: schema.subscriptions.provider,
            status: schema.subscriptions.status,
            planId: schema.subscriptions.planId,
          },
        })
        .from(schema.organizations)
        .leftJoin(schema.user, eq(schema.user.id, schema.organizations.ownerId))
        .leftJoin(schema.subscriptions, eq(schema.subscriptions.orgId, schema.organizations.id))
        .where(term ? like(schema.organizations.name, `%${term}%`) : undefined)
        .orderBy(desc(schema.organizations.createdAt))
        .limit(100);

      const [photoRows, projectRows, memberRows] = await Promise.all([
        db
          .select({ orgId: schema.photos.orgId, value: count(), bytes: sum(schema.photos.bytes) })
          .from(schema.photos)
          .groupBy(schema.photos.orgId),
        db
          .select({ orgId: schema.projects.orgId, value: count() })
          .from(schema.projects)
          .groupBy(schema.projects.orgId),
        db
          .select({ orgId: schema.members.orgId, value: count() })
          .from(schema.members)
          .groupBy(schema.members.orgId),
      ]);
      const photos = new Map(photoRows.map((r) => [r.orgId, r]));
      const projects = new Map(projectRows.map((r) => [r.orgId, r.value]));
      const members = new Map(memberRows.map((r) => [r.orgId, r.value]));

      return {
        workspaces: rows.map((r) => ({
          ...r.org,
          owner: r.owner?.id ? r.owner : null,
          planName: planOf(r.org.plan).name,
          subscription: r.sub?.planId ? r.sub : null,
          usage: {
            photos: photos.get(r.org.id)?.value ?? 0,
            storageBytes: Number(photos.get(r.org.id)?.bytes ?? 0),
            projects: projects.get(r.org.id) ?? 0,
            members: members.get(r.org.id) ?? 0,
          },
        })),
        plans: allPlans().map((p) => ({ id: p.id, name: p.name, seats: p.limits.seats })),
      };
    }),

  /** Change any workspace's plan and seat count from the operator console. */
  setWorkspacePlan: staffProc
    .input(
      z.object({
        orgId: z.string(),
        planId: z.string(),
        seats: z.number().int().min(1).max(100000),
      }),
    )
    .handler(async ({ input, context }) => {
      const [plan] = await db
        .select()
        .from(schema.plans)
        .where(eq(schema.plans.id, input.planId))
        .limit(1);
      if (!plan) throw new ORPCError("NOT_FOUND", { message: "Plan not found" });

      const [{ value: memberCount }] = await db
        .select({ value: count() })
        .from(schema.members)
        .where(eq(schema.members.orgId, input.orgId));

      const [org] = await db
        .update(schema.organizations)
        .set({ plan: input.planId, seats: Math.max(input.seats, memberCount) })
        .where(eq(schema.organizations.id, input.orgId))
        .returning();
      if (!org) throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

      const [existing] = await db
        .select({ id: schema.subscriptions.id })
        .from(schema.subscriptions)
        .where(eq(schema.subscriptions.orgId, input.orgId))
        .limit(1);
      if (existing) {
        await db
          .update(schema.subscriptions)
          .set({
            planId: input.planId,
            seats: org.seats,
            provider: "manual",
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(schema.subscriptions.orgId, input.orgId));
      } else {
        await db.insert(schema.subscriptions).values({
          id: id("sub"),
          orgId: input.orgId,
          planId: input.planId,
          seats: org.seats,
          provider: "manual",
          status: "active",
        });
      }

      await logAdmin(
        context.actor.id,
        "workspace.plan",
        input.orgId,
        `${input.planId} · ${org.seats} seats`,
      );
      return org;
    }),

  /** Members of one workspace — used by the workspace detail drawer. */
  workspaceMembers: staffProc
    .input(z.object({ orgId: z.string() }))
    .handler(({ input }) =>
      db
        .select({
          role: schema.members.role,
          title: schema.members.title,
          user: { id: schema.user.id, name: schema.user.name, email: schema.user.email },
        })
        .from(schema.members)
        .leftJoin(schema.user, eq(schema.user.id, schema.members.userId))
        .where(and(eq(schema.members.orgId, input.orgId))),
    ),
};
