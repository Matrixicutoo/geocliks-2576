import { type Category, h, note, p, see, steps, ul } from "../../types";

export const gettingStarted: Category = {
  slug: "getting-started",
  title: "Per iniziare",
  summary: "Non conosci ancora GeoCliks? Scegli il percorso che corrisponde al tuo ruolo.",
  icon: "Rocket",
  sections: [
    {
      title: "Le basi",
      articles: [
        {
          slug: "what-is-geocliks",
          title: "Che cos'è GeoCliks?",
          summary:
            "Prove dal campo che puoi dimostrare: ogni foto porta con sé ora verificata, posizione GPS e indirizzo.",
          keywords: ["panoramica", "informazioni", "prodotto", "introduzione", "overview"],
          body: [
            p(
              "GeoCliks è uno strumento di documentazione con foto e video per le squadre sul campo. Acquisisci il lavoro dal telefono e ogni acquisizione riporta l'ora in cui è stata scattata, il punto in cui è stata scattata e l'indirizzo a cui corrisponde quella posizione. Il sigillo viene impresso nell'immagine e registrato separatamente, così può essere controllato anche in seguito.",
            ),
            p(
              "L'obiettivo non è avere foto più belle. L'obiettivo è che quando un cliente, un assicuratore o un giudice chiede se una foto è davvero quello che dici, tu abbia una risposta che non dipende dalla tua parola.",
            ),
            h("Cosa ottieni"),
            ul(
              "Foto e video con filigrana, con ora verificata, coordinate GPS e indirizzo.",
              "Un codice foto univoco su ogni acquisizione, che chiunque può controllare senza avere un account.",
              "Teamspace: un Workspace condiviso in cui l'ufficio vede le acquisizioni della squadra mentre vengono caricate.",
              "Progetti, vista mappa, confronti prima-e-dopo ed esportazioni PDF, Excel, ZIP e KMZ con un clic.",
              "Percorsi di consegna: pianifica la giornata di un autista, mandalo in strada e chiudi ogni tappa con una foto di prova.",
            ),
            h("Chi lo usa"),
            ul(
              "Squadre di edilizia e artigiani che documentano avanzamento e chiusura lavori.",
              "Ripristini e lavori assicurativi, dove la cronologia è tutto l'argomento.",
              "Team di servizi pubblici, telecomunicazioni e ispezioni che devono avere una posizione su ogni registrazione.",
              "Operazioni di consegna che hanno bisogno della prova che un pacco è arrivato davvero.",
            ),
            note(
              "GeoCliks funziona offline. Le acquisizioni si mettono in coda sul dispositivo e si caricano da sole quando torna il segnale, mantenendo l'ora di acquisizione originale.",
            ),
            see("getting-started/create-your-account", "verify/what-is-a-photo-code"),
          ],
        },
        {
          slug: "create-your-account",
          title: "Crea il tuo account",
          summary:
            "Registrati nell'app o sul web — lo stesso account funziona in ogni parte del prodotto.",
          keywords: ["registrazione", "iscriviti", "nuovo account", "email", "sign up"],
          body: [
            p(
              "Un solo account GeoCliks funziona sull'app mobile, sul sito web e sull'app desktop. Crealo dove ti è più comodo: registrandoti da un punto diverso non stai creando un secondo account.",
            ),
            h("Registrati"),
            steps(
              "Apri l'app GeoCliks, oppure vai su geocliks.com e scegli la registrazione.",
              "Inserisci nome, email di lavoro e una password, oppure continua con Google.",
              "Controlla la posta in arrivo e apri il link dell'email di verifica.",
              "Scegli una lingua. Potrai cambiarla più tardi dal tuo profilo.",
            ),
            note(
              "Usa la tua email di lavoro, non quella personale. Quando qualcuno ti invita in un Workspace, manda l'invito all'indirizzo che conosce.",
            ),
            h("Se l'email di verifica non arriva"),
            ul(
              "Aspetta due minuti e controlla la cartella spam o posta indesiderata.",
              "Ricontrolla l'indirizzo che hai scritto: una lettera mancante è la causa più comune.",
              "Richiedi un nuovo link dalla schermata di accesso.",
            ),
            see("getting-started/for-solo-user", "troubleshoot/cant-sign-in"),
          ],
        },
        {
          slug: "install-the-app",
          title: "Installa l'app",
          summary:
            "Metti GeoCliks su iPhone, iPad o Android e usa l'app web da computer.",
          keywords: ["download", "ios", "android", "installazione", "desktop", "scarica"],
          body: [
            p(
              "L'acquisizione avviene da telefono o tablet. Revisione, report e pianificazione dei percorsi sono più comodi da computer, ma tutto è disponibile su entrambi.",
            ),
            h("Mobile"),
            ul(
              "iPhone e iPad: installa dall'App Store.",
              "Android: installa da Google Play.",
              "Oppure apri geocliks.com/get-app sul dispositivo e segui il link della tua piattaforma.",
            ),
            h("Computer"),
            p(
              "Vai su geocliks.com e accedi. Non c'è niente da installare: Teamspace funziona nel browser. È disponibile anche un'app desktop, se preferisci una finestra separata.",
            ),
            h("I permessi che l'app richiede"),
            ul(
              "Fotocamera — obbligatorio. Senza, non c'è niente da acquisire.",
              "Posizione — obbligatorio. La posizione GPS è metà di ciò che rende un'acquisizione una prova.",
              "Foto — facoltativo, solo se vuoi salvare le acquisizioni anche nel rullino.",
              "Notifiche — facoltativo, per caricamenti, messaggi e assegnazioni di percorso.",
            ),
            note(
              "Imposta il permesso di posizione almeno su «Mentre usi l'app». Con «Chiedi ogni volta» l'app deve interromperti prima di ogni acquisizione.",
            ),
            see("mobile-app/sign-in-on-mobile", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Scegli il tuo percorso",
      articles: [
        {
          slug: "for-solo-user",
          title: "Se lavori da solo",
          summary: "La configurazione più rapida per chi lavora da solo.",
          keywords: ["solo", "utente singolo", "freelance", "una persona"],
          body: [
            p(
              "Non ti serve una squadra per trarre valore da GeoCliks. Un account individuale ti dà acquisizioni con filigrana, progetti per tenere separati i lavori ed esportazioni da consegnare a un cliente.",
            ),
            h("Preparati in cinque minuti"),
            steps(
              "Installa l'app e accedi.",
              "Crea il tuo primo progetto — di solito l'indirizzo del lavoro o il nome del cliente.",
              "Apri il modello di filigrana e aggiungi il tuo logo, così le esportazioni sembrano tue.",
              "Fai un'acquisizione di prova e controlla che il sigillo mostri l'ora e l'indirizzo giusti.",
              "Esportala in PDF per vedere che cosa riceverà il tuo cliente.",
            ),
            h("Cosa fare quando il lavoro cresce"),
            ul(
              "Tieni un progetto per ogni lavoro. I report restano puliti e la mappa leggibile.",
              "Usa i confronti prima-e-dopo all'inizio e alla fine di ogni lavoro.",
              "Manda ai clienti un link di condivisione invece di un allegato email: resta sempre aggiornato.",
            ),
            note(
              "Il piano Free comprende foto con filigrana, video di 30 secondi per i primi tre giorni ed esportazione PDF fino a 20 foto. Plus alza i limiti di foto e video per una persona.",
            ),
            see("teamspace/create-a-project", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "for-team-owner",
          title: "Se gestisci la squadra",
          summary: "Crea il Workspace, invita la squadra e decidi chi può fare cosa.",
          keywords: ["owner", "admin", "configurazione", "workspace", "manager", "proprietario"],
          body: [
            p(
              "Il proprietario del Workspace configura Teamspace una volta e tutti gli altri lo raggiungono. Fallo da computer: è più rapido che da telefono.",
            ),
            h("Un ordine di configurazione che funziona"),
            steps(
              "Crea il Workspace e dagli il nome della tua azienda.",
              "Costruisci un modello di filigrana con il tuo logo e i campi che vuoi su ogni foto.",
              "Crea i progetti attivi prima di invitare qualcuno, così la squadra ha dove mettere le acquisizioni.",
              "Invita la squadra via email, oppure condividi il link di adesione o il codice QR stampato.",
              "Imposta il ruolo di ciascuno. La maggior parte della squadra dovrebbe essere field.",
              "Fai un'acquisizione tu stesso e conferma che finisca nel progetto giusto.",
            ),
            h("I ruoli"),
            ul(
              "owner — controllo completo, compresa la fatturazione e l'eliminazione del Workspace. Ce n'è uno solo.",
              "admin — tutto quello che può fare il proprietario, tranne fatturazione e proprietà.",
              "manager — crea progetti e percorsi, invita persone, produce report.",
              "field — acquisisce foto e video, esegue i percorsi assegnati, vede il proprio lavoro.",
            ),
            note(
              "Invita le persone come field, a meno che non debbano creare progetti o produrre report. Puoi alzare un ruolo in qualsiasi momento: ha effetto la volta successiva in cui la persona apre l'app.",
            ),
            see("teamspace/invite-your-crew", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "for-crew-member",
          title: "Se sei stato invitato in una squadra",
          summary: "Entra nel Workspace e fai la tua prima acquisizione.",
          keywords: ["field", "squadra", "adesione", "invitato", "membro", "crew"],
          body: [
            p(
              "Qualcuno nella tua azienda ha creato un Workspace e ti ha aggiunto. Il tuo compito è acquisire il lavoro sul campo; progetti, report e fatturazione li gestisce l'ufficio.",
            ),
            h("Entra"),
            steps(
              "Apri l'email di invito, oppure scansiona il codice QR che ti dà il tuo responsabile.",
              "Crea il tuo account, oppure accedi se ne hai già uno.",
              "Installa l'app GeoCliks sul telefono.",
              "Consenti fotocamera e posizione. Servono entrambe per acquisire.",
              "Apri l'elenco dei progetti e scegli il lavoro su cui stai lavorando.",
            ),
            h("La tua prima acquisizione"),
            steps(
              "Tocca il pulsante di acquisizione.",
              "Controlla che l'anteprima della filigrana mostri il progetto e l'indirizzo giusti.",
              "Scatta la foto. Si carica da sola.",
              "Se non hai segnale, continua a lavorare: le acquisizioni si mettono in coda e si caricano più tardi.",
            ),
            note(
              "Non puoi modificare l'ora o la posizione di un'acquisizione, e non può farlo nemmeno il tuo responsabile. È il senso del prodotto, non un limite.",
            ),
            see("mobile-app/take-a-photo", "mobile-app/offline-capture-and-queue"),
          ],
        },
      ],
    },
  ],
};
