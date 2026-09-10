import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { authClient } from "../lib/auth";
import { Logo } from "../components/logo";
import { useT } from "../lib/i18n";

/**
 * Second step of sign-in for accounts with authenticator 2FA on.
 *
 * With the two-factor plugin enabled, `signIn.email` no longer returns a session for these
 * accounts — it answers `{ twoFactorRedirect: true }` and parks the pending sign-in in a signed
 * cookie. The session token only exists after `verifyTotp` (or `verifyBackupCode`) succeeds, which
 * is why the caller hands the token back through `onVerified` instead of reading it from sign-in.
 */
export function TwoFactorStep({
  onVerified,
}: {
  onVerified: (token: string | null | undefined) => Promise<void>;
}) {
  const t = useT();
  const [useBackup, setUseBackup] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = useBackup
        ? await authClient.twoFactor.verifyBackupCode({ code: code.trim() })
        : await authClient.twoFactor.verifyTotp({ code: code.trim() });
      if (result.error) {
        setError(t("signin.twoFactorError"));
        return;
      }
      await onVerified((result.data as { token?: string | null } | null)?.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    // Pinned dark to match the sign-in page this step continues from.
    <div
      data-theme="dark"
      className="flex min-h-screen items-center justify-center bg-ink px-5 py-12 text-chalk"
    >
      <div className="w-full max-w-[380px]">
        <Link to="/">
          <Logo />
        </Link>

        <p className="label mt-8">{t("twofa.section")}</p>
        <h1 className="mt-2 font-display text-[27px] font-bold tracking-tight">
          {t("signin.twoFactorTitle")}
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-fog">{t("signin.twoFactorBody")}</p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block">
            <span className="label">
              {useBackup ? t("signin.twoFactorBackupPlaceholder") : t("signin.twoFactorCode")}
            </span>
            <input
              aria-label={useBackup ? t("signin.twoFactorBackupPlaceholder") : t("signin.twoFactorCode")}
              value={code}
              onChange={(e) =>
                setCode(useBackup ? e.target.value : e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode={useBackup ? "text" : "numeric"}
              autoComplete="one-time-code"
              placeholder={useBackup ? "XXXXXXXX" : "000000"}
              className="mono mt-1.5 w-full rounded-[8px] border border-line bg-ink-2 px-3 py-2.5 text-[15px] tracking-[0.3em] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber"
            />
          </label>

          {error && (
            <p className="rounded-[8px] border border-alert/40 bg-alert/10 px-3 py-2 text-[12.5px] text-alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || code.trim().length < 6}
            className="rounded-[8px] mono flex w-full items-center justify-center gap-2 bg-amber px-4 py-3 text-[11.5px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4" />
            )}
            {t("signin.twoFactorVerify")}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setUseBackup((v) => !v);
            setCode("");
            setError(null);
          }}
          className="mono mt-4 text-[11.5px] text-fog underline decoration-line underline-offset-2 hover:text-chalk"
        >
          {useBackup ? t("signin.twoFactorUseApp") : t("signin.twoFactorBackup")}
        </button>

        <p className="mt-6 flex items-start gap-2 text-[11.5px] leading-relaxed text-fog">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-verified" />
          {t("twofa.apps")}
        </p>
      </div>
    </div>
  );
}
