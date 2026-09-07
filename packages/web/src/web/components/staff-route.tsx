import { Loader2, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { ProtectedRoute } from "./protected-route";
import { Logo } from "./logo";
import { useAdminMe } from "../queries/admin";

function Gate({ children }: { children: React.ReactNode }) {
  const me = useAdminMe();

  if (me.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink blueprint">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <span className="label flex items-center gap-2">
            <Loader2 className="size-3.5 animate-spin text-amber" />
            Checking operator access
          </span>
        </div>
      </div>
    );
  }

  if (!me.data?.staffRole) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink blueprint px-6 text-center">
        <div className="max-w-md rounded-[12px] border border-line bg-ink-2 p-8">
          <ShieldAlert className="mx-auto size-8 text-alert" />
          <p className="label mt-4 text-alert">403 · operator area</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-chalk">
            This console is for GeoCliks staff
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-fog">
            Your account has no platform role. Workspace settings, team roles and your own plan live
            in the app.
          </p>
          <Link
            to="/app"
            className="rounded-[8px] mono mt-5 inline-block border border-amber/50 bg-amber/10 px-4 py-2 text-[11px] uppercase tracking-widest text-amber hover:bg-amber/20"
          >
            Back to workspace
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Signed in **and** platform staff. */
export function StaffRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Gate>{children}</Gate>
    </ProtectedRoute>
  );
}
