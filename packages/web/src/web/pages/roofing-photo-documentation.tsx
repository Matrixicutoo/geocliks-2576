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
import { breadcrumbSchema, faqSchema } from "../lib/structured-data";

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

const STEPS = [
  {
    title: "Shoot the roof before you touch it",
    body: "Every slope, every penetration, every soft spot — in the GeoCliks app. Offline is fine; captures queue on the phone.",
  },
  {
    title: "GeoCliks dates and places it",
    body: "Network-verified time, GPS coordinates and the resolved street address are written into each photo, with a hash and a unique photo code.",
  },
  {
    title: "Shoot the same planes after",
    body: "Pair the post-work capture with its before shot into one comparison, so both halves carry their own independently verified date.",
  },
  {
    title: "Hand the adjuster the bundle",
    body: "Export the job as a PDF with every photo's time, address and code beside it. The adjuster can check any of them without an account.",
  },
];

const CLAIM_CARDS = [
  {
    icon: GitCompareArrows,
    title: "Before and after, provably in that order",
    body: "The pairing is only worth something if the dates are. Both captures carry a time verified against our servers, so the sequence is not a matter of which photo you say came first.",
  },
  {
    icon: CloudRain,
    title: "Storm dates that line up",
    body: "A hail claim turns on whether the damage photo predates the repair and postdates the storm. A verified capture time puts the photo on a specific day without relying on the phone that took it.",
  },
  {
    icon: MapPin,
    title: "The right house, on the record",
    body: "Coordinates and the resolved street address are stamped on every shot, which settles the question nobody enjoys being asked: whether those photos are of this property.",
  },
];

const CREW_CARDS = [
  {
    icon: Layers,
    title: "One job, every crew's photos",
    body: "Tear-off, dry-in and finish captures land in the same project, filed by day, whoever shot them.",
  },
  {
    icon: Users,
    title: "Subs capture their own scope",
    body: "Invite a sub crew by link or printed QR. They document their work without being given the rest of the job or the customer list.",
  },
  {
    icon: FileStack,
    title: "Closeout the homeowner keeps",
    body: "The same verified set exports as a PDF for the file, a ZIP for the adjuster, or a KMZ if the work spans multiple addresses.",
  },
];

const FAQ = [
  {
    question: "What photos does an insurance adjuster usually want on a roof claim?",
    answer:
      "Practice varies by carrier, but the recurring pattern is overview shots that identify the property, close-ups of the damage with something for scale, the same planes photographed after the work, and dates that put those two sets in order. The part roofers lose on is rarely the photography — it is that the dates come from a phone and the carrier has no way to check them.",
  },
  {
    question: "Does GeoCliks measure the roof or produce an estimate?",
    answer:
      "No. It does not measure squares, generate a diagram, or produce an Xactimate or similar estimate, and it will not replace the measurement tool you already use. It documents and verifies what was there and what you did, which is the part those tools do not do.",
  },
  {
    question: "Can I prove the damage predates my repair?",
    answer:
      "You can show a photo whose capture time was verified against our servers rather than read from your phone, sealed with a content hash so a later edit is detectable, with a code the carrier can look up independently. That is a substantially stronger record than a camera-roll photo. Whether a specific carrier accepts it is still their decision — GeoCliks is not an insurance or legal service and cannot promise a claim outcome.",
  },
  {
    question: "Does it work up on a roof with no signal?",
    answer:
      "Yes. Captures queue on the phone and upload when you are back in range, and the recorded time is the moment of capture, not of upload. GPS is read on the roof, so the stamp is the property you were standing on.",
  },
  {
    question: "Can the homeowner see the photos?",
    answer:
      "You choose. Share a link to a set, or hand over a photo code so they can verify a single image on the public page. Neither requires them to install anything or create an account.",
  },
  {
    question: "How is this different from the construction documentation page?",
    answer:
      "Same product, different argument. A general contractor is usually documenting against a client dispute over progress and scope; a roofer is usually documenting against an adjuster who needs a dated before and a dated after of the same plane. The before/after pairing and the export format matter more here, which is why this page exists separately.",
  },
];

export default function RoofingPhotoDocumentation() {
  return (
    <LandingPage
      path="/roofing-photo-documentation"
      eyebrow="Roofing photo documentation"
      h1="Roofing Photo Documentation That Holds Up on a Claim"
      sub="Dated before and after shots of the same roof, with network-verified time, GPS and street address on every capture — and a code the adjuster can check."
      jsonLd={[faqSchema(FAQ), breadcrumbSchema([{ name: "Roofing Photo Documentation" }])]}
    >
      <LandingSection
        label="Why roofers look for this"
        h2="The photos were fine. The dates on them were the problem."
        intro="A hail claim comes back questioned. An adjuster asks how you know the damage predates the tear-off. A homeowner three months later says the leak was there before you started. Every one of those turns into an argument about a date, and a camera-roll photo answers it with a timestamp from the phone in your pocket — which the other side is under no obligation to believe. This page is about the version where the date is not yours to set."
      />

      <LandingSection label="How it works" h2="Four steps, built around the before and the after.">
        <LandingSteps steps={STEPS} />
      </LandingSection>

      <LandingSection
        label="Built for the claim"
        h2="Three things a roof record has to survive."
      >
        <LandingCards items={CLAIM_CARDS} />
      </LandingSection>

      <LandingSection label="For crews and subs" h2="One job file, however many crews touch it.">
        <LandingCards items={CREW_CARDS} />
      </LandingSection>

      <LandingSection label="Questions" h2="Frequently asked">
        <LandingFaq entries={FAQ} />
      </LandingSection>

      <LandingCta
        h2="Document the next roof properly"
        body="Free forever for 300 verified photos a month, no card. Paid plans add unlimited captures, before/after pairing at scale and the full set of exports."
        primary={{ label: "Get the app", to: "/get-app" }}
        secondary={{ label: "See plans and pricing", to: "/pricing" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            Related:{" "}
            <Link
              to="/construction-photo-documentation"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              construction photo documentation
            </Link>
            ,{" "}
            <Link
              to="/gps-timestamp-camera"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              how the GPS timestamp camera works
            </Link>
            , or{" "}
            <Link
              to="/alternatives/companycam"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              GeoCliks vs CompanyCam
            </Link>
            .
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-fog">
            <ShieldCheck className="size-4 shrink-0 text-amber" />
            GeoCliks documents and verifies. It does not measure roofs, write estimates or decide
            claims.
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
