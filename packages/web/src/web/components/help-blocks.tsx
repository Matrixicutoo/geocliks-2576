import { Link } from "wouter";
import { AlertTriangle, ArrowRight, Info } from "lucide-react";
import type { LocaleCode } from "../../api/lib/locales";
import type { Block } from "../help/types";
import { articleHref, resolveRef } from "../help/registry";
import { useT } from "../lib/i18n";

/**
 * Renders one article body. Every block type has exactly one look, so 59 articles
 * can never drift typographically — authors choose meaning, not styling.
 *
 * Content is plain strings, so nothing here uses dangerouslySetInnerHTML.
 */

/** Stable anchor id for a heading, so the on-page contents list can jump to it. */
export const anchorFor = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function SeeAlso({ refs, locale }: { refs: string[]; locale: LocaleCode }) {
  const t = useT();
  const found = refs
    .map((ref) => resolveRef(locale, ref))
    .filter((hit): hit is NonNullable<typeof hit> => Boolean(hit));

  if (found.length === 0) return null;

  return (
    <aside className="rounded-[16px] border border-line bg-ink-2 p-5">
      <p className="label text-amber">{t("help.related")}</p>
      <ul className="mt-3 space-y-2">
        {found.map(({ category, article }) => (
          <li key={`${category.slug}/${article.slug}`}>
            <Link
              to={articleHref(category.slug, article.slug)}
              className="group flex items-start gap-2 text-[14px] font-semibold text-chalk transition-colors hover:text-amber"
            >
              <ArrowRight className="mt-1 size-3.5 shrink-0 text-amber" />
              <span>{article.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function HelpBlock({ block, locale }: { block: Block; locale: LocaleCode }) {
  switch (block.kind) {
    case "p":
      return <p className="text-[15px] leading-[1.75] text-fog">{block.text}</p>;

    case "h":
      return (
        <h2
          id={anchorFor(block.text)}
          className="scroll-mt-24 pt-4 font-display text-[21px] font-bold tracking-tight text-chalk"
        >
          {block.text}
        </h2>
      );

    case "ul":
      return (
        <ul className="ml-1 space-y-2">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-[15px] leading-[1.7] text-fog">
              <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-amber" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <ol className="space-y-3">
          {block.items.map((item, i) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mono mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-amber/40 text-[11px] text-amber">
                {i + 1}
              </span>
              <span className="text-[15px] leading-[1.7] text-fog">{item}</span>
            </li>
          ))}
        </ol>
      );

    case "note":
      return (
        <div className="flex items-start gap-3 rounded-[14px] border border-line bg-ink-2 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-sky" />
          <p className="text-[14px] leading-[1.7] text-fog">{block.text}</p>
        </div>
      );

    case "warn":
      return (
        <div className="flex items-start gap-3 rounded-[14px] border border-alert/40 bg-alert/5 p-4">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-alert" />
          <p className="text-[14px] leading-[1.7] text-chalk">{block.text}</p>
        </div>
      );

    case "table":
      return (
        <div className="overflow-x-auto rounded-[14px] border border-line">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-ink-2">
                {block.head.map((cell) => (
                  <th
                    key={cell}
                    className="mono border-b border-line px-4 py-3 text-[10.5px] uppercase tracking-widest text-fog"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("|")} className="border-b border-line/60 last:border-0">
                  {row.map((cell, i) => (
                    <td
                      key={`${cell}-${i}`}
                      className={`px-4 py-3 text-[14px] leading-relaxed ${i === 0 ? "font-semibold text-chalk" : "text-fog"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "see":
      return <SeeAlso refs={block.refs} locale={locale} />;
  }
}

export function HelpBody({ body, locale }: { body: Block[]; locale: LocaleCode }) {
  return (
    <div className="space-y-5">
      {body.map((block, i) => (
        <HelpBlock key={`${block.kind}-${i}`} block={block} locale={locale} />
      ))}
    </div>
  );
}
