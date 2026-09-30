import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";
import { useHasSession } from "@/hooks/use-session";
import { todayLocal } from "@/lib/day";
import { useOrg } from "@/queries/orgs";

/** The little of a route row that decides whether it is waiting for the driver. */
type WaitingShape = { driverId: string | null; status: string; date: string };

/**
 * The runs waiting for one driver: handed to him and not yet started.
 *
 * This is the single definition of "there is a delivery waiting for you", because two places
 * show it and they must never disagree — the red count on the truck beside the shutter, and the
 * red count on the Routes tab. `assigned` is precisely the not-yet-started state: the moment he
 * taps START the route turns `active` and stops being a thing he has to be prodded about.
 *
 * Every date counts, not just today's. Dispatch plans ahead — a run built on Sunday for
 * Thursday is the normal case, not the exception — and a date window meant the driver got the
 * push telling him about a new run and then found no badge anywhere in the app, which is worse
 * than no badge at all. If it has his name on it and he has not started it, it is waiting.
 */
export function waitingRoutesFor<T extends WaitingShape>(
  rows: T[] | undefined,
  myUserId: string | null,
): T[] {
  if (!myUserId || !rows) return [];
  const today = todayLocal();
  // Which one the truck opens, since it opens the first: today's run, else the next one coming
  // up, else the most recently missed. Dates are YYYY-MM-DD, so a string compare is a date
  // compare.
  const rank = (d: string) => (d === today ? 0 : d > today ? 1 : 2);
  return rows
    .filter((r) => r.driverId === myUserId && r.status === "assigned")
    .sort((a, b) => {
      const ra = rank(a.date);
      const rb = rank(b.date);
      if (ra !== rb) return ra - rb;
      // Upcoming: soonest first. Missed: most recent first. Both are "closest to today".
      if (a.date === b.date) return 0;
      return ra === 1 ? (a.date < b.date ? -1 : 1) : a.date > b.date ? -1 : 1;
    });
}

/**
 * Routes the signed-in user may see. A field member only ever gets their own.
 *
 * Archived runs are left out by default — `archived: true` reads only the filed ones, which is
 * what the Archived tab on the routes list asks for.
 */
export function useRoutes(input?: { archived?: boolean }) {
  // Mounted by the tab bar on every screen, so it has to stay off until there is a session.
  const { hasSession } = useHasSession();
  return useQuery(
    orpc.routes.list.queryOptions({
      input: input?.archived ? { archived: true } : {},
      enabled: hasSession,
      staleTime: 15_000,
    }),
  );
}

/** `waitingRoutesFor` over the signed-in member's own list. */
export function useWaitingRoutes() {
  const routes = useRoutes();
  const org = useOrg();
  const myUserId = org.data?.user?.id ?? null;
  return useMemo(() => waitingRoutesFor(routes.data, myUserId), [routes.data, myUserId]);
}

export function useRoute(id: string | null) {
  return useQuery(
    orpc.routes.get.queryOptions({
      input: { id: id ?? "" },
      enabled: !!id,
      staleTime: 5_000,
    }),
  );
}

export function useInvalidateRoutes() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.routes.key() });
  };
}

export function useStartRoute() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.start.mutationOptions({ onSuccess: invalidate }));
}

/** Closes a stop with its proof photo. Used when the photo is already uploaded. */
export function useCompleteStop() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.completeStop.mutationOptions({ onSuccess: invalidate }));
}

/**
 * Closes a stop as skipped. No photo: the driver is reporting there was nothing to
 * deliver, so this deliberately does not go through completeStop.
 */
export function useSkipStop() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.skipStop.mutationOptions({ onSuccess: invalidate }));
}

/**
 * File a finished run away, or put it back. Nothing is deleted either way: `useRemoveRoute`
 * below is the destructive one. The server refuses to archive a run that is not over.
 */
export function useArchiveRoute() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.archive.mutationOptions({ onSuccess: invalidate }));
}

/** Deleting a run. Owner/admin only - the server enforces the same rule. */
export function useRemoveRoute() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.remove.mutationOptions({ onSuccess: invalidate }));
}

