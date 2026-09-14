import type { Plugin } from "vite";

import { injectSeoIntoHtml } from "../../src/web/lib/seo-html";

/**
 * Gives the dev server the same per-route `<title>`/`<meta>` the production
 * server writes.
 *
 * Without it, `curl localhost:4200/help/verify` returns the shell's sitewide
 * defaults while the deployed site returns that page's copy — and the whole
 * point of baking the tags in is that they can be checked with a plain fetch.
 * Dev is where you check.
 *
 * Applies only to a request with a URL. `vite build` also runs this hook, once,
 * with no request: the emitted `dist/index.html` must keep the sitewide
 * defaults, because it is the shell every route is rendered from and
 * `src/server.ts` rewrites it per request.
 */
export default function seoHtmlPlugin(): Plugin {
  return {
    name: "seo-html",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const url = ctx.originalUrl ?? ctx.path;
        if (!ctx.server || !url) return html;
        return injectSeoIntoHtml(html, url.split(/[?#]/)[0] ?? "/");
      },
    },
  };
}
