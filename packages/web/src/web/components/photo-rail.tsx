import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { EvidenceCard, type EvidencePhoto } from "./evidence-card";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";

/**
 * One sideways-scrolling row of evidence tiles with a chevron over each end — the slider shared
 * by the dashboard photo strip and the My captures page.
 *
 * Sideways scrolling is invisible on a desktop with a mouse: there is no trackpad flick and the
 * row has no scrollbar until you hover it, so a strip of 24 photos looked like a strip of 7.
 * A chevron sits over each end of the row, and each one hides when there is nothing further
 * that way — so an arrow pointing at blank space never appears.
 */
export function PhotoRail({
  photos,
  onOpen,
  hasMore,
  loadingMore,
  onLoadMore,
  tileClassName = "w-[196px]",
  arrowTop = 56,
  selectable = false,
  selected = [],
}: {
  photos: EvidencePhoto[];
  onOpen: (id: string) => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  /** Width of each tile. Wide enough that the tag and verified stamp sit side by side. */
  tileClassName?: string;
  /**
   * Distance from the top of the row to the chevrons' centre. Aim it at the middle of the
   * THUMBNAIL rather than the whole card — `top-1/2` put the arrows down on the caption text,
   * where they read as part of it. A 4:3 photo is 3/8 of the tile width from its top to its
   * middle.
   */
  arrowTop?: number;
  selectable?: boolean;
  selected?: string[];
}) {
  const t = useT();
  const rail = useRef<HTMLDivElement | null>(null);
  const [ends, setEnds] = useState({ start: false, end: false });
  /** Same fact as `!ends.start`, kept in a ref so an effect can read it without re-subscribing. */
  const atStart = useRef(true);

  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    // Sub-pixel widths and browser zoom leave a fraction of a pixel behind at either end, which
    // would keep an arrow lit with nowhere left to go.
    const slack = 8;
    atStart.current = el.scrollLeft <= slack;
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
  }, [measure, photos.length, hasMore]);

  /**
   * A capture that arrives while the page is open lands at the head of the row, and the browser's
   * scroll anchoring holds the tiles that were already on screen still — which pushes the newest
   * tile just past the left edge, the one tile the person watching wanted to see. So anchoring is
   * switched off while the row sits at its start (see the row's `overflowAnchor` below) and this
   * belt-and-braces reset catches anything that still drifts. Someone who HAS scrolled off down
   * the row keeps anchoring and keeps their place: yanking the row out from under them would be
   * worse than a tile they can reach with the chevron.
   */
  const newestId = photos[0]?.id ?? null;
  useEffect(() => {
    const el = rail.current;
    if (!el || !atStart.current || el.scrollLeft === 0) return;
    el.scrollLeft = 0;
  }, [newestId]);

  /** Just under a screenful, so the tile you were looking at stays on screen as an anchor. */
  const nudge = (direction: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.8, 160), behavior: "smooth" });
  };

  // At rest a light grey (`steel`) chevron on the card surface; on hover the whole dot fills
  // amber and the chevron flips to `on-amber` ink, which is what that token exists for - amber
  // is a light fill and will not carry light ink. `pointer-events-none` while hidden so a dead
  // button never eats a click on the photo underneath.
  const arrow =
    "absolute grid size-8 -translate-y-1/2 place-items-center rounded-full border border-line bg-ink-2/95 text-steel shadow-lg transition-[background-color,border-color,color,opacity] hover:border-amber hover:bg-amber hover:text-on-amber";

  return (
    <div className="relative">
      {/* `snap-x` makes a trackpad flick land on a tile edge rather than halfway through a
          photo. */}
      <div
        ref={rail}
        onScroll={measure}
        style={{ overflowAnchor: ends.start ? "auto" : "none" }}
        className="flex snap-x gap-3 overflow-x-auto pb-1"
      >
        {photos.map((photo) => (
          <EvidenceCard
            key={photo.id}
            photo={photo}
            selectable={selectable}
            selected={selected.includes(photo.id)}
            className={cn("shrink-0 snap-start rounded-[8px]", tileClassName)}
            onClick={() => onOpen(photo.id)}
          />
        ))}

        {hasMore && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="mono grid w-[110px] shrink-0 place-items-center rounded-[8px] border border-line text-[10.5px] uppercase tracking-widest text-fog transition-colors hover:border-amber hover:text-amber"
          >
            {loadingMore ? <Loader2 className="size-4 animate-spin" /> : t("feed.more")}
          </button>
        )}
      </div>

      <button
        type="button"
        aria-label={t("feed.scrollBack")}
        onClick={() => nudge(-1)}
        style={{ top: arrowTop }}
        className={cn(arrow, "left-0", ends.start ? "opacity-100" : "pointer-events-none opacity-0")}
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        aria-label={t("feed.scrollOn")}
        onClick={() => nudge(1)}
        style={{ top: arrowTop }}
        className={cn(arrow, "right-0", ends.end ? "opacity-100" : "pointer-events-none opacity-0")}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
