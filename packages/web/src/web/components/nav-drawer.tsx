import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Camera, Menu, X } from "lucide-react";
import { type TKey, useLocale } from "../lib/i18n";
import { useUnreadMessages } from "../queries/messages";
import { cn } from "../lib/utils";
import { Logo } from "./logo";
import { SidebarBody } from "./sidebar-body";

/**
 * The dashboard menu for every width below `lg`, where the sidebar is hidden.
 *
 * It is deliberately the *same* menu as the wide layout rather than a reduced stand-in: the
 * panel renders `SidebarBody`, so identity, workspace, destinations, language, appearance, help,
 * legal and sign out are all present and can never drift apart from the sidebar. Only the
 * container differs — a slide-in sheet from the left edge instead of a docked column.
 *
 * The trigger sits in the header's left corner, ahead of the page title, which is where a
 * hamburger is looked for and where the sidebar it stands in for would otherwise begin.
 */
export function NavDrawer({ nav }: { nav: { href: string; label: TKey; icon: typeof Camera }[] }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { t } = useLocale();
  const unread = useUnreadMessages();
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

  const total = unread.data?.total ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("shell.menu")}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-[8px] relative flex size-9 shrink-0 items-center justify-center border border-line text-fog transition-colors hover:border-amber hover:text-amber lg:hidden"
      >
        <Menu className="size-[18px]" />
        {/* Unread lives on the Messages row inside the sheet, which is out of sight while the
            sheet is shut — so the count also rides on the trigger. */}
        {total > 0 && (
          <span className="mono absolute -right-1 -top-1 min-w-[16px] rounded-[5px] bg-amber px-1 text-[10px] font-bold leading-[16px] text-on-amber">
            {total}
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

            {/* The language picker drops downward here: unlike the sidebar, this card is not
                pinned to the foot of a full-height column. Following any link inside dismisses
                the sheet — the language and appearance buttons are not links, so changing a
                setting deliberately leaves it open. */}
            <SidebarBody nav={nav} languageDrop="down" onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
