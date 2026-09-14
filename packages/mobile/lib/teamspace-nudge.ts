import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * The once-per-install flag behind the "create your Teamspace" sheet.
 *
 * The sheet is a pitch, not a gate, so it gets exactly one chance: a crew member who came for
 * the camera and said no thanks must never see it again, on any later launch. The flag is
 * written the moment the sheet appears rather than when it is dismissed — a launch that ends
 * with the app killed mid-sheet still counts as the one showing.
 *
 * Versioned like the other capture keys, so a rewrite of the pitch can deliberately give
 * everyone one more look. `.v2` is that: the sheet now comes down from the top rather than up
 * over the shutter, and anyone who saw the first version saw it land on the controls.
 */
const KEY = "geocliks.teamspace-nudge.v2";

/** Whether this install has already had its one look at the sheet. */
export async function teamspaceNudgeSeen(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === "1";
  } catch {
    // Unreadable storage is treated as seen. Showing the sheet on every launch is far worse
    // than never showing it at all.
    return true;
  }
}

export async function markTeamspaceNudgeSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, "1");
  } catch {
    // Best effort. The in-memory guard still holds for the rest of this launch.
  }
}
