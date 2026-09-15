import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronRight, Loader2, Rocket } from "lucide-react";
import { useAckSetup, useOrg } from "../queries/orgs";
import { useCreateRoute, useRoutes } from "../queries/routes";
import { orpc } from "../lib/api";
import { useT, type TKey } from "../lib/i18n";
import { cn } from "../lib/utils";
import { MobilePopup, Popup } from "./setup-checklist";
import { AssignDriverDialog } from "./assign-driver-dialog";
import { InviteDialog } from "./invite-form";

/**
 * First-run checklist for a delivery workspace, in the spot a new signup lands on — the runs
 * list, the way the field one sits on Teamspace.
 *
 * Same contract as SetupChecklist: every row is derived server-side from work that actually
 * exists (`org.setup`) rather than from a "you clicked this" flag, so it ticks off whoever did
 * the work, on the web or on a phone, and a workspace that was already running deliveries
 * before this card existed opens with it complete and never sees it.
 *
 * The two steps whose work happens somewhere we cannot see — the app being installed, and the
 * first drop closed out on the road — are the only ones that tick on closing their popup.
 */

type StepKey = "run" | "stops" | "crew" | "driver" | "mobile" | "drop";

const STEPS: { key: StepKey; title: TKey; sub: TKey }[] = [
  { key: "run", title: "runhelp.run", sub: "runhelp.runSub" },
  { key: "stops", title: "runhelp.stops", sub: "runhelp.stopsSub" },
  { key: "crew", title: "runhelp.crew", sub: "runhelp.crewSub" },
  { key: "driver", title: "runhelp.driver", sub: "runhelp.driverSub" },
  { key: "mobile", title: "runhelp.mobile", sub: "runhelp.mobileSub" },
  { key: "drop", title: "runhelp.drop", sub: "runhelp.dropSub" },
];

/**
 * Step 1 — the first run, built right here. Two fields only: everything else on the full form
 * has a sane default, and a first run exists to be looked at, not tuned.
 */
