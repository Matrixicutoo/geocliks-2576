import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { asc, count, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { logAdmin, requireSuperadmin, staffProc } from "../middleware/auth";
import { DEFAULT_PLANS, loadPlans, priceLabel } from "../lib/plans";
import { slugify } from "../lib/ids";

const limitsSchema = z.object({
  photosPerMonth: z.number().int().min(-1),
  projects: z.number().int().min(-1),
  seats: z.number().int().min(-1),
  templates: z.number().int().min(-1),
  teamspace: z.boolean(),
  shareLinks: z.boolean(),
  exports: z.array(z.enum(["pdf", "xlsx", "zip", "kmz"])),
  branding: z.boolean(),
  roles: z.boolean(),
  // Optional so an older admin client cannot wipe them; absent means "keep what
  // the row already has" (see the merge in `save` below).
  fieldEnabled: z.boolean().optional(),
  deliveryStopsPerMonth: z.number().int().min(-1).optional(),
  deliveryDrivers: z.number().int().min(-1).optional(),
  deliveryDispatch: z.boolean().optional(),
  deliverySmartOptimize: z.boolean().optional(),
  deliveryTracking: z.boolean().optional(),
  deliverySignature: z.boolean().optional(),
});

const planInput = z.object({
  name: z.string().min(1).max(40),
  priceCents: z.number().int().min(-1).max(10_000_00),
  period: z.string().min(1).max(40),
  tagline: z.string().max(200),
  features: z.array(z.string().max(160)).max(12),
  limits: limitsSchema,
  visible: z.boolean(),
  sortOrder: z.number().int().min(0).max(99),
  autumnPlanId: z.string().max(60).nullable(),
});

export const adminPlans = {
  list: staffProc.handler(async () => {
    const rows = await db.select().from(schema.plans).orderBy(asc(schema.plans.sortOrder));
    const orgs = await db
      .select({ plan: schema.organizations.plan, value: count() })
      .from(schema.organizations)
      .groupBy(schema.organizations.plan);
    const byPlan = new Map(orgs.map((r) => [r.plan, r.value]));
    return {
      plans: rows.map((r) => ({
        ...r,
        priceLabel: priceLabel(r.priceCents),
        workspaces: byPlan.get(r.id) ?? 0,
      })),
      defaultIds: DEFAULT_PLANS.map((p) => p.id),
      /** The payment processor charges what was pushed with the Autumn CLI, not this table. */
      processorNote:
        "Price and limit edits here drive display and in-app enforcement immediately. " +
        "The amount actually charged lives with the payment processor (Autumn/Stripe) and " +
        "must be pushed with the Autumn CLI after you change it here.",
    };
  }),

  update: staffProc
    .input(planInput.extend({ id: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      const { id: planId, ...values } = input;
      const [existing] = await db
        .select()
        .from(schema.plans)
        .where(eq(schema.plans.id, planId))
        .limit(1);
      if (!existing) throw new ORPCError("NOT_FOUND", { message: "Plan not found" });

      // The delivery limits are optional in the input. When a client omits them the
      // row keeps what it already had, so an edit of price or copy can never silently
      // strip a workspace's delivery allowance.
      const priorLimits = (existing.limits ?? {}) as Record<string, unknown>;
      const mergedLimits: Record<string, unknown> = {
        ...priorLimits,
        ...(values.limits as unknown as Record<string, unknown>),
      };

      const [row] = await db
        .update(schema.plans)
        .set({
          name: values.name,
          priceCents: values.priceCents,
          period: values.period,
          tagline: values.tagline,
          features: values.features,
          limits: mergedLimits,
          visible: values.visible,
          sortOrder: values.sortOrder,
          autumnPlanId: values.autumnPlanId,
        })
        .where(eq(schema.plans.id, planId))
        .returning();

      await loadPlans();
      await logAdmin(
        context.actor.id,
        "plan.update",
        planId,
        `${existing.priceCents} -> ${values.priceCents} cents, visible=${values.visible}`,
      );
      return { ...row!, priceLabel: priceLabel(row!.priceCents) };
    }),

  create: staffProc
    .input(planInput.extend({ id: z.string().min(2).max(40).optional() }))
    .handler(async ({ input, context }) => {
      requireSuperadmin(context.staffRole);
      const planId = slugify(input.id ?? input.name);
      const [clash] = await db
        .select({ id: schema.plans.id })
        .from(schema.plans)
        .where(eq(schema.plans.id, planId))
        .limit(1);
      if (clash) throw new ORPCError("CONFLICT", { message: `Plan id "${planId}" already exists` });

      const [row] = await db
        .insert(schema.plans)
        .values({
          id: planId,
          name: input.name,
          priceCents: input.priceCents,
          period: input.period,
          tagline: input.tagline,
          features: input.features,
          limits: input.limits as unknown as Record<string, unknown>,
          visible: input.visible,
          sortOrder: input.sortOrder,
          autumnPlanId: input.autumnPlanId,
          isCustom: true,
        })
        .returning();

      await loadPlans();
      await logAdmin(context.actor.id, "plan.create", planId, input.name);
      return { ...row!, priceLabel: priceLabel(row!.priceCents) };
    }),

  setVisible: staffProc
    .input(z.object({ id: z.string(), visible: z.boolean() }))
    .handler(async ({ input, context }) => {
      await db
        .update(schema.plans)
        .set({ visible: input.visible })
        .where(eq(schema.plans.id, input.id));
      await loadPlans();
      await logAdmin(context.actor.id, "plan.visibility", input.id, String(input.visible));
      return { ok: true };
    }),

  remove: staffProc.input(z.object({ id: z.string() })).handler(async ({ input, context }) => {
    requireSuperadmin(context.staffRole);
    const [row] = await db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.id, input.id))
      .limit(1);
    if (!row) throw new ORPCError("NOT_FOUND", { message: "Plan not found" });
    if (!row.isCustom) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Built-in plans can be hidden but not deleted.",
      });
    }
    const [{ value: inUse }] = await db
      .select({ value: count() })
      .from(schema.organizations)
      .where(eq(schema.organizations.plan, input.id));
    if (inUse > 0) {
      throw new ORPCError("BAD_REQUEST", {
        message: `${inUse} workspace(s) are on this plan. Move them first.`,
      });
    }
    await db.delete(schema.plans).where(eq(schema.plans.id, input.id));
    await loadPlans();
    await logAdmin(context.actor.id, "plan.delete", input.id, row.name);
    return { ok: true };
  }),
};
