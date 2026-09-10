# Scratchpad

## ITEM 36 — Chinese (zh) Help Center — ✅ COMPLETE (2026-09-09)

Full completion record is in `task-help-center.md`, section "ITEM 36". Summary:

- 9 files in `packages/web/src/web/help/content/zh/`, every one `hcheck ... zh: PASS`.
  59 articles; `xref.py` output byte-identical to the `en/` run, `BAD: none`.
- Catalog registered in `help/content/index.ts` as `zh: zhCategories`.
- 53 Chinese CSV header aliases in `lib/parse-stops.ts`; `normalizeHeader` NOT touched.
  `zhalias.py` clean; `bun /tmp/zhtest.ts` = 22/22 promised terms + 38/38 full table PASS,
  BOM handled, data row not mistaken for a header.
- Gates: lint 0/0, both typechecks EXIT=0. Servers back up: web=200, mobile=200.
- Browser-verified signed out in `zh` on `/help` + 2 deep articles, all screenshots opened.
- `i18n/zh.ts` was already CLEAN — no defect, unlike Polish (24 fixes). No i18n keys added,
  so web key parity stays 1139 across all 11 catalogs.

### Carry-forward caveats
- Full-width CSV headers (`ＡＤＤＲＥＳＳ`, `电话（手机）`, `地址／门牌号`) resolve to `null`.
  Not fixed on purpose: NFD does not fold them and switching to NFKC would change matching for
  all 6 existing locales. The Chinese article only promises the plain words, which all pass.
- Nobody has pasted a real Chinese CSV through the browser UI (parser-level proof only), and no
  native speaker has proofread the prose.
- Minor: `zh.ts` `routes.*` uses a plain hyphen where Chinese typography wants a full-width dash.

## ITEM 37 — Vietnamese (vi) Help Center — ✅ COMPLETE
Full completion record is the last ~70 lines of `task-help-center.md` (`tail -80`).
Summary: 9 content files (59 articles, 8 categories) all PASS `hcheck <name> vi`;
`xref.py` byte-identical to the en/ run (total 59, BAD: none); catalog registered in
`help/content/index.ts`; `i18n/vi.ts` 1139/1139 parity with 6 "Teamspace" fixes
(backup /tmp/vi.ts.bak); 80 Vietnamese CSV header aliases in `lib/parse-stops.ts`
(`normalizeHeader` untouched) verified by /tmp/vialias.py and /tmp/vitest.ts
(HEADER MAP 22/22, FULL TABLE 67/67). Gates: lint 0/0, tsconfig.app EXIT=0,
tsconfig.node EXIT=0. Browser verified signed out with geocliks.locale='vi',
3 screenshots opened (/tmp/vi_help_index.png, vi_help_stops.png, vi_help_roles.png).
- ⚠️ KEY FINDING (reusable): **`đ` (U+0111) does NOT fold under NFD** — so every
  đ-word alias is listed twice (accented + plain-d), like straße/strasse.
- ✅ RESOLVED (Luc: "pick whichever is more standard and just do it"): standardised
  ALL Vietnamese copy on **xác thực** (matches Vietnamese UI convention: "đã xác thực"
  for Verified, "xác thực hai yếu tố" for 2FA). 80 replacements: web i18n/vi.ts 43,
  mobile i18n/vi.ts 35, help/content/vi/getting-started.ts 2. Zero "xác minh" left in
  any Vietnamese file. Backups /tmp/vi.web.beforeterm.bak, /tmp/vi.mob.beforeterm.bak,
  /tmp/vi.gs.beforeterm.bak. Re-gated: lint 0/0, tsconfig.app EXIT=0, tsconfig.node
  EXIT=0, hcheck getting-started vi PASS, xref total 59 BAD none. Browser re-verified
  /help (0 xác minh, 8 cards) and /verify (h1 "Xác thực ảnh đã khóa"), both screenshots
  opened: /tmp/vi_help_index2.png, /tmp/vi_verify2.png.
- Translations PAUSED at Luc's request after vi. tl and ar not started.
- NOT verified: no real Vietnamese CSV pasted through the browser UI (parser-level
  proof only); no native-speaker proofread; full-width headers still resolve to null.

## ITEM 38 — UI tweaks from Luc's two annotated screenshots (2026-09-09) — ✅ COMPLETE
Mobile capture screen `app/(tabs)/index.tsx`:
- shutter 68->58 (core 52->44, radii 34->29 / 26->22)
- PROJECT + EVIDENCE TYPE selector rows now FILLED amber with primaryForeground text/icons
  (his answer: "fill them yellow like the web sidebar rows"). Border no longer changes on open.
Mobile drawer `components/profile-menu.tsx`:
- trigger padding 10/8 -> 7/4, icon 26 -> 22 (it was setting the capture header height)
- added Appearance row (taps toggle light/dark via useAppTheme) and Language row (reuses
  <LanguageMenu />) inside the settings card, above Help center. New styles rowValue/rowValueText.
Web sidebar `components/dashboard-shell.tsx` — now mirrors the mobile drawer:
- NEW top block above the nav: profile row (initials avatar + name + email + chevron -> /app/profile)
  and workspace card (ShieldCheck + org name + PLAN · ROLE + chevron -> /app). Local `initials()`
  helper copied from the mobile drawer.
- workspace card REMOVED from the bottom; bottom is now one bordered card with Language and
  Appearance label/value rows + a standalone Sign out button.
Gates: lint 0/0, tsconfig.app EXIT=0, tsconfig.node EXIT=0, mobile `bunx tsc --noEmit` EXIT=0.
Browser-verified with screenshots opened: /tmp/side_full.png (web sidebar order correct),
/tmp/mob_capture.png (smaller hamburger + shutter, amber selector rows),
/tmp/mob_drawer.png (Appearance + Language rows present).
NOT verified: only checked on the Expo WEB preview, not a real device; light theme only.

## ITEM 39 — PROJECT / EVIDENCE TYPE bars restyled (2026-09-09) — ✅ COMPLETE
Luc: "wording need center and bigger, white color text, remove the project description name and
the EVIDENCE TYPE name. Make the tab a bit tiner."
Mobile capture screen `app/(tabs)/index.tsx`, the two amber selector bars only:
- both bars now show ONLY the title + chevron, centred, white (#FFFFFF), fontSize 13 / ls 1.2
  (was fontSize 10 / ls 2 in `label`). New styles `selectorLabelRow` + `selectorLabel`.
- removed the selected VALUE text and its leading icon from both bars (Unassigned / Work etc).
- thinner: `dropdownHead` paddingVertical 10->6, paddingHorizontal 12->10, justifyContent
  space-between->center; `selectorHalf` alignItems flex-start->center, `gap: 3` dropped.
- local `dropdownValue` / `dropdownValueText` styles deleted (now unused HERE; settings.tsx has
  its own copies — untouched).
TRADEOFF flagged to Luc: you can no longer see which project / evidence type is selected without
opening the bar (the pill grids below still highlight the active one when open). One-line revert.
Also flagged: white on amber is lower contrast than `primaryForeground`; design.md says
`text-on-amber` on amber fills. He asked for white explicitly.
Gates: lint 0/0, tsconfig.app EXIT=0, tsconfig.node EXIT=0, mobile `bunx tsc --noEmit` EXIT=0.
Browser-verified, screenshots opened: /tmp/mob_capture39.png (both bars centred/white/short, no
values), /tmp/mob_proj_open39.png + /tmp/mob_tag_open39.png (both dropdowns still open, active
pill still highlighted). Text scan: hasUnassigned=false.
NOT verified: Expo WEB preview only, not a real device; light theme only.

## ITEM 40 — selector text back to black + web sidebar bottom card (2026-09-09) — ✅ COMPLETE
Luc: "in the website bottom menu add the same links as the mobile app. Change back the PROJECT
and EVIDENCE TYPE wording to black on mobile app"
Mobile `app/(tabs)/index.tsx` — reverts ITEM 39's white only:
- both selector labels + chevrons back to `colors.primaryForeground` (#0B0E13, the on-amber
  near-black they had before ITEM 39). Centred / bigger / no-values / thin bars all KEPT.
- the three remaining `#FFFFFF` in this file (lines ~653/661/676) are the camera viewfinder
  controls over the dark preview — deliberately untouched.
Web `components/dashboard-shell.tsx` — bottom card now mirrors the mobile drawer:
- Help center REMOVED from the `NAV` array and moved into the bottom card (his answer). No
  duplicate: sidebar now has exactly 1 `/help` link (asserted in the browser check).
- added 4 rows to the bordered card after Appearance: Help center `/help`, Contact us
  `mailto:SUPPORT_EMAIL`, Terms `/terms`, Privacy `/privacy` — icons LifeBuoy/Mail/FileText/
  Shield, ChevronRight on the right, same styling as the Language/Appearance rows.
- Language / Appearance / Sign out kept exactly as they were (he asked for them to stay).
- Reports LEFT in the nav list (his answer) — it was already there, mobile has it up top too.
- new imports: Mail, FileText, Shield from lucide-react; SUPPORT_EMAIL from ../lib/support.
NO i18n work needed — profile.contact / home.nav.help / home.footer.terms / home.footer.privacy
already exist in all 11 web catalogs (verified). Web key parity untouched.
Narrow viewports: removing Help from NAV also drops it from the `lg:hidden` pill strip, BUT
`account-menu.tsx` (line ~106) already links `/help` and is reachable at every width by design
(see its docstring) — checked, not a regression.
Gates: lint 0/0, tsconfig.app EXIT=0, tsconfig.node EXIT=0, mobile `bunx tsc --noEmit` EXIT=0.
Browser-verified, screenshots opened: /tmp/mob_capture39.png (black text on both amber bars),
/tmp/side_full40.png (bottom card = Language, Appearance, Help center, Contact us, Terms,
Privacy, Sign out; nav ends at Profile; helpLinksInSidebar=1).
NOT verified: Expo WEB preview not a real device; light theme only; did not click through the
4 new rows, only asserted their hrefs.

## ITEM 41 — ✅ COMPLETE, VERIFIED (2026-09-09)
Luc: "1. on the mobile app The PROJECT and EVIDENCE TYPE tab need to have mouse over effect.
2. in the website the menu on the left side bottom need to have the same still [style] as the
mobile and NO scrolling down on the top yellow menue"
DONE so far:
- mobile index.tsx: added projectHover/tagHover state + onHoverIn/onHoverOut on both selector
  Pressables, style is now a ({ pressed }) callback swapping amber -> amberDeep on hover OR
  press (hover = web preview, pressed = real phone). mobile `bunx tsc --noEmit` EXIT=0.
- web dashboard-shell.tsx bottom card: dropped the leading amber icons, right-hand icon is now
  ExternalLink for Help/Terms/Privacy and ChevronRight for Contact us, py-2.5 -> py-2 — matches
  the mobile drawer rows (plain label + small muted hint icon).
- web imports: removed LifeBuoy/Mail/FileText/Shield (now unused), added ExternalLink.
- web nav: `flex-1 space-y-0.5 overflow-y-auto p-3` -> `shrink-0 space-y-0 p-2`.
- web nav rows px-3 py-2 -> px-3 py-1 (35.5px -> 27.5px). <aside> got overflow-y-auto as a
  safety valve for freak window heights. Top profile block p-3 -> p-2 + space-y-1.5, avatar
  size-9 -> size-8, profile/workspace rows py-2 -> py-1.5, bottom block p-3 -> p-2,
  bottom card space-y-2 -> space-y-1.5, all bottom rows py-2/py-2.5 -> py-1.5.
- LOGO BAR h-[68px] DELIBERATELY UNTOUCHED — main page header is also lg:h-[68px]; shrinking
  it misaligns the sidebar/main boundary.
FOLLOW-UP (same day): Luc asked for the yellow menu in TWO COLUMNS like the mobile drawer.
web nav is now `grid shrink-0 grid-cols-2 gap-1.5 p-2`; tiles are `gap-2 px-2.5 py-1.5
text-[12px] leading-tight`, icon `shrink-0`, label `min-w-0 flex-1` so long labels WRAP
instead of truncating (same as the mobile tiles, which are width 47% + flexWrap). The staff
"Admin console" link got `col-span-2` so it still spans the full width underneath.
Mirrors packages/mobile/components/profile-menu.tsx styles.tiles/styles.tile.
Re-measured 1440x800: navScrolls FALSE, asideScrolls FALSE, overflowPx 0, nav height
346 -> 228px. Gates re-run: lint 0/0, web app+node tsc EXIT=0. side_steps40 re-run:
helpLinksInSidebar=1, all 12 destinations + hrefs unchanged.
KNOWN COSMETIC: "Before / After" wraps to 2 lines, so that grid row (and the Reports tile
beside it) is taller than the others. Accepted — same thing happens on mobile.

FOLLOW-UP 2 (same day): Luc asked for Before/After and Reports at the BOTTOM of each column.
Moved those two entries to the END of the NAV array in dashboard-shell.tsx (row-major grid,
so last two entries = bottom row, one per column). Grid order is now
Teamspace|Projects / Routes|Map / Share links|Team / Watermarks|Plan / Messages|Profile /
Before-After|Reports. The taller wrapping row is now the last row, which tidies the block.
FOLLOW-UP 4 (2026-09-10): "some languages missing" in the sidebar Language picker.
ROOT CAUSE (measured, not guessed): nothing was missing from the data — LOCALES in
packages/web/src/api/lib/locales.ts has all 11 (en, fr-CA, es, pt-BR, de, it, zh, vi, tl,
ar, pl) and all 11 catalogs exist. Two layout bugs hid them:
 (a) the bottom card had `overflow-hidden`, which CLIPPED the absolutely-positioned dropdown
     at the card's bottom edge — only 4 languages were visible (measured: panel 468->788 but
     visually cut at the card edge, /tmp/lang_open42.png before-shot).
 (b) the compact panel opened DOWNWARD (`top-full`) from a row near the bottom of the
     screen, and `max-h-[320px]` with 12 rows of ~34px (scrollH 406) hid the last 3 behind
     an easy-to-miss inner scrollbar.
