import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const verify: Category = {
  slug: "verify",
  title: "Verifica",
  summary:
    "Ogni acquisizione porta un codice che chiunque può controllare e un sigillo che mostra se è stata alterata.",
  icon: "ShieldCheck",
  sections: [
    {
      title: "Controllare un'acquisizione",
      articles: [
        {
          slug: "what-is-a-photo-code",
          title: "Che cos'è un codice foto?",
          summary:
            "Il codice breve stampato su ogni acquisizione e la pagina pubblica a cui porta.",
          keywords: [
            "codice",
            "codice foto",
            "verifica",
            "pubblico",
            "qr",
            "prova",
            "photo code",
          ],
          body: [
            p(
              "Ogni acquisizione riceve un codice univoco, stampato nella filigrana e riportato in ogni report ed esportazione. Si presenta così:",
            ),
            ul("GC-4K7P-92XB-1DQ4"),
            p(
              "Il codice è la maniglia di quella singola acquisizione. Chiunque lo abbia — un cliente, un assicuratore, un perito, un avvocato — può cercarlo sulla pagina pubblica di verifica senza un account, senza l'app e senza chiederti niente.",
            ),
            h("Dove compare il codice"),
            ul(
              "Impresso nella filigrana sulla foto o sul video, se il tuo modello lo include.",
              "Su ogni pagina di un report PDF.",
              "Nell'esportazione Excel, una riga per acquisizione.",
              "Come nome file di ogni immagine dentro un'esportazione ZIP.",
              "Nell'email di prova di consegna inviata al destinatario.",
            ),
            h("Perché è importante"),
            p(
              "Una foto da sola non prova niente: chiunque può scrivere un orario dentro un'immagine. Un codice che porta a una registrazione indipendente sul server del tuo fornitore, che mostra la stessa ora, le stesse coordinate e un sigillo intatto, è un altro tipo di prova. Chi controlla non deve fidarsi di te.",
            ),
            note(
              "I codici si scrivono nella forma GC-XXXX-XXXX-XXXX, ma puoi digitarli in minuscolo, con spazi, senza il prefisso, oppure incollare tutto il link di verifica. Tutte queste forme portano alla stessa acquisizione. Le acquisizioni fatte prima del cambio di nome portano invece un codice TM-: si verificano esattamente come hanno sempre fatto e i codici già stampati nei tuoi vecchi report continuano a funzionare.",
            ),
            see("verify/verify-a-photo", "verify/how-sealing-works"),
          ],
        },
        {
          slug: "verify-a-photo",
          title: "Verifica una foto",
          summary: "Come tu o il tuo cliente controllate un codice e cosa mostra la pagina.",
          keywords: [
            "verifica",
            "controllo",
            "ricerca",
            "cliente",
            "pagina pubblica",
            "scansione",
          ],
          body: [
            p(
              "La verifica è pubblica e richiede pochi secondi. Manda il codice a un cliente e potrà farlo da solo.",
            ),
            h("Controllare un codice"),
            steps(
              "Vai su geocliks.com/v e inserisci il codice, oppure apri direttamente il link.",
              "Leggi la registrazione: il Workspace proprietario dell'acquisizione, quando è stata scattata, dove, e il risultato di integrità.",
              "Confrontala con la filigrana sulla foto che hai davanti. Devono corrispondere esattamente.",
            ),
            h("Cosa mostra la pagina"),
            table(
              ["Campo", "Significato"],
              [
                ["Proprietario", "Il Workspace a cui appartiene l'acquisizione."],
                ["Acquisita", "L'ora del dispositivo quando è scattato l'otturatore."],
                [
                  "Verificata dal server",
                  "L'ora del server al suo arrivo. Non impostabile da un telefono.",
                ],
                ["Posizione", "Coordinate, precisione e l'indirizzo a cui corrispondono."],
                ["Integrità", "Se il sigillo corrisponde ancora al file e ai metadati."],
                ["Dispositivo", "Il modello e la piattaforma che hanno acquisito."],
                ["Hash del contenuto", "L'impronta dei byte dell'immagine."],
              ],
            ),
            h("Perché a volte l'immagine è nascosta"),
            p(
              "La registrazione è sempre pubblica, l'immagine no. La foto viene mostrata solo quando il tuo Workspace ha pubblicato un link di condivisione attivo che copre quell'acquisizione. È voluto: un codice che sfugge da un report non deve portarsi dietro la fotografia. Revoca il link e l'immagine torna privata, mentre la registrazione resta controllabile.",
            ),
            note(
              "Le verifiche pubbliche vengono scritte nella cronologia dell'acquisizione, quindi puoi vedere che un codice è stato controllato. Caricamenti ripetuti entro mezz'ora contano una volta sola, così un cliente che ricarica la pagina non sommerge gli eventi reali.",
            ),
            see("teamspace/share-links", "verify/verify-results-explained"),
          ],
        },
        {
          slug: "verify-results-explained",
          title: "Leggere il risultato",
          summary:
            "Verificato, non verificato, manomesso, e cosa significa un avviso di scarto dell'orologio.",
          keywords: [
            "verificato",
            "non verificato",
            "manomesso",
            "scarto",
            "orologio",
            "risultato",
            "avviso",
            "verified",
            "tampered",
            "skew",
          ],
          body: [
            p("Ogni acquisizione porta uno di tre risultati di integrità."),
            table(
              ["Risultato", "Significato"],
              [
                [
                  "Verificato",
                  "Il sigillo corrisponde al file e ai metadati. Niente è cambiato dal caricamento.",
                ],
                [
                  "Non verificato",
                  "Il sigillo non ha potuto essere confermato. Di solito è un'acquisizione fatta con una versione più vecchia dell'app o un caricamento incompleto: non è la prova di un imbroglio.",
                ],
                [
                  "Manomesso",
                  "Il sigillo non corrisponde. Il file o i suoi metadati sono stati alterati dopo il caricamento.",
                ],
              ],
            ),
            h("Fonte dell'ora e scarto dell'orologio"),
            p(
              "GeoCliks registra due orari: l'ora del dispositivo quando la foto è stata scattata e l'ora del server quando è arrivata. La differenza tra i due viene conservata.",
            ),
            ul(
              "Entro circa cinque minuti, la fonte dell'ora risulta di rete — normale e previsto.",
              "Oltre quella soglia risulta il dispositivo, e lo scarto viene mostrato sulla registrazione.",
            ),
            p(
              "Uno scarto grande non è automaticamente sospetto. Un telefono rimasto offline per due giorni carica con una differenza reale, e lo scarto la spiega. Quello che significa è che l'orologio del dispositivo e quello del server non concordano, e la registrazione lo dichiara invece di scegliere silenziosamente uno dei due.",
            ),
            h("Spiegare un risultato a un cliente"),
            ul(
              "Verificato: la registrazione è intatta, ed è a questo che serve la verifica.",
              "Non verificato: offri l'originale dal tuo Workspace, che conserva ancora tutta la sua cronologia.",
              "Manomesso: fermati e guarda dove è passato il file. Non inoltrarlo.",
            ),
            warn(
              "Modificare una foto fuori da GeoCliks — ritagliarla, comprimerla, farla passare da un'app di messaggistica — cambia i byte e rompe il sigillo. Manda l'originale dal tuo Workspace o da un report, mai una versione che è passata da qualcos'altro.",
            ),
            see("verify/how-sealing-works", "troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "how-sealing-works",
          title: "Come funziona il sigillo",
          summary:
            "Le tre cose che un dispositivo non può falsificare da solo, spiegate in parole semplici.",
          keywords: [
            "hash",
            "firma",
            "hmac",
            "sha-256",
            "sigillo",
            "manomissione",
            "sicurezza",
            "tamper",
          ],
          body: [
            p(
              "Non ti serve questo articolo per usare GeoCliks. È qui per la persona che sta dall'altra parte di una contestazione e vuole sapere perché la registrazione va creduta.",
            ),
            h("1. Due orologi, entrambi registrati"),
            p(
              "L'ora di acquisizione viene dal dispositivo. L'ora di verifica viene impressa dal server GeoCliks quando il file arriva, e nessuna impostazione del telefono può influenzarla. Entrambe vengono conservate, insieme alla differenza. Cambiare l'orologio di un telefono sposta l'ora di acquisizione e salta subito all'occhio come differenza rispetto all'ora del server.",
            ),
            h("2. Un'impronta del file"),
            p(
              "Un hash SHA-256 dei byte dell'immagine caricata viene conservato insieme alla registrazione. Cambia un solo pixel e l'hash non corrisponde più. È un'impronta, non una copia: non dice niente sul contenuto della foto.",
            ),
            h("3. Una firma su tutta la registrazione"),
            p(
              "Il codice foto, il Workspace proprietario, l'utente che ha acquisito, la posizione di archiviazione, entrambi gli orari, le coordinate e l'hash del contenuto vengono combinati in un ordine fisso e firmati con una chiave segreta custodita solo dal server. Altera uno qualsiasi di questi valori dopo, e la firma non corrisponde più: è questo che produce un risultato Manomesso.",
            ),
            h("Cosa dimostra e cosa non dimostra"),
            ul(
              "Dimostra che il file e i suoi metadati non sono cambiati da quando GeoCliks li ha ricevuti.",
              "Dimostra l'ora di arrivo indipendentemente dal dispositivo.",
              "Non dimostra che il telefono fosse puntato su qualcosa di veritiero. Nessun sistema può farlo. Quello che elimina è la possibilità di cambiare la registrazione in silenzio dopo il fatto.",
            ),
            note(
              "Il confronto della firma avviene a tempo costante, così il controllo stesso non può essere sondato per ricavare la chiave.",
            ),
            see("verify/verify-results-explained", "legal/data-ownership"),
          ],
        },
      ],
    },
  ],
};
