/**
 * Handler behind `GET /api/invite/:code/qr.png` — the QR square printed inside the invite email.
 *
 * It is a plain HTTP route rather than an oRPC procedure for two reasons: it returns image bytes,
 * and a mail client fetches it with no session at all, so it cannot sit behind `orgProc`. The
 * in-app QR (team.inviteQr) stays authenticated and returns a data URL; this one is the public
 * twin that an email can point an <img> at.
 *
 * It never touches the database. The square encodes `${WEBSITE_URL}/join/<code>` and nothing more,
 * so guessing codes at this endpoint reveals nothing — not whether the invite exists, not who it
 * was addressed to, not the workspace. The code itself is already printed in the same email.
 */
import QRCode from "qrcode";

/** Invite codes are `random(10)` lowercased — alphanumeric. Anything else is refused outright. */
const CODE = /^[a-z0-9]{4,32}$/i;

function joinUrl(code: string): string {
  const base = (process.env.WEBSITE_URL ?? "http://localhost:4200").replace(/\/+$/, "");
  return `${base}/join/${code}`;
}

/** The QR square for an invite code as PNG bytes. Shared by the public route and the email. */
export function inviteQrPng(code: string): Promise<Buffer> {
  return QRCode.toBuffer(joinUrl(code), {
    type: "png",
    width: 480,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0d2137ff", light: "#ffffffff" },
  });
}

export async function inviteQrImage(rawCode: string): Promise<Response> {
  const code = rawCode.replace(/\.png$/i, "").trim().toLowerCase();
  if (!CODE.test(code)) return new Response("bad code", { status: 400 });

  const png = await inviteQrPng(code);

  return new Response(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      // The square is a pure function of the code, so it is safe to cache hard. Mail clients and
      // their image proxies (Gmail, Outlook) both honour this and fetch it once.
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
