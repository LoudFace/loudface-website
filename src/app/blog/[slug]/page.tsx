/**
 * Blog Post Detail Page
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchCollection, fetchHomepageData, fetchItemBySlug } from '@/lib/cms-data';
import { avatarImage, heroImage, thumbnailImage } from '@/lib/image-utils';
import { asset } from '@/lib/assets';
import { Badge, SectionContainer } from '@/components/ui';
import { CTA, RelatedComparisons } from '@/components/sections';
import { buildNoIndexMetadata, buildPageMetadata, truncateSeoTitle, truncateSeoDescription, rewriteLegacyUrls } from '@/lib/seo-utils';
import { extractFAQFromHTML, buildFAQSchema, buildSpeakableSchema } from '@/lib/schema-utils';
import type { BlogPost, Category, TeamMember } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await fetchCollection<Record<string, unknown>>('blog');
  return items
    .filter((item) => item.slug)
    .map((item) => ({
      slug: item.slug as string,
    }));
}

// Extract TOC from content
function extractTocAndAddIds(html: string | undefined): { toc: { id: string; text: string }[]; html: string } {
  if (!html) return { toc: [], html: '' };

  // Downgrade any H1 tags in CMS content to H2 (page already has an H1)
  let normalized = html.replace(/<h1([^>]*)>(.*?)<\/h1>/gi, '<h2$1>$2</h2>');

  // Fix any HTTP links to our domain that should be HTTPS
  normalized = normalized.replace(/http:\/\/loudface\.co/g, 'https://www.loudface.co');

  // Rewrite legacy internal URLs to canonical paths (eliminates 308 redirect chains)
  normalized = rewriteLegacyUrls(normalized);

  // Replace curly/smart quotes with straight quotes in HTML attributes
  // Rich text editors sometimes convert quotes in code examples
  normalized = normalized.replace(/[\u201C\u201D]/g, '"');
  normalized = normalized.replace(/[\u2018\u2019]/g, "'");

  // Escape <script> tags in CMS rich text so they display as code, not execute.
  normalized = normalized.replace(/<script\b/gi, '&lt;script');
  normalized = normalized.replace(/<\/script>/gi, '&lt;/script&gt;');

  // Fix malformed URLs from CMS rich text: <https://example.com> → https://example.com
  normalized = normalized.replace(/src="<(https?:\/\/[^">]+)>"/g, 'src="$1"');
  normalized = normalized.replace(/href="<(https?:\/\/[^">]+)>"/g, 'href="$1"');

  // Add alt text to CMS images that have empty, missing, or placeholder alt attributes
  normalized = normalized.replace(
    /<img([^>]*?)alt="(__wf_reserved_inherit)?"([^>]*?)>/gi,
    '<img$1alt="Blog post image"$3>',
  );
  normalized = normalized.replace(
    /<img(?![^>]*alt=)([^>]*?)>/gi,
    '<img alt="Blog post image"$1>',
  );

  const toc: { id: string; text: string }[] = [];
  let index = 0;

  const processedHtml = normalized.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (_match, attrs, content) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const id = `section-${index++}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
    toc.push({ id, text });
    return `<h2${attrs} id="${id}">${content}</h2>`;
  });

  return { toc, html: processedHtml };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const post = await fetchItemBySlug<BlogPost>('blog', slug);
  if (!post) {
    return buildNoIndexMetadata('Blog Post');
  }

  const rawTitle = post['meta-title'] || post.name;
  const title = truncateSeoTitle(rawTitle);
  const description = truncateSeoDescription(post['meta-description'])
    || truncateSeoDescription(post.excerpt)
    || '';
  const imageUrl = post.thumbnail?.url || '/images/og-image.jpg';

  return buildPageMetadata({
    title,
    description,
    canonicalPath: `/blog/${slug}`,
    type: 'article',
    imageUrl,
    publishedTime: post['published-date'],
    modifiedTime: post['last-updated'] || post['published-date'],
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const [cmsData, post] = await Promise.all([
    fetchHomepageData(),
    fetchItemBySlug<BlogPost>('blog', slug),
  ]);
  const { blogPosts, categories, teamMembers } = cmsData;

  let category: Category | null = null;
  let author: TeamMember | null = null;
  let relatedPosts: BlogPost[] = [];

  if (!post) {
    notFound();
  }

  if (post.category) {
    category = categories.get(post.category) || null;
  }
  if (post.author) {
    author = teamMembers.get(post.author) || null;
  }

  const sameCategoryPosts = blogPosts
    .filter((entry) => entry.slug !== slug && entry.category === post.category)
    .slice(0, 3);

  if (sameCategoryPosts.length < 3) {
    const slugKeywords = slug.split('-').filter((word) => word.length > 3);
    const remaining = 3 - sameCategoryPosts.length;
    const affinityPosts = blogPosts
      .filter(
        (entry) =>
          entry.slug !== slug &&
          !sameCategoryPosts.some((matched) => matched.slug === entry.slug)
      )
      .map((entry) => ({
        ...entry,
        affinity: slugKeywords.filter((keyword) => entry.slug.includes(keyword)).length,
      }))
      .sort((a, b) => b.affinity - a.affinity)
      .slice(0, remaining);

    relatedPosts = [...sameCategoryPosts, ...affinityPosts];
  } else {
    relatedPosts = sameCategoryPosts;
  }

  const COMPARISON_SLUGS = [
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
    url: canonicalUrl,
    description: post.excerpt || '',
    image: post.thumbnail?.url,
    datePublished: post['published-date'],
    dateModified: post['last-updated'] || post['published-date'],
    author: {
      '@type': 'Person',
      name: author?.name || 'LoudFace',
      ...(author?.['job-title'] && { jobTitle: author['job-title'] }),
      ...(author?.['profile-picture']?.url && { image: author['profile-picture'].url }),
      url: author?.slug ? `https://www.loudface.co/team/${author.slug}` : 'https://www.loudface.co/about',
      worksFor: {
        '@type': 'Organization',
        name: 'LoudFace',
        url: 'https://www.loudface.co',
      },
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.loudface.co/blog' },
      { '@type': 'ListItem', position: 3, name: post.name },
    ],
  };

  // Auto-extract FAQ from H2 headings for FAQPage schema (3.1x higher AI extraction rate)
  const faqItems = extractFAQFromHTML(post.content);
  const faqSchema = buildFAQSchema(faqItems);
  const speakableSchema = buildSpeakableSchema(post.name, canonicalUrl);

  return (
    <>
      {/* Structured Data — native script tags for SSR visibility to crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
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
              <Badge className="mb-4 border-primary-100 bg-primary-50 text-primary-700">
                {category.name}
              </Badge>
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
                <Link href={`/team/${author.slug}`} className="flex items-center gap-3 group">
                  {author['profile-picture']?.url && (
                    <img
                      src={avatarImage(author['profile-picture'].url)}
                      alt={author.name}
                      width="80"
                      height="80"
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div className="text-left">
                    <div className="font-medium text-surface-900 group-hover:text-primary-600 transition-colors">{author.name}</div>
                    {author['job-title'] && (
                      <div className="text-sm text-surface-500">{author['job-title']}</div>
                    )}
                  </div>
                </Link>
              )}
            </div>

            {/* Publication & freshness dates — visible freshness signals improve E-E-A-T */}
            <div className="mt-4 flex items-center justify-center gap-3 text-sm text-surface-500">
              {post['published-date'] && (
                <time dateTime={post['published-date']}>
                  {new Date(post['published-date']).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </time>
              )}
              {post['last-updated'] && post['last-updated'] !== post['published-date'] && (
                <>
                  <span className="text-surface-300">·</span>
                  <span>
                    Updated{' '}
                    <time dateTime={post['last-updated']}>
                      {new Date(post['last-updated']).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </time>
                  </span>
                </>
              )}
              {post['time-to-read'] && (
                <>
                  <span className="text-surface-300">·</span>
                  <span>{post['time-to-read']}</span>
                </>
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
                fetchPriority="high"
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
                  <span className="block text-sm font-medium text-surface-500 uppercase tracking-wide mb-3">On this page</span>
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
                <Link href={`/team/${author.slug}`} className="block bg-surface-50 rounded-xl p-5 group hover:bg-surface-100 transition-colors">
                  <span className="block text-sm font-medium text-surface-500 uppercase tracking-wide mb-3">Written by</span>
                  <div className="flex items-center gap-3">
                    {author['profile-picture']?.url && (
                      <img
                        src={avatarImage(author['profile-picture'].url)}
                        alt={author.name}
                        width="80"
                        height="80"
                        loading="lazy"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-surface-900 group-hover:text-primary-600 transition-colors">{author.name}</div>
                      {author['job-title'] && (
                        <div className="text-sm text-surface-500">{author['job-title']}</div>
                      )}
                    </div>
                  </div>
                </Link>
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
              All blog posts
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
