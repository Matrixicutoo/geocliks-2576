import { and, asc, eq, inArray } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../database";
import * as schema from "../database/schema";
import type { Role } from "../middleware/auth";
import { effectivePlanId } from "../lib/trial";

/**
 * Who is asking the assistant, if anyone.
 *
 * The chat endpoint is reachable without a session — it is the bubble on the marketing site
 * too — so everything session-scoped hangs off this. Read-only on purpose: unlike `orgProc`
 * it never creates a workspace or a membership, because a stranger asking the public bubble a
 * question must not leave rows behind.
 */
export type Viewer = {
  userId: string;
  name: string | null;
  orgId: string;
  orgName: string;
  role: Role;
  /** The workspace's plan key, because what a tool may do depends on it — see `exportReport`. */
  plan: string;
};

export async function viewerOf(request: Request): Promise<Viewer | null> {
  let session: Awaited<ReturnType<typeof auth.api.getSession>> = null;
  try {
    // The mobile app sends a bearer; the web app sends its cookie. Better Auth reads either
    // one off the headers, so both paths land here.
    session = await auth.api.getSession({ headers: request.headers });
  } catch {
    return null;
  }
  if (!session?.user) return null;

  const memberships = await db
    .select()
    .from(schema.members)
    .where(eq(schema.members.userId, session.user.id))
    .orderBy(asc(schema.members.createdAt));
  if (memberships.length === 0) return null;

  // The same resolution the rest of the app uses: the workspace someone was deliberately put
  // into wins over a personal one that happens to be older.
  const chosen = memberships.find((m) => m.activeAt) ?? memberships[0];
  if (!chosen) return null;

  const [org] = await db
    .select({
      id: schema.organizations.id,
      name: schema.organizations.name,
      plan: schema.organizations.plan,
      trialPlan: schema.organizations.trialPlan,
      trialEndsAt: schema.organizations.trialEndsAt,
    })
    .from(schema.organizations)
    .where(inArray(schema.organizations.id, [chosen.orgId]));
  if (!org) return null;

  const [suspended] = await db
    .select({ suspended: schema.userStatus.suspended })
    .from(schema.userStatus)
    .where(and(eq(schema.userStatus.userId, session.user.id)));
  if (suspended?.suspended) return null;

  return {
    userId: session.user.id,
    name: session.user.name ?? null,
    orgId: org.id,
    orgName: org.name,
    role: chosen.role as Role,
    // The plan that is included right now, trial and all — the chat's export gate reads this and
    // must not refuse a format the workspace can plainly use in the UI.
    plan: effectivePlanId(org),
  };
}
