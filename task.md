# Teamspace settings page (web + mobile)

## Goal
Company-settings form from the user's screenshot, on a NEW dedicated Teamspace settings page,
split out of Profile, reachable from the workspace card at the top of the menu (the one under
the profile card) on both web and mobile.

## Fields (from screenshot)
Company Name*, Phone Number, Email, Address 1, Address 2, City, State, Postal Code,
Country (select), Time Zone (select), Industry (select), Company Size (select),
How did you hear about us? (select), Company Logo (upload + drop zone).

`name`, `industry`, `logoUrl` already exist on `organizations`. The rest are new columns.

## Steps
- [x] 1. Generate shared option data (countries, timezones, sizes, industries, referral) for web + mobile
- [x] 2. Schema: add columns to `organizations` (pushed)
- [x] 3. API: extend `orgs.update` input; `orgs.current` already spreads the row
- [ ] 4. Web: new page `/app/teamspace-settings`, route, query hook
- [ ] 5. Web: strip workspace section from `app-profile.tsx`
- [ ] 6. Web: sidebar workspace card -> `/app/teamspace-settings`
- [ ] 7. Mobile: new screen `app/teamspace-settings.tsx`
- [ ] 8. Mobile: strip workspace name/logo from `(tabs)/settings.tsx`
- [ ] 9. Mobile: drawer workspace card -> `/teamspace-settings`
- [x] 10. i18n keys (web `en.ts` + 10 others fall back to en; mobile `en.ts` + others)
- [ ] 11. db:push, typecheck, lint, build, verify in browser both platforms

## Decisions
- Route names: web `/app/teamspace-settings`, mobile `/teamspace-settings`.
- Edit = OWNER ONLY (user confirmed). `orgs.update` now uses `requireRole(role, "owner")`.
  Everyone else sees the page read-only.
- Only the "Company Info" tab from the screenshot. The other tabs in that shot
  (Email Recaps, Exports, Labs, Legal) were not requested.
- Country/timezone lists generated from Node `Intl` so they are complete, not curated.
