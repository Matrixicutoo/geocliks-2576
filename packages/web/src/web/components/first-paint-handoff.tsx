import { useLayoutEffect } from "react";

/**
 * Removes the static home-page shell (`lib/first-paint.ts`) the moment React has a page to show.
 *
 * A layout effect runs after React has written its DOM but before the browser paints it, so the
 * frame that first shows React's header and hero is the same frame the shell disappears in —
 * there is never a moment with both, or with neither.
 */
export function FirstPaintHandoff() {
  useLayoutEffect(() => {
    document.getElementById("first-paint")?.remove();
  }, []);
  return null;
}

/**
 * True while the static shell is on screen, read once when the bundle first runs. The hero uses
 * it to skip its rise-in animation on the load that takes over from the shell — the copy is
 * already visible there, and animating it from transparent would make it blink out and back.
 */
export const shellWasPainted = (): boolean =>
  typeof document !== "undefined" && document.getElementById("first-paint") !== null;
