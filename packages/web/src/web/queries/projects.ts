import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useProjects(input?: { status?: "active" | "on_hold" | "complete" | "archived" }) {
  return useQuery(orpc.projects.list.queryOptions({ input: input ?? {}, staleTime: 15_000 }));
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

export function useRemoveProject() {
  const invalidate = useProjectInvalidate();
  return useMutation(orpc.projects.remove.mutationOptions({ onSuccess: invalidate }));
}

export function useDestroyProject() {
  const invalidate = useProjectInvalidate();
  return useMutation(orpc.projects.destroy.mutationOptions({ onSuccess: invalidate }));
}
