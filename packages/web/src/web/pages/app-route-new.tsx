import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { useCreateRoute } from "../queries/routes";
import { useT } from "../lib/i18n";

/** Minutes past midnight <-> "HH:MM", so the ETA maths never touches a timezone. */
function toMinutes(value: string): number {
  const [h, m] = value.split(":");
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}

const FIELD =
  "mt-1.5 w-full rounded-[8px] border border-line bg-ink px-3 py-2 text-[13.5px] text-chalk outline-none focus:border-amber";

export default function AppRouteNew() {
  const t = useT();
  const [, navigate] = useLocation();
  const create = useCreateRoute();
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

  return (
    <DashboardShell title={t("routes.newTitle")} subtitle={t("routes.newSubtitle")}>
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
            navigate(`/app/routes/${created.id}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
        }}
        className="grid max-w-2xl gap-4 rounded-[12px] border border-line bg-ink-2 p-5 sm:grid-cols-2"
      >
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

        <label className="block sm:col-span-2">
          <span className="label">{t("routes.fStartAddress")}</span>
          <input
            aria-label={t("routes.fStartAddress")}
            value={form.startAddress}
            onChange={(e) => setForm({ ...form, startAddress: e.target.value })}
            placeholder="34-18 Clearview Street, Moncton, NB"
            className={FIELD}
          />
          <span className="mt-1 block text-[12px] text-fog">{t("routes.fStartHint")}</span>
        </label>

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

        <label className="block sm:col-span-2">
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
          <span className="mt-1 block text-[12px] text-fog">
            {form.mode === "dispatch" ? t("routes.modeDispatchHint") : t("routes.modePlannedHint")}
          </span>
        </label>

        <div className="grid gap-2 self-end">
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

        {error && <p className="text-[13px] text-alert sm:col-span-2">{error}</p>}

        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={create.isPending}
            className="inline-flex items-center gap-2 rounded-[8px] bg-amber px-4 py-2 text-[13px] font-semibold text-on-amber hover:bg-amber-deep disabled:opacity-60"
          >
            {create.isPending && <Loader2 className="size-4 animate-spin" />}
            {t("routes.create")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/app/routes")}
            className="rounded-[8px] border border-line px-4 py-2 text-[13px] text-fog hover:text-chalk"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </DashboardShell>
  );
}
