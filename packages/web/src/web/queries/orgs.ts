import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Current workspace: org, role, plan, usage counters. */
export function useOrg() {
  return useQuery(orpc.orgs.current.queryOptions({ staleTime: 30_000 }));
}

/**
 * First-run onboarding: your name, the Teamspace name and which system you run, in one call.
 * The product answer is what starts the 7-day trial, so the org query has to be refetched —
 * the plan, the trial banner and the setup gate itself all read from it.
 */
export function useSetupOrg() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.orgs.setup.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.orgs.key() }),
    }),
  );
}

/** Switch systems after onboarding. Never touches the trial — the free week is granted once. */
export function useSetProduct() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.orgs.setProduct.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.orgs.key() }),
    }),
  );
}

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

export function useTemplates() {
  return useQuery(orpc.orgs.templates.list.queryOptions({ staleTime: 30_000 }));
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.orgs.templates.create.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.orgs.key() }),
    }),
  );
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.orgs.templates.update.mutationOptions({
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

export function useRemoveTemplate() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.orgs.templates.remove.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.orgs.key() }),
    }),
  );
}
