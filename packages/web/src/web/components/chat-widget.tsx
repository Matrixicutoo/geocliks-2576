import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageSquare, Send, Square, Trash2, X } from "lucide-react";
import { useT } from "../lib/i18n";
import { amberFill } from "../lib/chrome";
import {
  ASSISTANT_NAME,
  DOCK_MIN_WIDTH,
  onAssistantOpen,
  setAssistantDocked,
  useAssistantAccess,
  useMinWidth,
} from "../lib/assistant";

/**
 * The assistant panel, docked to the right edge of the signed-in app.
 *
 * It has no floating tab of its own: it is opened from the "GeoCliks AI Assistant" link in the
 * site footer and in the account menu, and only for a workspace whose plan includes it.
 *
 * Mounted once at the app root, outside the router's Switch, so the transcript survives
 * navigation. It also survives a reload: messages are mirrored into localStorage, versioned so
 * a future change to the stored shape can drop old transcripts instead of crashing on them.
 */
const KEY = "geocliks.assistant.v1";
const OPEN_KEY = "geocliks.assistant-open.v1";
const MAX_STORED = 40;

function readStored(): UIMessage[] {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Only keep what still looks like a UI message, so a stale shape degrades to an empty chat.
    return (parsed as UIMessage[])
      .filter((m) => m && typeof m.id === "string" && Array.isArray(m.parts))
      .slice(-MAX_STORED);
  } catch {
    return [];
  }
}

function store(messages: UIMessage[]) {
  try {
    globalThis.localStorage?.setItem(KEY, JSON.stringify(messages.slice(-MAX_STORED)));
  } catch {
    // Blocked storage: the chat still works for this page view, it just will not persist.
  }
}

