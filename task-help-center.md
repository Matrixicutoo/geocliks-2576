# Task — GeoCliks Help Center at /help

Reference: https://help.timemark.com/en/ (docs-style: category cards, sidebar, search, language
switcher, dark mode). Luc's answers: lives at geocliks.com/help in this codebase; full build with
every article written; all 8 categories; all 11 languages.

## Architecture

```
packages/web/src/web/help/
  types.ts              Block/Article/Category types
  registry.ts           Category order, icons, slugs, article order
  content/en/<cat>.ts   English bodies (one file per category)
  content/fr-CA/<cat>.ts French bodies
  content/labels/<loc>.ts  Category + article titles/summaries for the other 9 locales
  content/index.ts      Locale resolver, English fallback per article
```

Pages: `pages/help.tsx`, `pages/help-category.tsx`, `pages/help-article.tsx`
Component: `components/help-shell.tsx` (header + sidebar + search + footer)
Routes: `/help`, `/help/:category`, `/help/:category/:slug`

Blocks are structured data (`p`, `h`, `ul`, `steps`, `note`, `warn`, `table`) — never raw HTML.

## Categories (8) and article counts

1. getting-started (6)
2. mobile-app (10)
3. teamspace (11)
4. delivery-routes (10)
5. verify (4)
6. plans-billing (6)
7. troubleshoot (8)
8. legal (4)
Total 59.

## Translation reality (must flag to Luc)

Full bodies in 11 languages = ~80,000 words of machine translation. Not shippable quality.
What ships:
- UI chrome, category titles/descriptions, article titles/summaries: all 11 languages.
- Full article bodies: English + fr-CA (his market).
- Other 9 locales: English body with an honest "not translated yet" banner on the article.

## Luc's follow-up items (2026-09-07)

Decisions: translations shipped BY LANGUAGE (one complete language at a time), no
priority order given -> fr-CA first, then es, pt-BR, de, it, pl, zh, vi, tl, ar.
Photo code prefix -> `GC-`.

- [x] ITEM 4 photo code TM- -> GC-. DONE, typecheck EXIT=0.
      Generator `lib/ids.ts` emits GC-. `lib/photo-code.ts` rewritten: `codeBody()`
      strips either prefix ONLY when the remainder is exactly 12 chars (the old
      `.replace(/^TM/,"")` would eat real characters off a bare code — the alphabet
      contains G/C/T/M). Exports `CODE_PREFIX`, `CODE_PREFIXES`, `normalizeCode`
      (canonical GC form, for display + cache keys) and `codeCandidates` (both forms,
      for lookups).
      CRITICAL: stored codes are NEVER rewritten. The photo code is inside the signed
      HMAC payload (`lib/verify.ts:29`), so a migration would invalidate every
      historical signature and flip intact photos to "tampered". Legacy rows keep TM
      forever; both lookup sites (`routes/verify.ts`, `lib/verify-map.ts`) use
      `inArray(photoCode, codeCandidates(raw))`.
      28 display files swapped TM- -> GC- (mobile app+11 i18n, web pages+11 i18n, help).
      Intentional TM references in api/lib/photo-code.ts + ids.ts comments preserved.
## Luc's round 2 (2026-09-08)

- [x] ITEM 6 Help Center in the signed-in menus. DONE, lint 0, browser-verified.
      Web: one entry `{ href: "/help", label: "home.nav.help", icon: LifeBuoy }` appended to
      NAV in components/dashboard-shell.tsx — that single array feeds BOTH the desktop
      sidebar AND the mobile horizontal nav row in the header, so one edit covers both.
      Deliberately NOT in MANAGER_ONLY: help is public and field crews need it most.
      Also added to components/account-menu.tsx (the account dropdown) right after Plan.
      Mobile app: new lib/web-help.ts exports webHelpUrl() (base from
      Constants.expoConfig.extra.apiUrl, same source as web-signup.ts, so staging builds
      open staging's help). components/profile-menu.tsx — the hamburger drawer — gets a
      "Help center" row above "Contact us" that Linking.openURL()s out to the website,
      with an open-outline icon to signal it leaves the app. Articles live on the website
      only; bundling a copy in the binary would guarantee a stale one.
      i18n: reused the EXISTING `home.nav.help` key, which is already present in all 11
      web catalogs AND all 11 mobile catalogs (verified by grep). No new key = no
      11-file edit and no Catalog type error.
      BROWSER-VERIFIED signed in on /app/billing: exactly 3 a[href="/help"] all reading
      "Help center" — sidebar, mobile nav row, and the account dropdown once opened.
      Screenshot /tmp/b_menu.png.
- [x] ITEM 7 30-driver plan. DONE, seeded, browser-verified.
      New DEFAULT_PLANS entry in api/lib/plans.ts between delivery-fleet and enterprise:
      id `delivery-fleet-30`, name "Delivery Fleet 30", sortOrder 13, $449/mo,
      12,000 stops/month, 30 drivers, 35 seats, dispatch + smart optimize + tracking +
      signature true, all four exports.
      PRICE RATIONALE (flag to Luc): Fleet is $249 for 15 drivers = $16.60/driver;
      30 drivers straight-line would be ~$498, so $449 is a volume step down that keeps
      the ladder credible. Editable in one field at /admin/plans — DB wins over the seed.
      HOW IT REACHES THE DB: syncPlans() in plans.ts inserts any seed id missing from the
      plans table on the first loadPlans() after boot. Verified: restarted the web dev
      server, hit /app/billing, and the row now exists with price_cents 44900.
      `autumnPlanId: null` ON PURPOSE, so its button currently reads "Talk to us" like
      Enterprise. Luc must create a matching Autumn plan and paste the id at /admin/plans
      before it can be bought — same two-step he just finished for lite/pro/fleet.
- [x] ITEM 5 Delivery plans "Choose" button. RESOLVED BY LUC, VERIFIED 2026-09-08.
      Queried the plans table directly: autumn_plan_id is now "delivery-lite",
      "delivery-pro", "delivery-fleet" — he created the Autumn plans AND pasted the ids
      at /admin/plans. contactOnly is therefore false for all three.
      BROWSER-VERIFIED on /app/billing: the three Delivery cards render live buttons
      ("Switch to Delivery Lite / Pro / Fleet" — the wording is "Switch to X" rather than
      "Choose" only because this workspace already holds a plan). "Talk to us" now
      appears only on Enterprise and on the new Delivery Fleet 30. Nothing left to do.
      Also noted from that query: DB prices differ from the seed (plus $7, crew10 $45,
      crew25 $105) — the DB row is what renders, which is why help carries no figures.
      Original blocker, kept for history:
      `contactOnly` in app-billing.tsx:141 is `priceCents !== 0 && !autumnPlanId`.
      billing.ts:210 needs a real Autumn product for `billing.attach({planId})`.
      lite/pro/fleet have `autumnPlanId: null` (plans.ts:303,342,380; 418 is enterprise).
      Autumn is external (AUTUMN_SECRET_KEY) — products cannot be created from here.
      Once Luc creates them, paste each ID at /admin/plans. Zero code change.
      Do NOT just fill the seed: the button would flip and checkout would fail on click.
      Step-by-step guide for Luc WRITTEN + delivered:
      `autumn-delivery-plans.report/content.md`. Facts verified from the live Autumn
      docs: menu is "Plans" (renamed from Products), price type "Paid recurring",
      the plan's `plan_id` is what `billing.attach({planId})` and `autumnPlanId` need,
      and the Delivery plans MUST share the Evidence plans' plan group (or no group)
      because `organizations.plan` is a single column — separate groups would let a
      workspace hold two live subscriptions. Recommended ids delivery-lite/pro/fleet
      to match local plan ids; billing-sync.ts:76 matches on the exact string.
      Remaining on item 5: nothing until Luc reports back.
- [x] ITEM 3 CSV upload in route builder. BUILT (lint 0, typecheck 0). Hidden
      <input type=file accept=".csv,.txt,..."> inside a styled label right after the
      paste textarea in app-route.tsx (~line 515). On change: clears e.target.value
      (so the same file can be picked twice), rejects >1MB, reads file.text(),
      normalises CRLF, and feeds the text INTO THE EXISTING `paste` state (appending
      on a new line if non-empty). That reuses parse-stops.ts, the live preview,
      delimiter detection, header aliases and the 300 cap with zero new parsing code,
      and nothing is created until the dispatcher presses Add stops.
      aria-label={t("routes.csvChoose")} is REQUIRED — lint fails without it.
      4 new keys routes.csvChoose/csvHint/csvLoaded/csvError in all 11 catalogs.
      Help article widened not renamed (slug `add-stops-by-pasting-a-list` kept so
      no see() ref broke); title/summary/keywords mention upload + new "Upload a CSV"
      section.
      BROWSER-VERIFIED signed in on /app/routes/rte_MTPAPYVOR0XA61W4JP: picking
      /tmp/test-stops.csv filled the textarea (211 chars), showed the green
      "Loaded test-stops.csv" notice, and the preview read "3 stops ready" +
      "Header row detected and skipped: address, name, notes" + "Comma separated".
      Nothing was created (Add stops NOT pressed). Screenshot /tmp/r_csv.png.
      Note: an UNQUOTED address containing a comma splits into two fields (my test
      data's fault, not the parser's — real exports quote it). Same behaviour as the
      pre-existing paste path, so no regression; left alone deliberately.
      New CDP driver /tmp/cdp7f.mjs adds a {"file":{selector,paths}} step using
      DOM.setFileInputFiles — cdp7.mjs cannot drive file inputs.
- [x] ITEM 2 nav + footer -> /help. DONE (gate passed: /help routes now).
      index.tsx lines 140 and 147 -> { label: "home.nav.help", href: "/help" }.
      Help Center link added to site-footer.tsx Company column between /verify and
      the support-email link, reusing the home.nav.help key.
      BROWSER-VERIFIED signed out on /: exactly one a[href="/help"] ("Help center"),
      ZERO remaining a[href*="help.geocliks"], and clicking it lands on /help with
      h1 "How can we help?" and 8 category cards. Screenshot /tmp/r_nav.png.

- [x] ITEM 9 two more driver tiers (2026-09-08). Luc: "create 2 more plan, 200, and 500".
      Read as DRIVER COUNTS, parallel to the earlier "plan for 30 drivers" ask.
      New DEFAULT_PLANS entries in api/lib/plans.ts, sortOrder 14 and 15, between
      delivery-fleet-30 (13) and enterprise (20):
        delivery-fleet-200  $1,799/mo  80,000 stops   200 drivers  215 seats
        delivery-fleet-500  $3,499/mo  200,000 stops  500 drivers  520 seats
      Ratios held constant from Fleet 30: 400 stops per driver per month, seats =
      drivers + 15 office. Per-driver price keeps declining ($16.60 Fleet, $14.97
      Fleet 30, ~$9 Fleet 200, ~$7 Fleet 500) so the ladder rewards growing.
      autumnPlanId null on both, same as Fleet 30 — buttons read "Talk to us" until
      Luc creates matching Autumn plans and pastes the ids at /admin/plans.
      VERIFIED: lint 0/0; turbo typecheck web+desktop pass, mobile re-run alone
      EXIT=0 (the 137 in the turbo run was OOM, not a type error); both rows present
      in the plans table; browser-verified signed in on /app/billing — Fleet 30,
      Fleet 200 and Fleet 500 all render with $1,799 and $3,499. /tmp/p_billing_new.png
      PRICES ARE UNAPPROVED GUESSES — flag to Luc, one-field editable at /admin/plans.

## DEV SERVER ARCHITECTURE — cost me a lot of time, do not re-derive

Root `bun run dev` is `cd packages/web && bunx vite` — THE FRONTEND ONLY. It does not
start a separate API process. pm2 (root `start` + ecosystem.config.cjs) is NOT running
in this sandbox. socat forwards 169.254.0.21:4200 -> vite on [::1]:4200.
The Hono API is served BY VITE IN-PROCESS, and the API module is LAZILY IMPORTED on the
first /api/* request. Consequence that bit me: restarting the web server and then curling
`/` or an HTML page does NOT run `syncPlans()`, so new DEFAULT_PLANS rows never reach the
plans table. `middleware/auth.ts` calls `void loadPlans()` at module load, but that module
is not loaded until an /api/* request arrives.
TO SEED NEW PLANS: after editing plans.ts, hit the public RPC endpoint —
  curl -s -X POST http://169.254.0.21:4200/api/rpc/billing/plans \
       -H "Content-Type: application/json" -d '{}'
then query the DB. RPC base is `/api/rpc` (see web/lib/api.ts), procedure path is
billing/plans, and it is public (the marketing pricing table reads it).
ALSO: `/pricing` IS A 404. There is no marketing pricing route. Plan cards render on
/app/billing only, which needs the SIGNED-IN driver /tmp/cdp7.mjs.
`syncPlans()` sets its `seeded` module flag BEFORE inserting and the boot call swallows
errors, so a failed first run never retries for the life of the process.

## Stages
- [x] H1 types.ts + registry.ts (registry.ts = icon-name -> lucide map + re-exports of
      resolve.ts; runs assertHelpIntegrity() under import.meta.env.DEV only)
- [x] H2 English content: getting-started, mobile-app, teamspace
- [x] H3 English content: delivery-routes, verify, plans-billing, troubleshoot, legal — all DONE.
      59 of 59 English articles written. Ref check passes: every see() ref resolves.

## Corrections found while grounding H3 (tell Luc)

1. There is NO CSV upload in the route builder — `app-route.tsx` has a paste box and
   `lib/parse-stops.ts` (tab/comma/semicolon, quoted fields, EN+FR header aliases, 300 max).
   Article slug is `add-stops-by-pasting-a-list`, not `...import-csv`.
   BUT `api/lib/plans.ts` marketing copy says "type addresses, paste a list or upload a CSV" —
   copy promises a file upload the UI does not have. Product decision for Luc.
2. Real prices in `plans.ts` differ from my earlier note: plus 1200 = $12 (not $7),
   crew10 5000 = $50 (not $45), crew25 12500 = $125 (not $105). business $25, free $0,
   delivery lite/pro/fleet $39/$99/$249, enterprise custom. Prices are DB-seeded and editable
   from /admin/plans, so the help articles deliberately carry NO dollar amounts and point at
   the pricing page instead.
3. Delivery driver counts: business 2, crew10 3, crew25 5, lite 2, pro 5, fleet 15.
   Delivery seats: lite 3, pro 7, fleet 18.
4. 2FA is TOTP via better-auth, issuer "GeoCliks", offered only to owners and admins on
   /app/profile — deliberately not forced on field crew sharing a truck phone. Backup codes
   exist. Both web and mobile handle the second step.
5. Photo codes render as `TM-XXXX-XXXX-XXXX` (`lib/photo-code.ts`) — the TM prefix is a
   Timemark leftover on a GeoCliks product. Cosmetic, but it is printed on every watermark.

Ref check: all 45 `see()` refs written so far resolve to planned slugs. Re-run
`grep -oh "see([^)]*)" content/en/*.ts` after H3 and enforce it in code in H4.
- [x] H4 DONE (lint 0, turbo typecheck EXIT=0). Files:
      help/content/en/index.ts (enCategories, index order)
      help/content/index.ts (CATALOGS/LABELS locale maps, composition only)
      help/resolve.ts (coverage tiers full|labels|english, per-LOCALE fallback not
        per-article, findCategory/findArticle/allArticles/resolveRef/articleHref,
        assertHelpIntegrity throws on bad see() ref + duplicate slugs)
      help/registry.ts, components/help-shell.tsx (+HelpContact),
      components/help-blocks.tsx (all 8 block kinds + anchorFor),
      pages/help.tsx (search built in), help-category.tsx, help-article.tsx
      routes /help, /help/:category/:slug, /help/:category in app.tsx before /terms
      15 "help.*" chrome keys added to ALL 11 i18n catalogs (Catalog is
      Record<keyof typeof en, string>, so a missing key in any locale = type error)
      Pages use DEFAULT exports to match pages/terms.tsx convention.
      Marketing header uses <LanguageSelect compact bare />.
      STILL TO DO on H4: browser check of /help, /help/verify, one article.
- [x] H5 DONE. Search is built INTO pages/help.tsx (not a separate Ctrl+K dialog):
      useSearch scans title+summary+keywords+flattened body of all 59 articles,
      requires every whitespace-separated word to match, ranks title > summary/keyword
      > body, caps at 12, activates at 2 chars and swaps the category grid for results.
      Browser-verified: typing "csv" narrows to exactly the one right article.
      A Ctrl+K dialog was never built — ask Luc if he still wants it on top.
      Nav + footer repointed (see ITEM 2).
- [~] H6 translations. fr-CA SHIPPED 2026-09-07: all 59 article bodies translated in
      help/content/fr-CA/ (8 category files + composition-only index.ts), registered
      as CATALOGS["fr-CA"] = frCategories in help/content/index.ts. Cross-ref check
      on the fr-CA dir: 6/10/11/10/4/6/8/4 = 59, BAD: none. lint 0/0, turbo
      typecheck EXIT=0 (3 tasks), build EXIT=0. Browser-verified with
      localStorage geocliks.locale='fr-CA': /help h1 "Comment pouvons-nous vous
      aider?", all 8 category cards in French, and the article
      delivery-routes/add-stops-by-pasting-a-list fully French with NO untranslated
      banner (fr-CA is now a `full` coverage locale).
      Rules followed per file: same slugs, same icon, same block order; see() refs
      byte-identical to English; category slugs stay English; keywords translated
      with the English term appended so both languages are findable; vocabulary
      taken from i18n/fr-CA.ts (espace de travail, forfait, sièges, filigrane,
      arrêts, courriel, téléverser, chauffeur, répartition, empreinte du contenu,
      décalage d'horloge, roles propriétaire/admin/gestionnaire/terrain, route
      statuses Brouillon/Assignée/En cours/Terminée/Annulée); no dollar figures.
      es SHIPPED 2026-09-08: all 59 article bodies translated in help/content/es/
      (8 category files + composition-only index.ts), registered as CATALOGS.es =
      esCategories. Cross-ref on the es dir: 6/10/11/10/4/6/8/4 = 59, BAD: none.
      lint 0/0, turbo typecheck EXIT=0 (3 tasks), build EXIT=0. Browser-verified
      with geocliks.locale='es': /help h1 "¿En qué podemos ayudarte?", all 8 cards
      Spanish (Primeros pasos / App móvil / Teamspace / Rutas de reparto /
      Verificación / Planes y facturación / Solución de problemas / Privacidad y
      aspectos legales), NO untranslated banner, and the article
      delivery-routes/assign-a-driver fully Spanish. es is now a `full` locale.
      REGISTER DECISION: tú, not usted. The app's own i18n/es.ts is inconsistent —
      help.* chrome and plans.* use tú ("¿En qué podemos ayudarte?"), while routes.*
      uses usted ("Cree une route", "Déjelo vacío"). Chose tú because the help.*
      chrome literally frames every article. FLAG TO LUC: the app's routes UI copy
      is the odd one out and he may want it aligned later.
      Spanish vocabulary locked for consistency: espacio de trabajo, Teamspace
      (product name kept), marca de agua, sello, plan, asientos, enlaces para
      compartir, código de foto, hash del contenido, desfase de reloj, paradas,
      propietario/admin/gerente/campo, conductor, comprobante de entrega, despacho
      en vivo, optimizador inteligente/estándar, «Resolver direcciones», tiempo de
      servicio, ventanas horarias, regreso al punto de partida, cola;
      route statuses Borrador/Asignada/En curso/Completada/Cancelada.
      ALSO FIXED THIS ROUND (same class of bug as ITEM 8, found in delivery-routes):
      two plan claims went stale when Fleet 30 shipped — the delivery-overview note
      listed only "Delivery Lite, Pro and Fleet", and assign-a-driver said "Lite
      covers two, Pro five, Fleet fifteen". Patched in en + fr-CA to include Fleet 30
      (thirty drivers); es was written correct from the start. Browser-verified the
      French "Fleet 30 trente" renders.
      NEXT LANGUAGES, one complete language at a time: pt-BR, de, it, pl, zh,
      vi, tl, ar. Same recipe: copy content/en/*.ts structure, translate strings
      only, add content/<loc>/index.ts, register in CATALOGS, re-run the cross-ref
      check + lint + typecheck + build + a browser check with the locale set.
- [ ] H7 lint, turbo typecheck, build, browser check, deliver
      2026-09-07: `bun run build` EXIT=0 (2 tasks successful; only warning is the
      >500kB chunk notice, pre-existing). lint 0/0. typecheck EXIT=0 (web+desktop in
      turbo, mobile re-run alone after a 137/OOM kill — 137 is memory, not a type
      error). Both owed browser checks now pass (CSV picker, nav -> /help).
      Re-run all four at the very end, after the translations land.

## Notes
- `bun run typecheck` (turbo) is the only real typecheck. `bunx tsc --noEmit` in packages/web
  checks nothing (files:[] + project refs).
- index.tsx lines 140 and 147 hold the two nav entries pointing at https://help.geocliks.com/.
- Marketing pages force the light theme (see legal-page.tsx) and restore it on unmount.

- [x] ITEM 8 STALE CONTENT FOUND AND FIXED (2026-09-08). The shipped English + French
      `plans-billing/delivery-plans` article claimed "The Delivery plans are not self-serve
      yet. The billing page shows Talk to us rather than a checkout button" and walked the
      reader through emailing sales@geocliks.com. That was TRUE when written and became
      FALSE the moment Luc pasted the Autumn plan ids — Lite/Pro/Fleet now render live
      checkout buttons (browser-verified). Patched en + fr-CA + wrote es against reality:
      self-serve para + checkout steps for Lite/Pro/Fleet, warn() narrowed to the two
      plans that really are still "Talk to us" (Delivery Fleet 30 + Enterprise), added the
      Delivery Fleet 30 row (12,000 stops / 30 drivers / dispatch yes / optimizer yes) to
      the table in all three, "Pro and Fleet" -> "Pro, Fleet and Fleet 30" on both gated
      features, and fixed the `upgrade-or-change-plan` step that said "For Enterprise or a
      Delivery plan, you get a prefilled email".
      LESSON FOR THE REMAINING 8 LANGUAGES: the English source is NOT ground truth for
      feature-gating or self-serve claims. Check plan state in the DB before translating
      any block that describes what a button does. Translating stale text just manufactures
      another copy of a false claim in a language nobody on the team can proofread.
      NOTE: Delivery Fleet 30 is now documented in en/fr/es help, but Luc has not yet
      approved its $449 price and has not created its Autumn plan. Flag both.

- [x] ITEM 10 free-trial CTA + Custom plan last (2026-09-08). Luc confirmed: all six
      Delivery plans have a 7-day free trial configured in Autumn, and he pasted the
      Autumn ids for fleet-30/200/500 (DB verified — only `enterprise` is still null,
      which is correct for a contact-only custom plan). Prices $449/$1,799/$3,499 and
      the drivers-not-dollars reading are both CONFIRMED by Luc.
      New i18n key `home.pricing.freeTrial` added to ALL 11 web + ALL 11 mobile
      catalogs (Catalog is Record<keyof typeof en, string>, so a key missing from any
      one file is a type error). Script /tmp/addtrial.py.
      Landing page pages/index.tsx: delivery-* CTA now renders freeTrial, others keep
      "Choose". Mobile app/plans.tsx: an UPGRADE into a delivery-* plan renders
      freeTrial; current/contact/downgrade branches untouched.
      NOT changed: /app/billing still reads "Switch to {plan}" — Luc named only the
      landing page and the mobile app, and I did not want to silently reword a third
      money button. Ask him if he wants it there too.
      CUSTOM PLAN LAST — TWO SEPARATE FIXES, both were needed:
      (a) DB: enterprise sort_order was 5 (mid-grid, ahead of all delivery plans);
          updated to 20 to match the seed. refreshLegacyRow() NEVER touches sortOrder,
          so editing DEFAULT_PLANS alone would have done nothing. This is what
          /app/billing renders from.
      (b) pages/index.tsx: THE LANDING PAGE NEVER READS sortOrder. It splits plans
          into evidence = !isDeliveryPlan(id) and delivery = isDeliveryPlan(id), so
          Enterprise was swept into the evidence group regardless of sort order.
          Fixed by excluding enterprise from `evidence` and appending it after the
          delivery array. Browser-probing caught this AFTER the DB fix looked done —
          the DB change alone left the landing page unchanged.
      VERIFIED: lint 0/0; turbo typecheck 3/3 EXIT=0; build EXIT=0; browser on / —
      order is FREE, PLUS, BUSINESS, CREW 10, CREW 25, DELIVERY LITE/PRO/FLEET/
      FLEET 30/FLEET 200/FLEET 500, ENTERPRISE last; freeTrialCount 6, chooseCount 5,
      talkCount 1. /tmp/order_landing.png
      GOTCHA FOR NEXT TIME: the pricing CTAs are uppercased by CSS, so innerText is
      "FREE TRIAL" not "Free trial". An exact-match check for the sentence-case string
      returns 0 and looks like the edit failed. Compare uppercase.
      STILL OPEN: help articles in en/fr/es do not mention Fleet 200/500 and the
      narrowed warn still names only "Fleet 30 and Enterprise" as contact-only —
      now WRONG, since fleet-30/200/500 all have Autumn ids and are self-serve.
      Luc said "Do it". Next session: fix that copy, then resume pt-BR translation.
      -> ALL THREE CLOSED 2026-09-08, see ITEM 11/12/13 below.

- [x] ITEM 11 grey-space fix on the landing pricing grid (2026-09-08). Luc sent a
      screenshot of a grey slab in the pricing section. ROOT CAUSE, which is NOT what
      the first fix assumed: the grid paints its hairlines by letting the container's
      `bg-line` show through 1px `gap-px` gaps, so ANY incomplete last row renders the
      missing cells as a solid grey block. With Enterprise appended to the delivery
      array that grid held 7 cards = 2 dead cells.
      Luc's two design answers: full-width band across the bottom, one wide card with
      features in columns; heading stays under Delivery Routes (no new heading).
      Done in pages/index.tsx:
      (a) `custom` = the enterprise plan, excluded from BOTH evidence and delivery;
          passed to the delivery PlanGroup as a new OPTIONAL `trailing` prop so the
          evidence call site needed no edit. Rendered as a full-width band after the
          grid, still inside the group's outer div: name/price/tagline left, features
          in a 2-col list, "Talk to us" mailto CTA right.
      (b) THE FIX THE FIRST ATTEMPT MISSED — removing Enterprise from `evidence` left
          FIVE cards there, so the grey slab simply MOVED to the evidence grid. Caught
          only by looking at the screenshot; the DOM counts (5 and 6 kids) had said it
          plainly and I read past them. Real fix is data-independent: PlanGroup now
          pads the last row with card-coloured fillers,
            fill2 = (2 - n%2)%2   rendered `hidden bg-ink sm:block md:hidden`
            fill3 = (3 - n%3)%3   rendered `hidden bg-ink md:block`
          Both sets are rendered and toggled with `display` because the remainder
          differs per breakpoint and a hidden grid item occupies no cell. This also
          protects both grids if plan counts change again.
      VERIFIED: lint 0/0. Browser signed out on / at 1280px — evidence grid's empty
      cell now reads as page background, delivery grid is 2 clean rows of 3 all
      reading FREE TRIAL, Enterprise "Custom" renders ONCE as a full-width band under
      the Delivery Routes heading. /tmp/band_pricing.png + /tmp/band_delivery.png
      LESSON: a visual bug needs an eyes-on check. The DOM assertions passed while the
      page still looked wrong.

- [x] ITEM 12 /app/billing free-trial label (2026-09-08, Luc said "do it").
      app-billing.tsx: new `trial` const in the plans map, label swaps
      billing.switchTo -> the EXISTING home.pricing.freeTrial key (no new i18n key,
      no 22-file edit).
      GATED ON PURPOSE: `delivery && !current.id.startsWith("delivery-") && !contactOnly`.
      An existing Delivery customer switching plans is billed immediately — Autumn
      grants a trial once per customer, not once per plan — so showing "Free trial"
      there would be a false promise about money, the same class of bug that has
      already bitten this project twice.
      VERIFIED BOTH DIRECTIONS in the browser, signed in. On business: all six
      Delivery cards read "Free trial", evidence plans keep "Switch to X", Enterprise
      "Talk to us". Then flipped the TEST org's `organizations.plan` to delivery-pro
      in the DB: every delivery card correctly fell back to "Switch to X" and none
      promised a trial. RESTORED to business immediately afterwards (verified).
      STILL UNVERIFIED, FLAG TO LUC: Autumn is the real authority on trial
      eligibility and I cannot see Autumn from here. The 7-day trial exists on Luc's
      word alone. Worth one real test checkout to confirm no card is charged on day 1.

- [x] ITEM 13 help copy for Fleet 200/500 + self-serve correction (2026-09-08,
      Luc said "do it"). All six delivery plans now have Autumn ids, so the shipped
      copy naming "Fleet 30 and Enterprise" as contact-only was actively FALSE in
      three languages. Patched en + fr-CA + es (plans-billing.ts and
      delivery-routes.ts in each) via a python script that asserts exactly one match
      per replacement, so a silent no-op was impossible:
        - summary + delivery-overview note + assign-a-driver driver counts now list
          Fleet 200 (two hundred) and Fleet 500 (five hundred)
        - table gains ["Delivery Fleet 200","80,000","200"] and
          ["Delivery Fleet 500","200,000","500"] (80 000 / 200 000 in fr-CA and es)
        - both gated-feature bullets -> "Pro, Fleet, Fleet 30, Fleet 200 and Fleet 500"
        - "How to get one" -> EVERY Delivery plan is self-serve, and it now documents
          that the trial is once per WORKSPACE not once per plan, matching the ITEM 12
          gate (button reads Free trial coming from a non-delivery plan, Switch to
          otherwise)
        - warn narrowed to Enterprise as the ONLY contact-only plan
        - upgrade-or-change-plan "For Enterprise or Delivery Fleet 30" -> Enterprise
      No dollar figures added in any language (DB prices are operator-editable).
      VERIFIED: grep finds ZERO remaining stale contact-only claims in any locale, and
      Fleet 200 coverage is symmetric across en/fr-CA/es (2 in delivery-routes, 4 in
      plans-billing each). lint 0/0.

- [x] ITEM 14 landing-page plan CTA styling + bigger group headings (2026-09-08,
      Luc: "put all the tabs orange with mouse over turning black on all the plans"
      and "'Photo & video evidence' Title and 'Delivery routes' title need to be
      bigger font"). All in pages/index.tsx.
      (a) Group headings: text-[11px] tracking-[0.2em] -> text-[15px]
          tracking-[0.18em] sm:text-[18px]. Measured 18px vs the 11px plan-name
          kickers inside the cards, so the hierarchy now actually reads.
      (b) Every plan CTA is one solid amber button. Dropped the
          `plan.id === "business" ? filled : outlined` ternary and the Enterprise
          band's outlined "Talk to us". 12 CTAs total, all bg-amber.
      (c) THE TRAP — DO NOT USE `text-ink` / `hover:bg-ink` ON THIS PAGE. The
          palette in styles.css is THEME-AWARE and the token names are kept from
          the old dark-first design, so in the light theme `--c-ink: #ffffff`.
          pages/index.tsx:872 pins the whole landing page `data-theme="light"`.
          My first pass used text-ink + hover:bg-ink and it was wrong twice over:
          white-on-orange label, and hover would have faded the button to WHITE,
          the exact opposite of the black Luc asked for. Caught by reading the
          COMPUTED color (rgb(255,255,255)) rather than trusting the class name.
          Correct tokens: `text-on-amber` + `hover:bg-on-amber hover:text-amber`.
          --c-on-amber (#0b0e13) and --c-amber (#ffb021) are the ONLY two tokens
          that hold the same value in both themes, so this is theme-proof.
          `text-on-amber` was already the established pattern elsewhere (19 uses).
          NOT CHANGED: 36 other `bg-amber`+`text-ink` spots exist repo-wide. Most
          sit inside `data-theme="dark"` scopes where text-ink IS #0b0e13 and is
          correct, so a blind mass-replace would break them. Left alone on purpose.
      (d) Lint gotcha that cost a cycle: a {/* ... */} JSX-expression comment
          CANNOT sit beside an element inside a ternary branch — two children in a
          single-expression slot is a parse error. Use a plain /* ... */ block
          comment inside the parens.
      VERIFIED: lint 0/0; typecheck 3/3 EXIT=0; build EXIT=0. Browser signed out at
      1280px, locale reset to en: all 12 CTAs compute bg rgb(255,176,33) + color
      rgb(11,14,19); headings 18px vs 11px kickers; Enterprise band renders once.
      Hover proven by grepping the COMPILED css text for `hover\:bg-on-amber` —
      Tailwind v4 emits `.hover\:bg-on-amber { &:hover { @media (hover:hover) {...`
      i.e. NESTED, so a CSSOM walk over selectorText finds nothing and looks like a
      false negative. Screenshots /tmp/amber2_pricing.png, /tmp/amber3_delivery.png,
      /tmp/amber3_band.png.
      SIDE EFFECT TO FLAG: Business was the only filled button before, which is how
      the "MOST CREWS" badge earned its emphasis. Now every button is filled, so
      Business stands out only by the badge + its bg-ink-2 card tint.
      TRIAL QUESTION CLOSED: Luc's Autumn screenshot shows the clock icon on exactly
      the six delivery-* plans and none of free/plus/business/crew10/crew25/legacy.
      That matches the wiring. Stop flagging the config as unverified; only a real
      test checkout can prove no card is charged on day 1.

