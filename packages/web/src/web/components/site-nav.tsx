import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ChevronDown, Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import { Logo } from "./logo";
import { LanguageSelect } from "./language-select";
import { authClient } from "../lib/auth";
import { type TKey, useT } from "../lib/i18n";
import { cn } from "../lib/utils";
import { SALES_EMAIL, SUPPORT_EMAIL } from "../lib/support";

/**
 * The marketing site's shared header.
 *
 * Lived inside `pages/index.tsx` until the comparison and category landing
 * pages needed it too. Those pages are lazy-loaded routes of their own, so
 * importing the home page to get its header would have pulled the entire
 * landing page into their bundles.
 */
type MenuItem = { label: TKey; href: string; external?: boolean };

/**
 * Marketing-header dropdown. Opens on click and on hover (pointer devices),
 * closes on outside click or Escape. Rendered inside the always-dark header,
 * so it inherits the dark tokens from the header's `data-theme` scope.
 */
function NavMenu({ label, items }: { label: TKey; items: MenuItem[] }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrap}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 py-2 text-[14px] font-semibold text-white transition-colors hover:text-amber"
      >
        {t(label)}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute start-0 top-full z-50 w-[248px] rounded-[12px] border border-line bg-ink-2 py-1 shadow-2xl">
          {items.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-[8px] block px-4 py-2.5 text-[13px] text-fog transition-colors hover:bg-ink-3 hover:text-chalk"
                onClick={() => setOpen(false)}
              >
                {t(item.label)}
              </a>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="rounded-[8px] block px-4 py-2.5 text-[13px] text-fog transition-colors hover:bg-ink-3 hover:text-chalk"
                onClick={() => setOpen(false)}
              >
                {t(item.label)}
              </a>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Section anchors are written absolute ("/#evidence", not "#evidence"): this header is shared
 * with /pricing, where a bare fragment would point at a section that is not on the page. From
 * the home page the browser still treats it as a same-document jump, so nothing reloads.
 */
const FEATURE_ITEMS: MenuItem[] = [
  { label: "home.nav.tamper", href: "/#evidence" },
  { label: "home.nav.teamspace", href: "/#teamspace" },
  { label: "home.nav.reports", href: "/#reports" },
  { label: "home.nav.offline", href: "/#field" },
];

const RESOURCE_ITEMS: MenuItem[] = [
  { label: "getapp.ctaPrimary", href: "/get-app" },
  { label: "verify.navLink", href: "/verify" },
  { label: "home.nav.website", href: "https://www.geocliks.com/", external: true },
  { label: "home.nav.help", href: "/help" },
  { label: "home.nav.constructionDocs", href: "/construction-photo-documentation" },
  { label: "home.nav.vsCompanycam", href: "/alternatives/companycam" },
  { label: "home.footer.terms", href: "/terms" },
  { label: "home.footer.privacy", href: "/privacy" },
  { label: "home.footer.deleteAccount", href: "/delete-account" },
];

const SUPPORT_ITEMS: MenuItem[] = [
  { label: "home.nav.emailSupport", href: `mailto:${SUPPORT_EMAIL}` },
  { label: "home.nav.help", href: "/help" },
  {
    label: "home.nav.contactSales",
    href: `mailto:${SALES_EMAIL}?subject=GeoCliks%20Enterprise`,
  },
];

/**
 * Marketing header. The page body follows the light theme, but the header is
 * pinned dark on purpose — `data-theme="dark"` re-scopes every color token for
 * its subtree, so children (dropdowns, language picker) stay dark too.
 */
const mobileLink =
  "block border-b border-white/5 py-3 text-[15px] font-semibold text-white transition-colors hover:text-amber";

/** One collapsible group inside the mobile menu. */
function MobileGroup({
  label,
  items,
  onNavigate,
}: {
  label: TKey;
  items: MenuItem[];
  onNavigate: () => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-3 text-[15px] font-semibold text-white transition-colors hover:text-amber"
      >
        {t(label)}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="pb-2 ps-3">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              onClick={onNavigate}
              className="block py-2 text-[14px] text-white/70 transition-colors hover:text-amber"
            >
              {t(item.label)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function SiteNav() {
  const { data: session } = authClient.useSession();
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);
  return (
    <header
      data-theme="dark"
      className="sticky top-0 z-40 border-b border-white/10 bg-[#0d2137] backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-5">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        {/* gap-5 up to xl, not gap-6 everywhere: at the lg breakpoint the row fit its
            1024px container with nothing to spare, so a seventh item overflowed it. The
            4px taken off each of six gaps buys back more than the item costs. */}
        <nav className="hidden items-center gap-5 lg:flex xl:gap-6">
          <a
            href="/#top"
            className="py-2 text-[14px] font-semibold text-white transition-colors hover:text-amber"
          >
            {t("home.nav.home")}
          </a>
          <NavMenu label="home.nav.features" items={FEATURE_ITEMS} />
          <a
            href="/#delivery"
            className="py-2 text-[14px] font-semibold text-white transition-colors hover:text-amber"
          >
            {t("home.nav.delivery")}
          </a>
          {/* A route now, not a fragment: the plans, their limits and the comparison
              table all live on /pricing. */}
          <Link
            to="/pricing"
            className="py-2 text-[14px] font-semibold text-white transition-colors hover:text-amber"
          >
            {t("home.nav.pricing")}
          </Link>
          {/* "Blog", not "Field Notes". A first-time visitor scanning the header does
              not know what Field Notes is, and nobody clicks a nav item to be charmed.
              The brand name earns its keep in the footer, where a reader who is already
              interested will read the label properly. */}
          <Link
            to="/blog"
            className="py-2 text-[14px] font-semibold text-white transition-colors hover:text-amber"
          >
            {t("home.nav.blog")}
          </Link>
          <NavMenu label="home.nav.resources" items={RESOURCE_ITEMS} />
          <NavMenu label="home.nav.support" items={SUPPORT_ITEMS} />
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden h-6 w-px bg-white/20 lg:block" />
          <LanguageSelect compact bare />
          <Link
            to={session ? "/app" : "/sign-in"}
            className="hidden whitespace-nowrap text-[14px] font-semibold text-white transition-colors hover:text-amber sm:inline"
          >
            {session ? t("home.nav.teamspace") : t("home.nav.login")}
          </Link>
          <Link
            to="/sign-up"
            className="whitespace-nowrap rounded-full bg-amber px-4 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-amber-deep sm:px-5 sm:text-[14px]"
          >
            {t("home.nav.signUp")}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t("home.nav.closeMenu") : t("home.nav.menu")}
            className="-me-1 flex size-9 items-center justify-center text-white transition-colors hover:text-amber lg:hidden"
          >
            {mobileOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 lg:hidden">
          <nav className="mx-auto max-h-[70vh] max-w-[1180px] overflow-y-auto px-4 pb-5 pt-2">
            <a href="/#top" onClick={close} className={mobileLink}>
              {t("home.nav.home")}
            </a>
            <MobileGroup label="home.nav.features" items={FEATURE_ITEMS} onNavigate={close} />
            <a href="/#delivery" onClick={close} className={mobileLink}>
              {t("home.nav.delivery")}
            </a>
            <Link to="/pricing" onClick={close} className={mobileLink}>
              {t("home.nav.pricing")}
            </Link>
            <Link to="/blog" onClick={close} className={mobileLink}>
              {t("home.nav.blog")}
            </Link>
            <MobileGroup label="home.nav.resources" items={RESOURCE_ITEMS} onNavigate={close} />
            <MobileGroup label="home.nav.support" items={SUPPORT_ITEMS} onNavigate={close} />
            <Link
              to={session ? "/app" : "/sign-in"}
              onClick={close}
              className={cn(mobileLink, "sm:hidden")}
            >
              {session ? t("home.nav.teamspace") : t("home.nav.login")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
