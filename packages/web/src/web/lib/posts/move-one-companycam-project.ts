import type { Post } from "./types";

/**
 * Week 7 of the CompanyCam switcher plan: the how-to that follows "CompanyCam alternative".
 *
 * Every CompanyCam fact here is one already published on /alternatives/companycam (checked
 * 14 September 2026): stamps use the device date and time, stamping is a per-user setting,
 * photos can be exported, pricing starts at $63 a month for one user plus $29 per additional
 * user, billed annually. Nothing about CompanyCam's export format or steps is described,
 * because that page does not describe it.
 *
 * GeoCliks facts, and where they were checked:
 * - 7-day Business trial, no card: `api/lib/trial.ts` (TRIAL_DAYS, TRIAL_PLAN.field).
 *   Expiry leaves captures and projects in place: same file's header comment.
 * - Free = 1 seat, 3 projects, 300 captures, PDF only, no share links, no Teamspace;
 *   share links and Excel/ZIP/KMZ from Plus; 5 seats on Business: `api/lib/plans.ts`.
 * - Invites expire after 7 days and can carry pre-assigned projects: `api/routes/team.ts`.
 *   A field member sees only assigned projects: `visibleProjectIds` in `middleware/auth.ts`.
 * - The camera remembers the chosen project between shots: PROJECT_KEY in the mobile
 *   capture screen.
 * - No-signal captures keep network verification when the phone's clock was checked in the
 *   previous 24 hours; a disagreement over 5 minutes marks the capture unverified:
 *   `api/lib/verify.ts` (CLOCK_SYNC_MAX_AGE_MS, SKEW_TOLERANCE_MS).
 */
