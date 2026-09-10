import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useLocale } from "../lib/i18n";
import { cn } from "../lib/utils";
import { amberFill, amberRing } from "../lib/chrome";
import { Logo } from "./logo";

/**
 * The container behind the hamburger: a slide-in sheet from the left edge, for every width
 * below `lg` where a docked sidebar is hidden.
 *
 * It owns only the shell and the dismissal rules — trigger, backdrop, logo bar, close control,
 * Escape, route change, body scroll lock and the hand-back to the sidebar when the window is
 * widened past `lg`. What goes inside is the caller's, handed the `close` callback so a link
 * within it can dismiss the sheet. Both shells that have a sidebar use this, which is why the
 * behaviour cannot drift between the workspace menu and the admin one.
 *
 * The trigger sits wherever the caller renders it — in both shells that is the header's left
 * corner, ahead of the page title, where the sidebar it stands in for would otherwise begin.
 */
export function MenuDrawer({
  badge = 0,
  children,
}: {
  /** Count shown on the trigger, for anything unread that is out of sight while shut. */
  badge?: number;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useLocale();
  const panel = useRef<HTMLDivElement>(null);

  // Escape closes, matching the header's other dropdowns. The backdrop handles pointer
  // dismissal, so there is no outside-click listener to fight with it here.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Navigating is the point of the menu, so a route change dismisses it — otherwise the sheet
  // would sit on top of the page it just opened.
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // The sheet only exists below `lg`. Widening past it hands the job back to the docked
  // sidebar and hides the trigger, so the open state has to go with it.
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (wide.matches) setOpen(false);
    };
    wide.addEventListener("change", onChange);
    return () => wide.removeEventListener("change", onChange);
  }, [open]);

  // A sheet over the page should not leave the page scrolling behind it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Focus moves into the sheet when it opens so the keyboard follows the eye.
  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("shell.menu")}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "rounded-[8px] relative flex size-9 shrink-0 items-center justify-center",
          "border border-transparent lg:hidden",
          amberFill,
          open && amberRing,
        )}
      >
        <Menu className="size-[18px]" />
        {badge > 0 && (
          <span className="mono absolute -right-1 -top-1 min-w-[16px] rounded-[5px] border border-amber bg-on-amber px-1 text-[10px] font-bold leading-[16px] text-amber">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t("shell.closeMenu")}
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/60"
          />
          <div
            ref={panel}
            role="menu"
            tabIndex={-1}
            className={cn(
              "absolute left-0 top-0 flex h-full w-[268px] max-w-[86vw] flex-col",
              "overflow-y-auto border-r border-line bg-ink-2 shadow-[0_0_60px_rgba(0,0,0,0.6)]",
              "outline-none motion-safe:animate-[nav-drawer-in_180ms_ease-out]",
            )}
          >
            {/* Same dark logo bar and same height as the sidebar's, with the close control
                where the trigger was. */}
            <div
              data-theme="dark"
              className="flex h-[68px] shrink-0 items-center justify-between gap-2 border-b border-line bg-[#0d2137] px-4"
            >
              <Link to="/">
                <Logo />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("shell.closeMenu")}
                className="rounded-[8px] flex size-8 shrink-0 items-center justify-center border border-line text-fog transition-colors hover:border-amber hover:text-amber"
              >
                <X className="size-4" />
              </button>
            </div>

            {children(() => setOpen(false))}
          </div>
        </div>
      )}
    </>
  );
}
