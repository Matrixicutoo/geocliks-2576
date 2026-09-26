/**
 * The one table of per-route titles and meta descriptions.
 *
 * Read by three callers, which is the point of it being data rather than JSX:
 *  - the page components, through `useSeo`, for the head a browser ends up with;
 *  - `seo-html.ts`, which bakes the same copy into the HTML *response* so a
 *    crawler that never runs JavaScript reads it too;
 *  - the dev-time integrity check in `../help/resolve.ts`, which fails the build
 *    when a help article ships without its own copy.
 *
 * English is the default and the fallback. The copy here is what an unprefixed
 * URL carries, and what any page with no translated head copy carries in every
 * language.
 *
 * A translated page needs more than that. `/es/proof-of-delivery` renders in
 * Spanish, so a Spanish `<title>` and description are what Google should build
 * its snippet from — an English snippet over a Spanish page undoes most of what
 * translating it was for. `LOCALIZED_SEO` below names the catalog keys for the
 * paths that have them, and `seoForPath` takes the locale to resolve.
 *
 * House rules, from the SEO audit: titles at or under ~60 characters, so they
 * are not cut off in a result; descriptions 140–160, because Google truncates
 * past that and rewrites anything that reads as boilerplate; and every row
 * unique, which is the whole reason this file exists — ~68 pages previously
 * shipped the home page's title and description.
 */

import type { LocaleCode } from "../../api/lib/locales";
import { type TKey, translate } from "./catalogs";

/** Canonical origin. No trailing slash — every helper here appends its own path. */
export const SITE_URL = "https://geocliks.com";

/** Absolute URL for a site-relative path, for canonical and og:url. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export interface RouteSeoCopy {
  /** Full `<title>`. No suffix is appended anywhere. */
  title: string;
  /** `<meta name="description">`. */
  description: string;
}

