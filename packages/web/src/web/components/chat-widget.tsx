import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Check, Download, Link2, MessageSquare, Send, Square, Trash2, X } from "lucide-react";
import { useT, type TKey } from "../lib/i18n";
import { amberFill } from "../lib/chrome";
import { authToken } from "../lib/auth";
import { PhotoDrawer } from "./photo-drawer";
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
    // A found photo's thumbnail is a presigned URL with an expiry on it, so a photo part
    // restored tomorrow would render as a row of broken images — and the reply's own text
    // already says what was found. Counts are plain numbers and keep.
    //
    // A report is kept too, but stripped of its link, which is only good for a day. The card
    // then restores in its expired state: the reply says "the download card is right below",
    // so a card that vanished left that sentence pointing at nothing, and the report itself is
    // still on the Reports screen where the expired card sends you.
    const kept = messages.slice(-MAX_STORED).map((m) => ({
      ...m,
      parts: (m.parts ?? []).flatMap((part) => {
        const p = part as { type: string; output?: { report?: ReportFile } };
        if (p.type === "text" || p.type === "tool-summarizeActivity") return [part];
        if (p.type === "tool-exportReport" && p.output?.report) {
          return [{ ...p, output: { report: { ...p.output.report, url: null } } } as typeof part];
        }
        return [];
      }),
    }));
    globalThis.localStorage?.setItem(KEY, JSON.stringify(kept));
  } catch {
    // Blocked storage: the chat still works for this page view, it just will not persist.
  }
}

/**
 * The text of a message, joined across its parts. Reasoning and tool parts are ignored.
 *
 * A reply that calls a tool is written in two goes — a line before the call, the answer after
 * it — and each go is its own text part. Joined edge to edge they ran together mid-sentence
 * ("Let me pull that count now!8 captures so far"), so the parts are separated by a blank line,
 * which the Markdown renderer reads as a paragraph break.
 */
function textOf(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text.trim())
    .filter(Boolean)
    .join("\n\n");
}

/**
 * The chat endpoint, reached with the same credentials as every other API call from here.
 *
 * Both halves matter. The cookie covers the ordinary browser; the bearer covers the cross-site
 * preview iframe and the desktop panel, where the `SameSite=Lax` session cookie is dropped and
 * `lib/auth.ts` keeps the session in a token instead. Without it the panel rendered as signed
 * in — `useAssistantAccess` reads the client session, which the token satisfies — while this
 * endpoint saw an anonymous visitor, so the assistant answered every question about the
 * workspace's own photos with "sign in to the app". Read per request, because the token
 * changes at sign-in and sign-out and the transport outlives both.
 */
