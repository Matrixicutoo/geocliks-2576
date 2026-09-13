import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Cookie, X } from "lucide-react";
import { useT } from "../lib/i18n";
import { amberFill } from "../lib/chrome";

/**
 * Consent is versioned, so widening what we store later (an analytics cookie, say) can
 * re-prompt everyone who accepted the narrower version by bumping this.
 */
const KEY = "geocliks.cookie-consent.v1";

/** localStorage throws in a partitioned iframe or with storage blocked — never break paint. */
function readAccepted(): boolean {
  try {
    return globalThis.localStorage?.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Footer cookie notice for the public site.
 *
 * GeoCliks sets no advertising or analytics cookies — only the Better Auth session cookie plus
 * the language and theme preferences in localStorage, all of which are strictly necessary or
 * user-requested. So this is a notice with an acknowledgement, not a consent gate: there is no
 * tracking to withhold, and offering a "reject" that changes nothing would be dishonest. If a
 * third-party tracker is ever added, this has to become a real opt-in with a reject path and
 * the script must stay unloaded until then.
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

  const onToolSurface = location.startsWith("/app") || location.startsWith("/admin");
  if (accepted || onToolSurface) return null;

  const accept = () => {
    try {
      globalThis.localStorage?.setItem(KEY, "1");
    } catch {
      // Acceptance simply will not persist in a blocked-storage context. Dismiss anyway.
    }
    setAccepted(true);
  };

  return (
    // `--assistant-w` is the assistant panel's width while it is open, so this bar ends at the
    // panel's edge rather than running underneath it.
    <section
      aria-label={t("cookies.title")}
      className="fixed bottom-0 start-0 end-0 z-[60] border-t border-line bg-ink-2/95 backdrop-blur-sm sm:end-[var(--assistant-w,0px)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <Cookie className="size-5 shrink-0 text-amber" aria-hidden />
        <p className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-fog">
          {t("cookies.body")}{" "}
          <Link to="/privacy" className="text-sky underline hover:no-underline">
            {t("cookies.policy")}
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={accept}
            className={`mono rounded-[8px] bg-amber px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-on-amber transition-colors ${amberFill}`}
          >
            {t("cookies.accept")}
          </button>
          <button
            type="button"
            onClick={accept}
            aria-label={t("cookies.dismiss")}
            className="rounded-[8px] p-2 text-fog transition-colors hover:bg-ink-3 hover:text-chalk"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
