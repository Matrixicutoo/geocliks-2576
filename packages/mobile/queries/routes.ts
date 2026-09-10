import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";
import { useHasSession } from "@/hooks/use-session";

/** Routes the signed-in user may see. A field member only ever gets their own. */
export function useRoutes() {
  // Mounted by the tab bar on every screen, so it has to stay off until there is a session.
  const { hasSession } = useHasSession();
  return useQuery(
    orpc.routes.list.queryOptions({ input: {}, enabled: hasSession, staleTime: 15_000 }),
  );
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
