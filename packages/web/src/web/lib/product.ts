import { canUseDelivery, canUseField } from "./roles";

/** The two systems a workspace can run. `null` means onboarding never answered — show both. */
export type Product = "field" | "delivery";

/**
 * Which system's pages a member actually sees.
 *
 * Two independent things decide it, and both have to agree:
 *
 * 1. **Their role.** A `driver` has no projects or job photos, a `field` member has no routes.
 *    That is a membership fact and it cannot be overridden — see `canUseField` / `canUseDelivery`.
 * 2. **What the workspace runs.** The onboarding answer (`org.product`) is a promise about the
 *    app: a roofing company that picked job photos should never see Routes in the sidebar, even
 *    though its owner's role would allow it. A `null` product predates onboarding, so both
 *    sides stay visible rather than hiding half the app from an existing workspace.
 *
 * The escape hatch matters: a role that has only ONE side keeps that side whatever the
 * workspace picked. Without it, a driver in a job-photos workspace — a perfectly ordinary
 * mixed team — would be left with no home page at all, and `ProductRoute` would bounce them
 * between two pages they are not allowed on until the tab gave up.
 *
 * Presentation only. The server refuses the same calls in `fieldProc` / `requireDelivery`
 * regardless of what the sidebar shows.
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
 * Where this member belongs when they land on `/app` with nothing more specific in mind: the
 * home of the system their workspace runs. A delivery workspace opens on Routes, a job-photos
 * one on the Teamspace feed.
 *
 * Every redirect — `ProductRoute`'s bounce, post-onboarding, post-invite-claim — goes through
 * here so they all agree. Two guards disagreeing about home is how a redirect loop starts.
 */
export function homeFor(orgProduct: string | null | undefined, role: string | undefined | null) {
  return showsProduct(orgProduct, role, "field") ? "/app" : "/app/routes";
}
