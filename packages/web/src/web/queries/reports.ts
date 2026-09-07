import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

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

export function useDownloadReport() {
  return useMutation(orpc.reports.download.mutationOptions());
}

export function useRemoveReport() {
  const invalidate = useReportInvalidate();
  return useMutation(orpc.reports.remove.mutationOptions({ onSuccess: invalidate }));
}