- [x] ITEM 15 Delivery Service landing section. DONE, all gates green, browser-verified
      at 1280px + 420px + 3 locales.
      LUC'S LOCKED ANSWERS (do not re-ask): placement immediately BEFORE <Pricing />;
      all 7 delivery types; photos GENERATED not stock (his explicit choice, to avoid
      licence risk on a commercial site); start with 3 photos and add more later;
      all 11 languages now; yes add "Delivery" to the top nav; layout "you decide".
      LAYOUT DECIDED: hero photo + 4 benefit items, then a "Delivery types" divider
      with 3 big photo tiles (fleet / restaurant / grocery) and the remaining 4 types
      as compact text-only cards, then one amber CTA to #pricing. Text-only for 4 of
      the 7 keeps the section to one screen instead of a wall of imagery.
      PHOTOS: 4 generated JPGs in packages/web/public/images/delivery/ —
      doorstep-proof.jpg (the hero; driver hands a parcel to a woman at her door,
      truck blurred at the curb — this composition was Luc's own re-brief after the
      first fleet render), fleet-vans.jpg, restaurant-pickup.jpg, grocery-totes.jpg.
      All 1200x900, ~90-125kB, documentary style, slightly desaturated, no text, no
      logos, no readable plates, matching public/images/samples/*.jpg. Luc had only
      seen doorstep-proof + fleet-vans at report time; restaurant + grocery were
      generated without a second approval round because he had pre-authorized 3 and
      the style had converged.
      SECTION IS `section#delivery` in pages/index.tsx, modelled on function Field().
      Plain `border-b border-line` (NOT bg-ink-2/40) on purpose: Field immediately
      above is bg-ink-2/40, so an identical tint would blend the two sections.
      i18n: 28 keys x 11 catalogs via /tmp/adddelivery.py (27 home.delivery.* + 
      home.nav.delivery) plus 1 more via /tmp/addtypes.py (home.delivery.types, the
      divider kicker — I wrote the JSX against a key the first script never created,
      caught it before lint). Final count 28 home.delivery.* per catalog, all 11 equal.
      SIDE EFFECT, FLAGGED TO LUC: Delivery takes slot 05, so the Pricing kicker was
      renumbered 05 -> 06 in all 11 catalogs. Verified rendering as "06 — PLANS".
      COPY grounded in verified product facts only, no dollar figures: route builder
      takes typed/pasted/CSV; optimizer = shortest driving order; live dispatch is
      "Delivery Pro and above"; completing a stop HARD-REQUIRES a real photo;
      signature optional; failed attempt must record a reason; private tracking link
      + on-the-way/delivered emails; every stop re-checkable by photo code.
      NAV: added in BOTH places — desktop <nav> and the separate mobile drawer markup.
      VERIFIED: lint 0/0 · typecheck 3/3 EXIT=0 · build EXIT=0 (asset-optimizer picked
      up all 4 jpgs). Browser signed out, locale reset first:
        1280px — section present, all 4 imgs naturalWidth 1200, 11 h3s (4 benefits +
          7 types), 1 nav link, kickers "05 — DELIVERY SERVICE" + "DELIVERY TYPES",
          pricing "06 — PLANS", CTA bg rgb(255,176,33) / color rgb(11,14,19).
          Eyes-on /tmp/del1_top.png, /tmp/del2_tiles.png.
        420px — 2 #delivery links, desktop one h=0 and drawer one h=48; clicking the
          drawer link scrolls the section to top 0; no horizontal overflow
          (scrollWidth 420 == clientWidth). Eyes-on /tmp/delm2_menu.png shows
          "Delivery" between Features and Pricing. /tmp/delm2_landed.png.
        fr-CA / zh / ar — all images load, no overflow, ar correctly dir=rtl and
          fully mirrored (nav, kicker, hero column, icons, CTA arrow).
          /tmp/dl_fr.png, /tmp/dl_zh.png, /tmp/dl_ar.png, /tmp/dl_ar2.png.
      TESTING GOTCHA WORTH KEEPING: `header button[aria-label]` grabs the LANGUAGE
      button, not the hamburger — the header's buttons are 3 hidden NavMenu triggers,
      then Language, then Menu. Use [...document.querySelectorAll('header button')]
      .pop(). My first mobile run reported navLinks:1/visible:false and the scroll
      assertion still "passed", because clicking a display:none anchor still jumps.
      Always assert the link is VISIBLE (getBoundingClientRect().height > 0), never
      just that the scroll happened.
      COSMETIC, LEFT ALONE DELIBERATELY: in zh and ar the CTA keeps the Latin word
      "Delivery" ("查看 DELIVERY 方案") because plan names stay English repo-wide;
      CSS uppercases it. Consistent with the rest of the site — change only if asked.

- [x] ITEM 16 Landing page polish pass (Luc: "redo all the other sections nicely like you did
      for delivery and remove some useless thing"). LUC'S LOCKED ANSWERS: what to cut = my call
      as long as the services stay explained; depth = MEDIUM (polish + rebuild visually weak
      sections); hero fake address = keep generic, photo code + verified stamp only, no street
      address; no dislikes.
      DEFECTS FIXED — ALL MEASURED IN-BROWSER, NOT TASTE:
      1. Hero "START FREE" was white-on-amber, computed rgb(255,255,255) on rgb(255,176,33),
         ~1.9:1. The most important button on the page. Same bug on the BEFORE/AFTER photo
         badges and the MOST CREWS badge. All three -> text-on-amber.
      2. Teamspace photo codes were MALFORMED: rendered GC-3E8-VERIFIED / GC-55D-VERIFIED etc,
         derived arithmetically via `GC-${(1000+i*373).toString(16)}-VERIFIED`. Not a shape this
         product ever emits — bad look on a proof-of-work page. Replaced with 4 literals in the
         real GC-XXXX-XXXX-XXXX shape, with a comment saying why they are literals.
      3. All 4 Teamspace <img> had alt="". Now alt={t(...)}, REUSING the existing industry.*
         keys rather than inventing 4 new keys x 11 catalogs = 44 translations. Matches the
         precedent set by the Delivery tiles (alt={t(tile.name)}).
      ALSO: hero street address + Colorado coords removed; live `new Date()` clock replaced with
      module-level const HERO_STAMP (a ticking clock in a marketing screenshot re-renders on
      every tick for no benefit); 2 decorative blur-glow divs deleted (blueprint grid kept, so
      the hero still has depth — verified by screenshot, not assumed).
      Evidence section STILL had Denver coords in its mono line (39.76610 N 105.02120 W) on a
      Canada-biased product -> swapped to 43.65107 N 79.34015 W. Kept the "±4 m" accuracy
      read-out because that is the part that explains the geotag feature.
      NOT TOUCHED, deliberately: Reports, Field, Pricing. Their content explains the service,
      which Luc's answer explicitly protects. Pricing was already reworked in ITEM 14.
      i18n: 1 new key home.hero.stampNote x 11 catalogs via /tmp/addstamp.py ("Network-verified
      capture time"). Verified 1 occurrence in each of the 11.
      THE COLOUR-TOKEN TRAP THAT CAUSED THE BUG: styles.css palette INVERTS between themes —
      light --c-ink:#fff, dark --c-ink:#0b0e13. pages/index.tsx pins data-theme="light", so on
      the landing page text-ink is WHITE. --c-amber and --c-on-amber are the ONLY two tokens
      identical in both themes. Anything on an amber fill MUST use text-on-amber. Do NOT
      mass-replace remaining bg-amber+text-ink repo-wide — most sit inside data-theme="dark"
      scopes (header, dashboard, admin, auth) where text-ink is correct.
      VERIFIED: lint 0/0 · build EXIT=0 · browser signed out @1280 with locale reset — all 16
      amber-filled elements compute color rgb(11,14,19); teamspace 4 imgs / 0 empty alts;
      0 blur divs; no horizontal overflow. Eyes-on /tmp/pol_hero.png, /tmp/pol_teamspace.png.

- [!] ITEM 17 STOCK-PHOTO LICENCE CONTAMINATION in public/images/samples/ — FOUND BY ACCIDENT
      when the ITEM 16 teamspace screenshot showed text overlapping a photo code caption.
      6 of the 19 Aug-28 sample images had burned-in third-party marks:
        fiber-technician.jpg      "shutterstock.com · 2678867845" watermark  [ON LANDING PAGE]
        construction-site.jpg     tiled Alamy watermarks + alamy ID/URL bar
        roof-replaced.jpg         third-party contractor logo "LEGACY SERVICE" [ON LANDING PAGE]
        roof-before-after.jpg     third-party contractor logo "Roofing FRASER"
        fiber-handhole.jpg        yellow arrows + caption lifted from a fiber training deck
        fiber-splice-closure.jpg  same, annotated training-deck image [get-app + app-templates]
      Tell-tale: scraped-web dimensions (390x280, 493x409, 599x373, 735x616) unlike real
      library exports. The Shutterstock one rendered directly under a photo code on a page whose
      whole promise is "this photo is provable and untampered".
      LUC'S CALL: "yes do all the pictures" + "Photo first" (before pt-BR).
      FIXED: all 6 regenerated in the same documentary style as the delivery photos, aspect
      ratios matched to their render slots — fiber-technician 1000x1000 (aspect-square tile),
      roof-replaced 900x1200 (aspect-[3/4] AFTER tile), other four 1200x900 (aspect-[4/3]).
      Prompts explicitly forbade text/watermarks/logos/annotations. Verified clean by eyeballing
      a 6-up montage AND full-resolution top+bottom edge strips of all 6 (watermarks hide in
      edges — the montage alone would not have caught the original Shutterstock bar).
      NOT AUDITED YET: the remaining 13 sample images looked clean at montage size but only the
      6 replaced ones got the full-res edge-strip check.

- [!] PRE-EXISTING, NOT MINE, NOT FIXED: `packages/web` typecheck is VACUOUS. Its script is
      `tsc --noEmit` against a tsconfig.json with `files: []` + project references, so it checks
      NOTHING and turbo reports "@template/web:typecheck successful" while real errors sit in
      the app. Running the app project directly
      (`node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json`) surfaces ~10 real
      errors, all Date-vs-number serialization mismatches plus one missing `.name`, in
      app-projects.tsx, app-reports.tsx, app-share.tsx, app-team.tsx, app-teamspace.tsx and
      share-view.tsx. None are in index.tsx and none were touched this session — pre-existing.
      Fixing them means touching the API date-serialization contract; did not start it.
      ALSO: mobile typecheck OOMs under bun (EXIT=137 = SIGKILL, not a type error) on this
      3.9GB box. It passes EXIT=0 as:
        cd packages/mobile && node --max-old-space-size=1400 node_modules/typescript/bin/tsc --noEmit
      SEVENTH PHOTO, found by the ITEM 17 verification screenshot: roof-damage.jpg was NOT in
      the flagged 6 (no licence mark) but was itself a before/after COLLAGE with burned-in
      "BEFORE"/"AFTER" labels. In the aspect-[3/4] BEFORE slot it cropped to "FORE"/"AFTE"
      sitting under the site's own amber BEFORE badge. Replaced with a single documentary worn-
      roof shot, 900x1200, to pair with the new roof-replaced.jpg. The pair now reads as a real
      comparison with only the site badges carrying the labels.
      FINAL VERIFY (7 photos): lint 0/0 · build EXIT=0, asset-optimizer picked up all 7 ·
      browser signed out @1280 cache-busted — all 7 landing samples load, 0 broken, 0 empty
      alts, fiber-technician 1000x1000 (was 390x280) and roof-damage/roof-replaced 900x1200
      prove the new files are live, 4/4 teamspace codes match /^GC-[A-Z0-9]{4}(-[A-Z0-9]{4}){2}$/,
      no "shutterstock"/"alamy"/Denver strings in the DOM, no horizontal overflow.
      Eyes-on /tmp/ph_teamspace.png, /tmp/fin_reports.png.

## ITEM 18 — 43 hidden type errors + vacuous typecheck gate (IN PROGRESS 2026-09-08)

Root cause: `packages/web/package.json` typecheck is `tsc --noEmit`, but `tsconfig.json` is
`files: [] + references` -> checks NOTHING. `bun run build` uses the same vacuous tsc.
Real gate: `tsc --noEmit -p tsconfig.app.json` -> EXIT=2, 43 errors, all pre-existing.
Log regenerated at /tmp/tcapp.log.

Also noted (not fixed, not in scope): `src/api` is in NO tsconfig `include` — it is only
checked transitively via type imports from `src/web`.

Groups and status:
- [x] A  Date vs number (~20). FIX: single point — new `export type Stamp = number|string|Date`
        in components/evidence-card.tsx; `formatStamp(ms: Stamp)`. `new Date()` already accepts
        all three at runtime, so this is a type-only correction, NOT a loosening to `any`.
- [x] B  EvidencePhoto.capturedAt/verifiedAt widened to `Stamp` (same commit as A).
- [ ] C  9x missing `google` Maps namespace. CONFIRMED: node_modules/@types only contains `bun`,
        so @types/google.maps is genuinely absent. Need to add dep + `types` entry.
- [ ] D  10 catalogs each missing EXACTLY these 6 keys (diffed, not guessed):
        home.pricing.evidenceGroup, home.pricing.evidenceNote, home.pricing.deliveryGroup,
        home.pricing.deliveryNote, billing.deliveryGroup, billing.deliveryNote
        (the last two were the "and 2 more" TypeScript truncated). ar de es fr-CA it pl pt-BR
        tl vi zh. Fix by ADDING to all 10, never by deleting from en.ts — they are live.
- [ ] E1 photo-drawer.tsx:288 `.integrity` missing on verify result
- [ ] E2 app-team.tsx:409 `.name` -> `.org.name`
- [ ] E3 app-teamspace.tsx:66 tag union missing "pickup"/"delivery"
- [ ] E4 app-messages.tsx:255 "team.noMembers" is not a real TKey
- [ ] E5 lib/auth.ts:120 applicationId string|undefined
- [ ] GATE  package.json typecheck -> `tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit`
        then re-run `bun run lint` (it checks template integrity of package.json).

Gates required: lint 0/0 · new real typecheck EXIT=0 · build EXIT=0 · mobile tsc EXIT=0
· eyes-on screenshots signed in (/tmp/cdp7.mjs) of every page with a date on it.

Also record: Luc confirmed 2026-09-08 that restaurant-pickup.jpg and grocery-totes.jpg DO fit
his business ("Yes they do"). ITEM 15 photo question is CLOSED — never re-ask.

## ITEM 19 — X sign-in on the mobile app (2026-09-08)

Luc reported "mobile login page has no X option, signup page is fine". Premise was wrong:
`app/sign-up.tsx` is a pure `<Redirect href="/sign-in">` (18 lines, renders no UI), so both
mobile routes land on the SAME `<AuthForm mode="sign-in" />`. X was on NEITHER — the strings
`twitter`/X appeared nowhere in `packages/mobile`. Web's X button is gated on
`providers.data?.x` (runtime capability), NOT on mode, so web shows X identically on both pages.
He was almost certainly comparing the app's login screen against the WEBSITE's signup page in a
phone browser. So this was a new feature, not a fix. He chose "build it properly".

Server half was ALREADY done — `expo()` plugin in `api/auth.ts:210`, `withNativeOrigin`,
`socialProviders.twitter` (gated on `xLoginConfigured`), `trustedProviders: ["twitter"]`.
`TWITTER_CLIENT_ID`/`TWITTER_CLIENT_SECRET` both set in root `.env`. Only the CLIENT half missing.

`signin.x` ALREADY existed in all 12 mobile i18n catalogs — strings were added, button never
built. No i18n work needed.

- [x] `bunx expo install @better-auth/expo` — first resolved 1.7.3 with 2 peer warnings against
      better-auth 1.6.19; **re-pinned to exactly 1.6.19** to match web + server.
- [x] `bunx expo install expo-network` — REQUIRED peer of `@better-auth/expo/dist/client.js`.
- [x] `lib/auth.ts` — added `expoClient({ scheme: nativeScheme, storagePrefix: "geocliks",
      storage: SecureStore })` alongside managedAuthExpoClient + twoFactorClient. Added
      `nativeScheme` derived from `Constants.expoConfig?.scheme` (normalises string|array like
      `web-signup.ts` does) — app.json `expo.scheme` NOT edited.
- [x] `components/auth-form.tsx` — busy state widened to `"google"|"x"|"email"`; `withX()` calls
      `authClient.signIn.social({ provider: "twitter", callbackURL: "/app" })`, swallows
      dismiss/cancel; outline Pressable + `styles.x`/`styles.xText`.
- [x] Icon: bundled `@expo/vector-icons` is **14.1.0**, which has NO `logo-x` (only retired
      `logo-twitter`). I first read glyph `logo-x` from the bun CACHE (15.1.1) — wrong file, and
      typecheck caught it (TS2820). Fixed with inline `react-native-svg` `XIcon` reusing web's
      exact path data. **That path is now in FOUR places** — web auth-form.tsx, site-footer.tsx,
      admin-settings.tsx, mobile auth-form.tsx. Keep identical.

### GATES
- [x] `bun run lint` — 0 warnings / 0 errors (re-run AFTER the icon change)
- [x] mobile `tsc --noEmit` — EXIT=0 (`/tmp/mtc2.log`)
- [x] Metro web bundle — HTTP 200, 9.55 MB, zero resolve failures, symbols present
- [x] Visual — `/tmp/x_signin2.png`, real X mark, outline under Google's solid fill

### LESSON — typecheck is NOT a bundle check
Mobile `tsc --noEmit` passed EXIT=0 while the Metro bundle was returning **HTTP 500**
(`UnableToResolveError: expo-network`). TS resolves types; it does not walk the runtime module
graph. **A missing peer dep took down the ENTIRE mobile bundle, not just the screen I touched.**
Always fetch the bundle URL and assert `http=200` + zero `UnableToResolveError` after adding any
mobile dependency.

### NOT VERIFIED — needs a real device, and publishing is broken
The native OAuth round trip (browser opens X, X returns to `<scheme>://`, plugin stores the
session) CANNOT be tested in the Expo web preview — the custom scheme only resolves in a real
native build. Publishing is broken/platform-owned, so neither of us can get this onto a phone yet.
What is proven: the button renders and is wired. What is NOT: that tapping it signs you in.
Also still open: X accounts that expose no email address — `api/auth.ts:~133` says those cannot be
used because invites/delivery notifications require an address. That limit now follows X to mobile.

## ITEM 18 — verification correction (2026-09-08)
- Teamspace is **`/app`**, NOT `/app/teamspace` (which 404s). `NAV` in dashboard-shell.tsx:42.
- `/tmp/d_reports.png` was a **BLANK WHITE PAGE** — its `bad:[]`/`stamps:[]` was a FALSE PASS.
- `/app/share` eyeballed and GENUINELY GOOD (`/tmp/d_share.png`).
- Scanner now must assert `RENDERED` (`body.innerText.length > 40`) before any clean scan counts.
- STILL OPEN: re-run `/app` + `/app/reports`; the 5 targeted interaction checks.

## ITEM 20 — pt-BR Help Center ✅ COMPLETE, gates green, browser-verified (2026-09-08)

All 9 files written in `packages/web/src/web/help/content/pt-BR/` and REGISTERED in
`content/index.ts` (`"pt-BR": ptBRCategories`, import + trailing export all added).

Files/lines: getting-started 214 · legal 275 · mobile-app 336 · plans-billing 312 ·
troubleshoot 385 · verify 214 · teamspace 530 · delivery-routes 616 · index 34.

Validator: `{'getting-started':6,'mobile-app':10,'teamspace':11,'delivery-routes':10,
'verify':4,'plans-billing':6,'troubleshoot':8,'legal':4} total 59` and `BAD: none`. ✓

Gates actually run:
- root `bun run lint` → 0 warnings 0 errors (54 files / 299 files, 152 rules). ✓
- `tsc -p tsconfig.app.json --noEmit` → EXIT=0 (`/tmp/tcpt2.log`). ✓
- `tsc -p tsconfig.node.json --noEmit` → EXIT=0. ✓

⚠️ MEMORY LESSON (cost ~15 min): the FIRST app-tsconfig typecheck returned **EXIT=137**,
an OOM SIGKILL, with an EMPTY error log. **EXIT=137 is NOT a pass** — an empty error list
from a killed process proves nothing (same class of trap as an empty `bad:[]` on a blank
page). Fix: `tmux kill-session -t web` AND `-t mob` first (Metro 512MB + Vite 453MB), which
took available RAM 874MB → 1852MB, then tsc completed EXIT=0. Restart both servers after.
The `google-chrome` on port 9222 with profile `/home/user/.scripts/.chrome-profile` is a
SYSTEM/scripts chrome (~92MB) — not mine, leave it alone; my old `pkill -f
"remote-debugging-port=934[7]"` matched nothing.

Browser-verified signed out via `/tmp/cdp_anon.mjs` + `/tmp/steps_help_ptbr.json`, WITH the
identity assertion, all three screenshots eyeballed:
- `/help` → RENDERED, len 1812, has404 false, h1 "Como podemos ajudar?", all category
  titles pt-BR, card counts 6/10/11/10 correct. `/tmp/ptbr_help_index.png`
- `/help/delivery-routes/live-dispatch` → h1 "Despacho ao vivo", gate "Delivery Pro"
  present, **engLeak false**. `/tmp/ptbr_help_dispatch.png`
- `/help/teamspace/roles-and-permissions` → h1 "Funções e permissões",
  Proprietário/Admin/Gerente/Campo table renders, **engLeak false**.
  `/tmp/ptbr_help_roles.png`
The `engLeak:false` checks matter: they prove the pt-BR catalog is actually being served
rather than silently falling back to English. And because the pages render at all,
`assertHelpIntegrity()` (DEV-only, in `registry.ts`) did NOT throw → all 59 `see()`
cross-refs resolve.

Fact-check done before translating: every plan-gating claim in `en/delivery-routes.ts` was
checked against verified product facts — dispatch/smart optimizer = Delivery Pro+, silent
local fallback, driver counts (Lite 2 / Pro 5 / Fleet 15 / 30 / 200 / 500), 300-stop paste
cap, geocode statuses + manual pin never overwritten + Canada bias, the six failure
reasons, photo hard-required on delivered/failed, skip = only close with no photo. **No
contradictions found, nothing forked.** Kept verbatim on purpose: the CSV parser accepts
header names in **English or French only** (address/adresse, name/nom, email/courriel,
phone/téléphone, reference/commande, notes/remarques) — pt-BR does NOT imply Portuguese
headers work.

NEXT LANGUAGES: de, it, pl, zh, vi, tl, **ar last (only RTL locale)**. Same recipe; local
export names stay identical, only the aggregate changes (`deCategories` etc.).

## ITEM 21 — Portuguese CSV/paste column headings (Luc: "do it.")

CODE COMPLETE, gates green, browser check pending.

Edited `packages/web/src/web/lib/parse-stops.ts` (338 -> 358 lines), three changes:
1. `normalizeHeader()` now strips diacritics (`NFD` + `\p{Diacritic}`), so "téléphone" and
   "telephone", "endereço" and "endereco" fold to the same key. Brazilian exports ship both.
2. New `HEADER_INDEX` — a Map built once at module load by folding every alias through the
   same `normalizeHeader`, resolved in `FIELD_ORDER` so the first field to claim a word keeps
   it (first-wins, `if (!index.has(key))`). `mapHeader()` is now a single Map lookup instead
   of a nested `includes()` scan over 6 arrays.
3. Portuguese aliases added to all six fields. Address gets the whole Brazilian split
   (logradouro, número, complemento, bairro, cidade, município, estado, uf, cep, país) because
   BR sheets split the address more than any other locale.

COLLISION HANDLED: PT "nota"/"nota fiscal" (the invoice) -> `reference`, while EN
"note"/"notes" stay on `notes`. Different folded keys, so neither hijacks the other.

Verified with `/tmp/tps.ts` (bun, imports the real module), 6 cases, all correct:
- PT accented + commas -> all 6 fields mapped, address rejoined from endereço/cidade/estado/cep
- PT unaccented + semicolons ("endereco;bairro;cidade;nome do cliente;celular;nota fiscal;obs")
- PT tabs (logradouro/numero/municipio/destinatario/whatsapp/referencia/detalhes)
- EN regression -> unchanged
- FR regression (adresse;ville;code postal;nom;courriel;téléphone;commande;remarques) -> unchanged
- no-header Canadian list -> "E1A 4H2" still NOT a recipient name; "Dave Crew" still is
All 6: `ignoredColumns []`, `skipped 0`.

Help copy updated in FOUR locales (the "English or French" sentence was about to become
false), each now listing the PT tokens AND stating accents are optional:
- `en/delivery-routes.ts:150`, `fr-CA/:168`, `es/:180`, `pt-BR/:177`

Gates: root `bun run lint` 0/0 · `tsc -p tsconfig.app.json --noEmit` EXIT=0 (`/tmp/tcpt3.log`,
killed web+mob first per the RAM lesson) · `tsc -p tsconfig.node.json --noEmit` EXIT=0.
web restarted, HTTP 200. mob NOT yet restarted.

NEXT: browser test — sign-in harness /tmp/cdp7.mjs on route rte_MTPAPYVOR0XA61W4JP, paste a
PT-headed list into the "Add stops" textarea (aria-label = t("routes.addTitle")), assert the
preview shows the recognised header row + correct name/email/phone columns. React controlled
input: native setter + dispatchEvent(new Event('input',{bubbles:true})).
Then ITEM 22 = German Help Center.

### ITEM 21 — browser check DONE ✅
`/tmp/cdp7b.mjs` (copy of cdp7 with a 80s chrome-startup wait — the 12s loop failed once
because chrome came up in state D on a loaded box; kill the stale pid and delete
/tmp/cdpprof7/Singleton{Lock,Socket,Cookie} before retrying).
Route `/app/routes/rte_MTPAPYVOR0XA61W4JP`, steps `/tmp/steps_ptheaders.json`.
Identity asserted: RENDERED true, len 652, has404 false, signedIn true, h1 "Unassigned test
— assign me", BUSINESS · OWNER. Pasted a 2-row PT accented list.
Preview reported: "2 stops ready", "Comma separated", "Header row detected and skipped:
endereço, cidade, estado, cep, nome, e-mail, telefone, pedido, observações", table rows
Ana Souza / ana@ex.com / 11 98888-7777 and Carlos Lima / carlos@ex.com / 11 97777-1234,
addresses rejoined "12 Rua das Flores, São Paulo, SP, 01310-100". No ignored columns, no
skipped rows. Screenshot `/tmp/pt_headers_preview.png` eyeballed — matches.
ITEM 21 is COMPLETE and verified.

## ITEM 22 — German Help Center (STARTED — vocabulary harvested, no files written yet)

Ground-truth vocabulary harvested from `packages/web/src/web/i18n/de.ts` (line refs):
- Roles (home.team.b1:204): **Inhaber, Admin, Manager, Feld**. NOT "Eigentümer" for the role
  name, even though billing.youOwner:434 says "Sie sind der Eigentümer." — role label = Inhaber.
- Route statuses (938-942): **Entwurf / Zugewiesen / Läuft / Abgeschlossen / Storniert**
- Modes (975-978): **Geplant** / **Disposition**
- Nav (4-13, 828, 930): Teambereich · Projekte · Karte · Vorher / Nachher · Berichte ·
  Freigabe-Links · Team · Wasserzeichen · Tarif · Nachrichten · Touren · Admin-Konsole
- Routes: Stopps (955), "Reihenfolge optimieren" (962)
- share.title:340 "Freigabelinks" (no hyphen) vs nav.share:9 "Freigabe-Links" — use each
  where the UI uses it; do not normalise.
- photo.* (453-466): Gerätezeit · Netzwerkzeit · Zeitquelle · Uhrabweichung · Genauigkeit ·
  Gerät · Inhalts-Hash · Signatur · Aufnahmeort · "Siegel intakt" / "Siegel gebrochen"
- verify.* (775-808): Fotocode · Hash · Auftrag · **Workspace** (verify.workspaceLabel:800 keeps
  the English word) · "Gesperrt und verifiziert" / "Gesperrt, Zeit unbestätigt" ·
  "Netzwerkverifiziertes Original" · "Datensatz gesperrt" · Feld-App holen
- perm.* (821-824): "Manager-Zugriff erforderlich", "Nur Manager und höher …"
- profile.workspaceHint:912 uses **Arbeitsbereich** in prose while verify uses **Workspace**
  in the field label. Follow each surface — prose Arbeitsbereich, verify table Workspace.

⚠️ CONFLICT WITH THE OLD RECIPE: the handover said keep `Teamspace` verbatim in every locale,
but `nav.teamspace` in de.ts is **"Teambereich"**. The German UI genuinely translates it, so
German help prose must say Teambereich — the user never sees the word "Teamspace" in the
German app. (fr-CA/es/pt-BR kept it because THEIR catalogs kept it. Verify per locale.)
Category/article slugs stay `teamspace` regardless.

Still to do: 8 category files + index.ts in content/de/ (59 articles:
getting-started 6 · mobile-app 10 · teamspace 11 · delivery-routes 10 · verify 4 ·
plans-billing 6 · troubleshoot 8 · legal 4), validator -> total 59 / BAD: none, then register
`de: deCategories` in content/index.ts, gates, browser check with geocliks.locale='de'.

## ITEM 23 — landing: section 04 moved under 05 (Luc, 2026-09-08)

`pages/index.tsx`: swapped `<Field />` and `<Delivery />` in the `Index` composition, so DOM
order is now evidence, teamspace, reports, **delivery, field**, pricing.
Also swapped the stripe backgrounds so the alternating rhythm survives: `#delivery` now
carries `bg-ink-2/40`, `#field` is plain. (Without this, reports and delivery were both plain
and sat adjacent.)
Kickers renumbered in ALL 11 web catalogs via a guarded python regex on the two values only:
`home.delivery.label` 05 -> 04, `home.field.label` 04 -> 05. No keys added, parity still OK
(1093 keys, all 11 identical). FEATURE_ITEMS needed no change — it has #field but not
#delivery.
Verified in browser (`/tmp/cdp_anon.mjs` + `/tmp/steps_order.json`, locale forced to en):
sectionOrder ["evidence","teamspace","reports","delivery","field","pricing"], kickers
01 TAMPER-PROOF / 02 TEAMSPACE / 03 ONE CLICK / **04 DELIVERY SERVICE / 05 BUILT FOR THE
FIELD** / 06 PLANS, deliveryAboveField true. Screenshots /tmp/order_delivery.png and
/tmp/order_field.png eyeballed. lint 0/0.

## ITEM 24 — German Help Center (in progress) + TERMINOLOGY REVERSAL

### ⚠️ I REVERSED TWO EARLIER DECISIONS. Evidence-based. Applies to ALL remaining languages.

Method: count the term in the locale's own `i18n/<loc>.ts` and follow the majority.
Do NOT derive vocabulary from a handful of occurrences as I did the first time.

Counts in `packages/web/src/web/i18n/de.ts`:
- **Workspace 46 vs Arbeitsbereich 4** -> use **Workspace** everywhere, incl. prose
  ("Erstellen Sie Ihren Workspace", "Zurueck zum Workspace", "Gesamter Workspace").
  My earlier handover rule "prose uses Arbeitsbereich" was BACKWARDS - derived from the 4-count minority.
- **Teamspace 49 vs Teambereich 5** -> use **Teamspace**. This REVERSES the Teambereich
  decision I flagged to Luc. The original recipe (keep Teamspace verbatim) was right.
  Teambereich is only the nav label (`nav.teamspace`); keep it ONLY when quoting that label.
- **Plan 53 vs Tarif 10** -> use **Plan**, not Tarif. (`billing.current` = "Aktueller Plan".)
  Note the app is internally inconsistent: `plans.ownerOnly`:665 says "Workspace-Inhaber ... Tarif",
  `billing.ownerOnly`:435 says "Workspace-Eigentuemer ... Plan". Majority wins -> Plan.
- **Inhaber 6 vs Eigentuemer 3** -> keep **Inhaber** for the role name.

Both German loanwords are masculine like the words they replace, so der/den/dem/des stayed
grammatical under a plain stem replace. Genitive Arbeitsbereichs -> Workspaces (natural).

Applied to the 3 already-written files via guarded python (asserted see() refs + slug counts
unchanged): getting-started.ts, verify.ts, legal.ts. Leftover count of the three banned
terms is 0 in every de file. Backups: /tmp/bak_gs.ts /tmp/bak_vf.ts /tmp/bak_lg.ts

### Real German UI button labels (quote these, do not invent)
- Free trial -> **"Kostenlos testen"** (`home.pricing.freeTrial`:271)
- Switch to {plan} -> **"Zu {plan} wechseln"** (`billing.switchTo`:431)
- Talk to us -> **"Sprechen Sie mit uns"** (`billing.talk`:428)
- Current plan -> "Aktueller Plan" (`billing.current`:423)

### Progress: 5 of 9 files written
DONE: getting-started.ts(229) verify.ts(210) legal.ts(288) plans-billing.ts(333) mobile-app.ts(396)
TODO: troubleshoot.ts(8 art) teamspace.ts(11 art) delivery-routes.ts(10 art) index.ts(LAST)
`de/` is still NOT registered in content/index.ts - correct and safe, nothing imports it.

### Per-file structural check I ran after each write (all passed)
```
f=<name>; cd packages/web/src/web/help/content
for k in 'slug:' 'icon:' 'see('; do diff <(grep -o "$k.*" en/$f.ts) <(grep -o "$k.*" de/$f.ts); done
# block parity:
grep -oE '\b(p|h|ul|steps|note|warn|table|see)\(' en/$f.ts|wc -l   # must equal de
grep -cE 'Arbeitsbereich|Teambereich|Tarif' de/$f.ts               # must be 0
```
NOTE: do NOT check imports with `grep -o 'import.*'` - it also matches the English word
"important" in prose and gives a false MISMATCH. Use `head -1` / `cat -A` instead.

## ITEM 24 (cont.) — German Help Center COMPLETE, 9 of 9 files

All nine files exist in `packages/web/src/web/help/content/de/`:
getting-started 229 / verify 209 / legal 288 / plans-billing 333 / mobile-app 396 /
troubleshoot 408 / teamspace 549 / delivery-routes 609 / index 34.
Cross-ref validator: **total 59, BAD: none**. `de: deCategories` is now REGISTERED in
`content/index.ts` (import + CATALOGS + trailing export).

Typos found on review and fixed in `de/delivery-routes.ts`:
`üblliche` -> `übliche`; `...halben Tour endet` -> `...halben Tour enden`.
(Earlier same class: `einen Belegkommen` in plans-billing, `einen grobe Gegend` in troubleshoot.)

`see(` structural diff reports MISMATCH on this file **only because of line wrapping** —
multi-line `see(` calls. Compare the extracted string args instead:
```
python3 -c 'import re;f=lambda p:[tuple(re.findall(chr(34)+"([^"+chr(34)+"]+)"+chr(34),g)) for g in re.findall(r"see\(\s*((?:\"[^\"]+\"\s*,?\s*)+)\)",open(p).read())];print(f("en/delivery-routes.ts")==f("de/delivery-routes.ts"))'
```
-> True (10 groups both sides).

### TERMINOLOGY REVERSAL (evidence-based, reverses my own earlier call)
Method: count the term in that locale's own `packages/web/src/web/i18n/<loc>.ts`, follow the majority.
In `i18n/de.ts`: Workspace 46 vs Arbeitsbereich 4 · **Teamspace 49 vs Teambereich 5** ·
Plan 53 vs Tarif 10 · Inhaber 6 vs Eigentümer 3.
=> Use **Workspace, Teamspace, Plan, Inhaber** everywhere including prose. `Teambereich` is
only the nav label (`nav.teamspace`) and is kept ONLY when quoting that label. Both loanwords
are masculine so der/den/dem/des stay grammatical; genitive is `Workspaces`.
Applied to getting-started/verify/legal via a guarded script (asserted see() refs + slug counts
unchanged). Banned-term count is 0 in every de/ file. Backups /tmp/bak_{gs,vf,lg}.ts.
Integrity words: **Verifiziert / Unbestätigt / Manipuliert**.

### FINDING — the Team screen is untranslated in every locale
`packages/web/src/web/pages/app-team.tsx` is 667 lines with only 17 `t()` calls: "Members",
"Pending invites", "Invite a crew member" are hardcoded English. So `de/teamspace.ts`
deliberately writes German prose around the real English labels
(`Öffnen Sie „Team" und wählen Sie „Invite a crew member".`) — accurate to what the user sees.
t()-counts measured: app-team 17/667 (bad), app-map 8/105, app-compare 25, app-projects 29,
app-share 32, app-templates 34, app-reports 36, app-messages 50. Only app-team is materially bad.
Fixing = new i18n keys x 11 catalogs -> out of scope, flagged to Luc as a follow-up.

## ITEM 25 — German CSV/paste header aliases (same pattern as ITEM 21)

`de/delivery-routes.ts` claims the parser reads German columns. It did NOT.
`packages/web/src/web/lib/parse-stops.ts` had zero German aliases; only `Adresse`, `Name`,
`E-Mail` worked by coincidence with existing EN/FR entries. Shipping the German article without
this would have been a false claim.

Added to `HEADER_ALIASES` (six sequential `edit` calls, one per field — never batch two edits to
one file in a parallel round):
- addressRaw += anschrift, lieferadresse, zieladresse, straße, strasse, str, hausnummer, nr,
  stadt, ort, wohnort, plz, postleitzahl, bundesland, land
- recipientName += empfänger, empfanger, empfaenger, kunde, kundenname, ansprechpartner
- recipientEmail += e-mail-adresse, emailadresse, mailadresse
- recipientPhone += telefon, telefonnummer, handy, handynummer, mobil, festnetz, rufnummer
- reference += referenz, bestellung, bestellnummer, auftrag, auftragsnummer, rechnung,
  rechnungsnummer, sendungsnummer, lieferschein
- notes += notiz, notizen, bemerkung, bemerkungen, anmerkung, anmerkungen, hinweis, hinweise,
  kommentar, anweisungen

Two German-specific traps, documented in code comments:
1. **`ß` is not a diacritic.** `normalizeHeader()` does NFD + strip `\p{Diacritic}`, which leaves
   `ß` intact, so `straße` and `strasse` are DIFFERENT keys — both must be listed.
2. `empfänger` folds to `empfanger`, **never** to `empfaenger`. Hand-transliterated umlaut
   columns need their own entry. All three spellings listed.
No collisions: `FIELD_ORDER` + `if (!index.has(key))` is first-claim-wins and none of the German
words already existed in the index.

Verified with `/tmp/tps_de.ts` (`bun run /tmp/tps_de.ts`), 6 cases all pass:
umlaut headers/comma, transliterated/semicolon, tabs — each 0 ignored columns, 0 skipped rows —
plus EN/FR/PT regressions unchanged against `/tmp/tps.ts` expectations.

Help copy updated to name German in the accepted-header sentence:
`en/delivery-routes.ts`, `fr-CA/`, `es/`, `pt-BR/` (one `p()` line each). `de/` already said it.

### GATES + BROWSER VERIFICATION (both done, all green)
- root `bun run lint`: 0 warnings, 0 errors.
- `tsc -p tsconfig.app.json --noEmit` **EXIT=0** and `tsc -p tsconfig.node.json --noEmit` **EXIT=0**
  (killed `web`+`mob` first to free RAM; EXIT=137 would have been an OOM, not a pass).
  This also covers the ITEM 23 landing-reorder typecheck that was outstanding.
- Dev servers restarted after: web=200, mobile=200.
- German help, signed out, `/tmp/cdp_anon.mjs` + `/tmp/steps_help_de.json`, locale forced `de`:
  `/help` (h1 "Wie können wir helfen?", all 8 categories German, engLeak false),
  `/help/delivery-routes/live-dispatch`, `/help/teamspace/roles-and-permissions`,
  `/help/delivery-routes/add-stops-by-pasting-a-list` — all RENDERED, has404 false, engLeak false,
  banned-terms false, both typos confirmed absent. 4 screenshots eyeballed
  (`/tmp/de_help_{index,dispatch,roles,paste}.png`). Locale key removed at the end.
- German paste, signed in, `/tmp/cdp7b.mjs` + `/tmp/steps_deheaders.json`, on
  `/app/routes/rte_MTPAPYVOR0XA61W4JP`: header `straße,hausnummer,plz,stadt,empfänger,e-mail,
  telefon,bestellnummer,notizen` -> **"2 stops ready", "Header row detected and skipped", NO
  ignored-columns line**, addresses assembled `Hauptstraße, 12, 10115, Berlin`, names/emails/
  phones correct with umlauts. `/tmp/de_headers_preview.png` eyeballed.
  Note: the preview table only renders Address/Name/Email/Phone, so `reference`/`notes` are not
  visible there — they are covered by `/tmp/tps_de.ts` instead. Same as the PT run.

### STATE: German is DONE. Next language: it, then pl, zh, vi, tl, ar LAST (only RTL).
For each: majority-count its vocabulary in `packages/web/src/web/i18n/<loc>.ts`, and check whether
that language's CSV headers need aliases in `lib/parse-stops.ts` (the ITEM 21/25 pattern).

## ITEM 26 — Team screen i18n (app-team.tsx) — IN PROGRESS

**Why:** `pages/app-team.tsx` was 668 lines with only 17 `t()` calls. "Members", "Pending invites",
"Invite a crew member" etc. rendered in English in all 11 locales. Luc approved the fix ("do it").

**Verified first:** `lib/i18n.tsx` `t()` already supports `{name}` interpolation via `fill()`
(`template.replace(/\{(\w+)\}/g, …)`), signature `t(key, vars?)`. So no string splitting is needed.

**DONE:**
- `/tmp/addteamkeys.py` fixed (junk `io.open("/dev/null")` expression removed, `import json`/`re`
  hoisted) and RUN. Inserted **46 `team.*` keys x 11 locales** = 506 strings.
- Key parity re-verified: **EN total 1139**, all ten other locales `missing [] extra [] dups 0`.

**DECISION — role names stay ENGLISH.** `components/role-badge.tsx` carries an explicit comment:
role names are workspace vocabulary, not prose, so they stay untranslated (matching the
`BUSINESS / FIELD` plan chip). I did NOT reverse that unilaterally. So `RoleBadge`, the role
`<select>` options and the invite-form role buttons stay English; the role **hints** (`ROLE_HINT`)
are prose and ARE translated. Help-article prose keeps German role words (that is prose).

**Two deliberate copy compromises:** `team.scanJoins` and `team.projectLevelBody` each highlighted
a word or two with `<span className="text-chalk">`. Splitting them into fragments would wreck word
order in 11 languages, so they are single keys rendered as plain text and those words **lost the
colour highlight**.

**Accessibility bug fixed in passing:** the member role `<select>` had `aria-label="Field"`; it is
now `team.roleAria` ("Role").

**Reused rather than duplicated:** `project.crewAccess` (already in all 11 catalogs) is passed into
the `{crew}` placeholder; `appearance.light`/`appearance.dark` are passed into `{theme}`.

**Gates for this item:** key parity (done) · `bun run lint` · `tsc -p tsconfig.app.json --noEmit`
EXIT=0 (NOT 137) · browser-verify `/app/team` signed in via `/tmp/cdp7b.mjs` with
`geocliks.locale='de'`, asserting German renders and no English leaks.

### ITEM 26 — GATES ALL GREEN (verified)
- `app-team.tsx` now 679 lines, **55 `lang.t(` calls** (was 17). No hardcoded English left on a sweep.
- Key parity: **EN total 1139**, all ten other locales `missing [] extra [] dups 0`.
- `bun run lint`: **0 warnings / 0 errors**.
- `tsc -p tsconfig.app.json --noEmit`: **EXIT=0** (run twice — after the main pass and again after the
  final `appearance.light/dark` edit). Genuine pass, not a 137 OOM.
- Dev servers back up: **web=200, mobile=200**.
- Browser: `/tmp/cdp7b.mjs` + `/tmp/steps_team_de3.json`, signed in, `geocliks.locale='de'` on
  `/app/team` → `h1:"Team"`, `has404:false`, Mitglieder / Offene Einladungen / Arbeits-E-Mail /
  Plätze / Hell+Dunkel all true, **`engLeak:false`**. Screenshot `/tmp/de_team2.png` eyeballed.

**BONUS FIX found by eyeballing the screenshot:** the admin "Workspace-Standard" theme buttons
rendered the raw `{item}` values `LIGHT`/`DARK`. Now `lang.t("appearance.light"/"appearance.dark")` —
no new keys needed, those already existed in all 11 catalogs. This was NOT in the original 46.

⚠️ **VITE STALE-TRANSFORM TRAP (new, cost 2 browser runs):** after editing a page, vite kept serving
the OLD transform — file watching did not invalidate. The assertion and the screenshot both showed
the pre-edit text while `grep` on disk showed the new code. **Confirm what the server actually
serves** with `curl -s http://169.254.0.21:4200/src/web/pages/<file>.tsx | grep <newcode>`; if it is
stale, **restart the `web` tmux session** — that clears it.

### STATE: ITEM 26 DONE. Next: Italian Help Center (then pl, zh, vi, tl, ar LAST).

---

## ITEM 27 — Mobile drawer + tab bar (Luc, 2026-09-08) — DONE, ALL GATES GREEN

Luc's four requests (sent with a screenshot of the hamburger drawer, red annotations "remove" on the
UPGRADE bar and an arrow dragging MY TEAMSPACE to the top):

1. Move **My Teamspace** to the top of the drawer, under the profile.
2. **Remove the Upgrade tab.**
3. Add **Terms of service** and **Privacy & policy** under Contact us.
4. In the mobile footer (tab) menu, **remove Projects, Map, Teamspace**.

### Files changed

**`packages/mobile/lib/web-help.ts`** — split `webHelpUrl()` into a thin wrapper over a new exported
`webUrl(path)`, so the drawer can link `/terms` and `/privacy` against the same `extra.apiUrl` base
(a staging build hits staging's legal pages). `webHelpUrl()` behaviour unchanged — it now returns
`webUrl("/help")`. `webUrl` normalises the leading slash and strips the base's trailing slash.

**`packages/mobile/components/profile-menu.tsx`** (379 lines) —
- Upgrade bar block deleted (`org.data?.role === "field" ? null : (<Pressable … profile.upgrade …)`).
- `MY TEAMSPACE` section + workspace card **moved into the slot the upgrade bar vacated**: directly
  under the profile identity `Pressable`, above `<View style={styles.tiles}>`. Card markup is
  byte-identical to before (`styles.card, styles.workspace`, `shield-checkmark`, `PLAN · members · ROLE`).
- Two rows added right after `profile.contact` in the same settings card: `home.footer.terms` →
  `webUrl("/terms")` and `home.footer.privacy` → `webUrl("/privacy")`, both `open-outline` (they leave
  the app, matching the Help center row above them).
- Dead `upgrade:` / `upgradeText:` entries removed from `StyleSheet.create`.

Final drawer order by line: profile 161 → MY TEAMSPACE 185 → tiles 211 → show-stamp 233 →
Help center 250 → Contact us 259 → Terms 269 → Privacy 278 → Sign out 285.

**`packages/mobile/app/(tabs)/_layout.tsx`** — `teamspace`, `map`, `projects` collapsed to one-liners
with **`href: null`**. Tab bar is now **Capture · Messages · Routes**.

### ⚠️ THE DECISION THAT MATTERS — `href: null`, NOT deletion

Those three `Tabs.Screen` entries were **hidden, not removed**. `href: null` drops the tab without
unregistering the route, so existing links still resolve. This is load-bearing:
- the drawer `TILES` array still links `/projects`, `/teamspace`, `/map`;
- the moved workspace card's `onPress` is `go("/teamspace")`.
Deleting them breaks the drawer. The repo already uses this exact pattern for Settings ("Settings
keeps its route - it lives in the hamburger drawer now, not the tab bar"). **Keep `href: null`.**

### Other decisions

- **No new i18n keys.** `home.footer.terms` = "Terms of service" and `home.footer.privacy` =
  "Privacy & policy" already existed — exactly Luc's wording — and are present **and translated** in
  all 12 mobile catalogs (de: Nutzungsbedingungen / Datenschutz & Richtlinien; it: Termini di
  servizio / Privacy e policy). This dodged the 12-catalog parity constraint entirely.
  **Do not add new keys for these.**
- Removing the upgrade bar **orphans nothing** — `TILES` still has `{ href: "/plans", label: "nav.plan",
  managerOnly: true }`, so the Plan screen is still reachable (visible as the "Plan" tile).
- The now-unused `profile.upgrade` key was **left in all 12 catalogs** — harmless, and removing it
  would mean 12 file edits for nothing.

### GATES — ALL GREEN (verified this session)

- `bun run lint` → **0 warnings / 0 errors**.
- Mobile typecheck `tsc --noEmit -p packages/mobile/tsconfig.json` → **EXIT=0** (genuine, not a 137 OOM;
  killed `web`+`mob` first to free ~1 GB).
- **Metro bundle check** (the real proof for the `webUrl` import change): `http=200 bytes=8906643`,
  **no `UnableToResolveError`**, `webUrl` ×5 and `home.footer.terms` ×12 present in the bundle.
- **Browser, signed in, 390×844** — drawer opened and screenshotted (`/tmp/mob_drawer.png`, eyeballed):
  MY TEAMSPACE card sits directly under the profile, **no Upgrade bar**, Terms + Privacy sit under
  Contact us. Index order asserted: teamspace 470 < tiles 527 < help 657 < contact 671 < terms 684 <
  privacy 703 < signout 724. `upgradeGone: true`.
- **Tab bar** (`/tmp/mob_signedin.png`, eyeballed): exactly **Capture · Messages · Routes**.
- **`href: null` regression test** — from the drawer, tapped Projects → `/projects`, Map → `/map`,
  Teamspace → `/teamspace`, all `has404: false`; `/tmp/mob_nav_teamspace.png` shows the full Teamspace
  screen rendered with the 3-item tab bar still beneath it.

### NEW TOOL — `/tmp/cdp_tap.mjs` (reusable, port 9353, profile `/tmp/cdpprof_tap`)

⚠️ **React Native Web ignores synthetic `element.click()`** — Pressables listen to pointer/mouse
events. The old harnesses could not drive the Expo web preview at all. `/tmp/cdp_tap.mjs` adds real
`Input.dispatchMouseEvent` taps and `Input.insertText` typing:
`{"tapText":"Login"}`, `{"tapSel":"input[type=email]"}`, `{"tap":[x,y]}`, `{"type":"..."}` alongside
the usual `js` / `wait` / `shot`.
- The drawer trigger is `[aria-label="Menu"]` (`profile.menu`).
- **The profile persists the session** — a second run finds no Login button (`TAPTEXT: NOT FOUND
  Login` is then expected, not a failure).
- Expo web needs **long** waits: ~40 s landing, ~30 s sign-in screen, ~55-60 s after submit.
- Tab screens **stay mounted**, so `body.innerText` keeps leading with the Capture screen after
  navigating. Trust `location.pathname` + the screenshot, not the leading text.
- Step files: `/tmp/steps_mob_drawer.json` (login → drawer → assert order), `/tmp/steps_mob_nav.json`
  (drawer → Projects/Map/Teamspace regression).

### STATE: ITEM 27 DONE and reported. Next: Italian Help Center (then pl, zh, vi, tl, ar LAST).

---

## ITEM 28 — Capture screen: Project + Evidence type side by side (Luc, 2026-09-08) — DONE

`packages/mobile/app/(tabs)/index.tsx`. The two dropdown heads were stacked full-width rows; they
now share one row.

- New styles `selectorRow` (`flexDirection: row, gap: 8, marginTop: 6`) and `selectorHalf`
  (`flex: 1, minWidth: 0`, **column** layout, `marginTop: 0`).
- ⚠️ `dropdownHead` is `flexDirection: row` + `space-between` (label left, value right). At half
  width "EVIDENCE TYPE" + icon + value + chevron does NOT fit across ~175 px, so `selectorHalf`
  **overrides it to a column** — label above value. Do not drop that override.
- Project value lost its hardcoded `maxWidth: 170` in favour of `flexShrink: 1`; the tag value
  gained `numberOfLines={1}` + `flexShrink: 1`.
- **Both option grids stay full-width BELOW the row** (`tagGrid, projectOpen` then `tagGrid, tagOpen`),
  outside `selectorRow`. Only the two heads moved into the row.

Gates: `bun run lint` 0/0 · mobile `tsc --noEmit` **EXIT=0** · browser 390×844 signed in,
`/tmp/steps_mob_selectors.json` — EVIDENCE TYPE label measured at x=264 (right half of a 390 screen),
screenshots `/tmp/mob_selectors.png` and `/tmp/mob_selectors_open.png` eyeballed: side by side, the
tag grid still opens full width beneath, head highlights amber with chevron-up. Freed one row of
vertical space on the capture screen.

---

## ITEM 29 RESEARCH — anonymous capture (Luc's items 2 + 3) — NOT BUILT (decision RESOLVED, see ITEM 30)

Luc asked: (2) signed-out users should land on the Capture camera and be prompted to register/login
for anything else; (3) photos taken while signed out save locally like a normal camera, then upload
into the Teamspace automatically on register/login.

### What already exists and helps

- **`packages/mobile/lib/queue.ts` is a real AsyncStorage offline queue** (`enqueue`, `readQueue`,
  `drainQueue`, `uploadOne`, `dequeue`, `markError`, key `geocliks.queue.v1`) built for dead-zone
  capture: capture now, upload later. `drainQueue` is already called from `app/(tabs)/index.tsx`,
  `app/queue.tsx` and `app/route/[id].tsx`. Anonymous capture is the same shape — enqueue with
  `projectId: null`, drain after sign-in.
- Gating lives in **one place**: `Gate()` in `packages/mobile/app/_layout.tsx`, which redirects
  `!session && !inPublicFlow` to `/landing`. `inPublicFlow` is `sign-in | sign-up | auth | landing |
  verify | join`. Item 2 is essentially: make `(tabs)/index` public, land there instead of
  `/landing`, and gate the other tabs/drawer entries behind a register/login prompt.

### 🚨 THE BLOCKER — delayed uploads are marked UNVERIFIED

`packages/web/src/api/routes/photos.ts:197-198`:
```ts
const verifiedAt = Date.now();          // server clock at UPLOAD
const skew = input.capturedAt - verifiedAt;   // device clock at CAPTURE
```
and `lib/verify.ts`: `SKEW_TOLERANCE_MS = 5 * 60 * 1000`, `timeSourceFor()` → `network` only when
`|skew| <= 5 min`, and the row is written with
`integrity: Math.abs(skew) <= SKEW_TOLERANCE_MS ? "verified" : "unverified"`.

**`skew` is therefore the upload delay, not a device-clock lie.** The server cannot tell "phone clock
was wrong" from "photo was uploaded late". Confirmed there is **no network-time sync anywhere in the
mobile app** — `app/(tabs)/index.tsx:281` is a bare `const capturedAt = Date.now()`.

Consequences:
1. **Item 3 as literally asked would mark every anonymous photo `unverified` / `timeSource: device`**
   once the user registers hours or days later — the exact opposite of the product promise, and on
   the very first photos a new user ever sees.
2. **This is already a live bug for the existing offline queue.** A delivery photo captured in a dead
   zone and drained more than 5 minutes later is stamped `unverified` today. That hits Luc's core
   delivery-route use case.

### The fix that makes item 3 safe (and repairs the queue bug)

Record a **trusted capture time** on the device instead of trusting `Date.now()` at upload:
- On any successful API call while online, store `offset = serverTime - Date.now()` (the server
  already returns a date header / can return its clock).
- At capture, persist `capturedAt` **and** that offset + whether it was fresh.
- Server: compute skew against the *offset-corrected* capture time, and record upload delay in a
  **separate** column (e.g. `uploadDelayMs`) that does NOT feed `integrity`.
- Requires a migration + touching the HMAC payload only if the corrected time replaces `capturedAt`.

**Do not build item 3 without deciding this first** — otherwise the feature ships evidence that says
"Unverified" on it.

### STATE: item 1 (ITEM 28) shipped. Items 2 + 3 researched, NOT built, awaiting Luc's decision.

---

## ITEM 30 — Clock / verification fix — SHIPPED AND VERIFIED (2026-09-08)

Luc's decision this round (this superseded the "blocked" note on ITEM 29):
1. Anonymous capture: **fix the clock/verification logic FIRST**, then build anonymous capture.
2. The dead-zone bug: **"Fix it now, before anything else — it's hitting real delivery jobs."**
3. Signed-out camera: **fully usable camera**, register/login prompt only on everything else.

Work order therefore: **(A) clock fix → (B) anonymous capture #3 → (C) signed-out landing + gating #2.**
**(A) is now DONE. (B) and (C) are still NOT started.**

### The bug that was fixed

`packages/web/src/api/routes/photos.ts` computed `skew = capturedAt - Date.now()` at upload, so the
"device clock error" was really **the upload delay**. A delivery photo captured in a dead zone and
drained more than 5 minutes later was stamped **Unverified** — on real delivery evidence. It would
also have marked every anonymous capture unverified on signup.

### The fix

Device records a **trusted clock offset** while online; captures carry it; the server judges the
clock by that offset instead of by upload time. Upload delay is now recorded as its own field and
**does not affect integrity**.

Files changed:
- `packages/web/src/api/database/schema.ts` — new `uploadDelayMs` (`upload_delay_ms`, integer, notNull,
  default 0) beside `clockSkewMs`; comments now state that `clockSkewMs` = `deviceTime - serverTime`
  and is NOT the upload delay.
- `packages/web/src/api/lib/verify.ts` — new `resolveClock()`, `CLOCK_SYNC_MAX_AGE_MS` (24h),
  internal `MAX_PLAUSIBLE_OFFSET_MS` (365d), types `ClockInput` / `ClockResult`.
  `SKEW_TOLERANCE_MS` and `timeSourceFor()` kept unchanged.
- `packages/web/src/api/routes/photos.ts` — `create` input gained optional `clockOffsetMs` /
  `clockSyncedAt`; skew/integrity/timeSource now come from `resolveClock`; writes `uploadDelayMs`;
  the `verified` photo event now reports clock skew AND upload delay separately. Import narrowed to
  `resolveClock, sha256, sign, verifySignature`.
- `packages/web/src/api/routes/clock.ts` — **NEW**, 15 lines. `clock.now` on `base` (public, like
  `ping`) returning `{ now: Date.now() }`. Public on purpose: a device must be able to sync before
  sign-in, which item #3 needs.
- `packages/web/src/api/index.ts` — `clock` imported and registered in `router`.
- `packages/mobile/lib/clock.ts` — **NEW**, 116 lines. AsyncStorage key **`geocliks.clock.v1`**
  storing `{ offsetMs, syncedAtDevice }`. `offset = serverTime - deviceTime`, corrected by half RTT
  (rejects RTT > 10s). Exports `readClockSync`, `syncClock`, `ensureClockSync` (re-syncs only when
  older than 30 min), `clockStampForCapture` (returns nulls when the offset is > 24h old).
  In-memory cache + `inFlight` de-dupe. Offline is treated as normal, not an error.
- `packages/mobile/lib/queue.ts` — `QueuedPhoto` gained optional `clockOffsetMs` / `clockSyncedAt`;
  `uploadOne` forwards them to `photos.create` (`?? null`, so pre-existing queued items are fine).
- `packages/mobile/app/(tabs)/index.tsx` — imports `clockStampForCapture, ensureClockSync`; a new
  mount effect calls `ensureClockSync()`; `commit()` awaits `clockStampForCapture()` and stamps the
  queued item at **shutter time**, not upload time.

### Semantics now

- `clockSkewMs` = `deviceTime - serverTime` (device clock error) = `-clockOffsetMs` when a fresh
  offset is available. Same meaning the column already had for prompt uploads, so old rows stay valid.
- `uploadDelayMs` = `max(0, verifiedAt - capturedAt)` — queue/dead-zone time only, **never** integrity.
- Freshness: the offset is trusted only if it was measured within `CLOCK_SYNC_MAX_AGE_MS` **before the
  capture** (`capturedAt - syncedAt` in `[-SKEW_TOLERANCE_MS, 24h]`). So a photo queued for a week
  still verifies, because the sync was fresh *relative to capture*.
- **Anti-forgery guard:** `capturedAt > verifiedAt + SKEW_TOLERANCE_MS` (capture claimed in the
  server's future) ⇒ **unverified regardless of the claimed offset**. A client offset is trivially
  spoofable (`offset = 0`), so this bound is what makes it safe to trust at all.
- **Old app builds send no offset ⇒ exact previous behaviour.** Deliberate: never silently trust a
  client that never proved its clock.

### ⚠️ `canonical()` WAS NOT TOUCHED — verified

Signed payload is still `photoCode|orgId|userId|storageKey|capturedAt|verifiedAt|lat|lng|contentHash`.
`git diff packages/web/src/api/lib/verify.ts` has **zero** changed lines matching canonical/payload/join.
`clockSkewMs` and the new `uploadDelayMs` are **unsigned metadata columns**. Adding either to the
signed payload would make every existing photo display as "tampered" — still the single most
dangerous mistake available in this area.

### VERIFIED (all green this session)

- `bun run lint` — 0 warnings, 0 errors, 310 files.
- Mobile `tsc --noEmit -p tsconfig.json` — **EXIT=0**, empty log, dev servers killed first (genuine pass,
  not 137). This is also what typechecks the API surface, via the `@template/web` type import.
- Web `tsc --noEmit -p tsconfig.app.json` — **EXIT=0**, empty log.
- `db:push --force` applied; confirmed by `pragma_table_info('photos')`:
  `upload_delay_ms | INTEGER | dflt 0 | notnull 1`.
- Live endpoint: `POST /api/rpc/clock/now` with **no auth header** → `http=200`,
  `{"json":{"now":1788907705184}}`, bracketed by local device readings 1788907705174 / …187.
- **Logic proof `/tmp/clocktest.ts`** — imports the real `resolveClock`, 8 scenarios, **8 passed, 0 failed**,
  each line printing what the OLD code would have said. The two dead-zone cases (1h delay, and 3 days
  queued) are `verified` now vs `unverified` before — that is the bug, demonstrated. Wrong-clock
  (±20 min), future-capture spoof, stale-sync, and both old-client cases all behave correctly.
- Metro bundle: `http=200 bytes=8913342` (baseline ≈8906643), no `UnableToResolveError`, and
  `clockStampForCapture`/`geocliks.clock.v1` appear in the bundle — the new module really is included.
  A typecheck is not a bundle check; both were run.
- Live browser, `/tmp/cdp_tap.mjs` + **`/tmp/steps_mob_clock.json`**, 390×844 signed in: capture screen
  rendered (`url:/`, PROJECT + EVIDENCE TYPE present), no error text, and **`geocliks.clock.v1` written
  to storage with `offsetMs: 97`, a real `syncedAtDevice`** — the full mobile sync path working at
  runtime, not just compiling. Screenshots `/tmp/mob_clock.png`, `/tmp/mob_clock2.png` opened and
  eyeballed; ITEM 28's side-by-side selectors still correct.

### NOT verified

- A real end-to-end capture→upload→seal on a **physical phone with a genuinely wrong clock**. The web
  preview shares the sandbox clock, so measured offset is ~97 ms; the wrong-clock branches are proven
  by `/tmp/clocktest.ts` against the real function, not by a real handset.
- No backfill was run. **Existing rows keep `uploadDelayMs = 0` and their original integrity value** —
  photos already wrongly marked Unverified stay that way. Re-evaluating them is impossible anyway:
  those rows never carried a clock offset, so there is no way to tell late upload from bad clock
  retroactively. Worth telling Luc; a bulk "re-verify" would be a guess, not a fix.

### Copy now slightly stale (NOT changed — flagged, needs a decision)

The capture screen's helper line still reads "Timestamp is verified against the network **at upload**".
After this fix it is verified against the last network **sync**, which is exactly why dead-zone photos
now pass. "Changing the device clock cannot fake it" is still true. Fixing the wording means editing
**12 mobile catalogs** (`packages/mobile/i18n/`), so it was left alone rather than silently expanding
scope. Same for any help-article wording about skew.

### STATE: (A) clock fix SHIPPED. Next: (B) anonymous capture #3, then (C) signed-out landing + gating #2.

## ITEM 31 — Anonymous capture (#3) + signed-out landing & gating (#2) — IN PROGRESS (2026-09-08)

Work order set by Luc: (A) clock fix DONE → (B) anonymous capture → (C) signed-out landing + gating.

### Design

Signed out the camera works fully. Captures go into the **existing offline queue**
(`geocliks.queue.v1`) with `projectId: null` / `templateId: null` and **no upload is attempted** —
presign + seal are session-dependent. On sign-in `hooks/use-drain-on-signin.ts` drains the queue and
the photos land in the team space. Deliberately reuses the dead-zone queue instead of a second store.

### Files DONE so far

- `packages/mobile/hooks/use-session.ts` — NEW. `useHasSession()` → `{ hasSession, pending }`.
- `packages/mobile/hooks/use-drain-on-signin.ts` — NEW. Modelled on `use-pending-invite.ts`; busy
  guard, `syncClock()` first, then `drainQueue()`, resets on sign-out, failures leave queue alone.
- `packages/mobile/app/_layout.tsx` — `useDrainOnSignIn(Boolean(session))` added next to
  `usePushToken`. Provider chain untouched (system-managed file, extended in place).
- `packages/mobile/queries/{orgs,projects,photos}.ts` — every workspace query now `enabled: hasSession`.
- `packages/mobile/app/(tabs)/index.tsx` — `useHasSession()` in the component; `commit()` branches
  **before** `drainQueue()`: signed out it sets `capture.savedLocal` and returns (no drain, no
  invalidate), keeping `setLastShot` + `setPending`. `hasSession` added to the `useCallback` deps.
- `packages/mobile/app/queue.tsx` — `drain()` returns early signed out; Upload-all button disabled;
  the note swaps to `queue.signedOutBody`.
- `packages/mobile/components/auth-gate.tsx` — NEW, 98 lines. React modal (NOT `Alert.alert`, which
  is poor on web): lock badge, `gate.title`, `gate.body`, Register free → `/sign-up`, Login →
  `/sign-in`, `gate.cancel`.
- `packages/mobile/components/profile-menu.tsx` — `go()` opens the gate instead of navigating when
  signed out; identity header swaps to a Register/Login block; the MY TEAMSPACE section + workspace
  card are dropped signed out.
- **i18n: 6 new keys × 12 mobile catalogs, all 12 now at 1043 keys** (`/tmp/addanonkeys.py`, guarded,
  pre + post key-set assert): `capture.savedLocal`, `queue.signedOut`, `queue.signedOutBody`,
  `gate.title`, `gate.body`, `gate.cancel`. Register/Login button labels REUSE the existing
  `home.nav.registerFree` / `home.nav.login`. Per-locale Teamspace vocabulary was copied from each
  catalog's own `capture.syncedOk`, not invented (de = "Teamspace", pl = "przestrzeń zespołu",
  ar = "مساحة الفريق", zh = "团队空间", vi = "Không gian nhóm", tl = "Teamspace").

### DONE — all five items above are complete (2026-09-09)

Items 1-4 of the old STILL-TO-DO list were all written and are in the tree. Item 5 (the gates) is
now finished too. Results below.

### BUG FOUND AND FIXED DURING VERIFICATION — stale queue badge

The capture header badge read the queue **once on mount** (`useEffect(..., [])`), so after
`useDrainOnSignIn` emptied the queue from the ROOT LAYOUT the badge still claimed "2 QUEUED" over a
storage value of `[]`. Caught by opening `/tmp/anon_after_signin2.png` — the JSON scan had already
returned `queueFinal: 0` and looked green. **This is the third time a screenshot caught what a scan
missed. Keep opening them.**

Fix (deliberately at the module, not the screen): `packages/mobile/lib/queue.ts` gained a listener
set + `subscribeQueue(fn)`, notified from **`writeQueue`** — the single funnel every mutation
(`enqueue`, `dequeue`, `markError`, drain) already passes through, so no caller changed. The capture
screen subscribes and returns the unsubscribe from its existing mount effect.
`app/queue.tsx` was deliberately NOT subscribed: it re-reads on mount, refreshes after its own
actions, and cannot be on screen during a sign-in drain (the gate navigates away and unmounts it).

### GATES — ALL GREEN (2026-09-09)

- `bun run lint` → 0 warnings, 0 errors, 313 files.
- Mobile `tsc -p tsconfig.json` → **EXIT=0, empty log** (servers killed first, so not a 137 OOM).
- Web typecheck NOT re-run, deliberately: no file under `packages/web/src` was touched this round,
  so ITEM 30's green run still stands. Say that plainly rather than claiming a fresh run.
- Metro bundle → `http=200 bytes=8944589`, no resolve errors; `subscribeQueue`, `auth-gate`,
  `gate.title`, `useDrainOnSignIn`, `capture.savedLocal` all present.

### BROWSER VERIFICATION — PASSED (`/tmp/cdp_tap_anon.mjs`, port 9355, fresh profile)

Step files: `/tmp/steps_anon_capture.json`, `/tmp/steps_anon_signin.json`, `/tmp/steps_anon_badge.json`.
Screenshots (all opened): `/tmp/anon_capture.png`, `/tmp/anon_capture2.png`, `/tmp/anon_gate.png`,
`/tmp/anon_savedlocal.png`, `/tmp/anon_after_signin.png`, `/tmp/anon_after_signin2.png`,
`/tmp/badge_before.png`, `/tmp/badge_after.png`.

Proven:
1. Signed out, a cold load lands on **`/`, the capture tab** — camera UI, shutter, Project +
   Evidence type side by side (ITEM 28), tab bar. No redirect to `/landing`.
2. `geocliks.queue.v1` starts null. One shutter tap → **1 item, `projectId: null`,
   `templateId: null`, `capturedAt` set**, header badge flips to "1 QUEUED", and the green
   `capture.savedLocal` line renders: "Saved on this phone — sign in to save it to your Teamspace".
   (It clears after 4 s, so assert it within ~2 s, not 6.)
3. The queue **survives a full page reload** signed out (read back as 1).
4. Tapping the **Messages** tab signed out opens the AuthGate modal — lock badge, "Create an account
   to continue", the body line, amber **Register free**, outlined **Login**, **Not now**. `preventDefault`
   holds: `location.pathname` stays `/`.
5. Gate → **Login** → `/sign-in`, sign in as the ops.admin test account → back on `/` with
   **`geocliks.queue.v1` = `[]`** and the badge back to **SYNCED**. The drain is automatic.
6. **DB proof** the photos really reached the team space — three signed-out captures, all
   `integrity: "verified"`, `project_id`/`template_id` null, `upload_delay_ms` **41137 / 171179 /
   44182**. The 171-second one is also live proof of the ITEM 30 clock fix: a long gap between
   shutter and upload no longer costs the photo its verified status.

### NOT VERIFIED — report honestly

- **The real device camera path.** Expo web has no camera, so `isNative` is false and the shutter
  goes through the sample-frame branch. The queue/gate/drain logic is proven; the native capture
  itself is not.
- **Signed-out video is gated, not queued** — `policy.data` is undefined signed out so `videoLocked`
  computes `false` and video would LOOK unlocked; `record()` opens the AuthGate instead of queueing a
  clip the server may refuse at seal time. A deliberate reading of "fully usable camera". Flag to Luc.
- **Signed-out captures arrive unassigned** (`project_id`/`template_id` null — confirmed in the DB
  above). Nobody has decided whether they should instead be filed on sign-in. Worth asking Luc.
- Real-handset clock check is Luc's to do after he updates the app on Expo.
- `queue.signedOut` was added as a signed-out empty-state title and is still **unused**.


## ITEM 32 — Personal captures page + signed-out video + wording fix (2026-09-09)

Luc's three answers drove this round:
1. Unassigned signed-out photos -> "File them under my personnel picture page that you will
   create. Those pictures can transfer to any project later if need it."
2. Signed-out video -> "Let video record without an account too, same as photos; to my video
   page ... with the same fonction share, download, assigne to a project."
3. The "at upload" wording -> "Yes, update the wording."

### DESIGN DECISION — keep this, it is deliberate

The personal page is a **virtual "unassigned" filter over the photo feed, NOT an auto-created
project**. A real project would consume one of the **three projects a free workspace gets**.
`photos.move` already exists server-side, so "transfer to any project later" needed no new
endpoint. This reasoning is a comment in `photos.ts` and in `photo-detail.tsx` — preserve it.

Related and load-bearing: `projectId` is **not** in the signed payload (`canonical()` in
`api/lib/verify.ts`), which is exactly why refiling a capture never breaks its seal.

### WHAT CHANGED

- **`packages/web/src/api/routes/photos.ts`** — `photos.list` gained `unassigned: boolean` and
  `kind: "photo" | "video"`. Visibility was **rewritten**: only `field` is project-restricted
  (`visibleProjectIds` returns null for every other role). The old code did
  `if (allowed.length === 0) return { photos: [], total: 0 }` and then `inArray(projectId, allowed)`,
  which **hid a field member's own unfiled captures**. Now it ORs in
  `and(isNull(projectId), eq(userId, context.user.id))` and the early return is gone — a field
  member with zero project assignments still has a personal page.
- **`packages/mobile/queries/photos.ts`** — filter type + **`useMovePhotos()`**.
- **`packages/mobile/app/my-captures.tsx`** (new, 243 lines) — modelled on `teamspace.tsx`
  (same `resolve()`, card layout, video poster fallback, `PhotoDetail` sheet). Pictures|Videos
  segmented toggle drives `usePhotos({ unassigned: true, kind, limit: 60 })`.
- **`packages/mobile/components/photo-detail.tsx`** — added **Download** and **Assign to
  project**. The project picker is rendered **inline, NOT as a nested Modal**: PhotoDetail is
  itself a Modal and stacking modals is unreliable on iOS. Both controls appear for every
  capture, not only unfiled ones — the sheet is shared with Teamspace and that is the right
  place for them.
- **Signed-out video** — removed the `!hasSession` gate in `record()` in `(tabs)/index.tsx`.
  `commit()` is already kind-agnostic and falls into the `capture.savedLocal` branch, so the
  clip queues exactly like a photo. Signed out there is no plan to read, so `maxSeconds` falls
  back to **30** (the Free cap) and `videoLocked` computes false.
  The capture screen's now-unreachable `<AuthGate>` (state + render + import) was **removed**.
  Checked first: the tab gate lives in `(tabs)/_layout.tsx:37` and the drawer gate in
  `profile-menu.tsx:124`, so ITEM 31's verified "tap Messages -> gate" behaviour is untouched.
- **`packages/mobile/components/profile-menu.tsx`** — `/my-captures` tile after Teamspace,
  `images-outline`, open to every role (deliberately not `managerOnly`). `/my-captures` was
  **not** added to the `_layout.tsx` public allowlist: it needs a session.
- **i18n** — 12 mobile catalogs now at **1054 keys** (from 1043) via the guarded
  `/tmp/addminekeys.py`. 11 new keys (`nav.mine`, `mine.*`). **`capture.hintSeal` reworded in
  all 12** to "...verified against the network **the moment you press the shutter**..." (answer #3).

### DOWNLOAD — SUPERSEDED BY ITEM 33, read that section too

> ⚠️ The reasoning below held only while an OTA publish was the constraint. In ITEM 33 Luc
> **explicitly authorised a full rebuild**, `expo-sharing` **was installed**, and the native
> branch now uses `Sharing.shareAsync`. The web path below is unchanged and still accurate.

`expo-file-system` is already installed; **`expo-sharing` and `expo-media-library` are NOT**, and
they were deliberately **not added**. A new native module would be autolinked into the binary,
so an **OTA JS publish onto Luc's existing build would crash on the missing module**. Instead:
- **web**: bytes are pulled into a blob and saved through an anchor (a cross-origin presigned
  URL makes the browser ignore the `download` attribute); falls back to opening the URL if CORS
  refuses the read. Note `expo-file-system`'s web implementation of `downloadFileAsync` is a
  **no-op stub** — confirmed in `ExpoFileSystem.web.d.ts` — which is why web needs its own path.
- **native**: `File.downloadFileAsync(url, new Directory(Paths.cache))` then `Share.share({ url })`,
  where the system sheet offers "Save Image" / "Save to Files".

### GATES

- `bun run lint` -> **0 warnings, 0 errors, 314 files** (313 + the new screen).
- Mobile `tsc -p tsconfig.json` -> **EXIT=0, 7-byte log** (servers killed first, so not a 137 OOM).
- Metro bundle -> **http=200 bytes=9021467** (baseline was 8944589), no resolve errors;
  `my-captures`, `useMovePhotos`, `downloadFileAsync`, `mine.assignPick`, `nav.mine` all present.
- Web `tsc` **not run**, and it would not have helped: **`packages/web/src/api` is in no tsconfig
  `include`**, so it is never typechecked. The runtime proof below is the only real check.

### RUNTIME PROOF — PASSED (`/tmp/cdp_tap.mjs`, port 9353, signed-in profile)

Steps `/tmp/steps_mine.json`; screenshots `/tmp/mine_photos.png`, `/tmp/mine_videos.png`.
DB beforehand: exactly 3 rows with `project_id IS NULL`, all `kind: "photo"`, zero videos.

- `/my-captures` Pictures -> `codeCount: 3`, exactly **GC-RD8Z-NCNF-3B4H, GC-MFN3-W3TD-GDZ8,
  GC-TFDF-T5PN-VJG5**, title + body + both toggles present, empty state absent.
- Videos -> `codeCount: 0` and the empty state renders. Screenshot confirms the amber active
  toggle and the correct copy.

**Harness gotcha that cost a run:** the driver evaluates an *expression* and does **not await
promises**. `(() => {...}())` is a syntax error (needs `(() => {...})()`), and an `async` IIFE
just returns `{}`. Validate step JS locally first:
`node -e 'const s=require("/tmp/steps_mine.json"); for(const st of s) if(st.js) new Function("return "+st.js)'`

### NOT VERIFIED / KNOWN LIMITS — report honestly

- **Thumbnails render as blank dark slabs** on `/my-captures`. This is **NOT a regression from
  this item**: the pre-existing `/teamspace` screen shows the *same three captures* with the
  *same* blank slabs and the same `imgCount: 0, bgs: []` (screenshot `/tmp/ts_compare.png`).
  The new screen is a faithful match of the old one. **Root cause not established** — the
  presigned URL yields no loadable asset in the sandbox. Worth its own item.
- **Download is unverified end to end.** The web path was never exercised by a click, and the
  native path cannot run in Expo web at all. On **Android** `Share.share` ignores `url`, so the
  file lands in the app cache but the sheet carries text only — iOS gets the real file.
- **Assign-to-project is unverified by click.** The mutation, picker and labels are code-verified
  and bundle-verified only. The test org's projects were not exercised against it.
- **Signed-out video can still be REFUSED at seal time.** Free plan is `videoTrialDays: 3`,
  `videoMaxSeconds: 30`, and `photos.create` throws `PAYMENT_REQUIRED` for an expired window or
  an over-length clip. `drainQueue` calls `markError`, so the item **stays in the queue with a
  visible error rather than vanishing** — an acceptable failure mode, but Luc should know.
- **The real device camera path is still unprovable here** — Expo web has no camera, so every
  capture goes through the sample-frame branch.
- `queue.signedOut` (from ITEM 31) is **still unused**.

---

## ITEM 33 — Blank thumbnails (root cause) + Android download (2026-09-09)

Luc's two answers set the order: **(1) fix the blank thumbnails first — "that sounds serious"**,
**(2) yes to the Android download, rebuild cost accepted**.

### 1. BLANK THUMBNAILS — root cause found, NOT what was suspected

The handover's prime suspect was `photoUrl` in `api/lib/media.ts` silently returning `""` when
`presignGet` throws. **That was wrong — do not "fix" media.ts on that theory.** Measured directly:
S3 credentials are present, `presignGet` succeeds for every row, and every presigned URL returns
**HTTP 200**. `urlLen` 535, no exception thrown.

The real cause is in the **capture path**, not the serve path. `app/(tabs)/index.tsx` web-preview
branch commits the **relative** paths `/images/samples/fiber-technician.jpg` and
`/media/sample-clip.mp4`. Those fixtures live in `packages/web/public/` and are served by **Vite
on 4200**. The **Expo dev server on 4300 does not have them** and answers with its SPA fallback
`index.html` — **HTTP 200, `content-type: text/html`, 1335 bytes**. The upload path took those
HTML bytes, stored them under a `.jpg` key, and **sealed them**. Magic bytes of all three old
objects: `3c21444f` = `<!DOCTYPE html>`. `bytes: 1335` in the DB was the tell.

Measured before the fix:
```
4300/images/samples/fiber-technician.jpg -> http=200 ctype=text/html  bytes=1335
4200/images/samples/fiber-technician.jpg -> http=200 ctype=image/jpeg bytes=205859
```

**FIX:** copied both fixtures into a new **`packages/mobile/public/`** — Expo Router serves
`public/` as **web-only** static assets, so nothing is added to the native bundle:
```
packages/mobile/public/images/samples/fiber-technician.jpg  205859 b
packages/mobile/public/media/sample-clip.mp4                 88641 b
```
The `mob` tmux session must be **restarted** for Expo to pick the new folder up.

**VERIFIED after the fix:**
- `4300/images/samples/fiber-technician.jpg` -> `http=200 ctype=image/jpeg bytes=205859`.
- Fresh capture **GC-6MZ5-75P0-4DHT** -> `dbBytes 205859`, `s3Bytes 205859`, head **`ffd8ffe0`**
  (a real JPEG), `integrity verified`, presign `http=200`.
- `/my-captures` DOM probe: **`imgCount` 0 -> 1**, `naturalWidth x naturalHeight = 1000x1000`,
  `bgCount` 1.
- **Screenshot `/tmp/thumb_after.png` opened** — the new card shows the real fiber-technician
  photo. (Scan-only would not have been proof; the old scan was green while the page was blank.)

**SCOPE — state this plainly to Luc.** This branch only runs when **`!isNative`**, i.e. the
sandbox web preview, which has no camera. On a real phone `isNative && camera.current` takes the
camera path, so **his real captures were never affected by this bug**. The device camera path
still **cannot be proven here**.

**LEFTOVER — RESOLVED 2026-09-09.** GC-RD8Z-NCNF-3B4H, GC-TFDF-T5PN-VJG5, GC-MFN3-W3TD-GDZ8
rendered as blank dark slabs because their **stored bytes were HTML**. They could not be repaired
in place: **`storageKey` IS in the signed payload**, so rewriting the key or the object makes them
verify as **tampered**. **Luc approved deletion**, and all three were deleted via `/tmp/del_run.ts`
— a guarded script that aborts unless it matches exactly 3 rows and every object's magic bytes are
`3c21444f` (HTML) at 1335 bytes. Removed 2 `photo_events` rows each, the storage object, and the
photo row; no `share_links` / `messages` / `route_stops` referenced them. Verified after: the only
unfiled capture left is **GC-6MZ5-75P0-4DHT** (205859 b), and the `/my-captures` screenshot shows
one card with a real photo and no dark slabs. Reuse `/tmp/del_inspect.ts` to check references
before any similar cleanup.

**FINDING — Luc DECLINED it 2026-09-09, do NOT re-propose.** All three HTML objects carried
`integrity = "verified"`: the pipeline seals whatever bytes it is handed and **never checks that a
"photo" is actually an image**. A magic-byte guard in `photos.create` was offered with the risk
stated plainly — a wrong guess about real device formats (HEIC and friends, untestable here) would
**reject Luc's genuine captures**. He chose **"No, too risky — leave the capture path alone."**
The capture path stays as is. Related and still open as a cheap future win: `photoUrl` swallows the
presign error and returns `""`, which is why a broken asset looks like a dark photo, not an error.

### 2. ANDROID DOWNLOAD — shipped

- Installed with **`bunx expo install expo-sharing`** (never `bun add`) -> **expo-sharing@14.0.8**.
- API confirmed from `node_modules/expo-sharing/build/Sharing.d.ts`:
  `isAvailableAsync(): Promise<boolean>` and `shareAsync(url, options?)` with
  `{ mimeType (Android), UTI (iOS), dialogTitle }`.
- `components/photo-detail.tsx` native branch now downloads to the cache as before, then calls
  **`Sharing.shareAsync(file.uri, { dialogTitle, mimeType, UTI })`** guarded by
  `isAvailableAsync()`, with `Share.share` kept only as a last-resort fallback (which also keeps
  the existing `Share` import used). `mimeType`/`UTI` switch on `data.kind` (mp4 vs jpeg).
  **The web blob/anchor path is untouched.** The `"idle" | "busy" | "ok" | "fail"` state and the
  `mine.downloadOk` / `mine.downloadFail` messages are unchanged.
- The superseded "why no new native module" comment in `photo-detail.tsx` was rewritten, and the
  ITEM 32 section above now carries a pointer to this one so the doc does not contradict itself.

### GATES

- `bun run lint` -> **0 warnings, 0 errors, 314 files** (PASS).
- Mobile `tsc -p tsconfig.json` -> **EXIT=0, 7-byte log** (PASS — servers killed first, not a 137).
- Metro bundle -> **http=200 bytes=9024942** (baseline was 9021467, the delta is expo-sharing),
  **no resolve errors**; `expo-sharing`, `shareAsync`, `isAvailableAsync`, `my-captures`,
  `mine.downloadOk` all present. This is the gate that matters for a new native module.
- Web `tsc` not run — **`packages/web/src/api` is in no tsconfig `include`**, so it would not
  cover anything changed here anyway.

### NOT VERIFIED — keep telling Luc the truth

- **Download and Assign have still never been click-tested**, on either platform. Code-, type-
  and bundle-verified only.
- The **Android share sheet itself is unprovable in the sandbox** — there is no device. The fix is
  the documented-correct API for the known `Share.share` limitation, not an observed pass.
- The **real device camera path** remains unprovable (no camera in the preview).
- **expo-sharing is a native module: this needs a FULL REBUILD, not a quick Publish.** Luc
  accepted that cost explicitly when he answered.

---

## ITEM 34 — Italian Help Center ✅ COMPLETE, gates green, browser-verified (2026-09-09)

Started after ITEM 33. Luc had chosen thumbnails "first", so Italian is the approved next job.

### Vocabulary — majority-counted in `packages/web/src/web/i18n/it.ts` (the ITEM 24 method)

- **Workspace 19** vs "spazio di lavoro" 10 -> use **Workspace**.
- **Teamspace 44** vs "spazio del team" 6 -> use **Teamspace**.
- **Piano 32** vs "Tariffa" 0 -> use **Piano**.
- **Proprietario 7** vs "Titolare" 1 -> use **Proprietario** for the role name.

⚠️ The catalog is internally inconsistent, exactly as German was: `team.ownersSeeAll` says
"titolari" and `billing.ownerOnly` says "proprietario dello spazio" (not "workspace").
**Majority wins** -> Proprietario + Workspace. Do not follow the minority strings.

### Real Italian UI labels — QUOTE THESE, do not invent
- Free trial -> **"Prova gratuita"** (`home.pricing.freeTrial`)
- Switch to {plan} -> **"Passa a {plan}"** (`billing.switchTo`)
- Talk to us -> **"Parla con noi"** (`billing.talk`)
- Current plan -> **"Piano attuale"** (`billing.current`)
- Integrity badges -> **"Verificato" / "Non verificato"** (`evidence.verified` / `.unverified`)
- Team screen: "Membri", "Inviti in attesa", "Invita un membro", "Revoca", "Copia link",
  "Accesso ai progetti", "Messaggio" (`team.*`, lines ~1114-1143).

### ⚠️ DIFFERENCE FROM THE GERMAN RECIPE — do not copy de/teamspace.ts's workaround

`de/teamspace.ts` deliberately wraps German prose around **English** Team-screen labels because
app-team.tsx was then only 17 `t()` calls with hardcoded English. **ITEM 26 fixed that**:
`app-team.tsx` is now 679 lines with **50 `t()` calls and no hardcoded English labels found**.
So `it/teamspace.ts` must quote the **Italian** labels above. (The German file is now stale on
this point — worth a follow-up pass, not in this item's scope.)

### "Tampered" — accuracy constraint

`integrity` is `verified | unverified | tampered` in `api/database/schema.ts:155`, but
**"tampered" is rendered NOWHERE in the web UI** (grepped all of `packages/web/src` and
`packages/mobile`: it appears only in help content and two comments). The visible badges are
only Verificato / Non verificato. Italian prose must not promise a "Manomesso" badge the user
will never see. Note `it.ts` has no tampered string at all; the only related one is
`home.nav.tamper` = "A prova di manomissione" (tamper-proof).
fr-CA/es/pt-BR/de all keep **"tampered" as an untranslated English `keywords:` entry** for
search — mirror that.

### Recipe reminders (full detail in ITEM 20 + ITEM 24)
Copy `content/en/<name>.ts` -> `content/it/<name>.ts`: same filenames, same `slug`s, same
`icon`s, same block order, same **local export names** (`gettingStarted, mobileApp, teamspace,
deliveryRoutes, verify, plansBilling, troubleshoot, legal`); only the aggregate differs
(**`itCategories`**). `see(...)` refs are slugs and are **NEVER translated**. Write `index.ts`
LAST and register `it: itCategories` in `content/index.ts` only after all 9 files exist.
**No dollar figures ever** (`grep -nE '\$[0-9]'`). Validator must report `total 59` / `BAD: none`.
Then check Italian CSV header aliases in `lib/parse-stops.ts` (mind the `note`/`notes` collision).

### ITEM 34 COMPLETE (2026-09-09)
All 9 files in `content/it/` written and structurally checked; `it: itCategories` registered in
`content/index.ts`. Validator: total 59, BAD: none (identical to en). Italian CSV header aliases
added to `parse-stops.ts` (no cross-field shadowing; `nota` deliberately left with `reference`).
Gates: lint 0/0 (55/323 files), tsconfig.app EXIT=0, tsconfig.node EXIT=0. Signed-out browser
check of `/help` + 2 deep articles, all `engLeak:false`, all three screenshots opened. Role names
kept English per `role-badge.tsx`. `it/teamspace.ts` quotes the real Italian Team labels —
`de/teamspace.ts` is now stale on that point (follow-up).

### Progress: 9 of 9 files written
EN sizes: getting-started 204 · verify 166 · legal 226 · plans-billing 255 · mobile-app 295 ·
troubleshoot 298 · teamspace 429 · delivery-routes 482 · index 34.

---

## ITEM 35 — Polish Help Center (✅ COMPLETE 2026-09-09)

Luc: "Please continue the translation while I wait for support" (publishing is blocked, he cannot
test app changes). Queue order after pl: **zh, vi, tl, ar LAST (only RTL)**.

### ⚠️ FINDING — the `routes.*` block of `i18n/pl.ts` is written WITHOUT Polish diacritics
Confirmed by eye, lines ~931-955: "Zbuduj trase, przypisz kierowce i udokumentuj kazda dostawe
zdjeciem", "Utworz trase", "kolejnosci", "Zakonczona", "{n} przystankow", "Powrot na start",
"zaladunku", "nastepnie". Those words REQUIRE diacritics (trasę, kierowcę, każdą, dostawę,
zdjęciem, Utwórz, kolejności, Zakończona, przystanków, Powrót, załadunku, następnie).
The teamspace/evidence blocks (lines 68-150) are CORRECT ("Przestrzeń zespołu", "Łańcuch
dowodowy", "Współautorzy").

**⚠️ CORRECTION (was wrong above): the defect was NOT localised to the delivery-routes UI.**
Of the 24 strings actually fixed, **two sat outside the `routes.*` band**: `templates.gone` and
`join.appHint`. Any future locale audit must scan the WHOLE file, not just the routes block.

**Do NOT trust the "% without diacritics" per-group table** — short correct words ("Plan",
"Adres", "Data", "Szkic") have no diacritics, so that metric is mostly false signal. Only the
`routes.*` group is confirmed defective by reading it.

**Decision:** fix the `routes.*` values in `pl.ts` as part of this item — VALUES ONLY, never keys
(key parity is a type error; EN total 1139 must stay matched). Otherwise `pl/delivery-routes.ts`
would have to quote broken UI labels. Flag it to Luc as a found-and-fixed defect, not a new task.

### Vocabulary settled from `i18n/pl.ts` (majority wins, same method as de/it)
- **pieczęć** = seal (13 hits) — NOT "plomba" (2, only `teamspace.statSeal`). Catalog is
  internally inconsistent exactly like de/it were.
- **przestrzeń robocza** = workspace · **przestrzeń zespołu** = Teamspace (`teamspace.title`).
  `team.thisWorkspace`/`team.followingWorkspace` keep raw "workspace'u" — minority, ignore.
- **właściciel** = owner · **Stanowiska** = seats (`billing.seats`) · **Plan** = plan
- **Znaki wodne** = watermarks (`nav.watermarks`) · **Kod zdjęcia** = photo code
- **Zweryfikowano** / **Niezweryfikowane** = verified / unverified (`evidence.*`)
- **Trasa** = route · **przystanek** = delivery stop · **Ekipa** = crew
- **Aparat** = capture screen · **Łańcuch dowodowy** = chain of custody
- `routes.status.*`: Szkic / Przypisana / W trakcie / Zakończona / Anulowana
- **⚠️ Role names stay ENGLISH lowercase** (`owner/admin/manager/field`) — `role-badge.tsx`
  renders `{role}` raw in every locale. `home.team.b1` prose says "właściciel, admin, menedżer,
  teren" but the BADGE WINS. Same call as de and it. **Luc was asked twice, never answered — do
  not ask a third time.**
- **"tampered"** → mirror de/it: results table gets the Polish word, `keywords:` keep untranslated
  English "verified"/"tampered"/"skew" for search. Do not "fix".
- **No dollar figures ever.**

### Progress: 9 of 9 files written — ALL VERIFIED PASS, CATALOG REGISTERED
Recipe: ITEM 20 (pt-BR) + ITEM 24 (de) + ITEM 34 (it). Checkers: `/tmp/hcheck.sh <name> pl`,
`python3 /tmp/xref.py packages/web/src/web/help/content/pl` (must be total 59 / BAD: none).

Final sizes in `help/content/pl/`: verify 170 · getting-started 205 · legal 250 ·
plans-billing 301 · mobile-app 295 · troubleshoot 361 · teamspace 503 · delivery-routes 580 ·
index 33. All 8 content files `hcheck` **PASS**.

Catalog registered in `help/content/index.ts` (import `plCategories`, `pl:` in `CATALOGS`,
alphabetical re-export). Cross-reference gate: `xref.py` output **byte-identical to `en/`** —
`total 59`, `BAD: none`.

### CSV header aliases — DONE (`web/lib/parse-stops.ts`)
62 Polish aliases added across all six fields with `// Polish` comments. Zero cross-field
collisions, zero same-field duplicates (verified with `/tmp/plalias.py`, which strips `//`
comments before parsing — skipping that step yields a FAKE collision report).

**⚠️ `ł` DOES NOT FOLD.** `normalizeHeader` does NFD + strip-combining-marks; the stroked `ł` is
a single codepoint, exactly like German `ß`. `przesyłka` folds to `przesyłka`, NOT `przesylka`,
so every `ł` alias is listed in BOTH spellings.

**⚠️ Folding does not TRANSLITERATE — I got this wrong twice while writing this item.** Polish
`klient`/`kontakt`/`faktura` are SEPARATE keys from English `client`/`contact` and Italian
`fattura`; they are not "already covered" and all three are listed explicitly. The help text
promises `klient`, so dropping it would have made the docs lie.

Deliberately EXCLUDED (judgement, do not "fix"): bare **`kod`** (too generic, conceptually
collides with photo/order code) and bare **`poczta`** (ambiguous with postal mail).

### Functional parser test — `/tmp/pltest.ts` (`bun /tmp/pltest.ts`)
Ran the REAL shipped `parseStops`/`mapHeader`, not just an alias-table inspection:
- **26/26** terms the help article promises resolve to the correct field (incl. uppercase,
  padded whitespace, and the unaccented `zamowienie`/`komorka` the article guarantees).
- All four `ł` spellings resolve to `reference`.
- A Polish data row is correctly NOT mistaken for a header row.
- Two realistic sheets parse: semicolon-delimited with the address split across 4 columns and a
  quoted field containing a comma (3 stops), plus a tab-delimited unaccented sheet (1 stop).

**⚠️ TEST TRAP that cost me a false alarm:** `mapHeader` returns `null` for the WHOLE row unless
an `addressRaw` column is present (`if (!mapped.includes("addressRaw")) return null;`). Testing a
single non-address header alone reports 18 bogus FAILures. Always pair the candidate with a known
address column and read the second index.

### Gates — ALL PASS
`bun run lint` 0/0 · `tsc -p tsconfig.app.json` EXIT=0 · `tsc -p tsconfig.node.json` EXIT=0.
(Kill `web` + `mob` tmux before the app typecheck; 3.9 GB box. EXIT=137 is OOM, NOT a pass.)

### Browser-verified signed out, `geocliks.locale='pl'`, screenshots opened
`/help` (h1 "Jak możemy pomóc?", 8 Polish category cards, `engLeak:false`),
`/help/teamspace/roles-and-permissions` (h1 "Role i uprawnienia", role badges correctly ENGLISH
Owner/Admin/Manager/Field, Polish note about that present), and
`/help/delivery-routes/add-stops-by-pasting-a-list` (column-name promise + fold note render).

**⚠️ Deep articles return `len:0` on a 10 s wait — TIMING ARTIFACT, not a bug.** The roles page
needed 30 s. Same false alarm as ITEM 34. Pathname was correct throughout.

### Not verified (reported honestly to Luc)
No real Polish CSV pasted through the browser UI (parser-level only), and no native-Polish
speaker has proofread the prose.

### Cosmetic, deliberately NOT fixed (scope creep)
Several `routes.*` Polish strings use a plain hyphen `" - "` where the catalog elsewhere uses an
em dash `" — "`: `routes.noStops`, `.modePlanned`, `.modeDispatch`, `.previewSkipped`, `.mapEmpty`,
`.liveNotLocated`, `.dragHint`, `.addHint`.

## ITEM 36 — Chinese (zh) Help Center (✅ COMPLETE 2026-09-09)

Luc: "continue" (2026-09-09), publishing still blocked platform-side. Queue after zh:
**vi, tl, ar LAST (only RTL)**. Locale code is **`zh`** (not `zh-CN`) in both web and mobile.

### ✅ NO i18n DEFECT THIS TIME — `i18n/zh.ts` is clean
Scanned all 1139 values for ones containing no CJK character: exactly **2 hits**, both correct by
design (`signin.emailPlaceholder` = "you@company.com", `getapp.footerCopy` = the © line).
Contrast with pl (24 broken strings). **Nothing to fix in `zh.ts`.**

### ⚠️ Role names stay ENGLISH — same call as de/it/pl, now CONFIRMED BY A CODE COMMENT
`components/role-badge.tsx:13` literally says *"role names are workspace vocabulary, not prose,
so they stay untranslated"* and line 24 renders `{role}` raw. Roles table in `zh/getting-started.ts`
and `zh/teamspace.ts` keeps **Owner / Admin / Manager / Field**, plus a sentence noting the app
shows them in English. **Do not ask Luc again.**

### Vocabulary harvested from `i18n/zh.ts` (quote these, never invent)
- **团队空间** = Teamspace · **工作区** = workspace · **套餐** = plan (⚠️ billing nav is `nav.plan`
  = "套餐", NOT "账单") · **席位** = seats · **所有者** = owner
- **封印** = seal (`evidence.reverify` "重新验证封印", `teamspace.statSeal` "封印完好")
- **证据链** = chain of custody · **照片编码** = photo code · **水印** = watermarks
- **已验证 / 未验证** = verified / unverified · **拍摄内容** = captures · **班组** = crew
- **路线** = route · **站点** = delivery stop (note: `routes.map*` keys drift to **停靠点** for the
  same concept — catalog is internally inconsistent, same as de/it/pl. **站点 is the majority.**)
- Nav: 项目 / 地图 / 前后对比 / 报告 / 分享链接 / 团队 / 团队空间 / 水印 / 套餐
- `routes.status.*`: 草稿 / 已指派 / 进行中 / 已完成 / 已取消
- `routes.pin.*`: 未定位 / 已定位 / 未找到 / 手动标记
- `track.reason.*`: 家中无人 / 拒收 / 地址有误 / 已关门 / 无法进入 / 其他
- `projects.status.*`: 进行中 / 已暂停 / 已完成 / 已归档 · `projects.fTrade` = **工种** (EN "Category")
- Report layouts: 照片网格 / 每页一张 / 前后对比 / 地图 + 日志
- Mobile tabs: 拍摄 / 队列 / 团队 / 地图 / 项目 / 设置 / 路线
- **"tampered"** → mirror de/it/pl: results table gets the Chinese word, `keywords:` keep
  untranslated English "verified"/"tampered"/"skew". Do not "fix".
- **No dollar figures ever.**

### Keywords convention
Chinese keywords **plus English fallback terms** for search. Technical tokens stay as-is:
`2fa, totp, gps, push, pdf, excel, zip, kmz, qr, csv, pod`.

### Cosmetic, NOT fixing (same as pl)
`zh.ts` uses a plain hyphen `" - "` in `routes.noStops`, `.addHint`, `.modePlanned`,
`.modeDispatch`, `.previewSkipped`, `.liveNotLocated`, `.mapEmpty`. Chinese typography would want
a full-width dash or a comma. Cosmetic only.

### Progress: 9 of 9 files written — ALL VERIFIED PASS, CATALOG REGISTERED
Recipe: ITEM 20 (pt-BR) + ITEM 24 (de) + ITEM 34 (it) + ITEM 35 (pl).
Checkers: `/tmp/hcheck.sh <name> zh`, `python3 /tmp/xref.py .../content/zh` (total 59 / BAD: none).

### Completion record (2026-09-09)
Files, all `hcheck ... zh: PASS`: `verify` 39 blocks, `getting-started` 45, `legal` 61,
`plans-billing` 60, `mobile-app` 72, `troubleshoot` 83, `teamspace` 98, `delivery-routes` 106,
plus `index.ts` (34 lines, exports **`zhCategories`**). The stray Cyrillic "работа" in
`getting-started.ts` was fixed; a repo-wide Cyrillic scan of `zh/*.ts` is empty.

`python3 /tmp/xref.py .../content/zh` output is **byte-identical to the `en/` run**:
`{'delivery-routes':10,'getting-started':6,'legal':4,'mobile-app':10,'plans-billing':6,'teamspace':11,'troubleshoot':8,'verify':4} total 59` / `BAD: none`.

Registered in `help/content/index.ts` with three sequential edits (import, `CATALOGS` entry
`zh: zhCategories`, trailing `export {}` — `zh` sorts last). Re-read and confirmed.

**Chinese CSV header aliases — 53 added** to `lib/parse-stops.ts`, six sequential edits, one
`// Chinese` comment block per field: addressRaw 15, recipientName 9, recipientEmail 5,
recipientPhone 7, reference 10, notes 7. `normalizeHeader` was **NOT** touched.
- `python3 /tmp/zhalias.py` (adapted from `/tmp/plalias.py`, strips `//` comments first):
  all 53 resolve to their own field, **0** Chinese duplicates, **0** full-width characters,
  and NFD leaves every Chinese alias unchanged. The 27 duplicate keys it reports are the
  pre-existing intentional accent-pair spellings from earlier locales — not ours.
- Deliberately excluded: bare **`编码`** / **`代码`** (在 GeoCliks 里 `编码` 是照片编码) and bare
  **`地区`** (reads as a vague area / sales territory).
- `bun /tmp/zhtest.ts`: **HEADER MAP 22/22 PASS** (every term the help article promises),
  **FULL TABLE 38/38 PASS**, UTF-8 BOM sheet parses, a Chinese data row is NOT mistaken for a
  header, and two realistic sheets parse with the address rejoined across 5 columns.
- ⚠️ **Known limitation, deliberately not fixed:** full-width headers resolve to `null` —
  `ＡＤＤＲＥＳＳ`, `电话（手机）`, `地址／门牌号`. NFD does not fold full-width forms and the code
  must **not** switch to NFKC (that would change matching for all 6 existing locales). The
  Chinese article only promises the plain words, all of which pass, so the docs do not lie.

The article's column-name bullet promises exactly the Chinese names now wired in:
地址／送达地址／城市／邮编、收件人／姓名／客户、邮箱／电子邮件、电话／手机、订单号／参考号、备注／说明.
en/de and the other locales are left alone (stale in this respect, known and accepted).

Gates: `bun run lint` **0 warnings / 0 errors**; `tsconfig.app.json` **EXIT=0** (empty log =
pass); `tsconfig.node.json` **EXIT=0**. Both typechecks were run with `web`+`mob` killed
(available RAM had collapsed to 64 MB and was making even `cat` time out — killing them
restored ~1.1 GB). Servers restarted after: web=200, mobile=200.

Browser-verified signed out via `/tmp/cdp_anon.mjs` with `geocliks.locale='zh'`, step files
`/tmp/steps_help_zh{,_index,_roles}.json`, **every screenshot opened**:
- `/help` — h1 **需要什么帮助？**, 8 category links, 快速上手 / 手机应用 / 团队空间 / 配送路线 /
  验证 / 套餐与账务 all Chinese, `engLeak:false`.
- `/help/delivery-routes/add-stops-by-pasting-a-list` — h1 **粘贴清单或上传 CSV 来添加站点**,
  len 1819, the column-names bullet present, `engLeak:false`.
- `/help/teamspace/roles-and-permissions` — h1 **角色与权限**, Chinese prose, and the role table
  correctly renders **Owner / Admin / Manager / Field in English**, `engLeak:false`.
- Reconfirmed for the 3rd locale running: deep articles return `len:0` on a 15 s wait right
  after a server restart (cold Vite). **Timing artifact, not a bug** — pathname was correct
  throughout. Two stacked `{"wait":15000}` fixes it. My `catVerify:false` was a bad assertion
  on my side (the title is 验证, not 已验证), not a defect.

**ITEM 36 adds no i18n keys**, so web key parity stays at 1139 across all 11 catalogs.
Help content dirs are now: `de, en, es, fr-CA, it, pl, pt-BR, zh` + `index.ts`.

## ITEM 37 — Vietnamese (vi) Help Center (IN PROGRESS 2026-09-09)

Luc: "continue with the translation." Queue after vi: **tl, then ar LAST (only RTL).**
Locale code is **`vi`**. `i18n/vi.ts` already existed; the Help Center content did not.

### ✅ i18n/vi.ts AUDIT COMPLETE — 6 defects found and FIXED
Key parity perfect: **1139 / 1139**, 0 missing, 0 extra. Latin script, so the zh "no CJK char"
scan does not apply; equivalent test = values byte-identical to `en.ts`.
- Identical-to-English was **13**, now **11**. The 11 remaining are all correct by design:
  `Email` x3, `Video`, `Logo`, `Menu` x2, `MRR`, `Hash` (loanwords / technical tokens),
  `signin.emailPlaceholder`, `getapp.footerCopy` (© line) — same two exemptions as zh.
- **Defect: "Teamspace" was translated inconsistently.** Majority `Không gian nhóm` (9 places)
  vs raw English left inside Vietnamese prose (6 places). Fixed all 6 to the majority term,
  following the lowercase-mid-sentence convention already in `vi.ts`
  (`project.deleteHint`, `signin.businessNameHelp`): `teamspace.noMatch.body`,
  `home.nav.teamspace`, `home.hero.liveTeamspace`, `home.team.label`, `perm.selfDeleteNote`,
  `team.inviteEmailed`. Backup at **/tmp/vi.ts.bak**.
