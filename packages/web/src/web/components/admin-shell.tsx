import { Link } from "wouter";
import { Gauge, Layers, ShieldCheck, SlidersHorizontal, Users2 } from "lucide-react";
import { Logo } from "./logo";
import { LanguageSelect } from "./language-select";
import { MenuDrawer } from "./menu-drawer";
import { AdminSidebarBody } from "./admin-sidebar-body";
import type { TKey } from "../lib/i18n";

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

        <AdminSidebarBody nav={NAV} />
      </aside>

      <div className="min-w-0 flex-1">
        {/* Pinned dark like the workspace header: `data-theme="dark"` re-scopes
            every color token for its subtree. */}
        <header
          data-theme="dark"
          className="sticky top-0 z-20 border-b border-line bg-[#0d2137] text-chalk"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-5 lg:h-[68px] lg:flex-nowrap lg:py-0 lg:px-8">
            {/* Left corner, ahead of the title: the hamburger that stands in for the sidebar
                below `lg`, the same control the workspace header carries. It replaces the
                pill strip that used to scroll sideways under the title. */}
            <MenuDrawer>
              {(close) => <AdminSidebarBody nav={NAV} onNavigate={close} />}
            </MenuDrawer>
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
        </header>

        <main className="px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
