import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const verify: Category = {
  slug: "verify",
  title: "Vérification",
  summary:
    "Chaque capture porte un code que n'importe qui peut vérifier, et un sceau qui révèle si elle a été modifiée.",
  icon: "ShieldCheck",
  sections: [
    {
      title: "Vérifier une capture",
      articles: [
        {
          slug: "what-is-a-photo-code",
          title: "Qu'est-ce qu'un code photo?",
          summary:
            "Le code court imprimé sur chaque capture, et la page publique vers laquelle il mène.",
          keywords: ["code", "code photo", "vérifier", "public", "qr", "preuve", "verify"],
          body: [
            p(
              "Chaque capture reçoit un code unique, imprimé dans le filigrane et repris dans tous les rapports et exportations. Il ressemble à ceci :",
            ),
            ul("GC-4K7P-92XB-1DQ4"),
            p(
              "Le code est la poignée qui donne accès à cette capture précise. Toute personne qui l'a en main — un client, un assureur, un expert en sinistre, un avocat — peut le rechercher sur la page publique de vérification sans compte, sans l'application, et sans rien vous demander.",
            ),
            h("Où le code apparaît"),
            ul(
              "Incrusté dans le filigrane de la photo ou de la vidéo, si votre modèle l'inclut.",
              "Sur chaque page d'un rapport PDF.",
              "Dans l'exportation Excel, une ligne par capture.",
              "Comme nom de fichier de chaque image dans une exportation ZIP.",
              "Dans le courriel de preuve de livraison envoyé au destinataire.",
            ),
            h("Pourquoi c'est important"),
            p(
              "Une photo seule ne prouve rien — n'importe qui peut y incruster une fausse heure. Un code qui mène à un dossier indépendant, hébergé sur le serveur de votre fournisseur, affichant la même heure, les mêmes coordonnées et un sceau intact, est une preuve d'une tout autre nature. La personne qui vérifie n'a pas à vous croire sur parole.",
            ),
            note(
              "Les codes s'écrivent GC-XXXX-XXXX-XXXX, mais vous pouvez les saisir en minuscules, avec des espaces, sans le préfixe, ou coller le lien de vérification au complet. Tout cela mène à la même capture. Les captures prises avant le changement de nom portent plutôt un code TM- ; elles se vérifient exactement comme avant, et les codes déjà imprimés dans vos anciens rapports continuent de fonctionner.",
            ),
            see("verify/verify-a-photo", "verify/how-sealing-works"),
          ],
        },
        {
          slug: "verify-a-photo",
          title: "Vérifier une photo",
          summary: "Comment vous ou votre client vérifiez un code, et ce que la page affiche.",
          keywords: [
            "vérifier",
            "contrôler",
            "recherche",
            "client",
            "page publique",
            "scanner",
            "verify",
          ],
          body: [
            p(
              "La vérification est publique et prend quelques secondes. Envoyez le code à un client et il peut la faire lui-même.",
            ),
            h("Vérifier un code"),
            steps(
              "Allez à geocliks.com/v et saisissez le code, ou ouvrez le lien directement.",
              "Lisez le dossier : l'espace de travail propriétaire de la capture, quand elle a été prise, où, et le résultat d'intégrité.",
              "Comparez avec le filigrane de la photo que vous avez devant vous. Tout doit correspondre exactement.",
            ),
            h("Ce que la page affiche"),
            table(
              ["Champ", "Signification"],
              [
                ["Propriétaire", "L'espace de travail auquel appartient la capture."],
                ["Capturée", "L'heure de l'appareil au moment du déclenchement."],
                [
                  "Vérifiée",
                  "L'heure du serveur à l'arrivée du fichier. Impossible à régler depuis un téléphone.",
                ],
                ["Position", "Les coordonnées, la précision et l'adresse correspondante."],
                ["Intégrité", "Si le sceau correspond toujours au fichier et aux métadonnées."],
                ["Appareil", "Le modèle et la plateforme ayant servi à la capture."],
                ["Empreinte du contenu", "L'empreinte numérique des octets de l'image."],
              ],
            ),
            h("Pourquoi l'image est parfois masquée"),
            p(
              "Le dossier est toujours public ; l'image, non. La photo n'est affichée que si votre espace de travail a publié un lien de partage actif couvrant cette capture. C'est voulu : un code qui fuite d'un rapport ne doit pas entraîner la photographie avec lui. Révoquez le lien et l'image redevient privée, alors que le dossier reste vérifiable.",
            ),
            note(
              "Les vérifications publiques sont inscrites à l'historique de la capture, vous voyez donc qu'un code a été consulté. Les chargements répétés en moins d'une demi-heure comptent pour un seul, afin qu'un client qui rafraîchit la page n'enterre pas les vrais événements.",
            ),
            see("teamspace/share-links", "verify/verify-results-explained"),
          ],
        },
        {
          slug: "verify-results-explained",
          title: "Lire le résultat",
          summary:
            "Vérifiée, non vérifiée, altérée, et ce que signifie un avertissement de décalage d'horloge.",
          keywords: [
            "vérifiée",
            "non vérifiée",
            "altérée",
            "décalage",
            "horloge",
            "résultat",
            "avertissement",
            "tampered",
          ],
          body: [
            p("Chaque capture porte l'un de trois résultats d'intégrité."),
            table(
              ["Résultat", "Signification"],
              [
                [
                  "Vérifiée",
                  "Le sceau correspond au fichier et aux métadonnées. Rien n'a changé depuis le téléversement.",
                ],
                [
                  "Non vérifiée",
                  "Le sceau n'a pas pu être confirmé. Habituellement une capture faite avec une ancienne version de l'application ou un téléversement incomplet — ce n'est pas une preuve de mauvaise foi.",
                ],
                [
                  "Altérée",
                  "Le sceau ne correspond pas. Le fichier ou ses métadonnées ont été modifiés après le téléversement.",
                ],
              ],
            ),
            h("Source de l'heure et décalage d'horloge"),
            p(
              "GeoCliks enregistre deux heures : celle de l'appareil au moment de la prise, et celle du serveur à l'arrivée du fichier. L'écart entre les deux est conservé.",
            ),
            ul(
              "En deçà d'environ cinq minutes, la source de l'heure indique réseau — normal et attendu.",
              "Au-delà, elle indique appareil, et le décalage est affiché sur le dossier.",
            ),
            p(
              "Un grand décalage n'est pas automatiquement suspect. Un téléphone resté hors ligne deux jours téléverse avec un écart bien réel, et le décalage l'explique. Ce que cela signifie, c'est que l'horloge de l'appareil et celle du serveur divergent, et le dossier le dit au lieu d'en choisir une en silence.",
            ),
            h("Expliquer un résultat à un client"),
            ul(
              "Vérifiée : le dossier est intact, et c'est précisément à cela que sert la vérification.",
              "Non vérifiée : proposez l'original depuis votre espace de travail, qui conserve son historique complet.",
              "Altérée : arrêtez-vous et regardez par où le fichier est passé. Ne le transmettez pas.",
            ),
            warn(
              "Modifier une photo hors de GeoCliks — la rogner, la compresser, la faire passer par une application de messagerie — change les octets et rompt le sceau. Envoyez l'original depuis votre espace de travail ou depuis un rapport, jamais une version qui est passée par autre chose.",
            ),
            see("verify/how-sealing-works", "troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "how-sealing-works",
          title: "Comment fonctionne le scellement",
          summary:
            "Les trois choses qu'un appareil ne peut pas falsifier seul, expliquées simplement.",
          keywords: [
            "empreinte",
            "signature",
            "hmac",
            "sha-256",
            "sceau",
            "altération",
            "sécurité",
            "hash",
          ],
          body: [
            p(
              "Vous n'avez pas besoin de cet article pour utiliser GeoCliks. Il est ici pour la personne de l'autre côté d'un litige qui veut savoir pourquoi le dossier mérite d'être cru.",
            ),
            h("1. Deux horloges, toutes deux enregistrées"),
            p(
              "L'heure de capture vient de l'appareil. L'heure de vérification est estampillée par le serveur GeoCliks à l'arrivée du fichier, et aucun réglage de téléphone ne peut l'influencer. Les deux sont conservées, avec leur écart. Changer l'horloge d'un téléphone déplace l'heure de capture et fait immédiatement apparaître un écart avec l'heure du serveur.",
            ),
            h("2. Une empreinte du fichier"),
            p(
              "Une empreinte SHA-256 des octets de l'image téléversée est conservée avec le dossier. Changez un seul pixel et l'empreinte ne correspond plus. C'est une empreinte, pas une copie — elle ne révèle rien du contenu de l'image.",
            ),
            h("3. Une signature sur l'ensemble du dossier"),
            p(
              "Le code photo, l'espace de travail propriétaire, l'utilisateur ayant capturé, l'emplacement de stockage, les deux horodatages, les coordonnées et l'empreinte du contenu sont combinés dans un ordre fixe et signés avec une clé secrète détenue uniquement par le serveur. Modifiez ensuite l'une de ces valeurs et la signature ne correspond plus, ce qui produit un résultat Altérée.",
            ),
            h("Ce que cela prouve et ne prouve pas"),
            ul(
              "Cela prouve que le fichier et ses métadonnées n'ont pas changé depuis que GeoCliks les a reçus.",
              "Cela prouve l'heure d'arrivée indépendamment de l'appareil.",
              "Cela ne prouve pas que le téléphone était pointé vers quelque chose de véridique. Aucun système ne le peut. Ce que cela élimine, c'est la possibilité de modifier discrètement le dossier après coup.",
            ),
            note(
              "La comparaison des signatures se fait en temps constant, de sorte que la vérification elle-même ne peut pas être sondée pour deviner la clé.",
            ),
            see("verify/verify-results-explained", "legal/data-ownership"),
          ],
        },
      ],
    },
  ],
};
