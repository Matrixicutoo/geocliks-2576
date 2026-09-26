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

const STEPS = [
  {
    title: "The driver shoots the drop",
    body: "One photo at the door, in the GeoCliks app. No signal needed — a capture in a stairwell or an underground garage queues on the phone.",
  },
  {
    title: "GeoCliks locks it",
    body: "Network-verified time, GPS coordinates and the resolved street address are written into the photo, with a SHA-256 hash and a unique photo code.",
  },
  {
    title: "The stop closes itself",
    body: "The capture attaches to the stop on the route, so the run's record builds as the driver works instead of at the end of the shift.",
  },
  {
    title: "The shipper checks it",
    body: "Send the photo code with the invoice. The shipper enters it at geocliks.com/verify and sees the original, with no account and no app.",
  },
];

const DISPUTE_CARDS = [
  {
    icon: Clock,
    title: "A delivery time nobody can move",
    body: "The time comes from our servers, not the handset. A driver who changes the phone clock to cover a late drop gets the capture marked device-timed, not verified — and the office sees which one it is.",
  },
  {
    icon: MapPin,
    title: "The address, resolved and stamped",
    body: "Coordinates, accuracy radius and the reverse-geocoded street address are burned into the image and stored as metadata. A photo of the wrong door is obvious from the stamp.",
  },
  {
    icon: ScanLine,
    title: "A code the shipper can check themselves",
    body: "Proof the other side has to take your word for is not proof. Every capture carries a code that resolves on a public page showing whether the photo is the untouched original.",
  },
];

const OPS_CARDS = [
  {
    icon: Route,
    title: "Routes and stops, priced per stop",
    body: "Plan a run, assign a driver, and get each stop's captures filed against it. Delivery is billed by the stop rather than by the seat, so a seasonal driver does not change the plan.",
  },
  {
    icon: FileStack,
    title: "Exports a shipper will accept",
    body: "Hand over a run as a PDF, Excel, ZIP or KMZ, with each drop's time, coordinates, address and photo code printed beside the photo.",
  },
  {
    icon: Building2,
    title: "Roles for dispatch and the road",
    body: "Dispatchers see the whole board, drivers see their own stops. Nobody has to be given the whole operation to document one shift.",
  },
];

const FAQ = pageFaq("/proof-of-delivery");

export default function ProofOfDelivery() {
  return (
    <LandingPage
      path="/proof-of-delivery"
      eyebrow="Proof of delivery"
      h1="Proof of Delivery the Shipper Can Check Themselves"
      sub="Every drop photo carries a network-verified time, GPS location and street address — locked at the door, with a code anyone can look up."
    >
      <LandingSection
        label="Why couriers look for this"
        h2="The parcel was delivered. Proving it is the part that costs you."
        intro="A customer says nothing arrived. A shipper raises a chargeback three weeks later. The driver remembers the drop and even has a photo of it — taken on a phone, timestamped by that phone, sitting in a camera roll with two hundred others. None of that survives a dispute, because the only date on it came from a clock the driver controls. GeoCliks is built for the version where the record answers the question before anyone has to argue about it."
      />

      <LandingSection label="How it works" h2="Four steps, and the driver only does the first one.">
        <LandingSteps steps={STEPS} />
      </LandingSection>

      <LandingSection
        label="Built for the dispute, not the demo"
        h2="Three things that decide whether a delivery record holds."
      >
        <LandingCards items={DISPUTE_CARDS} />
      </LandingSection>

      <LandingSection
        label="For dispatch and multi-driver runs"
        h2="One account across every driver and every route."
      >
        <LandingCards items={OPS_CARDS} />
      </LandingSection>

      <LandingSection label="Questions" h2="Frequently asked">
        <LandingFaq entries={FAQ} />
      </LandingSection>

      <LandingCta
        h2="Start proving the next run properly"
        body="Capturing is free forever — 300 verified photos a month, no card. Delivery routes are priced by the stop, and every plan includes the public verification page."
        primary={{ label: "Get the app", to: "/get-app" }}
        secondary={{ label: "See plans and pricing", to: "/pricing" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            Related reading:{" "}
            <Link
              to="/blog/what-should-photo-proof-of-delivery-include"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              what actually counts as proof of delivery
            </Link>
            , or see{" "}
            <Link
              to="/gps-timestamp-camera"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              how the GPS timestamp camera works
            </Link>
            .
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-fog">
            <Signature className="size-4 shrink-0 text-amber" />
            GeoCliks captures photo, time, GPS and address. It does not collect recipient
            signatures.
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-fog">
            <ShieldCheck className="size-4 shrink-0 text-amber" />
            Not a legal or notary service. Whether a shipper or card network accepts a record is
            their decision.
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
