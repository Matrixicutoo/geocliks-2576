import { asc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

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
    tagline: "Capture job photos with customizable watermark templates.",
    features: [
      "Verified time, GPS and address watermark",
      "Unique photo code on every capture",
      "Offline capture with auto upload",
      "2 watermark templates",
      "PDF export up to 20 photos",
      "Verified video — 30s clips, first 3 days",
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
    tagline: "Advanced features, designed for individual use.",
    features: [
      "Unlimited photos and projects",
      "All watermark templates + your logo",
      "PDF, Excel, ZIP and KMZ exports",
      "Before & after comparison layouts",
      "Live share links for clients",
      "Verified video up to 3 minutes",
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
    tagline: "Teamspace for a small crew. 5 seats included, one flat bill.",
    features: [
      "Everything in Plus",
      "5 seats: you plus 4 invited crew members",
      "Teamspace: every crew photo syncs automatically",
      "Role-based project permissions",
      "Closeout packages and as-built records",
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
      "Invite by link or printed QR code",
      "Role-based project permissions",
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
      "Invite by link or printed QR code",
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
    },
    visible: true,
    sortOrder: 4,
    autumnPlanId: "crew25",
    isCustom: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceCents: -1,
    period: "talk to us",
    tagline: "Custom plans for large organizations.",
    features: [
      "Everything in Business",
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
    },
    visible: true,
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
    },
    visible: row.visible,
    sortOrder: row.sortOrder,
    autumnPlanId: row.autumnPlanId,
    isCustom: row.isCustom,
  };
}

/** Seed the shipped defaults once; existing rows are never overwritten. */
export async function syncPlans(): Promise<void> {
  if (seeded) return;
  seeded = true;
  for (const seed of DEFAULT_PLANS) {
    const existing = await db
      .select({ id: schema.plans.id })
      .from(schema.plans)
      .where(eq(schema.plans.id, seed.id))
      .limit(1);
    if (existing.length > 0) continue;
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
