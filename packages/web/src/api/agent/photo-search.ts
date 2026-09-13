import { z } from "zod";
import { tool } from "ai";
import { and, desc, eq, gte, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { visibleProjectIds } from "../middleware/auth";
import { photoUrl } from "../lib/media";
import { siteUrl } from "../services/email";
import type { Viewer } from "./viewer";

/**
 * Finding a workspace's own captures from the chat.
 *
 * This is the first and only tool the assistant has, and it reads real photo rows — so every
 * line below is about not handing back a photo the asker could not already open themselves:
 *
 * - It is only ever built for a signed-in `Viewer`. The public bubble on the marketing site
 *   posts to the same endpoint with no session, and there it is simply absent (see `agentFor`),
 *   rather than present and refusing — a tool the model cannot see is a tool it cannot be
 *   talked into misusing.
 * - Every query is pinned to the viewer's own `orgId`, and then narrowed again by
 *   `visibleProjectIds` exactly as the Teamspace feed is: a `field` member gets their assigned
 *   projects plus their own unfiled captures, a `driver` gets only their own. That is the same
 *   rule `photos.list` applies, deliberately reused rather than re-derived, because the one
 *   time it was re-derived a driver could see the whole workspace.
 * - The reply carries a public `/v/<code>` link per photo. That page is already the shareable
 *   face of a capture, so nothing here widens what a link can reach.
 */

const MAX_RESULTS = 6;

/** A tag is a fixed vocabulary; anything else the model invents is ignored rather than matched. */
const TAGS = [
  "general",
  "before",
  "after",
  "issue",
  "arrival",
  "departure",
  "pickup",
  "delivery",
] as const;

const input = z.object({
  query: z
    .string()
    .max(120)
    .optional()
    .describe(
      "Free text matched against the address, the note and the photo code. Use the place or " +
        "street the person named, e.g. 'Moncton' or 'Elmwood Dr'. Leave out to browse by the " +
        "other filters alone.",
    ),
  project: z
    .string()
    .max(120)
    .optional()
    .describe("Project name, or part of one, when the person names a job rather than a place."),
  tag: z
    .enum(TAGS)
    .optional()
    .describe("Capture type, when they ask for one: before/after shots, issues, deliveries."),
  photographer: z
    .string()
    .max(120)
    .optional()
    .describe("Crew member's name or email, when they ask who took something."),
  from: z
    .string()
    .optional()
    .describe("Earliest capture date, inclusive, as YYYY-MM-DD. Resolve 'last week' yourself."),
  to: z
    .string()
    .optional()
    .describe("Latest capture date, inclusive, as YYYY-MM-DD."),
  limit: z.number().int().min(1).max(MAX_RESULTS).optional().describe("How many to return."),
});

/** Midnight-to-midnight, so an inclusive `to` covers the whole day the person named. */
function dayBounds(value: string | undefined, end: boolean): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T${end ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function photoSearchTool(viewer: Viewer) {
  return tool({
    description:
      "Search this workspace's own GeoCliks captures and return a few of them with thumbnails " +
      "and shareable links. Use it whenever the person asks about their photos — by place, " +
      "job, capture type, date or who took them. Results are already limited to what this " +
      "person is allowed to see.",
    inputSchema: input,
    execute: async (args) => {
      const allowed = await visibleProjectIds(viewer.orgId, viewer.userId, viewer.role);
      const filters = [eq(schema.photos.orgId, viewer.orgId)];

      if (args.query?.trim()) {
        const term = `%${args.query.trim().toLowerCase()}%`;
        filters.push(
          sql`(lower(coalesce(${schema.photos.address}, '')) like ${term} or lower(coalesce(${schema.photos.note}, '')) like ${term} or lower(${schema.photos.photoCode}) like ${term})`,
        );
      }
      if (args.tag) filters.push(eq(schema.photos.tag, args.tag));

      const from = dayBounds(args.from, false);
      const to = dayBounds(args.to, true);
      if (from) filters.push(gte(schema.photos.capturedAt, from));
      if (to) filters.push(lte(schema.photos.capturedAt, to));

      // A named project narrows to that project's id — resolved inside this org, so a name
      // that happens to exist in another workspace resolves to nothing here.
      if (args.project?.trim()) {
        const term = `%${args.project.trim().toLowerCase()}%`;
        const found = await db
          .select({ id: schema.projects.id })
          .from(schema.projects)
          .where(
            and(
              eq(schema.projects.orgId, viewer.orgId),
              sql`lower(${schema.projects.name}) like ${term}`,
            ),
          );
        if (found.length === 0) {
          return { photos: [], note: `No project here matches "${args.project}".` };
        }
        filters.push(
          inArray(
            schema.photos.projectId,
            found.map((p) => p.id),
          ),
        );
      }

      // Same for a person: matched against the members of this workspace only.
      if (args.photographer?.trim()) {
        const term = `%${args.photographer.trim().toLowerCase()}%`;
        const found = await db
          .select({ userId: schema.members.userId })
          .from(schema.members)
          .leftJoin(schema.user, eq(schema.user.id, schema.members.userId))
          .where(
            and(
              eq(schema.members.orgId, viewer.orgId),
              sql`(lower(coalesce(${schema.user.name}, '')) like ${term} or lower(coalesce(${schema.user.email}, '')) like ${term})`,
            ),
          );
        if (found.length === 0) {
          return { photos: [], note: `Nobody in this workspace matches "${args.photographer}".` };
        }
        filters.push(
          inArray(
            schema.photos.userId,
            found.map((m) => m.userId),
          ),
        );
      }

      // The visibility rule, reused from the Teamspace feed rather than restated.
      if (allowed) {
        const own = and(isNull(schema.photos.projectId), eq(schema.photos.userId, viewer.userId))!;
        filters.push(
          allowed.length === 0 ? own : or(inArray(schema.photos.projectId, allowed), own)!,
        );
      }

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
        .where(and(...filters))
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
