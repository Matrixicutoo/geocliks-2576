import { betterAuth } from "better-auth";
import { captcha, twoFactor } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { runableManagedAuth } from "@runablehq/managed-auth/server";
import { autumn } from "autumn-js/better-auth";
import { Autumn } from "autumn-js";
import { db } from "./database";
import { resetPasswordEmail, welcomeEmail } from "./services/email-templates";

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
 * Cloudflare Turnstile guards the two endpoints a bot actually abuses: account creation and the
 * password-reset mailer. It is deliberately NOT on `/sign-in/email`.
 *
 * The captcha plugin is all-or-nothing per endpoint — every client hitting a guarded path must send
 * an `x-captcha-response` header or it gets a 400. Turnstile has no native React Native widget
 * (Cloudflare requires a browser/WebView), so guarding sign-in would instantly lock the phone app —
 * and therefore the whole field crew — out of the product. Sign-in is protected by the rate limits
 * below instead, which is the right tool for brute force anyway. The mobile app sends people to the
 * website to register, so it never needs to solve a challenge.
 *
 * The spread is guarded on the secret being present so a missing key can never lock anyone out: no
 * key means no captcha rather than a 500 on every sign-up.
 */
const captchaPlugins = process.env.TURNSTILE_SECRET_KEY
  ? [
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: process.env.TURNSTILE_SECRET_KEY,
        endpoints: ["/sign-up/email", "/request-password-reset"],
      }),
    ]
  : [];

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
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resetPasswordEmail({ to: user.email, url });
    },
  },
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
   * Sign-in carries no captcha (the phone app has to reach it), so brute force is bounded here
   * instead. Windows are in seconds and counted per IP. The generous 60/min default keeps normal
   * session polling untouched; the three named paths are the ones worth throttling hard.
   */
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 60, max: 20 },
      "/sign-up/email": { window: 3600, max: 5 },
      "/request-password-reset": { window: 3600, max: 5 },
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
     * Authenticator-app (TOTP) second step. Opt-in per account: the UI only offers it on
     * /app/profile to owners and admins, because a field crew signing in on a shared truck phone
     * should not be forced through an authenticator app.
     *
     * Enabling it changes the sign-in response for that account: `signIn.email` returns
     * `{ twoFactorRedirect: true }` with no session instead of a token, and the session is only
     * minted once `twoFactor.verifyTotp` succeeds. Both the website and the phone app handle that
     * second step, so an owner with 2FA on can still sign in on either surface.
     *
     * `issuer` is what shows up as the account name inside Google Authenticator / Authy / 1Password.
     */
    twoFactor({ issuer: "GeoCliks" }),
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
          // Best effort: a failed welcome email must never block the sign-up.
          await welcomeEmail({ to: user.email, name: user.name });
        },
      },
    },
  },
});
