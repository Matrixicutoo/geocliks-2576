import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { CreditCard, LifeBuoy, LogOut, Moon, ShieldCheck, Sun, UserCircle } from "lucide-react";
import { authClient } from "../lib/auth";
import { useOrg } from "../queries/orgs";
import { useAdminMe } from "../queries/admin";
import { useTheme } from "../lib/theme";
import { useLocale } from "../lib/i18n";
import { cn } from "../lib/utils";
import { amberFill, amberRing, amberRow } from "../lib/chrome";

function initials(name?: string | null, email?: string | null) {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return letters.toUpperCase();
}

/**
 * Account dropdown in the dashboard header. This is the only sign-out that is reachable at
 * every viewport width: the sidebar footer is hidden below `lg`, so without this the phone and
 * tablet layouts had no way to reach the profile or sign out at all.
 */
export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const org = useOrg();
  const me = useAdminMe();
  const { theme, toggle } = useTheme();
  const { t } = useLocale();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const user = org.data?.user;
  const image = user?.image ?? null;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("profile.title")}
        aria-expanded={open}
        className={cn(
          "rounded-[6px] flex items-center gap-2 border border-transparent px-1.5 py-1.5",
          amberFill,
          "font-semibold",
          open && amberRing,
        )}
      >
        {image ? (
          <img src={image} alt="" className="size-7 rounded-[8px] object-cover" />
        ) : (
          <span className="mono flex size-7 items-center justify-center rounded-[8px] bg-on-amber text-[11px] font-semibold text-amber">
            {initials(user?.name, user?.email)}
          </span>
        )}
        <span className="mono hidden max-w-[130px] truncate text-[11px] uppercase tracking-widest sm:inline">
          {user?.name ?? user?.email ?? ""}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[268px] rounded-[12px] border border-line bg-ink-2 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-[13px] font-semibold text-chalk">
              {user?.name ?? t("profile.title")}
            </p>
            <p className="mono truncate text-[10.5px] text-fog">{user?.email}</p>
          </div>

          <div className="border-b border-line px-4 py-3">
            <p className="truncate text-[12.5px] font-semibold text-chalk">{org.data?.org.name}</p>
            <p className="mono text-[10px] uppercase tracking-widest text-amber">
              {org.data?.plan.name} · {org.data?.role}
            </p>
          </div>

          <div className="p-1.5">
            <Link
              to="/app/profile"
              onClick={() => setOpen(false)}
              className={cn("rounded-[8px] flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] text-fog", amberRow)}
            >
              <UserCircle className="size-4 text-amber group-hover:text-on-amber" />{" "}
              {t("profile.title")}
            </Link>
            <Link
              to="/app/billing"
              onClick={() => setOpen(false)}
              className={cn("rounded-[8px] flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] text-fog", amberRow)}
            >
              <CreditCard className="size-4 text-amber group-hover:text-on-amber" /> {t("nav.plan")}
            </Link>
            <Link
              to="/help"
              onClick={() => setOpen(false)}
              className={cn("rounded-[8px] flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] text-fog", amberRow)}
            >
              <LifeBuoy className="size-4 text-amber group-hover:text-on-amber" />{" "}
              {t("home.nav.help")}
            </Link>
            {me.data?.staffRole && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className={cn("rounded-[8px] flex items-center gap-2.5 px-2.5 py-2 text-[12.5px] text-alert", amberRow)}
              >
                <ShieldCheck className="size-4" /> {t("nav.admin")}
              </Link>
            )}
            <button
              type="button"
              onClick={toggle}
              className={cn("rounded-[8px] flex w-full items-center gap-2.5 px-2.5 py-2 text-[12.5px] text-fog", amberRow)}
            >
              {theme === "dark" ? (
                <Sun className="size-4 text-amber group-hover:text-on-amber" />
              ) : (
                <Moon className="size-4 text-amber group-hover:text-on-amber" />
              )}
              {theme === "dark" ? t("shell.lightTheme") : t("shell.darkTheme")}
            </button>
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/";
              }}
              className="rounded-[8px] flex w-full items-center gap-2.5 border-t border-line px-2.5 py-2 text-[12.5px] text-fog transition-colors duration-150 hover:bg-ink-3 hover:text-alert"
            >
              <LogOut className="size-4" /> {t("shell.signOut")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
