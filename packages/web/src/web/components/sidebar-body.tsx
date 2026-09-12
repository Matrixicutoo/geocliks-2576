import { Link, useLocation } from "wouter";
import {
  Camera,
  LogOut,
  UserPlus,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { authClient } from "../lib/auth";
import { useOrg } from "../queries/orgs";
import { canManageWorkspace } from "../lib/roles";
import { useAdminMe } from "../queries/admin";
import { useUnreadMessages } from "../queries/messages";
import { cn } from "../lib/utils";
import { amberFill } from "../lib/chrome";
import { SUPPORT_EMAIL } from "../lib/support";
import { useTheme } from "../lib/theme";
import { type TKey, useLocale } from "../lib/i18n";
import { LanguageSelect } from "./language-select";

/** Same avatar initials the mobile drawer shows, so both menus read as one product. */
function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase() || source.slice(0, 2).toUpperCase();
}

/**
 * Everything the dashboard sidebar holds below its logo bar: who you are, which workspace you
 * are in, the destinations, then language / appearance / help / legal and sign out.
 *
 * It lives in its own file because two containers render it. The `lg` sidebar in DashboardShell
 * is one; the slide-in drawer behind the header's hamburger is the other. Sharing the body is
 * the point — the narrow layout is meant to be the same menu as the wide one, not a reduced
 * version of it, so anything added here appears at every width for free.
 *
 * `drop` is handed to the language picker because the two containers open it in opposite
 * directions: the sidebar sits it at the foot of a full-height column, the drawer does not.
 *
 * The nav entries arrive already filtered by role. This component never decides who may see
 * what — the server is the guard and the shell does the presentation filtering.
 */
export function SidebarBody({
  nav,
  languageDrop = "up",
  onNavigate,
  onInvite,
}: {
  nav: { href: string; label: TKey; icon: typeof Camera }[];
  languageDrop?: "up" | "down";
  /**
   * Called when any link in here is followed. The drawer uses it to dismiss itself, including
   * on a link back to the page already open — that fires no route change, so nothing else
   * would close it. The docked sidebar has nothing to dismiss and leaves it unset.
   */
  onNavigate?: () => void;
  /**
   * Opens the invite sheet. The shell owns that state rather than this body, because the
   * drawer unmounts its copy of the menu the moment it dismisses — a dialog owned here would
   * go with it.
   */
  onInvite?: () => void;
}) {
  const [location] = useLocation();
  const org = useOrg();
  const me = useAdminMe();
  const unread = useUnreadMessages();
  const { theme, toggle } = useTheme();
  const { t } = useLocale();

  return (
    <>
        {/* Identity then workspace, both above the destinations — the same order the mobile
            drawer uses, so the two menus read as one product. */}
        <div className="shrink-0 space-y-1.5 border-b border-line p-2">
          {org.isLoading ? (
            <div className="h-[92px] animate-pulse rounded-[12px] bg-ink-3" />
          ) : (
            <>
              <Link
                onClick={onNavigate}
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
                onClick={onNavigate}
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
                onClick={onNavigate}
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center rounded-[8px] gap-2 border-l-2 bg-amber px-2.5 py-1.5 text-[12px] leading-tight text-on-amber",
                  // Orange fill on every tile, so the pointer needs its own answer: the fill
                  // deepens and an ink hairline rings the tile. `amber-hover` stays light
                  // enough for the ink label, which `amber-deep` is not.
                  amberFill,
                  // Every row is filled now, so the current page is marked by weight and an ink
                  // edge instead of by background.
                  active ? "border-on-amber font-bold" : "border-transparent font-medium",
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
          {/* Invite sits with the destinations rather than buried in Team, because adding a
              crew member is the one workspace action people go looking for from any page. It
              is a sheet, not a route, so it opens over whatever they were doing. */}
          {onInvite && canManageWorkspace(org.data?.role) && (
            <button
              type="button"
              onClick={() => {
                onNavigate?.();
                onInvite();
              }}
              className={cn(
                // Full width across both columns: inviting is the one action here that is not
                // a destination, and the wider tile keeps it from reading as a sixth nav item.
                "col-span-2 flex items-center rounded-[8px] gap-2 border-l-2 border-transparent bg-amber px-2.5 py-1.5 text-left text-[12px] font-medium leading-tight text-on-amber",
                amberFill,
              )}
            >
              <UserPlus className="size-4 shrink-0 text-on-amber" />
              <span className="min-w-0 flex-1">{t("nav.invite")}</span>
            </button>
          )}
          {me.data?.staffRole && (
            <Link
              onClick={onNavigate}
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
                  <LanguageSelect compact drop={languageDrop} />
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
                  onClick={onNavigate}
                  to="/help"
                  className="flex items-center justify-between gap-2 border-t border-line px-3 py-1.5 transition-colors hover:bg-ink-3/60"
                >
                  <span className="text-[12.5px] text-chalk">{t("home.nav.help")}</span>
                  <ExternalLink className="size-3.5 shrink-0 text-fog" />
                </Link>
                <a
                  onClick={onNavigate}
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center justify-between gap-2 border-t border-line px-3 py-1.5 transition-colors hover:bg-ink-3/60"
                >
                  <span className="text-[12.5px] text-chalk">{t("profile.contact")}</span>
                  <ChevronRight className="size-3.5 shrink-0 text-fog" />
                </a>
                <Link
                  onClick={onNavigate}
                  to="/terms"
                  className="flex items-center justify-between gap-2 border-t border-line px-3 py-1.5 transition-colors hover:bg-ink-3/60"
                >
                  <span className="text-[12.5px] text-chalk">{t("home.footer.terms")}</span>
                  <ExternalLink className="size-3.5 shrink-0 text-fog" />
                </Link>
                <Link
                  onClick={onNavigate}
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
    </>
  );
}
