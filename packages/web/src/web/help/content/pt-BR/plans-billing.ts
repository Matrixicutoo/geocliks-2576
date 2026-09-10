import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const plansBilling: Category = {
  slug: "plans-billing",
  title: "Planos e cobrança",
  summary: "O que cada plano cobre, como mudar de plano e onde encontrar uma fatura.",
  icon: "CreditCard",
  sections: [
    {
      title: "Escolher um plano",
      articles: [
        {
          slug: "compare-plans",
          title: "Comparar planos",
          summary:
            "O que você tem no Free, Plus, Business, Crew 10, Crew 25 e Enterprise.",
          keywords: [
            "planos",
            "preços",
            "comparar",
            "free",
            "plus",
            "business",
            "crew",
            "limites",
            "plans",
            "pricing",
          ],
          body: [
            p(
              "Existem duas famílias de plano. Os planos de evidência abaixo são para documentar trabalho. Os planos de entrega são para operações que são basicamente dirigir, e estão em um artigo próprio.",
            ),
            p(
              "Os preços atuais estão na seção de planos de geocliks.com. Esta página trata do que cada plano realmente permite, que é a parte em que as pessoas se pegam de surpresa.",
            ),
            h("Planos de evidência"),
            table(
              ["Plano", "Para quem", "Assentos"],
              [
                ["Free", "Experimentar, ou documentação individual ocasional.", "1"],
                ["Plus", "Uma pessoa trabalhando em tempo integral, compartilhando com clientes.", "1"],
                ["Business", "Uma equipe pequena com um teamspace compartilhado.", "5"],
                ["Crew 10", "Uma equipe em crescimento.", "10"],
                ["Crew 25", "Uma operação maior.", "25"],
                ["Enterprise", "Volumes e condições personalizados. Fale com a gente.", "Sob medida"],
              ],
            ),
            h("O que muda conforme você sobe"),
            table(
              ["Recurso", "Onde começa"],
              [
                ["Captura verificada, marcas d'água, códigos de foto", "Free"],
                ["Capturas ilimitadas por mês", "Plus"],
                ["Exportações em Excel, ZIP e KMZ", "Plus"],
                ["Links de compartilhamento", "Plus"],
                ["Projetos e modelos de marca d'água ilimitados", "Plus"],
                ["Sua logo nas marcas d'água", "Plus"],
                ["Vídeos sem limite de duração", "Plus"],
                ["Teamspace com membros convidados", "Business"],
                ["Papéis e acesso por projeto", "Business"],
              ],
            ),
            h("O plano Free em detalhe"),
            ul(
              "300 capturas por mês.",
              "O vídeo é limitado a clipes de 30 segundos, e só nos três primeiros dias.",
              "Três projetos, um assento, dois modelos de marca d'água.",
              "Exportação em PDF de até 20 fotos. Sem Excel, ZIP ou KMZ.",
              "Sem teamspace, portanto sem membros convidados e sem links de compartilhamento.",
              "Sem rotas de entrega.",
            ),
            note(
              "Todo plano, incluindo o Free, dá a mesma verificação: os mesmos dados na marca d'água, o mesmo código da foto, o mesmo selo. Verificação não é um recurso pago.",
            ),
            h("Entregas nos planos de evidência"),
            p(
              "Plus e acima incluem uma cota mensal de paradas de entrega, então você pode rodar rotas sem migrar para um plano de entrega: uma cota modesta no Plus, mais no Business e progressivamente mais no Crew 10 e no Crew 25. Se você dirige todos os dias, os planos de entrega saem mais baratos por parada.",
            ),
            see("plans-billing/delivery-plans", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "delivery-plans",
          title: "Planos de entrega",
          summary:
            "Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 e Fleet 500 — dimensionados por paradas por mês e motoristas.",
          keywords: [
            "entrega",
            "lite",
            "pro",
            "fleet",
            "paradas",
            "motoristas",
            "despacho",
            "delivery",
            "dispatch",
          ],
          body: [
            p(
              "Os planos de entrega são para operações em que dirigir é o negócio, e não um efeito colateral dele. Eles incluem tudo o que há nos planos de evidência mais uma cota mensal de paradas muito maior.",
            ),
            table(
              ["Plano", "Paradas por mês", "Motoristas", "Despacho ao vivo", "Otimizador inteligente"],
              [
                ["Delivery Lite", "500", "2", "Não", "Não"],
                ["Delivery Pro", "2.000", "5", "Sim", "Sim"],
                ["Delivery Fleet", "6.000", "15", "Sim", "Sim"],
                ["Delivery Fleet 30", "12.000", "30", "Sim", "Sim"],
                ["Delivery Fleet 200", "80.000", "200", "Sim", "Sim"],
                ["Delivery Fleet 500", "200.000", "500", "Sim", "Sim"],
              ],
            ),
            h("O que são os dois recursos restritos"),
            ul(
              "Despacho ao vivo — adicionar paradas a uma rota que já está sendo dirigida. Pro, Fleet, Fleet 30, Fleet 200 e Fleet 500.",
              "Otimizador inteligente — ordenação da rota pela malha viária, em vez do solucionador padrão. Pro, Fleet, Fleet 30, Fleet 200 e Fleet 500. Nos planos sem ele, o otimizador padrão roda no lugar, então você ainda recebe uma rota ordenada.",
            ),
            h("Como contratar"),
            p(
              "Todo plano de entrega é autoatendimento na página de cobrança: escolha o plano, passe por um checkout hospedado seguro e informe os dados do cartão. Os novos limites valem assim que o processo termina. Um plano de entrega começa com um teste gratuito, então o botão dele diz Teste gratuito. Se o seu espaço de trabalho já está em um plano de entrega, mudar para outro cobra na hora e o botão passa a dizer Mudar para — o teste é um por espaço de trabalho, não um por plano.",
            ),
            steps(
              "Abra Cobrança nas configurações do seu espaço de trabalho.",
              "Escolha o plano de entrega que combina com o seu volume.",
              "Conclua o checkout. Você volta ao GeoCliks com a cota de paradas já ativa.",
            ),
            warn(
              "O Enterprise é o único plano que não é autoatendimento. O cartão dele mostra Fale com a gente em vez de um botão de checkout, e abre um e-mail preenchido para sales@geocliks.com. Ninguém é cobrado automaticamente e nada muda no seu espaço de trabalho até configurarmos junto com você.",
            ),
            note(
              "Só o proprietário do espaço de trabalho pode mudar de plano. Admins cuidam de pessoas, não da assinatura.",
            ),
            h("Qual deles serve"),
            p(
              "Conte as paradas que você realmente entrega em um mês normal e depois deixe uma folga para a sua semana mais cheia. Passar da cota interrompe a criação de rotas até o mês seguinte, então o plano deve cobrir o seu pico, não a sua média.",
            ),
            note(
              "As paradas são contadas por mês civil e zeram no dia primeiro. Uma parada conta quando é adicionada a uma rota, tenha ela sido entregue ou não.",
            ),
            see("delivery-routes/delivery-overview", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Gerenciar sua assinatura",
      articles: [
        {
          slug: "upgrade-or-change-plan",
          title: "Mudar de plano ou fazer upgrade",
          summary: "Mude de plano na página de cobrança — quem faz isso é o proprietário.",
          keywords: [
            "upgrade",
            "mudar de plano",
            "checkout",
            "rebaixar",
            "trocar",
            "change plan",
          ],
          body: [
            p(
              "Os planos são alterados em Cobrança, nas configurações do espaço de trabalho. Só o proprietário do espaço de trabalho pode fazer isso — admins cuidam de pessoas, não da assinatura.",
            ),
            h("Mudar de plano"),
            steps(
              "Abra Cobrança.",
              "Escolha o plano que você quer.",
              "Para um plano pago de autoatendimento, você vai para um checkout hospedado seguro para informar os dados do cartão, e volta ao GeoCliks quando ele termina.",
              "Para o Enterprise, você recebe um e-mail preenchido para a nossa equipe.",
              "Os novos limites valem assim que a mudança entra no ar.",
            ),
            h("Subir para um plano maior"),
            ul(
              "Os novos limites valem imediatamente.",
              "Nada do que você já capturou é afetado.",
              "Os assentos extras ficam disponíveis na hora, então você pode convidar pessoas logo depois.",
            ),
            h("Descer de plano"),
            p(
              "O rebaixamento é recusado enquanto o seu espaço de trabalho for maior do que o plano de destino. Se você tem oito membros e passa para um plano de cinco assentos, será avisado para remover membros primeiro. Isso é proposital — a alternativa seria cortar três pessoas em silêncio.",
            ),
            note(
              "Escolher o plano Free, ou escolher de novo o plano em que você já está, não passa por checkout nenhum.",
            ),
            see("plans-billing/seats-and-billing", "plans-billing/cancel-or-downgrade"),
          ],
        },
        {
          slug: "seats-and-billing",
          title: "Assentos",
          summary: "O que é um assento, o que consome um e o que fazer quando acabam.",
          keywords: [
            "assentos",
            "membros",
            "convidar",
            "limite",
            "capacidade",
            "usuários",
            "seats",
          ],
          body: [
            p(
              "Um assento é uma pessoa que pode entrar no seu espaço de trabalho. Seu plano inclui um número fixo, e o proprietário conta como um deles.",
            ),
            h("O que consome um assento"),
            ul(
              "Cada membro do espaço de trabalho, qualquer que seja o papel. Um membro de campo custa o mesmo assento que um admin.",
              "Cada convite pendente, até ser aceito ou revogado.",
            ),
            p(
              "Os convites pendentes seguram um assento de propósito. Sem isso, dez convites poderiam ser emitidos contra dois assentos e todos que aceitassem ficariam acima do plano.",
            ),
            h("Sem assentos"),
            steps(
              "Abra Equipe e veja os convites pendentes. Revogue os que não vão ser aceitos.",
              "Remova os membros que saíram. As capturas e o histórico deles ficam no espaço de trabalho.",
              "Se você realmente precisa de mais pessoas, suba de plano.",
            ),
            note(
              "Remover um membro libera o assento dele na hora e nunca exclui o trabalho dele.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "payment-and-invoices",
          title: "Pagamento e faturas",
          summary:
            "Onde ficam os dados do cartão, como atualizá-los e onde conseguir um recibo.",
          keywords: [
            "fatura",
            "recibo",
            "cartão",
            "pagamento",
            "imposto",
            "nota",
            "portal de cobrança",
            "invoice",
          ],
          body: [
            p(
              "Os pagamentos são processados pelo nosso processador de pagamento, não pelo GeoCliks. O número do seu cartão nunca é guardado nos nossos servidores.",
            ),
            h("Atualizar um cartão"),
            steps(
              "Abra Cobrança nas configurações do seu espaço de trabalho.",
              "Abra o portal de cobrança.",
              "Atualize a forma de pagamento por lá.",
            ),
            h("Faturas e recibos"),
            ul(
              "Todo pagamento gera uma fatura, disponível no portal de cobrança.",
              "As faturas são enviadas para o endereço de cobrança da assinatura, que não é sempre o e-mail de login do proprietário — confira se os recibos estão indo para a pessoa errada.",
              "Adicione o nome da sua empresa e os dados fiscais no portal e eles aparecem nas faturas seguintes.",
            ),
            h("Um pagamento que falhou"),
            p(
              "O processador tenta novamente um pagamento que falhou antes de qualquer coisa mudar no seu espaço de trabalho. Se continuar falhando, seu espaço de trabalho cai para os limites do plano Free — suas capturas não são excluídas, mas exportações, links de compartilhamento e teamspace param de funcionar até o pagamento passar.",
            ),
            warn(
              "Se o seu espaço de trabalho está em um plano que configuramos manualmente para você, pode não haver portal de autoatendimento. Escreva para support@geocliks.com e resolvemos a fatura.",
            ),
            see("plans-billing/cancel-or-downgrade", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "cancel-or-downgrade",
          title: "Cancelar ou rebaixar",
          summary: "Como parar de pagar, e exatamente o que acontece com a sua evidência.",
          keywords: [
            "cancelar",
            "rebaixar",
            "excluir",
            "reembolso",
            "exportar",
            "sair",
            "dados",
            "cancel",
            "downgrade",
          ],
          body: [
            p(
              "Você pode parar de pagar quando quiser. A pergunta importante é o que acontece com o trabalho, então aqui está sem rodeios.",
            ),
            h("Cancelar"),
            steps(
              "Exporte antes tudo o que você vai precisar fora do GeoCliks. Faça isso antes de cancelar, porque os formatos de exportação são limitados no plano Free.",
              "Reduza seu espaço de trabalho para caber no plano de destino, se você está rebaixando para menos assentos.",
              "Abra Cobrança e passe para o plano Free ou cancele no portal de cobrança.",
            ),
            h("O que acontece com os seus dados"),
            ul(
              "Suas capturas não são excluídas quando você rebaixa ou cancela.",
              "A verificação continua funcionando. Os códigos de foto ainda abrem, e os selos ainda conferem.",
              "Os recursos pagos param: exportações em Excel, ZIP e KMZ, links de compartilhamento, teamspace e rotas de entrega.",
              "Os links de compartilhamento existentes param de funcionar enquanto o seu plano não os incluir.",
              "Os membros além da nova contagem de assentos perdem o acesso, e é por isso que um rebaixamento pede que você os remova primeiro.",
            ),
            warn(
              "Exporte antes de cancelar, não depois. No plano Free você fica limitado a um PDF de até 20 fotos, o que não é uma forma de tirar um ano de trabalho de lá.",
            ),
            h("Excluir o espaço de trabalho por completo"),
            p(
              "Cancelar não é excluir. Se você quer o espaço de trabalho e a mídia removidos de vez, escreva para support@geocliks.com a partir do endereço do proprietário e peça a exclusão. Não há como desfazer, e confirmamos antes de fazer.",
            ),
            see("legal/data-retention", "teamspace/reports-and-exports"),
          ],
        },
      ],
    },
  ],
};
