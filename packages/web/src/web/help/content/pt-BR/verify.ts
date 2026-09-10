import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const verify: Category = {
  slug: "verify",
  title: "Verificação",
  summary:
    "Cada captura carrega um código que qualquer pessoa pode conferir e um selo que mostra se ela foi alterada.",
  icon: "ShieldCheck",
  sections: [
    {
      title: "Conferir uma captura",
      articles: [
        {
          slug: "what-is-a-photo-code",
          title: "O que é um código da foto?",
          summary:
            "O código curto impresso em cada captura e a página pública para onde ele leva.",
          keywords: [
            "código",
            "código da foto",
            "verificar",
            "pública",
            "qr",
            "prova",
            "code",
            "verify",
          ],
          body: [
            p(
              "Cada captura recebe um código único, impresso na marca d'água e levado para todo relatório e toda exportação. Ele é assim:",
            ),
            ul("GC-4K7P-92XB-1DQ4"),
            p(
              "O código é a alça daquela captura específica. Qualquer pessoa que tenha o código — um cliente, uma seguradora, um perito, um advogado — pode consultá-lo na página pública de verificação sem conta, sem o app e sem pedir nada a você.",
            ),
            h("Onde o código aparece"),
            ul(
              "Gravado na marca d'água da foto ou do vídeo, se o seu modelo incluir isso.",
              "Em todas as páginas de um relatório em PDF.",
              "Na exportação em Excel, uma linha por captura.",
              "Como nome de arquivo de cada imagem dentro de uma exportação em ZIP.",
              "No e-mail de comprovante de entrega enviado ao destinatário.",
            ),
            h("Por que isso importa"),
            p(
              "Uma foto sozinha não prova nada — qualquer pessoa consegue editar um horário dentro de uma imagem. Um código que abre um registro independente no servidor do seu fornecedor, mostrando a mesma hora, as mesmas coordenadas e um selo intacto, é outro tipo de evidência. Quem confere não precisa confiar em você.",
            ),
            note(
              "Os códigos são escritos como GC-XXXX-XXXX-XXXX, mas você pode digitá-los em minúsculas, com espaços, sem o prefixo ou colar o link inteiro de verificação. Tudo isso abre a mesma captura. Capturas feitas antes da mudança de nome carregam um código TM-; elas continuam verificando exatamente como sempre, e os códigos já impressos nos seus relatórios antigos seguem funcionando.",
            ),
            see("verify/verify-a-photo", "verify/how-sealing-works"),
          ],
        },
        {
          slug: "verify-a-photo",
          title: "Verificar uma foto",
          summary:
            "Como você ou seu cliente conferem um código e o que a página mostra.",
          keywords: [
            "verificar",
            "conferir",
            "consulta",
            "cliente",
            "página pública",
            "escanear",
            "verify",
            "lookup",
          ],
          body: [
            p(
              "A verificação é pública e leva alguns segundos. Envie o código ao cliente e ele mesmo pode conferir.",
            ),
            h("Conferir um código"),
            steps(
              "Acesse geocliks.com/v e digite o código, ou abra o link diretamente.",
              "Leia o registro: o workspace dono da captura, quando ela foi feita, onde, e o resultado de integridade.",
              "Compare com a marca d'água da foto que está na sua frente. Elas devem coincidir exatamente.",
            ),
            h("O que a página mostra"),
            table(
              ["Campo", "Significado"],
              [
                ["Workspace", "O workspace a que a captura pertence."],
                ["Capturada", "A hora do aparelho no momento do disparo."],
                [
                  "Verificada",
                  "A hora do servidor quando o arquivo chegou. Não é ajustável a partir de um celular.",
                ],
                [
                  "Localização",
                  "Coordenadas, precisão e o endereço a que elas correspondem.",
                ],
                ["Status", "Se o selo ainda coincide com o arquivo e os metadados."],
                ["Dispositivo", "O modelo e a plataforma que fizeram a captura."],
                ["Hash do conteúdo", "A impressão digital dos bytes da imagem."],
              ],
            ),
            h("Por que a imagem às vezes fica escondida"),
            p(
              "O registro é sempre público; a imagem não. A foto só aparece quando o seu workspace publicou um link de compartilhamento ativo cobrindo aquela captura. Isso é proposital — um código que escapa de um relatório não deve levar a fotografia junto. Revogue o link e a imagem volta a ser privada, enquanto o registro segue conferível.",
            ),
            note(
              "As verificações públicas são gravadas no histórico da própria captura, então você vê que um código foi conferido. Aberturas repetidas em meia hora contam como uma só, para que um cliente atualizando a página não soterre os eventos reais.",
            ),
            see("teamspace/share-links", "verify/verify-results-explained"),
          ],
        },
        {
          slug: "verify-results-explained",
          title: "Ler o resultado",
          summary:
            "Verificada, não verificada, adulterada, e o que significa um aviso de desvio do relógio.",
          keywords: [
            "verificada",
            "não verificada",
            "adulterada",
            "desvio",
            "relógio",
            "resultado",
            "aviso",
            "verified",
            "tampered",
            "skew",
          ],
          body: [
            p("Cada captura tem um de três resultados de integridade."),
            table(
              ["Resultado", "Significado"],
              [
                [
                  "Verificada",
                  "O selo coincide com o arquivo e com os metadados. Nada mudou desde o envio.",
                ],
                [
                  "Não verificada",
                  "Não foi possível confirmar o selo. Em geral é uma captura de uma versão antiga do app ou um envio incompleto — não um sinal de má-fé.",
                ],
                [
                  "Adulterada",
                  "O selo não coincide. O arquivo ou os metadados foram alterados depois do envio.",
                ],
              ],
            ),
            h("Fonte da hora e desvio do relógio"),
            p(
              "O GeoCliks registra duas horas: a do aparelho quando a foto foi tirada e a do servidor quando ela chegou. A diferença entre as duas fica guardada.",
            ),
            ul(
              "Dentro de cerca de cinco minutos, a fonte da hora aparece como rede — normal e esperado.",
              "Acima disso, aparece como aparelho, e o desvio é mostrado no registro.",
            ),
            p(
              "Um desvio grande não é automaticamente suspeito. Um celular que ficou dois dias sem conexão envia com uma diferença legítima, e o desvio explica isso. O que ele significa é que o relógio do aparelho e o do servidor discordam, e o registro diz isso em vez de escolher um em silêncio.",
            ),
            h("Explicar um resultado para o cliente"),
            ul(
              "Verificada: o registro está intacto, e é para isso que a verificação existe.",
              "Não verificada: ofereça o original a partir do seu workspace, que segue com o histórico completo.",
              "Adulterada: pare e olhe por onde o arquivo passou. Não repasse.",
            ),
            warn(
              "Editar uma foto fora do GeoCliks — recortar, comprimir, passar por um aplicativo de mensagens — muda os bytes e rompe o selo. Envie o original a partir do seu workspace ou de um relatório, nunca uma versão que passou por outra coisa.",
            ),
            see("verify/how-sealing-works", "troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "how-sealing-works",
          title: "Como o selo funciona",
          summary:
            "As três coisas que um aparelho não consegue falsificar sozinho, em palavras simples.",
          keywords: [
            "hash",
            "assinatura",
            "hmac",
            "sha-256",
            "selo",
            "adulteração",
            "segurança",
            "seal",
            "security",
          ],
          body: [
            p(
              "Você não precisa deste artigo para usar o GeoCliks. Ele está aqui para a pessoa do outro lado de uma disputa que quer saber por que o registro deve ser levado a sério.",
            ),
            h("1. Dois relógios, os dois registrados"),
            p(
              "A hora da captura vem do aparelho. A hora da verificação é marcada pelo servidor do GeoCliks quando o arquivo chega, e nenhum ajuste no celular influencia isso. As duas são guardadas, junto com a diferença. Mexer no relógio de um celular move a hora da captura e aparece na hora como uma diferença contra a hora do servidor.",
            ),
            h("2. Uma impressão digital do arquivo"),
            p(
              "Um hash SHA-256 dos bytes da imagem enviada é guardado com o registro. Mude um pixel e o hash não coincide mais. É uma impressão digital, não uma cópia — ele não diz nada sobre o conteúdo da foto.",
            ),
            h("3. Uma assinatura sobre o registro inteiro"),
            p(
              "O código da foto, o workspace dono, o usuário que capturou, o local de armazenamento, as duas horas, as coordenadas e o hash do conteúdo são combinados em uma ordem fixa e assinados com uma chave secreta guardada só no servidor. Altere qualquer um desses valores depois e a assinatura não coincide mais, o que é justamente o que produz um resultado Adulterada.",
            ),
            h("O que isso prova e o que não prova"),
            ul(
              "Prova que o arquivo e os metadados não mudaram desde que o GeoCliks os recebeu.",
              "Prova a hora de chegada de forma independente do aparelho.",
              "Não prova que o celular estava apontado para algo verdadeiro. Nenhum sistema prova. O que ele elimina é a possibilidade de mudar o registro em silêncio depois.",
            ),
            note(
              "A comparação da assinatura é feita em tempo constante, então a própria conferência não pode ser sondada para descobrir a chave.",
            ),
            see("verify/verify-results-explained", "legal/data-ownership"),
          ],
        },
      ],
    },
  ],
};
