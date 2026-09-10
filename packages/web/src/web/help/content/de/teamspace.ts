import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const teamspace: Category = {
  slug: "teamspace",
  title: "Teamspace",
  summary:
    "Der gemeinsame Workspace, in dem die Aufnahmen Ihres Teams landen und aus denen das Büro Projekte, Berichte und Freigabelinks macht.",
  icon: "Users",
  sections: [
    {
      title: "Ihr Workspace",
      articles: [
        {
          slug: "teamspace-overview",
          title: "Teamspace im Überblick",
          summary:
            "Was ein Workspace ist, was darin landet und wer welche Teile davon sieht.",
          keywords: [
            "workspace",
            "organisation",
            "firma",
            "übersicht",
            "gemeinsam",
            "org",
            "dashboard",
            "shared",
          ],
          body: [
            p(
              "Ein Teamspace ist ein gemeinsamer Workspace für ein Unternehmen. Jedes Foto und jedes Video, das Ihr Team mit dem Telefon aufnimmt, wird dorthin hochgeladen, und alle mit Zugriff sehen dieselbe Sammlung — aus der Web-App, der Desktop-App oder von ihrem Telefon.",
            ),
            p(
              "Sie müssen nichts von Hand in den Teamspace verschieben. Sobald eine Aufnahme fertig hochgeladen ist, liegt sie darin — mit ihrer verifizierten Zeit, ihrer GPS-Position und ihrer Adresse.",
            ),
            h("Was in einem Teamspace liegt"),
            ul(
              "Die Foto- und Videosammlung, neueste Aufnahme zuerst.",
              "Projekte — die Aufträge, Standorte oder Kunden, unter denen Sie Aufnahmen gruppieren.",
              "Ihr Team: Mitglieder, ihre Rollen und welche Projekte jedes von ihnen sehen darf.",
              "Wasserzeichen-Vorlagen, damit jedes Telefon Aufnahmen gleich stempelt.",
              "Berichte und Exporte, die Sie erstellt haben, und alle Freigabelinks, die Sie herausgegeben haben.",
              "Liefertouren, falls Sie Delivery nutzen.",
            ),
            h("Wer was sieht"),
            p(
              "Inhaber, Admins und Manager sehen den gesamten Workspace. Feld-Mitglieder sehen nur die Projekte, denen sie zugewiesen sind — ihre eigenen Aufnahmen und alles andere in diesen Projekten. Das ist der wichtigste Grund, Arbeit in Projekte zu legen und nicht lose liegen zu lassen.",
            ),
            note(
              "Teamspace ist Teil des Business-Plans und darüber. Mit Free und Plus haben Sie weiterhin vollständige Aufnahme, Wasserzeichen und Verifizierung, aber der Workspace besteht nur aus Ihnen.",
            ),
            see(
              "teamspace/create-a-project",
              "teamspace/roles-and-permissions",
              "plans-billing/compare-plans",
            ),
          ],
        },
        {
          slug: "create-a-project",
          title: "Projekt erstellen",
          summary:
            "Gruppieren Sie Aufnahmen nach Auftrag, Standort oder Kunde, damit Filter, Berichte und Team-Zugriff zusammenpassen.",
          keywords: [
            "projekt",
            "auftrag",
            "standort",
            "kunde",
            "ordner",
            "project",
            "job",
            "site",
            "client",
          ],
          body: [
            p(
              "Ein Projekt ist ein Behälter für Aufnahmen — meist ein Auftrag, ein Standort oder ein Kunde. Aus Projekten werden Berichte gebaut, über Projekte erhalten Feld-Mitglieder Zugriff, und Karte sowie Vorher-Nachher-Ansicht gruppieren danach.",
            ),
            h("Eines erstellen"),
            steps(
              "Öffnen Sie in der Web-App „Projekte“ und wählen Sie „Neues Projekt“.",
              "Geben Sie einen Projektnamen ein. Das ist das einzige Pflichtfeld.",
              "Ergänzen Sie optional eine Auftragsnummer, den Kunden, eine Ortsbezeichnung und eine Standortadresse.",
              "Tragen Sie Gewerk und Leistungsumfang ein, falls Ihr Team damit arbeitet.",
              "Speichern Sie. Das Projekt steht sofort in der Projektauswahl der mobilen App bereit.",
            ),
            h("Die Felder und wofür sie da sind"),
            table(
              ["Feld", "Wofür es da ist"],
              [
                [
                  "Projektname",
                  "Wie das Projekt überall erscheint. Bis zu 90 Zeichen.",
                ],
                ["Auftragsnummer", "Ihre eigene Auftrags- oder Arbeitsnummer. Durchsuchbar."],
                ["Kunde", "Für wen die Arbeit ist. Nützlich beim Export."],
                ["Ortsbezeichnung", "Ein sprechender Name für den Standort, etwa „Nordhof“."],
                [
                  "Standortadresse",
                  "Die Adresse des Standorts. Wird genutzt, um das Projekt auf der Karte zu zentrieren.",
                ],
                ["Gewerk", "Ihre eigene Einordnung, etwa „Dachdeckerei“ oder „Prüfung“."],
                ["Leistungsumfang", "Interner Kontext. Wird auf einem Freigabelink nie angezeigt."],
              ],
            ),
            h("Projektstatus"),
            p(
              "Jedes Projekt ist aktiv, pausiert, abgeschlossen oder archiviert. Der Status ändert nichts an Zugriff oder Speicherung — er ist dafür da, dass ein fertiger Auftrag die Liste nicht mehr zumüllt. Filtern Sie oben auf der Seite „Projekte“ nach Status.",
            ),
            note(
              "Ein Projekt zu erstellen erfordert mindestens die Rolle Manager. Feld-Mitglieder können in Projekte aufnehmen, denen sie zugewiesen sind, aber keine neuen anlegen.",
            ),
            warn(
              "Jeder Plan enthält eine bestimmte Anzahl Projekte. Wenn Sie das Limit erreichen, werden Sie zum Upgrade aufgefordert, anstatt ein Projekt anlegen zu können, das nicht abgedeckt wäre.",
            ),
            see("teamspace/invite-your-crew", "mobile-app/assign-capture-to-project"),
          ],
        },
        {
          slug: "browse-and-filter-photos",
          title: "Fotos durchsuchen und filtern",
          summary:
            "Reduzieren Sie tausende Aufnahmen auf die paar, die Sie brauchen — nach Projekt, Person, Tag, Datum oder Text.",
          keywords: [
            "suche",
            "filter",
            "sammlung",
            "galerie",
            "tag",
            "finden",
            "search",
            "library",
            "find",
          ],
          body: [
            p(
              "Die Fotosammlung zeigt jede Aufnahme im Workspace, die neueste zuerst. Filter stapeln sich — setzen Sie so viele, wie Sie möchten, sie wirken alle gemeinsam.",
            ),
            h("Die Filter"),
            ul(
              "Projekt — nur Aufnahmen, die diesem Projekt zugewiesen sind.",
              "Mitglied — nur Aufnahmen einer Person.",
              "Tag — general, before, after, issue, arrival, departure, pickup oder delivery.",
              "Zeitraum — Aufnahmen zwischen zwei Datumsangaben, nach Aufnahmezeit, nicht nach Uploadzeit.",
              "Suche — trifft auf die Adresse, die Notiz an der Aufnahme und den Fotocode.",
            ),
            h("Nach Fotocode suchen"),
            p(
              "Wenn ein Kunde Ihnen einen Fotocode aus einem Wasserzeichen nennt, fügen Sie ihn in das Suchfeld ein. Damit finden Sie genau diese Aufnahme, was schneller ist, als zum Datum zu scrollen.",
            ),
            h("Mit einer Auswahl arbeiten"),
            p(
              "Wählen Sie mehrere Aufnahmen aus, um sie in ein Projekt zu verschieben, sie zu taggen, einen Bericht aus nur diesen zu bauen oder sie zu löschen. Löschen erfordert mindestens Manager.",
            ),
            note(
              "Datumsfilter nutzen den Zeitpunkt, an dem das Foto aufgenommen wurde. Eine Aufnahme, die zwei Tage in der Warteschlange lag, wird immer noch auf den Tag gefiltert, an dem das Team vor Ort war.",
            ),
            see("teamspace/map-view", "teamspace/reports-and-exports", "verify/verify-a-photo"),
          ],
        },
        {
          slug: "map-view",
          title: "Kartenansicht",
          summary:
            "Sehen Sie jede Aufnahme als Pin und bestätigen Sie, dass das Team dort war, wo es die Papiere behaupten.",
          keywords: ["karte", "gps", "pins", "standort", "koordinaten", "map", "location"],
          body: [
            p(
              "Die Kartenansicht zeichnet Ihre Aufnahmen anhand ihrer aufgezeichneten GPS-Position ein. Sie beantwortet die Frage, die ein Fotoraster nicht beantworten kann: Wurde die Arbeit dort erledigt, wo sie erledigt werden sollte?",
            ),
            h("So nutzen Sie sie"),
            steps(
              "Öffnen Sie „Karte“ in der Navigation des Workspaces.",
              "Setzen Sie dieselben Filter für Projekt, Mitglied, Tag und Datum, die Sie in der Sammlung nutzen.",
              "Klicken Sie auf einen Pin, um die Aufnahme, ihre Adresse und ihre genaue Zeit zu sehen.",
              "Zoomen Sie in eine Häufung hinein, um Pins zu trennen, die nur wenige Meter auseinanderliegen.",
            ),
            h("Wenn ein Pin falsch aussieht"),
            ul(
              "In Innenräumen, im Keller oder zwischen hohen Gebäuden sinkt die GPS-Genauigkeit. Der Pin kann zig Meter daneben liegen, obwohl das Foto echt ist.",
              "Die Adresse wird aus den Koordinaten ermittelt, also erzeugt eine schlechte Position einen plausiblen, aber falschen Straßennamen.",
              "Aufnahmen, die ohne Standortberechtigung entstanden sind, haben überhaupt keinen Pin und erscheinen nicht auf der Karte.",
            ),
            note(
              "Sie können die aktuelle Kartenauswahl als KMZ-Datei exportieren und in Google Earth öffnen — genau das verlangen Versorger und kommunale Kunden häufig.",
            ),
            see("troubleshoot/gps-or-address-wrong", "teamspace/reports-and-exports"),
          ],
        },
        {
          slug: "before-after-compare",
          title: "Vorher-Nachher-Vergleich",
          summary:
            "Stellen Sie zwei Aufnahmen nebeneinander, um die Veränderung zu zeigen, für die Sie bezahlt wurden.",
          keywords: [
            "vorher",
            "nachher",
            "vergleich",
            "fortschritt",
            "before",
            "after",
            "compare",
            "progress",
          ],
          body: [
            p(
              "Die Vergleichsansicht paart zwei Aufnahmen aus demselben Projekt und zeigt sie zusammen, jede mit ihrer eigenen verifizierten Zeit und Adresse. Das ist der schnellste Weg, erledigte Arbeit zu belegen.",
            ),
            h("Einrichten"),
            steps(
              "Taggen Sie die erste Aufnahme in der App oder der Web-Sammlung als „before“.",
              "Taggen Sie die Aufnahme des Endzustands als „after“.",
              "Öffnen Sie das Projekt und wählen Sie die Ansicht „Vorher / Nachher“.",
              "Wählen Sie das gewünschte Paar, wenn mehr als eines getaggt ist.",
            ),
            h("So bekommen Sie ein sauberes Paar"),
            ul(
              "Stellen Sie sich für beide Aufnahmen etwa an dieselbe Stelle und halten Sie das Telefon auf derselben Höhe.",
              "Nehmen Sie einen festen Bezugspunkt ins Bild — eine Tür, einen Pfosten, eine Ecke — und zwar in beiden.",
              "Machen Sie die Nachher-Aufnahme aus derselben Entfernung; zoomen statt gehen verändert die Perspektive.",
            ),
            note(
              "Ein Vorher-Nachher-Layout ist eines der Berichtslayouts. Sobald das Paar getaggt ist, können Sie es also direkt in ein Kunden-PDF legen.",
            ),
            see("teamspace/reports-and-exports", "mobile-app/take-a-photo"),
          ],
        },
      ],
    },
    {
      title: "Arbeit weitergeben",
      articles: [
        {
          slug: "reports-and-exports",
          title: "Berichte und Exporte",
          summary:
            "Machen Sie aus einer gefilterten Menge Aufnahmen ein PDF, eine Excel-Tabelle, ein ZIP oder ein KMZ.",
          keywords: [
            "pdf",
            "excel",
            "xlsx",
            "zip",
            "kmz",
            "export",
            "bericht",
            "herunterladen",
            "report",
            "download",
          ],
          body: [
            p(
              "Ein Bericht ist eine Momentaufnahme einer Menge Aufnahmen in einer Datei, die Sie versenden können. Bauen Sie die Menge zuerst mit Filtern zusammen und exportieren Sie dann — was auf dem Bildschirm ist, landet in der Datei.",
            ),
            h("Bericht erstellen"),
            steps(
              "Filtern Sie die Sammlung auf die gewünschten Aufnahmen oder öffnen Sie ein Projekt.",
              "Wählen Sie „Paket erstellen“ und geben Sie dem Bericht einen Berichtstitel.",
              "Wählen Sie ein Layout: Fotoraster, Eine pro Seite, Vorher / nachher oder Karte + Protokoll.",
              "Wählen Sie ein Format: PDF, Excel, ZIP oder KMZ.",
              "Erstellen Sie den Bericht. Die Datei wird serverseitig gebaut und erscheint in Ihrer Berichtsliste zum Herunterladen — auch später erneut.",
            ),
            h("Welches Format wofür"),
            table(
              ["Format", "Nutzen Sie es für"],
              [
                [
                  "PDF",
                  "Dokumentation für Kunden. Fotos mit Wasserzeichen, gesetzt und mit Seitenzahlen.",
                ],
                [
                  "Excel",
                  "Eine Zeile pro Aufnahme mit Zeit, Koordinaten, Adresse, Tag und Notiz.",
                ],
                ["ZIP", "Die Originalbilddateien, zur Übergabe an ein anderes System."],
                ["KMZ", "Zum Öffnen der Aufnahmeorte in Google Earth oder GIS-Software."],
              ],
            ),
            h("Layouts"),
            ul(
              "Fotoraster — viele Fotos pro Seite, am besten bei großen Mengen.",
              "Eine pro Seite — eine Aufnahme pro Seite mit dem vollständigen Metadatenblock.",
              "Vorher / nachher — getaggte Paare nebeneinander.",
              "Karte + Protokoll — die Aufnahmeorte eingezeichnet, mit einem Fotoverzeichnis.",
            ),
            warn(
              "Die Exportformate hängen von Ihrem Plan ab. Der Free-Plan erzeugt ein PDF mit bis zu 20 Fotos; Excel, ZIP und KMZ beginnen mit Plus. Ist ein Format nicht abgedeckt, erfahren Sie das, bevor die Datei gebaut wird, nicht danach.",
            ),
            see("plans-billing/compare-plans", "troubleshoot/export-or-report-failed"),
          ],
        },
        {
          slug: "share-links",
          title: "Freigabelinks",
          summary:
            "Schicken Sie eine Aufnahme an jemanden ohne Konto — und nehmen Sie den Link zurück, wenn Sie fertig sind.",
          keywords: [
            "freigabe",
            "link",
            "url",
            "kunde",
            "öffentlich",
            "widerrufen",
            "ablauf",
            "share",
            "revoke",
            "expiry",
          ],
          body: [
            p(
              "Ein Freigabelink ist eine Webadresse, die eine Aufnahme zeigt — die Datei, ihre verifizierte Zeit, ihre GPS-Position und ihre Adresse — für jeden, der sie öffnet. Kein Konto, keine App, keine Anmeldung.",
            ),
            h("Link erstellen"),
            steps(
              "Öffnen Sie die Aufnahme in der Web-App.",
              "Wählen Sie „Neuer Live-Link“.",
              "Setzen Sie optional einen Ablauf: In 7 Tagen, In 30 Tagen, In 90 Tagen oder Nie.",
              "Kopieren Sie den Link und versenden Sie ihn.",
            ),
            h("Links verwalten"),
            ul(
              "Jeder Link ist im Workspace aufgeführt, mit Erstellzeitpunkt und der Anzahl der Aufrufe.",
              "Widerrufen Sie einen Link jederzeit. Er funktioniert sofort für alle nicht mehr, die ihn haben.",
              "Wenn Sie eine Aufnahme freigeben wollen, für die es schon einen aktiven Link gibt, erhalten Sie den bestehenden Link statt eines zweiten.",
            ),
            h("Was ein Freigabelink nicht offenlegt"),
            ul(
              "Ihre anderen Aufnahmen, Projekte oder Teammitglieder.",
              "Interne Projektnotizen.",
              "Irgendetwas über Ihren Workspace, Ihren Plan oder Ihre Abrechnung.",
            ),
            warn(
              "Behandeln Sie einen Link als öffentlich. Jeder, an den er weitergeleitet wird, kann ihn öffnen, bis Sie ihn widerrufen oder er abläuft.",
            ),
            note(
              "Freigabelinks sind eine Funktion der bezahlten Pläne. Wenn die Freigabe nicht verfügbar ist, prüfen Sie Ihren Plan.",
            ),
            see("verify/verify-a-photo", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Ihr Team",
      articles: [
        {
          slug: "invite-your-crew",
          title: "Team einladen",
          summary:
            "Fügen Sie Personen per E-Mail oder QR-Code hinzu und setzen Sie sie vom ersten Tag an auf die richtigen Projekte.",
          keywords: [
            "einladung",
            "mitglied hinzufügen",
            "platz",
            "qr",
            "team",
            "invite",
            "seat",
            "onboard",
            "crew",
          ],
          body: [
            p(
              "Mitglieder kommen über eine Einladung dazu. Sie senden eine, sie nehmen an, und ihre Aufnahmen treffen in Ihrem Teamspace ein.",
            ),
            h("Einladung senden"),
            steps(
              "Öffnen Sie „Team“ und wählen Sie „Invite a crew member“.",
              "Geben Sie die geschäftliche E-Mail-Adresse ein.",
              "Wählen Sie eine Rolle. Feld ist die Voreinstellung und passt für die meisten im Team.",
              "Haken Sie die Projekte ab, auf die die Person schon beim ersten Anmelden Zugriff haben soll.",
              "Senden Sie. Die Person erhält eine E-Mail mit einem Link, der sie Ihrem Workspace hinzufügt.",
            ),
            h("Jemanden einladen, der neben Ihnen steht"),
            p(
              "Zu jeder offenen Einladung gehört auch ein QR-Code. Zeigen Sie ihn auf Ihrem Bildschirm, lassen Sie ihn mit der Telefonkamera scannen, und die Person landet auf der Annahmeseite, ohne dass Sie eine Adresse eintippen. Praktisch für ein Team, das mit Ihnen vor Ort ist.",
            ),
            h("Plätze"),
            p(
              "Jeder Plan enthält eine Anzahl Plätze. Eine offene Einladung belegt einen Platz, deshalb werden fünf Einladungen bei drei Plätzen abgelehnt, anstatt alle annehmen zu lassen und den Plan zu überschreiten. Wenn Ihnen die Plätze ausgehen: widerrufen Sie eine Einladung, die ohnehin nicht angenommen wird, entfernen Sie ein Mitglied, das gegangen ist, oder führen Sie ein Upgrade durch.",
            ),
            h("Wenn die Einladung nicht ankommt"),
            ul(
              "Lassen Sie im Spam nachsehen und prüfen Sie die verwendete Adresse.",
              "Prüfen Sie die Liste der offenen Einladungen — steht die Einladung dort, senden Sie sie erneut oder nutzen Sie stattdessen den QR-Code.",
              "Eine Einladung ist an die E-Mail-Adresse gebunden, an die sie gesendet wurde; die Annahme mit einer anderen Adresse funktioniert nicht.",
            ),
            note(
              "Mitglieder einzuladen und zu entfernen erfordert mindestens die Rolle Admin.",
            ),
            see("teamspace/roles-and-permissions", "troubleshoot/invite-not-working"),
          ],
        },
        {
          slug: "roles-and-permissions",
          title: "Rollen und Rechte",
          summary:
            "Inhaber, Admin, Manager und Feld — was jede Rolle darf und wem Sie welche geben.",
          keywords: [
            "rolle",
            "rechte",
            "admin",
            "manager",
            "feld",
            "zugriff",
            "inhaber",
            "role",
            "permission",
            "owner",
          ],
          body: [
            p(
              "Es gibt vier Rollen. Jedes Mitglied hat genau eine, und sie entscheidet, was die Person sieht und was sie ändern darf.",
            ),
            table(
              ["Rolle", "Darf"],
              [
                [
                  "Inhaber",
                  "Alles, einschließlich Abrechnung und Planwechsel. Einer pro Workspace, und die Rolle kann nicht entzogen werden.",
                ],
                [
                  "Admin",
                  "Mitglieder einladen und entfernen, Rollen ändern, Projekte, Vorlagen und Exporte verwalten.",
                ],
                [
                  "Manager",
                  "Projekte erstellen und bearbeiten, Aufnahmen löschen, Nachrichten an alle senden, Berichte bauen. Keine Mitgliederverwaltung.",
                ],
                [
                  "Feld",
                  "Aufnehmen und nur die zugewiesenen Projekte sehen. Kein Zugriff auf Team, Einladungen oder Abrechnung.",
                ],
              ],
            ),
            h("Was Sie wem geben"),
            ul(
              "Team an den Werkzeugen: Feld.",
              "Eine Vorarbeiterin oder ein Standortleiter, die Aufträge organisieren: Manager.",
              "Büropersonal, das Leute einarbeitet und Kundendokumentation erstellt: Admin.",
              "Lassen Sie Inhaber bei der Person, die die Rechnung zahlt.",
            ),
            h("Rolle ändern"),
            steps(
              "Öffnen Sie „Team“.",
              "Wählen Sie das Mitglied.",
              "Wählen Sie die neue Rolle. Sie wirkt, sobald die App der Person das nächste Mal mit dem Server spricht.",
            ),
            h("Jemanden entfernen"),
            p(
              "Ein Mitglied zu entfernen nimmt ihm den Zugriff. Es löscht nicht seine Arbeit: seine Fotos, Videos und der Prüfpfad dahinter bleiben im Teamspace — genau darum bewahrt man Beweise in einem Workspace auf und nicht auf einem Telefon.",
            ),
            warn(
              "Sie können den Inhaber des Workspaces nicht entfernen, und Sie können sich nicht selbst entfernen. Nur der Inhaber kann einen anderen Admin entfernen, zwei Admins können sich also nicht gegenseitig entfernen.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
        {
          slug: "messages-and-broadcasts",
          title: "Nachrichten und Ankündigungen",
          summary:
            "Schreiben Sie einem Teammitglied — oder schicken Sie eine Ankündigung an alle auf einmal.",
          keywords: [
            "nachricht",
            "chat",
            "ankündigung",
            "benachrichtigen",
            "message",
            "broadcast",
            "notify",
            "push",
          ],
          body: [
            p(
              "Nachrichten sind Einzelunterhaltungen zwischen Personen im selben Workspace. Sie kommen als Push-Benachrichtigung auf dem Telefon an, damit Sie Ihrem Team nicht durch eine private Chat-App nachlaufen müssen.",
            ),
            h("Jemandem schreiben"),
            steps(
              "Öffnen Sie „Nachrichten“.",
              "Wählen Sie die Person aus den Kontakten Ihres Workspaces.",
              "Schreiben und senden. Sie können eine aktuelle Aufnahme anhängen, damit klar ist, worum es geht.",
            ),
            h("Nachricht an alle"),
            p(
              "Eine Nachricht an alle sendet dieselbe Nachricht gleichzeitig an jeden im Workspace. Sie wird als normale Nachricht in der jeweils eigenen Unterhaltung zugestellt, sodass Antworten privat bei Ihnen ankommen und nicht zu einer Gruppendiskussion werden.",
            ),
            steps(
              "Öffnen Sie „Nachrichten“ und wählen Sie „Nachricht an alle“.",
              "Verknüpfen Sie optional ein Projekt, damit die Leute wissen, um welchen Auftrag es geht.",
              "Schreiben Sie die Nachricht und senden Sie sie. Sie sehen, an wie viele Mitglieder sie ging.",
            ),
            note(
              "Eine Nachricht an alle zu senden erfordert mindestens die Rolle Manager. Einzelnachrichten stehen jedem im Workspace offen.",
            ),
            see("mobile-app/notifications", "troubleshoot/notifications-not-arriving"),
          ],
        },
      ],
    },
    {
      title: "Standards",
      articles: [
        {
          slug: "watermark-template-library",
          title: "Bibliothek der Wasserzeichen-Vorlagen",
          summary:
            "Legen Sie den Stempel fest, den jedes Telefon im Workspace nutzt, damit Aufnahmen einheitlich zurückkommen.",
          keywords: [
            "wasserzeichen",
            "vorlage",
            "marke",
            "logo",
            "stempel",
            "standard",
            "watermark",
            "template",
            "brand",
          ],
          body: [
            p(
              "Eine Wasserzeichen-Vorlage entscheidet, was in die Ecke jeder Aufnahme eingebrannt wird: welche Felder erscheinen, wo der Block sitzt und ob Ihr Logo darauf ist. Vorlagen liegen im Workspace, nicht auf einem Gerät — was Sie hier festlegen, stempelt das ganze Team.",
            ),
            h("Vorlage erstellen"),
            steps(
              "Öffnen Sie „Wasserzeichen“ in den Einstellungen des Workspaces.",
              "Wählen Sie „Neue Vorlage“ und benennen Sie sie nach dem Einsatzzweck, nicht nach dem Kunden — „Baufortschritt“ altert besser als „Auftrag Nordlinie“.",
              "Haken Sie die Felder an, die erscheinen sollen: Datum und Zeit, Koordinaten, Adresse, Projekt, Name des Mitglieds, Fotocode, Wetter, eine eigene Zeile.",
              "Wählen Sie Ecke und Größe und laden Sie ein Logo hoch, wenn Sie eines möchten.",
              "Speichern Sie die Vorlage.",
            ),
            h("Die Standardvorlage"),
            p(
              "Eine Vorlage ist der Standard des Workspaces. Neue Mitglieder erhalten sie automatisch, und ein Telefon nutzt sie, bis jemand wechselt. Legen Sie jederzeit einen anderen Standard fest; bestehende Aufnahmen bleiben unberührt.",
            ),
            h("Aufräumen"),
            ul(
              "Eine Vorlage zu löschen ändert nichts an Aufnahmen, die schon damit gestempelt sind.",
              "Sie können nicht ohne Standard enden — eine Vorlage zum Standard zu machen setzt die alte im selben Schritt zurück.",
              "Ihr Team kann auf dem Telefon zwischen den Vorlagen des Workspaces wechseln, sie aber nicht bearbeiten.",
            ),
            warn(
              "Der Free-Plan enthält zwei Vorlagen. Bezahlte Pläne lassen Sie Ihren eigenen Satz mit Logo aufbauen.",
            ),
            see("mobile-app/watermark-templates", "mobile-app/switch-template"),
          ],
        },
      ],
    },
  ],
};
