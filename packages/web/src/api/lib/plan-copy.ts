import { type LocaleCode, asLocale } from "./locales";
import { LEGACY_SHIPPED } from "./plans-legacy";
import { DEFAULT_PLANS, type Plan, priceLabel } from "./plans";

/**
 * Localized display copy for the shipped plans.
 *
 * Display-only: prices, `autumnPlanId` and every limit stay untouched, so the
 * payment processor always sees the same English identifiers and USD amounts.
 * A field is only substituted when the DB row still holds the shipped English
 * default — operator edits made in /admin/plans always win.
 */
export interface PlanCopy {
  name?: string;
  period?: string;
  tagline?: string;
  features?: string[];
}

/** Price label for `priceCents < 0` ("talk to sales"). */
const CUSTOM_LABEL: Record<LocaleCode, string> = {
  en: "Custom",
  "fr-CA": "Sur mesure",
  es: "A medida",
  "pt-BR": "Personalizado",
  de: "Individuell",
  it: "Su misura",
  zh: "定制",
  vi: "Tùy chỉnh",
  tl: "Pasadya",
  ar: "مخصص",
  pl: "Indywidualnie",
};

export const PLAN_COPY: Record<string, Partial<Record<LocaleCode, PlanCopy>>> = {
  free: {
    "fr-CA": {
      name: "Gratuit",
      period: "pour toujours",
      tagline: "Capturez des photos de chantier avec des filigranes personnalisables.",
      features: [
        "Filigrane avec heure vérifiée, GPS et adresse",
        "Code photo unique sur chaque capture",
        "Capture hors ligne avec téléversement automatique",
        "2 modèles de filigrane",
        "Export PDF jusqu'à 20 photos",
        "Vidéo vérifiée — clips de 30 s, 3 premiers jours",
      ],
    },
    es: {
      name: "Gratis",
      period: "para siempre",
      tagline: "Captura fotos de obra con plantillas de marca de agua personalizables.",
      features: [
        "Marca de agua con hora verificada, GPS y dirección",
        "Código de foto único en cada captura",
        "Captura sin conexión con subida automática",
        "2 plantillas de marca de agua",
        "Exportación PDF de hasta 20 fotos",
        "Vídeo verificado: clips de 30 s, primeros 3 días",
      ],
    },
    "pt-BR": {
      name: "Grátis",
      period: "para sempre",
      tagline: "Registre fotos da obra com modelos de marca-d'água personalizáveis.",
      features: [
        "Marca-d'água com hora verificada, GPS e endereço",
        "Código de foto único em cada captura",
        "Captura offline com envio automático",
        "2 modelos de marca-d'água",
        "Exportação em PDF de até 20 fotos",
        "Vídeo verificado — clipes de 30 s, primeiros 3 dias",
      ],
    },
    de: {
      name: "Kostenlos",
      period: "dauerhaft",
      tagline: "Baustellenfotos mit anpassbaren Wasserzeichen-Vorlagen erfassen.",
      features: [
        "Wasserzeichen mit verifizierter Zeit, GPS und Adresse",
        "Eindeutiger Fotocode bei jeder Aufnahme",
        "Offline-Aufnahme mit automatischem Upload",
        "2 Wasserzeichen-Vorlagen",
        "PDF-Export für bis zu 20 Fotos",
        "Verifiziertes Video — 30-s-Clips, erste 3 Tage",
      ],
    },
    it: {
      name: "Gratis",
      period: "per sempre",
      tagline: "Scatta foto di cantiere con modelli di filigrana personalizzabili.",
      features: [
        "Filigrana con ora verificata, GPS e indirizzo",
        "Codice foto univoco su ogni scatto",
        "Acquisizione offline con caricamento automatico",
        "2 modelli di filigrana",
        "Esportazione PDF fino a 20 foto",
        "Video verificato — clip di 30 s, primi 3 giorni",
      ],
    },
    zh: {
      name: "免费版",
      period: "永久免费",
      tagline: "使用可自定义的水印模板拍摄现场照片。",
      features: [
        "含已验证时间、GPS 与地址的水印",
        "每张照片都有唯一编码",
        "离线拍摄并自动上传",
        "2 个水印模板",
        "PDF 导出最多 20 张照片",
        "已验证视频 — 30 秒片段，前 3 天",
      ],
    },
    vi: {
      name: "Miễn phí",
      period: "vĩnh viễn",
      tagline: "Chụp ảnh công trường với mẫu hình chìm tùy chỉnh.",
      features: [
        "Hình chìm có giờ đã xác minh, GPS và địa chỉ",
        "Mã ảnh duy nhất cho mỗi lần chụp",
        "Chụp ngoại tuyến, tự động tải lên",
        "2 mẫu hình chìm",
        "Xuất PDF tối đa 20 ảnh",
        "Video đã xác minh — clip 30 giây, 3 ngày đầu",
      ],
    },
    tl: {
      name: "Libre",
      period: "panghabang-buhay",
      tagline: "Kumuha ng mga litrato sa site gamit ang nababagong watermark templates.",
      features: [
        "Watermark na may beripikadong oras, GPS at address",
        "Natatanging photo code sa bawat kuha",
        "Offline na pagkuha na awtomatikong nag-upload",
        "2 watermark template",
        "PDF export hanggang 20 litrato",
        "Beripikadong video — 30s clips, unang 3 araw",
      ],
    },
    ar: {
      name: "مجاني",
      period: "للأبد",
      tagline: "التقط صور العمل مع قوالب علامة مائية قابلة للتخصيص.",
      features: [
        "علامة مائية بالوقت الموثّق وGPS والعنوان",
        "رمز صورة فريد لكل التقاط",
        "التقاط دون اتصال مع رفع تلقائي",
        "قالبان للعلامة المائية",
        "تصدير PDF حتى 20 صورة",
        "فيديو موثّق — مقاطع 30 ثانية، أول 3 أيام",
      ],
    },
    pl: {
      name: "Darmowy",
      period: "na zawsze",
      tagline: "Rób zdjęcia z budowy z konfigurowalnymi szablonami znaku wodnego.",
      features: [
        "Znak wodny z weryfikowaną godziną, GPS i adresem",
        "Unikalny kod zdjęcia przy każdym ujęciu",
        "Zdjęcia offline z automatycznym wysyłaniem",
        "2 szablony znaku wodnego",
        "Eksport PDF do 20 zdjęć",
        "Weryfikowane wideo — klipy 30 s, pierwsze 3 dni",
      ],
    },
  },
  plus: {
    "fr-CA": {
      period: "par mois",
      tagline: "Fonctions avancées, conçues pour un usage individuel.",
      features: [
        "Photos et projets illimités",
        "Tous les modèles de filigrane + votre logo",
        "Exports PDF, Excel, ZIP et KMZ",
        "Mises en page avant / après",
        "Liens de partage en direct pour vos clients",
        "Vidéo vérifiée jusqu'à 3 minutes",
      ],
    },
    es: {
      period: "por mes",
      tagline: "Funciones avanzadas, pensadas para uso individual.",
      features: [
        "Fotos y proyectos ilimitados",
        "Todas las plantillas de marca de agua + tu logo",
        "Exportaciones PDF, Excel, ZIP y KMZ",
        "Composiciones de antes y después",
        "Enlaces de uso compartido en vivo para clientes",
        "Vídeo verificado de hasta 3 minutos",
      ],
    },
    "pt-BR": {
      period: "por mês",
      tagline: "Recursos avançados, feitos para uso individual.",
      features: [
        "Fotos e projetos ilimitados",
        "Todos os modelos de marca-d'água + sua logo",
        "Exportações PDF, Excel, ZIP e KMZ",
        "Layouts de antes e depois",
        "Links de compartilhamento ao vivo para clientes",
        "Vídeo verificado de até 3 minutos",
      ],
    },
    de: {
      period: "pro Monat",
      tagline: "Erweiterte Funktionen für die Einzelnutzung.",
      features: [
        "Unbegrenzte Fotos und Projekte",
        "Alle Wasserzeichen-Vorlagen + eigenes Logo",
        "PDF-, Excel-, ZIP- und KMZ-Exporte",
        "Vorher-Nachher-Layouts",
        "Live-Freigabelinks für Kunden",
        "Verifiziertes Video bis zu 3 Minuten",
      ],
    },
    it: {
      period: "al mese",
      tagline: "Funzioni avanzate, pensate per l'uso individuale.",
      features: [
        "Foto e progetti illimitati",
        "Tutti i modelli di filigrana + il tuo logo",
        "Esportazioni PDF, Excel, ZIP e KMZ",
        "Layout prima e dopo",
        "Link di condivisione live per i clienti",
        "Video verificato fino a 3 minuti",
      ],
    },
    zh: {
      name: "Plus 版",
      period: "每月",
      tagline: "面向个人使用的进阶功能。",
      features: [
        "照片和项目无限制",
        "全部水印模板 + 你的标识",
        "PDF、Excel、ZIP 和 KMZ 导出",
        "施工前后对比排版",
        "面向客户的实时共享链接",
        "已验证视频最长 3 分钟",
      ],
    },
    vi: {
      period: "mỗi tháng",
      tagline: "Tính năng nâng cao, dành cho cá nhân.",
      features: [
        "Ảnh và dự án không giới hạn",
        "Tất cả mẫu hình chìm + logo của bạn",
        "Xuất PDF, Excel, ZIP và KMZ",
        "Bố cục trước và sau",
        "Liên kết chia sẻ trực tiếp cho khách hàng",
        "Video đã xác minh tối đa 3 phút",
      ],
    },
    tl: {
      period: "kada buwan",
      tagline: "Mga advanced na feature, para sa indibidwal na gamit.",
      features: [
        "Walang limitasyong litrato at proyekto",
        "Lahat ng watermark template + logo mo",
        "PDF, Excel, ZIP at KMZ export",
        "Before at after na layout",
        "Live share link para sa mga kliyente",
        "Beripikadong video hanggang 3 minuto",
      ],
    },
    ar: {
      name: "بلس",
      period: "شهريًا",
      tagline: "ميزات متقدمة مصمّمة للاستخدام الفردي.",
      features: [
        "صور ومشاريع غير محدودة",
        "كل قوالب العلامة المائية + شعارك",
        "تصدير PDF وExcel وZIP وKMZ",
        "تخطيطات قبل وبعد",
        "روابط مشاركة مباشرة للعملاء",
        "فيديو موثّق حتى 3 دقائق",
      ],
    },
    pl: {
      period: "miesięcznie",
      tagline: "Zaawansowane funkcje do użytku indywidualnego.",
      features: [
        "Nielimitowane zdjęcia i projekty",
        "Wszystkie szablony znaku wodnego + Twoje logo",
        "Eksport PDF, Excel, ZIP i KMZ",
        "Układy przed i po",
        "Linki do udostępniania na żywo dla klientów",
        "Weryfikowane wideo do 3 minut",
      ],
    },
  },
  business: {
    "fr-CA": {
      name: "Affaires",
      period: "par utilisateur / mois",
      tagline: "Accès complet à l'Espace équipe, avec facturation centralisée.",
      features: [
        "Tout ce qu'offre Plus",
        "Espace équipe : chaque photo se synchronise automatiquement",
        "Permissions de projet par rôle",
        "Dossiers de clôture et relevés tels que construits",
        "Facturation centralisée et gestion des sièges",
      ],
    },
    es: {
      name: "Empresas",
      period: "por usuario / mes",
      tagline: "Acceso completo a Teamspace para tu equipo, con facturación centralizada.",
      features: [
        "Todo lo de Plus",
        "Teamspace: cada foto del equipo se sincroniza automáticamente",
        "Permisos de proyecto por rol",
        "Paquetes de cierre y registros as-built",
        "Facturación centralizada y gestión de licencias",
      ],
    },
    "pt-BR": {
      name: "Empresas",
      period: "por usuário / mês",
      tagline: "Acesso completo ao Teamspace para sua equipe, com cobrança centralizada.",
      features: [
        "Tudo do Plus",
        "Teamspace: cada foto da equipe sincroniza automaticamente",
        "Permissões de projeto por função",
        "Pacotes de encerramento e registros as-built",
        "Cobrança centralizada e gestão de assentos",
      ],
    },
    de: {
      period: "pro Nutzer / Monat",
      tagline: "Voller Teamspace-Zugriff für Ihr Team, mit zentraler Abrechnung.",
      features: [
        "Alles aus Plus",
        "Teamspace: jedes Teamfoto wird automatisch synchronisiert",
        "Rollenbasierte Projektberechtigungen",
        "Abschlusspakete und Bestandsdokumentation",
        "Zentrale Abrechnung und Lizenzverwaltung",
      ],
    },
    it: {
      name: "Business",
      period: "per utente / mese",
      tagline: "Accesso completo al Teamspace per la tua squadra, con fatturazione centralizzata.",
      features: [
        "Tutto ciò che offre Plus",
        "Teamspace: ogni foto della squadra si sincronizza automaticamente",
        "Permessi di progetto per ruolo",
        "Pacchetti di chiusura e documentazione as-built",
        "Fatturazione centralizzata e gestione delle postazioni",
      ],
    },
    zh: {
      name: "商业版",
      period: "每用户 / 月",
      tagline: "为团队提供完整的 Teamspace 访问权限，并集中计费。",
      features: [
        "包含 Plus 版全部功能",
        "Teamspace：班组照片自动同步",
        "基于角色的项目权限",
        "竣工资料包与竣工记录",
        "集中计费与席位管理",
      ],
    },
    vi: {
      name: "Doanh nghiệp",
      period: "mỗi người dùng / tháng",
      tagline: "Toàn quyền truy cập Teamspace cho đội của bạn, thanh toán tập trung.",
      features: [
        "Mọi thứ trong Plus",
        "Teamspace: mọi ảnh của tổ đội tự động đồng bộ",
        "Quyền dự án theo vai trò",
        "Bộ hồ sơ hoàn công và bản ghi as-built",
        "Thanh toán tập trung và quản lý chỗ ngồi",
      ],
    },
    tl: {
      period: "kada user / buwan",
      tagline: "Buong access sa Teamspace para sa team mo, may sentralisadong billing.",
      features: [
        "Lahat ng nasa Plus",
        "Teamspace: awtomatikong nag-sync ang litrato ng bawat crew",
        "Role-based na permiso sa proyekto",
        "Closeout package at as-built na rekord",
        "Sentralisadong billing at pamamahala ng seat",
      ],
    },
    ar: {
      name: "الأعمال",
      period: "لكل مستخدم / شهر",
      tagline: "وصول كامل إلى مساحة الفريق، مع فوترة مركزية.",
      features: [
        "كل ما في بلس",
        "مساحة الفريق: كل صورة للطاقم تُزامَن تلقائيًا",
        "أذونات المشاريع حسب الدور",
        "حزم الإغلاق وسجلات ما تم تنفيذه",
        "فوترة مركزية وإدارة المقاعد",
      ],
    },
    pl: {
      name: "Firma",
      period: "za użytkownika / mies.",
      tagline: "Pełny dostęp do Teamspace dla zespołu, z centralnym rozliczeniem.",
      features: [
        "Wszystko z planu Plus",
        "Teamspace: każde zdjęcie ekipy synchronizuje się automatycznie",
        "Uprawnienia do projektów według roli",
        "Pakiety odbiorowe i dokumentacja powykonawcza",
        "Centralne rozliczenia i zarządzanie stanowiskami",
      ],
    },
  },
  enterprise: {
    "fr-CA": {
      name: "Entreprise",
      period: "parlons-en",
      tagline: "Forfaits sur mesure pour les grandes organisations.",
      features: [
        "Tout ce qu'offre Affaires",
        "SSO et politiques de conservation sur mesure",
        "Modèles de rapport sur mesure et accès API",
        "Intégration et soutien dédiés",
        "Tarification par volume, toutes régions",
      ],
    },
    es: {
      name: "Corporativo",
      period: "hablemos",
      tagline: "Planes a medida para grandes organizaciones.",
      features: [
        "Todo lo de Empresas",
        "SSO y políticas de retención personalizadas",
        "Plantillas de informe a medida y acceso a la API",
        "Incorporación y soporte dedicados",
        "Precios por volumen en todas las regiones",
      ],
    },
    "pt-BR": {
      name: "Corporativo",
      period: "fale com a gente",
      tagline: "Planos personalizados para grandes organizações.",
      features: [
        "Tudo do plano Empresas",
        "SSO e políticas de retenção personalizadas",
        "Modelos de relatório personalizados e acesso à API",
        "Onboarding e suporte dedicados",
        "Preços por volume em todas as regiões",
      ],
    },
    de: {
      period: "sprechen wir",
      tagline: "Individuelle Pakete für große Organisationen.",
      features: [
        "Alles aus Business",
        "SSO und individuelle Aufbewahrungsregeln",
        "Individuelle Berichtsvorlagen und API-Zugriff",
        "Dediziertes Onboarding und Support",
        "Mengenpreise über alle Regionen",
      ],
    },
    it: {
      period: "parliamone",
      tagline: "Piani su misura per grandi organizzazioni.",
      features: [
        "Tutto ciò che offre Business",
        "SSO e criteri di conservazione su misura",
        "Modelli di report su misura e accesso API",
        "Onboarding e supporto dedicati",
        "Prezzi a volume in tutte le regioni",
      ],
    },
    zh: {
      name: "企业版",
      period: "联系我们",
      tagline: "面向大型组织的定制方案。",
      features: [
        "包含商业版全部功能",
        "SSO 与自定义留存策略",
        "定制报告模板与 API 访问",
        "专属上线支持与技术支持",
        "跨区域批量定价",
      ],
    },
    vi: {
      name: "Tập đoàn",
      period: "liên hệ với chúng tôi",
      tagline: "Gói tùy chỉnh cho tổ chức lớn.",
      features: [
        "Mọi thứ trong Doanh nghiệp",
        "SSO và chính sách lưu trữ tùy chỉnh",
        "Mẫu báo cáo tùy chỉnh và truy cập API",
        "Onboarding và hỗ trợ riêng",
        "Giá theo số lượng trên mọi khu vực",
      ],
    },
    tl: {
      period: "kausapin kami",
      tagline: "Pasadyang plano para sa malalaking organisasyon.",
      features: [
        "Lahat ng nasa Business",
        "SSO at pasadyang retention policy",
        "Pasadyang report template at API access",
        "Dedikadong onboarding at suporta",
        "Volume pricing sa lahat ng rehiyon",
      ],
    },
    ar: {
      name: "المؤسسات",
      period: "تواصل معنا",
      tagline: "خطط مخصصة للمؤسسات الكبيرة.",
      features: [
        "كل ما في خطة الأعمال",
        "الدخول الموحّد وسياسات احتفاظ مخصصة",
        "قوالب تقارير مخصصة والوصول إلى API",
        "تهيئة ودعم مخصصان",
        "أسعار بالحجم في جميع المناطق",
      ],
    },
    pl: {
      period: "porozmawiajmy",
      tagline: "Plany szyte na miarę dla dużych organizacji.",
      features: [
        "Wszystko z planu Firma",
        "SSO i własne zasady retencji",
        "Własne szablony raportów i dostęp do API",
        "Dedykowane wdrożenie i wsparcie",
        "Ceny wolumenowe we wszystkich regionach",
      ],
    },
  },
};

