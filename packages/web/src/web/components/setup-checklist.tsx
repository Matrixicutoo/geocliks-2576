import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronRight, Copy, Loader2, Rocket, X } from "lucide-react";
import { useAckSetup, useAppQr, useOrg } from "../queries/orgs";
import { orpc } from "../lib/api";
import { useT, type TKey, type Translate } from "../lib/i18n";
import { cn } from "../lib/utils";
import { NewProjectDialog } from "../pages/app-projects";
import { ReportBuilder } from "../pages/app-reports";
import { InviteDialog } from "./invite-form";

/**
 * First-run checklist, in the spot a new signup lands on.
 *
 * Every row is derived server-side from work that actually exists (`org.setup`) rather than from
 * a "you clicked this" flag — so it ticks off whoever did the work, on web or on the phone, and
 * a workspace that was already in use before this card existed opens with it already complete
 * and never sees it. Once all five are true the card is gone for good.
 *
 * Nothing here navigates away: each step opens its popup over the Teamspace page, does the work
 * in it, and drops the owner back where they started. Half of onboarding being lost is somebody
 * clicking into Projects on step one and never finding their way back to steps two through five.
 */

type StepKey = "project" | "mobile" | "capture" | "crew" | "share";

const STEPS: { key: StepKey; title: TKey; sub: TKey }[] = [
  { key: "project", title: "checklist.project", sub: "checklist.projectSub" },
  { key: "mobile", title: "checklist.mobile", sub: "checklist.mobileSub" },
  { key: "capture", title: "checklist.capture", sub: "checklist.captureSub" },
  { key: "crew", title: "checklist.crew", sub: "checklist.crewSub" },
  { key: "share", title: "checklist.share", sub: "checklist.shareSub" },
];

/** The shell every step's popup sits in, so all five close the same way. */
export function Popup({
  title,
  onClose,
  children,
  t,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  t: Translate;
}) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-ink/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[12px] border border-line bg-ink-2">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="font-display text-[15px] font-semibold">{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("checklist.close")}
            className="text-fog hover:text-chalk"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Step 2 — the app on the phone. A QR beats typing a URL with gloves on, and the link under it
 * is there for the owner who is already on their laptop and wants to text it to the crew.
 */
