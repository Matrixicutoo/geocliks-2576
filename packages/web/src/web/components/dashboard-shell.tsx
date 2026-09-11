import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  Bell,
  BellOff,
  Camera,
  FolderKanban,
  Map,
  Route as RouteIcon,
  FileStack,
  GitCompareArrows,
  Users,
  Stamp,
  CreditCard,
  Link2,
  UserX,
  UserCircle,
  MessageSquare,
} from "lucide-react";
import { useOrg } from "../queries/orgs";
import { useAdminMe } from "../queries/admin";
import { useMessageNotifications } from "../hooks/use-message-notifications";
import { stopImpersonation } from "../lib/impersonate";
import { cn } from "../lib/utils";
import { useWorkspaceTheme } from "../lib/theme";
import { type TKey, useLocale, useWorkspaceLocale } from "../lib/i18n";
import { Logo } from "./logo";
import { LanguageSelect } from "./language-select";
import { NavDrawer } from "./nav-drawer";
import { SidebarBody } from "./sidebar-body";
import { InviteDialog } from "./invite-form";
import { canManageWatermarks, canManageWorkspace, canUseDelivery, canUseField } from "../lib/roles";

/** Nav entries a field member can't act on — the pages are manager/owner only. */
const MANAGER_ONLY = new Set(["/app/billing"]);

/**
 * Tighter than MANAGER_ONLY: owner and admin only. A manager keeps the plan page but no
 * longer curates the company stamp. Reading a stamp at capture time is unaffected — that is
 * a different call and it stays open to everyone.
 */
const ADMIN_ONLY = new Set(["/app/templates"]);

/**
 * Product-scoped nav. A `driver` has no field access and a `field` member has no delivery
 * access, so showing them these entries would only produce a 403 on click — the server refuses
 * both in `fieldProc` / `requireDelivery`. Hiding is presentation only; the server is the guard.
 *
 * Team, Messages, Share, Profile and Help are deliberately in NEITHER set: they belong to the
 * workspace rather than to one product, so both crews keep them.
 */
const FIELD_ONLY = new Set(["/app", "/app/projects", "/app/map", "/app/compare", "/app/reports"]);
const DELIVERY_ONLY = new Set(["/app/routes"]);

const NAV: { href: string; label: TKey; icon: typeof Camera }[] = [
  { href: "/app", label: "nav.teamspace", icon: Camera },
  { href: "/app/projects", label: "nav.projects", icon: FolderKanban },
  { href: "/app/routes", label: "nav.routes", icon: RouteIcon },
  { href: "/app/map", label: "nav.map", icon: Map },
  { href: "/app/share", label: "nav.share", icon: Link2 },
  { href: "/app/team", label: "nav.team", icon: Users },
  { href: "/app/templates", label: "nav.watermarks", icon: Stamp },
  { href: "/app/billing", label: "nav.plan", icon: CreditCard },
  { href: "/app/messages", label: "nav.messages", icon: MessageSquare },
  { href: "/app/profile", label: "profile.title", icon: UserCircle },
  // Before / After and Reports sit last so they land on the bottom row of the two-column
  // grid — one at the foot of each column.
  { href: "/app/compare", label: "nav.compare", icon: GitCompareArrows },
  { href: "/app/reports", label: "nav.reports", icon: FileStack },
  // Help center moved to the bottom card with Contact support / Terms / Privacy, which is
  // where the mobile drawer keeps it. It stays public — no MANAGER_ONLY entry.
];

