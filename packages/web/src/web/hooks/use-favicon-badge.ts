import { useEffect } from "react";

/**
 * A red dot on the browser tab's icon while something is waiting.
 *
 * The point is reach: somebody with GeoCliks open in a background tab, working in another site
 * all afternoon, sees nothing our header draws. The favicon is the only pixel we own that is
 * visible from outside the page, and a dot on it is the convention every messaging site uses,
 * so it needs no explaining.
 *
 * Two things this has to get right, both learned the hard way:
 *
 *  - The page declares more than one icon (a .ico with `sizes="any"`, and this PNG). Rewriting
 *    only the PNG left the browser free to keep painting the .ico, so the dot never appeared
 *    in the tab. The originals are therefore pulled out of the head while the badge is up, and
 *    put back when it comes down.
 *  - Mutating `href` on a link the browser has already fetched is not reliably noticed. A
 *    brand-new element is, so each repaint appends a fresh one.
 */

const DOT = "#ef4444";
/** Size of the canvas we redraw the icon into — comfortably above any tab's render size. */
const SIZE = 64;
/** Dot radius as a share of the icon. Small enough that the logo still reads at 16px. */
const DOT_RADIUS = 0.2;
const BADGE_ID = "geocliks-favicon-badge";

/** The page's own icon links, and the artwork to badge — captured before we disturb anything. */
let originals: HTMLLinkElement[] = [];
let source: string | null = null;

function capture() {
  if (source) return;
  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
  ).filter((link) => link.id !== BADGE_ID);
  if (links.length === 0) return;
  originals = links;
  // Prefer the PNG: a canvas can read it, and .ico decoding is not universal.
  const png = links.find((link) => link.type === "image/png" || /\.png($|\?)/.test(link.href));
  source = (png ?? links[0]!).href;
}

/** Puts the page's declared icons back and drops the badge. */
function restore() {
  document.getElementById(BADGE_ID)?.remove();
  for (const link of originals) {
    if (!link.isConnected) document.head.appendChild(link);
  }
}

function paint(dataUrl: string) {
  // Out with the page's own icons first, or the browser may go on painting the .ico.
  for (const link of originals) link.remove();
  document.getElementById(BADGE_ID)?.remove();
  const link = document.createElement("link");
  link.id = BADGE_ID;
  link.rel = "icon";
  link.type = "image/png";
  link.href = dataUrl;
  document.head.appendChild(link);
}

export function useFaviconBadge(active: boolean) {
  useEffect(() => {
    capture();
    if (!source) return;
    if (!active) {
      restore();
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
        paint(canvas.toDataURL("image/png"));
      } catch {
        // A tainted canvas (an icon served from another origin) just means no badge.
      }
    };
    image.src = source;

    return () => {
      cancelled = true;
    };
  }, [active]);

  // Leaving the dashboard should never leave a stale dot behind.
  useEffect(() => restore, []);
}
