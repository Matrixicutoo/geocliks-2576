import { Link } from "wouter";
import { Check, Minus } from "lucide-react";
import { LandingCta, LandingFaq, LandingPage, LandingSection } from "../components/landing-page";
import { cn } from "../lib/utils";
import { SUPPORT_EMAIL } from "../lib/support";
import { pageFaq } from "../lib/page-schema";

/**
 * Comparison landing page for "timemark alternative" and its neighbours.
 *
 * Written to the same two rules as `alternatives-companycam.tsx`, and they
 * matter more here, because Timemark is the nearest competitor this product
 * has. CompanyCam is a different category wearing similar clothes — a photo
 * feed. Timemark is the same category: a timestamp camera whose time comes off
 * the network, with a per-photo code and a public verification page. Most of
 * the easy "we verify, they don't" copy a comparison page reaches for would be
 * false on this one, so it is not here.
 *
 *  1. Every Timemark claim below was read off timemark.com, their plan
 *     comparison table, their FAQ and help.timemark.com on the date in
 *     `VERIFIED_ON`, and each row says what their own documentation says. Where
 *     they match us, the row says they match us. Where they are cheaper, the
 *     row says they are cheaper. A row we cannot source is not a "No".
 *  2. `VERIFIED_ON` is rendered on the page. Re-check the rows and move the
 *     date when you touch this file.
 *
 * The GeoCliks column comes from the product and the live plan table. Read the
 * prices off the running site, never off the seeds in `api/lib/plans.ts` —
 * those two have drifted before.
 */

/** The day the Timemark column was last checked against their public site. */
const VERIFIED_ON = "26 September 2026";

type Cell =
  | { kind: "yes"; note?: string }
  | { kind: "no"; note?: string }
  | { kind: "text"; note: string };

const ROWS: Array<{ feature: string; detail?: string; us: Cell; them: Cell }> = [
  {
    feature: "Time taken from the network, not the phone",
    detail: "Whether a photo's date survives someone changing the device clock.",
    us: { kind: "yes", note: "Server time, device time and the gap between them are all stored" },
    them: {
      kind: "yes",
      note: "Their documentation states the time comes from the network rather than the device",
    },
  },
  {
    feature: "Anyone can check a photo without the app",
    us: { kind: "yes", note: "A code per capture, checked at geocliks.com/verify" },
    them: { kind: "yes", note: "A 14-character Photo Code, checked at verify.timemark.com" },
  },
  {
    feature: "Verifiable without switching a setting on first",
    detail: "A photo that was never coded cannot be checked later, however the dispute goes.",
    us: { kind: "yes", note: "Every capture on every plan gets a code — there is nothing to enable" },
    them: {
      kind: "text",
      note: "Photo Code is a feature to turn on: their FAQ answers a failed verification with \"make sure the Photo Code feature is enabled\"",
    },
  },
  {
    feature: "The image bytes are sealed",
    detail: "Whether an edit to the file itself reports as an edit.",
    us: {
      kind: "yes",
      note: "SHA-256 of the bytes, plus an HMAC-SHA256 signature over the metadata — altering either breaks the seal",
    },
    them: {
      kind: "text",
      note: "Their verification page describes image integrity detection; their help notes that editing a photo's watermark after capture does not change its Photo Code, and their paid plans list editing or removing the watermark after capture",
    },
  },
  {
    feature: "GPS accuracy radius recorded by default",
    detail: "A location claimed to the metre off a forty-metre fix is a false precision.",
    us: { kind: "yes", note: "Stored with every capture and shown on the verification page" },
    them: {
      kind: "text",
      note: "An optional watermark field — their FAQ describes toggling Accuracy on under More Options",
    },
  },
  {
    feature: "No ads",
    us: { kind: "yes", note: "On every plan, including free" },
    them: { kind: "text", note: "\"No ads\" is listed as a paid-plan row in their own plan comparison" },
  },
  {
    feature: "Gallery photos cannot enter the record",
    detail: "The hole every photo-documentation tool has to close somehow.",
    us: { kind: "yes", note: "Captures are taken in the app; there is no import path into the photo record" },
    them: {
      kind: "yes",
      note: "Blocked once a Teamspace owner turns on their \"Timemark capture only\" setting",
    },
  },
  {
    feature: "Video",
    us: { kind: "yes", note: "Verified video: 30-second clips on free, up to three minutes per clip on Plus" },
    them: {
      kind: "text",
      note: "Auto-saved to Teamspace, where their FAQ counts every 10 seconds of video as one photo against the plan limit",
    },
  },
  {
    feature: "Delivery routes and proof of delivery",
    detail: "Dispatch drivers, optimise stops, capture a signature at the door.",
    us: { kind: "yes", note: "On the Delivery plans" },
    them: {
      kind: "text",
      note: "Proof-of-delivery photos are one of their listed use cases; route dispatch and stop optimisation are not described",
    },
  },
  {
    feature: "Free plan",
    us: { kind: "yes", note: "300 verified photos a month, 3 projects, no card" },
    them: { kind: "yes", note: "100 photos in Teamspace and 3 projects, per their plan comparison" },
  },
  {
    feature: "Pricing",
    us: {
      kind: "text",
      note: "Flat monthly bands with the seats included: $7 solo, $25 Business, $45 for 10 seats, $105 for 25. No per-seat charge.",
    },
    them: {
      kind: "text",
      note: "Per user, per month: Plus $5, Business $7, Enterprise marked coming soon. Cheaper than us for one person; $70 a month where ten seats cost us $45.",
    },
  },
];

