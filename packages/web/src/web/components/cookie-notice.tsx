import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Cookie, X } from "lucide-react";
import { useT } from "../lib/i18n";
import { amberFill } from "../lib/chrome";
import { siteScroller } from "../lib/site-scroll";

/**
 * Consent is versioned, so widening what we store later (an analytics cookie, say) can
 * re-prompt everyone who accepted the narrower version by bumping this.
 */
const KEY = "geocliks.cookie-consent.v1";

/** How close to the foot of the page the visitor has to be before the notice appears. */
const NEAR_BOTTOM_PX = 220;

/** localStorage throws in a partitioned iframe or with storage blocked — never break paint. */
function readAccepted(): boolean {
  try {
    return globalThis.localStorage?.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Whether the visitor has reached the foot of the page.
 *
 * Which element scrolls depends on the layout: normally the document, but the site gets its own
 * scroll container while the assistant panel holds a column beside it. Both are watched, and
 * whichever one actually overflows is the one measured. A page too short to scroll counts as
 * already at the bottom — otherwise the notice could never appear there at all.
 */
function useAtPageBottom(): boolean {
  const [atBottom, setAtBottom] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const measure = () => {
      const column = siteScroller();
      const doc = document.documentElement;
      const box =
        column && column.scrollHeight - column.clientHeight > 1
          ? { top: column.scrollTop, view: column.clientHeight, height: column.scrollHeight }
          : {
              top: globalThis.scrollY,
              view: globalThis.innerHeight,
              height: Math.max(doc.scrollHeight, document.body.scrollHeight),
            };
      const scrollable = box.height - box.view;
      // Nothing to scroll: the whole page is already on screen, so show the notice.
      if (scrollable <= 8) return setAtBottom(true);
      setAtBottom(box.top >= scrollable - NEAR_BOTTOM_PX);
    };

    // A route change can swap a long page for a short one, and lazy sections change the height
    // after paint — so re-measure on the next frame too, not just on scroll.
    measure();
    const frame = requestAnimationFrame(measure);

    const column = siteScroller();
    globalThis.addEventListener("scroll", measure, { passive: true });
    globalThis.addEventListener("resize", measure);
    column?.addEventListener("scroll", measure, { passive: true });
    // Images and fonts landing late shift the page height under a visitor who has not moved.
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      globalThis.removeEventListener("scroll", measure);
      globalThis.removeEventListener("resize", measure);
      column?.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [location]);

  return atBottom;
}

/**
 * Cookie notice for the public site.
 *
 * GeoCliks sets no advertising or analytics cookies — only the Better Auth session cookie plus
 * the language and theme preferences in localStorage, all of which are strictly necessary or
 * user-requested. So this is a notice with an acknowledgement, not a consent gate: there is no
 * tracking to withhold, and offering a "reject" that changes nothing would be dishonest. If a
 * third-party tracker is ever added, this has to become a real opt-in with a reject path and
 * the script must stay unloaded until then.
 *
 * It waits for the foot of the page and then slides in as a small card in the corner, rather
 * than a full-width bar over the hero: the notice has to be seen, but not at the cost of the
 * first thing a visitor came to look at.
 *
 * Hidden inside /app and /admin: those are signed-in tool surfaces, where the bar would cover
 * controls and the visitor has already passed through the public site to get there.
 */
export function CookieNotice() {
  const t = useT();
  const [location] = useLocation();
  // Read once on mount rather than during render, so SSR/hydration sees the same first frame.
  const [accepted, setAccepted] = useState(true);
  useEffect(() => setAccepted(readAccepted()), []);
  const atBottom = useAtPageBottom();

  const onToolSurface = location.startsWith("/app") || location.startsWith("/admin");
  if (accepted || onToolSurface || !atBottom) return null;

  const accept = () => {
    try {
      globalThis.localStorage?.setItem(KEY, "1");
    } catch {
      // Acceptance simply will not persist in a blocked-storage context. Dismiss anyway.
    }
    setAccepted(true);
  };

  return (
    // `--assistant-w` is the assistant panel's width while it is open, so the card sits beside
    // the panel rather than underneath it.
    <section
      aria-label={t("cookies.title")}
      className="rise fixed bottom-3 start-3 end-3 z-[60] sm:start-auto sm:end-[calc(var(--assistant-w,0px)+0.75rem)] sm:w-[356px]"
    >
      <div className="rounded-[12px] border border-line bg-ink-2/95 p-3.5 shadow-xl backdrop-blur-sm">
        <div className="flex items-start gap-2.5">
          <Cookie className="mt-0.5 size-4 shrink-0 text-amber" aria-hidden />
          <p className="min-w-0 flex-1 text-[11.5px] leading-relaxed text-fog">
            {t("cookies.body")}{" "}
            <Link to="/privacy" className="text-sky underline hover:no-underline">
              {t("cookies.policy")}
            </Link>
          </p>
          <button
            type="button"
            onClick={accept}
            aria-label={t("cookies.dismiss")}
            className="-me-1 -mt-1 rounded-[8px] p-1.5 text-fog transition-colors hover:bg-ink-3 hover:text-chalk"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={accept}
          className={`mono mt-3 w-full rounded-[8px] bg-amber px-4 py-2 text-[10.5px] font-bold uppercase tracking-widest text-on-amber transition-colors ${amberFill}`}
        >
          {t("cookies.accept")}
        </button>
      </div>
    </section>
  );
}
