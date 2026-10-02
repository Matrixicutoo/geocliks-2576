import type { QueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { authClient } from "./auth";
import { clearPendingInvite } from "./pending-invite";

/** Where older builds kept the managed-auth (Google) token, before lib/auth.ts merged it in. */
const MANAGED_TOKEN_KEY = "runable.managed-auth.token";

/**
 * Signs the crew member out for real.
 *
 * Since the single-slot change in lib/auth.ts every sign-in path writes ONE token, and the
 * `/sign-out` response hook there clears it. `managedAuth.clearToken()` hits that same store, so
 * it is the offline backstop: if the network call fails, the local token still goes. The raw
 * legacy key is removed too, in case a phone upgraded mid-session still holds an old copy. The
 * stashed invite code goes as well, so the next account on this device does not redeem someone
 * else's invite.
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