const chatTransport = new DefaultChatTransport({
  api: "/api/agent/messages",
  credentials: "include",
  headers: (): Record<string, string> => {
    const token = authToken();
    return {
      // "Tuesday" is this browser's Tuesday. Nothing on the server knows where the caller is,
      // so the day the search bounds comes from here.
      "x-geocliks-tz": Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },
});

/** One capture `findPhotos` returned, as the panel renders it. */
type PhotoHit = {
  id: string;
  code: string;
  kind: string;
  address: string | null;
  note: string | null;
  tag: string;
  capturedAt: string;
  project: string | null;
  takenBy: string | null;
  thumbnail: string;
};

function isPhotoHit(value: unknown): value is PhotoHit {
  const p = value as PhotoHit | null;
  return !!p && typeof p.id === "string" && typeof p.thumbnail === "string";
}

/** The captures a reply found, pulled out of its settled `findPhotos` tool parts. */
function photosOf(message: UIMessage): PhotoHit[] {
  return (message.parts ?? []).flatMap((part) => {
    const p = part as { type: string; state?: string; output?: unknown; preliminary?: boolean };
    if (p.type !== "tool-findPhotos" || p.state !== "output-available" || p.preliminary) return [];
    const found = (p.output as { photos?: unknown })?.photos;
    return Array.isArray(found) ? found.filter(isPhotoHit) : [];
  });
}

/** What `summarizeActivity` counted, as the panel draws it. */
type Activity = {
  total: number;
  cards?: { metric: string; value: number }[];
  chart?: { dimension: string; bars: { label: string; value: number }[]; hidden: number };
  range?: { from: string | null; to: string | null };
  truncated?: boolean;
};

/**
 * The finished package `exportReport` built.
 *
 * `url` is a presigned link good for a day. It comes back null on a card restored from a
 * stored transcript, where the link would have outlived itself — the card is still drawn, in
 * its expired state, so the reply's own "the download is right below" still points at
 * something.
 */
type ReportFile = {
  id: string;
  title: string;
  format: string;
  photoCount: number;
  bytes: number;
  filename: string;
  url: string | null;
};

/**
 * The counts a reply worked out, pulled out of its settled `summarizeActivity` parts.
 *
 * A run that matched nothing comes back as `{ total: 0, note }` with no cards on it. That is
 * for the model to say in words — four zeroes and an empty chart say nothing — so it is
 * dropped here.
 */
function statsOf(message: UIMessage): Activity[] {
  return (message.parts ?? []).flatMap((part) => {
    const p = part as { type: string; state?: string; output?: unknown; preliminary?: boolean };
    if (p.type !== "tool-summarizeActivity" || p.state !== "output-available" || p.preliminary) {
      return [];
    }
    const out = p.output as Activity | null;
    return out && Array.isArray(out.cards) && out.cards.length > 0 ? [out] : [];
  });
}

/**
 * The reports a reply built, pulled out of its settled `exportReport` parts.
 *
 * A refusal — a format the plan does not include — carries `blocked` instead of `report`, and
 * is left to the reply's own words, which can offer the formats the workspace does have.
 */
function reportsOf(message: UIMessage): ReportFile[] {
  return (message.parts ?? []).flatMap((part) => {
    const p = part as { type: string; state?: string; output?: unknown; preliminary?: boolean };
    if (p.type !== "tool-exportReport" || p.state !== "output-available" || p.preliminary) return [];
    const file = (p.output as { report?: ReportFile } | null)?.report;
    return file && typeof file.title === "string" ? [file] : [];
  });
}

/** A report's size, in the units the Reports screen uses. */
function sizeOf(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** When a capture was taken, as short as it can be without losing the day. */
function whenOf(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const sameYear = at.getFullYear() === new Date().getFullYear();
  return at.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** The full address is too long for a card; the street and the town carry it. */
function shortAddress(address: string | null): string | null {
  if (!address) return null;
  const [street, city] = address.split(",").map((s) => s.trim());
  return [street, city].filter(Boolean).join(", ") || address;
}

/**
 * The captures the assistant found, as a grid of thumbnails under its reply.
 *
 * A thumbnail opens the same drawer Teamspace opens — the map, the chain of custody, the
 * evidence exports — instead of navigating to the public `/v/<code>` page. Leaving the app to
 * read your own photo, and losing the transcript that found it, was the wrong trade: the link
 * is for sending to someone else. The drawer loads the photo by id through `photos.get`, which
 * re-checks the org and the caller's scope on the way in, so the id in the reply opens nothing
 * the person could not already open from the feed.
 */
function Photos({ photos, onOpen }: { photos: PhotoHit[]; onOpen: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 pt-1">
      {photos.map((photo) => {
        const place = shortAddress(photo.address);
        return (
          <button
            type="button"
            key={photo.code}
            onClick={() => onOpen(photo.id)}
            className="group overflow-hidden rounded-[8px] border border-line bg-ink-2 text-start transition-colors hover:border-amber"
          >
            <div className="relative">
              <img
                src={photo.thumbnail}
                alt={`${photo.tag} capture${place ? ` at ${place}` : ""}`}
                loading="lazy"
                className="h-[74px] w-full object-cover"
              />
              {photo.kind === "video" && (
                <span className="absolute bottom-1 left-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[9px] text-white">
                  video
                </span>
              )}
            </div>
            <div className="px-2 py-1.5">
              <p className="truncate text-[11px] font-medium text-chalk">
                {whenOf(photo.capturedAt)}
              </p>
              {place && <p className="line-clamp-2 text-[10px] leading-snug text-fog">{place}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/** Card and chart headings are keys, not words: the server does not pick the panel's wording. */
const METRICS: Record<string, TKey> = {
  captures: "assistant.metric.captures",
  places: "assistant.metric.places",
  crew: "assistant.metric.crew",
  days: "assistant.metric.days",
};

const DIMENSIONS: Record<string, TKey> = {
  city: "assistant.by.city",
  day: "assistant.by.day",
  tag: "assistant.by.tag",
  person: "assistant.by.person",
  project: "assistant.by.project",
};

/** The capture types, which are stored as these words and rendered through `tag.*`. */
const TAGS = new Set([
  "arrival",
  "before",
  "work",
  "after",
  "issue",
  "departure",
  "pickup",
  "delivery",
]);

/**
 * What a counts breakdown draws under the reply: four cards and a bar per bucket.
 *
 * Horizontal bars rather than columns, because the panel is 380px wide and the buckets are
 * named things — "Elmwood Drive", "Luc Theriault" — that have nowhere to go under a column.
 * Bars are sized against the largest bucket, not the total, so a chart of one dominant place
 * still shows the small ones as visible slivers instead of hairlines.
 */
function Stats({ stats }: { stats: Activity }) {
  const t = useT();
  const bars = stats.chart?.bars ?? [];
  const peak = Math.max(1, ...bars.map((b) => b.value));
  const dimension = stats.chart?.dimension ?? "city";

  const label = (raw: string) => {
    if (dimension === "day") {
      // "2026-09-11" as a date, read as a plain calendar day rather than an instant, so a
      // browser west of the data does not shift every bar back a day.
      const at = new Date(`${raw}T12:00:00`);
      return Number.isNaN(at.getTime())
        ? raw
        : at.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
    if (dimension === "tag" && TAGS.has(raw)) return t(`tag.${raw}` as TKey);
    return raw;
  };

  return (
    <div className="space-y-3 pt-1">
      <div className="grid grid-cols-2 gap-2">
        {(stats.cards ?? []).map((card) => (
          <div key={card.metric} className="rounded-[8px] border border-line bg-ink-2 px-2.5 py-2">
            <p className="mono text-[17px] font-bold leading-tight text-chalk">
              {card.value.toLocaleString()}
            </p>
            <p className="truncate text-[10.5px] text-fog">
              {METRICS[card.metric] ? t(METRICS[card.metric]!) : card.metric}
            </p>
          </div>
        ))}
      </div>

      {bars.length > 0 && (
        <div className="rounded-[8px] border border-line bg-ink-2 px-2.5 py-2.5">
          <p className="mb-2 text-[10.5px] font-medium uppercase tracking-wide text-fog">
            {DIMENSIONS[dimension] ? t(DIMENSIONS[dimension]!) : dimension}
          </p>
          <div className="space-y-1.5">
            {bars.map((bar) => (
              <div key={bar.label} className="flex items-center gap-2">
                <span className="w-[86px] shrink-0 truncate text-[10.5px] text-fog">
                  {label(bar.label)}
                </span>
                <span className="h-[9px] min-w-0 flex-1 overflow-hidden rounded-full bg-ink-3">
                  <span
                    className="block h-full rounded-full bg-amber"
                    style={{ width: `${Math.max(4, (bar.value / peak) * 100)}%` }}
                  />
                </span>
                <span className="mono w-[26px] shrink-0 text-end text-[10.5px] text-chalk">
                  {bar.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The finished report, as a file card with the download on it.
 *
 * The link is a presigned URL good for a day, so it is never pasted into the reply's text
 * where it would outlive itself in the stored transcript — it lives on this card, and the
 * stored copy of the card drops it. Restored without a link the card keeps its name and size
 * but loses its buttons, and says where the report itself still is.
 */
function ReportCard({ report }: { report: ReportFile }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const url = report.url;

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      globalThis.setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard permission: the download button is still there.
    }
  };

  return (
    <div className="space-y-2 pt-1">
      <div className="rounded-[8px] border border-line bg-ink-2 p-2.5">
        <div className="flex items-start gap-2.5">
          <span
            className={`mono grid size-9 shrink-0 place-items-center rounded-[7px] text-[9.5px] font-bold uppercase ${
              url ? "bg-amber/15 text-amber" : "bg-ink-3 text-fog"
            }`}
          >
            {report.format}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-medium text-chalk">{report.title}</p>
            <p className="truncate text-[10.5px] text-fog">
              {t("assistant.reportMeta", {
                count: report.photoCount,
                size: sizeOf(report.bytes),
              })}
            </p>
          </div>
        </div>
        {url && (
          <div className="mt-2.5 flex items-center gap-2">
            <a
              href={url}
              download={report.filename}
              className={`mono flex flex-1 items-center justify-center gap-1.5 rounded-[7px] px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide ${amberFill}`}
            >
              <Download className="size-3.5" />
              {t("assistant.download")}
            </a>
            <button
              type="button"
              onClick={() => void copy()}
              className="flex items-center justify-center gap-1.5 rounded-[7px] border border-line bg-ink-3 px-2.5 py-1.5 text-[11px] text-fog transition-colors hover:border-amber hover:text-amber"
            >
              {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
              {copied ? t("assistant.copied") : t("assistant.copyLink")}
            </button>
          </div>
        )}
      </div>
      <p className="text-[10px] leading-snug text-fog/70">
        {t(url ? "assistant.linkExpires" : "assistant.linkExpired")}
      </p>
    </div>
  );
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
  /** A capture from a reply, open in the drawer over the panel. */
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
  const initial = useMemo(readStored, []);
  const scroller = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, stop, error, setMessages, clearError } = useChat({
    messages: initial,
    transport: chatTransport,
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
        {/* Same bar as the app's own header, so the panel reads as another column of the app
            rather than a card floating beside it: the same navy, and 69px — the shell's 68px
            row plus its hairline — so the two rules meet in one line across the window.
            `data-theme="dark"` pins the bar's tokens dark whatever theme the workspace is in,
            the way the shell header does. */}
        <header
          data-theme="dark"
          className="flex h-[69px] shrink-0 items-center gap-3 border-b border-line bg-[#0d2137] px-4 text-chalk"
        >
          {/* The brand is in the name itself, so the old "GeoCliks" eyebrow above it would only
              have said it twice. It is split the way the wordmark is: chalk "Geo", amber
              "Cliks". */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[17px] font-bold tracking-tight text-chalk">
              Geo<span className="text-amber">Cliks</span> AI Assistant
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
            const found = photosOf(message);
            const counted = statsOf(message);
            const built = reportsOf(message);
            // A reply is worth a bubble if it has either words or something it produced: the
            // thumbnails, cards and file card all arrive before the sentence about them.
            if (!text && found.length === 0 && counted.length === 0 && built.length === 0) {
              return null;
            }
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
                  {mine ? (
                    <p className="whitespace-pre-wrap">{text}</p>
                  ) : (
                    <>
                      {text && <Rich text={text} />}
                      {counted.map((stats, i) => (
                        <Stats key={i} stats={stats} />
                      ))}
                      {found.length > 0 && <Photos photos={found} onOpen={setOpenPhoto} />}
                      {built.map((report) => (
                        <ReportCard key={report.id} report={report} />
                      ))}
                    </>
                  )}
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
      {/* Over the panel, not under it. The panel sits at z-65 and the drawer at z-50, so the
          drawer needs its own stacking context above it — mounted here as the panel's sibling
          rather than inside it, because the sheet's slide-in animation leaves a transform that
          would otherwise become the containing block for the drawer's fixed overlay. Rendered
          only when a photo is open: its hooks would otherwise fetch the org and the project
          list behind the marketing site, where there is no session to fetch them with. */}
      {openPhoto && (
        <div className="relative z-[70]">
          <PhotoDrawer photoId={openPhoto} onClose={() => setOpenPhoto(null)} />
        </div>
      )}
    </>
  );
}
