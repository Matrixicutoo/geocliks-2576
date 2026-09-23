import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "wouter";
import { Loader2, ShieldCheck, ArrowRight, Mail, ChevronDown } from "lucide-react";
import { authClient, setAuthToken } from "../lib/auth";
import { Logo } from "./logo";
import { useT } from "../lib/i18n";
import { useAuthProviders } from "../queries/site";

/** Seconds a person waits before a fresh code can be mailed. Matches the mobile screen. */
const RESEND_SECONDS = 50;

/**
 * Pulls the OAuth failure code out of the current query string.
 *
 * A failed social sign-in comes back through `errorCallbackURL`, and better-auth appends its own
 * `error=` parameter to whatever URL it was given. Our error URL already carries `?notice=social`,
 * so depending on the version that code can arrive glued onto the notice value rather than as a
 * clean parameter - a regex over the raw search string catches both shapes. The value is an OAuth
 * error identifier such as `state_not_found` or `EMAIL_NOT_FOUND`, never a credential, so showing
 * it turns a dead-end message into something a person can actually act on.
 */
function oauthErrorCode(search: string): string | null {
  const match = /[?&]error(?:_description)?=([^&]+)/.exec(search);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]).slice(0, 80);
  } catch {
    return match[1].slice(0, 80);
  }
}

/**
 * lucide-react ships no X (Twitter) brand mark, so the glyph is drawn inline. The same path data
 * is duplicated verbatim in site-footer.tsx and admin-settings.tsx - keep the three identical.
 */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.53 3h3.06l-6.69 7.64L21.75 21h-6.16l-4.82-6.3L5.25 21H2.19l7.15-8.17L2.25 3h6.31l4.36 5.77L17.53 3Zm-1.07 16.13h1.7L7.62 4.78H5.8l10.66 14.35Z" />
    </svg>
  );
}

/**
 * lucide-react ships no Apple mark either, so this one is drawn inline too. Single colour on
 * purpose: Apple's own guidelines want the logo in the button's foreground colour, never tinted.
 */
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.37 12.78c.02 2.62 2.3 3.49 2.33 3.5-.02.06-.37 1.25-1.2 2.48-.73 1.06-1.48 2.11-2.67 2.13-1.16.02-1.54-.69-2.87-.69-1.33 0-1.75.67-2.85.71-1.14.04-2.01-1.14-2.75-2.2-1.6-2.32-2.83-6.56-1.18-9.42.82-1.42 2.28-2.32 3.87-2.35 1.12-.02 2.18.75 2.87.75.68 0 1.97-.93 3.32-.79.57.02 2.16.2 3.19 1.55-.08.05-1.9 1.11-1.88 3.32M14.3 3.9c.61-.74 1.02-1.77.91-2.79-.88.04-1.94.59-2.57 1.32-.56.65-1.05 1.7-.92 2.7.98.08 1.97-.5 2.58-1.23" />
    </svg>
  );
}

/**
 * The single authentication screen.
 *
 * There is no sign-up any more, and therefore no second page: a 6-digit code spent on
 * `/sign-in/email-otp` creates the account if the address is new and signs in if it isn't, so
 * asking someone up front which of the two they are is a question with no purpose. Everything a
 * new workspace needs — the person's name, the Teamspace name, which system they run — is asked
 * once, after the session exists, by the onboarding screen.
 *
 * Social first, deliberately: Google is the button nearly everyone wants, X and email hide behind
 * "More" so the common path is a single tap. The same ordering ships on the phone app.
 */

/**
 * The phone app hands the browser a `?app=1` sign-in when it needs one, and on success we hand the
 * browser straight back to the app through its deep link instead of routing on into the website.
 *
 * The scheme is hardcoded deliberately. Reading the return target out of the query string would
 * turn this page into an open redirect: anyone could mail a link and bounce a freshly-signed-in
 * user - bearer token and all - wherever they liked.
 */
const APP_SCHEME = "runable-timemar-nt1ia4s";

/** Deep link back into the app. Stage 1 hands over the address only, never a credential. */
function appCallbackUrl(email: string): string {
  const params = new URLSearchParams();
  const clean = email.trim();
  if (clean) params.set("email", clean);
  params.set("created", "1");
  return `${APP_SCHEME}://auth/callback?${params.toString()}`;
}

