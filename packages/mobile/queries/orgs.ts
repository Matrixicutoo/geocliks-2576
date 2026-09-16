import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";
import { useHasSession } from "@/hooks/use-session";

// The capture screen runs before sign-up, so these have to stay switched off until there
// is a session. Firing them anonymously would only produce a wall of rejected requests.
export function useOrg() {
  const { hasSession } = useHasSession();
  return useQuery(orpc.orgs.current.queryOptions({ staleTime: 30_000, enabled: hasSession }));
}

export function useTemplates() {
  const { hasSession } = useHasSession();
  return useQuery(
    orpc.orgs.templates.list.queryOptions({ staleTime: 60_000, enabled: hasSession }),
  );
}

/**
 * First-run onboarding, in one call: your name, the Teamspace name, and which system you run.
 * The same mutation the website's setup gate fires — the product answer is what starts the
 * 7-day trial, so this must never be skipped on one client and asked on the other.
 */
export function useSetupOrg() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.orgs.setup.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.orgs.key() }),
    }),
  );
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

/**
 * Tick off one get-started step. Fired when a step's sheet is closed, so the checklist behind it
 * has to be re-read — the org query carries the whole checklist state.
 */
export function useAckSetup() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.orgs.ackSetup.mutationOptions({
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
