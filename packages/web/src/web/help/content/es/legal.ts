import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const legal: Category = {
  slug: "legal",
  title: "Privacidad y aspectos legales",
  summary:
    "De quién es la evidencia, cuánto tiempo se conserva y qué dicen de verdad la Política de privacidad y los Términos.",
  icon: "Scale",
  sections: [
    {
      title: "Tus datos",
      articles: [
        {
          slug: "data-ownership",
          title: "De quién son tus capturas",
          summary:
            "Tus fotos y videos siguen siendo tuyos. Qué puede hacer GeoCliks con ellos y qué no.",
          keywords: [
            "propiedad",
            "derechos",
            "licencia",
            "contenido",
            "entrenamiento",
            "ownership",
            "rights",
            "license",
          ],
          body: [
            p(
              "Todo lo que subes es tuyo: las fotos, los videos, los datos de los proyectos, las notas. GeoCliks lo guarda y prueba que no ha cambiado. No pasa a ser nuestro por el hecho de subirlo.",
            ),
            h("Qué nos permites hacer con ello"),
            p(
              "Los Términos le dan a GeoCliks una licencia estrecha —alojar, almacenar, transmitir, redimensionar, indexar y mostrar tus capturas— y solo para que el producto funcione para ti y para las personas con quienes compartes. Ese es todo el alcance.",
            ),
            ul(
              "No vendemos tu contenido.",
              "No lo usamos para entrenar modelos de aprendizaje automático de terceros.",
              "No se lo mostramos a nadie con quien no lo hayas compartido.",
            ),
            h("El registro es del espacio de trabajo, no de la persona"),
            p(
              "Las capturas pertenecen al espacio de trabajo donde se tomaron, no al miembro del equipo que pulsó el disparador. Es deliberado, y es lo que mantiene en pie el registro de evidencia:",
            ),
            ul(
              "Quitar a un miembro conserva todas las fotos que tomó y sus entradas en el historial de capturas.",
              "Borrar un proyecto no borra sus capturas.",
              "Quien se va pierde el acceso al contenido del espacio de trabajo, pero no se lo lleva consigo.",
            ),
            note(
              "Si estás en un espacio de trabajo que no es tuyo y quieres cambiar algo sobre tus capturas, pídeselo primero al propietario. Para ese contenido GeoCliks actúa según las instrucciones del espacio de trabajo.",
            ),
            h("De qué respondes tú"),
            p(
              "Confirmas que tienes derecho a tomar y subir lo que subes, incluidos los permisos que necesites de las personas, los dueños de la propiedad o los responsables del sitio que aparecen en el encuadre. GeoCliks no lo comprueba por ti.",
            ),
            h("Qué prueba el sello y qué no"),
            p(
              "El código, el hash y la firma de cada captura hacen difícil una manipulación indetectable y permiten a cualquiera comprobar que un archivo no ha cambiado desde que llegó. No convierten a GeoCliks en notario, en perito ni en un servicio jurídico, y ningún juzgado, aseguradora o cliente está obligado a aceptar el registro. Esa decisión siempre es suya.",
            ),
            see("verify/how-sealing-works", "legal/data-retention", "legal/terms-summary"),
          ],
        },
        {
          slug: "data-retention",
          title: "Cuánto tiempo se conservan tus datos",
          summary:
            "Qué sobrevive a un proyecto borrado, a un miembro retirado, a un plan cancelado y a un espacio de trabajo cerrado.",
          keywords: [
            "conservación",
            "borrar",
            "eliminar",
            "almacenamiento",
            "cancelar",
            "cerrar cuenta",
            "retention",
            "delete",
          ],
          body: [
            p(
              "La versión corta: el contenido del espacio de trabajo se conserva mientras exista el espacio de trabajo. Casi nada más lo elimina.",
            ),
            table(
              ["Lo que haces", "Lo que pasa con las capturas"],
              [
                [
                  "Borrar un proyecto",
                  "Las capturas se conservan. El registro de evidencia no está atado al proyecto.",
                ],
                [
                  "Quitar a un miembro",
                  "Sus fotos y sus entradas del historial se quedan en el espacio de trabajo.",
                ],
                [
                  "Borrar tu propia cuenta",
                  "Tu perfil y tus credenciales desaparecen. Las capturas que tomaste en el espacio de trabajo de otra persona se quedan ahí.",
                ],
                [
                  "Cancelar un plan de pago",
                  "No se borra nada. El espacio de trabajo baja al plan Gratis y las funciones de pago se detienen.",
                ],
                ["Cerrar el espacio de trabajo", "Todo desaparece, y no se puede deshacer."],
              ],
            ),
            h("Cancelar no es borrar"),
            p(
              "Bajar de plan o cancelar nunca destruye capturas. Conservas tu historial, y todos los códigos de foto que ya entregaste a un cliente siguen resolviendo en la página pública de verificación. Lo que pierdes son las funciones por encima de los límites del plan Gratis: asientos extra, enlaces para compartir, los formatos de exportación más completos.",
            ),
            h("Cerrar un espacio de trabajo definitivamente"),
            p(
              "No hay un botón de borrado autoservicio para un espacio de trabajo completo, y es a propósito: es demasiado fácil destruir un registro de evidencia por accidente.",
            ),
            steps(
              "El propietario del espacio de trabajo escribe a support@geocliks.com desde la dirección de la cuenta de propietario.",
              "Exporta antes todo lo que quieras conservar: PDF, Excel, ZIP o KMZ.",
              "Confirmamos la solicitud y luego eliminamos el espacio de trabajo y sus capturas.",
            ),
            warn(
              "Borrar un espacio de trabajo es permanente. Capturas, proyectos, informes y códigos de foto desaparecen, y todos los enlaces de verificación que entregaste a un cliente dejan de resolver. Exporta primero.",
            ),
            h("Copias de seguridad y registros"),
            p(
              "Las copias de seguridad y los registros de seguridad se conservan un periodo limitado y luego se rotan, así que un borrado puede tardar un poco en propagarse a todas las copias.",
            ),
            h("Pedir tus propios datos"),
            p(
              "Puedes pedirnos acceder, corregir, exportar o borrar tus datos personales. La mayoría los puedes cambiar tú mismo en tu perfil y en los ajustes de facturación. Para lo demás, escribe a support@geocliks.com desde la dirección de tu cuenta.",
            ),
            see("legal/data-ownership", "plans-billing/cancel-or-downgrade", "legal/privacy-summary"),
          ],
        },
      ],
    },
    {
      title: "Los documentos legales",
      articles: [
        {
          slug: "privacy-summary",
          title: "La Política de privacidad, en palabras claras",
          summary:
            "Qué recoge GeoCliks, para qué, quién más lo ve y qué opciones tienes. Un resumen, no un sustituto.",
          keywords: [
            "privacidad",
            "política",
            "rgpd",
            "datos personales",
            "ubicación",
            "cookies",
            "derechos",
            "privacy",
            "gdpr",
          ],
          body: [
            p(
              "Esta es una lectura llana de la Política de privacidad para que sepas qué contiene. El documento que cuenta es la política en sí, y está en geocliks.com/privacy.",
            ),
            h("Qué se recoge"),
            ul(
              "Datos de la cuenta: nombre, correo, un hash de tu contraseña (nunca la contraseña), foto de perfil, idioma, tema y tu secreto de doble factor si lo activas.",
              "Datos del espacio de trabajo: nombres de espacios y proyectos, clientes, ubicaciones, roles, invitaciones, plantillas e informes.",
              "Capturas: la foto o el video más su marca de tiempo, coordenadas, dirección resuelta, hora de captura del dispositivo, código de foto, hash del contenido y firma.",
              "Mensajes: mensajes directos y difusiones dentro del espacio de trabajo, incluidas las imágenes adjuntas.",
              "Datos del dispositivo: versión de la app, plataforma, dirección IP, token de notificaciones, registros de error y eventos básicos de uso.",
              "Datos de facturación: tu plan, el estado de la suscripción y los identificadores que devuelve la pasarela de pago. Los números de tarjeta nunca nos llegan.",
            ),
            note(
              "GeoCliks no quiere números de documentos de identidad, información de salud ni otras categorías sensibles. Mantenlos fuera de los nombres de proyecto, las notas y los mensajes.",
            ),
            h("Ubicación y cámara"),
            p(
              "La app pide cámara y ubicación porque una captura es una foto más el dónde y el cuándo. Puedes negar cualquiera de los dos permisos y la app sigue funcionando, pero una captura sin ubicación no lleva coordenadas ni dirección, que es la mayor parte de lo que la hace evidencia. La ubicación se lee en el momento de la captura y para colocar los pines en tu mapa. No hay seguimiento en segundo plano.",
            ),
            h("Quién más lo ve"),
            p(
              "Tus datos no se venden y nunca se comparten con fines publicitarios. Un pequeño grupo de proveedores los procesa siguiendo nuestras instrucciones: el alojamiento y almacenamiento en la nube, la pasarela de pago (y Apple para las compras dentro de la app), el proveedor de correo, el servicio de notificaciones push y el proveedor de mapas que resuelve las direcciones.",
            ),
            h("Los enlaces para compartir son públicos de verdad"),
            p(
              "Los enlaces para compartir y las páginas de verificación funcionan para cualquiera que tenga el enlace, sin iniciar sesión. Ese es justamente su propósito. Revocar un enlace corta el acceso futuro, pero no puede recuperar una copia que alguien ya descargó.",
            ),
            h("Tus derechos"),
            p(
              "Según la ley local puedes pedir acceder, corregir, exportar o borrar tus datos personales, limitar u oponerte a ciertos tratamientos y retirar tu consentimiento. Escribe a support@geocliks.com desde la dirección de tu cuenta. En Canadá también puedes reclamar ante la Oficina del Comisionado de Privacidad; en el EEE o el Reino Unido, ante tu autoridad de control local.",
            ),
            h("Cookies"),
            p(
              "Solo lo que el producto necesita: mantenerte con la sesión abierta, recordar idioma y tema, y guardar las capturas en cola mientras estás sin conexión. Ninguna cookie de publicidad ni de rastreo entre sitios.",
            ),
            note(
              "La Política de privacidad y los Términos se publican solo en inglés, a propósito. Traducir textos legales con una máquina puede cambiar lo que significan.",
            ),
            see("legal/data-retention", "teamspace/share-links", "legal/terms-summary"),
          ],
        },
        {
          slug: "terms-summary",
          title: "Los Términos del servicio, en palabras claras",
          summary:
            "Las obligaciones de cada parte, los límites que GeoCliks reconoce abiertamente y qué pasa si dejas de pagar.",
          keywords: [
            "términos",
            "condiciones",
            "contrato",
            "responsabilidad",
            "uso aceptable",
            "facturación",
            "asientos",
            "terms",
            "tos",
          ],
          body: [
            p(
              "Una lectura llana de los Términos. El documento que obliga es el de geocliks.com/terms; esto está aquí para que nada de lo que dice te sorprenda.",
            ),
            h("Quién puede usarlo"),
            p(
              "Debes tener 16 años o más. Si te registras por una empresa, estás confirmando que puedes aceptar los Términos en su nombre.",
            ),
            h("Límites que GeoCliks reconoce abiertamente"),
            p(
              "Los Términos son inusualmente directos sobre lo que el producto no puede prometer, y merece la pena leer esa lista en lugar de suponer:",
            ),
            ul(
              "GeoCliks no es notario, ni perito, ni laboratorio, ni servicio jurídico, y nada de lo que produce es asesoramiento legal.",
              "Una marca de tiempo verificada por red significa que nuestro servidor registró cuándo llegó la subida, no que el reloj del dispositivo fuera correcto.",
              "Cuando el reloj de un dispositivo se aparta del nuestro más de unos minutos, la captura se marca con hora del dispositivo.",
              "La precisión de la ubicación depende del teléfono y de su entorno; en interiores y entre edificios altos puede desviarse bastante.",
              "Las capturas sin conexión se sellan como verificadas solo cuando llegan a nuestros servidores.",
              "Ningún juzgado, aseguradora, cliente o autoridad está obligado a aceptar un registro de GeoCliks.",
            ),
            h("Lo que te comprometes a no hacer"),
            ul(
              "Usar el Servicio de forma ilícita, o para acosar, vigilar o intimidar a alguien.",
              "Subir contenido que no tienes derecho a subir.",
              "Alterar, falsificar o quitar un sello, un hash, una firma o un código de foto, o hacer pasar material alterado por un registro de GeoCliks.",
              "Sondear, sobrecargar o interferir con el Servicio, o esquivar los límites de uso y las cuotas del plan.",
              "Revender el Servicio, o compartir un asiento entre varias personas.",
            ),
            warn(
              "Los asientos son por persona, no por dispositivo. Un miembro del equipo puede iniciar sesión en un teléfono, una tableta y la web, pero dos personas compartiendo un mismo acceso incumplen los Términos y dejan el historial de capturas sin valor, porque cada foto se atribuye a quien tiene el asiento.",
            ),
            h("Facturación"),
            p(
              "Los planes de pago se renuevan automáticamente hasta que se cancelan. Las suscripciones web las cobra nuestra pasarela de pago; las compradas dentro de la app de iOS las cobra Apple y siguen su proceso de reembolso. Los precios no incluyen impuestos. Las cuotas ya pagadas no se reembolsan salvo cuando la ley lo exige.",
            ),
            p(
              "Si un pago falla o cancelas, el espacio de trabajo pasa al plan Gratis y las funciones de pago se detienen. Tus capturas se quedan.",
            ),
            h("Suspensión"),
            p(
              "Podemos suspender o terminar el acceso por un incumplimiento de los Términos, por un uso que ponga en riesgo el Servicio o a otros clientes, o cuando la ley lo exija. Cuando sea razonable, avisamos antes y damos la oportunidad de exportar.",
            ),
            h("Disponibilidad y responsabilidad"),
            p(
              "No hay garantía contractual de tiempo de servicio salvo que hayas firmado un acuerdo escrito aparte con nosotros. El Servicio se presta tal cual, y la responsabilidad total por cualquier reclamación se limita a lo que pagaste en los doce meses anteriores a que surgiera. Algunas jurisdicciones no admiten partes de eso, y allí esos límites se aplican solo hasta donde la ley lo permite.",
            ),
            h("Cambios"),
            p(
              "Los cambios importantes en los Términos o en la Política de privacidad se anuncian en la app o por correo antes de entrar en vigor. Las dudas sobre cualquiera de los dos documentos van a support@geocliks.com.",
            ),
            see("legal/data-ownership", "plans-billing/seats-and-billing", "verify/verify-results-explained"),
          ],
        },
      ],
    },
  ],
};
