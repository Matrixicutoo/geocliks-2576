import { Autumn } from "autumn-js";

/**
 * Self-serve billing on the processor side: the Stripe customer portal, the invoice behind the
 * latest payment, and the receipt switch.
 *
 * The portal is where a paying owner cancels, swaps the card, updates the billing name/address and
 * downloads every past invoice. It is Stripe's page, not ours, so cancellation there always lands
 * on the real subscription — the billing webhook then moves the workspace back to Free when the
 * paid period ends.
 */

/** Reads AUTUMN_SECRET_KEY from the root .env automatically. */
const autumnSdk = new Autumn();

/** A one-time portal session URL for this customer, or null when the processor has none. */
export async function openBillingPortal(customerId: string, returnUrl: string): Promise<string | null> {
  try {
    const res = await autumnSdk.billing.openCustomerPortal({ customerId, returnUrl });
    return res?.url ?? null;
  } catch (e) {
    console.error("[autumn] openCustomerPortal failed:", e);
    return null;
  }
}

/**
 * The hosted page of the customer's most recent paid invoice (view + "Download invoice" PDF).
 * Null when there is no paid invoice yet or the lookup fails — the caller must still send its
 * mail without it.
 */
export async function latestInvoiceUrl(customerId: string): Promise<string | null> {
  try {
    const customer = await autumnSdk.customers.get({ customerId, expand: ["invoices"] });
    const invoices = (customer as { invoices?: Array<{ status?: string; createdAt?: number; hostedInvoiceUrl?: string | null }> })
      .invoices ?? [];
    const latest = invoices
      .filter((invoice) => invoice.status === "paid" && invoice.hostedInvoiceUrl)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0];
    return latest?.hostedInvoiceUrl ?? null;
  } catch (e) {
    console.error("[autumn] invoice lookup failed:", e);
    return null;
  }
}

/**
 * Autumn creates customers with `sendEmailReceipts: false`, which means Stripe never mails the
 * card receipt after a payment. New customers are created with it on (api/auth.ts); this switches
 * it on for a customer that already exists. Best effort — a failure must never block checkout.
 */
export async function ensureEmailReceipts(customerId: string): Promise<void> {
  try {
    await autumnSdk.customers.update({ customerId, sendEmailReceipts: true });
  } catch (e) {
    console.error("[autumn] enabling email receipts failed:", e);
  }
}