export function MobilePopup({ onClose }: { onClose: () => void }) {
  const t = useT();
  const qr = useAppQr();
  const [copied, setCopied] = useState(false);

  return (
    <Popup title={t("checklist.mobileTitle")} onClose={onClose} t={t}>
      <div className="px-5 py-4">
        <p className="text-[13px] leading-relaxed text-fog">{t("checklist.mobileBody")}</p>

        <div className="mt-4 flex flex-col items-center gap-3 rounded-[12px] border border-line bg-ink p-4">
          {qr.isPending ? (
            <div className="grid size-40 place-items-center">
              <Loader2 className="size-5 animate-spin text-fog" />
            </div>
          ) : qr.isError ? (
            <p className="mono text-[11px] text-alert">{qr.error.message}</p>
          ) : (
            <>
              <img
                src={qr.data.dataUrl}
                alt={t("checklist.mobileScan")}
                className="size-40 bg-white p-1"
              />
              <p className="mono text-[10px] uppercase tracking-widest text-fog">
                {t("checklist.mobileScan")}
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(qr.data.url);
                    setCopied(true);
                  } catch {
                    /* clipboard blocked — the link is on screen anyway */
                  }
                }}
                className="mono flex items-center gap-1.5 text-[11px] text-amber hover:underline"
              >
                <Copy className="size-3" />
                {copied ? t("checklist.mobileCopied") : qr.data.url.replace(/^https?:\/\//, "")}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mono mt-4 w-full rounded-[8px] bg-amber px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-ink"
        >
          {t("checklist.mobileDone")}
        </button>
      </div>
    </Popup>
  );
}

/** Step 3 — the first sealed photo. Nothing to do here but know what to expect on the phone. */
function CapturePopup({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <Popup title={t("checklist.captureTitle")} onClose={onClose} t={t}>
      <div className="px-5 py-4">
        <p className="text-[13px] leading-relaxed text-fog">{t("checklist.captureBody")}</p>
        <ol className="mt-3 space-y-2">
          {(["checklist.capture1", "checklist.capture2", "checklist.capture3"] as TKey[]).map(
            (key, i) => (
              <li key={key} className="flex gap-2.5 text-[12.5px] text-chalk">
                <span className="mono grid size-5 shrink-0 place-items-center rounded-full border border-line text-[9px] text-fog">
                  {i + 1}
                </span>
                <span className="leading-snug">{t(key)}</span>
              </li>
            ),
          )}
        </ol>
        <button
          type="button"
          onClick={onClose}
          className="mono mt-4 w-full rounded-[8px] bg-amber px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-ink"
        >
          {t("checklist.captureDone")}
        </button>
      </div>
    </Popup>
  );
}

/**
 * Step 5 — proof out the door, built right here. The real report builder, not a link to it: this
 * step only ticks when a report actually exists, so sending the owner to another page to make
 * one and come back would be the long way round to the same place.
 */
function SharePopup({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const t = useT();
  return (
    <Popup title={t("checklist.shareTitle")} onClose={onClose} t={t}>
      <div className="px-5 py-4">
        <p className="text-[13px] leading-relaxed text-fog">{t("checklist.shareBody")}</p>
        <div className="mt-4">
          <ReportBuilder onCreated={onCreated} />
        </div>
      </div>
    </Popup>
  );
}

export function SetupChecklist() {
  const t = useT();
  const org = useOrg();
  const ack = useAckSetup();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<StepKey | null>(null);

  const setup = org.data?.setup;
  if (!setup) return null;

  const done = STEPS.filter((s) => setup[s.key]).length;
  // Nothing left to guide: the card retires itself rather than becoming furniture.
  if (done === STEPS.length) return null;

  /**
   * Closing a popup is the confirmation only for the two steps whose work happens on a phone we
   * cannot see — the app being installed and the first photo taken on it. Everything else is
   * done inside its own popup and leaves a record behind (a project, an invite, a report), so
   * re-reading the workspace is the honest check and a popup closed without finishing the work
   * correctly leaves its step open.
   */
  const ACK_ON_CLOSE: StepKey[] = ["mobile", "capture"];

  const close = (step: StepKey) => {
    setOpen(null);
    if (!ACK_ON_CLOSE.includes(step)) {
      void queryClient.invalidateQueries({ queryKey: orpc.orgs.key() });
      return;
    }
    if (!setup[step]) ack.mutate({ step });
  };

  // The first unfinished row is the one that gets the amber Start button; the rest stay quiet so
  // there is exactly one obvious next move.
  const nextKey = STEPS.find((s) => !setup[s.key])?.key;

  return (
    <>
      <div className="rounded-[12px] border border-line bg-ink-2 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[8px] bg-amber/15">
            <Rocket className="size-4 text-amber" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-chalk">{t("checklist.title")}</h2>
            <p className="mt-0.5 text-[12.5px] leading-snug text-fog">{t("checklist.subtitle")}</p>
          </div>
          <span className="mono hidden shrink-0 text-[10px] uppercase tracking-widest text-fog sm:inline">
            {t("checklist.progress", { n: done, total: STEPS.length })}
          </span>
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

      {open === "project" ? <NewProjectDialog onClose={() => close("project")} /> : null}
      {open === "mobile" ? <MobilePopup onClose={() => close("mobile")} /> : null}
      {open === "capture" ? <CapturePopup onClose={() => close("capture")} /> : null}
      <InviteDialog open={open === "crew"} onClose={() => close("crew")} />
      {open === "share" ? (
        <SharePopup onClose={() => close("share")} onCreated={() => close("share")} />
      ) : null}
    </>
  );
}
