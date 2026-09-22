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
  Truck,
  Wand2,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { AssignDriverDialog } from "../components/assign-driver-dialog";
import { useOrg } from "../queries/orgs";
import { useTeam } from "../queries/team";
import {
  useAddLiveStop,
  useAddStops,
  useGeocodeStops,
  useOptimizeRoute,
  useRemoveRoute,
  useRemoveStop,
  useReorderStops,
  useRoute,
  useUpdateStop,
} from "../queries/routes";
import { cn } from "../lib/utils";
import { type TKey, useT } from "../lib/i18n";
import {
  SIG_BADGE_STYLE,
  sigBadgeLabel,
  sigChoice,
  sigEffective,
  sigRouteLabel,
  sigValue,
} from "../lib/signature";
import { parseStops } from "../lib/parse-stops";
import { RouteMap } from "../components/route-map";
import { PhotoDrawer } from "../components/photo-drawer";
import { StopAddress } from "../components/stop-address";
import { StopNote } from "../components/stop-note";
import { STATUS_LABEL, STATUS_STYLE } from "./app-routes";
import { canRunDeliveries } from "../lib/roles";

const FIELD =
  "w-full rounded-[8px] border border-line bg-ink px-3 py-2 text-[13.5px] text-chalk outline-none focus:border-amber";

const PIN_STYLE: Record<string, string> = {
  ok: "border-verified/40 bg-verified/10 text-verified",
  manual: "border-sky/40 bg-sky/10 text-sky",
  pending: "border-line bg-ink-3 text-fog",
  failed: "border-alert/40 bg-alert/10 text-alert",
};

/**
 * Planned duration, readable at both ends of the scale. A town run is minutes and reads as
 * minutes; a run across the province is hours and used to read "1179 min", which nobody can
 * picture as a working day.
 */
