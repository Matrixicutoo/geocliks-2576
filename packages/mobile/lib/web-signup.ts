import { Linking, Platform } from "react-native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";

/**
 * Creating an account happens on the website, never in the app.
 *
 * New registrations are gated by a Cloudflare Turnstile challenge. Turnstile has no React Native
 * widget and is widely broken inside iOS WKWebView, so there is no honest way to run it natively.
 * Every "create an account" affordance in the app therefore hands off to the browser, and this
 * module is the single place that knows how.
 *
 * The hand-off is a round trip, not a one-way door. The website is opened with `?app=1`; when the
 * account exists it redirects to `<scheme>://auth/callback?email=...&created=1`, which closes the
 * browser and drops the person back here on the sign-in screen with their address already filled
 * in. Stage 1 carries the address only - never a token - so nothing sensitive rides the deep link.
 */

/** The app's own deep link, used as the address the browser session watches for. */
function appReturnUrl(): string {
  const scheme = Constants.expoConfig?.scheme;
  const name = Array.isArray(scheme) ? scheme[0] : scheme;
  return `${name ?? "runable-timemar-nt1ia4s"}://auth/callback`;
}

/**
 * Pull one query value out of a deep link.
 *
 * Hand-rolled rather than `URLSearchParams`: React Native ships only a partial polyfill of it and
 * the missing pieces vary by platform, which is not a thing to discover on a customer's phone.
 */
function param(url: string, key: string): string {
  const match = url.match(new RegExp(`[?&]${key}=([^&#]*)`));
  return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "";
}

/** The website's sign-up URL, carrying the invited email when we know it. */
export function webSignUpUrl(email?: string | null): string {
  const configured =
    Constants.expoConfig?.extra?.apiUrl ??
    process.env.EXPO_PUBLIC_API_URL ??
    "https://geocliks.com";
  // `extra.apiUrl` is stored with a trailing slash, which would produce a `//sign-up` URL.
  const base = String(configured).replace(/\/+$/, "");
  const params = new URLSearchParams();
  const clean = typeof email === "string" ? email.trim() : "";
  if (clean) params.set("email", clean);
  // Tells the website this registration started in the app, so it sends the browser back.
  params.set("app", "1");
  return `${base}/sign-up?${params.toString()}`;
}

/** Land the returning person on sign-in with their new address prefilled. */
export function routeFromCallback(url: string): void {
  const email = param(url, "email");
  const parts: string[] = [];
  if (email) parts.push(`email=${encodeURIComponent(email)}`);
  if (param(url, "created") === "1") parts.push("created=1");
  router.replace(parts.length ? `/sign-in?${parts.join("&")}` : "/sign-in");
}

/**
 * Open the website sign-up page.
 *
 * Returns `null` when the browser opened, or the URL when every route out was blocked so the
 * caller can show it and the user is never left tapping a link that silently does nothing.
 *
 * The web build matters here: it runs inside an iframe in the Runable preview, where `window.open`
 * is killed by the popup blocker and returns null WITHOUT throwing. `expo-web-browser` wraps that
 * same call, so a bare `try/catch` around it catches nothing and the tap looks dead. We check the
 * return value instead of trusting an exception.
 */
export async function openWebSignUp(email?: string | null): Promise<string | null> {
  const url = webSignUpUrl(email);

  if (Platform.OS === "web") {
    try {
      const win =
        typeof window !== "undefined" ? window.open(url, "_blank", "noopener,noreferrer") : null;
      return win ? null : url;
    } catch {
      return url;
    }
  }

  try {
    // `openAuthSessionAsync` is the one that watches for our scheme and dismisses itself. Plain
    // `openBrowserAsync` would leave the person stranded on the website after registering.
    const result = await WebBrowser.openAuthSessionAsync(url, appReturnUrl());
    if (result.type === "success" && result.url) routeFromCallback(result.url);
    return null;
  } catch {
    // In-app browser unavailable on this device - hand off to the system browser instead. The OS
    // still delivers the deep link, which `app/auth/callback.tsx` picks up on the way back in.
    try {
      await Linking.openURL(url);
      return null;
    } catch {
      return url;
    }
  }
}
