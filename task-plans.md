# Task — revise plan copy + add delivery plans

## Decisions (Luc delegated pricing to me)

Cost basis, from geocliks-routes.report spec:
- Google Route Optimization, single-vehicle SKU: $10 / 1,000 stops ($0.01/stop), 5,000 free/mo.
- Geocoding: $5 / 1,000 addresses, 10,000 free/mo, cached.
- Rule already built: assign driver first, optimize once per driver route (never multi-vehicle).

Competitor prices (verified Sept 2026):
- OptimoRoute: Lite $35.10/driver/mo (700 orders), Pro $44.10/driver/mo (1,000 orders).
- Spoke (ex Circuit for Teams): $100/mo 500 stops, $125/mo 1,000, $200/mo 2,000, $1,000/mo Expert.
- Routific: free <=100 orders, $150/mo up to 1,000 orders, ~$49/driver advanced (3 driver min).
- Onfleet: $619/mo 2,500 tasks, $1,349/mo 5,000, $3,099+/mo enterprise.

Model: flat monthly per workspace, tiered by monthly stops (matches his cost driver and his
existing flat-bill positioning). Undercut Spoke/Routific ~2x, include the evidence product.

New plans:
| id | name | price | stops/mo | drivers | optimizer | dispatch |
|---|---|---|---|---|---|---|
| delivery-lite | Delivery Lite | $39 | 500 | 2 | local solver | no |
| delivery-pro | Delivery Pro | $99 | 2,000 | 5 | smart (Google) | yes |
| delivery-fleet | Delivery Fleet | $249 | 6,000 | 15 | smart + balancing | yes |
Custom/Enterprise stays the contact-sales tier, now covering unlimited delivery.

Gross margin: Lite ~$39 vs ~$8 cost (79%), Pro ~$99 vs ~$25 (75%), Fleet ~$249 vs ~$70 (72%).

Delivery allowance on the existing evidence plans (so nothing breaks today):
free 0 · plus 50 · business 150 · crew10 300 · crew25 600 · enterprise unlimited.

Enforcement (my call): enforce the things that cost money and are countable.
- stops per month (addStops) -> PAYMENT_REQUIRED
- delivery off entirely when allowance is 0 (routes.create)
- dispatch mode gated
- smart optimizer gated (fall back to free local solver)
Copy-only: signature capture, tracking links, driver seat count (seats already enforced).

## Stages
- [x] S0 snapshot legacy shipped copy -> /tmp/planwork/legacy.json
- [x] S1 plans.ts: PlanLimits + 6 revised plans + 3 delivery plans + rowToPlan defaults (tsc clean)
- [x] S2 plans-legacy.ts LEGACY_SHIPPED + refreshLegacyRow() in syncPlans (needs DB verify on restart)
- [x] S3 enforcement: routes.ts create/addStops/addLiveStop/optimize; admin-plans limits merge;
      billing.changePlan guard for paid-plan-without-autumnPlanId
- [x] S4 pricing UI: group Evidence vs Delivery on landing + billing
- [x] S5 plan-copy.ts translations for changed/added copy (fallback is English, not wrong text)
- [x] S6 lint OK, turbo typecheck OK, build OK -> browser check + DB verify + deliver
      NOTE: `bunx tsc --noEmit` inside packages/web checks NOTHING (files:[] + project refs).
      Always use `bun run typecheck` (turbo) — it is what caught the broken routes.ts import.
      Fixed this stage: routes.ts had duplicated garbage on lines 1062-63 and had lost its
      `import { type Plan, planOf } from "../lib/plans";` line.

## Notes / risks
- syncPlans() never overwrites existing rows -> S2 is required or none of the new copy shows.
- New delivery plans have no Autumn/Stripe product yet -> autumnPlanId null. Checkout must not
  silently switch a workspace to a paid plan for free. Route them to sales until products exist.
- Luc's own "We Deliver" workspace is on Business = 150 stops/mo cap once enforced. Flag it.
