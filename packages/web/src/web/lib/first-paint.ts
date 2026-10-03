/**
 * A static copy of the home page's header and hero, written into the HTML response so a phone
 * paints the page's first screen from the document and the stylesheet alone — before the
 * JavaScript bundle has downloaded, let alone run.
 *
 * Why it exists: the hero still is the home page's LCP element, and React renders it. The image
 * itself was already preloaded and arrived in ~30 ms, but it could not be *painted* until the
 * entry bundle and its vendor chunks (~300 KB gzipped) had loaded and React had mounted — on
 * PageSpeed's throttled phone that was a 2.1 s "element render delay", and the reason First
 * Contentful Paint sat at 2.6 s.
 *
 * How the handoff works:
 *  - The shell sits *beside* `#root`, not inside it, so React's first commit cannot wipe it —
 *    including the empty commit the i18n provider makes while a non-English catalog loads.
 *  - `<FirstPaintHandoff>` (rendered by `app.tsx` once the providers are ready) removes it in a
 *    layout effect, i.e. in the same frame React's own header and hero are first painted, so the
 *    swap is not visible. The hero skips its rise-in animation when it takes over from the shell,
 *    otherwise the copy would blink out and fade back in.
 *  - It is only shown to browsers that run JavaScript (`has-js`), so a crawler that does not
 *    still reads the plain `#seo-fallback` and nothing else. The headline is not an <h1> here, so
 *    the raw HTML never carries two.
 *  - A visitor with a stored session never sees it: they are sent to their Teamspace, and the
 *    inline script below drops the shell at once rather than flashing the marketing hero at them.
 *
 * KEEP IN STEP with `SiteNav` (components/site-nav.tsx) and `Hero` (pages/index.tsx): the class
 * strings below are copied from what those render, which is what makes the swap seamless. If the
 * hero or the header changes, change this too — a drift shows up as a jump on page load, not as a
 * broken page.
 */
import type { LocaleCode } from "../../api/lib/locales";
import { translate } from "./catalogs";
import { localizedHref, splitLocalePath } from "./locale-url";

export const FIRST_PAINT_ID = "first-paint";

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const svg = (cls: string, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${body}</svg>`;

const CHEVRON = svg("lucide lucide-chevron-down size-3.5 transition-transform", `<path d="m6 9 6 6 6-6"></path>`);
const GLOBE = svg(
  "lucide lucide-globe size-4 shrink-0 text-white",
  `<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>`,
);
const MENU = svg("lucide lucide-menu size-5", `<path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path>`);
const SHIELD = svg(
  "lucide lucide-shield-check size-3.5",
  `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>`,
);
const ARROW = svg("lucide lucide-arrow-right size-4", `<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>`);
const WIFI_OFF = svg(
  "lucide lucide-wifi-off size-4 text-amber-ink",
  `<path d="M12 20h.01"></path><path d="M8.5 16.429a5 5 0 0 1 7 0"></path><path d="M5 12.859a10 10 0 0 1 5.17-2.69"></path><path d="M19 12.859a10 10 0 0 0-2.007-1.523"></path><path d="M2 8.82a15 15 0 0 1 4.177-2.643"></path><path d="M22 8.82a15 15 0 0 0-11.288-3.764"></path><path d="m2 2 20 20"></path>`,
);
const EARTH = svg(
  "lucide lucide-earth size-4 text-amber-ink",
  `<path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"></path><path d="M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"></path><path d="M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"></path><circle cx="12" cy="12" r="10"></circle>`,
);

const LOGO =
  `<span class="flex items-center gap-2.5"><span class="relative grid size-8 place-items-center"><svg viewBox="0 0 32 32" class="size-full" fill="none" aria-hidden="true"><g stroke="#FFB021" stroke-width="1.6" fill="none"><circle cx="16" cy="16" r="13"></circle><path d="M3.4 12h25.2M3.4 20h25.2"></path><ellipse cx="16" cy="16" rx="5.9" ry="13"></ellipse></g><path d="M16 24.6s-5.4-4.8-5.4-8.5a5.4 5.4 0 0 1 10.8 0c0 3.7-5.4 8.5-5.4 8.5Z" fill="#FFB021" stroke="#0B0E13" stroke-width="1.5"></path><circle cx="16" cy="15.7" r="2" fill="#0B0E13"></circle></svg></span>` +
  `<span class="flex flex-col leading-none"><span class="font-display text-[15px] font-extrabold tracking-tight text-chalk">GEO<span class="text-amber-ink">CLIKS</span></span><span class="mono mt-1.5 text-[8.5px] tracking-[0.28em] text-fog">FIELD EVIDENCE</span></span></span>`;

const NAV_LINK = "py-2 text-[14px] font-semibold text-white transition-colors hover:text-amber-ink";
const NAV_MENU = "flex items-center gap-1 py-2 text-[14px] font-semibold text-white transition-colors hover:text-amber-ink";

/**
 * The shell for the home page at `pathname` ("/" or a locale's home, "/de"), or "" for any other
 * route. Only the home page has a JavaScript-rendered LCP worth painting early.
 */
