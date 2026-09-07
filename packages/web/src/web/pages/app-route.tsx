import { useMemo, useState } from "react";
import { Link, useLocation, useRoute as useWouterRoute } from "wouter";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  TriangleAlert,
  Wand2,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { useOrg } from "../queries/orgs";
import { useTeam } from "../queries/team";
import {
  useAddLiveStop,
  useAddStops,
  useAssignRoute,
  useGeocodeStops,
  useOptimizeRoute,
  useRemoveRoute,
  useRemoveStop,
  useReorderStops,
  useRoute,
} from "../queries/routes";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";
import { parseStops } from "../lib/parse-stops";
import { RouteMap } from "../components/route-map";
import { STATUS_LABEL, STATUS_STYLE } from "./app-routes";

const FIELD =
  "w-full rounded-[8px] border border-line bg-ink px-3 py-2 text-[13.5px] text-chalk outline-none focus:border-amber";

const PIN_STYLE: Record<string, string> = {
  ok: "border-verified/40 bg-verified/10 text-verified",
  manual: "border-sky/40 bg-sky/10 text-sky",
  pending: "border-line bg-ink-3 text-fog",
  failed: "border-alert/40 bg-alert/10 text-alert",
};

/** How the pasted block was read, spelled out for the dispatcher before anything is created. */
const DELIM_LABEL = {
  tab: "routes.delim.tab",
  comma: "routes.delim.comma",
  semicolon: "routes.delim.semicolon",
} as const;

/** Enough rows to see the columns landed right without burying the Add button. */
const PREVIEW_ROWS = 6;

