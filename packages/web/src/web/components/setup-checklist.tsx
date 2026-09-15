import { useState } from "react";
import { Link } from "wouter";
import { Check, ChevronRight, Rocket, X } from "lucide-react";
import { useOrg } from "../queries/orgs";
import { useT, type TKey } from "../lib/i18n";
import { cn } from "../lib/utils";

/**
 * First-run checklist, in the spot a new signup lands on.
 *
 * Every row is derived server-side from work that actually exists (`org.setup`) rather than from
 * a "you clicked this" flag — so it ticks off whoever did the work, on web or on the phone, and
 * a workspace that was already in use before this card existed opens with it already complete
 * and never sees it. Once all five are true the card is gone for good with no dismissal needed.
 */

const STEPS: {
  key: "project" | "mobile" | "capture" | "crew" | "share";
  title: TKey;
  sub: TKey;
  to: string;
}[] = [
  { key: "project", title: "checklist.project", sub: "checklist.projectSub", to: "/app/projects" },
  { key: "mobile", title: "checklist.mobile", sub: "checklist.mobileSub", to: "/get-app" },
  { key: "capture", title: "checklist.capture", sub: "checklist.captureSub", to: "/get-app" },
  { key: "crew", title: "checklist.crew", sub: "checklist.crewSub", to: "/app/team" },
  { key: "share", title: "checklist.share", sub: "checklist.shareSub", to: "/app/reports" },
];

/** Collapsing is per browser and deliberately not synced — it is a "not now", not a setting. */
const HIDE_KEY = "geocliks.setup.hidden";

export function SetupChecklist() {
  const t = useT();
  const org = useOrg();
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(HIDE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const setup = org.data?.setup;
  if (!setup || hidden) return null;

  const done = STEPS.filter((s) => setup[s.key]).length;
  // Nothing left to guide: the card retires itself rather than becoming furniture.
  if (done === STEPS.length) return null;

  const hide = () => {
    try {
      localStorage.setItem(HIDE_KEY, "1");
    } catch {
      /* private mode — collapsing just won't persist */
    }
    setHidden(true);
  };

  // The first unfinished row is the one that gets the amber Start button; the rest stay quiet so
  // there is exactly one obvious next move.
  const nextKey = STEPS.find((s) => !setup[s.key])?.key;

  return (
    <div className="rounded-[12px] border border-line bg-ink-2 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[8px] bg-amber/15">
          <Rocket className="size-4 text-amber" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-paper">{t("checklist.title")}</h2>
          <p className="mt-0.5 text-[12.5px] leading-snug text-fog">{t("checklist.subtitle")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="mono hidden text-[10px] uppercase tracking-widest text-fog sm:inline">
            {t("checklist.progress", { n: done, total: STEPS.length })}
          </span>
          <button
            type="button"
            onClick={hide}
            aria-label={t("checklist.hide")}
            title={t("checklist.hide")}
            className="grid size-7 place-items-center rounded-[6px] text-fog transition-colors hover:text-paper"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Progress rail — five segments, so "how much is left" reads without counting rows. */}
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
              <Link
                to={step.to}
                className="group flex items-center gap-3 py-2.5 transition-colors hover:bg-ink/40"
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
                      complete ? "text-fog line-through" : "text-paper",
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
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