FIX: language-select.tsx gained a `drop?: "up" | "down"` prop (default "down"); the compact
panel uses `bottom-full` when drop="up". max-h-[320px] -> max-h-[70vh] so all 12 rows fit.
dashboard-shell.tsx: `<LanguageSelect compact drop="up" />`, card lost `overflow-hidden`,
first row got rounded-t-[12px] and the Privacy row rounded-b-[12px] so hover fills stay
inside the border.
VERIFIED: sidebar picker now panel 22->430, clientH 406 = scrollH 406, count 12,
visibleCount 12 (was 9 in-bounds / 4 actually on screen). Header picker (drop stays "down")
re-checked: top 53 -> 461, 12 rows, 0 offscreen. lint 0/0, web app+node tsc EXIT=0.
Screenshots opened: /tmp/lang_open42.png, /tmp/lang_hdr42.png.
NOT verified: dark theme, RTL (ar) layout of the panel, mobile app picker.

FOLLOW-UP 3 (same day): removed the leading Globe icon from the Language row in the bottom
card, so every row in that card is now a bare label (matches Appearance/Help/Contact/Terms/
Privacy). Globe import deleted from dashboard-shell.tsx — it had no other use. Verified:
lint 0/0, web app+node tsc EXIT=0, /tmp/side_800.png shows Language left-aligned with the
rows below it, overflowPx still 0 and nothing scrolls.

SIDE EFFECT (intended, consistent): NAV also drives the lg:hidden amber pill strip in the
page header, so those two pills moved to the end there too.
Re-verified 1440x800: navScrolls FALSE, asideScrolls FALSE, overflowPx 0, nav 228px.
Gates: lint 0/0, web app+node tsc EXIT=0. side_steps40: helpLinksInSidebar=1, all 12
destinations present, hrefs correct in the new order. Screenshot /tmp/side_800.png opened.

MEASURED at 1440x800: before = navScrolls TRUE (client 272 / scroll 472, 12 rows @35.5px).
AFTER = navScrolls FALSE, asideScrolls FALSE, overflowPx 0, rowH 27.5. Whole sidebar fits
at 800px with no scrollbar anywhere.
GATES: lint 0/0, web tsconfig.app + tsconfig.node --noEmit EXIT=0, mobile tsc --noEmit EXIT=0.
VERIFIED (screenshots opened):
- /tmp/side_800.png — full sidebar visible at 1440x800, no scrollbar, bottom card in mobile style.
- /tmp/side_steps40.json at 1440x1000 — helpLinksInSidebar=1, aside order and hrefs correct.
- /tmp/mob_capture39.png — both bars still black-on-amber, hasUnassigned false.
- /tmp/mob_hover41.png — synthetic pointerover on PROJECT: bar darkens to amberDeep. CONFIRMED.
NOT verified: real phone (Expo web preview only); light theme only; hover does not exist on a
touch device — on a real phone the darkening only shows on press-and-hold.

## Next up after vi
Locale queue: **PAUSED by Luc 2026-09-09 after vi. Remaining: tl, then ar LAST (only RTL)**. Recipe: ITEM 20/24/34/35/36.

## Standing context
Luc cannot publish or test mobile — the Runable→Expo handoff is broken platform-side, NOT ours
(no build ever appears on expo.dev). He approved continuing translation work while support
works it. Do not ask whether to continue. Role names and plan names stay ENGLISH — settled,
asked twice, never re-ask.

## Publish timeout (`build-website failed: [deadline_exceeded]`) — FIXED 2026-09-09
Root cause: NOT a slow build. The sandbox has 3.9 GB RAM; the Vite dev server holds
~600 MB, leaving ~700 MB. `vite build` needed ~880 MB peak, so the kernel OOM-killed it
mid-bundle (reproduced: EXIT=137, avail bottomed at 106 MB), leaving a half-written
dist/ (public assets only, no index.html) — exactly the state found at 05:35.
Ruled out: `tsc --noEmit` in the web build script is a genuine no-op (tsconfig.json has
`files: []` + references only), so the "deliberately vacuous" note in ITEM 18 item 8 is
CONFIRMED. Ruled out: no server-only libs imported from client code.
Fix: added a `build` block to packages/web/vite.config.ts —
`reportCompressedSize: false` (was gzipping every chunk in memory just to print a number)
plus `manualChunks` splitting vendors into 7 chunks. Main chunk 3,110 kB -> 2,231 kB,
peak memory ~880 MB -> ~630 MB.
Verified: build with dev server RUNNING now EXIT=0 (was 137). Clean build 7s, 9 output
files. lint 0/0, tsconfig.node.json EXIT=0, tsconfig.app.json EXIT=0.
Residual: margin is still thin with the dev server up (99s, 58 MB headroom) because the
app chunk is still 2.2 MB. Biggest remaining win = lazy-load help content per locale;
all 8 locales' help articles are eagerly imported via help/content/index.ts CATALOGS and
ship to every visitor. Left mobile Expo server DOWN to keep publish headroom.

## Build-speed request (2026-09-09) — MEASURED, premise corrected
`time bun run build:web` results, same code each time, only RAM differed:
  - both preview servers up (556 MB free): 513 s -> EXIT=137 OOM-killed
  - both up, after lazy-load change (524 MB free): 716 s -> EXIT=137 OOM-killed (still dies)
  - servers stopped (1203 MB free): 11 s total / 7.31 s compile, EXIT=0
