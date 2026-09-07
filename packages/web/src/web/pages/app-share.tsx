import { useState } from "react";
import { Check, Copy, Eye, Link2, Loader2, Plus, ShieldOff } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
import { formatStamp } from "../components/evidence-card";
import { useCreateShareLink, useRevokeShareLink, useShareLinks } from "../queries/share";
import { useProjects } from "../queries/projects";
import { useOrg } from "../queries/orgs";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

export default function AppShare() {
  const t = useT();
  const links = useShareLinks();
  const projects = useProjects();
  const org = useOrg();
  const create = useCreateShareLink();
  const revoke = useRevokeShareLink();

  const [label, setLabel] = useState("");
  const [projectId, setProjectId] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [expires, setExpires] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  // A field member may only share a job they are assigned to — no workspace-wide option, and
  // their scope falls back to their first assigned job. The server enforces the same rule.
  const isField = org.data?.role === "field";
  const scopeId = isField ? projectId || (projects.data?.[0]?.id ?? "") : projectId;

  return (
    <DashboardShell
      title={t("share.title")}
      subtitle={t("share.subtitle")}
    >
      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            try {
              await create.mutateAsync({
                label,
                projectId: scopeId || null,
                allowDownload,
                expiresInDays: expires === "never" ? null : Number(expires),
              });
              setLabel("");
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
          className="h-fit rounded-[12px] border border-line bg-ink-2"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="font-display text-[15px] font-semibold">{t("share.newLink")}</p>
          </div>
          <div className="space-y-4 p-4">
            <label className="block">
              <span className="label mb-1.5 block text-fog">{t("share.label")}</span>
              <input
                aria-label={t("share.label")}
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Northline — weekly progress"
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              />
            </label>

            <label className="block">
              <span className="label mb-1.5 block text-fog">{t("share.scope")}</span>
              <select
                aria-label={t("share.scope")}
                value={scopeId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              >
                {isField ? null : <option value="">{t("share.wholeWorkspace")}</option>}
                {(projects.data ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="label mb-1.5 block text-fog">{t("share.expires")}</span>
              <select
                aria-label={t("share.expires")}
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              >
                <option value="7">{t("share.in7")}</option>
                <option value="30">{t("share.in30")}</option>
                <option value="90">{t("share.in90")}</option>
                <option value="never">{t("share.never")}</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => setAllowDownload((v) => !v)}
              className="flex w-full items-center justify-between rounded-[12px] border border-line bg-ink px-3 py-2.5 text-left"
            >
              <span className="text-[13px] text-chalk">{t("share.allowDownloads")}</span>
              <span
                className={cn(
                  "rounded-[6px] mono border px-2 py-0.5 text-[10px] uppercase tracking-widest",
                  allowDownload
                    ? "border-verified/40 bg-verified/10 text-verified"
                    : "border-line text-fog",
                )}
              >
                {allowDownload ? t("share.on") : t("share.off")}
              </span>
            </button>

            {error && <p className="mono text-[11px] text-alert">{error}</p>}

            <button
              type="submit"
              disabled={create.isPending}
 className="rounded-[8px] inline-flex w-full items-center justify-center gap-2 bg-amber px-4 py-2.5 text-[13px] font-semibold text-ink disabled:opacity-60"
            >
              {create.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {t("share.createLink")}
            </button>
          </div>
        </form>

        <div className="min-w-0">
          {links.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-[12px] border border-line bg-ink-2" />
              ))}
            </div>
          ) : (links.data ?? []).length === 0 ? (
            <EmptyState
              icon={Link2}
              title={t("share.empty.title")}
              hint={t("share.empty.hint")}
            />
          ) : (
            <ul className="space-y-3">
              {(links.data ?? []).map((link) => {
                const url = `${origin}/share/${link.token}`;
                const expired =
                  link.expiresAt != null && new Date(link.expiresAt).getTime() < Date.now();
                const dead = link.revoked || expired;
                return (
                  <li
                    key={link.id}
                    className={cn("rounded-[12px] border border-line bg-ink-2 p-4", dead && "opacity-60")}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-chalk">
                          {link.label}
                        </p>
                        <p className="mono text-[10px] uppercase tracking-widest text-fog">
                          {link.projectName ?? t("share.wholeWorkspace")} ·{" "}
                          {link.allowDownload ? t("share.downloadsOn") : t("share.viewOnly")} ·{" "}
                          {link.revoked
                            ? t("share.revoked")
                            : expired
                              ? t("share.expired")
                              : link.expiresAt
                                ? t("share.expiresAt", { stamp: formatStamp(link.expiresAt) })
                                : t("share.noExpiry")}
                        </p>
                      </div>
                      <span className="mono inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2 py-1 text-[10px] uppercase tracking-widest text-fog">
                        <Eye className="size-3" /> {t("share.viewsN", { n: link.views })}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <code className="mono min-w-0 flex-1 truncate rounded-[12px] border border-line bg-ink px-2.5 py-2 text-[11px] text-sky">
                        {url}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(url);
                          setCopied(link.id);
                          setTimeout(() => setCopied(null), 1800);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-2 text-[11.5px] text-chalk transition-colors hover:border-amber/60 hover:text-amber"
                      >
                        {copied === link.id ? (
                          <Check className="size-3.5 text-verified" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                        {copied === link.id ? t("common.copied") : t("common.copy")}
                      </button>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-[12px] border border-line px-2.5 py-2 text-[11.5px] text-chalk transition-colors hover:border-sky/60 hover:text-sky"
                      >
                        {t("share.open")}
                      </a>
                      {!link.revoked && (
                        <button
                          type="button"
                          onClick={() => revoke.mutate({ id: link.id })}
                          className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-2 text-[11.5px] text-fog transition-colors hover:border-alert/50 hover:text-alert"
                        >
                          <ShieldOff className="size-3.5" /> {t("share.revoke")}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
