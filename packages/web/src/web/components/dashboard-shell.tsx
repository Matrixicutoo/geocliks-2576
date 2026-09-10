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
  ExternalLink,
  ShieldCheck,
  UserX,
  UserCircle,
  MessageSquare,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { authClient } from "../lib/auth";
import { useOrg } from "../queries/orgs";
import { useAdminMe } from "../queries/admin";
import { useUnreadMessages } from "../queries/messages";
import { useMessageNotifications } from "../hooks/use-message-notifications";
import { stopImpersonation } from "../lib/impersonate";
import { cn } from "../lib/utils";
import { SUPPORT_EMAIL } from "../lib/support";
import { useTheme, useWorkspaceTheme } from "../lib/theme";
import { type TKey, useLocale, useWorkspaceLocale } from "../lib/i18n";
import { Logo } from "./logo";
import { LanguageSelect } from "./language-select";
import { AccountMenu } from "./account-menu";
import { NavMenu } from "./nav-menu";
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

/** Same avatar initials the mobile drawer shows, so both menus read as one product. */
function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase() || source.slice(0, 2).toUpperCase();
}

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

        {/* Identity then workspace, both above the destinations — the same order the mobile
            drawer uses, so the two menus read as one product. */}
        <div className="shrink-0 space-y-1.5 border-b border-line p-2">
          {org.isLoading ? (
            <div className="h-[92px] animate-pulse rounded-[12px] bg-ink-3" />
          ) : (
            <>
              <Link
                to="/app/profile"
                className="flex items-center gap-2.5 rounded-[12px] border border-line bg-ink px-3 py-1.5 transition-colors hover:border-amber/60"
              >
                {/* Personal identity: the uploaded profile photo when there is one, the
                    initials badge otherwise — the same order the mobile drawer uses. */}
                {org.data?.user.image ? (
                  <img
                    src={org.data.user.image}
                    alt=""
                    className="size-8 shrink-0 rounded-[8px] border border-amber object-cover"
                  />
                ) : (
                  <span className="mono flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-amber text-[12px] font-bold text-amber">
                    {initials(org.data?.user.name, org.data?.user.email)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-chalk">
                    {org.data?.user.name ?? org.data?.user.email ?? "—"}
                  </span>
                  <span className="block truncate text-[11px] text-fog">
                    {org.data?.user.email ?? ""}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-fog" />
              </Link>
              <Link
                to="/app"
                className="flex items-center gap-2.5 rounded-[12px] border border-line bg-ink px-3 py-1.5 transition-colors hover:border-amber/60"
              >
                {/* Workspace identity: the business logo when one is uploaded, the shield
                    badge otherwise. Fixed box so the row height never shifts. */}
                {org.data?.org.logoUrl ? (
                  <img
                    src={org.data.org.logoUrl}
                    alt=""
                    className="size-[22px] shrink-0 rounded-[6px] border border-line object-contain"
                  />
                ) : (
                  <ShieldCheck className="size-[18px] shrink-0 text-verified" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-chalk">
                    {org.data?.org.name}
                  </span>
                  <span className="mono block truncate text-[10px] uppercase tracking-widest text-amber">
                    {org.data?.plan.name} · {org.data?.role}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-fog" />
              </Link>
            </>
          )}
        </div>

        {/* Two columns of tiles, the same shape the mobile drawer uses. The yellow list must
            never scroll inside itself — two columns halve its height, and any overflow at
            freak window heights is handled by the aside. */}
        <nav className="grid shrink-0 grid-cols-2 gap-1.5 p-2">
          {nav.map((item) => {
            const active =
              item.href === "/app" ? location === "/app" : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-[8px] gap-2 border-l-2 bg-amber px-2.5 py-1.5 text-[12px] leading-tight text-on-amber transition-colors",
                  // Every row is filled now, so the current page is marked by weight and an ink
                  // edge instead of by background.
                  active
                    ? "border-on-amber font-bold"
                    : "border-transparent font-medium hover:bg-amber-deep",
                )}
              >
                <item.icon className="size-4 shrink-0 text-on-amber" />
                <span className="min-w-0 flex-1">{t(item.label)}</span>
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
                "col-span-2 mt-1 flex rounded-[8px] items-center gap-2.5 border-l-2 px-3 py-1.5 text-[13px] font-medium transition-colors",
                location.startsWith("/admin")
                  ? "border-alert bg-ink-3 text-chalk"
                  : "border-transparent text-alert hover:bg-ink-3/60",
              )}
            >
              <ShieldCheck className="size-4 text-alert" /> {t("nav.admin")}
            </Link>
          )}
        </nav>

        <div className="shrink-0 border-t border-line p-2">
          {org.isLoading ? (
            <div className="h-14 animate-pulse bg-ink-3" />
          ) : (
            /* One bordered card of label-and-value rows, then sign out on its own —
               the same shape as the bottom of the mobile drawer. */
            <div className="space-y-1.5">
              {/* No `overflow-hidden` here: it used to clip the language dropdown so only the
                  first few languages were visible. The first and last rows round their own
                  corners instead, which keeps hover fills inside the border. */}
              <div className="rounded-[12px] border border-line bg-ink">
                <div className="flex items-center justify-between gap-2 rounded-t-[12px] px-3 py-1.5">
                  <span className="text-[12.5px] text-chalk">{t("language.title")}</span>
                  <LanguageSelect compact drop="up" />
                </div>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={theme === "dark" ? t("shell.switchToLight") : t("shell.switchToDark")}
                  className="flex w-full items-center justify-between gap-2 border-t border-line px-3 py-1.5 text-left transition-colors hover:bg-ink-3/60"
                >
                  <span className="text-[12.5px] text-chalk">{t("appearance.title")}</span>
                  <span className="mono flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-fog">
                    {theme === "dark" ? (
                      <Moon className="size-3.5 text-amber" />
                    ) : (
                      <Sun className="size-3.5 text-amber" />
                    )}
                    {theme === "dark" ? t("appearance.dark") : t("appearance.light")}
                  </span>
                </button>
                {/* Help / support / legal, in the same order the mobile drawer lists them and
                    styled the same way: plain label, no leading icon, a small muted hint icon on
                    the right. Terms and Privacy are public routes, so they work signed in or out. */}
                <Link
                  to="/help"
                  className="flex items-center justify-between gap-2 border-t border-line px-3 py-1.5 transition-colors hover:bg-ink-3/60"
                >
                  <span className="text-[12.5px] text-chalk">{t("home.nav.help")}</span>
                  <ExternalLink className="size-3.5 shrink-0 text-fog" />
                </Link>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center justify-between gap-2 border-t border-line px-3 py-1.5 transition-colors hover:bg-ink-3/60"
                >
                  <span className="text-[12.5px] text-chalk">{t("profile.contact")}</span>
                  <ChevronRight className="size-3.5 shrink-0 text-fog" />
                </a>
                <Link
                  to="/terms"
                  className="flex items-center justify-between gap-2 border-t border-line px-3 py-1.5 transition-colors hover:bg-ink-3/60"
                >
                  <span className="text-[12.5px] text-chalk">{t("home.footer.terms")}</span>
                  <ExternalLink className="size-3.5 shrink-0 text-fog" />
                </Link>
                <Link
                  to="/privacy"
                  className="flex items-center justify-between gap-2 rounded-b-[12px] border-t border-line px-3 py-1.5 transition-colors hover:bg-ink-3/60"
                >
                  <span className="text-[12.5px] text-chalk">{t("home.footer.privacy")}</span>
                  <ExternalLink className="size-3.5 shrink-0 text-fog" />
                </Link>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await authClient.signOut();
                  window.location.href = "/";
                }}
                className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-line px-3 py-2 text-[12.5px] text-alert transition-colors hover:border-alert/60"
              >
                <LogOut className="size-4" /> {t("shell.signOut")}
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
              <LanguageSelect compact />
              {/* Destinations below `lg`, where the sidebar is hidden. One dropdown instead of
                  the sideways-scrolling pill strip this used to be, so nothing is off-screen. */}
              <NavMenu
                items={nav}
                unread={unread.data?.total ?? 0}
                showAdmin={Boolean(me.data?.staffRole)}
              />
              <AccountMenu />
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-5 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
