import type { QueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { authClient } from "./auth";
import { clearPendingInvite } from "./pending-invite";

/** Key the managed-auth Expo client persists its broker JWT under. */
const MANAGED_TOKEN_KEY = "runable.managed-auth.token";

/**
 * Signs the crew member out for real.
 *
 * There are TWO tokens on this device: the email/password bearer (cleared by the `/sign-out`
 * response hook in lib/auth.ts) and the managed-auth (Google) broker JWT. Dropping only the
 * server session leaves the managed token in place, so `authClient.useSession()` keeps resolving
 * a session and the router gate bounces the user straight back into the app — which is exactly
 * why sign-out looked broken for Google accounts. Clear both, always, even if the network call
 * fails. The stashed invite code goes too, so the next account on this device does not redeem
 * someone else's invite.
 */
export async function signOutCompletely(queryClient: QueryClient): Promise<void> {
  try {
    await authClient.signOut();
  } catch {
    // Even if the server call fails the local tokens must still go.
  }

  try {
    await authClient.managedAuth.clearToken();
  } catch {
    // Plugin unavailable or nothing stored — the raw key removal below is the backstop.
  }

  // Belt and braces: if `clearToken()` ever changes its storage location, an orphaned JWT here
  // would resurrect the session on next boot.
  try {
    if (Platform.OS === "web") globalThis.localStorage?.removeItem(MANAGED_TOKEN_KEY);
    else await SecureStore.deleteItemAsync(MANAGED_TOKEN_KEY);
  } catch {
    // Storage unavailable: the plugin call above already did the work.
  }

  await clearPendingInvite();
  queryClient.clear();
}
