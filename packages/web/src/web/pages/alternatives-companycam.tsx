import { Link } from "wouter";
import { Check, Minus } from "lucide-react";
import {
  LandingCta,
  LandingFaq,
  LandingPage,
  LandingSection,
} from "../components/landing-page";
import { cn } from "../lib/utils";
import { SUPPORT_EMAIL } from "../lib/support";
import { breadcrumbSchema, faqSchema } from "../lib/structured-data";

/**
 * Comparison landing page for "companycam alternatives" and its neighbours.
 *
 * A competitor comparison is the one page on a marketing site where being
 * wrong is expensive, so two rules are baked into how this file is written:
 *
 *  1. Every CompanyCam claim below was read off companycam.com and their own
 *     help centre on the date in `VERIFIED_ON`, and the row says what their
 *     documentation says rather than what is convenient. Where they simply do
 *     not describe something — whether their timestamp is checked against
 *     anything but the device — the row says that, instead of claiming a "No"
 *     that cannot be sourced.
 *  2. `VERIFIED_ON` is rendered on the page. Vendors change plans and features,
 *     and a comparison table with no date on it is a liability the moment they
 *     do. Re-check the rows and move the date when you touch this page.
 *
 * The GeoCliks column is drawn from `api/lib/plans.ts` and the product itself.
 */

/** The day the CompanyCam column was last checked against their public site. */
const VERIFIED_ON = "14 September 2026";

type Cell =
  | { kind: "yes"; note?: string }
  | { kind: "no"; note?: string }
  | { kind: "text"; note: string };

const ROWS: Array<{ feature: string; detail?: string; us: Cell; them: Cell }> = [
  {
    feature: "Network-verified timestamp",
    detail: "The time is checked against a server, not taken from the phone's clock.",
    us: { kind: "yes", note: "Captures whose device clock disagrees are flagged device-timed" },
    them: { kind: "text", note: "Not described — photos are stamped with the device date and time" },
  },
  {
    feature: "Street address on the capture",
    us: { kind: "yes", note: "Coordinates and the resolved address" },
    them: { kind: "text", note: "GPS latitude and longitude" },
  },
  {
    feature: "Stamping on by default",
    detail: "Whether a photo is documented without anyone remembering to switch something on.",
    us: { kind: "yes", note: "Every capture, every account" },
    them: { kind: "text", note: "Opt-in toggle each user turns on in their own settings" },
  },
  {
    feature: "Independently verifiable photo code",
    detail: "A third party can check a single photo without an account.",
    us: { kind: "yes", note: "Any code checks at geocliks.com/verify" },
    them: { kind: "no" },
  },
  {
    feature: "Tamper-evident content hash",
    us: { kind: "yes", note: "SHA-256 plus an append-only event record" },
    them: { kind: "no" },
  },
  {
    feature: "Works fully offline, syncs on reconnect",
    us: { kind: "yes" },
    them: { kind: "yes" },
  },
  { feature: "Shared project feed for the team", us: { kind: "yes" }, them: { kind: "yes" } },
  { feature: "Before / after comparison", us: { kind: "yes" }, them: { kind: "yes" } },
  {
    feature: "Report export",
    us: { kind: "yes", note: "PDF, Excel, ZIP and KMZ" },
    them: { kind: "yes", note: "Photo reports" },
  },
  {
    feature: "Delivery routes and proof of delivery",
    detail: "Dispatch drivers, optimise stops, capture a signature at the door.",
    us: { kind: "yes", note: "On the Delivery plans" },
    them: { kind: "no" },
  },
  {
    feature: "Free plan",
    us: { kind: "yes", note: "300 verified photos a month, no card" },
    them: { kind: "text", note: "Free trial only" },
  },
  {
    feature: "Pricing",
    us: {
      kind: "text",
      note: "Flat monthly bands with seats included: $12 solo, $25 Business, $50 for 10 seats, $125 for 25. No per-seat charge.",
    },
    them: {
      kind: "text",
      note: "From $63/month for 1 user (Core), $119 for 3 (Crew), $199 for 3 (Scale), billed annually — plus $29 per additional user.",
    },
  },
];

