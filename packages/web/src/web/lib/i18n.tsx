import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type LocaleCode, asLocale, isRtl } from "../../api/lib/locales";
import { en } from "../i18n/en";
import { frCA } from "../i18n/fr-CA";
import { es } from "../i18n/es";
import { ptBR } from "../i18n/pt-BR";
import { de } from "../i18n/de";
import { it } from "../i18n/it";
import { zh } from "../i18n/zh";
import { vi } from "../i18n/vi";
import { tl } from "../i18n/tl";
import { ar } from "../i18n/ar";
import { pl } from "../i18n/pl";

export type TKey = keyof typeof en;

const CATALOGS: Record<LocaleCode, Record<string, string>> = {
  en,
  "fr-CA": frCA,
  es,
  "pt-BR": ptBR,
  de,
  it,
  zh,
  vi,
  tl,
  ar,
  pl,
};

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

const fill = (template: string, vars?: Record<string, string | number>) =>
  vars
    ? template.replace(/\{(\w+)\}/g, (m, name: string) =>
        name in vars ? String(vars[name]) : m,
      )
    : template;

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
  const [override, setOverride] = useState<LocaleCode | null>(() => read());
  const [workspace, setWorkspace] = useState<LocaleCode>("en");

  const locale = override ?? workspace;
  const rtl = isRtl(locale);

  useEffect(() => {
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
