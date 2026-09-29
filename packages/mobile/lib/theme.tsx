import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, type ColorScheme, type ThemeColors } from "@/constants/theme";

/** Per-device member override. Absent = follow the workspace default. */
const KEY = "geocliks.theme";
/**
 * Bumped whenever a stored override can no longer be trusted. Until now a tap anywhere on the
 * profile menu's appearance row silently flipped the device to light and kept it there for
 * good, and a value set that way is indistinguishable from a deliberate one — so the stored
 * override is dropped once per bump and the workspace default takes over again.
 */
const RESET_KEY = "geocliks.theme.reset.1";

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
  // Dark is the product default until the workspace record says otherwise — a member who
  // prefers light switches it per device after signing in.
  const [workspace, setWorkspace] = useState<ColorScheme>("dark");

  // AsyncStorage is async, so the first frame paints the default and corrects itself.
  useEffect(() => {
    let live = true;
    void (async () => {
      if (!(await AsyncStorage.getItem(RESET_KEY))) {
        // First run since the reset was bumped: forget the old override rather than trust it.
        await AsyncStorage.removeItem(KEY);
        await AsyncStorage.setItem(RESET_KEY, "1");
        return;
      }
      const value = await AsyncStorage.getItem(KEY);
      if (live && (value === "light" || value === "dark")) setOverride(value);
    })();
    return () => {
      live = false;
    };
  }, []);

  const setTheme = useCallback((next: ColorScheme) => {
    setOverride(next);
    void AsyncStorage.setItem(KEY, next);
    // A choice made from here is deliberate, so it must survive the one-time reset above.
    void AsyncStorage.setItem(RESET_KEY, "1");
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

/** Theme controls. Safe outside the provider (falls back to the dark default). */
export function useAppTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  return {
    scheme: "dark",
    colors: Colors.dark,
    override: null,
    workspace: "dark",
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
