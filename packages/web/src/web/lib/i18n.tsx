import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type LocaleCode, asLocale, isRtl } from "../../api/lib/locales";
import { splitLocalePath } from "./locale-url";
import { type TKey, CATALOGS, fill } from "./catalogs";
import { en } from "../i18n/en";

// The catalogs and the `{name}` substitution moved to `catalogs.ts`, which is
// React-free: the structured-data builder and the server-side head injector read
// the same strings this provider renders, and neither can call a hook.
export type { TKey };

/** Per-device member override. Absent = follow the workspace default. */
const KEY = "geocliks.locale";

const read = (): LocaleCode | null => {
  try {
    const v = globalThis.localStorage?.getItem(KEY);
    return v ? asLocale(v) : null;
  } catch {
    return null;
  }
};

/**
 * A `?lang=` hint on the URL, honoured once on arrival.
 *
 * The mobile app's Help row opens the Help Center in the system browser, which has storage of its
 * own and so cannot know the language the member reads the app in. The app appends its locale and
 * we treat it exactly as picking the language here would: a device override, stored and then
 * stripped from the address bar.
 */
const fromQuery = (): LocaleCode | null => {
  try {
    const value = new URLSearchParams(globalThis.location?.search ?? "").get("lang");
    if (!value) return null;
    const code = asLocale(value);
    // `asLocale` answers English for anything it does not recognise, which would let a typo
    // silently undo a stored choice. Only an explicit English tag may resolve to English.
    return code === "en" && !/^en(-|$)/i.test(value) ? null : code;
  } catch {
    return null;
  }
};

/**
 * The locale on screen right now, readable from outside React.
 *
 * The chat transport builds its request headers in a module-level callback, nowhere near a
 * hook, and what it needs is not in localStorage either: a member following the workspace
 * default has no stored override. So the provider publishes the resolved locale here, and the
 * assistant can be told which Help Center language to read.
 */
/**
 * The locale named by the URL's own path — `/es/get-app` asks for Spanish.
 *
 * This outranks everything else, including a stored override, and it has to: the
 * URL is the page's public identity now. A crawler fetching `/es/` must be
 * served Spanish, and a visitor who sends that link to someone whose device is
 * set to German must have them open the Spanish page they meant to share, not a
 * German one. `null` on an unprefixed URL, which leaves the stored preference in
 * charge exactly as before.
 */
const fromPath = (): LocaleCode | null => {
  try {
    const split = splitLocalePath(globalThis.location?.pathname ?? "/");
    return split.prefixed ? split.locale : null;
  } catch {
    return null;
  }
};

let active: LocaleCode = fromPath() ?? fromQuery() ?? read() ?? "en";

export const activeLocale = (): LocaleCode => active;

export type Translate = (key: TKey, vars?: Record<string, string | number>) => string;

type Ctx = {
  /** The locale currently rendered. */
  locale: LocaleCode;
  /** This device's own choice, or null when following the workspace. */
  override: LocaleCode | null;
  /** Workspace default, applied whenever the member has no override. */
  workspace: LocaleCode;
  rtl: boolean;
  t: Translate;
  setLocale: (locale: LocaleCode) => void;
  useWorkspaceDefault: () => void;
  setWorkspaceDefault: (locale: LocaleCode) => void;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = useState<LocaleCode | null>(() => fromQuery() ?? read());
  const [workspace, setWorkspace] = useState<LocaleCode>("en");

  // Fixed for the life of the document: a locale change navigates, so this is
  // re-read by the load that follows rather than changing underneath React.
  const pathLocale = fromPath();

  const locale = pathLocale ?? override ?? workspace;
  const rtl = isRtl(locale);

  useEffect(() => {
    // Arriving on a locale URL is itself a language choice — from a search
    // result, a shared link, or the picker. Remember it, so the rest of the site
    // (the Help Center, the workspace, every page with no locale URL of its own)
    // follows the language the visitor arrived in.
    if (pathLocale) {
      try {
        globalThis.localStorage?.setItem(KEY, pathLocale);
      } catch {
        // Private mode: the choice still applies for this session.
      }
    }
  }, [pathLocale]);

  useEffect(() => {
    // A locale handed over from the app is remembered, so a later visit without the parameter —
    // or a link the member shares from the browser — stays in their language.
    const handed = fromQuery();
    if (!handed) return;
    try {
      globalThis.localStorage?.setItem(KEY, handed);
    } catch {
      // Private mode: the choice still applies for this session.
    }
    const url = new URL(globalThis.location.href);
    url.searchParams.delete("lang");
    globalThis.history?.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    active = locale;
    const root = globalThis.document?.documentElement;
    if (!root) return;
    root.lang = locale;
    root.dir = rtl ? "rtl" : "ltr";
  }, [locale, rtl]);

  const setLocale = useCallback((next: LocaleCode) => {
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

  const t = useCallback<Translate>(
    (key, vars) => {
      // Fall back to English rather than ever rendering a raw key.
      const table = CATALOGS[locale] ?? en;
      return fill(table[key] ?? en[key] ?? key, vars);
    },
    [locale],
  );

  const value = useMemo<Ctx>(
    () => ({
      locale,
      override,
      workspace,
      rtl,
      t,
      setLocale,
      useWorkspaceDefault,
      setWorkspaceDefault: setWorkspace,
    }),
    [locale, override, workspace, rtl, t, setLocale, useWorkspaceDefault],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLocale must be used inside <I18nProvider>");
  return ctx;
}

/** Shorthand for components that only need the translate function. */
export function useT(): Translate {
  return useLocale().t;
}

/**
 * Applies the workspace default once the org record resolves, without clobbering a
 * member who already picked their own language on this device.
 */
export function useWorkspaceLocale(locale: string | null | undefined) {
  const { setWorkspaceDefault } = useLocale();
  useEffect(() => {
    if (locale) setWorkspaceDefault(asLocale(locale));
  }, [locale, setWorkspaceDefault]);
}
