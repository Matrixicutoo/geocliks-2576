import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Loader2, Search, Trash2 } from "lucide-react";
import { EvidenceCard } from "./evidence-card";
import { PhotoDrawer } from "./photo-drawer";
import { useInfinitePhotos, useRemovePhotos } from "../queries/photos";
import { useProjects } from "../queries/projects";
import { useOrg } from "../queries/orgs";
import { canManageWorkspace } from "../lib/roles";
import { cn } from "../lib/utils";
import { useT, type TKey } from "../lib/i18n";

/**
 * Live photo feed — the strip across the top of both dashboards.
 *
 * The same filters the full grid has (tag chips, project, search) sitting over ONE row that
 * scrolls sideways instead of a page-filling grid. That is the point: the newest work should be
 * glanceable above the day's real lists, not the thing you scroll past to reach them. Clicking
 * a tile opens the same photo drawer the grid uses.
 *
 * The delivery side passes its own tag set — a dispatcher cares about pickups and drops, not
 * before-and-after job shots.
 */

const FIELD_TAGS = ["all", "arrival", "before", "general", "after", "issue", "departure"] as const;
const DELIVERY_TAGS = ["all", "arrival", "pickup", "delivery", "issue", "departure"] as const;

const TAG_LABELS: Record<string, TKey> = {
  all: "tag.all",
  arrival: "tag.arrival",
  before: "tag.before",
  general: "tag.work",
  after: "tag.after",
  issue: "tag.issue",
  departure: "tag.departure",
  pickup: "tag.pickup",
  delivery: "tag.delivery",
};

/** Every tag either board can filter by, minus the "all" pseudo-tag the chips add. */
type PhotoTag = Exclude<
  (typeof FIELD_TAGS)[number] | (typeof DELIVERY_TAGS)[number],
  "all"
>;

