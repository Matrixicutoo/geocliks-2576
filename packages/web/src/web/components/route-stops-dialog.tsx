import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  TriangleAlert,
  Wand2,
  X,
} from "lucide-react";
import {
  useAddLiveStop,
  useAddStops,
  useAddressSuggestions,
  useAssignRoute,
  useGeocodeStops,
  useOptimizeRoute,
  useRemoveStop,
  useReorderStops,
  useRoute,
  useUpdateStop,
} from "../queries/routes";
import { useTeam } from "../queries/team";
import { parseStops } from "../lib/parse-stops";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";
import { sigChoice, sigRouteLabel, sigValue } from "../lib/signature";
import { StopAddress } from "./stop-address";
import { StopNote } from "./stop-note";

const FIELD =
  "w-full rounded-[8px] border border-line bg-ink px-3 py-2 text-[13.5px] text-chalk outline-none focus:border-amber";

const PIN_STYLE: Record<string, string> = {
  ok: "border-verified/40 bg-verified/10 text-verified",
  manual: "border-sky/40 bg-sky/10 text-sky",
  pending: "border-line bg-ink-3 text-fog",
  failed: "border-alert/40 bg-alert/10 text-alert",
};

const DELIM_LABEL = {
  tab: "routes.delim.tab",
  comma: "routes.delim.comma",
  semicolon: "routes.delim.semicolon",
} as const;

const PREVIEW_ROWS = 6;

/**
 * Step two of naming a run: its stops and its driver, still as a popup over the routes list.
 *
 * Creating a route and filling it in used to be a popup followed by a page, which meant the
 * dispatcher lost sight of the list halfway through the one job they opened it for. Everything
 * here writes straight through — a stop is added, a driver is assigned, an order is optimised
 * the moment it is asked for — so there is no draft to lose and no Save to forget. Closing is
 * therefore always safe, and lands back on the list with the run in it.
 *
 * The capabilities are deliberately the same ones the run page carries rather than a cut-down
 * set: paste a block or a CSV, add one stop with autocomplete, resolve, optimise, reorder,
 * remove. A dispatcher who can do it on the page can do it here.
 */
