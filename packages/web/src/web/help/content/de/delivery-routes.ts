import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const deliveryRoutes: Category = {
  slug: "delivery-routes",
  title: "Liefertouren",
  summary:
    "Planen Sie den Tag eines Fahrers, schicken Sie ihn los und schließen Sie jeden Stopp mit einem Nachweisfoto ab, das der Empfänger sehen kann.",
  icon: "Route",
  sections: [
    {
      title: "Den Tag planen",
      articles: [
        {
          slug: "delivery-overview",
          title: "So funktioniert Delivery",
          summary:
            "Der Ablauf eines Liefertags in GeoCliks: Tour bauen, Fahrer zuweisen, jeden Stopp mit einem Nachweis abschließen.",
          keywords: [
            "lieferung",
            "touren",
            "disposition",
            "fahrer",
            "liefernachweis",
            "delivery",
            "routes",
            "dispatch",
            "pod",
          ],
          body: [
            p(
              "Liefertouren nehmen dieselbe Idee des verifizierten Fotos und wenden sie auf den Tag eines Fahrers an. Sie bauen im Büro eine Liste von Stopps, geben sie einem Fahrer, und der Fahrer schließt jeden Stopp ab, indem er die Zustellung fotografiert. Das Foto trägt die verifizierte Zeit, die GPS-Position und die Adresse — damit hat ein Lieferstreit eine Antwort.",
            ),
            h("Der Tag von Anfang bis Ende"),
            steps(
              "Das Büro erstellt eine Tour für ein Datum und fügt die Adressen des Tages ein.",
              "GeoCliks ermittelt zu den Adressen die Positionen auf der Karte, und Sie korrigieren die, die nicht platziert werden konnten.",
              "Sie bringen die Stopps in Reihenfolge, von Hand oder mit der Optimierung.",
              "Sie weisen die Tour einem Fahrer zu, der sie auf seinem Telefon sieht.",
              "Der Fahrer arbeitet die Liste ab und fotografiert jede Zustellung.",
              "Empfänger mit einer E-Mail-Adresse erhalten eine Nachricht mit dem Liefernachweis und dem Foto.",
              "Das Büro verfolgt in Echtzeit, wie die Tour abgeschlossen wird, und behält den Prüfpfad.",
            ),
            h("Zwei Arten von Tour"),
            table(
              ["Routentyp", "Nutzen Sie ihn, wenn"],
              [
                [
                  "Geplant",
                  "Sie den ganzen Tag vorab kennen. Bauen, optimieren, losschicken.",
                ],
                [
                  "Disposition",
                  "Aufträge während der Schicht eintreffen und in die restlichen Stopps eines Fahrers eingefügt werden.",
                ],
              ],
            ),
            h("Jeder Stopp endet in einem von vier Zuständen"),
            ul(
              "Zugestellt — mit einem Nachweisfoto abgeschlossen.",
              "Fehlgeschlagen — der Fahrer konnte nicht zustellen, mit Grund und Foto.",
              "Übersprungen — hier war nichts zuzustellen. Der einzige Abschluss ohne Foto.",
              "Offen — noch nicht erreicht.",
            ),
            note(
              "Delivery ist eine eigene Funktion, getrennt von der Beweisaufnahme. Ihr Kontingent an Lieferstopps pro Monat kommt aus Ihrem Plan, und die Pläne Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 und Fleet 500 gibt es für Betriebe, die überwiegend fahren.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "create-a-route",
          title: "Tour erstellen",
          summary:
            "Legen Sie Datum, Startadresse, Startzeit und die übliche Dauer eines Stopps fest.",
          keywords: [
            "neue tour",
            "erstellen",
            "lager",
            "startzeit",
            "servicezeit",
            "unterschrift",
            "new route",
            "depot",
            "service time",
          ],
          body: [
            p(
              "Eine Tour ist die Arbeit eines Fahrers für ein Datum. Erstellen Sie sie zuerst und füllen Sie sie dann mit Stopps.",
            ),
            h("So erstellen Sie sie"),
            steps(
              "Öffnen Sie „Touren“ und wählen Sie „Neue Tour“.",
              "Geben Sie einen Tournamen, den ein Disponent an einem hektischen Morgen wiedererkennt — „Dienstag Nordseite“ ist besser als „Tour 4“.",
              "Setzen Sie das Datum.",
              "Wählen Sie als Routentyp „Geplant“ oder „Disposition“.",
              "Verknüpfen Sie sie optional mit einem Projekt, damit die Lieferfotos bei den Beweisen dieses Auftrags landen.",
              "Geben Sie die Startadresse ein — meist Ihr Lager oder Hof.",
              "Speichern Sie.",
            ),
            h("Die Einstellungen, die den Plan prägen"),
            table(
              ["Einstellung", "Was sie bewirkt"],
              [
                [
                  "Startadresse",
                  "Wo der Tag beginnt. Die Optimierung plant von hier aus nach außen.",
                ],
                ["Zurück zum Start", "Die Rückfahrt zum Lager in den Plan einbeziehen."],
                ["Startzeit", "Wann der Fahrer losfährt. Voreinstellung 08:00."],
                [
                  "Minuten pro Stopp",
                  "Minuten an einem durchschnittlichen Stopp. Voreinstellung 5. Steuert die Ankunftsschätzungen.",
                ],
                [
                  "Unterschrift verlangen",
                  "Den Fahrer zusätzlich zum Foto um eine Unterschrift bitten.",
                ],
              ],
            ),
            h("Die Servicezeit lohnt sich richtig zu setzen"),
            p(
              "Aus der Servicezeit wird die geschätzte Ankunft für jeden späteren Stopp berechnet. Fünf Minuten passen für Pakete an der Tür. Ein Stopp, an dem Paletten abgeladen werden, liegt näher bei zwanzig, und Sie können die Servicezeit für einzelne Stopps überschreiben, von denen Sie wissen, dass sie langsam sind.",
            ),
            note(
              "Eine Tour zu erstellen erfordert mindestens die Rolle Manager. Fahrer bauen ihre Touren nicht selbst.",
            ),
            warn(
              "Der Routentyp „Disposition“ erfordert Delivery Pro oder höher. Deckt Ihr Plan nur geplante Touren ab, erfahren Sie das bei der Wahl des Routentyps und nicht erst, nachdem Sie den Tag gebaut haben.",
            ),
            see("delivery-routes/add-stops-by-pasting-a-list", "delivery-routes/live-dispatch"),
          ],
        },
        {
          slug: "add-stops-by-pasting-a-list",
          title: "Stopps per Liste einfügen oder CSV hochladen",
          summary:
            "Fügen Sie eine Tabellenspalte oder die E-Mail des Kunden ein oder laden Sie eine CSV hoch — GeoCliks liest die Spalten in beiden Fällen.",
          keywords: [
            "stopps",
            "einfügen",
            "import",
            "hochladen",
            "datei",
            "tabelle",
            "csv",
            "adressen",
            "kopfzeile",
            "paste",
            "spreadsheet",
            "bulk",
          ],
          body: [
            p(
              "Stopps kommen auf zwei Wegen hinein: Sie fügen die Adressen ein, oder Sie laden eine CSV-Datei hoch. Beides landet im selben Feld und läuft durch denselben Leser, also gilt alles Folgende für beide. Sie müssen die Liste vorher nicht umformatieren.",
            ),
            h("Eine Liste einfügen"),
            steps(
              "Öffnen Sie die Tour und suchen Sie das Feld „Stopps hinzufügen“.",
              "Fügen Sie den Block ein. Eine Zeile pro Stopp.",
              "Lesen Sie die Zusammenfassung über dem Feld: wie viele Stopps gefunden wurden, welches Trennzeichen erkannt wurde, welche Spalten zugeordnet wurden und wie viele Zeilen übersprungen wurden.",
              "Korrigieren Sie in der Quelle, was falsch aussieht, und fügen Sie erneut ein — oder fügen Sie die Stopps hinzu und bearbeiten Sie sie einzeln.",
              "Wählen Sie „Stopps hinzufügen“.",
            ),
            h("Eine CSV hochladen"),
            steps(
              "Exportieren Sie die Liste aus Ihrer Tabelle oder Ihrem Auftragssystem als CSV.",
              "Öffnen Sie die Tour und suchen Sie das Feld „Stopps hinzufügen“.",
              "Wählen Sie „CSV hochladen“ und wählen Sie die Datei.",
              "Der Inhalt der Datei landet im Feld, wo Sie die Zusammenfassung lesen und jede Zeile bearbeiten können, bevor irgendetwas angelegt wird.",
              "Wählen Sie „Stopps hinzufügen“.",
            ),
            note(
              "Das Hochladen legt die Stopps nicht selbst an — es füllt nur das Feld. Nichts wird der Tour hinzugefügt, bis Sie „Stopps hinzufügen“ wählen, eine falsche Datei kostet Sie also nichts. Dateien müssen CSV oder reiner Text und kleiner als 1 MB sein.",
            ),
            h("Was der Leser versteht"),
            ul(
              "Getrennt durch Tabulator, Komma oder Semikolon. Er erkennt selbst, was Sie verwendet haben.",
              "Felder in Anführungszeichen, sodass eine Adresse mit einem Komma innerhalb der Anführungszeichen eine Adresse bleibt.",
              "Eine Kopfzeile, wenn es eine gibt. Spalten werden dann nach Namen in beliebiger Reihenfolge zugeordnet.",
              "Spaltennamen auf Deutsch, Englisch, Französisch oder Portugiesisch — Adresse/Anschrift/Straße/address, Name/Empfänger/Kunde, E-Mail/email, Telefon/Handy/phone, Referenz/Bestellnummer/Auftragsnummer, Notizen/Bemerkungen/Hinweise. Umlaute sind optional, und „Empfaenger“ wie „Strasse“ funktionieren genauso.",
              "Eine Adresse, die über mehrere Tabellenspalten verteilt ist — Straße, Hausnummer, PLZ, Ort, Land — wird zu einer Zeile zusammengefügt.",
              "E-Mail-Adressen und Telefonnummern werden an ihrer Form erkannt, auch ganz ohne Kopfzeile.",
            ),
            h("Felder pro Stopp"),
            table(
              ["Feld", "Warum es zählt"],
              [
                ["Adresse", "Pflicht. Alles andere ist optional."],
                ["Name des Empfängers", "Wird dem Fahrer gezeigt und in der Nachweis-E-Mail genutzt."],
                [
                  "E-Mail des Empfängers",
                  "Ohne sie erhält dieser Empfänger keine Tracking- oder Nachweis-E-Mail.",
                ],
                ["Telefon des Empfängers", "Damit der Fahrer vorher anrufen kann."],
                ["Referenz", "Ihre Auftrags-, Rechnungs- oder Sendungsnummer. Durchsuchbar."],
                ["Notizen", "Torcodes, Klingelnummern, wo abgestellt werden soll."],
                ["Zeitfenster", "Früheste und späteste akzeptable Ankunft."],
                [
                  "Servicezeit",
                  "Überschreibt die Voreinstellung der Tour für einen Stopp, der bekanntlich langsam ist.",
                ],
              ],
            ),
            h("Warum eine Postleitzahl nie als Name behandelt wird"),
            p(
              "Eine kanadische Liste, eingefügt als „12 Main St, Moncton NB, E1A 4H2“, erzeugte früher einen Empfänger namens E1A 4H2. Der Leser erkennt jetzt Straßenwörter, Provinzkürzel sowie die Form von Postleitzahlen und ZIP-Codes und übernimmt ein letztes Feld nur dann als Personennamen, wenn es wirklich wie einer aussieht.",
            ),
            note(
              "Sie können bis zu 300 Stopps in einem Einfügevorgang hinzufügen. Für einen größeren Tag fügen Sie sie in Portionen ein — sie werden an dieselbe Tour angehängt.",
            ),
            warn(
              "Jeder Stopp zählt gegen Ihr monatliches Lieferkontingent. Würde ein Einfügevorgang Sie über die Grenze des Plans bringen, wird er als Ganzes abgelehnt, damit Sie nie mit einer halben Tour enden.",
            ),
            see(
              "delivery-routes/geocoding-and-fixing-addresses",
              "plans-billing/delivery-plans",
            ),
          ],
        },
        {
          slug: "geocoding-and-fixing-addresses",
          title: "Adressen ermitteln und schlechte korrigieren",
          summary:
            "Machen Sie aus getippten Adressen Positionen auf der Karte und setzen Sie den Punkt von Hand, wenn eine nicht gefunden wird.",
          keywords: [
            "geokodierung",
            "adresse",
            "punkt",
            "koordinaten",
            "nicht gefunden",
            "ermitteln",
            "karte",
            "geocode",
            "resolve",
          ],
          body: [
            p(
              "Eine eingefügte Adresse ist nur Text. Bevor eine Tour sortiert oder zeitlich geplant werden kann, braucht jeder Stopp eine Position auf der Karte. Diesen Schritt nennen wir Ermitteln, und Sie starten ihn aus der Tour.",
            ),
            h("Die Stopps ermitteln"),
            steps(
              "Öffnen Sie die Tour.",
              "Wählen Sie „Adressen ermitteln“. Es werden nur Stopps verarbeitet, die noch nicht ermittelt wurden.",
              "Lesen Sie das Ergebnis: wie viele platziert wurden und wie viele zu prüfen sind.",
              "Kümmern Sie sich um die Fehlschläge, bevor Sie optimieren.",
            ),
            h("Jeder Stopp hat einen Ermittlungsstatus"),
            table(
              ["Status", "Bedeutung"],
              [
                ["Ohne Position", "Noch nicht nachgeschlagen."],
                ["Gefunden", "Auf der Karte platziert, mit bereinigter Adresse."],
                ["Nicht gefunden", "Konnte nicht gefunden werden. Braucht Ihre Hilfe."],
                [
                  "Manueller Punkt",
                  "Sie haben den Punkt selbst gesetzt. Wird von einem erneuten Ermitteln nie überschrieben.",
                ],
              ],
            ),
            h("Einen fehlgeschlagenen Stopp korrigieren"),
            ul(
              "Bearbeiten Sie die Adresse und ermitteln Sie erneut — eine fehlende Stadt oder Provinz ist die übliche Ursache.",
              "Oder öffnen Sie die Karte und setzen Sie den Punkt selbst an die richtige Stelle. Der Stopp wird zum manuellen Punkt und gilt als platziert.",
              "Ein manueller Punkt ist die Antwort für ein Neubaugebiet, ein ländliches Grundstück oder einen Standort ohne offizielle Adresse.",
            ),
            h("Erneutes Ermitteln"),
            p(
              "Ein erzwungenes erneutes Ermitteln schlägt jeden Stopp noch einmal nach, auch die schon als gefunden markierten. Manuelle Punkte lässt es absichtlich unberührt, denn ein von Hand gesetzter Punkt ist die bessere Information als alles, was eine Suche zurückgibt.",
            ),
            note(
              "Die Adresssuche ist auf Kanada ausgerichtet, deshalb wird eine kurze Adresse wie „12 Main St, Moncton“ ermittelt, ohne dass Sie das Land ausschreiben.",
            ),
            warn(
              "Stopps ohne Position können von der Optimierung nicht sortiert werden. Sie werden am Ende der Tour geparkt und nicht verworfen — prüfen Sie also das Ende Ihrer Liste, bevor Sie einen Fahrer losschicken.",
            ),
            see("delivery-routes/optimize-stop-order", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Losschicken",
      articles: [
        {
          slug: "optimize-stop-order",
          title: "Die Stopps sortieren",
          summary:
            "Sortieren Sie von Hand um, oder lassen Sie die Optimierung die Fahrreihenfolge bestimmen.",
          keywords: [
            "optimieren",
            "reihenfolge",
            "sortieren",
            "umsortieren",
            "kürzeste",
            "tourenplanung",
            "optimize",
            "order",
            "sequence",
          ],
          body: [
            p(
              "Stopps stehen zunächst in der Reihenfolge, in der Sie sie hinzugefügt haben. Das ist selten die Reihenfolge, in der Sie sie fahren möchten.",
            ),
            h("Von Hand"),
            p(
              "Ziehen Sie die Stopps in die gewünschte Reihenfolge. Nützlich, wenn der Fahrer die Gegend besser kennt als jeder Algorithmus, oder wenn ein Kunde zuerst dran sein muss.",
            ),
            h("Mit der Optimierung"),
            steps(
              "Ermitteln Sie zuerst die Adressen — ein Stopp ohne Position kann nicht sortiert werden.",
              "Wählen Sie „Reihenfolge optimieren“.",
              "Prüfen Sie das Ergebnis: die neue Reihenfolge, die Gesamtstrecke und die geschätzte Fahrzeit.",
              "Passen Sie danach von Hand an, wenn Sie möchten. Die Optimierung ist ein Vorschlag, den Sie überstimmen können.",
            ),
            h("Zwei Optimierungen"),
            table(
              ["Optimierung", "Was sie tut"],
              [
                [
                  "Standard",
                  "Läuft in GeoCliks, ohne externen Dienst, ohne Abrechnung. Gute Sortierung für einen normalen Tag.",
                ],
                [
                  "Intelligent",
                  "Nutzt echte Straßennetzdaten für eine engere Sortierung auf dichten oder umständlichen Touren. Delivery Pro und höher.",
                ],
              ],
            ),
            note(
              "Wenn Sie die intelligente Optimierung in einem Plan anfordern, der sie nicht enthält, führt GeoCliks stattdessen die Standardoptimierung aus, anstatt abzubrechen. Sie erhalten trotzdem eine sortierte Tour — prüfen Sie im Verlauf der Tour, welche Optimierung gelaufen ist.",
            ),
            h("Was die Optimierung berücksichtigt"),
            ul(
              "Ihre Startadresse und die Einstellung „Zurück zum Start“, falls sie aktiv ist.",
              "Die Servicezeit an jedem Stopp oder die Voreinstellung der Tour.",
              "Stopps ohne Position, die ihren Platz am Ende der Liste behalten.",
            ),
            see("delivery-routes/assign-a-driver", "troubleshoot/route-optimize-failed"),
          ],
        },
        {
          slug: "assign-a-driver",
          title: "Fahrer zuweisen",
          summary:
            "Geben Sie die Tour an jemanden in Ihrem Workspace und starten Sie den Tag.",
          keywords: [
            "zuweisen",
            "fahrer",
            "starten",
            "status",
            "disposition",
            "assign",
            "driver",
            "unassign",
          ],
          body: [
            p(
              "Eine Tour muss jemandem gehören, bevor sie gefahren werden kann. Der Fahrer muss Mitglied Ihres Workspaces sein — die Rolle Feld ist die richtige für Leute, die nur fahren und aufnehmen.",
            ),
            h("So weisen Sie sie zu"),
            steps(
              "Öffnen Sie die Tour.",
              "Wählen Sie „Fahrer“ und wählen Sie die Person aus.",
              "Die Tour erscheint auf ihrem Telefon unter ihren Touren für dieses Datum.",
              "Starten Sie sie, wenn es losgeht, oder lassen Sie den Fahrer sie starten, indem er seinen ersten Stopp abschließt.",
            ),
            h("Tourstatus"),
            table(
              ["Status", "Bedeutung"],
              [
                ["Entwurf", "Wird gebaut. Noch kein Fahrer."],
                ["Zugewiesen", "Ein Fahrer hat sie, noch nicht gestartet."],
                ["Läuft", "Wird gerade gefahren."],
                ["Abgeschlossen", "Jeder Stopp ist abgeschlossen."],
                ["Storniert", "Abgesagt. Stopps können nicht mehr abgeschlossen werden."],
              ],
            ),
            h("Wenn Sie es sich anders überlegen"),
            ul(
              "Nehmen Sie einer Tour den Fahrer weg, um sie zurück in den Entwurf zu setzen und jemand anderem zu geben.",
              "Ein Fahrer, der seine erste Zustellung fotografiert, ohne auf Start zu tippen, setzt die Tour trotzdem auf „Läuft“.",
              "Eine Tour zu stornieren verhindert, dass weitere Stopps darauf abgeschlossen werden, und behält alles bereits Erfasste.",
            ),
            note(
              "Ihr Plan legt fest, für wie viele Fahrer der Betrieb ausgelegt ist. Delivery Lite deckt zwei ab, Pro fünf, Fleet fünfzehn, Fleet 30 dreißig, Fleet 200 zweihundert, Fleet 500 fünfhundert.",
            ),
            see(
              "delivery-routes/driver-run-and-proof-of-delivery",
              "teamspace/roles-and-permissions",
            ),
          ],
        },
        {
          slug: "live-dispatch",
          title: "Live-Disposition",
          summary:
            "Fügen Sie einen Auftrag, der mitten in der Schicht kam, in die restlichen Stopps eines Fahrers ein.",
          keywords: [
            "disposition",
            "live",
            "stopp hinzufügen",
            "während der schicht",
            "auf abruf",
            "einfügen",
            "dispatch",
            "add stop",
            "insert",
          ],
          body: [
            p(
              "Der Routentyp „Disposition“ ist für Arbeit, die es beim Tagesbeginn noch nicht gibt: um 14:00 kommt ein Anruf, und jemand muss ihn übernehmen. Sie fügen den Stopp einer Tour hinzu, die bereits gefahren wird, und GeoCliks schiebt ihn ein.",
            ),
            h("Einen Live-Stopp hinzufügen"),
            steps(
              "Öffnen Sie die laufende Tour.",
              "Wählen Sie „Auftrag jetzt hinzufügen“.",
              "Geben Sie die Lieferadresse und die Angaben zum Empfänger ein.",
              "Bestätigen Sie. Der Stopp wird in den Teil der Tour eingefügt, den der Fahrer noch nicht erreicht hat, und erscheint auf seinem Telefon.",
            ),
            h("Was sich nie verschiebt"),
            ul(
              "Stopps, die schon zugestellt, fehlgeschlagen oder übersprungen sind.",
              "Der Stopp, zu dem der Fahrer gerade unterwegs ist.",
            ),
            p(
              "Ein neuer Stopp wird an der günstigsten Stelle der restlichen Liste eingefügt. Das ist bewusst keine erneute Optimierung: ein Werkzeug, das den Plan unter einem fahrenden Fahrer umsortiert, wird von den Leuten, die es benutzen, aufgegeben — und einen vollen Abend wiederholt neu zu optimieren würde Sie außerdem bei jeder Neuberechnung Geld kosten.",
            ),
            note(
              "Das Einfügen läuft lokal und ist kostenlos, so oft Sie es in einer Schicht auch tun.",
            ),
            warn(
              "Live-Disposition erfordert Delivery Pro oder höher. In einem Plan mit nur geplanten Touren können Sie einer Tour weiterhin Stopps hinzufügen, bevor sie startet.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
      ],
    },
    {
      title: "Unterwegs",
      articles: [
        {
          slug: "driver-run-and-proof-of-delivery",
          title: "Die Fahrt und der Liefernachweis",
          summary:
            "Was der Fahrer sieht und wie ein Stopp mit einem Beweis abgeschlossen wird.",
          keywords: [
            "fahrer",
            "fahrt",
            "nachweis",
            "foto",
            "unterschrift",
            "zugestellt",
            "offline",
            "driver",
            "proof",
          ],
          body: [
            p(
              "Auf dem Telefon bekommt der Fahrer einen Bildschirm: den Stopp, an dem er ist, die Adresse, den Empfänger, etwaige Notizen und wie viele Stopps noch übrig sind. Alles andere ist aus dem Weg.",
            ),
            h("Einen Stopp abschließen"),
            steps(
              "Auf den Stopp tippen.",
              "Das Lieferfoto aufnehmen — das Paket an der Tür, die Palette in der Bucht, was auch immer beweist, dass es angekommen ist.",
              "Den Namen des Empfängers bestätigen oder korrigieren.",
              "Eine Unterschrift erfassen, wenn die Tour eine verlangt.",
              "Als zugestellt markieren. Der nächste Stopp kommt.",
            ),
            h("Das Foto ist nicht optional"),
            p(
              "Ein zugestellter oder fehlgeschlagener Stopp muss mit einem echten Foto aus Ihrem Workspace abgeschlossen werden. Es gibt keine Möglichkeit, einen Stopp ohne Anhang als zugestellt zu markieren — genau darum nutzt man GeoCliks für Lieferungen und keine Checklisten-App.",
            ),
            h("Offline"),
            ul(
              "Die Fahrt funktioniert ohne Empfang. Fotos und Stoppabschlüsse warten in der Warteschlange auf dem Gerät.",
              "Als Abschlusszeit wird erfasst, wann das Foto aufgenommen wurde, nicht wann es hochgeladen wurde — eine Tour durch ein Funkloch liest sich also trotzdem richtig.",
              "Wenn die Warteschlange zweimal geleert wird, wird der zweite Versuch erkannt und ignoriert, anstatt den Stopp doppelt abzuschließen.",
            ),
            note(
              "Das Büro sieht jeden Stoppabschluss, sobald er eintrifft, sodass ein Disponent, der die Tour verfolgt, weiß, wo der Fahrer ist, ohne ihn anzurufen.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "mobile-app/offline-capture-and-queue",
            ),
          ],
        },
        {
          slug: "failed-and-skipped-stops",
          title: "Fehlgeschlagene und übersprungene Stopps",
          summary:
            "Halten Sie fest, warum eine Lieferung nicht stattfand — so, dass das Büro damit arbeiten kann.",
          keywords: [
            "fehlgeschlagen",
            "übersprungen",
            "niemand angetroffen",
            "verweigert",
            "falsche adresse",
            "ausnahme",
            "failed",
            "skipped",
            "refused",
          ],
          body: [
            p(
              "Nicht jeder Stopp klappt. Ein fehlgeschlagener Stopp ist trotzdem ein abgeschlossener Stopp mit Beweis — er ist der Nachweis, dass der Fahrer dort war, und was er angetroffen hat.",
            ),
            h("Einen Stopp als fehlgeschlagen markieren"),
            steps(
              "Auf den Stopp tippen und fotografieren, was der Fahrer vor sich hat — die verschlossene Tür, die blockierte Zufahrt, das falsche Gebäude.",
              "„Fehlgeschlagen“ wählen.",
              "Einen Grund auswählen.",
              "Eine Notiz ergänzen, wenn das Büro etwas wissen muss.",
              "Speichern.",
            ),
            h("Die Gründe"),
            table(
              ["Grund", "Nutzen Sie ihn für"],
              [
                ["Niemand angetroffen", "Niemand da, der es annehmen konnte."],
                ["Annahme verweigert", "Der Empfänger wollte es nicht annehmen."],
                ["Falsche Adresse", "Die Adresse passt nicht zum Empfänger."],
                ["Geschlossen", "Ein Betrieb, der zu hatte."],
                ["Kein Zugang", "Konnte es körperlich nicht erreichen — Tor, Schnee, Baustelle."],
                ["Sonstiges", "Alles andere. Schreiben Sie es in die Notiz."],
              ],
            ),
            h("Stattdessen überspringen"),
            p(
              "Ein Überspringen ist etwas anderes: Damit meldet der Fahrer, dass hier überhaupt nichts zuzustellen war. Es ist der einzige Abschluss, der kein Foto braucht, und es wird als Überspringen erfasst, damit das Büro im Verlauf genau das liest und nicht einen Fehlschlag, den es nie gab.",
            ),
            warn(
              "Ein fehlgeschlagener Stopp löst nie eine Liefernachweis-E-Mail an den Empfänger aus. Die erledigt das Büro von Hand, denn ein fröhliches „Ihr Paket ist angekommen“ für eine gescheiterte Zustellung ist schlimmer als gar keine Nachricht.",
            ),
            note(
              "Jeder Abschluss, jeder Fehlschlag und jedes Überspringen wird in den Verlauf der Tour geschrieben, mit wer es getan hat und wann, und der Verlauf kann nicht bearbeitet werden.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "delivery-routes/driver-run-and-proof-of-delivery",
            ),
          ],
        },
        {
          slug: "tracking-links-and-notifications",
          title: "Tracking-Links und E-Mails an Empfänger",
          summary:
            "Die drei E-Mails, die ein Empfänger erhalten kann, und was die Tracking-Seite genau zeigt.",
          keywords: [
            "tracking",
            "benachrichtigung",
            "e-mail",
            "empfänger",
            "ankunft",
            "link",
            "datenschutz",
            "notification",
            "recipient",
            "eta",
          ],
          body: [
            p(
              "Ein Empfänger, für dessen Stopp eine E-Mail-Adresse hinterlegt ist, kann automatisch informiert werden. Sie steuern das pro Tour, und ein Empfänger ohne E-Mail-Adresse wird einfach nie kontaktiert.",
            ),
            h("Die drei E-Mails"),
            table(
              ["E-Mail", "Wann sie rausgeht"],
              [
                ["Unterwegs", "Die Tour hat begonnen und der Fahrer ist draußen."],
                ["Sie sind als Nächstes dran", "Der Fahrer ist eine festgelegte Anzahl Stopps entfernt."],
                [
                  "Zugestellt",
                  "Ihr Stopp wurde abgeschlossen. Enthält das Nachweisfoto und dessen Code.",
                ],
              ],
            ),
            h("Einstellungen"),
            ul(
              "Die Vorwarn-E-Mail für die Tour ein- oder ausschalten.",
              "Festlegen, wie viele Stopps vorher sie rausgeht — bei einem bleibt kaum Vorwarnung, bei fünf ein weites Zeitfenster.",
              "Die Liefernachweis-E-Mail ein- oder ausschalten.",
            ),
            h("Was die Tracking-Seite zeigt"),
            p(
              "Jede E-Mail verlinkt auf eine Tracking-Seite für diesen einen Stopp, erreichbar über einen nicht erratbaren Link. Der Empfänger sieht Ihren Firmennamen, seine eigene Adresse, wie viele Zustellungen noch vor seiner liegen, und sobald der Stopp abgeschlossen ist das Nachweisfoto mit verifizierter Zeit und Position.",
            ),
            h("Was sie bewusst nicht zeigt"),
            ul(
              "Irgendeinen anderen Stopp, eine andere Adresse oder einen anderen Empfänger der Tour.",
              "Den Namen, die Telefonnummer oder die Live-Position des Fahrers.",
              "Den Tournamen oder die Gesamtzahl der Stopps — womit ein Wettbewerber Ihre Runde kartieren könnte.",
            ),
            note(
              "Jeder Empfänger erhält jede E-Mail höchstens einmal, und der Fortschritt des Fahrers wird unmittelbar vor dem Senden erneut geprüft, damit niemand ein „Sie sind als Nächstes dran“ für einen Stopp bekommt, der gerade zugestellt wurde.",
            ),
            warn(
              "E-Mails an Empfänger gehen nur raus, wenn der E-Mail-Versand für Ihren Workspace eingerichtet ist. Wenn Empfänger melden, dass nichts ankommt, ist das das Erste, was Sie prüfen sollten.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "troubleshoot/notifications-not-arriving",
            ),
          ],
        },
      ],
    },
  ],
};
