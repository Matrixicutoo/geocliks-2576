import { z } from "zod";
import { and, asc, count, eq, gte, inArray, ne } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { orgProc, requireRole } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { id } from "../lib/ids";
import { planOf } from "../lib/plans";
import { LOCALE_CODES } from "../lib/locales";
import { avatarUrl, brandLogoUrl } from "./account";
import { defaultOrgName } from "../lib/workspaces";
import { canStartTrial, trialEndFrom, trialPlanFor, trialStatus } from "../lib/trial";

/**
 * One logo, two places to set it. A logo uploaded on a watermark template is also the business
 * logo, so it turns up in profile settings and in both menus without a second upload. Clearing a
 * template's logo deliberately does NOT clear the workspace one: dropping it from one stamp
 * should not wipe the business identity everywhere.
 */
async function syncOrgLogo(orgId: string, logoUrl: string | null | undefined) {
  if (!logoUrl) return;
  await db.update(schema.organizations).set({ logoUrl }).where(eq(schema.organizations.id, orgId));
}

const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const orgs = {
  /** Workspace bootstrap for every client: org, role, plan limits and usage counters. */
  current: orgProc.handler(async ({ context }) => {
    const [photoCount] = await db
      .select({ value: count() })
      .from(schema.photos)
      .where(eq(schema.photos.orgId, context.org.id));
    const [monthCount] = await db
      .select({ value: count() })
      .from(schema.photos)
      .where(
        and(eq(schema.photos.orgId, context.org.id), gte(schema.photos.verifiedAt, startOfMonth())),
      );
    const [projectCount] = await db
      .select({ value: count() })
      .from(schema.projects)
      .where(eq(schema.projects.orgId, context.org.id));
    const [memberCount] = await db
      .select({ value: count() })
      .from(schema.members)
      .where(eq(schema.members.orgId, context.org.id));

    /**
     * First-run checklist state. Every step is derived from work that actually exists rather
     * than from a "seen it" flag, so it ticks itself off whoever did the work and on whatever
     * device — and a workspace that was already in real use before the checklist existed opens
     * with it complete instead of being told to start over.
     */
    const [shareCount] = await db
      .select({ value: count() })
      .from(schema.shareLinks)
      .where(eq(schema.shareLinks.orgId, context.org.id));
    const [reportCount] = await db
      .select({ value: count() })
      .from(schema.reports)
      .where(eq(schema.reports.orgId, context.org.id));
    /** Any capture that came off a phone — proof the mobile app is installed and signed in. */
    const [mobileCount] = await db
      .select({ value: count() })
      .from(schema.photos)
      .where(
        and(
          eq(schema.photos.orgId, context.org.id),
          inArray(schema.photos.platform, ["android", "ios"]),
        ),
      );

    /**
     * Has this person been through onboarding? Two things say no: the workspace is still on the
     * auto-provisioned name, and no product has been chosen. Invited members are excluded by
     * `role` on the client — they joined someone else's Teamspace and must never be asked to
     * name it or pick its product.
     *
     * A platform operator's own workspace is never asked: it has both systems and no trial to
     * start, so the form has nothing to decide, and the one thing it would still do is overwrite
     * a workspace that has been in real use since before the question existed.
     */
    const needsSetup =
      !context.staffOrg &&
      (context.org.product === null || context.org.name === defaultOrgName(context.user));

    return {
      // The column holds a bare storage key; clients get a freshly minted link, never the key.
      org: { ...context.org, logoUrl: await brandLogoUrl(context.org.logoUrl) },
      role: context.role,
      /** Still on the auto-provisioned name: the UI offers to set the business name once. */
      needsName: context.org.name === defaultOrgName(context.user),
      needsSetup,
      /**
       * Which system to show: "field", "delivery", or null for "show both".
       *
       * Null is what pre-onboarding workspaces report, and it is also what a platform
       * operator's own workspace reports whatever its column says — staff run both systems, so
       * the onboarding answer must not take half the app off their sidebar. The plan behind it
       * (`staff`) already allows both, so this is the last thing that was hiding them.
       */
      product: context.staffOrg ? null : context.org.product,
      /** The free week. `plan` below already includes whatever the trial grants. */
      trial: {
        active: context.trial.active,
        expired: context.trial.expired,
        daysLeft: context.trial.daysLeft,
        endsAt: context.trial.endsAt,
        planName: context.trial.plan ? planOf(context.trial.plan).name : null,
      },
      user: {
        id: context.user.id,
        name: context.user.name,
        email: context.user.email,
        image: await avatarUrl(context.user.image),
      },
      plan: planOf(context.org.plan),
      usage: {
        photos: photoCount?.value ?? 0,
        photosThisMonth: monthCount?.value ?? 0,
        projects: projectCount?.value ?? 0,
        members: memberCount?.value ?? 0,
      },
      /**
       * The five things that have to happen before the product is doing its job. The client
       * draws them as a checklist and hides the whole card once they are all true.
       */
      setup: {
        project: (projectCount?.value ?? 0) > 0,
        mobile: (mobileCount?.value ?? 0) > 0,
        capture: (photoCount?.value ?? 0) > 0,
        crew: (memberCount?.value ?? 0) > 1,
        share: (shareCount?.value ?? 0) + (reportCount?.value ?? 0) > 0,
      },
    };
  }),

  /**
   * First-run onboarding, in one call: your name, the Teamspace name, and which system you run.
   *
   * The product answer is what starts the 7-day trial — it decides which plan the free week
   * hands out (Business for job photos, Delivery Pro for routes). No card is taken and nothing
   * is charged: the trial lives in its own two columns and simply stops counting after a week,
   * leaving the workspace on that product's free tier with its data intact. See `lib/trial.ts`.
   *
   * Who the week is actually for is `canStartTrial` in `lib/trial.ts`, and it is narrower than
   * "whoever submits this form": never twice, never over a paid plan, never on a platform
   * operator's own workspace, and never on a workspace old enough to have been named already.
   * The name and product are still saved in every one of those cases — only the clock is not
   * started. Read that function for why each answer is the way it is.
   *
   * Owners and admins only. An invited member never reaches this — they joined a workspace that
   * has already been set up, and the client skips onboarding for them entirely.
   */
  setup: orgProc
    .input(
      z.object({
        /** The person's own display name, as typed on the same form. */
        userName: z.string().trim().min(1).max(80).optional(),
        name: z.string().trim().min(2).max(80),
        product: z.enum(["field", "delivery"]),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "admin");

      if (input.userName && input.userName !== context.user.name) {
        await db
          .update(schema.user)
          .set({ name: input.userName })
          .where(eq(schema.user.id, context.user.id));
      }

      const startTrial = canStartTrial({
        plan: context.paidPlan,
        trialEndsAt: context.org.trialEndsAt,
        staffOwned: context.staffOrg,
        brandNew: context.org.name === defaultOrgName(context.user),
      });
      const now = new Date();
      const [org] = await db
        .update(schema.organizations)
        .set({
          name: input.name,
          product: input.product,
          ...(startTrial
            ? { trialPlan: trialPlanFor(input.product), trialEndsAt: trialEndFrom(now) }
            : {}),
        })
        .where(eq(schema.organizations.id, context.org.id))
        .returning();
      if (!org) throw new ORPCError("NOT_FOUND");

      const trial = trialStatus(org, now);
      return {
        org: { ...org, logoUrl: await brandLogoUrl(org.logoUrl) },
        product: input.product,
        trial: {
          active: trial.active,
          daysLeft: trial.daysLeft,
          endsAt: trial.endsAt,
          planName: trial.plan ? planOf(trial.plan).name : null,
        },
      };
    }),

  /**
   * Switch which system the workspace runs, after onboarding. Changing it never touches the
   * trial: the week is granted once, and re-picking is a navigation preference, not a new trial.
   */
  setProduct: orgProc
    .input(z.object({ product: z.enum(["field", "delivery"]) }))
    .handler(async ({ input, context }) => {
      requireRole(context.role, "admin");
      await db
        .update(schema.organizations)
        .set({ product: input.product })
        .where(eq(schema.organizations.id, context.org.id));
      return { product: input.product };
    }),

  update: orgProc
    .input(
      z.object({
        name: z.string().min(2).max(80).optional(),
        industry: z.string().max(60).nullish(),
        logoUrl: z.string().nullish(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "admin");
      const [org] = await db
        .update(schema.organizations)
        .set(input)
        .where(eq(schema.organizations.id, context.org.id))
        .returning();
      if (!org) return org;
      return { ...org, logoUrl: await brandLogoUrl(org.logoUrl) };
    }),

  /**
   * Workspace-wide appearance defaults. Admins set the fallback every member starts from;
   * each member can still override theme and language on their own device (stored client-side).
   */
  setAppearance: orgProc
    .input(
      z.object({
        theme: z.enum(["light", "dark"]).optional(),
        locale: z.enum(LOCALE_CODES).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "admin");
      const [org] = await db
        .update(schema.organizations)
        .set(input)
        .where(eq(schema.organizations.id, context.org.id))
        .returning();
      return { theme: org?.theme ?? "light", locale: org?.locale ?? "en" };
    }),

  /**
   * Watermark templates are workspace-wide branding.
   *
   * `list` stays open to EVERY role on purpose: the camera reads the template to stamp the
   * photo, so gating it would break capture for field crews and for a driver's proof of
   * delivery. Only the workspace owner and admins may create, edit, promote or delete one.
   */
  templates: {
    list: orgProc.handler(async ({ context }) => {
      const rows = await db
        .select()
        .from(schema.watermarkTemplates)
        .where(eq(schema.watermarkTemplates.orgId, context.org.id))
        // Fixed order so the mobile camera's "first template" fallback is always the same row.
        .orderBy(asc(schema.watermarkTemplates.createdAt), asc(schema.watermarkTemplates.id));
      return Promise.all(
        rows.map(async (row) => ({ ...row, logoUrl: await brandLogoUrl(row.logoUrl) })),
      );
    }),

    create: orgProc
      .input(
        z.object({
          name: z.string().min(1).max(40),
          layout: z.enum(["classic", "compact", "detailed", "branded"]).default("classic"),
          accentColor: z.string().default("#FFB021"),
          showLogo: z.boolean().default(false),
          logoUrl: z.string().nullish(),
          companyLine: z.string().max(80).nullish(),
          fields: z.array(z.string()).default(["time", "coords", "address", "project"]),
        }),
      )
      .handler(async ({ input, context }) => {
        requireRole(context.role, "admin");
        const plan = planOf(context.org.plan);
        const existing = await db
          .select({ value: count() })
          .from(schema.watermarkTemplates)
          .where(eq(schema.watermarkTemplates.orgId, context.org.id));
        const used = existing[0]?.value ?? 0;
        if (plan.limits.templates !== -1 && used >= plan.limits.templates) {
          throw new ORPCError("PAYMENT_REQUIRED", {
            status: 402,
            message: `${plan.name} includes ${plan.limits.templates} watermark templates. Upgrade for unlimited.`,
          });
        }
        const [tpl] = await db
          .insert(schema.watermarkTemplates)
          .values({ id: id("tpl"), orgId: context.org.id, ...input })
          .returning();
        await syncOrgLogo(context.org.id, input.logoUrl);
        if (!tpl) return tpl;
        return { ...tpl, logoUrl: await brandLogoUrl(tpl.logoUrl) };
      }),

    update: orgProc
      .input(
        z.object({
          id: z.string(),
          name: z.string().min(1).max(40).optional(),
          layout: z.enum(["classic", "compact", "detailed", "branded"]).optional(),
          accentColor: z.string().optional(),
          showLogo: z.boolean().optional(),
          logoUrl: z.string().nullish(),
          companyLine: z.string().max(80).nullish(),
          fields: z.array(z.string()).optional(),
        }),
      )
      .handler(async ({ input, context }) => {
        requireRole(context.role, "admin");
        const { id: templateId, ...patch } = input;
        const [tpl] = await db
          .update(schema.watermarkTemplates)
          .set(patch)
          .where(
            and(
              eq(schema.watermarkTemplates.id, templateId),
              eq(schema.watermarkTemplates.orgId, context.org.id),
            ),
          )
          .returning();
        if (!tpl) throw new ORPCError("NOT_FOUND");
        await syncOrgLogo(context.org.id, patch.logoUrl);
        return { ...tpl, logoUrl: await brandLogoUrl(tpl.logoUrl) };
      }),

    setDefault: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
      requireRole(context.role, "admin");
      // Promote first, demote second. The reverse order used to clear every flag before learning
      // the target did not exist, which left the workspace with no default at all and silently
      // handed the crew whichever template happened to sort first.
      const [tpl] = await db
        .update(schema.watermarkTemplates)
        .set({ isDefault: true })
        .where(
          and(
            eq(schema.watermarkTemplates.id, input.id),
            eq(schema.watermarkTemplates.orgId, context.org.id),
          ),
        )
        .returning();
      if (!tpl) throw new ORPCError("NOT_FOUND");
      await db
        .update(schema.watermarkTemplates)
        .set({ isDefault: false })
        .where(
          and(
            eq(schema.watermarkTemplates.orgId, context.org.id),
            ne(schema.watermarkTemplates.id, input.id),
          ),
        );
      return tpl;
    }),

    remove: orgProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
      requireRole(context.role, "admin");
      // A delete that matched nothing used to answer { ok: true }, so a stale tab reported success
      // for a row that was already gone. Report NOT_FOUND and let the client refresh its list.
      const deleted = await db
        .delete(schema.watermarkTemplates)
        .where(
          and(
            eq(schema.watermarkTemplates.id, input.id),
            eq(schema.watermarkTemplates.orgId, context.org.id),
          ),
        )
        .returning({ id: schema.watermarkTemplates.id });
      if (!deleted.length) throw new ORPCError("NOT_FOUND");
      return { ok: true };
    }),
  },
};
