import { useState } from "react";
import { Ban, Eye, Search, ShieldCheck, Trash2, Undo2 } from "lucide-react";
import { AdminShell } from "../components/admin-shell";
import {
  useAdminMe,
  useAdminUsers,
  useDeleteUser,
  useImpersonate,
  useSetStaff,
  useSetSuspended,
} from "../queries/admin";
import { startImpersonation } from "../lib/impersonate";
import { cn } from "../lib/utils";
import { type TKey, useT } from "../lib/i18n";

export default function AdminUsers() {
  const t = useT();
  const [q, setQ] = useState("");
  const me = useAdminMe();
  const users = useAdminUsers(q);
  const setStaff = useSetStaff();
  const setSuspended = useSetSuspended();
  const removeUser = useDeleteUser();
  const impersonate = useImpersonate();
  const [error, setError] = useState<string | null>(null);
  const superadmin = me.data?.staffRole === "superadmin";

  const act = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("admin.actionFailed"));
    }
  };

  return (
    <AdminShell
      title={t("admin.nav.users")}
      subtitle={t("admin.us.subtitle")}
      actions={
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fog" />
          <input
            aria-label={t("admin.us.searchLabel")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("admin.us.searchPlaceholder")}
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

      <div className="overflow-x-auto rounded-[12px] border border-line bg-ink-2">
        <table className="w-full min-w-[900px] text-[13px]">
          <thead>
            <tr className="border-b border-line text-left">
              {(
                [
                  "admin.us.colAccount",
                  "admin.us.colWorkspace",
                  "admin.ov.plan",
                  "admin.us.colRole",
                  "admin.us.colPlatform",
                  "admin.ov.photos",
                  null,
                ] as (TKey | null)[]
              ).map((h, i) => (
                <th key={h ?? i} className="label px-4 py-2.5 font-normal text-fog">
                  {h ? t(h) : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-line/60">
                  <td aria-label={t("admin.us.loading")} className="px-4 py-4" colSpan={7}>
                    <div className="h-4 animate-pulse bg-ink-3" />
                  </td>
                </tr>
              ))}

            {users.data?.map((u) => (
              <tr key={u.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-semibold text-chalk">{u.name || "—"}</p>
                  <p className="mono text-[10.5px] text-fog">{u.email}</p>
                  {u.suspended && (
                    <span className="rounded-[6px] mono mt-1 inline-block border border-alert/50 bg-alert/10 px-1.5 text-[9.5px] uppercase tracking-widest text-alert">
                      {t("admin.us.suspendedTag")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-fog">{u.org?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="mono text-[11px] text-amber">{u.planName ?? "—"}</span>
                </td>
                <td className="mono px-4 py-3 text-[11px] uppercase tracking-widest text-fog">
                  {u.role ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={t("admin.us.platformRoleFor", { email: u.email })}
                    value={u.staffRole ?? "none"}
                    disabled={!superadmin || setStaff.isPending}
                    onChange={(e) =>
                      act(() =>
                        setStaff.mutateAsync({
                          userId: u.id,
                          role: e.target.value as "superadmin" | "admin" | "none",
                        }),
                      )
                    }
                    className={cn(
                      "rounded-[12px] border border-line bg-ink px-2 py-1 text-[11.5px] text-chalk focus:border-amber focus:outline-none disabled:opacity-50",
                      u.staffRole && "border-alert/50 text-alert",
                    )}
                  >
                    <option value="none">—</option>
                    <option value="admin">admin</option>
                    <option value="superadmin">superadmin</option>
                  </select>
                </td>
                <td className="mono px-4 py-3 text-fog">{u.photos}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      aria-label={t("admin.us.impersonateAria", { email: u.email })}
                      title={t("admin.us.impersonateTitle")}
                      onClick={() =>
                        act(async () => {
                          const grant = await impersonate.mutateAsync({ userId: u.id });
                          startImpersonation(grant.token, grant.user.email);
                          window.location.href = "/app";
                        })
                      }
                      className="rounded-[12px] border border-line px-2 py-1 text-fog hover:border-sky/60 hover:text-sky"
                    >
                      <Eye className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={t(
                        u.suspended ? "admin.us.restoreAria" : "admin.us.suspendAria",
                        { email: u.email },
                      )}
                      title={t(u.suspended ? "admin.us.restoreTitle" : "admin.us.suspendTitle")}
                      onClick={() =>
                        act(() =>
                          setSuspended.mutateAsync({
                            userId: u.id,
                            suspended: !u.suspended,
                            reason: u.suspended ? undefined : t("admin.us.suspendReason"),
                          }),
                        )
                      }
                      className="rounded-[12px] border border-line px-2 py-1 text-fog hover:border-amber/60 hover:text-amber"
                    >
                      {u.suspended ? <Undo2 className="size-3.5" /> : <Ban className="size-3.5" />}
                    </button>
                    <button
                      type="button"
                      aria-label={t("admin.us.deleteAria", { email: u.email })}
                      title={t("admin.us.deleteTitle")}
                      disabled={!superadmin}
                      onClick={() => {
                        if (!window.confirm(t("admin.us.confirmDelete", { email: u.email }))) return;
                        act(() => removeUser.mutateAsync({ userId: u.id }));
                      }}
                      className="rounded-[12px] border border-line px-2 py-1 text-fog hover:border-alert/60 hover:text-alert disabled:opacity-40"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {users.data?.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-[13px] text-fog" colSpan={7}>
                  {t("admin.us.noMatch", { q })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-fog">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-verified" />
        {t("admin.us.footnote")}
      </p>
    </AdminShell>
  );
}
