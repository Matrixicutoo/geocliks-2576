/**
 * Snapshot of the plan copy that shipped *before* the Delivery Routes release.
 *
 * `syncPlans()` only inserts rows that are missing, so revised shipped copy would
 * never reach a workspace whose `plans` table was seeded by an earlier build. The
 * refresh pass compares each row against this snapshot: if the row still holds the
 * exact legacy text, nobody has edited it in /admin/plans and it is safe to update
 * to the current shipped default. Any operator edit makes the comparison fail and
 * the row is left alone.
 */
export interface LegacyPlanCopy {
  id: string;
  name: string;
  period: string;
  tagline: string;
  features: string[];
}

export const LEGACY_SHIPPED: LegacyPlanCopy[] = [
  {
    "id": "free",
    "name": "Free",
    "period": "forever",
    "tagline": "Capture job photos with customizable watermark templates.",
    "features": [
      "Verified time, GPS and address watermark",
      "Unique photo code on every capture",
      "Offline capture with auto upload",
      "2 watermark templates",
      "PDF export up to 20 photos",
      "Verified video — 30s clips, first 3 days"
    ]
  },
  {
    "id": "plus",
    "name": "Plus",
    "period": "per month",
    "tagline": "Advanced features, designed for individual use.",
    "features": [
      "Unlimited photos and projects",
      "All watermark templates + your logo",
      "PDF, Excel, ZIP and KMZ exports",
      "Before & after comparison layouts",
      "Live share links for clients",
      "Verified video up to 3 minutes"
    ]
  },
  {
    "id": "business",
    "name": "Business",
    "period": "per month",
    "tagline": "Teamspace for a small crew. 5 seats included, one flat bill.",
    "features": [
      "Everything in Plus",
      "5 seats: you plus 4 invited crew members",
      "Teamspace: every crew photo syncs automatically",
      "Role-based project permissions",
      "Closeout packages and as-built records",
      "One flat bill - no per-seat charges"
    ]
  },
  {
    "id": "crew10",
    "name": "Crew 10",
    "period": "per month",
    "tagline": "Ten seats for a growing crew. Same flat bill every month.",
    "features": [
      "Everything in Business",
      "10 seats: you plus 9 invited crew members",
      "Invite by link or printed QR code",
      "Role-based project permissions",
      "One flat bill - no per-seat charges"
    ]
  },
  {
    "id": "crew25",
    "name": "Crew 25",
    "period": "per month",
    "tagline": "Twenty-five seats for multiple crews under one account.",
    "features": [
      "Everything in Crew 10",
      "25 seats: you plus 24 invited crew members",
      "Invite by link or printed QR code",
      "Closeout packages across every crew",
      "One flat bill - no per-seat charges"
    ]
  },
  {
    "id": "enterprise",
    "name": "Enterprise",
    "period": "talk to us",
    "tagline": "Custom plans for large organizations.",
    "features": [
      "Everything in Business",
      "SSO and custom retention policies",
      "Custom report templates and API access",
      "Dedicated onboarding and support",
      "Volume pricing across regions"
    ]
  }
];
