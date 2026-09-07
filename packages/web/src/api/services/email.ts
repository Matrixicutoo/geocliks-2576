import { Resend } from "resend";
import { SUPPORT_EMAIL } from "../lib/support";

/**
 * Transactional email for GeoCliks. One place so every message shares the same sender,
 * the same shell, and the same "never crash the caller" behaviour: a failed send is logged
 * and reported back as `{ ok: false }`, it never rolls back the action that triggered it.
 *
 * Sender: set EMAIL_FROM in the root .env once a domain is verified in Resend
 * (e.g. `GeoCliks <invites@geocliks.com>`). Until then Resend only accepts its own
 * `onboarding@resend.dev` sender, which can only deliver to the Resend account owner.
 *
 * Two senders, on purpose. EMAIL_FROM carries mail the user asked for (invites, password
 * resets, receipts) and rides the main domain. EMAIL_NOTIFY_FROM carries mail to delivery
 * recipients, who are strangers to us, and rides a separate sending subdomain so a wave of
 * spam complaints from them cannot poison deliverability for the account owner's own mail.
 */

let client: Resend | null = null;

function resend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

/** True when a Resend key is configured, so callers can surface "email is off" in the UI. */
export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Verified sender, falling back to Resend's shared test sender. */
export function emailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || "GeoCliks <onboarding@resend.dev>";
}

/**
 * Sender for mail to delivery recipients. Falls back to the main sender when the sending
 * subdomain is not configured, so notifications keep working rather than silently failing.
 */
export function notifyFrom(): string {
  return process.env.EMAIL_NOTIFY_FROM?.trim() || emailFrom();
}

/** True while we are still on Resend's test sender — delivery is limited to the account owner. */
export function usingTestSender(): boolean {
  return emailFrom().includes("onboarding@resend.dev");
}

export interface SendResult {
  ok: boolean;
  id?: string;
  reason?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Override the sender. Recipient-facing mail passes `notifyFrom()`. */
  from?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendResult> {
  const api = resend();
  if (!api) {
    console.error("[email] RESEND_API_KEY is not set — skipped:", options.subject);
    return { ok: false, reason: "not_configured" };
  }
  try {
    const { data, error } = await api.emails.send({
      from: options.from ?? emailFrom(),
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo ?? SUPPORT_EMAIL,
    });
    if (error) {
      console.error("[email] send failed:", options.subject, error);
      return { ok: false, reason: error.message };
    }
    return { ok: true, id: data?.id };
  } catch (e) {
    console.error("[email] send threw:", options.subject, e);
    return { ok: false, reason: e instanceof Error ? e.message : "unknown" };
  }
}

/** Public origin of the app, used to build links inside emails. */
export function siteUrl(): string {
  return (process.env.WEBSITE_URL ?? "https://www.geocliks.com").replace(/\/+$/, "");
}
