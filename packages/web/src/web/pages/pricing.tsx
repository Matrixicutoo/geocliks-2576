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
import { useLocale, useT, type TKey, type Translate } from "../lib/i18n";
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
 * The page's own furniture — section headings, row labels, notes, the FAQ — is
 * translated through the catalogs like every other marketing page. What is not
 * translated here is the plan data itself: names, taglines, feature bullets and
 * the price come back from the API already localized, so restating them in a
 * catalog would be a second price list to keep truthful.
 */

/** Which family of plans the cards and the table are showing. */
type Family = "evidence" | "delivery";

/** A comparison cell: a tick, a dash, or a value. */
type Cell = boolean | string;

interface CompareRow {
  label: TKey;
  /** What this row reads off one plan. Given `t` for the rows that render words. */
  value: (plan: PlanView, t: Translate) => Cell;
  /** Shown under the label, for the rows people misread. */
  note?: TKey;
}

interface CompareGroup {
  title: TKey;
  rows: CompareRow[];
}

/** "-1" means unlimited everywhere in `PlanLimits`. 0 means not included. */
const count = (n: number, t: Translate, unit?: string) => {
  if (n < 0) return t("pr.cell.unlimited");
  if (n === 0) return false;
  const value = n.toLocaleString("en-US");
  return unit ? `${value} ${unit}` : value;
};

const minutes = (seconds: number, t: Translate) =>
  seconds >= 60
    ? t("pr.cell.min", { n: Math.round(seconds / 60) })
    : t("pr.cell.sec", { n: seconds });

/** Export formats are file-type abbreviations, not prose, so they are not translated. */
const EXPORT_LABELS: Record<string, string> = {
  pdf: "PDF",
  xlsx: "Excel",
  zip: "ZIP",
  kmz: "KMZ",
};

const COMPARE: CompareGroup[] = [
  {
    title: "pr.group.verification",
    rows: [
      {
        label: "pr.row.verified.label",
        note: "pr.row.verified.note",
        value: () => true,
      },
      { label: "pr.row.photoCode.label", value: () => true },
      { label: "pr.row.publicPage.label", value: () => true },
      {
        label: "pr.row.offline.label",
        note: "pr.row.offline.note",
        value: () => true,
      },
    ],
  },
  {
    title: "pr.group.capture",
    rows: [
      {
        label: "pr.row.captures.label",
        value: (plan, t) => count(plan.limits.photosPerMonth, t),
      },
      {
        label: "pr.row.videoClip.label",
        value: (plan, t) => minutes(plan.limits.videoMaxSeconds, t),
      },
      {
        label: "pr.row.videoAvailable.label",
        note: "pr.row.videoAvailable.note",
        value: (plan, t) =>
          plan.limits.videoTrialDays === 0
            ? t("pr.cell.alwaysOn")
            : t("pr.cell.firstDays", { days: plan.limits.videoTrialDays }),
      },
      { label: "pr.row.projects.label", value: (plan, t) => count(plan.limits.projects, t) },
      { label: "pr.row.templates.label", value: (plan, t) => count(plan.limits.templates, t) },
      { label: "pr.row.branding.label", value: (plan) => plan.limits.branding },
    ],
  },
  {
    title: "pr.group.team",
    rows: [
      {
        label: "pr.row.seats.label",
        note: "pr.row.seats.note",
        value: (plan, t) => count(plan.limits.seats, t),
      },
      {
        label: "pr.row.teamspace.label",
        note: "pr.row.teamspace.note",
        value: (plan) => plan.limits.teamspace,
      },
      { label: "pr.row.roles.label", value: (plan) => plan.limits.roles },
      { label: "pr.row.shareLinks.label", value: (plan) => plan.limits.shareLinks },
      {
        label: "pr.row.exports.label",
        value: (plan) =>
          plan.limits.exports.length === 0
            ? false
            : plan.limits.exports.map((format) => EXPORT_LABELS[format] ?? format).join(", "),
      },
      {
        label: "pr.row.reports.label",
        note: "pr.row.reports.note",
        value: (plan) => plan.limits.fieldEnabled,
      },
    ],
  },
  {
    title: "pr.group.delivery",
    rows: [
      {
        label: "pr.row.stops.label",
        note: "pr.row.stops.note",
        value: (plan, t) => count(plan.limits.deliveryStopsPerMonth, t),
      },
      { label: "pr.row.drivers.label", value: (plan, t) => count(plan.limits.deliveryDrivers, t) },
      {
        label: "pr.row.dispatch.label",
        note: "pr.row.dispatch.note",
        value: (plan) => plan.limits.deliveryDispatch,
      },
      {
        label: "pr.row.optimizer.label",
        note: "pr.row.optimizer.note",
        value: (plan) => plan.limits.deliverySmartOptimize,
      },
      { label: "pr.row.tracking.label", value: (plan) => plan.limits.deliveryTracking },
      { label: "pr.row.signature.label", value: (plan) => plan.limits.deliverySignature },
    ],
  },
];

