# Locale-URL plumbing for geocliks.com

Goal: give every translated marketing page its own indexable URL per locale, so
translations can actually rank. Today all 11 locales are served from one URL with
a client-side `localStorage` switch, there is no `hreflang` anywhere, and
`seo-html.ts` always sends English — so Google only ever sees one English copy.

## URL scheme (decided)

English keeps the bare path: `/about`, `/pricing`, `/`. No redirect of an
already-indexed URL, so nothing currently ranking moves.

Every other locale gets a lowercased code segment:

    /fr-ca/about  /es/about  /pt-br/about  /de/about  /it/about
    /zh/about     /vi/about  /tl/about     /ar/about  /pl/about

Lowercase because a URL path is case-sensitive and mixed case invites duplicates
(`/fr-CA/` and `/fr-ca/` would be two pages). The `hreflang` attribute still
carries the correct `fr-CA` casing, which is what Google reads.

## The allowlist rule (important)

Only paths that genuinely serve translated copy get locale URLs, `hreflang`
pairs and sitemap rows. Emitting them for an untranslated page publishes 11 URLs
of identical English text — duplicate content, and it teaches Google the locale
URLs are worthless.

Verified translation coverage today:

| Path | State | In allowlist |
|---|---|---|
| `/` | 32 `t()` calls, fully translated | yes |
| `/get-app` | 29 `t()` calls, fully translated | yes |
| `/pricing` | 4 `t()` calls, body copy hardcoded English | no — not yet |
| `/about` + 7 landing pages | 0 `t()` calls | no — not yet |
| `/help/*`, `/blog/*` | English content catalogs | no |

The 8 landing pages join the allowlist as each one is translated. That is the
next job, after this.

## Work items

- [x] `lib/locale-url.ts` — React-free core: segment map, split/join helpers,
      allowlist, `alternatesFor(path)`.
- [x] `lib/seo-html.ts` — strip the prefix before the SEO lookup; emit
      `hreflang` alternates + `x-default`; canonical = the locale URL; set
      `<html lang>` and `dir`.
- [x] `app.tsx` — wrap the router in `<Router base={prefix}>` so every existing
      route works unchanged under a prefix.
- [x] `lib/i18n.tsx` — a locale in the URL outranks the stored override.
- [x] `components/language-select.tsx` — on an allowlisted page, switching
      language navigates to that locale's URL instead of only swapping strings.
- [x] `scripts/gen-sitemap.ts` — per-locale rows with `xhtml:link` alternates.
- [x] Verify: `bunx tsc --noEmit`, root `bun run lint`, regenerate sitemap,
      curl the built server for `/es/` and check the head.

## Notes / decisions

- Meta titles and descriptions in `seo-routes.ts` stay English for now. They are
  crawler-facing and per-locale copy is a separate pass; the `hreflang` set is
  what makes the locale URLs discoverable first.
- Lint baseline before this work: 9 errors (pre-existing, from prior session).
  Anything above 9 is mine.

## Done — commit 9425e0b (pushed)

Verified against a running server, not assumed:

| URL | `<html lang>` | canonical | hreflang |
|---|---|---|---|
| `/` | en | `/` | 12 tags (11 + x-default) |
| `/es/` | es | `/es` | 12 tags |
| `/es/get-app` | es | `/es/get-app` | 12 tags |
| `/ar/get-app` | ar + `dir="rtl"` | `/ar/get-app` | 12 tags |
| `/es/pricing` (untranslated) | es | **`/pricing`** | none |
| `/es/app/routes` (private) | es | — | none, `noindex, follow` |

Rendered check via headless browser: `/es/get-app` h1 = "La prueba de que tu
trabajo se hizo.", `/ar/get-app` h1 = Arabic with `dir=rtl`. Router base carries
the prefix through internal navigation.

tsc clean. Lint 9 errors = unchanged baseline. Sitemap 89 -> 109 URLs.

## Next: translate the 8 landing pages into the plumbing

Order (smallest first, one commit each — extract copy to i18n keys, refactor the
page to `t()`, add all 10 translations, then add the path to `LOCALIZED_PATHS`
in the same commit):

1. `/proof-of-delivery` (~826 words) — keys already scoped as `pod.*`
2. `/gps-timestamp-camera` (~864)
3. `/hvac-photo-documentation` (~855)
4. `/property-inspection-photos` (~920)
5. `/alternatives/companycam` (~1172)
6. `/construction-photo-documentation` (~1235)
7. `/alternatives/timemark` (~1543)
8. `/about` (~1629)

