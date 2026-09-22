# Help Center — last two locales: tl (Tagalog) and ar (Arabic)

9 of 11 locales have full catalogs. Remaining: `tl`, `ar` (priority order had them last).
`ar` is RTL; `<html dir>` is already set globally by `packages/web/src/web/lib/i18n.tsx`, so no layout work.

## Conventions (from vi/, zh/ etc.)
- `slug`, `icon`, and every `see(...)` ref stay in English — they are URLs/keys.
- `title`, `summary`, section titles, all body copy: translated.
- `keywords`: translated terms PLUS the original English ones kept, so English search still hits.
- Product nouns stay recognizable: GeoCliks, Teamspace (translated per locale as the other 8 do),
  PDF/Excel/ZIP/KMZ, App Store, Google Play, geocliks.com.
- No dollar amounts in help copy (prices live in /admin/plans) — do not introduce any.

## Files per locale (8 + index.ts)
getting-started, mobile-app, teamspace, delivery-routes, verify, plans-billing, troubleshoot, legal

## Progress

- [x] tl/getting-started
- [x] ar/getting-started
- [x] tl/mobile-app
- [x] ar/mobile-app
- [x] tl/teamspace
- [x] ar/teamspace
- [x] tl/delivery-routes
- [x] ar/delivery-routes
- [x] tl/verify
- [x] ar/verify
- [x] tl/plans-billing
- [x] ar/plans-billing
- [x] tl/troubleshoot
- [x] ar/troubleshoot
- [x] tl/legal
- [x] ar/legal
- [x] tl/index.ts + ar/index.ts
- [x] wire both into content/index.ts CATALOGS
- [x] typecheck + lint
- [x] browser-verify /help in tl and ar (incl. RTL)
- [ ] commit + push

All 11 locales now carry 8 categories and 59 articles each, and `assertHelpIntegrity()`
passes across the set. Search was checked with English keyword queries in both new locales
(the English terms kept in every `keywords` array) and with native Arabic queries.
One layout fix fell out of shipping Arabic: the Help search box pinned its magnifier to the
left, which strands it opposite the caret in RTL. It now uses logical start/padding.
