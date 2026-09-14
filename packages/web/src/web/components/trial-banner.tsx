import { useState } from "react";
import { Link } from "wouter";
import { Clock, X } from "lucide-react";
import { useOrg } from "../queries/orgs";
import { canManageWorkspace } from "../lib/roles";
import { useLocale } from "../lib/i18n";
import { cn } from "../lib/utils";

/**
 * One dismissal, remembered per day.
 *
 * The free week has to be visible — someone who never notices it ends is someone who wakes up
 * to features gone quiet and no idea why. But a strip that cannot be closed is a strip people
 * learn to read past, so closing it buys the rest of the day and it returns tomorrow with one
 * fewer day on the clock. The lapsed-trial notice is closed for good instead: it is news, not
 * a countdown, and it has nothing new to say on day two.
 */
const KEY = "geocliks.trial-note.v1";

const today = () => new Date().toISOString().slice(0, 10);

function readDismissed(): string | null {
  try {
    return globalThis.localStorage?.getItem(KEY) ?? null;
  } catch {
    return null;
  }
}

function writeDismissed(value: string) {
  try {
    globalThis.localStorage?.setItem(KEY, value);
  } catch {
    // Private mode, or storage full. Losing the dismissal is better than losing the page.
  }
}

/**
 * The trial strip, on every dashboard page.
 *
 * Two states, and they are different messages rather than two tones of one:
 *
 * - **Running** — how many days are left of which plan, and the reassurance that no card was
 *   taken and nothing gets deleted at the end. This is the moment to make the plan page one
 *   click away, which is the entire reason it carries a link.
 * - **Lapsed** — the paid features are quiet again and the data is all still there. Said once,
 *   plainly, because the alternative is somebody concluding the app broke.
 *
 * Only managers and above see either one: the plan page it points at is manager-only, and
 * telling a field crew member their boss's trial expires on Tuesday gives them a deadline they
 * cannot act on.
 */
export function TrialBanner() {
  const org = useOrg();
  const { t, locale } = useLocale();
  const [dismissed, setDismissed] = useState<string | null>(() => readDismissed());

  const trial = org.data?.trial;
  const role = org.data?.role;
  if (!trial || !canManageWorkspace(role)) return null;

  const state = trial.active ? "active" : trial.expired ? "ended" : null;
  if (!state) return null;
  // Active is dismissed for the calendar day; ended is dismissed for good.
  const stamp = state === "active" ? `active:${today()}` : "ended";
  if (dismissed === stamp) return null;

  const days = trial.daysLeft ?? 0;
  const plan = trial.planName ?? "";
  const lastDay = days <= 1;

  const endsAt = trial.endsAt ? new Date(trial.endsAt) : null;
  const endsLabel = endsAt
    ? new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(endsAt)
    : null;

  const ending = state === "active" && lastDay;

  return (
    <div
      className={cn(
        "rounded-[12px] mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 border px-4 py-3",
        // The last day and a lapsed trial both want attention; days 7 through 2 do not.
        ending || state === "ended"
          ? "border-alert/50 bg-alert/10"
          : "border-amber/40 bg-amber/10",
      )}
    >
      <span
        className={cn(
          "rounded-[8px] grid size-9 shrink-0 place-items-center border",
          ending || state === "ended"
            ? "border-alert/50 bg-alert/15 text-alert"
            : "border-amber/40 bg-amber/15 text-amber",
        )}
      >
        <Clock className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold tracking-tight text-chalk">
          {state === "ended"
            ? t("trial.endedTitle")
            : lastDay
              ? t("trial.titleLast", { plan })
              : t("trial.title", { plan, n: days })}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-fog">
          {state === "ended"
            ? t("trial.endedBody")
            : endsLabel
              ? `${t("trial.body")} ${t("trial.ends", { date: endsLabel })}`
              : t("trial.body")}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/app/billing"
          className="rounded-[8px] mono bg-amber px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep"
        >
          {state === "ended" ? t("trial.endedCta") : t("trial.cta")}
        </Link>
        <button
          type="button"
          aria-label={t("trial.dismiss")}
          title={t("trial.dismiss")}
          onClick={() => {
            writeDismissed(stamp);
            setDismissed(stamp);
          }}
          className="rounded-[8px] grid size-9 place-items-center border border-line text-fog transition-colors hover:text-chalk"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * The countdown on its own, for the sidebar's workspace card: a workspace on a trial plan
 * should be able to tell at a glance that the plan is borrowed. Renders nothing at all when no
 * trial is running, so the card keeps its normal two lines.
 */
export function TrialChip() {
  const org = useOrg();
  const { t } = useLocale();
  const trial = org.data?.trial;
  // Same gate as the strip: a driver cannot buy a plan, so a countdown on their sidebar is a
  // deadline they can only worry about.
  if (!trial?.active || !canManageWorkspace(org.data?.role)) return null;
  const days = trial.daysLeft ?? 0;
  return (
    <span
      className={cn(
        // Inline-block with its own top margin rather than a wrapper row: the wrapper would
        // still hold its margin on the workspaces that have no trial to show.
        "rounded-[6px] mono mt-1 inline-block border px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-widest",
        days <= 1 ? "border-alert/50 bg-alert/15 text-alert" : "border-amber/50 bg-amber/15 text-amber",
      )}
    >
      {days <= 1 ? t("trial.badgeLast") : t("trial.badge", { n: days })}
    </span>
  );
}