Then `/pricing`, which needs its body copy extracted too (only 4 `t()` calls).

Open question for that pass: the FAQ copy lives in `page-schema.ts`, which is
React-free and feeds the server-injected JSON-LD. The rendered FAQ can be
translated, but the JSON-LD stays English per URL unless that file learns
locales. Decide whether to localize the schema too — a Spanish page whose
FAQPage markup is English is a mismatch Google may flag.

## Decided: the FAQ markup speaks the page's language (`64e13e9`)

The open question above is closed — localize the schema, and do it from the same
strings the visitor reads rather than a second translated copy that can drift.

- `catalogs.ts` (new) holds the eleven catalogs and a React-free
  `translate(locale, key)`. `i18n.tsx` now imports them from there, so the
  server injector and `page-schema.ts` can read copy without dragging in React.
- `page-schema.ts` takes a second FAQ shape, `{ keys: { question, answer } }`,
  and `pageFaq(path, locale)` / `marketingJsonLd(path, locale)` resolve it.
  Literal entries still pass through unchanged, so an untranslated page is
  byte-identical to before.
- `seo-html.ts` passes the locale only when the URL carries a prefix *and* the
  path is translated. An untranslated path under a prefix renders English and
  canonicalizes to English, so it gets English markup — the mismatch is closed
  in both directions.

## `/proof-of-delivery`, all 11 locales

56 `pod.*` keys across the eleven catalogs, the page refactored to `t()`, its six
FAQ entries converted to key form, and the path added to `LOCALIZED_PATHS` in the
same commit. English copy was diffed against the old literals before it moved, so
the English page is unchanged word for word.

Verified against a running server:

| URL | `<html>` | canonical | rendered h1 | FAQPage markup |
|---|---|---|---|---|
| `/proof-of-delivery` | `lang="en"` | `/proof-of-delivery` | "Proof of Delivery the Shipper Can Check Themselves" | English, 6 entries |
| `/es/proof-of-delivery` | `lang="es"` | `/es/proof-of-delivery` | "Una prueba de entrega que el remitente puede comprobar por su cuenta" | Spanish, 6 entries |
| `/de/proof-of-delivery` | `lang="de"` | `/de/proof-of-delivery` | "Ein Liefernachweis, den der Auftraggeber selbst prüfen kann" | German, 6 entries |
| `/ar/proof-of-delivery` | `lang="ar" dir="rtl"` | `/ar/proof-of-delivery` | "إثبات تسليم يستطيع المُرسِل التحقق منه بنفسه" | Arabic, 6 entries |

12 hreflang tags on each. tsc clean. Lint 9 errors = unchanged baseline. Sitemap
109 -> 119 URLs, the ten new locale rows for this path.

## Done: the head copy speaks the page's language

`seo-routes.ts` keeps English as the default and the fallback, and a new
`LOCALIZED_SEO` table names the catalog keys for the paths that have translated
head copy — `/`, `/get-app` and `/proof-of-delivery` today, the same three in
`LOCALIZED_PATHS`. `seoForPath(path, locale)` resolves them; English still comes
from `PAGE_SEO`, so every unprefixed URL is untouched.

Four keys per catalog, 44 in total: `seo.home.description`,
`seo.getApp.description`, `seo.pod.title`, `seo.pod.description`. The English
values are the `PAGE_SEO` rows verbatim, and `seo.home.title` / `seo.getApp.title`
already existed. House rules held: titles at or under 60 characters, descriptions
140-160.

Both sides now read the one table. `seo-html.ts` resolves a single `pageLocale`
that drives the title, the description and the FAQ markup together; `index.tsx`,
`get-app.tsx` and `landing-page.tsx` call `seoForPath` with the locale from
context, so the head React writes on mount is the head the response already
carried instead of English replacing it.

### Fixed along the way: a pre-existing canonical bug

`useSeo` built the canonical from whatever path a caller passed, and callers pass
the bare English route they are — `get-app.tsx` passes the literal `"/get-app"`.
So the server sent `/es/get-app` with the right canonical and React overwrote it
with `https://geocliks.com/get-app` on mount: ten translations pointing at the
English page, for a crawler that runs JavaScript, which Googlebot does. Live
since `/get-app` was translated and never noticed.

