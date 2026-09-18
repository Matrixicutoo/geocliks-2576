import { useEffect } from "react";

/**
 * A red dot on the browser tab's icon while something is waiting.
 *
 * The point is reach: somebody with GeoCliks open in a background tab, working in another site
 * all afternoon, sees nothing our header draws. The favicon is the only pixel we own that is
 * visible from outside the page, and a dot on it is the convention every messaging site uses,
 * so it needs no explaining.
 *
 * Drawn rather than shipped as a second .ico: the badge has to composite over the icon the tab
 * is already showing, and generating it in a canvas keeps one source of truth for the artwork.
 * The untouched href is remembered on the element itself, so a tab that catches up goes quietly
 * back to normal.
 */

const DOT = "#ef4444";
/** Size of the canvas we redraw the icon into — comfortably above any tab's render size. */
const SIZE = 64;
/** Dot radius as a share of the icon. Small enough that the logo still reads at 16px. */
const DOT_RADIUS = 0.2;

/**
 * The one link element that owns the tab icon while the badge is on: the PNG rel is what
 * browsers prefer, and rewriting only that one leaves the .ico fallback alone for anything
 * that ignores it.
 */
function iconLink() {
  return document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/png"]');
}

/**
 * The real icon's URL, remembered the first time we see it.
 *
 * Reading it back off the element is not an option once a badge is on — `href` by then is the
 * data URL we wrote, so restoring from it would pin the dot on forever.
 */
function baseHref(link: HTMLLinkElement) {
  const remembered = link.dataset.faviconBase;
  if (remembered) return remembered;
  const current = link.getAttribute("href");
  if (!current || current.startsWith("data:")) return null;
  link.dataset.faviconBase = current;
  return current;
}

export function useFaviconBadge(active: boolean) {
  useEffect(() => {
    const link = iconLink();
    if (!link) return;
    const source = baseHref(link);
    if (!source) return;

    if (!active) {
      if (link.href !== source) link.setAttribute("href", source);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, SIZE, SIZE);
      // Top-right, over a cut-out ring so the dot separates from the artwork underneath
      // whether that artwork is light, dark or busy.
      const r = SIZE * DOT_RADIUS;
      const cx = SIZE - r - 1;
      const cy = r + 1;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = DOT;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      try {
        link.setAttribute("href", canvas.toDataURL("image/png"));
      } catch {
        // A tainted canvas (an icon served from another origin) just means no badge.
      }
    };
    image.src = source;

    return () => {
      cancelled = true;
    };
  }, [active]);

  // Restore on unmount, so leaving the dashboard never leaves a stale dot behind.
  useEffect(() => {
    return () => {
      const link = iconLink();
      const base = link?.dataset.faviconBase;
      if (link && base) link.setAttribute("href", base);
    };
  }, []);
}
