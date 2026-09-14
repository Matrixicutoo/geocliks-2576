import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { markTeamspaceNudgeSeen, teamspaceNudgeSeen } from "@/lib/teamspace-nudge";

/**
 * How long the capture screen has to sit in front of a signed-out user before the Teamspace
 * sheet slides up.
 *
 * The whole point of the public camera is that someone can install the app on a job site and
 * take verified evidence inside ten seconds. A pitch on launch would land in the middle of
 * that, so it waits until the app has had a chance to prove itself — long enough to have taken
 * a shot or two, short enough to still be in the same session.
 */
const DELAY_MS = 30_000;

/**
 * The delayed, once-per-install "create your Teamspace" pitch on the capture tab.
 *
 * `armed` is the caller's whole say in whether the pitch is welcome right now — signed out, not
 * recording, no other sheet already open. The timer only runs while it is true *and* the screen
 * is focused, and it restarts rather than resumes: a user who spends the delay inside the
 * project picker has not been sitting on the capture screen, which is the thing being measured.
 *
 * Nothing here reads a session directly. The capture screen already knows whether it has one
 * (and whether that answer has settled), and a second subscription could disagree with it.
 */
export function useTeamspaceNudge(armed: boolean) {
  const [visible, setVisible] = useState(false);
  /**
   * `null` until storage answers. Both later states are terminal for this launch: the sheet has
   * had its turn, or this install already used it up.
   */
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    void teamspaceNudgeSeen().then((already) => {
      if (alive) setSeen(already);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Held in a ref as well so the timer callback cannot fire a second sheet between `setSeen`
  // and the re-render that would have cleared its condition.
  const fired = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!armed || seen !== false || fired.current) return;
      const id = setTimeout(() => {
        fired.current = true;
        setSeen(true);
        setVisible(true);
        void markTeamspaceNudgeSeen();
      }, DELAY_MS);
      return () => clearTimeout(id);
    }, [armed, seen]),
  );

  const dismiss = useCallback(() => setVisible(false), []);

  return { visible, dismiss };
}
