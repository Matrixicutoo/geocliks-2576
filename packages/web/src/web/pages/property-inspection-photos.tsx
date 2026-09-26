import { Link } from "wouter";
import {
  BadgeCheck,
  CalendarClock,
  FileStack,
  Home,
  Images,
  MapPin,
  ShieldCheck,
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
 * Search landing page for "property inspection photos" and its neighbours
 * ("move-in move-out inspection app", "rental condition report photos",
 * "security deposit dispute photos").
 *
 * The distinguishing fact here is that the dispute is almost always about *when*
 * a condition existed, not about what the photo shows. A landlord and a tenant
 * usually agree the carpet is stained; they disagree about whether it was
 * stained at move-in. That makes a verified capture date the whole ballgame, so
 * this page leads with the move-in/move-out pair rather than with progress
 * (construction) or arrival (HVAC).
 *
 * It deliberately makes no claim about deposit law, which varies by state and
 * province, and it does not pretend to be a lease or inspection-checklist
 * product. Both limits are stated on the page rather than left for the visitor
 * to discover after signing up.
 */

const STEPS: { title: TKey; body: TKey }[] = [
  { title: "inspection.step1.title", body: "inspection.step1.body" },
  { title: "inspection.step2.title", body: "inspection.step2.body" },
  { title: "inspection.step3.title", body: "inspection.step3.body" },
  { title: "inspection.step4.title", body: "inspection.step4.body" },
];

const DEPOSIT_CARDS: { icon: typeof Home; title: TKey; body: TKey }[] = [
  { icon: CalendarClock, title: "inspection.deposit1.title", body: "inspection.deposit1.body" },
  { icon: Images, title: "inspection.deposit2.title", body: "inspection.deposit2.body" },
  { icon: ShieldCheck, title: "inspection.deposit3.title", body: "inspection.deposit3.body" },
];

const PORTFOLIO_CARDS: { icon: typeof Home; title: TKey; body: TKey }[] = [
  { icon: Home, title: "inspection.portfolio1.title", body: "inspection.portfolio1.body" },
  { icon: MapPin, title: "inspection.portfolio2.title", body: "inspection.portfolio2.body" },
  { icon: FileStack, title: "inspection.portfolio3.title", body: "inspection.portfolio3.body" },
];

const TEAM_CARDS: { icon: typeof Home; title: TKey; body: TKey }[] = [
  { icon: Users, title: "inspection.team1.title", body: "inspection.team1.body" },
  { icon: BadgeCheck, title: "inspection.team2.title", body: "inspection.team2.body" },
  { icon: ShieldCheck, title: "inspection.team3.title", body: "inspection.team3.body" },
];

export default function PropertyInspectionPhotos() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/property-inspection-photos", locale);
  const steps = STEPS.map((step) => ({ title: t(step.title), body: t(step.body) }));
  const card = (item: { icon: typeof Home; title: TKey; body: TKey }) => ({
    icon: item.icon,
    title: t(item.title),
    body: t(item.body),
  });

  return (
    <LandingPage
      path="/property-inspection-photos"
      eyebrow={t("inspection.eyebrow")}
      h1={t("inspection.h1")}
      sub={t("inspection.sub")}
    >
      <LandingSection
        label={t("inspection.why.label")}
        h2={t("inspection.why.h2")}
        intro={t("inspection.why.intro")}
      />

      <LandingSection label={t("inspection.how.label")} h2={t("inspection.how.h2")}>
        <LandingSteps steps={steps} />
      </LandingSection>

      <LandingSection label={t("inspection.deposit.label")} h2={t("inspection.deposit.h2")}>
        <LandingCards items={DEPOSIT_CARDS.map(card)} />
      </LandingSection>

      <LandingSection label={t("inspection.portfolio.label")} h2={t("inspection.portfolio.h2")}>
        <LandingCards items={PORTFOLIO_CARDS.map(card)} />
      </LandingSection>

      <LandingSection label={t("inspection.team.label")} h2={t("inspection.team.h2")}>
        <LandingCards items={TEAM_CARDS.map(card)} />
      </LandingSection>

      <LandingSection label={t("inspection.faq.label")} h2={t("inspection.faq.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("inspection.cta.h2")}
        body={t("inspection.cta.body")}
        primary={{ label: t("inspection.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("inspection.cta.secondary"), to: "/pricing" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("inspection.related.lead")}{" "}
            <Link
              to="/gps-timestamp-camera"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("inspection.related.gps")}
            </Link>
            ,{" "}
            <Link
              to="/hvac-photo-documentation"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("inspection.related.hvac")}
            </Link>
            {t("inspection.related.or")}{" "}
            <Link
              to="/pricing"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("inspection.related.pricing")}
            </Link>
            .
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-fog">
            <ShieldCheck className="size-4 shrink-0 text-amber" />
            {t("inspection.disclaimer")}
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
