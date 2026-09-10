import { type Category, h, note, p, see, steps, ul } from "../../types";

export const gettingStarted: Category = {
  slug: "getting-started",
  title: "Primeiros passos",
  summary: "Novo no GeoCliks? Escolha o caminho que combina com você.",
  icon: "Rocket",
  sections: [
    {
      title: "Básico",
      articles: [
        {
          slug: "what-is-geocliks",
          title: "O que é o GeoCliks?",
          summary:
            "Evidência de campo que você consegue provar: cada foto carrega hora verificada, posição GPS e endereço.",
          keywords: ["visão geral", "sobre", "produto", "introdução", "overview", "about"],
          body: [
            p(
              "O GeoCliks é uma ferramenta de documentação em foto e vídeo para equipes de campo. Você registra o trabalho no celular, e cada captura recebe a hora em que foi feita, o lugar onde foi feita e o endereço a que aquela posição corresponde. A marca é gravada na imagem e registrada separadamente, para poder ser conferida depois.",
            ),
            p(
              "O objetivo não é ter fotos mais bonitas. O objetivo é que, quando um cliente, uma seguradora ou um juiz perguntar se a foto é o que você diz que é, você tenha uma resposta que não depende da sua palavra.",
            ),
            h("O que você recebe"),
            ul(
              "Fotos e vídeos com marca d'água contendo hora verificada, coordenadas GPS e endereço.",
              "Um código da foto único em cada captura, que qualquer pessoa pode conferir sem ter conta.",
              "Teamspace: um espaço de trabalho compartilhado onde o escritório vê as capturas da equipe conforme elas sobem.",
              "Projetos, visualização em mapa, comparações antes e depois e exportações em PDF, Excel, ZIP e KMZ com um clique.",
              "Rotas de entrega: planeje o dia do motorista, mande-o para a rua e feche cada parada com uma foto de comprovação.",
            ),
            h("Quem usa"),
            ul(
              "Equipes de construção e obras documentando andamento e fechamento.",
              "Trabalhos de restauração e sinistro, em que a linha do tempo é o argumento inteiro.",
              "Equipes de utilidades, telecom e inspeção que precisam de localização em cada registro.",
              "Operações de entrega que precisam provar que a encomenda realmente chegou.",
            ),
            note(
              "O GeoCliks funciona offline. As capturas ficam na fila do aparelho e sobem sozinhas quando o sinal volta, com a hora original da captura intacta.",
            ),
            see("getting-started/create-your-account", "verify/what-is-a-photo-code"),
          ],
        },
        {
          slug: "create-your-account",
          title: "Crie sua conta",
          summary:
            "Cadastre-se no app ou na web — a mesma conta funciona em todos os lugares.",
          keywords: ["cadastro", "registrar", "conta nova", "e-mail", "sign up"],
          body: [
            p(
              "Uma conta do GeoCliks funciona no app de celular, no site e no app de computador. Crie onde for mais conveniente; cadastrar-se em outro lugar não gera uma segunda conta.",
            ),
            h("Cadastro"),
            steps(
              "Abra o app do GeoCliks, ou acesse geocliks.com e escolha criar conta.",
              "Informe seu nome, e-mail de trabalho e uma senha, ou continue com o Google.",
              "Procure na sua caixa de entrada o e-mail de verificação e abra o link.",
              "Escolha um idioma. Você pode mudar depois no seu perfil.",
            ),
            note(
              "Use seu e-mail de trabalho, não um pessoal. Quando alguém convidar você para um espaço de trabalho, o convite vai para o endereço que a pessoa conhece.",
            ),
            h("Se o e-mail de verificação não chegar"),
            ul(
              "Espere dois minutos e confira a pasta de spam ou lixo eletrônico.",
              "Confirme o endereço que você digitou — uma letra faltando é a causa mais comum.",
              "Peça um novo link na tela de entrada.",
            ),
            see("getting-started/for-solo-user", "troubleshoot/cant-sign-in"),
          ],
        },
        {
          slug: "install-the-app",
          title: "Instale o app",
          summary:
            "Tenha o GeoCliks no iPhone, iPad ou Android, e use a versão web no computador.",
          keywords: ["baixar", "ios", "android", "instalar", "computador", "download"],
          body: [
            p(
              "A captura acontece no celular ou tablet. Revisar, gerar relatórios e planejar rotas é mais fácil no computador, mas tudo está disponível nos dois.",
            ),
            h("Celular"),
            ul(
              "iPhone e iPad: instale pela App Store.",
              "Android: instale pelo Google Play.",
              "Ou abra geocliks.com/get-app no aparelho e siga o link da sua plataforma.",
            ),
            h("Computador"),
            p(
              "Acesse geocliks.com e entre na sua conta. Não há nada para instalar — o Teamspace roda no navegador. Também existe um app de computador, se você preferir uma janela separada.",
            ),
            h("Permissões que o app pede"),
            ul(
              "Câmera — obrigatória. Sem ela não há nada para capturar.",
              "Localização — obrigatória. A posição GPS é metade do que transforma uma captura em evidência.",
              "Fotos — opcional, só se você também quiser salvar as capturas na galeria.",
              "Notificações — opcional, para envios, mensagens e atribuição de rotas.",
            ),
            note(
              "Deixe a permissão de localização em 'Ao usar o app', no mínimo. Em 'Perguntar sempre', o app precisa interromper você antes de cada captura.",
            ),
            see("mobile-app/sign-in-on-mobile", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Escolha seu caminho",
      articles: [
        {
          slug: "for-solo-user",
          title: "Se você trabalha por conta própria",
          summary: "A configuração mais rápida para uma operação de uma pessoa.",
          keywords: ["autônomo", "sozinho", "freelancer", "uma pessoa", "solo"],
          body: [
            p(
              "Você não precisa de uma equipe para tirar valor do GeoCliks. Uma conta individual já dá capturas com marca d'água, projetos para separar as obras e exportações que você pode entregar ao cliente.",
            ),
            h("Configure-se em cinco minutos"),
            steps(
              "Instale o app e entre na sua conta.",
              "Crie seu primeiro projeto — normalmente o endereço da obra ou o nome do cliente.",
              "Abra o modelo de marca d'água e coloque sua logo, para as exportações terem a sua cara.",
              "Faça uma captura de teste e confira se a marca mostra a hora e o endereço certos.",
              "Exporte para PDF para ver o que o seu cliente vai receber.",
            ),
            h("O que fazer conforme o trabalho cresce"),
            ul(
              "Mantenha um projeto por obra. Isso deixa os relatórios limpos e o mapa legível.",
              "Use comparações antes e depois no começo e no fim de cada obra.",
              "Envie ao cliente um link de compartilhamento em vez de anexo de e-mail — ele fica sempre atualizado.",
            ),
            note(
              "O plano Free cobre fotos com marca d'água, vídeo de 30 segundos nos três primeiros dias e exportação em PDF de até 20 fotos. O Plus tira os limites de foto e vídeo para uma pessoa.",
            ),
            see("teamspace/create-a-project", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "for-team-owner",
          title: "Se você comanda a equipe",
          summary:
            "Crie o espaço de trabalho, convide a equipe e defina quem pode fazer o quê.",
          keywords: [
            "proprietário",
            "admin",
            "configuração",
            "espaço de trabalho",
            "gerente",
            "owner",
          ],
          body: [
            p(
              "O proprietário do espaço de trabalho configura o Teamspace uma vez e todos os outros entram nele. Faça isso no computador — é mais rápido do que no celular.",
            ),
            h("Ordem de configuração que funciona"),
            steps(
              "Crie o espaço de trabalho e dê a ele o nome da sua empresa.",
              "Monte um modelo de marca d'água com sua logo e os campos que você quer em toda foto.",
              "Crie seus projetos ativos antes de convidar alguém, para a equipe ter onde colocar as capturas.",
              "Convide a equipe por e-mail, ou compartilhe o link de entrada ou o QR code impresso.",
              "Defina o papel de cada pessoa. A maior parte da equipe deve ser Campo.",
              "Faça uma captura você mesmo e confirme que ela cai no projeto certo.",
            ),
            h("Papéis"),
            ul(
              "Proprietário — controle total, incluindo cobrança e exclusão do espaço de trabalho. Existe um só.",
              "Admin — tudo o que o proprietário faz, exceto cobrança e transferência de propriedade.",
              "Gerente — cria projetos e rotas, convida pessoas, gera relatórios.",
              "Campo — captura fotos e vídeos, executa as rotas atribuídas, vê o próprio trabalho.",
            ),
            note(
              "Convide as pessoas como Campo, a não ser que elas precisem criar projetos ou gerar relatórios. Você pode elevar um papel a qualquer momento; ele passa a valer na próxima vez que a pessoa abrir o app.",
            ),
            see("teamspace/invite-your-crew", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "for-crew-member",
          title: "Se você foi convidado para uma equipe",
          summary: "Entre no espaço de trabalho e faça sua primeira captura.",
          keywords: ["campo", "equipe", "entrar", "convidado", "membro", "field"],
          body: [
            p(
              "Alguém da sua empresa montou um espaço de trabalho e adicionou você. Seu trabalho é registrar o serviço em campo; o escritório cuida de projetos, relatórios e cobrança.",
            ),
            h("Entrar"),
            steps(
              "Abra o e-mail do convite, ou escaneie o QR code que seu gerente passar.",
              "Crie sua conta, ou entre se você já tiver uma.",
              "Instale o app do GeoCliks no seu celular.",
              "Permita câmera e localização. As duas são obrigatórias para capturar.",
              "Abra a lista de projetos e escolha a obra em que você está trabalhando.",
            ),
            h("Sua primeira captura"),
            steps(
              "Toque no botão de captura.",
              "Confira se a pré-visualização da marca d'água mostra o projeto e o endereço certos.",
              "Tire a foto. Ela sobe sozinha.",
              "Se você estiver sem sinal, siga trabalhando — as capturas ficam na fila e sobem depois.",
            ),
            note(
              "Você não pode editar a hora nem a localização de uma captura, e seu gerente também não. Isso é o ponto do produto, não uma limitação.",
            ),
            see("mobile-app/take-a-photo", "mobile-app/offline-capture-and-queue"),
          ],
        },
      ],
    },
  ],
};
