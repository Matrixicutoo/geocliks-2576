import { useState } from "react";
import { Link, useLocation, useSearchParams } from "wouter";
import { Loader2, ArrowRight, MailCheck, Eye, EyeOff } from "lucide-react";
import { authClient, captchaErrorKey } from "../lib/auth";
import { Logo } from "../components/logo";
import { Turnstile } from "../components/turnstile";
import { useT } from "../lib/i18n";

/**
 * Two states in one page: without a `token` query param it asks for an email and sends the reset
 * link; with a token it takes the new password. Better-auth generates the token and emails the
 * link through `sendResetPassword` on the server.
 */
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [, navigate] = useLocation();
  const t = useT();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Turnstile tokens are single-use. Bumping this remounts the widget for the next attempt.
  const [captchaNonce, setCaptchaNonce] = useState(0);

  async function requestLink(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (result.error) {
        const captchaKey = captchaErrorKey(result.error.code);
        setError(captchaKey ? t(captchaKey) : (result.error.message ?? t("reset.sendError")));
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      setCaptchaNonce((n) => n + 1);
    }
  }

  async function setNewPassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token: token ?? "" });
      if (result.error) setError(result.error.message ?? t("reset.tokenError"));
      else setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-[8px] border border-line bg-ink-2 px-3 py-2.5 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber";
  const buttonClass =
    "mono mt-5 flex w-full items-center justify-center gap-2 bg-amber px-4 py-3 text-[11.5px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep disabled:opacity-60";

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-5 py-12 text-chalk">
      <div className="w-full max-w-[380px]">
        <Link to="/">
          <Logo />
        </Link>

        {done ? (
          <>
            <h1 className="mt-9 font-display text-[25px] font-bold tracking-tight">
              {t("reset.doneTitle")}
            </h1>
            <p className="mt-3 text-[13.5px] leading-relaxed text-fog">
              {t("reset.doneBody")}
            </p>
            <button type="button" onClick={() => navigate("/sign-in")} className={buttonClass}>
              <ArrowRight className="size-4" /> {t("join.goSignIn")}
            </button>
          </>
        ) : token ? (
          <>
            <p className="label mt-9">{t("reset.chooseEyebrow")}</p>
            <h1 className="mt-2 font-display text-[25px] font-bold tracking-tight">
              {t("reset.setTitle")}
            </h1>
            <form onSubmit={setNewPassword} className="mt-6">
              <label className="block">
                <span className="label">{t("reset.newPassword")}</span>
                <div className="relative">
                  <input
                    aria-label={t("reset.newPassword")}
                    type={showPw ? "text" : "password"}
                    required
                    minLength={8}
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("reset.newPasswordHint")}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={t(showPw ? "signin.hidePassword" : "signin.showPassword")}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-fog transition-colors hover:text-chalk"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>
              {error && (
                <p className="rounded-[8px] mt-4 border border-alert/40 bg-alert/10 px-3 py-2 text-[12.5px] text-alert">
                  {error}
                </p>
              )}
              <button type="submit" disabled={busy} className={buttonClass}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                {t("reset.save")}
              </button>
            </form>
          </>
        ) : sent ? (
          <>
            <h1 className="mt-9 font-display text-[25px] font-bold tracking-tight">
              {t("reset.sentTitle")}
            </h1>
            <p className="mt-3 text-[13.5px] leading-relaxed text-fog">
              {t("reset.sentBody", { email })}
            </p>
            <p className="mono mt-6 flex items-center gap-2 text-[11.5px] text-verified">
              <MailCheck className="size-4" /> {t("reset.sentTag")}
            </p>
          </>
        ) : (
          <>
            <p className="label mt-9">{t("reset.eyebrow")}</p>
            <h1 className="mt-2 font-display text-[25px] font-bold tracking-tight">
              {t("reset.title")}
            </h1>
            <form onSubmit={requestLink} className="mt-6">
              <label className="block">
                <span className="label">{t("signin.workEmail")}</span>
                <input
                  aria-label={t("signin.workEmail")}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("signin.emailPlaceholder")}
                  className={inputClass}
                />
              </label>
              <div className="mt-4">
                <Turnstile nonce={captchaNonce} />
              </div>
              {error && (
                <p className="rounded-[8px] mt-4 border border-alert/40 bg-alert/10 px-3 py-2 text-[12.5px] text-alert">
                  {error}
                </p>
              )}
              <button type="submit" disabled={busy} className={buttonClass}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                {t("reset.send")}
              </button>
            </form>
            <Link
              to="/sign-in"
              className="mono mt-6 inline-block text-[11.5px] text-fog hover:text-chalk"
            >
              {t("reset.back")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
