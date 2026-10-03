import { Link } from "wouter";
import {
  DoorOpen,
  FileQuestion,
  Hammer,
  LogOut,
  MapPinOff,
  Smartphone,
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
 * Search landing page for "prove a crew was on site" and its neighbours
 * ("prove contractor was on site", "proof of presence construction", "job site
 * photo proof").
 *
 * Leads with the dispute ("nobody showed up") rather than with features: the
 * person typing this already has a complaint, a trip charge or a back-charge in
 * front of them. The arrival / work / departure set maps onto the real capture
 * tags (`arrival`, `before`, `after`, `issue`, `departure` in
 * `api/agent/filters.ts`), so the advice is something the app actually files.
 *
 * Mechanical claims follow `api/lib/verify.ts` (five-minute skew tolerance,
 * 24-hour offline offset, hardware-counter cross-check) and `api/lib/exports.ts`
 * (PDF cover/letterhead, capture map, per-photo TIME/GPS/ADDRESS/TAG block; the
 * Excel columns). Share links are a Plus-and-above feature (`plans.ts`), which
 * the FAQ says plainly. The limits answer (q4) is deliberate: never trade it for
 * a claim that verification proves the work or guarantees admissibility.
 */

const FAILS: { icon: typeof Smartphone; title: TKey; body: TKey }[] = [
  { icon: Smartphone, title: "pcs.fail1.title", body: "pcs.fail1.body" },
  { icon: MapPinOff, title: "pcs.fail2.title", body: "pcs.fail2.body" },
  { icon: FileQuestion, title: "pcs.fail3.title", body: "pcs.fail3.body" },
];

const FIELDS: { title: TKey; body: TKey }[] = [
  { title: "pcs.field1.title", body: "pcs.field1.body" },
  { title: "pcs.field2.title", body: "pcs.field2.body" },
  { title: "pcs.field3.title", body: "pcs.field3.body" },
  { title: "pcs.field4.title", body: "pcs.field4.body" },
];

const SET: { icon: typeof Smartphone; title: TKey; body: TKey }[] = [
  { icon: DoorOpen, title: "pcs.set1.title", body: "pcs.set1.body" },
  { icon: Hammer, title: "pcs.set2.title", body: "pcs.set2.body" },
  { icon: LogOut, title: "pcs.set3.title", body: "pcs.set3.body" },
];

const linkClass =
  "font-semibold text-amber-ink underline decoration-amber/40 underline-offset-4 hover:decoration-amber";

export default function ProveCrewWasOnSite() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/prove-crew-was-on-site", locale);
  const cards = (list: typeof FAILS) =>
    list.map((card) => ({ icon: card.icon, title: t(card.title), body: t(card.body) }));
  const steps = FIELDS.map((step) => ({ title: t(step.title), body: t(step.body) }));

  return (
    <LandingPage
      path="/prove-crew-was-on-site"
      eyebrow={t("pcs.eyebrow")}
      h1={t("pcs.h1")}
      sub={t("pcs.sub")}
    >
      <LandingSection label={t("pcs.s1.label")} h2={t("pcs.s1.h2")} intro={t("pcs.s1.intro")} />

      <LandingSection label={t("pcs.s2.label")} h2={t("pcs.s2.h2")}>
        <LandingCards items={cards(FAILS)} />
      </LandingSection>

      <LandingSection label={t("pcs.s3.label")} h2={t("pcs.s3.h2")} intro={t("pcs.s3.intro")}>
        <LandingSteps steps={steps} />
      </LandingSection>

      <LandingSection label={t("pcs.s4.label")} h2={t("pcs.s4.h2")} intro={t("pcs.s4.intro")}>
        <LandingCards items={cards(SET)} />
      </LandingSection>

      <LandingSection label={t("pcs.s5.label")} h2={t("pcs.s5.h2")} intro={t("pcs.s5.intro")} />

      <LandingSection label={t("pcs.s6.label")} h2={t("pcs.s6.h2")} intro={t("pcs.s6.intro")} />

      <LandingSection label={t("pcs.faq.label")} h2={t("pcs.faq.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("pcs.cta.h2")}
        body={t("pcs.cta.body")}
        primary={{ label: t("pcs.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("pcs.cta.secondary"), to: "/verify" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("pcs.related.lead")}{" "}
            <Link to="/construction-photo-documentation" className={linkClass}>
              {t("pcs.related.construction")}
            </Link>{" "}
            {t("pcs.related.join")}{" "}
            <Link to="/hvac-photo-documentation" className={linkClass}>
              {t("pcs.related.hvac")}
            </Link>
            {t("pcs.related.mid")}{" "}
            <Link to="/can-photo-timestamps-be-faked" className={linkClass}>
              {t("pcs.related.faked")}
            </Link>{" "}
            {t("pcs.related.log")}{" "}
            <Link to="/construction-photo-log" className={linkClass}>
              {t("pcs.related.photoLog")}
            </Link>
            .
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
