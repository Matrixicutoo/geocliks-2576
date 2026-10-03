/**
 * Bakes per-route head tags into the HTML *response*.
 *
 * The site is a single shell served for every path, so until this existed every
 * URL came back with the home page's `<title>` and description in its raw HTML.
 * `useSeo` fixes the head once React mounts, which covers browsers and Googlebot
 * (it renders JavaScript) — but not a crawler or an unfurler that reads the
 * response and stops, and not the "view source" a search-console audit looks at.
 * Both halves now read the same table in `seo-routes.ts`, so the tags a crawler
 * gets and the tags a visitor ends up with cannot drift apart.
 *
 * Structured data is written here too — from `blog-schema.ts` for Field Notes
 * and `page-schema.ts` for the home page, the landing pages and the Help Center
 * — and nowhere else: an Article and a FAQPage that only exist after React
 * mounts are invisible to the answer engines they are for.
 *
 * String rewriting rather than a DOM parse on purpose: this runs on every HTML
 * request, the shell is a fixed file we control, and pulling in a parser to
 * change four tags would cost more than it buys.
 */
import { isRtl } from "../../api/lib/locales";
import { jsonLdForPath } from "./blog-schema";
import {
  alternatesFor,
  isLocalizedPath,
  localizedPath,
  splitLocalePath,
} from "./locale-url";
import { translate } from "./catalogs";
// Server-side, every language must be readable synchronously; the browser loads one at a time.
import "./catalogs-all";
import type { LocaleCode } from "../../api/lib/locales";
import { firstPaintShell, shellLcpIsImage } from "./first-paint";
import { marketingJsonLd } from "./page-schema";
import { SITE_URL, seoForPath } from "./seo-routes";

/** Keep in step with the hero <picture> in `pages/index.tsx`. */
const HERO_PRELOADS = [
  `<link rel="preload" as="image" type="image/webp" href="/videos/hero-poster-portrait.webp" media="(max-width: 639px)" fetchpriority="high" />`,
  `<link rel="preload" as="image" href="/videos/hero-poster-wide.jpg" media="(min-width: 640px) and (min-aspect-ratio: 37/20)" fetchpriority="high" />`,
  `<link rel="preload" as="image" href="/videos/hero-poster-16x9.jpg" media="(min-width: 640px) and (max-aspect-ratio: 37/20)" fetchpriority="high" />`,
].join("");

/**
 * The public pages every crawler-readable fallback links to, so a crawler that does not run
 * JavaScript can still walk from any page to the rest of the site (Bing Site Scan stopped at the
 * home page because the shell had no links at all).
 */
const FALLBACK_LINKS = [
  "/",
  "/pricing",
  "/get-app",
  "/construction-photo-documentation",
  "/roofing-photo-documentation",
  "/hvac-photo-documentation",
  "/property-inspection-photos",
  "/proof-of-delivery",
  "/gps-timestamp-camera",
  "/can-photo-timestamps-be-faked",
  "/prove-crew-was-on-site",
  "/construction-photo-log",
  "/alternatives/companycam",
  "/alternatives/timemark",
  "/blog",
  "/help",
  "/about",
] as const;

/** A route title without the brand suffix — "Pricing — GeoCliks" reads as "Pricing". */
function headingFromTitle(title: string): string {
  return title.replace(/\s+[—|–-]\s+GeoCliks\s*$/i, "").trim() || title;
}

/**
 * Plain HTML written into `<div id="root">` for a crawler that reads the response and never runs
 * the JavaScript: the page's H1, its intro line and links to the rest of the site.
 *
 * It is the same copy the page renders — on the home page literally the same H1 text — so a
 * crawler and a visitor are told the same thing. `createRoot().render()` replaces the contents of
 * #root on mount, so a visitor never sees it (it is hidden for any browser that runs JavaScript —
 * see the `has-js` switch in `injectSeoIntoHtml` — so it only shows when scripts are off).
 */
