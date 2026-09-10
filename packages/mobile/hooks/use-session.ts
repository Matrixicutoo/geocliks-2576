import { authClient } from "@/lib/auth";

/**
 * Whether anyone is signed in, for screens that have to work both ways.
 *
 * The capture screen is the reason this exists: the camera is usable before you have an
 * account, so every workspace query on that screen has to stay switched off until there
 * is a session to make it with. `pending` matters as much as `hasSession` — treating the
 * first render as "signed out" would fire a redirect or an anonymous save at every launch.
 */
export function useHasSession() {
  const { data, isPending } = authClient.useSession();
  return { hasSession: Boolean(data), pending: isPending };
}
