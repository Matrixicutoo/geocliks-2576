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
 * Field Notes structured data is written here too, from `blog-schema.ts`, and
 * nowhere else: an Article and a FAQPage that only exist after React mounts are
 * invisible to the answer engines they are for.
 *
 * String rewriting rather than a DOM parse on purpose: this runs on every HTML
 * request, the shell is a fixed file we control, and pulling in a parser to
 * change four tags would cost more than it buys.
 */
import { jsonLdForPath } from "./blog-schema";
import { SITE_URL, seoForPath } from "./seo-routes";

/** Escapes a value going into a double-quoted HTML attribute. */
function attr(value: string): string {
  return text(value).replace(/"/g, "&quot;");
}

/** Escapes text going between tags — `<title>` is the only one here. */
function text(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Replaces the `content` of a meta tag matched by one attribute, or appends the
 * tag when the shell has none.
 */
function setMeta(html: string, kind: "name" | "property", key: string, value: string): string {
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
export function injectSeoIntoHtml(html: string, pathname: string): string {
  const seo = seoForPath(pathname);
  let out = html;

  if (seo.noindex) {
    // "noindex, nofollow" would also throw away the link equity of the public
    // pages these link back to, so follow stays on.
    return setMeta(out, "name", "robots", "noindex, follow");
  }

  if (seo.title) {
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${text(seo.title)}</title>`);
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
    const url = `${SITE_URL}${pathname === "/" ? "/" : pathname.replace(/\/$/, "")}`;
    out = setMeta(out, "property", "og:url", url);
    if (/<link\s+rel="canonical"[^>]*>/i.test(out)) {
      out = out.replace(
        /<link\s+rel="canonical"[^>]*>/i,
        `<link rel="canonical" href="${attr(url)}" />`,
      );
    } else {
      out = appendToHead(out, `<link rel="canonical" href="${attr(url)}" />`);
    }
  }

  // Structured data, for the crawlers that read the response and never run the
  // JavaScript that `useSeo({ jsonLd })` needs. Field Notes only, for now: the
  // marketing and Help Center blocks are built inside their page components,
  // where the server cannot reach them without moving them out first.
  for (const block of jsonLdForPath(pathname)) {
    out = appendToHead(out, jsonLdScript(block, pathname));
  }

  return out;
}
