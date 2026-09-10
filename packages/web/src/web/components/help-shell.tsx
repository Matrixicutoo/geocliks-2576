import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Logo } from "./logo";
import { SiteFooter } from "./site-footer";
import { LanguageSelect } from "./language-select";
import { useT } from "../lib/i18n";

/**
 * Shared chrome for every /help page: the marketing site's pinned-dark header,
 * a breadcrumb trail, one readable measure and the shared footer.
 *
 * Like /terms and /privacy this forces the light theme and restores the visitor's
 * own choice on the way out, so the Help Center matches the rest of the marketing
 * site rather than inheriting the app's dark dashboard.
 */
export type Crumb = { label: string; href?: string };

export function HelpShell({
  crumbs,
  children,
  wide = false,
}: {
  crumbs: Crumb[];
  children: React.ReactNode;
  wide?: boolean;
}) {
  const t = useT();

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    root.dataset.theme = "light";
    window.scrollTo(0, 0);
    return () => {
      if (previous) root.dataset.theme = previous;
      else delete root.dataset.theme;
    };
  }, []);

  return (
    <div data-theme="light" className="min-h-screen bg-ink text-chalk">
      <header data-theme="dark" className="border-b border-line bg-[#0d2137]">
        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between gap-4 px-5">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSelect compact bare />
            <Link
              to="/"
              className="mono hidden items-center gap-2 text-[11px] uppercase tracking-widest text-fog transition-colors hover:text-amber sm:flex"
            >
              <ArrowLeft className="size-3.5" /> geocliks.com
            </Link>
          </div>
        </div>
      </header>

      <main className={`mx-auto px-5 py-12 ${wide ? "max-w-[1180px]" : "max-w-[860px]"}`}>
        {/* The index page is its own root, so it gets no trail. */}
        <nav
          aria-label="Breadcrumb"
          hidden={crumbs.length === 0}
          className="mono flex flex-wrap items-center gap-1.5 text-[10.5px] uppercase tracking-widest text-fog"
        >
          <Link to="/help" className="transition-colors hover:text-amber">
            {t("help.eyebrow")}
          </Link>
          {crumbs.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-1.5">
              <ChevronRight className="size-3 opacity-50" />
              {crumb.href ? (
                <Link to={crumb.href} className="transition-colors hover:text-amber">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-chalk">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="mt-8">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Closing card shown at the foot of category and article pages. */
export function HelpContact() {
  const t = useT();
  return (
    <section className="mt-14 rounded-[18px] border border-line bg-ink-2 p-6">
      <h2 className="font-display text-[19px] font-bold tracking-tight text-chalk">
        {t("help.contactTitle")}
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-fog">{t("help.contactBody")}</p>
      <a
        href="mailto:support@geocliks.com"
        className="mono mt-4 inline-block rounded-[10px] border border-amber px-4 py-2 text-[11px] uppercase tracking-widest text-amber transition-colors hover:bg-amber hover:text-ink"
      >
        {t("help.contactCta")}
      </a>
    </section>
  );
}
