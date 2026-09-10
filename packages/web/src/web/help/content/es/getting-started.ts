import { type Category, h, note, p, see, steps, ul } from "../../types";

export const gettingStarted: Category = {
  slug: "getting-started",
  title: "Primeros pasos",
  summary: "¿Nuevo en GeoCliks? Elige el camino que encaje con tu situación.",
  icon: "Rocket",
  sections: [
    {
      title: "Lo básico",
      articles: [
        {
          slug: "what-is-geocliks",
          title: "¿Qué es GeoCliks?",
          summary:
            "Evidencia de campo que puedes demostrar: cada foto lleva hora verificada, posición GPS y dirección.",
          keywords: ["resumen", "acerca de", "producto", "introducción", "overview", "about"],
          body: [
            p(
              "GeoCliks es una herramienta de documentación con foto y video para equipos de campo. Capturas el trabajo con un teléfono y cada captura queda sellada con la hora en que se tomó, el lugar donde se tomó y la dirección a la que resuelve esa posición. El sello se graba en la imagen y se guarda además por separado para poder comprobarlo después.",
            ),
            p(
              "El objetivo no son fotos más bonitas. El objetivo es que, cuando un cliente, una aseguradora o un tribunal pregunte si una foto es lo que dices que es, tengas una respuesta que no dependa de tu palabra.",
            ),
            h("Qué obtienes"),
            ul(
              "Fotos y videos con marca de agua, hora verificada, coordenadas GPS y dirección.",
              "Un código de foto único en cada captura que cualquiera puede comprobar sin cuenta.",
              "Teamspace: un espacio de trabajo compartido donde la oficina ve las capturas del equipo según se suben.",
              "Proyectos, vista de mapa, comparaciones de antes y después y exportaciones a PDF, Excel, ZIP y KMZ con un clic.",
              "Rutas de entrega: planifica la jornada de un conductor, mándalo a la calle y cierra cada parada con una foto de prueba.",
            ),
            h("Quién lo usa"),
            ul(
              "Equipos de construcción y oficios que documentan avance y cierre de obra.",
              "Trabajos de restauración y seguros donde la cronología es todo el argumento.",
              "Equipos de servicios públicos, telecomunicaciones e inspección que necesitan una ubicación en cada registro.",
              "Operaciones de reparto que necesitan probar que un paquete llegó de verdad.",
            ),
            note(
              "GeoCliks funciona sin conexión. Las capturas se ponen en cola en el dispositivo y se suben solas cuando vuelve la señal, con la hora de captura original intacta.",
            ),
            see("getting-started/create-your-account", "verify/what-is-a-photo-code"),
          ],
        },
        {
          slug: "create-your-account",
          title: "Crea tu cuenta",
          summary: "Regístrate en la app o en la web: la misma cuenta sirve en todas partes.",
          keywords: ["registro", "registrarse", "cuenta nueva", "correo", "sign up", "email"],
          body: [
            p(
              "Una sola cuenta de GeoCliks funciona en la app móvil, el sitio web y la app de escritorio. Créala donde te resulte cómodo; registrarte en otro sitio no crea una segunda cuenta.",
            ),
            h("Registrarse"),
            steps(
              "Abre la app de GeoCliks, o entra en geocliks.com y elige Crear cuenta.",
              "Introduce tu nombre, tu correo de trabajo y una contraseña, o continúa con Google.",
              "Busca el correo de verificación en tu bandeja y abre el enlace.",
              "Elige un idioma. Puedes cambiarlo después desde tu perfil.",
            ),
            note(
              "Usa tu correo de trabajo, no uno personal. Cuando alguien te invite a un espacio de trabajo, enviará la invitación a la dirección que conoce.",
            ),
            h("Si el correo de verificación no llega"),
            ul(
              "Espera dos minutos y revisa la carpeta de spam o correo no deseado.",
              "Confirma la dirección que escribiste: una letra de menos es la causa habitual.",
              "Pide un enlace nuevo desde la pantalla de inicio de sesión.",
            ),
            see("getting-started/for-solo-user", "troubleshoot/cant-sign-in"),
          ],
        },
        {
          slug: "install-the-app",
          title: "Instala la app",
          summary:
            "Consigue GeoCliks en iPhone, iPad o Android, y usa la app web en la computadora.",
          keywords: ["descargar", "ios", "android", "instalar", "escritorio", "download", "install"],
          body: [
            p(
              "Se captura desde un teléfono o una tableta. Revisar, hacer informes y planificar rutas es más cómodo en una computadora, pero todo está disponible en ambos.",
            ),
            h("Móvil"),
            ul(
              "iPhone y iPad: instala desde el App Store.",
              "Android: instala desde Google Play.",
              "O abre geocliks.com/get-app en el dispositivo y sigue el enlace de tu plataforma.",
            ),
            h("Computadora"),
            p(
              "Entra en geocliks.com e inicia sesión. No hay nada que instalar: Teamspace funciona en el navegador. También existe una app de escritorio si prefieres una ventana aparte.",
            ),
            h("Permisos que pide la app"),
            ul(
              "Cámara: obligatorio. Sin ella no hay nada que capturar.",
              "Ubicación: obligatorio. La posición GPS es la mitad de lo que convierte una captura en evidencia.",
              "Fotos: opcional, solo si además quieres guardar las capturas en tu carrete.",
              "Notificaciones: opcional, para subidas, mensajes y asignaciones de ruta.",
            ),
            note(
              "Pon el permiso de ubicación como mínimo en «Mientras se usa la app». Con «Preguntar cada vez», la app tiene que interrumpirte antes de cada captura.",
            ),
            see("mobile-app/sign-in-on-mobile", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Elige tu camino",
      articles: [
        {
          slug: "for-solo-user",
          title: "Si trabajas por tu cuenta",
          summary: "La configuración más rápida para una operación de una sola persona.",
          keywords: ["autónomo", "una persona", "individual", "freelance", "solo"],
          body: [
            p(
              "No necesitas un equipo para sacarle partido a GeoCliks. Una cuenta individual te da capturas con marca de agua, proyectos para separar trabajos y exportaciones que puedes entregar a un cliente.",
            ),
            h("Prepárate en cinco minutos"),
            steps(
              "Instala la app e inicia sesión.",
              "Crea tu primer proyecto: normalmente la dirección de la obra o el nombre del cliente.",
              "Abre la plantilla de marca de agua y añade tu logo, para que las exportaciones se vean tuyas.",
              "Haz una captura de prueba y comprueba que el sello muestra la hora y la dirección correctas.",
              "Expórtala a PDF para ver lo que recibirá tu cliente.",
            ),
            h("Qué hacer cuando el trabajo crezca"),
            ul(
              "Mantén un proyecto por obra. Así los informes quedan limpios y el mapa legible.",
              "Usa comparaciones de antes y después al principio y al final de cada trabajo.",
              "Envía a los clientes un enlace para compartir en lugar de un adjunto: se mantiene al día.",
            ),
            note(
              "El plan Gratis cubre fotos con marca de agua, video de 30 segundos durante los tres primeros días y exportación a PDF de hasta 20 fotos. Plus levanta los límites de foto y video para una persona.",
            ),
            see("teamspace/create-a-project", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "for-team-owner",
          title: "Si diriges el equipo",
          summary: "Crea el espacio de trabajo, invita a la cuadrilla y decide quién puede hacer qué.",
          keywords: [
            "propietario",
            "admin",
            "configuración",
            "espacio de trabajo",
            "gerente",
            "owner",
            "workspace",
          ],
          body: [
            p(
              "El propietario del espacio de trabajo configura Teamspace una vez y los demás se suman. Hazlo en una computadora: es más rápido que en el teléfono.",
            ),
            h("Un orden de configuración que funciona"),
            steps(
              "Crea el espacio de trabajo y ponle el nombre de tu empresa.",
              "Arma una plantilla de marca de agua con tu logo y los campos que quieres en cada foto.",
              "Crea tus proyectos activos antes de invitar a nadie, para que el equipo tenga dónde poner las capturas.",
              "Invita al equipo por correo, o comparte el enlace de unión o el código QR impreso.",
              "Asigna el rol de cada persona. La mayor parte del equipo debería ser Campo.",
              "Haz una captura tú mismo y confirma que aterriza en el proyecto correcto.",
            ),
            h("Roles"),
            ul(
              "Propietario: control total, incluida la facturación y el borrado del espacio de trabajo. Solo hay uno.",
              "Admin: todo lo que puede hacer el propietario salvo facturación y propiedad.",
              "Gerente: crea proyectos y rutas, invita gente, ejecuta informes.",
              "Campo: captura fotos y video, hace las rutas asignadas y ve su propio trabajo.",
            ),
            note(
              "Invita a la gente como Campo salvo que necesiten crear proyectos o ejecutar informes. Puedes subir un rol en cualquier momento; surte efecto la próxima vez que abran la app.",
            ),
            see("teamspace/invite-your-crew", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "for-crew-member",
          title: "Si te invitaron a un equipo",
          summary: "Únete al espacio de trabajo y haz tu primera captura.",
          keywords: ["campo", "cuadrilla", "unirse", "invitado", "miembro", "field", "join"],
          body: [
            p(
              "Alguien de tu empresa creó un espacio de trabajo y te añadió. Tu trabajo es capturar la obra en el campo; la oficina se encarga de proyectos, informes y facturación.",
            ),
            h("Unirse"),
            steps(
              "Abre el correo de invitación, o escanea el código QR que te dé tu gerente.",
              "Crea tu cuenta, o inicia sesión si ya tienes una.",
              "Instala la app de GeoCliks en tu teléfono.",
              "Permite cámara y ubicación. Las dos son obligatorias para capturar.",
              "Abre la lista de proyectos y elige la obra en la que estás trabajando.",
            ),
            h("Tu primera captura"),
            steps(
              "Toca el botón de captura.",
              "Comprueba que la vista previa de la marca de agua muestra el proyecto y la dirección correctos.",
              "Haz la foto. Se sube sola.",
              "Si no tienes señal, sigue trabajando: las capturas se ponen en cola y se suben después.",
            ),
            note(
              "No puedes editar la hora ni la ubicación de una captura, y tu gerente tampoco. Ese es el sentido del producto, no una limitación.",
            ),
            see("mobile-app/take-a-photo", "mobile-app/offline-capture-and-queue"),
          ],
        },
      ],
    },
  ],
};
