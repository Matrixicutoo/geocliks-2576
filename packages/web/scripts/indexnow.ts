/**
 * Submits this site's URLs to IndexNow, which is how Bing, Yandex, Seznam and
 * Naver are told a page exists without waiting to be crawled. Google is not an
 * IndexNow participant — it gets the sitemap and Search Console instead, so
 * nothing here affects Google either way.
 *
 *   cd packages/web && bun scripts/indexnow.ts            # every public URL
 *   cd packages/web && bun scripts/indexnow.ts /about     # just these
 *   cd packages/web && bun scripts/indexnow.ts --dry-run
 *
 * Run it after a deploy, not before: IndexNow fetches each URL to confirm it
 * exists, and submitting a page that is still 404 on the live host wastes the
 * submission and teaches the engine to trust the feed less.
 *
 * The URL list is read from public/sitemap.xml rather than rebuilt here, so
 * this script and the sitemap can never disagree about what is public. Run
 * gen-sitemap.ts first if routes changed.
 *
 * The key is not a secret and not issued by anyone: the publisher invents it and
 * proves ownership by serving it back at the domain root. Ours is the file at
 * public/<key>.txt — the two must match exactly, and deleting that file breaks
 * every future submission.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { SITE_URL } from "../src/web/lib/seo-routes";

/** Must match the filename and contents of public/<key>.txt. */
const KEY = "c2831456f6f1d1ed904b0d5776aec1f1";

const HOST = new URL(SITE_URL).host;
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

/** IndexNow caps a batch at 10,000 URLs. We are nowhere near it; enforce anyway. */
const MAX_BATCH = 10_000;

const root = path.join(import.meta.dir, "..");

async function urlsFromSitemap(): Promise<string[]> {
  const xml = await fs.readFile(path.join(root, "public", "sitemap.xml"), "utf8");
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!.trim());
  if (locs.length === 0) throw new Error("No <loc> entries in public/sitemap.xml — run gen-sitemap.ts first.");
  return locs;
}

/** Verifies the key file is actually being served before submitting anything. */
async function assertKeyIsLive(): Promise<void> {
  const res = await fetch(KEY_LOCATION);
  if (!res.ok) {
    throw new Error(
      `Key file is not live: ${KEY_LOCATION} returned ${res.status}. ` +
        "Deploy public/<key>.txt before submitting, or IndexNow will reject the batch.",
    );
  }
  const body = (await res.text()).trim();
  if (body !== KEY) {
    throw new Error(`Key file at ${KEY_LOCATION} contains "${body}", expected "${KEY}".`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const explicit = args.filter((a) => !a.startsWith("--"));

  const urlList = explicit.length
    ? explicit.map((p) => (/^https?:\/\//.test(p) ? p : `${SITE_URL}${p.startsWith("/") ? p : `/${p}`}`))
    : await urlsFromSitemap();

  if (urlList.length > MAX_BATCH) {
    throw new Error(`${urlList.length} URLs exceeds the ${MAX_BATCH}-URL batch limit.`);
  }

  console.log(`IndexNow — ${urlList.length} URL(s), host ${HOST}`);
  if (dryRun) {
    for (const u of urlList) console.log(`  ${u}`);
    console.log("--dry-run: nothing submitted.");
    return;
  }

  await assertKeyIsLive();

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });

  // 200 accepted, 202 accepted but key validation pending. Both are success.
  if (res.status === 200 || res.status === 202) {
    console.log(`Submitted ${urlList.length} URL(s) — HTTP ${res.status}.`);
    return;
  }

  const detail = await res.text().catch(() => "");
  const hint: Record<number, string> = {
    400: "Bad request — usually a malformed key or a URL that is not on this host.",
    403: "Key not valid: the file at keyLocation does not match the key sent.",
    422: "A URL does not belong to this host, or the key does not match the host.",
    429: "Too many requests. Wait and resubmit; do not loop.",
  };
  throw new Error(`IndexNow rejected the batch — HTTP ${res.status}. ${hint[res.status] ?? ""} ${detail}`.trim());
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
