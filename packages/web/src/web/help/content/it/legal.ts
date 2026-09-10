import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const legal: Category = {
  slug: "legal",
  title: "Privacy e aspetti legali",
  summary:
    "Chi è il proprietario delle prove, per quanto tempo vengono conservate e cosa dicono davvero l'Informativa sulla privacy e i Termini.",
  icon: "Scale",
  sections: [
    {
      title: "I tuoi dati",
      articles: [
        {
          slug: "data-ownership",
          title: "Di chi sono le tue acquisizioni",
          summary:
            "Le tue foto e i tuoi video restano tuoi. Cosa GeoCliks può farne e cosa no.",
          keywords: [
            "proprietà",
            "diritti",
            "licenza",
            "contenuti",
            "addestramento",
            "ownership",
          ],
          body: [
            p(
              "Tutto quello che carichi è tuo: le foto, i video, i dati dei progetti, le note. GeoCliks lo conserva e dimostra che non è cambiato. Non diventa nostro per il fatto di essere stato caricato.",
            ),
            h("Cosa ci è permesso farne"),
            p(
              "I Termini danno a GeoCliks una licenza ristretta — ospitare, conservare, trasmettere, ridimensionare, indicizzare e mostrare le tue acquisizioni — e solo perché il prodotto possa funzionare per te e per le persone con cui condividi. Questo è tutto l'ambito.",
            ),
            ul(
              "Non vendiamo i tuoi contenuti.",
              "Non li usiamo per addestrare modelli di apprendimento automatico per terze parti.",
              "Non li mostriamo a nessuno con cui non li hai condivisi.",
            ),
            h("La registrazione appartiene al Workspace, non alla persona"),
            p(
              "Le acquisizioni appartengono al Workspace in cui sono state fatte, non al membro della squadra che ha premuto l'otturatore. È voluto, ed è ciò che tiene insieme la registrazione delle prove:",
            ),
            ul(
              "Rimuovere un membro conserva ogni foto che ha scattato e conserva le sue voci nella cronologia delle acquisizioni.",
              "Eliminare un progetto non elimina le sue acquisizioni.",
              "Un membro che se ne va perde l'accesso ai contenuti del Workspace, ma non se li porta via.",
            ),
            note(
              "Se sei in un Workspace che non è tuo e vuoi che qualcosa delle tue acquisizioni venga cambiato, chiedi prima al proprietario del Workspace. Per quei contenuti GeoCliks agisce secondo le istruzioni del Workspace.",
            ),
            h("Di cosa sei responsabile"),
            p(
              "Confermi di avere il diritto di scattare e caricare quello che carichi — compresi i permessi necessari da parte delle persone, dei proprietari degli immobili o dei gestori dei siti che compaiono nell'inquadratura. GeoCliks non lo verifica per te.",
            ),
            h("Cosa dimostra il sigillo e cosa no"),
            p(
              "Il codice, l'hash e la firma su ogni acquisizione rendono difficile una manomissione non rilevata e permettono a chiunque di controllare che un file non sia cambiato da quando è arrivato. Non fanno di GeoCliks un notaio, un topografo o un servizio legale, e nessun giudice, assicuratore o cliente è obbligato ad accettare la registrazione. Quella decisione resta sempre loro.",
            ),
            see("verify/how-sealing-works", "legal/data-retention", "legal/terms-summary"),
          ],
        },
        {
          slug: "data-retention",
          title: "Per quanto tempo vengono conservati i tuoi dati",
          summary:
            "Cosa sopravvive a un progetto eliminato, a un membro rimosso, a un piano disdetto e a un Workspace chiuso.",
          keywords: [
            "conservazione",
            "eliminazione",
            "elimina",
            "archiviazione",
            "disdetta",
            "chiudere l'account",
            "cancellare",
            "retention",
          ],
          body: [
            p(
              "In breve: i contenuti di un Workspace vengono conservati per tutto il tempo in cui il Workspace esiste. Quasi nient'altro li rimuove.",
            ),
            table(
              ["Cosa fai", "Cosa succede alle acquisizioni"],
              [
                [
                  "Elimini un progetto",
                  "Le acquisizioni restano. La registrazione delle prove non è legata al progetto.",
                ],
                [
                  "Rimuovi un membro",
                  "Le sue foto e le sue voci di cronologia restano nel Workspace.",
                ],
                [
                  "Elimini il tuo account",
                  "Il tuo profilo e le tue credenziali vengono rimossi. Le acquisizioni che hai fatto nel Workspace di qualcun altro restano in quel Workspace.",
                ],
                [
                  "Disdici un piano a pagamento",
                  "Niente viene eliminato. Il Workspace torna al piano gratuito e le funzioni a pagamento si fermano.",
                ],
                ["Chiudi il Workspace", "Tutto viene rimosso, e non si può annullare."],
              ],
            ),
            h("Disdire non è eliminare"),
            p(
              "Passare a un piano inferiore o disdire non distrugge mai le acquisizioni. Conservi la tua cronologia e ogni codice foto già consegnato a un cliente continua a funzionare sulla pagina pubblica di verifica. Quello che perdi sono le funzioni oltre i limiti del piano gratuito: posti aggiuntivi, link di condivisione, i formati di esportazione più ricchi.",
            ),
            h("Chiudere un Workspace definitivamente"),
            p(
              "Non c'è un pulsante di eliminazione in autonomia per un intero Workspace, ed è voluto: è troppo facile distruggere per sbaglio una registrazione di prove.",
            ),
            steps(
              "Il proprietario del Workspace scrive a support@geocliks.com dall'indirizzo dell'account proprietario.",
              "Esporta prima tutto quello che vuoi conservare — PDF, Excel, ZIP o KMZ.",
              "Confermiamo la richiesta, poi rimuoviamo il Workspace e le sue acquisizioni.",
            ),
            warn(
              "L'eliminazione di un Workspace è definitiva. Acquisizioni, progetti, report e codici foto vengono rimossi tutti, e ogni link di verifica consegnato a un cliente smette di funzionare. Esporta prima.",
            ),
            h("Backup e registri"),
            p(
              "I backup e i registri di sicurezza vengono conservati per un periodo limitato e poi ruotati, quindi un'eliminazione può richiedere un po' di tempo per propagarsi a ogni copia.",
            ),
            h("Chiedere i tuoi dati"),
            p(
              "Puoi chiederci di accedere, correggere, esportare o eliminare i tuoi dati personali. La maggior parte puoi cambiarla da te nel profilo e nelle impostazioni di fatturazione. Per tutto il resto scrivi a support@geocliks.com dall'indirizzo del tuo account.",
            ),
            see(
              "legal/data-ownership",
              "plans-billing/cancel-or-downgrade",
              "legal/privacy-summary",
            ),
          ],
        },
      ],
    },
    {
      title: "I documenti legali",
      articles: [
        {
          slug: "privacy-summary",
          title: "L'Informativa sulla privacy, in parole semplici",
          summary:
            "Cosa raccoglie GeoCliks, perché, chi altro lo vede e quali scelte hai. È un riassunto, non un sostituto.",
          keywords: [
            "privacy",
            "informativa",
            "gdpr",
            "dati personali",
            "posizione",
            "cookie",
            "diritti",
          ],
          body: [
            p(
              "Questa è una lettura in parole semplici dell'Informativa sulla privacy, così sai cosa contiene. Il documento che conta è l'informativa stessa, e si trova su geocliks.com/privacy.",
            ),
            h("Cosa viene raccolto"),
            ul(
              "Dati dell'account: nome, email, un hash della tua password (mai la password), foto del profilo, lingua, tema e il tuo segreto a due fattori se lo attivi.",
              "Dati del Workspace: nomi di Workspace e progetti, clienti, posizioni, ruoli, inviti, modelli e report.",
              "Acquisizioni: la foto o il video più il suo orario, le coordinate, l'indirizzo risolto, l'ora di acquisizione del dispositivo, il codice foto, l'hash del contenuto e la firma.",
              "Messaggi: messaggi diretti e comunicazioni collettive dentro il Workspace, comprese le immagini allegate.",
              "Dati del dispositivo: versione dell'app, piattaforma, indirizzo IP, token per le notifiche, registri degli errori ed eventi di utilizzo di base.",
              "Dati di fatturazione: il tuo piano, lo stato dell'abbonamento e gli identificativi restituiti dal gestore dei pagamenti. I numeri delle carte non arrivano mai a noi.",
            ),
            note(
              "GeoCliks non vuole numeri di documenti d'identità, informazioni sulla salute o altre categorie sensibili. Tienili fuori da nomi di progetto, note e messaggi.",
            ),
            h("Posizione e fotocamera"),
            p(
              "L'app chiede fotocamera e posizione perché un'acquisizione è una foto più il dove e il quando. Puoi rifiutare uno dei due permessi e l'app funziona comunque, ma un'acquisizione senza posizione non porta coordinate né indirizzo, che è gran parte di ciò che la rende una prova. La posizione viene letta al momento dell'acquisizione e per mettere i segnaposto sulla tua mappa. Non c'è alcun tracciamento in background.",
            ),
            h("Chi altro lo vede"),
            p(
              "I tuoi dati non vengono venduti e non vengono mai condivisi per pubblicità. Un piccolo insieme di fornitori li tratta secondo le nostre istruzioni: hosting e archiviazione cloud, il gestore dei pagamenti (e Apple per gli acquisti in-app), il fornitore email, il servizio di notifiche push e il fornitore di mappe che risolve gli indirizzi.",
            ),
            h("I link di condivisione sono davvero pubblici"),
            p(
              "I link di condivisione e le pagine di verifica funzionano per chiunque abbia il link, senza accesso. È proprio il loro scopo. Revocare un link blocca gli accessi futuri, ma non può richiamare una copia che qualcuno ha già scaricato.",
            ),
            h("I tuoi diritti"),
            p(
              "Nei limiti della legge locale puoi chiedere di accedere, correggere, esportare o eliminare i tuoi dati personali, limitare o opporti ad alcuni trattamenti e revocare il consenso. Scrivi a support@geocliks.com dall'indirizzo del tuo account. In Canada puoi anche rivolgerti all'Office of the Privacy Commissioner; nello SEE o nel Regno Unito, alla tua autorità di controllo locale.",
            ),
            h("Cookie"),
            p(
              "Solo quelli che servono al prodotto: tenerti connesso, ricordare lingua e tema e mantenere le acquisizioni in coda mentre sei offline. Nessun cookie pubblicitario o di tracciamento tra siti.",
            ),
            note(
              "L'Informativa sulla privacy e i Termini sono pubblicati solo in inglese, per scelta. Tradurre automaticamente un testo legale può cambiarne il significato.",
            ),
            see("legal/data-retention", "teamspace/share-links", "legal/terms-summary"),
          ],
        },
        {
          slug: "terms-summary",
          title: "I Termini di servizio, in parole semplici",
          summary:
            "Gli obblighi delle due parti, i limiti che GeoCliks dichiara apertamente e cosa succede se smetti di pagare.",
          keywords: [
            "termini",
            "condizioni",
            "contratto",
            "responsabilità",
            "uso consentito",
            "fatturazione",
            "posti",
            "terms",
          ],
          body: [
            p(
              "Una lettura in parole semplici dei Termini. Il documento su geocliks.com/terms è quello che vincola; questo sta qui perché niente al suo interno ti sorprenda.",
            ),
            h("Chi può usarlo"),
            p(
              "Devi avere almeno 16 anni. Se ti registri per conto di un'azienda, stai confermando di poter accettare i Termini a suo nome.",
            ),
            h("I limiti che GeoCliks dichiara apertamente"),
            p(
              "I Termini sono insolitamente diretti su ciò che il prodotto non può promettere, e vale la pena leggere quell'elenco invece di dare qualcosa per scontato:",
            ),
            ul(
              "GeoCliks non è un notaio, un topografo, un laboratorio o un servizio legale, e niente di ciò che produce è consulenza legale.",
              "Un orario verificato dalla rete significa che il nostro server ha registrato quando è arrivato il caricamento — non che l'orologio del dispositivo fosse corretto.",
              "Quando l'orologio di un dispositivo differisce dal nostro di più di pochi minuti, l'acquisizione viene invece contrassegnata come temporizzata dal dispositivo.",
              "La precisione della posizione dipende dal telefono e da ciò che lo circonda; al chiuso e tra edifici alti può essere molto imprecisa.",
              "Le acquisizioni offline vengono sigillate come verificate solo quando raggiungono i nostri server.",
              "Nessun giudice, assicuratore, cliente o autorità è obbligato ad accettare una registrazione GeoCliks.",
            ),
            h("Cosa accetti di non fare"),
            ul(
              "Usare il Servizio in modo illecito, o per molestare, sorvegliare o intimidire qualcuno.",
              "Caricare contenuti che non hai il diritto di caricare.",
              "Alterare, falsificare o rimuovere un sigillo, un hash, una firma o un codice foto, o far passare materiale alterato per una registrazione GeoCliks.",
              "Sondare, sovraccaricare o interferire con il Servizio, o aggirare i limiti di frequenza e le quote del piano.",
              "Rivendere il Servizio, o condividere un posto tra più persone.",
            ),
            warn(
              "I posti sono per persona, non per dispositivo. Un membro della squadra può accedere da un telefono, un tablet e il web — ma due persone che condividono un accesso violano i Termini e rendono inutile la cronologia delle acquisizioni, perché ogni foto viene attribuita a chi possiede il posto.",
            ),
            h("Fatturazione"),
            p(
              "I piani a pagamento si rinnovano automaticamente fino alla disdetta. Gli abbonamenti web sono fatturati dal nostro gestore dei pagamenti; gli abbonamenti acquistati dentro l'app iOS sono fatturati da Apple e seguono la procedura di rimborso di Apple. I prezzi sono al netto delle imposte. Le somme già pagate non vengono rimborsate, tranne dove la legge lo richiede.",
            ),
            p(
              "Se un pagamento non va a buon fine o disdici, il Workspace passa al piano gratuito e le funzioni a pagamento si fermano. Le tue acquisizioni restano.",
            ),
            h("Sospensione"),
            p(
              "Possiamo sospendere o terminare l'accesso per una violazione dei Termini, per un utilizzo che mette a rischio il Servizio o altri clienti, o dove la legge lo richiede. Quando è ragionevole farlo ti avvisiamo prima e ti diamo la possibilità di esportare.",
            ),
            h("Disponibilità e responsabilità"),
            p(
              "Non c'è alcuna garanzia contrattuale di disponibilità del servizio, a meno che tu non abbia firmato con noi un accordo scritto separato. Il Servizio è fornito così com'è, e la responsabilità totale per qualsiasi pretesa è limitata a quanto hai pagato nei dodici mesi precedenti al suo insorgere. Alcune giurisdizioni non consentono parti di questo, e in quei casi tali limiti si applicano solo nella misura permessa dalla legge.",
            ),
            h("Modifiche"),
            p(
              "Le modifiche sostanziali ai Termini o all'Informativa sulla privacy vengono annunciate nell'app o via email prima di entrare in vigore. Le domande su entrambi i documenti vanno a support@geocliks.com.",
            ),
            see(
              "legal/data-ownership",
              "plans-billing/seats-and-billing",
              "verify/verify-results-explained",
            ),
          ],
        },
      ],
    },
  ],
};