- **`tabs.teamspace` = "Nhóm" left alone on purpose** — mobile tab bar is space-constrained and
  zh shortened the same tab to 团队. Not a defect.
- Gate after the fix: `tsconfig.app.json` **EXIT=0**.
- FALSE ALARM logged so nobody re-chases it: `home.field.i3.body` appeared as `chạy đư���c` in
  terminal output. A U+FFFD scan of **all 11 catalogs returns 0** and a direct byte read shows
  `chạy được`. Terminal rendering artifact, file is clean.

### Vocabulary harvested from `i18n/vi.ts` (quote these, never invent)
- **Không gian nhóm** = Teamspace · **không gian làm việc** = workspace (DISTINCT — do not merge)
- **Gói** = plan (⚠️ billing nav is `nav.plan` = "Gói") · **Đội** = crew (`teamspace.statCrew`)
- **Niêm phong** = seal (`evidence.reverify` "Xác thực lại niêm phong",
  `teamspace.statSeal` "Niêm phong nguyên vẹn")
- **Chuỗi lưu giữ** = chain of custody · **Mã ảnh** = photo code · **Hình mờ** = watermarks
- **Đã xác thực / Chưa xác thực** = verified / unverified · **Chống giả mạo** = tamper-proof
- **Tuyến đường** = route (`nav.routes`; tab `tabs.routes` shortens to **Tuyến**)
- **điểm dừng** = delivery stop · **Ngành nghề** = trade/category (`projects.fTrade`)
- Nav: Dự án / Bản đồ / Trước / Sau / Báo cáo / Liên kết chia sẻ / Nhóm / Hình mờ / Gói /
  Bảng quản trị / Tin nhắn / Tuyến đường
