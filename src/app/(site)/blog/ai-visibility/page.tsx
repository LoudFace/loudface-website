/**
 * AI Visibility hub (/blog/ai-visibility) — a curated topic hub over the blog's
 * AI-search content. Reuses the blog-v3 visual language verbatim: electric compact
 * hero → light gallery of exhibit cards (PostCard) grouped into editorial clusters
 * → cover CTA → FooterV3.
 *
 * Content structure lives in ../../../blog-v3/aiVisibilityHub. Posts are resolved
 * from the live blog posts by slug (no separate query, no CMS category change), so
 * this page is additive — it does not touch the existing blog index or its tags.
 *
 * ISR: revalidates every 60s so new posts added to a cluster surface.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import { fetchBlogIndexData } from '@/lib/cms-data';
import { formatReadTime } from '@/lib/blog-utils';
import type { BlogPost, Category } from '@/lib/types';

import '../../../blog-v3/blog-v3.css';
import { PostCard } from '../../../blog-v3/PostCard';
import { CoverCTA } from '../../../blog-v3/CoverCTA';
import { BlogV3Scripts } from '../../../blog-v3/Scripts';
import { FooterV3 } from '../../../home-v3/FooterV3';
import {
  AI_VISIBILITY_HERO,
  AI_VISIBILITY_CORNERSTONES,
  AI_VISIBILITY_CLUSTERS,
  AI_VISIBILITY_ALL_SLUGS,
} from '../../../blog-v3/aiVisibilityHub';

export const metadata: Metadata = {
  title: 'AI Visibility | Guides, Data & Playbooks',
  description:
    'How B2B SaaS gets found, cited, and recommended in AI search. Guides, original data studies, and playbooks on AEO, GEO, and AI answer engines from the LoudFace team.',
  alternates: {
    canonical: '/blog/ai-visibility',
  },
  openGraph: {
    title: 'AI Visibility | LoudFace',
    description:
      'How B2B SaaS gets found, cited, and recommended in AI search. Guides, data studies, and playbooks on AEO, GEO, and AI answer engines.',
    type: 'website',
    url: '/blog/ai-visibility',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace — AI Visibility' }],
  },
};

export default async function AiVisibilityHubPage() {
  const { blogPosts, categories } = await fetchBlogIndexData();
  const bySlug = new Map<string, BlogPost>(blogPosts.map((p) => [p.slug, p]));

  const resolve = (slugs: string[]): BlogPost[] =>
    slugs.map((s) => bySlug.get(s)).filter((p): p is BlogPost => Boolean(p));

  const cornerstones = resolve(AI_VISIBILITY_CORNERSTONES);
  const clusters = AI_VISIBILITY_CLUSTERS.map((c) => ({ ...c, posts: resolve(c.slugs) })).filter(
    (c) => c.posts.length > 0,
  );
  const totalPosts = resolve(AI_VISIBILITY_ALL_SLUGS).length;

  function getCategory(id: string | undefined): Category | undefined {
    if (!id) return undefined;
    return categories.get(id);
  }

  const renderCard = (post: BlogPost, i: number) => {
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
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI Visibility',
    description:
      'How B2B SaaS gets found, cited, and recommended in AI search — guides, data studies, and playbooks.',
    url: 'https://www.loudface.co/blog/ai-visibility',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.loudface.co/blog' },
      { '@type': 'ListItem', position: 3, name: 'AI Visibility' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="blogv3">
        {/* Electric compact hero (HERO LAW; carries .hero for the dark Header flip) */}
        <section className="lead hero idx-lead" aria-label="AI Visibility">
          <div className="container lead-in">
            <div className="lead-cat rvi"><span className="eyebrow glass"><i></i>{AI_VISIBILITY_HERO.eyebrow}</span></div>
            <h1 className="rvi" style={{ ['--d' as string]: '.06s' }}>{AI_VISIBILITY_HERO.title}</h1>
            <p className="lead-sub rvi" style={{ ['--d' as string]: '.12s' }}>
              {AI_VISIBILITY_HERO.subtitle}
            </p>
            {totalPosts > 0 && (
              <span className="idx-count rvi" style={{ ['--d' as string]: '.18s' }}>
                <i></i>{totalPosts} article{totalPosts === 1 ? '' : 's'} across {clusters.length} topics
              </span>
            )}
          </div>
        </section>

        {/* Start here — cornerstones */}
        {cornerstones.length > 0 && (
          <section className="index-body">
            <div className="container">
              <div className="idx-head">
                <h2 className="rv">Start <span className="hot">here</span></h2>
                <p className="rv" style={{ ['--d' as string]: '.06s' }}>The four pieces to read first.</p>
              </div>
              <div className="idx-grid">
                {cornerstones.map(renderCard)}
              </div>
            </div>
          </section>
        )}

        {/* Editorial clusters */}
        {clusters.map((cluster) => (
          <section className="index-body" key={cluster.title} aria-label={cluster.title}>
            <div className="container">
              <div className="idx-head">
                <h2 className="rv">
                  {cluster.title.replace(cluster.highlightWord, '').trim()}{' '}
                  <span className="hot">{cluster.highlightWord}</span>
                </h2>
                <p className="rv" style={{ ['--d' as string]: '.06s' }}>{cluster.blurb}</p>
              </div>
              <div className="idx-grid">
                {cluster.posts.map(renderCard)}
              </div>
            </div>
          </section>
        ))}

        <CoverCTA />
        <FooterV3 />
      </div>

      <BlogV3Scripts />
    </>
  );
}
