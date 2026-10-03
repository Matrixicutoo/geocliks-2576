// Production entrypoint: the platform's release pipeline bundles this file as
// the production server, and pm2 runs it in the sandbox (see
// ecosystem.config.cjs). It is the template's `__server.ts` plus one thing:
// every HTML response gets that route's head tags written into it, which a
// crawler that does not run JavaScript can only get from the response itself.
// `__server.ts` is template-managed and stays untouched, so the whole change
// lives here.
import app from "./api";
import { injectSeoIntoHtml } from "./web/lib/seo-html";

const port = Number(process.env.PORT ?? 3000);
const distDir = `${import.meta.dirname}/../dist`;
const indexPath = `${distDir}/index.html`;

/**
 * The shell, read once and kept as a string.
 *
 * Every path that is not a file falls back to it, and each of those responses
 * gets that route's `<title>`/`<meta>` written into it before it goes out — the
 * client hook is too late for a crawler that reads the response and never runs
 * the JavaScript. Cached because the file cannot change while the process is
 * alive: a deploy replaces the process.
 */
let shell: string | null = null;

async function renderShell(pathname: string): Promise<Response> {
  if (shell === null) {
    const index = Bun.file(indexPath);
    if (!(await index.exists())) {
      return new Response("Build output not found. Run `bun run build` first.", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    shell = await index.text();
  }

  return new Response(injectSeoIntoHtml(shell, pathname), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) {
      return app.fetch(request);
    }

    // "/" is not looked up as a file: it resolves to the shell, and the shell
    // must go through `renderShell` so the home page's tags are written in like
    // every other route's.
    const filePath = getStaticFilePath(url.pathname);
    if (filePath) {
      const file = Bun.file(filePath);
      if (await file.exists()) {
        const cache = cacheControlFor(url.pathname);
        return new Response(file, cache ? { headers: { "Cache-Control": cache } } : undefined);
      }
    }

    if (isMissingFile(url.pathname)) {
      return new Response("Not found\n", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    return renderShell(url.pathname);
  },
});

/**
 * A request for a file we do not have, which must not get the shell.
 *
 * Machine readers ask for well-known files by name and parse what comes back.
 * Lighthouse's Agentic Browsing check fetches `/.well-known/ai-catalog.json`;
 * when that got the HTML shell with a 200 it reported "Malformed JSON in
 * manifest" — a failed audit for a file we never published. A real 404 makes
 * it "not applicable", which is the truth. Scoped to `/.well-known/` and to
 * data-file extensions so no page route (none has a dot) can land here.
 */
function isMissingFile(pathname: string): boolean {
  return pathname.startsWith("/.well-known/") || /\.(json|txt|xml|md)$/i.test(pathname);
}

console.log(`Web server listening on http://localhost:${server.port}`);

/** The file this path would serve, or null when it is the shell's job. */
function getStaticFilePath(pathname: string): string | null {
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+/, "").replaceAll("..", "");

  return cleanPath ? `${distDir}/${cleanPath}` : null;
}

/**
 * How long a browser may keep a static file.
 *
 * With no header of our own, Cloudflare stamped everything with four hours, so a
 * returning visitor re-downloaded the whole bundle every afternoon. Vite names
 * every file in `/assets` after a hash of its contents — a changed file is a new
 * URL — so those can be kept for a year and never revalidated. Fonts keep fixed
 * names but are only ever replaced by renaming, so they get the same. Images and
 * video keep their names when edited, so they get a week, revalidated in the
 * background. Everything else (robots.txt, the sitemap, llms.txt) is left to the
 * default, because a crawler should see an edit to those the same day.
 */
function cacheControlFor(pathname: string): string | null {
  if (pathname.startsWith("/assets/") || pathname.startsWith("/fonts/")) {
    return "public, max-age=31536000, immutable";
  }
  if (/^\/(images|videos)\//.test(pathname) || /\.(png|jpe?g|webp|avif|svg|ico|mp4|webm)$/i.test(pathname)) {
    return "public, max-age=604800, stale-while-revalidate=86400";
  }
  return null;
}
