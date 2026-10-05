import { Link } from "wouter";
import { Check, Minus, PenLine, ServerOff, Smartphone } from "lucide-react";
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
 * Search landing page for "solocator alternative".
 *
 * Solocator is a one-time-purchase stamp camera with no backend, so the honest
 * argument is narrow: it writes a stamp onto the photo, it does not give anyone
 * else a way to check that stamp. The page says that, then says plainly who is
 * better off staying (pay-once, surveying overlays, nothing on a server).
 *
 * There is no `/alternatives/solocator` comparison page to borrow rows from, so
 * this page carries its own sourced table. Every Solocator statement below was
 * read on `sla.verifiedOn` (5 Oct 2026) from:
 *   - solocator.com home page: overlays (bearing, altitude, UTM/MGRS*, street
 *     address*, building elevation), two photos at once (stamped + original),
 *     autosave to camera roll / iCloud / Dropbox / Google Drive / OneDrive,
 *     KML / KMZ / CSV export. * = Industry Pack.
 *   - /frequently-asked-questions/: app and Industry Pack are one-time charges,
 *     no subscription; "no backend or login"; no photo backup service;
 *     purchases tied to the Apple ID / Google account.
 *   - /privacy-policy/ (June 2026): "no backend servers to sync photos to or log
 *     into"; internet only for maps, street address, sharing, user guide and
 *     in-app purchases; cloud autosave is an Industry Pack feature.
 *   - /article/how-to-edit-notes-camera-overlays-in-solocator-android/ and the
 *     US App Store version history: notes, watermark, overlay format and
 *     "geospatial information and formats" can be edited after capture.
 *   - US App Store listing: app $0.99, Industry Pack in-app purchase $5.99.
 * No team / shared-project feature is described anywhere in their docs, which
 * is why that row says "not described" rather than "no".
 *
 * GeoCliks claims are the same ones the other comparison pages make (plans.ts,
 * verify.ts). GeoCliks does not burn bearing or altitude into the stamp
 * (components/stamp.tsx), which is why `sla.stay2` concedes it.
 */

const WHY: { icon: typeof PenLine; title: TKey; body: TKey }[] = [
  { icon: PenLine, title: "sla.why1.title", body: "sla.why1.body" },
  { icon: ServerOff, title: "sla.why2.title", body: "sla.why2.body" },
  { icon: Smartphone, title: "sla.why3.title", body: "sla.why3.body" },
];

const STEPS: { title: TKey; body: TKey }[] = [
  { title: "sla.move1.title", body: "sla.move1.body" },
  { title: "sla.move2.title", body: "sla.move2.body" },
  { title: "sla.move3.title", body: "sla.move3.body" },
  { title: "sla.move4.title", body: "sla.move4.body" },
];

const ROWS: Array<{ feature: TKey; us: TKey; them: TKey }> = [
  { feature: "sla.r1.feature", us: "sla.r1.us", them: "sla.r1.them" },
  { feature: "sla.r2.feature", us: "sla.r2.us", them: "sla.r2.them" },
  { feature: "sla.r3.feature", us: "sla.r3.us", them: "sla.r3.them" },
  { feature: "sla.r4.feature", us: "sla.r4.us", them: "sla.r4.them" },
  { feature: "sla.r5.feature", us: "sla.r5.us", them: "sla.r5.them" },
  { feature: "sla.r6.feature", us: "sla.r6.us", them: "sla.r6.them" },
  { feature: "sla.r7.feature", us: "sla.r7.us", them: "sla.r7.them" },
  { feature: "sla.r8.feature", us: "sla.r8.us", them: "sla.r8.them" },
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

export default function SolocatorAlternative() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/solocator-alternative", locale);
  const cards = WHY.map((card) => ({ icon: card.icon, title: t(card.title), body: t(card.body) }));
  const steps = STEPS.map((step) => ({ title: t(step.title), body: t(step.body) }));

  return (
    <LandingPage
      path="/solocator-alternative"
      eyebrow={t("sla.eyebrow")}
      h1={t("sla.h1")}
      sub={t("sla.sub")}
    >
      <LandingSection label={t("sla.why.label")} h2={t("sla.why.h2")} intro={t("sla.why.intro")}>
        <LandingCards items={cards} />
      </LandingSection>

      <LandingSection label={t("sla.gap.label")} h2={t("sla.gap.h2")}>
        <div className="max-w-[820px] rounded-[12px] border border-line bg-ink-2 p-5 sm:p-6">
          <CheckList items={[t("sla.gap1"), t("sla.gap2"), t("sla.gap3"), t("sla.gap4")]} />
          <p className="mt-5 border-t border-line pt-4 text-[13.5px] leading-relaxed text-fog">
            {t("sla.gap.foot")}
          </p>
        </div>
      </LandingSection>

      <LandingSection label={t("sla.side.label")} h2={t("sla.side.h2")}>
        <div className="overflow-x-auto rounded-[12px] border border-line">
          <table className="w-full min-w-[640px] border-collapse text-start">
            <caption className="sr-only">{t("sla.table.caption")}</caption>
            <thead>
              <tr className="border-b border-line bg-ink-2">
                <th scope="col" className="label px-4 py-3 text-start">
                  {t("sla.table.feature")}
                </th>
                <th scope="col" className="label px-4 py-3 text-start text-amber-ink">
                  {t("sla.table.us")}
                </th>
                <th scope="col" className="label px-4 py-3 text-start">
                  {t("sla.table.them")}
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-line last:border-0">
                  <th
                    scope="row"
                    className="px-4 py-4 align-top text-start font-display text-[14px] font-semibold text-chalk"
                  >
                    {t(row.feature)}
                  </th>
                  <td className="bg-amber/[0.04] px-4 py-4 align-top text-[13.5px] leading-snug text-fog">
                    {t(row.us)}
                  </td>
                  <td className="px-4 py-4 align-top text-[13.5px] leading-snug text-fog/90">
                    {t(row.them)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-[820px] text-[12.5px] leading-relaxed text-fog/90">
          {t("sla.side.note", { date: t("sla.verifiedOn") })}
        </p>
      </LandingSection>

      <LandingSection label={t("sla.stay.label")} h2={t("sla.stay.h2")}>
        <div className="max-w-[820px]">
          <CheckList muted items={[t("sla.stay1"), t("sla.stay2"), t("sla.stay3")]} />
        </div>
      </LandingSection>

      <LandingSection label={t("sla.switch.label")} h2={t("sla.switch.h2")}>
        <div className="max-w-[820px]">
          <CheckList
            items={[t("sla.switch1"), t("sla.switch2"), t("sla.switch3"), t("sla.switch4")]}
          />
        </div>
      </LandingSection>

      <LandingSection label={t("sla.move.label")} h2={t("sla.move.h2")} intro={t("sla.move.intro")}>
        <LandingSteps steps={steps} />
      </LandingSection>

      <LandingSection label={t("sla.faq.label")} h2={t("sla.faq.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("sla.cta.h2")}
        body={t("sla.cta.body")}
        primary={{ label: t("sla.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("sla.cta.secondary"), to: "/verify" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("sla.related.lead")}{" "}
            <Link to="/alternatives/timemark" className={linkClass}>
              {t("sla.related.timemark")}
            </Link>
            {t("sla.related.mid")}{" "}
            <Link to="/can-photo-timestamps-be-faked" className={linkClass}>
              {t("sla.related.faked")}
            </Link>
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
