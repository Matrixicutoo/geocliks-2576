import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  FileStack,
  Loader2,
  Plus,
  Route as RouteIcon,
  Search,
  Trash2,
  Truck,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { AssignDriverDialog } from "../components/assign-driver-dialog";
import { NewRouteDialog } from "../components/new-route-dialog";
import { DeliveryChecklist } from "../components/delivery-checklist";
import { PhotoStrip } from "../components/photo-strip";
import { NotesPanel } from "../components/notes-panel";
import { PanelSearch } from "../components/panel-search";
import { useOrg } from "../queries/orgs";
import { useRemoveRoute, useRoutes } from "../queries/routes";
import { matchesSearch } from "../lib/search";
import { cn } from "../lib/utils";
import { type TKey, useT } from "../lib/i18n";
import { canManageWorkspace, canRunDeliveries, canUseNotes } from "../lib/roles";
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

/**
 * `openNew` is how `/app/routes/new` still works: that URL renders this page with the new-run
 * popup already up, rather than a second page holding a second copy of the same form.
 */
export default function AppRoutes({ openNew = false }: { openNew?: boolean }) {
  const t = useT();
  const org = useOrg();
  const [, navigate] = useLocation();
  // Naming a run is a popup over the list now, the way New project is on the projects page.
  const [newOpen, setNewOpen] = useState(openNew);
  const routes = useRoutes();
  const removeRoute = useRemoveRoute();
  const canManage = canRunDeliveries(org.data?.role);
  // Owner, admin and manager can delete a run; field crew cannot. The server enforces the same
  // rule - this only decides whether the button is drawn.
  const canDelete = canManageWorkspace(org.data?.role);
  // A driver gets no notes column at all, so the row must not hold half a page of air.
  const showNotes = canUseNotes(org.data?.role);

  /** Long-running workspaces pile up hundreds of runs, so the list grows as you scroll. */
  const [shown, setShown] = useState(PAGE);
  const [query, setQuery] = useState("");
  const all = routes.data ?? [];
  // A run is looked up by the name it was given, the day it goes out, who is driving it, where
  // it starts from, or the state it is in — the status label is matched as the word on the badge,
  // so "completed" narrows to the finished runs.
  const found = all.filter((route) =>
    matchesSearch(query, {
      text: [
        route.name,
        route.driverName,
        route.startAddress,
        t(STATUS_LABEL[route.status] ?? "routes.status.draft"),
      ],
      dates: [route.date],
    }),
  );
  const searching = query.trim().length > 0;
  // Batching applies to the matches, so a search reaches a run that is hundreds deep without
  // scrolling the whole list into existence first.
  const visible = found.slice(0, shown);
  const showMore = useCallback(() => setShown((n) => n + PAGE), []);
  // The rows scroll inside the panel now, not with the page, so the next batch has to be
  // triggered by that element scrolling rather than by the window. Held in state, not a plain
  // ref, so the observer is rebuilt once the node exists.
  const [scrollBox, setScrollBox] = useState<HTMLDivElement | null>(null);
  const sentinel = useInfiniteScroll({
    hasMore: shown < found.length,
    loading: routes.isLoading,
    onLoadMore: showMore,
    root: scrollBox,
  });
  // Deleting a run shrinks the list under what is already revealed, and so does typing a query;
  // either way, start the batches over.
  useEffect(() => setShown(PAGE), [all.length, query]);

  // Two-step confirm: the whole row is a link, so a single stray click must never delete a run.
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Which run's driver popup is open. Same control the projects list has for crew, except a run
  // holds one driver, so the popup is a single-select.
  const [assignFor, setAssignFor] = useState<string | null>(null);

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
          <>
            {/* Proof of delivery closes out in a package exactly like a job site does, so the
                dispatcher gets the same report action the Teamspace header carries. Secondary
                styling: naming the next run is what this page is for. */}
            <Link
              to="/app/reports"
              className="mono inline-flex items-center gap-2 rounded-[8px] border border-line px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-chalk transition-colors hover:border-amber hover:text-amber"
            >
              <FileStack className="size-4" /> {t("teamspace.buildReport")}
            </Link>
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="inline-flex items-center gap-2 rounded-[8px] bg-amber px-3 py-2 text-[13px] font-semibold text-on-amber hover:bg-amber-deep"
            >
              <Plus className="size-4" /> {t("routes.new")}
            </button>
          </>
        ) : null
      }
    >
      {/* Moved out of the page header: it reads as a lead-in to the list, not as chrome. */}
      <p className="mb-4 text-[13px] text-fog">{t("routes.subtitle")}</p>

      {/* First-run guide for a brand new delivery workspace. It hides itself once every step is
          done, so established workspaces never see it. */}
      <DeliveryChecklist />

      {/* The day's proof-of-delivery shots, one sideways strip deep, above the lists. */}
      <PhotoStrip board="delivery" />

      {/* Runs on the left, the office's notes on the right. A driver sees only the runs. */}
      <div className={cn("mt-4 grid gap-4 items-start", showNotes && "xl:grid-cols-2")}>
        <div>
          {error && (
            <p className="mb-3 rounded-[8px] border border-alert/40 bg-alert/10 px-3 py-2 text-[13px] text-alert">
              {error}
            </p>
          )}

          {/* The runs sit in the same panel the notes column wears, so the two halves of the
              dashboard read as a pair: one bordered card each, a search field under the header,
              and rows divided by a hairline rather than floating as separate tiles. */}
          <section className="flex max-h-[620px] min-h-[420px] flex-col rounded-[12px] border border-line bg-ink-2">
            <header className="flex items-center gap-2 border-b border-line px-4 py-3">
              <p className="font-display text-[15px] font-semibold">{t("routes.panelTitle")}</p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setNewOpen(true)}
                  className="mono ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber transition-colors hover:text-amber-deep"
                >
                  <Plus className="size-3.5" /> {t("routes.new")}
                </button>
              )}
            </header>

            {/* Hidden until there is a list worth narrowing, and held in place while a query is
                active so clearing the last match does not take the field away with it. */}
            {(all.length > 0 || searching) && (
              <PanelSearch value={query} onChange={setQuery} placeholder={t("search.routes")} />
            )}

            <div ref={setScrollBox} className="min-h-0 flex-1 overflow-y-auto">
              {routes.isLoading ? (
                <div className="space-y-px">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse bg-ink-3/40" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                searching ? (
                  <div className="grid h-full place-items-center px-6 py-10 text-center">
                    <div>
                      <Search className="mx-auto size-6 text-fog/60" />
                      <p className="mt-3 text-[13px] text-fog">
                        {t("search.noMatch", { query: query.trim() })}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* The panel is already a bordered card, so the empty state is the plain
                     centred block the other two columns use rather than a second box. */
                  <div className="grid h-full place-items-center px-6 py-10 text-center">
                    <div>
                      <RouteIcon className="mx-auto size-6 text-fog/60" />
                      <p className="font-display mt-3 text-[15px] font-semibold text-chalk">
                        {t("routes.empty")}
                      </p>
                      <p className="mx-auto mt-1 max-w-sm text-[13px] text-fog">
                        {canManage ? t("routes.emptyHint") : t("routes.emptyHintDriver")}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <>
                  <ul className="divide-y divide-line">
                    {visible.map((route) => (
                      <li
                        key={route.id}
                        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-ink-3/40"
                      >
                        {/* Half a page wide, so the run reads as two lines instead of one long
                            row: what it is, then how it is going. */}
                        <Link to={`/app/routes/${route.id}`} className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="font-display truncate text-[15px] font-semibold text-chalk">
                              {route.name}
                            </span>
                            <span
                              className={cn(
                                "shrink-0 rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                                STATUS_STYLE[route.status] ?? STATUS_STYLE.draft,
                              )}
                            >
                              {t(STATUS_LABEL[route.status] ?? "routes.status.draft")}
                            </span>
                          </span>

                          <span className="mt-0.5 flex flex-wrap gap-x-3 text-[12.5px] text-fog">
                            <span>{route.date}</span>
                            {/* The assign control to the right already names the driver for
                                anyone who can reassign, so only repeat it here for drivers. */}
                            {!canManage && (
                              <span>{route.driverName ?? t("queue.unassigned")}</span>
                            )}
                            <span>
                              {t("routes.progress", {
                                n: route.doneCount,
                                total: route.stopCount,
                              })}
                            </span>
                            {typeof route.planMetres === "number" && route.planMetres > 0 && (
                              <span>{Math.round(route.planMetres / 100) / 10} km</span>
                            )}
                          </span>
                        </Link>

                        {/* Who is driving this run. A driver only sees the runs assigned to
                            them, so this is the control that decides their whole day. */}
                        {canManage && (
                          <button
                            type="button"
                            title={t("routes.assign")}
                            onClick={() => setAssignFor(route.id)}
                            className="inline-flex max-w-[190px] shrink-0 items-center gap-1.5 rounded-[8px] border border-line bg-ink-3 px-2.5 py-1.5 text-[12px] font-semibold text-fog transition-colors hover:text-amber"
                          >
                            <Truck className="size-3.5 shrink-0" />
                            {/* Naming the driver on the button saves a click to find out who
                                has the run; unassigned runs keep the verb instead. */}
                            <span className="truncate">
                              {route.driverName ?? t("routes.assign")}
                            </span>
                          </button>
                        )}

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
                                className="rounded-[6px] border border-line bg-ink-3 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-fog"
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
                              className="grid size-8 shrink-0 place-items-center rounded-[8px] border border-line bg-ink-3 text-fog transition-colors hover:bg-alert hover:text-white"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          ))}
                      </li>
                    ))}
                  </ul>
                  {/* Scrolling near this reveals the next batch of runs. */}
                  <div ref={sentinel} className="h-px" />
                  {shown < found.length && (
                    <div className="mono flex items-center justify-center gap-2 py-3 text-[11px] uppercase tracking-widest text-fog">
                      <Loader2 className="size-3.5 animate-spin" /> {t("common.loading")}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        <NotesPanel board="delivery" />
      </div>

      {newOpen && canManage && (
        <NewRouteDialog
          onClose={() => {
            setNewOpen(false);
            // Closing the popup that /app/routes/new opened has to leave that URL behind, or a
            // reload would put the form straight back up.
            if (window.location.pathname === "/app/routes/new") navigate("/app/routes");
          }}
        />
      )}

      {assignFor && canManage && (
        <AssignDriverDialog
          routeId={assignFor}
          routeName={all.find((r) => r.id === assignFor)?.name}
          driverId={all.find((r) => r.id === assignFor)?.driverId ?? null}
          onClose={() => setAssignFor(null)}
        />
      )}
    </DashboardShell>
  );
}
