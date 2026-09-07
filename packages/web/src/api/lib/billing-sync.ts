import { count, eq } from "drizzle-orm";
import { Autumn } from "autumn-js";
import { db } from "../database";
import * as schema from "../database/schema";
import { allPlans, loadPlans, planOf } from "./plans";

/** Reads AUTUMN_SECRET_KEY from the root .env automatically. */
const autumnSdk = new Autumn();

const SUB_ACTIVE = new Set(["active", "trialing", "past_due", "scheduled"]);

/**
 * Statuses that are an explicit "this subscription is over" signal from the processor. Only these
 * justify dropping a workspace to the free plan — an empty or unknown answer never does.
 */
const SUB_ENDED = new Set([
  "canceled",
  "cancelled",
  "expired",
  "unpaid",
  "incomplete_expired",
  "ended",
]);

type Sub = {
  plan_id?: string | null;
  planId?: string | null;
  product_id?: string | null;
  status?: string | null;
  current_period_end?: number | null;
  id?: string | null;
};

export interface ProcessorSyncResult {
  synced: boolean;
  plan: ReturnType<typeof planOf>;
  reason?: string;
  org?: typeof schema.organizations.$inferSelect;
}

/**
 * Mirrors the processor's answer for one customer onto one workspace. The processor owns what was
 * actually charged; this only keeps in-app gating in step with it.
 *
 * Shared by `billing.syncProcessor` (pull, after checkout returns) and the billing webhook (push,
 * when Autumn/Stripe reports a change). A missing or unreadable answer never downgrades: only an
 * explicitly ended subscription drops a workspace to free.
 */
export async function applyProcessorState(args: {
  orgId: string;
  customerId: string;
  currentPlan: string;
  currentSeats: number;
}): Promise<ProcessorSyncResult> {
  await loadPlans();

  let customer: Awaited<ReturnType<typeof autumnSdk.customers.get>> | null = null;
  try {
    customer = await autumnSdk.customers.get({ customerId: args.customerId });
  } catch (e) {
    console.error("[autumn] customers.get failed:", e);
    return { synced: false, plan: planOf(args.currentPlan), reason: "processor_unreachable" };
  }
  if (!customer) {
    return { synced: false, plan: planOf(args.currentPlan), reason: "no_customer" };
  }

  const subs = (customer.subscriptions ?? []) as Sub[];

  // Highest-priced active subscription wins — that is what the customer is paying for.
  let best: { plan: ReturnType<typeof planOf>; sub: Sub } | null = null;
  for (const sub of subs) {
    if (sub.status && !SUB_ACTIVE.has(sub.status)) continue;
    const external = sub.plan_id ?? sub.planId ?? sub.product_id ?? null;
    if (!external) continue;
    const match = allPlans().find((p) => p.autumnPlanId === external);
    if (!match) continue;
    if (!best || match.priceCents > best.plan.priceCents) best = { plan: match, sub };
  }

  // No active paid subscription at the processor. Downgrading on that alone would punish a paying
  // customer who merely opened checkout and backed out (or whose subscription is not visible yet),
  // so we only drop to free on an explicit cancellation.
  const ended = subs.find((sub) => sub.status && SUB_ENDED.has(sub.status)) ?? null;
  if (!best && !ended) {
    return {
      synced: false,
      plan: planOf(args.currentPlan),
      reason: subs.length === 0 ? "no_subscription" : "inconclusive",
    };
  }

  const target = best ? best.plan : planOf("free");
  const periodEnd = best ? (best.sub.current_period_end ?? null) : null;
  const status = best ? (best.sub.status ?? "active") : (ended?.status ?? "canceled");
  const externalId = best ? (best.sub.id ?? null) : (ended?.id ?? null);

  const [{ value: memberCount }] = await db
    .select({ value: count() })
    .from(schema.members)
    .where(eq(schema.members.orgId, args.orgId));

  const [org] = await db
    .update(schema.organizations)
    .set({
      plan: target.id,
      seats: Math.max(Math.min(args.currentSeats, target.limits.seats), memberCount),
    })
    .where(eq(schema.organizations.id, args.orgId))
    .returning();

  const row = {
    planId: target.id,
    provider: "autumn",
    status,
    externalId,
    seats: org?.seats ?? memberCount,
    currentPeriodEnd: periodEnd ? new Date(periodEnd) : null,
    updatedAt: new Date(),
  };

  await db
    .insert(schema.subscriptions)
    .values({ id: `sub_${args.orgId}`, orgId: args.orgId, ...row })
    .onConflictDoUpdate({ target: schema.subscriptions.orgId, set: row });

  return { synced: true, plan: target, org: org! };
}
