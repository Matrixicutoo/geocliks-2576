import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { authed, orgProc } from "../middleware/auth";
import { auth } from "../auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { deleteObject, presignGet, presignPut } from "../lib/s3";
import { id } from "../lib/ids";

const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60);

/** Invited field crews can't self-delete: their captures are workspace evidence, so the owner decides. */
const FIELD_DELETE_DENIED =
  "Only the workspace owner can remove a field member. Ask them to remove you from the Teamspace.";

/**
 * Avatars are stored as bare storage keys in `user.image` and resolved to a presigned URL on
 * read — the same rule as photos: clients never see raw keys, and links never go stale.
 */
export async function avatarUrl(image: string | null | undefined) {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  try {
    return await presignGet(image, 60 * 60 * 12);
  } catch {
    return null;
  }
}

/**
 * Recovers the storage key from a full URL that points at our own bucket. Rows written before
 * logos were stored as bare keys hold an expired presigned URL, which would stay broken forever.
 * Anything pointing somewhere else is left alone.
 */
function ownBucketKey(url: string) {
  try {
    const parsed = new URL(url);
    const endpointHost = process.env.S3_ENDPOINT ? new URL(process.env.S3_ENDPOINT).host : null;
    const bucket = process.env.S3_BUCKET ?? "";
    const ours =
      parsed.host === endpointHost ||
      (!!endpointHost && parsed.host === `${bucket}.${endpointHost}`) ||
      (!!bucket && parsed.host.startsWith(`${bucket}.`));
    if (!ours) return null;
    let key = decodeURIComponent(parsed.pathname).replace(/^\/+/, "");
    if (bucket && key.startsWith(`${bucket}/`)) key = key.slice(bucket.length + 1);
    return key || null;
  } catch {
    return null;
  }
}

/**
 * Business and watermark logos follow the same rule as avatars: the column holds a bare storage
 * key and the link is minted on read. Older rows hold a full expired URL, so when that URL is
 * one of ours we recover the key from it and mint a fresh link instead of serving a dead image.
 */
export async function brandLogoUrl(value: string | null | undefined) {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    const key = ownBucketKey(value);
    if (!key) return value;
    try {
      return await presignGet(key, 60 * 60 * 12);
    } catch {
      return null;
    }
  }
  return avatarUrl(value);
}

