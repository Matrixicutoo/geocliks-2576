import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const troubleshoot: Category = {
  slug: "troubleshoot",
  title: "Dépannage",
  summary: "Ce qui cloche le plus souvent, et quoi vérifier en premier.",
  icon: "Wrench",
  sections: [
    {
      title: "Capture et téléversement",
      articles: [
        {
          slug: "photos-not-uploading",
          title: "Les photos ne se téléversent pas",
          summary: "Des captures immobilisées dans la file d'attente, et comment les faire repartir.",
          keywords: [
            "téléverser",
            "file d'attente",
            "bloqué",
            "en attente",
            "hors ligne",
            "synchronisation",
            "limite",
            "upload",
          ],
          body: [
            p(
              "Les captures restent sur le téléphone tant qu'elles ne sont pas téléversées. Une file d'attente est normale avec un mauvais signal — une file qui ne se vide jamais ne l'est pas.",
            ),
            h("Vérifiez dans cet ordre"),
            steps(
              "Ouvrez l'application et regardez la file de téléversement. Si des éléments y attendent, les captures sont en sécurité sur l'appareil.",
              "Trouvez un vrai signal ou un réseau Wi-Fi. Une seule barre suffit souvent pour se connecter, mais pas pour transmettre une photo.",
              "Ramenez l'application au premier plan et laissez-la ouverte une minute. Certains téléphones suspendent agressivement les transferts en arrière-plan.",
              "Vérifiez que le téléphone n'est pas en mode économie d'énergie ou économiseur de données, qui bloque les téléversements en arrière-plan.",
              "Déconnectez-vous et reconnectez-vous seulement en dernier recours — et faites-le quand la file est vide.",
            ),
            h("Si la file se vide mais que rien n'apparaît dans l'espace de travail"),
            ul(
              "Vérifiez le filtre de projet dans l'application web. Les captures sont peut-être allées dans un projet que vous ne regardez pas.",
              "Vérifiez le filtre de date. Une capture en attente se classe au jour où elle a été prise, pas aujourd'hui.",
              "Confirmez que vous regardez le bon espace de travail si vous appartenez à plus d'un.",
            ),
            h("Si vous avez atteint une limite mensuelle"),
            p(
              "Le forfait Gratuit couvre 300 captures par mois. Au-delà, les téléversements sont refusés jusqu'au début du mois suivant ou jusqu'à ce que vous passiez à un forfait sans plafond mensuel.",
            ),
            warn(
              "Ne supprimez pas l'application pendant que des captures sont en attente. Les captures déjà téléversées vivent dans votre espace de travail, mais tout ce qui attend encore sur l'appareil disparaît avec lui.",
            ),
            note(
              "L'heure de capture est enregistrée sur l'appareil : une photo téléversée deux jours plus tard porte quand même le moment où le déclencheur a été pressé, et la vérification en tient compte.",
            ),
            see("mobile-app/offline-capture-and-queue", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "gps-or-address-wrong",
          title: "La position GPS ou l'adresse est erronée",
          summary: "Pourquoi une épingle dérive, et quoi faire d'un nom de rue erroné.",
          keywords: [
            "gps",
            "position",
            "adresse",
            "précision",
            "erreur",
            "dérive",
            "permission",
            "location",
          ],
          body: [
            p(
              "GeoCliks enregistre la position rapportée par le téléphone, puis convertit cette position en adresse municipale. Les deux étapes peuvent être fautives, pour des raisons différentes.",
            ),
            h("L'épingle est au mauvais endroit"),
            ul(
              "À l'intérieur, au sous-sol, dans un stationnement souterrain ou entre de hauts édifices, la réception satellite est mauvaise et le téléphone se rabat sur une position approximative.",
              "Un téléphone qui vient d'être allumé n'a pas encore de position. Donnez-lui quinze secondes à l'extérieur avant la première capture de la journée.",
              "Chaque capture enregistre sa précision. Une grande valeur de précision, c'est le téléphone qui vous dit qu'il n'était pas certain — c'est une qualité, pas un défaut.",
            ),
            h("La position est bonne mais l'adresse est mauvaise"),
            p(
              "L'adresse est déduite des coordonnées. Dans un nouveau développement, sur un rang ou sur un grand site portant un seul numéro civique, c'est l'adresse connue la plus proche qui revient, et ce peut être le bâtiment voisin. Les coordonnées restent la donnée qui fait foi.",
            ),
            h("Il n'y a aucune position"),
            steps(
              "Ouvrez les réglages de votre téléphone et trouvez GeoCliks.",
              "Réglez la permission de localisation sur Lorsque l'app est active, ou Toujours.",
              "Sur iPhone, activez aussi la Position exacte. Sans elle, vous obtenez une zone approximative plutôt qu'une position.",
              "Reprenez la capture. Une position ne peut pas être ajoutée après coup à une capture déjà prise.",
            ),
            h("Des arrêts de livraison au mauvais endroit"),
            p(
              "La position d'un arrêt vient de la conversion de l'adresse saisie, pas d'un téléphone. Corrigez l'adresse et relancez la résolution, ou placez l'épingle à la main.",
            ),
            warn(
              "Une position ne peut être ni ajoutée ni modifiée après la capture. C'est exactement ce qui en fait une preuve — si on pouvait la corriger plus tard, elle ne prouverait rien.",
            ),
            see("delivery-routes/geocoding-and-fixing-addresses", "verify/verify-results-explained"),
          ],
        },
      ],
    },
    {
      title: "Accès",
      articles: [
        {
          slug: "cant-sign-in",
          title: "Impossible de se connecter",
          summary: "Mauvais mot de passe, courriel non confirmé, ou mauvaise méthode de connexion.",
          keywords: [
            "connexion",
            "se connecter",
            "mot de passe",
            "réinitialiser",
            "vérifier",
            "google",
            "bloqué",
            "sign in",
          ],
          body: [
            p(
              "Passez ces points dans l'ordre — la cause est presque toujours l'un des trois premiers.",
            ),
            h("Vérifiez les bases"),
            steps(
              "Confirmez l'adresse courriel. Une adresse professionnelle et une adresse personnelle sont deux comptes différents.",
              "Utilisez la même méthode qu'à l'inscription. Un compte créé avec Google n'a aucun mot de passe à saisir.",
              "Réinitialisez votre mot de passe depuis l'écran de connexion si vous avez un doute.",
              "Ouvrez le courriel de confirmation si vous n'avez jamais confirmé l'adresse — un compte non confirmé ne peut pas se connecter.",
            ),
            h("Rien n'arrive quand vous demandez une réinitialisation"),
            ul(
              "Vérifiez les pourriels et les indésirables.",
              "Attendez deux minutes. Des demandes répétées peuvent être limitées, ce qui ralentit encore les choses.",
              "Confirmez que l'adresse existe — une réinitialisation pour une adresse sans compte n'envoie rien.",
            ),
            h("On vous demande de prouver que vous êtes humain"),
            p(
              "Des tentatives échouées répétées peuvent déclencher un test. Complétez-le et poursuivez. S'il revient sans cesse, essayez une fenêtre de navigation normale plutôt qu'une fenêtre privée, et désactivez toute extension qui bloque les scripts.",
            ),
            h("Vous vous connectez, mais vous arrivez au mauvais endroit"),
            ul(
              "Si vous appartenez à plus d'un espace de travail, changez d'espace de travail depuis le menu du compte.",
              "Un membre terrain ne voit que ses projets assignés : un espace de travail qui semble vide signifie en général qu'aucun projet ne lui a encore été assigné — demandez à un admin.",
            ),
            note(
              "Être retiré d'un espace de travail ne supprime pas votre compte. Vous pouvez toujours vous connecter ; vous ne verrez simplement plus cet espace de travail.",
            ),
            see("troubleshoot/two-factor-issues", "getting-started/create-your-account"),
          ],
        },
        {
          slug: "two-factor-issues",
          title: "Problèmes de double authentification",
          summary: "Codes refusés, téléphone perdu, et comment fonctionnent les codes de secours.",
          keywords: [
            "2fa",
            "double authentification",
            "totp",
            "authentificateur",
            "codes de secours",
            "code refusé",
            "two factor",
          ],
          body: [
            p(
              "La double authentification est optionnelle et n'est offerte qu'aux propriétaires et aux admins, depuis la page de profil. Le personnel terrain n'y est volontairement pas soumis, parce qu'un téléphone de camion partagé rend l'exercice pénible.",
            ),
            h("Le code est refusé"),
            steps(
              "Vérifiez que vous lisez bien l'entrée GeoCliks dans votre application d'authentification, et non un autre service.",
              "Attendez le code suivant. Les codes changent toutes les 30 secondes et un code sur le point d'expirer est souvent refusé.",
              "Saisissez les six chiffres sans espace.",
              "Vérifiez que l'horloge du téléphone se règle automatiquement. Une horloge d'appareil décalée de quelques minutes produit des codes que le serveur n'acceptera pas.",
            ),
            h("Vous avez perdu le téléphone qui contient l'authentificateur"),
            p(
              "Utilisez l'un des codes de secours reçus au moment d'activer la double authentification. Choisissez l'option code de secours à l'écran de la deuxième étape et saisissez-en un. Chaque code ne sert qu'une fois.",
            ),
            warn(
              "Si vous avez perdu à la fois l'authentificateur et les codes de secours, nous ne pouvons pas récupérer le compte depuis l'écran de connexion. Écrivez à support@geocliks.com depuis l'adresse du compte et attendez-vous à des vérifications d'identité — cette friction est précisément le but de la double authentification.",
            ),
            h("La désactiver"),
            p(
              "Connectez-vous, ouvrez votre profil et désactivez la double authentification. On vous demandera de confirmer. Si vous êtes le propriétaire, songez à la laisser active — c'est le compte qui peut modifier la facturation et retirer des personnes.",
            ),
            note(
              "La double authentification s'applique à votre compte partout. Une fois activée, le site web comme l'application mobile demandent la deuxième étape.",
            ),
            see("troubleshoot/cant-sign-in", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "invite-not-working",
          title: "Une invitation ne fonctionne pas",
          summary: "Pas de courriel, un lien expiré, ou plus de sièges sur le forfait.",
          keywords: [
            "invitation",
            "inviter",
            "siège",
            "expiré",
            "accepter",
            "qr",
            "courriel",
            "invite",
          ],
          body: [
            p("Les problèmes d'invitation tiennent à l'adresse, aux sièges, ou au forfait."),
            h("La personne n'a jamais reçu le courriel"),
            steps(
              "Ouvrez Équipe et vérifiez la liste des invitations en attente — si l'invitation y est, elle a bien été créée.",
              "Vérifiez l'adresse pour une faute de frappe. Une invitation est liée à l'adresse exacte à laquelle elle a été envoyée.",
              "Demandez-lui de vérifier ses pourriels.",
              "Utilisez plutôt le code QR : ouvrez l'invitation en attente, affichez le code, et faites-le numériser avec son téléphone.",
            ),
            h("Elle a accepté mais ne voit rien"),
            p(
              "Les membres terrain ne voient que les projets qui leur sont assignés. Assignez-les depuis Équipe, ou depuis le projet lui-même, et cela apparaît sur leur téléphone en quelques instants.",
            ),
            h("Vous n'arrivez pas du tout à envoyer l'invitation"),
            ul(
              "Plus de sièges : les invitations en attente occupent aussi un siège. Révoquez les invitations dormantes, retirez les personnes parties, ou passez à un forfait supérieur.",
              "Teamspace non inclus : les invitations commencent au forfait Business. Gratuit et Plus sont à siège unique.",
              "Mauvais rôle : inviter exige le rôle admin ou propriétaire.",
            ),
            h("Elle a accepté avec un autre courriel"),
            p(
              "Cela ne fonctionne pas — l'invitation ne correspond qu'à l'adresse à laquelle elle a été envoyée. Révoquez-la et envoyez-en une nouvelle à l'adresse réellement utilisée.",
            ),
            note("Révoquer une invitation en attente libère son siège immédiatement."),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
      ],
    },
    {
      title: "Routes, exportations et alertes",
      articles: [
        {
          slug: "route-optimize-failed",
          title: "Une route refuse de s'optimiser",
          summary: "Le plus souvent des adresses non résolues. Parfois le forfait.",
          keywords: [
            "optimiser",
            "route",
            "échec",
            "coordonnées",
            "géocodage",
            "ordre",
            "optimize",
          ],
          body: [
            p("L'optimiseur travaille sur des positions cartographiques, pas sur des adresses saisies."),
            h("«  Aucun arrêt n'a encore de coordonnées  »"),
            steps(
              "Ouvrez la route et choisissez Résoudre les adresses.",
              "Regardez les arrêts dont la résolution a échoué.",
              "Corrigez le texte de l'adresse, ou placez l'épingle à la main sur la carte.",
              "Optimisez de nouveau.",
            ),
            h("L'optimisation a fonctionné, mais certains arrêts restent coincés à la fin"),
            p(
              "Les arrêts sans position ne peuvent pas être ordonnés : ils sont donc garés à la fin de la liste plutôt que retirés de la route. Résolvez-les ou épinglez-les, puis optimisez de nouveau.",
            ),
            h("Vous avez demandé l'optimiseur intelligent et obtenu l'optimiseur standard"),
            p(
              "Sur un forfait sans optimiseur intelligent, GeoCliks lance l'optimiseur standard plutôt que de refuser. Vous obtenez quand même une route ordonnée. L'historique de la route indique quel optimiseur a été utilisé.",
            ),
            h("L'ordre vous semble encore mauvais"),
            ul(
              "Vérifiez que l'adresse de départ est définie, et si le retour au dépôt devrait être activé.",
              "Vérifiez le temps de service — une valeur très erronée fausse chaque estimation d'arrivée.",
              "Les plages horaires sur les arrêts contraignent l'ordre, et une plage serrée l'emporte sur le chemin le plus court.",
              "Déplacez les arrêts à la main. La connaissance du terrain bat un algorithme plus souvent que les fournisseurs ne l'admettent.",
            ),
            see("delivery-routes/optimize-stop-order", "delivery-routes/geocoding-and-fixing-addresses"),
          ],
        },
        {
          slug: "export-or-report-failed",
          title: "Une exportation ou un rapport a échoué",
          summary:
            "Limites du forfait, sélections trop volumineuses, et formats non inclus.",
          keywords: [
            "exportation",
            "rapport",
            "pdf",
            "excel",
            "zip",
            "kmz",
            "échec",
            "téléchargement",
            "export",
          ],
          body: [
            p("La plupart des échecs d'exportation sont une limite de forfait plutôt qu'une panne."),
            h("Le format n'est pas offert"),
            ul(
              "Le forfait Gratuit ne produit qu'un PDF, jusqu'à 20 photos.",
              "Excel, ZIP et KMZ commencent au forfait Plus.",
              "On vous le dit avant que le fichier soit construit plutôt qu'après, donc rien n'est généré à moitié.",
            ),
            h("L'exportation est très volumineuse"),
            steps(
              "Réduisez la sélection avec le filtre de date ou de projet.",
              "Exportez par lots — un mois à la fois est plus facile à envoyer par courriel comme à construire.",
              "Pour des milliers d'originaux, préférez le ZIP au PDF. Un PDF de cette taille est de toute façon inutilisable.",
            ),
            h("Le fichier ne se télécharge jamais"),
            ul(
              "Les rapports sont construits sur le serveur puis listés dans votre liste de rapports — allez-y et téléchargez-le de nouveau plutôt que de le reconstruire.",
              "Vérifiez que le navigateur n'a pas bloqué le téléchargement, et regardez dans votre dossier de téléchargements.",
              "Essayez un autre navigateur une fois avant de signaler le problème.",
            ),
            h("Un KMZ refuse de s'ouvrir"),
            p(
              "Le KMZ demande Google Earth ou un logiciel SIG. Ce n'est pas un format de document et il ne s'ouvrira ni dans un lecteur PDF ni dans un tableur.",
            ),
            note(
              "Chaque rapport généré reste dans votre liste de rapports : vous pouvez le retélécharger plus tard sans le reconstruire.",
            ),
            see("teamspace/reports-and-exports", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "notifications-not-arriving",
          title: "Les notifications n'arrivent pas",
          summary:
            "Les notifications poussées sur le téléphone, et les courriels que les destinataires de livraison devraient recevoir.",
          keywords: [
            "notifications",
            "notification poussée",
            "courriel",
            "alertes",
            "silencieux",
            "destinataire",
            "suivi",
            "push",
          ],
          body: [
            p("Deux systèmes différents : vérifiez celui qui correspond à ce qui manque."),
            h("Les notifications poussées sur le téléphone"),
            steps(
              "Ouvrez les réglages de votre téléphone, trouvez GeoCliks, et autorisez les notifications.",
              "Vérifiez Ne pas déranger, les modes de concentration et tout horaire de nuit.",
              "Ouvrez l'application une fois en étant connecté — l'appareil s'enregistre pour les notifications à la connexion, donc un téléphone qui n'a pas ouvert l'application depuis une réinstallation n'est pas enregistré.",
              "Envoyez-vous un message depuis l'application web pour tester.",
            ),
            h("Un membre de l'équipe ne reçoit rien"),
            ul(
              "Il doit être membre de l'espace de travail et connecté sur cet appareil.",
              "Les diffusions vont aux contacts de l'espace de travail — une personne retirée de l'espace de travail cesse de les recevoir.",
              "Un téléphone hors ligne depuis plusieurs jours reçoit les notifications en attente à sa reconnexion, ou pas du tout si elles ont expiré.",
            ),
            h("Les destinataires de livraison ne reçoivent pas de courriels"),
            ul(
              "L'arrêt doit avoir une adresse courriel de destinataire. Sans elle, aucun courriel n'est possible.",
              "Les réglages de notification propres à la route contrôlent le courriel d'avertissement et celui de preuve de livraison.",
              "Les arrêts échoués n'envoient jamais de courriel de preuve de livraison — c'est voulu. Le bureau les traite à la main.",
              "Chaque destinataire reçoit chaque courriel une seule fois : un renvoi ne repartira pas deux fois.",
              "L'envoi de courriels doit être configuré pour votre espace de travail. Si aucun destinataire d'aucune route n'a jamais rien reçu, c'est la première chose à vérifier.",
            ),
            warn(
              "Demandez au destinataire de vérifier ses pourriels avant de conclure que rien n'a été envoyé. Un courriel transactionnel contenant une photo tombe dans les indésirables plus souvent qu'on ne le voudrait.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "teamspace/messages-and-broadcasts",
            ),
          ],
        },
      ],
    },
  ],
};
