import { z } from "zod";
import QRCode from "qrcode";
import { ORPCError } from "@orpc/server";
import { and, count, eq, gt, inArray, isNull, or, sql } from "drizzle-orm";
import { base } from "../__core/app";
import type { Role } from "../middleware/auth";
import { authed, orgProc, requireRole, staffRoleOf, visibleTeammates } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id, random } from "../lib/ids";
import { planOf } from "../lib/plans";
import { effectivePlanId } from "../lib/trial";
import { dropEmptyPersonalWorkspace, seatUsage } from "../lib/workspaces";
import { avatarUrl } from "./account";
import { inviteEmail } from "../services/email-templates";
import { auth } from "../auth";
import { emailConfigured } from "../services/email";

const roleEnum = z.enum(["owner", "admin", "manager", "dispatcher", "driver", "field"]);

/** `invites.projectIds` is a JSON array in one text column; never trust its shape. */
function parseProjectIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Admin (and owner) is a GeoCliks-granted tier, not something a workspace hands out to itself.
 * A workspace owner runs their own crew — managers, dispatchers, drivers, field — but promoting
 * anyone to admin goes through the platform console, so support can never be socially
 * engineered into existence from inside a customer account.
 *
 * The check runs on the real signed-in operator (`actor`), not the impersonated user, so a
 * superadmin helping a customer over the shoulder still has it.
 */
async function assertMayGrant(role: string, actorId: string) {
  if (role !== "admin" && role !== "owner") return;
  const staffRole = await staffRoleOf(actorId);
  if (staffRole !== "superadmin") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only GeoCliks can grant admin access. Contact support to have an admin added.",
    });
  }
}

/**
 * Who may hand out an invite at all.
 *
 * The admin tier, plus dispatchers — a dispatcher is the one standing next to a new driver on
 * their first morning, and making them wait for an admin to send the invite is how a truck sits
 * in the yard. What a dispatcher may GRANT is far narrower than what they may SEND: see
 * `assertMayInviteRole` below.
 */
function requireInviter(role: Role) {
  if (role === "dispatcher") return;
  requireRole(role, "admin");
}

/**
 * Which role the inviter may put on the invite. A dispatcher grows their own crew and nothing
 * else: `driver`, never the office (manager, dispatcher) and never field crew. This runs on the
 * server because the picker only hiding the other roles is presentation, not a guard.
 */
function assertMayInviteRole(actorRole: Role, role: string) {
  if (actorRole === "dispatcher" && role !== "driver") {
    throw new ORPCError("FORBIDDEN", {
      message: "Dispatchers can only invite drivers. Ask an admin for any other role.",
    });
  }
}

/**
 * The link a crew member opens (or scans) to join. It has to be an absolute, public URL because it
 * goes into emails and onto printed QR codes.
 */
function inviteUrl(code: string): string {
  const base = (process.env.WEBSITE_URL ?? "http://localhost:4200").replace(/\/+$/, "");
  return `${base}/join/${code}`;
}

/** How long a fresh invite stays redeemable. */
const INVITE_TTL_DAYS = 7;

