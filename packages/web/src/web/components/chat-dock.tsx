import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  MessageCircle,
  Search,
  Send,
  Smile,
  X,
} from "lucide-react";
import { authClient } from "../lib/auth";
import { cn } from "../lib/utils";
import { useLocale } from "../lib/i18n";
import { EMOJI, uploadMessageImage } from "../lib/message-compose";
import { DOCK_MIN_WIDTH, useMinWidth } from "../lib/assistant";
import {
  closeChatWindow,
  minimizeChatWindow,
  openChatWindow,
  restoreChatDock,
  setChatPicker,
  toggleChatWindow,
  useChatDock,
} from "../lib/chat-dock";
import {
  useContacts,
  useConversations,
  useMarkRead,
  useOpenConversation,
  useSendMessage,
  useThread,
  useUnreadMessages,
} from "../queries/messages";

/**
 * Floating chat, docked to the bottom-right corner: a launcher bubble, a people picker, and one
 * small window per open thread.
 *
 * Why it exists: a message notification used to navigate to /app/messages, which costs you the
 * page you were working on — the capture you were filing, the route you were building. A crew
 * chat is a side conversation, so it belongs beside the work instead of replacing it. Clicking a
 * message in the bell now opens it here and you stay where you are.
 *
 * Mounted once at the app root, outside the router, so a window survives navigation. The full
 * Messages page is still there and still the place for long threads and attachments — every
 * window has a button that hands the thread over to it.
 */

/** Two letters for somebody with no avatar, same rule as the sidebar's and the bell's. */
function initials(name: string) {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase() || name.slice(0, 2).toUpperCase() || "?";
}

