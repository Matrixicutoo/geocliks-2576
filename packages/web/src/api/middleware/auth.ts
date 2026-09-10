import { ORPCError } from "@orpc/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { base } from "../__core/app";
import { auth } from "../auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id, random, slugify } from "../lib/ids";
import { loadPlans } from "../lib/plans";
import { SUPPORT_EMAIL } from "../lib/support";
import { defaultOrgName } from "../lib/workspaces";

export type Role = "owner" | "admin" | "manager" | "dispatcher" | "driver" | "field";

/**
 * Roles are a ladder for SENIORITY, plus a separate check for which PRODUCT you belong to.
 *
 * The ladder (`RANK`, read only by `requireRole`) answers "how much authority": manager and
 * above run the whole workspace, `dispatcher` sits below them so someone can run the delivery
 * board (build runs, add stops, assign drivers, start and stop them) without inheriting the
 * manager's reach over projects, templates, messages, billing and the roster.
 *
 * `driver` and `field` are the two crew roles and are deliberately PEERS at rank 1 — neither
 * outranks the other, they simply work on different products. Seniority alone therefore cannot
 * decide access: a driver must never reach the job-photo side and a field member must never
 * reach the delivery side, even though both sit at the same rung. That is what
 * `canUseDelivery` / `canUseField` are for, and every product gate must consult them INSTEAD OF
 * (or as well as) `requireRole`. Never gate a delivery route on `requireRole(role, "field")` —
 * that passes for a field member.
 */
const RANK: Record<Role, number> = {
  owner: 5,
  admin: 4,
  manager: 3,
  dispatcher: 2,
  driver: 1,
  field: 1,
};

/**
 * Which product each role belongs to. These are ALLOWLISTS on purpose: a role added later gets
 * no access to either side until it is named here, which fails closed rather than open.
 */
const DELIVERY_ROLES: readonly Role[] = ["owner", "admin", "manager", "dispatcher", "driver"];
const FIELD_ROLES: readonly Role[] = ["owner", "admin", "manager", "dispatcher", "field"];

/** True when the role includes the delivery system — routes, stops, dispatch. */
export function canUseDelivery(role: Role): boolean {
  return DELIVERY_ROLES.includes(role);
}

/** True when the role includes the field system — projects and job-site photos. */
export function canUseField(role: Role): boolean {
  return FIELD_ROLES.includes(role);
}

/** Guard for any delivery-side endpoint. Refuses a `field` member. */
export function requireDelivery(role: Role): void {
  if (!canUseDelivery(role)) {
    throw new ORPCError("FORBIDDEN", {
      message: "Your role does not include the delivery system",
    });
  }
}

/** Guard for any field-side endpoint. Refuses a `driver`. */
export function requireField(role: Role): void {
  if (!canUseField(role)) {
    throw new ORPCError("FORBIDDEN", {
      message: "Your role does not include the job photo system",
    });
  }
}

/** True when the role is manager or above — the "runs the whole workspace" tier. */
export function isManager(role: Role): boolean {
  return RANK[role] >= RANK.manager;
}

export type StaffRole = "superadmin" | "admin";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null | undefined;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Warm the DB-backed plan registry so synchronous planOf() reflects admin edits.
void loadPlans().catch(() => {});

/** Optional auth — `context.user` is the session user or null. */
export const withUser = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });
  return next({
    context: { user: session?.user ?? null, session: session?.session ?? null },
  });
});

/** The first platform operator is granted automatically from the env allowlist. */
async function ensureSeedStaff(user: { id: string; email: string }) {
  const seedEmail = (process.env.PLATFORM_SUPERADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!seedEmail || user.email.trim().toLowerCase() !== seedEmail) return;
  const existing = await db
    .select({ id: schema.staff.id })
    .from(schema.staff)
    .where(eq(schema.staff.userId, user.id))
    .limit(1);
  if (existing.length > 0) return;
  await db
    .insert(schema.staff)
    .values({ id: id("stf"), userId: user.id, role: "superadmin", createdBy: "system" })
    .onConflictDoNothing();
}

export async function staffRoleOf(userId: string): Promise<StaffRole | null> {
  const rows = await db
    .select({ role: schema.staff.role })
    .from(schema.staff)
    .where(eq(schema.staff.userId, userId))
    .limit(1);
  return (rows[0]?.role as StaffRole | undefined) ?? null;
}

async function assertNotSuspended(userId: string) {
  const rows = await db
    .select({ suspended: schema.userStatus.suspended, reason: schema.userStatus.reason })
    .from(schema.userStatus)
    .where(eq(schema.userStatus.userId, userId))
    .limit(1);
  if (rows[0]?.suspended) {
    throw new ORPCError("FORBIDDEN", {
      message: rows[0].reason
        ? `Account suspended: ${rows[0].reason}`
        : `This account has been suspended. Contact ${SUPPORT_EMAIL}.`,
    });
  }
}

