import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const verify: Category = {
  slug: "verify",
  title: "Verification",
  summary:
    "Every capture carries a code anybody can check, and a seal that shows whether it has been altered.",
  icon: "ShieldCheck",
  sections: [
    {
      title: "Checking a capture",
      articles: [
        {
          slug: "what-is-a-photo-code",
          title: "What is a photo code?",
          summary:
            "The short code printed on every capture, and the public page it leads to.",
          keywords: ["code", "photo code", "verify", "public", "qr", "proof"],
          body: [
            p(
              "Every capture gets a unique code, printed in the watermark and carried into every report and export. It looks like this:",
            ),
            ul("GC-4K7P-92XB-1DQ4"),
            p(
              "The code is the handle on that one capture. Anybody who has it — a client, an insurer, an adjuster, a lawyer — can look it up on the public verification page without an account, without the app, and without asking you for anything.",
            ),
            h("Where the code appears"),
            ul(
              "Burned into the watermark on the photo or video, if your template includes it.",
              "On every page of a PDF report.",
              "In the Excel export, one row per capture.",
              "As the filename of each image inside a ZIP export.",
              "In the proof-of-delivery email sent to a delivery recipient.",
            ),
            h("Why it matters"),
            p(
              "A photo on its own proves nothing — anybody can edit a timestamp into an image. A code that resolves to an independent record on your provider's server, showing the same time, the same coordinates and an intact seal, is a different kind of evidence. The person checking does not have to trust you.",
            ),
            note(
              "Codes are written as GC-XXXX-XXXX-XXXX but you can type them in lowercase, with spaces, without the prefix, or paste the whole verification link. All of that resolves to the same capture. Captures taken before the rename carry a TM- code instead; those still verify exactly as they always did, and the codes already printed in your old reports keep working.",
            ),
            see("verify/verify-a-photo", "verify/how-sealing-works"),
          ],
        },
        {
          slug: "verify-a-photo",
          title: "Verify a photo",
          summary: "How you or your client check a code, and what the page shows.",
          keywords: ["verify", "check", "lookup", "client", "public page", "scan"],
          body: [
            p(
              "Verification is public and takes a few seconds. Send a client the code and they can do it themselves.",
            ),
            h("Check a code"),
            steps(
              "Go to geocliks.com/v and enter the code, or open the link directly.",
              "Read the record: the workspace that owns the capture, when it was taken, where, and the integrity result.",
              "Compare it against the watermark on the photo in front of you. They should match exactly.",
            ),
            h("What the page shows"),
            table(
              ["Field", "Meaning"],
              [
                ["Owner", "The workspace the capture belongs to."],
                ["Captured", "The device time when the shutter fired."],
                ["Verified", "The server time when it arrived. Not settable from a phone."],
                ["Location", "Coordinates, accuracy, and the address they resolve to."],
                ["Integrity", "Whether the seal still matches the file and metadata."],
                ["Device", "The model and platform that captured it."],
                ["Content hash", "The fingerprint of the image bytes."],
              ],
            ),
            h("Why the image itself is sometimes hidden"),
            p(
              "The record is always public; the image is not. The picture is only shown when your workspace has published a live share link covering that capture. This is deliberate — a code that leaks from a report should not leak the photograph with it. Revoke the link and the image goes back to being private while the record stays checkable.",
            ),
            note(
              "Public verifications are written to the capture's own history, so you can see that a code was checked. Repeated loads inside half an hour count once, so a client refreshing the page does not bury the real events.",
            ),
            see("teamspace/share-links", "verify/verify-results-explained"),
          ],
        },
        {
          slug: "verify-results-explained",
          title: "Reading the result",
          summary: "Verified, unverified, tampered, and what a clock-skew warning means.",
          keywords: ["verified", "unverified", "tampered", "skew", "clock", "result", "warning"],
          body: [
            p("Every capture holds one of three integrity results."),
            table(
              ["Result", "Meaning"],
              [
                [
                  "Verified",
                  "The seal matches the file and the metadata. Nothing has changed since upload.",
                ],
                [
                  "Unverified",
                  "The seal could not be confirmed. Usually a capture from an older app version or an incomplete upload — not evidence of foul play.",
                ],
                [
                  "Tampered",
                  "The seal does not match. The file or its metadata was altered after upload.",
                ],
              ],
            ),
            h("Time source and clock skew"),
            p(
              "GeoCliks records two times: the device time when the photo was taken, and the server time when it arrived. The gap between them is stored.",
            ),
            ul(
              "Within about five minutes, the time source reads as network — normal, and expected.",
              "Beyond that, it reads as device, and the skew is shown on the record.",
            ),
            p(
              "A large skew is not automatically suspicious. A phone that has been offline for two days uploads with a genuine gap, and the skew explains it. What it does mean is that the device clock and the server clock disagree, and the record says so rather than quietly picking one.",
            ),
            h("Explaining a result to a client"),
            ul(
              "Verified: the record is intact, and this is what verification is for.",
              "Unverified: offer the original from your workspace, which still carries its full history.",
              "Tampered: stop and look at where the file has been. Do not send it on.",
            ),
            warn(
              "Editing a photo outside GeoCliks — cropping, compressing, running it through a chat app — changes the bytes and breaks the seal. Send the original from your workspace or from a report, never a version that has been through something else.",
            ),
            see("verify/how-sealing-works", "troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "how-sealing-works",
          title: "How sealing works",
          summary: "The three things a device cannot forge on its own, in plain terms.",
          keywords: ["hash", "signature", "hmac", "sha-256", "seal", "tamper", "security"],
          body: [
            p(
              "You do not need this article to use GeoCliks. It is here for the person on the other side of a dispute who wants to know why the record should be believed.",
            ),
            h("1. Two clocks, both recorded"),
            p(
              "The capture time comes from the device. The verification time is stamped by the GeoCliks server when the file arrives, and no phone setting can influence it. Both are kept, along with the difference. Changing a phone's clock moves the capture time and immediately shows up as a gap against the server time.",
            ),
            h("2. A fingerprint of the file"),
            p(
              "A SHA-256 hash of the uploaded image bytes is stored with the record. Change one pixel and the hash no longer matches. It is a fingerprint, not a copy — it says nothing about the picture's contents.",
            ),
            h("3. A signature over the whole record"),
            p(
              "The photo code, the owning workspace, the capturing user, the storage location, both timestamps, the coordinates and the content hash are combined in a fixed order and signed with a secret key held only by the server. Alter any one of those values afterwards and the signature no longer matches, which is what produces a Tampered result.",
            ),
            h("What this does and does not prove"),
            ul(
              "It proves the file and its metadata have not changed since GeoCliks received them.",
              "It proves the arrival time independently of the device.",
              "It does not prove the phone was pointed at something truthful. No system can. What it removes is the possibility of quietly changing the record afterwards.",
            ),
            note(
              "Signature comparison is done in constant time, so the check itself cannot be probed to work out the key.",
            ),
            see("verify/verify-results-explained", "legal/data-ownership"),
          ],
        },
      ],
    },
  ],
};
