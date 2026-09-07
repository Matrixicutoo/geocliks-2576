import { ORPCError } from "@orpc/server";
import { and, asc, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { photoUrl } from "../lib/media";

/**
 * The public delivery tracking page, reached only through the unguessable `trackToken` that
 * GeoCliks emails to one recipient for one stop.
 *
 * Scope is the whole point: a recipient sees THEIR stop and nothing else. No other address,
 * no other recipient's name, no driver name or phone, no route name, no stop count that could
 * be used to map a competitor's round. Only "how many drops until yours", which is the single
 * fact they actually want.
 *
 * The token is the authorisation. Unlike /v/:code — which hides the image until the workspace
 * publishes a share link — the delivery photo IS the thing this recipient was sent here to see,
 * so it is exposed once their stop is closed and never before.
 */
export const track = {
  byToken: base
    .input(z.object({ token: z.string().min(8).max(120) }))
    .handler(async ({ input }) => {
      const [stop] = await db
        .select()
        .from(schema.routeStops)
        .where(eq(schema.routeStops.trackToken, input.token))
        .limit(1);
      if (!stop) throw new ORPCError("NOT_FOUND", { message: "Unknown tracking link" });

      const [route] = await db
        .select({
          status: schema.routes.status,
          date: schema.routes.date,
          startedAt: schema.routes.startedAt,
        })
        .from(schema.routes)
        .where(eq(schema.routes.id, stop.routeId))
        .limit(1);

      const [org] = await db
        .select({ name: schema.organizations.name })
        .from(schema.organizations)
        .where(eq(schema.organizations.id, stop.orgId))
        .limit(1);

      // How many drops are still ahead of theirs — a count only, never the stops themselves.
      let stopsAway: number | null = null;
      if (stop.status === "pending" && route?.status === "active") {
        const ahead = await db
          .select({ id: schema.routeStops.id })
          .from(schema.routeStops)
          .where(
            and(
              eq(schema.routeStops.routeId, stop.routeId),
              eq(schema.routeStops.status, "pending"),
              lt(schema.routeStops.seq, stop.seq),
            ),
          )
          .orderBy(asc(schema.routeStops.seq));
        stopsAway = ahead.length;
      }

      const [photo] =
        stop.status !== "pending" && stop.photoId
          ? await db
              .select({
                photoCode: schema.photos.photoCode,
                capturedAt: schema.photos.capturedAt,
                storageKey: schema.photos.storageKey,
                recipient: schema.photos.recipient,
                signaturePath: schema.photos.signaturePath,
                signatureBox: schema.photos.signatureBox,
                integrity: schema.photos.integrity,
                lat: schema.photos.lat,
                lng: schema.photos.lng,
              })
              .from(schema.photos)
              .where(eq(schema.photos.id, stop.photoId))
              .limit(1)
          : [];

      return {
        orgName: org?.name ?? null,
        routeStatus: route?.status ?? "draft",
        date: route?.date ?? null,
        status: stop.status,
        address: stop.address ?? stop.addressRaw,
        /**
         * This stop's own pin, so the recipient can confirm the driver has the right place.
         * Only their stop is ever returned here - no other stop's coordinates, and never the
         * driver's position, which GeoCliks does not track.
         */
        lat: stop.lat,
        lng: stop.lng,
        recipientName: stop.recipientName,
        reference: stop.reference,
        completedAt: stop.completedAt,
        failedReason: stop.status === "failed" ? stop.failedReason : null,
        stopsAway,
        proof: photo
          ? {
              photoCode: photo.photoCode,
              capturedAt: photo.capturedAt,
              url: await photoUrl(photo.storageKey),
              recipient: photo.recipient,
              signaturePath: photo.signaturePath,
              signatureBox: photo.signatureBox,
              integrity: photo.integrity,
              lat: photo.lat,
              lng: photo.lng,
            }
          : null,
      };
    }),
};
