import { useState } from "react";
import { Link, useParams } from "wouter";
import { Download, Eye, Loader2, Share2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Logo } from "../components/logo";
import {
  EvidenceCard,
  EvidenceSkeleton,
  formatCoords,
  formatStamp,
  VerifiedBadge,
  type EvidencePhoto,
} from "../components/evidence-card";
import { ShareMenu } from "../components/share-menu";
import { useShareView } from "../queries/share";
import { useT } from "../lib/i18n";

export default function ShareView() {
  const t = useT();
  const params = useParams<{ token: string }>();
  const view = useShareView(params.token ?? "");
  const [openId, setOpenId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [modalShareOpen, setModalShareOpen] = useState(false);
  const pageUrl = typeof window === "undefined" ? "" : window.location.href;

  const photos = (view.data?.photos ?? []) as unknown as EvidencePhoto[];
  const open = photos.find((p) => p.id === openId) ?? null;

  return (
    <div className="min-h-screen bg-ink text-chalk">
      <header className="border-b border-line bg-ink-2">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-4">
            <Logo />
            {view.data && (
              <div className="border-l border-line pl-4">
                <p className="text-[14px] font-semibold text-chalk">{view.data.org.name}</p>
                <p className="mono text-[10px] uppercase tracking-widest text-fog">
                  {view.data.link.label}
                </p>
              </div>
            )}
          </div>
          {view.data && (
            <div className="flex items-center gap-2">
              <span className="mono inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2 py-1 text-[10px] uppercase tracking-widest text-fog">
                <Eye className="size-3" /> {t("shareView.views", { n: view.data.link.views })}
              </span>
              <span className="rounded-[6px] mono inline-flex items-center gap-1.5 border border-verified/40 bg-verified/10 px-2 py-1 text-[10px] uppercase tracking-widest text-verified">
                <ShieldCheck className="size-3" /> {t("shareView.verified")}
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShareOpen((v) => !v)}
                  className="mono inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2 py-1 text-[10px] uppercase tracking-widest text-chalk transition-colors hover:border-amber/60 hover:text-amber"
                >
                  <Share2 className="size-3" /> {t("shareMenu.title")}
                </button>
                {shareOpen && (
                  <ShareMenu
                    url={pageUrl}
                    title={view.data.link.label}
                    onClose={() => setShareOpen(false)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {view.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EvidenceSkeleton key={i} />
            ))}
          </div>
        ) : view.isError ? (
          <div className="rounded-[12px] mx-auto max-w-md border border-alert/40 bg-alert/10 p-6 text-center">
            <ShieldAlert className="mx-auto size-6 text-alert" />
            <p className="mt-3 font-display text-lg font-semibold">
              {t("shareView.gone.title")}
            </p>
            <p className="mt-1.5 text-[13px] text-fog">{t("shareView.gone.hint")}</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight">
                  {t("shareView.heading", { n: photos.length })}
                </h1>
                <p className="mono mt-1 text-[11px] text-fog">
                  {t("shareView.note")}
                  {view.data?.link.expiresAt
                    ? ` ${t("shareView.expires", { when: formatStamp(view.data.link.expiresAt) })}`
                    : ""}
                </p>
              </div>
              {view.data?.link.allowDownload && (
                <span className="mono rounded-[8px] border border-line px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-fog">
                  {t("shareView.downloads")}
                </span>
              )}
            </div>

            {photos.some((p) => p.lat != null && p.lng != null) && (
              /*
               * Server-proxied static map, not the live JS map used inside the app: this page is
               * public, so the Maps browser key never reaches it and a shared link cannot rack up
               * live map loads. Rendered by GET /api/share/:token/map.png.
               */
              <figure className="relative mb-6 overflow-hidden rounded-[12px] border border-line bg-fog/5">
                <img
                  src={`/api/share/${encodeURIComponent(params.token ?? "")}/map.png?w=1280&h=360`}
                  alt={t("map.title")}
                  width={1280}
                  height={360}
                  loading="lazy"
                  className="block h-[360px] w-full object-cover"
                />
                <figcaption className="mono absolute bottom-0 left-0 bg-ink/80 px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-chalk">
                  {t("map.fixes", { n: photos.filter((p) => p.lat != null && p.lng != null).length })}
                </figcaption>
              </figure>
            )}

            {photos.length === 0 ? (
              <p className="py-16 text-center text-[13px] text-fog">
                {t("shareView.empty")}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((photo) => (
                  <EvidenceCard key={photo.id} photo={photo} onClick={() => setOpenId(photo.id)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <button
            type="button"
            aria-label={t("shareView.closePhoto")}
            onClick={() => setOpenId(null)}
            className="absolute inset-0 bg-ink/90 backdrop-blur-sm"
          />
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[12px] border border-line bg-ink-2">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <Link
                to={`/v/${open.photoCode}`}
                className="mono text-[11px] tracking-widest text-amber underline decoration-amber/40 underline-offset-4 hover:decoration-amber"
                title={t("verify.navLink")}
              >
                {open.photoCode}
              </Link>
              <div className="flex items-center gap-2">
                <VerifiedBadge integrity={open.integrity} />
                {view.data?.link.allowDownload && (
                  <a
                    href={open.url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1.5 text-[11.5px] text-chalk hover:border-amber/60 hover:text-amber"
                  >
                    <Download className="size-3.5" /> {t("common.download")}
                  </a>
                )}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setModalShareOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1.5 text-[11.5px] text-chalk hover:border-amber/60 hover:text-amber"
                  >
                    <Share2 className="size-3.5" /> {t("shareMenu.title")}
                  </button>
                  {modalShareOpen && (
                    <ShareMenu
                      url={pageUrl}
                      title={t("shareMenu.photoTitle", { code: open.photoCode })}
                      onClose={() => setModalShareOpen(false)}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  className="rounded-[12px] border border-line px-2.5 py-1.5 text-[11.5px] text-fog hover:text-chalk"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
            <img src={open.url} alt={open.photoCode} className="w-full bg-ink object-contain" />
            <dl className="grid gap-x-6 gap-y-2 px-5 py-4 sm:grid-cols-2">
              {[
                [t("shareView.captured"), formatStamp(open.capturedAt)],
                [
                  t("shareView.serverVerified"),
                  open.verifiedAt ? formatStamp(open.verifiedAt) : "—",
                ],
                [t("shareView.coordinates"), formatCoords(open.lat, open.lng)],
                [t("shareView.address"), open.address ?? "—"],
                [t("common.project"), open.projectName ?? t("queue.unassigned")],
                [t("shareView.noteLabel"), open.note ?? "—"],
                ...(open.recipient
                  ? ([[t("evidence.recipient"), open.recipient]] as [string, string][])
                  : ([] as [string, string][])),
              ].map(([label, value]) => (
                <div key={label} className="border-b border-line/60 py-1.5">
                  <dt className="label text-fog">{label}</dt>
                  <dd className="mono mt-0.5 text-[12px] text-chalk">{value}</dd>
                </div>
              ))}
            </dl>
            {open.signaturePath ? (
              <div className="mx-5 mb-5 rounded-[12px] border border-line bg-ink p-3">
                <p className="mono text-[10px] uppercase tracking-widest text-fog">
                  {t("evidence.signature")}
                </p>
                <svg
                  viewBox={open.signatureBox ?? "0 0 320 150"}
                  className="mt-2 h-[110px] w-full text-chalk"
                  aria-label={t("evidence.signature")}
                >
                  <title>{t("evidence.signature")}</title>
                  <path
                    d={open.signaturePath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <footer className="border-t border-line px-5 py-6 text-center">
        <p className="mono text-[10.5px] uppercase tracking-widest text-fog">
          {t("shareView.documented")} ·{" "}
          <a href="https://www.geocliks.com/" className="text-amber hover:underline">
            geocliks.com
          </a>
        </p>
      </footer>

      {view.isFetching && !view.isLoading && (
        <span className="fixed bottom-4 right-4 inline-flex items-center gap-2 rounded-[8px] border border-line bg-ink-2 px-3 py-2 text-[11px] text-fog">
          <Loader2 className="size-3.5 animate-spin" /> {t("shareView.refreshing")}
        </span>
      )}
    </div>
  );
}
