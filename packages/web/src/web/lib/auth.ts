import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { managedAuthClient } from "@runablehq/managed-auth/client";

/**
 * Both values come from the root `.env` and are present in every real deployment, but Vite types
 * `import.meta.env.*` as possibly-undefined because it cannot prove that at compile time.
 * ManagedAuthClientConfig requires both as plain strings, so fall back to empty strings: managed
 * auth is simply inactive without them, which is the same outcome as passing undefined, minus the
 * type error.
 */
const config = {
  applicationId: import.meta.env.VITE_APPLICATION_ID ?? "",
  issuer: import.meta.env.VITE_RUNABLE_AUTH_ISSUER ?? "",
};

/**
 * Storage key used by @runablehq/managed-auth's browser storage. Email/password sign-in returns its
 * bearer in the `set-auth-token` header instead of going through the managed exchange, so we persist
 * it under the same key — that keeps `managedAuth.getToken()` (and the oRPC bearer in lib/api.ts)
 * working, and makes sessions survive the cross-site preview iframe (web and desktop panels) where
 * the SameSite=Lax session cookie is dropped.
 */
const TOKEN_KEY = "runable.managed-auth.token";

/**
 * localStorage throws in a cross-site iframe when storage access is partitioned or blocked — which
 * is exactly how the desktop preview panel renders the app. Keep an in-memory copy so sign-in never
 * fails on a storage error; it just doesn't survive a reload in that context.
 */
let memoryToken = "";

const readStored = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
};

export const setAuthToken = (token: string) => {
  memoryToken = token;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage blocked (partitioned iframe) — memoryToken carries the session for this page life
  }
};

/** Bearer for the typed oRPC client and for session recovery. */
export const authToken = () => {
  let managed = "";
  try {
    managed = authClient.managedAuth.getToken();
  } catch {
    managed = "";
  }
  return managed || memoryToken || readStored();
};

/**
 * Turnstile token for the next guarded request. The captcha plugin reads `x-captcha-response` off
 * the request, and per-call `fetchOptions.headers` have a history of being dropped on these routes,
 * so the widget parks its token here and the global `onRequest` hook below attaches it. Tokens are
 * single-use: the widget clears and re-renders after every submit.
 */
let captchaToken = "";

export const setCaptchaToken = (token: string) => {
  captchaToken = token;
};

/**
 * The captcha plugin answers with its own raw codes and messages ("Missing CAPTCHA response"),
 * which mean nothing to a field crew. Map the two a real person can actually hit onto plain
 * instructions. Returning literal keys keeps `t()` type-checked against the catalog.
 *
 * Deliberately paired with NOT disabling the submit button: if Turnstile is unreachable for a
 * legitimate user, a dead button locks them out with no explanation, whereas letting them submit
 * and showing this message tells them what to do.
 */
export function captchaErrorKey(code?: string | null) {
  if (code === "MISSING_RESPONSE") return "signin.captchaMissing" as const;
  if (code === "VERIFICATION_FAILED") return "signin.captchaFailed" as const;
  return null;
}

/** Paths guarded by the captcha plugin on the server — keep in sync with `api/auth.ts`. */
const CAPTCHA_PATHS = ["/sign-up/email", "/request-password-reset"];

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_WEBSITE_URL ?? window.location.origin,
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
    auth: { type: "Bearer", token: () => authToken() },
    onRequest: (ctx) => {
      try {
        const { pathname } = new URL(ctx.url);
        if (captchaToken && CAPTCHA_PATHS.some((path) => pathname.endsWith(path))) {
          ctx.headers.set("x-captcha-response", captchaToken);
        }
      } catch {
        // malformed URL — let the request through and let the server answer
      }
      return ctx;
    },
    onSuccess: (ctx) => {
      /**
       * A sign-in that still needs a 2FA code answers `{ twoFactorRedirect: true }` and no session,
       * but it STILL sends a `set-auth-token` header — carrying the signed pending two-factor
       * cookie, not a session token. Storing that would leave a junk bearer behind if the person
       * abandons the code step. The real token arrives from the verify call instead.
       */
      const pendingTwoFactor = (ctx.data as { twoFactorRedirect?: boolean } | undefined)
        ?.twoFactorRedirect;
      const token = ctx.response.headers.get("set-auth-token");
      if (token && !pendingTwoFactor) setAuthToken(token);
      try {
        if (new URL(ctx.request.url).pathname.endsWith("/sign-out")) setAuthToken("");
      } catch {
        // ignore malformed URLs
      }
    },
  },
  plugins: [managedAuthClient(config), twoFactorClient()],
});
