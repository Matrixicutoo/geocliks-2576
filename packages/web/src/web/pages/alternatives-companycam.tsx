import { Link } from "wouter";
import { Check, Minus } from "lucide-react";
import { LandingCta, LandingFaq, LandingPage, LandingSection } from "../components/landing-page";
import { cn } from "../lib/utils";
import { SUPPORT_EMAIL } from "../lib/support";
import { pageFaq } from "../lib/page-schema";
import { useLocale, type TKey } from "../lib/i18n";

/**
 * Comparison landing page for "companycam alternatives" and its neighbours.
 *
 * A competitor comparison is the one page on a marketing site where being
 * wrong is expensive, so two rules are baked into how this file is written:
 *
 *  1. Every CompanyCam claim below was read off companycam.com and their own
 *     help centre on the date in `cc.verifiedOn`, and the row says what their
 *     documentation says rather than what is convenient. Where they simply do
 *     not describe something — whether their timestamp is checked against
 *     anything but the device — the row says that, instead of claiming a "No"
 *     that cannot be sourced.
 *  2. That date is rendered on the page. Vendors change plans and features, and
 *     a comparison table with no date on it is a liability the moment they do.
 *     Re-check the rows and move the date when you touch this page — it lives in
 *     the catalogs as `cc.verifiedOn`, written the way each language writes a
 *     date, so moving it means eleven rows rather than one constant.
 *
 * The GeoCliks column is drawn from the product itself and from the live plan
 * table — `billing.plans`, which is the DB rows an operator edits in
 * /admin/plans, not the shipped seeds in `api/lib/plans.ts`. Those two drifted
 * once already: the seeds still said $12/$50/$125 after the live prices moved to
 * $7/$45/$105, and this page had copied the seeds. Read the prices off the
 * running site, never off the seed file.
 */

type Cell =
  | { kind: "yes"; note?: TKey }
  | { kind: "no"; note?: TKey }
  | { kind: "text"; note: TKey };

const ROWS: Array<{ feature: TKey; detail?: TKey; us: Cell; them: Cell }> = [
  {
    feature: "cc.r1.feature",
    detail: "cc.r1.detail",
    us: { kind: "yes", note: "cc.r1.us" },
    them: { kind: "text", note: "cc.r1.them" },
  },
  {
    feature: "cc.r2.feature",
    us: { kind: "yes", note: "cc.r2.us" },
    them: { kind: "text", note: "cc.r2.them" },
  },
  {
    feature: "cc.r3.feature",
    detail: "cc.r3.detail",
    us: { kind: "yes", note: "cc.r3.us" },
    them: { kind: "text", note: "cc.r3.them" },
  },
  {
    feature: "cc.r4.feature",
    detail: "cc.r4.detail",
    us: { kind: "yes", note: "cc.r4.us" },
    them: { kind: "no" },
  },
  {
    feature: "cc.r5.feature",
    us: { kind: "yes", note: "cc.r5.us" },
    them: { kind: "no" },
  },
  {
    feature: "cc.r6.feature",
    us: { kind: "yes" },
    them: { kind: "yes" },
  },
  { feature: "cc.r7.feature", us: { kind: "yes" }, them: { kind: "yes" } },
  { feature: "cc.r8.feature", us: { kind: "yes" }, them: { kind: "yes" } },
  {
    feature: "cc.r9.feature",
    us: { kind: "yes", note: "cc.r9.us" },
    them: { kind: "yes", note: "cc.r9.them" },
  },
  {
    feature: "cc.r10.feature",
    detail: "cc.r10.detail",
    us: { kind: "yes", note: "cc.r10.us" },
    them: { kind: "no" },
  },
  {
    feature: "cc.r11.feature",
    us: { kind: "yes", note: "cc.r11.us" },
    them: { kind: "text", note: "cc.r11.them" },
  },
  {
    feature: "cc.r12.feature",
    us: { kind: "text", note: "cc.r12.us" },
    them: { kind: "text", note: "cc.r12.them" },
  },
];