export default function AppRoutePage() {
  const t = useT();
  const [, navigate] = useLocation();
  const [, params] = useWouterRoute("/app/routes/:id");
  const routeId = params?.id ?? "";

  const org = useOrg();
  const team = useTeam();
  const detail = useRoute(routeId);
  const canManage = org.data?.role !== "field";

  const addStops = useAddStops();
  const liveStop = useAddLiveStop();
  const geocode = useGeocodeStops();
  const optimize = useOptimizeRoute();
  const assign = useAssignRoute();
  const reorder = useReorderStops();
  const removeStop = useRemoveStop();
  const removeRoute = useRemoveRoute();

  // A late order typed straight into a run that is already moving.
  const [live, setLive] = useState({ address: "", name: "" });
  const [paste, setPaste] = useState("");
  // Parsed as the dispatcher types, so the preview below is always what will actually be created.
  const parsed = useMemo(() => parseStops(paste), [paste]);
  // Keys are minted here rather than in JSX: two identical addresses in one paste is normal.
  const previewRows = useMemo(
    () => parsed.stops.slice(0, PREVIEW_ROWS).map((stop, i) => ({ ...stop, key: `row-${i}` })),
    [parsed],
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /**
   * Drag state for reordering stops. The up/down arrows stay: dragging is unusable on a
   * touchscreen and invisible to a keyboard, and a dispatcher moving one stop by one place
   * should not have to aim.
   */
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const route = detail.data?.route;
  const stops = detail.data?.stops ?? [];
  const unresolved = stops.filter(
    (s) => s.geocodeStatus === "pending" || s.geocodeStatus === "failed",
  );
  // Stops with no coordinates cannot be drawn. Say how many, so a short line on the map is
  // never mistaken for a short route.
  const unlocated = stops.filter(
    (s) => typeof s.lat !== "number" || typeof s.lng !== "number",
  ).length;

  async function move(stopId: string, delta: number) {
    const order = stops.map((s) => s.id);
    const from = order.indexOf(stopId);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= order.length) return;
    const [moved] = order.splice(from, 1);
    if (!moved) return;
    order.splice(to, 0, moved);
    await reorder.mutateAsync({ routeId, order });
  }

  /** Drop the dragged stop onto the target's position, pushing the rest along. */
  async function dropOn(targetId: string) {
    const sourceId = dragId;
    setDragId(null);
    setOverId(null);
    if (!sourceId || sourceId === targetId) return;
    const order = stops.map((s) => s.id);
    const from = order.indexOf(sourceId);
    const to = order.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const [moved] = order.splice(from, 1);
    if (!moved) return;
    order.splice(to, 0, moved);
    await reorder.mutateAsync({ routeId, order });
  }

  /** Slot a late order into the stops the driver has not reached yet. */
  async function addLive() {
    const address = live.address.trim();
    if (!address) return;
    await run(async () => {
      const res = await liveStop.mutateAsync({
        routeId,
        addressRaw: address,
        recipientName: live.name.trim() || null,
      });
      setLive({ address: "", name: "" });
      if (!res.located) return t("routes.liveNotLocated");
      return t("routes.liveAdded", { n: res.position, total: res.total });
    });
  }

  async function run(fn: () => Promise<string | null>) {
    setError(null);
    setNotice(null);
    try {
      setNotice(await fn());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <DashboardShell
      title={route?.name ?? t("routes.title")}
      subtitle={route ? `${route.date} · ${route.driverName ?? t("queue.unassigned")}` : undefined}
      actions={
        <Link
          to="/app/routes"
          className="inline-flex items-center gap-2 rounded-[8px] border border-line px-3 py-2 text-[13px] text-fog hover:text-chalk"
        >
          <ArrowLeft className="size-4" /> {t("routes.back")}
        </Link>
      }
    >
      {detail.isLoading || !route ? (
        <div className="h-40 animate-pulse rounded-[12px] bg-ink-2" />
      ) : (
        <div className="grid gap-4">
          {/* Status + plan summary */}
          <div className="rounded-[12px] flex flex-wrap items-center gap-x-6 gap-y-3 border border-line bg-ink-2 px-4 py-3.5">
            <span
              className={cn(
                "rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                STATUS_STYLE[route.status] ?? STATUS_STYLE.draft,
              )}
            >
              {t(STATUS_LABEL[route.status] ?? "routes.status.draft")}
            </span>

            {route.mode === "dispatch" && (
              <span className="rounded-[6px] border border-sky/40 bg-sky/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky">
                {t("routes.badgeDispatch")}
              </span>
            )}

            <p className="text-[13px] text-fog">
              {t("routes.stopsCount", { n: stops.length })}
            </p>

            {typeof route.planMetres === "number" && route.planMetres > 0 && (
              <p className="text-[13px] text-fog">
                {Math.round(route.planMetres / 100) / 10} km ·{" "}
                {Math.round((route.planSeconds ?? 0) / 60)} min
              </p>
            )}

            {route.optimizer && (
              <p className="text-[13px] text-fog">
                {t("routes.orderedBy")}: {route.optimizer}
              </p>
            )}

            {canManage && (
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="route-driver">
                  {t("routes.assign")}
                </label>
                <select
                  id="route-driver"
                  aria-label={t("routes.assign")}
                  value={route.driverId ?? ""}
                  onChange={(e) =>
                    run(async () => {
                      await assign.mutateAsync({ routeId, driverId: e.target.value || null });
                      return null;
                    })
                  }
                  className="rounded-[8px] border border-line bg-ink px-3 py-2 text-[13px] text-chalk outline-none focus:border-amber"
                >
                  <option value="">{t("queue.unassigned")}</option>
                  {team.data?.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user?.name ?? member.user?.email ?? t("queue.unassigned")}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={geocode.isPending || stops.length === 0}
                  onClick={() =>
                    run(async () => {
                      const res = await geocode.mutateAsync({ routeId, force: false });
                      if (!res.available) return t("routes.noKey");
                      return t("routes.resolved", { n: res.resolved, failed: res.failed });
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-[8px] border border-line px-3 py-2 text-[13px] text-chalk hover:border-amber disabled:opacity-50"
                >
                  {geocode.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MapPin className="size-4" />
                  )}
                  {t("routes.resolve")}
                </button>

                <button
                  type="button"
                  disabled={optimize.isPending || stops.length < 2}
                  onClick={() =>
                    run(async () => {
                      const res = await optimize.mutateAsync({ routeId, backend: "local" });
                      return t("routes.optimized", {
                        n: res.ordered,
                        km: String(Math.round(res.metres / 100) / 10),
                      });
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-[8px] bg-amber px-3 py-2 text-[13px] font-semibold text-on-amber hover:bg-amber-deep disabled:opacity-50"
                >
                  {optimize.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Wand2 className="size-4" />
                  )}
                  {t("routes.optimize")}
                </button>
              </div>
            )}
          </div>

          {notice && (
            <p className="rounded-[8px] border border-verified/40 bg-verified/10 px-3 py-2 text-[13px] text-verified">
              {notice}
            </p>
          )}
          {error && (
            <p className="rounded-[8px] border border-alert/40 bg-alert/10 px-3 py-2 text-[13px] text-alert">
              {error}
            </p>
          )}

          {canManage && detail.data && !detail.data.geocodingAvailable && (
            <p className="rounded-[8px] flex items-start gap-2 border border-amber/40 bg-amber/10 px-3 py-2 text-[13px] text-amber">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              {t("routes.noKeyHint")}
            </p>
          )}

          {unresolved.length > 0 && (
            <p className="rounded-[8px] border border-amber/40 bg-amber/10 px-3 py-2 text-[13px] text-amber">
              {t("routes.needsAttention", { n: unresolved.length })}
            </p>
          )}

          {/* Add an order to a run already under way (dispatch routes only). */}
          {canManage &&
            route.mode === "dispatch" &&
            route.status !== "completed" &&
            route.status !== "cancelled" && (
              <div className="rounded-[12px] border border-line bg-ink-2 p-4">
                <p className="font-display text-[15px] font-semibold text-chalk">
                  {t("routes.liveTitle")}
                </p>
                <p className="mt-1 text-[12px] text-fog">{t("routes.liveHint")}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
                  <input
                    aria-label={t("routes.liveAddress")}
                    placeholder={t("routes.liveAddress")}
                    value={live.address}
                    onChange={(e) => setLive({ ...live, address: e.target.value })}
                    className={FIELD}
                  />
                  <input
                    aria-label={t("routes.liveRecipient")}
                    placeholder={t("routes.liveRecipient")}
                    value={live.name}
                    onChange={(e) => setLive({ ...live, name: e.target.value })}
                    className={FIELD}
                  />
                  <button
                    type="button"
                    disabled={liveStop.isPending || live.address.trim().length === 0}
                    onClick={addLive}
                    className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-amber px-3 py-2 text-[13px] font-semibold text-on-amber hover:bg-amber-deep disabled:opacity-50"
                  >
                    {liveStop.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    {t("routes.liveAdd")}
                  </button>
                </div>
              </div>
            )}

          {/* Map preview */}
          {stops.length > 0 && (
            <div className="rounded-[12px] border border-line bg-ink-2 p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-display text-[15px] font-semibold text-chalk">
                  {t("routes.mapTitle")}
                </p>
                {unlocated > 0 && (
                  <span className="text-[12px] text-fog">
                    {t("routes.mapUnlocated", { n: unlocated })}
                  </span>
                )}
              </div>
              <RouteMap
                stops={stops}
                className="mt-3 h-[320px]"
                emptyMessage={t("routes.mapEmpty")}
                noKeyMessage={t("routes.mapNoKey")}
              />
            </div>
          )}

          {/* Stops */}
          <div className="rounded-[12px] overflow-hidden border border-line bg-ink-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-3">
              <p className="font-display text-[15px] font-semibold text-chalk">
                {t("routes.stopsTitle")}
              </p>
              {canManage && stops.length > 1 && (
                <span className="text-[12px] text-fog">{t("routes.dragHint")}</span>
              )}
            </div>

            {stops.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-fog">{t("routes.noStops")}</p>
            ) : (
              <ul>
                {stops.map((stop, index) => (
                  <li
                    key={stop.id}
                    draggable={canManage}
                    onDragStart={() => setDragId(stop.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverId(null);
                    }}
                    onDragOver={(event) => {
                      if (!dragId) return;
                      // Without this the browser refuses the drop and shows the "no" cursor.
                      event.preventDefault();
                      setOverId(stop.id);
                    }}
                    onDragLeave={() => setOverId((id) => (id === stop.id ? null : id))}
                    onDrop={(event) => {
                      event.preventDefault();
                      void dropOn(stop.id);
                    }}
                    className={cn(
                      "flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-3 last:border-b-0",
                      dragId === stop.id && "opacity-40",
                      overId === stop.id && dragId !== stop.id && "bg-ink-3",
                    )}
                  >
                    {canManage && (
                      <GripVertical
                        aria-hidden="true"
                        className="size-4 shrink-0 cursor-grab text-fog"
                      />
                    )}
                    <span className="grid size-7 shrink-0 place-items-center rounded-[6px] bg-ink-3 text-[12px] font-bold text-chalk">
                      {index + 1}
                    </span>

                    <div className="min-w-[200px] flex-1">
                      <p className="text-[13.5px] text-chalk">
                        {stop.address ?? stop.addressRaw}
                      </p>
                      {(stop.recipientName || stop.reference) && (
                        <p className="text-[12.5px] text-fog">
                          {[stop.recipientName, stop.reference].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>

                    <span
                      className={cn(
                        "rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        PIN_STYLE[stop.geocodeStatus] ?? PIN_STYLE.pending,
                      )}
                    >
                      {t(
                        stop.geocodeStatus === "ok"
                          ? "routes.pin.ok"
                          : stop.geocodeStatus === "manual"
                            ? "routes.pin.manual"
                            : stop.geocodeStatus === "failed"
                              ? "routes.pin.failed"
                              : "routes.pin.pending",
                      )}
                    </span>

                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={t("routes.moveUp")}
                          disabled={index === 0 || reorder.isPending}
                          onClick={() => move(stop.id, -1)}
                          className="rounded-[6px] border border-line p-1.5 text-fog hover:text-chalk disabled:opacity-30"
                        >
                          <ArrowUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={t("routes.moveDown")}
                          disabled={index === stops.length - 1 || reorder.isPending}
                          onClick={() => move(stop.id, 1)}
                          className="rounded-[6px] border border-line p-1.5 text-fog hover:text-chalk disabled:opacity-30"
                        >
                          <ArrowDown className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={t("common.delete")}
                          onClick={() =>
                            run(async () => {
                              await removeStop.mutateAsync({ stopId: stop.id });
                              return null;
                            })
                          }
                          className="rounded-[6px] border border-line p-1.5 text-fog hover:text-alert"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add stops */}
          {canManage && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (parsed.stops.length === 0) return;
                run(async () => {
                  const res = await addStops.mutateAsync({ routeId, stops: parsed.stops });
                  setPaste("");
                  return t("routes.added", { n: res.added });
                });
              }}
              className="rounded-[12px] border border-line bg-ink-2 p-4"
            >
              <p className="font-display text-[15px] font-semibold text-chalk">
                {t("routes.addTitle")}
              </p>
              <p className="mt-1 text-[12.5px] text-fog">{t("routes.addHint")}</p>
              <textarea
                aria-label={t("routes.addTitle")}
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                rows={5}
                placeholder={"12 Main St, Moncton NB, Jane Doe, jane@example.com\n88 Elm Ave, Moncton NB"}
                className={cn(FIELD, "mt-3 font-mono text-[12.5px]")}
              />

              {paste.trim().length > 0 && (
                <div className="mt-3 rounded-[8px] border border-line bg-ink p-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-[12.5px] font-semibold text-chalk">
                      {t("routes.previewTitle")}
                    </p>
                    <span className="text-[12px] text-fog">
                      {t("routes.previewCount", { n: parsed.stops.length })}
                    </span>
                    <span className="rounded-[6px] border border-line px-1.5 py-0.5 text-[11px] text-fog">
                      {t(DELIM_LABEL[parsed.delimiter])}
                    </span>
                  </div>

                  {parsed.headerRow && (
                    <p className="mt-1 text-[11.5px] text-fog">
                      {t("routes.previewHeader", { cols: parsed.headerRow.join(", ") })}
                    </p>
                  )}
                  {parsed.ignoredColumns.length > 0 && (
                    <p className="mt-1 text-[11.5px] text-fog">
                      {t("routes.previewIgnored", { cols: parsed.ignoredColumns.join(", ") })}
                    </p>
                  )}
                  {parsed.skipped > 0 && (
                    <p className="mt-1 text-[11.5px] text-alert">
                      {t("routes.previewSkipped", { n: parsed.skipped })}
                    </p>
                  )}

                  {previewRows.length > 0 && (
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left text-[12px]">
                        <thead>
                          <tr className="text-fog">
                            <th className="py-1 pr-3 font-medium">{t("routes.colAddress")}</th>
                            <th className="py-1 pr-3 font-medium">{t("routes.colName")}</th>
                            <th className="py-1 pr-3 font-medium">{t("routes.colEmail")}</th>
                            <th className="py-1 font-medium">{t("routes.colPhone")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.map((row) => (
                            <tr key={row.key} className="border-t border-line align-top">
                              <td className="py-1 pr-3 text-chalk">{row.addressRaw}</td>
                              <td className="py-1 pr-3 text-fog">{row.recipientName ?? "-"}</td>
                              <td className="py-1 pr-3 text-fog">{row.recipientEmail ?? "-"}</td>
                              <td className="py-1 text-fog">{row.recipientPhone ?? "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsed.stops.length > previewRows.length && (
                        <p className="mt-1 text-[11.5px] text-fog">
                          {t("routes.previewMore", { n: parsed.stops.length - previewRows.length })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={addStops.isPending || parsed.stops.length === 0}
                className="mt-3 inline-flex items-center gap-2 rounded-[8px] bg-amber px-4 py-2 text-[13px] font-semibold text-on-amber hover:bg-amber-deep disabled:opacity-50"
              >
                {addStops.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                {t("routes.addStops")}
              </button>
            </form>
          )}

          {canManage && (
            <div>
              <button
                type="button"
                onClick={() =>
                  run(async () => {
                    await removeRoute.mutateAsync({ id: routeId });
                    navigate("/app/routes");
                    return null;
                  })
                }
                className="inline-flex items-center gap-2 rounded-[8px] border border-alert/40 px-3 py-2 text-[13px] text-alert hover:bg-alert/10"
              >
                <Trash2 className="size-4" /> {t("routes.deleteRoute")}
              </button>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
