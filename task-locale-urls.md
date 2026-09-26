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