- `routes.status.*`: Nháp / Đã giao / Đang chạy / Hoàn tất / Đã hủy
- `routes.pin.*`: Chưa định vị / Đã định vị / Không tìm thấy / Ghim thủ công
- `track.reason.*`: Không có ai ở nhà / Từ chối nhận / Sai địa chỉ / Đã đóng cửa /
  Không vào được / Khác
- `projects.status.*`: đang hoạt động / tạm dừng / hoàn thành / đã lưu trữ
- Mobile tabs: Chụp / Hàng chờ / Nhóm / Bản đồ / Dự án / Cài đặt / Tuyến / Tin nhắn
- **Role names stay ENGLISH** (Owner / Admin / Manager / Field) — settled, see ITEM 36.
  Note `home.team.b1` renders them lowercase Vietnamese in marketing prose; the roles TABLE
  in help content keeps English, same as de/it/pl/zh.
- **No dollar figures ever.**

### ✅ COMPLETE — 9 of 9 content files, catalog registered, parser aliases added
All in `packages/web/src/web/help/content/vi/`, every one `hcheck <name> vi: PASS`
(import line, slug/icon sequences, see() refs, block count):
verify 39, getting-started 45, plans-billing 60, legal 61, mobile-app 72,
troubleshoot 83, teamspace 98, delivery-routes 106, plus `index.ts` exporting `viCategories`.
- `xref.py` on `vi/` is **byte-identical to the `en/` run**:
  `{delivery-routes:10, getting-started:6, legal:4, mobile-app:10, plans-billing:6,
  teamspace:11, troubleshoot:8, verify:4} total 59`, `BAD: none`.
