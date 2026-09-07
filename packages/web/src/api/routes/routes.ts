import { ORPCError } from "@orpc/server";
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../database";
import * as schema from "../database/schema";
import { geocodeAll, geocodingAvailable } from "../lib/geocode";
import { id, shareToken } from "../lib/ids";
import { insertionIndex, optimizeStops } from "../lib/optimize";
import { notifyRouteStarted, notifyStopDelivered, notifyUpcoming } from "../lib/route-notify";
import { orgProc, requireRole } from "../middleware/auth";

/**
 * Delivery routes — the office builds an ordered list of stops, a driver runs it,
 * and every stop is closed out with a normal GeoCliks evidence photo.
 *
 * Note the naming: `routes` below is the oRPC router (the lint rule wants the
 * export to match the filename). The database table is always `schema.routes`.
 */

const modeEnum = z.enum(["planned", "dispatch"]);
const statusEnum = z.enum(["draft", "assigned", "active", "completed", "cancelled"]);
const failedReasonEnum = z.enum([
  "nobody_home",
  "refused",
  "wrong_address",
  "closed",
  "inaccessible",
  "other",
]);

/** A stop the driver can actually be sent to. */
function hasPin(stop: { lat: number | null; lng: number | null; geocodeStatus: string }): boolean {
  return (
    typeof stop.lat === "number" &&
    typeof stop.lng === "number" &&
    (stop.geocodeStatus === "ok" || stop.geocodeStatus === "manual")
  );
}

async function loadRoute(orgId: string, routeId: string) {
  const [route] = await db
    .select()
    .from(schema.routes)
    .where(and(eq(schema.routes.id, routeId), eq(schema.routes.orgId, orgId)))
    .limit(1);
  if (!route) throw new ORPCError("NOT_FOUND", { message: "Route not found" });
  return route;
}

async function loadStops(routeId: string) {
  return db
    .select()
    .from(schema.routeStops)
    .where(eq(schema.routeStops.routeId, routeId))
    .orderBy(asc(schema.routeStops.seq));
}

async function logEvent(input: {
  routeId: string;
  orgId: string;
  event: string;
  detail?: string | null;
  stopId?: string | null;
  actorId?: string | null;
}) {
  await db.insert(schema.routeEvents).values({
    id: id("rev"),
    routeId: input.routeId,
    orgId: input.orgId,
    stopId: input.stopId ?? null,
    event: input.event,
    detail: input.detail ?? null,
    actorId: input.actorId ?? null,
  });
}

async function loadStop(orgId: string, stopId: string) {
  const [stop] = await db
    .select()
    .from(schema.routeStops)
    .where(and(eq(schema.routeStops.id, stopId), eq(schema.routeStops.orgId, orgId)))
    .limit(1);
  if (!stop) throw new ORPCError("NOT_FOUND", { message: "Stop not found" });
  return stop;
}

/**
 * When the drop actually happened. The client may report a capture time from an
 * offline queue, but it is only trusted inside a sane window — never in the future,
 * never older than a week — otherwise a wrong device clock rewrites the timeline.
 */
function completionTime(clientMs: number | undefined, capturedAt: Date): Date {
  const now = Date.now();
  const candidates = [clientMs, capturedAt.getTime()];
  for (const value of candidates) {
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    if (value > now + 5 * 60_000) continue;
    if (value < now - 7 * 24 * 60 * 60_000) continue;
    return new Date(value);
  }
  return new Date(now);
}

/** Progress plus the stop the driver should be looking at next. */
async function runState(routeId: string, orgId: string) {
  const stops = await loadStops(routeId);
  const done = stops.filter((s) => s.status !== "pending");
  const next = stops.find((s) => s.status === "pending") ?? null;
  const finished = stops.length > 0 && done.length === stops.length;

  if (finished) {
    const [route] = await db
      .select()
      .from(schema.routes)
      .where(eq(schema.routes.id, routeId))
      .limit(1);
    if (route && route.status !== "completed" && route.status !== "cancelled") {
      await db
        .update(schema.routes)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(schema.routes.id, routeId));
      await logEvent({ routeId, orgId, event: "completed" });
    }
  }

  return {
    total: stops.length,
    done: done.length,
    delivered: stops.filter((s) => s.status === "delivered").length,
    failed: stops.filter((s) => s.status === "failed").length,
    skipped: stops.filter((s) => s.status === "skipped").length,
    nextStopId: next?.id ?? null,
    routeCompleted: finished,
  };
}