const FAQ = [
  {
    question: "What is the actual difference between GeoCliks and CompanyCam?",
    answer:
      "CompanyCam is a shared photo feed for construction teams, and a good one. GeoCliks is built around proving a photo, so the verification layer goes further: the timestamp is checked against our servers rather than read off the phone, the street address is written in alongside the coordinates, and every capture gets a code anyone can check independently at geocliks.com/verify. If your photos are mainly for coordination, that layer is overhead. If they get disputed, it is the whole point.",
  },
  {
    question: "Is GeoCliks cheaper than CompanyCam?",
    answer:
      "For most teams, yes, and the shape of the bill differs more than the number. CompanyCam prices per user on top of a plan minimum — from $63 a month for one user, plus $29 for each additional. GeoCliks charges a flat monthly price with the seats included: $12 for one person, $50 for ten, $125 for twenty-five. There is also a free plan that covers 300 verified photos a month.",
  },
  {
    question: "Can I move my CompanyCam photo history into GeoCliks?",
    answer:
      "There is no automated import today. You can export your photos from CompanyCam and keep that archive, and most teams switch by running GeoCliks on new jobs from a chosen date while the old projects stay where they are. One thing to be clear about: photos imported from anywhere else cannot be network-verified after the fact, because the verification happens at capture. An imported photo is a photo, not a GeoCliks-sealed capture.",
  },
  {
    question: "Do I have to move the whole crew at once?",
    answer:
      "No. Seats are included in the plan rather than billed individually, so you can put one crew on GeoCliks for a job, keep everyone else where they are, and decide afterwards.",
  },
  {
    question: "Does GeoCliks do everything CompanyCam does?",
    answer:
      "Not everything. CompanyCam has grown into adjacent territory — on-site payments, marketing tools, e-signature, room measurement, AI captioning. GeoCliks does not do those and is not trying to. It does photo and video evidence, Teamspace, reports and delivery routes. If you want the photo app to also be the CRM, CompanyCam is the broader product.",
  },
];

function Mark({ cell }: { cell: Cell }) {
  // The icon is decorative, so the yes/no verdict has to reach a screen reader
  // as text. Skipped when the visible copy is already that word, which would
  // otherwise be read as "No. No".
  const word = cell.kind === "yes" ? "Yes" : cell.kind === "no" ? "No" : "";
  // With no note, the cell already renders the bare word.
  const visible = cell.note?.trim() || word;
  const verdict = word && visible !== word ? `${word}.` : "";

  return (
    <div className="flex items-start gap-2">
      {cell.kind === "yes" ? (
        <Check className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
      ) : cell.kind === "no" ? (
        <Minus className="mt-0.5 size-4 shrink-0 text-fog/50" aria-hidden />
      ) : null}
      <span className={cn("text-[13.5px] leading-snug", cell.kind === "no" ? "text-fog/70" : "text-fog")}>
        {verdict ? <span className="sr-only">{verdict} </span> : null}
        {cell.kind === "yes" && !cell.note ? (
          <span className="font-semibold text-chalk">Yes</span>
        ) : cell.kind === "no" && !cell.note ? (
          "No"
        ) : (
          cell.note
        )}
      </span>
    </div>
  );
}

