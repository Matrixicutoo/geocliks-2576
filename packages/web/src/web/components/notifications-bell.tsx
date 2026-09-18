import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Bell, BellOff, Camera, MessageSquare } from "lucide-react";
import { useMarkNotificationsSeen, useNotificationFeed } from "../queries/notifications";
import { useMessageNotifications } from "../hooks/use-message-notifications";
import { useFaviconBadge } from "../hooks/use-favicon-badge";
import { useLocale } from "../lib/i18n";
import { cn } from "../lib/utils";
import { PhotoDrawer } from "./photo-drawer";

/**
 * The header bell: a count of what happened while you were away, and one panel listing it.
 *
 * Two sources, one list — a teammate messaged you, a teammate posted a capture — because from
 * the reader's side those are the same event: somebody did something you should know about.
 * Splitting them into two indicators would only make people check twice.
 *
 * Opening the panel is what marks things seen, so the badge clears on the gesture that means
 * "I've looked". The dots on the rows stay for that render (see `useMarkNotificationsSeen`),
 * otherwise the list would blank itself out at the exact moment it became readable.
 *
 * The desktop-alert permission toggle lives in this panel's footer rather than on its own
 * button: the bell in the header now means "show me what's new", which is what a bell means
 * everywhere else, and the browser-popup switch is a setting about that same feed.
 */

/** Two letters for somebody with no avatar, same rule as the sidebar's. */
function initials(name: string) {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase() || name.slice(0, 2).toUpperCase() || "?";
}

/** "3m", "10h", "2d" — narrow units, in the reader's language. */
function useRelative() {
  const { locale } = useLocale();
  return (at: Date | string) => {
    const ms = Date.now() - new Date(at).getTime();
    const fmt = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "narrow" });
    const mins = Math.round(ms / 60_000);
    if (mins < 1) return fmt.format(0, "minute");
    if (mins < 60) return fmt.format(-mins, "minute");
    const hours = Math.round(mins / 60);
    if (hours < 24) return fmt.format(-hours, "hour");
    const days = Math.round(hours / 24);
    if (days < 7) return fmt.format(-days, "day");
    return fmt.format(-Math.round(days / 7), "week");
  };
}

