export type PostFormat = "comparison" | "best-of" | "how-to" | "faq";

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h2"; text: string; id?: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "callout"; label: string; text: string }
  | { kind: "table"; caption?: string; head: string[]; rows: string[][] }
  | { kind: "code"; text: string }
  // A pointer out of the post and into the product pages. Posts are plain
  // strings by design — no inline HTML, no markdown parsing — so a link has to
  // be its own block rather than something embedded in a paragraph. Each entry
  // carries the reason to follow it: a bare list of page titles is navigation,
  // and nobody reads navigation in the middle of an article.
  | { kind: "links"; label: string; items: { href: string; text: string; note: string }[] };

export type FaqItem = { q: string; a: string };

export type Post = {
  slug: string;
  format: PostFormat;
  /** The exact question a person types. Used as the H1. */
  title: string;
  /** The question this post targets, verbatim, for the JSON-LD + rail. */
  targetQuestion: string;
  /** Where the demand evidence came from, shown on the post. */
  demand: string;
  metaDescription: string;
  /** The quotable answer. 2-4 sentences, no hedging, works standalone. */
  answer: string;
  publishedAt: string;
  updatedAt?: string;
  readMinutes: number;
  keywords: string[];
  blocks: Block[];
  faq: FaqItem[];
};
