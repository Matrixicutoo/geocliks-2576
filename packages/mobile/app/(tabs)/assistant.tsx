import { useEffect } from "react";
import { Redirect } from "expo-router";
import { openAssistant } from "@/lib/assistant";

/**
 * The assistant's tab-bar slot.
 *
 * Pressing the tab never navigates here — the tab bar intercepts the press and slides the chat
 * sheet up over whatever screen you were on, so you keep your place. This screen exists only so
 * the tab has a registered route to hang off, and so a deep link to `/assistant` still does the
 * sensible thing: open the sheet and land on Capture rather than on a blank screen.
 */
export default function AssistantTabScreen() {
  useEffect(() => {
    openAssistant();
  }, []);

  return <Redirect href="/" />;
}
