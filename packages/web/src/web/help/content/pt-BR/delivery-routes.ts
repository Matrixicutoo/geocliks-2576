import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const deliveryRoutes: Category = {
  slug: "delivery-routes",
  title: "Rotas de entrega",
  summary:
    "Planeje o dia de um motorista, mande-o para a rua e encerre cada parada com uma foto de comprovação que o destinatário pode ver.",
  icon: "Route",
  sections: [
    {
      title: "Planejar o dia",
      articles: [
        {
          slug: "delivery-overview",
          title: "Como funciona o Delivery",
          summary:
            "O formato de um dia de entregas no GeoCliks: montar uma rota, atribuir um motorista, encerrar cada parada com evidência.",
          keywords: [
            "entrega",
            "rotas",
            "despacho",
            "motorista",
            "comprovante de entrega",
            "delivery",
            "dispatch",
            "pod",
          ],
          body: [
            p(
              "As Rotas de entrega pegam a mesma ideia da foto verificada e a aplicam ao dia de um motorista. Você monta uma lista de paradas no escritório, entrega ao motorista, e ele encerra cada parada fotografando a entrega. A foto carrega a hora verificada, a posição GPS e o endereço, então uma contestação de entrega tem resposta.",
            ),
            h("O dia, do começo ao fim"),
            steps(
              "O escritório cria uma rota para uma data e cola os endereços do dia.",
              "O GeoCliks resolve os endereços em posições no mapa, e você corrige os que ele não conseguiu localizar.",
              "Você ordena as paradas, na mão ou com o otimizador.",
              "Você atribui a rota a um motorista, que a vê no celular.",
              "O motorista percorre a lista, fotografando cada entrega.",
              "Destinatários com endereço de e-mail recebem uma mensagem de comprovante de entrega com a foto.",
              "O escritório acompanha a rota sendo encerrada em tempo real e mantém a trilha de auditoria.",
            ),
            h("Dois tipos de rota"),
            table(
              ["Modo", "Use quando"],
              [
                [
                  "Planejada",
                  "Você conhece o dia inteiro de antemão. Monte, otimize e mande para a rua.",
                ],
                [
                  "Despacho",
                  "Os pedidos chegam durante o turno e são encaixados nas paradas restantes de um motorista.",
                ],
              ],
            ),
            h("Cada parada termina em um de quatro estados"),
            ul(
              "Entregue — encerrada com uma foto de comprovação.",
              "Falhou — o motorista não conseguiu entregar, com um motivo e uma foto.",
              "Ignorada — não havia nada para entregar aqui. O único encerramento sem foto.",
              "Pendente — ainda não alcançada.",
            ),
            note(
              "O Delivery é um recurso separado da captura de evidências. Sua franquia de paradas de entrega por mês vem do seu plano, e os planos Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 e Fleet 500 existem para operações que são majoritariamente dirigir.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "create-a-route",
          title: "Criar uma rota",
          summary:
            "Defina a data, o depósito, a hora de início e quanto tempo uma parada costuma levar.",
          keywords: [
            "nova rota",
            "criar",
            "depósito",
            "hora de início",
            "tempo de atendimento",
            "assinatura",
            "route",
            "depot",
          ],
          body: [
            p(
              "Uma rota é o trabalho de um motorista para uma data. Crie-a primeiro e depois preencha com as paradas.",
            ),
            h("Crie a rota"),
            steps(
              "Abra Rotas e escolha Nova rota.",
              "Dê um nome que um despachante reconheça numa manhã corrida — “Terça zona norte” é melhor que “Rota 4”.",
              "Defina a data.",
              "Escolha o modo Planejada ou Despacho.",
              "Se quiser, vincule a rota a um projeto, para que as fotos de entrega fiquem junto das evidências daquela obra.",
              "Informe o endereço de partida — normalmente seu depósito ou pátio.",
              "Salve.",
            ),
            h("As configurações que moldam o plano"),
            table(
              ["Configuração", "O que faz"],
              [
                [
                  "Endereço de partida",
                  "Onde o dia começa. O otimizador planeja a partir daqui.",
                ],
                ["Retornar ao início", "Inclui a volta ao depósito no plano."],
                ["Hora de início", "Quando o motorista sai. O padrão é 08:00."],
                [
                  "Tempo de atendimento",
                  "Minutos gastos em uma parada média. O padrão é 5. Define as estimativas de chegada.",
                ],
                [
                  "Exigir assinatura",
                  "Pede ao motorista uma assinatura além da foto.",
                ],
              ],
            ),
            h("Vale a pena acertar o tempo de atendimento"),
            p(
              "O tempo de atendimento é como a chegada estimada de todas as paradas seguintes é calculada. Cinco minutos serve para encomendas na porta. Uma parada que envolve descarregar paletes fica mais perto de vinte, e você pode sobrescrever o tempo de atendimento em paradas específicas que você sabe que são demoradas.",
            ),
            note(
              "Criar uma rota exige a função Gerente ou superior. Os motoristas não montam as próprias rotas.",
            ),
            warn(
              "O modo Despacho exige o Delivery Pro ou superior. Se o seu plano cobre apenas rotas planejadas, você é avisado ao escolher o modo, e não depois de ter montado o dia.",
            ),
            see("delivery-routes/add-stops-by-pasting-a-list", "delivery-routes/live-dispatch"),
          ],
        },
        {
          slug: "add-stops-by-pasting-a-list",
          title: "Adicionar paradas colando uma lista ou enviando um CSV",
          summary:
            "Cole uma coluna de planilha, um e-mail do cliente ou envie um CSV — o GeoCliks lê as colunas de qualquer jeito.",
          keywords: [
            "paradas",
            "colar",
            "importar",
            "enviar",
            "arquivo",
            "planilha",
            "csv",
            "em massa",
            "endereços",
            "stops",
            "paste",
          ],
          body: [
            p(
              "As paradas entram de duas formas: colando os endereços ou enviando um arquivo CSV. As duas terminam na mesma caixa e passam pelo mesmo leitor, então tudo abaixo vale para as duas. Você não precisa reformatar a lista antes.",
            ),
            h("Colar uma lista"),
            steps(
              "Abra a rota e localize a caixa Adicionar paradas.",
              "Cole o bloco. Uma parada por linha.",
              "Leia o resumo acima da caixa: quantas paradas ele encontrou, qual separador usou, quais colunas reconheceu e quantas linhas descartou.",
              "Corrija na origem o que parecer errado e cole de novo, ou adicione as paradas e edite uma a uma.",
              "Escolha Adicionar paradas.",
            ),
            h("Enviar um CSV"),
            steps(
              "Exporte a lista da sua planilha ou do seu sistema de pedidos como CSV.",
              "Abra a rota e localize a caixa Adicionar paradas.",
              "Escolha Enviar um CSV e selecione o arquivo.",
              "O conteúdo do arquivo cai na caixa, onde você pode ler o resumo e editar qualquer linha antes de qualquer coisa ser criada.",
              "Escolha Adicionar paradas.",
            ),
            note(
              "Enviar o arquivo não cria as paradas por si só — ele preenche a caixa. Nada é adicionado à rota até você escolher Adicionar paradas, então um arquivo errado não custa nada. Os arquivos precisam ser CSV ou texto simples e ter menos de 1 MB.",
            ),
            h("O que o leitor entende"),
            ul(
              "Separado por tabulação, vírgula ou ponto e vírgula. Ele descobre qual você usou.",
              "Campos entre aspas, então um endereço com vírgula dentro das aspas continua sendo um só endereço.",
              "Uma linha de cabeçalho, se houver. As colunas passam a ser identificadas por nome, em qualquer ordem.",
              "Nomes de cabeçalho em português, inglês, francês ou alemão — endereço/address/adresse/Adresse, nome/name/nom/Empfänger, e-mail/email/courriel, telefone/phone/téléphone/Telefon, pedido/reference/commande/Referenz, observações/notes/remarques/Notizen. Os acentos são opcionais: endereco, observacoes e Empfaenger também funcionam.",
              "Endereço dividido em várias colunas da planilha — rua, cidade, província, código postal — reunidos de volta em uma única linha.",
              "Endereços de e-mail e telefones identificados pelo formato, mesmo sem linha de cabeçalho.",
            ),
            h("Campos por parada"),
            table(
              ["Campo", "Por que importa"],
              [
                ["Endereço", "Obrigatório. Todo o resto é opcional."],
                [
                  "Nome do destinatário",
                  "Mostrado ao motorista e usado no e-mail de comprovação.",
                ],
                [
                  "E-mail do destinatário",
                  "Sem ele, esse destinatário não recebe e-mail de acompanhamento nem de comprovação.",
                ],
                ["Telefone do destinatário", "Para o motorista ligar antes."],
                [
                  "Referência",
                  "Seu número de pedido, nota ou rastreio. Pesquisável.",
                ],
                [
                  "Notas",
                  "Códigos de portão, número do interfone, onde deixar a entrega.",
                ],
                ["Janela de horário", "Chegada aceitável mais cedo e mais tarde."],
                [
                  "Tempo de atendimento",
                  "Sobrescreve o padrão da rota para uma parada que você sabe que é demorada.",
                ],
              ],
            ),
            h("Por que um código postal nunca é tratado como nome"),
            p(
              "Uma lista canadense colada como “12 Main St, Moncton NB, E1A 4H2” produzia um destinatário chamado E1A 4H2. Agora o leitor reconhece palavras de logradouro, códigos de província e formatos de código postal e de ZIP, e só transforma um campo final em nome de pessoa quando ele realmente parece um nome.",
            ),
            note(
              "Você pode adicionar até 300 paradas em uma única colagem. Para um dia maior, cole em lotes — eles se acumulam na mesma rota.",
            ),
            warn(
              "Cada parada conta na sua franquia mensal de entregas. Se uma colagem passar do limite do plano, ela é recusada por inteiro, então você nunca fica com metade de uma rota.",
            ),
            see(
              "delivery-routes/geocoding-and-fixing-addresses",
              "plans-billing/delivery-plans",
            ),
          ],
        },
        {
          slug: "geocoding-and-fixing-addresses",
          title: "Resolver endereços e corrigir os que estão errados",
          summary:
            "Transforme endereços digitados em posições no mapa e marque o ponto na mão quando um endereço não for encontrado.",
          keywords: [
            "geocodificação",
            "endereço",
            "marcador",
            "coordenadas",
            "falhou",
            "resolver",
            "mapa",
            "geocode",
            "pin",
          ],
          body: [
            p(
              "Um endereço colado é só texto. Antes de uma rota poder ser ordenada ou estimada, cada parada precisa de uma posição no mapa. Esse passo se chama resolver, e você o executa a partir da rota.",
            ),
            h("Resolva as paradas"),
            steps(
              "Abra a rota.",
              "Escolha Resolver endereços. Só as paradas ainda não resolvidas são processadas.",
              "Leia o resultado: quantas foram localizadas e quantas falharam.",
              "Trate as falhas antes de otimizar.",
            ),
            h("Cada parada tem uma situação de resolução"),
            table(
              ["Situação", "Significado"],
              [
                ["Pendente", "Ainda não consultada."],
                ["OK", "Localizada no mapa, com um endereço normalizado."],
                ["Falhou", "Não foi encontrada. Precisa da sua ajuda."],
                [
                  "Manual",
                  "Você mesmo marcou o ponto. Nunca é sobrescrita por uma nova resolução.",
                ],
              ],
            ),
            h("Corrigir uma parada que falhou"),
            ul(
              "Edite o endereço e resolva de novo — cidade ou província faltando é a causa mais comum.",
              "Ou abra o mapa e marque o ponto no lugar certo você mesmo. A parada passa a ser Manual e é tratada como localizada.",
              "Um ponto manual é a solução para um loteamento novo, uma propriedade rural ou um local sem endereço oficial.",
            ),
            h("Resolver novamente"),
            p(
              "Uma nova resolução forçada consulta todas as paradas outra vez, inclusive as já marcadas como OK. Ela deliberadamente não toca nos pontos manuais, porque um ponto marcado à mão é uma informação melhor do que qualquer coisa que a consulta vá retornar.",
            ),
            note(
              "A consulta de endereços é enviesada para o Canadá, então um endereço curto como “12 Main St, Moncton” é resolvido sem você precisar escrever o país.",
            ),
            warn(
              "Paradas sem posição não podem ser ordenadas pelo otimizador. Elas ficam estacionadas no fim da rota em vez de serem descartadas, então confira o final da sua lista antes de mandar um motorista para a rua.",
            ),
            see("delivery-routes/optimize-stop-order", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Mandar para a rua",
      articles: [
        {
          slug: "optimize-stop-order",
          title: "Ordenar as paradas",
          summary:
            "Reordene na mão ou deixe o otimizador calcular a ordem de percurso para você.",
          keywords: [
            "otimizar",
            "ordem",
            "sequência",
            "reordenar",
            "mais curto",
            "planejamento de rota",
            "optimize",
            "sequence",
          ],
          body: [
            p(
              "As paradas começam na ordem em que você as adicionou. Raramente é a ordem em que você quer percorrê-las.",
            ),
            h("Na mão"),
            p(
              "Arraste as paradas para a ordem que você quer. Útil quando o motorista conhece a região melhor que qualquer algoritmo, ou quando um cliente precisa ser o primeiro.",
            ),
            h("Com o otimizador"),
            steps(
              "Resolva os endereços primeiro — uma parada sem posição não pode ser ordenada.",
              "Escolha Otimizar.",
              "Revise o resultado: a nova ordem, a distância total e o tempo estimado de percurso.",
              "Ajuste na mão depois, se quiser. A otimização é uma sugestão que você pode ignorar.",
            ),
            h("Dois otimizadores"),
            table(
              ["Otimizador", "O que faz"],
              [
                [
                  "Padrão",
                  "Roda no GeoCliks, sem serviço externo e sem medição. Boa ordenação para um dia normal.",
                ],
                [
                  "Inteligente",
                  "Usa dados reais da malha viária para uma ordenação mais apertada em rotas densas ou complicadas. Delivery Pro e superiores.",
                ],
              ],
            ),
            note(
              "Se você pedir o otimizador inteligente em um plano que não o inclui, o GeoCliks roda o padrão em vez de falhar. Você continua recebendo uma rota ordenada — confira qual otimizador rodou no histórico da rota.",
            ),
            h("O que o otimizador respeita"),
            ul(
              "Seu endereço de partida e a configuração de retorno ao depósito, se estiver ativa.",
              "O tempo de atendimento de cada parada, ou o padrão da rota.",
              "Paradas sem posição, que mantêm seu lugar no fim da lista.",
            ),
            see("delivery-routes/assign-a-driver", "troubleshoot/route-optimize-failed"),
          ],
        },
        {
          slug: "assign-a-driver",
          title: "Atribuir um motorista",
          summary:
            "Entregue a rota a alguém do seu espaço de trabalho e comece o dia.",
          keywords: [
            "atribuir",
            "motorista",
            "iniciar",
            "situação",
            "despacho",
            "assign",
            "driver",
            "status",
          ],
          body: [
            p(
              "Uma rota precisa pertencer a alguém antes de ser percorrida. O motorista precisa ser membro do seu espaço de trabalho — a função Campo é a certa para quem só dirige e captura.",
            ),
            h("Atribua a rota"),
            steps(
              "Abra a rota.",
              "Escolha Atribuir e selecione o motorista.",
              "A rota aparece no celular dele, nas rotas daquela data.",
              "Escolha Iniciar quando ele estiver saindo, ou deixe o motorista iniciá-la encerrando a primeira parada.",
            ),
            h("Situação da rota"),
            table(
              ["Situação", "Significado"],
              [
                ["Rascunho", "Em montagem. Ainda sem motorista."],
                ["Atribuída", "Um motorista a recebeu, mas não começou."],
                ["Em andamento", "Sendo percorrida agora."],
                ["Concluída", "Todas as paradas estão encerradas."],
                ["Cancelada", "Suspensa. As paradas não podem mais ser encerradas."],
              ],
            ),
            h("Se você mudar de ideia"),
            ul(
              "Remova a atribuição de uma rota para devolvê-la a rascunho e entregá-la a outra pessoa.",
              "Um motorista que fotografa a primeira entrega sem tocar em Iniciar deixa a rota em andamento de qualquer forma.",
              "Cancelar uma rota impede que outras paradas sejam encerradas nela e mantém tudo o que já foi registrado.",
            ),
            note(
              "Seu plano define para quantos motoristas a operação foi dimensionada. O Delivery Lite cobre dois, o Pro cinco, o Fleet quinze, o Fleet 30 trinta, o Fleet 200 duzentos e o Fleet 500 quinhentos.",
            ),
            see(
              "delivery-routes/driver-run-and-proof-of-delivery",
              "teamspace/roles-and-permissions",
            ),
          ],
        },
        {
          slug: "live-dispatch",
          title: "Despacho ao vivo",
          summary:
            "Encaixe um pedido que chegou no meio do turno nas paradas restantes de um motorista.",
          keywords: [
            "despacho",
            "ao vivo",
            "adicionar parada",
            "meio do turno",
            "sob demanda",
            "inserir",
            "dispatch",
            "live",
          ],
          body: [
            p(
              "O modo Despacho é para o trabalho que não existe quando o dia começa: uma ligação chega às 14:00 e alguém precisa atendê-la. Você adiciona a parada a uma rota que já está sendo percorrida e o GeoCliks a encaixa.",
            ),
            h("Adicionar uma parada ao vivo"),
            steps(
              "Abra a rota em andamento.",
              "Escolha Adicionar parada ao vivo.",
              "Informe o endereço e os dados do destinatário.",
              "Confirme. A parada é inserida no trecho da rota que o motorista ainda não alcançou e aparece no celular dele.",
            ),
            h("O que nunca se move"),
            ul(
              "Paradas já entregues, com falha ou ignoradas.",
              "A parada para a qual o motorista está indo agora.",
            ),
            p(
              "Uma nova parada é inserida no ponto mais barato da lista restante. Isso deliberadamente não é uma reotimização: uma ferramenta que embaralha o plano debaixo de um motorista em movimento é abandonada por quem a usa, e reotimizar repetidamente uma noite cheia também custaria dinheiro em cada recálculo.",
            ),
            note(
              "A inserção roda localmente e é gratuita, quantas vezes você fizer isso em um turno.",
            ),
            warn(
              "O despacho ao vivo exige o Delivery Pro ou superior. Em um plano com apenas rotas planejadas, você ainda pode adicionar paradas a uma rota antes de ela começar.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
      ],
    },
    {
      title: "Na estrada",
      articles: [
        {
          slug: "driver-run-and-proof-of-delivery",
          title: "O percurso do motorista e o comprovante de entrega",
          summary: "O que o motorista vê e como uma parada é encerrada com evidência.",
          keywords: [
            "motorista",
            "percurso",
            "comprovante",
            "foto",
            "assinatura",
            "entregue",
            "offline",
            "driver",
            "proof",
          ],
          body: [
            p(
              "No celular, o motorista recebe uma única tela: a parada em que está, o endereço, o destinatário, as notas e quantas paradas faltam. Todo o resto fica fora do caminho.",
            ),
            h("Encerrar uma parada"),
            steps(
              "Toque na parada.",
              "Tire a foto da entrega — a encomenda na porta, o palete na doca, o que comprovar que chegou.",
              "Confirme ou corrija o nome do destinatário.",
              "Colete uma assinatura, se a rota pedir uma.",
              "Marque como Entregue. A próxima parada aparece.",
            ),
            h("A foto não é opcional"),
            p(
              "Uma parada entregue ou com falha precisa ser encerrada com uma foto real do seu espaço de trabalho. Não existe como marcar uma parada como entregue sem nada anexado — esse é justamente o motivo de usar o GeoCliks para entregas em vez de um aplicativo de checklist.",
            ),
            h("Offline"),
            ul(
              "O percurso funciona sem sinal. Fotos e encerramentos de parada ficam na fila do aparelho.",
              "A hora de conclusão registrada é a hora em que a foto foi tirada, não a do envio, então uma rota percorrida por uma área sem cobertura continua correta.",
              "Se a fila for esvaziada duas vezes, a segunda tentativa é reconhecida e ignorada em vez de encerrar a parada duas vezes.",
            ),
            note(
              "O escritório vê cada encerramento de parada assim que ele chega, então um despachante acompanhando a rota sabe onde o motorista está sem ligar para ele.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "mobile-app/offline-capture-and-queue",
            ),
          ],
        },
        {
          slug: "failed-and-skipped-stops",
          title: "Paradas com falha e ignoradas",
          summary:
            "Registre por que uma entrega não aconteceu, de um jeito em que o escritório possa agir.",
          keywords: [
            "falha",
            "ignorada",
            "ninguém em casa",
            "recusado",
            "endereço errado",
            "exceção",
            "failed",
            "skipped",
          ],
          body: [
            p(
              "Não toda parada dá certo. Uma parada com falha ainda é uma parada encerrada com evidência — é o registro de que o motorista foi até lá e do que ele encontrou.",
            ),
            h("Marcar uma parada como falha"),
            steps(
              "Toque na parada e tire uma foto do que o motorista está vendo — a porta fechada, a via bloqueada, o prédio errado.",
              "Escolha Falhou.",
              "Selecione um motivo.",
              "Acrescente uma nota se houver algo que o escritório precise saber.",
              "Salve.",
            ),
            h("Os motivos"),
            table(
              ["Motivo", "Use para"],
              [
                ["Ninguém em casa", "Ninguém disponível para receber."],
                ["Recusado", "O destinatário não quis receber."],
                ["Endereço errado", "O endereço não corresponde ao destinatário."],
                ["Fechado", "Um estabelecimento que estava fechado."],
                [
                  "Inacessível",
                  "Não foi possível chegar fisicamente — portão, neve, obra.",
                ],
                ["Outro", "Qualquer outra coisa. Escreva na nota."],
              ],
            ),
            h("Ignorar, em vez disso"),
            p(
              "Ignorar é diferente: é o motorista informando que não havia nada para entregar ali. É o único encerramento que não precisa de foto, e fica registrado como ignorada para que o escritório leia exatamente isso no histórico, em vez de uma falha que nunca aconteceu.",
            ),
            warn(
              "Uma parada com falha nunca dispara um e-mail de comprovante de entrega ao destinatário. Esses casos são tratados pelo escritório na mão, porque um animado “sua encomenda chegou” para uma entrega que falhou é pior que nenhuma mensagem.",
            ),
            note(
              "Todo encerramento, falha e parada ignorada é escrito no histórico da rota com quem fez e quando, e o histórico não pode ser editado.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "delivery-routes/driver-run-and-proof-of-delivery",
            ),
          ],
        },
        {
          slug: "tracking-links-and-notifications",
          title: "Links de acompanhamento e e-mails ao destinatário",
          summary:
            "Os três e-mails que um destinatário pode receber e exatamente o que a página de acompanhamento mostra.",
          keywords: [
            "acompanhamento",
            "notificação",
            "e-mail",
            "destinatário",
            "previsão",
            "link",
            "privacidade",
            "tracking",
            "eta",
          ],
          body: [
            p(
              "Um destinatário com endereço de e-mail na parada pode ser mantido informado automaticamente. Você controla isso por rota, e um destinatário sem e-mail simplesmente nunca é contatado.",
            ),
            h("Os três e-mails"),
            table(
              ["E-mail", "Quando é enviado"],
              [
                ["A caminho", "A rota começou e o motorista está na rua."],
                [
                  "Você é o próximo",
                  "O motorista está a um número definido de entregas de distância.",
                ],
                [
                  "Entregue",
                  "A parada dele foi encerrada. Inclui a foto de comprovação e o código dela.",
                ],
              ],
            ),
            h("Configurações"),
            ul(
              "Ative ou desative o e-mail de aviso prévio para a rota.",
              "Defina quantas paradas antes ele é enviado — uma dá pouco aviso, cinco dá uma janela ampla.",
              "Ative ou desative o e-mail de comprovante de entrega.",
            ),
            h("O que a página de acompanhamento mostra"),
            p(
              "Cada e-mail leva a uma página de acompanhamento daquela única parada, acessada por um link impossível de adivinhar. O destinatário vê o nome da sua empresa, o próprio endereço, quantas entregas ainda estão à frente da dele e, quando a parada é encerrada, a foto de comprovação com a hora verificada e a localização.",
            ),
            h("O que ela deliberadamente não mostra"),
            ul(
              "Qualquer outra parada, endereço ou destinatário da rota.",
              "O nome, o telefone ou a posição ao vivo do motorista.",
              "O nome da rota ou o número total de paradas — o que permitiria a um concorrente mapear seu percurso.",
            ),
            note(
              "Cada destinatário recebe cada e-mail no máximo uma vez, e o progresso do motorista é reconferido imediatamente antes do envio, então ninguém recebe um “você é o próximo” para uma parada que acabou de ser entregue.",
            ),
            warn(
              "Os e-mails aos destinatários só saem quando o envio de e-mail está configurado para o seu espaço de trabalho. Se os destinatários relatarem que não estão recebendo nada, verifique isso primeiro.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "troubleshoot/notifications-not-arriving",
            ),
          ],
        },
      ],
    },
  ],
};
