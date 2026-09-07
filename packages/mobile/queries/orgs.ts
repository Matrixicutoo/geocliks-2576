import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";

export function useOrg() {
  return useQuery(orpc.orgs.current.queryOptions({ staleTime: 30_000 }));
}

export function useTemplates() {
  return useQuery(orpc.orgs.templates.list.queryOptions({ staleTime: 60_000 }));
}

/** Renaming the teamspace (business name). Owners and admins only. */
export function useUpdateOrg() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.orgs.update.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.orgs.key() }),
    }),
  );
}

/** Workspace-wide appearance defaults (theme, locale). Admins only. */
export function useSetAppearance() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.orgs.setAppearance.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.orgs.key() }),
    }),
  );
}

export function useSetDefaultTemplate() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.orgs.templates.setDefault.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.orgs.key() }),
    }),
  );
}