function stamp(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Person = {
  id: string;
  name: string;
  image: string | null;
  role?: string | null;
  email?: string | null;
};

/** Avatar with an initials fallback, and a second fallback for a signed URL that has expired. */
function Avatar({ person, size }: { person: Person | null; size: 7 | 9 | 12 }) {
  const [broken, setBroken] = useState(false);
  const box = size === 12 ? "size-12" : size === 9 ? "size-9" : "size-7";
  const text = size === 12 ? "text-[13px]" : "text-[11px]";
  if (person?.image && !broken) {
    return (
      <img
        src={person.image}
        alt=""
        onError={() => setBroken(true)}
        className={cn(box, "shrink-0 rounded-full object-cover")}
      />
    );
  }
  return (
    <span
      className={cn(
        box,
        text,
        "mono flex shrink-0 items-center justify-center rounded-full bg-steel font-bold text-chalk",
      )}
    >
      {initials(person?.name ?? "?")}
    </span>
  );
}

export function ChatDock() {
  const [location] = useLocation();
  const { data: session } = authClient.useSession();
  /**
   * Workspace surfaces only. The marketing site has no crew to message, the admin console is an
   * internal staff surface, and on the Messages page itself a floating copy of the thread that
   * is already filling the screen would be nothing but clutter — there, the bell keeps its old
   * behaviour and opens the thread in place.
   */
  const eligible =
    Boolean(session?.user) && location.startsWith("/app") && !location.startsWith("/app/messages");
  if (!eligible) return null;
  return <Dock />;
}

function Dock() {
  const { t } = useLocale();
  const dock = useChatDock();
  const conversations = useConversations();
  const unread = useUnreadMessages();
  const wide = useMinWidth(DOCK_MIN_WIDTH);

  useEffect(() => {
    restoreChatDock();
  }, []);

  const people = useMemo(() => {
    const map = new Map<string, Person>();
    for (const row of conversations.data ?? []) {
      map.set(row.id, {
        id: row.other.id,
        name: row.other.name,
        image: row.other.image,
        role: row.other.role,
        email: row.other.email,
      });
    }
    return map;
  }, [conversations.data]);

  const expanded = dock.windows.filter((w) => !w.minimized);
  // Narrow viewports get one window at a time: two 328px panels side by side on a phone would
  // cover the page entirely, and the rest stay as bubbles until they are tapped.
  const showing = wide ? expanded.slice(0, 3) : expanded.slice(0, 1);
  const bubbles = dock.windows.filter((w) => !showing.includes(w));
  const total = unread.data?.total ?? 0;

  // Escape backs out one step at a time: the picker first, then the newest window.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (dock.picker) {
        setChatPicker(false);
        return;
      }
      const newest = showing[0];
      if (newest) minimizeChatWindow(newest.conversationId);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dock.picker, showing]);

  return (
    /* Sits clear of the assistant panel: docked, the assistant owns a real column on the right,
       and `--assistant-w` is the width it publishes for exactly this. */
    <div
      style={{ right: "calc(var(--assistant-w, 0px) + 16px)" }}
      className="fixed bottom-4 z-[60] flex items-end gap-3"
    >
      {showing.map((w) => (
        <ChatWindow
          key={w.conversationId}
          conversationId={w.conversationId}
          person={people.get(w.conversationId) ?? null}
        />
      ))}

      {/* The bubble column, right-aligned so the picker opens flush with the launcher's own
          edge instead of hanging off the side of the viewport. */}
      <div className="flex flex-col items-end gap-2">
        {/* Minimised threads, newest at the top, each with its own unread count. */}
        {bubbles.map((w) => {
          const person = people.get(w.conversationId) ?? null;
          const count = (conversations.data ?? []).find((c) => c.id === w.conversationId)?.unread ?? 0;
          return (
            <div key={w.conversationId} className="group relative">
              <button
                type="button"
                title={person?.name ?? t("msg.title")}
                aria-label={person?.name ?? t("msg.title")}
                onClick={() => openChatWindow(w.conversationId)}
                className="rounded-full border-2 border-line bg-ink-2 p-0.5 shadow-xl hover:border-amber"
              >
                <Avatar person={person} size={9} />
              </button>
              {count > 0 && (
                <span className="mono pointer-events-none absolute -right-1 -top-1 flex min-w-[17px] items-center justify-center rounded-full bg-alert px-1 text-[10px] font-bold leading-[17px] text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
              <button
                type="button"
                aria-label={t("dock.close")}
                title={t("dock.close")}
                onClick={() => closeChatWindow(w.conversationId)}
                className="absolute -left-1.5 -top-1.5 hidden size-5 items-center justify-center rounded-full border border-line bg-ink text-fog hover:text-chalk group-hover:flex"
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}

        {dock.picker && <PeoplePicker />}

        {/* The launcher. Always there, so "message somebody" is one click from every workspace
            page — and it is the only thing left in the corner once the last window is closed. */}
        <button
          type="button"
          aria-label={t("dock.newMessage")}
          title={t("dock.newMessage")}
          aria-expanded={dock.picker}
          onClick={() => setChatPicker(!dock.picker)}
          className={cn(
            "relative flex size-12 items-center justify-center rounded-full border shadow-xl transition-colors",
            dock.picker
              ? "border-amber bg-amber text-on-amber"
              : "border-line bg-ink-2 text-amber hover:border-amber hover:bg-ink-3",
          )}
        >
          {dock.picker ? (
            <ChevronDown className="size-5" />
          ) : (
            <MessageCircle className="size-5 fill-current" />
          )}
          {!dock.picker && total > 0 && (
            <span className="mono absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-alert px-1 text-[10px] font-bold leading-[18px] text-white">
              {total > 9 ? "9+" : total}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/** The address book: everybody in the workspace this member is allowed to message. */
function PeoplePicker() {
  const { t } = useLocale();
  const contacts = useContacts();
  const open = useOpenConversation();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const list = useMemo(() => {
    const rows = contacts.data ?? [];
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      `${row.name ?? ""} ${row.email ?? ""} ${row.title ?? ""}`.toLowerCase().includes(needle),
    );
  }, [contacts.data, query]);

  async function start(userId: string) {
    setBusy(userId);
    try {
      const out = await open.mutateAsync({ userId });
      openChatWindow(out.id);
      setQuery("");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-[12px] w-[min(92vw,320px)] overflow-hidden border border-line bg-ink-2 shadow-2xl">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <p className="font-display text-[14px] font-bold text-chalk">{t("dock.newMessage")}</p>
        <button
          type="button"
          aria-label={t("dock.closePicker")}
          title={t("dock.closePicker")}
          onClick={() => setChatPicker(false)}
          className="flex size-7 items-center justify-center rounded-full text-fog hover:bg-ink hover:text-chalk"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-line px-4 py-2">
        <span className="mono text-[11px] uppercase tracking-widest text-fog">{t("dock.to")}</span>
        <Search className="size-3.5 shrink-0 text-fog" />
        <input
          aria-label={t("dock.search")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("dock.search")}
          className="min-w-0 flex-1 bg-transparent py-1 text-[13px] text-chalk outline-none placeholder:text-fog"
        />
      </div>

      <div className="max-h-[min(50vh,320px)] overflow-y-auto">
        {contacts.isLoading ? (
          <p className="px-4 py-6 text-center text-[13px] text-fog">{t("notif.loading")}</p>
        ) : list.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-fog">{t("msg.noPeople")}</p>
        ) : (
          list.map((person) => (
            <button
              key={person.userId}
              type="button"
              disabled={busy !== null}
              onClick={() => void start(person.userId)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-ink disabled:opacity-60"
            >
              <Avatar
                person={{ id: person.userId, name: person.name ?? "?", image: person.image }}
                size={9}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-chalk">
                  {person.name}
                </span>
                <span className="mono block truncate text-[10px] uppercase tracking-widest text-fog">
                  {person.title || person.role}
                </span>
              </span>
              {busy === person.userId && <Loader2 className="size-4 animate-spin text-amber" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function ChatWindow({
  conversationId,
  person,
}: {
  conversationId: string;
  person: Person | null;
}) {
  const { t } = useLocale();
  const thread = useThread(conversationId);
  const send = useSendMessage();
  const markRead = useMarkRead();
  const [body, setBody] = useState("");
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [emoji, setEmoji] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement | null>(null);

  const items = thread.data?.items ?? [];
  const who: Person | null = person ?? (thread.data ? { ...thread.data.other } : null);

  // Reading a thread in the dock clears its badge, exactly as opening it on the page does.
  const markReadRef = useRef(markRead.mutate);
  markReadRef.current = markRead.mutate;
  useEffect(() => {
    markReadRef.current({ conversationId });
  }, [conversationId, items.length]);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [items.length, conversationId]);

  async function attach(file: File) {
    setUploading(true);
    setError(null);
    try {
      setImageKey(await uploadMessageImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!body.trim() && !imageKey) return;
    setError(null);
    try {
      await send.mutateAsync({ conversationId, body, imageKey });
      setBody("");
      setImageKey(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("msg.failed"));
    }
  }

  return (
    <div className="rounded-t-[12px] flex h-[min(70vh,460px)] w-[min(92vw,328px)] flex-col overflow-hidden border border-line bg-ink-2 shadow-2xl">
      {/* Header: who you are talking to, and the three things you can do to the window. */}
      <div className="flex items-center gap-2 border-b border-line bg-ink px-3 py-2">
        <button
          type="button"
          onClick={() => minimizeChatWindow(conversationId)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          title={t("dock.minimize")}
        >
          <Avatar person={who} size={7} />
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold text-chalk">
              {who?.name ?? "—"}
            </span>
            <span className="mono block truncate text-[10px] uppercase tracking-widest text-fog">
              {who?.role || who?.email || ""}
            </span>
          </span>
        </button>
        <Link
          to={`/app/messages?c=${conversationId}`}
          aria-label={t("dock.expand")}
          title={t("dock.expand")}
          className="flex size-7 items-center justify-center rounded-full text-fog hover:bg-ink-3 hover:text-chalk"
        >
          <Maximize2 className="size-3.5" />
        </Link>
        <button
          type="button"
          aria-label={t("dock.minimize")}
          title={t("dock.minimize")}
          onClick={() => toggleChatWindow(conversationId)}
          className="flex size-7 items-center justify-center rounded-full text-fog hover:bg-ink-3 hover:text-chalk"
        >
          <ChevronDown className="size-4" />
        </button>
        <button
          type="button"
          aria-label={t("dock.close")}
          title={t("dock.close")}
          onClick={() => closeChatWindow(conversationId)}
          className="flex size-7 items-center justify-center rounded-full text-fog hover:bg-ink-3 hover:text-chalk"
        >
          <X className="size-4" />
        </button>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {thread.isLoading ? (
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-[10px] bg-ink-3" />
            <div className="h-10 animate-pulse rounded-[10px] bg-ink-3" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-fog">{t("msg.empty")}</p>
        ) : (
          items.map((item) => {
            // Same rule as the page: the poster frame is the preview, the media is the file.
            const preview = item.photo?.url ?? item.imageUrl ?? null;
            const full = item.photo ? (item.photo.mediaUrl ?? item.photo.url) : item.imageUrl;
            return (
              <div key={item.id} className={cn("flex", item.mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "rounded-[12px] max-w-[84%] border px-2.5 py-1.5",
                    item.mine ? "border-amber/40 bg-ink-3" : "border-line bg-ink",
                  )}
                >
                  {item.project && (
                    <p className="mono mb-1 text-[10px] uppercase tracking-widest text-amber">
                      {item.project.name}
                    </p>
                  )}
                  {preview && full && (
                    // The popup is small, so a capture opens in its own tab rather than in a
                    // lightbox stacked on top of a floating window.
                    <a
                      href={full}
                      target="_blank"
                      rel="noreferrer"
                      title={t("msg.openMedia")}
                      className="mb-1.5 block overflow-hidden rounded-[8px]"
                    >
                      <img src={preview} alt="" className="max-h-40 w-full object-cover" />
                    </a>
                  )}
                  {item.photo && (
                    <p className="mb-1 font-mono text-[10px] text-verified">{item.photo.code}</p>
                  )}
                  {item.body && (
                    <p className="whitespace-pre-wrap text-[13px] leading-snug text-chalk">
                      {item.body}
                    </p>
                  )}
                  <p className="mt-0.5 text-[10px] text-fog">{stamp(item.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer: text, an emoji tray and one image. Project and capture references stay on the
          full page — they need pickers this window has no room for, and the header's expand
          button is one click away. */}
      <div className="border-t border-line p-2">
        {imageKey && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-[8px] border border-line bg-ink px-2 py-1">
            <span className="truncate text-[11px] text-fog">{t("msg.attachImage")}</span>
            <button
              type="button"
              aria-label={t("msg.clearRef")}
              onClick={() => setImageKey(null)}
              className="text-fog hover:text-alert"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-1.5">
          <label
            title={t("msg.attachImage")}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-fog hover:bg-ink hover:text-amber"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImageIcon className="size-4" />
            )}
            <input
              aria-label={t("msg.attachImage")}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void attach(file);
              }}
            />
          </label>

          <div className="relative">
            <button
              type="button"
              aria-label={t("msg.emoji")}
              title={t("msg.emoji")}
              onClick={() => setEmoji((v) => !v)}
              className={cn(
                "flex size-8 items-center justify-center rounded-full hover:bg-ink",
                emoji ? "text-amber" : "text-fog hover:text-amber",
              )}
            >
              <Smile className="size-4" />
            </button>
            {emoji && (
              <div className="rounded-[12px] absolute bottom-full left-0 z-10 mb-2 grid w-[248px] grid-cols-8 gap-0.5 border border-line bg-ink-2 p-2 shadow-2xl">
                {EMOJI.map((glyph) => (
                  <button
                    key={glyph}
                    type="button"
                    aria-label={glyph}
                    onClick={() => {
                      setBody((current) => current + glyph);
                      setEmoji(false);
                    }}
                    className="flex size-7 items-center justify-center rounded-[6px] text-[16px] leading-none hover:bg-ink-3"
                  >
                    {glyph}
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            aria-label={t("msg.placeholder")}
            value={body}
            rows={1}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit();
              }
            }}
            placeholder={t("msg.placeholder")}
            className="max-h-24 min-h-[34px] flex-1 resize-none rounded-[16px] border border-line bg-ink px-3 py-1.5 text-[13px] text-chalk outline-none focus:border-amber"
          />

          <button
            type="button"
            aria-label={t("msg.send")}
            title={t("msg.send")}
            onClick={() => void submit()}
            disabled={send.isPending || uploading || (!body.trim() && !imageKey)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-amber hover:bg-ink disabled:opacity-40"
          >
            {send.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </div>
        {error && <p className="mt-1 text-[11px] text-alert">{error}</p>}
      </div>
    </div>
  );
}
