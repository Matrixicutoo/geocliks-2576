import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, ShieldCheck, X } from "lucide-react";
import { type TKey, useLocale } from "../lib/i18n";
import { cn } from "../lib/utils";

/**
 * Destination menu for the dashboard header below `lg`, where the sidebar is hidden.
 *
 * It replaces the horizontal strip of amber pills that used to sit on a second header row: that
 * strip scrolled sideways, so on a resized desktop window most destinations were pushed out of
 * sight with nothing on screen to say they existed. A single button that opens one panel matches
 * how the mobile app's drawer behaves, so both read as one product.
 *
 * The items are handed in already filtered by role — this component never decides who may see
 * what, it only presents what the shell gives it.
 */
export function NavMenu({
  items,
  unread,
  showAdmin,
}: {
  items: { href: string; label: TKey; icon: typeof Menu }[];
  unread: number;
  showAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useLocale();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape, the same contract AccountMenu uses so the two
  // header dropdowns behave identically.
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

  // Navigating is the point of the menu, so a route change dismisses it. Without this the panel
  // would still be covering the page that was just opened.
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // The panel only exists below `lg`; if the window is widened while it is open the sidebar
  // takes over and the button disappears, so drop the open state with it.
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (wide.matches) setOpen(false);
    };
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, [open]);

  const active = (href: string) =>
    href === "/app" ? location === "/app" : location.startsWith(href);

  return (
    <div ref={ref} className="relative shrink-0 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("shell.closeMenu") : t("shell.menu")}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "rounded-[8px] mono flex h-9 items-center gap-1.5 border px-2.5 text-[10px] uppercase tracking-widest transition-colors",
          open
            ? "border-amber bg-amber/10 text-amber"
            : "border-line text-fog hover:border-amber hover:text-amber",
        )}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
        <span className="hidden sm:inline">{t("shell.menu")}</span>
        {/* Unread lives on the Messages row inside the panel, but that row is out of sight
            while the panel is shut — so the count also rides on the button itself. */}
        {!open && unread > 0 && (
          <span className="rounded-[5px] bg-amber px-1.5 text-[10px] font-bold text-on-amber">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-[calc(100vh-96px)] w-[248px] overflow-y-auto rounded-[12px] border border-line bg-ink-2 p-2 shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
        >
          <div className="grid gap-1.5">
            {items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                role="menuitem"
                className={cn(
                  "flex items-center gap-2 rounded-[8px] border-l-2 bg-amber px-2.5 py-2 text-[12.5px] leading-tight text-on-amber transition-colors",
                  active(item.href)
                    ? "border-on-amber font-bold"
                    : "border-transparent font-medium hover:bg-amber-deep",
                )}
              >
                <item.icon className="size-4 shrink-0 text-on-amber" />
                <span className="min-w-0 flex-1 truncate">{t(item.label)}</span>
                {item.href === "/app/messages" && unread > 0 && (
                  <span className="rounded-[6px] bg-on-amber px-1.5 text-[11px] font-bold text-amber">
                    {unread}
                  </span>
                )}
              </Link>
            ))}
            {showAdmin && (
              <Link
                to="/admin"
                role="menuitem"
                className={cn(
                  "mt-1 flex items-center gap-2.5 rounded-[8px] border-l-2 px-3 py-2 text-[12.5px] font-medium transition-colors",
                  location.startsWith("/admin")
                    ? "border-alert bg-ink-3 text-chalk"
                    : "border-transparent text-alert hover:bg-ink-3/60",
                )}
              >
                <ShieldCheck className="size-4 shrink-0 text-alert" /> {t("nav.admin")}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
