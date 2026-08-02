/**
 * SEO for B2B — bespoke content on the shared v3 SEO-for template.
 *
 * The local JSON remains the content authority. This route only adapts fields
 * that have a real SeoForView slot; legacy campaign-only copy, numbered
 * markers, and card descriptions/tags are intentionally not forced into
 * unrelated v3 furniture.
 *
 * The client testimonial IS carried over — it is proof, not decoration. It
 * fills the template's NIGHT quote stage using the same CMS selection the
 * programmatic /seo-for/<industry> route uses, so the section degrades to
 * nothing rather than rendering an empty stage when Sanity has no match.
 */
import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import '../../../seo-for-v3/seo-for-v3.css';
import { getSeoForB2bContent } from '@/lib/content-utils';
import { fetchHomepageData } from '@/lib/cms-data';
import { SeoForPageV3 } from '../../../seo-for-v3/SeoForPageV3';
import type { QuoteSource, SeoForView } from '../../../seo-for-v3/SeoForPageV3';
import { CLIENT_DOMAINS, getSeoForImages } from '../../../seo-for-v3/data';

const content = getSeoForB2bContent();

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  alternates: {
    canonical: '/seo-for/b2b',
  },
  openGraph: {
    title: `${content.meta.title} | LoudFace`,
    description: content.meta.description,
    type: 'website',
    url: '/seo-for/b2b',
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

export default async function B2bPage() {
  const caseStudySlugs = content.caseStudies.items.map((study) => study.slug);
  const images = await getSeoForImages(caseStudySlugs);

  // Client proof for the NIGHT quote stage. Prefer a testimonial attached to
  // one of the case studies this page already features, else the first usable
  // one — the same order the programmatic /seo-for/<industry> route uses.
  // fetchHomepageData() is resilient and returns partial data, so a Sanity
  // blip leaves `quote` undefined and the template drops the stage entirely.
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

  const view: SeoForView = {
    eyebrow: content.hero.eyebrow,
    h1: content.hero.headline,
    sub: content.hero.subheadline,
    heroShot,
    logosLead: 'Trusted by leading B2B companies',
    painTitle: content.problem.label,
    painLede: 'Why B2B companies struggle to turn traffic into pipeline.',
    // The JSON carries a subtitle AND a body per problem item; the template's
    // Pair has one prose slot, so both are kept rather than dropping either.
    painPoints: content.problem.items.map((item) => ({
      title: item.title,
      desc: `${item.subtitle} ${item.body}`,
    })),
    strategyTitle: content.howWeBuild.headline,
    strategyLede: content.howWeBuild.body,
    strategySteps: content.howWeBuild.steps.map((step) => ({
      title: step.title,
      desc: step.description,
    })),
    // Carries the contextual internal links and the mid-page audit offer that
    // the legacy layout held in bespoke sections the template has no slot for.
    proseTitle: content.ctaBreak.headline,
    proseHtml: `<p>${content.ctaBreak.subheadline} <a href="/audit">${content.ctaBreak.primaryCta}</a>.</p><p>Need the search and AI-visibility layer on its own? See our <a href="/services/seo-aeo">AEO agency services for B2B SaaS</a>, or <a href="/case-studies">${content.caseStudies.cta.toLowerCase()}</a>.</p>`,
    deliverables: [],
    resultsTitle: 'Real results',
    resultsLede: content.stats.headline,
    quote,
    stats: content.stats.items,
    relatedWork: content.caseStudies.items.map((study) => ({
      href: `/case-studies/${study.slug}`,
      title: study.metric,
      meta: study.name,
      imageUrl: images[study.slug],
    })),
    relatedWorkTitle: content.caseStudies.headline,
    relatedPosts: content.relatedInsights.items.map((item) => ({
      href: `/blog/${item.slug}`,
      title: item.title,
    })),
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
        name: 'B2B Growth Autopilot',
      },
    ],
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'B2B Growth Autopilot: SEO, AEO & CRO',
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
