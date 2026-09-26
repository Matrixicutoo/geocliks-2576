/**
 * Schema.org builders for the public pages.
 *
 * Kept separate from `seo.ts` because these describe GeoCliks specifically,
 * while that hook is generic plumbing. Each function returns a plain object
 * which `useSeo({ jsonLd })` serializes into the head.
 *
 * Everything here is asserted about the product, so keep it true — structured
 * data that contradicts the visible page is a manual-action risk, not a ranking
 * shortcut. Notably absent: `aggregateRating` and `review`, which need real
 * collected ratings, and `SearchAction`, which needs a search results URL the
 * site does not have (Help Center search is client-side, with no shareable
 * query URL).
 */
import { BRAND_PROFILES, LEGAL_ENTITY } from "./company";
// From `seo-routes` rather than the `seo` hook module, which re-exports the same
// two values: that keeps this file React-free, so the server-side HTML injector
// can build blocks from it without pulling React into the server.
import { SITE_URL, absoluteUrl } from "./seo-routes";

/**
 * `COMPANY_ADDRESS` in company.ts as the parts schema.org wants. Edit both
 * together — that constant is what the legal pages print.
 */
const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "34-18 Clearview Street",
  addressLocality: "Moncton",
  addressRegion: "NB",
  postalCode: "E1A 4H2",
  addressCountry: "CA",
} as const;

/**
 * The publisher. `@id` is a stable node reference so the other blocks can point
 * at this one instead of restating it.
 *
 * `sameAs` and `foundingLocation` are here to settle a name collision rather
 * than to decorate the block: "geocliks" as a query is dominated by a dissolved
 * French SAS of the same name, so the profiles and the place are what tie this
 * entity to this site. No `foundingDate` — the real one is not recorded anywhere
 * in this repo, and a guessed date is worse than an absent field.
 */
export function organizationSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: LEGAL_ENTITY,
    url: SITE_URL,
    logo: absoluteUrl("/icon-512.png"),
    image: absoluteUrl("/og-image.png"),
    description:
      "GeoCliks makes tamper-proof photo documentation for field teams — network-verified time, GPS coordinates and street address stamped on every capture.",
    address: POSTAL_ADDRESS,
    sameAs: BRAND_PROFILES,
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: POSTAL_ADDRESS.addressLocality,
        addressRegion: POSTAL_ADDRESS.addressRegion,
        addressCountry: POSTAL_ADDRESS.addressCountry,
      },
    },
  };
}

/**
 * The product itself. `AggregateOffer` with `lowPrice: 0` is the accurate shape:
 * there is a genuine free-forever tier, and paid tiers above it.
 */
export function softwareApplicationSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#software`,
    name: "GeoCliks",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Field service documentation",
    operatingSystem: "iOS, Android, Web",
    url: SITE_URL,
    image: absoluteUrl("/og-image.png"),
    description:
      "Tamper-proof field photos with network-verified time, GPS coordinates and street address — synced to your crew's Teamspace and exported as closeout reports.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "0",
      offerCount: "5",
    },
  };
}

/** Both home-page blocks, in the order they should appear. */
export const homeSchema = (): object[] => [organizationSchema(), softwareApplicationSchema()];

/**
 * `/about` as an AboutPage whose `mainEntity` is the Organization node.
 *
 * This is the one page whose job is the entity rather than the product, so it
 * is the page that should say "this URL is about that company" in a form a
 * knowledge graph reads. It is emitted alongside a full `organizationSchema()`
 * — the home page is otherwise the only place the Organization node exists, and
 * an About page that references an `@id` no crawler fetched resolves to nothing.
 */
export function aboutPageSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${absoluteUrl("/about")}#page`,
    url: absoluteUrl("/about"),
    name: `About ${LEGAL_ENTITY}`,
    primaryImageOfPage: absoluteUrl("/og-image.png"),
    mainEntity: { "@id": `${SITE_URL}/#organization` },
    about: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export interface Crumb {
  name: string;
  /** Site-relative path. Omit on the current page — the last crumb needs no link. */
  path?: string;
}

/**
 * Breadcrumbs for the nested Help Center URLs, so search results show
 * "Help › Troubleshoot › Photos are not uploading" instead of a bare URL.
 */
export function breadcrumbSchema(crumbs: Crumb[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      ...(crumb.path ? { item: absoluteUrl(crumb.path) } : {}),
    })),
  };
}

/**
 * One help article. `TechArticle` rather than `Article` — these are product
 * documentation, not editorial, and it is the type Google's own developer docs
 * use for the same shape of content.
 */
export function techArticleSchema(input: {
  headline: string;
  description: string;
  path: string;
  section: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: input.headline,
    description: input.description,
    url: absoluteUrl(input.path),
    articleSection: input.section,
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", name: "GeoCliks Help Center", url: absoluteUrl("/help") },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/**
 * A help category as question-and-answer pairs, built from each article's title
 * and its one-sentence summary.
 *
 * Note on expectations: since 2023 Google shows FAQ rich results only for
 * authoritative government and health sites, so this will not add accordions to
 * the search listing. It stays because it is accurate structure that helps
 * search engines understand what the page answers.
 */
export function faqSchema(entries: Array<{ question: string; answer: string }>): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}