function inviteExpiry(): Date {
  return new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * A pending invite is only redeemable until it expires. `expiresAt` is null on rows created
 * before invites had a lifetime; those stay redeemable rather than being killed retroactively
 * under someone who is mid-signup.
 */
function inviteExpired(invite: { expiresAt: Date | null }): boolean {
  return invite.expiresAt !== null && invite.expiresAt.getTime() <= Date.now();
}

/**
 * Everything that happens once we know WHICH user is joining WHICH invite: seat and plan checks,
 * the membership row, the pre-assigned projects, burning the invite, and dropping the empty
 * personal workspace a fresh account arrives with.
 *
 * One implementation on purpose. Two callers redeem an invite — `acceptInvite` (already signed in)
 * and `claimInvite` (came through an invite link with no account) — and the plan/seat re-checks
 * here are the ones that stop a workspace going over its paid seats. A second copy would drift,
 * and the copy that drifted would be the one letting people in for free.
 */
async function attachToWorkspace(
  invite: typeof schema.invites.$inferSelect,
  userId: string,
): Promise<{
  ok: true;
  orgId: string;
  workspace: string;
  role: string;
  droppedOwnWorkspace: boolean;
  assignedProjects: number;
}> {
  const [org] = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.id, invite.orgId));
  if (!org) throw new ORPCError("NOT_FOUND");

  const [existing] = await db
    .select()
    .from(schema.members)
    .where(and(eq(schema.members.orgId, invite.orgId), eq(schema.members.userId, userId)));
  const joinedAt = new Date();
  if (!existing) {
    // The plan is re-checked here, not just at invite time: the workspace may have downgraded,
    // or filled its last seat, between sending the invite and this click.
    const plan = planOf(effectivePlanId(org));
    if (!plan.limits.teamspace) {
      throw new ORPCError("PAYMENT_REQUIRED", {
        status: 402,
        message: `${org.name} is no longer on a plan that includes Teamspace. Ask the workspace owner to upgrade, then open this link again.`,
      });
    }
    const seats = await seatUsage(invite.orgId);
    if (seats.members >= plan.limits.seats) {
      throw new ORPCError("PAYMENT_REQUIRED", {
        status: 402,
        message: `${org.name} has no seats left. Ask the workspace owner to free a seat or upgrade, then open this link again.`,
      });
    }
    await db.insert(schema.members).values({
      id: id("mem"),
      orgId: invite.orgId,
      userId,
      role: invite.role,
      activeAt: joinedAt,
    });
  } else {
    await db
      .update(schema.members)
      .set({ activeAt: joinedAt })
      .where(eq(schema.members.id, existing.id));
  }
  // Pre-assigned projects become real assignments now that we know the user id, so a field
  // member never opens the capture screen with nothing but "Unassigned" to pick.
  const preAssigned = parseProjectIds(invite.projectIds);
  if (preAssigned.length) {
    const live = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(and(eq(schema.projects.orgId, invite.orgId), inArray(schema.projects.id, preAssigned)));
    if (live.length) {
      await db
        .insert(schema.projectAssignments)
        .values(
          live.map((project) => ({
            id: id("asg"),
            orgId: invite.orgId,
            projectId: project.id,
            userId,
          })),
        )
        .onConflictDoNothing();
    }
  }

  await db.update(schema.invites).set({ status: "accepted" }).where(eq(schema.invites.id, invite.id));

  // Someone who only signed up to accept a crew invite should land in the workspace that invited
  // them - not in the empty personal one that sign-up auto-provisions.
  const droppedOwnWorkspace = await dropEmptyPersonalWorkspace(userId, invite.orgId);
  return {
    ok: true,
    orgId: invite.orgId,
    workspace: org.name,
    role: invite.role,
    droppedOwnWorkspace,
    assignedProjects: preAssigned.length,
  };
}

