import { asc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { LEGACY_SHIPPED } from "./plans-legacy";

export type ExportFormat = "pdf" | "xlsx" | "zip" | "kmz";

export interface PlanLimits {
  photosPerMonth: number; // -1 = unlimited
  /** Max length of a single verified video clip, in seconds. */
  videoMaxSeconds: number;
  /** Days from workspace creation that video stays available. 0 = no time limit. */
  videoTrialDays: number;
  projects: number;
  seats: number;
  templates: number;
  teamspace: boolean;
  shareLinks: boolean;
  exports: ExportFormat[];
  branding: boolean;
  roles: boolean;

  /**
   * Job photo system: projects, teamspace, the job-site photo feed, map and reports.
   *
   * Separate from the delivery allowances below because the two products are sold apart: a
   * delivery plan turns this OFF, but proof-of-delivery photo CAPTURE is unaffected — that is
   * a stop's evidence, not a job photo. See `requireField` in the API middleware.
   */
  fieldEnabled: boolean;

  /**
   * Delivery Routes allowances.
   *
   * `deliveryStopsPerMonth` is the cost-bearing number: Google's Route
   * Optimization API bills per stop on every optimize, so the stop count is what
   * the tiers are actually priced on. 0 = delivery not included, -1 = unlimited.
   */
  deliveryStopsPerMonth: number;
  /** Drivers that may be assigned routes. 0 = none, -1 = unlimited. */
  deliveryDrivers: number;
  /** Live dispatch mode — orders slotted into a running route through the day. */
  deliveryDispatch: boolean;
  /**
   * Smart optimizer (Google Route Optimization). When false the workspace still
   * gets ordered routes from the free local solver — it is never billed to us.
   */
  deliverySmartOptimize: boolean;
  /** Public per-stop tracking links plus the on-the-way / delivered emails. */
  deliveryTracking: boolean;
  /** Driver must capture a signature as well as the proof photo. */
  deliverySignature: boolean;
}

export interface Plan {
  id: string;
  name: string;
  /** Monthly price in cents. -1 = "Custom" (talk to sales). */
  priceCents: number;
  /** Rendered price, e.g. "$29" or "Custom". */
  priceLabel: string;
  period: string;
  tagline: string;
  features: string[];
  limits: PlanLimits;
  visible: boolean;
  sortOrder: number;
  autumnPlanId: string | null;
  isCustom: boolean;
}

export function priceLabel(priceCents: number): string {
  if (priceCents < 0) return "Custom";
  if (priceCents === 0) return "$0";
  const dollars = priceCents / 100;
  return `$${Number.isInteger(dollars) ? dollars : dollars.toFixed(2)}`;
}

type Seed = Omit<Plan, "priceLabel">;

/** Shipped defaults — seeded into the `plans` table on first boot. */
export const DEFAULT_PLANS: Seed[] = [
  {
    id: "free",
    name: "Free",
    priceCents: 0,
    period: "forever",
    tagline: "Verified job photos and video, free forever.",
    features: [
      "Verified time, GPS and address watermark",
      "Verified video - 30 second clips, first 3 days",
      "Unique photo code on every capture",
      "Offline capture with auto upload",
      "2 watermark templates",
      "PDF export up to 20 photos",
    ],
    limits: {
      photosPerMonth: 300,
      videoMaxSeconds: 30,
      videoTrialDays: 3,
      projects: 3,
      seats: 1,
      templates: 2,
      teamspace: false,
      shareLinks: false,
      exports: ["pdf"],
      branding: false,
      roles: false,
      fieldEnabled: true,
      deliveryStopsPerMonth: 0,
      deliveryDrivers: 0,
      deliveryDispatch: false,
      deliverySmartOptimize: false,
      deliveryTracking: false,
      deliverySignature: false,
    },
    visible: true,
    sortOrder: 0,
    autumnPlanId: "free",
    isCustom: false,
  },
  {
    id: "plus",
    name: "Plus",
    priceCents: 1200,
    period: "per month",
    tagline: "Unlimited verified photos and full-length video, for one person.",
    features: [
      "Verified video up to 3 minutes per clip",
      "Unlimited photos and projects",
      "All watermark templates + your logo",
      "PDF, Excel, ZIP and KMZ exports",
      "Before & after comparison layouts",
      "Live share links for clients",
      "Delivery routes come with the Delivery plans",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 1,
      templates: -1,
      teamspace: false,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: false,
      fieldEnabled: true,
      deliveryStopsPerMonth: 0,
      deliveryDrivers: 0,
      deliveryDispatch: false,
      deliverySmartOptimize: false,
      deliveryTracking: false,
      deliverySignature: false,
    },
    visible: true,
    sortOrder: 1,
    autumnPlanId: "plus",
    isCustom: false,
  },
  {
    id: "business",
    name: "Business",
    priceCents: 2500,
    period: "per month",
    tagline: "Teamspace for a small crew. 5 seats, full-length video, one flat bill.",
    features: [
      "Everything in Plus",
      "5 seats: you plus 4 invited crew members",
      "Verified video up to 3 minutes on every seat",
      "Teamspace: every crew photo and clip syncs automatically",
      "Role-based project permissions",
      "Closeout packages and as-built records",
      "Delivery routes come with the Delivery plans",
      "One flat bill - no per-seat charges",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 5,
      templates: -1,
      teamspace: true,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: true,
      fieldEnabled: true,
      deliveryStopsPerMonth: 0,
      deliveryDrivers: 0,
      deliveryDispatch: false,
      deliverySmartOptimize: false,
      deliveryTracking: false,
      deliverySignature: false,
    },
    visible: true,
    sortOrder: 2,
    autumnPlanId: "business",
    isCustom: false,
  },
  {
    id: "crew10",
    name: "Crew 10",
    priceCents: 5000,
    period: "per month",
    tagline: "Ten seats for a growing crew. Same flat bill every month.",
    features: [
      "Everything in Business",
      "10 seats: you plus 9 invited crew members",
      "Verified video up to 3 minutes on every seat",
      "Delivery routes come with the Delivery plans",
      "Invite by link or printed QR code",
      "One flat bill - no per-seat charges",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 10,
      templates: -1,
      teamspace: true,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: true,
      fieldEnabled: true,
      deliveryStopsPerMonth: 0,
      deliveryDrivers: 0,
      deliveryDispatch: false,
      deliverySmartOptimize: false,
      deliveryTracking: false,
      deliverySignature: false,
    },
    visible: true,
    sortOrder: 3,
    autumnPlanId: "crew10",
    isCustom: false,
  },
  {
    id: "crew25",
    name: "Crew 25",
    priceCents: 12500,
    period: "per month",
    tagline: "Twenty-five seats for multiple crews under one account.",
    features: [
      "Everything in Crew 10",
      "25 seats: you plus 24 invited crew members",
      "Verified video up to 3 minutes on every seat",
      "Delivery routes come with the Delivery plans",
      "Closeout packages across every crew",
      "One flat bill - no per-seat charges",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 25,
      templates: -1,
      teamspace: true,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: true,
      fieldEnabled: true,
      deliveryStopsPerMonth: 0,
      deliveryDrivers: 0,
      deliveryDispatch: false,
      deliverySmartOptimize: false,
      deliveryTracking: false,
      deliverySignature: false,
    },
    visible: true,
    sortOrder: 4,
    autumnPlanId: "crew25",
    isCustom: false,
  },
  {
    id: "delivery-lite",
    name: "Delivery Lite",
    priceCents: 3900,
    period: "per month",
    tagline: "Proof-of-delivery routes for a small fleet. 500 stops a month.",
    features: [
      "500 delivery stops a month, 2 drivers",
      "Route builder: type addresses, paste a list or upload a CSV",
      "Optimized stop order - no per-stop fees",
      "Photo proof locked to every stop, signature optional",
      "Private tracking link and delivered email for each recipient",
      "Unlimited proof-of-delivery photos on every stop",
      "Teamspace, roles and PDF, Excel, ZIP, KMZ exports",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 3,
      templates: -1,
      teamspace: true,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: true,
      fieldEnabled: false,
      deliveryStopsPerMonth: 500,
      deliveryDrivers: 2,
      deliveryDispatch: false,
      deliverySmartOptimize: false,
      deliveryTracking: true,
      deliverySignature: true,
    },
    visible: true,
    sortOrder: 10,
    autumnPlanId: null,
    isCustom: false,
  },
  {
    id: "delivery-pro",
    name: "Delivery Pro",
    priceCents: 9900,
    period: "per month",
    tagline: "The full delivery desk: 2,000 stops, live dispatch, smart optimizer.",
    features: [
      "2,000 delivery stops a month, 5 drivers",
      "Smart optimizer - shortest driving order, re-optimize any time",
      "Live dispatch: drop new orders into a route already running",
      "On the way, you are next and delivered emails with the photo",
      "Signature capture and failed delivery reasons",
      "Every stop hash-sealed and verifiable by code",
      "Everything in Delivery Lite",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 7,
      templates: -1,
      teamspace: true,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: true,
      fieldEnabled: false,
      deliveryStopsPerMonth: 2000,
      deliveryDrivers: 5,
      deliveryDispatch: true,
      deliverySmartOptimize: true,
      deliveryTracking: true,
      deliverySignature: true,
    },
    visible: true,
    sortOrder: 11,
    autumnPlanId: null,
    isCustom: false,
  },
  {
    id: "delivery-fleet",
    name: "Delivery Fleet",
    priceCents: 24900,
    period: "per month",
    tagline: "Several crews on the road. 6,000 stops a month, 15 drivers.",
    features: [
      "6,000 delivery stops a month, 15 drivers",
      "Everything in Delivery Pro",
      "Smart optimizer and live dispatch on every route",
      "Daily exception report: failed, skipped and late stops",
      "Closeout packages and exports across every crew",
      "Priority support",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 18,
      templates: -1,
      teamspace: true,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: true,
      fieldEnabled: false,
      deliveryStopsPerMonth: 6000,
      deliveryDrivers: 15,
      deliveryDispatch: true,
      deliverySmartOptimize: true,
      deliveryTracking: true,
      deliverySignature: true,
    },
    visible: true,
    sortOrder: 12,
    autumnPlanId: null,
    isCustom: false,
  },
  {
    // The rung above Fleet, for operations running roughly 30 trucks a day. Priced as a volume
    // step down from Fleet's per-driver rate rather than a straight double, so the ladder still
    // rewards growing. `autumnPlanId` stays null until a matching Autumn plan exists — filling it
    // speculatively would flip the button to live and fail checkout on the first click.
    id: "delivery-fleet-30",
    name: "Delivery Fleet 30",
    priceCents: 44900,
    period: "per month",
    tagline: "A full depot on the road. 12,000 stops a month, 30 drivers.",
    features: [
      "12,000 delivery stops a month, 30 drivers",
      "Everything in Delivery Fleet",
      "35 seats for dispatchers, supervisors and drivers",
      "Smart optimizer and live dispatch on every route",
      "Daily exception report: failed, skipped and late stops",
      "Priority support",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 35,
      templates: -1,
      teamspace: true,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: true,
      fieldEnabled: false,
      deliveryStopsPerMonth: 12000,
      deliveryDrivers: 30,
      deliveryDispatch: true,
      deliverySmartOptimize: true,
      deliveryTracking: true,
      deliverySignature: true,
    },
    visible: true,
    sortOrder: 13,
    autumnPlanId: null,
    isCustom: false,
  },
  {
    // Large-fleet rung. Stops scale on the same 400-stops-per-driver ratio Fleet 30 uses, and
    // seats stay drivers + 15 office. Per-driver price keeps declining ($16.60 at Fleet, $14.97
    // at Fleet 30, ~$9 here) so the ladder still rewards growing. `autumnPlanId` stays null.
    id: "delivery-fleet-200",
    name: "Delivery Fleet 200",
    priceCents: 179900,
    period: "per month",
    tagline: "Regional fleet scale. 80,000 stops a month, 200 drivers.",
    features: [
      "80,000 delivery stops a month, 200 drivers",
      "Everything in Delivery Fleet 30",
      "215 seats for dispatchers, supervisors and drivers",
      "Smart optimizer and live dispatch on every route",
      "Daily exception report: failed, skipped and late stops",
      "Priority support with a named contact",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 215,
      templates: -1,
      teamspace: true,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: true,
      fieldEnabled: false,
      deliveryStopsPerMonth: 80000,
      deliveryDrivers: 200,
      deliveryDispatch: true,
      deliverySmartOptimize: true,
      deliveryTracking: true,
      deliverySignature: true,
    },
    visible: true,
    sortOrder: 14,
    autumnPlanId: null,
    isCustom: false,
  },
  {
    // Top self-describing rung before Enterprise. Same ratios as Fleet 200, per-driver price
    // down to ~$7. Anything past this is genuinely custom, so Enterprise stays the next step.
    id: "delivery-fleet-500",
    name: "Delivery Fleet 500",
    priceCents: 349900,
    period: "per month",
    tagline: "National fleet scale. 200,000 stops a month, 500 drivers.",
    features: [
      "200,000 delivery stops a month, 500 drivers",
      "Everything in Delivery Fleet 200",
      "520 seats for dispatchers, supervisors and drivers",
      "Smart optimizer and live dispatch on every route",
      "Daily exception report: failed, skipped and late stops",
      "Priority support with a named contact",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 520,
      templates: -1,
      teamspace: true,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: true,
      fieldEnabled: false,
      deliveryStopsPerMonth: 200000,
      deliveryDrivers: 500,
      deliveryDispatch: true,
      deliverySmartOptimize: true,
      deliveryTracking: true,
      deliverySignature: true,
    },
    visible: true,
    sortOrder: 15,
    autumnPlanId: null,
    isCustom: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceCents: -1,
    period: "talk to us",
    tagline: "Custom plans for large fleets and organizations.",
    features: [
      "Everything in Delivery Fleet",
      "Unlimited delivery stops and drivers",
      "SSO and custom retention policies",
      "Custom report templates and API access",
      "Dedicated onboarding and support",
      "Volume pricing across regions",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 10000,
      templates: -1,
      teamspace: true,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: true,
      fieldEnabled: false,
      deliveryStopsPerMonth: -1,
      deliveryDrivers: -1,
      deliveryDispatch: true,
      deliverySmartOptimize: true,
      deliveryTracking: true,
      deliverySignature: true,
    },
    visible: true,
    sortOrder: 20,
    autumnPlanId: null,
    isCustom: false,
  },
  {
    // The field-side twin of Enterprise. Same custom-quote positioning, with the job photo
    // system in place of stops and drivers. Sits next to Enterprise on the pricing page, and
    // is a brand-new id, so `syncPlans()` inserts it on the next boot with no re-sync needed.
    id: "enterprise-field",
    name: "Enterprise Field",
    priceCents: -1,
    period: "talk to us",
    tagline: "Custom plans for large field teams and organizations.",
    features: [
      "Everything in Crew 25",
      "Unlimited seats, projects and verified captures",
      "SSO and custom retention policies",
      "Custom report templates and API access",
      "Dedicated onboarding and support",
      "Volume pricing across regions",
    ],
    limits: {
      photosPerMonth: -1,
      videoMaxSeconds: 180,
      videoTrialDays: 0,
      projects: -1,
      seats: 10000,
      templates: -1,
      teamspace: true,
      shareLinks: true,
      exports: ["pdf", "xlsx", "zip", "kmz"],
      branding: true,
      roles: true,
      fieldEnabled: true,
      deliveryStopsPerMonth: 0,
      deliveryDrivers: 0,
      deliveryDispatch: false,
      deliverySmartOptimize: false,
      deliveryTracking: false,
      deliverySignature: false,
    },
    visible: true,
    // Sits with the field plans, not after Enterprise: the billing grid orders by
    // sortOrder and draws its "Delivery routes" divider before the first delivery
    // plan, so a field plan numbered past Enterprise would render under that heading.
    sortOrder: 5,
    autumnPlanId: null,
    isCustom: false,
  },
];

function hydrate(seed: Seed): Plan {
  return { ...seed, priceLabel: priceLabel(seed.priceCents) };
}

const DEFAULT_MAP: Record<string, Plan> = Object.fromEntries(
  DEFAULT_PLANS.map((p) => [p.id, hydrate(p)]),
);

/** In-memory cache so `planOf()` stays synchronous for the enforcement call sites. */
let cache: Plan[] = DEFAULT_PLANS.map(hydrate);
let cacheMap: Record<string, Plan> = { ...DEFAULT_MAP };
let seeded = false;

function rowToPlan(row: typeof schema.plans.$inferSelect): Plan {
  const limits = (row.limits ?? {}) as Partial<PlanLimits>;
  return {
    id: row.id,
    name: row.name,
    priceCents: row.priceCents,
    priceLabel: priceLabel(row.priceCents),
    period: row.period,
    tagline: row.tagline,
    features: (row.features ?? []) as string[],
    limits: {
      photosPerMonth: limits.photosPerMonth ?? 300,
      videoMaxSeconds: limits.videoMaxSeconds ?? 30,
      videoTrialDays: limits.videoTrialDays ?? 3,
      projects: limits.projects ?? 3,
      seats: limits.seats ?? 1,
      templates: limits.templates ?? 2,
      teamspace: limits.teamspace ?? false,
      shareLinks: limits.shareLinks ?? false,
      exports: limits.exports ?? ["pdf"],
      branding: limits.branding ?? false,
      roles: limits.roles ?? false,
      // Fails OPEN, unlike the delivery fields below. Every plan row written before the
      // delivery/field split has no `fieldEnabled` key at all, and those workspaces have always
      // had the job photo system. Defaulting to false would strip Teamspace from all of them the
      // moment this code loads, before any re-sync had a chance to write the real value.
      fieldEnabled: limits.fieldEnabled ?? true,
      deliveryStopsPerMonth: limits.deliveryStopsPerMonth ?? 0,
      deliveryDrivers: limits.deliveryDrivers ?? 0,
      deliveryDispatch: limits.deliveryDispatch ?? false,
      deliverySmartOptimize: limits.deliverySmartOptimize ?? false,
      deliveryTracking: limits.deliveryTracking ?? false,
      deliverySignature: limits.deliverySignature ?? false,
    },
    visible: row.visible,
    sortOrder: row.sortOrder,
    autumnPlanId: row.autumnPlanId,
    isCustom: row.isCustom,
  };
}

function sameStrings(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/**
 * Bring a pre-Delivery row up to the current shipped copy, but only when the
 * operator has never touched it. Anything edited in /admin/plans wins and is left
 * exactly as it is; the delivery allowances are still merged in, because those
 * fields did not exist when the row was written and an absent limit would read as
 * "no delivery" forever.
 */
async function refreshLegacyRow(row: typeof schema.plans.$inferSelect, seed: Seed): Promise<void> {
  const legacy = LEGACY_SHIPPED.find((l) => l.id === row.id);
  const rowFeatures = (row.features ?? []) as string[];
  const untouched =
    legacy !== undefined &&
    row.name === legacy.name &&
    row.period === legacy.period &&
    row.tagline === legacy.tagline &&
    sameStrings(rowFeatures, legacy.features);

  const limits = (row.limits ?? {}) as Partial<PlanLimits>;
  const missingDelivery = limits.deliveryStopsPerMonth === undefined;
  if (!untouched && !missingDelivery) return;

  const nextLimits: Record<string, unknown> = untouched
    ? (seed.limits as unknown as Record<string, unknown>)
    : {
        ...(limits as Record<string, unknown>),
        deliveryStopsPerMonth: seed.limits.deliveryStopsPerMonth,
        deliveryDrivers: seed.limits.deliveryDrivers,
        deliveryDispatch: seed.limits.deliveryDispatch,
        deliverySmartOptimize: seed.limits.deliverySmartOptimize,
        deliveryTracking: seed.limits.deliveryTracking,
        deliverySignature: seed.limits.deliverySignature,
      };

  await db
    .update(schema.plans)
    .set(
      untouched
        ? {
            name: seed.name,
            period: seed.period,
            tagline: seed.tagline,
            features: seed.features,
            limits: nextLimits,
          }
        : { limits: nextLimits },
    )
    .where(eq(schema.plans.id, row.id));
}

/**
 * Seed the shipped defaults once. Existing rows keep any operator edits; only
 * rows still holding the pre-Delivery shipped text are refreshed.
 */
export async function syncPlans(): Promise<void> {
  if (seeded) return;
  seeded = true;
  for (const seed of DEFAULT_PLANS) {
    const existing = await db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.id, seed.id))
      .limit(1);
    if (existing.length > 0) {
      await refreshLegacyRow(existing[0]!, seed);
      continue;
    }
    await db.insert(schema.plans).values({
      id: seed.id,
      name: seed.name,
      priceCents: seed.priceCents,
      period: seed.period,
      tagline: seed.tagline,
      features: seed.features,
      limits: seed.limits as unknown as Record<string, unknown>,
      visible: seed.visible,
      sortOrder: seed.sortOrder,
      autumnPlanId: seed.autumnPlanId,
      isCustom: false,
    });
  }
}

