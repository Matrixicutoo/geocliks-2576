import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * A crew member can scan an invite QR before they have an account. The code is
 * stashed here so it survives the sign-in / sign-up round trip, then accepted
 * automatically the moment a session appears (see hooks/use-pending-invite.ts).
 */
const KEY = "geocliks.invite.pending";

export async function readPendingInvite(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const code = (raw ?? "").trim();
    return code.length >= 4 ? code : null;
  } catch {
    return null;
  }
}

export async function savePendingInvite(code: string): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, code.trim().toLowerCase());
  } catch {
    // Best effort — losing the stash only means the user types the code again.
  }
}

export async function clearPendingInvite(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Ignored on purpose.
  }
}
