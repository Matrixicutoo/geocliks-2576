/**
 * Help Center resolution: which article a locale actually gets.
 *
 * Three tiers, in order:
 *  1. the locale has a full catalog  → translated titles and translated bodies;
 *  2. the locale has a label pack    → translated titles, English bodies, banner;
 *  3. neither                        → English throughout.
 *
 * Fallback is per-locale, not per-article: a locale either carries the whole
 * catalog or none of it. That keeps a half-finished translation from shipping a
 * page that switches language halfway down.
 */
import { type LocaleCode, asLocale } from "../../api/lib/locales";
import { CATALOGS, LABELS } from "./content";
import { type Article, type Category, articlesOf, refOf } from "./types";

/** How much of the Help Center exists in this locale. */
export type HelpCoverage = "full" | "labels" | "english";

export function coverageOf(locale: LocaleCode): HelpCoverage {
  if (CATALOGS[locale]) return "full";
  if (LABELS[locale]) return "labels";
  return "english";
}

/** True when the reader is looking at English copy inside a non-English UI. */
export const isUntranslated = (locale: LocaleCode) =>
  locale !== "en" && coverageOf(locale) !== "full";

const english = (): Category[] => CATALOGS.en ?? [];

/** Overlays a label pack on the English catalog, leaving every body untouched. */
function relabel(locale: LocaleCode): Category[] {
  const labels = LABELS[locale];
  if (!labels) return english();
  return english().map((category) => {
    const co = labels.categories[category.slug];
    return {
      ...category,
      title: co?.title ?? category.title,
      summary: co?.summary ?? category.summary,
      sections: category.sections.map((section) => ({
        title: labels.sections[section.title] ?? section.title,
        articles: section.articles.map((article) => {
          const ao = labels.articles[refOf(category.slug, article.slug)];
          return {
            ...article,
            title: ao?.title ?? article.title,
            summary: ao?.summary ?? article.summary,
          };
        }),
      })),
    };
  });
}

/** Every category, in index order, resolved for this locale. */
export function helpCategories(locale: LocaleCode): Category[] {
  return CATALOGS[locale] ?? (LABELS[locale] ? relabel(locale) : english());
}

export function findCategory(locale: LocaleCode, slug: string): Category | undefined {
  return helpCategories(locale).find((c) => c.slug === slug);
}

export type Located = { category: Category; article: Article; ref: string };

export function findArticle(
  locale: LocaleCode,
  categorySlug: string,
  articleSlug: string,
): Located | undefined {
  const category = findCategory(locale, categorySlug);
  if (!category) return undefined;
  const article = articlesOf(category).find((a) => a.slug === articleSlug);
  if (!article) return undefined;
  return { category, article, ref: refOf(category.slug, article.slug) };
}

/** Flat list for search and for the "every article" sitemap-ish listings. */
export function allArticles(locale: LocaleCode): Located[] {
  return helpCategories(locale).flatMap((category) =>
    articlesOf(category).map((article) => ({
      category,
      article,
      ref: refOf(category.slug, article.slug),
    })),
  );
}

/** Resolves a "category/slug" cross-reference. */
export function resolveRef(locale: LocaleCode, ref: string): Located | undefined {
  const [categorySlug, articleSlug] = ref.split("/");
  if (!categorySlug || !articleSlug) return undefined;
  return findArticle(locale, categorySlug, articleSlug);
}

export const articleHref = (categorySlug: string, articleSlug: string) =>
  `/help/${categorySlug}/${articleSlug}`;

/**
 * Dev-time integrity pass. A `see()` pointing at a slug that does not exist would
 * otherwise render as a dead link in production, so fail loudly in development
 * instead. Also catches duplicate slugs, which would make one article unreachable.
 */
export function assertHelpIntegrity(): void {
  for (const locale of Object.keys(CATALOGS) as LocaleCode[]) {
    const categories = CATALOGS[locale] ?? [];
    const known = new Set<string>();
    const catSlugs = new Set<string>();
    for (const category of categories) {
      if (catSlugs.has(category.slug)) {
        throw new Error(`[help:${locale}] duplicate category slug "${category.slug}"`);
      }
      catSlugs.add(category.slug);
      for (const article of articlesOf(category)) {
        const ref = refOf(category.slug, article.slug);
        if (known.has(ref)) throw new Error(`[help:${locale}] duplicate article "${ref}"`);
        known.add(ref);
      }
    }
    for (const category of categories) {
      for (const article of articlesOf(category)) {
        for (const block of article.body) {
          if (block.kind !== "see") continue;
          for (const ref of block.refs) {
            if (!known.has(ref)) {
              throw new Error(
                `[help:${locale}] ${refOf(category.slug, article.slug)} links to "${ref}", which does not exist`,
              );
            }
          }
        }
      }
    }
  }
}

export { asLocale };
