import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const verify: Category = {
  slug: "verify",
  title: "Verifizierung",
  summary:
    "Jede Aufnahme trägt einen Code, den jeder prüfen kann, und ein Siegel, das zeigt, ob sie verändert wurde.",
  icon: "ShieldCheck",
  sections: [
    {
      title: "Eine Aufnahme prüfen",
      articles: [
        {
          slug: "what-is-a-photo-code",
          title: "Was ist ein Fotocode?",
          summary:
            "Der kurze Code auf jeder Aufnahme und die öffentliche Seite, zu der er führt.",
          keywords: [
            "code",
            "fotocode",
            "prüfen",
            "öffentlich",
            "qr",
            "nachweis",
            "photo code",
            "verify",
          ],
          body: [
            p(
              "Jede Aufnahme erhält einen eindeutigen Code, der im Wasserzeichen steht und in jeden Bericht und jeden Export übernommen wird. Er sieht so aus:",
            ),
            ul("GC-4K7P-92XB-1DQ4"),
            p(
              "Der Code ist der Griff an genau dieser einen Aufnahme. Wer ihn hat — ein Kunde, eine Versicherung, ein Gutachter, ein Anwalt — kann ihn auf der öffentlichen Prüfseite nachschlagen: ohne Konto, ohne App und ohne Sie um irgendetwas zu bitten.",
            ),
            h("Wo der Code auftaucht"),
            ul(
              "Ins Wasserzeichen auf dem Foto oder Video eingebrannt, wenn Ihre Vorlage ihn enthält.",
              "Auf jeder Seite eines PDF-Berichts.",
              "Im Excel-Export, eine Zeile je Aufnahme.",
              "Als Dateiname jedes Bildes in einem ZIP-Export.",
              "In der Zustellnachweis-E-Mail an den Empfänger einer Lieferung.",
            ),
            h("Warum das wichtig ist"),
            p(
              "Ein Foto allein beweist nichts — jeder kann einen Zeitstempel hineinretuschieren. Ein Code, der auf einen unabhängigen Datensatz auf dem Server Ihres Anbieters führt und dort dieselbe Zeit, dieselben Koordinaten und ein intaktes Siegel zeigt, ist eine andere Art von Nachweis. Wer prüft, muss Ihnen nicht glauben.",
            ),
            note(
              "Codes werden als GC-XXXX-XXXX-XXXX geschrieben, Sie können sie aber klein, mit Leerzeichen, ohne Präfix eingeben oder den ganzen Prüflink einfügen. All das führt zur selben Aufnahme. Aufnahmen von vor der Umbenennung tragen stattdessen einen TM--Code; die lassen sich weiterhin genauso prüfen, und die bereits in alten Berichten gedruckten Codes funktionieren weiter.",
            ),
            see("verify/verify-a-photo", "verify/how-sealing-works"),
          ],
        },
        {
          slug: "verify-a-photo",
          title: "Ein Foto prüfen",
          summary: "Wie Sie oder Ihr Kunde einen Code prüfen und was die Seite zeigt.",
          keywords: [
            "prüfen",
            "nachschlagen",
            "kunde",
            "öffentliche seite",
            "scannen",
            "verify",
            "check",
          ],
          body: [
            p(
              "Die Prüfung ist öffentlich und dauert ein paar Sekunden. Schicken Sie einem Kunden den Code, und er kann sie selbst durchführen.",
            ),
            h("Einen Code prüfen"),
            steps(
              "Gehen Sie auf geocliks.com/v und geben Sie den Code ein, oder öffnen Sie den Link direkt.",
              "Lesen Sie den Datensatz: der Workspace, dem die Aufnahme gehört, wann sie gemacht wurde, wo, und das Integritätsergebnis.",
              "Vergleichen Sie ihn mit dem Wasserzeichen auf dem Foto, das Sie vor sich haben. Beides muss exakt übereinstimmen.",
            ),
            h("Was die Seite zeigt"),
            table(
              ["Feld", "Bedeutung"],
              [
                ["Workspace", "Der Workspace, zu dem die Aufnahme gehört."],
                ["Aufgenommen", "Die Gerätezeit, als ausgelöst wurde."],
                [
                  "Verifiziert",
                  "Die Serverzeit beim Eintreffen. Vom Handy aus nicht einstellbar.",
                ],
                ["Standort", "Koordinaten, Genauigkeit und die zugehörige Adresse."],
                ["Integrität", "Ob das Siegel noch zu Datei und Metadaten passt."],
                ["Gerät", "Modell und Plattform der Aufnahme."],
                ["Inhalts-Hash", "Der Fingerabdruck der Bilddaten."],
              ],
            ),
            h("Warum das Bild selbst manchmal verborgen bleibt"),
            p(
              "Der Datensatz ist immer öffentlich, das Bild nicht. Das Bild wird nur gezeigt, wenn Ihr Workspace einen aktiven Freigabelink veröffentlicht hat, der diese Aufnahme umfasst. Das ist Absicht — ein Code, der aus einem Bericht nach außen gelangt, soll nicht das Foto mitnehmen. Widerrufen Sie den Link, und das Bild ist wieder privat, während der Datensatz prüfbar bleibt.",
            ),
            note(
              "Öffentliche Prüfungen werden in den Verlauf der Aufnahme geschrieben, Sie sehen also, dass ein Code geprüft wurde. Wiederholte Aufrufe innerhalb einer halben Stunde zählen einmal, damit ein Kunde, der die Seite neu lädt, die echten Ereignisse nicht zuschüttet.",
            ),
            see("teamspace/share-links", "verify/verify-results-explained"),
          ],
        },
        {
          slug: "verify-results-explained",
          title: "Das Ergebnis lesen",
          summary:
            "Verifiziert, unbestätigt, manipuliert — und was eine Warnung zur Uhrabweichung bedeutet.",
          keywords: [
            "verifiziert",
            "unbestätigt",
            "manipuliert",
            "uhrabweichung",
            "uhr",
            "ergebnis",
            "warnung",
            "verified",
            "tampered",
            "skew",
          ],
          body: [
            p("Jede Aufnahme trägt eines von drei Integritätsergebnissen."),
            table(
              ["Ergebnis", "Bedeutung"],
              [
                [
                  "Verifiziert",
                  "Das Siegel passt zu Datei und Metadaten. Seit dem Hochladen hat sich nichts verändert.",
                ],
                [
                  "Unbestätigt",
                  "Das Siegel konnte nicht bestätigt werden. Meist eine Aufnahme aus einer älteren App-Version oder ein unvollständiger Upload — kein Hinweis auf Manipulation.",
                ],
                [
                  "Manipuliert",
                  "Das Siegel passt nicht. Die Datei oder ihre Metadaten wurden nach dem Hochladen verändert.",
                ],
              ],
            ),
            h("Zeitquelle und Uhrabweichung"),
            p(
              "GeoCliks erfasst zwei Zeiten: die Gerätezeit bei der Aufnahme und die Serverzeit beim Eintreffen. Der Abstand dazwischen wird gespeichert.",
            ),
            ul(
              "Innerhalb von etwa fünf Minuten steht die Zeitquelle auf Netzwerkzeit — normal und erwartet.",
              "Darüber hinaus steht sie auf Gerätezeit, und die Abweichung wird im Datensatz angezeigt.",
            ),
            p(
              "Eine große Abweichung ist nicht automatisch verdächtig. Ein Handy, das zwei Tage offline war, lädt mit einem echten Abstand hoch, und die Abweichung erklärt ihn. Sie bedeutet aber, dass Geräteuhr und Serveruhr nicht übereinstimmen — und der Datensatz sagt das, statt stillschweigend eine von beiden zu wählen.",
            ),
            h("Einem Kunden das Ergebnis erklären"),
            ul(
              "Verifiziert: Der Datensatz ist unversehrt — genau dafür ist die Prüfung da.",
              "Unbestätigt: Bieten Sie das Original aus Ihrem Workspace an, das weiterhin seinen vollständigen Verlauf trägt.",
              "Manipuliert: Halten Sie inne und sehen Sie nach, wo die Datei war. Geben Sie sie nicht weiter.",
            ),
            warn(
              "Ein Foto außerhalb von GeoCliks zu bearbeiten — zuschneiden, komprimieren, durch eine Chat-App schicken — verändert die Bytes und bricht das Siegel. Versenden Sie das Original aus Ihrem Workspace oder aus einem Bericht, niemals eine Fassung, die durch etwas anderes gelaufen ist.",
            ),
            see("verify/how-sealing-works", "troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "how-sealing-works",
          title: "Wie das Versiegeln funktioniert",
          summary:
            "Die drei Dinge, die ein Gerät nicht allein fälschen kann — in einfachen Worten.",
          keywords: [
            "hash",
            "signatur",
            "hmac",
            "sha-256",
            "siegel",
            "manipulation",
            "sicherheit",
            "seal",
            "security",
          ],
          body: [
            p(
              "Sie brauchen diesen Artikel nicht, um GeoCliks zu benutzen. Er steht hier für die Person auf der anderen Seite einer Auseinandersetzung, die wissen will, warum man dem Datensatz glauben sollte.",
            ),
            h("1. Zwei Uhren, beide erfasst"),
            p(
              "Die Aufnahmezeit kommt vom Gerät. Die Verifizierungszeit stempelt der GeoCliks-Server beim Eintreffen der Datei, und keine Handy-Einstellung kann sie beeinflussen. Beide werden gespeichert, zusammen mit der Differenz. Wer die Uhr eines Handys verstellt, verschiebt die Aufnahmezeit — und das fällt sofort als Abstand zur Serverzeit auf.",
            ),
            h("2. Ein Fingerabdruck der Datei"),
            p(
              "Ein SHA-256-Hash der hochgeladenen Bilddaten wird mit dem Datensatz gespeichert. Ändern Sie ein einziges Pixel, und der Hash passt nicht mehr. Es ist ein Fingerabdruck, keine Kopie — er sagt nichts über den Bildinhalt aus.",
            ),
            h("3. Eine Signatur über den ganzen Datensatz"),
            p(
              "Fotocode, besitzender Workspace, aufnehmende Person, Speicherort, beide Zeitstempel, die Koordinaten und der Inhalts-Hash werden in fester Reihenfolge zusammengeführt und mit einem geheimen Schlüssel signiert, den nur der Server hat. Wird einer dieser Werte nachträglich verändert, passt die Signatur nicht mehr — und genau das erzeugt das Ergebnis „Manipuliert“.",
            ),
            h("Was das belegt und was nicht"),
            ul(
              "Es belegt, dass Datei und Metadaten sich seit dem Eingang bei GeoCliks nicht verändert haben.",
              "Es belegt die Eingangszeit unabhängig vom Gerät.",
              "Es belegt nicht, dass das Handy auf etwas Wahrhaftiges gerichtet war. Das kann kein System. Ausgeschlossen wird die Möglichkeit, den Datensatz nachträglich still zu verändern.",
            ),
            note(
              "Der Signaturvergleich läuft in konstanter Zeit, die Prüfung selbst lässt sich also nicht abtasten, um den Schlüssel zu ermitteln.",
            ),
            see("verify/verify-results-explained", "legal/data-ownership"),
          ],
        },
      ],
    },
  ],
};
