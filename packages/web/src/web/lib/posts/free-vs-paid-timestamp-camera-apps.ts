import type { Post } from "./types";

export const freeVsPaidTimestampCameraApps: Post = {
  slug: "free-vs-paid-timestamp-camera-apps",
  format: "comparison",
  title: "Free vs paid timestamp camera apps: what does paying actually change?",
  targetQuestion: "free vs paid timestamp camera app",
  demand:
    '"timestamp camera" is 350/mo US at KD 42 and "timestamp camera free" is 100/mo US with 2,100/mo globally (Ahrefs, October 2026); that search results page is all app-store listings, with "Is timestamp camera app safe?" and "What is the best free date stamp app for iPhone?" in People Also Ask. The work angle comes from a 2026 r/ConstructionManagers thread, "App for timestamping photos", where a superintendent asks whether to commit $40 for a year, and an r/androidapps thread from someone who found free GPS-stamp apps were "either they\'re paid, have too many ads, or the location text looks terrible".',
  metaDescription:
    "Paying for a timestamp camera app usually buys no ads, more templates and exports, not a more trustworthy time. Compare the four pricing models, the three capability shapes, and what $0 to $105 a month gets you.",
  answer:
    "On most timestamp camera apps, paying removes ads and adds templates, cloud folders and exports. It does not change where the time comes from, and that is what decides whether a work photo survives a dispute. Paid options run from about $40 a year for a single-phone subscription to $12–$29 per user per month for photo documentation platforms. GeoCliks puts network-verified time, GPS with street address and a SHA-256 seal on its Free plan ($0, 300 captures a month), so what you pay for there is volume, seats and exports: $7 a month for one person on Plus, $25 for five seats on Business.",
  publishedAt: "2026-10-01",
  readMinutes: 6,
  keywords: [
    "timestamp camera free",
    "free timestamp camera app",
    "timestamp camera app for work",
    "paid vs free timestamp camera",
    "gps timestamp camera app",
  ],
  blocks: [
    {
      kind: "p",
      text: 'Search "timestamp camera free" and the first page is app-store listings. None of them explain what the paid tier changes. That matters more for work photos than for holiday snaps, because a timestamp on a job photo is only worth something if it still holds up when a client, an adjuster or a general contractor disputes it. So there are two questions here. The first is what each pricing model charges. The second, which matters more, is what kind of stamp you are paying for.',
    },
    { kind: "h2", text: "The four pricing models", id: "pricing-models" },
    {
      kind: "p",
      text: "Apps that put the time and location on a photo use one of four pricing structures. What each one charges for tells you what it thinks it is selling.",
    },
    {
      kind: "table",
      head: ["Model", "What you pay", "What paying usually removes or adds", "Fits"],
      rows: [
        [
          "Free with ads",
          "$0, with a paid upgrade to remove ads",
          "Ads, the app's own watermark, locked templates",
          "Personal use, occasional photos",
        ],
        [
          "Single-phone subscription",
          "About $40 a year (the figure quoted on r/ConstructionManagers in 2026)",
          "More stamp fields, notes, folders, cloud backup",
          "One person, one phone",
        ],
        [
          "Per-user platform",
          "$12–$29 per user per month, publicly listed in this category",
          "Projects, team feed, reports, integrations",
          "Office-led teams with a fixed headcount",
        ],
        [
          "Per-workspace plan",
          "GeoCliks: $0 / $7 / $25 / $45 / $105 a month",
          "Captures, seats, exports, share links",
          "Crews whose headcount moves",
        ],
      ],
    },
    {
      kind: "p",
      text: "Look at the third column. Ads, templates, folders and seats are convenience features. None of the four models charges for a more trustworthy time, because on most stamp apps there is only one kind of time on offer: whatever the phone's clock says.",
    },
    { kind: "h2", text: "The three capability shapes", id: "shapes" },
    {
      kind: "p",
      text: "Underneath the pricing, timestamp apps are built in one of three ways. Paying for a higher tier does not move an app from one shape to the next. The shape is how the app is built, not a feature you unlock.",
    },
    {
      kind: "table",
      head: ["", "Stamp only", "Stamp with network time", "Sealed and re-checkable"],
      rows: [
        [
          "Where the time comes from",
          "The phone clock, which the user can change in Settings",
          "A network or server time",
          "Network time compared with the phone clock, with the difference printed",
        ],
        [
          "If someone changes the phone clock",
          "The stamp shows the false time",
          "The stamp shows the right time",
          "The photo is marked unverified if the clocks disagree by more than 5 minutes",
        ],
        [
          "Location",
          "Whatever the phone reports, with no accuracy figure",
          "Usually the same",
          "Coordinates with an accuracy radius and a street address, recorded when the photo is taken",
        ],
        [
          "If the file is edited later",
          "Nothing detects it",
          "Nothing detects it",
          "The SHA-256 hash no longer matches, so the seal breaks",
        ],
        [
          "Can someone else check it?",
          "No, they have to trust the overlay",
          "No",
          "Yes: anyone with the photo code can check it on a public verification page",
        ],
        [
          "What you are holding",
          "A labelled photo",
          "A labelled photo with a better clock",
          "A record someone else can check",
        ],
      ],
    },
    {
      kind: "p",
      text: 'A "stamp with network time" app fixes the most common fake, the changed phone clock. A sealed app also catches the next two: editing the file afterwards, and passing off an old photo as a new one. GeoCliks is built the sealed way. The time is read from the network and compared with the handset. A clock offset measured more than 24 hours earlier is not trusted. The image bytes are hashed with SHA-256 and signed with an HMAC, and anyone holding the photo code can check the result.',
    },
    { kind: "h2", text: "What a free tier holds back", id: "free-tier" },
    {
      kind: "p",
      text: 'Free plans differ in what they hold back. Before you build a habit on one, put these questions to it. The GeoCliks column shows what its Free plan does, so you have a concrete example of each answer.',
    },
    {
      kind: "table",
      head: ["Check", "Why it matters for work", "GeoCliks Free"],
      rows: [
        [
          "Is verification the same as on paid plans?",
          "If it is not, your free-plan photos are the ones that fail a challenge",
          "Yes. Same network time, GPS and address, photo code and seal as Enterprise",
        ],
        [
          "Monthly capture limit",
          "Running out mid-job means switching to the native camera",
          "300 captures a month, 3 projects",
        ],
        [
          "Video",
          "Some disputes need motion, not stills",
          "30-second verified clips for the first 3 days; Plus and up get 3-minute clips",
        ],
        [
          "Export",
          "The format your client accepts is what the tool really costs",
          "PDF up to 20 photos; Excel, ZIP and KMZ start on Plus",
        ],
        [
          "Seats and sharing",
          "A second person on the job is often the reason people upgrade",
          "1 seat, no share links; the Business plan has 5 seats and a shared Teamspace",
        ],
        [
          "Works with no signal",
          "Basements, rural sites and plant rooms have no signal",
          "Photos are taken offline and upload automatically later",
        ],
      ],
    },
    { kind: "h2", text: "What it costs over a year", id: "annual" },
    {
      kind: "table",
      caption:
        "12 months at the prices above. The subscription row assumes each phone needs its own subscription. Per-user rows use the bottom and top of the publicly listed range.",
      head: ["Model", "1 person", "5 people", "Is the time checked against the network?"],
      rows: [
        ["Free with ads", "$0", "$0", "Depends on the app; the stamp-only kind uses the phone clock"],
        ["Single-phone subscription at $40/yr", "$40", "$200", "Depends on the app"],
        ["Per-user platform at $12", "$144", "$720", "Varies by vendor and tier"],
        ["Per-user platform at $29", "$348", "$1,740", "Varies by vendor and tier"],
        ["GeoCliks Free / Plus", "$0 / $84", "n/a (1 seat)", "Yes, on every plan"],
        ["GeoCliks Business", "$300", "$300", "Yes, on every plan"],
      ],
    },
    {
      kind: "p",
      text: "For a solo operator, the real choice is between $0 and roughly $40 to $84 a year. At that price, where the time comes from matters more than the price. For a crew of five, the gap opens up: $300 a year on a flat five-seat plan against $720 to $1,740 on per-user pricing. Price both at the headcount you expect in a year, not today's.",
    },
    { kind: "h2", text: "How to choose", id: "choose" },
    {
      kind: "ol",
      items: [
        "Decide whether anyone will ever dispute these photos. If not, a free stamp app is fine, and paying only buys convenience.",
        "If they might, test the free tier: change the phone's clock by an hour and take a photo. If the stamp shows the false time, upgrading that app will not fix it.",
        "Check that the location comes with an accuracy figure and a street address recorded when the photo is taken, not added afterwards.",
        "Ask whether someone outside your company can check the photo without an account. If they cannot, they are taking the stamp on trust.",
        "Only then compare prices, at next year's headcount, including the exports your clients need.",
      ],
    },
    {
      kind: "callout",
      label: "What verification does not prove",
      text: "A verified time, location and seal show when and where a photo was taken and that the file has not changed since. They do not prove what the photo shows, or that the work in it meets the spec, and no app can promise a photo will be admissible.",
    },
    {
      kind: "links",
      label: "Where this goes on the site",
      items: [
        {
          href: "/gps-timestamp-camera",
          text: "The GeoCliks GPS timestamp camera",
          note: "how the sealed approach works on a phone: network time, GPS with address, and the photo code.",
        },
        {
          href: "/pricing",
          text: "GeoCliks plans and limits",
          note: "the full Free, Plus, Business and Crew table, if you want to check the figures above.",
        },
        {
          href: "/can-photo-timestamps-be-faked",
          text: "Can photo timestamps be faked?",
          note: "what goes wrong with phone-clock stamps, and how a network-verified one flags it.",
        },
        {
          href: "/blog/how-much-does-jobsite-photo-documentation-software-cost",
          text: "How much job-site photo documentation software costs",
          note: "per-user against per-workspace pricing worked through for a 10- and 25-person crew.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Is a free timestamp camera app good enough for work photos?",
      a: "It is if nobody will ever dispute the photos. If someone might, check where the free app gets its time. A stamp taken from the phone clock shows whatever the clock is set to. A free plan that checks the time against the network and seals the file, as GeoCliks Free does with its 300 captures a month, gives you photos you can defend at $0.",
    },
    {
      q: "What do you get by paying for a timestamp camera app?",
      a: "Usually no ads and no app watermark, more stamp templates and fields, notes, folders or cloud backup, and more export formats. On a stamp-only app, paying does not change where the time comes from. On GeoCliks, paying gets you unlimited captures, 3-minute video, Excel, ZIP and KMZ exports and share links on Plus ($7 a month), and 5 seats with a shared Teamspace on Business ($25 a month). Verification is the same on every plan.",
    },
    {
      q: "Is a timestamp camera app safe to use?",
      a: "Safe for your phone and trustworthy as evidence are separate questions. For the first, read the app-store privacy label and check which permissions it asks for: a timestamp camera needs the camera and location, and not much else. For the second, a stamp that only reads the phone clock can be wrong without anyone noticing. Look for an app that checks the time against the network and can show the difference.",
    },
    {
      q: "Can I add a timestamp to photos for free without an app?",
      a: "Your phone already saves a capture time in each photo's metadata, and a location too if location access is turned on for the camera, but those fields can be edited and are not shown on the image. Online editors that add a stamp afterwards are worse for work: if a stamp can be added after the fact, it can be faked after the fact.",
    },
    {
      q: "How much does a timestamp camera app cost for a crew?",
      a: "It depends on the pricing model. A single-phone subscription at about $40 a year comes to $200 for five phones. Per-user platforms at $12 to $29 per user per month come to $720 to $1,740 a year for five people. A flat workspace plan such as GeoCliks Business is $25 a month, or $300 a year, for five seats, with verification included.",
    },
  ],
};
