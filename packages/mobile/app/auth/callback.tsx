import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Where the website drops people back into the app.
 *
 * Registration itself has to happen on geocliks.com — it is gated by a Cloudflare Turnstile
 * challenge that has no React Native widget. Once the account exists the website sends the browser
 * to `<scheme>://auth/callback?email=...&created=1`, and this screen turns that into the sign-in
 * screen with the new address already filled in.
 *
 * Two different paths land here, which is why this screen exists at all:
 *  - the in-app browser: `openAuthSessionAsync` hands the URL straight back to `web-signup.ts`,
 *    which routes without ever mounting this screen;
 *  - the system browser (or a cold start, where the app was killed while they registered): the OS
 *    delivers the deep link as a navigation, and this screen is what receives it.
 *
 * Nothing sensitive rides the link — the address only, never a token or a password.
 */
export default function AuthCallback() {
  const params = useLocalSearchParams<{ email?: string; created?: string }>();
  const email = typeof params.email === "string" ? params.email.trim() : "";
  const created = params.created === "1";

  if (email) {
    const query = `email=${encodeURIComponent(email)}${created ? "&created=1" : ""}`;
    return <Redirect href={`/sign-in?${query}`} />;
  }

  if (created) return <Redirect href="/sign-in?created=1" />;

  // No idea who came back — the normal gate decides whether they see Capture or the landing page.
  return <Redirect href="/" />;
}