- Registered in `help/content/index.ts` with 3 sequential edits, read back and verified:
  import after `pt-BR`, `vi: viCategories` after `zh` in `CATALOGS`, `viCategories` before
  `zhCategories` in the trailing export block.
- Category title for verify is **"Xác thực"**; results table uses
  Đã xác thực / Chưa xác thực / **Bị giả mạo**; `keywords:` keep the English fallbacks
  (verified/tampered/skew) per the ITEM 36 convention.
- Route/pin/failure-reason tables quote `vi.ts` verbatim, so the help text matches the UI:
  Nháp/Đã giao/Đang chạy/Hoàn tất/Đã hủy · Chưa định vị/Đã định vị/Không tìm thấy/Ghim thủ công ·
  Không có ai ở nhà/Từ chối nhận/Sai địa chỉ/Đã đóng cửa/Không vào được/Khác.
- Role names and plan names stay ENGLISH (settled). `teamspace/roles-and-permissions` folds the
  disclosure into its intro `p()`; `getting-started` carries it in the roles `note()`.

### CSV header aliases — `lib/parse-stops.ts`, 80 Vietnamese aliases
Six sequential edits, one `// Vietnamese` comment block per field.
**`normalizeHeader` NOT touched.**
addressRaw 23 · recipientName 10 · recipientEmail 6 · recipientPhone 14 · reference 18 · notes 9.
- ⚠️ **THE KEY VIETNAMESE FACT — `đ` (U+0111) does NOT fold under NFD.** It is a single
  codepoint, not a letter plus a combining mark, so `\p{Diacritic}` never touches it.
  Verified: `Địa chỉ`->`đia chi` (NOT `dia chi`), `Số điện thoại`->`so đien thoai`,
  `Mã đơn hàng`->`ma đon hang`, `Đường`->`đuong`, `SĐT`->`sđt`.
  Tone marks and vowel diacritics DO fold: `Thành phố`->`thanh pho`, `phường`->`phuong`.
  => every alias containing `đ` is listed **twice** (accented + fully unaccented), exactly like
  `straße`/`strasse` and `przesyłka`/`przesylka`. Non-`đ` words are listed once.
  Also noted, deliberately NOT listed: `Ð` (U+00D0 eth, a common wrong-keyboard hit) folds to
  `ð`, a third distinct key.
