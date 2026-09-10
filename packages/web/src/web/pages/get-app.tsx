import { useEffect } from "react";
import { Link, useSearch } from "wouter";
import {
  Apple,
  ArrowRight,
  Camera,
  Check,
  Play,
  QrCode,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { Logo } from "../components/logo";
import { LanguageSelect } from "../components/language-select";
import { useT, type TKey } from "../lib/i18n";
import { useInviteInfo } from "../queries/team";
import { SUPPORT_EMAIL } from "../lib/support";

/**
 * Crew-facing app landing page — the QR destination printed on trucks, crew
 * cards, and closeout footers. Deliberately a single narrow phone column: the
 * reader is standing on a job site, not comparing plans. The marketing site at
 * `/` is the owner/PM page; this one has exactly one job — install the app (or
 * open the browser camera) and take a first locked photo.
 *
 * Pinned light like the marketing page; the bar and the price block are pinned
 * dark via their own `data-theme` scope.
 */

const STEPS: { n: string; title: TKey; body: TKey }[] = [
  { n: "1", title: "getapp.step1Title", body: "getapp.step1Body" },
  { n: "2", title: "getapp.step2Title", body: "getapp.step2Body" },
  { n: "3", title: "getapp.step3Title", body: "getapp.step3Body" },
  { n: "4", title: "getapp.step4Title", body: "getapp.step4Body" },
];

const ROLL: TKey[] = ["getapp.roll1", "getapp.roll2", "getapp.roll3"];
const LOCK: TKey[] = ["getapp.lock1", "getapp.lock2", "getapp.lock3"];
const CREW: TKey[] = ["getapp.crew1", "getapp.crew2", "getapp.crew3"];
const OFFICE: TKey[] = ["getapp.office1", "getapp.office2", "getapp.office3"];
const CHIPS: TKey[] = ["getapp.chipOffline", "getapp.chipUpload", "getapp.chipNoSignal"];

function Bar() {
  const t = useT();
  return (
    <header
      data-theme="dark"
      className="sticky top-0 z-20 border-b border-white/10 bg-[#0d2137]"
    >
      <div className="mx-auto flex max-w-[460px] items-center justify-between px-5 py-3">
        <Link to="/" aria-label="GeoCliks">
          <Logo className="h-7" />
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelect compact bare />
          <Link
            to="/"
            className="rounded-full border border-white/25 px-3 py-1.5 text-[12px] font-semibold text-white/80 transition-colors hover:border-amber/60 hover:text-amber"
          >
            {t("getapp.officeSite")}
          </Link>
        </div>
      </div>
    </header>
  );
}

/** The product, not a screenshot of the product: one locked capture. */
function StampedPhoto() {
  const t = useT();
  const stamp = new Date()
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
    <figure className="mt-6 overflow-hidden rounded-[12px] border border-line bg-ink-2 shadow-[0_18px_50px_-18px_rgba(16,24,40,0.35)]">
      <div className="relative">
        <img
          src="/images/samples/fiber-splice-closure.jpg"
          alt={t("home.hero.altFiber")}
          className="aspect-[4/3] w-full object-cover"
        />
        <span className="rounded-[6px] mono absolute left-2.5 top-2.5 border border-verified/60 bg-black/70 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-widest text-verified">
          {t("evidence.verified")}
        </span>
        <div className="absolute inset-x-0 bottom-0 flex items-stretch bg-black/75 backdrop-blur-[2px]">
          <div className="w-[3px] bg-amber" />
          <div className="px-3 py-2.5">
            <p className="mono text-[13px] font-semibold text-white">{stamp}</p>
            <p className="mono text-[10.5px] text-white/85">39.76610° N 105.02120° W</p>
            <p className="mono text-[10.5px] text-white/70">1420 Ridgeline Dr, Denver, CO 80211</p>
          </div>
        </div>
      </div>
      <figcaption className="flex items-center justify-between gap-2 border-t border-line px-3 py-2.5">
        <span className="mono text-[10.5px] tracking-widest text-amber">GC-8QF2-40XR-91KD</span>
        <span className="mono text-[10px] text-fog">SHA-256 LOCKED</span>
      </figcaption>
    </figure>
  );
}

