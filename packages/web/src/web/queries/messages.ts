import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** No websockets in this stack — threads and badges poll on a short interval instead. */
const POLL_MS = 15_000;

export function useConversations() {
  return useQuery(
    orpc.messages.list.queryOptions({ staleTime: 5_000, refetchInterval: POLL_MS }),
  );
}

/**
 * Same query as useConversations (same key, same cache), but keeps the poll running while the
 * tab is in the background. React Query pauses refetchInterval on blur by default, which is
 * exactly when desktop notifications need the data — so the notification hook opts in here.
 *
 * Scoped deliberately: only subscribe with `background` true once the user has turned alerts on.
 * Flipping it on for every signed-in tab would poll this endpoint forever for people who never
 * asked for notifications.
 */
export function useConversationsPolled(background: boolean) {
  return useQuery(
    orpc.messages.list.queryOptions({
      staleTime: 5_000,
      refetchInterval: POLL_MS,
      refetchIntervalInBackground: background,
    }),
  );
}

export function useUnreadMessages() {
  return useQuery(
    orpc.messages.unreadCount.queryOptions({ staleTime: 5_000, refetchInterval: POLL_MS }),
  );
}

export function useContacts() {
  return useQuery(orpc.messages.contacts.queryOptions({ staleTime: 60_000 }));
}

export function useThread(conversationId: string | null) {
  return useQuery(
    orpc.messages.thread.queryOptions({
      input: { conversationId: conversationId ?? "", limit: 200 },
      enabled: Boolean(conversationId),
      staleTime: 2_000,
      refetchInterval: POLL_MS,
    }),
  );
}

export function useRecentCaptures(projectId?: string | null) {
  return useQuery(
    orpc.messages.recentCaptures.queryOptions({
      input: { projectId: projectId ?? null },
      staleTime: 30_000,
    }),
  );
}

function useMessagesInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: orpc.messages.key() });
}

export function useSendMessage() {
  const invalidate = useMessagesInvalidate();
  return useMutation(orpc.messages.send.mutationOptions({ onSuccess: invalidate }));
}

export function useBroadcastMessage() {
  const invalidate = useMessagesInvalidate();
  return useMutation(orpc.messages.broadcast.mutationOptions({ onSuccess: invalidate }));
}

export function useOpenConversation() {
  const invalidate = useMessagesInvalidate();
  return useMutation(orpc.messages.open.mutationOptions({ onSuccess: invalidate }));
}

export function useMarkRead() {
  const invalidate = useMessagesInvalidate();
  return useMutation(orpc.messages.markRead.mutationOptions({ onSuccess: invalidate }));
}
