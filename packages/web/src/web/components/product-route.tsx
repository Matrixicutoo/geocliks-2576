import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useOrg } from "../queries/orgs";
import { canUseDelivery, canUseField } from "../lib/roles";
import { Logo } from "./logo";

/**
 * Product guard.
 *
 * The delivery system and the field system are separate memberships: a `driver` has no
 * projects and no job photos, a `field` member has no routes. Hiding the sidebar entry is not
 * enough on its own, because the page stays routable by typing the URL — that is how a driver
 * could still land on the full Teamspace and see the whole crew's photo feed. This bounces
 * them to the home of the side they actually have instead.
 *
 * Presentation only, and deliberately so: the server refuses the same calls independently in
 * `fieldProc` / `requireDelivery`, and `visibleProjectIds` scopes a driver to their own
 * captures. Never rely on this component for security.
 */
export function ProductRoute({
  product,
  children,
}: {
  product: "field" | "delivery";
  children: React.ReactNode;
}) {
  const org = useOrg();
  const [, navigate] = useLocation();
  const role = org.data?.role;
  const allowed = product === "field" ? canUseField(role) : canUseDelivery(role);

  useEffect(() => {
    // Wait for the real role before deciding — bouncing on an undefined role would throw
    // every member off their own landing page for a frame on a cold load.
    if (!role || allowed) return;
    // Send them to the home of the product they DO have, never to another page they would
    // just bounce off again.
    navigate(product === "field" ? "/app/routes" : "/app", { replace: true });
  }, [role, allowed, product, navigate]);

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
