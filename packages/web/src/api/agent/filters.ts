import { z } from "zod";
import { and, eq, gte, inArray, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { visibleProjectIds } from "../middleware/auth";
import type { Viewer } from "./viewer";
import { dayBoundsIn } from "./zone";

/**
 * One place where "which captures is this person asking about" is decided.
 *
 * Three tools now read photo rows — `findPhotos`, `summarizeActivity` and `exportReport` — and
 * they must agree exactly. A summary that counted a wider set than the search that preceded it,
 * or an export that swept in a project the asker cannot open, would each be a different kind of
 * wrong, and the visibility rule in particular is the one thing here that must never be
 * re-derived per tool: the last time it was, a driver could see the whole workspace.
 *
 * So the filter surface (the words the model fills in) and the SQL it becomes both live here,
 * and each tool adds only what is genuinely its own — a result limit, a grouping, a format.
 */

/** A tag is a fixed vocabulary; anything else the model invents is ignored rather than matched. */
export const TAGS = [
  "general",
  "before",
  "after",
  "issue",
  "arrival",
  "departure",
  "pickup",
  "delivery",
] as const;

/**
 * The filter fields every photo-reading tool shares, described once so the model learns one
 * vocabulary and "find Tuesday's photos" and "export Tuesday's photos" resolve identically.
 */
export const filterFields = {
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
  to: z.string().optional().describe("Latest capture date, inclusive, as YYYY-MM-DD."),
};

export const filterInput = z.object(filterFields);
export type FilterArgs = z.infer<typeof filterInput>;

export type Scope =
  | {
      ok: true;
      /** Ready for `and(...filters)`: org, visibility, and whatever the person asked for. */
      filters: SQL[];
      /** The projects a named project resolved to, or null when none was named. */
      projectIds: string[] | null;
    }
  | {
      ok: false;
      /** Why nothing can match — a name that exists in no project or person here. */
      note: string;
    };

/**
 * Turn the model's filters into SQL, pinned to this viewer.
 *
 * A name the workspace does not have comes back as `ok: false` with a sentence rather than as
 * an empty filter set, because silently dropping an unmatched filter would answer a question
 * about one project with numbers from all of them.
 */
export async function photoScope(
  viewer: Viewer,
  zone: string,
  args: FilterArgs,
): Promise<Scope> {
  const filters: SQL[] = [eq(schema.photos.orgId, viewer.orgId)];

  if (args.query?.trim()) {
    const term = `%${args.query.trim().toLowerCase()}%`;
    filters.push(
      sql`(lower(coalesce(${schema.photos.address}, '')) like ${term} or lower(coalesce(${schema.photos.note}, '')) like ${term} or lower(${schema.photos.photoCode}) like ${term})`,
    );
  }
  if (args.tag) filters.push(eq(schema.photos.tag, args.tag));

  // Midnight to midnight in the caller's own zone, so an inclusive `to` covers the whole day
  // they named and an evening capture is not counted against the next one.
  const from = dayBoundsIn(args.from, false, zone);
  const to = dayBoundsIn(args.to, true, zone);
  if (from) filters.push(gte(schema.photos.capturedAt, from));
  if (to) filters.push(lte(schema.photos.capturedAt, to));

  // A named project narrows to that project's id — resolved inside this org, so a name that
  // happens to exist in another workspace resolves to nothing here.
  let projectIds: string[] | null = null;
  if (args.project?.trim()) {
    const term = `%${args.project.trim().toLowerCase()}%`;
    const found = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(
        and(eq(schema.projects.orgId, viewer.orgId), sql`lower(${schema.projects.name}) like ${term}`),
      );
    if (found.length === 0) return { ok: false, note: `No project here matches "${args.project}".` };
    projectIds = found.map((p) => p.id);
    filters.push(inArray(schema.photos.projectId, projectIds));
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
      return { ok: false, note: `Nobody in this workspace matches "${args.photographer}".` };
    }
    filters.push(
      inArray(
        schema.photos.userId,
        found.map((m) => m.userId),
      ),
    );
  }

  // The visibility rule, reused from the Teamspace feed rather than restated: a `field` member
  // gets their assigned projects plus their own unfiled captures, a `driver` only their own.
  const allowed = await visibleProjectIds(viewer.orgId, viewer.userId, viewer.role);
  if (allowed) {
    const own = and(isNull(schema.photos.projectId), eq(schema.photos.userId, viewer.userId))!;
    filters.push(allowed.length === 0 ? own : or(inArray(schema.photos.projectId, allowed), own)!);
  }

  return { ok: true, filters, projectIds };
}

/**
 * The town out of a stored address.
 *
 * Addresses here are reverse-geocoded and consistently shaped — "34 Clearview Street, Moncton,
 * New Brunswick, E1A 4H2" — so the second field is the town. A one-field address is used whole,
 * and a capture with no address at all is grouped under a label rather than dropped, because a
 * chart that quietly omitted them would not add up to the count beside it.
 */
export function cityOf(address: string | null): string {
  const parts = (address ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return "No address";
  return parts[1] ?? parts[0]!;
}
