import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";

/** Routes the signed-in user may see. A field member only ever gets their own. */
export function useRoutes() {
  return useQuery(orpc.routes.list.queryOptions({ input: {}, staleTime: 15_000 }));
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

export function useFailedReasons() {
  return useQuery(orpc.routes.failedReasons.queryOptions({ staleTime: 300_000 }));
}
