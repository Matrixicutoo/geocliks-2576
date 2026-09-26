import { useState } from "react";
import { Check, Fingerprint, Minus, ShieldCheck, WifiOff } from "lucide-react";
import {
  LandingCards,
  LandingCta,
  LandingFaq,
  LandingPage,
  LandingSection,
} from "../components/landing-page";
import { PlanCard, isDeliveryPlan, type PlanView } from "../components/plan-cards";
import { useLocale, useT } from "../lib/i18n";
import { usePlans } from "../queries/billing";
import { SALES_EMAIL } from "../lib/support";
import { pageFaq } from "../lib/page-schema";

/**
 * The pricing page — the only place the plans are listed.
 *
 * The home page's section 06 keeps the promise ("Start free. Scale when the crew
 * does.") and a button; the cards, the limits and the comparison live here, and
 * "/#pricing" forwards here too. One page to keep truthful instead of a card grid
 * in the pitch and the real allowances buried in the help centre.
 *
 * Two things it deliberately does not do:
 *  - invent a second price list. Every figure on the page, including every cell
 *    of the comparison table, is read from `billing.plans` — the same table the
 *    enforcement middleware reads. A plan edited in the admin changes this page
 *    and the limit that bites on the same deploy, so the page cannot lie.
 *  - flatten the two plan families into one ladder. GeoCliks sells evidence
 *    plans and delivery plans side by side, priced on different things (captures
 *    and seats vs. stops and drivers), so a single column of tiers would have to
 *    compare a photo allowance with a routing allowance. The switcher keeps them
 *    apart and the table re-renders for whichever family is being read.
 *
 * Page copy is English, like the other non-home marketing pages: a translated
 * pricing essay is eleven copies to keep truthful, and the part a visitor is
 * actually reading — plan names, taglines, feature bullets, the price itself —
 * comes back from the API already localized.
 */

/** Which family of plans the cards and the table are showing. */
type Family = "evidence" | "delivery";

/** A comparison cell: a tick, a dash, or a value. */
type Cell = boolean | string;

interface CompareRow {
  label: string;
  /** What this row reads off one plan. */
  value: (plan: PlanView) => Cell;
  /** Shown under the label, for the rows people misread. */
  note?: string;
}

interface CompareGroup {
  title: string;
  rows: CompareRow[];
}

/** "-1" means unlimited everywhere in `PlanLimits`. 0 means not included. */
const count = (n: number, unit?: string) => {
  if (n < 0) return "Unlimited";
  if (n === 0) return false;
  const value = n.toLocaleString("en-US");
  return unit ? `${value} ${unit}` : value;
};

const minutes = (seconds: number) =>
  seconds >= 60 ? `${Math.round(seconds / 60)} min` : `${seconds} sec`;

const EXPORT_LABELS: Record<string, string> = {
  pdf: "PDF",
  xlsx: "Excel",
  zip: "ZIP",
  kmz: "KMZ",
};

const COMPARE: CompareGroup[] = [
  {
    title: "Verification",
    rows: [
      {
        label: "Verified time, GPS and street address",
        note: "Network time, not the phone's clock.",
        value: () => true,
      },
      { label: "Unique photo code on every capture", value: () => true },
      { label: "Public verification page", value: () => true },
      {
        label: "Offline capture with auto upload",
        note: "Queues on the phone, uploads when signal returns.",
        value: () => true,
      },
    ],
  },
  {
    title: "Capture",
    rows: [
      {
        label: "Captures per month",
        value: (plan) => count(plan.limits.photosPerMonth),
      },
      {
        label: "Verified video, per clip",
        value: (plan) => minutes(plan.limits.videoMaxSeconds),
      },
      {
        label: "Video available",
        note: "How long video stays on from the day the workspace opens.",
        value: (plan) =>
          plan.limits.videoTrialDays === 0
            ? "Always on"
            : `First ${plan.limits.videoTrialDays} days`,
      },
      { label: "Projects", value: (plan) => count(plan.limits.projects) },
      { label: "Watermark templates", value: (plan) => count(plan.limits.templates) },
      { label: "Your logo on the watermark", value: (plan) => plan.limits.branding },
    ],
  },
  {
    title: "Team, reports and sharing",
    rows: [
      {
        label: "Seats",
        note: "A seat is one person who can sign in. Pending invites hold one.",
        value: (plan) => count(plan.limits.seats),
      },
      {
        label: "Teamspace",
        note: "Every crew photo and clip syncs into one shared feed.",
        value: (plan) => plan.limits.teamspace,
      },
      { label: "Roles and per-project access", value: (plan) => plan.limits.roles },
      { label: "Live share links for clients", value: (plan) => plan.limits.shareLinks },
      {
        label: "Exports",
        value: (plan) =>
          plan.limits.exports.length === 0
            ? false
            : plan.limits.exports.map((format) => EXPORT_LABELS[format] ?? format).join(", "),
      },
      {
        label: "Projects, map and closeout reports",
        note: "The job photo system. Off on the Delivery plans, which are priced for driving.",
        value: (plan) => plan.limits.fieldEnabled,
      },
    ],
  },
  {
    title: "Delivery routes",
    rows: [
      {
        label: "Stops per month",
        note: "Counted when a stop is added to a route, delivered or not. Resets on the 1st.",
        value: (plan) => count(plan.limits.deliveryStopsPerMonth),
      },
      { label: "Drivers", value: (plan) => count(plan.limits.deliveryDrivers) },
      {
        label: "Live dispatch",
        note: "Slot a new order into a route that is already being driven.",
        value: (plan) => plan.limits.deliveryDispatch,
      },
      {
        label: "Smart optimizer",
        note: "Road-network ordering. Without it the standard solver still orders the route.",
        value: (plan) => plan.limits.deliverySmartOptimize,
      },
      { label: "Tracking links and arrival emails", value: (plan) => plan.limits.deliveryTracking },
      { label: "Signature at the door", value: (plan) => plan.limits.deliverySignature },
    ],
  },
];

