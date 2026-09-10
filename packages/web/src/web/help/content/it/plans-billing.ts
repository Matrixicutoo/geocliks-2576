import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const plansBilling: Category = {
  slug: "plans-billing",
  title: "Piani e fatturazione",
  summary: "Cosa comprende ogni piano, come cambiarlo e dove trovare una fattura.",
  icon: "CreditCard",
  sections: [
    {
      title: "Scegliere un piano",
      articles: [
        {
          slug: "compare-plans",
          title: "Confronta i piani",
          summary: "Cosa ottieni con Free, Plus, Business, Crew 10, Crew 25 ed Enterprise.",
          keywords: [
            "piani",
            "prezzi",
            "confronto",
            "free",
            "plus",
            "business",
            "crew",
            "limiti",
          ],
          body: [
            p(
              "Ci sono due famiglie di piani. I piani per le prove qui sotto servono a documentare il lavoro. I piani Delivery sono per attività che consistono soprattutto nel guidare, e sono trattati in un articolo a parte.",
            ),
            p(
              "I prezzi attuali sono nella sezione prezzi di geocliks.com. Questa pagina spiega cosa permette davvero ciascun piano, che è la parte su cui le persone si trovano spiazzate.",
            ),
            h("Piani per le prove"),
            table(
              ["Piano", "Per chi", "Posti"],
              [
                ["Free", "Provare il prodotto, o documentare da soli di tanto in tanto.", "1"],
                ["Plus", "Una persona che lavora a tempo pieno e condivide con i clienti.", "1"],
                ["Business", "Una piccola squadra con un Teamspace condiviso.", "5"],
                ["Crew 10", "Una squadra che cresce.", "10"],
                ["Crew 25", "Un'attività più grande.", "25"],
                ["Enterprise", "Volumi e condizioni personalizzati. Parla con noi.", "Su misura"],
              ],
            ),
            h("Cosa cambia salendo di piano"),
            table(
              ["Funzione", "Da dove parte"],
              [
                ["Acquisizione verificata, filigrane, codici foto", "Free"],
                ["Acquisizioni illimitate al mese", "Plus"],
                ["Esportazioni Excel, ZIP e KMZ", "Plus"],
                ["Link di condivisione", "Plus"],
                ["Progetti e modelli di filigrana illimitati", "Plus"],
                ["Il tuo logo sulle filigrane", "Plus"],
                ["Clip video di durata piena", "Plus"],
                ["Teamspace con membri invitati", "Business"],
                ["Ruoli e accesso per progetto", "Business"],
              ],
            ),
            h("Il piano Free in dettaglio"),
            ul(
              "300 acquisizioni al mese.",
              "Il video è limitato a clip di 30 secondi, e solo per i primi tre giorni.",
              "Tre progetti, un posto, due modelli di filigrana.",
              "Esportazione PDF fino a 20 foto. Nessun Excel, ZIP o KMZ.",
              "Nessun Teamspace, quindi nessun membro invitato e nessun link di condivisione.",
              "Nessun percorso di consegna.",
            ),
            note(
              "Ogni piano, Free compreso, ti dà la stessa verifica: gli stessi dati nella filigrana, lo stesso codice foto, lo stesso sigillo. La verifica non è un miglioramento a pagamento.",
            ),
            h("Le consegne sui piani per le prove"),
            p(
              "Plus e superiori includono una quota mensile di tappe di consegna, così puoi gestire percorsi senza passare a un piano Delivery: una quota contenuta su Plus, più ampia su Business e progressivamente maggiore su Crew 10 e Crew 25. Se guidi ogni giorno, i piani Delivery costano meno per tappa.",
            ),
            see("plans-billing/delivery-plans", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "delivery-plans",
          title: "Piani Delivery",
          summary:
            "Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 e Fleet 500 — dimensionati per tappe al mese e autisti.",
          keywords: [
            "consegne",
            "lite",
            "pro",
            "fleet",
            "tappe",
            "autisti",
            "smistamento",
            "delivery",
            "dispatch",
          ],
          body: [
            p(
              "I piani Delivery sono per attività in cui guidare è il lavoro, non un effetto collaterale. Includono tutto quello che c'è nei piani per le prove più una quota mensile di tappe molto più ampia.",
            ),
            table(
              ["Piano", "Tappe al mese", "Autisti", "Smistamento live", "Ottimizzatore smart"],
              [
                ["Delivery Lite", "500", "2", "No", "No"],
                ["Delivery Pro", "2.000", "5", "Sì", "Sì"],
                ["Delivery Fleet", "6.000", "15", "Sì", "Sì"],
                ["Delivery Fleet 30", "12.000", "30", "Sì", "Sì"],
                ["Delivery Fleet 200", "80.000", "200", "Sì", "Sì"],
                ["Delivery Fleet 500", "200.000", "500", "Sì", "Sì"],
              ],
            ),
            h("Quali sono le due funzioni riservate"),
            ul(
              "Smistamento live — aggiungere tappe a un percorso che è già in corso. Pro, Fleet, Fleet 30, Fleet 200 e Fleet 500.",
              "Ottimizzatore smart — ordinamento del percorso sulla rete stradale invece del risolutore standard. Pro, Fleet, Fleet 30, Fleet 200 e Fleet 500. Sui piani che non lo hanno viene eseguito l'ottimizzatore standard, quindi ottieni comunque un percorso ordinato.",
            ),
            h("Come ottenerne uno"),
            p(
              "Ogni piano Delivery si attiva in autonomia dalla pagina di fatturazione: scegli il piano, passa da una cassa ospitata sicura, inserisci i dati della carta. I nuovi limiti valgono appena l'operazione si completa. Un piano Delivery inizia con una prova gratuita, per questo il pulsante riporta «Prova gratuita». Se il tuo Workspace è già su un piano Delivery, passare a un altro viene fatturato subito e il pulsante riporta invece «Passa a …» — la prova è una per Workspace, non una per piano.",
            ),
            steps(
              "Apri la fatturazione nelle impostazioni del Workspace.",
              "Scegli il piano Delivery che corrisponde al tuo volume.",
              "Completa il pagamento. Torni su GeoCliks con la quota di tappe già attiva.",
            ),
            warn(
              "Enterprise è l'unico piano che non si attiva in autonomia. La sua scheda mostra «Parla con noi» invece di un pulsante di pagamento e apre un'email precompilata a sales@geocliks.com. Nessuno viene addebitato automaticamente e sul tuo Workspace non cambia niente finché non lo configuriamo insieme a te.",
            ),
            note(
              "Solo il proprietario del Workspace può cambiare piano. Gli admin gestiscono le persone, non l'abbonamento.",
            ),
            h("Quale ti conviene"),
            p(
              "Conta le tappe che consegni davvero in un mese normale, poi aggiungi un po' di margine per la settimana più intensa. Superare la quota blocca la creazione di percorsi fino al mese successivo, quindi il piano deve coprire il tuo picco, non la tua media.",
            ),
            note(
              "Le tappe vengono conteggiate per mese di calendario e si azzerano il primo giorno. Una tappa conta nel momento in cui viene aggiunta a un percorso, indipendentemente dal fatto che venga consegnata.",
            ),
            see("delivery-routes/delivery-overview", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Gestire il tuo abbonamento",
      articles: [
        {
          slug: "upgrade-or-change-plan",
          title: "Passa a un altro piano",
          summary: "Cambia piano dalla pagina di fatturazione — lo fa il proprietario.",
          keywords: [
            "passaggio",
            "cambia piano",
            "pagamento",
            "piano inferiore",
            "upgrade",
            "downgrade",
          ],
          body: [
            p(
              "I piani si cambiano dalla fatturazione nelle impostazioni del Workspace. Può farlo solo il proprietario del Workspace: gli admin gestiscono le persone, non l'abbonamento.",
            ),
            h("Cambiare piano"),
            steps(
              "Apri la fatturazione.",
              "Scegli il piano che vuoi.",
              "Per un piano a pagamento attivabile in autonomia vieni portato a una cassa ospitata sicura per inserire i dati della carta, e riportato su GeoCliks al termine.",
              "Per Enterprise ottieni invece un'email precompilata al nostro team.",
              "I nuovi limiti valgono appena il cambio va a buon fine.",
            ),
            h("Passare a un piano più grande"),
            ul(
              "I nuovi limiti hanno effetto immediato.",
              "Niente di quello che hai già acquisito viene toccato.",
              "I posti aggiuntivi diventano disponibili subito, quindi puoi invitare persone immediatamente dopo.",
            ),
            h("Scendere di piano"),
            p(
              "Il passaggio a un piano inferiore viene rifiutato finché il tuo Workspace è più grande del piano di destinazione. Se hai otto membri e passi a un piano da cinque posti, ti verrà detto di rimuovere prima dei membri. È voluto: l'alternativa sarebbe tagliare fuori tre persone in silenzio.",
            ),
            note(
              "Scegliere il piano Free, o riscegliere il piano su cui sei già, non passa affatto dalla cassa.",
            ),
            see("plans-billing/seats-and-billing", "plans-billing/cancel-or-downgrade"),
          ],
        },
        {
          slug: "seats-and-billing",
          title: "Posti",
          summary: "Cos'è un posto, cosa ne occupa uno e cosa fare quando finiscono.",
          keywords: ["posti", "membri", "invito", "limite", "capienza", "utenti", "seats"],
          body: [
            p(
              "Un posto è una persona che può accedere al tuo Workspace. Il tuo piano ne include un numero fisso, e il proprietario conta come uno di questi.",
            ),
            h("Cosa occupa un posto"),
            ul(
              "Ogni membro del Workspace, qualunque sia il suo ruolo. Un membro field occupa lo stesso posto di un admin.",
              "Ogni invito in attesa, finché non viene accettato o revocato.",
            ),
            p(
              "Gli inviti in attesa trattengono un posto di proposito. Altrimenti si potrebbero mandare dieci inviti a fronte di due posti e chiunque accettasse sforerebbe il piano.",
            ),
            h("Posti esauriti"),
            steps(
              "Apri la squadra e guarda gli inviti in attesa. Revoca quelli che non verranno accettati.",
              "Rimuovi i membri che sono andati via. Le loro acquisizioni e la loro cronologia restano nel Workspace.",
              "Se ti servono davvero più persone, sali di piano.",
            ),
            note(
              "Rimuovere un membro libera il suo posto immediatamente e non elimina mai il suo lavoro.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "payment-and-invoices",
          title: "Pagamenti e fatture",
          summary:
            "Dove stanno i dati della carta, come aggiornarli e dove prendere una ricevuta.",
          keywords: [
            "fattura",
            "ricevuta",
            "carta",
            "pagamento",
            "iva",
            "imposte",
            "portale di fatturazione",
          ],
          body: [
            p(
              "I pagamenti sono gestiti dal nostro gestore dei pagamenti, non da GeoCliks. Il numero della tua carta non viene mai conservato sui nostri server.",
            ),
            h("Aggiornare una carta"),
            steps(
              "Apri la fatturazione nelle impostazioni del Workspace.",
              "Apri il portale di fatturazione.",
              "Aggiorna il metodo di pagamento da lì.",
            ),
            h("Fatture e ricevute"),
            ul(
              "Ogni pagamento produce una fattura, disponibile nel portale di fatturazione.",
              "Le fatture vengono inviate all'indirizzo di fatturazione dell'abbonamento, che non è sempre l'email di accesso del proprietario: controllalo se le ricevute arrivano alla persona sbagliata.",
              "Aggiungi nel portale la ragione sociale e i dati fiscali e compariranno sulle fatture successive.",
            ),
            h("Un pagamento non andato a buon fine"),
            p(
              "Il gestore riprova un pagamento non riuscito prima che cambi qualcosa sul tuo Workspace. Se continua a non riuscire, il tuo Workspace scende ai limiti del piano Free: le tue acquisizioni non vengono eliminate, ma esportazioni, link di condivisione e Teamspace smettono di funzionare finché il pagamento non va a buon fine.",
            ),
            warn(
              "Se il tuo Workspace è su un piano che abbiamo configurato a mano per te, può non esserci un portale in autonomia. Scrivi a support@geocliks.com e sistemiamo noi la fattura.",
            ),
            see("plans-billing/cancel-or-downgrade", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "cancel-or-downgrade",
          title: "Disdire o scendere di piano",
          summary: "Come smettere di pagare, e cosa succede esattamente alle tue prove.",
          keywords: [
            "disdetta",
            "piano inferiore",
            "eliminazione",
            "rimborso",
            "esportazione",
            "dati",
            "cancel",
          ],
          body: [
            p(
              "Puoi smettere di pagare quando vuoi. La domanda importante è cosa succede al lavoro, quindi ecco la risposta senza giri di parole.",
            ),
            h("Disdire"),
            steps(
              "Esporta prima tutto quello che ti servirà fuori da GeoCliks. Fallo prima di disdire, perché sul piano Free i formati di esportazione sono limitati.",
              "Riduci il tuo Workspace per farlo stare nel piano di destinazione, se stai scendendo a meno posti.",
              "Apri la fatturazione e passa al piano Free oppure disdici dal portale di fatturazione.",
            ),
            h("Cosa succede ai tuoi dati"),
            ul(
              "Le tue acquisizioni non vengono eliminate quando scendi di piano o disdici.",
              "La verifica continua a funzionare. I codici foto si risolvono ancora e i sigilli risultano ancora validi.",
              "Le funzioni a pagamento si fermano: esportazioni Excel, ZIP e KMZ, link di condivisione, Teamspace e percorsi di consegna.",
              "I link di condivisione esistenti smettono di funzionare finché il tuo piano non li comprende.",
              "I membri oltre il nuovo numero di posti perdono l'accesso, ed è per questo che il passaggio a un piano inferiore ti chiede di rimuoverli prima.",
            ),
            warn(
              "Esporta prima di disdire, non dopo. Sul piano Free sei limitato a un PDF fino a 20 foto, che non è un modo per tirare fuori un anno di lavoro.",
            ),
            h("Eliminare del tutto il Workspace"),
            p(
              "Disdire non è eliminare. Se vuoi che il Workspace e i suoi contenuti vengano rimossi definitivamente, scrivi a support@geocliks.com dall'indirizzo del proprietario e chiedi l'eliminazione. Non si può annullare e chiediamo conferma prima di procedere.",
            ),
            see("legal/data-retention", "teamspace/reports-and-exports"),
          ],
        },
      ],
    },
  ],
};
