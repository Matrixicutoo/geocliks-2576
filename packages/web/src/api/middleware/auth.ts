import { ORPCError } from "@orpc/server";
import { and, asc, eq, inArray, or } from "drizzle-orm";
import { base } from "../__core/app";
import { auth } from "../auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id, random, slugify } from "../lib/ids";
import { loadPlans, STAFF_PLAN_ID } from "../lib/plans";
import { SUPPORT_EMAIL } from "../lib/support";
import { effectivePlanId, NO_TRIAL, trialStatus, type TrialStatus } from "../lib/trial";
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

type OrgRow = typeof schema.organizations.$inferSelect;

/**
 * Folds a running trial into the workspace every endpoint sees.
 *
 * `context.org.plan` is the plan that is INCLUDED RIGHT NOW — the trial plan for a workspace
 * inside its free week, the paid plan otherwise. Every `planOf(context.org.plan)` gate therefore
 * honours the trial without knowing one exists, and stops honouring it the moment the clock
 * passes, with no expiry job to run.
 *
 * `context.paidPlan` is the untouched column: the plan actually subscribed to. Billing must use
 * that one — it is what "your current plan" means on the billing screen, and what a plan change
 * is compared against. Handing billing the trial plan would tell someone they already own
 * Business and make the upgrade button a no-op.
 *
 * A workspace owned by a platform operator resolves to the staff plan instead of whatever its
 * column says: every feature of both systems, no limits, no trial. It is resolved per request
 * from the `staff` table rather than written into the row, so revoking someone's staff role
 * takes their workspace straight back to the plan it actually pays for, with nothing to undo.
 */
async function resolveOrg(
  org: OrgRow,
): Promise<{ org: OrgRow; paidPlan: string; trial: TrialStatus; staffOrg: boolean }> {
  const staffOrg = (await staffRoleOf(org.ownerId)) !== null;
  const plan = staffOrg ? STAFF_PLAN_ID : effectivePlanId(org);
  return {
    org: plan === org.plan ? org : { ...org, plan },
    paidPlan: org.plan,
    trial: staffOrg ? NO_TRIAL : trialStatus(org),
    staffOrg,
  };
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
    return next({ context: { ...(await resolveOrg(org)), role: member.role as Role, member } });
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
    return next({ context: { ...(await resolveOrg(org)), role: member.role as Role, member } });
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

  return next({ context: { ...(await resolveOrg(org!)), role: "owner" as Role, member: member! } });
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

/**
 * Why a crew member can see someone: the office person who let them in, or the one who hands
 * them work. Only ever set for a driver, whose visible list is built from these two facts
 * rather than from a shared project.
 */
export type ContactReason = "inviter" | "dispatcher";

export type VisibleTeammates = {
  userIds: Set<string>;
  projectIds: string[];
  /** Populated for a driver, null for a field member whose visibility comes from projects. */
  reasons: Map<string, ContactReason> | null;
};

/**
 * The office people a driver is entitled to see and message.
 *
 * A driver has no projects, so the project-assignment rule that scopes a field member leaves him
 * with nobody at all — he could not reach the dispatcher who put him on the road. His list is
 * built from the two relationships that actually exist in the delivery product instead:
 *
 *  - the dispatcher whose invite he joined the workspace on, and
 *  - whoever put him on a route he is currently holding: the person who built it, plus every
 *    actor on an `assigned` event for it, because handing a run over is not always done by the
 *    person who created it.
 *
 * Nothing here widens what he can DO. It only names people, and `team.list` still filters the
 * result against the live membership rows, so somebody who has since left the workspace drops
 * off by itself.
 */
async function driverContacts(orgId: string, userId: string): Promise<Map<string, ContactReason>> {
  const reasons = new Map<string, ContactReason>();

  // The invite he came in on. `acceptedBy` is the reliable side; the email match is the
  // fallback for invites accepted before that column existed. An open QR invite has no email,
  // which is why the column had to exist at all.
  const [me] = await db
    .select({ email: schema.user.email })
    .from(schema.user)
    .where(eq(schema.user.id, userId));
  const invited = await db
    .select({ invitedBy: schema.invites.invitedBy })
    .from(schema.invites)
    .where(
      and(
        eq(schema.invites.orgId, orgId),
        or(
          eq(schema.invites.acceptedBy, userId),
          me?.email
            ? and(eq(schema.invites.status, "accepted"), eq(schema.invites.email, me.email))
            : undefined,
        ),
      ),
    );
  for (const row of invited) reasons.set(row.invitedBy, "inviter");

  // Routes in his hands right now. Deliberately after the invite pass: when the same person did
  // both, "dispatcher" is the label that matters to a driver looking at today's run.
  const routes = await db
    .select({ id: schema.routes.id, createdBy: schema.routes.createdBy })
    .from(schema.routes)
    .where(and(eq(schema.routes.orgId, orgId), eq(schema.routes.driverId, userId)));
  for (const route of routes) reasons.set(route.createdBy, "dispatcher");
  if (routes.length > 0) {
    const handovers = await db
      .select({ actorId: schema.routeEvents.actorId })
      .from(schema.routeEvents)
      .where(
        and(
          eq(schema.routeEvents.orgId, orgId),
          eq(schema.routeEvents.event, "assigned"),
          inArray(
            schema.routeEvents.routeId,
            routes.map((route) => route.id),
          ),
        ),
      );
    for (const row of handovers) {
      if (row.actorId) reasons.set(row.actorId, "dispatcher");
    }
  }

  // He is not his own contact, whatever the audit trail says.
  reasons.delete(userId);
  return reasons;
}

/** Field members only see projects they are assigned to. */
/**
 * Who a crew member is allowed to see in their workspace: for a field member, strictly the
 * people assigned to the same projects, plus themselves. There is no automatic exception for
 * managers, admins or the owner — they appear only when they are on one of those projects too.
 * A driver has no projects and is scoped by `driverContacts` instead.
 * Returns null for owner/admin/manager/dispatcher, who legitimately see the whole roster.
 */
export async function visibleTeammates(
  orgId: string,
  userId: string,
  role: Role,
): Promise<VisibleTeammates | null> {
  const projectIds = await visibleProjectIds(orgId, userId, role);
  if (!projectIds) return null;
  if (role === "driver") {
    const reasons = await driverContacts(orgId, userId);
    const userIds = new Set(reasons.keys());
    userIds.add(userId);
    // Still an empty project list: naming his dispatcher must not hand him anyone's job photos.
    return { userIds, projectIds, reasons };
  }
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
  return { userIds, projectIds, reasons: null };
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
