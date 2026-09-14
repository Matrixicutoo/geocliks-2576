import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { authed, orgProc } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { deleteObject, presignGet, presignPut } from "../lib/s3";
import { id } from "../lib/ids";
import { purgeUser, purgeWorkspace } from "../lib/workspaces";

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

      if (owns) await purgeWorkspace(orgId);
      await purgeUser(userId);

      return { ok: true as const };
    }),
};
