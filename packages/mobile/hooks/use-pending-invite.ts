import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api";
import { clearPendingInvite, readPendingInvite } from "@/lib/pending-invite";

/**
 * Accepts a stashed invite code as soon as a session exists.
 *
 * A crew member scans the invite QR, lands on /join, has no account yet, signs up, and would
 * otherwise be dropped into their own empty workspace. The code is stashed before sign-in and
 * redeemed here, so they end up inside the workspace that invited them with the invited role.
 *
 * Failures keep the stash: the invite may have been revoked or the workspace may be out of
 * seats, and /join shows the real reason when they open it.
 */
export function usePendingInvite(hasSession: boolean) {
  const qc = useQueryClient();
  const busy = useRef(false);

  useEffect(() => {
    if (!hasSession || busy.current) return;
    busy.current = true;
    void (async () => {
      const code = await readPendingInvite();
      if (!code) return;
      try {
        await client.team.acceptInvite({ code });
        await clearPendingInvite();
        void qc.invalidateQueries();
      } catch {
        // Left in place on purpose — the /join screen explains what went wrong.
      }
    })();
  }, [hasSession, qc]);
}
