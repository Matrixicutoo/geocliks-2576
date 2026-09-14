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
      if (await file.exists()) return new Response(file);
    }

    return renderShell(url.pathname);
  },
});

console.log(`Web server listening on http://localhost:${server.port}`);

/** The file this path would serve, or null when it is the shell's job. */
function getStaticFilePath(pathname: string): string | null {
  const cleanPath = decodeURIComponent(pathname).replace(/^\/+/, "").replaceAll("..", "");

  return cleanPath ? `${distDir}/${cleanPath}` : null;
}
