import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const plansBilling: Category = {
  slug: "plans-billing",
  title: "Planes y facturación",
  summary: "Qué cubre cada plan, cómo cambiarlo y dónde encontrar una factura.",
  icon: "CreditCard",
  sections: [
    {
      title: "Elegir un plan",
      articles: [
        {
          slug: "compare-plans",
          title: "Comparar planes",
          summary: "Qué incluyen Gratis, Plus, Business, Crew 10, Crew 25 y Enterprise.",
          keywords: [
            "planes",
            "precios",
            "comparar",
            "gratis",
            "límites",
            "plans",
            "pricing",
            "free",
            "limits",
          ],
          body: [
            p(
              "Hay dos familias de planes. Los planes de evidencia que verás abajo son para documentar trabajo. Los planes Delivery son para operaciones que consisten sobre todo en conducir, y tienen su propio artículo.",
            ),
            p(
              "Los precios actuales están en la sección de precios de geocliks.com. Esta página cubre qué permite realmente cada plan, que es la parte donde la gente se lleva sorpresas.",
            ),
            h("Planes de evidencia"),
            table(
              ["Plan", "Para", "Asientos"],
              [
                ["Gratis", "Probarlo, o documentación puntual en solitario.", "1"],
                ["Plus", "Una persona trabajando a tiempo completo y compartiendo con clientes.", "1"],
                ["Business", "Un equipo pequeño con un Teamspace compartido.", "5"],
                ["Crew 10", "Un equipo que crece.", "10"],
                ["Crew 25", "Una operación más grande.", "25"],
                ["Enterprise", "Volúmenes y condiciones a medida. Habla con nosotros.", "A medida"],
              ],
            ),
            h("Qué cambia al subir de plan"),
            table(
              ["Capacidad", "Dónde empieza"],
              [
                ["Captura verificada, marcas de agua, códigos de foto", "Gratis"],
                ["Capturas ilimitadas al mes", "Plus"],
                ["Exportación a Excel, ZIP y KMZ", "Plus"],
                ["Enlaces para compartir", "Plus"],
                ["Proyectos y plantillas de marca de agua ilimitados", "Plus"],
                ["Tu logo en las marcas de agua", "Plus"],
                ["Videos de duración completa", "Plus"],
                ["Teamspace con miembros invitados", "Business"],
                ["Roles y acceso por proyecto", "Business"],
              ],
            ),
            h("El plan Gratis en detalle"),
            ul(
              "300 capturas al mes.",
              "El video se limita a clips de 30 segundos, y solo durante los primeros tres días.",
              "Tres proyectos, un asiento, dos plantillas de marca de agua.",
              "Exportación a PDF de hasta 20 fotos. Sin Excel, ZIP ni KMZ.",
              "Sin Teamspace, así que sin miembros invitados y sin enlaces para compartir.",
              "Sin rutas de entrega.",
            ),
            note(
              "Todos los planes, incluido el Gratis, te dan la misma verificación: los mismos datos en la marca de agua, el mismo código de foto, el mismo sello. La verificación no es una mejora de pago.",
            ),
            h("Entregas en los planes de evidencia"),
            p(
              "Plus y superiores incluyen una asignación mensual de paradas, así que puedes hacer rutas sin pasarte a un plan Delivery: una asignación modesta en Plus, más en Business, y progresivamente más en Crew 10 y Crew 25. Si conduces todos los días, los planes Delivery salen más baratos por parada.",
            ),
            see("plans-billing/delivery-plans", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "delivery-plans",
          title: "Planes Delivery",
          summary:
            "Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 y Fleet 500 — dimensionados por paradas al mes y por conductores.",
          keywords: [
            "entregas",
            "reparto",
            "paradas",
            "conductores",
            "despacho",
            "delivery",
            "lite",
            "pro",
            "fleet",
            "stops",
            "drivers",
          ],
          body: [
            p(
              "Los planes Delivery son para operaciones donde conducir es el negocio, no una consecuencia de él. Incluyen todo lo de los planes de evidencia más una asignación mensual de paradas mucho mayor.",
            ),
            table(
              ["Plan", "Paradas al mes", "Conductores", "Despacho en vivo", "Optimizador inteligente"],
              [
                ["Delivery Lite", "500", "2", "No", "No"],
                ["Delivery Pro", "2000", "5", "Sí", "Sí"],
                ["Delivery Fleet", "6000", "15", "Sí", "Sí"],
                ["Delivery Fleet 30", "12 000", "30", "Sí", "Sí"],
                ["Delivery Fleet 200", "80 000", "200", "Sí", "Sí"],
                ["Delivery Fleet 500", "200 000", "500", "Sí", "Sí"],
              ],
            ),
            h("Las dos funciones reservadas"),
            ul(
              "Despacho en vivo: añadir paradas a una ruta que ya se está conduciendo. Pro, Fleet, Fleet 30, Fleet 200 y Fleet 500.",
              "Optimizador inteligente: ordena la ruta según la red de carreteras en lugar del solucionador estándar. Pro, Fleet, Fleet 30, Fleet 200 y Fleet 500. En los planes que no lo incluyen se ejecuta el optimizador estándar, así que igualmente obtienes una ruta ordenada.",
            ),
            h("Cómo conseguir uno"),
            p(
              "Todos los planes Delivery se contratan por tu cuenta desde la página de facturación: eliges el plan, pasas por un pago seguro alojado e introduces los datos de la tarjeta. Los nuevos límites se aplican en cuanto se completa. Un plan Delivery empieza con una prueba gratis, así que su botón dice Prueba gratis. Si tu espacio de trabajo ya está en un plan Delivery, cambiar a otro se cobra de inmediato y el botón dice Cambiar a — la prueba es una vez por espacio de trabajo, no una vez por plan.",
            ),
            steps(
              "Abre Facturación en los ajustes de tu espacio de trabajo.",
              "Elige el plan Delivery que encaje con tu volumen.",
              "Completa el pago. Vuelves a GeoCliks y la asignación de paradas ya está activa.",
            ),
            warn(
              "Enterprise es el único plan que no es autoservicio. En su tarjeta verás Habla con nosotros en lugar de un botón de pago, y se abre un correo prerrellenado a sales@geocliks.com. Nadie se cobra automáticamente y nada cambia en tu espacio de trabajo hasta que lo configuremos contigo.",
            ),
            note(
              "Solo el propietario del espacio de trabajo puede cambiar de plan. Los admins gestionan a las personas, no la suscripción.",
            ),
            h("Cuál encaja"),
            p(
              "Cuenta las paradas que entregas de verdad en un mes normal y añade algo de margen para tu semana más cargada. Pasarte de la asignación bloquea la creación de rutas hasta el mes siguiente, así que el plan debe cubrir tu pico, no tu media.",
            ),
            note(
              "Las paradas se cuentan por mes natural y se reinician el día uno. Una parada cuenta desde que se añade a una ruta, acabe entregada o no.",
            ),
            see("delivery-routes/delivery-overview", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Gestionar tu suscripción",
      articles: [
        {
          slug: "upgrade-or-change-plan",
          title: "Mejorar o cambiar de plan",
          summary: "Cambia de plan desde la página de facturación — lo hace el propietario.",
          keywords: [
            "mejorar",
            "cambiar plan",
            "pago",
            "bajar de plan",
            "upgrade",
            "change plan",
            "downgrade",
          ],
          body: [
            p(
              "Los planes se cambian desde Facturación, en los ajustes de tu espacio de trabajo. Solo el propietario puede hacerlo: los admins gestionan a las personas, no la suscripción.",
            ),
            h("Cambiar de plan"),
            steps(
              "Abre Facturación.",
              "Elige el plan que quieras.",
              "En un plan de pago autoservicio pasas a un pago seguro alojado para introducir los datos de la tarjeta, y vuelves a GeoCliks al terminar.",
              "En Enterprise recibes en su lugar un correo prerrellenado a nuestro equipo.",
              "Los nuevos límites se aplican en cuanto el cambio entra.",
            ),
            h("Pasar a un plan más grande"),
            ul(
              "Los nuevos límites se aplican de inmediato.",
              "Nada de lo que ya has capturado se ve afectado.",
              "Los asientos extra quedan disponibles al momento, así que puedes invitar a gente justo después.",
            ),
            h("Bajar de plan"),
            p(
              "Se rechaza bajar de plan mientras tu espacio de trabajo sea más grande que el plan de destino. Si tienes ocho miembros y pasas a un plan de cinco asientos, se te pedirá quitar miembros primero. Es deliberado: la alternativa sería cortarle el acceso a tres personas sin avisar.",
            ),
            note(
              "Elegir el plan Gratis, o volver a elegir el plan que ya tienes, no pasa por el pago en ningún momento.",
            ),
            see("plans-billing/seats-and-billing", "plans-billing/cancel-or-downgrade"),
          ],
        },
        {
          slug: "seats-and-billing",
          title: "Asientos",
          summary: "Qué es un asiento, qué consume uno y qué hacer cuando se te acaban.",
          keywords: [
            "asientos",
            "miembros",
            "invitar",
            "límite",
            "usuarios",
            "seats",
            "members",
            "invite",
          ],
          body: [
            p(
              "Un asiento es una persona que puede iniciar sesión en tu espacio de trabajo. Tu plan incluye un número fijo, y el propietario cuenta como uno de ellos.",
            ),
            h("Qué consume un asiento"),
            ul(
              "Cada miembro del espacio de trabajo, sea cual sea su rol. Un miembro de campo cuesta el mismo asiento que un admin.",
              "Cada invitación pendiente, hasta que se acepta o se revoca.",
            ),
            p(
              "Las invitaciones pendientes retienen un asiento a propósito. Si no, se podrían enviar diez invitaciones con dos asientos y todos los que aceptaran quedarían por encima del plan.",
            ),
            h("Sin asientos libres"),
            steps(
              "Abre Equipo y revisa las invitaciones pendientes. Revoca las que no se vayan a aceptar.",
              "Quita a los miembros que ya se han ido. Sus capturas y su historial se quedan en el espacio de trabajo.",
              "Si realmente necesitas más gente, sube de plan.",
            ),
            note(
              "Quitar a un miembro libera su asiento de inmediato y nunca borra su trabajo.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "payment-and-invoices",
          title: "Pagos y facturas",
          summary: "Dónde viven los datos de la tarjeta, cómo actualizarlos y dónde conseguir un recibo.",
          keywords: [
            "factura",
            "recibo",
            "tarjeta",
            "pago",
            "impuestos",
            "portal de facturación",
            "invoice",
            "receipt",
            "card",
          ],
          body: [
            p(
              "Los pagos los gestiona nuestra pasarela de pago, no GeoCliks. El número de tu tarjeta nunca se guarda en nuestros servidores.",
            ),
            h("Actualizar una tarjeta"),
            steps(
              "Abre Facturación en los ajustes de tu espacio de trabajo.",
              "Abre el portal de facturación.",
              "Actualiza ahí el método de pago.",
            ),
            h("Facturas y recibos"),
            ul(
              "Cada pago genera una factura, disponible en el portal de facturación.",
              "Las facturas se envían por correo a la dirección de facturación de la suscripción, que no siempre es el correo con el que entra el propietario: compruébalo si los recibos le llegan a la persona equivocada.",
              "Añade en el portal el nombre de tu empresa y tus datos fiscales y aparecerán en las facturas futuras.",
            ),
            h("Un pago que falló"),
            p(
              "La pasarela reintenta un pago fallido antes de que cambie nada en tu espacio de trabajo. Si sigue fallando, tu espacio de trabajo baja a los límites del plan Gratis: tus capturas no se borran, pero las exportaciones, los enlaces para compartir y el Teamspace dejan de funcionar hasta que el pago salga bien.",
            ),
            warn(
              "Si tu espacio de trabajo está en un plan que configuramos a mano para ti, puede que no haya portal de autoservicio. Escribe a support@geocliks.com y resolvemos la factura.",
            ),
            see("plans-billing/cancel-or-downgrade", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "cancel-or-downgrade",
          title: "Cancelar o bajar de plan",
          summary: "Cómo dejar de pagar, y qué pasa exactamente con tu evidencia.",
          keywords: [
            "cancelar",
            "bajar de plan",
            "reembolso",
            "exportar",
            "datos",
            "cancel",
            "downgrade",
            "refund",
          ],
          body: [
            p(
              "Puedes dejar de pagar cuando quieras. La pregunta importante es qué pasa con el trabajo, así que aquí va claramente.",
            ),
            h("Cancelar"),
            steps(
              "Exporta primero todo lo que vayas a necesitar fuera de GeoCliks. Hazlo antes de cancelar, porque los formatos de exportación son limitados en el plan Gratis.",
              "Reduce tu espacio de trabajo para que quepa en el plan al que pasas, si estás bajando a menos asientos.",
              "Abre Facturación y pasa al plan Gratis o cancela en el portal de facturación.",
            ),
            h("Qué pasa con tus datos"),
            ul(
              "Tus capturas no se borran al bajar de plan ni al cancelar.",
              "La verificación sigue funcionando. Los códigos de foto siguen resolviendo y los sellos siguen comprobándose.",
              "Las funciones de pago se detienen: exportación a Excel, ZIP y KMZ, enlaces para compartir, Teamspace y rutas de entrega.",
              "Los enlaces para compartir que ya existen dejan de funcionar mientras tu plan no los incluya.",
              "Los miembros que sobran respecto al nuevo número de asientos pierden el acceso, y por eso bajar de plan te pide quitarlos antes.",
            ),
            warn(
              "Exporta antes de cancelar, no después. En el plan Gratis te limitas a un PDF de hasta 20 fotos, que no es forma de sacar un año de trabajo.",
            ),
            h("Borrar el espacio de trabajo por completo"),
            p(
              "Cancelar no es borrar. Si quieres que el espacio de trabajo y sus archivos se eliminen definitivamente, escribe a support@geocliks.com desde la dirección del propietario y pide el borrado. No se puede deshacer y lo confirmamos antes de hacerlo.",
            ),
            see("legal/data-retention", "teamspace/reports-and-exports"),
          ],
        },
      ],
    },
  ],
};
