import { useSyncExternalStore } from "react";
import { authClient } from "./auth";

/**
 * The assistant's product name. Deliberately not an i18n key: it is a brand name, so it reads
 * the same in every locale, and the footer link, the panel header and the aria-labels all pull
 * it from here so they can never drift apart.
 */
export const ASSISTANT_NAME = "GeoCliks AI Assistant";

/**
 * Whether this visitor may use the assistant: signed in. That is the whole grant.
 *
 * No plan gate. The assistant is part of the app on every plan, free included — a workspace
 * that cannot ask the app a question is a worse workspace, and the tools it reaches for are
 * already gated on their own (`assertFieldEnabled`, export formats, the role checks in
 * `agent/viewer.ts`), so a free plan gets the conversation without getting anything it has not
 * paid for. Signing in is the only line: signed out there is no workspace to ask about, and the
 * public marketing bubble is a different, tool-less thing.
 */
export function useAssistantAccess(): boolean {
  const { data: session } = authClient.useSession();
  return Boolean(session?.user);
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
