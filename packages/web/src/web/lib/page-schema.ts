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
import { articleHref, asLocale, findArticle, findCategory } from "../help/resolve";
import { articlesOf } from "../help/types";
import { SALES_EMAIL } from "./support";
import {
  type Crumb,
  breadcrumbSchema,
  faqSchema,
  homeSchema,
  techArticleSchema,
} from "./structured-data";

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * One marketing page's structured data inputs: its breadcrumb trail below the
 * home page, and the FAQ the page renders and asserts.
 */
interface PageSchema {
  crumbs: readonly Crumb[];
  faq: readonly FaqEntry[];
}

export const PAGE_SCHEMA = {
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
    {
      question: "What is electronic proof of delivery?",
      answer:
        "It is the record a carrier keeps to show a shipment reached its destination — historically a signature on a handheld, now usually a photo of the delivered parcel with a time and a location attached. The weak point is almost always the time and location: most apps read both from the phone, and a phone will report whatever its owner sets it to.",
    },
    {
      question: "Does GeoCliks capture signatures?",
      answer:
        "No. It captures photo, verified time, GPS and street address, and it does not collect a recipient signature. That is a real gap if your shipper's contract specifically requires a signature — worth knowing before you switch rather than after. For the far more common case where a photo at the door is what gets asked for, a verified photo is stronger evidence than a finger-drawn signature nobody can attribute.",
    },
    {
      question: "Can a driver fake a delivery photo?",
      answer:
        "The obvious routes are closed. The time is verified against our servers rather than read from the handset, so moving the device clock flags the capture instead of changing its timestamp. The location comes from the device's positioning at capture, stamped with its accuracy radius. And the image is stored with a content hash, so a photo edited after the fact reports as altered. What no software can prevent is a driver photographing the right door without leaving the parcel — which is why the address stamp and the time matter more than the picture.",
    },
    {
      question: "Does it work in a basement or a parking garage with no signal?",
      answer:
        "Yes. Captures queue on the phone and upload when the driver is back in range, and a queued capture is sealed as network-verified at the moment it reaches our servers. GPS is read at capture time, so the location is the drop, not wherever the phone reconnected.",
    },
    {
      question: "How much does it cost for a delivery operation?",
      answer:
        "Capture is free forever for up to 300 verified photos a month, which covers a single driver doing light volume. Delivery routes are priced by the stop rather than by the seat, so the bill follows volume instead of headcount. Full numbers are on the pricing page.",
    },
    {
      question: "Will this hold up in a chargeback?",
      answer:
        "It gives you a record the other side can verify independently, which is usually what resolves one. GeoCliks is not a legal service and cannot promise any particular outcome — whether a shipper, a card network or a court accepts a record is their decision. What it does is remove the objection that the timestamp came from the driver's own phone.",
    },
    ],
  },
  "/gps-timestamp-camera": {
    crumbs: [{ name: "GPS Timestamp Camera" }],
    faq: [
    {
      question: "What is a GPS timestamp camera?",
      answer:
        "A camera app that writes the date, time and location onto the photo at the moment it is taken, instead of leaving them in metadata that any editor can rewrite. The category is crowded with free apps that do exactly that and nothing more — the stamp is drawn from the phone's own clock and location, so it is a record of what the phone was told, not of what happened.",
    },
    {
      question: "How is this different from a free timestamp camera app?",
      answer:
        "Three things, and the first is the one that matters. The time is verified against our servers rather than read from the device, so changing the phone clock does not change the stamp — it flags the photo. The image is sealed with a SHA-256 hash, so a later edit is detectable instead of invisible. And every capture gets a code that a third party can check on a public page without your involvement. A free stamp app gives you a photo with text on it, which is worth exactly as much as the trust the other side already has in you.",
    },
    {
      question: "Can a GPS timestamp photo be faked?",
      answer:
        "The common methods can be defeated, and pretending otherwise would be dishonest. Changing the device clock is caught by server-side verification. Editing the file afterwards breaks its hash. Mock-location tools are the hardest case in the category — GeoCliks records the accuracy radius and the positioning source and flags captures that look wrong, which raises the cost of faking without reducing it to zero. What matters in practice is that an independent party can check the record rather than having to trust the photographer.",
    },
    {
      question: "Does it stamp video too?",
      answer:
        "Yes. Video captures carry the same verified time, coordinates and address, and the same sealing. Full-length video is on the paid plans; the free plan covers photo capture and short clips.",
    },
    {
      question: "Does it need internet to take the photo?",
      answer:
        "No. Capturing works offline and the photo queues on the phone. It is sealed as network-verified when it reaches our servers, which can be hours later — the recorded capture time is still the moment the shutter fired, verified against the queue record rather than against the upload.",
    },
    {
      question: "Where does the stamp appear on the photo?",
      answer:
        "In a corner overlay with the time, coordinates and address, sized to stay legible without covering the subject. The same values are stored as metadata, and the photo code is printed with them so anyone reading a printout can verify it.",
    },
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
    {
      question: "Why photograph an HVAC service call at all?",
      answer:
        "Because the two things most often questioned afterwards are not technical. They are whether the technician arrived when the ticket says, and what condition the equipment was in before anyone touched it. Both are trivial to record at the time and nearly impossible to reconstruct a month later from memory and a camera roll.",
    },
    {
      question: "Can this prove my technician was on site?",
      answer:
        "It gives you a capture whose time was verified against our servers rather than read from the technician's phone, stamped with the coordinates and resolved street address of where it was taken, and sealed so a later edit is detectable. That is a much harder record to wave away than a photo with a phone timestamp. It proves a phone running the app took a photo at that place and time — it cannot prove who was holding it.",
    },
    {
      question: "Does it work in a mechanical room with no signal?",
      answer:
        "Yes. Captures queue on the phone and seal when they reach our servers, and the recorded time is the moment of capture. GPS is read at capture, so a basement plant room still stamps the building's location rather than wherever the phone reconnected.",
    },
    {
      question: "Will a verified photo satisfy a manufacturer's warranty claim?",
      answer:
        "That is the manufacturer's call, and any vendor telling you otherwise is guessing. What GeoCliks does is make the photo record specific and independently checkable — verified install date, the serial on the nameplate, the finished work — so a warranty conversation is about the record rather than about whether you can produce one.",
    },
    {
      question: "Can a property manager see the photos without an account?",
      answer:
        "Yes. Send a share link for a set, or a single photo code they can enter on the public verification page. No app, no sign-in.",
    },
    {
      question: "Does GeoCliks do dispatch, quoting or invoicing?",
      answer:
        "No. It is not a field service management platform and does not replace one — there is no quoting, no invoicing and no scheduling beyond assigning captures to jobs. It handles the documentation layer, and it is built to sit alongside whatever you already use to run the calls.",
    },
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

/** The FAQ a marketing page renders. Typed so a wrong path fails the build. */
export function pageFaq(path: keyof typeof PAGE_SCHEMA): readonly FaqEntry[] {
  return PAGE_SCHEMA[path].faq;
}

/**
 * Structured data for a marketing or Help Center path, or none for a path that
 * gets none — the app shell, the auth pages and anything behind a token.
 *
 * The Help Center resolves in English here, deliberately. This runs on the
 * response, where the only thing reading it is a crawler, and every canonical on
 * the site points at the English URL space.
 */
export function marketingJsonLd(pathname: string): object[] {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/") return homeSchema();

  if (path in PAGE_SCHEMA) {
    const page = PAGE_SCHEMA[path as keyof typeof PAGE_SCHEMA];
    return [
      faqSchema(page.faq.map((entry) => ({ ...entry }))),
      breadcrumbSchema(page.crumbs.map((crumb) => ({ ...crumb }))),
    ];
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
