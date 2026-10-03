/**
 * A photo served as WebP at the size the layout shows it, with the original JPEG
 * as the fallback.
 *
 * The home page used to send the full-size camera JPEGs (up to 900x1200) to a
 * phone that paints them at a third of that. Each source now has WebP siblings
 * named after their real pixel width — `roof-damage.jpg` → `roof-damage-400.webp`,
 * `roof-damage-800.webp` — pre-cropped to the aspect the page shows (the same
 * centre crop `object-cover` would make). `sizes` tells the browser how wide the
 * slot is, so it picks the smallest file that is still sharp at the device's
 * pixel ratio.
 *
 * Adding a photo: generate the `-<width>.webp` files next to the JPEG and list
 * their widths here. A width with no file behind it is a broken image.
 */
type Props = {
  /** The original JPEG, by absolute public path. */
  src: string;
  /** Pixel widths of the `-<width>.webp` siblings, smallest first. */
  widths: readonly number[];
  sizes: string;
  alt: string;
  className?: string;
};

export function ResponsiveImg({ src, widths, sizes, alt, className }: Props) {
  const base = src.replace(/\.jpe?g$/i, "");
  const srcSet = widths.map((w) => `${base}-${w}.webp ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />
    </picture>
  );
}
