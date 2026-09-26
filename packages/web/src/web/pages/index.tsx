import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "motion/react";
import {
  ShieldCheck,
  MapPin,
  Users,
  FileStack,
  WifiOff,
  Fingerprint,
  Clock,
  ArrowRight,
  Globe2,
  Camera,
  GitCompareArrows,
  Layers,
  Route,
  Truck,
  Bell,
} from "lucide-react";
import { type TKey, useLocale, useT } from "../lib/i18n";
import { SiteFooter } from "../components/site-footer";
import { SiteNav } from "../components/site-nav";
import { scrollSiteToId } from "../lib/site-scroll";
import { useSeo } from "../lib/seo";
import { PAGE_SEO, seoForPath } from "../lib/seo-routes";

const INDUSTRIES: TKey[] = [
  "industry.construction",
  "industry.fiber",
  "industry.telecom",
  "industry.hvac",
  "industry.property",
  "industry.cleaning",
  "industry.security",
  "industry.delivery",
  "industry.retail",
  "industry.landscaping",
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const riseIn = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } },
};

/** The two cuts of the hero loop, and the framing each one needs. */
const HERO_CUTS = {
  /* 16:9, 2560x1440. The band is held at exactly this ratio from `lg` up, so on a
     normal screen it plays uncropped. */
  standard: {
    src: "/videos/hero-16x9",
    poster: "/videos/hero-poster-16x9.jpg",
    /* Barely off centre: what little the band does crop comes mostly off the
       ground, where nobody's face is. */
    position: "50% 38%",
  },
  /* 2.4:1, 3840x1600 — the same shots recut wide, each one panned to keep its
     subject inside the shorter frame. A cinema-wide monitor gets this instead of
     having a third of a 16:9 frame sliced off, which is what took the heads off. */
  wide: {
    src: "/videos/hero-wide",
    poster: "/videos/hero-poster-wide.jpg",
    /* Anchored near the top: the remaining trim comes off the foreground, and the
       plumber and the framer sit high enough in frame to need every pixel up there. */
    position: "50% 12%",
  },
} as const;

/**
 * Which cut of the hero loop this visitor gets, or null for no loop at all.
 *
 * Hiding the <video> in CSS was the first attempt and it does not work: Chrome
 * fetches the sources of a `display: none` video anyway, so a phone on cellular
 * still paid for several megabytes it would never see. So the element is kept
 * out of the tree entirely until the checks pass, which means no request. And
 * only the chosen cut is ever mounted, so a visitor downloads one file — the
 * `media` attribute on <source> would have been the tidy way to do this, but
 * browsers dropped it for video and honour it on <picture> only.
 *
 * It starts null so the server-rendered HTML and the first client paint agree —
 * the poster layer is what renders under both, and the loop swaps in a tick
 * later on the machines that want it.
 */
function useHeroFootage() {
  const [cut, setCut] = useState<keyof typeof HERO_CUTS | null>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 640px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    /* Matches the CSS: past this aspect the band is wider than the footage and
       `object-cover` starts eating into the frame, so the wide cut takes over. */
    const cinema = window.matchMedia("(min-aspect-ratio: 37/20)");
    const decide = () =>
      setCut(wide.matches && !still.matches ? (cinema.matches ? "wide" : "standard") : null);

    decide();
    for (const q of [wide, still, cinema]) q.addEventListener("change", decide);
    return () => {
      for (const q of [wide, still, cinema]) q.removeEventListener("change", decide);
    };
  }, []);

  return cut;
}