const SAME_FOR_EVERYONE = [
  {
    icon: ShieldCheck,
    title: "Verification is never the upsell",
    body: "Free and Enterprise stamp a photo the same way: network-verified time, GPS coordinates and the street address they resolve to.",
  },
  {
    icon: Fingerprint,
    title: "Every capture keeps its code",
    body: "A photo code resolves and a seal checks out for good — including after a downgrade, and after you stop paying us entirely.",
  },
  {
    icon: WifiOff,
    title: "The field does not need signal",
    body: "Capture in a basement, a canyon or a parkade on any plan. The phone queues the shot and uploads it when there is a bar again.",
  },
];

const FAQ = pageFaq("/pricing");

/** A tick, a dash, or the number itself. */
function CompareCell({ value }: { value: Cell }) {
  if (value === true)
    return (
      <>
        <Check className="mx-auto size-4 text-verified" aria-hidden />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === false)
    return (
      <>
        <Minus className="mx-auto size-4 text-steel" aria-hidden />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className="mono text-[12.5px] text-chalk">{value}</span>;
}

function FamilySwitch({
  family,
  onChange,
  hasDelivery,
}: {
  family: Family;
  onChange: (next: Family) => void;
  hasDelivery: boolean;
}) {
  // The two family names are the one piece of page furniture that is already
  // translated in all eleven locales — they labelled the plan groups on the home
  // page before the plans moved here. Reused rather than retyped in English.
  const t = useT();
  if (!hasDelivery) return null;
  const tab = (value: Family, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={family === value}
      className={
        family === value
          ? "mono rounded-[8px] bg-amber px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-on-amber"
          : "mono rounded-[8px] px-4 py-2.5 text-[11px] uppercase tracking-widest text-fog transition-colors hover:text-chalk"
      }
    >
      {label}
    </button>
  );
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-[10px] border border-line bg-ink-2 p-1">
      {tab("evidence", t("home.pricing.evidenceGroup"))}
      {tab("delivery", t("home.pricing.deliveryGroup"))}
    </div>
  );
}

