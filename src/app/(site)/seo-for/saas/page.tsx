/**
 * SEO for SaaS — bespoke content on the shared v3 SEO-for template.
 *
 * Migrated from the pre-v3 light layout (SectionContainer/Card/BulletLabel +
 * shared <Partners>/<FAQ>) on 2026-08-01, following the same playbook as the
 * sibling /seo-for/b2b route: the local JSON stays the content authority and
 * this route only adapts fields that have a real SeoForView slot.
 *
 * Where the JSON is richer than the template's furniture:
 *   - `system.layers` splits in two — the narrative (headline + body + the
 *     three layer intros) fills the light PROSE stage, and the concrete
 *     per-layer bullets become the "What's included" deliverables checklist,
 *     so no line of the old page is dropped.
 *   - `ctaBreak` (the mid-page free-audit offer) rides the prose stage, which
 *     is the only slot that carries contextual links.
 *   - `problem.items` carry both a subtitle and a body; the template's Pair
 *     has one prose slot, so both are kept rather than dropping either.
 *
 * Metadata, canonical, and the Breadcrumb + Service + FAQPage JSON-LD are
 * preserved verbatim. The old page emitted its own FAQPage and passed
 * `skipSchema` to the shared <FAQ> to avoid a duplicate block; the v3 template
 * renders its own accordion and emits no schema, so the single FAQPage here is
 * still the only one on the page.
 */
import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import '../../../seo-for-v3/seo-for-v3.css';
import { getSeoForSaasContent } from '@/lib/content-utils';
import { fetchHomepageData } from '@/lib/cms-data';
import { SeoForPageV3 } from '../../../seo-for-v3/SeoForPageV3';
import type { Deliverable, QuoteSource, SeoForView } from '../../../seo-for-v3/SeoForPageV3';
import { CLIENT_DOMAINS, getSeoForImages } from '../../../seo-for-v3/data';

const content = getSeoForSaasContent();

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  alternates: {
    canonical: '/seo-for/saas',
  },
  openGraph: {
    title: `${content.meta.title} | LoudFace`,
    description: content.meta.description,
    type: 'website',
    url: '/seo-for/saas',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${content.meta.title} | LoudFace`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: `${content.meta.title} | LoudFace`,
    description: content.meta.description,
    images: ['/opengraph-image'],
  },
};

/** Minimal escape — the JSON is hand-authored copy, not user input. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async function SaaSPage() {
  const caseStudySlugs = content.caseStudies.items.map((study) => study.slug);
  const images = await getSeoForImages(caseStudySlugs);

  // Client proof for the NIGHT quote stage. Prefer a testimonial attached to
  // one of the case studies this page already features, else the first usable
  // one — the same order /seo-for/b2b and the programmatic route use.
  // fetchHomepageData() is resilient and returns partial data, so a Sanity blip
  // leaves `quote` undefined and the template drops the stage entirely.
  const cmsData = await fetchHomepageData();
  const featured = new Set(caseStudySlugs);
  let testimonial = cmsData.caseStudies
    .filter((study) => featured.has(study.slug))
    .map((study) => cmsData.testimonials.get(study.id))
    .find((t) => t?.['testimonial-body']);
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

  // The first case study with both a real screenshot and a hand-verified domain
  // becomes the floating artifact. No match means the shared solo hero renders.
  const artifactStudy = content.caseStudies.items.find(
    (study) => images[study.slug] && CLIENT_DOMAINS[study.slug]
  );
  const heroShot = artifactStudy
    ? {
        url: images[artifactStudy.slug],
        domain: CLIENT_DOMAINS[artifactStudy.slug],
        alt: `${artifactStudy.name} — a LoudFace client site`,
        client: artifactStudy.name,
      }
    : undefined;

  // The three-layer system: narrative to the prose stage, bullets to the
  // deliverables checklist. Together they carry every string the old
  // "The System" section rendered.
  const layerNarrative = content.system.layers
    .map((layer) => `<h3>${esc(layer.title)}</h3><p>${esc(layer.subtitle)}</p>`)
    .join('');

  const deliverables: Deliverable[] = content.system.layers.flatMap((layer) =>
    layer.items.map((item) => ({ title: item, description: `${layer.title} layer` }))
  );

  const proseHtml = [
    `<p>${esc(content.system.body)}</p>`,
    layerNarrative,
    `<p>Want the search layer on its own? Explore our <a href="/services/seo-aeo">AEO agency services for B2B SaaS</a>.</p>`,
    `<h3>${esc(content.ctaBreak.headline)}</h3>`,
    `<p>${esc(content.ctaBreak.subheadline)} <a href="/audit">${esc(content.ctaBreak.primaryCta)}</a>, or <a href="/contact">${esc(content.ctaBreak.secondaryCta.replace(/^Or\s+/i, '').toLowerCase())}</a>.</p>`,
  ].join('');

  const view: SeoForView = {
    eyebrow: content.hero.eyebrow,
    h1: content.hero.headline,
    sub: content.hero.subheadline,
    heroShot,
    logosLead: 'Trusted by leading B2B SaaS companies',
    painTitle: content.problem.label,
    painLede: 'Why B2B SaaS traffic stops short of pipeline.',
    painPoints: content.problem.items.map((item) => ({
      title: item.title,
      desc: `${item.subtitle} ${item.body}`,
    })),
    proseTitle: content.system.headline,
    proseHtml,
    strategyTitle: content.howWeWork.headline,
    strategyLede: content.howWeWork.body,
    strategySteps: content.howWeWork.steps.map((step) => ({
      title: step.title,
      desc: step.description,
    })),
    deliverables,
    resultsTitle: content.numbers.headline,
    resultsLede: 'What we deliver for B2B SaaS companies.',
    stats: content.numbers.stats,
    quote,
    relatedWork: content.caseStudies.items.map((study) => ({
      href: `/case-studies/${study.slug}`,
      title: study.metric,
      meta: study.name,
      imageUrl: images[study.slug],
    })),
    relatedWorkTitle: content.caseStudies.headline,
    relatedPosts: [],
    faqTitle: content.faq.label,
    faqItems: content.faq.items,
    ctaTitle: content.bottomCta.headline,
    ctaSubtitle: `${content.bottomCta.body} ${content.bottomCta.disclaimer}`,
    coverShot: heroShot,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.loudface.co',
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
        name: 'B2B SaaS Growth Autopilot',
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'B2B SaaS Growth Autopilot: SEO, AEO & CRO',
    description: content.meta.description,
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: 'Search Engine Optimization',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div className="svcv3">
      {[breadcrumbSchema, serviceSchema, faqSchema].map((schema, i) => (
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
