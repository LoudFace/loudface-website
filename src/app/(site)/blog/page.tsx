/**
 * Blog Index Page — editorial register
 *
 * Replaces the previous template (bordered cream hero → "Latest Articles"
 * section header → uniform 12-card grid → pagination) with an editorial
 * layout:
 *
 *   1. Statement of editorial intent (one large typographic line, no box).
 *   2. Featured post — the most recent piece gets a large hero card.
 *   3. Pattern groups — posts grouped by AEO Pattern (Listicles, Playbooks,
 *      Comparisons, AEO research, Industry briefs, Founder bylines, Field
 *      notes). Each group has its own mono label and a horizontal list of
 *      posts inside it. Variable density signals "agency with a point of
 *      view" rather than "content farm with 82 posts."
 *
 * Pagination preserved at the bottom; URL contract `/blog?page=N` unchanged
 * so external links keep working.
 *
 * ISR: revalidates every 60s so new posts surface without a redeploy.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchHomepageData } from '@/lib/cms-data';
import { thumbnailImage } from '@/lib/image-utils';
import { asset } from '@/lib/assets';
import { Pagination } from '@/components/ui';
import { CTA } from '@/components/sections';
import type { BlogPost, Category, TeamMember } from '@/lib/types';

const POSTS_PER_PAGE = 12;

export const metadata: Metadata = {
  title: 'Blog | Insights & Resources',
  description: 'Actionable insights on Webflow development, SEO, AEO, and conversion design from the LoudFace team. Browse guides, tutorials, and deep-dives for B2B SaaS.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'LoudFace Blog | Webflow, SEO & Growth Insights',
    description: 'Actionable insights on Webflow development, SEO, AEO, and conversion design from the LoudFace team. Browse guides, tutorials, and deep-dives for B2B SaaS.',
    type: 'website',
    url: '/blog',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'LoudFace Blog | Webflow, SEO & Growth Insights',
    description: 'Actionable insights on Webflow development, SEO, AEO, and conversion design from the LoudFace team. Browse guides, tutorials, and deep-dives for B2B SaaS.',
    images: ['/opengraph-image'],
  },
};

// ─────────────────────────────────────────────────────────────────────────
// Pattern inference — mirrors blog/[slug]/page.tsx so the same post lands
// in the same Pattern group on both surfaces.
// ─────────────────────────────────────────────────────────────────────────
type PatternKey =
  | 'listicle'
  | 'comparison'
  | 'playbook'
  | 'aeo'
  | 'industry'
  | 'pricing'
  | 'founder'
  | 'field';

interface PatternGroup {
  key: PatternKey;
  label: string;
  blurb: string;
}

const PATTERN_ORDER: PatternGroup[] = [
  { key: 'aeo', label: 'AEO research', blurb: 'Field reports on how AI engines actually cite, extract, and rank.' },
  { key: 'playbook', label: 'Playbooks', blurb: 'Step-by-step guides for shipping. Tested on LoudFace clients first.' },
  { key: 'listicle', label: 'Ranked listicles', blurb: 'Honest, year-stamped rankings. With "where they’re not the best fit" on every entry.' },
  { key: 'comparison', label: 'Comparisons', blurb: 'X vs Y. When to use which. Where they break.' },
  { key: 'industry', label: 'Industry briefs', blurb: 'Vertical-specific takes for B2B SaaS founders.' },
  { key: 'pricing', label: 'Pricing breakdowns', blurb: 'What things actually cost. With ROI proof.' },
  { key: 'founder', label: 'Founder bylines', blurb: 'Opinions from Arnel and the LoudFace team.' },
  { key: 'field', label: 'Field notes', blurb: 'Everything else worth publishing.' },
];

function inferPattern(slug: string, postName?: string): PatternKey {
  const s = slug.toLowerCase();
  const name = (postName || '').toLowerCase();
  if (/(\d+\+?-best|best-\d+|best-.*-(agencies|tools|software|platforms)|ranked|top-\d+)/.test(s)) return 'listicle';
  if (/-vs-/.test(s)) return 'comparison';
  if (/(pricing|cost|price)/.test(s)) return 'pricing';
  if (/(playbook|guide|how-to|complete-guide|tutorial|in-\d+-minutes|audit)/.test(s)) return 'playbook';
  if (/(aeo|answer-engine|citation|share-of-answer|schema)/.test(s)) return 'aeo';
  if (/(b2b-saas|industry|vertical|fintech|healthcare|cybersecurity)/.test(s)) return 'industry';
  if (/(why-loudface|founder|opinion|why-i|lessons|what-i-learned)/.test(name)) return 'founder';
  return 'field';
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10));

  const cmsData = await fetchHomepageData();
  const { blogPosts, categories, teamMembers } = cmsData;

  const totalPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedPosts = blogPosts.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE
  );

  function getCategory(id: string | undefined): Category | undefined {
    if (!id) return undefined;
    return categories.get(id);
  }
  function getAuthor(id: string | undefined): TeamMember | undefined {
    if (!id) return undefined;
    return teamMembers.get(id);
  }

  // Page 1 only: split off a featured story; group the rest by Pattern.
  const isFirstPage = safePage === 1;
  const featured = isFirstPage ? paginatedPosts[0] : null;
  const remaining = isFirstPage ? paginatedPosts.slice(1) : paginatedPosts;

  const groups: Record<PatternKey, BlogPost[]> = {
    aeo: [], playbook: [], listicle: [], comparison: [], industry: [], pricing: [], founder: [], field: [],
  };
  for (const post of remaining) {
    const key = inferPattern(post.slug, post.name);
    groups[key].push(post);
  }
  const activeGroups = PATTERN_ORDER.filter((g) => groups[g.key].length > 0);

  // Structured data — current page's posts
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'LoudFace Blog',
    description: 'Insights on Webflow development, SEO, AEO, and design best practices.',
    url: 'https://www.loudface.co/blog',
    blogPost: paginatedPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.name,
      url: `https://www.loudface.co/blog/${post.slug}`,
      datePublished: post['published-date'],
    })),
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Blog' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ───────────────────────────────────────────────────────────────
          Statement of intent — one editorial line, no boxed hero.
          ─────────────────────────────────────────────────────────────── */}
      <section className="blog-index__intro">
        <div className="blog-index__intro-inner">
          <div className="blog-index__eyebrow">
            <span aria-hidden="true" className="blog-index__rule" />
            <span>The LoudFace journal</span>
          </div>
          <h1 className="blog-index__statement">
            Playbooks B2B SaaS founders use to get cited by AI engines.
          </h1>
          <p className="blog-index__sub">
            Field-tested on LoudFace clients first. Year-stamped, honest about where things break, refreshed when the answer changes.
          </p>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────
          Featured story (page 1 only).
          ─────────────────────────────────────────────────────────────── */}
      {featured && isFirstPage && (
        <section className="blog-index__featured">
          <div className="blog-index__featured-inner">
            <Link href={`/blog/${featured.slug}`} className="blog-index__featured-card group">
              <div className="blog-index__featured-thumb">
                <img
                  src={thumbnailImage(featured.thumbnail?.url) || asset('/images/placeholder.webp')}
                  alt={featured.thumbnail?.alt || featured.name}
                  width="1600"
                  height="900"
                  loading="eager"
                  fetchPriority="high"
                  className="blog-index__featured-img"
                />
              </div>
              <div className="blog-index__featured-body">
                <div className="blog-index__featured-meta">
                  <span className="blog-index__featured-label">
                    <span aria-hidden="true" className="blog-index__rule" />
                    Featured · Most recent
                  </span>
                  {getCategory(featured.category) && (
                    <span className="blog-index__featured-cat">{getCategory(featured.category)?.name}</span>
                  )}
                </div>
                <h2 className="blog-index__featured-title">{featured.name}</h2>
                {featured.excerpt && (
                  <p className="blog-index__featured-excerpt">{featured.excerpt}</p>
                )}
                <div className="blog-index__featured-byline">
                  <span>By {getAuthor(featured.author)?.name || 'LoudFace'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featured['time-to-read'] || '5 min'}{/\bmin\b/i.test(featured['time-to-read'] || '') ? '' : ' min read'}</span>
                  <span aria-hidden="true" className="blog-index__featured-arrow">→</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────────
          Pattern groups (page 1 only).
          ─────────────────────────────────────────────────────────────── */}
      {isFirstPage && activeGroups.length > 0 && (
        <section className="blog-index__groups">
          <div className="blog-index__groups-inner">
            {activeGroups.map((group) => {
              const items = groups[group.key];
              return (
                <div key={group.key} className="blog-index__group">
                  <header className="blog-index__group-head">
                    <div>
                      <div className="blog-index__group-label">
                        <span aria-hidden="true" className="blog-index__rule" />
                        <span>{group.label}</span>
                        <span className="blog-index__group-count">· {items.length}</span>
                      </div>
                      <p className="blog-index__group-blurb">{group.blurb}</p>
                    </div>
                  </header>

                  <ul className="blog-index__group-list">
                    {items.map((post) => {
                      const category = getCategory(post.category);
                      return (
                        <li key={post.slug}>
                          <Link href={`/blog/${post.slug}`} className="blog-index__row group">
                            <span className="blog-index__row-thumb">
                              <img
                                src={thumbnailImage(post.thumbnail?.url) || asset('/images/placeholder.webp')}
                                alt={post.thumbnail?.alt || post.name}
                                width="400"
                                height="225"
                                loading="lazy"
                                className="blog-index__row-img"
                              />
                            </span>
                            <span className="blog-index__row-body">
                              <span className="blog-index__row-title">{post.name}</span>
                              {post.excerpt && (
                                <span className="blog-index__row-excerpt">{post.excerpt}</span>
                              )}
                              <span className="blog-index__row-meta">
                                {category && <span>{category.name}</span>}
                                {category && <span aria-hidden="true" className="blog-index__row-sep">·</span>}
                                <span>{post['time-to-read'] || '5 min'}{/\bmin\b/i.test(post['time-to-read'] || '') ? '' : ' min read'}</span>
                              </span>
                            </span>
                            <span className="blog-index__row-arrow" aria-hidden="true">→</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────────
          Pagination (uniform grid for pages 2+, where editorial pacing
          is less important — visitors there are already deep in the archive).
          ─────────────────────────────────────────────────────────────── */}
      {!isFirstPage && (
        <section className="blog-index__archive">
          <div className="blog-index__archive-inner">
            <div className="blog-index__archive-head">
              <div className="blog-index__group-label">
                <span aria-hidden="true" className="blog-index__rule" />
                <span>Archive · Page {safePage} of {totalPages}</span>
              </div>
            </div>
            <ul className="blog-index__group-list">
              {paginatedPosts.map((post) => {
                const category = getCategory(post.category);
                return (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} className="blog-index__row group">
                      <span className="blog-index__row-thumb">
                        <img
                          src={thumbnailImage(post.thumbnail?.url) || asset('/images/placeholder.webp')}
                          alt={post.thumbnail?.alt || post.name}
                          width="400"
                          height="225"
                          loading="lazy"
                          className="blog-index__row-img"
                        />
                      </span>
                      <span className="blog-index__row-body">
                        <span className="blog-index__row-title">{post.name}</span>
                        {post.excerpt && (
                          <span className="blog-index__row-excerpt">{post.excerpt}</span>
                        )}
                        <span className="blog-index__row-meta">
                          {category && <span>{category.name}</span>}
                          {category && <span aria-hidden="true" className="blog-index__row-sep">·</span>}
                          <span>{post['time-to-read'] || '5 min'}{/\bmin\b/i.test(post['time-to-read'] || '') ? '' : ' min read'}</span>
                        </span>
                      </span>
                      <span className="blog-index__row-arrow" aria-hidden="true">→</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {totalPages > 1 && (
        <div className="blog-index__pagination">
          <Pagination currentPage={safePage} totalPages={totalPages} basePath="/blog" />
        </div>
      )}

      <CTA />
    </>
  );
}
