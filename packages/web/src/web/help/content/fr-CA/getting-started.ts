import { type Category, h, note, p, see, steps, ul } from "../../types";

export const gettingStarted: Category = {
  slug: "getting-started",
  title: "Premiers pas",
  summary: "Nouveau sur GeoCliks? Choisissez le parcours qui correspond à votre rôle.",
  icon: "Rocket",
  sections: [
    {
      title: "Les bases",
      articles: [
        {
          slug: "what-is-geocliks",
          title: "Qu'est-ce que GeoCliks?",
          summary:
            "Des preuves de terrain démontrables : chaque photo porte une heure vérifiée, une position GPS et une adresse municipale.",
          keywords: ["aperçu", "à propos", "produit", "introduction", "overview"],
          body: [
            p(
              "GeoCliks est un outil de documentation photo et vidéo pour les équipes de terrain. Vous photographiez le travail avec un téléphone, et chaque capture est estampée de l'heure à laquelle elle a été prise, de l'endroit où elle a été prise, et de l'adresse municipale correspondant à cette position. L'estampe est incrustée dans l'image et enregistrée séparément, afin de pouvoir être vérifiée plus tard.",
            ),
            p(
              "Le but n'est pas d'avoir de plus belles photos. Le but, c'est que lorsqu'un client, un assureur ou un tribunal demande si une photo est bien ce que vous prétendez, vous ayez une réponse qui ne repose pas sur votre parole.",
            ),
            h("Ce que vous obtenez"),
            ul(
              "Des photos et vidéos filigranées avec heure vérifiée, coordonnées GPS et adresse.",
              "Un code photo unique sur chaque capture, que n'importe qui peut vérifier sans compte.",
              "Teamspace : un espace de travail partagé où le bureau voit les captures de l'équipe à mesure qu'elles se téléversent.",
              "Projets, vue carte, comparaisons avant-après, et exportations PDF, Excel, ZIP et KMZ en un clic.",
              "Tournées de livraison : planifiez la journée d'un chauffeur, envoyez-le sur la route, et fermez chaque arrêt avec une photo de preuve.",
            ),
            h("Qui l'utilise"),
            ul(
              "Les équipes de construction et de métiers qui documentent l'avancement et la clôture.",
              "La restauration après sinistre et l'assurance, où la chronologie est tout l'argument.",
              "Les services publics, les télécoms et les équipes d'inspection qui ont besoin d'une position sur chaque dossier.",
              "Les opérations de livraison qui doivent prouver qu'un colis est bel et bien arrivé.",
            ),
            note(
              "GeoCliks fonctionne hors ligne. Les captures s'accumulent sur l'appareil et se téléversent d'elles-mêmes au retour du signal, avec l'heure de capture d'origine intacte.",
            ),
            see("getting-started/create-your-account", "verify/what-is-a-photo-code"),
          ],
        },
        {
          slug: "create-your-account",
          title: "Créer votre compte",
          summary:
            "Inscrivez-vous dans l'application ou sur le web — le même compte fonctionne partout.",
          keywords: ["inscription", "s'inscrire", "nouveau compte", "courriel", "sign up"],
          body: [
            p(
              "Un seul compte GeoCliks fonctionne sur l'application mobile, le site web et l'application de bureau. Créez-le où bon vous semble; vous ne créez pas un deuxième compte en vous inscrivant à un autre endroit.",
            ),
            h("S'inscrire"),
            steps(
              "Ouvrez l'application GeoCliks, ou allez à geocliks.com et choisissez S'inscrire.",
              "Saisissez votre nom, votre courriel professionnel et un mot de passe, ou continuez avec Google.",
              "Vérifiez votre boîte de réception et ouvrez le lien du courriel de vérification.",
              "Choisissez une langue. Vous pourrez la changer plus tard depuis votre profil.",
            ),
            note(
              "Utilisez votre courriel professionnel, pas un courriel personnel. Quand quelqu'un vous invitera dans un espace de travail, il enverra l'invitation à l'adresse qu'il connaît.",
            ),
            h("Si le courriel de vérification n'arrive pas"),
            ul(
              "Attendez deux minutes et vérifiez le dossier pourriel ou indésirable.",
              "Confirmez l'adresse saisie — une lettre manquante en est la cause habituelle.",
              "Demandez un nouveau lien depuis l'écran de connexion.",
            ),
            see("getting-started/for-solo-user", "troubleshoot/cant-sign-in"),
          ],
        },
        {
          slug: "install-the-app",
          title: "Installer l'application",
          summary:
            "Obtenez GeoCliks sur iPhone, iPad ou Android, et utilisez l'application web sur un ordinateur.",
          keywords: ["télécharger", "ios", "android", "installer", "bureau", "download"],
          body: [
            p(
              "La capture se fait sur un téléphone ou une tablette. La révision, les rapports et la planification de tournées sont plus faciles sur un ordinateur, mais tout est disponible des deux côtés.",
            ),
            h("Mobile"),
            ul(
              "iPhone et iPad : installez depuis l'App Store.",
              "Android : installez depuis Google Play.",
              "Ou ouvrez geocliks.com/get-app sur l'appareil et suivez le lien de votre plateforme.",
            ),
            h("Ordinateur"),
            p(
              "Allez à geocliks.com et connectez-vous. Il n'y a rien à installer — Teamspace fonctionne dans le navigateur. Une application de bureau est aussi offerte si vous préférez une fenêtre distincte.",
            ),
            h("Les autorisations demandées par l'application"),
            ul(
              "Appareil photo — obligatoire. Sans lui, il n'y a rien à capturer.",
              "Position — obligatoire. La position GPS constitue la moitié de ce qui fait d'une capture une preuve.",
              "Photos — facultatif, seulement si vous voulez aussi enregistrer les captures dans votre pellicule.",
              "Notifications — facultatif, pour les téléversements, les messages et les assignations de tournées.",
            ),
            note(
              "Réglez l'autorisation de position à « Lorsque j'utilise l'application » au minimum. Avec « Demander chaque fois », l'application doit vous interrompre avant chaque capture.",
            ),
            see("mobile-app/sign-in-on-mobile", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Choisissez votre parcours",
      articles: [
        {
          slug: "for-solo-user",
          title: "Si vous travaillez seul",
          summary: "La configuration la plus rapide pour une entreprise d'une seule personne.",
          keywords: ["solo", "utilisateur unique", "travailleur autonome", "une personne"],
          body: [
            p(
              "Vous n'avez pas besoin d'une équipe pour tirer profit de GeoCliks. Un compte solo vous donne des captures filigranées, des projets pour séparer les chantiers, et des exportations à remettre à un client.",
            ),
            h("Configurez-vous en cinq minutes"),
            steps(
              "Installez l'application et connectez-vous.",
              "Créez votre premier projet — habituellement l'adresse du chantier ou le nom du client.",
              "Ouvrez le modèle de filigrane et ajoutez votre logo, pour que les exportations vous ressemblent.",
              "Prenez une capture d'essai et vérifiez que l'estampe affiche la bonne heure et la bonne adresse.",
              "Exportez-la en PDF pour voir ce que votre client recevra.",
            ),
            h("Quoi faire à mesure que le travail grossit"),
            ul(
              "Gardez un projet par chantier. Les rapports restent propres et la carte, lisible.",
              "Utilisez les comparaisons avant-après au début et à la fin de chaque chantier.",
              "Envoyez aux clients un lien de partage plutôt qu'une pièce jointe — il reste à jour.",
            ),
            note(
              "Le forfait Gratuit couvre les photos filigranées, la vidéo de 30 secondes pendant les trois premiers jours, et l'exportation PDF jusqu'à 20 photos. Le forfait Plus lève les limites de photos et de vidéo pour une personne.",
            ),
            see("teamspace/create-a-project", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "for-team-owner",
          title: "Si vous dirigez l'équipe",
          summary: "Créez l'espace de travail, invitez l'équipe, et décidez qui peut faire quoi.",
          keywords: [
            "propriétaire",
            "admin",
            "configuration",
            "espace de travail",
            "gestionnaire",
          ],
          body: [
            p(
              "Le propriétaire de l'espace de travail configure Teamspace une fois et tous les autres s'y joignent. Faites-le sur un ordinateur — c'est plus rapide que sur un téléphone.",
            ),
            h("Un ordre de configuration qui fonctionne"),
            steps(
              "Créez l'espace de travail et donnez-lui le nom de votre entreprise.",
              "Bâtissez un modèle de filigrane avec votre logo et les champs que vous voulez sur chaque photo.",
              "Créez vos projets actifs avant d'inviter qui que ce soit, pour que l'équipe ait où déposer ses captures.",
              "Invitez l'équipe par courriel, ou partagez le lien d'adhésion ou le code QR imprimé.",
              "Attribuez son rôle à chaque personne. La majorité de l'équipe devrait être Terrain.",
              "Prenez vous-même une capture et confirmez qu'elle aboutit dans le bon projet.",
            ),
            h("Les rôles"),
            ul(
              "Propriétaire — contrôle total, y compris la facturation et la suppression de l'espace de travail. Il n'y en a qu'un.",
              "Admin — tout ce que le propriétaire peut faire, sauf la facturation et la propriété.",
              "Gestionnaire — crée les projets et les tournées, invite des gens, produit les rapports.",
              "Terrain — capture photos et vidéos, exécute les tournées assignées, voit son propre travail.",
            ),
            note(
              "Invitez les gens comme Terrain à moins qu'ils n'aient besoin de créer des projets ou de produire des rapports. Vous pouvez rehausser un rôle en tout temps; le changement prend effet à la prochaine ouverture de l'application.",
            ),
            see("teamspace/invite-your-crew", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "for-crew-member",
          title: "Si vous avez été invité dans une équipe",
          summary: "Joignez l'espace de travail et prenez votre première capture.",
          keywords: ["terrain", "équipe", "joindre", "invité", "membre", "field"],
          body: [
            p(
              "Quelqu'un dans votre entreprise a créé un espace de travail et vous y a ajouté. Votre travail est de capturer sur le terrain; le bureau s'occupe des projets, des rapports et de la facturation.",
            ),
            h("Se joindre"),
            steps(
              "Ouvrez le courriel d'invitation, ou scannez le code QR que votre gestionnaire vous remet.",
              "Créez votre compte, ou connectez-vous si vous en avez déjà un.",
              "Installez l'application GeoCliks sur votre téléphone.",
              "Autorisez l'appareil photo et la position. Les deux sont obligatoires pour capturer.",
              "Ouvrez la liste des projets et choisissez le chantier sur lequel vous travaillez.",
            ),
            h("Votre première capture"),
            steps(
              "Touchez le bouton de capture.",
              "Vérifiez que l'aperçu du filigrane affiche le bon projet et la bonne adresse.",
              "Prenez la photo. Elle se téléverse toute seule.",
              "Si vous n'avez pas de signal, continuez à travailler — les captures s'accumulent et se téléversent plus tard.",
            ),
            note(
              "Vous ne pouvez pas modifier l'heure ni la position d'une capture, et votre gestionnaire non plus. C'est le principe même du produit, pas une limitation.",
            ),
            see("mobile-app/take-a-photo", "mobile-app/offline-capture-and-queue"),
          ],
        },
      ],
    },
  ],
};