const FAQ = pageFaq("/alternatives/timemark");

function Mark({ cell }: { cell: Cell }) {
  // Same as the CompanyCam page: the icon is decorative, so the verdict has to
  // reach a screen reader as text, and is skipped when the visible copy is
  // already that word.
  const word = cell.kind === "yes" ? "Yes" : cell.kind === "no" ? "No" : "";
  const visible = cell.note?.trim() || word;
  const verdict = word && visible !== word ? `${word}.` : "";

  return (
    <div className="flex items-start gap-2">
      {cell.kind === "yes" ? (
        <Check className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
      ) : cell.kind === "no" ? (
        <Minus className="mt-0.5 size-4 shrink-0 text-fog/50" aria-hidden />
      ) : null}
      <span
        className={cn("text-[13.5px] leading-snug", cell.kind === "no" ? "text-fog/70" : "text-fog")}
      >
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

export default function AlternativesTimemark() {
  return (
    <LandingPage
      path="/alternatives/timemark"
      eyebrow="GeoCliks vs Timemark"
      h1="GeoCliks vs Timemark"
      sub="The closest comparison on this site. Both verify the time against a network and give every photo a code — here is what is actually left to choose between."
    >
      <LandingSection
        label="The short version"
        h2="Same idea. Different answer to what a seal covers."
        intro="Timemark is the nearest thing to this product on the market, and the usual comparison-page move — claiming the other side does not really verify anything — would be false. They take the time off the network, they issue a per-photo code, and anyone can check that code on their site without installing the app. If you are choosing between the two, the honest differences are narrower and more specific than any feature list suggests: whether the code is on before you need it, whether the seal covers the image bytes or the record the code points at, and whether the bill scales by seat."
      />

      <LandingSection label="Feature by feature" h2="The comparison, with sources">
        <div className="overflow-x-auto rounded-[12px] border border-line">
          <table className="w-full min-w-[720px] border-collapse text-start">
            <caption className="sr-only">
              GeoCliks compared with Timemark, feature by feature
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
                  Timemark
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
          The Timemark column was read from timemark.com, their plan comparison table, their FAQ and
          help.timemark.com on {VERIFIED_ON}, and describes what their documentation states. Vendors
          change plans and features — check their current pricing page before you decide, and tell
          us at {SUPPORT_EMAIL} if a row here has gone out of date. Prices are USD.
        </p>
      </LandingSection>

      <LandingSection
        label="Where they win"
        h2="Two reasons to pick Timemark instead"
        intro="Leaving this out would make the rest of the page less believable, not more."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[12px] border border-line bg-ink-2 p-5">
            <p className="label">One person, lowest price</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-fog">
              Their Plus plan is $5 a user against our $7 for a single seat. If you are a sole
              operator who wants the watermark cleaned up and nothing else, they are two dollars
              cheaper and there is no argument to make. The flat-band pricing here only starts
              paying you back at a crew.
            </p>
          </div>
          <div className="rounded-[12px] border border-line bg-ink-2 p-5">
            <p className="label">More surface area</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-fog">
              They ship things this product does not: digital checklists, time tracking, KML map
              overlays, OneDrive and SharePoint backup, photo collages, ten interface languages. If
              your documentation problem is really a breadth problem, that is a real answer and this
              page is not trying to talk you out of it.
            </p>
          </div>
        </div>
      </LandingSection>

      <LandingSection
        label="Switching"
        h2="What moving over actually looks like"
        intro="There is no importer, and there is a reason worth stating plainly: verification happens at the moment of capture, so photos taken in another app — Timemark included — cannot be retroactively sealed here. Importing them would give you an archive, not an evidence record. Teams switch by drawing a line at a date. New jobs get captured in GeoCliks, old projects stay where they are and stay exportable. Seats come with the plan, so one crew can move without the whole company moving."
      >
        <div className="rounded-[12px] border border-line bg-ink-2 p-5 sm:p-6">
          <p className="label">Pick GeoCliks if</p>
          <ul className="mt-4 space-y-3">
            {[
              "You would rather every photo be checkable by default than remember to switch a code on before the job that turns out to matter.",
              "You want the seal to cover the image bytes, so an edit to the file reports as an edit.",
              "You are paying for a crew rather than a seat, where flat bands beat per-user pricing.",
              "The GPS accuracy radius belongs on the record rather than in a settings menu.",
              "You also run deliveries and want dispatch, stop optimisation and door signatures in the same account.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
                <span className="text-[14px] leading-relaxed text-fog">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </LandingSection>

      <LandingSection label="Questions" h2="Frequently asked">
        <LandingFaq entries={FAQ} />
      </LandingSection>

      <LandingCta
        h2="Run both on one job"
        body="The free plan covers 300 verified photos a month with no card. Capture the same wall twice, then try to break each record — that settles it faster than any table."
        primary={{ label: "Try GeoCliks free", to: "/get-app" }}
        secondary={{ label: "See how sealing works", to: "/help/verify/how-sealing-works" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            Comparing against a photo feed instead?{" "}
            <Link
              to="/alternatives/companycam"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              Read GeoCliks vs CompanyCam
            </Link>
            , or{" "}
            <Link
              to="/construction-photo-documentation"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              the construction photo documentation overview
            </Link>
            .
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
