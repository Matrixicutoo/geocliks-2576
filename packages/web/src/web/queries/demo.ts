import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

/** Seeds the workspace with realistic field data on first dashboard load. */
export function useSeedDemo() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.demo.seed.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(),
    }),
  );
}
