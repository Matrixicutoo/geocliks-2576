import { Link } from "wouter";
import {
  BadgeCheck,
  CalendarClock,
  FileStack,
  Home,
  Images,
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
import { pageFaq } from "../lib/page-schema";

/**
 * Search landing page for "property inspection photos" and its neighbours
 * ("move-in move-out inspection app", "rental condition report photos",
 * "security deposit dispute photos").
 *
 * The distinguishing fact here is that the dispute is almost always about *when*
 * a condition existed, not about what the photo shows. A landlord and a tenant
 * usually agree the carpet is stained; they disagree about whether it was
 * stained at move-in. That makes a verified capture date the whole ballgame, so
 * this page leads with the move-in/move-out pair rather than with progress
 * (construction) or arrival (HVAC).
 *
 * It deliberately makes no claim about deposit law, which varies by state and
 * province, and it does not pretend to be a lease or inspection-checklist
 * product. Both limits are stated on the page rather than left for the visitor
 * to discover after signing up.
 */

const STEPS = [
  {
    title: "Walk the unit at move-in",
    body: "Room by room, plus the meters and any existing damage. Every capture carries a time verified against our servers, the coordinates and the resolved street address.",
  },
  {
    title: "Attach it to the unit",
    body: "Captures file against a project for that address, so the move-in set stays together instead of scattering through a camera roll for twelve months.",
  },
  {
    title: "Walk it again at move-out",
    body: "The same rooms in the same order. Pair each shot against its move-in counterpart so the difference — or the absence of one — is visible side by side.",
  },
  {
    title: "Share the record",
    body: "Send the tenant a link or a photo code. They can verify any capture on a public page, with no account and no app, and see the same verified dates you do.",
  },
];

const DEPOSIT_CARDS = [
  {
    icon: CalendarClock,
    title: "The date is the argument",
    body: "Nobody disputes that the wall is scuffed. They dispute when it happened. A capture time verified on our servers rather than read off a phone is what settles that, and it is the one thing a camera roll cannot give you.",
  },
  {
    icon: Images,
    title: "Before and after, paired",
    body: "Put the move-in and move-out shot of the same room next to each other, each with its own verified date and address, and the condition claim explains itself.",
  },
  {
    icon: ShieldCheck,
    title: "Sealed against later edits",
    body: "Each capture is sealed when it reaches our servers. If a photo is altered afterwards, verification fails — which cuts both ways, and that is the point of showing the tenant the same page you use.",
  },
];

const PORTFOLIO_CARDS = [
  {
    icon: Home,
    title: "One account across the portfolio",
    body: "A project per unit or per building, so a turn at one address does not mean digging through everything photographed this quarter.",
  },
  {
    icon: MapPin,
    title: "Addresses resolved, not typed",
    body: "Coordinates are read at capture and resolved to a street address, so a photo from unit 4B is not filed under unit 4A because somebody mistyped it at eleven at night.",
  },
  {
    icon: FileStack,
    title: "Condition reports that export",
    body: "PDF for the tenant file or the deposit letter, Excel for the office, ZIP of the originals for an attorney or an arbitrator — each photo printed with its time, address and verification code.",
  },
];

const TEAM_CARDS = [
  {
    icon: Users,
    title: "Inspectors and managers on flat seats",
    body: "Add the leasing staff, the maintenance techs and the regional manager without paying per head, so documenting a turn never costs more because the portfolio grew.",
  },
  {
    icon: BadgeCheck,
    title: "Roles that match the org",
    body: "Field staff capture and see their own work, the office sees the records for every unit. Nobody needs admin access to photograph a kitchen.",
  },
  {
    icon: ShieldCheck,
    title: "Free for the next turn",
    body: "300 verified captures a month at no cost, verification included. Enough for several full move-in walkthroughs before you decide anything.",
  },
];

const FAQ = pageFaq("/property-inspection-photos");

export default function PropertyInspectionPhotos() {
  return (
    <LandingPage
      path="/property-inspection-photos"
      eyebrow="Property inspection photos"
      h1="Property Inspection Photos With a Date Nobody Can Argue With"
      sub="Move-in and move-out walkthroughs where every capture carries a server-verified time, GPS and unit address — and the tenant can check them too."
    >
      <LandingSection
        label="Why property managers look for this"
        h2="You and the tenant agree the carpet is stained. You disagree about when."
        intro="Almost every deposit dispute comes down to a single question: did this condition exist before they moved in? Both sides usually have photos. Neither set proves a date, because a phone's timestamp is whatever the phone was told the time was. Verify the capture time somewhere outside the phone and the argument stops being about credibility and starts being about the record."
      />

      <LandingSection
        label="How it works"
        h2="Two walkthroughs, twelve months apart, one paired record."
      >
        <LandingSteps steps={STEPS} />
      </LandingSection>

      <LandingSection label="For the deposit file" h2="Three things a camera roll cannot give you.">
        <LandingCards items={DEPOSIT_CARDS} />
      </LandingSection>

      <LandingSection label="Across the portfolio" h2="Organised by unit, not by the month it happened.">
        <LandingCards items={PORTFOLIO_CARDS} />
      </LandingSection>

      <LandingSection label="For the whole team" h2="Priced and permissioned for a management office.">
        <LandingCards items={TEAM_CARDS} />
      </LandingSection>

      <LandingSection label="Questions" h2="Frequently asked">
        <LandingFaq entries={FAQ} />
      </LandingSection>

      <LandingCta
        h2="Document the next turn properly"
        body="Free forever for 300 verified captures a month, no card. Paid plans add unlimited captures, Teamspace for the office and the full set of exports."
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
              to="/hvac-photo-documentation"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              HVAC and service call documentation
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
            Documentation only — not a lease management system, and not legal advice on deposit
            rules, which vary by state and province.
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
