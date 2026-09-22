import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/**
 * `enabled` exists because a driver is forbidden from listing projects — the delivery side of
 * the photo strip must not fire the request at all rather than eat a 403 on every page load.
 */
export function useProjects(
  input?: { status?: "active" | "on_hold" | "complete" | "archived" },
  options?: { enabled?: boolean },
) {
  return useQuery(
    orpc.projects.list.queryOptions({
      input: input ?? {},
      staleTime: 15_000,
      enabled: options?.enabled ?? true,
    }),
  );
}

export function useProject(id: string) {
  return useQuery(
    orpc.projects.get.queryOptions({ input: { id }, staleTime: 15_000, enabled: Boolean(id) }),
  );
}

function useProjectInvalidate() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: orpc.projects.key() });
    queryClient.invalidateQueries({ queryKey: orpc.photos.key() });
  };
}

export function useCreateProject() {
  const invalidate = useProjectInvalidate();
  return useMutation(orpc.projects.create.mutationOptions({ onSuccess: invalidate }));
}

export function useUpdateProject() {
  const invalidate = useProjectInvalidate();
  return useMutation(orpc.projects.update.mutationOptions({ onSuccess: invalidate }));
}

/**
 * The job note alone. Separate from `useUpdateProject` because the server gates it at the
 * dispatcher tier rather than at manager — see `projects.setNote`.
 */
export function useSetProjectNote() {
  const invalidate = useProjectInvalidate();
  return useMutation(orpc.projects.setNote.mutationOptions({ onSuccess: invalidate }));
}

export function useRemoveProject() {
  const invalidate = useProjectInvalidate();
  return useMutation(orpc.projects.remove.mutationOptions({ onSuccess: invalidate }));
}

export function useDestroyProject() {
  const invalidate = useProjectInvalidate();
  return useMutation(orpc.projects.destroy.mutationOptions({ onSuccess: invalidate }));
}
