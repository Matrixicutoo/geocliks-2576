import { useEffect } from "react";
import { useLocation } from "wouter";
import { useRobots } from "../lib/seo";
import { isPrivatePath } from "../lib/seo-routes";

/**
 * Applies `noindex` to the private half of the site, and clears structured data
 * left over from a previous page, both from one place.
 *
 * Mounted once beside the router rather than called in each of the twenty-odd
 * workspace and admin pages: those pages are added and moved often, and a rule
 * that lives in a list of paths cannot be forgotten in a new file the way a
 * per-page hook call can. It writes only the robots tag, so the titles those
 * pages set for themselves are left untouched.
 *
 * The path list itself lives in `seo-routes.ts`, next to the per-route copy, so
 * that this hook and the server-side injection in `seo-html.ts` cannot disagree
 * about which URLs are private.
 *
 * `follow` stays on — these pages link back to the public site, and there is no
 * reason to throw that away.
 */
export function RouteSeo() {
  const [pathname] = useLocation();
  useRobots(isPrivatePath(pathname) ? "noindex, follow" : null);

  // Every public page's structured data comes baked into the HTML response, from
  // `blog-schema.ts` and `page-schema.ts`. The response is only fetched once,
  // though: click from pricing to a landing page and pricing's FAQPage is still
  // in the head, now describing a page the reader has left. Stale structured
  // data is worse than none, so it goes. A crawler never reaches this path — it
  // fetches a URL and gets that URL's blocks.
  useEffect(() => {
    const stale = document.head.querySelectorAll<HTMLScriptElement>("script[data-seo-path]");
    for (const script of stale) {
      if (script.dataset.seoPath !== window.location.pathname) script.remove();
    }
  }, [pathname]);

  return null;
}
