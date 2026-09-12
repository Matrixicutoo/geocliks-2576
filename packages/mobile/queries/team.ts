import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";

/** Public invite lookup — works signed out, same procedure the web /join page uses. */
export function useInviteInfo(code: string) {
  return useQuery(
    orpc.team.inviteInfo.queryOptions({
      input: { code: code.trim() },
      enabled: code.trim().length >= 4,
      retry: false,
      staleTime: 30_000,
    }),
  );
}

/** Joins the inviting workspace with the role baked into the invite. */
export function useAcceptInvite() {
  const qc = useQueryClient();
  return useMutation(
    orpc.team.acceptInvite.mutationOptions({
      onSuccess: () => {
        void qc.invalidateQueries();
      },
    }),
  );
}

/**
 * The workspace roster. The server already narrows this for field crews to the people on their
 * own projects, so the phone never has to filter it a second time.
 */
export function useTeam() {
  return useQuery(orpc.team.list.queryOptions({ staleTime: 20_000 }));
}

/** Pending invites. The server returns an empty list for field members by design. */
export function useInvites() {
  return useQuery(orpc.team.invites.queryOptions({ staleTime: 20_000 }));
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

/**
 * Is this account GeoCliks platform staff? Only a superadmin may grant the `admin` role, so the
 * invite sheet asks this before deciding whether to offer that chip. `authed`, not staff-only,
 * so a normal crew account gets `staffRole: null` rather than a 403.
 */
export function useStaffRole() {
  return useQuery(orpc.admin.me.queryOptions({ staleTime: 60_000, retry: false }));
}
