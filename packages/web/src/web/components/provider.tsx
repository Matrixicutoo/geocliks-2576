import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AutumnProvider } from "autumn-js/react";
import { I18nProvider } from "../lib/i18n";
import { ThemeProvider } from "../lib/theme";

const queryClient = new QueryClient();

interface ProviderProps {
  children: React.ReactNode;
}

// App-level providers — add theme/context providers here, wrapping children.
// QueryClientProvider must stay (all API calls run through TanStack Query).
export function Provider({ children }: ProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <AutumnProvider useBetterAuth>{children}</AutumnProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
