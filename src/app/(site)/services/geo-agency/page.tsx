/**
 * GEO Agency Service Page  (/services/geo-agency)
 *
 * Copy: dual-verified approved body (content-engine loop, 2026-07-13). Every
 * sentence is rendered verbatim from src/data/content/services-geo-agency.json.
 * Layout note: the first-screen scorecard table renders immediately after the
 * hero, before any other section — AI engines lift first-screen artifacts.
 *
 * Data Sources:
 * - JSON: services-geo-agency.json (via content layer)
 * - CMS: clients (logo strip), case studies + testimonials (slider),
 *         blog posts + categories + team members (knowledge carousel)
 */
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getServicesGeoAgencyContent } from '@/lib/content-utils';
import { fetchHomepageData } from '@/lib/cms-data';
import type { CaseStudy } from '@/lib/types';
import {
  SectionContainer,
  SectionHeader,
  Card,
  Button,
  BulletLabel,
  Badge,
} from '@/components/ui';
import { FAQ, Partners, RelatedServices, TestimonialGrid } from '@/components/sections';
import {
  DeferredCaseStudySlider,
  DeferredKnowledge,
} from '@/components/sections/DeferredSections';

// Dynamic import below-fold visual component — defers client JS hydration
const AICitationVisual = dynamic(
  () => import('@/components/ui/AICitationVisual').then(m => ({ default: m.AICitationVisual })),
);

// Inline-link styling for prose rendered via dangerouslySetInnerHTML.
const LINKY =
  '[&_a]:font-medium [&_a]:text-primary-600 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary-700';
const LINKY_DARK =
  '[&_a]:font-medium [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary-300';

export const metadata: Metadata = {
  // Root layout applies `template: "%s | LoudFace"`, so do NOT add the suffix here.
  title: 'Generative Engine Optimization (GEO) Agency',
  description:
    'AI-native generative engine optimization agency for B2B SaaS. Get cited in ChatGPT, Perplexity, and Google AI Overviews, measured as share of answer.',
  alternates: {
    canonical: '/services/geo-agency',
  },
  openGraph: {
    title: 'Generative Engine Optimization (GEO) Agency | LoudFace',
    description:
      'AI-native generative engine optimization agency for B2B SaaS. Get cited in ChatGPT, Perplexity, and Google AI Overviews, measured as share of answer.',
    type: 'website',
    url: '/services/geo-agency',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Generative Engine Optimization Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Generative Engine Optimization (GEO) Agency | LoudFace',
    description:
      'AI-native generative engine optimization agency for B2B SaaS. Get cited in ChatGPT, Perplexity, and Google AI Overviews, measured as share of answer.',
    images: ['/opengraph-image'],
  },
};

const CANONICAL_URL = 'https://www.loudface.co/services/geo-agency';

