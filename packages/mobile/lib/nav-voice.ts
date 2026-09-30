import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LocaleCode } from "../i18n/locales";

/**
 * Spoken turn-by-turn for the navigation screen.
 *
 * A driver with a parcel on his lap and a windscreen to watch cannot read a banner, which made
 * the written instruction close to useless at the moment it mattered. This reads it aloud
 * instead, in his own app language — the turn text already arrives translated from the server,
 * so the only job here is choosing a voice that can pronounce it and deciding when to talk.
 *
 * Deliberately quiet: two utterances per turn at most (once when the turn becomes the next one,
 * once just before it), never the same thing twice, and silent the moment he mutes it. A
 * satnav that repeats itself gets switched off and then it cannot help at all.
 */

const MUTE_KEY = "geocliks.nav-voice.muted";

/** Distance at which a turn stops being "ahead" and becomes "now". */
const IMMINENT_M = 80;

/** Our locales, as the voice tags the phone's speech engines actually carry. */
const SPEECH_LANGUAGE: Record<LocaleCode, string> = {
  en: "en-US",
  "fr-CA": "fr-CA",
  es: "es-ES",
  "pt-BR": "pt-BR",
  de: "de-DE",
  it: "it-IT",
  zh: "zh-CN",
  vi: "vi-VN",
  // Google returns no Filipino turn text, so the words are English and the voice must match
  // them — a Filipino voice reading English street names is worse than an English one.
  tl: "en-US",
  ar: "ar-SA",
  pl: "pl-PL",
};

export type VoiceGuide = {
  muted: boolean;
  toggleMuted: () => void;
  /**
   * Say an instruction. Identical text is ignored while it is still the current one, so this is
   * safe to call on every GPS fix.
   */
  say: (text: string, key: string) => void;
  /** Drop the spoken history — call when the route is recalculated. */
  reset: () => void;
};

export function useNavVoice(locale: LocaleCode): VoiceGuide {
  // Starts muted until storage answers, so a driver who switched it off last week does not get
  // shouted at during the first second of this drive.
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const spoken = useRef<string | null>(null);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(MUTE_KEY);
        if (live) setMuted(stored === "1");
      } catch {
        // Unreadable storage: default to speaking, which is what a driver who opened a
        // navigation screen almost certainly wants.
        if (live) setMuted(false);
      } finally {
        if (live) setLoaded(true);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  // Leaving the screen with a sentence still in the air would follow him into the camera.
  useEffect(() => {
    return () => {
      try {
        void Speech.stop();
      } catch {
        // Nothing was speaking.
      }
    };
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (next) {
        try {
          void Speech.stop();
        } catch {
          // Nothing was speaking.
        }
      }
      void AsyncStorage.setItem(MUTE_KEY, next ? "1" : "0").catch(() => {
        // The toggle still holds for this drive; it just will not be remembered.
      });
      return next;
    });
  }, []);

  const say = useCallback(
    (text: string, key: string) => {
      if (!loaded || muted || !text) return;
      if (spoken.current === key) return;
      spoken.current = key;
      try {
        // Interrupt rather than queue: the turn coming up is always more use than the one
        // being described when it was already too late to act on it.
        void Speech.stop();
        Speech.speak(text, {
          language: SPEECH_LANGUAGE[locale] ?? "en-US",
          // Slightly under normal pace — street names read at full speed are the part drivers
          // miss, and there is no way to ask for a repeat at 60 km/h.
          rate: 0.95,
        });
      } catch {
        // No speech engine on the device, or audio is in use. The banner still shows the turn.
      }
    },
    [loaded, muted, locale],
  );

  const reset = useCallback(() => {
    spoken.current = null;
  }, []);

  return { muted, toggleMuted, say, reset };
}

export { IMMINENT_M };