export default function AlternativesCompanyCam() {
  return (
    <LandingPage
      path="/alternatives/companycam"
      eyebrow="GeoCliks vs CompanyCam"
      h1="GeoCliks vs CompanyCam"
      sub="Both put GPS-tagged photos in front of your crew. Here's where they actually differ."
      jsonLd={[
        faqSchema(FAQ),
        breadcrumbSchema([{ name: "Alternatives" }, { name: "CompanyCam" }]),
      ]}
    >
      <LandingSection
        label="The short version"
        h2="One is a photo feed. One is an evidence record."
        intro="CompanyCam is built for construction teams that want a shared photo feed, and it does that well. GeoCliks is built for teams that need every photo to hold up when someone disputes it — a network-verified timestamp, GPS coordinates and the street address locked into the capture itself, with a unique code anyone can check independently. If your work gets questioned, by a client, an inspector or in an insurance claim, that verification layer is the difference. If it never does, you are paying for something you will not use."
      />

      <LandingSection label="Feature by feature" h2="The comparison, with sources">
        <div className="overflow-x-auto rounded-[12px] border border-line">
          <table className="w-full min-w-[720px] border-collapse text-start">
            <caption className="sr-only">
              GeoCliks compared with CompanyCam, feature by feature
            </caption>
            <thead>
              <tr className="border-b border-line bg-ink-2">
                <th scope="col" className="label px-4 py-3 text-start">
                  Feature
                </th>
                <th scope="col" className="label px-4 py-3 text-start text-amber">
                  GeoCliks
                </th>
                <th scope="col" className="label px-4 py-3 text-start">
                  CompanyCam
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-line last:border-0">
                  <th scope="row" className="px-4 py-4 align-top text-start">
                    <span className="font-display text-[14px] font-semibold text-chalk">
                      {row.feature}
                    </span>
                    {row.detail ? (
                      <span className="mt-1 block text-[12.5px] leading-snug text-fog/80">
                        {row.detail}
                      </span>
                    ) : null}
                  </th>
                  <td className="bg-amber/[0.04] px-4 py-4 align-top">
                    <Mark cell={row.us} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <Mark cell={row.them} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-[820px] text-[12.5px] leading-relaxed text-fog/80">
          The CompanyCam column was read from companycam.com and their own help centre on{" "}
          {VERIFIED_ON}, and describes what their documentation states. Vendors change plans and
          features — check their current pricing page before you decide, and tell us at{" "}
          {SUPPORT_EMAIL} if a row here has gone out of date. Prices are USD.
        </p>
      </LandingSection>

      <LandingSection
        label="Switching"
        h2="What moving over actually looks like"
        intro="Worth saying plainly, because most comparison pages are vague here: there is no one-click importer. Photos already taken in another app cannot be retroactively network-verified, because the verification happens at the moment of capture — so importing them would give you an archive, not an evidence record. What teams do instead is draw a line at a date: new jobs get captured in GeoCliks, old projects stay where they are and stay exportable. Seats come with the plan, so you can start with one crew rather than the whole company."
      >
        <div className="rounded-[12px] border border-line bg-ink-2 p-5 sm:p-6">
          <p className="label">Who this is for</p>
          <ul className="mt-4 space-y-3">
            {[
              "Teams that have had a photo's authenticity questioned by a client, a GC or an inspector.",
              "Work where photo evidence has to survive an insurance claim or a legal dispute.",
              "Crews that want the documentation to happen without anyone remembering to enable it.",
              "Operations that also run deliveries and want proof of delivery in the same account.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
                <span className="text-[14px] leading-relaxed text-fog">{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-[13.5px] leading-relaxed text-fog">
            If what you need is a shared project photo feed and nothing has ever been disputed,
            CompanyCam is a reasonable answer and this page is not trying to talk you out of it.
          </p>
        </div>
      </LandingSection>

      <LandingSection label="Questions" h2="Frequently asked">
        <LandingFaq entries={FAQ} />
      </LandingSection>

      <LandingCta
        h2="Try it on one job"
        body="The free plan covers 300 verified photos a month with no card. Run it alongside what you have and see whether the verification layer earns its place."
        primary={{ label: "Try GeoCliks free", to: "/get-app" }}
        secondary={{ label: "See how verification works", to: "/help/verify/how-sealing-works" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            Documenting construction work specifically?{" "}
            <Link
              to="/construction-photo-documentation"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              Read the construction photo documentation overview
            </Link>
            .
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
