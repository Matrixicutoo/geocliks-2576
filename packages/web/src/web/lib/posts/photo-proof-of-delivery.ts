import type { Post } from "./types";

export const photoProofOfDelivery: Post = {
  slug: "what-should-photo-proof-of-delivery-include",
  format: "how-to",
  title: "What should photo proof of delivery include?",
  targetQuestion: "what should photo proof of delivery include",
  demand:
    'Recurring dispute question behind the "proof of delivery" and "gps map camera" clusters ("gps map camera" 60/mo US, 92,000/mo global, KD 38); driver and courier threads on r/Contractor and r/couriersofreddit repeat the same complaint — a photo at the door that proves nothing once the customer says the parcel never arrived.',
  metaDescription:
    "Photo proof of delivery needs five things to survive a chargeback: a network-verified timestamp, GPS coordinates with an accuracy radius, the reverse-geocoded street address, a visible parcel and drop context, and an integrity seal that can be re-checked later.",
  answer:
    "Usable photo proof of delivery carries five things: a timestamp taken from the network rather than the driver's phone clock, GPS coordinates with an accuracy radius, the reverse-geocoded street address printed on the image, the parcel visible in context with the door or entryway, and a unique code backed by a hash of the image bytes so the photo can be re-checked months later. A bare camera-roll photo of a box has none of those and loses every chargeback it is submitted against, because nothing in it fixes when or where it was taken.",
  publishedAt: "2026-09-24",
  readMinutes: 5,
  keywords: [
    "photo proof of delivery",
    "proof of delivery app",
    "gps map camera",
    "delivery dispute photo",
  ],
  blocks: [
    {
      kind: "h2",
      text: "The five fields a delivery photo has to carry",
      id: "fields",
    },
    {
      kind: "p",
      text: "A delivery photo is only ever read twice: once by nobody, and once by a person deciding whether to refund a customer. The second reader is the one it has to be built for. That reader asks when, where, what, and whether the file has been touched — so the photo has to answer all four on its face, without anyone having to trust the driver or the app.",
    },
    {
      kind: "table",
      caption: "What each field settles, and what its absence costs",
      head: ["Field", "What it settles", "If missing"],
      rows: [
        [
          "Network-verified time",
          "The drop happened inside the delivery window",
          "Device clock can be set to any date; the timestamp proves nothing",
        ],
        [
          "GPS + accuracy radius",
          "The phone was at the address, within ±N metres",
          "Coordinates are an editable metadata field, re-writable in one command",
        ],
        [
          "Reverse-geocoded address",
          "A human reviewer can read the location without decoding coordinates",
          "Reviewer has to paste lat/long into a map and take your word for it",
        ],
        [
          "Parcel in context",
          "The item, and the door or entryway it was left at",
          "A close-up of a box could be any box, anywhere",
        ],
        [
          "Integrity seal (hash + signature)",
          "The file has not been edited since capture",
          "No way to distinguish the original from a re-saved copy",
        ],
      ],
    },
    {
      kind: "h2",
      text: "What the stamp should actually look like",
      id: "stamp",
    },
    {
      kind: "p",
      text: "Burned into the image, not hidden in metadata, because the person adjudicating a dispute is looking at a screenshot pasted into a support ticket — not at an EXIF panel. GeoCliks writes it as three lines plus a code:",
    },
    {
      kind: "code",
      text: "device 14:31:07 · network 14:31:09 · skew 2s · verified\n43.65107° N  79.34015° W  ·  ±4 m\n112 Queen St W, Toronto, ON\nGC-8QF2-40XR-91KD",
    },
    {
      kind: "p",
      text: "The skew line is the part most stamped-photo apps leave out, and it is the one that makes the timestamp mean anything. The app asks the network for the time, compares it to the phone's own clock, and prints both plus the difference. A phone with its clock rolled back shows a large skew and the capture is flagged instead of quietly stamped with a lie.",
    },
    {
      kind: "callout",
      label: "Accuracy radius",
      text: "A coordinate with no radius is a claim, not a measurement. ±4 m is a driver at the door. ±80 m is a driver somewhere on the block, which is a different conversation with the customer — and worth knowing before you refund.",
    },
    {
      kind: "h2",
      text: "How to make it survive a chargeback",
      id: "chargeback",
    },
    {
      kind: "ol",
      items: [
        "Capture at the door, not at the van. The accuracy radius is evidence of exactly this, so the habit matters more than the equipment.",
        "Frame the parcel and one fixed feature of the property — house number, door, gate, unit plate. The photo has to place itself.",
        "Let the stamp write itself. Anything a driver types by hand is a field a reviewer can discount.",
        "Capture offline if there is no signal, and let the app queue and sync. A dead zone should not turn into a missing proof.",
        "Send the verification link, not just the image. A reviewer who can re-check the code themselves does not have to trust either party.",
        "Keep the code resolvable after the job, the route and the subscription end. Disputes arrive weeks late; chargeback windows commonly run 60 to 120 days.",
      ],
    },
    {
      kind: "h2",
      text: "Proof of delivery is not the same problem as route efficiency",
      id: "routing",
    },
    {
      kind: "p",
      text: "Most delivery software sells minutes saved: stops sequenced, ETAs sent, drivers tracked. That is a real problem, and it is a separate one from evidence. A perfectly optimised route still ends in a photo that either holds up or does not. GeoCliks treats them as two modules for that reason — Delivery Routes is priced on its own as stops and drivers, while verified capture is the same engine the field-documentation plans use, verification included on every tier down to Free.",
    },
    {
      kind: "callout",
      label: "Free tier, same seal",
      text: "On GeoCliks the $0 plan captures with the same network time, GPS, address and hash as the $105 plan. What the paid tiers add is volume, seats, export formats and longer verified video — not the proof itself. Verification behind a paywall is the category norm; it should not be.",
    },
  ],
  faq: [
    {
      q: "Is a photo enough proof of delivery on its own?",
      a: "Only if the photo carries its own verification. An unverified image proves a box existed near a door at an unknown time; that fails against a customer claim. A photo with network-verified time, GPS with an accuracy radius, printed street address and a re-checkable integrity code is proof, because each of those can be tested independently of whoever submitted it.",
    },
    {
      q: "Can a delivery driver fake a proof-of-delivery photo?",
      a: "With an ordinary camera app, yes, and easily — turn off automatic time, set the clock, or rewrite the GPS tags afterwards with a free metadata tool. That is why network time and a server-side seal exist. When the timestamp comes from the network and the image bytes are hashed at capture, both of those attacks show up: the clock skew is printed on the photo, and any later edit breaks the hash.",
    },
    {
      q: "How long should proof-of-delivery photos be kept?",
      a: "Longer than your chargeback and claim windows, which commonly run 60 to 120 days and can stretch further for freight and B2B terms. Practically: keep the photo and keep the code resolvable for at least a year, and confirm in writing that the vendor will still resolve codes after you downgrade or cancel.",
    },
    {
      q: "What does proof-of-delivery software cost?",
      a: "Routing and proof are usually billed differently. GeoCliks lists Delivery Routes as its own plan family priced on stops and drivers, while verified capture starts at $0 on Free — 300 captures a month, 1 seat — and $7 a month on Plus for unlimited captures and full PDF, Excel, ZIP and KMZ export. Compare per verified delivery rather than per seat; seat pricing hides the volume cost.",
    },
    {
      q: "Does proof of delivery work without cell signal?",
      a: "It has to, because loading docks, basements and rural routes have none. The requirement is that the capture happens offline with the network time and location already resolved and sealed locally, then syncs when signal returns. An app that silently falls back to the device clock when offline is worse than no stamp at all, because the photo looks verified and is not.",
    },
  ],
};
