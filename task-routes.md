# Delivery Routes — M1 build log

Spec: /home/user/geocliks-routes.report/content.md (v2, approved)

## Done + verified
- [x] schema.ts — routes, route_stops, route_events, geocodes (568 lines). `db:push` applied.
- [x] api/lib/geocode.ts — cache-first geocoder, degrades with no key.
- [x] api/lib/optimize.ts — local NN + 2-opt (default, free) + google single-vehicle backend + insertionIndex().
- [x] api/routes/routes.ts — list, get, create, update, addStops, geocodeStops, setStopPin,
      updateStop, removeStop, reorder, optimize, assign, events, remove, failedReasons.
- [x] api/index.ts wired (`routes`).
- [x] lint 0 errors, `bunx tsc --noEmit` (web) exit 0 after the API layer.
- [x] web/queries/routes.ts

## In progress
- [ ] pages/app-routes.tsx (written, not compiled)
- [ ] pages/app-route-new.tsx (written, not compiled)
- [ ] pages/app-route.tsx  <-- NEXT
- [ ] app.tsx routes + DashboardShell NAV entry (`/app/routes`, icon Route)
- [ ] i18n: en.ts first, then 10 locales, then `cp` to packages/mobile/i18n/

## Then
- [ ] lint + web tsc + mobile tsc (kill dev servers first) + build
- [ ] restart servers, screenshot /app/routes, deliver website index 0

## Notes
- Existing keys reused: common.cancel, common.delete, common.save, queue.unassigned.
- GOOGLE_MAPS_SERVER_KEY still unset — geocoding degrades to manual pins. Tell the user.
- M2 (mobile driver run) and M3 (notifications) are NOT in this milestone.

## M1 verified — 2026-09-05
- lint 0/0 (236 files), web tsc 0, mobile tsc 0, build 2/2, i18n PARITY_OK x10.
- Screenshots checked: /app/routes empty state + /app/routes/:id builder (6 stops).
- Test route in ops org (org_sgCFWGKy...): rte_MTOXMYAT145ZPK6YHW "Friday drops — Moncton", 6 Moncton stops. KEEP for M2 testing.
- Geocoding blocked: existing VITE_GOOGLE_MAPS_API_KEY returns REQUEST_DENIED ("The provided API key is invalid") for the Geocoding REST API — it is a browser/referrer-restricted key. Needs a separate GOOGLE_MAPS_SERVER_KEY in root .env.
  NOTE: routes.geocodeStops reports available:true because a key string exists, so the "no key" banner does not fire; stops just land in "needs attention". Consider surfacing the REQUEST_DENIED reason in M2.
- Delivered to user: web-only (website index 0).
- Next: M2 mobile driver run (start / completeStop / failStop procedures do not exist yet).

## Geocoding live — 2026-09-05 (later)
- User supplied GOOGLE_MAPS_SERVER_KEY (saved to root .env, masked form). I also added GOOGLE_CLOUD_PROJECT=geocliks-d12b8.
- BUG FOUND + FIXED: geocode.ts cached FAILURES from the pre-key era forever, so the fixed key changed nothing.
  Fix: callGoogle now returns { result, cacheable }. Only ZERO_RESULTS / NOT_FOUND are cached as permanent failures;
  REQUEST_DENIED / OVER_QUERY_LIMIT / INVALID_REQUEST / UNKNOWN_ERROR / network errors stay retryable.
  Added GeocodeOptions { force } to geocode()/geocodeAll(); routes.geocodeStops passes input.force through, and
  the cache write is now an onConflictDoUpdate so "Resolve addresses" a second time really re-asks Google.
- Purged 12 poisoned 'failed' rows from the geocodes table.
- Verified on rte_MTOXMYAT145ZPK6YHW: resolved 6 / failed 0; optimize -> 17534 m, 3608 s, 6 ordered, 0 unroutable. Screenshot confirms all six stops LOCATED and "17.5 km · 60 min · Ordered by: local".
- backend:"google" was tested and silently FELL BACK to local, as designed. Route Optimization API does not accept a
  plain API key (needs OAuth / service-account creds). Local optimizer is the default per spec, so nothing is blocked.
  If we ever want the Google optimizer: service account JSON + GOOGLE_APPLICATION_CREDENTIALS, an M5 item.
- Re-verified: lint 0/0, web tsc 0, mobile tsc 0, build 2/2. Servers up: web 200, mob 200. Delivered.

## M2 shipped — 2026-09-06 (driver phone experience)
API (packages/web/src/api/routes/routes.ts):
- start / completeStop / runState procedures + loadStop, completionTime, runState helpers.
- completeStop REQUIRES a photoId for BOTH outcomes (delivered | failed). Failure is an outcome,
  not a separate procedure. Idempotent on a duplicate offline drain. Auto-activates a draft route.
  runState marks the route completed when the last stop closes.

Mobile:
- lib/queue.ts: FailedReason type + 5 route fields on QueuedPhoto; uploadOne closes the stop right
  after photos.create. Offline-first: the stop and its proof land together whenever the queue drains.
- queries/routes.ts: useRoutes / useRoute / useStartRoute / useCompleteStop / useFailedReasons.
- app/route/[id].tsx: the run screen. Start button, current-stop card (address, recipient, ref,
  notes), Navigate (Apple/Google maps deep link), TAKE DELIVERY PHOTO, Couldn't deliver -> 6 reason
  chips + note -> still forces a photo. Remaining + done lists. Queue-aware: a stop closed offline
  shows "Waiting to sync" immediately.
- app/routes.tsx: the driver's route list.
- app/(tabs)/index.tsx: reads stop params, forces tag=delivery + photo mode, prefills recipient,
  shows the "Delivering to" strip, attaches the 5 route fields in commit(), and router.replace()s
  back to the run screen. Entry point = amber "Today's route" banner on the Capture screen
  (no new tab; the tab bar is full at 6). Banner filters to routes where driverId === me.
- i18n: 29 new run.* keys x 11 locales, PARITY_OK x10, copied to packages/mobile/i18n.

Verified: lint 0/0 (239 files), web tsc 0, mobile tsc 0, build 2/2. Screenshots checked.
END-TO-END on rte_MTOXMYAT145ZPK6YHW (assigned to the ops admin): tapped TAKE DELIVERY PHOTO ->
capture handoff correct -> shutter -> back on the run screen at 1/6 with stop 2 current.
DB confirms seq 0 status=delivered photo_id=pho_MTP281FIPQY4KN5EM7, route status=active,
route_events row "delivered · 1234 Mountain Rd".
NOT DONE in M2: no re-close of a stop that failed to sync (the driver would re-shoot); no skip;
no signature requirement wired to routes.requireSignature on the run screen.
Next: M3 notifications (needs notify.geocliks.com verified in Resend) + the public /track page.

## M3 — notifications + public tracking (IN PROGRESS, 2026-09-06)

Done so far:
- email-templates.ts: exported `shell`, `button`, `escapeHtml` so route emails reuse the house shell.
- NEW `api/services/route-emails.ts`: routeStartEmail / routeNextEmail / routeDeliveredEmail (html + text, English-only, link to /t/:token).
- NEW `api/lib/route-notify.ts`: notifyRouteStarted(route) / notifyUpcoming(routeId) / notifyStopDelivered(stopId).
  Idempotency = notified_start_at / notified_next_at / notified_delivered_at. Never throws.
  Dead-zone guard: pending list + freshStop() re-read at send time. Logs a `notified` routeEvent.
- routes.ts wired: `start` -> notifyRouteStarted; `completeStop` -> notifyStopDelivered (delivered only) + notifyUpcoming.
- NEW `api/routes/track.ts` public `track.byToken` (base proc), registered in api/index.ts.
  Returns ONLY the recipient's own stop + stopsAway count. No other stop, no driver, no route name.
