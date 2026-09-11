# How to turn on the three Delivery plans

**What this fixes:** the Delivery Lite, Delivery Pro and Delivery Fleet cards on your billing page currently say *"Talk to us"* instead of *"Choose"*. They say that because those three plans have no Autumn plan attached to them yet. Autumn is the billing service that actually takes the customer's card.

**What you have to do:** create three plans in Autumn, then paste three IDs into your admin page. That's it.

**What I have to do afterwards:** nothing. The code is already finished and waiting. The buttons flip themselves the moment you paste the IDs.

**Time:** about 15 minutes.

---

## Before you start

You need two things:

1. **Your Autumn login.** Autumn is where GeoCliks plans live. Your existing plans (Free, Plus, Business, Crew 10, Crew 25) are already in there.
2. **Stripe connected to Autumn.** Autumn sits on top of Stripe and passes the money through to it. Your five existing paid plans already work, so this is almost certainly already done. If a plan later refuses to save because Stripe isn't connected, that's the thing to check.

Here are the three plans and the exact numbers to use. Nothing here is a guess — I read them out of the GeoCliks code.

| Plan name | Price | Billing | Plan ID to type |
|---|---|---|---|
| Delivery Lite | $39 | Monthly | `delivery-lite` |
| Delivery Pro | $99 | Monthly | `delivery-pro` |
| Delivery Fleet | $249 | Monthly | `delivery-fleet` |

---

## Part 1 — Create the three plans in Autumn

Do these steps once for **Delivery Lite**, then repeat the whole thing for **Delivery Pro**, then again for **Delivery Fleet**.

1. Sign in to Autumn and make sure you are looking at the **GeoCliks** organisation (top of the screen), not a different one.

2. In the left-hand menu, click **Plans**.

   > Heads up: Autumn used to call these "Products" and you'll still see that word in older screenshots and blog posts. The menu you want today is **Plans**.

3. Click the button to create a new plan.

4. **Name** it exactly `Delivery Lite`. This is just the label people see.

5. **Price type** — choose **Paid recurring**. (Your other options are Free, Paid one-off and Variable. None of those are right; this is a monthly subscription.)

6. **Amount** — `39`. Currency **USD**. Interval **Monthly**.

7. **Plan ID** — type `delivery-lite`.

   This is the single most important field on the page. It has to match the code letter for letter — all lowercase, one hyphen, no spaces, no capitals, no "GeoCliks" in front of it. If it doesn't match, the button will look fine but the customer's payment won't attach to the right plan in GeoCliks.

8. **Plan group** — put it in **the same group as your existing Plus / Business / Crew plans**. If those plans are not in any group, leave this one with no group either.

   This one is easy to get wrong and the consequence is real, so here's why. A plan group means "a customer can hold one plan from this group *and* one plan from another group at the same time." GeoCliks stores exactly **one** plan per workspace — there is a single plan field on each company. So if you put Delivery in its own separate group, a customer could end up paying for Business *and* Delivery Pro at the same time in Autumn, while GeoCliks only shows one of them. Same group means choosing Delivery Pro **replaces** their old plan, which is what you want.

9. Save the plan.

10. Repeat steps 3–9 for **Delivery Pro** ($99, ID `delivery-pro`) and **Delivery Fleet** ($249, ID `delivery-fleet`).

You should now have three new plans listed in Autumn.

---

## Part 2 — Paste the IDs into GeoCliks

11. In Autumn, copy the **plan ID** of Delivery Lite. Copy it, don't retype it — a typo here is invisible and breaks checkout.

12. Go to `/admin/plans` in GeoCliks and open the **Delivery Lite** row.

13. Paste the ID into the **Autumn plan ID** field. Save.

14. Do the same for Delivery Pro and Delivery Fleet.

---

## Part 3 — Check it actually worked

15. Open your billing page. All three Delivery cards should now read **Choose** instead of **Talk to us**. If one still says "Talk to us", its Autumn plan ID field is empty or didn't save — go back to step 13 for that one.

16. **Do one real test.** Click **Choose** on Delivery Lite from a test workspace. You should land on an Autumn/Stripe checkout page showing **$39 / month**. Either complete it with a test card or cancel out of it.

    Don't skip this. The button turning into "Choose" only proves the ID field isn't empty — it does not prove the ID is *correct*. The checkout page is the only thing that proves that.

17. If checkout opens and shows the right price, you're done. All three work the same way.

---

## If something goes wrong

**Button still says "Talk to us"** — the Autumn plan ID field for that plan is blank. Re-do step 13.

**Clicking Choose shows an error or "unavailable"** — the ID in GeoCliks doesn't match any plan in Autumn. Almost always a typo, a capital letter, or a trailing space. Copy the ID from Autumn again and re-paste.

**Checkout opens but the price is wrong** — the price is wrong in Autumn, not in GeoCliks. Fix the amount on the Autumn plan.

**Someone pays but their workspace doesn't upgrade** — this is the plan ID mismatch again, showing up on the other side. GeoCliks matches the incoming payment back to a plan by that exact ID string.

Send me a screenshot of whatever you see and I'll tell you which of these it is.

---

## Why I couldn't just do this for you

Autumn is an outside service holding your Stripe account. Creating plans there means creating real billing products that can charge real customers, using your own credentials — I can't reach it from here, and I shouldn't be the one creating things that take money.

I also deliberately did **not** fill in the three ID fields with made-up values to make the buttons look right. That would have flipped every card to "Choose" and then failed the instant a customer clicked one. A button that says "Talk to us" is honest; a checkout that dies mid-payment costs you the customer.

---

> This is visible in the Runable preview only. geocliks.com will not change until a Publish. Support asked you not to retry publishing until they trace the failed mobile builds, so it is your call whether to wait for Tuesday's call with Saksham.
