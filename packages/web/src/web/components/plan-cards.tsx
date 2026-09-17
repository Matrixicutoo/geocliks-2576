import { Link } from "wouter";
import { Check } from "lucide-react";
import type { usePlans } from "../queries/billing";
import { useT } from "../lib/i18n";
import { SALES_EMAIL } from "../lib/support";

/**
 * The plan card, shared by the home page's plans section and `/pricing`.
 *
 * It lived inside `pages/index.tsx` until the dedicated pricing page needed the
 * same card. Two copies of a priced button is exactly the thing that drifts —
 * one gets the trial wording, the other keeps saying "Choose" — so the card and
 * the custom-plan band moved here and both pages render these.
 *
 * Plan copy itself is never written here: it comes from `billing.plans`, which
 * is the same table the enforcement code reads, already localized.
 */

/** One plan as the public catalogue returns it. */
export type PlanView = NonNullable<ReturnType<typeof usePlans>["data"]>[number];

/** Delivery plans are sold alongside the evidence plans, not inside them. */
export const isDeliveryPlan = (id: string) => id.startsWith("delivery-");

export function PlanCard({ plan, popular = false }: { plan: PlanView; popular?: boolean }) {
  const t = useT();

  return (
    <div className={popular ? "relative bg-ink-2 p-6" : "relative bg-ink p-6"}>
      {popular && (
        <span className="rounded-[6px] mono absolute right-0 top-0 bg-amber px-2 py-1 text-[9.5px] font-bold uppercase tracking-widest text-on-amber">
          {t("home.pricing.popular")}
        </span>
      )}
      <p className="mono text-[11px] uppercase tracking-[0.2em] text-amber">{plan.name}</p>
      <p className="mt-3 font-display text-3xl font-bold text-chalk">{plan.priceLabel}</p>
      <p className="mono mt-1 text-[10.5px] uppercase tracking-widest text-fog">
        {plan.priceCents > 0 ? plan.period : " "}
      </p>
      <p className="mt-2 min-h-10 text-[13px] text-fog">{plan.tagline}</p>
      <ul className="mt-5 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2 text-[13px] text-chalk">
            <Check className="mt-0.5 size-3.5 shrink-0 text-verified" />
            {feature}
          </li>
        ))}
      </ul>
      {/* A custom-priced plan (Enterprise, Enterprise Field) has no self-serve
          checkout — its CTA opens a mail draft to sales instead of the sign-in
          flow. The address is printed under the button so it can be copied or
          dialled by people who don't use a mail client on that device.
          Keyed off the price, not the id, so any future custom plan gets the
          right CTA without another edit here. */}
      {plan.priceCents < 0 ? (
        <>
          <a
            href={`mailto:${SALES_EMAIL}?subject=${encodeURIComponent(`GeoCliks ${plan.name} plan`)}`}
            className="mono mt-6 block rounded-[8px] border border-line px-3 py-2.5 text-center text-[11px] uppercase tracking-widest text-chalk transition-colors hover:border-amber/60"
          >
            {t("home.pricing.talk")}
          </a>
          <a
            href={`mailto:${SALES_EMAIL}`}
            className="mono mt-2 block text-center text-[11px] text-amber transition-colors hover:text-chalk"
          >
            {SALES_EMAIL}
          </a>
        </>
      ) : (
        /* Every plan CTA is a solid amber button that inverts to near-black
           on hover, so no plan's button reads as secondary.
           `on-amber` (#0b0e13) not `ink`: the palette is theme-aware and
           `ink` is #ffffff in the light theme these pages pin, so `text-ink`
           here would be white-on-orange and `hover:bg-ink` would fade the
           button to white instead of black. `on-amber` and `amber` are the
           only two tokens that hold the same value in both themes. */
        <Link
          to="/sign-up"
          className="mono mt-6 block rounded-[8px] bg-amber px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-on-amber transition-colors hover:bg-on-amber hover:text-amber"
        >
          {/* Delivery plans carry a 7-day free trial in Autumn, so their
              CTA names the trial rather than a generic "Choose". */}
          {isDeliveryPlan(plan.id) ? t("home.pricing.freeTrial") : t("home.pricing.choose")}
        </Link>
      )}
    </div>
  );
}

/**
 * A custom-priced plan as a full-width band instead of a grid cell.
 *
 * Enterprise is the custom top of the ladder and trails every self-serve plan.
 * Dropping it into the 3-column grid left two dead cells that rendered as a
 * grey slab, so it gets the width of the row and lays its features out in two
 * columns beside the price.
 */
export function PlanWideBand({ plan }: { plan: PlanView }) {
  const t = useT();

  return (
    <div className="border-t border-line bg-ink p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="md:max-w-[320px]">
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-amber">{plan.name}</p>
          <p className="mt-3 font-display text-3xl font-bold text-chalk">{plan.priceLabel}</p>
          <p className="mt-2 text-[13px] text-fog">{plan.tagline}</p>
        </div>
        <ul className="grid flex-1 gap-2 sm:grid-cols-2 md:mx-8">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-[13px] text-chalk">
              <Check className="mt-0.5 size-3.5 shrink-0 text-verified" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="md:w-[220px] md:shrink-0">
          {/* No self-serve checkout on a custom plan — the CTA opens a mail draft. */}
          <a
            href={`mailto:${SALES_EMAIL}?subject=${encodeURIComponent(`GeoCliks ${plan.name} plan`)}`}
            className="mono block rounded-[8px] bg-amber px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-on-amber transition-colors hover:bg-on-amber hover:text-amber"
          >
            {t("home.pricing.talk")}
          </a>
          <a
            href={`mailto:${SALES_EMAIL}`}
            className="mono mt-2 block text-center text-[11px] text-amber transition-colors hover:text-chalk"
          >
            {SALES_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}
