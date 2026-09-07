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
