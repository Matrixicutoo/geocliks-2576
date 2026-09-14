import { Redirect, useLocalSearchParams } from "expo-router";
import { AuthForm } from "@/components/auth-form";

/**
 * The app's only auth screen.
 *
 * There is no separate sign-up any more: the email code creates the account when the address is
 * new and signs in when it isn't, so one screen covers both. `app/sign-up.tsx` forwards here, and
 * older builds (or a stale deep link) that push `/sign-in?mode=sign-up` land on the same form —
 * the legacy shape is simply dropped, with the invited email kept intact.
 */
export default function SignIn() {
  const params = useLocalSearchParams<{ mode?: string; email?: string }>();
  const email = typeof params.email === "string" ? params.email.trim() : "";

  if (params.mode === "sign-up") {
    return <Redirect href={email ? `/sign-in?email=${encodeURIComponent(email)}` : "/sign-in"} />;
  }

  return <AuthForm />;
}
