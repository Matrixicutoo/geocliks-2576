import { cn } from "../lib/utils";

export type WatermarkLayout = "classic" | "compact" | "detailed" | "branded";

export type WatermarkData = {
  time: string;
  coords: string;
  address: string;
  project?: string | null;
  company?: string | null;
  logoUrl?: string | null;
  accentColor?: string;
};

/**
 * The stamp burned into every GeoCliks photo. Same four layouts the
 * mobile capture screen renders live over the viewfinder.
 */
export function WatermarkOverlay({
  layout,
  data,
  className,
  scale = 1,
}: {
  layout: WatermarkLayout;
  data: WatermarkData;
  className?: string;
  scale?: number;
}) {
  const accent = data.accentColor ?? "#FFB021";
  const fs = (px: number) => ({ fontSize: `${px * scale}px`, lineHeight: 1.35 });

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 flex items-stretch gap-0 bg-black/72 backdrop-blur-[2px]",
        className,
      )}
    >
      <div style={{ width: 3 * scale, background: accent }} />
      <div className="flex w-full items-center gap-3 px-3 py-2">
        {(layout === "branded" || layout === "detailed") && data.logoUrl && (
          <img
            src={data.logoUrl}
            alt=""
            className="shrink-0 object-contain"
            style={{ height: 30 * scale, width: 30 * scale }}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="mono font-semibold text-white" style={fs(12)}>
            {data.time}
          </p>
          {layout !== "compact" && (
            <p className="mono truncate text-white/85" style={fs(10)}>
              {data.coords}
            </p>
          )}
          <p className="mono truncate text-white/75" style={fs(10)}>
            {data.address}
          </p>
          {layout === "detailed" && data.project && (
            <p className="mono truncate" style={{ ...fs(10), color: accent }}>
              {data.project}
            </p>
          )}
        </div>
        {layout === "branded" && data.company && (
          <p
            className="mono shrink-0 text-right font-semibold uppercase tracking-widest text-white/90"
            style={fs(9)}
          >
            {data.company}
          </p>
        )}
      </div>
    </div>
  );
}

export function WatermarkPreview({
  layout,
  data,
  image,
  className,
}: {
  layout: WatermarkLayout;
  data: WatermarkData;
  image: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[12px] border border-line bg-ink-3", className)}>
      <img src={image} alt="" className="h-full w-full object-cover" />
      <WatermarkOverlay layout={layout} data={data} />
    </div>
  );
}
