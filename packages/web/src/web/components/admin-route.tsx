import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useOrg } from "../queries/orgs";
import { canManageWatermarks } from "../lib/roles";
import { Logo } from "./logo";

/**
 * Owner/admin guard for the Watermarks page.
 *
 * Hiding the sidebar entry is not enough on its own — the page stays routable by typing the
 * URL. This bounces anyone below admin back to their workspace home.
 *
 * Mirrors `ProductRoute`, including the deliberate wait for a real role: bouncing while the
 * role is still undefined would throw every member off the page for a frame on a cold load.
 * Presentation only — the server refuses the create/edit/promote/delete calls independently.
 * Reading a stamp at capture time is a different call and stays open to every role.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const org = useOrg();
  const [, navigate] = useLocation();
  const role = org.data?.role;
  const allowed = canManageWatermarks(role);

  useEffect(() => {
    if (!role || allowed) return;
    navigate("/app", { replace: true });
  }, [role, allowed, navigate]);

  if (!role || !allowed) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink blueprint">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <span className="flex items-center gap-2 label">
            <Loader2 className="size-3.5 animate-spin text-amber" />
            {role ? "Redirecting" : "Loading workspace"}
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
