import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";
import { useHasSession } from "@/hooks/use-session";

export function usePhotos(filter: {
  projectId?: string | null;
  /** Personal captures — everything not filed under a project yet. */
  unassigned?: boolean;
  kind?: "photo" | "video";
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

// Off until signed in — the capture screen reads it, and video allowance is a plan
// question, so there is nothing to ask about before there is a workspace.
export function useVideoPolicy() {
  const { hasSession } = useHasSession();
  return useQuery(
    orpc.photos.videoPolicy.queryOptions({ staleTime: 60_000, enabled: hasSession }),
  );
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

/**
 * File personal captures under a project (or send them back to the personal page with
 * `projectId: null`). Takes a list because the same call serves one capture from the
 * detail sheet and a whole selection later.
 */
export function useMovePhotos() {
  const invalidate = useInvalidatePhotos();
  return useMutation(orpc.photos.move.mutationOptions({ onSuccess: invalidate }));
}
