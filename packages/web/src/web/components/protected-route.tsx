import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { authClient, authToken } from "../lib/auth";
import { Logo } from "./logo";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [, navigate] = useLocation();
  // In the desktop/preview iframe the session cookie is dropped, so a fresh page load starts with no
  // session even though a valid bearer is stored. Give that bearer one chance to resolve a session
  // before bouncing to /sign-in.
  const [recovering, setRecovering] = useState(() => authToken().length > 0);
  const tried = useRef(false);

  useEffect(() => {
    if (session && recovering) setRecovering(false);
  }, [session, recovering]);

  useEffect(() => {
    if (isPending || session || tried.current || !recovering) return;
    tried.current = true;
    authClient
      .getSession({ query: { disableCookieCache: true } })
      .catch(() => null)
      .finally(() => setRecovering(false));
  }, [isPending, session, recovering]);

  useEffect(() => {
    if (!isPending && !session && !recovering) navigate("/sign-in");
  }, [isPending, session, recovering, navigate]);

  if (isPending || recovering || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink blueprint">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <span className="flex items-center gap-2 label">
            <Loader2 className="size-3.5 animate-spin text-amber" />
            {isPending || recovering ? "Verifying session" : "Redirecting"}
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
