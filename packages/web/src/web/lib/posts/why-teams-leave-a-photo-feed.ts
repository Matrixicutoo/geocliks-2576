import type { Post } from "./types";

/**
 * Week 8 of the CompanyCam switcher plan: the roundup, "4 reasons teams leave a photo feed".
 *
 * The four reasons are structural ones, the way a photo feed is built, not survey results.
 * The post says so in its first section and in `demand`, and never claims a share of teams.
 *
 * Every CompanyCam fact is one already published on /alternatives/companycam (checked
 * 14 September 2026): stamps use the device date and time; stamping is an opt-in toggle each
 * user turns on in their own settings; no independently verifiable photo code; no
 * tamper-evident content hash; offline, shared feed, before/after and photo reports are all
 * "Yes"; pricing from $63 a month for one user plus $29 per additional user, billed annually;
 * adjacent features (payments, marketing, e-signature, room measurement, AI captioning).
 *
 * GeoCliks facts, and where they were checked:
 * - Skew tolerance 5 minutes, offline clock check valid 24 hours: `api/lib/verify.ts`
 *   (SKEW_TOLERANCE_MS, CLOCK_SYNC_MAX_AGE_MS).
 * - Stamping on for every capture on every account: /alternatives/companycam row 3.
 * - Plan prices and seats ($0 / $7 / $25 for 5 / $45 for 10 / $105 for 25): `api/lib/plans.ts`.
 * - The per-headcount CompanyCam figures are the same arithmetic as the table in
 *   move-one-companycam-project.ts ($63 + $29 per extra user).
 */