/** The text of a message, joined across its parts. Reasoning and tool parts are ignored. */
function textOf(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

/**
 * Just enough markdown for a chat bubble: **bold** inline, and `- ` lines as a list. Built as
 * React nodes rather than HTML, so model output can never inject markup.
 */
function Rich({ text }: { text: string }) {
  // Runs of consecutive "- " lines become one list; everything else is a paragraph. Grouped by
  // run rather than by blank-line block, because a model will often put a lead-in line and its
  // bullets in the same block.
  const groups: { bullets: boolean; lines: string[] }[] = [];
  let broken = true;
  for (const line of text.split("\n")) {
    // A blank line ends the current group, so paragraphs keep the gap the model intended.
    if (line.trim() === "") {
      broken = true;
      continue;
    }
    const bullets = /^\s*[-*]\s+/.test(line);
    const last = groups[groups.length - 1];
    if (!broken && last && last.bullets === bullets) last.lines.push(line);
    else groups.push({ bullets, lines: [line] });
    broken = false;
  }

  return (
    <>
      {groups.map((group, gi) =>
        group.bullets ? (
          <ul key={gi} className="list-disc space-y-1 ps-4">
            {group.lines.map((line, li) => (
              <li key={li}>
                <Inline text={line.replace(/^\s*[-*]\s+/, "")} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={gi} className="whitespace-pre-wrap">
            <Inline text={group.lines.join("\n")} />
          </p>
        ),
      )}
    </>
  );
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-chalk">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code key={i} className="mono rounded bg-ink-3 px-1 py-0.5 text-[11.5px]">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      })}
    </>
  );
}

export function ChatWidget() {
  const t = useT();
  const [location] = useLocation();
  const allowed = useAssistantAccess();
  const [open, setOpen] = useState(false);
  // Narrow viewports have no room for a column, so there the open panel collapses to a tab on
  // the edge and only slides out over the site while this is set. Deliberately not persisted:
  // a narrow visit should start with the site unobstructed.
  const [sheet, setSheet] = useState(false);
  const [input, setInput] = useState("");
  const initial = useMemo(readStored, []);
  const scroller = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, stop, error, setMessages, clearError } = useChat({
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/agent/messages" }),
  });

  // Restore the open state after mount rather than during render, so the first frame matches
  // what a server render would produce.
  useEffect(() => {
    try {
      setOpen(globalThis.localStorage?.getItem(OPEN_KEY) === "1");
    } catch {
      /* stays closed */
    }
  }, []);

  // Skip the first pass: it runs with the pre-restore `open` (always false) and would write
  // "0" straight over the stored "1" before the restore above has taken effect.
  const restored = useRef(false);
  useEffect(() => {
    if (!restored.current) {
      restored.current = true;
      return;
    }
    try {
      globalThis.localStorage?.setItem(OPEN_KEY, open ? "1" : "0");
    } catch {
      /* not persisted */
    }
  }, [open]);

  useEffect(() => store(messages), [messages]);

  const wide = useMinWidth(DOCK_MIN_WIDTH);
  const hidden = location.startsWith("/admin") || !allowed;
  // Docked: the panel holds a column and the shell lays the site out beside it. Otherwise it is
  // a sheet over the site, and `sheet` says whether it is out or tucked away as a tab.
  const docked = open && wide && !hidden;
  const shown = docked || (open && !wide && sheet);

  useEffect(() => {
    if (shown) box.current?.focus();
  }, [shown]);

  // Follow the tail while a reply streams in — and on the pass that first renders the panel,
  // which is where a transcript restored from storage would otherwise open at its oldest
  // message with no sign that there is anything below it.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const pin = () => {
      el.scrollTop = el.scrollHeight;
    };
    // Once now, and once more after the browser has laid the panel out: as a docked column its
    // height comes from the flex row around it, which is not settled on the pass that mounts
    // it, and pinning a zero-height scroller to its bottom does nothing.
    pin();
    const frame = requestAnimationFrame(pin);
    return () => cancelAnimationFrame(frame);
  }, [messages, status, shown]);

  // Opened from the footer link / account menu, which are rendered far from here. On a narrow
  // viewport that means straight out over the site, not just a tab appearing somewhere.
  useEffect(
    () =>
      onAssistantOpen(() => {
        setOpen(true);
        setSheet(true);
      }),
    [],
  );

  // Escape closes, matching the other overlays in the app. As a sheet it only tucks back into
  // its tab, which is the sheet's own close too — the assistant stays a click away.
  useEffect(() => {
    if (!shown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (docked) setOpen(false);
      else setSheet(false);
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [shown, docked]);

  // Narrowing past the breakpoint takes the column away, so the sheet starts tucked in rather
  // than covering the site the moment it stops fitting beside it.
  useEffect(() => {
    if (wide) setSheet(false);
  }, [wide]);

  // The shell has to know, to give the site the rest of the width and the scrolling.
  useEffect(() => setAssistantDocked(docked), [docked]);
  useEffect(() => () => setAssistantDocked(false), []);

  // The panel takes a column of the page, but the site's own viewport-positioned chrome — the
  // cookie bar — would still run underneath it. Publishing the panel's width lets that chrome
  // end where the panel begins.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--assistant-w", docked ? "380px" : "0px");
    return () => root.style.setProperty("--assistant-w", "0px");
  }, [docked]);

  // The admin console is an internal staff surface; a customer-facing assistant has no place in
  // it, and the panel would cover the tables. Plans that do not include the assistant never get
  // the panel at all — the links that open it are hidden by the same check.
  if (hidden) return null;

  const busy = status === "streaming" || status === "submitted";

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    clearError();
    setInput("");
    void sendMessage({ text });
  };

  const reset = () => {
    setMessages([]);
    clearError();
    store([]);
    box.current?.focus();
  };

  const suggestions: string[] = [
    t("assistant.suggest1"),
    t("assistant.suggest2"),
    t("assistant.suggest3"),
  ];

  // Closed, the widget shows nothing: the footer link is its only handle.
  if (!open) return null;

  // Too narrow for a column and tucked away: all that is left is the tab that brings it back.
  if (!shown) {
    return (
      <button
        type="button"
        onClick={() => setSheet(true)}
        aria-label={ASSISTANT_NAME}
        title={ASSISTANT_NAME}
        className="fixed end-0 top-1/2 z-[63] flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-s-[10px] bg-amber px-2 py-3 text-on-amber shadow-[-4px_0_16px_rgba(0,0,0,0.22)] transition-[filter] hover:brightness-105"
      >
        <MessageSquare className="size-4" />
        <span className="mono text-[10px] font-bold tracking-widest [writing-mode:vertical-rl]">
          AI
        </span>
      </button>
    );
  }

  return (
    <>
      {/* Scrim while the panel is a sheet: it covers the site rather than sitting beside it, so
          a tap outside puts it back in its tab. Docked, the site stays usable and there is
          nothing to dim. */}
      {!docked && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setSheet(false)}
          className="fixed inset-0 z-[64] bg-ink/60"
        />
      )}
      {/* Docked, this is a column of the app's flex row, as tall as the row and scrolling its
          own transcript. As a sheet it is fixed over the site, sliding in from the edge it is
          docked to, full-width on a phone and 380px as soon as there is room for the site to
          show through beside it. */}
      <aside
        aria-label={ASSISTANT_NAME}
        className={
          docked
            ? "flex h-full w-[380px] shrink-0 flex-col border-s border-line bg-ink-2 text-chalk shadow-[-8px_0_28px_rgba(0,0,0,0.28)]"
            : "fixed inset-y-0 end-0 z-[65] flex w-full flex-col border-s border-line bg-ink-2 text-chalk shadow-[-8px_0_28px_rgba(0,0,0,0.28)] motion-safe:animate-[assistant-sheet-in_200ms_ease-out] sm:w-[380px]"
        }
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line px-4 py-3">
          {/* The brand is in the name itself, so the old "GeoCliks" eyebrow above it would only
              have said it twice. */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[15px] font-bold text-chalk">
              {ASSISTANT_NAME}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              aria-label={t("assistant.clear")}
              title={t("assistant.clear")}
              className="rounded-[8px] p-2 text-fog transition-colors hover:bg-ink-3 hover:text-chalk"
            >
              <Trash2 className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => (docked ? setOpen(false) : setSheet(false))}
            aria-label={t("assistant.close")}
            className="rounded-[8px] p-2 text-fog transition-colors hover:bg-ink-3 hover:text-chalk"
          >
            <X className="size-4" />
          </button>
        </header>

        {/* `overscroll-contain`: reaching the end of the transcript stops there instead of
            handing the wheel on to the site behind it. */}
        <div
          ref={scroller}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
        >
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-[13px] leading-relaxed text-fog">{t("assistant.greeting")}</p>
              <div className="flex flex-col items-start gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      clearError();
                      void sendMessage({ text: s });
                    }}
                    className="rounded-[8px] border border-line bg-ink-3/60 px-3 py-2 text-start text-[12.5px] text-chalk transition-colors hover:border-amber hover:text-amber"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => {
            const text = textOf(message);
            if (!text) return null;
            const mine = message.role === "user";
            return (
              <div key={message.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    mine
                      ? "max-w-[85%] rounded-[10px] rounded-ee-[3px] bg-amber px-3 py-2 text-[13px] leading-relaxed text-on-amber"
                      : "max-w-[92%] space-y-2 rounded-[10px] rounded-es-[3px] bg-ink-3 px-3 py-2 text-[13px] leading-relaxed text-fog"
                  }
                >
                  {mine ? <p className="whitespace-pre-wrap">{text}</p> : <Rich text={text} />}
                </div>
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-[10px] rounded-es-[3px] bg-ink-3 px-3 py-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-pulse rounded-full bg-fog"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-[8px] border border-line bg-ink-3/60 px-3 py-2 text-[12.5px] text-fog">
              {t("assistant.error")}
            </p>
          )}
        </div>

        <div className="shrink-0 border-t border-line px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={box}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 132)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={t("assistant.placeholder")}
              aria-label={t("assistant.placeholder")}
              className="max-h-[132px] min-h-[40px] flex-1 resize-none rounded-[8px] border border-line bg-ink px-3 py-2.5 text-[13px] text-chalk outline-none placeholder:text-fog/70 focus:border-amber"
            />
            {busy ? (
              <button
                type="button"
                onClick={() => stop()}
                aria-label={t("assistant.stop")}
                className="rounded-[8px] border border-line bg-ink-3 p-2.5 text-fog transition-colors hover:text-chalk"
              >
                <Square className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={send}
                disabled={!input.trim()}
                aria-label={t("assistant.send")}
                className={`mono rounded-[8px] p-2.5 disabled:cursor-not-allowed disabled:opacity-40 ${amberFill}`}
              >
                <Send className="size-4" />
              </button>
            )}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-fog/70">{t("assistant.disclaimer")}</p>
        </div>
      </aside>
    </>
  );
}