/**
 * Copy revised for the Delivery Routes release, kept apart from the block above so
 * the original translations stay readable and reviewable.
 *
 * Taglines had to be re-translated: `localizePlan` substitutes a tagline whenever the
 * DB row still matches the shipped English, so a stale translation attached to revised
 * English would quietly say the wrong thing. Bullets are safe — they translate one by
 * one and an unknown bullet simply stays in English.
 */
const DELIVERY_ERA_COPY: Record<string, Partial<Record<LocaleCode, PlanCopy>>> = {
  free: {
    "fr-CA": {
      tagline: "Photos et vidéos de chantier vérifiées, gratuit pour toujours.",
    },
    es: {
      tagline: "Fotos y vídeo de obra verificados, gratis para siempre.",
    },
    "pt-BR": {
      tagline: "Fotos e vídeos de obra verificados, grátis para sempre.",
    },
    de: {
      tagline: "Verifizierte Baustellenfotos und Videos – dauerhaft kostenlos.",
    },
    it: {
      tagline: "Foto e video di cantiere verificati, gratis per sempre.",
    },
    zh: {
      tagline: "经过验证的工地照片和视频，永久免费。",
    },
    vi: {
      tagline: "Ảnh và video công trường đã xác minh, miễn phí trọn đời.",
    },
    tl: {
      tagline: "Beripikadong larawan at video ng trabaho, libre habambuhay.",
    },
    ar: {
      tagline: "صور وفيديو موثّقة للعمل، مجاناً إلى الأبد.",
    },
    pl: {
      tagline: "Zweryfikowane zdjęcia i wideo z prac, darmowe na zawsze.",
    },
  },
  plus: {
    "fr-CA": {
      tagline: "Photos vérifiées illimitées et vidéo pleine durée, pour une personne.",
    },
    es: {
      tagline: "Fotos verificadas ilimitadas y vídeo completo, para una persona.",
    },
    "pt-BR": {
      tagline: "Fotos verificadas ilimitadas e vídeo completo, para uma pessoa.",
    },
    de: {
      tagline: "Unbegrenzte verifizierte Fotos und Videos in voller Länge – für eine Person.",
    },
    it: {
      tagline: "Foto verificate illimitate e video a lunghezza piena, per una persona.",
    },
    zh: {
      tagline: "无限量验证照片和完整时长视频，单人使用。",
    },
    vi: {
      tagline: "Ảnh đã xác minh không giới hạn và video đầy đủ, cho một người.",
    },
    tl: {
      tagline: "Walang limitasyong beripikadong larawan at buong haba na video, para sa isang tao.",
    },
    ar: {
      tagline: "صور موثّقة غير محدودة وفيديو بطول كامل، لشخص واحد.",
    },
    pl: {
      tagline: "Nielimitowane zweryfikowane zdjęcia i pełne wideo, dla jednej osoby.",
    },
  },
  business: {
    "fr-CA": {
      period: "par mois",
      tagline:
        "Espace équipe pour une petite équipe. 5 sièges, vidéo pleine durée, une seule facture.",
    },
    es: {
      period: "por mes",
      tagline:
        "Espacio de equipo para una cuadrilla pequeña. 5 puestos, vídeo completo, una sola factura.",
    },
    "pt-BR": {
      period: "por mês",
      tagline:
        "Espaço de equipe para uma equipe pequena. 5 assentos, vídeo completo, uma fatura única.",
    },
    de: {
      period: "pro Monat",
      tagline: "Teamspace für ein kleines Team. 5 Plätze, Video in voller Länge, eine Rechnung.",
    },
    it: {
      period: "al mese",
      tagline:
        "Spazio team per una piccola squadra. 5 postazioni, video a lunghezza piena, una sola fattura.",
    },
    zh: {
      period: "每月",
      tagline: "小团队协作空间。5 个席位、完整时长视频、一张账单。",
    },
    vi: {
      period: "mỗi tháng",
      tagline: "Không gian nhóm cho đội nhỏ. 5 chỗ, video đầy đủ, một hóa đơn duy nhất.",
    },
    tl: {
      period: "kada buwan",
      tagline: "Teamspace para sa maliit na crew. 5 puwesto, buong haba na video, isang bayarin.",
    },
    ar: {
      period: "شهريًا",
      tagline: "مساحة فريق لطاقم صغير. 5 مقاعد وفيديو بطول كامل وفاتورة واحدة.",
    },
    pl: {
      period: "miesięcznie",
      tagline: "Przestrzeń zespołu dla małej ekipy. 5 stanowisk, pełne wideo, jeden rachunek.",
    },
  },
  enterprise: {
    "fr-CA": {
      tagline: "Forfaits sur mesure pour les grandes flottes et organisations.",
    },
    es: {
      tagline: "Planes a medida para grandes flotas y organizaciones.",
    },
    "pt-BR": {
      tagline: "Planos sob medida para grandes frotas e organizações.",
    },
    de: {
      tagline: "Individuelle Tarife für große Flotten und Organisationen.",
    },
    it: {
      tagline: "Piani su misura per grandi flotte e organizzazioni.",
    },
    zh: {
      tagline: "为大型车队和机构定制的方案。",
    },
    vi: {
      tagline: "Gói tùy chỉnh cho đội xe lớn và tổ chức.",
    },
    tl: {
      tagline: "Pasadyang plano para sa malalaking fleet at organisasyon.",
    },
    ar: {
      tagline: "خطط مخصّصة للأساطيل الكبيرة والمؤسسات.",
    },
    pl: {
      tagline: "Indywidualne plany dla dużych flot i organizacji.",
    },
  },
  crew10: {
    "fr-CA": {
      tagline: "Dix sièges pour une équipe en croissance. La même facture chaque mois.",
    },
    es: {
      tagline: "Diez puestos para una cuadrilla en crecimiento. La misma factura cada mes.",
    },
    "pt-BR": {
      tagline: "Dez assentos para uma equipe em crescimento. A mesma fatura todo mês.",
    },
    de: {
      tagline: "Zehn Plätze für ein wachsendes Team. Jeden Monat dieselbe Rechnung.",
    },
    it: {
      tagline: "Dieci postazioni per una squadra in crescita. La stessa fattura ogni mese.",
    },
    zh: {
      tagline: "为成长中的团队提供十个席位。每月账单固定。",
    },
    vi: {
      tagline: "Mười chỗ cho đội đang phát triển. Hóa đơn cố định mỗi tháng.",
    },
    tl: {
      tagline: "Sampung puwesto para sa lumalaking crew. Parehong bayarin bawat buwan.",
    },
    ar: {
      tagline: "عشرة مقاعد لطاقم متنامٍ. الفاتورة نفسها كل شهر.",
    },
    pl: {
      tagline: "Dziesięć stanowisk dla rosnącej ekipy. Ten sam rachunek co miesiąc.",
    },
  },
  crew25: {
    "fr-CA": {
      tagline: "Vingt-cinq sièges pour plusieurs équipes sous un même compte.",
    },
    es: {
      tagline: "Veinticinco puestos para varias cuadrillas en una sola cuenta.",
    },
    "pt-BR": {
      tagline: "Vinte e cinco assentos para várias equipes em uma só conta.",
    },
    de: {
      tagline: "Fünfundzwanzig Plätze für mehrere Teams unter einem Konto.",
    },
    it: {
      tagline: "Venticinque postazioni per più squadre in un solo account.",
    },
    zh: {
      tagline: "二十五个席位，多支团队共用一个账户。",
    },
    vi: {
      tagline: "Hai mươi lăm chỗ cho nhiều đội trong một tài khoản.",
    },
    tl: {
      tagline: "Dalawampu't limang puwesto para sa maraming crew sa isang account.",
    },
    ar: {
      tagline: "خمسة وعشرون مقعداً لعدة أطقم ضمن حساب واحد.",
    },
    pl: {
      tagline: "Dwadzieścia pięć stanowisk dla wielu ekip na jednym koncie.",
    },
  },
  "delivery-lite": {
    "fr-CA": {
      tagline: "Tournées avec preuve de livraison pour une petite flotte. 500 arrêts par mois.",
      features: [
        "500 arrêts de livraison par mois, 2 chauffeurs",
        "Générateur de tournée : saisissez, collez une liste ou importez un CSV",
        "Ordre des arrêts optimisé — sans frais par arrêt",
        "Preuve photo verrouillée à chaque arrêt, signature en option",
        "Lien de suivi privé et courriel de livraison pour chaque destinataire",
        "Photos vérifiées illimitées et vidéo de 3 minutes",
        "Espace équipe, rôles et exports PDF, Excel, ZIP, KMZ",
      ],
    },
    es: {
      tagline: "Rutas con prueba de entrega para una flota pequeña. 500 paradas al mes.",
    },
    "pt-BR": {
      tagline: "Rotas com comprovante de entrega para uma frota pequena. 500 paradas por mês.",
    },
    de: {
      tagline: "Touren mit Liefernachweis für eine kleine Flotte. 500 Stopps pro Monat.",
    },
    it: {
      tagline: "Giri con prova di consegna per una piccola flotta. 500 fermate al mese.",
    },
    zh: {
      tagline: "小型车队的送货凭证路线。每月 500 个站点。",
    },
    vi: {
      tagline: "Tuyến giao hàng có bằng chứng cho đội xe nhỏ. 500 điểm dừng mỗi tháng.",
    },
    tl: {
      tagline:
        "Mga ruta na may patunay ng paghahatid para sa maliit na fleet. 500 hinto kada buwan.",
    },
    ar: {
      tagline: "مسارات بإثبات تسليم لأسطول صغير. 500 محطة شهرياً.",
    },
    pl: {
      tagline: "Trasy z potwierdzeniem dostawy dla małej floty. 500 przystanków miesięcznie.",
    },
  },
  "delivery-pro": {
    "fr-CA": {
      tagline:
        "Le poste de répartition complet : 2 000 arrêts, répartition en direct, optimiseur intelligent.",
      features: [
        "2 000 arrêts de livraison par mois, 5 chauffeurs",
        "Optimiseur intelligent — trajet le plus court, réoptimisation en tout temps",
        "Répartition en direct : ajoutez des commandes à une tournée en cours",
        "Courriels en route, vous êtes le prochain et livré, avec la photo",
        "Capture de signature et motifs d'échec de livraison",
        "Chaque arrêt scellé par empreinte et vérifiable par code",
        "Tout ce qui est inclus dans Crew 10 pour le bureau",
      ],
    },
    es: {
      tagline:
        "La central de reparto completa: 2.000 paradas, despacho en vivo, optimizador inteligente.",
    },
    "pt-BR": {
      tagline:
        "A central de entregas completa: 2.000 paradas, despacho ao vivo, otimizador inteligente.",
    },
    de: {
      tagline: "Die komplette Disposition: 2.000 Stopps, Live-Dispatch, smarter Optimierer.",
    },
    it: {
      tagline:
        "La centrale consegne completa: 2.000 fermate, dispatch in tempo reale, ottimizzatore intelligente.",
    },
    zh: {
      tagline: "完整的配送调度台：2,000 个站点、实时调度、智能优化。",
    },
    vi: {
      tagline:
        "Bàn điều phối giao hàng đầy đủ: 2.000 điểm dừng, điều phối trực tiếp, tối ưu thông minh.",
    },
    tl: {
      tagline: "Buong delivery desk: 2,000 hinto, live dispatch, smart optimizer.",
    },
    ar: {
      tagline: "مكتب توصيل متكامل: 2000 محطة، إرسال مباشر، محسّن ذكي.",
    },
    pl: {
      tagline:
        "Pełna dyspozytornia dostaw: 2000 przystanków, dyspozycja na żywo, inteligentny optymalizator.",
    },
  },
  "delivery-fleet": {
    "fr-CA": {
      tagline: "Plusieurs équipes sur la route. 6 000 arrêts par mois, 15 chauffeurs.",
      features: [
        "6 000 arrêts de livraison par mois, 15 chauffeurs",
        "Tout ce qui est inclus dans Delivery Pro",
        "Optimiseur intelligent et répartition en direct sur chaque tournée",
        "Rapport d'exceptions quotidien : arrêts échoués, sautés et en retard",
        "Dossiers de clôture et exports pour toutes les équipes",
        "Soutien prioritaire",
      ],
    },
    es: {
      tagline: "Varias cuadrillas en ruta. 6.000 paradas al mes, 15 conductores.",
    },
    "pt-BR": {
      tagline: "Várias equipes na estrada. 6.000 paradas por mês, 15 motoristas.",
    },
    de: {
      tagline: "Mehrere Teams unterwegs. 6.000 Stopps pro Monat, 15 Fahrer.",
    },
    it: {
      tagline: "Più squadre su strada. 6.000 fermate al mese, 15 autisti.",
    },
    zh: {
      tagline: "多支车队同时上路。每月 6,000 个站点，15 名司机。",
    },
    vi: {
      tagline: "Nhiều đội trên đường. 6.000 điểm dừng mỗi tháng, 15 tài xế.",
    },
    tl: {
      tagline: "Maraming crew sa kalsada. 6,000 hinto kada buwan, 15 driver.",
    },
    ar: {
      tagline: "عدة أطقم على الطريق. 6000 محطة شهرياً و15 سائقاً.",
    },
    pl: {
      tagline: "Kilka ekip w trasie. 6000 przystanków miesięcznie, 15 kierowców.",
    },
  },
  "enterprise-field": {
    "fr-CA": {
      tagline: "Forfaits sur mesure pour les grandes équipes de terrain et organisations.",
    },
    es: {
      tagline: "Planes a medida para grandes equipos de campo y organizaciones.",
    },
    "pt-BR": {
      tagline: "Planos sob medida para grandes equipes de campo e organizações.",
    },
    de: {
      tagline: "Individuelle Tarife für große Außendienstteams und Organisationen.",
    },
    it: {
      tagline: "Piani su misura per grandi squadre sul campo e organizzazioni.",
    },
    zh: {
      tagline: "为大型现场团队和机构定制的方案。",
    },
    vi: {
      tagline: "Gói tùy chỉnh cho đội hiện trường lớn và tổ chức.",
    },
    tl: {
      tagline: "Pasadyang plano para sa malalaking field team at organisasyon.",
    },
    ar: {
      tagline: "خطط مخصّصة لفرق العمل الميدانية الكبيرة والمؤسسات.",
    },
    pl: {
      tagline: "Indywidualne plany dla dużych zespołów terenowych i organizacji.",
    },
  },
};