function bodyFallback(path: string, locale: LocaleCode, title: string, description: string): string {
  const home = path === "/";
  const h1 = home
    ? `${translate(locale, "home.hero.h1Seo")}. ${translate(locale, "home.hero.title1")} ${translate(locale, "home.hero.title2")}`
    : headingFromTitle(title);
  const intro = home ? translate(locale, "home.hero.body") : description;
  const links = FALLBACK_LINKS.filter((href) => href !== path)
    .map((href) => {
      const target = seoForPath(href, locale);
      if (!target.title) return "";
      const url = locale !== "en" && isLocalizedPath(href) ? localizedPath(href, locale) : href;
      return `<li style="margin:6px 0"><a style="color:var(--c-amber-deep,var(--c-amber))" href="${attr(url)}">${text(headingFromTitle(target.title))}</a></li>`;
    })
    .filter(Boolean)
    .join("");
  // Inline styles because this paints before the bundle (and its Tailwind classes) are in play:
  // on a slow phone it can be on screen for a moment, so it is laid out as a quiet, readable page
  // in the site's colours rather than raw browser defaults.
  return (
    `<main id="seo-fallback" style="max-width:760px;margin:0 auto;padding:64px 20px;font-family:Manrope,system-ui,sans-serif;color:var(--c-fog);line-height:1.6">` +
    `<h1 style="font-family:Sora,Manrope,system-ui,sans-serif;font-size:30px;line-height:1.15;color:var(--c-chalk);margin:0 0 16px">${text(h1)}</h1>` +
    `<p style="font-size:16px;margin:0 0 28px">${text(intro)}</p>` +
    `<nav><ul style="list-style:none;padding:0;margin:0;font-size:14px">${links}</ul></nav></main>`
  );
}

