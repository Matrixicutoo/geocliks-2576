import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, inArray, max, min, sql } from "drizzle-orm";
import { fieldProc, requireRole, visibleProjectIds } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";
import { assertFieldEnabled } from "../lib/plan-guards";
import { planOf } from "../lib/plans";
import { photoUrl } from "../lib/media";

const statusEnum = z.enum(["active", "on_hold", "complete", "archived"]);

export const projects = {
  list: fieldProc
    .input(z.object({ status: statusEnum.optional() }).optional())
    .handler(async ({ input, context }) => {
      const allowed = await visibleProjectIds(context.org.id, context.user.id, context.role);
      const filters = [eq(schema.projects.orgId, context.org.id)];
      if (input?.status) filters.push(eq(schema.projects.status, input.status));
      if (allowed) {
        if (allowed.length === 0) return [];
        filters.push(inArray(schema.projects.id, allowed));
      }

      const rows = await db
        .select()
        .from(schema.projects)
        .where(and(...filters))
        .orderBy(desc(schema.projects.createdAt));

      const stats = await db
        .select({
          projectId: schema.photos.projectId,
          photos: count(),
          lastPhotoAt: max(schema.photos.capturedAt),
          firstPhotoAt: min(schema.photos.capturedAt),
        })
        .from(schema.photos)
        .where(eq(schema.photos.orgId, context.org.id))
        .groupBy(schema.photos.projectId);
      const byProject = new Map(stats.map((s) => [s.projectId, s]));

      const covers = await db
        .select({
          projectId: schema.photos.projectId,
          storageKey: schema.photos.storageKey,
          posterKey: schema.photos.posterKey,
          capturedAt: schema.photos.capturedAt,
        })
        .from(schema.photos)
        .where(eq(schema.photos.orgId, context.org.id))
        .orderBy(desc(schema.photos.capturedAt));
      const coverByProject = new Map<string, string>();
      for (const cover of covers) {
        if (cover.projectId && !coverByProject.has(cover.projectId)) {
          // Video captures only render from their poster frame.
          coverByProject.set(cover.projectId, cover.posterKey ?? cover.storageKey);
        }
      }
      // Storage keys are not fetchable by clients: hand back a short-lived signed URL
      // (or the public asset path for seeded demo photos).
      const coverUrlByProject = new Map<string, string>();
      await Promise.all(
        [...coverByProject.entries()].map(async ([projectId, key]) => {
          const url = await photoUrl(key);
          if (url) coverUrlByProject.set(projectId, url);
        }),
      );

      return rows.map((project) => ({
        ...project,
        photoCount: byProject.get(project.id)?.photos ?? 0,
        lastPhotoAt: byProject.get(project.id)?.lastPhotoAt ?? null,
        firstPhotoAt: byProject.get(project.id)?.firstPhotoAt ?? null,
        coverKey: coverByProject.get(project.id) ?? null,
        coverUrl: coverUrlByProject.get(project.id) ?? null,
      }));
    }),

  get: fieldProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    const [project] = await db
      .select()
      .from(schema.projects)
      .where(and(eq(schema.projects.id, input.id), eq(schema.projects.orgId, context.org.id)));
    if (!project) throw new ORPCError("NOT_FOUND", { message: "Project not found" });

    const allowed = await visibleProjectIds(context.org.id, context.user.id, context.role);
    if (allowed && !allowed.includes(project.id)) throw new ORPCError("FORBIDDEN");

    const [stats] = await db
      .select({
        photos: count(),
        lastPhotoAt: max(schema.photos.capturedAt),
        firstPhotoAt: min(schema.photos.capturedAt),
        contributors: sql<number>`count(distinct ${schema.photos.userId})`,
      })
      .from(schema.photos)
      .where(eq(schema.photos.projectId, project.id));

    return {
      ...project,
      photoCount: stats?.photos ?? 0,
      lastPhotoAt: stats?.lastPhotoAt ?? null,
      firstPhotoAt: stats?.firstPhotoAt ?? null,
      contributors: Number(stats?.contributors ?? 0),
    };
  }),

  create: fieldProc
    .input(
      z.object({
        name: z.string().min(1).max(90),
        code: z.string().max(40).nullish(),
        client: z.string().max(90).nullish(),
        locationLabel: z.string().max(120).nullish(),
        address: z.string().max(200).nullish(),
        lat: z.number().nullish(),
        lng: z.number().nullish(),
        category: z.string().max(40).nullish(),
        notes: z.string().max(2000).nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const plan = planOf(context.org.plan);
      assertFieldEnabled(plan);
      const [used] = await db
        .select({ value: count() })
        .from(schema.projects)
        .where(eq(schema.projects.orgId, context.org.id));
      if (plan.limits.projects !== -1 && (used?.value ?? 0) >= plan.limits.projects) {
        throw new ORPCError("PAYMENT_REQUIRED", {
          status: 402,
          message: `${plan.name} includes ${plan.limits.projects} projects. Upgrade to add more.`,
        });
      }
      const [project] = await db
        .insert(schema.projects)
        .values({ id: id("prj"), orgId: context.org.id, createdBy: context.user.id, ...input })
        .returning();
      return project;
    }),

  update: fieldProc
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(90).optional(),
        code: z.string().max(40).nullish(),
        client: z.string().max(90).nullish(),
        locationLabel: z.string().max(120).nullish(),
        address: z.string().max(200).nullish(),
        status: statusEnum.optional(),
        category: z.string().max(40).nullish(),
        notes: z.string().max(2000).nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const { id: projectId, ...patch } = input;
      const [project] = await db
        .update(schema.projects)
        .set(patch)
        .where(and(eq(schema.projects.id, projectId), eq(schema.projects.orgId, context.org.id)))
        .returning();
      if (!project) throw new ORPCError("NOT_FOUND");
      return project;
    }),

  /** Soft delete: the project drops out of the active lists but keeps all of its evidence. */
  remove: fieldProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    requireRole(context.role, "admin");
    await db
      .update(schema.projects)
      .set({ status: "archived" })
      .where(and(eq(schema.projects.id, input.id), eq(schema.projects.orgId, context.org.id)));
    return { ok: true };
  }),

  /**
   * Hard delete the project record. Photos are never destroyed here — they are detached and
   * stay in the teamspace, because deleting a folder must not silently destroy evidence.
   * Share links and reports scoped to the project become workspace-wide instead of dangling.
   */
  destroy: fieldProc
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }): Promise<{ ok: true; detachedPhotos: number }> => {
      requireRole(context.role, "admin");
      const [project] = await db
        .select({ id: schema.projects.id })
        .from(schema.projects)
        .where(and(eq(schema.projects.id, input.id), eq(schema.projects.orgId, context.org.id)))
        .limit(1);
      if (!project) throw new ORPCError("NOT_FOUND");

      const [{ n }] = await db
        .select({ n: count() })
        .from(schema.photos)
        .where(
          and(eq(schema.photos.orgId, context.org.id), eq(schema.photos.projectId, project.id)),
        );

      await db
        .update(schema.photos)
        .set({ projectId: null })
        .where(eq(schema.photos.projectId, project.id));
      await db
        .update(schema.shareLinks)
        .set({ projectId: null })
        .where(eq(schema.shareLinks.projectId, project.id));
      await db
        .update(schema.reports)
        .set({ projectId: null })
        .where(eq(schema.reports.projectId, project.id));
      await db
        .update(schema.comparisons)
        .set({ projectId: null })
        .where(eq(schema.comparisons.projectId, project.id));
      await db
        .delete(schema.projectAssignments)
        .where(eq(schema.projectAssignments.projectId, project.id));
      await db.delete(schema.projects).where(eq(schema.projects.id, project.id));

      return { ok: true, detachedPhotos: Number(n ?? 0) };
    }),
};
