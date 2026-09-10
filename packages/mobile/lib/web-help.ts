import Constants from "expo-constants";

/**
 * The website's Help Center.
 *
 * The 59 help articles live on geocliks.com only — they are long-form, translated per locale and
 * updated with the website, so shipping a copy inside the app binary would guarantee a stale one.
 * Every in-app help affordance therefore hands off to the browser through this single function.
 *
 * The base is read from the same `extra.apiUrl` the rest of the app talks to, so a staging build
 * opens staging's Help Center rather than production's.
 */
export function webHelpUrl(): string {
  return webUrl("/help");
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
