import { Link } from "wouter";
import {
  Ban,
  Building2,
  ClipboardList,
  Clock,
  Globe,
  Landmark,
  MapPin,
  Scale,
  ScanLine,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import {
  LandingCards,
  LandingCta,
  LandingFaq,
  LandingPage,
  LandingSection,
  LandingSteps,
} from "../components/landing-page";
import { BRAND_PROFILES, COMPANY_ADDRESS, LEGAL_ENTITY } from "../lib/company";
import { pageFaq } from "../lib/page-schema";
import { SALES_EMAIL, SUPPORT_EMAIL } from "../lib/support";
import { useLocale, type TKey } from "../lib/i18n";

/**
 * `/about` — who is behind the seal on the photo.
 *
 * Written as an identity page rather than a company story, for two reasons.
 *
 * The first is that there is no story to tell here honestly: nothing in this
 * repo records a founding date, a headcount or a founder, and an About page that
 * invents them is worse than one that omits them. What the repo does record is
 * an address, a jurisdiction, a legal entity name, a set of profiles and a
 * product whose mechanism is written down precisely — so that is what this page
 * is built from, and every claim on it can be traced to a constant or a shipped
 * feature.
 *
 * The second is that "geocliks" as a query is contested: a dissolved French SAS
 * of the same name outranks this one, and the disambiguation note in
 * `company.ts` exists because of it. An About page carrying the address, the
 * jurisdiction, the profiles and an AboutPage node pointing at the Organization
 * is the strongest on-site signal available that the site, the app and the
 * company are one entity — which is the job this page is really here to do.
 *
 * Translated into all eleven locales and routed at a locale-prefixed URL. The
 * two identity facts that must not move between languages — the legal entity
 * name and the registered address — stay as the constants from `company.ts`;
 * the governing law reads as prose, so it is a translated key whose English
 * value matches `JURISDICTION`.
 */
const PROOF_STEPS: { title: TKey; body: TKey }[] = [
  { title: "ab.step1.title", body: "ab.step1.body" },
  { title: "ab.step2.title", body: "ab.step2.body" },
  { title: "ab.step3.title", body: "ab.step3.body" },
  { title: "ab.step4.title", body: "ab.step4.body" },
];

const LIMITS: { icon: typeof Scale; title: TKey; body: TKey }[] = [
  { icon: Scale, title: "ab.limit1.title", body: "ab.limit1.body" },
  { icon: Star, title: "ab.limit2.title", body: "ab.limit2.body" },
  { icon: Ban, title: "ab.limit3.title", body: "ab.limit3.body" },
  { icon: ClipboardList, title: "ab.limit4.title", body: "ab.limit4.body" },
  { icon: Wrench, title: "ab.limit5.title", body: "ab.limit5.body" },
  { icon: Globe, title: "ab.limit6.title", body: "ab.limit6.body" },
];

const PUBLISHING: { icon: typeof Scale; title: TKey; body: TKey }[] = [
  { icon: ScanLine, title: "ab.pub1.title", body: "ab.pub1.body" },
  { icon: Clock, title: "ab.pub2.title", body: "ab.pub2.body" },
  { icon: ShieldCheck, title: "ab.pub3.title", body: "ab.pub3.body" },
];

/**
 * The company facts table.
 *
 * `value` is either a literal taken from `company.ts` — for the two facts that
 * are the same string in every language, because they identify the entity — or
 * a translation key for the two that are prose.
 */
const FACTS: { icon: typeof Scale; label: TKey; value: string; key?: TKey }[] = [
  { icon: Building2, label: "ab.fact1.label", value: LEGAL_ENTITY },
  { icon: MapPin, label: "ab.fact2.label", value: COMPANY_ADDRESS },
  { icon: Landmark, label: "ab.fact3.label", value: "", key: "ab.fact3.value" },
  { icon: Globe, label: "ab.fact4.label", value: "", key: "ab.fact4.value" },
];

const LINK_CLASS =
  "font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber";

export default function About() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/about", locale);
  const steps = PROOF_STEPS.map((step) => ({ title: t(step.title), body: t(step.body) }));
  const card = (item: { icon: typeof Scale; title: TKey; body: TKey }) => ({
    icon: item.icon,
    title: t(item.title),
    body: t(item.body),
  });

  return (
    <LandingPage path="/about" eyebrow={t("ab.eyebrow")} h1={t("ab.h1")} sub={t("ab.sub")}>
      <LandingSection label={t("ab.s1.label")} h2={t("ab.s1.h2")} intro={t("ab.s1.intro")} />

      <LandingSection label={t("ab.s2.label")} h2={t("ab.s2.h2")} intro={t("ab.s2.intro")}>
        <LandingSteps steps={steps} />
      </LandingSection>

      <LandingSection label={t("ab.s3.label")} h2={t("ab.s3.h2")} intro={t("ab.s3.intro")}>
        <LandingCards items={LIMITS.map(card)} />
      </LandingSection>

      <LandingSection label={t("ab.s4.label")} h2={t("ab.s4.h2")} intro={t("ab.s4.intro")}>
        <LandingCards items={PUBLISHING.map(card)} />
      </LandingSection>

      <LandingSection label={t("ab.s5.label")} h2={t("ab.s5.h2")} intro={t("ab.s5.intro")}>
        <dl className="max-w-[820px] divide-y divide-line border-y border-line">
          {FACTS.map((fact) => (
            <div key={fact.label} className="grid gap-2 py-5 sm:grid-cols-[220px_1fr] sm:gap-6">
              <dt className="flex items-center gap-2.5 text-[13.5px] font-semibold text-fog">
                <fact.icon className="h-4 w-4 shrink-0 text-amber-deep" />
                {t(fact.label)}
              </dt>
              <dd className="text-[16px] leading-relaxed text-chalk">
                {fact.key ? t(fact.key) : fact.value}
              </dd>
            </div>
          ))}
          <div className="grid gap-2 py-5 sm:grid-cols-[220px_1fr] sm:gap-6">
            <dt className="flex items-center gap-2.5 text-[13.5px] font-semibold text-fog">
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-deep" />
              {t("ab.contact.label")}
            </dt>
            <dd className="text-[16px] leading-relaxed text-chalk">
              <a href={`mailto:${SUPPORT_EMAIL}`} className={LINK_CLASS}>
                {SUPPORT_EMAIL}
              </a>{" "}
              {t("ab.contact.mid")}{" "}
              <a href={`mailto:${SALES_EMAIL}`} className={LINK_CLASS}>
                {SALES_EMAIL}
              </a>{" "}
              {t("ab.contact.end")}
            </dd>
          </div>
          <div className="grid gap-2 py-5 sm:grid-cols-[220px_1fr] sm:gap-6">
            <dt className="flex items-center gap-2.5 text-[13.5px] font-semibold text-fog">
              <Globe className="h-4 w-4 shrink-0 text-amber-deep" />
              {t("ab.profiles.label")}
            </dt>
            <dd className="flex flex-wrap gap-x-5 gap-y-1 text-[16px] leading-relaxed text-chalk">
              {BRAND_PROFILES.map((url) => (
                <a key={url} href={url} target="_blank" rel="noreferrer me" className={LINK_CLASS}>
                  {new URL(url).hostname.replace(/^www\./, "")}
                </a>
              ))}
            </dd>
          </div>
        </dl>
      </LandingSection>

      <LandingSection label={t("ab.faqSection.label")} h2={t("ab.faqSection.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("ab.cta.h2")}
        body={t("ab.cta.body")}
        primary={{ label: t("ab.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("ab.cta.secondary"), to: "/verify" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("ab.related.lead")}{" "}
            <Link to="/help/verify/how-sealing-works" className={LINK_CLASS}>
              {t("ab.related.sealing")}
            </Link>
            {t("ab.related.mid1")}{" "}
            <Link to="/blog/method" className={LINK_CLASS}>
              {t("ab.related.method")}
            </Link>
            {t("ab.related.mid2")}{" "}
            <Link to="/pricing" className={LINK_CLASS}>
              {t("ab.related.pricing")}
            </Link>
            {t("ab.related.mid3")}{" "}
            <Link to="/terms" className={LINK_CLASS}>
              {t("ab.related.terms")}
            </Link>{" "}
            {t("ab.related.mid4")}{" "}
            <Link to="/privacy" className={LINK_CLASS}>
              {t("ab.related.privacy")}
            </Link>{" "}
            {t("ab.related.end")}
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