export function firstPaintShell(pathname: string, locale: LocaleCode): string {
  const { path, base } = splitLocalePath(pathname);
  if (path !== "/") return "";
  const t = (key: Parameters<typeof translate>[1]) => esc(translate(locale, key));
  // wouter prefixes every <Link> with the router base; plain anchors go through localizedHref.
  const link = (to: string) => esc(`${base}${to}`);
  const code = esc(locale.split("-")[0]);

  const header =
    `<header data-theme="dark" class="sticky top-0 z-40 border-b border-white/10 bg-[#0d2137] backdrop-blur">` +
    `<div class="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-5">` +
    `<a href="${esc(base || "/")}" class="shrink-0">${LOGO}</a>` +
    `<nav class="hidden items-center gap-5 lg:flex xl:gap-6">` +
    `<a href="${esc(localizedHref("/#top", locale))}" class="${NAV_LINK}">${t("home.nav.home")}</a>` +
    `<div class="relative"><span class="${NAV_MENU}">${t("home.nav.features")}${CHEVRON}</span></div>` +
    `<a href="${link("/proof-of-delivery")}" class="${NAV_LINK}">${t("home.nav.delivery")}</a>` +
    `<a href="${link("/pricing")}" class="${NAV_LINK}">${t("home.nav.pricing")}</a>` +
    `<a href="${link("/blog")}" class="${NAV_LINK}">${t("home.nav.blog")}</a>` +
    `<div class="relative"><span class="${NAV_MENU}">${t("home.nav.resources")}${CHEVRON}</span></div>` +
    `<div class="relative"><span class="${NAV_MENU}">${t("home.nav.support")}${CHEVRON}</span></div>` +
    `</nav>` +
    `<div class="flex shrink-0 items-center gap-2 sm:gap-3">` +
    `<span class="hidden h-6 w-px bg-white/20 lg:block"></span>` +
    `<div class="relative"><span class="flex items-center gap-1.5 px-1 py-2 text-[13px] font-semibold text-white">${GLOBE}<span class="truncate capitalize">${code}</span>${svg("lucide lucide-chevron-down size-3.5", `<path d="m6 9 6 6 6-6"></path>`)}</span></div>` +
    `<a href="${link("/sign-in")}" class="hidden whitespace-nowrap text-[14px] font-semibold text-white transition-colors hover:text-amber-ink sm:inline">${t("home.nav.login")}</a>` +
    `<a href="${link("/sign-up")}" class="whitespace-nowrap rounded-full bg-amber px-4 py-2 text-[13px] font-bold text-on-amber transition-colors hover:bg-amber-deep sm:px-5 sm:text-[14px]">${t("home.nav.signUp")}</a>` +
    `<span class="-me-1 flex size-9 items-center justify-center text-white lg:hidden">${MENU}</span>` +
    `</div></div></header>`;

  const hero =
    `<section class="hero-cinema relative overflow-hidden border-b border-line">` +
    `<picture class="contents"><source media="(max-width: 639px)" type="image/webp" srcset="/videos/hero-poster-portrait.webp"><source media="(min-aspect-ratio: 37/20)" srcset="/videos/hero-poster-wide.jpg">` +
    `<img alt="${t("home.hero.stillAlt")}" aria-hidden="true" class="hero-still pointer-events-none absolute inset-0 size-full object-cover" fetchpriority="high" src="/videos/hero-poster-16x9.jpg"></picture>` +
    `<div class="hero-veil pointer-events-none absolute inset-0"></div>` +
    `<div class="relative mx-auto flex max-w-[1180px] flex-col items-center justify-center px-5 py-20 text-center lg:min-h-[min(56.25vw,92vh)] lg:py-24"><div class="max-w-[820px]">` +
    `<p class="rounded-[6px] mono inline-flex items-center gap-2 border border-amber/40 bg-amber/10 px-2.5 py-1 text-[11.5px] uppercase tracking-[0.2em] text-amber-ink">${SHIELD} ${t("home.hero.eyebrow")}</p>` +
    `<div class="mt-6 font-display text-[46px] font-extrabold leading-[1.03] tracking-tight text-chalk sm:text-[64px]">${t("home.hero.title1")}<br><span class="text-amber-ink">${t("home.hero.title2")}</span></div>` +
    `<p class="mx-auto mt-6 max-w-[760px] text-[19px] leading-relaxed text-fog">${t("home.hero.body")}</p>` +
    `<div class="mt-9 flex flex-wrap items-center justify-center gap-3">` +
    `<a href="${link("/sign-up")}" class="rounded-[8px] mono inline-flex items-center gap-2 bg-amber px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-on-amber transition-colors hover:bg-amber-deep">${t("home.nav.startFree")} ${ARROW}</a>` +
    `<a href="${link("/get-app")}" class="mono inline-flex items-center gap-2 rounded-[8px] border border-line px-5 py-3 text-[12px] uppercase tracking-widest text-chalk transition-colors hover:border-amber/60">${t("home.hero.ctaFieldApp")}</a>` +
    `</div>` +
    `<div class="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[13px] text-fog">` +
    `<span class="flex items-center gap-1.5">${WIFI_OFF} ${t("home.hero.noSignal")}</span>` +
    `<span class="flex items-center gap-1.5">${EARTH} ${t("getapp.underButtons")}</span>` +
    `</div></div></div></section>`;

  return (
    // White below the hero, as the page under it is: the home page pins the light theme, but only
    // once React runs, and until then <html> still carries the dark default.
    `<div id="${FIRST_PAINT_ID}" class="min-h-screen" style="background:#ffffff">${header}${hero}</div>` +
    // Signed-in visitors are redirected to their Teamspace — drop the marketing shell for them
    // before it paints. Same storage key as `lib/auth.ts`.
    `<script>try{if(localStorage.getItem("runable.managed-auth.token"))document.getElementById("${FIRST_PAINT_ID}").remove()}catch(e){}</script>`
  );
}
