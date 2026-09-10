/**
 * Help Center content model.
 *
 * Article bodies are structured blocks, never HTML strings. Two reasons: nothing
 * from the content files can inject markup into the page, and every article gets
 * the same typography without authors hand-rolling classes.
 */

/** A paragraph of body copy. */
export type ParagraphBlock = { kind: "p"; text: string };

/** A sub-heading inside an article. Also what the on-page contents list is built from. */
export type HeadingBlock = { kind: "h"; text: string };

/** An unordered list of points. */
export type ListBlock = { kind: "ul"; items: string[] };

/** A numbered procedure. Rendered with the step number in the accent colour. */
export type StepsBlock = { kind: "steps"; items: string[] };

/** A neutral aside — context, a tip, a "good to know". */
export type NoteBlock = { kind: "note"; text: string };

/** A warning: data loss, billing consequences, things that cannot be undone. */
export type WarnBlock = { kind: "warn"; text: string };

/** A small comparison table. Keep it to three or four columns so it survives mobile. */
export type TableBlock = { kind: "table"; head: string[]; rows: string[][] };

/** A pointer to another article, by "category/slug". */
export type SeeAlsoBlock = { kind: "see"; refs: string[] };

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | StepsBlock
  | NoteBlock
  | WarnBlock
  | TableBlock
  | SeeAlsoBlock;

/** Short constructors so the content files stay readable. */
export const p = (text: string): ParagraphBlock => ({ kind: "p", text });
export const h = (text: string): HeadingBlock => ({ kind: "h", text });
export const ul = (...items: string[]): ListBlock => ({ kind: "ul", items });
export const steps = (...items: string[]): StepsBlock => ({ kind: "steps", items });
export const note = (text: string): NoteBlock => ({ kind: "note", text });
export const warn = (text: string): WarnBlock => ({ kind: "warn", text });
export const table = (head: string[], rows: string[][]): TableBlock => ({
  kind: "table",
  head,
  rows,
});
export const see = (...refs: string[]): SeeAlsoBlock => ({ kind: "see", refs });

export interface Article {
  /** URL segment, unique within its category. */
  slug: string;
  title: string;
  /** One sentence shown in category lists and search results. */
  summary: string;
  /** Extra words that should match in search but do not appear in the copy. */
  keywords?: string[];
  body: Block[];
}

/** A named run of articles inside a category page, mirroring the reference layout. */
export interface Section {
  title: string;
  articles: Article[];
}

export interface Category {
  slug: string;
  title: string;
  /** Sentence under the title on the index page and at the top of the category page. */
  summary: string;
  /** lucide-react icon name, resolved in the UI so content stays free of components. */
  icon: string;
  sections: Section[];
}

/** Title and summary overrides for a locale that has no translated body. */
export interface LocaleLabels {
  categories: Record<string, { title?: string; summary?: string }>;
  /** Keyed by "category/slug". */
  articles: Record<string, { title?: string; summary?: string }>;
  /** Section headings, keyed by the English heading. */
  sections: Record<string, string>;
}

/** Every article in a category, flattened out of its sections. */
export function articlesOf(category: Category): Article[] {
  return category.sections.flatMap((section) => section.articles);
}

/** "category/slug" — the key used for cross-references, labels and search. */
export function refOf(categorySlug: string, articleSlug: string): string {
  return `${categorySlug}/${articleSlug}`;
}
