import { Link } from "wouter";
import { Clock, Compass, Hash, ImageDown, ShieldCheck, WifiOff } from "lucide-react";
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
 * Search landing page for "gps timestamp camera" and its neighbours
 * ("timestamp camera app", "gps camera app", "photo with date and location").
 *
 * The one page here whose query is tool-led rather than problem-led. Someone
 * typing this has already decided they want a stamping camera and is choosing
 * between apps, so the page has to answer "how is this different from the free
 * stamp apps" in the first band instead of explaining why proof matters. The
 * answer is the same one the whole product rests on — the time is verified
 * against the network rather than read from the handset — so this page is where
 * that distinction is spelled out at length and the other pages link back to it.
 *
 * Kept distinct from the home page by staying on the camera itself: what gets
 * stamped, what the stamp is worth, and what the free apps do instead. The
 * crew, project and reporting machinery belongs to the other pages.
 */

const STEPS: { title: TKey; body: TKey }[] = [
  { title: "gps.step1.title", body: "gps.step1.body" },
  { title: "gps.step2.title", body: "gps.step2.body" },
  { title: "gps.step3.title", body: "gps.step3.body" },
  { title: "gps.step4.title", body: "gps.step4.body" },
];

const STAMP_CARDS: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: Clock, title: "gps.stamp1.title", body: "gps.stamp1.body" },
  { icon: Compass, title: "gps.stamp2.title", body: "gps.stamp2.body" },
  { icon: Hash, title: "gps.stamp3.title", body: "gps.stamp3.body" },
];

const PRACTICAL_CARDS: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: WifiOff, title: "gps.practical1.title", body: "gps.practical1.body" },
  { icon: ImageDown, title: "gps.practical2.title", body: "gps.practical2.body" },
  { icon: ShieldCheck, title: "gps.practical3.title", body: "gps.practical3.body" },
];

export default function GpsTimestampCamera() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/gps-timestamp-camera", locale);
  const steps = STEPS.map((step) => ({ title: t(step.title), body: t(step.body) }));
  const stampCards = STAMP_CARDS.map((card) => ({
    icon: card.icon,
    title: t(card.title),
    body: t(card.body),
  }));
  const practicalCards = PRACTICAL_CARDS.map((card) => ({
    icon: card.icon,
    title: t(card.title),
    body: t(card.body),
  }));

  return (
    <LandingPage
      path="/gps-timestamp-camera"
      eyebrow={t("gps.eyebrow")}
      h1={t("gps.h1")}
      sub={t("gps.sub")}
    >
      <LandingSection
        label={t("gps.distinction.label")}
        h2={t("gps.distinction.h2")}
        intro={t("gps.distinction.intro")}
      />

      <LandingSection label={t("gps.how.label")} h2={t("gps.how.h2")}>
        <LandingSteps steps={steps} />
      </LandingSection>

      <LandingSection label={t("gps.stamp.label")} h2={t("gps.stamp.h2")}>
        <LandingCards items={stampCards} />
      </LandingSection>

      <LandingSection label={t("gps.practical.label")} h2={t("gps.practical.h2")}>
        <LandingCards items={practicalCards} />
      </LandingSection>

      <LandingSection label={t("gps.faq.label")} h2={t("gps.faq.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("gps.cta.h2")}
        body={t("gps.cta.body")}
        primary={{ label: t("gps.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("gps.cta.secondary"), to: "/help/verify/how-sealing-works" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("gps.related.lead")}{" "}
            <Link
              to="/blog/can-a-gps-timestamp-photo-be-faked"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("gps.related.link1")}
            </Link>{" "}
            {t("gps.related.trades")}{" "}
            <Link
              to="/construction-photo-documentation"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("gps.related.construction")}
            </Link>
            ,{" "}
            <Link
              to="/roofing-photo-documentation"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("gps.related.roofing")}
            </Link>{" "}
            {t("gps.related.join")}{" "}
            <Link
              to="/proof-of-delivery"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("gps.related.delivery")}
            </Link>
            .
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
