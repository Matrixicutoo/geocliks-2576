import { Link } from "wouter";
import {
  BadgeCheck,
  Clock,
  FileStack,
  Gauge,
  MapPin,
  ShieldCheck,
  Truck,
  Users,
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
 * Search landing page for "HVAC photo documentation" and its neighbours
 * ("hvac service call proof", "technician arrival proof", "field service photo
 * app").
 *
 * The distinguishing fact about this trade is that the dispute is usually about
 * arrival and duration rather than about the work itself: a customer or a
 * warranty payer questions whether the tech came, when, and for how long. So
 * this page leads with arrival and departure captures where the construction
 * page leads with progress and the roofing page leads with before/after.
 *
 * The page does not claim anything about warranty or code compliance
 * acceptance. A verified photo is evidence; whether a manufacturer honours a
 * warranty claim on the strength of it is between the contractor and the
 * manufacturer, and saying otherwise here would be a promise we cannot keep.
 */

const STEPS: { title: TKey; body: TKey }[] = [
  { title: "hvac.step1.title", body: "hvac.step1.body" },
  { title: "hvac.step2.title", body: "hvac.step2.body" },
  { title: "hvac.step3.title", body: "hvac.step3.body" },
  { title: "hvac.step4.title", body: "hvac.step4.body" },
];

const CALL_CARDS: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: Clock, title: "hvac.call1.title", body: "hvac.call1.body" },
  { icon: Gauge, title: "hvac.call2.title", body: "hvac.call2.body" },
  { icon: BadgeCheck, title: "hvac.call3.title", body: "hvac.call3.body" },
];

const OPS_CARDS: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: Truck, title: "hvac.ops1.title", body: "hvac.ops1.body" },
  { icon: MapPin, title: "hvac.ops2.title", body: "hvac.ops2.body" },
  { icon: FileStack, title: "hvac.ops3.title", body: "hvac.ops3.body" },
];

const TEAM_CARDS: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: Users, title: "hvac.team1.title", body: "hvac.team1.body" },
  { icon: ShieldCheck, title: "hvac.team2.title", body: "hvac.team2.body" },
  { icon: BadgeCheck, title: "hvac.team3.title", body: "hvac.team3.body" },
];

export default function HvacPhotoDocumentation() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/hvac-photo-documentation", locale);
  const steps = STEPS.map((step) => ({ title: t(step.title), body: t(step.body) }));
  const card = (item: { icon: typeof Clock; title: TKey; body: TKey }) => ({
    icon: item.icon,
    title: t(item.title),
    body: t(item.body),
  });

  return (
    <LandingPage
      path="/hvac-photo-documentation"
      eyebrow={t("hvac.eyebrow")}
      h1={t("hvac.h1")}
      sub={t("hvac.sub")}
    >
      <LandingSection
        label={t("hvac.why.label")}
        h2={t("hvac.why.h2")}
        intro={t("hvac.why.intro")}
      />

      <LandingSection label={t("hvac.how.label")} h2={t("hvac.how.h2")}>
        <LandingSteps steps={steps} />
      </LandingSection>

      <LandingSection label={t("hvac.call.label")} h2={t("hvac.call.h2")}>
        <LandingCards items={CALL_CARDS.map(card)} />
      </LandingSection>

      <LandingSection label={t("hvac.ops.label")} h2={t("hvac.ops.h2")}>
        <LandingCards items={OPS_CARDS.map(card)} />
      </LandingSection>

      <LandingSection label={t("hvac.team.label")} h2={t("hvac.team.h2")}>
        <LandingCards items={TEAM_CARDS.map(card)} />
      </LandingSection>

      <LandingSection label={t("hvac.faq.label")} h2={t("hvac.faq.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("hvac.cta.h2")}
        body={t("hvac.cta.body")}
        primary={{ label: t("hvac.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("hvac.cta.secondary"), to: "/pricing" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("hvac.related.lead")}{" "}
            <Link
              to="/gps-timestamp-camera"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("hvac.related.gps")}
            </Link>
            ,{" "}
            <Link
              to="/property-inspection-photos"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("hvac.related.inspection")}
            </Link>
            {t("hvac.related.or")}{" "}
            <Link
              to="/pricing"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("hvac.related.pricing")}
            </Link>
            .
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-fog">
            <ShieldCheck className="size-4 shrink-0 text-amber" />
            {t("hvac.disclaimer")}
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