export function AuthForm() {
  const t = useT();
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();
  // Invite links carry ?next=/join/<code> so the person lands back on the invite once authed.
  const next = searchParams.get("next") ?? "/app";
  // An invite link hands the invited address over. The server refuses acceptance unless the
  // account email matches it exactly, so the field is prefilled and locked, not merely hinted.
  const invitedEmail = searchParams.get("email")?.trim() ?? "";
  // Set when the phone app sent us here, so a success returns to the app rather than to /app.
  const appReturn = searchParams.get("app") === "1";
  // Set when a social sign-in came back failed (X hands control back through errorCallbackURL,
  // not a promise). The notice value can arrive with the OAuth code glued on, so compare only the
  // leading word.
  const notice = (searchParams.get("notice") ?? "").split("?")[0];
  const socialError = oauthErrorCode(
    typeof window === "undefined" ? "" : window.location.search,
  );
  const [error, setError] = useState<string | null>(
    notice === "social" || socialError
      ? `${t("signin.authError")}${socialError ? ` (${socialError})` : ""}`
      : null,
  );

  const [email, setEmail] = useState(invitedEmail);
  const [code, setCode] = useState("");
  // "choose" shows the buttons, "email" the address field, "code" the 6 digits.
  // An invited arrival skips straight to the address: the invite already named it.
  const [step, setStep] = useState<"choose" | "email" | "code">(
    invitedEmail ? "email" : "choose",
  );
  const [showMore, setShowMore] = useState(false);
  const [busy, setBusy] = useState<"google" | "apple" | "x" | "send" | "verify" | null>(null);
  const [cooldown, setCooldown] = useState(0);
  // Hides the X button unless the server actually holds X credentials.
  const providers = useAuthProviders();
  const codeRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  /** Resend countdown. One interval for the whole screen, cleared the moment it hits zero. */
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((n) => (n <= 1 ? 0 : n - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  /** Focus the digits as soon as the code screen appears — nobody should have to click first. */
  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  /**
   * Same courtesy on the email step, minus the `autoFocus` attribute the a11y lint forbids. An
   * invited address is read-only, so focusing it would only trap the caret in a field nobody edits.
   */
  useEffect(() => {
    if (step === "email" && !invitedEmail) emailRef.current?.focus();
  }, [step, invitedEmail]);

  /**
   * Shared tail of every successful sign-in. Desktop/preview panels run the app in a cross-site
   * iframe where the session cookie is dropped, so the bearer returned by the API is the only thing
   * that keeps us signed in: store it, then confirm the session resolves before routing so /app
   * never bounces straight back here.
   */
  async function finish(token: string | null | undefined) {
    if (token) setAuthToken(token);
    await authClient.getSession({ query: { disableCookieCache: true } });
    if (appReturn) {
      // Leaving the browser entirely: a router navigation would keep them on the website.
      window.location.href = appCallbackUrl(email);
      return;
    }
    navigate(next);
  }

  async function withGoogle() {
    setError(null);
    setBusy("google");
    try {
      await authClient.managedAuth.signIn({ provider: "google" });
      navigate(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("POPUP_CLOSED")) setError(message);
    } finally {
      setBusy(null);
    }
  }

  /**
   * Apple sign-in, same managed broker as Google above.
   *
   * It exists for App Store Review Guideline 4.8 - the iOS build offers Google, so it has to offer
   * an equivalent privacy-preserving login - and the website carries the same button because a
   * reviewer following our own sign-in link should not find the pair inconsistent.
   */
  async function withApple() {
    setError(null);
    setBusy("apple");
    try {
      await authClient.managedAuth.signIn({ provider: "apple" });
      navigate(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("POPUP_CLOSED")) setError(message);
    } finally {
      setBusy(null);
    }
  }

  /**
   * X is a full-page redirect, so nothing after the call runs on success - control comes back on
   * /api/auth/callback/twitter and then on to callbackURL. The app-return case hands over
   * `created=1` with no address: X never tells us the email before sign-in, and appCallbackUrl
   * already omits a blank one. The deep-link scheme is in TRUSTED_ORIGINS, which is what
   * better-auth validates callbackURL against.
   */
  async function withX() {
    setError(null);
    setBusy("x");
    try {
      await authClient.signIn.social({
        provider: "twitter",
        callbackURL: appReturn ? appCallbackUrl("") : next,
        errorCallbackURL: "/sign-in?notice=social",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  /**
   * Mails a fresh 6-digit code. `type: "sign-in"` is the identifier the verify call expects; the
   * endpoint answers the same way whether or not the address has an account, so nothing here
   * leaks whether someone is already a member.
   */
  async function sendCode(event?: React.FormEvent) {
    event?.preventDefault();
    const address = email.trim().toLowerCase();
    if (!address) return;
    setError(null);
    setBusy("send");
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: address,
        type: "sign-in",
      });
      if (result.error) {
        setError(result.error.message ?? t("signin.codeSendError"));
        return;
      }
      setCode("");
      setStep("code");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  /**
   * Spends the code. On an address with no account this creates one, verified, and signs in — the
   * name is a placeholder the onboarding screen replaces, never something the person is asked for
   * twice.
   */
  async function verifyCode(event: React.FormEvent) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    setError(null);
    setBusy("verify");
    try {
      const result = await authClient.signIn.emailOtp({
        email: address,
        otp: code.trim(),
        name: address.split("@")[0],
      });
      if (result.error) {
        setError(result.error.message ?? t("signin.codeError"));
        return;
      }
      await finish((result.data as { token?: string | null } | null)?.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  const buttonClass =
    "flex w-full items-center justify-center gap-2.5 rounded-[12px] border border-line bg-ink-2 px-4 py-3 text-[13.5px] font-semibold text-chalk transition-colors hover:border-fog disabled:opacity-60";
  const inputClass =
    "mt-1.5 w-full rounded-[8px] border border-line bg-ink-2 px-3 py-2.5 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber";

  return (
    <div
      data-theme="dark"
      className="grid min-h-screen bg-ink text-chalk lg:grid-cols-[1.05fr_0.95fr]"
    >
      {/* Evidence panel */}
      <div className="relative hidden overflow-hidden border-r border-line bg-[#0d2137] lg:block">
        <div className="relative flex h-full flex-col justify-between gap-8 p-10">
          <Link to="/">
            <Logo />
          </Link>
          <img
            src="/images/samples/crew-collage.jpg"
            alt=""
            className="edge-fade mx-auto max-h-[62vh] w-auto max-w-[520px] object-contain opacity-90"
            loading="lazy"
            decoding="async"
          />
          <div>
            <p className="mono mb-4 flex items-center gap-2 text-[10.5px] uppercase tracking-widest text-amber">
              <ShieldCheck className="size-3.5" />
              {t("signin.integrityIntact")}
            </p>
            <h2 className="max-w-md font-display text-[34px] font-extrabold leading-[1.08] tracking-tight">
              {t("signin.panelHeadline")}
            </h2>
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-fog">
              {t("getapp.underButtons")}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <h1 className="mt-8 font-display text-[27px] font-bold tracking-tight lg:mt-0">
            {step === "code"
              ? t("signin.codeTitle")
              : invitedEmail
                ? t("signin.joinEyebrow")
                : t("signin.welcomeBack")}
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-fog">
            {step === "code"
              ? t("signin.codeBody", { email: email.trim().toLowerCase() })
              : invitedEmail
                ? t("signin.joinTitle")
                : t("signin.subtitle")}
          </p>

          {step === "code" ? (
            /* Code step — nothing else on screen competes with the six digits. */
            <form onSubmit={verifyCode} className="mt-7 space-y-3">
              <label className="block">
                <span className="label">{t("signin.codeLabel")}</span>
                <input
                  ref={codeRef}
                  aria-label={t("signin.codeLabel")}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  className={`${inputClass} mono text-center text-[22px] tracking-[0.4em]`}
                />
              </label>

              {error && (
                <p className="rounded-[8px] border border-alert/40 bg-alert/10 px-3 py-2 text-[12.5px] text-alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy !== null || code.length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-amber px-4 py-3 text-[14px] font-bold text-ink transition-colors hover:bg-amber-deep disabled:opacity-60"
              >
                {busy === "verify" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
                {t("signin.continue")}
              </button>

              <button
                type="button"
                onClick={() => void sendCode()}
                disabled={cooldown > 0 || busy !== null}
                className="mono block w-full py-1 text-[11.5px] text-fog transition-colors hover:text-chalk disabled:hover:text-fog"
              >
                {cooldown > 0
                  ? t("signin.resendIn", { seconds: cooldown })
                  : t("signin.resend")}
              </button>

              {invitedEmail ? null : (
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError(null);
                    setCode("");
                  }}
                  className="mono block w-full text-[11.5px] text-fog transition-colors hover:text-chalk"
                >
                  {t("signin.changeEmail")}
                </button>
              )}
            </form>
          ) : (
            <>
              {/*
                Apple leads the stack and shares Google's styling: Guideline 4.8 asks for the
                privacy-preserving option to be no less prominent than the third-party one, and
                "first, identical treatment" is the reading no reviewer argues with.
              */}
              <button
                type="button"
                onClick={withApple}
                disabled={busy !== null}
                className={`mt-7 ${buttonClass}`}
              >
                {busy === "apple" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <AppleIcon className="size-4" />
                )}
                {t("signin.apple")}
              </button>

              <button
                type="button"
                onClick={withGoogle}
                disabled={busy !== null}
                className={`mt-3 ${buttonClass}`}
              >
                {busy === "google" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.6c-.1 1.1-.8 2.7-2.4 3.8v3.1h3.9c2.3-2.1 3.4-5.2 3.4-8.8Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.3 1.2-4 1.2-3.1 0-5.7-2-6.7-4.8H1.3v3.2C3.3 21.5 7.3 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.5c-.3-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5V6.3H1.3A11.9 11.9 0 0 0 0 12c0 1.9.5 3.8 1.3 5.4l4-2.9Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.7c1.8 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.5 1.3 6.3l4 3.2C6.3 6.7 8.9 4.7 12 4.7Z"
                    />
                  </svg>
                )}
                {t("signin.google")}
              </button>

              {/* "More" keeps the rare paths one tap away instead of stacked in everyone's face. */}
              {step === "choose" && !showMore ? (
                <button
                  type="button"
                  onClick={() => setShowMore(true)}
                  disabled={busy !== null}
                  className={`mt-3 ${buttonClass}`}
                >
                  <ChevronDown className="size-4" />
                  {t("signin.more")}
                </button>
              ) : null}

              {showMore && step === "choose" ? (
                <>
                  {providers.data?.x ? (
                    <button
                      type="button"
                      onClick={withX}
                      disabled={busy !== null}
                      className={`mt-3 ${buttonClass}`}
                    >
                      {busy === "x" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <XIcon className="size-4" />
                      )}
                      {t("signin.x")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError(null);
                    }}
                    disabled={busy !== null}
                    className={`mt-3 ${buttonClass}`}
                  >
                    <Mail className="size-4" />
                    {t("signin.continueEmail")}
                  </button>
                </>
              ) : null}

              {step === "email" ? (
                <>
                  <div className="my-6 flex items-center gap-3">
                    <span className="h-px flex-1 bg-line" />
                    <span className="mono text-[10px] uppercase tracking-widest text-fog">
                      {t("signin.orEmail")}
                    </span>
                    <span className="h-px flex-1 bg-line" />
                  </div>

                  <form onSubmit={sendCode} className="space-y-3">
                    <label className="block">
                      <span className="label">{t("signin.workEmail")}</span>
                      <input
                        ref={emailRef}
                        aria-label={t("signin.workEmail")}
                        type="email"
                        required
                        readOnly={Boolean(invitedEmail)}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("signin.emailPlaceholder")}
                        className={`${inputClass}${invitedEmail ? " cursor-not-allowed text-fog" : ""}`}
                      />
                      <span className="mt-1.5 block text-[11.5px] leading-relaxed text-fog">
                        {invitedEmail ? t("signin.inviteLocked") : t("signin.codeHelp")}
                      </span>
                    </label>

                    {error && (
                      <p className="rounded-[8px] border border-alert/40 bg-alert/10 px-3 py-2 text-[12.5px] text-alert">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={busy !== null}
                      className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-amber px-4 py-3 text-[14px] font-bold text-ink transition-colors hover:bg-amber-deep disabled:opacity-60"
                    >
                      {busy === "send" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <ArrowRight className="size-4" />
                      )}
                      {t("signin.sendCode")}
                    </button>
                  </form>
                </>
              ) : null}

              {step === "choose" && error ? (
                <p className="mt-3 rounded-[8px] border border-alert/40 bg-alert/10 px-3 py-2 text-[12.5px] text-alert">
                  {error}
                </p>
              ) : null}
            </>
          )}

          <p className="mt-6 flex items-start gap-2 text-[11.5px] leading-relaxed text-fog">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-verified" />
            <span>
              {t("signin.privacy")}{" "}
              <Link
                to="/privacy"
                className="underline decoration-line underline-offset-2 hover:text-chalk"
              >
                {t("signin.privacyLink")}
              </Link>
              .
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