export const moveOneCompanycamProject: Post = {
  slug: "move-one-companycam-project",
  format: "how-to",
  title: "How do you move one CompanyCam project to GeoCliks without disrupting the crew?",
  targetQuestion: "how to switch from CompanyCam without disrupting the crew",
  demand:
    'This is the follow-up to "CompanyCam alternative", the switch query that /companycam-alternative targets. Once a team has decided to try something else, the next question is how to do it without stopping work on live jobs. No search volume was measured for this exact wording. The post exists because the honest answer, one project and not the whole account, is not the one a migration page usually gives.',
  metaDescription:
    "Switch from CompanyCam without stopping work: move one live project, invite that crew only and run both apps until it closes. Includes a 7-day plan.",
  answer:
    "Don't migrate the account. Move one live project. Export what CompanyCam holds for that job, create the same project in GeoCliks, invite only the crew working on it, and have them shoot their next visit there while every other job carries on in CompanyCam. There is no importer, and a photo taken in another app cannot be network-verified after the fact, so the switch is a line drawn at a date, not a data transfer. New accounts get 7 days of the Business plan free with 5 seats and no card, which is enough to run one job and decide.",
  publishedAt: "2026-10-05",
  readMinutes: 7,
  keywords: [
    "switch from companycam",
    "move from companycam",
    "companycam alternative",
    "companycam migration",
    "leave companycam",
  ],
  blocks: [
    {
      kind: "p",
      text: "Most software switches fail on the crew, not the software. Ask twelve people to change the app they open forty times a day, on every job at once, and you get a week of missing photos and a foreman who goes back to the old app. The way around that is to make the switch small enough that nobody has to stop. Pick one project, move one crew, and keep everything else exactly where it is.",
    },
    { kind: "h2", text: "Why one project and not the whole account", id: "why-one" },
    {
      kind: "p",
      text: "Moving the photo history buys you less than it seems. GeoCliks has no importer, and even if it had one, an imported photo could not be network-verified. Verification happens when the shutter fires: the capture time is checked against the server, the location and street address are recorded, and the image bytes are sealed with a SHA-256 hash and an HMAC. A photo taken last year in another app missed that moment. Imported, it would be an archive, not an evidence record, and you already have the archive.",
    },
    {
      kind: "p",
      text: "So the history stays where it is, and the only question is which new work goes into GeoCliks. Starting with one project keeps the risk small. If the trial goes badly, one crew goes back to an app it already knows.",
    },
    { kind: "h2", text: "Pick the right project", id: "pick" },
    {
      kind: "p",
      text: "The pilot is only as useful as the job you run it on. A good one has these four things:",
    },
    {
      kind: "ul",
      items: [
        "Its next site visit is in the next day or two, so the trial week is spent taking photos, not waiting.",
        "Its crew is five people or fewer, the seat count included in the trial.",
        "A client, a general contractor or an adjuster is likely to ask when something was done. A job where nobody ever questions a photo will not tell you much.",
        "It has no open claim or dispute. Finish those where their earlier photos are, so each before-and-after pair stays in one place.",
      ],
    },
    { kind: "h2", text: "The move, step by step", id: "steps" },
    {
      kind: "ol",
      items: [
        "Export what you need from CompanyCam. Take the photos and reports for this project that you have to keep, and file them with the job's records. That archive stays exactly as it is, and nothing in GeoCliks depends on it.",
        "Create the GeoCliks account and the project. Sign up, choose job photos when asked which system you run, and create one project named the way your crew already refers to the job. The 7-day Business trial starts now, with no card.",
        "Invite only the crew on that job. Send the invites from the Team screen, then assign those people to this project. A crew member with the field role sees only the projects they are assigned to, so nobody's camera fills up with jobs they do not work on. Invites expire after 7 days, so send them the day before the visit, not a week early.",
        "Spend five minutes on site, not an hour in a training room. Each person installs the app, accepts the invite, and picks the project on the camera once. The camera remembers it for every shot after that. Stamping is always on, so there is no setting to explain and none to forget.",
        "Take the first locked photo together. Shoot something on site, then enter its photo code at geocliks.com/verify on your own phone. You will see what your client will see: the verified time, the GPS position, the street address, and whether the file is the untouched original.",
        "Shoot the rest of the visit as normal. With no signal, capture still works. Photos wait on the phone and upload when it reconnects. They keep their network-verified time as long as the phone checked its clock with GeoCliks in the previous 24 hours.",
        "Send the client something at the end of the visit, either a live share link to the project or a PDF report. That is the test that matters: whether the person on the other side can check what you sent without calling you.",
      ],
    },
    { kind: "h2", text: "A seven-day plan that fits the trial", id: "week" },
    {
      kind: "table",
      caption:
        "The trial runs 7 days from sign-up. Start it the day before the visit so the whole week covers real work.",
      head: ["Day", "Office", "Crew on this job", "Everyone else"],
      rows: [
        [
          "0",
          "Export the project's CompanyCam photos; sign up; create the project; send invites",
          "Nothing yet",
          "CompanyCam, unchanged",
        ],
        [
          "1",
          "Check the first photo code at /verify",
          "Install, accept the invite, pick the project, shoot the visit",
          "CompanyCam, unchanged",
        ],
        [
          "2–5",
          "Watch photos arrive in the project; send the client a share link or a PDF",
          "Shoot as normal; no-signal photos upload later",
          "CompanyCam, unchanged",
        ],
        [
          "6–7",
          "Decide: pick a plan, or let the trial lapse",
          "Shoot as normal",
          "CompanyCam, unchanged",
        ],
      ],
    },
    {
      kind: "p",
      text: "The last column is the point. For the whole week, nobody outside the pilot crew notices anything.",
    },
    { kind: "h2", text: "What stays behind", id: "stays" },
    {
      kind: "ul",
      items: [
        "Your CompanyCam history. It stays in CompanyCam, or in the export you took. None of it becomes verified by moving it.",
        "Jobs already in progress, apart from the pilot. Close them out where they started, and begin each one's GeoCliks record at its next new phase or its next job.",
        "Anything you use CompanyCam for beyond photos and reports, such as payments, marketing, e-signature or room measurement. GeoCliks does not do those. If your team depends on them, that is a reason to keep CompanyCam for that work, whatever the pilot shows.",
      ],
    },
    { kind: "h2", text: "How to judge the pilot", id: "judge" },
    {
      kind: "p",
      text: "At the end of the week, ask these questions. Base the answers on the job, not on a demo:",
    },
    {
      kind: "ul",
      items: [
        "Did the crew take as many photos as they normally would? If the count dropped, find out why before moving anyone else.",
        "Were any photos marked unverified? Each one tells you something specific: a phone whose clock was changed, or one that had not checked its clock in more than 24 hours.",
        "Could the client or the GC open what you sent and check a photo code without an account?",
        "Did a PDF or share link replace a step the office used to do by hand?",
        "Would any photo from this week have settled an argument you have had before?",
      ],
    },
    {
      kind: "p",
      text: "If most of the answers are yes, move the next crew the same way, one project at a time. If they are no, you have spent one week on one job and nothing else changed.",
    },
    { kind: "h2", text: "What it costs once the trial ends", id: "cost" },
    {
      kind: "p",
      text: "When the 7 days run out, nothing is deleted. The captures and the project stay, and the workspace drops to the Free plan until you choose one. Free is one seat, 3 projects, 300 captures a month and PDF export of up to 20 photos, with no share links. So the pilot crew needs a paid plan to keep shooting into the same workspace.",
    },
    {
      kind: "table",
      caption:
        "Monthly prices in USD. CompanyCam's figure is its entry price as listed on 14 September 2026 (from $63 a month for one user plus $29 for each additional user, billed annually), worked out for each headcount.",
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
      text: "The shape of the bill matters as much as the total. Per-user pricing goes up with every hire. A flat plan stays the same until you outgrow its seats. Running both apps for a while costs you the GeoCliks plan on top of what you already pay, so keep the overlap to the jobs you are actually moving.",
    },
    {
      kind: "callout",
      label: "What verification does not prove",
      text: "A verified photo shows when and where it was taken and that the file has not changed since. It does not prove what the photo shows or that the work meets the spec, and no app can promise a photo will be admissible. What it gives the other side is a time and an address they can check for themselves, instead of taking your word for it.",
    },
    {
      kind: "links",
      label: "Where this goes on the site",
      items: [
        {
          href: "/companycam-alternative",
          text: "The CompanyCam alternative page",
          note: "who should stay, who should switch, and the side-by-side, if you have not decided yet.",
        },
        {
          href: "/alternatives/companycam",
          text: "GeoCliks vs CompanyCam, feature by feature",
          note: "the full comparison table with sources, including the date the CompanyCam details were checked.",
        },
        {
          href: "/construction-photo-log",
          text: "The construction photo log",
          note: "what the office does with the pilot's photos at closeout: PDF, Excel, ZIP and KMZ.",
        },
        {
          href: "/blog/why-teams-leave-a-photo-feed",
          text: "Why teams leave a photo feed app",
          note: "the four reasons behind a switch, and when staying is the better call.",
        },
        {
          href: "/verify",
          text: "Check a photo code",
          note: "the page your client will use, so you can see it before they do.",
        },
        {
          href: "/pricing",
          text: "GeoCliks plans and limits",
          note: "the full Free, Plus, Business and Crew table behind the prices above.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Can I import my CompanyCam photos into GeoCliks?",
      a: "No. GeoCliks has no importer. An imported photo could not be network-verified anyway, because the time, location and seal are checked when the photo is taken, not afterwards. Export what you need from CompanyCam and keep it with the job's records. Start the GeoCliks record at the next visit.",
    },
    {
      q: "Can the crew use CompanyCam and GeoCliks at the same time?",
      a: "Yes, and that is the point of moving one project. Neither app depends on the other. The pilot crew shoots their project in GeoCliks, everyone else stays in CompanyCam, and there is nothing to connect or disconnect when the pilot ends.",
    },
    {
      q: "How long does it take to set up one project?",
      a: "For the office, about as long as it takes to sign up, name a project and send a handful of invites. For each crew member, it takes a few minutes on site: install the app, accept the invite and pick the project on the camera once. Stamping is always on, so there is no setting to teach.",
    },
    {
      q: "What happens when the 7-day trial ends?",
      a: "Nothing is deleted. Captures and projects stay. The workspace falls back to the Free plan, which has one seat, 3 projects, 300 captures a month and PDF export of up to 20 photos, until you pick a plan. For a crew, that means Business at $25 a month for 5 seats, Crew 10 at $45 or Crew 25 at $105.",
    },
    {
      q: "Does my client need an app to see the photos?",
      a: "No. Every photo has a code that anyone can enter at geocliks.com/verify in a browser, with no account, to see its capture time, location, street address and whether the file is the untouched original. You can also send a live share link to the project, on Plus and above, or a PDF report.",
    },
  ],
};
