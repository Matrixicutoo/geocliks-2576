import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { Autumn } from "autumn-js";
import { and, count, eq, gte } from "drizzle-orm";
import { base } from "../__core/app";
import { orgProc, requireRole } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { allPlans, loadPlans, planOf, visiblePlans } from "../lib/plans";
import { localizePlan } from "../lib/plan-copy";
import { applyProcessorState } from "../lib/billing-sync";
import { SUPPORT_EMAIL } from "../lib/support";


/** Reads AUTUMN_SECRET_KEY from the root .env automatically. */
const autumnSdk = new Autumn();

/** Public origin of the web dashboard — where Stripe returns after checkout. */
function appOrigin(): string {
  return (process.env.WEBSITE_URL ?? "http://localhost:4200").replace(/\/+$/, "");
}

/** Prefilled "talk to sales" mail for the custom-priced plans. */
function contactMailto(planName: string, orgName: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `${planName} plan — ${orgName}`,
  )}&body=${encodeURIComponent(
    `Hi GeoCliks team,\n\nWe'd like to talk about the ${planName} plan.\n\nTeam size:\nIndustry:\nRegions:\n`,
  )}`;
}

export const billing = {
  /** Public — the marketing pricing table reads the same source as the enforcement code. */
  plans: base
    .input(z.object({ locale: z.string().optional() }).optional())
    .handler(async ({ input }) => {
      await loadPlans();
      return visiblePlans().map((p) => localizePlan(p, input?.locale));
    }),

  current: orgProc
    .input(z.object({ locale: z.string().optional() }).optional())
    .handler(async ({ context, input }) => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [[photosThisMonth], [photosTotal], [projectCount], [memberCount]] = await Promise.all([
      db
        .select({ value: count() })
        .from(schema.photos)
        .where(
          and(
            eq(schema.photos.orgId, context.org.id),
            gte(schema.photos.capturedAt, monthStart),
          ),
        ),
      db
        .select({ value: count() })
        .from(schema.photos)
        .where(eq(schema.photos.orgId, context.org.id)),
      db
        .select({ value: count() })
        .from(schema.projects)
        .where(eq(schema.projects.orgId, context.org.id)),
      db
        .select({ value: count() })
        .from(schema.members)
        .where(eq(schema.members.orgId, context.org.id)),
    ]);

    await loadPlans();
    const plan = planOf(context.org.plan);
    return {
      plan: localizePlan(plan, input?.locale),
      plans: allPlans()
        .filter((p) => p.visible || p.id === plan.id)
        .map((p) => localizePlan(p, input?.locale)),
      role: context.role,
      org: context.org,
      seats: context.org.seats,
      supportEmail: SUPPORT_EMAIL,
      usage: {
        photosThisMonth: photosThisMonth?.value ?? 0,
        photosTotal: photosTotal?.value ?? 0,
        projects: projectCount?.value ?? 0,
        members: memberCount?.value ?? 0,
      },
    };
  }),

  /**
   * Reads the truth back from Autumn (the processor owns what was actually charged) and mirrors it
   * onto the workspace so in-app gating matches the paid subscription. Called when Stripe checkout
   * returns to /app/billing?checkout=success.
   */
  syncProcessor: orgProc.handler(async ({ context }) => {
    requireRole(context.role, "owner");
    return await applyProcessorState({
      orgId: context.org.id,
      customerId: context.user.id,
      currentPlan: context.org.plan,
      currentSeats: context.org.seats,
    });
  }),

  changePlan: orgProc
    .input(
      z.object({
        plan: z.string().min(1).max(40),
        seats: z.number().min(1).max(500).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "owner");

      await loadPlans();
      const target = planOf(input.plan);
      if (target.id !== input.plan) {
        throw new ORPCError("NOT_FOUND", { message: "Unknown plan" });
      }

      if (target.priceCents < 0) {
        return {
          contact: true,
          mailto: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
            `${target.name} plan — ${context.org.name}`,
          )}&body=${encodeURIComponent(
            `Hi GeoCliks team,\n\nWe'd like to talk about the ${target.name} plan.\n\nTeam size:\nIndustry:\nRegions:\n`,
          )}`,
          org: context.org,
        };
      }

      const seats = Math.min(input.seats ?? context.org.seats, target.limits.seats);

      const [{ value: memberCount }] = await db
        .select({ value: count() })
        .from(schema.members)
        .where(eq(schema.members.orgId, context.org.id));

      if (memberCount > target.limits.seats) {
        throw new ORPCError("BAD_REQUEST", {
          message: `${target.name} allows ${target.limits.seats} seat(s). Remove members before downgrading.`,
        });
      }

      const [org] = await db
        .update(schema.organizations)
        .set({ plan: input.plan, seats: Math.max(seats, memberCount) })
        .where(eq(schema.organizations.id, context.org.id))
        .returning();

      return { contact: false, org: org! };
    }),

  /**
   * Native checkout hand-off. Returns a Stripe (Autumn-hosted) payment URL the mobile app can open
   * directly, so field users never bounce through the web dashboard sign-in.
   */
  checkout: orgProc
    .input(
      z.object({
        plan: z.string().min(1).max(40),
        successUrl: z.string().url().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "owner");

      await loadPlans();
      const target = planOf(input.plan);
      if (target.id !== input.plan) {
        throw new ORPCError("NOT_FOUND", { message: "Unknown plan" });
      }

      // "Talk to sales" plans have no price — hand back a prefilled mailto instead.
      if (target.priceCents < 0) {
        return { kind: "contact" as const, mailto: contactMailto(target.name, context.org.name), url: null };
      }

      const [{ value: memberCount }] = await db
        .select({ value: count() })
        .from(schema.members)
        .where(eq(schema.members.orgId, context.org.id));

      if (memberCount > target.limits.seats) {
        throw new ORPCError("BAD_REQUEST", {
          message: `${target.name} allows ${target.limits.seats} seat(s). Remove members before downgrading.`,
        });
      }

      const applyLocally = async () => {
        const seats = Math.max(Math.min(context.org.seats, target.limits.seats), memberCount);
        await db
          .update(schema.organizations)
          .set({ plan: target.id, seats })
          .where(eq(schema.organizations.id, context.org.id));
      };

      // Free plan (and re-picking the current plan) never needs the processor.
      if (target.priceCents === 0 || target.id === context.org.plan) {
        await applyLocally();
        return { kind: "applied" as const, plan: target, url: null };
      }

      if (!target.autumnPlanId) {
        return { kind: "unavailable" as const, url: null };
      }

      try {
        const res = await autumnSdk.billing.attach({
          customerId: context.user.id,
          planId: target.autumnPlanId,
          redirectMode: "always",
          successUrl: input.successUrl ?? `${appOrigin()}/app/billing?checkout=success`,
        });
        const url = (res as { paymentUrl?: string | null } | null)?.paymentUrl ?? null;
        if (!url) return { kind: "unavailable" as const, url: null };
        return { kind: "checkout" as const, url };
      } catch (e) {
        console.error("[autumn] billing.attach failed:", e);
        return { kind: "unavailable" as const, url: null };
      }
    }),
};
