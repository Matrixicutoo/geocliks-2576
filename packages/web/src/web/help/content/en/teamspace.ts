import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const teamspace: Category = {
  slug: "teamspace",
  title: "Teamspace",
  summary:
    "The shared workspace where crew captures land, and where the office turns them into projects, reports and shared links.",
  icon: "Users",
  sections: [
    {
      title: "Your workspace",
      articles: [
        {
          slug: "teamspace-overview",
          title: "Teamspace overview",
          summary:
            "What a workspace is, what lands in it, and who can see which parts of it.",
          keywords: ["workspace", "organisation", "org", "dashboard", "shared"],
          body: [
            p(
              "A teamspace is one shared workspace for one company. Every photo and video your crew captures on the phone uploads into it, and everybody with access sees the same library from the web app, the desktop app or their phone.",
            ),
            p(
              "You do not have to move anything into the teamspace by hand. As soon as a capture finishes uploading it is in there, with its verified time, GPS position and address attached.",
            ),
            h("What lives in a teamspace"),
            ul(
              "The photo and video library, newest capture first.",
              "Projects — the jobs, sites or clients you group captures under.",
              "Your crew: members, their roles, and which projects each of them can see.",
              "Watermark templates, so every phone stamps captures the same way.",
              "Reports and exports you have generated, and any share links you have handed out.",
              "Delivery routes, if you use Delivery.",
            ),
            h("Who sees what"),
            p(
              "Owners, admins and managers see the whole workspace. Field members see only the projects they are assigned to — their own captures plus anything else on those projects. That is the main reason to put work into projects rather than leaving it loose.",
            ),
            note(
              "Teamspace is part of the Business plan and above. On Free and Plus you still get full capture, watermarking and verification, but the workspace is just you.",
            ),
            see(
              "teamspace/create-a-project",
              "teamspace/roles-and-permissions",
              "plans-billing/compare-plans",
            ),
          ],
        },
        {
          slug: "create-a-project",
          title: "Create a project",
          summary:
            "Group captures by job, site or client so filters, reports and crew access all line up.",
          keywords: ["project", "job", "site", "client", "folder"],
          body: [
            p(
              "A project is a container for captures — usually one job, one site or one client. Projects are what reports are built from, what field members get access to, and what the map and the before-and-after view group by.",
            ),
            h("Create one"),
            steps(
              "In the web app, open Projects and choose New project.",
              "Give it a name. That is the only required field.",
              "Optionally add a job code, the client name, a location label and a street address.",
              "Add a category and internal notes if your team uses them.",
              "Save. The project is immediately available in the mobile app's project picker.",
            ),
            h("Fields and what they are for"),
            table(
              ["Field", "What it does"],
              [
                ["Name", "How the project appears everywhere. Up to 90 characters."],
                ["Code", "Your own job or work-order number. Searchable."],
                ["Client", "Who the work is for. Useful when you export."],
                ["Location label", "A human name for the site, like \"North yard\"."],
                ["Address", "The site address. Used to centre the project on the map."],
                ["Category", "Your own grouping, like \"Roofing\" or \"Inspection\"."],
                ["Notes", "Internal context. Never shown on a share link."],
              ],
            ),
            h("Project status"),
            p(
              "Every project is Active, On hold, Complete or Archived. Status changes nothing about access or storage — it is there so a finished job stops cluttering the list. Filter by status at the top of the Projects page.",
            ),
            note(
              "Creating a project needs the manager role or above. Field members can capture into projects they are assigned to but cannot create new ones.",
            ),
            warn(
              "Each plan includes a set number of projects. If you hit the limit you will be asked to upgrade rather than allowed to create a project that would not be covered.",
            ),
            see("teamspace/invite-your-crew", "mobile-app/assign-capture-to-project"),
          ],
        },
        {
          slug: "browse-and-filter-photos",
          title: "Browse and filter photos",
          summary:
            "Narrow thousands of captures down to the handful you need by project, person, tag, date or text.",
          keywords: ["search", "filter", "library", "gallery", "tag", "find"],
          body: [
            p(
              "The photo library shows every capture in the workspace, newest first. Filters stack — set as many as you like and they all apply together.",
            ),
            h("The filters"),
            ul(
              "Project — only captures assigned to that project.",
              "Member — only captures taken by one person.",
              "Tag — general, before, after, issue, arrival, departure, pickup or delivery.",
              "Date range — captures taken between two dates, based on capture time, not upload time.",
              "Search — matches the address, the note on the capture, and the photo code.",
            ),
            h("Searching by photo code"),
            p(
              "If a client quotes you a photo code from a watermark, paste it into the search box. It will find that exact capture, which is faster than scrolling to the date.",
            ),
            h("Working with a selection"),
            p(
              "Select several captures to move them to a project, tag them, build a report from just those, or delete them. Deleting needs manager or above.",
            ),
            note(
              "Date filters use the time the photo was taken. A capture that sat in the offline queue for two days still filters to the day the crew was on site.",
            ),
            see("teamspace/map-view", "teamspace/reports-and-exports", "verify/verify-a-photo"),
          ],
        },
        {
          slug: "map-view",
          title: "Map view",
          summary: "See every capture as a pin, and confirm the crew was where the paperwork says.",
          keywords: ["map", "gps", "pins", "location", "coordinates"],
          body: [
            p(
              "Map view plots your captures by their recorded GPS position. It answers the question a photo grid cannot: was the work done where it was supposed to be done?",
            ),
            h("Using it"),
            steps(
              "Open Map from the workspace navigation.",
              "Apply the same project, member, tag and date filters you use in the library.",
              "Click a pin to see the capture, its address and its exact time.",
              "Zoom in on a cluster to separate pins that sit within a few metres of each other.",
            ),
            h("When a pin looks wrong"),
            ul(
              "Indoors, in a basement or between tall buildings, GPS accuracy drops. The pin can be tens of metres out even though the photo is genuine.",
              "The address is resolved from the coordinates, so a bad fix produces a plausible but wrong street name.",
              "Captures taken with location permission denied have no pin at all and will not appear on the map.",
            ),
            note(
              "You can export the current map selection as a KMZ file and open it in Google Earth, which is often what utilities and municipal clients ask for.",
            ),
            see("troubleshoot/gps-or-address-wrong", "teamspace/reports-and-exports"),
          ],
        },
        {
          slug: "before-after-compare",
          title: "Before and after comparison",
          summary: "Put two captures side by side to show the change you were paid to make.",
          keywords: ["before", "after", "compare", "progress", "slider"],
          body: [
            p(
              "The comparison view pairs two captures from the same project and shows them together, each with its own verified time and address. It is the fastest way to make a case for completed work.",
            ),
            h("Set it up"),
            steps(
              "Tag the first capture Before in the app or the web library.",
              "Tag the finished-state capture After.",
              "Open the project and choose the Before and after view.",
              "Pick the pair you want if more than one is tagged.",
            ),
            h("Getting a clean pair"),
            ul(
              "Stand in roughly the same spot and hold the phone at the same height for both shots.",
              "Frame a fixed reference — a door, a post, a corner — in both.",
              "Take the After shot from the same distance; zooming instead of moving changes the perspective.",
            ),
            note(
              "A before-and-after layout is one of the report layouts, so once the pair is tagged you can put it straight into a client PDF.",
            ),
            see("teamspace/reports-and-exports", "mobile-app/take-a-photo"),
          ],
        },
      ],
    },
    {
      title: "Share the work",
      articles: [
        {
          slug: "reports-and-exports",
          title: "Reports and exports",
          summary: "Turn a filtered set of captures into a PDF, an Excel sheet, a ZIP or a KMZ.",
          keywords: ["pdf", "excel", "xlsx", "zip", "kmz", "export", "report", "download"],
          body: [
            p(
              "A report is a snapshot of a set of captures in a file you can send. Build the set with filters first, then export — whatever is on screen is what goes in the file.",
            ),
            h("Build a report"),
            steps(
              "Filter the library to the captures you want, or open a project.",
              "Choose Export, then give the report a title.",
              "Pick a layout: grid, detailed, before-and-after, or map.",
              "Pick a format: PDF, Excel, ZIP or KMZ.",
              "Generate. The file is built server-side and appears in your reports list to download or re-download later.",
            ),
            h("Which format to use"),
            table(
              ["Format", "Use it for"],
              [
                ["PDF", "Client-facing documentation. Watermarked photos, laid out and paginated."],
                ["Excel", "One row per capture with time, coordinates, address, tag and note."],
                ["ZIP", "The original image files, for handing off to another system."],
                ["KMZ", "Opening the capture locations in Google Earth or GIS software."],
              ],
            ),
            h("Layouts"),
            ul(
              "Grid — many photos per page, best for volume.",
              "Detailed — one capture per page with the full metadata block.",
              "Before and after — tagged pairs side by side.",
              "Map — the capture locations plotted, with a photo index.",
            ),
            warn(
              "Export formats depend on your plan. The Free plan produces a PDF of up to 20 photos; Excel, ZIP and KMZ start on Plus. If a format is not covered you will be told before the file is built, not after.",
            ),
            see("plans-billing/compare-plans", "troubleshoot/export-or-report-failed"),
          ],
        },
        {
          slug: "share-links",
          title: "Share links",
          summary:
            "Send a capture to somebody with no account, and take the link back when you are done.",
          keywords: ["share", "link", "url", "client", "public", "revoke", "expiry"],
          body: [
            p(
              "A share link is a web address that shows one capture — the media, its verified time, its GPS position and its address — to anybody who opens it. No account, no app, no sign-in.",
            ),
            h("Create a link"),
            steps(
              "Open the capture in the web app.",
              "Choose Share.",
              "Optionally set an expiry in days. Leave it empty for a link that does not expire.",
              "Copy the link and send it.",
            ),
            h("Managing links"),
            ul(
              "Every link is listed in the workspace with when it was created and how many times it has been opened.",
              "Revoke a link at any time. It stops working immediately for everybody who has it.",
              "Asking to share a capture that already has a live link gives you the existing link rather than making a second one.",
            ),
            h("What a share link does not expose"),
            ul(
              "Your other captures, projects or crew.",
              "Internal project notes.",
              "Anything about your workspace, plan or billing.",
            ),
            warn(
              "Treat a link as public. Anybody it is forwarded to can open it until you revoke it or it expires.",
            ),
            note(
              "Share links are a paid-plan feature. If Share is unavailable, check your plan.",
            ),
            see("verify/verify-a-photo", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Your crew",
      articles: [
        {
          slug: "invite-your-crew",
          title: "Invite your crew",
          summary: "Add people by email or QR code, and put them on the right projects from day one.",
          keywords: ["invite", "add member", "seat", "qr", "onboard", "crew"],
          body: [
            p(
              "Members join by invitation. You send one, they accept, and their captures start arriving in your teamspace.",
            ),
            h("Send an invitation"),
            steps(
              "Open Team and choose Invite.",
              "Enter their work email.",
              "Choose a role. Field is the default and is right for most crew.",
              "Tick the projects they should already have access to when they first sign in.",
              "Send. They get an email with a link that adds them to your workspace.",
            ),
            h("Inviting somebody standing next to you"),
            p(
              "Every pending invitation also has a QR code. Show it on your screen, have them scan it with their phone camera, and they land on the accept page without you typing their address. Useful for a crew that is on site with you.",
            ),
            h("Seats"),
            p(
              "Each plan includes a number of seats. A pending invitation holds a seat, so five invitations against three seats will be refused rather than letting everybody accept and overrun the plan. If you are out of seats, revoke an invitation that is not going to be accepted, remove a member who has left, or upgrade.",
            ),
            h("If the invitation does not arrive"),
            ul(
              "Have them check spam, and confirm the address you used.",
              "Check the pending list — if the invitation is there, resend or use the QR code instead.",
              "An invitation is tied to the email address it was sent to; accepting with a different address will not work.",
            ),
            note("Inviting and removing members needs the admin role or above."),
            see("teamspace/roles-and-permissions", "troubleshoot/invite-not-working"),
          ],
        },
        {
          slug: "roles-and-permissions",
          title: "Roles and permissions",
          summary: "Owner, admin, manager and field — what each one can do, and who to make what.",
          keywords: ["role", "permission", "admin", "manager", "field", "access", "owner"],
          body: [
            p(
              "There are four roles. Every member has exactly one, and it decides what they see and what they can change.",
            ),
            table(
              ["Role", "Can do"],
              [
                [
                  "Owner",
                  "Everything, including billing and plan changes. One per workspace, and it cannot be taken away.",
                ],
                [
                  "Admin",
                  "Invite and remove members, change roles, manage projects, templates and exports.",
                ],
                [
                  "Manager",
                  "Create and edit projects, delete captures, send broadcasts, build reports. No member management.",
                ],
                [
                  "Field",
                  "Capture, and see only the projects they are assigned to. No team, invite or billing access.",
                ],
              ],
            ),
            h("What to give people"),
            ul(
              "Crew on the tools: field.",
              "A foreman or site lead who organises jobs: manager.",
              "Office staff who onboard people and handle client documentation: admin.",
              "Keep owner on the person who pays the bill.",
            ),
            h("Changing a role"),
            steps(
              "Open Team.",
              "Choose the member.",
              "Pick the new role. It takes effect the next time their app talks to the server.",
            ),
            h("Removing somebody"),
            p(
              "Removing a member takes away their access. It does not delete their work: their photos, videos and the audit trail behind them stay in the teamspace, which is the point of keeping evidence in a workspace rather than on a phone.",
            ),
            warn(
              "You cannot remove the workspace owner, and you cannot remove yourself. Only the owner can remove another admin, so two admins cannot remove each other.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
        {
          slug: "messages-and-broadcasts",
          title: "Messages and broadcasts",
          summary: "Talk to one crew member, or send one announcement to everybody at once.",
          keywords: ["message", "chat", "broadcast", "announcement", "notify", "push"],
          body: [
            p(
              "Messages are one-to-one threads between people in the same workspace. They arrive as a push notification on the phone, so you are not chasing crew through a personal chat app.",
            ),
            h("Message somebody"),
            steps(
              "Open Messages.",
              "Pick the person from your workspace contacts.",
              "Type and send. You can attach a recent capture to make it clear what you are talking about.",
            ),
            h("Broadcasts"),
            p(
              "A broadcast sends the same message to everybody in the workspace at once. It is delivered as a normal message in each person's own thread, so replies come back to you privately instead of turning into a group argument.",
            ),
            steps(
              "Open Messages and choose Broadcast.",
              "Optionally attach a project, so people know which job it concerns.",
              "Write the message and send. You will see how many people it went to.",
            ),
            note(
              "Sending a broadcast needs the manager role or above. One-to-one messaging is open to everybody in the workspace.",
            ),
            see("mobile-app/notifications", "troubleshoot/notifications-not-arriving"),
          ],
        },
      ],
    },
    {
      title: "Standards",
      articles: [
        {
          slug: "watermark-template-library",
          title: "Watermark template library",
          summary:
            "Set the stamp every phone in the workspace uses, so captures come back consistent.",
          keywords: ["watermark", "template", "brand", "logo", "stamp", "default"],
          body: [
            p(
              "A watermark template decides what is burned into the corner of every capture: which fields appear, where the block sits, and whether your logo is on it. Templates live in the workspace, not on a device, so what you set here is what the whole crew stamps.",
            ),
            h("Create a template"),
            steps(
              "Open Templates in the workspace settings.",
              "Choose New template and name it after the use case, not the client — \"Site progress\" ages better than \"Northline job\".",
              "Tick the fields to show: date and time, coordinates, address, project, member name, photo code, weather, a custom line.",
              "Choose the corner and the size, and upload a logo if you want one.",
              "Save.",
            ),
            h("The default template"),
            p(
              "One template is the workspace default. New members get it automatically, and it is what a phone uses until somebody switches. Set a different default at any time; existing captures are untouched.",
            ),
            h("Housekeeping"),
            ul(
              "Deleting a template does not change captures already stamped with it.",
              "You cannot end up with no default — promoting one template demotes the old one in the same step.",
              "Crew can switch between the workspace templates on their phone but cannot edit them.",
            ),
            warn(
              "The Free plan includes two templates. Paid plans let you build your own set with a logo.",
            ),
            see("mobile-app/watermark-templates", "mobile-app/switch-template"),
          ],
        },
      ],
    },
  ],
};
