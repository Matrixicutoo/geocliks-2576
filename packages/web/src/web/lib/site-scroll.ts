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

/** The marketing header is sticky, so a section jumped to has to clear its height. */
const HEADER_PX = 64;

/**
 * Jump to a section by id, in whichever of the two scrollers is live. Returns false when no
 * element with that id is on the page yet, so a caller can wait for it and try again.
 *
 * This exists because the browser's own fragment jump happens before the page's JS has painted
 * the sections: arriving at `/#delivery` from another route lands at the top of the home page
 * with nothing to scroll to.
 */
export function scrollSiteToId(id: string): boolean {
  const element = document.getElementById(id);
  if (!element) return false;
  const column = siteScroller();
  const box = element.getBoundingClientRect();
  if (column && column.scrollHeight - column.clientHeight > 1) {
    const top = box.top - column.getBoundingClientRect().top + column.scrollTop - HEADER_PX;
    column.scrollTo({ top: Math.max(0, top) });
    return true;
  }
  globalThis.scrollTo({ top: Math.max(0, box.top + globalThis.scrollY - HEADER_PX) });
  return true;
}

export function scrollSiteToTop() {
  // Both, unconditionally: whichever of the two is not the scroller is already at 0, so setting
  // it costs nothing and this needs no knowledge of which mode is live.
  siteScroller()?.scrollTo({ top: 0 });
  globalThis.scrollTo(0, 0);
}
