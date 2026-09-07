import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Display name / avatar changes — refresh the workspace header afterwards. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.account.updateProfile.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.orgs.key() }),
    }),
  );
}

/** Emails the signed-in user a reset link so they never have to type the old password. */
export function useSendPasswordResetLink() {
  return useMutation(orpc.account.sendPasswordResetLink.mutationOptions());
}

/** Permanent account deletion — owners also lose the workspace and its photos. */
export function useDeleteAccount() {
  return useMutation(orpc.account.destroy.mutationOptions());
}
