import { useCallback, useEffect, useRef, useState } from "react";
import { useConversationsPolled } from "../queries/messages";

/**
 * Desktop notifications for incoming messages.
 *
 * There are no websockets in this stack, so this rides the existing 15s conversation poll:
 * when a thread's unread count climbs above what we last saw, that thread just received
 * something. Worst case a notification lands 15 seconds late, which is fine for field work.
 *
 * Two deliberate choices:
 *  - the browser only grants permission from a user gesture, so `enable()` must be called
 *    from a click — never on mount;
 *  - the first poll after load only seeds the baseline, otherwise signing in would fire a
 *    notification for every thread that was already unread.
 */
const STORE_KEY = "geocliks.notify.enabled";
const CHIME = "/media/new-message.mp3";

type Permission = "default" | "granted" | "denied" | "unsupported";

function readPermission(): Permission {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission as Permission;
}

export function useMessageNotifications() {
  const [permission, setPermission] = useState<Permission>(readPermission);
  const [enabled, setEnabled] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(STORE_KEY) === "1",
  );
  const active = enabled && permission === "granted";
  const conversations = useConversationsPolled(active);
  // Unread count per thread as of the previous poll. Null until the baseline is seeded.
  const seen = useRef<Map<string, number> | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const chime = useCallback(() => {
    try {
      if (!audio.current) audio.current = new Audio(CHIME);
      audio.current.currentTime = 0;
      // Autoplay can still be refused; a silent notification beats an unhandled rejection.
      void audio.current.play().catch(() => {});
    } catch {
      // No sound is not worth breaking the page over.
    }
  }, []);

  /**
   * `confirm` fires a real notification immediately so the user can verify the whole path —
   * permission, popup, sound — without needing a second person to message them.
   */
  const enable = useCallback(
    async (confirm?: { title: string; body: string }) => {
      if (!("Notification" in window)) return;
      let granted = Notification.permission;
      if (granted === "default") granted = await Notification.requestPermission();
      setPermission(granted as Permission);
      if (granted !== "granted") return;
      setEnabled(true);
      localStorage.setItem(STORE_KEY, "1");
      // Unlocks audio for later automated plays: this call sits inside the user's click.
      chime();
      if (confirm) {
        try {
          new Notification(confirm.title, {
            body: confirm.body,
            icon: "/icon-192.png",
            tag: "geocliks-notify-test",
          });
        } catch {
          // Permission is granted but the browser refused anyway; the chime already played.
        }
      }
    },
    [chime],
  );

  const disable = useCallback(() => {
    setEnabled(false);
    localStorage.removeItem(STORE_KEY);
  }, []);

  useEffect(() => {
    const rows = conversations.data;
    if (!rows) return;
    const next = new Map(rows.map((row) => [row.id, row.unread]));
    const previous = seen.current;
    seen.current = next;
    if (!previous) return; // first poll: baseline only
    if (!enabled || permission !== "granted") return;
    if (document.visibilityState === "visible" && document.hasFocus()) {
      // The user is already looking at the app; the sidebar badge is enough.
      return;
    }

    for (const row of rows) {
      const before = previous.get(row.id) ?? 0;
      if (row.unread <= before) continue;
      const body = row.lastMessagePreview?.trim() || "Sent you a message";
      try {
        const note = new Notification(row.other.name, {
          body,
          icon: "/icon-192.png",
          tag: row.id, // one notification per thread, replaced rather than stacked
        });
        note.onclick = () => {
          window.focus();
          window.location.href = "/app/messages";
          note.close();
        };
      } catch {
        // Some browsers throw outside a service worker context; the chime still fires.
      }
      chime();
    }
  }, [conversations.data, enabled, permission, chime]);

  return {
    supported: permission !== "unsupported",
    blocked: permission === "denied",
    enabled: enabled && permission === "granted",
    enable,
    disable,
  };
}
