import { Link, useLocation } from "wouter";
import { ArrowLeft, Gauge, Layers, ShieldCheck, SlidersHorizontal, Users2 } from "lucide-react";
import { cn } from "../lib/utils";
import { Logo } from "./logo";
import { LanguageSelect } from "./language-select";
import { useAdminMe } from "../queries/admin";
import { type TKey, useT } from "../lib/i18n";

const NAV: { href: string; label: TKey; icon: React.ElementType }[] = [
  { href: "/admin", label: "admin.nav.overview", icon: Gauge },
  { href: "/admin/users", label: "admin.nav.users", icon: Users2 },
  { href: "/admin/workspaces", label: "admin.nav.workspaces", icon: Layers },
  { href: "/admin/plans", label: "admin.nav.plans", icon: ShieldCheck },
  { href: "/admin/settings", label: "admin.nav.settings", icon: SlidersHorizontal },
];

export function AdminShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const [location] = useLocation();
  const me = useAdminMe();
  const t = useT();

  return (
    <div className="flex min-h-screen bg-ink text-chalk">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-ink-2 lg:flex">
        {/* Logo block matches the page header: same dark bar, same height. */}
        <div
          data-theme="dark"
          className="flex h-[68px] shrink-0 items-center border-b border-line bg-[#0d2137] px-5"
        >
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <p className="rounded-[8px] mono border-b border-line bg-alert/10 px-5 py-1.5 text-[9px] uppercase tracking-widest text-alert">
          {t("admin.console")}
        </p>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.map((item) => {
            const active =
              item.href === "/admin" ? location === "/admin" : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-[8px] px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "border-l-2 border-alert bg-ink-3 text-chalk"
                    : "border-l-2 border-transparent text-fog hover:bg-ink-3/60 hover:text-chalk",
                )}
              >
                <item.icon className={cn("size-4", active && "text-alert")} />
                {t(item.label)}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-line p-3">
          <div className="rounded-[12px] border border-line bg-ink px-3 py-2">
            <p className="truncate text-[13px] font-semibold text-chalk">
              {me.data?.actor.name || me.data?.actor.email}
            </p>
            <p className="mono text-[10px] uppercase tracking-widest text-alert">
              {me.data?.staffRole ?? "staff"}
            </p>
          </div>
          <Link
            to="/app"
            className="flex items-center gap-2 px-3 py-2 text-[12px] text-fog transition-colors hover:text-chalk"
          >
            <ArrowLeft className="size-3.5" /> {t("admin.backToWorkspace")}
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Pinned dark like the workspace header: `data-theme="dark"` re-scopes
            every color token for its subtree. */}
        <header
          data-theme="dark"
          className="sticky top-0 z-20 border-b border-line bg-[#0d2137] text-chalk"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-5 lg:h-[68px] lg:flex-nowrap lg:py-0 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-[17px] font-bold tracking-tight text-amber sm:text-xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 line-clamp-2 text-[12px] text-fog sm:text-[13px]">{subtitle}</p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {actions}
              <LanguageSelect compact />
            </div>
          </div>
          <nav className="scrollbar-none flex gap-1 overflow-x-auto border-t border-line px-3 py-2 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "rounded-[6px] mono whitespace-nowrap border px-2.5 py-1 text-[10px] uppercase tracking-widest",
                  location === item.href
                    ? "border-alert/60 bg-alert/10 text-alert"
                    : "border-line text-fog",
                )}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </header>

        <main className="px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
