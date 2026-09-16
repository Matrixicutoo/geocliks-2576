import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useAddressSuggestions, useCreateRoute } from "../queries/routes";
import { useOrg } from "../queries/orgs";
import { useT } from "../lib/i18n";

/** Minutes past midnight <-> "HH:MM", so the ETA maths never touches a timezone. */
function toMinutes(value: string): number {
  const [h, m] = value.split(":");
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}

const FIELD =
  "mt-1.5 w-full rounded-[8px] border border-line bg-ink px-3 py-2 text-[13.5px] text-chalk outline-none focus:border-amber";

/**
 * New route, as a popup over the routes list — the same thing New project is on the projects
 * page. Naming a run is a ten-second job and it used to cost a whole page load away from the
 * list and a second one back, which made adding three runs feel like paperwork.
 *
 * This is the only copy of the form: `/app/routes/new` now opens the routes page with this
 * dialog already up, so a bookmarked link still lands somewhere sensible and there is never a
 * second form to keep in step with this one.
 */
export function NewRouteDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  /**
   * Handed the new run's id instead of navigating to it. The routes page opens the stops and
   * driver popup on top of the list, so naming a run and filling it in never costs a page.
   */
  onCreated: (routeId: string) => void;
}) {
  const t = useT();
  const create = useCreateRoute();
  const org = useOrg();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    name: "",
    date: today,
    mode: "planned" as "planned" | "dispatch",
    startAddress: "",
    startTime: "08:00",
    serviceMinutes: "5",
    returnToStart: false,
    requireSignature: false,
  });

  /**
   * Address suggestions. `addressQuery` trails the typed value by 300 ms so a request is not
   * billed per keystroke, and the list only shows while the field has focus.
   *
   * If Google returns nothing — including when Places API (New) is not enabled for the Cloud
   * project — `suggestions` is empty and this stays an ordinary text box.
   */
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const suggestQuery = useAddressSuggestions(addressQuery);
  const suggestions = suggestOpen ? (suggestQuery.data ?? []) : [];

  useEffect(() => {
    const handle = setTimeout(() => setAddressQuery(form.startAddress), 300);
    return () => clearTimeout(handle);
  }, [form.startAddress]);

  // Escape closes it, like every other popup in the dashboard.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          try {
            const created = await create.mutateAsync({
              name: form.name,
              date: form.date,
              mode: form.mode,
              startAddress: form.startAddress || null,
              startMinutes: toMinutes(form.startTime),
              serviceMinutes: Number(form.serviceMinutes) || 5,
              returnToStart: form.returnToStart,
              requireSignature: form.requireSignature,
            });
            // Straight on to its stops and its driver, in the next popup over the same list.
            onCreated(created.id);
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
        }}
        className="my-auto w-full max-w-lg rounded-[12px] border border-line bg-ink-2"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold">{t("routes.newTitle")}</p>
            <p className="mt-0.5 text-[12px] text-fog">{t("routes.newSubtitle")}</p>
          </div>
          <button
            type="button"
            aria-label={t("common.cancel")}
            onClick={onClose}
            className="shrink-0 text-fog hover:text-chalk"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="label">{t("routes.fName")}</span>
            <input
              aria-label={t("routes.fName")}
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Monday — West End"
              className={FIELD}
            />
          </label>

          {/*
            Who is dispatching this run. It is not typed in: the server already stamps
            `routes.createdBy` with the signed-in user on create, so showing that same person
            here keeps the form and the record in step and makes the value impossible to leave
            blank.
          */}
          <label className="block sm:col-span-2">
            <span className="label">{t("routes.fDispatcher")}</span>
            <input
              aria-label={t("routes.fDispatcher")}
              readOnly
              value={org.data?.user.name ?? ""}
              className={`${FIELD} cursor-default text-fog focus:border-line`}
            />
            <span className="mt-1 block text-[12px] text-fog">{t("routes.fDispatcherHint")}</span>
          </label>

          <label className="block">
            <span className="label">{t("routes.fDate")}</span>
            <input
              aria-label={t("routes.fDate")}
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={FIELD}
            />
          </label>

          <label className="block">
            <span className="label">{t("routes.fStartTime")}</span>
            <input
              aria-label={t("routes.fStartTime")}
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className={FIELD}
            />
          </label>

          {/*
            A <div>, not a <label>: the suggestion list holds buttons, and a button inside a
            label steals the click back to the input. The caption below keeps the same look.
          */}
          <div className="relative block sm:col-span-2">
            <label className="block">
              <span className="label">{t("routes.fStartAddress")}</span>
              <input
                aria-label={t("routes.fStartAddress")}
                value={form.startAddress}
                onChange={(e) => {
                  setForm({ ...form, startAddress: e.target.value });
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                // Blur closes the list; the options cancel their own mousedown so picking one
                // never races this.
                onBlur={() => setSuggestOpen(false)}
                autoComplete="off"
                placeholder="34-18 Clearview Street, Moncton, NB"
                className={FIELD}
              />
            </label>
            {suggestions.length > 0 && (
              <ul className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-[8px] border border-line bg-ink-2 shadow-lg">
                {suggestions.map((item) => (
                  <li key={item.placeId ?? item.description}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, startAddress: item.description }));
                        setAddressQuery(item.description);
                        setSuggestOpen(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-[13px] text-chalk hover:bg-amber hover:text-on-amber"
                    >
                      {item.description}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <span className="mt-1 block text-[12px] text-fog">{t("routes.fStartHint")}</span>
          </div>

          <label className="block">
            <span className="label">{t("routes.fServiceMinutes")}</span>
            <input
              aria-label={t("routes.fServiceMinutes")}
              type="number"
              min={0}
              max={240}
              value={form.serviceMinutes}
              onChange={(e) => setForm({ ...form, serviceMinutes: e.target.value })}
              className={FIELD}
            />
          </label>

          <label className="block">
            <span className="label">{t("routes.fMode")}</span>
            <select
              aria-label={t("routes.fMode")}
              value={form.mode}
              onChange={(e) =>
                setForm({ ...form, mode: e.target.value === "dispatch" ? "dispatch" : "planned" })
              }
              className={FIELD}
            >
              <option value="planned">{t("routes.modePlanned")}</option>
              <option value="dispatch">{t("routes.modeDispatch")}</option>
            </select>
          </label>

          <p className="text-[12px] text-fog sm:col-span-2">
            {form.mode === "dispatch" ? t("routes.modeDispatchHint") : t("routes.modePlannedHint")}
          </p>

          <div className="grid gap-2 sm:col-span-2">
            <label className="flex items-center gap-2 text-[13px] text-chalk">
              <input
                aria-label={t("routes.fReturnToStart")}
                type="checkbox"
                checked={form.returnToStart}
                onChange={(e) => setForm({ ...form, returnToStart: e.target.checked })}
                className="size-4 accent-[#ffb021]"
              />
              {t("routes.fReturnToStart")}
            </label>
            <label className="flex items-center gap-2 text-[13px] text-chalk">
              <input
                aria-label={t("routes.fRequireSignature")}
                type="checkbox"
                checked={form.requireSignature}
                onChange={(e) => setForm({ ...form, requireSignature: e.target.checked })}
                className="size-4 accent-[#ffb021]"
              />
              {t("routes.fRequireSignature")}
            </label>
          </div>

          {error && (
            <p className="rounded-[8px] border border-alert/40 bg-alert/10 px-3 py-2 text-[12.5px] text-alert sm:col-span-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="mono rounded-[8px] border border-line px-3 py-2 text-[10.5px] uppercase tracking-widest text-fog hover:text-chalk"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="mono flex items-center gap-2 rounded-[8px] bg-amber px-3.5 py-2 text-[10.5px] font-bold uppercase tracking-widest text-ink hover:bg-amber-deep disabled:opacity-60"
          >
            {create.isPending && <Loader2 className="size-3.5 animate-spin" />}
            {t("routes.create")}
          </button>
        </div>
      </form>
    </div>
  );
}
