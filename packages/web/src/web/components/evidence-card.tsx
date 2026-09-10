import { Check, FolderOpen, MapPin, Play, ShieldAlert, ShieldCheck } from "lucide-react";
import { type TKey, useT } from "../lib/i18n";
import { cn } from "../lib/utils";
import { PhotoShareButton } from "./share-menu";

/**
 * A timestamp as it can legitimately reach the client. The API layer hands back real `Date`
 * objects, cached/serialized payloads hand back ISO strings, and locally-computed values are
 * epoch milliseconds. All three are valid `new Date(...)` inputs, so display helpers accept
 * the union rather than forcing every call site to normalize.
 */
export type Stamp = number | string | Date;

export type EvidencePhoto = {
  id: string;
  photoCode: string;
  url: string;
  capturedAt: Stamp;
  verifiedAt?: Stamp | null;
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  note?: string | null;
  tag?: string | null;
  integrity?: string | null;
  projectName?: string | null;
  timeSource?: string | null;
  kind?: string | null;
  posterUrl?: string | null;
  durationMs?: number | null;
  recipient?: string | null;
  signaturePath?: string | null;
  signatureBox?: string | null;
};

/** mm:ss for clip durations. */
export function formatDuration(ms?: number | null) {
  if (!ms || ms <= 0) return "0:00";
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export const TAG_LABEL: Record<string, TKey> = {
  general: "tag.work",
  before: "tag.before",
  after: "tag.after",
  issue: "tag.issue",
  arrival: "tag.arrival",
  departure: "tag.departure",
  pickup: "tag.pickup",
  delivery: "tag.delivery",
};

export function formatStamp(ms: Stamp) {
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatCoords(lat?: number | null, lng?: number | null) {
  if (lat == null || lng == null) return "NO GPS FIX";
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(5)}° ${ns}  ${Math.abs(lng).toFixed(5)}° ${ew}`;
}

export function VerifiedBadge({ integrity }: { integrity?: string | null }) {
  const t = useT();
  const ok = integrity === "verified";
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] uppercase tracking-widest",
        ok
          ? "border-verified/40 bg-verified/10 text-verified"
          : "border-alert/40 bg-alert/10 text-alert",
      )}
    >
      {ok ? <ShieldCheck className="size-3" /> : <ShieldAlert className="size-3" />}
      {ok ? t("evidence.verified") : t("evidence.unverified")}
    </span>
  );
}

export function EvidenceCard({
  photo,
  onClick,
  className,
  selectable = false,
  selected = false,
  shareable = false,
}: {
  photo: EvidencePhoto;
  onClick?: () => void;
  className?: string;
  /** Selection mode turns the tile into a checkbox for bulk actions. */
  selectable?: boolean;
  selected?: boolean;
  /** Signed-in grids can mint a public link straight from the tile. */
  shareable?: boolean;
}) {
  const t = useT();
  const card = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group block w-full cursor-pointer border bg-ink-2 text-left transition-colors",
        selected ? "border-amber ring-1 ring-amber" : "border-line hover:border-amber/50",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-3">
        {selectable && (
          <span
            className={cn(
              "absolute right-2 top-2 z-10 flex size-5 items-center justify-center border",
              selected ? "border-amber bg-amber text-ink" : "border-white/60 bg-black/50",
            )}
          >
            {selected && <Check className="size-3.5" />}
          </span>
        )}
        {/* An <img> pointing at an .mp4 renders a black tile, so a poster-less clip gets a
            deliberate dark placeholder instead of a broken image. */}
        {photo.kind === "video" && !photo.posterUrl ? (
          <div className="flex h-full w-full items-center justify-center bg-ink" />
        ) : (
          <img
            src={photo.posterUrl ?? photo.url}
            alt={photo.note ?? photo.photoCode}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        {photo.kind === "video" && (
          <>
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-11 items-center justify-center rounded-full border border-white/40 bg-black/55">
                <Play className="size-4 translate-x-[1px] fill-white text-white" />
              </span>
            </span>
            <span className="mono absolute bottom-11 right-2 border border-white/25 bg-black/65 px-1.5 py-0.5 text-[9.5px] tracking-widest text-white">
              {formatDuration(photo.durationMs)}
            </span>
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-stretch bg-black/70">
          <div className="w-[3px] bg-amber" />
          <div className="min-w-0 px-2 py-1.5">
            <p className="mono text-[11px] font-semibold text-white">
              {formatStamp(photo.capturedAt)}
            </p>
            <p className="mono truncate text-[9.5px] text-white/70">
              {formatCoords(photo.lat, photo.lng)}
            </p>
          </div>
        </div>
        {photo.tag && photo.tag !== "general" && (
          <span className="mono absolute left-2 top-2 border border-white/25 bg-black/60 px-1.5 py-0.5 text-[9.5px] uppercase tracking-widest text-white">
            {TAG_LABEL[photo.tag] ? t(TAG_LABEL[photo.tag]) : photo.tag}
          </span>
        )}
        <span className="absolute right-2 top-2">
          <VerifiedBadge integrity={photo.integrity} />
        </span>
      </div>

      <div className={cn("space-y-1.5 p-3", shareable && "pr-12")}>
        <p className="mono text-[10.5px] tracking-widest text-amber">{photo.photoCode}</p>
        {photo.note && <p className="line-clamp-2 text-sm text-chalk">{photo.note}</p>}
        <p className="flex items-start gap-1.5 text-[11px] text-fog">
          <MapPin className="mt-0.5 size-3 shrink-0" />
          <span className="line-clamp-1">{photo.address ?? t("photo.addressUnavailable")}</span>
        </p>
        <p className="flex items-center gap-1.5 text-[11px] text-fog">
          {/* Project line, not a time field — the icon has to say "job", not "clock". */}
          <FolderOpen className="size-3 shrink-0" />
          <span className="truncate">{photo.projectName || t("queue.unassigned")}</span>
        </p>
      </div>
    </button>
  );

  // The share control has to sit beside the tile, not inside it — a button cannot nest a button.
  if (!shareable) return card;
  return (
    <div className="relative">
      {card}
      <PhotoShareButton
        photoId={photo.id}
        code={photo.photoCode}
        compact
        className="absolute bottom-3 right-3 z-20"
      />
    </div>
  );
}

export function EvidenceSkeleton() {
  return (
    <div className="border border-line bg-ink-2">
      <div className="aspect-[4/3] animate-pulse bg-ink-3" />
      <div className="space-y-2 p-3">
        <div className="h-2.5 w-24 animate-pulse bg-ink-3" />
        <div className="h-3 w-full animate-pulse bg-ink-3" />
        <div className="h-2.5 w-2/3 animate-pulse bg-ink-3" />
      </div>
    </div>
  );
}