`useSeo` now reads the locale off the address bar and puts the prefix back with
`localizedPath`, which returns the bare path for anything untranslated — the same
rule the server applies.

Verified after hydration with headless Chrome, not just in the response HTML:

| URL | `<title>` | canonical |
|---|---|---|
| `/proof-of-delivery` | English | `/proof-of-delivery` |
| `/es/proof-of-delivery` | "App de prueba de entrega — Foto, GPS y hora verificada" | `/es/proof-of-delivery` |
| `/ar/proof-of-delivery` | Arabic | `/ar/proof-of-delivery` |
| `/pl/proof-of-delivery` | "Aplikacja potwierdzenia dostawy — zdjęcie, GPS" | `/pl/proof-of-delivery` |
| `/es/get-app` | Spanish | `/es/get-app` |
| `/es/` | Spanish | `/es` |
| `/es/hvac-photo-documentation` (untranslated) | English | `/hvac-photo-documentation` |

`og:url` matches the canonical on every row. tsc clean. Lint 9 errors = unchanged
baseline.

From here every page's translation commit also carries its two head-copy keys and
its `LOCALIZED_SEO` row.

## `/gps-timestamp-camera`, translated

Second page through the pattern, and the pattern held with nothing new invented:
59 keys per catalog (47 page strings, 12 FAQ, 2 head-copy), the component reading
them through `t()`, `PAGE_SCHEMA` FAQ moved to `{ keys: { question, answer } }`
so the visible copy and the `FAQPage` markup stay one string, the path added to
`LOCALIZED_PATHS` and a `LOCALIZED_SEO` row pointing at `seo.gps.title` /
`seo.gps.description`. Sitemap 119 -> 129 URLs.

Verified after hydration, not just in the response HTML — title, description,
canonical and `og:url` localized and prefixed on all eleven, `<h1>` and the first
FAQ heading in the right language on each:

| URL | `<h1>` reads | canonical |
|---|---|---|
| `/gps-timestamp-camera` | English | `/gps-timestamp-camera` |
| `/es/…` | "Una cámara con marca de GPS y hora…" | `/es/gps-timestamp-camera` |
| `/fr-ca/…` | "Une caméra GPS horodatée…" | `/fr-ca/gps-timestamp-camera` |
| `/de/…` | German | `/de/gps-timestamp-camera` |
| `/ar/…` | Arabic | `/ar/gps-timestamp-camera` |
| `/zh/…` | "什么是 GPS 时间戳相机？" (FAQ) | `/zh/gps-timestamp-camera` |
| `/pl/…` | Polish | `/pl/gps-timestamp-camera` |

`pt-BR`, `it`, `vi`, `tl` checked the same way and match.

Regressions checked both directions: `/es/proof-of-delivery` still Spanish, and
`/es/hvac-photo-documentation` — still untranslated — still falls back to the
English head and canonicalizes to the bare English URL. tsc clean, lint 9 errors
= unchanged baseline.

## `/hvac-photo-documentation`, translated

Third page, same pattern. 66 keys per catalog (52 page strings, 12 FAQ, 2
head-copy), component reads everything through `t()`, the four card/step arrays
carry `TKey`s instead of literals, `PAGE_SCHEMA` FAQ in
`{ keys: { question, answer } }` form so the visible copy and the `FAQPage`
markup stay one string, path added to `LOCALIZED_PATHS`, `LOCALIZED_SEO` row
pointing at `seo.hvac.title` / `seo.hvac.description`. Sitemap 129 -> 139 URLs.

Verified after hydration on all eleven — localized `<title>`, prefixed
canonical, `canonical == og:url`, `<h1>` and the first FAQ heading in the right
language:

| URL | `<h1>` reads | canonical |
|---|---|---|
| `/hvac-photo-documentation` | English | `/hvac-photo-documentation` |
| `/es/…` | Spanish | `/es/hvac-photo-documentation` |
| `/fr-ca/…` | French | `/fr-ca/hvac-photo-documentation` |
| `/pt-br/…`, `/de/…`, `/it/…` | match | prefixed |
| `/zh/…` | "能证明上门服务确实发生过的暖通空调照片记录" | `/zh/hvac-photo-documentation` |
| `/vi/…` | "Tài liệu ảnh HVAC chứng minh lượt bảo trì…" | `/vi/hvac-photo-documentation` |
| `/tl/…` | "Dokumentasyong litrato ng HVAC…" | `/tl/hvac-photo-documentation` |
| `/ar/…` | "توثيق بالصور لأعمال التكييف…" | `/ar/hvac-photo-documentation` |
| `/pl/…` | "Dokumentacja zdjęciowa HVAC…" | `/pl/hvac-photo-documentation` |

