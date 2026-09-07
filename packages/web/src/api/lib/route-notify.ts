import { and, asc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { emailConfigured } from "../services/email";
import { routeDeliveredEmail, routeNextEmail, routeStartEmail } from "../services/route-emails";
import { id } from "./ids";
import { photoUrl } from "./media";

/**
 * Who gets told what, and — far more important — who does NOT.
 *
 * A recipient can receive at most three emails for one delivery: the run started, they are
 * next, and the proof. The three `notified*At` columns on `route_stops` are the guard: a
 * stamp means that message has already gone out and can never go out again.
 *
 * The hazard this file exists to handle: a driver in a dead zone drains a queue hours later,
 * so several stops close at once and out of order. Every decision below re-reads the stop's
 * CURRENT status at send time — never a status captured when the work was queued — so nobody
 * is told "you're next" for a parcel that is already on their step.
 *
 * Nothing here ever throws. An email failing must never fail the driver's stop-close.
 */

type StopRow = typeof schema.routeStops.$inferSelect;
type RouteRow = typeof schema.routes.$inferSelect;

function canEmail(stop: StopRow): boolean {
  const to = (stop.recipientEmail ?? "").trim();
  return to.includes("@") && to.length > 4;
}

async function orgName(orgId: string): Promise<string> {
  const [org] = await db
    .select({ name: schema.organizations.name })
    .from(schema.organizations)
    .where(eq(schema.organizations.id, orgId))
    .limit(1);
  return org?.name ?? "GeoCliks";
}

async function noteSent(stopId: string, column: "start" | "next" | "delivered") {
  const now = new Date();
  const patch =
    column === "start"
      ? { notifiedStartAt: now }
      : column === "next"
        ? { notifiedNextAt: now }
        : { notifiedDeliveredAt: now };
  await db.update(schema.routeStops).set(patch).where(eq(schema.routeStops.id, stopId));
}

async function logNotified(stop: StopRow, detail: string) {
  try {
    await db.insert(schema.routeEvents).values({
      id: id("evt"),
      routeId: stop.routeId,
      orgId: stop.orgId,
      stopId: stop.id,
      event: "notified",
      detail,
    });
  } catch {
    // the audit line is best effort; the email already went
  }
}

/** Re-read one stop straight from the database, so no decision runs on a stale copy. */
async function freshStop(stopId: string): Promise<StopRow | null> {
  const [row] = await db
    .select()
    .from(schema.routeStops)
    .where(eq(schema.routeStops.id, stopId))
    .limit(1);
  return row ?? null;
}

/**
 * 1 of 3 — the driver tapped START. Every stop on the route that has an email address and has
 * not already been told gets one note. Stops already closed are skipped.
 */
export async function notifyRouteStarted(route: RouteRow): Promise<void> {
  if (!emailConfigured() || !route.notifyOnStart) return;
  try {
    const stops = await db
      .select()
      .from(schema.routeStops)
      .where(eq(schema.routeStops.routeId, route.id))
      .orderBy(asc(schema.routeStops.seq));
    const name = await orgName(route.orgId);

    for (const stop of stops) {
      if (stop.status !== "pending") continue;
      if (stop.notifiedStartAt) continue;
      if (!canEmail(stop)) continue;

      const result = await routeStartEmail({ stop, route, orgName: name });
      if (!result.ok) {
        console.error("[route-notify] start email failed", stop.id, result.reason);
        continue;
      }
      await noteSent(stop.id, "start");
      await logNotified(stop, `Route start sent to ${stop.recipientEmail}`);
    }
  } catch (err) {
    console.error("[route-notify] notifyRouteStarted", err);
  }
}

/**
 * 2 of 3 — the driver is closing in. Called after every stop closes.
 *
 * Pending stops are re-read here and only the first `notifyLeadStops + 1` of them are told,
 * so the note lands roughly when the driver is that many drops away. A stop that already
 * closed is simply not in the pending list any more, which is exactly the dead-zone guard.
 */
export async function notifyUpcoming(routeId: string): Promise<void> {
  if (!emailConfigured()) return;
  try {
    const [route] = await db
      .select()
      .from(schema.routes)
      .where(eq(schema.routes.id, routeId))
      .limit(1);
    if (!route || !route.notifyWhenNext) return;
    if (route.status !== "active") return;

    const pending = await db
      .select()
      .from(schema.routeStops)
      .where(
        and(eq(schema.routeStops.routeId, route.id), eq(schema.routeStops.status, "pending")),
      )
      .orderBy(asc(schema.routeStops.seq));
    if (pending.length === 0) return;

    const lead = Math.max(0, Math.min(route.notifyLeadStops, 10));
    const name = await orgName(route.orgId);

    for (let i = 0; i <= lead && i < pending.length; i++) {
      const candidate = pending[i];
      if (!candidate) continue;
      if (candidate.notifiedNextAt) continue;
      if (!canEmail(candidate)) continue;

      // Last check before sending: the driver may have closed this very stop while we worked.
      const stop = await freshStop(candidate.id);
      if (!stop || stop.status !== "pending" || stop.notifiedNextAt) continue;

      const result = await routeNextEmail({ stop, route, orgName: name, stopsAway: i });
      if (!result.ok) {
        console.error("[route-notify] next email failed", stop.id, result.reason);
        continue;
      }
      await noteSent(stop.id, "next");
      await logNotified(stop, `You're next sent to ${stop.recipientEmail}`);
    }
  } catch (err) {
    console.error("[route-notify] notifyUpcoming", err);
  }
}

/**
 * 3 of 3 — proof of delivery, with the photo. Only for a delivered stop: a failed stop must
 * never get a cheerful "here's your parcel" mail. The office handles those by hand.
 */
export async function notifyStopDelivered(stopId: string): Promise<void> {
  if (!emailConfigured()) return;
  try {
    const stop = await freshStop(stopId);
    if (!stop) return;
    if (stop.status !== "delivered") return;
    if (stop.notifiedDeliveredAt) return;
    if (!canEmail(stop)) return;

    const [route] = await db
      .select()
      .from(schema.routes)
      .where(eq(schema.routes.id, stop.routeId))
      .limit(1);
    if (!route || !route.notifyOnDelivery) return;

    const [photo] = stop.photoId
      ? await db
          .select({
            photoCode: schema.photos.photoCode,
            capturedAt: schema.photos.capturedAt,
            storageKey: schema.photos.storageKey,
            recipient: schema.photos.recipient,
            integrity: schema.photos.integrity,
            address: schema.photos.address,
          })
          .from(schema.photos)
          .where(eq(schema.photos.id, stop.photoId))
          .limit(1)
      : [];

    const name = await orgName(stop.orgId);
    const result = await routeDeliveredEmail({
      stop,
      route,
      orgName: name,
      photo: photo
        ? {
            photoCode: photo.photoCode,
            capturedAt: photo.capturedAt,
            url: await photoUrl(photo.storageKey),
            recipient: photo.recipient,
            integrity: photo.integrity,
            address: photo.address,
          }
        : null,
    });
    if (!result.ok) {
      console.error("[route-notify] delivered email failed", stop.id, result.reason);
      return;
    }
    await noteSent(stop.id, "delivered");
    await logNotified(stop, `Proof of delivery sent to ${stop.recipientEmail}`);
  } catch (err) {
    console.error("[route-notify] notifyStopDelivered", err);
  }
}
