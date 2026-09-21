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
 * A punch typed in by hand. Office only — the server refuses crew outright.
 *
 * Crew punch from the CLOCK capture instead (`useClockStamp`), which reads the fix and the
 * device's clock drift and posts a stamp with no photograph behind it. This one exists for the
 * office entering the shift of a driver whose phone died, and every row it writes stays
 * labelled `manual` wherever it is shown.
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