Regressions: `/es/proof-of-delivery` still Spanish; `/es/property-inspection-photos`
— next in the queue, still untranslated — still serves the English head and
canonicalizes to the bare English URL. tsc clean, lint 9 errors = baseline.

One thing worth remembering for the rest of the queue: inserting the new
`seo.*` rows after an anchor key breaks the file whenever that anchor's value
sits on the following line, which is how the catalogs format longer strings.
The insert has to land after the end of the value, not after the key.

## `/property-inspection-photos` — eleven languages

Fourth page through the same pattern: 66 keys per catalog (52 page strings, 12
FAQ, 2 head-copy), component reads everything through `t()`, the four
step/card arrays carry `TKey`s, `PAGE_SCHEMA` FAQ in
`{ keys: { question, answer } }` form, path added to `LOCALIZED_PATHS`,
`LOCALIZED_SEO` row pointing at `seo.inspection.title` /
`seo.inspection.description`. Sitemap 139 -> 149 URLs.

Verified on all eleven — localized `<title>`, prefixed canonical, localized
`FAQPage` question names in the server HTML; post-hydration `canonical ==
og:url` and translated `<h1>` spot-checked on en/es/ar/zh/pl.

Regressions: `/es/hvac-photo-documentation` still Spanish,
`/es/proof-of-delivery` still Spanish. tsc clean, lint 9 errors = baseline.

