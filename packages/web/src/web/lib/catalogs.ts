/**
 * The eleven translation catalogs, and a lookup that works outside React.
 *
 * This used to live inside `i18n.tsx` next to the provider, which made it
 * unreachable from the two places that now need it most: `page-schema.ts`, which
 * builds structured data, and `seo-html.ts`, which injects that data into the
 * HTML response. Both run with no React and no hooks — on the server, per
 * request — so a catalog behind a `useContext` was no use to them.
 *
 * Splitting the data out changes nothing for the provider: it reads tables from
 * here and keeps owning the locale *state*. What is new is that a crawler
 * fetching `/es/proof-of-delivery` can be served Spanish structured data, from
 * the same strings the page renders.
 *
 * React-free on purpose. Do not import anything from `i18n.tsx` here.
 */
import type { LocaleCode } from "../../api/lib/locales";
import { en } from "../i18n/en";

export type TKey = keyof typeof en;

type Table = Record<string, string>;

/**
 * The catalogs this process holds right now. English is always here; the other
 * ten arrive one at a time.
 *
 * Each catalog is about 200 KB of source, and they used to be imported eagerly,
 * which put all eleven — over 2 MB — in the entry bundle that every visitor to
 * every page downloads before anything renders. A visitor reads one language.
 *
 * The browser now fetches only the catalog it is about to render (`loadCatalog`,
 * awaited by the provider before first paint), as its own chunk. The server needs
 * every language synchronously for each request's head tags, so `seo-html.ts`
 * imports `catalogs-all.ts`, which registers all ten at startup.
 */
const loaded: Partial<Record<LocaleCode, Table>> = { en };

/** Called by `catalogs-all.ts` on the server, and by `loadCatalog` in the browser. */
export function registerCatalog(locale: LocaleCode, table: Table): void {
  loaded[locale] = table;
}

export const hasCatalog = (locale: LocaleCode): boolean => locale in loaded;

/** The table for a locale, or English while that locale is not loaded. */
export const catalogFor = (locale: LocaleCode): Table => loaded[locale] ?? en;

/**
 * One chunk per language. Literal `import()` calls on purpose: that is what lets
 * Vite split each catalog into a file of its own.
 */
const LOADERS: Record<Exclude<LocaleCode, "en">, () => Promise<Table>> = {
  "fr-CA": () => import("../i18n/fr-CA").then((m) => m.frCA),
  es: () => import("../i18n/es").then((m) => m.es),
  "pt-BR": () => import("../i18n/pt-BR").then((m) => m.ptBR),
  de: () => import("../i18n/de").then((m) => m.de),
  it: () => import("../i18n/it").then((m) => m.it),
  zh: () => import("../i18n/zh").then((m) => m.zh),
  vi: () => import("../i18n/vi").then((m) => m.vi),
  tl: () => import("../i18n/tl").then((m) => m.tl),
  ar: () => import("../i18n/ar").then((m) => m.ar),
  pl: () => import("../i18n/pl").then((m) => m.pl),
};

const pending = new Map<LocaleCode, Promise<void>>();

/**
 * Makes a locale's catalog available. Resolves immediately when it already is.
 *
 * A failed fetch (offline, or a deploy replaced the chunk under an open tab)
 * registers English for that locale rather than rejecting: the page renders in
 * English instead of not rendering at all.
 */
export function loadCatalog(locale: LocaleCode): Promise<void> {
  if (hasCatalog(locale)) return Promise.resolve();
  const existing = pending.get(locale);
  if (existing) return existing;
  const loader = LOADERS[locale as Exclude<LocaleCode, "en">];
  const job = (loader ? loader() : Promise.resolve(en))
    .then((table) => registerCatalog(locale, table))
    .catch(() => registerCatalog(locale, en))
    .finally(() => pending.delete(locale));
  pending.set(locale, job);
  return job;
}

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
  return fill(catalogFor(locale)[key] ?? en[key] ?? key, vars);
}
