import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const troubleshoot: Category = {
  slug: "troubleshoot",
  title: "Troubleshoot",
  summary: "The things that go wrong most often, and what to check first.",
  icon: "Wrench",
  sections: [
    {
      title: "Capture and upload",
      articles: [
        {
          slug: "photos-not-uploading",
          title: "Photos are not uploading",
          summary: "Captures sitting in the queue, and how to get them moving.",
          keywords: ["upload", "queue", "stuck", "pending", "offline", "sync", "limit"],
          body: [
            p(
              "Captures stay on the phone until they upload. A queue is normal on a bad signal — a queue that never drains is not.",
            ),
            h("Check in this order"),
            steps(
              "Open the app and look at the upload queue. If it shows items waiting, the captures are safe on the device.",
              "Get real signal or Wi-Fi. A single bar often connects but cannot move a photo.",
              "Bring the app to the foreground and leave it there for a minute. Some phones suspend background transfers aggressively.",
              "Check the phone is not in low-power or data-saver mode, which blocks background uploads.",
              "Sign out and back in only as a last resort — do it while the queue is empty.",
            ),
            h("If the queue drains but nothing appears in the workspace"),
            ul(
              "Check the project filter in the web app. The captures may have gone to a project you are not looking at.",
              "Check the date filter. A queued capture files under the day it was taken, not today.",
              "Confirm you are looking at the right workspace if you belong to more than one.",
            ),
            h("If you have hit a monthly limit"),
            p(
              "The Free plan covers 300 captures a month. Past that, uploads are refused until the month rolls over or you move to a plan with no monthly cap.",
            ),
            warn(
              "Do not delete the app while captures are queued. Uploaded captures live in your workspace, but anything still waiting on the device goes with it.",
            ),
            note(
              "The capture time is recorded on the device, so a photo that uploads two days late still carries the moment the shutter fired, and verification reflects that.",
            ),
            see("mobile-app/offline-capture-and-queue", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "gps-or-address-wrong",
          title: "The GPS position or address is wrong",
          summary: "Why a pin drifts, and what to do about a wrong street name.",
          keywords: ["gps", "location", "address", "accuracy", "wrong", "drift", "permission"],
          body: [
            p(
              "GeoCliks records the position the phone reports, then resolves that position to a street address. Both steps can be off, for different reasons.",
            ),
            h("The pin is in the wrong place"),
            ul(
              "Indoors, in a basement, in a parking garage or between tall buildings, satellite reception is poor and the phone falls back to a rougher fix.",
              "A phone that has just been switched on has not got a fix yet. Give it fifteen seconds outdoors before the first capture of the day.",
              "Every capture records its accuracy. A large accuracy figure is the phone telling you it was unsure — that is a feature, not a defect.",
            ),
            h("The position is right but the address is wrong"),
            p(
              "The address is looked up from the coordinates. In a new subdivision, on a rural road or on a large site with one civic number, the nearest known address is what comes back, and it can be a neighbouring building. The coordinates remain the authoritative record.",
            ),
            h("There is no location at all"),
            steps(
              "Open your phone settings and find GeoCliks.",
              "Set location permission to While Using the App, or Always.",
              "On iPhone, also turn on Precise Location. Without it you get a rough area rather than a position.",
              "Capture again. Earlier captures cannot be given a location after the fact.",
            ),
            h("Delivery stops in the wrong place"),
            p(
              "A stop's position comes from resolving the typed address, not from a phone. Fix the address and resolve again, or drop the pin by hand.",
            ),
            warn(
              "A position cannot be added or edited after capture. That is what makes it evidence — if it could be corrected later, it would prove nothing.",
            ),
            see("delivery-routes/geocoding-and-fixing-addresses", "verify/verify-results-explained"),
          ],
        },
      ],
    },
    {
      title: "Access",
      articles: [
        {
          slug: "cant-sign-in",
          title: "Cannot sign in",
          summary: "Wrong password, unverified email, or the wrong sign-in method.",
          keywords: ["sign in", "login", "password", "reset", "verify", "google", "locked"],
          body: [
            p("Work through these in order — the cause is usually one of the first three."),
            h("Check the basics"),
            steps(
              "Confirm the email address. A work address and a personal one are two different accounts.",
              "Use the same method you signed up with. An account created with Google has no password to type.",
              "Reset your password from the sign-in screen if you are unsure.",
              "Open the verification email if you never confirmed the address — an unverified account cannot sign in.",
            ),
            h("Nothing arrives when you request a reset"),
            ul(
              "Check spam and junk.",
              "Wait two minutes. Repeated requests can end up rate-limited, which slows things down further.",
              "Confirm the address exists — a reset for an address with no account sends nothing.",
            ),
            h("You are asked to prove you are human"),
            p(
              "Repeated failed attempts can trigger a challenge. Complete it and continue. If it keeps appearing, try a normal browser window rather than a private one, and turn off any extension that blocks scripts.",
            ),
            h("You sign in but land in the wrong place"),
            ul(
              "If you belong to more than one workspace, switch workspace from the account menu.",
              "A field member sees only their assigned projects, so an empty-looking workspace usually means no project assignments yet — ask an admin.",
            ),
            note(
              "Being removed from a workspace does not delete your account. You can still sign in; you just will not see that workspace.",
            ),
            see("troubleshoot/two-factor-issues", "getting-started/create-your-account"),
          ],
        },
        {
          slug: "two-factor-issues",
          title: "Two-factor problems",
          summary: "Codes rejected, a lost phone, and how backup codes work.",
          keywords: ["2fa", "two factor", "totp", "authenticator", "backup codes", "code rejected"],
          body: [
            p(
              "Two-factor authentication is optional and is offered to owners and admins from your profile page. Field crew are deliberately not pushed through an authenticator app, because a shared truck phone makes that miserable.",
            ),
            h("The code is rejected"),
            steps(
              "Check you are reading the GeoCliks entry in your authenticator app, not another service.",
              "Wait for the next code. Codes change every 30 seconds and one that is about to expire is often refused.",
              "Type all six digits with no space.",
              "Check the phone's clock is set automatically. A device clock several minutes out generates codes the server will not accept.",
            ),
            h("You have lost the phone with the authenticator"),
            p(
              "Use one of the backup codes you were given when you turned two-factor on. Choose the backup-code option on the second-step screen and enter one. Each code works once.",
            ),
            warn(
              "If you have lost both the authenticator and the backup codes, we cannot recover the account from the sign-in screen. Email support@geocliks.com from the account's own address and expect identity checks — that friction is the point of two-factor.",
            ),
            h("Turning it off"),
            p(
              "Sign in, open your profile, and disable two-factor. You will be asked to confirm. If you are the owner, consider leaving it on — it is the account that can change billing and remove people.",
            ),
            note(
              "Two-factor applies to your account everywhere. Once it is on, both the website and the phone app ask for the second step.",
            ),
            see("troubleshoot/cant-sign-in", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "invite-not-working",
          title: "An invitation is not working",
          summary: "No email, an expired link, or no seats left on the plan.",
          keywords: ["invite", "invitation", "seat", "expired", "accept", "qr", "email"],
          body: [
            p("Invitation problems come down to the address, the seats, or the plan."),
            h("They never got the email"),
            steps(
              "Open Team and check the pending list — if the invitation is there, it was created.",
              "Check the address for a typo. An invitation is tied to the exact address it was sent to.",
              "Have them check spam.",
              "Use the QR code instead: open the pending invitation, show the code, and have them scan it with their phone.",
            ),
            h("They accepted but cannot see anything"),
            p(
              "Field members only see projects they are assigned to. Assign them from Team, or from the project itself, and it appears on their phone within moments.",
            ),
            h("You cannot send the invitation at all"),
            ul(
              "No seats left: pending invitations hold a seat too. Revoke stale invitations, remove people who have left, or move up a plan.",
              "Teamspace not included: invitations start on the Business plan. Free and Plus are single-seat.",
              "Wrong role: inviting requires admin or owner.",
            ),
            h("They accepted with a different email"),
            p(
              "That does not work — the invitation only matches the address it was sent to. Revoke it and send a fresh one to the address they actually use.",
            ),
            note("Revoking a pending invitation frees its seat immediately."),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
      ],
    },
    {
      title: "Routes, exports and alerts",
      articles: [
        {
          slug: "route-optimize-failed",
          title: "A route will not optimize",
          summary: "Usually unresolved addresses. Sometimes the plan.",
          keywords: ["optimize", "route", "failed", "coordinates", "geocode", "order"],
          body: [
            p("The optimizer works on map positions, not on typed addresses."),
            h("\"No stop has coordinates yet\""),
            steps(
              "Open the route and choose Resolve addresses.",
              "Look at the stops that failed to resolve.",
              "Fix the address text, or drop the pin by hand on the map.",
              "Optimize again.",
            ),
            h("It optimized, but some stops are stuck at the end"),
            p(
              "Stops with no position cannot be ordered, so they are parked at the end of the list rather than dropped from the route. Resolve or pin them and optimize again.",
            ),
            h("You asked for the smart optimizer and got the standard one"),
            p(
              "On a plan without the smart optimizer, GeoCliks runs the standard one instead of refusing. You still get an ordered route. The route's history records which optimizer ran.",
            ),
            h("The order still looks wrong to you"),
            ul(
              "Check the start address is set, and whether return-to-depot should be on.",
              "Check the service time — a wildly wrong value distorts every arrival estimate.",
              "Time windows on stops constrain the order, and a tight window will override the shortest path.",
              "Drag stops by hand. Local knowledge beats an algorithm more often than vendors admit.",
            ),
            see("delivery-routes/optimize-stop-order", "delivery-routes/geocoding-and-fixing-addresses"),
          ],
        },
        {
          slug: "export-or-report-failed",
          title: "An export or report failed",
          summary: "Plan limits, selections that are too big, and formats that are not included.",
          keywords: ["export", "report", "pdf", "excel", "zip", "kmz", "failed", "download"],
          body: [
            p("Most export failures are a plan limit rather than a fault."),
            h("The format is not available"),
            ul(
              "The Free plan produces a PDF only, of up to 20 photos.",
              "Excel, ZIP and KMZ start on Plus.",
              "You are told before the file is built rather than after, so nothing is half-generated.",
            ),
            h("The export is very large"),
            steps(
              "Narrow the selection with the date or project filter.",
              "Export in batches — a month at a time is easier to email as well as to build.",
              "For thousands of originals, prefer ZIP over PDF. A PDF of that size is unusable anyway.",
            ),
            h("The file never downloads"),
            ul(
              "Reports are built on the server and then listed in your reports list — check there and download it again rather than rebuilding.",
              "Check the browser did not block the download, and look in your downloads folder.",
              "Try a different browser once before reporting it.",
            ),
            h("A KMZ will not open"),
            p(
              "KMZ needs Google Earth or GIS software. It is not a document format and will not open in a PDF reader or a spreadsheet.",
            ),
            note(
              "Every generated report stays in your reports list, so you can re-download it later without rebuilding it.",
            ),
            see("teamspace/reports-and-exports", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "notifications-not-arriving",
          title: "Notifications are not arriving",
          summary: "Push on the phone, and the emails delivery recipients should get.",
          keywords: ["notifications", "push", "email", "alerts", "silent", "recipient", "tracking"],
          body: [
            p("Two different systems, so check the one that matches what is missing."),
            h("Push notifications on the phone"),
            steps(
              "Open your phone settings, find GeoCliks, and allow notifications.",
              "Check Do Not Disturb, Focus and any bedtime schedule.",
              "Open the app once while signed in — the device registers for push on sign-in, so a phone that has not opened the app since a reinstall is not registered.",
              "Send yourself a message from the web app to test.",
            ),
            h("A crew member gets nothing"),
            ul(
              "They must be a member of the workspace and signed in on that device.",
              "Broadcasts go to workspace contacts — somebody removed from the workspace stops receiving them.",
              "A phone that has been offline for days receives queued notifications when it reconnects, or not at all if they have expired.",
            ),
            h("Delivery recipients are not getting emails"),
            ul(
              "The stop needs a recipient email address. Without one, no email is possible.",
              "The route's own notification settings control the heads-up and the proof-of-delivery emails.",
              "Failed stops never send a proof-of-delivery email — by design. The office handles those by hand.",
              "Each recipient gets each email once, so a resend will not go out twice.",
              "Email sending must be configured for your workspace. If no recipient on any route has ever received anything, that is the thing to check first.",
            ),
            warn(
              "Ask the recipient to check spam before you conclude nothing was sent. Transactional email with a photo in it lands in junk more often than you would like.",
            ),
            see("delivery-routes/tracking-links-and-notifications", "teamspace/messages-and-broadcasts"),
          ],
        },
      ],
    },
  ],
};