export const team = {
  list: orgProc.handler(async ({ context }) => {
    // Field crews are not workspace managers. They see the people they actually work with - the
    // crew on their own projects - plus the owner/admins/managers who dispatch them, so the
    // "Message" button still reaches a supervisor. Never the whole roster.
    const teammates = await visibleTeammates(context.org.id, context.user.id, context.role);
    const rows = await db
      .select({
        member: schema.members,
        user: {
          id: schema.user.id,
          name: schema.user.name,
          email: schema.user.email,
          image: schema.user.image,
        },
      })
      .from(schema.members)
      .leftJoin(schema.user, eq(schema.user.id, schema.members.userId))
      .where(eq(schema.members.orgId, context.org.id));

    // A field member's counts only reflect the projects they are on, never workspace totals.
    let photoCounts: { userId: string; value: number }[] = [];
    if (!teammates || teammates.projectIds.length > 0) {
      photoCounts = await db
        .select({ userId: schema.photos.userId, value: count() })
        .from(schema.photos)
        .where(
          teammates
            ? and(
                eq(schema.photos.orgId, context.org.id),
                inArray(schema.photos.projectId, teammates.projectIds),
              )
            : eq(schema.photos.orgId, context.org.id),
        )
        .groupBy(schema.photos.userId);
    }
    const byUser = new Map(photoCounts.map((r) => [r.userId, r.value]));

    // Strictly literal: a field member sees only the people actually assigned to the same
    // projects, plus themselves. Supervisors show up only when they are on one of those projects.
    const visible = teammates
      ? rows.filter((row) => teammates.userIds.has(row.member.userId))
      : rows;

    // `user.image` is a bare storage key. Handing it to the client raw is why the roster only
    // ever drew initials - the browser had nothing loadable to point an <img> at.
    return Promise.all(
      visible.map(async (row) => ({
        ...row.member,
        user: row.user ? { ...row.user, image: await avatarUrl(row.user.image) } : row.user,
        photoCount: byUser.get(row.member.userId) ?? 0,
      })),
    );
  }),

  invites: orgProc.handler(async ({ context }) => {
    // Pending invites are a seat/management detail; field crews get no invite controls at all.
    if (context.role === "field") return [] as (typeof schema.invites.$inferSelect)[];
    // An expired invite is no longer actionable and no longer holds a seat, so it drops off the
    // list rather than sitting there looking live.
    return db
      .select()
      .from(schema.invites)
      .where(
        and(
          eq(schema.invites.orgId, context.org.id),
          eq(schema.invites.status, "pending"),
          or(isNull(schema.invites.expiresAt), gt(schema.invites.expiresAt, new Date())),
        ),
      );
  }),

  invite: orgProc
    .input(
      z.object({
        /**
         * Omitted for an open invite — a QR handed over in person, with no address to type and
         * so no email to send. Everything else about it behaves the same.
         */
        email: z.string().email().optional(),
        role: roleEnum.default("field"),
        /** Projects the invitee should already be assigned to when they first open the app. */
        projectIds: z.array(z.string()).default([]),
      }),
    )
    .handler(async ({ input, context }) => {
      requireInviter(context.role);
      assertMayInviteRole(context.role, input.role);
      await assertMayGrant(input.role, context.actor.id);
      const plan = planOf(context.org.plan);
      if (!plan.limits.teamspace) {
        throw new ORPCError("PAYMENT_REQUIRED", {
          status: 402,
          message: "Teamspace and invites are part of the Business plan.",
        });
      }
      // Pending invites hold a seat too, otherwise ten invites could be issued against two
      // seats and every one of them would still be able to accept.
      const seats = await seatUsage(context.org.id);
      if (seats.members + seats.pending >= plan.limits.seats) {
        throw new ORPCError("PAYMENT_REQUIRED", {
          status: 402,
          message:
            seats.pending > 0
              ? `No seats left on this plan (${seats.members} joined, ${seats.pending} invite${seats.pending === 1 ? "" : "s"} pending, ${plan.limits.seats} seat${plan.limits.seats === 1 ? "" : "s"} total). Revoke a pending invite or upgrade.`
              : "No seats left on this plan.",
        });
      }
      // Only projects that really belong to this workspace are stored, so a stale or
      // hand-crafted id can never grant access to another workspace's job.
      const ownProjects = input.projectIds.length
        ? await db
            .select({ id: schema.projects.id, name: schema.projects.name })
            .from(schema.projects)
            .where(
              and(
                eq(schema.projects.orgId, context.org.id),
                inArray(schema.projects.id, input.projectIds),
              ),
            )
        : [];
      const projectIds = ownProjects.map((r) => r.id);

      const [invite] = await db
        .insert(schema.invites)
        .values({
          id: id("inv"),
          orgId: context.org.id,
          email: input.email ? input.email.toLowerCase() : null,
          role: input.role,
          code: random(10).toLowerCase(),
          projectIds: projectIds.length ? JSON.stringify(projectIds) : null,
          invitedBy: context.user.id,
          expiresAt: inviteExpiry(),
        })
        .returning();
      if (!invite) throw new ORPCError("INTERNAL_SERVER_ERROR");

      // An open invite is handed over in person — there is no address to mail it to, and the
      // caller shows the QR instead. The invite row is the source of truth either way; email is
      // a best-effort notification on top of it.
      const delivery = invite.email
        ? await inviteEmail({
            to: invite.email,
            workspace: context.org.name,
            inviterName: context.user.name || context.user.email,
            role: invite.role,
            code: invite.code,
            projects: ownProjects.map((r) => r.name),
          })
        : null;
      return {
        ...invite,
        url: inviteUrl(invite.code),
        emailSent: delivery ? delivery.ok : false,
        emailReason: !delivery || delivery.ok ? undefined : (delivery.reason ?? "failed"),
        emailConfigured: emailConfigured(),
      };
    }),

  /** Public lookup so an invite link can show who is inviting whom before the person signs in. */
  inviteInfo: base.input(z.object({ code: z.string().min(4) })).handler(async ({ input }) => {
    const [invite] = await db
      .select()
      .from(schema.invites)
      .where(eq(schema.invites.code, input.code.trim().toLowerCase()));
    if (!invite || invite.status !== "pending") throw new ORPCError("NOT_FOUND");
    // Expiry answers the same way a revoked code does. The join screen offers "ask for a fresh
    // invite", which is the only useful move in both cases.
    if (inviteExpired(invite)) {
      throw new ORPCError("NOT_FOUND", {
        message: "This invite expired. Ask the person who sent it for a fresh one.",
      });
    }
    const [org] = await db
      .select({ id: schema.organizations.id, name: schema.organizations.name })
      .from(schema.organizations)
      .where(eq(schema.organizations.id, invite.orgId));
    const [inviter] = await db
      .select({ name: schema.user.name, email: schema.user.email })
      .from(schema.user)
      .where(eq(schema.user.id, invite.invitedBy));
    // Smart routing: an invited person who already has a GeoCliks account is sent to the
    // sign-in page instead of sign-up. Only the holder of a live invite code reaches this, and
    // the response already carries the invited email, so this leaks nothing new. An open invite
    // names nobody, so there is no account to look up and the redeemer types their own address.
    const [existing] = invite.email
      ? await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(eq(sql`lower(${schema.user.email})`, invite.email.trim().toLowerCase()))
      : [];

    return {
      email: invite.email,
      role: invite.role,
      workspace: org?.name ?? "a GeoCliks workspace",
      inviterName: inviter?.name || inviter?.email || "A teammate",
      hasAccount: Boolean(existing),
      /** Null email means anyone holding the code may redeem it. */
      open: invite.email === null,
      expiresAt: invite.expiresAt,
    };
  }),

  /**
   * One-tap redemption for somebody who has no account yet: they type a name and they are in.
   *
   * The invite link IS the credential here, which is a deliberate trade. The alternative — mail
   * them a six-digit code like every other sign-in — costs a crew member standing in a muddy yard
   * an inbox round trip on a phone with one bar, and buys very little: whoever opened the link
   * already holds a single-use secret that a manager handed them, and the only thing they can
   * reach with it is the one workspace that issued it. An open QR invite is the same trade the QR
   * already makes — the manager showed the square to the person standing in front of them.
   *
   * The account this creates is marked `emailVerified` by the OTP plugin even though no code was
   * typed, so it is worth being precise about what that flag now means on an invited account: the
   * *inviter* asserted the address, not the mailbox holder. For an emailed invite that is exactly
   * as strong as a code (the code would have gone to that same address). For an open invite the
   * address is typed by the redeemer and unproven — acceptable because the address on an open
   * invite is a contact detail, not the thing that granted access.
   *
   * The session is minted through Better Auth rather than by writing a session row here:
   * `createVerificationOTP` is server-only and hands back the code without mailing it, and
   * `signInEmailOTP` then spends it, creating the user on first sight. So this path goes through
   * exactly the same account-creation, session and cookie machinery as a normal sign-in, instead
   * of a second hand-rolled one that would quietly miss a step.
   */
  claimInvite: base
    .input(
      z.object({
        code: z.string().min(4),
        name: z.string().trim().min(1).max(80),
        /**
         * Only read for an OPEN invite, which names nobody. An emailed invite ignores whatever
         * arrives here and uses the invited address — otherwise the link would be a way to
         * attach the invited seat to any address the holder liked.
         */
        email: z.string().email().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const code = input.code.trim().toLowerCase();
      const [invite] = await db.select().from(schema.invites).where(eq(schema.invites.code, code));
      if (!invite || invite.status !== "pending") throw new ORPCError("NOT_FOUND");
      if (inviteExpired(invite)) {
        throw new ORPCError("FORBIDDEN", {
          status: 403,
          message: "This invite expired. Ask the person who sent it for a fresh one.",
        });
      }

      const email = (invite.email ?? input.email ?? "").trim().toLowerCase();
      if (!email) {
        throw new ORPCError("BAD_REQUEST", {
          message: "This invite needs an email address so the workspace can reach you.",
        });
      }

      /**
       * An address that already has an account does NOT come through here. Handing a session for
       * an existing account to whoever holds an invite link would turn a forwarded link into a
       * way into somebody else's account — including the manager's own, if they mistyped the
       * invite to themselves. That person signs in with a code and accepts the invite from
       * inside, which is what `acceptInvite` is for.
       */
      const [existingUser] = await db
        .select({ id: schema.user.id })
        .from(schema.user)
        .where(eq(sql`lower(${schema.user.email})`, email));
      if (existingUser) {
        throw new ORPCError("CONFLICT", {
          status: 409,
          message: `${email} already has a GeoCliks account. Sign in with a code sent to that address, then open this invite link again.`,
        });
      }

      const otp = await auth.api.createVerificationOTP({
        body: { email, type: "sign-in" },
      });
      const session = await auth.api.signInEmailOTP({
        body: { email, otp, name: input.name.trim() },
      });
      if (!session?.token) throw new ORPCError("INTERNAL_SERVER_ERROR");

      const joined = await attachToWorkspace(invite, session.user.id);
      /**
       * The bearer goes back in the body because the clients that need it most cannot read a
       * cookie: the phone app keeps its session as a bearer in SecureStore, and the web preview
       * runs in a partitioned iframe where the SameSite cookie is dropped. Both call
       * `setAuthToken` with this.
       */
      return { ...joined, token: session.token, email };
    }),

  /** Signed-in acceptance: joins the inviting workspace and marks the invite used. */
  acceptInvite: authed
    .input(z.object({ code: z.string().min(4) }))
    .handler(async ({ input, context }) => {
      const code = input.code.trim().toLowerCase();
      const [invite] = await db.select().from(schema.invites).where(eq(schema.invites.code, code));
      if (!invite || invite.status !== "pending") throw new ORPCError("NOT_FOUND");
      if (inviteExpired(invite)) {
        throw new ORPCError("FORBIDDEN", {
          status: 403,
          message: "This invite expired. Ask the person who sent it for a fresh one.",
        });
      }

      // An emailed invite names one person. Without this check the code is a bearer token:
      // whoever happens to be signed in when the button is pressed joins the workspace, which
      // silently lands the wrong account (and burns a paid seat) whenever an invite link is
      // opened on a phone already signed in as somebody else, or forwarded on to a workmate.
      //
      // An open invite deliberately names nobody: it is handed over face to face, so whoever
      // redeems it first is the intended person and there is nothing to compare against.
      if (invite.email !== null) {
        const invitedEmail = invite.email.trim().toLowerCase();
        const signedInEmail = (context.user.email ?? "").trim().toLowerCase();
        if (invitedEmail !== signedInEmail) {
          throw new ORPCError("FORBIDDEN", {
            status: 403,
            message: `This invite was sent to ${invite.email}, but you are signed in as ${context.user.email}. Sign out and open the invite link again with the invited address, or ask for a fresh invite to ${context.user.email}.`,
          });
        }
      }

      return await attachToWorkspace(invite, context.user.id);
    }),

  /**
   * QR code for a pending invite, so a foreman can hold up a phone (or tape a printed square to
   * the truck) instead of dictating a ten character code.
   */
  inviteQr: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    // Whoever may send an invite has to be able to show it: a dispatcher's QR invite exists
    // only as this square until somebody scans it.
    requireInviter(context.role);
    const [invite] = await db
      .select()
      .from(schema.invites)
      .where(and(eq(schema.invites.id, input.id), eq(schema.invites.orgId, context.org.id)));
    if (!invite) throw new ORPCError("NOT_FOUND");
    const url = inviteUrl(invite.code);
    const dataUrl = await QRCode.toDataURL(url, {
      width: 512,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0d2137ff", light: "#ffffffff" },
    });
    return { url, dataUrl, code: invite.code, email: invite.email, role: invite.role };
  }),

  revokeInvite: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    requireRole(context.role, "admin");
    await db
      .update(schema.invites)
      .set({ status: "revoked" })
      .where(and(eq(schema.invites.id, input.id), eq(schema.invites.orgId, context.org.id)));
    return { ok: true };
  }),

  setRole: orgProc
    .input(z.object({ memberId: z.string(), role: roleEnum }))
    .handler(async ({ input, context }) => {
      requireRole(context.role, "admin");
      await assertMayGrant(input.role, context.actor.id);
      const [member] = await db
        .select()
        .from(schema.members)
        .where(
          and(eq(schema.members.id, input.memberId), eq(schema.members.orgId, context.org.id)),
        );
      if (!member) throw new ORPCError("NOT_FOUND");
      if (member.userId === context.org.ownerId) {
        throw new ORPCError("BAD_REQUEST", { message: "The workspace owner keeps owner access." });
      }
      const [updated] = await db
        .update(schema.members)
        .set({ role: input.role })
        .where(eq(schema.members.id, input.memberId))
        .returning();
      return updated;
    }),

  /**
   * Owners and admins can remove a member. Three people are still protected: the workspace
   * owner, yourself, and a fellow admin (only the owner can remove another admin, so two
   * admins cannot remove each other).
   *
   * Removal takes away access, not evidence: the member's photos, videos and their audit events
   * are deliberately left intact and stay in the teamspace. Only the membership row and that
   * user's project assignments are deleted.
   */
  remove: orgProc.input(z.object({ memberId: z.string() })).handler(async ({ input, context }) => {
    requireRole(context.role, "admin");
    const [member] = await db
      .select()
      .from(schema.members)
      .where(and(eq(schema.members.id, input.memberId), eq(schema.members.orgId, context.org.id)));
    if (!member) throw new ORPCError("NOT_FOUND");
    if (member.userId === context.org.ownerId) {
      throw new ORPCError("BAD_REQUEST", { message: "You cannot remove the workspace owner." });
    }
    if (member.userId === context.user.id) {
      throw new ORPCError("BAD_REQUEST", {
        message: "You cannot remove yourself from the workspace.",
      });
    }
    if (member.role === "admin" && context.role !== "owner") {
      throw new ORPCError("FORBIDDEN", {
        message: "Only the workspace owner can remove an admin.",
      });
    }
    await db.delete(schema.members).where(eq(schema.members.id, input.memberId));
    await db
      .delete(schema.projectAssignments)
      .where(
        and(
          eq(schema.projectAssignments.orgId, context.org.id),
          eq(schema.projectAssignments.userId, member.userId),
        ),
      );
    return { ok: true };
  }),

  /**
   * Every assignment in the workspace, so the Team page can show and edit each member's
   * projects without opening one project at a time.
   */
  memberProjects: orgProc.handler(({ context }) => {
    const filters = [eq(schema.projectAssignments.orgId, context.org.id)];
    // A field member can read their own assignments and nobody else's.
    if (context.role === "field") {
      filters.push(eq(schema.projectAssignments.userId, context.user.id));
    }
    return db
      .select({
        userId: schema.projectAssignments.userId,
        projectId: schema.projectAssignments.projectId,
      })
      .from(schema.projectAssignments)
      .where(and(...filters));
  }),

  /** Project-level access for field crews. */
  assignments: orgProc
    .input(z.object({ projectId: z.string() }))
    .handler(async ({ input, context }) => {
      // Crew access for a project a field member is not on is none of their business.
      const teammates = await visibleTeammates(context.org.id, context.user.id, context.role);
      if (teammates && !teammates.projectIds.includes(input.projectId)) {
        return [] as (typeof schema.projectAssignments.$inferSelect)[];
      }
      return db
        .select()
        .from(schema.projectAssignments)
        .where(
          and(
            eq(schema.projectAssignments.orgId, context.org.id),
            eq(schema.projectAssignments.projectId, input.projectId),
          ),
        );
    }),

  assign: orgProc
    .input(z.object({ projectId: z.string(), userId: z.string(), assigned: z.boolean() }))
    .handler(async ({ input, context }) => {
      requireRole(context.role, "manager");
      if (!input.assigned) {
        await db
          .delete(schema.projectAssignments)
          .where(
            and(
              eq(schema.projectAssignments.orgId, context.org.id),
              eq(schema.projectAssignments.projectId, input.projectId),
              eq(schema.projectAssignments.userId, input.userId),
            ),
          );
        return { ok: true };
      }
      await db
        .insert(schema.projectAssignments)
        .values({
          id: id("asg"),
          orgId: context.org.id,
          projectId: input.projectId,
          userId: input.userId,
        })
        .onConflictDoNothing();
      return { ok: true };
    }),
};
