import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { count, eq } from "drizzle-orm";
import { base } from "../__core/app";
import { orgProc, requireRole } from "../middleware/auth";
import { db } from "../database";
import * as schema from "../database/schema";
import { allPlans, loadPlans, planOf } from "../lib/plans";
import {
  APPLE_PRODUCTS,
  APPLE_SKU_BY_PLAN,
  IapVerificationError,
  verifyAppleJws,
} from "../lib/iap";

/**
 * In-app purchase endpoints.
 *
 * iOS sells subscriptions through StoreKit (App Store Review Guideline 3.1.1 forbids an
 * external checkout for digital goods). The app buys with StoreKit, then posts the signed
 * transaction here; we verify it against Apple's pinned certificate chain and mirror the
 * resulting plan onto the workspace so in-app gating matches what Apple is charging.
 *
 * Android and web keep using the Stripe/Autumn checkout in `billing.checkout`.
 */
export const iap = {
  /** Public product catalog so the client never hardcodes store SKUs. */
  products: base.handler(async () => {
    await loadPlans();
    return {
      apple: allPlans()
        .filter((p) => APPLE_SKU_BY_PLAN[p.id])
        .map((p) => ({ plan: p.id, sku: APPLE_SKU_BY_PLAN[p.id] as string })),
      /** Product ids that map back to a plan — used to filter restored purchases. */
      appleSkus: Object.keys(APPLE_PRODUCTS),
    };
  }),

  /**
   * Applies a verified StoreKit transaction. Idempotent: replaying the same transaction
   * (which iOS does on every launch until it is finished) just re-applies the same plan.
   */
  applyApple: orgProc
    .input(
      z.object({
        jws: z.string().min(20).max(20000),
        productId: z.string().min(1).max(200).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      requireRole(context.role, "owner");
      await loadPlans();

      let tx: ReturnType<typeof verifyAppleJws>;
      try {
        tx = verifyAppleJws(input.jws);
      } catch (e) {
        if (e instanceof IapVerificationError) {
          throw new ORPCError("BAD_REQUEST", { message: e.message });
        }
        console.error("[iap] apple verification failed:", e);
        throw new ORPCError("BAD_REQUEST", { message: "Could not verify the App Store purchase" });
      }

      if (input.productId && input.productId !== tx.productId) {
        throw new ORPCError("BAD_REQUEST", { message: "Purchase does not match the selected plan" });
      }

      const planId = APPLE_PRODUCTS[tx.productId];
      if (!planId) throw new ORPCError("BAD_REQUEST", { message: "Unknown product" });

      const target = planOf(planId);
      if (target.id !== planId) throw new ORPCError("NOT_FOUND", { message: "Unknown plan" });

      const [seatRow] = await db
        .select({ value: count() })
        .from(schema.members)
        .where(eq(schema.members.orgId, context.org.id));
      const memberCount = seatRow?.value ?? 1;

      if (memberCount > target.limits.seats) {
        throw new ORPCError("BAD_REQUEST", {
          message: `${target.name} allows ${target.limits.seats} seat(s). Remove members first.`,
        });
      }

      const seats = Math.max(Math.min(context.org.seats, target.limits.seats), memberCount);
      const [org] = await db
        .update(schema.organizations)
        .set({ plan: target.id, seats })
        .where(eq(schema.organizations.id, context.org.id))
        .returning();

      const periodEnd = tx.expiresDate ? new Date(tx.expiresDate) : null;
      await db
        .insert(schema.subscriptions)
        .values({
          id: `sub_${context.org.id}`,
          orgId: context.org.id,
          planId: target.id,
          provider: "apple",
          status: "active",
          externalId: tx.originalTransactionId,
          seats: org?.seats ?? seats,
          currentPeriodEnd: periodEnd,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.subscriptions.orgId,
          set: {
            planId: target.id,
            provider: "apple",
            status: "active",
            externalId: tx.originalTransactionId,
            seats: org?.seats ?? seats,
            currentPeriodEnd: periodEnd,
            updatedAt: new Date(),
          },
        });

      return { applied: true as const, plan: target, org: org ?? context.org };
    }),
};
