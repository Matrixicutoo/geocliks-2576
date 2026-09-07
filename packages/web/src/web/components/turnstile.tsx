import { useEffect, useRef } from "react";
import { setCaptchaToken } from "../lib/auth";

/**
 * Cloudflare Turnstile widget for the two endpoints the server guards with the captcha plugin:
 * account creation and the password-reset mailer.
 *
 * The solved token is parked in `lib/auth.ts` rather than passed up through props, because the auth
 * client attaches it globally in its `onRequest` hook — per-call headers are unreliable on these
 * routes. Tokens are single-use, so the parent bumps `nonce` after every submit to force a fresh
 * widget.
 *
 * When `VITE_TURNSTILE_SITE_KEY` is unset the component renders nothing, which mirrors the server
 * skipping the captcha plugin when the secret is missing — the form still works either way.
 */

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme?: "auto" | "light" | "dark";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Loads the Turnstile script once per page and resolves when `window.turnstile` is usable. */
let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("turnstile script failed to load")));
    if (!existing) document.head.appendChild(script);
  });
  return scriptPromise;
}

export function Turnstile({ nonce = 0 }: { nonce?: number }) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
  const holder = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!siteKey) return;
    const element = holder.current;
    if (!element) return;

    let widgetId: string | null = null;
    let cancelled = false;
    setCaptchaToken("");

    loadTurnstile()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        element.innerHTML = "";
        widgetId = window.turnstile.render(element, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(""),
          "error-callback": () => setCaptchaToken(""),
        });
      })
      .catch(() => {
        // Network blocked or Cloudflare unreachable: leave the token empty. The server answers with
        // a clear captcha error rather than the page silently pretending the challenge passed.
        setCaptchaToken("");
      });

    return () => {
      cancelled = true;
      setCaptchaToken("");
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // widget already torn down with the DOM node
        }
      }
    };
    // `nonce` intentionally re-runs the effect to mint a fresh single-use token after a submit.
  }, [siteKey, nonce]);

  if (!siteKey) return null;
  return <div ref={holder} className="mt-1" />;
}
