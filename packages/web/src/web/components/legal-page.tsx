import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./logo";
import { SiteFooter } from "./site-footer";
import { LEGAL_EFFECTIVE_DATE } from "../lib/company";
import { useSeo } from "../lib/seo";
import { seoForPath } from "../lib/seo-routes";
import { scrollSiteToTop } from "../lib/site-scroll";

/**
 * Shared chrome for /terms and /privacy: the marketing site's pinned-dark header,
 * a readable measure for long-form legal text, and the shared footer. Like the
 * landing page, these pages force the light theme and restore the visitor's
 * choice on the way out.
 *
 * The body copy of /terms and /privacy is intentionally English-only:
 * machine-translating legal text can change what it means. /delete-account uses the
 * same chrome but is translated, because it is instructions for using the app rather
 * than binding text — hence the `seoTitle` and `meta` overrides.
 */
export function LegalPage({
  title,
  path,
  seoTitle,
  meta,
  children,
}: {
  /** Visible `<h1>`, e.g. "Terms of Service". */
  title: string;
  /** Canonical path, e.g. "/terms". */
  path: string;
  /**
   * `<title>` for the tab, when the page has a translated one. Omitted, the English
   * copy from `seo-routes.ts` is used — which is what a crawler reads either way.
   */
  seoTitle?: string;
  /**
   * Replaces the "Effective <date>" line under the heading. `null` leaves it off, for
   * a page that is not a dated document.
   */
  meta?: string | null;
  children: React.ReactNode;
}) {
  // The head lives here rather than in terms.tsx and privacy.tsx so a third
  // legal page cannot be added without one, and the copy is read from
  // `seo-routes.ts` rather than passed in, so the tag a crawler gets from the
  // HTML response and the tag React writes after mounting are the same string.
  const seo = seoForPath(path);
  useSeo({
    title: seoTitle ?? seo.title ?? `${title} — GeoCliks`,
    description: seo.description,
    path,
  });

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
      <header data-theme="dark" className="border-b border-line bg-[#0d2137]">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5">
          <Link to="/">
            <Logo />
          </Link>
          <Link
            to="/"
            className="mono flex items-center gap-2 text-[11px] uppercase tracking-widest text-fog transition-colors hover:text-amber"
          >
            <ArrowLeft className="size-3.5" /> geocliks.com
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[820px] px-5 py-16">
        <h1 className="font-display text-[34px] font-bold leading-tight tracking-tight text-chalk sm:text-[42px]">
          {title}
        </h1>
        {meta !== null && (
          <p className="mono mt-3 text-[10.5px] uppercase tracking-widest text-fog">
            {meta ?? `Effective ${LEGAL_EFFECTIVE_DATE}`}
          </p>
        )}
        <div className="mt-10 space-y-8">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}

/** One numbered section of a legal document. */
export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[20px] font-bold tracking-tight text-chalk">{title}</h2>
      <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-fog">{children}</div>
    </section>
  );
}

/**
 * Inline emphasis inside a translated string: `**Profile**` renders as the bright
 * span the hand-written English JSX used to spell out with `<strong>`. Same marker
 * as the chat widget's renderer, so there is one convention to translate against —
 * and a translator can move the emphasis onto whatever word their language puts the
 * UI label on, which a fixed `<strong>` in JSX cannot do.
 */
export function LegalCopy({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
          <strong key={i} className="text-chalk">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** Bulleted list styled to match the legal body copy. */
export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="ml-4 list-disc space-y-2">
      {items.map((item) => (
        <li key={item}>
          <LegalCopy text={item} />
        </li>
      ))}
    </ul>
  );
}

/** Numbered steps, for a page that walks through something in the app. */
export function LegalSteps({ items }: { items: string[] }) {
  return (
    <ol className="ml-4 list-decimal space-y-2">
      {items.map((item) => (
        <li key={item}>
          <LegalCopy text={item} />
        </li>
      ))}
    </ol>
  );
}
