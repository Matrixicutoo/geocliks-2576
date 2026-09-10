import { Fragment, useEffect, useRef, useState } from "react";
import { Check, CreditCard, Loader2, Mail } from "lucide-react";
import { useCustomer } from "autumn-js/react";
import { DashboardShell } from "../components/dashboard-shell";
import { useBilling, useChangePlan, useSyncProcessor } from "../queries/billing";
import { cn } from "../lib/utils";
import { useLocale, useT } from "../lib/i18n";
import { canManageWorkspace } from "../lib/roles";

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 6 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const hot = !unlimited && pct >= 85;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="label text-fog">{label}</span>
        <span className="mono text-[11px] text-chalk">
          {used.toLocaleString()} / {unlimited ? "∞" : limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 w-full bg-ink-3">
        <div
          className={cn("h-full transition-all", hot ? "bg-alert" : "bg-amber")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AppBilling() {
  const t = useT();
  const { locale } = useLocale();
  const billing = useBilling(locale);
  const change = useChangePlan();
  const sync = useSyncProcessor();
  const { attach } = useCustomer();
  const [error, setError] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const synced = useRef(false);

  const data = billing.data;
  const current = data?.plan;
  const isOwner = data?.role === "owner";
  // Only the workspace owner changes the plan, so field crews never see the grid at all.
  const isField = !canManageWorkspace(data?.role);

  // Stripe checkout returns here — read the subscription back from the processor.
  useEffect(() => {
    if (synced.current || !isOwner) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;
    synced.current = true;
    sync
      .mutateAsync({})
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => window.history.replaceState({}, "", "/app/billing"));
  }, [isOwner, sync]);

  return (
    <DashboardShell title={t("billing.title")} subtitle={t("billing.subtitle")}>
      {isField ? (
        <div className="rounded-[12px] border border-line bg-ink-2 p-6">
          <p className="font-display text-[17px] font-semibold text-chalk">
            {t("perm.managerOnly")}
          </p>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-fog">{t("perm.planNote")}</p>
        </div>
      ) : billing.isLoading || !data || !current ? (
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-[12px] border border-line bg-ink-2" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-[12px] border border-line bg-ink-2"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 rounded-[12px] border border-line bg-ink-2 p-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="rounded-[12px] border border-amber/40 bg-amber/10 p-4">
              <p className="label text-amber">{t("billing.current")}</p>
              <p className="mt-1 font-display text-2xl font-bold text-chalk">{current.name}</p>
              <p className="mono mt-1 text-[11px] text-fog">
                {current.priceCents > 0
                  ? `${current.priceLabel} / ${current.period}`
                  : current.priceLabel}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-fog">{current.tagline}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Meter
                label={t("billing.photosMonth")}
                used={data.usage.photosThisMonth}
                limit={current.limits.photosPerMonth}
              />
              <Meter
                label={t("billing.projects")}
                used={data.usage.projects}
                limit={current.limits.projects}
              />
              <Meter
                label={t("billing.seats")}
                used={data.usage.members}
                limit={current.limits.seats}
              />
              <div>
                <p className="label mb-1.5 text-fog">{t("billing.photosStored")}</p>
                <p className="mono text-[18px] text-chalk">
                  {data.usage.photosTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-[8px] mono border border-alert/40 bg-alert/10 px-3 py-2 text-[11.5px] text-alert">
              {error}
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.plans.map((plan, index) => {
              const active = plan.id === current.id;
              // No processor product means there is nothing to check out with, so the
              // card must not promise a card payment. Covers Enterprise (custom price)
              // and any paid plan whose Autumn/Stripe product has not been pushed yet.
              const contactOnly = plan.priceCents !== 0 && !plan.autumnPlanId;
              // Delivery is a separate product line, so the grid gets a full-width
              // divider before the first delivery plan instead of running all the
              // cards together as one undifferentiated wall.
              const delivery = plan.id.startsWith("delivery-");
              const firstDelivery = delivery && !data.plans[index - 1]?.id.startsWith("delivery-");
              // Every Delivery plan carries a 7-day trial in Autumn, but a trial is
              // granted per customer, not per plan: a workspace already ON a Delivery
              // plan that switches to another one is billed immediately. Naming the
              // trial on that button would promise money behaviour we cannot honour,
              // so the label only appears for workspaces coming from a non-delivery
              // plan. Autumn still has the final say on eligibility.
              const trial = delivery && !current.id.startsWith("delivery-") && !contactOnly;
              return (
                <Fragment key={plan.id}>
                  {firstDelivery && (
                    <div className="col-span-full mt-2 border-t border-line pt-4">
                      <p className="mono text-[11px] uppercase tracking-[0.2em] text-amber">
                        {t("billing.deliveryGroup")}
                      </p>
                      <p className="mt-1 text-[12.5px] text-fog">{t("billing.deliveryNote")}</p>
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-[12px] flex flex-col border bg-ink-2 p-5",
                      active ? "border-amber" : "border-line",
                    )}
                  >
                    <p className="font-display text-[17px] font-bold text-chalk">{plan.name}</p>
                    <p className="mono mt-1 text-[11px] uppercase tracking-widest text-amber">
                      {plan.priceCents > 0
                        ? `${plan.priceLabel} / ${plan.period}`
                        : plan.priceLabel}
                    </p>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-fog">{plan.tagline}</p>

                    <ul className="mt-4 flex-1 space-y-1.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-[12.5px] text-chalk"
                        >
                          <Check className="mt-0.5 size-3.5 shrink-0 text-verified" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      disabled={active || pendingPlan !== null || !isOwner}
                      onClick={async () => {
                        setError(null);
                        setPendingPlan(plan.id);
                        try {
                          // Paid plan with a processor product → Stripe checkout via Autumn.
                          if (plan.priceCents > 0 && plan.autumnPlanId) {
                            await attach({
                              planId: plan.autumnPlanId,
                              successUrl: `${window.location.origin}/app/billing?checkout=success`,
                            });
                            await sync.mutateAsync({});
                            return;
                          }
                          // Free plan and contact-sales stay in-app.
                          const res = await change.mutateAsync({ plan: plan.id });
                          if (res.contact && "mailto" in res && res.mailto) {
                            window.location.href = res.mailto;
                          }
                        } catch (err) {
                          setError(err instanceof Error ? err.message : String(err));
                        } finally {
                          setPendingPlan(null);
                        }
                      }}
                      className={cn(
                        "rounded-[8px] mt-5 inline-flex items-center justify-center gap-2 px-3 py-2.5 text-[13px] font-semibold transition-colors disabled:opacity-50",
                        active
                          ? "border border-line bg-ink text-fog"
                          : contactOnly
                            ? "border border-amber/50 bg-transparent text-amber hover:bg-amber/10"
                            : "bg-amber text-ink",
                      )}
                    >
                      {change.isPending && <Loader2 className="size-3.5 animate-spin" />}
                      {active ? (
                        t("billing.current")
                      ) : contactOnly ? (
                        <>
                          <Mail className="size-3.5" /> {t("billing.talk")}
                        </>
                      ) : (
                        <>
                          <CreditCard className="size-3.5" />{" "}
                          {trial
                            ? t("home.pricing.freeTrial")
                            : t("billing.switchTo", { plan: plan.name })}
                        </>
                      )}
                    </button>
                  </div>
                </Fragment>
              );
            })}
          </div>

          <p className="text-[12.5px] text-fog">
            {t("billing.supportPre")}{" "}
            <a href={`mailto:${data.supportEmail}`} className="text-amber hover:underline">
              {data.supportEmail}
            </a>
            . {t("billing.effect")}{" "}
            {data.role === "owner" ? t("billing.youOwner") : t("billing.ownerOnly")}
          </p>
        </div>
      )}
    </DashboardShell>
  );
}
