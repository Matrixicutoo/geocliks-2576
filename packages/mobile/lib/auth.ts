import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { managedAuthExpoClient } from "@runablehq/managed-auth/native";
import Constants from "expo-constants";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Platform-managed identity: never edit `expo.extra` or `expo.scheme` in app.json.
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

/**
 * Email/password sign-in returns its bearer in the `set-auth-token` header rather than through the
 * managed exchange, so `managedAuth.getToken()` stays empty on that path. Keep our own copy so the
 * oRPC client (lib/api.ts) can authenticate either way.
 */
const EMAIL_TOKEN_KEY = "geocliks.auth.token";

/**
 * `expo-secure-store` has no web implementation of the synchronous API, so on the browser preview
 * we fall back to `localStorage`. Native keeps using the keychain/keystore.
 */
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
    // Read-only module namespace: fall back to the tokenStore below.
  }
}

const tokenStore = {
  get(): string | null {
    try {
      if (Platform.OS === "web") return globalThis.localStorage?.getItem(EMAIL_TOKEN_KEY) || null;
      return SecureStore.getItem(EMAIL_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  },
  set(value: string) {
    try {
      if (Platform.OS === "web") {
        globalThis.localStorage?.setItem(EMAIL_TOKEN_KEY, value);
        return;
      }
      SecureStore.setItem(EMAIL_TOKEN_KEY, value);
    } catch {
      // Storage unavailable (private mode, locked keystore): keep the in-memory copy only.
    }
  },
};

let emailToken: string | null = tokenStore.get();

export const authClient = createAuthClient({
  baseURL: extra.apiUrl ?? process.env.EXPO_PUBLIC_API_URL,
  basePath: "/api/auth",
  fetchOptions: {
    // Session lookups must carry the bearer explicitly: the app talks to the API cross-origin, so
    // cookies are not a reliable transport (and are blocked outright in the browser preview).
    auth: {
      type: "Bearer",
      token: () => emailToken ?? "",
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
      const path = new URL(ctx.request.url).pathname;
      if (path.endsWith("/sign-out")) {
        emailToken = null;
        SecureStore.setItem(EMAIL_TOKEN_KEY, "");
        return;
      }
      if (token && !pendingTwoFactor) {
        emailToken = token;
        SecureStore.setItem(EMAIL_TOKEN_KEY, token);
      }
    },
  },
  plugins: [
    managedAuthExpoClient({
      applicationId: extra.applicationId as string,
      issuer: extra.runableAuthIssuer as string,
    }),
    twoFactorClient(),
  ],
});

/**
 * Store a bearer the API returned in a response body rather than the `set-auth-token` header.
 * The two-factor verify step is the one path that needs this: it mints the session only after the
 * 6-digit code checks out, and the token comes back in the body.
 */
export const setEmailToken = (token: string) => {
  emailToken = token;
  tokenStore.set(token);
};

/** Bearer for the typed oRPC client — managed (Google) token first, email/password token second. */
export const authToken = () => authClient.managedAuth.getToken() || emailToken || "";
