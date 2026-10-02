import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";

/**
 * Stops the phone dimming and locking while this screen is the one in front.
 *
 * Used on the two screens a crew member watches without touching: the camera (lining up a shot,
 * waiting for GPS to settle) and turn-by-turn navigation (phone in a dash mount). Everywhere else
 * the phone's own auto-lock applies as normal.
 *
 * Tied to focus rather than mount on purpose: the Capture tab stays mounted when you switch to
 * another tab, and a mount-scoped lock would keep the screen awake on every tab after it. Each
 * screen passes its own tag so leaving one cannot release the other's lock. When the app goes to
 * the background the OS drops the lock by itself.
 */
export function useKeepScreenOn(tag: string) {
  useFocusEffect(
    useCallback(() => {
      // Web preview: the browser Wake Lock API can refuse (no user gesture, unsupported). Not fatal.
      activateKeepAwakeAsync(tag).catch(() => {});
      return () => {
        try {
          void deactivateKeepAwake(tag);
        } catch {
          // Nothing was held.
        }
      };
    }, [tag]),
  );
}
