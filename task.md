# Passwordless auth + frictionless invites

## Decisions (from user, 2026-09-13)
- **Fully passwordless.** Remove passwords entirely. Email + 6-digit code is the only email path.
- **Google / X need no code** — social logins mint a session directly (already true; keep as-is).
- **Invite link is proof.** `/join/CODE` signed-out: pick a name, you're in. No code on that path.
- **Onboarding after first verification:** name + company ("Set up your Teamspace"). Skipped for
  invited users (they already belong to an org).
- **Mobile login ordering** (from screenshots): social first — "Continue with Google", then
  "More" → Google / Microsoft / Email. "Continue with Email" opens email + code with a resend
  cooldown ("Didn't get a code? (50s)"). "Joining a Team?" link at the bottom.
- 7-day invite expiry + open (no-email) QR invites — already built, see below.
- **Mobile first run:** app opens straight on the camera, signed out (already the behaviour —
  `_layout.tsx` Gate keeps the capture tab public). A couple of seconds in, a sheet offers
  "create your Teamspace for free" — screenshot 1: value prop, "Continue with Google", "More"
  (→ Google / X / Email), "Joining a Team?". Dismissible, must not nag.

## Decisions — onboarding trial (user, 2026-09-13)
- Onboarding asks **name + Teamspace name + which system** (Field job photos / Delivery routes).
- That choice starts a **7-day trial, no card**: Field → Business, Delivery → Delivery Pro.
- After 7 days it **drops to that product's free tier**, data intact, locked features go quiet.
- **New `delivery-free` plan** (free forever): 40 stops/month, 1 driver, ordered routes from the
  local solver, locked photo proof, PDF export. No smart optimize, dispatch, tracking or signature.
- The Field/Delivery choice **tailors the app**: land on Routes vs Projects, hide the other nav.
- Answered: remove 2FA entirely · web copies the mobile "More" button layout · no Microsoft ·
  one `/sign-in` page, `/sign-up` redirects · delete the mobile browser-bounce for sign-up.

## Library facts (verified, better-auth 1.6.19)
- `emailOTP` server plugin + `emailOTPClient()`; endpoints `/email-otp/send-verification-otp`
  and `/sign-in/email-otp`. 6 digits, 5 min default, 3 attempts, rotate on resend.
- `signInEmailOTP` auto-creates the user with `emailVerified: true`, accepts `name`, returns
  `{ token, user }` → no separate sign-up endpoint needed.
- `createVerificationOTP` is **serverOnly** and returns the OTP string → the invite-claim endpoint
  can mint a real session server-side without mailing a code.
- `twoFactor` only hooks `/sign-in/email`, `/sign-in/username`, `/sign-in/phone-number`. With
  passwords gone it hooks nothing → **removed entirely** (user confirmed), plugin + UI deleted.
