import { canUseDelivery, canUseField } from "./roles";

/**
 * Product helpers for the phone app. Mirror of `packages/web/src/web/lib/product.ts` — keep the
 * two in step, because a workspace that picked one system on the website must not see the other
 * one reappear on the phone.
 */

/** The two systems a workspace can run. `null` means onboarding never answered — show both. */
export type Product = "field" | "delivery";

/**
 * Which system's screens a member actually sees.
 *
 * Two independent things decide it, and both have to agree:
 *
 * 1. **Their role.** A `driver` has no projects or job photos, a `field` member has no routes.
 *    That is a membership fact and it cannot be overridden — see `canUseField` / `canUseDelivery`.
 * 2. **What the workspace runs.** The onboarding answer (`org.product`) is a promise about the
 *    app: a roofing company that picked job photos should never see Routes in the tab bar, even
 *    though its owner's role would allow it. A `null` product predates onboarding, so both sides
 *    stay visible rather than hiding half the app from an existing workspace.
 *
 * The escape hatch matters: a role that has only ONE side keeps that side whatever the workspace
 * picked. Without it, a driver in a job-photos workspace — a perfectly ordinary mixed team —
 * would be left with no home screen at all, and the deep-link bounce in `app/_layout.tsx` would
 * throw them between two screens they are not allowed on.
 *
 * Presentation only. The server refuses the same calls in `fieldProc` / `requireDelivery`
 * regardless of what the tab bar shows.
 */
export function showsProduct(
  orgProduct: string | null | undefined,
  role: string | undefined | null,
  product: Product,
): boolean {
  const mine = product === "field" ? canUseField(role) : canUseDelivery(role);
  if (!mine) return false;
  // The other side of the app, as far as this role is concerned.
  const other = product === "field" ? canUseDelivery(role) : canUseField(role);
  // Only one side to give them: give it, whatever the workspace answered.
  if (!other) return true;
  return orgProduct == null || orgProduct === product;
}

/**
 * Where this member belongs when a screen they are not allowed on bounces them: the home of the
 * system their workspace runs. A delivery workspace lands on Routes, a job-photos one on the
 * Teamspace feed.
 *
 * Every redirect goes through here so they all agree — two guards disagreeing about home is how
 * a redirect loop starts.
 */
export function homeFor(orgProduct: string | null | undefined, role: string | undefined | null) {
  return showsProduct(orgProduct, role, "field") ? "/teamspace" : "/routes";
}