/** A field member may only ever touch the route they were assigned. */
function assertRouteAccess(
  route: { driverId: string | null },
  context: { role: string; user: { id: string } },
) {
  if (context.role !== "field") return;
  if (route.driverId !== context.user.id) {
    throw new ORPCError("FORBIDDEN", { message: "Not your route" });
  }
}

export const routes = {
  /** Routes the caller may see. Managers see the workspace, a driver sees only their own. */
  list: orgProc
    .input(z.object({ date: z.string().optional(), status: statusEnum.optional() }).optional())
    .handler(async ({ input, context }) => {
      const filters = [eq(schema.routes.orgId, context.org.id)];
      if (input?.date) filters.push(eq(schema.routes.date, input.date));
      if (input?.status) filters.push(eq(schema.routes.status, input.status));
      if (context.role === "field") filters.push(eq(schema.routes.driverId, context.user.id));

      const rows = await db
        .select()
        .from(schema.routes)
        .where(and(...filters))
        .orderBy(desc(schema.routes.date), desc(schema.routes.createdAt));

      if (rows.length === 0) return [];

      const routeIds = rows.map((r) => r.id);
      const totals = await db
        .select({ routeId: schema.routeStops.routeId, stops: count() })
        .from(schema.routeStops)
        .where(inArray(schema.routeStops.routeId, routeIds))
        .groupBy(schema.routeStops.routeId);
      const doneRows = await db
        .select({ routeId: schema.routeStops.routeId, done: count() })
        .from(schema.routeStops)
        .where(
          and(
            inArray(schema.routeStops.routeId, routeIds),
            inArray(schema.routeStops.status, ["delivered", "failed", "skipped"]),
          ),
        )
        .groupBy(schema.routeStops.routeId);

      const stopsBy = new Map(totals.map((t) => [t.routeId, t.stops]));
      const doneBy = new Map(doneRows.map((t) => [t.routeId, t.done]));

      const driverIds = [...new Set(rows.map((r) => r.driverId).filter((d): d is string => !!d))];
      const drivers =
        driverIds.length === 0
          ? []
          : await db
              .select({ id: schema.user.id, name: schema.user.name })
              .from(schema.user)
              .where(inArray(schema.user.id, driverIds));
      const driverBy = new Map(drivers.map((d) => [d.id, d.name]));

      return rows.map((route) => ({
        ...route,
        stopCount: stopsBy.get(route.id) ?? 0,
        doneCount: doneBy.get(route.id) ?? 0,
        driverName: route.driverId ? (driverBy.get(route.driverId) ?? null) : null,
      }));
    }),

  /** One route with its stops in running order. */
  get: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    const route = await loadRoute(context.org.id, input.id);
    assertRouteAccess(route, context);

    const stops = await loadStops(route.id);
    let driverName: string | null = null;
    if (route.driverId) {
      const [driver] = await db
        .select({ name: schema.user.name })
        .from(schema.user)
        .where(eq(schema.user.id, route.driverId))
        .limit(1);
      driverName = driver?.name ?? null;
    }

    return {
      route: { ...route, driverName },
      stops,
      geocodingAvailable: geocodingAvailable(),
    };
  }),

  create: orgProc
    .input(
      z.object({
        name: z.string().trim().min(1).max(120),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        mode: modeEnum.default("planned"),
        projectId: z.string().nullish(),
        startAddress: z.string().trim().max(300).nullish(),
        returnToStart: z.boolean().default(false),
        startMinutes: z.number().int().min(0).max(1439).default(480),
        serviceMinutes: z.number().int().min(0).max(240).default(5),
        requireSignature: z.boolean().default(false),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");

      const routeId = id("rte");
      await db.insert(schema.routes).values({
        id: routeId,
        orgId: context.org.id,
        projectId: input.projectId ?? null,
        name: input.name,
        date: input.date,
        mode: input.mode,
        startAddress: input.startAddress ?? null,
        returnToStart: input.returnToStart,
        startMinutes: input.startMinutes,
        serviceMinutes: input.serviceMinutes,
        requireSignature: input.requireSignature,
        createdBy: context.user.id,
      });

      await logEvent({
        routeId,
        orgId: context.org.id,
        event: "created",
        detail: input.name,
        actorId: context.user.id,
      });

      return { id: routeId };
    }),

  update: orgProc
    .input(
      z.object({
        id: z.string(),
        name: z.string().trim().min(1).max(120).optional(),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        projectId: z.string().nullish(),
        startAddress: z.string().trim().max(300).nullish(),
        startLat: z.number().nullish(),
        startLng: z.number().nullish(),
        returnToStart: z.boolean().optional(),
        startMinutes: z.number().int().min(0).max(1439).optional(),
        serviceMinutes: z.number().int().min(0).max(240).optional(),
        requireSignature: z.boolean().optional(),
        notifyOnStart: z.boolean().optional(),
        notifyWhenNext: z.boolean().optional(),
        notifyOnDelivery: z.boolean().optional(),
        notifyLeadStops: z.number().int().min(1).max(10).optional(),
        status: statusEnum.optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const route = await loadRoute(context.org.id, input.id);

      const { id: _ignored, ...rest } = input;
      const patch = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
      if (Object.keys(patch).length === 0) return { ok: true };

      await db.update(schema.routes).set(patch).where(eq(schema.routes.id, route.id));
      return { ok: true };
    }),

  /** Add one stop or a whole pasted batch. Geocoding is a separate, explicit step. */
  addStops: orgProc
    .input(
      z.object({
        routeId: z.string(),
        stops: z
          .array(
            z.object({
              addressRaw: z.string().trim().min(1).max(300),
              recipientName: z.string().trim().max(120).nullish(),
              recipientEmail: z.string().trim().max(200).nullish(),
              recipientPhone: z.string().trim().max(50).nullish(),
              reference: z.string().trim().max(80).nullish(),
              notes: z.string().trim().max(500).nullish(),
              windowStart: z.number().int().min(0).max(1439).nullish(),
              windowEnd: z.number().int().min(0).max(1439).nullish(),
              serviceMinutes: z.number().int().min(0).max(240).nullish(),
            }),
          )
          .min(1)
          .max(300),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const route = await loadRoute(context.org.id, input.routeId);

      const existing = await loadStops(route.id);
      let seq = existing.length;

      const rows = input.stops.map((stop) => ({
        id: id("rst"),
        routeId: route.id,
        orgId: context.org.id,
        seq: seq++,
        addressRaw: stop.addressRaw,
        recipientName: stop.recipientName ?? null,
        recipientEmail: stop.recipientEmail ?? null,
        recipientPhone: stop.recipientPhone ?? null,
        reference: stop.reference ?? null,
        notes: stop.notes ?? null,
        windowStart: stop.windowStart ?? null,
        windowEnd: stop.windowEnd ?? null,
        serviceMinutes: stop.serviceMinutes ?? null,
        trackToken: shareToken(),
      }));

      await db.insert(schema.routeStops).values(rows);
      await logEvent({
        routeId: route.id,
        orgId: context.org.id,
        event: "stops_added",
        detail: `${rows.length}`,
        actorId: context.user.id,
      });

      return { added: rows.length };
    }),

  /**
   * Dispatch mode: a single order arrives mid-shift and is slotted into the stops the
   * driver has not reached yet.
   *
   * Deliberately NOT a re-optimize. Everything already delivered, and the stop the driver
   * is currently driving to, never move - a tool that reshuffles the plan under a moving
   * driver gets abandoned. Cheapest insertion is also free, where Google's optimizer bills
   * per stop, so a busy restaurant night does not turn into a bill.
   */
  addLiveStop: orgProc
    .input(
      z.object({
        routeId: z.string(),
        addressRaw: z.string().trim().min(1).max(300),
        recipientName: z.string().trim().max(120).nullish(),
        recipientEmail: z.string().trim().max(200).nullish(),
        recipientPhone: z.string().trim().max(50).nullish(),
        reference: z.string().trim().max(80).nullish(),
        notes: z.string().trim().max(500).nullish(),
        serviceMinutes: z.number().int().min(0).max(240).nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const route = await loadRoute(context.org.id, input.routeId);
      if (route.status === "completed" || route.status === "cancelled") {
        throw new ORPCError("BAD_REQUEST", { message: "This route is finished" });
      }

      const stops = await loadStops(route.id);

      // Geocode the one new address up front. An address we cannot place cannot be
      // slotted by distance, and the dispatcher needs to know that now, not later.
      const [hit] = await geocodeAll([input.addressRaw], "ca");
      const lat = typeof hit?.lat === "number" ? hit.lat : null;
      const lng = typeof hit?.lng === "number" ? hit.lng : null;
      const located = hit?.ok === true && lat !== null && lng !== null;

      const stopId = id("rst");
      await db.insert(schema.routeStops).values({
        id: stopId,
        routeId: route.id,
        orgId: context.org.id,
        seq: stops.length,
        addressRaw: input.addressRaw,
        address: hit?.address ?? null,
        lat,
        lng,
        placeId: hit?.placeId ?? null,
        geocodeStatus: located ? "ok" : hit ? "failed" : "pending",
        recipientName: input.recipientName ?? null,
        recipientEmail: input.recipientEmail ?? null,
        recipientPhone: input.recipientPhone ?? null,
        reference: input.reference ?? null,
        notes: input.notes ?? null,
        serviceMinutes: input.serviceMinutes ?? null,
        trackToken: shareToken(),
      });

      // Only stops with a pin can be measured. Built by hand rather than filtered so
      // the coordinates narrow to numbers without a cast.
      const ordered: { id: string; lat: number; lng: number }[] = [];
      const statusById = new Map(stops.map((s) => [s.id, s.status]));
      for (const stop of stops) {
        if (!hasPin(stop) || typeof stop.lat !== "number" || typeof stop.lng !== "number") continue;
        ordered.push({ id: stop.id, lat: stop.lat, lng: stop.lng });
      }

      let locked = 0;
      while (locked < ordered.length && statusById.get(ordered[locked]?.id ?? "") !== "pending") {
        locked++;
      }
      // On a running route the first still-pending stop is the one he is driving to.
      if (route.status === "active" && locked < ordered.length) locked++;

      const ids = stops.map((s) => s.id);
      let at = ids.length;
      if (located && lat !== null && lng !== null && ordered.length > 0) {
        const start =
          typeof route.startLat === "number" && typeof route.startLng === "number"
            ? { lat: route.startLat, lng: route.startLng }
            : null;
        const idx = insertionIndex(
          ordered,
          { lat, lng },
          { start, lockedCount: locked, returnToStart: route.returnToStart },
        );
        const beforeId = idx === 0 ? null : (ordered[idx - 1]?.id ?? null);
        at = beforeId ? ids.indexOf(beforeId) + 1 : 0;
      }

      // Belt and braces: never land ahead of finished work, or ahead of the stop in hand.
      let floor = 0;
      for (let i = 0; i < stops.length; i++) {
        if (stops[i]?.status !== "pending") floor = i + 1;
      }
      if (route.status === "active") floor = Math.min(floor + 1, ids.length);
      at = Math.min(Math.max(at, floor), ids.length);

      const finalOrder = [...ids.slice(0, at), stopId, ...ids.slice(at)];
      for (let i = 0; i < finalOrder.length; i++) {
        const sid = finalOrder[i];
        if (!sid) continue;
        await db.update(schema.routeStops).set({ seq: i }).where(eq(schema.routeStops.id, sid));
      }

      await logEvent({
        routeId: route.id,
        orgId: context.org.id,
        event: "stop_added_live",
        detail: hit?.address ?? input.addressRaw,
        stopId,
        actorId: context.user.id,
      });

      return {
        stopId,
        position: at + 1,
        total: finalOrder.length,
        located,
        geocodingAvailable: geocodingAvailable(),
      };
    }),

  /**
   * Resolve addresses to coordinates. Only touches stops that still need it, so
   * pressing the button twice costs nothing extra.
   */
  geocodeStops: orgProc
    .input(z.object({ routeId: z.string(), force: z.boolean().default(false) }))
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const route = await loadRoute(context.org.id, input.routeId);

      const stops = await loadStops(route.id);
      const pending = stops.filter((s) =>
        input.force ? s.geocodeStatus !== "manual" : s.geocodeStatus === "pending",
      );
      if (pending.length === 0) return { resolved: 0, failed: 0, available: geocodingAvailable() };

      const results = await geocodeAll(
        pending.map((s) => s.addressRaw),
        "ca",
        { force: input.force },
      );

      let resolved = 0;
      let failed = 0;
      for (let i = 0; i < pending.length; i++) {
        const stop = pending[i];
        const hit = results[i];
        if (!stop || !hit) continue;
        if (hit.ok) resolved++;
        else failed++;
        await db
          .update(schema.routeStops)
          .set({
            address: hit.address,
            lat: hit.lat,
            lng: hit.lng,
            placeId: hit.placeId,
            geocodeStatus: hit.ok ? "ok" : "failed",
          })
          .where(eq(schema.routeStops.id, stop.id));
      }

      return { resolved, failed, available: geocodingAvailable() };
    }),

  /** Manual pin drop for an address the geocoder could not resolve. */
  setStopPin: orgProc
    .input(
      z.object({
        stopId: z.string(),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        address: z.string().trim().max(300).nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const [stop] = await db
        .select()
        .from(schema.routeStops)
        .where(
          and(eq(schema.routeStops.id, input.stopId), eq(schema.routeStops.orgId, context.org.id)),
        )
        .limit(1);
      if (!stop) throw new ORPCError("NOT_FOUND", { message: "Stop not found" });

      await db
        .update(schema.routeStops)
        .set({
          lat: input.lat,
          lng: input.lng,
          address: input.address ?? stop.address ?? stop.addressRaw,
          geocodeStatus: "manual",
        })
        .where(eq(schema.routeStops.id, stop.id));

      return { ok: true };
    }),

  updateStop: orgProc
    .input(
      z.object({
        stopId: z.string(),
        addressRaw: z.string().trim().min(1).max(300).optional(),
        recipientName: z.string().trim().max(120).nullish(),
        recipientEmail: z.string().trim().max(200).nullish(),
        recipientPhone: z.string().trim().max(50).nullish(),
        reference: z.string().trim().max(80).nullish(),
        notes: z.string().trim().max(500).nullish(),
        windowStart: z.number().int().min(0).max(1439).nullish(),
        windowEnd: z.number().int().min(0).max(1439).nullish(),
        serviceMinutes: z.number().int().min(0).max(240).nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const [stop] = await db
        .select()
        .from(schema.routeStops)
        .where(
          and(eq(schema.routeStops.id, input.stopId), eq(schema.routeStops.orgId, context.org.id)),
        )
        .limit(1);
      if (!stop) throw new ORPCError("NOT_FOUND", { message: "Stop not found" });

      const { stopId: _ignored, ...rest } = input;
      const patch: Record<string, unknown> = Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined),
      );
      // Changing the address invalidates the pin.
      if (typeof patch.addressRaw === "string" && patch.addressRaw !== stop.addressRaw) {
        patch.geocodeStatus = "pending";
        patch.lat = null;
        patch.lng = null;
        patch.address = null;
        patch.placeId = null;
      }
      if (Object.keys(patch).length === 0) return { ok: true };

      await db.update(schema.routeStops).set(patch).where(eq(schema.routeStops.id, stop.id));
      return { ok: true };
    }),

  removeStop: orgProc
    .input(z.object({ stopId: z.string() }))
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const [stop] = await db
        .select()
        .from(schema.routeStops)
        .where(
          and(eq(schema.routeStops.id, input.stopId), eq(schema.routeStops.orgId, context.org.id)),
        )
        .limit(1);
      if (!stop) throw new ORPCError("NOT_FOUND", { message: "Stop not found" });
      if (stop.status !== "pending") {
        throw new ORPCError("BAD_REQUEST", { message: "A completed stop cannot be removed" });
      }

      await db.delete(schema.routeStops).where(eq(schema.routeStops.id, stop.id));

      // Close the gap so `seq` stays dense.
      const rest = await loadStops(stop.routeId);
      for (let i = 0; i < rest.length; i++) {
        const row = rest[i];
        if (row && row.seq !== i) {
          await db
            .update(schema.routeStops)
            .set({ seq: i })
            .where(eq(schema.routeStops.id, row.id));
        }
      }

      return { ok: true };
    }),

  /** Manual drag-and-drop ordering. Marks the route as human-ordered. */
  reorder: orgProc
    .input(z.object({ routeId: z.string(), order: z.array(z.string()).min(1) }))
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const route = await loadRoute(context.org.id, input.routeId);

      const stops = await loadStops(route.id);
      const known = new Set(stops.map((s) => s.id));
      if (input.order.length !== stops.length || input.order.some((s) => !known.has(s))) {
        throw new ORPCError("BAD_REQUEST", { message: "Order must list every stop exactly once" });
      }

      for (let i = 0; i < input.order.length; i++) {
        const stopId = input.order[i];
        if (!stopId) continue;
        await db
          .update(schema.routeStops)
          .set({ seq: i })
          .where(eq(schema.routeStops.id, stopId));
      }

      await db
        .update(schema.routes)
        .set({ optimizer: "manual" })
        .where(eq(schema.routes.id, route.id));
      await logEvent({
        routeId: route.id,
        orgId: context.org.id,
        event: "reordered",
        actorId: context.user.id,
      });

      return { ok: true };
    }),

  /**
   * Order the stops. Defaults to the free local solver; `backend: "google"` is a
   * deliberate, metered dispatcher action because Google bills per stop.
   */
  optimize: orgProc
    .input(
      z.object({ routeId: z.string(), backend: z.enum(["local", "google"]).default("local") }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const route = await loadRoute(context.org.id, input.routeId);

      const stops = await loadStops(route.id);
      const routable = stops.filter(hasPin);
      const unroutable = stops.filter((s) => !hasPin(s));
      if (routable.length === 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "No stop has coordinates yet — resolve the addresses first",
        });
      }

      const start =
        typeof route.startLat === "number" && typeof route.startLng === "number"
          ? { lat: route.startLat, lng: route.startLng }
          : null;

      const result = await optimizeStops({
        stops: routable.map((s) => ({
          id: s.id,
          lat: s.lat as number,
          lng: s.lng as number,
          serviceMinutes: s.serviceMinutes ?? route.serviceMinutes,
        })),
        start,
        returnToStart: route.returnToStart,
        backend: input.backend,
      });

      // Stops with no pin keep their place at the end rather than vanishing.
      const finalOrder = [...result.order, ...unroutable.map((s) => s.id)];
      for (let i = 0; i < finalOrder.length; i++) {
        const stopId = finalOrder[i];
        if (!stopId) continue;
        await db
          .update(schema.routeStops)
          .set({ seq: i })
          .where(eq(schema.routeStops.id, stopId));
      }

      await db
        .update(schema.routes)
        .set({
          optimizer: result.optimizer,
          planMetres: result.metres,
          planSeconds: result.seconds,
          optimizedAt: new Date(),
        })
        .where(eq(schema.routes.id, route.id));

      await logEvent({
        routeId: route.id,
        orgId: context.org.id,
        event: "optimized",
        detail: `${result.optimizer} · ${routable.length} stops · ${Math.round(result.metres / 100) / 10} km`,
        actorId: context.user.id,
      });

      return {
        optimizer: result.optimizer,
        metres: result.metres,
        seconds: result.seconds,
        ordered: routable.length,
        unroutable: unroutable.length,
      };
    }),

  /** Hand the route to a driver. Passing null unassigns it back to draft. */
  assign: orgProc
    .input(z.object({ routeId: z.string(), driverId: z.string().nullable() }))
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      const route = await loadRoute(context.org.id, input.routeId);

      if (input.driverId) {
        const [member] = await db
          .select({ id: schema.members.id })
          .from(schema.members)
          .where(
            and(
              eq(schema.members.orgId, context.org.id),
              eq(schema.members.userId, input.driverId),
            ),
          )
          .limit(1);
        if (!member) {
          throw new ORPCError("BAD_REQUEST", { message: "That person is not in this workspace" });
        }
      }

      await db
        .update(schema.routes)
        .set({
          driverId: input.driverId,
          status: input.driverId ? (route.status === "draft" ? "assigned" : route.status) : "draft",
        })
        .where(eq(schema.routes.id, route.id));

      await logEvent({
        routeId: route.id,
        orgId: context.org.id,
        event: input.driverId ? "assigned" : "unassigned",
        actorId: context.user.id,
      });

      return { ok: true };
    }),

  /**
   * The driver taps START. Idempotent — tapping it twice, or arriving through a
   * queued photo that drained late, must not reset the clock.
   */
  start: orgProc.input(z.object({ routeId: z.string() })).handler(async ({ input, context }) => {
    const route = await loadRoute(context.org.id, input.routeId);
    assertRouteAccess(route, context);

    if (route.status === "completed" || route.status === "cancelled") {
      throw new ORPCError("BAD_REQUEST", { message: "This route is finished" });
    }
    if (route.status === "active") return { ok: true, alreadyRunning: true };

    await db
      .update(schema.routes)
      .set({ status: "active", startedAt: route.startedAt ?? new Date() })
      .where(eq(schema.routes.id, route.id));

    await logEvent({
      routeId: route.id,
      orgId: context.org.id,
      event: "started",
      actorId: context.user.id,
    });

    // Recipients hear about it once, here. Never allowed to fail the start itself.
    await notifyRouteStarted({ ...route, status: "active", startedAt: route.startedAt ?? new Date() });

    return { ok: true, alreadyRunning: false };
  }),

  /**
   * Close out one stop. Both outcomes — delivered and could-not-deliver — demand a
   * photo, because a stop with no evidence is exactly what this product exists to
   * prevent. The photo is an ordinary GeoCliks record, so it already carries the
   * content hash, the HMAC seal and the chain of custody.
   */
  completeStop: orgProc
    .input(
      z.object({
        stopId: z.string(),
        photoId: z.string(),
        outcome: z.enum(["delivered", "failed"]).default("delivered"),
        failedReason: failedReasonEnum.optional(),
        failedNote: z.string().max(500).optional(),
        recipientName: z.string().max(160).optional(),
        /** Capture time, so a photo that sat in the offline queue records when it happened. */
        completedAt: z.number().int().positive().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const stop = await loadStop(context.org.id, input.stopId);
      const route = await loadRoute(context.org.id, stop.routeId);
      assertRouteAccess(route, context);

      if (route.status === "cancelled") {
        throw new ORPCError("BAD_REQUEST", { message: "This route was cancelled" });
      }
      if (input.outcome === "failed" && !input.failedReason) {
        throw new ORPCError("BAD_REQUEST", { message: "Pick a reason for the failed delivery" });
      }

      // The proof must be a real photo in this workspace — never trust a client id.
      const [photo] = await db
        .select({ id: schema.photos.id, capturedAt: schema.photos.capturedAt })
        .from(schema.photos)
        .where(and(eq(schema.photos.id, input.photoId), eq(schema.photos.orgId, context.org.id)))
        .limit(1);
      if (!photo) throw new ORPCError("BAD_REQUEST", { message: "Delivery photo not found" });

      // Already closed with the same photo — a duplicate drain of the offline queue.
      if (stop.status !== "pending" && stop.photoId === input.photoId) {
        return runState(route.id, context.org.id);
      }

      const completedAt = completionTime(input.completedAt, photo.capturedAt);

      await db
        .update(schema.routeStops)
        .set({
          status: input.outcome,
          photoId: photo.id,
          completedAt,
          failedReason: input.outcome === "failed" ? (input.failedReason ?? null) : null,
          failedNote: input.outcome === "failed" ? (input.failedNote ?? null) : null,
          recipientName: input.recipientName?.trim() || stop.recipientName,
        })
        .where(eq(schema.routeStops.id, stop.id));

      // A driver who skips START and just photographs the first drop still runs a live route.
      if (route.status === "draft" || route.status === "assigned") {
        await db
          .update(schema.routes)
          .set({ status: "active", startedAt: route.startedAt ?? completedAt })
          .where(eq(schema.routes.id, route.id));
      }

      await logEvent({
        routeId: route.id,
        orgId: context.org.id,
        stopId: stop.id,
        event: input.outcome === "delivered" ? "delivered" : "failed",
        detail: input.outcome === "failed" ? (input.failedReason ?? null) : (stop.address ?? stop.addressRaw),
        actorId: context.user.id,
      });

      const state = await runState(route.id, context.org.id);

      // Proof of delivery to this recipient, then the heads-up to whoever is coming up.
      // Both re-read live rows, so a queue that drained hours late still behaves.
      if (input.outcome === "delivered") await notifyStopDelivered(stop.id);
      await notifyUpcoming(route.id);

      return state;
    }),

  /**
   * Skip a stop. This is the one documented exception to "every stop needs evidence":
   * a skip is the driver reporting there is nothing to deliver here, so there is no
   * photo to take and completeStop — which hard-requires a real photo — cannot serve.
   * The stop closes as `skipped`, and the office reads exactly that in the audit trail.
   */
  skipStop: orgProc
    .input(z.object({ stopId: z.string(), note: z.string().max(500).optional() }))
    .handler(async ({ input, context }) => {
      const stop = await loadStop(context.org.id, input.stopId);
      const route = await loadRoute(context.org.id, stop.routeId);
      assertRouteAccess(route, context);

      if (route.status === "cancelled") {
        throw new ORPCError("BAD_REQUEST", { message: "This route was cancelled" });
      }
      // Already closed — a double tap, or the queue draining twice. Nothing to undo.
      if (stop.status !== "pending") return runState(route.id, context.org.id);

      const skippedAt = new Date();
      await db
        .update(schema.routeStops)
        .set({
          status: "skipped",
          completedAt: skippedAt,
          failedReason: null,
          failedNote: input.note?.trim() || null,
        })
        .where(eq(schema.routeStops.id, stop.id));

      // Skipping the first stop still means the driver is out working the route.
      if (route.status === "draft" || route.status === "assigned") {
        await db
          .update(schema.routes)
          .set({ status: "active", startedAt: route.startedAt ?? skippedAt })
          .where(eq(schema.routes.id, route.id));
      }

      await logEvent({
        routeId: route.id,
        orgId: context.org.id,
        stopId: stop.id,
        event: "skipped",
        detail: stop.address ?? stop.addressRaw,
        actorId: context.user.id,
      });

      const state = await runState(route.id, context.org.id);
      // No proof email — nothing was delivered. But everyone behind this stop just moved
      // up the queue, so the upcoming heads-up has to be re-evaluated.
      await notifyUpcoming(route.id);
      return state;
    }),

  /** Where the run stands: used by the driver screen after every action. */
  runState: orgProc.input(z.object({ routeId: z.string() })).handler(async ({ input, context }) => {
    const route = await loadRoute(context.org.id, input.routeId);
    assertRouteAccess(route, context);
    return runState(route.id, context.org.id);
  }),

  /** The audit trail for one route. */
  events: orgProc.input(z.object({ routeId: z.string() })).handler(async ({ input, context }) => {
    const route = await loadRoute(context.org.id, input.routeId);
    assertRouteAccess(route, context);
    return db
      .select()
      .from(schema.routeEvents)
      .where(eq(schema.routeEvents.routeId, route.id))
      .orderBy(desc(schema.routeEvents.at))
      .limit(200);
  }),

  remove: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    requireRole(context.role, "manager");
    const route = await loadRoute(context.org.id, input.id);
    if (route.status === "active") {
      throw new ORPCError("BAD_REQUEST", { message: "Stop the route before deleting it" });
    }

    // Evidence photos are never touched — deleting a route only deletes the plan.
    await db.delete(schema.routeStops).where(eq(schema.routeStops.routeId, route.id));
    await db.delete(schema.routeEvents).where(eq(schema.routeEvents.routeId, route.id));
    await db.delete(schema.routes).where(eq(schema.routes.id, route.id));

    return { ok: true };
  }),

  /** Reasons a stop can be closed without a delivery. Kept server-side so both apps agree. */
  failedReasons: orgProc.handler(async () => failedReasonEnum.options),
};
