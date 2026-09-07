import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/api";

/** Generated closeout packages for the workspace, newest first. */
export function useReports() {
  return useQuery(orpc.reports.list.queryOptions({ staleTime: 10_000 }));
}

function useReportInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: orpc.reports.key() });
}

export function useCreateReport() {
  const invalidate = useReportInvalidate();
  return useMutation(orpc.reports.create.mutationOptions({ onSuccess: invalidate }));
}

/** Returns a short-lived presigned URL the phone opens in the in-app browser. */
export function useDownloadReport() {
  return useMutation(orpc.reports.download.mutationOptions());
}

export function useRemoveReport() {
  const invalidate = useReportInvalidate();
  return useMutation(orpc.reports.remove.mutationOptions({ onSuccess: invalidate }));
}