function Mark({ cell }: { cell: Cell }) {
  const { t } = useLocale();
  // The icon is decorative, so the yes/no verdict has to reach a screen reader
  // as text. Skipped when the visible copy is already that word, which would
  // otherwise be read as "No. No".
  const word = cell.kind === "yes" ? t("cc.yes") : cell.kind === "no" ? t("cc.no") : "";
  const note = cell.note ? t(cell.note) : "";
  // With no note, the cell already renders the bare word.
  const visible = note.trim() || word;
  const verdict = word && visible !== word ? `${word}.` : "";

  return (
    <div className="flex items-start gap-2">
      {cell.kind === "yes" ? (
        <Check className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
      ) : cell.kind === "no" ? (
        <Minus className="mt-0.5 size-4 shrink-0 text-fog/50" aria-hidden />
      ) : null}
      <span
        className={cn(
          "text-[13.5px] leading-snug",
          cell.kind === "no" ? "text-fog/70" : "text-fog",
        )}
      >
        {verdict ? <span className="sr-only">{verdict} </span> : null}
        {cell.kind === "yes" && !cell.note ? (
          <span className="font-semibold text-chalk">{t("cc.yes")}</span>
        ) : cell.kind === "no" && !cell.note ? (
          t("cc.no")
        ) : (
          note
        )}
      </span>
    </div>
  );
}

export default function AlternativesCompanyCam() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/alternatives/companycam", locale);
  const who: TKey[] = ["cc.who.1", "cc.who.2", "cc.who.3", "cc.who.4"];

  return (
    <LandingPage
      path="/alternatives/companycam"
      eyebrow={t("cc.eyebrow")}
      h1={t("cc.h1")}
      sub={t("cc.sub")}
    >
      <LandingSection label={t("cc.s1.label")} h2={t("cc.s1.h2")} intro={t("cc.s1.intro")} />

      <LandingSection label={t("cc.s2.label")} h2={t("cc.s2.h2")}>
        <div className="overflow-x-auto rounded-[12px] border border-line">
          <table className="w-full min-w-[720px] border-collapse text-start">
            <caption className="sr-only">{t("cc.table.caption")}</caption>
            <thead>
              <tr className="border-b border-line bg-ink-2">
                <th scope="col" className="label px-4 py-3 text-start">
                  {t("cc.table.feature")}
                </th>
                <th scope="col" className="label px-4 py-3 text-start text-amber">
                  {t("cc.table.us")}
                </th>
                <th scope="col" className="label px-4 py-3 text-start">
                  {t("cc.table.them")}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-line last:border-0">
                  <th scope="row" className="px-4 py-4 align-top text-start">
                    <span className="font-display text-[14px] font-semibold text-chalk">
                      {t(row.feature)}
                    </span>
                    {row.detail ? (
                      <span className="mt-1 block text-[12.5px] leading-snug text-fog/80">
                        {t(row.detail)}
                      </span>
                    ) : null}
                  </th>
                  <td className="bg-amber/[0.04] px-4 py-4 align-top">
                    <Mark cell={row.us} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <Mark cell={row.them} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-[820px] text-[12.5px] leading-relaxed text-fog/80">
          {t("cc.sources", { date: t("cc.verifiedOn"), email: SUPPORT_EMAIL })}
        </p>
      </LandingSection>

      <LandingSection label={t("cc.s3.label")} h2={t("cc.s3.h2")} intro={t("cc.s3.intro")}>
        <div className="rounded-[12px] border border-line bg-ink-2 p-5 sm:p-6">
          <p className="label">{t("cc.who.label")}</p>
          <ul className="mt-4 space-y-3">
            {who.map((key) => (
              <li key={key} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
                <span className="text-[14px] leading-relaxed text-fog">{t(key)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-[13.5px] leading-relaxed text-fog">
            {t("cc.who.foot")}
          </p>
        </div>
      </LandingSection>

      <LandingSection label={t("cc.faqSection.label")} h2={t("cc.faqSection.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("cc.cta.h2")}
        body={t("cc.cta.body")}
        primary={{ label: t("cc.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("cc.cta.secondary"), to: "/help/verify/how-sealing-works" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("cc.related.lead")}{" "}
            <Link
              to="/construction-photo-documentation"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("cc.related.construction")}
            </Link>
            {t("cc.related.mid")}{" "}
            <Link
              to="/alternatives/timemark"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("cc.related.timemark")}
            </Link>
            .
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
