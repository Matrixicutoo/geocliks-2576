import { useState } from "react";
import {
  Download,
  FileStack,
  FileSpreadsheet,
  FileText,
  Globe2,
  HardDriveDownload,
  Loader2,
  Package,
  Trash2,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
import { formatStamp } from "../components/evidence-card";
import {
  useCreateReport,
  useDownloadReport,
  useRemoveReport,
  useReports,
} from "../queries/reports";
import { useProjects } from "../queries/projects";
import { useDesktop } from "../hooks/use-desktop";
import { cn } from "../lib/utils";
import { type TKey, useT } from "../lib/i18n";

const FORMATS = [
  {
    id: "pdf" as const,
    label: "PDF",
    icon: FileText,
    hint: "reports.hint.pdf" as TKey,
  },
  {
    id: "xlsx" as const,
    label: "Excel",
    icon: FileSpreadsheet,
    hint: "reports.hint.xlsx" as TKey,
  },
  {
    id: "zip" as const,
    label: "ZIP",
    icon: Package,
    hint: "reports.hint.zip" as TKey,
  },
  {
    id: "kmz" as const,
    label: "KMZ",
    icon: Globe2,
    hint: "reports.hint.kmz" as TKey,
  },
];

const LAYOUTS = [
  { id: "grid" as const, label: "reports.layout.grid" as TKey },
  { id: "detailed" as const, label: "reports.layout.detailed" as TKey },
  { id: "before_after" as const, label: "reports.layout.before_after" as TKey },
  { id: "map" as const, label: "reports.layout.map" as TKey },
];

const TAG_LABELS: Record<string, TKey> = {
  general: "tag.work",
  before: "tag.before",
  after: "tag.after",
  issue: "tag.issue",
  arrival: "tag.arrival",
  departure: "tag.departure",
  pickup: "tag.pickup",
  delivery: "tag.delivery",
};

const TAGS = [
  "general",
  "before",
  "after",
  "issue",
  "arrival",
  "departure",
  "pickup",
  "delivery",
] as const;

function bytesLabel(bytes?: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AppReports() {
  const t = useT();
  const projects = useProjects();
  const reports = useReports();
  const create = useCreateReport();
  const download = useDownloadReport();
  const remove = useRemoveReport();
  const desktop = useDesktop();

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [format, setFormat] = useState<"pdf" | "xlsx" | "zip" | "kmz">("pdf");
  const [layout, setLayout] = useState<"grid" | "detailed" | "before_after" | "map">("grid");
  const [tag, setTag] = useState("");
  const [limit, setLimit] = useState(60);
  const [error, setError] = useState<string | null>(null);

  return (
    <DashboardShell
      title={t("reports.title")}
      subtitle={t("reports.subtitle")}
    >
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            try {
              const report = await create.mutateAsync({
                title,
                projectId: projectId || null,
                format,
                layout,
                tag: (tag || null) as (typeof TAGS)[number] | null,
                limit,
              });
              if (report.url) window.open(report.url, "_blank");
            } catch (err) {
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
          className="h-fit rounded-[12px] border border-line bg-ink-2"
        >
          <div className="border-b border-line px-4 py-3">
            <p className="font-display text-[15px] font-semibold">{t("reports.build")}</p>
          </div>

          <div className="space-y-4 p-4">
            <label className="block">
              <span className="label mb-1.5 block text-fog">{t("reports.titleField")}</span>
              <input
                aria-label={t("reports.titleField")}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ridgeline FTTH — Phase 2 closeout"
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              />
            </label>

            <label className="block">
              <span className="label mb-1.5 block text-fog">{t("common.project")}</span>
              <select
                aria-label={t("common.project")}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              >
                <option value="">{t("share.wholeWorkspace")}</option>
                {(projects.data ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="label mb-1.5 block text-fog">{t("reports.format")}</span>
              <div className="grid grid-cols-2 gap-2">
                {FORMATS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id)}
                    className={cn(
                      "rounded-[8px] border px-3 py-2.5 text-left transition-colors",
                      format === item.id
                        ? "border-amber bg-amber/10"
                        : "border-line bg-ink hover:border-fog/50",
                    )}
                  >
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-chalk">
                      <item.icon
                        className={cn("size-4", format === item.id ? "text-amber" : "text-fog")}
                      />
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11.5px] leading-relaxed text-fog">
                {t(FORMATS.find((f) => f.id === format)?.hint ?? "reports.hint.pdf")}
              </p>
            </div>

            <label className="block">
              <span className="label mb-1.5 block text-fog">{t("reports.layoutField")}</span>
              <select
                aria-label={t("reports.layoutField")}
                value={layout}
                onChange={(e) => setLayout(e.target.value as typeof layout)}
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              >
                {LAYOUTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {t(item.label)}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="label mb-1.5 block text-fog">{t("reports.onlyTag")}</span>
                <select
                  aria-label={t("reports.onlyTag")}
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
                >
                  <option value="">{t("reports.any")}</option>
                  {TAGS.map((item) => (
                    <option key={item} value={item}>
                      {t(TAG_LABELS[item] ?? "tag.work")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label mb-1.5 block text-fog">{t("reports.maxPhotos")}</span>
                <input
                  aria-label={t("reports.maxPhotos")}
                  type="number"
                  min={1}
                  max={300}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value) || 1)}
                  className="mono w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
                />
              </label>
            </div>

            {error && <p className="mono text-[11px] text-alert">{error}</p>}

            <button
              type="submit"
              disabled={create.isPending}
 className="rounded-[8px] inline-flex w-full items-center justify-center gap-2 bg-amber px-4 py-2.5 text-[13px] font-semibold text-ink disabled:opacity-60"
            >
              {create.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> {t("reports.building")}
                </>
              ) : (
                <>
                  <FileStack className="size-4" /> {t("reports.generate")}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="min-w-0">
          {reports.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-[12px] border border-line bg-ink-2" />
              ))}
            </div>
          ) : (reports.data ?? []).length === 0 ? (
            <EmptyState
              icon={FileStack}
              title={t("reports.empty.title")}
              hint={t("reports.empty.hint")}
            />
          ) : (
            <div className="rounded-[12px] border border-line bg-ink-2">
              <div className="border-b border-line px-4 py-3">
                <p className="label text-fog">{t("reports.generated")}</p>
              </div>
              <ul className="divide-y divide-line">
                {(reports.data ?? []).map((report) => {
                  const Icon = FORMATS.find((f) => f.id === report.format)?.icon ?? FileText;
                  return (
                    <li
                      key={report.id}
                      className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-3/40"
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-[12px] border border-line bg-ink text-amber">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-chalk">
                          {report.title}
                        </p>
                        <p className="mono text-[10px] uppercase tracking-widest text-fog">
                          {report.format} ·{" "}
                          {t(
                            (LAYOUTS.find((l) => l.id === report.layout)?.label ??
                              "reports.layout.grid") as TKey,
                          )}{" "}
                          · {t("projects.photosN", { n: report.photoCount })} ·{" "}
                          {bytesLabel(report.bytes)} · {formatStamp(report.createdAt)}
                        </p>
                        {report.projectName && (
                          <p className="truncate text-[11.5px] text-fog">{report.projectName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={download.isPending}
                          onClick={async () => {
                            const res = await download.mutateAsync({ id: report.id });
                            window.open(res.url, "_blank");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1.5 text-[11.5px] text-chalk transition-colors hover:border-amber/60 hover:text-amber disabled:opacity-60"
                        >
                          <Download className="size-3.5" /> {t("common.download")}
                        </button>
                        {desktop && (
                          <button
                            type="button"
                            disabled={download.isPending}
                            onClick={async () => {
                              const res = await download.mutateAsync({ id: report.id });
                              await desktop.savePackage(
                                res.url,
                                `${report.title.replace(/[^\w.-]+/g, "-")}.${report.format}`,
                              );
                            }}
                            className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1.5 text-[11.5px] text-chalk transition-colors hover:border-amber/60 hover:text-amber disabled:opacity-60"
                          >
                            <HardDriveDownload className="size-3.5" /> {t("reports.saveFolder")}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => remove.mutate({ id: report.id })}
                          aria-label={t("common.delete")}
                          className="rounded-[12px] border border-line p-1.5 text-fog transition-colors hover:border-alert/50 hover:text-alert"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