export default function Pricing() {
  const t = useT();
  const { locale } = useLocale();
  const plans = usePlans(locale);
  const [family, setFamily] = useState<Family>("evidence");

  const all = plans.data ?? [];
  // "enterprise" is the custom top of the delivery ladder ("Everything in Delivery
  // Fleet") without being a delivery plan itself, so it has to be placed by hand.
  // It is a card in the delivery grid, immediately after Delivery Fleet 500 — the
  // ladder reads straight through to the custom tier instead of stopping at 500 and
  // starting again in a band underneath. The evidence family's own custom tier,
  // "enterprise-field", already sits in its grid the same way.
  const custom = all.find((plan) => plan.id === "enterprise") ?? null;
  const evidence = all.filter((plan) => !isDeliveryPlan(plan.id) && plan.id !== "enterprise");
  const delivery = all.filter((plan) => isDeliveryPlan(plan.id));
  // Two arrays on purpose. The cards carry Enterprise; the comparison columns do
  // not, because every cell of it would read "custom" — its limits are agreed, not
  // listed, which is what the note under the table says.
  const columns = family === "evidence" ? evidence : delivery;
  const cards = family === "evidence" ? evidence : custom ? [...delivery, custom] : delivery;

  const groups =
    family === "evidence"
      ? COMPARE
      : // The evidence rows still apply to a Delivery plan — a driver's proof photo
        // is a verified capture — but the job photo system is off, so the group that
        // is only about projects and reports would read as a column of dashes.
        COMPARE.filter((group) => group.title !== "Team, reports and sharing");

  return (
    <LandingPage
      path="/pricing"
      eyebrow="Plans & pricing"
      h1="Start free. Pay when the crew grows, not before."
      sub="Verified capture is free forever — no card, no expiry date. Everything above it is priced on what actually costs us something: how much you shoot, how many people sign in, and how many doors you knock on."
      center
    >
      <LandingSection
        id="plans"
        center
        label="01 — The plans"
        h2="Two families, priced on two different things."
        intro="Evidence plans are sized by captures, video and seats. Delivery plans are sized by stops and drivers, and include everything the evidence plans verify. Pick the one that matches the work."
      >
        <FamilySwitch family={family} onChange={setFamily} hasDelivery={delivery.length > 0} />

        {plans.isLoading ? (
          <div className="mt-8 grid gap-px bg-line sm:grid-cols-2 md:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-80 animate-pulse bg-ink-2" />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-px bg-line sm:grid-cols-2 md:grid-cols-3">
              {cards.map((plan) => (
                <PlanCard key={plan.id} plan={plan} popular={plan.id === "business"} />
              ))}
              {/* The grid paints its hairlines through 1px gaps in a `bg-line`
                  container, so an incomplete last row would render every empty cell
                  as a solid grey slab. Card-coloured fillers, toggled per breakpoint
                  because a hidden grid item occupies no cell. */}
              {Array.from({ length: (2 - (cards.length % 2)) % 2 }, (_, i) => (
                <div key={`fill2-${i}`} aria-hidden className="hidden bg-ink sm:block md:hidden" />
              ))}
              {Array.from({ length: (3 - (cards.length % 3)) % 3 }, (_, i) => (
                <div key={`fill3-${i}`} aria-hidden className="hidden bg-ink md:block" />
              ))}
            </div>
          </>
        )}

        <p className="mx-auto mt-6 max-w-[760px] text-[13px] leading-relaxed text-fog">
          Prices are in USD per month, billed per workspace rather than per seat — a five-seat plan
          is one bill, not five. Need SSO, a signed DPA or procurement paperwork? That is Enterprise
          on any volume:{" "}
          <a href={`mailto:${SALES_EMAIL}`} className="text-amber hover:underline">
            {SALES_EMAIL}
          </a>
          .
        </p>
      </LandingSection>

      <LandingSection
        center
        label="02 — On every plan"
        h2="The proof does not get better when you pay us."
        intro="Plenty of tools put the trustworthy version behind the top tier. Here is what a free workspace gets that an Enterprise one does not get more of."
      >
        <LandingCards items={SAME_FOR_EVERYONE} center />
      </LandingSection>

      <LandingSection
        id="compare"
        center
        label="03 — Compare"
        h2="Every limit, plan against plan."
        intro="Read straight from the plan catalogue our own enforcement code reads, so a number here is the number that applies to your workspace."
      >
        <FamilySwitch family={family} onChange={setFamily} hasDelivery={delivery.length > 0} />

        {/* A comparison table is wide by nature. Rather than shrink the type until
            nothing is readable, it scrolls sideways with the feature column pinned,
            which is how a spreadsheet is read on a phone. */}
        <div className="mt-8 overflow-x-auto scrollbar-none">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th
                  scope="col"
                  className="mono sticky start-0 z-10 bg-ink py-3 pe-4 text-[11px] uppercase tracking-widest text-fog"
                >
                  Feature
                </th>
                {columns.map((plan) => (
                  <th key={plan.id} scope="col" className="px-3 py-3 text-center align-bottom">
                    <span className="mono block text-[11px] uppercase tracking-[0.18em] text-amber">
                      {plan.name}
                    </span>
                    <span className="mt-1 block font-display text-[17px] font-bold text-chalk">
                      {plan.priceLabel}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.title}>
                <tr>
                  {/* The band spans every column, so the cell itself cannot be the
                      sticky element — a sticky box already as wide as its containing
                      block has nowhere to slide to, and the group name scrolled out of
                      sight with the columns. The label inside it is what sticks. */}
                  <th scope="colgroup" colSpan={columns.length + 1} className="bg-ink-2 p-0">
                    <span className="mono sticky start-0 inline-block px-3 py-2 text-[10.5px] uppercase tracking-[0.2em] text-amber">
                      {group.title}
                    </span>
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label} className="border-b border-line align-top">
                    <th scope="row" className="sticky start-0 z-10 bg-ink py-3 pe-4 font-normal">
                      <span className="block text-[13.5px] text-chalk">{row.label}</span>
                      {row.note && (
                        <span className="mt-0.5 block max-w-[320px] text-[12px] leading-snug text-fog">
                          {row.note}
                        </span>
                      )}
                    </th>
                    {columns.map((plan) => (
                      <td key={plan.id} className="px-3 py-3 text-center">
                        <CompareCell value={row.value(plan)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <p className="mx-auto mt-5 max-w-[760px] text-[13px] leading-relaxed text-fog">
          {family === "delivery" && custom
            ? `${custom.name} is not in the table on purpose — its limits are set with you, not picked from a list.`
            : null}{" "}
          Full detail on what each allowance means lives in the{" "}
          <a href="/help/plans-billing" className="text-amber hover:underline">
            plans and billing help
          </a>
          .
        </p>
      </LandingSection>

      <LandingSection id="faq" center label="04 — Questions" h2="What people ask before they pay.">
        <LandingFaq entries={FAQ} center />
      </LandingSection>

      <LandingCta
        h2="Shoot one verified photo before you decide anything."
        body="The free plan takes a minute to start and never asks for a card. If it holds up on your next job, the paid plans are there."
        primary={{ label: t("home.nav.signUp"), to: "/sign-up" }}
        secondary={{ label: t("getapp.ctaPrimary"), to: "/get-app" }}
      />
    </LandingPage>
  );
}
