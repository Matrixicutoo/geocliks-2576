import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { BlogShell } from "../components/blog-shell";
import { useSeo } from "../lib/seo";
import { PAGE_SEO } from "../lib/seo-routes";
import { posts, formatLabel } from "../lib/posts";

/**
 * Field Notes index — `/blog`.
 *
 * The answer log for GeoCliks: one question per post, answered outright in the
 * opening lines. Lives on the product domain rather than a `blog.` subdomain so
 * the posts build authority for geocliks.com instead of for a separate host.
 */
/**
 * The first two sentences of an answer, as the list preview.
 *
 * `split(". ")` drops the separator between sentences but leaves the final full
 * stop on the last one when the slice reaches the end of the text, so the period
 * is stripped and re-added rather than appended blindly — a two-sentence answer
 * ended up with ".." otherwise.
 */
function leadIn(answer: string): string {
  const text = answer.split(". ").slice(0, 2).join(". ").trimEnd();
  return `${text.replace(/[.\s]+$/, "")}.`;
}

export default function BlogIndex() {
  const seo = PAGE_SEO["/blog"];

  // No `jsonLd` here: the Blog block is baked into the response by
  // `lib/seo-html.ts`, so it is there for a crawler that does not run JS. See
  // `lib/blog-schema.ts`.
  useSeo({ title: seo.title, description: seo.description, path: "/blog" });

  return (
    <BlogShell>
      {/* Masthead */}
      <section className="relative overflow-hidden bg-navy">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 78% -10%, rgba(255,176,33,0.16) 0%, rgba(13,33,55,0) 62%)",
          }}
        />
        <div className="relative mx-auto max-w-[1180px] px-6 pt-20 pb-16">
          <div className="eyebrow rise text-amber" style={{ animationDelay: "0ms" }}>
            01 — Field Notes
          </div>
          <h1
            className="rise mt-6 max-w-[20ch] font-display text-[44px] font-extrabold leading-[1.04] tracking-[-0.03em] text-white sm:text-[64px]"
            style={{ animationDelay: "60ms" }}
          >
            Proof is a claim until someone can <span className="text-amber">check it.</span>
          </h1>
          <p
            className="rise mt-7 max-w-[62ch] text-[18px] leading-[1.7] text-white/65"
            style={{ animationDelay: "120ms" }}
          >
            Questions field crews, contractors and dispatchers actually type — answered outright in
            the first three lines, with real numbers and no hedging. Written by the team behind
            GeoCliks, where network-verified time, GPS and a SHA-256 seal ship on every plan
            including the free one.
          </p>

          <dl
            className="rise mt-14 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3"
            style={{ animationDelay: "180ms" }}
          >
            {[
              { k: "Verification tier floor", v: "$0", n: "included on Free, not upsold" },
              { k: "Location precision stamped", v: "±4 m", n: "coordinates + street address" },
              { k: "Integrity seal", v: "SHA-256", n: "plus HMAC signature, re-checkable" },
            ].map((s) => (
              <div key={s.k} className="bg-navy px-6 py-7">
                <dt className="eyebrow text-white/45">{s.k}</dt>
                <dd className="mt-3 font-mono text-[30px] font-semibold tracking-[-0.02em] text-amber">
                  {s.v}
                </dd>
                <dd className="mt-1.5 text-[14px] text-white/55">{s.n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Question list */}
      <section className="mx-auto max-w-[1180px] px-6 py-20">
        <div className="eyebrow text-amber-deep">02 — Answered questions</div>
        <h2 className="mt-4 max-w-[26ch] font-display text-[30px] font-extrabold tracking-[-0.02em] text-chalk sm:text-[36px]">
          {posts.length} questions, each answered in the opening lines.
        </h2>

        <ul className="mt-12 border-t border-line">
          {posts.map((p, i) => (
            <li key={p.slug} className="border-b border-line">
              <Link
                to={`/blog/${p.slug}`}
                className="group grid gap-6 py-9 md:grid-cols-[auto_1fr_auto] md:items-start"
              >
                <span className="font-mono text-[13px] font-semibold text-fog md:pt-1.5">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="block">
                  <span className="eyebrow text-amber-deep">{formatLabel[p.format]}</span>
                  <span className="mt-2.5 block font-display text-[24px] font-bold leading-[1.25] tracking-[-0.02em] text-chalk group-hover:text-amber-deep sm:text-[27px]">
                    {p.title}
                  </span>
                  <span className="mt-3 block max-w-[72ch] text-[16px] leading-[1.68] text-chalk/70">
                    {leadIn(p.answer)}
                  </span>
                  <span className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-fog">
                    <span>{p.publishedAt}</span>
                    <span>{p.readMinutes} min</span>
                    <span>{p.faq.length} follow-ups answered</span>
                  </span>
                </span>

                <ArrowRight
                  className="h-5 w-5 shrink-0 text-fog transition-transform group-hover:translate-x-1 group-hover:text-amber-deep md:mt-2"
                  strokeWidth={2}
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Method strip */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-16 md:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="eyebrow text-amber-deep">03 — How these are written</div>
            <h2 className="mt-4 max-w-[22ch] font-display text-[28px] font-extrabold tracking-[-0.02em] text-chalk">
              Topics come from search and forum demand, not from a content calendar.
            </h2>
          </div>
          <div className="measure text-[17px] leading-[1.72] text-chalk/80">
            <p>
              Each post names the question it targets and where the demand evidence came from —
              keyword volume, difficulty, or the thread where crews keep asking it. Claims about
              plans and mechanisms are the ones published on geocliks.com, not rounded marketing
              numbers, and no competitor is named or ranked here.
            </p>
            <Link
              to="/blog/method"
              className="mt-6 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-amber-deep"
            >
              Read the method
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </BlogShell>
  );
}