/** Resolve an impersonation grant when the caller is staff and sends the header. */
async function resolveImpersonation(
  actorId: string,
  headers: Headers,
): Promise<SessionUser | null> {
  const token = headers.get("x-geocliks-impersonate");
  if (!token) return null;
  if (!(await staffRoleOf(actorId))) return null;

  const rows = await db
    .select()
    .from(schema.impersonations)
    .where(eq(schema.impersonations.token, token))
    .limit(1);
  const grant = rows[0];
  if (!grant || grant.actorId !== actorId) return null;
  if (grant.expiresAt.getTime() < Date.now()) return null;

  const users = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.id, grant.userId))
    .limit(1);
  const target = users[0];
  return target ? (target as unknown as SessionUser) : null;
}

/** Create a short-lived impersonation grant. Returns the token for the client header. */
export async function createImpersonation(actorId: string, userId: string) {
  const token = random(28).toLowerCase();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await db
    .insert(schema.impersonations)
    .values({ id: id("imp"), token, actorId, userId, expiresAt });
  return { token, expiresAt };
}

/** Protected procedures — rejects unauthenticated and suspended callers. */
export const authed = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });
  if (!session) throw new ORPCError("UNAUTHORIZED");
  await ensureSeedStaff(session.user);

  const impersonated = await resolveImpersonation(session.user.id, context.headers);
  const user = impersonated ?? (session.user as unknown as SessionUser);
  if (!impersonated) await assertNotSuspended(user.id);

  return next({
    context: {
      user,
      session: session.session,
      actor: session.user as unknown as SessionUser,
      impersonating: impersonated ? impersonated.id : null,
    },
  });
});

/** Platform operator procedures — GeoCliks staff only, never impersonated. */
export const staffProc = authed.use(async ({ context, next }) => {
  const role = await staffRoleOf(context.actor.id);
  if (!role) throw new ORPCError("FORBIDDEN", { message: "Platform staff access required" });
  return next({ context: { staffRole: role, user: context.actor } });
});

export function requireSuperadmin(role: StaffRole) {
  if (role !== "superadmin") {
    throw new ORPCError("FORBIDDEN", { message: "Superadmin access required" });
  }
}

/** Audit trail — every admin console mutation writes one row. */
export async function logAdmin(
  actorId: string,
  action: string,
  target?: string | null,
  detail?: string | null,
) {
  await db
    .insert(schema.adminEvents)
    .values({ id: id("aev"), actorId, action, target: target ?? null, detail: detail ?? null });
}

/**
 * Every signed-in user belongs to exactly one workspace in this app. On first call we
 * create their organization, membership, and the default watermark templates.
 */
export const orgProc = authed.use(async ({ context, next }) => {
  const userId = context.user.id;

  const existing = await db
    .select()
    .from(schema.members)
    .where(eq(schema.members.userId, userId))
    .orderBy(asc(schema.members.createdAt));

  if (existing.length > 0) {
    const orgs = await db
      .select()
      .from(schema.organizations)
      .where(
        inArray(
          schema.organizations.id,
          existing.map((m) => m.orgId),
        ),
      );
    const byId = new Map(orgs.map((o) => [o.id, o]));
    // Belonging to more than one workspace has to resolve the same way every request:
    // 1. the workspace they were deliberately put into (accepting a crew invite stamps
    //    `activeAt`) — otherwise an invitee whose personal workspace survived would be dragged
    //    back into it forever, because owning it used to outrank everything;
    // 2. then a workspace they own;
    // 3. then the one they joined first.
    const ranked = existing
      .filter((m) => byId.has(m.orgId))
      .sort((a, b) => {
        const aa = a.activeAt ? a.activeAt.getTime() : 0;
        const ba = b.activeAt ? b.activeAt.getTime() : 0;
        if (aa !== ba) return ba - aa;
        const ao = byId.get(a.orgId)!.ownerId === userId ? 0 : 1;
        const bo = byId.get(b.orgId)!.ownerId === userId ? 0 : 1;
        if (ao !== bo) return ao - bo;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
    const member = ranked[0];
    const org = member ? byId.get(member.orgId) : undefined;
    if (!member || !org) throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });
    return next({ context: { org, role: member.role as Role, member } });
  }

  // The dashboard fires several queries at once on first load, so provisioning has to be
  // race-safe: derive the ids from the user id and let conflicting inserts no-op, then read back
  // whichever row won.
  const orgId = `org_${userId}`;
  const memberId = `mem_${userId}`;
  const base = slugify(context.user.name || context.user.email.split("@")[0] || "team");
  await db
    .insert(schema.organizations)
    .values({
      id: orgId,
      name: defaultOrgName(context.user),
      slug: `${base}-${orgId.slice(-4).toLowerCase()}`,
      plan: "free",
      seats: 1,
      ownerId: userId,
    })
    .onConflictDoNothing();

  await db
    .insert(schema.members)
    .values({ id: memberId, orgId, userId, role: "owner", title: "Owner" })
    .onConflictDoNothing();

  const [org] = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.id, orgId))
    .limit(1);
  const [member] = await db
    .select()
    .from(schema.members)
    .where(eq(schema.members.id, memberId))
    .limit(1);
  if (!org || !member) throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const templates = await db
    .select({ id: schema.watermarkTemplates.id })
    .from(schema.watermarkTemplates)
    .where(eq(schema.watermarkTemplates.orgId, orgId))
    .limit(1);
  if (templates.length > 0) {
    return next({ context: { org, role: member.role as Role, member } });
  }

  await db.insert(schema.watermarkTemplates).values([
    {
      id: id("tpl"),
      orgId,
      name: "Classic",
      layout: "classic",
      fields: ["time", "coords", "address", "project"],
      isDefault: true,
    },
    {
      id: id("tpl"),
      orgId,
      name: "Compact",
      layout: "compact",
      fields: ["time", "coords"],
    },
    {
      id: id("tpl"),
      orgId,
      name: "Detailed",
      layout: "detailed",
      fields: ["time", "coords", "address", "project", "code", "note", "weather"],
    },
    {
      id: id("tpl"),
      orgId,
      name: "Branded",
      layout: "branded",
      showLogo: true,
      companyLine: org!.name,
      fields: ["time", "coords", "address", "project", "company"],
    },
  ]);

  return next({ context: { org: org!, role: "owner" as Role, member: member! } });
});

