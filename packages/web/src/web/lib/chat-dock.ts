import { useSyncExternalStore } from "react";

/**
 * The chat dock's state: which threads are open as floating windows, and whether the people
 * picker is showing.
 *
 * It lives here, module-level, for the same reason the assistant's dock flag does: the dock is
 * mounted once at the app root, outside the router, while the things that open it — a message
 * row in the notification bell, the launcher bubble, a "message" button on a teammate — sit far
 * apart in the tree. One tiny store beats threading a context through every page between them,
 * and keeps the windows alive across navigation.
 *
 * Deliberately keyed by conversation id, not by person: opening the same thread twice from two
 * places focuses the window that is already there instead of stacking a duplicate.
 */

export type DockWindow = {
  conversationId: string;
  /** Collapsed to a bubble on the right edge, thread not rendered. */
  minimized: boolean;
};

type DockState = {
  windows: DockWindow[];
  picker: boolean;
};

/**
 * How many threads can be open side by side. Three 328px windows plus the launcher is already
 * most of a 1280px viewport; past that they would start covering the page they float over.
 * Opening a fourth closes the oldest, which is what Messenger does too.
 */
const MAX_WINDOWS = 3;

const STORE_KEY = "geocliks.chat-dock.v1";

let state: DockState = { windows: [], picker: false };
const listeners = new Set<() => void>();

function emit(next: DockState) {
  state = next;
  for (const listener of listeners) listener();
  persist();
}

/** Only the open threads are remembered — the picker is a transient thing, never restored. */
function persist() {
  try {
    const open = state.windows.map((w) => ({ c: w.conversationId, m: w.minimized }));
    if (open.length === 0) localStorage.removeItem(STORE_KEY);
    else localStorage.setItem(STORE_KEY, JSON.stringify(open));
  } catch {
    // Private mode, quota, whatever: losing the dock across a reload is not worth a throw.
  }
}

/**
 * Re-opens the windows from the last visit. Called by the dock after mount rather than while
 * this module loads, so the first render matches the server's and hydration cannot mismatch.
 */
export function restoreChatDock() {
  if (state.windows.length > 0) return;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    const windows: DockWindow[] = [];
    for (const entry of parsed) {
      const row = entry as { c?: unknown; m?: unknown };
      if (typeof row.c !== "string") continue;
      windows.push({ conversationId: row.c, minimized: row.m === true });
    }
    if (windows.length > 0) emit({ ...state, windows: windows.slice(0, MAX_WINDOWS) });
  } catch {
    // Corrupt payload: start with no windows.
  }
}

/**
 * Opens a thread as a floating window, or brings an already-open one back from a bubble. Also
 * closes the picker, since choosing somebody is the end of that flow.
 */
export function openChatWindow(conversationId: string) {
  const existing = state.windows.find((w) => w.conversationId === conversationId);
  const windows = existing
    ? state.windows.map((w) =>
        w.conversationId === conversationId ? { ...w, minimized: false } : w,
      )
    : [{ conversationId, minimized: false }, ...state.windows].slice(0, MAX_WINDOWS);
  emit({ windows, picker: false });
}

export function closeChatWindow(conversationId: string) {
  emit({
    ...state,
    windows: state.windows.filter((w) => w.conversationId !== conversationId),
  });
}

export function toggleChatWindow(conversationId: string) {
  emit({
    ...state,
    windows: state.windows.map((w) =>
      w.conversationId === conversationId ? { ...w, minimized: !w.minimized } : w,
    ),
  });
}

export function minimizeChatWindow(conversationId: string) {
  emit({
    ...state,
    windows: state.windows.map((w) =>
      w.conversationId === conversationId ? { ...w, minimized: true } : w,
    ),
  });
}

export function setChatPicker(open: boolean) {
  if (open === state.picker) return;
  emit({ ...state, picker: open });
}

export function useChatDock(): DockState {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    () => state,
    () => EMPTY,
  );
}

/** Stable identity for the server/first-frame snapshot: a fresh object every call would loop. */
const EMPTY: DockState = { windows: [], picker: false };
