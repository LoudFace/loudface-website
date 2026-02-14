/**
 * SEO for [Industry] — Dynamic Route Template
 *
 * Programmatic SEO hub page targeting "SEO for [industry]" keywords.
 * Sections: Hero, Pain Points, Strategy (dark), Results, FAQ, CTA
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import {
  fetchSeoPages,
  fetchHomepageData,
  getAccessToken,
  getEmptyHomepageData,
} from '@/lib/cms-data';
import {
  Button,
  BulletLabel,
  Card,
  SectionContainer,
  SectionHeader,
} from '@/components/ui';
import { FAQ, CTA, EditorialProse, DeliverablesGrid } from '@/components/sections';
import { avatarImage, logoImage, thumbnailImage } from '@/lib/image-utils';
import { asset } from '@/lib/assets';
import type { SeoPage, CaseStudy, BlogPost, Testimonial } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// --- Helper extractors ---

function extractFaqItems(page: SeoPage) {
  const items: { question: string; answer: string }[] = [];
  for (let i = 1; i <= 5; i++) {
    const q = page[`faq-${i}-question` as keyof SeoPage] as string | undefined;
    const a = page[`faq-${i}-answer` as keyof SeoPage] as string | undefined;
    if (q && a) items.push({ question: q, answer: a });
  }
  return items;
}

function extractPainPoints(page: SeoPage) {
  const points: { title: string; desc: string }[] = [];
  for (let i = 1; i <= 3; i++) {
    const title = page[`pain-point-${i}-title` as keyof SeoPage] as string | undefined;
    const desc = page[`pain-point-${i}-desc` as keyof SeoPage] as string | undefined;
    if (title && desc) points.push({ title, desc });
  }
  return points;
}

function extractStrategySteps(page: SeoPage) {
  const steps: { title: string; desc: string }[] = [];
  for (let i = 1; i <= 4; i++) {
    const title = page[`strategy-step-${i}-title` as keyof SeoPage] as string | undefined;
    const desc = page[`strategy-step-${i}-desc` as keyof SeoPage] as string | undefined;
    if (title && desc) steps.push({ title, desc });
  }
  return steps;
}

function extractStats(page: SeoPage) {
  const stats: { value: string; label: string }[] = [];
  for (let i = 1; i <= 3; i++) {
    const value = page[`stat-${i}-value` as keyof SeoPage] as string | undefined;
    const label = page[`stat-${i}-label` as keyof SeoPage] as string | undefined;
    if (value && label) stats.push({ value, label });
  }
  return stats;
}

// --- Metadata ---

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const accessToken = getAccessToken();
  if (!accessToken) return { title: 'SEO Services' };

  const seoPages = await fetchSeoPages(accessToken);
  const page = seoPages.find((p) => p.slug === slug);

  if (!page) {
    return { title: 'SEO Services' };
  }

  const title = page['meta-title'] || page['hero-headline'] || page.name;
  const description =
    page['meta-description'] ||
    page['hero-description'] ||
    `Professional SEO services for ${page.name}. Get found by your ideal customers.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/seo-for/${slug}`,
    },
    openGraph: {
      title: `${title} | LoudFace`,
      description,
      type: 'website',
      url: `/seo-for/${slug}`,
    },
  };
}

// --- Page ---

export default async function SeoForIndustryPage({ params }: PageProps) {
  const { slug } = await params;

  const accessToken = getAccessToken();
  if (!accessToken) notFound();

  // Fetch SEO pages and homepage data in parallel
  const [seoPages, cmsData] = await Promise.all([
    fetchSeoPages(accessToken),
    fetchHomepageData(accessToken).catch(() => getEmptyHomepageData()),
  ]);

  const page = seoPages.find((p) => p.slug === slug);
  if (!page) notFound();

  const faqItems = extractFaqItems(page);
  const painPoints = extractPainPoints(page);
  const strategySteps = extractStrategySteps(page);
  const stats = extractStats(page);

  // Get related case studies filtered by matching industry
  const relatedStudies: CaseStudy[] = page.industry
    ? cmsData.caseStudies
        .filter(
          (cs) =>
            cs.industry === page.industry ||
            cs.industries?.includes(page.industry!)
        )
        .slice(0, 3)
    : cmsData.caseStudies.slice(0, 3);

  const industryName =
    page.industry && cmsData.industries.get(page.industry)?.name;

  // Client logos for trust bar
  const showcaseClients = cmsData.allClients.filter(
    (c) => c['showcase-logo']
  );

  // Testimonial: prefer one from a related case study, fall back to any with body + image
  let testimonial: Testimonial | undefined;
  for (const study of relatedStudies) {
    if (study.testimonial) {
      const t = cmsData.testimonials.get(study.id);
      if (t?.['testimonial-body'] && t['profile-image']?.url) {
        testimonial = t;
        break;
      }
    }
  }
  if (!testimonial) {
    testimonial = cmsData.allTestimonials.find(
      (t) => t['testimonial-body'] && t['profile-image']?.url
    );
  }

  // Related blog posts: match by industry category, fall back to recent featured
  let relatedPosts: BlogPost[] = [];
  if (industryName) {
    const industryLower = industryName.toLowerCase();
    relatedPosts = cmsData.blogPosts
      .filter((p) => {
        const cat = p.category
          ? cmsData.categories.get(p.category)
          : undefined;
        return cat?.name.toLowerCase().includes(industryLower);
      })
      .slice(0, 3);
  }
  if (relatedPosts.length === 0) {
    relatedPosts = cmsData.blogPosts
      .filter((p) => p.featured)
      .slice(0, 3);
  }
  if (relatedPosts.length === 0) {
    relatedPosts = cmsData.blogPosts.slice(0, 3);
  }

  const canonicalUrl = `https://www.loudface.co/seo-for/${slug}`;

  // --- Structured Data ---
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.loudface.co/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'SEO Services by Industry',
        item: 'https://www.loudface.co/seo-for',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page['hero-headline'] || page.name,
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page['hero-headline'] || page.name,
    description: page['meta-description'] || page['hero-description'],
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: 'Search Engine Optimization',
  };

  return (
    <>
      {/* Structured Data */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="service-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* 1. Hero (unchanged) */}
      <SectionContainer padding="lg">
        <div className="max-w-3xl">
          <BulletLabel>
            {industryName
              ? `SEO for ${industryName}`
              : 'Industry SEO'}
          </BulletLabel>

          <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900 leading-tight">
            {page['hero-headline'] || page.name}
          </h1>

          {page['hero-subtitle'] && (
            <p className="mt-4 text-lg md:text-xl text-primary-600 font-medium">
              {page['hero-subtitle']}
            </p>
          )}

          {page['hero-description'] && (
            <p className="mt-4 text-lg text-surface-600 leading-relaxed">
              {page['hero-description']}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="primary" size="lg" calTrigger>
              Get a free SEO audit
            </Button>
            <Button variant="outline" size="lg" href="#approach">
              See our approach
            </Button>
          </div>
        </div>
      </SectionContainer>

      {/* 2. Client Logos Bar */}
      {showcaseClients.length > 0 && (
        <SectionContainer padding="sm" className="bg-surface-50">
          <p className="text-center text-sm text-surface-500 mb-6">
            Trusted by leading {industryName ? `${industryName} ` : ''}companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-x-12 md:gap-y-8">
            {showcaseClients.map((client) => {
              const scale = client['logo-scale'] ?? 1;
              return (
                <div
                  key={client.id}
                  className="w-24 h-10 flex items-center justify-center"
                  style={scale !== 1 ? { transform: `scale(${scale})` } : undefined}
                >
                  <img
                    src={
                      logoImage(client['colored-logo']?.url) ||
                      asset('/images/placeholder-logo.svg')
                    }
                    loading="lazy"
                    alt={client.name}
                    className="max-w-full max-h-full object-contain grayscale opacity-60 transition-all duration-200 hover:grayscale-0 hover:opacity-100"
                  />
                </div>
              );
            })}
          </div>
        </SectionContainer>
      )}

      {/* 3. Pain Points */}
      {painPoints.length > 0 && (
        <SectionContainer>
          <SectionHeader
            title={page['pain-points-title'] || 'Common SEO Challenges'}
            highlightWord="Challenges"
            subtitle={`Why ${industryName || 'your industry'} companies struggle to rank.`}
          />

          <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {painPoints.map((point, i) => (
              <Card key={i}>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-surface-900">
                      {point.title}
                    </h3>
                    <p className="mt-2 text-surface-600">{point.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </SectionContainer>
      )}

      {/* 4. Editorial Prose — split at H2 boundaries with alternating sections */}
      {page['main-body'] && (
        <EditorialProse html={page['main-body']} industryName={industryName} />
      )}

      {/* 5. Strategy / Approach (dark section) */}
      {strategySteps.length > 0 && (
        <SectionContainer
          id="approach"
          padding="lg"
          className="bg-surface-800 text-surface-300"
        >
          <SectionHeader
            title={page['strategy-title'] || 'Our SEO Approach'}
            highlightWord="Approach"
            subtitle={page['strategy-intro']}
            variant="dark"
          />

          <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategySteps.map((step, i) => (
              <Card key={i} variant="glass">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2">{step.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </SectionContainer>
      )}

      {/* 6. Deliverables — parsed into a card grid */}
      {page['deliverables'] && (
        <DeliverablesGrid html={page['deliverables']} industryName={industryName} />
      )}

      {/* 7. Results */}
      {(stats.length > 0 || relatedStudies.length > 0) && (
        <SectionContainer padding="lg">
          <SectionHeader
            title={page['results-title'] || 'Real Results'}
            highlightWord="Results"
            subtitle={
              industryName
                ? `What we deliver for ${industryName} companies.`
                : 'What we deliver for our clients.'
            }
          />

          {/* Stats */}
          {stats.length > 0 && (
            <div className="mt-8 lg:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="text-center p-6 rounded-xl bg-surface-50 border border-surface-200"
                >
                  <div className="text-3xl md:text-4xl font-medium text-primary-600">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-surface-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Related Case Studies */}
          {relatedStudies.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-medium text-surface-900 mb-6">
                {industryName
                  ? `${industryName} Case Studies`
                  : 'Related Case Studies'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedStudies.map((study) => {
                  const client = study.client
                    ? cmsData.clients.get(study.client)
                    : undefined;
                  return (
                    <Link
                      key={study.slug}
                      href={`/case-studies/${study.slug}`}
                      className="group block bg-white rounded-xl border border-surface-200 overflow-hidden
                        transition-all duration-200 hover:border-surface-300 hover:shadow-md
                        focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
                    >
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={
                            thumbnailImage(
                              study['main-project-image-thumbnail']?.url
                            ) || asset('/images/placeholder.webp')
                          }
                          alt={study['project-title'] || study.name}
                          width="800"
                          height="450"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                          {study['project-title'] || study.name}
                        </h4>
                        {client?.name && (
                          <p className="mt-1 text-sm text-surface-500">
                            {client.name}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </SectionContainer>
      )}

      {/* 8. Testimonial */}
      {testimonial && testimonial['testimonial-body'] && (
        <section className="bg-surface-50 py-16 md:py-24">
          <div className="px-4 md:px-8 lg:px-12">
            <div className="max-w-3xl mx-auto text-center">
              <svg className="w-8 h-8 mx-auto mb-6 text-surface-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote
                className="text-xl md:text-2xl text-surface-800 leading-relaxed [&>p]:m-0"
                dangerouslySetInnerHTML={{ __html: testimonial['testimonial-body'] }}
              />
              <div className="mt-6 flex items-center justify-center gap-3">
                {testimonial['profile-image']?.url && (
                  <img
                    src={avatarImage(testimonial['profile-image'].url)}
                    alt={testimonial.name}
                    width="80"
                    height="80"
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="text-left">
                  <div className="font-medium text-surface-900">{testimonial.name}</div>
                  {testimonial.role && (
                    <div className="text-sm text-surface-500">{testimonial.role}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9. FAQ */}
      {faqItems.length > 0 && (
        <FAQ
          title={`SEO for ${industryName || page.name}: Your Questions Answered`}
          items={faqItems}
        />
      )}

      {/* 10. Related Blog Posts */}
      {relatedPosts.length > 0 && (
        <SectionContainer>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-medium text-surface-900">
              Related insights
            </h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((post) => {
              const postCategory = post.category
                ? cmsData.categories.get(post.category)
                : undefined;
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-white rounded-xl border border-surface-200 overflow-hidden
                    transition-all duration-200 hover:border-surface-300 hover:shadow-md
                    focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={
                        thumbnailImage(post.thumbnail?.url) ||
                        asset('/images/placeholder.webp')
                      }
                      alt={post.name}
                      width="800"
                      height="450"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    {postCategory && (
                      <span className="inline-block px-2 py-0.5 bg-surface-100 text-surface-600 rounded text-xs font-medium mb-2">
                        {postCategory.name}
                      </span>
                    )}
                    <h3 className="font-medium text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {post.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </SectionContainer>
      )}

      {/* 11. CTA */}
      <CTA
        title={page['cta-title'] || `Ready to Dominate ${industryName || 'Your'} Search Results?`}
        subtitle={
          page['cta-subtitle'] ||
          "Book a free SEO audit and we'll show you exactly what's holding your site back."
        }
      />
    </>
  );
}
