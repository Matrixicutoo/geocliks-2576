import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * The time clock's data layer.
 *
 * One read for the whole calendar: a month of punches arrives already paired into shifts by the
 * server, so the grid below never has to guess which clock-out belongs to which clock-in. The
 * window is passed as epoch milliseconds computed in the browser's zone, because the day a punch
 * lands on is a question about the reader's clock, not the server's.
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

function useTimeClockInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.timeClock.key() });
  };
}

/** A stamp with no photo: kind, and wherever the browser says it is standing. */
export function usePunch() {
  const invalidate = useTimeClockInvalidate();
  return useMutation(orpc.timeClock.punch.mutationOptions({ onSuccess: invalidate }));
}

/** Office-side correction of a punch's time. The place it recorded is left alone. */
export function useAmendPunch() {
  const invalidate = useTimeClockInvalidate();
  return useMutation(orpc.timeClock.amend.mutationOptions({ onSuccess: invalidate }));
}

export function useRemovePunch() {
  const invalidate = useTimeClockInvalidate();
  return useMutation(orpc.timeClock.remove.mutationOptions({ onSuccess: invalidate }));
}

/**
 * One driver's timesheet as a PDF — the document payroll files and the driver signs.
 *
 * Per person on purpose: a sheet covering the whole workspace is nobody's to sign. The browser's
 * own zone goes with the request so the days on the paper are the days the office was just
 * reading on the calendar, not UTC's.
 */
export function useExportTimesheet() {
  return useMutation(
    orpc.timeClock.exportPdf.mutationOptions({
      onSuccess: (result) => {
        // Opened rather than navigated to: the presigned URL is a download, and replacing the
        // page with it would lose the calendar the office is working through.
        window.open(result.url, "_blank", "noopener,noreferrer");
      },
    }),
  );
}
