import type { Post } from "./types";

export const canGpsTimestampPhotoBeFaked: Post = {
  slug: "can-a-gps-timestamp-photo-be-faked",
  format: "faq",
  title: "Can a GPS and timestamp photo be faked?",
  targetQuestion: "can a gps timestamp photo be faked",
  demand:
    'Drawn from live discussion rather than volume alone: 2026 threads in r/ConstructionManagers and r/Contractor about disputed job photos, plus the "gps map camera" / "timestamp camera" cluster (60/mo and 350/mo US; 92,000 and 14,000 global) where the top results all assert un-fakeability without explaining the mechanism.',
  metaDescription:
    "Yes — device-clock stamps and EXIF GPS are both easy to fake, and many GPS camera apps only record what the phone reports. Here is exactly how each fake works and what defeats it.",
  answer:
    "Yes. Most GPS-and-timestamp photos can be faked, and it takes no expertise: the phone's clock is a setting the user controls, EXIF GPS tags are editable fields, and apps that trust either one will happily stamp a false time or place onto a real photo. What cannot be quietly faked is a capture where the time comes from the network, the location is recorded at the shutter with its accuracy radius, and the bytes are sealed with a SHA-256 digest plus a server-held signature — because altering any of the three breaks a seal that anyone can re-check.",
  publishedAt: "2026-09-24",
  readMinutes: 6,
  keywords: [
    "can gps photos be faked",
    "fake timestamp photo",
    "prove when photo was taken",
    "photo verification",
  ],
  blocks: [
    { kind: "h2", text: "The four ways it is faked in practice", id: "methods" },
    { kind: "h3", text: "1. Change the phone's clock" },
    {
      kind: "p",
      text: "Turn off automatic date and time, set yesterday, open the camera app. Any app that reads the device clock now stamps yesterday, and the EXIF timestamp agrees with the visible stamp, which makes it look corroborated. This is the most common fake and the least sophisticated one.",
    },
    { kind: "h3", text: "2. Rewrite the EXIF tags" },
    {
      kind: "p",
      text: "DateTimeOriginal, GPSLatitude and GPSLongitude are ordinary writable metadata fields. Free command-line tools rewrite them in one line, and the output file is structurally valid — nothing in it flags the edit. Any workflow that reads location back out of the file after the fact is reading an assertion, not a measurement.",
    },
    { kind: "h3", text: "3. Spoof the location the phone reports" },
    {
      kind: "p",
      text: 'Both mobile platforms support mock location providers for developers, and consumer apps exist that feed a chosen coordinate to everything on the device. An app that simply asks the OS "where are we?" and prints the answer will print the spoofed one with full confidence.',
    },
    { kind: "h3", text: "4. Re-use or re-stamp an old photo" },
    {
      kind: "p",
      text: "The laziest and most frequent version in field work: a photo from a job three months ago, or from a different unit in the same building, submitted as today's. No editing required at all — which is why a stamp on its own solves nothing. What defeats this is a photo code that resolves to one original job record.",
    },
    {
      kind: "callout",
      label: "Why watermarked stamps still get disputed",
      text: 'A burned-in stamp is a claim printed by software you chose, using data the phone supplied. That is why "GPS camera" apps that promise their stamps "cannot be edited or faked" are answering the wrong objection: nobody needs to edit the stamp if the inputs were false when it was printed.',
    },
    { kind: "h2", text: "What defeats each method", id: "defeats" },
    {
      kind: "table",
      head: ["Fake", "What stops it", "What you see"],
      rows: [
        [
          "Device clock changed",
          "Time taken from the network, compared with the handset, skew recorded",
          "device 14:31:07 · network 14:31:09 · skew 2s · verified — or the photo marked unverified",
        ],
        [
          "EXIF rewritten after capture",
          "Location captured at the shutter and bound into a signed record; EXIF is not the source of truth",
          "Seal fails integrity check on re-verification",
        ],
        [
          "Mock location provider",
          "Accuracy radius recorded and reverse-geocoded address resolved at capture",
          "43.65107° N 79.34015° W · ±4 m, address on the image",
        ],
        [
          "Image edited or re-saved",
          "SHA-256 digest of the original bytes, recorded at capture",
          "integrity: broken — one changed bit changes the digest",
        ],
        [
          "Old photo re-submitted",
          "Per-photo code tied to one original metadata record",
          "Code resolves to the original job, date and location",
        ],
        [
          "Forged photo plus forged seal",
          "HMAC signature whose key stays server-side and never ships to the device",
          "No valid signature can be produced off-device",
        ],
      ],
    },
    { kind: "h2", text: "How to check a photo someone hands you", id: "check" },
    {
      kind: "ol",
      items: [
        "Look for a photo code on the image. If there is none, the file is the only record and it cannot be re-checked.",
        "Resolve the code on the issuer's public verification page. You should get the original time, coordinates, address and an integrity result — not a login screen.",
        "Compare the resolved record with the visible watermark. They must agree; a mismatch means the pixels were altered after capture.",
        "Check for a stated accuracy radius. A coordinate with no radius is an assertion.",
        "Check for a skew or verified/unverified marker. A system that never reports a clock problem is a system that does not look for one.",
        "If you only have a bare JPEG: read its EXIF, then treat everything you find as unverified. It tells you what the file claims, not what happened.",
      ],
    },
    { kind: "h2", text: "What honest verification does not claim", id: "limits" },
    {
      kind: "p",
      text: "Verification proves that a specific file existed, at a stated time, at a stated location, and has not changed since. It does not prove the photo shows what the caption says it shows, that the work behind it was done correctly, or that a court will accept it — admissibility is decided under rules no vendor controls. GPS accuracy also degrades indoors and between tall buildings, which is why the radius is recorded rather than hidden.",
    },
    {
      kind: "p",
      text: "Anyone promising more than that is overselling. The honest claim is narrower and more useful: the three ordinary objections — wrong date, wrong place, edited file — become checkable in seconds instead of arguable for weeks.",
    },
    { kind: "h2", text: "Where the verification sits on the price list", id: "pricing" },
    {
      kind: "p",
      text: "One practical point, because it decides whether any of this reaches your field crew. If verification is a paid feature, the people taking the photos are usually on the tier that lacks it. GeoCliks puts network-verified time, GPS with street address, the photo code, the public verification page and offline capture on every plan including Free ($0, 300 captures a month, no card). Paid tiers — $7, $25, $45, $105 — add seats, volume and export formats, not a stronger seal.",
    },
    {
      kind: "links",
      label: "Where this goes on the site",
      items: [
        {
          href: "/gps-timestamp-camera",
          text: "The GPS timestamp camera, in detail",
          note: "what the capture records, and how it differs from a free stamp app that reads the phone's own clock.",
        },
        {
          href: "/construction-photo-documentation",
          text: "Construction photo documentation",
          note: "the same verification applied to progress, change orders and closeout, where most of these disputes start.",
        },
        {
          href: "/pricing",
          text: "Plans and pricing",
          note: "the full table, including which tier the export formats sit on.",
        },
        {
          href: "/alternatives/companycam",
          text: "How GeoCliks compares to CompanyCam",
          note: "if you are weighing this against the incumbent on verification rather than on features.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Can you tell if a photo's timestamp was faked?",
      a: "Only if something independent of the phone recorded the time. If the stamp came from the device clock, a faked timestamp looks identical to a real one — the EXIF agrees with the watermark because both came from the same manipulated source. When the time is taken from the network and the skew against the handset is recorded, a rolled-back clock shows up immediately and the photo is marked unverified.",
    },
    {
      q: "Can GPS location in a photo be spoofed?",
      a: "Yes, two ways: mock location providers feed a false coordinate to the whole device, and EXIF GPS tags can be rewritten after the fact with free tools. The defence is capturing the coordinate at the shutter with its accuracy radius, resolving it to a street address, and binding the whole record into a signed seal instead of trusting what the file says later.",
    },
    {
      q: "How do I prove when and where a photo was taken?",
      a: "Capture it with a tool that takes the time from the network, records GPS plus the reverse-geocoded address at the shutter, writes both into the visible image and the stored metadata, and issues a code backed by a SHA-256 digest and a server-side signature. Then hand over the code with the photo so the other side can re-check it themselves. Proof someone else can verify independently is worth far more than proof you assert.",
    },
    {
      q: "Is a photo with a GPS watermark enough for an insurance claim?",
      a: "It is better than a bare photo and weaker than a verified one. Adjusters see watermarked photos constantly and know the stamp is printed from device-supplied data. A photo whose code resolves on a public verification page, showing original time, location and an intact integrity check, answers the adjuster's actual question without a phone call.",
    },
    {
      q: "Does a blockchain make photo proof stronger?",
      a: "Not for the problem most field teams have. A public ledger can prove a digest existed by a certain moment, which is useful for proving a photo is not newer than claimed. It does nothing about the two real attacks — a false time at capture and a spoofed location — because those corrupt the data before any digest is computed. Network-verified capture plus a signed digest addresses the attacks that actually happen.",
    },
  ],
};
