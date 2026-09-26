/**
 * Structured data for the marketing pages and the Help Center, resolved by path
 * so `seo-html.ts` can bake it into the HTML *response*.
 *
 * Field Notes has worked this way since `blog-schema.ts` — the reason is the
 * same one, restated here because this is where the rest of the site caught up:
 * `useSeo({ jsonLd })` writes its blocks after React mounts, which Googlebot
 * sees and several answer-engine fetchers never do. They read the response and
 * stop. A landing page whose FAQPage only exists post-mount is, to them, a page
 * with no structure at all.
 *
 * The FAQ copy lives here rather than in the page components, and the pages
 * import it back for rendering. That direction matters: a component cannot be
 * imported by this module without dragging React into the server-side injector,
 * and keeping two copies — one rendered, one in the schema — would drift, which
 * is the one thing structured data must never do. What the page says and what
 * it claims to say are now the same array.
 *
 * React-free on purpose, like `seo-routes.ts` and `blog-schema.ts`.
 */
import type { LocaleCode } from "../../api/lib/locales";
import { type TKey, translate } from "./catalogs";
import { articleHref, asLocale, findArticle, findCategory } from "../help/resolve";
import { articlesOf } from "../help/types";
import { SALES_EMAIL } from "./support";
import {
  type Crumb,
  aboutPageSchema,
  breadcrumbSchema,
  faqSchema,
  homeSchema,
  organizationSchema,
  techArticleSchema,
} from "./structured-data";

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * An FAQ entry whose copy lives in the translation catalogs rather than in this
 * file, named by key so the eleven locales stay the single source.
 */
interface TranslatedFaqEntry {
  keys: { question: TKey; answer: TKey };
}

type FaqSource = FaqEntry | TranslatedFaqEntry;

/**
 * One marketing page's structured data inputs: its breadcrumb trail below the
 * home page, and the FAQ the page renders and asserts.
 */
interface PageSchema {
  crumbs: readonly Crumb[];
  faq: readonly FaqSource[];
}

