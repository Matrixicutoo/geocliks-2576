import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const legal: Category = {
  slug: "legal",
  title: "Privacidade e jurídico",
  summary:
    "Quem é dono da evidência, por quanto tempo ela é guardada e o que a Política de Privacidade e os Termos realmente dizem.",
  icon: "Scale",
  sections: [
    {
      title: "Seus dados",
      articles: [
        {
          slug: "data-ownership",
          title: "Quem é dono das suas capturas",
          summary:
            "Suas fotos e vídeos continuam seus. O que o GeoCliks pode fazer com eles e o que não pode.",
          keywords: [
            "propriedade",
            "direitos",
            "licença",
            "conteúdo",
            "treinamento",
            "ownership",
            "rights",
          ],
          body: [
            p(
              "Você é dono de tudo o que envia: as fotos, os vídeos, os dados dos projetos, as anotações. O GeoCliks guarda isso e prova que nada mudou. O conteúdo não passa a ser nosso por ter sido enviado.",
            ),
            h("O que temos permissão de fazer com isso"),
            p(
              "Os Termos dão ao GeoCliks uma licença restrita — hospedar, armazenar, transmitir, redimensionar, indexar e exibir suas capturas — e apenas para que o produto funcione para você e para as pessoas com quem você compartilha. É todo o alcance.",
            ),
            ul(
              "Não vendemos o seu conteúdo.",
              "Não usamos o conteúdo para treinar modelos de aprendizado de máquina de terceiros.",
              "Não mostramos o conteúdo a ninguém com quem você não tenha compartilhado.",
            ),
            h("O registro pertence ao espaço de trabalho, não à pessoa"),
            p(
              "As capturas pertencem ao espaço de trabalho em que foram feitas, não ao membro da equipe que apertou o botão. Isso é proposital, e é o que mantém o registro de evidência de pé:",
            ),
            ul(
              "Remover um membro mantém todas as fotos que ele tirou e mantém as entradas dele no histórico da captura.",
              "Excluir um projeto não exclui as capturas dele.",
              "Um membro que sai perde o acesso ao conteúdo do espaço de trabalho, mas não leva o conteúdo com ele.",
            ),
            note(
              "Se você está em um espaço de trabalho que não é seu e quer mudar algo sobre suas capturas, fale primeiro com o proprietário do espaço de trabalho. Para aquele conteúdo, o GeoCliks age conforme as instruções do espaço de trabalho.",
            ),
            h("Do que você é responsável"),
            p(
              "Você confirma que tem o direito de registrar e enviar o que envia — incluindo qualquer autorização necessária das pessoas, dos proprietários do imóvel ou dos responsáveis pelo local que aparecem na imagem. O GeoCliks não confere isso por você.",
            ),
            h("O que o selo prova e o que não prova"),
            p(
              "O código, o hash e a assinatura de cada captura tornam a adulteração difícil de passar despercebida e permitem que qualquer pessoa confira que um arquivo não mudou desde que chegou. Eles não transformam o GeoCliks em notário, topógrafo ou serviço jurídico, e nenhum juiz, seguradora ou cliente é obrigado a aceitar o registro. Essa decisão é sempre deles.",
            ),
            see("verify/how-sealing-works", "legal/data-retention", "legal/terms-summary"),
          ],
        },
        {
          slug: "data-retention",
          title: "Por quanto tempo seus dados são guardados",
          summary:
            "O que sobrevive a um projeto excluído, a um membro removido, a um plano cancelado e a um espaço de trabalho encerrado.",
          keywords: [
            "retenção",
            "excluir",
            "exclusão",
            "guardar",
            "armazenamento",
            "cancelar",
            "encerrar conta",
            "apagar",
            "retention",
            "delete",
          ],
          body: [
            p(
              "A versão curta: o conteúdo do espaço de trabalho é guardado enquanto o espaço de trabalho existir. Quase nada mais o remove.",
            ),
            table(
              ["O que você faz", "O que acontece com as capturas"],
              [
                [
                  "Excluir um projeto",
                  "As capturas são mantidas. O registro de evidência não está amarrado ao projeto.",
                ],
                [
                  "Remover um membro",
                  "As fotos e as entradas de histórico dele ficam com o espaço de trabalho.",
                ],
                [
                  "Excluir sua própria conta",
                  "Seu perfil e suas credenciais somem. As capturas que você fez no espaço de trabalho de outra pessoa ficam com aquele espaço de trabalho.",
                ],
                [
                  "Cancelar um plano pago",
                  "Nada é excluído. O espaço de trabalho cai para o plano gratuito e os recursos pagos param.",
                ],
                ["Encerrar o espaço de trabalho", "Tudo vai embora, e não há como desfazer."],
              ],
            ),
            h("Cancelar não é excluir"),
            p(
              "Rebaixar ou cancelar nunca destrói capturas. Você mantém seu histórico, e todo código da foto que já foi entregue a um cliente continua abrindo na página pública de verificação. O que você perde são os recursos acima dos limites gratuitos — assentos extras, links de compartilhamento, os formatos de exportação mais completos.",
            ),
            h("Encerrar um espaço de trabalho de vez"),
            p(
              "Não existe botão de autoatendimento para excluir um espaço de trabalho inteiro, e isso é de propósito — é fácil demais destruir um registro de evidência por acidente.",
            ),
            steps(
              "O proprietário do espaço de trabalho escreve para support@geocliks.com a partir do endereço da conta de proprietário.",
              "Exporte antes tudo o que você quer guardar — PDF, Excel, ZIP ou KMZ.",
              "Nós confirmamos o pedido e então removemos o espaço de trabalho e suas capturas.",
            ),
            warn(
              "A exclusão de um espaço de trabalho é permanente. Capturas, projetos, relatórios e códigos de foto vão todos embora, e todo link de verificação entregue a um cliente para de abrir. Exporte primeiro.",
            ),
            h("Backups e logs"),
            p(
              "Backups e logs de segurança são guardados por um período limitado e depois rotacionados, então uma exclusão pode demorar um pouco para percorrer todas as cópias.",
            ),
            h("Pedir seus próprios dados"),
            p(
              "Você pode pedir para acessar, corrigir, exportar ou excluir seus dados pessoais. A maior parte você mesmo altera no seu perfil e nas configurações de cobrança. Para o resto, escreva para support@geocliks.com a partir do endereço da sua conta.",
            ),
            see(
              "legal/data-ownership",
              "plans-billing/cancel-or-downgrade",
              "legal/privacy-summary",
            ),
          ],
        },
      ],
    },
    {
      title: "Os documentos jurídicos",
      articles: [
        {
          slug: "privacy-summary",
          title: "Política de Privacidade, em palavras simples",
          summary:
            "O que o GeoCliks coleta, por quê, quem mais vê e quais escolhas você tem. Um resumo, não um substituto.",
          keywords: [
            "privacidade",
            "política",
            "lgpd",
            "gdpr",
            "dados pessoais",
            "localização",
            "cookies",
            "direitos",
            "privacy",
          ],
          body: [
            p(
              "Esta é uma leitura simples da Política de Privacidade, para você saber o que há nela. A política em si é o documento que vale, e está em geocliks.com/privacy.",
            ),
            h("O que é coletado"),
            ul(
              "Dados de conta: nome, e-mail, um hash da sua senha (nunca a senha), foto de perfil, idioma, tema e seu segredo de dois fatores, se você ativar.",
              "Dados do espaço de trabalho: nomes de espaço de trabalho e projetos, clientes, locais, papéis, convites, modelos e relatórios.",
              "Capturas: a foto ou o vídeo mais a hora, as coordenadas, o endereço resolvido, a hora de captura do aparelho, o código da foto, o hash do conteúdo e a assinatura.",
              "Mensagens: mensagens diretas e comunicados dentro do espaço de trabalho, incluindo imagens anexadas.",
              "Dados do aparelho: versão do app, plataforma, endereço IP, token de push, logs de erro e eventos básicos de uso.",
              "Dados de cobrança: seu plano, o status da assinatura e os identificadores devolvidos pelo processador de pagamento. Números de cartão nunca chegam a nós.",
            ),
            note(
              "O GeoCliks não quer números de documento, informações de saúde ou outras categorias sensíveis. Mantenha isso fora de nomes de projeto, anotações e mensagens.",
            ),
            h("Localização e câmera"),
            p(
              "O app pede câmera e localização porque uma captura é uma foto mais o onde e o quando. Você pode negar qualquer uma das permissões e o app continua funcionando — mas uma captura sem localização não carrega coordenadas nem endereço, que é a maior parte do que a torna evidência. A localização é lida no momento da captura e para colocar os pinos no seu mapa. Não há rastreamento em segundo plano.",
            ),
            h("Quem mais vê"),
            p(
              "Seus dados não são vendidos e nunca são compartilhados para publicidade. Um conjunto pequeno de fornecedores processa os dados seguindo nossas instruções: hospedagem e armazenamento em nuvem, o processador de pagamento (e a Apple, para compras dentro do app), o provedor de e-mail, o serviço de notificações push e o provedor de mapas que resolve endereços.",
            ),
            h("Links de compartilhamento são realmente públicos"),
            p(
              "Links de compartilhamento e páginas de verificação funcionam para qualquer pessoa que tenha o link, sem login. É justamente o objetivo deles. Revogar um link impede acessos futuros, mas não recupera uma cópia que alguém já baixou.",
            ),
            h("Seus direitos"),
            p(
              "Conforme a lei local, você pode pedir para acessar, corrigir, exportar ou excluir seus dados pessoais, restringir ou se opor a certos tratamentos e retirar o consentimento. Escreva para support@geocliks.com a partir do endereço da sua conta. No Canadá, você também pode reclamar ao Office of the Privacy Commissioner; no EEE ou no Reino Unido, à autoridade de proteção de dados local.",
            ),
            h("Cookies"),
            p(
              "Só o que o produto precisa: manter você conectado, lembrar idioma e tema e guardar as capturas na fila enquanto você está offline. Nenhum cookie de publicidade ou de rastreamento entre sites.",
            ),
            note(
              "A Política de Privacidade e os Termos são publicados só em inglês, de propósito. Traduzir texto jurídico por máquina pode mudar o significado.",
            ),
            see("legal/data-retention", "teamspace/share-links", "legal/terms-summary"),
          ],
        },
        {
          slug: "terms-summary",
          title: "Termos de Serviço, em palavras simples",
          summary:
            "As obrigações dos dois lados, os limites que o GeoCliks declara abertamente e o que acontece se você parar de pagar.",
          keywords: [
            "termos",
            "contrato",
            "responsabilidade",
            "uso aceitável",
            "cobrança",
            "assentos",
            "terms",
            "tos",
          ],
          body: [
            p(
              "Uma leitura simples dos Termos. O documento em geocliks.com/terms é o que obriga; isto está aqui para que nada nele surpreenda você.",
            ),
            h("Quem pode usar"),
            p(
              "Você precisa ter 16 anos ou mais. Se você se cadastra por uma empresa, está confirmando que tem autorização para aceitar os Termos em nome dela.",
            ),
            h("Limites que o GeoCliks declara abertamente"),
            p(
              "Os Termos são incomumente diretos sobre o que o produto não pode prometer, e vale ler essa lista em vez de supor:",
            ),
            ul(
              "O GeoCliks não é notário, topógrafo, laboratório nem serviço jurídico, e nada do que ele produz é orientação jurídica.",
              "Uma hora verificada pela rede significa que nosso servidor registrou quando o envio chegou — não que o relógio do aparelho estava certo.",
              "Quando o relógio de um aparelho difere do nosso em mais de alguns minutos, a captura é marcada como com hora do aparelho.",
              "A precisão da localização depende do celular e do entorno; em ambientes fechados e entre prédios altos ela pode errar bastante.",
              "Capturas feitas offline só são seladas como verificadas quando chegam aos nossos servidores.",
              "Nenhum juiz, seguradora, cliente ou autoridade é obrigado a aceitar um registro do GeoCliks.",
            ),
            h("O que você concorda em não fazer"),
            ul(
              "Usar o Serviço de forma ilegal, ou para assediar, vigiar ou intimidar alguém.",
              "Enviar conteúdo que você não tem direito de enviar.",
              "Alterar, falsificar ou remover uma marca, hash, assinatura ou código da foto, ou apresentar material alterado como registro do GeoCliks.",
              "Sondar, sobrecarregar ou interferir no Serviço, ou contornar limites de uso e cotas do plano.",
              "Revender o Serviço, ou dividir um assento entre várias pessoas.",
            ),
            warn(
              "Assentos são por pessoa, não por aparelho. Um membro da equipe pode entrar no celular, no tablet e na web — mas duas pessoas dividindo um login violam os Termos e tornam o histórico de capturas inútil, porque toda foto é atribuída a quem é dono do assento.",
            ),
            h("Cobrança"),
            p(
              "Planos pagos renovam automaticamente até serem cancelados. Assinaturas feitas na web são cobradas pelo nosso processador de pagamento; assinaturas compradas dentro do app iOS são cobradas pela Apple e seguem o processo de reembolso da Apple. Os preços não incluem impostos. Valores já pagos não são reembolsados, exceto quando a lei exigir.",
            ),
            p(
              "Se um pagamento falhar ou você cancelar, o espaço de trabalho passa para o plano gratuito e os recursos pagos param. Suas capturas ficam.",
            ),
            h("Suspensão"),
            p(
              "Podemos suspender ou encerrar o acesso por violação dos Termos, por uso que ponha em risco o Serviço ou outros clientes, ou quando a lei exigir. Quando for razoável, avisamos antes e damos a chance de exportar.",
            ),
            h("Disponibilidade e responsabilidade"),
            p(
              "Não há garantia contratual de disponibilidade, a menos que você tenha assinado um acordo por escrito separado conosco. O Serviço é fornecido como está, e a responsabilidade total por qualquer reclamação é limitada ao que você pagou nos doze meses anteriores a ela. Algumas jurisdições não permitem partes disso, e nesses casos os limites valem só até onde a lei permitir.",
            ),
            h("Mudanças"),
            p(
              "Mudanças relevantes nos Termos ou na Política de Privacidade são anunciadas no app ou por e-mail antes de entrarem em vigor. Dúvidas sobre qualquer um dos documentos vão para support@geocliks.com.",
            ),
            see(
              "legal/data-ownership",
              "plans-billing/seats-and-billing",
              "verify/verify-results-explained",
            ),
          ],
        },
      ],
    },
  ],
};
