import { Link } from "wouter";
import { Check, Minus } from "lucide-react";
import { LandingCta, LandingFaq, LandingPage, LandingSection } from "../components/landing-page";
import { cn } from "../lib/utils";
import { SUPPORT_EMAIL } from "../lib/support";
import { pageFaq } from "../lib/page-schema";
import { useLocale, type TKey } from "../lib/i18n";

/**
 * Comparison landing page for "timemark alternative" and its neighbours.
 *
 * Written to the same two rules as `alternatives-companycam.tsx`, and they
 * matter more here, because Timemark is the nearest competitor this product
 * has. CompanyCam is a different category wearing similar clothes — a photo
 * feed. Timemark is the same category: a timestamp camera whose time comes off
 * the network, with a per-photo code and a public verification page. Most of
 * the easy "we verify, they don't" copy a comparison page reaches for would be
 * false on this one, so it is not here.
 *
 *  1. Every Timemark claim below was read off timemark.com, their plan
 *     comparison table, their FAQ and help.timemark.com on the date in the
 *     `tm.verifiedOn` catalog key, and each row says what their own
 *     documentation says. Where they match us, the row says they match us.
 *     Where they are cheaper, the row says they are cheaper. A row we cannot
 *     source is not a "No".
 *  2. `tm.verifiedOn` is rendered on the page. Re-check the rows and move the
 *     date in all eleven catalogs when you touch this file.
 *
 * The GeoCliks column comes from the product and the live plan table. Read the
 * prices off the running site, never off the seeds in `api/lib/plans.ts` —
 * those two have drifted before.
 *
 * All copy lives in the catalogs under `tm.*`; nothing here is hardcoded
 * English.
 */

type Cell =
  | { kind: "yes"; note?: TKey }
  | { kind: "no"; note?: TKey }
  | { kind: "text"; note: TKey };

const ROWS: Array<{ feature: TKey; detail?: TKey; us: Cell; them: Cell }> = [
  {
    feature: "tm.r1.feature",
    detail: "tm.r1.detail",
    us: { kind: "yes", note: "tm.r1.us" },
    them: { kind: "yes", note: "tm.r1.them" },
  },
  {
    feature: "tm.r2.feature",
    us: { kind: "yes", note: "tm.r2.us" },
    them: { kind: "yes", note: "tm.r2.them" },
  },
  {
    feature: "tm.r3.feature",
    detail: "tm.r3.detail",
    us: { kind: "yes", note: "tm.r3.us" },
    them: { kind: "text", note: "tm.r3.them" },
  },
  {
    feature: "tm.r4.feature",
    detail: "tm.r4.detail",
    us: { kind: "yes", note: "tm.r4.us" },
    them: { kind: "text", note: "tm.r4.them" },
  },
  {
    feature: "tm.r5.feature",
    detail: "tm.r5.detail",
    us: { kind: "yes", note: "tm.r5.us" },
    them: { kind: "text", note: "tm.r5.them" },
  },
  {
    feature: "tm.r6.feature",
    us: { kind: "yes", note: "tm.r6.us" },
    them: { kind: "text", note: "tm.r6.them" },
  },
  {
    feature: "tm.r7.feature",
    detail: "tm.r7.detail",
    us: { kind: "yes", note: "tm.r7.us" },
    them: { kind: "yes", note: "tm.r7.them" },
  },
  {
    feature: "tm.r8.feature",
    us: { kind: "yes", note: "tm.r8.us" },
    them: { kind: "text", note: "tm.r8.them" },
  },
  {
    feature: "tm.r9.feature",
    detail: "tm.r9.detail",
    us: { kind: "yes", note: "tm.r9.us" },
    them: { kind: "text", note: "tm.r9.them" },
  },
  {
    feature: "tm.r10.feature",
    us: { kind: "yes", note: "tm.r10.us" },
    them: { kind: "yes", note: "tm.r10.them" },
  },
  {
    feature: "tm.r11.feature",
    us: { kind: "text", note: "tm.r11.us" },
    them: { kind: "text", note: "tm.r11.them" },
  },
];

