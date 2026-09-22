import { betterAuth } from "better-auth";
import { captcha, emailOTP } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { runableManagedAuth } from "@runablehq/managed-auth/server";
import { autumn } from "autumn-js/better-auth";
import { Autumn } from "autumn-js";
import { db } from "./database";
import { loginCodeEmail, welcomeEmail } from "./services/email-templates";

/** Reads AUTUMN_SECRET_KEY from the root .env automatically. */
const autumnSdk = new Autumn();

/**
 * Native clients send no `Origin` header, but the Better Auth Expo plugin still replays the stored
 * session cookie. Better Auth 1.6 hard-rejects any cookie-bearing request that arrives without an
 * Origin (`MISSING_OR_NULL_ORIGIN`), which broke email sign-in inside the phone app while leaving
 * the browser untouched. A browser always sends Origin on a POST, so an originless POST is never a
 * cross-site attack: stamping our own base URL on those requests restores native sign-in without
 * loosening the origin check that protects the web app. Requests that already carry an Origin or a
 * Referer are passed through untouched and still get the full check.
 *
 * The header is not always simply absent: the release Android build sends the *literal string*
 * `Origin: null` (an opaque origin, which is also what sandboxed WebViews and `file://` produce).
 * That value is truthy, so an earlier version of this guard bailed out and let the request through
 * to be rejected with `MISSING_OR_NULL_ORIGIN` — the "Missing or null Origin" error on the phone.
 * A real browser never sends the literal `"null"` on a same-site POST, so `"null"` is treated the
 * same as a missing header rather than as a real origin worth checking.
 */
const isOpaqueOrigin = (value: string | null) => !value || value.trim().toLowerCase() === "null";

export function withNativeOrigin(request: Request): Request {
  const base = process.env.WEBSITE_URL;
  if (!base) return request;
  if (!isOpaqueOrigin(request.headers.get("origin"))) return request;
  if (!isOpaqueOrigin(request.headers.get("referer"))) return request;
  const headers = new Headers(request.headers);
  headers.set("origin", new URL(base).origin);
  // A leftover literal `null` Referer would fail the same check further down the chain.
  if (isOpaqueOrigin(headers.get("referer"))) headers.delete("referer");
  return new Request(request.url, {
    method: request.method,
    headers,
    body: request.body,
    redirect: "manual",
    // Streaming a request body through a rebuilt Request requires this in undici/Bun.
    duplex: "half",
  } as RequestInit);
}

/**
 * Explicit allow-list for Better Auth's origin / callback-URL check.
 *
 * This used to echo back whatever `Origin` the caller sent (`origin ? [origin] : ["*"]`), which
 * trusted every origin and made the check a no-op. The list below is every surface that is
 * legitimately allowed to sign in:
 *
 *  - `WEBSITE_URL` plus the bare apex and `www` host for the production site
 *  - `https://*.runable.site` — the Runable preview hosts for web (4200), mobile web (4300) and
 *    desktop (4400), and the `fallback.runable.site` host `www` redirects through. Wildcard
 *    patterns are matched against the request origin by Better Auth's `matchesOriginPattern`.
 *  - localhost / 127.0.0.1 / the Vite LAN address on the three fixed ports from `__ports.cjs`
 *  - the Expo deep-link scheme, so native deep links back into the app are accepted
 *  - the Runable managed-auth issuer origin, which drives Google sign-in
 *
 * The phone app itself sends no `Origin` at all; `withNativeOrigin()` above stamps the
 * `WEBSITE_URL` origin on those requests, so native sign-in is covered by the first entry.
 */
const MOBILE_SCHEME = "runable-timemar-nt1ia4s";

function originOf(value: string | undefined): string[] {
  if (!value) return [];
  try {
    return [new URL(value).origin];
  } catch {
    return [];
  }
}

const TRUSTED_ORIGINS = [
  ...new Set([
    ...originOf(process.env.WEBSITE_URL),
    "https://geocliks.com",
    "https://www.geocliks.com",
    "https://*.runable.site",
    ...[4200, 4300, 4400].flatMap((port) => [
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`,
      `http://169.254.0.21:${port}`,
    ]),
    `${MOBILE_SCHEME}://`,
    ...originOf(process.env.VITE_RUNABLE_AUTH_ISSUER),
  ]),
];

/**
 * Cloudflare Turnstile is kept in the build but guards nothing, and the empty list is the point.
 *
 * It used to guard `/sign-up/email` and `/request-password-reset`, the two endpoints a bot abuses.
 * Both are gone: this app has no passwords, so there is no reset mailer, and there is no separate
 * sign-up either — `/sign-in/email-otp` creates the account on first use.
 *
 * What replaced them is `/email-otp/send-verification-otp`, and that one CANNOT be guarded. The
 * captcha plugin is all-or-nothing per endpoint: every client hitting a guarded path must send an
 * `x-captcha-response` header or it gets a 400. Turnstile has no native React Native widget
 * (Cloudflare requires a browser/WebView), and asking for a code is now the phone app's only way
 * in — guarding it would lock out the entire field crew. That is the same reason sign-in was never
 * guarded. Abuse of the mailer is bounded by the hard per-IP rate limit below instead.
 *
 * The plugin stays wired (rather than deleted) so re-guarding a future browser-only endpoint is a
 * one-line change, and it stays guarded on the secret being present so a missing key can never
 * lock anyone out.
 */
