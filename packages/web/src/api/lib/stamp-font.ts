/**
 * A tiny stroke font and the pixel helpers that burn it into a capture.
 *
 * Why not a real font: the only image library with text rendering that works here is native
 * (sharp/libvips), and the deployed server is a single bundled file — a native module's binding
 * does not survive that bundle, and a bitmap-font library loading .fnt files off disk does not
 * either. So the stamp is drawn from line segments defined in this file: no native code, no wasm,
 * no runtime asset loading, identical output on every machine.
 *
 * Each glyph is a set of polylines on a 6 x 10 grid (x right, y down, y = 0 is the cap line).
 * Strokes are stamped as discs along each segment into a 3x supersampled alpha mask, then box
 * filtered down, which is what gives the edges their smoothing.
 *
 * The character set is what a field stamp actually prints: digits, capitals, and the punctuation
 * in a timestamp, a coordinate pair and a street address. Lowercase is folded to capitals and
 * accents are stripped, so "Montréal" stamps as "MONTREAL" rather than as a gap.
 */

/** Polylines per glyph, as "x,y x,y ...|x,y x,y ..." on the 6 x 10 grid. */
const GLYPHS: Record<string, string> = {
  A: "0,10 3,0 6,10|1.2,7 4.8,7",
  B: "0,0 0,10|0,0 4,0 5.5,1.4 5.5,3.4 4,4.9 0,4.9|0,4.9 4.3,4.9 5.9,6.4 5.9,8.5 4.3,10 0,10",
  C: "6,2 4.5,0.4 2.5,0.2 1,1.6 0,4 0,6 1,8.4 2.5,9.8 4.5,9.6 6,8",
  D: "0,0 0,10|0,0 3.4,0 5.4,2 6,5 5.4,8 3.4,10 0,10",
  E: "6,0 0,0 0,10 6,10|0,4.9 4.4,4.9",
  F: "6,0 0,0 0,10|0,4.9 4.4,4.9",
  G: "6,2 4.5,0.4 2.5,0.2 1,1.6 0,4 0,6 1,8.4 2.5,9.8 4.5,9.6 6,8 6,5.8 3.6,5.8",
  H: "0,0 0,10|6,0 6,10|0,5 6,5",
  I: "1.5,0 4.5,0|3,0 3,10|1.5,10 4.5,10",
  J: "5,0 5,7.4 4,9.5 2,10 0.5,8.8",
  K: "0,0 0,10|6,0 0.6,5.4|2.2,3.9 6,10",
  L: "0,0 0,10 6,10",
  M: "0,10 0,0 3,4.6 6,0 6,10",
  N: "0,10 0,0 6,10 6,0",
  O: "0,3.5 1.2,0.9 3,0.2 4.8,0.9 6,3.5 6,6.5 4.8,9.1 3,9.8 1.2,9.1 0,6.5 0,3.5",
  P: "0,10 0,0 4,0 5.8,1.7 5.8,3.6 4,5.2 0,5.2",
  Q: "0,3.5 1.2,0.9 3,0.2 4.8,0.9 6,3.5 6,6.5 4.8,9.1 3,9.8 1.2,9.1 0,6.5 0,3.5|3.8,7.4 6.2,10.3",
  R: "0,10 0,0 4,0 5.8,1.7 5.8,3.6 4,5.2 0,5.2|2.6,5.2 6,10",
  S: "6,1.7 4.3,0.2 2,0.2 0.4,1.6 0.6,3.4 2.4,4.6 4.2,5.4 5.8,6.6 5.8,8.6 4,9.9 1.7,9.9 0,8.4",
  T: "0,0 6,0|3,0 3,10",
  U: "0,0 0,7 1.4,9.4 3,9.9 4.6,9.4 6,7 6,0",
  V: "0,0 3,10 6,0",
  W: "0,0 1.4,10 3,3.6 4.6,10 6,0",
  X: "0,0 6,10|6,0 0,10",
  Y: "0,0 3,5 6,0|3,5 3,10",
  Z: "0,0 6,0 0,10 6,10",
  "0": "0,3.5 1.2,0.9 3,0.2 4.8,0.9 6,3.5 6,6.5 4.8,9.1 3,9.8 1.2,9.1 0,6.5 0,3.5|4.6,2.7 1.4,7.5",
  "1": "1,2 3,0 3,10|1.2,10 4.8,10",
  "2": "0.3,2.2 1.6,0.6 3.6,0.2 5.4,1 5.8,3 4.6,5 0,10 6,10",
  "3": "0.4,1.4 2.4,0.2 4.6,0.7 5.6,2.2 4.6,4.2 2.6,4.9|2.6,4.9 4.8,5.4 5.9,7 5.4,9 3.4,9.9 1,9.4 0.2,8.4",
  "4": "4.4,10 4.4,0 0,7 6,7",
  "5": "5.6,0 1,0 0.6,4.2 2.6,3.6 4.6,4 5.8,5.8 5.4,8.4 3.4,9.9 1.2,9.6 0.2,8.6",
  "6": "5.4,0.6 3,0.4 1,1.8 0.2,4.8 0.2,7.4 1.4,9.4 3.4,9.9 5.2,9 5.8,7 4.8,5.2 2.6,4.8 0.8,5.8 0.2,7.4",
  "7": "0,0 6,0 2.4,10",
  "8": "3,4.6 1.2,3.6 0.8,1.8 2.2,0.3 3.8,0.3 5.2,1.8 4.8,3.6 3,4.6 1,5.8 0.4,7.8 1.6,9.6 3.4,9.9 5.2,9 5.6,7 4.6,5.6 3,4.6",
  "9": "0.6,9.4 3,9.6 5,8.2 5.8,5.2 5.8,2.6 4.6,0.6 2.6,0.1 0.8,1 0.2,3 1.2,4.8 3.4,5.2 5.2,4.2 5.8,2.6",
  ".": "2.7,9.7 3.3,9.7",
  ",": "3.2,9.2 2.2,11.2",
  ":": "3,3.2 3,3.8|3,7.2 3,7.8",
  ";": "3,3.2 3,3.8|3.2,7.2 2.4,9",
  "-": "0.8,5.2 5.2,5.2",
  "_": "0.4,10.4 5.6,10.4",
  "/": "0.6,10 5.4,0",
  "\\": "0.6,0 5.4,10",
  "+": "0.8,5 5.2,5|3,2.8 3,7.2",
  "=": "0.8,3.6 5.2,3.6|0.8,6.6 5.2,6.6",
  "<": "5,1.6 1,5 5,8.4",
  ">": "1,1.6 5,5 1,8.4",
  "(": "4.4,0 2,3 2,7 4.4,10",
  ")": "1.6,0 4,3 4,7 1.6,10",
  "[": "4.4,0 2,0 2,10 4.4,10",
  "]": "1.6,0 4,0 4,10 1.6,10",
  "#": "1.8,1 1,9|4.6,1 3.8,9|0.4,3.8 5.6,3.8|0.2,6.4 5.4,6.4",
  "*": "3,2 3,7|0.8,3.2 5.2,5.8|5.2,3.2 0.8,5.8",
  "'": "3,0.4 3,2.8",
  '"': "2.2,0.4 2.2,2.8|3.8,0.4 3.8,2.8",
  "!": "3,0.4 3,6.6|3,9.2 3,9.8",
  "?": "0.6,2 2,0.4 4,0.4 5.4,1.8 5,3.6 3,4.9 3,6.6|3,9.2 3,9.8",
  "%": "0.6,10 5.4,0|0.6,1 1.9,1 1.9,2.7 0.6,2.7 0.6,1|4.1,7.3 5.4,7.3 5.4,9 4.1,9 4.1,7.3",
  "&": "5.6,10 1.6,1.4 2.4,0.3 3.8,0.6 4,2 0.6,6.4 0.8,9.2 2.6,9.9 4.4,8.6 5.2,6.4",
  "@": "4.6,4 3,3.2 1.8,4.2 1.8,6 3,6.8 4.2,6 4.2,3.4 4.2,6.4 5.4,6.8 6,5 5.4,2 3.4,0.4 1.4,0.8 0.2,3 0.2,6.6 1.6,9.4 3.6,9.9 5.2,9.4",
  "°": "2,1 3,0.4 4,1 4,2.2 3,2.8 2,2.2 2,1",
  "·": "2.7,5.2 3.3,5.2",
};

