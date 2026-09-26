import { Link } from "wouter";
import {
  CalendarDays,
  ClipboardCheck,
  FileStack,
  GitCompareArrows,
  Layers,
  ListChecks,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Truck,
  TriangleAlert,
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
 * Search landing page for "construction photo documentation software" and its
 * neighbours ("construction photo management software", "jobsite photo app").
 *
 * Deliberately construction-specific rather than a page trying to serve
 * construction, field service and delivery at once: the query is commercial —
 * someone typing "software" is comparing vendors, not learning a concept — and
 * the three segments want different proof. The other two get their own pages if
 * and when they are worth writing.
 *
 * The copy leads with the dispute, not with "organize your jobsite photos".
 * People reach this term after a client has challenged a completion date or a
 * sub has blamed another sub, and every competitor already opens with the
 * organizing pitch.
 */

const STEPS: { title: TKey; body: TKey }[] = [
  { title: "con.step1.title", body: "con.step1.body" },
  { title: "con.step2.title", body: "con.step2.body" },
  { title: "con.step3.title", body: "con.step3.body" },
  { title: "con.step4.title", body: "con.step4.body" },
];

/**
 * The six moments a construction job is actually documented for.
 *
 * Named rather than left implicit, for two reasons. A visitor arrives from
 * "construction photo documentation software" with one of these in mind and
 * needs to see their own situation on the page before they read a feature list.
 * And the phrases themselves — concealed work, pre-existing conditions, change
 * orders, punch list — are what the next round of long-tail queries is written
 * in, and none of them appeared anywhere on this site.
 */
const USE_CASES: { icon: typeof Layers; title: TKey; body: TKey }[] = [
  { icon: Layers, title: "con.use1.title", body: "con.use1.body" },
  { icon: TriangleAlert, title: "con.use2.title", body: "con.use2.body" },
  { icon: CalendarDays, title: "con.use3.title", body: "con.use3.body" },
  { icon: ClipboardCheck, title: "con.use4.title", body: "con.use4.body" },
  { icon: Truck, title: "con.use5.title", body: "con.use5.body" },
  { icon: ListChecks, title: "con.use6.title", body: "con.use6.body" },
];

const DISPUTE_CARDS: { icon: typeof Layers; title: TKey; body: TKey }[] = [
  { icon: GitCompareArrows, title: "con.dispute1.title", body: "con.dispute1.body" },
  { icon: FileStack, title: "con.dispute2.title", body: "con.dispute2.body" },
  { icon: ShieldCheck, title: "con.dispute3.title", body: "con.dispute3.body" },
];

const TEAM_CARDS: { icon: typeof Layers; title: TKey; body: TKey }[] = [
  { icon: MapPin, title: "con.team1.title", body: "con.team1.body" },
  { icon: Users, title: "con.team2.title", body: "con.team2.body" },
  { icon: MessageSquare, title: "con.team3.title", body: "con.team3.body" },
];

const LINK_CLASS =
  "font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber";

export default function ConstructionPhotoDocumentation() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/construction-photo-documentation", locale);
  const steps = STEPS.map((step) => ({ title: t(step.title), body: t(step.body) }));
  const card = (item: { icon: typeof Layers; title: TKey; body: TKey }) => ({
    icon: item.icon,
    title: t(item.title),
    body: t(item.body),
  });

  return (
    <LandingPage
      path="/construction-photo-documentation"
      eyebrow={t("con.eyebrow")}
      h1={t("con.h1")}
      sub={t("con.sub")}
    >
      <LandingSection label={t("con.s1.label")} h2={t("con.s1.h2")} intro={t("con.s1.intro")} />

      <LandingSection label={t("con.s2.label")} h2={t("con.s2.h2")}>
        <LandingSteps steps={steps} />
      </LandingSection>

      <LandingSection label={t("con.s3.label")} h2={t("con.s3.h2")} intro={t("con.s3.intro")}>
        <LandingCards items={USE_CASES.map(card)} />
      </LandingSection>

      <LandingSection label={t("con.s4.label")} h2={t("con.s4.h2")}>
        <LandingCards items={DISPUTE_CARDS.map(card)} />
      </LandingSection>

      <LandingSection label={t("con.s5.label")} h2={t("con.s5.h2")}>
        <LandingCards items={TEAM_CARDS.map(card)} />
      </LandingSection>

      <LandingSection label={t("con.faqSection.label")} h2={t("con.faqSection.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("con.cta.h2")}
        body={t("con.cta.body")}
        primary={{ label: t("con.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("con.cta.secondary"), to: "/help/verify/how-sealing-works" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("con.related.lead")}{" "}
            <Link to="/alternatives/companycam" className={LINK_CLASS}>
              {t("con.related.companycam")}
            </Link>
            {t("con.related.mid")}{" "}
            <Link to="/help/getting-started" className={LINK_CLASS}>
              {t("con.related.gettingStarted")}
            </Link>
            .
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-fog">
            {t("con.related2.lead")}{" "}
            <Link to="/roofing-photo-documentation" className={LINK_CLASS}>
              {t("con.related2.roofing")}
            </Link>
            ,{" "}
            <Link to="/hvac-photo-documentation" className={LINK_CLASS}>
              {t("con.related2.hvac")}
            </Link>
            ,{" "}
            <Link to="/property-inspection-photos" className={LINK_CLASS}>
              {t("con.related2.inspection")}
            </Link>
            ,{" "}
            <Link to="/proof-of-delivery" className={LINK_CLASS}>
              {t("con.related2.pod")}
            </Link>
            {t("con.related2.or")}{" "}
            <Link to="/gps-timestamp-camera" className={LINK_CLASS}>
              {t("con.related2.gps")}
            </Link>
            .
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
