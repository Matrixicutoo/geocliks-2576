import { useState } from "react";
import { Check, Search } from "lucide-react";
import { AdminShell } from "../components/admin-shell";
import { useAdminWorkspaces, useSetWorkspacePlan } from "../queries/admin";
import { type TKey, useT } from "../lib/i18n";

function bytes(value: number) {
  if (value <= 0) return "0 MB";
  const mb = value / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
}

export default function AdminWorkspaces() {
  const t = useT();
  const [q, setQ] = useState("");
  const workspaces = useAdminWorkspaces(q);
  const setPlan = useSetWorkspacePlan();
  const [draft, setDraft] = useState<Record<string, { planId: string; seats: number }>>({});
  const [error, setError] = useState<string | null>(null);
  const plans = workspaces.data?.plans ?? [];

  return (
    <AdminShell
      title={t("admin.nav.workspaces")}
      subtitle={t("admin.ws.subtitle")}
      actions={
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fog" />
          <input
            aria-label={t("admin.ws.searchLabel")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("admin.ws.searchPlaceholder")}
            className="w-[240px] rounded-[8px] border border-line bg-ink-2 py-1.5 pl-8 pr-3 text-[13px] text-chalk placeholder:text-fog focus:border-amber focus:outline-none"
          />
        </div>
      }
    >
      {error && (
        <p className="rounded-[8px] mb-4 border border-alert/50 bg-alert/10 px-3 py-2 text-[12.5px] text-alert">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {workspaces.isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[12px] border border-line bg-ink-2" />
          ))}

        {workspaces.data?.workspaces.map((ws) => {
          const d = draft[ws.id] ?? { planId: ws.plan, seats: ws.seats };
          const dirty = d.planId !== ws.plan || d.seats !== ws.seats;
          return (
            <div
              key={ws.id}
              className="grid gap-4 rounded-[12px] border border-line bg-ink-2 p-4 lg:grid-cols-[minmax(0,1fr)_340px]"
            >
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="font-display text-lg font-bold text-chalk">{ws.name}</p>
                  <span className="rounded-[6px] mono border border-amber/40 bg-amber/10 px-1.5 text-[10px] uppercase tracking-widest text-amber">
                    {ws.planName}
                  </span>
                  {ws.subscription && (
                    <span className="mono rounded-[8px] border border-line px-1.5 text-[10px] uppercase tracking-widest text-fog">
                      {ws.subscription.provider} · {ws.subscription.status}
                    </span>
                  )}
                </div>
                <p className="mono mt-1 text-[10.5px] text-fog">
                  {ws.slug} · {t("admin.ws.owner")} {ws.owner?.email ?? "—"}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(
                    [
                      ["admin.ws.photos", ws.usage.photos.toLocaleString()],
                      ["admin.ws.projects", ws.usage.projects.toLocaleString()],
                      ["admin.ws.members", `${ws.usage.members} / ${ws.seats}`],
                      ["admin.ws.storage", bytes(ws.usage.storageBytes)],
                    ] as [TKey, string][]
                  ).map(([label, value]) => (
                    <div key={label} className="rounded-[12px] border border-line bg-ink px-3 py-2">
                      <p className="label text-fog">{t(label)}</p>
                      <p className="mono mt-0.5 text-[13px] text-chalk">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

 <div className="rounded-[12px] border border-line bg-ink p-4">
                <p className="label text-fog">{t("admin.ws.changePlan")}</p>
                <div className="mt-2 space-y-2">
                  <select
                    aria-label={t("admin.ws.changePlan")}
                    value={d.planId}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, [ws.id]: { ...d, planId: e.target.value } }))
                    }
                    className="w-full rounded-[12px] border border-line bg-ink-2 px-2 py-1.5 text-[13px] text-chalk focus:border-amber focus:outline-none"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <label className="block">
                    <span className="label text-fog">{t("admin.ws.seats")}</span>
                    <input
                      aria-label={t("admin.ws.seatsFor", { name: ws.name })}
                      type="number"
                      min={1}
                      value={d.seats}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          [ws.id]: { ...d, seats: Number(e.target.value) || 1 },
                        }))
                      }
                      className="mono mt-1 w-full rounded-[12px] border border-line bg-ink-2 px-2 py-1.5 text-[13px] text-chalk focus:border-amber focus:outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={!dirty || setPlan.isPending}
                    onClick={async () => {
                      setError(null);
                      try {
                        await setPlan.mutateAsync({
                          orgId: ws.id,
                          planId: d.planId,
                          seats: d.seats,
                        });
                        setDraft((prev) => {
                          const next = { ...prev };
                          delete next[ws.id];
                          return next;
                        });
                      } catch (e) {
                        setError(e instanceof Error ? e.message : t("admin.ws.planFailed"));
                      }
                    }}
                    className="rounded-[8px] mono flex w-full items-center justify-center gap-1.5 border border-amber/50 bg-amber/10 px-3 py-1.5 text-[11px] uppercase tracking-widest text-amber hover:bg-amber/20 disabled:opacity-40"
                  >
                    <Check className="size-3.5" /> {t("admin.ws.apply")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {workspaces.data?.workspaces.length === 0 && (
          <p className="rounded-[12px] border border-line bg-ink-2 px-4 py-8 text-center text-[13px] text-fog">
            {t("admin.ws.noMatch", { q })}
          </p>
        )}
      </div>
    </AdminShell>
  );
}