const captchaPlugins: ReturnType<typeof captcha>[] = [];

/**
 * A store reviewer cannot sign in to GeoCliks the way everyone else does.
 *
 * The only credential this app issues is a six-digit code mailed to the address being signed in
 * with (see the `emailOTP` plugin below) — there is no password to hand Google, and a reviewer has
 * no access to any mailbox of ours. Play requires working credentials in "Sign in details" or the
 * submission is rejected, so one single address is pinned to a fixed code instead.
 *
 * Both halves come from the environment and the whole thing is inert unless BOTH are set, so a
 * deployment that does not define them behaves exactly as before — no demo door exists at all.
 * The address is a real account like any other (same tables, same session, same permissions); the
 * only difference is that its code does not rotate and is never mailed.
 *
 * The code is not a secret worth protecting: it grants access to a seeded demo workspace holding
 * nothing but sample data. It is rotated by changing the env var and restarting, and the door is
 * closed for good by removing the vars once the app is live.
 */
const REVIEW_DEMO_EMAIL = process.env.REVIEW_DEMO_EMAIL?.trim().toLowerCase();
const REVIEW_DEMO_OTP = process.env.REVIEW_DEMO_OTP?.trim();
const reviewDemoReady = Boolean(REVIEW_DEMO_EMAIL && REVIEW_DEMO_OTP);
const isReviewDemoEmail = (email: string) =>
  reviewDemoReady && email.trim().toLowerCase() === REVIEW_DEMO_EMAIL;

/**
 * "Continue with X" is a plain OAuth 2.0 provider, not part of Runable's managed broker (which
 * supports google/apple/microsoft only), so it needs this app's own X developer credentials.
 *
 * Guarded on both keys being present: without them the provider is simply absent, so the endpoint
 * 404s instead of the whole auth handler throwing on boot. The client asks `site.authProviders`
 * whether to render the button, so a missing key hides the button rather than shipping a control
 * that fails when pressed.
 *
 * Scopes are deliberately left at the library default. X rejects the entire authorization request
 * if a scope string is wrong, and the email address is not granted by a scope at all - it is
 * switched on in the X app settings ("Request email from users"), which is what better-auth's own
 * docs instruct. That setting is not optional here: the email address is this app's account key
 * (invites, membership, delivery notifications), so an X account with no address cannot be used.
 */
