import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";

/**
 * The phone's side of the time clock. Mirror of `packages/web/src/web/queries/time-clock.ts`.
 *
 * One read per month: the server pairs punches into shifts before they leave it, so the little
 * calendar on the phone never has to work out which clock-out closed which clock-in. The window
 * is epoch milliseconds computed on the device, because the day a punch falls on is a question
 * about the reader's own clock.
 */
export function useTimeClock(input: { from: number; to: number; userId?: string | null }) {
  return useQuery(
    orpc.timeClock.list.queryOptions({
      input: { from: input.from, to: input.to, userId: input.userId ?? null },
      staleTime: 15_000,
    }),
  );
}

/** On the clock or off it, read from the last punch rather than a status column. */
export function useOnClock(userId?: string | null) {
  return useQuery(
    orpc.timeClock.current.queryOptions({
      input: { userId: userId ?? null },
      staleTime: 10_000,
    }),
  );
}

/**
 * A stamp with no photo — kind, the moment, and wherever the phone says it is standing.
 *
 * Separate from the CLOCK-mode camera buttons on the capture screen: those shoot an
 * arrival/departure photo and the server punches the clock off the back of it, which is what
 * keeps a shot taken in a dead zone punching for the moment it was taken. This is the same
 * punch without the picture, for crew who only need the stamp.
 */
export function usePunch() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.timeClock.punch.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.timeClock.key() });
      },
    }),
  );
}
