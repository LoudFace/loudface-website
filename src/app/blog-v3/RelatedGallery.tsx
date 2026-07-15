/**
 * RelatedGallery — the closing night exhibit-gallery on a blog post ("Keep
 * reading."). Uses the existing two-tier related-post selection resolved by the
 * caller (same-category first, then slug-affinity backfill) and renders each as
 * a PostCard. Rendered only when there is at least one related post.
 */
import { PostCard } from './PostCard';

export interface RelatedPost {
  href: string;
  title: string;
  categoryName?: string;
  thumbnailUrl?: string;
  readTime?: string;
}

export function RelatedGallery({ posts }: { posts: RelatedPost[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="related" aria-label="Related articles">
      <div className="container">
        <div className="rel-head">
          <h2 className="rv">Keep <span className="soft">reading.</span></h2>
          <p className="rel-note rv" style={{ ['--d' as string]: '.06s' }}>
            More on measuring and winning AI answers for B2B SaaS.
          </p>
        </div>
        <div className="rel-grid">
          {posts.map((p, i) => (
            <PostCard key={p.href} {...p} delay={`${(i * 0.08).toFixed(2)}s`} />
          ))}
        </div>
      </div>
    </section>
  );
}
