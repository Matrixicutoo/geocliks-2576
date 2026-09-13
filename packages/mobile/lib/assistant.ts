import { useOrg } from "@/queries/orgs";
import { useHasSession } from "@/hooks/use-session";

/**
 * The assistant's product name. Deliberately not an i18n key: it is a brand name, so it reads
 * the same in every locale, and the drawer link, the Settings footer and the sheet header all
 * pull it from here so they can never drift apart. Mirrors `web/src/web/lib/assistant.ts`.
 */
export const ASSISTANT_NAME = "GeoCliks AI Assistant";

/**
 * Plans the assistant is included with. Kept in step with the website's list by hand: the two
 * apps cannot import from each other, and the grant is small enough that duplicating it beats
 * a round trip to the server on every launch.
 */
const ASSISTANT_PLANS = new Set([
  "free",
  "business",
  "crew10",
  "crew25",
  "enterprise",
  "enterprise-field",
  "delivery-pro",
  "delivery-fleet",
  "delivery-fleet-30",
  "delivery-fleet-200",
  "delivery-fleet-500",
]);

export function planHasAssistant(planId: string | null | undefined): boolean {
  if (!planId) return false;
  // Fleet tiers an operator adds later ("delivery-fleet-1000") sit above Delivery Pro, so they
  // are covered by the same grant rather than needing this list edited again.
  if (planId.startsWith("delivery-fleet")) return true;
  return ASSISTANT_PLANS.has(planId);
}

/**
 * Whether this phone may use the assistant: signed in, in a workspace whose plan includes it.
 *
 * The capture screen works before sign-up, so signed out there is no workspace and no plan and
 * the link stays hidden. `useOrg` is already switched off until a session exists.
 */
export function useAssistantAccess(): boolean {
  const { hasSession } = useHasSession();
  const org = useOrg();
  return hasSession && planHasAssistant(org.data?.plan?.id);
}

/**
 * Opening the sheet from anywhere in the tree.
 *
 * The sheet is mounted once at the app root so its transcript survives navigation between tabs,
 * while the links that open it live in the drawer and at the bottom of Settings — far enough
 * apart that threading a context through every screen between them would be worse than one
 * module-level listener list. React Native has no DOM events, so this is the stand-in for the
 * `CustomEvent` the website uses.
 */
const listeners = new Set<() => void>();
let requested = false;

export function openAssistant() {
  // Remembered, because the first request is what loads the sheet: it is not mounted yet when
  // the listeners fire, so it reads this on mount and comes up already open.
  requested = true;
  for (const listener of listeners) listener();
}

/** Whether the assistant has been asked for at least once this session. */
export function assistantWasRequested(): boolean {
  return requested;
}

export function onAssistantOpen(handler: () => void): () => void {
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
  };
}
