import { useEffect, useMemo } from "react";
import { Link, useParams } from "wouter";
import { CheckCircle2, Loader2, MapPin, PackageX, ShieldCheck, Truck } from "lucide-react";
import { Logo } from "../components/logo";
import { LanguageSelect } from "../components/language-select";
import { TrackMap, type TrackPin } from "../components/track-map";
import { formatStamp } from "../components/evidence-card";
import { useTrack } from "../queries/track";
import { useT, type Translate } from "../lib/i18n";

const REASON_KEY = {
  nobody_home: "track.reason.nobody_home",
  refused: "track.reason.refused",
  wrong_address: "track.reason.wrong_address",
  closed: "track.reason.closed",
  inaccessible: "track.reason.inaccessible",
  other: "track.reason.other",
} as const;

function reasonText(t: Translate, reason: string | null): string | null {
  if (!reason) return null;
  const key = REASON_KEY[reason as keyof typeof REASON_KEY];
  return key ? t(key) : null;
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border-b border-line px-4 py-3 last:border-b-0 sm:grid sm:grid-cols-[150px_1fr] sm:gap-4">
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
 * The recipient's own delivery page, reached only through the unguessable token GeoCliks
 * emails them. It deliberately shows one stop — theirs — and how many drops are still ahead
 * of it. Nothing about the rest of the route is ever rendered here.
 */
export default function TrackPage() {
  const t = useT();
  const params = useParams<{ token?: string }>();
  const token = params.token ?? "";
  const q = useTrack(token);
  const d = q.data;

  useEffect(() => {
    document.title = t("track.title");
  }, [t]);

  const org = d?.orgName ?? "GeoCliks";
  const delivered = d?.status === "delivered";
  const failed = d?.status === "failed";
  const running = d?.routeStatus === "active";
  const isNext = d?.status === "pending" && running && (d?.stopsAway ?? 1) === 0;

  /**
   * At most two pins: where it was meant to go, and where the photo was actually captured.
   * Never the driver - see the note on `TrackMap`.
   */
  const pins = useMemo<TrackPin[]>(() => {
    const out: TrackPin[] = [];
    if (typeof d?.lat === "number" && typeof d?.lng === "number") {
      out.push({
        id: "address",
        lat: d.lat,
        lng: d.lng,
        kind: "address",
        title: d.address ?? "",
      });
    }
    if (typeof d?.proof?.lat === "number" && typeof d?.proof?.lng === "number") {
      out.push({
        id: "proof",
        lat: d.proof.lat,
        lng: d.proof.lng,
        kind: "proof",
        title: t("track.mapLegendProof"),
      });
    }
    return out;
  }, [d, t]);

  const hasProofPin = pins.some((p) => p.kind === "proof");

  const headline = delivered
    ? t("track.headDelivered")
    : failed
      ? t("track.headFailed")
      : isNext
        ? t("track.headNext")
        : running
          ? t("track.headPending")
          : t("track.headNotStarted");

  const sub = delivered
    ? t("track.subDelivered", { org })
    : failed
      ? t("track.subFailed", { org })
      : running
        ? t("track.subPending", { org })
        : t("track.subNotStarted", { org, date: d?.date ?? "" });

  return (
    <div data-theme="light" className="min-h-screen bg-ink text-chalk">
      <header data-theme="dark" className="sticky top-0 z-40 border-b border-white/10 bg-[#0d2137]">
        <div className="mx-auto flex max-w-[760px] items-center justify-between px-5 py-3">
          <Link to="/" aria-label="GeoCliks" className="shrink-0">
            <Logo className="h-7" />
          </Link>
          <LanguageSelect compact bare />
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-5 py-10 sm:py-14">
        {q.isLoading ? (
          <div className="flex items-center gap-3 rounded-[12px] border border-line bg-ink-2 p-8 text-[14px] text-fog">
            <Loader2 className="size-4 animate-spin" /> {t("track.loading")}
          </div>
        ) : q.isError || !d ? (
          <div className="rounded-[12px] border border-alert/40 bg-alert/5 p-8">
            <PackageX className="size-6 text-alert" />
            <h1 className="mt-4 text-[24px] font-black tracking-tight sm:text-[30px]">
              {t("track.notFoundTitle")}
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-fog">{t("track.notFoundBody")}</p>
          </div>
        ) : (
          <>
            <span
              className={
                delivered
                  ? "mono inline-flex items-center gap-1.5 rounded-[6px] border border-verified/40 bg-verified/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-verified"
                  : failed
                    ? "mono inline-flex items-center gap-1.5 rounded-[6px] border border-alert/40 bg-alert/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-alert"
                    : "mono inline-flex items-center gap-1.5 rounded-[6px] border border-amber/50 bg-amber/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-amber"
              }
            >
              {delivered ? (
                <CheckCircle2 className="size-3" />
              ) : failed ? (
                <PackageX className="size-3" />
              ) : (
                <Truck className="size-3" />
              )}{" "}
              {t("track.chip")}
            </span>

            <h1 className="mt-5 text-[32px] leading-tight font-black tracking-tight sm:text-[42px]">
              {headline}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-fog">{sub}</p>

            {/* how close the driver is — a count of the drops ahead, never the drops themselves */}
            {d.status === "pending" && running ? (
              <div className="mt-7 rounded-[12px] border border-amber/40 bg-amber/[0.06] p-5">
                <p className="text-[20px] font-black tracking-tight text-amber sm:text-[24px]">
                  {(d.stopsAway ?? 0) === 0
                    ? t("track.youreNext")
                    : t("track.stopsAway", { n: d.stopsAway ?? 0 })}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-fog">{t("track.etaHint")}</p>
              </div>
            ) : null}

            {failed && reasonText(t, d.failedReason) ? (
              <div className="mt-7 rounded-[12px] border border-alert/40 bg-alert/[0.06] p-5">
                <p className="mono text-[10px] uppercase tracking-widest text-fog">
                  {t("track.reasonLabel")}
                </p>
                <p className="mt-2 text-[16px] font-bold">{reasonText(t, d.failedReason)}</p>
              </div>
            ) : null}

            {/* where it goes - and, once closed, where the photo was actually taken */}
            <section className="mt-8">
              <h2 className="text-[16px] font-bold">
                {hasProofPin ? t("track.mapTitleDone") : t("track.mapTitle")}
              </h2>
              <TrackMap
                pins={pins}
                className="mt-4 h-[280px] sm:h-[340px]"
                emptyMessage={t("track.mapEmpty")}
                noKeyMessage={t("track.mapNoKey")}
              />
              {pins.length > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                  <span className="mono inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-fog">
                    <span className="size-2.5 rounded-full bg-amber" />
                    {t("track.mapLegendAddress")}
                  </span>
                  {hasProofPin ? (
                    <span className="mono inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-fog">
                      <span className="size-2.5 rounded-full bg-verified" />
                      {t("track.mapLegendProof")}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-fog">
                {hasProofPin ? t("track.mapNoteProof") : t("track.mapNote")}
              </p>
            </section>

            {/* the proof itself */}
            {d.proof ? (
              <section className="mt-8">
                <h2 className="text-[16px] font-bold">{t("track.proofTitle")}</h2>
                <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-fog">
                  {t("track.proofBody")}
                </p>
                {d.proof.url ? (
                  <div className="mt-4 overflow-hidden rounded-[12px] border border-line bg-ink-2">
                    <img
                      src={d.proof.url}
                      alt={t("track.proofTitle")}
                      className="w-full bg-black object-contain"
                    />
                  </div>
                ) : null}
                {d.proof.signaturePath ? (
                  <div className="mt-4 rounded-[12px] border border-line bg-ink-2 p-4">
                    <p className="mono text-[10px] uppercase tracking-widest text-fog">
                      {t("track.signature")}
                    </p>
                    <svg
                      viewBox={d.proof.signatureBox ?? "0 0 320 150"}
                      className="mt-3 h-[130px] w-full text-chalk"
                      aria-label={t("track.signature")}
                    >
                      <title>{t("track.signature")}</title>
                      <path
                        d={d.proof.signaturePath}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                ) : null}
              </section>
            ) : null}

            {/* the facts about this one stop */}
            <div className="mt-6 rounded-[12px] border border-line bg-ink-2">
              <Field label={t("track.addressLabel")} value={d.address} />
              {d.recipientName ? (
                <Field label={t("track.forLabel")} value={d.recipientName} />
              ) : null}
              {d.reference ? (
                <Field label={t("track.refLabel")} value={d.reference} mono />
              ) : null}
              {d.completedAt ? (
                <Field
                  label={delivered ? t("track.whenLabel") : t("track.attemptedLabel")}
                  value={formatStamp(new Date(d.completedAt).getTime())}
                />
              ) : null}
              {d.proof?.recipient ? (
                <Field label={t("track.receivedBy")} value={d.proof.recipient} />
              ) : null}
              {d.proof ? (
                <Field label={t("track.codeLabel")} value={d.proof.photoCode} mono />
              ) : null}
              <Field label={t("track.senderLabel")} value={org} />
            </div>

            {d.proof?.integrity === "verified" ? (
              <p className="mono mt-4 inline-flex items-center gap-1.5 rounded-[6px] border border-verified/40 bg-verified/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-verified">
                <ShieldCheck className="size-3" /> {t("track.sealed")}
              </p>
            ) : null}

            {d.proof ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/v/${encodeURIComponent(d.proof.photoCode)}`}
                  className="inline-flex items-center gap-2 rounded-[8px] border border-line px-5 py-3 text-[14px] font-bold text-chalk transition-colors hover:border-amber/60 hover:text-amber"
                >
                  <MapPin className="size-4" /> {t("track.verifyLink")}
                </Link>
              </div>
            ) : null}

            <p className="mt-8 max-w-2xl text-[12px] leading-relaxed text-fog">
              {t("track.privacy")}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
