import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { agent } from "./index";
import { gatewayReady } from "./gateway";

/**
 * The chat bubble is reachable without a session (it sits on the marketing site too), so this
 * endpoint is the one unauthenticated thing in the app that spends money per call. The guards
 * below are the price of that: a short sliding-window limit per client, a cap on how much
 * history one request may carry, and a cap on a single message.
 *
 * The window is in-process, so it resets on deploy and is per-instance. That is fine for
 * casual abuse; a serious flood needs a limit at the edge.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const MAX_MESSAGES = 40;
const MAX_CHARS = 4_000;

const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  // Cheap sweep so the map cannot grow without bound on a long-lived process.
  if (hits.size > 5_000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}

/** Total characters of text across a UI message's parts. */
function textLength(message: UIMessage): number {
  return (message.parts ?? []).reduce(
    (n, part) => n + (part.type === "text" ? part.text.length : 0),
    0,
  );
}

export async function agentMessages(request: Request): Promise<Response> {
  if (!gatewayReady()) {
    return Response.json({ error: "The assistant is not configured." }, { status: 503 });
  }

  const client =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (rateLimited(client)) {
    return Response.json(
      { error: "Too many messages just now. Give it a minute." },
      { status: 429 },
    );
  }

  let messages: UIMessage[];
  try {
    const body = (await request.json()) as { messages?: unknown };
    if (!Array.isArray(body.messages)) throw new Error("messages must be an array");
    messages = body.messages as UIMessage[];
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  if (messages.length === 0 || messages.length > MAX_MESSAGES) {
    return Response.json({ error: "Start a new chat to continue." }, { status: 400 });
  }
  const last = messages[messages.length - 1];
  if (last && textLength(last) > MAX_CHARS) {
    return Response.json({ error: "That message is too long." }, { status: 413 });
  }

  return createAgentUIStreamResponse({ agent, uiMessages: messages });
}
