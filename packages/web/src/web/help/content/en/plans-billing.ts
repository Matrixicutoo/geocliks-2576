import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const plansBilling: Category = {
  slug: "plans-billing",
  title: "Plans and billing",
  summary: "What each plan covers, how to change it, and how to find an invoice.",
  icon: "CreditCard",
  sections: [
    {
      title: "Choosing a plan",
      articles: [
        {
          slug: "compare-plans",
          title: "Compare plans",
          summary: "What you get on Free, Plus, Business, Crew 10, Crew 25 and Enterprise.",
          keywords: ["plans", "pricing", "compare", "free", "plus", "business", "crew", "limits"],
          body: [
            p(
              "There are two families of plan. The evidence plans below are for documenting work. The Delivery plans are for operations that are mostly driving, and are covered in their own article.",
            ),
            p(
              "Current prices are on the pricing section of geocliks.com. This page covers what each plan actually allows, which is the part people get caught out by.",
            ),
            h("Evidence plans"),
            table(
              ["Plan", "For", "Seats"],
              [
                ["Free", "Trying it out, or occasional solo documentation.", "1"],
                ["Plus", "One person working full time, sharing with clients.", "1"],
                ["Business", "A small crew with a shared teamspace.", "5"],
                ["Crew 10", "A growing team.", "10"],
                ["Crew 25", "A larger operation.", "25"],
                ["Enterprise", "Custom volumes and terms. Talk to us.", "Custom"],
              ],
            ),
            h("What changes as you move up"),
            table(
              ["Capability", "Where it starts"],
              [
                ["Verified capture, watermarks, photo codes", "Free"],
                ["Unlimited captures per month", "Plus"],
                ["Excel, ZIP and KMZ exports", "Plus"],
                ["Share links", "Plus"],
                ["Unlimited projects and watermark templates", "Plus"],
                ["Your logo on watermarks", "Plus"],
                ["Full-length video clips", "Plus"],
                ["Teamspace with invited members", "Business"],
                ["Roles and per-project access", "Business"],
              ],
            ),
            h("The Free plan in detail"),
            ul(
              "300 captures a month.",
              "Video is limited to 30-second clips, and only for the first three days.",
              "Three projects, one seat, two watermark templates.",
              "PDF export of up to 20 photos. No Excel, ZIP or KMZ.",
              "No teamspace, so no invited members and no share links.",
              "No delivery routes.",
            ),
            note(
              "Every plan, Free included, gives you the same verification: the same watermark data, the same photo code, the same seal. Verification is not a paid upgrade.",
            ),
            h("Delivery on the evidence plans"),
            p(
              "Plus and above include a monthly allowance of delivery stops, so you can run routes without moving to a Delivery plan: a modest allowance on Plus, more on Business, and progressively more on Crew 10 and Crew 25. If you are driving every day, the Delivery plans are cheaper per stop.",
            ),
            see("plans-billing/delivery-plans", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "delivery-plans",
          title: "Delivery plans",
          summary:
            "Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 and Fleet 500 — sized by stops per month and drivers.",
          keywords: ["delivery", "lite", "pro", "fleet", "stops", "drivers", "dispatch"],
          body: [
            p(
              "The Delivery plans are for operations where driving is the business rather than a side effect of it. They include everything in the evidence plans plus a much larger monthly stop allowance.",
            ),
            table(
              ["Plan", "Stops per month", "Drivers", "Live dispatch", "Smart optimizer"],
              [
                ["Delivery Lite", "500", "2", "No", "No"],
                ["Delivery Pro", "2,000", "5", "Yes", "Yes"],
                ["Delivery Fleet", "6,000", "15", "Yes", "Yes"],
                ["Delivery Fleet 30", "12,000", "30", "Yes", "Yes"],
                ["Delivery Fleet 200", "80,000", "200", "Yes", "Yes"],
                ["Delivery Fleet 500", "200,000", "500", "Yes", "Yes"],
              ],
            ),
            h("What the two gated features are"),
            ul(
              "Live dispatch — adding stops to a route that is already being driven. Pro, Fleet, Fleet 30, Fleet 200 and Fleet 500.",
              "Smart optimizer — road-network route ordering rather than the standard solver. Pro, Fleet, Fleet 30, Fleet 200 and Fleet 500. On plans without it, the standard optimizer runs instead so you still get an ordered route.",
            ),
            h("How to get one"),
            p(
              "Every Delivery plan is self-serve from the billing page: pick the plan, go through a secure hosted checkout, enter your card details. The new limits apply as soon as it completes. A Delivery plan starts with a free trial, so its button reads Free trial. If your workspace is already on a Delivery plan, moving to another one bills straight away and the button reads Switch to instead — the trial is once per workspace, not once per plan.",
            ),
            steps(
              "Open Billing in your workspace settings.",
              "Choose the Delivery plan that matches your volume.",
              "Complete the checkout. You are returned to GeoCliks with the stop allowance already active.",
            ),
            warn(
              "Enterprise is the only plan that is not self-serve. Its card shows Talk to us rather than a checkout button, and opens a prefilled email to sales@geocliks.com. Nobody is charged automatically and nothing changes on your workspace until we set it up with you.",
            ),
            note(
              "Only the workspace owner can change plan. Admins manage people, not the subscription.",
            ),
            h("Which one fits"),
            p(
              "Count the stops you actually deliver in a normal month, then add a bit of room for your busiest week. Going over the allowance stops route building until the next month, so the plan should cover your peak, not your average.",
            ),
            note(
              "Stops are counted per calendar month and reset on the first. A stop counts when it is added to a route, whether or not it ends up delivered.",
            ),
            see("delivery-routes/delivery-overview", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Managing your subscription",
      articles: [
        {
          slug: "upgrade-or-change-plan",
          title: "Upgrade or change your plan",
          summary: "Change plan from the billing page — the owner does this.",
          keywords: ["upgrade", "change plan", "checkout", "downgrade", "switch"],
          body: [
            p(
              "Plans are changed from Billing in your workspace settings. Only the workspace owner can do it — admins manage people, not the subscription.",
            ),
            h("Change plan"),
            steps(
              "Open Billing.",
              "Pick the plan you want.",
              "For a self-serve paid plan, you are taken to a secure hosted checkout to enter card details, and returned to GeoCliks when it completes.",
              "For Enterprise, you get a prefilled email to our team instead.",
              "The new limits apply as soon as the change lands.",
            ),
            h("Moving to a bigger plan"),
            ul(
              "New limits take effect immediately.",
              "Nothing you have already captured is affected.",
              "Extra seats become available straight away, so you can invite people right after.",
            ),
            h("Moving down"),
            p(
              "A downgrade is refused while your workspace is bigger than the target plan. If you have eight members and move to a five-seat plan, you will be told to remove members first. That is deliberate — the alternative is silently cutting three people off.",
            ),
            note(
              "Picking the Free plan, or re-picking the plan you are already on, does not go through checkout at all.",
            ),
            see("plans-billing/seats-and-billing", "plans-billing/cancel-or-downgrade"),
          ],
        },
        {
          slug: "seats-and-billing",
          title: "Seats",
          summary: "What a seat is, what uses one, and what to do when you run out.",
          keywords: ["seats", "members", "invite", "limit", "capacity", "users"],
          body: [
            p(
              "A seat is one person who can sign in to your workspace. Your plan includes a fixed number, and the owner counts as one of them.",
            ),
            h("What consumes a seat"),
            ul(
              "Every member of the workspace, whatever their role. A field member costs the same seat as an admin.",
              "Every pending invitation, until it is accepted or revoked.",
            ),
            p(
              "Pending invitations hold a seat on purpose. Otherwise ten invitations could be issued against two seats and everybody who accepted would be over the plan.",
            ),
            h("Out of seats"),
            steps(
              "Open Team and look at the pending invitations. Revoke any that are not going to be accepted.",
              "Remove members who have left. Their captures and history stay in the workspace.",
              "If you genuinely need more people, move up a plan.",
            ),
            note(
              "Removing a member frees their seat immediately and never deletes their work.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "payment-and-invoices",
          title: "Payment and invoices",
          summary: "Where card details live, how to update them, and where to get a receipt.",
          keywords: ["invoice", "receipt", "card", "payment", "vat", "tax", "billing portal"],
          body: [
            p(
              "Payments are handled by our payment processor, not by GeoCliks. Your card number is never stored on our servers.",
            ),
            h("Update a card"),
            steps(
              "Open Billing in your workspace settings.",
              "Open the billing portal.",
              "Update the payment method there.",
            ),
            h("Invoices and receipts"),
            ul(
              "Every payment produces an invoice, available in the billing portal.",
              "Invoices are emailed to the billing address on the subscription, which is not always the owner's login email — check it if receipts are going to the wrong person.",
              "Add your company name and tax details in the portal and they appear on future invoices.",
            ),
            h("A payment that failed"),
            p(
              "The processor retries a failed payment before anything changes on your workspace. If it keeps failing, your workspace drops to the Free plan's limits — your captures are not deleted, but exports, share links and teamspace stop working until payment succeeds.",
            ),
            warn(
              "If your workspace is on a plan we set up for you by hand, there may be no self-serve portal. Email support@geocliks.com and we will sort the invoice out.",
            ),
            see("plans-billing/cancel-or-downgrade", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "cancel-or-downgrade",
          title: "Cancel or downgrade",
          summary: "How to stop paying, and exactly what happens to your evidence.",
          keywords: ["cancel", "downgrade", "delete", "refund", "export", "leave", "data"],
          body: [
            p(
              "You can stop paying whenever you like. The important question is what happens to the work, so here it is plainly.",
            ),
            h("Cancel"),
            steps(
              "Export anything you will need outside GeoCliks first. Do this before you cancel, because export formats are limited on the Free plan.",
              "Reduce your workspace to fit the plan you are moving to, if you are downgrading to fewer seats.",
              "Open Billing and either move to the Free plan or cancel in the billing portal.",
            ),
            h("What happens to your data"),
            ul(
              "Your captures are not deleted when you downgrade or cancel.",
              "Verification keeps working. Photo codes still resolve, and seals still check out.",
              "Paid features stop: Excel, ZIP and KMZ exports, share links, teamspace and delivery routes.",
              "Existing share links stop working while your plan does not include them.",
              "Members beyond the new seat count lose access, which is why a downgrade asks you to remove them first.",
            ),
            warn(
              "Export before you cancel, not after. On the Free plan you are limited to a PDF of up to 20 photos, which is not a way to get a year of work out.",
            ),
            h("Deleting the workspace entirely"),
            p(
              "Cancelling is not deleting. If you want the workspace and its media removed for good, email support@geocliks.com from the owner's address and ask for deletion. It cannot be undone and we will confirm before doing it.",
            ),
            see("legal/data-retention", "teamspace/reports-and-exports"),
          ],
        },
      ],
    },
  ],
};
