import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const plansBilling: Category = {
  slug: "plans-billing",
  title: "Pläne und Abrechnung",
  summary: "Was jeder Plan umfasst, wie Sie ihn wechseln und wo Sie eine Rechnung finden.",
  icon: "CreditCard",
  sections: [
    {
      title: "Den richtigen Plan wählen",
      articles: [
        {
          slug: "compare-plans",
          title: "Pläne vergleichen",
          summary: "Was Sie bei Free, Plus, Business, Crew 10, Crew 25 und Enterprise bekommen.",
          keywords: [
            "pläne",
            "preise",
            "vergleichen",
            "grenzen",
            "limits",
            "plans",
            "pricing",
            "compare",
            "free",
            "plus",
            "business",
            "crew",
            "limits",
          ],
          body: [
            p(
              "Es gibt zwei Plan-Familien. Die Nachweis-Pläne unten sind dafür da, Arbeit zu dokumentieren. Die Delivery-Pläne sind für Betriebe, in denen überwiegend gefahren wird, und werden in einem eigenen Artikel behandelt.",
            ),
            p(
              "Die aktuellen Preise stehen im Preisbereich von geocliks.com. Diese Seite beschreibt, was jeder Plan tatsächlich erlaubt — und genau daran verschätzen sich die meisten.",
            ),
            h("Nachweis-Pläne"),
            table(
              ["Plan", "Für wen", "Plätze"],
              [
                ["Free", "Zum Ausprobieren oder für gelegentliche Dokumentation allein.", "1"],
                ["Plus", "Eine Person in Vollzeit, die mit Kunden teilt.", "1"],
                ["Business", "Ein kleines Team mit gemeinsamem Teamspace.", "5"],
                ["Crew 10", "Ein wachsendes Team.", "10"],
                ["Crew 25", "Ein größerer Betrieb.", "25"],
                ["Enterprise", "Eigene Mengen und Bedingungen. Sprechen Sie mit uns.", "Individuell"],
              ],
            ),
            h("Was sich nach oben hin ändert"),
            table(
              ["Funktion", "Ab welchem Plan"],
              [
                ["Verifizierte Aufnahme, Wasserzeichen, Fotocodes", "Free"],
                ["Unbegrenzte Aufnahmen pro Monat", "Plus"],
                ["Excel-, ZIP- und KMZ-Exporte", "Plus"],
                ["Freigabelinks", "Plus"],
                ["Unbegrenzte Projekte und Wasserzeichen-Vorlagen", "Plus"],
                ["Ihr Logo im Wasserzeichen", "Plus"],
                ["Videoclips in voller Länge", "Plus"],
                ["Teamspace mit eingeladenen Mitgliedern", "Business"],
                ["Rollen und Zugriff je Projekt", "Business"],
              ],
            ),
            h("Der Free-Plan im Detail"),
            ul(
              "300 Aufnahmen pro Monat.",
              "Video ist auf Clips von 30 Sekunden begrenzt — und nur in den ersten drei Tagen.",
              "Drei Projekte, ein Platz, zwei Wasserzeichen-Vorlagen.",
              "PDF-Export von bis zu 20 Fotos. Kein Excel, ZIP oder KMZ.",
              "Kein Teamspace, also keine eingeladenen Mitglieder und keine Freigabelinks.",
              "Keine Liefertouren.",
            ),
            note(
              "Jeder Plan, Free eingeschlossen, gibt Ihnen dieselbe Verifizierung: dieselben Wasserzeichen-Daten, denselben Fotocode, dasselbe Siegel. Verifizierung ist kein bezahltes Upgrade.",
            ),
            h("Lieferungen in den Nachweis-Plänen"),
            p(
              "Plus und höher enthalten ein monatliches Guthaben an Lieferstopps, sodass Sie Touren fahren können, ohne auf einen Delivery-Plan zu wechseln: ein überschaubares Guthaben bei Plus, mehr bei Business und schrittweise mehr bei Crew 10 und Crew 25. Wenn Sie jeden Tag fahren, sind die Delivery-Pläne pro Stopp günstiger.",
            ),
            see("plans-billing/delivery-plans", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "delivery-plans",
          title: "Delivery-Pläne",
          summary:
            "Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 und Fleet 500 — bemessen nach Stopps pro Monat und Fahrern.",
          keywords: [
            "lieferung",
            "stopps",
            "fahrer",
            "disposition",
            "flotte",
            "delivery",
            "lite",
            "pro",
            "fleet",
            "stops",
            "drivers",
            "dispatch",
          ],
          body: [
            p(
              "Die Delivery-Pläne sind für Betriebe, in denen das Fahren das Geschäft ist und nicht bloß eine Nebenwirkung davon. Sie enthalten alles aus den Nachweis-Plänen und dazu ein deutlich größeres monatliches Stopp-Guthaben.",
            ),
            table(
              ["Plan", "Stopps pro Monat", "Fahrer", "Live-Disposition", "Intelligente Optimierung"],
              [
                ["Delivery Lite", "500", "2", "Nein", "Nein"],
                ["Delivery Pro", "2.000", "5", "Ja", "Ja"],
                ["Delivery Fleet", "6.000", "15", "Ja", "Ja"],
                ["Delivery Fleet 30", "12.000", "30", "Ja", "Ja"],
                ["Delivery Fleet 200", "80.000", "200", "Ja", "Ja"],
                ["Delivery Fleet 500", "200.000", "500", "Ja", "Ja"],
              ],
            ),
            h("Was die zwei gesperrten Funktionen sind"),
            ul(
              "Live-Disposition — Stopps zu einer Tour hinzufügen, die schon gefahren wird. Pro, Fleet, Fleet 30, Fleet 200 und Fleet 500.",
              "Intelligente Optimierung — Reihenfolge der Tour anhand des echten Straßennetzes statt mit dem Standardverfahren. Pro, Fleet, Fleet 30, Fleet 200 und Fleet 500. In Plänen ohne diese Funktion läuft stattdessen die Standardoptimierung, Sie erhalten also trotzdem eine sortierte Tour.",
            ),
            h("Wie Sie einen bekommen"),
            p(
              "Jeder Delivery-Plan lässt sich direkt auf der Abrechnungsseite selbst buchen: Plan auswählen, durch eine sichere, gehostete Kasse gehen, Kartendaten eingeben. Die neuen Grenzen gelten, sobald das abgeschlossen ist. Ein Delivery-Plan beginnt mit einer kostenlosen Testphase, deshalb steht auf der Schaltfläche „Kostenlos testen“. Wenn Ihr Workspace bereits auf einem Delivery-Plan ist, wird ein Wechsel sofort abgerechnet und die Schaltfläche heißt stattdessen „Zu … wechseln“ — die Testphase gilt einmal pro Workspace, nicht einmal pro Plan.",
            ),
            steps(
              "Öffnen Sie „Plan“ in den Einstellungen Ihres Workspace.",
              "Wählen Sie den Delivery-Plan, der zu Ihrem Volumen passt.",
              "Schließen Sie die Kasse ab. Sie kommen zu GeoCliks zurück, das Stopp-Guthaben ist dann schon aktiv.",
            ),
            warn(
              "Enterprise ist der einzige Plan, den Sie nicht selbst buchen können. Auf seiner Karte steht „Sprechen Sie mit uns“ statt einer Kassen-Schaltfläche, und sie öffnet eine vorbereitete E-Mail an sales@geocliks.com. Niemand wird automatisch belastet, und an Ihrem Workspace ändert sich nichts, bis wir es gemeinsam mit Ihnen einrichten.",
            ),
            note(
              "Nur der Inhaber des Workspace kann den Plan wechseln. Admins verwalten Personen, nicht das Abonnement.",
            ),
            h("Welcher passt"),
            p(
              "Zählen Sie die Stopps, die Sie in einem normalen Monat wirklich ausliefern, und rechnen Sie etwas Luft für Ihre stärkste Woche dazu. Wenn das Guthaben überschritten ist, können bis zum nächsten Monat keine Touren mehr gebaut werden — der Plan sollte also Ihre Spitze abdecken, nicht Ihren Durchschnitt.",
            ),
            note(
              "Stopps werden je Kalendermonat gezählt und am Ersten zurückgesetzt. Ein Stopp zählt, sobald er zu einer Tour hinzugefügt wird — unabhängig davon, ob er am Ende ausgeliefert wird.",
            ),
            see("delivery-routes/delivery-overview", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Ihr Abonnement verwalten",
      articles: [
        {
          slug: "upgrade-or-change-plan",
          title: "Upgrade oder Planwechsel",
          summary: "Den Plan auf der Abrechnungsseite wechseln — das macht der Inhaber.",
          keywords: [
            "upgrade",
            "plan wechseln",
            "kasse",
            "downgrade",
            "wechseln",
            "change plan",
            "checkout",
            "switch",
          ],
          body: [
            p(
              "Pläne werden über „Plan“ in den Einstellungen Ihres Workspace gewechselt. Nur der Inhaber des Workspace kann das — Admins verwalten Personen, nicht das Abonnement.",
            ),
            h("Plan wechseln"),
            steps(
              "Öffnen Sie „Plan“.",
              "Wählen Sie den Plan, den Sie möchten.",
              "Bei einem selbst buchbaren, bezahlten Plan kommen Sie zu einer sicheren, gehosteten Kasse, um Kartendaten einzugeben, und werden danach zu GeoCliks zurückgebracht.",
              "Bei Enterprise erhalten Sie stattdessen eine vorbereitete E-Mail an unser Team.",
              "Die neuen Grenzen gelten, sobald der Wechsel greift.",
            ),
            h("Auf einen größeren Plan wechseln"),
            ul(
              "Neue Grenzen gelten sofort.",
              "Nichts, was Sie bereits aufgenommen haben, ist davon betroffen.",
              "Zusätzliche Plätze stehen sofort bereit, Sie können also direkt danach Personen einladen.",
            ),
            h("Nach unten wechseln"),
            p(
              "Ein Downgrade wird abgelehnt, solange Ihr Workspace größer ist als der Zielplan. Wenn Sie acht Mitglieder haben und auf einen Plan mit fünf Plätzen wechseln, werden Sie aufgefordert, zuerst Mitglieder zu entfernen. Das ist beabsichtigt — die Alternative wäre, drei Personen stillschweigend abzuschneiden.",
            ),
            note(
              "Den Free-Plan zu wählen oder den Plan erneut zu wählen, auf dem Sie schon sind, führt gar nicht durch die Kasse.",
            ),
            see("plans-billing/seats-and-billing", "plans-billing/cancel-or-downgrade"),
          ],
        },
        {
          slug: "seats-and-billing",
          title: "Plätze",
          summary: "Was ein Platz ist, was einen verbraucht und was Sie tun, wenn keiner mehr frei ist.",
          keywords: [
            "plätze",
            "mitglieder",
            "einladen",
            "grenze",
            "kapazität",
            "nutzer",
            "seats",
            "members",
            "invite",
            "limit",
            "capacity",
            "users",
          ],
          body: [
            p(
              "Ein Platz ist eine Person, die sich in Ihrem Workspace anmelden kann. Ihr Plan enthält eine feste Anzahl, und der Inhaber zählt als einer davon.",
            ),
            h("Was einen Platz verbraucht"),
            ul(
              "Jedes Mitglied des Workspace, unabhängig von seiner Rolle. Ein Feld-Mitglied kostet denselben Platz wie ein Admin.",
              "Jede offene Einladung, bis sie angenommen oder zurückgezogen wird.",
            ),
            p(
              "Offene Einladungen belegen absichtlich einen Platz. Sonst könnten zehn Einladungen gegen zwei Plätze verschickt werden, und jeder, der annimmt, läge über dem Plan.",
            ),
            h("Keine Plätze mehr frei"),
            steps(
              "Öffnen Sie „Team“ und schauen Sie sich die offenen Einladungen an. Ziehen Sie alle zurück, die nicht angenommen werden.",
              "Entfernen Sie Mitglieder, die gegangen sind. Ihre Aufnahmen und ihre Historie bleiben im Workspace.",
              "Wenn Sie wirklich mehr Personen brauchen, wechseln Sie auf einen größeren Plan.",
            ),
            note(
              "Ein Mitglied zu entfernen gibt seinen Platz sofort frei und löscht niemals seine Arbeit.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "payment-and-invoices",
          title: "Zahlung und Rechnungen",
          summary: "Wo die Kartendaten liegen, wie Sie sie ändern und wo Sie einen Beleg bekommen.",
          keywords: [
            "rechnung",
            "beleg",
            "karte",
            "zahlung",
            "umsatzsteuer",
            "steuer",
            "abrechnungsportal",
            "invoice",
            "receipt",
            "card",
            "payment",
            "vat",
            "tax",
            "billing portal",
          ],
          body: [
            p(
              "Zahlungen werden von unserem Zahlungsdienstleister abgewickelt, nicht von GeoCliks. Ihre Kartennummer wird niemals auf unseren Servern gespeichert.",
            ),
            h("Eine Karte aktualisieren"),
            steps(
              "Öffnen Sie „Plan“ in den Einstellungen Ihres Workspace.",
              "Öffnen Sie das Abrechnungsportal.",
              "Aktualisieren Sie die Zahlungsmethode dort.",
            ),
            h("Rechnungen und Belege"),
            ul(
              "Jede Zahlung erzeugt eine Rechnung, die im Abrechnungsportal verfügbar ist.",
              "Rechnungen gehen per E-Mail an die Rechnungsadresse des Abonnements, und das ist nicht immer die Anmelde-E-Mail des Inhabers — prüfen Sie das, wenn Belege bei der falschen Person landen.",
              "Tragen Sie Firmenname und Steuerdaten im Portal ein, dann erscheinen sie auf künftigen Rechnungen.",
            ),
            h("Eine fehlgeschlagene Zahlung"),
            p(
              "Der Dienstleister versucht eine fehlgeschlagene Zahlung erneut, bevor sich an Ihrem Workspace etwas ändert. Wenn sie weiterhin fehlschlägt, fällt Ihr Workspace auf die Grenzen des Free-Plans zurück — Ihre Aufnahmen werden nicht gelöscht, aber Exporte, Freigabelinks und Teamspace funktionieren nicht mehr, bis die Zahlung durchgeht.",
            ),
            warn(
              "Wenn Ihr Workspace auf einem Plan läuft, den wir von Hand für Sie eingerichtet haben, gibt es möglicherweise kein Selbstbedienungsportal. Schreiben Sie an support@geocliks.com, dann klären wir die Rechnung.",
            ),
            see("plans-billing/cancel-or-downgrade", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "cancel-or-downgrade",
          title: "Kündigen oder Downgrade",
          summary: "Wie Sie aufhören zu zahlen — und was genau mit Ihren Nachweisen passiert.",
          keywords: [
            "kündigen",
            "downgrade",
            "löschen",
            "rückerstattung",
            "export",
            "verlassen",
            "daten",
            "cancel",
            "delete",
            "refund",
            "export",
            "leave",
            "data",
          ],
          body: [
            p(
              "Sie können jederzeit aufhören zu zahlen. Die wichtige Frage ist, was mit der Arbeit passiert — hier also klar und deutlich.",
            ),
            h("Kündigen"),
            steps(
              "Exportieren Sie zuerst alles, was Sie außerhalb von GeoCliks brauchen werden. Tun Sie das, bevor Sie kündigen, denn im Free-Plan sind die Exportformate begrenzt.",
              "Verkleinern Sie Ihren Workspace so, dass er in den Zielplan passt, wenn Sie auf weniger Plätze wechseln.",
              "Öffnen Sie „Plan“ und wechseln Sie entweder auf den Free-Plan oder kündigen Sie im Abrechnungsportal.",
            ),
            h("Was mit Ihren Daten passiert"),
            ul(
              "Ihre Aufnahmen werden bei einem Downgrade oder einer Kündigung nicht gelöscht.",
              "Die Verifizierung funktioniert weiter. Fotocodes lassen sich weiterhin auflösen, und Siegel halten der Prüfung stand.",
              "Bezahlte Funktionen enden: Excel-, ZIP- und KMZ-Exporte, Freigabelinks, Teamspace und Liefertouren.",
              "Bestehende Freigabelinks funktionieren nicht mehr, solange Ihr Plan sie nicht enthält.",
              "Mitglieder über der neuen Platzzahl verlieren den Zugriff — deshalb fordert ein Downgrade Sie auf, sie vorher zu entfernen.",
            ),
            warn(
              "Exportieren Sie, bevor Sie kündigen, nicht danach. Im Free-Plan sind Sie auf ein PDF mit bis zu 20 Fotos begrenzt, und damit holt man kein Jahr Arbeit heraus.",
            ),
            h("Den Workspace ganz löschen"),
            p(
              "Kündigen ist nicht Löschen. Wenn Sie möchten, dass der Workspace und seine Medien endgültig entfernt werden, schreiben Sie von der Adresse des Inhabers an support@geocliks.com und bitten Sie um Löschung. Das ist nicht rückgängig zu machen, und wir bestätigen es vorher.",
            ),
            see("legal/data-retention", "teamspace/reports-and-exports"),
          ],
        },
      ],
    },
  ],
};
