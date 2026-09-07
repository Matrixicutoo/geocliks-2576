import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { orgProc, visibleProjectIds } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";
import { planOf } from "../lib/plans";
import { presignGet, putObject } from "../lib/s3";
import { buildKmz, buildPdf, buildXlsx, buildZip } from "../lib/exports";

const formatEnum = z.enum(["pdf", "xlsx", "zip", "kmz"]);
const layoutEnum = z.enum(["grid", "detailed", "before_after", "map"]);

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
  kmz: "application/vnd.google-earth.kmz",
};

export const reports = {
  list: orgProc.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.orgId, context.org.id))
      .orderBy(desc(schema.reports.createdAt))
      .limit(60);

    const projects = await db
      .select({ id: schema.projects.id, name: schema.projects.name })
      .from(schema.projects)
      .where(eq(schema.projects.orgId, context.org.id));
    const names = new Map(projects.map((p) => [p.id, p.name]));

    return rows.map((row) => ({
      ...row,
      projectName: row.projectId ? (names.get(row.projectId) ?? null) : null,
    }));
  }),

  /** One-click professional report: builds the package server-side and stores it. */
  create: orgProc
    .input(
      z.object({
        title: z.string().min(1).max(120),
        projectId: z.string().nullish(),
        format: formatEnum,
        layout: layoutEnum.default("grid"),
        photoIds: z.array(z.string()).max(300).optional(),
        tag: z
          .enum([
            "general",
            "before",
            "after",
            "issue",
            "arrival",
            "departure",
            "pickup",
            "delivery",
          ])
          .nullish(),
        limit: z.number().min(1).max(300).default(120),
      }),
    )
    .handler(async ({ input, context }) => {
      const plan = planOf(context.org.plan);
      if (!plan.limits.exports.includes(input.format)) {
        throw new ORPCError("PAYMENT_REQUIRED", {
          status: 402,
          message: `${input.format.toUpperCase()} export is available on the Plus plan and above.`,
        });
      }

      const allowed = await visibleProjectIds(context.org.id, context.user.id, context.role);
      const filters = [eq(schema.photos.orgId, context.org.id)];
      if (input.projectId) filters.push(eq(schema.photos.projectId, input.projectId));
      if (input.tag) filters.push(eq(schema.photos.tag, input.tag));
      if (input.photoIds?.length) filters.push(inArray(schema.photos.id, input.photoIds));
      if (allowed) {
        if (allowed.length === 0) throw new ORPCError("FORBIDDEN");
        filters.push(inArray(schema.photos.projectId, allowed));
      }

      const rows = await db
        .select()
        .from(schema.photos)
        .where(and(...filters))
        .orderBy(desc(schema.photos.capturedAt))
        .limit(input.photoIds?.length ? input.photoIds.length : input.limit);

      if (rows.length === 0) {
        throw new ORPCError("BAD_REQUEST", { message: "No photos match this selection." });
      }

      let ordered = rows;
      if (input.layout === "before_after") {
        const before = rows.filter((p) => p.tag === "before");
        const after = rows.filter((p) => p.tag === "after");
        const pairs: typeof rows = [];
        const max = Math.max(before.length, after.length);
        for (let i = 0; i < max; i++) {
          if (before[i]) pairs.push(before[i]!);
          if (after[i]) pairs.push(after[i]!);
        }
        ordered = pairs.length ? pairs : rows;
      }

      let project: typeof schema.projects.$inferSelect | null = null;
      if (input.projectId) {
        const [row] = await db
          .select()
          .from(schema.projects)
          .where(
            and(
              eq(schema.projects.id, input.projectId),
              eq(schema.projects.orgId, context.org.id),
            ),
          )
          .limit(1);
        project = row ?? null;
      }

      const ctx = {
        title: input.title,
        orgName: context.org.name,
        project,
        photos: ordered,
        layout: input.layout,
      };

      let bytes: Uint8Array;
      if (input.format === "pdf") bytes = await buildPdf(ctx);
      else if (input.format === "xlsx") bytes = await buildXlsx(ctx);
      else if (input.format === "zip") bytes = await buildZip(ctx);
      else bytes = await buildKmz(ctx);

      const reportId = id("rpt");
      const key = `orgs/${context.org.id}/reports/${reportId}.${input.format}`;
      await putObject(key, bytes, MIME[input.format]!);

      const [report] = await db
        .insert(schema.reports)
        .values({
          id: reportId,
          orgId: context.org.id,
          projectId: input.projectId ?? null,
          title: input.title,
          format: input.format,
          layout: input.layout,
          photoCount: ordered.length,
          storageKey: key,
          bytes: bytes.byteLength,
          status: "ready",
          createdBy: context.user.id,
        })
        .returning();

      await db.insert(schema.photoEvents).values(
        ordered.slice(0, 50).map((photo) => ({
          id: id("evt"),
          photoId: photo.id,
          orgId: context.org.id,
          type: "exported",
          actor: context.user.id,
          detail: `${input.format.toUpperCase()} · ${input.title}`,
        })),
      );

      return { ...report!, url: await presignGet(key) };
    }),

  download: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    const [report] = await db
      .select()
      .from(schema.reports)
      .where(and(eq(schema.reports.id, input.id), eq(schema.reports.orgId, context.org.id)))
      .limit(1);
    if (!report?.storageKey) throw new ORPCError("NOT_FOUND");
    return { url: await presignGet(report.storageKey), filename: filenameFor(report) };
  }),

  remove: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    await db
      .delete(schema.reports)
      .where(and(eq(schema.reports.id, input.id), eq(schema.reports.orgId, context.org.id)));
    return { ok: true };
  }),
};

function filenameFor(report: typeof schema.reports.$inferSelect) {
  const safe = report.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return `${safe || "geocliks-report"}.${report.format}`;
}
