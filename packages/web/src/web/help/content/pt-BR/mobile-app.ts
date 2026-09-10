import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const mobileApp: Category = {
  slug: "mobile-app",
  title: "App de celular",
  summary:
    "Registre fotos e vídeos com marca d'água no iPhone, iPad ou Android.",
  icon: "Smartphone",
  sections: [
    {
      title: "Captura",
      articles: [
        {
          slug: "sign-in-on-mobile",
          title: "Entrar no celular",
          summary:
            "Acesse o app e escolha o espaço de trabalho para o qual você está capturando.",
          keywords: ["login", "entrar", "espaço de trabalho", "trocar", "sign in"],
          body: [
            p(
              "Entre com o mesmo e-mail e senha que você usa no site, ou com o Google, se foi assim que você se cadastrou.",
            ),
            h("Se você faz parte de mais de um espaço de trabalho"),
            p(
              "Suas capturas sempre vão para o espaço de trabalho que está aberto. Confira o nome do espaço de trabalho no topo da tela antes de começar a capturar — uma foto arquivada no espaço de trabalho errado tem de ser excluída e refeita.",
            ),
            steps(
              "Toque no seu avatar no canto superior.",
              "Escolha o espaço de trabalho que você quer.",
              "A lista de projetos recarrega para aquele espaço de trabalho.",
            ),
            h("Continuar conectado"),
            p(
              "O app mantém você conectado. Ele não desconecta você quando o sinal cai e não precisa de conexão para abrir. Se estiver pedindo sua senha toda vez, o seu celular está limpando o armazenamento do app em segundo plano — confira as configurações de otimização de bateria.",
            ),
            see("troubleshoot/cant-sign-in", "mobile-app/offline-capture-and-queue"),
          ],
        },
        {
          slug: "take-a-photo",
          title: "Tirar uma foto",
          summary: "A ação principal: capturar, marcar, enviar.",
          keywords: ["captura", "câmera", "foto", "fotografar", "capture"],
          body: [
            steps(
              "Abra o app e escolha o projeto em que você está trabalhando.",
              "Toque no botão de captura.",
              "Espere o indicador de localização estabilizar — um instante em área aberta costuma bastar.",
              "Enquadre e tire a foto.",
              "Adicione uma anotação se a foto precisar de explicação. As anotações são pesquisáveis depois.",
            ),
            h("O que fica na foto"),
            ul(
              "Data e hora, conferidas contra a hora da rede em vez do relógio do celular.",
              "Coordenadas GPS.",
              "O endereço a que essas coordenadas correspondem.",
              "Seu nome e o projeto, se o modelo incluir isso.",
              "Um código da foto único, que qualquer pessoa pode verificar.",
            ),
            h("Conseguir uma boa posição"),
            ul(
              "Saia para fora ou afaste-se de aço e concreto antes de capturar.",
              "Dê alguns segundos ao celular depois de abrir o app — a primeira leitura é a mais lenta.",
              "Em ambientes fechados e no subsolo, espere um endereço aproximado. As coordenadas continuam sendo registradas.",
            ),
            warn(
              "Você não pode mudar a hora, as coordenadas nem o endereço de uma captura depois do fato. Se uma foto está errada, exclua e faça outra.",
            ),
            see("mobile-app/watermark-templates", "troubleshoot/gps-or-address-wrong"),
          ],
        },
        {
          slug: "record-a-video",
          title: "Gravar um vídeo",
          summary:
            "Vídeo verificado com a mesma marca das fotos, até o limite de duração do seu plano.",
          keywords: ["vídeo", "gravar", "clipe", "duração", "video"],
          body: [
            p(
              "O vídeo funciona exatamente como a captura de foto: mesma marca d'água, mesma hora e posição verificadas, mesmo comportamento de envio. É um botão separado na tela de captura.",
            ),
            h("Duração do clipe por plano"),
            ul(
              "Free — clipes de 30 segundos, disponíveis nos três primeiros dias após a criação do espaço de trabalho.",
              "Plus — vídeo sem limite de duração para uma pessoa.",
              "Business, Crew 10, Crew 25 — clipes de até 3 minutos em todos os assentos.",
              "Planos de entrega — clipes de 3 minutos incluídos.",
            ),
            h("Gravar bem"),
            ul(
              "Mantenha a câmera parada por três segundos inteiros em qualquer coisa importante. Girar rápido torna o vídeo inútil como evidência.",
              "Narre o que você está mostrando. O áudio faz parte do registro.",
              "Grave clipes curtos e objetivos em vez de uma caminhada longa — eles sobem mais rápido e são muito mais fáceis de achar depois.",
            ),
            note(
              "Arquivos de vídeo são grandes. Em uma conexão limitada, deixe os clipes subirem no Wi-Fi no fim do dia em vez de usar dados móveis.",
            ),
            see("plans-billing/compare-plans", "mobile-app/photo-quality-and-storage"),
          ],
        },
        {
          slug: "offline-capture-and-queue",
          title: "Capturar sem sinal",
          summary:
            "Trabalhe em qualquer lugar — as capturas ficam na fila do aparelho e sobem quando o sinal volta.",
          keywords: [
            "offline",
            "fila",
            "sem sinal",
            "sincronizar",
            "envio",
            "subsolo",
            "queue",
          ],
          body: [
            p(
              "O GeoCliks foi feito para lugares sem cobertura. Tudo funciona offline, menos o envio. Não existe modo especial para ativar.",
            ),
            h("O que acontece offline"),
            ul(
              "A câmera, a marca d'água e o GPS funcionam normalmente — o GPS não precisa de conexão de dados.",
              "Cada captura é gravada no aparelho com a hora real da captura.",
              "A tela da fila mostra o que está esperando para subir.",
              "Assim que houver conexão, a fila se esvazia sozinha em segundo plano.",
            ),
            h("A hora de uma captura offline"),
            p(
              "A hora registrada é a de quando você apertou o botão, não a de quando a foto finalmente subiu. Subir com atraso não enfraquece o registro.",
            ),
            warn(
              "Não exclua e reinstale o app enquanto houver capturas na fila. Tudo o que ainda não subiu é perdido. Confira primeiro se a fila está vazia.",
            ),
            h("Se a fila travar"),
            ul(
              "Abra o app e deixe-o em primeiro plano por um minuto em uma conexão boa.",
              "Confirme que você continua conectado.",
              "Verifique se o celular não está em modo de economia de dados ou de bateria, que bloqueia transferências em segundo plano.",
            ),
            see("troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "assign-capture-to-project",
          title: "Coloque as capturas no projeto certo",
          summary: "Escolha o projeto antes de fotografar, ou mova as fotos depois.",
          keywords: ["projeto", "atribuir", "mover", "arquivar", "organizar", "project"],
          body: [
            p(
              "Cada captura pertence a um projeto. O projeto alimenta os relatórios, o mapa e o que o seu cliente vê, então acertar isso economiza limpeza depois.",
            ),
            h("Antes de capturar"),
            steps(
              "Abra a lista de projetos.",
              "Toque na obra em que você está. Ela fica selecionada até você mudar.",
              "Capture normalmente — tudo se arquiva ali.",
            ),
            h("Mover uma captura depois"),
            p(
              "Gerentes, admins e o proprietário podem mover capturas entre projetos pelo Teamspace. Mover uma foto muda apenas o projeto a que ela pertence; a hora, a posição, o endereço e o código da foto ficam intocados, e o registro de verificação continua conferindo.",
            ),
            note(
              "Se a sua equipe continua arquivando na obra errada, a causa costuma ser uma seleção de projeto antiga, do dia anterior. Peça a eles que confiram o nome do projeto na tela de captura toda manhã.",
            ),
            see("teamspace/create-a-project", "teamspace/browse-and-filter-photos"),
          ],
        },
      ],
    },
    {
      title: "Marcas d'água e configurações",
      articles: [
        {
          slug: "watermark-templates",
          title: "Modelos de marca d'água",
          summary: "Defina o que aparece em toda foto e coloque a sua logo nela.",
          keywords: [
            "marca d'água",
            "modelo",
            "logo",
            "marca",
            "campos",
            "watermark",
            "template",
          ],
          body: [
            p(
              "Um modelo de marca d'água é o layout da marca gravada nas suas capturas. Ele é definido por espaço de trabalho, então as fotos de todos os membros da equipe saem consistentes.",
            ),
            h("Campos que você pode mostrar ou esconder"),
            ul(
              "Data e hora",
              "Coordenadas GPS",
              "Endereço",
              "Nome do projeto",
              "O nome da pessoa que está capturando",
              "Um texto livre ou número da obra",
              "A logo da sua empresa",
            ),
            h("Editar o modelo"),
            steps(
              "No Teamspace, abra Marcas d'água.",
              "Escolha um modelo ou crie um novo.",
              "Ative os campos que você quer e envie sua logo.",
              "Salve. As novas capturas já usam o modelo; as fotos existentes mantêm a marca com que foram feitas.",
            ),
            warn(
              "Mudar um modelo nunca muda fotos já feitas. Isso é proposital — uma marca que pudesse ser reescrita depois não seria evidência.",
            ),
            h("Quantos modelos você tem"),
            ul("Free — 2 modelos.", "Plus e acima — todos os modelos mais a sua própria logo."),
            see("teamspace/watermark-template-library", "mobile-app/switch-template"),
          ],
        },
        {
          slug: "switch-template",
          title: "Trocar de modelo na obra",
          summary: "Use uma marca diferente para um cliente ou um tipo de serviço.",
          keywords: [
            "trocar",
            "mudar modelo",
            "padrão",
            "por projeto",
            "switch",
            "template",
          ],
          body: [
            p(
              "A maioria das equipes usa um modelo para tudo. Quando você precisa de outro — um cliente que quer o próprio número de obra em toda foto, ou uma inspeção que exige campos extras — troque na tela de captura.",
            ),
            steps(
              "Na tela de captura, toque no nome do modelo.",
              "Escolha o modelo que você quer.",
              "Capture. A escolha permanece até você voltar atrás.",
            ),
            note(
              "Seu espaço de trabalho tem um modelo padrão, usado sempre que ninguém escolheu outro. Os gerentes definem o padrão no Teamspace, em Marcas d'água.",
            ),
            see("teamspace/watermark-template-library"),
          ],
        },
        {
          slug: "photo-quality-and-storage",
          title: "Qualidade da foto e armazenamento",
          summary:
            "Equilibre qualidade de imagem com velocidade de envio e espaço no celular.",
          keywords: [
            "qualidade",
            "resolução",
            "armazenamento",
            "tamanho",
            "original",
            "dados",
            "quality",
          ],
          body: [
            h("Configuração de qualidade"),
            p(
              "Mais qualidade significa evidência melhor e envios mais lentos. Para a maior parte do trabalho de documentação, a configuração padrão basta — ela continua legível quando impressa em um relatório. Aumente quando o detalhe fino importa, como fissuras finas ou números de série.",
            ),
            h("Guardar o original"),
            p(
              "Você pode fazer o app salvar na galeria um original sem marca d'água, ao lado da versão marcada. Útil quando você precisa de uma imagem limpa para outra finalidade. Isso praticamente dobra o espaço que cada captura ocupa no celular.",
            ),
            h("Liberar espaço"),
            ul(
              "As capturas que terminaram de subir podem ser apagadas do aparelho — elas ficam no Teamspace.",
              "É o vídeo que enche um celular. Apague primeiro os clipes já enviados.",
              "Nunca apague nada que ainda esteja na fila de envio.",
            ),
            see("mobile-app/offline-capture-and-queue", "mobile-app/app-settings"),
          ],
        },
        {
          slug: "notifications",
          title: "Notificações",
          summary: "Sobre o que o app avisa, e como deixá-lo mais quieto.",
          keywords: ["notificações", "push", "alertas", "silenciar", "notifications"],
          body: [
            h("O que o GeoCliks envia"),
            ul(
              "Envio concluído, ou envio falhou e precisa da sua atenção.",
              "Uma mensagem direta ou um comunicado do seu escritório.",
              "Uma rota atribuída a você, e avisos conforme você se aproxima de uma parada.",
              "Convites e mudanças de papel.",
            ),
            h("Reduzir as notificações"),
            steps(
              "Abra Configurações no app.",
              "Abra Notificações.",
              "Desative as categorias de que você não precisa.",
            ),
            note(
              "Se você é motorista, deixe as notificações de rota ativas. O despacho usa elas para avisar quando uma parada foi adicionada a um trajeto já em andamento.",
            ),
            see("troubleshoot/notifications-not-arriving"),
          ],
        },
        {
          slug: "app-settings",
          title: "Configurações do app",
          summary: "Idioma, tema, linhas de grade, som do disparo e o resto.",
          keywords: [
            "configurações",
            "idioma",
            "tema",
            "modo escuro",
            "linhas de grade",
            "som",
            "settings",
          ],
          body: [
            h("Idioma"),
            p(
              "O GeoCliks está disponível em 11 idiomas. Sua escolha vale só para este aparelho, então cada pessoa da equipe pode ler o app no próprio idioma dentro de um mesmo espaço de trabalho. Deixe no padrão do espaço de trabalho para seguir o que o escritório escolheu.",
            ),
            h("Aparência"),
            p(
              "Os temas claro e escuro estão disponíveis. O escuro cansa menos a vista dentro de uma caminhonete à noite; o claro é mais legível sob sol direto.",
            ),
            h("Auxílios de captura"),
            ul(
              "Linhas de grade — uma grade de enquadramento no visor. Ela não sai na foto.",
              "Som do disparo — desligue em locais que exigem silêncio. Alguns países exigem o som por lei, e lá ele não pode ser desativado.",
              "Salvar original — guarde uma cópia sem marca d'água no aparelho.",
            ),
            h("Seu perfil"),
            p(
              "Seu nome, sua foto e sua senha ficam em Perfil. Seu nome aparece nas capturas quando o modelo inclui esse campo, então mantenha-o como a sua equipe reconheceria você.",
            ),
            see("mobile-app/photo-quality-and-storage", "teamspace/roles-and-permissions"),
          ],
        },
      ],
    },
  ],
};
