import type { Post } from "./types";

export const photoDocumentationPricing: Post = {
  slug: "how-much-does-jobsite-photo-documentation-software-cost",
  format: "comparison",
  title: "How much does job-site photo documentation software cost in 2026?",
  targetQuestion: "how much does jobsite photo documentation software cost",
  demand:
    'Cost is the dominant objection in the category: "companycam alternative"-type queries (30/mo US, KD low) exist almost entirely because of price, and r/WhichCRM, r/Contractor and r/pressurewashing threads in 2026 are explicitly about subscription cost per user. CPCs on "construction photo documentation software" run $6–$12, which is what the demand is worth to vendors.',
  metaDescription:
    "Job-site photo documentation software is priced two ways: $12–$29 per user per month, or a flat per-workspace fee. For a 10-person crew that is $1,440–$3,480 a year versus $540. Full arithmetic and the fees to ask about.",
  answer:
    "Job-site photo documentation software is sold two ways, and the difference is large. Per-seat plans, the category default, are publicly listed between $12 and $29 per user per month — $1,440 to $3,480 a year for a 10-person crew, before setup fees. Flat per-workspace plans charge for the workspace regardless of headcount: GeoCliks is $0 for Free, $7/mo for one person on Plus, $25/mo for 5 seats, $45/mo for 10 and $105/mo for 25. Free tiers are common but usually cap captures or gate verification, so compare cost per verified photo rather than cost per seat.",
  publishedAt: "2026-09-24",
  readMinutes: 6,
  keywords: [
    "jobsite photo app pricing",
    "construction photo documentation software cost",
    "photo documentation app price per user",
    "field service photo app cost",
  ],
  blocks: [
    { kind: "h2", text: "The two pricing models", id: "models" },
    {
      kind: "p",
      text: "Almost every tool in this category picks one of two structures, and which one it picks decides your bill far more than the feature list does.",
    },
    {
      kind: "table",
      head: ["", "Per seat", "Per workspace"],
      rows: [
        ["What you pay for", "Each person who can sign in", "The account, whatever the headcount"],
        ["Typical listed price", "$12–$29 / user / month", "Flat tier: $7–$105 / month"],
        ["Cost when you hire", "Rises with every hire", "Unchanged until you pass the seat cap"],
        ["Incentive it creates", "Share one login, document less", "Put everyone on it"],
        ["Best suited to", "Small fixed teams, office-only use", "Crews, subs, seasonal headcount"],
      ],
    },
    {
      kind: "p",
      text: "The incentive line is the one that costs real money. Per-seat billing makes it rational to buy three logins for a nine-person crew, and the six people without an account keep shooting on the native camera. Those photos have no verified time, no captured address and no seal — which is the exact scenario the software was bought to prevent.",
    },
    { kind: "h2", text: "What a 10-person crew actually pays", id: "arithmetic" },
    {
      kind: "table",
      caption:
        "10 seats, 12 months. Per-seat rows use the range publicly listed on vendor pricing pages in this category; the GeoCliks row is its published Crew 10 plan.",
      head: ["Plan shape", "Monthly", "Annual", "Per seat / month"],
      rows: [
        ["Per seat at $12", "$120", "$1,440", "$12.00"],
        ["Per seat at $16", "$160", "$1,920", "$16.00"],
        ["Per seat at $24", "$240", "$2,880", "$24.00"],
        ["Per seat at $29 (+ setup fee)", "$290+", "$3,480+", "$29.00+"],
        ["GeoCliks Crew 10", "$45", "$540", "$4.50"],
      ],
    },
    {
      kind: "p",
      text: "At 25 people the spread widens: $12/seat is $3,600 a year and $29/seat is $8,700, against $1,260 a year for GeoCliks Crew 25 at $105/mo. Run the arithmetic at the headcount you expect in twelve months, including seasonal crew, because that is when the invoice lands.",
    },
    { kind: "h2", text: "The GeoCliks plans, in full", id: "geocliks-plans" },
    {
      kind: "table",
      caption: "Published prices, USD per month, billed per workspace rather than per seat.",
      head: ["Plan", "Price", "Seats", "Captures", "Exports"],
      rows: [
        ["Free", "$0", "1", "300 / month, 3 projects", "PDF up to 20 photos"],
        ["Plus", "$7", "1", "Unlimited", "PDF, Excel, ZIP, KMZ"],
        ["Business", "$25", "5", "Unlimited", "PDF, Excel, ZIP, KMZ"],
        ["Crew 10", "$45", "10", "Unlimited", "PDF, Excel, ZIP, KMZ"],
        ["Crew 25", "$105", "25", "Unlimited", "PDF, Excel, ZIP, KMZ"],
        ["Enterprise Field", "Custom", "Unlimited", "Unlimited", "Custom templates + API"],
      ],
    },
    {
      kind: "p",
      text: "Verification is identical across every row — network-verified time, GPS with street address, the unique photo code, the public verification page and offline capture are on Free and on Enterprise alike. What the paid tiers buy is volume, seats, Teamspace, roles, full-length verified video (3 minutes per clip versus 30 seconds), your logo on the watermark, live client share links and the Excel, ZIP and KMZ exports. Delivery routes are priced separately, on the Delivery plans, because they are sized by stops and drivers rather than captures.",
    },
    { kind: "h2", text: "Costs that are not on the pricing page", id: "hidden" },
    {
      kind: "ol",
      items: [
        "Setup and support fees. At least one vendor in the category lists a four-figure annual company fee on top of per-user licences. Always ask for the first-year total, not the monthly rate.",
        "Annual-only billing. Some plans are only cheap at the annual rate; the monthly equivalent can be 25–35% higher. If your work is seasonal, price the monthly rate.",
        "Storage and retention overages. Photo and video volume is where this category quietly bills. Ask what happens at 10× your current volume, and whether older photos are archived to a slower or paid tier.",
        "Export gating. If the format your client accepts is two tiers up, the real price of the tool is that tier.",
        "Per-stop or per-report fees. Relevant if you do delivery or inspection work — routing tools sometimes charge per stop. GeoCliks' Delivery plans have no per-stop fee; they are sized by a monthly stop allowance.",
        "The cost of cancelling. If photos stop being verifiable when the subscription ends, you will keep paying for a closed job through its entire warranty period. Get the answer in writing.",
      ],
    },
    { kind: "h2", text: "What free tiers really give you", id: "free" },
    {
      kind: "p",
      text: "Free is common in this category and means two very different things. A free tier that stamps with the device clock and withholds any integrity check gives you an organized camera roll — useful, but it will not survive a challenge. A free tier that verifies identically to the paid tiers is a genuinely usable plan for a solo operator; the limits then bite on volume and output, not on defensibility.",
    },
    {
      kind: "p",
      text: "GeoCliks Free is 300 captures a month, 3 projects, 1 seat, 2 watermark templates and PDF export up to 20 photos, with no card and no expiry. The verification is the same as Enterprise. A one-person operation doing ten jobs a month with short closeout packages can run on it indefinitely; the moment you need a second seat, unlimited projects or an Excel photo log, that is $7 or $25.",
    },
    { kind: "h2", text: "How to compare two quotes properly", id: "compare" },
    {
      kind: "ol",
      items: [
        "Count seats at next year's headcount, including seasonal and subcontractor access.",
        "Multiply out 12 months at the monthly rate, then again at the annual rate, and note the difference.",
        "Add setup, support and onboarding fees for year one.",
        "Strike out any tier that does not verify on the plan your field staff will hold.",
        "Strike out any tier that does not export the format your clients accept.",
        "Divide by your monthly capture volume. That is cost per verified photo — the only number that compares two differently-shaped plans.",
      ],
    },
    {
      kind: "links",
      label: "Where this goes on the site",
      items: [
        {
          href: "/pricing",
          text: "The GeoCliks plans",
          note: "every tier, seat cap and export format in one table, so you can run step six against real numbers.",
        },
        {
          href: "/alternatives/companycam",
          text: "GeoCliks vs CompanyCam",
          note: "the per-seat versus per-workspace arithmetic worked through against the usual incumbent.",
        },
        {
          href: "/construction-photo-documentation",
          text: "Construction photo documentation",
          note: "what the spend buys on a job site, if you have the budget settled and want the workflow.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Is there a free job-site photo documentation app?",
      a: "Yes, several, but read what free excludes. GeoCliks' Free plan is $0 with no card: 300 captures a month, 3 projects, 1 seat, PDF export up to 20 photos, and the same verification as every paid tier — network time, GPS and street address, photo code, offline capture. Free tiers that withhold verification or exports produce photos that cannot be used where it counts.",
    },
    {
      q: "Why is photo documentation software billed per user?",
      a: "Because seats are easy to meter and revenue grows with your headcount. It is not driven by cost — the expensive resources are storage and capture volume, not logins. That is why per-workspace pricing exists: GeoCliks bills one workspace bill for 5, 10 or 25 seats, so hiring does not change the invoice until you pass the seat cap.",
    },
    {
      q: "What does a 10-person crew pay for job-site photo software?",
      a: "On per-seat pricing at the publicly listed $12–$29 range, $120 to $290 a month, or $1,440 to $3,480 a year, before setup fees. On GeoCliks' flat Crew 10 plan, $45 a month or $540 a year for the same ten seats — $4.50 per seat per month.",
    },
    {
      q: "Do I keep my photos if I cancel?",
      a: "Ask every vendor this and get it in writing, because the answers differ sharply. On GeoCliks a photo code resolves and its seal checks out permanently, including after a downgrade and after you stop paying. It matters because lien and warranty windows outlast subscriptions by years.",
    },
    {
      q: "Is it cheaper to just use the phone camera and a shared drive?",
      a: "It is cheaper per month and more expensive per dispute. A camera-roll photo in a shared folder has no verified time, an editable location and no integrity record, so it settles nothing when an invoice or a callback is challenged. The comparison is not $45 a month against $0 — it is $45 a month against the cost of one unprovable job.",
    },
  ],
};
