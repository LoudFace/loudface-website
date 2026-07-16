/**
 * Blog Index Page — v3, derived from the "answer-first" concept vocabulary:
 * an electric compact hero → a light gallery of night exhibit cards (the concept's
 * related-post card language, with indigo gradient plates for the 13% of posts
 * with no thumbnail) → cover CTA → FooterV3.
 *
 * Category badges are read-only (no filter UI existed on the old index and none is
 * invented). Pagination (12/page), metadata, and the Blog + BreadcrumbList JSON-LD
 * are preserved from the previous index verbatim.
 *
 * ISR: revalidates every 60s so new posts and thumbnail changes surface.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import { fetchBlogIndexData } from '@/lib/cms-data';
import { formatReadTime } from '@/lib/blog-utils';
import { Pagination } from '@/components/ui';
import type { Category } from '@/lib/types';

import '../../blog-v3/blog-v3.css';
import { PostCard } from '../../blog-v3/PostCard';
import { CoverCTA } from '../../blog-v3/CoverCTA';
import { BlogV3Scripts } from '../../blog-v3/Scripts';
import { FooterV3 } from '../../home-v3/FooterV3';

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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1', 10));

  const { blogPosts, categories } = await fetchBlogIndexData();

  // Pagination
  const totalPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedPosts = blogPosts.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE,
  );

  function getCategory(id: string | undefined): Category | undefined {
    if (!id) return undefined;
    return categories.get(id);
  }

  // Structured Data — only include current page's posts (verbatim).
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

      <div className="blogv3">
        {/* Electric compact hero (HERO LAW; carries .hero for the dark Header flip) */}
        <section className="lead hero idx-lead" aria-label="Blog">
          <div className="container lead-in">
            <div className="lead-cat rv"><span className="eyebrow glass"><i></i>Insights &amp; guides</span></div>
            <h1 className="rv" style={{ ['--d' as string]: '.06s' }}>The LoudFace Blog</h1>
            <p className="lead-sub rv" style={{ ['--d' as string]: '.12s' }}>
              Actionable insights on Webflow development, SEO, AEO, and conversion design for B2B SaaS —
              guides, tutorials, and deep-dives from our team.
            </p>
            {blogPosts.length > 0 && (
              <span className="idx-count rv" style={{ ['--d' as string]: '.18s' }}>
                <i></i>{blogPosts.length} article{blogPosts.length === 1 ? '' : 's'} and counting
              </span>
            )}
          </div>
        </section>

        {/* Light gallery of exhibit cards */}
        <section className="index-body">
          <div className="container">
            <div className="idx-head">
              <h2 className="rv">Latest <span className="hot">articles</span></h2>
              <p className="rv" style={{ ['--d' as string]: '.06s' }}>Stay updated with our latest insights and resources.</p>
            </div>

            {paginatedPosts.length === 0 ? (
              <p className="idx-empty">No blog posts found. Check back soon.</p>
            ) : (
              <>
                <div className="idx-grid">
                  {paginatedPosts.map((post, i) => {
                    const category = getCategory(post.category);
                    return (
                      <PostCard
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        title={post.name}
                        categoryName={category?.name}
                        thumbnailUrl={post.thumbnail?.url}
                        readTime={formatReadTime(post['time-to-read'])}
                        delay={`${(Math.min(i, 5) * 0.05).toFixed(2)}s`}
                      />
                    );
                  })}
                </div>

                <div className="idx-pagination">
                  <Pagination currentPage={safePage} totalPages={totalPages} basePath="/blog" />
                </div>
              </>
            )}
          </div>
        </section>

        <CoverCTA />
        <FooterV3 />
      </div>

      <BlogV3Scripts />
    </>
  );
}
