import { z } from "zod";
import { tool } from "ai";
import { and, desc, inArray } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { photoUrl } from "../lib/media";
import { siteUrl } from "../services/email";
import { filterFields, photoScope } from "./filters";
import type { Viewer } from "./viewer";

/**
 * Finding a workspace's own captures from the chat.
 *
 * It reads real photo rows, so everything here is about not handing back a photo the asker
 * could not already open themselves:
 *
 * - It is only ever built for a signed-in `Viewer`. The public bubble on the marketing site
 *   posts to the same endpoint with no session, and there it is simply absent (see `agentFor`),
 *   rather than present and refusing — a tool the model cannot see is a tool it cannot be
 *   talked into misusing.
 * - Every query is pinned to the viewer's own org and narrowed by their role. That happens in
 *   `photoScope`, shared with the summary and export tools, rather than being restated here.
 * - The reply carries a public `/v/<code>` link per photo. That page is already the shareable
 *   face of a capture, so nothing here widens what a link can reach.
 */

const MAX_RESULTS = 6;

const input = z.object({
  ...filterFields,
  limit: z.number().int().min(1).max(MAX_RESULTS).optional().describe("How many to return."),
});

export function photoSearchTool(viewer: Viewer, zone: string) {
  return tool({
    description:
      "Search this workspace's own GeoCliks captures and return a few of them with thumbnails " +
      "and shareable links. Use it whenever the person asks about their photos — by place, " +
      "job, capture type, date or who took them. Results are already limited to what this " +
      "person is allowed to see.",
    inputSchema: input,
    execute: async (args) => {
      const scope = await photoScope(viewer, zone, args);
      if (!scope.ok) return { photos: [], note: scope.note };

      const rows = await db
        .select({
          id: schema.photos.id,
          photoCode: schema.photos.photoCode,
          storageKey: schema.photos.storageKey,
          posterKey: schema.photos.posterKey,
          kind: schema.photos.kind,
          address: schema.photos.address,
          note: schema.photos.note,
          tag: schema.photos.tag,
          capturedAt: schema.photos.capturedAt,
          projectId: schema.photos.projectId,
          userId: schema.photos.userId,
        })
        .from(schema.photos)
        .where(and(...scope.filters))
        .orderBy(desc(schema.photos.capturedAt))
        .limit(Math.min(args.limit ?? 4, MAX_RESULTS));

      if (rows.length === 0) {
        return {
          photos: [],
          note: "Nothing matched. Worth trying a shorter place name, or a wider date range.",
        };
      }

      const projectIds = [...new Set(rows.map((r) => r.projectId).filter((v): v is string => !!v))];
      const projects = projectIds.length
        ? await db
            .select({ id: schema.projects.id, name: schema.projects.name })
            .from(schema.projects)
            .where(inArray(schema.projects.id, projectIds))
        : [];
      const projectNames = new Map(projects.map((p) => [p.id, p.name]));

      const userIds = [...new Set(rows.map((r) => r.userId))];
      const people = await db
        .select({ id: schema.user.id, name: schema.user.name })
        .from(schema.user)
        .where(inArray(schema.user.id, userIds));
      const personNames = new Map(people.map((p) => [p.id, p.name]));

      const photos = await Promise.all(
        rows.map(async (row) => ({
          // The app opens this in its own photo drawer, which re-checks org and scope on the
          // way in — the id is not a capability, just a handle.
          id: row.id,
          code: row.photoCode,
          kind: row.kind,
          address: row.address,
          note: row.note,
          tag: row.tag,
          capturedAt: row.capturedAt.toISOString(),
          project: row.projectId ? (projectNames.get(row.projectId) ?? null) : null,
          takenBy: personNames.get(row.userId) ?? null,
          link: `${siteUrl()}/v/${row.photoCode}`,
          // A video's poster frame is the thumbnail; a photo is its own.
          thumbnail: await photoUrl(row.posterKey ?? row.storageKey),
        })),
      );

      return { photos };
    },
  });
}
