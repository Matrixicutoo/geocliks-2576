import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const mobileApp: Category = {
  slug: "mobile-app",
  title: "Application mobile",
  summary: "Capturez des photos et des vidéos filigranées sur iPhone, iPad ou Android.",
  icon: "Smartphone",
  sections: [
    {
      title: "La capture",
      articles: [
        {
          slug: "sign-in-on-mobile",
          title: "Se connecter sur son téléphone",
          summary:
            "Entrez dans l'application et choisissez l'espace de travail pour lequel vous capturez.",
          keywords: ["connexion", "se connecter", "espace de travail", "changer", "login"],
          body: [
            p(
              "Connectez-vous avec le même courriel et le même mot de passe que sur le site web, ou avec Google si c'est ainsi que vous vous êtes inscrit.",
            ),
            h("Si vous appartenez à plus d'un espace de travail"),
            p(
              "Vos captures vont toujours dans l'espace de travail actuellement ouvert. Vérifiez le nom de l'espace en haut de l'écran avant de commencer à capturer — une photo déposée dans le mauvais espace doit être supprimée et reprise.",
            ),
            steps(
              "Touchez votre avatar dans le coin supérieur.",
              "Choisissez l'espace de travail voulu.",
              "La liste des projets se recharge pour cet espace.",
            ),
            h("Rester connecté"),
            p(
              "L'application vous garde connecté. Elle ne vous déconnecte pas quand vous perdez le signal, et n'a pas besoin de connexion pour s'ouvrir. Si on vous redemande votre mot de passe chaque fois, c'est que votre téléphone vide le stockage de l'application en arrière-plan — vérifiez les réglages d'optimisation de la batterie.",
            ),
            see("troubleshoot/cant-sign-in", "mobile-app/offline-capture-and-queue"),
          ],
        },
        {
          slug: "take-a-photo",
          title: "Prendre une photo",
          summary: "L'action centrale : capturer, estamper, téléverser.",
          keywords: ["capture", "appareil photo", "photo", "photographier"],
          body: [
            steps(
              "Ouvrez l'application et choisissez le projet sur lequel vous travaillez.",
              "Touchez le bouton de capture.",
              "Attendez que l'indicateur de position se stabilise — quelques instants à l'extérieur suffisent habituellement.",
              "Cadrez et prenez la photo.",
              "Ajoutez une note si la photo mérite une explication. Les notes sont consultables plus tard.",
            ),
            h("Ce qui apparaît sur la photo"),
            ul(
              "La date et l'heure, validées par rapport à l'heure du réseau plutôt qu'à l'horloge du téléphone.",
              "Les coordonnées GPS.",
              "L'adresse municipale correspondant à ces coordonnées.",
              "Votre nom et le projet, si le modèle les inclut.",
              "Un code photo unique que n'importe qui peut vérifier.",
            ),
            h("Obtenir une bonne position"),
            ul(
              "Sortez à l'extérieur ou éloignez-vous de l'acier et du béton avant de capturer.",
              "Laissez quelques secondes au téléphone après l'ouverture de l'application — la première localisation est la plus lente.",
              "À l'intérieur et en sous-sol, attendez-vous à une adresse approximative. Les coordonnées sont quand même enregistrées.",
            ),
            warn(
              "Vous ne pouvez pas modifier l'heure, les coordonnées ni l'adresse d'une capture après coup. Si une photo est erronée, supprimez-la et reprenez-en une autre.",
            ),
            see("mobile-app/watermark-templates", "troubleshoot/gps-or-address-wrong"),
          ],
        },
        {
          slug: "record-a-video",
          title: "Enregistrer une vidéo",
          summary:
            "De la vidéo vérifiée avec la même estampe que les photos, jusqu'à la durée permise par votre forfait.",
          keywords: ["vidéo", "enregistrer", "clip", "filmer", "durée"],
          body: [
            p(
              "La vidéo fonctionne exactement comme la capture photo : même filigrane, même heure et même position vérifiées, même comportement de téléversement. C'est un bouton distinct sur l'écran de capture.",
            ),
            h("Durée des clips selon le forfait"),
            ul(
              "Gratuit — clips de 30 secondes, offerts pendant les trois premiers jours suivant la création de l'espace de travail.",
              "Plus — vidéo pleine durée pour une personne.",
              "Business, Crew 10, Crew 25 — clips jusqu'à 3 minutes sur chaque siège.",
              "Forfaits Livraison — clips de 3 minutes inclus.",
            ),
            h("Bien enregistrer"),
            ul(
              "Maintenez le cadrage trois bonnes secondes sur tout élément important. Un panoramique rapide rend la vidéo inutilisable comme preuve.",
              "Décrivez à voix haute ce que vous montrez. L'audio fait partie du dossier.",
              "Enregistrez des clips courts et ciblés plutôt qu'une longue visite guidée — ils se téléversent plus vite et sont bien plus faciles à retrouver.",
            ),
            note(
              "Les fichiers vidéo sont volumineux. Sur une connexion à forfait limité, laissez les clips se téléverser en Wi-Fi à la fin de la journée plutôt que sur le réseau cellulaire.",
            ),
            see("plans-billing/compare-plans", "mobile-app/photo-quality-and-storage"),
          ],
        },
        {
          slug: "offline-capture-and-queue",
          title: "Capturer sans signal",
          summary:
            "Travaillez n'importe où — les captures s'accumulent sur l'appareil et se téléversent au retour du signal.",
          keywords: [
            "hors ligne",
            "file d'attente",
            "aucun signal",
            "synchronisation",
            "téléversement",
            "sous-sol",
          ],
          body: [
            p(
              "GeoCliks est conçu pour les endroits sans couverture. Tout fonctionne hors ligne sauf le téléversement. Il n'y a aucun mode spécial à activer.",
            ),
            h("Ce qui se passe hors ligne"),
            ul(
              "L'appareil photo, le filigrane et le GPS fonctionnent normalement — le GPS n'a pas besoin de connexion de données.",
              "Chaque capture est écrite sur l'appareil avec sa véritable heure de capture.",
              "L'écran de file d'attente montre ce qui attend d'être téléversé.",
              "Dès qu'il y a une connexion, la file se vide d'elle-même en arrière-plan.",
            ),
            h("L'heure d'une capture hors ligne"),
            p(
              "L'heure enregistrée est celle où vous avez appuyé sur le bouton, pas celle où la photo a fini par se téléverser. Un téléversement tardif n'affaiblit pas le dossier.",
            ),
            warn(
              "Ne supprimez pas et ne réinstallez pas l'application pendant que des captures sont encore en file d'attente. Tout ce qui n'est pas téléversé est perdu. Vérifiez d'abord que la file est vide.",
            ),
            h("Si la file est bloquée"),
            ul(
              "Ouvrez l'application et laissez-la à l'avant-plan une minute sur une bonne connexion.",
              "Confirmez que vous êtes toujours connecté.",
              "Vérifiez que le téléphone n'est pas en mode économie de données ou d'énergie, ce qui bloque les transferts en arrière-plan.",
            ),
            see("troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "assign-capture-to-project",
          title: "Classer les captures dans le bon projet",
          summary: "Choisissez le projet avant de photographier, ou déplacez les photos après.",
          keywords: ["projet", "assigner", "déplacer", "classer", "organiser"],
          body: [
            p(
              "Chaque capture appartient à un projet. Le projet alimente les rapports, la carte et ce que voit votre client : bien le choisir évite du ménage plus tard.",
            ),
            h("Avant de capturer"),
            steps(
              "Ouvrez la liste des projets.",
              "Touchez le chantier où vous êtes. Il reste sélectionné jusqu'à ce que vous le changiez.",
              "Capturez normalement — tout se classe là.",
            ),
            h("Déplacer une capture après coup"),
            p(
              "Les gestionnaires, les admins et le propriétaire peuvent déplacer des captures d'un projet à l'autre depuis Teamspace. Déplacer une photo ne change que le projet auquel elle appartient; l'heure, la position, l'adresse et le code photo restent intacts, et le dossier de vérification se valide toujours.",
            ),
            note(
              "Si votre équipe classe constamment au mauvais chantier, la cause habituelle est une sélection de projet restée de la veille. Demandez-leur de vérifier le nom du projet sur l'écran de capture chaque matin.",
            ),
            see("teamspace/create-a-project", "teamspace/browse-and-filter-photos"),
          ],
        },
      ],
    },
    {
      title: "Filigranes et réglages",
      articles: [
        {
          slug: "watermark-templates",
          title: "Modèles de filigrane",
          summary: "Décidez ce qui apparaît sur chaque photo, et ajoutez-y votre logo.",
          keywords: [
            "filigrane",
            "modèle",
            "logo",
            "image de marque",
            "estampe",
            "champs",
            "watermark",
          ],
          body: [
            p(
              "Un modèle de filigrane est la disposition de l'estampe incrustée dans vos captures. Il se règle par espace de travail, pour que les photos de chaque membre de l'équipe sortent uniformes.",
            ),
            h("Les champs que vous pouvez afficher ou masquer"),
            ul(
              "Date et heure",
              "Coordonnées GPS",
              "Adresse municipale",
              "Nom du projet",
              "Le nom de la personne qui capture",
              "Une note libre ou un numéro de chantier",
              "Le logo de votre entreprise",
            ),
            h("Modifier le modèle"),
            steps(
              "Dans Teamspace, ouvrez Filigranes.",
              "Choisissez un modèle ou créez-en un nouveau.",
              "Activez les champs voulus et téléversez votre logo.",
              "Enregistrez. Les nouvelles captures l'utilisent immédiatement; les photos existantes conservent l'estampe avec laquelle elles ont été prises.",
            ),
            warn(
              "Modifier un modèle ne change jamais les photos déjà prises. C'est voulu — une estampe réinscriptible après coup ne serait pas une preuve.",
            ),
            h("Combien de modèles vous obtenez"),
            ul(
              "Gratuit — 2 modèles.",
              "Plus et au-dessus — tous les modèles, plus votre propre logo.",
            ),
            see("teamspace/watermark-template-library", "mobile-app/switch-template"),
          ],
        },
        {
          slug: "switch-template",
          title: "Changer de modèle sur le chantier",
          summary: "Utilisez une estampe différente pour un client ou un type de chantier précis.",
          keywords: ["changer", "changer de modèle", "par défaut", "par projet"],
          body: [
            p(
              "La plupart des équipes utilisent un seul modèle pour tout. Quand il vous en faut un autre — un client qui veut son numéro de chantier sur chaque photo, ou une inspection qui exige des champs supplémentaires — changez-le depuis l'écran de capture.",
            ),
            steps(
              "Sur l'écran de capture, touchez le nom du modèle.",
              "Choisissez le modèle voulu.",
              "Capturez. Le choix demeure jusqu'à ce que vous le changiez de nouveau.",
            ),
            note(
              "Votre espace de travail a un modèle par défaut, utilisé chaque fois que personne n'a choisi autrement. Les gestionnaires le définissent dans Teamspace, sous Filigranes.",
            ),
            see("teamspace/watermark-template-library"),
          ],
        },
        {
          slug: "photo-quality-and-storage",
          title: "Qualité photo et stockage",
          summary:
            "Équilibrez la qualité d'image avec la vitesse de téléversement et l'espace sur le téléphone.",
          keywords: ["qualité", "résolution", "stockage", "taille", "original", "données"],
          body: [
            h("Le réglage de qualité"),
            p(
              "Une qualité plus élevée signifie une meilleure preuve et des téléversements plus lents. Pour la majorité du travail de documentation, le réglage standard suffit — il reste lisible à l'impression dans un rapport. Augmentez-le quand le détail fin compte, comme des fissures capillaires ou des numéros de série.",
            ),
            h("Conserver l'original"),
            p(
              "Vous pouvez demander à l'application d'enregistrer dans votre pellicule un original sans filigrane, à côté de la version estampée. Utile quand vous avez besoin d'une image nette à d'autres fins. Cela double environ l'espace de stockage utilisé par chaque capture sur le téléphone.",
            ),
            h("Libérer de l'espace"),
            ul(
              "Les captures dont le téléversement est terminé peuvent être effacées de l'appareil — elles restent dans Teamspace.",
              "C'est la vidéo qui remplit un téléphone. Effacez d'abord les clips déjà téléversés.",
              "N'effacez jamais quoi que ce soit qui se trouve encore dans la file de téléversement.",
            ),
            see("mobile-app/offline-capture-and-queue", "mobile-app/app-settings"),
          ],
        },
        {
          slug: "notifications",
          title: "Notifications",
          summary: "Ce dont l'application vous avise, et comment la rendre plus discrète.",
          keywords: ["notifications", "poussées", "alertes", "silence", "sourdine"],
          body: [
            h("Ce que GeoCliks envoie"),
            ul(
              "Téléversement terminé, ou téléversement échoué nécessitant votre attention.",
              "Un message direct ou une diffusion de votre bureau.",
              "Une tournée qui vous est assignée, et des rappels à l'approche d'un arrêt.",
              "Les invitations et les changements de rôle.",
            ),
            h("Les réduire"),
            steps(
              "Ouvrez Réglages dans l'application.",
              "Ouvrez Notifications.",
              "Désactivez les catégories dont vous n'avez pas besoin.",
            ),
            note(
              "Si vous êtes chauffeur, laissez les notifications de tournée activées. La répartition s'en sert pour vous prévenir qu'un arrêt a été ajouté à une tournée déjà en cours.",
            ),
            see("troubleshoot/notifications-not-arriving"),
          ],
        },
        {
          slug: "app-settings",
          title: "Réglages de l'application",
          summary: "Langue, thème, grille de cadrage, son de l'obturateur et le reste.",
          keywords: ["réglages", "langue", "thème", "mode sombre", "grille", "son"],
          body: [
            h("La langue"),
            p(
              "GeoCliks est offert en 11 langues. Votre choix s'applique à cet appareil seulement : dans un même espace de travail, chaque membre d'une équipe peut donc lire l'application dans sa propre langue. Laissez le réglage sur la valeur par défaut de l'espace pour suivre ce que le bureau a choisi.",
            ),
            h("L'apparence"),
            p(
              "Les thèmes clair et sombre sont tous deux offerts. Le sombre repose les yeux dans un camion la nuit; le clair est plus lisible en plein soleil.",
            ),
            h("Les aides à la capture"),
            ul(
              "Grille de cadrage — une grille dans le viseur. Elle n'est pas incrustée dans la photo.",
              "Son de l'obturateur — désactivez-le sur les chantiers où le silence s'impose. Certains pays l'exigent par la loi et il ne peut pas y être désactivé.",
              "Enregistrer l'original — conserver une copie sans filigrane sur l'appareil.",
            ),
            h("Votre profil"),
            p(
              "Votre nom, votre photo et votre mot de passe se trouvent dans Profil. Votre nom apparaît sur les captures lorsque le modèle l'inclut : gardez-le sous la forme que votre équipe reconnaîtrait.",
            ),
            see("mobile-app/photo-quality-and-storage", "teamspace/roles-and-permissions"),
          ],
        },
      ],
    },
  ],
};
