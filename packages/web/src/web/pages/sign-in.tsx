import { AuthForm } from "../components/auth-form";

/**
 * The only authentication page. Legacy `?mode=sign-up` links (invite emails already sitting in
 * inboxes, old bookmarks, installed copies of the app) land here and simply work: the code they
 * are sent creates the account if the address is new.
 */
export default function SignInPage() {
  return <AuthForm />;
}
