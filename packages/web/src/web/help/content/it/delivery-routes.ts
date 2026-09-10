import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const deliveryRoutes: Category = {
  slug: "delivery-routes",
  title: "Percorsi di consegna",
  summary:
    "Pianifica la giornata di un autista, mandalo in strada e chiudi ogni tappa con una foto di prova che il destinatario può vedere.",
  icon: "Route",
  sections: [
    {
      title: "Pianificare la giornata",
      articles: [
        {
          slug: "delivery-overview",
          title: "Come funziona Delivery",
          summary:
            "La forma di una giornata di consegne in GeoCliks: costruisci un percorso, assegna un autista, chiudi ogni tappa con una prova.",
          keywords: ["consegna", "percorsi", "smistamento", "autista", "prova di consegna", "pod"],
          body: [
            p(
              "I percorsi di consegna prendono la stessa idea della foto verificata e la applicano alla giornata di un autista. In ufficio costruisci un elenco di tappe, lo consegni a un autista, e l'autista chiude ogni tappa fotografando la consegna. La foto porta con sé l'orario verificato, la posizione GPS e l'indirizzo, così una contestazione su una consegna ha una risposta.",
            ),
            h("La giornata, dall'inizio alla fine"),
            steps(
              "L'ufficio crea un percorso per una data e incolla dentro gli indirizzi del giorno.",
              "GeoCliks trasforma gli indirizzi in posizioni sulla mappa, e tu sistemi quelli che non è riuscito a collocare.",
              "Ordini le tappe, a mano oppure con l'ottimizzatore.",
              "Assegni il percorso a un autista, che se lo ritrova sul telefono.",
              "L'autista scorre l'elenco fotografando ogni consegna.",
              "I destinatari con un indirizzo e-mail ricevono un messaggio con la prova di consegna e la foto.",
              "L'ufficio guarda il percorso chiudersi in tempo reale e conserva la traccia di controllo.",
            ),
            h("Due tipi di percorso"),
            table(
              ["Modalità", "Usala quando"],
              [
                [
                  "Pianificata",
                  "Conosci tutta la giornata in anticipo. La costruisci, la ottimizzi, la mandi in strada.",
                ],
                [
                  "Smistamento",
                  "Gli ordini arrivano durante il turno e vanno inseriti fra le tappe che restano all'autista.",
                ],
              ],
            ),
            h("Ogni tappa finisce in uno di quattro stati"),
            ul(
              "Consegnata — chiusa con una foto di prova.",
              "Non riuscita — l'autista non è riuscito a consegnare, con un motivo e una foto.",
              "Saltata — qui non c'era niente da consegnare. È l'unica chiusura senza foto.",
              "In attesa — non ancora raggiunta.",
            ),
            note(
              "Delivery è una funzione separata dall'acquisizione di prove. Il numero di tappe di consegna al mese arriva dal tuo piano, e i piani Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 e Fleet 500 esistono per le attività che sono soprattutto guida.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "create-a-route",
          title: "Crea un percorso",
          summary:
            "Imposta la data, il deposito, l'ora di partenza e quanto dura di solito una tappa.",
          keywords: [
            "nuovo percorso",
            "crea",
            "deposito",
            "ora di partenza",
            "tempo di sosta",
            "firma",
          ],
          body: [
            p(
              "Un percorso è il lavoro di un autista per una data. Prima lo crei, poi lo riempi di tappe.",
            ),
            h("Crearlo"),
            steps(
              "Apri «Percorsi» e scegli di crearne uno nuovo.",
              "Dagli un nome che uno smistatore riconosca in una mattina affollata — «Martedì zona nord» è meglio di «Percorso 4».",
              "Imposta la data.",
              "Scegli la modalità pianificata o smistamento.",
              "Se vuoi collegalo a un progetto, così le foto di consegna finiscono insieme alle prove di quel lavoro.",
              "Inserisci l'indirizzo di partenza — di solito il tuo deposito o il tuo piazzale.",
              "Salva.",
            ),
            h("Le impostazioni che danno forma al piano"),
            table(
              ["Impostazione", "A cosa serve"],
              [
                [
                  "Indirizzo di partenza",
                  "Dove comincia la giornata. L'ottimizzatore pianifica partendo da qui.",
                ],
                ["Ritorno al punto di partenza", "Include nel piano il rientro al deposito."],
                ["Ora di partenza", "Quando l'autista parte. Di base sono le 08:00."],
                [
                  "Tempo di sosta",
                  "Minuti passati a una tappa media. Di base 5. Determina le stime di arrivo.",
                ],
                ["Richiedi firma", "Chiede all'autista una firma oltre alla foto."],
              ],
            ),
            h("Vale la pena azzeccare il tempo di sosta"),
            p(
              "Il tempo di sosta è il modo in cui viene calcolato l'arrivo stimato di tutte le tappe successive. Cinque minuti vanno bene per un pacco davanti a una porta. Una tappa che significa scaricare bancali è più vicina a venti, e puoi forzare il tempo di sosta sulle singole tappe che sai essere lente.",
            ),
            note(
              "Per creare un percorso serve il ruolo manager o superiore. Gli autisti non costruiscono i propri percorsi.",
            ),
            warn(
              "La modalità smistamento richiede Delivery Pro o superiore. Se il tuo piano copre solo i percorsi pianificati, te lo diciamo quando scegli la modalità, non dopo che hai costruito la giornata.",
            ),
            see("delivery-routes/add-stops-by-pasting-a-list", "delivery-routes/live-dispatch"),
          ],
        },
        {
          slug: "add-stops-by-pasting-a-list",
          title: "Aggiungere tappe incollando un elenco o caricando un CSV",
          summary:
            "Incolla una colonna di foglio di calcolo, un'e-mail del cliente, oppure carica un CSV — GeoCliks legge le colonne in entrambi i casi.",
          keywords: [
            "tappe",
            "incolla",
            "importa",
            "carica",
            "file",
            "foglio di calcolo",
            "csv",
            "in blocco",
            "indirizzi",
          ],
          body: [
            p(
              "Le tappe entrano in due modi: incolli gli indirizzi, oppure carichi un file CSV. Finiscono entrambi nella stessa casella e passano dallo stesso lettore, quindi tutto quello che segue vale per entrambi. Non devi riformattare l'elenco prima.",
            ),
            h("Incollare un elenco"),
            steps(
              "Apri il percorso e trova la casella per aggiungere le tappe.",
              "Incolla il blocco. Una tappa per riga.",
              "Leggi il riepilogo sopra la casella: quante tappe ha trovato, quale separatore ha usato, quali colonne ha riconosciuto e quante righe ha scartato.",
              "Sistema alla fonte quello che non torna e incolla di nuovo, oppure aggiungi le tappe e correggile una a una.",
              "Scegli di aggiungere le tappe.",
            ),
            h("Caricare un CSV"),
            steps(
              "Esporta l'elenco dal tuo foglio di calcolo o dal gestionale in formato CSV.",
              "Apri il percorso e trova la casella per aggiungere le tappe.",
              "Scegli di caricare un CSV e seleziona il file.",
              "Il contenuto del file finisce nella casella, dove puoi leggere il riepilogo e correggere qualsiasi riga prima che venga creato qualcosa.",
              "Scegli di aggiungere le tappe.",
            ),
            note(
              "Il caricamento da solo non crea le tappe — riempie la casella. Niente viene aggiunto al percorso finché non scegli di aggiungere le tappe, quindi un file sbagliato non ti costa nulla. I file devono essere CSV o testo semplice e sotto 1 MB.",
            ),
            h("Che cosa capisce il lettore"),
            ul(
              "Separazione con tabulazioni, virgole o punti e virgola. Capisce da solo quale hai usato.",
              "Campi fra virgolette, così un indirizzo con una virgola dentro le virgolette resta un indirizzo solo.",
              "Una riga di intestazione, se c'è. In quel caso le colonne vengono riconosciute per nome, in qualsiasi ordine.",
              "Nomi di colonna in italiano, inglese, francese, portoghese o tedesco — indirizzo/via/città/CAP/address/adresse, nome/destinatario/cliente/name, e-mail/email, telefono/cellulare/phone, riferimento/ordine/reference, note/osservazioni/notes. Gli accenti sono facoltativi, quindi anche citta e numero funzionano.",
              "Indirizzo spezzato su più colonne del foglio — via, città, provincia, CAP — ricucito in una riga sola.",
              "Indirizzi e-mail e numeri di telefono riconosciuti dalla loro forma, anche senza riga di intestazione.",
            ),
            h("I campi di ogni tappa"),
            table(
              ["Campo", "Perché conta"],
              [
                ["Indirizzo", "Obbligatorio. Tutto il resto è facoltativo."],
                [
                  "Nome del destinatario",
                  "Mostrato all'autista e usato nell'e-mail di prova di consegna.",
                ],
                [
                  "E-mail del destinatario",
                  "Senza, quel destinatario non riceve né tracciamento né prova di consegna.",
                ],
                ["Telefono del destinatario", "Perché l'autista possa chiamare prima di arrivare."],
                ["Riferimento", "Il tuo numero d'ordine, di fattura o di tracciamento. Ricercabile."],
                ["Note", "Codici del cancello, numero del citofono, dove lasciare il pacco."],
                ["Finestra oraria", "Arrivo più presto e più tardi accettabile."],
                [
                  "Tempo di sosta",
                  "Forza il valore predefinito del percorso su una tappa che sai essere lenta.",
                ],
              ],
            ),
            h("Perché un CAP non viene mai scambiato per un nome"),
            p(
              "Un elenco canadese incollato come «12 Main St, Moncton NB, E1A 4H2» produceva un destinatario di nome E1A 4H2. Adesso il lettore riconosce le parole delle vie, le sigle delle province e la forma dei codici postali e degli ZIP, e prende l'ultimo campo come nome di persona solo quando sembra davvero un nome.",
            ),
            note(
              "Puoi aggiungere fino a 300 tappe con un solo incolla. Per una giornata più grande incollala in più volte — si accodano allo stesso percorso.",
            ),
            warn(
              "Ogni tappa conta sul tuo limite mensile di consegne. Se un incolla ti porterebbe oltre il tetto del piano viene rifiutato per intero, così non ti ritrovi mai con mezzo percorso.",
            ),
            see(
              "delivery-routes/geocoding-and-fixing-addresses",
              "plans-billing/delivery-plans",
            ),
          ],
        },
        {
          slug: "geocoding-and-fixing-addresses",
          title: "Risolvere gli indirizzi e sistemare quelli sbagliati",
          summary:
            "Trasforma gli indirizzi scritti in posizioni sulla mappa, e piazza un segnaposto a mano quando uno non si trova.",
          keywords: [
            "geocodifica",
            "indirizzo",
            "segnaposto",
            "coordinate",
            "non riuscito",
            "risolvi",
            "mappa",
          ],
          body: [
            p(
              "Un indirizzo incollato è solo testo. Prima che un percorso possa essere ordinato o cronometrato, ogni tappa ha bisogno di una posizione sulla mappa. Questo passaggio si chiama risoluzione, e lo lanci dal percorso.",
            ),
            h("Risolvere le tappe"),
            steps(
              "Apri il percorso.",
              "Scegli di risolvere gli indirizzi. Vengono elaborate solo le tappe non ancora risolte.",
              "Leggi il risultato: quante sono state collocate e quante non ci sono riuscite.",
              "Sistema le mancate prima di ottimizzare.",
            ),
            h("Ogni tappa ha uno stato di risoluzione"),
            table(
              ["Stato", "Significato"],
              [
                ["In attesa", "Non ancora cercato."],
                ["OK", "Collocata sulla mappa, con un indirizzo ripulito."],
                ["Non riuscita", "Non è stato possibile trovarla. Serve il tuo aiuto."],
                [
                  "Manuale",
                  "Hai piazzato tu il segnaposto. Non viene mai sovrascritto da una nuova risoluzione.",
                ],
              ],
            ),
            h("Sistemare una tappa non riuscita"),
            ul(
              "Correggi l'indirizzo e risolvi di nuovo — di solito manca la città o la provincia.",
              "Oppure apri la mappa e piazza tu il segnaposto nel punto giusto. La tappa diventa «Manuale» ed è considerata collocata.",
              "Un segnaposto manuale è la risposta giusta per una lottizzazione nuova, una proprietà di campagna o un sito senza indirizzo civico.",
            ),
            h("Risolvere di nuovo"),
            p(
              "Una risoluzione forzata ricerca tutte le tappe da capo, comprese quelle già segnate OK. Lascia deliberatamente stare i segnaposto manuali, perché un punto piazzato a mano è un'informazione migliore di qualsiasi cosa restituisca una ricerca.",
            ),
            note(
              "La ricerca degli indirizzi è orientata al Canada, quindi un indirizzo breve come «12 Main St, Moncton» si risolve senza che tu debba scrivere il paese.",
            ),
            warn(
              "Le tappe senza posizione non possono essere ordinate dall'ottimizzatore. Vengono parcheggiate in fondo al percorso invece di essere scartate, quindi controlla la coda dell'elenco prima di mandare fuori un autista.",
            ),
            see("delivery-routes/optimize-stop-order", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Mandarlo in strada",
      articles: [
        {
          slug: "optimize-stop-order",
          title: "Ordinare le tappe",
          summary:
            "Riordina a mano, oppure lascia che l'ottimizzatore calcoli per te l'ordine di guida.",
          keywords: [
            "ottimizza",
            "ordine",
            "sequenza",
            "riordina",
            "più breve",
            "pianificazione percorso",
          ],
          body: [
            p(
              "Le tappe partono nell'ordine in cui le hai aggiunte. Raramente è l'ordine in cui vuoi guidarle.",
            ),
            h("A mano"),
            p(
              "Trascina le tappe nell'ordine che vuoi. Utile quando l'autista conosce la zona meglio di qualsiasi algoritmo, o quando un cliente deve essere il primo.",
            ),
            h("Con l'ottimizzatore"),
            steps(
              "Risolvi prima gli indirizzi — una tappa senza posizione non può essere ordinata.",
              "Scegli di ottimizzare.",
              "Controlla il risultato: il nuovo ordine, la distanza totale e il tempo di guida stimato.",
              "Se vuoi aggiusta a mano dopo. L'ottimizzazione è un suggerimento che puoi scavalcare.",
            ),
            h("Due ottimizzatori"),
            table(
              ["Ottimizzatore", "Che cosa fa"],
              [
                [
                  "Standard",
                  "Gira dentro GeoCliks, nessun servizio esterno, nessun conteggio. Buon ordinamento per una giornata normale.",
                ],
                [
                  "Smart",
                  "Usa i dati reali della rete stradale per un ordinamento più stretto su percorsi densi o scomodi. Da Delivery Pro in su.",
                ],
              ],
            ),
            note(
              "Se chiedi l'ottimizzatore smart su un piano che non lo include, GeoCliks esegue quello standard invece di fallire. Ottieni comunque un percorso ordinato — controlla nella cronologia del percorso quale ottimizzatore è stato usato.",
            ),
            h("Che cosa rispetta l'ottimizzatore"),
            ul(
              "Il tuo indirizzo di partenza, e il rientro al deposito se è attivo.",
              "Il tempo di sosta di ogni tappa, o il valore predefinito del percorso.",
              "Le tappe senza posizione, che mantengono il loro posto in fondo all'elenco.",
            ),
            see("delivery-routes/assign-a-driver", "troubleshoot/route-optimize-failed"),
          ],
        },
        {
          slug: "assign-a-driver",
          title: "Assegnare un autista",
          summary: "Affida il percorso a qualcuno del tuo Workspace e fai partire la giornata.",
          keywords: [
            "assegna",
            "autista",
            "avvio",
            "stato",
            "smistamento",
            "rimuovi assegnazione",
          ],
          body: [
            p(
              "Un percorso deve appartenere a qualcuno prima di poter essere guidato. L'autista deve essere un membro del tuo Workspace — il ruolo field è quello giusto per chi guida e acquisisce e basta.",
            ),
            h("Assegnarlo"),
            steps(
              "Apri il percorso.",
              "Scegli di assegnarlo e scegli l'autista.",
              "Il percorso compare sul suo telefono, fra i percorsi di quella data.",
              "Fallo partire quando l'autista è in strada, oppure lascia che lo avvii lui chiudendo la prima tappa.",
            ),
            h("Stato del percorso"),
            table(
              ["Stato", "Significato"],
              [
                ["Bozza", "In costruzione. Ancora nessun autista."],
                ["Assegnato", "Un autista ce l'ha, non ancora partito."],
                ["Attivo", "Lo stanno guidando adesso."],
                ["Completato", "Tutte le tappe sono chiuse."],
                ["Annullato", "Sospeso. Le tappe non possono più essere chiuse."],
              ],
            ),
            h("Se cambi idea"),
            ul(
              "Togli l'assegnazione a un percorso per riportarlo in bozza e darlo a qualcun altro.",
              "Un autista che fotografa la prima consegna senza premere «avvia» rende comunque attivo il percorso.",
              "Annullare un percorso impedisce di chiudere altre tappe su di esso, e conserva tutto quello che è già stato registrato.",
            ),
            note(
              "Il tuo piano stabilisce per quanti autisti è dimensionata l'attività. Delivery Lite ne copre due, Pro cinque, Fleet quindici, Fleet 30 trenta, Fleet 200 duecento, Fleet 500 cinquecento.",
            ),
            see(
              "delivery-routes/driver-run-and-proof-of-delivery",
              "teamspace/roles-and-permissions",
            ),
          ],
        },
        {
          slug: "live-dispatch",
          title: "Smistamento in tempo reale",
          summary:
            "Inserisci un ordine arrivato a turno iniziato fra le tappe che restano a un autista.",
          keywords: [
            "smistamento",
            "in tempo reale",
            "aggiungi tappa",
            "a turno iniziato",
            "su richiesta",
            "inserisci",
          ],
          body: [
            p(
              "La modalità smistamento è per il lavoro che non esiste quando la giornata comincia: arriva una chiamata alle 14:00 e qualcuno deve prenderla. Aggiungi la tappa a un percorso che è già in strada e GeoCliks la incastra dentro.",
            ),
            h("Aggiungere una tappa al volo"),
            steps(
              "Apri il percorso attivo.",
              "Scegli di aggiungere una tappa al volo.",
              "Inserisci l'indirizzo e i dati del destinatario.",
              "Conferma. La tappa viene inserita nella parte di percorso che l'autista non ha ancora raggiunto, e compare sul suo telefono.",
            ),
            h("Che cosa non si sposta mai"),
            ul(
              "Le tappe già consegnate, non riuscite o saltate.",
              "La tappa verso cui l'autista sta guidando in questo momento.",
            ),
            p(
              "Una nuova tappa viene inserita nel punto meno costoso dell'elenco rimanente. Non è deliberatamente una nuova ottimizzazione: uno strumento che rimescola il piano sotto i piedi di un autista in movimento viene abbandonato da chi lo usa, e ri-ottimizzare in continuazione una serata piena ti costerebbe anche denaro a ogni ricalcolo.",
            ),
            note(
              "L'inserimento gira in locale ed è gratuito, per quante volte lo fai in un turno.",
            ),
            warn(
              "Lo smistamento in tempo reale richiede Delivery Pro o superiore. Con un piano che copre solo i percorsi pianificati puoi comunque aggiungere tappe a un percorso prima che parta.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
      ],
    },
    {
      title: "In strada",
      articles: [
        {
          slug: "driver-run-and-proof-of-delivery",
          title: "Il giro dell'autista e la prova di consegna",
          summary: "Che cosa vede l'autista, e come si chiude una tappa con una prova.",
          keywords: [
            "autista",
            "giro",
            "prova",
            "foto",
            "firma",
            "consegnata",
            "offline",
          ],
          body: [
            p(
              "Sul telefono l'autista vede una schermata sola: la tappa su cui si trova, l'indirizzo, il destinatario, eventuali note e quante tappe restano. Tutto il resto è tolto di mezzo.",
            ),
            h("Chiudere una tappa"),
            steps(
              "Tocca la tappa.",
              "Scatta la foto di consegna — il pacco davanti alla porta, il bancale nella baia, quello che dimostra che è arrivato.",
              "Conferma o correggi il nome del destinatario.",
              "Raccogli una firma, se il percorso la richiede.",
              "Segnala come consegnata. Compare la tappa successiva.",
            ),
            h("La foto non è facoltativa"),
            p(
              "Una tappa consegnata o non riuscita va chiusa con una foto vera del tuo Workspace. Non c'è modo di segnare una tappa come consegnata senza niente allegato — è tutto il senso di usare GeoCliks per le consegne invece di un'app con le caselle da spuntare.",
            ),
            h("Offline"),
            ul(
              "Il giro funziona senza segnale. Le foto e le chiusure delle tappe si mettono in coda sul dispositivo.",
              "L'orario di completamento registrato è quello in cui è stata scattata la foto, non quello del caricamento, quindi un percorso guidato in una zona senza campo si legge comunque correttamente.",
              "Se la coda si svuota due volte, il secondo tentativo viene riconosciuto e ignorato invece di chiudere la tappa due volte.",
            ),
            note(
              "L'ufficio vede ogni chiusura di tappa mentre arriva, così uno smistatore che segue il percorso sa dov'è l'autista senza telefonargli.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "mobile-app/offline-capture-and-queue",
            ),
          ],
        },
        {
          slug: "failed-and-skipped-stops",
          title: "Tappe non riuscite e saltate",
          summary:
            "Registra perché una consegna non è avvenuta, in un modo su cui l'ufficio può agire.",
          keywords: [
            "non riuscita",
            "saltata",
            "nessuno in casa",
            "rifiutata",
            "indirizzo sbagliato",
            "eccezione",
          ],
          body: [
            p(
              "Non tutte le tappe vanno a buon fine. Una tappa non riuscita è comunque una tappa chiusa con una prova — è la registrazione che l'autista c'è andato e di che cosa ha trovato.",
            ),
            h("Segnare una tappa come non riuscita"),
            steps(
              "Tocca la tappa e fotografa quello che l'autista ha davanti — la porta chiusa, la corsia bloccata, l'edificio sbagliato.",
              "Scegli «non riuscita».",
              "Scegli un motivo.",
              "Aggiungi una nota se c'è qualcosa che l'ufficio deve sapere.",
              "Salva.",
            ),
            h("I motivi"),
            table(
              ["Motivo", "Usalo per"],
              [
                ["Nessuno in casa", "Non c'era nessuno a ricevere la consegna."],
                ["Rifiutata", "Il destinatario non l'ha voluta."],
                ["Indirizzo sbagliato", "L'indirizzo non corrisponde al destinatario."],
                ["Chiuso", "Un'attività che era chiusa."],
                [
                  "Inaccessibile",
                  "Fisicamente irraggiungibile — cancello, neve, lavori in corso.",
                ],
                ["Altro", "Qualsiasi altra cosa. Scrivila nella nota."],
              ],
            ),
            h("Saltare, invece"),
            p(
              "Saltare è un'altra cosa: è l'autista che segnala che qui non c'era proprio niente da consegnare. È l'unica chiusura che non richiede una foto, e viene registrata come «saltata» così l'ufficio legge esattamente questo nella cronologia, invece di una consegna non riuscita che non è mai avvenuta.",
            ),
            warn(
              "Una tappa non riuscita non fa mai partire un'e-mail di prova di consegna al destinatario. Quei casi li gestisce l'ufficio a mano, perché un allegro «il tuo pacco è arrivato» per una consegna fallita è peggio di nessun messaggio.",
            ),
            note(
              "Ogni chiusura, mancata consegna e salto viene scritto nella cronologia del percorso con chi l'ha fatto e quando, e la cronologia non è modificabile.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "delivery-routes/driver-run-and-proof-of-delivery",
            ),
          ],
        },
        {
          slug: "tracking-links-and-notifications",
          title: "Link di tracciamento ed e-mail ai destinatari",
          summary:
            "Le tre e-mail che un destinatario può ricevere, ed esattamente che cosa mostra la pagina di tracciamento.",
          keywords: [
            "tracciamento",
            "notifica",
            "e-mail",
            "destinatario",
            "orario stimato",
            "link",
            "privacy",
          ],
          body: [
            p(
              "Un destinatario che ha un indirizzo e-mail sulla sua tappa può essere tenuto informato in automatico. Lo decidi percorso per percorso, e un destinatario senza indirizzo e-mail semplicemente non viene mai contattato.",
            ),
            h("Le tre e-mail"),
            table(
              ["E-mail", "Quando parte"],
              [
                ["In arrivo", "Il percorso è partito e l'autista è in strada."],
                ["Sei il prossimo", "L'autista è a un certo numero di consegne di distanza."],
                [
                  "Consegnato",
                  "La sua tappa è stata chiusa. Include la foto di prova e il suo codice.",
                ],
              ],
            ),
            h("Impostazioni"),
            ul(
              "Attiva o disattiva per il percorso l'e-mail di preavviso.",
              "Imposta con quante tappe di anticipo parte — una dà poco preavviso, cinque danno una finestra larga.",
              "Attiva o disattiva l'e-mail di prova di consegna.",
            ),
            h("Che cosa mostra la pagina di tracciamento"),
            p(
              "Ogni e-mail rimanda a una pagina di tracciamento per quella singola tappa, raggiungibile con un link non indovinabile. Il destinatario vede il nome della tua azienda, il proprio indirizzo, quante consegne ci sono ancora prima della sua e, una volta chiusa la tappa, la foto di prova con il suo orario verificato e la sua posizione.",
            ),
            h("Che cosa deliberatamente non mostra"),
            ul(
              "Qualsiasi altra tappa, indirizzo o destinatario del percorso.",
              "Il nome dell'autista, il suo telefono o la sua posizione in tempo reale.",
              "Il nome del percorso o il numero totale di tappe — che permetterebbe a un concorrente di ricostruire il tuo giro.",
            ),
            note(
              "Ogni destinatario riceve ciascuna e-mail al massimo una volta, e l'avanzamento dell'autista viene ricontrollato subito prima dell'invio, così nessuno riceve un «sei il prossimo» per una tappa appena consegnata.",
            ),
            warn(
              "Le e-mail ai destinatari partono solo se l'invio di e-mail è configurato per il tuo Workspace. Se i destinatari dicono di non ricevere niente, è la prima cosa da controllare.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "troubleshoot/notifications-not-arriving",
            ),
          ],
        },
      ],
    },
  ],
};
