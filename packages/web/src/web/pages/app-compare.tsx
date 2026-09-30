import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileStack,
  GitCompareArrows,
  Link2,
  Loader2,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
import { PhotoDrawer } from "../components/photo-drawer";
import { CompareReportDialog } from "../components/compare-report-dialog";
import { ShareProjectDialog } from "../components/share-project-dialog";
import { EvidenceMap, type MapPin as EvidenceMapPin } from "../components/evidence-map";
import { formatCoords, formatStamp, VerifiedBadge } from "../components/evidence-card";
import {
  useComparisons,
  useCreateComparison,
  useInfinitePhotos,
  useRemoveComparison,
} from "../queries/photos";
import { useProjects } from "../queries/projects";
import { cn } from "../lib/utils";
import { useInfiniteScroll } from "../lib/use-infinite-scroll";
import { type TKey, useT } from "../lib/i18n";

type PickerPhoto = {
  id: string;
  url: string;
  photoCode: string;
  capturedAt: Date | number;
  tag?: string | null;
  address?: string | null;
};

function PhotoPicker({
  photos,
  value,
  onPick,
  label,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
}: {
  photos: PickerPhoto[];
  value: string | null;
  onPick: (id: string) => void;
  label: string;
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  const t = useT();
  const sentinel = useInfiniteScroll({ hasMore, loading: loadingMore, onLoadMore });
  return (
    <div className="min-w-0">
      <p className="label mb-2 text-fog">{label}</p>
      <div className="h-[260px] overflow-y-auto rounded-[12px] border border-line bg-ink p-2">
        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse bg-ink-3" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <p className="p-4 text-center text-[12px] text-fog">{t("compare.noPhotos")}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => onPick(photo.id)}
                className={cn(
                  "relative aspect-[4/3] overflow-hidden border transition-colors",
                  value === photo.id
                    ? "border-amber ring-1 ring-amber/50"
                    : "border-line hover:border-fog/60",
                )}
              >
                <img
                  src={photo.url}
                  alt={photo.photoCode}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="mono absolute inset-x-0 bottom-0 truncate bg-black/70 px-1 py-0.5 text-[8.5px] text-white">
                  {formatStamp(photo.capturedAt)}
                </span>
              </button>
            ))}
            {/* Scrolling this box to the bottom pulls the next page of photos. */}
            <div ref={sentinel} className="col-span-full h-px" />
            {loadingMore && (
              <div className="col-span-full flex items-center justify-center py-2 text-fog">
                <Loader2 className="size-3.5 animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NewComparisonDialog({ onClose }: { onClose: () => void }) {
  const t = useT();
  const projects = useProjects();
  const [projectId, setProjectId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [before, setBefore] = useState<string | null>(null);
  const [after, setAfter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateComparison();

  const pool = useInfinitePhotos({ projectId: projectId || null }, 48);
  const all = useMemo(
    () => (pool.data?.pages.flatMap((page) => page.photos) ?? []) as PickerPhoto[],
    [pool.data],
  );
  const beforePool = useMemo(
    () => all.filter((p) => p.tag !== "after"),
    [all],
  );
  const afterPool = useMemo(() => all.filter((p) => p.tag !== "before"), [all]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
          if (!before || !after) {
            setError(t("compare.pickError"));
            return;
          }
          try {
            await create.mutateAsync({
              title,
              projectId: projectId || null,
              beforePhotoId: before,
              afterPhotoId: after,
            });
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
          }
        }}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[12px] border border-line bg-ink-2"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <p className="font-display text-[15px] font-semibold">{t("compare.dialogTitle")}</p>
          <button type="button" onClick={onClose} className="text-fog hover:text-chalk">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label mb-1.5 block text-fog">{t("compare.titleField")}</span>
              <input
                aria-label={t("compare.titleField")}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Unit 4B — kitchen turnover"
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              />
            </label>
            <label className="block">
              <span className="label mb-1.5 block text-fog">{t("common.project")}</span>
              <select
                aria-label={t("common.project")}
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setBefore(null);
                  setAfter(null);
                }}
                className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
              >
                <option value="">{t("common.allProjects")}</option>
                {(projects.data ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <PhotoPicker
              label={t("tag.before")}
              photos={beforePool}
              value={before}
              onPick={setBefore}
              loading={pool.isLoading}
              hasMore={Boolean(pool.hasNextPage)}
              loadingMore={pool.isFetchingNextPage}
              onLoadMore={pool.fetchNextPage}
            />
            <PhotoPicker
              label={t("tag.after")}
              photos={afterPool}
              value={after}
              onPick={setAfter}
              loading={pool.isLoading}
              hasMore={Boolean(pool.hasNextPage)}
              loadingMore={pool.isFetchingNextPage}
              onLoadMore={pool.fetchNextPage}
            />
          </div>

          {error && <p className="mono text-[11px] text-alert">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button type="button" onClick={onClose} className="px-3 py-2 text-[13px] text-fog">
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={create.isPending}
 className="rounded-[8px] inline-flex items-center gap-2 bg-amber px-4 py-2 text-[13px] font-semibold text-ink disabled:opacity-60"
          >
            {create.isPending && <Loader2 className="size-3.5 animate-spin" />}
            {t("compare.savePair")}
          </button>
        </div>
      </form>
    </div>
  );
}

function Slab({
  side,
  photo,
  onOpen,
}: {
  side: string;
  onOpen: (id: string) => void;
  photo: {
    id: string;
    url: string;
    photoCode: string;
    capturedAt: Date | number;
    lat?: number | null;
    lng?: number | null;
    address?: string | null;
    integrity?: string | null;
  } | null;
}) {
  const t = useT();
  if (!photo) {
    return (
      <div className="grid aspect-[4/3] place-items-center border border-line bg-ink text-[12px] text-fog">
        {t("compare.photoRemoved")}
      </div>
    );
  }
  return (
    <figure className="min-w-0">
      {/* The tile opens the same evidence drawer as Teamspace, with the full stamp detail. */}
      <button
        type="button"
        onClick={() => onOpen(photo.id)}
        aria-label={photo.photoCode}
        className="relative block aspect-[4/3] w-full overflow-hidden border border-line bg-ink-3 text-left transition-colors hover:border-amber/60"
      >
        <img
          src={photo.url}
          alt={photo.photoCode}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span className="rounded-[6px] mono absolute left-2 top-2 border border-white/25 bg-black/65 px-1.5 py-0.5 text-[9.5px] uppercase tracking-widest text-white">
          {side}
        </span>
        <span className="absolute right-2 top-2">
          <VerifiedBadge integrity={photo.integrity} />
        </span>
        <div className="absolute inset-x-0 bottom-0 flex items-stretch bg-black/70">
          <div className="w-[3px] bg-amber" />
          <div className="min-w-0 px-2 py-1.5">
            <p className="mono text-[10.5px] font-semibold text-white">
              {formatStamp(photo.capturedAt)}
            </p>
            <p className="mono truncate text-[9px] text-white/70">
              {formatCoords(photo.lat, photo.lng)}
            </p>
          </div>
        </div>
      </button>
      <figcaption className="mono mt-1.5 truncate text-[10px] tracking-widest text-amber">
        {photo.photoCode}
      </figcaption>
    </figure>
  );
}

export default function AppCompare() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  const comparisons = useComparisons();
  const remove = useRemoveComparison();
  const [projectId, setProjectId] = useState("");
  const [search, setSearch] = useState("");
  const [reportFor, setReportFor] = useState<string | null>(null);
  const [shareProject, setShareProject] = useState<string | null>(null);

  // Memoised so an empty result is the same array every render, not a fresh `[]` that would
  // re-run every memo below it.
  const all = useMemo(() => comparisons.data ?? [], [comparisons.data]);

  /** The picker only lists jobs that actually have a pair, so no choice ever leads nowhere. */
  const projectOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of all) {
      if (row.projectId && row.projectName) seen.set(row.projectId, row.projectName);
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [all]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return all.filter((row) => {
      if (projectId && row.projectId !== projectId) return false;
      if (!needle) return true;
      return `${row.title} ${row.projectName ?? ""}`.toLowerCase().includes(needle);
    });
  }, [all, projectId, search]);

  /**
   * Every photo in the pairs on screen, once each, for the map. A pin opens the same drawer a
   * tile does, so the map is a way into the evidence rather than a picture of it.
   */
  const pins = useMemo(() => {
    const byId = new Map<string, EvidenceMapPin>();
    for (const row of rows) {
      for (const photo of [row.before, row.after]) {
        if (photo && !byId.has(photo.id)) byId.set(photo.id, photo as unknown as EvidenceMapPin);
      }
    }
    return [...byId.values()];
  }, [rows]);

  /** The numbers follow the filters, so they always describe the pairs on screen. */
  const stats = useMemo(() => {
    const projects = new Set(rows.map((row) => row.projectId).filter(Boolean));
    const latest = rows.reduce<number | null>((max, row) => {
      const at = new Date(row.createdAt).getTime();
      return max == null || at > max ? at : max;
    }, null);
    return {
      pairs: rows.length,
      projects: projects.size,
      photos: pins.length,
      latest: latest == null ? "—" : formatStamp(latest).slice(0, 17),
    };
  }, [rows, pins]);

  /**
   * The same sideways rail as the Teamspace photo strip: one row, chevrons over each end that
   * hide when there is nothing further that way, since a mouse gives no hint the row scrolls.
   */
  const rail = useRef<HTMLDivElement | null>(null);
  const [ends, setEnds] = useState({ start: false, end: false });
  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const slack = 8;
    setEnds({
      start: el.scrollLeft > slack,
      end: el.scrollLeft + el.clientWidth < el.scrollWidth - slack,
    });
  }, []);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [measure, rows.length]);
  const nudge = (direction: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.8, 240), behavior: "smooth" });
  };

  const reportPair = reportFor ? (all.find((row) => row.id === reportFor) ?? null) : null;

  const chevron =
    "absolute top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-ink-2/95 text-steel shadow-lg transition-[background-color,border-color,color,opacity] hover:border-amber hover:bg-amber hover:text-on-amber";

  return (
    <DashboardShell
      title={t("compare.title")}
      subtitle={t("compare.subtitle")}
      actions={
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-[8px] inline-flex items-center gap-2 bg-amber px-3.5 py-2 text-[13px] font-semibold text-ink"
        >
          <Plus className="size-4" /> {t("compare.newPair")}
        </button>
      }
    >
      {comparisons.isLoading ? (
        <div className="space-y-4">
          <div className="h-72 animate-pulse rounded-[12px] border border-line bg-ink-2" />
          <div className="h-80 animate-pulse rounded-[12px] border border-line bg-ink-2" />
        </div>
      ) : all.length === 0 ? (
        <EmptyState
          icon={GitCompareArrows}
          title={t("compare.empty.title")}
          hint={t("compare.empty.hint")}
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-[8px] bg-amber px-4 py-2 text-[13px] font-semibold text-ink"
            >
              {t("compare.createFirst")}
            </button>
          }
        />
      ) : (
        <>
          {/* The pairs, in one sideways slider across the top of the page. */}
          <section className="rounded-[12px] border border-line bg-ink-2">
            <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
              <p className="font-display mr-1 text-[15px] font-semibold">
                {t("compare.pairsCount", { n: rows.length })}
              </p>
              {projectOptions.length > 0 && (
                <select
                  aria-label={t("common.project")}
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="mono rounded-[8px] border border-line bg-ink px-2 py-1 text-[10px] uppercase tracking-widest text-chalk outline-none focus:border-amber"
                >
                  <option value="">{t("common.allProjects")}</option>
                  {projectOptions.map(([value, name]) => (
                    <option key={value} value={value}>
                      {name}
                    </option>
                  ))}
                </select>
              )}
              <label className="ml-auto flex items-center gap-2 rounded-[12px] border border-line bg-ink px-2.5 py-1">
                <Search className="size-3.5 text-fog" />
                <input
                  aria-label={t("compare.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("compare.search")}
                  className="mono w-44 bg-transparent text-[11px] text-chalk outline-none placeholder:text-fog/60"
                />
              </label>
            </header>

            <div className="p-4">
              {rows.length === 0 ? (
                <p className="py-10 text-center text-[13px] text-fog">{t("compare.noMatch")}</p>
              ) : (
                <div className="relative">
                  <div
                    ref={rail}
                    onScroll={measure}
                    className="flex snap-x gap-4 overflow-x-auto pb-1"
                  >
                    {rows.map((row) => (
                      <article
                        key={row.id}
                        className="w-[min(100%,560px)] shrink-0 snap-start rounded-[10px] border border-line bg-ink"
                      >
                        <header className="flex items-start justify-between gap-2 border-b border-line px-3 py-2.5">
                          <div className="min-w-0">
                            <p className="truncate font-display text-[14px] font-semibold text-chalk">
                              {row.title}
                            </p>
                            <p className="mono truncate text-[9.5px] uppercase tracking-widest text-fog">
                              {row.projectName ?? t("compare.noProject")} ·{" "}
                              {t("compare.created", { stamp: formatStamp(row.createdAt) })}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setReportFor(row.id)}
                            className="mono inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2 py-1.5 text-[10px] uppercase tracking-widest text-chalk transition-colors hover:border-amber hover:text-amber"
                          >
                            <FileStack className="size-3.5" /> {t("compare.createReport")}
                          </button>
                          {/* A client link is for one job, so a pair outside a project has none. */}
                          <button
                            type="button"
                            aria-label={t("project.shareClient")}
                            title={row.projectId ? t("project.shareClient") : t("compare.shareNoProject")}
                            disabled={!row.projectId}
                            onClick={() => row.projectId && setShareProject(row.projectId)}
                            className="mono inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2 py-1.5 text-[10px] uppercase tracking-widest text-chalk transition-colors hover:border-amber hover:text-amber disabled:pointer-events-none disabled:opacity-40"
                          >
                            <Link2 className="size-3.5" /> {t("compare.share")}
                          </button>
                          <button
                            type="button"
                            aria-label={t("compare.remove")}
                            title={t("compare.remove")}
                            disabled={remove.isPending}
                            onClick={() => remove.mutate({ id: row.id })}
                            className="shrink-0 rounded-[8px] border border-line p-1.5 text-fog transition-colors hover:border-alert/50 hover:text-alert disabled:opacity-40"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                          </div>
                        </header>
                        <div className="grid grid-cols-2 gap-3 p-3">
                          <Slab side={t("tag.before")} photo={row.before} onOpen={setOpenPhoto} />
                          <Slab side={t("tag.after")} photo={row.after} onOpen={setOpenPhoto} />
                        </div>
                      </article>
                    ))}
                  </div>
                  <button
                    type="button"
                    aria-label={t("compare.scrollBack")}
                    onClick={() => nudge(-1)}
                    className={cn(
                      chevron,
                      "left-1",
                      ends.start ? "opacity-100" : "pointer-events-none opacity-0",
                    )}
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={t("compare.scrollOn")}
                    onClick={() => nudge(1)}
                    className={cn(
                      chevron,
                      "right-1",
                      ends.end ? "opacity-100" : "pointer-events-none opacity-0",
                    )}
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Where every photo in those pairs was taken, at the width of the page. */}
          <section className="mt-4 rounded-[12px] border border-line bg-ink-2">
            <header className="border-b border-line px-4 py-3">
              <p className="label flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {t("compare.mapTitle")}
              </p>
            </header>
            <div className="p-4">
              <EvidenceMap
                pins={pins}
                onSelect={setOpenPhoto}
                className="h-[420px] lg:h-[520px]"
              />
            </div>
          </section>

          {/* The numbers close the page, for the pairs the filters leave on screen. */}
          <div className="mt-4 grid gap-px overflow-hidden rounded-[12px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["compare.statPairs", String(stats.pairs)],
                ["compare.statProjects", String(stats.projects)],
                ["compare.statPhotos", String(stats.photos)],
                ["compare.statLatest", stats.latest],
              ] as [TKey, string][]
            ).map(([label, value]) => (
              <div key={label} className="bg-ink-2 px-4 py-3">
                <p className="label">{t(label)}</p>
                <p className="mono mt-1 text-[15px] text-chalk">{value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {open && <NewComparisonDialog onClose={() => setOpen(false)} />}
      {reportPair && (
        <CompareReportDialog
          key={reportPair.id}
          pair={{
            title: reportPair.title,
            projectId: reportPair.projectId,
            projectName: reportPair.projectName,
            beforeId: reportPair.before?.id ?? null,
            afterId: reportPair.after?.id ?? null,
          }}
          onClose={() => setReportFor(null)}
        />
      )}
      {shareProject && (
        <ShareProjectDialog
          projectId={shareProject}
          projectName={projectOptions.find(([value]) => value === shareProject)?.[1] ?? null}
          onClose={() => setShareProject(null)}
        />
      )}
      <PhotoDrawer photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
    </DashboardShell>
  );
}
