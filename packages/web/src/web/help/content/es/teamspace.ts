import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const teamspace: Category = {
  slug: "teamspace",
  title: "Teamspace",
  summary:
    "El espacio de trabajo compartido donde llegan las capturas del equipo, y donde la oficina las convierte en proyectos, informes y enlaces compartidos.",
  icon: "Users",
  sections: [
    {
      title: "Tu espacio de trabajo",
      articles: [
        {
          slug: "teamspace-overview",
          title: "Teamspace de un vistazo",
          summary:
            "Qué es un espacio de trabajo, qué llega a él y quién puede ver cada parte.",
          keywords: [
            "espacio de trabajo",
            "organización",
            "panel",
            "compartido",
            "workspace",
            "org",
            "dashboard",
          ],
          body: [
            p(
              "Un Teamspace es un único espacio de trabajo compartido para una empresa. Cada foto y cada video que tu equipo captura en el teléfono se sube ahí, y todo el que tenga acceso ve la misma biblioteca desde la app web, la app de escritorio o su teléfono.",
            ),
            p(
              "No tienes que mover nada al Teamspace a mano. En cuanto una captura termina de subirse ya está dentro, con su hora verificada, su posición GPS y su dirección adjuntas.",
            ),
            h("Qué vive en un Teamspace"),
            ul(
              "La biblioteca de fotos y videos, con la captura más reciente primero.",
              "Proyectos: los trabajos, obras o clientes bajo los que agrupas las capturas.",
              "Tu equipo: los miembros, sus roles y qué proyectos puede ver cada uno.",
              "Plantillas de marca de agua, para que todos los teléfonos sellen las capturas igual.",
              "Los informes y las exportaciones que has generado, y los enlaces para compartir que has entregado.",
              "Rutas de entrega, si usas Delivery.",
            ),
            h("Quién ve qué"),
            p(
              "Los propietarios, los admins y los gerentes ven todo el espacio de trabajo. Los miembros de campo solo ven los proyectos que tienen asignados: sus propias capturas más todo lo demás de esos proyectos. Esa es la razón principal para meter el trabajo en proyectos en lugar de dejarlo suelto.",
            ),
            note(
              "Teamspace forma parte del plan Business y superiores. En Gratis y Plus sigues teniendo captura, marca de agua y verificación completas, pero el espacio de trabajo eres solo tú.",
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
          title: "Crear un proyecto",
          summary:
            "Agrupa capturas por trabajo, obra o cliente para que los filtros, los informes y el acceso del equipo encajen.",
          keywords: ["proyecto", "trabajo", "obra", "cliente", "carpeta", "project", "job", "site"],
          body: [
            p(
              "Un proyecto es un contenedor de capturas, normalmente un trabajo, una obra o un cliente. Los proyectos son la base con la que se construyen los informes, lo que da acceso a los miembros de campo, y aquello por lo que agrupan el mapa y la vista de antes y después.",
            ),
            h("Crear uno"),
            steps(
              "En la app web, abre Proyectos y elige Nuevo proyecto.",
              "Ponle un nombre. Es el único campo obligatorio.",
              "Si quieres, añade un código de trabajo, el nombre del cliente, una etiqueta de ubicación y una dirección.",
              "Añade una categoría y notas internas si tu equipo las usa.",
              "Guarda. El proyecto está disponible de inmediato en el selector de proyectos de la app móvil.",
            ),
            h("Los campos y para qué sirven"),
            table(
              ["Campo", "Qué hace"],
              [
                ["Nombre", "Cómo aparece el proyecto en todas partes. Hasta 90 caracteres."],
                ["Código", "Tu propio número de trabajo u orden. Se puede buscar."],
                ["Cliente", "Para quién es el trabajo. Útil cuando exportas."],
                ["Etiqueta de ubicación", "Un nombre humano para la obra, como «Patio norte»."],
                ["Dirección", "La dirección de la obra. Se usa para centrar el proyecto en el mapa."],
                ["Categoría", "Tu propia agrupación, como «Cubiertas» o «Inspección»."],
                ["Notas", "Contexto interno. Nunca se muestra en un enlace para compartir."],
              ],
            ),
            h("Estado del proyecto"),
            p(
              "Cada proyecto está Activo, En pausa, Completado o Archivado. El estado no cambia nada sobre el acceso ni el almacenamiento: está ahí para que un trabajo terminado deje de estorbar en la lista. Filtra por estado en la parte superior de la página de Proyectos.",
            ),
            note(
              "Crear un proyecto requiere el rol de gerente o superior. Los miembros de campo pueden capturar en los proyectos que tienen asignados pero no pueden crear nuevos.",
            ),
            warn(
              "Cada plan incluye un número determinado de proyectos. Si llegas al límite se te pedirá mejorar el plan en lugar de permitirte crear un proyecto que no quedaría cubierto.",
            ),
            see("teamspace/invite-your-crew", "mobile-app/assign-capture-to-project"),
          ],
        },
        {
          slug: "browse-and-filter-photos",
          title: "Explorar y filtrar fotos",
          summary:
            "Reduce miles de capturas al puñado que necesitas por proyecto, persona, etiqueta, fecha o texto.",
          keywords: [
            "buscar",
            "filtrar",
            "biblioteca",
            "galería",
            "etiqueta",
            "encontrar",
            "search",
            "filter",
            "tag",
          ],
          body: [
            p(
              "La biblioteca de fotos muestra todas las capturas del espacio de trabajo, las más recientes primero. Los filtros se acumulan: pon todos los que quieras y se aplican juntos.",
            ),
            h("Los filtros"),
            ul(
              "Proyecto: solo las capturas asignadas a ese proyecto.",
              "Miembro: solo las capturas tomadas por una persona.",
              "Etiqueta: general, antes, después, incidencia, llegada, salida, recogida o entrega.",
              "Rango de fechas: capturas tomadas entre dos fechas, según la hora de captura y no la de subida.",
              "Búsqueda: coincide con la dirección, la nota de la captura y el código de foto.",
            ),
            h("Buscar por código de foto"),
            p(
              "Si un cliente te dicta un código de foto de una marca de agua, pégalo en el cuadro de búsqueda. Encontrará esa captura exacta, que es más rápido que desplazarse hasta la fecha.",
            ),
            h("Trabajar con una selección"),
            p(
              "Selecciona varias capturas para moverlas a un proyecto, etiquetarlas, construir un informe solo con ellas o borrarlas. Borrar requiere gerente o superior.",
            ),
            note(
              "Los filtros de fecha usan la hora en que se tomó la foto. Una captura que estuvo dos días en la cola sin conexión sigue filtrándose al día en que el equipo estuvo en la obra.",
            ),
            see("teamspace/map-view", "teamspace/reports-and-exports", "verify/verify-a-photo"),
          ],
        },
        {
          slug: "map-view",
          title: "Vista de mapa",
          summary:
            "Ve cada captura como un pin y confirma que el equipo estuvo donde dice el papeleo.",
          keywords: ["mapa", "gps", "pines", "ubicación", "coordenadas", "map", "pins", "location"],
          body: [
            p(
              "La vista de mapa sitúa tus capturas por su posición GPS registrada. Responde a la pregunta que una cuadrícula de fotos no puede: ¿se hizo el trabajo donde se suponía?",
            ),
            h("Cómo usarla"),
            steps(
              "Abre Mapa desde la navegación del espacio de trabajo.",
              "Aplica los mismos filtros de proyecto, miembro, etiqueta y fecha que usas en la biblioteca.",
              "Haz clic en un pin para ver la captura, su dirección y su hora exacta.",
              "Amplía sobre un grupo para separar los pines que están a pocos metros unos de otros.",
            ),
            h("Cuando un pin parece mal"),
            ul(
              "En interiores, en un sótano o entre edificios altos, la precisión del GPS baja. El pin puede desviarse decenas de metros aunque la foto sea auténtica.",
              "La dirección se resuelve a partir de las coordenadas, así que una fijación mala produce un nombre de calle plausible pero equivocado.",
              "Las capturas tomadas con el permiso de ubicación denegado no tienen pin y no aparecerán en el mapa.",
            ),
            note(
              "Puedes exportar la selección actual del mapa como archivo KMZ y abrirla en Google Earth, que es lo que suelen pedir las empresas de servicios públicos y los clientes municipales.",
            ),
            see("troubleshoot/gps-or-address-wrong", "teamspace/reports-and-exports"),
          ],
        },
        {
          slug: "before-after-compare",
          title: "Comparación de antes y después",
          summary:
            "Pon dos capturas una al lado de la otra para mostrar el cambio que te pagaron por hacer.",
          keywords: [
            "antes",
            "después",
            "comparar",
            "progreso",
            "before",
            "after",
            "compare",
            "progress",
          ],
          body: [
            p(
              "La vista de comparación empareja dos capturas del mismo proyecto y las muestra juntas, cada una con su hora y su dirección verificadas. Es la forma más rápida de defender un trabajo terminado.",
            ),
            h("Prepararla"),
            steps(
              "Etiqueta la primera captura como Antes, en la app o en la biblioteca web.",
              "Etiqueta la captura del estado final como Después.",
              "Abre el proyecto y elige la vista de Antes y después.",
              "Elige el par que quieras si hay más de uno etiquetado.",
            ),
            h("Conseguir un par limpio"),
            ul(
              "Colócate más o menos en el mismo punto y sujeta el teléfono a la misma altura en las dos tomas.",
              "Encuadra una referencia fija —una puerta, un poste, una esquina— en las dos.",
              "Haz la toma del Después desde la misma distancia; ampliar en lugar de moverte cambia la perspectiva.",
            ),
            note(
              "El diseño de antes y después es uno de los diseños de informe, así que en cuanto el par está etiquetado puedes meterlo directamente en un PDF para el cliente.",
            ),
            see("teamspace/reports-and-exports", "mobile-app/take-a-photo"),
          ],
        },
      ],
    },
    {
      title: "Compartir el trabajo",
      articles: [
        {
          slug: "reports-and-exports",
          title: "Informes y exportaciones",
          summary:
            "Convierte un conjunto filtrado de capturas en un PDF, una hoja de Excel, un ZIP o un KMZ.",
          keywords: [
            "informe",
            "exportar",
            "descargar",
            "pdf",
            "excel",
            "xlsx",
            "zip",
            "kmz",
            "export",
            "report",
          ],
          body: [
            p(
              "Un informe es una instantánea de un conjunto de capturas en un archivo que puedes enviar. Construye primero el conjunto con filtros y luego exporta: lo que hay en pantalla es lo que va en el archivo.",
            ),
            h("Construir un informe"),
            steps(
              "Filtra la biblioteca a las capturas que quieras, o abre un proyecto.",
              "Elige Exportar y luego dale un título al informe.",
              "Elige un diseño: cuadrícula, detallado, antes y después, o mapa.",
              "Elige un formato: PDF, Excel, ZIP o KMZ.",
              "Genera. El archivo se construye en el servidor y aparece en tu lista de informes para descargarlo o volver a descargarlo después.",
            ),
            h("Qué formato usar"),
            table(
              ["Formato", "Úsalo para"],
              [
                [
                  "PDF",
                  "Documentación para el cliente. Fotos con marca de agua, maquetadas y paginadas.",
                ],
                ["Excel", "Una fila por captura con hora, coordenadas, dirección, etiqueta y nota."],
                ["ZIP", "Los archivos de imagen originales, para pasarlos a otro sistema."],
                ["KMZ", "Abrir las ubicaciones de las capturas en Google Earth o software GIS."],
              ],
            ),
            h("Diseños"),
            ul(
              "Cuadrícula: muchas fotos por página, mejor para volumen.",
              "Detallado: una captura por página con el bloque completo de metadatos.",
              "Antes y después: los pares etiquetados uno al lado del otro.",
              "Mapa: las ubicaciones de las capturas situadas, con un índice de fotos.",
            ),
            warn(
              "Los formatos de exportación dependen de tu plan. El plan Gratis produce un PDF de hasta 20 fotos; Excel, ZIP y KMZ empiezan en Plus. Si un formato no está cubierto se te avisa antes de construir el archivo, no después.",
            ),
            see("plans-billing/compare-plans", "troubleshoot/export-or-report-failed"),
          ],
        },
        {
          slug: "share-links",
          title: "Enlaces para compartir",
          summary:
            "Envía una captura a alguien sin cuenta, y retírale el enlace cuando hayas terminado.",
          keywords: [
            "compartir",
            "enlace",
            "cliente",
            "pública",
            "revocar",
            "caducidad",
            "share",
            "link",
            "public",
            "revoke",
          ],
          body: [
            p(
              "Un enlace para compartir es una dirección web que muestra una captura —el archivo, su hora verificada, su posición GPS y su dirección— a cualquiera que lo abra. Sin cuenta, sin app, sin iniciar sesión.",
            ),
            h("Crear un enlace"),
            steps(
              "Abre la captura en la app web.",
              "Elige Compartir.",
              "Si quieres, pon una caducidad en días. Déjalo vacío para un enlace que no caduque.",
              "Copia el enlace y envíalo.",
            ),
            h("Gestionar los enlaces"),
            ul(
              "Todos los enlaces se listan en el espacio de trabajo con cuándo se crearon y cuántas veces se han abierto.",
              "Revoca un enlace cuando quieras. Deja de funcionar de inmediato para todo el que lo tenga.",
              "Pedir compartir una captura que ya tiene un enlace activo te devuelve el enlace existente en lugar de crear un segundo.",
            ),
            h("Qué no expone un enlace para compartir"),
            ul(
              "Tus otras capturas, proyectos o miembros del equipo.",
              "Las notas internas del proyecto.",
              "Nada sobre tu espacio de trabajo, tu plan o tu facturación.",
            ),
            warn(
              "Trata un enlace como público. Cualquiera a quien se lo reenvíen puede abrirlo hasta que lo revoques o caduque.",
            ),
            note(
              "Los enlaces para compartir son una función de los planes de pago. Si Compartir no está disponible, revisa tu plan.",
            ),
            see("verify/verify-a-photo", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Tu equipo",
      articles: [
        {
          slug: "invite-your-crew",
          title: "Invitar a tu equipo",
          summary:
            "Añade personas por correo o código QR, y ponlas en los proyectos correctos desde el primer día.",
          keywords: [
            "invitar",
            "añadir miembro",
            "asiento",
            "qr",
            "equipo",
            "invite",
            "add member",
            "seat",
            "crew",
          ],
          body: [
            p(
              "Los miembros entran por invitación. Tú envías una, ellos la aceptan, y sus capturas empiezan a llegar a tu Teamspace.",
            ),
            h("Enviar una invitación"),
            steps(
              "Abre Equipo y elige Invitar.",
              "Introduce su correo de trabajo.",
              "Elige un rol. Campo es el predeterminado y es el adecuado para la mayoría del equipo.",
              "Marca los proyectos a los que deberían tener acceso ya la primera vez que inicien sesión.",
              "Envía. Reciben un correo con un enlace que los añade a tu espacio de trabajo.",
            ),
            h("Invitar a alguien que tienes al lado"),
            p(
              "Cada invitación pendiente tiene también un código QR. Muéstralo en tu pantalla, pídeles que lo escaneen con la cámara del teléfono y aterrizan en la página de aceptación sin que tú teclees su dirección. Útil para un equipo que está contigo en la obra.",
            ),
            h("Asientos"),
            p(
              "Cada plan incluye un número de asientos. Una invitación pendiente retiene un asiento, así que cinco invitaciones contra tres asientos se rechazarán en lugar de dejar que todos acepten y se desborde el plan. Si te has quedado sin asientos, revoca una invitación que no se vaya a aceptar, quita a un miembro que se haya ido, o mejora el plan.",
            ),
            h("Si la invitación no llega"),
            ul(
              "Pídeles que revisen el spam, y confirma la dirección que usaste.",
              "Revisa la lista de pendientes: si la invitación está ahí, reenvíala o usa en su lugar el código QR.",
              "Una invitación está atada a la dirección de correo a la que se envió; aceptar con otra dirección no funcionará.",
            ),
            note("Invitar y quitar miembros requiere el rol de admin o superior."),
            see("teamspace/roles-and-permissions", "troubleshoot/invite-not-working"),
          ],
        },
        {
          slug: "roles-and-permissions",
          title: "Roles y permisos",
          summary:
            "Propietario, admin, gerente y campo: qué puede hacer cada uno y a quién poner en cada rol.",
          keywords: [
            "rol",
            "permiso",
            "admin",
            "gerente",
            "campo",
            "acceso",
            "propietario",
            "role",
            "permission",
            "owner",
          ],
          body: [
            p(
              "Hay cuatro roles. Cada miembro tiene exactamente uno, y decide qué ve y qué puede cambiar.",
            ),
            table(
              ["Rol", "Puede hacer"],
              [
                [
                  "Propietario",
                  "Todo, incluida la facturación y los cambios de plan. Uno por espacio de trabajo, y no se le puede quitar.",
                ],
                [
                  "Admin",
                  "Invitar y quitar miembros, cambiar roles, gestionar proyectos, plantillas y exportaciones.",
                ],
                [
                  "Gerente",
                  "Crear y editar proyectos, borrar capturas, enviar difusiones, construir informes. Sin gestión de miembros.",
                ],
                [
                  "Campo",
                  "Capturar, y ver solo los proyectos que tiene asignados. Sin acceso al equipo, a invitaciones ni a facturación.",
                ],
              ],
            ),
            h("Qué darle a cada persona"),
            ul(
              "El equipo a pie de obra: campo.",
              "Un encargado o jefe de obra que organiza los trabajos: gerente.",
              "El personal de oficina que da de alta a la gente y lleva la documentación del cliente: admin.",
              "Deja el rol de propietario en la persona que paga la factura.",
            ),
            h("Cambiar un rol"),
            steps(
              "Abre Equipo.",
              "Elige al miembro.",
              "Elige el nuevo rol. Surte efecto la próxima vez que su app hable con el servidor.",
            ),
            h("Quitar a alguien"),
            p(
              "Quitar a un miembro le retira el acceso. No borra su trabajo: sus fotos, sus videos y el rastro de auditoría que hay detrás se quedan en el Teamspace, que es justamente el sentido de guardar la evidencia en un espacio de trabajo y no en un teléfono.",
            ),
            warn(
              "No puedes quitar al propietario del espacio de trabajo, y no puedes quitarte a ti mismo. Solo el propietario puede quitar a otro admin, así que dos admins no pueden quitarse el uno al otro.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
        {
          slug: "messages-and-broadcasts",
          title: "Mensajes y difusiones",
          summary:
            "Habla con un miembro del equipo, o envía un único aviso a todos a la vez.",
          keywords: [
            "mensaje",
            "chat",
            "difusión",
            "aviso",
            "notificar",
            "message",
            "broadcast",
            "announcement",
          ],
          body: [
            p(
              "Los mensajes son conversaciones de uno a uno entre personas del mismo espacio de trabajo. Llegan como notificación push al teléfono, así que no vas persiguiendo al equipo por una app de mensajería personal.",
            ),
            h("Escribir a alguien"),
            steps(
              "Abre Mensajes.",
              "Elige a la persona entre los contactos de tu espacio de trabajo.",
              "Escribe y envía. Puedes adjuntar una captura reciente para que quede claro de qué hablas.",
            ),
            h("Difusiones"),
            p(
              "Una difusión envía el mismo mensaje a todo el espacio de trabajo a la vez. Se entrega como un mensaje normal en la conversación de cada persona, así que las respuestas te vuelven en privado en lugar de convertirse en una discusión de grupo.",
            ),
            steps(
              "Abre Mensajes y elige Difusión.",
              "Si quieres, adjunta un proyecto, para que la gente sepa de qué trabajo se trata.",
              "Escribe el mensaje y envía. Verás a cuántas personas ha llegado.",
            ),
            note(
              "Enviar una difusión requiere el rol de gerente o superior. La mensajería de uno a uno está abierta a todos en el espacio de trabajo.",
            ),
            see("mobile-app/notifications", "troubleshoot/notifications-not-arriving"),
          ],
        },
      ],
    },
    {
      title: "Estándares",
      articles: [
        {
          slug: "watermark-template-library",
          title: "Biblioteca de plantillas de marca de agua",
          summary:
            "Define el sello que usa cada teléfono del espacio de trabajo, para que las capturas vuelvan consistentes.",
          keywords: [
            "marca de agua",
            "plantilla",
            "marca",
            "logo",
            "sello",
            "predeterminada",
            "watermark",
            "template",
            "default",
          ],
          body: [
            p(
              "Una plantilla de marca de agua decide qué se graba en la esquina de cada captura: qué campos aparecen, dónde se sitúa el bloque y si lleva tu logo. Las plantillas viven en el espacio de trabajo y no en un dispositivo, así que lo que definas aquí es lo que sella todo el equipo.",
            ),
            h("Crear una plantilla"),
            steps(
              "Abre Plantillas en los ajustes del espacio de trabajo.",
              "Elige Nueva plantilla y ponle nombre según el caso de uso y no según el cliente: «Progreso de obra» envejece mejor que «Trabajo Northline».",
              "Marca los campos que quieras mostrar: fecha y hora, coordenadas, dirección, proyecto, nombre del miembro, código de foto, tiempo meteorológico, una línea personalizada.",
              "Elige la esquina y el tamaño, y sube un logo si quieres uno.",
              "Guarda.",
            ),
            h("La plantilla predeterminada"),
            p(
              "Una plantilla es la predeterminada del espacio de trabajo. Los miembros nuevos la reciben automáticamente, y es la que usa un teléfono hasta que alguien la cambie. Puedes poner otra predeterminada cuando quieras; las capturas existentes no se tocan.",
            ),
            h("Mantenimiento"),
            ul(
              "Borrar una plantilla no cambia las capturas ya selladas con ella.",
              "No puedes quedarte sin ninguna predeterminada: promover una plantilla degrada a la anterior en el mismo paso.",
              "El equipo puede cambiar entre las plantillas del espacio de trabajo en su teléfono, pero no puede editarlas.",
            ),
            warn(
              "El plan Gratis incluye dos plantillas. Los planes de pago te permiten construir tu propio conjunto con un logo.",
            ),
            see("mobile-app/watermark-templates", "mobile-app/switch-template"),
          ],
        },
      ],
    },
  ],
};
