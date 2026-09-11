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
}) {
  const { hasMore, loading, onLoadMore } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      // Start fetching before the sentinel is actually on screen so scrolling never stalls.
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return ref;
}