- Bare `mã` deliberately left out — in GeoCliks a bare `mã` reads as the photo code
  (same reasoning as Chinese `编码`/`代码`).
- `/tmp/vialias.py`: Vietnamese aliases all resolve to their own field, **0 Vietnamese
  duplicates**, every `đ`-word has its plain-d twin, all 19 promised article terms pass.
  The 27 duplicate keys it reports are **pre-existing** accent-pair spellings from earlier
  locales, not from this item.
- `bun /tmp/vitest.ts`: **HEADER MAP 22/22 PASS, FULL TABLE 67/67 PASS.** Uppercase, padding
  and wrapping quotes fine; `SĐT` and `SDT` both resolve; a Vietnamese data row is NOT mistaken
  for a header; BOM sheet parses; a fully-accented 10-column sheet with the address split across
  4 columns parses; an entirely unaccented tab sheet parses.

### Gates and browser verification
- `bun run lint` 0 warnings / 0 errors. `tsc -p tsconfig.app.json` EXIT=0,
  `tsc -p tsconfig.node.json` EXIT=0 (both live in `packages/web/`, NOT the repo root).
- Browser-verified signed out with `geocliks.locale='vi'`, **all three screenshots opened**:
  `/help` (8 category cards, counts 6/10/11/10/4/6/8/4, switcher reads VI),
  `/help/delivery-routes/add-stops-by-pasting-a-list` (4584 chars, no English leak),
  `/help/teamspace/roles-and-permissions` (role table renders Owner/Admin/Manager/Field in
  English above Vietnamese descriptions, with the disclosure sentence).

