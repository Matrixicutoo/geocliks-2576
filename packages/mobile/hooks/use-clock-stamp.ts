import { useCallback, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "@/lib/api";
import { clockStampForCapture } from "@/lib/clock";
import { drainPunches, enqueuePunch, readPunches } from "@/lib/punch-queue";

/** The fix the capture screen already keeps live, passed in rather than measured again here. */
export type StampFix = {
  lat: number | null;
  lng: number | null;
  accuracyM: number | null;
  altitudeM: number | null;
  heading: number | null;
  address: string | null;
};

export type StampResult = { ok: boolean; queued: boolean };

/**
 * A clock punch with the camera closed.
 *
 * This is the whole of CLOCK mode. It takes no picture, writes no `photos` row and never touches
 * the upload queue — which is what keeps a clock-in out of the capture feed, out of the
 * galleries and out of every report built from them. What it does carry is everything a photo's
 * stamp carried: the moment, the fix, the drift the phone measured against the server, the
 * handset it came from. The server seals that the same way it seals a photo.
 *
 * Offline it writes the punch down and returns `queued`. A shift must not depend on bars.
 */
export function useClockStamp() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [waiting, setWaiting] = useState(0);

  /** Push anything held from a dead zone. Safe to call often; a no-op with an empty queue. */
  const flush = useCallback(async () => {
    const { left } = await drainPunches();
    setWaiting(left);
    if (left === 0) await queryClient.invalidateQueries({ queryKey: orpc.timeClock.key() });
    return left;
  }, [queryClient]);

  const stamp = useCallback(
    async (
      kind: "in" | "out",
      fix: StampFix,
      /** The run he was holding, delivery side; the job he was on, field side. Either may be null. */
      routeId: string | null,
      projectId: string | null,
    ): Promise<StampResult> => {
      setPending(true);
      const at = Date.now();
      // Read from storage, not the network: the offset that was true at the tap is the one the
      // server needs to tell a wrong clock from a late punch.
      const clock = await clockStampForCapture();
      const punch = {
        id: `p_${at}_${Math.random().toString(36).slice(2, 8)}`,
        kind,
        at,
        clockOffsetMs: clock.clockOffsetMs,
        clockSyncedAt: clock.clockSyncedAt,
        lat: fix.lat,
        lng: fix.lng,
        accuracyM: fix.accuracyM,
        altitudeM: fix.altitudeM,
        heading: fix.heading,
        address: fix.address,
        routeId,
        projectId,
        deviceModel: Constants.deviceName ?? null,
        platform: Platform.OS,
        note: null,
      };
      try {
        // Anything stuck from earlier goes first, so the day reads in the order it happened.
        await drainPunches();
        await client.timeClock.stamp({
          kind: punch.kind,
          at: punch.at,
          clockOffsetMs: punch.clockOffsetMs,
          clockSyncedAt: punch.clockSyncedAt,
          lat: punch.lat,
          lng: punch.lng,
          accuracyM: punch.accuracyM,
          altitudeM: punch.altitudeM,
          heading: punch.heading,
          address: punch.address,
          routeId: punch.routeId,
          projectId: punch.projectId,
          deviceModel: punch.deviceModel,
          platform: punch.platform,
          note: punch.note,
        });
        setWaiting((await readPunches()).length);
        await queryClient.invalidateQueries({ queryKey: orpc.timeClock.key() });
        return { ok: true, queued: false };
      } catch {
        const items = await enqueuePunch(punch);
        setWaiting(items.length);
        return { ok: true, queued: true };
      } finally {
        setPending(false);
      }
    },
    [queryClient],
  );

  return { stamp, flush, pending, waiting };
}
