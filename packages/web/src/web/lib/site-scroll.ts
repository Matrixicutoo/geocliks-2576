/**
 * Scrolling the site, wherever the scrolling currently lives.
 *
 * Normally the document scrolls. While the assistant panel holds a column beside the site, the
 * site's own column is the scroll container instead — so its scrollbar sits against the panel
 * rather than the window edge, and the panel never scrolls away with the page. Anything that
 * wants to move the site has to go through here, because `window.scrollTo` alone is a no-op in
 * the second case.
 */
export const SITE_SCROLL_ID = "site-scroll";

export function siteScroller(): HTMLElement | null {
  return document.getElementById(SITE_SCROLL_ID);
}

export function scrollSiteToTop() {
  // Both, unconditionally: whichever of the two is not the scroller is already at 0, so setting
  // it costs nothing and this needs no knowledge of which mode is live.
  siteScroller()?.scrollTo({ top: 0 });
  globalThis.scrollTo(0, 0);
}
