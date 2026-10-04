import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Download,
  FlipHorizontal2,
  FlipVertical2,
  Loader2,
  Maximize2,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useT } from "../lib/i18n";

const MIN = 1;
const MAX = 8;
const STEP = 1.5;
const clamp = (z: number) => Math.min(MAX, Math.max(MIN, z));

/**
 * Full-screen view of the untouched original, opened from the photo drawer.
 *
 * "Original file" used to be a plain link to the presigned storage URL. On another origin the
 * `download` attribute is ignored, so the click left the app for a bare image with no way back
 * except the browser's own button. This keeps the viewer inside the app: download, zoom, flip,
 * rotate, and Back / Close in the top bar.
 *
 * Flip and rotate are view-only (CSS transforms). The stored file, its hash and the downloaded
 * bytes are never touched, which is the whole point of the original.
 *
 * Opening pushes one history entry, so a phone's Back gesture closes the viewer instead of
 * leaving the page.
 */
export function PhotoViewer({
  kind,
  src,
  poster,
  downloadName,
  label,
  code,
  alt,
  onClose,
}: {
  kind: "photo" | "video";
  src: string;
  poster?: string | null;
  downloadName: string;
  /** Which file this is — "Original file" or "Stamped image" — shown next to the code. */
  label: string;
  code: string;
  alt: string;
  onClose: () => void;
}) {
  const t = useT();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [rot, setRot] = useState(0);
  /** Extra shrink so a quarter-turned picture still fits the stage. */
  const [quarterFit, setQuarterFit] = useState(1);

  const stage = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLImageElement & HTMLVideoElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const dragged = useRef(false);
  /** No easing while a finger or the mouse is moving the picture, or panning lags behind. */
  const [moving, setMoving] = useState(false);

  // --- Back / Close -------------------------------------------------------------------------
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const pushed = useRef(false);

  useEffect(() => {
    window.history.pushState({ ...window.history.state, geoViewer: true }, "");
    pushed.current = true;
    const onPop = () => {
      pushed.current = false;
      closeRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const close = useCallback(() => {
    // Unwind our own history entry; the popstate listener then closes.
    if (pushed.current && window.history.state?.geoViewer) window.history.back();
    else closeRef.current();
  }, []);

  // --- Download -----------------------------------------------------------------------------
  /*
    The original lives on the storage origin, where the `download` attribute is ignored and the
    store does not honour a signed Content-Disposition either, so a plain link only opens the
    bare file. Storage answers CORS with `*`, so the bytes are fetched here and saved from a
    same-origin blob URL under the photo code. Same bytes, untouched. If the fetch fails, the
    file opens in a new tab rather than replacing the app.
  */
  const [saving, setSaving] = useState(false);
  const download = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (src.startsWith("/")) return; // same-origin demo asset: the attribute just works
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(String(res.status));
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch {
      window.open(src, "_blank", "noopener");
    } finally {
      setSaving(false);
    }
  };

  // --- Zoom / pan ---------------------------------------------------------------------------
  const zoomTo = useCallback((next: number) => {
    const z = clamp(next);
    setZoom(z);
    if (z === 1) setPan({ x: 0, y: 0 });
  }, []);

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const measure = useCallback(() => {
    const s = stage.current;
    const m = media.current;
    if (!s || !m) return;
    const quarter = rot % 180 !== 0;
    const w = m.offsetWidth;
    const h = m.offsetHeight;
    if (!quarter || !w || !h) return setQuarterFit(1);
    setQuarterFit(Math.min(1, s.clientWidth / h, s.clientHeight / w));
  }, [rot]);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  // --- Keyboard -----------------------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "+" || e.key === "=") zoomTo(zoom * STEP);
      else if (e.key === "-" || e.key === "_") zoomTo(zoom / STEP);
      else if (e.key === "0") reset();
      else if (e.key === "h" || e.key === "H") setFlipX((v) => !v);
      else if (e.key === "v" || e.key === "V") setFlipY((v) => !v);
      else if (e.key === "r" || e.key === "R") setRot((r) => (r + 90) % 360);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, reset, zoom, zoomTo]);

  // --- Pointer: drag to pan, two fingers to pinch --------------------------------------------
  const onPointerDown = (e: React.PointerEvent) => {
    if (kind === "video" && zoom === 1) return; // leave the video's own controls alone
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragged.current = false;
    setMoving(true);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const next = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, next);
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomTo((pinch.current.zoom * d) / pinch.current.dist);
      dragged.current = true;
      return;
    }
    if (zoom > 1) {
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 1) dragged.current = true;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) setMoving(false);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (e.deltaY === 0) return;
    zoomTo(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
  };

  const onDoubleClick = () => {
    if (dragged.current) return;
    if (zoom > 1) reset();
    else zoomTo(2);
  };

  const transform = [
    `translate(${pan.x}px, ${pan.y}px)`,
    `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
    `rotate(${rot}deg)`,
    `scale(${zoom * quarterFit})`,
  ].join(" ");

  const btn =
    "flex size-9 shrink-0 items-center justify-center rounded-[8px] text-white/85 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent";
  const on = "bg-white/15 text-amber-ink";

  // Portalled to <body>: the drawer's overlay uses backdrop-filter, which makes it the containing
  // block and stacking context for anything fixed inside it, so the chat bubble (z-60) would sit
  // on top of the viewer and the page could bleed through.
  return createPortal(
    <dialog
      open
      aria-label={`${code} · ${label}`}
      className="fixed inset-0 z-[80] m-0 flex h-full max-h-none w-full max-w-none flex-col border-0 bg-black p-0 text-white"
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/80 px-2 py-1.5 sm:px-3">
        <button
          type="button"
          onClick={close}
          className="mono flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] px-2 text-[11px] uppercase tracking-widest text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" />
          <span className="hidden sm:inline">{t("viewer.back")}</span>
        </button>
        <p className="mono hidden min-w-0 truncate text-[11px] uppercase tracking-widest text-amber-ink md:block">
          {code} · {label}
        </p>

        <div className="ml-auto flex min-w-0 items-center gap-0.5 overflow-x-auto">
          <button
            type="button"
            title={t("viewer.zoomOut")}
            aria-label={t("viewer.zoomOut")}
            disabled={zoom <= MIN}
            onClick={() => zoomTo(zoom / STEP)}
            className={btn}
          >
            <ZoomOut className="size-4" />
          </button>
          <button
            type="button"
            title={t("viewer.fit")}
            onClick={reset}
            className="mono h-9 w-12 shrink-0 rounded-[8px] text-[10.5px] text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            title={t("viewer.zoomIn")}
            aria-label={t("viewer.zoomIn")}
            disabled={zoom >= MAX}
            onClick={() => zoomTo(zoom * STEP)}
            className={btn}
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            type="button"
            title={t("viewer.fit")}
            aria-label={t("viewer.fit")}
            onClick={reset}
            className={`${btn} hidden sm:flex`}
          >
            <Maximize2 className="size-4" />
          </button>
          <span className="mx-1 h-5 w-px shrink-0 bg-white/15" />
          <button
            type="button"
            title={t("viewer.flipH")}
            aria-label={t("viewer.flipH")}
            aria-pressed={flipX}
            onClick={() => setFlipX((v) => !v)}
            className={`${btn} ${flipX ? on : ""}`}
          >
            <FlipHorizontal2 className="size-4" />
          </button>
          <button
            type="button"
            title={t("viewer.flipV")}
            aria-label={t("viewer.flipV")}
            aria-pressed={flipY}
            onClick={() => setFlipY((v) => !v)}
            className={`${btn} ${flipY ? on : ""}`}
          >
            <FlipVertical2 className="size-4" />
          </button>
          <button
            type="button"
            title={t("viewer.rotate")}
            aria-label={t("viewer.rotate")}
            onClick={() => setRot((r) => (r + 90) % 360)}
            className={`${btn} ${rot ? on : ""}`}
          >
            <RotateCw className="size-4" />
          </button>
          <span className="mx-1 h-5 w-px shrink-0 bg-white/15" />
          <a
            href={src}
            download={downloadName}
            onClick={download}
            aria-busy={saving}
            title={t("viewer.download")}
            aria-label={t("viewer.download")}
            className={`mono flex h-9 shrink-0 items-center gap-1.5 rounded-[8px] bg-amber px-2.5 text-[10.5px] font-bold uppercase tracking-widest text-on-amber transition-colors hover:bg-amber-deep ${saving ? "opacity-70" : ""}`}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            <span className="hidden sm:inline">{t("viewer.download")}</span>
          </a>
          <button
            type="button"
            title={t("common.close")}
            aria-label={t("common.close")}
            onClick={close}
            className={btn}
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div
        ref={stage}
        className={`relative flex flex-1 touch-none select-none items-center justify-center overflow-hidden ${
          zoom > 1 ? "cursor-grab active:cursor-grabbing" : kind === "photo" ? "cursor-zoom-in" : ""
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={kind === "photo" ? onDoubleClick : undefined}
      >
        {kind === "video" ? (
          <video
            ref={media}
            src={src}
            poster={poster ?? undefined}
            controls
            playsInline
            onLoadedMetadata={measure}
            aria-label={alt}
            style={{ transform }}
            className={`max-h-full max-w-full ${moving ? "" : "transition-transform duration-150 ease-out"}`}
          >
            <track kind="captions" />
          </video>
        ) : (
          <img
            ref={media}
            src={src}
            alt={alt}
            draggable={false}
            onLoad={measure}
            style={{ transform }}
            className={`max-h-full max-w-full object-contain ${moving ? "" : "transition-transform duration-150 ease-out"}`}
          />
        )}
      </div>
    </dialog>,
    document.body,
  );
}
