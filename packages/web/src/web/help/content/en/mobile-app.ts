import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const mobileApp: Category = {
  slug: "mobile-app",
  title: "Mobile app",
  summary: "Capture watermarked photos and video on iPhone, iPad or Android.",
  icon: "Smartphone",
  sections: [
    {
      title: "Capture",
      articles: [
        {
          slug: "sign-in-on-mobile",
          title: "Sign in on your phone",
          summary: "Get into the app and pick the workspace you are capturing for.",
          keywords: ["login", "sign in", "workspace", "switch"],
          body: [
            p(
              "Sign in with the same email and password you use on the website, or with Google if that is how you signed up.",
            ),
            h("If you belong to more than one workspace"),
            p(
              "Your captures always go to the workspace that is currently open. Check the workspace name at the top of the screen before you start capturing — a photo filed to the wrong workspace has to be deleted and retaken.",
            ),
            steps(
              "Tap your avatar in the top corner.",
              "Choose the workspace you want.",
              "The project list reloads for that workspace.",
            ),
            h("Staying signed in"),
            p(
              "The app keeps you signed in. It does not sign you out when you lose signal, and it does not need a connection to open. If you are being asked for your password every time, your phone is clearing app storage in the background — check battery optimisation settings.",
            ),
            see("troubleshoot/cant-sign-in", "mobile-app/offline-capture-and-queue"),
          ],
        },
        {
          slug: "take-a-photo",
          title: "Take a photo",
          summary: "The core action: capture, stamp, upload.",
          keywords: ["capture", "camera", "photo", "shoot"],
          body: [
            steps(
              "Open the app and choose the project you are working on.",
              "Tap the capture button.",
              "Wait for the location indicator to settle — a moment outdoors is usually enough.",
              "Frame the shot and take it.",
              "Add a note if the photo needs explaining. Notes are searchable later.",
            ),
            h("What lands on the photo"),
            ul(
              "Date and time, checked against network time rather than the phone clock.",
              "GPS coordinates.",
              "The street address those coordinates resolve to.",
              "Your name and the project, if the template includes them.",
              "A unique photo code that can be verified by anyone.",
            ),
            h("Getting a good position"),
            ul(
              "Step outside or away from steel and concrete before capturing.",
              "Give the phone a few seconds after opening the app — the first fix is the slowest.",
              "Indoors and underground, expect the address to be approximate. The coordinates are still recorded.",
            ),
            warn(
              "You cannot change the time, coordinates or address on a capture after the fact. If a photo is wrong, delete it and take another.",
            ),
            see("mobile-app/watermark-templates", "troubleshoot/gps-or-address-wrong"),
          ],
        },
        {
          slug: "record-a-video",
          title: "Record a video",
          summary: "Verified video with the same stamp as photos, up to your plan's clip length.",
          keywords: ["video", "record", "clip", "film", "length"],
          body: [
            p(
              "Video works exactly like photo capture: same watermark, same verified time and position, same upload behaviour. It is a separate button on the capture screen.",
            ),
            h("Clip length by plan"),
            ul(
              "Free — 30-second clips, available for the first three days after the workspace is created.",
              "Plus — full-length video for one person.",
              "Business, Crew 10, Crew 25 — clips up to 3 minutes on every seat.",
              "Delivery plans — 3-minute clips included.",
            ),
            h("Recording well"),
            ul(
              "Hold the shot on anything important for three full seconds. Panning fast makes video useless as evidence.",
              "Narrate what you are showing. The audio is part of the record.",
              "Record in short, purposeful clips rather than one long walkthrough — they upload faster and are far easier to find later.",
            ),
            note(
              "Video files are large. On a metered connection, let clips upload over Wi-Fi at the end of the day rather than over cellular.",
            ),
            see("plans-billing/compare-plans", "mobile-app/photo-quality-and-storage"),
          ],
        },
        {
          slug: "offline-capture-and-queue",
          title: "Capture with no signal",
          summary: "Work anywhere — captures queue on the device and upload when signal returns.",
          keywords: ["offline", "queue", "no signal", "sync", "upload", "basement"],
          body: [
            p(
              "GeoCliks is built for places without coverage. Everything works offline except uploading. There is no special mode to switch on.",
            ),
            h("What happens offline"),
            ul(
              "The camera, the watermark and the GPS all work normally — GPS does not need a data connection.",
              "Each capture is written to the device with its real capture time.",
              "The queue screen shows what is waiting to upload.",
              "As soon as there is a connection, the queue empties itself in the background.",
            ),
            h("The time on an offline capture"),
            p(
              "The recorded time is when you pressed the button, not when the photo finally uploaded. Uploading late does not weaken the record.",
            ),
            warn(
              "Do not delete and reinstall the app while captures are still queued. Anything not yet uploaded is gone. Check the queue is empty first.",
            ),
            h("If the queue is stuck"),
            ul(
              "Open the app and leave it in the foreground for a minute on a good connection.",
              "Confirm you are still signed in.",
              "Check that the phone is not in low-data or battery-saver mode, which blocks background transfers.",
            ),
            see("troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "assign-capture-to-project",
          title: "Put captures in the right project",
          summary: "Choose the project before you shoot, or move photos afterwards.",
          keywords: ["project", "assign", "move", "file", "organise"],
          body: [
            p(
              "Every capture belongs to a project. The project drives reports, the map and what your client sees, so getting it right saves cleanup later.",
            ),
            h("Before you capture"),
            steps(
              "Open the project list.",
              "Tap the job you are on. It stays selected until you change it.",
              "Capture as normal — everything files itself there.",
            ),
            h("Moving a capture afterwards"),
            p(
              "Managers, admins and the owner can move captures between projects from Teamspace. Moving a photo changes only which project it belongs to; the time, position, address and photo code are untouched, and the verification record still checks out.",
            ),
            note(
              "If your crew keeps filing to the wrong job, the usual cause is a stale project selection from the previous day. Ask them to check the project name on the capture screen each morning.",
            ),
            see("teamspace/create-a-project", "teamspace/browse-and-filter-photos"),
          ],
        },
      ],
    },
    {
      title: "Watermarks and settings",
      articles: [
        {
          slug: "watermark-templates",
          title: "Watermark templates",
          summary: "Decide what appears on every photo, and put your logo on it.",
          keywords: ["watermark", "template", "logo", "branding", "stamp", "fields"],
          body: [
            p(
              "A watermark template is the layout of the stamp burned into your captures. It is set per workspace, so every crew member's photos come out consistent.",
            ),
            h("Fields you can show or hide"),
            ul(
              "Date and time",
              "GPS coordinates",
              "Street address",
              "Project name",
              "The name of the person capturing",
              "A free-text note or job number",
              "Your company logo",
            ),
            h("Editing the template"),
            steps(
              "In Teamspace, open Watermarks.",
              "Choose a template or create a new one.",
              "Toggle the fields you want and upload your logo.",
              "Save. New captures use it immediately; existing photos keep the stamp they were taken with.",
            ),
            warn(
              "Changing a template never changes photos already taken. This is deliberate — a stamp that could be rewritten afterwards would not be evidence.",
            ),
            h("How many templates you get"),
            ul(
              "Free — 2 templates.",
              "Plus and above — all templates plus your own logo.",
            ),
            see("teamspace/watermark-template-library", "mobile-app/switch-template"),
          ],
        },
        {
          slug: "switch-template",
          title: "Switch template on the job",
          summary: "Use a different stamp for one client or one job type.",
          keywords: ["switch", "change template", "default", "per project"],
          body: [
            p(
              "Most teams use one template for everything. When you need a different one — a client who wants their own job number on every photo, or an inspection that needs extra fields — switch it on the capture screen.",
            ),
            steps(
              "On the capture screen, tap the template name.",
              "Pick the template you want.",
              "Capture. The choice sticks until you change it back.",
            ),
            note(
              "Your workspace has one default template, used whenever nobody has chosen otherwise. Managers set the default in Teamspace under Watermarks.",
            ),
            see("teamspace/watermark-template-library"),
          ],
        },
        {
          slug: "photo-quality-and-storage",
          title: "Photo quality and storage",
          summary: "Balance image quality against upload speed and phone storage.",
          keywords: ["quality", "resolution", "storage", "size", "original", "data"],
          body: [
            h("Quality setting"),
            p(
              "Higher quality means better evidence and slower uploads. For most documentation work the standard setting is enough — it stays legible when printed in a report. Raise it when fine detail matters, like hairline cracks or serial numbers.",
            ),
            h("Keeping the original"),
            p(
              "You can have the app save an unwatermarked original to your camera roll alongside the stamped version. Useful when you need a clean image for a different purpose. It roughly doubles the storage each capture uses on the phone.",
            ),
            h("Freeing up space"),
            ul(
              "Captures that have finished uploading can be cleared from the device — they stay in Teamspace.",
              "Video is what fills a phone. Clear uploaded clips first.",
              "Never clear anything still sitting in the upload queue.",
            ),
            see("mobile-app/offline-capture-and-queue", "mobile-app/app-settings"),
          ],
        },
        {
          slug: "notifications",
          title: "Notifications",
          summary: "What the app tells you about, and how to quieten it.",
          keywords: ["notifications", "push", "alerts", "silence", "mute"],
          body: [
            h("What GeoCliks sends"),
            ul(
              "Upload finished, or upload failed and needs your attention.",
              "A direct message or a broadcast from your office.",
              "A route assigned to you, and reminders as you approach a stop.",
              "Invitations and role changes.",
            ),
            h("Turning them down"),
            steps(
              "Open Settings in the app.",
              "Open Notifications.",
              "Turn off the categories you do not need.",
            ),
            note(
              "If you are a driver, leave route notifications on. Dispatch uses them to tell you when a stop has been added to a run already in progress.",
            ),
            see("troubleshoot/notifications-not-arriving"),
          ],
        },
        {
          slug: "app-settings",
          title: "App settings",
          summary: "Language, theme, gridlines, shutter sound and the rest.",
          keywords: ["settings", "language", "theme", "dark mode", "gridlines", "sound"],
          body: [
            h("Language"),
            p(
              "GeoCliks is available in 11 languages. Your choice applies to this device only, so a crew can each read the app in their own language inside one workspace. Leave it on the workspace default to follow whatever the office picked.",
            ),
            h("Appearance"),
            p(
              "Light and dark themes are both available. Dark is easier on the eyes in a truck at night; light is more readable in direct sun.",
            ),
            h("Capture aids"),
            ul(
              "Gridlines — a framing grid in the viewfinder. It is not captured in the photo.",
              "Shutter sound — turn it off for quiet sites. Some countries require it by law and it cannot be disabled there.",
              "Save original — keep an unwatermarked copy on the device.",
            ),
            h("Your profile"),
            p(
              "Your name, photo and password live in Profile. Your name appears on captures when the template includes it, so keep it as your crew would recognise you.",
            ),
            see("mobile-app/photo-quality-and-storage", "teamspace/roles-and-permissions"),
          ],
        },
      ],
    },
  ],
};
