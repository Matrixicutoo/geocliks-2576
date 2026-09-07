import { Link } from "wouter";
import { Plus, Route as RouteIcon } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
import { useOrg } from "../queries/orgs";
import { useRoutes } from "../queries/routes";
import { cn } from "../lib/utils";
import { type TKey, useT } from "../lib/i18n";

export const STATUS_LABEL: Record<string, TKey> = {
  draft: "routes.status.draft",
  assigned: "routes.status.assigned",
  active: "routes.status.active",
  completed: "routes.status.completed",
  cancelled: "routes.status.cancelled",
};

export const STATUS_STYLE: Record<string, string> = {
  draft: "border-line bg-ink-3 text-fog",
  assigned: "border-sky/40 bg-sky/10 text-sky",
  active: "border-amber/40 bg-amber/10 text-amber",
  completed: "border-verified/40 bg-verified/10 text-verified",
  cancelled: "border-alert/40 bg-alert/10 text-alert",
};

export default function AppRoutes() {
  const t = useT();
  const org = useOrg();
  const routes = useRoutes();
  const canManage = org.data?.role !== "field";

  return (
    <DashboardShell
      title={t("routes.title")}
      subtitle={t("routes.subtitle")}
      actions={
        canManage ? (
          <Link
            to="/app/routes/new"
            className="inline-flex items-center gap-2 rounded-[8px] bg-amber px-3 py-2 text-[13px] font-semibold text-on-amber hover:bg-amber-deep"
          >
            <Plus className="size-4" /> {t("routes.new")}
          </Link>
        ) : null
      }
    >
      {routes.isLoading ? (
        <div className="h-40 animate-pulse rounded-[12px] bg-ink-2" />
      ) : (routes.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={RouteIcon}
          title={t("routes.empty")}
          hint={canManage ? t("routes.emptyHint") : t("routes.emptyHintDriver")}
        />
      ) : (
        <div className="grid gap-3">
          {routes.data?.map((route) => (
            <Link
              key={route.id}
              to={`/app/routes/${route.id}`}
              className="rounded-[12px] flex flex-wrap items-center gap-x-5 gap-y-2 border border-line bg-ink-2 px-4 py-3.5 transition-colors hover:border-amber/50"
            >
              <div className="min-w-[180px] flex-1">
                <p className="font-display text-[15px] font-semibold text-chalk">{route.name}</p>
                <p className="text-[12.5px] text-fog">
                  {route.date} · {route.driverName ?? t("queue.unassigned")}
                </p>
              </div>

              <p className="text-[13px] text-fog">
                {t("routes.progress", { n: route.doneCount, total: route.stopCount })}
              </p>

              {typeof route.planMetres === "number" && route.planMetres > 0 && (
                <p className="text-[13px] text-fog">
                  {Math.round(route.planMetres / 100) / 10} km
                </p>
              )}

              <span
                className={cn(
                  "rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                  STATUS_STYLE[route.status] ?? STATUS_STYLE.draft,
                )}
              >
                {t(STATUS_LABEL[route.status] ?? "routes.status.draft")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
