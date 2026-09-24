import type { Post } from "./types";
import { blogSeo } from "../seo-routes";
import { tamperProofFieldPhoto } from "./tamper-proof-field-photo";
import { canGpsTimestampPhotoBeFaked } from "./can-gps-timestamp-photo-be-faked";
import { bestConstructionPhotoSoftware } from "./best-construction-photo-software";
import { photoDocumentationPricing } from "./photo-documentation-pricing";
import { photoProofOfDelivery } from "./photo-proof-of-delivery";

export type { Post, Block, FaqItem, PostFormat } from "./types";

export const posts: Post[] = [
  tamperProofFieldPhoto,
  canGpsTimestampPhotoBeFaked,
  photoDocumentationPricing,
  bestConstructionPhotoSoftware,
  photoProofOfDelivery,
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

/**
 * Dev-time integrity pass. A post without a `BLOG_SEO` row would ship with the
 * sitewide default title in its HTML — the exact failure the SEO table exists to
 * prevent, and an invisible one, since the page still renders correctly once the
 * app boots. Duplicate slugs are caught here too: one of the two posts would be
 * unreachable.
 *
 * Called from `../../components/blog-shell` under `import.meta.env.DEV`, not
 * here: this module is also imported by `scripts/gen-sitemap.ts`, which runs in
 * Bun with no Vite env to read.
 */
export function assertPostSeo(): void {
  const seen = new Set<string>();
  for (const post of posts) {
    if (seen.has(post.slug)) throw new Error(`[posts] duplicate slug "${post.slug}"`);
    seen.add(post.slug);
    if (!blogSeo(post.slug)) {
      throw new Error(
        `[posts] "${post.slug}" has no BLOG_SEO row in lib/seo-routes.ts — it would ship with the site's default title`,
      );
    }
  }
}

export const formatLabel: Record<Post["format"], string> = {
  comparison: "Comparison",
  "best-of": "Buyer's checklist",
  "how-to": "How-to",
  faq: "Answer",
};