type Polyline = number[][];

/** Parsed once: glyph key to its polylines as [x, y] pairs. */
const PATHS: Record<string, Polyline[]> = Object.fromEntries(
  Object.entries(GLYPHS).map(([char, spec]) => [
    char,
    spec.split("|").map((line) =>
      line
        .trim()
        .split(/\s+/)
        .map((pair) => pair.split(",").map(Number)),
    ),
  ]),
);

/** Monospace advance and cap height, both as a fraction of the nominal font size. */
const ADVANCE = 0.62;
const CAP = 0.72;
/** Supersampling factor for the alpha mask. 3 is the point where the edges stop looking stepped. */
const SS = 3;

export type Rgb = { r: number; g: number; b: number };

/** Capitals, no accents, nothing outside the glyph table. */
export function stampable(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[‐-―−]/g, "-")
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[    ]/g, " ");
}

/** Width in pixels that `drawText` will use for this string at this size. */
export function measureText(text: string, size: number): number {
  return stampable(text).length * ADVANCE * size;
}

/** How many characters of `text` fit in `width` pixels at this size. */
export function fitChars(width: number, size: number): number {
  return Math.max(0, Math.floor(width / (ADVANCE * size)));
}

/** A single RGBA surface — jimp's `bitmap`, or anything shaped like it. */
export type Surface = { width: number; height: number; data: Uint8Array | Buffer };

