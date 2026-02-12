/**
 * Blog Post Detail Page
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import { COLLECTION_IDS } from '@/lib/constants';
import { fetchHomepageData, getAccessToken } from '@/lib/cms-data';
import { avatarImage, heroImage, thumbnailImage } from '@/lib/image-utils';
import { asset } from '@/lib/assets';
import { SectionContainer } from '@/components/ui';
import { CTA, RelatedComparisons } from '@/components/sections';
import { truncateSeoTitle } from '@/lib/seo-utils';
import type { BlogPost, Category, TeamMember } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Extract TOC from content
function extractTocAndAddIds(html: string | undefined): { toc: { id: string; text: string }[]; html: string } {
  if (!html) return { toc: [], html: '' };

  const toc: { id: string; text: string }[] = [];
  let index = 0;

  const processedHtml = html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_match, attrs, content) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const id = `section-${index++}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    toc.push({ id, text });
    return `<h2${attrs} id="${id}">${content}</h2>`;
  });

  return { toc, html: processedHtml };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const accessToken = getAccessToken();

  if (!accessToken) {
    return { title: 'Blog Post' };
  }

  try {
    const postsRes = await fetch(
      `https://api.webflow.com/v2/collections/${COLLECTION_IDS['blog']}/items`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 60 },
      }
    );

    if (postsRes.ok) {
      const postsData = await postsRes.json();
      const item = postsData.items?.find((i: Record<string, unknown>) =>
        (i.fieldData as Record<string, unknown>)?.slug === slug
      );

      if (item) {
        const fieldData = item.fieldData as Record<string, unknown>;
        const rawTitle = (fieldData['meta-title'] as string) || (fieldData.name as string);
        const title = truncateSeoTitle(rawTitle);
        const description = (fieldData['meta-description'] as string) || (fieldData.excerpt as string) || '';
        const thumbnail = fieldData.thumbnail as { url?: string } | undefined;
        const imageUrl = thumbnail?.url || '/images/og-image.jpg';
        return {
          title,
          description,
          alternates: {
            canonical: `/blog/${slug}`,
          },
          openGraph: {
            type: 'article',
            title,
            description,
            url: `/blog/${slug}`,
            images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
            publishedTime: (fieldData['published-date'] as string) || undefined,
            modifiedTime: (fieldData['last-updated'] as string) || (fieldData['published-date'] as string) || undefined,
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
          },
        };
      }
    }
  } catch {
    // Fall through to default
  }

  return { title: 'Blog Post' };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const accessToken = getAccessToken();

  if (!accessToken) {
    notFound();
  }

  // Fetch CMS data
  const cmsData = await fetchHomepageData(accessToken);
  const { blogPosts, categories, teamMembers } = cmsData;

  // Fetch blog posts with full content
  let post: BlogPost | null = null;
  let category: Category | null = null;
  let author: TeamMember | null = null;
  let relatedPosts: BlogPost[] = [];

  try {
    const postsRes = await fetch(
      `https://api.webflow.com/v2/collections/${COLLECTION_IDS['blog']}/items`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 60 },
      }
    );

    if (postsRes.ok) {
      const postsData = await postsRes.json();
      const item = postsData.items?.find((i: Record<string, unknown>) =>
        (i.fieldData as Record<string, unknown>)?.slug === slug
      );

      if (item) {
        const fieldData = item.fieldData as Record<string, unknown>;
        post = {
          id: item.id as string,
          ...fieldData,
        } as BlogPost;

        // Get category and author
        if (post.category) {
          category = categories.get(post.category) || null;
        }
        if (post.author) {
          author = teamMembers.get(post.author) || null;
        }

        // Category-based related posts
        const sameCategoryPosts = blogPosts
          .filter(p => p.slug !== slug && p.category === post!.category)
          .slice(0, 3);

        if (sameCategoryPosts.length < 3) {
          // Slug keyword affinity fallback — prefer posts with similar topics
          const slugKeywords = slug.split('-').filter(w => w.length > 3);
          const remaining = 3 - sameCategoryPosts.length;
          const affinityPosts = blogPosts
            .filter(p => p.slug !== slug && !sameCategoryPosts.some(sp => sp.slug === p.slug))
            .map(p => ({
              ...p,
              affinity: slugKeywords.filter(kw => p.slug.includes(kw)).length,
            }))
            .sort((a, b) => b.affinity - a.affinity)
            .slice(0, remaining);

          relatedPosts = [...sameCategoryPosts, ...affinityPosts];
        } else {
          relatedPosts = sameCategoryPosts;
        }
      }
    }
  } catch (error) {
    console.error('Blog post fetch error:', error);
  }

  if (!post) {
    notFound();
  }

  const COMPARISON_SLUGS = [
    'webflow-vs-framer',
    'webflow-vs-wix-studio',
    'webflow-vs-squarespace',
    'webflow-vs-hubspot',
    'webflow-vs-wordpress-org',
    'webflow-vs-wordpress-com',
    'webflow-vs-editorx',
    'webflow-vs-popular-alternatives',
  ];
  const isComparisonPost = COMPARISON_SLUGS.includes(slug);

  const { toc, html: processedContent } = extractTocAndAddIds(post.content);
  const canonicalUrl = `https://www.loudface.co/blog/${slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.name,
    description: post.excerpt || '',
    image: post.thumbnail?.url,
    datePublished: post['published-date'],
    dateModified: post['last-updated'] || post['published-date'],
    author: {
      '@type': 'Person',
      name: author?.name || 'LoudFace',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.loudface.co/blog' },
      { '@type': 'ListItem', position: 3, name: post.name },
    ],
  };

  return (
    <>
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-white">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center justify-center gap-2 text-sm text-surface-500">
                <li><Link href="/blog" className="hover:text-primary-600">Blog</Link></li>
                <li><span className="mx-1">/</span></li>
                <li className="text-surface-900 truncate max-w-[200px]">{post.name}</li>
              </ol>
            </nav>

            {category && (
              <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-4">
                {category.name}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-surface-900 leading-tight">
              {post.name}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-xl text-surface-600 max-w-2xl mx-auto">
                {post.excerpt}
              </p>
            )}

            <div className="mt-8 flex items-center justify-center gap-4">
              {author && (
                <div className="flex items-center gap-3">
                  {author['profile-picture']?.url && (
                    <img
                      src={avatarImage(author['profile-picture'].url)}
                      alt={author.name}
                      width="80"
                      height="80"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="text-left">
                    <div className="font-medium text-surface-900">{author.name}</div>
                    {author['job-title'] && (
                      <div className="text-sm text-surface-500">{author['job-title']}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.thumbnail?.url && (
        <div className="bg-white pb-12">
          <div className="px-4 md:px-8 lg:px-12">
            <div className="max-w-4xl mx-auto">
              <img
                src={heroImage(post.thumbnail.url).src}
                alt={post.thumbnail.alt || post.name}
                width="1200"
                height="675"
                className="w-full rounded-xl shadow-lg"
                loading="eager"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <SectionContainer className="bg-white" padding="sm">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12">
            {/* Article Body */}
            <article className="min-w-0">
              {processedContent ? (
                <div className="blog-prose" dangerouslySetInnerHTML={{ __html: processedContent }} />
              ) : (
                <p className="text-surface-500">No content available for this post.</p>
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start space-y-8">
              {toc.length > 0 && (
                <nav className="toc">
                  <h3 className="text-sm font-medium text-surface-500 uppercase tracking-wide mb-3">On this page</h3>
                  <ul className="space-y-2">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="toc-link block text-sm text-surface-600 hover:text-primary-600 transition-colors py-1 border-l-2 border-surface-200 hover:border-primary-500 pl-3"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {author && (
                <div className="bg-surface-50 rounded-xl p-5">
                  <h3 className="text-sm font-medium text-surface-500 uppercase tracking-wide mb-3">Written by</h3>
                  <div className="flex items-center gap-3">
                    {author['profile-picture']?.url && (
                      <img
                        src={avatarImage(author['profile-picture'].url)}
                        alt={author.name}
                        width="80"
                        height="80"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-surface-900">{author.name}</div>
                      {author['job-title'] && (
                        <div className="text-sm text-surface-500">{author['job-title']}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </SectionContainer>

      {/* Comparison Cross-Links */}
      {isComparisonPost && <RelatedComparisons currentSlug={slug} />}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <SectionContainer>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-medium text-surface-900">Related posts</h2>
            <Link href="/blog" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => {
              const relatedCategory = related.category ? categories.get(related.category) : undefined;

              return (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={thumbnailImage(related.thumbnail?.url) || asset('/images/placeholder.webp')}
                      alt={related.name}
                      width="800"
                      height="450"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    {relatedCategory && (
                      <span className="inline-block px-2 py-0.5 bg-surface-100 text-surface-600 rounded text-xs font-medium mb-2">
                        {relatedCategory.name}
                      </span>
                    )}
                    <h3 className="font-medium text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {related.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </SectionContainer>
      )}

      {/* CTA */}
      <CTA
        variant="dark"
        title="Ready to grow your business?"
        subtitle="Let's discuss how we can help you achieve your goals."
        ctaText="Book a call"
      />
    </>
  );
}
