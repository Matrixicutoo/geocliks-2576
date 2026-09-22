import Constants from "expo-constants";
import { activeLocale } from "./i18n";

/**
 * The website's Help Center, in the language the app is currently reading.
 *
 * The 59 help articles live on geocliks.com only — they are long-form, translated per locale and
 * updated with the website, so shipping a copy inside the app binary would guarantee a stale one.
 * Every in-app help affordance therefore hands off to the browser through this single function.
 *
 * The system browser keeps its own storage, so it has no idea which language the member picked in
 * here: someone reading the app in Tagalog would land on the English articles. The locale rides
 * along as `?lang=`, which the website takes as a device override. It is sent even for English —
 * an explicit choice of English should win over whatever the browser happens to remember.
 *
 * The base is read from the same `extra.apiUrl` the rest of the app talks to, so a staging build
 * opens staging's Help Center rather than production's.
 */
export function webHelpUrl(): string {
  return `${webUrl("/help")}?lang=${encodeURIComponent(activeLocale())}`;
}

/**
 * Any other page on the website, resolved against the same base as the Help Center.
 * Used by the drawer's Terms of service / Privacy & policy rows.
 */
export function webUrl(path: string): string {
  const configured =
    Constants.expoConfig?.extra?.apiUrl ??
    process.env.EXPO_PUBLIC_API_URL ??
    "https://geocliks.com";
  // `extra.apiUrl` is stored with a trailing slash, which would produce a `//help` URL.
  return `${String(configured).replace(/\/+$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
