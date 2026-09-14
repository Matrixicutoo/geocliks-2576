import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Route as RouteIcon, ShieldCheck } from "lucide-react";
import { useOrg, useSetupOrg } from "../queries/orgs";
import { useT } from "../lib/i18n";
import { canSetUpWorkspace } from "../lib/roles";
import { Logo } from "./logo";
import { cn } from "../lib/utils";

type Product = "field" | "delivery";

/**
 * First-run onboarding, and the only thing standing between a fresh account and the app.
 *
 * Two questions — who you are and which system you run — because the second answer is what
 * starts the free week: field job photos trials Business, delivery routes trials Delivery Pro
 * (`orgs.setup` on the server owns that mapping and the 7-day clock). No card, and nothing here
 * can be dismissed: an unanswered product leaves the workspace with no landing page to send
 * anyone to, and the trial would never start.
 *
 * Invited members never see it. They joined a Teamspace somebody else already set up, so the
 * gate is skipped for every role below admin — `needsSetup` is true for their org only until the
 * owner finishes, and asking a crew member to name their boss's company is nonsense.
 */
export function SetupGate({ children }: { children: React.ReactNode }) {
  const t = useT();
  const org = useOrg();
  const setup = useSetupOrg();
  const [step, setStep] = useState<1 | 2>(1);
  const [userName, setUserName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const prefilled = useRef(false);

  const role = org.data?.role;
  const needsSetup = Boolean(org.data?.needsSetup) && canSetUpWorkspace(role);

  /**
   * A code sign-in has no name field, so Better Auth seeds `user.name` from the address
   * ("rosa.diaz" for rosa.diaz@…). It is a starting point, not an answer — prefill it and let
   * them write their real name over it. The Teamspace field starts empty on purpose: the
   * auto-provisioned "Rosa's Team" is exactly what this form exists to replace.
   */
  useEffect(() => {
    if (prefilled.current || !org.data) return;
    prefilled.current = true;
    setUserName(org.data.user.name ?? "");
  }, [org.data]);

  // Caret in the first field once the form is on screen — via a ref, as the a11y lint requires.
  useEffect(() => {
    if (needsSetup && step === 1) nameRef.current?.focus();
  }, [needsSetup, step]);

  if (!needsSetup) return <>{children}</>;

  const canContinue = userName.trim().length >= 1 && orgName.trim().length >= 2;

  function submit(chosen: Product) {
    setError(null);
    setProduct(chosen);
    setup.mutate(
      { userName: userName.trim(), name: orgName.trim(), product: chosen },
      {
        // `needsSetup` flips to false once `orgs.current` refetches, which unmounts this gate.
        onError: (e: Error) => setError(e.message || t("setup.error")),
      },
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink blueprint px-5 py-12 text-chalk">
      <div className={cn("w-full", step === 1 ? "max-w-[420px]" : "max-w-[720px]")}>
        <Logo />
        <p className="label mt-10 text-amber">{t("setup.stepOf", { n: step })}</p>

        {step === 1 ? (
          <form
            className="mt-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (canContinue) setStep(2);
            }}
          >
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
              {t("setup.title")}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-fog">{t("setup.body")}</p>

            <div className="mt-7 space-y-3">
              <label className="block">
                <span className="label">{t("setup.yourName")}</span>
                <input
                  ref={nameRef}
                  aria-label={t("setup.yourName")}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  maxLength={80}
                  placeholder={t("setup.yourNamePlaceholder")}
                  className="mt-1.5 w-full rounded-[8px] border border-line bg-ink-2 px-3 py-2.5 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber"
                />
              </label>
              <label className="block">
                <span className="label">{t("setup.orgName")}</span>
                <input
                  aria-label={t("setup.orgName")}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder={t("setup.orgNamePlaceholder")}
                  className="mt-1.5 w-full rounded-[8px] border border-line bg-ink-2 px-3 py-2.5 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber"
                />
                <span className="mt-1.5 block text-[11.5px] leading-relaxed text-fog">
                  {t("setup.orgNameHint")}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!canContinue}
              className="rounded-[8px] mono mt-6 flex w-full items-center justify-center gap-2 bg-amber px-4 py-3 text-[11.5px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep disabled:opacity-60"
            >
              {t("setup.next")}
            </button>
          </form>
        ) : (
          <div className="mt-3">
            <h1 className="text-[26px] font-semibold leading-tight tracking-tight">
              {t("setup.systemTitle")}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-fog">{t("setup.systemBody")}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <SystemCard
                icon={Camera}
                title={t("setup.fieldTitle")}
                body={t("setup.fieldBody")}
                trial={t("setup.fieldTrial")}
                busy={setup.isPending && product === "field"}
                disabled={setup.isPending}
                onPick={() => submit("field")}
              />
              <SystemCard
                icon={RouteIcon}
                title={t("setup.deliveryTitle")}
                body={t("setup.deliveryBody")}
                trial={t("setup.deliveryTrial")}
                busy={setup.isPending && product === "delivery"}
                disabled={setup.isPending}
                onPick={() => submit("delivery")}
              />
            </div>

            <p className="mt-5 flex items-start gap-2 text-[11.5px] leading-relaxed text-fog">
              <ShieldCheck className="mt-[1px] size-4 shrink-0 text-verified" />
              {t("setup.trialNote")}
            </p>
            {error ? <p className="mt-3 text-[12px] text-rust">{error}</p> : null}

            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={setup.isPending}
              className="mono mt-5 rounded-[8px] border border-line px-3 py-2 text-[11px] uppercase tracking-widest text-fog transition-colors hover:text-chalk disabled:opacity-60"
            >
              {t("setup.back")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** One of the two systems, as a button-sized pitch: what it does, and what the free week grants. */
function SystemCard({
  icon: Icon,
  title,
  body,
  trial,
  busy,
  disabled,
  onPick,
}: {
  icon: typeof Camera;
  title: string;
  body: string;
  trial: string;
  busy: boolean;
  disabled: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className="rounded-[12px] group flex h-full flex-col items-start gap-2 border border-line bg-ink-2 p-5 text-left transition-colors hover:border-amber disabled:opacity-60"
    >
      <span className="rounded-[8px] grid size-9 place-items-center border border-line bg-ink text-amber">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
      </span>
      <span className="mt-1 text-[15px] font-semibold tracking-tight text-chalk">{title}</span>
      <span className="text-[12.5px] leading-relaxed text-fog">{body}</span>
      <span className="mono mt-auto pt-3 text-[10.5px] font-bold uppercase tracking-widest text-amber">
        {trial}
      </span>
    </button>
  );
}
