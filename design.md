# GeoCliks — Design System

Field-proof photo documentation. The aesthetic is **industrial evidence tooling**: dark graphite
surfaces, safety-amber accents, monospaced metadata, verified-green proof states. It should feel
like equipment, not like a SaaS brochure.

## Brand

- Name: **GeoCliks**
- Mark: an amber wireframe Earth globe — sphere edge, two parallels and a meridian ellipse — with a solid amber location pin standing on it, the pin head an ink aperture: "geo" + "click". No tile or container behind it; the globe is the shape. Small sizes (favicon 16-64px) use an optically simplified variant: a solid amber sphere with the graticule and pin knocked out in ink, because 1.6px strokes collapse under downscaling. Source SVG lives in `packages/web/src/web/components/logo.tsx`; derived assets: `packages/web/public/{favicon.ico,icon-192.png,icon-512.png,apple-touch-icon.png,og-image.png}` and `packages/mobile/assets/{icon.png,splash-icon.png,adaptive-icon.png,favicon.png}`.
  Rendered as SVG in `components/logo.tsx` (web); the same shape is the favicon
  (`public/favicon.ico`, `icon-192/512.png`, `apple-touch-icon.png`) and the OG card
  (`public/og-image.png`, 1200×630).
- Wordmark: `GEOCLIKS` in Sora 800, tight tracking, with the mono kicker `FIELD EVIDENCE` beneath.
- Voice: short, declarative, field-crew direct. "Proof of work that holds up." No exclamation marks.

## Color

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0B0E13` | page base (dark) |
| `--ink-2` | `#11161E` | raised surface / card |
| `--ink-3` | `#1A212C` | hover surface, inputs |
| `--line` | `#242E3C` | hairline borders |
| `--amber` | `#FFB021` | primary accent, CTA, active state |
| `--amber-deep` | `#E08A00` | pressed CTA, gradients |
| `--verified` | `#1FC16B` | verified/synced proof state |
| `--alert` | `#FF5A47` | tamper / failure / destructive |
| `--sky` | `#48A9FF` | GPS + map accents |
| `--fog` | `#8C9AAD` | secondary text |
| `--chalk` | `#E8EDF4` | primary text on dark |
| `--paper` | `#F7F8FA` | light-mode base (dashboard tables) |

Rules: amber is for action and emphasis only — never large fills. Verified-green only ever means
"cryptographically verified". Never use purple, never gradient-on-white.

## Typography

- Display: **Sora** (600/700) — headlines, section titles, numbers. Tight tracking (-0.02em).
- Body: **Manrope** (400/500/600) — paragraphs, UI labels.
- Metadata: **JetBrains Mono** (400/500) — timestamps, coordinates, photo codes, hashes.
  Every piece of evidence metadata renders in mono. This is the signature of the product.
- Scale: 12 / 13 / 14 / 16 / 18 / 22 / 28 / 36 / 48 / 64. Line height 1.5 body, 1.05 display.

## Layout

- Dark, dense, instrument-panel feel. 12-col grid, 1200px max content, generous vertical rhythm
  (96–128px section padding on marketing pages).
- Marketing page breaks the grid: offset photo-evidence cards overlapping section edges, rotated
  slightly (-1.5deg / +1deg), stacked like printed photos on a job trailer table.
- Dashboard: fixed 248px left rail, sticky toolbar, content grid of evidence cards.
- Backgrounds: blueprint grid pattern (1px lines at 4% opacity, 32px cells), radial amber glow
  behind hero, subtle noise overlay. Map areas use a dark topographic hatch.

## Components

- **Evidence card**: photo with a bottom metadata strip — mono timestamp, lat/lng, address,
  project chip, and a verified badge. Corner-cut (clip-path) top-right at 14px to read as
  "stamped". Border `--line`, radius 10px, no drop shadows on dark; use inner 1px highlight.
- **Watermark overlay** (mobile capture + rendered photos): semi-opaque black slab, amber left
  border 3px, three mono lines (time / coords / address) plus optional logo and project name.
  Four templates: `classic`, `compact`, `detailed`, `branded`.
- **Verified chip**: green dot + `VERIFIED` in mono 11px uppercase, letter-spacing 0.12em.
- **Buttons**: primary = amber fill, ink text, radius 8px, 44px tall, 600 weight, no shadow.
  Secondary = transparent with `--line` border. Ghost = text + amber underline on hover.
- **Tables**: mono for values, `--fog` uppercase 11px headers, row hairlines only.
- Radius: 8px controls (buttons, tabs, chips, inputs, small thumbs), 12px cards / panels /
  sheets / chat bubbles, 6px micro-badges. User photos and avatars are 12px rounded squares,
  never circles. Left square on purpose: the burned-in evidence stamp, QR codes and the
  verified photo frames (web `evidence-card.tsx`, mobile `photo-detail.tsx` frame and the
  Teamspace photo card). Still circular on purpose: the camera shutter and its overlay
  buttons, the recording dot, and the video play-button overlays. The `cut-corner` chamfer
  is retired.

## Motion

One orchestrated page-load per route: staggered 60ms fade-up reveals (16px translate) via the
`motion` library. Hero evidence cards settle into their rotation. Capture button uses a 120ms
scale press. No parallax, no scroll-jacking, no looping animations.

## UX patterns

- Metadata is never hidden: every photo view shows time, coordinates, address, photo code.
- Offline is first-class: a persistent queue banner shows pending uploads and retries silently.
- Destructive actions confirm inline, not in modals.
- Empty states explain the next action in one sentence with a single primary button.
- Mobile: one-thumb reachable capture UI, bottom tab bar, big 72px shutter.

## Map styling
Google Maps uses legacy JSON styling that mirrors the palette: geometry `#11161E`, water `#080B10`,
roads `#1A212C`/`#2A3444`, labels `#8C9AAD`, POI + transit off. Pins are amber `#FFB021` teardrops
with an ink `#0B0E13` stroke; crew route lines are dotted amber, one per photographer per day.
