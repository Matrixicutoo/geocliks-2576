import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { I18nManager } from "react-native";
import { ar } from "../i18n/ar";
import { de } from "../i18n/de";
import { en } from "../i18n/en";
import { es } from "../i18n/es";
import { frCA } from "../i18n/fr-CA";
import { it } from "../i18n/it";
import { type LocaleCode, asLocale, isRtl } from "../i18n/locales";
import { pl } from "../i18n/pl";
import { ptBR } from "../i18n/pt-BR";
import { tl } from "../i18n/tl";
import { vi } from "../i18n/vi";
import { zh } from "../i18n/zh";

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

const fill = (template: string, vars?: Record<string, string | number>) =>
  vars
    ? template.replace(/\{(\w+)\}/g, (m, name: string) => (name in vars ? String(vars[name]) : m))
    : template;

export type Translate = (key: TKey, vars?: Record<string, string | number>) => string;

const translator =
  (locale: LocaleCode): Translate =>
  (key, vars) => {
    const table = CATALOGS[locale] ?? en;
    return fill(table[key] ?? en[key] ?? key, vars);
  };

type Ctx = {
  locale: LocaleCode;
  override: LocaleCode | null;
  workspace: LocaleCode;
  rtl: boolean;
  t: Translate;
  setLocale: (locale: LocaleCode) => void;
  useWorkspaceDefault: () => void;
  setWorkspaceDefault: (locale: LocaleCode) => void;
};

const FALLBACK: Ctx = {
  locale: "en",
  override: null,
  workspace: "en",
  rtl: false,
  t: translator("en"),
  setLocale: () => {},
  useWorkspaceDefault: () => {},
  setWorkspaceDefault: () => {},
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = useState<LocaleCode | null>(null);
  const [workspace, setWorkspace] = useState<LocaleCode>("en");

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((value) => {
        if (value) setOverride(asLocale(value));
      })
      .catch(() => {
        // First launch or storage unavailable: stay on the workspace default.
      });
  }, []);

  const locale = override ?? workspace;
  const rtl = isRtl(locale);

  useEffect(() => {
    // Native layout mirroring only takes effect after an app reload.
    if (I18nManager.isRTL !== rtl) {
      I18nManager.allowRTL(rtl);
      I18nManager.forceRTL(rtl);
    }
  }, [rtl]);

  const setLocale = useCallback((next: LocaleCode) => {
    setOverride(next);
    AsyncStorage.setItem(KEY, next).catch(() => {});
  }, []);

  const useWorkspaceDefault = useCallback(() => {
    setOverride(null);
    AsyncStorage.removeItem(KEY).catch(() => {});
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      override,
      workspace,
      rtl,
      t: translator(locale),
      setLocale,
      useWorkspaceDefault,
      setWorkspaceDefault: setWorkspace,
    }),
    [locale, override, workspace, rtl, setLocale, useWorkspaceDefault],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Safe outside the provider — falls back to English so screens never crash. */
export function useLocale(): Ctx {
  return useContext(I18nContext) ?? FALLBACK;
}

export function useT(): Translate {
  return useLocale().t;
}

/** Applies the workspace default without clobbering this device's own choice. */
export function useWorkspaceLocale(locale: string | null | undefined) {
  const { setWorkspaceDefault } = useLocale();
  useEffect(() => {
    if (locale) setWorkspaceDefault(asLocale(locale));
  }, [locale, setWorkspaceDefault]);
}
