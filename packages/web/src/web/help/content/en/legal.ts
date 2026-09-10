import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const legal: Category = {
  slug: "legal",
  title: "Privacy & legal",
  summary:
    "Who owns the evidence, how long it is kept, and what the Privacy Policy and Terms actually say.",
  icon: "Scale",
  sections: [
    {
      title: "Your data",
      articles: [
        {
          slug: "data-ownership",
          title: "Who owns your captures",
          summary:
            "You keep your photos and videos. What GeoCliks is allowed to do with them, and what it is not.",
          keywords: ["ownership", "own", "rights", "licence", "license", "content", "training"],
          body: [
            p(
              "You own everything you upload: the photos, the videos, the project data, the notes. GeoCliks stores it and proves it has not changed. It does not become ours by being uploaded.",
            ),
            h("What we are allowed to do with it"),
            p(
              "The Terms give GeoCliks a narrow licence — host, store, transmit, resize, index and display your captures — and only so the product can work for you and for the people you share with. That is the whole scope.",
            ),
            ul(
              "We do not sell your content.",
              "We do not use it to train machine-learning models for third parties.",
              "We do not show it to anyone you have not shared it with.",
            ),
            h("The workspace owns the record, not the individual"),
            p(
              "Captures belong to the workspace they were taken in, not to the crew member who pressed the shutter. This is deliberate, and it is what makes the evidence record hold together:",
            ),
            ul(
              "Removing a member keeps every photo they took, and keeps their entries in the capture history.",
              "Deleting a project does not delete its captures.",
              "A member who leaves loses access to the workspace's content but does not take it with them.",
            ),
            note(
              "If you are in a workspace you do not own and you want something about your captures changed, ask the workspace owner first. For that content GeoCliks acts on the workspace's instructions.",
            ),
            h("What you are responsible for"),
            p(
              "You confirm you have the right to take and upload what you upload — including any permission needed from the people, property owners or site operators in the frame. GeoCliks does not check that for you.",
            ),
            h("What the seal proves, and what it does not"),
            p(
              "The code, hash and signature on every capture make undetected tampering hard, and let anyone check that a file has not changed since it arrived. They do not make GeoCliks a notary, a surveyor or a legal service, and no court, insurer or client is obliged to accept the record. That decision is always theirs.",
            ),
            see("verify/how-sealing-works", "legal/data-retention", "legal/terms-summary"),
          ],
        },
        {
          slug: "data-retention",
          title: "How long your data is kept",
          summary:
            "What survives a deleted project, a removed member, a cancelled plan, and a closed workspace.",
          keywords: [
            "retention",
            "delete",
            "deletion",
            "keep",
            "storage",
            "cancel",
            "close account",
            "erase",
          ],
          body: [
            p(
              "The short version: workspace content is kept for as long as the workspace exists. Almost nothing else removes it.",
            ),
            table(
              ["What you do", "What happens to the captures"],
              [
                ["Delete a project", "Captures are kept. The evidence record is not tied to the project."],
                ["Remove a member", "Their photos and their history entries stay with the workspace."],
                ["Delete your own account", "Your profile and credentials go. Captures you took in someone else's workspace stay with that workspace."],
                ["Cancel a paid plan", "Nothing is deleted. The workspace drops to the free plan and paid features stop."],
                ["Close the workspace", "Everything goes, and it cannot be undone."],
              ],
            ),
            h("Cancelling is not deleting"),
            p(
              "Downgrading or cancelling never destroys captures. You keep your history, and every photo code that has already been handed to a client keeps resolving on the public verification page. What you lose are the features above the free limits — extra seats, share links, the richer export formats.",
            ),
            h("Closing a workspace for good"),
            p(
              "There is no self-serve delete button for a whole workspace, on purpose — it is far too easy to destroy an evidence record by accident.",
            ),
            steps(
              "The workspace owner emails support@geocliks.com from the address on the owner account.",
              "Export anything you want to keep first — PDF, Excel, ZIP or KMZ.",
              "We confirm the request, then remove the workspace and its captures.",
            ),
            warn(
              "Workspace deletion is permanent. Captures, projects, reports and photo codes all go, and every verification link handed to a client stops resolving. Export first.",
            ),
            h("Backups and logs"),
            p(
              "Backups and security logs are kept for a limited period and then rotated out, so a deletion can take a little while to work through every copy.",
            ),
            h("Asking for your own data"),
            p(
              "You can ask us to access, correct, export or delete your personal data. Most of it you can change yourself in your profile and billing settings. For anything else, email support@geocliks.com from the address on your account.",
            ),
            see("legal/data-ownership", "plans-billing/cancel-or-downgrade", "legal/privacy-summary"),
          ],
        },
      ],
    },
    {
      title: "The legal documents",
      articles: [
        {
          slug: "privacy-summary",
          title: "Privacy Policy, in plain words",
          summary:
            "What GeoCliks collects, why, who else sees it, and the choices you have. A summary, not a replacement.",
          keywords: ["privacy", "policy", "gdpr", "personal data", "location", "cookies", "rights"],
          body: [
            p(
              "This is a plain reading of the Privacy Policy so you know what is in it. The policy itself is the document that counts, and it is at geocliks.com/privacy.",
            ),
            h("What is collected"),
            ul(
              "Account data: name, email, a hash of your password (never the password), profile photo, language, theme, and your two-factor secret if you turn it on.",
              "Workspace data: workspace and project names, clients, locations, roles, invitations, templates and reports.",
              "Captures: the photo or video plus its timestamp, coordinates, resolved address, device capture time, photo code, content hash and signature.",
              "Messages: direct messages and broadcasts inside the workspace, including attached images.",
              "Device data: app version, platform, IP address, push token, error logs and basic usage events.",
              "Billing data: your plan, subscription status and the identifiers the payment processor returns. Card numbers never reach us.",
            ),
            note(
              "GeoCliks does not want government ID numbers, health information or other sensitive categories. Keep them out of project names, notes and messages.",
            ),
            h("Location and camera"),
            p(
              "The app asks for camera and location because a capture is a photo plus where and when. You can refuse either permission and the app still runs — but a capture without location carries no coordinates and no address, which is most of what makes it evidence. Location is read at the moment of capture and to place pins on your map. There is no background tracking.",
            ),
            h("Who else sees it"),
            p(
              "Your data is not sold and never shared for advertising. A small set of providers process it on our instructions: cloud hosting and storage, the payment processor (and Apple for in-app purchases), the email provider, the push notification service, and the mapping provider that resolves addresses.",
            ),
            h("Share links are genuinely public"),
            p(
              "Share links and verification pages work for anyone holding the link, with no sign-in. That is the point of them. Revoking a link stops future access but cannot pull back a copy someone already downloaded.",
            ),
            h("Your rights"),
            p(
              "Subject to local law you can ask to access, correct, export or delete your personal data, restrict or object to some processing, and withdraw consent. Email support@geocliks.com from the address on your account. In Canada you may also complain to the Office of the Privacy Commissioner; in the EEA or UK, to your local supervisory authority.",
            ),
            h("Cookies"),
            p(
              "Only what the product needs: keeping you signed in, remembering language and theme, and holding captures queued while you are offline. No advertising or cross-site tracking cookies.",
            ),
            note(
              "The Privacy Policy and Terms are published in English only, on purpose. Machine-translating legal text can change what it means.",
            ),
            see("legal/data-retention", "teamspace/share-links", "legal/terms-summary"),
          ],
        },
        {
          slug: "terms-summary",
          title: "Terms of Service, in plain words",
          summary:
            "The obligations on both sides, the limits GeoCliks is explicit about, and what happens if you stop paying.",
          keywords: ["terms", "tos", "agreement", "liability", "acceptable use", "billing", "seats"],
          body: [
            p(
              "A plain reading of the Terms. The document at geocliks.com/terms is the one that binds; this is here so nothing in it surprises you.",
            ),
            h("Who can use it"),
            p(
              "You must be 16 or older. If you sign up for a company, you are confirming you are allowed to accept the Terms on its behalf.",
            ),
            h("Limits GeoCliks states openly"),
            p(
              "The Terms are unusually direct about what the product cannot promise, and it is worth reading that list rather than assuming:",
            ),
            ul(
              "GeoCliks is not a notary, a surveyor, a laboratory or a legal service, and nothing it produces is legal advice.",
              "A network-verified timestamp means our server recorded when the upload arrived — not that the device clock was right.",
              "When a device clock differs from ours by more than a few minutes, the capture is marked device-timed instead.",
              "Location accuracy depends on the phone and its surroundings; indoors and between tall buildings it can be well off.",
              "Offline captures are sealed as verified only once they reach our servers.",
              "No court, insurer, client or authority is obliged to accept a GeoCliks record.",
            ),
            h("What you agree not to do"),
            ul(
              "Use the Service unlawfully, or to harass, surveil or intimidate anyone.",
              "Upload content you have no right to upload.",
              "Alter, forge or strip a stamp, hash, signature or photo code, or pass off altered material as a GeoCliks record.",
              "Probe, overload or interfere with the Service, or work around rate limits and plan quotas.",
              "Resell the Service, or share one seat between several people.",
            ),
            warn(
              "Seats are per person, not per device. One crew member can sign in on a phone, a tablet and the web — but two people sharing a login breaches the Terms and makes the capture history useless, because every photo is attributed to whoever owns the seat.",
            ),
            h("Billing"),
            p(
              "Paid plans renew automatically until cancelled. Web subscriptions are billed by our payment processor; subscriptions bought inside the iOS app are billed by Apple and follow Apple's refund process. Prices exclude tax. Fees already paid are not refunded except where the law requires it.",
            ),
            p(
              "If a payment fails or you cancel, the workspace moves to the free plan and paid features stop. Your captures stay.",
            ),
            h("Suspension"),
            p(
              "We can suspend or end access for a breach of the Terms, for use that endangers the Service or other customers, or where the law requires it. Where it is reasonable to do so we warn you first and give you a chance to export.",
            ),
            h("Availability and liability"),
            p(
              "There is no contractual uptime guarantee unless you have signed a separate written agreement with us. The Service is provided as is, and total liability for any claim is capped at what you paid in the twelve months before it arose. Some jurisdictions do not allow parts of that, and there those limits apply only as far as the law permits.",
            ),
            h("Changes"),
            p(
              "Material changes to the Terms or the Privacy Policy are announced in the app or by email before they take effect. Questions about either document go to support@geocliks.com.",
            ),
            see("legal/data-ownership", "plans-billing/seats-and-billing", "verify/verify-results-explained"),
          ],
        },
      ],
    },
  ],
};
