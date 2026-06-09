/**
 * Blog Post Detail Page
 *
 * ISR: revalidates every 60 seconds so Sanity content edits (thumbnail
 * swaps, visual updates, body-copy tweaks) propagate to the live page
 * within a minute without needing a Vercel redeploy. New slugs are
 * rendered on-demand via `dynamicParams: true` (Next default).
 */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchCollection, fetchHomepageData, fetchItemBySlug } from '@/lib/cms-data';
import { avatarImage, heroImage, thumbnailImage } from '@/lib/image-utils';
import { asset } from '@/lib/assets';
import { Badge, SectionContainer } from '@/components/ui';
import {
  BlogContent,
  BlogTOC,
  BlogExploreWithAI,
  BlogCTACard,
  BlogShareRow,
} from '@/components/blog';
import { CTA, FAQ, RelatedComparisons } from '@/components/sections';
import { buildNoIndexMetadata, buildPageMetadata, truncateSeoTitle, truncateSeoDescription, rewriteLegacyUrls } from '@/lib/seo-utils';
import {
  extractFAQFromHTML,
  buildFAQSchema,
  buildItemListSchema,
  buildSpeakableSchema,
  buildArticleAuthorSchema,
  buildOrganizationPublisher,
  buildImageObject,
} from '@/lib/schema-utils';
import { autoLinkServiceMentions } from '@/lib/html-utils';
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

  // Wrap every <table> in a horizontally-scrollable container. The article
  // column is ~560px on desktop (narrow because of the sticky TOC sidebar),
  // which is too cramped for typical 4-6 column comparison tables. Letting
  // the table keep its natural column widths and scrolling the WRAPPER when
  // it exceeds the column is the standard editorial pattern, and preserves
  // table semantics (which `display: block` on <table> breaks).
  normalized = normalized.replace(
    /<table\b[\s\S]*?<\/table>/gi,
    (match) => `<div class="blog-table-wrap">${match}</div>`,
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
  const imageUrl = post.thumbnail?.url || '/opengraph-image';

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
  // Inject internal service links AFTER toc/heading processing so the
  // auto-linker only touches paragraph-level prose.
  const linkedContent = autoLinkServiceMentions(processedContent);
  const canonicalUrl = `https://www.loudface.co/blog/${slug}`;

  const articleImage = buildImageObject(post.thumbnail?.url);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.name,
    url: canonicalUrl,
    description: post.excerpt || '',
    ...(articleImage && { image: articleImage }),
    datePublished: post['published-date'],
    dateModified: post['last-updated'] || post['published-date'],
    author: buildArticleAuthorSchema(author),
    publisher: buildOrganizationPublisher(),
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

  // FAQ: prefer hand-written CMS FAQ, fall back to auto-extracted from H2 headings
  const faqItems = post.faq?.length ? post.faq : extractFAQFromHTML(post.content);
  const faqSchema = buildFAQSchema(faqItems);
  // ItemList: only fires on ranked listicles (3+ numbered <h3> entries)
  const itemListSchema = buildItemListSchema(post.content, post.name, canonicalUrl);
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
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* Hero — inherits body bg (off-white surface-50). Type tightens
          letter-spacing and switches to surface-950 for a neutral
          near-black; excerpt drops to surface-500 (tertiary muted). */}
      <section className="pt-24 pb-10">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center justify-center gap-2 text-xs text-surface-500">
                <li><Link href="/blog" className="hover:text-surface-950 transition-colors">Blog</Link></li>
                <li><span className="text-surface-300 mx-0.5">/</span></li>
                <li className="text-surface-700 truncate max-w-[260px]">{post.name}</li>
              </ol>
            </nav>

            {category && (
              <Badge className="mb-5 border-primary-100 bg-primary-50 text-primary-700">
                {category.name}
              </Badge>
            )}

            <h1
              className="font-medium text-surface-950 text-balance"
              style={{
                fontSize: 'clamp(1.875rem, 1.5rem + 1.875vw, 3rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              {post.name}
            </h1>

            {post.excerpt && (
              <p
                className="mt-5 text-surface-500 max-w-2xl mx-auto text-pretty"
                style={{
                  fontSize: 'clamp(1.05rem, 1rem + 0.35vw, 1.25rem)',
                  lineHeight: 1.45,
                }}
              >
                {post.excerpt}
              </p>
            )}

            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              {author && (
                <Link href={`/team/${author.slug}`} className="flex items-center gap-2.5 group">
                  {author['profile-picture']?.url && (
                    <img
                      src={avatarImage(author['profile-picture'].url)}
                      alt={author.name}
                      width="80"
                      height="80"
                      loading="lazy"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium text-surface-950 group-hover:text-primary-600 transition-colors">
                    {author.name}
                  </span>
                </Link>
              )}

              {/* Publication & freshness dates — visible freshness signals improve E-E-A-T */}
              {post['published-date'] && (
                <>
                  <span className="w-1 h-1 rounded-full bg-surface-300" aria-hidden="true" />
                  <time dateTime={post['published-date']} className="text-sm text-surface-500">
                    {new Date(post['published-date']).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                </>
              )}
              {post['last-updated'] && post['last-updated'] !== post['published-date'] && (
                <>
                  <span className="w-1 h-1 rounded-full bg-surface-300" aria-hidden="true" />
                  <span className="text-sm text-surface-500">
                    Updated{' '}
                    <time dateTime={post['last-updated']}>
                      {new Date(post['last-updated']).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </time>
                  </span>
                </>
              )}
              {post['time-to-read'] && (
                <>
                  <span className="w-1 h-1 rounded-full bg-surface-300" aria-hidden="true" />
                  <span className="text-sm text-surface-500">{post['time-to-read']}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image — shadow softened from `shadow-lg` to `shadow-sm`
          so it sits cleanly against the off-white page rather than floating */}
      {post.thumbnail?.url && (
        <div className="pb-12">
          <div className="px-4 md:px-8 lg:px-12">
            <div className="max-w-5xl mx-auto">
              <img
                src={heroImage(post.thumbnail.url).src}
                alt={post.thumbnail.alt || post.name}
                width="1200"
                height="675"
                className="w-full rounded-2xl shadow-sm"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content — sidebar stacks: TOC → Explore with AI → dark CTA card → Share → author */}
      <SectionContainer padding="sm">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-16">
            {/* Article Body */}
            <article className="min-w-0">
              {/* Direct Answer (TL;DR) — the AEO citation surface.
                  Renders above body content when present. Tagged with
                  data-speakable so the Speakable JSON-LD picks it up
                  alongside the H1. This is what AI engines extract
                  when citing the page in answers. */}
              {post['direct-answer'] && (
                <div className="mb-10 not-prose border-l-4 border-primary-500 bg-primary-50 px-5 py-4 sm:px-6 sm:py-5 rounded-r-lg">
                  <p
                    className="text-base sm:text-lg text-surface-900 leading-relaxed m-0"
                    data-speakable
                  >
                    {post['direct-answer']}
                  </p>
                </div>
              )}

              {linkedContent ? (
                <BlogContent html={linkedContent} visuals={post.visuals} />
              ) : (
                <p className="text-surface-500">No content available for this post.</p>
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start space-y-9">
              <BlogTOC items={toc} />
              <BlogExploreWithAI articleUrl={canonicalUrl} />
              <BlogCTACard />
              <BlogShareRow articleUrl={canonicalUrl} articleTitle={post.name} />

              {author && (
                <Link
                  href={`/team/${author.slug}`}
                  className="block group"
                >
                  <span className="block text-[11px] font-medium text-surface-500 uppercase tracking-[0.08em] mb-3">
                    Written by
                  </span>
                  <div className="flex items-center gap-3">
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
                    <div>
                      <div className="text-sm font-medium text-surface-950 group-hover:text-primary-600 transition-colors">
                        {author.name}
                      </div>
                      {author['job-title'] && (
                        <div className="text-xs text-surface-500">{author['job-title']}</div>
                      )}
                    </div>
                  </div>
                </Link>
              )}
            </aside>
          </div>
        </div>
      </SectionContainer>

      {/* FAQ — open layout from auto-extracted H2 headings */}
      {faqItems.length >= 2 && (
        <FAQ
          title="Frequently Asked Questions"
          subtitle={`Key takeaways from this article on ${post.name.length > 50 ? post.name.slice(0, 47) + '…' : post.name}.`}
          items={faqItems}
          showFooter={false}
          skipSchema
          variant="open"
        />
      )}

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
