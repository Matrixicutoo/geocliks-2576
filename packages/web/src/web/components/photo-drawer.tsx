import { useState } from "react";
import { X, ShieldCheck, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { type TKey, useT } from "../lib/i18n";
import { usePhoto, useVerifyPhoto, useRemovePhoto } from "../queries/photos";
import { useOrg } from "../queries/orgs";
import { formatCoords, formatStamp, TAG_LABEL, VerifiedBadge } from "./evidence-card";
import { EvidenceMap } from "./evidence-map";
import { PhotoShareButton } from "./share-menu";

const EVENT_LABEL: Record<string, TKey> = {
  captured: "event.captured",
  verified: "event.verified",
  reverified: "event.reverified",
  edited: "event.edited",
  moved: "event.moved",
  exported: "event.exported",
  shared: "event.shared",
  viewed: "event.viewed",
};

type ChainEvent = { id: string; type: string; at: Date; detail: string | null };

/**
 * Every public /v/<code> load appends a "viewed" row, so a link a customer keeps open or refreshes
 * can bury the real custody steps under dozens of identical lines. Consecutive views collapse into
 * one row carrying the count and the first/last time; nothing is hidden or deleted, and any other
 * event type still breaks the run so the order of the chain stays truthful.
 */
function collapseViews<T extends ChainEvent>(events: T[]) {
  const rows: { event: T; count: number; last: Date }[] = [];
  for (const event of events) {
    const prev = rows[rows.length - 1];
    if (event.type === "viewed" && prev && prev.event.type === "viewed") {
      prev.count += 1;
      prev.last = event.at;
      continue;
    }
    rows.push({ event, count: 1, last: event.at });
  }
  return rows;
}

export function PhotoDrawer({ photoId, onClose }: { photoId: string | null; onClose: () => void }) {
  const t = useT();
  const photo = usePhoto(photoId);
  const verify = useVerifyPhoto();
  const remove = useRemovePhoto();
  const org = useOrg();
  const [confirmDelete, setConfirmDelete] = useState(false);
  /** Field crews capture evidence; only manager and above can remove it. */
  const canDelete = org.data?.role !== "field";

  if (!photoId) return null;

  const data = photo.data;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/80 backdrop-blur-sm">
      <button type="button" aria-label={t("common.close")} className="flex-1 cursor-default" onClick={onClose} />
      <div className="h-full w-full max-w-[560px] overflow-y-auto border-l border-line bg-ink-2">
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-ink-2 px-5 py-3">
          <p className="mono text-[11px] uppercase tracking-widest text-amber">
            {data?.photoCode ?? t("common.loading")}
          </p>
          <button type="button" onClick={onClose} className="text-fog hover:text-chalk">
            <X className="size-4" />
          </button>
        </div>

        {photo.isLoading || !data ? (
          <div className="space-y-4 p-5">
            <div className="aspect-[4/3] animate-pulse bg-ink-3" />
            <div className="h-4 w-2/3 animate-pulse bg-ink-3" />
            <div className="h-24 animate-pulse bg-ink-3" />
          </div>
        ) : (
          <div className="space-y-5 p-5">
            <div className="relative rounded-[12px] border border-line">
              {data.kind === "video" ? (
                <video
                  src={data.url}
                  poster={data.posterUrl ?? undefined}
                  controls
                  playsInline
                  aria-label={t("photo.clip", { code: data.photoCode })}
                  className="w-full bg-black"
                >
                  <track kind="captions" />
                </video>
              ) : (
                <img src={data.url} alt={data.note ?? ""} className="w-full object-cover" />
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-stretch bg-black/72">
                <div className="w-[3px] bg-amber" />
                <div className="px-3 py-2">
                  <p className="mono text-[12px] font-semibold text-white">
                    {formatStamp(data.capturedAt)}
                  </p>
                  <p className="mono text-[10px] text-white/85">
                    {formatCoords(data.lat, data.lng)}
                  </p>
                  <p className="mono text-[10px] text-white/70">{data.address ?? t("project.noAddress")}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <VerifiedBadge integrity={data.integrity} />
              <span className="mono rounded-[8px] border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-fog">
                {TAG_LABEL[data.tag] ? t(TAG_LABEL[data.tag]) : data.tag}
              </span>
              {data.project && (
                <span className="mono rounded-[8px] border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-fog">
                  {data.project.name}
                </span>
              )}
            </div>

            {data.note && <p className="text-sm leading-relaxed text-chalk">{data.note}</p>}

            <div>
              <p className="label">{t("evidence.verificationRecord")}</p>
              <dl className="mono mt-2 grid grid-cols-[130px_1fr] gap-y-1.5 rounded-[12px] border border-line bg-ink p-3 text-[11px]">
                {[
                  [t("evidence.photoCode"), data.photoCode],
                  [t("photo.deviceTime"), formatStamp(data.capturedAt)],
                  [t("photo.networkTime"), formatStamp(data.verifiedAt)],
                  [t("photo.timeSource"), data.timeSource],
                  [t("photo.clockSkew"), `${Math.round(data.clockSkewMs / 1000)}s`],
                  [t("evidence.coords"), formatCoords(data.lat, data.lng)],
                  [
                    t("photo.accuracy"),
                    data.accuracyM != null ? `±${Math.round(data.accuracyM)} m` : "—",
                  ],
                  [t("evidence.address"), data.address ?? "—"],
                  [t("evidence.author"), data.author?.name ?? data.author?.email ?? "—"],
                  [t("photo.device"), data.deviceModel ?? "—"],
                  [
                    t("photo.contentHash"),
                    data.contentHash ? `${data.contentHash.slice(0, 24)}…` : "—",
                  ],
                  [t("photo.signature"), data.signature ? `${data.signature.slice(0, 24)}…` : "—"],
                  ...(data.recipient
                    ? ([[t("evidence.recipient"), data.recipient]] as [string, string][])
                    : ([] as [string, string][])),
                ].map(([term, value]) => (
                  <div key={term} className="col-span-2 grid grid-cols-[130px_1fr] gap-2">
                    <dt className="uppercase tracking-widest text-fog">{term}</dt>
                    <dd className="truncate text-chalk">{String(value)}</dd>
                  </div>
                ))}
              </dl>
              {data.signaturePath ? (
                <div className="mt-2 rounded-[12px] border border-line bg-ink p-3">
                  <p className="mono text-[10px] uppercase tracking-widest text-fog">
                    {t("evidence.signature")}
                  </p>
                  <svg
                    viewBox={data.signatureBox ?? "0 0 320 150"}
                    className="mt-2 h-[110px] w-full text-chalk"
                    aria-label={t("evidence.signature")}
                  >
                    <title>{t("evidence.signature")}</title>
                    <path
                      d={data.signaturePath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : null}
              {data.lat != null && data.lng != null ? (
                <>
                  <EvidenceMap
                    pins={[
                      {
                        id: data.id,
                        lat: data.lat,
                        lng: data.lng,
                        photoCode: data.photoCode,
                        address: data.address,
                        capturedAt: data.capturedAt,
                      },
                    ]}
                    showRoute={false}
                    className="mt-2 h-[220px]"
                  />
                  <p className="mono mt-1.5 text-[10px] uppercase tracking-widest text-fog">
                    {t("photo.captureLocation")} · {formatCoords(data.lat, data.lng)}
                  </p>
                </>
              ) : (
                <p className="mono mt-2 rounded-[8px] border border-line bg-ink px-3 py-2 text-[10.5px] uppercase tracking-widest text-fog">
                  {t("photo.noGps")}
                </p>
              )}
            </div>

            <div>
              <p className="label">{t("evidence.chainOfCustody")}</p>
              <ol className="mt-2 space-y-2 border-l border-line pl-4">
                {collapseViews(data.events).map(({ event, count, last }) => (
                  <li key={event.id} className="relative">
                    <span className="absolute -left-[21px] top-1.5 size-2 bg-amber" />
                    <p className="text-[13px] text-chalk">
                      {count > 1
                        ? t("event.viewedTimes", { n: count })
                        : EVENT_LABEL[event.type]
                          ? t(EVENT_LABEL[event.type])
                          : event.type}
                    </p>
                    <p className="mono text-[10.5px] text-fog">
                      {count > 1
                        ? `${formatStamp(event.at)} - ${formatStamp(last)}`
                        : `${formatStamp(event.at)}${event.detail ? ` · ${event.detail}` : ""}`}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              <PhotoShareButton photoId={data.id} code={data.photoCode} align="left" />
              <button
                type="button"
                disabled={verify.isPending}
                onClick={() => verify.mutate({ id: data.id })}
                className="mono flex items-center gap-2 rounded-[8px] border border-line px-3 py-2 text-[10.5px] uppercase tracking-widest text-chalk transition-colors hover:border-verified/60 disabled:opacity-60"
              >
                {verify.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                {t("evidence.reverify")}
              </button>
              {/* Deleting evidence is irreversible, so the button arms a confirm step first. */}
              {canDelete &&
                (confirmDelete ? (
                <>
                  <button
                    type="button"
                    disabled={remove.isPending}
                    onClick={() => {
                      remove.mutate({ id: data.id });
                      onClose();
                    }}
                    className="rounded-[8px] mono flex items-center gap-2 border border-alert/60 bg-alert/10 px-3 py-2 text-[10.5px] uppercase tracking-widest text-alert transition-colors hover:bg-alert/20 disabled:opacity-60"
                  >
                    {remove.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    {t("common.confirm")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="mono rounded-[8px] border border-line px-3 py-2 text-[10.5px] uppercase tracking-widest text-fog transition-colors hover:text-chalk"
                  >
                    {t("common.cancel")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="mono flex items-center gap-2 rounded-[8px] border border-line px-3 py-2 text-[10.5px] uppercase tracking-widest text-fog transition-colors hover:border-alert/60 hover:text-alert"
                >
                    <Trash2 className="size-3.5" /> {t("common.delete")}
                  </button>
                ))}
            </div>

            {canDelete && confirmDelete && (
              <p className="rounded-[8px] mono border border-alert/40 bg-alert/10 px-3 py-2 text-[11px] text-alert">
                {t("photo.deleteConfirm")} {t("photo.deleteHint")}
              </p>
            )}

            {verify.data && (
              <p className="rounded-[8px] mono flex items-center gap-2 border border-verified/40 bg-verified/10 px-3 py-2 text-[11px] text-verified">
                <ShieldCheck className="size-3.5" />
                {verify.data.integrity === "verified"
                  ? t("photo.sealIntact")
                  : t("photo.sealBroken")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