// Plans that had no localized entry at all still need a localized billing period;
// every one of them bills monthly, exactly like Plus.
const MONTHLY_PERIOD_INHERIT = [
  "crew10",
  "crew25",
  "delivery-lite",
  "delivery-pro",
  "delivery-fleet",
];

for (const [planId, byLocale] of Object.entries(DELIVERY_ERA_COPY)) {
  const target = (PLAN_COPY[planId] ??= {});
  for (const [code, copy] of Object.entries(byLocale)) {
    const locale = code as LocaleCode;
    const period = MONTHLY_PERIOD_INHERIT.includes(planId)
      ? PLAN_COPY.plus?.[locale]?.period
      : undefined;
    target[locale] = { ...(period ? { period } : {}), ...target[locale], ...copy };
  }
}

const DEFAULTS = Object.fromEntries(DEFAULT_PLANS.map((p) => [p.id, p]));

/**
 * English bullet → translated bullet, per locale, zipped from the shipped defaults.
 * Bullets are translated one by one so an operator adding or reordering a bullet in
 * /admin/plans still gets the known ones localized; unknown bullets stay as typed.
 */
const FEATURE_COPY: Partial<Record<LocaleCode, Record<string, string>>> = {};
for (const plan of DEFAULT_PLANS) {
  // A translated array is zipped against the English array it was written for.
  // When a plan's English bullets are revised, older translations still line up
  // with the legacy snapshot, so every unchanged bullet keeps its translation and
  // only genuinely new bullets fall back to English. Zipping a stale translation
  // against a reordered English list would silently mislabel bullets.
  const legacy = LEGACY_SHIPPED.find((l) => l.id === plan.id)?.features;
  for (const [code, copy] of Object.entries(PLAN_COPY[plan.id] ?? {})) {
    const translated = (copy as PlanCopy).features;
    if (!translated) continue;
    // Legacy wins the tie: `free` kept six bullets but reordered them, so matching
    // on length alone against the current list would attach the wrong translation.
    const english =
      legacy && translated.length === legacy.length
        ? legacy
        : translated.length === plan.features.length
          ? plan.features
          : null;
    if (!english) continue;
    const bucket = (FEATURE_COPY[code as LocaleCode] ??= {});
    english.forEach((source, i) => {
      const value = translated[i];
      if (value && !bucket[source]) bucket[source] = value;
    });
  }
}

