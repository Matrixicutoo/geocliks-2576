import { useSyncExternalStore } from "react";
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

/**
 * The narrowest viewport that still has room for the site and a 380px panel side by side.
 *
 * The workspace already spends 248px on its own sidebar from `lg` up, so docking at `lg` would
 * leave its content under 400px wide — a column, but not a usable one. Under this the panel
 * stops taking a column and becomes a sheet over the page, opened from a small tab on the edge.
 */
export const DOCK_MIN_WIDTH = 1280;

/** Whether the viewport is at least `px` wide, kept in sync with the media query. */
export function useMinWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`;
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    // Server and first hydration frame: assume narrow, so nothing is docked before the real
    // viewport width is known and the layout cannot flash a column it then removes.
    () => false,
  );
}

/**
 * Whether the panel currently holds a column of its own, which the app shell has to lay the
 * site out beside — and, while it does, hand its scrolling to.
 *
 * The widget owns the state that decides this (open, entitled, off /admin, wide enough) and the
 * shell is its parent, so this is a tiny store between them rather than state lifted to the root
 * and threaded back down through every route.
 */
const DOCK_EVENT = "geocliks:assistant-dock";
let dockedNow = false;

export function setAssistantDocked(value: boolean) {
  if (value === dockedNow) return;
  dockedNow = value;
  globalThis.dispatchEvent(new CustomEvent(DOCK_EVENT));
}

export function useAssistantDocked(): boolean {
  return useSyncExternalStore(
    (notify) => {
      globalThis.addEventListener(DOCK_EVENT, notify);
      return () => globalThis.removeEventListener(DOCK_EVENT, notify);
    },
    () => dockedNow,
    () => false,
  );
}
