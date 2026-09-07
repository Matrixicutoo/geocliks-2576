import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * There is only ONE auth screen in the phone app: the sign-in form.
 *
 * Accounts cannot be created natively — new registrations are gated by a Cloudflare Turnstile
 * challenge that has no React Native widget — so a separate mobile "sign up" screen could only
 * ever be a button that opens the website. That made the app's most obvious button dump the user
 * into a browser and leave the app itself signed out. Registration now lives as a labelled link
 * on the sign-in screen instead, and this route just forwards, so old deep links and invite
 * links that still point at /sign-up keep working.
 */
export default function SignUp() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email.trim() : "";
  return <Redirect href={email ? `/sign-in?email=${encodeURIComponent(email)}` : "/sign-in"} />;
}
