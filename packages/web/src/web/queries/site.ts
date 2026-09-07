import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * Public company-wide social links for the marketing footer. Unauthenticated —
 * visitors with no session read the same row the admin console writes.
 */
export function useSocialLinks() {
  return useQuery(orpc.site.socials.queryOptions({ staleTime: 300_000, retry: false }));
}
