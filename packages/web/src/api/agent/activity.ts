import { z } from "zod";
import { tool } from "ai";
import { and, inArray } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { cityOf, filterFields, photoScope } from "./filters";
import type { Viewer } from "./viewer";
import { dayIn } from "./zone";

/**
 * Counting a workspace's captures, for the questions that are about the shape of the work
 * rather than about one photo: where has the crew been, how much did we shoot this week, who
 * took what, which day was busiest.
 *
 * `findPhotos` could not answer those honestly. It returns at most six rows, so anything the
 * model said about "how many" from its output was a count of the sample, not of the work — and
 * the prompt has to forbid claiming totals from it for exactly that reason. This tool counts
 * over the whole matching set instead and returns only the aggregate, which is both the honest
 * answer and a far smaller one to put in front of the model.
 *
 * It reads through `photoScope`, so it counts exactly what `findPhotos` would have searched and
 * what `exportReport` would have exported: same org, same role scoping, same days in the same
 * zone. A driver's "how many did we shoot" therefore answers for the driver's own captures,
 * which is the only number they are allowed to be told.
 *
 * The output is shaped for the cards and the bar chart the clients draw under the reply
 * (`metric` keys rather than English labels, because the panel is translated into eleven
 * languages and the server has no business picking the wording).
 */

/** Hard ceiling on rows pulled back to count. Far above any real workspace's week. */
const MAX_ROWS = 4000;

/** How many bars a chart in a 380px panel can carry before it stops being readable. */
const MAX_BARS = 8;

const input = z.object({
  ...filterFields,
  groupBy: z
    .enum(["city", "day", "tag", "person", "project"])
    .optional()
    .describe(
      "What the bar chart breaks the captures down by. 'city' (the default) answers 'where " +
        "were these taken', 'day' answers 'when were we busy', 'person' answers 'who shot " +
        "what'. Pick the one the question is actually about.",
    ),
});

type Bucket = { label: string; value: number };

/** Largest first, ties alphabetical, and everything past the cut folded into one bar. */
function topBuckets(counts: Map<string, number>): { bars: Bucket[]; hidden: number } {
  const sorted = [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  if (sorted.length <= MAX_BARS) return { bars: sorted, hidden: 0 };
  const head = sorted.slice(0, MAX_BARS - 1);
  const rest = sorted.slice(MAX_BARS - 1);
  head.push({ label: "Everywhere else", value: rest.reduce((n, b) => n + b.value, 0) });
  return { bars: head, hidden: rest.length };
}

export function activityStatsTool(viewer: Viewer, zone: string) {
  return tool({
    description:
      "Count this workspace's captures and break them down for a chart. Use it for questions " +
      "about the work as a whole rather than about particular photos — how many, where, when, " +
      "who, how busy, 'summarise this week', 'where have we been'. The app draws the result " +
      "as stat cards and a bar chart under your reply. Counts are already limited to what this " +
      "person is allowed to see.",
    inputSchema: input,
    execute: async (args) => {
      const scope = await photoScope(viewer, zone, args);
      if (!scope.ok) return { total: 0, note: scope.note };

      const rows = await db
        .select({
          address: schema.photos.address,
          tag: schema.photos.tag,
          capturedAt: schema.photos.capturedAt,
          projectId: schema.photos.projectId,
          userId: schema.photos.userId,
          lat: schema.photos.lat,
          kind: schema.photos.kind,
        })
        .from(schema.photos)
        .where(and(...scope.filters))
        .limit(MAX_ROWS);

      if (rows.length === 0) {
        return {
          total: 0,
          note: "Nothing matched, so there is nothing to count. Try a wider date range.",
        };
      }

      // Names for the ids, so a chart of people or projects reads as people and projects.
      const userIds = [...new Set(rows.map((r) => r.userId))];
      const people = await db
        .select({ id: schema.user.id, name: schema.user.name })
        .from(schema.user)
        .where(inArray(schema.user.id, userIds));
      const personNames = new Map(people.map((p) => [p.id, p.name ?? "Someone"]));

      const projectIds = [...new Set(rows.map((r) => r.projectId).filter((v): v is string => !!v))];
      const projects = projectIds.length
        ? await db
            .select({ id: schema.projects.id, name: schema.projects.name })
            .from(schema.projects)
            .where(inArray(schema.projects.id, projectIds))
        : [];
      const projectNames = new Map(projects.map((p) => [p.id, p.name]));

      const cities = new Map<string, number>();
      const days = new Map<string, number>();
      const tags = new Map<string, number>();
      const persons = new Map<string, number>();
      const jobs = new Map<string, number>();
      let located = 0;
      let videos = 0;
      const bump = (map: Map<string, number>, key: string) =>
        map.set(key, (map.get(key) ?? 0) + 1);

      for (const row of rows) {
        bump(cities, cityOf(row.address));
        // The local day, not the UTC one: an 11pm capture belongs to the shift that took it.
        bump(days, dayIn(row.capturedAt, zone));
        bump(tags, row.tag);
        bump(persons, personNames.get(row.userId) ?? "Someone");
        bump(jobs, row.projectId ? (projectNames.get(row.projectId) ?? "Unknown job") : "Unfiled");
        if (row.lat != null) located++;
        if (row.kind === "video") videos++;
      }

      const dayList = [...days.keys()].sort();
      const groupBy = args.groupBy ?? "city";
      const source =
        groupBy === "day"
          ? // Days read as a timeline, so this one keeps its own order: oldest to newest, and
            // the most recent stretch when there are more days than bars.
            new Map(dayList.slice(-MAX_BARS).map((day) => [day, days.get(day)!]))
          : groupBy === "tag"
            ? tags
            : groupBy === "person"
              ? persons
              : groupBy === "project"
                ? jobs
                : cities;
      const { bars, hidden } =
        groupBy === "day"
          ? { bars: [...source.entries()].map(([label, value]) => ({ label, value })), hidden: 0 }
          : topBuckets(source);

      return {
        total: rows.length,
        /** Cards, in the order they are drawn. `metric` is a key the client translates. */
        cards: [
          { metric: "captures", value: rows.length },
          { metric: "places", value: cities.size },
          { metric: "crew", value: persons.size },
          { metric: "days", value: days.size },
        ],
        chart: { dimension: groupBy, bars, hidden },
        /** The span actually covered, as local days — not the filter the model asked for. */
        range: { from: dayList[0] ?? null, to: dayList[dayList.length - 1] ?? null },
        videos,
        withoutGps: rows.length - located,
        truncated: rows.length === MAX_ROWS,
        /** Named so the reply can talk about the leaders without re-listing every bar. */
        topPlaces: topBuckets(cities).bars.slice(0, 3),
        busiestDay: [...days.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
      };
    },
  });
}
