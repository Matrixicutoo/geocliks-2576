import { Link } from "wouter";
import {
  Clock,
  FileWarning,
  Hammer,
  Package,
  ShieldAlert,
  Smartphone,
  Stamp,
  Timer,
  Truck,
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
 * Search landing page for "can photo timestamps be faked" and its neighbours
 * ("fake photo timestamp", "change date on photo", "prove when a photo was
 * taken").
 *
 * The blog post `/blog/can-a-gps-timestamp-photo-be-faked` covers the same
 * ground method by method, and stays — this page is the translated, evergreen
 * answer and links to it for depth. It is kept distinct by leading with the
 * stakes (where a date gets disputed) and by spelling out the two-clock model
 * the product actually runs.
 *
 * Every mechanical claim here is what `api/lib/verify.ts` does, and should be
 * re-read against it when either changes:
 *  - skew up to `SKEW_TOLERANCE_MS` (five minutes) still counts as network time;
 *    past it the capture is `timeSource: "device"`, `integrity: "unverified"`;
 *  - offline, a measured clock offset is trusted for `CLOCK_SYNC_MAX_AGE_MS`
 *    (24 hours) and the wall clock is cross-checked against the boot-relative
 *    hardware counter;
 *  - the seal is a SHA-256 of the bytes plus an HMAC over the metadata, keyed
 *    server-side.
 * The limits paragraph in the FAQ is deliberate. Do not trade it for a claim of
 * admissibility.
 */

const HOW: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: Smartphone, title: "ctf.how1.title", body: "ctf.how1.body" },
  { icon: FileWarning, title: "ctf.how2.title", body: "ctf.how2.body" },
  { icon: Stamp, title: "ctf.how3.title", body: "ctf.how3.body" },
];

const CLOCK: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: Timer, title: "ctf.clock1.title", body: "ctf.clock1.body" },
  { icon: ShieldAlert, title: "ctf.clock2.title", body: "ctf.clock2.body" },
  { icon: WifiOff, title: "ctf.clock3.title", body: "ctf.clock3.body" },
];

const CHECK: { title: TKey; body: TKey }[] = [
  { title: "ctf.check1.title", body: "ctf.check1.body" },
  { title: "ctf.check2.title", body: "ctf.check2.body" },
  { title: "ctf.check3.title", body: "ctf.check3.body" },
  { title: "ctf.check4.title", body: "ctf.check4.body" },
];

const WHEN: { icon: typeof Clock; title: TKey; body: TKey }[] = [
  { icon: Hammer, title: "ctf.when1.title", body: "ctf.when1.body" },
  { icon: FileWarning, title: "ctf.when2.title", body: "ctf.when2.body" },
  { icon: Truck, title: "ctf.when3.title", body: "ctf.when3.body" },
  { icon: Package, title: "ctf.when4.title", body: "ctf.when4.body" },
];

/**
 * The stamp the home page shows, split into its parts. Not translated: it is
 * the literal text the stamp carries, the same in every language.
 */
const STAMP_PARTS = ["device 14:31:07", "network 14:31:09", "skew 2s", "verified"];

const linkClass =
  "font-semibold text-amber-ink underline decoration-amber/40 underline-offset-4 hover:decoration-amber";

export default function CanPhotoTimestampsBeFaked() {
  const { t, locale } = useLocale();
  const faq = pageFaq("/can-photo-timestamps-be-faked", locale);
  const cards = (list: typeof HOW) =>
    list.map((card) => ({ icon: card.icon, title: t(card.title), body: t(card.body) }));
  const steps = CHECK.map((step) => ({ title: t(step.title), body: t(step.body) }));

  return (
    <LandingPage
      path="/can-photo-timestamps-be-faked"
      eyebrow={t("ctf.eyebrow")}
      h1={t("ctf.h1")}
      sub={t("ctf.sub")}
    >
      <LandingSection
        label={t("ctf.short.label")}
        h2={t("ctf.short.h2")}
        intro={t("ctf.short.intro")}
      />

      <LandingSection label={t("ctf.how.label")} h2={t("ctf.how.h2")}>
        <LandingCards items={cards(HOW)} />
      </LandingSection>

      <LandingSection label={t("ctf.seal.label")} h2={t("ctf.seal.h2")} intro={t("ctf.seal.intro")} />

      <LandingSection
        label={t("ctf.clock.label")}
        h2={t("ctf.clock.h2")}
        intro={t("ctf.clock.intro")}
      >
        <figure className="mb-8 max-w-[820px] rounded-[12px] border border-line bg-ink-2 p-5 sm:p-6">
          <p
            dir="ltr"
            className="mono flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-chalk sm:text-[15px]"
          >
            {STAMP_PARTS.map((part, index) => (
              <span key={part} className="flex items-center gap-3">
                {index > 0 ? <span className="text-fog/50">·</span> : null}
                <span className={index === STAMP_PARTS.length - 1 ? "font-bold text-amber-ink" : ""}>
                  {part}
                </span>
              </span>
            ))}
          </p>
          <figcaption className="mt-3 text-[13px] leading-relaxed text-fog">
            {t("ctf.clock.example")}
          </figcaption>
        </figure>
        <LandingCards items={cards(CLOCK)} />
      </LandingSection>

      <LandingSection label={t("ctf.unv.label")} h2={t("ctf.unv.h2")} intro={t("ctf.unv.intro")} />

      <LandingSection label={t("ctf.check.label")} h2={t("ctf.check.h2")}>
        <LandingSteps steps={steps} />
      </LandingSection>

      <LandingSection label={t("ctf.when.label")} h2={t("ctf.when.h2")}>
        {/* Four cases, so a 2×2 grid rather than the three-up card row. */}
        <div className="grid gap-6 sm:grid-cols-2">
          {WHEN.map((item) => (
            <div key={item.title} className="rounded-[12px] border border-line bg-ink-2 p-5">
              <item.icon className="size-4.5 text-amber-ink" />
              <h3 className="mt-3 font-display text-[15px] font-semibold text-chalk">
                {t(item.title)}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-fog">{t(item.body)}</p>
            </div>
          ))}
        </div>
      </LandingSection>

      <LandingSection label={t("ctf.faq.label")} h2={t("ctf.faq.h2")}>
        <LandingFaq entries={faq} />
      </LandingSection>

      <LandingCta
        h2={t("ctf.cta.h2")}
        body={t("ctf.cta.body")}
        primary={{ label: t("ctf.cta.primary"), to: "/get-app" }}
        secondary={{ label: t("ctf.cta.secondary"), to: "/verify" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            {t("ctf.related.lead")}{" "}
            <Link to="/blog/can-a-gps-timestamp-photo-be-faked" className={linkClass}>
              {t("ctf.related.blog")}
            </Link>
            {t("ctf.related.mid")}{" "}
            <Link to="/gps-timestamp-camera" className={linkClass}>
              {t("ctf.related.gps")}
            </Link>
            {t("ctf.related.trades")}{" "}
            <Link to="/construction-photo-documentation" className={linkClass}>
              {t("ctf.related.construction")}
            </Link>{" "}
            {t("ctf.related.join")}{" "}
            <Link to="/proof-of-delivery" className={linkClass}>
              {t("ctf.related.delivery")}
            </Link>
            .
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-fog">
            {t("pcs.inbound.lead")}{" "}
            <Link to="/prove-crew-was-on-site" className={linkClass}>
              {t("pcs.eyebrow")}
            </Link>
            {" · "}
            <Link to="/construction-photo-log" className={linkClass}>
              {t("cpl.eyebrow")}
            </Link>
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
