import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";

/** Public plan table — same source the marketing pricing page and the gating code read. */
export function usePlans(locale?: string) {
  return useQuery(orpc.billing.plans.queryOptions({ input: { locale }, staleTime: 60_000 }));
}

/** Current workspace plan + usage. Owner-only fields are already filtered server-side. */
export function useBillingCurrent(locale?: string) {
  return useQuery(orpc.billing.current.queryOptions({ input: { locale }, staleTime: 15_000 }));
}

/** Asks the server for a Stripe checkout URL (or applies a free/current plan directly). */
export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.billing.checkout.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.orgs.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.billing.key() });
      },
    }),
  );
}

/** Reconciles the workspace plan with the processor after checkout returns. */
export function useSyncProcessor() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.billing.syncProcessor.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.orgs.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.billing.key() });
      },
    }),
  );
}

/** Store product catalog (Apple SKUs mapped to plans) — the client never hardcodes SKUs. */
export function useIapProducts() {
  return useQuery(orpc.iap.products.queryOptions({ staleTime: 300_000 }));
}

/** Posts a StoreKit signed transaction to the server for verification. */
export function useApplyApple() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.iap.applyApple.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.orgs.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.billing.key() });
      },
    }),
  );
}
