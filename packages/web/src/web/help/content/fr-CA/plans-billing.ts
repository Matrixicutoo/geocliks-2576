import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const plansBilling: Category = {
  slug: "plans-billing",
  title: "Forfaits et facturation",
  summary: "Ce que couvre chaque forfait, comment en changer, et où trouver une facture.",
  icon: "CreditCard",
  sections: [
    {
      title: "Choisir un forfait",
      articles: [
        {
          slug: "compare-plans",
          title: "Comparer les forfaits",
          summary:
            "Ce que vous obtenez avec Gratuit, Plus, Business, Crew 10, Crew 25 et Enterprise.",
          keywords: [
            "forfaits",
            "tarifs",
            "comparer",
            "gratuit",
            "plus",
            "business",
            "crew",
            "limites",
          ],
          body: [
            p(
              "Il existe deux familles de forfaits. Les forfaits de preuve ci-dessous servent à documenter le travail. Les forfaits Livraison s'adressent aux opérations où l'on roule surtout, et font l'objet de leur propre article.",
            ),
            p(
              "Les prix courants se trouvent dans la section des tarifs de geocliks.com. Cette page couvre ce que chaque forfait permet réellement, et c'est là-dessus que les gens se font prendre.",
            ),
            h("Forfaits de preuve"),
            table(
              ["Forfait", "Pour qui", "Sièges"],
              [
                ["Gratuit", "Essayer, ou documenter à l'occasion en solo.", "1"],
                ["Plus", "Une personne à temps plein qui partage avec ses clients.", "1"],
                ["Business", "Une petite équipe avec un teamspace partagé.", "5"],
                ["Crew 10", "Une équipe en croissance.", "10"],
                ["Crew 25", "Une opération de plus grande taille.", "25"],
                ["Enterprise", "Volumes et conditions sur mesure. Parlez-nous.", "Sur mesure"],
              ],
            ),
            h("Ce qui change à mesure que vous montez"),
            table(
              ["Capacité", "À partir de"],
              [
                ["Capture vérifiée, filigranes, codes photo", "Gratuit"],
                ["Captures illimitées par mois", "Plus"],
                ["Exportations Excel, ZIP et KMZ", "Plus"],
                ["Liens de partage", "Plus"],
                ["Projets et modèles de filigrane illimités", "Plus"],
                ["Votre logo sur les filigranes", "Plus"],
                ["Clips vidéo pleine durée", "Plus"],
                ["Teamspace avec membres invités", "Business"],
                ["Rôles et accès par projet", "Business"],
              ],
            ),
            h("Le forfait Gratuit en détail"),
            ul(
              "300 captures par mois.",
              "La vidéo est limitée à des clips de 30 secondes, et seulement pendant les trois premiers jours.",
              "Trois projets, un siège, deux modèles de filigrane.",
              "Exportation PDF jusqu'à 20 photos. Pas d'Excel, de ZIP ni de KMZ.",
              "Pas de teamspace, donc aucun membre invité et aucun lien de partage.",
              "Aucune tournée de livraison.",
            ),
            note(
              "Tous les forfaits, Gratuit inclus, offrent la même vérification : les mêmes données de filigrane, le même code photo, le même sceau. La vérification n'est pas une option payante.",
            ),
            h("La livraison sur les forfaits de preuve"),
            p(
              "Plus et les forfaits supérieurs incluent une allocation mensuelle d'arrêts de livraison, ce qui vous permet de faire des tournées sans passer à un forfait Livraison : une allocation modeste sur Plus, davantage sur Business, et progressivement plus sur Crew 10 et Crew 25. Si vous roulez tous les jours, les forfaits Livraison reviennent moins cher par arrêt.",
            ),
            see("plans-billing/delivery-plans", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "delivery-plans",
          title: "Forfaits Livraison",
          summary:
            "Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 et Fleet 500 — dimensionnés selon les arrêts par mois et le nombre de chauffeurs.",
          keywords: [
            "livraison",
            "lite",
            "pro",
            "fleet",
            "arrêts",
            "chauffeurs",
            "répartition",
            "delivery",
          ],
          body: [
            p(
              "Les forfaits Livraison s'adressent aux opérations où conduire est le cœur du métier plutôt qu'une conséquence. Ils incluent tout ce que contiennent les forfaits de preuve, plus une allocation mensuelle d'arrêts nettement plus grande.",
            ),
            table(
              ["Forfait", "Arrêts par mois", "Chauffeurs", "Répartition en direct", "Optimiseur intelligent"],
              [
                ["Delivery Lite", "500", "2", "Non", "Non"],
                ["Delivery Pro", "2 000", "5", "Oui", "Oui"],
                ["Delivery Fleet", "6 000", "15", "Oui", "Oui"],
                ["Delivery Fleet 30", "12 000", "30", "Oui", "Oui"],
                ["Delivery Fleet 200", "80 000", "200", "Oui", "Oui"],
                ["Delivery Fleet 500", "200 000", "500", "Oui", "Oui"],
              ],
            ),
            h("Les deux fonctions réservées"),
            ul(
              "Répartition en direct — ajouter des arrêts à une tournée déjà en cours de route. Pro, Fleet, Fleet 30, Fleet 200 et Fleet 500.",
              "Optimiseur intelligent — ordonnancement selon le réseau routier plutôt que le solveur standard. Pro, Fleet, Fleet 30, Fleet 200 et Fleet 500. Sur les forfaits qui ne l'incluent pas, l'optimiseur standard s'exécute à la place, vous obtenez donc quand même une tournée ordonnée.",
            ),
            h("Comment en obtenir un"),
            p(
              "Tous les forfaits Delivery s'obtiennent en libre-service depuis la page de facturation : choisissez le forfait, passez par un paiement sécurisé hébergé, entrez les données de votre carte. Les nouvelles limites s'appliquent dès que c'est complété. Un forfait Delivery débute par un essai gratuit, son bouton affiche donc Essai gratuit. Si votre espace de travail est déjà sur un forfait Delivery, passer à un autre est facturé immédiatement et le bouton affiche plutôt Passer à — l'essai est une fois par espace de travail, pas une fois par forfait.",
            ),
            steps(
              "Ouvrez Facturation dans les paramètres de votre espace de travail.",
              "Choisissez le forfait Livraison qui correspond à votre volume.",
              "Complétez le paiement. Vous revenez dans GeoCliks avec l'allocation d'arrêts déjà active.",
            ),
            warn(
              "Enterprise est le seul forfait qui n'est pas en libre-service. Sa carte affiche Nous joindre plutôt qu'un bouton de paiement, et ouvre un courriel prérempli vers sales@geocliks.com. Personne n'est facturé automatiquement et rien ne change dans votre espace de travail tant que nous ne l'avons pas configuré avec vous.",
            ),
            note(
              "Seul le propriétaire de l'espace de travail peut changer de forfait. Les admins gèrent les personnes, pas l'abonnement.",
            ),
            h("Lequel convient"),
            p(
              "Comptez les arrêts que vous livrez réellement dans un mois normal, puis ajoutez un peu de marge pour votre semaine la plus chargée. Dépasser l'allocation bloque la création de tournées jusqu'au mois suivant : le forfait doit donc couvrir votre pointe, pas votre moyenne.",
            ),
            note(
              "Les arrêts sont comptés par mois civil et remis à zéro le premier du mois. Un arrêt compte dès qu'il est ajouté à une tournée, qu'il finisse livré ou non.",
            ),
            see("delivery-routes/delivery-overview", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Gérer votre abonnement",
      articles: [
        {
          slug: "upgrade-or-change-plan",
          title: "Mettre à niveau ou changer de forfait",
          summary:
            "Changez de forfait depuis la page de facturation — c'est le propriétaire qui le fait.",
          keywords: [
            "mettre à niveau",
            "changer de forfait",
            "paiement",
            "rétrograder",
            "basculer",
          ],
          body: [
            p(
              "Les forfaits se changent depuis Facturation, dans les paramètres de votre espace de travail. Seul le propriétaire de l'espace peut le faire — les admins gèrent les personnes, pas l'abonnement.",
            ),
            h("Changer de forfait"),
            steps(
              "Ouvrez Facturation.",
              "Choisissez le forfait voulu.",
              "Pour un forfait payant en libre-service, vous êtes dirigé vers un paiement sécurisé hébergé pour saisir les informations de carte, puis ramené à GeoCliks une fois terminé.",
              "Pour Enterprise, vous obtenez plutôt un courriel prérempli vers notre équipe.",
              "Les nouvelles limites s'appliquent dès que le changement est enregistré.",
            ),
            h("Passer à un forfait plus grand"),
            ul(
              "Les nouvelles limites prennent effet immédiatement.",
              "Rien de ce que vous avez déjà capturé n'est touché.",
              "Les sièges supplémentaires deviennent disponibles tout de suite, vous pouvez donc inviter des gens juste après.",
            ),
            h("Descendre d'un cran"),
            p(
              "Une rétrogradation est refusée tant que votre espace de travail est plus grand que le forfait visé. Si vous avez huit membres et passez à un forfait de cinq sièges, on vous demandera de retirer des membres d'abord. C'est voulu — l'autre option serait de couper l'accès à trois personnes en silence.",
            ),
            note(
              "Choisir le forfait Gratuit, ou rechoisir le forfait sur lequel vous êtes déjà, ne passe pas du tout par le paiement.",
            ),
            see("plans-billing/seats-and-billing", "plans-billing/cancel-or-downgrade"),
          ],
        },
        {
          slug: "seats-and-billing",
          title: "Les sièges",
          summary:
            "Ce qu'est un siège, ce qui en consomme un, et quoi faire quand vous n'en avez plus.",
          keywords: ["sièges", "membres", "inviter", "limite", "capacité", "utilisateurs"],
          body: [
            p(
              "Un siège, c'est une personne qui peut se connecter à votre espace de travail. Votre forfait en inclut un nombre fixe, et le propriétaire en occupe un.",
            ),
            h("Ce qui consomme un siège"),
            ul(
              "Chaque membre de l'espace de travail, quel que soit son rôle. Un membre Terrain coûte le même siège qu'un admin.",
              "Chaque invitation en attente, jusqu'à ce qu'elle soit acceptée ou révoquée.",
            ),
            p(
              "Les invitations en attente retiennent un siège volontairement. Autrement, dix invitations pourraient être émises contre deux sièges, et tous ceux qui accepteraient dépasseraient le forfait.",
            ),
            h("Plus de sièges disponibles"),
            steps(
              "Ouvrez Équipe et regardez les invitations en attente. Révoquez celles qui ne seront pas acceptées.",
              "Retirez les membres qui sont partis. Leurs captures et leur historique restent dans l'espace de travail.",
              "Si vous avez véritablement besoin de plus de personnes, montez d'un forfait.",
            ),
            note(
              "Retirer un membre libère son siège immédiatement et ne supprime jamais son travail.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "payment-and-invoices",
          title: "Paiement et factures",
          summary:
            "Où sont conservées les informations de carte, comment les mettre à jour, et où obtenir un reçu.",
          keywords: [
            "facture",
            "reçu",
            "carte",
            "paiement",
            "tps",
            "tvq",
            "taxes",
            "portail de facturation",
          ],
          body: [
            p(
              "Les paiements sont traités par notre processeur de paiement, pas par GeoCliks. Votre numéro de carte n'est jamais conservé sur nos serveurs.",
            ),
            h("Mettre à jour une carte"),
            steps(
              "Ouvrez Facturation dans les paramètres de votre espace de travail.",
              "Ouvrez le portail de facturation.",
              "Mettez-y à jour le mode de paiement.",
            ),
            h("Factures et reçus"),
            ul(
              "Chaque paiement produit une facture, disponible dans le portail de facturation.",
              "Les factures sont envoyées à l'adresse de facturation de l'abonnement, qui n'est pas toujours le courriel de connexion du propriétaire — vérifiez-la si les reçus aboutissent à la mauvaise personne.",
              "Ajoutez le nom de votre entreprise et vos renseignements fiscaux dans le portail; ils apparaîtront sur les factures suivantes.",
            ),
            h("Un paiement qui a échoué"),
            p(
              "Le processeur réessaie un paiement échoué avant que quoi que ce soit ne change dans votre espace de travail. Si l'échec persiste, votre espace retombe aux limites du forfait Gratuit — vos captures ne sont pas supprimées, mais les exportations, les liens de partage et le teamspace cessent de fonctionner jusqu'à ce qu'un paiement passe.",
            ),
            warn(
              "Si votre espace de travail est sur un forfait que nous avons configuré à la main pour vous, il se peut qu'aucun portail libre-service n'existe. Écrivez à support@geocliks.com et nous réglerons la facture.",
            ),
            see("plans-billing/cancel-or-downgrade", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "cancel-or-downgrade",
          title: "Annuler ou rétrograder",
          summary: "Comment cesser de payer, et exactement ce qui arrive à vos preuves.",
          keywords: [
            "annuler",
            "rétrograder",
            "supprimer",
            "remboursement",
            "exporter",
            "quitter",
            "données",
          ],
          body: [
            p(
              "Vous pouvez cesser de payer quand vous voulez. La vraie question, c'est ce qui arrive au travail accompli, alors voici la réponse sans détour.",
            ),
            h("Annuler"),
            steps(
              "Exportez d'abord tout ce dont vous aurez besoin à l'extérieur de GeoCliks. Faites-le avant d'annuler, car les formats d'exportation sont limités sur le forfait Gratuit.",
              "Réduisez votre espace de travail à la taille du forfait visé, si vous descendez vers moins de sièges.",
              "Ouvrez Facturation et passez au forfait Gratuit, ou annulez dans le portail de facturation.",
            ),
            h("Ce qui arrive à vos données"),
            ul(
              "Vos captures ne sont pas supprimées lorsque vous rétrogradez ou annulez.",
              "La vérification continue de fonctionner. Les codes photo mènent toujours au bon dossier et les sceaux se valident toujours.",
              "Les fonctions payantes cessent : exportations Excel, ZIP et KMZ, liens de partage, teamspace et tournées de livraison.",
              "Les liens de partage existants cessent de fonctionner tant que votre forfait ne les inclut pas.",
              "Les membres au-delà du nouveau nombre de sièges perdent l'accès, et c'est pourquoi une rétrogradation vous demande de les retirer d'abord.",
            ),
            warn(
              "Exportez avant d'annuler, pas après. Sur le forfait Gratuit, vous êtes limité à un PDF d'un maximum de 20 photos, ce qui n'est pas une façon de sortir une année de travail.",
            ),
            h("Supprimer l'espace de travail au complet"),
            p(
              "Annuler n'est pas supprimer. Si vous voulez que l'espace de travail et ses fichiers soient retirés pour de bon, écrivez à support@geocliks.com depuis l'adresse du propriétaire et demandez la suppression. C'est irréversible et nous confirmerons avant de procéder.",
            ),
            see("legal/data-retention", "teamspace/reports-and-exports"),
          ],
        },
      ],
    },
  ],
};
