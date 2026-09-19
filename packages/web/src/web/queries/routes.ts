import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useRoutes(input?: { date?: string; status?: string }) {
  return useQuery(
    orpc.routes.list.queryOptions({
      input: (input ?? {}) as { date?: string },
      staleTime: 15_000,
    }),
  );
}

export function useRoute(id: string) {
  return useQuery(
    orpc.routes.get.queryOptions({ input: { id }, staleTime: 10_000, enabled: Boolean(id) }),
  );
}

function useRouteInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.routes.key() });
  };
}

const PULSE_MS = 15_000;

/**
 * Keeps the delivery board current while a run is out, with no browser refresh.
 *
 * The dispatcher's half of what `useLivePhotoFeed` does for captures: the driver's phone is
 * what changes this data, so nothing in the watching browser ever invalidated it and the board
 * sat on the state it was loaded with — a run showing 0 of 12 long after the driver had
 * finished. `routes.pulse` is a cheap fingerprint of the board; the real queries are refetched
 * only when it moves.
 *
 * `enabled` matters here rather than being a nicety: the endpoint refuses a field member, so
 * polling it from the field dashboard would be a 403 every 15 seconds. The delivery pages are
 * behind the same check, so nobody who can see a route is left out.
 */
export function useLiveDeliveryBoard(enabled: boolean) {
  const queryClient = useQueryClient();
  const pulse = useQuery(
    orpc.routes.pulse.queryOptions({
      enabled,
      staleTime: 0,
      refetchInterval: PULSE_MS,
      // Not in the background: a hidden tab has no board to keep fresh, and React Query
      // refetches on focus, so coming back catches up anyway.
      retry: false,
    }),
  );

  const seen = useRef<string | null>(null);
  const token = pulse.data?.token ?? null;

  useEffect(() => {
    if (!token) return;
    // The first token is the state the page already rendered — remember it, refetch nothing.
    if (seen.current === null) {
      seen.current = token;
      return;
    }
    if (seen.current === token) return;
    seen.current = token;
    // The whole routes namespace: the runs list, the open run's stops, and its event log all
    // describe the same delivery that just moved.
    void queryClient.invalidateQueries({ queryKey: orpc.routes.key() });
  }, [token, queryClient]);
}

export function useCreateRoute() {
  const invalidate = useRouteInvalidate();
  return useMutation(orpc.routes.create.mutationOptions({ onSuccess: invalidate }));
}

export function useUpdateRoute() {
  const invalidate = useRouteInvalidate();
  return useMutation(orpc.routes.update.mutationOptions({ onSuccess: invalidate }));
}

export function useAddStops() {
  const invalidate = useRouteInvalidate();
  return useMutation(orpc.routes.addStops.mutationOptions({ onSuccess: invalidate }));
}

/** Dispatch mode: slot one live order into a run that is already moving. */
export function useAddLiveStop() {
  const invalidate = useRouteInvalidate();
  return useMutation(orpc.routes.addLiveStop.mutationOptions({ onSuccess: invalidate }));
}

export function useGeocodeStops() {
  const invalidate = useRouteInvalidate();
  return useMutation(orpc.routes.geocodeStops.mutationOptions({ onSuccess: invalidate }));
}

export function useUpdateStop() {
  const invalidate = useRouteInvalidate();
  return useMutation(orpc.routes.updateStop.mutationOptions({ onSuccess: invalidate }));
}

export function useRemoveStop() {
  const invalidate = useRouteInvalidate();
  return useMutation(orpc.routes.removeStop.mutationOptions({ onSuccess: invalidate }));
}

export function useReorderStops() {
  const invalidate = useRouteInvalidate();
  return useMutation(orpc.routes.reorder.mutationOptions({ onSuccess: invalidate }));
}

export function useOptimizeRoute() {
  const invalidate = useRouteInvalidate();
  return useMutation(orpc.routes.optimize.mutationOptions({ onSuccess: invalidate }));
}

export function useAssignRoute() {
  const invalidate = useRouteInvalidate();
  return useMutation(orpc.routes.assign.mutationOptions({ onSuccess: invalidate }));
}

export function useRemoveRoute() {
  const invalidate = useRouteInvalidate();
  return useMutation(orpc.routes.remove.mutationOptions({ onSuccess: invalidate }));
}

/**
 * Address suggestions for a partial query, debounced by the caller.
 *
 * `staleTime: Infinity` because the same three letters always produce the same list, and every
 * miss is a billed Google request. An empty array is a normal answer — it means suggestions are
 * unavailable, and the field carries on as a plain text box.
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