export const account = {
  /**
   * Password reset by email for someone who is already signed in - the alternative to typing the
   * current password. It can only ever send to the caller's own address, so there is nothing to
   * enumerate and no captcha is needed: the session already proves a human signed in. Calling
   * better-auth server-side also skips the captcha hook, which only runs on real HTTP requests.
   */
  sendPasswordResetLink: authed.handler(async ({ context }) => {
    const base = process.env.WEBSITE_URL ?? "https://www.geocliks.com";
    await auth.api.requestPasswordReset({
      body: { email: context.user.email, redirectTo: `${base}/reset-password` },
    });
    return { email: context.user.email };
  }),

  /** Presign a direct PUT for the signed-in user's avatar. */
  presignAvatar: authed
    .input(z.object({ filename: z.string(), contentType: z.string().default("image/jpeg") }))
    .handler(async ({ input, context }) => {
      const key = `users/${context.user.id}/avatar/${id("avt")}-${safeName(input.filename)}`;
      const url = await presignPut(key, input.contentType);
      return { url, key };
    }),

  /** Update display name and/or avatar. Passing `image: null` clears the avatar. */
  updateProfile: authed
    .input(
      z.object({
        name: z.string().trim().min(1).max(80).optional(),
        image: z.string().max(400).nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      const previous = context.user.image ?? null;
      const patch: { name?: string; image?: string | null } = {};
      if (input.name !== undefined) patch.name = input.name;
      if (input.image !== undefined) patch.image = input.image ?? null;
      if (Object.keys(patch).length === 0) throw new ORPCError("BAD_REQUEST");

      await db.update(schema.user).set(patch).where(eq(schema.user.id, context.user.id));

      // Best-effort cleanup of the replaced object; a stale avatar is not worth failing the call.
      if (
        input.image !== undefined &&
        previous &&
        !previous.startsWith("http") &&
        previous !== input.image
      ) {
        void deleteObject(previous).catch(() => {});
      }

      const [row] = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, context.user.id))
        .limit(1);
      return {
        name: row?.name ?? context.user.name,
        image: await avatarUrl(row?.image ?? null),
      };
    }),

  /**
   * Permanent account deletion. Removes the workspace the caller owns — photos and their bytes,
   * projects, share links, reports and memberships — then the identity itself.
   *
   * Invited field members cannot delete themselves: only the workspace owner may remove them
   * (via `team.remove`, which leaves their photos and videos intact).
   */
  destroy: orgProc
    .input(z.object({ confirm: z.literal("DELETE") }))
    .handler(async ({ context }) => {
      const userId = context.user.id;
      if (context.impersonating) {
        throw new ORPCError("FORBIDDEN", { message: "Not available while impersonating" });
      }
      const orgId = context.org.id;
      const owns = context.org.ownerId === userId;
      if (!owns && context.role === "field") {
        throw new ORPCError("FORBIDDEN", { message: FIELD_DELETE_DENIED });
      }

      if (owns) {
        const photos = await db
          .select({
            id: schema.photos.id,
            storageKey: schema.photos.storageKey,
            posterKey: schema.photos.posterKey,
          })
          .from(schema.photos)
          .where(eq(schema.photos.orgId, orgId));

        for (const photo of photos) {
          await deleteObject(photo.storageKey).catch(() => false);
          if (photo.posterKey) await deleteObject(photo.posterKey).catch(() => false);
        }
        const photoIds = photos.map((p) => p.id);
        for (let i = 0; i < photoIds.length; i += 100) {
          const slice = photoIds.slice(i, i + 100);
          await db.delete(schema.photoEvents).where(inArray(schema.photoEvents.photoId, slice));
        }

        await db.delete(schema.photos).where(eq(schema.photos.orgId, orgId));
        await db.delete(schema.comparisons).where(eq(schema.comparisons.orgId, orgId));
        await db.delete(schema.reports).where(eq(schema.reports.orgId, orgId));
        await db.delete(schema.shareLinks).where(eq(schema.shareLinks.orgId, orgId));
        await db
          .delete(schema.watermarkTemplates)
          .where(eq(schema.watermarkTemplates.orgId, orgId));
        const projects = await db
          .select({ id: schema.projects.id })
          .from(schema.projects)
          .where(eq(schema.projects.orgId, orgId));
        if (projects.length > 0) {
          await db.delete(schema.projectAssignments).where(
            inArray(
              schema.projectAssignments.projectId,
              projects.map((p) => p.id),
            ),
          );
        }
        await db.delete(schema.projects).where(eq(schema.projects.orgId, orgId));
        await db.delete(schema.invites).where(eq(schema.invites.orgId, orgId));
        await db.delete(schema.members).where(eq(schema.members.orgId, orgId));
        await db.delete(schema.subscriptions).where(eq(schema.subscriptions.orgId, orgId));
        await db.delete(schema.organizations).where(eq(schema.organizations.id, orgId));
      } else {
        await db.delete(schema.members).where(eq(schema.members.userId, userId));
      }

      if (context.user.image && !context.user.image.startsWith("http")) {
        await deleteObject(context.user.image).catch(() => false);
      }

      await db.delete(schema.userStatus).where(eq(schema.userStatus.userId, userId));
      await db.delete(schema.staff).where(eq(schema.staff.userId, userId));
      await db.delete(schema.session).where(eq(schema.session.userId, userId));
      await db.delete(schema.account).where(eq(schema.account.userId, userId));
      await db.delete(schema.user).where(eq(schema.user.id, userId));

      return { ok: true as const };
    }),
};