export const PAGE_SCHEMA = {
  // The identity page. Its FAQ is deliberately about the entity rather than the
  // product — who you are dealing with, which GeoCliks this is, who owns the
  // captures — because those are the questions an answer engine gets asked
  // about a vendor and cannot currently resolve from anywhere on this site.
  "/about": {
    crumbs: [{ name: "About" }],
    faq: [
      { keys: { question: "ab.faq.q1", answer: "ab.faq.a1" } },
      { keys: { question: "ab.faq.q2", answer: "ab.faq.a2" } },
      { keys: { question: "ab.faq.q3", answer: "ab.faq.a3" } },
      { keys: { question: "ab.faq.q4", answer: "ab.faq.a4" } },
      { keys: { question: "ab.faq.q5", answer: "ab.faq.a5" } },
      { keys: { question: "ab.faq.q6", answer: "ab.faq.a6" } },
    ],
  },
  "/pricing": {
    crumbs: [{ name: "Pricing" }],
    faq: [
      {
        question: "Is the free plan really free?",
        answer:
          "Yes, and it does not expire. Free covers 300 captures a month, three projects, one seat, two watermark templates, 30-second video clips for the first three days, and a PDF export of up to 20 photos. No card is asked for.",
      },
      {
        question: "What counts as a seat?",
        answer:
          "One person who can sign in to your workspace, whatever their role — the owner included. A pending invitation holds a seat until it is accepted or revoked, otherwise ten invites could be sent against two seats and everyone who accepted would be over the plan.",
      },
      {
        question: "Do paid plans verify photos better than the free one?",
        answer:
          "No. The watermark data, the photo code and the seal are identical on every plan. What you pay for is volume, video length, teamspace, exports, sharing and delivery routing — never the proof itself.",
      },
      {
        question: "Which plans include delivery routes?",
        answer:
          "Plus and above carry a monthly stop allowance, so you can run routes without leaving the evidence plans. If driving is most of the work, the Delivery plans cost far less per stop and add live dispatch, the smart optimizer and more drivers.",
      },
      {
        question: "How are delivery stops counted?",
        answer:
          "Per calendar month, resetting on the 1st. A stop counts when it is added to a route, whether or not it ends up delivered. Going over the allowance stops new route building until the next month, so pick the plan that covers your busiest week rather than your average one.",
      },
      {
        question: "Is there a trial on the Delivery plans?",
        answer:
          "Every Delivery plan starts with a free trial, which is why its button reads Free trial. The trial is once per workspace, not once per plan — moving from one Delivery plan to another bills straight away.",
      },
      {
        question: "Can I change plan later?",
        answer:
          "Any time, from Billing in your workspace settings, and only the owner can do it. Moving up applies immediately and nothing already captured is touched. Moving down is refused while your workspace is bigger than the target plan — you are asked to remove members first instead of three people being cut off silently.",
      },
      {
        question: "What happens to my photos if I cancel?",
        answer:
          "They are not deleted, and verification keeps working. The paid features stop: Excel, ZIP and KMZ exports, share links, teamspace and delivery routes. Export anything you need outside GeoCliks before you cancel — on Free you are back to a PDF of 20 photos.",
      },
      {
        question: "How is payment handled, and where are the invoices?",
        answer:
          "Through our payment processor over a hosted checkout — your card number never reaches GeoCliks' servers. Every payment produces an invoice in the billing portal, where you can also add your company name and tax details.",
      },
      {
        question: "What if we are bigger than Crew 25 or Fleet 500?",
        answer: `Then the plan is a conversation. Enterprise covers custom volumes, custom terms, and the governance a multi-site operation needs. Email ${SALES_EMAIL} with your team size, industry and regions and we will size it with you.`,
      },
    ],
  },
  "/alternatives/companycam": {
    crumbs: [{ name: "Alternatives" }, { name: "CompanyCam" }],
    faq: [
      { keys: { question: "cc.faq.q1", answer: "cc.faq.a1" } },
      { keys: { question: "cc.faq.q2", answer: "cc.faq.a2" } },
      { keys: { question: "cc.faq.q3", answer: "cc.faq.a3" } },
      { keys: { question: "cc.faq.q4", answer: "cc.faq.a4" } },
      { keys: { question: "cc.faq.q5", answer: "cc.faq.a5" } },
    ],
  },

  "/alternatives/timemark": {
    crumbs: [{ name: "Alternatives" }, { name: "Timemark" }],
    faq: [
      { keys: { question: "tm.faq.q1", answer: "tm.faq.a1" } },
      { keys: { question: "tm.faq.q2", answer: "tm.faq.a2" } },
      { keys: { question: "tm.faq.q3", answer: "tm.faq.a3" } },
      { keys: { question: "tm.faq.q4", answer: "tm.faq.a4" } },
      { keys: { question: "tm.faq.q5", answer: "tm.faq.a5" } },
    ],
  },
  "/construction-photo-documentation": {
    crumbs: [{ name: "Construction Photo Documentation" }],
    faq: [
      { keys: { question: "con.faq.q1", answer: "con.faq.a1" } },
      { keys: { question: "con.faq.q2", answer: "con.faq.a2" } },
      { keys: { question: "con.faq.q3", answer: "con.faq.a3" } },
      { keys: { question: "con.faq.q4", answer: "con.faq.a4" } },
      { keys: { question: "con.faq.q5", answer: "con.faq.a5" } },
    ],
  },
  "/proof-of-delivery": {
    crumbs: [{ name: "Proof of Delivery" }],
    faq: [
      { keys: { question: "pod.faq.q1", answer: "pod.faq.a1" } },
      { keys: { question: "pod.faq.q2", answer: "pod.faq.a2" } },
      { keys: { question: "pod.faq.q3", answer: "pod.faq.a3" } },
      { keys: { question: "pod.faq.q4", answer: "pod.faq.a4" } },
      { keys: { question: "pod.faq.q5", answer: "pod.faq.a5" } },
      { keys: { question: "pod.faq.q6", answer: "pod.faq.a6" } },
    ],
  },
  "/gps-timestamp-camera": {
    crumbs: [{ name: "GPS Timestamp Camera" }],
    faq: [
      { keys: { question: "gps.faq.q1", answer: "gps.faq.a1" } },
      { keys: { question: "gps.faq.q2", answer: "gps.faq.a2" } },
      { keys: { question: "gps.faq.q3", answer: "gps.faq.a3" } },
      { keys: { question: "gps.faq.q4", answer: "gps.faq.a4" } },
      { keys: { question: "gps.faq.q5", answer: "gps.faq.a5" } },
      { keys: { question: "gps.faq.q6", answer: "gps.faq.a6" } },
    ],
  },
  "/roofing-photo-documentation": {
    crumbs: [{ name: "Roofing Photo Documentation" }],
    faq: [
      { keys: { question: "rf.faq.q1", answer: "rf.faq.a1" } },
      { keys: { question: "rf.faq.q2", answer: "rf.faq.a2" } },
      { keys: { question: "rf.faq.q3", answer: "rf.faq.a3" } },
      { keys: { question: "rf.faq.q4", answer: "rf.faq.a4" } },
      { keys: { question: "rf.faq.q5", answer: "rf.faq.a5" } },
      { keys: { question: "rf.faq.q6", answer: "rf.faq.a6" } },
    ],
  },
  "/hvac-photo-documentation": {
    crumbs: [{ name: "HVAC Photo Documentation" }],
    faq: [
      { keys: { question: "hvac.faq.q1", answer: "hvac.faq.a1" } },
      { keys: { question: "hvac.faq.q2", answer: "hvac.faq.a2" } },
      { keys: { question: "hvac.faq.q3", answer: "hvac.faq.a3" } },
      { keys: { question: "hvac.faq.q4", answer: "hvac.faq.a4" } },
      { keys: { question: "hvac.faq.q5", answer: "hvac.faq.a5" } },
      { keys: { question: "hvac.faq.q6", answer: "hvac.faq.a6" } },
    ],
  },
  "/property-inspection-photos": {
    crumbs: [{ name: "Property Inspection Photos" }],
    faq: [
      { keys: { question: "inspection.faq.q1", answer: "inspection.faq.a1" } },
      { keys: { question: "inspection.faq.q2", answer: "inspection.faq.a2" } },
      { keys: { question: "inspection.faq.q3", answer: "inspection.faq.a3" } },
      { keys: { question: "inspection.faq.q4", answer: "inspection.faq.a4" } },
      { keys: { question: "inspection.faq.q5", answer: "inspection.faq.a5" } },
      { keys: { question: "inspection.faq.q6", answer: "inspection.faq.a6" } },
    ],
  },
} as const satisfies Record<string, PageSchema>;

