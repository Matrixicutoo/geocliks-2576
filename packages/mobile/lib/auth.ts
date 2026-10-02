import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import { managedAuthExpoClient } from "@runablehq/managed-auth/native";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Platform-managed identity: never edit `expo.extra` or `expo.scheme` in app.json.
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

/**
 * The app's own URL scheme, used by the native social flow as the address the browser session
 * watches for. `expo.scheme` can be declared as either a string or an array, so normalise it
 * rather than assuming one shape.
 */
const nativeScheme = (() => {
  const scheme = Constants.expoConfig?.scheme;
  return (Array.isArray(scheme) ? scheme[0] : scheme) ?? "runable-timemar-nt1ia4s";
})();

/**
 * ONE session token for the whole app, whichever way the person signed in.
 *
 * There used to be two: the email-code bearer under `geocliks.auth.token` and the managed-auth
 * (Google) token under `runable.managed-auth.token`. Every auth request sent the email-code slot
 * first (`fetchOptions.auth` writes the Authorization header before the managed plugin looks, and
 * the plugin only fills it when it is empty), and that slot is also written by EVERY response that
 * refreshes a session — Google ones included. Nothing but a successful sign-out ever emptied it.
 *
 * So once the token in that slot stopped being valid, the phone was stuck: "Continue with Google"
 * completed, the server minted a fresh session, the new token landed in the OTHER slot, and the
 * very next session check still sent the dead one and came back signed out. Production shows
 * exactly that — seven Google sessions minted for one phone in seven minutes, none ever used —
 * and only deleting the app (which wipes both slots) got it back in.
 *
 * Now the managed plugin is handed this same store (`storage` below), so a Google sign-in, an
 * email-code sign-in and a session refresh all overwrite the one token every request sends.
 */
const SESSION_TOKEN_KEY = "geocliks.auth.token";
/** Where `@runablehq/managed-auth` kept its own copy before it was pointed at the store above. */
const LEGACY_MANAGED_TOKEN_KEY = "runable.managed-auth.token";

/**
 * The browser preview has no native SecureStore, and the managed-auth Expo client writes its session
 * through `SecureStore.setItem`/`getItem` internally. Point those at `localStorage` on web only so
 * the Expo web preview can authenticate; native keeps the real keychain implementation.
 */
if (Platform.OS === "web") {
  try {
    const shim = SecureStore as unknown as Record<string, unknown>;
    shim.setItem = (key: string, value: string) => globalThis.localStorage?.setItem(key, value);
    shim.getItem = (key: string) => globalThis.localStorage?.getItem(key) ?? null;
    shim.setItemAsync = async (key: string, value: string) =>
      globalThis.localStorage?.setItem(key, value);
    shim.getItemAsync = async (key: string) => globalThis.localStorage?.getItem(key) ?? null;
    shim.deleteItemAsync = async (key: string) => globalThis.localStorage?.removeItem(key);
  } catch {
    // Read-only module namespace: `readKey`/`writeKey` below go to localStorage directly anyway.
  }
}

const readKey = (key: string): string => {
  try {
    if (Platform.OS === "web") return globalThis.localStorage?.getItem(key) || "";
    return SecureStore.getItem(key) || "";
  } catch {
    return "";
  }
};

const writeKey = (key: string, value: string) => {
  try {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(key, value);
      return;
    }
    SecureStore.setItem(key, value);
  } catch {
    // Storage unavailable (private mode, locked keystore): keep the in-memory copy only.
  }
};

/**
 * Phones upgrading from the two-slot build can hold a token in each slot, and either one may be
 * the dead one. The Google slot is tried first — it is only written by a completed sign-in, while
 * the email slot also collected refreshes, which is how a dead token ended up shadowing a fresh
 * Google sign-in. The other one is kept as a single fallback: if the server answers the first
 * with "no session", `onSuccess` below swaps to it once before treating the phone as signed out.
 */
const legacyManaged = readKey(LEGACY_MANAGED_TOKEN_KEY);
const legacyEmail = readKey(SESSION_TOKEN_KEY);
let sessionToken = legacyManaged || legacyEmail;
let fallbackToken = legacyManaged && legacyEmail && legacyManaged !== legacyEmail ? legacyEmail : "";

const retireLegacySlot = () => {
  if (legacyManaged) writeKey(LEGACY_MANAGED_TOKEN_KEY, "");
};

// Only one candidate: move it into the single slot now and forget the old one.
if (legacyManaged && !fallbackToken) {
  writeKey(SESSION_TOKEN_KEY, sessionToken);
  retireLegacySlot();
}

