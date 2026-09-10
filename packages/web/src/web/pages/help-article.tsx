import { useMemo } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { HelpBody, anchorFor } from "../components/help-blocks";
import { HelpContact, HelpShell } from "../components/help-shell";
import { articleHref, findArticle, helpCategories, isUntranslated } from "../help/registry";
import { articlesOf } from "../help/types";
import { useLocale, useT } from "../lib/i18n";

/** One article, plus an on-page contents list and the rest of its category. */
export default function HelpArticle() {
  const t = useT();
  const { locale } = useLocale();
  const params = useParams<{ category: string; slug: string }>();
  const found = useMemo(
    () => findArticle(locale, params.category ?? "", params.slug ?? ""),
    [locale, params.category, params.slug],
  );

  if (!found) {
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

  const { category, article } = found;
  const headings = article.body.filter((b) => b.kind === "h");
  const siblings = articlesOf(category).filter((a) => a.slug !== article.slug);

  return (
    <HelpShell
      crumbs={[
        { label: category.title, href: `/help/${category.slug}` },
        { label: article.title },
      ]}
    >
      <article>
        <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight text-chalk sm:text-[34px]">
          {article.title}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-fog">{article.summary}</p>

        {isUntranslated(locale) ? (
          <p className="mono mt-6 rounded-[12px] border border-line bg-ink-2 p-4 text-[11px] leading-relaxed text-fog">
            {t("help.untranslated")}
          </p>
        ) : null}

        {headings.length > 2 ? (
          <nav className="mt-8 rounded-[14px] border border-line bg-ink-2 p-5">
            <p className="label text-amber">{t("help.onThisPage")}</p>
            <ul className="mt-3 space-y-1.5">
              {headings.map((heading) => (
                <li key={heading.text}>
                  <a
                    href={`#${anchorFor(heading.text)}`}
                    className="text-[14px] text-fog transition-colors hover:text-amber"
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="mt-9">
          <HelpBody body={article.body} locale={locale} />
        </div>
      </article>

      {siblings.length > 0 ? (
        <section className="mt-14">
          <h2 className="label text-amber">{t("help.moreIn", { category: category.title })}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {siblings.map((sibling) => (
              <li key={sibling.slug}>
                <Link
                  to={articleHref(category.slug, sibling.slug)}
                  className="flex items-start gap-2 rounded-[12px] border border-line bg-ink-2 p-3.5 text-[14px] font-semibold text-chalk transition-colors hover:border-amber/60 hover:text-amber"
                >
                  <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-amber" />
                  {sibling.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        to={`/help/${category.slug}`}
        className="mono mt-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-fog transition-colors hover:text-amber"
      >
        <ArrowLeft className="size-3.5" /> {category.title}
      </Link>

      <HelpContact />
    </HelpShell>
  );
}
