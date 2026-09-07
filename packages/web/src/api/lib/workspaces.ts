import { and, count, eq, ne } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

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
  if (!org || org.ownerId !== userId || org.plan !== "free") return false;

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

  await db.delete(schema.watermarkTemplates).where(eq(schema.watermarkTemplates.orgId, orgId));
  await db.delete(schema.invites).where(eq(schema.invites.orgId, orgId));
  await db.delete(schema.subscriptions).where(eq(schema.subscriptions.orgId, orgId));
  await db.delete(schema.members).where(eq(schema.members.orgId, orgId));
  await db.delete(schema.organizations).where(eq(schema.organizations.id, orgId));
  return true;
}

/**
 * Seats are a cap, not a meter: the plan price is flat and this is what decides whether one more
 * person may come in. Pending invites count, otherwise an admin could issue ten invites against
 * two seats and every one of them would still be able to accept.
 */
export async function seatUsage(orgId: string): Promise<{ members: number; pending: number }> {
  const [members] = await db
    .select({ value: count() })
    .from(schema.members)
    .where(eq(schema.members.orgId, orgId));
  const [pending] = await db
    .select({ value: count() })
    .from(schema.invites)
    .where(and(eq(schema.invites.orgId, orgId), eq(schema.invites.status, "pending")));
  return { members: members?.value ?? 0, pending: pending?.value ?? 0 };
}
