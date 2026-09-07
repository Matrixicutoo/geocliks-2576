import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";

export function usePhotos(filter: {
  projectId?: string | null;
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
  limit?: number;
} = {}) {
  return useQuery(orpc.photos.list.queryOptions({ input: filter, staleTime: 10_000 }));
}

export function useMapPins(projectId?: string | null) {
  return useQuery(
    orpc.photos.map.queryOptions({ input: { projectId }, staleTime: 15_000 }),
  );
}

export function usePhoto(id: string | null) {
  return useQuery(
    orpc.photos.get.queryOptions({ input: { id: id ?? "" }, enabled: !!id, staleTime: 10_000 }),
  );
}

export function useVideoPolicy() {
  return useQuery(orpc.photos.videoPolicy.queryOptions({ staleTime: 60_000 }));
}

export function usePhotoStats() {
  return useQuery(orpc.photos.stats.queryOptions({ staleTime: 20_000 }));
}

export function useInvalidatePhotos() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.photos.key() });
    queryClient.invalidateQueries({ queryKey: orpc.projects.key() });
  };
}

export function useVerifyPhoto() {
  const invalidate = useInvalidatePhotos();
  return useMutation(orpc.photos.verify.mutationOptions({ onSuccess: invalidate }));
}

export function useRemovePhoto() {
  const invalidate = useInvalidatePhotos();
  return useMutation(orpc.photos.remove.mutationOptions({ onSuccess: invalidate }));
}