function planClock(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

/**
 * How the stop actually ended — which is not the same question as whether it was geocoded.
 *
 * The list used to badge `geocodeStatus` alone, so a delivered stop read "Located" and nothing
 * else while its pin had already gone green on the map. Same colours as the map markers, so a
 * green dot up there and a green row down here are visibly the same fact.
 */
const OUTCOME_STYLE: Record<string, string> = {
  pending: "border-amber/40 bg-amber/10 text-amber",
  delivered: "border-verified/40 bg-verified/10 text-verified",
  done: "border-verified/40 bg-verified/10 text-verified",
  failed: "border-alert/40 bg-alert/10 text-alert",
  skipped: "border-line bg-ink-3 text-fog",
};

const OUTCOME_LABEL: Record<string, TKey> = {
  pending: "routes.stop.pending",
  delivered: "routes.stop.delivered",
  done: "routes.stop.delivered",
  failed: "routes.stop.failed",
  skipped: "routes.stop.skipped",
};

/**
 * Why a stop failed. The same six the driver picks from on the run screen, and the same keys
 * the public tracking page reads them back with — one vocabulary, three places.
 */
const REASON_LABEL: Record<string, TKey> = {
  nobody_home: "track.reason.nobody_home",
  refused: "track.reason.refused",
  wrong_address: "track.reason.wrong_address",
  closed: "track.reason.closed",
  inaccessible: "track.reason.inaccessible",
  other: "track.reason.other",
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
  const detail = useRoute(routeId);
  const canManage = canRunDeliveries(org.data?.role);
  // The crew, for the per-order driver picker below. Same list the assign popup reads.
  const team = useTeam();

  const addStops = useAddStops();
  const liveStop = useAddLiveStop();
  const geocode = useGeocodeStops();
  const optimize = useOptimizeRoute();
  const reorder = useReorderStops();
  const removeStop = useRemoveStop();
  const updateStop = useUpdateStop();
  const removeRoute = useRemoveRoute();

  // A late order typed straight into a run that is already moving. The contact details belong
  // here for the same reason they belong on the popup's one-stop form: the phone number is what
  // the driver taps on arrival, and the dispatcher has it in front of them while they type.
  //
  // `driver` is per ORDER, not per run: on a restaurant night the order goes to whoever is free,
  // which is rarely the driver whose run happens to be open on screen. Blank keeps the old
  // behaviour of filing it here, and it resets to blank after every add so a one-off hand-off
  // does not silently keep sending the rest of the night's orders to the same person.
  const [live, setLive] = useState({
    address: "",
    name: "",
    email: "",
    phone: "",
    driver: "",
  });
  const [paste, setPaste] = useState("");
  // The driver popup, opened from the run header.
  const [assignOpen, setAssignOpen] = useState(false);
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
  // The delivery photo behind a stop, opened from its thumbnail or its address.
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);

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
  // Everyone in the workspace, as the assign popup and the stops dialog both list them: the
  // server only checks membership, so filtering by role here would hide people it accepts.
  const members = team.data ?? [];

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

  /**
   * Slot a late order into the stops the driver has not reached yet.
   *
   * With a driver named on the order it may land on a different run altogether, so the answer
   * says where it went: a dispatcher who hands an order to Ralph and sees nothing change on the
   * screen in front of him assumes the click was lost and types it again.
   */
  async function addLive() {
    const address = live.address.trim();
    if (!address) return;
    const driverId = live.driver || null;
    // Named from the list on screen: the dispatcher wants back the name he just picked, and the
    // server has no reason to look one up for a one-line notice.
    const picked = members.find((m) => m.userId === driverId);
    const driver = picked?.user?.name ?? picked?.user?.email ?? t("team.unknownUser");
    await run(async () => {
      const res = await liveStop.mutateAsync({
        routeId,
        driverId,
        addressRaw: address,
        recipientName: live.name.trim() || null,
        recipientEmail: live.email.trim() || null,
        recipientPhone: live.phone.trim() || null,
      });
      setLive({ address: "", name: "", email: "", phone: "", driver: "" });
      const where = res.createdRoute
        ? t("routes.liveNewRun", { driver, n: res.position })
        : res.rerouted
          ? t("routes.liveOtherRun", { driver, n: res.position, total: res.total })
          : t("routes.liveAdded", { n: res.position, total: res.total });
      // An address we could not place still landed somewhere - at the end - so both halves of
      // the story are told rather than only the failure.
      return res.located ? where : `${where} · ${t("routes.liveNotLocated")}`;
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
          {/* Map preview.
              First thing on the page, ahead of the summary bar and the buttons that used to sit
              above it: opening a run, what a dispatcher wants to see is the shape of the drive,
              and the plan figures read better as a caption under it than as a header over it. */}
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
                start={{ lat: route.startLat, lng: route.startLng, address: route.startAddress }}
                returnToStart={route.returnToStart}
                startLabel={t("routes.fStartAddress")}
                returnLabel={t("routes.fReturnToStart")}
                // Roughly double the old 320px, and taller again on a desktop: the map is where
                // the dispatcher reads the run, so it gets the screen rather than a strip of it.
                className="mt-3 h-[420px] sm:h-[600px] lg:h-[720px]"
                emptyMessage={t("routes.mapEmpty")}
                noKeyMessage={t("routes.mapNoKey")}
              />
            </div>
          )}

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

            <p className="text-[13px] text-fog">{t("routes.stopsCount", { n: stops.length })}</p>

            {/* The start address, and whether it could be placed. It used to be stored and never
                shown anywhere, which is how a depot nobody could see came to look ignored. */}
            {route.startAddress && (
              <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-fog">
                <span className="mono text-[10.5px] uppercase tracking-widest">
                  {t("routes.fStartAddress")}
                </span>
                <span className="text-chalk">{route.startAddress}</span>
                <span
                  className={cn(
                    "rounded-[6px] border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    typeof route.startLat === "number"
                      ? "border-verified/40 bg-verified/10 text-verified"
                      : "border-alert/40 bg-alert/10 text-alert",
                  )}
                >
                  {t(typeof route.startLat === "number" ? "routes.pin.ok" : "routes.pin.failed")}
                </span>
                {route.returnToStart && <span>· {t("routes.fReturnToStart")}</span>}
              </p>
            )}

            {typeof route.planMetres === "number" && route.planMetres > 0 && (
              <p className="text-[13px] text-fog">
                {Math.round(route.planMetres / 100) / 10} km · {planClock(route.planSeconds ?? 0)}
              </p>
            )}

            {route.optimizer && (
              <p className="text-[13px] text-fog">
                {t("routes.orderedBy")}: {route.optimizer}
              </p>
            )}

            {canManage && (
              <div className="ml-auto flex flex-wrap items-center gap-2">
                {/* Same popup the runs list opens, so assigning a driver works the same in both
                    places instead of being a dropdown here and a dialog there. */}
                <button
                  type="button"
                  onClick={() => setAssignOpen(true)}
                  className="inline-flex items-center gap-2 rounded-[8px] border border-line px-3 py-2 text-[13px] text-chalk hover:border-amber"
                >
                  <Truck className="size-4" /> {t("routes.assign")}:{" "}
                  <span className="text-fog">{route.driverName ?? t("queue.unassigned")}</span>
                </button>

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
                {/* Two fields to a row, as on the popup's one-stop form, so the address keeps
                    its width instead of being crushed into a fifth column. */}
                <div className="mt-3 grid gap-2 sm:grid-cols-[2fr_1fr]">
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
                  <input
                    type="email"
                    aria-label={t("routes.oneEmail")}
                    placeholder={t("routes.oneEmail")}
                    value={live.email}
                    onChange={(e) => setLive({ ...live, email: e.target.value })}
                    className={FIELD}
                  />
                  <input
                    type="tel"
                    aria-label={t("routes.onePhone")}
                    placeholder={t("routes.onePhone")}
                    value={live.phone}
                    onChange={(e) => setLive({ ...live, phone: e.target.value })}
                    className={FIELD}
                  />
                </div>
                {/* Who takes this one. Sits under the phone column so the row rhythm holds, with
                    the consequence spelled out beside it: picking a name here can create a whole
                    second run, which is not something to discover afterwards. */}
                {members.length > 0 && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-[2fr_1fr]">
                    <p className="text-[12px] leading-snug text-fog sm:self-center">
                      {t("routes.liveDriverHint")}
                    </p>
                    <select
                      aria-label={t("routes.liveDriver")}
                      value={live.driver}
                      onChange={(e) => setLive({ ...live, driver: e.target.value })}
                      className={FIELD}
                    >
                      <option value="">{t("routes.liveDriverThis")}</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.userId}>
                          {member.user?.name ?? member.user?.email ?? t("team.unknownUser")}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="mt-2 flex sm:justify-end">
                  <button
                    type="button"
                    disabled={liveStop.isPending || live.address.trim().length === 0}
                    onClick={addLive}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-amber px-3 py-2 text-[13px] font-semibold text-on-amber hover:bg-amber-deep disabled:opacity-50 sm:w-auto"
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

                    {/* The proof, where the question gets asked. A delivered address with no
                        thumbnail beside it is the one thing the office needs to notice. */}
                    {stop.proof ? (
                      <button
                        type="button"
                        onClick={() => setOpenPhoto(stop.proof?.id ?? null)}
                        aria-label={t("routes.stop.viewProof")}
                        title={t("routes.stop.viewProof")}
                        className="shrink-0 overflow-hidden rounded-[6px] border border-line transition hover:border-amber focus:border-amber focus:outline-none"
                      >
                        <img
                          src={stop.proof.posterUrl ?? stop.proof.url}
                          alt={t("routes.stop.viewProof")}
                          loading="lazy"
                          className="size-10 object-cover"
                        />
                      </button>
                    ) : null}

                    <div className="min-w-[200px] flex-1">
                      {/* The address itself, correctable in place. Clickable only when there is
                          something to open: a plain address is not a button, and pretending
                          otherwise teaches a dead click. */}
                      <StopAddress
                        stopId={stop.id}
                        routeId={route.id}
                        addressRaw={stop.addressRaw}
                        display={stop.address ?? stop.addressRaw}
                        canEdit={canManage}
                        locked={stop.status !== "pending"}
                        textClass="text-[13.5px] text-chalk"
                        onOpenProof={
                          stop.proof ? () => setOpenPhoto(stop.proof?.id ?? null) : undefined
                        }
                        onError={setError}
                      />
                      {/*
                        One contact line under the address, in the order the list is pasted in:
                        name, email, phone — then the reference. The email and phone were being
                        collected, stored and shown to nobody, so the one moment they matter
                        ("the driver is outside and nobody answers") meant digging through the
                        spreadsheet the list came from. Real links: the answer to that moment is
                        a call, not a string to copy out by hand.
                      */}
                      {(stop.recipientName ||
                        stop.recipientEmail ||
                        stop.recipientPhone ||
                        stop.reference) && (
                        <p className="flex flex-wrap items-center gap-x-2 text-[12.5px] text-fog">
                          {stop.recipientName && <span>{stop.recipientName}</span>}
                          {stop.recipientName && stop.recipientEmail && (
                            <span aria-hidden="true">·</span>
                          )}
                          {stop.recipientEmail && (
                            <a
                              href={`mailto:${stop.recipientEmail}`}
                              className="break-all hover:text-amber focus:text-amber focus:outline-none"
                            >
                              {stop.recipientEmail}
                            </a>
                          )}
                          {(stop.recipientName || stop.recipientEmail) && stop.recipientPhone && (
                            <span aria-hidden="true">·</span>
                          )}
                          {stop.recipientPhone && (
                            <a
                              href={`tel:${stop.recipientPhone.replace(/[^\d+]/g, "")}`}
                              className="hover:text-amber focus:text-amber focus:outline-none"
                            >
                              {stop.recipientPhone}
                            </a>
                          )}
                          {(stop.recipientName ||
                            stop.recipientEmail ||
                            stop.recipientPhone) &&
                            stop.reference && <span aria-hidden="true">·</span>}
                          {stop.reference && <span>{stop.reference}</span>}
                        </p>
                      )}
                      {/*
                        What the office knows about this address and the driver does not: the
                        buzzer code, the gate, the name to ask for. Written here after the run
                        is built, read on the driver's phone when he arrives at this stop.
                      */}
                      <StopNote
                        stopId={stop.id}
                        notes={stop.notes}
                        canEdit={canManage}
                        onError={setError}
                      />
                      {/* Why it did not land, in the row rather than buried in a drawer. */}
                      {stop.status === "failed" && (stop.failedReason || stop.failedNote) && (
                        <p className="text-[12.5px] text-alert">
                          {[
                            stop.failedReason
                              ? t(REASON_LABEL[stop.failedReason] ?? "track.reason.other")
                              : null,
                            stop.failedNote,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>

                    {/* What happened to the stop. */}
                    <span
                      className={cn(
                        "rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        OUTCOME_STYLE[stop.status] ?? OUTCOME_STYLE.pending,
                      )}
                    >
                      {t(OUTCOME_LABEL[stop.status] ?? "routes.stop.pending")}
                    </span>

                    {/* The geocoding badge only when it is still a problem: "Located" next to a
                        delivered stop is noise, but "Not found" is a job for the dispatcher. */}
                    {stop.geocodeStatus !== "ok" && stop.geocodeStatus !== "manual" && (
                      <span
                        className={cn(
                          "rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                          PIN_STYLE[stop.geocodeStatus] ?? PIN_STYLE.pending,
                        )}
                      >
                        {t(
                          stop.geocodeStatus === "failed"
                            ? "routes.pin.failed"
                            : "routes.pin.pending",
                        )}
                      </span>
                    )}

                    {/*
                      The signature rule, on every address rather than once on the run. A
                      dispatcher's list is rarely uniform — the one parcel worth signing for
                      sits among forty that are not — and until now the whole run had to agree.
                      Read-only viewers get the answer as a badge; nobody has to open a stop to
                      find out what the driver will be asked for at the door.
                    */}
                    {canManage ? (
                      <select
                        aria-label={t("routes.sigLabel")}
                        value={sigChoice(stop.requireSignature)}
                        onChange={(event) => {
                          const choice = event.target.value;
                          run(async () => {
                            await updateStop.mutateAsync({
                              stopId: stop.id,
                              requireSignature: sigValue(choice),
                            });
                            return null;
                          });
                        }}
                        className="rounded-[6px] max-w-[190px] border border-line bg-ink px-2 py-1 text-[11.5px] text-fog outline-none focus:border-amber"
                      >
                        <option value="route">{t(sigRouteLabel(route.requireSignature))}</option>
                        <option value="on">{t("routes.sigOn")}</option>
                        <option value="off">{t("routes.sigOff")}</option>
                      </select>
                    ) : (
                      <span
                        className={cn(
                          "rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                          SIG_BADGE_STYLE[
                            sigEffective(stop.requireSignature, route.requireSignature)
                              ? "on"
                              : "off"
                          ],
                        )}
                      >
                        {t(
                          sigBadgeLabel(
                            sigEffective(stop.requireSignature, route.requireSignature),
                          ),
                        )}
                      </span>
                    )}

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
                placeholder={
                  "12 Main St, Moncton NB, Jane Doe, jane@example.com\n88 Elm Ave, Moncton NB"
                }
                className={cn(FIELD, "mt-3 font-mono text-[12.5px]")}
              />

              {/*
                A CSV file lands in the same box the dispatcher can type into, so the
                existing parser, preview and 300-stop cap all apply unchanged — and the
                dispatcher can fix a bad row before creating anything.
              */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label
                  className={cn(
                    "cursor-pointer rounded-[8px] border border-line px-3 py-1.5 text-[12px] text-fog transition-colors",
                    "hover:border-amber/60 hover:text-chalk",
                  )}
                >
                  <input
                    type="file"
                    aria-label={t("routes.csvChoose")}
                    accept=".csv,.txt,text/csv,text/plain"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      // Reset first: picking the same file twice must fire onChange again.
                      e.target.value = "";
                      if (!file) return;
                      if (file.size > 1_000_000) {
                        setError(t("routes.csvError"));
                        return;
                      }
                      try {
                        const text = (await file.text()).replace(/\r\n?/g, "\n");
                        setError(null);
                        setNotice(t("routes.csvLoaded", { file: file.name }));
                        setPaste((prev) =>
                          prev.trim().length > 0 ? `${prev.replace(/\n*$/, "")}\n${text}` : text,
                        );
                      } catch {
                        setError(t("routes.csvError"));
                      }
                    }}
                  />
                  {t("routes.csvChoose")}
                </label>
                <span className="text-[11.5px] text-fog">{t("routes.csvHint")}</span>
              </div>

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
                      <table className="w-full min-w-[620px] text-left text-[12px]">
                        <thead>
                          <tr className="text-fog">
                            <th className="py-1 pr-3 font-medium">{t("routes.colAddress")}</th>
                            <th className="py-1 pr-3 font-medium">{t("routes.colName")}</th>
                            <th className="py-1 pr-3 font-medium">{t("routes.colEmail")}</th>
                            <th className="py-1 pr-3 font-medium">{t("routes.colPhone")}</th>
                            <th className="py-1 font-medium">{t("routes.colSignature")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.map((row) => (
                            <tr key={row.key} className="border-t border-line align-top">
                              <td className="py-1 pr-3 text-chalk">{row.addressRaw}</td>
                              <td className="py-1 pr-3 text-fog">{row.recipientName ?? "-"}</td>
                              <td className="py-1 pr-3 text-fog">{row.recipientEmail ?? "-"}</td>
                              <td className="py-1 pr-3 text-fog">{row.recipientPhone ?? "-"}</td>
                              {/* A blank cell is not "no signature" — it is this run's own rule. */}
                              <td className="py-1 text-fog">
                                {row.requireSignature === null
                                  ? t("routes.sigCellRoute")
                                  : t(
                                      row.requireSignature
                                        ? "routes.sigBadgeOn"
                                        : "routes.sigBadgeOff",
                                    )}
                              </td>
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

      {assignOpen && canManage && route && (
        <AssignDriverDialog
          routeId={routeId}
          routeName={route.name}
          driverId={route.driverId ?? null}
          onClose={() => setAssignOpen(false)}
        />
      )}

      <PhotoDrawer photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
    </DashboardShell>
  );
}