- The reactive session store (`useSession`) is only refreshed by better-auth's own `atomListeners`
  (`/sign-in/email-otp`, managed-auth's Google exchange, `/sign-out`, …) or by
  `authClient.$store.notify("$sessionSignal")`. A bare `authClient.getSession()` does **not** write
  to it — that was the join.tsx bounce-to-/sign-in bug. Any non-better-auth call that mints a
  session (i.e. the oRPC `team.claimInvite`) must notify the signal itself.
- `captcha` currently guards `/sign-up/email` + `/request-password-reset`; both endpoints
  disappear. Mobile has no Turnstile widget, so the send-code path can't be captcha-guarded
  (same reason sign-in never was) → rely on hard per-IP rate limits instead.

## Plan
1. [x] `api/services/email-templates.ts`: `loginCodeEmail({ to, otp, type })`
2. [x] `api/auth.ts`: add `emailOTP`, `emailAndPassword.enabled: false`, new rate-limit rules,
       retire captcha paths
3. [x] `api/routes/team.ts`: `claimInvite` (code + name [+ email for open invites]) → session
3b.[x] trial layer: `api/lib/trial.ts`, `organizations.product/trialPlan/trialEndsAt` (db:push
       applied), `delivery-free` plan seed, `orgProc` resolves the effective plan, billing reads
       `paidPlan`, `orgs.setup` + `orgs.setProduct`, trial info on `orgs.current`/`billing.overview`
4. [x] web `lib/auth.ts`: `emailOTPClient()`, drop captcha hook
5. [x] web `components/auth-form.tsx`: Google primary + "More" → X / Email, email → code screen,
       resend cooldown; verified in-browser end to end (code screen → Continue → /app)
6. [x] web onboarding: `components/setup-gate.tsx` wraps `ProtectedRoute`'s children — step 1
       asks your name (prefilled from `user.name`) + Teamspace name, step 2 picks Field job
       photos / Delivery routes and calls `orgs.setup`, which starts the trial. Gated on
       `org.needsSetup && canSetUpWorkspace(role)` (`lib/roles.ts`), so invited members never see
       it. `useSetupOrg` / `useSetProduct` added to `web/queries/orgs.ts`; the old inline
       "name your business" banner in `app-teamspace.tsx` is gone. Verified in-browser both ways
       (Field → BUSINESS, Delivery → DELIVERY PRO) plus an invited member bypassing it.
       19 `setup.*` i18n keys added to all 11 web catalogs (`scripts/add-setup-keys.py`).
7. [x] web `pages/join.tsx`: name-only claim. Fixed the claim→session handoff: after
       `setAuthToken(result.token)` it awaits `getSession()` **and** calls
       `authClient.$store.notify("$sessionSignal")` before `navigate("/app")`, otherwise
       ProtectedRoute read the stale signed-out store and bounced to /sign-in. Verified in-browser.
8. [x] remove password surfaces: reset-password page + route + SEO entry, profile password block,
       2FA components, privacy copy
9. [x] mobile passwordless (2026-09-14). `lib/auth.ts`: `twoFactorClient()` → `emailOTPClient()`,
       and the `onSuccess` hook lost its `twoFactorRedirect` special case — it now stores any
       `set-auth-token` and clears both stores on `/sign-out`. `components/auth-form.tsx` rewritten
       as ONE screen with no `mode` prop: Google, X, then `or email` → address → 6 digits, with a
       50s resend cooldown (same constant as web) and `changeEmail` back out. Password field, eye
       toggle, the 2FA second step and the "create your account on the web" card are gone.
       `app/sign-up.tsx` forwards to `/sign-in` (as does the legacy `?mode=sign-up`), and
       `lib/web-signup.ts` is **deleted** — landing's "Register free" now opens `/sign-in` in-app
       instead of the browser. `app/auth/callback.tsx` stays (the website still deep-links back)
       and `app/join.tsx` needed no logic change, only its stale "register on the web" comment.
       Verify errors deliberately use our localized `signin.codeError`, not better-auth's
       untranslated "Invalid OTP".
10.[x] i18n keys across the 11 web catalogs (22 new `signin.*` / `profile.*` / `join.*` keys,
       translated per locale via `scripts/add-auth-keys.py`). Mobile catalogs done with item 9:
       11 new `signin.*` code keys per catalog (copy lifted from the web catalogs so both surfaces
       read identically) and the 23 keys the rewrite orphaned removed — password/showPassword/
       hidePassword, the 8 `twoFactor*`, `signUpWebBody`/`Button`, `accountCreated`,
       `openInBrowser`, `authError`, `or`, `noAccount`/`goCreate`/`haveAccount`/`goSignIn`,
       `submitSignIn`/`submitJoin`. (The pre-existing dead `twofa.*` block in the mobile catalogs
       is left for the 276-key bulk delete noted under Deferred.)
11.[ ] mobile: delayed "create your Teamspace for free" sheet on the capture tab, signed out only,
        shown once per install (AsyncStorage flag) — reuses the AuthGate copy/buttons
12.[x] nav tailoring by `product` (web). New `web/lib/product.ts` holds the one rule:
       `showsProduct(orgProduct, role, product)` checks the role's own side first
       (`canUseField`/`canUseDelivery`) and only then narrows by the workspace's onboarding
       answer — and only when the role has both sides, so a driver in a job-photos workspace
       still gets routes instead of being locked out. `homeFor()` derives the landing page from
       the same rule, and `ProductRoute`'s bounce target + the sidebar's workspace-card link
       both read it, so they can no longer disagree. `dashboard-shell.tsx` filters nav through
       `showsProduct` instead of raw role checks. **Mobile tabs still pending (with item 9).**
13.[x] trial UI (web). `components/trial-banner.tsx` exports two pieces, both manager-gated
       (`canManageWorkspace`) since the plan page they point at is: `TrialBanner`, rendered once
       at the top of `DashboardShell`'s `<main>`, and `TrialChip`, a countdown on the sidebar's
       workspace card (own row — sharing the plan line's row truncated the plan name).
       The banner has two messages: running ("{plan} is free for {n} more days" + "Ends {date}"
       + See plans) and lapsed ("Your free week has ended" + the data-is-still-here
       reassurance). Dismissal is `localStorage` `geocliks.trial-note.v1`: per calendar day for
       the countdown (`active:YYYY-MM-DD`, back tomorrow one day shorter), permanent for the
       lapsed notice (`ended`). `app-billing.tsx`'s current-plan card now carries
       "Trial in progress / {plan} included until {date}" from `billing.overview.trial`, which
       closes the "billing says Free while the app hands you Business" gap noted below.
       13 `trial.*` keys added to all 11 web catalogs (`scripts/add-trial-keys.py`).
14.[ ] gates: web typecheck/lint/build **all green** (re-run after the nav + trial UI work);
       mobile `bun run typecheck` green after the auth rewrite (2026-09-14); db:push already
       applied
15.[ ] live verify, clean up dev test data, commit

## Deferred (deliberately)
- **276 unreferenced i18n keys** in `web/i18n/en.ts` (legacy `common.*`, `capture.*`, `run.*`,
  `reset.*`, `twofa.*`, old password/sign-up `signin.*`/`profile.*` strings). Found with
  `scripts/find-dead-keys.py` — note the saved copy still has a broken exclude glob, use
  `-g "!**/web/i18n/*"`. Left alone: a 276-key bulk delete across 11 catalogs is its own task.
- Dev DB test data: `otptest1@`, `rosacrew1@`, `marcofield1@`, `marcofield9@`, `otploop9@`
  `example.com`, org "Northwind Roofing" (now "Ortiz Roofing Co"), `freshowner7@`, `luiscrew3@`,
  `omardriver2@`, org "Shah Logistics" (its `product` is currently `field` from the item 12
  test, and its `trial_ends_at` was backdated and restored during the item 13 test), several
  consumed invite codes.

## Verified live (dev server, 2026-09-13)
- `send-verification-otp` → `sign-in/email-otp` mints a verified user + session (curl + browser).
- `orgs.setup` with `product: "field"` → org renamed, `trialPlan: "business"`, `trialEndsAt` +7d,
  `trial.daysLeft: 7`; `orgs.current` then reports `plan.id: "business"` (effective trial plan).
- `billing.plans` lists `delivery-free` in the running DB.
- `team.invite` works during the trial (teamspace unlocked by the effective plan).
- Signed-out `team.claimInvite` → session + membership; consumed code 404s on reuse; an address
  that already has an account is rejected with 409 and a "sign in with a code" message.
- Browser: `/sign-in` (Google primary → More → X/Email → code screen → Continue → `/app`) and
  `/join/CODE` (name + email → `/app`, signed in on the trial org).
- Browser, onboarding gate: a brand-new code sign-in (`freshowner7@`) is intercepted by
  `SetupGate` instead of landing on an auto-named free workspace. "Priya Shah" / "Shah Logistics"
  + Delivery routes → `/app` as **DELIVERY PRO · OWNER**; "Dana Ortiz" / "Ortiz Roofing Co"
  + Field job photos → **BUSINESS · OWNER**. An invited member claiming `/join/CODE` after that
  (`luiscrew3@`) still lands straight on `/app` as **BUSINESS · FIELD**, no gate.
- Browser, nav tailoring (item 12): the Delivery workspace ("Shah Logistics") lands `/app` →
  `/app/routes` with delivery-only nav; flipping its `product` to `field` via `orgs.setProduct`
  restores `/app` and the full field nav. A fresh `driver` invite on that same field-product
  workspace still lands on `/app/routes` with driver nav — the "only one side to give them"
  branch of `showsProduct`.
- Browser, trial UI (item 13): as DELIVERY PRO · OWNER the strip reads "Delivery Pro is free for
  7 more days / … Ends Sep 20" with the sidebar chip "7 DAYS LEFT", and `/app/billing` shows
  CURRENT PLAN Free alongside "TRIAL IN PROGRESS / Delivery Pro included until Sep 20". A driver
  on the same workspace sees neither strip nor chip. Dismissing writes
  `active:2026-09-13` and the strip stays gone across navigation. Backdating `trial_ends_at`
  two days into the past (then restoring it) flipped the sidebar to FREE · OWNER, dropped the
  chip, and showed the lapsed notice; dismissing it writes `ended` and it never returns.

## Verified live (mobile preview :4300, 2026-09-14)
- `/sign-in` renders Google · X · OR EMAIL · address + "Send me a code"; sending advances to
  "Check your email" with the address interpolated and the resend link counting down from 50.
- A wrong code shows "That code didn't work. Request a new one and try again." (our copy, not
  the server's English); "Use a different email" returns to the address step.
- Full success path with the real code (temporarily logged in the dev API, log reverted):
  `mobileotp3@example.com` → account created, app boots into Capture, and `/settings` shows
  "mobileotp3's Team · owner" on the free plan.
- Sign out from `/settings` empties `geocliks.auth.token` (the `/sign-out` branch of the new
  `onSuccess`) and drops back to the public capture tab, which is the designed signed-out home.
- Cleaned up: the two `dbg_%` debug sessions from the `/app/app` investigation are deleted from
  the session table, and the scratch scripts in /tmp are gone.

## Already done (uncommitted, gates green, db:push applied)
- Nullable `invites.email` (open QR invites) + `invites.expiresAt`, 7-day TTL, expiry filtering
  in `team.invites` / `inviteInfo` / `acceptInvite` / `seatUsage`
- `InviteQrPanel` shared component; invite form email/QR mode toggle; team page open-invite rows
  with expiry labels; web + mobile join screens tolerate a null email
- i18n: 13 `team.*` + 3 `join.*` keys (web), 2 `join.*` keys (mobile), all 22 catalogs
- Fixed `packages/mobile/app/team.tsx` null-email typecheck error

## Item 14 — SEO titles/descriptions audit (PDF #1) — DONE, verified 2026-09-14
- `src/web/lib/seo-routes.ts` is the single table of per-route `<title>` / `<meta description>`
  (~68 pages previously shipped the home page's copy). Read by three callers: page components
  via `useSeo`, `seo-html.ts` for the HTML response a JS-less crawler reads, and the dev-time
  integrity check in `help/resolve.ts`.
- Removed the duplicate source: deleted `src/web/lib/seo-copy.ts` and pointed `index.tsx`,
  `get-app.tsx`, `help.tsx`, `legal-page.tsx` (its `description` prop is gone — it resolves copy
  from `seoForPath(path)` itself), `terms.tsx`, `privacy.tsx` at `seo-routes`.
- `help-category.tsx` / `help-article.tsx` prefer `helpSeo(...)` and fall back to the content
  catalog's own title/summary, so a newly added article is never untitled.
- `route-seo.tsx` imports `isPrivatePath` instead of keeping its own copy of the noindex list.
- Fixed `seo-html.ts`: `String.prototype.replaceAll` is outside the configured `lib` target,
  rewritten as `.replace(/…/g, …)`.
- Extracted the marketing header into `components/site-nav.tsx` (`SiteNav`), so a landing page
  can have the site header without importing the home page bundle.

## Item 15 — two search landing pages (PDF #2, PDF #3) — DONE, verified 2026-09-14
- `components/landing-page.tsx`: `LandingPage` + `LandingSection` / `LandingSteps` /
  `LandingCards` / `LandingFaq` / `LandingCta`. `path` is typed `keyof typeof PAGE_SEO`, so a
  landing page cannot ship without head copy — the exact failure item 14 was about. FAQ entries
  are real `<details>`, so the answers are in the DOM without JS.
- `pages/construction-photo-documentation.tsx` → `/construction-photo-documentation`, and
  `pages/alternatives-companycam.tsx` → `/alternatives/companycam`. Both English-only by design
  (same reasoning as the legal pages: they answer English commercial queries).
- Comparison-table facts were read off companycam.com and their help centre on 2026-09-14:
  Core $63/mo (1 user, +$29/extra), Crew $119 (3), Scale $199 (3), Enterprise on request, all
  billed annually; their date/time + GPS stamp is an opt-in per-user toggle taken from the device
  clock. The page carries that date and asks to be told when a row goes stale. Our own column
  comes from `api/lib/plans.ts`. Answers that go against us are stated plainly (no photo-history
  import — verification happens at capture; CompanyCam's payments/marketing/e-sign/measurement
  have no GeoCliks equivalent).
- Wired: `PAGE_SEO` rows (titles 52/51 chars, descriptions 149/144 — inside the 60/160 rule),
  `app.tsx` lazy routes, `STATIC_PATHS` in `scripts/gen-sitemap.ts`, and both links in the
  header's Resources menu (`home.nav.constructionDocs` / `home.nav.vsCompanycam` added to all
  11 catalogs — the catalog type enforces key parity).
- Verified: `bun run typecheck` clean; `bun run build` clean and `dist/index.html` still carries
  the sitewide defaults; sitemap has 74 URLs including both new paths; `PORT=4555 bun src/__server.ts`
  serves a unique correct title/description/canonical in raw HTML for `/`, `/get-app`, `/help`,
  `/help/getting-started`, `/help/verify/how-sealing-works`, `/terms`, `/privacy` and both new
  pages, with `/app` returning `noindex, follow` and no canonical; browser-checked both pages
  render (nav, hero, steps, cards, table, FAQ, CTA, footer) with `FAQPage` + `BreadcrumbList`
  JSON-LD in the DOM.
- Not done, deliberately: no sample closeout-report asset (PDF #2 asks for a sanitized one, none
  supplied), and no field-service/delivery variants of the construction page.

## Item 16 — super-admin wrongly enrolled in a free trial — DONE, verified 2026-09-14
- Reported: the superadmin's own workspace ("Cat", `org_MTCE8SRQBM81BGT9XD`, owner
  `matrixicutoo@gmail.com`) was showing as a free trial. Cause: that org predates the `product`
  column, so `product === null` tripped `needsSetup` in `orgs.current` and pushed the owner
  through first-run onboarding — and `orgs.setup` started the free week on ANY org without
  `trialEndsAt`, so submitting the form wrote `trial_plan = "delivery-pro"` + a 7-day clock onto
  a workspace already on the `business` plan.
- `lib/trial.ts`: new exported `NO_TRIAL` constant, and `trialStatus()` returns it as soon as
  `isPaid(org.plan)` — a paying workspace has no trial to report, so no strip, chip or banner.
  New `canStartTrial({ plan, trialEndsAt, staffOwned, brandNew })` is now the single authority on
  who gets the free week: no second trial, never on a paid plan, never on a staff workspace, and
  only for an org still carrying its generated default name (i.e. genuinely first-run, not an
  existing workspace being asked for its `product` late).
- `lib/plans.ts`: `STAFF_PLAN_ID = "staff"` + a module-level `STAFF_PLAN` with `fieldEnabled` and
  every delivery allowance unlimited. Deliberately NOT in `DEFAULT_PLANS`, so it is never seeded
  into the `plans` table, never listed on /pricing and never offered in the admin plan switcher —
  `planOf()` special-cases the id instead.
- `middleware/auth.ts`: `resolveOrg()` is async and staff-aware. If `staffRoleOf(org.ownerId)`
  returns a role, the effective plan becomes `staff` and the trial becomes `NO_TRIAL` regardless
  of what the columns say, so a stale trial row cannot gate an operator. `paidPlan` still reports
  the raw column, so /app/billing keeps telling the truth about the subscription. New
  `context.staffOrg` on every `orgProc` request.
- `routes/orgs.ts`: `needsSetup` is now `!context.staffOrg && (...)` — staff never see the
  onboarding gate — and `setup` asks `canStartTrial(...)` instead of `!trialEndsAt`. Name and
  product are still saved on every path; only the clock is conditional.
- One-off data repair, outside git: `update organizations set trial_plan = null, trial_ends_at =
  null where owner_id in (select user_id from staff)` — cleared the stale `delivery-pro` / 7-day
  row. The code fix alone would have neutralised it, but the data is clean now too.
- Verified in the browser signed in as the superadmin: sidebar reads "PLATFORM STAFF · OWNER",
  `orgs.current` returns `plan.id = "staff"` with `fieldEnabled: true` and every delivery limit
  `-1`, `trial` all-false/null, `needsSetup: false`; no trial strip anywhere in the DOM; both
  `/app/captures` (field) and `/app/routes` (delivery) render real data. `/app/billing` still
  shows Business $25 as the billed subscription, which is correct — that page reports `paidPlan`.
- `bun run typecheck` clean.

## Item 17 — staff sidebar/tabs hid half the app + assistant plan gate removed — DONE, verified 2026-09-14
- Reported: signed in as the superadmin owner the website showed the delivery menu only, no
  field photos side, and the AI assistant was missing from the right side entirely. Ask: no
  restrictions at all for the superadmin on web AND app, and the assistant available to every
  signed-in user on every plan (only signed-out visitors go without).
- Cause (nav): Item 16 fixed the *plan* (feature limits) but the sidebar and mobile tabs do not
  branch on the plan — they branch on `orgs.current`'s `product`, which returned
  `context.org.product` verbatim. The superadmin's org answered "delivery" at onboarding, so
  `showsProduct()` in `web/lib/product.ts` took every field-only link off the sidebar.
- `routes/orgs.ts`: `product` is now `context.staffOrg ? null : context.org.product`. `null`
  already means "show both", so a staff workspace reports it whatever its column says — staff
  run both systems and the onboarding answer must not take half the app away from an operator.
  The stored column is left alone; nothing else reads it for staff.
- Mobile needed no equivalent fix: its drawer tiles (`components/profile-menu.tsx`) and the
  Routes tab gate on ROLE (`canUseField` / `canUseDelivery`), not on `product` — grep confirms
  the app never reads `org.product` at all. An `owner` passes both, so the phone always had both
  sides. Confirmed in the running preview, not just by reading.
- Cause (assistant): `web/lib/assistant.ts` and `mobile/lib/assistant.ts` each carried an
  `ASSISTANT_PLANS` allow-list, so Plus and Delivery Lite could never see it, and the web
  sidebar wrapped the menu item in `planHasAssistant(...)` on top of that.
- Both `assistant.ts` files: `ASSISTANT_PLANS` and `planHasAssistant()` deleted;
  `useAssistantAccess()` is now just "is there a session". The grant is deliberate, not lazy:
  everything the assistant can actually reach is gated on its own behind the API
  (`assertFieldEnabled`, export formats, the role checks in `agent/viewer.ts`), so a free plan
  gets the conversation without getting anything it has not paid for. `sidebar-body.tsx` renders
  the assistant item unconditionally; the stale "plan-gated" comments in `site-footer.tsx`,
  `profile-menu.tsx` and `(tabs)/_layout.tsx` were corrected to match.
- Verified live, signed in as the superadmin. Web (:4200) `/app`: sidebar lists Teamspace,
  Projects, My captures, Map, Before/After, Reports (field) alongside Routes (delivery), plus
  "GeoCliks AI Assistant" — opened it and got a real streamed answer. Mobile (:4300): tab bar is
  Capture / Messages / Routes / Assistant; the drawer lists Projects, Teamspace, My captures,
  Map, Reports AND Routes under "PLATFORM STAFF · OWNER", with the assistant link in its footer;
  sent "How many projects do I have?" on the Assistant tab and it answered with the workspace's
  real field data (3 projects, 8 captures, chart by project) — so the field tools are reachable
  for this account, not just the links.
- `bun run typecheck` clean in both `packages/web` and `packages/mobile`.

## Item 18 — 272 dead i18n keys removed from the web catalogs — DONE, verified 2026-09-14
- Was deferred as "276 unreferenced keys". Real count after re-running the sweep: 272 across all
  11 web catalogs (3,300 lines gone, deletions only). Mostly legacy mobile-screen strings that
  had been mirrored into the web catalogs and never rendered there — `capture.*` (52),
  `signin.*` (43, the old password/sign-up form), `run.*` (36), `plans.*` IAP strings (20),
  `reset.*` (16), `twofa.*` (14), `tabs.*`, `queue.*`.
- `scripts/find-dead-keys.py` fixed and hardened. Two bugs in the saved copy:
  - the exclude glob was `!web/i18n/*`, which rg matches against the whole path, so the
    catalogs were scanned as sources and every key looked used. Now `!**/web/i18n/*`.
  - no awareness of template-literal keys. `index.tsx` built `home.delivery.t${n}.name` and
    cast it to TKey, so neither the compiler nor the sweep could see t4..t7. The first pass
    deleted them and the landing page rendered the raw key "home.delivery.t4.name" — caught in
    the browser, not by typecheck. The script now collects static heads of interpolated keys
    and keeps everything under them, and prints the prefixes it is honouring.
  - that prefix scan is scoped to `src/web` (where `t()` is called). Scanning the API too
    dragged in ordinary string building like `${code}-evidence.${ext}` and protected five
    genuinely dead `evidence.*` keys.
- `pages/index.tsx`: the four "more delivery types" tiles are spelled out as literal keys
  instead of a `t${n}` loop, so the compiler checks them and the sweep can see them. This is the
  real fix for the class of bug above — a cast-to-TKey template is invisible to both.
- New `scripts/drop-dead-keys.py` does the removal across all 11 catalogs: handles one-line
  entries, wrapped entries whose value continues on indented lines, and drops a group comment
  only when every key under it goes (2 orphaned headings removed: "Mobile tabs", "Capture
  screen"). Preserves the trailing newline and the blank line before `export type Catalog`.
- Verified beyond typecheck, because `as TKey` casts mean typecheck is NOT sufficient here:
  swept every rendered page for anything shaped like a raw key. Public pages (`/`, `/#pricing`,
  `/sign-in`, `/get-app`, `/help`, both search landing pages) in 6 locales — en, fr-CA, es, zh,
  ar, pl — via a clean browser context so the marketing site was not redirected to /app; then
  signed in as the superadmin across all 15 `/app` routes plus a project detail page, a route
  detail page, `/app/routes/new` and a deliberately bad project id (the `project.fallbackTitle`
  / `project.deleted` path). Zero raw keys anywhere.
- `bun run typecheck` clean. en.ts: 1266 -> 994 keys, sweep now reports 0 unreferenced.
- NOT touched: `packages/mobile/i18n/*`. Those catalogs are consumed by the phone app and were
  never in scope; the web sweep says nothing about them. A separate pass if it is ever wanted.
