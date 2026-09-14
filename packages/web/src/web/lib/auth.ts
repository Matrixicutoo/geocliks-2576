import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
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
 * Storage key used by @runablehq/managed-auth's browser storage. Email-code sign-in returns its
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

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_WEBSITE_URL ?? window.location.origin,
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
    auth: { type: "Bearer", token: () => authToken() },
    onSuccess: (ctx) => {
      /**
       * Every authenticated response carries the bearer in `set-auth-token`. Requesting a code is
       * NOT one of them — `/email-otp/send-verification-otp` mints no session, so there is nothing
       * to store until the code itself is spent on `/sign-in/email-otp`.
       */
      const token = ctx.response.headers.get("set-auth-token");
      if (token) setAuthToken(token);
      try {
        if (new URL(ctx.request.url).pathname.endsWith("/sign-out")) setAuthToken("");
      } catch {
        // ignore malformed URLs
      }
    },
  },
  plugins: [managedAuthClient(config), emailOTPClient()],
});
