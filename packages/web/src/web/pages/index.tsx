import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "motion/react";
import {
  ShieldCheck,
  MapPin,
  Users,
  FileStack,
  WifiOff,
  Fingerprint,
  Clock,
  ArrowRight,
  Check,
  Globe2,
  Camera,
  GitCompareArrows,
  Layers,
  ChevronDown,
  Menu as MenuIcon,
  X as CloseIcon,
} from "lucide-react";
import { Logo } from "../components/logo";
import { LanguageSelect } from "../components/language-select";
import { usePlans } from "../queries/billing";
import { authClient } from "../lib/auth";
import { type TKey, useLocale, useT } from "../lib/i18n";
import { cn } from "../lib/utils";
import { SUPPORT_EMAIL } from "../lib/support";
import { SiteFooter } from "../components/site-footer";

const INDUSTRIES: TKey[] = [
  "industry.construction",
  "industry.fiber",
  "industry.telecom",
  "industry.hvac",
  "industry.property",
  "industry.cleaning",
  "industry.security",
  "industry.delivery",
  "industry.retail",
  "industry.landscaping",
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const riseIn = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const } },
};

type MenuItem = { label: TKey; href: string; external?: boolean };

/**
 * Marketing-header dropdown. Opens on click and on hover (pointer devices),
 * closes on outside click or Escape. Rendered inside the always-dark header,
 * so it inherits the dark tokens from the header's `data-theme` scope.
 */
function NavMenu({ label, items }: { label: TKey; items: MenuItem[] }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrap}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1 py-2 text-[14px] font-semibold text-white transition-colors hover:text-amber"
      >
        {t(label)}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute start-0 top-full z-50 w-[248px] rounded-[12px] border border-line bg-ink-2 py-1 shadow-2xl">
          {items.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-[8px] block px-4 py-2.5 text-[13px] text-fog transition-colors hover:bg-ink-3 hover:text-chalk"
                onClick={() => setOpen(false)}
              >
                {t(item.label)}
              </a>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="rounded-[8px] block px-4 py-2.5 text-[13px] text-fog transition-colors hover:bg-ink-3 hover:text-chalk"
                onClick={() => setOpen(false)}
              >
                {t(item.label)}
              </a>
            ),
          )}
        </div>
      )}
    </div>
  );
}

const FEATURE_ITEMS: MenuItem[] = [
  { label: "home.nav.tamper", href: "#evidence" },
  { label: "home.nav.teamspace", href: "#teamspace" },
  { label: "home.nav.reports", href: "#reports" },
  { label: "home.nav.offline", href: "#field" },
];

const RESOURCE_ITEMS: MenuItem[] = [
  { label: "getapp.ctaPrimary", href: "/get-app" },
  { label: "verify.navLink", href: "/verify" },
  { label: "home.nav.website", href: "https://www.geocliks.com/", external: true },
  { label: "home.nav.help", href: "https://help.geocliks.com/", external: true },
  { label: "home.footer.terms", href: "/terms" },
  { label: "home.footer.privacy", href: "/privacy" },
];

const SUPPORT_ITEMS: MenuItem[] = [
  { label: "home.nav.emailSupport", href: `mailto:${SUPPORT_EMAIL}` },
  { label: "home.nav.help", href: "https://help.geocliks.com/", external: true },
  {
    label: "home.nav.contactSales",
    href: `mailto:${SUPPORT_EMAIL}?subject=GeoCliks%20Enterprise`,
  },
];

/**
 * Marketing header. The page body follows the light theme, but the header is
 * pinned dark on purpose — `data-theme="dark"` re-scopes every color token for
 * its subtree, so children (dropdowns, language picker) stay dark too.
 */
const mobileLink =
  "block border-b border-white/5 py-3 text-[15px] font-semibold text-white transition-colors hover:text-amber";

