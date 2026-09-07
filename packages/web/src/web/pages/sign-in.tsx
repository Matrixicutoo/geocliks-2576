import { Redirect, useSearchParams } from "wouter";
import { AuthForm } from "../components/auth-form";

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  /**
   * Legacy links point here with ?mode=sign-up: invite emails already sitting in inboxes, the
   * installed phone app, old bookmarks. Forward them to the real sign-up page carrying their
   * invite context rather than dropping the person on the wrong form.
   */
  if (searchParams.get("mode") === "sign-up") {
    const params = new URLSearchParams(searchParams);
    params.delete("mode");
    const qs = params.toString();
    return <Redirect to={`/sign-up${qs ? `?${qs}` : ""}`} replace />;
  }
  return <AuthForm mode="sign-in" />;
}
