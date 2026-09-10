import { useEffect, useMemo, useRef, useState } from "react";
import { useSearch } from "wouter";
import {
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Megaphone,
  MessageSquare,
  Play,
  Plus,
  Send,
  Smile,
  X,
} from "lucide-react";
import { DashboardShell } from "../components/dashboard-shell";
import { EmptyState } from "../components/empty-state";
import { orpc } from "../lib/api";
import { useOrg } from "../queries/orgs";
import { useProjects } from "../queries/projects";
import {
  useBroadcastMessage,
  useContacts,
  useConversations,
  useMarkRead,
  useOpenConversation,
  useRecentCaptures,
  useSendMessage,
  useThread,
} from "../queries/messages";
import { cn } from "../lib/utils";
import { useT } from "../lib/i18n";
import { canManageWorkspace } from "../lib/roles";

/** Field-first emoji set: the ones a crew actually uses, then the usual faces. */
const EMOJI = [
  "👍",
  "👌",
  "🙏",
  "💪",
  "✅",
  "❌",
  "⚠️",
  "🔥",
  "🚧",
  "🦺",
  "🧰",
  "🔧",
  "🔨",
  "🪜",
  "🏗️",
  "🚚",
  "📷",
  "📍",
  "📅",
  "⏰",
  "☀️",
  "🌧️",
  "❄️",
  "💨",
  "😀",
  "😄",
  "😅",
  "😂",
  "🙂",
  "😉",
  "😎",
  "🤔",
  "😐",
  "😕",
  "😢",
  "😡",
  "🎉",
  "👏",
  "🙌",
  "🤝",
  "👋",
  "💯",
  "⭐",
  "❤️",
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

export default function AppMessages() {
  const t = useT();
  const org = useOrg();
  const canBroadcast = canManageWorkspace(org.data?.role);
  const conversations = useConversations();
  const contacts = useContacts();
  const projects = useProjects();
  const captures = useRecentCaptures();
  const send = useSendMessage();
  const broadcast = useBroadcastMessage();
  const open = useOpenConversation();
  const markRead = useMarkRead();

  // The Team page links here as /app/messages?c=<conversationId> to open one person's thread.
  const requested = new URLSearchParams(useSearch()).get("c");
  const appliedRequested = useRef(false);
  const [active, setActive] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [body, setBody] = useState("");
  const [projectId, setProjectId] = useState("");
  const [photoId, setPhotoId] = useState("");
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [broadcastBody, setBroadcastBody] = useState("");
  const [broadcastNote, setBroadcastNote] = useState<string | null>(null);
  const [emoji, setEmoji] = useState(false);
  const [viewer, setViewer] = useState<{ url: string; video: boolean; caption: string } | null>(
    null,
  );

  const thread = useThread(active);
  const scroller = useRef<HTMLDivElement | null>(null);
  const list = useMemo(() => conversations.data ?? [], [conversations.data]);
  const firstId = list[0]?.id ?? null;
  const threadCount = thread.data?.items.length ?? 0;

  // First load lands on the newest thread so the page is never an empty right-hand pane, unless
  // a ?c= link asked for a specific one. That link is honoured once, so a later poll never yanks
  // the user out of a thread they clicked themselves.
  useEffect(() => {
    if (requested && !appliedRequested.current) {
      appliedRequested.current = true;
      setActive(requested);
      return;
    }
    setActive((current) => current ?? firstId);
  }, [firstId, requested]);

  // Opening a thread clears its badge, and every poll that brings new mail clears it again.
  // The mutation object is recreated on every render, so it is held in a ref instead of a dep.
  const markReadRef = useRef(markRead.mutate);
  markReadRef.current = markRead.mutate;
  useEffect(() => {
    if (active && threadCount >= 0) markReadRef.current({ conversationId: active });
  }, [active, threadCount]);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [threadCount, active]);

  useEffect(() => {
    if (!viewer) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setViewer(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer]);

  const contactList = useMemo(() => contacts.data ?? [], [contacts.data]);

  async function attachImage(file: File) {
    setUploading(true);
    setError(null);
    try {
      const presign = await orpc.upload.presignMessageImage.call({
        filename: file.name,
        contentType: file.type || "image/jpeg",
      });
      const res = await fetch(presign.url, {
        method: "PUT",
        body: file,
        headers: { "content-type": file.type || "image/jpeg" },
      });
      if (!res.ok) throw new Error("Upload failed");
      setImageKey(presign.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!active) return;
    if (!body.trim() && !imageKey && !photoId) return;
    setError(null);
    try {
      await send.mutateAsync({
        conversationId: active,
        body,
        projectId: projectId || null,
        photoId: photoId || null,
        imageKey,
      });
      setBody("");
      setProjectId("");
      setPhotoId("");
      setImageKey(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("msg.failed"));
    }
  }

  const actions = canBroadcast ? (
    <button
      type="button"
      onClick={() => {
        setBroadcasting((v) => !v);
        setBroadcastNote(null);
      }}
      className="flex items-center gap-2 rounded-[12px] border border-line px-3 py-2 text-[13px] font-medium text-chalk hover:border-amber"
    >
      <Megaphone className="size-4 text-amber" /> {t("msg.broadcast")}
    </button>
  ) : null;

  return (
    <DashboardShell title={t("msg.title")} subtitle={t("msg.subtitle")} actions={actions}>
      {broadcasting && canBroadcast ? (
        <div className="rounded-[12px] overflow-hidden mb-6 border border-amber/40 bg-ink-2">
          <div className="border-b border-line px-4 py-3">
            <p className="font-display text-[15px] font-semibold">{t("msg.broadcast")}</p>
          </div>
          <div className="space-y-3 p-4">
            <textarea
              aria-label={t("msg.broadcast")}
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              placeholder={t("msg.broadcastPlaceholder")}
              rows={3}
              className="w-full rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!broadcastBody.trim() || broadcast.isPending}
                onClick={async () => {
                  try {
                    const out = await broadcast.mutateAsync({ body: broadcastBody });
                    setBroadcastBody("");
                    setBroadcastNote(t("msg.broadcastSent").replace("{n}", String(out.sent)));
                  } catch (err) {
                    setBroadcastNote(err instanceof Error ? err.message : t("msg.failed"));
                  }
                }}
                className="rounded-[8px] flex items-center gap-2 bg-amber px-4 py-2 text-[13px] font-semibold text-on-amber disabled:opacity-50"
              >
                {broadcast.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {t("msg.broadcastSend")}
              </button>
              {broadcastNote && <span className="text-[13px] text-fog">{broadcastNote}</span>}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Conversation list */}
        <div className="h-fit rounded-[12px] border border-line bg-ink-2">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-[15px] font-semibold">{t("msg.title")}</p>
            <button
              type="button"
              aria-label={t("msg.new")}
              onClick={() => setPicking((v) => !v)}
              className="flex items-center gap-1.5 rounded-[12px] border border-line px-2 py-1 text-[12px] text-fog hover:border-amber hover:text-chalk"
            >
              <Plus className="size-3.5" /> {t("msg.new")}
            </button>
          </div>

          {picking ? (
            <div className="max-h-72 overflow-y-auto border-b border-line">
              {contactList.length === 0 ? (
                <p className="px-4 py-3 text-[13px] text-fog">{t("msg.noPeople")}</p>
              ) : (
                contactList.map((person) => (
                  <button
                    key={person.userId}
                    type="button"
                    onClick={async () => {
                      const out = await open.mutateAsync({ userId: person.userId });
                      setActive(out.id);
                      setPicking(false);
                    }}
                    className="rounded-[8px] flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-ink-3"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-ink-3 text-[11px] font-semibold text-fog">
                      {initials(person.name ?? "?")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-chalk">
                        {person.name}
                      </span>
                      <span className="block truncate text-[11px] uppercase tracking-wide text-fog">
                        {person.role}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : null}

          {conversations.isLoading ? (
            <div className="space-y-2 p-4">
              <div className="h-12 animate-pulse bg-ink-3" />
              <div className="h-12 animate-pulse bg-ink-3" />
            </div>
          ) : list.length === 0 ? (
            <div className="p-4">
              <p className="text-[13px] font-medium text-chalk">{t("msg.none")}</p>
              <p className="mt-1 text-[12px] text-fog">{t("msg.noneHint")}</p>
            </div>
          ) : (
            <div className="max-h-[560px] overflow-y-auto">
              {list.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setActive(row.id)}
                  className={cn(
                    "flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition-colors",
                    active === row.id
                      ? "border-amber bg-ink-3"
                      : "border-transparent hover:bg-ink-3/60",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-ink-3 text-[11px] font-semibold text-fog">
                    {initials(row.other.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold text-chalk">
                        {row.other.name}
                      </span>
                      {row.unread > 0 && (
                        <span className="rounded-[6px] shrink-0 bg-amber px-1.5 text-[11px] font-bold text-on-amber">
                          {row.unread}
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[12px] text-fog">
                      {row.lastMessagePreview || t("msg.empty")}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thread */}
        <div className="flex h-[calc(100vh-125px)] max-h-[860px] min-h-[420px] flex-col rounded-[12px] border border-line bg-ink-2">
          {!active ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <EmptyState icon={MessageSquare} title={t("msg.select")} hint={t("msg.noneHint")} />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                <span className="flex size-9 items-center justify-center rounded-[8px] bg-ink-3 text-[11px] font-semibold text-fog">
                  {initials(thread.data?.other.name ?? "?")}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-[15px] font-semibold">
                    {thread.data?.other.name ?? "—"}
                  </p>
                  <p className="truncate text-[12px] text-fog">{thread.data?.other.email ?? ""}</p>
                </div>
              </div>

              <div ref={scroller} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                {(thread.data?.items ?? []).length === 0 ? (
                  <p className="text-[13px] text-fog">{t("msg.empty")}</p>
                ) : (
                  (thread.data?.items ?? []).map((item) => {
                    const photo = item.photo;
                    const chatImage = item.imageUrl;
                    const isVideo = photo?.kind === "video";
                    // photo.url is the still preview; mediaUrl is the real file (video included).
                    const photoFull = photo ? (photo.mediaUrl ?? photo.url) : null;
                    return (
                      <div
                        key={item.id}
                        className={cn("flex", item.mine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "rounded-[12px] max-w-[78%] border px-3 py-2",
                            item.mine ? "border-amber/40 bg-ink-3" : "border-line bg-ink",
                          )}
                        >
                          {item.project && (
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-amber">
                              {item.project.name}
                            </p>
                          )}
                          {photo?.url && photoFull && (
                            <button
                              type="button"
                              aria-label={t("msg.openMedia")}
                              title={t("msg.openMedia")}
                              onClick={() =>
                                setViewer({ url: photoFull, video: isVideo, caption: photo.code })
                              }
                              className="group relative mb-2 block w-full cursor-zoom-in overflow-hidden rounded-[8px]"
                            >
                              <img
                                src={photo.url}
                                alt={photo.code}
                                className="max-h-56 w-full object-cover"
                              />
                              <span className="absolute inset-0 flex items-center justify-center transition-colors group-hover:bg-ink/30">
                                {isVideo ? (
                                  <Play className="size-10 text-chalk drop-shadow-lg" />
                                ) : (
                                  <Maximize2 className="size-6 text-chalk opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100" />
                                )}
                              </span>
                            </button>
                          )}
                          {photo && (
                            <p className="mb-1 font-mono text-[11px] text-verified">{photo.code}</p>
                          )}
                          {chatImage && (
                            <button
                              type="button"
                              aria-label={t("msg.openMedia")}
                              title={t("msg.openMedia")}
                              onClick={() =>
                                setViewer({ url: chatImage, video: false, caption: "" })
                              }
                              className="group relative mb-2 block w-full cursor-zoom-in overflow-hidden rounded-[8px]"
                            >
                              <img
                                src={chatImage}
                                alt=""
                                className="max-h-56 w-full object-cover"
                              />
                              <span className="absolute inset-0 flex items-center justify-center transition-colors group-hover:bg-ink/30">
                                <Maximize2 className="size-6 text-chalk opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100" />
                              </span>
                            </button>
                          )}
                          {item.body && (
                            <p className="whitespace-pre-wrap text-[13px] text-chalk">
                              {item.body}
                            </p>
                          )}
                          <p className="mt-1 text-[11px] text-fog">{stamp(item.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-line p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <select
                    aria-label={t("msg.attachProject")}
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="rounded-[12px] border border-line bg-ink px-2 py-1.5 text-[12px] text-chalk outline-none focus:border-amber"
                  >
                    <option value="">{t("msg.attachProject")}</option>
                    {(projects.data ?? []).map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label={t("msg.attachCapture")}
                    value={photoId}
                    onChange={(e) => setPhotoId(e.target.value)}
                    className="rounded-[12px] border border-line bg-ink px-2 py-1.5 text-[12px] text-chalk outline-none focus:border-amber"
                  >
                    <option value="">{t("msg.attachCapture")}</option>
                    {(captures.data ?? []).map((capture) => (
                      <option key={capture.id} value={capture.id}>
                        {capture.code}
                      </option>
                    ))}
                  </select>

                  <label className="flex cursor-pointer items-center gap-1.5 rounded-[12px] border border-line px-2 py-1.5 text-[12px] text-fog hover:border-amber hover:text-chalk">
                    {uploading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <ImageIcon className="size-3.5" />
                    )}
                    {imageKey ? t("common.photo") : t("msg.attachImage")}
                    <input
                      aria-label={t("msg.attachImage")}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void attachImage(file);
                      }}
                    />
                  </label>

                  {imageKey && (
                    <button
                      type="button"
                      aria-label={t("msg.clearRef")}
                      onClick={() => setImageKey(null)}
                      className="flex items-center gap-1 rounded-[12px] border border-line px-2 py-1.5 text-[12px] text-fog hover:border-alert hover:text-alert"
                    >
                      <X className="size-3.5" /> {t("msg.clearRef")}
                    </button>
                  )}

                  <div className="relative">
                    <button
                      type="button"
                      aria-label={t("msg.emoji")}
                      title={t("msg.emoji")}
                      onClick={() => setEmoji((v) => !v)}
                      className={cn(
                        "rounded-[6px] flex items-center gap-1.5 border px-2 py-1.5 text-[12px]",
                        emoji
                          ? "border-amber text-amber"
                          : "border-line text-fog hover:border-amber hover:text-chalk",
                      )}
                    >
                      <Smile className="size-3.5" />
                    </button>
                    {emoji && (
                      <div className="absolute right-0 bottom-full z-20 mb-2 grid w-[272px] grid-cols-8 gap-1 rounded-[12px] border border-line bg-ink-2 p-2 shadow-xl">
                        {EMOJI.map((glyph) => (
                          <button
                            key={glyph}
                            type="button"
                            aria-label={glyph}
                            onClick={() => {
                              setBody((current) => current + glyph);
                              setEmoji(false);
                            }}
                            className="flex size-7 items-center justify-center text-[17px] leading-none hover:bg-ink-3"
                          >
                            {glyph}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <textarea
                    aria-label={t("msg.placeholder")}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void submit();
                      }
                    }}
                    rows={2}
                    placeholder={t("msg.placeholder")}
                    className="flex-1 resize-none rounded-[12px] border border-line bg-ink px-3 py-2 text-sm text-chalk outline-none focus:border-amber"
                  />
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={send.isPending || uploading}
                    className="rounded-[8px] flex items-center gap-2 bg-amber px-4 py-2.5 text-[13px] font-semibold text-on-amber disabled:opacity-50"
                  >
                    {send.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    {t("msg.send")}
                  </button>
                </div>
                {uploading && <p className="mt-2 text-[12px] text-fog">{t("msg.uploading")}</p>}
                {error && <p className="mt-2 text-[12px] text-alert">{error}</p>}
              </div>
            </>
          )}
        </div>
      </div>
      {viewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={t("msg.closeViewer")}
            onClick={() => setViewer(null)}
            className="absolute inset-0 cursor-zoom-out bg-ink/90"
          />
          <div className="relative z-10 w-full max-w-4xl">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-mono text-[12px] text-verified">{viewer.caption}</p>
              <button
                type="button"
                aria-label={t("msg.closeViewer")}
                title={t("msg.closeViewer")}
                onClick={() => setViewer(null)}
                className="flex size-8 items-center justify-center rounded-[12px] border border-line text-fog hover:border-amber hover:text-chalk"
              >
                <X className="size-4" />
              </button>
            </div>
            {viewer.video ? (
              // biome-ignore lint/a11y/useMediaCaption: field capture, no caption track exists
              <video
                src={viewer.url}
                controls
                autoPlay
                aria-label={viewer.caption || "capture"}
                className="max-h-[80vh] w-full bg-black"
              >
                <track kind="captions" />
              </video>
            ) : (
              <img
                src={viewer.url}
                alt={viewer.caption}
                className="max-h-[80vh] w-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