/** One collapsible group inside the mobile menu. */
function MobileGroup({
  label,
  items,
  onNavigate,
}: {
  label: TKey;
  items: MenuItem[];
  onNavigate: () => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-3 text-[15px] font-semibold text-white transition-colors hover:text-amber"
      >
        {t(label)}
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="pb-2 ps-3">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              onClick={onNavigate}
              className="block py-2 text-[14px] text-white/70 transition-colors hover:text-amber"
            >
              {t(item.label)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Nav() {
  const { data: session } = authClient.useSession();
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const close = () => setMobileOpen(false);
  return (
    <header
      data-theme="dark"
      className="sticky top-0 z-40 border-b border-white/10 bg-[#0d2137] backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-5">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <a
            href="#top"
            className="py-2 text-[14px] font-semibold text-white transition-colors hover:text-amber"
          >
            {t("home.nav.home")}
          </a>
          <NavMenu label="home.nav.features" items={FEATURE_ITEMS} />
          <a
            href="#pricing"
            className="py-2 text-[14px] font-semibold text-white transition-colors hover:text-amber"
          >
            {t("home.nav.pricing")}
          </a>
          <NavMenu label="home.nav.resources" items={RESOURCE_ITEMS} />
          <NavMenu label="home.nav.support" items={SUPPORT_ITEMS} />
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden h-6 w-px bg-white/20 lg:block" />
          <LanguageSelect compact bare />
          <Link
            to={session ? "/app" : "/sign-in"}
            className="hidden whitespace-nowrap text-[14px] font-semibold text-white transition-colors hover:text-amber sm:inline"
          >
            {session ? t("home.nav.teamspace") : t("home.nav.login")}
          </Link>
          <Link
            to="/sign-up"
            className="whitespace-nowrap rounded-full bg-amber px-4 py-2 text-[13px] font-bold text-ink transition-colors hover:bg-amber-deep sm:px-5 sm:text-[14px]"
          >
            {t("home.nav.signUp")}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? t("home.nav.closeMenu") : t("home.nav.menu")}
            className="-me-1 flex size-9 items-center justify-center text-white transition-colors hover:text-amber lg:hidden"
          >
            {mobileOpen ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 lg:hidden">
          <nav className="mx-auto max-h-[70vh] max-w-[1180px] overflow-y-auto px-4 pb-5 pt-2">
            <a href="#top" onClick={close} className={mobileLink}>
              {t("home.nav.home")}
            </a>
            <MobileGroup label="home.nav.features" items={FEATURE_ITEMS} onNavigate={close} />
            <a href="#pricing" onClick={close} className={mobileLink}>
              {t("home.nav.pricing")}
            </a>
            <MobileGroup label="home.nav.resources" items={RESOURCE_ITEMS} onNavigate={close} />
            <MobileGroup label="home.nav.support" items={SUPPORT_ITEMS} onNavigate={close} />
            <Link
              to={session ? "/app" : "/sign-in"}
              onClick={close}
              className={cn(mobileLink, "sm:hidden")}
            >
              {session ? t("home.nav.teamspace") : t("home.nav.login")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const t = useT();
  const now = new Date();
  const stamp = now
    .toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(",", "");

  return (
    <section className="hero-band relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 blueprint opacity-60" />
      <div className="absolute -left-40 top-[-10%] size-[520px] rounded-full bg-amber/8 blur-[120px]" />
      <div className="absolute right-[-10%] bottom-[-30%] size-[460px] rounded-full bg-sky/6 blur-[130px]" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto grid max-w-[1180px] items-center gap-y-8 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-x-14 lg:py-28"
      >
        <div className="lg:col-start-1 lg:row-start-1">
          <motion.p
            variants={riseIn}
            className="rounded-[6px] mono inline-flex items-center gap-2 border border-amber/40 bg-amber/10 px-2.5 py-1 text-[10.5px] uppercase tracking-[0.2em] text-amber"
          >
            <ShieldCheck className="size-3.5" /> {t("home.hero.eyebrow")}
          </motion.p>

          <motion.h1
            variants={riseIn}
            className="mt-6 font-display text-[42px] font-extrabold leading-[1.03] tracking-tight text-chalk sm:text-[58px]"
          >
            {t("home.hero.title1")}
            <br />
            <span className="text-amber">{t("home.hero.title2")}</span>
          </motion.h1>

          <motion.p variants={riseIn} className="mt-6 max-w-xl text-[17px] leading-relaxed text-fog">
            {t("home.hero.body")}
          </motion.p>
        </div>

        {/* Printed-photo evidence stack */}
        <motion.div
          variants={riseIn}
          className="relative mx-auto w-full max-w-[440px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center"
        >
          <div className="absolute -left-6 top-8 hidden w-[78%] rotate-[-6deg] rounded-[12px] border border-line bg-ink-2 p-2 shadow-2xl sm:block">
            <img
              src="/images/samples/hvac-rooftop.jpg"
              alt={t("home.hero.altRooftop")}
              className="aspect-[4/3] w-full object-cover opacity-70"
            />
          </div>
          <div className="absolute -right-4 -top-4 hidden w-[62%] rotate-[7deg] rounded-[12px] border border-line bg-ink-2 p-2 shadow-2xl sm:block">
            <img
              src="/images/samples/roof-damage.jpg"
              alt={t("home.hero.altRoof")}
              className="aspect-[4/3] w-full object-cover opacity-70"
            />
          </div>

          <div className="relative rounded-[12px] border border-line bg-ink-2 p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
            <div className="relative overflow-hidden">
              <img
                src="/images/samples/fiber-splice-closure.jpg"
                alt={t("home.hero.altFiber")}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-stretch bg-black/72 backdrop-blur-[2px]">
                <div className="w-[3px] bg-amber" />
                <div className="px-3 py-2">
                  <p className="mono text-[12px] font-semibold text-white">{stamp}</p>
                  <p className="mono text-[10px] text-white/85">39.76610° N 105.02120° W</p>
                  <p className="mono text-[10px] text-white/70">
                    1420 Ridgeline Dr, Denver, CO 80211
                  </p>
                </div>
              </div>
              <span className="rounded-[6px] mono absolute left-2.5 top-2.5 border border-verified/50 bg-black/70 px-1.5 py-0.5 text-[9.5px] uppercase tracking-widest text-verified">
                {t("evidence.verified")}
              </span>
            </div>
            <div className="flex items-center justify-between px-1 pt-2.5 pb-1">
              <span className="mono text-[10.5px] tracking-widest text-amber">
                TM-8QF2-40XR-91KD
              </span>
              <span className="mono text-[10px] text-fog">SHA-256 LOCKED</span>
            </div>
          </div>
        </motion.div>
        <div className="lg:col-start-1 lg:row-start-2">
          <motion.div variants={riseIn} className="flex flex-wrap items-center gap-3">
            <Link
              to="/sign-up"
              className="rounded-[8px] mono inline-flex items-center gap-2 bg-amber px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep"
            >
              {t("home.nav.startFree")} <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/get-app"
              className="mono inline-flex items-center gap-2 rounded-[8px] border border-line px-5 py-3 text-[12px] uppercase tracking-widest text-chalk transition-colors hover:border-amber/60"
            >
              {t("home.hero.ctaFieldApp")}
            </Link>
          </motion.div>

          <motion.div
            variants={riseIn}
            className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 text-[12px] text-fog"
          >
            <span className="flex items-center gap-1.5">
              <WifiOff className="size-3.5 text-amber" /> {t("home.hero.noSignal")}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe2 className="size-3.5 text-amber" /> {t("getapp.underButtons")}
            </span>
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
}

function Evidence() {
  const t = useT();
  const rows: { icon: typeof Clock; title: TKey; body: TKey; mono: string }[] = [
    {
      icon: Clock,
      title: "home.evidence.r1.title",
      body: "home.evidence.r1.body",
      mono: "device 14:31:07 · network 14:31:09 · skew 2s · verified",
    },
    {
      icon: MapPin,
      title: "home.evidence.r2.title",
      body: "home.evidence.r2.body",
      mono: "39.76610° N  105.02120° W · ±4 m",
    },
    {
      icon: Fingerprint,
      title: "home.evidence.r3.title",
      body: "home.evidence.r3.body",
      mono: "TM-8QF2-40XR-91KD · integrity: intact",
    },
  ];

  return (
    <section id="evidence" className="border-b border-line">
      <div className="mx-auto max-w-[1180px] px-5 py-20">
        <p className="label">{t("home.evidence.label")}</p>
        <h2 className="mt-3 max-w-2xl font-display text-[32px] font-bold leading-tight tracking-tight text-chalk sm:text-[40px]">
          {t("home.evidence.h2")}
        </h2>
        <p className="mt-4 max-w-xl text-[16px] text-fog">
          {t("home.evidence.body")}
        </p>

        <div className="mt-12 grid gap-px bg-line md:grid-cols-3">
          {rows.map((row) => (
            <div key={row.title} className="bg-ink p-6">
              <row.icon className="size-5 text-amber" />
              <h3 className="mt-4 font-display text-[17px] font-semibold text-chalk">
                {t(row.title)}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-fog">{t(row.body)}</p>
              <p className="mono mt-4 border-l-2 border-amber/50 bg-ink-2 px-2.5 py-2 text-[10.5px] text-fog">
                {row.mono}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Teamspace() {
  const t = useT();
  return (
    <section id="teamspace" className="border-b border-line bg-ink-2/40">
      <div className="mx-auto grid max-w-[1180px] items-center gap-14 px-5 py-20 lg:grid-cols-2">
        <div>
          <p className="label">{t("home.team.label")}</p>
          <h2 className="mt-3 font-display text-[32px] font-bold leading-tight tracking-tight text-chalk sm:text-[40px]">
            {t("home.team.h2")}
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-fog">
            {t("home.team.body")}
          </p>
          <ul className="mt-7 space-y-3">
            {[
              { icon: Users, text: "home.team.b1" as TKey },
              { icon: Layers, text: "home.team.b2" as TKey },
              { icon: Globe2, text: "home.team.b3" as TKey },
              { icon: Camera, text: "home.team.b4" as TKey },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-[14px] text-chalk">
                <item.icon className="size-4 shrink-0 text-amber" />
                {t(item.text)}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-3">
            {[
              "fiber-technician.jpg",
              "construction-framing.jpg",
              "property-walkthrough.jpg",
              "hvac-install.jpg",
            ].map((file, i) => (
              <div
                key={file}
                className="rounded-[12px] border border-line bg-ink-2 p-1.5"
                style={{ transform: `translateY(${i % 2 === 0 ? 0 : 22}px)` }}
              >
                <div className="relative overflow-hidden">
                  <img src={`/images/samples/${file}`} alt="" className="aspect-square w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex items-stretch bg-black/70">
                    <div className="w-[2px] bg-amber" />
                    <p className="mono px-1.5 py-1 text-[8.5px] text-white/90">
                      TM-{(1000 + i * 373).toString(16).toUpperCase()}-VERIFIED
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Reports() {
  const t = useT();
  const formats: { name: string; note: TKey }[] = [
    { name: "PDF", note: "home.reports.f1" },
    { name: "Excel", note: "home.reports.f2" },
    { name: "ZIP", note: "home.reports.f3" },
    { name: "KMZ", note: "home.reports.f4" },
  ];

  return (
    <section id="reports" className="border-b border-line">
      <div className="mx-auto max-w-[1180px] px-5 py-20">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="label">{t("home.reports.label")}</p>
            <h2 className="mt-3 font-display text-[32px] font-bold leading-tight tracking-tight text-chalk sm:text-[40px]">
              {t("home.reports.headline")}
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-fog">
              {t("home.reports.body")}
            </p>
            <div className="mt-7 grid grid-cols-2 gap-px bg-line">
              {formats.map((f) => (
                <div key={f.name} className="bg-ink px-4 py-3.5">
                  <p className="mono text-[13px] font-bold tracking-widest text-amber">{f.name}</p>
                  <p className="mt-1 text-[12px] text-fog">{t(f.note)}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 flex items-center gap-2 text-[13px] text-fog">
              <GitCompareArrows className="size-4 text-amber" />
              {t("home.reports.compare")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { file: "roof-damage.jpg", tag: "BEFORE", label: "tag.before" as TKey },
              { file: "roof-replaced.jpg", tag: "AFTER", label: "tag.after" as TKey },
            ].map(({ file, tag, label }) => (
              <div key={file} className="rounded-[12px] border border-line bg-ink-2 p-2">
                <div className="relative overflow-hidden">
                  <img
                    src={`/images/samples/${file}`}
                    alt={t(label)}
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <span className="rounded-[6px] mono absolute left-2 top-2 bg-amber px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-widest text-ink">
                    {t(label)}
                  </span>
                </div>
                <p className="mono px-1 pt-2 text-[10px] text-fog">
                  {tag === "BEFORE" ? "2026-08-12 09:14:22" : "2026-08-26 16:02:41"}
                </p>
              </div>
            ))}
            <div className="rounded-[12px] border border-line bg-ink-2 p-4 sm:col-span-2">
              <p className="label">{t("home.reports.manifest")}</p>
              <div className="mono mt-2.5 space-y-1 text-[11px] text-fog">
                <p>Maple Grove Roof Replacement — 42 photos</p>
                <p>Verified 42 / 42 · Located 42 / 42</p>
                <p>Generated by GeoCliks · sealed SHA-256</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field() {
  const t = useT();
  return (
    <section id="field" className="border-b border-line bg-ink-2/40">
      <div className="mx-auto max-w-[1180px] px-5 py-20">
        <p className="label">{t("home.field.label")}</p>
        <div className="mt-3 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <h2 className="font-display text-[32px] font-bold leading-tight tracking-tight text-chalk sm:text-[40px]">
            {t("home.field.h2")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: WifiOff,
                title: "home.field.i1.title" as TKey,
                body: "home.field.i1.body" as TKey,
              },
              {
                icon: Camera,
                title: "home.field.i2.title" as TKey,
                body: "home.field.i2.body" as TKey,
              },
              {
                icon: FileStack,
                title: "home.field.i3.title" as TKey,
                body: "home.field.i3.body" as TKey,
              },
              {
                icon: ShieldCheck,
                title: "home.field.i4.title" as TKey,
                body: "home.field.i4.body" as TKey,
              },
            ].map((item) => (
              <div key={item.title}>
                <item.icon className="size-4.5 text-amber" />
                <h3 className="mt-3 font-display text-[15px] font-semibold text-chalk">
                  {t(item.title)}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-fog">{t(item.body)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-line pt-8">
          <p className="label">{t("home.field.industries")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => (
              <span
                key={industry}
                className="mono rounded-[8px] border border-line bg-ink px-2.5 py-1.5 text-[11px] uppercase tracking-widest text-fog"
              >
                {t(industry)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const t = useT();
  const { locale } = useLocale();
  const plans = usePlans(locale);

  return (
    <section id="pricing" className="border-b border-line">
      <div className="mx-auto max-w-[1180px] px-5 py-20">
        <p className="label">{t("home.pricing.label")}</p>
        <h2 className="mt-3 font-display text-[32px] font-bold leading-tight tracking-tight text-chalk sm:text-[40px]">
          {t("home.pricing.h2")}
        </h2>

        {plans.isLoading ? (
          <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 md:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-80 animate-pulse bg-ink-2" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-px bg-line sm:grid-cols-2 md:grid-cols-3">
            {plans.data?.map((plan) => (
              <div
                key={plan.id}
                className={
                  plan.id === "business" ? "relative bg-ink-2 p-6" : "relative bg-ink p-6"
                }
              >
                {plan.id === "business" && (
                  <span className="rounded-[6px] mono absolute right-0 top-0 bg-amber px-2 py-1 text-[9.5px] font-bold uppercase tracking-widest text-ink">
                    {t("home.pricing.popular")}
                  </span>
                )}
                <p className="mono text-[11px] uppercase tracking-[0.2em] text-amber">{plan.name}</p>
                <p className="mt-3 font-display text-3xl font-bold text-chalk">{plan.priceLabel}</p>
                <p className="mono mt-1 text-[10.5px] uppercase tracking-widest text-fog">
                  {plan.priceCents > 0 ? plan.period : " "}
                </p>
                <p className="mt-2 min-h-10 text-[13px] text-fog">{plan.tagline}</p>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-[13px] text-chalk">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-verified" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {/* Enterprise has no self-serve checkout — its CTA opens a mail
                    draft to support instead of the sign-in flow. */}
                {plan.id === "enterprise" ? (
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("GeoCliks Enterprise plan")}`}
                    className="mono mt-6 block rounded-[8px] border border-line px-3 py-2.5 text-center text-[11px] uppercase tracking-widest text-chalk transition-colors hover:border-amber/60"
                  >
                    {t("home.pricing.talk")}
                  </a>
                ) : (
                  <Link
                    to="/sign-up"
                    className={
                      plan.id === "business"
                        ? "mono mt-6 block bg-amber px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-widest text-ink transition-colors hover:bg-amber-deep"
                        : "mono mt-6 block rounded-[8px] border border-line px-3 py-2.5 text-center text-[11px] uppercase tracking-widest text-chalk transition-colors hover:border-amber/60"
                    }
                  >
                    {t("home.pricing.choose")}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Index() {
  // The marketing site is always light, whatever a signed-in member picked for
  // the app shell on this device. Restore their choice when they leave `/`.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    root.dataset.theme = "light";
    return () => {
      if (previous) root.dataset.theme = previous;
      else delete root.dataset.theme;
    };
  }, []);

  return (
    <div data-theme="light" id="top" className="min-h-screen bg-ink text-chalk">
      <Nav />
      <Hero />
      <Evidence />
      <Teamspace />
      <Reports />
      <Field />
      <Pricing />
      <SiteFooter />
    </div>
  );
}
