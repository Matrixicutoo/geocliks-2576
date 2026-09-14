import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Loader2, ShieldCheck, ArrowRight, MailCheck, Smartphone, LogOut } from "lucide-react";
import { orpc } from "../lib/api";
import { authClient, setAuthToken } from "../lib/auth";
import { Logo } from "../components/logo";
import { useT } from "../lib/i18n";

/**
 * Deep link into the mobile app's join screen. A QR code has to encode an https URL — a raw
 * custom-scheme QR is dead paper for anyone without the app installed — so the sticker points
 * here and this page hands the crew member off to the app.
 *
 * Real App Links / Universal Links (the OS opening the app with no interstitial) need a
 * registered, verified domain plus published store listings; until then this is the handoff.
 */
const APP_SCHEME = "runable-timemar-nt1ia4s";

function isMobileUA(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Invite landing page. The link in the invite email and the printed QR code point here. On a
 * phone it tries to bounce straight into the GeoCliks app's join screen, where the crew member
 * confirms the code; the browser flow stays as the fallback (and is what desktop always gets).
 */
export default function JoinPage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const [, navigate] = useLocation();
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const session = authClient.useSession();

  const invite = useQuery(
    orpc.team.inviteInfo.queryOptions({ input: { code }, enabled: Boolean(code), retry: false }),
  );
  const accept = useMutation(
    orpc.team.acceptInvite.mutationOptions({
      onSuccess: () => navigate("/app"),
      onError: (e: Error) => setError(e.message),
    }),
  );
  /**
   * Signed-out acceptance. The invite link IS the credential — whoever holds it was handed it by
   * someone who already has the workspace, so asking them to prove a mailbox they may not even
   * read on this phone buys nothing and loses people. A name (and, on an open QR invite that
   * names nobody, an address) is the whole form; the server mints the session and hands the
   * bearer back in the body.
   */
  const claim = useMutation(
    orpc.team.claimInvite.mutationOptions({
      onSuccess: async (result: { token: string }) => {
        setAuthToken(result.token);
        // Confirm the bearer really resolves a session before routing anywhere.
        await authClient.getSession({ query: { disableCookieCache: true } });
        /**
         * `getSession()` is a plain fetch — it does NOT write to the reactive session store that
         * `useSession()` reads, and `claimInvite` is an oRPC call so it never trips Better Auth's
         * own sign-in signal the way `/sign-in/email-otp` does. Without this notify, /app mounts
         * holding the stale signed-out value, ProtectedRoute sees no session and bounces the crew
         * member straight back to /sign-in with a perfectly good session in hand. Notifying makes
         * the store refetch (and flip to `isPending`) synchronously, so the guard waits for it.
         */
        authClient.$store.notify("$sessionSignal");
        navigate("/app");
      },
      onError: (e: Error) => setError(e.message),
    }),
  );
  const [claimName, setClaimName] = useState("");
  const [claimEmail, setClaimEmail] = useState("");

  const signedIn = Boolean(session.data?.user);
  // Acceptance is refused server-side unless the account email matches the invited one, so the
  // wrong-account case is caught here too rather than offering a button that can only fail.
  const invitedEmail = invite.data?.email ?? "";
  const currentEmail = session.data?.user.email ?? "";
  const mismatch =
    signedIn &&
    Boolean(invitedEmail) &&
    invitedEmail.trim().toLowerCase() !== currentEmail.trim().toLowerCase();
  /**
   * The one authentication route: the code mailed to the invited address signs in an existing
   * account and creates one for a new address, so there is no second page to choose between.
   */
  const signInHref = `/sign-in?email=${encodeURIComponent(invitedEmail)}&next=${encodeURIComponent(`/join/${code}`)}`;
  const hasAccount = Boolean(invite.data?.hasAccount);
  // An open invite (a QR handed over in person) carries no address, so there is nobody to look
  // up and no way to tell whether this person already has an account — the page offers both.
  const openInvite = Boolean(invite.data?.open);
  const onPhone = useMemo(isMobileUA, []);
  const appLink = `${APP_SCHEME}://join?code=${encodeURIComponent(code)}`;
  const tried = useRef(false);
  const [stayedOnWeb, setStayedOnWeb] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  // Put the caret in the name field once the claim form is actually on screen — via a ref rather
  // than `autoFocus`, which the a11y lint forbids.
  useEffect(() => {
    nameRef.current?.focus();
  }, [invite.data]);

  // One automatic attempt per page load, once the code is known to be a live invite. If the app
  // is not installed nothing happens and we reveal the browser path instead of leaving the person
  // staring at a dead screen.
  useEffect(() => {
    if (!onPhone || tried.current || !code || !invite.data) return;
    tried.current = true;
    window.location.href = appLink;
    const timer = window.setTimeout(() => setStayedOnWeb(true), 1600);
    return () => window.clearTimeout(timer);
  }, [onPhone, code, invite.data, appLink]);

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-5 py-12 text-chalk">
      <div className="w-full max-w-[420px]">
        <Link to="/">
          <Logo />
        </Link>

        {invite.isPending ? (
          <p className="mono mt-10 flex items-center gap-2 text-[12px] text-fog">
            <Loader2 className="size-4 animate-spin" /> {t("join.checking")}
          </p>
        ) : invite.isError ? (
          <>
            <h1 className="mt-9 font-display text-[25px] font-bold tracking-tight">
              {t("join.closedTitle")}
            </h1>
            <p className="mt-3 text-[13.5px] leading-relaxed text-fog">
              {t("join.closedBody")}
            </p>
            <Link
              to="/sign-in"
              className="mono mt-7 inline-flex items-center gap-2 rounded-[8px] border border-line px-4 py-2.5 text-[11.5px] uppercase tracking-widest text-chalk hover:border-fog"
            >
              {t("join.goSignIn")}
            </Link>
          </>
        ) : (
          <>
            <p className="label mt-9">{t("join.eyebrow")}</p>
            <h1 className="mt-2 font-display text-[25px] font-bold leading-tight tracking-tight">
              {t("join.headline", {
                inviter: invite.data.inviterName,
                workspace: invite.data.workspace,
              })}
            </h1>
            <div className="mono mt-6 space-y-2 border-l-2 border-amber pl-4 text-[11.5px] text-fog">
              <p>
                {invite.data.email
                  ? `${t("join.metaEmail")} · ${invite.data.email}`
                  : t("join.metaOpen")}
              </p>
              <p>
                {t("join.metaRole")} · {invite.data.role}
              </p>
              <p>
                {t("join.metaCode")} · {code.toUpperCase()}
              </p>
            </div>

            {onPhone && (
              <div className="mt-8 space-y-3 rounded-[12px] border border-line bg-ink-2 p-4">
                <a
                  href={appLink}
                  className="rounded-[8px] mono flex w-full items-center justify-center gap-2 bg-amber px-4 py-3 text-[11.5px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep"
                >
                  <Smartphone className="size-4" />
                  {t("join.openApp")}
                </a>
                <p className="text-[11.5px] leading-relaxed text-fog">
                  {t("join.appHint", { code: code.toUpperCase() })}
                </p>
                <Link
                  to={`/get-app?invite=${encodeURIComponent(code)}`}
                  className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-amber hover:text-amber-deep"
                >
                  <ArrowRight className="size-3.5" />
                  {t("getapp.title")}
                </Link>
              </div>
            )}

            {onPhone && !stayedOnWeb ? (
              <p className="mono mt-6 text-[11px] uppercase tracking-widest text-fog">
                {t("join.continueWeb")}
              </p>
            ) : null}

            {mismatch ? (
              <div className="rounded-[12px] mt-8 border border-alert/40 bg-alert/10 p-4">
                <p className="mono text-[11px] font-bold uppercase tracking-widest text-alert">
                  {t("join.mismatchTitle")}
                </p>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-fog">
                  {t("join.mismatchBody", { invited: invitedEmail, current: currentEmail })}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await authClient.signOut();
                    navigate(signInHref);
                  }}
                  className="mono mt-4 flex w-full items-center justify-center gap-2 rounded-[8px] border border-line px-4 py-2.5 text-[11.5px] uppercase tracking-widest text-chalk transition-colors hover:border-fog"
                >
                  <LogOut className="size-3.5" />
                  {t("join.signOutUse", { email: invitedEmail })}
                </button>
              </div>
            ) : signedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    accept.mutate({ code });
                  }}
                  disabled={accept.isPending}
                  className="rounded-[8px] mono mt-8 flex w-full items-center justify-center gap-2 bg-amber px-4 py-3 text-[11.5px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep disabled:opacity-60"
                >
                  {accept.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MailCheck className="size-4" />
                  )}
                  {t("join.accept", { workspace: invite.data.workspace })}
                </button>
                <p className="mt-3 text-[11.5px] text-fog">
                  {t("join.signedInAs", { email: session.data?.user.email ?? "" })}
                </p>
              </>
            ) : hasAccount ? (
              /* The invited address already has an account: a claim here would be a way into
                 somebody else's, so this person signs in with a code and accepts from inside. */
              <>
                <Link
                  to={signInHref}
                  className="rounded-[8px] mono mt-8 flex w-full items-center justify-center gap-2 bg-amber px-4 py-3 text-[11.5px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep"
                >
                  <ArrowRight className="size-4" />
                  {t("join.signInToAccept")}
                </Link>
              </>
            ) : (
              /* Frictionless path: name in, straight into the Teamspace. No code, no password. */
              <form
                className="mt-8 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setError(null);
                  claim.mutate({
                    code,
                    name: claimName.trim(),
                    ...(openInvite ? { email: claimEmail.trim().toLowerCase() } : {}),
                  });
                }}
              >
                <label className="block">
                  <span className="label">{t("join.yourName")}</span>
                  <input
                    ref={nameRef}
                    aria-label={t("join.yourName")}
                    value={claimName}
                    onChange={(e) => setClaimName(e.target.value)}
                    required
                    maxLength={80}
                    placeholder={t("join.yourNamePlaceholder")}
                    className="mt-1.5 w-full rounded-[8px] border border-line bg-ink-2 px-3 py-2.5 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber"
                  />
                </label>
                {openInvite ? (
                  <label className="block">
                    <span className="label">{t("signin.workEmail")}</span>
                    <input
                      aria-label={t("signin.workEmail")}
                      type="email"
                      required
                      value={claimEmail}
                      onChange={(e) => setClaimEmail(e.target.value)}
                      placeholder={t("signin.emailPlaceholder")}
                      className="mt-1.5 w-full rounded-[8px] border border-line bg-ink-2 px-3 py-2.5 text-[14px] text-chalk outline-none transition-colors placeholder:text-fog/60 focus:border-amber"
                    />
                    <span className="mt-1.5 block text-[11.5px] leading-relaxed text-fog">
                      {t("join.emailHint")}
                    </span>
                  </label>
                ) : null}
                <button
                  type="submit"
                  disabled={claim.isPending || claimName.trim().length < 1}
                  className="rounded-[8px] mono flex w-full items-center justify-center gap-2 bg-amber px-4 py-3 text-[11.5px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep disabled:opacity-60"
                >
                  {claim.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  {t("join.claim", { workspace: invite.data.workspace })}
                </button>
                <p className="text-[11.5px] leading-relaxed text-fog">
                  {openInvite
                    ? t("join.claimHintOpen")
                    : t("join.claimHint", { email: invite.data.email ?? "" })}
                </p>
                <Link
                  to={signInHref}
                  className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-amber hover:text-amber-deep"
                >
                  <ArrowRight className="size-3.5" />
                  {t("join.haveAccount")}
                </Link>
              </form>
            )}

            {error && (
              <p className="rounded-[8px] mt-4 border border-alert/40 bg-alert/10 px-3 py-2 text-[12.5px] text-alert">
                {error}
              </p>
            )}

            <p className="mt-8 flex items-start gap-2 text-[11.5px] leading-relaxed text-fog">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-verified" />
              {t("join.footer")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