export function NotificationsBell() {
  const { t } = useLocale();
  const feed = useNotificationFeed();
  const markSeen = useMarkNotificationsSeen();
  const notify = useMessageNotifications();
  const relative = useRelative();
  const [open, setOpen] = useState(false);
  /**
   * How many were new at the moment the panel opened. The badge itself drops to zero on that
   * same click, so without this snapshot the panel's own header would contradict the dots it
   * is rendering beside the rows.
   */
  const [openedUnseen, setOpenedUnseen] = useState(0);
  const [photoId, setPhotoId] = useState<string | null>(null);
  /**
   * Avatar links that failed to load. A signed URL can expire between the poll that fetched it
   * and the click that opens the panel, and a broken-image glyph is worse than no picture — so
   * a failure falls back to the initials rather than leaving a torn icon where a face was.
   */
  const [brokenAvatars, setBrokenAvatars] = useState<Record<string, true>>({});
  const wrap = useRef<HTMLDivElement>(null);

  const items = feed.data?.items ?? [];
  const unseen = feed.data?.unseen ?? 0;
  // The same count, on the browser tab: the header badge is invisible to somebody working in
  // another site, and a background tab is exactly who a notification is for.
  useFaviconBadge(unseen > 0);

  // A dropdown that outlives the click elsewhere is a dropdown in the way.
  useEffect(() => {
    if (!open) return;
    const away = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setOpenedUnseen(unseen);
    // Mark on open, not on close: people read and navigate away without ever closing a panel.
    if (unseen > 0) markSeen.mutate({});
  }

  return (
    <div className="relative" ref={wrap}>
      {/* A round well, one shade up from the header's own blue so it reads as a surface rather
          than a button competing with the amber pills beside it. Only the bell is yellow. */}
      <button
        type="button"
        aria-label={t("notif.title")}
        title={t("notif.title")}
        aria-expanded={open}
        onClick={toggle}
        className="relative flex size-9 items-center justify-center rounded-full bg-[#173350] text-amber hover:bg-[#1f4368]"
      >
        {/* Filled, not outlined: at 16px a stroke-only bell reads as a thin sketch against the
            dark well. Same amber, painted solid. */}
        <Bell className="size-4 fill-current" />
        {unseen > 0 && (
          <span className="mono absolute -right-1 -top-1 flex min-w-[17px] items-center justify-center rounded-full bg-alert px-1 text-[10px] font-bold leading-[17px] text-white">
            {unseen > 9 ? "9+" : unseen}
          </span>
        )}
      </button>

      {open && (
        <div className="rounded-[10px] absolute right-0 top-[calc(100%+8px)] z-40 w-[min(92vw,360px)] overflow-hidden border border-line bg-ink-2 shadow-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="font-display text-[14px] font-bold text-chalk">{t("notif.title")}</p>
            {openedUnseen > 0 && (
              <span className="mono text-[10px] uppercase tracking-widest text-amber">
                {t("notif.newCount", { n: String(openedUnseen) })}
              </span>
            )}
          </div>

          <div className="max-h-[min(70vh,420px)] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-fog">
                {feed.isLoading ? t("notif.loading") : t("notif.empty")}
              </p>
            ) : (
              <ul>
                {items.map((item) => {
                  // A message opens its thread; a capture opens in the drawer, right here,
                  // so looking at a photo never costs you the page you were on.
                  const body = (
                    <>
                      <span className="relative shrink-0">
                        {item.actor.image && !brokenAvatars[item.actor.id] ? (
                          <img
                            src={item.actor.image}
                            alt=""
                            className="size-9 rounded-full object-cover"
                            onError={() =>
                              setBrokenAvatars((prev) => ({ ...prev, [item.actor.id]: true }))
                            }
                          />
                        ) : (
                          <span className="mono flex size-9 items-center justify-center rounded-full bg-steel text-[11px] font-bold text-chalk">
                            {initials(item.actor.name)}
                          </span>
                        )}
                        {/* Which kind of event it was, as a badge on the avatar. */}
                        <span
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 flex size-[17px] items-center justify-center rounded-full border-2 border-ink-2",
                            item.kind === "message" ? "bg-amber" : "bg-sky",
                          )}
                        >
                          {item.kind === "message" ? (
                            <MessageSquare className="size-[9px] text-ink" />
                          ) : (
                            <Camera className="size-[9px] text-ink" />
                          )}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] leading-snug text-chalk">
                          <b className="font-semibold">{item.actor.name}</b>
                          {item.kind === "message" && item.text ? ": " : " "}
                          {item.kind === "message"
                            ? item.text || t("notif.sentImage")
                            : item.text
                              ? `${t("notif.newCapture")} · ${item.text}`
                              : t("notif.newCapture")}
                        </span>
                        <span
                          className={cn(
                            "mono mt-1 block text-[10px] uppercase tracking-widest",
                            item.unseen ? "text-amber" : "text-fog",
                          )}
                        >
                          {relative(item.at)}
                        </span>
                      </span>
                      {item.thumbUrl && (
                        <img
                          src={item.thumbUrl}
                          alt=""
                          className="rounded-[6px] size-9 shrink-0 object-cover"
                        />
                      )}
                      {item.unseen && (
                        <span className="mt-1 size-2 shrink-0 self-start rounded-full bg-alert" />
                      )}
                    </>
                  );
                  const row = "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-ink";
                  return (
                    <li key={item.id} className="border-b border-line/60 last:border-b-0">
                      {item.conversationId ? (
                        <Link
                          to={`/app/messages?c=${item.conversationId}`}
                          className={row}
                          onClick={() => setOpen(false)}
                        >
                          {body}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className={row}
                          onClick={() => {
                            setPhotoId(item.photoId);
                            setOpen(false);
                          }}
                        >
                          {body}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* The browser-popup switch, kept with the feed it belongs to. */}
          {notify.supported && (
            <button
              type="button"
              disabled={notify.blocked}
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
                "mono flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-[10px] uppercase tracking-widest",
                notify.blocked
                  ? "cursor-not-allowed text-fog opacity-60"
                  : notify.enabled
                    ? "text-amber hover:bg-ink"
                    : "text-fog hover:bg-ink hover:text-amber",
              )}
            >
              {notify.enabled ? <Bell className="size-3.5" /> : <BellOff className="size-3.5" />}
              {notify.blocked
                ? t("notify.blocked")
                : notify.enabled
                  ? t("notify.off")
                  : t("notify.on")}
            </button>
          )}
        </div>
      )}

      <PhotoDrawer photoId={photoId} onClose={() => setPhotoId(null)} />
    </div>
  );
}
