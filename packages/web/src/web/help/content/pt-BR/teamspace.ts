import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const teamspace: Category = {
  slug: "teamspace",
  title: "Teamspace",
  summary:
    "O espaço de trabalho compartilhado onde as capturas da equipe chegam, e onde o escritório as transforma em projetos, relatórios e links compartilhados.",
  icon: "Users",
  sections: [
    {
      title: "Seu espaço de trabalho",
      articles: [
        {
          slug: "teamspace-overview",
          title: "Visão geral do Teamspace",
          summary:
            "O que é um espaço de trabalho, o que chega nele e quem pode ver cada parte.",
          keywords: [
            "espaço de trabalho",
            "organização",
            "org",
            "painel",
            "compartilhado",
            "workspace",
          ],
          body: [
            p(
              "Um teamspace é um espaço de trabalho compartilhado para uma empresa. Cada foto e vídeo que sua equipe captura no celular sobe para ele, e todas as pessoas com acesso veem a mesma biblioteca pelo aplicativo web, pelo aplicativo de computador ou pelo celular.",
            ),
            p(
              "Você não precisa mover nada para o teamspace na mão. Assim que o envio de uma captura termina, ela já está lá, com a hora verificada, a posição GPS e o endereço anexados.",
            ),
            h("O que fica em um teamspace"),
            ul(
              "A biblioteca de fotos e vídeos, com a captura mais recente primeiro.",
              "Projetos — as obras, os locais ou os clientes sob os quais você agrupa as capturas.",
              "Sua equipe: os membros, suas funções e quais projetos cada um pode ver.",
              "Modelos de marca d'água, para que todos os celulares marquem as capturas do mesmo jeito.",
              "Relatórios e exportações que você gerou, e qualquer link de compartilhamento que você entregou.",
              "Rotas de entrega, se você usa o Delivery.",
            ),
            h("Quem vê o quê"),
            p(
              "Proprietário, Admin e Gerente veem todo o espaço de trabalho. Membros de Campo veem apenas os projetos aos quais estão atribuídos — as próprias capturas mais tudo o que estiver nesses projetos. Esse é o principal motivo para organizar o trabalho em projetos em vez de deixá-lo solto.",
            ),
            note(
              "O Teamspace faz parte do plano Business e superiores. Nos planos Free e Plus você continua com captura, marca d'água e verificação completas, mas o espaço de trabalho é só seu.",
            ),
            see(
              "teamspace/create-a-project",
              "teamspace/roles-and-permissions",
              "plans-billing/compare-plans",
            ),
          ],
        },
        {
          slug: "create-a-project",
          title: "Criar um projeto",
          summary:
            "Agrupe capturas por obra, local ou cliente para que filtros, relatórios e acesso da equipe fiquem alinhados.",
          keywords: ["projeto", "obra", "local", "cliente", "pasta", "project", "job"],
          body: [
            p(
              "Um projeto é um contêiner para capturas — normalmente uma obra, um local ou um cliente. Os projetos são a base dos relatórios, definem o acesso dos membros de Campo e são o critério de agrupamento do mapa e da visualização antes e depois.",
            ),
            h("Crie um"),
            steps(
              "No aplicativo web, abra Projetos e escolha Novo projeto.",
              "Dê um nome. Esse é o único campo obrigatório.",
              "Se quiser, adicione um código de obra, o nome do cliente, um rótulo de local e um endereço.",
              "Adicione uma categoria e notas internas, se sua equipe usa esses campos.",
              "Salve. O projeto fica disponível na hora no seletor de projetos do aplicativo móvel.",
            ),
            h("Campos e para que servem"),
            table(
              ["Campo", "O que faz"],
              [
                [
                  "Nome",
                  "Como o projeto aparece em todos os lugares. Até 90 caracteres.",
                ],
                ["Código", "Seu próprio número de obra ou ordem de serviço. Pesquisável."],
                ["Cliente", "Para quem é o trabalho. Útil na hora de exportar."],
                ["Rótulo de local", "Um nome humano para o local, como “Pátio norte”."],
                ["Endereço", "O endereço do local. Usado para centralizar o projeto no mapa."],
                ["Categoria", "Seu próprio agrupamento, como “Telhado” ou “Inspeção”."],
                ["Notas", "Contexto interno. Nunca aparece em um link de compartilhamento."],
              ],
            ),
            h("Situação do projeto"),
            p(
              "Todo projeto está em uma destas situações: Ativo, Em espera, Concluído ou Arquivado. A situação não muda nada em acesso ou armazenamento — ela existe para que uma obra encerrada pare de poluir a lista. Filtre por situação no topo da página Projetos.",
            ),
            note(
              "Criar um projeto exige a função Gerente ou superior. Membros de Campo podem capturar nos projetos aos quais estão atribuídos, mas não podem criar novos.",
            ),
            warn(
              "Cada plano inclui um número definido de projetos. Se você atingir o limite, será convidado a fazer upgrade em vez de conseguir criar um projeto que não estaria coberto.",
            ),
            see("teamspace/invite-your-crew", "mobile-app/assign-capture-to-project"),
          ],
        },
        {
          slug: "browse-and-filter-photos",
          title: "Navegar e filtrar fotos",
          summary:
            "Reduza milhares de capturas às poucas que você precisa por projeto, pessoa, etiqueta, data ou texto.",
          keywords: [
            "buscar",
            "filtrar",
            "biblioteca",
            "galeria",
            "etiqueta",
            "encontrar",
            "search",
            "filter",
            "tag",
          ],
          body: [
            p(
              "A biblioteca de fotos mostra todas as capturas do espaço de trabalho, da mais recente para a mais antiga. Os filtros se acumulam — defina quantos quiser e todos serão aplicados juntos.",
            ),
            h("Os filtros"),
            ul(
              "Projeto — apenas as capturas atribuídas a esse projeto.",
              "Membro — apenas as capturas feitas por uma pessoa.",
              "Etiqueta — geral, antes, depois, problema, chegada, saída, coleta ou entrega.",
              "Intervalo de datas — capturas feitas entre duas datas, com base na hora da captura, não na hora do envio.",
              "Busca — procura no endereço, na nota da captura e no código da foto.",
            ),
            h("Buscar pelo código da foto"),
            p(
              "Se um cliente citar um código de foto de uma marca d'água, cole-o na caixa de busca. Ele encontra exatamente aquela captura, o que é mais rápido do que rolar até a data.",
            ),
            h("Trabalhar com uma seleção"),
            p(
              "Selecione várias capturas para movê-las para um projeto, etiquetá-las, gerar um relatório apenas com elas ou excluí-las. Excluir exige a função Gerente ou superior.",
            ),
            note(
              "Os filtros de data usam a hora em que a foto foi tirada. Uma captura que ficou dois dias na fila offline continua sendo filtrada para o dia em que a equipe estava no local.",
            ),
            see("teamspace/map-view", "teamspace/reports-and-exports", "verify/verify-a-photo"),
          ],
        },
        {
          slug: "map-view",
          title: "Visualização em mapa",
          summary:
            "Veja cada captura como um marcador e confirme que a equipe estava onde a papelada diz.",
          keywords: ["mapa", "gps", "marcadores", "localização", "coordenadas", "map", "pins"],
          body: [
            p(
              "A visualização em mapa posiciona suas capturas pela posição GPS registrada. Ela responde à pergunta que uma grade de fotos não responde: o trabalho foi feito onde deveria ser feito?",
            ),
            h("Como usar"),
            steps(
              "Abra Mapa na navegação do espaço de trabalho.",
              "Aplique os mesmos filtros de projeto, membro, etiqueta e data que você usa na biblioteca.",
              "Clique em um marcador para ver a captura, o endereço e a hora exata.",
              "Amplie um agrupamento para separar marcadores que estão a poucos metros um do outro.",
            ),
            h("Quando um marcador parece errado"),
            ul(
              "Em ambientes fechados, em um subsolo ou entre prédios altos, a precisão do GPS cai. O marcador pode ficar dezenas de metros fora do lugar mesmo que a foto seja legítima.",
              "O endereço é resolvido a partir das coordenadas, então uma posição ruim gera um nome de rua plausível, mas errado.",
              "Capturas feitas com a permissão de localização negada não têm marcador nenhum e não aparecem no mapa.",
            ),
            note(
              "Você pode exportar a seleção atual do mapa como um arquivo KMZ e abri-lo no Google Earth, que é o que concessionárias e clientes municipais costumam pedir.",
            ),
            see("troubleshoot/gps-or-address-wrong", "teamspace/reports-and-exports"),
          ],
        },
        {
          slug: "before-after-compare",
          title: "Comparação antes e depois",
          summary:
            "Coloque duas capturas lado a lado para mostrar a mudança pela qual você foi pago.",
          keywords: [
            "antes",
            "depois",
            "comparar",
            "progresso",
            "before",
            "after",
            "compare",
          ],
          body: [
            p(
              "A visualização de comparação junta duas capturas do mesmo projeto e as mostra lado a lado, cada uma com sua própria hora verificada e endereço. É a forma mais rápida de comprovar um trabalho concluído.",
            ),
            h("Configure"),
            steps(
              "Etiquete a primeira captura como Antes, no aplicativo ou na biblioteca web.",
              "Etiquete a captura do estado final como Depois.",
              "Abra o projeto e escolha a visualização Antes e depois.",
              "Escolha o par que você quer, se houver mais de um etiquetado.",
            ),
            h("Como obter um par limpo"),
            ul(
              "Fique aproximadamente no mesmo ponto e segure o celular na mesma altura nas duas fotos.",
              "Enquadre uma referência fixa nas duas — uma porta, um poste, um canto.",
              "Tire a foto Depois da mesma distância; usar zoom em vez de se mover muda a perspectiva.",
            ),
            note(
              "Antes e depois é um dos layouts de relatório, então, com o par etiquetado, você pode colocá-lo direto em um PDF para o cliente.",
            ),
            see("teamspace/reports-and-exports", "mobile-app/take-a-photo"),
          ],
        },
      ],
    },
    {
      title: "Compartilhar o trabalho",
      articles: [
        {
          slug: "reports-and-exports",
          title: "Relatórios e exportações",
          summary:
            "Transforme um conjunto filtrado de capturas em um PDF, uma planilha Excel, um ZIP ou um KMZ.",
          keywords: [
            "pdf",
            "excel",
            "xlsx",
            "zip",
            "kmz",
            "exportar",
            "relatório",
            "baixar",
            "export",
            "report",
          ],
          body: [
            p(
              "Um relatório é um retrato de um conjunto de capturas em um arquivo que você pode enviar. Monte o conjunto com filtros primeiro e depois exporte — o que está na tela é o que vai para o arquivo.",
            ),
            h("Gerar um relatório"),
            steps(
              "Filtre a biblioteca até as capturas que você quer, ou abra um projeto.",
              "Escolha Exportar e dê um título ao relatório.",
              "Escolha um layout: grade, detalhado, antes e depois ou mapa.",
              "Escolha um formato: PDF, Excel, ZIP ou KMZ.",
              "Gere. O arquivo é montado no servidor e aparece na sua lista de relatórios para baixar na hora ou depois.",
            ),
            h("Qual formato usar"),
            table(
              ["Formato", "Use para"],
              [
                [
                  "PDF",
                  "Documentação para o cliente. Fotos com marca d'água, diagramadas e paginadas.",
                ],
                [
                  "Excel",
                  "Uma linha por captura, com hora, coordenadas, endereço, etiqueta e nota.",
                ],
                ["ZIP", "Os arquivos de imagem originais, para entregar a outro sistema."],
                [
                  "KMZ",
                  "Abrir as localizações das capturas no Google Earth ou em software de GIS.",
                ],
              ],
            ),
            h("Layouts"),
            ul(
              "Grade — muitas fotos por página, melhor para volume.",
              "Detalhado — uma captura por página, com o bloco completo de metadados.",
              "Antes e depois — pares etiquetados lado a lado.",
              "Mapa — as localizações das capturas no mapa, com um índice de fotos.",
            ),
            warn(
              "Os formatos de exportação dependem do seu plano. O plano Free gera um PDF de até 20 fotos; Excel, ZIP e KMZ começam no Plus. Se um formato não estiver coberto, você é avisado antes de o arquivo ser montado, não depois.",
            ),
            see("plans-billing/compare-plans", "troubleshoot/export-or-report-failed"),
          ],
        },
        {
          slug: "share-links",
          title: "Links de compartilhamento",
          summary:
            "Envie uma captura para alguém sem conta e retome o link quando terminar.",
          keywords: [
            "compartilhar",
            "link",
            "url",
            "cliente",
            "público",
            "revogar",
            "validade",
            "share",
            "revoke",
          ],
          body: [
            p(
              "Um link de compartilhamento é um endereço web que mostra uma captura — a mídia, a hora verificada, a posição GPS e o endereço — para qualquer pessoa que o abrir. Sem conta, sem aplicativo, sem login.",
            ),
            h("Criar um link"),
            steps(
              "Abra a captura no aplicativo web.",
              "Escolha Compartilhar.",
              "Se quiser, defina uma validade em dias. Deixe em branco para um link que não expira.",
              "Copie o link e envie.",
            ),
            h("Gerenciar links"),
            ul(
              "Todo link aparece listado no espaço de trabalho, com a data de criação e quantas vezes foi aberto.",
              "Revogue um link quando quiser. Ele para de funcionar imediatamente para todos que o têm.",
              "Se você pedir para compartilhar uma captura que já tem um link ativo, você recebe o link existente em vez de um segundo link.",
            ),
            h("O que um link de compartilhamento não expõe"),
            ul(
              "Suas outras capturas, projetos ou equipe.",
              "Notas internas do projeto.",
              "Qualquer coisa sobre seu espaço de trabalho, plano ou cobrança.",
            ),
            warn(
              "Trate o link como público. Qualquer pessoa para quem ele for repassado consegue abri-lo até você revogá-lo ou ele expirar.",
            ),
            note(
              "Links de compartilhamento são um recurso dos planos pagos. Se Compartilhar não estiver disponível, verifique seu plano.",
            ),
            see("verify/verify-a-photo", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Sua equipe",
      articles: [
        {
          slug: "invite-your-crew",
          title: "Convidar sua equipe",
          summary:
            "Adicione pessoas por e-mail ou código QR e coloque-as nos projetos certos desde o primeiro dia.",
          keywords: [
            "convite",
            "adicionar membro",
            "assento",
            "qr",
            "equipe",
            "invite",
            "seat",
            "crew",
          ],
          body: [
            p(
              "Os membros entram por convite. Você envia um, a pessoa aceita e as capturas dela começam a chegar no seu teamspace.",
            ),
            h("Enviar um convite"),
            steps(
              "Abra Equipe e escolha Convidar.",
              "Informe o e-mail de trabalho da pessoa.",
              "Escolha uma função. Campo é o padrão e serve para a maior parte da equipe.",
              "Marque os projetos aos quais ela já deve ter acesso no primeiro login.",
              "Envie. A pessoa recebe um e-mail com um link que a adiciona ao seu espaço de trabalho.",
            ),
            h("Convidar alguém que está ao seu lado"),
            p(
              "Todo convite pendente também tem um código QR. Mostre-o na sua tela, peça para a pessoa escaneá-lo com a câmera do celular e ela cai na página de aceite sem você digitar o endereço dela. Útil para uma equipe que está no local com você.",
            ),
            h("Assentos"),
            p(
              "Cada plano inclui um número de assentos. Um convite pendente ocupa um assento, então cinco convites contra três assentos serão recusados em vez de deixar todos aceitarem e estourar o plano. Se você ficou sem assentos, revogue um convite que não vai ser aceito, remova um membro que saiu ou faça upgrade.",
            ),
            h("Se o convite não chegar"),
            ul(
              "Peça para a pessoa verificar o spam e confirme o endereço que você usou.",
              "Verifique a lista de pendentes — se o convite estiver lá, reenvie ou use o código QR.",
              "Um convite está vinculado ao endereço de e-mail para o qual foi enviado; aceitar com um endereço diferente não funciona.",
            ),
            note("Convidar e remover membros exige a função Admin ou superior."),
            see("teamspace/roles-and-permissions", "troubleshoot/invite-not-working"),
          ],
        },
        {
          slug: "roles-and-permissions",
          title: "Funções e permissões",
          summary:
            "Proprietário, Admin, Gerente e Campo — o que cada um pode fazer e quem deve receber qual função.",
          keywords: [
            "função",
            "permissão",
            "admin",
            "gerente",
            "campo",
            "acesso",
            "proprietário",
            "role",
            "permission",
          ],
          body: [
            p(
              "Existem quatro funções. Cada membro tem exatamente uma, e ela decide o que a pessoa vê e o que pode alterar.",
            ),
            table(
              ["Função", "Pode fazer"],
              [
                [
                  "Proprietário",
                  "Tudo, incluindo cobrança e mudança de plano. Um por espaço de trabalho, e não pode ser retirado.",
                ],
                [
                  "Admin",
                  "Convidar e remover membros, alterar funções, gerenciar projetos, modelos e exportações.",
                ],
                [
                  "Gerente",
                  "Criar e editar projetos, excluir capturas, enviar comunicados, gerar relatórios. Sem gestão de membros.",
                ],
                [
                  "Campo",
                  "Capturar e ver apenas os projetos aos quais está atribuído. Sem acesso a equipe, convites ou cobrança.",
                ],
              ],
            ),
            h("O que dar para cada pessoa"),
            ul(
              "Equipe na operação: Campo.",
              "Um encarregado ou líder de local que organiza as obras: Gerente.",
              "Pessoal do escritório que cadastra gente e cuida da documentação do cliente: Admin.",
              "Mantenha Proprietário com quem paga a conta.",
            ),
            h("Alterar uma função"),
            steps(
              "Abra Equipe.",
              "Escolha o membro.",
              "Escolha a nova função. Ela entra em vigor na próxima vez que o aplicativo da pessoa se comunicar com o servidor.",
            ),
            h("Remover alguém"),
            p(
              "Remover um membro retira o acesso dele. Não apaga o trabalho: as fotos, os vídeos e a trilha de auditoria por trás deles continuam no teamspace, que é justamente o motivo de guardar evidências em um espaço de trabalho e não em um celular.",
            ),
            warn(
              "Você não pode remover o Proprietário do espaço de trabalho nem a si mesmo. Só o Proprietário pode remover outro Admin, então dois Admins não conseguem remover um ao outro.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
        {
          slug: "messages-and-broadcasts",
          title: "Mensagens e comunicados",
          summary:
            "Fale com um membro da equipe ou envie um aviso para todos de uma vez.",
          keywords: [
            "mensagem",
            "conversa",
            "comunicado",
            "aviso",
            "notificar",
            "message",
            "broadcast",
            "push",
          ],
          body: [
            p(
              "As mensagens são conversas individuais entre pessoas do mesmo espaço de trabalho. Elas chegam como notificação no celular, então você não precisa correr atrás da equipe por um aplicativo de conversa pessoal.",
            ),
            h("Mandar mensagem para alguém"),
            steps(
              "Abra Mensagens.",
              "Escolha a pessoa nos contatos do seu espaço de trabalho.",
              "Escreva e envie. Você pode anexar uma captura recente para deixar claro do que está falando.",
            ),
            h("Comunicados"),
            p(
              "Um comunicado envia a mesma mensagem para todo mundo no espaço de trabalho de uma vez. Ele é entregue como uma mensagem normal na conversa de cada pessoa, então as respostas voltam para você em privado em vez de virar uma discussão em grupo.",
            ),
            steps(
              "Abra Mensagens e escolha Comunicado.",
              "Se quiser, anexe um projeto, para que as pessoas saibam de qual obra se trata.",
              "Escreva a mensagem e envie. Você verá para quantas pessoas ela foi.",
            ),
            note(
              "Enviar um comunicado exige a função Gerente ou superior. As mensagens individuais estão abertas para todos no espaço de trabalho.",
            ),
            see("mobile-app/notifications", "troubleshoot/notifications-not-arriving"),
          ],
        },
      ],
    },
    {
      title: "Padrões",
      articles: [
        {
          slug: "watermark-template-library",
          title: "Biblioteca de modelos de marca d'água",
          summary:
            "Defina a marca que todos os celulares do espaço de trabalho usam, para que as capturas voltem consistentes.",
          keywords: [
            "marca d'água",
            "modelo",
            "marca",
            "logotipo",
            "padrão",
            "watermark",
            "template",
            "logo",
          ],
          body: [
            p(
              "Um modelo de marca d'água decide o que é gravado no canto de cada captura: quais campos aparecem, onde o bloco fica e se o seu logotipo entra nele. Os modelos ficam no espaço de trabalho, não em um aparelho, então o que você define aqui é o que toda a equipe grava.",
            ),
            h("Criar um modelo"),
            steps(
              "Abra Modelos nas configurações do espaço de trabalho.",
              "Escolha Novo modelo e dê um nome pelo caso de uso, não pelo cliente — “Progresso de obra” envelhece melhor que “Obra Northline”.",
              "Marque os campos a exibir: data e hora, coordenadas, endereço, projeto, nome do membro, código da foto, clima, uma linha personalizada.",
              "Escolha o canto e o tamanho, e envie um logotipo se quiser um.",
              "Salve.",
            ),
            h("O modelo padrão"),
            p(
              "Um dos modelos é o padrão do espaço de trabalho. Novos membros o recebem automaticamente, e é o que um celular usa até alguém trocar. Defina outro padrão quando quiser; as capturas existentes não são alteradas.",
            ),
            h("Organização"),
            ul(
              "Excluir um modelo não altera as capturas já gravadas com ele.",
              "Você não pode ficar sem modelo padrão — promover um modelo rebaixa o anterior no mesmo passo.",
              "A equipe pode alternar entre os modelos do espaço de trabalho no celular, mas não pode editá-los.",
            ),
            warn(
              "O plano Free inclui dois modelos. Os planos pagos permitem montar seu próprio conjunto com logotipo.",
            ),
            see("mobile-app/watermark-templates", "mobile-app/switch-template"),
          ],
        },
      ],
    },
  ],
};