export function RouteStopsDialog({
  routeId,
  onClose,
}: {
  routeId: string;
  onClose: () => void;
}) {
  const t = useT();
  const detail = useRoute(routeId);
  const team = useTeam();

  const addStops = useAddStops();
  // Only ever used when a driver is named on the single stop below: that is the one path that
  // has to think about whose run the order belongs on.
  const liveStop = useAddLiveStop();
  const geocode = useGeocodeStops();
  const optimize = useOptimizeRoute();
  const reorder = useReorderStops();
  const removeStop = useRemoveStop();
  const updateStop = useUpdateStop();
  const assign = useAssignRoute();

  const [paste, setPaste] = useState("");
  // Email and phone belong here as much as the name does: a dispatcher typing a single
  // restaurant order has the contact details in front of them, and the paste box has always
  // accepted both columns. Without these two the only way to add a phone number one stop at a
  // time was to type the stop, then edit the row.
  const [one, setOne] = useState({ address: "", name: "", email: "", phone: "", driver: "" });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const parsed = useMemo(() => parseStops(paste), [paste]);
  const previewRows = useMemo(
    () => parsed.stops.slice(0, PREVIEW_ROWS).map((stop, i) => ({ ...stop, key: `row-${i}` })),
    [parsed],
  );

  /** Suggestions for the one-at-a-time field, trailing the typed value by 300 ms. */
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const suggestQuery = useAddressSuggestions(addressQuery);
  const suggestions = suggestOpen ? (suggestQuery.data ?? []) : [];

  useEffect(() => {
    const handle = setTimeout(() => setAddressQuery(one.address), 300);
    return () => clearTimeout(handle);
  }, [one.address]);

  // Escape closes it, like every other popup in the dashboard.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const route = detail.data?.route;
  const stops = detail.data?.stops ?? [];
  const unresolved = stops.filter(
    (s) => s.geocodeStatus === "pending" || s.geocodeStatus === "failed",
  );
  const members = team.data ?? [];

  async function run(fn: () => Promise<string | null>) {
    setError(null);
    setNotice(null);
    try {
      setNotice(await fn());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  /** Nudge one stop by one place. Arrows rather than drag: this is a popup on a laptop. */
  async function move(stopId: string, delta: number) {
    const order = stops.map((s) => s.id);
    const from = order.indexOf(stopId);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= order.length) return;
    const [moved] = order.splice(from, 1);
    if (!moved) return;
    order.splice(to, 0, moved);
    await run(async () => {
      await reorder.mutateAsync({ routeId, order });
      return null;
    });
  }

  /**
   * Add a parsed block, and say what came of it.
   *
   * Shared by the paste form, the CSV picker and the Done button, so a list of addresses lands
   * the same way however it got into the dialog. It reports skipped lines alongside the count:
   * a CSV whose address column is not first used to add nothing and say "0 stops added", which
   * read like the upload had failed rather than like the file needed a second look.
   */
  async function addParsed(block: string): Promise<boolean> {
    const batch = parseStops(block);
    if (batch.stops.length === 0) {
      setError(
        batch.skipped > 0 ? t("routes.previewSkipped", { n: batch.skipped }) : t("routes.noStops"),
      );
      return false;
    }
    const res = await addStops.mutateAsync({ routeId, stops: batch.stops });
    setPaste("");
    setError(null);
    setNotice(
      batch.skipped > 0
        ? `${t("routes.added", { n: res.added })} · ${t("routes.previewSkipped", { n: batch.skipped })}`
        : t("routes.added", { n: res.added }),
    );
    return true;
  }

  /**
   * Done. Anything still sitting in the paste box is added before the dialog closes — it used to
   * be thrown away on close, so uploading a CSV and pressing Done left a run with no addresses
   * in it and no warning that the file had gone nowhere.
   */
  async function done() {
    if (paste.trim().length === 0) {
      onClose();
      return;
    }
    setError(null);
    setNotice(null);
    try {
      if (await addParsed(paste)) onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  /**
   * One stop, typed or picked from the suggestion list.
   *
   * Two ways in, because naming a driver asks a different question of the server. Left on this
   * run it is a plain append, exactly as this form has always worked: the address waits for the
   * Resolve button and lands at the end of the list. Sent to somebody else it goes through the
   * live-order path instead, which is the only one that knows how to find the run that driver
   * already has today, reopen it if he had closed it, or open him one from this run's kitchen.
   */
  async function addOne() {
    const address = one.address.trim();
    if (!address) return;
    const driverId = one.driver || null;
    const picked = members.find((m) => m.userId === driverId);
    const driver = picked?.user?.name ?? picked?.user?.email ?? t("team.unknownUser");
    const stop = {
      addressRaw: address,
      recipientName: one.name.trim() || null,
      recipientEmail: one.email.trim() || null,
      recipientPhone: one.phone.trim() || null,
    };
    await run(async () => {
      let message = t("routes.added", { n: 1 });
      if (driverId) {
        const res = await liveStop.mutateAsync({ routeId, driverId, ...stop });
        message = res.createdRoute
          ? t("routes.liveNewRun", { driver, n: res.position })
          : res.rerouted
            ? t("routes.liveOtherRun", { driver, n: res.position, total: res.total })
            : // Named the driver this run already belongs to, so nothing moved anywhere: it is
              // the same plain append the blank picker would have done.
              t("routes.liveAdded", { n: res.position, total: res.total });
        // Placed by distance on the other run, so an address the map could not find sits at the
        // end of it. Said here rather than left for him to notice on the road.
        if (!res.located) message = `${message} · ${t("routes.liveNotLocated")}`;
      } else {
        await addStops.mutateAsync({ routeId, stops: [stop] });
      }
      setOne({ address: "", name: "", email: "", phone: "", driver: "" });
      setSuggestOpen(false);
      return message;
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/80 p-4 backdrop-blur-sm">
      <div className="my-auto flex max-h-[88vh] w-full max-w-2xl flex-col rounded-[12px] border border-line bg-ink-2">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3">
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold">{t("routes.step2Title")}</p>
            <p className="mono truncate text-[10.5px] uppercase tracking-widest text-fog">
              {route ? `${route.name} · ${route.date}` : ""}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={onClose}
            className="shrink-0 text-fog hover:text-chalk"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="border-b border-line px-5 py-2.5 text-[12.5px] leading-relaxed text-fog">
          {t("routes.step2Hint")}
        </p>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          {/* Driver. A select rather than the avatar list the standalone popup uses: this is one
              section of a longer form, and a run carries exactly one driver. */}
          <div className="rounded-[12px] border border-line bg-ink p-4">
            <label className="block">
              <span className="mono text-[10.5px] uppercase tracking-widest text-fog">
                {t("driver.title")}
              </span>
              {members.length === 0 ? (
                <p className="mt-2 text-[12.5px] text-fog">{t("driver.empty")}</p>
              ) : (
                <select
                  aria-label={t("driver.title")}
                  disabled={assign.isPending}
                  value={route?.driverId ?? ""}
                  onChange={(event) => {
                    const next = event.target.value;
                    run(async () => {
                      await assign.mutateAsync({ routeId, driverId: next || null });
                      return null;
                    });
                  }}
                  className={cn(FIELD, "mt-1.5")}
                >
                  <option value="">{t("queue.unassigned")}</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.userId}>
                      {member.user?.name ?? member.user?.email ?? t("team.unknownUser")}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>

          {notice && (
            <p className="rounded-[8px] flex items-center gap-2 border border-verified/40 bg-verified/10 px-3 py-2 text-[13px] text-verified">
              <Check className="size-4 shrink-0" /> {notice}
            </p>
          )}
          {error && (
            <p className="rounded-[8px] border border-alert/40 bg-alert/10 px-3 py-2 text-[13px] text-alert">
              {error}
            </p>
          )}
          {detail.data && !detail.data.geocodingAvailable && (
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

          {/* Stops, with the two buttons that act on the whole list. */}
          <div className="rounded-[12px] overflow-hidden border border-line bg-ink">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
              <p className="font-display text-[14px] font-semibold text-chalk">
                {t("routes.stopsTitle")}
              </p>
              <span className="text-[12px] text-fog">
                {t("routes.stopsCount", { n: stops.length })}
              </span>
              <div className="ml-auto flex items-center gap-2">
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
                  className="mono inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-chalk hover:border-amber disabled:opacity-40"
                >
                  {geocode.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <MapPin className="size-3" />
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
                  className="mono inline-flex items-center gap-1.5 rounded-[8px] bg-amber px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-on-amber hover:bg-amber-deep disabled:opacity-40"
                >
                  {optimize.isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Wand2 className="size-3" />
                  )}
                  {t("routes.optimize")}
                </button>
              </div>
            </div>

            {detail.isLoading ? (
              <div className="space-y-px">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse bg-ink-3/50" />
                ))}
              </div>
            ) : stops.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-fog">{t("routes.noStops")}</p>
            ) : (
              <ul className="max-h-64 overflow-y-auto">
                {stops.map((stop, index) => (
                  <li
                    key={stop.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-2.5 last:border-b-0"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-ink-3 text-[11px] font-bold text-chalk">
                      {index + 1}
                    </span>
                    <div className="min-w-[160px] flex-1">
                      {/* Correctable here too: the popup is where most lists are loaded, so a
                          typo is usually spotted before the page is ever opened. */}
                      <StopAddress
                        stopId={stop.id}
                        routeId={routeId}
                        addressRaw={stop.addressRaw}
                        display={stop.address ?? stop.addressRaw}
                        canEdit
                        locked={stop.status !== "pending"}
                        textClass="text-[13px] text-chalk"
                        onError={setError}
                      />
                      {/* One contact line, in the pasted order: name, email, phone, reference.
                          The popup is where most lists are loaded, so hiding the contact
                          details here hid them for good. */}
                      {(stop.recipientName ||
                        stop.recipientEmail ||
                        stop.recipientPhone ||
                        stop.reference) && (
                        <p className="flex flex-wrap items-center gap-x-2 text-[12px] text-fog">
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
                          {(stop.recipientName || stop.recipientEmail || stop.recipientPhone) &&
                            stop.reference && <span aria-hidden="true">·</span>}
                          {stop.reference && <span>{stop.reference}</span>}
                        </p>
                      )}
                      {/* The note for the driver, writable from here as well: the popup is where
                          the list is loaded, so the buzzer code usually turns up in the same
                          sitting as the address it belongs to. */}
                      <StopNote
                        stopId={stop.id}
                        notes={stop.notes}
                        canEdit
                        compact
                        onError={setError}
                      />
                    </div>

                    {/* This address's own signature rule, or the run's when it has none. */}
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
                      className="rounded-[6px] max-w-[170px] border border-line bg-ink px-1.5 py-1 text-[11px] text-fog outline-none focus:border-amber"
                    >
                      <option value="route">
                        {t(sigRouteLabel(route?.requireSignature ?? false))}
                      </option>
                      <option value="on">{t("routes.sigOn")}</option>
                      <option value="off">{t("routes.sigOff")}</option>
                    </select>

                    <span
                      className={cn(
                        "rounded-[6px] border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
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
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={t("routes.moveUp")}
                        disabled={index === 0 || reorder.isPending}
                        onClick={() => move(stop.id, -1)}
                        className="rounded-[6px] border border-line p-1 text-fog hover:text-chalk disabled:opacity-30"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={t("routes.moveDown")}
                        disabled={index === stops.length - 1 || reorder.isPending}
                        onClick={() => move(stop.id, 1)}
                        className="rounded-[6px] border border-line p-1 text-fog hover:text-chalk disabled:opacity-30"
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
                        className="rounded-[6px] border border-line p-1 text-fog hover:text-alert"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* One stop at a time, with the same address autocomplete the first step uses. */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void addOne();
            }}
            className="rounded-[12px] border border-line bg-ink p-4"
          >
            <p className="font-display text-[14px] font-semibold text-chalk">
              {t("routes.oneTitle")}
            </p>
            {/* Four fields over two rows rather than one long strip: the address needs the room,
                and an email squeezed into a fifth column is unusable on a laptop. */}
            <div className="mt-2.5 grid gap-2 sm:grid-cols-[2fr_1fr]">
              <div className="relative">
                <input
                  aria-label={t("routes.liveAddress")}
                  placeholder={t("routes.liveAddress")}
                  value={one.address}
                  onChange={(e) => {
                    setOne({ ...one, address: e.target.value });
                    setSuggestOpen(true);
                  }}
                  onFocus={() => setSuggestOpen(true)}
                  // Blur is delayed so a click on a suggestion lands before the list unmounts.
                  onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                  className={FIELD}
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-[8px] border border-line bg-ink-2 shadow-lg">
                    {suggestions.map((s) => (
                      <li key={s.placeId ?? s.description}>
                        <button
                          type="button"
                          onClick={() => {
                            setOne((prev) => ({ ...prev, address: s.description }));
                            setSuggestOpen(false);
                          }}
                          className="block w-full px-3 py-2 text-left text-[12.5px] text-chalk hover:bg-ink-3"
                        >
                          {s.description}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <input
                aria-label={t("routes.liveRecipient")}
                placeholder={t("routes.liveRecipient")}
                value={one.name}
                onChange={(e) => setOne({ ...one, name: e.target.value })}
                className={FIELD}
              />
              <input
                type="email"
                aria-label={t("routes.oneEmail")}
                placeholder={t("routes.oneEmail")}
                value={one.email}
                onChange={(e) => setOne({ ...one, email: e.target.value })}
                className={FIELD}
              />
              <input
                type="tel"
                aria-label={t("routes.onePhone")}
                placeholder={t("routes.onePhone")}
                value={one.phone}
                onChange={(e) => setOne({ ...one, phone: e.target.value })}
                className={FIELD}
              />
            </div>
            {/* Whose run it goes on. Hidden until there is somebody to send it to, so a
                one-man shop never sees a dropdown with only itself in it, and only on a
                dispatch run - a planned round is built in advance, and handing one of its
                stops to a driver already out for the day is not a question it can answer. */}
            {members.length > 0 && route?.mode === "dispatch" && (
              <div className="mt-2 grid gap-2 sm:grid-cols-[2fr_1fr] sm:items-center">
                <p className="text-[11.5px] leading-relaxed text-fog">
                  {t("routes.liveDriverHint")}
                </p>
                <select
                  aria-label={t("routes.liveDriver")}
                  value={one.driver}
                  onChange={(e) => setOne({ ...one, driver: e.target.value })}
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
                type="submit"
                disabled={
                  addStops.isPending || liveStop.isPending || one.address.trim().length === 0
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-amber px-3 py-2 text-[13px] font-semibold text-on-amber hover:bg-amber-deep disabled:opacity-50 sm:w-auto"
              >
                {addStops.isPending || liveStop.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                {t("routes.oneAdd")}
              </button>
            </div>
          </form>

          {/* A whole list at once — the same parser, preview and CSV box as the run page. */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (parsed.stops.length === 0) return;
              run(async () => {
                await addParsed(paste);
                return null;
              });
            }}
            className="rounded-[12px] border border-line bg-ink p-4"
          >
            <p className="font-display text-[14px] font-semibold text-chalk">
              {t("routes.addTitle")}
            </p>
            <p className="mt-1 text-[12.5px] text-fog">{t("routes.addHint")}</p>
            <textarea
              aria-label={t("routes.addTitle")}
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              rows={4}
              placeholder={
                "12 Main St, Moncton NB, Jane Doe, jane@example.com\n88 Elm Ave, Moncton NB"
              }
              className={cn(FIELD, "mt-2.5 font-mono text-[12.5px]")}
            />

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
                      const block =
                        paste.trim().length > 0 ? `${paste.replace(/\n*$/, "")}\n${text}` : text;
                      // Straight in, like every other action in this dialog. Staging the file in
                      // the box and waiting for a second click is what let an upload be lost on
                      // close; the stops list below is the preview, and a stop is removable.
                      await addParsed(block);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : t("routes.csvError"));
                    }
                  }}
                />
                {t("routes.csvChoose")}
              </label>
              <span className="text-[11.5px] text-fog">{t("routes.csvHint")}</span>
            </div>

            {paste.trim().length > 0 && (
              <div className="mt-3 rounded-[8px] border border-line bg-ink-2 p-3">
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
                    <table className="w-full min-w-[560px] text-left text-[12px]">
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
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <span className="text-[12px] text-fog">
            {t("routes.stopsCount", { n: stops.length })}
          </span>
          <button
            type="button"
            disabled={addStops.isPending}
            onClick={done}
            className="rounded-[8px] mono inline-flex items-center gap-2 bg-amber px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-widest text-ink hover:bg-amber-deep disabled:opacity-60"
          >
            {addStops.isPending && <Loader2 className="size-3 animate-spin" />}
            {t("driver.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
