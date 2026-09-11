import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Loader2, Plus, Route as RouteIcon, Trash2 } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
import { useOrg } from "../queries/orgs";
import { useRemoveRoute, useRoutes } from "../queries/routes";
import { cn } from "../lib/utils";
import { type TKey, useT } from "../lib/i18n";
import { canManageWorkspace, canRunDeliveries } from "../lib/roles";
import { useInfiniteScroll } from "../lib/use-infinite-scroll";

/** Runs revealed per scroll batch. */
const PAGE = 25;

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

// The row is a solid amber fill now, so the normal tinted badges would wash out against it.
// On amber we invert to a plain `ink` chip: that token flips with the theme (white in light,
// near-black in dark) and so do fog/sky/verified/alert, so the status colour coding survives on
// both. `amber` is the exception - it is #ffb021 in BOTH themes and is unreadable on the light
// chip, so `active` uses `amber-deep`, which does flip and still reads as amber.
const STATUS_STYLE_ON_AMBER: Record<string, string> = {
  draft: "border-transparent bg-ink text-fog",
  assigned: "border-transparent bg-ink text-sky",
  active: "border-transparent bg-ink text-amber-deep",
  completed: "border-transparent bg-ink text-verified",
  cancelled: "border-transparent bg-ink text-alert",
};

export default function AppRoutes() {
  const t = useT();
  const org = useOrg();
  const routes = useRoutes();
  const removeRoute = useRemoveRoute();
  const canManage = canRunDeliveries(org.data?.role);
  // Owner, admin and manager can delete a run; field crew cannot. The server enforces the same
  // rule - this only decides whether the button is drawn.
  const canDelete = canManageWorkspace(org.data?.role);

  /** Long-running workspaces pile up hundreds of runs, so the list grows as you scroll. */
  const [shown, setShown] = useState(PAGE);
  const all = routes.data ?? [];
  const visible = all.slice(0, shown);
  const showMore = useCallback(() => setShown((n) => n + PAGE), []);
  const sentinel = useInfiniteScroll({
    hasMore: shown < all.length,
    loading: routes.isLoading,
    onLoadMore: showMore,
  });
  // Deleting a run shrinks the list under what is already revealed; start the batches over.
  useEffect(() => setShown(PAGE), [all.length]);

  // Two-step confirm: the whole row is a link, so a single stray click must never delete a run.
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDelete = async (id: string) => {
    setError(null);
    try {
      await removeRoute.mutateAsync({ id });
      setConfirmId(null);
    } catch (e) {
      // Most likely "Stop the route before deleting it" - the server refuses to delete a run
      // that is currently moving.
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <DashboardShell
      title={t("routes.title")}
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
      {/* Moved out of the page header: it reads as a lead-in to the list, not as chrome. */}
      <p className="mb-4 text-[13px] text-fog">{t("routes.subtitle")}</p>

      {error && (
        <p className="mb-3 rounded-[8px] border border-alert/40 bg-alert/10 px-3 py-2 text-[13px] text-alert">
          {error}
        </p>
      )}

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
          {visible.map((route) => (
            <div
              key={route.id}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[12px] border border-transparent bg-amber px-4 py-2 transition-colors hover:bg-amber-deep"
            >
              <Link
                to={`/app/routes/${route.id}`}
                className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2"
              >
                <div className="min-w-[180px] flex-1">
                  <p className="font-display text-[15px] font-semibold text-on-amber">
                    {route.name}
                  </p>
                  <p className="text-[12.5px] text-on-amber/80">
                    {route.date} · {route.driverName ?? t("queue.unassigned")}
                  </p>
                </div>

                <p className="text-[13px] text-on-amber/80">
                  {t("routes.progress", { n: route.doneCount, total: route.stopCount })}
                </p>

                {typeof route.planMetres === "number" && route.planMetres > 0 && (
                  <p className="text-[13px] text-on-amber/80">
                    {Math.round(route.planMetres / 100) / 10} km
                  </p>
                )}

                <span
                  className={cn(
                    "rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                    STATUS_STYLE_ON_AMBER[route.status] ?? STATUS_STYLE_ON_AMBER.draft,
                  )}
                >
                  {t(STATUS_LABEL[route.status] ?? "routes.status.draft")}
                </span>
              </Link>

              {canDelete &&
                (confirmId === route.id ? (
                  <span className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onDelete(route.id)}
                      disabled={removeRoute.isPending}
                      className="rounded-[6px] bg-alert px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white disabled:opacity-60"
                    >
                      {t("common.delete")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="rounded-[6px] bg-ink px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-fog"
                    >
                      {t("common.cancel")}
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={t("routes.deleteRoute")}
                    title={t("routes.deleteRoute")}
                    onClick={() => {
                      setError(null);
                      setConfirmId(route.id);
                    }}
                    className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-ink text-alert transition-colors hover:bg-alert hover:text-white"
                  >
                    <Trash2 className="size-4" />
                  </button>
                ))}
            </div>
          ))}
          {/* Scrolling near this reveals the next batch of runs. */}
          <div ref={sentinel} className="h-px" />
          {shown < all.length && (
            <div className="mono flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-fog">
              <Loader2 className="size-3.5 animate-spin" /> {t("common.loading")}
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
