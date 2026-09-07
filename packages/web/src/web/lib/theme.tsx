import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

/** Per-device member override. Absent = follow the workspace default. */
const KEY = "geocliks.theme";

const read = (): Theme | null => {
  try {
    const v = globalThis.localStorage?.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
};

const apply = (theme: Theme) => {
  const root = globalThis.document?.documentElement;
  if (root) root.dataset.theme = theme;
};

type Ctx = {
  /** The theme currently painted. */
  theme: Theme;
  /** The member's own choice on this device, or null when following the workspace. */
  override: Theme | null;
  /** Workspace default, applied whenever the member has no override. */
  workspace: Theme;
  /** Set (and persist) this device's override. */
  setTheme: (theme: Theme) => void;
  /** Drop the override and fall back to the workspace default. */
  useWorkspaceDefault: () => void;
  /** Called by authenticated shells once the workspace record loads. */
  setWorkspaceDefault: (theme: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = useState<Theme | null>(() => read());
  // Light is the product default until a workspace record says otherwise.
  const [workspace, setWorkspace] = useState<Theme>("light");

  const theme = override ?? workspace;

  useEffect(() => {
    apply(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setOverride(next);
    try {
      globalThis.localStorage?.setItem(KEY, next);
    } catch {
      // Private mode: the choice still applies for this session.
    }
  }, []);

  const useWorkspaceDefault = useCallback(() => {
    setOverride(null);
    try {
      globalThis.localStorage?.removeItem(KEY);
    } catch {
      // Ignore.
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      override,
      workspace,
      setTheme,
      useWorkspaceDefault,
      setWorkspaceDefault: setWorkspace,
      toggle: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme, override, workspace, setTheme, useWorkspaceDefault],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/**
 * Applies the workspace default once the org record resolves, without clobbering a
 * member who already picked their own theme on this device.
 */
export function useWorkspaceTheme(theme: string | null | undefined) {
  const { setWorkspaceDefault } = useTheme();
  useEffect(() => {
    if (theme === "light" || theme === "dark") setWorkspaceDefault(theme);
  }, [theme, setWorkspaceDefault]);
}
