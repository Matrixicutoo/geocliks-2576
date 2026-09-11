import { sendEmail, siteUrl, type SendResult } from "./email";
import { SUPPORT_EMAIL } from "../lib/support";

/**
 * HTML for every transactional message GeoCliks sends. Kept as plain template strings so the
 * markup stays table-free and inline-styled, which is what mail clients render reliably.
 */

const BRAND = "#f5a524";
/** Mobile deep-link scheme (packages/mobile/app.json expo.scheme) — opens Join workspace prefilled. */
const APP_SCHEME = "runable-timemar-nt1ia4s";
const INK = "#0d1117";

/** Project and workspace names are user input, so they are escaped before landing in markup. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function shell(title: string, body: string, footerNote?: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <div style="font-weight:700;font-size:20px;letter-spacing:-0.02em;color:${INK};padding-bottom:20px">
      Geo<span style="color:${BRAND}">Cliks</span>
    </div>
    <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;padding:28px">
      <h1 style="margin:0 0 14px;font-size:19px;line-height:1.35">${title}</h1>
      ${body}
    </div>
    <p style="margin:18px 2px 0;font-size:12px;line-height:1.6;color:#6b7280">
      ${footerNote ?? "You received this because someone used GeoCliks with your email address."}<br />
      Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color:#6b7280">${SUPPORT_EMAIL}</a> ·
      <a href="${siteUrl()}/privacy" style="color:#6b7280">Privacy</a> ·
      <a href="${siteUrl()}/terms" style="color:#6b7280">Terms</a>
    </p>
  </div>
</body></html>`;
}

export function button(href: string, label: string): string {
  return `<p style="margin:22px 0 6px">
    <a href="${href}" style="display:inline-block;background:${BRAND};color:${INK};font-weight:600;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:10px">${label}</a>
  </p>
  <p style="margin:10px 0 0;font-size:12px;line-height:1.6;color:#6b7280">
    Or paste this link into your browser:<br /><span style="color:#374151;word-break:break-all">${href}</span>
  </p>`;
}

/**
 * The invite QR, pointed at the public `/api/invite/:code/qr.png` route. It has to be a hosted
 * image rather than an inline data URL or a CID attachment: Gmail strips data URLs outright, and
 * an attached image turns a one-line invite into a message with a paperclip, which reads as spam.
 *
 * Outlook and most desktop clients hide remote images until the reader allows them, so the square
 * is never the only way in — the button, the pasteable link and the typed code all still work.
 */
export function qrBlock(code: string): string {
  const src = `${siteUrl()}/api/invite/${encodeURIComponent(code)}/qr.png`;
  return `<p style="margin:18px 0 0;font-size:13px;line-height:1.65;color:#374151">
       Reading this on a computer? Point your phone camera at this square:
     </p>
     <p style="margin:10px 0 0">
       <img src="${src}" width="150" height="150" alt="QR code to join — or use the invite code below"
            style="display:block;width:150px;height:150px;border:1px solid #e5e7eb;border-radius:10px" />
     </p>`;
}

const ROLE_COPY: Record<string, string> = {
  admin: "Admin — invites, roles, projects and exports.",
  manager: "Manager — projects, reports and share links.",
  field: "Field — captures photos and sees assigned projects.",
  owner: "Owner — full access to the workspace.",
};

