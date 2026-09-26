import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { scrollSiteToTop } from "../lib/site-scroll";
import { useSeo } from "../lib/seo";
import { PAGE_SEO } from "../lib/seo-routes";

/**
 * Chrome for the search landing pages — `/construction-photo-documentation` and
 * `/alternatives/companycam`.
 *
 * These exist to rank for specific commercial queries, so unlike the home page
 * they are English-only. The reasoning is the same as for the legal pages: a
 * visitor arrives from an English-language search, and the eleven translated
 * copies would be maintained for a set of queries nobody searches. The header,
 * footer and language picker are still the site's own, so a visitor who lands
 * here and switches language gets a translated site everywhere else.
 *
 * Head copy is read from `seo-routes.ts` by path, like every other page, so the
 * tags a crawler reads in the HTML response are the tags React settles on.
 */
/** Any path that has its own row in the SEO table. */
type LandingPath = keyof typeof PAGE_SEO;

export function LandingPage({
  path,
  eyebrow,
  h1,
  sub,
  jsonLd,
  center = false,
  children,
}: {
  /**
   * Canonical path, and the key into the SEO table. Typed as a key of
   * `PAGE_SEO` so a landing page cannot ship without its title and
   * description — the exact failure the SEO audit was written about.
   */
  path: LandingPath;
  /** Small uppercase line above the headline. */
  eyebrow: string;
  h1: string;
  sub: string;
  jsonLd?: object | object[];
  /**
   * Centre the hero copy instead of setting it flush left.
   *
   * `/pricing` is read as a page of columns, so its bands are centred on the
   * axis the cards and the table already sit on — the same shape the home
   * page's video hero uses. The query-led landing pages stay flush left.
   */
  center?: boolean;
  children: React.ReactNode;
}) {
  const seo = PAGE_SEO[path];
  useSeo({ title: seo.title, description: seo.description, path, jsonLd });

  // The marketing site is always light, whatever a signed-in member picked for
  // the app shell on this device. Restore their choice when they leave.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    root.dataset.theme = "light";
    scrollSiteToTop();
    return () => {
      if (previous) root.dataset.theme = previous;
      else delete root.dataset.theme;
    };
  }, []);

  return (
    <div data-theme="light" className="min-h-screen bg-ink text-chalk">
      <SiteNav />

      <section className="hero-band relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 blueprint opacity-60" />
        <div
          className={
            center
              ? "relative mx-auto max-w-[1180px] px-5 py-16 text-center sm:py-20"
              : "relative mx-auto max-w-[1180px] px-5 py-16 sm:py-20"
          }
        >
          <p className="label text-amber">{eyebrow}</p>
          <h1
            className={`mt-3 max-w-[860px] font-display text-[34px] font-bold leading-[1.08] tracking-tight text-chalk sm:text-[46px] ${center ? "mx-auto" : ""}`}
          >
            {h1}
          </h1>
          <p
            className={`mt-5 max-w-[680px] text-[16px] leading-relaxed text-fog sm:text-[17px] ${center ? "mx-auto" : ""}`}
          >
            {sub}
          </p>
        </div>
      </section>

      <main>{children}</main>

      <SiteFooter />
    </div>
  );
}

/** One full-width band of a landing page. */
export function LandingSection({
  id,
  label,
  h2,
  intro,
  center = false,
  children,
}: {
  id?: string;
  label?: string;
  h2: string;
  intro?: string;
  /**
   * Centre the band's own copy, and everything the children inherit from it.
   *
   * Set per page rather than globally: a comparison table inside a centred band
   * still pins its own `text-left`, so only the prose moves.
   */
  center?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="border-b border-line">
      <div
        className={
          center
            ? "mx-auto max-w-[1180px] px-5 py-16 text-center sm:py-20"
            : "mx-auto max-w-[1180px] px-5 py-16 sm:py-20"
        }
      >
        {label ? <p className="label">{label}</p> : null}
        <h2
          className={`mt-3 max-w-[760px] font-display text-[28px] font-bold leading-tight tracking-tight text-chalk sm:text-[36px] ${center ? "mx-auto" : ""}`}
        >
          {h2}
        </h2>
        {intro ? (
          <p
            className={`mt-4 max-w-[680px] text-[15px] leading-relaxed text-fog ${center ? "mx-auto" : ""}`}
          >
            {intro}
          </p>
        ) : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}

/** The numbered "how it works" list. */
export function LandingSteps({ steps }: { steps: Array<{ title: string; body: string }> }) {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title} className="rounded-[12px] border border-line bg-ink-2 p-5">
          <span className="mono flex size-7 items-center justify-center rounded-full bg-amber text-[12px] font-bold text-ink">
            {index + 1}
          </span>
          <h3 className="mt-3.5 font-display text-[15px] font-semibold text-chalk">{step.title}</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-fog">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

/** A grid of icon + title + body cards. */
export function LandingCards({
  items,
  center = false,
}: {
  items: Array<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
  }>;
  /**
   * Centre the icon with the copy. Needed as a flag rather than inherited from
   * `text-align`: Tailwind's preflight makes an `svg` a block element, so it
   * ignores the centring the text around it picks up.
   */
  center?: boolean;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-[12px] border border-line bg-ink-2 p-5">
          <item.icon className={`size-4.5 text-amber ${center ? "mx-auto" : ""}`} />
          <h3 className="mt-3 font-display text-[15px] font-semibold text-chalk">{item.title}</h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-fog">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * The FAQ block. Rendered as real `<details>` elements: the answers are in the
 * HTML whether or not they are open, which is what a featured snippet is pulled
 * from, and they need no JavaScript to expand.
 */
export function LandingFaq({
  entries,
  center = false,
}: {
  entries: readonly { question: string; answer: string }[];
  /** Centre the block and its copy, for the pages whose bands are centred. */
  center?: boolean;
}) {
  return (
    <div
      className={`max-w-[820px] divide-y divide-line border-y border-line ${center ? "mx-auto" : ""}`}
    >
      {entries.map((entry) => (
        <details key={entry.question} className="group py-4">
          <summary
            className={`flex cursor-pointer items-center gap-4 font-display text-[15.5px] font-semibold text-chalk marker:content-none ${center ? "justify-center" : "justify-between"}`}
          >
            {entry.question}
            <span className="mono shrink-0 text-[18px] leading-none text-amber group-open:hidden">
              +
            </span>
            <span className="mono hidden shrink-0 text-[18px] leading-none text-amber group-open:inline">
              −
            </span>
          </summary>
          <p
            className={`mt-2.5 max-w-[680px] text-[14px] leading-relaxed text-fog ${center ? "mx-auto" : ""}`}
          >
            {entry.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

/** Closing call to action: one filled button, one quiet link. */
export function LandingCta({
  h2,
  body,
  primary,
  secondary,
}: {
  h2: string;
  body: string;
  primary: { label: string; to: string };
  secondary: { label: string; to: string };
}) {
  return (
    <section className="border-b border-line bg-ink-2">
      <div className="mx-auto max-w-[1180px] px-5 py-16 text-center sm:py-20">
        <h2 className="mx-auto max-w-[620px] font-display text-[26px] font-bold leading-tight tracking-tight text-chalk sm:text-[34px]">
          {h2}
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-relaxed text-fog">{body}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={primary.to}
            className="inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 text-[14.5px] font-bold text-ink transition-colors hover:bg-amber-deep"
          >
            {primary.label} <ArrowRight className="size-4" />
          </Link>
          <Link
            to={secondary.to}
            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-[14.5px] font-semibold text-chalk transition-colors hover:border-amber hover:text-amber"
          >
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
