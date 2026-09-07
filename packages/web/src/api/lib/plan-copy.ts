import { type LocaleCode, asLocale } from "./locales";
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

const DEFAULTS = Object.fromEntries(DEFAULT_PLANS.map((p) => [p.id, p]));

/**
 * English bullet → translated bullet, per locale, zipped from the shipped defaults.
 * Bullets are translated one by one so an operator adding or reordering a bullet in
 * /admin/plans still gets the known ones localized; unknown bullets stay as typed.
 */
const FEATURE_COPY: Partial<Record<LocaleCode, Record<string, string>>> = {};
for (const plan of DEFAULT_PLANS) {
  for (const [code, copy] of Object.entries(PLAN_COPY[plan.id] ?? {})) {
    const translated = (copy as PlanCopy).features;
    if (!translated || translated.length !== plan.features.length) continue;
    const bucket = (FEATURE_COPY[code as LocaleCode] ??= {});
    plan.features.forEach((english, i) => {
      const value = translated[i];
      if (value && !bucket[english]) bucket[english] = value;
    });
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
