/**
 * The eleven translation catalogs, and a lookup that works outside React.
 *
 * This used to live inside `i18n.tsx` next to the provider, which made it
 * unreachable from the two places that now need it most: `page-schema.ts`, which
 * builds structured data, and `seo-html.ts`, which injects that data into the
 * HTML response. Both run with no React and no hooks — on the server, per
 * request — so a catalog behind a `useContext` was no use to them.
 *
 * Splitting the data out changes nothing for the provider: it imports `CATALOGS`
 * from here and keeps owning the locale *state*. What is new is that a crawler
 * fetching `/es/proof-of-delivery` can be served Spanish structured data, from
 * the same strings the page renders.
 *
 * React-free on purpose. Do not import anything from `i18n.tsx` here.
 */
import type { LocaleCode } from "../../api/lib/locales";
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

export const CATALOGS: Record<LocaleCode, Record<string, string>> = {
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

/** Substitutes `{name}` placeholders. Shared by the provider and the server lookup. */
export function fill(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/**
 * One string in one locale, with the same English fallback the provider uses:
 * a key missing from a catalog renders the English copy rather than the raw key.
 *
 * Typing the key as `TKey` is what stops the structured data drifting from the
 * page — a renamed key fails the build on both sides at once.
 */
export function translate(
  locale: LocaleCode,
  key: TKey,
  vars?: Record<string, string | number>,
): string {
  const table = CATALOGS[locale] ?? en;
  return fill(table[key] ?? en[key] ?? key, vars);
}
