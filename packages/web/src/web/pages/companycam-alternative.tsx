import { Link } from "wouter";
import {
  Check,
  Clapperboard,
  Columns2,
  FileDown,
  FolderKanban,
  Link2,
  Minus,
  Receipt,
  Clock,
  ToggleLeft,
  WifiOff,
} from "lucide-react";
import {
  LandingCards,
  LandingCta,
  LandingFaq,
  LandingPage,
  LandingSection,
  LandingSteps,
} from "../components/landing-page";
import { pageFaq } from "../lib/page-schema";
import { useLocale, type TKey } from "../lib/i18n";

/**
 * Search landing page for "companycam alternative" — the switcher query.
 *
 * Deliberately a separate page from `/alternatives/companycam`. Someone typing
 * "GeoCliks vs CompanyCam" is still comparing; someone typing "CompanyCam
 * alternative" has mostly decided to leave and wants to know what they lose,
 * what they keep and how the move works. So this page leads with why crews
 * leave, says plainly who should stay, and ends on a one-job migration — and
 * hands the full feature table back to the comparison page instead of
 * repeating it.
 *
 * Same sourcing rule as the comparison page: every CompanyCam statement here is
 * one that page already makes from their own documentation (see the note at
 * the top of `alternatives-companycam.tsx`), dated by `cc.verifiedOn`. The
 * side-by-side reuses that page's `cc.r*` rows rather than restating them, so
 * the two pages cannot drift apart. Do not add a CompanyCam claim here that is
 * not first sourced there.
 */

const WHY: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: Receipt, title: "cca.why1.title", body: "cca.why1.body" },
  { icon: Clock, title: "cca.why2.title", body: "cca.why2.body" },
  { icon: ToggleLeft, title: "cca.why3.title", body: "cca.why3.body" },
];

const KEEP: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: FolderKanban, title: "cca.keep1.title", body: "cca.keep1.body" },
  { icon: Columns2, title: "cca.keep2.title", body: "cca.keep2.body" },
  { icon: FileDown, title: "cca.keep3.title", body: "cca.keep3.body" },
  { icon: WifiOff, title: "cca.keep4.title", body: "cca.keep4.body" },
  { icon: Link2, title: "cca.keep5.title", body: "cca.keep5.body" },
  { icon: Clapperboard, title: "cca.keep6.title", body: "cca.keep6.body" },
];

const STEPS: { title: TKey; body: TKey }[] = [
  { title: "cca.move1.title", body: "cca.move1.body" },
  { title: "cca.move2.title", body: "cca.move2.body" },
  { title: "cca.move3.title", body: "cca.move3.body" },
  { title: "cca.move4.title", body: "cca.move4.body" },
];

/** The five comparison rows that decide a switch, borrowed from the full table. */
const SIDE: Array<{ feature: TKey; us: TKey | null; them: TKey | null }> = [
  { feature: "cc.r1.feature", us: "cc.r1.us", them: "cc.r1.them" },
  { feature: "cc.r3.feature", us: "cc.r3.us", them: "cc.r3.them" },
  { feature: "cc.r4.feature", us: "cc.r4.us", them: null },
  { feature: "cc.r11.feature", us: "cc.r11.us", them: "cc.r11.them" },
  { feature: "cc.r12.feature", us: "cc.r12.us", them: "cc.r12.them" },
];

const linkClass =
  "font-semibold text-amber-ink underline decoration-amber/40 underline-offset-4 hover:decoration-amber";

