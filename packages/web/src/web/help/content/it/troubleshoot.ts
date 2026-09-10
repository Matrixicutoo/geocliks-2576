import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const troubleshoot: Category = {
  slug: "troubleshoot",
  title: "Risoluzione dei problemi",
  summary: "Le cose che vanno storte più spesso e cosa controllare per prima.",
  icon: "Wrench",
  sections: [
    {
      title: "Acquisizione e caricamento",
      articles: [
        {
          slug: "photos-not-uploading",
          title: "Le foto non si caricano",
          summary: "Acquisizioni ferme in coda e come rimetterle in moto.",
          keywords: [
            "caricamento",
            "coda",
            "bloccato",
            "in attesa",
            "offline",
            "sincronizzazione",
            "limite",
          ],
          body: [
            p(
              "Le acquisizioni restano sul telefono finché non si caricano. Una coda è normale con un segnale scarso; una coda che non si svuota mai non lo è.",
            ),
            h("Controlla in questo ordine"),
            steps(
              "Apri l'app e guarda la coda di caricamento. Se mostra elementi in attesa, le acquisizioni sono al sicuro sul dispositivo.",
              "Trova segnale vero o Wi-Fi. Una tacca sola spesso si collega ma non riesce a spostare una foto.",
              "Porta l'app in primo piano e lasciala lì per un minuto. Alcuni telefoni sospendono i trasferimenti in background in modo aggressivo.",
              "Controlla che il telefono non sia in modalità risparmio energetico o risparmio dati, che blocca i caricamenti in background.",
              "Esci e rientra dall'account solo come ultima possibilità, e fallo quando la coda è vuota.",
            ),
            h("Se la coda si svuota ma nel Workspace non compare niente"),
            ul(
              "Controlla il filtro dei progetti nell'app web. Le acquisizioni possono essere finite in un progetto che non stai guardando.",
              "Controlla il filtro della data. Un'acquisizione messa in coda si archivia sotto il giorno in cui è stata scattata, non oggi.",
              "Conferma di stare guardando il Workspace giusto, se appartieni a più di uno.",
            ),
            h("Se hai raggiunto un limite mensile"),
            p(
              "Il piano Free copre 300 acquisizioni al mese. Oltre quel numero i caricamenti vengono rifiutati fino al cambio di mese o al passaggio a un piano senza tetto mensile.",
            ),
            warn(
              "Non eliminare l'app mentre ci sono acquisizioni in coda. Le acquisizioni caricate stanno nel tuo Workspace, ma tutto quello che è ancora in attesa sul dispositivo se ne va con l'app.",
            ),
            note(
              "L'ora di acquisizione viene registrata sul dispositivo, quindi una foto che si carica due giorni dopo porta ancora il momento in cui è scattato l'otturatore, e la verifica lo rispecchia.",
            ),
            see("mobile-app/offline-capture-and-queue", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "gps-or-address-wrong",
          title: "La posizione GPS o l'indirizzo sono sbagliati",
          summary: "Perché un segnaposto si sposta e cosa fare con il nome di via sbagliato.",
          keywords: [
            "gps",
            "posizione",
            "indirizzo",
            "precisione",
            "sbagliato",
            "deriva",
            "permesso",
          ],
          body: [
            p(
              "GeoCliks registra la posizione che il telefono riporta, poi risolve quella posizione in un indirizzo. Entrambi i passaggi possono essere imprecisi, per ragioni diverse.",
            ),
            h("Il segnaposto è nel posto sbagliato"),
            ul(
              "Al chiuso, in un seminterrato, in un garage o tra edifici alti la ricezione satellitare è scarsa e il telefono ripiega su un agganciamento più grossolano.",
              "Un telefono appena acceso non ha ancora un agganciamento. Dagli quindici secondi all'aperto prima della prima acquisizione della giornata.",
              "Ogni acquisizione registra la propria precisione. Un valore di precisione alto è il telefono che ti dice che non era sicuro: è una funzione, non un difetto.",
            ),
            h("La posizione è giusta ma l'indirizzo è sbagliato"),
            p(
              "L'indirizzo viene ricavato dalle coordinate. In una lottizzazione nuova, su una strada di campagna o in un sito grande con un unico numero civico, quello che torna è l'indirizzo conosciuto più vicino, e può essere un edificio confinante. Le coordinate restano la registrazione che fa fede.",
            ),
            h("Non c'è nessuna posizione"),
            steps(
              "Apri le impostazioni del telefono e trova GeoCliks.",
              "Imposta il permesso di posizione su «Mentre usi l'app» oppure «Sempre».",
              "Su iPhone attiva anche la posizione precisa. Senza, ottieni un'area approssimativa invece di una posizione.",
              "Acquisisci di nuovo. Alle acquisizioni precedenti non si può assegnare una posizione a posteriori.",
            ),
            h("Tappe di consegna nel posto sbagliato"),
            p(
              "La posizione di una tappa nasce dalla risoluzione dell'indirizzo digitato, non da un telefono. Correggi l'indirizzo e risolvi di nuovo, oppure metti il segnaposto a mano.",
            ),
            warn(
              "Una posizione non può essere aggiunta o modificata dopo l'acquisizione. È questo che la rende una prova: se potesse essere corretta dopo, non dimostrerebbe niente.",
            ),
            see(
              "delivery-routes/geocoding-and-fixing-addresses",
              "verify/verify-results-explained",
            ),
          ],
        },
      ],
    },
    {
      title: "Accesso",
      articles: [
        {
          slug: "cant-sign-in",
          title: "Non riesci ad accedere",
          summary: "Password sbagliata, email non verificata o metodo di accesso sbagliato.",
          keywords: [
            "accesso",
            "login",
            "password",
            "reimpostazione",
            "verifica",
            "google",
            "bloccato",
          ],
          body: [
            p(
              "Procedi in quest'ordine: la causa è quasi sempre una delle prime tre.",
            ),
            h("Controlla le basi"),
            steps(
              "Conferma l'indirizzo email. Un indirizzo di lavoro e uno personale sono due account diversi.",
              "Usa lo stesso metodo con cui ti sei registrato. Un account creato con Google non ha una password da digitare.",
              "Reimposta la password dalla schermata di accesso se hai dei dubbi.",
              "Apri l'email di verifica se non hai mai confermato l'indirizzo: un account non verificato non può accedere.",
            ),
            h("Non arriva niente quando chiedi una reimpostazione"),
            ul(
              "Controlla spam e posta indesiderata.",
              "Aspetta due minuti. Richieste ripetute possono finire limitate per frequenza, che rallenta ancora di più le cose.",
              "Conferma che l'indirizzo esista: una reimpostazione per un indirizzo senza account non manda niente.",
            ),
            h("Ti viene chiesto di dimostrare che sei una persona"),
            p(
              "Tentativi ripetuti non riusciti possono far comparire una verifica. Completala e continua. Se continua a comparire, prova con una finestra normale del browser invece di una privata e disattiva le estensioni che bloccano gli script.",
            ),
            h("Accedi ma finisci nel posto sbagliato"),
            ul(
              "Se appartieni a più di un Workspace, cambia Workspace dal menu dell'account.",
              "Un membro field vede solo i progetti che gli sono assegnati, quindi un Workspace che sembra vuoto vuol dire di solito che non ci sono ancora assegnazioni ai progetti: chiedi a un admin.",
            ),
            note(
              "Essere rimosso da un Workspace non elimina il tuo account. Puoi ancora accedere; semplicemente non vedrai più quel Workspace.",
            ),
            see("troubleshoot/two-factor-issues", "getting-started/create-your-account"),
          ],
        },
        {
          slug: "two-factor-issues",
          title: "Problemi con i due fattori",
          summary: "Codici rifiutati, un telefono perso e come funzionano i codici di riserva.",
          keywords: [
            "2fa",
            "due fattori",
            "totp",
            "autenticatore",
            "codici di riserva",
            "codice rifiutato",
          ],
          body: [
            p(
              "L'autenticazione a due fattori è facoltativa e viene proposta a proprietari e admin dalla pagina del profilo. Alla squadra sul campo non viene volutamente imposta un'app di autenticazione, perché con un telefono condiviso sul furgone diventa un tormento.",
            ),
            h("Il codice viene rifiutato"),
            steps(
              "Controlla di stare leggendo la voce GeoCliks nella tua app di autenticazione, non un altro servizio.",
              "Aspetta il codice successivo. I codici cambiano ogni 30 secondi e uno che sta per scadere viene spesso rifiutato.",
              "Digita tutte e sei le cifre senza spazi.",
              "Controlla che l'orologio del telefono sia impostato automaticamente. Un orologio del dispositivo sfasato di qualche minuto genera codici che il server non accetta.",
            ),
            h("Hai perso il telefono con l'autenticatore"),
            p(
              "Usa uno dei codici di riserva che ti sono stati dati quando hai attivato i due fattori. Scegli l'opzione dei codici di riserva nella schermata del secondo passaggio e inseriscine uno. Ogni codice funziona una volta sola.",
            ),
            warn(
              "Se hai perso sia l'autenticatore sia i codici di riserva, non possiamo recuperare l'account dalla schermata di accesso. Scrivi a support@geocliks.com dall'indirizzo dell'account stesso e aspettati dei controlli d'identità: quell'attrito è il senso dei due fattori.",
            ),
            h("Disattivarla"),
            p(
              "Accedi, apri il tuo profilo e disattiva i due fattori. Ti verrà chiesta una conferma. Se sei il proprietario, valuta di lasciarla attiva: è l'account che può cambiare la fatturazione e rimuovere persone.",
            ),
            note(
              "I due fattori valgono per il tuo account in ogni punto del prodotto. Una volta attivi, sia il sito web sia l'app del telefono chiedono il secondo passaggio.",
            ),
            see("troubleshoot/cant-sign-in", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "invite-not-working",
          title: "Un invito non funziona",
          summary: "Nessuna email, un link scaduto o nessun posto libero sul piano.",
          keywords: [
            "invito",
            "posto",
            "scaduto",
            "accettare",
            "qr",
            "email",
            "invite",
          ],
          body: [
            p(
              "I problemi con gli inviti si riducono all'indirizzo, ai posti o al piano.",
            ),
            h("Non hanno mai ricevuto l'email"),
            steps(
              "Apri la squadra e controlla l'elenco degli inviti in attesa: se l'invito è lì, è stato creato.",
              "Controlla che nell'indirizzo non ci sia un errore di battitura. Un invito è legato all'indirizzo esatto a cui è stato mandato.",
              "Fai controllare lo spam.",
              "Usa invece il codice QR: apri l'invito in attesa, mostra il codice e fallo scansionare col telefono.",
            ),
            h("Hanno accettato ma non vedono niente"),
            p(
              "I membri field vedono solo i progetti a cui sono assegnati. Assegnali dalla squadra, o dal progetto stesso, e comparirà sul loro telefono in pochi istanti.",
            ),
            h("Non riesci proprio a mandare l'invito"),
            ul(
              "Nessun posto libero: anche gli inviti in attesa trattengono un posto. Revoca gli inviti vecchi, rimuovi chi è andato via, oppure sali di piano.",
              "Teamspace non incluso: gli inviti partono dal piano Business. Free e Plus sono a posto singolo.",
              "Ruolo sbagliato: per invitare serve essere admin o proprietario.",
            ),
            h("Hanno accettato con un'email diversa"),
            p(
              "Così non funziona: l'invito combacia solo con l'indirizzo a cui è stato mandato. Revocalo e mandane uno nuovo all'indirizzo che usano davvero.",
            ),
            note("Revocare un invito in attesa libera il suo posto immediatamente."),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
      ],
    },
    {
      title: "Percorsi, esportazioni e avvisi",
      articles: [
        {
          slug: "route-optimize-failed",
          title: "Un percorso non si ottimizza",
          summary: "Di solito sono indirizzi non risolti. A volte è il piano.",
          keywords: [
            "ottimizzazione",
            "percorso",
            "non riuscito",
            "coordinate",
            "geocodifica",
            "ordine",
          ],
          body: [
            p("L'ottimizzatore lavora su posizioni sulla mappa, non su indirizzi digitati."),
            h("«Nessuna tappa ha ancora le coordinate»"),
            steps(
              "Apri il percorso e scegli di risolvere gli indirizzi.",
              "Guarda le tappe che non si sono risolte.",
              "Correggi il testo dell'indirizzo, oppure metti il segnaposto a mano sulla mappa.",
              "Ottimizza di nuovo.",
            ),
            h("Ha ottimizzato, ma alcune tappe restano in fondo"),
            p(
              "Le tappe senza posizione non possono essere ordinate, quindi vengono parcheggiate in fondo all'elenco invece di essere tolte dal percorso. Risolvile o mettici il segnaposto e ottimizza di nuovo.",
            ),
            h("Hai chiesto l'ottimizzatore smart e hai ottenuto quello standard"),
            p(
              "Su un piano senza l'ottimizzatore smart, GeoCliks esegue quello standard invece di rifiutare. Ottieni comunque un percorso ordinato. La cronologia del percorso registra quale ottimizzatore è stato eseguito.",
            ),
            h("L'ordine ti sembra ancora sbagliato"),
            ul(
              "Controlla che l'indirizzo di partenza sia impostato e valuta se il rientro al deposito debba essere attivo.",
              "Controlla il tempo di servizio: un valore molto sbagliato distorce ogni stima di arrivo.",
              "Le finestre orarie sulle tappe vincolano l'ordine, e una finestra stretta prevale sul percorso più breve.",
              "Trascina le tappe a mano. La conoscenza del territorio batte un algoritmo più spesso di quanto i fornitori ammettano.",
            ),
            see(
              "delivery-routes/optimize-stop-order",
              "delivery-routes/geocoding-and-fixing-addresses",
            ),
          ],
        },
        {
          slug: "export-or-report-failed",
          title: "Un'esportazione o un report non è riuscito",
          summary:
            "Limiti del piano, selezioni troppo grandi e formati che non sono compresi.",
          keywords: [
            "esportazione",
            "report",
            "pdf",
            "excel",
            "zip",
            "kmz",
            "non riuscito",
            "download",
          ],
          body: [
            p(
              "La maggior parte delle esportazioni non riuscite è un limite del piano, non un guasto.",
            ),
            h("Il formato non è disponibile"),
            ul(
              "Il piano Free produce solo un PDF, fino a 20 foto.",
              "Excel, ZIP e KMZ partono da Plus.",
              "Te lo diciamo prima che il file venga costruito, non dopo, così niente resta generato a metà.",
            ),
            h("L'esportazione è molto grande"),
            steps(
              "Restringi la selezione con il filtro della data o del progetto.",
              "Esporta a blocchi: un mese alla volta è più facile da mandare per email oltre che da costruire.",
              "Per migliaia di originali preferisci lo ZIP al PDF. Un PDF di quelle dimensioni è comunque inutilizzabile.",
            ),
            h("Il file non si scarica mai"),
            ul(
              "I report vengono costruiti sul server e poi elencati nel tuo elenco dei report: guarda lì e riscaricalo invece di ricostruirlo.",
              "Controlla che il browser non abbia bloccato il download e guarda nella cartella dei download.",
              "Prova una volta con un browser diverso prima di segnalarlo.",
            ),
            h("Un KMZ non si apre"),
            p(
              "Il KMZ ha bisogno di Google Earth o di un software GIS. Non è un formato per documenti e non si apre in un lettore PDF o in un foglio di calcolo.",
            ),
            note(
              "Ogni report generato resta nel tuo elenco dei report, così puoi riscaricarlo più tardi senza ricostruirlo.",
            ),
            see("teamspace/reports-and-exports", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "notifications-not-arriving",
          title: "Le notifiche non arrivano",
          summary:
            "Le notifiche push sul telefono e le email che i destinatari delle consegne dovrebbero ricevere.",
          keywords: [
            "notifiche",
            "push",
            "email",
            "avvisi",
            "silenzioso",
            "destinatario",
            "tracciamento",
          ],
          body: [
            p(
              "Sono due sistemi diversi, quindi controlla quello che corrisponde a ciò che manca.",
            ),
            h("Notifiche push sul telefono"),
            steps(
              "Apri le impostazioni del telefono, trova GeoCliks e consenti le notifiche.",
              "Controlla «Non disturbare», le modalità di concentrazione e gli orari notturni.",
              "Apri l'app una volta mentre sei connesso: il dispositivo si registra per le notifiche all'accesso, quindi un telefono che non ha più aperto l'app dopo una reinstallazione non è registrato.",
              "Mandati un messaggio dall'app web per fare una prova.",
            ),
            h("Un membro della squadra non riceve niente"),
            ul(
              "Deve essere membro del Workspace e connesso su quel dispositivo.",
              "Le comunicazioni collettive vanno ai contatti del Workspace: chi è stato rimosso dal Workspace smette di riceverle.",
              "Un telefono rimasto offline per giorni riceve le notifiche in coda quando si ricollega, o non le riceve affatto se sono scadute.",
            ),
            h("I destinatari delle consegne non ricevono le email"),
            ul(
              "La tappa ha bisogno di un indirizzo email del destinatario. Senza, nessuna email è possibile.",
              "Le impostazioni di notifica del percorso stesso governano l'email di preavviso e quella di prova di consegna.",
              "Le tappe non riuscite non mandano mai un'email di prova di consegna, per scelta. Quelle le gestisce l'ufficio a mano.",
              "Ogni destinatario riceve ciascuna email una volta sola, quindi un nuovo invio non partirà due volte.",
              "L'invio delle email deve essere configurato per il tuo Workspace. Se nessun destinatario su nessun percorso ha mai ricevuto niente, è questa la cosa da controllare per prima.",
            ),
            warn(
              "Chiedi al destinatario di controllare lo spam prima di concludere che non è stato mandato niente. Le email transazionali con una foto dentro finiscono nella posta indesiderata più spesso di quanto vorresti.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "teamspace/messages-and-broadcasts",
            ),
          ],
        },
      ],
    },
  ],
};
