# Android launch prep (2026-09-14)

Decisions from the user:
- Package name → `com.geocliks.app` (permanent, chosen deliberately)
- Production domain → `https://geocliks.com` (live; .net/.ca/.store/.online/.app all redirect to it)
- Android subscriptions → **no in-app selling**. Upgrades happen on the web.

## Work

1. [x] `app.json`: `android.package` + `ios.bundleIdentifier` → `com.geocliks.app`
2. [x] `google-services.json`: reissued by Firebase with `com.geocliks.app` registered. The old
       `com.timemark_a7k2.runable` client came back in the same file, so existing installs keep
       their push channel. Same project (`geocliks-d12b8`) and the same API key.
3. [x] `expo-updates` installed + `updates.url` / `runtimeVersion` in app.json (OTA JS updates)
4. [x] Permission rationale: `expo-camera`, `expo-location`, `expo-image-picker` declared in
       app.json with honest permission strings (feeds Play Data safety + iOS Info.plist). No
       background location is requested; the app never needed it.
5. [x] Android paywall off: `lib/purchases.ts` gained `sellsSubscriptions()`; `app/plans.tsx` is
       read-only on Android and `pick()` refuses to run there; `app/profile.tsx` drops the Upgrade
       button and the Stripe note on Android. Those two were the only purchase entry points in the
       app (checked by grep for checkout / upgrade / paywall across app + components).
6. [x] i18n: `plans.currentOnly` + `plans.noChangesHere` across all 11 catalogs
7. [x] Gates: mobile typecheck clean, root lint clean (401 files), web build clean.
8. [x] Verified on a real Android build, which is the only place this can be seen — `Platform.OS`
       is `"web"` in the dashboard preview, so the Android branch never renders there:
       - Plans: lede, current-plan card with the CURRENT chip, and "Plan changes are not handled
         in this app." No price on the card, no other plans, no CTA, no Stripe mention.
       - Profile: plan name and the same note. No Upgrade button, no Stripe note.
       - Sign-in reaches real data; push notifications arrive.
       - Drawer Help / Terms / Privacy open `geocliks.co…` rather than the preview host.

## Resolved: the platform-managed API URL

`expo.extra.apiUrl` in the repo still reads as the preview host and has to stay that way — the
field is platform-managed (`expo.extra` and `expo.scheme` both are; the managed-auth broker
validates the scheme), and the publish flow injects the production value at build time. The publish
dashboard has no field for it, which is consistent with that.

Confirmed correct on device rather than assumed: `lib/web-help.ts` builds the drawer's Help, Terms
and Privacy links from the very same `extra.apiUrl` that `lib/api.ts` and `lib/auth.ts` use, and
those links open geocliks.com on the installed build. Sign-in alone would not have proved it, since
preview and production may read the same database.

## Signing, for later

EAS generated and holds the Android keystore on the first build. It is permanent: once Play has an
app signed with it, every future update must use the same keystore or the upload is rejected. Back
it up via `eas credentials` and never regenerate it.

## Compliance note on the paywall

Google's Payments policy bars leading users to a non-Play payment method. So the Android build
shows the current plan and nothing purchasable: no prices for other plans, no upgrade button, no
checkout, and no link or mention of where to pay. This is the standard multi-platform-SaaS posture
(Slack/Notion/Salesforce) and keeps GeoCliks clear of both the payments policy and anti-steering,
in every country, with no Google fee.

Play Console answers that follow from it: **in-app purchases — no**. Data safety declares location
(precise, for stamping photos), photos and videos, email and name; all tied to app functionality,
none sold on.

## Known cosmetic inconsistency (not a launch blocker)

Plans shows the plan as BUSINESS while Profile shows PLATFORM STAFF. They read different sources —
Profile via `useOrg()`, Plans via `useBillingCurrent()`. Worth reconciling, unrelated to Play.
