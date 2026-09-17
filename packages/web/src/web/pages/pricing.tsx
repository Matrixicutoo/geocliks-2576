import { useState } from "react";
import { Check, Fingerprint, Minus, ShieldCheck, WifiOff } from "lucide-react";
import {
  LandingCards,
  LandingCta,
  LandingFaq,
  LandingPage,
  LandingSection,
} from "../components/landing-page";
import { PlanCard, PlanWideBand, isDeliveryPlan, type PlanView } from "../components/plan-cards";
import { useLocale, useT } from "../lib/i18n";
import { usePlans } from "../queries/billing";
import { SALES_EMAIL } from "../lib/support";
import { breadcrumbSchema, faqSchema } from "../lib/structured-data";

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

const FAQ = [
  {
    question: "Is the free plan really free?",
    answer:
      "Yes, and it does not expire. Free covers 300 captures a month, three projects, one seat, two watermark templates, 30-second video clips for the first three days, and a PDF export of up to 20 photos. No card is asked for.",
  },
  {
    question: "What counts as a seat?",
    answer:
      "One person who can sign in to your workspace, whatever their role — the owner included. A pending invitation holds a seat until it is accepted or revoked, otherwise ten invites could be sent against two seats and everyone who accepted would be over the plan.",
  },
  {
    question: "Do paid plans verify photos better than the free one?",
    answer:
      "No. The watermark data, the photo code and the seal are identical on every plan. What you pay for is volume, video length, teamspace, exports, sharing and delivery routing — never the proof itself.",
  },
  {
    question: "Which plans include delivery routes?",
    answer:
      "Plus and above carry a monthly stop allowance, so you can run routes without leaving the evidence plans. If driving is most of the work, the Delivery plans cost far less per stop and add live dispatch, the smart optimizer and more drivers.",
  },
  {
    question: "How are delivery stops counted?",
    answer:
      "Per calendar month, resetting on the 1st. A stop counts when it is added to a route, whether or not it ends up delivered. Going over the allowance stops new route building until the next month, so pick the plan that covers your busiest week rather than your average one.",
  },
  {
    question: "Is there a trial on the Delivery plans?",
    answer:
      "Every Delivery plan starts with a free trial, which is why its button reads Free trial. The trial is once per workspace, not once per plan — moving from one Delivery plan to another bills straight away.",
  },
  {
    question: "Can I change plan later?",
    answer:
      "Any time, from Billing in your workspace settings, and only the owner can do it. Moving up applies immediately and nothing already captured is touched. Moving down is refused while your workspace is bigger than the target plan — you are asked to remove members first instead of three people being cut off silently.",
  },
  {
    question: "What happens to my photos if I cancel?",
    answer:
      "They are not deleted, and verification keeps working. The paid features stop: Excel, ZIP and KMZ exports, share links, teamspace and delivery routes. Export anything you need outside GeoCliks before you cancel — on Free you are back to a PDF of 20 photos.",
  },
  {
    question: "How is payment handled, and where are the invoices?",
    answer:
      "Through our payment processor over a hosted checkout — your card number never reaches GeoCliks' servers. Every payment produces an invoice in the billing portal, where you can also add your company name and tax details.",
  },
  {
    question: "What if we are bigger than Crew 25 or Fleet 500?",
    answer:
      `Then the plan is a conversation. Enterprise covers custom volumes, custom terms, and the governance a multi-site operation needs. Email ${SALES_EMAIL} with your team size, industry and regions and we will size it with you.`,
  },
];

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
  // Fleet") and is not itself a delivery plan, so it would leave dead cells in the
  // 3-column grid. It trails the delivery family as a full-width band, the way it
  // does on the home page. The evidence family's custom tier is "enterprise-field",
  // which is a normal card in that grid.
  const custom = all.find((plan) => plan.id === "enterprise") ?? null;
  const evidence = all.filter((plan) => !isDeliveryPlan(plan.id) && plan.id !== "enterprise");
  const delivery = all.filter((plan) => isDeliveryPlan(plan.id));
  const shown = family === "evidence" ? evidence : delivery;

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
      jsonLd={[faqSchema(FAQ), breadcrumbSchema([{ name: "Pricing" }])]}
    >
      <LandingSection
        id="plans"
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
              {shown.map((plan) => (
                <PlanCard key={plan.id} plan={plan} popular={plan.id === "business"} />
              ))}
              {/* The grid paints its hairlines through 1px gaps in a `bg-line`
                  container, so an incomplete last row would render every empty cell
                  as a solid grey slab. Card-coloured fillers, toggled per breakpoint
                  because a hidden grid item occupies no cell. */}
              {Array.from({ length: (2 - (shown.length % 2)) % 2 }, (_, i) => (
                <div key={`fill2-${i}`} aria-hidden className="hidden bg-ink sm:block md:hidden" />
              ))}
              {Array.from({ length: (3 - (shown.length % 3)) % 3 }, (_, i) => (
                <div key={`fill3-${i}`} aria-hidden className="hidden bg-ink md:block" />
              ))}
            </div>
            {/* Only under Delivery, exactly as on the home page. The evidence family
                has its own custom tier ("Enterprise Field") sitting in the grid as a
                normal card, so showing this band there too reads as two Enterprises. */}
            {family === "delivery" && custom && <PlanWideBand plan={custom} />}
          </>
        )}

        <p className="mt-6 text-[13px] leading-relaxed text-fog">
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
        label="02 — On every plan"
        h2="The proof does not get better when you pay us."
        intro="Plenty of tools put the trustworthy version behind the top tier. Here is what a free workspace gets that an Enterprise one does not get more of."
      >
        <LandingCards items={SAME_FOR_EVERYONE} />
      </LandingSection>

      <LandingSection
        id="compare"
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
                {shown.map((plan) => (
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
                  <th scope="colgroup" colSpan={shown.length + 1} className="bg-ink-2 p-0">
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
                    {shown.map((plan) => (
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

        <p className="mt-5 text-[13px] leading-relaxed text-fog">
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

      <LandingSection id="faq" label="04 — Questions" h2="What people ask before they pay.">
        <LandingFaq entries={FAQ} />
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
