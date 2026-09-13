import { z } from "zod";
import { tool } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";
import { planOf } from "../lib/plans";
import { presignGet, putObject } from "../lib/s3";
import {
  buildKmz,
  buildPdf,
  buildXlsx,
  buildZip,
  exportFilename,
  exportMime,
} from "../lib/exports";
import { filterFields, photoScope } from "./filters";
import type { Viewer } from "./viewer";
import { todayIn } from "./zone";

/**
 * Building a real report from the chat — "send me today's photos as a work report".
 *
 * This is the same package the Reports screen builds, deliberately: the same four `build*`
 * functions, the same layouts, the same `reports` row, the same storage key. Asking for it in
 * words and picking it from the form produce one artifact, and the one built here shows up in
 * the Reports list afterwards like any other, where it can be downloaded again after the link
 * in the transcript has expired.
 *
 * What it does not reuse is `reports.create` itself. That is an `orgProc` handler: it reads its
 * org and role off an oRPC context this code path does not have, and throws `ORPCError`s that
 * would surface to the model as a tool crash rather than as something it could explain. So the
 * body below is the same sequence against a `Viewer`, with the refusals returned as sentences
 * the assistant can say out loud.
 *
 * Two limits are load-bearing:
 *
 * - The plan gate. Free workspaces may export PDF only, and the chat must not be a way around
 *   the paywall the Reports screen enforces. A blocked format comes back as `blocked` with the
 *   plan's actual allowance, so the reply can offer the PDF instead of just refusing.
 * - The photo scope. Rows come through `photoScope`, so a driver can only ever export their
 *   own captures — a report is a copy of the pixels, so this is the one tool where getting the
 *   scoping wrong would hand over the photos themselves rather than a count of them.
 */

/** A chat-built report stays well under the form's 300, because it is built while someone waits. */
const MAX_PHOTOS = 120;

const input = z.object({
  ...filterFields,
  title: z
    .string()
    .min(1)
    .max(120)
    .optional()
    .describe(
      "What to call the report, in the person's own words where they gave them — 'Elmwood Dr " +
        "progress', 'Monday delivery proof'. Defaults to the workspace and today's date.",
    ),
  format: z
    .enum(["pdf", "xlsx", "zip", "kmz"])
    .optional()
    .describe(
      "pdf is the report people mean by default: photos, stamps, maps, ready to send. xlsx is " +
        "a spreadsheet of the metadata, zip is the original files plus a manifest, kmz opens " +
        "the fixes in Google Earth. Ask only if they clearly want data rather than a report.",
    ),
  layout: z
    .enum(["grid", "detailed", "before_after", "map"])
    .optional()
    .describe(
      "PDF layout. grid is several photos a page, detailed is one photo a page with its full " +
        "metadata, before_after pairs before and after shots, map leads with the route. " +
        "Ignored by the other formats.",
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_PHOTOS)
    .optional()
    .describe(`How many captures to include, newest first. Up to ${MAX_PHOTOS}.`),
});

export function reportExportTool(viewer: Viewer, zone: string) {
  return tool({
    description:
      "Build a downloadable report of this workspace's captures — PDF, Excel, ZIP or KMZ — and " +
      "return a link to it. Use it when the person asks for a report, an export, a PDF, a " +
      "spreadsheet, proof to send a client, or 'as a work report'. The app shows it as a file " +
      "card with a download button under your reply. It includes only captures this person is " +
      "allowed to see.",
    inputSchema: input,
    execute: async (args) => {
      const format = args.format ?? "pdf";
      const layout = args.layout ?? "grid";
      const plan = planOf(viewer.plan);
      if (!plan.limits.exports.includes(format)) {
        return {
          blocked: `${format.toUpperCase()} export is not included in the ${plan.name} plan.`,
          allowedFormats: plan.limits.exports,
          hint: "Offer one of the allowed formats instead, or upgrading on the Billing screen.",
        };
      }

      const scope = await photoScope(viewer, zone, args);
      if (!scope.ok) return { note: scope.note };

      // The builders need whole photo rows — stamps, signatures, coordinates, storage keys —
      // so this is the one tool that selects the row rather than a projection of it.
      const rows = await db
        .select()
        .from(schema.photos)
        .where(and(...scope.filters))
        .orderBy(desc(schema.photos.capturedAt))
        .limit(Math.min(args.limit ?? MAX_PHOTOS, MAX_PHOTOS));

      if (rows.length === 0) {
        return {
          note: "Nothing matched, so there is nothing to put in a report. Try a wider date range.",
        };
      }

      // Before/after is a comparison layout: interleaved so each page pairs the two states, and
      // left alone when the selection has no pairs to interleave.
      let ordered = rows;
      if (layout === "before_after") {
        const before = rows.filter((p) => p.tag === "before");
        const after = rows.filter((p) => p.tag === "after");
        const pairs: typeof rows = [];
        for (let i = 0; i < Math.max(before.length, after.length); i++) {
          if (before[i]) pairs.push(before[i]!);
          if (after[i]) pairs.push(after[i]!);
        }
        ordered = pairs.length ? pairs : rows;
      }

      // A report belongs to a project only when the whole selection does, which is also what
      // puts the project's name and details on the cover page.
      const only = [...new Set(ordered.map((p) => p.projectId))];
      const projectId = only.length === 1 ? only[0]! : null;
      let project: typeof schema.projects.$inferSelect | null = null;
      if (projectId) {
        const [row] = await db
          .select()
          .from(schema.projects)
          .where(
            and(eq(schema.projects.id, projectId), eq(schema.projects.orgId, viewer.orgId)),
          )
          .limit(1);
        project = row ?? null;
      }

      const title = args.title?.trim() || `${viewer.orgName} — ${todayIn(zone)}`;
      const ctx = { title, orgName: viewer.orgName, project, photos: ordered, layout };

      let bytes: Uint8Array;
      if (format === "pdf") bytes = await buildPdf(ctx);
      else if (format === "xlsx") bytes = await buildXlsx(ctx);
      else if (format === "zip") bytes = await buildZip(ctx);
      else bytes = await buildKmz(ctx);

      const reportId = id("rpt");
      const key = `orgs/${viewer.orgId}/reports/${reportId}.${format}`;
      await putObject(key, bytes, exportMime[format]!);

      const [report] = await db
        .insert(schema.reports)
        .values({
          id: reportId,
          orgId: viewer.orgId,
          projectId,
          title,
          format,
          layout,
          photoCount: ordered.length,
          storageKey: key,
          bytes: bytes.byteLength,
          status: "ready",
          createdBy: viewer.userId,
        })
        .returning();

      // The same trail the Reports screen leaves: a capture's history should say it left the
      // workspace, whoever asked for it and however they asked.
      await db.insert(schema.photoEvents).values(
        ordered.slice(0, 50).map((photo) => ({
          id: id("evt"),
          photoId: photo.id,
          orgId: viewer.orgId,
          type: "exported",
          actor: viewer.userId,
          detail: `${format.toUpperCase()} · ${title}`,
        })),
      );

      const filename = exportFilename(title, format);
      return {
        report: {
          id: report!.id,
          title,
          format,
          layout,
          photoCount: ordered.length,
          bytes: bytes.byteLength,
          filename,
          // Presigned for a day, and served as an attachment under the report's own name. The
          // client shows it as a download and a copyable link; after it expires the report is
          // still on the Reports screen, which mints a fresh one.
          url: await presignGet(key, 60 * 60 * 24, filename),
          expiresInHours: 24,
        },
      };
    },
  });
}
