import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const mobileApp: Category = {
  slug: "mobile-app",
  title: "App mobile",
  summary: "Acquisisci foto e video con filigrana su iPhone, iPad o Android.",
  icon: "Smartphone",
  sections: [
    {
      title: "Acquisizione",
      articles: [
        {
          slug: "sign-in-on-mobile",
          title: "Accedi dal telefono",
          summary: "Entra nell'app e scegli il Workspace per cui stai acquisendo.",
          keywords: ["accesso", "login", "workspace", "cambio"],
          body: [
            p(
              "Accedi con la stessa email e la stessa password che usi sul sito web, oppure con Google se ti sei registrato così.",
            ),
            h("Se appartieni a più di un Workspace"),
            p(
              "Le tue acquisizioni vanno sempre nel Workspace aperto in quel momento. Controlla il nome del Workspace in cima allo schermo prima di iniziare a acquisire: una foto finita nel Workspace sbagliato va eliminata e riscattata.",
            ),
            steps(
              "Tocca il tuo avatar nell'angolo in alto.",
              "Scegli il Workspace che vuoi.",
              "L'elenco dei progetti si ricarica per quel Workspace.",
            ),
            h("Restare connesso"),
            p(
              "L'app ti mantiene connesso. Non ti disconnette quando perdi il segnale e non ha bisogno di una connessione per aprirsi. Se ti chiede la password ogni volta, il telefono sta svuotando la memoria dell'app in background: controlla le impostazioni di ottimizzazione della batteria.",
            ),
            see("troubleshoot/cant-sign-in", "mobile-app/offline-capture-and-queue"),
          ],
        },
        {
          slug: "take-a-photo",
          title: "Scatta una foto",
          summary: "L'azione centrale: acquisisci, sigilla, carica.",
          keywords: ["acquisizione", "fotocamera", "foto", "scatto"],
          body: [
            steps(
              "Apri l'app e scegli il progetto su cui stai lavorando.",
              "Tocca il pulsante di acquisizione.",
              "Aspetta che l'indicatore di posizione si stabilizzi: all'aperto basta di solito un attimo.",
              "Inquadra e scatta.",
              "Aggiungi una nota se la foto ha bisogno di una spiegazione. Le note sono ricercabili più tardi.",
            ),
            h("Cosa finisce sulla foto"),
            ul(
              "Data e ora, controllate sull'ora di rete invece che sull'orologio del telefono.",
              "Coordinate GPS.",
              "L'indirizzo a cui corrispondono quelle coordinate.",
              "Il tuo nome e il progetto, se il modello li include.",
              "Un codice foto univoco che chiunque può verificare.",
            ),
            h("Ottenere una buona posizione"),
            ul(
              "Esci all'aperto o allontanati da acciaio e cemento prima di acquisire.",
              "Dai al telefono qualche secondo dopo aver aperto l'app: il primo agganciamento è il più lento.",
              "Al chiuso e sottoterra aspettati un indirizzo approssimativo. Le coordinate vengono comunque registrate.",
            ),
            warn(
              "Non puoi cambiare l'ora, le coordinate o l'indirizzo di un'acquisizione dopo il fatto. Se una foto è sbagliata, eliminala e scattane un'altra.",
            ),
            see("mobile-app/watermark-templates", "troubleshoot/gps-or-address-wrong"),
          ],
        },
        {
          slug: "record-a-video",
          title: "Registra un video",
          summary:
            "Video verificato con lo stesso sigillo delle foto, fino alla durata prevista dal tuo piano.",
          keywords: ["video", "registrazione", "clip", "durata"],
          body: [
            p(
              "Il video funziona esattamente come l'acquisizione di foto: stessa filigrana, stessa ora e posizione verificate, stesso comportamento di caricamento. È un pulsante separato sulla schermata di acquisizione.",
            ),
            h("Durata delle clip per piano"),
            ul(
              "Free — clip di 30 secondi, disponibili per i primi tre giorni dopo la creazione del Workspace.",
              "Plus — video di durata piena per una persona.",
              "Business, Crew 10, Crew 25 — clip fino a 3 minuti su ogni posto.",
              "Piani Delivery — clip di 3 minuti incluse.",
            ),
            h("Registrare bene"),
            ul(
              "Tieni l'inquadratura su ciò che conta per tre secondi pieni. Muovere la camera in fretta rende il video inutile come prova.",
              "Racconta a voce quello che stai mostrando. L'audio fa parte della registrazione.",
              "Registra clip brevi e mirate invece di un'unica lunga ripresa: si caricano più in fretta e sono molto più facili da ritrovare.",
            ),
            note(
              "I file video sono grandi. Con una connessione a consumo, lascia caricare le clip su Wi-Fi a fine giornata invece che sulla rete mobile.",
            ),
            see("plans-billing/compare-plans", "mobile-app/photo-quality-and-storage"),
          ],
        },
        {
          slug: "offline-capture-and-queue",
          title: "Acquisire senza segnale",
          summary:
            "Lavora dove vuoi — le acquisizioni si mettono in coda sul dispositivo e si caricano al ritorno del segnale.",
          keywords: [
            "offline",
            "coda",
            "senza segnale",
            "sincronizzazione",
            "caricamento",
            "seminterrato",
          ],
          body: [
            p(
              "GeoCliks è pensato per i posti senza copertura. Tutto funziona offline tranne il caricamento. Non c'è nessuna modalità speciale da attivare.",
            ),
            h("Cosa succede offline"),
            ul(
              "Fotocamera, filigrana e GPS funzionano normalmente: il GPS non ha bisogno di una connessione dati.",
              "Ogni acquisizione viene scritta sul dispositivo con la sua ora reale di acquisizione.",
              "La schermata della coda mostra cosa è in attesa di caricamento.",
              "Appena c'è una connessione, la coda si svuota da sola in background.",
            ),
            h("L'ora di un'acquisizione offline"),
            p(
              "L'ora registrata è quella in cui hai premuto il pulsante, non quella in cui la foto si è finalmente caricata. Caricare in ritardo non indebolisce la registrazione.",
            ),
            warn(
              "Non eliminare e reinstallare l'app mentre ci sono ancora acquisizioni in coda. Tutto quello che non è ancora stato caricato va perso. Controlla prima che la coda sia vuota.",
            ),
            h("Se la coda è bloccata"),
            ul(
              "Apri l'app e lasciala in primo piano per un minuto con una buona connessione.",
              "Conferma di essere ancora connesso.",
              "Controlla che il telefono non sia in modalità risparmio dati o risparmio energetico, che blocca i trasferimenti in background.",
            ),
            see("troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "assign-capture-to-project",
          title: "Metti le acquisizioni nel progetto giusto",
          summary: "Scegli il progetto prima di scattare, oppure sposta le foto dopo.",
          keywords: ["progetto", "assegnazione", "spostare", "archiviare", "organizzare"],
          body: [
            p(
              "Ogni acquisizione appartiene a un progetto. Il progetto guida i report, la mappa e quello che vede il tuo cliente, quindi farlo bene subito risparmia riordino dopo.",
            ),
            h("Prima di acquisire"),
            steps(
              "Apri l'elenco dei progetti.",
              "Tocca il lavoro su cui sei. Resta selezionato finché non lo cambi.",
              "Acquisisci normalmente: tutto si archivia lì.",
            ),
            h("Spostare un'acquisizione dopo"),
            p(
              "I manager, gli admin e il proprietario possono spostare le acquisizioni tra progetti da Teamspace. Spostare una foto cambia solo il progetto a cui appartiene; ora, posizione, indirizzo e codice foto restano intatti, e la registrazione di verifica risulta ancora valida.",
            ),
            note(
              "Se la tua squadra continua ad archiviare nel lavoro sbagliato, la causa più comune è una selezione di progetto rimasta dal giorno prima. Chiedi di controllare il nome del progetto sulla schermata di acquisizione ogni mattina.",
            ),
            see("teamspace/create-a-project", "teamspace/browse-and-filter-photos"),
          ],
        },
      ],
    },
    {
      title: "Filigrane e impostazioni",
      articles: [
        {
          slug: "watermark-templates",
          title: "Modelli di filigrana",
          summary: "Decidi cosa compare su ogni foto e mettici il tuo logo.",
          keywords: ["filigrana", "modello", "logo", "marchio", "sigillo", "campi"],
          body: [
            p(
              "Un modello di filigrana è la disposizione del sigillo impresso nelle tue acquisizioni. Si imposta per Workspace, così le foto di ogni membro della squadra vengono coerenti.",
            ),
            h("Campi che puoi mostrare o nascondere"),
            ul(
              "Data e ora",
              "Coordinate GPS",
              "Indirizzo",
              "Nome del progetto",
              "Il nome della persona che acquisisce",
              "Una nota a testo libero o un numero di commessa",
              "Il logo della tua azienda",
            ),
            h("Modificare il modello"),
            steps(
              "In Teamspace, apri le filigrane.",
              "Scegli un modello o creane uno nuovo.",
              "Attiva i campi che vuoi e carica il tuo logo.",
              "Salva. Le nuove acquisizioni lo usano immediatamente; le foto esistenti conservano il sigillo con cui sono state scattate.",
            ),
            warn(
              "Cambiare un modello non cambia mai le foto già scattate. È voluto: un sigillo riscrivibile a posteriori non sarebbe una prova.",
            ),
            h("Quanti modelli hai"),
            ul("Free — 2 modelli.", "Plus e superiori — tutti i modelli più il tuo logo."),
            see("teamspace/watermark-template-library", "mobile-app/switch-template"),
          ],
        },
        {
          slug: "switch-template",
          title: "Cambia modello sul lavoro",
          summary: "Usa un sigillo diverso per un cliente o un tipo di lavoro.",
          keywords: ["cambio", "cambia modello", "predefinito", "per progetto"],
          body: [
            p(
              "La maggior parte delle squadre usa un solo modello per tutto. Quando te ne serve un altro — un cliente che vuole il proprio numero di commessa su ogni foto, o un'ispezione che richiede campi in più — cambialo sulla schermata di acquisizione.",
            ),
            steps(
              "Sulla schermata di acquisizione, tocca il nome del modello.",
              "Scegli il modello che vuoi.",
              "Acquisisci. La scelta resta finché non la cambi di nuovo.",
            ),
            note(
              "Il tuo Workspace ha un modello predefinito, usato ogni volta che nessuno ha scelto diversamente. I manager impostano il predefinito in Teamspace, nella sezione filigrane.",
            ),
            see("teamspace/watermark-template-library"),
          ],
        },
        {
          slug: "photo-quality-and-storage",
          title: "Qualità delle foto e spazio",
          summary:
            "Bilancia la qualità dell'immagine con la velocità di caricamento e lo spazio sul telefono.",
          keywords: [
            "qualità",
            "risoluzione",
            "spazio",
            "dimensione",
            "originale",
            "dati",
          ],
          body: [
            h("Impostazione della qualità"),
            p(
              "Qualità più alta significa prove migliori e caricamenti più lenti. Per la maggior parte del lavoro di documentazione l'impostazione standard basta: resta leggibile anche stampata in un report. Alzala quando conta il dettaglio fine, come crepe sottili o numeri di serie.",
            ),
            h("Conservare l'originale"),
            p(
              "Puoi far salvare all'app un originale senza filigrana nel rullino, accanto alla versione sigillata. Utile quando ti serve un'immagine pulita per un altro scopo. Raddoppia più o meno lo spazio che ogni acquisizione occupa sul telefono.",
            ),
            h("Liberare spazio"),
            ul(
              "Le acquisizioni che hanno finito di caricarsi possono essere rimosse dal dispositivo: restano in Teamspace.",
              "È il video che riempie un telefono. Rimuovi prima le clip già caricate.",
              "Non rimuovere mai niente che sia ancora nella coda di caricamento.",
            ),
            see("mobile-app/offline-capture-and-queue", "mobile-app/app-settings"),
          ],
        },
        {
          slug: "notifications",
          title: "Notifiche",
          summary: "Di cosa ti avvisa l'app e come farla stare più zitta.",
          keywords: ["notifiche", "push", "avvisi", "silenzia", "muto"],
          body: [
            h("Cosa manda GeoCliks"),
            ul(
              "Caricamento completato, oppure caricamento non riuscito che richiede la tua attenzione.",
              "Un messaggio diretto o una comunicazione dal tuo ufficio.",
              "Un percorso assegnato a te, e promemoria mentre ti avvicini a una tappa.",
              "Inviti e cambi di ruolo.",
            ),
            h("Ridurle"),
            steps(
              "Apri le impostazioni nell'app.",
              "Apri le notifiche.",
              "Disattiva le categorie che non ti servono.",
            ),
            note(
              "Se sei un autista, lascia attive le notifiche dei percorsi. Lo smistamento le usa per dirti quando una tappa è stata aggiunta a un giro già in corso.",
            ),
            see("troubleshoot/notifications-not-arriving"),
          ],
        },
        {
          slug: "app-settings",
          title: "Impostazioni dell'app",
          summary: "Lingua, tema, griglia, suono dell'otturatore e il resto.",
          keywords: [
            "impostazioni",
            "lingua",
            "tema",
            "modalità scura",
            "griglia",
            "suono",
          ],
          body: [
            h("Lingua"),
            p(
              "GeoCliks è disponibile in 11 lingue. La tua scelta vale solo per questo dispositivo, così in un unico Workspace ogni membro della squadra può leggere l'app nella propria lingua. Lasciala sul valore predefinito del Workspace per seguire quello che ha scelto l'ufficio.",
            ),
            h("Aspetto"),
            p(
              "Sono disponibili sia il tema chiaro sia quello scuro. Lo scuro è più riposante in un furgone di notte; il chiaro è più leggibile sotto il sole diretto.",
            ),
            h("Aiuti all'acquisizione"),
            ul(
              "Griglia — una griglia di inquadratura nel mirino. Non viene catturata nella foto.",
              "Suono dell'otturatore — disattivalo per i cantieri silenziosi. Alcuni paesi lo richiedono per legge e lì non può essere disattivato.",
              "Salva originale — conserva sul dispositivo una copia senza filigrana.",
            ),
            h("Il tuo profilo"),
            p(
              "Nome, foto e password stanno nel profilo. Il tuo nome compare sulle acquisizioni quando il modello lo include, quindi tienilo nella forma in cui la tua squadra ti riconosce.",
            ),
            see("mobile-app/photo-quality-and-storage", "teamspace/roles-and-permissions"),
          ],
        },
      ],
    },
  ],
};
