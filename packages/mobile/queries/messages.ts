import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";
import { useHasSession } from "@/hooks/use-session";

/** No websockets in this stack — threads and badges poll on a short interval instead. */
const POLL_MS = 15_000;

export function useConversations() {
  return useQuery(
    orpc.messages.list.queryOptions({ staleTime: 5_000, refetchInterval: POLL_MS }),
  );
}

export function useUnreadMessages() {
  // The tab bar mounts this on every screen, including the signed-out capture screen.
  // Without the gate it would poll an unauthenticated endpoint every 15 seconds.
  const { hasSession } = useHasSession();
  return useQuery(
    orpc.messages.unreadCount.queryOptions({
      enabled: hasSession,
      staleTime: 5_000,
      refetchInterval: POLL_MS,
    }),
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

export function useRegisterPushToken() {
  return useMutation(orpc.messages.registerPushToken.mutationOptions({}));
}
