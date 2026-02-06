/**
 * Work / Case Studies Gallery Page
 *
 * Displays all case studies in a bento-style grid with:
 * - Hero section with stats
 * - CMS-powered gallery with client brand colors
 * - SEO structured data
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { fetchHomepageData, getAccessToken, getEmptyHomepageData } from '@/lib/cms-data';
import { getWorkContent } from '@/lib/content-utils';
import { asset } from '@/lib/assets';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { CaseStudy, Client, Industry, Technology } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Our Work | Case Studies & Portfolio',
  description: "Explore LoudFace's portfolio of successful Webflow projects. See real results including traffic growth, conversion improvements, and business transformations.",
  alternates: {
    canonical: '/work',
  },
};

export default async function WorkPage() {
  const content = getWorkContent();

  const accessToken = getAccessToken();
  const cmsData = accessToken
    ? await fetchHomepageData(accessToken)
    : getEmptyHomepageData();

  const {
    caseStudies: rawCaseStudies,
    clients: clientsMap,
    industries: industriesMap,
    technologies: technologiesMap,
  } = cmsData;

  const caseStudies = rawCaseStudies as (CaseStudy & { id: string })[];

  // Helpers
  function getClient(id: string | undefined): Client | undefined {
    if (!id) return undefined;
    return clientsMap.get(id);
  }

  function getIndustry(id: string | undefined): Industry | undefined {
    if (!id) return undefined;
    return industriesMap.get(id);
  }

  function getTechnologies(techIds: string[] | undefined): Technology[] {
    if (!techIds || !Array.isArray(techIds)) return [];
    return techIds
      .map(id => technologiesMap.get(id))
      .filter((tech): tech is Technology => tech !== undefined);
  }

  // Separate featured vs regular studies
  const featuredStudies = caseStudies.filter(s => s.featured);
  const regularStudies = caseStudies.filter(s => !s.featured);
  const sortedStudies = [...featuredStudies, ...regularStudies];

  // Structured Data
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Case Studies',
    description: "Explore LoudFace's portfolio of successful Webflow projects.",
    url: 'https://www.loudface.co/work',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: sortedStudies.map((study, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://www.loudface.co/work/${study.slug}`,
        name: study['project-title'] || study.name,
      })),
    },
  };

  return (
    <>
      <Script
        id="collection-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Hero Section */}
      <section className="pt-4">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="relative border border-surface-200 bg-surface-50 rounded-2xl overflow-hidden">
              <div className="p-8 md:p-12 lg:p-16 text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900">
                  {content.headline.split(content.highlightWord)[0]}
                  <span className="text-primary-600">{content.highlightWord}</span>
                  {content.headline.split(content.highlightWord)[1] || ''}
                </h1>

                <p className="mt-4 text-lg text-surface-600 max-w-2xl mx-auto">
                  {content.description}
                </p>

                <div className="mt-10 pt-8 border-t border-surface-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {content.stats.map((stat, i) => (
                      <div key={i} className="text-center">
                        <span className="text-2xl md:text-3xl lg:text-4xl font-medium text-surface-900">
                          {stat.number}
                        </span>
                        <p className="mt-1 text-sm text-surface-600">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <SectionContainer padding="lg">
        <SectionHeader
          title={content.galleryTitle}
          highlightWord={content.galleryHighlightWord}
          subtitle={content.gallerySubtitle}
        />

        {sortedStudies.length === 0 ? (
          <div className="mt-12 text-center py-16">
            <p className="text-surface-600">No case studies found. Check back soon!</p>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedStudies.map((study, index) => {
              const client = getClient(study.client);
              const industry = getIndustry(study.industry);
              const technologies = getTechnologies(study.technologies as string[] | undefined);
              const clientColor = study['client-color'] || 'var(--color-primary-500)';
              const secondaryColor = study['secondary-client-color'] || clientColor;
              const hasStats = study['result-1---number'] || study['result-2---number'];

              return (
                <Link
                  key={study.slug}
                  href={`/work/${study.slug}`}
                  className="group relative bg-white rounded-2xl border border-surface-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-surface-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
                >
                  {/* Client Color Accent Stripe */}
                  <div
                    className="h-1"
                    style={{ background: `linear-gradient(90deg, ${clientColor}, ${secondaryColor})` }}
                  />

                  {/* Image Section */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={study['main-project-image-thumbnail']?.url || asset('/images/placeholder.webp')}
                      alt={study['main-project-image-thumbnail']?.alt || study['project-title'] || study.name}
                      loading={index < 6 ? 'eager' : 'lazy'}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />

                    {industry && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-surface-700 shadow-sm">
                        {industry.name}
                      </span>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {technologies.slice(0, 3).map((tech) => (
                          <span key={tech.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-100 rounded text-2xs font-medium text-surface-600">
                            {tech.name}
                          </span>
                        ))}
                        {technologies.length > 3 && (
                          <span className="px-2 py-0.5 bg-surface-100 rounded text-2xs font-medium text-surface-500">
                            +{technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <h2 className="font-medium text-lg text-surface-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {study['project-title'] || study.name}
                    </h2>

                    {study['paragraph-summary'] && (
                      <p className="mt-2 text-sm text-surface-600 line-clamp-2">
                        {study['paragraph-summary']}
                      </p>
                    )}

                    {hasStats && (() => {
                      const hasBothStats = study['result-1---number'] && study['result-2---number'];
                      return (
                        <div className={`mt-4 ${hasBothStats ? 'grid grid-cols-2 gap-2' : ''}`}>
                          {study['result-1---number'] && (
                            <div
                              className="rounded-lg p-3"
                              style={{ backgroundColor: `${clientColor}10` }}
                            >
                              <span className="block text-xl font-medium text-surface-900">
                                {study['result-1---number']}
                              </span>
                              <span className="text-xs text-surface-600 line-clamp-1">
                                {study['result-1---title']}
                              </span>
                            </div>
                          )}
                          {study['result-2---number'] && (
                            <div
                              className="rounded-lg p-3"
                              style={{ backgroundColor: `${clientColor}10` }}
                            >
                              <span className="block text-xl font-medium text-surface-900">
                                {study['result-2---number']}
                              </span>
                              <span className="text-xs text-surface-600 line-clamp-1">
                                {study['result-2---title']}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="mt-4 pt-4 border-t border-surface-100 flex items-center justify-between">
                      <div className="flex-shrink-0">
                        {client?.['colored-logo']?.url ? (
                          <img
                            src={client['colored-logo'].url}
                            alt={client.name || 'Client'}
                            className="h-5 w-auto max-w-[100px] object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-sm font-medium text-surface-400">
                            {client?.name || ''}
                          </span>
                        )}
                      </div>

                      <span className="flex items-center gap-1.5 text-sm font-medium text-surface-500 group-hover:text-primary-600 transition-colors">
                        {content.viewProjectText}
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M3 8h10M9 4l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </SectionContainer>

      {/* Webflow Enterprise Partner Badge */}
      <a
        href="https://webflow.com/@loudface"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 transition-opacity hover:opacity-80"
        aria-label="Webflow Enterprise Partner"
      >
        <img
          loading="lazy"
          src={asset('/images/Enterprise-Blue-Badge.webp')}
          alt="Webflow Enterprise Partner Badge"
          className="w-24 h-auto drop-shadow-lg"
        />
      </a>
    </>
  );
}
