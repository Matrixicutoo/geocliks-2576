/**
 * The 7-day product trial every brand-new workspace starts on.
 *
 * Onboarding asks three things — your name, the Teamspace name, and which system you run
 * (job photos or delivery routes) — and that third answer is what this file turns into real
 * access: the workspace is put on the matching paid plan for a week, with no card taken.
 *
 * The trial is stored as two columns on the organization (`trialPlan` + `trialEndsAt`) and is
 * NEVER written into `plan`. That separation is the whole design:
 *
 * - `plan` stays the paid truth, mirrored from the billing processor. Nothing about a trial can
 *   be mistaken for a subscription, and when the week runs out there is nothing to undo or
 *   reconcile — the trial columns simply stop counting and the paid plan (`free`) is what's left.
 * - The *effective* plan — what the person can actually do right now — is the trial plan while
 *   the clock runs and the paid plan afterwards. `orgProc` resolves it once per request and hands
 *   it to every enforcement call site, so no endpoint has to know a trial exists.
 *
 * Expiry is therefore a non-event: no job runs, no row is touched, features stop being included
 * the moment `trialEndsAt` passes. The captures, projects, routes and stops all stay — only the
 * paid-plan features go quiet until someone upgrades.
 */

/** How long a new workspace gets the paid features for, free and card-free. */
export const TRIAL_DAYS = 7;

/** The two systems GeoCliks sells. Chosen once during onboarding; changeable afterwards. */
export type ProductChoice = "field" | "delivery";

export const PRODUCT_CHOICES: readonly ProductChoice[] = ["field", "delivery"];

/**
 * Which plan each product's trial hands out.
 *
 * Both are the tier that shows off the system properly rather than the cheapest one that
 * technically unlocks it: a trial that feels like the entry tier sells the entry tier.
 * Field → Business (unlimited photos, Teamspace, every export, branding). Delivery → Delivery
 * Pro (real stop volume, dispatch, smart optimize, tracking links).
 */
const TRIAL_PLAN: Record<ProductChoice, string> = {
  field: "business",
  delivery: "delivery-pro",
};

export function trialPlanFor(product: ProductChoice): string {
  return TRIAL_PLAN[product];
}

/**
 * The free tier each product falls back to — before a trial starts, and after it lapses.
 *
 * Two free plans exist because the two systems have nothing in common: `free` is the job-photo
 * tier (300 photos, 3 projects, no routes at all), `delivery-free` is the routes tier (40 stops,
 * one driver, no job photos). Landing a lapsed delivery trial on `free` would take every route
 * away from someone whose whole business is routes — they would open the app to a product they
 * never asked for and no way to do the one thing they came for.
 */
const FREE_PLAN: Record<ProductChoice, string> = {
  field: "free",
  delivery: "delivery-free",
};

export function freePlanFor(product: ProductChoice | null | undefined): string {
  return product ? FREE_PLAN[product] : "free";
}

/** The subset of an organization row this module needs — keeps callers free of drizzle types. */
export interface TrialBearing {
  plan: string;
  product?: string | null;
  trialPlan?: string | null;
  trialEndsAt?: Date | null;
}

/** Narrows the free-text `product` column to a choice, or null for a pre-onboarding workspace. */
export function productOf(org: TrialBearing): ProductChoice | null {
  return org.product === "field" || org.product === "delivery" ? org.product : null;
}

export interface TrialStatus {
  /** True only while the clock is still running. */
  active: boolean;
  /** The plan the trial grants, while active. Null once it has lapsed or never started. */
  plan: string | null;
  endsAt: Date | null;
  /**
   * Whole days left, rounded UP, so the last partial day still reads "1 day left" instead of
   * "0 days left" to someone who can plainly still use the features. Null when no trial.
   */
  daysLeft: number | null;
  /** True when a trial ran and has since lapsed — what the "your trial ended" banner reads. */
  expired: boolean;
}

export function trialStatus(org: TrialBearing, now: Date = new Date()): TrialStatus {
  const endsAt = org.trialEndsAt ?? null;
  const plan = org.trialPlan ?? null;
  if (!endsAt || !plan) {
    return { active: false, plan: null, endsAt: null, daysLeft: null, expired: false };
  }
  const remaining = endsAt.getTime() - now.getTime();
  if (remaining <= 0) {
    return { active: false, plan: null, endsAt, daysLeft: 0, expired: true };
  }
  return {
    active: true,
    plan,
    endsAt,
    daysLeft: Math.max(1, Math.ceil(remaining / 86_400_000)),
    expired: false,
  };
}

/**
 * The plan id every gate should be checking: the trial plan while it runs, the paid plan after.
 *
 * A paid upgrade DELIBERATELY wins over a running trial. Someone who pays mid-trial gets exactly
 * what they paid for, and the leftover trial days can never hand them more than their
 * subscription does — nor less, which is the case that actually bites: trialling Delivery Pro
 * and then buying Delivery Lite must not keep dispatch switched on for the rest of the week.
 */
export function effectivePlanId(org: TrialBearing, now: Date = new Date()): string {
  if (isPaid(org.plan)) return org.plan;
  const trial = trialStatus(org, now);
  if (trial.active && trial.plan) return trial.plan;
  // Unpaid and not trialling: the free tier belonging to their product. A delivery workspace
  // whose `plan` column still reads "free" (nothing was ever purchased) gets `delivery-free`,
  // so the routes it was built around keep working at a small volume.
  return freePlanFor(productOf(org));
}

/** True for a plan that was actually bought — i.e. not one of the two free tiers. */
export function isPaid(planId: string | null | undefined): boolean {
  return Boolean(planId) && planId !== "free" && planId !== "delivery-free";
}

/** When a trial started now would run out. */
export function trialEndFrom(start: Date = new Date()): Date {
  return new Date(start.getTime() + TRIAL_DAYS * 86_400_000);
}
