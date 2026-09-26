import { Link } from "wouter";
import {
  BadgeCheck,
  Clock,
  FileStack,
  Gauge,
  MapPin,
  ShieldCheck,
  Truck,
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
import { pageFaq } from "../lib/page-schema";

/**
 * Search landing page for "HVAC photo documentation" and its neighbours
 * ("hvac service call proof", "technician arrival proof", "field service photo
 * app").
 *
 * The distinguishing fact about this trade is that the dispute is usually about
 * arrival and duration rather than about the work itself: a customer or a
 * warranty payer questions whether the tech came, when, and for how long. So
 * this page leads with arrival and departure captures where the construction
 * page leads with progress and the roofing page leads with before/after.
 *
 * The page does not claim anything about warranty or code compliance
 * acceptance. A verified photo is evidence; whether a manufacturer honours a
 * warranty claim on the strength of it is between the contractor and the
 * manufacturer, and saying otherwise here would be a promise we cannot keep.
 */

const STEPS = [
  {
    title: "Capture on arrival",
    body: "A shot of the unit and the address when the tech reaches the site. Time comes from the network, so the arrival is on the record before any work starts.",
  },
  {
    title: "Document the condition",
    body: "Nameplate, model and serial, the fault, the gauges. Each capture is stamped with verified time, coordinates and street address.",
  },
  {
    title: "Capture the finished work",
    body: "The completed install or repair, paired against the before shot so the change is visible and both halves carry their own verified date.",
  },
  {
    title: "Send proof with the invoice",
    body: "Attach the photo codes. The customer, the property manager or the warranty payer can verify any capture on a public page with no account.",
  },
];

const CALL_CARDS = [
  {
    icon: Clock,
    title: "Arrival and departure, verified",
    body: "The recurring service dispute is whether the tech showed up and how long they stayed. Two captures with server-verified times answer it without a timesheet anyone has to believe.",
  },
  {
    icon: Gauge,
    title: "Readings photographed in place",
    body: "A gauge reading typed into a form is a claim. The same reading photographed with a verified time and the site address attached is a record.",
  },
  {
    icon: BadgeCheck,
    title: "Nameplates, serials and what was installed",
    body: "Model and serial captured on site, sealed so the photo cannot be swapped later. Useful the day a warranty question arrives about which unit went where.",
  },
];

const OPS_CARDS = [
  {
    icon: Truck,
    title: "Every tech, every call, one account",
    body: "Captures file themselves against the job, so the office is not chasing photos out of six camera rolls at the end of the week.",
  },
  {
    icon: MapPin,
    title: "The day's work on a map",
    body: "See which addresses were documented and which call has no captures against it yet, geographically rather than as a list.",
  },
  {
    icon: FileStack,
    title: "Service records that export",
    body: "PDF for the customer file, Excel for the office, ZIP for a property manager who wants the originals — each photo printed with its time, address and code.",
  },
];

const TEAM_CARDS = [
  {
    icon: Users,
    title: "Seats included, not metered",
    body: "Add the whole service team on a flat plan rather than paying per technician, so documenting a call never costs more because you hired.",
  },
  {
    icon: ShieldCheck,
    title: "Roles that fit a service business",
    body: "Dispatchers see the board, technicians see their own calls, the office sees the records. Nobody needs the whole system to document one job.",
  },
  {
    icon: BadgeCheck,
    title: "Free to try on the next call",
    body: "300 verified captures a month at no cost, with verification included. Enough to run a real week before deciding anything.",
  },
];

const FAQ = pageFaq("/hvac-photo-documentation");

export default function HvacPhotoDocumentation() {
  return (
    <LandingPage
      path="/hvac-photo-documentation"
      eyebrow="HVAC photo documentation"
      h1="HVAC Photo Documentation That Proves the Call Happened"
      sub="Arrival, condition and completed work — each capture stamped with network-verified time, GPS and street address, and checkable by whoever is paying."
    >
      <LandingSection
        label="Why service teams look for this"
        h2="The argument is almost never about the refrigerant. It's about the visit."
        intro="A customer disputes a trip charge because they say nobody came. A property manager asks how long the technician was actually in the building. A warranty payer wants to know what the unit looked like before the repair and which serial went in. All of it is answerable in four photos taken on the day — but only if the times and addresses on those photos came from something other than the technician's own phone."
      />

      <LandingSection label="How it works" h2="Four captures, and the tech takes them as they work.">
        <LandingSteps steps={STEPS} />
      </LandingSection>

      <LandingSection
        label="Built for the service call"
        h2="Three records that end the common disputes."
      >
        <LandingCards items={CALL_CARDS} />
      </LandingSection>

      <LandingSection label="For the office" h2="Photos that file themselves against the job.">
        <LandingCards items={OPS_CARDS} />
      </LandingSection>

      <LandingSection label="For the whole team" h2="Priced and permissioned for a service crew.">
        <LandingCards items={TEAM_CARDS} />
      </LandingSection>

      <LandingSection label="Questions" h2="Frequently asked">
        <LandingFaq entries={FAQ} />
      </LandingSection>

      <LandingCta
        h2="Document the next service call properly"
        body="Free forever for 300 verified captures a month, no card. Paid plans add unlimited captures, Teamspace for the whole crew and the full set of exports."
        primary={{ label: "Get the app", to: "/get-app" }}
        secondary={{ label: "See plans and pricing", to: "/pricing" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            Related:{" "}
            <Link
              to="/gps-timestamp-camera"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              how the GPS timestamp camera works
            </Link>
            ,{" "}
            <Link
              to="/property-inspection-photos"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              property inspection photos
            </Link>
            , or{" "}
            <Link
              to="/pricing"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              compare the plans
            </Link>
            .
          </p>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-fog">
            <ShieldCheck className="size-4 shrink-0 text-amber" />
            Documentation only — no dispatch, quoting or invoicing, and no warranty or code
            determination.
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
