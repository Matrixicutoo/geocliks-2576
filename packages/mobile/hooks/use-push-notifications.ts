import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

/**
 * What happens to a push once it reaches the phone.
 *
 * Registration (`use-push-token`) only earns the right to be sent one. Three separate things
 * decide whether the crew member ever SEES it, and none of them were set up — which is why a
 * delivered push did nothing at all:
 *
 *  - Foreground: Android and iOS hand an arriving push to the app instead of the system tray
 *    when the app is open. Without a notification handler the OS assumes the app is drawing its
 *    own UI for it, so the banner is dropped. Testing with the app open therefore looked like
 *    "push is broken" even on builds where delivery worked.
 *  - Android importance: a channel at default importance lands in the shade silently. A message
 *    from a teammate is worth a heads-up banner and a sound, so the channel is created at max
 *    importance before the first notification can arrive and pin itself to a quieter default.
 *  - The tap: a notification that opens the app on whatever screen it was last on wastes the
 *    thing it was for. Both entry points are handled — tapped while running, and tapped from
 *    cold start, which delivers through `getLastNotificationResponseAsync` instead of the
 *    listener because the listener does not exist yet at that moment.
 *
 * Expo Go cannot receive remote push at all (SDK 53 dropped it) and importing the module there
 * raises a red console error, so everything is behind the same lazy require and environment
 * guards as the token hook.
 */

/** True when this build can actually work with expo-notifications. */
function supported() {
  if (Platform.OS === "web") return false;
  if (String(Constants.appOwnership) === "expo") return false;
  if (String(Constants.executionEnvironment) === "storeClient") return false;
  return true;
}

/** Where a notification wants to go, from the data the server attached to it. */
function routeFor(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const conversationId = typeof d.conversationId === "string" ? d.conversationId : null;
  if (d.kind === "message" && conversationId) return `/messages/${conversationId}`;
  // A run dispatch just handed him. Opens the run itself, not the list: the notification already
  // named it, so making him pick it out of a list again would waste the tap.
  const routeId = typeof d.routeId === "string" ? d.routeId : null;
  if (d.kind === "route" && routeId) return `/route/${routeId}`;
  return null;
}

export function usePushNotifications(enabled: boolean) {
  const router = useRouter();
  /** A cold-start tap must only be honoured once, or every remount reopens that thread. */
  const coldStartHandled = useRef(false);

  useEffect(() => {
    if (!enabled || !supported()) return;
    const Notifications = require("expo-notifications") as typeof import("expo-notifications");

    // Show the banner even while the app is open. `shouldShowBanner`/`shouldShowList` are the
    // SDK 52+ names; the older `shouldShowAlert` is kept so the handler still behaves if this
    // runs against an older notifications build.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    if (Platform.OS === "android") {
      void Notifications.setNotificationChannelAsync("default", {
        name: "Messages and alerts",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FFB021",
      });
    }

    const open = (data: unknown) => {
      const to = routeFor(data);
      if (to) router.push(to as never);
    };

    // Tapped while the app was running (foreground or backgrounded).
    const tapped = Notifications.addNotificationResponseReceivedListener((response) => {
      open(response.notification.request.content.data);
    });

    // Tapped while the app was closed: the response is waiting rather than emitted.
    if (!coldStartHandled.current) {
      coldStartHandled.current = true;
      void Notifications.getLastNotificationResponseAsync().then((response) => {
        if (response) open(response.notification.request.content.data);
      });
    }

    return () => {
      tapped.remove();
    };
  }, [enabled, router]);
}
