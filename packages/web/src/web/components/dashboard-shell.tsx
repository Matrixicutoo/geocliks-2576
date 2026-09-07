import { useEffect } from "react";
import { Link, useLocation } from "wouter";
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
  LogOut,
  Link2,
  ShieldCheck,
  UserX,
  UserCircle,
  MessageSquare,
  Sun,
  Moon,
} from "lucide-react";
import { authClient } from "../lib/auth";
import { useOrg } from "../queries/orgs";
import { useAdminMe } from "../queries/admin";
import { useUnreadMessages } from "../queries/messages";
import { useMessageNotifications } from "../hooks/use-message-notifications";
import { stopImpersonation } from "../lib/impersonate";
import { cn } from "../lib/utils";
import { useTheme, useWorkspaceTheme } from "../lib/theme";
import { type TKey, useLocale, useWorkspaceLocale } from "../lib/i18n";
import { Logo } from "./logo";
import { LanguageSelect } from "./language-select";
import { AccountMenu } from "./account-menu";

/** Nav entries a field member can't act on — the pages are manager/owner only. */
const MANAGER_ONLY = new Set(["/app/templates", "/app/billing"]);

const NAV: { href: string; label: TKey; icon: typeof Camera }[] = [
  { href: "/app", label: "nav.teamspace", icon: Camera },
  { href: "/app/projects", label: "nav.projects", icon: FolderKanban },
  { href: "/app/routes", label: "nav.routes", icon: RouteIcon },
  { href: "/app/map", label: "nav.map", icon: Map },
  { href: "/app/compare", label: "nav.compare", icon: GitCompareArrows },
  { href: "/app/reports", label: "nav.reports", icon: FileStack },
  { href: "/app/share", label: "nav.share", icon: Link2 },
  { href: "/app/team", label: "nav.team", icon: Users },
  { href: "/app/templates", label: "nav.watermarks", icon: Stamp },
  { href: "/app/billing", label: "nav.plan", icon: CreditCard },
  { href: "/app/messages", label: "nav.messages", icon: MessageSquare },
  { href: "/app/profile", label: "profile.title", icon: UserCircle },
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
  const [location] = useLocation();
  const org = useOrg();
  const me = useAdminMe();
  const unread = useUnreadMessages();
  // Desktop message alerts, live on every dashboard page rather than only on Messages.
  const notify = useMessageNotifications();
  const impersonating = me.data?.impersonating;
  const { theme, toggle } = useTheme();
  const { t } = useLocale();
  // The workspace defaults apply unless this member already chose on this device.
  useWorkspaceTheme(org.data?.org.theme);
  useWorkspaceLocale(org.data?.org.locale);
  // Field crews capture evidence; plan and watermark curation belong to managers and owners.
  const nav = org.data?.role === "field" ? NAV.filter((i) => !MANAGER_ONLY.has(i.href)) : NAV;
  // The tab title mirrors the page header, so open tabs stay tellable apart.
  useEffect(() => {
    document.title = title ? `${title} · GeoCliks` : "GeoCliks";
  }, [title]);

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

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map((item) => {
            const active =
              item.href === "/app" ? location === "/app" : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-[8px] gap-2.5 border-l-2 bg-amber px-3 py-2 text-[13px] text-on-amber transition-colors",
                  // Every row is filled now, so the current page is marked by weight and an ink
                  // edge instead of by background.
                  active
                    ? "border-on-amber font-bold"
                    : "border-transparent font-medium hover:bg-amber-deep",
                )}
              >
                <item.icon className="size-4 text-on-amber" />
                <span className="flex-1">{t(item.label)}</span>
                {item.href === "/app/messages" && (unread.data?.total ?? 0) > 0 && (
                  <span className="rounded-[6px] bg-on-amber px-1.5 text-[11px] font-bold text-amber">
                    {unread.data?.total}
                  </span>
                )}
              </Link>
            );
          })}
          {me.data?.staffRole && (
            <Link
              to="/admin"
              className={cn(
                "mt-2 flex rounded-[8px] items-center gap-2.5 border-l-2 px-3 py-2 text-[13px] font-medium transition-colors",
                location.startsWith("/admin")
                  ? "border-alert bg-ink-3 text-chalk"
                  : "border-transparent text-alert hover:bg-ink-3/60",
              )}
            >
              <ShieldCheck className="size-4 text-alert" /> {t("nav.admin")}
            </Link>
          )}
        </nav>

        <div className="border-t border-line p-3">
          {org.isLoading ? (
            <div className="h-14 animate-pulse bg-ink-3" />
          ) : (
            <div className="space-y-2">
              <div className="rounded-[12px] border border-line bg-ink px-3 py-2">
                <p className="truncate text-[13px] font-semibold text-chalk">
                  {org.data?.org.name}
                </p>
                <p className="mono text-[10px] uppercase tracking-widest text-amber">
                  {org.data?.plan.name} · {org.data?.role}
                </p>
              </div>
              <LanguageSelect />
              <button
                type="button"
                onClick={toggle}
                aria-label={theme === "dark" ? t("shell.switchToLight") : t("shell.switchToDark")}
                className="flex w-full items-center gap-2 rounded-[12px] border border-line px-3 py-2 text-[12px] text-fog transition-colors hover:border-amber/60 hover:text-chalk"
              >
                {theme === "dark" ? (
                  <Sun className="size-3.5 text-amber" />
                ) : (
                  <Moon className="size-3.5 text-amber-deep" />
                )}
                {theme === "dark" ? t("shell.lightTheme") : t("shell.darkTheme")}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await authClient.signOut();
                  window.location.href = "/";
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-fog transition-colors hover:text-alert"
              >
                <LogOut className="size-3.5" /> {t("shell.signOut")}
              </button>
            </div>
          )}
        </div>
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
                    notify.blocked && "cursor-not-allowed opacity-50 hover:border-line hover:text-fog",
                  )}
                >
                  {notify.enabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}
                </button>
              )}
              <LanguageSelect compact />
              <AccountMenu />
            </div>
          </div>
          <nav className="scrollbar-none flex gap-1 overflow-x-auto border-t border-line px-3 py-2 lg:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "rounded-[6px] mono whitespace-nowrap border border-amber bg-amber px-2.5 py-1 text-[10px] uppercase tracking-widest text-on-amber",
                  location === item.href ? "font-bold" : "font-medium",
                )}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </header>

        <main className="px-4 py-5 sm:px-5 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