export function DashboardShell({
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
  const org = useOrg();
  const me = useAdminMe();
  // The invite sheet lives here, not in the menu: the drawer unmounts its menu when it closes.
  const [inviting, setInviting] = useState(false);
  // Desktop message alerts, live on every dashboard page rather than only on Messages.
  const notify = useMessageNotifications();
  const impersonating = me.data?.impersonating;
  const { t } = useLocale();
  // The workspace defaults apply unless this member already chose on this device.
  useWorkspaceTheme(org.data?.org.theme);
  useWorkspaceLocale(org.data?.org.locale);
  // Field crews capture evidence; the plan page is manager and above, and watermark curation is
  // tighter still — owner and admin only.
  const role = org.data?.role;
  const nav = (canManageWorkspace(role) ? NAV : NAV.filter((i) => !MANAGER_ONLY.has(i.href)))
    .filter((i) => canManageWatermarks(role) || !ADMIN_ONLY.has(i.href))
    .filter((i) => canUseField(role) || !FIELD_ONLY.has(i.href))
    .filter((i) => canUseDelivery(role) || !DELIVERY_ONLY.has(i.href));
  // The tab title mirrors the page header, so open tabs stay tellable apart.
  useEffect(() => {
    document.title = title ? `${title} · GeoCliks` : "GeoCliks";
  }, [title]);

  return (
    <div className="flex min-h-screen bg-ink text-chalk">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col overflow-y-auto border-r border-line bg-ink-2 lg:flex">
        {/* Logo block matches the page header: same dark bar, same height. */}
        <div
          data-theme="dark"
          className="flex h-[68px] shrink-0 items-center border-b border-line bg-[#0d2137] px-5"
        >
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <SidebarBody nav={nav} languageDrop="up" onInvite={() => setInviting(true)} />
      </aside>

      <div className="min-w-0 flex-1">
        {impersonating && (
          <div className="rounded-[8px] flex flex-wrap items-center justify-between gap-2 border-b border-alert/50 bg-alert/15 px-5 py-2 lg:px-8">
            <p className="mono text-[11px] uppercase tracking-widest text-alert">
              {t("shell.impersonating", { email: impersonating.email })}
            </p>
            <button
              type="button"
              onClick={() => {
                stopImpersonation();
                window.location.href = "/admin/users";
              }}
              className="rounded-[6px] mono flex items-center gap-1.5 border border-alert/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-alert hover:bg-alert/20"
            >
              <UserX className="size-3.5" /> {t("shell.stopImpersonating")}
            </button>
          </div>
        )}
        {/* The header is pinned dark regardless of the workspace theme:
            `data-theme="dark"` re-scopes every color token for its subtree. */}
        <header
          data-theme="dark"
          className="sticky top-0 z-20 border-b border-line bg-[#0d2137] text-chalk"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 sm:px-5 lg:h-[68px] lg:flex-nowrap lg:py-0 lg:px-8">
            {/* Left corner, ahead of the title: the hamburger that stands in for the sidebar
                below `lg`, sitting where that sidebar would otherwise start. */}
            <NavDrawer nav={nav} onInvite={() => setInviting(true)} />
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-[17px] font-bold tracking-tight text-amber sm:text-xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 line-clamp-2 text-[12px] text-fog sm:text-[13px]">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              {actions}
              {notify.supported && (
                <button
                  type="button"
                  aria-label={
                    notify.blocked
                      ? t("notify.blocked")
                      : notify.enabled
                        ? t("notify.off")
                        : t("notify.on")
                  }
                  title={
                    notify.blocked
                      ? t("notify.blocked")
                      : notify.enabled
                        ? t("notify.off")
                        : t("notify.on")
                  }
                  onClick={() => {
                    if (notify.blocked) return;
                    if (notify.enabled) notify.disable();
                    else
                      void notify.enable({
                        title: t("notify.testTitle"),
                        body: t("notify.testBody"),
                      });
                  }}
                  className={cn(
                    "rounded-[8px] flex size-9 items-center justify-center border",
                    notify.enabled
                      ? "border-amber/60 bg-amber/10 text-amber"
                      : "border-line text-fog hover:border-amber hover:text-amber",
                    notify.blocked &&
                      "cursor-not-allowed opacity-50 hover:border-line hover:text-fog",
                  )}
                >
                  {notify.enabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}
                </button>
              )}
              <LanguageSelect compact tone="amber" />
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-5 sm:py-6 lg:px-8">{children}</main>
      </div>

      <InviteDialog open={inviting} onClose={() => setInviting(false)} />
    </div>
  );
}