const SAME_FOR_EVERYONE: { icon: typeof ShieldCheck; title: TKey; body: TKey }[] = [
  {
    icon: ShieldCheck,
    title: "pr.same1.title",
    body: "pr.same1.body",
  },
  {
    icon: Fingerprint,
    title: "pr.same2.title",
    body: "pr.same2.body",
  },
  {
    icon: WifiOff,
    title: "pr.same3.title",
    body: "pr.same3.body",
  },
];

/** A tick, a dash, or the number itself. */
function CompareCell({ value }: { value: Cell }) {
  const t = useT();
  if (value === true)
    return (
      <>
        <Check className="mx-auto size-4 text-verified" aria-hidden />
        <span className="sr-only">{t("pr.cell.included")}</span>
      </>
    );
  if (value === false)
    return (
      <>
        <Minus className="mx-auto size-4 text-steel" aria-hidden />
        <span className="sr-only">{t("pr.cell.notIncluded")}</span>
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
  // The two family names labelled the plan groups on the home page before the
  // plans moved here, so they are reused rather than keyed again.
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
  const { t, locale } = useLocale();
  const plans = usePlans(locale);
  const [family, setFamily] = useState<Family>("evidence");
  const faq = pageFaq("/pricing", locale);

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
        COMPARE.filter((group) => group.title !== "pr.group.team");

  return (
    <LandingPage path="/pricing" eyebrow={t("pr.eyebrow")} h1={t("pr.h1")} sub={t("pr.sub")} center>
      <LandingSection
        id="plans"
        center
        label={t("pr.s1.label")}
        h2={t("pr.s1.h2")}
        intro={t("pr.s1.intro")}
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
          {t("pr.plansNote")}{" "}
          <a href={`mailto:${SALES_EMAIL}`} className="text-amber hover:underline">
            {SALES_EMAIL}
          </a>
          .
        </p>
      </LandingSection>

      <LandingSection center label={t("pr.s2.label")} h2={t("pr.s2.h2")} intro={t("pr.s2.intro")}>
        <LandingCards
          items={SAME_FOR_EVERYONE.map((item) => ({
            icon: item.icon,
            title: t(item.title),
            body: t(item.body),
          }))}
          center
        />
      </LandingSection>

      <LandingSection
        id="compare"
        center
        label={t("pr.s3.label")}
        h2={t("pr.s3.h2")}
        intro={t("pr.s3.intro")}
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
                  {t("pr.table.feature")}
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
                      {t(group.title)}
                    </span>
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label} className="border-b border-line align-top">
                    <th scope="row" className="sticky start-0 z-10 bg-ink py-3 pe-4 font-normal">
                      <span className="block text-[13.5px] text-chalk">{t(row.label)}</span>
                      {row.note && (
                        <span className="mt-0.5 block max-w-[320px] text-[12px] leading-snug text-fog">
                          {t(row.note)}
                        </span>
                      )}
                    </th>
                    {columns.map((plan) => (
                      <td key={plan.id} className="px-3 py-3 text-center">
                        <CompareCell value={row.value(plan, t)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <p className="mx-auto mt-5 max-w-[760px] text-[13px] leading-relaxed text-fog">
          {family === "delivery" && custom ? t("pr.tableNote.custom", { name: custom.name }) : null}{" "}
          {t("pr.tableNote.lead")}{" "}
          <a href="/help/plans-billing" className="text-amber hover:underline">
            {t("pr.tableNote.link")}
          </a>
          .
        </p>
      </LandingSection>

      <LandingSection id="faq" center label={t("pr.faqSection.label")} h2={t("pr.faqSection.h2")}>
        <LandingFaq entries={faq} center />
      </LandingSection>

      <LandingCta
        h2={t("pr.cta.h2")}
        body={t("pr.cta.body")}
        primary={{ label: t("home.nav.signUp"), to: "/sign-up" }}
        secondary={{ label: t("getapp.ctaPrimary"), to: "/get-app" }}
      />
    </LandingPage>
  );
}