function CheckList({ items, muted = false }: { items: string[]; muted?: boolean }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          {muted ? (
            <Minus className="mt-0.5 size-4 shrink-0 text-fog/60" aria-hidden />
          ) : (
            <Check className="mt-0.5 size-4 shrink-0 text-amber-ink" aria-hidden />
          )}
          <span className="text-[14px] leading-relaxed text-fog">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function CompanyCamAlternative() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/companycam-alternative", locale);
  const cards = (list: typeof WHY) =>
    list.map((card) => ({ icon: card.icon, title: t(card.title), body: t(card.body) }));
  const steps = STEPS.map((step) => ({ title: t(step.title), body: t(step.body) }));

  return (
    <LandingPage
      path="/companycam-alternative"
      eyebrow={t("cca.eyebrow")}
      h1={t("cca.h1")}
      sub={t("cca.sub")}
    >
      <LandingSection label={t("cca.why.label")} h2={t("cca.why.h2")} intro={t("cca.why.intro")}>
        <LandingCards items={cards(WHY)} />
      </LandingSection>

      <LandingSection
        label={t("cca.keep.label")}
        h2={t("cca.keep.h2")}
        intro={t("cca.keep.intro")}
      >
        <LandingCards items={cards(KEEP)} />
      </LandingSection>

      <LandingSection label={t("cca.gap.label")} h2={t("cca.gap.h2")} intro={t("cca.gap.intro")}>
        <div className="max-w-[820px] rounded-[12px] border border-line bg-ink-2 p-5 sm:p-6">
          <CheckList items={[t("cca.gap1"), t("cca.gap2"), t("cca.gap3")]} />
          <p className="mt-5 border-t border-line pt-4 text-[13.5px] leading-relaxed text-fog">
            {t("cca.gap.foot")}
          </p>
        </div>
      </LandingSection>

      <LandingSection label={t("cca.side.label")} h2={t("cca.side.h2")}>
        <div className="overflow-x-auto rounded-[12px] border border-line">
          <table className="w-full min-w-[640px] border-collapse text-start">
            <caption className="sr-only">{t("cc.table.caption")}</caption>
            <thead>
              <tr className="border-b border-line bg-ink-2">
                <th scope="col" className="label px-4 py-3 text-start">
                  {t("cc.table.feature")}
                </th>
                <th scope="col" className="label px-4 py-3 text-start text-amber-ink">
                  {t("cc.table.us")}
                </th>
                <th scope="col" className="label px-4 py-3 text-start">
                  {t("cc.table.them")}
                </th>
              </tr>
            </thead>
            <tbody>
              {SIDE.map((row) => (
                <tr key={row.feature} className="border-b border-line last:border-0">
                  <th
                    scope="row"
                    className="px-4 py-4 align-top text-start font-display text-[14px] font-semibold text-chalk"
                  >
                    {t(row.feature)}
                  </th>
                  <td className="bg-amber/[0.04] px-4 py-4 align-top text-[13.5px] leading-snug text-fog">
                    {row.us ? t(row.us) : t("cc.yes")}
                  </td>
                  <td className="px-4 py-4 align-top text-[13.5px] leading-snug text-fog/90">
                    {row.them ? t(row.them) : t("cc.no")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-[820px] text-[12.5px] leading-relaxed text-fog/90">
          {t("cca.side.note", { date: t("cc.verifiedOn") })}
        </p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-fog">
          {t("cca.side.fullLead")}{" "}
          <Link to="/alternatives/companycam" className={linkClass}>
            {t("cca.side.fullLink")}
          </Link>
          .
        </p>
      </LandingSection>

      <LandingSection label={t("cca.stay.label")} h2={t("cca.stay.h2")}>
        <div className="max-w-[820px]">
          <CheckList muted items={[t("cca.stay1"), t("cca.stay2"), t("cca.stay3")]} />
        </div>
      </LandingSection>

      <LandingSection label={t("cca.switch.label")} h2={t("cca.switch.h2")}>
        <div className="max-w-[820px]">
          <CheckList
            items={[
              t("cca.switch1"),
              t("cca.switch2"),
              t("cca.switch3"),
              t("cca.switch4"),
              t("cca.switch5"),
            ]}
          />
        </div>
      </LandingSection>

      <LandingSection label={t("cca.move.label")} h2={t("cca.move.h2")} intro={t("cca.move.intro")}>
        <LandingSteps steps={steps} />
        {/* The long form of these four steps. The post is English-only, like the rest of
            Field Notes, so other locales say so next to the link, and `~` escapes the
            locale base so the link goes to the canonical /blog URL, not /es/blog. */}
        <p className="mt-6 max-w-[820px] text-[13.5px] leading-relaxed text-fog">
          {t("ccmig.lead")}{" "}
          <Link to="~/blog/move-one-companycam-project" className={linkClass}>
            {t("ccmig.link")}
          </Link>
          {locale === "en" ? "" : ` ${t("ccmig.enNote")}`}.
        </p>
      </LandingSection>

      <LandingSection label={t("cca.faq.label")} h2={t("cca.faq.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("cca.cta.h2")}
        body={t("cca.cta.body")}
        primary={{ label: t("cca.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("cca.cta.secondary"), to: "/verify" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("cca.related.lead")}{" "}
            <Link to="/construction-photo-documentation" className={linkClass}>
              {t("cca.related.construction")}
            </Link>
            {t("cca.related.mid")}{" "}
            <Link to="/pricing" className={linkClass}>
              {t("cca.related.pricing")}
            </Link>
            .
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
