import { useCallback, useEffect, useRef, useState } from "react";
import { fetch as expoFetch } from "expo/fetch";
import { authToken } from "./auth";

/**
 * The assistant's chat client, written by hand against `/api/agent/messages`.
 *
 * It used to be Vercel's `useChat` from `@ai-sdk/react`. That package and the `ai` package it
 * pulls in build their streaming on `TransformStream` at module scope, and the Expo runtime
 * installs `ReadableStream` and `TextDecoder` but not `TransformStream` — so importing them
 * threw under Hermes and took the whole app down on launch on a real device, with nothing in
 * the export to hint at it. The wire format underneath is plain SSE, so speaking it directly
 * costs one small file and removes the two heaviest dependencies in the app.
 *
 * Everything used below is present on the Expo runtime and checked to be: `expo/fetch` for a
 * readable body (React Native's own `fetch` has none), `TextDecoder` with `{ stream: true }`,
 * and `AbortController`.
 *
 * The shape below deliberately mirrors the part of `useChat`'s API the sheet was using, so the
 * sheet reads the same as the website's panel.
 */
/** One capture the assistant found, as the sheet renders it. Mirrors `findPhotos`' output. */
export type PhotoHit = {
  code: string;
  kind: string;
  address: string | null;
  note: string | null;
  tag: string;
  capturedAt: string;
  project: string | null;
  takenBy: string | null;
  link: string;
  thumbnail: string;
};

export type ChatPart = { type: "text"; text: string } | { type: "photos"; photos: PhotoHit[] };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  parts: ChatPart[];
};

/** The photos attached to a message, across its parts. */
export function photosOf(message: ChatMessage): PhotoHit[] {
  return (message.parts ?? []).flatMap((p) => (p?.type === "photos" ? p.photos : []));
}

function isPhotoHit(value: unknown): value is PhotoHit {
  const p = value as PhotoHit | null;
  return !!p && typeof p.code === "string" && typeof p.link === "string";
}

/** `submitted` is waiting on the first token; `streaming` is a reply arriving. */
export type ChatStatus = "ready" | "submitted" | "streaming" | "error";

/** The text of a message, joined across its parts. */
export function textOf(message: ChatMessage): string {
  return (message.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p?.type === "text")
    .map((p) => p.text)
    .join("");
}

/**
 * A transcript as it should be written to disk.
 *
 * Thumbnails are presigned URLs with an expiry on them, so a photo part restored days later
 * would render as a row of broken images. The text of the reply already says what was found,
 * and the codes in it still resolve, so the parts are dropped rather than kept stale.
 */
export function forStorage(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((m) => ({ ...m, parts: m.parts.filter((p) => p.type === "text") }));
}

/** True for anything that still looks like a message we wrote, so a stale store degrades to empty. */
export function isChatMessage(value: unknown): value is ChatMessage {
  const m = value as ChatMessage | null;
  return (
    !!m &&
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    Array.isArray(m.parts)
  );
}