/**
 * A page's FAQ, in one locale.
 *
 * Entries whose copy has been lifted into the translation catalogs carry `keys`
 * instead of literal strings, and are resolved here. The rest return their
 * English literals unchanged — a page keeps working the moment it is written and
 * becomes translatable when someone extracts its copy, rather than needing both
 * in the same change.
 *
 * Both the rendered FAQ and the `FAQPage` markup call this, which is the point:
 * the copy a visitor reads and the copy the page claims in its structured data
 * are the same strings in the same language. A Spanish page with English FAQ
 * markup is a mismatch Google is entitled to distrust.
 */
export function pageFaq(
  path: keyof typeof PAGE_SCHEMA,
  locale: LocaleCode = "en",
): readonly FaqEntry[] {
  return PAGE_SCHEMA[path].faq.map((entry) =>
    "keys" in entry
      ? {
          question: translate(locale, entry.keys.question),
          answer: translate(locale, entry.keys.answer),
        }
      : { question: entry.question, answer: entry.answer },
  );
}

/**
 * Structured data for a marketing or Help Center path, or none for a path that
 * gets none — the app shell, the auth pages and anything behind a token.
 *
 * `locale` is the language of the URL being served, so `/es/proof-of-delivery`
 * emits a Spanish `FAQPage`. It defaults to English, which is what every
 * unprefixed URL gets.
 *
 * The Help Center still resolves in English: its content catalog is English-only
 * and it has no locale URLs, so there is nothing else to resolve to yet.
 */
export function marketingJsonLd(pathname: string, locale: LocaleCode = "en"): object[] {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/") return homeSchema();

  if (path in PAGE_SCHEMA) {
    const page = PAGE_SCHEMA[path as keyof typeof PAGE_SCHEMA];
    const blocks = [
      faqSchema(pageFaq(path as keyof typeof PAGE_SCHEMA, locale).map((entry) => ({ ...entry }))),
      breadcrumbSchema(page.crumbs.map((crumb) => ({ ...crumb }))),
    ];
    // The About page carries the entity blocks as well: it is the page whose
    // subject *is* the company, and the home page is otherwise the only place
    // the Organization node is published.
    if (path === "/about") return [organizationSchema(), aboutPageSchema(), ...blocks];
    return blocks;
  }

  if (path === "/help") return [breadcrumbSchema([{ name: "Help Center" }])];

  if (path.startsWith("/help/")) return helpJsonLd(path.slice("/help/".length));

  return [];
}

/** `category` or `category/article` under /help, in English. */
function helpJsonLd(rest: string): object[] {
  const locale = asLocale("en");
  const [categorySlug, articleSlug, ...extra] = rest.split("/");
  if (!categorySlug || extra.length > 0) return [];

  if (!articleSlug) {
    const category = findCategory(locale, categorySlug);
    if (!category) return [];
    const articles = articlesOf(category);
    return [
      breadcrumbSchema([{ name: "Help Center", path: "/help" }, { name: category.title }]),
      // Each article's title is the problem and its summary is the one-line
      // answer, which is exactly a question/answer pair. Same mapping the page
      // itself uses.
      faqSchema(articles.map((article) => ({ question: article.title, answer: article.summary }))),
    ];
  }

  const found = findArticle(locale, categorySlug, articleSlug);
  if (!found) return [];
  const href = articleHref(found.category.slug, found.article.slug);
  return [
    breadcrumbSchema([
      { name: "Help Center", path: "/help" },
      { name: found.category.title, path: `/help/${found.category.slug}` },
      { name: found.article.title },
    ]),
    techArticleSchema({
      headline: found.article.title,
      description: found.article.summary,
      path: href,
      section: found.category.title,
    }),
  ];
}
