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

- [ ] `lib/locale-url.ts` — React-free core: segment map, split/join helpers,
      allowlist, `alternatesFor(path)`.
- [ ] `lib/seo-html.ts` — strip the prefix before the SEO lookup; emit
      `hreflang` alternates + `x-default`; canonical = the locale URL; set
      `<html lang>` and `dir`.
- [ ] `app.tsx` — wrap the router in `<Router base={prefix}>` so every existing
      route works unchanged under a prefix.
- [ ] `lib/i18n.tsx` — a locale in the URL outranks the stored override.
- [ ] `components/language-select.tsx` — on an allowlisted page, switching
      language navigates to that locale's URL instead of only swapping strings.
- [ ] `scripts/gen-sitemap.ts` — per-locale rows with `xhtml:link` alternates.
- [ ] Verify: `bunx tsc --noEmit`, root `bun run lint`, regenerate sitemap,
      curl the built server for `/es/` and check the head.

## Notes / decisions

- Meta titles and descriptions in `seo-routes.ts` stay English for now. They are
  crawler-facing and per-locale copy is a separate pass; the `hreflang` set is
  what makes the locale URLs discoverable first.
- Lint baseline before this work: 9 errors (pre-existing, from prior session).
  Anything above 9 is mine.
