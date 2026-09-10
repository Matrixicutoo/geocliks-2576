import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const deliveryRoutes: Category = {
  slug: "delivery-routes",
  title: "Routes de livraison",
  summary:
    "Planifiez la journée d'un chauffeur, envoyez-le sur la route, et fermez chaque arrêt avec une photo de preuve que le destinataire peut voir.",
  icon: "Route",
  sections: [
    {
      title: "Planifier la journée",
      articles: [
        {
          slug: "delivery-overview",
          title: "Comment fonctionne Livraison",
          summary:
            "L'allure d'une journée de livraison dans GeoCliks : bâtir une route, assigner un chauffeur, fermer chaque arrêt avec une preuve.",
          keywords: [
            "livraison",
            "routes",
            "répartition",
            "chauffeur",
            "preuve de livraison",
            "delivery",
          ],
          body: [
            p(
              "Routes de livraison reprend la même idée de photo vérifiée et l'applique à la journée d'un chauffeur. Vous bâtissez une liste d'arrêts au bureau, vous la remettez à un chauffeur, et le chauffeur ferme chaque arrêt en photographiant la livraison. La photo porte l'heure vérifiée, la position GPS et l'adresse : un litige de livraison a donc une réponse.",
            ),
            h("La journée, du début à la fin"),
            steps(
              "Le bureau crée une route pour une date et y colle les adresses du jour.",
              "GeoCliks convertit les adresses en positions cartographiques, et vous corrigez celles qu'il n'a pas pu placer.",
              "Vous ordonnez les arrêts, à la main ou avec l'optimiseur.",
              "Vous assignez la route à un chauffeur, qui la voit sur son téléphone.",
              "Le chauffeur descend la liste en photographiant chaque livraison.",
              "Les destinataires qui ont une adresse courriel reçoivent un message de preuve de livraison avec la photo.",
              "Le bureau voit la route se fermer en temps réel et conserve la piste de vérification.",
            ),
            h("Deux types de route"),
            table(
              ["Mode", "À utiliser quand"],
              [
                [
                  "Planifiée",
                  "Vous connaissez toute la journée d'avance. Bâtissez-la, optimisez-la, envoyez-la.",
                ],
                [
                  "Répartition",
                  "Les commandes arrivent pendant le quart et s'insèrent dans les arrêts restants d'un chauffeur.",
                ],
              ],
            ),
            h("Chaque arrêt finit dans l'un de quatre états"),
            ul(
              "Livré — fermé avec une photo de preuve.",
              "Échoué — le chauffeur n'a pas pu livrer, avec une raison et une photo.",
              "Ignoré — il n'y avait rien à livrer ici. La seule fermeture sans photo.",
              "En attente — pas encore atteint.",
            ),
            note(
              "Livraison est une capacité distincte de la capture de preuves. Votre allocation d'arrêts de livraison par mois vient de votre forfait, et les forfaits Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 et Fleet 500 existent pour les opérations qui roulent surtout sur la route.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "create-a-route",
          title: "Créer une route",
          summary:
            "Fixez la date, le dépôt, l'heure de départ et la durée habituelle d'un arrêt.",
          keywords: [
            "nouvelle route",
            "créer",
            "dépôt",
            "heure de départ",
            "temps de service",
            "signature",
          ],
          body: [
            p(
              "Une route, c'est le travail d'un chauffeur pour une date. Créez-la d'abord, puis remplissez-la d'arrêts.",
            ),
            h("La créer"),
            steps(
              "Ouvrez Routes et choisissez Nouvelle route.",
              "Donnez-lui un nom qu'un répartiteur reconnaîtra un matin chargé — «  Mardi rive nord  » vaut mieux que «  Route 4  ».",
              "Fixez la date.",
              "Choisissez le mode Planifiée ou Répartition.",
              "Liez-la au besoin à un projet, pour que les photos de livraison atterrissent avec les preuves de ce chantier.",
              "Saisissez l'adresse de départ — habituellement votre dépôt ou votre cour.",
              "Enregistrez.",
            ),
            h("Les réglages qui façonnent le plan"),
            table(
              ["Réglage", "Ce qu'il fait"],
              [
                [
                  "Adresse de départ",
                  "Là où commence la journée. L'optimiseur planifie à partir de ce point.",
                ],
                ["Retour au point de départ", "Inclure le trajet de retour au dépôt dans le plan."],
                ["Heure de départ", "Quand le chauffeur part. 08:00 par défaut."],
                [
                  "Temps de service",
                  "Minutes passées à un arrêt moyen. 5 par défaut. Détermine les heures d'arrivée estimées.",
                ],
                ["Exiger une signature", "Demander une signature au chauffeur en plus de la photo."],
              ],
            ),
            h("Le temps de service mérite d'être bien réglé"),
            p(
              "Le temps de service sert à calculer l'heure d'arrivée estimée de tous les arrêts suivants. Cinq minutes convient à des colis livrés à la porte. Un arrêt qui implique de décharger des palettes se rapproche plutôt de vingt, et vous pouvez remplacer le temps de service sur les arrêts que vous savez lents.",
            ),
            note(
              "Créer une route exige le rôle gestionnaire ou supérieur. Les chauffeurs ne bâtissent pas leurs propres routes.",
            ),
            warn(
              "Le mode Répartition exige Delivery Pro ou supérieur. Si votre forfait ne couvre que les routes planifiées, on vous le dit au moment de choisir le mode, pas après avoir bâti la journée.",
            ),
            see("delivery-routes/add-stops-by-pasting-a-list", "delivery-routes/live-dispatch"),
          ],
        },
        {
          slug: "add-stops-by-pasting-a-list",
          title: "Ajouter des arrêts en collant une liste ou en téléversant un CSV",
          summary:
            "Collez une colonne de tableur, un courriel du client, ou téléversez un CSV — GeoCliks lit les colonnes dans les deux cas.",
          keywords: [
            "arrêts",
            "coller",
            "importer",
            "téléverser",
            "fichier",
            "tableur",
            "csv",
            "en lot",
            "adresses",
          ],
          body: [
            p(
              "Les arrêts entrent de deux façons : en collant les adresses, ou en téléversant un fichier CSV. Les deux aboutissent dans la même boîte et passent par le même lecteur, donc tout ce qui suit s'applique aux deux. Vous n'avez pas à reformater la liste d'avance.",
            ),
            h("Coller une liste"),
            steps(
              "Ouvrez la route et trouvez la boîte Ajouter des arrêts.",
              "Collez le bloc. Un arrêt par ligne.",
              "Lisez le résumé au-dessus de la boîte : combien d'arrêts ont été trouvés, quel séparateur a été utilisé, quelles colonnes ont été reconnues, et combien de lignes ont été écartées.",
              "Corrigez ce qui cloche dans la source et collez de nouveau, ou ajoutez les arrêts et modifiez-les un par un.",
              "Choisissez Ajouter des arrêts.",
            ),
            h("Téléverser un CSV"),
            steps(
              "Exportez la liste de votre tableur ou de votre système de commandes en format CSV.",
              "Ouvrez la route et trouvez la boîte Ajouter des arrêts.",
              "Choisissez Téléverser un CSV et sélectionnez le fichier.",
              "Le contenu du fichier tombe dans la boîte, où vous pouvez lire le résumé et modifier n'importe quelle ligne avant que rien ne soit créé.",
              "Choisissez Ajouter des arrêts.",
            ),
            note(
              "Le téléversement ne crée pas les arrêts par lui-même — il remplit la boîte. Rien n'est ajouté à la route tant que vous n'avez pas choisi Ajouter des arrêts, donc un mauvais fichier ne coûte rien. Les fichiers doivent être en CSV ou en texte brut, et faire moins de 1 Mo.",
            ),
            h("Ce que le lecteur comprend"),
            ul(
              "Séparation par tabulation, virgule ou point-virgule. Il détermine laquelle vous avez utilisée.",
              "Les champs entre guillemets, pour qu'une adresse contenant une virgule reste une seule adresse.",
              "Une ligne d'en-tête, s'il y en a une. Les colonnes sont alors associées par nom, dans n'importe quel ordre.",
              "Des en-têtes en français, en anglais, en portugais ou en allemand — adresse/address/endereço/Adresse, nom/name/nome/Empfänger, courriel/email/e-mail, téléphone/phone/telefone/Telefon, commande/reference/pedido/Referenz, remarques/notes/observações/Notizen. Les accents sont facultatifs : endereco, observacoes et Empfaenger fonctionnent aussi.",
              "Une adresse répartie sur plusieurs colonnes de tableur — rue, ville, province, code postal — recollée en une seule ligne.",
              "Les adresses courriel et les numéros de téléphone repérés à leur forme, même sans ligne d'en-tête.",
            ),
            h("Les champs par arrêt"),
            table(
              ["Champ", "Pourquoi il compte"],
              [
                ["Adresse", "Obligatoire. Tout le reste est facultatif."],
                [
                  "Nom du destinataire",
                  "Affiché au chauffeur et utilisé dans le courriel de preuve.",
                ],
                [
                  "Courriel du destinataire",
                  "Sans lui, ce destinataire ne reçoit ni suivi ni courriel de preuve.",
                ],
                ["Téléphone du destinataire", "Pour que le chauffeur appelle à l'avance."],
                ["Référence", "Votre numéro de commande, de facture ou de suivi. Cherchable."],
                ["Remarques", "Codes de barrière, numéros d'interphone, où déposer le colis."],
                ["Plage horaire", "Arrivée la plus hâtive et la plus tardive acceptables."],
                [
                  "Temps de service",
                  "Remplace la valeur par défaut de la route pour un arrêt que vous savez lent.",
                ],
              ],
            ),
            h("Pourquoi un code postal n'est jamais pris pour un nom"),
            p(
              "Une liste canadienne collée sous la forme «  12 rue Main, Moncton NB, E1A 4H2  » produisait autrefois un destinataire nommé E1A 4H2. Le lecteur reconnaît maintenant les mots de voirie, les codes de province et les formes de code postal canadien ou américain, et ne retient un champ final comme nom de personne que lorsqu'il en a vraiment l'air.",
            ),
            note(
              "Vous pouvez ajouter jusqu'à 300 arrêts en un seul collage. Pour une journée plus grosse, collez par lots — ils s'ajoutent à la même route.",
            ),
            warn(
              "Chaque arrêt est décompté de votre allocation mensuelle de livraison. Si un collage vous ferait dépasser le plafond du forfait, il est refusé en entier : vous ne vous retrouvez jamais avec une demi-route.",
            ),
            see("delivery-routes/geocoding-and-fixing-addresses", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "geocoding-and-fixing-addresses",
          title: "Résoudre les adresses et corriger les mauvaises",
          summary:
            "Transformez des adresses saisies en positions cartographiques, et placez une épingle à la main quand une adresse est introuvable.",
          keywords: [
            "géocodage",
            "adresse",
            "épingle",
            "coordonnées",
            "échec",
            "résoudre",
            "carte",
            "geocode",
          ],
          body: [
            p(
              "Une adresse collée n'est que du texte. Avant qu'une route puisse être ordonnée ou minutée, chaque arrêt a besoin d'une position sur la carte. Cette étape s'appelle la résolution, et elle se lance depuis la route.",
            ),
            h("Résoudre les arrêts"),
            steps(
              "Ouvrez la route.",
              "Choisissez Résoudre les adresses. Seuls les arrêts pas encore résolus sont traités.",
              "Lisez le résultat : combien ont été placés et combien ont échoué.",
              "Réglez les échecs avant d'optimiser.",
            ),
            h("Chaque arrêt a un statut de résolution"),
            table(
              ["Statut", "Signification"],
              [
                ["En attente", "Pas encore recherché."],
                ["OK", "Placé sur la carte, avec une adresse nettoyée."],
                ["Échec", "Introuvable. A besoin de votre aide."],
                [
                  "Manuel",
                  "Vous avez placé l'épingle vous-même. Jamais écrasée par une nouvelle résolution.",
                ],
              ],
            ),
            h("Corriger un arrêt en échec"),
            ul(
              "Modifiez l'adresse et résolvez de nouveau — une ville ou une province manquante est la cause habituelle.",
              "Ou ouvrez la carte et placez vous-même l'épingle au bon endroit. L'arrêt devient Manuel et est considéré comme placé.",
              "Une épingle manuelle est la solution pour un nouveau développement, une propriété rurale ou un site sans adresse municipale.",
            ),
            h("Refaire la résolution"),
            p(
              "Une résolution forcée recherche de nouveau chaque arrêt, y compris ceux déjà marqués OK. Elle laisse volontairement les épingles manuelles intactes, parce qu'une épingle placée à la main est une meilleure information que tout ce qu'une recherche peut retourner.",
            ),
            note(
              "La recherche d'adresses est orientée vers le Canada : une adresse courte comme «  12 rue Main, Moncton  » se résout sans que vous ayez à préciser le pays.",
            ),
            warn(
              "Les arrêts sans position ne peuvent pas être ordonnés par l'optimiseur. Ils sont garés à la fin de la route plutôt que retirés : vérifiez donc la queue de votre liste avant d'envoyer un chauffeur.",
            ),
            see("delivery-routes/optimize-stop-order", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Envoyer sur la route",
      articles: [
        {
          slug: "optimize-stop-order",
          title: "Ordonner les arrêts",
          summary:
            "Réordonnez à la main, ou laissez l'optimiseur déterminer l'ordre de conduite pour vous.",
          keywords: [
            "optimiser",
            "ordre",
            "séquence",
            "réordonner",
            "plus court",
            "planification",
            "optimize",
          ],
          body: [
            p(
              "Les arrêts démarrent dans l'ordre où vous les avez ajoutés. C'est rarement l'ordre dans lequel vous voulez les conduire.",
            ),
            h("À la main"),
            p(
              "Faites glisser les arrêts dans l'ordre voulu. Utile quand le chauffeur connaît le secteur mieux que n'importe quel algorithme, ou quand un client doit passer en premier.",
            ),
            h("Avec l'optimiseur"),
            steps(
              "Résolvez d'abord les adresses — un arrêt sans position ne peut pas être ordonné.",
              "Choisissez Optimiser l'ordre.",
              "Examinez le résultat : le nouvel ordre, la distance totale et le temps de conduite estimé.",
              "Ajustez ensuite à la main si vous le voulez. L'optimisation est une suggestion que vous pouvez renverser.",
            ),
            h("Deux optimiseurs"),
            table(
              ["Optimiseur", "Ce qu'il fait"],
              [
                [
                  "Standard",
                  "Tourne dans GeoCliks, sans service externe ni facturation à l'usage. Bon ordonnancement pour une journée normale.",
                ],
                [
                  "Intelligent",
                  "Utilise les vraies données du réseau routier pour un ordre plus serré sur les routes denses ou difficiles. Delivery Pro et supérieur.",
                ],
              ],
            ),
            note(
              "Si vous demandez l'optimiseur intelligent sur un forfait qui ne l'inclut pas, GeoCliks lance le standard plutôt que d'échouer. Vous obtenez quand même une route ordonnée — vérifiez dans l'historique de la route quel optimiseur a été utilisé.",
            ),
            h("Ce que l'optimiseur respecte"),
            ul(
              "Votre adresse de départ, et le réglage de retour au dépôt s'il est activé.",
              "Le temps de service de chaque arrêt, ou la valeur par défaut de la route.",
              "Les arrêts sans position, qui gardent leur place à la fin de la liste.",
            ),
            see("delivery-routes/assign-a-driver", "troubleshoot/route-optimize-failed"),
          ],
        },
        {
          slug: "assign-a-driver",
          title: "Assigner un chauffeur",
          summary:
            "Remettez la route à quelqu'un de votre espace de travail et lancez la journée.",
          keywords: [
            "assigner",
            "chauffeur",
            "démarrer",
            "statut",
            "répartition",
            "désassigner",
            "driver",
          ],
          body: [
            p(
              "Une route doit appartenir à quelqu'un avant d'être conduite. Le chauffeur doit être membre de votre espace de travail — le rôle terrain est le bon pour une équipe qui ne fait que conduire et capturer.",
            ),
            h("L'assigner"),
            steps(
              "Ouvrez la route.",
              "Choisissez Assigner, et sélectionnez le chauffeur.",
              "La route apparaît sur son téléphone, sous ses routes de cette date.",
              "Choisissez Démarrer quand il part, ou laissez le chauffeur la démarrer en fermant son premier arrêt.",
            ),
            h("Statut de la route"),
            table(
              ["Statut", "Signification"],
              [
                ["Brouillon", "En construction. Aucun chauffeur pour l'instant."],
                ["Assignée", "Un chauffeur l'a, pas encore démarrée."],
                ["En cours", "Conduite en ce moment."],
                ["Terminée", "Tous les arrêts sont fermés."],
                ["Annulée", "Abandonnée. Les arrêts ne peuvent plus être fermés."],
              ],
            ),
            h("Changer d'idée"),
            ul(
              "Désassignez une route pour la ramener à l'état brouillon et la remettre à quelqu'un d'autre.",
              "Un chauffeur qui photographie sa première livraison sans toucher à Démarrer rend quand même la route active.",
              "Annuler une route empêche la fermeture de tout arrêt supplémentaire, et conserve tout ce qui est déjà enregistré.",
            ),
            note(
              "Votre forfait fixe le nombre de chauffeurs pour lequel l'opération est dimensionnée. Delivery Lite en couvre deux, Pro cinq, Fleet quinze, Fleet 30 trente, Fleet 200 deux cents, Fleet 500 cinq cents.",
            ),
            see(
              "delivery-routes/driver-run-and-proof-of-delivery",
              "teamspace/roles-and-permissions",
            ),
          ],
        },
        {
          slug: "live-dispatch",
          title: "Répartition en direct",
          summary:
            "Insérez une commande arrivée en plein quart dans les arrêts restants d'un chauffeur.",
          keywords: [
            "répartition",
            "en direct",
            "ajouter un arrêt",
            "en cours de quart",
            "sur demande",
            "insérer",
            "dispatch",
          ],
          body: [
            p(
              "Le mode Répartition sert au travail qui n'existe pas au début de la journée : un appel entre à 14 h et quelqu'un doit le prendre. Vous ajoutez l'arrêt à une route déjà en cours de conduite et GeoCliks l'insère.",
            ),
            h("Ajouter un arrêt en direct"),
            steps(
              "Ouvrez la route active.",
              "Choisissez Ajouter un arrêt en direct.",
              "Saisissez l'adresse et les coordonnées du destinataire.",
              "Confirmez. L'arrêt est inséré dans la partie de la route que le chauffeur n'a pas encore atteinte, et apparaît sur son téléphone.",
            ),
            h("Ce qui ne bouge jamais"),
            ul(
              "Les arrêts déjà livrés, échoués ou ignorés.",
              "L'arrêt vers lequel le chauffeur roule en ce moment.",
            ),
            p(
              "Un nouvel arrêt est inséré au point le moins coûteux de la liste restante. Ce n'est délibérément pas une réoptimisation : un outil qui rebrasse le plan sous les pieds d'un chauffeur en mouvement finit par être abandonné par ceux qui l'utilisent, et réoptimiser une soirée chargée à répétition vous coûterait aussi de l'argent à chaque recalcul.",
            ),
            note(
              "L'insertion se fait localement et est gratuite, peu importe combien de fois vous la faites dans un quart.",
            ),
            warn(
              "La répartition en direct exige Delivery Pro ou supérieur. Sur un forfait limité aux routes planifiées, vous pouvez quand même ajouter des arrêts à une route avant son démarrage.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
      ],
    },
    {
      title: "Sur la route",
      articles: [
        {
          slug: "driver-run-and-proof-of-delivery",
          title: "La tournée du chauffeur et la preuve de livraison",
          summary: "Ce que voit le chauffeur, et comment un arrêt se ferme avec une preuve.",
          keywords: [
            "chauffeur",
            "tournée",
            "preuve",
            "photo",
            "signature",
            "livré",
            "hors ligne",
            "driver",
          ],
          body: [
            p(
              "Sur le téléphone, le chauffeur obtient un seul écran : l'arrêt en cours, l'adresse, le destinataire, les remarques, et combien d'arrêts il reste. Tout le reste est écarté.",
            ),
            h("Fermer un arrêt"),
            steps(
              "Touchez l'arrêt.",
              "Prenez la photo de livraison — le colis à la porte, la palette dans le quai, ce qui prouve que c'est arrivé.",
              "Confirmez ou corrigez le nom du destinataire.",
              "Recueillez une signature, si la route en demande une.",
              "Marquez l'arrêt Livré. L'arrêt suivant apparaît.",
            ),
            h("La photo n'est pas facultative"),
            p(
              "Un arrêt livré ou échoué doit être fermé avec une vraie photo provenant de votre espace de travail. Il n'existe aucun moyen de marquer un arrêt livré sans rien y joindre — c'est tout l'intérêt d'utiliser GeoCliks pour la livraison plutôt qu'une application de listes à cocher.",
            ),
            h("Hors ligne"),
            ul(
              "La tournée fonctionne sans signal. Les photos et les fermetures d'arrêts s'accumulent en file sur l'appareil.",
              "L'heure de complétion enregistrée est celle où la photo a été prise, pas celle du téléversement : une route conduite dans une zone morte se lit donc correctement.",
              "Si la file se vide deux fois, la seconde tentative est reconnue et ignorée plutôt que de fermer l'arrêt en double.",
            ),
            note(
              "Le bureau voit chaque fermeture d'arrêt à mesure qu'elle arrive : un répartiteur qui surveille la route sait où est le chauffeur sans lui téléphoner.",
            ),
            see("delivery-routes/failed-and-skipped-stops", "mobile-app/offline-capture-and-queue"),
          ],
        },
        {
          slug: "failed-and-skipped-stops",
          title: "Arrêts échoués et ignorés",
          summary:
            "Consignez pourquoi une livraison n'a pas eu lieu, d'une façon sur laquelle le bureau peut agir.",
          keywords: [
            "échoué",
            "ignoré",
            "personne à la maison",
            "refusé",
            "mauvaise adresse",
            "exception",
            "failed",
          ],
          body: [
            p(
              "Tous les arrêts ne se passent pas bien. Un arrêt échoué reste un arrêt fermé avec une preuve — c'est la trace que le chauffeur s'y est rendu et de ce qu'il y a trouvé.",
            ),
            h("Marquer un arrêt échoué"),
            steps(
              "Touchez l'arrêt et photographiez ce que le chauffeur a devant lui — la porte close, la ruelle bloquée, le mauvais bâtiment.",
              "Choisissez Échoué.",
              "Choisissez une raison.",
              "Ajoutez une note s'il y a quelque chose que le bureau doit savoir.",
              "Enregistrez.",
            ),
            h("Les raisons"),
            table(
              ["Raison", "À utiliser pour"],
              [
                ["Personne sur place", "Personne n'était disponible pour recevoir la livraison."],
                ["Refusé", "Le destinataire n'a pas voulu la prendre."],
                ["Mauvaise adresse", "L'adresse ne correspond pas au destinataire."],
                ["Fermé", "Un commerce qui était fermé."],
                [
                  "Inaccessible",
                  "Impossible d'y accéder physiquement — barrière, neige, chantier.",
                ],
                ["Autre", "Tout le reste. Écrivez-le dans la note."],
              ],
            ),
            h("Ignorer plutôt"),
            p(
              "Ignorer, c'est autre chose : le chauffeur signale qu'il n'y avait rien du tout à livrer ici. C'est la seule fermeture qui n'exige aucune photo, et elle est consignée comme telle pour que le bureau lise exactement cela dans l'historique, plutôt qu'un échec qui n'a jamais eu lieu.",
            ),
            warn(
              "Un arrêt échoué ne déclenche jamais de courriel de preuve de livraison au destinataire. Ces cas sont traités à la main par le bureau, parce qu'un joyeux «  votre colis est arrivé  » pour une livraison échouée est pire que pas de message du tout.",
            ),
            note(
              "Chaque fermeture, échec et arrêt ignoré est inscrit dans l'historique de la route avec qui l'a fait et quand, et cet historique ne peut pas être modifié.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "delivery-routes/driver-run-and-proof-of-delivery",
            ),
          ],
        },
        {
          slug: "tracking-links-and-notifications",
          title: "Liens de suivi et courriels aux destinataires",
          summary:
            "Les trois courriels qu'un destinataire peut recevoir, et exactement ce que montre la page de suivi.",
          keywords: [
            "suivi",
            "notification",
            "courriel",
            "destinataire",
            "heure d'arrivée",
            "lien",
            "confidentialité",
            "tracking",
          ],
          body: [
            p(
              "Un destinataire dont l'arrêt porte une adresse courriel peut être tenu informé automatiquement. Vous contrôlez cela route par route, et un destinataire sans adresse courriel n'est tout simplement jamais contacté.",
            ),
            h("Les trois courriels"),
            table(
              ["Courriel", "Quand il part"],
              [
                ["En route", "La route a démarré et le chauffeur est parti."],
                ["Vous êtes le prochain", "Le chauffeur est à un nombre défini de livraisons."],
                [
                  "Livré",
                  "Son arrêt est fermé. Comprend la photo de preuve et son code.",
                ],
              ],
            ),
            h("Les réglages"),
            ul(
              "Activez ou désactivez le courriel d'avertissement pour la route.",
              "Fixez combien d'arrêts à l'avance il part — un donne peu de préavis, cinq donne une large fenêtre.",
              "Activez ou désactivez le courriel de preuve de livraison.",
            ),
            h("Ce que montre la page de suivi"),
            p(
              "Chaque courriel mène à une page de suivi pour cet arrêt-là seulement, atteinte par un lien impossible à deviner. Le destinataire voit le nom de votre entreprise, sa propre adresse, combien de livraisons précèdent encore la sienne, et une fois l'arrêt fermé, la photo de preuve avec son heure et son lieu vérifiés.",
            ),
            h("Ce qu'elle ne montre volontairement pas"),
            ul(
              "Tout autre arrêt, adresse ou destinataire de la route.",
              "Le nom du chauffeur, son téléphone ou sa position en direct.",
              "Le nom de la route, ni le nombre total d'arrêts — ce qui permettrait à un concurrent de cartographier votre tournée.",
            ),
            note(
              "Chaque destinataire reçoit chaque courriel au plus une fois, et la progression du chauffeur est revérifiée juste avant l'envoi, pour que personne ne reçoive un «  vous êtes le prochain  » pour un arrêt qui vient d'être livré.",
            ),
            warn(
              "Les courriels aux destinataires ne partent que si l'envoi de courriels est configuré pour votre espace de travail. Si des destinataires signalent ne rien recevoir, c'est la première chose à vérifier.",
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
