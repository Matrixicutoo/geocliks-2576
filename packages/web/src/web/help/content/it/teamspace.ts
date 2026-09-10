import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const teamspace: Category = {
  slug: "teamspace",
  title: "Teamspace",
  summary:
    "Il Workspace condiviso dove arrivano le acquisizioni della squadra, e dove l'ufficio le trasforma in progetti, report e link condivisi.",
  icon: "Users",
  sections: [
    {
      title: "Il tuo Workspace",
      articles: [
        {
          slug: "teamspace-overview",
          title: "Panoramica del Teamspace",
          summary:
            "Che cos'è un Workspace, che cosa ci finisce dentro e chi può vederne quali parti.",
          keywords: ["workspace", "organizzazione", "org", "dashboard", "condiviso"],
          body: [
            p(
              "Un Teamspace è un unico Workspace condiviso per una sola azienda. Ogni foto e ogni video che la tua squadra acquisisce dal telefono viene caricato lì dentro, e chiunque abbia accesso vede la stessa libreria dall'app web, dall'app desktop o dal proprio telefono.",
            ),
            p(
              "Non devi spostare niente dentro al Teamspace a mano. Appena il caricamento di un'acquisizione è completato è già lì, con l'orario verificato, la posizione GPS e l'indirizzo allegati.",
            ),
            h("Che cosa vive dentro un Teamspace"),
            ul(
              "La libreria di foto e video, con l'acquisizione più recente in cima.",
              "I progetti — i lavori, i cantieri o i clienti sotto cui raggruppi le acquisizioni.",
              "La tua squadra: i membri, i loro ruoli e i progetti che ciascuno può vedere.",
              "I modelli di filigrana, così ogni telefono timbra le acquisizioni allo stesso modo.",
              "I report e le esportazioni che hai generato, e tutti i link di condivisione che hai distribuito.",
              "I percorsi di consegna, se usi Delivery.",
            ),
            h("Chi vede cosa"),
            p(
              "Owner, admin e manager vedono tutto il Workspace. I membri field vedono solo i progetti a cui sono assegnati — le proprie acquisizioni più tutto il resto che sta su quei progetti. È la ragione principale per organizzare il lavoro in progetti invece di lasciarlo sparso.",
            ),
            note(
              "Il Teamspace fa parte del piano Business e superiori. Con Free e Plus hai comunque acquisizione, filigrana e verifica complete, ma il Workspace sei solo tu.",
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
          title: "Crea un progetto",
          summary:
            "Raggruppa le acquisizioni per lavoro, cantiere o cliente, così filtri, report e accessi della squadra vanno tutti d'accordo.",
          keywords: ["progetto", "lavoro", "cantiere", "cliente", "cartella"],
          body: [
            p(
              "Un progetto è un contenitore di acquisizioni — di solito un lavoro, un cantiere o un cliente. I progetti sono la base su cui vengono costruiti i report, quello a cui i membri field ottengono accesso, e il criterio con cui la mappa e la vista prima/dopo raggruppano.",
            ),
            h("Crearne uno"),
            steps(
              "Nell'app web apri «Progetti» e scegli «Nuovo progetto».",
              "Dai un nome. È l'unico campo obbligatorio.",
              "Se vuoi aggiungi un codice lavoro, il nome del cliente, un'etichetta luogo e un indirizzo.",
              "Aggiungi un settore e delle note interne, se la tua squadra li usa.",
              "Salva. Il progetto è subito disponibile nel selettore progetti dell'app mobile.",
            ),
            h("I campi e a cosa servono"),
            table(
              ["Campo", "A cosa serve"],
              [
                ["Nome progetto", "Come appare il progetto ovunque. Fino a 90 caratteri."],
                ["Codice lavoro", "Il tuo numero di commessa o di ordine di lavoro. Ricercabile."],
                ["Cliente", "Per chi è il lavoro. Utile quando esporti."],
                ["Etichetta luogo", "Un nome leggibile per il cantiere, tipo «Cortile nord»."],
                ["Indirizzo del sito", "L'indirizzo del cantiere. Serve a centrare il progetto sulla mappa."],
                ["Settore", "Il tuo raggruppamento, tipo «Coperture» o «Ispezioni»."],
                ["Note sull'ambito", "Contesto interno. Non compare mai su un link di condivisione."],
              ],
            ),
            h("Stato del progetto"),
            p(
              "Ogni progetto è «attivo», «in attesa», «completato» o «archiviato». Lo stato non cambia nulla su accessi o archiviazione — serve solo a togliere dalla lista i lavori finiti. Filtra per stato in cima alla pagina Progetti.",
            ),
            note(
              "Per creare un progetto serve il ruolo manager o superiore. I membri field possono acquisire nei progetti a cui sono assegnati, ma non possono crearne di nuovi.",
            ),
            warn(
              "Ogni piano include un certo numero di progetti. Se raggiungi il limite ti verrà chiesto di passare a un piano superiore, invece di lasciarti creare un progetto che non sarebbe coperto.",
            ),
            see("teamspace/invite-your-crew", "mobile-app/assign-capture-to-project"),
          ],
        },
        {
          slug: "browse-and-filter-photos",
          title: "Sfogliare e filtrare le foto",
          summary:
            "Riduci migliaia di acquisizioni alle poche che ti servono per progetto, persona, tag, data o testo.",
          keywords: ["cerca", "filtro", "libreria", "galleria", "tag", "trova"],
          body: [
            p(
              "La libreria foto mostra ogni acquisizione del Workspace, dalla più recente. I filtri si sommano — impostane quanti vuoi e valgono tutti insieme.",
            ),
            h("I filtri"),
            ul(
              "Progetto — solo le acquisizioni assegnate a quel progetto.",
              "Membro — solo le acquisizioni fatte da una persona.",
              "Tag — general, before, after, issue, arrival, departure, pickup o delivery.",
              "Intervallo di date — le acquisizioni fatte fra due date, in base all'ora di acquisizione, non a quella di caricamento.",
              "Ricerca — cerca nell'indirizzo, nella nota dell'acquisizione e nel codice foto.",
            ),
            h("Cercare per codice foto"),
            p(
              "Se un cliente ti cita un codice foto letto su una filigrana, incollalo nel campo di ricerca. Troverà esattamente quell'acquisizione, ed è più veloce che scorrere fino alla data.",
            ),
            h("Lavorare su una selezione"),
            p(
              "Seleziona più acquisizioni per spostarle in un progetto, assegnare un tag, costruire un report solo con quelle o eliminarle. Per eliminare serve manager o superiore.",
            ),
            note(
              "I filtri per data usano l'ora in cui la foto è stata scattata. Un'acquisizione rimasta due giorni nella coda offline viene comunque filtrata sul giorno in cui la squadra era in cantiere.",
            ),
            see("teamspace/map-view", "teamspace/reports-and-exports", "verify/verify-a-photo"),
          ],
        },
        {
          slug: "map-view",
          title: "Vista mappa",
          summary:
            "Vedi ogni acquisizione come un segnaposto e conferma che la squadra era dove dicono i documenti.",
          keywords: ["mappa", "gps", "segnaposto", "posizione", "coordinate"],
          body: [
            p(
              "La vista mappa dispone le tue acquisizioni in base alla posizione GPS registrata. Risponde alla domanda a cui una griglia di foto non può rispondere: il lavoro è stato fatto dove doveva essere fatto?",
            ),
            h("Come si usa"),
            steps(
              "Apri «Mappa» dalla navigazione del Workspace.",
              "Applica gli stessi filtri di progetto, membro, tag e data che usi nella libreria.",
              "Clicca un segnaposto per vedere l'acquisizione, il suo indirizzo e l'ora esatta.",
              "Ingrandisci su un gruppo per separare i segnaposto che stanno a pochi metri l'uno dall'altro.",
            ),
            h("Quando un segnaposto sembra sbagliato"),
            ul(
              "Al chiuso, in un seminterrato o fra edifici alti la precisione GPS cala. Il segnaposto può essere spostato di decine di metri anche se la foto è autentica.",
              "L'indirizzo viene ricavato dalle coordinate, quindi una posizione imprecisa produce un nome di via plausibile ma sbagliato.",
              "Le acquisizioni fatte con il permesso di posizione negato non hanno alcun segnaposto e non compaiono sulla mappa.",
            ),
            note(
              "Puoi esportare la selezione corrente della mappa come file KMZ e aprirla in Google Earth: è spesso quello che chiedono le utility e i clienti pubblici.",
            ),
            see("troubleshoot/gps-or-address-wrong", "teamspace/reports-and-exports"),
          ],
        },
        {
          slug: "before-after-compare",
          title: "Confronto prima e dopo",
          summary:
            "Metti due acquisizioni una accanto all'altra per mostrare il cambiamento per cui sei stato pagato.",
          keywords: ["prima", "dopo", "confronto", "avanzamento", "cursore"],
          body: [
            p(
              "La vista di confronto abbina due acquisizioni dello stesso progetto e le mostra insieme, ciascuna con il proprio orario verificato e il proprio indirizzo. È il modo più rapido per dimostrare un lavoro finito.",
            ),
            h("Come si imposta"),
            steps(
              "Assegna il tag «before» alla prima acquisizione, dall'app o dalla libreria web.",
              "Assegna il tag «after» all'acquisizione dello stato finito.",
              "Apri il progetto e scegli la vista «Prima / Dopo».",
              "Scegli la coppia che vuoi, se ne è stata contrassegnata più di una.",
            ),
            h("Ottenere una coppia pulita"),
            ul(
              "Mettiti più o meno nello stesso punto e tieni il telefono alla stessa altezza per entrambi gli scatti.",
              "Inquadra un riferimento fisso — una porta, un palo, uno spigolo — in tutti e due.",
              "Fai lo scatto «dopo» dalla stessa distanza; usare lo zoom invece di spostarti cambia la prospettiva.",
            ),
            note(
              "Il prima/dopo è uno dei layout di report, quindi appena la coppia è contrassegnata puoi metterla direttamente in un PDF per il cliente.",
            ),
            see("teamspace/reports-and-exports", "mobile-app/take-a-photo"),
          ],
        },
      ],
    },
    {
      title: "Condividere il lavoro",
      articles: [
        {
          slug: "reports-and-exports",
          title: "Report ed esportazioni",
          summary:
            "Trasforma un insieme filtrato di acquisizioni in un PDF, un foglio Excel, uno ZIP o un KMZ.",
          keywords: ["pdf", "excel", "xlsx", "zip", "kmz", "esportazione", "report", "download"],
          body: [
            p(
              "Un report è una fotografia di un insieme di acquisizioni dentro un file che puoi inviare. Costruisci prima l'insieme con i filtri, poi esporta — quello che è a schermo è quello che finisce nel file.",
            ),
            h("Creare un report"),
            steps(
              "Filtra la libreria sulle acquisizioni che ti servono, oppure apri un progetto.",
              "Scegli «Crea un pacchetto» e dai un titolo al report.",
              "Scegli un layout: griglia foto, una per pagina, prima/dopo oppure mappa.",
              "Scegli un formato: PDF, Excel, ZIP o KMZ.",
              "Genera. Il file viene costruito sul server e compare nella tua lista report, pronto da scaricare anche più tardi.",
            ),
            h("Quale formato usare"),
            table(
              ["Formato", "Usalo per"],
              [
                ["PDF", "Documentazione da consegnare al cliente. Foto con filigrana, impaginate e numerate."],
                ["Excel", "Una riga per acquisizione con ora, coordinate, indirizzo, tag e nota."],
                ["ZIP", "I file immagine originali, da passare a un altro sistema."],
                ["KMZ", "Aprire le posizioni delle acquisizioni in Google Earth o in un software GIS."],
              ],
            ),
            h("I layout"),
            ul(
              "Griglia foto — molte foto per pagina, ideale per i grandi numeri.",
              "Una per pagina — un'acquisizione per pagina con il blocco completo dei metadati.",
              "Prima / dopo — le coppie contrassegnate, affiancate.",
              "Mappa + registro — le posizioni delle acquisizioni sulla mappa, con un indice delle foto.",
            ),
            warn(
              "I formati di esportazione dipendono dal tuo piano. Il piano Free produce un PDF fino a 20 foto; Excel, ZIP e KMZ partono da Plus. Se un formato non è coperto te lo diciamo prima di costruire il file, non dopo.",
            ),
            see("plans-billing/compare-plans", "troubleshoot/export-or-report-failed"),
          ],
        },
        {
          slug: "share-links",
          title: "Link di condivisione",
          summary:
            "Manda un'acquisizione a chi non ha un account, e riprenditi il link quando hai finito.",
          keywords: ["condivisione", "link", "url", "cliente", "pubblico", "revoca", "scadenza"],
          body: [
            p(
              "Un link di condivisione è un indirizzo web che mostra un'acquisizione — il file, il suo orario verificato, la posizione GPS e l'indirizzo — a chiunque lo apra. Nessun account, nessuna app, nessun accesso.",
            ),
            h("Creare un link"),
            steps(
              "Apri l'acquisizione nell'app web.",
              "Scegli «Nuovo link live».",
              "Se vuoi imposta una scadenza in giorni. Lascia «Mai» per un link che non scade.",
              "Copia il link e invialo.",
            ),
            h("Gestire i link"),
            ul(
              "Ogni link è elencato nel Workspace con la data di creazione e quante volte è stato aperto.",
              "Puoi revocare un link in qualsiasi momento con «Revoca». Smette subito di funzionare per chiunque ce l'abbia.",
              "Se chiedi di condividere un'acquisizione che ha già un link attivo, ti viene restituito quel link invece di crearne un secondo.",
            ),
            h("Che cosa un link di condivisione non mostra"),
            ul(
              "Le tue altre acquisizioni, i progetti o la squadra.",
              "Le note interne dei progetti.",
              "Qualsiasi cosa sul tuo Workspace, sul piano o sulla fatturazione.",
            ),
            warn(
              "Tratta un link come pubblico. Chiunque lo riceva inoltrato può aprirlo finché non lo revochi o non scade.",
            ),
            note(
              "I link di condivisione sono una funzione dei piani a pagamento. Se la condivisione non è disponibile, controlla il tuo piano.",
            ),
            see("verify/verify-a-photo", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "La tua squadra",
      articles: [
        {
          slug: "invite-your-crew",
          title: "Invita la tua squadra",
          summary:
            "Aggiungi persone via e-mail o codice QR, e mettile sui progetti giusti fin dal primo giorno.",
          keywords: ["invito", "aggiungi membro", "posto", "qr", "avvio", "squadra"],
          body: [
            p(
              "I membri entrano su invito. Tu ne mandi uno, loro lo accettano, e le loro acquisizioni iniziano ad arrivare nel tuo Teamspace.",
            ),
            h("Inviare un invito"),
            steps(
              "Apri «Team» e scegli «Invita un membro».",
              "Inserisci la sua e-mail di lavoro.",
              "Scegli un ruolo. Field è quello predefinito ed è giusto per la maggior parte della squadra.",
              "Spunta i progetti a cui deve già avere accesso al primo accesso.",
              "Invia. Riceve un'e-mail con un link che lo aggiunge al tuo Workspace.",
            ),
            h("Invitare qualcuno che ti sta accanto"),
            p(
              "Ogni invito in attesa ha anche un codice QR. Mostralo sullo schermo, fallo inquadrare con la fotocamera del telefono e la persona arriva sulla pagina di accettazione senza che tu debba digitare il suo indirizzo. Comodo con una squadra che è in cantiere con te.",
            ),
            h("I posti"),
            p(
              "Ogni piano include un certo numero di posti. Un invito in attesa occupa un posto, quindi cinque inviti contro tre posti vengono rifiutati invece di lasciare che accettino tutti e si sfori il piano. Se hai finito i posti, revoca un invito che non verrà accettato, rimuovi un membro che se n'è andato oppure passa a un piano superiore.",
            ),
            h("Se l'invito non arriva"),
            ul(
              "Fai controllare lo spam e verifica l'indirizzo che hai usato.",
              "Controlla la lista «Inviti in attesa» — se l'invito è lì, rimandalo o usa il codice QR.",
              "Un invito è legato all'indirizzo e-mail a cui è stato inviato; accettarlo con un altro indirizzo non funziona.",
            ),
            note("Per invitare e rimuovere membri serve il ruolo admin o superiore."),
            see("teamspace/roles-and-permissions", "troubleshoot/invite-not-working"),
          ],
        },
        {
          slug: "roles-and-permissions",
          title: "Ruoli e permessi",
          summary:
            "Owner, admin, manager e field — che cosa può fare ciascuno e a chi assegnare cosa.",
          keywords: ["ruolo", "permesso", "admin", "manager", "field", "accesso", "owner"],
          body: [
            p(
              "I ruoli sono quattro. Ogni membro ne ha esattamente uno, e decide che cosa vede e che cosa può cambiare.",
            ),
            table(
              ["Ruolo", "Cosa può fare"],
              [
                [
                  "Owner",
                  "Tutto, fatturazione e cambi di piano compresi. Uno solo per Workspace, e non gli si può togliere.",
                ],
                [
                  "Admin",
                  "Invitare e rimuovere membri, cambiare ruoli, gestire progetti, modelli ed esportazioni.",
                ],
                [
                  "Manager",
                  "Creare e modificare progetti, eliminare acquisizioni, inviare messaggi a tutta la squadra, costruire report. Nessuna gestione dei membri.",
                ],
                [
                  "Field",
                  "Acquisire, e vedere solo i progetti a cui è assegnato. Nessun accesso a team, inviti o fatturazione.",
                ],
              ],
            ),
            h("Cosa assegnare a chi"),
            ul(
              "Squadra sul campo: field.",
              "Un capocantiere o un responsabile di sito che organizza i lavori: manager.",
              "Il personale d'ufficio che inserisce le persone e cura la documentazione per il cliente: admin.",
              "Tieni owner sulla persona che paga il conto.",
            ),
            h("Cambiare un ruolo"),
            steps(
              "Apri «Team».",
              "Scegli il membro.",
              "Scegli il nuovo ruolo. Ha effetto la volta successiva che la sua app parla con il server.",
            ),
            h("Rimuovere qualcuno"),
            p(
              "Rimuovere un membro gli toglie l'accesso. Non cancella il suo lavoro: le sue foto, i suoi video e la traccia di controllo che li accompagna restano nel Teamspace, che è poi il senso di tenere le prove in un Workspace invece che su un telefono.",
            ),
            warn(
              "Non puoi rimuovere l'owner del Workspace e non puoi rimuovere te stesso. Solo l'owner può rimuovere un altro admin, quindi due admin non possono rimuoversi a vicenda.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
        {
          slug: "messages-and-broadcasts",
          title: "Messaggi e annunci",
          summary:
            "Parla con un singolo membro della squadra, o manda un annuncio a tutti in una volta.",
          keywords: ["messaggio", "chat", "annuncio", "comunicazione", "notifica", "push"],
          body: [
            p(
              "I messaggi sono conversazioni a due fra persone dello stesso Workspace. Arrivano come notifica push sul telefono, così non devi rincorrere la squadra su un'app di chat personale.",
            ),
            h("Scrivere a qualcuno"),
            steps(
              "Apri «Messaggi».",
              "Scegli la persona fra i contatti del tuo Workspace.",
              "Scrivi e invia. Puoi allegare un'acquisizione recente per far capire subito di cosa parli.",
            ),
            h("Messaggi a tutta la squadra"),
            p(
              "Un messaggio a tutta la squadra invia lo stesso testo a tutti nel Workspace in una volta sola. Viene recapitato come un normale messaggio nella conversazione di ciascuno, così le risposte tornano a te in privato invece di trasformarsi in una discussione di gruppo.",
            ),
            steps(
              "Apri «Messaggi» e scegli «Messaggio a tutta la squadra».",
              "Se vuoi collega un progetto, così si capisce di quale lavoro si tratta.",
              "Scrivi il messaggio e premi «Invia a tutti». Vedrai a quante persone è arrivato.",
            ),
            note(
              "Per inviare un messaggio a tutta la squadra serve il ruolo manager o superiore. La messaggistica a due è aperta a tutti nel Workspace.",
            ),
            see("mobile-app/notifications", "troubleshoot/notifications-not-arriving"),
          ],
        },
      ],
    },
    {
      title: "Standard",
      articles: [
        {
          slug: "watermark-template-library",
          title: "Libreria dei modelli di filigrana",
          summary:
            "Imposta il timbro che usa ogni telefono del Workspace, così le acquisizioni tornano coerenti.",
          keywords: ["filigrana", "modello", "brand", "logo", "timbro", "predefinito"],
          body: [
            p(
              "Un modello di filigrana decide che cosa viene impresso nell'angolo di ogni acquisizione: quali campi compaiono, dove sta il blocco e se c'è il tuo logo. I modelli vivono nel Workspace, non su un dispositivo, quindi quello che imposti qui è quello che timbra tutta la squadra.",
            ),
            h("Creare un modello"),
            steps(
              "Apri «Filigrane» nelle impostazioni del Workspace.",
              "Scegli di crearne uno nuovo e chiamalo in base all'uso, non al cliente — «Avanzamento cantiere» invecchia meglio di «Lavoro Northline».",
              "Spunta i campi da mostrare: data e ora, coordinate, indirizzo, progetto, nome del membro, codice foto, meteo, una riga personalizzata.",
              "Scegli l'angolo e la dimensione, e carica un logo se ne vuoi uno.",
              "Salva.",
            ),
            h("Il modello predefinito"),
            p(
              "Un modello è quello predefinito del Workspace. I nuovi membri lo ricevono in automatico, ed è quello che il telefono usa finché qualcuno non lo cambia. Puoi impostarne un altro come predefinito quando vuoi; le acquisizioni già fatte non vengono toccate.",
            ),
            h("Manutenzione"),
            ul(
              "Eliminare un modello non cambia le acquisizioni già timbrate con quel modello.",
              "Non puoi restare senza un modello predefinito — promuoverne uno declassa il precedente nello stesso passaggio.",
              "La squadra può passare da un modello all'altro fra quelli del Workspace dal telefono, ma non può modificarli.",
            ),
            warn(
              "Il piano Free include due modelli. I piani a pagamento ti lasciano costruire il tuo set con il logo.",
            ),
            see("mobile-app/watermark-templates", "mobile-app/switch-template"),
          ],
        },
      ],
    },
  ],
};