/**
 * Bullets introduced by the delivery/field split. They are new English strings, so no
 * shipped translation array lines up with them by index and the zip above cannot reach
 * them. Mapped explicitly here, then merged in without overwriting anything already
 * resolved. Plan names stay English on purpose, exactly like the rest of the catalog.
 */
const SPLIT_ERA_BULLETS: Record<string, Partial<Record<LocaleCode, string>>> = {
  "Delivery routes come with the Delivery plans": {
    "fr-CA": "Les tournées de livraison sont incluses dans les forfaits Delivery",
    es: "Las rutas de entrega vienen con los planes Delivery",
    "pt-BR": "As rotas de entrega vêm nos planos Delivery",
    de: "Lieferrouten gibt es in den Delivery-Tarifen",
    it: "I giri di consegna sono nei piani Delivery",
    zh: "配送路线包含在 Delivery 方案中",
    vi: "Lộ trình giao hàng có trong các gói Delivery",
    tl: "Kasama ang delivery routes sa mga Delivery plan",
    ar: "مسارات التوصيل متوفّرة في خطط Delivery",
    pl: "Trasy dostaw są w planach Delivery",
  },
  "Unlimited proof-of-delivery photos on every stop": {
    "fr-CA": "Photos de preuve de livraison illimitées à chaque arrêt",
    es: "Fotos de prueba de entrega ilimitadas en cada parada",
    "pt-BR": "Fotos de comprovação de entrega ilimitadas em cada parada",
    de: "Unbegrenzte Liefernachweis-Fotos an jedem Stopp",
    it: "Foto di prova di consegna illimitate a ogni fermata",
    zh: "每个站点均可无限拍摄送达凭证照片",
    vi: "Ảnh xác thực giao hàng không giới hạn ở mọi điểm dừng",
    tl: "Walang limitasyong proof-of-delivery na litrato sa bawat hinto",
    ar: "صور إثبات تسليم غير محدودة في كل محطة",
    pl: "Nieograniczone zdjęcia potwierdzenia dostawy na każdym przystanku",
  },
  "Everything in Delivery Lite": {
    "fr-CA": "Tout ce qu'offre Delivery Lite",
    es: "Todo lo de Delivery Lite",
    "pt-BR": "Tudo do Delivery Lite",
    de: "Alles aus Delivery Lite",
    it: "Tutto ciò che offre Delivery Lite",
    zh: "包含 Delivery Lite 全部功能",
    vi: "Mọi thứ trong Delivery Lite",
    tl: "Lahat ng nasa Delivery Lite",
    ar: "كل ما في Delivery Lite",
    pl: "Wszystko z planu Delivery Lite",
  },
};

