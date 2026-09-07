import { Redirect, useLocalSearchParams } from "expo-router";
import { AuthForm } from "@/components/auth-form";

/**
 * Sign in only. Creating an account lives on its own screen at `app/sign-up.tsx`, matching the
 * website's /sign-in and /sign-up split.
 *
 * Older builds of the app (and any stale deep link) push `/sign-in?mode=sign-up`, so that legacy
 * shape is forwarded to the new screen with the invited email kept intact.
 */
export default function SignIn() {
  const params = useLocalSearchParams<{ mode?: string; email?: string }>();
  const email = typeof params.email === "string" ? params.email.trim() : "";

  if (params.mode === "sign-up") {
    return <Redirect href={email ? `/sign-up?email=${encodeURIComponent(email)}` : "/sign-up"} />;
  }

  return <AuthForm mode="sign-in" />;
}
