import { type Category, h, note, p, see, steps, ul } from "../../types";

export const gettingStarted: Category = {
  slug: "getting-started",
  title: "Getting started",
  summary: "New to GeoCliks? Pick the path that matches who you are.",
  icon: "Rocket",
  sections: [
    {
      title: "Basics",
      articles: [
        {
          slug: "what-is-geocliks",
          title: "What is GeoCliks?",
          summary:
            "Field evidence you can prove: every photo carries a verified time, GPS position and street address.",
          keywords: ["overview", "about", "product", "introduction"],
          body: [
            p(
              "GeoCliks is a photo and video documentation tool for field crews. You capture work on a phone, and every capture is stamped with the time it was taken, where it was taken, and the street address that position resolves to. The stamp is burned into the image and recorded separately so it can be checked later.",
            ),
            p(
              "The point is not prettier photos. The point is that when a client, an insurer or a court asks whether a photo is what you say it is, you have an answer that does not depend on your word.",
            ),
            h("What you get"),
            ul(
              "Watermarked photos and video with verified time, GPS coordinates and address.",
              "A unique photo code on every capture that anyone can check without an account.",
              "Teamspace: a shared workspace where the office sees crew captures as they upload.",
              "Projects, map view, before-and-after comparisons, and one-click PDF, Excel, ZIP and KMZ exports.",
              "Delivery Routes: plan a driver's day, send them out, and close every stop with a proof photo.",
            ),
            h("Who uses it"),
            ul(
              "Construction and trades crews documenting progress and closeout.",
              "Restoration and insurance work where the timeline is the whole argument.",
              "Utilities, telecom and inspection teams that need a location on every record.",
              "Delivery operations that need proof a parcel actually arrived.",
            ),
            note(
              "GeoCliks works offline. Captures queue on the device and upload themselves when signal comes back, with the original capture time intact.",
            ),
            see("getting-started/create-your-account", "verify/what-is-a-photo-code"),
          ],
        },
        {
          slug: "create-your-account",
          title: "Create your account",
          summary: "Sign up in the app or on the web — the same account works everywhere.",
          keywords: ["sign up", "register", "new account", "email"],
          body: [
            p(
              "One GeoCliks account works across the mobile app, the website and the desktop app. Create it wherever is convenient; you are not making a second account by signing up in a different place.",
            ),
            h("Sign up"),
            steps(
              "Open the GeoCliks app, or go to geocliks.com and choose Sign up.",
              "Enter your name, work email and a password, or continue with Google.",
              "Check your inbox for the verification email and open the link.",
              "Pick a language. You can change it later from your profile.",
            ),
            note(
              "Use your work email, not a personal one. When somebody invites you to a workspace they will send the invitation to the address they know.",
            ),
            h("If the verification email does not arrive"),
            ul(
              "Wait two minutes and check the spam or junk folder.",
              "Confirm the address you typed — a missing letter is the usual cause.",
              "Request a new link from the sign-in screen.",
            ),
            see("getting-started/for-solo-user", "troubleshoot/cant-sign-in"),
          ],
        },
        {
          slug: "install-the-app",
          title: "Install the app",
          summary: "Get GeoCliks on iPhone, iPad or Android, and use the web app on a computer.",
          keywords: ["download", "ios", "android", "install", "desktop"],
          body: [
            p(
              "Capturing happens on a phone or tablet. Reviewing, reporting and route planning are easier on a computer, but everything is available on both.",
            ),
            h("Mobile"),
            ul(
              "iPhone and iPad: install from the App Store.",
              "Android: install from Google Play.",
              "Or open geocliks.com/get-app on the device and follow the link for your platform.",
            ),
            h("Computer"),
            p(
              "Go to geocliks.com and sign in. There is nothing to install — Teamspace runs in the browser. A desktop app is also available if you prefer a separate window.",
            ),
            h("Permissions the app asks for"),
            ul(
              "Camera — required. Without it there is nothing to capture.",
              "Location — required. The GPS position is half of what makes a capture evidence.",
              "Photos — optional, only if you want captures saved to your camera roll as well.",
              "Notifications — optional, for uploads, messages and route assignments.",
            ),
            note(
              "Set location permission to 'While using the app' at minimum. On 'Ask every time' the app has to interrupt you before each capture.",
            ),
            see("mobile-app/sign-in-on-mobile", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Pick your path",
      articles: [
        {
          slug: "for-solo-user",
          title: "If you work on your own",
          summary: "The fastest setup for a one-person operation.",
          keywords: ["solo", "single user", "freelancer", "one person"],
          body: [
            p(
              "You do not need a team to get value out of GeoCliks. A solo account gives you watermarked captures, projects to keep jobs apart, and exports you can hand to a client.",
            ),
            h("Set yourself up in five minutes"),
            steps(
              "Install the app and sign in.",
              "Create your first project — usually the job address or the client name.",
              "Open the watermark template and add your logo, so exports look like yours.",
              "Take a test capture and check the stamp shows the right time and address.",
              "Export it to PDF to see what your client will receive.",
            ),
            h("What to do as the work grows"),
            ul(
              "Keep one project per job. It keeps reports clean and the map readable.",
              "Use before-and-after comparisons at the start and end of every job.",
              "Send clients a share link instead of an email attachment — it stays current.",
            ),
            note(
              "The Free plan covers watermarked photos, 30-second video for the first three days, and PDF export up to 20 photos. Plus lifts the photo and video limits for one person.",
            ),
            see("teamspace/create-a-project", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "for-team-owner",
          title: "If you run the team",
          summary: "Create the workspace, invite the crew, and decide who can do what.",
          keywords: ["owner", "admin", "setup", "workspace", "manager"],
          body: [
            p(
              "The workspace owner sets up Teamspace once and everybody else joins it. Do this on a computer — it is faster than on a phone.",
            ),
            h("Setup order that works"),
            steps(
              "Create the workspace and give it your company name.",
              "Build a watermark template with your logo and the fields you want on every photo.",
              "Create your live projects before you invite anyone, so the crew has somewhere to put captures.",
              "Invite the crew by email, or share the join link or printed QR code.",
              "Set each person's role. Most of the crew should be Field.",
              "Take one capture yourself and confirm it lands in the right project.",
            ),
            h("Roles"),
            ul(
              "Owner — full control including billing and deleting the workspace. There is one.",
              "Admin — everything the owner can do except billing and ownership.",
              "Manager — creates projects and routes, invites people, runs reports.",
              "Field — captures photos and video, runs assigned routes, sees their own work.",
            ),
            note(
              "Invite people as Field unless they need to create projects or run reports. You can raise a role at any time; it takes effect the next time they open the app.",
            ),
            see("teamspace/invite-your-crew", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "for-crew-member",
          title: "If you were invited to a team",
          summary: "Join the workspace and take your first capture.",
          keywords: ["field", "crew", "join", "invited", "member"],
          body: [
            p(
              "Somebody at your company set up a workspace and added you to it. Your job is to capture work in the field; the office handles projects, reports and billing.",
            ),
            h("Join"),
            steps(
              "Open the invitation email, or scan the QR code your manager gives you.",
              "Create your account, or sign in if you already have one.",
              "Install the GeoCliks app on your phone.",
              "Allow camera and location. Both are required to capture.",
              "Open the project list and pick the job you are working on.",
            ),
            h("Your first capture"),
            steps(
              "Tap the capture button.",
              "Check the watermark preview shows the right project and address.",
              "Take the photo. It uploads on its own.",
              "If you have no signal, keep working — captures queue and upload later.",
            ),
            note(
              "You cannot edit the time or location on a capture, and neither can your manager. That is the point of the product, not a limitation.",
            ),
            see("mobile-app/take-a-photo", "mobile-app/offline-capture-and-queue"),
          ],
        },
      ],
    },
  ],
};
