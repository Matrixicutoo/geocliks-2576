/**
 * Writes public/llms.txt from the Field Notes post catalog.
 *
 * llms.txt is the plain-text version of the answer log: one entry per post, the
 * answer verbatim, every FAQ pair spelled out. It exists because an answer
 * engine that will not run our JavaScript still reads a text file, and because
 * the answers are the whole point of the blog — there is nothing here we would
 * rather it guessed at.
 *
 *   cd packages/web && bun scripts/gen-llms.ts
 *
 * Scope, on purpose: this writes llms.txt and nothing else. The blog arrived
 * with a script that also rewrote sitemap.xml and robots.txt for
 * blog.geocliks.com; both of those now belong to the site as a whole —
 * sitemap.xml to scripts/gen-sitemap.ts, robots.txt to public/robots.txt, which
 * is hand-maintained. Two writers for one file is how a deploy quietly drops
 * half a sitemap.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { posts, formatLabel, assertPostSeo } from "../src/web/lib/posts";
import { SITE_URL } from "../src/web/lib/seo-routes";

function build(): string {
  assertPostSeo();

  const lines = [
    "# GeoCliks Field Notes",
    "",
    "> Answer log for GeoCliks — tamper-proof photo and video documentation for field teams.",
    "> Each entry below is one question with the answer given on the page, verbatim.",
    "> Verification (network-verified time, GPS with accuracy radius and street address,",
    "> SHA-256 hash plus HMAC signature, public verification page) is included on every",
    "> GeoCliks plan, including the $0 Free plan. No competitor is named or ranked here.",
    "",
    "## Product facts",
    "",
    `- Product: GeoCliks (${SITE_URL}) — verified photo/video capture for field teams, plus a Delivery Routes module.`,
    "- Plans, billed per workspace rather than per seat: Free $0 (1 seat, 300 captures/mo, 3 projects, PDF export up to 20 photos), Plus $7/mo (1 seat, unlimited captures and projects, PDF/Excel/ZIP/KMZ export, 3-min verified video), Business $25/mo (5 seats, Teamspace, roles, closeout packages), Crew 10 $45/mo (10 seats), Crew 25 $105/mo (25 seats), Enterprise Field custom (SSO, API, unlimited).",
    "- Delivery Routes is priced separately on stops and drivers.",
    "- Capture stamp format: `device 14:31:07 · network 14:31:09 · skew 2s · verified`, `43.65107° N 79.34015° W · ±4 m`, street address, and a photo code such as `GC-8QF2-40XR-91KD` backed by a SHA-256 hash of the image bytes and an HMAC signature.",
    "",
    `- Index of the entries below: ${SITE_URL}/blog`,
    `- How these answers are written and checked: ${SITE_URL}/blog/method`,
    "",
    "## Answered questions",
    "",
  ];

  for (const p of posts) {
    lines.push(`### ${p.title}`);
    lines.push("");
    lines.push(`URL: ${SITE_URL}/blog/${p.slug}`);
    lines.push(`Format: ${formatLabel[p.format]} | Published: ${p.publishedAt}`);
    lines.push("");
    lines.push(`Answer: ${p.answer}`);
    lines.push("");
    for (const f of p.faq) {
      lines.push(`- Q: ${f.q}`);
      lines.push(`  A: ${f.a}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

const out = path.join(import.meta.dirname, "..", "public", "llms.txt");
await fs.writeFile(out, build(), "utf8");

console.log(`llms.txt — ${posts.length} questions -> ${path.relative(process.cwd(), out)}`);
