import { useLocation } from "wouter";
import { useRobots } from "../lib/seo";

/**
 * The paths that must never appear in a search result.
 *
 * `robots.txt` already disallows all of these, but that file only stops a
 * crawler fetching a URL — it does not stop one indexing a URL it found linked
 * somewhere else, which is exactly how a share token ends up in search. The
 * `noindex` tag is the part that actually keeps them out, and for the token
 * routes that matters: `/share/:token` and `/t/:token` are deliberately
 * readable by anyone holding the link, so an indexed one is a disclosure, not
 * just a ranking problem.
 *
 * Matched as path prefixes, on a segment boundary — `/v` matches `/v/ABC123`
 * but would not match a future `/values` page.
 */
const NOINDEX_PREFIXES = [
  "/app",
  "/admin",
  "/verify",
  "/v",
  "/share",
  "/t",
  "/join",
  "/reset-password",
  "/sign-in",
  "/sign-up",
];

function isPrivate(pathname: string): boolean {
  return NOINDEX_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Applies `noindex` to the private half of the site from one place.
 *
 * Mounted once beside the router rather than called in each of the twenty-odd
 * workspace and admin pages: those pages are added and moved often, and a rule
 * that lives in a list of paths cannot be forgotten in a new file the way a
 * per-page hook call can. It writes only the robots tag, so the titles those
 * pages set for themselves are left untouched.
 *
 * `follow` stays on — these pages link back to the public site, and there is no
 * reason to throw that away.
 */
export function RouteSeo() {
  const [pathname] = useLocation();
  useRobots(isPrivate(pathname) ? "noindex, follow" : null);
  return null;
}
