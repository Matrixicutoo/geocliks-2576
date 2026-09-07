import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * Public delivery tracking — no auth, the emailed token is the key.
 * Polls while the run is live so the recipient sees the driver close in without refreshing.
 */
export function useTrack(token: string) {
  return useQuery(
    orpc.track.byToken.queryOptions({
      input: { token },
      enabled: token.trim().length >= 8,
      retry: false,
      staleTime: 20_000,
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        return status === "pending" ? 30_000 : false;
      },
    }),
  );
}
