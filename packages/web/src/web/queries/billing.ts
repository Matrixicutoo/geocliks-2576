import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Public plan catalogue — used on the marketing page. Copy comes back in `locale`. */
export function usePlans(locale: string) {
  return useQuery(
    orpc.billing.plans.queryOptions({ input: { locale }, staleTime: 5 * 60_000 }),
  );
}

export function useBilling(locale: string) {
  return useQuery(
    orpc.billing.current.queryOptions({ input: { locale }, staleTime: 20_000 }),
  );
}

/** Pulls the paid subscription back from the processor after Stripe checkout returns. */
export function useSyncProcessor() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.billing.syncProcessor.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.billing.key() });
        queryClient.invalidateQueries({ queryKey: orpc.orgs.key() });
      },
    }),
  );
}

export function useChangePlan() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.billing.changePlan.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.billing.key() });
        queryClient.invalidateQueries({ queryKey: orpc.orgs.key() });
      },
    }),
  );
}
