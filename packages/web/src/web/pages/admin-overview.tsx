import { Camera, FolderKanban, HardDrive, Layers, ShieldAlert, Users2 } from "lucide-react";
import { AdminShell } from "../components/admin-shell";
import { useAdminOverview } from "../queries/admin";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

function money(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function bytes(value: number) {
  if (value <= 0) return "0 MB";
  const mb = value / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
}

function Tile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "amber",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
  tone?: "amber" | "alert" | "verified" | "sky";
}) {
  return (
    <div className="rounded-[12px] border border-line bg-ink-2 p-4">
      <div className="flex items-start justify-between">
        <p className="label text-fog">{label}</p>
        <Icon
          className={cn(
            "size-4",
            tone === "amber" && "text-amber",
            tone === "alert" && "text-alert",
            tone === "verified" && "text-verified",
            tone === "sky" && "text-sky",
          )}
        />
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-chalk">{value}</p>
      {hint && <p className="mono mt-1 text-[10px] uppercase tracking-widest text-fog">{hint}</p>}
    </div>
  );
}

export default function AdminOverview() {
  const overview = useAdminOverview();
  const d = overview.data;
  const t = useT();

  return (
    <AdminShell
      title={t("admin.ov.title")}
      subtitle={t("admin.ov.subtitle")}
      actions={
        d && (
          <span className="mono rounded-[8px] border border-line bg-ink-2 px-2.5 py-1 text-[10px] uppercase tracking-widest text-fog">
            {d.staffRole}
          </span>
        )
      }
    >
      {overview.isLoading || !d ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[12px] border border-line bg-ink-2" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tile
              label={t("admin.ov.mrr")}
              value={money(d.mrrCents)}
              hint={t("admin.ov.mrrHint")}
              icon={Layers}
              tone="verified"
            />
            <Tile
              label={t("admin.nav.users")}
              value={d.totals.users.toLocaleString()}
              hint={t("admin.ov.suspendedHint", { n: d.totals.suspended })}
              icon={Users2}
            />
            <Tile
              label={t("admin.nav.workspaces")}
              value={d.totals.workspaces.toLocaleString()}
              hint={t("admin.ov.plansHint", { n: d.totals.planCount })}
              icon={Layers}
              tone="sky"
            />
            <Tile
              label={t("admin.ov.photos")}
              value={d.totals.photos.toLocaleString()}
              hint={t("admin.ov.thisMonthHint", { n: d.totals.photosThisMonth.toLocaleString() })}
              icon={Camera}
            />
            <Tile
              label={t("admin.ov.projects")}
              value={d.totals.projects.toLocaleString()}
              icon={FolderKanban}
              tone="sky"
            />
            <Tile
              label={t("admin.ov.storage")}
              value={bytes(d.totals.storageBytes)}
              icon={HardDrive}
              tone="amber"
            />
            <Tile
              label={t("admin.ov.suspended")}
              value={d.totals.suspended.toLocaleString()}
              icon={ShieldAlert}
              tone="alert"
            />
            <Tile
              label={t("admin.ov.photosPerWs")}
              value={
                d.totals.workspaces
                  ? Math.round(d.totals.photos / d.totals.workspaces).toLocaleString()
                  : "0"
              }
              icon={Camera}
              tone="verified"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-[12px] border border-line bg-ink-2">
              <div className="border-b border-line px-4 py-3">
                <p className="label text-fog">{t("admin.ov.planMix")}</p>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="label px-4 py-2 font-normal text-fog">
                      {t("admin.ov.plan")}
                    </th>
                    <th className="label px-4 py-2 font-normal text-fog">
                      {t("admin.nav.workspaces")}
                    </th>
                    <th className="label px-4 py-2 font-normal text-fog">
                      {t("admin.ov.seats")}
                    </th>
                    <th className="label px-4 py-2 text-right font-normal text-fog">
                      {t("admin.ov.mrrCol")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {d.mix.map((row) => (
                    <tr key={row.planId} className="border-b border-line/60 last:border-0">
                      <td className="px-4 py-2.5 font-semibold text-chalk">{row.name}</td>
                      <td className="mono px-4 py-2.5 text-fog">{row.workspaces}</td>
                      <td className="mono px-4 py-2.5 text-fog">{row.seats}</td>
                      <td className="mono px-4 py-2.5 text-right text-verified">
                        {money(row.mrrCents)}
                      </td>
                    </tr>
                  ))}
                  {d.mix.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-[13px] text-fog" colSpan={4}>
                        {t("admin.ov.noWorkspaces")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-[12px] border border-line bg-ink-2">
              <div className="border-b border-line px-4 py-3">
                <p className="label text-fog">{t("admin.ov.newest")}</p>
              </div>
              <ul className="divide-y divide-line/60">
                {d.recentUsers.map((u) => (
                  <li key={u.id} className="px-4 py-2.5">
                    <p className="truncate text-[13px] font-semibold text-chalk">
                      {u.name || u.email}
                    </p>
                    <p className="mono truncate text-[10.5px] text-fog">{u.email}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[12px] border border-line bg-ink-2">
            <div className="border-b border-line px-4 py-3">
              <p className="label text-fog">{t("admin.ov.audit")}</p>
            </div>
            <ul className="divide-y divide-line/60">
              {d.events.map((e) => (
                <li key={e.id} className="flex flex-wrap items-baseline gap-x-3 px-4 py-2.5">
                  <span className="mono text-[10.5px] text-fog">
                    {new Date(e.at).toLocaleString()}
                  </span>
                  <span className="rounded-[6px] mono border border-amber/40 bg-amber/10 px-1.5 text-[10px] uppercase tracking-widest text-amber">
                    {e.action}
                  </span>
                  <span className="text-[12.5px] text-chalk">{e.actor?.email ?? e.actorId}</span>
                  {e.detail && <span className="text-[12.5px] text-fog">— {e.detail}</span>}
                </li>
              ))}
              {d.events.length === 0 && (
                <li className="px-4 py-6 text-[13px] text-fog">{t("admin.ov.noEvents")}</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
