import { Link } from "wouter";
import { Clock, Compass, Hash, ImageDown, ShieldCheck, WifiOff } from "lucide-react";
import {
  LandingCards,
  LandingCta,
  LandingFaq,
  LandingPage,
  LandingSection,
  LandingSteps,
} from "../components/landing-page";
import { pageFaq } from "../lib/page-schema";

/**
 * Search landing page for "gps timestamp camera" and its neighbours
 * ("timestamp camera app", "gps camera app", "photo with date and location").
 *
 * The one page here whose query is tool-led rather than problem-led. Someone
 * typing this has already decided they want a stamping camera and is choosing
 * between apps, so the page has to answer "how is this different from the free
 * stamp apps" in the first band instead of explaining why proof matters. The
 * answer is the same one the whole product rests on — the time is verified
 * against the network rather than read from the handset — so this page is where
 * that distinction is spelled out at length and the other pages link back to it.
 *
 * Kept distinct from the home page by staying on the camera itself: what gets
 * stamped, what the stamp is worth, and what the free apps do instead. The
 * crew, project and reporting machinery belongs to the other pages.
 */

const STEPS = [
  {
    title: "Open the camera and shoot",
    body: "One tap in the GeoCliks app. There is no separate 'add stamp' step to forget — a capture is stamped or it is not a capture.",
  },
  {
    title: "The time is checked, not trusted",
    body: "The capture time is verified against our servers. If the device clock disagrees by more than a few minutes, the photo is marked device-timed rather than quietly passing as verified.",
  },
  {
    title: "Location is read and resolved",
    body: "GPS coordinates, the accuracy radius and the reverse-geocoded street address are written into the image and stored as metadata.",
  },
  {
    title: "The photo gets a code",
    body: "A SHA-256 hash of the image bytes, a signature and a unique photo code, so anyone can later check the file is the untouched original.",
  },
];

const STAMP_CARDS = [
  {
    icon: Clock,
    title: "Network-verified time",
    body: "The date on a normal timestamp camera is whatever the phone says, and a phone clock is a settings screen away from saying anything. Ours is verified server-side, and a mismatch is reported instead of hidden.",
  },
  {
    icon: Compass,
    title: "Coordinates, accuracy and address",
    body: "Latitude and longitude, the accuracy radius they were fixed to, and the street address they resolve to. The radius matters — a coordinate without one is a claim without a margin.",
  },
  {
    icon: Hash,
    title: "A hash and a public code",
    body: "Every capture is sealed with a content hash and given a code that resolves at geocliks.com/verify. Edit one pixel and the seal breaks, which the verification page reports.",
  },
];

const PRACTICAL_CARDS = [
  {
    icon: WifiOff,
    title: "Works with no signal",
    body: "Captures queue on the phone and seal when they reach our servers. Location is read at capture, so the stamp is where you were, not where you reconnected.",
  },
  {
    icon: ImageDown,
    title: "The stamp is in the image and the metadata",
    body: "Burned into the picture for anyone looking at it, and kept as structured metadata for anything reading it. A screenshot loses the metadata but keeps the visible stamp and the code.",
  },
  {
    icon: ShieldCheck,
    title: "Free to start, no watermark tax",
    body: "300 verified captures a month on the free plan, with verification included. The stamp is not a paid upgrade and there is no app logo across your photo.",
  },
];

const FAQ = pageFaq("/gps-timestamp-camera");

export default function GpsTimestampCamera() {
  return (
    <LandingPage
      path="/gps-timestamp-camera"
      eyebrow="GPS timestamp camera"
      h1="A GPS Timestamp Camera That Doesn't Trust Your Phone's Clock"
      sub="Verified time from the network, coordinates with their accuracy radius, the resolved street address — sealed into every photo and checkable by anyone."
    >
      <LandingSection
        label="The distinction that matters"
        h2="Every timestamp camera writes a date. Almost none of them check it."
        intro="The app stores are full of free stamping cameras, and they all work the same way: read the clock, read the GPS, draw the result on the picture. That is fine until the date is the thing being questioned — and then the whole record rests on a clock the photographer could have set to anything, in a file any editor could have rewritten. GeoCliks verifies the time against our servers, seals the image so edits are detectable, and gives the photo a code a third party can look up without asking you for anything."
      />

      <LandingSection label="How it works" h2="Four things happen when you press the shutter.">
        <LandingSteps steps={STEPS} />
      </LandingSection>

      <LandingSection
        label="What ends up on the photo"
        h2="Three pieces, and each one closes a different hole."
      >
        <LandingCards items={STAMP_CARDS} />
      </LandingSection>

      <LandingSection label="In day-to-day use" h2="Built for the field, not for a demo.">
        <LandingCards items={PRACTICAL_CARDS} />
      </LandingSection>

      <LandingSection label="Questions" h2="Frequently asked">
        <LandingFaq entries={FAQ} />
      </LandingSection>

      <LandingCta
        h2="Take a verified photo in the next minute"
        body="Free forever for 300 verified captures a month, no card. The stamp, the seal and the public verification page are included on every plan."
        primary={{ label: "Get the app", to: "/get-app" }}
        secondary={{ label: "See how sealing works", to: "/help/verify/how-sealing-works" }}
      />

      <section className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10">
          <p className="text-[13.5px] leading-relaxed text-fog">
            Going deeper:{" "}
            <Link
              to="/blog/can-a-gps-timestamp-photo-be-faked"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              can a GPS timestamp photo be faked?
            </Link>{" "}
            Or see the camera in a trade:{" "}
            <Link
              to="/construction-photo-documentation"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              construction
            </Link>
            ,{" "}
            <Link
              to="/roofing-photo-documentation"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              roofing
            </Link>{" "}
            and{" "}
            <Link
              to="/proof-of-delivery"
              className="font-semibold text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
            >
              delivery
            </Link>
            .
          </p>
        </div>
      </section>
    </LandingPage>
  );
}