/** The public marketing pages, keyed by pathname. */
export const PAGE_SEO = {
  "/": {
    title: "GeoCliks — Tamper-Proof Photo Documentation for Field Teams",
    description:
      "GeoCliks stamps every field photo with network-verified time, GPS and street address, then locks it with a code. Export closeout reports.",
  },

  "/get-app": {
    title: "Download GeoCliks — GPS Timestamp Camera App",
    description:
      "Get the GeoCliks app for iOS and Android. Network-verified time, GPS and address on every photo, tamper-proof and free to capture.",
  },

  // Its own page since the plans outgrew a home-page section. The title leads with
  // "Pricing" because that is the word in the query, and the description carries the
  // two numbers that decide the click: free, and where paid starts.
  "/pricing": {
    title: "GeoCliks Pricing — Plans for Crews and Delivery Fleets",
    description:
      "Verified photo capture free forever. Unlimited photos and full-length video from $7 a month, teamspace crews from $25, and delivery routes priced by stop.",
  },

  "/help": {
    // "Help Center" in full put this at 61 characters; "Help" keeps all three
    // audiences and lands inside the 60-character rule.
    title: "GeoCliks Help — Guides for Solo Users, Teams & Drivers",
    description:
      "Setup guides, troubleshooting and how-tos for GeoCliks: getting started, the mobile app, Teamspace, delivery routes, plans and billing.",
  },

  // Search-landing pages. The copy here is the English row; a page that has
  // been translated also has a `LOCALIZED_SEO` entry below, and its ten other
  // titles and descriptions live in the catalogs with the rest of its copy.
  "/construction-photo-documentation": {
    title: "Construction Photo Documentation Software | GeoCliks",
    description:
      "GPS- and time-stamped construction photos your crew can't fake and clients can verify. Teamspace sync, closeout reports and a verified code per shot.",
  },

  "/alternatives/companycam": {
    title: "GeoCliks vs CompanyCam — Compare Features & Pricing",
    description:
      "See how GeoCliks compares to CompanyCam on tamper-proof timestamps, GPS verification, pricing and team features, with what each one does not do.",
  },

  // The nearest competitor, so the description leads with the thing the query
  // is really asking: both verify, so what is left to choose between.
  "/alternatives/timemark": {
    title: "GeoCliks vs Timemark — Compare Verification & Pricing",
    description:
      "Both verify photo time against a network. Compare what each seal actually covers, whether the photo code is on by default, and how per-seat and flat pricing differ.",
  },

  // The five use-case pages. Each one owns a distinct query with its own intent,
  // which is the reason they are separate pages and not sections of the home
  // page: "gps timestamp camera" is someone looking for a tool, "proof of
  // delivery" is someone with a chargeback, and a single page cannot rank as the
  // best answer to both. Deliberately no `/tamper-proof-photo-documentation`
  // page — that phrase is the home page's own H1 and the construction page's
  // subject, and a third page on it would split the same signal three ways.
  "/proof-of-delivery": {
    title: "Proof of Delivery App — Photo, GPS & Verified Time",
    description:
      "Capture proof of delivery couriers can't backdate: network-verified time, GPS and street address on every drop photo, with a code the shipper can check.",
  },

  "/gps-timestamp-camera": {
    title: "GPS Timestamp Camera App — Verified Time & Location",
    description:
      "A timestamp camera that verifies the time against the network instead of the phone clock, and stamps GPS coordinates and street address into every photo.",
  },

  "/roofing-photo-documentation": {
    title: "Roofing Photo Documentation for Claims & Closeouts",
    description:
      "Document roof damage and replacement with verified time, GPS and street address on every photo, paired before and after for adjusters and homeowners.",
  },

  "/hvac-photo-documentation": {
    title: "HVAC Photo Documentation & Service Call Proof",
    description:
      "Prove the technician arrived, what the equipment looked like, and that the install was finished — verified time, GPS and address on every service photo.",
  },

  "/property-inspection-photos": {
    title: "Property Inspection Photo App — Verified Move-In Proof",
    description:
      "Move-in and move-out inspection photos with verified time, GPS and unit address, so a deposit dispute turns on the record instead of on whose word it is.",
  },

  // Field Notes. The index and the method page are static, so they key here;
  // the posts themselves are resolved from the catalog in `seoForPath` below,
  // because a per-slug row here would be a second place to forget to update.
  "/blog": {
    title: "GeoCliks Field Notes — Verified Field Photo Answers",
    description:
      "Straight answers on verified field photos: what makes one tamper-proof, whether GPS timestamps can be faked, what documentation software costs, and what proof of delivery needs.",
  },

  "/blog/method": {
    title: "Field Notes Method — How These Answers Are Written",
    description:
      "The six rules behind every Field Notes post: topics chosen from demand data, the answer in the first three lines, published numbers only, and no competitor named or ranked.",
  },

  // The identity page. Title leads with the entity name rather than "About"
  // because the query it has to win is "geocliks" itself, against a dissolved
  // French SAS of the same name — see the note in `company.ts`.
  "/about": {
    title: "About GeoCliks — The Company Behind the Photo Seal",
    description:
      "Who GeoCliks is: a Moncton, New Brunswick company building verified field photo documentation. How the seal works, what we will not claim, and how to reach us.",
  },

  "/terms": {
    title: "Terms of Service — GeoCliks",
    description:
      "The terms governing your use of the GeoCliks mobile app, website, desktop app and related services. Read what GeoCliks is — and isn't.",
  },

  "/privacy": {
    title: "Privacy Policy — GeoCliks",
    description:
      "How GeoCliks collects, stores and protects your photos, GPS data and account information. Your workspace data stays yours.",
  },

  "/delete-account": {
    title: "Delete Your GeoCliks Account",
    description:
      "How to delete your GeoCliks account and its data from the app or the website, what is removed, and what is kept.",
  },
} satisfies Record<string, RouteSeoCopy>;

/**
 * Head copy in the other ten languages, for the paths that have it.
 *
 * A path appears here once its page is translated, alongside its entry in
 * `LOCALIZED_PATHS` — the same rule, for the same reason: a Spanish title on a
 * page that renders English would describe something the visitor never sees.
 *
 * Keys rather than strings, so the eleven values live in the eleven catalogs
 * with the rest of the page's copy and the missing-key typecheck covers them
 * too. English still resolves from `PAGE_SEO` above, so the unprefixed URL is
 * untouched by anything here.
 */