export default async function GeoAgencyServicePage() {
  const content = getServicesGeoAgencyContent();

  // CMS data for logo strip, case study slider, testimonials, blog
  const cmsData = await fetchHomepageData();
  const {
    caseStudies,
    allClients,
    testimonials,
    allTestimonials,
    blogPosts,
    categories,
    teamMembers,
  } = cmsData;

  // Slim data for client components (CaseStudySlider, Knowledge)
  const sliderCaseStudies = caseStudies
    .filter(s => testimonials.has(s.id))
    .map(s => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      client: s.client,
      'project-title': s['project-title'],
      'paragraph-summary': s['paragraph-summary'],
      'client-color': s['client-color'],
      'main-project-image-thumbnail': s['main-project-image-thumbnail'],
      'result-1---number': s['result-1---number'],
      'result-1---title': s['result-1---title'],
    })) as CaseStudy[];

  const slimTestimonials = new Map(
    Array.from(testimonials.entries()).map(([id, t]) => [id, {
      id: t.id,
      slug: t.slug,
      name: t.name,
      role: t.role,
      'case-study': t['case-study'],
      'testimonial-body': t['testimonial-body'],
    }])
  );

  const lightBlogPosts = blogPosts
    .slice(0, 6)
    .map(post => ({
      id: post.id,
      slug: post.slug,
      name: post.name,
      excerpt: post.excerpt,
      category: post.category,
      author: post.author,
      thumbnail: post.thumbnail,
    }));

  const lightCategories = Array.from(categories.values()).map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  const lightAuthors = Array.from(teamMembers.values()).map(a => ({
    id: a.id,
    name: a.name,
  }));

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Generative Engine Optimization (GEO) & AEO Agency',
    description:
      'AI-native generative engine optimization agency for B2B SaaS. Get cited in ChatGPT, Perplexity, and Google AI Overviews, measured as share of answer.',
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: [
      'Generative Engine Optimization',
      'Answer Engine Optimization',
      'LLM SEO',
      'AI Search Optimization',
    ],
    url: CANONICAL_URL,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'GEO program capabilities',
      itemListElement: content.scorecard.rows.map((row) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: row.capability,
          description: row.requires,
        },
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.loudface.co/services' },
      { '@type': 'ListItem', position: 3, name: 'Generative Engine Optimization (GEO) Agency' },
    ],
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Generative Engine Optimization (GEO) & AEO Agency for B2B SaaS',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: CANONICAL_URL,
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* ─── Section 1: Hero ─── */}
      <SectionContainer padding="lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div className="lg:col-span-7">
            <BulletLabel>{content.hero.eyebrow}</BulletLabel>

            <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900">
              {content.hero.headline}
            </h1>

            <p className="mt-4 text-xl md:text-2xl font-medium text-primary-600">
              {content.hero.subheadline}
            </p>

            <p className="mt-5 text-lg text-surface-600 max-w-xl" data-speakable>
              {content.hero.definition}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="primary" size="lg" href="/audit">
                {content.hero.primaryCta}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
              <Button variant="outline" size="lg" href="#how-it-works">
                {content.hero.secondaryCta}
              </Button>
            </div>
          </div>

          {/* Right — AI Citation Animation */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center">
            <AICitationVisual />
          </div>
        </div>

        {/* Proof line */}
        <div className="mt-12 pt-8 border-t border-surface-200">
          <p className="max-w-3xl text-base md:text-lg text-surface-700 leading-relaxed" data-speakable>
            {content.hero.proof}
          </p>
        </div>
      </SectionContainer>

      {/* ─── First-screen scorecard (renders immediately after the hero — the
             liftable artifact AI engines quote first) ─── */}
      <SectionContainer>
        <div className="max-w-3xl">
          <p className="text-lg text-surface-800 font-medium leading-relaxed" data-speakable>
            {content.scorecard.intro}
          </p>
        </div>

        <div className="mt-8 lg:mt-12 overflow-x-auto rounded-2xl border border-surface-200">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-50">
                {content.scorecard.columns.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-4 text-sm font-medium text-surface-500 border-b border-surface-200"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.scorecard.rows.map((row) => (
                <tr key={row.capability} className="border-b border-surface-200 last:border-0">
                  <th scope="row" className="px-6 py-5 align-top font-medium text-surface-900 whitespace-normal">
                    {row.capability}
                  </th>
                  <td className="px-6 py-5 align-top text-surface-700">{row.requires}</td>
                  <td className="px-6 py-5 align-top text-surface-700">{row.delivers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionContainer>

      {/* ─── Social Proof: stars + headshots + tagline + logos ─── */}
      <Partners testimonials={allTestimonials} clients={allClients} />

      {/* ─── What is GEO (answer-first) ─── */}
      <SectionContainer>
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight">
            {content.whatIsGeo.title}
          </h2>
          <div className={`mt-6 space-y-4 text-lg text-surface-600 leading-relaxed ${LINKY}`}>
            {content.whatIsGeo.paragraphs.map((p, i) => (
              <p
                key={i}
                {...(i === 0 ? { 'data-speakable': true } : {})}
                dangerouslySetInnerHTML={{ __html: p }}
              />
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* ─── Comparison: GEO vs AEO vs SEO (semantic table — AI-extractable) ─── */}
      <SectionContainer>
        <div className="max-w-3xl">
          <SectionHeader
            title={content.comparison.title}
            highlightWord="difference?"
            subtitle={content.comparison.intro}
          />
        </div>

        <div className="mt-8 lg:mt-12 overflow-x-auto rounded-2xl border border-surface-200">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-50">
                {content.comparison.columns.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-4 text-sm font-medium text-surface-500 border-b border-surface-200"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.comparison.rows.map((row) => (
                <tr key={row.discipline} className="border-b border-surface-200 last:border-0">
                  <th scope="row" className="px-6 py-5 align-top">
                    <Badge variant="outline" size="md">{row.discipline}</Badge>
                  </th>
                  <td className="px-6 py-5 align-top text-surface-700">{row.optimizesFor}</td>
                  <td className="px-6 py-5 align-top text-surface-700">{row.whereWeShowUp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 max-w-3xl space-y-4 text-lg text-surface-600 leading-relaxed">
          {content.comparison.notes.map((note, i) => (
            <p key={i}>{note}</p>
          ))}
        </div>
      </SectionContainer>

      {/* ─── How the program works (dark) ─── */}
      <SectionContainer padding="lg" className="bg-surface-900 text-surface-300" id="how-it-works">
        <p
          className={`text-lg text-surface-300 max-w-3xl leading-relaxed ${LINKY_DARK}`}
          dangerouslySetInnerHTML={{ __html: content.howWeWork.intro }}
        />

        {/* Desktop: Horizontal timeline */}
        <div className="hidden lg:block mt-16">
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-px bg-surface-700" />

            <ol className="grid grid-cols-4 gap-8 list-none p-0 m-0">
              {content.howWeWork.steps.map((step) => (
                <li key={step.number} className="relative">
                  <div className="relative z-10 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-mono text-sm font-medium mx-auto">
                    {step.number}
                  </div>

                  <Card variant="glass" padding="md" hover={false} className="mt-6">
                    <h3 className="text-lg font-medium text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-surface-400">
                      {step.description}
                    </p>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="lg:hidden mt-10">
          <ol className="relative border-l-2 border-surface-700 ml-5 space-y-8 list-none p-0 m-0">
            {content.howWeWork.steps.map((step) => (
              <li key={step.number} className="relative pl-10">
                <div className="absolute -left-5 top-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-mono text-sm font-medium">
                  {step.number}
                </div>

                <Card variant="glass" padding="md" hover={false}>
                  <h3 className="text-lg font-medium text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-surface-400">
                    {step.description}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </SectionContainer>

      {/* ─── Proof ─── */}
      <SectionContainer>
        <div className="max-w-3xl">
          <p className="text-lg text-surface-800 font-medium leading-relaxed" data-speakable>
            {content.proof.intro}
          </p>
        </div>
        <div className="mt-8 lg:mt-10 max-w-3xl space-y-6">
          {content.proof.items.map((item, i) => (
            <Card key={i} padding="lg" hover={false}>
              <p
                className={`text-surface-700 leading-relaxed ${LINKY}`}
                dangerouslySetInnerHTML={{ __html: item }}
              />
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* ─── Case Study Slider ─── */}
      {sliderCaseStudies.length > 0 && (
        <DeferredCaseStudySlider
          title="The work speaks. Specifically."
          caseStudies={sliderCaseStudies}
          testimonials={slimTestimonials}
        />
      )}

      {/* ─── Timeline expectations ─── */}
      <SectionContainer>
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight">
            {content.timeline.title}
          </h2>
          <p className="mt-6 text-lg text-surface-600 leading-relaxed" data-speakable>
            {content.timeline.intro}
          </p>
        </div>

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.timeline.speeds.map((speed) => (
            <Card key={speed.label} padding="lg" hover={false}>
              <h3 className="text-lg font-medium text-surface-900">{speed.label}</h3>
              <p className="mt-3 text-surface-600 leading-relaxed">{speed.body}</p>
            </Card>
          ))}
        </div>

        <p
          className={`mt-8 max-w-3xl text-lg text-surface-600 leading-relaxed ${LINKY}`}
          dangerouslySetInnerHTML={{ __html: content.timeline.outro }}
        />
      </SectionContainer>

      {/* ─── Pricing signal ─── */}
      <SectionContainer>
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight">
            {content.pricing.title}
          </h2>
          <div className={`mt-6 space-y-4 text-lg text-surface-600 leading-relaxed ${LINKY}`}>
            {content.pricing.paragraphs.map((p, i) => (
              <p
                key={i}
                {...(i === 0 ? { 'data-speakable': true } : {})}
                className={i === 0 ? 'text-surface-800 font-medium' : undefined}
                dangerouslySetInnerHTML={{ __html: p }}
              />
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* ─── Measurement and honesty (+ 7 questions) ─── */}
      <SectionContainer>
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight">
            {content.measurement.title}
          </h2>
          <div className="mt-6 space-y-4 text-lg text-surface-600 leading-relaxed">
            {content.measurement.paragraphs.map((p, i) => (
              <p key={i} {...(i === 0 ? { 'data-speakable': true } : {})}>{p}</p>
            ))}
          </div>

          <h3 className="mt-10 text-xl font-medium text-surface-900">
            {content.measurement.questionsIntro}
          </h3>
          <ol className="mt-6 list-none p-0 m-0 space-y-4">
            {content.measurement.questions.map((q, i) => (
              <li key={i} className="flex gap-4 p-5 rounded-2xl border border-surface-200 bg-white">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-mono text-sm font-medium">
                  {i + 1}
                </span>
                <p className="text-surface-700 leading-relaxed">{q}</p>
              </li>
            ))}
          </ol>
        </div>
      </SectionContainer>

      {/* ─── Testimonials ─── */}
      <TestimonialGrid
        testimonials={allTestimonials}
        title="What our clients say"
        highlightWord="clients"
      />

      {/* ─── FAQ (emits FAQPage schema from all 8 Q&As) ─── */}
      <FAQ
        title="Frequently asked questions"
        items={content.faq.items}
        showFooter
      />

      {/* ─── Related Services ─── */}
      <RelatedServices currentService="/services/geo-agency" />

      {/* ─── Blog / Knowledge ─── */}
      {lightBlogPosts.length > 0 && (
        <DeferredKnowledge
          title="From our blog"
          highlightWord="blog"
          description="Playbooks and insights for B2B SaaS marketing teams."
          posts={lightBlogPosts}
          categories={lightCategories}
          authors={lightAuthors}
        />
      )}

      {/* ─── Bottom CTA ─── */}
      <SectionContainer padding="lg" className="bg-surface-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white leading-tight tracking-tight text-balance">
            {content.cta.title}
          </h2>
          <p className="mt-6 text-lg text-surface-300 leading-relaxed">
            {content.cta.body}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button variant="primary" size="lg" href="/audit" className="rounded-full">
              {content.cta.primaryCta}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>
            <Button variant="outline" size="lg" calTrigger className="rounded-full border-surface-600 text-surface-300 hover:border-surface-400 hover:text-white">
              {content.cta.secondaryCta}
            </Button>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
