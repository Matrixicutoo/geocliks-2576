import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Search } from "lucide-react";
import { HelpContact, HelpShell } from "../components/help-shell";
import { allArticles, articleHref, helpCategories, iconFor, isUntranslated } from "../help/registry";
import { articlesOf } from "../help/types";
import { useLocale, useT } from "../lib/i18n";

/** Matches on title, summary, keywords and body text — one pass, no index. */
function useSearch(query: string) {
  const { locale } = useLocale();
  const articles = useMemo(() => allArticles(locale), [locale]);
  return useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    const words = needle.split(/\s+/);
    return articles
      .map((hit) => {
        const title = hit.article.title.toLowerCase();
        const summary = hit.article.summary.toLowerCase();
        const keywords = (hit.article.keywords ?? []).join(" ").toLowerCase();
        const body = hit.article.body
          .map((b) =>
            "text" in b
              ? b.text
              : "items" in b
                ? b.items.join(" ")
                : "rows" in b
                  ? [...b.head, ...b.rows.flat()].join(" ")
                  : "",
          )
          .join(" ")
          .toLowerCase();
        const haystack = `${title} ${summary} ${keywords} ${body}`;
        if (!words.every((w) => haystack.includes(w))) return null;
        // Title matches outrank a word buried in the body.
        const score = title.includes(needle)
          ? 0
          : summary.includes(needle) || keywords.includes(needle)
            ? 1
            : 2;
        return { hit, score };
      })
      .filter((r): r is { hit: (typeof articles)[number]; score: number } => r !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, 12)
      .map((r) => r.hit);
  }, [articles, query]);
}

export default function Help() {
  const t = useT();
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const results = useSearch(query);
  const categories = useMemo(() => helpCategories(locale), [locale]);
  const searching = query.trim().length >= 2;

  return (
    <HelpShell crumbs={[]} wide>
      <section className="mx-auto max-w-[720px] text-center">
        <p className="label text-amber">{t("help.eyebrow")}</p>
        <h1 className="mt-3 font-display text-[34px] font-bold leading-tight tracking-tight text-chalk sm:text-[44px]">
          {t("help.headline")}
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-fog">{t("help.sub")}</p>

        <div className="relative mt-8">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fog" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("help.searchPlaceholder")}
            aria-label={t("help.searchPlaceholder")}
            className="w-full rounded-[14px] border border-line bg-ink-2 py-3.5 pl-11 pr-4 text-[15px] text-chalk placeholder:text-fog focus:border-amber focus:outline-none"
          />
        </div>

        {isUntranslated(locale) ? (
          <p className="mono mt-4 text-[11px] leading-relaxed text-fog">{t("help.untranslated")}</p>
        ) : null}
      </section>

      {searching ? (
        <section className="mx-auto mt-10 max-w-[720px]">
          {results.length === 0 ? (
            <p className="text-center text-[15px] text-fog">{t("help.searchEmpty")}</p>
          ) : (
            <ul className="space-y-2">
              {results.map(({ category, article }) => (
                <li key={`${category.slug}/${article.slug}`}>
                  <Link
                    to={articleHref(category.slug, article.slug)}
                    className="block rounded-[14px] border border-line bg-ink-2 p-4 text-left transition-colors hover:border-amber/60"
                  >
                    <p className="mono text-[10.5px] uppercase tracking-widest text-fog">
                      {category.title}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-chalk">{article.title}</p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-fog">{article.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = iconFor(category.icon);
            const count = articlesOf(category).length;
            return (
              <Link
                key={category.slug}
                to={`/help/${category.slug}`}
                className="group flex h-full flex-col rounded-[18px] border border-line bg-ink-2 p-6 transition-colors hover:border-amber/60"
              >
                <span className="grid size-10 place-items-center rounded-[12px] border border-amber/30 text-amber">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 font-display text-[18px] font-bold tracking-tight text-chalk">
                  {category.title}
                </h2>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-fog">
                  {category.summary}
                </p>
                <span className="mono mt-4 flex items-center gap-2 text-[10.5px] uppercase tracking-widest text-fog transition-colors group-hover:text-amber">
                  {t("help.articleCount", { count })}
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            );
          })}
        </section>
      )}

      <div className="mx-auto max-w-[860px]">
        <HelpContact />
      </div>
    </HelpShell>
  );
}