export const LOCALIZED_SEO: Record<string, { title: TKey; description: TKey }> = {
  "/": { title: "seo.home.title", description: "seo.home.description" },
  "/get-app": { title: "seo.getApp.title", description: "seo.getApp.description" },
  "/proof-of-delivery": { title: "seo.pod.title", description: "seo.pod.description" },
  "/gps-timestamp-camera": { title: "seo.gps.title", description: "seo.gps.description" },
};

/**
 * Help Center copy, keyed the way the content catalog keys itself: a category is
 * its slug, an article is "category/slug".
 *
 * Separate from the article `summary` in `../help/content`, and not a
 * replacement for it: the summary is visible copy, translated into every locale
 * and written to read well in a list. These are search snippets, written for
 * intent and for length, and only ever served in English.
 */
export const HELP_SEO = {
  // ── Categories ───────────────────────────────────────────────────────────
  "getting-started": {
    title: "Getting Started with GeoCliks",
    description:
      "New to GeoCliks? Learn what it does, create your account, install the app, and set up as a solo user, team owner or crew member.",
  },
  "mobile-app": {
    title: "Using the GeoCliks Mobile App",
    description:
      "How to sign in, take a photo, record video, capture offline, and manage app settings on the GeoCliks mobile app.",
  },
  teamspace: {
    title: "GeoCliks Teamspace — Projects, Photos & Reports",
    description:
      "Manage projects, browse and filter photos, compare before/after, export reports and control who sees what in your Teamspace.",
  },
  "delivery-routes": {
    title: "Delivery Routes & Proof of Delivery — GeoCliks",
    description:
      "Build routes, assign drivers, dispatch live, and capture GPS- and time-verified proof of delivery at every stop.",
  },
  verify: {
    title: "Verifying a GeoCliks Photo",
    description:
      "What a photo code is, how to verify a locked photo, and how GeoCliks' network-verified sealing works.",
  },
  "plans-billing": {
    title: "GeoCliks Plans & Billing",
    description:
      "Compare plans, see delivery plan options, upgrade, manage seats, and handle invoices and cancellations.",
  },
  troubleshoot: {
    title: "Troubleshooting GeoCliks",
    description:
      "Fixes for upload failures, wrong GPS/address, sign-in issues, two-factor problems, failed exports and missing notifications.",
  },
  legal: {
    title: "GeoCliks Legal & Data Policies",
    description:
      "Plain-language summaries of data ownership, data retention, privacy and terms for GeoCliks users.",
  },

  // ── Getting started ──────────────────────────────────────────────────────
  "getting-started/what-is-geocliks": {
    title: "What Is GeoCliks?",
    description:
      "GeoCliks in plain terms: tamper-proof, GPS- and time-stamped photo documentation for field teams, synced to a shared Teamspace.",
  },
  "getting-started/create-your-account": {
    title: "Create Your GeoCliks Account",
    description:
      "Step-by-step: sign up for GeoCliks and get your workspace ready in under two minutes.",
  },
  "getting-started/install-the-app": {
    title: "Install the GeoCliks App",
    description: "Download and install GeoCliks on iOS or Android and sign in for the first time.",
  },
  "getting-started/for-solo-user": {
    title: "GeoCliks for Solo Users",
    description:
      "Using GeoCliks on your own — no team, no Teamspace setup required. Just tamper-proof photos when you need them.",
  },
  "getting-started/for-team-owner": {
    title: "GeoCliks for Team Owners",
    description:
      "Set up a Teamspace, invite your crew, assign roles and start collecting verified photos across every job.",
  },
  "getting-started/for-crew-member": {
    title: "GeoCliks for Crew Members",
    description:
      "Joining a GeoCliks Teamspace as a crew member: what you can capture, see and share.",
  },

  // ── Mobile app ───────────────────────────────────────────────────────────
  "mobile-app/sign-in-on-mobile": {
    title: "Signing In on the GeoCliks Mobile App",
    description:
      "How to sign in to GeoCliks on your phone, including switching accounts and workspaces.",
  },
  "mobile-app/take-a-photo": {
    title: "Taking a Photo in GeoCliks",
    description:
      "How the GeoCliks camera stamps time, GPS and address on every photo before it's locked.",
  },
  "mobile-app/record-a-video": {
    title: "Recording Video in GeoCliks",
    description:
      "Capture network-verified video with the same tamper-proof timestamp and location data as GeoCliks photos.",
  },
  "mobile-app/offline-capture-and-queue": {
    title: "Capturing Photos Offline in GeoCliks",
    description:
      "GeoCliks works with no signal — how offline capture and the upload queue keep your evidence intact.",
  },
  "mobile-app/assign-capture-to-project": {
    title: "Assigning a Capture to a Project",
    description: "How to file a GeoCliks photo or video under the right project as you shoot it.",
  },
  "mobile-app/watermark-templates": {
    title: "GeoCliks Watermark Templates",
    description:
      "Add a branded, informative watermark to your photos — what templates are and how to use one.",
  },
  "mobile-app/switch-template": {
    title: "Switching Watermark Templates",
    description: "Change which watermark template GeoCliks applies to new captures.",
  },
  "mobile-app/photo-quality-and-storage": {
    title: "Photo Quality & Storage in GeoCliks",
    description: "How GeoCliks balances photo quality against device storage and upload size.",
  },
  "mobile-app/notifications": {
    title: "Managing GeoCliks Notifications",
    description: "Control which alerts GeoCliks sends to your phone.",
  },
  "mobile-app/app-settings": {
    title: "GeoCliks App Settings",
    description:
      "Where to find and change account, capture and notification settings in the GeoCliks app.",
  },

  // ── Teamspace ────────────────────────────────────────────────────────────
  "teamspace/teamspace-overview": {
    title: "Teamspace Overview — GeoCliks",
    description:
      "What a GeoCliks Teamspace is and how your crew's photos, projects and reports live in one place.",
  },
  "teamspace/create-a-project": {
    title: "Creating a Project in GeoCliks",
    description: "Set up a new project in your Teamspace to organize captures by job site.",
  },
  "teamspace/browse-and-filter-photos": {
    title: "Browsing & Filtering Photos in GeoCliks",
    description:
      "Find any photo fast — filter your Teamspace by project, date, location or crew member.",
  },
  "teamspace/map-view": {
    title: "GeoCliks Map View",
    description: "See every captured photo plotted by its verified GPS location across a project.",
  },
  "teamspace/before-after-compare": {
    title: "Before/After Photo Comparison in GeoCliks",
    description:
      "Pair verified photos to show job progress or dispute-proof before/after evidence.",
  },
  "teamspace/reports-and-exports": {
    title: "Exporting Closeout Reports from GeoCliks",
    description:
      "Turn a project's verified photos into a professional closeout report, ready to share with clients.",
  },
  "teamspace/share-links": {
    title: "Sharing GeoCliks Photos with a Link",
    description:
      "Create a share link so clients or partners can view verified photos without a GeoCliks account.",
  },
  "teamspace/invite-your-crew": {
    title: "Inviting Your Crew to GeoCliks",
    description: "Add crew members to your Teamspace and control what they can capture and see.",
  },
  "teamspace/roles-and-permissions": {
    title: "GeoCliks Roles & Permissions",
    description: "What team owners, admins and crew members can each do inside a Teamspace.",
  },
  "teamspace/messages-and-broadcasts": {
    title: "Messages & Broadcasts in GeoCliks",
    description: "Send updates to your whole crew or a single project team from inside GeoCliks.",
  },
  "teamspace/watermark-template-library": {
    title: "GeoCliks Watermark Template Library",
    description: "Browse, create and manage the watermark templates available to your Teamspace.",
  },

  // ── Delivery routes ──────────────────────────────────────────────────────
  "delivery-routes/delivery-overview": {
    title: "GeoCliks Delivery Routes Overview",
    description:
      "How GeoCliks handles route planning, driver dispatch and GPS-verified proof of delivery.",
  },
  "delivery-routes/create-a-route": {
    title: "Creating a Delivery Route in GeoCliks",
    description: "Build a new delivery route and add stops in GeoCliks.",
  },
  "delivery-routes/add-stops-by-pasting-a-list": {
    title: "Adding Stops by Pasting a List",
    description: "Paste a list of addresses straight into GeoCliks to build a route in seconds.",
  },
  "delivery-routes/geocoding-and-fixing-addresses": {
    title: "Geocoding & Fixing Addresses in GeoCliks",
    description:
      "How GeoCliks geocodes addresses and what to do when one doesn't resolve correctly.",
  },
  "delivery-routes/optimize-stop-order": {
    title: "Optimizing Stop Order in GeoCliks",
    description: "Let GeoCliks reorder a route's stops for the fastest driver run.",
  },
  "delivery-routes/assign-a-driver": {
    title: "Assigning a Driver to a Route",
    description: "How to assign a route to a driver and notify them in GeoCliks.",
  },
  "delivery-routes/live-dispatch": {
    title: "Live Dispatch in GeoCliks",
    description: "Track a driver's run in real time and manage a route as it happens.",
  },
  "delivery-routes/driver-run-and-proof-of-delivery": {
    title: "Proof of Delivery in GeoCliks",
    description:
      "How drivers capture GPS- and time-verified proof of delivery at every stop, no signal required.",
  },
  "delivery-routes/failed-and-skipped-stops": {
    title: "Handling Failed & Skipped Stops",
    description: "What happens in GeoCliks when a driver can't complete a stop.",
  },
  "delivery-routes/tracking-links-and-notifications": {
    title: "Tracking Links & Delivery Notifications",
    description: "Share a live tracking link and manage delivery notifications with GeoCliks.",
  },

  // ── Verify ───────────────────────────────────────────────────────────────
  "verify/what-is-a-photo-code": {
    title: "What Is a GeoCliks Photo Code?",
    description:
      "Every GeoCliks photo carries a unique code, format GC-XXXX-XXXX-XXXX — what it is and why it matters.",
  },
  "verify/verify-a-photo": {
    title: "How to Verify a GeoCliks Photo",
    description: "Enter a photo code to confirm a GeoCliks image is the network-verified original.",
  },
  "verify/verify-results-explained": {
    title: "Understanding GeoCliks Verify Results",
    description: "What each result on the GeoCliks verification page means.",
  },
  "verify/how-sealing-works": {
    title: "How GeoCliks Photo Sealing Works",
    description:
      "The technical process behind GeoCliks' tamper-proof photo seal — timestamp, GPS, address and hash.",
  },

  // ── Plans & billing ──────────────────────────────────────────────────────
  "plans-billing/compare-plans": {
    title: "Compare GeoCliks Plans",
    description:
      "See what's included on each GeoCliks plan, from solo capture to full Teamspace features.",
  },
  "plans-billing/delivery-plans": {
    title: "GeoCliks Delivery Plans",
    description: "Pricing and features for GeoCliks' delivery-route and proof-of-delivery plans.",
  },
  "plans-billing/upgrade-or-change-plan": {
    title: "Upgrading or Changing Your GeoCliks Plan",
    description: "How to move to a different GeoCliks plan without losing your data.",
  },
  "plans-billing/seats-and-billing": {
    title: "Managing Seats & Billing in GeoCliks",
    description: "Add, remove or reassign seats and understand how GeoCliks bills your team.",
  },
  "plans-billing/payment-and-invoices": {
    title: "Payments & Invoices — GeoCliks",
    description: "Where to find GeoCliks invoices and update your payment method.",
  },
  "plans-billing/cancel-or-downgrade": {
    title: "Canceling or Downgrading GeoCliks",
    description:
      "What happens to your photos and data if you cancel or downgrade your GeoCliks plan.",
  },

  // ── Troubleshoot ─────────────────────────────────────────────────────────
  "troubleshoot/photos-not-uploading": {
    title: "Fix: Photos Not Uploading in GeoCliks",
    description: "Troubleshooting steps when captures are stuck in the GeoCliks upload queue.",
  },
  "troubleshoot/gps-or-address-wrong": {
    title: "Fix: Wrong GPS or Address on a Photo",
    description: "What to do when GeoCliks captures the wrong location or street address.",
  },
  "troubleshoot/cant-sign-in": {
    title: "Fix: Can't Sign In to GeoCliks",
    description: "Steps to resolve sign-in problems on the GeoCliks app or website.",
  },
  "troubleshoot/two-factor-issues": {
    title: "Fix: Two-Factor Login Issues in GeoCliks",
    description: "Resolving two-factor authentication problems when signing in to GeoCliks.",
  },
  "troubleshoot/invite-not-working": {
    title: "Fix: Teamspace Invite Not Working",
    description: "Why a GeoCliks Teamspace invite might fail and how to resend it.",
  },
  "troubleshoot/route-optimize-failed": {
    title: "Fix: Route Optimization Failed",
    description: "What to do when GeoCliks can't optimize a delivery route's stop order.",
  },
  "troubleshoot/export-or-report-failed": {
    title: "Fix: Export or Report Failed in GeoCliks",
    description: "Troubleshooting a failed closeout report or photo export in GeoCliks.",
  },
  "troubleshoot/notifications-not-arriving": {
    title: "Fix: GeoCliks Notifications Not Arriving",
    description: "Why you might not be getting GeoCliks alerts, and how to fix it.",
  },

  // ── Legal ────────────────────────────────────────────────────────────────
  "legal/data-ownership": {
    title: "Who Owns Your GeoCliks Data?",
    description: "A plain-language summary of who owns the photos and data captured in GeoCliks.",
  },
  "legal/data-retention": {
    title: "GeoCliks Data Retention Policy",
    description: "How long GeoCliks keeps your photos and account data, summarized.",
  },
  "legal/privacy-summary": {
    title: "GeoCliks Privacy Policy — Summary",
    description: "The short version of what GeoCliks collects and how it's used.",
  },
  "legal/terms-summary": {
    title: "GeoCliks Terms of Service — Summary",
    description: "The short version of what you're agreeing to when you use GeoCliks.",
  },
} satisfies Record<string, RouteSeoCopy>;

