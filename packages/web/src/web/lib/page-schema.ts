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
    {
      question: "Who is behind GeoCliks?",
      answer:
        "GeoCliks is a Canadian company registered at 34-18 Clearview Street, Moncton, NB, E1A 4H2, and its terms are governed by the law of the Province of New Brunswick. It builds one thing: verified photo and video documentation for field teams, on iOS, Android and the web from a single account.",
    },
    {
      question: "Is this the same GeoCliks as the French company?",
      answer:
        "No, and the confusion is reasonable. A French SAS called GeoCliks, since dissolved, still appears in search results for the name and has no connection to this company or this product. The GeoCliks that publishes this site and the app is the New Brunswick company named above.",
    },
    {
      question: "Who owns the photos and the data?",
      answer:
        "The workspace does. GeoCliks stores and processes captures on the workspace's behalf, and removing a member does not delete the captures they made — the evidence record belongs to the workspace, by design. Deleting your own account removes your profile and credentials; captures you made inside a workspace you do not own stay with that workspace.",
    },
    {
      question: "Is verification actually the same on the free plan?",
      answer:
        "Yes. The watermark data, the photo code and the seal are identical on the free plan and on the largest paid one. Paid plans buy volume, seats, video length, exports, sharing and delivery routing — never a stronger proof. A photo code issued on the free plan still resolves after you stop paying.",
    },
    {
      question: "Can GeoCliks guarantee that a court or an insurer accepts a photo?",
      answer:
        "No, and nobody honestly can. GeoCliks is not a law firm, a notary or an expert witness, and whether a court, an insurer or a card network accepts a record is their decision. What it can do is make the record specific and independently checkable, so the argument is about the evidence rather than about whether you can produce any.",
    },
    {
      question: "What languages does GeoCliks work in?",
      answer:
        "The app and the Help Center run in eleven languages — English, French (Canada), Spanish, Portuguese (Brazil), German, Italian, Polish, Arabic, Vietnamese, Tagalog and Chinese — with a banner on any help article whose body is still English. The search landing pages on this site are English-only on purpose.",
    },
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
      answer:
        `Then the plan is a conversation. Enterprise covers custom volumes, custom terms, and the governance a multi-site operation needs. Email ${SALES_EMAIL} with your team size, industry and regions and we will size it with you.`,
    },
    ],
  },
  "/alternatives/companycam": {
    crumbs: [{ name: "Alternatives" }, { name: "CompanyCam" }],
    faq: [
    {
      question: "What is the actual difference between GeoCliks and CompanyCam?",
      answer:
        "CompanyCam is a shared photo feed for construction teams, and a good one. GeoCliks is built around proving a photo, so the verification layer goes further: the timestamp is checked against our servers rather than read off the phone, the street address is written in alongside the coordinates, and every capture gets a code anyone can check independently at geocliks.com/verify. If your photos are mainly for coordination, that layer is overhead. If they get disputed, it is the whole point.",
    },
    {
      question: "Is GeoCliks cheaper than CompanyCam?",
      answer:
        "For most teams, yes, and the shape of the bill differs more than the number. CompanyCam prices per user on top of a plan minimum — from $63 a month for one user, plus $29 for each additional. GeoCliks charges a flat monthly price with the seats included: $7 for one person, $45 for ten, $105 for twenty-five. There is also a free plan that covers 300 verified photos a month.",
    },
    {
      question: "Can I move my CompanyCam photo history into GeoCliks?",
      answer:
        "There is no automated import today. You can export your photos from CompanyCam and keep that archive, and most teams switch by running GeoCliks on new jobs from a chosen date while the old projects stay where they are. One thing to be clear about: photos imported from anywhere else cannot be network-verified after the fact, because the verification happens at capture. An imported photo is a photo, not a GeoCliks-sealed capture.",
    },
    {
      question: "Do I have to move the whole crew at once?",
      answer:
        "No. Seats are included in the plan rather than billed individually, so you can put one crew on GeoCliks for a job, keep everyone else where they are, and decide afterwards.",
    },
    {
      question: "Does GeoCliks do everything CompanyCam does?",
      answer:
        "Not everything. CompanyCam has grown into adjacent territory — on-site payments, marketing tools, e-signature, room measurement, AI captioning. GeoCliks does not do those and is not trying to. It does photo and video evidence, Teamspace, reports and delivery routes. If you want the photo app to also be the CRM, CompanyCam is the broader product.",
    },
    ],
  },
  "/alternatives/timemark": {
    crumbs: [{ name: "Alternatives" }, { name: "Timemark" }],
    faq: [
    {
      question: "What is the actual difference between GeoCliks and Timemark?",
      answer:
        "Less than most comparison pages would claim. Both take the capture time from a network rather than the phone, both issue a per-photo code, and both let anyone check that code on the web without the app. Three differences are real. A GeoCliks code is on every capture on every plan, while Timemark's Photo Code is a feature to enable — their own FAQ answers a failed verification by telling you to switch it on. A GeoCliks seal covers the image bytes with a SHA-256 hash and an HMAC-SHA256 signature over the metadata, while Timemark's help notes that editing a photo's watermark after capture leaves its Photo Code unchanged. And GeoCliks charges flat monthly bands with the seats included rather than per user.",
    },
    {
      question: "Is GeoCliks cheaper than Timemark?",
      answer:
        "It depends entirely on how many people you are paying for. Timemark prices per user — $5 a month on Plus, $7 on Business — so one person is cheaper there than the $7 a GeoCliks solo plan costs. GeoCliks charges flat bands with the seats in them: $25 for Business, $45 for ten seats, $105 for twenty-five. Ten seats is therefore $70 a month on their Business plan against $45 here, and the gap widens with the crew. Both have a free plan: 300 verified photos a month here, 100 photos in Teamspace there.",
    },
    {
      question: "Can I move my Timemark photos into GeoCliks?",
      answer:
        "Not as verified captures, and that is a property of how verification works rather than a missing feature. A photo is sealed at the moment it is taken, using the server's time and a hash of the bytes as they arrive, so nothing imported afterwards can be given that seal honestly. You can keep your Timemark archive and export from it as normal. Teams switching usually pick a date, capture new jobs in GeoCliks from then on, and leave the old projects where they are.",
    },
    {
      question: "Is Timemark's photo code the same as a GeoCliks photo code?",
      answer:
        "They do the same job — a short string on the image that a third party can type into the vendor's site to see the recorded time and place — and Timemark's is 14 characters to our shorter one. The difference is what the code is bound to. Ours is signed together with a SHA-256 hash of the image bytes, so an altered file no longer matches the record the code points at. Theirs maps to the capture record, and their help centre states that editing the watermark after capture does not change the code, while their paid plans offer editing or removing that watermark.",
    },
    {
      question: "Why would I pick Timemark over GeoCliks?",
      answer:
        "Two honest reasons. If you are one person and want the cheapest verified-photo app, their Plus plan undercuts us by two dollars a month. And if you need breadth more than depth, they ship things this product does not: digital checklists, time tracking, KML map overlays, OneDrive and SharePoint backup, and an interface in ten languages. What you would be giving up is a code that is on before you need it, a seal over the image bytes, and flat pricing at crew size.",
    },
    ],
  },
  "/construction-photo-documentation": {
    crumbs: [{ name: "Construction Photo Documentation" }],
    faq: [
    {
      question: "Is a GeoCliks timestamp different from my phone's built-in one?",
      answer:
        "Yes. A phone's timestamp comes from the device clock, and a device clock can be changed in settings — which is exactly what gets pointed out when a photo's date matters. GeoCliks verifies the time against our servers when the capture arrives. If the device clock disagrees with ours by more than a few minutes, the capture is marked device-timed instead of verified, rather than quietly passing as verified.",
    },
    {
      question: "Does it work without cell signal on a job site?",
      answer:
        "Yes. Captures are queued on the phone and upload themselves when the crew is back in range. A queued capture is sealed as network-verified at the moment it reaches our servers.",
    },
    {
      question: "Can a client verify a photo without a GeoCliks account?",
      answer:
        "Yes. Every capture carries a unique photo code, and anyone can enter it at geocliks.com/verify — no account, no app, no sign-in. That is the point: verification a client has to take your word for is not verification.",
    },
    {
      question: "What actually stops someone editing the photo afterwards?",
      answer:
        "Each capture is stored with a SHA-256 content hash and a signature, and every event affecting it is written to an append-only record. An edited copy no longer matches its hash, so the verification page reports it as altered rather than as the original.",
    },
    {
      question: "Does GeoCliks make a photo legally admissible?",
      answer:
        "No, and no software honestly can. GeoCliks is not a notary or a legal service, and whether a court, insurer or GC accepts a record is their decision. What it does is make undetected tampering hard and give a third party a way to check a photo independently.",
    },
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
    {
      question: "What photos does an insurance adjuster usually want on a roof claim?",
      answer:
        "Practice varies by carrier, but the recurring pattern is overview shots that identify the property, close-ups of the damage with something for scale, the same planes photographed after the work, and dates that put those two sets in order. The part roofers lose on is rarely the photography — it is that the dates come from a phone and the carrier has no way to check them.",
    },
    {
      question: "Does GeoCliks measure the roof or produce an estimate?",
      answer:
        "No. It does not measure squares, generate a diagram, or produce an Xactimate or similar estimate, and it will not replace the measurement tool you already use. It documents and verifies what was there and what you did, which is the part those tools do not do.",
    },
    {
      question: "Can I prove the damage predates my repair?",
      answer:
        "You can show a photo whose capture time was verified against our servers rather than read from your phone, sealed with a content hash so a later edit is detectable, with a code the carrier can look up independently. That is a substantially stronger record than a camera-roll photo. Whether a specific carrier accepts it is still their decision — GeoCliks is not an insurance or legal service and cannot promise a claim outcome.",
    },
    {
      question: "Does it work up on a roof with no signal?",
      answer:
        "Yes. Captures queue on the phone and upload when you are back in range, and the recorded time is the moment of capture, not of upload. GPS is read on the roof, so the stamp is the property you were standing on.",
    },
    {
      question: "Can the homeowner see the photos?",
      answer:
        "You choose. Share a link to a set, or hand over a photo code so they can verify a single image on the public page. Neither requires them to install anything or create an account.",
    },
    {
      question: "How is this different from the construction documentation page?",
      answer:
        "Same product, different argument. A general contractor is usually documenting against a client dispute over progress and scope; a roofer is usually documenting against an adjuster who needs a dated before and a dated after of the same plane. The before/after pairing and the export format matter more here, which is why this page exists separately.",
    },
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
    {
      question: "Why not just use the phone camera for inspection photos?",
      answer:
        "Because a phone photo carries the date the phone claims, and a phone's clock and photo metadata can both be changed in about fifteen seconds. In a deposit dispute the date is usually the only contested fact, so the one number you most need to rely on is the one a camera roll gives you no reason to trust. GeoCliks verifies capture time against our servers instead.",
    },
    {
      question: "Will this hold up in a deposit dispute or at small claims?",
      answer:
        "Weighing evidence is the adjudicator's job and deposit rules differ by state and province, so nobody can honestly promise you an outcome. What changes is the quality of what you bring: a set of photos with server-verified times, resolved addresses and tamper-evident seals, which the other side can check themselves on a public page. That is a materially stronger record than an export from a camera roll.",
    },
    {
      question: "Can the tenant see and check the photos?",
      answer:
        "Yes, and it is worth doing. Share the move-in set at move-in. They verify any capture with its code on a public page — no account, no app — and see the same verified date and address you do. Agreeing on the record at the start is what stops the argument at the end.",
    },
    {
      question: "What if the unit has no signal, or it's a basement?",
      answer:
        "Captures queue on the phone and seal when they reach our servers, and the time recorded is the moment of capture, not the moment of upload. GPS is read at capture too, so a basement or an interior corridor still stamps the building's location rather than wherever the phone got signal back.",
    },
    {
      question: "Is this a lease management or inspection-checklist tool?",
      answer:
        "No. There is no lease, no rent ledger, no accounting and no room-by-room checklist form to fill in. GeoCliks is the photo documentation layer, and it is built to sit alongside whichever property management system you already run.",
    },
    {
      question: "How long are the photos kept?",
      answer:
        "For as long as your workspace is active — which matters here, because a deposit dispute can surface a year after the tenant moved in. Export a full set to PDF, Excel or ZIP whenever you want your own copy outside the system.",
    },
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
      faqSchema(
        articles.map((article) => ({ question: article.title, answer: article.summary })),
      ),
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
