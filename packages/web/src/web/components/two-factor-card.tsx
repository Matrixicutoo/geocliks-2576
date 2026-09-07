import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { authClient } from "../lib/auth";
import { useT } from "../lib/i18n";

/**
 * Owner/admin opt-in enrolment for authenticator-app two-step sign-in.
 *
 * Three-stage flow, because better-auth only flips `twoFactorEnabled` once a real code has been
 * verified: password -> `twoFactor.enable` (returns the TOTP URI + backup codes) -> `verifyTotp`.
 * The backup codes are shown exactly once, after verification succeeds — before that point the
 * enrolment can still fail, and codes for an account without 2FA are worse than no codes at all.
 *
 * The QR is rendered locally with the `qrcode` package: the TOTP URI contains the shared secret,
 * so it must never travel to a third-party chart service.
 */
export function TwoFactorCard() {
  const t = useT();
  const session = authClient.useSession();
  const enabled = Boolean(
    (session.data?.user as { twoFactorEnabled?: boolean | null } | undefined)?.twoFactorEnabled,
  );

  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!totpUri) {
      setQr(null);
      return;
    }
    let alive = true;
    QRCode.toDataURL(totpUri, { width: 460, margin: 1, errorCorrectionLevel: "M" })
      .then((url) => {
        if (alive) setQr(url);
      })
      .catch(() => {
        // A failed QR render is not fatal — the manual key below still completes enrolment.
        if (alive) setQr(null);
      });
    return () => {
      alive = false;
    };
  }, [totpUri]);

  /** `otpauth://totp/...?secret=XXXX&...` — pulled out so it can be typed in by hand. */
  const manualKey = (() => {
    if (!totpUri) return null;
    try {
      return new URL(totpUri).searchParams.get("secret");
    } catch {
      return null;
    }
  })();

  const start = async () => {
    setBusy(true);
    setError(null);
    const result = await authClient.twoFactor.enable({ password });
    setBusy(false);
    if (result.error || !result.data) {
      setError(result.error?.message ?? t("twofa.error"));
      return;
    }
    setPassword("");
    setTotpUri(result.data.totpURI);
    // Held back until verification succeeds.
    setBackupCodes(result.data.backupCodes);
  };

  const [confirmed, setConfirmed] = useState(false);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    const result = await authClient.twoFactor.verifyTotp({ code: code.trim() });
    setBusy(false);
    if (result.error) {
      setError(t("signin.twoFactorError"));
      return;
    }
    setCode("");
    setTotpUri(null);
    setConfirmed(true);
    await session.refetch?.();
  };

  const turnOff = async () => {
    setBusy(true);
    setError(null);
    const result = await authClient.twoFactor.disable({ password });
    setBusy(false);
    if (result.error) {
      setError(result.error.message ?? t("twofa.error"));
      return;
    }
    setPassword("");
    setBackupCodes(null);
    setConfirmed(false);
    await session.refetch?.();
  };

  const input =
    "w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-[14px] text-chalk outline-none focus:border-amber";
  const button =
    "rounded-[8px] flex items-center gap-2 border border-amber px-4 py-2 text-[13px] font-semibold text-amber transition-colors hover:bg-amber hover:text-ink disabled:opacity-60";

  return (
    <section className="rounded-[12px] border border-line bg-ink-2">
      <div className="border-b border-line px-4 py-3">
        <p className="label text-fog">{t("twofa.section")}</p>
      </div>
      <div className="space-y-3 p-4">
        {enabled ? (
          <>
            <p className="flex items-start gap-2 text-[13px] text-verified">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              {t("twofa.on")}
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("twofa.password")}
              aria-label={t("twofa.password")}
              className={input}
            />
            <button
              type="button"
              onClick={() => void turnOff()}
              disabled={busy || !password}
              className="flex items-center gap-2 rounded-[12px] border border-line px-4 py-2 text-[13px] font-semibold text-fog transition-colors hover:border-alert hover:text-alert disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldOff className="size-4" />
              )}
              {t("twofa.disable")}
            </button>
          </>
        ) : totpUri ? (
          <>
            <p className="text-[13px] text-chalk">{t("twofa.scan")}</p>
            {qr ? (
              <img src={qr} alt={t("twofa.scan")} className="size-44 border border-line bg-paper" />
            ) : (
              <Loader2 className="size-4 animate-spin text-fog" />
            )}
            {manualKey ? (
              <div>
                <p className="text-[12px] text-fog">{t("twofa.manual")}</p>
                <p className="mono mt-1 select-all break-all text-[12px] text-amber">{manualKey}</p>
              </div>
            ) : null}
            <label className="block">
              <span className="label text-fog">{t("twofa.code")}</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                aria-label={t("signin.twoFactorCode")}
                className={`mono mt-1.5 tracking-[0.35em] ${input}`}
              />
            </label>
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={busy || code.length !== 6}
              className={button}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              {t("twofa.confirm")}
            </button>
          </>
        ) : (
          <>
            <p className="text-[13px] text-chalk">{t("twofa.intro")}</p>
            <p className="text-[12px] text-fog">{t("twofa.apps")}</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("twofa.password")}
              aria-label={t("twofa.password")}
              className={input}
            />
            <button
              type="button"
              onClick={() => void start()}
              disabled={busy || !password}
              className={button}
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              {t("twofa.start")}
            </button>
          </>
        )}

        {confirmed && backupCodes?.length ? (
          <div className="rounded-[12px] border border-amber/40 bg-ink p-3">
            <p className="label text-amber">{t("twofa.backupTitle")}</p>
            <p className="mt-1 text-[12px] text-fog">{t("twofa.backupBody")}</p>
            <div className="mono mt-2 grid grid-cols-2 gap-1 text-[12px] text-chalk">
              {backupCodes.map((c) => (
                <span key={c} className="select-all">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="text-[12px] text-alert">{error}</p> : null}
      </div>
    </section>
  );
}
