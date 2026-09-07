import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { authClient, authToken } from "../lib/auth";
import { Logo } from "./logo";

/**
 * Inverse of ProtectedRoute: signed-in users never see the marketing site or the sign-in form,
 * they land straight in the Teamspace. Signing out sends them back here.
 */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [, navigate] = useLocation();
  // A stored bearer means a session is very likely coming — hold the marketing page back for that
  // one tick instead of flashing it at someone who is already signed in.
  const likelySignedIn = authToken().length > 0;

  useEffect(() => {
    if (session) navigate("/app", { replace: true });
  }, [session, navigate]);

  if (session || (isPending && likelySignedIn)) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink blueprint">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <span className="flex items-center gap-2 label">
            <Loader2 className="size-3.5 animate-spin text-amber" />
            Opening teamspace
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
