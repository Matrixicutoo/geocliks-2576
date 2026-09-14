import { and, count, eq, gt, inArray, isNull, ne, or } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { deleteObject } from "./s3";
import { isPaid } from "./trial";

/**
 * Deletes a workspace and everything hanging off it — including the stored bytes of its captures.
 *
 * This schema has no foreign keys, so nothing cascades: every dependent table has to be named
 * here. It lives in one place on purpose. The same purge used to be written out by hand in the
 * self-serve account deletion, the admin console's user deletion, and the empty-workspace
 * cleanup below, and all three had drifted — messages, push tokens and the whole delivery side
 * (routes, stops, events) survived their own workspace, and the admin path left every photo's
 * bytes in storage. Add a workspace-scoped table to the schema, add it here.
 */
export async function purgeWorkspace(orgId: string): Promise<void> {
  const photos = await db
    .select({ storageKey: schema.photos.storageKey, posterKey: schema.photos.posterKey })
    .from(schema.photos)
    .where(eq(schema.photos.orgId, orgId));
  for (const photo of photos) {
    await deleteObject(photo.storageKey).catch(() => false);
    if (photo.posterKey) await deleteObject(photo.posterKey).catch(() => false);
  }

  // Captures and their audit trail.
  await db.delete(schema.photoEvents).where(eq(schema.photoEvents.orgId, orgId));
  await db.delete(schema.photos).where(eq(schema.photos.orgId, orgId));
  await db.delete(schema.comparisons).where(eq(schema.comparisons.orgId, orgId));
  await db.delete(schema.reports).where(eq(schema.reports.orgId, orgId));
  await db.delete(schema.shareLinks).where(eq(schema.shareLinks.orgId, orgId));
  await db.delete(schema.watermarkTemplates).where(eq(schema.watermarkTemplates.orgId, orgId));

  // Work: jobs and delivery routes.
  await db.delete(schema.projectAssignments).where(eq(schema.projectAssignments.orgId, orgId));
  await db.delete(schema.projects).where(eq(schema.projects.orgId, orgId));
  await db.delete(schema.routeEvents).where(eq(schema.routeEvents.orgId, orgId));
  await db.delete(schema.routeStops).where(eq(schema.routeStops.orgId, orgId));
  await db.delete(schema.routes).where(eq(schema.routes.orgId, orgId));

  // Internal messaging. Read cursors key off the conversation, so they go first.
  const conversations = await db
    .select({ id: schema.conversations.id })
    .from(schema.conversations)
    .where(eq(schema.conversations.orgId, orgId));
  for (let i = 0; i < conversations.length; i += 100) {
    const slice = conversations.slice(i, i + 100).map((c) => c.id);
    await db.delete(schema.messageReads).where(inArray(schema.messageReads.conversationId, slice));
  }
  await db.delete(schema.messages).where(eq(schema.messages.orgId, orgId));
  await db.delete(schema.conversations).where(eq(schema.conversations.orgId, orgId));

  // The workspace itself.
  await db.delete(schema.invites).where(eq(schema.invites.orgId, orgId));
  await db.delete(schema.subscriptions).where(eq(schema.subscriptions.orgId, orgId));
  await db.delete(schema.members).where(eq(schema.members.orgId, orgId));
  await db.delete(schema.organizations).where(eq(schema.organizations.id, orgId));
}

/**
 * Deletes an identity and everything keyed to the person rather than to a workspace: their
 * avatar, devices, memberships elsewhere, and the 1:1 conversations they are half of.
 *
 * Call `purgeWorkspace` for anything they own first — this does not look at ownership. The
 * `staff` row goes too: a deleted account must not leave a platform-staff grant behind that a
 * re-registration of the same user id could inherit.
 */
