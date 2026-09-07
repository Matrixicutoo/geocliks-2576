import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { applyProcessorState } from "./billing-sync";
import { receiptEmail } from "../services/email-templates";

/**
 * Push side of billing sync. Autumn (and Stripe through Autumn) calls this when a subscription is
 * created, renewed, downgraded or cancelled, so a cancellation lands immediately instead of
 * waiting for the next time the owner opens the billing screen.
 *
 * The payload is only used to identify the customer — the plan itself is always re-read from the
 * processor via `applyProcessorState`, so a spoofed or stale body cannot grant anyone a plan.
 */

/** Shared secret, set as BILLING_WEBHOOK_SECRET in the root .env. */
function webhookSecret(): string {
  return (process.env.BILLING_WEBHOOK_SECRET ?? "").trim();
}

/** Constant-time-ish compare so the secret cannot be probed byte by byte. */
function sameSecret(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

type Payload = Record<string, unknown>;

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Autumn nests the customer differently per event shape, so check the known spots. */
function customerIdFrom(body: Payload): string | null {
  const data = (body.data ?? {}) as Payload;
  const customer = (body.customer ?? data.customer ?? {}) as Payload;
  return (
    str(body.customer_id) ??
    str(body.customerId) ??
    str(data.customer_id) ??
    str(data.customerId) ??
    str(customer.id) ??
    str(customer.customer_id) ??
    null
  );
}

export interface WebhookOutcome {
  status: number;
  body: { ok: boolean; reason?: string; plan?: string };
}

export async function handleBillingWebhook(req: Request): Promise<WebhookOutcome> {
  const expected = webhookSecret();
  if (!expected) {
    console.error("[billing-webhook] BILLING_WEBHOOK_SECRET is not set — rejecting delivery");
    return { status: 503, body: { ok: false, reason: "not_configured" } };
  }

  const url = new URL(req.url);
  const given =
    req.headers.get("x-webhook-secret") ??
    req.headers.get("x-autumn-secret") ??
    (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "") ??
    url.searchParams.get("secret") ??
    "";
  if (!sameSecret(given, expected)) {
    return { status: 401, body: { ok: false, reason: "bad_secret" } };
  }

  let body: Payload = {};
  try {
    body = (await req.json()) as Payload;
  } catch {
    return { status: 400, body: { ok: false, reason: "bad_json" } };
  }

  const customerId = customerIdFrom(body);
  if (!customerId) {
    console.error("[billing-webhook] no customer id in payload:", Object.keys(body).join(","));
    // 200 so the processor does not retry a payload we will never understand.
    return { status: 200, body: { ok: false, reason: "no_customer_id" } };
  }

  // One workspace per user, owned by the Autumn customer id (= our user id).
  const [org] = await db
    .select()
    .from(schema.organizations)
    .where(eq(schema.organizations.ownerId, customerId))
    .limit(1);
  if (!org) {
    return { status: 200, body: { ok: false, reason: "no_workspace" } };
  }

  const result = await applyProcessorState({
    orgId: org.id,
    customerId,
    currentPlan: org.plan,
    currentSeats: org.seats,
  });

  // Confirmation mail only when the plan actually changed into a paid plan.
  if (result.synced && result.plan.id !== org.plan && result.plan.id !== "free") {
    const [owner] = await db
      .select({ email: schema.user.email })
      .from(schema.user)
      .where(eq(schema.user.id, org.ownerId))
      .limit(1);
    if (owner?.email) {
      await receiptEmail({
        to: owner.email,
        planName: result.plan.name,
        priceLabel: result.plan.priceLabel,
        workspace: org.name,
      });
    }
  }

  console.error(
    `[billing-webhook] ${str(body.type) ?? str(body.event) ?? "event"} customer=${customerId} org=${org.id} synced=${result.synced} plan=${result.plan.id}${result.reason ? ` reason=${result.reason}` : ""}`,
  );

  return {
    status: 200,
    body: { ok: true, reason: result.reason, plan: result.plan.id },
  };
}
