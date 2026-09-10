import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const verify: Category = {
  slug: "verify",
  title: "Verificación",
  summary:
    "Cada captura lleva un código que cualquiera puede comprobar y un sello que revela si fue alterada.",
  icon: "ShieldCheck",
  sections: [
    {
      title: "Comprobar una captura",
      articles: [
        {
          slug: "what-is-a-photo-code",
          title: "¿Qué es un código de foto?",
          summary:
            "El código corto impreso en cada captura y la página pública a la que lleva.",
          keywords: ["código", "código de foto", "verificar", "pública", "qr", "prueba", "code", "verify"],
          body: [
            p(
              "Cada captura recibe un código único, impreso en la marca de agua y arrastrado a todos los informes y exportaciones. Se ve así:",
            ),
            ul("GC-4K7P-92XB-1DQ4"),
            p(
              "El código es el asa de esa captura concreta. Cualquiera que lo tenga —un cliente, una aseguradora, un perito, un abogado— puede consultarlo en la página pública de verificación sin cuenta, sin la app y sin pedirte nada.",
            ),
            h("Dónde aparece el código"),
            ul(
              "Grabado en la marca de agua de la foto o el video, si tu plantilla lo incluye.",
              "En todas las páginas de un informe PDF.",
              "En la exportación a Excel, una fila por captura.",
              "Como nombre de archivo de cada imagen dentro de una exportación ZIP.",
              "En el correo de comprobante de entrega que recibe el destinatario.",
            ),
            h("Por qué importa"),
            p(
              "Una foto por sí sola no prueba nada: cualquiera puede editarle una marca de tiempo. Un código que resuelve a un registro independiente en el servidor de tu proveedor, con la misma hora, las mismas coordenadas y el sello intacto, es otra clase de evidencia. Quien lo comprueba no tiene que confiar en ti.",
            ),
            note(
              "Los códigos se escriben como GC-XXXX-XXXX-XXXX, pero puedes teclearlos en minúsculas, con espacios, sin el prefijo o pegar el enlace de verificación completo. Todo eso resuelve a la misma captura. Las capturas anteriores al cambio de nombre llevan un código TM-; esas se verifican exactamente igual que siempre, y los códigos ya impresos en tus informes antiguos siguen funcionando.",
            ),
            see("verify/verify-a-photo", "verify/how-sealing-works"),
          ],
        },
        {
          slug: "verify-a-photo",
          title: "Verificar una foto",
          summary: "Cómo comprobáis un código tú o tu cliente, y qué muestra la página.",
          keywords: ["verificar", "comprobar", "consultar", "cliente", "página pública", "escanear", "verify", "lookup"],
          body: [
            p(
              "La verificación es pública y toma unos segundos. Envíale el código a un cliente y podrá hacerlo él mismo.",
            ),
            h("Comprobar un código"),
            steps(
              "Entra en geocliks.com/v e introduce el código, o abre el enlace directamente.",
              "Lee el registro: el espacio de trabajo dueño de la captura, cuándo se tomó, dónde y el resultado de integridad.",
              "Compáralo con la marca de agua de la foto que tienes delante. Deben coincidir exactamente.",
            ),
            h("Qué muestra la página"),
            table(
              ["Campo", "Significado"],
              [
                ["Propietario", "El espacio de trabajo al que pertenece la captura."],
                ["Capturada", "La hora del dispositivo cuando se disparó el obturador."],
                [
                  "Verificada",
                  "La hora del servidor cuando llegó. No se puede ajustar desde un teléfono.",
                ],
                ["Ubicación", "Coordenadas, precisión y la dirección a la que resuelven."],
                ["Integridad", "Si el sello sigue coincidiendo con el archivo y los metadatos."],
                ["Dispositivo", "El modelo y la plataforma que la capturaron."],
                ["Hash del contenido", "La huella de los bytes de la imagen."],
              ],
            ),
            h("Por qué a veces la imagen no se ve"),
            p(
              "El registro siempre es público; la imagen no. La foto solo se muestra cuando tu espacio de trabajo tiene un enlace para compartir activo que cubre esa captura. Es deliberado: un código que se filtra de un informe no debería filtrar también la fotografía. Revoca el enlace y la imagen vuelve a ser privada mientras el registro sigue siendo comprobable.",
            ),
            note(
              "Las verificaciones públicas se anotan en el historial de la propia captura, así que puedes ver que un código fue consultado. Las cargas repetidas dentro de media hora cuentan como una, para que un cliente actualizando la página no entierre los eventos reales.",
            ),
            see("teamspace/share-links", "verify/verify-results-explained"),
          ],
        },
        {
          slug: "verify-results-explained",
          title: "Leer el resultado",
          summary:
            "Verificada, no verificada, alterada, y qué significa un aviso de desfase de reloj.",
          keywords: [
            "verificada",
            "no verificada",
            "alterada",
            "desfase",
            "reloj",
            "resultado",
            "aviso",
            "verified",
            "tampered",
            "skew",
          ],
          body: [
            p("Cada captura tiene uno de tres resultados de integridad."),
            table(
              ["Resultado", "Significado"],
              [
                [
                  "Verificada",
                  "El sello coincide con el archivo y los metadatos. Nada ha cambiado desde la subida.",
                ],
                [
                  "No verificada",
                  "No se pudo confirmar el sello. Normalmente es una captura de una versión antigua de la app o una subida incompleta, no una señal de mala fe.",
                ],
                [
                  "Alterada",
                  "El sello no coincide. El archivo o sus metadatos se modificaron después de la subida.",
                ],
              ],
            ),
            h("Fuente de la hora y desfase de reloj"),
            p(
              "GeoCliks registra dos horas: la del dispositivo cuando se tomó la foto y la del servidor cuando llegó. La diferencia entre ambas queda guardada.",
            ),
            ul(
              "Dentro de unos cinco minutos, la fuente de la hora figura como red: normal y esperado.",
              "Más allá de eso, figura como dispositivo, y el desfase se muestra en el registro.",
            ),
            p(
              "Un desfase grande no es automáticamente sospechoso. Un teléfono que estuvo dos días sin conexión sube con una diferencia real, y el desfase la explica. Lo que sí significa es que el reloj del dispositivo y el del servidor no coinciden, y el registro lo dice en lugar de elegir uno en silencio.",
            ),
            h("Explicarle un resultado a un cliente"),
            ul(
              "Verificada: el registro está intacto, y para esto sirve la verificación.",
              "No verificada: ofrece el original desde tu espacio de trabajo, que conserva su historial completo.",
              "Alterada: detente y revisa por dónde ha pasado el archivo. No lo reenvíes.",
            ),
            warn(
              "Editar una foto fuera de GeoCliks —recortarla, comprimirla, pasarla por una app de mensajería— cambia los bytes y rompe el sello. Envía el original desde tu espacio de trabajo o desde un informe, nunca una versión que haya pasado por otra cosa.",
            ),
            see("verify/how-sealing-works", "troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "how-sealing-works",
          title: "Cómo funciona el sellado",
          summary:
            "Las tres cosas que un dispositivo no puede falsificar por su cuenta, en palabras llanas.",
          keywords: [
            "hash",
            "firma",
            "hmac",
            "sha-256",
            "sello",
            "manipulación",
            "seguridad",
            "seal",
            "signature",
          ],
          body: [
            p(
              "No necesitas este artículo para usar GeoCliks. Está aquí para la persona que, al otro lado de una disputa, quiere saber por qué debería creerse el registro.",
            ),
            h("1. Dos relojes, los dos registrados"),
            p(
              "La hora de captura viene del dispositivo. La hora de verificación la estampa el servidor de GeoCliks cuando llega el archivo, y ningún ajuste del teléfono puede influir en ella. Se guardan las dos, junto con la diferencia. Cambiar el reloj de un teléfono mueve la hora de captura y aparece de inmediato como una brecha frente a la hora del servidor.",
            ),
            h("2. Una huella del archivo"),
            p(
              "Con el registro se guarda un hash SHA-256 de los bytes de la imagen subida. Cambia un píxel y el hash deja de coincidir. Es una huella, no una copia: no dice nada sobre el contenido de la foto.",
            ),
            h("3. Una firma sobre todo el registro"),
            p(
              "El código de foto, el espacio de trabajo propietario, el usuario que capturó, la ubicación de almacenamiento, ambas marcas de tiempo, las coordenadas y el hash del contenido se combinan en un orden fijo y se firman con una clave secreta que solo tiene el servidor. Altera después cualquiera de esos valores y la firma deja de coincidir, que es lo que produce un resultado Alterada.",
            ),
            h("Qué prueba y qué no prueba esto"),
            ul(
              "Prueba que el archivo y sus metadatos no han cambiado desde que GeoCliks los recibió.",
              "Prueba la hora de llegada de forma independiente del dispositivo.",
              "No prueba que el teléfono apuntara a algo veraz. Ningún sistema puede. Lo que elimina es la posibilidad de cambiar el registro después, en silencio.",
            ),
            note(
              "La comparación de la firma se hace en tiempo constante, así que la propia comprobación no puede sondearse para deducir la clave.",
            ),
            see("verify/verify-results-explained", "legal/data-ownership"),
          ],
        },
      ],
    },
  ],
};
