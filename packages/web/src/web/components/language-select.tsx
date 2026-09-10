import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LOCALES } from "../../api/lib/locales";
import { cn } from "../lib/utils";
import { useLocale } from "../lib/i18n";

/**
 * Language picker for the app chrome. Lives in the fixed left sidebar on desktop
 * and in the compact top bar on small screens. Device-level choice only — the
 * workspace default is set on the Team page.
 */
export function LanguageSelect({
  compact = false,
  bare = false,
  drop = "down",
}: {
  compact?: boolean;
  /** Borderless variant for the dark marketing header. */
  bare?: boolean;
  /**
   * Which way the compact panel opens. The sidebar copy sits near the bottom of the
   * screen, so it must open upward or the last few languages fall off-screen.
   */
  drop?: "up" | "down";
}) {
  const { locale, override, t, setLocale, useWorkspaceDefault } = useLocale();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language.title")}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 transition-colors",
          bare
            ? "px-1 py-2 text-[13px] font-semibold text-white hover:text-amber"
            : "gap-2 rounded-[12px] border border-line text-fog hover:border-amber/60 hover:text-chalk",
          !bare && (compact ? "px-2 py-1.5 text-[11px]" : "w-full px-3 py-2 text-[12px]"),
        )}
      >
        <Globe className={cn("size-4 shrink-0", bare ? "text-white" : "size-3.5 text-amber")} />
        <span
          className={cn(
            "truncate",
            bare ? "capitalize" : "mono uppercase tracking-widest",
          )}
        >
          {bare ? current.code.split("-")[0] : compact ? current.code : current.native}
        </span>
        {bare && <ChevronDown className="size-3.5" />}
      </button>

      {open && (
        <div
          className={cn(
            // 70vh instead of a fixed height: all 12 rows (~406px) fit on a normal screen
            // rather than the last few being hidden behind an easy-to-miss inner scrollbar.
            "absolute z-50 max-h-[70vh] w-[220px] overflow-y-auto rounded-[12px] border border-line bg-ink-2 shadow-xl",
            compact
              ? drop === "up"
                ? "bottom-full mb-1 end-0"
                : "top-full mt-1 end-0"
              : "bottom-full mb-1 start-0",
          )}
        >
          <button
            type="button"
            onClick={() => {
              useWorkspaceDefault();
              setOpen(false);
            }}
            className="rounded-[8px] mono flex w-full items-center justify-between gap-2 border-b border-line px-3 py-2 text-start text-[10px] uppercase tracking-widest text-fog hover:bg-ink-3 hover:text-chalk"
          >
            {t("language.followWorkspace")}
            {!override && <Check className="size-3.5 text-amber" />}
          </button>
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLocale(l.code);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-[12px] hover:bg-ink-3",
                override === l.code ? "text-chalk" : "text-fog",
              )}
            >
              <span className="truncate">
                {l.native}
                <span className="mono ms-2 text-[10px] uppercase tracking-widest text-fog">
                  {l.code}
                </span>
              </span>
              {override === l.code && <Check className="size-3.5 shrink-0 text-amber" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
