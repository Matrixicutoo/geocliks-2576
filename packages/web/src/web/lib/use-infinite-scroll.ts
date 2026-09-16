import { useEffect, useRef } from "react";

/**
 * Attach the returned ref to a sentinel element under a list: the next page is asked for once
 * that sentinel scrolls near the viewport. Big evidence grids used to render every row at once,
 * which meant a workspace with hundreds of photos pulled hundreds of images on first paint.
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(options: {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  /**
   * The scrolling element the sentinel lives in, when the list scrolls inside its own panel
   * rather than with the page. Left out, the viewport is watched.
   */
  root?: HTMLElement | null;
}) {
  const { hasMore, loading, onLoadMore, root } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      // Start fetching before the sentinel is actually on screen so scrolling never stalls.
      // A panel that scrolls on its own is shorter than the page, so it gets a smaller margin
      // than the viewport does — 600px inside a 600px box would just load everything at once.
      { root: root ?? null, rootMargin: root ? "300px 0px" : "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore, root]);

  return ref;
}