const PICK: TKey[] = ["tm.pick.1", "tm.pick.2", "tm.pick.3", "tm.pick.4", "tm.pick.5"];

function Mark({ cell }: { cell: Cell }) {
  // Same as the CompanyCam page: the icon is decorative, so the verdict has to
  // reach a screen reader as text, and is skipped when the visible copy is
  // already that word.
  const { t } = useLocale();
  const word = cell.kind === "yes" ? t("tm.yes") : cell.kind === "no" ? t("tm.no") : "";
  const note = cell.note ? t(cell.note) : "";
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
        className={cn("text-[13.5px] leading-snug", cell.kind === "no" ? "text-fog/70" : "text-fog")}
      >
        {verdict ? <span className="sr-only">{verdict} </span> : null}
        {cell.kind === "yes" && !cell.note ? (
          <span className="font-semibold text-chalk">{t("tm.yes")}</span>
        ) : cell.kind === "no" && !cell.note ? (
          t("tm.no")
        ) : (
          note
        )}
      </span>
    </div>
  );
}

export default function AlternativesTimemark() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/alternatives/timemark", locale);

  return (
    <LandingPage
      path="/alternatives/timemark"
      eyebrow={t("tm.eyebrow")}
      h1={t("tm.h1")}
      sub={t("tm.sub")}
    >
      <LandingSection label={t("tm.s1.label")} h2={t("tm.s1.h2")} intro={t("tm.s1.intro")} />

      <LandingSection label={t("tm.s2.label")} h2={t("tm.s2.h2")}>
        <div className="overflow-x-auto rounded-[12px] border border-line">
          <table className="w-full min-w-[720px] border-collapse text-start">
            <caption className="sr-only">{t("tm.table.caption")}</caption>
            <thead>
              <tr className="border-b border-line bg-ink-2">
                <th scope="col" className="label px-4 py-3 text-start">
                  {t("tm.table.feature")}
                </th>
                <th scope="col" className="label px-4 py-3 text-start text-amber">
                  {t("tm.table.us")}
                </th>
                <th scope="col" className="label px-4 py-3 text-start">
                  {t("tm.table.them")}
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
          {t("tm.sources", { date: t("tm.verifiedOn"), email: SUPPORT_EMAIL })}
        </p>
      </LandingSection>

      <LandingSection label={t("tm.s3.label")} h2={t("tm.s3.h2")} intro={t("tm.s3.intro")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[12px] border border-line bg-ink-2 p-5">
            <p className="label">{t("tm.win1.label")}</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-fog">{t("tm.win1.body")}</p>
          </div>
          <div className="rounded-[12px] border border-line bg-ink-2 p-5">
            <p className="label">{t("tm.win2.label")}</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-fog">{t("tm.win2.body")}</p>
          </div>
        </div>
      </LandingSection>

      <LandingSection label={t("tm.s4.label")} h2={t("tm.s4.h2")} intro={t("tm.s4.intro")}>
        <div className="rounded-[12px] border border-line bg-ink-2 p-5 sm:p-6">
          <p className="label">{t("tm.pick.label")}</p>
          <ul className="mt-4 space-y-3">
            {PICK.map((key) => (
              <li key={key} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
                <span className="text-[14px] leading-relaxed text-fog">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </LandingSection>

      <LandingSection label={t("tm.faqSection.label")} h2={t("tm.faqSection.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("tm.cta.h2")}
        body={t("tm.cta.body")}
        primary={{ label: t("tm.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("tm.cta.secondary"), to: "/help/verify/how-sealing-works" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("tm.related.lead")}{" "}
            <Link
              to="/alternatives/companycam"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("tm.related.companycam")}
            </Link>
            {t("tm.related.mid")}{" "}
            <Link
              to="/construction-photo-documentation"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("tm.related.construction")}
            </Link>
            .
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
