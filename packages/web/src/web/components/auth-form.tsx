import { useState } from "react";
import { Link, useLocation, useSearchParams } from "wouter";
import { Loader2, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";
import { authClient, captchaErrorKey, setAuthToken } from "../lib/auth";
import { orpc } from "../lib/api";
import { Logo } from "./logo";
import { Turnstile } from "./turnstile";
import { TwoFactorStep } from "./two-factor-step";
import { useT } from "../lib/i18n";
import { useAuthProviders } from "../queries/site";

export type AuthMode = "sign-in" | "sign-up";

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
 * Shared body of /sign-in and /sign-up.
 *
 * The two are separate URLs — a person arriving from an invite, an email, or the marketing site
 * lands on one purpose, not on a tabbed form they have to read twice. The logic is shared here
 * rather than duplicated so the auth handling, 2FA hand-off and bearer-token dance can never
 * drift apart between the two pages.
 */
/**
 * The phone app cannot register natively: new accounts are gated by Turnstile, which has no React
 * Native widget and is broken inside iOS WKWebView. The app therefore hands sign-up to this page
 * in the browser with `?app=1`, and on success we hand the browser straight back to the app
 * through its deep link instead of routing on into the website.
 *
 * The scheme is hardcoded deliberately. Reading the return target out of the query string would
 * turn this page into an open redirect: anyone could mail a /sign-up?app=<their-url> link and
 * bounce a freshly-registered user - bearer token and all - wherever they liked.
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

export function AuthForm({ mode }: { mode: AuthMode }) {
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
  // Set when /sign-up bounced someone here because their account already existed, or when a
  // social sign-in came back failed (X hands control back through errorCallbackURL, not a promise).
  // The notice value can arrive with the OAuth code glued on, so compare only the leading word.
  const notice = (searchParams.get("notice") ?? "").split("?")[0];
  const socialError = oauthErrorCode(
    typeof window === "undefined" ? "" : window.location.search,
  );
  const [error, setError] = useState<string | null>(
    notice === "exists"
      ? t("signin.existsSignIn")
      : notice === "social" || socialError
        ? `${t("signin.authError")}${socialError ? ` (${socialError})` : ""}`
        : null,
  );
  // Sign-up reached from an invite is a join, not a workspace creation: the person is landing
  // in someone else's Teamspace, so asking them to name a business and pressing "create
  // workspace" at them is wrong on both counts.
  const joining = mode === "sign-up" && Boolean(invitedEmail);
  const [name, setName] = useState("");
  // The business name becomes the Teamspace name: the workspace is auto-provisioned on the
  // first API call, so setting it is a rename issued right after the account exists.
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState(invitedEmail);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState<"google" | "x" | "email" | null>(null);
  // Hides the X button unless the server actually holds X credentials.
  const providers = useAuthProviders();
  // Turnstile tokens are single-use. Bumping this remounts the widget for the next attempt.
  const [captchaNonce, setCaptchaNonce] = useState(0);
  /**
   * Accounts with authenticator 2FA on get no session from `signIn.email` — it answers
   * `{ twoFactorRedirect: true }` and the session is minted only after the code is verified.
   */
  const [needsCode, setNeedsCode] = useState(false);

  /** Carry the invite context across to the sibling page so a switch never loses it. */
  function siblingHref(to: AuthMode) {
    const params = new URLSearchParams();
    if (invitedEmail) params.set("email", invitedEmail);
    if (next !== "/app") params.set("next", next);
    if (appReturn) params.set("app", "1");
    const qs = params.toString();
    return `/${to === "sign-in" ? "sign-in" : "sign-up"}${qs ? `?${qs}` : ""}`;
  }

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

  async function withEmail(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy("email");
    try {
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name: name || email.split("@")[0] });
      if (result.error) {
        // better-auth answers a duplicate sign-up with "User already exists. Use another email."
        // On an invite the address is locked to the invited person, so "use another email" is
        // advice they cannot follow — it dead-ends someone who simply already has an account.
        // Send them to the sign-in page on the same address instead, invite context intact.
        const exists =
          result.error.code === "USER_ALREADY_EXISTS" ||
          /already exists/i.test(result.error.message ?? "");
        if (mode === "sign-up" && exists) {
          const params = new URLSearchParams();
          if (email) params.set("email", email);
          if (next !== "/app") params.set("next", next);
          if (appReturn) params.set("app", "1");
          params.set("notice", "exists");
          navigate(`/sign-in?${params.toString()}`);
          return;
        }
        const captchaKey = captchaErrorKey(result.error.code);
        setError(captchaKey ? t(captchaKey) : (result.error.message ?? t("signin.authError")));
        return;
      }
      if ((result.data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
        setNeedsCode(true);
        return;
      }
      const token = (result.data as { token?: string | null } | null)?.token;
      if (mode === "sign-up" && !joining && businessName.trim().length >= 2) {
        // Store the bearer first: in a cross-site iframe the session cookie is dropped and the
        // token is the only thing that authenticates this call. A failure never blocks sign-up —
        // the Teamspace page asks for the name again.
        if (token) setAuthToken(token);
        await orpc.orgs.update.call({ name: businessName.trim() }).catch(() => undefined);
      }
      await finish(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
      if (mode === "sign-up") setCaptchaNonce((n) => n + 1);
    }
  }

  if (needsCode) return <TwoFactorStep onVerified={finish} />;

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
            {joining
              ? t("signin.joinEyebrow")
              : mode === "sign-in"
                ? t("signin.welcomeBack")
                : t("signin.createYourWorkspace")}
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-fog">
            {joining
              ? t("signin.joinTitle")
              : mode === "sign-in"
                ? t("signin.subtitle")
                : t("signin.startDocumenting")}
          </p>

          <button
            type="button"
            onClick={withGoogle}
            disabled={busy !== null}
            className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-[12px] border border-line bg-ink-2 px-4 py-3 text-[13.5px] font-semibold text-chalk transition-colors hover:border-fog disabled:opacity-60"
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

          {providers.data?.x ? (
            <button
              type="button"
              onClick={withX}
              disabled={busy !== null}
              className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-[12px] border border-line bg-ink-2 px-4 py-3 text-[13.5px] font-semibold text-chalk transition-colors hover:border-fog disabled:opacity-60"
            >
              {busy === "x" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XIcon className="size-4" />
              )}
              {t("signin.x")}
            </button>
          ) : null}

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="mono text-[10px] uppercase tracking-widest text-fog">
              {t("signin.orEmail")}
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={withEmail} className="space-y-3">
            {mode === "sign-up" && (
              <>
                <label className="block">
                  <span className="label">{t("signin.name")}</span>
                  <input
                    aria-label={t("signin.name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dana Whitfield"
                    className="mt-1.5 w-full rounded-[8px] border border-line bg-ink-2 px-3 py-2.5 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber"
                  />
                </label>
                {joining ? null : (
                  <label className="block">
                    <span className="label">{t("signin.businessName")}</span>
                    <input
                      aria-label={t("signin.businessName")}
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Whitfield Contracting"
                      className="mt-1.5 w-full rounded-[8px] border border-line bg-ink-2 px-3 py-2.5 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber"
                    />
                    <span className="mt-1.5 block text-[11.5px] leading-relaxed text-fog">
                      {t("signin.businessNameHelp")}
                    </span>
                  </label>
                )}
              </>
            )}
            <label className="block">
              {mode === "sign-up" ? (
                <span className="label">{t("signin.workEmail")}</span>
              ) : null}
              <input
                aria-label={t("signin.workEmail")}
                type="email"
                required
                readOnly={Boolean(invitedEmail)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("signin.emailPlaceholder")}
                className={`mt-1.5 w-full rounded-[8px] border border-line bg-ink-2 px-3 py-2.5 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber${
                  invitedEmail ? " cursor-not-allowed text-fog" : ""
                }`}
              />
              {invitedEmail ? (
                <span className="mt-1.5 block text-[11.5px] leading-relaxed text-fog">
                  {t("signin.inviteLocked")}
                </span>
              ) : null}
            </label>
            <label className="block">
              {mode === "sign-up" ? (
                <span className="label">{t("signin.password")}</span>
              ) : null}
              <div className="relative mt-1.5">
                <input
                  aria-label={t("signin.password")}
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("signin.passwordHint")}
                  className="w-full rounded-[8px] border border-line bg-ink-2 py-2.5 pl-3 pr-12 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber"
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

            {mode === "sign-up" && <Turnstile nonce={captchaNonce} />}

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
              {busy === "email" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              {joining
                ? t("signin.submitJoin")
                : mode === "sign-in"
                  ? t("signin.submitSignIn")
                  : t("signin.submitCreateWorkspace")}
            </button>
          </form>

          {/* Password recovery belongs on sign-in, and on any invited arrival: an invited person
              who already has an account is exactly who needs it most. */}
          {(mode === "sign-in" || Boolean(invitedEmail)) && (
            <Link
              to="/reset-password"
              className="mono mt-4 inline-block text-[11.5px] text-fog hover:text-chalk"
            >
              {t("signin.forgot")}
            </Link>
          )}

          <p className="mt-5 text-[12.5px] leading-relaxed text-fog">
            {mode === "sign-in" ? t("signin.noAccount") : t("signin.haveAccount")}{" "}
            <Link
              to={siblingHref(mode === "sign-in" ? "sign-up" : "sign-in")}
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-2 hover:decoration-amber"
            >
              {mode === "sign-in" ? t("signin.goCreate") : t("signin.goSignIn")}
            </Link>
          </p>

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
