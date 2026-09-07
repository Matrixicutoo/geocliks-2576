import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useTeam() {
  return useQuery(orpc.team.list.queryOptions({ staleTime: 20_000 }));
}

export function useInvites() {
  return useQuery(orpc.team.invites.queryOptions({ staleTime: 20_000 }));
}

export function useInviteQr(inviteId: string | null) {
  return useQuery(
    orpc.team.inviteQr.queryOptions({
      input: { id: inviteId ?? "" },
      enabled: Boolean(inviteId),
      staleTime: 5 * 60_000,
    }),
  );
}

/** Public invite lookup — used by /join and the /get-app?invite= banner. */
export function useInviteInfo(code: string) {
  return useQuery(
    orpc.team.inviteInfo.queryOptions({
      input: { code: code.trim() },
      enabled: code.trim().length >= 4,
      retry: false,
      staleTime: 60_000,
    }),
  );
}

/** Every project assignment in the workspace, keyed by member on the Team page. */
export function useMemberProjects() {
  return useQuery(orpc.team.memberProjects.queryOptions({ staleTime: 15_000 }));
}

export function useAssignments(projectId: string) {
  return useQuery(
    orpc.team.assignments.queryOptions({
      input: { projectId },
      enabled: Boolean(projectId),
      staleTime: 15_000,
    }),
  );
}

function useTeamInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: orpc.team.key() });
}

export function useInviteMember() {
  const invalidate = useTeamInvalidate();
  return useMutation(orpc.team.invite.mutationOptions({ onSuccess: invalidate }));
}

export function useRevokeInvite() {
  const invalidate = useTeamInvalidate();
  return useMutation(orpc.team.revokeInvite.mutationOptions({ onSuccess: invalidate }));
}

export function useSetRole() {
  const invalidate = useTeamInvalidate();
  return useMutation(orpc.team.setRole.mutationOptions({ onSuccess: invalidate }));
}

export function useRemoveMember() {
  const invalidate = useTeamInvalidate();
  return useMutation(orpc.team.remove.mutationOptions({ onSuccess: invalidate }));
}

export function useAssignMember() {
  const invalidate = useTeamInvalidate();
  return useMutation(orpc.team.assign.mutationOptions({ onSuccess: invalidate }));
}
