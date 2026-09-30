import { useEffect, useState } from "react";
import { Check, Copy, Eye, Link2, Loader2, Plus, ShieldOff, X } from "lucide-react";
import { formatStamp } from "./evidence-card";
import { useCreateShareLink, useRevokeShareLink, useShareLinks } from "../queries/share";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

/**
 * "Share with client", opened from the project page as a popup instead of sending the office off
 * to the Share links page. Same live link the share page mints, pre-scoped to this job so there
 * is no scope picker to get wrong, and the links already out for this job sit underneath with
 * copy, open and revoke — the usual reason to open this is "send that link again".
 */
export function ShareProjectDialog({
  projectId,
  projectName,
  onClose,
  projectOptions,
  onProjectChange,
}: {
  projectId: string;
  projectName?: string | null;
  onClose: () => void;
  /**
   * Opened from somewhere that spans several jobs (Before / After), the popup offers them as a
   * picker in its header instead of a fixed name. A link is still only ever for one job.
   */
  projectOptions?: [id: string, name: string][];
  onProjectChange?: (id: string) => void;
}) {
  const t = useT();
  const links = useShareLinks();
  const create = useCreateShareLink();
  const revoke = useRevokeShareLink();

  const [label, setLabel] = useState(projectName ?? "");
  // Switching job in the picker renames the new link after that job.
  useEffect(() => {
    setLabel(projectName ?? "");
  }, [projectName]);
  const [allowDownload, setAllowDownload] = useState(true);
  const [expires, setExpires] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const mine = (links.data ?? []).filter((link) => link.projectId === projectId);

  const copy = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      {/* The dimmed backdrop is its own button, so clicking off the card closes it. */}
      <button
        type="button"
        aria-label={t("common.close")}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
      />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col rounded-[12px] border border-line bg-ink-2">
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3">
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold">{t("project.shareClient")}</p>
            {projectOptions && projectOptions.length > 1 && onProjectChange ? (
              <select
                aria-label={t("common.project")}
                value={projectId}
                onChange={(e) => onProjectChange(e.target.value)}
                className="mono mt-1 max-w-full rounded-[8px] border border-line bg-ink px-2 py-1 text-[10.5px] uppercase tracking-widest text-chalk outline-none focus:border-amber"
              >
                {projectOptions.map(([value, name]) => (
                  <option key={value} value={value}>
                    {name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mono truncate text-[10.5px] uppercase tracking-widest text-fog">
                {projectName ?? ""}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label={t("common.close")}
            onClick={onClose}
            className="text-fog hover:text-chalk"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="border-b border-line px-5 py-2.5 text-[12.5px] leading-relaxed text-fog">
          {t("share.subtitle")}
        </p>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              try {
                const link = await create.mutateAsync({
                  label: label.trim() || (projectName ?? ""),
                  projectId,
                  allowDownload,
                  expiresInDays: expires === "never" ? null : Number(expires),
                });
                // The link was made to be sent, so it goes straight onto the clipboard.
                if (link?.token) copy(link.id, `${origin}/share/${link.token}`);
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
              }
            }}
            className="space-y-3 border-b border-line px-5 py-4"
          >
            <label className="block">
              <span className="label mb-1.5 block text-fog">{t("share.label")}</span>
              <input
                aria-label={t("share.label")}
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
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

              <div className="block">
                <span className="label mb-1.5 block text-fog">{t("share.allowDownloads")}</span>
                <button
                  type="button"
                  onClick={() => setAllowDownload((v) => !v)}
                  className="flex w-full items-center justify-between rounded-[12px] border border-line bg-ink px-3 py-2 text-left"
                >
                  <span className="text-[13px] text-chalk">{t("share.allowDownloads")}</span>
                  <span
                    className={cn(
                      "mono rounded-[6px] border px-2 py-0.5 text-[10px] uppercase tracking-widest",
                      allowDownload
                        ? "border-verified/40 bg-verified/10 text-verified"
                        : "border-line text-fog",
                    )}
                  >
                    {allowDownload ? t("share.on") : t("share.off")}
                  </span>
                </button>
              </div>
            </div>

            {error && <p className="mono text-[11px] text-alert">{error}</p>}

            <button
              type="submit"
              disabled={create.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-amber px-4 py-2.5 text-[13px] font-semibold text-on-amber hover:bg-amber-deep disabled:opacity-60"
            >
              {create.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {t("share.createLink")}
            </button>
          </form>

          <div className="px-5 py-4">
            <p className="label mb-2 flex items-center gap-1.5">
              <Link2 className="size-3.5" /> {t("share.title")}
            </p>
            {links.isLoading ? (
              <div className="h-16 animate-pulse rounded-[12px] bg-ink-3/50" />
            ) : mine.length === 0 ? (
              <p className="text-[12.5px] text-fog">{t("share.empty.title")}</p>
            ) : (
              <ul className="space-y-2">
                {mine.map((link) => {
                  const url = `${origin}/share/${link.token}`;
                  const expired =
                    link.expiresAt != null && new Date(link.expiresAt).getTime() < Date.now();
                  const dead = link.revoked || expired;
                  return (
                    <li
                      key={link.id}
                      className={cn("rounded-[12px] border border-line bg-ink p-3", dead && "opacity-60")}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-chalk">
                            {link.label}
                          </p>
                          <p className="mono text-[9.5px] uppercase tracking-widest text-fog">
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
                        <span className="mono inline-flex shrink-0 items-center gap-1 text-[9.5px] uppercase tracking-widest text-fog">
                          <Eye className="size-3" /> {t("share.viewsN", { n: link.views })}
                        </span>
                      </div>
                      {!dead && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <code className="mono min-w-0 flex-1 truncate rounded-[8px] border border-line bg-ink-2 px-2 py-1.5 text-[10.5px] text-sky">
                            {url}
                          </code>
                          <button
                            type="button"
                            onClick={() => copy(link.id, url)}
                            className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2 py-1.5 text-[11px] text-chalk hover:border-amber/60 hover:text-amber"
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
                            className="rounded-[8px] border border-line px-2 py-1.5 text-[11px] text-chalk hover:border-sky/60 hover:text-sky"
                          >
                            {t("share.open")}
                          </a>
                          <button
                            type="button"
                            aria-label={t("share.revoke")}
                            title={t("share.revoke")}
                            onClick={() => revoke.mutate({ id: link.id })}
                            className="rounded-[8px] border border-line p-1.5 text-fog hover:border-alert/50 hover:text-alert"
                          >
                            <ShieldOff className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
