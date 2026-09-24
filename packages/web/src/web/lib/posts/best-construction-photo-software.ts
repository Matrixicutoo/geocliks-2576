import type { Post } from "./types";

export const bestConstructionPhotoSoftware: Post = {
  slug: "best-construction-photo-documentation-software-what-to-check",
  format: "best-of",
  title: "Best construction photo documentation software: what to check before you buy",
  targetQuestion: "best construction photo documentation software",
  demand:
    '"construction photo documentation software" 250/mo US at KD 3, "construction photo documentation app" 150/mo, "construction photo documentation" 200/mo at KD 0. Every result on page one is a 2026 vendor roundup, which is why this post is criteria-first instead of a ranking.',
  metaDescription:
    "Nine checks that separate construction photo documentation tools: where the timestamp comes from, whether verification is gated by plan, offline capture, export formats, seat pricing, and what happens to your photos after you cancel.",
  answer:
    "The best construction photo documentation software is the one that still produces defensible photos on the plan you will actually pay for. Nine checks decide it: where the timestamp comes from, whether GPS and address are captured at the shutter, whether the file is sealed and re-checkable, whether verification is gated behind a higher tier, whether capture works offline, which export formats you get, whether you are billed per seat or per workspace, whether photos remain verifiable after you cancel, and how long a new hire needs to learn it. Rankings age in a quarter; these nine do not.",
  publishedAt: "2026-09-24",
  readMinutes: 7,
  keywords: [
    "best construction photo documentation software",
    "construction photo documentation app",
    "jobsite photo app",
    "construction photo software comparison",
  ],
  blocks: [
    {
      kind: "p",
      text: "Search this phrase and you get a dozen numbered lists, most of them published by one of the vendors on the list. They are not useless, but they rank on positioning, and positioning is not what fails you eight months in. What fails you is a photo that cannot be defended, a bill that tripled when you hired four people, or a crew that stopped using the app because it needs signal.",
    },
    {
      kind: "p",
      text: "So here are the checks, in the order that matters, with what a good answer looks like.",
    },
    { kind: "h2", text: "1. Where does the timestamp come from?", id: "check-1" },
    {
      kind: "p",
      text: 'Ask this first and most vendors will say "photos are timestamped". That is not the question. The question is whether the time is read from the handset clock — which any user can change in Settings in about eight seconds — or from the network. A good answer names the source and says what happens on a mismatch. GeoCliks stamps network time, compares it with the device, records the skew, and marks the photo unverified when the clock has been rolled back rather than quietly accepting it.',
    },
    {
      kind: "h2",
      text: "2. Is location captured at the shutter, with an accuracy radius?",
      id: "check-2",
    },
    {
      kind: "p",
      text: 'Coordinates read from the file later are just EXIF, and EXIF is editable. Coordinates captured at the moment of capture, reverse-geocoded to a street address, with the accuracy radius stated (±4 m, not "GPS enabled"), and written both into the visible watermark and the stored metadata — that survives screenshots, forwarded PDFs and printouts.',
    },
    { kind: "h2", text: "3. Can any individual photo be re-checked later?", id: "check-3" },
    {
      kind: "p",
      text: 'This is the single most skipped question in the category. A tool can stamp beautifully and still have no way to answer "has this file been altered since capture?" What you want is a per-photo code that resolves on a public verification page, backed by a SHA-256 digest of the image bytes and a server-side signature. Binary answer, any time, by anyone holding the code — including the client\'s adjuster.',
    },
    { kind: "h2", text: "4. Is verification gated behind a higher plan?", id: "check-4" },
    {
      kind: "p",
      text: "Very common, rarely stated on the pricing page: the free or entry tier stamps photos in a way that does not hold up, and the audit trail, verification or export arrives two tiers up. The practical result is that the crew doing the documenting is on the plan that produces the weakest evidence.",
    },
    {
      kind: "callout",
      label: "How to check it in two minutes",
      text: "Open the vendor's feature-comparison table and read across the verification rows, not the feature list. If any row marked verification, audit or integrity is empty on the entry tier, that is the tier your field staff will be on. On GeoCliks those rows are filled on every column including Free: network-verified time, unique photo code, public verification page, offline capture.",
    },
    { kind: "h2", text: "5. Does capture work with no signal?", id: "check-5" },
    {
      kind: "p",
      text: "Basements, trenches, elevator shafts, rural service roads, concrete parkades. If photos have to upload before they are recorded, the crew takes them on the native camera instead and you are back to untraceable files in a camera roll. Offline capture with automatic upload when signal returns is a baseline requirement, not a premium feature.",
    },
    { kind: "h2", text: "6. Which export formats, and who has to accept them?", id: "check-6" },
    {
      kind: "p",
      text: 'The output is the product. A general contractor, an insurer and a municipal inspector each want a different artifact, and "share a link" does not close a job:',
    },
    {
      kind: "table",
      head: ["You need to hand over", "Format that works", "On GeoCliks"],
      rows: [
        [
          "A closeout package a client signs off",
          "Branded PDF",
          "All plans (Free: up to 20 photos)",
        ],
        ["A photo log a PM can filter", "Excel with metadata", "Plus and above"],
        ["Originals for an insurer or lawyer", "ZIP + CSV manifest", "Plus and above"],
        ["Photo pins on a site map", "KMZ (Google Earth)", "Plus and above"],
        ["Before-and-after on a remediation", "Comparison layout", "Plus and above"],
      ],
    },
    { kind: "h2", text: "7. Per seat, or per workspace?", id: "check-7" },
    {
      kind: "p",
      text: "This is where the category's real cost hides. Most tools price per user per month — publicly listed prices on vendor pricing pages in this category commonly sit between $12 and $29 per user, and at least one adds a four-figure annual setup and support fee. Per-seat pricing means the cost of documenting a job scales with the size of the crew, which is exactly backwards: the bigger the crew, the more you need everyone shooting.",
    },
    {
      kind: "table",
      caption: "Annual cost of a 10-person crew, per-seat pricing vs. a flat workspace plan",
      head: ["Model", "Monthly", "Annual"],
      rows: [
        ["$12 per seat × 10", "$120", "$1,440"],
        ["$16 per seat × 10", "$160", "$1,920"],
        ["$29 per seat × 10", "$290", "$3,480"],
        ["GeoCliks Crew 10 (flat, 10 seats)", "$45", "$540"],
      ],
    },
    {
      kind: "p",
      text: "GeoCliks bills per workspace: Business $25/mo covers 5 seats, Crew 10 $45/mo covers 10, Crew 25 $105/mo covers 25 — one bill, not one per head. Whatever you choose, run the arithmetic at the headcount you expect in 12 months, not today's.",
    },
    { kind: "h2", text: "8. What happens to the photos when you stop paying?", id: "check-8" },
    {
      kind: "p",
      text: "Ask it explicitly and get the answer in writing. Three bad outcomes are common: the photos become read-only behind a paywall, the export you need to get them out is on a tier you just left, or the verification record stops resolving so historical photos quietly lose their proof. Warranty and lien periods run for years after a job closes — long after the subscription that documented it. On GeoCliks a photo code resolves and its seal checks out permanently, including after a downgrade or cancellation.",
    },
    { kind: "h2", text: "9. How long does a new hire need?", id: "check-9" },
    {
      kind: "p",
      text: "Adoption is the whole game — an unused tool documents nothing. The realistic benchmark is one tap to capture and no walkthrough required on day one. Anything that needs a training session will be used by the office and skipped in the field, and half-documented jobs are the worst of both worlds: you carry the cost and still cannot prove the work.",
    },
    { kind: "h2", text: "The short version", id: "summary" },
    {
      kind: "ul",
      items: [
        "Network time, not the phone clock — and a visible flag when they disagree.",
        "GPS with street address and accuracy radius, captured at the shutter, burned in and stored.",
        "A per-photo code plus SHA-256 digest and server-side signature, re-checkable by anyone.",
        "Verification on every tier, including free.",
        "Offline capture, always.",
        "PDF, Excel, ZIP with manifest, KMZ — whichever your clients accept.",
        "Flat workspace pricing, costed at next year's headcount.",
        "Permanent verifiability after cancellation, in writing.",
        "One tap, no training.",
      ],
    },
  ],
  faq: [
    {
      q: "What is the best construction photo documentation software?",
      a: "There is no single winner, because the category's tools differ most in what they gate rather than what they can do. Pick with the nine checks above — timestamp source, captured GPS, re-checkable seal, verification available on the entry tier, offline capture, export formats, per-workspace pricing, post-cancellation verifiability, and one-tap usability. Any tool that clears all nine is a defensible choice.",
    },
    {
      q: "Is a free construction photo app good enough?",
      a: "It depends entirely on whether the free tier verifies. A free tier that stamps photos using the device clock and offers no integrity check produces output that collapses the first time it is challenged. A free tier with network-verified time, captured GPS and a re-checkable photo code — GeoCliks' Free plan covers 300 captures a month, 3 projects and PDF export up to 20 photos at $0 with no card — is genuinely sufficient for a solo operator.",
    },
    {
      q: "How much should construction photo documentation software cost?",
      a: "Publicly listed prices in this category commonly run $12 to $29 per user per month, so a 10-person crew lands between $1,440 and $3,480 a year. Flat workspace plans change the shape of that: GeoCliks Crew 10 is $45/mo, or $540 a year for the same ten seats. Cost per verified photo, not cost per seat, is the number to compare.",
    },
    {
      q: "Do I need 360° capture for photo documentation?",
      a: "Only if someone downstream asks for it. 360° walkthroughs are valuable on large multi-trade projects where a remote PM needs spatial context between site visits. For proving that a specific task was completed at a specific address at a specific time — the dispute, warranty and invoice cases — verified point captures are what gets quoted back at you, and they are far cheaper to produce.",
    },
    {
      q: "Does construction photo documentation software replace daily reports?",
      a: "No, it feeds them. Photo tools produce the evidence layer — verified captures, photo logs, closeout packages, before-and-after comparisons. Project management platforms own the schedule, RFIs and submittals. Teams commonly run a photo tool alongside a PM platform and export the photo log into the report.",
    },
  ],
};
