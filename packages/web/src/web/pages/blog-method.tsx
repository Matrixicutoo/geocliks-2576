import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { BlogShell } from "../components/blog-shell";
import { useSeo } from "../lib/seo";
import { PAGE_SEO } from "../lib/seo-routes";
import { posts } from "../lib/posts";

/**
 * `/blog/method` — the rules Field Notes is written under, published rather than
 * assumed. A reader who can see how a topic was chosen can judge whether the
 * post is an answer or an advertisement, which is the whole bet of the format.
 */
const RULES = [
  {
    n: "01",
    h: "The question comes first, and it comes from data",
    p: "Every post targets one question with evidence that people ask it — search volume and difficulty, or a forum thread where it recurs. That evidence is printed on the post itself, in the rail, so a reader can judge whether the topic was chosen or invented.",
  },
  {
    n: "02",
    h: "The answer sits in the first three lines",
    p: "Not a preamble, not a definition of the industry. The Answer block states the answer outright, in two to four sentences that still make sense if an answer engine quotes them with nothing else around them. Everything after it is support.",
  },
  {
    n: "03",
    h: "Numbers are the published ones",
    p: "Plan prices, capture limits, seat counts and export formats are the figures on geocliks.com, not rounded approximations. Where a range is cited for the wider market, it is the publicly listed range, and it is labelled as such.",
  },
  {
    n: "04",
    h: "No competitor is named or ranked",
    p: "Comparisons here are between pricing models and capability shapes — per-seat versus per-workspace, verification included versus verification gated — not between brands. A buyer's checklist that ranks vendors is a sales document; this is not one.",
  },
  {
    n: "05",
    h: "Mechanisms are described precisely",
    p: '"Secure" and "tamper-proof" mean nothing on their own, so the posts say what happens: the time is read from the network and compared to the device clock with the skew shown, GPS is written with an accuracy radius and a reverse-geocoded address, and the image bytes are hashed with SHA-256 and signed so any later edit breaks the seal.',
  },
  {
    n: "06",
    h: "Structured for machines as well as people",
    p: "Each post emits Article and FAQPage structured data, carries a canonical URL and a per-page description, and is listed in /llms.txt with its question and answer so a crawler reading plain text gets the same answer a reader does.",
  },
];

export default function BlogMethod() {
  const seo = PAGE_SEO["/blog/method"];
  useSeo({ title: seo.title, description: seo.description, path: "/blog/method" });

  return (
    <BlogShell>
      <header className="border-b border-line bg-navy">
        <div className="mx-auto max-w-[1180px] px-6 pt-14 pb-12">
          <Link
            to="/blog"
            className="eyebrow inline-flex items-center gap-2 text-white/50 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
            Field Notes
          </Link>
          <div className="eyebrow mt-9 text-amber">Method</div>
          <h1 className="mt-4 max-w-[24ch] font-display text-[36px] font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-[50px]">
            Rules this log is written <span className="text-amber">under.</span>
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-6 py-16">
        <ol className="border-t border-line">
          {RULES.map((r) => (
            <li
              key={r.n}
              className="grid gap-5 border-b border-line py-9 md:grid-cols-[auto_1fr_1.3fr]"
            >
              <span className="font-mono text-[13px] font-semibold text-amber-deep md:pt-1">
                {r.n}
              </span>
              <h2 className="max-w-[22ch] font-display text-[21px] font-bold leading-[1.3] tracking-[-0.01em] text-chalk">
                {r.h}
              </h2>
              <p className="text-[17px] leading-[1.7] text-chalk/80">{r.p}</p>
            </li>
          ))}
        </ol>

        <section className="mt-14">
          <div className="eyebrow text-fog">Currently published</div>
          <ul className="mt-5 space-y-3">
            {posts.map((p) => (
              <li key={p.slug} className="flex flex-wrap items-baseline gap-x-4">
                <Link
                  to={`/blog/${p.slug}`}
                  className="text-[17px] font-semibold text-chalk hover:text-amber-deep"
                >
                  {p.title}
                </Link>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-fog">
                  {p.publishedAt}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </BlogShell>
  );
}
