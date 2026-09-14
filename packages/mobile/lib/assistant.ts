import { useHasSession } from "@/hooks/use-session";

/**
 * The assistant's product name. Deliberately not an i18n key: it is a brand name, so it reads
 * the same in every locale, and the drawer link, the Settings footer and the sheet header all
 * pull it from here so they can never drift apart. Mirrors `web/src/web/lib/assistant.ts`.
 */
export const ASSISTANT_NAME = "GeoCliks AI Assistant";

/**
 * Whether this phone may use the assistant: signed in. That is the whole grant, and it matches
 * `web/src/web/lib/assistant.ts` — no plan gate on either client.
 *
 * The capture screen works before sign-up, so signed out there is no workspace to ask about and
 * the tab, the drawer link and the Settings link all stay hidden. Everything the assistant can
 * actually reach is gated on its own behind the API, so an unpaid plan gets the conversation
 * without getting anything it has not paid for.
 */
export function useAssistantAccess(): boolean {
  const { hasSession } = useHasSession();
  return hasSession;
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