/** Copy for a help category or "category/slug" article, if it has any. */
export const helpSeo = (ref: string): RouteSeoCopy | undefined =>
  (HELP_SEO as Record<string, RouteSeoCopy>)[ref];

/**
 * Field Notes post copy, keyed by slug.
 *
 * Here rather than on the `Post` objects in `../lib/posts` for the same reason
 * the help copy is here: this module is in the eager bundle — `useSeo` and the
 * server-side injection both need it — while the post bodies are a lazy chunk
 * loaded only when someone opens the blog. Reading a title off a `Post` would
 * drag every post's prose into the landing page's bundle.
 *
 * A post's `title` is the question verbatim, which is the H1 and routinely runs
 * past 60 characters. These are the SERP-length rewrites of the same question,
 * so the two are not duplicates of each other.
 *
 * `assertPostSeo()` in `../lib/posts` fails in development when a post ships
 * without a row here.
 */
export const BLOG_SEO = {
  "what-makes-a-field-photo-tamper-proof": {
    title: "What Makes a Field Photo Tamper-Proof? | GeoCliks",
    description:
      "A field photo is tamper-proof when the time comes from the network, the location is stamped at the shutter, and a hash and signature break if a pixel changes.",
  },
  "can-a-gps-timestamp-photo-be-faked": {
    title: "Can a GPS & Timestamp Photo Be Faked? | GeoCliks",
    description:
      "Yes — EXIF time and GPS tags are editable fields, and mock-location apps fake coordinates. What stops it is a server-side seal you can re-check afterwards.",
  },
  "how-much-does-jobsite-photo-documentation-software-cost": {
    title: "Job-Site Photo Documentation Cost | GeoCliks",
    description:
      "What job-site photo documentation software costs in 2026, how per-seat and per-workspace pricing differ, and which verification features sit behind a paywall.",
  },
  "best-construction-photo-documentation-software-what-to-check": {
    title: "Construction Photo Software: What to Check | GeoCliks",
    description:
      "The checks that decide whether construction photo documentation holds up in a dispute: time source, location accuracy, the integrity seal, and export format.",
  },
  "what-should-photo-proof-of-delivery-include": {
    title: "What Should Photo Proof of Delivery Include? | GeoCliks",
    description:
      "Proof of delivery needs a verified capture time, the stop's coordinates and address, the parcel and placement in frame, and a seal the recipient can check.",
  },
} satisfies Record<string, RouteSeoCopy>;

