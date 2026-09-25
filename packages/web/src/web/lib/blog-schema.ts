/**
 * Field Notes structured data, resolved by path so it can be baked into the
 * HTML *response*.
 *
 * Why this is not built in the page component: `useSeo({ jsonLd })` writes the
 * blocks once React mounts, which is fine for Googlebot — it renders JS — but
 * several AI crawlers and answer-engine fetchers read the response and stop.
 * They were seeing the right `<title>` and canonical from `seo-html.ts` and no
 * structured data at all, which is the half that tells them the page *answers* a
 * question rather than discusses one. So the blocks are built here, from the
 * post catalog, and emitted server-side by `seo-html.ts`.
 *
 * This module is imported only by that injector — never by a page — so pulling
 * the post bodies in here costs nothing in the client bundle, and it stays
 * React-free for the same reason `seo-routes.ts` does.
 *
 * Everything asserted here has to match what the page visibly says. The FAQ
 * entries are the post's own `answer` and `faq` copy, verbatim, not a summary of
 * them.
 */
import { getPost, posts, type Post } from "./posts";
import { PAGE_SEO, SITE_URL, absoluteUrl } from "./seo-routes";
import { faqSchema } from "./structured-data";

/**
 * Author and publisher for every post.
 *
 * Restated on each page rather than referenced by `@id` alone: the full
 * Organization node in `structured-data.ts` is emitted on the home page, and a
 * consumer that reads one blog URL and nothing else cannot resolve a bare
 * reference. The `@id` still matches that node, so anything crawling both sees
 * one organization rather than two.
 */
const PUBLISHER = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "GeoCliks",
  url: SITE_URL,
  logo: absoluteUrl("/icon-512.png"),
} as const;

/** The post's canonical URL — the same one `seo-html.ts` writes. */
function postUrl(post: Post): string {
  return `${SITE_URL}/blog/${post.slug}`;
}

/**
 * The post as an Article.
 *
 * `headline` is the post's question verbatim, which is also the H1 — Google
 * truncates a headline past ~110 characters, so keep post titles under it.
 * `description` is the SERP-length `metaDescription`, matching the meta tag.
 */
export function articleSchema(post: Post): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    url: postUrl(post),
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl(post) },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: "en",
    keywords: post.keywords.join(", "),
    about: post.targetQuestion,
    isPartOf: { "@type": "Blog", "@id": `${SITE_URL}/blog#blog` },
    author: PUBLISHER,
    publisher: PUBLISHER,
  };
}

/**
 * The post as a FAQPage: the question it targets, answered by its Answer block,
 * then its follow-ups.
 *
 * The target question leads because it is the one the page is built to answer —
 * an engine matching a query against `mainEntity[0]` should find the headline
 * question, not a follow-up.
 */
export function postFaqSchema(post: Post): object {
  return faqSchema([
    { question: post.targetQuestion, answer: post.answer },
    ...post.faq.map((item) => ({ question: item.q, answer: item.a })),
  ]);
}

/** The index as a Blog, listing every post. */
export function blogSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    name: "GeoCliks Field Notes",
    description: PAGE_SEO["/blog"].description,
    url: `${SITE_URL}/blog`,
    inLanguage: "en",
    publisher: PUBLISHER,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: postUrl(post),
      description: post.metaDescription,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt,
    })),
  };
}

/**
 * The blocks for `pathname`, or none for a path that gets no structured data.
 *
 * `/blog/method` is deliberately empty: it is a statement of editorial policy,
 * not an answer to a question, and there is no type that describes it honestly.
 * An unknown slug is empty too — that route renders a 404.
 */
export function jsonLdForPath(pathname: string): object[] {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/blog") return [blogSchema()];
  if (path === "/blog/method") return [];

  if (path.startsWith("/blog/")) {
    const post = getPost(path.slice("/blog/".length));
    return post ? [articleSchema(post), postFaqSchema(post)] : [];
  }

  return [];
}
