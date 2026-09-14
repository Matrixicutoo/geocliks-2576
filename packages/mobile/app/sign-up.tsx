import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * There is only ONE auth screen in the phone app: the sign-in form.
 *
 * Accounts are created by the email code itself — an address the server has never seen gets an
 * account on the spot — so a separate "sign up" screen would be the same form under a second
 * name. This route just forwards, so old deep links and invite links that still point at
 * /sign-up keep working.
 */
export default function SignUp() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === "string" ? params.email.trim() : "";
  return <Redirect href={email ? `/sign-in?email=${encodeURIComponent(email)}` : "/sign-in"} />;
}
