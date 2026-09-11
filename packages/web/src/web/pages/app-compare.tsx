import { useCallback, useEffect, useMemo, useState } from "react";
import { GitCompareArrows, Loader2, Plus, Trash2, X } from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
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
import { useT } from "../lib/i18n";

/** Comparison pairs revealed per scroll batch. */
const PAGE = 6;

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
}: {
  side: string;
  photo: {
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
      <div className="relative aspect-[4/3] overflow-hidden border border-line bg-ink-3">
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
      </div>
      <figcaption className="mono mt-1.5 truncate text-[10px] tracking-widest text-amber">
        {photo.photoCode}
      </figcaption>
    </figure>
  );
}

export default function AppCompare() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const comparisons = useComparisons();
  const remove = useRemoveComparison();
  /** Every pair is two full photos, so the page reveals a few at a time as you scroll. */
  const [shown, setShown] = useState(PAGE);
  const all = comparisons.data ?? [];
  const visible = all.slice(0, shown);
  const showMore = useCallback(() => setShown((n) => n + PAGE), []);
  const sentinel = useInfiniteScroll({
    hasMore: shown < all.length,
    loading: comparisons.isLoading,
    onLoadMore: showMore,
  });
  // Deleting a pair shrinks the list under what is already revealed; start the batches over.
  useEffect(() => setShown(PAGE), [all.length]);

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
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-[12px] border border-line bg-ink-2" />
          ))}
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
        <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(560px,1fr))]">
          {visible.map((row) => (
            <article key={row.id} className="rounded-[12px] border border-line bg-ink-2">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-[15px] font-semibold text-chalk">
                    {row.title}
                  </p>
                  <p className="mono text-[10px] uppercase tracking-widest text-fog">
                    {row.projectName ?? t("compare.noProject")} ·{" "}
                    {t("compare.created", { stamp: formatStamp(row.createdAt) })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove.mutate({ id: row.id })}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1.5 text-[11px] text-fog transition-colors hover:border-alert/50 hover:text-alert"
                >
                  <Trash2 className="size-3.5" /> {t("compare.remove")}
                </button>
              </header>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <Slab side={t("tag.before")} photo={row.before} />
                <Slab side={t("tag.after")} photo={row.after} />
              </div>
            </article>
          ))}
          {/* Scrolling near this reveals the next batch of pairs. */}
          <div ref={sentinel} className="col-span-full h-px" />
          {shown < all.length && (
            <div className="mono col-span-full flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-fog">
              <Loader2 className="size-3.5 animate-spin" /> {t("common.loading")}
            </div>
          )}
        </div>
      )}

      {open && <NewComparisonDialog onClose={() => setOpen(false)} />}
    </DashboardShell>
  );
}