export function PhotoStrip({ board }: { board: "field" | "delivery" }) {
  const t = useT();
  const tags = board === "delivery" ? DELIVERY_TAGS : FIELD_TAGS;
  const [tag, setTag] = useState<PhotoTag | "all">("all");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  // Removing evidence used to live on the old full-page grid. It moves here with it: field
  // crews capture, manager and above are the only ones who can delete.
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const org = useOrg();
  const canDelete = canManageWorkspace(org.data?.role);
  const removeMany = useRemovePhotos();

  // Only the field board has a project picker, and a driver is not allowed to list projects at
  // all — so the delivery strip must not fire the request.
  const projects = useProjects(undefined, { enabled: board === "field" });
  // One page is plenty for a strip — 24 tiles is already more sideways scrolling than anyone
  // does. The full grid is where you go to page through everything.
  const photos = useInfinitePhotos(
    {
      tag: tag === "all" ? null : tag,
      projectId,
      search: search.trim() ? search.trim() : null,
    },
    24,
  );
  const loaded = photos.data?.pages.flatMap((page) => page.photos) ?? [];

  /**
   * Sideways scrolling is invisible on a desktop with a mouse: there is no trackpad flick and the
   * row has no scrollbar until you hover it, so a strip of 24 photos looked like a strip of 7.
   * A chevron sits over each end of the row, and each one hides when there is nothing further
   * that way — so an arrow pointing at blank space never appears.
   */
  const rail = useRef<HTMLDivElement | null>(null);
  const [ends, setEnds] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    // Sub-pixel widths and browser zoom leave a fraction of a pixel behind at either end, which
    // would keep an arrow lit with nowhere left to go.
    const slack = 8;
    setEnds({
      start: el.scrollLeft > slack,
      end: el.scrollLeft + el.clientWidth < el.scrollWidth - slack,
    });
  }, []);

  /**
   * Re-measure when the row itself changes, not just when it is scrolled: filtering, loading
   * another page or resizing the window all change whether there is more to reach.
   */
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [measure, loaded.length]);

  /** Just under a screenful, so the tile you were looking at stays on screen as an anchor. */
  const nudge = (direction: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.8, 160), behavior: "smooth" });
  };

  return (
    <section className="rounded-[12px] border border-line bg-ink-2">
      <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <p className="font-display mr-1 text-[15px] font-semibold">{t("feed.title")}</p>

        {tags.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTag(value)}
            className={cn(
              "mono rounded-[6px] border px-2.5 py-1 text-[10px] uppercase tracking-widest transition-colors",
              tag === value
                ? "border-amber/60 bg-amber/10 text-amber"
                : "border-line text-fog hover:text-chalk",
            )}
          >
            {t(TAG_LABELS[value])}
          </button>
        ))}

        {/* The field side files photos under projects; the delivery side files them under runs,
            so the project picker would always be empty there. */}
        {board === "field" && (projects.data?.length ?? 0) > 0 && (
          <select
            aria-label={t("teamspace.projectFilter")}
            value={projectId ?? ""}
            onChange={(e) => setProjectId(e.target.value || null)}
            className="mono rounded-[8px] border border-line bg-ink px-2 py-1 text-[10px] uppercase tracking-widest text-chalk outline-none focus:border-amber"
          >
            <option value="">{t("common.allProjects")}</option>
            {projects.data?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        )}

        <label className="ml-auto flex items-center gap-2 rounded-[12px] border border-line bg-ink px-2.5 py-1">
          <Search className="size-3.5 text-fog" />
          <input
            aria-label={t("teamspace.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("teamspace.searchPlaceholder")}
            className="mono w-40 bg-transparent text-[11px] text-chalk outline-none placeholder:text-fog/60"
          />
        </label>

        {canDelete && selectMode && selected.length > 0 && (
          <button
            type="button"
            disabled={removeMany.isPending}
            onClick={() => {
              removeMany.mutate({ ids: selected }, { onSuccess: () => setSelected([]) });
            }}
            className="mono inline-flex items-center gap-1.5 rounded-[8px] border border-alert/60 bg-alert/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-alert hover:bg-alert/20 disabled:opacity-60"
          >
            {removeMany.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
            {t("teamspace.selectedN", { n: selected.length })}
          </button>
        )}

        {canDelete && (
          <button
            type="button"
            onClick={() => {
              setSelectMode((v) => !v);
              setSelected([]);
            }}
            className="mono rounded-[8px] border border-line px-2.5 py-1 text-[10px] uppercase tracking-widest text-fog hover:text-chalk"
          >
            {selectMode ? t("teamspace.clearSelection") : t("teamspace.select")}
          </button>
        )}
      </header>

      <div className="p-4">
        {photos.isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="size-[104px] shrink-0 animate-pulse rounded-[8px] bg-ink-3" />
            ))}
          </div>
        ) : loaded.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-center">
            <ImageOff className="size-4 text-fog/60" />
            <p className="text-[13px] text-fog">{t("feed.empty")}</p>
          </div>
        ) : (
          // One row, scrolled sideways. `snap-x` makes a trackpad flick land on a tile edge
          // rather than halfway through a photo. The wrapper is the positioning context for the
          // two chevrons, which float over the row rather than taking width from it.
          <div className="relative">
            <div ref={rail} onScroll={measure} className="flex snap-x gap-3 overflow-x-auto pb-1">
              {loaded.map((photo) => (
                <EvidenceCard
                  key={photo.id}
                  photo={photo}
                  shareable={!selectMode}
                  selectable={selectMode}
                  selected={selected.includes(photo.id)}
                  className="w-[150px] shrink-0 snap-start rounded-[8px]"
                  onClick={() => {
                    if (!selectMode) {
                      setOpenPhoto(photo.id);
                      return;
                    }
                    setSelected((prev) =>
                      prev.includes(photo.id)
                        ? prev.filter((x) => x !== photo.id)
                        : [...prev, photo.id],
                    );
                  }}
                />
              ))}

              {photos.hasNextPage && (
                <button
                  type="button"
                  onClick={() => photos.fetchNextPage()}
                  disabled={photos.isFetchingNextPage}
                  className="mono grid w-[110px] shrink-0 place-items-center rounded-[8px] border border-line text-[10.5px] uppercase tracking-widest text-fog transition-colors hover:border-amber hover:text-amber"
                >
                  {photos.isFetchingNextPage ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t("feed.more")
                  )}
                </button>
              )}
            </div>

            {/* Centred on the THUMBNAIL, not on the row: a card is its 4:3 photo (150px wide, so
                112px tall) plus three lines of caption under it, and `top-1/2` put both arrows
                down on the photo code where they read as part of the text. They are
                `pointer-events-none` while hidden so a dead button never eats a click on the
                photo underneath. */}
            <button
              type="button"
              aria-label={t("feed.scrollBack")}
              onClick={() => nudge(-1)}
              className={cn(
                "absolute left-0 top-[56px] grid size-8 -translate-y-1/2 place-items-center rounded-full border border-line bg-ink-2/95 text-fog shadow-lg transition-opacity hover:border-amber hover:text-amber",
                ends.start ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label={t("feed.scrollOn")}
              onClick={() => nudge(1)}
              className={cn(
                "absolute right-0 top-[56px] grid size-8 -translate-y-1/2 place-items-center rounded-full border border-line bg-ink-2/95 text-fog shadow-lg transition-opacity hover:border-amber hover:text-amber",
                ends.end ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      <PhotoDrawer photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
    </section>
  );
}
