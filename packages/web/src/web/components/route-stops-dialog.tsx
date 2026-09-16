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
  useAddStops,
  useAddressSuggestions,
  useAssignRoute,
  useGeocodeStops,
  useOptimizeRoute,
  useRemoveStop,
  useReorderStops,
  useRoute,
} from "../queries/routes";
import { useTeam } from "../queries/team";
import { parseStops } from "../lib/parse-stops";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

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
  const geocode = useGeocodeStops();
  const optimize = useOptimizeRoute();
  const reorder = useReorderStops();
  const removeStop = useRemoveStop();
  const assign = useAssignRoute();

  const [paste, setPaste] = useState("");
  const [one, setOne] = useState({ address: "", name: "" });
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

  /** One stop, typed or picked from the suggestion list. */
  async function addOne() {
    const address = one.address.trim();
    if (!address) return;
    await run(async () => {
      await addStops.mutateAsync({
        routeId,
        stops: [{ addressRaw: address, recipientName: one.name.trim() || null }],
      });
      setOne({ address: "", name: "" });
      setSuggestOpen(false);
      return t("routes.added", { n: 1 });
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
                      <p className="text-[13px] text-chalk">{stop.address ?? stop.addressRaw}</p>
                      {(stop.recipientName || stop.reference) && (
                        <p className="text-[12px] text-fog">
                          {[stop.recipientName, stop.reference].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
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
            <div className="mt-2.5 grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
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
              <button
                type="submit"
                disabled={addStops.isPending || one.address.trim().length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-amber px-3 py-2 text-[13px] font-semibold text-on-amber hover:bg-amber-deep disabled:opacity-50"
              >
                {addStops.isPending ? (
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
                const res = await addStops.mutateAsync({ routeId, stops: parsed.stops });
                setPaste("");
                return t("routes.added", { n: res.added });
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
                    <table className="w-full min-w-[420px] text-left text-[12px]">
                      <thead>
                        <tr className="text-fog">
                          <th className="py-1 pr-3 font-medium">{t("routes.colAddress")}</th>
                          <th className="py-1 pr-3 font-medium">{t("routes.colName")}</th>
                          <th className="py-1 font-medium">{t("routes.colPhone")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row) => (
                          <tr key={row.key} className="border-t border-line align-top">
                            <td className="py-1 pr-3 text-chalk">{row.addressRaw}</td>
                            <td className="py-1 pr-3 text-fog">{row.recipientName ?? "-"}</td>
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
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
          <span className="text-[12px] text-fog">
            {t("routes.stopsCount", { n: stops.length })}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[8px] mono bg-amber px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-widest text-ink hover:bg-amber-deep"
          >
            {t("driver.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
