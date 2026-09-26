/**
 * Company facts printed on the legal pages. Kept in one place so the Terms and
 * the Privacy Policy can never drift apart — change a line here and both pages
 * follow. Supplied by the operator; swap LEGAL_ENTITY the day the registered
 * name changes.
 */
export const LEGAL_ENTITY = "GeoCliks";
export const COMPANY_ADDRESS = "34-18 Clearview Street, Moncton, NB, E1A 4H2, Canada";
export const JURISDICTION = "the Province of New Brunswick, Canada";
export const LEGAL_EFFECTIVE_DATE = "September 4, 2026";

/**
 * Profiles that are unmistakably this GeoCliks, for the Organization schema's
 * `sameAs`.
 *
 * Why a constant and not the `site.socials` row the footer renders: that row is
 * operator-editable and arrives from an async query, while the schema is built
 * synchronously and also server-side, where there is no query to await. More to
 * the point, `sameAs` is an identity claim rather than a list of links — a
 * half-filled or mistyped field in the admin should change the footer, not tell
 * Google which entity this is.
 *
 * It matters here more than on most sites: searching "geocliks" surfaces a
 * dissolved French SAS of the same name (SIREN 847 503 430) and a row of
 * lookalikes, so these are the strongest available signal that the site, the
 * profiles and the product are one entity.
 *
 * Keep every entry live and actually ours. Add the App Store and Play Store
 * listing URLs here the day each goes public — a store page naming the brand is
 * a better disambiguator than either social profile.
 */
export const BRAND_PROFILES = [
  "https://www.facebook.com/geocliks",
  "https://www.linkedin.com/company/geo-cliks",
];
