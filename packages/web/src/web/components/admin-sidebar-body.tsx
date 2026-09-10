import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { cn } from "../lib/utils";
import { type TKey, useT } from "../lib/i18n";
import { useAdminMe } from "../queries/admin";

/**
 * Everything the admin sidebar holds below its logo bar: the staff banner, the console
 * destinations, who is signed in as staff, and the way back to the workspace.
 *
 * It lives in its own file for the same reason the workspace one does — two containers render
 * it. The `lg` sidebar in AdminShell is one, the slide-in sheet behind the header's hamburger
 * is the other. Sharing the body is the point: the narrow layout is the same menu as the wide
 * one, so anything added here appears at every width for free.
 *
 * `onNavigate` fires on every link in here; the sheet uses it to dismiss itself, including on
 * a link back to the page already open, which fires no route change. The docked sidebar has
 * nothing to dismiss and leaves it unset.
 */
export function AdminSidebarBody({
  nav,
  onNavigate,
}: {
  nav: { href: string; label: TKey; icon: React.ElementType }[];
  onNavigate?: () => void;
}) {
  const [location] = useLocation();
  const me = useAdminMe();
  const t = useT();

  return (
    <>
      <p className="rounded-[8px] mono border-b border-line bg-alert/10 px-5 py-1.5 text-[9px] uppercase tracking-widest text-alert">
        {t("admin.console")}
      </p>

      {/* Orange tiles, the same shape and the same hover as the workspace menu — the two
          shells are one product, and staff should not have to re-learn the nav. */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-2">
        {nav.map((item) => {
          const active =
            item.href === "/admin" ? location === "/admin" : location.startsWith(item.href);
          return (
            <Link
              onClick={onNavigate}
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center rounded-[8px] gap-2 border-l-2 bg-amber px-2.5 py-1.5 text-[12.5px] leading-tight text-on-amber",
                "transition-[background-color,box-shadow] duration-150",
                "hover:bg-amber-hover hover:shadow-[inset_0_0_0_1px_var(--c-on-amber)]",
                active ? "border-on-amber font-bold" : "border-transparent font-medium",
              )}
            >
              <item.icon className="size-4 shrink-0 text-on-amber" />
              <span className="min-w-0 flex-1">{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-line p-3">
        <div className="rounded-[12px] border border-line bg-ink px-3 py-2">
          <p className="truncate text-[13px] font-semibold text-chalk">
            {me.data?.actor.name || me.data?.actor.email}
          </p>
          <p className="mono text-[10px] uppercase tracking-widest text-alert">
            {me.data?.staffRole ?? "staff"}
          </p>
        </div>
        <Link
          onClick={onNavigate}
          to="/app"
          className="flex items-center gap-2 px-3 py-2 text-[12px] text-fog transition-colors hover:text-chalk"
        >
          <ArrowLeft className="size-3.5" /> {t("admin.backToWorkspace")}
        </Link>
      </div>
    </>
  );
}