export const whyTeamsLeaveAPhotoFeed: Post = {
  slug: "why-teams-leave-a-photo-feed",
  format: "faq",
  title: "Why do teams leave a photo feed app? Four reasons, and when to stay",
  targetQuestion: "why teams leave a photo feed app like CompanyCam",
  demand:
    'This is the roundup from week 8 of the CompanyCam switcher plan. It sits next to /companycam-alternative (for people already leaving) and /alternatives/companycam (for people comparing), and answers the question before both: what actually goes wrong. No search volume was measured for this wording, and the four reasons are not survey results. They are the four places where the way a photo feed is built stops matching what a disputed job needs.',
  metaDescription:
    "Teams leave a photo feed when a photo's date is questioned, a client can't check it, or the per-user bill grows. The four reasons, and when to stay.",
  answer:
    "A photo feed is built to share job photos inside a team, and it does that well. Teams leave when the photos start going outside the team and getting questioned. Four things break: the date on each photo comes from the phone's own clock, stamping depends on each person turning it on, nobody outside the account can check a single photo, and per-user pricing grows with every hire. If your photos are only for coordination and nobody has ever disputed one, none of these matter and you should stay.",
  publishedAt: "2026-10-05",
  readMinutes: 6,
  keywords: [
    "why leave companycam",
    "companycam alternative",
    "photo feed app",
    "construction photo app switch",
    "verified job photos",
  ],
  blocks: [
    {
      kind: "p",
      text: "Nobody leaves a photo app because the photos look bad. They leave after a specific week: a client says the crew was never there, an adjuster asks when the damage photo was really taken, or a general contractor rejects a change order because the date on the photo is \"just what your phone said\". The feed did its job. It held the photos. It just could not answer the question someone outside the team was asking.",
    },
    {
      kind: "p",
      text: "These four reasons are not from a survey, and this post does not claim any share of teams. They are the four places where the way a photo feed is built stops matching what a disputed job needs. The CompanyCam details below come from our comparison page, which was checked against their site and help centre on 14 September 2026.",
    },
    { kind: "h2", text: "1. The date on the photo comes from the phone", id: "phone-clock" },
    {
      kind: "p",
      text: "CompanyCam stamps photos with the device's date and time. That is the normal way to do it, and it is right almost every day. The problem is that a phone's clock is a setting. Anyone can change it in a few taps, and once a photo has been taken there is nothing in the stamp that shows whether the clock was honest.",
    },
    {
      kind: "p",
      text: "So when someone asks \"was this really taken on the 14th?\", the honest answer from a device-timed photo is \"that is what the phone said\". That is usually enough between people who trust each other, and it is rarely enough in a dispute.",
    },
    {
      kind: "p",
      text: "GeoCliks checks the time against its own server at capture and stores the server time, the phone's time and the gap between them. If the two disagree by more than 5 minutes, the capture is marked unverified rather than quietly trusting the phone. Without signal, a capture keeps its verified time if the phone checked its clock with GeoCliks in the previous 24 hours.",
    },
    { kind: "h2", text: "2. Stamping depends on someone turning it on", id: "opt-in" },
    {
      kind: "p",
      text: "On CompanyCam, the stamp is an opt-in toggle that each user turns on in their own settings. A new hire who never opened that screen takes unstamped photos, and nobody finds out until the one photo that matters has no stamp on it.",
    },
    {
      kind: "p",
      text: "That is not a crew discipline problem. Any process that relies on twelve people each remembering a setting will have gaps. In GeoCliks, every capture is stamped on every account, and there is no setting to switch it off.",
    },
    { kind: "h2", text: "3. Nobody outside the account can check a photo", id: "third-party" },
    {
      kind: "p",
      text: "A shared feed is shared with your team. Your client, their adjuster or a building inspector is not on it, and CompanyCam does not describe a code that lets an outsider check a single photo without an account. It also does not describe a tamper-evident hash of the image. That means a photo that has been edited and re-shared looks the same as the original.",
    },
    {
      kind: "p",
      text: "This is the reason that tends to decide it. When a photo is disputed, the other side does not want your login. They want to check the photo themselves. Every GeoCliks capture has a code anyone can enter at geocliks.com/verify in a browser, with no app and no account. The page shows the verified time, the GPS position and street address, and whether the file is the untouched original. The image bytes are hashed with SHA-256 at capture, so an edited copy shows as a broken seal.",
    },
    { kind: "h2", text: "4. The bill grows with every hire", id: "per-user" },
    {
      kind: "p",
      text: "CompanyCam's entry price is $63 a month for one user, plus $29 for each additional user, billed annually. Per-user pricing is fair when headcount is fixed. For a crew that adds two people in the busy season, every hire is a line on the bill, and the cost of documenting a job grows with the crew rather than with the work.",
    },
    {
      kind: "table",
      caption:
        "Monthly prices in USD. CompanyCam's figure is its entry price as listed on 14 September 2026, worked out for each headcount. GeoCliks plans include their seats.",
      head: ["Crew size", "CompanyCam, entry price", "GeoCliks plan", "GeoCliks price"],
      rows: [
        ["1", "$63", "Plus", "$7"],
        ["5", "$179", "Business", "$25"],
        ["10", "$324", "Crew 10", "$45"],
        ["25", "$759", "Crew 25", "$105"],
      ],
    },
    {
      kind: "p",
      text: "Price is the weakest of the four reasons on its own, because changing the app a crew opens forty times a day has a cost too. It matters when one of the first three has already happened, and the cheaper option also answers the question the feed could not.",
    },
    { kind: "h2", text: "When to stay on the photo feed", id: "stay" },
    {
      kind: "p",
      text: "None of this is a reason to leave if it does not describe your work. Stay where you are if:",
    },
    {
      kind: "ul",
      items: [
        "Your photos are for coordination inside the team: what the site looks like, what the next crew needs to know.",
        "Nobody has ever questioned when or where one of your photos was taken.",
        "You rely on what CompanyCam does beyond photos: on-site payments, marketing tools, e-signature, room measurement or AI captioning. GeoCliks does none of those and is not trying to.",
      ],
    },
    {
      kind: "p",
      text: "Both apps do the basics: a shared project feed, before and after comparisons, offline capture that syncs later, and photo reports. If those basics are all you use, switching buys you nothing.",
    },
    { kind: "h2", text: "If you do leave, leave one job at a time", id: "how" },
    {
      kind: "p",
      text: "There is no importer, and a photo taken in another app cannot be verified afterwards, because verification happens when the shutter fires. So switching does not mean moving your history. It means picking one live project, inviting only that crew, and shooting its next visit in GeoCliks while every other job carries on as before. New accounts get 7 days of the Business plan, with 5 seats and no card, which is enough for one job.",
    },
    {
      kind: "callout",
      label: "What verification does not prove",
      text: "A verified photo shows when and where it was taken and that the file has not changed since. It does not prove what the photo shows or that the work meets the spec, and no app can promise a photo will be admissible. What it gives the other side is a time and an address they can check for themselves, instead of taking your word for it.",
    },
    {
      kind: "links",
      label: "Where to go from here",
      items: [
        {
          href: "/blog/move-one-companycam-project",
          text: "Move one CompanyCam project without disrupting the crew",
          note: "the step-by-step version of the last section, with a 7-day plan that fits the trial.",
        },
        {
          href: "/companycam-alternative",
          text: "The CompanyCam alternative page",
          note: "who should stay, who should switch, and the side-by-side, if you are deciding now.",
        },
        {
          href: "/alternatives/companycam",
          text: "GeoCliks vs CompanyCam, feature by feature",
          note: "the full comparison table these CompanyCam details come from, with the date it was checked.",
        },
        {
          href: "/can-photo-timestamps-be-faked",
          text: "Can photo timestamps be faked?",
          note: "the long answer to reason 1: how phone clocks and EXIF dates get changed, and what a checked time looks like.",
        },
        {
          href: "/verify",
          text: "Check a photo code",
          note: "the page your client would use for reason 3.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Is CompanyCam bad for construction photos?",
      a: "No. It is a good shared photo feed for construction teams, with a project feed, before and after views, offline capture and photo reports. Teams leave it when their photos start being disputed by people outside the team, because the date comes from the phone, stamping is a per-user setting and an outsider cannot check a single photo without an account.",
    },
    {
      q: "Can a photo feed app prove when a photo was taken?",
      a: "Not on its own, if the time comes from the phone's clock. That clock can be changed in Settings, and the stamp does not show whether it was. Proof needs a time checked against something outside the phone, plus a way for someone else to look the photo up. GeoCliks checks capture time against its server and gives every photo a code anyone can check at geocliks.com/verify.",
    },
    {
      q: "Is GeoCliks cheaper than CompanyCam?",
      a: "For most crew sizes, yes. CompanyCam starts at $63 a month for one user plus $29 per additional user, billed annually, as listed on 14 September 2026. GeoCliks charges flat monthly prices with seats included: $7 for one person, $25 for 5 seats, $45 for 10 and $105 for 25. There is also a free plan with 300 verified captures a month.",
    },
    {
      q: "Can I move my CompanyCam photos into GeoCliks?",
      a: "No. GeoCliks has no importer, and an imported photo could not be verified anyway, because the time, location and seal are recorded when the photo is taken. Keep your CompanyCam history where it is and start new jobs in GeoCliks.",
    },
    {
      q: "Does my client need an app to check a GeoCliks photo?",
      a: "No. They enter the photo's code at geocliks.com/verify in any browser, with no account, and see the verified capture time, location, street address and whether the file is the untouched original.",
    },
  ],
};
