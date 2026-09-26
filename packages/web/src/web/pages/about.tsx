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
import { BRAND_PROFILES, COMPANY_ADDRESS, JURISDICTION, LEGAL_ENTITY } from "../lib/company";
import { pageFaq } from "../lib/page-schema";
import { SALES_EMAIL, SUPPORT_EMAIL } from "../lib/support";

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
 * English-only, like the other landing pages. See the note in `landing-page.tsx`.
 */
const PROOF_STEPS = [
  {
    title: "The time is checked, not copied",
    body: "Every capture asks our servers what time it is and records their answer, alongside the handset's own clock and the difference between the two. A device set forward three weeks does not produce a photo dated three weeks from now — it produces a photo that reports the skew.",
  },
  {
    title: "The place is written with its margin of error",
    body: "GPS coordinates are read at the shutter, stored with the accuracy radius the device reported, and reverse-geocoded to a street address. The radius matters: a location claimed to the metre when the fix was good to forty is a false precision, so the number travels with the photo.",
  },
  {
    title: "The image is sealed to its own bytes",
    body: "The file is hashed with SHA-256 and the hash is signed. Nothing about the photo is hidden by this — the seal is not encryption — but a single altered pixel changes the hash, so an edit made after the fact reports as an edit rather than passing as the original.",
  },
  {
    title: "Anyone can check it without asking you",
    body: "Each capture carries a short code. Typed into the public verification page, it returns the verified time, the address and whether the seal is intact — no account, no app, no request to whoever took the photo. That last part is what makes it evidence rather than a claim.",
  },
];

const LIMITS = [
  {
    icon: Scale,
    title: "We do not promise you an outcome",
    body: "GeoCliks is not a law firm, a notary or an expert witness, and whether a court, an insurer or a card network accepts a record is their decision, not ours. What we can say is what the record contains and that the other side can check it themselves. Anyone selling you a verdict is selling you something else.",
  },
  {
    icon: Star,
    title: "No review scores we did not collect",
    body: "There is no star rating in our search results and no testimonial wall on this site, because we have not collected ratings worth publishing yet. The structured data on these pages leaves the ratings field out entirely rather than filling it with a number nobody gave us.",
  },
  {
    icon: Ban,
    title: "Verification is never a paid upgrade",
    body: "The watermark data, the photo code and the seal are identical on the free plan and on the largest one. Paid plans buy volume, seats, video length, exports, sharing and delivery routing. Charging for the trustworthiness of the evidence itself would make the evidence worth less.",
  },
  {
    icon: ClipboardList,
    title: "We are not trying to be your whole back office",
    body: "No lease ledgers, no invoicing, no estimating, no roof measurement, no inspection checklist forms. GeoCliks is the photo documentation layer and it is built to sit beside whatever system you already run, because the teams who need this already have five subscriptions they resent.",
  },
  {
    icon: Wrench,
    title: "Software cannot fix a dishonest photograph",
    body: "We can prove when and where a picture was taken and that it has not been altered since. We cannot prove the driver left the parcel rather than photographing the door, or that the photo shows the room it is filed under. The stamp closes the arguments about metadata, not the ones about intent.",
  },
  {
    icon: Globe,
    title: "Not every page is translated, and we say which",
    body: "The app and the Help Center run in eleven languages, with a banner on any article whose body is still English. These search pages are English-only on purpose. A half-translated page that does not admit it is a worse experience than an honest English one.",
  },
];

const PUBLISHING = [
  {
    icon: ScanLine,
    title: "Mechanisms, not adjectives",
    body: '"Secure" and "tamper-proof" mean nothing unaccompanied, so our writing says what actually happens — which clock is trusted, what the hash covers, what the accuracy radius was. A claim you can check is the only kind worth making about evidence.',
  },
  {
    icon: Clock,
    title: "The published numbers, every time",
    body: "Plan prices, capture limits, seat counts and export formats on this site are the figures the product enforces, read from one table. When a price changes, the pages change with it rather than drifting into a year-old number nobody re-read.",
  },
  {
    icon: ShieldCheck,
    title: "No competitor gets ranked",
    body: "Our comparison writing is about pricing models and capability shapes — per-seat against per-workspace, verification included against verification gated — not about whose brand is better. A buyer's checklist that happens to rank vendors is a sales document wearing a lab coat.",
  },
];

const FACTS = [
  { icon: Building2, label: "Legal entity", value: LEGAL_ENTITY },
  { icon: MapPin, label: "Registered address", value: COMPANY_ADDRESS },
  { icon: Landmark, label: "Governing law", value: JURISDICTION },
  { icon: Globe, label: "Platforms", value: "iOS, Android and the web, from one account" },
];

const FAQ = pageFaq("/about");

