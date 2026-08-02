/**
 * SEO for [Industry] — programmatic route, v3 "electric stage" template.
 *
 * Composes `src/app/seo-for-v3/*` (SeoForPageV3), which borrows the approved
 * `/services/*` visual layer (service-v3.css, rendered inside a `.svcv3`
 * wrapper) so these pages are pixel-consistent with the rest of the v3 site
 * instead of forking a second stylesheet. Every section slot degrades
 * independently — a thin Sanity `seoPage` still renders a complete page.
 *
 * Migrated from the pre-v3 light template (SectionContainer/Card/CTA) on
 * 2026-08-01. Metadata, generateStaticParams, and the Breadcrumb + Service
 * JSON-LD are preserved verbatim; FAQPage schema is new (the accordion now
 * single-sources it).
 */
export const revalidate = 60;

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import '../../../seo-for-v3/seo-for-v3.css';
import { fetchItemBySlug, fetchSeoPages, fetchHomepageData } from '@/lib/cms-data';
import {
  buildNoIndexMetadata,
  buildPageMetadata,
  truncateSeoTitle,
  truncateSeoDescription,
} from '@/lib/seo-utils';
import { SeoForPageV3 } from '../../../seo-for-v3/SeoForPageV3';
import type {
  Deliverable,
  RelatedCard,
  QuoteSource,
  SeoForView,
} from '../../../seo-for-v3/SeoForPageV3';
import {
  CLIENT_DOMAINS,
  extractFaqItems,
  extractPainPoints,
  extractStats,
  extractStrategySteps,
  getSeoForImages,
  toPlainText,
} from '../../../seo-for-v3/data';
import type { SeoPage, BlogPost, CaseStudy, Testimonial } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Slugs with bespoke static pages at /seo-for/[slug] — excluded so Next.js
// doesn't generate duplicate routes from the dynamic Sanity-driven template.
const BESPOKE_SLUGS = new Set(['b2b', 'saas']);

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

/* ── deliverables: the CMS stores them as an HTML list ───────────────── */

function parseDeliverables(html: string): Deliverable[] {
  const items = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? [];
  const out: Deliverable[] = [];
  for (const item of items) {
    const text = toPlainText(item);
    if (!text) continue;
    // "Title: description" splits into a titled tile; otherwise the whole
    // line is the title (the template renders description-less tiles fine).
    const split = text.match(/^([^:]{3,60}):\s*(.+)$/);
    out.push(split ? { title: split[1].trim(), description: split[2].trim() } : { title: text });
  }
  return out.slice(0, 8);
}

/* ── page ────────────────────────────────────────────────────────────── */

