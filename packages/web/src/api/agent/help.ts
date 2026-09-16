import { z } from "zod";
import { tool } from "ai";
import { type LocaleCode, asLocale } from "../lib/locales";
import { allArticles, articleHref, coverageOf, resolveRef } from "../../web/help/resolve";
import type { Article, Block, Category } from "../../web/help/types";

/**
 * The Help Center, as something the assistant can actually read.
 *
 * Without this the model answered "how do I…" from its own general idea of what a photo-
 * evidence app probably does, which is exactly what its instructions tell it not to do — so it
 * either hedged or invented. The Help Center already holds the real answers, written per
 * feature and translated per locale, so the fix is to let the model look them up instead of
 * guessing.
 *
 * Two tools rather than one prompt. The full English catalog is around 90 KB of body copy;
 * pasting it into every request would be paid for on every message, including the ones that
 * never ask about the product. So the system prompt carries only the category outline (a few
 * hundred characters, see `helpOutline`), `searchHelp` finds the handful of articles a question
 * touches, and `readHelpArticle` pulls one article's text in full when the model needs the
 * steps verbatim.
 *
 * Neither tool takes a `Viewer`. Help pages are public — anyone can read them on the site
 * without an account — so unlike the photo tools these are handed to the signed-out bubble too,
 * which is the half of the traffic most likely to be asking how the product works.
 *
 * The content lives under `src/web/help` because that is where the Help pages render it, but
 * `resolve.ts`, `types.ts` and the catalogs are plain data with no React and no browser globals,
 * so they import cleanly here. `registry.ts` is the one file to keep out of reach: it maps icon
 * names onto `lucide-react` components, and the API has no business pulling an icon library in.
 */

/** How many matches a search hands back. Enough to choose from, not enough to fill the context. */
const MAX_HITS = 6;

/** A single article's text, trimmed to this. The longest article sits well under it. */
const MAX_ARTICLE_CHARS = 7_000;

/** The locale the caller is reading the app in, sent per request like the timezone is. */
export function localeOf(request: Request): LocaleCode {
  const asked = request.headers.get("x-geocliks-locale")?.trim();
  if (!asked || asked.length > 20) return "en";
  return asLocale(asked);
}

/** One block as the plain text the model reads — and the markdown the chat panel can re-render. */
function blockText(block: Block): string {
  switch (block.kind) {
    case "p":
      return block.text;
    case "h":
      return `**${block.text}**`;
    case "ul":
      return block.items.map((item) => `- ${item}`).join("\n");
    case "steps":
      return block.items.map((item, i) => `${i + 1}. ${item}`).join("\n");
    case "note":
      return `Note: ${block.text}`;
    case "warn":
      return `Warning: ${block.text}`;
    case "table":
      return [block.head.join(" | "), ...block.rows.map((row) => row.join(" | "))].join("\n");
    case "see":
      // Left as refs on purpose: they are what `readHelpArticle` takes, so the model can follow
      // one straight into the next article.
      return `See also: ${block.refs.join(", ")}`;
  }
}

function articleText(category: Category, article: Article): string {
  const body = article.body.map(blockText).join("\n\n");
  const whole = `# ${article.title}\n\n${article.summary}\n\n${body}`;
  return whole.length > MAX_ARTICLE_CHARS
    ? `${whole.slice(0, MAX_ARTICLE_CHARS)}\n\n(Trimmed here. The full article is at ${articleHref(category.slug, article.slug)}.)`
    : whole;
}

/**
 * The categories, one line each, for the system prompt.
 *
 * Deliberately not the article list: 59 titles and summaries is around 7 KB on every single
 * request, and the model does not need them to know that a question about invoices means
 * searching the Help Center. Knowing the shape of it is enough to decide to look.
 */
export function helpOutline(locale: LocaleCode): string {
  const seen = new Map<string, Category>();
  for (const { category } of allArticles(locale)) seen.set(category.slug, category);
  return [...seen.values()]
    .map((category) => `- ${category.slug}: ${category.title} — ${category.summary}`)
    .join("\n");
}

