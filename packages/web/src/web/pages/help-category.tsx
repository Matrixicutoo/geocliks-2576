import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { ArrowRight } from "lucide-react";
import { HelpContact, HelpShell } from "../components/help-shell";
import { articleHref, findCategory, helpCategories, iconFor, isUntranslated } from "../help/registry";
import { articlesOf } from "../help/types";
import { useLocale, useT } from "../lib/i18n";
import { useSeo } from "../lib/seo";
import { helpSeo } from "../lib/seo-routes";
import { breadcrumbSchema, faqSchema } from "../lib/structured-data";

/** One category: its sections in order, each article as a row. */
export default function HelpCategory() {
  const t = useT();
  const { locale } = useLocale();
  const params = useParams<{ category: string }>();
  const category = useMemo(
    () => findCategory(locale, params.category ?? ""),
    [locale, params.category],
  );

  // Called before the not-found branch below, because hooks cannot sit behind a
  // conditional return. An unknown category slug is marked noindex rather than
  // left to be indexed as a thin duplicate of the Help Center index.
  const articles = category ? articlesOf(category) : [];
  // Search copy comes from `seo-routes.ts`, not from the catalog's `summary`:
  // the summary is visible copy written to read well in a category list, and it
  // is also what the server bakes into the HTML response. Falling back to the
  // catalog keeps a newly added category indexable before its copy is written.
  const copy = category ? helpSeo(category.slug) : undefined;
  useSeo(
    category
      ? {
          title: copy?.title ?? `${category.title} — GeoCliks Help`,
          description: copy?.description ?? category.summary,
          path: `/help/${category.slug}`,
          jsonLd: [
            breadcrumbSchema([
              { name: "Help Center", path: "/help" },
              { name: category.title },
            ]),
            // Each article's title is the problem and its summary is the
            // one-line answer, which is exactly a question/answer pair.
            faqSchema(
              articles.map((article) => ({
                question: article.title,
                answer: article.summary,
              })),
            ),
          ],
        }
      : { title: t("help.notFoundTitle"), noindex: true },
  );

  if (!category) {
    return (
      <HelpShell crumbs={[]}>
        <h1 className="font-display text-[28px] font-bold tracking-tight text-chalk">
          {t("help.notFoundTitle")}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-fog">{t("help.notFoundBody")}</p>
        <ul className="mt-6 space-y-2">
          {helpCategories(locale).map((c) => (
            <li key={c.slug}>
              <Link
                to={`/help/${c.slug}`}
                className="mono text-[12px] uppercase tracking-widest text-sky hover:underline"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </HelpShell>
    );
  }

  const Icon = iconFor(category.icon);

  return (
    <HelpShell crumbs={[{ label: category.title }]}>
      <header className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-[14px] border border-amber/30 text-amber">
          <Icon className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight text-chalk">
            {category.title}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-fog">{category.summary}</p>
          <p className="mono mt-3 text-[10.5px] uppercase tracking-widest text-fog">
            {t("help.articleCount", { count: articlesOf(category).length })}
          </p>
        </div>
      </header>

      {isUntranslated(locale) ? (
        <p className="mono mt-6 rounded-[12px] border border-line bg-ink-2 p-4 text-[11px] leading-relaxed text-fog">
          {t("help.untranslated")}
        </p>
      ) : null}

      <div className="mt-10 space-y-10">
        {category.sections.map((section) => (
          <section key={section.title}>
            <h2 className="label text-amber">{section.title}</h2>
            <ul className="mt-4 divide-y divide-line/60 overflow-hidden rounded-[16px] border border-line bg-ink-2">
              {section.articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    to={articleHref(category.slug, article.slug)}
                    className="group flex items-start gap-3 p-4 transition-colors hover:bg-ink"
                  >
                    <ArrowRight className="mt-1 size-4 shrink-0 text-amber" />
                    <span>
                      <span className="block text-[15px] font-semibold text-chalk transition-colors group-hover:text-amber">
                        {article.title}
                      </span>
                      <span className="mt-1 block text-[13.5px] leading-relaxed text-fog">
                        {article.summary}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <HelpContact />
    </HelpShell>
  );
}