export function inviteEmail(params: {
  to: string;
  workspace: string;
  inviterName: string;
  role: string;
  code: string;
  /** Names of projects already assigned to this invite, so the crew knows what they're joining. */
  projects?: string[];
}) {
  const link = `${siteUrl()}/join/${params.code}`;
  const appLink = `${APP_SCHEME}://join?code=${encodeURIComponent(params.code)}`;
  const roleLine = ROLE_COPY[params.role] ?? params.role;
  const projects = (params.projects ?? []).filter((name) => name.trim().length > 0);
  const projectsHtml = projects.length
    ? `<p style="margin:12px 0 0;font-size:14px;line-height:1.65"><strong>Your project${projects.length === 1 ? "" : "s"}:</strong></p>
     <ul style="margin:6px 0 0;padding-left:20px;font-size:14px;line-height:1.7;color:#374151">
       ${projects.map((name) => `<li>${escapeHtml(name)}</li>`).join("\n       ")}
     </ul>
     <p style="margin:8px 0 0;font-size:12px;line-height:1.6;color:#6b7280">
       These are ready the moment you accept — your photos can go straight into them.
     </p>`
    : "";
  const projectsText = projects.length
    ? `\nProject${projects.length === 1 ? "" : "s"} assigned to you: ${projects.join(", ")}`
    : "";
  const html = shell(
    `${params.inviterName} invited you to ${params.workspace} on GeoCliks`,
    `<p style="margin:0 0 12px;font-size:14px;line-height:1.65">
       GeoCliks is where your crew's job photos land with a verified timestamp, GPS coordinates and a street
       address burned into every shot — proof of arrival, work done and departure.
     </p>
     <p style="margin:0;font-size:14px;line-height:1.65"><strong>Your role:</strong> ${roleLine}</p>
     ${projectsHtml}
     ${button(link, "Accept the invite")}
     <p style="margin:20px 0 0;font-size:14px;line-height:1.65"><strong>Already have the GeoCliks app?</strong></p>
     <p style="margin:6px 0 0;font-size:13px;line-height:1.65;color:#374151">
       <a href="${appLink}" style="color:#0d1117;font-weight:600">Open the app with your code already filled in</a>
       — then tap the arrow to create your account.
     </p>
     ${qrBlock(params.code)}
     <p style="margin:16px 0 0;font-size:12px;color:#6b7280">Invite code: <strong>${params.code.toUpperCase()}</strong></p>`,
    `${params.inviterName} invited ${params.to} to the ${params.workspace} workspace.`,
  );
  const text = `${params.inviterName} invited you to the ${params.workspace} workspace on GeoCliks.
Role: ${roleLine}${projectsText}
Accept: ${link}
Already have the app? Open it prefilled: ${appLink}
Invite code: ${params.code.toUpperCase()}
Scannable QR: ${siteUrl()}/api/invite/${params.code}/qr.png`;
  return sendEmail({
    to: params.to,
    subject: `${params.inviterName} invited you to ${params.workspace} on GeoCliks`,
    html,
    text,
  });
}

export function welcomeEmail(params: { to: string; name?: string | null }): Promise<SendResult> {
  const link = `${siteUrl()}/app`;
  const first = (params.name ?? "").split(" ")[0];
  const html = shell(
    first ? `Welcome to GeoCliks, ${first}` : "Welcome to GeoCliks",
    `<p style="margin:0 0 12px;font-size:14px;line-height:1.65">
       Your workspace is ready. Every photo your crew takes is stamped with a network-verified time,
       GPS coordinates and a street address, then synced to a shared Teamspace you can export as a
       PDF, Excel, ZIP or KMZ closeout package.
     </p>
     <p style="margin:0;font-size:14px;line-height:1.65">Three things worth doing first:</p>
     <ol style="margin:8px 0 0;padding-left:20px;font-size:14px;line-height:1.8;color:#374151">
       <li>Install the app on your phone and take one test photo.</li>
       <li>Create a project for your current job site.</li>
       <li>Invite your crew from the Team screen.</li>
     </ol>
     ${button(link, "Open GeoCliks")}`,
    "You received this because you created a GeoCliks account.",
  );
  const text = `Welcome to GeoCliks${first ? `, ${first}` : ""}.
Your workspace is ready: ${link}`;
  return sendEmail({ to: params.to, subject: "Welcome to GeoCliks", html, text });
}

export function resetPasswordEmail(params: { to: string; url: string }): Promise<SendResult> {
  const html = shell(
    "Reset your GeoCliks password",
    `<p style="margin:0;font-size:14px;line-height:1.65">
       Click below to choose a new password. The link expires in one hour and can be used once.
       If you didn't ask for this, ignore this email — nothing changes.
     </p>
     ${button(params.url, "Choose a new password")}`,
    "You received this because a password reset was requested for this address.",
  );
  const text = `Reset your GeoCliks password: ${params.url}
The link expires in one hour. If you didn't ask for this, ignore this email.`;
  return sendEmail({ to: params.to, subject: "Reset your GeoCliks password", html, text });
}

export function receiptEmail(params: {
  to: string;
  planName: string;
  priceLabel: string;
  workspace: string;
}): Promise<SendResult> {
  const link = `${siteUrl()}/app/billing`;
  const html = shell(
    `Your workspace is on ${params.planName}`,
    `<p style="margin:0 0 12px;font-size:14px;line-height:1.65">
       <strong>${params.workspace}</strong> is now on the <strong>${params.planName}</strong> plan
       (${params.priceLabel}). Stripe emails the itemised card receipt separately.
     </p>
     <p style="margin:0;font-size:14px;line-height:1.65">
       You can change or cancel the plan any time from the billing screen — a cancellation keeps the
       workspace paid until the period you already paid for ends.
     </p>
     ${button(link, "View billing")}`,
    `Sent to the owner of the ${params.workspace} workspace.`,
  );
  const text = `${params.workspace} is now on the ${params.planName} plan (${params.priceLabel}).
Manage billing: ${link}`;
  return sendEmail({
    to: params.to,
    subject: `GeoCliks — ${params.planName} plan active`,
    html,
    text,
  });
}
