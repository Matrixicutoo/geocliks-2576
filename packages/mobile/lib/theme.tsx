import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, type ColorScheme, type ThemeColors } from "@/constants/theme";

/** Per-device member override. Absent = follow the workspace default. */
const KEY = "geocliks.theme";

type Ctx = {
  /** The scheme currently painted. */
  scheme: ColorScheme;
  colors: ThemeColors;
  /** This device's own choice, or null when following the workspace default. */
  override: ColorScheme | null;
  /** Workspace default from the org record. */
  workspace: ColorScheme;
  setTheme: (scheme: ColorScheme) => void;
  useWorkspaceDefault: () => void;
  /** Called once the org record loads. */
  setWorkspaceDefault: (scheme: ColorScheme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = useState<ColorScheme | null>(null);
  // Light is the product default until the workspace record says otherwise.
  const [workspace, setWorkspace] = useState<ColorScheme>("light");

  // AsyncStorage is async, so the first frame paints the default and corrects itself.
  useEffect(() => {
    void AsyncStorage.getItem(KEY).then((value) => {
      if (value === "light" || value === "dark") setOverride(value);
    });
  }, []);

  const setTheme = useCallback((next: ColorScheme) => {
    setOverride(next);
    void AsyncStorage.setItem(KEY, next);
  }, []);

  const useWorkspaceDefault = useCallback(() => {
    setOverride(null);
    void AsyncStorage.removeItem(KEY);
  }, []);

  const scheme = override ?? workspace;

  const value = useMemo<Ctx>(
    () => ({
      scheme,
      colors: Colors[scheme],
      override,
      workspace,
      setTheme,
      useWorkspaceDefault,
      setWorkspaceDefault: setWorkspace,
      toggle: () => setTheme(scheme === "dark" ? "light" : "dark"),
    }),
    [scheme, override, workspace, setTheme, useWorkspaceDefault],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Theme controls. Safe outside the provider (falls back to the light default). */
export function useAppTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  return {
    scheme: "light",
    colors: Colors.light,
    override: null,
    workspace: "light",
    setTheme: () => {},
    useWorkspaceDefault: () => {},
    setWorkspaceDefault: () => {},
    toggle: () => {},
  };
}

/** Applies the workspace default without clobbering a member's own choice on this device. */
export function useWorkspaceTheme(theme: string | null | undefined) {
  const { setWorkspaceDefault } = useAppTheme();
  useEffect(() => {
    if (theme === "light" || theme === "dark") setWorkspaceDefault(theme);
  }, [theme, setWorkspaceDefault]);
}
