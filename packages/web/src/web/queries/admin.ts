import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Is the signed-in account platform staff? Also reports active impersonation. */
export function useAdminMe() {
  return useQuery(orpc.admin.me.queryOptions({ staleTime: 60_000, retry: false }));
}

export function useAdminOverview() {
  return useQuery(orpc.admin.overview.queryOptions({ staleTime: 15_000, retry: false }));
}

export function useAdminUsers(q: string) {
  return useQuery(
    orpc.admin.users.list.queryOptions({ input: { q, limit: 100 }, staleTime: 10_000 }),
  );
}

export function useAdminWorkspaces(q: string) {
  return useQuery(orpc.admin.users.workspaces.queryOptions({ input: { q }, staleTime: 10_000 }));
}

export function useAdminPlans() {
  return useQuery(orpc.admin.plans.list.queryOptions({ staleTime: 10_000 }));
}

function invalidator(queryClient: ReturnType<typeof useQueryClient>) {
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.admin.key() });
    queryClient.invalidateQueries({ queryKey: orpc.billing.key() });
    queryClient.invalidateQueries({ queryKey: orpc.orgs.key() });
  };
}

export function useSetStaff() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.users.setStaff.mutationOptions({ onSuccess: invalidator(queryClient) }),
  );
}

export function useSetSuspended() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.users.setSuspended.mutationOptions({ onSuccess: invalidator(queryClient) }),
  );
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.users.remove.mutationOptions({ onSuccess: invalidator(queryClient) }),
  );
}

export function useImpersonate() {
  return useMutation(orpc.admin.users.impersonate.mutationOptions());
}

export function useSetWorkspacePlan() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.users.setWorkspacePlan.mutationOptions({ onSuccess: invalidator(queryClient) }),
  );
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.plans.update.mutationOptions({ onSuccess: invalidator(queryClient) }),
  );
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.plans.create.mutationOptions({ onSuccess: invalidator(queryClient) }),
  );
}

export function useSetPlanVisible() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.plans.setVisible.mutationOptions({ onSuccess: invalidator(queryClient) }),
  );
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.plans.remove.mutationOptions({ onSuccess: invalidator(queryClient) }),
  );
}

/** Company-wide marketing-site settings (social links) shown in the admin console. */
export function useAdminSocials() {
  return useQuery(orpc.admin.site.socials.queryOptions({ staleTime: 10_000, retry: false }));
}

export function useUpdateSocials() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.admin.site.updateSocials.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.admin.key() });
        queryClient.invalidateQueries({ queryKey: orpc.site.key() });
      },
    }),
  );
}
