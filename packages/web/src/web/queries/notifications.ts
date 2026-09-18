import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Same cadence as the message badge — no websockets in this stack. */
const POLL_MS = 15_000;

/**
 * The bell's feed and its unseen count in one query, because the badge and the dropdown are
 * always looking at the same rows.
 */
export function useNotificationFeed() {
  return useQuery(
    orpc.notifications.feed.queryOptions({
      staleTime: 5_000,
      refetchInterval: POLL_MS,
      // Keeps polling while the tab is in the background, which React Query otherwise pauses
      // on blur. That is precisely when this matters: the dot on the browser tab is for
      // somebody working in another site, and it can only appear if the count still updates.
      refetchIntervalInBackground: true,
    }),
  );
}

/**
 * Advances the "last opened the bell" cursor.
 *
 * Deliberately does NOT invalidate the feed: refetching straight after would strip the dots
 * off the rows the person is reading right now, which is the one moment they matter. The next
 * poll picks up the cleared state a few seconds later, by which time the panel has been read.
 */
export function useMarkNotificationsSeen() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.notifications.markSeen.mutationOptions({
      onSuccess: () => {
        // Zero the badge immediately without touching the rows: the dropdown keeps its dots,
        // the bell stops shouting.
        queryClient.setQueriesData<{ unseen: number } | undefined>(
          { queryKey: orpc.notifications.feed.key() },
          (prev) => (prev ? { ...prev, unseen: 0 } : prev),
        );
      },
    }),
  );
}
