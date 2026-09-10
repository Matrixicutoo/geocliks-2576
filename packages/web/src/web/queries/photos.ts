import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export type PhotoFilter = {
  projectId?: string | null;
  userId?: string | null;
  /**
   * Must stay in step with `tagEnum` in api/routes/photos.ts. "pickup" and "delivery" were added
   * there with the delivery-routes feature but never mirrored here, so the Teamspace tag filter
   * could not be typed against them.
   */
  tag?:
    | "general"
    | "before"
    | "after"
    | "issue"
    | "arrival"
    | "departure"
    | "pickup"
    | "delivery"
    | null;
  search?: string | null;
  limit?: number;
  offset?: number;
};

export function usePhotos(filter: PhotoFilter = {}) {
  return useQuery(orpc.photos.list.queryOptions({ input: filter, staleTime: 10_000 }));
}

export function usePhoto(id: string | null) {
  return useQuery(
    orpc.photos.get.queryOptions({
      input: { id: id ?? "" },
      enabled: Boolean(id),
      staleTime: 10_000,
    }),
  );
}

export function usePhotoStats() {
  return useQuery(orpc.photos.stats.queryOptions({ staleTime: 20_000 }));
}

export function usePhotoMap(projectId?: string | null) {
  return useQuery(orpc.photos.map.queryOptions({ input: { projectId }, staleTime: 20_000 }));
}

function usePhotoInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.photos.key() });
    queryClient.invalidateQueries({ queryKey: orpc.projects.key() });
  };
}

export function useVerifyPhoto() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.verify.mutationOptions({ onSuccess: invalidate }));
}

export function useUpdatePhoto() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.update.mutationOptions({ onSuccess: invalidate }));
}

export function useMovePhoto() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.move.mutationOptions({ onSuccess: invalidate }));
}

export function useRemovePhoto() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.remove.mutationOptions({ onSuccess: invalidate }));
}

export function useRemovePhotos() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.removeMany.mutationOptions({ onSuccess: invalidate }));
}

export function useCreatePhoto() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.create.mutationOptions({ onSuccess: invalidate }));
}

export function useComparisons(projectId?: string | null) {
  return useQuery(
    orpc.photos.comparisons.list.queryOptions({ input: { projectId }, staleTime: 15_000 }),
  );
}

export function useCreateComparison() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.comparisons.create.mutationOptions({ onSuccess: invalidate }));
}

export function useRemoveComparison() {
  const invalidate = usePhotoInvalidate();
  return useMutation(orpc.photos.comparisons.remove.mutationOptions({ onSuccess: invalidate }));
}
