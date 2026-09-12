import { useQuery } from "@tanstack/react-query";
import { authClient } from "./auth";
import { orpc } from "./api";

/**
 * The assistant's product name. Deliberately not an i18n key: it is a brand name, so it reads
 * the same in every locale, and the footer link, the panel header and the aria-labels all pull
 * it from here so they can never drift apart.
 */
export const ASSISTANT_NAME = "GeoCliks AI Assistant";

/**
 * Plans the assistant is included with.
 *
 * Free is in because a workspace on the free trial should get a taste of it; Plus and Delivery
 * Lite are the two paid entry tiers that deliberately do not carry it. Everything from Business
 * and Delivery Pro up does. Plans live in the database and an operator can add more, so an
 * unknown id is refused rather than allowed — the list below is the whole grant.
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
 * Whether this visitor may use the assistant: signed in, in a workspace whose plan includes it.
 *
 * Signed out there is no workspace and no plan, so the marketing site never offers it. The
 * workspace call is only made once a session exists, so public pages stay free of a 401.
 */
export function useAssistantAccess(): boolean {
  const { data: session } = authClient.useSession();
  const signedIn = Boolean(session?.user);
  const org = useQuery({
    ...orpc.orgs.current.queryOptions({ staleTime: 60_000 }),
    enabled: signedIn,
  });
  return signedIn && planHasAssistant(org.data?.plan?.id);
}

const OPEN_EVENT = "geocliks:assistant-open";

/**
 * Opens the panel from anywhere in the tree.
 *
 * The widget is mounted once at the app root, outside the router, while the links that open it
 * live in the footer and the account menu — far apart enough that threading a context through
 * every page between them would be worse than one window event.
 */
export function openAssistant() {
  globalThis.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export function onAssistantOpen(handler: () => void): () => void {
  globalThis.addEventListener(OPEN_EVENT, handler);
  return () => globalThis.removeEventListener(OPEN_EVENT, handler);
}
