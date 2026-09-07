/**
 * Expo push delivery. Best effort by design: a failed push must never fail the action that
 * triggered it, so every error is swallowed and logged. Tokens that Expo reports as dead are
 * dropped so a stale device stops being retried forever.
 */
import { inArray } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

const ENDPOINT = "https://exp.host/--/api/v2/push/send";

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

type ExpoTicket = { status?: string; details?: { error?: string } };

export async function sendPush(tokens: string[], payload: PushPayload): Promise<void> {
  const valid = [...new Set(tokens.filter((t) => t.startsWith("Expo")))];
  if (valid.length === 0) return;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(
        valid.map((to) => ({
          to,
          title: payload.title,
          body: payload.body,
          data: payload.data ?? {},
          sound: "default",
        })),
      ),
    });
    if (!res.ok) {
      console.error("push: expo returned", res.status);
      return;
    }
    const json = (await res.json()) as { data?: ExpoTicket[] };
    const dead: string[] = [];
    (json.data ?? []).forEach((ticket, i) => {
      if (ticket?.status === "error" && ticket.details?.error === "DeviceNotRegistered") {
        const token = valid[i];
        if (token) dead.push(token);
      }
    });
    if (dead.length > 0) {
      await db.delete(schema.pushTokens).where(inArray(schema.pushTokens.token, dead));
    }
  } catch (error) {
    console.error("push: send failed", error);
  }
}