/**
 * Shown when the QR or link carried `?invite=<code>`. An invite QR points at /join, but a crew
 * member who installs the app from a truck sticker can still arrive here with the code attached —
 * this keeps the invite visible instead of dropping it.
 */
function InviteBanner({ code }: { code: string }) {
  const t = useT();
  const invite = useInviteInfo(code);
  if (!invite.data) return null;
  return (
    <section
      data-theme="dark"
      className="rounded-[8px] mt-5 border border-amber/50 bg-[#0d2137] px-4 py-4 text-chalk"
    >
      <p className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-amber">
        <UserPlus className="size-3.5" /> {t("join.eyebrow")}
      </p>
      <p className="mt-2 font-display text-[19px] font-bold leading-snug tracking-tight text-white">
        {t("join.headline", {
          inviter: invite.data.inviterName,
          workspace: invite.data.workspace,
        })}
      </p>
      <p className="mono mt-2 text-[10.5px] uppercase tracking-[0.14em] text-fog">
        {t("join.metaRole")} · {invite.data.role} — {t("join.metaCode")} · {code.toUpperCase()}
      </p>
      <Link
        to={`/join/${code}`}
        className="mt-4 flex h-[46px] items-center justify-center gap-2 bg-amber text-[14px] font-bold text-ink transition-colors hover:bg-amber-deep"
      >
        {t("join.signInToAccept")} <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}

export default function GetApp() {
  const t = useT();
  const invite = new URLSearchParams(useSearch()).get("invite")?.trim() ?? "";

  useEffect(() => {
    document.title = t("getapp.title");
  }, [t]);

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.dataset.theme;
    root.dataset.theme = "light";
    return () => {
      if (prev) root.dataset.theme = prev;
      else delete root.dataset.theme;
    };
  }, []);

  return (
    <div data-theme="light" className="min-h-screen bg-ink text-chalk">
      <Bar />

      <main className="mx-auto max-w-[460px] px-5 pb-16">
        {/* 1 — hero, above the fold on a phone */}
        <section className="pt-7">
          <p className="rounded-[6px] mono inline-flex items-center gap-2 border border-amber/40 bg-amber/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber">
            <ShieldCheck className="size-3.5" /> {t("getapp.pill")}
          </p>
          <h1 className="mt-4 font-display text-[36px] font-extrabold leading-[1.05] tracking-tight">
            {t("getapp.headline")}
          </h1>
          <p className="mt-3 text-[16px] leading-relaxed text-fog">{t("getapp.subhead")}</p>

          {invite.length >= 4 && <InviteBanner code={invite} />}

          <StampedPhoto />

          <div className="mt-5 grid gap-2.5">
            <a
              href="#download"
              className="flex h-[52px] items-center justify-center gap-2 bg-amber text-[15px] font-bold text-ink transition-colors hover:bg-amber-deep"
            >
              {t("getapp.ctaPrimary")} <ArrowRight className="size-4" />
            </a>
            <Link
              to="/app"
              className="flex h-[52px] items-center justify-center gap-2 rounded-[12px] border border-line bg-ink-2 text-[15px] font-semibold text-chalk transition-colors hover:border-amber/60"
            >
              <Camera className="size-4 text-amber" /> {t("getapp.ctaSecondary")}
            </Link>
          </div>
          <p className="mono mt-3 text-center text-[10.5px] uppercase tracking-[0.14em] text-fog">
            {t("getapp.underButtons")}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {CHIPS.map((c) => (
              <span
                key={c}
                className="mono rounded-[12px] border border-line px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-fog"
              >
                {t(c)}
              </span>
            ))}
          </div>
        </section>

        {/* 2 — 30-second how it works */}
        <section className="mt-12">
          <h2 className="font-display text-[22px] font-bold tracking-tight">
            {t("getapp.stepsTitle")}
          </h2>
          <div className="mt-4 grid gap-2.5">
            {STEPS.map((s) => (
              <div key={s.n} className="grid grid-cols-[38px_1fr] gap-3 rounded-[12px] border border-line bg-ink-2 p-3.5">
                <span className="mono grid size-[38px] place-items-center bg-[#0d2137] text-[14px] font-bold text-white">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-[15px] font-bold leading-snug">{t(s.title)}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-fog">{t(s.body)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3 — why not the regular camera: the conversion section */}
        <section className="mt-12">
          <h2 className="font-display text-[22px] font-bold tracking-tight">
            {t("getapp.whyTitle")}
          </h2>
          <div className="mt-4 grid gap-2.5">
            <div className="rounded-[12px] border border-line bg-ink-2 p-4">
              <h3 className="mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-alert">
                {t("getapp.rollTitle")}
              </h3>
              <ul className="mt-2.5 grid gap-2">
                {ROLL.map((k) => (
                  <li key={k} className="flex gap-2 text-[13px] leading-relaxed text-fog">
                    <X className="mt-0.5 size-3.5 shrink-0 text-alert" /> {t(k)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[12px] border border-amber/45 bg-amber/8 p-4">
              <h3 className="mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-amber">
                {t("getapp.lockTitle")}
              </h3>
              <ul className="mt-2.5 grid gap-2">
                {LOCK.map((k) => (
                  <li key={k} className="flex gap-2 text-[13px] leading-relaxed text-chalk">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-verified" /> {t(k)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 4 — crew and office */}
        <section className="mt-12">
          <h2 className="font-display text-[22px] font-bold tracking-tight">
            {t("getapp.crewOfficeTitle")}
          </h2>
          <div className="mt-4 grid gap-2.5">
            {[
              { title: "getapp.crewTitle" as TKey, items: CREW },
              { title: "getapp.officeTitle" as TKey, items: OFFICE },
            ].map(({ title, items }) => (
              <div key={title} className="rounded-[12px] border border-line bg-ink-2 p-4">
                <h3 className="text-[15px] font-bold">{t(title)}</h3>
                <ul className="mt-2.5 grid gap-2">
                  {items.map((k) => (
                    <li key={k} className="flex gap-2 text-[13px] leading-relaxed text-fog">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-amber" /> {t(k)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 5 — pricing in one line + stores */}
        <section id="download" data-theme="dark" className="mt-12 bg-[#0d2137] p-5 text-white">
          <h2 className="font-display text-[22px] font-bold tracking-tight text-white">
            {t("getapp.storeTitle")}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-white/70">{t("getapp.storeBody")}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { icon: Apple, label: "getapp.storeIos" as TKey },
              { icon: Play, label: "getapp.storeAndroid" as TKey },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                aria-disabled="true"
                className="rounded-[8px] flex cursor-not-allowed items-center justify-center gap-2 border border-white/20 bg-black/40 px-3 py-2.5 text-[12px] font-semibold text-white/55"
              >
                <Icon className="size-4" /> {t(label)}
              </span>
            ))}
          </div>
          <p className="mono mt-3 text-[10px] uppercase tracking-[0.12em] text-amber">
            {t("getapp.comingSoon")}
          </p>
          <Link
            to="/#pricing"
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-amber hover:underline"
          >
            {t("home.nav.pricing")} <ArrowRight className="size-3.5" />
          </Link>
        </section>

        <p className="mt-5 text-center text-[12px] leading-relaxed text-fog">
          {t("getapp.webCaveat")}
        </p>

        <Link
          to="/verify"
          className="mono mt-5 flex items-center justify-center gap-2 rounded-[12px] border border-line px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-chalk transition-colors hover:border-amber/60 hover:text-amber"
        >
          <QrCode className="size-4 text-amber" /> {t("verify.navLink")}
        </Link>

        <footer className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-5 text-[12px] text-fog">
          <Link to="/privacy" className="hover:text-chalk">
            {t("home.footer.privacy")}
          </Link>
          <Link to="/terms" className="hover:text-chalk">
            {t("getapp.terms")}
          </Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-chalk">
            {SUPPORT_EMAIL}
          </a>
          <span className="w-full sm:w-auto">{t("getapp.footerCopy")}</span>
        </footer>
      </main>
    </div>
  );
}
