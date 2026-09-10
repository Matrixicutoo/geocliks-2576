import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const teamspace: Category = {
  slug: "teamspace",
  title: "Teamspace",
  summary:
    "L'espace de travail partagé où atterrissent les captures de l'équipe, et où le bureau les transforme en projets, en rapports et en liens de partage.",
  icon: "Users",
  sections: [
    {
      title: "Votre espace de travail",
      articles: [
        {
          slug: "teamspace-overview",
          title: "Aperçu du Teamspace",
          summary:
            "Ce qu'est un espace de travail, ce qui y atterrit, et qui voit quelles parties.",
          keywords: [
            "espace de travail",
            "organisation",
            "org",
            "tableau de bord",
            "partagé",
            "workspace",
          ],
          body: [
            p(
              "Un Teamspace est un espace de travail partagé, un par entreprise. Chaque photo et chaque vidéo captée par votre équipe sur le téléphone s'y téléverse, et toutes les personnes qui y ont accès voient la même bibliothèque depuis l'application web, l'application de bureau ou leur téléphone.",
            ),
            p(
              "Vous n'avez rien à déplacer à la main dans le Teamspace. Dès qu'une capture finit de se téléverser, elle y est, avec son heure vérifiée, sa position GPS et son adresse.",
            ),
            h("Ce qui vit dans un Teamspace"),
            ul(
              "La bibliothèque de photos et de vidéos, la capture la plus récente en premier.",
              "Les projets — les chantiers, les sites ou les clients sous lesquels vous regroupez les captures.",
              "Votre équipe : les membres, leurs rôles, et les projets que chacun peut voir.",
              "Les modèles de filigrane, pour que chaque téléphone marque les captures de la même façon.",
              "Les rapports et exportations que vous avez générés, et les liens de partage que vous avez remis.",
              "Les routes de livraison, si vous utilisez Livraison.",
            ),
            h("Qui voit quoi"),
            p(
              "Les propriétaires, les admins et les gestionnaires voient l'espace de travail au complet. Les membres terrain ne voient que les projets qui leur sont assignés — leurs propres captures et tout le reste sur ces projets. C'est la principale raison de classer le travail dans des projets plutôt que de le laisser en vrac.",
            ),
            note(
              "Teamspace fait partie du forfait Business et des forfaits supérieurs. Sur Gratuit et Plus, vous conservez la capture, le filigrane et la vérification au complet, mais l'espace de travail se limite à vous.",
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
          title: "Créer un projet",
          summary:
            "Regroupez les captures par chantier, site ou client pour que les filtres, les rapports et les accès de l'équipe concordent.",
          keywords: ["projet", "chantier", "site", "client", "dossier", "project"],
          body: [
            p(
              "Un projet est un contenant à captures — en général un chantier, un site ou un client. C'est à partir des projets que les rapports sont construits, c'est ce à quoi les membres terrain ont accès, et c'est ce qui sert de regroupement à la carte et à la vue avant-après.",
            ),
            h("En créer un"),
            steps(
              "Dans l'application web, ouvrez Projets et choisissez Nouveau projet.",
              "Donnez-lui un nom. C'est le seul champ obligatoire.",
              "Ajoutez au besoin un code de chantier, le nom du client, un libellé de lieu et une adresse municipale.",
              "Ajoutez une catégorie et des notes internes si votre équipe s'en sert.",
              "Enregistrez. Le projet est immédiatement offert dans le sélecteur de projet de l'application mobile.",
            ),
            h("Les champs et à quoi ils servent"),
            table(
              ["Champ", "Ce qu'il fait"],
              [
                ["Nom", "La façon dont le projet apparaît partout. Jusqu'à 90 caractères."],
                ["Code", "Votre propre numéro de chantier ou de bon de travail. Cherchable."],
                ["Client", "Pour qui le travail est fait. Utile à l'exportation."],
                ["Libellé de lieu", "Un nom parlant pour le site, comme «  Cour nord  »."],
                ["Adresse", "L'adresse du site. Sert à centrer le projet sur la carte."],
                ["Catégorie", "Votre propre regroupement, comme «  Toiture  » ou «  Inspection  »."],
                ["Notes", "Contexte interne. Jamais affiché sur un lien de partage."],
              ],
            ),
            h("Statut du projet"),
            p(
              "Chaque projet est Actif, En pause, Terminé ou Archivé. Le statut ne change rien à l'accès ni au stockage — il existe pour qu'un chantier terminé cesse d'encombrer la liste. Filtrez par statut en haut de la page Projets.",
            ),
            note(
              "Créer un projet exige le rôle gestionnaire ou supérieur. Les membres terrain peuvent capturer dans les projets qui leur sont assignés, mais ne peuvent pas en créer de nouveaux.",
            ),
            warn(
              "Chaque forfait comprend un nombre défini de projets. Si vous atteignez la limite, on vous invitera à passer à un forfait supérieur plutôt que de vous laisser créer un projet qui ne serait pas couvert.",
            ),
            see("teamspace/invite-your-crew", "mobile-app/assign-capture-to-project"),
          ],
        },
        {
          slug: "browse-and-filter-photos",
          title: "Parcourir et filtrer les photos",
          summary:
            "Réduisez des milliers de captures à la poignée dont vous avez besoin, par projet, personne, étiquette, date ou texte.",
          keywords: [
            "recherche",
            "filtre",
            "bibliothèque",
            "galerie",
            "étiquette",
            "trouver",
            "search",
          ],
          body: [
            p(
              "La bibliothèque de photos montre chaque capture de l'espace de travail, la plus récente en premier. Les filtres se cumulent — mettez-en autant que vous voulez, ils s'appliquent tous ensemble.",
            ),
            h("Les filtres"),
            ul(
              "Projet — seulement les captures assignées à ce projet.",
              "Membre — seulement les captures prises par une personne.",
              "Étiquette — général, avant, après, problème, arrivée, départ, ramassage ou livraison.",
              "Plage de dates — les captures prises entre deux dates, selon l'heure de capture et non l'heure de téléversement.",
              "Recherche — correspond à l'adresse, à la note sur la capture et au code photo.",
            ),
            h("Chercher par code photo"),
            p(
              "Si un client vous cite un code photo tiré d'un filigrane, collez-le dans la boîte de recherche. Il trouvera exactement cette capture, ce qui est plus rapide que de défiler jusqu'à la date.",
            ),
            h("Travailler avec une sélection"),
            p(
              "Sélectionnez plusieurs captures pour les déplacer dans un projet, les étiqueter, construire un rapport à partir de celles-là seulement, ou les supprimer. La suppression exige le rôle gestionnaire ou supérieur.",
            ),
            note(
              "Les filtres de date utilisent le moment où la photo a été prise. Une capture restée deux jours dans la file hors ligne se classe quand même au jour où l'équipe était sur le site.",
            ),
            see("teamspace/map-view", "teamspace/reports-and-exports", "verify/verify-a-photo"),
          ],
        },
        {
          slug: "map-view",
          title: "Vue carte",
          summary:
            "Voyez chaque capture sous forme d'épingle, et confirmez que l'équipe était là où la paperasse le prétend.",
          keywords: ["carte", "gps", "épingles", "position", "coordonnées", "map"],
          body: [
            p(
              "La vue carte place vos captures selon leur position GPS enregistrée. Elle répond à la question qu'une grille de photos ne peut pas trancher : le travail a-t-il été fait là où il devait l'être?",
            ),
            h("L'utiliser"),
            steps(
              "Ouvrez Carte depuis la navigation de l'espace de travail.",
              "Appliquez les mêmes filtres de projet, de membre, d'étiquette et de date que dans la bibliothèque.",
              "Cliquez sur une épingle pour voir la capture, son adresse et son heure exacte.",
              "Zoomez sur un regroupement pour séparer les épingles situées à quelques mètres les unes des autres.",
            ),
            h("Quand une épingle semble fausse"),
            ul(
              "À l'intérieur, au sous-sol ou entre de hauts édifices, la précision du GPS chute. L'épingle peut être à des dizaines de mètres même si la photo est authentique.",
              "L'adresse est déduite des coordonnées : une mauvaise position produit un nom de rue plausible mais faux.",
              "Les captures prises avec la permission de localisation refusée n'ont aucune épingle et n'apparaîtront pas sur la carte.",
            ),
            note(
              "Vous pouvez exporter la sélection actuelle de la carte en fichier KMZ et l'ouvrir dans Google Earth, ce que demandent souvent les services publics et les clients municipaux.",
            ),
            see("troubleshoot/gps-or-address-wrong", "teamspace/reports-and-exports"),
          ],
        },
        {
          slug: "before-after-compare",
          title: "Comparaison avant-après",
          summary:
            "Mettez deux captures côte à côte pour montrer le changement que vous avez été payé à faire.",
          keywords: ["avant", "après", "comparer", "progrès", "curseur", "before", "after"],
          body: [
            p(
              "La vue de comparaison jumelle deux captures du même projet et les affiche ensemble, chacune avec son heure vérifiée et son adresse. C'est la façon la plus rapide de démontrer un travail terminé.",
            ),
            h("La préparer"),
            steps(
              "Étiquetez la première capture Avant, dans l'application ou dans la bibliothèque web.",
              "Étiquetez Après la capture qui montre l'état final.",
              "Ouvrez le projet et choisissez la vue Avant et après.",
              "Choisissez la paire voulue s'il y en a plus d'une d'étiquetée.",
            ),
            h("Obtenir une paire propre"),
            ul(
              "Placez-vous à peu près au même endroit et tenez le téléphone à la même hauteur pour les deux prises.",
              "Cadrez un repère fixe — une porte, un poteau, un coin — dans les deux.",
              "Prenez la photo Après à la même distance ; zoomer au lieu de se déplacer change la perspective.",
            ),
            note(
              "La mise en page avant-après est l'une des mises en page de rapport : une fois la paire étiquetée, vous pouvez la mettre directement dans un PDF client.",
            ),
            see("teamspace/reports-and-exports", "mobile-app/take-a-photo"),
          ],
        },
      ],
    },
    {
      title: "Partager le travail",
      articles: [
        {
          slug: "reports-and-exports",
          title: "Rapports et exportations",
          summary:
            "Transformez un ensemble filtré de captures en PDF, en feuille Excel, en ZIP ou en KMZ.",
          keywords: [
            "pdf",
            "excel",
            "xlsx",
            "zip",
            "kmz",
            "exportation",
            "rapport",
            "téléchargement",
            "export",
          ],
          body: [
            p(
              "Un rapport est un instantané d'un ensemble de captures, dans un fichier que vous pouvez envoyer. Construisez d'abord l'ensemble avec les filtres, puis exportez — ce qui est à l'écran est ce qui se retrouve dans le fichier.",
            ),
            h("Construire un rapport"),
            steps(
              "Filtrez la bibliothèque pour ne garder que les captures voulues, ou ouvrez un projet.",
              "Choisissez Exporter, puis donnez un titre au rapport.",
              "Choisissez une mise en page : grille, détaillée, avant-après, ou carte.",
              "Choisissez un format : PDF, Excel, ZIP ou KMZ.",
              "Générez. Le fichier est construit côté serveur et apparaît dans votre liste de rapports pour être téléchargé, ou retéléchargé plus tard.",
            ),
            h("Quel format utiliser"),
            table(
              ["Format", "À utiliser pour"],
              [
                [
                  "PDF",
                  "La documentation destinée au client. Photos filigranées, mises en page et paginées.",
                ],
                [
                  "Excel",
                  "Une ligne par capture, avec heure, coordonnées, adresse, étiquette et note.",
                ],
                ["ZIP", "Les fichiers images originaux, pour les remettre à un autre système."],
                [
                  "KMZ",
                  "Ouvrir les emplacements des captures dans Google Earth ou un logiciel SIG.",
                ],
              ],
            ),
            h("Les mises en page"),
            ul(
              "Grille — beaucoup de photos par page, idéale pour le volume.",
              "Détaillée — une capture par page avec le bloc de métadonnées complet.",
              "Avant et après — les paires étiquetées côte à côte.",
              "Carte — les emplacements des captures tracés, avec un index des photos.",
            ),
            warn(
              "Les formats d'exportation dépendent de votre forfait. Le forfait Gratuit produit un PDF d'au plus 20 photos ; Excel, ZIP et KMZ commencent au forfait Plus. Si un format n'est pas couvert, on vous le dit avant que le fichier soit construit, pas après.",
            ),
            see("plans-billing/compare-plans", "troubleshoot/export-or-report-failed"),
          ],
        },
        {
          slug: "share-links",
          title: "Liens de partage",
          summary:
            "Envoyez une capture à quelqu'un qui n'a pas de compte, et reprenez le lien quand vous avez terminé.",
          keywords: [
            "partage",
            "lien",
            "url",
            "client",
            "public",
            "révoquer",
            "expiration",
            "share",
          ],
          body: [
            p(
              "Un lien de partage est une adresse web qui montre une capture — le média, son heure vérifiée, sa position GPS et son adresse — à quiconque l'ouvre. Sans compte, sans application, sans connexion.",
            ),
            h("Créer un lien"),
            steps(
              "Ouvrez la capture dans l'application web.",
              "Choisissez Partager.",
              "Fixez au besoin une expiration en jours. Laissez le champ vide pour un lien qui n'expire pas.",
              "Copiez le lien et envoyez-le.",
            ),
            h("Gérer les liens"),
            ul(
              "Chaque lien est listé dans l'espace de travail, avec sa date de création et le nombre de fois qu'il a été ouvert.",
              "Révoquez un lien à tout moment. Il cesse aussitôt de fonctionner pour tous ceux qui l'ont.",
              "Demander à partager une capture qui a déjà un lien actif vous redonne le lien existant plutôt que d'en créer un deuxième.",
            ),
            h("Ce qu'un lien de partage n'expose pas"),
            ul(
              "Vos autres captures, projets ou membres d'équipe.",
              "Les notes internes de projet.",
              "Quoi que ce soit sur votre espace de travail, votre forfait ou votre facturation.",
            ),
            warn(
              "Traitez un lien comme public. Quiconque le reçoit par transfert peut l'ouvrir tant que vous ne l'avez pas révoqué ou qu'il n'a pas expiré.",
            ),
            note(
              "Les liens de partage sont une fonction des forfaits payants. Si Partager n'est pas offert, vérifiez votre forfait.",
            ),
            see("verify/verify-a-photo", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Votre équipe",
      articles: [
        {
          slug: "invite-your-crew",
          title: "Inviter votre équipe",
          summary:
            "Ajoutez des gens par courriel ou par code QR, et placez-les sur les bons projets dès le premier jour.",
          keywords: [
            "inviter",
            "ajouter un membre",
            "siège",
            "qr",
            "intégration",
            "équipe",
            "invite",
          ],
          body: [
            p(
              "Les membres se joignent par invitation. Vous en envoyez une, la personne l'accepte, et ses captures commencent à arriver dans votre Teamspace.",
            ),
            h("Envoyer une invitation"),
            steps(
              "Ouvrez Équipe et choisissez Inviter.",
              "Saisissez son courriel professionnel.",
              "Choisissez un rôle. Terrain est le rôle par défaut et convient à la plupart des équipes.",
              "Cochez les projets auxquels la personne devrait déjà avoir accès à sa première connexion.",
              "Envoyez. Elle reçoit un courriel contenant un lien qui l'ajoute à votre espace de travail.",
            ),
            h("Inviter quelqu'un qui est à côté de vous"),
            p(
              "Chaque invitation en attente possède aussi un code QR. Affichez-le à l'écran, faites-le numériser avec la caméra du téléphone, et la personne arrive sur la page d'acceptation sans que vous ayez à taper son adresse. Pratique pour une équipe qui est sur le site avec vous.",
            ),
            h("Les sièges"),
            p(
              "Chaque forfait comprend un nombre de sièges. Une invitation en attente occupe un siège : cinq invitations pour trois sièges seront donc refusées plutôt que de laisser tout le monde accepter et dépasser le forfait. Si vous n'avez plus de sièges, révoquez une invitation qui ne sera pas acceptée, retirez un membre parti, ou passez à un forfait supérieur.",
            ),
            h("Si l'invitation n'arrive pas"),
            ul(
              "Demandez à la personne de vérifier ses pourriels, et confirmez l'adresse utilisée.",
              "Vérifiez la liste des invitations en attente — si l'invitation y est, renvoyez-la ou utilisez plutôt le code QR.",
              "Une invitation est liée à l'adresse courriel à laquelle elle a été envoyée ; accepter avec une autre adresse ne fonctionnera pas.",
            ),
            note("Inviter et retirer des membres exige le rôle admin ou supérieur."),
            see("teamspace/roles-and-permissions", "troubleshoot/invite-not-working"),
          ],
        },
        {
          slug: "roles-and-permissions",
          title: "Rôles et permissions",
          summary:
            "Propriétaire, admin, gestionnaire et terrain — ce que chacun peut faire, et qui nommer quoi.",
          keywords: [
            "rôle",
            "permission",
            "admin",
            "gestionnaire",
            "terrain",
            "accès",
            "propriétaire",
            "role",
          ],
          body: [
            p(
              "Il y a quatre rôles. Chaque membre en a exactement un, et c'est lui qui décide de ce qu'il voit et de ce qu'il peut modifier.",
            ),
            table(
              ["Rôle", "Peut faire"],
              [
                [
                  "Propriétaire",
                  "Tout, y compris la facturation et les changements de forfait. Un seul par espace de travail, et il ne peut pas être retiré.",
                ],
                [
                  "Admin",
                  "Inviter et retirer des membres, changer les rôles, gérer les projets, les modèles et les exportations.",
                ],
                [
                  "Gestionnaire",
                  "Créer et modifier des projets, supprimer des captures, envoyer des diffusions, construire des rapports. Aucune gestion des membres.",
                ],
                [
                  "Terrain",
                  "Capturer, et ne voir que les projets qui lui sont assignés. Aucun accès à l'équipe, aux invitations ni à la facturation.",
                ],
              ],
            ),
            h("Quoi donner à qui"),
            ul(
              "L'équipe sur les outils : terrain.",
              "Un contremaître ou un chef de site qui organise les chantiers : gestionnaire.",
              "Le personnel de bureau qui intègre les gens et gère la documentation client : admin.",
              "Gardez le rôle propriétaire sur la personne qui paie la facture.",
            ),
            h("Changer un rôle"),
            steps(
              "Ouvrez Équipe.",
              "Choisissez le membre.",
              "Choisissez le nouveau rôle. Il prend effet au prochain échange de son application avec le serveur.",
            ),
            h("Retirer quelqu'un"),
            p(
              "Retirer un membre lui enlève son accès. Cela ne supprime pas son travail : ses photos, ses vidéos et la piste de vérification qui les accompagne restent dans le Teamspace — c'est justement l'intérêt de garder les preuves dans un espace de travail plutôt que sur un téléphone.",
            ),
            warn(
              "Vous ne pouvez pas retirer le propriétaire de l'espace de travail, ni vous retirer vous-même. Seul le propriétaire peut retirer un autre admin, donc deux admins ne peuvent pas se retirer mutuellement.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
        {
          slug: "messages-and-broadcasts",
          title: "Messages et diffusions",
          summary:
            "Parlez à un membre de l'équipe, ou envoyez une même annonce à tout le monde d'un coup.",
          keywords: [
            "message",
            "clavardage",
            "diffusion",
            "annonce",
            "notifier",
            "notification poussée",
            "broadcast",
          ],
          body: [
            p(
              "Les messages sont des fils un à un entre des personnes du même espace de travail. Ils arrivent en notification poussée sur le téléphone, ce qui vous évite de courir après votre équipe dans une application de clavardage personnelle.",
            ),
            h("Écrire à quelqu'un"),
            steps(
              "Ouvrez Messages.",
              "Choisissez la personne parmi les contacts de votre espace de travail.",
              "Écrivez et envoyez. Vous pouvez joindre une capture récente pour bien montrer de quoi vous parlez.",
            ),
            h("Les diffusions"),
            p(
              "Une diffusion envoie le même message à tout le monde dans l'espace de travail en une fois. Il est livré comme un message normal dans le fil de chaque personne, donc les réponses vous reviennent en privé plutôt que de tourner en dispute de groupe.",
            ),
            steps(
              "Ouvrez Messages et choisissez Diffusion.",
              "Joignez au besoin un projet, pour que les gens sachent de quel chantier il s'agit.",
              "Écrivez le message et envoyez. Vous verrez à combien de personnes il est parti.",
            ),
            note(
              "Envoyer une diffusion exige le rôle gestionnaire ou supérieur. La messagerie un à un est ouverte à tout le monde dans l'espace de travail.",
            ),
            see("mobile-app/notifications", "troubleshoot/notifications-not-arriving"),
          ],
        },
      ],
    },
    {
      title: "Standards",
      articles: [
        {
          slug: "watermark-template-library",
          title: "Bibliothèque de modèles de filigrane",
          summary:
            "Définissez la marque qu'utilise chaque téléphone de l'espace de travail, pour que les captures reviennent uniformes.",
          keywords: [
            "filigrane",
            "modèle",
            "marque",
            "logo",
            "estampille",
            "par défaut",
            "watermark",
          ],
          body: [
            p(
              "Un modèle de filigrane décide de ce qui est incrusté dans le coin de chaque capture : quels champs apparaissent, où le bloc se place, et si votre logo s'y trouve. Les modèles vivent dans l'espace de travail, pas sur un appareil : ce que vous définissez ici est ce que toute l'équipe estampille.",
            ),
            h("Créer un modèle"),
            steps(
              "Ouvrez Modèles dans les réglages de l'espace de travail.",
              "Choisissez Nouveau modèle et nommez-le d'après l'usage, pas d'après le client — «  Avancement de chantier  » vieillit mieux que «  Chantier Northline  ».",
              "Cochez les champs à afficher : date et heure, coordonnées, adresse, projet, nom du membre, code photo, météo, une ligne personnalisée.",
              "Choisissez le coin et la taille, et téléversez un logo si vous en voulez un.",
              "Enregistrez.",
            ),
            h("Le modèle par défaut"),
            p(
              "Un modèle est le modèle par défaut de l'espace de travail. Les nouveaux membres le reçoivent automatiquement, et c'est celui qu'un téléphone utilise tant que personne n'en change. Changez de modèle par défaut à tout moment ; les captures existantes ne sont pas touchées.",
            ),
            h("Entretien"),
            ul(
              "Supprimer un modèle ne change rien aux captures déjà estampillées avec lui.",
              "Vous ne pouvez pas vous retrouver sans modèle par défaut — promouvoir un modèle rétrograde l'ancien dans la même opération.",
              "L'équipe peut basculer entre les modèles de l'espace de travail sur son téléphone, mais ne peut pas les modifier.",
            ),
            warn(
              "Le forfait Gratuit comprend deux modèles. Les forfaits payants vous laissent bâtir votre propre collection avec un logo.",
            ),
            see("mobile-app/watermark-templates", "mobile-app/switch-template"),
          ],
        },
      ],
    },
  ],
};