export function useFailedReasons() {
  return useQuery(orpc.routes.failedReasons.queryOptions({ staleTime: 300_000 }));
}

/** Building a run from the phone. Dispatcher and above - the server enforces the same rule. */
export function useCreateRoute() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.create.mutationOptions({ onSuccess: invalidate }));
}

/**
 * Tack one extra delivery onto a run that is already moving. The server slots it by distance
 * rather than reshuffling the plan under a driver, and it never lands ahead of the stop in hand.
 *
 * A dispatcher may add one to any run; a driver only to their own run, and only once it is
 * started. That rule lives on the server, so the button failing is the message to show.
 */
export function useAddLiveStop() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.addLiveStop.mutationOptions({ onSuccess: invalidate }));
}

/**
 * Address suggestions for a start address or a live stop.
 *
 * Cached forever and never retried on purpose: Google bills per lookup, so retyping the same
 * address costs nothing and a failure stays quiet. An empty list is the normal "suggestions are
 * off" answer, which leaves the caller as an ordinary text box.
 */
export function useAddressSuggestions(query: string) {
  return useQuery(
    orpc.routes.suggestAddress.queryOptions({
      input: { query },
      enabled: query.trim().length >= 3,
      staleTime: Infinity,
      gcTime: 10 * 60_000,
      retry: false,
      placeholderData: (prev) => prev,
    }),
  );
}

/**
 * Hands a run to a driver, or takes it back. One driver per run, so this replaces whoever held
 * it; a null driver drops the run back to `draft` on the server. Dispatcher and above - the
 * server enforces the same rule, so a refusal comes back as the error to show.
 */
export function useAssignRoute() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.assign.mutationOptions({ onSuccess: invalidate }));
}

/**
 * Stops added to a route that is not moving yet — the paste-a-list and CSV-import path in the
 * route builder. `addLiveStop` above is its opposite number: one order, slotted into a run
 * already under way. This one appends in the order given and leaves the ordering to
 * `useOptimizeRoute`.
 */
export function useAddStops() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.addStops.mutationOptions({ onSuccess: invalidate }));
}

/**
 * Turn the pasted address text into pins. Metered — Google bills per address that is not
 * already cached — so this is a button the dispatcher presses, never something that fires on
 * typing. `force` re-asks for addresses that already failed once.
 */
export function useGeocodeStops() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.geocodeStops.mutationOptions({ onSuccess: invalidate }));
}

/** Drops the pin by hand for an address the geocoder could not place. */
export function useSetStopPin() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.setStopPin.mutationOptions({ onSuccess: invalidate }));
}

/**
 * Editing one stop. Changing the address clears its pin server-side, which is why the builder
 * offers Resolve again straight after an edit.
 */
export function useUpdateStop() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.updateStop.mutationOptions({ onSuccess: invalidate }));
}

/** Deleting a stop. The server refuses one that has already been closed. */
export function useRemoveStop() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.removeStop.mutationOptions({ onSuccess: invalidate }));
}

/** Manual ordering — the up/down arrows on each stop row. Marks the route human-ordered. */
export function useReorderStops() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.reorder.mutationOptions({ onSuccess: invalidate }));
}

/**
 * Order the stops for the driver. `backend: "local"` is free and the default; `"google"` is
 * billed per stop and is only offered on plans that carry it — the server silently falls back
 * to local rather than failing, so the button always produces an ordered route.
 */
export function useOptimizeRoute() {
  const invalidate = useInvalidateRoutes();
  return useMutation(orpc.routes.optimize.mutationOptions({ onSuccess: invalidate }));
}

/**
 * One leg of driving for the in-app navigation screen.
 *
 * A mutation rather than a query on purpose. Google bills per Directions request, and a query
 * would refetch on every remount, window focus and cache miss — the navigation screen decides
 * for itself when a leg is worth paying for (once on open, and again only once the driver has
 * left the line).
 */
export function useDirections() {
  return useMutation(orpc.routes.directions.mutationOptions());
}