/** Lowercased haystack per article, built once per locale and kept. */
type Entry = { ref: string; category: Category; article: Article; body: string };

const corpora = new Map<LocaleCode, Entry[]>();

function corpus(locale: LocaleCode): Entry[] {
  const cached = corpora.get(locale);
  if (cached) return cached;
  const built = allArticles(locale).map(({ category, article, ref }) => ({
    ref,
    category,
    article,
    body: article.body.map(blockText).join("\n").toLowerCase(),
  }));
  corpora.set(locale, built);
  return built;
}

const words = (value: string) =>
  value
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 1);

/**
 * Plain word overlap, weighted by where the word turned up.
 *
 * A title hit means the article is about the thing asked; a body hit only means it mentions it.
 * `keywords` exists in the content model precisely for the words readers use and the copy does
 * not ("invoice", "receipt"), so it scores close to the title.
 */
function score(entry: Entry, terms: string[]): number {
  const title = entry.article.title.toLowerCase();
  const summary = entry.article.summary.toLowerCase();
  const keywords = (entry.article.keywords ?? []).join(" ").toLowerCase();
  const category = entry.category.title.toLowerCase();
  let total = 0;
  for (const term of terms) {
    if (title.includes(term)) total += 8;
    if (keywords.includes(term)) total += 5;
    if (summary.includes(term)) total += 3;
    if (category.includes(term)) total += 2;
    if (entry.body.includes(term)) total += 1;
  }
  return total;
}

export function searchHelpTool(locale: LocaleCode) {
  return tool({
    description:
      "Search the GeoCliks Help Center and return the articles that match, with their summaries " +
      "and their reference for `readHelpArticle`. Use it for any question about how GeoCliks " +
      "works — a feature, a setting, a plan, an error, a how-to — before answering from memory.",
    inputSchema: z.object({
      query: z
        .string()
        .min(2)
        .max(200)
        .describe("What the person is trying to do, in their own words."),
      limit: z.number().int().min(1).max(MAX_HITS).optional(),
    }),
    execute: async ({ query, limit }) => {
      const terms = words(query);
      if (terms.length === 0) return { articles: [], note: "Nothing to search for." };

      const ranked = corpus(locale)
        .map((entry) => ({ entry, points: score(entry, terms) }))
        .filter((row) => row.points > 0)
        .sort((a, b) => b.points - a.points)
        .slice(0, limit ?? MAX_HITS);

      if (ranked.length === 0) {
        return {
          articles: [],
          note: "No Help article matches that. Say so rather than inventing an answer.",
        };
      }

      return {
        articles: ranked.map(({ entry }) => ({
          ref: entry.ref,
          title: entry.article.title,
          summary: entry.article.summary,
          category: entry.category.title,
          href: articleHref(entry.category.slug, entry.article.slug),
        })),
      };
    },
  });
}

export function readHelpArticleTool(locale: LocaleCode) {
  return tool({
    description:
      "Read one Help Center article in full, by its \"category/slug\" reference. Use it once " +
      "`searchHelp` has found the right article and the answer needs the actual steps, limits " +
      "or wording rather than a summary.",
    inputSchema: z.object({
      ref: z
        .string()
        .min(3)
        .max(120)
        .describe('The article reference, as "category/slug" — e.g. "getting-started/first-photo".'),
    }),
    execute: async ({ ref }) => {
      const found = resolveRef(locale, ref.trim().replace(/^\/+|\/+$/g, ""));
      if (!found) {
        return {
          note: `No Help article at "${ref}". Search again with \`searchHelp\` and use a ref it returned.`,
        };
      }
      return {
        ref: found.ref,
        title: found.article.title,
        category: found.category.title,
        href: articleHref(found.category.slug, found.article.slug),
        // Non-English locales without a translated catalog fall back to the English copy, so the
        // model is told which language it is holding and can answer in the person's anyway.
        language: coverageOf(locale) === "full" ? locale : "en",
        content: articleText(found.category, found.article),
      };
    },
  });
}
