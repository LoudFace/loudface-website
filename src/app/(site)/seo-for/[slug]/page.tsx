/**
 * SEO for [Industry] — programmatic route, the v11 industry template (IndustryPageV11, switched 2026-09-26).
 *
 * cmsIndustryView (seo-for-v11/views.ts) adapts the Sanity `seoPage` as this route's v3 view did (pain points,
 * strategy steps, stats, FAQ, related case studies, the testimonial); every section degrades independently, so a thin
 * `seoPage` still renders a complete page. Metadata, generateStaticParams, and the Breadcrumb + Service + FAQPage
 * JSON-LD are unchanged.
 */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../case-v11/case.css';
import '../../../seo-for-v11/industry.css';
import { fetchItemBySlug, fetchSeoPages } from '@/lib/cms-data';
import {
  buildNoIndexMetadata,
  buildPageMetadata,
  truncateSeoTitle,
  truncateSeoDescription,
} from '@/lib/seo-utils';
import { extractFaqItems, toPlainText } from '../../../seo-for-v3/data';
import { IndustryPageV11 } from '../../../seo-for-v11/IndustryPageV11';
import { relatedCards } from '../../../seo-for-v11/related';
import { getIndustryShell } from '../../../seo-for-v11/shell';
import { cmsIndustryView } from '../../../seo-for-v11/views';
import type { SeoPage } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Slugs with bespoke static pages at /seo-for/[slug] — excluded so Next.js
// doesn't generate duplicate routes from the dynamic Sanity-driven template.
const BESPOKE_SLUGS = new Set(['b2b', 'saas', 'hr-tech']);

export async function generateStaticParams() {
  const seoPages = await fetchSeoPages();
  return seoPages
    .filter((page) => !BESPOKE_SLUGS.has(page.slug))
    .map((page) => ({ slug: page.slug }));
}

/* ── metadata (unchanged from the pre-v3 template) ───────────────────── */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchItemBySlug<SeoPage>('seo-pages', slug);
  if (!page) return buildNoIndexMetadata('SEO Services');

  const title = truncateSeoTitle(page['meta-title'] || page['hero-headline'] || page.name);
  const rawDescription =
    page['meta-description'] ||
    page['hero-description'] ||
    `Professional SEO services for ${page.name}. Get found by your ideal customers with our data-driven SEO and AEO programs.`;
  let description = truncateSeoDescription(rawDescription);
  if (!description) {
    const extended = `${rawDescription} We build hands-free SEO programs that drive organic traffic and qualified leads for ${page.name} companies.`;
    description = truncateSeoDescription(extended) || extended;
  }

  return buildPageMetadata({ title, description, canonicalPath: `/seo-for/${slug}` });
}

/* ── page ────────────────────────────────────────────────────────────── */

export default async function SeoForIndustryPage({ params }: PageProps) {
  const { slug } = await params;

  const [page, { home, c, data, cards }, view] = await Promise.all([
    fetchItemBySlug<SeoPage>('seo-pages', slug),
    getIndustryShell(),
    cmsIndustryView(slug),
  ]);
  if (!page || !view) notFound();

  const faqItems = extractFaqItems(page);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'SEO Services by Industry',
        item: 'https://www.loudface.co/seo-for',
      },
      { '@type': 'ListItem', position: 3, name: page['hero-headline'] || page.name },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page['hero-headline'] || page.name,
    description: page['meta-description'] || page['hero-description'],
    provider: { '@type': 'Organization', name: 'LoudFace', url: 'https://www.loudface.co' },
    areaServed: 'Worldwide',
    serviceType: 'Search Engine Optimization',
  };

  // Single-sourced with the rendered accordion — only emitted when it renders.
  const faqSchema =
    faqItems.length >= 2
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: toPlainText(item.answer) },
          })),
        }
      : null;

  const schemas = [breadcrumbSchema, serviceSchema, ...(faqSchema ? [faqSchema] : [])];
  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <IndustryPageV11 v={view} c={c} home={home} data={data} related={relatedCards(cards, slug, view.work.map((w) => w.slug))} />
    </>
  );
}
