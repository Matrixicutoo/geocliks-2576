import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { BlogShell } from "../components/blog-shell";
import { AnswerBlock } from "../components/answer-block";
import { BlockList } from "../components/blocks";
import { useSeo } from "../lib/seo";
import { SITE_URL, seoForPath } from "../lib/seo-routes";
import { getPost, posts, formatLabel } from "../lib/posts";

/**
 * A Field Notes post — `/blog/:slug`.
 *
 * Head copy comes from `seoForPath`, the same resolver the Vite/Bun HTML
 * injection uses, so the tab title and the title a non-rendering crawler reads
 * in the response body cannot disagree. The structured data is built here
 * instead, from the post: Article plus FAQPage, which is what an answer engine
 * reads to decide the page answers a question rather than discusses one.
 */
function NotFound() {
  // noindex and no canonical: a typo'd slug is not a page, and pointing its
  // canonical at /blog would invite the index to treat every bad URL as a copy
  // of the real one.
  useSeo({ title: "Not found — GeoCliks Field Notes", noindex: true });
  return (
    <BlogShell>
      <div className="mx-auto max-w-[1180px] px-6 py-28">
        <div className="eyebrow text-amber-deep">404</div>
        <h1 className="mt-4 font-display text-[34px] font-extrabold tracking-[-0.02em] text-chalk">
          No post at that address.
        </h1>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-amber-deep"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
          All questions
        </Link>
      </div>
    </BlogShell>
  );
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPost(slug ?? "");

  if (!post) return <NotFound />;
  return <Post slug={post.slug} />;
}

/**
 * Split from the route component so the hooks below never run on a miss — a
 * conditional `useSeo` above an early return would change the hook order
 * between a real slug and a typo'd one.
 */
function Post({ slug }: { slug: string }) {
  const post = getPost(slug)!;
  const url = `${SITE_URL}/blog/${post.slug}`;
  const seo = seoForPath(`/blog/${post.slug}`);

  useSeo({
    title: seo.title ?? post.title,
    description: seo.description ?? post.metaDescription,
    path: `/blog/${post.slug}`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.metaDescription,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        inLanguage: "en",
        keywords: post.keywords.join(", "),
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: { "@type": "Organization", name: "GeoCliks", url: SITE_URL },
        publisher: { "@type": "Organization", name: "GeoCliks", url: SITE_URL },
        about: post.targetQuestion,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { q: post.targetQuestion, a: post.answer },
          ...post.faq.map((f) => ({ q: f.q, a: f.a })),
        ].map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  });

  const headings = post.blocks.filter((b) => b.kind === "h2") as {
    kind: "h2";
    text: string;
    id?: string;
  }[];
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <BlogShell>
      <article>
        {/* Head */}
        <header className="border-b border-line bg-navy">
          <div className="mx-auto max-w-[1180px] px-6 pt-14 pb-12">
            <Link
              to="/blog"
              className="eyebrow inline-flex items-center gap-2 text-white/50 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              Field Notes
            </Link>
            <div className="eyebrow mt-9 text-amber">{formatLabel[post.format]}</div>
            <h1 className="mt-4 max-w-[26ch] font-display text-[36px] font-extrabold leading-[1.08] tracking-[-0.03em] text-white sm:text-[52px]">
              {post.title}
            </h1>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
              <span>Published {post.publishedAt}</span>
              <span>{post.readMinutes} min read</span>
              <span>GeoCliks · Field Notes</span>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1180px] gap-14 px-6 py-14 lg:grid-cols-[210px_1fr]">
          {/* Rail */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 border-l border-line pl-5">
              <div className="eyebrow text-fog">On this page</div>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="#answer" className="text-[14px] font-semibold text-amber-deep">
                    The answer
                  </a>
                </li>
                {headings.map((h) => (
                  <li key={h.text}>
                    <a
                      href={`#${h.id ?? ""}`}
                      className="text-[14px] leading-[1.5] text-chalk/70 hover:text-chalk"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="#faq" className="text-[14px] text-chalk/70 hover:text-chalk">
                    Follow-up questions
                  </a>
                </li>
              </ul>

              <div className="mt-9 border-t border-line pt-5">
                <div className="eyebrow text-fog">Why this question</div>
                <p className="mt-3 text-[13px] leading-[1.6] text-chalk/65">{post.demand}</p>
              </div>
            </div>
          </aside>

          {/* Body */}
          <div>
            <div id="answer" className="scroll-mt-24">
              <AnswerBlock question={post.targetQuestion} answer={post.answer} />
            </div>

            <div className="[&_h2]:scroll-mt-24">
              <BlockList blocks={post.blocks} />
            </div>

            {/* FAQ */}
            <section id="faq" className="mt-16 scroll-mt-24 border-t border-line pt-10">
              <div className="eyebrow text-amber-deep">Follow-up questions</div>
              <h2 className="mt-3 font-display text-[27px] font-extrabold tracking-[-0.02em] text-chalk">
                Asked next, answered here
              </h2>
              <dl className="measure mt-8">
                {post.faq.map((f) => (
                  <div key={f.q} className="border-t border-line py-6 first:border-0 first:pt-0">
                    <dt className="text-[18px] font-bold leading-[1.4] tracking-[-0.01em] text-chalk">
                      {f.q}
                    </dt>
                    <dd className="mt-2.5 text-[17px] leading-[1.7] text-chalk/80">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* CTA */}
            <section className="mt-16 border border-line bg-white px-7 py-8">
              <div className="eyebrow text-amber-deep">Try the mechanism</div>
              <p className="measure mt-3 text-[17px] leading-[1.7] text-chalk/85">
                Every claim above about verification describes what GeoCliks captures: network time
                with the device skew shown, GPS with an accuracy radius and the reverse-geocoded
                address, and a photo code backed by a SHA-256 hash and HMAC signature. The Free plan
                captures the same way the paid plans do — 300 captures a month, no card.
              </p>
              <Link
                to="/get-app"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2.5 text-[14px] font-bold text-on-amber hover:bg-amber-hover"
              >
                Capture a verified photo
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
            </section>

            {/* More */}
            <section className="mt-16 border-t border-line pt-10">
              <div className="eyebrow text-fog">Other questions</div>
              <ul className="mt-6 space-y-5">
                {others.map((p) => (
                  <li key={p.slug}>
                    <Link to={`/blog/${p.slug}`} className="group block">
                      <span className="eyebrow text-amber-deep">{formatLabel[p.format]}</span>
                      <span className="mt-1.5 block font-display text-[19px] font-bold leading-[1.35] tracking-[-0.01em] text-chalk group-hover:text-amber-deep">
                        {p.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </article>
    </BlogShell>
  );
}
