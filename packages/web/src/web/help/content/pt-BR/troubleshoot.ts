import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const troubleshoot: Category = {
  slug: "troubleshoot",
  title: "Resolver problemas",
  summary: "As coisas que dão errado com mais frequência, e o que conferir primeiro.",
  icon: "Wrench",
  sections: [
    {
      title: "Captura e envio",
      articles: [
        {
          slug: "photos-not-uploading",
          title: "As fotos não estão subindo",
          summary: "Capturas paradas na fila, e como fazê-las andar.",
          keywords: [
            "envio",
            "fila",
            "travado",
            "pendente",
            "offline",
            "sincronizar",
            "limite",
            "upload",
          ],
          body: [
            p(
              "As capturas ficam no celular até subirem. Uma fila é normal com sinal ruim — uma fila que nunca esvazia não é.",
            ),
            h("Confira nesta ordem"),
            steps(
              "Abra o app e olhe a fila de envio. Se ela mostra itens esperando, as capturas estão seguras no aparelho.",
              "Consiga sinal de verdade ou Wi-Fi. Uma barrinha só costuma conectar, mas não consegue mover uma foto.",
              "Traga o app para primeiro plano e deixe-o assim por um minuto. Alguns celulares suspendem transferências em segundo plano de forma agressiva.",
              "Verifique se o celular não está em modo de economia de energia ou de dados, que bloqueia envios em segundo plano.",
              "Saia e entre de novo na conta só como último recurso — e faça isso com a fila vazia.",
            ),
            h("Se a fila esvazia mas nada aparece no espaço de trabalho"),
            ul(
              "Confira o filtro de projeto na versão web. As capturas podem ter ido para um projeto que você não está olhando.",
              "Confira o filtro de data. Uma captura que estava na fila é arquivada no dia em que foi feita, não hoje.",
              "Confirme que você está olhando o espaço de trabalho certo, se você faz parte de mais de um.",
            ),
            h("Se você bateu em um limite mensal"),
            p(
              "O plano Free cobre 300 capturas por mês. Passando disso, os envios são recusados até o mês virar ou você mudar para um plano sem limite mensal.",
            ),
            warn(
              "Não exclua o app enquanto houver capturas na fila. As capturas já enviadas ficam no seu espaço de trabalho, mas tudo o que ainda estiver esperando no aparelho vai junto.",
            ),
            note(
              "A hora da captura é registrada no aparelho, então uma foto que sobe dois dias depois ainda carrega o momento do disparo, e a verificação reflete isso.",
            ),
            see("mobile-app/offline-capture-and-queue", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "gps-or-address-wrong",
          title: "A posição GPS ou o endereço está errado",
          summary: "Por que um pino desloca, e o que fazer com um nome de rua errado.",
          keywords: [
            "gps",
            "localização",
            "endereço",
            "precisão",
            "errado",
            "desvio",
            "permissão",
            "location",
          ],
          body: [
            p(
              "O GeoCliks registra a posição que o celular informa e depois converte essa posição em um endereço. Os dois passos podem sair errados, por motivos diferentes.",
            ),
            h("O pino está no lugar errado"),
            ul(
              "Em ambientes fechados, no subsolo, em estacionamento coberto ou entre prédios altos, a recepção de satélite é ruim e o celular recorre a uma leitura mais grosseira.",
              "Um celular que acabou de ser ligado ainda não tem posição. Dê quinze segundos em área aberta antes da primeira captura do dia.",
              "Cada captura registra sua precisão. Um valor de precisão alto é o celular dizendo que estava incerto — isso é um recurso, não um defeito.",
            ),
            h("A posição está certa mas o endereço está errado"),
            p(
              "O endereço é consultado a partir das coordenadas. Em um loteamento novo, em uma estrada rural ou em um terreno grande com um único número, o que volta é o endereço conhecido mais próximo, e ele pode ser o prédio vizinho. As coordenadas continuam sendo o registro que vale.",
            ),
            h("Não há localização nenhuma"),
            steps(
              "Abra as configurações do celular e encontre o GeoCliks.",
              "Defina a permissão de localização como Ao usar o app, ou Sempre.",
              "No iPhone, ative também a Localização exata. Sem ela você recebe uma área aproximada em vez de uma posição.",
              "Capture de novo. As capturas anteriores não podem receber uma localização depois do fato.",
            ),
            h("Paradas de entrega no lugar errado"),
            p(
              "A posição de uma parada vem da conversão do endereço digitado, não de um celular. Corrija o endereço e resolva de novo, ou coloque o pino à mão.",
            ),
            warn(
              "Uma posição não pode ser adicionada nem editada depois da captura. É isso que a torna evidência — se pudesse ser corrigida depois, não provaria nada.",
            ),
            see(
              "delivery-routes/geocoding-and-fixing-addresses",
              "verify/verify-results-explained",
            ),
          ],
        },
      ],
    },
    {
      title: "Acesso",
      articles: [
        {
          slug: "cant-sign-in",
          title: "Não consigo entrar",
          summary: "Senha errada, e-mail não verificado ou método de entrada errado.",
          keywords: [
            "entrar",
            "login",
            "senha",
            "redefinir",
            "verificar",
            "google",
            "bloqueado",
            "sign in",
          ],
          body: [
            p(
              "Siga estes passos na ordem — a causa costuma ser uma das três primeiras.",
            ),
            h("Confira o básico"),
            steps(
              "Confirme o endereço de e-mail. Um endereço de trabalho e um pessoal são duas contas diferentes.",
              "Use o mesmo método com que você se cadastrou. Uma conta criada com o Google não tem senha para digitar.",
              "Redefina sua senha na tela de entrada se estiver em dúvida.",
              "Abra o e-mail de verificação se você nunca confirmou o endereço — uma conta não verificada não consegue entrar.",
            ),
            h("Nada chega quando você pede uma redefinição"),
            ul(
              "Confira spam e lixo eletrônico.",
              "Espere dois minutos. Pedidos repetidos podem cair em limite de tentativas, o que atrasa ainda mais.",
              "Confirme que o endereço existe — uma redefinição para um endereço sem conta não envia nada.",
            ),
            h("Pedem para você provar que é humano"),
            p(
              "Tentativas falhas repetidas podem acionar um desafio. Conclua-o e siga. Se ele continuar aparecendo, tente uma janela normal do navegador em vez de uma janela privada e desative qualquer extensão que bloqueie scripts.",
            ),
            h("Você entra mas cai no lugar errado"),
            ul(
              "Se você faz parte de mais de um espaço de trabalho, troque de espaço de trabalho pelo menu da conta.",
              "Um membro de campo vê só os projetos atribuídos a ele, então um espaço de trabalho aparentemente vazio geralmente significa que ainda não há projetos atribuídos — fale com um admin.",
            ),
            note(
              "Ser removido de um espaço de trabalho não exclui a sua conta. Você ainda consegue entrar; só não vê aquele espaço de trabalho.",
            ),
            see("troubleshoot/two-factor-issues", "getting-started/create-your-account"),
          ],
        },
        {
          slug: "two-factor-issues",
          title: "Problemas com dois fatores",
          summary:
            "Códigos recusados, celular perdido, e como funcionam os códigos de backup.",
          keywords: [
            "2fa",
            "dois fatores",
            "totp",
            "autenticador",
            "códigos de backup",
            "código recusado",
            "two factor",
          ],
          body: [
            p(
              "A autenticação de dois fatores é opcional e é oferecida a proprietários e admins na página de perfil. A equipe de campo não é empurrada de propósito para um app autenticador, porque um celular compartilhado de caminhonete torna isso um sofrimento.",
            ),
            h("O código é recusado"),
            steps(
              "Confira que você está lendo a entrada do GeoCliks no seu app autenticador, e não de outro serviço.",
              "Espere o próximo código. Os códigos mudam a cada 30 segundos, e um que está por expirar costuma ser recusado.",
              "Digite os seis dígitos sem espaço.",
              "Confira se o relógio do celular está no ajuste automático. Um relógio de aparelho vários minutos fora gera códigos que o servidor não aceita.",
            ),
            h("Você perdeu o celular com o autenticador"),
            p(
              "Use um dos códigos de backup que você recebeu quando ativou os dois fatores. Escolha a opção de código de backup na tela da segunda etapa e digite um. Cada código funciona uma vez.",
            ),
            warn(
              "Se você perdeu o autenticador e os códigos de backup, não conseguimos recuperar a conta pela tela de entrada. Escreva para support@geocliks.com a partir do endereço da própria conta e espere verificações de identidade — esse atrito é justamente o ponto dos dois fatores.",
            ),
            h("Desativar"),
            p(
              "Entre na conta, abra seu perfil e desative os dois fatores. Será pedida uma confirmação. Se você é o proprietário, considere deixar ativado — é a conta que pode mudar a cobrança e remover pessoas.",
            ),
            note(
              "Os dois fatores valem para a sua conta em todos os lugares. Uma vez ativados, tanto o site quanto o app de celular pedem a segunda etapa.",
            ),
            see("troubleshoot/cant-sign-in", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "invite-not-working",
          title: "Um convite não está funcionando",
          summary: "Sem e-mail, link expirado ou nenhum assento sobrando no plano.",
          keywords: [
            "convite",
            "assento",
            "expirado",
            "aceitar",
            "qr",
            "e-mail",
            "invite",
            "seat",
          ],
          body: [
            p(
              "Problemas de convite se resumem ao endereço, aos assentos ou ao plano.",
            ),
            h("A pessoa nunca recebeu o e-mail"),
            steps(
              "Abra Equipe e confira a lista de pendentes — se o convite está lá, ele foi criado.",
              "Confira se há erro de digitação no endereço. Um convite está amarrado ao endereço exato para o qual foi enviado.",
              "Peça para a pessoa conferir o spam.",
              "Use o QR code no lugar: abra o convite pendente, mostre o código e peça para a pessoa escanear com o celular.",
            ),
            h("A pessoa aceitou mas não vê nada"),
            p(
              "Membros de campo veem só os projetos a que estão atribuídos. Atribua-os em Equipe, ou no próprio projeto, e isso aparece no celular deles em instantes.",
            ),
            h("Você não consegue enviar o convite de jeito nenhum"),
            ul(
              "Sem assentos: os convites pendentes também seguram um assento. Revogue convites antigos, remova quem saiu ou suba de plano.",
              "Teamspace não incluído: os convites começam no plano Business. Free e Plus são de um assento só.",
              "Papel errado: convidar exige admin ou proprietário.",
            ),
            h("A pessoa aceitou com um e-mail diferente"),
            p(
              "Isso não funciona — o convite só combina com o endereço para o qual foi enviado. Revogue-o e envie um novo para o endereço que a pessoa realmente usa.",
            ),
            note("Revogar um convite pendente libera o assento dele na hora."),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
      ],
    },
    {
      title: "Rotas, exportações e avisos",
      articles: [
        {
          slug: "route-optimize-failed",
          title: "Uma rota não otimiza",
          summary: "Em geral são endereços não resolvidos. Às vezes é o plano.",
          keywords: [
            "otimizar",
            "rota",
            "falhou",
            "coordenadas",
            "geocodificação",
            "ordem",
            "optimize",
          ],
          body: [
            p("O otimizador trabalha com posições no mapa, não com endereços digitados."),
            h("“Nenhuma parada tem coordenadas ainda”"),
            steps(
              "Abra a rota e escolha Resolver endereços.",
              "Olhe as paradas que não foram resolvidas.",
              "Corrija o texto do endereço, ou coloque o pino à mão no mapa.",
              "Otimize de novo.",
            ),
            h("Otimizou, mas algumas paradas ficaram presas no fim"),
            p(
              "Paradas sem posição não podem ser ordenadas, então ficam estacionadas no fim da lista em vez de serem descartadas da rota. Resolva ou marque o pino delas e otimize de novo.",
            ),
            h("Você pediu o otimizador inteligente e recebeu o padrão"),
            p(
              "Em um plano sem o otimizador inteligente, o GeoCliks roda o padrão em vez de recusar. Você ainda recebe uma rota ordenada. O histórico da rota registra qual otimizador rodou.",
            ),
            h("A ordem ainda parece errada para você"),
            ul(
              "Confira se o endereço de partida está definido, e se o retorno à base deveria estar ativado.",
              "Confira o tempo de atendimento — um valor muito errado distorce toda estimativa de chegada.",
              "As janelas de horário das paradas limitam a ordem, e uma janela apertada passa por cima do caminho mais curto.",
              "Arraste as paradas à mão. O conhecimento local ganha de um algoritmo mais vezes do que os fornecedores admitem.",
            ),
            see(
              "delivery-routes/optimize-stop-order",
              "delivery-routes/geocoding-and-fixing-addresses",
            ),
          ],
        },
        {
          slug: "export-or-report-failed",
          title: "Uma exportação ou relatório falhou",
          summary:
            "Limites de plano, seleções grandes demais e formatos que não estão incluídos.",
          keywords: [
            "exportar",
            "relatório",
            "pdf",
            "excel",
            "zip",
            "kmz",
            "falhou",
            "download",
            "export",
          ],
          body: [
            p("A maioria das falhas de exportação é limite de plano, não defeito."),
            h("O formato não está disponível"),
            ul(
              "O plano Free gera só um PDF, de até 20 fotos.",
              "Excel, ZIP e KMZ começam no Plus.",
              "Você é avisado antes de o arquivo ser montado, e não depois, então nada fica gerado pela metade.",
            ),
            h("A exportação é muito grande"),
            steps(
              "Estreite a seleção com o filtro de data ou de projeto.",
              "Exporte em lotes — um mês por vez é mais fácil de enviar por e-mail e de montar.",
              "Para milhares de originais, prefira ZIP a PDF. Um PDF desse tamanho é inutilizável de todo modo.",
            ),
            h("O arquivo nunca baixa"),
            ul(
              "Os relatórios são montados no servidor e depois listados na sua lista de relatórios — olhe lá e baixe de novo em vez de remontar.",
              "Confira se o navegador não bloqueou o download e olhe na sua pasta de downloads.",
              "Teste outro navegador uma vez antes de reportar.",
            ),
            h("Um KMZ não abre"),
            p(
              "O KMZ precisa do Google Earth ou de um software de GIS. Ele não é um formato de documento e não abre em leitor de PDF nem em planilha.",
            ),
            note(
              "Todo relatório gerado fica na sua lista de relatórios, então você pode baixar de novo depois sem remontar.",
            ),
            see("teamspace/reports-and-exports", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "notifications-not-arriving",
          title: "As notificações não estão chegando",
          summary:
            "Push no celular, e os e-mails que os destinatários de entrega deveriam receber.",
          keywords: [
            "notificações",
            "push",
            "e-mail",
            "avisos",
            "silencioso",
            "destinatário",
            "rastreamento",
            "notifications",
          ],
          body: [
            p("São dois sistemas diferentes, então confira o que corresponde ao que está faltando."),
            h("Notificações push no celular"),
            steps(
              "Abra as configurações do celular, encontre o GeoCliks e permita notificações.",
              "Confira Não perturbe, Foco e qualquer agenda de hora de dormir.",
              "Abra o app uma vez estando conectado — o aparelho se registra para push na entrada, então um celular que não abriu o app depois de uma reinstalação não está registrado.",
              "Envie uma mensagem para você mesmo pela versão web para testar.",
            ),
            h("Um membro da equipe não recebe nada"),
            ul(
              "A pessoa tem de ser membro do espaço de trabalho e estar conectada naquele aparelho.",
              "Os comunicados vão para os contatos do espaço de trabalho — quem foi removido do espaço de trabalho para de receber.",
              "Um celular que ficou dias offline recebe as notificações em fila quando reconecta, ou não recebe nada se elas expiraram.",
            ),
            h("Os destinatários de entrega não estão recebendo e-mails"),
            ul(
              "A parada precisa de um e-mail de destinatário. Sem ele, nenhum e-mail é possível.",
              "As configurações de notificação da própria rota controlam o aviso prévio e os e-mails de comprovante de entrega.",
              "Paradas que falharam nunca enviam e-mail de comprovante de entrega — por definição. O escritório cuida dessas à mão.",
              "Cada destinatário recebe cada e-mail uma vez, então um reenvio não sai duas vezes.",
              "O envio de e-mails precisa estar configurado para o seu espaço de trabalho. Se nenhum destinatário de nenhuma rota jamais recebeu algo, essa é a primeira coisa a conferir.",
            ),
            warn(
              "Peça ao destinatário para conferir o spam antes de concluir que nada foi enviado. E-mail transacional com foto dentro cai no lixo eletrônico mais do que a gente gostaria.",
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
