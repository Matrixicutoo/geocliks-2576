import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const legal: Category = {
  slug: "legal",
  title: "Datenschutz & Recht",
  summary:
    "Wem die Nachweise gehören, wie lange sie gespeichert bleiben und was in Datenschutzerklärung und AGB tatsächlich steht.",
  icon: "Scale",
  sections: [
    {
      title: "Ihre Daten",
      articles: [
        {
          slug: "data-ownership",
          title: "Wem Ihre Aufnahmen gehören",
          summary:
            "Ihre Fotos und Videos bleiben Ihre. Was GeoCliks damit tun darf — und was nicht.",
          keywords: [
            "eigentum",
            "rechte",
            "lizenz",
            "inhalte",
            "training",
            "urheberrecht",
            "ownership",
            "own",
            "rights",
            "licence",
            "license",
            "content",
            "training",
          ],
          body: [
            p(
              "Alles, was Sie hochladen, gehört Ihnen: die Fotos, die Videos, die Projektdaten, die Notizen. GeoCliks speichert es und weist nach, dass es unverändert ist. Es wird nicht dadurch unser Eigentum, dass Sie es hochladen.",
            ),
            h("Was wir damit tun dürfen"),
            p(
              "Die AGB räumen GeoCliks eine eng begrenzte Lizenz ein — Ihre Aufnahmen hosten, speichern, übertragen, in der Größe anpassen, indexieren und anzeigen — und das nur, damit das Produkt für Sie und für die Personen funktioniert, mit denen Sie etwas teilen. Mehr ist es nicht.",
            ),
            ul(
              "Wir verkaufen Ihre Inhalte nicht.",
              "Wir nutzen sie nicht, um Modelle für maschinelles Lernen für Dritte zu trainieren.",
              "Wir zeigen sie niemandem, mit dem Sie sie nicht geteilt haben.",
            ),
            h("Der Datensatz gehört dem Workspace, nicht der einzelnen Person"),
            p(
              "Aufnahmen gehören dem Workspace, in dem sie entstanden sind, nicht dem Teammitglied, das den Auslöser gedrückt hat. Das ist beabsichtigt, und genau das hält den Nachweisdatensatz zusammen:",
            ),
            ul(
              "Wenn Sie ein Mitglied entfernen, bleiben alle seine Fotos erhalten — und seine Einträge in der Aufnahmehistorie ebenso.",
              "Ein Projekt zu löschen löscht nicht seine Aufnahmen.",
              "Ein Mitglied, das den Workspace verlässt, verliert den Zugriff auf dessen Inhalte, nimmt sie aber nicht mit.",
            ),
            note(
              "Wenn Sie in einem Workspace sind, der Ihnen nicht gehört, und etwas an Ihren Aufnahmen geändert haben möchten, fragen Sie zuerst den Inhaber des Workspaces. Für diese Inhalte handelt GeoCliks auf Weisung des Workspaces.",
            ),
            h("Wofür Sie verantwortlich sind"),
            p(
              "Sie bestätigen, dass Sie das Recht haben, aufzunehmen und hochzuladen, was Sie hochladen — einschließlich jeder Erlaubnis, die von den Personen, Eigentümern oder Betreibern im Bild benötigt wird. GeoCliks prüft das nicht für Sie.",
            ),
            h("Was das Siegel beweist und was nicht"),
            p(
              "Code, Hash und Signatur auf jeder Aufnahme machen unbemerkte Manipulation schwer und erlauben jedem zu prüfen, dass eine Datei sich seit ihrem Eingang nicht verändert hat. Sie machen GeoCliks nicht zum Notar, zum Gutachter oder zur Rechtsberatung, und kein Gericht, keine Versicherung und kein Kunde ist verpflichtet, den Datensatz anzuerkennen. Diese Entscheidung liegt immer bei ihnen.",
            ),
            see("verify/how-sealing-works", "legal/data-retention", "legal/terms-summary"),
          ],
        },
        {
          slug: "data-retention",
          title: "Wie lange Ihre Daten gespeichert bleiben",
          summary:
            "Was ein gelöschtes Projekt, ein entferntes Mitglied, ein gekündigter Plan und ein geschlossener Workspace überlebt.",
          keywords: [
            "aufbewahrung",
            "löschen",
            "löschung",
            "speicherung",
            "kündigen",
            "konto schließen",
            "retention",
            "delete",
            "deletion",
            "keep",
            "storage",
            "cancel",
            "close account",
            "erase",
          ],
          body: [
            p(
              "Die kurze Fassung: Inhalte eines Workspaces bleiben so lange gespeichert, wie der Workspace existiert. Fast nichts sonst entfernt sie.",
            ),
            table(
              ["Was Sie tun", "Was mit den Aufnahmen passiert"],
              [
                [
                  "Ein Projekt löschen",
                  "Die Aufnahmen bleiben. Der Nachweisdatensatz hängt nicht am Projekt.",
                ],
                [
                  "Ein Mitglied entfernen",
                  "Seine Fotos und seine Einträge in der Historie bleiben beim Workspace.",
                ],
                [
                  "Das eigene Konto löschen",
                  "Ihr Profil und Ihre Zugangsdaten verschwinden. Aufnahmen, die Sie im Workspace einer anderen Person gemacht haben, bleiben dort.",
                ],
                [
                  "Einen bezahlten Plan kündigen",
                  "Es wird nichts gelöscht. Der Workspace fällt auf den Free-Plan zurück, bezahlte Funktionen enden.",
                ],
                ["Den Workspace schließen", "Alles verschwindet, und das ist nicht rückgängig zu machen."],
              ],
            ),
            h("Kündigen ist nicht Löschen"),
            p(
              "Ein Downgrade oder eine Kündigung vernichtet niemals Aufnahmen. Ihre Historie bleibt, und jeder Fotocode, der schon an einen Kunden gegeben wurde, lässt sich weiterhin auf der öffentlichen Prüfseite auflösen. Was wegfällt, sind die Funktionen oberhalb der Free-Grenzen — zusätzliche Plätze, Freigabelinks, die umfangreicheren Exportformate.",
            ),
            h("Einen Workspace endgültig schließen"),
            p(
              "Es gibt absichtlich keinen Selbstbedienungs-Knopf, um einen ganzen Workspace zu löschen — es ist viel zu leicht, einen Nachweisdatensatz versehentlich zu vernichten.",
            ),
            steps(
              "Der Inhaber des Workspaces schreibt an support@geocliks.com, von der Adresse des Inhaberkontos aus.",
              "Exportieren Sie vorher alles, was Sie behalten wollen — PDF, Excel, ZIP oder KMZ.",
              "Wir bestätigen die Anfrage und entfernen dann den Workspace samt seinen Aufnahmen.",
            ),
            warn(
              "Das Löschen eines Workspaces ist endgültig. Aufnahmen, Projekte, Berichte und Fotocodes verschwinden alle, und jeder Prüflink, den Sie einem Kunden gegeben haben, lässt sich nicht mehr auflösen. Exportieren Sie zuerst.",
            ),
            h("Backups und Protokolle"),
            p(
              "Backups und Sicherheitsprotokolle werden nur eine begrenzte Zeit vorgehalten und dann ausgetauscht. Eine Löschung kann daher etwas brauchen, bis sie in jeder Kopie angekommen ist.",
            ),
            h("Ihre eigenen Daten anfordern"),
            p(
              "Sie können Auskunft, Berichtigung, Export oder Löschung Ihrer personenbezogenen Daten verlangen. Das meiste können Sie in Ihrem Profil und in den Abrechnungseinstellungen selbst ändern. Für alles andere schreiben Sie an support@geocliks.com, von der Adresse Ihres Kontos aus.",
            ),
            see("legal/data-ownership", "plans-billing/cancel-or-downgrade", "legal/privacy-summary"),
          ],
        },
      ],
    },
    {
      title: "Die Rechtsdokumente",
      articles: [
        {
          slug: "privacy-summary",
          title: "Die Datenschutzerklärung in einfachen Worten",
          summary:
            "Was GeoCliks erhebt, wozu, wer es sonst sieht und welche Wahl Sie haben. Eine Zusammenfassung, kein Ersatz.",
          keywords: [
            "datenschutz",
            "datenschutzerklärung",
            "dsgvo",
            "personenbezogene daten",
            "standort",
            "cookies",
            "rechte",
            "privacy",
            "policy",
            "gdpr",
            "personal data",
            "location",
            "cookies",
            "rights",
          ],
          body: [
            p(
              "Das hier ist eine einfache Lesart der Datenschutzerklärung, damit Sie wissen, was darin steht. Maßgeblich ist das Dokument selbst, und es liegt unter geocliks.com/privacy.",
            ),
            h("Was erhoben wird"),
            ul(
              "Kontodaten: Name, E-Mail, ein Hash Ihres Passworts (niemals das Passwort selbst), Profilbild, Sprache, Design und Ihr Zwei-Faktor-Geheimnis, wenn Sie es einschalten.",
              "Daten des Workspaces: Namen von Workspace und Projekten, Kunden, Orte, Rollen, Einladungen, Vorlagen und Berichte.",
              "Aufnahmen: das Foto oder Video samt Zeitstempel, Koordinaten, aufgelöster Adresse, Gerätezeit der Aufnahme, Fotocode, Inhalts-Hash und Signatur.",
              "Nachrichten: Direktnachrichten und Rundnachrichten innerhalb des Workspaces, einschließlich angehängter Bilder.",
              "Gerätedaten: App-Version, Plattform, IP-Adresse, Push-Token, Fehlerprotokolle und einfache Nutzungsereignisse.",
              "Abrechnungsdaten: Ihr Plan, der Status Ihres Abonnements und die Kennungen, die der Zahlungsdienstleister zurückgibt. Kartennummern erreichen uns nie.",
            ),
            note(
              "GeoCliks will keine Ausweisnummern, keine Gesundheitsdaten und keine anderen besonderen Kategorien personenbezogener Daten. Halten Sie sie aus Projektnamen, Notizen und Nachrichten heraus.",
            ),
            h("Standort und Kamera"),
            p(
              "Die App fragt nach Kamera und Standort, weil eine Aufnahme ein Foto plus Ort und Zeit ist. Sie können beide Berechtigungen verweigern, und die App läuft weiter — aber eine Aufnahme ohne Standort trägt keine Koordinaten und keine Adresse, und das ist der größte Teil dessen, was sie zum Nachweis macht. Der Standort wird im Moment der Aufnahme gelesen und um Pins auf Ihrer Karte zu setzen. Es gibt keine Verfolgung im Hintergrund.",
            ),
            h("Wer es sonst sieht"),
            p(
              "Ihre Daten werden nicht verkauft und niemals für Werbung weitergegeben. Eine kleine Gruppe von Dienstleistern verarbeitet sie auf unsere Weisung: Cloud-Hosting und Speicher, der Zahlungsdienstleister (und Apple für In-App-Käufe), der E-Mail-Anbieter, der Push-Benachrichtigungsdienst und der Kartenanbieter, der Adressen auflöst.",
            ),
            h("Freigabelinks sind wirklich öffentlich"),
            p(
              "Freigabelinks und Prüfseiten funktionieren für jeden, der den Link hat, ohne Anmeldung. Genau darum geht es bei ihnen. Einen Link zu widerrufen stoppt künftige Zugriffe, kann aber keine Kopie zurückholen, die jemand schon heruntergeladen hat.",
            ),
            h("Ihre Rechte"),
            p(
              "Nach Maßgabe des jeweils geltenden Rechts können Sie Auskunft, Berichtigung, Export oder Löschung Ihrer personenbezogenen Daten verlangen, bestimmte Verarbeitungen einschränken oder ihnen widersprechen und eine Einwilligung widerrufen. Schreiben Sie an support@geocliks.com, von der Adresse Ihres Kontos aus. In Kanada können Sie sich außerdem beim Office of the Privacy Commissioner beschweren; im EWR oder im Vereinigten Königreich bei Ihrer zuständigen Aufsichtsbehörde.",
            ),
            h("Cookies"),
            p(
              "Nur das, was das Produkt braucht: Sie angemeldet halten, Sprache und Design merken und Aufnahmen in der Warteschlange halten, solange Sie offline sind. Keine Werbe- oder seitenübergreifenden Tracking-Cookies.",
            ),
            note(
              "Datenschutzerklärung und AGB werden absichtlich nur auf Englisch veröffentlicht. Eine maschinelle Übersetzung von Rechtstexten kann deren Bedeutung verändern.",
            ),
            see("legal/data-retention", "teamspace/share-links", "legal/terms-summary"),
          ],
        },
        {
          slug: "terms-summary",
          title: "Die AGB in einfachen Worten",
          summary:
            "Die Pflichten auf beiden Seiten, die Grenzen, die GeoCliks offen benennt, und was passiert, wenn Sie nicht mehr zahlen.",
          keywords: [
            "agb",
            "nutzungsbedingungen",
            "vertrag",
            "haftung",
            "zulässige nutzung",
            "abrechnung",
            "plätze",
            "terms",
            "tos",
            "agreement",
            "liability",
            "acceptable use",
            "billing",
            "seats",
          ],
          body: [
            p(
              "Eine einfache Lesart der AGB. Bindend ist das Dokument unter geocliks.com/terms; das hier steht da, damit nichts darin Sie überrascht.",
            ),
            h("Wer sie nutzen darf"),
            p(
              "Sie müssen 16 Jahre oder älter sein. Wenn Sie sich für ein Unternehmen anmelden, bestätigen Sie damit, dass Sie die AGB in dessen Namen annehmen dürfen.",
            ),
            h("Grenzen, die GeoCliks offen benennt"),
            p(
              "Die AGB sind ungewöhnlich deutlich darin, was das Produkt nicht versprechen kann, und es lohnt sich, diese Liste zu lesen statt etwas anzunehmen:",
            ),
            ul(
              "GeoCliks ist kein Notar, kein Gutachter, kein Labor und keine Rechtsberatung, und nichts, was es erzeugt, ist eine Rechtsberatung.",
              "Ein netzwerkverifizierter Zeitstempel bedeutet, dass unser Server festgehalten hat, wann der Upload eingegangen ist — nicht, dass die Uhr des Geräts richtig lief.",
              "Wenn die Uhr eines Geräts mehr als wenige Minuten von unserer abweicht, wird die Aufnahme stattdessen als gerätezeit-basiert gekennzeichnet.",
              "Die Genauigkeit des Standorts hängt vom Telefon und seiner Umgebung ab; in Gebäuden und zwischen hohen Häusern kann sie deutlich abweichen.",
              "Offline gemachte Aufnahmen werden erst dann als verifiziert gesiegelt, wenn sie unsere Server erreichen.",
              "Kein Gericht, keine Versicherung, kein Kunde und keine Behörde ist verpflichtet, einen GeoCliks-Datensatz anzuerkennen.",
            ),
            h("Was Sie zu unterlassen zusagen"),
            ul(
              "Den Dienst rechtswidrig nutzen oder dazu, jemanden zu belästigen, zu überwachen oder einzuschüchtern.",
              "Inhalte hochladen, zu deren Hochladen Sie nicht berechtigt sind.",
              "Einen Stempel, Hash, eine Signatur oder einen Fotocode verändern, fälschen oder entfernen oder verändertes Material als GeoCliks-Datensatz ausgeben.",
              "Den Dienst ausspähen, überlasten oder störend beeinflussen oder Ratenbegrenzungen und Plankontingente umgehen.",
              "Den Dienst weiterverkaufen oder einen Platz von mehreren Personen nutzen lassen.",
            ),
            warn(
              "Plätze gelten pro Person, nicht pro Gerät. Ein Teammitglied kann sich auf einem Telefon, einem Tablet und im Web anmelden — aber zwei Personen, die sich einen Login teilen, verstoßen gegen die AGB und machen die Aufnahmehistorie wertlos, weil jedes Foto derjenigen Person zugeordnet wird, der der Platz gehört.",
            ),
            h("Abrechnung"),
            p(
              "Bezahlte Pläne verlängern sich automatisch, bis sie gekündigt werden. Abonnements über das Web werden von unserem Zahlungsdienstleister abgerechnet; Abonnements, die in der iOS-App gekauft werden, rechnet Apple ab und folgen dem Rückerstattungsverfahren von Apple. Preise verstehen sich ohne Steuern. Bereits gezahlte Gebühren werden nicht zurückerstattet, außer wo das Gesetz es verlangt.",
            ),
            p(
              "Wenn eine Zahlung fehlschlägt oder Sie kündigen, wechselt der Workspace auf den Free-Plan und bezahlte Funktionen enden. Ihre Aufnahmen bleiben.",
            ),
            h("Sperrung"),
            p(
              "Wir können den Zugang bei einem Verstoß gegen die AGB, bei einer Nutzung, die den Dienst oder andere Kunden gefährdet, oder wenn das Gesetz es verlangt, sperren oder beenden. Wo es angemessen möglich ist, warnen wir Sie vorher und geben Ihnen Gelegenheit zu exportieren.",
            ),
            h("Verfügbarkeit und Haftung"),
            p(
              "Es gibt keine vertraglich zugesagte Verfügbarkeit, sofern Sie nicht eine gesonderte schriftliche Vereinbarung mit uns geschlossen haben. Der Dienst wird wie besehen bereitgestellt, und die Gesamthaftung für einen Anspruch ist auf den Betrag begrenzt, den Sie in den zwölf Monaten vor dessen Entstehung gezahlt haben. Manche Rechtsordnungen lassen Teile davon nicht zu; dort gelten diese Grenzen nur so weit, wie das Gesetz es erlaubt.",
            ),
            h("Änderungen"),
            p(
              "Wesentliche Änderungen an den AGB oder der Datenschutzerklärung werden vor ihrem Inkrafttreten in der App oder per E-Mail angekündigt. Fragen zu einem der beiden Dokumente gehen an support@geocliks.com.",
            ),
            see("legal/data-ownership", "plans-billing/seats-and-billing", "verify/verify-results-explained"),
          ],
        },
      ],
    },
  ],
};