- NEW `web/queries/track.ts` (polls 30s while pending), NEW `web/pages/track.tsx`.

Next steps:
1. Register `/t/:token` in web/app.tsx (public block, before /app).
2. i18n `track.*` keys x11 (en.ts first).
3. lint + web tsc + mobile tsc + build + i18n parity + copy locales to mobile.
4. Set a recipient email on a stop of rte_MTOXMYAT145ZPK6YHW, exercise start/completeStop, screenshot /t/:token signed out (cdp10, ?r=1124+).
5. Deliver website index 0. Tell him notify.geocliks.com still needs Resend verification.

## M3 — RUNTIME VERIFICATION (2026-09-06)

Test route `rte_MTOXMYAT145ZPK6YHW` ("Friday drops — Moncton", org `org_sgCFWGKy…`), status active.

1. Set `recipientEmail = delivered@resend.dev` on all 5 pending stops via `routes.updateStop` (Resend's
   official sink address — always succeeds, no bounce, no reputation hit, no stranger emailed).
2. `emailConfigured() = true`, `emailFrom() = "GeoCliks <invites@geocliks.com>"`, `usingTestSender() = false`.
3. `notifyRouteStarted(route)` → 5 start emails. `notified_start_at` stamped on seq 1–5.
   Seq 0 (already delivered) correctly skipped.
4. `routes.completeStop(seq 1, delivered)` → HTTP 200.
   - `notified_delivered_at` stamped on seq 1 (proof email).
   - `notified_next_at` stamped on seq 2, 3, 4 (lead window = 2 → 3 stops). Seq 5 correctly untouched.
5. `route_events` now holds 9 `notified` rows: 5 × "Route start sent", 1 × "Proof of delivery sent",
   3 × "You're next sent".
6. IDEMPOTENCY: re-ran the identical `completeStop` → HTTP 200, `notified` event count stayed at 9.
   No duplicate email. The three `notified*At` columns hold.

### Bug found and diagnosed (NOT an M3 bug)
`/t/:token` first rendered a broken proof image. Root cause: the M2 test photo
`pho_MTP281FIPQY4KN5EM7` has a stored S3 object whose BYTES ARE AN HTML PAGE (starts `0x3c 0x21`)
with content-type `image/jpeg`. Bad test data from the earlier queue-drain test, not a code fault.
Proved by fetching a known-good photo `pho_MTONBEU8TJNM4R7KW7` → 200, `image/jpeg`, magic `FF D8`
(real JPEG). Bucket host is reachable from the sandbox (returns real S3 XML), so no interception.
Repointed stop seq 1 at the good photo; image then loaded (`naturalWidth 240`, `naturalHeight 160`).

### Screenshots (signed out, /tmp/cdp10.mjs, port 9351)
- `/tmp/track_del.png` + `/tmp/track_del_s.png` — delivered state: green DELIVERY STATUS chip,
  "Delivered" headline, proof photo, field table (address / for / delivered at / received by /
  photo code / sent by), TIME-VERIFIED AND SEALED badge, "Verify this photo" link, privacy line.
- `/tmp/track_pending.png` + `/tmp/track_pending_s.png` — pending state: amber chip, "You're next"
  headline, amber "Yours is the next stop" panel, field table, privacy line. No proof section.
- `/tmp/track_top.png` — the original broken-image shot, kept as evidence of the diagnosis.

### Still unverifiable from this sandbox
Actual inbox delivery. `sendEmail` returning ok and the DB stamps landing is all that can be proven here.
`notify.geocliks.com` is still NOT added or verified in Resend — that remains the real launch blocker.

