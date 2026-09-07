import { cn } from "../lib/utils";

/**
 * GeoCliks mark — an amber wireframe Earth globe (equator, tropics, meridian) with a
 * solid amber location pin standing on it, its head an ink aperture: "geo" + "click".
 * No tile behind it — the globe itself is the shape. See /design.md.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative grid size-8 place-items-center", className)}>
      <svg viewBox="0 0 32 32" className="size-full" fill="none" aria-hidden="true">
        {/* globe: sphere edge, parallels, meridian */}
        <g stroke="#FFB021" strokeWidth="1.6" fill="none">
          <circle cx="16" cy="16" r="13" />
          <path d="M3.4 12h25.2M3.4 20h25.2" />
          <ellipse cx="16" cy="16" rx="5.9" ry="13" />
        </g>
        {/* pin standing on the globe, cut clear of the graticule */}
        <path
          d="M16 24.6s-5.4-4.8-5.4-8.5a5.4 5.4 0 0 1 10.8 0c0 3.7-5.4 8.5-5.4 8.5Z"
          fill="#FFB021"
          stroke="#0B0E13"
          strokeWidth="1.5"
        />
        {/* aperture */}
        <circle cx="16" cy="15.7" r="2" fill="#0B0E13" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-extrabold tracking-tight text-chalk">
            GEO<span className="text-amber">CLIKS</span>
          </span>
          <span className="mono mt-1.5 text-[8.5px] tracking-[0.28em] text-fog">FIELD EVIDENCE</span>
        </span>
      )}
    </span>
  );
}
