/**
 * Locale-prefixed URLs for the marketing site.
 *
 * The site used to serve all eleven languages from one URL and switch between
 * them in the client from `localStorage`. That works for a person and is
 * invisible to a search engine: a crawler arrives with no stored preference,
 * gets English, and indexes one English page. Ten translations existed and none
 * of them could ever rank.
 *
 * So a translated page now has an address:
 *
 *   /about        English
 *   /fr-ca/about  French
 *   /es/about     Spanish   ... and so on for the rest
 *
 * English keeps the bare path. Every URL Google has already indexed therefore
 * stays exactly where it is — this change adds pages rather than moving any.
 *
 * React-free on purpose, like `seo-routes.ts` and `page-schema.ts`: the server
 * injector and the sitemap script both import it, and neither can drag React in.
 */
import { type LocaleCode, LOCALES } from "../../api/lib/locales";

/**
 * The path segment each locale is served under. English is the empty string —
 * it is the unprefixed default, not a folder.
 *
 * Lowercase, including the regional variants: a URL path is case-sensitive, so
 * `/fr-CA/about` and `/fr-ca/about` would be two pages to a crawler. The
 * `hreflang` attribute carries the properly-cased `fr-CA`, which is the part
 * Google actually reads for language targeting.
 */
export const LOCALE_SEGMENT: Record<LocaleCode, string> = {
  en: "",
  "fr-CA": "fr-ca",
  es: "es",
  "pt-BR": "pt-br",
  de: "de",
  it: "it",
  zh: "zh",
  vi: "vi",
  tl: "tl",
  ar: "ar",
  pl: "pl",
};

/** Reverse of `LOCALE_SEGMENT`, minus English's empty key. */
const BY_SEGMENT = new Map<string, LocaleCode>(
  (Object.entries(LOCALE_SEGMENT) as [LocaleCode, string][])
    .filter(([, segment]) => segment !== "")
    .map(([code, segment]) => [segment, code]),
);

/**
 * Paths that serve genuinely translated copy, and so are worth publishing at
 * eleven addresses.
 *
 * This list is deliberately short and deliberately explicit. A path listed here
 * gets ten extra indexable URLs, ten `hreflang` pairs and eleven sitemap rows;
 * if the page behind it is still hardcoded English, all that buys is eleven
 * copies of the same English text, which is duplicate content and teaches
 * Google that the locale URLs are noise. So a page joins this list in the same
 * commit that translates it — never before.
 *
 * `/`, `/get-app` and `/proof-of-delivery` qualify today: all three render
 * their copy — and their FAQ markup — through `t()`. `/pricing`, `/about` and
 * the six remaining search landing pages do not yet.
 */
export const LOCALIZED_PATHS: readonly string[] = [
  "/",
  "/get-app",
  "/proof-of-delivery",
  "/gps-timestamp-camera",
  "/hvac-photo-documentation",
];

const LOCALIZED = new Set(LOCALIZED_PATHS);

/** Is this the canonical path of a page we serve in every language? */
export function isLocalizedPath(path: string): boolean {
  return LOCALIZED.has(normalizePath(path));
}

/** Collapses a pathname to the form used as a table key: leading slash, no trailing one. */
export function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const withSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const trimmed = withSlash.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export interface SplitPath {
  /** The locale the URL asks for. English when there is no prefix. */
  locale: LocaleCode;
  /** The router base for this URL — `/es`, or `""` for English. */
  base: string;
  /** The path with the locale prefix removed, always starting with `/`. */
  path: string;
  /** Did the URL actually carry a locale prefix? */
  prefixed: boolean;
}

/**
 * Splits `/es/get-app` into the locale it requests and the route underneath it.
 *
 * An unknown first segment is not a locale: `/about` splits to English and
 * `/about`, which is exactly what should happen for every pre-existing URL.
 */
export function splitLocalePath(pathname: string): SplitPath {
  const normalized = normalizePath(pathname);
  const segment = normalized.split("/")[1] ?? "";
  const locale = BY_SEGMENT.get(segment.toLowerCase());

  if (!locale) return { locale: "en", base: "", path: normalized, prefixed: false };

  const rest = normalized.slice(segment.length + 1);
  return {
    locale,
    base: `/${segment.toLowerCase()}`,
    path: normalizePath(rest === "" ? "/" : rest),
    prefixed: true,
  };
}

/**
 * The URL a given path takes in a given locale.
 *
 * A path that is not translated always returns its bare English form, whatever
 * locale is asked for. That keeps the allowlist authoritative in one direction
 * only: nothing can link its way into a locale URL that the sitemap and the
 * `hreflang` set do not also advertise.
 */
export function localizedPath(path: string, locale: LocaleCode): string {
  const normalized = normalizePath(path);
  const segment = LOCALE_SEGMENT[locale];
  if (!segment || !isLocalizedPath(normalized)) return normalized;
  return normalized === "/" ? `/${segment}` : `/${segment}${normalized}`;
}

export interface Alternate {
  /** The `hreflang` value — properly cased, e.g. `fr-CA`. */
  hreflang: string;
  /** Site-relative path. */
  path: string;
}

/**
 * Every `hreflang` pair for a translated path, including `x-default`.
 *
 * Returns nothing for a path that is not translated. A page with no alternates
 * must emit no tags at all rather than a single self-referencing one — a lone
 * `hreflang` is a signal that a set exists, and an incomplete set is ignored
 * wholesale by Google.
 *
 * The set is reciprocal by construction: every locale's URL lists every other
 * locale's URL, itself included, which is the condition Google checks before it
 * will honour any of them.
 */
export function alternatesFor(path: string): Alternate[] {
  const normalized = normalizePath(path);
  if (!isLocalizedPath(normalized)) return [];

  const alternates = LOCALES.map((locale) => ({
    hreflang: locale.code,
    path: localizedPath(normalized, locale.code),
  }));

  // x-default is where a visitor whose language we do not carry should land.
  // English, the same URL as `en` — that duplication is required, not a bug.
  alternates.push({ hreflang: "x-default", path: localizedPath(normalized, "en") });
  return alternates;
}