Verification: lint 0 errors / 244 files. Web + mobile tsc exit 0, build 2/2, i18n PARITY_OK ×10
(all run before this session's testing; no source changed during testing).

## Invite sign-in UX fix (2026-09-06) — Gisele Cormier lockout

Reported: invite link to gcormier27@gmail.com errored; no forgot-password; page sizing doubt.

Findings (read-only prod queries, nothing mutated):
- user NESWfFlJPkcHEsEgAhIej9Ilvpjs71cA (gcormier27@gmail.com) EXISTS, credential account, created 1788655598639 — her first sign-up succeeded ~13 min before the error screenshot.
- Invites: inv_MTP39A6NY9C0AQ4PG3 (644nwva1dt) accepted; inv_MTP3SO5TA99T6Q3S70 + inv_MTP3XJURYHMS5CTTPM revoked. No pending invite remains.
- She has ZERO memberships and ZERO orgs. Invite marked accepted with no members row => limbo. Root cause NOT proven; two hypotheses: (a) partial failure in acceptInvite, (b) membership created then removed via Teamspace UI while troubleshooting (fits invite timeline).
- Error string "User already exists. Use another email." is better-auth's own, relayed by sign-in.tsx:81.

Fix shipped (web only):
- sign-in.tsx: on sign-up USER_ALREADY_EXISTS (or /already exists/i), flip mode to sign-in, clear password, show new key signin.existsSignIn.
- sign-in.tsx: forgot-password link gate now (mode === "sign-in" || Boolean(invitedEmail)).
- New i18n key signin.existsSignIn in all 11 locales, copied to mobile. PARITY_OK x10.

Verification: lint 0/244, web tsc 0, mobile tsc 0, build 2/2.
Runtime: /join and /sign-in?mode=sign-up at 390px => scrollWidth 390 == clientWidth 390, no element right edge > 391 => NO horizontal overflow (point 3 unsubstantiated).
"Forgot your password?" now present in sign-up mode with invited email (confirmed in DOM).
The already-exists flip could NOT be exercised at runtime: Cloudflare Turnstile cannot reach Cloudflare from the sandbox ("Unable to connect to website"), so submit is blocked. Code-verified only.

Seats: We Deliver = business plan, seats limit 5, 2 members -> room for a third. Re-invite is safe.

## Invite sign-up form cleanup (2026-09-06)

Problem: someone joining an existing workspace from an invite was shown a BUSINESS NAME field
and a "CREATE WORKSPACE" button — wrong on both counts, they are joining, not creating.

Change (packages/web/src/web/pages/sign-in.tsx), all gated on
`joining = mode === "sign-up" && Boolean(invitedEmail)`:
- BUSINESS NAME field hidden on a join (NAME stays — still required).
- Eyebrow  "Create your workspace" -> signin.joinEyebrow ("You've been invited")
- Heading  "Start documenting"     -> signin.joinTitle   ("Join the team")
- Submit   "Create workspace"      -> signin.submitJoin  ("Join the team")
- orgs.update rename call now also guarded on !joining, so a join can never rename an org.

3 new i18n keys (signin.joinEyebrow / joinTitle / submitJoin) x 11 locales, copied to mobile.
PARITY_OK x10. locales.ts untouched (53 lines).

Verified: lint 0 errors / 244 files, web tsc 0, mobile tsc 0, build 2 successful / 2 total.
Runtime at 390px, invited URL: eyebrow "YOU'VE BEEN INVITED", h1 "Join the team",
inputs [Name, Work email, Password], businessNameField false, submit "JOIN THE TEAM",
forgot-password link present, scrollW 390 == clientW 390, 0 overflowing elements.
Regression check, plain /sign-in?mode=sign-up: eyebrow "CREATE YOUR WORKSPACE",
h1 "Start documenting", BUSINESS NAME present, submit "CREATE WORKSPACE" — unchanged.
Still not runtime-exercisable in sandbox: actual submit, because Turnstile cannot reach
Cloudflare from here ("Unable to connect to website").

## Auth page split — /sign-in and /sign-up (2026-09-06)

His request: one tabbed page for both login and sign-up was confusing, and the invite
link landed on it with the sign-up tab pre-selected. He asked for two separate pages.

His three answers:
1. Old links (/sign-in?mode=sign-up) must auto-forward to /sign-up, keeping email + invite.
2. Smart invite routing — he said NO (his reason rests on a factual error; correction owed).
3. Cross-navigation — a quiet text link at the bottom, not tabs.

Implementation — two URLs, one shared component, so auth handling / 2FA hand-off /
bearer-token dance cannot drift between the two pages:

NEW  packages/web/src/web/components/auth-form.tsx  (~365 lines)
     The whole former sign-in body, now AuthForm({ mode }: { mode: AuthMode }).
     - mode is a prop, no longer useState. No setMode. Tab buttons deleted.
     - initial error reads ?notice=exists -> t("signin.existsSignIn")
     - the already-exists branch now navigates to
       /sign-in?email=..&next=..&notice=exists instead of flipping local state
     - new siblingHref(to) carries email + next (omits next when it is the default /app)
     - cross-link paragraph before the privacy line
     - <form> className mt-4 space-y-3 -> space-y-3 (tabs above it are gone)

REWRITTEN packages/web/src/web/pages/sign-in.tsx  (18 lines)
     ?mode=sign-up -> <Redirect to="/sign-up?..." replace /> with mode stripped and every
     other param preserved. This is the legacy forward (his answer 1).
     Otherwise <AuthForm mode="sign-in" />.

NEW  packages/web/src/web/pages/sign-up.tsx  (5 lines) -> <AuthForm mode="sign-up" />
     packages/web/src/web/app.tsx  -> /sign-up route inside <PublicOnlyRoute>
     packages/web/src/web/pages/join.tsx -> signUpHref now /sign-up?email=..&next=..
     packages/mobile/app/sign-in.tsx -> browser hand-off URL ${base}/sign-up

NOT changed on purpose: packages/mobile/app/join.tsx and landing.tsx still
router.push("/sign-in?mode=..") — those are expo-router NATIVE screens, not web URLs.
The native app has no /sign-up screen and keeps its own tabbed form.

i18n: 4 new keys x 11 locales via /tmp/patch_i18n_cross.py —
signin.noAccount, signin.goCreate, signin.haveAccount, signin.goSignIn.
(signin.goSignIn is a NEW key, separate from the pre-existing join.goSignIn.)
signin.tabSignIn / signin.tabSignUp are now orphaned — left in place, harmless.

VERIFIED
  bun run lint            0 errors, 246 files
  web bunx tsc --noEmit   exit 0
  mobile bunx tsc --noEmit exit 0
  bun run build           2 successful, 2 total
  i18n parity             PARITY_OK x10, all 11 copied to packages/mobile/i18n/

RUNTIME, signed out, 390px wide, all four with scrollW 390 == clientW 390 and 0 overflow:
  1 /sign-up?email=gcormier27%40gmail.com&next=%2Fjoin%2F644nwva1dt
      YOU'VE BEEN INVITED / "Join the team" / [Name, Work email, Password] /
      businessNameField false / JOIN THE TEAM / forgot link present /
      "Already have an account? Sign in" -> /sign-in?email=..&next=..
  2 /sign-in
      WELCOME BACK / "Sign in to GeoCliks" / [Work email, Password] / SIGN IN /
      forgot link present / "New to GeoCliks? Create an account" -> /sign-up / no tabs
  3 /sign-up (plain)
      CREATE YOUR WORKSPACE / "Start documenting" / BUSINESS NAME present /
      CREATE WORKSPACE / "Sign in" -> /sign-in
  4 /sign-in?mode=sign-up&email=..&next=%2Fjoin%2F644nwva1dt   THE LEGACY FORWARD
      lands on path /sign-up with search ?email=..&next=%2Fjoin%2F644nwva1dt
      (mode stripped, email + invite intact) and renders the join wording.

Screenshots: /tmp/split_1_invited.png /tmp/split_2_signin.png /tmp/split_3_signup.png
             /tmp/split_4_legacy.png

STILL NOT TESTABLE HERE: an actual submit on either page. Turnstile cannot reach
Cloudflare from the sandbox, so every submit is blocked ("Unable to connect to website").
Code-verified only.

## Landing page auth links (2026-09-06)

He reported: "Start Free" on the landing page goes to /sign-in, should go to /sign-up.
Second half of his message said the header "Sign Up" should go to /sign-in — that is
backwards (see NOTE below); shipped the label-correct behaviour and flagged it to him.

packages/web/src/web/pages/index.tsx had FIVE auth links, all pointing at /sign-in.
Fixed via /tmp/patch_landing_links.py (asserting, 3 edits + 3 post-assertions):

  line ~247  header amber pill   label home.nav.signUp   "Sign up"    -> /sign-up   FIXED
  line ~391  hero CTA            label home.nav.startFree "Start free" -> /sign-up   FIXED
  line ~725  pricing card CTA    label home.pricing.choose "Choose"    -> /sign-up   FIXED
                                 (renders 5x, one per non-enterprise plan)

  line ~241  desktop header      label home.nav.login    "Login"      -> /sign-in   LEFT
  line ~277  mobile menu         label home.nav.login    "Login"      -> /sign-in   LEFT
             both are to={session ? "/app" : "/sign-in"} — correct as-is.

Enterprise pricing CTA is a mailto: to support, untouched.

NOTE — his instruction #2 was backwards and I did NOT follow it literally.
He asked for the header "Sign Up" button to land on /sign-in. That recreates exactly the
confusion the page split removed: a button that says "Sign up" opening the login page.
The header already has a separate "Login" link that goes to /sign-in and was already
correct — almost certainly what he was picturing. Shipped Sign up -> /sign-up, told him
plainly, offered to flip it in a minute if he truly meant it. AWAITING HIS CONFIRMATION.

VERIFIED
  bun run lint   0 errors, 246 files
  web tsc        exit 0
  bun run build  2 successful, 2 total
  mobile tsc     NOT run and not implicated — change is src/web/pages only, no api/** touched.

RUNTIME, signed out, landing page, both 1280x900 and 390x844, identical result:
  Login     -> /sign-in
  Sign up   -> /sign-up
  START FREE-> /sign-up
  CHOOSE    -> /sign-up   (x5)
Header renders unchanged at 390 (only to= attributes were edited, no className touched).
Screenshots /tmp/landing_top.png /tmp/landing_hdr.png

## Mobile auth screen split (2026-09-06)

Why: Luc asked for it explicitly ("yes do it I like consistence and perfection"). I had
recommended leaving the app alone -- the app's labels and destinations already agreed with the
site, so this buys tidiness, not a bug fix. He overrode that, so the app now mirrors the website's
/sign-in + /sign-up split.

Files
  NEW packages/mobile/components/auth-form.tsx  (~410 lines)
      export function AuthForm({ mode }: { mode: AuthMode })
      The whole former sign-in body. Same decision as web: TWO screens, ONE shared component, so
      the auth handling / 2FA hand-off / bearer-token dance cannot drift between them.
      - `mode` is a prop; the useState mode + bottom toggle are gone
      - goSibling() -> router.replace() to the sibling route, carrying ?email= so invite context
        survives the hop
      - openWebSignUp() appends ?email= to the web URL when invited
      - join wording when mode === "sign-up" && invitedEmail:
        signin.joinEyebrow + signin.joinTitle, submit reads signin.submitJoin
      - bottom cross-link: signin.noAccount/goCreate (sign-in), signin.haveAccount/goSignIn (sign-up)
      - accessibilityLabel added to Google button, email, password, submit (lint requires it)
  REWRITTEN packages/mobile/app/sign-in.tsx  (431 -> 20 lines)
      <AuthForm mode="sign-in" />, plus a <Redirect> for the legacy ?mode=sign-up shape so stale
      deep links and older installs keep working.
  NEW packages/mobile/app/sign-up.tsx  (6 lines)  ->  <AuthForm mode="sign-up" />
  app/_layout.tsx  -- added <Stack.Screen name="sign-up" />
  app/landing.tsx  -- goAuth() now pushes "/sign-up" or "/sign-in" (call sites unchanged)
  app/join.tsx     -- signed-out push goes to /sign-up?email=...
                      switchAccount (line ~60) DELIBERATELY still points at /sign-in -- that path
                      is for someone swapping which existing account they are signed in as.

No new i18n. All six keys already shipped in all 11 locales with the web split.

### The bug the runtime check caught -- READ THIS ONE

After lint (0/248), mobile tsc (exit 0) and build (2/2) all passed, /sign-up still redirected
straight to /landing for any signed-out visitor. It would have shipped broken with a green board.

Cause: app/_layout.tsx Gate() has its own signed-out whitelist, separate from the Stack:

    const inPublicFlow =
      segments[0] === "sign-in" || segments[0] === "auth" || ...

"sign-up" was not in it, so the gate bounced everyone off the new screen.

Fix (/tmp/patch_mobile_gate.py):
  1. added `segments[0] === "sign-up" ||` to inPublicFlow
  2. added sign-up to the signed-in redirect too, so a signed-in user landing on /sign-up is sent
     into the app -- mirrors <PublicOnlyRoute> around /sign-up on the web

LESSON: adding a screen under packages/mobile/app/ needs THREE things, not one:
  the file, a <Stack.Screen> in _layout.tsx, AND an entry in the Gate whitelist.
Type-checking cannot see this. Only rendering the page can.

### Verified
  bun run lint                    0 errors, 248 files
  packages/mobile bunx tsc        exit 0
  bun run build                   2 successful, 2 total
  runtime, signed out, 390x844, one Chrome launch per URL:
    /sign-up                              -> stays on /sign-up, "Create account on the web"
                                             + "Already have an account? Sign in"   PASS
    /sign-up?email=gcormier27@gmail.com   -> "YOU'VE BEEN INVITED" / "Join the team"  PASS
    /sign-in                              -> "Sign in" + "New to GeoCliks? Create an account",
                                             no toggle, unchanged after the gate patch  PASS
    /sign-in?mode=sign-up&email=...       -> lands on /sign-up, mode stripped, email kept  PASS
    /landing                              -> "Register free" + "Login" render; goAuth() confirmed
                                             in code to push /sign-up and /sign-in       PASS
  Screenshots /tmp/mob_1_signin.png /tmp/mob_2_signup.png /tmp/mob_3_invited.png
              /tmp/mob_4_legacy.png

### NOT verifiable here
  Cannot press Sign in / Create account anywhere -- Turnstile cannot reach Cloudflare from the
  sandbox, so every submit is blocked. Cannot test native deep links or real Google OAuth.

### Orphaned keys (harmless)
  signin.switchNew / signin.switchHave are now unused too (mobile toggle deleted), joining
  signin.tabSignIn / signin.tabSignUp from the web split.

## Done (2026-09-06) — Luc's 3 asks

1. Assign a driver to an already-created unassigned route -- REAL BUG, FIXED (see below).
2. Remove "Projects (optional)" from the invite form -- DONE (see below).
3. Gisele lockout -- ALREADY RESOLVED IN PROD, not by me. Evidence in the section below.

### 1. Driver dropdown rendered BLANK names (app-route.tsx) -- the real bug
My first read was wrong. The assign control DOES exist and is NOT gated on route status, only on
`canManage`. But a runtime probe of a fresh DRAFT route returned:
    {"found":true,"value":"","options":["Unassigned","",""]}
Both crew members rendered as EMPTY option lines. Luc opened the dropdown, saw "Unassigned" plus
two blank rows, and correctly concluded he could not assign anybody. Not confusion -- a real bug.

ROOT CAUSE: team.list (api/routes/team.ts ~81) returns
    { ...row.member, user: row.user, photoCount }
The member row has NO `name` column -- the name lives at `member.user.name`. app-route.tsx ~174
read `{member.name}` -> undefined -> empty label. app-team.tsx ~155 already did it correctly
(`member.user?.name ?? member.user?.email ?? "?"`); app-route.tsx was the odd one out.

WARNING: `bunx tsc --noEmit` PASSED with the broken `member.name`. Types did not catch this; only
rendering the page did. Same lesson as the mobile auth-gate bug.

FIX (/tmp/patch_driver_names.py), one edit to app-route.tsx:
    <option key={member.userId} value={member.userId}>
      {member.user?.name ?? member.user?.email ?? t("queue.unassigned")}
    </option>

VERIFIED end to end on DRAFT route rte_MTPAPYVOR0XA61W4JP (ops test org):
    before -> options ["Unassigned","",""]
    after  -> options ["Unassigned","Dave Crew","Ops Admin"]
    picking Dave Crew -> status "ASSIGNED", select shows "Dave Crew", header subtitle
                          "2026-09-08 · Dave Crew"
    screenshots /tmp/assign_before.png /tmp/assign_after.png (looked at, correct)
lint 0 errors / 248 files, web tsc exit 0, `bun run build` 2 successful / 2 total.

WORTH KNOWING: routes.create (~226) takes NO driverId at all -- every route is ALWAYS created
unassigned and assigned afterwards on the route page. Luc's mental model was right; the feature
was simply invisible.

### Invite form: project picker removed (app-team.tsx)
/tmp/patch_invite_projects.py
  - deleted the `inviteProjects` state and the whole "Projects (optional)" checkbox list
  - invite.mutateAsync({ email, role }) -- API defaults projectIds to [], so no API change needed
  - success notice now reads "Assign their projects from Teamspace once they join."
  - `activeProjects` KEPT: still used by the existing-member project assignment UI (lines ~102/243)
  - pending-invite rows still render legacy projectIds if an old invite carried them -- harmless
  Verified: lint 0 errors / 248 files, web tsc exit 0.

### Gisele Cormier -- RESOLVED, confirmed by DB read
Her OLD account NESWfFlJPkcHEsEgAhIej9Ilvpjs71cA no longer exists in `user` (deleted).
A NEW account exists and IS a proper member:
  user  GyCHYWpiUA0uTDIyiovPiNWdC7jdTo2v  "Giselle"  gcormier27@gmail.com  created 1788666184014
  member mem_MTP9O6E23G6X5SSX8H  org_MTCE8SRQBM81BGT9XD ("We Deliver")  role=field
         active_at 1788666196761
A 5th invite inv_MTP9LZ3X8QQ0X0CPRZ (code s1sx0dyvca) was issued 1788666094077 and accepted ~100s
later -- this time the membership row WAS created. So the clean path worked exactly as designed.
We Deliver now has 3 members (Luc owner, the_installers field, Giselle field) against 5 seats.

LEFTOVER, harmless, NOT touched: the orphan row mem_NESWfFlJ... still points at deleted user
NESWfFlJ... inside orphan org org_NESWfFlJ... ("Gisele Cormier's Team"). Nobody can sign into it.
Cleaning it is a production DELETE -- do not do it without Luc asking.

ROOT CAUSE still unproven. admin_events has no member.remove/invite rows for her, so hypothesis (b)
"Luc removed her via the UI" is NOT supported by the audit log -- but the audit log only records
ADMIN-console actions, not Teamspace actions, so its silence proves nothing either way.

### Invite form -- visually verified (2026-09-06)
/app/team rendered at 1280x900 as ops admin: the "Invite a crew member" card is now exactly
Work email + Role (Admin/Manager/Field) + Send invite. Probe reported
    {"hasProjectsOptional":false,"hasProjectsWord":false,"checkboxes":0}
Screenshot /tmp/invite_form.png. The existing-member project picker in MEMBERS rows is untouched
(Dave Crew still shows his "1 project" chip).

CONSEQUENCE to keep in mind: a new FIELD member now joins with NO projects, so their capture
screen shows only "Unassigned" until someone assigns them in Teamspace. That is exactly what Luc
asked for, and he has been told.


## Done (2026-09-06) — stamp default, header decision, smart invite routing

### 1. "Show stamp on preview" now OFF by default (mobile capture screen)
packages/mobile/app/(tabs)/index.tsx
  - `useState(true)` -> `useState(false)` for `showLocation`
  - NEW `STAMP_KEY = "geocliks.capture.stamp.v1"`; the choice is now PERSISTED to AsyncStorage
    and restored on mount, same pattern as TAG_KEY / PROJECT_KEY
  - new `rememberStamp(next)` writes "1"/"0"; ProfileMenu is wired to it instead of the raw setter
  SAFETY: this is the live viewfinder overlay ONLY. The in-file comment at the overlay confirms
  "the saved file is stamped either way" -- the burned-in evidence stamp on the saved photo is
  untouched. No evidence is lost by defaulting this off.
  WHY PERSIST: with the default flipped to OFF, a crew member who turns it ON would have had it
  silently snap back OFF on every remount. Persisting makes the toggle mean what it says.

### 2. Header "Sign Up" destination — NO CHANGE, confirmed by Luc
Luc confirmed "Login going to sign-in please", which is what already ships:
  Sign up -> /sign-up   |   Login -> /sign-in
index.tsx line ~247 left exactly as is. This question is CLOSED, do not re-raise.

### 3. Smart invite routing — BUILT (he reversed his earlier "no")
An invite link now detects whether the invited email already has a GeoCliks account and sends the
person to sign-in instead of sign-up. Previously an existing user was always pushed to sign-up and
dead-ended on "You already have an account" -- this is the exact trap Gisele fell into.

  a) packages/web/src/api/routes/team.ts -- `inviteInfo` now returns `hasAccount: boolean`.
     Lookup is CASE-INSENSITIVE: eq(sql`lower(user.email)`, invite.email.trim().toLowerCase()).
     Added `sql` to the drizzle-orm import.
     PRIVACY: inviteInfo is public/unauthenticated, but it already returns the invited email and
     needs a live invite code, so hasAccount reveals nothing the caller does not already hold.
  b) packages/web/src/web/pages/join.tsx -- new `signInHref`, `hasAccount`, `authHref`.
     authHref is used in BOTH the CTA link and the mismatch "sign out and use X" button.
     Button label: hasAccount ? t("join.signInToAccept") : t("signin.submitSignUp").
     The "Create your account with {email}..." hint is HIDDEN when hasAccount (it was wrong copy
     for an existing user).
  c) packages/mobile/app/join.tsx -- the signed-out push picks /sign-in vs /sign-up the same way.
     `switchAccount` (~line 60) still goes to /sign-in deliberately -- unchanged.

  NO NEW i18n KEYS. `signin.submitSignUp` ("Create account") already exists in all 11 locales.

  VERIFIED AT RUNTIME. Two invites inserted straight into the DB for the OPS TEST ORG
  (org_sgCFWGKy...) so that no real invite email was sent, then deleted again afterwards:
    zzsmarttest1  email "MatrixIcutoo1@Gmail.com" (mixed case, account EXISTS)
      API  -> hasAccount:true
      page -> href "/sign-in?email=MatrixIcutoo1%40Gmail.com&next=%2Fjoin%2Fzzsmarttest1"
              label "Sign in to accept", create-hint correctly suppressed
    zzsmarttest2  email "nobody.smarttest@example.com" (no account)
      API  -> hasAccount:false
      page -> href "/sign-up?email=...&next=%2Fjoin%2Fzzsmarttest2"
              label "Create account", create-hint shown
  The mixed-case case passing is the proof the lower() comparison works.
  Cleanup confirmed: both rows deleted, Luc's org_MTCE8SRQBM81BGT9XD invite list untouched.

### Checks
lint 0 errors / 248 files; web tsc exit 0; MOBILE tsc exit 0 (required -- the web API changed);
`bun run build` 2 successful / 2 total.

### NOT verifiable here
The stamp default is a native camera viewfinder overlay -- it cannot be rendered headless in this
sandbox. It is a one-line default plus a persisted read/write, green on lint+tsc+build, but it has
NOT been seen on a real phone. Luc must confirm after publishing + reinstalling.

## Done (2026-09-06) — item 1: driver run screen (skip / retry / require-signature)

First of the four items Luc ticked. All three gaps in the M2 run screen closed.

### (a) SKIP a stop
- `routes.ts`: new **`skipStop`** procedure — `{ stopId, note? }`, `orgProc`, `assertRouteAccess`,
  refuses a cancelled route, no-ops when the stop is already closed, sets `status:"skipped"` +
  `completedAt` + `failedNote`, flips draft/assigned -> active, logs a `skipped` route event,
  calls `notifyUpcoming` (NOT `notifyStopDelivered` — nothing was delivered).
  Deliberately NOT routed through `completeStop`: decision #6 requires a real photo there, and a
  skip has no photo by definition. This is the documented exception.
- `runState` now returns a **`skipped`** count alongside delivered/failed.
- Schema needed no change — `routeStops.status` already allowed `skipped` and `routes.list`
  already counted it as done. No `db:push`.
- Mobile: `useSkipStop()` hook; "Skip this stop" outline button on the current card, opening a
  confirm sheet with an optional note. Skipped stops render in the closed list with
  `play-skip-forward-circle-outline` in muted grey.
- Office pages render only route-level status, so no web UI change was needed.

### (b) RETRY a stop stuck after a dead zone
The old `uploadOne` swallowed a `completeStop` failure in a bare `catch {}` and dequeued anyway.
The photo was sealed, the stop stayed `pending` forever, and the comment promised a
"re-close from the route screen" that never existed.
- `queue.ts`: `QueuedPhoto` gains **`photoId`** and **`stopOnly`**. On a `completeStop` failure the
  item is now rewritten as `{ photoId, stopOnly: true, error }` and **kept queued**, then rethrown
  so `drainQueue` counts it as failed. At the top of `uploadOne`, a `stopOnly` item skips
  presign/PUT/`photos.create` entirely and re-sends only the close — so the photo is never
  uploaded twice. `completeStop` is idempotent on the same photoId, so a duplicate retry is safe.
- Extracted the close into a `closeStop(item, photoId)` helper used by both paths.
- Run screen: closed-list rows that are still `pending` get a **Retry** chip that drains the queue
  and refetches. The label is honest per case — a normal queued item still reads
  "Waiting to sync" (`run.pendingSync`), a stuck stop-only item reads `run.retryHint`.

### (c) REQUIRE SIGNATURE finally reaches the driver
The office flag was stored on the route and read by nobody.
- Run screen `goShoot()` now passes `requireSignature: route.requireSignature ? "1" : ""`.
- Capture screen accepts the param and seeds its `requireSignature` state in the existing
  `useEffect` keyed on `stopId`.

### i18n
7 new keys — `run.skip`, `run.skipTitle`, `run.skipHint`, `run.skipConfirm`, `run.skipped`,
`run.retry`, `run.retryHint` — added to `en.ts` first, then all 10 locales, parity checked,
copied verbatim to mobile. PARITY_OK on all 10.

### Verification
lint 0 errors / 248 files · web tsc 0 · mobile tsc 0 · build 2 successful / 2 total.

Runtime proof of `skipStop` against `rte_MTOXMYAT145ZPK6YHW` (ops test org, seq 5):
- returned `{total:6, done:3, delivered:2, failed:0, skipped:1, nextStopId:<seq 2>, routeCompleted:false}`
- DB row: `status=skipped`, note stored, `completed_at` set, `photo_id` null
- exactly ONE `skipped` route event, with `actor_id` — the second identical call was a no-op
- **test data restored**: stop back to `pending`, the skip event deleted, route still `active`

NOT verified — the retry path lives entirely in the mobile queue and needs a real phone losing
signal mid-upload. Cannot be exercised headless. Disclosed to Luc.

Next, in the order Luc ticked: (2) route builder — drag to reorder, map preview, smarter CSV;
(3) dispatch mode / Mode B; (4) customer tracking page with a live map.


## Fixed — mobile login regression (2026-09-06)

Luc: "it log you in on the web not in the app". My bug, from the mobile auth split.

Cause: `landing.tsx` sent the big amber primary button (`home.nav.registerFree`) to `/sign-up`,
and `auth-form.tsx` in `mode="sign-up"` renders ONLY the "create your account on the website"
button — no email, no password. Tap the obvious button -> phone browser -> signed in on the web,
app still signed out.

Fix (mobile only; web keeps its two-page split, decision #12 amended for mobile):
1. `app/landing.tsx` — `goAuth` ignores the mode and always pushes `/sign-in`. Both landing
   buttons now reach the in-app form. A first tap must never open a browser.
2. `app/sign-up.tsx` — rewritten to `<Redirect href="/sign-in">`, `?email=` preserved, so old
   deep links / invite links keep working. Chain terminates:
   `/sign-in?mode=sign-up` -> `/sign-up?email=` -> `/sign-in?email=` (mode dropped, no loop).
3. `components/auth-form.tsx` — bottom cross-link is now
   `onPress={mode === "sign-in" ? openWebSignUp : goSibling}` ("New to GeoCliks? Create an
   account" opens the website directly). `goSibling` still referenced by sign-up mode, so the
   unused-var lint rule stays happy.
4. `app/join.tsx` — smart-invite branch always targets `/sign-in` (was `/sign-up` when
   `!hasAccount`).

Decision #13 unchanged and disclosed to him: account CREATION still opens the website. Turnstile
has no RN widget. That predates the split; a literal revert would not have restored in-app
sign-up. What he asked for — open app, email + password, camera — is delivered by collapsing
mobile to one visible auth screen.

Also fixed while in there (pre-existing, same screen): `auth-form.tsx` wordmark was hardcoded
`color: "#ffffff"`, so "GEO" was white-on-white and the login screen read " CLIKS" in the light
theme (the product default). Now `colors.foreground`.

No new i18n keys — all labels already existed in all 11 locales.

Checks: lint 0 errors / 248 files - web tsc 0 - mobile tsc 0 - build 2 successful / 2 total.

Verified in the headless sandbox browser (signed out, 390x844, cdp9):
- `/landing` renders; tapping "Register free" now lands on `/sign-in` with real
  `input[type=email]` + `input[type=password]` (was: browser hop).
- Wordmark renders "GEOCLIKS" again (zoomed and read the PNG).
- End-to-end: filled ops.admin1788258771@timemark.dev / FieldProof!42, submitted, landed on `/`
  — the Capture tab with the "Today's route — Friday drops — Moncton 2 OF 6 DONE" banner.
  Sign-in is not captcha-protected, so this IS genuinely testable; sign-up still is not.

Note: `/tmp/cdpprof9` is now a SIGNED-IN profile. Delete it to restore a signed-out one
(never delete `/tmp/cdpprof7`).

He must Publish + reinstall the phone app to get this.

## Follow-up — Register free destination + dead "Create an account" link (2026-09-06)

Luc, testing in the Runable PREVIEW (not on a phone): "the register for free bring you to
sign in page?" and "the link Create an Account is not working". Login itself fine.

He chose: "Register free" should open the website sign-up in the browser. Reverses part of
yesterday's fix by his explicit call — noted that it conflicts with the original complaint,
he decided anyway.

Cause of the dead link: `openWebSignUp` called `WebBrowser.openBrowserAsync`, which on the web
build wraps `window.open`. Inside the preview's iframe the popup blocker returns null WITHOUT
throwing, so the `try/catch` caught nothing and the tap looked dead. Checking the RETURN VALUE
is the fix, not catching an exception that never fires.

Changes:
1. NEW `lib/web-signup.ts` — single place that knows how to reach the website sign-up.
   `webSignUpUrl(email?)` + `openWebSignUp(email?)`. Returns `null` on success or the URL when
   every route out was blocked. Web: `window.open`, checked for null. Native: `WebBrowser`,
   falling back to `Linking.openURL`.
2. `app/landing.tsx` — "Register free" now calls `openWebSignUp()`; "Login" pushes `/sign-in`.
   New `blockedUrl` state renders the address when the browser is blocked, so the button is
   never silently dead. New `blocked` style.
3. `components/auth-form.tsx` — `openWebSignUp` delegates to the lib and shows the same message
   via `setError`. Dropped the now-unused `expo-constants` / `expo-web-browser` imports
   (unused imports are a hard lint error).
4. One new i18n key `signin.openInBrowser`, all 11 locales, PARITY_OK, copied to mobile.

Bug caught BY the verification, would otherwise have shipped: `extra.apiUrl` in
`packages/mobile/app.json` ends with a trailing slash, so the URL came out `...site//sign-up`.
`webSignUpUrl` now strips trailing slashes.

Deliberately NOT hardcoded to geocliks.com: the URL derives from `extra.apiUrl`, the same base
`lib/auth.ts` and `lib/api.ts` use. In the preview that means the register link goes to the
preview host — correct there, since that is where the app's accounts actually live. Sending
someone to register on a different backend than the app talks to would be the real bug.

Checks: lint 0 errors / 249 files - web tsc 0 - mobile tsc 0 - build 2 successful / 2 total.

Verified in the headless sandbox browser (signed out, 390x844, cdp9), window.open instrumented:
- popup BLOCKED (stub returns null): message "Go to this address..." renders with the URL.
- popup ALLOWED (stub returns a window): opens, and the message clears.
- final run: "Register free" -> https://<base>/sign-up (single slash);
  "Login" -> /sign-in with email + password present; "Create an account" -> same URL.

NOT verified: the real native path (`WebBrowser` / `Linking`) needs a device. On a phone the
in-app browser has no popup blocker, so the link may well have worked there all along — the
break I reproduced is preview-specific.

---

## Item 2, part 1 of 3 — smarter CSV / paste column handling (SHIPPED)

New file `packages/web/src/web/lib/parse-stops.ts` replaces `parseLine()` (the old 13-line
comma-splitter that lived in `app-route.tsx`). Pure logic, zero imports, so it is unit-testable.

Six defects the old parser had, all now fixed and covered by `/tmp/test_parse.ts` (11 groups, ALL PASS):
1. Tab-separated spreadsheet pastes were not handled — a whole row became one address.
2. Quoted fields split at the comma inside the quotes.
3. A header row became a bogus stop literally named "Address".
4. `12 Main St, Moncton NB, E1A 4H2` imported `E1A 4H2` as the recipient name.
5. An email in the FIRST column was never extracted (`emailIndex > 0`).
6. Phone / reference / notes were never captured even though `addStops` accepts them.

Two more defects the tests caught during the rewrite:
- A city+province tail ("Moncton NB") was still being popped as a recipient name.
  `looksLikeName` now rejects a field if ANY word is a region token, not only all of them.
- In header mode, City / Postal / Province columns matched nothing and were silently DROPPED.
  Those aliases now map to `addressRaw` and join in column order with ", ".
  Genuinely unmapped columns are reported via the new `ParseResult.ignoredColumns`.

API/schema: NO change. `addStops` already accepted every field. Client-side only.

UI: `app-route.tsx` now parses as you type (`useMemo`) and renders a preview table
(address / name / email / phone, first 6 rows + "+n more") before anything is created, plus
the detected delimiter, the skipped header row, ignored columns, and the skipped-line count.
Submit sends `parsed.stops`.

i18n: 13 new keys + `routes.addHint` reworded, all 11 locales, PARITY_OK, copied to mobile.

Checks: lint 0 errors / 250 files · web tsc 0 · mobile tsc 0 · build 2 successful.
Verified visually on `/app/routes/rte_MTPAPYVOR0XA61W4JP` — /tmp/paste_header_zoom.png and
/tmp/paste_nohdr_zoom.png. Postal code stays in the address, name shows "-". Cache-buster used: r=1161.

STILL TO DO in item 2: drag-to-reorder (up/down arrows work meanwhile) and the map preview
(see `api/lib/static-map.ts` + `share-map.ts` before building it).

## Register-return to app — stage 1 (shipped)

**Bug he reported:** registering from the phone app left him signed in on the *website*, in the
browser, with the app still signed out. He had to come back and log in by hand.

**Why registration itself stays on the website:** sign-up is gated by Cloudflare Turnstile, which
has no React Native widget and is broken in iOS WKWebView (decision 13). Only the return trip is
fixable. No in-app WebView bridge.

**Stage 1 (this change):** after the account is created the browser closes itself and drops him back
in the app on the sign-in screen with his email prefilled and a green "Account created. Enter your
password to sign in." notice. One password entry, then Capture. No credential crosses the deep link.

**Stage 2 (not built):** a short-lived, single-use, server-stored code minted by the website and
exchanged by the app over HTTPS for a real session, so there is no password step at all. Do NOT put
a session token in the deep link — it lands in browser history and on Android any app can claim the
scheme. `better-auth` is 1.6.19 with only `captcha` + `twoFactor` plugins; a `oneTimeToken` plugin
was NOT confirmed to exist — re-check before designing it.

### Files
- `packages/web/src/web/components/auth-form.tsx` — `APP_SCHEME` + `appCallbackUrl()` module
  constants; `appReturn = searchParams.get("app") === "1"`; inside the shared `finish(token)` choke
  point a `window.location.href = appCallbackUrl(email)` hop (a router navigation would keep him on
  the website). `finish()` is the shared tail of every success path, so 2FA accounts and the
  "USER_ALREADY_EXISTS → sign in instead" bounce return to the app too. `siblingHref()` and the
  already-exists redirect both preserve `app=1`.
  ⚠️ The scheme is HARDCODED on the web side, never read from a query param. Taking the return
  target from the URL would make `/sign-up` an open redirect.
- `packages/mobile/lib/web-signup.ts` — `webSignUpUrl()` now always appends `app=1`; native branch
  uses `WebBrowser.openAuthSessionAsync(url, appReturnUrl())` (plain `openBrowserAsync` had no
  return path at all) and calls the new exported `routeFromCallback(url)` on success. Private
  `appReturnUrl()` reads `expoConfig.scheme` (array form handled) and `param()` is a hand-rolled
  regex query parser because RN's `URLSearchParams` polyfill is partial and varies by platform.
- `packages/mobile/app/auth/callback.tsx` — was a 4-line `<Redirect href="/" />` stub; now reads
  `email` / `created` and redirects to `/sign-in?email=…&created=1`. This is the system-browser and
  cold-start path, where the OS delivers the deep link instead of `openAuthSessionAsync` returning
  it. `auth` is already in the `Gate()` `inPublicFlow` whitelist, so it is reachable signed out.
- `packages/mobile/components/auth-form.tsx` — `created?: string` param, `justCreated`, and a new
  `locked = !!invitedEmail && !justCreated`. ⚠️ The first pass wrongly showed "This address comes
  from your invite and cannot be changed" to a fresh registrant and locked the field — caught by
  screenshot. Only an INVITED address locks now; a returning registrant can fix a typo. New `notice`
  / `noticeText` styles, `colors.success` border, `checkmark-circle` icon.
- i18n `signin.accountCreated` in all 11 locales, PARITY_OK, copied to mobile.

**No workspace/business-name confirmation on the returning sign-in screen** — my call, he had no
preference; fewer words on a login screen.

### Checks
lint 0 / 250 files · web tsc 0 · mobile tsc 0 · build 2/2.
Verified by screenshot on the mobile web build at 390×844: `/sign-in?email=…&created=1` shows the
green notice with the address in full-strength editable text (`/tmp/created_zoom.png`), and
`/sign-in?email=…` alone is unchanged — locked, invite note, "Join the team"
(`/tmp/invite_zoom.png`).

**Could NOT verify, told him plainly:** a real registration cannot complete here (Turnstile is
unusable anywhere in the sandbox; `POST /api/auth/sign-up/email` returns `MISSING_RESPONSE`), the
`runable-timemar-nt1ia4s://` deep link only resolves on a real phone, and the Runable preview cannot
show it because `openAuthSessionAsync` degrades to `window.open` on web and the iframe popup blocker
kills it. Phone only, after publish + reinstall.

---

## Item 2, part 2 — drag-to-reorder + map preview on the route builder (2026-09-06)

**Shipped, all checks green, web-only (no publish, no reinstall needed).**

Files:
- `packages/web/src/web/components/evidence-map.tsx` — exported `MAP_STYLES`, `Located`, `FitBounds`
  so the new route map reuses them. `FitBounds` carries the load-bearing ResizeObserver + 250 ms
  settle nudge (Maps JS paints nothing when initialised at zero size) — copying it would guarantee drift.
- `packages/web/src/web/components/route-map.tsx` — NEW (178 lines). Exports `RouteStopPin`, `RouteMap`.
  Numbered circle markers 1..n **in map order, not by db `seq`** (an unlocated stop mid-route would
  otherwise leave a gap in the numbers). Fill by status: pending amber `#FFB021` w/ dark digits,
  delivered `#0F9D58`, failed `#D93A28`, skipped `#4B5A6E`. One solid amber `#E08A00` polyline in stop
  order (deliberately NOT the evidence map's dotted per-photographer trail — this is an instruction,
  not a history). `gestureHandling="cooperative"` so a page scroll doesn't hijack the wheel.
  Placeholder copy is passed in as props, so the component stays free of `useT()`.
  No API/schema change was needed — the `routes.get` payload already satisfies `RouteStopPin`.
- `packages/web/src/web/pages/app-route.tsx` — map card above the Stops card; `dragId`/`overId` state;
  `dropOn(targetId)` mirroring `move()`; `<li draggable={canManage}>` with `onDragOver` calling
  `preventDefault()` (or the browser refuses the drop); `GripVertical` handle; `unlocated` count shown
  beside the map title. **The up/down arrows stay** — dragging is unusable on touch and invisible to a
  keyboard.
- i18n: 5 new keys (`routes.mapTitle`, `mapEmpty`, `mapNoKey`, `mapUnlocated`, `dragHint`) in all 11
  locales, PARITY_OK on all 10, copied verbatim to `packages/mobile/i18n/`.

Checks: `bun run lint` 0 errors / 251 files · web `tsc --noEmit` 0 · mobile `tsc --noEmit` 0 ·
`bun run build` 2 successful / 2 total.

Verified by screenshot at `/app/routes/rte_MTOXMYAT145ZPK6YHW` (ops org, 6 real Moncton stops):
real Google map renders, pins 1-6 in order, 1-2 green (delivered) / 3-6 amber (pending), single ordered
amber line, grips and the drag hint present.

**Could NOT verify:** a real HTML5 drag-and-drop cannot be genuinely simulated in headless CDP. Code,
grips, hint and layout checked visually; the drag itself is Luc's check in the preview.

Item 2 is now complete (smart paste/CSV · drag reorder · map preview). Next: item 3, dispatch mode.

---

## Delivery notifications moved to notify.geocliks.com (2026-09-06)

**Correction on the record:** the earlier note calling `notify.geocliks.com` "the M3 blocker" was
WRONG. The string appears nowhere in the code; `EMAIL_FROM="GeoCliks <invites@geocliks.com>"` on the
already-verified `geocliks.com` meant recipient notifications would have sent all along. The
subdomain is reputation isolation, not a blocker. Told Luc plainly.

Luc added the three GoDaddy records himself; his "record name conflicts" error was a duplicate-add,
not a failure. Confirmed live over DNS-over-HTTPS before he re-checked Resend:
- TXT `resend._domainkey.notify` → `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD69o2IvJ6uXtkI5TgOYd4o…`
- MX `send.notify` → `feedback-smtp.us-east-1.amazonses.com` pri 10
- TXT `send.notify` → `v=spf1 include:dc-fd741b8612._spfm.send.notify.geocliks.com ~all`
Resend now shows **Verified**, provider GoDaddy, region us-east-1.

Code:
- `services/email.ts` — new `notifyFrom()` reading `EMAIL_NOTIFY_FROM`, **falling back to
  `emailFrom()`** so a missing env var degrades instead of failing. `SendEmailOptions.from?` added;
  `send()` uses `options.from ?? emailFrom()`.
- `services/route-emails.ts` — all three recipient emails (started / you're next / delivered) now
  pass `from: notifyFrom()`. `replyTo` still `SUPPORT_EMAIL`, so replies reach the real mailbox.
- `.env` — `EMAIL_NOTIFY_FROM="GeoCliks <deliveries@notify.geocliks.com>"`.

⚠️ **Two senders by design:** mail the user asked for (invites, resets, receipts) stays on
`geocliks.com`; mail to delivery recipients — strangers — rides `notify.geocliks.com`, so their spam
complaints cannot poison deliverability of the account owner's own mail. Do not "simplify" to one.

Checks: lint 0 / 251 files · web `tsc --noEmit` 0 · `bun run build` 2/2.
**Live send proved end-to-end** through the app's own `sendEmail` path to Resend's `delivered@resend.dev`
sink: accepted, id `eef8b0c3-069b-4e23-9b8d-4f26cc07b3de`, from `deliveries@notify.geocliks.com`.

⚠️ `.env` is sandbox-side. The live site needs the same `EMAIL_NOTIFY_FROM` value at the next publish
or it silently falls back to `invites@geocliks.com` — harmless, but not the intended sender.

## Item 3 — Dispatch mode (2026-09-06) — DONE

**Server** `packages/web/src/api/routes/routes.ts` — new `addLiveStop` procedure (manager+).
Geocodes the single address immediately, inserts the row, then places it with
`insertionIndex()` from `api/lib/optimize.ts` (cheapest insertion, never a billed
re-optimize). Locked prefix = leading non-pending stops, **plus one more when the route is
`active`** — the stop the driver is currently driving to never moves. Seq renumbered densely.
Logs `stop_added_live`. Returns `{ stopId, position, total, located, geocodingAvailable }`.
Works on planned routes too, on purpose; the UI is what is gated.

**Client**
- `web/queries/routes.ts` — `useAddLiveStop()`.
- `web/pages/app-route-new.tsx` — Route type selector (Planned / Dispatch) + hint line;
  `create` already accepted `mode`, no schema change needed.
- `web/pages/app-route.tsx` — DISPATCH badge beside the status chip, and an "Add order now"
  card (address + recipient + amber button) gated on
  `canManage && route.mode === "dispatch" && status not completed/cancelled`.

**i18n** — 13 new `routes.*` keys in all 11 locales, PARITY_OK, copied to mobile.

**Verified** lint 0/251 · web tsc 0 · mobile tsc 0 · build 2/2 · screenshots of both pages.
Live proof on `rte_MTPSHMRYDBC1MY4Y61` (ops org, dispatch, 4 geocoded Moncton stops):
`addLiveStop("1000 Mountain Rd")` returned `position 3 of 5, located true`, and the DB shows
100 Main → 500 Mountain → **1000 Mountain** → 1380 Mountain → 477 Paul. Correct middle
insertion, dense seq. Server geocoding IS available in this sandbox (geocodeStops resolved 4/4).

**Not verified:** the driver's phone picking up a mid-shift insertion — `app/route/[id].tsx`
polls `runState`/`get` so it should appear, but it was not tested on a device and may want a
"new stop added" cue.

## Mobile tab bar — Routes replaces Settings (from Luc's screenshot, 2026-09-06)
- `(tabs)/index.tsx`: removed the amber "Today's route" banner (activeRoute useMemo, useRoutes import, useMemo import). The `stopId` "Delivering to:" handoff banner STAYS.
- `app/routes.tsx` -> `app/(tabs)/routes.tsx` (mv). URL `/routes` unchanged. Removed the back chevron (tab roots have no back button).
- `(tabs)/_layout.tsx`: new `routes` tab (navigate-circle icon) with `stopsLeft` amber badge — pending stops across the signed-in driver's `assigned` + `active` routes, styled identically to the Messages badge. Settings kept as `href: null` (reachable from the hamburger drawer, already in profile-menu TILES).
- i18n: `tabs.routes` added to all 11 locales, PARITY_OK, copied to mobile.
- Checks: lint 0/251, web tsc 0, mobile tsc 0, build 2/2. Screenshot verified (/tmp/bar.png): Capture · Messages · Teamspace · Map · Projects · Routes(4).
- Overrides old decision #7 ("no new mobile tab") at his request.

## Item 4 — customer tracking page live map (2026-09-06)
Extension of the existing `/t/:token` page, not a rebuild. Driver position deliberately NOT shown (his call, consistent with decision #1).
- `api/routes/track.ts`: added `lat`/`lng` (this stop's own coords) to the `byToken` response. Scope unchanged — only the recipient's own stop.
- NEW `web/components/track-map.tsx`: `TrackMap` + `TrackPin`. Single-purpose map, no numbered labels and no polyline (a line between address and capture point would imply a journey that never happened). Amber pin = delivery address, green pin = where the proof photo was captured. Reuses `MAP_STYLES` + `FitBounds` from evidence-map so the three maps never drift. `FitBounds` already handles the 1-pin case at zoom 17.
- `web/pages/track.tsx`: map section above the proof block. Title/note/legend swap once a proof pin exists.
- 8 new `track.map*` keys in 11 locales, PARITY_OK, copied to mobile.
- Checks: lint 0/252, web tsc 0, mobile tsc 0, build 2/2.
- Verified with real data on rte_MTOXMYAT145ZPK6YHW: pending stop `4pthk96g7d7wb21xrhpmdy` (one amber pin) and delivered stop `dgqw3p287qrhb7fn0heth8` (both pins). Screenshots /tmp/track_pending.png, /tmp/track_done.png.
- NOTE: in the delivered screenshot the two pins sit ~4 km apart because that test photo's coords are rounded placeholders (46.1/-64.76), not a real capture. Not a bug.
