import type { Post } from "./types";

export const tamperProofFieldPhoto: Post = {
  slug: "what-makes-a-field-photo-tamper-proof",
  format: "faq",
  title: "What makes a field photo tamper-proof?",
  targetQuestion: "what makes a field photo tamper-proof",
  demand:
    'Keyword cluster "timestamp camera" (350/mo US, 14,000/mo global) and "construction photo documentation" (200/mo, KD 0); the same question recurs in r/ConstructionManagers and r/Contractor threads about disputed job photos.',
  metaDescription:
    "A field photo is tamper-proof when the time comes from the network instead of the phone, the location is captured at the shutter, and the image bytes are sealed with a hash and signature that break if one pixel changes.",
  answer:
    "A field photo is tamper-proof when three things are true: the timestamp comes from the network rather than the device clock, the GPS coordinates and street address are captured at the moment of the shutter and written into both the pixels and the metadata, and the image bytes are sealed with a cryptographic hash plus a signature held server-side. EXIF data alone is not proof — DateTimeOriginal and the GPS tags are ordinary editable fields that any metadata tool can rewrite in seconds. If a photo cannot be re-checked against a seal after the fact, it is a picture, not evidence.",
  publishedAt: "2026-09-24",
  readMinutes: 6,
  keywords: [
    "tamper proof photo",
    "timestamp camera",
    "gps photo verification",
    "construction photo documentation",
  ],
  blocks: [
    {
      kind: "h2",
      text: "Why EXIF metadata is not evidence",
      id: "exif",
    },
    {
      kind: "p",
      text: "Every phone camera writes EXIF: DateTimeOriginal, GPSLatitude, GPSLongitude, make, model. All of it is a plain, writable field inside the file. Open-source metadata editors rewrite any of those tags in one command, and the file that comes out is structurally valid — nothing about it announces the edit.",
    },
    {
      kind: "p",
      text: "There are three ordinary ways a field photo loses its claim to being true, and none of them require skill:",
    },
    {
      kind: "ol",
      items: [
        "The device clock. Settings, toggle off automatic time, pick a date. The camera now stamps whatever you told it, and the EXIF timestamp agrees.",
        "The metadata edit. A command-line tool rewrites the GPS tags to a location the phone never visited.",
        "The screenshot or re-send. Screenshots and most chat apps strip EXIF entirely. What arrives at the office is an image with no time and no place, indistinguishable from a photo taken last year on a different job.",
      ],
    },
    {
      kind: "callout",
      label: "The practical test",
      text: "Ask of any photo system: six months from now, in front of a client disputing an invoice, can you demonstrate that this specific file has not changed since capture? If the answer relies on trusting the phone, there is nothing to demonstrate.",
    },
    { kind: "h2", text: "The three layers that actually hold", id: "layers" },
    { kind: "h3", text: "1. Network-verified time, with the skew shown" },
    {
      kind: "p",
      text: "The fix for a movable clock is to not use it. GeoCliks stamps the time from the network and compares it to the handset, then records the difference. A photo captured on a phone whose clock is two seconds out looks like this, and it stays verified:",
    },
    {
      kind: "code",
      text: "device 14:31:07 · network 14:31:09 · skew 2s · verified",
    },
    {
      kind: "p",
      text: "The important part is the failure case. When the skew is large — a clock deliberately rolled back — the photo is not silently corrected and not silently accepted. It is marked unverified, and everyone who opens it sees that mark, including the client. A system that hides the discrepancy is worse than one that has no clock check at all, because it produces confident-looking output either way.",
    },
    { kind: "h3", text: "2. Location captured at the shutter, in two places" },
    {
      kind: "p",
      text: "Coordinates are recorded with an accuracy radius and reverse-geocoded to a street address at capture time, then written twice: burned into the image itself as a visible watermark, and stored as structured metadata alongside it.",
    },
    { kind: "code", text: "43.65107° N 79.34015° W · ±4 m · verified address" },
    {
      kind: "p",
      text: "Writing it twice is what survives real-world handling. Burned pixels survive a screenshot, a text message, a printout, and a PDF a client forwards three times. Structured metadata survives filtering, mapping and export. Either one alone has a hole: pixels can be cropped, metadata can be stripped.",
    },
    {
      kind: "p",
      text: "The accuracy radius matters more than people expect. A coordinate with no stated accuracy is an assertion; ±4 m is a measurement. When the radius is wide — dense downtown, underground parkade — the record says so instead of pretending to precision it does not have.",
    },
    { kind: "h3", text: "3. A hash and a signature, resolvable by code" },
    {
      kind: "p",
      text: "This is the layer that makes the other two checkable rather than merely printed. At capture, GeoCliks computes a SHA-256 digest of the image bytes, binds it to the original metadata, signs the pair with an HMAC signature, and issues a short photo code:",
    },
    { kind: "code", text: "GC-8QF2-40XR-91KD · integrity: intact" },
    {
      kind: "p",
      text: "SHA-256 produces a 256-bit digest. Change one bit of the image — re-save it, lighten it, clone out a defect — and the digest that comes out bears no resemblance to the one on file. The HMAC signature is the second half: because the signing key lives on the server and never ships to the handset, a third party cannot manufacture a photo plus a matching valid seal. Anyone holding the code can re-check the photo at any time, and the answer is binary.",
    },
    {
      kind: "table",
      caption: "What each layer defeats",
      head: ["Attack", "EXIF only", "Watermark only", "Network time + hash + signature"],
      rows: [
        [
          "Device clock rolled back",
          "Not detected",
          "Not detected",
          "Flagged as skew, marked unverified",
        ],
        [
          "GPS tags rewritten after capture",
          "Not detected",
          "Pixels still correct",
          "Seal breaks, integrity fails",
        ],
        ["Image edited or re-saved", "Not detected", "Not detected", "Digest changes, seal breaks"],
        [
          "Screenshot re-sent",
          "Metadata stripped",
          "Stamp survives",
          "Stamp survives; code resolves to original",
        ],
        [
          "Photo from a different job reused",
          "Not detected",
          "Wrong address visible",
          "Code resolves to the original job record",
        ],
      ],
    },
    { kind: "h2", text: "What this costs, and the part that is free", id: "cost" },
    {
      kind: "p",
      text: "A note on buying, because it is where this question usually ends up. In this category the trustworthy configuration is frequently the upsell: verification, audit trails and export sit on a higher tier, so the crews on the cheap plan produce photos that do not hold up.",
    },
    {
      kind: "p",
      text: "GeoCliks prices the opposite way. Network-verified time, GPS with street address, the unique photo code, the public verification page and offline capture are on every plan including Free ($0, no card, 300 captures a month). Paid plans — Plus $7/mo, Business $25/mo with 5 seats, Crew 10 $45/mo, Crew 25 $105/mo — add volume, seats, Teamspace, roles and the Excel, ZIP and KMZ exports. They do not add a better seal. A photo code issued on the free plan still resolves after a downgrade, and after you stop paying entirely.",
    },
    { kind: "h2", text: "A 60-second audit of your current setup", id: "audit" },
    {
      kind: "ol",
      items: [
        "Take a photo with your current app. Change the phone's clock by an hour. Take another. Does the second photo say anything is wrong? If not, your timestamps are decoration.",
        "Screenshot one of last month's job photos and open the screenshot. Is the time and address still legible? If not, nothing survives a forwarded file.",
        "Pick a photo from a closed job and try to prove its file has not been altered since capture. If there is no code to resolve and no digest on record, there is no proof available.",
        "Check which of the above your plan gates behind a higher tier. That is the real price of the tool.",
      ],
    },
    {
      kind: "links",
      label: "Where this goes on the site",
      items: [
        {
          href: "/gps-timestamp-camera",
          text: "The GPS timestamp camera",
          note: "the three layers above as a product page: what each capture records and what it refuses to claim.",
        },
        {
          href: "/construction-photo-documentation",
          text: "Construction photo documentation",
          note: "the same mechanism applied to progress, change orders and closeout packages.",
        },
        {
          href: "/pricing",
          text: "Plans and pricing",
          note: "confirm for yourself which tier the seal sits on. It is all of them.",
        },
        {
          href: "/alternatives/companycam",
          text: "GeoCliks vs CompanyCam",
          note: "if you are comparing on evidence quality rather than on feature count.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Does a timestamp in the corner of the photo make it tamper-proof?",
      a: "No. A burned-in stamp survives screenshots and printing, which is useful, but on its own it only records what the device believed at capture. If the device clock was wrong or deliberately changed, the stamp is confidently wrong. It becomes proof when the time is taken from the network and the file is sealed with a hash that can be re-checked.",
    },
    {
      q: "Can EXIF GPS data be faked?",
      a: "Yes, trivially. EXIF GPS tags are writable fields; standard metadata tools rewrite them in a single command and the resulting file is valid. That is why location has to be captured at the shutter and bound into a signed record rather than read back out of the file later.",
    },
    {
      q: "What does SHA-256 actually prove about a photo?",
      a: "It proves the bytes have not changed. SHA-256 reduces the image to a 256-bit digest; altering a single bit produces a completely different digest. It does not prove when or where the photo was taken — that is what the network timestamp and captured GPS are for — and it only proves anything if the digest was recorded at capture by something other than the phone.",
    },
    {
      q: "Do tamper-proof photos work without cell signal?",
      a: "They should. GeoCliks captures offline — the photo queues on the device with its verification data and uploads itself when signal returns, on every plan including Free. Basements, trenches, parkades and rural sites are where field photos are actually taken.",
    },
    {
      q: "Is a tamper-proof photo admissible as evidence?",
      a: "Admissibility is decided by a court or an adjuster under their own rules, and no software vendor can promise it. What verification does is remove the ordinary objections: that the date is unproven, the location is unproven, or the file may have been edited. A photo with network-verified time, captured GPS and an intact cryptographic seal answers those three challenges with something checkable.",
    },
  ],
};
