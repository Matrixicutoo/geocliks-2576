import { Link } from "wouter";
import {
  Building2,
  Clock,
  FileStack,
  MapPin,
  Route,
  ScanLine,
  ShieldCheck,
  Signature,
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
 * Search landing page for "proof of delivery app" and its neighbours
 * ("electronic proof of delivery", "POD app", "delivery photo proof").
 *
 * Separate from the construction page because the dispute is a different one.
 * Construction argues about whether work was done and when; delivery argues
 * about whether a parcel reached a door, and the counterparty is usually a
 * shipper running a chargeback rather than a client withholding a payment. The
 * proof a courier needs is the same machinery pointed at a narrower question,
 * so the copy leads with the chargeback rather than with route efficiency —
 * every competitor in this term already opens with route efficiency.
 *
 * Signature capture is named as absent rather than skipped. It is the first
 * thing someone comparing POD tools looks for, and letting them discover the
 * gap after signing up is worse for us than saying it here.
 */

const STEPS: { title: TKey; body: TKey }[] = [
  { title: "pod.step1.title", body: "pod.step1.body" },
  { title: "pod.step2.title", body: "pod.step2.body" },
  { title: "pod.step3.title", body: "pod.step3.body" },
  { title: "pod.step4.title", body: "pod.step4.body" },
];

const DISPUTE_CARDS: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: Clock, title: "pod.dispute1.title", body: "pod.dispute1.body" },
  { icon: MapPin, title: "pod.dispute2.title", body: "pod.dispute2.body" },
  { icon: ScanLine, title: "pod.dispute3.title", body: "pod.dispute3.body" },
];

const OPS_CARDS: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: Route, title: "pod.ops1.title", body: "pod.ops1.body" },
  { icon: FileStack, title: "pod.ops2.title", body: "pod.ops2.body" },
  { icon: Building2, title: "pod.ops3.title", body: "pod.ops3.body" },
];

export default function ProofOfDelivery() {
  const { t, locale } = useLocale();
  // The FAQ a visitor reads and the FAQPage markup a crawler reads resolve from
  // the same keys in the same locale — never two separately translated copies.
  const faq = pageFaq("/proof-of-delivery", locale);
  const steps = STEPS.map((step) => ({ title: t(step.title), body: t(step.body) }));
  const disputeCards = DISPUTE_CARDS.map((card) => ({
    icon: card.icon,
    title: t(card.title),
    body: t(card.body),
  }));
  const opsCards = OPS_CARDS.map((card) => ({
    icon: card.icon,
    title: t(card.title),
    body: t(card.body),
  }));

  return (
    <LandingPage
      path="/proof-of-delivery"
      eyebrow={t("pod.eyebrow")}
      h1={t("pod.h1")}
      sub={t("pod.sub")}
    >
      <LandingSection label={t("pod.why.label")} h2={t("pod.why.h2")} intro={t("pod.why.intro")} />

      <LandingSection label={t("pod.how.label")} h2={t("pod.how.h2")}>
        <LandingSteps steps={steps} />
      </LandingSection>

      <LandingSection label={t("pod.dispute.label")} h2={t("pod.dispute.h2")}>
        <LandingCards items={disputeCards} />
      </LandingSection>

      <LandingSection label={t("pod.ops.label")} h2={t("pod.ops.h2")}>
        <LandingCards items={opsCards} />
      </LandingSection>

      <LandingSection label={t("pod.faq.label")} h2={t("pod.faq.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("pod.cta.h2")}
        body={t("pod.cta.body")}
        primary={{ label: t("pod.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("pod.cta.secondary"), to: "/pricing" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("pod.related.lead")}{" "}
            <Link
              to="/blog/what-should-photo-proof-of-delivery-include"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("pod.related.link1")}
            </Link>
            {t("pod.related.join")}{" "}
            <Link
              to="/gps-timestamp-camera"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              {t("pod.related.link2")}
            </Link>
            .
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-fog">
            <Signature className="size-4 shrink-0 text-amber" />
            {t("pod.note.signature")}
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-fog">
            <ShieldCheck className="size-4 shrink-0 text-amber" />
            {t("pod.note.legal")}
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
