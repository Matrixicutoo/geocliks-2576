import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";

export function useProjects() {
  return useQuery(orpc.projects.list.queryOptions({ input: {}, staleTime: 30_000 }));
}

/** Creating a job is manager and above — the server enforces it too. */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.projects.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.projects.key() });
      },
    }),
  );
}

export function useDestroyProject() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.projects.destroy.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.projects.key() });
        queryClient.invalidateQueries({ queryKey: orpc.photos.key() });
      },
    }),
  );
}
