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
import { avatarImage, heroImage } from '@/lib/image-utils';
import { BlogContent, CodeBlockEnhancer, DirectAnswer, FloatingToc } from '@/components/blog';
import { CTA, FAQ, RelatedComparisons } from '@/components/sections';
import { buildNoIndexMetadata, buildPageMetadata, truncateSeoTitle, truncateSeoDescription, rewriteLegacyUrls } from '@/lib/seo-utils';
import {
  extractFAQFromHTML,
  buildFAQSchema,
  buildSpeakableSchema,
  buildArticleAuthorSchema,
  buildOrganizationPublisher,
  buildImageObject,
} from '@/lib/schema-utils';
import { autoLinkServiceMentions, extractDirectAnswer, stripFirstTldr, wrapCodeBlocks } from '@/lib/html-utils';
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
  normalized = normalized.replace(/[“”]/g, '"');
  normalized = normalized.replace(/[‘’]/g, "'");

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
  // column is ~640px on desktop (12-col grid, prose spans 6 cols). Letting
  // tables keep natural column widths and scrolling the WRAPPER when they
  // exceed the column is the standard editorial pattern, and preserves
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

// ───────────────────────────────────────────────────────────────────────────
// Pattern inference — read the post's slug to figure out which editorial
// pattern it follows. This drives the dark-band label on the hero so the
// surface signals "AEO Playbook" vs "Comparison" vs "Listicle" etc.
//
// Patterns mirror the six in the strategy doc:
//   - listicle (best/top/15)
//   - comparison (X vs Y)
//   - playbook (AEO playbooks, guides, how-to)
//   - aeo (anything AEO/citation/answer-engine)
//   - industry (industry-specific)
//   - pricing (pricing/cost)
//   - founder (founder bylines / opinions)
// Falls back to "Field notes" for anything that doesn't fit.
// ───────────────────────────────────────────────────────────────────────────
type PatternKey =
  | 'listicle'
  | 'comparison'
  | 'playbook'
  | 'aeo'
  | 'industry'
  | 'pricing'
  | 'founder'
  | 'field';

function inferPattern(slug: string, postName?: string): { key: PatternKey; label: string } {
  const s = slug.toLowerCase();
  const name = (postName || '').toLowerCase();

  if (/(\d+\+?-best|best-\d+|best-.*-(agencies|tools|software|platforms)|ranked|top-\d+)/.test(s)) {
    return { key: 'listicle', label: 'Ranked listicle' };
  }
  if (/-vs-/.test(s)) {
    return { key: 'comparison', label: 'Comparison' };
  }
  if (/(pricing|cost|price)/.test(s)) {
    return { key: 'pricing', label: 'Pricing breakdown' };
  }
  if (/(playbook|guide|how-to|complete-guide|tutorial|in-\d+-minutes|audit)/.test(s)) {
    return { key: 'playbook', label: 'Playbook' };
  }
  if (/(aeo|answer-engine|citation|share-of-answer|schema)/.test(s)) {
    return { key: 'aeo', label: 'AEO research' };
  }
  if (/(b2b-saas|industry|vertical|fintech|healthcare|cybersecurity)/.test(s)) {
    return { key: 'industry', label: 'Industry brief' };
  }
  if (/(why-loudface|founder|opinion|why-i|lessons|what-i-learned)/.test(name)) {
    return { key: 'founder', label: 'Founder byline' };
  }
  return { key: 'field', label: 'Field notes' };
}

// Pattern-aware CTA copy. The generic "Ready to grow your business?" was
// the same on every post — replaced with a contextual offer that ties to
// the playbook the visitor just read. Falls back to the original copy for
// patterns where a specific offer doesn't apply.
function ctaForPattern(key: PatternKey): {
  title: string;
  subtitle: string;
  ctaText: string;
} {
  switch (key) {
    case 'aeo':
    case 'playbook':
      return {
        title: 'Get your AEO readiness audit. Free 30-min review.',
        subtitle:
          "We'll run your top 5 pages through the same audit framework referenced in this article. You get the gaps, the fixes, and projected citation lift.",
        ctaText: 'Book the audit',
      };
    case 'listicle':
      return {
        title: "See where you'd land on this list.",
        subtitle:
          "We'll score your site against the same criteria used in this ranking and tell you honestly whether we're the right fit or not.",
        ctaText: 'Book a 30-min review',
      };
    case 'comparison':
      return {
        title: 'Pick the right tool. We help you decide.',
        subtitle:
          "We've shipped on both. Tell us your stack and we'll tell you which option fits — and where each one breaks.",
        ctaText: 'Talk to us',
      };
    case 'pricing':
      return {
        title: "Get a real number, not a 'starting at' figure.",
        subtitle:
          'Send us the scope. We send back a fixed-fee proposal within 48 hours, with milestones, deliverables, and what we will and will not do.',
        ctaText: 'Request a proposal',
      };
    case 'industry':
      return {
        title: 'Built for your vertical. Not retrofitted.',
        subtitle:
          "We've shipped sites for SaaS companies in your industry. Let's discuss the patterns that work — and the ones that don't.",
        ctaText: 'Book an intro call',
      };
    case 'founder':
      return {
        title: 'Talk to the team behind this take.',
        subtitle:
          "If this resonated, let's see whether we'd be a fit. Our model: fixed fee, fast turnaround, measurable outcomes.",
        ctaText: 'Book a 30-min call',
      };
    case 'field':
    default:
      return {
        title: 'Ready to grow your business?',
        subtitle: "Let's discuss how we can help you achieve your goals.",
        ctaText: 'Book a call',
      };
  }
}

