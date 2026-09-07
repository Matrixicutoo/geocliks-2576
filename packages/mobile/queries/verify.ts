import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/api";

/** Public photo-code lookup — works signed out, same procedure the web /verify page uses. */
export function useVerifyCode(code: string) {
  return useQuery(
    orpc.verify.byCode.queryOptions({
      input: { code },
      enabled: code.trim().length >= 4,
      retry: false,
      staleTime: 30_000,
    }),
  );
}
