import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const legal: Category = {
  slug: "legal",
  title: "Confidentialité et aspects juridiques",
  summary:
    "À qui appartiennent les preuves, combien de temps elles sont conservées, et ce que disent réellement la Politique de confidentialité et les Conditions d'utilisation.",
  icon: "Scale",
  sections: [
    {
      title: "Vos données",
      articles: [
        {
          slug: "data-ownership",
          title: "À qui appartiennent vos captures",
          summary:
            "Vous gardez vos photos et vidéos. Ce que GeoCliks a le droit d'en faire, et ce qu'il n'a pas le droit d'en faire.",
          keywords: [
            "propriété",
            "posséder",
            "droits",
            "licence",
            "contenu",
            "entraînement",
            "ownership",
          ],
          body: [
            p(
              "Vous êtes propriétaire de tout ce que vous téléversez : les photos, les vidéos, les données de projet, les notes. GeoCliks les héberge et prouve qu'elles n'ont pas changé. Elles ne deviennent pas les nôtres du fait d'être téléversées.",
            ),
            h("Ce que nous avons le droit d'en faire"),
            p(
              "Les Conditions accordent à GeoCliks une licence étroite — héberger, stocker, transmettre, redimensionner, indexer et afficher vos captures — et uniquement pour que le produit fonctionne pour vous et pour les personnes avec qui vous partagez. C'est toute la portée.",
            ),
            ul(
              "Nous ne vendons pas votre contenu.",
              "Nous ne l'utilisons pas pour entraîner des modèles d'apprentissage automatique pour des tiers.",
              "Nous ne le montrons à personne avec qui vous ne l'avez pas partagé.",
            ),
            h("Le dossier appartient à l'espace de travail, pas à la personne"),
            p(
              "Les captures appartiennent à l'espace de travail où elles ont été prises, et non au membre de l'équipe qui a appuyé sur le déclencheur. C'est voulu, et c'est ce qui fait tenir le dossier de preuve :",
            ),
            ul(
              "Retirer un membre conserve toutes les photos qu'il a prises, ainsi que ses entrées dans l'historique des captures.",
              "Supprimer un projet ne supprime pas ses captures.",
              "Un membre qui part perd l'accès au contenu de l'espace de travail, mais ne l'emporte pas avec lui.",
            ),
            note(
              "Si vous êtes dans un espace de travail qui ne vous appartient pas et que vous voulez faire changer quelque chose à propos de vos captures, adressez-vous d'abord au propriétaire de l'espace. Pour ce contenu, GeoCliks agit selon les instructions de l'espace de travail.",
            ),
            h("Ce dont vous êtes responsable"),
            p(
              "Vous confirmez avoir le droit de prendre et de téléverser ce que vous téléversez — y compris toute permission requise des personnes, des propriétaires ou des exploitants de site présents dans le cadre. GeoCliks ne le vérifie pas à votre place.",
            ),
            h("Ce que le sceau prouve, et ce qu'il ne prouve pas"),
            p(
              "Le code, l'empreinte et la signature de chaque capture rendent difficile toute altération non détectée, et permettent à quiconque de vérifier qu'un fichier n'a pas changé depuis son arrivée. Ils ne font pas de GeoCliks un notaire, un arpenteur-géomètre ou un service juridique, et aucun tribunal, assureur ou client n'est tenu d'accepter le dossier. Cette décision leur revient toujours.",
            ),
            see("verify/how-sealing-works", "legal/data-retention", "legal/terms-summary"),
          ],
        },
        {
          slug: "data-retention",
          title: "Combien de temps vos données sont conservées",
          summary:
            "Ce qui survit à un projet supprimé, à un membre retiré, à un forfait annulé et à un espace de travail fermé.",
          keywords: [
            "conservation",
            "supprimer",
            "suppression",
            "garder",
            "stockage",
            "annuler",
            "fermer le compte",
            "effacer",
          ],
          body: [
            p(
              "En bref : le contenu d'un espace de travail est conservé aussi longtemps que l'espace existe. Presque rien d'autre ne le supprime.",
            ),
            table(
              ["Ce que vous faites", "Ce qui arrive aux captures"],
              [
                [
                  "Supprimer un projet",
                  "Les captures sont conservées. Le dossier de preuve n'est pas rattaché au projet.",
                ],
                [
                  "Retirer un membre",
                  "Ses photos et ses entrées d'historique restent dans l'espace de travail.",
                ],
                [
                  "Supprimer votre propre compte",
                  "Votre profil et vos identifiants disparaissent. Les captures que vous avez prises dans l'espace de travail d'une autre personne y restent.",
                ],
                [
                  "Annuler un forfait payant",
                  "Rien n'est supprimé. L'espace de travail retombe au forfait gratuit et les fonctions payantes cessent.",
                ],
                ["Fermer l'espace de travail", "Tout disparaît, et c'est irréversible."],
              ],
            ),
            h("Annuler n'est pas supprimer"),
            p(
              "Rétrograder ou annuler ne détruit jamais les captures. Vous conservez votre historique, et chaque code photo déjà remis à un client continue de fonctionner sur la page publique de vérification. Ce que vous perdez, ce sont les fonctions au-delà des limites du forfait gratuit — les sièges supplémentaires, les liens de partage, les formats d'exportation plus riches.",
            ),
            h("Fermer un espace de travail définitivement"),
            p(
              "Il n'y a pas de bouton libre-service pour supprimer un espace de travail au complet, et c'est voulu — il serait beaucoup trop facile de détruire un dossier de preuve par accident.",
            ),
            steps(
              "Le propriétaire de l'espace de travail écrit à support@geocliks.com depuis l'adresse du compte propriétaire.",
              "Exportez d'abord tout ce que vous voulez conserver — PDF, Excel, ZIP ou KMZ.",
              "Nous confirmons la demande, puis supprimons l'espace de travail et ses captures.",
            ),
            warn(
              "La suppression d'un espace de travail est permanente. Les captures, les projets, les rapports et les codes photo disparaissent tous, et chaque lien de vérification remis à un client cesse de fonctionner. Exportez d'abord.",
            ),
            h("Sauvegardes et journaux"),
            p(
              "Les sauvegardes et les journaux de sécurité sont conservés pendant une période limitée puis remplacés par rotation; une suppression peut donc prendre un certain temps avant de se propager à toutes les copies.",
            ),
            h("Demander vos propres données"),
            p(
              "Vous pouvez nous demander d'accéder à vos données personnelles, de les corriger, de les exporter ou de les supprimer. Vous pouvez modifier vous-même la plupart d'entre elles dans votre profil et vos paramètres de facturation. Pour le reste, écrivez à support@geocliks.com depuis l'adresse de votre compte.",
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
      title: "Les documents juridiques",
      articles: [
        {
          slug: "privacy-summary",
          title: "La Politique de confidentialité, en mots simples",
          summary:
            "Ce que GeoCliks recueille, pourquoi, qui d'autre y a accès, et les choix qui s'offrent à vous. Un résumé, pas un remplacement.",
          keywords: [
            "confidentialité",
            "politique",
            "rgpd",
            "données personnelles",
            "position",
            "témoins",
            "droits",
            "privacy",
          ],
          body: [
            p(
              "Voici une lecture simplifiée de la Politique de confidentialité, pour que vous sachiez ce qu'elle contient. C'est la politique elle-même qui fait foi, et elle se trouve à geocliks.com/privacy.",
            ),
            h("Ce qui est recueilli"),
            ul(
              "Données de compte : nom, courriel, une empreinte de votre mot de passe (jamais le mot de passe), photo de profil, langue, thème, et votre secret d'authentification à deux facteurs si vous l'activez.",
              "Données d'espace de travail : noms d'espaces et de projets, clients, lieux, rôles, invitations, modèles et rapports.",
              "Captures : la photo ou la vidéo, plus son horodatage, ses coordonnées, l'adresse correspondante, l'heure de capture de l'appareil, le code photo, l'empreinte du contenu et la signature.",
              "Messages : messages directs et diffusions dans l'espace de travail, y compris les images jointes.",
              "Données d'appareil : version de l'application, plateforme, adresse IP, jeton de notification, journaux d'erreurs et événements d'utilisation de base.",
              "Données de facturation : votre forfait, l'état de l'abonnement et les identifiants renvoyés par le processeur de paiement. Les numéros de carte ne nous parviennent jamais.",
            ),
            note(
              "GeoCliks ne veut pas de numéros de pièces d'identité gouvernementales, de renseignements médicaux ni d'autres catégories sensibles. Gardez-les hors des noms de projets, des notes et des messages.",
            ),
            h("Position et appareil photo"),
            p(
              "L'application demande l'appareil photo et la position parce qu'une capture, c'est une photo plus un où et un quand. Vous pouvez refuser l'une ou l'autre autorisation et l'application fonctionnera quand même — mais une capture sans position ne porte ni coordonnées ni adresse, ce qui constitue l'essentiel de sa valeur de preuve. La position est lue au moment de la capture et pour placer les repères sur votre carte. Il n'y a aucun suivi en arrière-plan.",
            ),
            h("Qui d'autre y a accès"),
            p(
              "Vos données ne sont pas vendues et ne sont jamais partagées à des fins publicitaires. Un petit nombre de fournisseurs les traitent selon nos instructions : l'hébergement et le stockage infonuagiques, le processeur de paiement (et Apple pour les achats intégrés), le fournisseur de courriel, le service de notifications poussées, et le fournisseur cartographique qui résout les adresses.",
            ),
            h("Les liens de partage sont réellement publics"),
            p(
              "Les liens de partage et les pages de vérification fonctionnent pour quiconque détient le lien, sans connexion. C'est justement leur raison d'être. Révoquer un lien empêche les accès futurs, mais ne peut pas récupérer une copie que quelqu'un a déjà téléchargée.",
            ),
            h("Vos droits"),
            p(
              "Sous réserve du droit applicable, vous pouvez demander à consulter, corriger, exporter ou supprimer vos données personnelles, restreindre certains traitements ou vous y opposer, et retirer votre consentement. Écrivez à support@geocliks.com depuis l'adresse de votre compte. Au Canada, vous pouvez aussi porter plainte auprès du Commissariat à la protection de la vie privée; dans l'EEE ou au Royaume-Uni, auprès de votre autorité de contrôle locale.",
            ),
            h("Témoins de connexion"),
            p(
              "Uniquement ce dont le produit a besoin : vous garder connecté, retenir la langue et le thème, et conserver les captures en file d'attente pendant que vous êtes hors ligne. Aucun témoin publicitaire ni de suivi intersites.",
            ),
            note(
              "La Politique de confidentialité et les Conditions d'utilisation sont publiées en anglais seulement, et c'est délibéré. La traduction automatique d'un texte juridique peut en changer le sens.",
            ),
            see("legal/data-retention", "teamspace/share-links", "legal/terms-summary"),
          ],
        },
        {
          slug: "terms-summary",
          title: "Les Conditions d'utilisation, en mots simples",
          summary:
            "Les obligations de part et d'autre, les limites que GeoCliks énonce clairement, et ce qui arrive si vous cessez de payer.",
          keywords: [
            "conditions",
            "entente",
            "responsabilité",
            "utilisation acceptable",
            "facturation",
            "sièges",
            "terms",
          ],
          body: [
            p(
              "Une lecture simplifiée des Conditions. C'est le document à geocliks.com/terms qui lie les parties; ceci est ici pour que rien ne vous surprenne.",
            ),
            h("Qui peut l'utiliser"),
            p(
              "Vous devez avoir 16 ans ou plus. Si vous vous inscrivez pour une entreprise, vous confirmez être autorisé à accepter les Conditions en son nom.",
            ),
            h("Les limites que GeoCliks énonce ouvertement"),
            p(
              "Les Conditions sont exceptionnellement directes quant à ce que le produit ne peut pas promettre, et il vaut mieux lire cette liste que de présumer :",
            ),
            ul(
              "GeoCliks n'est ni un notaire, ni un arpenteur-géomètre, ni un laboratoire, ni un service juridique, et rien de ce qu'il produit ne constitue un avis juridique.",
              "Un horodatage vérifié par le réseau signifie que notre serveur a enregistré le moment de l'arrivée du téléversement — pas que l'horloge de l'appareil était juste.",
              "Lorsque l'horloge d'un appareil diffère de la nôtre de plus de quelques minutes, la capture est plutôt marquée comme horodatée par l'appareil.",
              "La précision de la position dépend du téléphone et de son environnement; à l'intérieur et entre de hauts édifices, elle peut être nettement erronée.",
              "Les captures hors ligne ne sont scellées comme vérifiées qu'une fois parvenues à nos serveurs.",
              "Aucun tribunal, assureur, client ou autorité n'est tenu d'accepter un dossier GeoCliks.",
            ),
            h("Ce que vous vous engagez à ne pas faire"),
            ul(
              "Utiliser le Service de façon illégale, ou pour harceler, surveiller ou intimider qui que ce soit.",
              "Téléverser du contenu que vous n'avez pas le droit de téléverser.",
              "Modifier, falsifier ou retirer une estampe, une empreinte, une signature ou un code photo, ou faire passer du matériel altéré pour un dossier GeoCliks.",
              "Sonder, surcharger ou perturber le Service, ou contourner les limites de débit et les quotas de forfait.",
              "Revendre le Service, ou partager un même siège entre plusieurs personnes.",
            ),
            warn(
              "Les sièges sont par personne, pas par appareil. Un membre de l'équipe peut se connecter sur un téléphone, une tablette et le web — mais deux personnes qui partagent un identifiant enfreignent les Conditions et rendent l'historique des captures inutile, puisque chaque photo est attribuée au titulaire du siège.",
            ),
            h("Facturation"),
            p(
              "Les forfaits payants se renouvellent automatiquement jusqu'à annulation. Les abonnements web sont facturés par notre processeur de paiement; les abonnements achetés dans l'application iOS sont facturés par Apple et suivent le processus de remboursement d'Apple. Les prix excluent les taxes. Les frais déjà payés ne sont pas remboursés, sauf lorsque la loi l'exige.",
            ),
            p(
              "Si un paiement échoue ou que vous annulez, l'espace de travail passe au forfait gratuit et les fonctions payantes cessent. Vos captures restent.",
            ),
            h("Suspension"),
            p(
              "Nous pouvons suspendre ou mettre fin à l'accès en cas de manquement aux Conditions, pour un usage qui met en péril le Service ou d'autres clients, ou lorsque la loi l'exige. Lorsqu'il est raisonnable de le faire, nous vous avertissons d'abord et vous donnons l'occasion d'exporter.",
            ),
            h("Disponibilité et responsabilité"),
            p(
              "Il n'y a aucune garantie contractuelle de disponibilité, à moins que vous n'ayez signé une entente écrite distincte avec nous. Le Service est fourni tel quel, et la responsabilité totale pour toute réclamation est plafonnée au montant que vous avez payé durant les douze mois précédant sa survenance. Certaines juridictions n'autorisent pas une partie de ce qui précède; ces limites s'y appliquent alors uniquement dans la mesure permise par la loi.",
            ),
            h("Modifications"),
            p(
              "Les modifications importantes aux Conditions ou à la Politique de confidentialité sont annoncées dans l'application ou par courriel avant leur entrée en vigueur. Les questions sur l'un ou l'autre document vont à support@geocliks.com.",
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