/** Read plans from the DB and refresh the cache. */
export async function loadPlans(): Promise<Plan[]> {
  await syncPlans();
  const rows = await db.select().from(schema.plans).orderBy(asc(schema.plans.sortOrder));
  if (rows.length > 0) {
    cache = rows.map(rowToPlan);
    cacheMap = Object.fromEntries(cache.map((p) => [p.id, p]));
  }
  return cache;
}

/** Cached list — safe to call synchronously after `loadPlans()` has run once. */
export function allPlans(): Plan[] {
  return cache;
}

export function visiblePlans(): Plan[] {
  return cache.filter((p) => p.visible);
}

export function planOf(plan: string | null | undefined): Plan {
  const key = plan ?? "free";
  return cacheMap[key] ?? DEFAULT_MAP[key] ?? cacheMap.free ?? DEFAULT_MAP.free!;
}

/**
 * Video is available on every plan, but Free only gets it for a trial window
 * counted from the day the workspace was created.
 */
export interface VideoAllowance {
  enabled: boolean;
  maxSeconds: number;
  trialDays: number;
  /** Days left in the trial window. null when there is no time limit. */
  trialDaysLeft: number | null;
  reason: "ok" | "trial_expired";
}

export function videoAllowance(
  plan: Plan,
  orgCreatedAt: Date | number | null | undefined,
): VideoAllowance {
  const maxSeconds = plan.limits.videoMaxSeconds;
  const trialDays = plan.limits.videoTrialDays;
  if (trialDays <= 0) {
    return { enabled: true, maxSeconds, trialDays: 0, trialDaysLeft: null, reason: "ok" };
  }
  const start = orgCreatedAt ? new Date(orgCreatedAt).getTime() : Date.now();
  const elapsedDays = (Date.now() - start) / 86_400_000;
  const left = Math.max(0, Math.ceil(trialDays - elapsedDays));
  const enabled = elapsedDays < trialDays;
  return {
    enabled,
    maxSeconds,
    trialDays,
    trialDaysLeft: left,
    reason: enabled ? "ok" : "trial_expired",
  };
}