function RunPopup({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [, navigate] = useLocation();
  const create = useCreateRoute();
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (created) {
    return (
      <Popup title={t("runhelp.runTitle")} onClose={onClose} t={t}>
        <div className="px-5 py-4">
          <p className="text-[13px] leading-relaxed text-fog">{t("runhelp.runCreated")}</p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate(`/app/routes/${created}`)}
              className="mono w-full rounded-[8px] bg-amber px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-ink"
            >
              {t("runhelp.runAddStops")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mono w-full rounded-[8px] border border-line px-4 py-2.5 text-[11px] uppercase tracking-widest text-fog hover:text-chalk"
            >
              {t("runhelp.later")}
            </button>
          </div>
        </div>
      </Popup>
    );
  }

  return (
    <Popup title={t("runhelp.runTitle")} onClose={onClose} t={t}>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          try {
            const route = await create.mutateAsync({ name: name.trim(), date, mode: "planned" });
            setCreated(route.id);
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
        }}
        className="px-5 py-4"
      >
        <p className="text-[13px] leading-relaxed text-fog">{t("runhelp.runBody")}</p>

        <label className="mt-4 block">
          <span className="label">{t("routes.fName")}</span>
          <input
            aria-label={t("routes.fName")}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Monday — West End"
            className="mt-1.5 w-full rounded-[8px] border border-line bg-ink px-3 py-2 text-[13.5px] text-chalk outline-none focus:border-amber"
          />
        </label>

        <label className="mt-3 block">
          <span className="label">{t("routes.fDate")}</span>
          <input
            aria-label={t("routes.fDate")}
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1.5 w-full rounded-[8px] border border-line bg-ink px-3 py-2 text-[13.5px] text-chalk outline-none focus:border-amber"
          />
        </label>

        {error ? <p className="mono mt-3 text-[11px] text-alert">{error}</p> : null}

        <button
          type="submit"
          disabled={create.isPending}
          className="mono mt-4 flex w-full items-center justify-center gap-2 rounded-[8px] bg-amber px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-ink disabled:opacity-60"
        >
          {create.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
          {t("runhelp.runCreate")}
        </button>
      </form>
    </Popup>
  );
}

/** Steps 2 — the stops themselves. Pasting a list lives on the run page, so this points at it. */
function StopsPopup({ routeId, onClose }: { routeId: string | null; onClose: () => void }) {
  const t = useT();
  const [, navigate] = useLocation();
  return (
    <Popup title={t("runhelp.stopsTitle")} onClose={onClose} t={t}>
      <div className="px-5 py-4">
        <p className="text-[13px] leading-relaxed text-fog">{t("runhelp.stopsBody")}</p>
        <ol className="mt-3 space-y-2">
          {(["runhelp.stops1", "runhelp.stops2", "runhelp.stops3"] as TKey[]).map((key, i) => (
            <li key={key} className="flex gap-2.5 text-[12.5px] text-chalk">
              <span className="mono grid size-5 shrink-0 place-items-center rounded-full border border-line text-[9px] text-fog">
                {i + 1}
              </span>
              <span className="leading-snug">{t(key)}</span>
            </li>
          ))}
        </ol>
        {routeId ? (
          <button
            type="button"
            onClick={() => navigate(`/app/routes/${routeId}`)}
            className="mono mt-4 w-full rounded-[8px] bg-amber px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-ink"
          >
            {t("runhelp.openRun")}
          </button>
        ) : (
          <p className="mono mt-4 rounded-[8px] border border-line px-4 py-2.5 text-center text-[11px] text-fog">
            {t("runhelp.noRun")}
          </p>
        )}
      </div>
    </Popup>
  );
}

/** Step 6 — the first drop closed on the road. Nothing to do here but know what to expect. */
function DropPopup({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <Popup title={t("runhelp.dropTitle")} onClose={onClose} t={t}>
      <div className="px-5 py-4">
        <p className="text-[13px] leading-relaxed text-fog">{t("runhelp.dropBody")}</p>
        <ol className="mt-3 space-y-2">
          {(["runhelp.drop1", "runhelp.drop2", "runhelp.drop3"] as TKey[]).map((key, i) => (
            <li key={key} className="flex gap-2.5 text-[12.5px] text-chalk">
              <span className="mono grid size-5 shrink-0 place-items-center rounded-full border border-line text-[9px] text-fog">
                {i + 1}
              </span>
              <span className="leading-snug">{t(key)}</span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={onClose}
          className="mono mt-4 w-full rounded-[8px] bg-amber px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-ink"
        >
          {t("runhelp.dropDone")}
        </button>
      </div>
    </Popup>
  );
}

export function DeliveryChecklist() {
  const t = useT();
  const org = useOrg();
  const routes = useRoutes();
  const ack = useAckSetup();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<StepKey | null>(null);

  const setup = org.data?.setup;
  if (!setup) return null;

  const done = STEPS.filter((s) => setup[s.key]).length;
  // Nothing left to guide: the card retires itself rather than becoming furniture.
  if (done === STEPS.length) return null;

  // The run the "add stops" and "assign a driver" steps act on: the newest one, which on a
  // workspace this young is the one just built.
  const latest = routes.data?.[0] ?? null;

  /** Only the app install and the first drop tick on closing; the rest leave a record behind. */
  const ACK_ON_CLOSE: StepKey[] = ["mobile", "drop"];

  const close = (step: StepKey) => {
    setOpen(null);
    if (!ACK_ON_CLOSE.includes(step)) {
      void queryClient.invalidateQueries({ queryKey: orpc.orgs.key() });
      return;
    }
    if (!setup[step]) ack.mutate({ step });
  };

  // The first unfinished row gets the amber Start button; the rest stay quiet so there is
  // exactly one obvious next move.
  const nextKey = STEPS.find((s) => !setup[s.key])?.key;

  return (
    <>
      <div className="mb-4 rounded-[12px] border border-line bg-ink-2 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[8px] bg-amber/15">
            <Rocket className="size-4 text-amber" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-chalk">{t("runhelp.title")}</h2>
            <p className="mt-0.5 text-[12.5px] leading-snug text-fog">{t("runhelp.subtitle")}</p>
          </div>
          <span className="mono hidden shrink-0 text-[10px] uppercase tracking-widest text-fog sm:inline">
            {t("checklist.progress", { n: done, total: STEPS.length })}
          </span>
        </div>

        {/* Progress rail, so "how much is left" reads without counting rows. */}
        <div className="mt-3 flex gap-1" aria-hidden>
          {STEPS.map((s) => (
            <span
              key={s.key}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                setup[s.key] ? "bg-amber" : "bg-line",
              )}
            />
          ))}
        </div>

        <ol className="mt-3 divide-y divide-line border-t border-line">
          {STEPS.map((step, index) => {
            const complete = setup[step.key];
            return (
              <li key={step.key}>
                <button
                  type="button"
                  disabled={complete}
                  onClick={() => setOpen(step.key)}
                  className="group flex w-full items-center gap-3 py-2.5 text-left transition-colors enabled:hover:bg-ink/40 disabled:cursor-default"
                >
                  <span
                    className={cn(
                      "mono grid size-5 shrink-0 place-items-center rounded-full border text-[9px]",
                      complete
                        ? "border-verified bg-verified/15 text-verified"
                        : "border-line text-fog",
                    )}
                  >
                    {complete ? <Check className="size-3" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[13px]",
                        complete ? "text-fog line-through" : "text-chalk",
                      )}
                    >
                      {t(step.title)}
                    </span>
                    {!complete ? (
                      <span className="block truncate text-[11.5px] text-fog">{t(step.sub)}</span>
                    ) : null}
                  </span>
                  {complete ? null : step.key === nextKey ? (
                    <span className="mono shrink-0 rounded-[6px] bg-amber px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">
                      {t("checklist.start")}
                    </span>
                  ) : (
                    <ChevronRight className="size-4 shrink-0 text-fog opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {open === "run" ? <RunPopup onClose={() => close("run")} /> : null}
      {open === "stops" ? (
        <StopsPopup routeId={latest?.id ?? null} onClose={() => close("stops")} />
      ) : null}
      <InviteDialog open={open === "crew"} onClose={() => close("crew")} />
      {open === "driver" ? (
        latest ? (
          <AssignDriverDialog
            routeId={latest.id}
            routeName={latest.name}
            driverId={latest.driverId ?? null}
            onClose={() => close("driver")}
          />
        ) : (
          <Popup title={t("driver.title")} onClose={() => close("driver")} t={t}>
            <p className="px-5 py-6 text-center text-[12.5px] text-fog">{t("runhelp.noRun")}</p>
          </Popup>
        )
      ) : null}
      {open === "mobile" ? <MobilePopup onClose={() => close("mobile")} /> : null}
      {open === "drop" ? <DropPopup onClose={() => close("drop")} /> : null}
    </>
  );
}
