import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";

/** Display name / avatar changes — the workspace bootstrap holds the copy the UI renders. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.account.updateProfile.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.orgs.key() }),
    }),
  );
}

export function useDeleteAccount() {
  return useMutation(orpc.account.destroy.mutationOptions({}));
}
