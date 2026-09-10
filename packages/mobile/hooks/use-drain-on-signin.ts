import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { drainQueue, readQueue } from "@/lib/queue";
import { syncClock } from "@/lib/clock";

/**
 * Uploads anything captured before signing in, as soon as a session exists.
 *
 * Someone can install the app and start shooting immediately, with no account. Those
 * captures sit in the offline queue exactly like photos taken in a dead zone — the
 * upload path needs a session to presign and seal, so it cannot run yet. The moment
 * they register or log in, this drains the queue and the photos land in their team
 * space without them having to do anything.
 *
 * The clock is re-synced first: these captures may have been taken minutes after a
 * fresh install, before the app ever reached the server, so the offset stored at
 * shutter time can be missing. Syncing now does not retroactively fix those, but it
 * stops the same gap repeating on the next shot.
 *
 * Failures leave the queue alone. The items keep their place and the queue screen
 * shows the real reason, same as any other failed upload.
 */
export function useDrainOnSignIn(hasSession: boolean) {
  const qc = useQueryClient();
  const done = useRef(false);

  useEffect(() => {
    if (!hasSession) {
      // Signing out arms it again, so the next person to sign in on this device still
      // gets their own captures drained.
      done.current = false;
      return;
    }
    if (done.current) return;
    done.current = true;
    void (async () => {
      try {
        const waiting = await readQueue();
        if (waiting.length === 0) return;
        await syncClock();
        const outcome = await drainQueue();
        if (outcome.uploaded > 0) void qc.invalidateQueries();
      } catch {
        // Offline, or the seal was refused. The queue keeps the captures and the
        // queue screen explains it; retrying here would only spin.
      }
    })();
  }, [hasSession, qc]);
}
