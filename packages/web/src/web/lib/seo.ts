/**
 * Per-route document head for a client-rendered site.
 *
 * The site is a single HTML shell, so every route would otherwise share the one
 * `<title>` and description baked into `index.html` — every help article
 * competing in search as the same "GeoCliks — Proof your work happened" result.
 * This hook gives each route its own title, description, canonical URL, Open
 * Graph tags and structured data.
 *
 * Whatever a route sets is undone when it unmounts: the previous value of each
 * tag is captured on the way in and restored on the way out, so a route that
 * sets nothing inherits the `index.html` defaults rather than the last route's
 * copy.
 *
 * Googlebot renders JavaScript, so runtime-injected meta is indexed. Scrapers
 * that do not run JS (most social unfurlers) read the static tags in
 * `index.html` instead, which is why those stay written as sitewide defaults.
 */
import { useEffect } from "react";

/** Canonical origin. No trailing slash — every helper here appends its own path. */
export const SITE_URL = "https://geocliks.com";

/** Absolute URL for a site-relative path, for canonical and og:url. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface Seo {
  /** Full `<title>`. Write it per page — no suffix is appended. */
  title: string;
  /** ~155 characters. Google rewrites longer ones. */
  description?: string;
  /**
   * Canonical path, site-relative. Defaults to the current pathname. Set it
   * explicitly where several URLs render the same thing.
   */
  path?: string;
  /** Open Graph image, site-relative. Defaults to the sitewide card. */
  image?: string;
  /** Keep the page out of search results. Use on anything behind auth or a token. */
  noindex?: boolean;
  /** Schema.org objects, serialized into `<script type="application/ld+json">`. */
  jsonLd?: object | object[];
}

/** How a managed tag is found in (or added to) the head. */
type TagSpec = { selector: string; attr: "name" | "property"; key: string };

const TAGS = {
  description: { selector: 'meta[name="description"]', attr: "name", key: "description" },
  robots: { selector: 'meta[name="robots"]', attr: "name", key: "robots" },
  ogTitle: { selector: 'meta[property="og:title"]', attr: "property", key: "og:title" },
  ogDescription: {
    selector: 'meta[property="og:description"]',
    attr: "property",
    key: "og:description",
  },
  ogUrl: { selector: 'meta[property="og:url"]', attr: "property", key: "og:url" },
  ogImage: { selector: 'meta[property="og:image"]', attr: "property", key: "og:image" },
  twitterTitle: { selector: 'meta[name="twitter:title"]', attr: "name", key: "twitter:title" },
  twitterDescription: {
    selector: 'meta[name="twitter:description"]',
    attr: "name",
    key: "twitter:description",
  },
  twitterImage: { selector: 'meta[name="twitter:image"]', attr: "name", key: "twitter:image" },
} satisfies Record<string, TagSpec>;

/**
 * Sets one meta tag and returns the undo. A tag absent from `index.html` is
 * created and then removed again; one already there is edited in place and put
 * back the way it was.
 */
function setMeta(spec: TagSpec, content: string): () => void {
  const existing = document.head.querySelector<HTMLMetaElement>(spec.selector);

  if (existing) {
    const previous = existing.getAttribute("content");
    existing.setAttribute("content", content);
    return () => {
      if (previous === null) existing.removeAttribute("content");
      else existing.setAttribute("content", previous);
    };
  }

  const created = document.createElement("meta");
  created.setAttribute(spec.attr, spec.key);
  created.setAttribute("content", content);
  document.head.appendChild(created);
  return () => created.remove();
}

/** Sets `<link rel="canonical">`, creating it if the shell has none. */
function setCanonical(href: string): () => void {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (existing) {
    const previous = existing.getAttribute("href");
    existing.setAttribute("href", href);
    return () => {
      if (previous === null) existing.removeAttribute("href");
      else existing.setAttribute("href", previous);
    };
  }

  const created = document.createElement("link");
  created.setAttribute("rel", "canonical");
  created.setAttribute("href", href);
  document.head.appendChild(created);
  return () => created.remove();
}

/**
 * Appends the structured data blocks. Tagged with `data-seo` so this only ever
 * removes its own scripts, never anything the shell or a third party added.
 */
function setJsonLd(blocks: object[]): () => void {
  const scripts = blocks.map((block) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seo = "route";
    // Serialized, not interpolated: the content catalog is trusted, but a stray
    // "</script>" in an article title would otherwise close the block early.
    script.textContent = JSON.stringify(block);
    document.head.appendChild(script);
    return script;
  });

  return () => {
    for (const script of scripts) script.remove();
  };
}

/**
 * Applies `seo` to the document head for as long as the calling route is
 * mounted.
 *
 * Pass a stable `title`/`description` — string values, so the effect re-runs
 * only when the copy actually changes. `jsonLd` is compared by its serialized
 * form for the same reason, which lets callers build it inline.
 */
export function useSeo(seo: Seo): void {
  const { title, description, path, image, noindex } = seo;
  const jsonLdKey = seo.jsonLd ? JSON.stringify(seo.jsonLd) : "";

  useEffect(() => {
    const undo: Array<() => void> = [];

    const previousTitle = document.title;
    document.title = title;
    undo.push(() => {
      document.title = previousTitle;
    });

    const url = absoluteUrl(path ?? window.location.pathname);
    undo.push(setCanonical(url));
    undo.push(setMeta(TAGS.ogUrl, url));

    undo.push(setMeta(TAGS.ogTitle, title));
    undo.push(setMeta(TAGS.twitterTitle, title));

    if (description) {
      undo.push(setMeta(TAGS.description, description));
      undo.push(setMeta(TAGS.ogDescription, description));
      undo.push(setMeta(TAGS.twitterDescription, description));
    }

    if (image) {
      const absolute = absoluteUrl(image);
      undo.push(setMeta(TAGS.ogImage, absolute));
      undo.push(setMeta(TAGS.twitterImage, absolute));
    }

    // "noindex, nofollow" would also throw away the link equity of the public
    // pages these link back to, so follow stays on.
    if (noindex) undo.push(setMeta(TAGS.robots, "noindex, follow"));

    if (jsonLdKey) {
      const parsed = JSON.parse(jsonLdKey) as object | object[];
      undo.push(setJsonLd(Array.isArray(parsed) ? parsed : [parsed]));
    }

    return () => {
      // Reverse order, so a tag touched twice ends up with its original value.
      for (const step of undo.reverse()) step();
    };
  }, [title, description, path, image, noindex, jsonLdKey]);
}

/**
 * Marks a route as off-limits to crawlers, and gives it a title so a shared
 * link is not labelled with the marketing headline. For pages behind auth or a
 * token, where `robots.txt` is the first line of defence and this is the second
 * — a URL someone links to publicly is crawled despite being disallowed, and
 * only the tag keeps it out of the index.
 */
export function useNoindex(title: string): void {
  useSeo({ title, noindex: true });
}

/**
 * Sets only `<meta name="robots">`, leaving the title alone.
 *
 * This is the half of `useNoindex` that the private routes need: the workspace
 * shell and the token pages already write their own titles, and a second writer
 * would race them. Pass `null` on a route that should stay indexable — the hook
 * still runs, which keeps the hook order stable across navigations.
 */
export function useRobots(value: string | null): void {
  useEffect(() => {
    if (!value) return;
    return setMeta(TAGS.robots, value);
  }, [value]);
}
