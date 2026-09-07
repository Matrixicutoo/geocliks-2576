import { Link } from "wouter";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Logo } from "./logo";
import { useT } from "../lib/i18n";
import { SUPPORT_EMAIL } from "../lib/support";
import { useSocialLinks } from "../queries/site";

/**
 * lucide-react ships no X (Twitter) brand mark, so the X glyph is drawn inline.
 * Every other platform uses the icon set already in the project — no invented
 * brand art.
 */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.53 3h3.06l-6.69 7.64L21.75 21h-6.16l-4.82-6.3L5.25 21H2.19l7.15-8.17L2.25 3h6.31l4.36 5.77L17.53 3Zm-1.07 16.13h1.7L7.62 4.78H5.8l10.66 14.35Z" />
    </svg>
  );
}

/**
 * Social icons are company-wide and operator-controlled from /admin/settings.
 * A blank URL hides its icon, which is how the operator "removes" a network.
 */
function SocialRow() {
  const socials = useSocialLinks();
  const links = [
    { href: socials.data?.facebookUrl, label: "Facebook", Icon: Facebook },
    { href: socials.data?.instagramUrl, label: "Instagram", Icon: Instagram },
    { href: socials.data?.linkedinUrl, label: "LinkedIn", Icon: Linkedin },
    { href: socials.data?.youtubeUrl, label: "YouTube", Icon: Youtube },
    { href: socials.data?.xUrl, label: "X", Icon: XIcon },
  ].filter((link) => Boolean(link.href));

  if (links.length === 0) return null;

  return (
    <div className="mt-5 flex items-center gap-2">
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className="grid size-9 place-items-center rounded-[12px] border border-line text-fog transition-colors hover:border-amber hover:text-amber"
        >
          <Icon className="size-4" />
        </a>
      ))}
    </div>
  );
}

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="bg-ink">
      <div className="mx-auto max-w-[1180px] px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-fog">
              {t("home.footer.desc")}
            </p>
            <SocialRow />
          </div>
          <div>
            <p className="label">{t("home.footer.product")}</p>
            <div className="mt-3 flex flex-col gap-2 text-[13px] text-fog">
              <a href="/#evidence" className="transition-colors hover:text-chalk">
                {t("home.footer.evidence")}
              </a>
              <a href="/#teamspace" className="transition-colors hover:text-chalk">
                {t("home.nav.teamspace")}
              </a>
              <a href="/#reports" className="transition-colors hover:text-chalk">
                {t("home.footer.exports")}
              </a>
              <a href="/#pricing" className="transition-colors hover:text-chalk">
                {t("home.nav.pricing")}
              </a>
            </div>
          </div>
          <div>
            <p className="label">{t("home.footer.company")}</p>
            <div className="mt-3 flex flex-col gap-2 text-[13px] text-fog">
              <a
                href="https://www.geocliks.com/"
                className="transition-colors hover:text-chalk"
                target="_blank"
                rel="noreferrer"
              >
                www.geocliks.com
              </a>
              <Link to="/terms" className="transition-colors hover:text-chalk">
                {t("home.footer.terms")}
              </Link>
              <Link to="/privacy" className="transition-colors hover:text-chalk">
                {t("home.footer.privacy")}
              </Link>
              <Link to="/get-app" className="transition-colors hover:text-chalk">
                {t("getapp.ctaPrimary")}
              </Link>
              <Link to="/verify" className="transition-colors hover:text-chalk">
                {t("verify.navLink")}
              </Link>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="transition-colors hover:text-chalk">
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono text-[10.5px] uppercase tracking-widest text-fog">
            {t("home.footer.sealed", { year: new Date().getFullYear() })}
          </p>
          <Link
            to="/get-app"
            className="mono text-[10.5px] uppercase tracking-widest text-fog transition-colors hover:text-amber"
          >
            {t("home.hero.ctaFieldApp")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