for (const [source, byLocale] of Object.entries(SPLIT_ERA_BULLETS)) {
  for (const [code, value] of Object.entries(byLocale)) {
    const bucket = (FEATURE_COPY[code as LocaleCode] ??= {});
    bucket[source] ??= value;
  }
}

function localizedPriceLabel(priceCents: number, locale: LocaleCode): string {
  if (priceCents < 0) return CUSTOM_LABEL[locale];
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
    }).format(priceCents / 100);
  } catch {
    return priceLabel(priceCents);
  }
}

/**
 * Returns the plan with display copy translated into `locale`.
 * Fields an operator has edited away from the shipped default are left alone.
 */
export function localizePlan(plan: Plan, localeInput: string | undefined): Plan {
  const locale = asLocale(localeInput);
  const out: Plan = { ...plan, priceLabel: localizedPriceLabel(plan.priceCents, locale) };
  if (locale === "en") return out;

  const copy = PLAN_COPY[plan.id]?.[locale];
  const base = DEFAULTS[plan.id];
  if (!copy || !base) return out;

  if (copy.name && plan.name === base.name) out.name = copy.name;
  if (copy.period && plan.period === base.period) out.period = copy.period;
  if (copy.tagline && plan.tagline === base.tagline) out.tagline = copy.tagline;

  const bullets = FEATURE_COPY[locale];
  if (bullets) out.features = plan.features.map((f) => bullets[f] ?? f);

  return out;
}
