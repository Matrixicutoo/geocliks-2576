import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useShareLinks() {
  return useQuery(orpc.share.list.queryOptions({ staleTime: 15_000 }));
}

/** Public share view — no auth required. */
export function useShareView(token: string) {
  return useQuery(
    orpc.share.view.queryOptions({
      input: { token },
      enabled: Boolean(token),
      retry: false,
      staleTime: 30_000,
    }),
  );
}

function useShareInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: orpc.share.key() });
}

export function useCreateShareLink() {
  const invalidate = useShareInvalidate();
  return useMutation(orpc.share.create.mutationOptions({ onSuccess: invalidate }));
}

/** Mints (or reuses) a public link for a single photo. */
export function useCreatePhotoShareLink() {
  const invalidate = useShareInvalidate();
  return useMutation(orpc.share.forPhoto.mutationOptions({ onSuccess: invalidate }));
}

export function useRevokeShareLink() {
  const invalidate = useShareInvalidate();
  return useMutation(orpc.share.revoke.mutationOptions({ onSuccess: invalidate }));
}