/** Escapes a value going into a double-quoted HTML attribute. */
function attr(value: string): string {
  return text(value).replace(/"/g, "&quot;");
}

/** Escapes text going between tags — `<title>` is the only one here. */
function text(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Replaces the `content` of a meta tag matched by one attribute, or appends the
 * tag when the shell has none.
 */
function setMeta(
  html: string,
  kind: "name" | "property",
  key: string,
  value: string,
): string {
  const tag = new RegExp(`<meta\\s+${kind}="${key}"[^>]*>`, "i");
  const replacement = `<meta ${kind}="${key}" content="${attr(value)}" />`;
  if (tag.test(html)) return html.replace(tag, replacement);
  return appendToHead(html, replacement);
}

function appendToHead(html: string, tag: string): string {
  if (!html.includes("</head>")) return html;
  return html.replace("</head>", `\t\t${tag}\n\t</head>`);
}

/**
 * One structured-data block as a script tag.
 *
 * `<` is escaped to its JSON unicode form rather than left as-is: the catalog is
 * trusted copy, but a `</script>` inside any string would end the block early
 * and spill the rest of the JSON into the page. `\u003c` parses back to the same
 * string, so a validator sees no difference.
 *
 * `data-seo-path` records the URL the block describes. A client-side navigation
 * changes the path without re-running this injector, so the blog shell uses the
 * attribute to drop a block that is no longer about the page on screen.
 */
function jsonLdScript(block: object, pathname: string): string {
  const json = JSON.stringify(block).replace(/</g, "\\u003c");
  return `<script type="application/ld+json" data-seo-path="${attr(pathname)}">${json}</script>`;
}

/**
 * Rewrites `html` — the built shell — for the route at `pathname`.
 *
 * Unknown paths are returned untouched, which leaves the sitewide defaults in
 * place: a guess would be worse than the generic copy, and the client hook
 * still writes whatever the route itself sets.
 */
/**
 * Where the first screen paints from static markup (the home and landing pages, see `first-paint.ts`), the
 * app bundle is not needed for that paint, so it is not fetched until that paint has happened:
 * the connection goes to the stylesheet, fonts and hero still first, then to the ~300 KB of
 * script. The entry module and every chunk Vite would have modulepreloaded are requested together
 * at that point, so the app's own chunks still load in parallel rather than as a waterfall.
 *
 * "That paint" is the shell's hero still being reported as the largest contentful paint. Starting
 * any earlier, a fast connection has the bundle ready before the parser finishes, React replaces
 * the shell before its paint is reported, and the page's LCP becomes React's identical copy of
 * the image, which had to wait for the whole bundle. React's copy is the same size, so it never
 * replaces the shell's entry. Browsers without LCP entries (Safari) start one frame after first
 * paint; a member whose shell was already removed (signed in) starts at once; and a timer covers
 * a tab opened in the background, where nothing paints until it is shown.
 */
// `waitForImage` is the home page's case above. A landing page's LCP is text, and text is where the
// web fonts bite: the shell can paint in the fallback font (font-display: swap) and the browser
// keeps that first, smaller size as the shell's LCP entry even after the swap. React's copy, set
// in the web font, is then larger and becomes a new LCP that waited for the whole bundle. So a
// landing page loads the shell's fonts first, replaces the shell with an identical copy of
// itself — new nodes, painted in the web fonts at their final size — and starts the bundle once
// that copy has been painted: after the first LCP entry (text is visible — while a web font is
// still in its block period the browser paints frames with the text hidden, so counting frames
// alone is not enough), and after the copy's own LCP entry (`LANDING_FIN`). Counting animation
// frames is not enough there either: a paint is reported a few ms after the frame that drew it,
// and a bundle request issued before a paint is reported is, to Lighthouse, a dependency of it. React's copy is then the same size, never larger. (The home page's LCP is its
// still, whose on-screen size is held to the viewport on phones; see `pages/index.tsx`.)
// A landing page's last step: start the bundle once the swapped-in copy's paint has been reported as
// a new LCP entry, or after 150 ms if it never is (the copy was not larger than what the fallback
// font painted, so it is not a candidate and its paint cannot be delayed by the bundle). Where LCP
// entries are not supported, two frames.
const LANDING_FIN =
  `function(){setTimeout(go,150);try{var q=new PerformanceObserver(function(l){if(l.getEntries().some(function(x){return x.startTime>=T})){q.disconnect();go()}});` +
  `q.observe({type:"largest-contentful-paint",buffered:true})}catch(e){requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(go,0)})})}}`;

function deferAppEntry(html: string, waitForImage: boolean): string {
  const entry = html.match(/<script type="module" crossorigin(?:="")? src="([^"]+)"><\/script>/);
  if (!entry) return html;
  const preloads: string[] = [];
  let out = html.replace(entry[0], "").replace(
    /[ \t]*<link rel="modulepreload" crossorigin(?:="")? href="([^"]+)">\n?/g,
    (_, href: string) => {
      preloads.push(href);
      return "";
    },
  );
  const loader =
    `<script>(function(){var s=0;function go(){if(s)return;s=1;var h=document.head;` +
    `${JSON.stringify(preloads)}.forEach(function(u){var l=document.createElement("link");l.rel="modulepreload";l.crossOrigin="";l.href=u;h.appendChild(l)});` +
    `var e=document.createElement("script");e.type="module";e.crossOrigin="";e.src=${JSON.stringify(entry[1])};h.appendChild(e)}` +
    `function start(){var f=document.getElementById("first-paint");if(!f)return go();setTimeout(go,1500);` +
    // `done` is called once per condition; the bundle starts when the last one is met.
    `var n=1,T=0,fin=${waitForImage ? "go" : LANDING_FIN};function done(){if(--n===0)fin()}` +
    (waitForImage
      ? ""
      : // Landing pages: also wait for the web fonts the shell's copy uses (subsets picked by its
        // own text), then swap the shell for a fresh copy of itself so that copy is painted in the
        // web fonts. See the note above `deferAppEntry` for why.
        `var D=document.fonts;if(D&&D.load){n++;var t=f.textContent;` +
        `Promise.all(["16px Manrope","700 16px Sora",'16px "JetBrains Mono"'].map(function(x){return D.load(x,t).catch(function(){})})).then(function(){` +
        `var g=document.getElementById("first-paint");if(g)g.replaceWith(g.cloneNode(true));T=performance.now();done()})}`) +
    `var P=window.PerformanceObserver;if(P&&P.supportedEntryTypes&&P.supportedEntryTypes.indexOf("largest-contentful-paint")>=0){` +
    `try{var o=new P(function(l){if(l.getEntries().some(function(x){return ${waitForImage ? "x.url" : "true"}})){o.disconnect();done()}});o.observe({type:"largest-contentful-paint",buffered:true});return}catch(e){}}` +
    `requestAnimationFrame(function(){setTimeout(done,0)})}` +
    `if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start()})()</script>`;
  out = appendToHead(out, loader);
  return out;
}

