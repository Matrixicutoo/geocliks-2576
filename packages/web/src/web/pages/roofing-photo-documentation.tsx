import { Link } from "wouter";
import {
  CloudRain,
  FileStack,
  GitCompareArrows,
  Layers,
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
import { ComingFromCompanyCam } from "../components/coming-from-companycam";
import { pageFaq } from "../lib/page-schema";
import { useLocale, type TKey } from "../lib/i18n";

/**
 * Search landing page for "roofing photo documentation" and its neighbours
 * ("roof inspection photos", "storm damage documentation", "roofing app for
 * insurance claims").
 *
 * Split out from the construction page because the counterparty is an insurance
 * adjuster, not a client, and an adjuster wants a specific thing: a dated
 * before shot and a dated after shot of the same plane of the same roof. That
 * makes the before/after pairing the lead feature here where on the
 * construction page it is one card among three.
 *
 * The honest limits are stated on the page rather than buried: GeoCliks does
 * not measure a roof, does not produce an Xactimate estimate, and does not
 * decide a claim. Roofers comparing tools in this term are usually also looking
 * at measurement and estimating software, and letting them assume we do that is
 * a support ticket and a refund later.
 */

const STEPS: { title: TKey; body: TKey }[] = [
  { title: "rf.step1.title", body: "rf.step1.body" },
  { title: "rf.step2.title", body: "rf.step2.body" },
  { title: "rf.step3.title", body: "rf.step3.body" },
  { title: "rf.step4.title", body: "rf.step4.body" },
];

const CLAIM_CARDS: { icon: typeof Layers; title: TKey; body: TKey }[] = [
  { icon: GitCompareArrows, title: "rf.claim1.title", body: "rf.claim1.body" },
  { icon: CloudRain, title: "rf.claim2.title", body: "rf.claim2.body" },
  { icon: MapPin, title: "rf.claim3.title", body: "rf.claim3.body" },
];

const CREW_CARDS: { icon: typeof Layers; title: TKey; body: TKey }[] = [
  { icon: Layers, title: "rf.crew1.title", body: "rf.crew1.body" },
  { icon: Users, title: "rf.crew2.title", body: "rf.crew2.body" },
  { icon: FileStack, title: "rf.crew3.title", body: "rf.crew3.body" },
];

const LINK_CLASS =
  "font-semibold text-amber-ink underline decoration-amber/40 underline-offset-4 hover:decoration-amber";

export default function RoofingPhotoDocumentation() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/roofing-photo-documentation", locale);
  const steps = STEPS.map((step) => ({ title: t(step.title), body: t(step.body) }));
  const card = (item: { icon: typeof Layers; title: TKey; body: TKey }) => ({
    icon: item.icon,
    title: t(item.title),
    body: t(item.body),
  });

  return (
    <LandingPage
      path="/roofing-photo-documentation"
      eyebrow={t("rf.eyebrow")}
      h1={t("rf.h1")}
      sub={t("rf.sub")}
    >
      <LandingSection label={t("rf.s1.label")} h2={t("rf.s1.h2")} intro={t("rf.s1.intro")} />

      <LandingSection label={t("rf.s2.label")} h2={t("rf.s2.h2")}>
        <LandingSteps steps={steps} />
      </LandingSection>

      <LandingSection label={t("rf.s3.label")} h2={t("rf.s3.h2")}>
        <LandingCards items={CLAIM_CARDS.map(card)} />
      </LandingSection>

      <LandingSection label={t("rf.s4.label")} h2={t("rf.s4.h2")}>
        <LandingCards items={CREW_CARDS.map(card)} />
      </LandingSection>

      <ComingFromCompanyCam trade="rf" />

      <LandingSection label={t("rf.faqSection.label")} h2={t("rf.faqSection.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("rf.cta.h2")}
        body={t("rf.cta.body")}
        primary={{ label: t("rf.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("rf.cta.secondary"), to: "/pricing" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("rf.related.lead")}{" "}
            <Link to="/construction-photo-documentation" className={LINK_CLASS}>
              {t("rf.related.construction")}
            </Link>
            {t("rf.related.mid1")}{" "}
            <Link to="/gps-timestamp-camera" className={LINK_CLASS}>
              {t("rf.related.gps")}
            </Link>
            {t("rf.related.mid2")}{" "}
            <Link to="/alternatives/companycam" className={LINK_CLASS}>
              {t("rf.related.companycam")}
            </Link>
            {t("rf.related.end")}
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-fog">
            <ShieldCheck className="size-4 shrink-0 text-amber-ink" />
            {t("rf.disclaimer")}
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
