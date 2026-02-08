/**
 * Case Study Detail Page
 *
 * Structure:
 * - Hero with client branding
 * - Results strip
 * - Main content (body + sidebar)
 * - Testimonial
 * - Related work
 * - CTA
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import { fetchHomepageData, getAccessToken, getEmptyHomepageData } from '@/lib/cms-data';
import { asset } from '@/lib/assets';
import { heroImage, avatarImage, thumbnailImage, optimizeImage } from '@/lib/image-utils';
import { getContrastColor } from '@/lib/color-utils';
import { Button, SectionContainer } from '@/components/ui';
import { CTA } from '@/components/sections';
import type {
  CaseStudy,
  Client,
  Testimonial,
  Industry,
  Technology,
  ServiceCategory,
} from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Extract TOC from main-body HTML
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
  const cmsData = accessToken
    ? await fetchHomepageData(accessToken)
    : getEmptyHomepageData();

  const study = cmsData.caseStudies.find((s) => s.slug === slug);

  if (!study) {
    return {
      title: 'Case Study Not Found',
    };
  }

  const projectTitle = study['project-title'] || study.name;
  const description = study['paragraph-summary'] || `Case study: ${projectTitle}`;

  return {
    title: projectTitle,
    description,
    alternates: {
      canonical: `/case-studies/${slug}`,
    },
    openGraph: {
      title: `${projectTitle} | LoudFace`,
      description,
      type: 'article',
      url: `/case-studies/${slug}`,
      images: study['main-project-image-thumbnail']?.url
        ? [{ url: study['main-project-image-thumbnail'].url }]
        : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;

  const accessToken = getAccessToken();
  const cmsData = accessToken
    ? await fetchHomepageData(accessToken)
    : getEmptyHomepageData();

  const {
    caseStudies,
    clients: clientsMap,
    testimonials: testimonialsMap,
    allTestimonials,
    industries: industriesMap,
    technologies: technologiesMap,
    serviceCategories: serviceCategoriesMap,
    blogPosts,
  } = cmsData;

  const study = caseStudies.find((s) => s.slug === slug) as (CaseStudy & { id: string }) | undefined;

  if (!study) {
    notFound();
  }

  // Helpers
  function getClient(id: string | undefined): Client | undefined {
    return id ? clientsMap.get(id) : undefined;
  }

  function getIndustry(id: string | undefined): Industry | undefined {
    return id ? industriesMap.get(id) : undefined;
  }

  function getTechnologies(ids: string[] | undefined): Technology[] {
    if (!ids) return [];
    return ids.map(id => technologiesMap.get(id)).filter((t): t is Technology => !!t);
  }

  function getServices(ids: string[] | undefined): ServiceCategory[] {
    if (!ids) return [];
    return ids.map(id => serviceCategoriesMap.get(id)).filter((s): s is ServiceCategory => !!s);
  }

  function getTestimonial(caseStudyId: string): Testimonial | undefined {
    const indexed = testimonialsMap.get(caseStudyId);
    if (indexed) return indexed;
    if (study?.testimonial) {
      return allTestimonials.find((t) => t.id === study.testimonial);
    }
    return undefined;
  }

  // Data
  const client = getClient(study.client);
  const industry = getIndustry(study.industry);
  const technologies = getTechnologies(study.technologies);
  const services = getServices(study['services-provided']);
  const testimonial = getTestimonial(study.id);

  const clientColor = study['client-color'] || 'var(--color-primary-500)';
  const textColor = getContrastColor(clientColor);
  const websiteUrl = study['website-link'] || study['visit-the-website'];

  const results = [
    { number: study['result-1---number'], title: study['result-1---title'] },
    { number: study['result-2---number'], title: study['result-2---title'] },
    { number: study['result-3---number'], title: study['result-3---title'] },
  ].filter(r => r.number);

  const relatedStudies = caseStudies.filter(s => s.slug !== slug).slice(0, 3);
  const { toc, html: processedBody } = extractTocAndAddIds(study['main-body']);

  const projectTitle = study['project-title'] || study.name;
  const canonicalUrl = `https://www.loudface.co/case-studies/${slug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co/' },
      { '@type': 'ListItem', position: 2, name: 'Case Studies', item: 'https://www.loudface.co/case-studies' },
      { '@type': 'ListItem', position: 3, name: projectTitle },
    ],
  };

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: projectTitle,
    description: study['paragraph-summary'] || `Case study: ${projectTitle}`,
    image: study['main-project-image-thumbnail']?.url,
    author: { '@type': 'Organization', name: 'LoudFace', url: 'https://www.loudface.co' },
    publisher: { '@type': 'Organization', name: 'LoudFace' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
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
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero */}
      <section
        className="pt-24 pb-12"
        style={{ background: clientColor }}
      >
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm opacity-70" style={{ color: textColor }}>
                <li><Link href="/case-studies" className="hover:opacity-100">Case Studies</Link></li>
                <li><span className="mx-1">/</span></li>
                <li className="opacity-100">{projectTitle}</li>
              </ol>
            </nav>

            {client?.['light-logo']?.url && (
              <img
                src={optimizeImage(client['light-logo'].url, 120)}
                alt={client.name}
                width="120"
                height="24"
                className="h-6 mb-4 opacity-80"
              />
            )}

            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-medium leading-tight"
              style={{ color: textColor }}
            >
              {projectTitle}
            </h1>

            {study['paragraph-summary'] && (
              <p
                className="mt-4 text-lg max-w-2xl opacity-90"
                style={{ color: textColor }}
              >
                {study['paragraph-summary']}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {industry && (
                <span className="px-3 py-1 text-sm rounded-full bg-white/15" style={{ color: textColor }}>
                  {industry.name}
                </span>
              )}
              {study.country && (
                <span className="px-3 py-1 text-sm rounded-full bg-white/15" style={{ color: textColor }}>
                  {study.country}
                </span>
              )}
              {/* TODO: Re-enable Visit site button when ready */}
              {/* {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  style={{ color: textColor }}
                >
                  Visit site
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )} */}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      {study['main-project-image-thumbnail']?.url && (() => {
        const hero = heroImage(study['main-project-image-thumbnail'].url);
        return (
          <div className="bg-white pt-12 md:pt-16">
            <div className="px-4 md:px-8 lg:px-12">
              <div className="max-w-5xl mx-auto">
                <img
                  src={hero.src}
                  srcSet={hero.srcset}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                  alt={study['main-project-image-thumbnail'].alt || projectTitle}
                  width="1200"
                  height="675"
                  className="w-full rounded-xl shadow-lg"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Content */}
      <SectionContainer className="bg-white" padding="sm">
        <div className="max-w-5xl mx-auto">
          {/* Results & TOC Header */}
          <div className="mb-10 pb-8 border-b border-surface-200">
            {/* Key Results */}
            {results.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-surface-500 uppercase tracking-wide mb-4">Key Results</h3>
                <div className={`grid gap-4 ${
                  results.length === 1 ? 'grid-cols-1' :
                  results.length === 2 ? 'grid-cols-2' :
                  'grid-cols-1 sm:grid-cols-3'
                }`}>
                  {results.map((result, i) => (
                    <div key={i} className="flex items-baseline gap-3 p-4 rounded-lg bg-surface-50 border-l-4" style={{ borderLeftColor: clientColor }}>
                      <span className="text-2xl md:text-3xl font-medium text-surface-900">{result.number}</span>
                      <span className="text-sm text-surface-600">{result.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Table of Contents - Mobile only */}
            {toc.length > 0 && (
              <nav className="toc lg:hidden">
                <h3 className="text-sm font-medium text-surface-500 uppercase tracking-wide mb-4">On this page</h3>
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="toc-link text-sm text-surface-600 hover:text-primary-600 transition-colors"
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12">
            {/* Article Body */}
            <article className="min-w-0">
              {processedBody ? (
                <div className="case-study-prose" dangerouslySetInnerHTML={{ __html: processedBody }} />
              ) : (
                <p className="text-surface-500">No content available for this case study.</p>
              )}
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start space-y-8">
              {/* Table of Contents */}
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

              {/* Services */}
              {services.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-surface-500 uppercase tracking-wide mb-3">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {services.map(svc => (
                      <span key={svc.id} className="px-3 py-1 bg-surface-100 rounded text-sm text-surface-700">
                        {svc.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              {technologies.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-surface-500 uppercase tracking-wide mb-3">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map(tech => (
                      <span key={tech.id} className="px-3 py-1 bg-surface-100 rounded text-sm text-surface-700">
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Client Info */}
              {(study.country || study['company-size']) && (
                <div>
                  <h3 className="text-sm font-medium text-surface-500 uppercase tracking-wide mb-3">Client</h3>
                  <div className="space-y-2 text-sm text-surface-700">
                    {client?.name && <div>{client.name}</div>}
                    {study.country && <div>{study.country}</div>}
                    {study['company-size'] && <div>{study['company-size']} employees</div>}
                  </div>
                </div>
              )}

              {/* CTA */}
              <Button variant="primary" fullWidth calTrigger>
                Book an intro call
              </Button>
            </aside>
          </div>
        </div>
      </SectionContainer>

      {/* Testimonial */}
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

      {/* Related Work */}
      {relatedStudies.length > 0 && (
        <SectionContainer>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-medium text-surface-900">More work</h2>
            <Link href="/case-studies" className="text-sm font-medium text-surface-600 hover:text-primary-600 transition-colors">
              View all →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {relatedStudies.map((related) => {
              const relatedClient = getClient(related.client);
              const relatedColor = related['client-color'] || 'var(--color-primary-500)';

              return (
                <Link
                  key={related.slug}
                  href={`/case-studies/${related.slug}`}
                  className="group block bg-white rounded-xl border border-surface-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="h-1" style={{ background: relatedColor }} />
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={thumbnailImage(related['main-project-image-thumbnail']?.url) || asset('/images/placeholder.webp')}
                      alt={related['project-title'] || related.name}
                      width="800"
                      height="500"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                      {related['project-title'] || related.name}
                    </h3>
                    {relatedClient?.name && (
                      <p className="mt-1 text-sm text-surface-500">{relatedClient.name}</p>
                    )}
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
        title="Want similar results?"
        subtitle="Let's talk about your project."
        ctaText="Book a call"
      />
    </>
  );
}
