import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const mobileApp: Category = {
  slug: "mobile-app",
  title: "Mobile App",
  summary: "Fotos und Videos mit Wasserzeichen auf iPhone, iPad oder Android aufnehmen.",
  icon: "Smartphone",
  sections: [
    {
      title: "Aufnahme",
      articles: [
        {
          slug: "sign-in-on-mobile",
          title: "Auf dem Telefon anmelden",
          summary: "In die App kommen und den Workspace wählen, für den Sie aufnehmen.",
          keywords: [
            "anmelden",
            "anmeldung",
            "wechseln",
            "login",
            "sign in",
            "workspace",
            "switch",
          ],
          body: [
            p(
              "Melden Sie sich mit derselben E-Mail und demselben Passwort an, die Sie auf der Website nutzen — oder mit Google, wenn Sie sich so registriert haben.",
            ),
            h("Wenn Sie zu mehr als einem Workspace gehören"),
            p(
              "Ihre Aufnahmen gehen immer in den Workspace, der gerade geöffnet ist. Prüfen Sie den Namen des Workspace oben auf dem Bildschirm, bevor Sie anfangen — ein Foto, das im falschen Workspace landet, muss gelöscht und neu aufgenommen werden.",
            ),
            steps(
              "Tippen Sie oben in der Ecke auf Ihr Profilbild.",
              "Wählen Sie den Workspace, den Sie möchten.",
              "Die Projektliste lädt für diesen Workspace neu.",
            ),
            h("Angemeldet bleiben"),
            p(
              "Die App hält Sie angemeldet. Sie meldet Sie nicht ab, wenn Sie das Netz verlieren, und sie braucht keine Verbindung, um zu starten. Wenn Sie jedes Mal nach Ihrem Passwort gefragt werden, löscht Ihr Telefon im Hintergrund den App-Speicher — prüfen Sie die Einstellungen zur Akku-Optimierung.",
            ),
            see("troubleshoot/cant-sign-in", "mobile-app/offline-capture-and-queue"),
          ],
        },
        {
          slug: "take-a-photo",
          title: "Ein Foto aufnehmen",
          summary: "Die Kernhandlung: aufnehmen, stempeln, hochladen.",
          keywords: [
            "aufnehmen",
            "kamera",
            "foto",
            "fotografieren",
            "capture",
            "camera",
            "photo",
            "shoot",
          ],
          body: [
            steps(
              "Öffnen Sie die App und wählen Sie das Projekt, an dem Sie arbeiten.",
              "Tippen Sie auf die Aufnahme-Schaltfläche.",
              "Warten Sie, bis sich die Standortanzeige beruhigt hat — im Freien genügt dafür meist ein Moment.",
              "Bildausschnitt wählen und aufnehmen.",
              "Fügen Sie eine Notiz hinzu, wenn das Foto Erklärung braucht. Notizen sind später durchsuchbar.",
            ),
            h("Was auf dem Foto landet"),
            ul(
              "Datum und Uhrzeit, gegen die Netzwerkzeit geprüft statt gegen die Uhr des Telefons.",
              "GPS-Koordinaten.",
              "Die Straßenadresse, zu der diese Koordinaten aufgelöst werden.",
              "Ihr Name und das Projekt, wenn die Vorlage sie enthält.",
              "Ein eindeutiger Fotocode, den jeder prüfen kann.",
            ),
            h("Eine gute Position bekommen"),
            ul(
              "Treten Sie vor die Tür oder weg von Stahl und Beton, bevor Sie aufnehmen.",
              "Geben Sie dem Telefon nach dem Öffnen der App ein paar Sekunden — die erste Ortung ist die langsamste.",
              "In Gebäuden und unter der Erde ist die Adresse erfahrungsgemäß ungefähr. Die Koordinaten werden trotzdem festgehalten.",
            ),
            warn(
              "Zeit, Koordinaten und Adresse einer Aufnahme lassen sich nachträglich nicht ändern. Wenn ein Foto falsch ist, löschen Sie es und nehmen ein neues auf.",
            ),
            see("mobile-app/watermark-templates", "troubleshoot/gps-or-address-wrong"),
          ],
        },
        {
          slug: "record-a-video",
          title: "Ein Video aufnehmen",
          summary:
            "Verifiziertes Video mit demselben Stempel wie Fotos, bis zur Cliplänge Ihres Plans.",
          keywords: [
            "video",
            "aufnehmen",
            "clip",
            "filmen",
            "länge",
            "record",
            "film",
            "length",
          ],
          body: [
            p(
              "Video funktioniert genau wie die Fotoaufnahme: gleiches Wasserzeichen, gleiche verifizierte Zeit und Position, gleiches Verhalten beim Hochladen. Es ist eine eigene Schaltfläche auf dem Aufnahmebildschirm.",
            ),
            h("Cliplänge je Plan"),
            ul(
              "Free — Clips von 30 Sekunden, verfügbar in den ersten drei Tagen nach dem Erstellen des Workspace.",
              "Plus — Video in voller Länge für eine Person.",
              "Business, Crew 10, Crew 25 — Clips bis zu 3 Minuten auf jedem Platz.",
              "Delivery-Pläne — Clips von 3 Minuten inklusive.",
            ),
            h("Gut aufnehmen"),
            ul(
              "Halten Sie das Bild auf allem Wichtigen drei ganze Sekunden. Schnelles Schwenken macht Video als Nachweis unbrauchbar.",
              "Sprechen Sie mit, was Sie zeigen. Der Ton ist Teil des Datensatzes.",
              "Nehmen Sie kurze, gezielte Clips auf statt eines langen Rundgangs — sie laden schneller hoch und sind später viel leichter zu finden.",
            ),
            note(
              "Videodateien sind groß. Lassen Sie Clips bei einer Verbindung mit Datenvolumen lieber am Ende des Tages über Wi-Fi hochladen als über Mobilfunk.",
            ),
            see("plans-billing/compare-plans", "mobile-app/photo-quality-and-storage"),
          ],
        },
        {
          slug: "offline-capture-and-queue",
          title: "Aufnehmen ohne Netz",
          summary:
            "Überall arbeiten — Aufnahmen warten auf dem Gerät und laden hoch, sobald das Netz zurück ist.",
          keywords: [
            "offline",
            "warteschlange",
            "kein netz",
            "synchronisieren",
            "hochladen",
            "keller",
            "queue",
            "no signal",
            "sync",
            "upload",
            "basement",
          ],
          body: [
            p(
              "GeoCliks ist für Orte ohne Netzabdeckung gebaut. Alles funktioniert offline außer dem Hochladen. Es gibt keinen besonderen Modus, den Sie einschalten müssten.",
            ),
            h("Was offline passiert"),
            ul(
              "Kamera, Wasserzeichen und GPS funktionieren normal — GPS braucht keine Datenverbindung.",
              "Jede Aufnahme wird mit ihrer echten Aufnahmezeit auf das Gerät geschrieben.",
              "Der Bildschirm mit der Warteschlange zeigt, was auf das Hochladen wartet.",
              "Sobald eine Verbindung besteht, leert sich die Warteschlange im Hintergrund selbst.",
            ),
            h("Die Zeit einer Offline-Aufnahme"),
            p(
              "Festgehalten wird die Zeit, zu der Sie ausgelöst haben, nicht die, zu der das Foto schließlich hochgeladen wurde. Spätes Hochladen schwächt den Datensatz nicht.",
            ),
            warn(
              "Löschen Sie die App nicht und installieren Sie sie nicht neu, solange noch Aufnahmen in der Warteschlange stehen. Alles, was noch nicht hochgeladen ist, ist dann weg. Prüfen Sie zuerst, dass die Warteschlange leer ist.",
            ),
            h("Wenn die Warteschlange feststeckt"),
            ul(
              "Öffnen Sie die App und lassen Sie sie bei guter Verbindung eine Minute im Vordergrund.",
              "Vergewissern Sie sich, dass Sie noch angemeldet sind.",
              "Prüfen Sie, dass das Telefon nicht im Datensparmodus oder Energiesparmodus ist — beide blockieren Übertragungen im Hintergrund.",
            ),
            see("troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "assign-capture-to-project",
          title: "Aufnahmen ins richtige Projekt legen",
          summary: "Das Projekt vor dem Auslösen wählen — oder Fotos nachträglich verschieben.",
          keywords: [
            "projekt",
            "zuordnen",
            "verschieben",
            "einsortieren",
            "organisieren",
            "assign",
            "move",
            "file",
            "organise",
          ],
          body: [
            p(
              "Jede Aufnahme gehört zu einem Projekt. Das Projekt steuert Berichte, die Karte und das, was Ihr Kunde sieht — es gleich richtig zu machen erspart späteres Aufräumen.",
            ),
            h("Bevor Sie aufnehmen"),
            steps(
              "Öffnen Sie die Projektliste.",
              "Tippen Sie auf den Auftrag, an dem Sie sind. Er bleibt ausgewählt, bis Sie ihn wechseln.",
              "Nehmen Sie normal auf — alles sortiert sich dorthin ein.",
            ),
            h("Eine Aufnahme nachträglich verschieben"),
            p(
              "Manager, Admins und der Inhaber können Aufnahmen im Teamspace zwischen Projekten verschieben. Ein Foto zu verschieben ändert nur, zu welchem Projekt es gehört; Zeit, Position, Adresse und Fotocode bleiben unberührt, und der Verifizierungsdatensatz hält der Prüfung weiterhin stand.",
            ),
            note(
              "Wenn Ihr Team immer wieder im falschen Auftrag einsortiert, liegt das meist an einer noch ausgewählten Projektwahl vom Vortag. Bitten Sie alle, jeden Morgen den Projektnamen auf dem Aufnahmebildschirm zu prüfen.",
            ),
            see("teamspace/create-a-project", "teamspace/browse-and-filter-photos"),
          ],
        },
      ],
    },
    {
      title: "Wasserzeichen und Einstellungen",
      articles: [
        {
          slug: "watermark-templates",
          title: "Wasserzeichen-Vorlagen",
          summary: "Festlegen, was auf jedem Foto erscheint — und Ihr Logo darauf setzen.",
          keywords: [
            "wasserzeichen",
            "vorlage",
            "logo",
            "branding",
            "stempel",
            "felder",
            "watermark",
            "template",
            "stamp",
            "fields",
          ],
          body: [
            p(
              "Eine Wasserzeichen-Vorlage ist das Layout des Stempels, der in Ihre Aufnahmen eingebrannt wird. Sie wird je Workspace festgelegt, damit die Fotos aller Teammitglieder einheitlich herauskommen.",
            ),
            h("Felder, die Sie zeigen oder verbergen können"),
            ul(
              "Datum und Uhrzeit",
              "GPS-Koordinaten",
              "Straßenadresse",
              "Projektname",
              "Der Name der aufnehmenden Person",
              "Eine freie Notiz oder Auftragsnummer",
              "Ihr Firmenlogo",
            ),
            h("Die Vorlage bearbeiten"),
            steps(
              "Öffnen Sie im Teamspace „Wasserzeichen“.",
              "Wählen Sie eine Vorlage oder erstellen Sie eine neue.",
              "Schalten Sie die gewünschten Felder ein und laden Sie Ihr Logo hoch.",
              "Speichern. Neue Aufnahmen verwenden sie sofort; bestehende Fotos behalten den Stempel, mit dem sie aufgenommen wurden.",
            ),
            warn(
              "Eine Vorlage zu ändern ändert niemals schon aufgenommene Fotos. Das ist beabsichtigt — ein Stempel, der sich nachträglich umschreiben ließe, wäre kein Nachweis.",
            ),
            h("Wie viele Vorlagen Sie bekommen"),
            ul("Free — 2 Vorlagen.", "Plus und höher — alle Vorlagen plus Ihr eigenes Logo."),
            see("teamspace/watermark-template-library", "mobile-app/switch-template"),
          ],
        },
        {
          slug: "switch-template",
          title: "Vorlage im Einsatz wechseln",
          summary: "Für einen Kunden oder eine Auftragsart einen anderen Stempel nutzen.",
          keywords: [
            "wechseln",
            "vorlage ändern",
            "standard",
            "je projekt",
            "switch",
            "change template",
            "default",
            "per project",
          ],
          body: [
            p(
              "Die meisten Teams verwenden für alles eine Vorlage. Wenn Sie eine andere brauchen — ein Kunde, der seine eigene Auftragsnummer auf jedem Foto will, oder eine Prüfung, die zusätzliche Felder braucht — wechseln Sie sie auf dem Aufnahmebildschirm.",
            ),
            steps(
              "Tippen Sie auf dem Aufnahmebildschirm auf den Namen der Vorlage.",
              "Wählen Sie die Vorlage, die Sie möchten.",
              "Nehmen Sie auf. Die Wahl bleibt bestehen, bis Sie sie zurückstellen.",
            ),
            note(
              "Ihr Workspace hat eine Standardvorlage, die immer dann verwendet wird, wenn niemand etwas anderes gewählt hat. Manager legen den Standard im Teamspace unter „Wasserzeichen“ fest.",
            ),
            see("teamspace/watermark-template-library"),
          ],
        },
        {
          slug: "photo-quality-and-storage",
          title: "Fotoqualität und Speicher",
          summary: "Bildqualität gegen Upload-Geschwindigkeit und Telefonspeicher abwägen.",
          keywords: [
            "qualität",
            "auflösung",
            "speicher",
            "größe",
            "original",
            "daten",
            "quality",
            "resolution",
            "storage",
            "size",
            "data",
          ],
          body: [
            h("Qualitätseinstellung"),
            p(
              "Höhere Qualität bedeutet besseren Nachweis und langsamere Uploads. Für die meiste Dokumentationsarbeit genügt die Standardeinstellung — sie bleibt lesbar, wenn sie in einem Bericht gedruckt wird. Erhöhen Sie sie, wenn feine Details zählen, etwa Haarrisse oder Seriennummern.",
            ),
            h("Das Original behalten"),
            p(
              "Sie können die App so einstellen, dass sie neben der gestempelten Fassung ein Original ohne Wasserzeichen in Ihrer Aufnahmegalerie speichert. Nützlich, wenn Sie ein sauberes Bild für einen anderen Zweck brauchen. Das verdoppelt etwa den Speicher, den jede Aufnahme auf dem Telefon belegt.",
            ),
            h("Platz freimachen"),
            ul(
              "Aufnahmen, die fertig hochgeladen sind, können vom Gerät gelöscht werden — sie bleiben im Teamspace.",
              "Video ist das, was ein Telefon füllt. Räumen Sie zuerst hochgeladene Clips weg.",
              "Löschen Sie niemals etwas, das noch in der Upload-Warteschlange liegt.",
            ),
            see("mobile-app/offline-capture-and-queue", "mobile-app/app-settings"),
          ],
        },
        {
          slug: "notifications",
          title: "Benachrichtigungen",
          summary: "Worüber die App Bescheid gibt und wie Sie sie leiser stellen.",
          keywords: [
            "benachrichtigungen",
            "push",
            "hinweise",
            "stummschalten",
            "notifications",
            "alerts",
            "silence",
            "mute",
          ],
          body: [
            h("Was GeoCliks sendet"),
            ul(
              "Upload fertig — oder Upload fehlgeschlagen und braucht Ihre Aufmerksamkeit.",
              "Eine Direktnachricht oder eine Rundnachricht aus Ihrem Büro.",
              "Eine Ihnen zugewiesene Tour und Erinnerungen, wenn Sie sich einem Stopp nähern.",
              "Einladungen und Rollenänderungen.",
            ),
            h("Sie zurückdrehen"),
            steps(
              "Öffnen Sie „Einstellungen“ in der App.",
              "Öffnen Sie „Benachrichtigungen“.",
              "Schalten Sie die Kategorien aus, die Sie nicht brauchen.",
            ),
            note(
              "Wenn Sie Fahrer sind, lassen Sie die Benachrichtigungen zu Touren an. Die Disposition nutzt sie, um Ihnen zu sagen, wenn ein Stopp zu einer schon laufenden Fahrt hinzugefügt wurde.",
            ),
            see("troubleshoot/notifications-not-arriving"),
          ],
        },
        {
          slug: "app-settings",
          title: "App-Einstellungen",
          summary: "Sprache, Design, Gitterlinien, Auslöserton und der Rest.",
          keywords: [
            "einstellungen",
            "sprache",
            "design",
            "dunkelmodus",
            "gitterlinien",
            "ton",
            "settings",
            "language",
            "theme",
            "dark mode",
            "gridlines",
            "sound",
          ],
          body: [
            h("Sprache"),
            p(
              "GeoCliks gibt es in 11 Sprachen. Ihre Wahl gilt nur für dieses Gerät, ein Team kann die App also innerhalb eines Workspace jeweils in der eigenen Sprache lesen. Lassen Sie sie auf dem Workspace-Standard, um dem zu folgen, was das Büro gewählt hat.",
            ),
            h("Erscheinungsbild"),
            p(
              "Helles und dunkles Design stehen beide zur Verfügung. Dunkel ist nachts im Fahrzeug angenehmer für die Augen; hell ist in direkter Sonne besser lesbar.",
            ),
            h("Aufnahmehilfen"),
            ul(
              "Gitterlinien — ein Raster im Sucher zum Ausrichten. Es wird nicht mit aufs Foto genommen.",
              "Auslöserton — für leise Einsatzorte ausschalten. Manche Länder verlangen ihn gesetzlich, dort lässt er sich nicht abschalten.",
              "Original speichern — eine Kopie ohne Wasserzeichen auf dem Gerät behalten.",
            ),
            h("Ihr Profil"),
            p(
              "Ihr Name, Ihr Bild und Ihr Passwort liegen im Profil. Ihr Name erscheint auf Aufnahmen, wenn die Vorlage ihn enthält — halten Sie ihn also so, wie Ihr Team Sie erkennen würde.",
            ),
            see("mobile-app/photo-quality-and-storage", "teamspace/roles-and-permissions"),
          ],
        },
      ],
    },
  ],
};
