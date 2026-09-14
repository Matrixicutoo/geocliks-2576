import { useState } from "react";
import { Copy, Download, Loader2 } from "lucide-react";
import { useInviteQr } from "../queries/team";
import { useOrg } from "../queries/orgs";
import { useLocale } from "../lib/i18n";

/**
 * The scannable form of one invite: the QR, the link under it, and the two ways to get it out of
 * the browser (clipboard, PNG). Shared on purpose — the Team page opens it under a pending invite
 * and the invite form opens it the moment an open invite is created, and a QR that renders
 * differently in those two places is a QR somebody stops trusting.
 *
 * `email` is null for an open invite (handed over in person, first scanner claims it), which only
 * changes the wording of the alt text.
 */
export function InviteQrPanel({
  inviteId,
  code,
  role,
  email,
}: {
  inviteId: string;
  code: string;
  role: string;
  email: string | null;
}) {
  const lang = useLocale();
  const org = useOrg();
  const qr = useInviteQr(inviteId);
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-[12px] border border-line bg-ink p-4">
      {qr.isPending ? (
        <p className="mono flex items-center gap-2 text-[11px] text-fog">
          <Loader2 className="size-3.5 animate-spin" /> {lang.t("team.buildingQr")}
        </p>
      ) : qr.isError ? (
        <p className="mono text-[11px] text-alert">{qr.error.message}</p>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <img
            src={qr.data.dataUrl}
            alt={
              email
                ? lang.t("team.qrAlt", { email })
                : lang.t("team.qrAltOpen", { code })
            }
            className="size-40 bg-white p-1"
          />
          <p className="mono break-all text-center text-[10.5px] text-fog">{qr.data.url}</p>
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(qr.data.url);
                setCopied(true);
              }}
              className="mono flex-1 rounded-[8px] border border-line px-2 py-2 text-[10px] uppercase tracking-widest text-chalk transition-colors hover:border-amber"
            >
              <Copy className="mr-1 inline size-3" /> {lang.t("team.copyLink")}
            </button>
            <a
              href={qr.data.dataUrl}
              download={`geocliks-invite-${code}.png`}
              className="mono flex-1 rounded-[8px] border border-line px-2 py-2 text-center text-[10px] uppercase tracking-widest text-chalk transition-colors hover:border-amber"
            >
              <Download className="mr-1 inline size-3" /> PNG
            </a>
          </div>
          {copied && <p className="mono text-[10.5px] text-verified">{lang.t("team.linkCopied")}</p>}
          {/* One key on purpose: splitting out the highlighted role word would wreck word order
              in 11 languages, so it renders as plain text. */}
          <p className="text-center text-[11px] leading-relaxed text-fog">
            {lang.t("team.scanJoins", {
              org: org.data?.org.name ?? lang.t("team.thisWorkspace"),
              role,
            })}
          </p>
        </div>
      )}
    </div>
  );
}
