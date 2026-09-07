# GeoCliks build — progress

Stack: managed template (Bun/Vite/React/Hono/Drizzle/Expo/Electron) at /home/user/geocliks
Design: /home/user/geocliks/design.md (dark graphite + safety amber, Sora/Manrope/JetBrains Mono)

## Done
- [x] app_init, design.md, deps (better-auth, managed-auth, s3, motion, jszip, pdf-lib, exceljs)
- [x] 18 sample field photos in packages/web/public/images/samples/
- [x] API: auth.ts, schema (11 tables + auth) pushed, lib/{ids,s3,media,verify,plans,exports},
      middleware/auth (orgProc auto-provision + roles)
- [x] API routes: orgs, team, projects, photos, upload, share, reports, billing, demo (seed)
- [x] web foundation: index.html fonts/meta, styles.css tokens+utilities, lib/auth, lib/api, main.tsx
- [x] web queries: orgs, projects, photos, team, share, reports, billing, demo
- [x] web components: logo, protected-route, empty-state, stat-tile, watermark-preview,
      evidence-card, dashboard-shell
- [x] pages: index (marketing landing), sign-in

## Next
- [x] pages: app (teamspace feed), projects, project detail, map, compare, reports, share links,
      team, templates, billing, /share/:token public view
- [x] app.tsx routes + ProtectedRoute wiring, demo.seed on first /app load
- [x] mobile: expo install deps, lib/auth+api+queue, theme, app.json, _layout extend (fonts+gate),
      sign-in + auth/callback, tabs: capture / queue / teamspace / projects / settings
- [x] desktop: geocliks:savePackage IPC + preload bridge + "Save to folder" button in app-reports
      gated by useDesktop()
- [x] verify: lint clean, typecheck clean, build clean
- [x] dev servers running: web 4200, mobile 4300, desktop 4400 (electron under xvfb)

## Notes
- Electron binary in node_modules shipped incomplete; re-extracted from ~/.cache/electron zip and
  wrote path.txt (no trailing newline). Desktop dev must run under xvfb + WEBSITE_URL.

## Decisions
- "Network-verified time": server timestamp at upload + clock skew vs device; skew > 5min => unverified.
- Tamper detection: SHA-256 of bytes + HMAC over canonical metadata + append-only photoEvents.
- One workspace per user, auto-provisioned in orgProc on plan `business` (zero onboarding).
- Demo photos are public /images/samples keys; photoUrl()/exports branch on leading "/".
- Exports built server-side, stored in Tigris, returned as presigned GET URLs.
- Plan gating centralized in api/lib/plans.ts limits, enforced with PAYMENT_REQUIRED errors.

## Operator admin console (/admin)
- [x] schema: plans, staff, userStatus, adminEvents, impersonations, subscriptions (db:push applied)
- [x] api/lib/plans.ts rewritten as DB-backed registry (syncPlans/loadPlans/allPlans/visiblePlans,
      priceCents + priceLabel, sync planOf() over in-memory cache)
- [x] middleware/auth.ts: staffProc, ensureSeedStaff (PLATFORM_SUPERADMIN_EMAIL), staffRoleOf,
      assertNotSuspended, impersonation grants (x-geocliks-impersonate, 1h), logAdmin;
      authed now exposes { user, actor, impersonating }
- [x] routes: admin-overview (me/overview/events), admin-users (list/setStaff/setSuspended/remove/
      impersonate/workspaces/setWorkspacePlan/workspaceMembers), admin-plans (list/update/create/
      setVisible/remove)
- [x] web: /admin, /admin/users, /admin/workspaces, /admin/plans behind StaffRoute + AdminShell
      (alert-red accent), impersonation banner in DashboardShell, queries/admin.ts, lib/impersonate.ts
- [x] billing.changePlan accepts any plan id; marketing + billing pages read priceLabel/period
- [x] fixes found while verifying: sign-in.tsx was missing the setAuthToken import (signup/sign-in
      threw), admin user list fanned out one row per membership (now one row per account),
      orgProc provisioning made race-safe with deterministic org_/mem_ ids + onConflictDoNothing
      (parallel first-load queries used to create duplicate workspaces)
- [x] verified in browser: 403 gate for non-staff, overview totals/MRR, plan price edit propagating
      to / and /app/billing, custom plan create, impersonate + stop impersonating
- [x] lint clean, typecheck clean, build clean; test data rolled back (plus back to $12, test plan
      and test staff row removed)

### Payments (Autumn) — wired
- `autumn-js@1.2.28` in packages/web, `atmn@1.1.8` at root, `AUTUMN_SECRET_KEY` in root `.env`.
- `packages/web/scripts/gen-autumn-config.ts` generates the root `autumn.config.ts` from the DB
  `plans` table. Workflow after any price/limit edit in /admin/plans: `bun run autumn:push`
  (= `autumn:config` + `bunx atmn push -y`). The `--env-file=../../.env` in the script is required.
- Plans with `priceCents < 0` or no `autumnPlanId` (Enterprise) are skipped — contact-sales only.
- The free plan is generated WITHOUT `autoEnable`: the Autumn account rejected a second default
  product. The app already treats "no subscription" as free, so nothing is lost.
  Note: the push deleted a pre-existing Autumn product `time_stamp` (it was the old default).
- `api/auth.ts`: `autumn()` Better Auth plugin (endpoints under `/api/auth/autumn/*`) +
  `databaseHooks.user.create.after` → `autumnSdk.customers.getOrCreate`.
- `web/components/provider.tsx`: `<AutumnProvider useBetterAuth>` inside QueryClientProvider.
- `web/pages/app-billing.tsx`: paid plans call `attach({ planId: plan.autumnPlanId, successUrl:
  /app/billing?checkout=success })`; free stays on `billing.changePlan`; Enterprise → mailto.
  On `?checkout=success` it calls `billing.syncProcessor` once and cleans the URL.
- `billing.syncProcessor` (owner only) reads the Autumn customer, picks the highest-priced active
  subscription, maps `autumnPlanId` → plan, writes `organizations.plan` + upserts a `subscriptions`
  row (`provider: "autumn"`, externalId, status, currentPeriodEnd, seats).
- Mobile stays read-only for billing (no autumn-js there).
- Verified: lint + typecheck (3/3) + build clean; `/api/auth/autumn/attach` responds (400 on empty
  body, i.e. registered); /app/billing renders current plan + usage + plan grid signed in.
- Untested end-to-end: the actual Stripe checkout redirect (needs a real card in the live/sandbox
  Autumn env). Everything up to the redirect is wired.