/**
 * Product-scoped procedures. Prefer these over calling the `require*` guards by hand: swapping
 * `orgProc` for one of these gates a whole router uniformly, so a new endpoint added later
 * inherits the gate instead of being forgotten.
 *
 * Note that `photos` deliberately does NOT use `fieldProc`. Proof-of-delivery is a photo, so a
 * driver has to be able to create and read photos even though they have no field access — that
 * router is mixed and is gated per endpoint instead.
 */

/** Field side — projects and job-site photos. Refuses a `driver`. */
export const fieldProc = orgProc.use(async ({ context, next }) => {
  requireField(context.role);
  return next();
});

/** Delivery side — routes, stops, dispatch. Refuses a `field` member. */
export const deliveryProc = orgProc.use(async ({ context, next }) => {
  requireDelivery(context.role);
  return next();
});

export function requireRole(role: Role, min: Role) {
  if (RANK[role] < RANK[min]) {
    throw new ORPCError("FORBIDDEN", { message: `Requires ${min} access or above` });
  }
}

/** Field members only see projects they are assigned to. */
/**
 * Who a field member is allowed to see in their workspace: strictly the people assigned to the
 * same projects, plus themselves. There is no automatic exception for managers, admins or the
 * owner — they appear only when they are on one of those projects too.
 * Returns null for owner/admin/manager, who legitimately see the whole roster.
 */
export async function visibleTeammates(
  orgId: string,
  userId: string,
  role: Role,
): Promise<{ userIds: Set<string>; projectIds: string[] } | null> {
  const projectIds = await visibleProjectIds(orgId, userId, role);
  if (!projectIds) return null;
  const rows =
    projectIds.length === 0
      ? []
      : await db
          .select({ userId: schema.projectAssignments.userId })
          .from(schema.projectAssignments)
          .where(
            and(
              eq(schema.projectAssignments.orgId, orgId),
              inArray(schema.projectAssignments.projectId, projectIds),
            ),
          );
  const userIds = new Set(rows.map((r) => r.userId));
  userIds.add(userId);
  return { userIds, projectIds };
}

export async function visibleProjectIds(
  orgId: string,
  userId: string,
  role: Role,
): Promise<string[] | null> {
  // A driver has NO job photo system, so they get an EMPTY project list rather than the
  // unrestricted `null`. That leaves them exactly their own unfiled captures — the
  // proof-of-delivery shots they took themselves — and nothing filed under anyone's job.
  // Returning `null` here is what let a driver's Teamspace render the whole workspace's
  // photos even though the nav link was hidden.
  if (role === "driver") return [];
  if (role !== "field") return null;
  const rows = await db
    .select({ projectId: schema.projectAssignments.projectId })
    .from(schema.projectAssignments)
    .where(
      and(eq(schema.projectAssignments.orgId, orgId), eq(schema.projectAssignments.userId, userId)),
    );
  return rows.map((r) => r.projectId);
}
