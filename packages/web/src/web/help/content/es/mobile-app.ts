import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const mobileApp: Category = {
  slug: "mobile-app",
  title: "App móvil",
  summary: "Captura fotos y videos con marca de agua en iPhone, iPad o Android.",
  icon: "Smartphone",
  sections: [
    {
      title: "Captura",
      articles: [
        {
          slug: "sign-in-on-mobile",
          title: "Iniciar sesión en el teléfono",
          summary: "Entra en la app y elige el espacio de trabajo para el que capturas.",
          keywords: [
            "iniciar sesión",
            "entrar",
            "espacio de trabajo",
            "cambiar",
            "login",
            "sign in",
            "workspace",
          ],
          body: [
            p(
              "Inicia sesión con el mismo correo y contraseña que usas en la web, o con Google si así te registraste.",
            ),
            h("Si perteneces a más de un espacio de trabajo"),
            p(
              "Tus capturas van siempre al espacio de trabajo que esté abierto en ese momento. Comprueba el nombre del espacio de trabajo en la parte superior de la pantalla antes de empezar a capturar: una foto archivada en el espacio equivocado hay que borrarla y volver a tomarla.",
            ),
            steps(
              "Toca tu avatar en la esquina superior.",
              "Elige el espacio de trabajo que quieras.",
              "La lista de proyectos se recarga para ese espacio de trabajo.",
            ),
            h("Mantener la sesión abierta"),
            p(
              "La app te mantiene con la sesión abierta. No te cierra la sesión cuando pierdes cobertura y no necesita conexión para abrirse. Si te pide la contraseña cada vez, tu teléfono está limpiando el almacenamiento de la app en segundo plano: revisa los ajustes de optimización de batería.",
            ),
            see("troubleshoot/cant-sign-in", "mobile-app/offline-capture-and-queue"),
          ],
        },
        {
          slug: "take-a-photo",
          title: "Tomar una foto",
          summary: "La acción principal: capturar, sellar, subir.",
          keywords: ["captura", "cámara", "foto", "disparar", "capture", "camera", "photo"],
          body: [
            steps(
              "Abre la app y elige el proyecto en el que estás trabajando.",
              "Toca el botón de captura.",
              "Espera a que el indicador de ubicación se estabilice: al aire libre suele bastar un momento.",
              "Encuadra la toma y hazla.",
              "Añade una nota si la foto necesita explicación. Las notas se pueden buscar después.",
            ),
            h("Qué queda grabado en la foto"),
            ul(
              "Fecha y hora, comprobadas contra la hora de red en lugar del reloj del teléfono.",
              "Coordenadas GPS.",
              "La dirección a la que resuelven esas coordenadas.",
              "Tu nombre y el proyecto, si la plantilla los incluye.",
              "Un código de foto único que cualquiera puede verificar.",
            ),
            h("Conseguir una buena posición"),
            ul(
              "Sal al exterior o apártate del acero y el hormigón antes de capturar.",
              "Dale al teléfono unos segundos después de abrir la app: la primera fijación es la más lenta.",
              "En interiores y bajo tierra, espera que la dirección sea aproximada. Las coordenadas se registran igualmente.",
            ),
            warn(
              "No puedes cambiar la hora, las coordenadas ni la dirección de una captura después de hecha. Si una foto está mal, bórrala y toma otra.",
            ),
            see("mobile-app/watermark-templates", "troubleshoot/gps-or-address-wrong"),
          ],
        },
        {
          slug: "record-a-video",
          title: "Grabar un video",
          summary:
            "Video verificado con el mismo sello que las fotos, hasta la duración que permita tu plan.",
          keywords: ["video", "grabar", "clip", "duración", "record", "length"],
          body: [
            p(
              "El video funciona exactamente como la captura de fotos: misma marca de agua, misma hora y posición verificadas, mismo comportamiento de subida. Es un botón aparte en la pantalla de captura.",
            ),
            h("Duración del clip según el plan"),
            ul(
              "Gratis: clips de 30 segundos, disponibles los primeros tres días desde que se crea el espacio de trabajo.",
              "Plus: video de duración completa para una persona.",
              "Business, Crew 10, Crew 25: clips de hasta 3 minutos en todos los asientos.",
              "Planes Delivery: clips de 3 minutos incluidos.",
            ),
            h("Grabar bien"),
            ul(
              "Mantén el encuadre sobre lo importante durante tres segundos completos. Barrer rápido deja el video inservible como evidencia.",
              "Narra lo que estás mostrando. El audio forma parte del registro.",
              "Graba clips cortos y con intención en lugar de un único recorrido largo: se suben más rápido y son mucho más fáciles de encontrar después.",
            ),
            note(
              "Los archivos de video son grandes. Con una conexión limitada, deja que los clips se suban por Wi-Fi al final del día en lugar de por datos móviles.",
            ),
            see("plans-billing/compare-plans", "mobile-app/photo-quality-and-storage"),
          ],
        },
        {
          slug: "offline-capture-and-queue",
          title: "Capturar sin cobertura",
          summary:
            "Trabaja en cualquier sitio: las capturas se ponen en cola en el dispositivo y se suben cuando vuelve la señal.",
          keywords: [
            "sin conexión",
            "cola",
            "sin cobertura",
            "sincronizar",
            "subir",
            "offline",
            "queue",
            "sync",
          ],
          body: [
            p(
              "GeoCliks está hecho para sitios sin cobertura. Todo funciona sin conexión excepto la subida. No hay ningún modo especial que activar.",
            ),
            h("Qué pasa sin conexión"),
            ul(
              "La cámara, la marca de agua y el GPS funcionan con normalidad: el GPS no necesita conexión de datos.",
              "Cada captura se escribe en el dispositivo con su hora real de captura.",
              "La pantalla de cola muestra lo que está esperando para subirse.",
              "En cuanto hay conexión, la cola se vacía sola en segundo plano.",
            ),
            h("La hora de una captura sin conexión"),
            p(
              "La hora registrada es cuando pulsaste el botón, no cuando la foto acabó de subirse. Subir con retraso no debilita el registro.",
            ),
            warn(
              "No borres ni reinstales la app mientras haya capturas en cola. Todo lo que no se haya subido se pierde. Comprueba antes que la cola está vacía.",
            ),
            h("Si la cola se queda atascada"),
            ul(
              "Abre la app y déjala en primer plano un minuto con buena conexión.",
              "Confirma que sigues con la sesión abierta.",
              "Comprueba que el teléfono no está en modo de ahorro de datos o de batería, que bloquea las transferencias en segundo plano.",
            ),
            see("troubleshoot/photos-not-uploading"),
          ],
        },
        {
          slug: "assign-capture-to-project",
          title: "Poner las capturas en el proyecto correcto",
          summary: "Elige el proyecto antes de disparar, o mueve las fotos después.",
          keywords: [
            "proyecto",
            "asignar",
            "mover",
            "archivar",
            "organizar",
            "project",
            "assign",
            "move",
          ],
          body: [
            p(
              "Cada captura pertenece a un proyecto. El proyecto es lo que alimenta los informes, el mapa y lo que ve tu cliente, así que acertar de entrada te ahorra limpieza después.",
            ),
            h("Antes de capturar"),
            steps(
              "Abre la lista de proyectos.",
              "Toca el trabajo en el que estás. Se queda seleccionado hasta que lo cambies.",
              "Captura con normalidad: todo se archiva ahí solo.",
            ),
            h("Mover una captura después"),
            p(
              "Los gerentes, los admins y el propietario pueden mover capturas entre proyectos desde Teamspace. Mover una foto solo cambia a qué proyecto pertenece; la hora, la posición, la dirección y el código de foto quedan intactos, y el registro de verificación sigue comprobándose.",
            ),
            note(
              "Si tu equipo archiva una y otra vez en el trabajo equivocado, la causa habitual es una selección de proyecto obsoleta del día anterior. Pídeles que comprueben el nombre del proyecto en la pantalla de captura cada mañana.",
            ),
            see("teamspace/create-a-project", "teamspace/browse-and-filter-photos"),
          ],
        },
      ],
    },
    {
      title: "Marcas de agua y ajustes",
      articles: [
        {
          slug: "watermark-templates",
          title: "Plantillas de marca de agua",
          summary: "Decide qué aparece en cada foto y pon tu logo en ella.",
          keywords: [
            "marca de agua",
            "plantilla",
            "logo",
            "marca",
            "sello",
            "campos",
            "watermark",
            "template",
            "branding",
          ],
          body: [
            p(
              "Una plantilla de marca de agua es la disposición del sello grabado en tus capturas. Se define por espacio de trabajo, así que las fotos de todo el equipo salen consistentes.",
            ),
            h("Campos que puedes mostrar u ocultar"),
            ul(
              "Fecha y hora",
              "Coordenadas GPS",
              "Dirección",
              "Nombre del proyecto",
              "El nombre de quien captura",
              "Una nota de texto libre o un número de trabajo",
              "El logo de tu empresa",
            ),
            h("Editar la plantilla"),
            steps(
              "En Teamspace, abre Marcas de agua.",
              "Elige una plantilla o crea una nueva.",
              "Activa los campos que quieras y sube tu logo.",
              "Guarda. Las capturas nuevas la usan de inmediato; las fotos existentes conservan el sello con el que se tomaron.",
            ),
            warn(
              "Cambiar una plantilla nunca cambia las fotos ya tomadas. Es deliberado: un sello que se pudiera reescribir después no sería evidencia.",
            ),
            h("Cuántas plantillas tienes"),
            ul("Gratis: 2 plantillas.", "Plus y superiores: plantillas ilimitadas más tu propio logo."),
            see("teamspace/watermark-template-library", "mobile-app/switch-template"),
          ],
        },
        {
          slug: "switch-template",
          title: "Cambiar de plantilla en el trabajo",
          summary: "Usa un sello distinto para un cliente o un tipo de trabajo concreto.",
          keywords: [
            "cambiar",
            "cambiar plantilla",
            "predeterminada",
            "por proyecto",
            "switch",
            "change template",
            "default",
          ],
          body: [
            p(
              "La mayoría de los equipos usan una sola plantilla para todo. Cuando necesitas otra —un cliente que quiere su número de trabajo en cada foto, o una inspección que necesita campos extra— cámbiala en la pantalla de captura.",
            ),
            steps(
              "En la pantalla de captura, toca el nombre de la plantilla.",
              "Elige la plantilla que quieras.",
              "Captura. La elección se mantiene hasta que la cambies de vuelta.",
            ),
            note(
              "Tu espacio de trabajo tiene una plantilla predeterminada, que se usa siempre que nadie haya elegido otra. Los gerentes definen la predeterminada en Teamspace, en Marcas de agua.",
            ),
            see("teamspace/watermark-template-library"),
          ],
        },
        {
          slug: "photo-quality-and-storage",
          title: "Calidad de foto y almacenamiento",
          summary:
            "Equilibra la calidad de imagen con la velocidad de subida y el almacenamiento del teléfono.",
          keywords: [
            "calidad",
            "resolución",
            "almacenamiento",
            "tamaño",
            "original",
            "datos",
            "quality",
            "storage",
          ],
          body: [
            h("Ajuste de calidad"),
            p(
              "Más calidad significa mejor evidencia y subidas más lentas. Para la mayoría del trabajo de documentación el ajuste estándar es suficiente: se mantiene legible impreso en un informe. Súbelo cuando importe el detalle fino, como grietas capilares o números de serie.",
            ),
            h("Conservar el original"),
            p(
              "Puedes hacer que la app guarde en tu carrete un original sin marca de agua junto a la versión sellada. Es útil cuando necesitas una imagen limpia para otro fin. Aproximadamente duplica el almacenamiento que usa cada captura en el teléfono.",
            ),
            h("Liberar espacio"),
            ul(
              "Las capturas que han terminado de subirse se pueden borrar del dispositivo: se quedan en Teamspace.",
              "El video es lo que llena un teléfono. Borra primero los clips ya subidos.",
              "Nunca borres nada que siga en la cola de subida.",
            ),
            see("mobile-app/offline-capture-and-queue", "mobile-app/app-settings"),
          ],
        },
        {
          slug: "notifications",
          title: "Notificaciones",
          summary: "De qué te avisa la app y cómo bajarle el volumen.",
          keywords: [
            "notificaciones",
            "avisos",
            "silenciar",
            "notifications",
            "push",
            "alerts",
            "mute",
          ],
          body: [
            h("Qué envía GeoCliks"),
            ul(
              "Subida terminada, o subida fallida que necesita tu atención.",
              "Un mensaje directo o una difusión desde tu oficina.",
              "Una ruta asignada a ti, y recordatorios cuando te acercas a una parada.",
              "Invitaciones y cambios de rol.",
            ),
            h("Bajarles el volumen"),
            steps(
              "Abre Ajustes en la app.",
              "Abre Notificaciones.",
              "Desactiva las categorías que no necesites.",
            ),
            note(
              "Si eres conductor, deja las notificaciones de ruta activadas. El despacho las usa para avisarte de que se ha añadido una parada a un recorrido ya en curso.",
            ),
            see("troubleshoot/notifications-not-arriving"),
          ],
        },
        {
          slug: "app-settings",
          title: "Ajustes de la app",
          summary: "Idioma, tema, cuadrícula, sonido del disparador y lo demás.",
          keywords: [
            "ajustes",
            "idioma",
            "tema",
            "modo oscuro",
            "cuadrícula",
            "sonido",
            "settings",
            "language",
            "dark mode",
          ],
          body: [
            h("Idioma"),
            p(
              "GeoCliks está disponible en 11 idiomas. Tu elección se aplica solo a este dispositivo, así que cada miembro del equipo puede leer la app en su propio idioma dentro de un mismo espacio de trabajo. Déjalo en el predeterminado del espacio de trabajo para seguir lo que eligió la oficina.",
            ),
            h("Apariencia"),
            p(
              "Están disponibles los temas claro y oscuro. El oscuro descansa más la vista en una furgoneta de noche; el claro se lee mejor a pleno sol.",
            ),
            h("Ayudas de captura"),
            ul(
              "Cuadrícula: una rejilla de encuadre en el visor. No queda grabada en la foto.",
              "Sonido del disparador: desactívalo en sitios donde haya que guardar silencio. Algunos países lo exigen por ley y allí no se puede desactivar.",
              "Guardar original: conserva en el dispositivo una copia sin marca de agua.",
            ),
            h("Tu perfil"),
            p(
              "Tu nombre, tu foto y tu contraseña están en Perfil. Tu nombre aparece en las capturas cuando la plantilla lo incluye, así que déjalo como te reconocería tu equipo.",
            ),
            see("mobile-app/photo-quality-and-storage", "teamspace/roles-and-permissions"),
          ],
        },
      ],
    },
  ],
};
