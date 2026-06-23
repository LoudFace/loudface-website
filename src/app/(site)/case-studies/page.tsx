/**
 * Case Studies Gallery Page
 *
 * Studies are grouped by discipline (AI Search & Organic Growth, Conversion
 * Optimization, Web Design & Branding) and filterable via tabs. The default
 * "All" view renders every group server-side, so all studies stay in the HTML
 * for SEO / AI-citation discovery; the tabs filter the view client-side.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import { fetchHomepageData } from '@/lib/cms-data';
import { getWorkContent } from '@/lib/content-utils';
import { asset } from '@/lib/assets';
import { getContrastColors } from '@/lib/color-utils';
import { caseStudyThumbnail, logoImage } from '@/lib/image-utils';
import { SectionContainer, SectionHeader } from '@/components/ui';
import { CTA } from '@/components/sections';
import type { CaseStudy, Client, Industry, Technology } from '@/lib/types';
import { CaseStudyGallery, type GalleryCard } from './CaseStudyGallery';

// Display order: lead with current offering, web design & branding last.
const DISCIPLINE_ORDER = [
  'AI Search & Organic Growth',
  'Conversion Optimization',
  'Web Design & Branding',
];
const FALLBACK_DISCIPLINE = 'Web Design & Branding';

export const metadata: Metadata = {
  title: 'Our Work | Case Studies & Portfolio',
  description:
    "LoudFace case studies across AI search & organic growth, conversion optimization, and web design & branding — real results: AI citations, conversion lifts, and launches.",
  alternates: { canonical: '/case-studies' },
  openGraph: {
    title: 'Case Studies & Portfolio | LoudFace',
    description:
      "LoudFace case studies across AI search & organic growth, conversion optimization, and web design & branding.",
    type: 'website',
    url: '/case-studies',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Case Studies' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Case Studies & Portfolio | LoudFace',
    description:
      "LoudFace case studies across AI search & organic growth, conversion optimization, and web design & branding.",
    images: ['/opengraph-image'],
  },
};

export default async function WorkPage() {
  const content = getWorkContent();
  const cmsData = await fetchHomepageData();

  const {
    caseStudies: rawCaseStudies,
    clients: clientsMap,
    industries: industriesMap,
    technologies: technologiesMap,
  } = cmsData;

  const caseStudies = rawCaseStudies as (CaseStudy & { id: string })[];

  const getClient = (id?: string): Client | undefined => (id ? clientsMap.get(id) : undefined);
  const getIndustry = (id?: string): Industry | undefined => (id ? industriesMap.get(id) : undefined);
  const getTechnologies = (techIds?: string[]): Technology[] =>
    !techIds || !Array.isArray(techIds)
      ? []
      : techIds.map((id) => technologiesMap.get(id)).filter((t): t is Technology => t !== undefined);

  const disciplineRank = (d: string) => {
    const i = DISCIPLINE_ORDER.indexOf(d);
    return i === -1 ? DISCIPLINE_ORDER.length : i;
  };

  // Resolve + order: by discipline (current offering first), then featured-first.
  const cards: GalleryCard[] = caseStudies
    .filter((s) => s.slug)
    .map((study) => {
      const client = getClient(study.client);
      const industry = getIndustry(study.industry);
      const technologies = getTechnologies(study.technologies as string[] | undefined);
      const clientColor = study['client-color'] || 'var(--color-primary-500)';
      const { textColor: statTextColor } = getContrastColors(clientColor);
      const thumb = caseStudyThumbnail(study['main-project-image-thumbnail']?.url);
      const discipline = study.discipline || FALLBACK_DISCIPLINE;

      return {
        slug: study.slug,
        title: study['project-title'] || study.name,
        summary: study['paragraph-summary'],
        discipline,
        thumbSrc: thumb.src || asset('/images/placeholder.webp'),
        thumbSrcset: thumb.srcset,
        thumbAlt: study['main-project-image-thumbnail']?.alt || study['project-title'] || study.name,
        industryName: industry?.name,
        technologies: technologies.map((t) => ({ id: t.id, name: t.name })),
        clientColor,
        statTextColor,
        result1Number: study['result-1---number'],
        result1Title: study['result-1---title'],
        result2Number: study['result-2---number'],
        result2Title: study['result-2---title'],
        clientLogoSrc: client?.['colored-logo']?.url ? logoImage(client['colored-logo'].url) : undefined,
        clientName: client?.name,
        featured: study.featured,
      };
    })
    .sort((a, b) => {
      const byDiscipline = disciplineRank(a.discipline) - disciplineRank(b.discipline);
      if (byDiscipline !== 0) return byDiscipline;
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });

  // Structured data — every study, in display order.
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Case Studies',
    description: "LoudFace's portfolio across AI search, conversion, and web design & branding.",
    url: 'https://www.loudface.co/case-studies',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: cards.map((card, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://www.loudface.co/case-studies/${card.slug}`,
        name: card.title,
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Case Studies' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <SectionContainer padding="none" className="pt-4">
        <div className="relative border border-surface-200 bg-surface-50 rounded-2xl overflow-hidden">
          <div className="p-8 md:p-12 lg:p-16 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900">
              {content.headline.split(content.highlightWord)[0]}
              <span className="text-primary-600">{content.highlightWord}</span>
              {content.headline.split(content.highlightWord)[1] || ''}
            </h1>
            <p className="mt-4 text-lg text-surface-600 max-w-2xl mx-auto">{content.description}</p>

            <div className="mt-10 pt-8 border-t border-surface-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {content.stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <span className="text-2xl md:text-3xl lg:text-4xl font-medium text-surface-900">{stat.number}</span>
                    <p className="mt-1 text-sm text-surface-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* Gallery */}
      <SectionContainer padding="lg">
        <SectionHeader
          title={content.galleryTitle}
          highlightWord={content.galleryHighlightWord}
          subtitle={content.gallerySubtitle}
        />

        {cards.length === 0 ? (
          <div className="mt-12 text-center py-16">
            <p className="text-surface-600">No case studies found. Check back soon!</p>
          </div>
        ) : (
          <CaseStudyGallery
            cards={cards}
            disciplineOrder={DISCIPLINE_ORDER}
            viewProjectText={content.viewProjectText}
          />
        )}
      </SectionContainer>

      <CTA />
    </>
  );
}
