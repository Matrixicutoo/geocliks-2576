import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { base } from "../__core/app";
import { orgProc, visibleProjectIds } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id, shareToken } from "../lib/ids";
import { planOf } from "../lib/plans";
import { photoUrl } from "../lib/media";

export const share = {
  list: orgProc.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(schema.shareLinks)
      .where(eq(schema.shareLinks.orgId, context.org.id))
      .orderBy(desc(schema.shareLinks.createdAt));

    // A field member sees a link only when it belongs to one of their own jobs, or when they
    // created it themselves. A workspace-wide link exposes every project, so it stays hidden.
    const allowed = await visibleProjectIds(context.org.id, context.user.id, context.role);
    let visible = rows;
    if (allowed) {
      const allowedSet = new Set(allowed);
      // Per-photo links carry a photoId instead of a projectId, so resolve those to their job.
      const photoIds = rows.map((r) => r.photoId).filter((v): v is string => Boolean(v));
      const photoProject = new Map<string, string | null>();
      if (photoIds.length > 0) {
        const photoRows = await db
          .select({ id: schema.photos.id, projectId: schema.photos.projectId })
          .from(schema.photos)
          .where(
            and(eq(schema.photos.orgId, context.org.id), inArray(schema.photos.id, photoIds)),
          );
        for (const p of photoRows) photoProject.set(p.id, p.projectId);
      }
      visible = rows.filter((row) => {
        if (row.createdBy === context.user.id) return true;
        if (row.projectId) return allowedSet.has(row.projectId);
        if (row.photoId) {
          const pid = photoProject.get(row.photoId);
          return pid ? allowedSet.has(pid) : false;
        }
        return false;
      });
    }

    const projects = await db
      .select({ id: schema.projects.id, name: schema.projects.name })
      .from(schema.projects)
      .where(eq(schema.projects.orgId, context.org.id));
    const names = new Map(projects.map((p) => [p.id, p.name]));
    return visible.map((row) => ({
      ...row,
      projectName: row.projectId ? (names.get(row.projectId) ?? null) : null,
    }));
  }),

  create: orgProc
    .input(
      z.object({
        label: z.string().min(1).max(90),
        projectId: z.string().nullish(),
        allowDownload: z.boolean().default(true),
        expiresInDays: z.number().min(1).max(365).nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      const plan = planOf(context.org.plan);
      if (!plan.limits.shareLinks) {
        throw new ORPCError("PAYMENT_REQUIRED", {
          status: 402,
          message: "Live share links start on the Plus plan.",
        });
      }

      // A field member has no business minting a link that exposes every project, and may only
      // share a job they are actually assigned to. Manager and above stay unrestricted.
      const allowed = await visibleProjectIds(context.org.id, context.user.id, context.role);
      if (allowed) {
        if (!input.projectId) {
          throw new ORPCError("FORBIDDEN", {
            message: "A workspace-wide share link requires manager access or above.",
          });
        }
        if (!allowed.includes(input.projectId)) {
          throw new ORPCError("FORBIDDEN", {
            message: "You can only share a job you are assigned to.",
          });
        }
      }

      const [link] = await db
        .insert(schema.shareLinks)
        .values({
          id: id("shr"),
          orgId: context.org.id,
          projectId: input.projectId ?? null,
          token: shareToken(),
          label: input.label,
          allowDownload: input.allowDownload,
          expiresAt: input.expiresInDays
            ? new Date(Date.now() + input.expiresInDays * 86400000)
            : null,
          createdBy: context.user.id,
        })
        .returning();
      return link;
    }),

  /**
   * Per-photo share link. Reuses the org's existing live link for that photo when there is one,
   * so sharing the same photo twice does not pile up tokens. Unlike gallery links (Plus+), a
   * single-photo link is available on every plan — sharing one piece of evidence is core to the
   * product promise.
   */
  forPhoto: orgProc
    .input(z.object({ photoId: z.string() }))
    .handler(async ({ input, context }) => {
      const [photo] = await db
        .select({
          id: schema.photos.id,
          photoCode: schema.photos.photoCode,
          projectId: schema.photos.projectId,
        })
        .from(schema.photos)
        .where(and(eq(schema.photos.id, input.photoId), eq(schema.photos.orgId, context.org.id)));
      if (!photo) throw new ORPCError("NOT_FOUND", { message: "Photo not found" });

      // Single-photo sharing stays open to every role and every plan, but a field member may
      // only share evidence from a job they are on — not a colleague's photo on another job.
      const visible = await visibleProjectIds(context.org.id, context.user.id, context.role);
      if (visible && (!photo.projectId || !visible.includes(photo.projectId))) {
        throw new ORPCError("NOT_FOUND", { message: "Photo not found" });
      }

      const existing = await db
        .select()
        .from(schema.shareLinks)
        .where(
          and(
            eq(schema.shareLinks.orgId, context.org.id),
            eq(schema.shareLinks.photoId, photo.id),
            eq(schema.shareLinks.revoked, false),
          ),
        )
        .orderBy(desc(schema.shareLinks.createdAt));
      const live = existing.find((l) => !l.expiresAt || l.expiresAt.getTime() > Date.now());
      if (live) return { token: live.token, photoCode: photo.photoCode };

      const [link] = await db
        .insert(schema.shareLinks)
        .values({
          id: id("shr"),
          orgId: context.org.id,
          projectId: null,
          photoId: photo.id,
          token: shareToken(),
          label: photo.photoCode,
          allowDownload: true,
          expiresAt: null,
          createdBy: context.user.id,
        })
        .returning();

      await db.insert(schema.photoEvents).values({
        id: id("evt"),
        photoId: photo.id,
        orgId: context.org.id,
        type: "shared",
        detail: "Share link created",
        actor: context.user.name ?? context.user.email ?? context.user.id,
      });

      return { token: link.token, photoCode: photo.photoCode };
    }),

  revoke: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    // Scoped to the caller's workspace, and a link from anywhere else reports NOT_FOUND
    // rather than a hollow success.
    const rows = await db
      .update(schema.shareLinks)
      .set({ revoked: true })
      .where(and(eq(schema.shareLinks.id, input.id), eq(schema.shareLinks.orgId, context.org.id)))
      .returning({ id: schema.shareLinks.id });
    if (!rows.length) throw new ORPCError("NOT_FOUND", { message: "Share link not found" });
    return { ok: true };
  }),

  /** Public, unauthenticated gallery — clients and inspectors open this in a browser. */
  view: base
    .input(z.object({ token: z.string(), limit: z.number().min(1).max(200).default(120) }))
    .handler(async ({ input }) => {
      const [link] = await db
        .select()
        .from(schema.shareLinks)
        .where(eq(schema.shareLinks.token, input.token));
      if (!link || link.revoked) throw new ORPCError("NOT_FOUND", { message: "Link not available" });
      if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
        throw new ORPCError("NOT_FOUND", { message: "This link has expired" });
      }

      await db
        .update(schema.shareLinks)
        .set({ views: sql`${schema.shareLinks.views} + 1` })
        .where(eq(schema.shareLinks.id, link.id));

      const [org] = await db
        .select({
          name: schema.organizations.name,
          logoUrl: schema.organizations.logoUrl,
        })
        .from(schema.organizations)
        .where(eq(schema.organizations.id, link.orgId));

      const filters = [eq(schema.photos.orgId, link.orgId)];
      if (link.photoId) filters.push(eq(schema.photos.id, link.photoId));
      else if (link.projectId) filters.push(eq(schema.photos.projectId, link.projectId));
      const rows = await db
        .select()
        .from(schema.photos)
        .where(and(...filters))
        .orderBy(desc(schema.photos.capturedAt))
        .limit(input.limit);

      const projectIds = [...new Set(rows.map((r) => r.projectId).filter(Boolean))] as string[];
      const projects = projectIds.length
        ? await db
            .select({ id: schema.projects.id, name: schema.projects.name })
            .from(schema.projects)
            .where(inArray(schema.projects.id, projectIds))
        : [];
      const names = new Map(projects.map((p) => [p.id, p.name]));

      return {
        link: {
          label: link.label,
          allowDownload: link.allowDownload,
          expiresAt: link.expiresAt,
          views: link.views + 1,
        },
        org: org ?? { name: "GeoCliks", logoUrl: null },
        photos: await Promise.all(
          rows.map(async (row) => ({
            id: row.id,
            photoCode: row.photoCode,
            url: await photoUrl(row.storageKey),
            capturedAt: row.capturedAt,
            verifiedAt: row.verifiedAt,
            lat: row.lat,
            lng: row.lng,
            address: row.address,
            note: row.note,
            tag: row.tag,
            integrity: row.integrity,
            projectName: row.projectId ? (names.get(row.projectId) ?? null) : null,
            // Proof of delivery travels with the shared record — a client opening the link is
            // exactly who needs to see who signed for the drop.
            recipient: row.recipient,
            signaturePath: row.signaturePath,
            signatureBox: row.signatureBox,
          })),
        ),
      };
    }),
};