### Carry-forward caveats
- ⚠️ **Cosmetic terminology clash left ALONE on purpose.** On `/help` the subtitle from
  `i18n/vi.ts` says *xác minh* while the category card directly below says *Xác thực*.
  The help content is internally consistent on **xác thực**; the catalog drifts
  (`evidence.*` = xác thực, but `verify.title` / `capture.syncedOk` = xác minh).
  Not changed because `verify.title` is a major heading on the live verify page and there is no
  clean majority — this is app copy, so it needs Luc's word. Flagged to him.
- Nobody has pasted a real Vietnamese CSV through the browser UI (parser-level proof only),
  and no native speaker has proofread the prose.
- Full-width headers still resolve to `null` (unchanged, same reason as ITEM 36).

### Vocabulary harvested from `i18n/vi.ts` (quote these, never invent)
- **团队空间** = Teamspace · **工作区** = workspace · **套餐** = plan (⚠️ billing nav is `nav.plan`
  = "套餐", NOT "账单") · **席位** = seats · **所有者** = owner
- **封印** = seal (`evidence.reverify` "重新验证封印", `teamspace.statSeal` "封印完好")
- **证据链** = chain of custody · **照片编码** = photo code · **水印** = watermarks
- **已验证 / 未验证** = verified / unverified · **拍摄内容** = captures · **班组** = crew
- **路线** = route · **站点** = delivery stop (note: `routes.map*` keys drift to **停靠点** for the
  same concept — catalog is internally inconsistent, same as de/it/pl. **站点 is the majority.**)