## Logo mark update (map contour)
- Replaced the amber cut-corner tile in `LogoMark` (`packages/web/src/web/components/logo.tsx`) with a solid amber map-contour (island/landmass) silhouette; the location pin is knocked out of it in ink and the pin head is an amber aperture. No container behind the mark.
- Candidates rendered and compared at 160/40/18px in /tmp/brand/mark2.html — picked the plain island contour (C1) because strokes-based contour rings mushed at favicon sizes.
- Regenerated all derived assets from the new mark: web `favicon.ico` (16/32/48/64), `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `og-image.png` (1200x630); mobile `icon.png`, `splash-icon.png`, `adaptive-icon.png`, `favicon.png`.
- design.md "Mark:" bullet rewritten. lint + typecheck (3/3) + build all clean; landing header verified visually.

## Logo mark v3 — Earth globe
- `LogoMark` is now an amber wireframe Earth globe (sphere edge + two parallels + meridian ellipse) with a solid amber pin standing on it, pin head knocked out in ink.
- Candidates compared at 160/40/18px in /tmp/brand/globe.html: solid globe with knocked-out graticule, globe with continent shapes, wireframe globe + pin. Wireframe won on globe legibility.
- Small-size exception: `favicon.ico` (16-64) and mobile `favicon.png` use /tmp/brand/icon-small.html — a solid amber sphere with graticule + pin knocked out — because 1.6px strokes mush below 32px. Larger assets (icon-192/512, apple-touch, og-image, mobile icon/splash/adaptive) use the wireframe.
- design.md Mark bullet updated. lint + typecheck (3/3) + build clean; landing header verified.

## Google Maps integration (this session)

- Key: `VITE_GOOGLE_MAPS_API_KEY` (web) in root `.env`. (SUPERSEDED 2026-09-05: `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` was never read by code and has been deleted — see "Maps key swap" section below.)
  Mobile native also needs it in `packages/mobile/app.json` → `android.config.googleMaps.apiKey`
  and `ios.config.googleMapsApiKey` (now committed there).
- Web: `@vis.gl/react-google-maps` + new `src/web/components/evidence-map.tsx`
  (`EvidenceMap`, `MapPin`). Legacy JSON `styles` (ink/amber dark palette) so no Cloud `mapId`
  is needed — hence legacy `<Marker>`, not `AdvancedMarker`.
  Route lines: one dotted amber polyline per photographer per day, in capture order.
  Used on `/app/map` (560px + Route toggle), `share-view` (360px), `app-project` Site card (200px).
- API: `photos.map` now also returns `userId` + `userName` (leftJoin on user) for route grouping.
- Mobile: `components/field-map.native.tsx` (react-native-maps, PROVIDER_GOOGLE, customMapStyle
  mirroring the web palette, amber markers + dashed per-crew polylines) with `field-map.tsx` as the
  web fallback panel (react-native-maps has no browser build). New `app/(tabs)/map.tsx` screen +
  6th "Map" tab. New `useMapPins()` in `queries/photos.ts`.
- Bugs fixed while verifying:
  - `new Map()` inside `RouteLines` resolved to the imported `<Map>` component from
    @vis.gl/react-google-maps → "Map is not a constructor" blanked the page. Import is now
    `Map as GoogleMap`.
  - Pre-existing crash on `/app/projects/:id`: the page read `row.member.userId` but `team.list`
    returns flattened member rows → now `row.userId` / `row.id`.
- Verified visually: `/app/map` (tiles, 27 amber pins, dotted route legs, Route toggle,
  coordinate log) and the 200px project mini-map. Mobile map NOT seen rendered — the Expo web
  preview shows the fallback panel by design and the preview is stuck on sign-in.
- Cost note: Maps JS API bills per map load and public share links are unauthenticated —
  restrict the key by HTTP referrer.

## Photo drawer capture-location map (2026-08-30)
- PhotoDrawer now renders an EvidenceMap (single pin, showRoute=false, h-220px) directly under the Verification record, with a mono "Capture location · <coords>" caption; falls back to a "No GPS fix recorded for this capture" line when lat/lng are null.
- Gotcha: the Vite dev server was serving a stale transform of photo-drawer.tsx (HMR lost the edit). Verified by curling http://localhost:4200/src/web/components/photo-drawer.tsx and grepping for EvidenceMap; fixed by killing the web session, rm -rf packages/web/node_modules/.vite and restarting bun run dev.
- Visually verified in /tmp/drawer_map.png: dark ink Google tiles, amber pin at 30.22990 N / 97.79920 W inside the drawer.
- lint / typecheck / build all clean.

- Follow-up (2026-08-30): the drawer map is shared, so Teamspace (/app), Map (/app/map) and Project pages all get it. Root cause of "no map showing" was Google Maps initialising while the drawer was still animating in at zero size -> nothing painted. Fixed inside FitBounds in evidence-map.tsx: a ResizeObserver on map.getDiv() plus a 250ms settle timer both trigger google.maps.event.trigger(map,"resize") and re-fit. Visually verified in /tmp/ts_drawer.png (Teamspace) and /tmp/map_drawer2.png (Map). lint/typecheck/build clean.

## Capture screen layout (2026-08-30)
- Shutter button moved out of the scrolling controls: it now sits directly under the viewfinder, above PROJECT / EVIDENCE TYPE / GPS. Status text sits beside/below the shutter in the same row.
- Stamp overlay lowered and shortened so it stops covering the frame: viewfinder stampSlot is now flush to the bottom edge (paddingHorizontal 0, paddingBottom 0) and the Stamp renders with compact, which puts the street address on a single line (components/stamp.tsx now renders the address in compact mode with numberOfLines=1 instead of hiding it).
- controls marginTop 14 -> 6 to absorb the extra row.
- lint / typecheck / build clean. NOT visually verified on device: the Expo web preview is still stuck on the sign-in screen (mobile auth issue), so no screenshot of the new layout exists.

- Revision (2026-08-30): per the annotated screenshot, the stamp overlay is no longer drawn on top of the camera preview at all. It was removed from inside the viewfinder and now renders as a full block (non-compact, address on 2 lines) directly BELOW the yellow shutter button: stampSlot is now { marginHorizontal: 16, marginTop: 12 }. Viewfinder shows only the live feed + amber corner reticle.
- Capture screen: stamp panel moved below the PROJECT pills (above EVIDENCE TYPE); stampSlot margin simplified to marginTop 4 since ScrollView already pads 16.
- Capture screen: added a 'Location' chip to the EVIDENCE TYPE grid (after Departure, location icon, amber when active). It is a view toggle, not a photo tag — tapping it reveals the stamp/location panel directly under the grid (showLocation state). Panel is hidden by default.
- Mobile: added components/photo-detail.tsx (PhotoDetail modal — image + burned-in stamp overlay, integrity/tag/project chips, note, verification record, single-pin FieldMap + coords caption, chain of custody, Re-verify seal). Wired into Teamspace (card is now a Pressable) and Field Map (coordinate-log row press + map pin onSelect). New usePhoto(id) hook in queries/photos.ts.

## Light map restyle (2026-08-31)
- `MAP_STYLES` in `packages/web/src/web/components/evidence-map.tsx` and `MAP_STYLE` in
  `packages/mobile/components/field-map.native.tsx` replaced with a matching light palette
  (geometry #F4F6F9, roads #FFFFFF, water #CFE2F3, highways #FFE7BC, POI/transit labels off).
- Route polylines switched from amber #FFB021 to amber-deep #E08A00 for contrast on white.
- Pins, dark caption chips and the no-key/no-pins fallback panels intentionally unchanged.
- Verified visually on /app/map and inside the web photo drawer. Mobile native map not
  screenshot-verifiable (Expo web preview renders the fallback panel).

## NEW SCOPE (2026-08-31) — three features, answered in the form
1. **Video mode** — swipeable bottom mode strip on Capture (Reports · Video · Photo · Clock · Check-in,
   like the Timemark screenshot). Clips carry burned-in stamp + same verification seal as photos.
   30 s cap on Free, 3 min on paid. Free plan gets video for a 3-day trial only.
2. **Theme** — light/dark, LIGHT IS DEFAULT. Workspace admin sets the default (`organizations.theme`),
   each member can override on the app they use (device-local, not synced).
3. **i18n** — 11 locales everywhere (web + mobile): en, fr-CA, es, pt-BR, de, it, zh, vi, tl, ar (RTL), pl.
   `organizations.locale` = workspace default, device-local member override.

### Phase 1 — theme (IN PROGRESS)
- [x] `packages/web/src/web/styles.css` rewritten: palette now resolves through `--c-*` vars,
      light values in `:root`, dark under `[data-theme="dark"]`. Utility names (ink/ink-2/ink-3/
      line/fog/chalk) unchanged so no component had to be touched. `dark:` variant re-pointed to
      `[data-theme="dark"]`. blueprint/scan-lines/pulse textures var-ified too.
- [x] schema: `organizations.theme` + `organizations.locale`; db:push applied.
- [x] `api/lib/locales.ts` — LOCALE_CODES/LOCALES/asLocale/isRtl.
- [x] `orgs.setAppearance` (admin only).
- [x] `web/lib/theme.tsx` — ThemeProvider + useTheme + useWorkspaceTheme, override in
      localStorage `geocliks.theme`; mounted in `components/provider.tsx`.
- [ ] toggle in DashboardShell (Sun/Moon imported, useTheme imported — button not added yet)
- [ ] admin "Appearance" card (workspace default) on the Team page
- [ ] mobile: real light palette in `constants/theme.ts`, ThemeProvider + AsyncStorage override,
      replace the 6 direct `Colors.dark` uses
- [ ] visual check of light theme on landing + /app + /app/map + share view

## Phase 1 — Theme (light/dark) — DONE 2026-08-31
- Web: styles.css palette now token-driven (`--c-*`), `[data-theme]` switch; `lib/theme.tsx` provider (device override in localStorage `geocliks.theme` layered over workspace default, light = default); toggle in dashboard sidebar; Appearance card in /app/team (device choice + Auto + admin-only workspace default).
- Mobile: `Colors.light` is a real light palette; `lib/theme.tsx` provider (AsyncStorage `geocliks.theme`); `useColors()` now follows app theme not OS; `_layout.tsx` wrapped in ThemeProvider, StatusBar + splash theme-aware; Appearance card in Settings.
- API: `organizations.theme` + `organizations.locale` columns (db:push applied), `orgs.setAppearance` (admin+), `api/lib/locales.ts` with the 11 locales.
- Kept dark on purpose: burned-in stamp, mono caption chips over map tiles.
- Verified: lint + typecheck + build clean; screenshots of landing, /app, /app/map, /admin (light + dark) and mobile Settings (light + dark).

## Phase 2 — Video mode (clients) — DONE 2026-08-31
- Mobile capture screen rebuilt with the swipeable bottom mode strip: Reports · Video · Photo · Clock · Check-in (Photo default).
  - Video mode: CameraView mode="video", recordAsync({maxDuration}) with a live REC mm:ss / cap timer, red record/stop button, stamp overlay stays visible while recording.
  - Clock / Check-in: arrival + departure one-tap capture buttons. Reports routes to Teamspace.
  - Web preview queues /media/sample-clip.mp4 (generated with ffmpeg) since expo-camera cannot record in the browser.
- Queue (lib/queue.ts): QueuedPhoto gained kind + durationMs; video uploads go through upload.presignVideo with video/mp4.
- Mobile queries: useVideoPolicy(); policy copy shows plan, clip cap, trial days left, and whether the server burns the stamp.
- Web playback: PhotoDrawer renders <video controls poster>; EvidenceCard shows posterUrl with a play badge + duration chip.
- Mobile PhotoDetail plays clips with expo-video (expo-video@3.0.16 installed via expo install).
- Exports: stillKey()/mediaName() helpers — PDF/KMZ embed the poster frame for clips, ZIP stores the .mp4.
- /admin/plans limit editor now edits videoMaxSeconds + videoTrialDays.
- DB backfill: existing plans rows had no video limits, so business fell back to 30s/3-day trial and reported "trial expired". Backfilled limits (free 30/3, paid 180/0) and the video feature line; restarted the web server so the in-memory plans cache reloaded. Verified on screen: "Business — clips up to 03:00. Stamp is burned into the video pixels on upload."
- lint + typecheck + build clean.
- NOT verified: native recording and native playback (no camera/recorder in the Expo web preview), and Stripe checkout.

## Phase 3 — i18n (light sweep) — DONE 2026-08-31
Two-level preference, same shape as theme: device override (localStorage / AsyncStorage `geocliks.locale`) over `organizations.locale`, falling back to `en`. Missing keys fall back to the English string.

11 locales: English, Français (Canada), Español, Português (Brasil), Deutsch, Italiano, 中文, Tiếng Việt, Tagalog, العربية, Polski.

Files:
- `packages/web/src/api/lib/locales.ts` — LOCALE_CODES / LOCALES / asLocale / isRtl. `orgs.setAppearance` already accepts `locale`.
- `packages/web/src/web/i18n/*.ts` — 11 catalogs (~100 keys: nav, shell, common, appearance, language, signin, teamspace, evidence, tabs, capture, settings).
- `packages/web/src/web/lib/i18n.tsx` — I18nProvider / useLocale / useT / useWorkspaceLocale; sets `<html lang>` + `dir` (RTL for ar).
- `packages/mobile/i18n/*` — same catalogs + a hand-copied `locales.ts` (Metro cannot import runtime code out of packages/web — keep the two in sync).
- `packages/mobile/lib/i18n.tsx` — same API; RTL via I18nManager.forceRTL (needs an app reload on native).

Translated surfaces: web dashboard shell + sidebar nav + theme toggle + sign out + impersonation banner; web `/app/team` Appearance + new Language card (this-browser select + admin workspace default); mobile tab bar (6 tabs); mobile Settings appearance + new Language card + sign out; mobile capture screen (title CAPTURE/RECORD, mode strip Reports·Video·Photo·Clock·Check-in, Stamp chip, video plan note).

### Plan copy localization — DONE 2026-08-31
Plan names, price labels, periods, taglines and feature bullets are now localized in all 11 languages.

Approach: server-side, **no schema change**, so the DB `plans` table stays the single source of truth
and Autumn/Stripe keeps seeing the English ids and USD amounts.
- NEW `packages/web/src/api/lib/plan-copy.ts` — `PlanCopy`, `PLAN_COPY` (4 plans x 10 non-English
  locales: name/period/tagline/features), `CUSTOM_LABEL` (per-locale "Custom" for `priceCents < 0`),
  `localizePlan(plan, locale)`.
  - `name` / `period` / `tagline` are only substituted when the DB value still equals the shipped
    `DEFAULT_PLANS` value → operator edits in /admin/plans always win.
  - **Feature bullets are translated one by one** through a derived `FEATURE_COPY` dictionary
    (English bullet → translated bullet, zipped from the defaults). Needed because the live
    business/enterprise rows carry an extra 6th bullet ("Verified video up to 3 minutes"), which made
    a whole-array equality guard fail — caught by screenshot, not by types. Unknown bullets stay as typed.
  - `priceLabel` recomputed with `Intl.NumberFormat(locale, {currency:"USD"})` → `$29` in en,
    `$US 29` in ar/fr-CA. `priceCents`, `limits` and `autumnPlanId` are never touched.
  - Tier names: `Free` translated everywhere; **`Plus` kept as a product name** in Latin-script
    locales (`Plus 版` zh, `بلس` ar); `Business`/`Enterprise` translated only where it reads
    naturally (zh 商业版/企业版, ar الأعمال/المؤسسات, vi Doanh nghiệp/Tập đoàn, es+pt Empresas/Corporativo,
    fr-CA Affaires/Entreprise, pl Firma) — keeping the English word in de/it/tl is deliberate.
- `api/routes/billing.ts` — `plans` and `current` both take optional `{locale}` and map through
  `localizePlan`.
- `queries/billing.ts` — `usePlans(locale)` / `useBilling(locale)`; locale is part of the query key,
  so copy refetches on language switch. `pages/index.tsx` (Pricing) and `pages/app-billing.tsx` pass
  `useLocale().locale`.
- Mobile: no change needed — grep found no plan tagline/feature render site; mobile only shows
  `policy.data?.planName` as a chip.
- /admin/plans still edits the English source only. Editing a field there switches that field to
  English in every language (by design, so operator wording is never silently overridden).

Verified: lint 0, typecheck 3/3, build pass, web server restarted (plans cache), screenshots
/tmp/pc_home_ar2.png (landing pricing grid, all 4 cards fully Arabic incl. bullets) and
/tmp/pc_bill_ar.png (/app/billing, current plan + 4 plan cards Arabic).

### Admin console i18n — DONE 2026-08-31
The operator console is now localized in all 11 languages. 104 new `admin.*` keys added to all 11 web
catalogs and mirrored to `packages/mobile/i18n/` — catalog total **553 keys**, en/ar key parity checked.

Rewired: `components/admin-shell.tsx` (`NAV` retyped to `{href, label: TKey, icon}[]` using
`admin.nav.*`; operator-console chip + Back to workspace; `title`/`subtitle` stay props and are
translated at the call sites), `pages/admin-overview.tsx` (8 tiles, plan-mix table, newest accounts,
audit log), `pages/admin-users.tsx` (header array now `(TKey | null)[]`, all aria-label/title pairs,
`window.confirm`, suspend reason, no-match line, footnote), `pages/admin-workspaces.tsx` (usage tuple
array retyped `[TKey, string][]`, plan select + seats + Apply, error fallback),
`pages/admin-plans.tsx` (`PlanEditor` got its own `useT()`; `NumField`/`Toggle` stay dumb and are
translated at the call sites; every field label + aria-label + hint, visible/hidden/draft chips,
Create/Save, delete title ternary, confirm, footnote).

Two extra notes on /admin/plans, both localized: the new `admin.pl.i18nNote` (plan copy ships in 11
languages; editing a field here replaces the translation with the English text everywhere) and
`admin.pl.processorNote` — the processor warning is now rendered from the catalog instead of the
English string the API returns (`plans.data.processorNote` is still returned, and still gates the box).
Export format names (pdf/xlsx/zip/kmz), plan ids, `money()`/`bytes()` output and raw audit action
codes stay locale-neutral on purpose.

Verified: lint 0, typecheck 3/3, build pass, and Arabic screenshots of all four pages —
/tmp/a_ov_ar.png, /tmp/a_us_ar.png, /tmp/a_ws_ar.png, /tmp/a_pl_ar2.png (RTL layout mirrors, no raw keys).

STILL ENGLISH — only the deliberately locale-neutral surfaces remain: the burned-in stamp, the mono
caption chips over map tiles, the mono evidence/manifest sample lines on the landing page,
`formatCoords()`'s "NO GPS FIX", format names PDF/Excel/ZIP/KMZ, URLs, the support address, and the
raw `{e.action}` audit-log action codes.

### Round 4 — app pages — IN PROGRESS 2026-08-31
Batches landed (keys added to all 11 web catalogs + mirrored to `packages/mobile/i18n/`, catalog total 449 keys):
- `projects.*` / `map.*` → `pages/app-projects.tsx`, `pages/app-map.tsx`
- `project.*` → `pages/app-project.tsx`
- `compare.*` / `share.*` → `pages/app-compare.tsx`, `pages/app-share.tsx`
- `reports.*` → `pages/app-reports.tsx`
- `templates.*` → `pages/app-templates.tsx`
- `billing.*` → `pages/app-billing.tsx`
- `shareView.*` → `pages/share-view.tsx`
- `photo.*` / `event.*` → `components/evidence-card.tsx`, `components/photo-drawer.tsx`
  (`TAG_LABEL` and `EVENT_LABEL` retyped `Record<string, TKey>`; `components/watermark-preview.tsx`
  needed no change — it renders only data props and the stamp is locale-neutral by design)

- mobile: `components/photo-detail.tsx`, `app/(tabs)/map.tsx`, `app/sign-in.tsx`,
  `app/(tabs)/index.tsx` (capture screen: `TAGS` retyped `TKey`, all status/permission/hint
  strings, new keys `capture.{evidenceType,clockIn,clockOut,enableCamera,hintSeal}`)

Lint 0 / typecheck 3-3 / build pass after each batch. Screenshot-verified in `ar`:
`/tmp/r4_mob_map_ar.png`, `/tmp/r4_mob_capture_ar.png` (mobile, RTL),
`/tmp/r4_tpl_ar.png`, `/tmp/r4_bill_ar.png`. `share-view.tsx` is wired but NOT screenshot-verified
(needs a live share token).

STILL ENGLISH after this batch:
- web `components/{evidence-card,photo-drawer,watermark-preview}.tsx`
- web operator console: `components/admin-shell.tsx`, `pages/admin-{overview,users,workspaces,plans}.tsx`
- mobile `components/photo-detail.tsx`, `app/(tabs)/map.tsx`, `app/sign-in.tsx`, and the
  remaining capture-screen strings (TAGS labels, clock in/out, permission notice, bottom hint)
- ~~plan names / price labels / periods / taglines / feature bullets~~ — DONE, see the plan-copy section below
- burned-in stamp, mono caption chips over map tiles, mono evidence/manifest sample lines (locale-neutral by design)

### Round 3 — marketing landing — DONE 2026-08-31
74 new keys added to all 11 web catalogs and mirrored to `packages/mobile/i18n/`: `home.nav.*`, `home.hero.*`, `home.evidence.*`, `home.team.*`, `home.reports.*`, `home.field.*`, `home.pricing.*`, `home.footer.*` (`home.footer.sealed` takes `{year}`) and `industry.*` (10 industries). Catalog total: 226 keys.

`pages/index.tsx` fully wired — every sub-component (`Nav`, `Hero`, `Evidence`, `Teamspace`, `Reports`, `Field`, `Pricing`, `Footer`) calls `useT()` itself; `INDUSTRIES` is now `TKey[]`; `Evidence.rows`, `Reports.formats`, `Field.items` retyped with `TKey` fields.

Deliberately English: the mono evidence sample lines, the mono report manifest lines, format names (PDF/Excel/ZIP/KMZ), URLs and the support address. Plan names, price labels, periods, taglines and feature bullets on the pricing grid are DB rows in the `plans` table, so they stay English in every locale.

Verified: lint 0 errors, typecheck 3/3, build pass, key parity diff en vs ar/pl clean. Screenshots reviewed at 1280x900 — /tmp/home_ar1.png, /tmp/home_ar2.png, /tmp/home_ar3.png (full RTL Arabic landing page).

### Round 2 — page bodies — DONE 2026-08-31
52 new keys added to all 11 catalogs (extra `signin.*`, `teamspace.*` stats/filters/empty, `tag.*`, `queue.*`, `projects.*`), then mirrored to `packages/mobile/i18n/` (never overwrite the hand-written `locales.ts` there). Every catalog is typed as `Catalog`, so a missed key is a typecheck error.

Newly translated: web `pages/sign-in.tsx` (panel headline + trust line + integrity chip, welcome/create labels, Google button, or-email divider, tabs, field labels + aria-labels + placeholders, submit, auth error, privacy sentence + link), web `pages/app-teamspace.tsx` (title/subtitle, Build report, all four stat tiles + subs, capture-activity header, tag chips via TAG_LABELS, project filter + All projects, search label/placeholder, EmptyState title/hint at the call site, loading field data, "{n} photos · newest first"), mobile `queue.tsx` (title, Upload all, note, empty state, Unassigned, Waiting to upload, drain result lines), mobile `teamspace.tsx` (title, photo count, 4 stat labels, tag chips, project label + picker sheet, empty text), mobile `projects.tsx` (title, "{n} jobs").

STILL ENGLISH (not a full sweep): marketing landing `pages/index.tsx` (largest body of copy, deliberately last), the whole admin console (`pages/admin-*.tsx`, `components/admin-shell.tsx`), web `app-projects` / `app-project` / `app-map` / `app-compare` / `app-reports` / `app-share` / `app-templates` / `app-billing` / `share-view`, `components/{evidence-card,photo-drawer,watermark-preview,stat-tile}.tsx`, mobile `photo-detail.tsx` / `map.tsx` / `sign-in.tsx`, capture-screen TAGS labels, clock-in/out buttons, "Location permission off" and the bottom hint paragraph.

Verified round 2: lint + typecheck + build clean. Screenshots reviewed — /tmp/i18n2_ar_signin.png (Arabic sign-in, full RTL), /tmp/i18n2_ar_app.png, /tmp/i18n2_vi_app.png, /tmp/i18n2_vi_mob.png, /tmp/i18n2_vi_mob_queue.png, /tmp/i18n2_vi_mob_team2.png.

Deliberately locale-neutral: the burned-in stamp and the mono caption chips over map tiles, so evidence text reads identically everywhere.

Verified: lint + typecheck + build clean. Screenshots reviewed — /tmp/i18n_ar_app.png, /tmp/i18n_ar_team2.png (RTL flips the whole shell), /tmp/i18n_zh_app.png, /tmp/i18n_frca_app.png, /tmp/i18n_zh_mob_settings.png, /tmp/i18n_zh_mob_lang.png.

### Language switcher in the app chrome — DONE 2026-08-31
- `packages/web/src/web/components/language-select.tsx` — click-to-open dropdown (globe + current language, checkmark on the active one, "Follow workspace" first). Closes on outside click / Escape. Uses logical `start/end` classes so it flips correctly in RTL.
- Wired into `dashboard-shell.tsx` twice: full-width in the fixed left sidebar footer (above the theme toggle) and `compact` in the sticky top header, so it is reachable on every /app page at any width.
- `packages/mobile/components/language-menu.tsx` — header trigger (globe + locale code + chevron) opening a modal list of the 11 locales. Added to the top header of all six tabs: Capture, Queue, Teamspace, Map, Projects, Settings.
- Workspace default still lives on web /app/team and mobile Settings (admin only); the header picker is the device-level choice.
- Verified: lint + typecheck + build clean. Screenshots: /tmp/lang_web_sidebar.png, /tmp/lang_web_open.png, /tmp/lang_mob_capture.png, /tmp/lang_mob_open.png.

### Autumn processor sync + legacy product + Maps key — 2026-08-31
- `atmn` key resolution (from `dist/cli.js`): sandbox key = `AUTUMN_SECRET_KEY`, live key = `AUTUMN_PROD_SECRET_KEY`. Our `am_sk_live_…` sits in `AUTUMN_SECRET_KEY`, so the CLI *labels* every action "sandbox" while the API actually reports `Environment: live` on every product. Cosmetic label only — do not "fix" it by moving the key unless the user wants a real sandbox/prod split.
- `bun run autumn:config` regenerated `autumn.config.ts` from the DB and produced **zero diff** vs the previously pushed file. So the video-era work never needed a push: `videoMaxSeconds`/`videoTrialDays` are app-side limits only and are not emitted as Autumn features. free/plus/business in Autumn already matched the DB ($0 / $12 / $29, items identical).
- `time_stamp` (deleted by the first generated push) is **recreated**: `gen-autumn-config.ts` now emits an explicit legacy entry — id `time_stamp`, name "Time Stamp (legacy)", no price, no items, not default, not auto-enabled — so future pushes stop deleting it. Original price/features are unknown; it is a placeholder for external references, and no plan row points at it. `bunx atmn push -y` → "Plans created: time_stamp"; verified with `atmn products` (4 products) and `atmn products --id time_stamp`.
- Never run `atmn nuke` — the key is live.
- **SUPERSEDED 2026-09-05** by the single-unrestricted-key decision (see "Maps key swap" section below); kept for history. **Google Maps key restriction is a Google Cloud Console action and cannot be done from the sandbox** (no GCP credentials). Instructions given to the user: HTTP-referrer + API restrictions on the web key (`VITE_GOOGLE_MAPS_API_KEY`), and a **separate** key for mobile (`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, also in `packages/mobile/app.json`) restricted by Android package + SHA-1 / iOS bundle id, since referrer rules don't apply to native SDKs. Exposure note repeated: `pages/share-view.tsx` renders a live JS map unauthenticated, and Maps JS bills per load.
- Verified: `bun run lint` 0 violations, `bun run typecheck` 3/3, `bun run build` pass. Ports 4200/4300/4400 all listening.

### Public share links use a server-proxied static map — 2026-08-31
Why: `/share/:token` is unauthenticated, so the live Maps JS map shipped the browser key to anyone holding a link and billed a map load per view.
- `packages/web/src/api/lib/static-map.ts` — builds the Static Maps URL (key read from `GOOGLE_MAPS_SERVER_KEY`, falling back to `VITE_GOOGLE_MAPS_API_KEY`), mirrors `MAP_STYLES` in Static Maps syntax, one amber `path=` per photographer per day, max 40 markers, 5-minute in-memory byte cache, plus `placeholderSvg()`. Never throws.
- `packages/web/src/api/lib/share-map.ts` — `shareMapImage(token, url)`: validates the token (revoked/expired → 404 placeholder SVG), reads up to 120 photo coords, `scale=2` when either side exceeds Static Maps' 640px cap, `cache-control: public, max-age=300`.
- `packages/web/src/api/index.ts` — plain route `GET /api/share/:token/map.png` (image bytes, so not an oRPC procedure). Token-scoped, so it is not an open Maps proxy.
- `packages/web/src/web/pages/share-view.tsx` — `EvidenceMap` replaced by a `<figure>` + `<img src="/api/share/:token/map.png?w=1280&h=360">` with the existing `map.fixes` caption chip. No new catalog keys (alt text reuses `map.title`). The signed-in app keeps the live JS map everywhere else.
- **Blocked on Google, not on code:** the Static Maps request returns HTTP 403 "This API is not activated on your API project", so the share page currently renders the `MAP UNAVAILABLE` placeholder. Enable **Maps Static API** in the Google Cloud console and it starts working with no code change.
- Verified: lint 0, typecheck 3/3, build pass. Endpoint checked with a temporary unscoped share link (`shr_tmpmap`, deleted afterwards): 404 placeholder for a bogus token, `NO GPS FIX` placeholder for a project-scoped link whose photos have no project, `MAP UNAVAILABLE` for the real one. Screenshot reviewed: /tmp/share_static.png.

## Video upload showed a black tile — fixed (Aug 31)

Root cause: `packages/mobile/lib/queue.ts` never forwarded `kind`/`durationMs` to
`photos.create`, so every uploaded clip was registered as a still: no ffmpeg stamp pass,
no poster frame, no duration, no `processed` event. The web gallery then rendered an
`<img src="...mp4">` — a black tile. The bytes were never lost.

Fixes:
- `packages/mobile/lib/queue.ts` — passes `kind` + `durationMs` on create.
- `packages/web/src/api/routes/photos.ts` — when `burnStamp()` cannot burn, falls back to
  the new `posterFrame()` so a clip always has a thumbnail + duration; the `processed`
  event detail now distinguishes burned / overlay+poster / overlay only. `stampBurned`
  still records the truth.
- `packages/web/src/api/lib/video.ts` — new exported `posterFrame(storageKey)`.
- `packages/web/src/web/components/evidence-card.tsx` — a poster-less clip draws a dark
  tile with the play badge instead of an `<img>` pointing at an MP4.
- Repaired the two existing clips in the DB with a throwaway script (deleted after):
  both took the real ffmpeg burn-in path — stamp is in the pixels, poster frames written,
  durations 8.6 s and 12.7 s, `processed` events inserted.

Verified: lint 0, typecheck 3/3, build ok, and a screenshot of `/app` with both clips
cloned into the ops workspace shows real poster frames with the burned-in stamp, play
badge and duration. Clones deleted.
Still unverified (no native device here): recording and playback on a real phone.

## Deletes + Static Maps check (Aug 31)

Maps Static API: verified enabled — a direct `staticmap` request with the project key now
returns `200 image/png` instead of the earlier 403, so `/api/share/:token/map.png` serves a
real map on public share pages with no code change.

Delete options added:
- `photos.remove` (existing) hardened: loads the row first, members can only delete their own
  captures (admins/owners anything), deletes the `photo_events` chain, and now deletes the
  stored bytes from Tigris — the clip/still plus its poster frame. Demo photos live in the web
  bundle so their keys are skipped.
- `photos.removeMany` (new): bulk delete, max 200 ids, same per-photo permission rule,
  returns `{deleted, skipped}`.
- `projects.remove` still archives (keeps evidence). New `projects.destroy` hard-deletes the
  project folder, admin only: photos, share links, reports and comparisons are DETACHED
  (`project_id = null`) rather than destroyed, assignments deleted, then the row deleted.
  Returns how many photos were kept.
- `api/lib/s3.ts` — new `deleteObject(key)`, never throws.

UI:
- Web photo drawer: Delete now arms a confirm step with a red warning line before it fires.
- Web teamspace: Select mode — tiles become checkboxes, "{n} selected" + Delete selected.
- Web project page: Archive + Delete buttons; Delete opens an inline confirm panel that spells
  out that photos are kept, then navigates back to the projects list.
- Mobile photo detail: Delete button with the same two-tap confirm, closes on success.
- 13 new keys × 11 locales, en/ar parity verified, catalogs mirrored to mobile.

Verified: lint 0, typecheck 3/3, build ok, screenshot of the project delete confirm in Arabic RTL.
Not verified: bulk delete on a populated grid (ops workspace has no photos) and mobile delete on
a real device.

## Project delete in list views + stamp preview behind a STAMP mode (2026-08-31)

- `packages/web/src/web/pages/app-projects.tsx` — every project card now has an ARCHIVE + DELETE PROJECT footer row (outside the `<Link>`), with an inline confirm step (`confirmId`), `project.deleteConfirm` / `project.deleteHint` copy, and per-card error line. Uses `useRemoveProject()` / `useDestroyProject()`.
- `packages/mobile/queries/projects.ts` — added `useDestroyProject()`.
- `packages/mobile/app/(tabs)/projects.tsx` — trash icon per row, two-tap confirm panel (cancel / confirm), error line.
- `packages/mobile/app/(tabs)/index.tsx` — `Mode` gained `"stamp"`; mode strip now reads REPORTS · VIDEO · PHOTO · CLOCK · CHECK-IN · STAMP; the live stamp overlay renders only when `showLocation && mode === "stamp"`. Preview-only change — the burned/composited stamp on upload is untouched.
- i18n: new key `capture.mode.stamp` across all 11 web catalogs, mirrored to `packages/mobile/i18n/`. Parity verified.
- lint 0, typecheck 3/3, build ok. Screenshots: `/tmp/projlist.png`, `/tmp/cap1.png` (stamp hidden in Photo mode), `/tmp/cap2.png` (stamp shown in Stamp mode).
- Not verified here: native camera preview, mobile delete on a real device.

## Capture screen: STAMP on its own row + Evidence type dropdown (2026-08-31, follow-up)

- `packages/mobile/app/(tabs)/index.tsx`
  - `Mode` back to 5 entries; strip reads REPORTS · VIDEO · PHOTO · CLOCK · CHECK-IN.
  - New centered STAMP toggle button between the shutter and the mode strip (`stampToggleRow` / `stampToggle`), driving `showLocation` (now defaults to `false`, so the overlay is hidden until tapped).
  - Removed the old location/Stamp chip from the evidence grid.
  - EVIDENCE TYPE is now a collapsed dropdown header (`dropdownHead`) showing the selected tag + chevron; tapping expands the chip grid, picking a tag collapses it (`tagOpen`).
- Removed the now-unused `capture.mode.stamp` key from all 11 web catalogs and mirrored to `packages/mobile/i18n/`.
- lint 0, typecheck 3/3, build ok. Screenshots `/tmp/cap3.png` (collapsed) and `/tmp/cap4.png` (expanded).

## Capture screen: Project selector becomes a dropdown under Evidence type (2026-08-31)

- `packages/mobile/app/(tabs)/index.tsx` — the PROJECT label + horizontal pill strip was removed from above the evidence section and rebuilt below EVIDENCE TYPE as a matching collapsed dropdown (`projectOpen` state, `dropdownHead` / `dropdownValue` styles, briefcase icon, chevron). Header shows the selected project name or "Unassigned"; expanding reveals the Unassigned + project pills, and picking one collapses it.
- lint 0, typecheck 3/3, build ok. Screenshot `/tmp/cap5.png`.

## Capture screen: mode tab bar + Reports row (2026-08-31)

- `packages/mobile/app/(tabs)/index.tsx`
  - `Mode` is now `video | photo | clock | checkin`; `pickMode` no longer special-cases reports.
  - The swipeable strip is replaced by a bordered segmented tab bar (`modeTabs` / `modeTab`) — four equal-width tabs side by side in the same slot under the STAMP button, active tab gets an amber underline + tint.
  - REPORTS moved into the controls stack as its own row below EVIDENCE TYPE and PROJECT, styled like the dropdown heads with a chevron-forward; it routes to `/teamspace`.
- lint 0, typecheck 3/3, build ok. Screenshot `/tmp/cap6.png`.

## Reports moved inside the Evidence Type dropdown (mobile capture)
- Removed the standalone REPORTS row under the PROJECT dropdown.
- Reports is now the last chip inside the expanded EVIDENCE TYPE grid (doc icon + chevron); tapping it collapses the dropdown and pushes /teamspace.
- Evidence Type grid order: Arrival · Before · Work · After · Issue · Departure · Reports.
- lint 0 errors, typecheck pass, build pass; verified in screenshots /tmp/cap7.png (collapsed) and /tmp/cap8.png (expanded).

## CHECK-IN tab removed (mobile capture)
- CHECK-IN duplicated CLOCK (same clock-in/out buttons, same arrival tag), so the mode was deleted rather than moved.
- Mode type/MODES now: video | photo | clock. Tab bar shows VIDEO · PHOTO · CLOCK.
- Check-in as evidence is still covered by the "Arrival" chip in the EVIDENCE TYPE dropdown.
- lint 0 errors, typecheck pass, build pass; verified in /tmp/cap9.png.

## Fix: project covers + tappable project cards + settings clipping
Root cause of the blank project thumbnails: `projects.list` returned the raw Tigris **storage key** as `coverKey`,
which no client can fetch. Now the route also returns `coverUrl` — a short-lived presigned GET URL via
`photoUrl()`, preferring `posterKey` so video-only projects still show a frame.
- packages/web/src/api/routes/projects.ts — coverUrl added (poster preferred), photoUrl import.
- packages/web/src/web/pages/app-projects.tsx — img src uses coverUrl.
- packages/mobile/app/(tabs)/projects.tsx — cover uses item.coverUrl (dropped the bogus apiUrl+key resolve);
  image + body wrapped in a Pressable -> router.push /teamspace?project=<id>; added "OPEN PHOTOS >" affordance;
  delete-confirm block moved outside the pressable so the trash flow still works.
- packages/mobile/app/(tabs)/teamspace.tsx — reads ?project= param and refocuses the filter on param change.
- packages/mobile/app/(tabs)/settings.tsx — planRow wraps (columnGap/rowGap + flexShrink) so "6 PROJECTS" no longer clips.
- packages/mobile/components/stamp.tsx — new exported formatTz(date) (handles half-hour zones, e.g. UTC+5:30),
  rowTop wraps and the time text shrinks so the timestamp and UTC chip can't collide.
- i18n: added projects.openPhotos to all 11 web catalogs + mirrored to mobile (PARITY_OK).
Verified: lint 0, typecheck pass, build pass. Screenshots /tmp/wproj4.png (web covers),
/tmp/mproj.png (mobile covers + OPEN PHOTOS), /tmp/mopen.png (tap -> Teamspace filtered to Westgate),
/tmp/mset.png (plan row + stamp spacing). Temp photo rows cloned into org_MTCHLDQ826VWHFCXKD for the shots were deleted.
NOTE: the ops workspace org id is org_MTCHLDQ826VWHFCXKD (the older note said ...DUAXVP4TPQB7R — wrong).

## Settings — Appearance & Language as dropdown sections (2026-09-01)
- `packages/mobile/app/(tabs)/settings.tsx`: added `appearanceOpen` / `languageOpen` state (both collapsed by default).
- APPEARANCE and LANGUAGE plain section labels replaced with `dropdownHead` Pressables (same idiom as the Capture screen): label left, current value + chevron right, amber border when open.
  - Appearance head shows sun/moon icon + `override ?? AUTO`.
  - Language head shows language icon + active locale native name.
- Card bodies hidden via `styles.hidden` (`display:none`) when collapsed.
- New styles: `hidden`, `dropdownHead`, `dropdownValue`, `dropdownValueText`. No i18n keys needed (reused existing).
- lint / typecheck / build all pass. Verified in /tmp/mset_a.png (collapsed) and /tmp/mset_b.png (Appearance expanded).

## Video fixes + capture header (2026-09-01)
1. Teamspace grid (`packages/mobile/app/(tabs)/teamspace.tsx`): video rows rendered `<Image>` on the MP4 url → black tile. Now renders `item.posterUrl` for `kind === "video"` (icon fallback when no poster) plus an amber play badge.
2. Photo detail (`packages/mobile/components/photo-detail.tsx`): `VideoView` gets `surfaceType="textureView"` (Android SurfaceView was punching through / bleeding over the top of the screen) and `contentFit="contain"`; frame is `overflow: hidden`; the top bar's hardcoded `paddingTop: 44` replaced with `Math.max(insets.top, 12) + 10` via `useSafeAreaInsets`, Modal set `statusBarTranslucent={false}`.
3. Capture header (`packages/mobile/app/(tabs)/index.tsx`): sync chip moved to the LEFT of the language menu; `headerRight` centered with `flexShrink`, chip + chipText `flexShrink: 1` so SYNCED can no longer clip off-screen.
lint / typecheck / build pass. Verified /tmp/cap10.png (SYNCED left of EN) and /tmp/tsv1.png (video poster + play badge).
- Follow-up: the earlier `flexShrink: 1` on chip/chipText let Android squeeze the sync chip down to an empty icon box. Reverted to `flexShrink: 0` on `headerRight`/`chip`, added `headerLeft` (`flexShrink: 1, minWidth: 0, marginRight: 10`) so the title/clock shrink instead, and `numberOfLines={1}` on title, clock and chip text. Verified /tmp/cap11.png.

## Profile drawer + camera controls (capture screen)
- New `packages/mobile/components/profile-menu.tsx`: hamburger trigger + left slide-in Modal — initials avatar/name/email (→ Settings), amber UPGRADE · <PLAN> banner (→ Settings), 2x2 tiles (Projects, Teamspace, Map, Settings), "Show stamp on preview" Switch wired to the capture screen's showLocation, "Contact us" → mailto:support@geocliks.com, MY TEAMSPACE card (org name · plan · members · role → Teamspace), Sign out.
- `app/(tabs)/index.tsx`: hamburger first in the header; CameraView now takes `facing` (flip button, top-right of preview), `flash`/`enableTorch` (flash button, top-left), `zoom` from ZOOM_STEPS 1.0x/2.0x/3.0x (zoom pill, right edge); viewfinder is full-bleed (flex:1, minHeight 300, no horizontal margin), controls pane flexShrink.
- i18n: 8 new keys (profile.menu/upgrade/contact/showStamp/myTeamspace, capture.flash/flipCamera/zoom) across all 11 web catalogs, mirrored to mobile. PARITY_OK.
- Verified: lint + typecheck + build pass; /tmp/cap20.png (camera controls) and /tmp/drawer1.png (drawer open). Native flash/flip/zoom cannot be exercised in the sandbox web build.

## Profile settings screen + camera reticle removal (this session)

- NEW `packages/web/src/api/routes/account.ts` — `presignAvatar`, `updateProfile`, `destroy`
  (typed `DELETE` confirm; owner deletion removes photos+bytes, events, reports, share links,
  projects, members, org, then user rows) + helper `avatarUrl()` used by `orgs.current`.
  Avatars stored in `user.image` as a bare storage key, resolved to presigned URL on read.
- NEW `packages/mobile/queries/account.ts`, NEW `packages/mobile/app/profile.tsx`
  (avatar + change/remove photo, display name, password change, plan/upgrade, sign out, danger zone).
- `expo-image-picker@17.0.11` installed.
- Route registered in `app/_layout.tsx`; drawer identity row and UPGRADE banner now go to `/profile`.
- Removed the 4 amber corner reticle views + their styles from `app/(tabs)/index.tsx`.
- 21 `profile.*` i18n keys added to all 11 web catalogs and mirrored to mobile (PARITY_OK).
- lint + typecheck + build pass. Screenshots: /tmp/cap71.png (no reticle), /tmp/drawer71.png,
  /tmp/prof71.png, /tmp/prof73.png.

## Web PROFILE nav + mobile Upgrade fix

- NEW `packages/web/src/web/pages/app-profile.tsx` (+ `queries/account.ts`), route `/app/profile`
  in `web/app.tsx`, and a **Profile** item in the `dashboard-shell.tsx` left nav (UserCircle icon,
  label key `profile.title`, sits under Plan).
- `packages/mobile/app/profile.tsx` `openBilling()` rewritten: same-tab `location.assign` on web
  (popup blockers ate `window.open`), `WebBrowser.openBrowserAsync` on native with a
  `Linking.canOpenURL` fallback. Verified by dispatching a real press — the app navigated to
  `<apiUrl>/app/billing` (which bounces to /sign-in in a fresh browser session, expected).
- lint + typecheck + build pass. Screenshot /tmp/wprof1.png.

## Native plan picker (mobile) — shipped
- `packages/web/src/api/routes/billing.ts`: new `checkout` (orgProc, owner-only). Handles contact plans (mailto), free/current (applies locally), downgrade seat guard, then `autumnSdk.billing.attach({customerId, planId, redirectMode:"always", successUrl})` → `{kind:"checkout", url: paymentUrl}`. Processor failure returns `{kind:"unavailable"}` instead of throwing. Helpers `appOrigin()` (WEBSITE_URL) + `contactMailto()`.
- NEW `packages/mobile/queries/billing.ts` — usePlans / useBillingCurrent / useCheckout / useSyncProcessor.
- NEW `packages/mobile/app/plans.tsx` — plan cards, CURRENT chip, price + per-month, localized feature bullets, CTA (Upgrade/Downgrade/Contact us), opens the URL in `WebBrowser.openBrowserAsync` (same-tab assign on web), then calls `syncProcessor` on dismissal.
- Route registered in `app/_layout.tsx`; profile PLAN card button → `/plans` (openBilling + WebBrowser/Constants/Linking imports removed), drawer UPGRADE banner → `/plans`.
- 13 `plans.*` keys added to all 11 web catalogs + mirrored to mobile. Parity verified.
- lint / typecheck / build pass. Screenshot `/tmp/plans1.png`.
- Autumn returns 400 "There is no Stripe account linked to this organization" → connect Stripe at app.useautumn.com/dev?tab=stripe. UI shows the graceful "Checkout is not available right now" message.

## App Store IAP compliance + capture-header tweaks (2026-09-01)

**Part 2 — capture screen (verified on 4300, /tmp/cap71.png, /tmp/draw71.png)**
- Removed the date/clock line from the capture header (`app/(tabs)/index.tsx`); the 1 s `now`
  ticker stays because the burned stamp uses it.
- Hamburger icon 18 -> 26 px, larger hit padding.
- Drawer (`components/profile-menu.tsx`) rebuilt as a left-to-right slide: Animated translateX
  + backdrop fade, panel width = 75% of window width (measured 768/1024 = 0.750 in-browser),
  tap outside closes.

**Part 1 — App Store IAP (guideline 3.1.1)**
- `api/lib/iap.ts`: APPLE_PRODUCTS (`com.geocliks.plus.monthly` -> plus,
  `com.geocliks.business.monthly` -> business) + `verifyAppleJws()` — StoreKit 2 signed
  transaction verified offline: x5c chain walked, Apple Root CA - G3 SHA-256 pinned, ES256
  signature (ieee-p1363) checked, bundleId / product / expiry / revocation enforced.
  No Apple credentials needed.
- `api/routes/iap.ts`: `products` (public SKU table) + `applyApple` (owner-only, verifies,
  seat guard, writes organizations.plan/seats, upserts subscriptions with provider "apple").
  Registered in `api/index.ts`.
- `mobile/lib/purchases.ts`: lazy `require("expo-iap")` gateway — initConnection,
  fetchProducts, requestPurchase(subs) resolved through purchaseUpdatedListener,
  finishTransaction after server verification, getAvailablePurchases for restore.
  `usesAppStoreBilling()` is true only on iOS; everything else keeps the Stripe path.
- `mobile/app/plans.tsx`: on iOS paid CTAs go through StoreKit, a "Restore purchases" button
  appears, and the footer shows the Apple note instead of any Stripe/external wording.
  `mobile/app/profile.tsx` note is platform-aware too.
- 6 new `plans.*` keys in all 11 web catalogs, mirrored to mobile (parity checked).
- lint / typecheck / build all green.

**Not testable here:** StoreKit purchases need an EAS dev or TestFlight build plus the products
created in App Store Connect. Stripe is still not linked to the Autumn org, so non-iOS checkout
returns "unavailable".

## Stripe/Autumn live check + downgrade safety (this session)

- Stripe is now connected on the Autumn side. Verified end to end: `billing.attach` returns a
  real Stripe checkout URL (HTTP 200) and pressing the Plus CTA on the mobile plans screen
  navigates to `checkout.stripe.com` with zero Autumn errors in the server log. Nothing was
  paid; the ops org is still business/5 seats and `subscriptions` is still empty.
- Caveat: session ids come back as `cs_test_...` while `AUTUMN_SECRET_KEY` is a production
  Autumn key, i.e. Autumn Production is pointed at Stripe TEST mode. Swap in the `sk_live_...`
  key at Autumn -> Settings -> Stripe before taking real money.

### syncProcessor no longer silently downgrades
- `api/routes/billing.ts`: added `SUB_ENDED` (canceled/cancelled/expired/unpaid/
  incomplete_expired/ended). `syncProcessor` now only drops a workspace to free when the
  processor actually reports an ended subscription. If no active sub is found and none is
  explicitly ended, it returns `{synced:false, plan:<current>, reason:"no_subscription"|
  "inconclusive"}` and writes nothing. Previously, abandoning a checkout could knock a paid
  workspace back to free.
- `mobile/app/plans.tsx`: a non-synced result after the checkout browser closes now flashes
  `plans.checkoutPending` instead of the misleading `plans.unavailable`.
- New key `plans.checkoutPending` in all 11 web catalogs, mirrored to mobile (parity checked).
- lint / typecheck / build all green.

**Open risk:** with downgrades deferred to the processor, a cancellation only lands when a
later `syncProcessor` call sees an ended status. There is no Autumn/Stripe webhook route in
this app today, so cancellations are not pushed in real time.

## Billing webhook + signed-in routing (this session)

- New `api/lib/billing-sync.ts` — `applyProcessorState({orgId, customerId, currentPlan, currentSeats})`
  holds the single copy of the processor->workspace mirror (SUB_ACTIVE / SUB_ENDED, no-downgrade-
  on-silence rule, org + subscriptions write). `billing.syncProcessor` is now a thin owner-gated
  wrapper around it.
- New `api/lib/billing-webhook.ts` + `app.post("/api/webhooks/billing")` in `api/index.ts`.
  Authenticated with `BILLING_WEBHOOK_SECRET` (root .env) via `x-webhook-secret`,
  `x-autumn-secret`, `Authorization: Bearer` or `?secret=`. The payload is only used to find the
  customer id; the plan is always re-read from Autumn, so a spoofed body cannot grant a plan.
  Customer -> workspace via `organizations.ownerId`. Returns 401 bad secret, 503 if the secret is
  unset, 200 otherwise (no retry storms).
  Verified live: no secret -> 401; valid secret + ops customer -> `{"ok":true,"reason":
  "no_subscription","plan":"business"}` and the org was NOT downgraded; unknown customer ->
  `{"ok":false,"reason":"no_workspace"}`.
- Web routing: new `components/public-only-route.tsx` wraps `/` and `/sign-in`. A signed-in user
  hitting the landing page or the sign-in form is replaced to `/app` (Teamspace); sign-in and
  sign-up already navigate to `/app`. Verified in the browser: `http://localhost:4200/` landed on
  `/app` while signed in.
- Landing header CTA now uses new key `home.nav.registerFree` ("Register free") in all 11 catalogs;
  the hero CTA keeps `home.nav.startFree`. Verified in a signed-out headless render.
- lint / typecheck / build green.

**Still to do outside the app:** point Autumn's webhook at
`https://<domain>/api/webhooks/billing` and set the `x-webhook-secret` header to the
`BILLING_WEBHOOK_SECRET` value.

## 2026-09-01 — cleanup + Plus price fix
- Deleted the_installers@hotmail.com (4 orgs), Luc Test 2 (27 photos), and the 2 empty duplicate orgs of matrixicutoo@gmail.com. Tigris held no objects for any of those orgs (bucket now = 20 objects, all under org_MTCE8SRQBM81BGT9XD). Autumn customers for both users returned 404 (already gone).
- Final DB: 2 users, 2 orgs, 10 photos, 6 projects.
- Recreated ops test account: ops.admin1788258771@timemark.dev / FieldProof!42
  user sgCFWGKy3w2mMKXhoF1wP554b9YcCFpc, org org_sgCFWGKy3w2mMKXhoF1wP554b9YcCFpc, plan business/5 seats, staff stf_seed_ops superadmin.
- ROOT CAUSE of the $1,200 Plus invoice: gen-autumn-config.ts emitted `price: { amount: priceCents }`, but Autumn's amount is in DOLLARS. 500 cents -> $500... and autumn.config.ts was stale at 1200/2900 -> Stripe charged $1,200. Fixed generator to divide by 100; regenerated + `bunx atmn push -y`. Autumn live now: plus $5, business $7. Verified with a real cs_live checkout screenshot (/tmp/checkout_crop.png) showing $5.00/month.

## Permissions pass (field crews) — in progress 2026-09-02
Server DONE: orgs.templates.create/update/setDefault -> manager; projects.create -> manager;
team.remove -> owner (+doc: photos survive); account.destroy blocks role==="field".
i18n DONE: perm.managerOnly / perm.planNote / perm.templatesNote / perm.projectsNote / perm.selfDeleteNote (11 locales, mobile synced).
Web DONE: dashboard-shell nav filter, app-billing locked panel, app-profile danger zone.
Web TODO: app-templates, app-projects, app-project.
Mobile TODO: plans.tsx + settings link, settings template picker, projects.tsx create/delete, profile.tsx delete account.
Then: field-member 403 test, owner team.remove photo-count test, lint/typecheck/build, screenshots, deliver (mobile idx 0).

## Sep 3 — font-scale cap extended app-wide

- `components/app-text.tsx` now also exports `FixedText` (`allowFontScaling={false}`).
- 17 screens/components switched from react-native `Text`/`TextInput` to `@/components/app-text`
  (1.2x ceiling): (tabs) index/map/projects/settings/teamspace, join, landing, plans, profile,
  queue, sign-in, verify, field-map(.native), language-menu, photo-detail, profile-menu.
- `components/stamp.tsx` uses `FixedText as Text` — the burned-in evidence stamp must NOT scale
  at all (fixed geometry composited into the photo).
- `components/__ErrorBoundary.tsx` deliberately left on raw RN Text (template-managed, `__` prefix).
- No TextInput anywhere takes a `ref`, so the non-forwardRef wrapper is safe. Verified.
- Verified: lint 0 errors, typecheck 3/3, rendered Capture/Settings/Teamspace/Projects/Map — no
  redbox. Screenshots /tmp/s3_*.png. Patch script /tmp/fix_scale3.py (not re-runnable).
- Still NOT verifiable in sandbox: how it looks at a real Android system font size (Expo web
  ignores the OS setting).

## Sep 3 — EAS publish saga

- `app.json` gained `"owner"`: set to `matrixicutoos-team`, then changed to `matrixicutoo` after
  Luc created a personal-account Expo project.
- Personal Expo project: owner `matrixicutoo`, slug `geocliks`,
  ID `5a0e9262-b5c1-4da3-ab37-2012eff9013f`. Org project `@matrixicutoos-team/geocliks`
  (ID `079b5ac9-5833-40c4-b171-0e7ab06e6bbc`) left intact as a comparison point.
- Attempt #4 failed identically to #3 (dies at `configuring`, Builds tab shows "No Builds Yet").
  Account + owner + project ID all changed between the two → config is NOT the cause.
  4 attempts, 2 Expo accounts, zero builds ever reaching Expo. Retries stopped; Runable support
  (agent "Rae") reviewing publish logs.
- Fallback route if support stalls: GitHub → EAS Build. `.gitignore` already excludes `.env`, so
  secrets would not be pushed. May need `extra.eas.projectId` in app.json (platform-managed field).

## Sep 3 — Push notifications fixed (Android)

Root cause was three things, not one:
1. `packages/mobile/app.json` had no `extra.eas.projectId` → `usePushToken` returned early and
   never even asked for a token. Added `"eas": { "projectId": "5a0e9262-b5c1-4da3-ab37-2012eff9013f" }`.
   (Yes, `extra` is platform-managed. Edited deliberately — `eas init` writes exactly this key.
   If a future publish wipes `extra`, push breaks and this is the first thing to check.)
2. No Firebase/FCM credentials. Android push on Expo goes through FCM.
   Added `packages/mobile/google-services.json` (Firebase project `geocliks-d12b8`,
   number `222895504630`, package `com.timemark_a7k2.runable`) + `android.googleServicesFile`
   in app.json. Luc uploaded the FCM V1 service-account key to expo.dev → Credentials → Android.
3. Silent failure. `use-push-token.ts` swallowed every error. Rewritten to write a human-readable
   status line to AsyncStorage under `PUSH_STATUS_KEY = "geocliks.push.status"` at every branch
   (SKIPPED / WORKING / REGISTERED / FAILED + reason). Surfaced in a NOTIFICATIONS card on
   `app/(tabs)/settings.tsx` (tap to refresh). This diagnostic is what found the FCM gap — keep it.

Confirmed working on Luc's Samsung. `push_tokens` holds TWO android rows for his user id
(he installed the APK twice) → he may get duplicate notifications. Expo's `DeviceNotRegistered`
cleanup in `api/lib/push.ts` should self-heal it. Do NOT dedupe by (userId, platform) — that would
break the legitimate two-phones case.

Note: "no Android permission popup appeared" was expected, not a failure — he'd already granted
notifications in Android Settings, so `requestPermissionsAsync()` is never called.

`expo-notifications` is still NOT in app.json `plugins` → default white-square notification icon.
Cosmetic; adding the plugin would allow a branded icon + accent colour + custom sound.

## Sep 3 — Desktop (web) notifications

New: `packages/web/src/web/hooks/use-message-notifications.ts` → `{ supported, blocked, enabled,
enable, disable }`. Rides the existing 15s `useConversations()` poll (no websockets in this stack),
fires when a thread's `unread` rises above the previous poll. First poll seeds the baseline only.
Stays silent while the tab is visible AND focused. Persists to `localStorage` key
`geocliks.notify.enabled`. Notification uses `tag: row.id` so a busy thread replaces rather than
stacks; click focuses the window and routes to `/app/messages`.

`enable()` must run from a click — browsers only grant `Notification.requestPermission()` on a user
gesture. It also plays the chime inside that gesture to unlock audio under autoplay policy.

Chime: `packages/web/public/media/new-message.mp3`, 0.44s two-tone (B5→E6), generated with ffmpeg.
Bell toggle lives in the header of `components/dashboard-shell.tsx` (not the Messages page) so
alerts fire on every `/app/*` route. i18n keys `notify.on` / `notify.off` / `notify.blocked`
added to all 11 locales, mobile copies in sync (script `/tmp/i18n_notify.py`, not re-runnable).

Honest limitation: this only fires while a GeoCliks tab is open. True background web push needs a
service worker + VAPID — not built.

Verified: lint 0 errors, rendered `/app/messages` (bell present, OFF state, `/tmp/notif_msgs3.png`).
NOT verified: an actual browser notification firing (headless Chrome never granted permission).

## Chat UI polish — web Messages page (2026-09-03)

Three items Luc asked for, all scoped to the **web** thread screen
(`packages/web/src/web/pages/app-messages.tsx`). Mobile thread screen NOT touched — offer it.

**1. Chat box grew with every message (the reported bug).**
Root cause: the thread panel was `min-h-[560px] flex flex-col`. `min-h` with no upper bound lets a
flex column grow to fit its content, so the `flex-1 overflow-y-auto` scroller never produced an
internal scrollbar — the panel just got taller and pushed the page down. Fix:
- panel  -> `h-[calc(100vh-125px)] max-h-[860px] min-h-[420px]`
- scroller -> `min-h-0 flex-1 ... overflow-y-auto`  (**`min-h-0` is essential** — a flex child will
  not shrink below its content height without it; classic flexbox scroll trap)
The `125px` offset was tuned against a measured render: panel top sits at y=93, so the panel now
runs 93 -> 828 in an 860px viewport. Verified `document.body.scrollHeight === window.innerHeight`
(page no longer scrolls) with scroller clientH 544 / scrollH 1337.

**2. Emoji picker.** Deliberately **no new npm dependency** — a module-level `EMOJI` array of 44
field-first glyphs (tools, weather, PPE, faces) in an 8-col popover. `emoji-mart` et al are heavy
and field crews are on mobile data. Rough edges, both told to Luc: glyphs append to the END of the
textarea (not at the cursor), and the picker only closes on toggle or after picking.
Popover is `absolute right-0 bottom-full` — it was `left-0` first, which pushed the 272px grid off
the right edge of the window because the button sits far right in the toolbar. Caught only by
rendering and measuring the rect (`right:1197` vs `winW:1280` after the fix).

**3. Clickable media + lightbox.** Required an **API change** first:
`messages.ts` `thread` already selected `photos.kind` but never sent it, and resolved the URL as
`photoUrl(posterKey ?? storageKey)` — so for a video capture the client only ever received the
**poster still**. There was no video URL on the wire at all. `photoRefs` now carries
`{ id, code, url, kind, mediaUrl }` where `url` stays the preview/poster and
`mediaUrl = posterKey ? photoUrl(storageKey) : url` is the real file.
`kind` is `"photo" | "video"` — confirmed against the zod enum in `photos.ts:141`, not assumed.
Both `<img>`s became `<button type="button">` with a `group` hover overlay (Play for video,
Maximize2 for stills). Lightbox is `fixed inset-0 z-50` with a full-screen `<button>` backdrop —
a `<div onClick>` is rejected by Biome `noStaticElementInteractions`. Escape closes it.

i18n: `msg.openMedia`, `msg.closeViewer`, `msg.emoji` added to all 11 locales, mobile copies in
sync, `PARITY_OK` (script `/tmp/i18n_chat.py`, not re-runnable).

Verified: lint 0 errors; typecheck **3 successful, 3 total** (this is what proved the new
`thread` return type flows through oRPC to the client); rendered and inspected — panel fixed and
scrolling, emoji picker on-screen, and the video lightbox loaded the real `.mp4` with
`readyState: 4` and the burned-in stamp visible (`/tmp/chat_lightbox.png`, `/tmp/chat_emoji2.png`).

**Seeded test data in the OPS test workspace** (`org_sgCFWGKy...`), left in place on purpose so
future chat work can be verified visually — the ops org previously had zero conversations and
could not exercise the bubbles at all:
- throwaway user `KYBNVjowF6D9ewzMTYfO94ztP2V3l3W1` / crew.test1788479@timemark.dev / FieldProof!42,
  "Dave Crew", member row `mem_test_KYBNVjow`, role field
- conversation `cnv_MTM66JCHNBGHPDJYFX` with 8 messages (2 photo captures, 1 video)
- **synthetic** photo row `pho_testvid_ops` (kind=video, code `TM-TEST-VID0-0001`) — cloned from a
  real capture, so its storage_key points at Luc's org prefix. Delete it if it ever skews ops stats.
Luc's real thread `cnv_MTKI4N6VSD5S50Q8JN` was NOT touched.

Note: emoji render as tofu boxes in sandbox screenshots — headless Chrome here has no emoji font.
Not an app bug; they render normally on a real desktop.

## Mobile chat port + notification icon (this session)
- packages/mobile/app/messages/[id].tsx (384 -> 549 lines): emoji panel (same 44 glyphs as web), tappable chat images and capture references, play badge on video thumbs, full-screen viewer Modal (ClipPlayer via expo-video for clips, contain Image for stills, photo code in the top bar). resolve() + ClipPlayer copied from components/photo-detail.tsx.
- The web "growing chat box" fix does NOT apply on mobile: the thread is a FlatList in a KeyboardAvoidingView with flex:1 and the composer TextInput already caps at maxHeight 110. Verified on the render - nothing to fix.
- i18n keys msg.openMedia / msg.closeViewer / msg.emoji were already added to all 11 locales + mobile copies.
- packages/mobile/assets/notification-icon.png (96x96, white silhouette on transparent, derived from icon.png) + expo-notifications plugin entry in app.json with color #FFB021. Only takes effect on the next native publish/build; cannot be verified in the sandbox.
- Verified: lint 0 errors, typecheck 3/3 successful, rendered thread at 420x900 (/tmp/m2_thread.png, /tmp/m3_emoji.png, /tmp/m4_viewer.png, /tmp/m5_video.png); viewer probe returned video readyState 4 on the real .mp4.

## Support address centralized (Sept 4)
- Problem: `support@geocliks.com` was printed across web + mobile but no mailbox exists, and the
  Entri `MX @` record routes all @geocliks.com mail to Resend inbound -> mail vanished silently.
- Decision (user said "no preference"): point the app's support address at matrixicutoo@gmail.com.
- New one-line constant per package, all exporting `SUPPORT_EMAIL`:
  - packages/web/src/api/lib/support.ts
  - packages/web/src/web/lib/support.ts
  - packages/mobile/constants/support.ts
- 10 call sites converted: api/services/email-templates.ts, api/services/email.ts (replyTo),
  api/middleware/auth.ts, api/routes/billing.ts (local const deleted), web/pages/get-app.tsx,
  web/pages/index.tsx (x3), mobile/components/profile-menu.tsx, mobile/app/landing.tsx,
  mobile/app/sign-in.tsx, mobile/app/(tabs)/settings.tsx.
- Verified: no `support@geocliks.com` left outside the 3 doc comments; lint 0 errors;
  typecheck 3/3; /get-app footer probe -> mailto:matrixicutoo@gmail.com (/tmp/sup_footer.png).
- Swapping to a real mailbox later = one line in each of the 3 constant files.

## Sept 4 — domain live, native login fix, support mailbox, password toggle

### 1. Native app email sign-in was broken: "Missing or null Origin"
- Reproduced with curl against the local API. The check is in better-auth 1.6.19
  `dist/api/middlewares/origin-check.mjs` -> `validateOrigin()`:
    * `if (!(forceValidate || useCookies)) return;`  -> only runs when a `cookie` header is present
    * `if (!originHeader || originHeader === "null") throw MISSING_OR_NULL_ORIGIN;`
  The Expo plugin replays the stored session cookie, and a native RN fetch sends no Origin ->
  cookie + no Origin = hard reject. The throw happens BEFORE `trustedOrigins` is consulted, so
  no trustedOrigins value could ever have fixed it.
- Fix: `withNativeOrigin()` exported from packages/web/src/api/auth.ts, applied at the mount in
  packages/web/src/api/index.ts. If a request has neither Origin nor Referer, stamp WEBSITE_URL's
  origin on it. Browsers always send Origin on POST, so an originless POST is never browser CSRF;
  requests that DO carry Origin/Referer pass through untouched and get the full check.
- Verified after restart (curl matrix):
    A no origin, no cookie      -> token (was already ok)
    B no origin, WITH cookie    -> token (WAS "Missing or null Origin")
    C geocliks.com origin       -> token
    D evil.example.com origin   -> token  <-- SEPARATE PRE-EXISTING HOLE, see below

### 2. OPEN ISSUE (pre-existing, NOT introduced by the fix above, NOT yet fixed)
`trustedOrigins` in packages/web/src/api/auth.ts echoes back whatever Origin the caller sent:
    trustedOrigins: (request) => { const o = request?.headers.get("origin"); return o ? [o] : ["*"]; }
So every origin is trusted and better-auth's origin check is effectively a no-op. Practical
exploitation is still blocked by the session cookie's SameSite policy, so this is a missing
defence-in-depth layer rather than a live hole. Proper fix = explicit allow-list (WEBSITE_URL,
preview URL, localhost 4200/4300/4400, Expo scheme). Deliberately NOT changed in the same pass as
a launch-day login fix: getting the list wrong locks the whole crew out. Told Luc; awaiting go.

### 3. support@geocliks.com is live (GoDaddy Microsoft 365)
- SUPPORT_EMAIL flipped from matrixicutoo@gmail.com to support@geocliks.com in all three files
  (web/src/api/lib, web/src/web/lib, mobile/constants). One-line change, as designed.
- Sent a delivery test to support@geocliks.com (accepted, id 9d799a19-...). Cannot see his inbox.
- Earlier DNS finding: geocliks.com had NO MX and NO TXT records at all, so the Entri *email*
  records never landed - only the website records (A @ -> Cloudflare, CNAME www). Nothing for M365
  to conflict with. My earlier "M365 will replace the Resend inbound MX" warning was wrong.
- Resend sending records (resend._domainkey, `send` SPF TXT, `send` MX) are STILL absent, so
  EMAIL_FROM cannot move to invites@geocliks.com yet; app mail still only reaches Luc's Gmail.
  (Could not confirm via the Resend API - the key we hold is send-only, returns 403.)

### 4. Domain live
- WEBSITE_URL: preview URL -> "https://geocliks.com". Verified sign-in still works after.
- packages/mobile/app.json extra.apiUrl: preview URL -> "https://geocliks.com". Takes effect on
  his NEXT Publish only. NOTE: his currently-installed app still points at the preview URL, which
  is this sandbox - which is why the origin fix reached his phone without a republish.
- Confirmed eas.projectId survived the app.json edit (5a0e9262-b5c1-4da3-ab37-2012eff9013f).

### 5. Show/hide password on the mobile sign-in screen
- packages/mobile/app/sign-in.tsx: `showPw` state, wrapper View, absolutely positioned Pressable
  with Ionicons eye-outline / eye-off-outline, styles pwWrap / pwInput / pwToggle.
- i18n signin.showPassword + signin.hidePassword added to all 11 web locales and copied to mobile.
- Verified by render: /tmp/pw_hidden.png (dots + eye) and /tmp/pw_shown.png (plain text + eye-off);
  input type flipped password -> text and the aria-label flipped Show -> Hide.

Lint 0 errors. Typecheck 3 successful, 3 total.

## Sept 4 — website show/hide password toggle

- packages/web/src/web/pages/sign-in.tsx: added `showPw` state; the password input is now wrapped in
  a `relative` div, `type={showPw ? "text" : "password"}`, `pr-12`, plus `autoCapitalize="none"` /
  `autoCorrect="off"`. Toggle is a `<button type="button">` pinned `inset-y-0 right-0 w-11` with
  `aria-label={t(showPw ? "signin.hidePassword" : "signin.showPassword")}` and lucide `Eye`/`EyeOff`.
- packages/web/src/web/pages/reset-password.tsx: same treatment on the "Set your password" field
  (className `${inputClass} pr-12`). Reuses the same two i18n keys.
- Same toggle serves the SIGN UP tab, since that tab shares the one password field on /sign-in.
- No new i18n keys needed — signin.showPassword / signin.hidePassword already existed in all 11 web
  locales and their mobile copies from the Sept 4 mobile work.
- Applied by /tmp/fix_pw_web.py (not re-runnable; uses the PEND multi-patch cache pattern).
- Verified by render, signed-out clean profile via /tmp/cdp10.mjs (port 9351, /tmp/cdpprof10,
  mobile:false) with /tmp/steps_pwweb.json and /tmp/steps_rpweb.json:
  /tmp/webpw_hidden.png (dots + eye), /tmp/webpw_shown.png (MySecret123 + eye-off),
  /tmp/webrp_hidden.png, /tmp/webrp_shown.png. Probe returned type password -> text and
  aria-label Show password -> Hide password on both pages.

Lint: Checked 47 files, 0 warnings 0 errors. Typecheck: Tasks 3 successful, 3 total.

### Still open after this session
- trustedOrigins echo-back hole in packages/web/src/api/auth.ts — awaiting Luc's go-ahead.
- Bot protection (Turnstile + rate limits + optional TOTP) — researched, options presented,
  awaiting his answer before any code.
- Resend DNS records still missing, so invite email still only reaches matrixicutoo@gmail.com.

## Sept 4 — trustedOrigins locked down (Luc approved)

- packages/web/src/api/auth.ts: replaced the echo-back `trustedOrigins: (request) => origin ? [origin] : ["*"]`
  with a static `TRUSTED_ORIGINS` allow-list built above the `betterAuth()` call:
  WEBSITE_URL origin, https://geocliks.com, https://www.geocliks.com, `https://*.runable.site`
  (all Runable preview + fallback hosts), localhost / 127.0.0.1 / 169.254.0.21 on 4200/4300/4400,
  the Expo scheme `runable-timemar-nt1ia4s://`, and the managed-auth issuer origin from
  VITE_RUNABLE_AUTH_ISSUER. Deduped through a Set; `originOf()` swallows bad URLs.
- Wildcard support confirmed by reading better-auth 1.6.19
  `dist/auth/trusted-origins.mjs` -> `matchesOriginPattern` uses `wildcardMatch` on the origin when
  the pattern contains `*`, and `url.startsWith(pattern)` for custom schemes.
- The phone app is still covered by `withNativeOrigin()`, which stamps the WEBSITE_URL origin on
  originless requests before the check runs.
- Applied by /tmp/fix_origins.py (not re-runnable, PEND pattern). Web fully restarted (auth.ts is
  server-side, HMR does not pick it up).

Verified with the auth curl matrix against /api/auth/sign-in/email (ops.admin account):
  A no origin/no cookie PASS · B no origin + cookie (the phone) PASS · C geocliks.com PASS ·
  C2 www.geocliks.com PASS · C3 preview-4200 PASS · C4 preview-4300 PASS · C5 localhost:4400 PASS ·
  D evil.example.com INVALID_ORIGIN · E geocliks.com.evil.net INVALID_ORIGIN ·
  F evil.runable.site.attacker.com INVALID_ORIGIN.
Real end-to-end browser logins also verified, not just curl:
  web 4200 signed in and landed on /app (/tmp/login_web_after.png);
  mobile web 4300 signed in and landed on the Capture tab (/tmp/login_mob_after2.png).
Lint 0 errors. Typecheck Tasks: 3 successful, 3 total.

### Next: bot protection (Luc chose Turnstile + authenticator 2-step for owners/admins)
- Blocked on Luc supplying TURNSTILE_SITE_KEY (public) and TURNSTILE_SECRET_KEY (root .env).
- Then: better-auth captcha plugin on sign-in/sign-up/forgot-password, tighter rate limits,
  and the twoFactor (TOTP) plugin gated to owner/admin roles.
- Email verification on sign-up stays OFF until the Resend DNS records exist.

---

## Session: bot protection + authenticator 2FA (Sep 4)

Approved by Luc: "Yes to Turnstile, and add the authenticator-app 2-step for me/admins too".

### Done
- [x] Turnstile captcha on `/sign-up/email` + `/request-password-reset` only (NOT sign-in —
      Cloudflare has no native RN widget, guarding sign-in would lock the phone crew out).
      Guarded on `TURNSTILE_SECRET_KEY` so a missing key can never lock anyone out.
- [x] Rate limits: default 60/60s; sign-in 20/60s; sign-up + reset 5/hour.
      `advanced.ipAddress.ipAddressHeaders = ["cf-connecting-ip", "x-forwarded-for"]` because
      x-forwarded-for is client-spoofable and the site sits behind Cloudflare.
- [x] `<Turnstile>` widget (web) on the sign-up tab and the reset-request form; renders null when
      `VITE_TURNSTILE_SITE_KEY` is unset, mirroring the server skipping the plugin.
- [x] Mobile: "Create an account" now opens `geocliks.com/sign-in?mode=sign-up` in the phone
      browser. Mobile SIGN-IN untouched — zero lockout risk.
- [x] BUG FIX: web reset page called `authClient.forgetPassword` → built
      `POST /api/auth/forget-password`, which does not exist in better-auth 1.6.19 (404 verified).
      Now `requestPasswordReset` (200 verified). Forgot-password mail never sent before this.
- [x] Friendly captcha errors: `signin.captchaMissing` / `signin.captchaFailed`, mapped from
      MISSING_RESPONSE / VERIFICATION_FAILED. Submit button deliberately NOT disabled.
- [x] `twoFactor({ issuer: "GeoCliks" })` server plugin + hand-written drizzle schema
      (`user.twoFactorEnabled`, `two_factor` table; adapter resolves by export key `twoFactor`).
      CLI generate could not run (jiti subprocess loses DATABASE_URL) — schema added by hand.

### Next
- [x] db:push (`[✓] Changes applied`)
- [x] `twoFactorClient()` on web + mobile auth clients (+ mobile `setEmailToken()` export, because
      the 2FA session token arrives in the verify response BODY, not the set-auth-token header)
- [x] Enrolment card on /app/profile, owner/admin only (QR rendered locally with the existing
      `qrcode` dep — the TOTP secret never leaves the app — plus manual key, verify, backup codes
      shown only after a code verifies, and disable)
- [x] 2FA code step in BOTH sign-in flows (web `two-factor-step.tsx`, mobile inline panel)
- [x] Token guard: the `twoFactorRedirect` response still carries a `set-auth-token` header holding
      the signed PENDING two-factor cookie. Both clients now skip storing it (`ctx.data`).
- [x] Mobile code step hides "Continue with Google" + the OR divider — mid-2FA, Google is a dead end
- [x] i18n sweep, 21 keys x 11 locales, web + mobile copies, PARITY_OK
- [x] lint 0/0, typecheck 3/3, web + mobile restarted (both 200)
- [x] End-to-end 2FA test `/tmp/e2e_2fa.sh` — all 8 steps pass, ops account left with 2FA OFF,
      `two_factor` table empty, no user with two_factor_enabled = 1
- [x] PNGs rendered and inspected: mobile sign-up-in-browser panel, /app/profile 2FA card,
      web code step, mobile code step

### Open / tell Luc
- Turnstile site key is domain-scoped: the widget renders Cloudflare's "Unable to connect" box on
  the sandbox host. Likely needs the preview hostnames added in Cloudflare → Turnstile → Hostname
  Management, or use test key 1x00000000000000000000AA. Could NOT solve a real challenge here.
- Email verification on sign-up stays OFF (Resend DNS records still missing → invite mail dead).

## Session: password change by email link (Sep 4)

Done
- New authed oRPC procedure `account.sendPasswordResetLink` (packages/web/src/api/routes/account.ts) —
  calls `auth.api.requestPasswordReset` server-side, so the Turnstile captcha hook (HTTP-only) never
  runs and a signed-in user never has to solve a captcha. Sends only to `context.user.email`, so
  there is nothing to enumerate. Link lifetime 1 hour (better-auth default).
- Web: `useSendPasswordResetLink()` in queries/account.ts; secondary "Email me a reset link" button
  under the PASSWORD card in app-profile.tsx (old-password form kept as fallback).
- Mobile: matching Pressable in app/profile.tsx via `client.account.sendPasswordResetLink()`.
- i18n: profile.emailResetOr / emailReset / emailResetSent x 11 locales, PARITY_OK.

Verified
- lint 0 errors, typecheck 3/3.
- Web + mobile restarted (200 each). Screenshots /tmp/pwmail_web2.png, /tmp/pwmail_mob1.png.
- Clicked the web button live: procedure ran, Resend returned its test-mode 403 for the ops address
  ("can only send testing emails to matrixicutoo@gmail.com") -> wiring works, DNS is still the blocker.

Tell Luc
- The old-password form STAYS as a fallback because app email only reaches matrixicutoo@gmail.com
  until the three Resend DNS records are added at GoDaddy. Removing it would lock out crew members.

## Session: field-member team lockdown + contact link + compare scoping (Sep 4)

Luc's request (verbatim, 3 parts)
1. Remove team-settings access from field members so they only see the assigned project members.
2. Add a "contact member" link on the same Team page that opens a chat with the selected member.
3. /app/compare — a field member must only see the project pictures/videos he is assigned to.

Done
- packages/web/src/api/middleware/auth.ts — new exported helper `visibleTeammates(orgId, userId, role)`
  returning `{ userIds, projectIds } | null` (null = owner/admin/manager see everyone). Built on the
  existing `visibleProjectIds`.
- packages/web/src/api/routes/team.ts
  - team.list: a field member now sees only crew assigned to their own projects PLUS every
    owner/admin/manager. Their teammates' photo counts are recomputed against the caller's allowed
    projects, so a workspace-wide total never leaks.
  - team.invites: returns [] for field (was wide open — any field member could read pending invite codes).
  - team.memberProjects: field can only read their own assignments.
  - team.assignments: returns [] when a field member asks about a project they are not on.
- packages/web/src/api/routes/messages.ts — `contacts` filtered with the same rule, otherwise the
  restriction leaked straight back through the "New message" picker.
- packages/web/src/api/routes/photos.ts — comparisons.list / .create / .remove all scoped to
  `visibleProjectIds`. Read, write and delete were all unguarded before; only orgId was checked.
- packages/web/src/web/pages/app-team.tsx — new MESSAGE button per member (hidden on your own row);
  for a field member the seats badge, role dropdown, crew-access folder button, remove button,
  pending-invites card, invite form and project-access explainer are all hidden. Appearance/Language
  card stays (own device prefs; workspace defaults inside it were already admin-gated).
- packages/web/src/web/pages/app-messages.tsx — honours `?c=<conversationId>` exactly once on load
  (ref-guarded so the 15s poll can't yank you out of a thread you clicked).
- Bonus fix found while verifying: comparisons.list never returned `projectName`, so EVERY
  before/after card showed "NO PROJECT" — for owners too. Now resolved server-side.

Verified
- lint 0 errors, typecheck 3/3 (twice — after the main patch and after the projectName fix).
- API proof by curl, field token vs owner token, same org:
    team.list      field -> [Dave(self), Ops Admin(owner), Rita(same project)]   owner -> + Sam(other project)
    team.invites   field -> []
    contacts       field -> [Ops Admin, Rita]                                     owner -> [Dave, Sam, Rita]
    comparisons    field -> 1 pair (Ridgeline)                                    owner -> 3 pairs
    photoCount for Ops Admin: 6 as seen by the field member, 28 as seen by the owner.
- Screenshots inspected: /tmp/ft_team_field.png, /tmp/ft_team_owner.png, /tmp/ft_compare_field2.png,
  /tmp/ft_msg_open.png (Message button -> /app/messages?c=cnv_... with the thread open).
- Temp fixtures Sam Otherproject / Rita Sameproject deleted after the test. Kept: assignment
  `asg_test_KYBNVjow` putting the field test user on Ridgeline FTTH — Phase 2.

Tell Luc
- Owners/admins/managers stay visible to a field member on purpose — otherwise the new contact
  button would be useless, since supervisors are usually not rows in project_assignments. Crew on
  OTHER projects is hidden, which is the actual privacy intent.
- The Messages contact picker was scoped too, not just the Team page.
- Team page is English-only by standing decision, so the MESSAGE button needed no i18n keys.
- Compare was leaking in three places (read, create, delete) — all guarded server-side now.
- Still open: photos.stats is the last surface not scoped to a field member's projects.

## Session: strict-literal field visibility + role badges + required invite role (Sep 4)

### Done
- **Strict-literal field visibility.** Dropped the owner/admin/manager exception added last
  session. `team.list` (`api/routes/team.ts`) and `messages.contacts` (`api/routes/messages.ts`)
  now filter on `teammates.userIds.has(...)` alone — a field member sees only people actually
  assigned to the same projects, plus themselves. Stale comments in both files and the
  `visibleTeammates` doc comment in `api/middleware/auth.ts` rewritten to match.
- **Role badges.** New `packages/web/src/web/components/role-badge.tsx` (`RoleBadge`), English +
  uppercase on purpose, matching the existing `BUSINESS · FIELD` plan chip. Colours: owner=amber,
  admin=sky, manager=verified, field=fog/line.
  - `app-team.tsx`: badge on every member row (visible to field members, who have no role select).
  - `app-profile.tsx` (web): badge inline beside the user's email in the ACCOUNT card.
  - `packages/mobile/app/profile.tsx`: amber chip under the avatar, inside the avatar card —
    deliberately NOT the PLAN section, which is hidden from field members.
- **Invite requires an explicit role.** `useState<Role | null>(null)` (was `"field"`), `Role *`
  label marker, submit `disabled={invite.isPending || !role}`, an `if (!role)` guard in onSubmit,
  and a neutral "Pick a role above first" hint while nothing is selected.
- **Field empty-state hint** on `/app/team`: when `isField` and the roster is <= 1, a line explains
  "Nobody else is assigned to your projects yet." First attempt landed inside the invite-only
  Pending-invites card (hidden from field members) — caught by screenshot, moved into the Members
  card (`/tmp/fix_hint.py`).
- **GoDaddy/Resend document** at `/home/user/geocliks-dns.report/content.md`. Leads with the
  correction that the three Resend records are ALREADY live; the real blockers are (a) the domain
  not verified in the Resend dashboard (proven: API returned 403 "domain is not verified", so no
  test mail reached anyone) and (b) no `EMAIL_FROM` in `.env`. Two genuine GoDaddy fixes: delete
  the rogue `10 inbound-smtp.us-east-1.amazonaws.com` root MX; edit the root SPF to add
  `include:spf.protection.outlook.com`.

### Verified
- lint 0/0 and typecheck 3/3, twice (before and after the hint move).
- Full web + mobile restart, web 200 / mob 200.
- curl, field token vs owner token: field `team.list` = 1 row (only Dave Crew, role field),
  field `messages.contacts` = `[]`, owner `team.list` = owner + field. Strict rule confirmed.
- Screenshots inspected: `/tmp/rb_team_owner.png` (badges + `ROLE *` + no role preselected +
  Send invite disabled), `/tmp/rb_team_field.png` (FIELD badge + new hint, only themselves),
  `/tmp/rb_profile_field.png` (FIELD badge beside email), `/tmp/rb_profile_mob.png` (OWNER chip
  under the avatar).
- DNS re-read live via DoH: all three Resend records present; rogue root MX and SPF-without-M365
  both confirmed still in place.

### Tell Luc
- The DNS correction, first thing — I was wrong about the missing records.
- Strict-literal consequence: a field member with no supervisor on their projects now sees nobody
  on /app/team and has nobody to message. Fix is ticking project boxes for managers/admins, or the
  folder button on a member row.
- Role badges render in English on purpose (no 4 roles x 11 locales churn).
- Still open: should `photos.stats` be scoped for field members? (last unscoped surface)

## Session: EMAIL_FROM + invite cleanup (Sep 4)
- Added `EMAIL_FROM="GeoCliks <invites@geocliks.com>"` to root .env (line 24); full web+mobile restart, both 200.
- Proof it is live: test invite returned emailConfigured:true, emailSent:false, emailReason = "The geocliks.com domain is not verified... resend.com/domains". Only possible if the From address is now @geocliks.com.
- Throwaway invite emailcheck.tmp@geocliks-test.dev (inv_MTMKTEXQ4PQH188MK0) revoked; only pre-existing matrixicutoo@gmail.com remains pending in org_sgCFWGKy.
- Open: Luc must click Verify at resend.com/domains. GoDaddy needs nothing for Resend; the two GoDaddy fixes in geocliks-dns.report/content.md are about his own M365 mailbox.

## Session: strict invite-email matching (Sep 4)
- Bug found by Luc: an invite link opened while signed in as another account joined that wrong account. `acceptInvite` never compared `context.user.email` to `invite.email` — the code was effectively a bearer token.
- Server fix (`api/routes/team.ts`, `acceptInvite`): case-insensitive, trimmed comparison; mismatch throws ORPCError FORBIDDEN 403 with an English message naming both addresses. Verified live: field token accepting an invite addressed elsewhere returns 403.
- Web `pages/join.tsx`: new mismatch branch (alert box, no Join button) with a "Sign out and use <invited email>" button that signs out then routes to the prefilled sign-up. Signed-out CTA now carries `?mode=sign-up&email=<invited>&next=/join/<code>`.
- Web `pages/sign-in.tsx`: honours `?email=`, prefills it and marks the input `readOnly` (greyed, `cursor-not-allowed`) with a locked note. Verified: value=someone@x.com, readOnly=true.
- i18n: 4 new keys (`join.mismatchTitle`, `join.mismatchBody`, `join.signOutUse`, `signin.inviteLocked`) across all 11 web locales, copied into packages/mobile/i18n. Script /tmp/i18n_strictinvite.py (already run).
- Mobile deliberately NOT given the mismatch UI this pass: its signed-out path already stashes the code and routes to `/sign-in?mode=sign-up&email=<invited>`, and its signed-in path surfaces the new server error text via `onError`. Mobile sign-in prefill is still editable (web is locked) — possible follow-up.
- Costs accepted by Luc: Google sign-in can only be refused on mismatch, never forced to an address; a typo'd invite must be revoked and re-sent.
- Verify: lint 0 errors / 212 files, typecheck 3/3. Test invite inv_MTMNPAKLKSDJE61TVQ revoked after use. Screenshots /tmp/si_mismatch3.png, /tmp/si_lock.png.

## Session: mobile mismatch UI + locked mobile email (Sep 4)
- `packages/mobile/app/join.tsx`: derives `invitedEmail` / `currentEmail` / `mismatch` beside the session flags; when the signed-in account is not the invited one the Join button and "signed in as" hint are replaced by a red panel (`join.mismatchTitle` / `join.mismatchBody`) with a "Sign out and use <invited email>" button. That button stashes the code via savePendingInvite, calls authClient.signOut(), then `router.replace("/sign-in?email=<invited>")` — sign-in mode, not sign-up, because mobile sign-up bounces to the website for Turnstile anyway.
- New styles `warn`, `warnTitle`, `secondary`, `secondaryText` in the same file.
- `packages/mobile/app/sign-in.tsx`: `invitedEmail` from `params.email`, field is `editable={!invitedEmail}`, greyed to mutedForeground, with the `signin.inviteLocked` note under it (new `lockNote` style). Matches the website.
- No new i18n keys needed — the 4 keys added earlier were already copied into packages/mobile/i18n.
- Verified: lint 0 errors / 212 files, typecheck 3/3. Screenshots /tmp/mob_mismatch.png (panel, no Join button) and /tmp/mob_lock.png (value prefilled, readOnly true). Test invite inv_MTMO55F0ERREHAPHKM revoked.
- Luc confirmed the first real invite email landed in his normal inbox, not spam.

## Session: workspace isolation audit + workspace/project names in headers (Sep 4)

### GoDaddy SPF (his item 1)
Verified live via Cloudflare DoH. Root TXT now holds exactly three rows: Resend ownership,
`v=spf1 include:secureserver.net include:spf.protection.outlook.com -all`, and the M365
verification string. His DNS to-do list is empty. He also confirmed the first real invite
landed in his normal inbox, not spam.

### Isolation audit (his item 2) — no cross-workspace leak found
Method: read `orgProc`, swept all 51 bare-id queries in non-admin routes, ran a re-runnable
scanner (`/tmp/audit.py`) for handlers that never mention an org/user id, then probed live with
two bearer tokens (ops owner, ops field member) against ids belonging to `org_MTCE8SRQBM81BGT9XD`.

- `orgProc` resolves exactly one workspace per request from `members`; the client never supplies
  an org id, so every authenticated handler is pinned to the caller's own workspace.
- Bare-id queries are all either (a) writes on rows already fetched with an orgId filter,
  (b) joins through a server-owned row, or (c) explicit re-validation against the caller's org.
- Four handlers touch no org id: `account.sendPasswordResetLink` (caller's own email),
  `billing.plans` and `iap.products` (public catalogue), `photos.videoPolicy` (plan limits from
  `context.org.plan` only, no rows). All benign.
- Live cross-workspace probes returned 404: `projects/get`, `photos/get`, `photos/verify`,
  `photos/remove`, `messages/thread`, `messages/send`.
- `share/revoke` was org-scoped but returned `{ok:true}` on a zero-row update. Verified in the DB
  that nothing was written (both of Luc's links still `revoked=0`). Fixed: the update now uses
  `.returning()` and throws NOT_FOUND when no row in the caller's workspace matches. Re-probed:
  cross-org 404, own-org ok. The ops test link revoked during the probe was restored to `revoked=0`.

Deliberate, by-design exceptions (told to him, not bugs):
- `verify.byCode` looks a photo code up globally — anyone holding a code can verify that one photo.
- Public share tokens expose photos of the link's own workspace.
- `team.inviteInfo` reveals inviter name / workspace name / invited email to the code holder.
- `/admin` (`staffProc`) crosses all workspaces, and impersonation exists. Both of his accounts
  (`matrixicutoo@gmail.com`, `ops.admin1788258771@timemark.dev`) are `superadmin`.

Within-workspace role gaps still open (not cross-workspace):
- `photos.stats` is workspace-wide for field members.
- `share.list` shows a field member every share link in the workspace (observed live).

### Workspace and project names in headers (his item 3)
- `pages/app-teamspace.tsx` heading -> `<Workspace> · Teamspace`.
- `pages/app-project.tsx` heading -> `<Project> · Projects`.
- `components/dashboard-shell.tsx`: `navLabel()` makes the `/app` nav entry (sidebar and the
  mobile web strip) show the workspace name instead of "Teamspace"; route stays `/app`.
  Added a `useEffect` that sets `document.title` to `<header title> · GeoCliks`.
- Mobile `(tabs)/teamspace.tsx` (added `useOrg`) and `(tabs)/projects.tsx` headers now read
  `<WORKSPACE> · TEAMSPACE` / `<WORKSPACE> · PROJECTS`, `numberOfLines={1}`, and switch to a new
  `titleWide` style (12.5px, letterSpacing 1) when a workspace name is present — at the original
  15px/letterSpacing 3 both headers clipped to "· T…" / "· PR…" on a 420px screen.
- There is no mobile project-detail screen, so the mobile Projects header carries the workspace
  name rather than a project name.
- Known cosmetic: on the web project page at 1440px with four action buttons the h1 clips the
  trailing "Projects" ("Westgate Shell — Progress Set · Proj…"). The project name always shows first.
- Lint 0/0 on 212 files; mobile `tsc --noEmit` exit 0 (the turbo run OOM-killed at 137 first).
- Screenshots inspected: /tmp/hdr_web_teamspace.png, /tmp/hdr_web_project.png,
  /tmp/hdr_mob_teamspace.png, /tmp/hdr_mob_projects.png.

## Session: business name / Teamspace naming (Sep 4, later)

Placement reverted per user: dark header is plain again ("Teamspace" / project name); the
`<name> · <section>` line moved into the page body.

- New `packages/web/src/web/components/page-title.tsx` (`PageTitle({name, section})`), used as the
  first child of `DashboardShell` on `app-teamspace.tsx` and `app-project.tsx`.
- `dashboard-shell.tsx`: `orgName`/`navLabel` removed, sidebar + mobile strip back to `t(item.label)`,
  `max-w-[150px] truncate` reverted. `document.title` effect KEPT (now "Teamspace · GeoCliks").
- Mobile `(tabs)/teamspace.tsx` + `(tabs)/projects.tsx`: small mono org line above the big title,
  `titleWide` style replaced by `orgLine`.
- Sign-up: Business name field on `sign-in.tsx`; after `signUp.email`, bearer is stored then
  `orpc.orgs.update.call({name})` renames the auto-provisioned workspace (failures ignored).
- `orgs.current` now returns `needsName`, computed from `defaultOrgName(user)` (new export in
  `api/lib/workspaces.ts`, also used by the auto-provision insert in `middleware/auth.ts`).
- Teamspace page shows a dismissible "Name your Teamspace" card when `needsName` and owner/admin —
  covers Google sign-ups and pre-existing accounts.
- Profile page: new TEAMSPACE card with the business name, owner/admin only, via `useUpdateOrg`.
- 9 new i18n keys x 11 locales, copied to mobile.
- DB: `org_MTCE8SRQBM81BGT9XD` renamed to "We Deliver"; slug left as `luc-theriault-t9xd`.
- Verified: lint 0/0 on 213 files, `packages/mobile` tsc exit 0, web+mobile 200, screenshots
  /tmp/biz_web_teamspace.png, /tmp/biz_web_project.png, /tmp/biz_web_profile.png, /tmp/biz_signup.png,
  /tmp/hdr_mob_teamspace.png, /tmp/hdr_mob_projects.png.
- No mobile editing UI for the workspace name (web-only) — disclosed to the user.

## 2026-09-04 — five follow-ups (field scoping, remove rights, mobile business name)
1. photos.stats scoped for field members (photos.ts) — uses visibleProjectIds; empty-assignment
   short-circuit returns zeroed stats. Verified: owner 28 photos / field 6.
2. share.list scoped for field members (share.ts) — sees links for assigned projects, per-photo
   links resolved via the photo's project, plus links they created. Workspace-wide links hidden.
   Verified: owner 2 links / field 1.
3. Stripped superadmin from the ops test account (deleted staff row stf_seed_ops).
   matrixicutoo@gmail.com remains the only superadmin.
4. team.remove is now admin+ (was owner-only). Protected: the owner, yourself, and a fellow
   admin (owner-only). All 5 cases verified live with a temporary admin, then test data restored.
5. Mobile Settings has a TEAMSPACE > BUSINESS NAME editor (owner/admin only).
   Added useUpdateOrg to packages/mobile/queries/orgs.ts. Reused existing i18n keys.
Lint 0 errors / 213 files. Mobile tsc exit 0. Servers restarted and verified.
Still open: share.create is ungated, so a field member can still MINT a workspace-wide link.

## 2026-09-04 — Mobile: drawer everywhere + New project + Reports + Share links
- `packages/mobile/components/profile-menu.tsx`: tiles now Projects, Teamspace, Map, **Reports**, **Share links**, **Watermarks** (Settings?focus=stamp, manager+), **Plan** (manager+), Queue, Settings. `go(href, params?)`, nonce param so a repeat tap re-scrolls, field crews don't see manager-only tiles.
- `<ProfileMenu />` added to Map, Messages, Teamspace, Projects, Settings (Capture already had it). Verified 1 trigger per screen.
- NEW `packages/mobile/app/reports.tsx` — build form (title, project chips, PDF/XLSX/ZIP/KMZ, PDF layouts) + generated package list with download/delete.
- NEW `packages/mobile/app/share.tsx` — create form (label, scope, expiry, allow downloads) + link list with native share / open / revoke.
- NEW `packages/mobile/queries/reports.ts`; `queries/share.ts` rewritten (list/create/forPhoto/revoke, now invalidating).
- `(tabs)/projects.tsx`: `+` New project form (manager+), uses new `useCreateProject`.
- `(tabs)/settings.tsx`: scrolls to STAMP TEMPLATE when opened from the Watermarks tile.
- No new i18n keys needed (all already existed). Lint 0/0 on 216 files; mobile tsc exit 0. Screenshots: /tmp/m_drawer.png, m_projects_form.png, m_reports.png, m_share.png, m_watermarks.png, m_map.png.

## 2026-09-04 — share.create / share.forPhoto locked down (field members)
Rule chosen (layered, not either/or):
- Workspace-wide link (projectId null) -> manager and above only. FORBIDDEN "A workspace-wide share link requires manager access or above."
- Project link -> a field member may create one ONLY for a job they are assigned to. FORBIDDEN "You can only share a job you are assigned to."
- Per-photo link (share.forPhoto) -> still every role, every plan (core promise), but a field member can no longer mint one for a photo on a job they are not on -> NOT_FOUND.
Files: `packages/web/src/api/routes/share.ts` (create + forPhoto, uses existing visibleProjectIds import);
`packages/mobile/app/share.tsx` (+useOrg, isField, scopeId, workspace chip hidden for field);
`packages/web/src/web/pages/app-share.tsx` (same via scopeId + hidden option).
No new i18n keys (server FORBIDDEN messages stay English per standing decision).
Verified live, 6 probes: field wide->403, field unassigned->403, field assigned->OK, owner wide->OK, field forPhoto unassigned->404, field forPhoto assigned->OK.
Probe rows deleted (3 share_links + 1 photo_event); read-back shows ops workspace at its original 2 links, 0 leftover events.
Lint 0/0 on 216 files. Mobile tsc exit 0 (first run was 137 = OOM with dev servers up, not a type error; second run found a real use-before-declare in share.tsx, fixed).

## 2026-09-04 — amber menu/tab fills + sign-in wordmark (3 annotated screenshots)

Requests read off the three phone screenshots:
1. sign-in: `GEOCLIKS` wordmark orange; headline "Proof that holds up." smaller + orange.
2. projects header: hamburger + `+` button backgrounds orange, app AND website, both themes.
3. drawer menu tiles: orange backgrounds, black icons, app AND website, both themes.

Done:
- `mobile/app/sign-in.tsx` — brand + headline -> `colors.amber`; headline 32/38 -> 24/30.
- `mobile/components/profile-menu.tsx` — hamburger trigger and all 9 tiles -> amber fill,
  `colors.primaryForeground` (#0B0E13, identical in both themes) for icons + labels.
  Also fixed the UPGRADE pill, which used `colors.background` as its foreground and so was
  invisible on amber in the light theme.
- `mobile/app/(tabs)/projects.tsx` — `+` button -> amber fill, black glyph (was border-only).
- `web/components/dashboard-shell.tsx` — sidebar rows + narrow-screen chip row -> `bg-amber`
  / `text-on-amber`. Active page now marked by font weight + `border-on-amber` left edge,
  since fill can no longer carry that signal. Unread pill inverted to `bg-on-amber text-amber`
  so it stays legible on the amber row.
- Left alone deliberately: the staff-only red Admin console link (its alert colour is a
  warning signal, not a nav style).

Key finding: `colors.primaryForeground` / `--c-on-amber` is already #0B0E13 in BOTH themes,
so "black on orange" needed no new token.

Also fixed (NOT asked for, but blocks his crew signing in) — `web/src/api/auth.ts`:
`withNativeOrigin()` bailed out whenever an `origin` header was present, but the release
Android build sends the literal string `Origin: null`, which is truthy -> request passed
through untouched -> better-auth threw MISSING_OR_NULL_ORIGIN ("Missing or null Origin",
visible in his screenshot 1). Now a literal `"null"` origin/referer is treated as absent, and
a leftover `null` Referer is dropped before stamping. CODE-LEVEL DIAGNOSIS ONLY — the error is
from the published production app and cannot be reproduced in this sandbox. Needs a Publish.

Verified: lint 0/0 on 216 files; `bunx tsc --noEmit` in packages/mobile exit 0; both dev
servers 200. Rendered and inspected: /tmp/o_signin.png, /tmp/o_projects.png, /tmp/o_drawer.png.

## 2026-09-04 — Batch: Enterprise CTA, legal pages, social links (IN PROGRESS)
- DONE index.tsx: Enterprise plan CTA -> mailto SUPPORT_EMAIL (?subject=GeoCliks Enterprise plan)
- DONE schema.ts: `site_settings` single-row table (facebook/instagram/linkedin/youtube/x + updatedAt); db:push applied
- DONE api routes/site.ts (public `site.socials`) + routes/admin-site.ts (`admin.site.socials|updateSocials`, superadmin, logAdmin "site.socials"); wired in api/index.ts
- DONE queries/site.ts (useSocialLinks) + queries/admin.ts (useAdminSocials/useUpdateSocials)
- DONE components/site-footer.tsx (extracted Footer out of index.tsx, + social icon row, + /terms /privacy links). X mark is inline SVG (lucide has none); no TikTok icon in lucide -> not offered.
- DONE lib/company.ts (LEGAL_ENTITY="GeoCliks", address, NB jurisdiction, effective date)
- DONE components/legal-page.tsx shared layout
- TODO pages/terms.tsx, pages/privacy.tsx (English only), pages/admin-settings.tsx, app.tsx routes (/terms /privacy /admin/settings), admin-shell NAV, i18n keys home.footer.terms + admin.nav.settings (14 files), lint + tsc + screenshots
- User answered: entity "GeoClicks" (typo -> used GeoCliks, must flag), addr 34-18 Clearview St Moncton NB E1A 4H2, NB law, has FB/IG/LI, admin console, English-only legal

## 2026-09-04 — Legal pages + social links + Enterprise CTA (batch complete, verified)

Item 1 (sign-in "Missing or null Origin"): NO new work. User reports the_installers@hotmail.com
now signs in fine on the phone. The withNativeOrigin hardening in api/auth.ts was never published,
so it cannot be the cause — error was transient/stale build. Change ships with next Publish as
unvalidated defensive hardening. Do not claim credit.

Item 2: Enterprise pricing CTA -> mailto:support@geocliks.com?subject=GeoCliks Enterprise plan
(packages/web/src/web/pages/index.tsx, Pricing()). Verified in live DOM: 5x /sign-in + 1x mailto.

Item 3:
- New pages /terms (16 sections) and /privacy (14 sections) — ORIGINAL GeoCliks copy, NOT copied
  from Timemark. English only. Lawyer review required before he relies on it.
- packages/web/src/web/lib/company.ts — LEGAL_ENTITY "GeoCliks" (he typed "GeoClicks"; treated as
  typo, disclosed), address, jurisdiction NB, LEGAL_EFFECTIVE_DATE "September 4, 2026".
- components/legal-page.tsx (forces light theme, pinned-dark header), components/site-footer.tsx
  (footer extracted out of index.tsx so legal pages reuse it; SocialRow hides blank URLs; X is an
  inline SVG — lucide has no X and no TikTok).
- DB: new site_settings table (single row id "site", 5 URL cols, default ""). db:push applied.
- API: routes/site.ts (public site.socials) + routes/admin-site.ts (staffProc + requireSuperadmin,
  zod: "" or https://, logAdmin). Verified live: unauth read 200; javascript: -> BAD_REQUEST.
- Admin console page /admin/settings ("Site settings" in admin NAV) — company-wide, not per-org.
- i18n: 2 new keys (home.footer.terms, admin.nav.settings) in all 11 web locales + copied to mobile.
  PARITY_OK.
- Bonus: 4 dead https://help.geocliks.com/policy/ links repointed -> /privacy and /terms
  (get-app.tsx footer x2, sign-in.tsx consent, email-templates.ts uses ${siteUrl()}/privacy|/terms).

Cleanup: temp staff row stf_tmp_ops DELETED. Staff table = only stf_seed_google (Luc, superadmin).
site_settings row = all 5 URLs empty -> no icons render until he pastes his URLs. Correct ship state.

Bug found + fixed during verification: sign-in consent line rendered out of order ("…workspace.
privacy policy . See the") because the <p> is flex and each child was a flex item. Wrapped the
sentence + link + period in a <span>. Re-shot: now reads correctly.

Verified: lint 0/0 (225 files) after every edit; build 2 successful; DOM hrefs on /get-app
(["Privacy & policy","/privacy"], ["Terms","/terms"]) and /sign-in (["privacy policy","/privacy"]);
screenshots looked at: lk_signin2.png, lk_getapp_footer.png, lg_terms_top.png, lg_home_footer.png,
lg_admin_settings.png, lg_pricing.png.

Still open: no TikTok icon (lucide lacks it); mobile app has no in-app /terms or /privacy link yet
(App Store review will want a privacy URL); help.geocliks.com root still doesn't exist.

## Rounded-corners sweep — web (session 1788570932439)
Scale: 8px controls/tabs/chips, 12px cards, 6px micro-badges. User photos 12px, NOT circles.
- styles.css: --radius 0.75rem, --r-control 8px, --r-card 12px + base rule rounding button/input/select/textarea.
- /tmp/round_web.py (231 ins) + /tmp/round_fix.py (68 demotions) + /tmp/round_web2.py (70 ins) ALL RUN. Do not re-run.
- round_web2 closed the gap: <Link>/<a> styled as buttons (base CSS rule only hits real <button>).
- app-projects.tsx project card got overflow-hidden so photo thumb clips to the 12px card corner. VERIFIED in /tmp/rd4_crop.png.
CHAMFER REMOVED: user flagged the clipped top-right corners as looking broken next to the new rounds.
/tmp/uncut.py --apply RUN — stripped all 12 `cut-corner` usages, 8px on buttons / 12px on panels.
3 of them (stat-tile, empty-state, admin-workspaces) already had rounded-[12px] hidden under the clip-path.
`@utility cut-corner` / `cut-corner-lg` still DEFINED in styles.css but now unused — trivial revert if wanted.
LEFT ALONE ON PURPOSE (disclose to user):
- 4 pre-existing rounded-full pills (index.tsx:248 header Sign up, verify.tsx:79, get-app.tsx:59, app-teamspace.tsx:254).
- evidence-card.tsx excluded wholesale; stamp/QR/verified frames square per user.
- list rows (app-reports.tsx:275, app-team.tsx:153) stay square — they sit flush in bordered lists.
TODO: update design.md line 67 (still describes old radius intent). Mobile NOT started — awaiting user approval of web.

### Rounded corners — round 2 (user-reported bugs)
Two bugs he caught in zoomed screenshots, both root-caused and fixed:

1. **Chat bubbles still square.** Sweep 1 only matched the literal `border border-line`.
   Bubbles use a bare `border` + a conditional colour branch, so every one was skipped —
   along with ~45 other elements using `border border-<colour>`. Closed with
   `/tmp/round_web4.py` (45 changes / 25 files): matches bare `border` and
   `border border-<any colour>`, skips directional `border-b/t/l/r` dividers.
   Dry-run review caught real false positives: `size-3`/`size-3.5` ticks and swatches
   demoted to 4px (8px on a 14px box reads as a blob), `ui/button.tsx` and one
   `app-billing` branch skipped (base already rounds).
2. **Share icon overlapping the address** on evidence cards. The share button is
   absolutely positioned *outside* the card (a button cannot nest a button), so the
   address ran underneath it. Footer now reserves room: `cn("space-y-1.5 p-3", shareable && "pr-12")`.
   Structural (width-based), so it holds for any address length — verified with his exact
   "667 Champlain Street, Dieppe, New Brunswick, E1A 1P6" string.

Also found + fixed while verifying: in-bubble photos kept square corners inside the now-rounded
bubble — media wrappers got `overflow-hidden rounded-[8px]`. And a stray `rounded-[12px]`
on an `app-billing` button branch fighting its own 8px base.

`evidence-card.tsx` stays excluded from rounding (his "leave those like it is"); the only
radius in that file is a pre-existing circular video play button, which is correct.

Verified: lint 0/0 on 225 files, build 2 successful, and each fix cropped + zoomed —
small-scale eyeballing is what made me miss the bubbles the first time.

## Rounded corners — mobile pass (2026-09-05)

Applied the same radius scale to `packages/mobile` in two passes, 114 changes / 22 files.

Scale: 8px controls (buttons, tabs, chips, inputs, small thumbs) · 12px cards, panels,
sheets, chat bubbles · 6px micro-badges · avatars/user photos 12px rounded squares
(84px profile avatar and 42px message avatars were full circles, now rounded).

- Pass 1 (`/tmp/round_mob.py`, 98 changes / 21 files): every style key carrying a colour
  literal in `StyleSheet.create`.
- Pass 2 (`/tmp/round_mob2.py`, 16 changes / 15 files): the amber primary/CTA buttons on
  almost every screen. Pass 1 missed them because their colours are applied inline in JSX
  (`style={[styles.primary, { backgroundColor: colors.amber }]}`), so the StyleSheet body
  had no colour literal to match on. Same class of miss as the `border border-line` gap on
  web — the fix was a second survey keyed on inline-colour usage instead.
- `overflow: "hidden"` added where children sit flush against a now-rounded parent:
  `index.tsx modeTabs`, `profile-menu.tsx card`, `language-menu.tsx sheet`,
  `projects.tsx card`, and the three bottom sheets.
- Bottom-sheet top corners dropped 18 -> 12.

Left square on purpose: the burned-in stamp (`stamp.tsx`), `photo-detail.tsx` frame/photo,
and the Teamspace evidence photo card — mobile parity with web's untouched `evidence-card.tsx`.
Left circular on purpose: camera shutter + shutterCore, the camera overlay buttons, the
recording dot, and the video play badges.

`components/__ErrorBoundary.tsx` is template-managed and was excluded.

Verified: lint 0/0 on 225 files, `bunx tsc --noEmit` exit 0 in packages/mobile, build
2 successful, and zoomed screenshots of Messages, the chat thread, Profile, Teamspace,
Settings and Landing.

## Mobile drawer: Team + Messages (2026-09-05)

His request: "/app/team missing in the mobile app dropdown menu please add it. Also add messages
in that menu for the app."

Two very different sub-tasks:

1. **Messages tile** — trivial. Messages already existed as a bottom tab and a route; the drawer
   simply never linked it. Added to `TILES` in `components/profile-menu.tsx`. It is now in BOTH
   places (tab bar + drawer) on purpose — that is what he asked for.
2. **Team tile** — required a NEW SCREEN. There was no mobile team screen at all (it was a
   long-standing open item). Built `app/team.tsx` from scratch, then added the tile.

New/changed files:
- `packages/mobile/app/team.tsx` (new) — native counterpart of `/app/team`.
- `packages/mobile/queries/team.ts` — added `useTeam`, `useInvites`, `useInviteMember`,
  `useRevokeInvite`, `useSetRole`, `useRemoveMember` (only the invite-join hooks existed before).
- `packages/mobile/components/profile-menu.tsx` — two new `TILES` entries.

Scope built (mirrors the web Team page minus two fiddly bits):
- Member list: initials avatar, name, email, photo count, join date, role badge.
- Message button per member -> `messages.open` then push `/messages/<id>`.
- MANAGE (admins only, hidden on self and on the owner row): role chips + two-step
  "REMOVE FROM WORKSPACE" confirm.
- Pending invites with REVOKE (admins only).
- Invite form: email + role chips + SEND INVITE, reports emailSent/code/emailReason.

Deliberately NOT ported to mobile: the invite QR/copy-link block, and the per-member project
assignment matrix. Both are cramped on a phone and remain on the office dashboard.

Decisions:
- Tile is NOT `managerOnly` — matches the web sidebar, where Team is open to every role. Field
  crews get the read-only contact sheet the server already returns via `visibleTeammates`.
- Role chips offer admin/manager/field only, NOT owner: the server refuses to change the owner
  row, so offering owner would only produce an error.
- Icon `person-add-outline` for Team, because `people-outline` is already Teamspace.
- Screen copy stays English, consistent with the standing "/app/team is English on purpose"
  decision. The two tile LABELS use existing i18n keys `nav.team` + `nav.messages`, which
  already existed in all 14 locale files -> zero i18n work.

Permissions verified against `api/routes/team.ts`: invite/revokeInvite/setRole/remove are all
`requireRole(context.role, "admin")` (owner+admin), NOT manager. Owner/self/fellow-admin remain
server-protected.

Verified: lint 0/0 (226 files), mobile `tsc --noEmit` exit 0, `bun run build` 2 successful,
screenshots of the drawer (11 tiles, both new ones), the Team screen, and the expanded MANAGE
panel, all inspected zoomed.

## Mobile header pass + map diagnosis (2026-09-05)

Four-item request from Luc.

### 1. Mobile map blank (Android) — DIAGNOSED, no code change
- `packages/mobile/components/field-map.native.tsx` is the real map (react-native-maps,
  `PROVIDER_GOOGLE`, `customMapStyle={MAP_STYLE}`). `field-map.tsx` is the web fallback
  ("LIVE MAP AVAILABLE ON DEVICE") — so the Expo web preview can NEVER show a real map and
  the bug is not reproducible in the screenshot harness.
- `packages/mobile/app.json` ALREADY carries both native keys:
  `expo.android.config.googleMaps.apiKey` and `expo.ios.config.googleMapsApiKey`
  = AIzaSyAj6pNyTbRjqrrDG5tS9-zvVrWCcw_AE1U. Config is NOT the gap.
- His screenshot shows the styled beige base + our own "24 PINS · LAST FIX" caption rendering,
  with real coords in the log below => MapView mounts and the data layer is fine; only Google's
  tiles fail. Classic signature of an unauthorised key on the Android side.
- Remaining causes, both OUTSIDE this sandbox: (a) his installed APK predates the key being added
  to app.json — native config only ships in a NEW native build; (b) "Maps SDK for Android" not
  enabled, or the key is referrer/app-restricted, on GCP project geocliks-d12b8 (222895504630).
- Cannot verify a native map render here and cannot touch the Google Cloud console. Told him so.

### 2a. Removed the count chip from mobile page headers
It was colliding with the page title on a real device (his photos A and B).
- `(tabs)/teamspace.tsx` — dropped `teamspace.photosCount`; wrapper View collapsed to `<LanguageMenu />`
- `(tabs)/map.tsx` — dropped `map.fixes`; wrapper View collapsed to `<LanguageMenu />`
- `(tabs)/projects.tsx` — dropped `projects.jobs`; wrapper View KEPT (still holds the "+" button)
- Deleted the now-dead `count:` StyleSheet key in all three.
- i18n keys `teamspace.photosCount` / `map.fixes` / `projects.jobs` LEFT IN all 14 locale files —
  removing them means touching 14 files for zero benefit and risks the parity check.

### 2b. Page titles are now amber
`colors.foreground` -> `colors.amber` on the page title of 12 screens:
- tabs: teamspace, projects, map, messages, settings, index (Capture)
- pushed: team, share, reports, plans, profile, queue
Deliberately NOT changed: `messages/[id].tsx:160` — that title is the *contact's name*, not a page
title, and orange text there reads like a tappable link. `landing.tsx` was already amber.
Applied via `/tmp/hdr.py --apply` (assert-based, single-shot — do NOT re-run).

### 3. Stray invite revoked
`inv_MTILDGJBNDYXV0PJCZ` / code `byy316xgs3` -> status `revoked`.
It lived in the OPS TEST workspace `org_sgCFWGKy3w2mMKXhoF1wP554b9YcCFpc`, NOT in his real
"We Deliver" org — which is exactly why he could not see it on his own Team screen.
Verified: `select ... from invites where status='pending'` now returns `[]` database-wide.
Ops test Team screen should now read "2 / 5 SEATS · 0 PENDING".

### 4. Admin-removes-admin — LEFT AS IS (his call)
Only the workspace owner can remove an admin; two admins cannot remove each other.
Owner / self / fellow-admin stay protected. Do not re-ask.

### Verification
lint 0/0 (226 files) · mobile `bunx tsc --noEmit` exit 0 (servers down) · `bun run build` 2 successful
· web 200 / mob 200 · screenshots inspected zoomed: /tmp/h_teamspace_crop.png, /tmp/h_map_crop.png,
/tmp/h_projects_crop.png — all three show the amber title, no count, no overlap, "+" button intact.

## Maps key swap — new Google Cloud key (2026-09-05)

**Why:** user's Android Map tab rendered a flat beige rectangle (no tiles) while the GPS/coordinate
log below it was fine — i.e. the data layer worked, only Google's tiles failed. Root cause: the old
key belonged to the wrong/unconfigured project.

**Console walkthrough (user side, done by him with click-by-click guidance):**
- Real project is the Firebase-created one: display name **GeoCliks**, id `geocliks-d12b8`, number
  `222895504630`. A stray project named **GeoLink** exists and is unused — ignore it.
- He first landed on **Create OAuth client ID** by mistake (that screen demands a SHA-1). OAuth
  client id is for "Sign in with Google", NOT maps. Maps needs **API key**.
- APIs enabled and verified from screenshots (a card reading "Disable" means it IS enabled):
  Maps SDK for Android, Maps SDK for iOS, Maps JavaScript API, **Maps Static API**.
  (Maps 3D SDK for Android is also on — not needed, harmless.)
- Key named "GeoCliks", **Application restrictions = None**, API restrictions = those four APIs.

**Why restrictions are deliberately None (for now):** an Android-restricted key needs a SHA-1 that
does not exist until his first native build, and the share-page static map is fetched
**server-side** (`packages/web/src/api/lib/static-map.ts`) so an Android/referrer restriction would
break it. One unrestricted key covers phone + web + server-side share images.
**Follow-up:** after the first build, restrict to Android package `com.timemark_a7k2.runable` +
SHA-1 — and if he does, add a separate `GOOGLE_MAPS_SERVER_KEY` or share-page maps break.

**Applied by `/tmp/mapkey.py`** (assert-based, single-shot, never prints the key — do NOT re-run):
- `packages/mobile/app.json` → `expo.android.config.googleMaps.apiKey` and
  `expo.ios.config.googleMapsApiKey` (exactly 2 occurrences asserted).
- root `.env` → `VITE_GOOGLE_MAPS_API_KEY` updated.
- root `.env` → **`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` line DELETED**. Repo-wide grep showed it only
  ever appeared in task.md prose, never in code; the phone reads the key from `app.json` native
  config. `.env` is now 23 lines.
New key fingerprint `AIzaSyCo…WGTc` (39 chars). Old key fully purged from source and from `dist`.

**The three real consumers of the key:**
1. `packages/web/src/web/components/evidence-map.tsx:13` — `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`,
   the live Maps JavaScript map at `/app/map`. Renders "Map key missing" text when unset.
2. `packages/web/src/api/lib/static-map.ts:17` — `GOOGLE_MAPS_SERVER_KEY || VITE_GOOGLE_MAPS_API_KEY`,
   Static Maps for public `/share/:token` pages. **Never throws** — silently returns a placeholder
   SVG on failure, so it fails invisibly. That is why Maps Static API had to be enabled.
3. `packages/mobile/components/field-map.native.tsx` — react-native-maps `PROVIDER_GOOGLE`, reads
   the key from **native config**, so it only ships in a new build. **Unverifiable in sandbox.**

Reverse geocoding (`Location.reverseGeocodeAsync`, `(tabs)/index.tsx:155`) is Expo/OS, not Google —
street addresses are unaffected by any GCP change.

**⚠️ Turbo cache trap:** the first `bun run build` after editing `.env` reported "2 cached, FULL
TURBO" and the stale `packages/web/dist/assets/*.js` still contained the OLD key. An `.env` change
does not invalidate the Turbo cache. Fix:
`rm -rf packages/web/dist .turbo node_modules/.cache/turbo && bun run build` → "0 cached, 2 total".
Always verify `dist` contents after any `.env` change, not just the exit code.

**Verification:** lint 0/0 (226 files) · mobile `tsc --noEmit` exit 0 · build 2 successful ·
old key absent from `packages/mobile packages/web/src .env` and from a freshly rebuilt `dist` ·
new key present in `dist/assets/index-DkV-RwGT.js` · web 200 / mob 200.
**Web map screenshot-verified at 1280x900:** real Google tiles, roads, labels, 6 amber pins, dashed
amber route, working zoom controls, "Map data ©2026 Google, INEGI" attribution, our
`28 PINS · LAST FIX …` caption. **No "for development purposes only" watermark** → key valid, APIs
enabled, **billing active**. JS probe returned `{"errs":[],"gmaps":true}`.

**Still open:** the phone app needs **Publish + reinstall** for the native key to reach Android/iOS.
The Expo web preview renders the `field-map.tsx` fallback panel ("LIVE MAP AVAILABLE ON DEVICE"),
never a real map — only the user can confirm the device fix.

## Mobile squeeze pass — tab bar + headers (2026-09-05)

User screenshots (real Android device, post-Publish): tab bar sat flush against Android's nav
strip; Messages / Upload Queue / Capture headers were squeezed (title clipped, right-hand buttons
cut off at the screen edge). Applied by `/tmp/squeeze.py --apply` (assert-based, do NOT re-run),
plus one follow-up edit to the tab-bar height after looking at the render.

- `app/(tabs)/_layout.tsx` — added `useSafeAreaInsets`; `bottomGap = Math.max(insets.bottom, 10) + 8`;
  `tabBarStyle` now `height: 68 + bottomGap`, `paddingTop: 8`, `paddingBottom: bottomGap`.
  `tabBarLabelStyle` letterSpacing 0.6 → 0.2 (labels now read "Capture / Messages / Map / Projects /
  Settings" in full instead of "Capt… / Mess…"; only "Teamspace" still truncates).
  ⚠️ First attempt used `height: 56 + bottomGap` / `paddingTop: 6` and the labels were **clipped at
  the baseline** — always render and look at the tab bar after changing its height.
- `app/(tabs)/messages.tsx` — title gets `numberOfLines`, `flexShrink: 1`, `minWidth: 0`,
  `marginHorizontal: 8`, fontSize 20 → 18, letterSpacing 1.2 → 0.8; right group gap 8 → 6,
  `flexShrink: 0`; icon buttons 38 → 36.
- `app/queue.tsx` — title `numberOfLines` + `flexShrink: 1` + `minWidth: 0` + `marginRight: 10`,
  letterSpacing 3 → 1.5; header `paddingTop` 8 → 14, added `paddingBottom: 4`; Upload button
  `minWidth` 96 → 84, paddingHorizontal 14 → 12.
- `app/(tabs)/index.tsx` (Capture) — title letterSpacing 3 → 1.5, `headerLeft` marginRight 10 → 8,
  `headerRight` gap 8 → 6, chip paddingHorizontal 8 → 7, chipText letterSpacing 1 → 0.5.
  "CAPTURE" no longer truncates to "CAPT…".

Verified: lint 0/0 (226 files) · mobile `tsc --noEmit` exit 0 · web 200 / mob 200 ·
screenshots at 390x844 checked zoomed: `/tmp/s_messages_crop.png`, `/tmp/s_queue_crop.png`,
`/tmp/s_capture_top.png`, `/tmp/s_tabs2.png`.
⚠️ The bottom gap uses the real device inset, which is 0 in the browser preview — only the user's
phone can confirm the clearance is right. Needs Publish + reinstall.

**Open question raised by the user (not yet implemented):** add a **Delivery** evidence type for
delivery-service confirmation. Would touch the `tag` enum in `api/database/schema.ts`,
`api/routes/photos.ts` (L53), `api/routes/reports.ts` (L14), the mobile Capture picker, the
`TAG_LABELS` maps in `web/components/evidence-card.tsx`, `web/pages/app-reports.tsx`,
`web/pages/app-teamspace.tsx`, and `tag.*` keys in all 28 i18n files.
**Also spotted:** `web/pages/app-teamspace.tsx` L17 `TAGS` omits `general` ("Work"), so Work-tagged
photos cannot be filtered on the website even though `app-reports.tsx` L70 includes it.

---

## Pickup + Delivery evidence types with proof of delivery (2026-09-05)

User asked for a Delivery evidence type "for delivery services confirmation", then approved the
full version: Delivery button PLUS recipient name PLUS an on-screen drawn signature, plus a Pickup
type, plus fixing the missing "Work" filter chip on Teamspace, plus a back arrow "were its need it".

He then corrected the signature behaviour explicitly: **"not look permanently choice is left to the
field team member if the package require signature the the field team member can just click it on
so it force signature before picture."** => `requireSignature` defaults to **false**; the crew
member flips it on per capture. Never make it permanently required (a no-contact drop must stay
capturable).

### Database (`packages/web/src/api/database/schema.ts`)
Three columns on `photos`, added right after the existing `signature` column:
`recipient` (text), `signature_path` (text), `signature_box` (text). `bun run db:push` applied.

WARNING: the pre-existing `signature` column is the **HMAC anti-tamper signature** and was left
untouched. That is why the drawn signature is `signaturePath`. Never conflate the two.

### Storage-format decision
The signature is stored as **SVG path data (a string)**, not an uploaded image: no presign, no S3
object, nothing extra to upload in a basement or dead zone, and the web redraws it as vector at any
size. `signatureBox` holds the viewBox (`"0 0 W H"`) so proportions survive. API caps the path at
20,000 chars; the pad stops recording at 19,000.

### API
- `photos.ts` — `tagEnum` gained `pickup` + `delivery`; `create` input gained `recipient` (<=120),
  `signaturePath` (<=20000), `signatureBox` (<=40); the insert writes all three with `?? null`.
  `decoratePhotos` spreads `...row`, so `list` picks the columns up automatically.
- `reports.ts` — its own inline tag enum gained both values.

### Mobile
- `lib/queue.ts` — `QueuedPhoto["tag"]` union extended; three optional fields added; `uploadOne`
  forwards them with `?? null` (items already in AsyncStorage `geocliks.queue.v1` predate them).
- **NEW `components/signature-pad.tsx`** — `PanResponder` + `react-native-svg` (15.12.1, already
  installed). Strokes live in refs because PanResponder closes over its handlers once; state only
  mirrors them for rendering. Clear button, baseline placeholder, viewBox from `onLayout`, resets
  itself when the parent sets `value` back to null.
- `app/(tabs)/index.tsx` — `TAGS` gained pickup (`cube-outline`) + delivery
  (`checkmark-circle-outline`); new state `recipient` / `signaturePath` / `signatureBox` /
  `requireSignature` (**false**) / `podError`; derived `isPod`; `commit()` computes `finalTag` and
  writes the three fields, clearing them after enqueue; `shoot()` blocks with `capture.needSign`
  when the toggle is on and either field is empty. `commit`'s dependency array had to be expanded —
  `react-hooks(exhaustive-deps)` is a hard error and `biome-ignore` does NOT suppress it.
- `components/photo-detail.tsx` — labels, a conditional RECEIVED BY row, and an `<Svg><Path>` block.
- `app/queue.tsx` — back arrow added (see below).

### Web
- `app-teamspace.tsx` — `TAGS` now includes `general` ("Work"), `pickup`, `delivery`. The missing
  `general` chip was the pre-existing bug: Work-tagged photos were unfilterable on the website.
- `app-reports.tsx`, `components/evidence-card.tsx` — both new tags added.
- `components/photo-drawer.tsx` — conditional "Received by" row + an inline `<svg>` that redraws the
  path with `stroke="currentColor"`.
  WARNING: lint rejects `role="img"` on an `<svg>` (`jsx-a11y(prefer-tag-over-role)`). Use
  `aria-label` + `<title>` only.

### i18n
11 locale files (ar, de, en, es, fr-CA, it, pl, pt-BR, tl, vi, zh) — **11, not 14**. 11 new keys:
`tag.pickup`, `tag.delivery`, `capture.recipient`, `capture.signature`, `capture.requireSignature`,
`capture.signHere`, `capture.clearSign`, `capture.saveSign`, `capture.needSign`,
`evidence.recipient`, `evidence.signature`. Applied by `/tmp/i18n_delivery.py --apply`, which also
copies each web locale verbatim into `packages/mobile/i18n/`. Parity + mirror verified.
`capture.saveSign` ("Done") shipped but is currently unreferenced — the pad ended up with only a
Clear button.

### Back arrows
Audited every pushed mobile screen with `grep -c 'chevron-back'`: reports, share, plans, profile,
team, verify, join, messages/[id] all already had one. **`queue.tsx` was the only one missing it.**
Added `useRouter` + a `chevron-back` Pressable wrapping the header title, in a `headerLeft` row
(`flexShrink: 1, minWidth: 0` so the earlier squeeze fix survives). Uses
`accessibilityLabel={t("common.close")}` — mobile i18n has no `common.back`.

### Verified
lint 0/0 across 227 files; `bunx tsc --noEmit` in packages/mobile exit 0; `bun run build` 2
successful; db:push applied; i18n parity + mobile mirror byte-identical; web 200 / mob 200.
Screenshots at 390x844 confirm: Pickup + Delivery in the evidence-type list; selecting Delivery
reveals RECIPIENT NAME, the Require-signature toggle **unchecked by default**, and the Sign-here pad
with its Clear button; the toggle turns amber when switched on; the Upload Queue back arrow renders
without re-squeezing the header.

### NOT verified
Real finger-drawing on the pad — react-native-web + CDP cannot do true touch strokes. The user must
test signing on his Android device. No capture has yet carried recipient/signature into the DB.

### Follow-up
Reports (PDF / Excel / ZIP / KMZ) do **not** yet include the recipient or the signature. That would
be work in `packages/web/src/api/lib/exports.ts`.

### Scripts (applied, assert-guarded — do NOT re-run)
`/tmp/deliv1.py` schema+API+queue, `/tmp/deliv2.py` capture screen, `/tmp/deliv3.py` web,
`/tmp/deliv4.py` queue back arrow + photo-detail, `/tmp/i18n_delivery.py` locales.

---

## Proof of delivery in exported reports + mobile Teamspace evidence dropdown (2026-09-05)

### 1. Mobile Teamspace evidence-type dropdown
`packages/mobile/app/(tabs)/teamspace.tsx` — the wrapping chip row was replaced with a
select + Modal sheet mirroring the PROJECT filter directly beneath it. `Tag` union and
`TAGS` extended with `pickup`/`delivery`; `TAG_LABELS` gained both. `general` ("Work") was
already in TAG_LABELS but unreachable — proof the mobile list had drifted from the web one.
It is now reachable. Dead styles `filters`/`pill`/`pillText` deleted (unused = hard lint error).
Label and sheet title reuse the existing key `capture.evidenceType` — no new locale keys.
`accessibilityLabel` is required on the Pressable and is also what makes it clickable from CDP.
`packages/mobile/queries/photos.ts` L6 — a THIRD copy of the tag union, widened to match.

Verified: lint 0/0, `bunx tsc --noEmit` exit 0, screenshotted at 390x844 and inspected —
all nine options render (All, Arrival, Before, Work, After, Issue, Departure, Pickup, Delivery).

### 2. Proof of delivery in exports — `packages/web/src/api/lib/exports.ts`
Helpers added above `const INK`: `signatureStrokes()` (regex over `M`/`L` pairs -> point
arrays, single-point strokes discarded), `signatureSize()` (parses the `"0 0 W H"` viewBox,
falls back to 320x150), `signatureSvg()` (standalone SVG for the ZIP; calls `xml()` declared
later — fine, function declarations hoist).

- **PDF** — `RECEIVED BY` meta row + the signature drawn with `page.drawLine()`. The signature
  pad only ever emits straight segments (`M` on grant, `L` on move), so this is TRUE VECTOR,
  no rasterising and no new dependency. y is flipped (`baseY - y*sy`): SVG y grows down, PDF up.
- **XLSX** — `Received by` (w24) and `Signature` (w12, "Signed"/blank) between Note and Integrity.
  Deliberately NOT an embedded image: ExcelJS anchoring drifts when row heights change, and the
  sheet is for sorting/filtering. The PDF is the client-facing artifact.
- **ZIP** — real `signatures/<PHOTO_CODE>.svg` per signed record; manifest gained `recipient`
  and `signature_file`, both through the existing `csv()` helper. README updated.
- **KMZ** — `Received by` in the placemark CDATA via `xml()`. NO signature image: Google Earth's
  HTML support is limited and cannot be verified from this sandbox.

### 3. TWO PRE-EXISTING BUGS FOUND AND FIXED (not caused by the above)
**Every PDF export had been failing with a 500.** A control photo with no recipient and no
signature failed identically, which is what exposed it. Root cause: a hardcoded `→` (U+2192)
in the cover's "Date range" row — pdf-lib's `StandardFonts` are WinAnsi-only and throw
`WinAnsi cannot encode "→"`, killing the whole document. Replaced with an en dash (WinAnsi 0x96).

The same class of bug was live on every dynamic string: one emoji in a note, or a non-Latin
recipient name, would 500 the entire report. Added `wa()` — keeps WinAnsi-encodable chars
(0x20-0x7E, 0xA0-0xFF, plus the 0x80-0x9F specials in `WIN_EXTRA`), maps arrows/checks to
ASCII via `WA_SUBS`, and otherwise strips diacritics (NFD, drop `\p{M}`) so Vietnamese etc.
degrade to base letters instead of crashing. Applied to every dynamic `drawText`: cover title
lines, cover meta values, page header title, photo code, per-photo meta values.
LIMITATION: CJK/Arabic still drop out — that needs an embedded Unicode font (fontkit + a TTF).
NOTE: write these escapes as `\uXXXX` from Python, never literal unicode — a literal produced
`\€` in the TS source and 36 `no-useless-escape` errors.

**Signature overflowed into the next photo block.** `blockH` is ~371pt, the image takes
`blockH - 132`, and the 6 metadata rows nearly fill the remaining ~114pt, so a 40pt signature
had nowhere to go and drew over the following photo. Fixed by computing `strokes`/`sigH`
BEFORE the image is sized and reserving it: `imgH = blockH - 132 - (sigH ? sigH + 12 : 0)`.

### Verification actually performed
lint 0/0 (227 files) · `bun run build` 2 successful · all four formats built directly through
`buildPdf/buildXlsx/buildZip/buildKmz` · PDF rendered to PNG via `pdftoppm` and INSPECTED at
250% — "RECEIVED BY Marcel Doiron" present, both strokes sharp, no collision with photo 2 ·
ZIP listed (`signatures/TM-S7ZZ-R73F-S4PF.svg`, 303 bytes, valid) · manifest columns confirmed ·
XLSX headers read back with openpyxl · KMZ `Received by</b> Marcel Doiron` confirmed.

### Test data seeded (kept)
`pho_MTJ3H1FGVJB079KXK7` in `org_sgCFWGKy…` now has `recipient='Marcel Doiron'`,
`signature_path='M20 90 L40 60 L60 95 L85 55 L110 92 M130 60 L145 100 L160 62'`,
`signature_box='0 0 320 150'`, `tag='delivery'`. Every other photo still has NULL for both —
without seeding, the export code runs clean and produces nothing, which is indistinguishable
from working code. Always seed before claiming export work.

### Scripts (applied, assert-guarded — do NOT re-run)
`/tmp/ts_dropdown.py` mobile dropdown · `/tmp/exp_sig.py` exports (10 edits) ·
`/tmp/wa_fix.py` + `/tmp/wa_fix4.py` WinAnsi sanitizer (wa_fix2/3 were broken attempts) ·
`/tmp/sig_layout.py` signature space reservation.

---

## Bug report from the user (Android phone, Samsung, 3-button nav) — 2 items

He tested the published build on his phone and reported two things, with a screenshot of an
Android system dialog: "Something went wrong with GeoCliks / GeoCliks closed because this app
has a bug." (`/home/user/Attachments/d14d9f7d-9ee6-4da4-91a0-6df1c63cb20c_4Ti0pO.jpeg`).

### 1. Too much dead space between the bottom tab bar and the Android system buttons
`packages/mobile/app/(tabs)/_layout.tsx` — `bottomGap` was `Math.max(insets.bottom, 10) + 8`.
`insets.bottom` already reports the FULL height of the system button strip, so the `+8` was
padding stacked on top of an inset that already accounted for it. Now:
`const bottomGap = Math.max(insets.bottom, 8);` — the floor only covers devices that report no
inset at all. `height: 68 + bottomGap` and `paddingBottom: bottomGap` unchanged.

On his 3-button-nav Samsung (`insets.bottom` ≈ 48) the gap goes 56 → 48. On the Expo web preview
`insets.bottom` is 0, so it goes 18 → 8.
LIMIT: the web preview cannot show real Android insets, so a sandbox screenshot does NOT prove
the on-device result. If 8dp is not enough for him, the next levers are the `68` base height and
`paddingTop: 8` — do not over-trim on the first pass.

### 2. App hard-crashes the moment he draws in the signature box
`packages/mobile/components/signature-pad.tsx` fully rewritten (184 → 217 lines).

COULD NOT REPRODUCE the native crash — the Expo web preview has no real finger input. This is
hardening against every native-crash candidate found by inspection, not a confirmed root-cause
fix. Three genuine defects found and fixed:

1. **Non-finite coordinates → `MNaN NaN` → native path parser crash (PRIMARY SUSPECT).**
   `e.nativeEvent.locationX/locationY` can be `NaN`, and that string goes straight to
   react-native-svg's native Android path parser. A parse failure there is an uncaught native
   exception that terminates the process — which matches his screenshot exactly (system "app has
   a bug" dialog, no JS red box). Guard: `usable = (x,y) => Number.isFinite(x) && Number.isFinite(y)`,
   applied in `onPanResponderGrant`, `onPanResponderMove` AND `onLayout`.
2. **Duplicate React keys.** Was `key={d.slice(0,24)}` — path data is not unique and the first 24
   chars stay identical for a whole stroke. Strokes are now `type Stroke = { id: string; d: string }`
   with ids from a `seqRef` counter (`s1`, `s2`, …), so `key={s.id}`. Index keys deliberately
   avoided (`noArrayIndexKey`). NOTE: duplicate keys produce a warning, not a native kill — I
   briefly blamed them for the crash and corrected myself in the same turn. Do not resurrect it.
3. **Degenerate paths and a zero-sized viewBox.** A lone `M x y` with no `L` draws nothing;
   `drawable = (s) => s.d.includes("L")` filters it out of both rendering and storage. `onLayout`
   bails unless `width > 0 && height > 0`, so the viewBox can never be `"0 0 0 0"` (native scale
   by 1/0).

Also: `currentRef` is `useRef<Stroke | null>(null)`; `<Svg>` carries `pointerEvents="none"` and
renders only when `box && !empty`.
UNCHANGED and must stay: `MAX_PATH_CHARS = 19000`, `round()`, the `Props` shape, the
`onChangeRef` pattern, the clear button, the `StyleSheet.create` block, and the emitted format —
`strokesRef.current.map(s => s.d).join(" ").trim()`, plain `M`/`L` polyline data. The exports
code depends on that format.

### Verification actually performed
lint 0/0 (227 files) · mobile `bunx tsc --noEmit` exit 0 · `bun run build` 2 successful ·
drove the mobile web preview (`/tmp/cdp8.mjs`, 390×844, steps `/tmp/steps_sig4.json`): signed in,
tapped EVIDENCE TYPE → Delivery, located the 358×150 pad and dispatched a synthetic
mousedown + 24 mousemove + mouseup sine stroke. Result: one `<path>`, viewBox `0 0 358 150`,
data `M30 105 L38 93 L46 83 …`, **no `NaN`, no JS errors**, stroke renders correctly in
`/tmp/sig_d.png`. That validates the ids/guards/rendering logic; it CANNOT reproduce the native
Android crash.

### If the crash persists on his phone
No way to read his Android crash log from this sandbox, and he is a novice — do not send him to
`adb logcat` casually. In order of preference:
1. Wrap the `<Svg>` subtree in a small error boundary so a render failure degrades instead of
   killing the app (`components/__ErrorBoundary.tsx` is template-managed — NEVER edit it; add a
   separate one).
2. Replace the live react-native-svg preview with a plain `View`-based stroke renderer while still
   recording path data, removing the native parser from the touch path entirely.
3. Ask for the exact repro: first touch or after a few strokes; portrait vs landscape; light vs dark.

### Sandbox note
The `/tmp/cdpprof8` profile had lost its session — re-signed in as
`ops.admin1788258771@timemark.dev` via `/tmp/steps_login8.json` before the pad could be reached.
Locating the pad by DOM traversal from the "Sign here" label failed twice; what works is walking
up from that label and taking the child whose `offsetHeight` is 140–160.

---

## Signature sheet rewrite (full-screen pad) — DONE, verified

He reported three symptoms after the crash fix: nothing drew inside the box, there was no OK
button, and the shutter then falsely demanded a signature. All three were one defect, and it was
my own regression: the pad rendered from `const live = value === null ? [] : paths`, where `value`
is the parent's `signaturePath` — null until commit. So it drew an empty array mid-stroke, and the
same render-phase block cleared `strokesRef`/`currentRef` on the first move, so release found
nothing to commit.

`packages/mobile/components/signature-pad.tsx` was rewritten (~360 lines) into two components:
- **`SignaturePad`** — inline 96pt preview that redraws the stored signature via `parse()`, or
  shows a "Sign here" affordance. Tapping it opens the sheet. Props are now
  `{ value, valueBox, onChange, open, setOpen }`.
- **`SignatureSheet`** — full-screen `Modal` (`transparent`, `animationType="slide"`), rendered as
  `{open ? <SignatureSheet/> : null}` so it MOUNTS FRESH every open and owns its drawing state.
  Canvas is `flex: 1` — measured 358×713 vs the old 358×150, ~4.7× the area. Footer: Cancel + Done.

**`normalize(strokes)`** is the important part: it regex-scans `[ML] x y` pairs, computes the ink's
bounding box, re-bases every point on it with `TRIM_PAD = 6`, and emits `box = "0 0 w+12 h+12"`.
Without it the stored viewBox was the pad's `0 0 358 713`, which made the inline preview scale the
ink to ~13% (`preserveAspectRatio` defaults to `meet`) and fed a 713-tall box to the PDF export's
`signatureSize()` — that would have re-broken the signature-overflow bug fixed earlier.
**The emitted data is still plain `M`/`L` polyline text; the exports depend on that. Never change it.**

`boxRef` was deleted (write-only after `commit()` switched to `normalize()`; unused vars are a hard
lint error). The inline Clear button was removed on purpose — if a recipient signs and leaves, a
stray tap must not destroy something unrecreatable. Clear now lives only in the sheet.

`(tabs)/index.tsx` wiring: `const [signOpen, setSignOpen] = useState(false)`; the REQUIRE SIGNATURE
toggle opens the sheet when it is switched on and no signature exists yet; `<SignaturePad>` receives
`valueBox`, `open`, `setOpen`.

No new i18n keys. Wires up the previously unreferenced `capture.saveSign` ("Done").

**Verified:** lint 0/0 · mobile tsc 0 · build 2 successful · preview run `/tmp/steps_sig6.json`:
sheet opens, stroke draws live, Done commits, stored viewBox `0 0 282 131` (was `0 0 358 713`),
no `NaN`, no JS errors, inline preview legible.
**NOT verifiable here:** real finger drawing (synthetic mouse only) and whether the flex-inside-Modal
canvas measures correctly via `onLayout` on a real device. Told him so.

---

## Remembered Evidence Type + Project on Capture — DONE, verified

His request: a field member should not have to re-pick the evidence type and project on every shot.
Design he approved: remember the tag **per mode** — CLOCK mode keeps its existing arrival/departure
override completely untouched; `pickup`/`delivery` persist like any other tag ("a delivery driver
doing forty drops a day is precisely who this feature is for"); the project persists but is
**validated on load**. `requireSignature`, `recipient` and `signaturePath`/`signatureBox` are
deliberately NOT persisted — carrying a recipient name or a signature onto the next customer's drop
is a data-integrity problem.

All in `packages/mobile/app/(tabs)/index.tsx`, using the AsyncStorage pattern already established
in `hooks/use-colors`-style hooks (`void AsyncStorage.getItem(...).then(...)` on mount,
`void AsyncStorage.setItem(...)` on change).

Keys: `geocliks.capture.tag.v1`, `geocliks.capture.project.v1`.

- New state `photoTag` — the last tag used outside CLOCK mode.
- Mount effect reads the stored tag and **validates it against `TAGS`** before use, so a value left
  by an older build cannot poison state; applies it to `photoTag` and to `tag` (via a functional
  update that only overwrites the untouched `"general"` default).
- Second mount read stores the saved project id in `savedProject` wrapped as `{ id }` so
  "not loaded yet" is distinguishable from "nothing saved".
- An apply effect waits for BOTH `savedProject` and `projects.data`, checks
  `rows.some(p => p.id === saved)`, and sets it once behind a `projectApplied` ref guard so it
  cannot re-fire on refetch or stomp a later user choice. Deps are honest —
  `react-hooks(exhaustive-deps)` is enforced and `biome-ignore` does NOT suppress it.
- `rememberTag` / `rememberProject` helpers write on every pick; picking Unassigned does
  `removeItem`. `rememberProject` also sets the ref guard, so a deliberate pick wins over a slow
  storage read.
- `pickMode`: `if (next === "clock") setTag("arrival"); else setTag(photoTag);` — video is treated
  like photo (my call; it had no override before, so the tag already survived within a session).

No new i18n keys.

**Verified** — lint 0/0 (227 files) · mobile `bunx tsc --noEmit` exit 0 · `bun run build`
2 successful · four preview runs on `/tmp/cdp8.mjs` at 390×844 (AsyncStorage on react-native-web is
backed by `localStorage`, so this IS testable here):
1. Picking Delivery + "Metro Loop Splice Audit" wrote
   `["geocliks.capture.tag.v1","delivery"]` and `["…project.v1","prj_MTJ3H294WZ41V3WKRG"]`.
2. Seed + `location.reload()` → screen came back showing **Delivery** and **Metro Loop Splice Audit**.
3. Switching to CLOCK still forces **Arrival**; switching back to PHOTO restores **Delivery**.
4. A bogus saved id (`prj_DELETED_NOT_REAL`) falls back silently to **Unassigned** while the saved
   tag (Pickup) still restores.

⚠️ Chrome's `chrome.kill()` in the CDP driver does not flush `localStorage` to the profile, so
values do NOT survive between separate driver launches — seed + in-page `location.reload()` is the
way to test restore behaviour.

---

## Proof of delivery on the public pages (/share/:token and /v/:code) — DONE, verified

He reported the drawn signature showing correctly in the app but missing on
`geocliks.com/share/…` and `geocliks.com/v/TM-…`. Cause: neither public API route ever selected
`recipient` / `signaturePath` / `signatureBox`, so the pages had nothing to render. The web app's
own `photo-drawer.tsx` already rendered them — only the public surfaces were blind.

**API**
- `routes/share.ts` → `view`: each photo row now returns `recipient`, `signaturePath`,
  `signatureBox`.
- `routes/verify.ts` → `byCode`: the single-photo link lookup was widened to all live links in the
  org. `published` (which gates the image bytes) is unchanged — still requires a link created for
  that exact photo. A new `shared` flag is true when the photo is reachable through ANY live link
  (its own, its project's, or a workspace-wide one) and gates `recipient` / `signaturePath` /
  `signatureBox`. Rationale: the name and handwriting are personal data, so they must not leak from
  a bare code, but if the photo is already public on a /share page there is nothing left to
  protect. Revoking every covering link hides them again.

**Web**
- `components/evidence-card.tsx`: `EvidencePhoto` gained optional `recipient`, `signaturePath`,
  `signatureBox`.
- `pages/share-view.tsx`: the photo modal gains a RECEIVED BY row and a signature panel below the
  metadata grid.
- `pages/verify.tsx`: RECEIVED BY field appended to the field card, plus a SIGNATURE panel under it.
- Both reuse the exact `<svg viewBox={box ?? "0 0 320 150"}><path stroke="currentColor" …>` render
  from `photo-drawer.tsx`. No new i18n keys — `evidence.recipient` and `evidence.signature` already
  exist in all 11 locales.

**Verified:** lint 0/0 (227 files) · web `bunx tsc --noEmit` 0 · mobile `bunx tsc --noEmit` 0 ·
`bun run build` 2 successful · rendered both pages in the preview against the seeded row
`pho_MTJ3H1FGVJB079KXK7` (`TM-S7ZZ-R73F-S4PF`, project link token `jqfbhrrmc2tpjqr234b8gb`):
`/v/TM-S7ZZ-R73F-S4PF` shows RECEIVED BY "Marcel Doiron" and the signature at 130px
(`/tmp/pod_verify.png`); the /share modal shows RECEIVED BY plus the signature at 110px
(`/tmp/pod_share.png`). Both screenshots inspected.

Note: this is **web/server** work — it goes live with a Publish of the site, no app reinstall needed.

---

## "Unassigned" instead of "—" for photos with no project — DONE, verified

His request: a photo with no project should read **Unassigned** in the Project/Job field rather
than an em dash, which looks like missing data.

- `packages/web/src/web/pages/verify.tsx` — JOB field: `d.projectName || t("queue.unassigned")`.
- `packages/web/src/web/pages/share-view.tsx` — the photo modal's PROJECT row:
  `open.projectName ?? t("queue.unassigned")`.
- `packages/mobile/app/verify.tsx` — same for the in-app verify screen.

Existing key `queue.unassigned` ("Unassigned") — already present in all 11 locales, and it is the
same word the capture screen's PROJECT picker uses, so the wording matches end to end.

Deliberately NOT changed: the project chip on the evidence card (`evidence-card.tsx` renders it
only when a project exists). Stamping "Unassigned" on every card in a gallery is noise; a blank
chip there reads as "no job", which is correct.

**Verified:** lint 0/0 (227 files) · mobile `bunx tsc --noEmit` 0 · `bun run build` 2 successful ·
`/v/TM-TEST-VID0-0001` (the seeded photo with `project_id` null) now renders JOB = **Unassigned**,
screenshot `/tmp/unassigned_zoom.png` inspected.

## Map on the public code page (/v/:code)

Reported: "The map dont show on it now but the signature show" on https://geocliks.com/v/TM-691P-Y6ES-PRTA.

Finding: the /v/ page never had a map. It only printed the LOCATION coordinates and the ADDRESS,
plus an "Open record" button (lucide MapPin icon) linking to the /share page, where the static map
lives. Nothing was removed by the proof-of-delivery or Unassigned changes — verified by reading
verify.tsx: no EvidenceMap, no map.png reference existed there.

Fix — added the map the page should always have had, mirroring the share page's approach:
- NEW packages/web/src/api/lib/photo-code.ts — `normalizeCode` extracted from routes/verify.ts so the
  oRPC lookup and the image route resolve a scanned/typed code identically.
- routes/verify.ts — local normalizeCode deleted, now imports the shared one. No behaviour change.
- NEW packages/web/src/api/lib/verify-map.ts — `verifyMapImage(code, url)`: looks the photo up by
  code, renders ONE amber pin at its fix via staticMapUrl (showRoute:false), placeholder SVG for
  unknown code / no GPS / no key, cache-control 86400 (a verified fix never moves).
  Scoped to a real photo code so it cannot be used as an open Google Maps proxy; the Maps key stays
  server-side exactly as on /share. Plots only coordinates the page already prints in LOCATION.
- api/index.ts — mounted `GET /api/verify/:code/map.png` next to the share one.
- web/pages/verify.tsx — <figure> between the file card and the field card, gated on
  `d.lat != null && d.lng != null`, 260px tall, rounded-12, coords caption bottom-left.
  Reuses t("map.title") for the alt text — NO new i18n keys.

Verified: lint 0/0 (229 files) · web tsc 0 · mobile tsc 0 · build 2 successful ·
curl of /api/verify/TM-691P-Y6ES-PRTA/map.png -> 200 image/png 26281 bytes, inspected: Clearview St,
Moncton with the amber pin · page screenshot /tmp/vmap_page2.png shows map + JOB "Unassigned" +
RECEIVED BY "Luc" + SIGNATURE panel all rendering together.

Noted but NOT changed: that photo's HASH field renders "—" (content_hash empty on the row) while
STATUS still says Locked & verified. Raised with the user, not touched.

## "Unassigned" on gallery photo cards + single-photo share map leak

1) evidence-card.tsx — the project line was `{photo.projectName && (...)}`, so unassigned photos
   showed nothing. Now always rendered: `{photo.projectName || t("queue.unassigned")}`.
   User asked for this explicitly after I had left it out. Same key as everywhere else, no new i18n.
   Affects every gallery that uses the card: /app, project pages, and public /share pages.

2) BUG FOUND while screenshotting, not reported by the user: api/lib/share-map.ts filtered the map
   points by orgId (+ projectId when set) only. A per-PHOTO share link therefore plotted every
   photo location in the whole workspace — 7 pins on a page whose caption said "1 fixes", and a
   location leak on a link meant to expose exactly one photo. Fixed:
     if (link.photoId) -> eq(photos.id, link.photoId)
     else if (link.projectId) -> eq(photos.projectId, link.projectId)
     else -> whole org (unchanged)
   Now matches the photo set the /share page itself lists.

Verified: lint 0/0 (229 files) · web tsc 0 · build 2 successful ·
/share/83qgnxecfgf8vrx9fxvtz0 screenshot /tmp/chip_page.png shows the card reading "Unassigned" ·
/api/share/83qgnxecfgf8vrx9fxvtz0/map.png re-fetched after the fix -> single pin on Clearview St
(/tmp/smap.png), was 7 pins before.

## Chain of custody: collapse repeated public views (2026-09-05)
Reported by user: photo drawer chain showed 14 identical lowercase `viewed` rows, pushing action buttons off screen.

Three-part fix:
1. `packages/web/src/api/routes/verify.ts` — VIEW_DEDUPE_MS = 30 min. One `viewed` photo_event per photo per half hour instead of one per public page load. Verified: 3 calls 2s apart moved count 6 -> 7, not 6 -> 9.
2. `packages/web/src/web/components/photo-drawer.tsx` — added `collapseViews()` helper folding CONSECUTIVE `viewed` events into one row ("Viewed N times on the public page" + `first - last` stamp). Other event types break the run, so chain order stays truthful. Added missing `EVENT_LABEL.viewed` (was rendering raw lowercase "viewed").
3. `packages/mobile/components/photo-detail.tsx` — identical treatment.

i18n: new keys `event.viewed`, `event.viewedTimes` in all 11 web locales, copied to mobile. Parity OK.
No audit rows deleted — append-only evidence preserved, only grouped visually.

Verified: lint 0/0 (229 files), web tsc 0, mobile tsc 0, build 2 successful. Screenshot /tmp/chain_web2.png on TM-S7ZZ-R73F-S4PF shows 3 rows, last = "Viewed 7 times on the public page · 09/02/2026, 03:21:24 - 09/05/2026, 16:42:02".

## Empty HASH field — root cause found and fixed (2026-09-05)
User asked me to dig into `TM-691P-Y6ES-PRTA` showing an empty HASH while STATUS read "Locked & verified".

**Scope of the bug (DB counts):** 27 of 54 photos had `content_hash` NULL — and it was **26 of 26 in the real workspace `org_MTCE8SRQBM81BGT9XD` ("We Deliver")**. The ops org looked fine only because 27 of its 28 rows are seeded by `demo.ts`, which fakes a hash. So: no real capture has ever had a content hash. Photos and videos both.

**Root cause:** `photos.create` only ever stored `input.contentHash` — a value supplied by the client. No real client computes it: the mobile queue (`packages/mobile/lib/queue.ts`) uploads straight to storage with a presigned PUT and never sends the field. Only `api/routes/demo.ts` set one. The server never saw the bytes, so the column stayed NULL while the HMAC `signature` (which does not need the bytes) was still written — hence "Locked & verified" with an empty HASH.

**Fix** (`packages/web/src/api/routes/photos.ts`):
- imports: `getObjectBytes` from `../lib/s3`, `sha256` from `../lib/verify`.
- `create` reordered: stampData -> video burn-in -> **read the stored object back and SHA-256 it server-side** -> `sign()` -> insert. Hashing before signing means the HMAC covers the hash.
- Hash is taken after burn-in so it matches the bytes actually stored (burnStamp overwrites the same key).
- `input.contentHash` is now a fallback only, used when the object cannot be read back. A device-supplied hash is worthless as evidence.

**Verified end-to-end:** PUT a known JPEG (`sha256 b3980168945a9a07981dbcc2e01157bd9065988711dc1a6e77c3d7f9436d289a`) -> `photos.create` -> row `pho_MTONBEU8TJNM4R7KW7` / `TM-87DJ-3QE2-QEK3` stored exactly that hash. `photos.verify` on it returns `ok:true`.
Checks: lint 0/0 (229 files), web tsc 0, mobile tsc 0, build 2 successful.

**NOT done — needs user's decision:** backfilling the 26 existing real photos. Filling `content_hash` on an old row without re-signing makes `photos.verify` report "Signature mismatch", because the stored HMAC covers a null hash. Doing it properly means re-signing historical evidence today, which changes what the signature attests to. Offered to the user; awaiting his call.

## Hash backfill decision + amber page titles on the website (2026-09-05)
1. User chose **option A** on the missing content hashes: leave the 26 existing photos with an empty hash, no re-signing. His reason: the workspace is still test data, no customer owns any of those photos. New captures get a real server-computed hash from the next Publish onward. Closed.
2. Page titles in the website header changed white -> amber to match the mobile app:
   - `packages/web/src/web/components/dashboard-shell.tsx` h1: `text-chalk` -> `text-amber`
   - `packages/web/src/web/components/admin-shell.tsx` h1: `text-chalk` -> `text-amber`
   Both headers are pinned dark (`bg-[#0d2137]` + `data-theme="dark"`), so amber reads the same in light and dark workspace themes. Subtitle stays `text-fog`, the mono breadcrumb line (PageTitle) is unchanged. Marketing/public page headlines left white on purpose.
   Verified: computed color on /app h1 = rgb(255, 176, 33) = #FFB021, screenshot /tmp/title_web.png. Lint 0/0, web tsc 0, build 2 successful.

## Capture screen: STAMP chip removed, stamp preview on by default (2026-09-05)
`packages/mobile/app/(tabs)/index.tsx`:
- Deleted the STAMP toggle chip row that sat between the shutter and the VIDEO/PHOTO/CLOCK tabs, plus its now-unused styles (`stampToggleRow`, `stampToggle`, `stampToggleText`).
- `showLocation` now defaults to `true`, so the stamp preview shows on the frame from first launch.
- The switch remains in the top-left profile menu (`profile.showStamp` -> `ProfileMenu showStamp/onToggleStamp`), which is the only control now.
The saved file was always stamped either way; this toggle only ever controlled the on-screen preview.
Note: i18n key `capture.stamp` is now unreferenced in code (still present in all 11 locale files, harmless).
Verified: lint 0/0, mobile tsc 0, build ok, screenshot /tmp/capture_nostamp.png shows the chip gone, the mode tabs moved up, and the stamp block visible on the frame by default.

## Capture screen: PROJECT moved above EVIDENCE TYPE (2026-09-05)
User asked to swap the two dropdowns on the mobile Capture screen.
`packages/mobile/app/(tabs)/index.tsx`: the project head + its expanded list (formerly lines 846-910) was moved above the evidence-type head + grid. New order below the VIDEO/PHOTO/CLOCK tabs: PROJECT -> EVIDENCE TYPE -> proof-of-delivery block (recipient + signature, shown only for pickup/delivery) -> GPS row.
The PoD block stays directly under EVIDENCE TYPE on purpose: it only appears because of the tag choice, so it has to sit with it.
No logic, state or persistence changed - pure JSX reorder.
Verified: lint 0/0, mobile tsc 0, screenshot /tmp/capture_nostamp.png shows PROJECT above EVIDENCE TYPE.