const newId = () => `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** One `data:` frame of the UI message stream. Only the text and error types matter here. */
type Frame =
  | { type: "text-delta"; delta?: string }
  | { type: "error"; errorText?: string }
  | { type: string; [key: string]: unknown };

export function useAgentChat(api: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [error, setError] = useState<Error | null>(null);
  const controller = useRef<AbortController | null>(null);
  const live = useRef(true);
  // A mirror of the transcript, so sending can build the request from the current history
  // without reading state inside an updater — which React is free to run more than once.
  const history = useRef<ChatMessage[]>([]);
  history.current = messages;

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      controller.current?.abort();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const stop = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    setStatus("ready");
  }, []);

  const run = useCallback(
    async (history: ChatMessage[]) => {
      const abort = new AbortController();
      controller.current?.abort();
      controller.current = abort;
      setStatus("submitted");

      // The id of the assistant message this run is writing into. Created on the first token
      // rather than up front, so a failed request leaves no empty bubble behind.
      let replyId: string | null = null;

      /** Adds to the reply, creating it on the first thing that arrives for it. */
      const into = (add: (parts: ChatPart[]) => ChatPart[]) => {
        if (!live.current) return;
        setMessages((prev) => {
          if (replyId === null) {
            replyId = newId();
            return [...prev, { id: replyId, role: "assistant", parts: add([]) }];
          }
          return prev.map((m) => (m.id === replyId ? { ...m, parts: add(m.parts) } : m));
        });
      };

      const append = (delta: string) => {
        if (!delta) return;
        // Text accumulates into the last text part, so a reply split either side of a tool
        // call keeps its two paragraphs in the order the model wrote them.
        into((parts) => {
          const last = parts[parts.length - 1];
          if (last?.type === "text") {
            return [...parts.slice(0, -1), { type: "text", text: last.text + delta }];
          }
          return [...parts, { type: "text", text: delta }];
        });
        setStatus("streaming");
      };

      const attach = (photos: PhotoHit[]) => {
        if (photos.length === 0) return;
        into((parts) => [...parts, { type: "photos", photos }]);
      };

      // `tool-output-available` carries only the call id, so the name is remembered from the
      // `tool-input-available` frame that opened it.
      const calls = new Map<string, string>();

      const handle = (raw: string) => {
        const line = raw.trim();
        if (!line.startsWith("data:")) return;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") return;
        let frame: Frame;
        try {
          frame = JSON.parse(payload) as Frame;
        } catch {
          return; // A half-written frame, or a keep-alive. Nothing to show.
        }
        if (frame.type === "text-delta") {
          append(String((frame as { delta?: string }).delta ?? ""));
        } else if (frame.type === "tool-input-available") {
          const f = frame as { toolCallId?: string; toolName?: string };
          if (f.toolCallId && f.toolName) calls.set(f.toolCallId, f.toolName);
        } else if (frame.type === "tool-output-available") {
          const f = frame as { toolCallId?: string; output?: unknown; preliminary?: boolean };
          // A preliminary output is a partial the model may still replace; only the settled
          // one becomes thumbnails.
          if (f.preliminary) return;
          if (f.toolCallId && calls.get(f.toolCallId) === "findPhotos") {
            const found = (f.output as { photos?: unknown })?.photos;
            if (Array.isArray(found)) attach(found.filter(isPhotoHit));
          }
        } else if (frame.type === "error") {
          throw new Error((frame as { errorText?: string }).errorText ?? "stream error");
        }
      };

      try {
        const token = authToken();
        const response = await expoFetch(api, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Signed in, the assistant can look up this workspace's own captures. Signed out it
            // is the same public assistant the marketing site talks to.
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            // Text only: the photo parts are ours, for rendering. The endpoint validates and
            // bills on message text, and the model already saw its own tool results.
            messages: forStorage(history).map((m) => ({
              id: m.id,
              role: m.role,
              parts: m.parts,
            })),
          }),
          signal: abort.signal,
        });

        if (!response.ok) {
          const body = (await response.text().catch(() => "")) || "";
          let message = `The assistant is unavailable (${response.status}).`;
          try {
            const parsed = JSON.parse(body) as { error?: string };
            if (parsed.error) message = parsed.error;
          } catch {
            /* not json: keep the status message */
          }
          throw new Error(message);
        }

        const body = response.body;
        if (body) {
          // Streamed: the words appear as they are written. `expo/fetch` is what makes this
          // possible — React Native's own fetch has no readable body.
          const reader = body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) handle(line);
          }
          if (buffer) handle(buffer);
        } else {
          // No streaming body on this platform: take the whole reply in one lump instead of
          // failing. Slower to appear, but it appears.
          for (const line of (await response.text()).split("\n")) handle(line);
        }

        if (live.current) setStatus("ready");
      } catch (e) {
        // Stopping is not failing: the user asked for it.
        const aborted = (e as Error)?.name === "AbortError" || abort.signal.aborted;
        if (!live.current || aborted) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setStatus("error");
      } finally {
        if (controller.current === abort) controller.current = null;
      }
    },
    [api],
  );

  const sendMessage = useCallback(
    ({ text }: { text: string }) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const mine: ChatMessage = {
        id: newId(),
        role: "user",
        parts: [{ type: "text", text: trimmed }],
      };
      const next = [...history.current, mine];
      history.current = next;
      setMessages(next);
      void run(next);
    },
    [run],
  );

  return { messages, setMessages, sendMessage, status, stop, error, clearError };
}
