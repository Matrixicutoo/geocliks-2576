import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { client } from "@/lib/api";

/** Where the last registration outcome is parked so Settings can show it. */
export const PUSH_STATUS_KEY = "geocliks.push.status";

/**
 * Push registration fails silently by design — a field crew must never see a token error mid-job.
 * That silence made three straight builds undiagnosable, so every branch now records what it did
 * and the Settings screen reads it back. Diagnostics only; nothing here changes delivery.
 */
function note(status: string) {
  void AsyncStorage.setItem(PUSH_STATUS_KEY, `${status}\n${new Date().toISOString()}`);
}

/**
 * Registers this device for message push once the user is signed in.
 *
 * Three cases bail out quietly, because messaging must keep working either way:
 *  - web has no Expo push transport;
 *  - Expo Go dropped remote notifications in SDK 53, and merely *importing* expo-notifications
 *    there raises a red console error, so the module is required lazily below and never touched
 *    inside Expo Go;
 *  - the Expo push service needs an EAS project id, which only exists in an EAS build.
 * The phone will only buzz once the app is built with EAS credentials (a development or store
 * build), never in Expo Go.
 */
export function usePushToken(enabled: boolean) {
  const done = useRef(false);

  useEffect(() => {
    if (!enabled || done.current) return;
    if (Platform.OS === "web") return;
    // Expo Go reports appOwnership "expo" / executionEnvironment "storeClient".
    if (String(Constants.appOwnership) === "expo") {
      note("SKIPPED — running in Expo Go, which cannot receive push");
      return;
    }
    if (String(Constants.executionEnvironment) === "storeClient") {
      note("SKIPPED — running in Expo Go, which cannot receive push");
      return;
    }
    const projectId =
      (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas
        ?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      note("FAILED — no EAS project id in this build");
      return;
    }
    done.current = true;

    void (async () => {
      try {
        note(`WORKING — asking permission (project ${projectId.slice(0, 8)}…)`);
        // Lazy require: keeps expo-notifications out of the bundle's eval path in Expo Go.
        const Notifications = require("expo-notifications") as typeof import("expo-notifications");
        const existing = await Notifications.getPermissionsAsync();
        let status = existing.status;
        if (status !== "granted") status = (await Notifications.requestPermissionsAsync()).status;
        if (status !== "granted") {
          note(`FAILED — Android denied notification permission (${status})`);
          return;
        }
        note("WORKING — permission granted, requesting push token");
        const token = await Notifications.getExpoPushTokenAsync({ projectId });
        note(`WORKING — got token ${token.data.slice(0, 22)}…, saving to server`);
        await client.messages.registerPushToken({ token: token.data, platform: Platform.OS });
        note(`REGISTERED — this device will receive push (${token.data.slice(0, 22)}…)`);
      } catch (err) {
        // Push is a nice-to-have: never let a token failure surface to the field crew.
        note(`FAILED — ${err instanceof Error ? err.message : String(err)}`);
      }
    })();
  }, [enabled]);
}
