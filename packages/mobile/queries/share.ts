import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";

/** Live client links for the workspace. Field members only see links tied to their own jobs. */
export function useShareLinks() {
  return useQuery(orpc.share.list.queryOptions({ staleTime: 15_000 }));
}

function useShareInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: orpc.share.key() });
}

export function useCreateShareLink() {
  const invalidate = useShareInvalidate();
  return useMutation(orpc.share.create.mutationOptions({ onSuccess: invalidate }));
}

/** Mints (or reuses) a public link for a single photo so it can go out the native share sheet. */
export function useCreatePhotoShareLink() {
  const invalidate = useShareInvalidate();
  return useMutation(orpc.share.forPhoto.mutationOptions({ onSuccess: invalidate }));
}

export function useRevokeShareLink() {
  const invalidate = useShareInvalidate();
  return useMutation(orpc.share.revoke.mutationOptions({ onSuccess: invalidate }));
}