- Nav: 项目 / 地图 / 前后对比 / 报告 / 分享链接 / 团队 / 团队空间 / 水印 / 套餐
- `routes.status.*`: 草稿 / 已指派 / 进行中 / 已完成 / 已取消
- `routes.pin.*`: 未定位 / 已定位 / 未找到 / 手动标记
- `track.reason.*`: 家中无人 / 拒收 / 地址有误 / 已关门 / 无法进入 / 其他
- `projects.status.*`: 进行中 / 已暂停 / 已完成 / 已归档 · `projects.fTrade` = **工种** (EN "Category")
- Report layouts: 照片网格 / 每页一张 / 前后对比 / 地图 + 日志
- Mobile tabs: 拍摄 / 队列 / 团队 / 地图 / 项目 / 设置 / 路线
- **"tampered"** → mirror de/it/pl: results table gets the Chinese word, `keywords:` keep
  untranslated English "verified"/"tampered"/"skew". Do not "fix".
- **No dollar figures ever.**

### Keywords convention
Chinese keywords **plus English fallback terms** for search. Technical tokens stay as-is:
`2fa, totp, gps, push, pdf, excel, zip, kmz, qr, csv, pod`.

### Cosmetic, NOT fixing (same as pl)
`zh.ts` uses a plain hyphen `" - "` in `routes.noStops`, `.addHint`, `.modePlanned`,
`.modeDispatch`, `.previewSkipped`, `.liveNotLocated`, `.mapEmpty`. Chinese typography would want
a full-width dash or a comma. Cosmetic only.

### Progress: 9 of 9 files written — ALL VERIFIED PASS, CATALOG REGISTERED
Recipe: ITEM 20 (pt-BR) + ITEM 24 (de) + ITEM 34 (it) + ITEM 35 (pl).
Checkers: `/tmp/hcheck.sh <name> zh`, `python3 /tmp/xref.py .../content/zh` (total 59 / BAD: none).

### Completion record (2026-09-09)
Files, all `hcheck ... zh: PASS`: `verify` 39 blocks, `getting-started` 45, `legal` 61,
`plans-billing` 60, `mobile-app` 72, `troubleshoot` 83, `teamspace` 98, `delivery-routes` 106,
plus `index.ts` (34 lines, exports **`zhCategories`**). The stray Cyrillic "работа" in
`getting-started.ts` was fixed; a repo-wide Cyrillic scan of `zh/*.ts` is empty.

`python3 /tmp/xref.py .../content/zh` output is **byte-identical to the `en/` run**:
`{'delivery-routes':10,'getting-started':6,'legal':4,'mobile-app':10,'plans-billing':6,'teamspace':11,'troubleshoot':8,'verify':4} total 59` / `BAD: none`.

Registered in `help/content/index.ts` with three sequential edits (import, `CATALOGS` entry
`zh: zhCategories`, trailing `export {}` — `zh` sorts last). Re-read and confirmed.

**Chinese CSV header aliases — 53 added** to `lib/parse-stops.ts`, six sequential edits, one
`// Chinese` comment block per field: addressRaw 15, recipientName 9, recipientEmail 5,
recipientPhone 7, reference 10, notes 7. `normalizeHeader` was **NOT** touched.
- `python3 /tmp/zhalias.py` (adapted from `/tmp/plalias.py`, strips `//` comments first):
  all 53 resolve to their own field, **0** Chinese duplicates, **0** full-width characters,
  and NFD leaves every Chinese alias unchanged. The 27 duplicate keys it reports are the
  pre-existing intentional accent-pair spellings from earlier locales — not ours.
- Deliberately excluded: bare **`编码`** / **`代码`** (在 GeoCliks 里 `编码` 是照片编码) and bare
  **`地区`** (reads as a vague area / sales territory).
- `bun /tmp/zhtest.ts`: **HEADER MAP 22/22 PASS** (every term the help article promises),
  **FULL TABLE 38/38 PASS**, UTF-8 BOM sheet parses, a Chinese data row is NOT mistaken for a
  header, and two realistic sheets parse with the address rejoined across 5 columns.
- ⚠️ **Known limitation, deliberately not fixed:** full-width headers resolve to `null` —
  `ＡＤＤＲＥＳＳ`, `电话（手机）`, `地址／门牌号`. NFD does not fold full-width forms and the code
  must **not** switch to NFKC (that would change matching for all 6 existing locales). The
  Chinese article only promises the plain words, all of which pass, so the docs do not lie.

The article's column-name bullet promises exactly the Chinese names now wired in:
地址／送达地址／城市／邮编、收件人／姓名／客户、邮箱／电子邮件、电话／手机、订单号／参考号、备注／说明.
en/de and the other locales are left alone (stale in this respect, known and accepted).

Gates: `bun run lint` **0 warnings / 0 errors**; `tsconfig.app.json` **EXIT=0** (empty log =
pass); `tsconfig.node.json` **EXIT=0**. Both typechecks were run with `web`+`mob` killed
(available RAM had collapsed to 64 MB and was making even `cat` time out — killing them
restored ~1.1 GB). Servers restarted after: web=200, mobile=200.

Browser-verified signed out via `/tmp/cdp_anon.mjs` with `geocliks.locale='zh'`, step files
`/tmp/steps_help_zh{,_index,_roles}.json`, **every screenshot opened**:
- `/help` — h1 **需要什么帮助？**, 8 category links, 快速上手 / 手机应用 / 团队空间 / 配送路线 /
  验证 / 套餐与账务 all Chinese, `engLeak:false`.
- `/help/delivery-routes/add-stops-by-pasting-a-list` — h1 **粘贴清单或上传 CSV 来添加站点**,
  len 1819, the column-names bullet present, `engLeak:false`.
- `/help/teamspace/roles-and-permissions` — h1 **角色与权限**, Chinese prose, and the role table
  correctly renders **Owner / Admin / Manager / Field in English**, `engLeak:false`.
- Reconfirmed for the 3rd locale running: deep articles return `len:0` on a 15 s wait right
  after a server restart (cold Vite). **Timing artifact, not a bug** — pathname was correct
  throughout. Two stacked `{"wait":15000}` fixes it. My `catVerify:false` was a bad assertion
  on my side (the title is 验证, not 已验证), not a defect.

**ITEM 36 adds no i18n keys**, so web key parity stays at 1139 across all 11 catalogs.
Help content dirs are now: `de, en, es, fr-CA, it, pl, pt-BR, zh` + `index.ts`.

## ITEM 37 — Vietnamese (vi) Help Center (IN PROGRESS 2026-09-09)

Luc: "continue with the translation." Queue after vi: **tl, then ar LAST (only RTL).**
Locale code is **`vi`**. `i18n/vi.ts` already existed; the Help Center content did not.

### ✅ i18n/vi.ts AUDIT COMPLETE — 6 defects found and FIXED
Key parity perfect: **1139 / 1139**, 0 missing, 0 extra. Latin script, so the zh "no CJK char"
scan does not apply; equivalent test = values byte-identical to `en.ts`.
- Identical-to-English was **13**, now **11**. The 11 remaining are all correct by design:
  `Email` x3, `Video`, `Logo`, `Menu` x2, `MRR`, `Hash` (loanwords / technical tokens),
  `signin.emailPlaceholder`, `getapp.footerCopy` (© line) — same two exemptions as zh.
- **Defect: "Teamspace" was translated inconsistently.** Majority `Không gian nhóm` (9 places)
  vs raw English left inside Vietnamese prose (6 places). Fixed all 6 to the majority term,
  following the lowercase-mid-sentence convention already in `vi.ts`
  (`project.deleteHint`, `signin.businessNameHelp`): `teamspace.noMatch.body`,
  `home.nav.teamspace`, `home.hero.liveTeamspace`, `home.team.label`, `perm.selfDeleteNote`,
  `team.inviteEmailed`. Backup at **/tmp/vi.ts.bak**.
- **`tabs.teamspace` = "Nhóm" left alone on purpose** — mobile tab bar is space-constrained and
  zh shortened the same tab to 团队. Not a defect.
- Gate after the fix: `tsconfig.app.json` **EXIT=0**.
- FALSE ALARM logged so nobody re-chases it: `home.field.i3.body` appeared as `chạy đư���c` in
  terminal output. A U+FFFD scan of **all 11 catalogs returns 0** and a direct byte read shows
  `chạy được`. Terminal rendering artifact, file is clean.

### Vocabulary harvested from `i18n/vi.ts` (quote these, never invent)
- **Không gian nhóm** = Teamspace · **không gian làm việc** = workspace (DISTINCT — do not merge)
- **Gói** = plan (⚠️ billing nav is `nav.plan` = "Gói") · **Đội** = crew (`teamspace.statCrew`)
- **Niêm phong** = seal (`evidence.reverify` "Xác thực lại niêm phong",
  `teamspace.statSeal` "Niêm phong nguyên vẹn")
- **Chuỗi lưu giữ** = chain of custody · **Mã ảnh** = photo code · **Hình mờ** = watermarks
- **Đã xác thực / Chưa xác thực** = verified / unverified · **Chống giả mạo** = tamper-proof
- **Tuyến đường** = route (`nav.routes`; tab `tabs.routes` shortens to **Tuyến**)
- **điểm dừng** = delivery stop · **Ngành nghề** = trade/category (`projects.fTrade`)
- Nav: Dự án / Bản đồ / Trước / Sau / Báo cáo / Liên kết chia sẻ / Nhóm / Hình mờ / Gói /
  Bảng quản trị / Tin nhắn / Tuyến đường
- `routes.status.*`: Nháp / Đã giao / Đang chạy / Hoàn tất / Đã hủy
- `routes.pin.*`: Chưa định vị / Đã định vị / Không tìm thấy / Ghim thủ công
- `track.reason.*`: Không có ai ở nhà / Từ chối nhận / Sai địa chỉ / Đã đóng cửa /
  Không vào được / Khác
- `projects.status.*`: đang hoạt động / tạm dừng / hoàn thành / đã lưu trữ
- Mobile tabs: Chụp / Hàng chờ / Nhóm / Bản đồ / Dự án / Cài đặt / Tuyến / Tin nhắn
- **Role names stay ENGLISH** (Owner / Admin / Manager / Field) — settled, see ITEM 36.
  Note `home.team.b1` renders them lowercase Vietnamese in marketing prose; the roles TABLE
  in help content keeps English, same as de/it/pl/zh.
- **No dollar figures ever.**


### Next locale
Queue: **tl next, then ar LAST (only RTL).** Same recipe, now with 6 worked examples:
ITEM 20 (pt-BR), 24 (de), 34 (it), 35 (pl), 36 (zh), 37 (vi).
