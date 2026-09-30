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
  // Keep the browser chrome (mobile address bar) matching the painted surface. index.html
  // ships the dark default; this follows every later switch.
  globalThis.document
    ?.querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#ffffff" : "#1a1c20");
};

type Ctx = {
  /** The member's resolved preference: their own override, else the workspace default. */
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
  /**
   * Paints `theme` until the returned cleanup runs, whatever the member picked. Use the
   * `usePinnedTheme` hook rather than calling this directly.
   */
  pinTheme: (theme: Theme) => () => void;
};

const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = useState<Theme | null>(() => read());
  // Dark is the product default until a workspace record says otherwise — a member who
  // prefers light switches it on this device after signing in.
  const [workspace, setWorkspace] = useState<Theme>("dark");
  /**
   * A stack, not one value: during a route change the incoming page mounts before the
   * outgoing one unmounts, so a single slot would be cleared by the old page's cleanup
   * and the new page would lose its pin. Innermost (last) pin wins.
   */
  const [pins, setPins] = useState<{ id: symbol; theme: Theme }[]>([]);

  const theme = override ?? workspace;
  const painted = pins.length > 0 ? pins[pins.length - 1]!.theme : theme;

  useEffect(() => {
    apply(painted);
  }, [painted]);

  const pinTheme = useCallback((pinned: Theme) => {
    const id = Symbol("theme-pin");
    setPins((current) => [...current, { id, theme: pinned }]);
    return () => setPins((current) => current.filter((pin) => pin.id !== id));
  }, []);

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
      pinTheme,
    }),
    [theme, override, workspace, setTheme, useWorkspaceDefault, pinTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/**
 * Pins the painted theme for as long as the calling component is mounted, whatever the
 * member picked for the app shell — the public marketing, help, legal and verify pages are
 * designed light and stay light.
 *
 * Pinned through the provider rather than by writing `documentElement.dataset.theme`
 * directly: a child's effect runs *before* its parent's, so a direct write is repainted by
 * the provider's own apply effect on the very same pass. That was harmless only while light
 * was also the app default; with dark the default it left these pages dark.
 */
export function usePinnedTheme(pinned: Theme) {
  const { pinTheme } = useTheme();
  useEffect(() => pinTheme(pinned), [pinned, pinTheme]);
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
