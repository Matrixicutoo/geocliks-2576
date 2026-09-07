import { notifyFrom, sendEmail, siteUrl, type SendResult } from "./email";
import { button, escapeHtml, shell } from "./email-templates";

/**
 * The three — and only three — emails a delivery recipient can ever receive for one stop:
 * the route started, they are next, and the proof once it is dropped.
 *
 * The decision about *whether* to send lives in `../lib/route-notify.ts`; this file only
 * renders and sends. Bodies stay English-only, matching every other GeoCliks template.
 */

const FOOTER = "You received this because a business sent a delivery to this address.";

function trackUrl(trackToken: string): string {
  return `${siteUrl()}/t/${encodeURIComponent(trackToken)}`;
}

/** "Jane" from "Jane Doe", so the greeting stays warm without being wrong. */
function firstName(name: string | null): string {
  const first = (name ?? "").trim().split(/\s+/)[0] ?? "";
  return first.length > 1 && first.length < 24 ? first : "";
}

function greeting(name: string | null): string {
  const first = firstName(name);
  return first ? `Hi ${escapeHtml(first)},` : "Hi,";
}

type StopLike = {
  trackToken: string;
  recipientName: string | null;
  recipientEmail: string | null;
  address: string | null;
  addressRaw: string;
  reference: string | null;
};

type RouteLike = { name: string };

function addressOf(stop: StopLike): string {
  return stop.address ?? stop.addressRaw;
}

function referenceLine(stop: StopLike): string {
  return stop.reference
    ? `<p style="margin:10px 0 0;font-size:13px;color:#6b7280">Reference: <strong style="color:#374151">${escapeHtml(stop.reference)}</strong></p>`
    : "";
}

/** 1 of 3 — the run has begun. Sent once, when the driver taps START. */
export function routeStartEmail(params: {
  stop: StopLike;
  route: RouteLike;
  orgName: string;
}): Promise<SendResult> {
  const { stop, orgName } = params;
  const link = trackUrl(stop.trackToken);
  const address = addressOf(stop);
  const html = shell(
    `Your delivery from ${escapeHtml(orgName)} is on its way`,
    `<p style="margin:0 0 12px;font-size:14px;line-height:1.65">${greeting(stop.recipientName)}</p>
     <p style="margin:0;font-size:14px;line-height:1.65">
       <strong>${escapeHtml(orgName)}</strong> has started today's delivery run. Your drop at
       <strong>${escapeHtml(address)}</strong> is on the route.
     </p>
     ${referenceLine(stop)}
     <p style="margin:14px 0 0;font-size:14px;line-height:1.65">
       You'll get one more note when the driver is close, and a photo of the delivery once it's done.
     </p>
     ${button(link, "Track this delivery")}`,
    FOOTER,
  );
  const text = `${orgName} has started today's delivery run. Your delivery to ${address} is on the route.
Track it: ${link}`;
  return sendEmail({
    from: notifyFrom(),
    to: stop.recipientEmail ?? "",
    subject: `Your delivery from ${orgName} is on its way`,
    html,
    text,
  });
}

/** 2 of 3 — the driver is `stopsAway` stops out. Never sent for a stop already closed. */
export function routeNextEmail(params: {
  stop: StopLike;
  route: RouteLike;
  orgName: string;
  stopsAway: number;
}): Promise<SendResult> {
  const { stop, orgName, stopsAway } = params;
  const link = trackUrl(stop.trackToken);
  const address = addressOf(stop);
  const away =
    stopsAway <= 1 ? "You're the next stop." : `You're ${stopsAway} stops away.`;
  const html = shell(
    `You're next — ${escapeHtml(orgName)} is nearly there`,
    `<p style="margin:0 0 12px;font-size:14px;line-height:1.65">${greeting(stop.recipientName)}</p>
     <p style="margin:0;font-size:14px;line-height:1.65">
       The driver from <strong>${escapeHtml(orgName)}</strong> is heading to
       <strong>${escapeHtml(address)}</strong>. ${away}
     </p>
     ${referenceLine(stop)}
     <p style="margin:14px 0 0;font-size:14px;line-height:1.65">
       Traffic and access can shift this, so treat it as a heads-up rather than an exact time.
     </p>
     ${button(link, "See where it stands")}`,
    FOOTER,
  );
  const text = `The driver from ${orgName} is heading to ${address}. ${away}
Track it: ${link}`;
  return sendEmail({
    from: notifyFrom(),
    to: stop.recipientEmail ?? "",
    subject: `You're next — your delivery from ${orgName}`,
    html,
    text,
  });
}

/**
 * 3 of 3 — proof of delivery. This is the one that matters: the photo, the signature if one
 * was taken, the tamper-evident code and the verified timestamp.
 */
export function routeDeliveredEmail(params: {
  stop: StopLike;
  route: RouteLike;
  orgName: string;
  photo: {
    photoCode: string;
    capturedAt: Date;
    url: string | null;
    recipient: string | null;
    integrity: string | null;
    address: string | null;
  } | null;
}): Promise<SendResult> {
  const { stop, orgName, photo } = params;
  const link = trackUrl(stop.trackToken);
  const address = addressOf(stop);
  const stamp = photo
    ? photo.capturedAt.toLocaleString("en-CA", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const photoHtml = photo?.url
    ? `<p style="margin:16px 0 0">
         <img src="${photo.url}" alt="Delivery photo" style="display:block;width:100%;max-width:504px;border-radius:12px;border:1px solid #e5e7eb" />
       </p>`
    : "";
  const sealHtml = photo
    ? `<p style="margin:14px 0 0;font-size:13px;line-height:1.7;color:#374151">
         ${stamp ? `Delivered <strong>${escapeHtml(stamp)}</strong><br />` : ""}
         ${photo.recipient ? `Received by <strong>${escapeHtml(photo.recipient)}</strong><br />` : ""}
         Photo code <strong>${escapeHtml(photo.photoCode)}</strong>${photo.integrity === "verified" ? " · time-verified and sealed" : ""}
       </p>`
    : "";

  const html = shell(
    `Delivered — ${escapeHtml(address)}`,
    `<p style="margin:0 0 12px;font-size:14px;line-height:1.65">${greeting(stop.recipientName)}</p>
     <p style="margin:0;font-size:14px;line-height:1.65">
       <strong>${escapeHtml(orgName)}</strong> completed your delivery to
       <strong>${escapeHtml(address)}</strong>. The photo below was taken at the door and sealed
       with a tamper-evident hash the moment it was captured.
     </p>
     ${referenceLine(stop)}
     ${photoHtml}
     ${sealHtml}
     ${button(link, "View the delivery record")}`,
    FOOTER,
  );
  const text = `${orgName} completed your delivery to ${address}.${stamp ? `\nDelivered ${stamp}.` : ""}${photo ? `\nPhoto code ${photo.photoCode}.` : ""}
View the record: ${link}`;
  return sendEmail({
    from: notifyFrom(),
    to: stop.recipientEmail ?? "",
    subject: `Delivered — ${address}`,
    html,
    text,
  });
}