export async function purgeUser(userId: string): Promise<void> {
  const [user] = await db
    .select({ image: schema.user.image })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1);
  if (user?.image && !user.image.startsWith("http")) {
    await deleteObject(user.image).catch(() => false);
  }

  const conversations = await db
    .select({ id: schema.conversations.id })
    .from(schema.conversations)
    .where(
      or(eq(schema.conversations.userAId, userId), eq(schema.conversations.userBId, userId)),
    );
  for (let i = 0; i < conversations.length; i += 100) {
    const slice = conversations.slice(i, i + 100).map((c) => c.id);
    await db.delete(schema.messageReads).where(inArray(schema.messageReads.conversationId, slice));
    await db.delete(schema.messages).where(inArray(schema.messages.conversationId, slice));
  }
  if (conversations.length > 0) {
    await db.delete(schema.conversations).where(
      inArray(
        schema.conversations.id,
        conversations.map((c) => c.id),
      ),
    );
  }
  await db.delete(schema.messageReads).where(eq(schema.messageReads.userId, userId));

  await db.delete(schema.projectAssignments).where(eq(schema.projectAssignments.userId, userId));
  await db.delete(schema.members).where(eq(schema.members.userId, userId));
  await db.delete(schema.pushTokens).where(eq(schema.pushTokens.userId, userId));
  await db
    .delete(schema.impersonations)
    .where(or(eq(schema.impersonations.userId, userId), eq(schema.impersonations.actorId, userId)));
  await db.delete(schema.userStatus).where(eq(schema.userStatus.userId, userId));
  await db.delete(schema.staff).where(eq(schema.staff.userId, userId));
  await db.delete(schema.twoFactor).where(eq(schema.twoFactor.userId, userId));
  await db.delete(schema.session).where(eq(schema.session.userId, userId));
  await db.delete(schema.account).where(eq(schema.account.userId, userId));
  await db.delete(schema.user).where(eq(schema.user.id, userId));
}

/**
 * The name `orgProc` gives a freshly auto-provisioned workspace. It lives here so the sign-up
 * flow and the "name your Teamspace" prompt can tell a still-default name from one the business
 * actually chose. Keep it in step with the insert in `middleware/auth.ts`.
 */
export function defaultOrgName(user: { name?: string | null }): string {
  return user.name ? `${user.name}'s Team` : "My Team";
}

/**
 * Every new signed-in user gets a personal workspace auto-provisioned by `orgProc`. When someone
 * only ever signed up to accept a crew invite, that personal workspace is dead weight: it clutters
 * the account, and `orgProc` could resolve to it instead of the workspace that invited them.
 *
 * This drops it — but only when it is unmistakably the untouched auto-provisioned one: id derived
 * from the user id, owned by them, free plan, no photos, no projects, and nobody else in it.
 * Anything else is a real workspace and is left alone.
 */
export async function dropEmptyPersonalWorkspace(
  userId: string,
  keepOrgId: string,
): Promise<boolean> {
  const orgId = `org_${userId}`;
  if (orgId === keepOrgId) return false;

  const [org] = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.id, orgId))
    .limit(1);
  // Either free tier counts as untouched — a delivery workspace sits on `delivery-free`.
  if (!org || org.ownerId !== userId || isPaid(org.plan)) return false;

  const [photos] = await db
    .select({ value: count() })
    .from(schema.photos)
    .where(eq(schema.photos.orgId, orgId));
  if ((photos?.value ?? 0) > 0) return false;

  const [projects] = await db
    .select({ value: count() })
    .from(schema.projects)
    .where(eq(schema.projects.orgId, orgId));
  if ((projects?.value ?? 0) > 0) return false;

  const [others] = await db
    .select({ value: count() })
    .from(schema.members)
    .where(and(eq(schema.members.orgId, orgId), ne(schema.members.userId, userId)));
  if ((others?.value ?? 0) > 0) return false;

  await purgeWorkspace(orgId);
  return true;
}

/**
 * Seats are a cap, not a meter: the plan price is flat and this is what decides whether one more
 * person may come in. Pending invites count, otherwise an admin could issue ten invites against
 * two seats and every one of them would still be able to accept.
 *
 * An expired invite does not: it can no longer be redeemed, so holding a seat hostage with it
 * would quietly shrink the workspace every time an invite went unanswered.
 */
export async function seatUsage(orgId: string): Promise<{ members: number; pending: number }> {
  const [members] = await db
    .select({ value: count() })
    .from(schema.members)
    .where(eq(schema.members.orgId, orgId));
  const [pending] = await db
    .select({ value: count() })
    .from(schema.invites)
    .where(
      and(
        eq(schema.invites.orgId, orgId),
        eq(schema.invites.status, "pending"),
        or(isNull(schema.invites.expiresAt), gt(schema.invites.expiresAt, new Date())),
      ),
    );
  return { members: members?.value ?? 0, pending: pending?.value ?? 0 };
}
