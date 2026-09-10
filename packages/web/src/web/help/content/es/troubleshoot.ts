import { type Category, h, note, p, see, steps, ul, warn } from "../../types";

export const troubleshoot: Category = {
  slug: "troubleshoot",
  title: "Solución de problemas",
  summary: "Lo que sale mal más a menudo, y qué comprobar primero.",
  icon: "Wrench",
  sections: [
    {
      title: "Captura y subida",
      articles: [
        {
          slug: "photos-not-uploading",
          title: "Las fotos no se suben",
          summary: "Capturas paradas en la cola y cómo ponerlas en marcha.",
          keywords: [
            "subir",
            "cola",
            "atascado",
            "pendiente",
            "sin conexión",
            "sincronizar",
            "límite",
            "upload",
            "queue",
            "stuck",
          ],
          body: [
            p(
              "Las capturas se quedan en el teléfono hasta que se suben. Una cola es normal con mala señal; una cola que nunca se vacía no lo es.",
            ),
            h("Comprueba en este orden"),
            steps(
              "Abre la app y mira la cola de subida. Si muestra elementos esperando, las capturas están a salvo en el dispositivo.",
              "Consigue señal real o Wi-Fi. Una sola barra suele conectar pero no puede mover una foto.",
              "Trae la app a primer plano y déjala ahí un minuto. Algunos teléfonos suspenden las transferencias en segundo plano de forma agresiva.",
              "Comprueba que el teléfono no está en modo de bajo consumo o de ahorro de datos, que bloquea las subidas en segundo plano.",
              "Cierra la sesión y vuelve a entrar solo como último recurso, y hazlo con la cola vacía.",
            ),
            h("Si la cola se vacía pero no aparece nada en el espacio de trabajo"),
            ul(
              "Revisa el filtro de proyecto en la app web. Las capturas pueden haber ido a un proyecto que no estás mirando.",
              "Revisa el filtro de fechas. Una captura en cola se archiva en el día en que se tomó, no en hoy.",
              "Confirma que estás mirando el espacio de trabajo correcto si perteneces a más de uno.",
            ),
            h("Si has llegado a un límite mensual"),
            p(
              "El plan Gratis cubre 300 capturas al mes. Pasado eso, las subidas se rechazan hasta que cambie el mes o pases a un plan sin tope mensual.",
            ),
            warn(
              "No borres la app mientras haya capturas en cola. Las capturas ya subidas viven en tu espacio de trabajo, pero todo lo que siga esperando en el dispositivo se va con ella.",
            ),
            note(
              "La hora de captura se registra en el dispositivo, así que una foto que se sube dos días tarde sigue llevando el momento en que se disparó, y la verificación lo refleja.",
            ),
            see("mobile-app/offline-capture-and-queue", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "gps-or-address-wrong",
          title: "La posición GPS o la dirección están mal",
          summary: "Por qué se desvía un pin y qué hacer con un nombre de calle equivocado.",
          keywords: [
            "gps",
            "ubicación",
            "dirección",
            "precisión",
            "mal",
            "desvío",
            "permiso",
            "location",
            "address",
            "accuracy",
          ],
          body: [
            p(
              "GeoCliks registra la posición que informa el teléfono y luego resuelve esa posición a una dirección. Los dos pasos pueden desviarse, por razones distintas.",
            ),
            h("El pin está en el sitio equivocado"),
            ul(
              "En interiores, en un sótano, en un aparcamiento subterráneo o entre edificios altos, la recepción de satélite es mala y el teléfono recurre a una fijación más burda.",
              "Un teléfono que se acaba de encender todavía no tiene fijación. Dale quince segundos al aire libre antes de la primera captura del día.",
              "Cada captura registra su precisión. Una cifra de precisión grande es el teléfono diciéndote que no estaba seguro: eso es una función, no un defecto.",
            ),
            h("La posición es correcta pero la dirección está mal"),
            p(
              "La dirección se busca a partir de las coordenadas. En una urbanización nueva, en una carretera rural o en una parcela grande con un solo número, lo que vuelve es la dirección conocida más cercana, y puede ser el edificio de al lado. Las coordenadas siguen siendo el registro que manda.",
            ),
            h("No hay ubicación en absoluto"),
            steps(
              "Abre los ajustes de tu teléfono y busca GeoCliks.",
              "Pon el permiso de ubicación en «Mientras se usa la app» o en «Siempre».",
              "En iPhone, activa además la Ubicación precisa. Sin ella obtienes una zona aproximada en lugar de una posición.",
              "Vuelve a capturar. A las capturas anteriores no se les puede añadir una ubicación después.",
            ),
            h("Paradas de entrega en el sitio equivocado"),
            p(
              "La posición de una parada viene de resolver la dirección escrita, no de un teléfono. Corrige la dirección y vuelve a resolver, o coloca el pin a mano.",
            ),
            warn(
              "Una posición no se puede añadir ni editar después de la captura. Eso es lo que la convierte en evidencia: si se pudiera corregir más tarde, no probaría nada.",
            ),
            see("delivery-routes/geocoding-and-fixing-addresses", "verify/verify-results-explained"),
          ],
        },
      ],
    },
    {
      title: "Acceso",
      articles: [
        {
          slug: "cant-sign-in",
          title: "No puedo iniciar sesión",
          summary: "Contraseña incorrecta, correo sin verificar o el método de acceso equivocado.",
          keywords: [
            "iniciar sesión",
            "entrar",
            "contraseña",
            "restablecer",
            "verificar",
            "bloqueado",
            "sign in",
            "password",
            "reset",
          ],
          body: [
            p("Ve por orden: la causa suele ser una de las tres primeras."),
            h("Comprueba lo básico"),
            steps(
              "Confirma la dirección de correo. Una dirección de trabajo y una personal son dos cuentas distintas.",
              "Usa el mismo método con el que te registraste. Una cuenta creada con Google no tiene contraseña que teclear.",
              "Restablece tu contraseña desde la pantalla de inicio de sesión si no estás seguro.",
              "Abre el correo de verificación si nunca confirmaste la dirección: una cuenta sin verificar no puede iniciar sesión.",
            ),
            h("No llega nada cuando pides un restablecimiento"),
            ul(
              "Revisa el spam y el correo no deseado.",
              "Espera dos minutos. Las peticiones repetidas pueden acabar limitadas por frecuencia, lo que ralentiza más las cosas.",
              "Confirma que la dirección existe: un restablecimiento para una dirección sin cuenta no envía nada.",
            ),
            h("Te piden demostrar que eres humano"),
            p(
              "Los intentos fallidos repetidos pueden activar una comprobación. Complétala y continúa. Si sigue apareciendo, prueba con una ventana normal del navegador en lugar de una privada y desactiva cualquier extensión que bloquee scripts.",
            ),
            h("Inicias sesión pero acabas en el sitio equivocado"),
            ul(
              "Si perteneces a más de un espacio de trabajo, cámbialo desde el menú de la cuenta.",
              "Un miembro de campo solo ve sus proyectos asignados, así que un espacio de trabajo que parece vacío suele significar que todavía no tiene proyectos asignados: pídeselo a un admin.",
            ),
            note(
              "Que te quiten de un espacio de trabajo no borra tu cuenta. Puedes seguir iniciando sesión; simplemente no verás ese espacio de trabajo.",
            ),
            see("troubleshoot/two-factor-issues", "getting-started/create-your-account"),
          ],
        },
        {
          slug: "two-factor-issues",
          title: "Problemas con el doble factor",
          summary: "Códigos rechazados, un teléfono perdido y cómo funcionan los códigos de respaldo.",
          keywords: [
            "doble factor",
            "dos factores",
            "autenticador",
            "códigos de respaldo",
            "código rechazado",
            "2fa",
            "totp",
            "backup codes",
          ],
          body: [
            p(
              "La autenticación en dos pasos es opcional y se ofrece a propietarios y admins desde la página de perfil. Al personal de campo no se le empuja deliberadamente a una app de autenticación, porque un teléfono compartido en la furgoneta lo hace insufrible.",
            ),
            h("El código se rechaza"),
            steps(
              "Comprueba que estás leyendo la entrada de GeoCliks en tu app de autenticación, y no otro servicio.",
              "Espera al siguiente código. Los códigos cambian cada 30 segundos y uno que está a punto de caducar se rechaza a menudo.",
              "Teclea los seis dígitos sin espacios.",
              "Comprueba que el reloj del teléfono se ajusta automáticamente. Un reloj de dispositivo desviado varios minutos genera códigos que el servidor no acepta.",
            ),
            h("Has perdido el teléfono con el autenticador"),
            p(
              "Usa uno de los códigos de respaldo que se te dieron al activar el doble factor. Elige la opción de código de respaldo en la pantalla del segundo paso e introduce uno. Cada código funciona una sola vez.",
            ),
            warn(
              "Si has perdido tanto el autenticador como los códigos de respaldo, no podemos recuperar la cuenta desde la pantalla de inicio de sesión. Escribe a support@geocliks.com desde la propia dirección de la cuenta y espera comprobaciones de identidad: esa fricción es justamente el sentido del doble factor.",
            ),
            h("Desactivarlo"),
            p(
              "Inicia sesión, abre tu perfil y desactiva el doble factor. Se te pedirá confirmación. Si eres el propietario, piensa en dejarlo activado: es la cuenta que puede cambiar la facturación y quitar a personas.",
            ),
            note(
              "El doble factor se aplica a tu cuenta en todas partes. Una vez activado, tanto la web como la app del teléfono piden el segundo paso.",
            ),
            see("troubleshoot/cant-sign-in", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "invite-not-working",
          title: "Una invitación no funciona",
          summary: "Sin correo, un enlace caducado o sin asientos libres en el plan.",
          keywords: [
            "invitación",
            "invitar",
            "asiento",
            "caducado",
            "aceptar",
            "correo",
            "invite",
            "seat",
            "expired",
            "qr",
          ],
          body: [
            p("Los problemas con las invitaciones se reducen a la dirección, los asientos o el plan."),
            h("Nunca recibieron el correo"),
            steps(
              "Abre Equipo y revisa la lista de pendientes: si la invitación está ahí, se creó.",
              "Revisa la dirección por si hay una errata. Una invitación está atada a la dirección exacta a la que se envió.",
              "Pídeles que revisen el spam.",
              "Usa en su lugar el código QR: abre la invitación pendiente, muestra el código y pídeles que lo escaneen con su teléfono.",
            ),
            h("Aceptaron pero no ven nada"),
            p(
              "Los miembros de campo solo ven los proyectos que tienen asignados. Asígnaselos desde Equipo, o desde el propio proyecto, y aparecen en su teléfono en unos momentos.",
            ),
            h("No puedes enviar la invitación en absoluto"),
            ul(
              "Sin asientos libres: las invitaciones pendientes también retienen un asiento. Revoca las invitaciones obsoletas, quita a quien se haya ido o sube de plan.",
              "Teamspace no incluido: las invitaciones empiezan en el plan Business. Gratis y Plus son de un solo asiento.",
              "Rol equivocado: invitar requiere ser admin o propietario.",
            ),
            h("Aceptaron con un correo distinto"),
            p(
              "Eso no funciona: la invitación solo coincide con la dirección a la que se envió. Revócala y envía una nueva a la dirección que usan de verdad.",
            ),
            note("Revocar una invitación pendiente libera su asiento de inmediato."),
            see("teamspace/invite-your-crew", "plans-billing/seats-and-billing"),
          ],
        },
      ],
    },
    {
      title: "Rutas, exportaciones y avisos",
      articles: [
        {
          slug: "route-optimize-failed",
          title: "Una ruta no se optimiza",
          summary: "Normalmente son direcciones sin resolver. A veces es el plan.",
          keywords: [
            "optimizar",
            "ruta",
            "falló",
            "coordenadas",
            "geocodificar",
            "orden",
            "optimize",
            "route",
            "geocode",
          ],
          body: [
            p("El optimizador trabaja con posiciones en el mapa, no con direcciones escritas."),
            h("«Ninguna parada tiene coordenadas todavía»"),
            steps(
              "Abre la ruta y elige Resolver direcciones.",
              "Mira las paradas que no se pudieron resolver.",
              "Corrige el texto de la dirección, o coloca el pin a mano en el mapa.",
              "Optimiza de nuevo.",
            ),
            h("Se optimizó, pero algunas paradas quedaron al final"),
            p(
              "Las paradas sin posición no se pueden ordenar, así que se aparcan al final de la lista en lugar de eliminarse de la ruta. Resuélvelas o colócales el pin y vuelve a optimizar.",
            ),
            h("Pediste el optimizador inteligente y te salió el estándar"),
            p(
              "En un plan sin el optimizador inteligente, GeoCliks ejecuta el estándar en lugar de negarse. Igualmente obtienes una ruta ordenada. El historial de la ruta registra qué optimizador se ejecutó.",
            ),
            h("El orden todavía te parece mal"),
            ul(
              "Comprueba que la dirección de inicio está puesta, y si debería estar activado el regreso al punto de partida.",
              "Comprueba el tiempo de servicio: un valor disparatado distorsiona todas las estimaciones de llegada.",
              "Las ventanas horarias de las paradas condicionan el orden, y una ventana estrecha prevalece sobre el camino más corto.",
              "Arrastra las paradas a mano. El conocimiento local le gana a un algoritmo más a menudo de lo que los proveedores admiten.",
            ),
            see("delivery-routes/optimize-stop-order", "delivery-routes/geocoding-and-fixing-addresses"),
          ],
        },
        {
          slug: "export-or-report-failed",
          title: "Una exportación o un informe falló",
          summary: "Límites del plan, selecciones demasiado grandes y formatos no incluidos.",
          keywords: [
            "exportar",
            "informe",
            "falló",
            "descargar",
            "export",
            "report",
            "pdf",
            "excel",
            "zip",
            "kmz",
          ],
          body: [
            p("La mayoría de los fallos de exportación son un límite del plan y no una avería."),
            h("El formato no está disponible"),
            ul(
              "El plan Gratis produce solo un PDF, de hasta 20 fotos.",
              "Excel, ZIP y KMZ empiezan en Plus.",
              "Se te avisa antes de construir el archivo y no después, así que nada queda generado a medias.",
            ),
            h("La exportación es muy grande"),
            steps(
              "Acota la selección con el filtro de fecha o de proyecto.",
              "Exporta por lotes: un mes cada vez es más fácil tanto de enviar por correo como de construir.",
              "Para miles de originales, prefiere ZIP antes que PDF. Un PDF de ese tamaño es inservible de todos modos.",
            ),
            h("El archivo nunca se descarga"),
            ul(
              "Los informes se construyen en el servidor y luego aparecen en tu lista de informes: míralo ahí y vuelve a descargarlo en lugar de reconstruirlo.",
              "Comprueba que el navegador no bloqueó la descarga y mira en tu carpeta de descargas.",
              "Prueba una vez con otro navegador antes de reportarlo.",
            ),
            h("Un KMZ no se abre"),
            p(
              "KMZ necesita Google Earth o software GIS. No es un formato de documento y no se abrirá en un lector de PDF ni en una hoja de cálculo.",
            ),
            note(
              "Todos los informes generados se quedan en tu lista de informes, así que puedes volver a descargarlos después sin reconstruirlos.",
            ),
            see("teamspace/reports-and-exports", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "notifications-not-arriving",
          title: "Las notificaciones no llegan",
          summary:
            "Las push del teléfono y los correos que deberían recibir los destinatarios de entrega.",
          keywords: [
            "notificaciones",
            "correo",
            "avisos",
            "destinatario",
            "seguimiento",
            "notifications",
            "push",
            "email",
            "tracking",
          ],
          body: [
            p("Son dos sistemas distintos, así que comprueba el que corresponda a lo que falta."),
            h("Notificaciones push en el teléfono"),
            steps(
              "Abre los ajustes de tu teléfono, busca GeoCliks y permite las notificaciones.",
              "Revisa el modo No molestar, los modos de concentración y cualquier horario nocturno.",
              "Abre la app una vez con la sesión iniciada: el dispositivo se registra para las push al iniciar sesión, así que un teléfono que no ha abierto la app desde una reinstalación no está registrado.",
              "Envíate un mensaje a ti mismo desde la app web para probar.",
            ),
            h("Un miembro del equipo no recibe nada"),
            ul(
              "Tiene que ser miembro del espacio de trabajo y tener la sesión iniciada en ese dispositivo.",
              "Las difusiones van a los contactos del espacio de trabajo: quien haya sido retirado del espacio de trabajo deja de recibirlas.",
              "Un teléfono que ha estado sin conexión durante días recibe las notificaciones en cola al reconectarse, o no las recibe si ya han caducado.",
            ),
            h("Los destinatarios de entrega no reciben correos"),
            ul(
              "La parada necesita una dirección de correo del destinatario. Sin ella no hay correo posible.",
              "Los ajustes de notificación de la propia ruta controlan el aviso previo y los correos de comprobante de entrega.",
              "Las paradas fallidas nunca envían un correo de comprobante de entrega, por diseño. Esas las gestiona la oficina a mano.",
              "Cada destinatario recibe cada correo una sola vez, así que un reenvío no sale dos veces.",
              "El envío de correo tiene que estar configurado para tu espacio de trabajo. Si ningún destinatario de ninguna ruta ha recibido nunca nada, eso es lo primero que hay que comprobar.",
            ),
            warn(
              "Pídele al destinatario que revise el spam antes de concluir que no se envió nada. El correo transaccional con una foto dentro cae en no deseado más a menudo de lo que te gustaría.",
            ),
            see("delivery-routes/tracking-links-and-notifications", "teamspace/messages-and-broadcasts"),
          ],
        },
      ],
    },
  ],
};