function Hero() {
  const t = useT();
  const cut = useHeroFootage();
  const footage = cut ? HERO_CUTS[cut] : null;

  return (
    <section className="hero-cinema relative overflow-hidden border-b border-line">
      {/* Trades-and-delivery footage behind the whole band. Muted and `playsInline`
          are what make an autoplaying video legal to browsers at all. The still
          underneath is a real layer rather than just the video's `poster`, because
          phones and reduced-motion users get the <video> removed outright and a
          poster attribute would go with it. Both are decorative: no captions, hidden
          from screen readers — every word in the hero is real text on top. */}
      {/* A <picture>, not a CSS background: with the collage gone this still is the
          hero's LCP element, and a background-image is only discovered once the
          stylesheet has parsed. In the markup it is fetched with the document —
          and `media` picks the right cut before React has even run. */}
      <picture className="contents">
        <source media="(min-aspect-ratio: 37/20)" srcSet={HERO_CUTS.wide.poster} />
        <img
          src={HERO_CUTS.standard.poster}
          alt=""
          aria-hidden="true"
          className="hero-still pointer-events-none absolute inset-0 size-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      {/* `preload="none"` rather than `auto`: the <picture> still above is this
          section's LCP element and is already fetched with the document, so
          pre-buffering the whole cut alongside it only competes for the same
          first-paint bandwidth — and on a phone it spent megabytes of someone's
          data on a decorative loop. `autoPlay` still fetches and starts the
          video; the browser just gets the document and the still first. */}
      {footage ? (
        <video
          key={footage.src}
          className="hero-footage pointer-events-none absolute inset-0 size-full object-cover"
          style={{ objectPosition: footage.position }}
          poster={footage.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        >
          {/* h264 only: VP9 at a matching quality came out heavier than x264 on
              footage this soft-edged, so the second file was pure page weight. */}
          <source src={`${footage.src}.mp4`} type="video/mp4" />
        </video>
      ) : null}
      <div className="hero-veil pointer-events-none absolute inset-0" />

      {/* The band tracks the footage's own shape rather than a fixed height, so
          `object-cover` has little left to crop and the faces at the edges of frame
          survive: 56.25vw is 16:9 exactly, and the 92vh ceiling is what stops a
          cinema-wide monitor from getting a hero taller than its screen. `min-h`
          rather than a fixed aspect so the band can still grow under the copy. */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex max-w-[1180px] flex-col items-center justify-center px-5 py-20 text-center lg:min-h-[min(56.25vw,92vh)] lg:py-24"
      >
        {/* 820 rather than 720: the body copy is four lines of it, and the narrower block broke
            "network-verified timestamp" across a line in the one sentence that has to land. */}
        <div className="max-w-[820px]">
          <motion.p
            variants={riseIn}
            className="rounded-[6px] mono inline-flex items-center gap-2 border border-amber/40 bg-amber/10 px-2.5 py-1 text-[11.5px] uppercase tracking-[0.2em] text-amber"
          >
            <ShieldCheck className="size-3.5" /> {t("home.hero.eyebrow")}
          </motion.p>

          {/* One H1, two readings of it. The visible line is the brand promise and stays
              exactly as designed; the sr-only span in front of it is what a crawler and a
              screen reader get, because "Proof your work happened." names no product, no
              industry and no search anyone runs. Both live inside the single H1 rather than
              as two competing headings, so the element's text content carries the keywords
              without the page having a second H1. */}
          <motion.h1
            variants={riseIn}
            className="mt-6 font-display text-[46px] font-extrabold leading-[1.03] tracking-tight text-chalk sm:text-[64px]"
          >
            <span className="sr-only">{t("home.hero.h1Seo")}</span>
            <span aria-hidden="true">
              {t("home.hero.title1")}
              <br />
              <span className="text-amber">{t("home.hero.title2")}</span>
            </span>
          </motion.h1>

          <motion.p
            variants={riseIn}
            className="mx-auto mt-6 max-w-[760px] text-[19px] leading-relaxed text-fog"
          >
            {t("home.hero.body")}
          </motion.p>

          <motion.div
            variants={riseIn}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/sign-up"
              className="rounded-[8px] mono inline-flex items-center gap-2 bg-amber px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-on-amber transition-colors hover:bg-amber-deep"
            >
              {t("home.nav.startFree")} <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/get-app"
              className="mono inline-flex items-center gap-2 rounded-[8px] border border-line px-5 py-3 text-[12px] uppercase tracking-widest text-chalk transition-colors hover:border-amber/60"
            >
              {t("home.hero.ctaFieldApp")}
            </Link>
          </motion.div>

          <motion.div
            variants={riseIn}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] text-fog"
          >
            <span className="flex items-center gap-1.5">
              <WifiOff className="size-4 text-amber" /> {t("home.hero.noSignal")}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe2 className="size-4 text-amber" /> {t("getapp.underButtons")}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function Evidence() {
  const t = useT();
  const rows: { icon: typeof Clock; title: TKey; body: TKey; mono: string }[] = [
    {
      icon: Clock,
      title: "home.evidence.r1.title",
      body: "home.evidence.r1.body",
      mono: "device 14:31:07 · network 14:31:09 · skew 2s · verified",
    },
    {
      icon: MapPin,
      title: "home.evidence.r2.title",
      body: "home.evidence.r2.body",
      mono: "43.65107° N  79.34015° W · ±4 m",
    },
    {
      icon: Fingerprint,
      title: "home.evidence.r3.title",
      body: "home.evidence.r3.body",
      mono: "GC-8QF2-40XR-91KD · integrity: intact",
    },
  ];

  return (
    <section id="evidence" className="border-b border-line">
      <div className="mx-auto max-w-[1180px] px-5 py-20">
        <p className="label">{t("home.evidence.label")}</p>
        <h2 className="mt-3 max-w-2xl font-display text-[32px] font-bold leading-tight tracking-tight text-chalk sm:text-[40px]">
          {t("home.evidence.h2")}
        </h2>
        <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-fog">
          {t("home.evidence.body")}
        </p>

        <div className="mt-12 grid gap-px bg-line md:grid-cols-3">
          {rows.map((row) => (
            <div key={row.title} className="bg-ink p-6">
              <row.icon className="size-5 text-amber" />
              <h3 className="mt-4 font-display text-[17px] font-semibold text-chalk">
                {t(row.title)}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-fog">{t(row.body)}</p>
              <p className="mono mt-4 border-l-2 border-amber/50 bg-ink-2 px-2.5 py-2 text-[10.5px] text-fog">
                {row.mono}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Teamspace() {
  const t = useT();
  return (
    <section id="teamspace" className="border-b border-line bg-ink-2/40">
      <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-5 py-20 lg:grid-cols-2">
        <div>
          <p className="label">{t("home.team.label")}</p>
          <h2 className="mt-3 font-display text-[32px] font-bold leading-tight tracking-tight text-chalk sm:text-[40px]">
            {t("home.team.h2")}
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-fog">{t("home.team.body")}</p>
          <ul className="mt-7 space-y-3">
            {[
              { icon: Users, text: "home.team.b1" as TKey },
              { icon: Layers, text: "home.team.b2" as TKey },
              { icon: Globe2, text: "home.team.b3" as TKey },
              { icon: Camera, text: "home.team.b4" as TKey },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-[14px] text-chalk">
                <item.icon className="size-4 shrink-0 text-amber" />
                {t(item.text)}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          {/* Codes are literals in the real GC-XXXX-XXXX-XXXX shape. The old grid
              derived them arithmetically and produced GC-3E8-VERIFIED, which is not
              a shape this product ever emits — bad look on a proof-of-work page. */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                file: "fiber-technician.jpg",
                alt: "home.samples.altFiber" as TKey,
                code: "GC-7QM4-18RT-04KP",
              },
              {
                file: "construction-framing.jpg",
                alt: "home.samples.altConstruction" as TKey,
                code: "GC-2XD9-73BV-51HN",
              },
              {
                file: "property-walkthrough.jpg",
                alt: "home.samples.altProperty" as TKey,
                code: "GC-9FA6-20LC-88YW",
              },
              {
                file: "hvac-install.jpg",
                alt: "home.samples.altHvac" as TKey,
                code: "GC-4RJ1-65NE-37TQ",
              },
            ].map((shot) => (
              <div key={shot.file} className="rounded-[12px] border border-line bg-ink-2 p-1.5">
                <div className="relative overflow-hidden">
                  <img
                    src={`/images/samples/${shot.file}`}
                    alt={t(shot.alt)}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-stretch bg-black/70">
                    <div className="w-[2px] bg-amber" />
                    <p className="mono px-1.5 py-1 text-[8.5px] tracking-wide text-white/90">
                      {shot.code}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Reports() {
  const t = useT();
  const formats: { name: string; note: TKey }[] = [
    { name: "PDF", note: "home.reports.f1" },
    { name: "Excel", note: "home.reports.f2" },
    { name: "ZIP", note: "home.reports.f3" },
    { name: "KMZ", note: "home.reports.f4" },
  ];

  return (
    <section id="reports" className="border-b border-line">
      <div className="mx-auto max-w-[1180px] px-5 py-20">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="label">{t("home.reports.label")}</p>
            <h2 className="mt-3 font-display text-[32px] font-bold leading-tight tracking-tight text-chalk sm:text-[40px]">
              {t("home.reports.headline")}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-fog">{t("home.reports.body")}</p>
            <div className="mt-7 grid grid-cols-2 gap-px bg-line">
              {formats.map((f) => (
                <div key={f.name} className="bg-ink px-4 py-3.5">
                  <p className="mono text-[13px] font-bold tracking-widest text-amber">{f.name}</p>
                  <p className="mt-1 text-[12px] text-fog">{t(f.note)}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 flex items-center gap-2 text-[13px] text-fog">
              <GitCompareArrows className="size-4 text-amber" />
              {t("home.reports.compare")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                file: "roof-damage.jpg",
                tag: "BEFORE",
                label: "tag.before" as TKey,
                alt: "home.compare.altBefore" as TKey,
              },
              {
                file: "roof-replaced.jpg",
                tag: "AFTER",
                label: "tag.after" as TKey,
                alt: "home.compare.altAfter" as TKey,
              },
              /* label is the badge burned over the corner of the image, alt is what a
                 crawler and a screen reader get. They were the same string until the alt
                 said only "Before", which describes nothing about the roof in the frame. */
            ].map(({ file, tag, label, alt }) => (
              <div key={file} className="rounded-[12px] border border-line bg-ink-2 p-2">
                <div className="relative overflow-hidden">
                  <img
                    src={`/images/samples/${file}`}
                    alt={t(alt)}
                    className="aspect-[3/4] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="rounded-[6px] mono absolute left-2 top-2 bg-amber px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-widest text-on-amber">
                    {t(label)}
                  </span>
                </div>
                <p className="mono px-1 pt-2 text-[10px] text-fog">
                  {tag === "BEFORE" ? "2026-08-12 09:14:22" : "2026-08-26 16:02:41"}
                </p>
              </div>
            ))}
            <div className="rounded-[12px] border border-line bg-ink-2 p-4 sm:col-span-2">
              <p className="label">{t("home.reports.manifest")}</p>
              <div className="mono mt-2.5 space-y-1 text-[11px] text-fog">
                <p>Maple Grove Roof Replacement — 42 photos</p>
                <p>Verified 42 / 42 · Located 42 / 42</p>
                <p>Generated by GeoCliks · sealed SHA-256</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field() {
  const t = useT();
  return (
    <section id="field" className="border-b border-line">
      <div className="mx-auto max-w-[1180px] px-5 py-20">
        <p className="label">{t("home.field.label")}</p>
        <div className="mt-3 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <h2 className="font-display text-[32px] font-bold leading-tight tracking-tight text-chalk sm:text-[40px]">
            {t("home.field.h2")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: WifiOff,
                title: "home.field.i1.title" as TKey,
                body: "home.field.i1.body" as TKey,
              },
              {
                icon: Camera,
                title: "home.field.i2.title" as TKey,
                body: "home.field.i2.body" as TKey,
              },
              {
                icon: FileStack,
                title: "home.field.i3.title" as TKey,
                body: "home.field.i3.body" as TKey,
              },
              {
                icon: ShieldCheck,
                title: "home.field.i4.title" as TKey,
                body: "home.field.i4.body" as TKey,
              },
            ].map((item) => (
              <div key={item.title}>
                <item.icon className="size-4.5 text-amber" />
                <h3 className="mt-3 font-display text-[15px] font-semibold text-chalk">
                  {t(item.title)}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-fog">{t(item.body)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-8">
          <p className="label">{t("home.field.industries")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => (
              <span
                key={industry}
                className="mono rounded-[8px] border border-line bg-ink px-2.5 py-1.5 text-[11px] uppercase tracking-widest text-fog"
              >
                {t(industry)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Delivery() {
  const t = useT();

  const benefits = [
    {
      icon: Route,
      title: "home.delivery.b1.title" as TKey,
      body: "home.delivery.b1.body" as TKey,
    },
    {
      icon: Truck,
      title: "home.delivery.b2.title" as TKey,
      body: "home.delivery.b2.body" as TKey,
    },
    {
      icon: Camera,
      title: "home.delivery.b3.title" as TKey,
      body: "home.delivery.b3.body" as TKey,
    },
    {
      icon: Bell,
      title: "home.delivery.b4.title" as TKey,
      body: "home.delivery.b4.body" as TKey,
    },
  ];

  /* Three types carry a photo; the remaining four stay text-only so the section
     reads in one screen instead of turning into a wall of stock imagery. */
  /* `name` is the heading under the photo, `alt` describes the photo itself. Reusing the
     name for both left three images announcing "Fleet and courier" — the category, not
     what is in the frame — which is the alt text equivalent of saying nothing. */
  const tiles = [
    {
      file: "fleet-vans.jpg",
      name: "home.delivery.t1.name" as TKey,
      body: "home.delivery.t1.body" as TKey,
      alt: "home.delivery.altT1" as TKey,
    },
    {
      file: "restaurant-pickup.jpg",
      name: "home.delivery.t2.name" as TKey,
      body: "home.delivery.t2.body" as TKey,
      alt: "home.delivery.altT2" as TKey,
    },
    {
      file: "grocery-totes.jpg",
      name: "home.delivery.t3.name" as TKey,
      body: "home.delivery.t3.body" as TKey,
      alt: "home.delivery.altT3" as TKey,
    },
  ];

  /* Spelled out rather than built from `t${n}` in a loop. The interpolated version cast to
     TKey, so the compiler could not see these four keys and neither could the dead-key
     sweep — it reported them unused and a first pass deleted them, which put the raw
     "home.delivery.t4.name" on the page. Written as literals they are checked again. */
  const more = [
    { name: "home.delivery.t4.name" as TKey, body: "home.delivery.t4.body" as TKey },
    { name: "home.delivery.t5.name" as TKey, body: "home.delivery.t5.body" as TKey },
    { name: "home.delivery.t6.name" as TKey, body: "home.delivery.t6.body" as TKey },
    { name: "home.delivery.t7.name" as TKey, body: "home.delivery.t7.body" as TKey },
  ];

  return (
    <section id="delivery" className="border-b border-line bg-ink-2/40">
      <div className="mx-auto max-w-[1180px] px-5 py-20">
        <p className="label">{t("home.delivery.label")}</p>

        <div className="mt-3 grid items-start gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-display text-[32px] font-bold leading-tight tracking-tight text-chalk sm:text-[40px]">
              {t("home.delivery.h2")}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-fog">{t("home.delivery.intro")}</p>
          </div>
          <div className="rounded-[12px] border border-line bg-ink-2 p-2">
            <img
              src="/images/delivery/doorstep-proof.jpg"
              alt={t("home.delivery.heroAlt")}
              className="aspect-[4/3] w-full rounded-[8px] object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item) => (
            <div key={item.title}>
              <item.icon className="size-4.5 text-amber" />
              <h3 className="mt-3 font-display text-[15px] font-semibold text-chalk">
                {t(item.title)}
              </h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-fog">{t(item.body)}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-line pt-8">
          <p className="label">{t("home.delivery.types")}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {tiles.map((tile) => (
              <div
                key={tile.file}
                className="overflow-hidden rounded-[12px] border border-line bg-ink-2"
              >
                <img
                  src={`/images/delivery/${tile.file}`}
                  alt={t(tile.alt)}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="px-4 py-3.5">
                  <h3 className="font-display text-[15px] font-semibold text-chalk">
                    {t(tile.name)}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-fog">{t(tile.body)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {more.map((m) => (
              <div key={m.name} className="bg-ink px-4 py-3.5">
                <h3 className="font-display text-[14px] font-semibold text-chalk">{t(m.name)}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-fog">{t(m.body)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Link
            to="/pricing"
            className="mono inline-flex items-center gap-2 rounded-[8px] bg-amber px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-on-amber transition-colors hover:bg-on-amber hover:text-amber"
          >
            {t("home.delivery.cta")}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const t = useT();

  // The plans themselves live on /pricing now, where they sit next to each other
  // with every limit spelled out. Repeating six cards here only ever showed the
  // prices without the allowances behind them, which is the half people were
  // getting caught out by. So the section keeps the promise and hands off.
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-[1180px] px-5 py-20">
        <p className="label">{t("home.pricing.label")}</p>
        {/* Heading and the way out on one row, the tab wrapping under it on a narrow
            screen rather than squeezing the heading. `on-amber` not `ink` for the
            label colour — see the note on the plan CTAs in plan-cards.tsx. */}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
          <h2 className="font-display text-[32px] font-bold leading-tight tracking-tight text-chalk sm:text-[40px]">
            {t("home.pricing.h2")}
          </h2>
          <Link
            to="/pricing"
            className="mono inline-flex shrink-0 items-center gap-2 rounded-[8px] bg-amber px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-on-amber transition-colors hover:bg-on-amber hover:text-amber"
          >
            {t("home.pricing.seePricing")}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  const { locale } = useLocale();
  const [, navigate] = useLocation();
  // Canonical is pinned to "/" rather than taken from the current pathname, so a
  // visitor landing on any "/#section" link still resolves to the one home-page
  // URL — `useSeo` puts the locale prefix back on it.
  //
  // Title and description both come from `seoForPath`, the same table the server
  // injector reads, so the head this mount writes is the head the response
  // already carried rather than an English one in its place.
  const seo = seoForPath("/", locale);
  useSeo({ title: seo.title ?? PAGE_SEO["/"].title, description: seo.description, path: "/" });

  // The marketing site is always light, whatever a signed-in member picked for
  // the app shell on this device. Restore their choice when they leave `/`.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    root.dataset.theme = "light";
    return () => {
      if (previous) root.dataset.theme = previous;
      else delete root.dataset.theme;
    };
  }, []);

  // Arriving with a fragment — a nav link, or a link someone was sent — has to be handled
  // here: the browser tries its own jump before React has painted the sections, finds nothing,
  // and leaves the visitor at the top. Retried for a few frames because the section may still
  // be a few renders away. The same handler runs on `hashchange` so an in-page link clears the
  // sticky header too, which the browser's own jump does not.
  useEffect(() => {
    let frame = 0;
    const jump = () => {
      const id = decodeURIComponent(globalThis.location.hash.slice(1));
      if (!id || id === "top") return;
      // "#pricing" is years of links — the nav, the footer, emails, geocliks.com — and it used
      // to open six plan cards. Those moved to their own page, so the fragment is forwarded
      // there rather than dropping someone on a heading and a button. `replace` keeps Back
      // going where the visitor came from instead of bouncing through here again.
      if (id === "pricing") {
        navigate("/pricing", { replace: true });
        return;
      }
      let tries = 0;
      const attempt = () => {
        if (scrollSiteToId(id) || tries++ > 40) return;
        frame = requestAnimationFrame(attempt);
      };
      attempt();
    };
    jump();
    globalThis.addEventListener("hashchange", jump);
    return () => {
      cancelAnimationFrame(frame);
      globalThis.removeEventListener("hashchange", jump);
    };
  }, [navigate]);

  return (
    <div data-theme="light" id="top" className="min-h-screen bg-ink text-chalk">
      <SiteNav />
      <Hero />
      <Evidence />
      <Teamspace />
      <Reports />
      <Delivery />
      <Field />
      <Pricing />
      <SiteFooter />
    </div>
  );
}