export function injectSeoIntoHtml(html: string, pathname: string): string {
  // A locale-prefixed URL is the same route in another language: `/es/get-app`
  // is `/get-app`, so the SEO table, the structured data and the canonical are
  // all resolved from the bare path underneath the prefix.
  const { locale, path, prefixed } = splitLocalePath(pathname);
  // The language this URL actually renders in: a prefix only counts when the
  // path behind it is translated. Head copy and structured data both key off
  // it, so the title, the description and the FAQPage markup cannot disagree
  // with the page or with each other.
  const pageLocale = prefixed && isLocalizedPath(path) ? locale : "en";
  const seo = seoForPath(path, pageLocale);
  let out = html;

  if (seo.noindex) {
    // "noindex, nofollow" would also throw away the link equity of the public
    // pages these link back to, so follow stays on.
    return setMeta(out, "name", "robots", "noindex, follow");
  }

  // The shell ships `lang="en"`. On a locale URL that is a lie a crawler reads
  // before any JavaScript runs, and for Arabic the direction is wrong too.
  if (prefixed) {
    out = out.replace(
      /<html([^>]*)\slang="[^"]*"([^>]*)>/i,
      `<html$1 lang="${attr(locale)}"$2>`,
    );
    if (isRtl(locale) && !/<html[^>]*\sdir=/i.test(out)) {
      out = out.replace(/<html([^>]*)>/i, `<html$1 dir="rtl">`);
    }
  }

  // Chrome offers to translate any page whose language is not the one the
  // browser is set to, and for a visitor with "always translate" on for this
  // language it just does it — silently, before they see a word of it. On a page
  // we translated ourselves that is a regression the visitor cannot explain:
  // they pick Polish, the URL and the picker both say Polish, and Chrome hands
  // them a machine translation of our Polish back into English.
  //
  // So a page we serve in a non-English language opts out. English pages do not:
  // a Polish speaker landing on `/` has nothing better than Chrome's offer, and
  // taking it away would be worse than leaving it.
  if (pageLocale !== "en") {
    out = setMeta(out, "name", "google", "notranslate");
  }

  if (seo.title) {
    out = out.replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${text(seo.title)}</title>`,
    );
    out = setMeta(out, "property", "og:title", seo.title);
    out = setMeta(out, "name", "twitter:title", seo.title);
  }

  if (seo.description) {
    out = setMeta(out, "name", "description", seo.description);
    out = setMeta(out, "property", "og:description", seo.description);
    out = setMeta(out, "name", "twitter:description", seo.description);
  }

  // Only for a route we have copy for. On an unknown path the right canonical is
  // the URL that was fetched, which is what a crawler assumes when there is no
  // tag at all — see the note in index.html.
  if (seo.title) {
    // Where this page's signals belong.
    //
    //  - a translated page under its own prefix is its own canonical: it is a
    //    distinct page with distinct copy, and pointing it at English would ask
    //    Google to drop it, which is the whole thing this work undoes;
    //  - a prefix on a page that is NOT translated serves English text at a
    //    second address. That is duplicate content, so it canonicalizes back to
    //    the bare English URL and advertises no alternates.
    const canonicalPath =
      prefixed && isLocalizedPath(path) ? localizedPath(path, locale) : path;
    const url = `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;
    out = setMeta(out, "property", "og:url", url);
    out = setMeta(out, "property", "og:locale", prefixed ? locale : "en");
    if (/<link\s+rel="canonical"[^>]*>/i.test(out)) {
      out = out.replace(
        /<link\s+rel="canonical"[^>]*>/i,
        `<link rel="canonical" href="${attr(url)}" />`,
      );
    } else {
      out = appendToHead(out, `<link rel="canonical" href="${attr(url)}" />`);
    }

    // The reciprocal hreflang set, emitted on all eleven URLs of a translated
    // page and on nothing else. `alternatesFor` returns an empty list for an
    // untranslated path, and a partial set is worse than none: Google drops the
    // whole cluster if the URLs do not all point at each other.
    for (const alternate of alternatesFor(path)) {
      out = appendToHead(
        out,
        `<link rel="alternate" hreflang="${attr(alternate.hreflang)}" href="${attr(
          `${SITE_URL}${alternate.path === "/" ? "/" : alternate.path}`,
        )}" />`,
      );
    }
  }

  // The home hero's still is the page's LCP element, but React renders it, so the
  // browser would not ask for it until the whole bundle had downloaded and run —
  // on a throttled phone that was five seconds of nothing. Preloading it from the
  // document starts the fetch alongside the stylesheet. One link per cut, with
  // media queries mirroring the <picture> sources in `pages/index.tsx`, so each
  // device fetches exactly the one file it will paint.
  if (path === "/") {
    out = appendToHead(out, HERO_PRELOADS);
  }

  // Structured data, for the crawlers that read the response and never run the
  // JavaScript that `useSeo({ jsonLd })` needs. Two catalogs, split by what they
  // have to read: Field Notes from the post files, everything else — the home
  // page, the landing pages, the Help Center — from `page-schema.ts`. The paths
  // they answer are disjoint, so no block is written twice.
  //
  // Built in `pageLocale`, so a Spanish page claims a Spanish FAQ. An
  // untranslated path under a prefix still renders English — and canonicalizes
  // to English above — so it gets English markup: the mismatch is closed in
  // both directions.
  for (const block of [
    ...jsonLdForPath(path),
    ...marketingJsonLd(path, pageLocale),
  ]) {
    out = appendToHead(out, jsonLdScript(block, pathname));
  }

  // The body a non-JavaScript crawler reads: an H1, the intro and links onward. Without it the
  // response body is an empty <div id="root"></div> — no heading, nothing to follow.
  if (seo.title && seo.description) {
    // Visitors never see it. This runs in <head>, before the body is parsed, so in any browser
    // that runs JavaScript the fallback is hidden before its first paint — the app then
    // replaces it on mount. A crawler that does not run JavaScript never adds the class, so it
    // still reads the H1, the intro and the links.
    out = appendToHead(
      out,
      `<style>html.has-js #seo-fallback{display:none}html:not(.has-js) #first-paint{display:none}</style><script>document.documentElement.classList.add("has-js")</script>`,
    );
    // The home page's header and hero as static markup, beside #root rather than inside it so
    // React's first commit cannot clear it — see `first-paint.ts` for the handoff.
    const shell = firstPaintShell(pathname, pageLocale);
    if (shell) out = deferAppEntry(out, shellLcpIsImage(pathname));
    out = out.replace(
      /<div id="root"><\/div>/,
      `${shell}<div id="root">${bodyFallback(path, pageLocale, seo.title, seo.description)}</div>`,
    );
  }

  return out;
}