const sessionStore = {
  getToken: () => sessionToken,
  setToken: (token: string) => {
    sessionToken = token;
    fallbackToken = "";
    writeKey(SESSION_TOKEN_KEY, token);
    retireLegacySlot();
  },
  clearToken: () => {
    sessionToken = "";
    fallbackToken = "";
    writeKey(SESSION_TOKEN_KEY, "");
    retireLegacySlot();
  },
};

/** The bearer a request actually carried, without the `Bearer ` prefix. */
const sentToken = (headers: unknown): string => {
  let value: string | null = null;
  if (headers instanceof Headers) value = headers.get("authorization");
  else if (headers && typeof headers === "object") {
    const entry = Object.entries(headers as Record<string, unknown>).find(
      ([key]) => key.toLowerCase() === "authorization",
    );
    value = typeof entry?.[1] === "string" ? entry[1] : null;
  }
  return value?.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
};

export const authClient = createAuthClient({
  baseURL: extra.apiUrl ?? process.env.EXPO_PUBLIC_API_URL,
  basePath: "/api/auth",
  fetchOptions: {
    // Session lookups must carry the bearer explicitly: the app talks to the API cross-origin, so
    // cookies are not a reliable transport (and are blocked outright in the browser preview).
    auth: {
      type: "Bearer",
      token: () => sessionToken,
    },
    onSuccess: (ctx) => {
      /**
       * Every authenticated response carries the bearer in `set-auth-token`. Requesting a code is
       * NOT one of them — `/email-otp/send-verification-otp` mints no session, so there is nothing
       * to store until the code itself is spent on `/sign-in/email-otp`, which answers with both
       * the header and a `token` in its body.
       */
      const token = ctx.response.headers.get("set-auth-token");
      const path = new URL(ctx.request.url).pathname;
      if (path.endsWith("/sign-out")) {
        sessionStore.clearToken();
        return;
      }
      if (token) {
        sessionStore.setToken(token);
        return;
      }
      /**
       * The server looked at the token we sent and found no session behind it (expired, revoked,
       * or a leftover from an older build). Drop it rather than sending it forever. Only when the
       * token it rejected is still the current one: a check that was already in flight when a new
       * sign-in landed must not wipe the fresh token.
       */
      if (path.endsWith("/get-session") && ctx.data == null) {
        const rejected = sentToken(ctx.request.headers);
        if (!rejected || rejected !== sessionToken) return;
        if (fallbackToken) {
          sessionToken = fallbackToken;
          fallbackToken = "";
          writeKey(SESSION_TOKEN_KEY, sessionToken);
          retireLegacySlot();
          // Ask again with the other token once this response has settled.
          setTimeout(() => authClient.$store.notify("$sessionSignal"), 0);
          return;
        }
        sessionStore.clearToken();
        return;
      }
      // A live session answered: the token we sent is the right one, so the spare can go.
      if (path.endsWith("/get-session") && ctx.data && fallbackToken) {
        fallbackToken = "";
        retireLegacySlot();
        writeKey(SESSION_TOKEN_KEY, sessionToken);
      }
    },
  },
  plugins: [
    managedAuthExpoClient({
      applicationId: extra.applicationId as string,
      issuer: extra.runableAuthIssuer as string,
      // The same single token the email-code path and every refresh write — see `sessionStore`.
      storage: sessionStore,
    }),
    /**
     * Native social sign-in (X). Google does NOT come through here — it goes through the managed
     * broker above, which owns its own browser round trip and token store. This plugin exists only
     * so `authClient.signIn.social({ provider: "twitter" })` can complete on a phone: it opens the
     * system browser, watches for our own scheme coming back, and stores the returned session.
     *
     * The server half was already in place (`expo()` in api/auth.ts, plus `twitter` in both
     * `socialProviders` and `trustedProviders`), so only this client half was missing.
     *
     * The scheme is read from app.json rather than written here — `expo.scheme` is
     * platform-managed identity and must never be edited or duplicated as a literal.
     */
    expoClient({
      scheme: nativeScheme,
      storagePrefix: "geocliks",
      storage: SecureStore,
    }),
    /**
     * The email path. There are no passwords on this product: `/sign-in/email-otp` spends a 6-digit
     * code mailed by `/email-otp/send-verification-otp`, creating the account if the address is new
     * and signing in if it isn't. The server half is the `emailOTP` plugin in api/auth.ts.
     */
    emailOTPClient(),
  ],
});

/**
 * Store a bearer the API returned in a response body rather than the `set-auth-token` header.
 * The code-verify step is the one path that needs this: it mints the session only after the
 * 6-digit code checks out, and the token comes back in the body as well as the header.
 */
export const setEmailToken = (token: string) => sessionStore.setToken(token);

/** Bearer for the typed oRPC client — the same single token every auth request sends. */
export const authToken = () => sessionToken;