=> Build is NOT slow. It is memory-bound. 7 s vs OOM is purely free RAM.
Asset audit: packages/web/public = 5.0 MB total, largest 0.77 MB, and ZERO assets
imported from source -> Vite copies public/ verbatim, never compiles it. Moving images
to file storage would save ~0 s. NOT DONE (would change delivery for no gain).
Unused deps removed: react-hook-form, react-icons (0 hits in src, 0 in bundle -> no
build-time change, hygiene only). Backup at /tmp/pkg.web.bak.
Lazy-loading DONE in src/web/app.tsx: landing + sign-in + sign-up kept EAGER so
geocliks.com first paint is unchanged; all /app/*, /admin/*, /help/*, legal, verify,
track, share, join, reset lazy via React.lazy + one Suspense with a colourless
min-h-screen fallback. Main chunk 2231 kB -> 805 kB, 9 -> 53 chunks. Peak mem ~630 MB
-> ~330 MB used. lint 0/0, tsconfig.app EXIT=0.
STILL PENDING: browser-verify pages render with lazy boundaries (appearance guard).

## ITEM 43 (2026-09-10) — watermark logo bug + drawer avatars + capture bottom sheet
Three items from two annotated screenshots + a 3-question form.

### 43-A watermark logo "Internal server error" — FIXED, VERIFIED END-TO-END
Root cause: upload.ts presignLogo asked for a 30-day presigned GET (2,592,000s). AWS SigV4
caps presigned URLs at 7 days, so getSignedUrl THREW and oRPC returned a 500. Proven with a
live-bucket script (/tmp/t_presign.ts): OK 86400, OK 604800, FAIL 2592000.
Second half of his complaint (logo missing on mobile) had TWO causes:
  1. the web client stored the presigned URL itself into watermarkTemplates.logo_url, so even a
     legal link went stale later;
  2. mobile NEVER rendered a logo at all - rg found zero logoUrl/showLogo refs in packages/mobile
     outside i18n strings. It was a missing feature, not just a dead link.
Fix (follows the existing avatar precedent in account.ts):
  - upload.ts presignLogo: 30d -> 12h, and publicUrl is now documented as a PREVIEW only.
  - account.ts: added `export const brandLogoUrl = avatarUrl` - bare key in the column, link
    minted on read. Passes full http(s) values through untouched, so pre-existing rows holding a
    stale absolute URL neither crash nor need a migration.
  - orgs.ts: templates.list became an async handler (was a bare non-async db.select) resolving
    every row through brandLogoUrl via Promise.all; create + update resolve their returned row too.
  - app-templates.tsx: single `logoUrl` state split into `logoKey` (sent to the DB) and
    `logoPreview` (shown on the page). Also fixed a latent bug: the Show/Hide logo row button used
    to send the form's logo state, so toggling visibility on one row could WIPE that row's logo -
    the key is now only sent when one was actually picked.
  - stamp.tsx (mobile): added `logoUrl` to StampData and a logo slot; children wrapped in
    styles.body row + styles.lines column so the logo sits left of the text, mirroring the web
    WatermarkOverlay. gap moved off `wrap` onto `lines`.
  - index.tsx + settings.tsx (mobile): pass `logoUrl: template?.showLogo ? template.logoUrl : null`
    so his Show/Hide toggle is honoured.
VERIFIED: real file upload through the browser (API is untypechecked, so tsc proves nothing) ->
no error, X-Amz-Expires=43200, logo renders in live preview + form slot (/tmp/tpl43_upload.png).
Created "Logo test 43" -> DB holds a BARE KEY (82 chars, orgs/.../brand/logo_...), not a URL.
Promoted to default -> mobile stamp preview renders the logo (/tmp/mob43_settings.png).
NOTE: the seeded "Branded" template has show_logo=1 with logo_url=NULL, so it reads "LOGO ON"
with nothing to show. Cosmetic, test-account data, not touched.
Gates: lint 0/0, web tsconfig.app + tsconfig.node --noEmit EXIT=0, mobile tsc --noEmit EXIT=0.
Reusable: /tmp/qtpl.ts (template rows), /tmp/tpl43.json (upload), /tmp/tpl43b.json (create),
/tmp/tpl43c.json (set default).

### 43-B mobile drawer: profile picture + TeamSpace business logo — DONE, VERIFIED
No backend work needed: orgs.current already returns user.image ALREADY PRESIGNED via avatarUrl,
and useTemplates() already exists in packages/mobile/queries/orgs.ts.
profile-menu.tsx: imported Image + useTemplates; top row renders user.image when set and falls
back to the initials block; workspace row renders the default template's logo (honouring showLogo)
and falls back to the green shield-checkmark. New style `brandLogo` 26x26 so the row height never
jumps. His choice: the workspace logo REUSES the watermark logo - no second upload.
=> 43-B therefore depended on 43-A; that is why 43-A was done first.
VERIFIED: set a blue test avatar through the website profile page, then opened the mobile drawer -
blue photo on the personal row, amber business logo on the workspace row (/tmp/mob43_drawer.png).
CAVEAT TO TELL HIM: the avatar upload UI exists only on the WEBSITE (app-profile.tsx). Mobile has
no avatar picker, so the photo must be set on the website.

### 43-C mobile capture: selector lists as a half-screen bottom sheet — DONE, VERIFIED
Was: both option grids rendered INLINE below the selector row, so opening one grew the bottom
panel and pushed the viewfinder + shutter up (measured 638 -> 499). With a real project list the
shutter left the screen.
Now: each grid lives in a <Modal transparent animationType="slide"> with a dimmed backdrop
Pressable, a bottom-anchored sheet at maxHeight "50%", a header (title + X close) and a ScrollView
so a long list scrolls INSIDE the sheet. Selection already called setXOpen(false), so it closes on
choose. Styles added: sheetBackdrop / sheet / sheetHead / sheetTitle / sheetBody. `styles.hidden`
became dead and was removed.
PRESERVED on purpose: the ITEM 41 hover/press amber->amberDeep callbacks, and the ITEM 39 centred
label with NO selected value in the bar.
VERIFIED: shutter Y stayed 545 open and closed for BOTH sheets (was moving); sheet header renders
with the X; tapping "Arrival" closed the sheet (openSheets 1 -> 0). Screenshots
/tmp/mob43c_closed.png, /tmp/mob43c_open.png, /tmp/mob43c_tag.png, /tmp/mob43c_after.png.
Reusable: /tmp/mob43c.json, /tmp/mob43d.json, /tmp/mob43drawer.json.
NOTE: repo formats with oxfmt (NOT prettier - there is no prettier config). Run
`bunx oxfmt <file>`; a prettier run reformats to 80 cols and creates huge diff noise.
Final gates for ITEM 43: lint 0/0, web tsconfig.app + tsconfig.node --noEmit EXIT=0,
mobile tsc --noEmit EXIT=0.

## ITEM 44 (in progress) — Luc's 3 follow-ups
Decision: `organizations.logoUrl` = the single business logo. Uploadable in profile settings
(web+mobile), shown in mobile drawer + web sidebar, and used as watermark fallback
(`template.logoUrl ?? org.logoUrl`). Drawer/sidebar no longer gated on `showLogo`.

DONE so far:
- 44-A mobile capture sheet `maxHeight:"50%"` -> `height:"50%"` (index.tsx styles.sheet) so the
  list starts above the shutter (y=450 vs shutter 545).
- account.ts: `brandLogoUrl` is now a real function; recovers the key from stale absolute URLs
  that point at our own bucket and re-presigns. Foreign URLs still pass through.
- orgs.ts: `current` and `update` now return `logoUrl` resolved through `brandLogoUrl`.
- profile-menu.tsx (mobile drawer): brandLogo = org.logoUrl ?? defaultTemplate.logoUrl, no
  showLogo gate.
- dashboard-shell.tsx (web sidebar): business logo img next to workspace name, ShieldCheck fallback.

- 44-C web upload UI in app-profile.tsx workspace card (presignLogo -> updateOrg{logoUrl:key}),
  with remove button. Reuses existing keys templates.logo / templates.upload / common.delete,
  so NO new i18n keys anywhere (would have meant 23 catalog files).
- 44-C mobile upload UI in (tabs)/settings.tsx workspace card via expo-image-picker +
  client.upload.presignLogo + updateOrg. No pre-flight permission check on purpose (the picker
  raises the OS prompt itself), which avoided needing a new translated message.
- watermark fallback template.logoUrl ?? org.logoUrl done in mobile index.tsx (stampData) and
  settings.tsx (stamp preview).

ITEM 44 COMPLETE + VERIFIED (2026-09-10):
- Gates all green: lint 0/0, web tsconfig.app + tsconfig.node --noEmit EXIT=0, mobile tsc EXIT=0.
- Live web: uploaded a GREEN 16x16 test logo on /app/profile -> no error, stored as bare key
  under orgs/..., sidebar row shows it next to "Ops Admin's Team" (/tmp/w44_after.png,
  /tmp/w44_card.png). Green was chosen so it cannot be confused with the AMBER template logo,
  which proves the sidebar reads org.logoUrl and not the template.
- Live mobile drawer: green business logo on the workspace row (/tmp/mob44_drawer.png).
- Live mobile settings: LOGO card with green preview + "Upload logo" + "Delete"
  (/tmp/mob44_settings.png). Stamp preview still shows the AMBER template logo, correct —
  that template has its own, so the org fallback does not apply.
- Live capture sheet: shutter top 545, sheet title top 466 -> the list now starts ABOVE the
  shutter (was ~745). /tmp/mob44_sheet.png.
- NOT verified: a real phone's image picker (Expo web preview only), and dark theme.

## ITEM 45 — Luc follow-up (logo everywhere, one source)
Asks: (1) business-logo upload in profile settings on BOTH web and app; (2) a logo uploaded on a
watermark template must also show in profile settings; (3) same logo on top of the app drawer and
the website side menu — his annotated screenshot: top row = personal profile picture, row below =
business logo.

Correction to an old note: mobile DOES already have a full profile screen with avatar upload at
`packages/mobile/app/profile.tsx` (client.account.presignAvatar). The earlier "mobile has no photo
picker" note was wrong.

Done:
- orgs.ts: new `syncOrgLogo()`; templates.create and templates.update now mirror a newly uploaded
  template logo onto organizations.logoUrl. Clearing a template logo deliberately does NOT clear
  the workspace one.
- mobile app/profile.tsx: new TEAMSPACE card with business-logo upload/delete (owner+admin only),
  right under the personal photo card. Kept the one in (tabs)/settings.tsx too — both write the
  same org field so they cannot disagree.
- No new i18n keys again (templates.logo / templates.upload / common.delete / profile.workspace).

Verified: lint 0/0, mobile tsc EXIT=0, web tsconfig.app EXIT=0. Live web: uploaded a MAGENTA logo
on /app/templates + Save -> sidebar workspace row and live stamp preview both turned magenta,
proving the template->business-logo sync (/tmp/w45_templates.png).

## ITEM 46 — website sidebar personal profile photo (DONE, VERIFIED, DELIVERED, REPORTED)
Luc's annotated screenshot: the personal row at the top of the WEBSITE side menu never showed a
profile photo, only initials. `orgs.current` already returned a presigned `user.image`; mobile
`profile-menu.tsx` already rendered it — only `dashboard-shell.tsx` ignored it.
Fix: web sidebar top row now renders `org.data.user.image` (size-8, rounded-[8px], border-amber,
object-cover) with the initials badge as fallback. Verified /tmp/w46_sidebar.png (blue test avatar
on top row, magenta org logo on workspace row).

## ITEM 47 — "Get directions" under the map in the photo detail popup (code + verification DONE)
Luc: below the map in the photo detail popup, add a Get Directions control that opens Google Maps
directions from the viewer's current location to where the photo was taken.
- New i18n key `photo.directions` added to ALL 22 catalogs (11 web + 11 mobile, skipping
  mobile/i18n/locales.ts) WITH real translations, inserted right after `photo.addressUnavailable`.
  en "Get directions" / fr-CA "Obtenir l'itinéraire" / es "Cómo llegar" / pt-BR "Como chegar" /
  de "Route anzeigen" / it "Indicazioni stradali" / pl "Wyznacz trasę" / vi "Chỉ đường" /
  zh "获取路线" / tl "Kunin ang direksyon" / ar "الحصول على الاتجاهات".
- WEB `packages/web/src/web/components/photo-drawer.tsx`: added `Navigation` to the lucide import;
  new amber outline <a target="_blank"> right under the CAPTURE LOCATION caption, href
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`.
- MOBILE `packages/mobile/components/photo-detail.tsx`: added `Linking` to the react-native import;
  new Pressable reusing `styles.action`/`styles.actionText` with `navigate-outline` icon, same URL
  via `Linking.openURL`.
- DECISION: no `origin` param. Google Maps then routes from the viewer's live location, so we need
  no geolocation permission and no API key. Same URL on iOS and Android (Luc asked for Google
  specifically; note `app/route/[id].tsx`'s older `navigateTo` helper still prefers Apple Maps on
  iOS — left untouched).
- TEST DATA CHANGED: the test-account photo pho_MTTDVVD03D6P218570 (GC-6MZ5-75P0-4DHT) had NULL
  lat/lng, so the button could never render. Set it to 45.5019,-73.5674 / "800 Rue de la
  Gauchetiere O, Montreal, QC" via /tmp/qgeo3.ts. Test account only — the one real geotagged photo
  pho_MTUX4SJ4EA1F760ME1 belongs to Luc's org_MTCE8SRQBM81BGT9XD and was NOT touched.
- Gates green: lint 0/0, web tsconfig.app.json EXIT=0, mobile tsc EXIT=0. web=200 mobile=200.
- Verified: /tmp/w47d_map.png (amber GET DIRECTIONS directly under the web map, href confirmed
  `...destination=45.5019,-73.5674`), /tmp/mob47_detail.png (same button under the mobile map).
- Not verified: real phone (Expo web preview only, and the native map shows the
  "LIVE MAP AVAILABLE ON DEVICE" placeholder there), dark theme.
- Reusable: /tmp/w47c.json /tmp/w47d.json (open web drawer via
  `[...document.querySelectorAll('button')].find(x=>x.innerText.includes('GC-6MZ5')).click()` —
  tapText on the photo code does NOT open it), /tmp/mob47.json, /tmp/qgeo.ts /tmp/qgeo3.ts.

## ITEM 48 — Get directions button restyled (DONE, VERIFIED)
Luc: make it orange with a mouse-over effect and centre it under the map, on the website.
`photo-drawer.tsx`: outline -> filled `bg-amber text-on-amber font-bold px-4 py-2` with
`transition-colors hover:bg-amber-deep`, wrapped in `<div className="mt-2 flex justify-center">`.
Verified in browser: computed bg rgb(255,176,33), leftGap==rightGap==181px (dead centre), and the
Tailwind rule `.hover\:bg-amber-deep{&:hover{@media(hover:hover){background-color:var(--c-amber-deep)}}}`
is present. Screenshot /tmp/w48_btn.png. Mobile left as the outline style (he scoped this to the
website; phones have no hover).
NOTE: `[...document.querySelectorAll('a')].find(x=>x.href.includes('maps'))` matches the Google
map's own attribution links first — select by `/DIRECTIONS/i.test(x.innerText)` instead.

## ITEM 49 — "Unassigned" on the photo card explained + icon fix (DONE, VERIFIED)
Luc asked why his card GC-DJX8-2860-KPGQ shows "Unassigned" at the bottom. Answer: that line is
the PROJECT line (`evidence-card.tsx:184`, `photo.projectName || t("queue.unassigned")`) — the
photo simply has no project attached. Not a bug.
Real confusion source, fixed: the line used a `Clock` icon, so it read like a time field. Swapped
to `FolderOpen` in `packages/web/src/web/components/evidence-card.tsx` (import + usage).
Mobile has no projectName on its teamspace cards, so nothing to change there.
Gates: lint 0/0, web tsconfig.app.json EXIT=0. Verified /tmp/w49_card.png — card svg classes now
`shield-check`, `map-pin`, `folder-open`.

## ITEM 50 (3 parts) — DONE, VERIFIED, DELIVERED

1. Mobile "Get directions" button now FILLED orange: packages/mobile/components/photo-detail.tsx
   backgroundColor colors.amber + icon/text colors.primaryForeground. Verified /tmp/mob50_btn.png.
2. "Unassigned" bug — REAL SERVER BUG, not his old app version. photos.list returned raw photo rows
   with no join to projects, so projectName was always undefined and evidence-card.tsx:184 always
   fell back to "Unassigned". Added withProjectNames() helper in packages/web/src/api/routes/photos.ts
   (one extra query per page, not per row). Verified in browser: card now reads
   "Ridgeline FTTH — Phase 2". /tmp/w50_card2.png
3. Website had NO assign-to-project control (my earlier advice to him was wrong — that control only
   existed on the phone). Added a select in packages/web/src/web/components/photo-drawer.tsx using
   useMovePhoto + useProjects, labelled t("mine.assign"), empty option t("queue.unassigned").
   New web i18n keys mine.assign + mine.assignPick in all 11 catalogs (values copied verbatim from
   the mobile catalogs). Verified /tmp/w50_drawer.png + assignment round-trip.

Gates all green: bun run lint, web tsconfig.app, web tsconfig.node, mobile tsc.

## ITEM 51 — "Get directions" on the project page (DONE, VERIFIED, DELIVERED)

Luc: "In project page on the right side under the map add a get direction tab and fonction yellow
center with mouse over effect in both website and app."

WEB — packages/web/src/web/pages/app-project.tsx
  Added `Navigation` to the lucide import; derived `siteDestination` next to `assigned`
  (project lat/lng preferred, typed address as fallback, null hides the button); centered filled
  amber anchor under the EvidenceMap inside the SITE aside card, same class string as ITEM 48
  (bg-amber / text-on-amber / hover:bg-amber-deep).
  Verified on /app/projects/prj_MTJ3H1CBH3Y9GTMAKM: bg rgb(255,176,33), color rgb(11,14,19),
  leftGap === rightGap === 45 (centered), href destination=39.766%2C-105.021,
  hover rule `.hover\:bg-amber-deep{&:hover{@media(hover:hover){background-color:var(--c-amber-deep)}}}`
  present. Shot /tmp/w51_proj.png.
  ⚠️ Route is /app/projects/:id — NOT /app/project/:id (guessed wrong once, got the 404 page).
  ⚠️ Scanning document.styleSheets for a Tailwind utility MUST recurse into nested cssRules
  (@layer); a top-level-only scan reports 0 hits and looks like the rule is missing.

MOBILE — packages/mobile/app/(tabs)/map.tsx
  There is NO project detail screen on the phone. (tabs)/projects.tsx is a FlatList whose rows
  push to /teamspace?project=<id>; the only project-scoped map on mobile is the Map tab.
  So the button went under FieldMap there, visible only when a project filter is picked.
  Added `Linking` to the react-native import, same `siteDestination` derivation from
  `activeProject`, plus styles `directionsRow` (centering) and `directions`/`directionsText`.
  No hover on a phone -> Pressable `pressed` state swaps colors.amber -> colors.amberDeep
  (the ITEM 41 pattern). Verified /tmp/mob51_proj.png: centered filled amber, text rgb(11,14,19),
  hidden on "all projects".

No new i18n keys — reused `photo.directions`, already in all 22 catalogs since ITEM 47.
Gates all green: bun run lint, web tsconfig.app, web tsconfig.node, mobile tsc.
Reusable: /tmp/qprj.ts dumps test-org project id/name/lat/lng/address.

## ITEM 52 — team profile photos + routes subtitle placement (DONE, VERIFIED)

Luc: "in team page team member list dont show profile picture. In Delivery routes page on top
header on the left beside the site logo section, Under Delivery routes title in yellow, remover
the ' Build a route, assign a driver, and prove every drop with a photo.' text and put it in the
top left of the page before all the routes list."

### 52-1 Team roster showed no photos — REAL SERVER BUG (same shape as ITEM 50-2)
- `packages/web/src/api/routes/team.ts` `team.list` returned `user.image` RAW. That column holds a
  bare storage key, not a URL, so the client had nothing loadable. Now resolved through
  `avatarUrl()` (from `./account`, 12h presign) inside a `Promise.all(visible.map(async ...))`.
  No circular-import risk: `orgs.ts:10` already imports from `./account`.
- Neither client rendered the image at all — both hard-coded an initials badge.
  - `packages/web/src/web/pages/app-team.tsx` ~line 155: `<img class="size-9 shrink-0
    rounded-[12px] border border-line object-cover">` when `member.user?.image`, initials span
    preserved verbatim as fallback.
  - `packages/mobile/app/team.tsx` ~line 219: added `Image` to the react-native import; same
    conditional reusing `styles.avatar` so photo and initials share geometry (42x42, r8, bw1.5).
- Photos were uploading/saving fine all along. Told Luc plainly it was our bug.

### 52-2 Routes subtitle moved out of the page header
- `packages/web/src/web/pages/app-routes.tsx`: removed `subtitle={t("routes.subtitle")}` from
  `DashboardShell`; same string now renders as `<p className="mb-4 text-[13px] text-fog">` as the
  FIRST child of the shell body, deliberately ABOVE the loading/empty/list branches so it shows in
  all three states.
- No i18n key added/removed/reworded — `routes.subtitle` untouched in all 22 catalogs.

### Gates (after edits): bun run lint clean; web tsconfig.app + tsconfig.node clean; mobile tsc clean.

### Browser verification
- Web team `/app/team` (`/tmp/w52a.json`, shot `/tmp/w52_team.png`): Ops Admin img src =
  storage.dev/users/sgCF with `naturalWidth 16` (test avatar actually LOADED); Dave Crew img null,
  falls back to "DA". Both branches exercised.
- Web routes `/app/routes` (`/tmp/w52routes.json`, shot `/tmp/w52_routes.png`): exactly ONE match
  for "Build a route", tag P, `inHeader:false`, top 93 / left 280 (body, above the 3 route rows).
  `headerHasNeedle:false` — header now reads "Delivery routes | New route | EN | OPS ADMIN".
- Mobile team `/team` (`/tmp/mob52.json`, shot `/tmp/mob52_team.png`): one `<img>`, naturalWidth
  16, blue square on Ops Admin row; "DA" initials still on Dave Crew.
- All three screenshots opened with the `read` tool.

## ITEM 53 — delivery-run rows solid orange + hover/press (DONE, VERIFIED)

Luc: "in delivery route the tabs for all the list of delivery runs put that tab orange and mouse
over effect. both app and website."
Asked via ask_questions which reading of "orange" he meant; he chose **solid orange bar, whole row
filled, dark text, status tags restyled to suit**.

### WEB `packages/web/src/web/pages/app-routes.tsx`
- Row `<Link>`: `border-line bg-ink-2 ... hover:border-amber/50` -> `border-transparent bg-amber
  ... hover:bg-amber-deep`.
- Name `text-chalk` -> `text-on-amber`; the date/driver line, the progress line and the km line
  `text-fog` -> `text-on-amber/80`.
- Added a LOCAL `STATUS_STYLE_ON_AMBER` map. **Did NOT touch the exported `STATUS_STYLE`** —
  `app-route.tsx:33` imports it for the route detail page.

⚠️ **Mistake made and fixed mid-item, worth remembering:** I first wrote the chips as
`bg-ink text-<status>` with a comment calling it a "dark chip". **`--c-ink` is `#ffffff` in LIGHT
theme** (`styles.css:17`) and `#0b0e13` in dark (`:42`) — my own handover note warned that ink/chalk
flip and I still got it backwards. The chip is therefore white in light theme, which is fine and
theme-correct because fog/sky/verified/alert all flip too. The one real breakage was
`active: text-amber`: **`--c-amber` is `#ffb021` in BOTH themes**, so it washed out on the white
chip. Changed `active` to **`text-amber-deep`** (`#b06c00` light / `#e08a00` dark) — flips properly,
keeps the amber colour coding. Comment rewritten to state this accurately.

### MOBILE `packages/mobile/app/(tabs)/routes.tsx`
- Card `Pressable` style became a `({ pressed }) =>` callback: `backgroundColor: pressed ?
  colors.amberDeep : colors.amber`, `borderColor: "transparent"` (no hover on a phone — this is the
  ITEM 41/51 press pattern).
- Name + both meta lines -> `colors.primaryForeground`; chevron -> `colors.primaryForeground`.
- ⚠️ The progress line was `colors.amber`, i.e. **invisible on an amber card** — that is why it had
  to change. Added `metaOnAmber: { opacity: 0.8 }` so the two meta lines sit back from the name.
- Mobile has no status chip at all (status is inline text in the meta line), so nothing to restyle
  there.

### Gates (after the amber-deep fix): bun run lint clean; web tsconfig.app + tsconfig.node clean;
### mobile tsc clean (run after both file edits, before the web-only badge tweak).

### Browser verification
- Web `/app/routes` (`/tmp/w53b.json`, shot `/tmp/w53b_routes.png`): all 3 rows
  `bg rgb(255,176,33)`, name `rgb(11,14,19)`. Badges ASSIGNED `rgb(27,127,212)`, DRAFT
  `rgb(75,90,110)`, RUNNING **`rgb(176,108,0)`** on white — the washed-out amber is gone.
  Hover rule proved present: `.hover\:bg-amber-deep { &:hover { @media (hover:hover) {
  background-color: var(--c-amber-deep) } } }`.
- ⚠️ **Scan gotcha (cost a run):** a `walk()` that OVERWRITES on each match returns the LAST hit and
  reported `.hover\:text-amber-deep` instead of the background rule. **Collect all hits into an
  array and filter for `background-color`** — see `/tmp/w53b.json`.
- Mobile `/routes` (`/tmp/mob53.json`, shot `/tmp/mob53_routes.png`): `amberCardCount: 3`, each
  388x81 `rgb(255,176,33)`, every text line `rgb(11,14,19)`.
- Both screenshots opened with the `read` tool.
- **NOT verified:** the press-darkening on mobile (amber -> amberDeep) does not show in a static
  screenshot; it is code-correct but unproven visually. Web hover proven via the CSS rule, not by
  actually hovering.

---

## ITEM 54 — delete option on delivery-run rows + thinner rows (DONE, VERIFIED)

Luc: "in delivery route the tabs for all the list of delivery runs on the right add \"delete\"
option for the owner of the teamspace and admin. Make the tab tiner a bit."

He did NOT say "both app and website" this time, but 52 and 53 did and it is the same list on both
surfaces — did both for parity. Noted in the report.

### 1. SERVER `packages/web/src/api/routes/routes.ts` (line ~1045)
`routes.remove` was `requireRole(context.role, "manager")`. RANK is
`{owner:4, admin:3, manager:2, field:1}` so **managers could delete routes**. Luc asked for
owner + admin, so it is now `requireRole(context.role, "admin")`.
- ⚠️ **REAL BEHAVIOUR CHANGE: managers lose delete everywhere, including the route DETAIL page,
  which already had a delete button.** Disclosed to Luc. Reverting is a one-word change back to
  `"manager"`.
- Learned while reading `remove`: an **`active` route cannot be deleted** — server throws
  "Stop the route before deleting it". Pre-existing. Both clients surface the message rather than
  hiding the button.
- Deleting a route deletes `routeStops` + `routeEvents` + the route. **Evidence photos are NOT
  touched.**

### 2. WEB `packages/web/src/web/pages/app-routes.tsx`
- `canDelete = role === "owner" || role === "admin"`; `useRemoveRoute()`; `confirmId` + `error`
  state; error banner under the subtitle (`border-alert/40 bg-alert/10 text-alert`).
- ⚠️ **Row restructured from `<Link>` to a wrapper `<div>` holding a `<Link>` + the delete control
  as SIBLINGS.** A `<button>` nested inside an `<a>` is invalid markup and would have navigated on
  click. Wrapper carries the amber fill + `hover:bg-amber-deep`.
- **Thinner:** wrapper `py-3.5` -> **`py-2`** (measured 8px, row height 59px).
- Delete is a **two-step inline confirm**: trash icon -> `DELETE` + `CANCEL`. Deliberate: the whole
  row is a link, so a stray click must never destroy a run. The older delete on the route DETAIL
  page (`app-route.tsx:~648`) has no confirm and was left as-is.

### 3. MOBILE `packages/mobile/queries/routes.ts` — new `useRemoveRoute()` (mobile had none),
inserted before `useFailedReasons`, invalidates routes on success.

### 4. MOBILE `packages/mobile/app/(tabs)/routes.tsx`
- `canDelete` from `useOrg()`; `confirmDelete(id, name)` via `Alert.alert` with a `destructive`
  button; `onError` re-alerts the server message (covers the active-route refusal).
- Delete `Pressable` sits **between the cardBody `</View>` and the chevron**, `hitSlop={8}`,
  `trash-outline` 17 `colors.primaryForeground`, pressed bg `colors.destructive`.
- **Thinner:** `styles.card` `padding: 14` -> **`padding: 10`** (81 -> 73 tall).

### i18n — NO new keys. `routes.deleteRoute`, `common.delete`, `common.cancel`, `common.confirm`
already exist in all 11 web + 11 mobile catalogs. Checked before writing.

### Gates: `bun run lint` clean; web `tsconfig.app` + `tsconfig.node` clean; mobile `tsc` clean —
### all run AFTER the four edits.

### Verification
- Web `/tmp/w54.json`: `rowCount 3`, `rowHeights [59,59,59]`, `rowPadY 8px`, bg
  `rgb(255,176,33)`, 3 buttons labelled "Delete route". Clicking delete shows
  `DELETE rgb(217,58,40)` + `CANCEL`, and **`stillOnRoutesPage: "/app/routes"`** — proves the
  button does not navigate into the route (the whole risk of the old nested markup). CANCEL
  restores the trash icons.
- Mobile `/tmp/mob54.json`: `amberCardCount 3`, `cardHeights [73,73,73]`, 3 "Delete route" labels.
- **END-TO-END DELETE PROVEN** (`/tmp/mkroute54.ts` -> `/tmp/w54del.json` -> `/tmp/chk54.ts`):
  inserted throwaway `rte_DELTEST54`, deleted it through the web UI, list went 4 -> 3 rows and the
  DB went 4 -> 3 with `throwaway still present: false`. The 3 real test routes untouched.
- **ROLE GUARD PROVEN** (`/tmp/role54.ts`, calls `requireRole(r, "admin")` directly):
  owner ALLOWED, admin ALLOWED, **manager BLOCKED**, field BLOCKED.
- Screenshots `/tmp/w54_*.png`, `/tmp/w54d_*.png`, `/tmp/mob54_routes.png` — opened with `read`.
- **NOT verified:** a live manager LOGIN hitting the endpoint (no manager account exists; Dave Crew
  is `field` — would need promoting and restoring). Mobile `Alert.alert` on the Expo WEB preview
  (native dialog is fine on a real build). Web hover on the trash button.

### Reusable
- `/tmp/mkroute54.ts` — inserts a throwaway route. Columns with NO default that must be supplied:
  `id`, `orgId`, `name`, `date`, `createdBy`. Everything else defaults.
- `/tmp/w54del.json` — full UI delete round-trip. `/tmp/role54.ts` — role-guard truth table.
- ⚠️ `a[href*="/app/routes/"]` also matches the **"New route"** header button — that is why the
  scan reported 5 rows for 4 runs. Filter by row text, not by count.

---

## ITEM 55 — 4 parts (IN PROGRESS)

Luc's message: (1) allow manager to delete too — revert of ITEM 54's tightening. (2) New Route:
date + start time calendar/clock icon must be orange. (3) New Route: add a "Dispatcher" field +
**create a new ROLE "dispatcher"** that members can be invited as, allowed to create routes; the
field just shows the name of the dispatcher who created the run. (4) Start address: suggestions
as you type.

**FACT: the phone app has NO create-route screen** (`rg -ln "createRoute|routes.create"
packages/mobile` matches only i18n). Route creation is website-only, so parts 2-4 are web-only by
necessity. Part 1 and the role work touch both.

### PART 1 — allow manager to delete (DONE, VERIFIED)
- `packages/web/src/api/routes/routes.ts` `remove`: back to `requireRole(context.role, "manager")`.
- `app-routes.tsx` + mobile `(tabs)/routes.tsx`: `canDelete = org.data?.role !== "field"`.
- Proof `/tmp/role55.ts`: owner/admin/manager ALLOWED, field BLOCKED.

### PART 2 — orange date/time picker icons (DONE, VERIFIED)
- `packages/web/src/web/styles.css`, inside `@layer base` just before `::selection`: replaced the
  native `::-webkit-calendar-picker-indicator` glyph with an inline amber SVG — calendar for
  `date`/`datetime-local`, clock for `time`.
- ⚠️ A CSS variable CANNOT be used inside a `data:` URI, so `#ffb021` is hardcoded as `%23ffb021`.
  Safe because **amber is #ffb021 in BOTH themes**.
- ⚠️ **Applied globally to every date/time input in the app**, not just the New Route form —
  deliberate, it is the same affordance everywhere. Tell Luc.
- Firefox draws no indicator at all, so there is nothing to recolour there. Chrome/Edge/Safari only.
- Verified `/tmp/w55.json` -> `/tmp/w55_form.png`, cropped+zoomed to `/tmp/w55_zoom.png` and opened
  with `read`: calendar glyph amber on Date, clock glyph amber on Start time.
- ⚠️ The icons are ~14px; a full-page screenshot is useless for judging them. **Crop and upscale
  300% with `convert` before opening.**

### PART 3 — the "dispatcher" role (IN PROGRESS)

**Design decision (mine, disclosed):** roles are a linear ladder and `dispatcher` slots BETWEEN
field and manager. It means "runs the delivery board, nothing else". So:
- RANK renumbered `{ owner: 5, admin: 4, manager: 3, dispatcher: 2, field: 1 }`.
  ⚠️ Safe to renumber: **RANK is only ever read inside `requireRole`** (checked).
- All 11 delivery-board procedures in `routes.ts` dropped `manager` -> `dispatcher`:
  create, update, addStops, addLiveStop, geocodeStops, setStopPin, updateStop, removeStop,
  reorder, optimize, assign.
- **`routes.remove` deliberately STAYS at `manager`** — Luc only asked that a dispatcher can
  *create* runs; a brand-new role should not silently inherit the destructive one. One-word change
  if he disagrees. MUST be disclosed.
- Everything gated at `manager` elsewhere (orgs, projects, team, messages) now automatically
  excludes dispatcher, which is the intent.

⚠️⚠️ **THE BIG TRAP — `role !== "field"` is used ~20 times as shorthand for "can manage".**
Adding a role BELOW manager silently grants dispatchers templates, projects, messages, billing,
teamspace delete and photo delete. Every one of those call sites has to be audited. Added
`export function isManager(role)` (rank >= manager) in `auth.ts` for exactly this.

**Server edits DONE:**
- `auth.ts` — Role type, RANK, new `isManager()` helper.
- `team.ts` — `roleEnum` now includes "dispatcher" (covers invite + role change).
- `photos.ts` — imports `isManager`; both delete guards `role === "field"` ->
  `!isManager(context.role)` so a dispatcher CANNOT delete evidence.
- `routes.ts` — the 11 sites above.
- `schema.ts:31` — role comment updated.
- `auth.ts` `visibleProjectIds` left as `role !== "field"` ON PURPOSE: a dispatcher must see every
  project/run to dispatch, so returning null (see everything) is correct.

**Client edits DONE:**
- `role-badge.tsx` — dispatcher chip `border-amber-deep/60 bg-amber-deep/10 text-amber-deep`
  (deep amber = delivery colour, distinct from owner's plain amber).
- `app-team.tsx` — `ROLES` array + `ROLE_HINT` now include dispatcher.

**STILL TO DO for part 3:**
1. i18n key **`team.hintDispatcher`** in ALL 11 web catalogs (en value:
   "Builds and runs delivery routes only."). ⚠️ `en.ts` exports
   `Catalog = Record<keyof typeof en, string>`, so a key only in en.ts is a type error in the other
   10. Add to all in ONE python pass. This is a single key with real translations — allowed, NOT
   "resuming translations".
2. Mobile `packages/mobile/app/team.tsx`: `ROLES` (line ~34) add "dispatcher"; `roleColor`
   (line ~84) needs a dispatcher branch.
3. **AUDIT the ~20 `role !== "field"` client call sites** and exclude dispatcher where the meaning
   is "manager or above": web `app-templates`, `app-projects`, `app-project`, `app-messages`,
   `app-profile` (canDeleteAccount), `app-teamspace` (canDelete), `photo-drawer` (canDelete),
   `app-billing`, `app-share`; mobile `(tabs)/settings`, `(tabs)/projects`, `(tabs)/messages`,
   `photo-detail` (canDelete), `share`, `plans`, `profile`, `profile-menu`.
   **KEEP dispatcher allowed** on `app-routes`/`app-route` canManage (that is the whole point).
4. `terms.tsx:33` legal copy enumerates "(owner, admin, manager, field)" — add dispatcher.
5. New Route form: read-only **"Dispatcher"** field showing the current user's name.
   ⚠️ NO new DB column needed — `routes.createdBy` already records the creator.

### PART 4 — start-address autocomplete (NOT STARTED)
- Luc chose **Google**, and will enable it himself. **PROVEN BLOCKER:** both
  `maps.googleapis.com/maps/api/place/autocomplete/json` (legacy, REQUEST_DENIED) and
  `places.googleapis.com/v1/places:autocomplete` (403 SERVICE_DISABLED, project 222895504630)
  are OFF. Build it so it lights up the moment he enables **Places API (New)**.
- Server key `GOOGLE_MAPS_SERVER_KEY` already in `.env`; `packages/web/src/api/lib/geocode.ts`
  already calls Google and **already degrades quietly when unconfigured — copy that pattern.**
- Plan: new server procedure that proxies Places Autocomplete (keeps the key server-side), typed
  through oRPC, debounced suggestion dropdown under the Start address field, and a quiet no-op when
  Google returns SERVICE_DISABLED so the field stays a plain text box until he flips it on.

### ITEM 55 — PROGRESS UPDATE (parts 3 & 4)

**Part 3 client work DONE.** New helper files `packages/web/src/web/lib/roles.ts` and
`packages/mobile/lib/roles.ts` (`canManageWorkspace`, `canRunDeliveries`). Applied at 19 call
sites via one python pass:
- MANAGER-AND-ABOVE (dispatcher excluded) — web: app-templates, app-projects, app-project,
  app-messages, app-teamspace, photo-drawer, app-billing (isField inverted), app-team (isField),
  dashboard-shell (nav filter), app-routes canDelete. mobile: (tabs)/settings, (tabs)/projects,
  (tabs)/messages, photo-detail, profile-menu, plans, team, (tabs)/routes canDelete.
- DISPATCHER ALLOWED (`canRunDeliveries`): web app-routes canManage, app-route canManage.
- LEFT as `!== "field"` ON PURPOSE, with reasons:
  * web app-profile canDeleteAccount + mobile profile isField — self-deletion is a personal
    power, and the existing rationale is specific to field crew's captures being evidence.
  * web app-share:31 + mobile share:59 — **share.ts has NO requireRole at all** (checked); those
    flags only decide whether "whole workspace" scope is offered, and a dispatcher genuinely sees
    every project (`visibleProjectIds` returns null), so treating them as field would be wrong.
  * web app-team.tsx:307 `member.role !== "field"` — that is the "this role sees all projects"
    caption about ANOTHER member, and it is true of a dispatcher.
- `terms.tsx:33` legal copy now lists dispatcher.
- New Route form: read-only **Dispatcher** field showing `org.data?.user.name`, placed between
  Route name and Date. New i18n keys **`routes.fDispatcher`** (value stays English "Dispatcher"
  in all 11) + **`routes.fDispatcherHint`** (translated) in ALL 11 web catalogs.

**Part 4 BUILT (unlit).** New `packages/web/src/api/lib/places.ts` — POSTs to
`places.googleapis.com/v1/places:autocomplete` with `X-Goog-Api-Key`, returns `[]` on ANY failure,
`warnOnce()` per reason so a disabled API does not log per keystroke, min 3 chars, max 6 results.
New procedure `routes.suggestAddress` (gated `dispatcher`) at routes.ts:1074. New hook
`useAddressSuggestions` in web `queries/routes.ts` (`staleTime: Infinity`, `retry: false`).
UI: start-address block converted from `<label>` to a `<div>` wrapper (⚠️ a button inside a label
steals the click back to the input — same class of bug as ITEM 54's button-in-anchor), 300 ms
debounce, dropdown of `<button>`s with `onMouseDown` preventDefault so blur does not race the pick.
**Still returns [] until Luc enables Places API (New) on project 222895504630.**

Gates after all of the above: lint PASS, web tsconfig.app PASS, web tsconfig.node PASS.
STILL TO DO: mobile tsc re-run, browser verification, deliver, report.

### ITEM 55 — VERIFICATION (all four parts complete)
- `/tmp/role55b.ts` truth table: requireRole "dispatcher" -> owner/admin/manager/dispatcher ALLOW,
  field BLOCK. requireRole "manager" -> dispatcher BLOCK. isManager(dispatcher) = false.
- `/tmp/rolehelp55.ts`: web+mobile helpers agree — dispatcher manage=false, deliver=true.
- Web New Route (`/tmp/w55b_form.png`): read-only DISPATCHER field = "Ops Admin", hint below,
  amber calendar + clock icons still correct.
- Web Team (`/tmp/w55_badge2.png`): deep-amber DISPATCHER chip rgb(176,108,0); both role selects
  offer dispatcher; role card hint "Builds and runs delivery routes only."
- Mobile Team (`/tmp/m55_team.png`): DISPATCHER chip + invite picker ADMIN/MANAGER/DISPATCHER/FIELD.
- Part 4 (`/tmp/places55.ts`): PERMISSION_DENIED from Google, returns [], one warn line. UI check
  `/tmp/w55addr.json`: typing "34 Clearview" -> 0 dropdowns, no error text, field behaves normally.
- ⚠️ Dave Crew was flipped to `dispatcher` in the DB for the UI checks and **PUT BACK to `field`**.
- ⚠️ Vite serves stale modules after edits to rarely-touched components — the dispatcher chip
  showed the FIELD fallback until the dev server was restarted. Restart before judging a chip.
- Gates: lint PASS, web app PASS, web node PASS, mobile PASS.

---

## ITEM 56 — mobile New route screen (dispatcher-only) + driver live stop

Luc's brief, in his words: port the website's New route form to the phone for
**dispatcher access only**, and give the **driver** a way to type an address mid-run
and tack on a delivery. He picked the **narrow rule** for the driver permission.

### Decisions taken (disclosed to him)

1. **Narrow rule for `addLiveStop`** (his choice): dispatcher+ may add a stop to any run;
   a `field` driver only to a run assigned to them AND already `active`. Draft runs and
   other people's runs stay shut. Implemented as `assertCanAddLiveStop()` in routes.ts,
   deliberately placed next to the existing `assertRouteAccess()` it complements.
2. **`suggestAddress` opened to every workspace member** (was `dispatcher`). A driver
   typing a live stop needs the same dropdown and an address search leaks nothing about
   the workspace. `orgProc` still bars non-members. Told him I was making this call
   rather than blocking on another round-trip.
3. **NO new native package for date/time.** This is the important one. Luc's Expo/APK
   builds fail platform-side and he is stuck on an older installed app version. Adding
   `@react-native-community/datetimepicker` (a native module) would mean the new screen
   could not work in his current app at all, would not run in Expo Go, and could not be
   verified in the web preview. So date and time are pure-JS stepper controls instead:
   `‹ date ›` with a "Today" reset, and `‹ 08:00 ›` in 15-minute steps. Works everywhere,
   no rebuild needed, and I can actually test it. MUST be reported to him plainly.

### Done so far

- `packages/web/src/api/routes/routes.ts`
  - imported `type Role` from middleware/auth
  - NEW `assertCanAddLiveStop(route, context)` above `assertRouteAccess` (~line 183)
  - `addLiveStop`: loads route FIRST, then calls the new guard (was `requireRole` before load)
  - `suggestAddress`: dropped `requireRole(...,"dispatcher")`, handler destructures `{ input }`
    only, docstring corrected
  - file now 1107 lines, still under the 2000 cap
- `packages/mobile/queries/routes.ts` — added `useCreateRoute`, `useAddLiveStop`,
  `useAddressSuggestions` (same cache-forever / no-retry cost policy as web)
- i18n: mobile catalogs ALREADY mirrored nearly every key needed (`routes.newTitle`,
  `fName`, `fDate`, `fStartTime`, `fStartAddress`, `fStartHint`, `fServiceMinutes`,
  `fReturnToStart`, `fRequireSignature`, `create`, `fMode`, `modePlanned/Dispatch`,
  and the whole `routes.live*` set). Only **3** were missing; added to all 11 catalogs:
  `routes.fDispatcher` (English word, standing rule), `routes.fDispatcherHint`
  (reused the existing web translations verbatim), `common.today` (new, 11 languages).
  Verified 3/3 in every catalog. Inserted BEFORE anchors, per the tl.ts wrap trap.

### Next steps

1. NEW `packages/mobile/app/route/new.tsx` — the form. Gate on `canRunDeliveries`.
2. "New route" button on `app/(tabs)/routes.tsx` header, same gate.
3. "Add a stop" block on `app/route/[id].tsx` for the driver (reuse `routes.live*` keys).
4. Shared address-suggestion input — both screens need it, so build it once as
   `packages/mobile/components/address-input.tsx`.
5. Gates: mobile `bunx tsc --noEmit`, root `bun run lint`, both web tscs.
6. Verify in Expo web preview; retest the driver rule with `/tmp/setrole55.ts`.

### Traps to remember here

- Mobile has NO route-creation flow today, so this is genuinely new surface, not a port
  of existing mobile code. Everything comes from the web form's behaviour.
- `create` server input requires `date` as `YYYY-MM-DD` and `startMinutes` as minutes
  past midnight (0-1439) — NOT a time string. Web has `toMinutes()`; mobile needs its own.
- Dispatch mode is plan-gated server-side (`deliveryDispatch`) and throws 402. The form
  must surface that message, not swallow it.
- A driver hitting "Add a stop" on a NOT-yet-started run now gets
  "Start the route before adding a stop" — that is intended, surface it.

### ITEM 56 progress — code COMPLETE, server guard VERIFIED

Files finished since the last note:
- `packages/mobile/app/route/new.tsx` — fixed the two known defects (removed the unused
  `DAY_MS`, and `React.ReactNode` -> `import { useState, type ReactNode }`).
- `packages/mobile/app/(tabs)/routes.tsx` — added the amber "New route" header button, gated on
  `canRunDeliveries(org.data?.role)`; import widened to `{ canManageWorkspace, canRunDeliveries }`.
  New styles `headerRight`, `newBtn`, `newText`. Existing `canDelete` untouched.
- `packages/mobile/app/route/[id].tsx` — added the driver "Add order now" block before the
  closed-stops section: collapsible sheet, `AddressInput` + recipient field, amber Add button,
  cancel, inline error, success note. New state (`liveOpen/liveAddress/liveRecipient/liveNote/
  liveError`), `useOrg`, `useAddLiveStop`, `submitLiveStop()`, `canAddLive`, style `liveWrap`.
  Its ScrollView ALREADY had `keyboardShouldPersistTaps="handled"` (line ~179) — nothing to add.
  `canAddLive` = route open AND (dispatcher+ OR status === "active"), so the button is never
  shown to someone the server would refuse.

GATES — all four PASS:
- root `bun run lint` — 0 warnings, 0 errors
- `packages/mobile` `bunx tsc --noEmit` — clean
- `packages/web` `tsconfig.app.json` — clean
- `packages/web` `tsconfig.node.json` — clean

SERVER GUARD VERIFIED end-to-end through the real oRPC endpoint (this is the part tsc never
checks). Method: `fetch('/api/rpc/routes/addLiveStop', {json:{...}})` from inside the signed-in
web page, bearer token read from `localStorage['runable.managed-auth.token']`; role flipped in
the DB between calls with `/tmp/i56role.ts <role> [assign|clear]`. Generator `/tmp/i56gen.py`
writes the CDP steps, run with `/tmp/cdp7b.mjs`.

  Ops Admin = OWNER
    draft route                        -> 200 OK, stop added, pos 5/6, located=true
  Ops Admin = FIELD
    Dave's route (not theirs)          -> 403 "Not your route"
    draft route (driverId null)        -> 403 "Not your route"
    own ACTIVE route                   -> 200 OK, stop added, pos 6/7, located=true
  Ops Admin = FIELD, draft assigned to them
    draft route (assigned, not active) -> 403 "Start the route before adding a stop"

That is the whole narrow rule, both allows and all three refusals, proven against the server.

TEST DATA RESTORED — confirmed by re-query:
- Ops Admin back to `owner`, Dave Crew still `field` (never touched this time).
- draft route `rte_MTPSHMRYDBC1MY4Y61` driverId back to null.
- `/tmp/i56clean.ts` deleted both probe stops + their routeEvents and re-sequenced the two
  affected routes (draft -> 5 stops, active -> 6 stops). 0 probe stops remaining.
- `rte_MTPAPYVOR0XA61W4JP` (the DO-NOT-DELETE CSV route) was only ever used on a REFUSAL path,
  so it was never mutated.

### Still to do

1. UI check in the Expo web preview (`/tmp/cdp_tap.mjs`, deep link `.../route/new`):
   form renders, date steppers + "Today", 15-min time steps, address suggestions appear and
   fill on tap, Create makes a route. Then the "Add order now" block on a route screen.
   ⚠️ Open EVERY screenshot with `read` — a clean text scan has hidden a visual bug 7x here.
2. Deliver both artifacts, then report.

### Report must cover (unchanged, plus)
(a) date/time steppers and why no native picker; (b) `suggestAddress` now open to all members —
my call; (c) exactly what the narrow driver rule allows/refuses incl. the two 403 messages;
(d) a native date picker is still available later if APK builds start working; (e) the latent
UTC date bug still in the WEB form (`app-route-new.tsx` ~line 25) — NOT fixed, offer it as a
separate small job.

### ITEM 56 — UI VERIFIED in the Expo web preview (light theme, 420x900)

Metro was restarted first because `app/route/new.tsx` is a brand-new expo-router file.

- `/route/new` renders: NEW ROUTE, ROUTE NAME, DISPATCHER (read-only "Ops Admin" + hint),
  DATE, START TIME, START ADDRESS, MINUTES PER STOP (5), ROUTE TYPE (Planned selected amber /
  Dispatch), Return to start, Require signature, CREATE ROUTE. Screenshot opened and checked.
- Date stepper: 2026-09-10 -> +2 days -> 2026-09-12 -> -1 -> 2026-09-11 -> "Today" -> 2026-09-10.
  Confirms `todayLocal()` gives the correct LOCAL date (no UTC off-by-one on mobile).
- Time stepper: 08:00 -> +3 steps -> 08:45 -> -1 step -> 08:30. 15-minute steps confirmed.
- Start address: typing "34 Clearview" returned 5 real Google suggestions, laid out INLINE
  below the field (not clipped). Verified on screenshot.
- Create: filled the name, tapped CREATE ROUTE -> navigated to
  `/route/rte_MTVBLHLOVC3R7XHAG8`, header "ITEM56 MOBILE CREATE TEST", 0/0, "Add order now".
- Driver live stop on that route: tapped "Add order now" -> sheet opens with DELIVERY ADDRESS,
  suggestions, hint "It slots into the stops the driver has not reached yet. Nothing already
  delivered moves.", Recipient name, amber ADD TO RUN, Cancel. Typed "34 Clearview", tapped the
  Moncton suggestion (field filled with the full address), tapped ADD TO RUN ->
  "Added as stop 1 of 1", stop card shows the GEOCODED address
  "34 Clearview St, Moncton, NB E1A 4H2, Canada", counter 0/1. Both screenshots opened.
- Routes tab: amber "+ NEW ROUTE" button in the header next to the language menu. Checked.

⚠️ Harness note for next time: `/tmp/cdp_tap.mjs` `tapSel`/`tapText` measure live coords but do
NOT scroll into view. A raw `{"tap":[x,y]}` below the viewport silently does nothing (my first
CREATE ROUTE tap at y=936 in a 900-tall viewport). Scroll the RNW ScrollView first
(`els[els.length-1].scrollTop = scrollHeight`), then use `tapSel`.
⚠️ RNW Pressables are NOT `[role=button]` here — `document.querySelectorAll('[role=button]')`
returned nothing. Select them by `[aria-label="..."]` instead.

### TEST DATA — fully restored, re-queried and confirmed
- Throwaway route `rte_MTVBLHLOVC3R7XHAG8` + its stops/events deleted (`/tmp/i56cleanroute.ts`).
- 3 routes remain, exactly the documented baseline; Ops Admin `owner`, Dave Crew `field`.

### ITEM 56 STATUS: code complete, all 4 gates pass, server guard + UI verified.
Remaining: deliver + report (points a-e above).

---

## ITEM 57 — Driver role + delivery/field product split (Luc, 2026-09-10)

### Confirmed ruleset (from two ask_questions rounds)
- SIX roles: owner, admin, manager (both sides) | dispatcher (BOTH sides) | driver (delivery only) | field (field only).
- Driver: own routes + stops + proof-of-delivery capture. NO Projects, NO job-site photos.
- Field: never sees Routes.
- Dispatcher: BOTH sides. ⚠️ Luc's Q1 free-text put dispatcher in the delivery category but his
  direct Q5 answer said "both sides, as today". Ruled in favour of Q5 (explicit + non-destructive)
  and told him so plainly. Not re-litigated.
- Plans FULL SPLIT: free/plus/business/crew10/crew25 -> delivery OFF.
  delivery-* -> field OFF (but photo capture stays; POD is a photo).
- Enterprise: existing `enterprise` row stays the DELIVERY tier; ADD a new field-side
  `enterprise-field` ("Enterprise Field").
- Routes on a plan without delivery: stay VISIBLE + READ-ONLY. Never delete.
- No real customers on any workspace -> no migration risk. All 6 orgs are tests.

### Facts established this session (do not re-derive)
- `members.role` is plain `text` with NO enum/check constraint -> adding "driver" needs NO migration.
- `plans.limits` is a JSON blob column -> adding `fieldEnabled` needs NO migration.
- ⚠️⚠️ BIGGEST TRAP: `syncPlans()` only INSERTS MISSING rows. Existing rows keep operator edits.
  `refreshLegacyRow()` only merges delivery fields when `deliveryStopsPerMonth === undefined`.
  Current rows already have it defined AND do not match LEGACY_SHIPPED text, so **editing
  DEFAULT_PLANS alone changes NOTHING in the DB**. Stage C needs a deliberate one-time re-sync.
- `RANK` is read ONLY inside `requireRole`.
- Org plans today: We Deliver = business, Ops Admin test org = business, other 4 = free.

### Stages
- STAGE A (server + shared): Role type + RANK (driver:1, field:1 as peers), side helpers
  canUseDelivery/canUseField in auth.ts; mirror in web+mobile lib/roles.ts (KEEP IN STEP).
- STAGE B (clients): nav gating web + mobile, invite/role pickers, i18n role name "Driver"
  (English, per standing rule) + translated hint in 11 web + 11 mobile catalogs.
- STAGE C (plans): `fieldEnabled` in PlanLimits + rowToPlan default + all seeds + new
  `enterprise-field` plan + the one-time re-sync + plan-copy across 11 languages.

### Gates (all four must pass, same as items 55/56)
bun run lint | mobile tsc --noEmit | web tsc -p tsconfig.app.json | web tsc -p tsconfig.node.json
⚠️ `packages/web/src/api` is in NO tsconfig -> API changes MUST be exercised in the browser.

### Stage A + server enforcement: DONE, ALL 4 GATES PASS, VERIFIED IN BROWSER

Files changed:
1. `packages/web/src/api/middleware/auth.ts` — Role union +"driver"; RANK now a 6-key object with
   driver:1 and field:1 as PEERS; DELIVERY_ROLES/FIELD_ROLES allowlists (fail closed);
   canUseDelivery/canUseField/requireDelivery/requireField; NEW `fieldProc` + `deliveryProc`
   derived procedures after orgProc.
2. `packages/web/src/api/routes/routes.ts` — ⚠️ FIXED A REAL HOLE. `assertRouteAccess`,
   `assertCanAddLiveStop` and the `list` filter all spelled the crew check as `role !== "field"`,
   so a DRIVER walked straight through to every route in the workspace. Concept now lives in ONE
   helper `isOwnRoutesOnly(role)` (= driver only). `requireDelivery` added to all three.
3. `packages/web/src/api/routes/projects.ts` — uniform `orgProc` -> `fieldProc` swap (7 sites).
4. `packages/web/src/api/routes/team.ts` — roleEnum accepts "driver" (without this nobody can
   ever BE assigned the role).
5. `packages/web/src/web/components/role-badge.tsx` — driver chip, lighter amber-deep.
6. `packages/web/src/web/pages/app-team.tsx` — ROLES + ROLE_HINT union/map.
7. `packages/mobile/app/team.tsx` — ROLES, ROLE_HINT (also filled in the MISSING dispatcher hint),
   roleColor branch.
8. 11 web i18n catalogs — `team.hintDriver`, verified 11/11.

VERIFIED TRUTH TABLE (real oRPC calls, bearer token, role flipped in DB between runs):
| role | routes.list | routes.get OWN | routes.get DAVES | projects.list |
| driver | 200 len=1 (own only) | 200 | 403 "Not your route" | 403 "...job photo system" |
| field  | 403 "...delivery system" | 403 same | 403 same | 200 (len=0, existing assignment scoping) |
| owner  | 200 len=3 | 200 | 200 | 200 len=6 |
Test data RESTORED: Ops Admin=owner, Dave Crew=field, 3 routes, driverId untouched.

### NOT DONE YET (ITEM 57 remaining)
- `photos.ts` is MIXED and deliberately untouched: a driver MUST keep photo create/read for
  proof-of-delivery, so it cannot take a blanket `fieldProc`. Needs a per-endpoint pass
  (block library list/map/stats; keep create + own-stop reads).
- NAV GATING NOT DONE (web + mobile): a driver still SEES the Projects nav and a field member
  still sees Routes; the server 403s them, so the UI would error instead of hiding.
  ⚠️ THEREFORE: do not assign anyone the Driver role in a real workspace yet.
- STAGE C plans split not started (fieldEnabled flag, strip delivery from free/plus/business/
  crew*, new `enterprise-field`, the one-time re-sync, plan-copy 11 languages).

### ITEM 57 STATUS: Stage A + routes/projects enforcement done & verified. Nav + photos + plans remain.


### ITEM 57 — session update (leak closed)

STAGE A + nav gating: DONE, verified.
THE `/app` LEAK: **CLOSED and verified on web AND mobile.** Root cause was NOT the page — it
was `visibleProjectIds()` in auth.ts returning `null` ("unrestricted") for any role that was
not `field`, so a driver had workspace-wide photo scope at the data layer. Same bug class as
the routes.ts hole.

Changes this session:
1. auth.ts `visibleProjectIds` — `driver` now returns `[]`, so a driver is scoped to their own
   unfiled captures and nothing filed under any job.
2. photos.ts — `map` + `stats` -> fieldProc (403); `move` + `update` -> fieldProc;
   `list`/`create`/`videoPolicy`/`verify` stay orgProc so proof-of-delivery and the driver's own
   /my-captures keep working; nested `templates` sub-router left open (POD uses watermarks).
3. photos.ts `get` — was NEVER scoped: any photo id in the org was readable. Now a
   scope-restricted role (field OR driver) may only open a photo in an assigned project or one
   they shot themselves. Returns NOT_FOUND, not FORBIDDEN, so it never confirms the id exists.
   This tightens FIELD members too, not just drivers.
4. NEW `packages/web/src/web/components/product-route.tsx` + app.tsx — 9 routes wrapped
   (6 field, 3 delivery). A driver hitting /app is bounced to /app/routes.
5. mobile `app/_layout.tsx` Gate() extended in place with the same product redirect
   (FIELD_ONLY_SCREENS / DELIVERY_ONLY_SCREENS). Guard lives in the LAYOUT, not the screens:
   an early return inside a screen breaks hook order when the role resolves async.

Verified as driver through the real endpoints: photos.list 200/photos=0, photos.map 403,
photos.stats 403, projects.list 403, photos.videoPolicy 200, routes.list 200 len=1.
Web /app -> /app/routes. Mobile /teamspace -> /routes. Screenshots read, not just scanned.
All 4 gates pass. Test account RESTORED to owner.

KNOWN, DISCLOSED: photos.get on the test job photo still 200s for the flipped account because
that photo's author IS that account ("own capture" rule). Artifact of role-flipping a test
account; a real driver never had job photos.

STAGE C (plan split) — NOT STARTED. Still owed. Remember the trap: syncPlans() only INSERTS
missing rows, so editing DEFAULT_PLANS alone changes NOTHING in the DB — needs a deliberate
one-time re-sync.

## 2026-09-10 — Item 57 continuation: watermark owner/admin tightening
- Luc added: watermark stamp management should only be accessible to Teamspace owner and admins.
- Interpretation locked: template `list` stays open for all roles so field capture and driver proof-of-delivery stamping keep working. Only create/update/default/delete and the Watermarks page/tile are owner/admin.
- Implemented so far: server guards changed to admin, shared `canManageWatermarks()` added to web/mobile, web nav/page guard added, mobile drawer/settings changed, `perm.templatesNote` updated in all web/mobile catalogs, web `perm.adminOnly` added.
- Next: format, typecheck/lint, verify manager endpoint + UI behavior, restore test account to owner, then start Stage C plan split.
- DONE + VERIFIED (2026-09-10): manager gets 403 on templates create/update/setDefault/remove
  ("Requires admin access or above") while templates.list returns 200 len=6 and photos.videoPolicy
  200. Web /app/templates bounces a manager to /app and the Watermarks sidebar entry is gone.
  Mobile drawer as manager has no Watermarks tile (Plan kept); settings stamp block shows the live
  preview plus the new note. Owner path re-verified: page renders, setDefault + update both 200.
  Test account RESTORED to owner. All 4 gates pass.
- STILL OWED: Stage C, the plan split (fieldEnabled + enterprise-field + deliberate plan re-sync).

## 2026-09-10 — ITEM 57 STAGE C (plan split): DONE + VERIFIED IN BROWSER

Copy answers from Luc, implemented:
1. Field plans' false delivery bullet -> "Delivery routes come with the Delivery plans" (Plus,
   Business, Crew 10, Crew 25 — 4 originally different strings, now one line). Free never had one.
2. Delivery Lite -> "Unlimited proof-of-delivery photos on every stop".
3. Delivery Pro -> "Everything in Delivery Lite".
4. Enterprise Field: priceCents -1 / period "talk to us" (same as Enterprise). Copy was MY choice
   per his "your choice" — disclosed to him in writing.

Code:
- plans.ts: bullets rewritten, `fieldEnabled` on every seed, delivery zeroed on the 5 field plans,
  new `enterprise-field` seed. sortOrder = 5 (NOT 21): the billing grid orders by sortOrder and
  draws its "Delivery routes" divider before the first delivery plan, so 21 rendered a field plan
  under the delivery heading. Fixed in seed + DB.
- plan-copy.ts: `enterprise-field` tagline in 10 locales + new `SPLIT_ERA_BULLETS` map for the 3
  new English bullets (they don't line up by index with any legacy translation array).
  ⚠️ TRAP HIT: writing accents via python \uXXXX + unicode_escape produced mojibake (lint caught,
  204 errors). Undone and re-applied by writing literal UTF-8 in the python source. 0 mojibake now.
- NEW plan-guards.ts: assertDeliveryEnabled (moved from routes.ts) + assertFieldEnabled (new).
  Both one-directional: block creation, never block reading.
- projects.ts create: assertFieldEnabled(plan). update/remove/list/get untouched on purpose.
- admin-plans.ts: `fieldEnabled: z.boolean().optional()` on limitsSchema.
- index.tsx pricing CTA: was hardcoded `plan.id === "enterprise"`, now `plan.priceCents < 0`, and
  the mailto subject uses plan.name. Without this Enterprise Field showed a self-serve "Choose"
  button with no checkout behind it. app-billing.tsx already keyed off price+autumnPlanId — no change.

DB: the deliberate re-sync IS DONE. 12 rows updated + enterprise-field inserted = 13 rows.
  Backup (rollback point): /tmp/plans-backup-20260910.json (12 rows, pre-change).
  After state: /tmp/plans-after-20260910.json (13 rows, re-dumped after the sortOrder fix).
  Scripts: /home/user/i57resync-dry.ts (dry-run default, --apply), /home/user/i57ins.ts (idempotent).

VERIFIED IN BROWSER (screenshots read, not just text-scanned):
- Public /#pricing anon: 13 cards. Field grid = Free, Plus, Business, Crew 10, Crew 25,
  Enterprise Field (2 clean rows of 3, no grey filler slabs). New bullets x4 / x1 / x1 present,
  all 3 old strings gone. Enterprise Field = "Custom" + TALK TO US mailto + sales@geocliks.com.
  ⚠️ NOTE for future checks: Chrome innerText applies text-transform, so a probe for
  "Enterprise Field" returns 0 on an uppercase-styled name — compare lowercased.
- /app/billing signed in: Enterprise Field renders with the field plans ABOVE the Delivery routes
  divider, button "Talk to us" (contactOnly path).
- REAL ENDPOINT GATE PROOF (in-page fetch to /api/rpc, owner of Ops Admin's Team):
  plan=business  -> routes/list 200 len=3 (existing routes STILL READABLE), routes/create 402
                    "Delivery Routes is not included in Business...", projects/create 200,
                    projects/list 200 len=7.
  plan=delivery-lite -> projects/list 200 len=7 (existing projects STILL READABLE),
                    projects/create 402 "The job photo system is not included in Delivery Lite...",
                    routes/list 200, routes/create 200.
  CLEANED UP: probe rows deleted (back to 6 projects / 3 routes), org plan restored to `business`,
  test account role restored to `owner`.
All 4 gates pass. Both dev servers 200.

NOT DONE / follow-ups:
- admin-plans.tsx (superadmin plan editor UI) has NO fieldEnabled toggle. Schema accepts it, UI
  can't set it. Not requested by Luc — flagged to him as an optional follow-up.
- photos.ts per-endpoint driver pass (from the earlier Stage A note) still open.