/** Blend one pixel of `color` at `coverage` (0..1) over what is already there. */
function blend(surface: Surface, x: number, y: number, color: Rgb, coverage: number) {
  if (coverage <= 0 || x < 0 || y < 0 || x >= surface.width || y >= surface.height) return;
  const i = (y * surface.width + x) * 4;
  const a = Math.min(1, coverage);
  const d = surface.data;
  d[i] = Math.round(d[i]! + (color.r - d[i]!) * a);
  d[i + 1] = Math.round(d[i + 1]! + (color.g - d[i + 1]!) * a);
  d[i + 2] = Math.round(d[i + 2]! + (color.b - d[i + 2]!) * a);
  d[i + 3] = 255;
}

/** Flat rectangle, clipped to the surface. */
export function fillRect(
  surface: Surface,
  x: number,
  y: number,
  w: number,
  h: number,
  color: Rgb,
  alpha = 1,
) {
  const x0 = Math.max(0, Math.round(x));
  const y0 = Math.max(0, Math.round(y));
  const x1 = Math.min(surface.width, Math.round(x + w));
  const y1 = Math.min(surface.height, Math.round(y + h));
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) blend(surface, px, py, color, alpha);
  }
}

/** Rectangle outline drawn inside the given box, `weight` pixels thick. */
export function strokeRect(
  surface: Surface,
  x: number,
  y: number,
  w: number,
  h: number,
  color: Rgb,
  weight = 2,
  alpha = 1,
) {
  fillRect(surface, x, y, w, weight, color, alpha);
  fillRect(surface, x, y + h - weight, w, weight, color, alpha);
  fillRect(surface, x, y, weight, h, color, alpha);
  fillRect(surface, x + w - weight, y, weight, h, color, alpha);
}

/** Stamp a filled disc into the supersampled mask. */
function disc(mask: Uint8Array, mw: number, mh: number, cx: number, cy: number, r: number) {
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(mw - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(mh - 1, Math.ceil(cy + r));
  const rr = r * r;
  for (let y = y0; y <= y1; y++) {
    const dy = y + 0.5 - cy;
    for (let x = x0; x <= x1; x++) {
      const dx = x + 0.5 - cx;
      if (dx * dx + dy * dy <= rr) mask[y * mw + x] = 255;
    }
  }
}

export type TextOptions = {
  /** Left edge, or the right edge when `align` is "end". */
  x: number;
  /** Top of the cap line. */
  y: number;
  /** Nominal font size in pixels, the same number an SVG `font-size` would take. */
  size: number;
  color?: Rgb;
  alpha?: number;
  align?: "start" | "end";
  /** Stroke thickness as a fraction of the size. Heavier reads as bold. */
  weight?: number;
};

/**
 * Draw `text` onto the surface. Returns the width it occupied, so a caller can lay out a row of
 * runs without measuring twice.
 */
export function drawText(surface: Surface, text: string, options: TextOptions): number {
  const { x, y, size, align = "start" } = options;
  const color = options.color ?? { r: 255, g: 255, b: 255 };
  const alpha = options.alpha ?? 1;
  const chars = [...stampable(text)];
  const width = chars.length * ADVANCE * size;
  if (!chars.length || size <= 0) return width;

  const left = align === "end" ? x - width : x;
  const scale = (CAP * size) / 10;
  const stroke = Math.max(0.9, (options.weight ?? 0.085) * size);
  // The mask spans the run plus a stroke of slack, since a glyph's descender and its round caps
  // both reach past the nominal box.
  const pad = Math.ceil(stroke + 2);
  const mw = Math.ceil(width * SS) + pad * 2 * SS;
  const mh = Math.ceil(size * 1.25 * SS) + pad * 2 * SS;
  const mask = new Uint8Array(mw * mh);
  const r = (stroke / 2) * SS;
  const step = Math.max(0.5, r / 2);

  chars.forEach((char, index) => {
    const paths = PATHS[char];
    if (!paths) return;
    const ox = (index * ADVANCE * size + pad) * SS;
    const oy = pad * SS;
    for (const line of paths) {
      for (let i = 0; i < line.length; i++) {
        const [ux, uy] = line[i] as [number, number];
        const px = ox + ux * scale * SS;
        const py = oy + uy * scale * SS;
        disc(mask, mw, mh, px, py, r);
        if (i === 0) continue;
        const [pux, puy] = line[i - 1] as [number, number];
        const qx = ox + pux * scale * SS;
        const qy = oy + puy * scale * SS;
        const dist = Math.hypot(px - qx, py - qy);
        for (let t = step; t < dist; t += step) {
          const k = t / dist;
          disc(mask, mw, mh, qx + (px - qx) * k, qy + (py - qy) * k, r);
        }
      }
    }
  });

  // Box filter the mask down to device pixels and blend the result in one pass.
  const area = SS * SS;
  for (let dy = 0; dy < mh / SS; dy++) {
    for (let dx = 0; dx < mw / SS; dx++) {
      let sum = 0;
      for (let sy = 0; sy < SS; sy++) {
        const row = (dy * SS + sy) * mw;
        for (let sx = 0; sx < SS; sx++) sum += mask[row + dx * SS + sx] ?? 0;
      }
      if (sum === 0) continue;
      blend(surface, Math.round(left - pad) + dx, Math.round(y - pad) + dy, color, (sum / 255 / area) * alpha);
    }
  }

  return width;
}
