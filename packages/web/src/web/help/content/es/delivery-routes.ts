import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const deliveryRoutes: Category = {
  slug: "delivery-routes",
  title: "Rutas de reparto",
  summary:
    "Planifica el día de un conductor, envíalo a la calle y cierra cada parada con una foto de comprobante que el destinatario puede ver.",
  icon: "Route",
  sections: [
    {
      title: "Planifica el día",
      articles: [
        {
          slug: "delivery-overview",
          title: "Cómo funciona el reparto",
          summary:
            "La forma de un día de reparto en GeoCliks: arma una ruta, asigna un conductor y cierra cada parada con evidencia.",
          keywords: [
            "reparto",
            "entrega",
            "rutas",
            "despacho",
            "conductor",
            "comprobante de entrega",
            "delivery",
            "routes",
            "dispatch",
            "proof of delivery",
            "pod",
          ],
          body: [
            p(
              "Rutas de reparto toma la misma idea de la foto verificada y la aplica al día de un conductor. Armas una lista de paradas en la oficina, se la entregas a un conductor, y el conductor cierra cada parada fotografiando la entrega. La foto lleva la hora verificada, la posición GPS y la dirección, así que una disputa por una entrega tiene respuesta.",
            ),
            h("El día, de principio a fin"),
            steps(
              "La oficina crea una ruta para una fecha y pega las direcciones del día.",
              "GeoCliks resuelve las direcciones a posiciones en el mapa, y tú corriges las que no pudo ubicar.",
              "Ordenas las paradas, a mano o con el optimizador.",
              "Asignas la ruta a un conductor, que la ve en su teléfono.",
              "El conductor avanza por la lista y fotografía cada entrega.",
              "Los destinatarios con correo reciben un mensaje de comprobante de entrega con la foto.",
              "La oficina ve la ruta cerrarse en tiempo real y conserva el historial.",
            ),
            h("Dos tipos de ruta"),
            table(
              ["Modo", "Úsalo cuando"],
              [
                [
                  "Planificada",
                  "Conoces todo el día por adelantado. Ármala, optimízala y envíala.",
                ],
                [
                  "Despacho",
                  "Los pedidos llegan durante el turno y se insertan en las paradas que le quedan al conductor.",
                ],
              ],
            ),
            h("Cada parada termina en uno de cuatro estados"),
            ul(
              "Entregada — cerrada con una foto de comprobante.",
              "Fallida — el conductor no pudo entregar, con un motivo y una foto.",
              "Omitida — aquí no había nada que entregar. El único cierre sin foto.",
              "Pendiente — todavía no se llega.",
            ),
            note(
              "El reparto es una capacidad aparte de la captura de evidencia. Tu cupo de paradas de reparto al mes viene de tu plan, y los planes Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 y Fleet 500 existen para operaciones que son sobre todo manejar.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "create-a-route",
          title: "Crea una ruta",
          summary:
            "Define la fecha, el punto de partida, la hora de inicio y cuánto suele durar una parada.",
          keywords: [
            "nueva ruta",
            "crear",
            "punto de partida",
            "hora de inicio",
            "tiempo de servicio",
            "firma",
            "new route",
            "depot",
            "service time",
          ],
          body: [
            p(
              "Una ruta es el trabajo de un conductor para una fecha. Créala primero y después llénala de paradas.",
            ),
            h("Créala"),
            steps(
              "Abre Rutas y elige Nueva ruta.",
              "Ponle un nombre que un despachador reconozca en una mañana ocupada: «Martes zona norte» es mejor que «Ruta 4».",
              "Define la fecha.",
              "Elige el modo Planificada o Despacho.",
              "Opcionalmente enlázala a un proyecto, para que las fotos de reparto queden con la evidencia de ese trabajo.",
              "Escribe la dirección de partida — normalmente tu bodega o patio.",
              "Guarda.",
            ),
            h("Los ajustes que dan forma al plan"),
            table(
              ["Ajuste", "Qué hace"],
              [
                [
                  "Dirección de partida",
                  "Dónde empieza el día. El optimizador planifica hacia afuera desde aquí.",
                ],
                ["Regreso al punto de partida", "Incluye el viaje de vuelta a la bodega en el plan."],
                ["Hora de inicio", "Cuándo sale el conductor. Por defecto, 08:00."],
                [
                  "Tiempo de servicio",
                  "Minutos en una parada promedio. Por defecto, 5. Manda sobre las estimaciones de llegada.",
                ],
                ["Exigir firma", "Pedirle al conductor una firma además de la foto."],
              ],
            ),
            h("Vale la pena acertar con el tiempo de servicio"),
            p(
              "El tiempo de servicio es la base con la que se calcula la llegada estimada de todas las paradas siguientes. Cinco minutos sirve para paquetes en una puerta. Una parada que implica descargar tarimas se acerca más a veinte, y puedes anular el tiempo de servicio en las paradas que sabes que son lentas.",
            ),
            note(
              "Crear una ruta requiere el rol de gerente o superior. Los conductores no arman sus propias rutas.",
            ),
            warn(
              "El modo Despacho requiere Delivery Pro o superior. Si tu plan cubre solo rutas planificadas, te lo dirá al elegir el modo y no después de que ya armaste el día.",
            ),
            see("delivery-routes/add-stops-by-pasting-a-list", "delivery-routes/live-dispatch"),
          ],
        },
        {
          slug: "add-stops-by-pasting-a-list",
          title: "Agrega paradas pegando una lista o subiendo un CSV",
          summary:
            "Pega una columna de una hoja de cálculo, un correo del cliente, o sube un CSV — GeoCliks lee las columnas igual.",
          keywords: [
            "paradas",
            "pegar",
            "importar",
            "subir",
            "archivo",
            "hoja de cálculo",
            "csv",
            "masivo",
            "direcciones",
            "stops",
            "paste",
            "upload",
            "bulk",
          ],
          body: [
            p(
              "Las paradas entran de dos formas: pegando las direcciones o subiendo un archivo CSV. Las dos terminan en la misma caja y pasan por el mismo lector, así que todo lo de abajo aplica a ambas. No necesitas dar formato a la lista antes.",
            ),
            h("Pega una lista"),
            steps(
              "Abre la ruta y busca la caja Agregar paradas.",
              "Pega el bloque. Una parada por línea.",
              "Lee el resumen arriba de la caja: cuántas paradas encontró, qué separador usó, qué columnas reconoció y cuántas líneas descartó.",
              "Corrige lo que se vea mal en el origen y vuelve a pegar, o agrega las paradas y edítalas una por una.",
              "Elige Agregar paradas.",
            ),
            h("Sube un CSV"),
            steps(
              "Exporta la lista de tu hoja de cálculo o sistema de pedidos como CSV.",
              "Abre la ruta y busca la caja Agregar paradas.",
              "Elige Subir un CSV y escoge el archivo.",
              "El contenido del archivo cae en la caja, donde puedes leer el resumen y editar cualquier línea antes de que se cree nada.",
              "Elige Agregar paradas.",
            ),
            note(
              "Subir el archivo no crea las paradas por sí solo — llena la caja. No se agrega nada a la ruta hasta que eliges Agregar paradas, así que un archivo equivocado no te cuesta nada. Los archivos deben ser CSV o texto plano y pesar menos de 1 MB.",
            ),
            h("Qué entiende el lector"),
            ul(
              "Separado por tabulación, coma o punto y coma. Él descubre cuál usaste.",
              "Campos entre comillas, para que una dirección con una coma adentro siga siendo una sola dirección.",
              "Una fila de encabezados, si la hay. Las columnas se reconocen por nombre en cualquier orden.",
              "Nombres de encabezado en inglés, francés, portugués o alemán — address/adresse/endereço/Adresse, name/nom/nome/Empfänger, email/courriel/e-mail, phone/téléphone/telefone/Telefon, reference/commande/pedido/Referenz, notes/remarques/observações/Notizen. Los acentos son opcionales: endereco, observacoes y Empfaenger también funcionan.",
              "Direcciones repartidas en varias columnas — calle, ciudad, provincia, código postal — unidas de vuelta en una sola línea.",
              "Correos y teléfonos reconocidos por su forma, incluso sin fila de encabezados.",
            ),
            h("Campos por parada"),
            table(
              ["Campo", "Por qué importa"],
              [
                ["Dirección", "Obligatoria. Todo lo demás es opcional."],
                ["Nombre del destinatario", "Se le muestra al conductor y se usa en el correo de comprobante."],
                [
                  "Correo del destinatario",
                  "Sin él, ese destinatario no recibe seguimiento ni correo de comprobante.",
                ],
                ["Teléfono del destinatario", "Para que el conductor llame antes de llegar."],
                ["Referencia", "Tu número de pedido, factura o guía. Se puede buscar."],
                ["Notas", "Códigos de portón, número de timbre, dónde dejarlo."],
                ["Ventana horaria", "Llegada más temprana y más tardía aceptables."],
                [
                  "Tiempo de servicio",
                  "Anula el valor por defecto de la ruta en una parada que sabes que es lenta.",
                ],
              ],
            ),
            h("Por qué un código postal nunca se toma como un nombre"),
            p(
              "Una lista canadiense pegada como «12 Main St, Moncton NB, E1A 4H2» antes producía un destinatario llamado E1A 4H2. Ahora el lector reconoce palabras de vía, códigos de provincia y formas de código postal y ZIP, y solo separa un campo final como nombre de persona cuando de verdad parece uno.",
            ),
            note(
              "Puedes agregar hasta 300 paradas por pegado. Para un día más grande, pégalo por tandas — se van sumando a la misma ruta.",
            ),
            warn(
              "Cada parada cuenta contra tu cupo mensual de reparto. Si un pegado te pasara del tope del plan se rechaza completo, así que nunca terminas con media ruta.",
            ),
            see(
              "delivery-routes/geocoding-and-fixing-addresses",
              "plans-billing/delivery-plans",
            ),
          ],
        },
        {
          slug: "geocoding-and-fixing-addresses",
          title: "Resolver direcciones y arreglar las malas",
          summary:
            "Convierte direcciones escritas en posiciones del mapa, y coloca un pin a mano cuando una no se encuentra.",
          keywords: [
            "geocodificar",
            "dirección",
            "pin",
            "coordenadas",
            "fallida",
            "resolver",
            "mapa",
            "geocode",
            "address",
            "resolve",
          ],
          body: [
            p(
              "Una dirección pegada es solo texto. Antes de poder ordenar o calcular tiempos de una ruta, cada parada necesita una posición en el mapa. Ese paso se llama resolver, y se ejecuta desde la ruta.",
            ),
            h("Resuelve las paradas"),
            steps(
              "Abre la ruta.",
              "Elige «Resolver direcciones». Solo se procesan las paradas que aún no se han resuelto.",
              "Lee el resultado: cuántas se ubicaron y cuántas fallaron.",
              "Resuelve las fallidas antes de optimizar.",
            ),
            h("Cada parada tiene un estado de resolución"),
            table(
              ["Estado", "Significado"],
              [
                ["Pendiente", "Todavía no se ha consultado."],
                ["OK", "Ubicada en el mapa, con la dirección normalizada."],
                ["Fallida", "No se pudo encontrar. Necesita tu ayuda."],
                ["Manual", "Colocaste el pin tú mismo. Nunca lo sobrescribe una nueva resolución."],
              ],
            ),
            h("Arreglar una parada fallida"),
            ul(
              "Edita la dirección y vuelve a resolver — la causa habitual es una ciudad o provincia que falta.",
              "O abre el mapa y coloca tú mismo el pin en el punto correcto. La parada pasa a Manual y se trata como ubicada.",
              "Un pin manual es la respuesta para un fraccionamiento nuevo, una propiedad rural o un sitio sin dirección oficial.",
            ),
            h("Volver a resolver"),
            p(
              "Una resolución forzada consulta de nuevo todas las paradas, incluidas las que ya están en OK. Deja deliberadamente en paz los pines manuales, porque un pin colocado a mano es mejor información que cualquier cosa que devuelva una consulta.",
            ),
            note(
              "La búsqueda de direcciones está sesgada hacia Canadá, así que una dirección corta como «12 Main St, Moncton» se resuelve sin que tengas que escribir el país.",
            ),
            warn(
              "Las paradas sin posición no las puede ordenar el optimizador. Se quedan al final de la ruta en vez de descartarse, así que revisa la cola de tu lista antes de mandar a un conductor a la calle.",
            ),
            see("delivery-routes/optimize-stop-order", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Envíala a la calle",
      articles: [
        {
          slug: "optimize-stop-order",
          title: "Ordena las paradas",
          summary:
            "Reordena a mano, o deja que el optimizador calcule el orden de manejo por ti.",
          keywords: [
            "optimizar",
            "orden",
            "secuencia",
            "reordenar",
            "más corta",
            "planificación de rutas",
            "optimize",
            "order",
            "route planning",
          ],
          body: [
            p(
              "Las paradas empiezan en el orden en que las agregaste. Rara vez es el orden en que quieres manejarlas.",
            ),
            h("A mano"),
            p(
              "Arrastra las paradas al orden que quieras. Útil cuando el conductor conoce la zona mejor que cualquier algoritmo, o cuando un cliente tiene que ir primero.",
            ),
            h("Con el optimizador"),
            steps(
              "Resuelve primero las direcciones — una parada sin posición no se puede ordenar.",
              "Elige Optimizar.",
              "Revisa el resultado: el nuevo orden, la distancia total y el tiempo estimado de manejo.",
              "Ajusta a mano después si quieres. Optimizar es una sugerencia que puedes ignorar.",
            ),
            h("Dos optimizadores"),
            table(
              ["Optimizador", "Qué hace"],
              [
                [
                  "Estándar",
                  "Corre dentro de GeoCliks, sin servicio externo ni medición. Buen orden para un día normal.",
                ],
                [
                  "Inteligente",
                  "Usa datos reales de la red vial para un orden más ajustado en rutas densas o complicadas. Delivery Pro y superiores.",
                ],
              ],
            ),
            note(
              "Si pides el optimizador inteligente en un plan que no lo incluye, GeoCliks ejecuta el estándar en vez de fallar. Igual obtienes una ruta ordenada — revisa en el historial de la ruta cuál optimizador corrió.",
            ),
            h("Qué respeta el optimizador"),
            ul(
              "Tu dirección de partida, y el ajuste de regreso a la bodega si está activo.",
              "El tiempo de servicio de cada parada, o el valor por defecto de la ruta.",
              "Las paradas sin posición, que conservan su lugar al final de la lista.",
            ),
            see("delivery-routes/assign-a-driver", "troubleshoot/route-optimize-failed"),
          ],
        },
        {
          slug: "assign-a-driver",
          title: "Asigna un conductor",
          summary: "Entrégale la ruta a alguien de tu espacio de trabajo y arranca el día.",
          keywords: [
            "asignar",
            "conductor",
            "iniciar",
            "estado",
            "despacho",
            "desasignar",
            "assign",
            "driver",
            "dispatch",
          ],
          body: [
            p(
              "Una ruta tiene que pertenecer a alguien antes de poder manejarse. El conductor debe ser miembro de tu espacio de trabajo — el rol campo es el adecuado para la cuadrilla que solo maneja y captura.",
            ),
            h("Asígnala"),
            steps(
              "Abre la ruta.",
              "Elige Asignar y escoge al conductor.",
              "La ruta aparece en su teléfono, entre sus rutas de esa fecha.",
              "Elige Iniciar cuando vayan saliendo, o deja que el conductor la inicie cerrando su primera parada.",
            ),
            h("Estado de la ruta"),
            table(
              ["Estado", "Significado"],
              [
                ["Borrador", "En construcción. Todavía sin conductor."],
                ["Asignada", "Un conductor la tiene, sin iniciar."],
                ["En curso", "Se está manejando ahora mismo."],
                ["Completada", "Todas las paradas están cerradas."],
                ["Cancelada", "Se suspendió. Ya no se pueden cerrar paradas."],
              ],
            ),
            h("Si cambias de opinión"),
            ul(
              "Desasigna una ruta para devolverla a borrador y entregársela a otra persona.",
              "Un conductor que fotografía su primera entrega sin tocar Iniciar deja la ruta en curso de todos modos.",
              "Cancelar una ruta impide que se cierren más paradas contra ella, y conserva todo lo ya registrado.",
            ),
            note(
              "Tu plan define para cuántos conductores está dimensionada la operación. Delivery Lite cubre dos, Pro cinco, Fleet quince, Fleet 30 treinta, Fleet 200 doscientos y Fleet 500 quinientos.",
            ),
            see(
              "delivery-routes/driver-run-and-proof-of-delivery",
              "teamspace/roles-and-permissions",
            ),
          ],
        },
        {
          slug: "live-dispatch",
          title: "Despacho en vivo",
          summary:
            "Inserta un pedido que llegó a media jornada en las paradas que le quedan a un conductor.",
          keywords: [
            "despacho",
            "en vivo",
            "agregar parada",
            "a media jornada",
            "bajo demanda",
            "insertar",
            "dispatch",
            "live",
          ],
          body: [
            p(
              "El modo Despacho es para el trabajo que no existe cuando empieza el día: entra una llamada a las 14:00 y alguien tiene que atenderla. Agregas la parada a una ruta que ya se está manejando y GeoCliks la inserta.",
            ),
            h("Agrega una parada en vivo"),
            steps(
              "Abre la ruta en curso.",
              "Elige Agregar parada en vivo.",
              "Escribe la dirección y los datos del destinatario.",
              "Confirma. La parada se inserta en la parte de la ruta a la que el conductor todavía no llega, y aparece en su teléfono.",
            ),
            h("Lo que nunca se mueve"),
            ul(
              "Las paradas ya entregadas, fallidas u omitidas.",
              "La parada hacia la que el conductor va manejando en ese momento.",
            ),
            p(
              "Una parada nueva se inserta en el punto más barato de la lista restante. Esto deliberadamente no es una reoptimización: una herramienta que rebaraja el plan debajo de un conductor en movimiento termina abandonada por quienes la usan, y reoptimizar una tarde ocupada una y otra vez también te costaría dinero en cada recálculo.",
            ),
            note(
              "La inserción corre localmente y es gratis, las veces que la hagas en un turno.",
            ),
            warn(
              "El despacho en vivo requiere Delivery Pro o superior. En un plan con rutas planificadas solamente, todavía puedes agregar paradas a una ruta antes de que inicie.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
      ],
    },
    {
      title: "En la calle",
      articles: [
        {
          slug: "driver-run-and-proof-of-delivery",
          title: "El recorrido del conductor y el comprobante de entrega",
          summary: "Qué ve el conductor, y cómo se cierra una parada con evidencia.",
          keywords: [
            "conductor",
            "recorrido",
            "comprobante",
            "foto",
            "firma",
            "entregada",
            "sin conexión",
            "driver",
            "proof",
            "offline",
          ],
          body: [
            p(
              "En el teléfono, el conductor tiene una sola pantalla: la parada en la que va, la dirección, el destinatario, cualquier nota y cuántas paradas le quedan. Todo lo demás está fuera del camino.",
            ),
            h("Cerrar una parada"),
            steps(
              "Toca la parada.",
              "Toma la foto de entrega — el paquete en la puerta, la tarima en el andén, lo que pruebe que llegó.",
              "Confirma o corrige el nombre del destinatario.",
              "Captura una firma, si la ruta la pide.",
              "Márcala como Entregada. Aparece la siguiente parada.",
            ),
            h("La foto no es opcional"),
            p(
              "Una parada entregada o fallida debe cerrarse con una foto real de tu espacio de trabajo. No hay forma de marcar una parada como entregada sin nada adjunto — ese es justamente el punto de usar GeoCliks para reparto en vez de una app de listas.",
            ),
            h("Sin conexión"),
            ul(
              "El recorrido funciona sin señal. Las fotos y los cierres de parada se encolan en el dispositivo.",
              "La hora de cierre registrada es cuándo se tomó la foto, no cuándo se subió, así que una ruta manejada por una zona muerta se lee correctamente.",
              "Si la cola se vacía dos veces, el segundo intento se reconoce y se ignora en vez de cerrar la parada dos veces.",
            ),
            note(
              "La oficina ve cada parada cerrarse conforme va llegando, así que un despachador que vigila la ruta sabe dónde va el conductor sin llamarlo.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "mobile-app/offline-capture-and-queue",
            ),
          ],
        },
        {
          slug: "failed-and-skipped-stops",
          title: "Paradas fallidas y omitidas",
          summary:
            "Registra por qué no ocurrió una entrega, de una forma sobre la que la oficina pueda actuar.",
          keywords: [
            "fallida",
            "omitida",
            "nadie en casa",
            "rechazada",
            "dirección equivocada",
            "excepción",
            "failed",
            "skipped",
            "exception",
          ],
          body: [
            p(
              "No todas las paradas salen bien. Una parada fallida sigue siendo una parada cerrada con evidencia — es el registro de que el conductor fue hasta allá y de lo que encontró.",
            ),
            h("Marcar una parada como fallida"),
            steps(
              "Toca la parada y toma una foto de lo que el conductor está viendo — la puerta cerrada, el carril bloqueado, el edificio equivocado.",
              "Elige Fallida.",
              "Escoge un motivo.",
              "Agrega una nota si hay algo que la oficina deba saber.",
              "Guarda.",
            ),
            h("Los motivos"),
            table(
              ["Motivo", "Úsalo para"],
              [
                ["Nadie en casa", "No había nadie para recibirlo."],
                ["Rechazada", "El destinatario no quiso recibirlo."],
                ["Dirección equivocada", "La dirección no coincide con el destinatario."],
                ["Cerrado", "Un negocio que estaba cerrado."],
                ["Inaccesible", "No se pudo llegar físicamente — portón, nieve, obra."],
                ["Otro", "Cualquier otra cosa. Escríbelo en la nota."],
              ],
            ),
            h("Omitir en vez de fallar"),
            p(
              "Omitir es distinto: es el conductor reportando que aquí no había nada que entregar. Es el único cierre que no necesita foto, y queda registrado como omisión para que la oficina lea exactamente eso en el historial y no una falla que nunca ocurrió.",
            ),
            warn(
              "Una parada fallida nunca dispara un correo de comprobante de entrega al destinatario. Esos los maneja la oficina a mano, porque un alegre «tu paquete llegó» por una entrega fallida es peor que ningún mensaje.",
            ),
            note(
              "Cada cierre, falla y omisión se escribe en el historial de la ruta con quién lo hizo y cuándo, y el historial no se puede editar.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "delivery-routes/driver-run-and-proof-of-delivery",
            ),
          ],
        },
        {
          slug: "tracking-links-and-notifications",
          title: "Enlaces de seguimiento y correos al destinatario",
          summary:
            "Los tres correos que puede recibir un destinatario, y exactamente qué muestra la página de seguimiento.",
          keywords: [
            "seguimiento",
            "notificación",
            "correo",
            "destinatario",
            "hora estimada",
            "enlace",
            "privacidad",
            "tracking",
            "notification",
            "eta",
          ],
          body: [
            p(
              "A un destinatario con correo en su parada se le puede mantener informado automáticamente. Esto lo controlas por ruta, y a un destinatario sin correo sencillamente nunca se le contacta.",
            ),
            h("Los tres correos"),
            table(
              ["Correo", "Cuándo sale"],
              [
                ["En camino", "La ruta inició y el conductor está en la calle."],
                ["Eres el siguiente", "El conductor está a un número fijo de entregas de distancia."],
                [
                  "Entregado",
                  "Su parada se cerró. Incluye la foto de comprobante y su código.",
                ],
              ],
            ),
            h("Ajustes"),
            ul(
              "Activa o desactiva el correo de aviso para la ruta.",
              "Define a cuántas paradas de distancia sale — una da poco aviso, cinco da una ventana amplia.",
              "Activa o desactiva el correo de comprobante de entrega.",
            ),
            h("Qué muestra la página de seguimiento"),
            p(
              "Cada correo enlaza a una página de seguimiento de esa única parada, a la que se llega por un enlace imposible de adivinar. El destinatario ve el nombre de tu empresa, su propia dirección, cuántas entregas quedan por delante de la suya y, una vez cerrada la parada, la foto de comprobante con su hora y ubicación verificadas.",
            ),
            h("Qué deliberadamente no muestra"),
            ul(
              "Ninguna otra parada, dirección ni destinatario de la ruta.",
              "El nombre, teléfono ni posición en vivo del conductor.",
              "El nombre de la ruta ni el total de paradas — lo que le permitiría a un competidor mapear tu recorrido.",
            ),
            note(
              "Cada destinatario recibe cada correo como máximo una vez, y el avance del conductor se vuelve a comprobar justo antes de enviar, así que nadie recibe un «eres el siguiente» por una parada que se acaba de entregar.",
            ),
            warn(
              "Los correos al destinatario solo salen cuando el envío de correo está configurado para tu espacio de trabajo. Si los destinatarios reportan que no reciben nada, eso es lo primero que hay que revisar.",
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