/** Copy for a Field Notes post slug, if it has any. */
export const blogSeo = (slug: string): RouteSeoCopy | undefined =>
  (BLOG_SEO as Record<string, RouteSeoCopy>)[slug];

/**
 * The paths that must never appear in a search result.
 *
 * `robots.txt` already disallows all of these, but that file only stops a
 * crawler fetching a URL — it does not stop one indexing a URL it found linked
 * somewhere else, which is exactly how a share token ends up in search. The
 * `noindex` tag is the part that actually keeps them out, and for the token
 * routes that matters: `/share/:token` and `/t/:token` are deliberately
 * readable by anyone holding the link, so an indexed one is a disclosure, not
 * just a ranking problem.
 *
 * Matched as path prefixes, on a segment boundary — `/v` matches `/v/ABC123`
 * but would not match a future `/values` page.
 */
export const NOINDEX_PREFIXES = [
  "/app",
  "/admin",
  "/verify",
  "/v",
  "/share",
  "/t",
  "/join",
  "/sign-in",
  "/sign-up",
];

export function isPrivatePath(pathname: string): boolean {
  return NOINDEX_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Drops a trailing slash and any query or hash, so "/help/" keys as "/help". */
function normalize(pathname: string): string {
  const clean = pathname.split(/[?#]/)[0] ?? "/";
  if (clean.length > 1 && clean.endsWith("/")) return clean.slice(0, -1);
  return clean || "/";
}

export interface ResolvedRouteSeo extends Partial<RouteSeoCopy> {
  /** True when the route must carry `noindex`. */
  noindex: boolean;
}

/**
 * The copy for a pathname, resolved the way the router resolves it: the
 * marketing table first, then `/help/:category/:slug` and `/help/:category`,
 * then `/blog/:slug`.
 *
 * `locale` is the language the page will render in. A path with translated head
 * copy returns it; everything else returns English, which is the right answer
 * for an unprefixed URL and the only honest one for a page whose body is still
 * English.
 *
 * An unknown path comes back with no copy at all rather than a guess, which
 * leaves the sitewide defaults in `index.html` in place. Private paths come
 * back `noindex` with no copy — those pages write their own titles once the app
 * boots, and a crawler only needs to be told to stay away.
 */
export function seoForPath(pathname: string, locale: LocaleCode = "en"): ResolvedRouteSeo {
  const path = normalize(pathname);

  if (isPrivatePath(path)) return { noindex: true };

  const translated = locale === "en" ? undefined : LOCALIZED_SEO[path];
  if (translated) {
    return {
      title: translate(locale, translated.title),
      description: translate(locale, translated.description),
      noindex: false,
    };
  }

  const page = (PAGE_SEO as Record<string, RouteSeoCopy>)[path];
  if (page) return { ...page, noindex: false };

  if (path.startsWith("/help/")) {
    const ref = path.slice("/help/".length);
    const help = helpSeo(ref);
    if (help) return { ...help, noindex: false };
  }

  if (path.startsWith("/blog/")) {
    const post = blogSeo(path.slice("/blog/".length));
    if (post) return { ...post, noindex: false };
  }

  return { noindex: false };
}
