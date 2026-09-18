/**
 * Expo push delivery. Best effort by design: a failed push must never fail the action that
 * triggered it, so every error is swallowed and logged. Tokens that Expo reports as dead are
 * dropped so a stale device stops being retried forever.
 */
import { inArray } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

const ENDPOINT = "https://exp.host/--/api/v2/push/send";
const RECEIPTS_ENDPOINT = "https://exp.host/--/api/v2/push/getReceipts";

/**
 * How long to wait before asking Expo what became of a message. Expo accepts a push, then hands
 * it to FCM or APNs, so the real verdict only exists a few seconds later — and Expo keeps
 * receipts for 24h, so being late costs nothing while being early returns nothing.
 */
const RECEIPT_DELAY_MS = 10_000;

type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

type ExpoTicket = { status?: string; id?: string; message?: string; details?: { error?: string } };
type ExpoReceipt = { status?: string; message?: string; details?: { error?: string } };

/** Forget the devices Expo says are gone. */
async function dropTokens(tokens: string[]) {
  if (tokens.length === 0) return;
  await db.delete(schema.pushTokens).where(inArray(schema.pushTokens.token, tokens));
  console.log("push: dropped", tokens.length, "unregistered token(s)");
}

/**
 * Asks Expo what happened to each accepted message and prunes the phones that are gone.
 *
 * Expo's accept ("ok" in the send response) means only that it queued the message, and an app
 * the user uninstalled is still accepted happily. The refusal arrives here instead, which is
 * why one user had twenty saved tokens for a single phone: every reinstall registered a new
 * one and nothing ever removed the old, so each message fanned out across nineteen dead
 * devices. Runs detached — the send it belongs to has long since returned.
 */
function checkReceipts(ticketIds: string[], tokenById: Map<string, string>) {
  setTimeout(() => {
    void (async () => {
      try {
        const res = await fetch(RECEIPTS_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/json" },
          body: JSON.stringify({ ids: ticketIds }),
        });
        if (!res.ok) {
          console.error("push: receipts returned", res.status);
          return;
        }
        const json = (await res.json()) as { data?: Record<string, ExpoReceipt> };
        const dead: string[] = [];
        for (const [id, receipt] of Object.entries(json.data ?? {})) {
          if (receipt?.status !== "error") continue;
          const token = tokenById.get(id);
          if (receipt.details?.error === "DeviceNotRegistered") {
            if (token) dead.push(token);
            continue;
          }
          console.error(
            "push: undelivered",
            receipt.details?.error ?? "unknown",
            receipt.message ?? "",
            token ? `token ${token.slice(0, 24)}…` : "",
          );
        }
        await dropTokens(dead);
      } catch (error) {
        console.error("push: receipt check failed", error);
      }
    })();
  }, RECEIPT_DELAY_MS).unref?.();
}

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
          // Names the max-importance channel the app creates on Android. Without it a push
          // lands on the OS default channel and arrives silently, with no heads-up banner.
          channelId: "default",
          priority: "high",
        })),
      ),
    });
    if (!res.ok) {
      console.error("push: expo returned", res.status);
      return;
    }
    const json = (await res.json()) as { data?: ExpoTicket[] };
    const dead: string[] = [];
    /** Ticket id → the token it was for, so a receipt can name the phone that failed. */
    const tokenById = new Map<string, string>();
    (json.data ?? []).forEach((ticket, i) => {
      const token = valid[i];
      if (ticket?.status !== "error") {
        if (ticket?.id && token) tokenById.set(ticket.id, token);
        return;
      }
      if (ticket.details?.error === "DeviceNotRegistered") {
        if (token) dead.push(token);
        return;
      }
      /**
       * Every other rejection used to be discarded, which hid a total delivery outage: with no
       * FCM key uploaded to the Expo project, every Android push came back `InvalidCredentials`
       * and the server logged nothing at all. A rejection Expo blames on the developer is a
       * configuration fault, not a dead phone, so it is logged loudly and the token is kept.
       */
      console.error(
        "push: expo rejected a message",
        ticket.details?.error ?? "unknown",
        ticket.message ?? "",
        token ? `token ${token.slice(0, 24)}…` : "",
      );
    });
    await dropTokens(dead);
    if (tokenById.size > 0) checkReceipts([...tokenById.keys()], tokenById);
  } catch (error) {
    console.error("push: send failed", error);
  }
}
