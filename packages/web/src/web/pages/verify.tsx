import { useEffect, useState } from "react";
import { Link, useParams, useSearch } from "wouter";
import {
  ArrowRight,
  Download,
  Loader2,
  Lock,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "../components/logo";
import { LanguageSelect } from "../components/language-select";
import { formatCoords, formatStamp } from "../components/evidence-card";
import { useVerifyCode } from "../queries/verify";
import { useT } from "../lib/i18n";

function Field({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border-b border-line px-4 py-3 last:border-b-0 sm:grid sm:grid-cols-[140px_1fr] sm:gap-4">
      <span className="mono block text-[10px] uppercase tracking-widest text-fog">{label}</span>
      <span
        className={
          mono
            ? "mono mt-1 block break-all text-[12px] text-chalk sm:mt-0"
            : "mt-1 block break-words text-[14px] text-chalk sm:mt-0"
        }
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Public photo-code verification. Reached at /verify, /verify?code=… or /v/:code —
 * the QR printed on a photo or closeout report points at /v/<code>.
 * Metadata and integrity are public; the image itself only appears when the owning
 * workspace published a live share link for that photo.
 */
export default function VerifyPage() {
  const t = useT();
  const params = useParams<{ code?: string }>();
  const search = useSearch();
  const initial = params.code ?? new URLSearchParams(search).get("code") ?? "";
  const [code, setCode] = useState(initial);
  const [input, setInput] = useState(initial);
  const q = useVerifyCode(code);

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.dataset.theme;
    root.dataset.theme = "light";
    document.title = t("verify.title");
    return () => {
      if (prev) root.dataset.theme = prev;
      else delete root.dataset.theme;
    };
  }, [t]);

  const d = q.data;
  const ok = d?.integrity === "verified";

  return (
    <div data-theme="light" className="min-h-screen bg-ink text-chalk">
      <header
        data-theme="dark"
        className="sticky top-0 z-40 border-b border-white/10 bg-[#0d2137]"
      >
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-5 py-3">
          <Link to="/" aria-label="GeoCliks" className="shrink-0">
            <Logo className="h-7" />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelect compact bare />
            <Link
              to="/get-app"
              className="whitespace-nowrap rounded-full border border-white/25 px-3 py-1.5 text-[12px] font-semibold text-white/80 transition-colors hover:border-amber/60 hover:text-amber"
            >
              {t("verify.getApp")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-5 py-10 sm:py-14">
        {q.isLoading && code ? (
          <div className="flex items-center gap-3 rounded-[12px] border border-line bg-ink-2 p-8 text-[14px] text-fog">
            <Loader2 className="size-4 animate-spin" /> {t("verify.loading")}
          </div>
        ) : q.isError ? (
          <div className="rounded-[12px] border border-alert/40 bg-alert/5 p-8">
            <ShieldAlert className="size-6 text-alert" />
            <h1 className="mt-4 text-[24px] font-black tracking-tight sm:text-[30px]">
              {t("verify.notFoundTitle")}
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-fog">{t("verify.notFoundBody")}</p>
          </div>
        ) : d ? (
          <>
            <div className="flex flex-wrap gap-2">
              <span className="mono inline-flex items-center gap-1.5 rounded-[8px] border border-line px-2.5 py-1 text-[10px] uppercase tracking-widest text-fog">
                <Lock className="size-3" /> {t("verify.chipLocked")}
              </span>
              <span
                className={
                  ok
                    ? "rounded-[6px] mono inline-flex items-center gap-1.5 border border-verified/40 bg-verified/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-verified"
                    : "rounded-[6px] mono inline-flex items-center gap-1.5 border border-alert/40 bg-alert/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-alert"
                }
              >
                <ShieldCheck className="size-3" />{" "}
                {ok ? t("verify.chipOriginal") : t("verify.statusUnverified")}
              </span>
            </div>

            <h1 className="mt-5 text-[32px] leading-tight font-black tracking-tight sm:text-[44px]">
              {ok ? t("verify.headline") : t("verify.headlineUnverified")}
            </h1>
            <p className="mono mt-2 text-[16px] tracking-widest text-amber">{d.photoCode}</p>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-fog">
              {t("verify.subhead")}
            </p>

            {/* the locked file */}
            <div className="mt-8 rounded-[12px] border border-line bg-ink-2">
              {d.published && d.url ? (
                d.kind === "video" ? (
                  <video
                    src={d.url}
                    poster={d.posterUrl ?? undefined}
                    controls
                    aria-label={d.photoCode}
                    className="w-full bg-black"
                  >
                    <track kind="captions" />
                  </video>
                ) : (
                  <img src={d.url} alt={d.photoCode} className="w-full bg-black object-contain" />
                )
              ) : (
                <div className="flex items-start gap-3 p-6">
                  <Lock className="mt-0.5 size-4 shrink-0 text-amber" />
                  <div>
                    <h2 className="text-[15px] font-bold">{t("verify.notPublishedTitle")}</h2>
                    <p className="mt-2 text-[13px] leading-relaxed text-fog">
                      {t("verify.notPublishedBody")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* where it was taken — server-proxied static map, so the Maps key never reaches
                this public page. Rendered by GET /api/verify/:code/map.png. */}
            {d.lat != null && d.lng != null ? (
              <figure className="relative mt-6 overflow-hidden rounded-[12px] border border-line bg-fog/5">
                <img
                  src={`/api/verify/${encodeURIComponent(d.photoCode)}/map.png?w=1280&h=320`}
                  alt={t("map.title")}
                  width={1280}
                  height={320}
                  loading="lazy"
                  className="block h-[260px] w-full object-cover"
                />
                <figcaption className="mono absolute bottom-0 left-0 bg-ink/80 px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-chalk">
                  {formatCoords(d.lat, d.lng)}
                </figcaption>
              </figure>
            ) : null}

            {/* fields */}
            <div className="mt-6 rounded-[12px] border border-line bg-ink-2">
              <Field
                label={t("verify.statusLabel")}
                value={
                  (ok ? t("verify.statusVerified") : t("verify.statusUnverified")) +
                  (d.timeSource === "network"
                    ? ` · ${t("photo.networkTime")}`
                    : ` · ${t("photo.deviceTime")}`)
                }
              />
              <Field
                label={t("verify.capturedLabel")}
                value={d.capturedAt ? formatStamp(new Date(d.capturedAt).getTime()) : "—"}
              />
              <Field
                label={t("verify.verifiedAtLabel")}
                value={d.verifiedAt ? formatStamp(new Date(d.verifiedAt).getTime()) : "—"}
              />
              <Field label={t("verify.locationLabel")} value={formatCoords(d.lat, d.lng)} />
              <Field
                label={t("verify.addressLabel")}
                value={d.address || t("photo.addressUnavailable")}
                mono={false}
              />
              <Field label={t("verify.codeLabel")} value={d.photoCode} />
              <Field label={t("verify.hashLabel")} value={d.contentHash || "—"} />
              <Field
                label={t("verify.deviceLabel")}
                value={[d.deviceModel, d.platform].filter(Boolean).join(" · ") || "—"}
              />
              <Field
                label={t("verify.jobLabel")}
                value={d.projectName || t("queue.unassigned")}
                mono={false}
              />
              <Field
                label={t("verify.workspaceLabel")}
                value={d.orgName || "—"}
                mono={false}
              />
              {d.recipient ? (
                <Field label={t("evidence.recipient")} value={d.recipient} mono={false} />
              ) : null}
            </div>

            {/* drawn proof of delivery, published alongside the file */}
            {d.signaturePath ? (
              <div className="mt-6 rounded-[12px] border border-line bg-ink-2 p-4">
                <p className="mono text-[10px] uppercase tracking-widest text-fog">
                  {t("evidence.signature")}
                </p>
                <svg
                  viewBox={d.signatureBox ?? "0 0 320 150"}
                  className="mt-3 h-[130px] w-full text-chalk"
                  aria-label={t("evidence.signature")}
                >
                  <title>{t("evidence.signature")}</title>
                  <path
                    d={d.signaturePath}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {d.published && d.url && d.allowDownload && (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[8px] inline-flex items-center gap-2 border border-amber bg-amber px-5 py-3 text-[14px] font-bold text-ink transition-colors hover:bg-amber/90"
                >
                  <Download className="size-4" /> {t("verify.download")}
                </a>
              )}
              {d.published && d.shareToken && (
                <Link
                  to={`/share/${d.shareToken}`}
                  className="inline-flex items-center gap-2 rounded-[8px] border border-line px-5 py-3 text-[14px] font-bold text-chalk transition-colors hover:border-amber/60 hover:text-amber"
                >
                  <MapPin className="size-4" /> {t("verify.openRecord")}
                </Link>
              )}
              <Link
                to="/get-app"
                className="inline-flex items-center gap-2 rounded-[8px] border border-line px-5 py-3 text-[14px] font-bold text-chalk transition-colors hover:border-amber/60 hover:text-amber"
              >
                {t("verify.getFieldApp")} <ArrowRight className="size-4" />
              </Link>
            </div>

            <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-fog">
              {t("verify.disclaimer")}
            </p>
          </>
        ) : (
          <>
            <span className="rounded-[6px] mono inline-flex items-center gap-1.5 border border-amber/50 bg-amber/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-amber">
              <ShieldCheck className="size-3" /> {t("verify.chipOriginal")}
            </span>
            <h1 className="mt-5 text-[32px] leading-tight font-black tracking-tight sm:text-[44px]">
              {t("verify.emptyTitle")}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-fog">
              {t("verify.emptyBody")}
            </p>
          </>
        )}

        {/* lookup */}
        <form
          className="mt-10 rounded-[12px] border border-line bg-ink-2 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setCode(input.trim());
          }}
        >
          <label
            htmlFor="photo-code"
            className="mono block text-[10px] uppercase tracking-widest text-fog"
          >
            {t("verify.lookupLabel")}
          </label>
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              id="photo-code"
              aria-label={t("verify.lookupLabel")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="GC-XXXX-XXXX-XXXX"
              className="mono min-w-[220px] flex-1 rounded-[8px] border border-line bg-ink px-3 py-3 text-[13px] tracking-widest text-chalk outline-none placeholder:text-fog/60 focus:border-amber"
            />
            <button
              type="submit"
              className="rounded-[8px] inline-flex items-center gap-2 border border-amber bg-amber px-5 py-3 text-[14px] font-bold text-ink transition-colors hover:bg-amber/90"
            >
              <Search className="size-4" /> {t("verify.submit")}
            </button>
          </div>
        </form>

        <p className="mono mt-6 text-[10px] uppercase tracking-widest text-fog">
          {t("verify.footerNote")}
        </p>
      </main>
    </div>
  );
}
