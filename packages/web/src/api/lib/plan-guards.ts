import { ORPCError } from "@orpc/server";
import type { Plan } from "./plans";

/**
 * Plan-level product gates for the delivery/field split.
 *
 * These are about what the *workspace pays for*; the role gates in `middleware/auth`
 * are about what the *person* is allowed to touch. Both have to pass.
 *
 * Deliberately one-directional: they block the actions that create new work, and never
 * block reading. A workspace that switches sides keeps every route and every job photo
 * it already captured, visible and exportable — losing access to your own evidence
 * because a subscription changed would be indefensible. Nothing here deletes anything.
 */

/** Throws when the workspace's plan does not include the delivery system. */
export function assertDeliveryEnabled(plan: Plan): void {
  if (plan.limits.deliveryStopsPerMonth === 0) {
    throw new ORPCError("PAYMENT_REQUIRED", {
      status: 402,
      message: `Delivery Routes is not included in ${plan.name}. Add a Delivery plan to build routes.`,
    });
  }
}

/**
 * Throws when the workspace's plan does not include the job photo system.
 *
 * Proof-of-delivery capture is NOT covered by this: a stop's photo is the delivery's
 * evidence, not a job photo, so it stays available on every delivery plan. Only the
 * project-based field product is gated here.
 */
export function assertFieldEnabled(plan: Plan): void {
  if (!plan.limits.fieldEnabled) {
    throw new ORPCError("PAYMENT_REQUIRED", {
      status: 402,
      message: `The job photo system is not included in ${plan.name}. Add a Field plan to create projects.`,
    });
  }
}