const xLoginConfigured = Boolean(
  process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET,
);

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  /**
   * No passwords anywhere. `emailAndPassword` is left explicitly disabled rather than deleted so
   * it is obvious this is a decision and not an omission: the email route in and out of this app
   * is the six-digit code issued by the `emailOTP` plugin below, and Google / X mint their own
   * sessions. Disabling it removes `/sign-in/email`, `/sign-up/email`, `/request-password-reset`
   * and `/reset-password` from the API surface.
   *
   * Accounts that still carry a password hash from before keep it in the `account` table, unused
   * and unreachable — the endpoint that would check it no longer exists. Those people sign in with
   * a code to the same address and land in the same account, because the address is the key.
   */
  emailAndPassword: { enabled: false },
  socialProviders: xLoginConfigured
    ? {
        twitter: {
          clientId: process.env.TWITTER_CLIENT_ID as string,
          clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
        },
      }
    : undefined,
  /**
   * Without this, "Continue with X" fails with `account_not_linked` for anyone who already has a
   * GeoCliks account on the same address - which is most people, since the website is where
   * everybody registers. Better Auth refuses to attach a social login to an existing user unless
   * the provider is named trusted, precisely because auto-linking on a matching email means the
   * provider's word decides who gets in.
   *
   * X is trusted here for one reason: it only releases an address that the account holder has
   * confirmed on X's side (the app must ask for it explicitly, and X withholds unconfirmed
   * addresses). So an X login carrying `luc@example.com` is X asserting that person controls that
   * mailbox, which is the same assurance the password reset flow relies on.
   *
   * Only `twitter` is listed. Google arrives through the managed broker and is unaffected, and no
   * provider whose id could be chosen by a user is trusted - that is what launders trust.
   */
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["twitter"],
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: TRUSTED_ORIGINS,
  /**
   * Rate limiting buckets by client IP, and Better Auth reads the first entry of `x-forwarded-for`
   * by default. geocliks.com is served through Cloudflare, and a client can put anything it likes in
   * `x-forwarded-for` — a bot could hand itself a fresh bucket on every request. `cf-connecting-ip`
   * is written by Cloudflare's edge and overwrites whatever the client sent, so it is checked first;
   * `x-forwarded-for` stays as the fallback for any path that does not go through Cloudflare.
   */
  advanced: {
    ipAddress: { ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"] },
  },
  /**
   * Sign-in carries no captcha (the phone app has to reach it), so abuse is bounded here instead.
   * Windows are in seconds and counted per IP. The generous 60/min default keeps normal session
   * polling untouched; the two named paths are the ones worth throttling hard.
   *
   * `send-verification-otp` is the mailer: every call puts a message in somebody's inbox from our
   * sending domain, so an unbounded one is a spam cannon pointed at our own reputation. 10 an hour
   * per IP is far above honest use (ask, mistype, ask again, plus a couple of resends) and far
   * below useful for flooding. Note the app's own `resendAfter` cooldown is a UI courtesy, not a
   * control — this is the control.
   *
   * `sign-in/email-otp` is the guess: six digits is a million combinations, and the plugin already
   * burns the code after 3 wrong attempts. The limit exists to stop someone cycling fresh codes
   * and guessing 10 times at each.
   */
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/email-otp/send-verification-otp": { window: 3600, max: 10 },
      "/sign-in/email-otp": { window: 300, max: 10 },
    },
  },
  plugins: [
    ...runableManagedAuth({
      applicationId: process.env.APPLICATION_ID!,
      issuer: process.env.VITE_RUNABLE_AUTH_ISSUER!,
    }),
    expo(),
    autumn(),
    /**
     * The only email credential this app has: a six-digit code, mailed on request.
     *
     * `/sign-in/email-otp` doubles as registration — when the address is unknown the plugin
     * creates the account with `emailVerified: true` and mints the session in the same call. That
     * is why there is no sign-up endpoint any more, and why an invited crew member cannot end up
     * with an account whose address they do not control.
     *
     * - `expiresIn` 600 (10 minutes, not the 5-minute default): a code has to survive the walk
     *   from the truck to somewhere with signal, and the mail itself can take a minute to land.
     * - `allowedAttempts` 3 — the plugin burns the code after the third wrong guess, so a
     *   shoulder-surfed digit cannot be brute-forced from the remaining five.
     * - `storeOTP: "hashed"` — the codes live in the `verification` table, and a dump of that
     *   table should not be a list of live credentials. It also forces `resendStrategy: "rotate"`
     *   (the default), which is the safer behaviour anyway: "resend" issues a NEW code and the
     *   old one stops working.
     * - `disableSignUp` is left off on purpose. Turning it on would mean a brand-new customer
     *   typing their address gets "invalid code" instead of an account.
     * - `sendVerificationOnSignUp` is off: the sign-in code already proved the address.
     *
     * The mail is awaited rather than fired and forgotten. Better Auth's own docs suggest not
     * awaiting it to avoid a timing side-channel (a known address takes longer than an unknown
     * one), but that leak does not exist here — this endpoint mails a code for ANY address,
     * known or not, and answers `{ success: true }` either way. Awaiting means a mail provider
     * outage surfaces as a visible error on the button instead of a code that never arrives.
     */
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 3,
      storeOTP: "hashed",
      /**
       * Everyone gets the library's own random code; the single review address (if configured)
       * gets the fixed one. Returning `undefined` is the documented way to defer to the default
       * generator, so this is the only line that behaves differently for that one address.
       */
      generateOTP: ({ email }) => (isReviewDemoEmail(email) ? REVIEW_DEMO_OTP : undefined),
      sendVerificationOTP: async ({ email, otp, type }) => {
        // The review address has no mailbox behind it and its code is already known — mailing it
        // would only bounce off a dead address and hurt the sending domain's reputation.
        if (isReviewDemoEmail(email)) return;
        await loginCodeEmail({ to: email, otp, type });
      },
    }),
    /**
     * No TOTP second step. The `twoFactor` plugin only ever hooks `/sign-in/email`,
     * `/sign-in/username` and `/sign-in/phone-number` — all three are gone with passwords, so it
     * would guard nothing while still showing an enrolment UI that could never be enforced. A
     * fresh 6-digit code mailed to a verified address is the whole credential now: possession of
     * the mailbox is what the second factor used to prove on a reset anyway.
     */
    ...captchaPlugins,
  ],
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          try {
            await autumnSdk.customers.getOrCreate({
              customerId: user.id,
              name: user.name,
              email: user.email,
            });
          } catch (e) {
            console.error("[autumn] Failed to create customer on sign-up:", e);
          }
          // Best effort: a failed welcome email must never block the sign-up. The review address
          // is skipped for the same reason its code is not mailed — nothing is listening there.
          if (!isReviewDemoEmail(user.email)) {
            await welcomeEmail({ to: user.email, name: user.name });
          }
        },
      },
    },
  },
});