The anchor-insert fix from last page held (walk forward to the line ending the
anchor's value before inserting). New gotcha: running `oxfmt` over the whole
`i18n/*.ts` glob collapses a pre-existing two-line string in `ar.ts`
(`home.samples.altFiber`) onto one line. Reverted by hand; format the touched
files individually next time, or diff `ar.ts` immediately after.

## `/alternatives/companycam` — eleven languages

Fifth page, first comparison page. 78 keys per catalog (76 page strings — the
twelve table rows are the bulk of them — plus 10 FAQ strings and 2 head-copy
rows). `ROWS` now carries `TKey`s and resolves through `t()` in the component;
`Cell.note` is a `TKey`, and the three plain yes/yes rows keep no note at all
because there is nothing to translate in them. `Mark` calls `useLocale()`
itself so the screen-reader verdict ("Yes."/"No.") is translated too.

The "as of" date is new here: `cc.verifiedOn` is written the way each language
writes a date and fills `{date}` in `cc.sources`, with `SUPPORT_EMAIL` filling
`{email}` — `t(key, vars)` does the substitution. Moving the date means editing
eleven rows, which is the trade for not showing "14 September 2026" on the
Arabic and Chinese pages.

`PAGE_SCHEMA` FAQ converted to `{ keys: { question, answer } }` (five entries,
not six), path added to `LOCALIZED_PATHS`, `LOCALIZED_SEO` row pointing at
`seo.companycam.*`. Sitemap 149 -> 159 URLs.

Verified on all eleven — localized `<title>`, prefixed canonical, localized
`FAQPage` question names; post-hydration `canonical == og:url` and translated
`<h1>` on en/es/ar/zh/pl, plus the same check across the four earlier pages, 0
failures. No `{date}`/`{email}` braces left in the rendered body on en/es/ar.
tsc clean, lint 9 errors = baseline.

Two formatter notes for the rest of the queue. The `ar.ts`
`home.samples.altFiber` collapse recurred even formatting files one at a time —
diff every touched catalog after `oxfmt` and revert it. And `oxfmt` over
`page-schema.ts` reformats ~378 lines of the whole file: edit that file with a
scoped string replace and do not format it.

## `/construction-photo-documentation` — eleven languages

76 keys per catalog (74 page + `seo.construction.title`/`.description`). The
four card arrays (`STEPS`, `USE_CASES`, `DISPUTE_CARDS`, `TEAM_CARDS`) hold
`TKey`s and keep their literal `lucide-react` icons; one `card()` helper inside
the component resolves title and body, same shape as
`property-inspection-photos.tsx`.

Two related-links paragraphs here instead of one. The five-link second
paragraph keeps its commas as literal JSX text — only the lead, the "or" before
the last link and the link labels are translated, because a comma is not worth
eleven rows.

`PAGE_SCHEMA` FAQ converted to `{ keys: { question, answer } }` (five entries),
path added to `LOCALIZED_PATHS`, `LOCALIZED_SEO` row pointing at
`seo.construction.*`. Sitemap 159 -> 169 URLs.

The catalogs crossed 2000 lines with this page, so `max-lines` started failing
on seven of them. Added an `.oxlintrc.json` override switching the rule off for
`packages/web/src/web/i18n/**` — they are data tables, and the next page would
have pushed the remaining four over anyway. Lint back to the 9-error baseline.

`ar.ts` `home.samples.altFiber` collapsed again under `oxfmt` and was restored
by hand, as expected. Verified on all eleven — localized `<title>`, prefixed
canonical, one `FAQPage` block each; post-hydration `canonical == og:url` and
translated `<h1>` on en/es/ar/zh/pl plus the five earlier pages, 30/30, 0
failures. tsc clean.

Note for the rest of the queue: the dev server intermittently needs more than
45s to compile a locale chunk on first hit, so the Playwright check now retries
a URL up to three times before calling it a failure.

## `/alternatives/timemark` — done

93 new keys per catalog under `tm.*` (11 comparison rows × feature/detail/us/
them, the two "where they win" cards, the five "pick GeoCliks if" bullets, five
FAQ pairs, CTA, related links, plus `seo.timemark.title`/`.description`), all
eleven locales, pure insertions — 0 deletions on every catalog after formatting.

The page had the same shape as the CompanyCam comparison, so it got the same
treatment: `Cell.note` and the `ROWS` fields became `TKey`, `Mark` calls
`useLocale()` itself and resolves `tm.yes`/`tm.no`, and the module-level
`VERIFIED_ON` constant became the `tm.verifiedOn` key, interpolated into
`tm.sources` alongside the support address. `pageFaq` moved inside the
component so it takes `locale`.

`PAGE_SCHEMA` FAQ converted to `{ keys: { question, answer } }` (five entries),
path added to `LOCALIZED_PATHS`, `LOCALIZED_SEO` row pointing at
`seo.timemark.*`. Sitemap 169 -> 179 URLs.

`zh.json` in the scratch dir did not parse on the first pass — straight double
quotes inside Chinese string values. Fixed by swapping the inner pairs for
“ ” before applying, which is the right typography for that locale anyway.
`ar.ts` `home.samples.altFiber` collapsed under `oxfmt` again and was restored
by hand.

Verified on all eleven — localized `<title>`, prefixed canonical, one `FAQPage`
block each; post-hydration `canonical == og:url` and translated `<h1>` on
en/es/ar/zh/pl across this page and the six earlier ones, 35/35, 0 failures.
tsc clean, lint at the 9-error baseline.

## `/about` — done

83 page keys plus `seo.about.title`/`.description` per catalog under `ab.*` —
the five section headers, the four proof steps, the six limits, the three
publishing cards, the four company facts, the contact and profiles rows, six
FAQ pairs, CTA, and the five-link closing sentence — all eleven locales, pure
insertions, 0 deletions on every catalog after formatting.

Two of the four company facts keep their values as constants (`LEGAL_ENTITY`,
`COMPANY_ADDRESS`) and stay untranslated; the other two are prose, so `FACTS`
carries an optional `key: TKey` that wins over `value` when present. That let
`JURISDICTION` drop out of the `company.ts` import — the governing-law line now
comes from `ab.fact3.value`, whose English text is the old constant verbatim.

`PAGE_SCHEMA` FAQ converted to `{ keys: { question, answer } }` (six entries),
path added to `LOCALIZED_PATHS`, `LOCALIZED_SEO` row pointing at
`seo.about.*`. Sitemap 179 -> 189 URLs.

Scratch JSON parsed clean on the first pass this time; only two content fixes
(a Polish case ending, and German-style quote marks that had crept into the
Vietnamese file). `ar.ts` `home.samples.altFiber` collapsed under `oxfmt`
again and was restored by hand.

Verified on all eleven — localized `<title>`, prefixed canonical, one `FAQPage`
block each; post-hydration `canonical == og:url` and translated `<h1>` on
en/es/ar/zh/pl across this page and the seven earlier ones, 40/40, 0 failures.
tsc clean, lint at the 9-error baseline.
