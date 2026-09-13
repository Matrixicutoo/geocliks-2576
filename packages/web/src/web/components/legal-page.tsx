import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./logo";
import { SiteFooter } from "./site-footer";
import { LEGAL_EFFECTIVE_DATE } from "../lib/company";
import { scrollSiteToTop } from "../lib/site-scroll";

/**
 * Shared chrome for /terms and /privacy: the marketing site's pinned-dark header,
 * a readable measure for long-form legal text, and the shared footer. Like the
 * landing page, these pages force the light theme and restore the visitor's
 * choice on the way out.
 *
 * The body copy of both pages is intentionally English-only: machine-translating
 * legal text can change what it means.
 */
export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
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
        <p className="mono mt-3 text-[10.5px] uppercase tracking-widest text-fog">
          Effective {LEGAL_EFFECTIVE_DATE}
        </p>
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

/** Bulleted list styled to match the legal body copy. */
export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="ml-4 list-disc space-y-2">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
