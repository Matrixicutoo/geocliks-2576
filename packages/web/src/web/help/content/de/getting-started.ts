import { type Category, h, note, p, see, steps, ul } from "../../types";

export const gettingStarted: Category = {
  slug: "getting-started",
  title: "Erste Schritte",
  summary: "Neu bei GeoCliks? Wählen Sie den Weg, der zu Ihnen passt.",
  icon: "Rocket",
  sections: [
    {
      title: "Grundlagen",
      articles: [
        {
          slug: "what-is-geocliks",
          title: "Was ist GeoCliks?",
          summary:
            "Feldnachweise, die Sie belegen können: Jedes Foto trägt eine verifizierte Zeit, eine GPS-Position und die Straßenadresse.",
          keywords: ["überblick", "über", "produkt", "einführung", "overview", "about"],
          body: [
            p(
              "GeoCliks ist ein Foto- und Videodokumentationswerkzeug für Feldteams. Sie halten die Arbeit mit dem Handy fest, und jede Aufnahme wird mit der Uhrzeit, dem Ort und der Straßenadresse gestempelt, zu der diese Position gehört. Der Stempel wird in das Bild eingebrannt und zusätzlich separat gespeichert, damit er später geprüft werden kann.",
            ),
            p(
              "Es geht nicht um schönere Fotos. Es geht darum, dass Sie eine Antwort haben, wenn ein Kunde, eine Versicherung oder ein Gericht fragt, ob ein Foto wirklich das zeigt, was Sie behaupten — eine Antwort, die nicht von Ihrem Wort abhängt.",
            ),
            h("Was Sie bekommen"),
            ul(
              "Fotos und Videos mit Wasserzeichen, verifizierter Zeit, GPS-Koordinaten und Adresse.",
              "Einen eindeutigen Fotocode auf jeder Aufnahme, den jeder ohne Konto prüfen kann.",
              "Teamspace: einen gemeinsamen Workspace, in dem das Büro die Aufnahmen der Teams sofort beim Hochladen sieht.",
              "Projekte, Kartenansicht, Vorher-Nachher-Vergleiche und Exporte als PDF, Excel, ZIP und KMZ mit einem Klick.",
              "Touren: den Tag eines Fahrers planen, ihn losschicken und jeden Stopp mit einem Nachweisfoto abschließen.",
            ),
            h("Wer damit arbeitet"),
            ul(
              "Bau- und Handwerksteams, die Fortschritt und Abnahme dokumentieren.",
              "Sanierungs- und Versicherungsarbeiten, bei denen der zeitliche Ablauf das ganze Argument ist.",
              "Versorger-, Telekom- und Prüfteams, die auf jedem Datensatz einen Standort brauchen.",
              "Lieferbetriebe, die belegen müssen, dass ein Paket tatsächlich angekommen ist.",
            ),
            note(
              "GeoCliks funktioniert offline. Aufnahmen werden auf dem Gerät zwischengespeichert und laden sich selbst hoch, sobald wieder Empfang besteht — mit der ursprünglichen Aufnahmezeit.",
            ),
            see("getting-started/create-your-account", "verify/what-is-a-photo-code"),
          ],
        },
        {
          slug: "create-your-account",
          title: "Konto erstellen",
          summary: "Registrieren Sie sich in der App oder im Web — dasselbe Konto gilt überall.",
          keywords: ["registrieren", "anmelden", "neues konto", "e-mail", "sign up", "register"],
          body: [
            p(
              "Ein GeoCliks-Konto funktioniert in der mobilen App, auf der Website und in der Desktop-App. Erstellen Sie es dort, wo es Ihnen passt; Sie legen kein zweites Konto an, wenn Sie sich an einer anderen Stelle registrieren.",
            ),
            h("Registrieren"),
            steps(
              "Öffnen Sie die GeoCliks-App oder gehen Sie auf geocliks.com und wählen Sie Registrieren.",
              "Geben Sie Ihren Namen, Ihre geschäftliche E-Mail-Adresse und ein Passwort ein, oder fahren Sie mit Google fort.",
              "Sehen Sie in Ihrem Postfach nach der Bestätigungs-E-Mail und öffnen Sie den Link.",
              "Wählen Sie eine Sprache. Sie können sie später im Profil ändern.",
            ),
            note(
              "Verwenden Sie Ihre geschäftliche E-Mail-Adresse, nicht die private. Wenn Sie jemand in einen Workspace einlädt, schickt er die Einladung an die Adresse, die er kennt.",
            ),
            h("Wenn die Bestätigungs-E-Mail nicht ankommt"),
            ul(
              "Warten Sie zwei Minuten und sehen Sie im Spam-Ordner nach.",
              "Prüfen Sie die eingegebene Adresse — ein fehlender Buchstabe ist die übliche Ursache.",
              "Fordern Sie über den Anmeldebildschirm einen neuen Link an.",
            ),
            see("getting-started/for-solo-user", "troubleshoot/cant-sign-in"),
          ],
        },
        {
          slug: "install-the-app",
          title: "App installieren",
          summary:
            "GeoCliks auf iPhone, iPad oder Android holen — und die Web-App am Computer nutzen.",
          keywords: [
            "herunterladen",
            "ios",
            "android",
            "installieren",
            "desktop",
            "download",
            "install",
          ],
          body: [
            p(
              "Aufgenommen wird auf dem Handy oder Tablet. Prüfen, Berichte und Tourenplanung gehen am Computer leichter, aber alles ist auf beiden verfügbar.",
            ),
            h("Mobil"),
            ul(
              "iPhone und iPad: aus dem App Store installieren.",
              "Android: über Google Play installieren.",
              "Oder öffnen Sie geocliks.com/get-app auf dem Gerät und folgen Sie dem Link für Ihre Plattform.",
            ),
            h("Computer"),
            p(
              "Gehen Sie auf geocliks.com und melden Sie sich an. Es muss nichts installiert werden — der Teamspace läuft im Browser. Eine Desktop-App gibt es ebenfalls, wenn Sie ein eigenes Fenster bevorzugen.",
            ),
            h("Berechtigungen, die die App anfragt"),
            ul(
              "Kamera — erforderlich. Ohne sie gibt es nichts aufzunehmen.",
              "Standort — erforderlich. Die GPS-Position ist die halbe Beweiskraft einer Aufnahme.",
              "Fotos — optional, nur wenn Aufnahmen zusätzlich in Ihrer Galerie gespeichert werden sollen.",
              "Mitteilungen — optional, für Uploads, Nachrichten und Tourenzuweisungen.",
            ),
            note(
              "Stellen Sie die Standortberechtigung mindestens auf „Beim Verwenden der App“. Bei „Jedes Mal fragen“ muss die App Sie vor jeder Aufnahme unterbrechen.",
            ),
            see("mobile-app/sign-in-on-mobile", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Wählen Sie Ihren Weg",
      articles: [
        {
          slug: "for-solo-user",
          title: "Wenn Sie allein arbeiten",
          summary: "Die schnellste Einrichtung für einen Ein-Personen-Betrieb.",
          keywords: [
            "einzeln",
            "einzelnutzer",
            "freiberufler",
            "eine person",
            "solo",
            "single user",
          ],
          body: [
            p(
              "Sie brauchen kein Team, um von GeoCliks zu profitieren. Ein Einzelkonto gibt Ihnen Aufnahmen mit Wasserzeichen, Projekte zur Trennung der Aufträge und Exporte, die Sie einem Kunden übergeben können.",
            ),
            h("In fünf Minuten startklar"),
            steps(
              "Installieren Sie die App und melden Sie sich an.",
              "Legen Sie Ihr erstes Projekt an — meist die Baustellenadresse oder der Kundenname.",
              "Öffnen Sie die Wasserzeichenvorlage und fügen Sie Ihr Logo hinzu, damit Exporte nach Ihnen aussehen.",
              "Machen Sie eine Testaufnahme und prüfen Sie, ob der Stempel die richtige Zeit und Adresse zeigt.",
              "Exportieren Sie sie als PDF, um zu sehen, was Ihr Kunde erhält.",
            ),
            h("Was zu tun ist, wenn die Arbeit wächst"),
            ul(
              "Halten Sie ein Projekt pro Auftrag. Das hält Berichte sauber und die Karte lesbar.",
              "Nutzen Sie Vorher-Nachher-Vergleiche zu Beginn und am Ende jedes Auftrags.",
              "Schicken Sie Kunden einen Freigabelink statt eines E-Mail-Anhangs — er bleibt aktuell.",
            ),
            note(
              "Der Free-Plan umfasst Fotos mit Wasserzeichen, 30-Sekunden-Video in den ersten drei Tagen und PDF-Export bis zu 20 Fotos. Plus hebt die Foto- und Videogrenzen für eine Person an.",
            ),
            see("teamspace/create-a-project", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "for-team-owner",
          title: "Wenn Sie das Team führen",
          summary:
            "Den Workspace anlegen, das Team einladen und festlegen, wer was darf.",
          keywords: [
            "inhaber",
            "admin",
            "einrichtung",
            "workspace",
            "manager",
            "owner",
            "workspace",
          ],
          body: [
            p(
              "Der Inhaber des Workspaces richtet den Teamspace einmal ein, und alle anderen treten bei. Machen Sie das am Computer — das geht schneller als am Handy.",
            ),
            h("Eine Reihenfolge, die funktioniert"),
            steps(
              "Legen Sie den Workspace an und geben Sie ihm Ihren Firmennamen.",
              "Bauen Sie eine Wasserzeichenvorlage mit Ihrem Logo und den Feldern, die auf jedem Foto stehen sollen.",
              "Legen Sie Ihre laufenden Projekte an, bevor Sie jemanden einladen, damit das Team weiß, wohin mit den Aufnahmen.",
              "Laden Sie das Team per E-Mail ein oder geben Sie den Beitrittslink bzw. den ausgedruckten QR-Code weiter.",
              "Legen Sie die Rolle jeder Person fest. Der Großteil des Teams sollte Feld sein.",
              "Machen Sie selbst eine Aufnahme und prüfen Sie, ob sie im richtigen Projekt landet.",
            ),
            h("Rollen"),
            ul(
              "Inhaber — volle Kontrolle einschließlich Abrechnung und Löschen des Workspaces. Es gibt genau einen.",
              "Admin — alles, was der Inhaber kann, außer Abrechnung und Eigentümerschaft.",
              "Manager — legt Projekte und Touren an, lädt Personen ein, erstellt Berichte.",
              "Feld — nimmt Fotos und Videos auf, fährt zugewiesene Touren, sieht die eigene Arbeit.",
            ),
            note(
              "Laden Sie Personen als Feld ein, sofern sie nicht Projekte anlegen oder Berichte erstellen müssen. Sie können eine Rolle jederzeit anheben; sie greift, sobald die Person die App das nächste Mal öffnet.",
            ),
            see("teamspace/invite-your-crew", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "for-crew-member",
          title: "Wenn Sie in ein Team eingeladen wurden",
          summary: "Dem Workspace beitreten und die erste Aufnahme machen.",
          keywords: ["feld", "team", "beitreten", "eingeladen", "mitglied", "field", "crew"],
          body: [
            p(
              "Jemand in Ihrem Unternehmen hat einen Workspace eingerichtet und Sie hinzugefügt. Ihre Aufgabe ist es, die Arbeit im Feld festzuhalten; um Projekte, Berichte und Abrechnung kümmert sich das Büro.",
            ),
            h("Beitreten"),
            steps(
              "Öffnen Sie die Einladungs-E-Mail oder scannen Sie den QR-Code, den Ihr Manager Ihnen gibt.",
              "Erstellen Sie Ihr Konto oder melden Sie sich an, wenn Sie schon eines haben.",
              "Installieren Sie die GeoCliks-App auf Ihrem Handy.",
              "Erlauben Sie Kamera und Standort. Beides ist zum Aufnehmen erforderlich.",
              "Öffnen Sie die Projektliste und wählen Sie den Auftrag, an dem Sie arbeiten.",
            ),
            h("Ihre erste Aufnahme"),
            steps(
              "Tippen Sie auf den Aufnahmeknopf.",
              "Prüfen Sie in der Wasserzeichenvorschau, ob Projekt und Adresse stimmen.",
              "Machen Sie das Foto. Es lädt von selbst hoch.",
              "Wenn Sie keinen Empfang haben, arbeiten Sie einfach weiter — Aufnahmen werden zwischengespeichert und später hochgeladen.",
            ),
            note(
              "Sie können Zeit und Ort einer Aufnahme nicht ändern, und Ihr Manager kann es auch nicht. Das ist der Sinn des Produkts, keine Einschränkung.",
            ),
            see("mobile-app/take-a-photo", "mobile-app/offline-capture-and-queue"),
          ],
        },
      ],
    },
  ],
};
