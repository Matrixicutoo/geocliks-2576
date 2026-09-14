import { Redirect, useSearchParams } from "wouter";

/**
 * There is no sign-up any more — a mailed code creates the account on first use, so both pages
 * would render the identical form. The URL is kept alive because it is already out in the world
 * (marketing links, invite mails, the installed phone app) and forwards with its query intact:
 * `?email=`, `?next=` and `?app=1` all still have to survive the hop.
 */
export default function SignUpPage() {
  const [searchParams] = useSearchParams();
  const params = new URLSearchParams(searchParams);
  params.delete("mode");
  const qs = params.toString();
  return <Redirect to={`/sign-in${qs ? `?${qs}` : ""}`} replace />;
}
