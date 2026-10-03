import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ExternalLink, FileStack, Loader2, X } from "lucide-react";
import { useCreateReport } from "../queries/reports";
import { cn } from "../lib/utils";
import { type TKey, useT } from "../lib/i18n";

const FORMATS = ["pdf", "xlsx", "zip", "kmz"] as const;
type Format = (typeof FORMATS)[number];

/**
 * "Create report" for one saved before / after pair, as a popup on the card rather than a trip to
 * the Reports page. The two photos are sent in order — before, then after — with the before /
 * after layout, so the package is exactly this pair and reads the right way round.
 */
export function CompareReportDialog({
  pair,
  onClose,
}: {
  pair: {
    title: string;
    projectId: string | null;
    projectName?: string | null;
    beforeId: string | null;
    afterId: string | null;
  };
  onClose: () => void;
}) {
  const t = useT();
  const create = useCreateReport();
  const [title, setTitle] = useState(`${pair.title} — ${t("reports.layout.before_after")}`.slice(0, 120));
  const [format, setFormat] = useState<Format>("pdf");
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const photoIds = [pair.beforeId, pair.afterId].filter((v): v is string => Boolean(v));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        aria-label={t("common.close")}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
      />
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          setUrl(null);
          try {
            const report = await create.mutateAsync({
              title: title.trim() || pair.title,
              projectId: pair.projectId,
              format,
              layout: "before_after",
              photoIds,
            });
            if (report.url) {
              setUrl(report.url);
              window.open(report.url, "_blank");
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
        }}
        className="relative w-full max-w-md rounded-[12px] border border-line bg-ink-2"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3">
          <div className="min-w-0">
            <p className="font-display text-[15px] font-semibold">{t("compare.createReport")}</p>
            <p className="mono truncate text-[10.5px] uppercase tracking-widest text-fog">
              {pair.title}
              {pair.projectName ? ` · ${pair.projectName}` : ""}
            </p>
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

        <div className="space-y-4 px-5 py-4">
          <label className="block">
            <span className="label mb-1.5 block text-fog">{t("reports.titleField")}</span>
            <input
              aria-label={t("reports.titleField")}
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
            />
          </label>

          <div>
            <span className="label mb-1.5 block text-fog">{t("reports.format")}</span>
            <div className="grid grid-cols-4 gap-2">
              {FORMATS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormat(value)}
                  className={cn(
                    "mono rounded-[8px] border px-2 py-2 text-[11px] uppercase tracking-widest transition-colors",
                    format === value
                      ? "border-amber bg-amber/10 text-amber-ink"
                      : "border-line bg-ink text-fog hover:text-chalk",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-fog">
              {t(`reports.hint.${format}` as TKey)}
            </p>
          </div>

          {photoIds.length < 2 && (
            <p className="mono text-[11px] text-fog">{t("compare.reportOnePhoto")}</p>
          )}
          {error && <p className="mono text-[11px] text-alert">{error}</p>}
          {url && (
            <p className="flex flex-wrap items-center gap-3 text-[12.5px] text-verified">
              {t("compare.reportReady")}
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mono inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-sky hover:underline"
              >
                <ExternalLink className="size-3.5" /> {t("common.download")}
              </a>
              <Link
                to="/app/reports"
                className="mono text-[11px] uppercase tracking-widest text-fog hover:text-chalk"
              >
                {t("reports.generated")}
              </Link>
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button type="button" onClick={onClose} className="px-3 py-2 text-[13px] text-fog">
            {t("common.close")}
          </button>
          <button
            type="submit"
            disabled={create.isPending || photoIds.length === 0}
            className="inline-flex items-center gap-2 rounded-[8px] bg-amber px-4 py-2 text-[13px] font-semibold text-on-amber hover:bg-amber-deep disabled:opacity-60"
          >
            {create.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FileStack className="size-3.5" />
            )}
            {create.isPending ? t("reports.building") : t("reports.generate")}
          </button>
        </div>
      </form>
    </div>
  );
}