function formatHeroDate(iso: string | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
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

  // ── Direct Answer ───────────────────────────────────────────────────────
  // Prefer the curated CMS field; fall back to extracting a TL;DR-style
  // paragraph from the article body for posts that haven't been backfilled.
  const directAnswerText =
    post['direct-answer']?.trim() ||
    extractDirectAnswer(post.content) ||
    null;

  // Always strip a leading TL;DR paragraph from the body when a Direct
  // Answer block is rendered above. Without this, posts where the curated
  // directAnswer was lifted from a TL;DR paragraph end up showing the same
  // span twice. stripFirstTldr is conservative — it only removes the FIRST
  // <p> beginning with a TL;DR marker, so posts that legitimately reference
  // "TL;DR" later in the body keep that content.
  const contentForBody = directAnswerText
    ? stripFirstTldr(post.content)
    : post.content;

  const { toc, html: processedContent } = extractTocAndAddIds(contentForBody);
  // Inject internal service links AFTER toc/heading processing so the
  // auto-linker only touches paragraph-level prose.
  const linkedContent = autoLinkServiceMentions(processedContent);
  // Wrap <pre> code blocks with a header band (language + copy affordance).
  // Done last so the wrapper doesn't interfere with toc/auto-linker which
  // operate on prose-level tags only.
  const finalContent = wrapCodeBlocks(linkedContent);
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
  const speakableSchema = buildSpeakableSchema(post.name, canonicalUrl);

  const pattern = inferPattern(slug, post.name);
  const publishedDateStr = formatHeroDate(post['published-date']);
  const updatedDateStr = formatHeroDate(post['last-updated']);
  const showUpdate =
    updatedDateStr && post['last-updated'] !== post['published-date'];

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

      {/* ─────────────────────────────────────────────────────────────────
          Editorial hero — left-aligned, asymmetric, with a dark top band
          carrying the pattern label + update date. Replaces the previous
          centered-stack (breadcrumb · badge · H1 · excerpt · author chip ·
          dates) template that brand.md flagged as Webflow-Marketplace-tier.
          The DirectAnswer block lives inside the hero so the most useful
          40–60 words on the page are visible above the fold on mobile.
          ───────────────────────────────────────────────────────────────── */}
      <article className="blog-hero">
        {/* Dark top band — pattern tag + update timestamp, mono caps */}
        <div className="blog-hero__band">
          <div className="blog-hero__band-inner">
            <nav aria-label="Breadcrumb" className="blog-hero__crumbs">
              <Link href="/blog">Blog</Link>
              <span aria-hidden="true">/</span>
              <span data-pattern={pattern.key}>{pattern.label}</span>
            </nav>
            <div className="blog-hero__stamp">
              {showUpdate && (
                <>
                  <time dateTime={post['last-updated']}>Updated {updatedDateStr}</time>
                  <span aria-hidden="true" className="blog-hero__sep">·</span>
                </>
              )}
              {publishedDateStr && (
                <time dateTime={post['published-date']}>{publishedDateStr}</time>
              )}
              {post['time-to-read'] && (
                <>
                  <span aria-hidden="true" className="blog-hero__sep">·</span>
                  <span>{post['time-to-read']}{/\bmin\b/i.test(post['time-to-read']) ? '' : ' min read'}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Editorial body — large H1, optional category eyebrow, byline. */}
        <div className="blog-hero__body">
          <div className="blog-hero__body-inner">
            {category && (
              <div className="blog-hero__eyebrow">
                <span aria-hidden="true" className="blog-hero__eyebrow-rule" />
                <span>{category.name}</span>
              </div>
            )}

            <h1 className="blog-hero__title">{post.name}</h1>

            {post.excerpt && (
              <p className="blog-hero__excerpt">{post.excerpt}</p>
            )}

            {/* DirectAnswer — the AEO-extractable summary block. */}
            {directAnswerText && (
              <DirectAnswer answer={directAnswerText} />
            )}

            {/* Byline row — author + credentialing.
                E-E-A-T signals matter for AEO; Perplexity weights author
                authority disproportionately. We surface the team page link
                + a short credential line so the byline does real work. */}
            <div className="blog-hero__byline">
              {author && (
                <Link href={`/team/${author.slug}`} className="blog-hero__author">
                  {author['profile-picture']?.url && (
                    <img
                      src={avatarImage(author['profile-picture'].url)}
                      alt={author.name}
                      width="80"
                      height="80"
                      loading="eager"
                      className="blog-hero__avatar"
                    />
                  )}
                  <span>
                    <span className="blog-hero__author-name">{author.name}</span>
                    {author['job-title'] && (
                      <span className="blog-hero__author-role">{author['job-title']}</span>
                    )}
                  </span>
                </Link>
              )}
              <span className="blog-hero__byline-cred" aria-label="Author credentials">
                <span className="blog-hero__byline-cred-line">
                  Webflow Premium Enterprise Partner
                </span>
                <span className="blog-hero__byline-cred-line">
                  AEO playbook shipped on 30+ B2B SaaS sites
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Featured image — sits between hero and article body, full-width
            on its own band so it can breathe. */}
        {post.thumbnail?.url && (
          <div className="blog-hero__featured">
            <div className="blog-hero__featured-inner">
              <img
                src={heroImage(post.thumbnail.url).src}
                alt={post.thumbnail.alt || post.name}
                width="1200"
                height="675"
                className="blog-hero__featured-img"
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        )}
      </article>

      {/* ─────────────────────────────────────────────────────────────────
          Article body — 12-col grid. TOC sticky at far-left on lg+; prose
          in 6 cols; right 3 cols reserved for future pull quotes / inline
          breakouts. Breakouts inside the prose body (.blog-prose .breakout)
          can span past the 6-col line via negative margin.
          ───────────────────────────────────────────────────────────────── */}
      <section className="blog-body">
        <div className="blog-body__grid">
          {/* TOC — sticky on lg+, hidden on mobile (replaced by floating
              button in a later P2 ship). */}
          {toc.length > 0 && (
            <aside className="blog-body__toc" aria-label="On this page">
              <nav>
                <span className="blog-body__toc-label">On this page</span>
                <ol>
                  {toc.map((item, i) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`} className="toc-link">
                        <span className="blog-body__toc-num" aria-hidden="true">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span>{item.text}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}

          <div className="blog-body__article">
            {finalContent ? (
              <>
                <BlogContent html={finalContent} visuals={post.visuals} />
                <CodeBlockEnhancer />
              </>
            ) : (
              <p className="text-surface-500">No content available for this post.</p>
            )}
          </div>

          {/* Mobile-only floating TOC. Hidden on lg+ via CSS. */}
          {toc.length > 0 && <FloatingToc items={toc} />}

          {/* Right margin — reserved for pull quotes and breakouts. Empty
              for now; populated in P1.4. */}
          <aside className="blog-body__margin" aria-hidden="true" />
        </div>
      </section>

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

      {/* ─────────────────────────────────────────────────────────────────
          Related posts — curated list with editorial reasoning.
          Replaces the 3-card thumbnail grid with a numbered list where
          each entry includes an editorial gloss explaining the
          connection. Authority over algorithm.
          ───────────────────────────────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="blog-related">
          <div className="blog-related__inner">
            <div className="blog-related__head">
              <div className="blog-related__label">
                <span aria-hidden="true" className="blog-related__rule" />
                <span>Keep reading</span>
              </div>
              <Link href="/blog" className="blog-related__all">
                All blog posts <span aria-hidden="true">→</span>
              </Link>
            </div>

            <ol className="blog-related__list">
              {relatedPosts.map((related, i) => {
                const relatedCategory = related.category ? categories.get(related.category) : undefined;
                const num = String(i + 1).padStart(2, '0');
                const readMin = related['time-to-read'] || '5 min';
                const readLabel = /\bmin\b/i.test(readMin) ? readMin : `${readMin} min`;
                // Heuristic editorial gloss based on shared category /
                // slug-keyword affinity. We don't store curated glosses in
                // the CMS yet — this gives a stronger signal than just
                // "Related posts" until we do.
                const gloss = relatedCategory
                  ? `Same category — ${relatedCategory.name.toLowerCase()}. Adjacent angle on the same problem.`
                  : `Deeper on a topic this piece touches but doesn't fully unpack.`;

                return (
                  <li key={related.slug} className="blog-related__item">
                    <Link href={`/blog/${related.slug}`} className="blog-related__row">
                      <span className="blog-related__num" aria-hidden="true">{num}</span>
                      <span className="blog-related__rowbody">
                        <span className="blog-related__title">{related.name}</span>
                        <span className="blog-related__gloss">{gloss}</span>
                      </span>
                      <span className="blog-related__read" aria-label={`${readLabel} read`}>{readLabel}</span>
                      <span aria-hidden="true" className="blog-related__arrow">→</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* CTA — copy varies by post pattern so it ties to the playbook the
          visitor just read. Falls back to the generic copy for patterns
          without a specific offer. */}
      <CTA variant="dark" {...ctaForPattern(pattern.key)} />
    </>
  );
}
