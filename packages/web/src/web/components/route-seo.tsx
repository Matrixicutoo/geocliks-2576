import { useLocation } from "wouter";
import { useRobots } from "../lib/seo";
import { isPrivatePath } from "../lib/seo-routes";

/**
 * Applies `noindex` to the private half of the site from one place.
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
  return null;
}
