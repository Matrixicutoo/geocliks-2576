import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Where the website drops people back into the app.
 *
 * Accounts are created in the app now — the email code does it — so nothing in the app sends
 * anyone to the website to register. This route stays because the WEBSITE still knows how to hand
 * a browser back to us: someone who opened geocliks.com from a phone and signed in there is sent
 * to `<scheme>://auth/callback?email=...&created=1`, and this screen turns that into the sign-in
 * screen with the address already filled in.
 *
 * Old installed builds and stale links use the same shape, which is the other reason to keep it.
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