export default function About() {
  return (
    <LandingPage
      path="/about"
      eyebrow="About"
      h1="The Company Behind the Seal on the Photo"
      sub="GeoCliks builds tamper-proof photo documentation for field teams — verified time, GPS location and street address on every capture, checkable by anyone holding the code."
    >
      <LandingSection
        label="What we build"
        h2="One job: make a field photo hold up after someone doubts it."
        intro="Field work is settled by photographs, and photographs are the weakest evidence on any job — a date from a clock the photographer controls, in a file any editor can rewrite, sitting in a camera roll with two thousand others. That gap is not a technology problem in the abstract; it is a specific, boring, expensive one, and it surfaces the day a client disputes a completion date or a shipper raises a chargeback three weeks late. GeoCliks exists to close it, and to do nothing else particularly well."
      />

      <LandingSection
        label="How the proof works"
        h2="Four things happen when the shutter fires."
        intro="Published in full rather than summarized, because a proof you cannot inspect is a brand promise. This is the same mechanism described in the Help Center and in our field notes, and the same one the verification page checks."
      >
        <LandingSteps steps={PROOF_STEPS} />
      </LandingSection>

      <LandingSection
        label="What we will not claim"
        h2="The limits, written down where they are inconvenient."
        intro="Most of what is wrong with software marketing is not invention, it is omission — the capability list without the sentence that says where it stops. Evidence software has less room for that than most, because a customer who over-trusts the record finds out at the worst possible moment. So here is the far edge of what this product does."
      >
        <LandingCards items={LIMITS} />
      </LandingSection>

      <LandingSection
        label="How we write about it"
        h2="Three rules the rest of this site is held to."
        intro="Our field notes publish their own method at length. These are the parts that govern every page, not only the blog."
      >
        <LandingCards items={PUBLISHING} />
      </LandingSection>

      <LandingSection
        label="Company"
        h2="Who you are actually dealing with."
        intro="Worth stating plainly, because searching our name does not settle it: a French company called GeoCliks, now dissolved, still surfaces above us and is unrelated to this one. This is the Canadian company that builds the app on this site."
      >
        <dl className="max-w-[820px] divide-y divide-line border-y border-line">
          {FACTS.map((fact) => (
            <div key={fact.label} className="grid gap-2 py-5 sm:grid-cols-[220px_1fr] sm:gap-6">
              <dt className="flex items-center gap-2.5 text-[13.5px] font-semibold text-fog">
                <fact.icon className="h-4 w-4 shrink-0 text-amber-deep" />
                {fact.label}
              </dt>
              <dd className="text-[16px] leading-relaxed text-chalk">{fact.value}</dd>
            </div>
          ))}
          <div className="grid gap-2 py-5 sm:grid-cols-[220px_1fr] sm:gap-6">
            <dt className="flex items-center gap-2.5 text-[13.5px] font-semibold text-fog">
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-deep" />
              Reaching a person
            </dt>
            <dd className="text-[16px] leading-relaxed text-chalk">
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              for anything about an account or a capture,{" "}
              <a
                href={`mailto:${SALES_EMAIL}`}
                className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
              >
                {SALES_EMAIL}
              </a>{" "}
              for volume, terms and enterprise questions.
            </dd>
          </div>
          <div className="grid gap-2 py-5 sm:grid-cols-[220px_1fr] sm:gap-6">
            <dt className="flex items-center gap-2.5 text-[13.5px] font-semibold text-fog">
              <Globe className="h-4 w-4 shrink-0 text-amber-deep" />
              Profiles that are ours
            </dt>
            <dd className="flex flex-wrap gap-x-5 gap-y-1 text-[16px] leading-relaxed text-chalk">
              {BRAND_PROFILES.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer me"
                  className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
                >
                  {new URL(url).hostname.replace(/^www\./, "")}
                </a>
              ))}
            </dd>
          </div>
        </dl>
      </LandingSection>

      <LandingSection label="Questions" h2="Frequently asked">
        <LandingFaq entries={FAQ} />
      </LandingSection>

      <LandingCta
        h2="Judge it on a photo, not on this page"
        body="Free forever for 300 verified captures a month, no card asked for. Take one capture, hand the code to someone who doubts you, and see what they get back."
        primary={{ label: "Get the app", to: "/get-app" }}
        secondary={{ label: "Verify a photo now", to: "/verify" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            Going deeper: the{" "}
            <Link
              to="/help/verify/how-sealing-works"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              sealing mechanism in detail
            </Link>
            , the{" "}
            <Link
              to="/blog/method"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              rules our field notes are written under
            </Link>
            , what the product{" "}
            <Link
              to="/pricing"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              actually costs
            </Link>
            , or the{" "}
            <Link
              to="/terms"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              terms
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              privacy policy
            </Link>{" "}
            in full.
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
