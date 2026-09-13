/**
 * Meta descriptions for the public pages.
 *
 * English only, unlike the rest of the site's copy, and that is deliberate: a
 * meta description is never shown to a visitor, only to a crawler building a
 * search snippet, and a crawler arrives with no stored language preference and
 * renders the site in its default locale. Eleven translations of a string no
 * human reads would be maintenance for nothing.
 *
 * Page *titles* are the opposite case — they show in the browser tab, so they
 * come from `useT()` like any other visible string. English is what a crawler
 * gets from those too, since English is the default locale.
 *
 * Help Center descriptions are absent on purpose: each article carries its own
 * `summary` in the content catalog, already translated.
 *
 * Keep these under ~155 characters. Google truncates past that, and rewrites
 * the description entirely when it reads as boilerplate.
 */

export const SEO_DESCRIPTIONS = {
  home: "Tamper-proof job photos for field crews. Network-verified time, GPS and street address on every capture, synced to your team and exported as closeout reports.",

  getApp:
    "Install GeoCliks on your crew's phones. Capture verified job photos offline, and they upload themselves the moment signal comes back.",

  help: "Guides for capturing verified photos, running delivery routes, managing your Teamspace, exports, billing and troubleshooting.",

  terms:
    "The agreement covering your use of the GeoCliks apps and services: accounts, workspaces, evidence, share links and exports.",

  privacy:
    "What GeoCliks collects, why, how long it is kept, and the choices you have. Covers photo metadata, location and delivery tracking.",
} satisfies Record<string, string>;
