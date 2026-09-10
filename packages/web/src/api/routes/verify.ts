import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, gt, inArray, isNull, or } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";
import { photoUrl } from "../lib/media";
import { codeCandidates } from "../lib/photo-code";

/** One "viewed" row per photo per half hour; refreshes and re-opens inside that window fold in. */
const VIEW_DEDUPE_MS = 30 * 60 * 1000;

export const verify = {
  /**
   * Public, unauthenticated photo-code lookup — the page a client reaches by scanning the code
   * printed on a photo or closeout report. Metadata and integrity are always returned so the code
   * can be checked by anyone, but the image bytes are only exposed when the owning workspace has a
   * live share link for that photo: a leaked code must not leak the file itself.
   */
  byCode: base
    .input(z.object({ code: z.string().min(4).max(64) }))
    .handler(async ({ input }) => {
      // Both prefixes, so a code printed before the GeoCliks rename still resolves.
      const candidates = codeCandidates(input.code);
      if (candidates.length === 0)
        throw new ORPCError("NOT_FOUND", { message: "Unknown photo code" });

      const [photo] = await db
        .select()
        .from(schema.photos)
        .where(inArray(schema.photos.photoCode, candidates));
      if (!photo) throw new ORPCError("NOT_FOUND", { message: "Unknown photo code" });

      const [project] = photo.projectId
        ? await db
            .select({ name: schema.projects.name })
            .from(schema.projects)
            .where(eq(schema.projects.id, photo.projectId))
        : [];

      const [org] = await db
        .select({ name: schema.organizations.name })
        .from(schema.organizations)
        .where(eq(schema.organizations.id, photo.orgId));

      const liveLinks = await db
        .select({
          token: schema.shareLinks.token,
          allowDownload: schema.shareLinks.allowDownload,
          photoId: schema.shareLinks.photoId,
          projectId: schema.shareLinks.projectId,
        })
        .from(schema.shareLinks)
        .where(
          and(
            eq(schema.shareLinks.orgId, photo.orgId),
            eq(schema.shareLinks.revoked, false),
            or(isNull(schema.shareLinks.expiresAt), gt(schema.shareLinks.expiresAt, new Date())),
          ),
        );

      // The file itself still needs a link created for this exact photo.
      const link = liveLinks.find((l) => l.photoId === photo.id);
      const published = Boolean(link);
      // Proof of delivery is visible whenever the photo is reachable through ANY live link —
      // its own, its project's, or a workspace-wide one — because the record is already public
      // on that /share page. It disappears again the moment every covering link is revoked.
      const shared =
        published ||
        liveLinks.some(
          (l) => !l.photoId && (l.projectId ? l.projectId === photo.projectId : true),
        );

      // Best-effort audit trail: the append-only event chain records public views too, but only
      // once per VIEW_DEDUPE_MS. A public link gets refreshed, re-opened and prefetched, and one
      // row per load buried the real custody steps under dozens of identical "viewed" lines.
      try {
        const [recent] = await db
          .select({ at: schema.photoEvents.at })
          .from(schema.photoEvents)
          .where(
            and(eq(schema.photoEvents.photoId, photo.id), eq(schema.photoEvents.type, "viewed")),
          )
          .orderBy(desc(schema.photoEvents.at))
          .limit(1);
        const fresh = !recent || Date.now() - recent.at.getTime() > VIEW_DEDUPE_MS;
        if (fresh) {
          await db.insert(schema.photoEvents).values({
            id: id("evt"),
            photoId: photo.id,
            orgId: photo.orgId,
            type: "viewed",
            actor: "Public code lookup",
            detail: `Verified ${photo.photoCode} on the public page`,
          });
        }
      } catch {
        // never block a verification on the audit write
      }

      return {
        photoCode: photo.photoCode,
        integrity: photo.integrity,
        timeSource: photo.timeSource,
        clockSkewMs: photo.clockSkewMs,
        capturedAt: photo.capturedAt,
        verifiedAt: photo.verifiedAt,
        lat: photo.lat,
        lng: photo.lng,
        accuracyM: photo.accuracyM,
        address: photo.address,
        contentHash: photo.contentHash,
        deviceModel: photo.deviceModel,
        platform: photo.platform,
        kind: photo.kind,
        projectName: project?.name ?? null,
        orgName: org?.name ?? null,
        published,
        shareToken: link?.token ?? null,
        allowDownload: published ? Boolean(link?.allowDownload) : false,
        // A recipient's name and handwriting are personal data, so they follow the same rule as
        // the image bytes: only exposed while the workspace keeps a live share link for the photo.
        recipient: shared ? photo.recipient : null,
        signaturePath: shared ? photo.signaturePath : null,
        signatureBox: shared ? photo.signatureBox : null,
        url: published ? await photoUrl(photo.storageKey) : null,
        posterUrl: published && photo.posterKey ? await photoUrl(photo.posterKey) : null,
      };
    }),
};
