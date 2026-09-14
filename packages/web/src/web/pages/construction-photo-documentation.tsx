import { Link } from "wouter";
import {
  FileStack,
  GitCompareArrows,
  MapPin,
  MessageSquare,
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

const STEPS = [
  {
    title: "The crew shoots it",
    body: "On site, in the GeoCliks app. No signal needed — a capture made in a basement or a canyon queues on the phone.",
  },
  {
    title: "GeoCliks locks it",
    body: "Network-verified time, GPS coordinates and the resolved street address are written into the photo, with a SHA-256 hash and a unique photo code.",
  },
  {
    title: "It syncs to the project",
    body: "The capture lands in the project's Teamspace the moment the phone is back in range, filed under the job it belongs to.",
  },
  {
    title: "Anyone can check it",
    body: "A client, an inspector or your own PM enters the photo code at geocliks.com/verify and sees whether the photo is the untouched original.",
  },
];

const DISPUTE_CARDS = [
  {
    icon: GitCompareArrows,
    title: "Before and after, side by side",
    body: "Pair the pre-work and post-work captures of the same spot into one comparison. Progress disputes end faster when both photos carry their own verified date.",
  },
  {
    icon: FileStack,
    title: "Closeout reports, ready to hand over",
    body: "Bundle a project's verified photos into a PDF, Excel, ZIP or KMZ export, with each capture's time, location and photo code printed beside it.",
  },
  {
    icon: ShieldCheck,
    title: "Roles that match the trade",
    body: "A sub captures for their own scope without seeing the rest of the job. Owners, admins, managers, dispatchers and field members each see only what their role allows.",
  },
];

const TEAM_CARDS = [
  {
    icon: MapPin,
    title: "Every capture on one map",
    body: "See the whole project geographically — which elevations got documented, which corner of the site nobody has shot since Tuesday.",
  },
  {
    icon: Users,
    title: "Invite by link or printed QR",
    body: "Add crew members to the workspace and assign them by project. Seats are included in the plan rather than billed one at a time.",
  },
  {
    icon: MessageSquare,
    title: "Messages and broadcasts",
    body: "Send the whole crew a change without pulling anyone off the job into a phone call or a group text thread.",
  },
];

const FAQ = [
  {
    question: "Is a GeoCliks timestamp different from my phone's built-in one?",
    answer:
      "Yes. A phone's timestamp comes from the device clock, and a device clock can be changed in settings — which is exactly what gets pointed out when a photo's date matters. GeoCliks verifies the time against our servers when the capture arrives. If the device clock disagrees with ours by more than a few minutes, the capture is marked device-timed instead of verified, rather than quietly passing as verified.",
  },
  {
    question: "Does it work without cell signal on a job site?",
    answer:
      "Yes. Captures are queued on the phone and upload themselves when the crew is back in range. A queued capture is sealed as network-verified at the moment it reaches our servers.",
  },
  {
    question: "Can a client verify a photo without a GeoCliks account?",
    answer:
      "Yes. Every capture carries a unique photo code, and anyone can enter it at geocliks.com/verify — no account, no app, no sign-in. That is the point: verification a client has to take your word for is not verification.",
  },
  {
    question: "What actually stops someone editing the photo afterwards?",
    answer:
      "Each capture is stored with a SHA-256 content hash and a signature, and every event affecting it is written to an append-only record. An edited copy no longer matches its hash, so the verification page reports it as altered rather than as the original.",
  },
  {
    question: "Does GeoCliks make a photo legally admissible?",
    answer:
      "No, and no software honestly can. GeoCliks is not a notary or a legal service, and whether a court, insurer or GC accepts a record is their decision. What it does is make undetected tampering hard and give a third party a way to check a photo independently.",
  },
];

export default function ConstructionPhotoDocumentation() {
  return (
    <LandingPage
      path="/construction-photo-documentation"
      eyebrow="Construction photo documentation"
      h1="Construction Photo Documentation Your Client Can't Dispute"
      sub="Every photo carries a network-verified time, GPS location and street address — locked the moment it's taken."
      jsonLd={[
        faqSchema(FAQ),
        breadcrumbSchema([{ name: "Construction Photo Documentation" }]),
      ]}
    >
      <LandingSection
        label="Why crews look for this"
        h2="Nobody searches for this before a dispute. They search for it after one."
        intro="A client says the work was never done. An inspector questions a completion date. One sub blames another for damage that was there on Monday. At that point a phone photo with a watermark typed on afterwards is not going to settle anything — the date came from a clock anyone could have changed, and the file has been through three phones and a text message. GeoCliks is built for the version of that conversation where you can prove it."
      />

      <LandingSection label="How it works" h2="Four steps, and the crew only does the first one.">
        <LandingSteps steps={STEPS} />
      </LandingSection>

      <LandingSection
        label="Built for the moment it gets questioned"
        h2="The features that matter are the ones you use on the day it goes wrong."
      >
        <LandingCards items={DISPUTE_CARDS} />
      </LandingSection>

      <LandingSection
        label="For teams running multiple crews"
        h2="One account across every crew and every job."
      >
        <LandingCards items={TEAM_CARDS} />
      </LandingSection>

      <LandingSection label="Questions" h2="Frequently asked">
        <LandingFaq entries={FAQ} />
      </LandingSection>

      <LandingCta
        h2="Start documenting the next job properly"
        body="Capturing is free forever — 300 verified photos a month, no card. Paid plans add unlimited captures, Teamspace and the full set of exports."
        primary={{ label: "Get the app", to: "/get-app" }}
        secondary={{ label: "See how verification works", to: "/help/verify/how-sealing-works" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            Comparing options?{" "}
            <Link
              to="/alternatives/companycam"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              See how GeoCliks compares to CompanyCam
            </Link>
            , or read the{" "}
            <Link
              to="/help/getting-started"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              getting-started guides
            </Link>
            .
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
