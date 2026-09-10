import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";
import { useHasSession } from "@/hooks/use-session";

// Off until signed in: the capture screen shows the project picker before an account
// exists, and it simply reads "Unassigned" until there is a workspace to list.
export function useProjects() {
  const { hasSession } = useHasSession();
  return useQuery(
    orpc.projects.list.queryOptions({ input: {}, staleTime: 30_000, enabled: hasSession }),
  );
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