export default async function SeoForIndustryPage({ params }: PageProps) {
  const { slug } = await params;

  const [page, cmsData] = await Promise.all([
    fetchItemBySlug<SeoPage>('seo-pages', slug),
    fetchHomepageData(),
  ]);
  if (!page) notFound();

  const painPoints = extractPainPoints(page);
  const strategySteps = extractStrategySteps(page);
  const stats = extractStats(page);
  const faqItems = extractFaqItems(page);

  const industryName = page.industry ? cmsData.industries.get(page.industry)?.name : undefined;

  /* related case studies — industry match, else the general reel */
  const relatedStudies: CaseStudy[] = page.industry
    ? cmsData.caseStudies
        .filter((cs) => cs.industry === page.industry || cs.industries?.includes(page.industry!))
        .slice(0, 3)
    : cmsData.caseStudies.slice(0, 3);
  const fallbackStudies =
    relatedStudies.length > 0 ? relatedStudies : cmsData.caseStudies.slice(0, 3);

  const images = await getSeoForImages(fallbackStudies.map((s) => s.slug));

  /* hero/cover artifact — first related study that has BOTH a screenshot and a
     hand-verified domain. No match → the template renders its solo hero. */
  const artifactStudy = fallbackStudies.find((s) => images[s.slug] && CLIENT_DOMAINS[s.slug]);
  const artifactClient = artifactStudy?.client
    ? cmsData.clients.get(artifactStudy.client)?.name
    : undefined;
  const heroShot = artifactStudy
    ? {
        url: images[artifactStudy.slug],
        domain: CLIENT_DOMAINS[artifactStudy.slug],
        alt: `${artifactStudy['project-title'] || artifactStudy.name} — a LoudFace client site`,
        client: artifactClient,
      }
    : undefined;

  /* testimonial — prefer one attached to a related study */
  let testimonial: Testimonial | undefined;
  for (const study of fallbackStudies) {
    if (!study.testimonial) continue;
    const t = cmsData.testimonials.get(study.id);
    if (t?.['testimonial-body']) {
      testimonial = t;
      break;
    }
  }
  if (!testimonial) {
    testimonial = cmsData.allTestimonials.find((t) => t['testimonial-body']);
  }
  const quote: QuoteSource | undefined = testimonial?.['testimonial-body']
    ? {
        bodyHtml: testimonial['testimonial-body'],
        name: testimonial.name,
        role: testimonial.role,
        avatarUrl: testimonial['profile-image']?.url,
      }
    : undefined;

  /* related insights — industry category, else featured, else recent */
  let relatedPosts: BlogPost[] = [];
  if (industryName) {
    const needle = industryName.toLowerCase();
    relatedPosts = cmsData.blogPosts
      .filter((p) => {
        const cat = p.category ? cmsData.categories.get(p.category) : undefined;
        return cat?.name.toLowerCase().includes(needle);
      })
      .slice(0, 3);
  }
  if (relatedPosts.length === 0) relatedPosts = cmsData.blogPosts.filter((p) => p.featured).slice(0, 3);
  if (relatedPosts.length === 0) relatedPosts = cmsData.blogPosts.slice(0, 3);

  const relatedWork: RelatedCard[] = fallbackStudies.map((study) => ({
    href: `/case-studies/${study.slug}`,
    title: study['project-title'] || study.name,
    meta: study.client ? cmsData.clients.get(study.client)?.name : undefined,
    imageUrl: images[study.slug],
  }));

  const relatedInsights: RelatedCard[] = relatedPosts.map((post) => ({
    href: `/blog/${post.slug}`,
    title: post.name,
    meta: post.category ? cmsData.categories.get(post.category)?.name : undefined,
    imageUrl: post.thumbnail?.url,
  }));

  const deliverables = page['deliverables'] ? parseDeliverables(page['deliverables']) : [];
  const label = industryName || page.name;

  const view: SeoForView = {
    eyebrow: industryName ? `SEO for ${industryName}` : 'Industry SEO',
    eyebrowTag: page['hero-subtitle'] || undefined,
    h1: page['hero-headline'] || page.name,
    sub: page['hero-description'] || page['hero-subtitle'] || undefined,
    heroShot,
    logosLead: `Trusted by leading ${industryName ? `${industryName} ` : ''}companies`,
    painTitle: page['pain-points-title'] || 'Common SEO challenges',
    painLede: `Why ${label} companies struggle to rank.`,
    painPoints,
    proseTitle: industryName ? `SEO for ${industryName}, in detail` : undefined,
    proseHtml: page['main-body'] || undefined,
    strategyTitle: page['strategy-title'] || 'Our SEO approach',
    strategyLede: page['strategy-intro'] || undefined,
    strategySteps,
    deliverables,
    resultsTitle: page['results-title'] || 'Real results',
    resultsLede: `What we deliver for ${label} companies.`,
    stats,
    quote,
    relatedWork,
    relatedWorkTitle: industryName ? `${industryName} case studies` : 'Related case studies',
    relatedPosts: relatedInsights,
    faqTitle: `SEO for ${label}: your questions answered`,
    faqItems,
    ctaTitle: page['cta-title'] || `Ready to grow ${label} search?`,
    ctaSubtitle:
      page['cta-subtitle'] ||
      "Book a free SEO audit and we'll show you exactly what's holding your site back.",
    coverShot: heroShot,
  };

  /* ── structured data ───────────────────────────────────────────────── */

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
    <div className="svcv3">
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <SeoForPageV3 view={view} />
    </div>
  );
}
