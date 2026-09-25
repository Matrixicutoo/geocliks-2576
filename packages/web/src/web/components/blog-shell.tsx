import { useEffect } from "react";
import { useLocation } from "wouter";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { scrollSiteToTop } from "../lib/site-scroll";
import { assertPostSeo } from "../lib/posts";

/**
 * Chrome for Field Notes — the answer log at `/blog`.
 *
 * Deliberately thin. Field Notes shipped as its own site with its own header and
 * footer, and both are dropped here in favour of the real `SiteNav` and
 * `SiteFooter`: a reader who arrives from search has to be able to reach pricing,
 * the app and the Help Center, and a second set of navigation on the same domain
 * is the kind of thing that makes a blog read as a detached content farm.
 *
 * Unlike `LandingPage`, this adds no hero band. Every Field Notes page opens with
 * its own navy masthead, which is the page's subject line rather than a reusable
 * band, so the shell stops at the frame.
 *
 * English-only, like the landing and legal pages: the posts target English
 * queries and eleven translations would compete with each other in one result
 * set. The language picker in the header still works — it just sends the visitor
 * to a translated site everywhere else.
 */
export function BlogShell({ children }: { children: React.ReactNode }) {
  const [path] = useLocation();

  // The Article/FAQPage blocks come baked into the HTML response, from
  // `lib/blog-schema.ts` — nothing here writes structured data. But the response
  // is only fetched once: click from the index to a post and the Blog block from
  // `/blog` is still in the head, now describing a page the reader has left.
  // Stale structured data is worse than none, so it is removed. A crawler never
  // sees this path — it fetches the URL and gets that URL's blocks.
  useEffect(() => {
    const stale = document.head.querySelectorAll<HTMLScriptElement>("script[data-seo-path]");
    for (const script of stale) {
      if (script.dataset.seoPath !== window.location.pathname) script.remove();
    }
  }, [path]);

  // Field Notes is always light, whatever a signed-in member picked for the app
  // shell on this device. Restore their choice when they leave.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    root.dataset.theme = "light";
    scrollSiteToTop();
    return () => {
      if (previous) root.dataset.theme = previous;
      else delete root.dataset.theme;
    };
  }, []);

  // A post without its SEO row would ship with the site's default title and
  // nothing would look broken. Fail in development instead, where it is cheap.
  useEffect(() => {
    if (import.meta.env.DEV) assertPostSeo();
  }, []);

  return (
    <div data-theme="light" className="flex min-h-screen flex-col bg-paper text-chalk">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
