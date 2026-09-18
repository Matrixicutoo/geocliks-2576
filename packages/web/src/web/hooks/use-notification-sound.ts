import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A short chime when something new lands in the bell's feed.
 *
 * It rides the feed the bell is already polling, so a message and a capture both sound — from
 * the listener's side those are the same event, and one sound for "somebody did something" is
 * easier to learn than two. Nothing is fetched for this hook's sake.
 *
 * Deliberately not tied to desktop-alert permission: sound needs no permission prompt, so this
 * works for the far more common case of someone who never granted notifications but does leave
 * the tab open all day. It is a switch of its own in the bell's footer, remembered per browser,
 * and on by default — a notification nobody hears is the thing being complained about.
 *
 * Browsers refuse autoplay until the tab has seen a gesture, so the element is primed on the
 * first click or keypress. After that a chime is allowed even with the tab in the background,
 * which is exactly when it earns its keep.
 */

const STORE_KEY = "geocliks.notify.sound";
const CHIME = "/media/new-message.mp3";
/** Loud enough to hear across a room, quiet enough not to startle someone on a headset. */
const VOLUME = 0.45;

export function useNotificationSound(items: { id: string }[] | undefined) {
  const [enabled, setEnabled] = useState(
    () => typeof window === "undefined" || localStorage.getItem(STORE_KEY) !== "0",
  );
  /** Ids from the previous poll. Null until the first response seeds it. */
  const known = useRef<Set<string> | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  const element = useCallback(() => {
    if (!audio.current) {
      const el = new Audio(CHIME);
      el.preload = "auto";
      el.volume = VOLUME;
      audio.current = el;
    }
    return audio.current;
  }, []);

  const play = useCallback(() => {
    const el = element();
    try {
      el.currentTime = 0;
      el.volume = VOLUME;
      el.muted = false;
      // A refusal is not worth an unhandled rejection: a silent tab still has the badge.
      void el.play().catch(() => {});
    } catch {
      // No sound is not worth breaking the page over.
    }
  }, [element]);

  // One muted play inside the user's first gesture is what buys the right to play later.
  useEffect(() => {
    if (!enabled) return;
    const prime = () => {
      const el = element();
      el.muted = true;
      el.play()
        .then(() => {
          el.pause();
          el.currentTime = 0;
          el.muted = false;
        })
        .catch(() => {
          el.muted = false;
        });
    };
    window.addEventListener("pointerdown", prime, { once: true });
    window.addEventListener("keydown", prime, { once: true });
    return () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
    };
  }, [enabled, element]);

  useEffect(() => {
    if (!items) return;
    const ids = items.map((item) => item.id);
    const previous = known.current;
    known.current = new Set(ids);
    // The first response is history, not news — signing in must not play a sound per row.
    if (!previous) return;
    if (!enabled) return;
    if (ids.some((id) => !previous.has(id))) play();
  }, [items, enabled, play]);

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(STORE_KEY, next ? "1" : "0");
    // Play on the way on, so the switch answers the only question it raises: what does it
    // sound like? The click is also the gesture that unlocks audio for later. Kept out of the
    // state updater deliberately — React may call one of those twice.
    if (next) play();
  }, [enabled, play]);

  return { enabled, toggle };
}
