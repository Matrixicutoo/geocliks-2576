import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const deliveryRoutes: Category = {
  slug: "delivery-routes",
  title: "Delivery Routes",
  summary:
    "Plan a driver's day, send them out, and close every stop with a proof photo the recipient can see.",
  icon: "Route",
  sections: [
    {
      title: "Plan the day",
      articles: [
        {
          slug: "delivery-overview",
          title: "How Delivery works",
          summary:
            "The shape of a delivery day in GeoCliks: build a route, assign a driver, close each stop with evidence.",
          keywords: ["delivery", "routes", "dispatch", "driver", "proof of delivery", "pod"],
          body: [
            p(
              "Delivery Routes takes the same verified-photo idea and applies it to a driver's day. You build a list of stops in the office, hand it to a driver, and the driver closes each stop by photographing the drop. The photo carries the verified time, GPS position and address, so a delivery dispute has an answer.",
            ),
            h("The day, start to finish"),
            steps(
              "The office creates a route for a date and pastes in the day's addresses.",
              "GeoCliks resolves the addresses to map positions, and you fix any it could not place.",
              "You order the stops, either by hand or with the optimizer.",
              "You assign the route to a driver, who sees it on their phone.",
              "The driver works down the list, photographing each drop.",
              "Recipients with an email address get a proof-of-delivery message with the photo.",
              "The office watches the route close out in real time and keeps the audit trail.",
            ),
            h("Two kinds of route"),
            table(
              ["Mode", "Use it when"],
              [
                [
                  "Planned",
                  "You know the whole day up front. Build it, optimize it, send it out.",
                ],
                [
                  "Dispatch",
                  "Orders arrive during the shift and get slotted into a driver's remaining stops.",
                ],
              ],
            ),
            h("Every stop ends in one of four states"),
            ul(
              "Delivered — closed with a proof photo.",
              "Failed — the driver could not deliver, with a reason and a photo.",
              "Skipped — there was nothing to deliver here. The only close with no photo.",
              "Pending — not reached yet.",
            ),
            note(
              "Delivery is a separate capability from evidence capture. Your allowance of delivery stops per month comes from your plan, and the Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 and Fleet 500 plans exist for operations that are mostly driving.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "create-a-route",
          title: "Create a route",
          summary: "Set the date, the depot, the start time and how long a stop usually takes.",
          keywords: ["new route", "create", "depot", "start time", "service time", "signature"],
          body: [
            p(
              "A route is one driver's work for one date. Create it first, then fill it with stops.",
            ),
            h("Create it"),
            steps(
              "Open Routes and choose New route.",
              "Name it something a dispatcher will recognise on a busy morning — \"Tuesday north side\" beats \"Route 4\".",
              "Set the date.",
              "Choose Planned or Dispatch mode.",
              "Optionally link it to a project, so the delivery photos land with that job's evidence.",
              "Enter the start address — usually your depot or yard.",
              "Save.",
            ),
            h("The settings that shape the plan"),
            table(
              ["Setting", "What it does"],
              [
                ["Start address", "Where the day begins. The optimizer plans outward from here."],
                ["Return to start", "Include the drive back to the depot in the plan."],
                ["Start time", "When the driver rolls out. Defaults to 08:00."],
                [
                  "Service time",
                  "Minutes spent at an average stop. Defaults to 5. Drives the arrival estimates.",
                ],
                ["Require signature", "Ask the driver for a signature as well as a photo."],
              ],
            ),
            h("Service time is worth getting right"),
            p(
              "Service time is how the estimated arrival for every later stop is calculated. Five minutes suits parcels at a door. A stop that means unloading pallets is closer to twenty, and you can override the service time on individual stops that you know are slow.",
            ),
            note(
              "Creating a route needs the manager role or above. Drivers do not build their own routes.",
            ),
            warn(
              "Dispatch mode needs Delivery Pro or higher. If your plan covers planned routes only, you will be told when you pick the mode rather than after you have built the day.",
            ),
            see("delivery-routes/add-stops-by-pasting-a-list", "delivery-routes/live-dispatch"),
          ],
        },
        {
          slug: "add-stops-by-pasting-a-list",
          title: "Add stops by pasting a list or uploading a CSV",
          summary:
            "Paste a spreadsheet column, an email from the customer, or upload a CSV — GeoCliks reads the columns either way.",
          keywords: [
            "stops",
            "paste",
            "import",
            "upload",
            "file",
            "spreadsheet",
            "csv",
            "bulk",
            "addresses",
          ],
          body: [
            p(
              "Stops go in two ways: paste the addresses in, or upload a CSV file. Both end up in the same box and go through the same reader, so everything below applies to both. You do not need to reformat the list first.",
            ),
            h("Paste a list"),
            steps(
              "Open the route and find the Add stops box.",
              "Paste the block. One stop per line.",
              "Read the summary above the box: how many stops it found, which separator it used, which columns it recognised, and how many lines it dropped.",
              "Fix anything that looks wrong in the source and paste again, or add the stops and edit individually.",
              "Choose Add stops.",
            ),
            h("Upload a CSV"),
            steps(
              "Export the list from your spreadsheet or order system as CSV.",
              "Open the route and find the Add stops box.",
              "Choose Upload a CSV and pick the file.",
              "The file's contents drop into the box, where you can read the summary and edit any line before anything is created.",
              "Choose Add stops.",
            ),
            note(
              "Uploading does not create the stops on its own — it fills the box. Nothing is added to the route until you choose Add stops, so a wrong file costs you nothing. Files must be CSV or plain text and under 1 MB.",
            ),
            h("What the parser understands"),
            ul(
              "Tab, comma or semicolon separated. It works out which one you used.",
              "Quoted fields, so an address with a comma inside quotes stays one address.",
              "A header row, if there is one. Columns are then matched by name in any order.",
              "Header names in English, French, Portuguese or German — address/adresse/endereço/Adresse, name/nom/nome/Empfänger, email/courriel/e-mail, phone/téléphone/telefone/Telefon, reference/commande/pedido/Referenz, notes/remarques/observações/Notizen. Accents are optional, so endereco, observacoes and Empfaenger work too.",
              "Address split across several spreadsheet columns — street, city, province, postal code — joined back into one line.",
              "Email addresses and phone numbers spotted by their shape, even with no header row.",
            ),
            h("Per-stop fields"),
            table(
              ["Field", "Why it matters"],
              [
                ["Address", "Required. Everything else is optional."],
                ["Recipient name", "Shown to the driver and used in the proof email."],
                ["Recipient email", "Without it, that recipient gets no tracking or proof email."],
                ["Recipient phone", "For the driver to call ahead."],
                ["Reference", "Your order, invoice or tracking number. Searchable."],
                ["Notes", "Gate codes, buzzer numbers, where to leave it."],
                ["Time window", "Earliest and latest acceptable arrival."],
                ["Service time", "Override the route default for a stop you know is slow."],
              ],
            ),
            h("Why a postal code is never treated as a name"),
            p(
              "A Canadian list pasted as \"12 Main St, Moncton NB, E1A 4H2\" used to produce a recipient called E1A 4H2. The parser now recognises street words, province codes and postal-code and ZIP shapes, and only pops a trailing field as a person's name when it actually looks like one.",
            ),
            note(
              "You can add up to 300 stops in one paste. For a bigger day, paste it in batches — they append to the same route.",
            ),
            warn(
              "Every stop counts against your monthly delivery allowance. If a paste would take you over the plan's cap it is refused as a whole, so you never end up with half a route.",
            ),
            see(
              "delivery-routes/geocoding-and-fixing-addresses",
              "plans-billing/delivery-plans",
            ),
          ],
        },
        {
          slug: "geocoding-and-fixing-addresses",
          title: "Resolving addresses and fixing bad ones",
          summary:
            "Turn typed addresses into map positions, and drop a pin by hand when one cannot be found.",
          keywords: ["geocode", "address", "pin", "coordinates", "failed", "resolve", "map"],
          body: [
            p(
              "A pasted address is just text. Before a route can be ordered or timed, each stop needs a position on the map. That step is called resolving, and you run it from the route.",
            ),
            h("Resolve the stops"),
            steps(
              "Open the route.",
              "Choose Resolve addresses. Only stops that have not been resolved yet are processed.",
              "Read the result: how many were placed and how many failed.",
              "Deal with the failures before you optimize.",
            ),
            h("Every stop has a resolve status"),
            table(
              ["Status", "Meaning"],
              [
                ["Pending", "Not looked up yet."],
                ["OK", "Placed on the map, with a cleaned-up address."],
                ["Failed", "Could not be found. Needs your help."],
                ["Manual", "You dropped the pin yourself. Never overwritten by a re-resolve."],
              ],
            ),
            h("Fixing a failed stop"),
            ul(
              "Edit the address and resolve again — a missing city or province is the usual cause.",
              "Or open the map and drop the pin on the right spot yourself. The stop becomes Manual and is treated as placed.",
              "A manual pin is the answer for a new subdivision, a rural property or a site with no civic address.",
            ),
            h("Re-resolving"),
            p(
              "A forced re-resolve looks up every stop again, including ones already marked OK. It deliberately leaves manual pins alone, because a hand-placed pin is better information than anything a lookup will return.",
            ),
            note(
              "Address lookup is biased towards Canada, so a short address like \"12 Main St, Moncton\" resolves without you spelling out the country.",
            ),
            warn(
              "Stops with no position cannot be ordered by the optimizer. They are parked at the end of the route rather than dropped, so check the tail of your list before sending a driver out.",
            ),
            see("delivery-routes/optimize-stop-order", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Send it out",
      articles: [
        {
          slug: "optimize-stop-order",
          title: "Order the stops",
          summary: "Reorder by hand, or let the optimizer work out the driving order for you.",
          keywords: ["optimize", "order", "sequence", "reorder", "shortest", "route planning"],
          body: [
            p(
              "Stops start in the order you added them. That is rarely the order you want to drive them in.",
            ),
            h("By hand"),
            p(
              "Drag stops into the order you want. Useful when the driver knows the area better than any algorithm, or when a customer has to be first.",
            ),
            h("With the optimizer"),
            steps(
              "Resolve the addresses first — a stop with no position cannot be ordered.",
              "Choose Optimize.",
              "Review the result: the new order, the total distance and the estimated drive time.",
              "Adjust by hand afterwards if you want. Optimizing is a suggestion you can overrule.",
            ),
            h("Two optimizers"),
            table(
              ["Optimizer", "What it does"],
              [
                [
                  "Standard",
                  "Runs in GeoCliks, no external service, no metering. Good ordering for a normal day.",
                ],
                [
                  "Smart",
                  "Uses real road network data for tighter ordering on dense or awkward routes. Delivery Pro and above.",
                ],
              ],
            ),
            note(
              "If you ask for the smart optimizer on a plan that does not include it, GeoCliks runs the standard one instead of failing. You still get an ordered route — check which optimizer ran in the route's history.",
            ),
            h("What the optimizer respects"),
            ul(
              "Your start address, and the return-to-depot setting if it is on.",
              "The service time on each stop, or the route default.",
              "Stops with no position, which keep their place at the end of the list.",
            ),
            see("delivery-routes/assign-a-driver", "troubleshoot/route-optimize-failed"),
          ],
        },
        {
          slug: "assign-a-driver",
          title: "Assign a driver",
          summary: "Hand the route to somebody in your workspace and start the day.",
          keywords: ["assign", "driver", "start", "status", "dispatch", "unassign"],
          body: [
            p(
              "A route has to belong to somebody before it can be driven. The driver must be a member of your workspace — the field role is the right one for crew who only drive and capture.",
            ),
            h("Assign it"),
            steps(
              "Open the route.",
              "Choose Assign, and pick the driver.",
              "The route appears on their phone under their routes for that date.",
              "Choose Start when they are rolling, or let the driver start it by closing their first stop.",
            ),
            h("Route status"),
            table(
              ["Status", "Meaning"],
              [
                ["Draft", "Being built. No driver yet."],
                ["Assigned", "A driver has it, not started."],
                ["Active", "Being driven right now."],
                ["Completed", "Every stop is closed."],
                ["Cancelled", "Called off. Stops can no longer be closed."],
              ],
            ),
            h("Changing your mind"),
            ul(
              "Unassign a route to send it back to draft and hand it to somebody else.",
              "A driver who photographs their first drop without tapping Start makes the route active anyway.",
              "Cancelling a route stops any further stops being closed against it, and keeps everything already recorded.",
            ),
            note(
              "Your plan sets how many drivers the operation is sized for. Delivery Lite covers two, Pro five, Fleet fifteen, Fleet 30 thirty, Fleet 200 two hundred, Fleet 500 five hundred.",
            ),
            see("delivery-routes/driver-run-and-proof-of-delivery", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "live-dispatch",
          title: "Live dispatch",
          summary: "Slot an order that arrived mid-shift into a driver's remaining stops.",
          keywords: ["dispatch", "live", "add stop", "mid-shift", "on demand", "insert"],
          body: [
            p(
              "Dispatch mode is for work that does not exist when the day starts: a call comes in at 14:00 and somebody has to take it. You add the stop to a route that is already being driven and GeoCliks slots it in.",
            ),
            h("Add a live stop"),
            steps(
              "Open the active route.",
              "Choose Add live stop.",
              "Enter the address and the recipient details.",
              "Confirm. The stop is inserted into the part of the route the driver has not reached yet, and appears on their phone.",
            ),
            h("What never moves"),
            ul(
              "Stops already delivered, failed or skipped.",
              "The stop the driver is currently driving to.",
            ),
            p(
              "A new stop is inserted at the cheapest point in the remaining list. This is deliberately not a re-optimize: a tool that reshuffles the plan under a moving driver gets abandoned by the people using it, and re-optimizing a busy evening repeatedly would also cost you money on every recalculation.",
            ),
            note(
              "Insertion runs locally and is free, however many times you do it in a shift.",
            ),
            warn(
              "Live dispatch needs Delivery Pro or higher. On a plan with planned routes only, you can still add stops to a route before it starts.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
      ],
    },
    {
      title: "On the road",
      articles: [
        {
          slug: "driver-run-and-proof-of-delivery",
          title: "The driver's run and proof of delivery",
          summary: "What the driver sees, and how a stop is closed with evidence.",
          keywords: ["driver", "run", "proof", "photo", "signature", "delivered", "offline"],
          body: [
            p(
              "On the phone, the driver gets one screen: the stop they are on, the address, the recipient, any notes, and how many stops are left. Everything else is out of the way.",
            ),
            h("Closing a stop"),
            steps(
              "Tap the stop.",
              "Take the delivery photo — the parcel at the door, the pallet in the bay, whatever proves it arrived.",
              "Confirm or correct the recipient name.",
              "Capture a signature, if the route asks for one.",
              "Mark it Delivered. The next stop comes up.",
            ),
            h("The photo is not optional"),
            p(
              "A delivered or failed stop must be closed with a real photo from your workspace. There is no way to mark a stop delivered with nothing attached — that is the whole point of using GeoCliks for delivery instead of a checklist app.",
            ),
            h("Offline"),
            ul(
              "The run works with no signal. Photos and stop closes queue on the device.",
              "The recorded completion time is when the photo was taken, not when it uploaded, so a route driven through a dead zone still reads correctly.",
              "If the queue drains twice, the second attempt is recognised and ignored rather than double-closing the stop.",
            ),
            note(
              "The office sees each stop close as it lands, so a dispatcher watching the route knows where the driver is without phoning them.",
            ),
            see("delivery-routes/failed-and-skipped-stops", "mobile-app/offline-capture-and-queue"),
          ],
        },
        {
          slug: "failed-and-skipped-stops",
          title: "Failed and skipped stops",
          summary: "Record why a delivery did not happen, in a way the office can act on.",
          keywords: ["failed", "skipped", "nobody home", "refused", "wrong address", "exception"],
          body: [
            p(
              "Not every stop works out. A failed stop is still a closed stop with evidence — it is the record that the driver went there and what they found.",
            ),
            h("Mark a stop failed"),
            steps(
              "Tap the stop and take a photo of what the driver is looking at — the closed door, the blocked lane, the wrong building.",
              "Choose Failed.",
              "Pick a reason.",
              "Add a note if there is anything the office needs to know.",
              "Save.",
            ),
            h("The reasons"),
            table(
              ["Reason", "Use it for"],
              [
                ["Nobody home", "Nobody available to receive it."],
                ["Refused", "The recipient would not take it."],
                ["Wrong address", "The address does not match the recipient."],
                ["Closed", "A business that was shut."],
                ["Inaccessible", "Could not physically reach it — gate, snow, construction."],
                ["Other", "Anything else. Write it in the note."],
              ],
            ),
            h("Skipping instead"),
            p(
              "A skip is different: it is the driver reporting there was nothing to deliver here at all. It is the one close that needs no photo, and it is recorded as a skip so the office reads exactly that in the history rather than a failure that never happened.",
            ),
            warn(
              "A failed stop never triggers a proof-of-delivery email to the recipient. Those are handled by the office by hand, because a cheerful \"your parcel arrived\" for a failed drop is worse than no message at all.",
            ),
            note(
              "Every close, failure and skip is written to the route's history with who did it and when, and the history cannot be edited.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "delivery-routes/driver-run-and-proof-of-delivery",
            ),
          ],
        },
        {
          slug: "tracking-links-and-notifications",
          title: "Tracking links and recipient emails",
          summary: "The three emails a recipient can get, and exactly what the tracking page shows.",
          keywords: ["tracking", "notification", "email", "recipient", "eta", "link", "privacy"],
          body: [
            p(
              "A recipient with an email address on their stop can be kept informed automatically. You control this per route, and a recipient with no email address is simply never contacted.",
            ),
            h("The three emails"),
            table(
              ["Email", "When it goes"],
              [
                ["On the way", "The route has started and the driver is out."],
                ["You're next", "The driver is a set number of drops away."],
                ["Delivered", "Their stop closed. Includes the proof photo and its code."],
              ],
            ),
            h("Settings"),
            ul(
              "Turn the heads-up email on or off for the route.",
              "Set how many stops ahead it goes out — one gives little warning, five gives a wide window.",
              "Turn the proof-of-delivery email on or off.",
            ),
            h("What the tracking page shows"),
            p(
              "Each email links to a tracking page for that one stop, reached through an unguessable link. The recipient sees your company name, their own address, how many drops are still ahead of theirs, and once the stop is closed, the proof photo with its verified time and location.",
            ),
            h("What it deliberately does not show"),
            ul(
              "Any other stop, address or recipient on the route.",
              "The driver's name, phone or live position.",
              "The route name, or the total number of stops — which would let a competitor map your round.",
            ),
            note(
              "Each recipient gets each email at most once, and the driver's progress is re-checked immediately before sending, so nobody gets a \"you're next\" for a stop that was just delivered.",
            ),
            warn(
              "Recipient emails only go out when email sending is configured for your workspace. If recipients report getting nothing, that is the first thing to check.",
            ),
            see("delivery-routes/failed-and-skipped-stops", "troubleshoot/notifications-not-arriving"),
          ],
        },
      ],
    },
  ],
};
