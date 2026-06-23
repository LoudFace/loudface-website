/**
 * SEO/AEO Service Page
 *
 * Data Sources:
 * - JSON: services-seo-aeo.json (via content layer)
 * - CMS: clients (logo strip), case studies + testimonials (slider),
 *         blog posts + categories + team members (knowledge carousel)
 */
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getServicesSeoAeoContent } from '@/lib/content-utils';
import { fetchHomepageData } from '@/lib/cms-data';
import { AI_PLATFORM_ICONS } from '@/lib/icons';
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

export const metadata: Metadata = {
  // Root layout applies `template: "%s | LoudFace"`, so do NOT add the suffix here.
  title: 'AEO Agency for B2B SaaS | SEO, AEO & GEO',
  description:
    'LoudFace is an AEO agency for B2B SaaS. We run SEO, AEO and GEO as one program so you rank on Google and get cited by ChatGPT, Perplexity and AI Overviews.',
  alternates: {
    canonical: '/services/seo-aeo',
  },
  openGraph: {
    title: 'AEO Agency for B2B SaaS | SEO, AEO & GEO | LoudFace',
    description:
      'LoudFace is an AEO agency for B2B SaaS. We run SEO, AEO and GEO as one program so you rank on Google and get cited by ChatGPT, Perplexity and AI Overviews.',
    type: 'website',
    url: '/services/seo-aeo',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace AEO Agency for B2B SaaS' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'AEO Agency for B2B SaaS | SEO, AEO & GEO | LoudFace',
    description:
      'LoudFace is an AEO agency for B2B SaaS. We run SEO, AEO and GEO as one program so you rank on Google and get cited by ChatGPT, Perplexity and AI Overviews.',
    images: ['/opengraph-image'],
  },
};

export default async function SeoAeoServicePage() {
  const content = getServicesSeoAeoContent();

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
    name: 'AEO Agency for B2B SaaS: SEO, AEO and GEO',
    description:
      'LoudFace is an AEO agency for B2B SaaS. We run SEO, AEO and GEO as one program so you rank on Google and get cited by ChatGPT, Perplexity and AI Overviews.',
    provider: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
    },
    areaServed: 'Worldwide',
    serviceType: [
      'Answer Engine Optimization',
      'Search Engine Optimization',
      'Generative Engine Optimization',
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.loudface.co/services' },
      { '@type': 'ListItem', position: 3, name: 'AEO Agency for B2B SaaS' },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: content.approach.title,
    description: content.approach.intro,
    step: content.approach.steps.map((s: { number: string; title: string; description: string }) => ({
      '@type': 'HowToStep',
      position: Number(s.number),
      name: s.title,
      text: s.description,
    })),
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'SEO & AI Engine Optimization Services',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: 'https://www.loudface.co/services/seo-aeo',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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

            <h1
              className="mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900"
              dangerouslySetInnerHTML={{ __html: content.hero.headline }}
            />

            <p className="mt-4 text-xl md:text-2xl font-medium text-primary-600">
              {content.hero.subheadline}
            </p>

            <p className="mt-5 text-lg text-surface-600 max-w-xl" data-speakable>
              {content.hero.description}
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

        {/* Stats Strip */}
        <div className="mt-12 pt-8 border-t border-surface-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {content.stats.map((stat: { value: string; label: string; href?: string }, i: number) => {
              const inner = (
                <>
                  <span className="text-2xl md:text-3xl font-mono font-medium text-surface-900">
                    {stat.value}
                  </span>
                  <p className="mt-1 text-sm text-surface-500">{stat.label}</p>
                </>
              );
              return stat.href ? (
                <Link
                  key={i}
                  href={stat.href}
                  className="group text-center rounded-xl -m-2 p-2 transition-colors hover:bg-surface-50 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2"
                >
                  <span className="text-2xl md:text-3xl font-mono font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                    {stat.value}
                  </span>
                  <p className="mt-1 text-sm text-surface-500">{stat.label}</p>
                </Link>
              ) : (
                <div key={i} className="text-center">{inner}</div>
              );
            })}
          </div>
        </div>
      </SectionContainer>

      {/* ─── Social Proof: stars + headshots + tagline + logos ─── */}
      <Partners testimonials={allTestimonials} clients={allClients} />

      {/* ─── Answer block: What is AEO? (AEO-critical, answer-first) ─── */}
      <SectionContainer>
        <div className="max-w-3xl">
          <BulletLabel>{content.whatIsAeo.eyebrow}</BulletLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight">
            {content.whatIsAeo.title}
          </h2>
          <p className="mt-6 text-lg text-surface-800 font-medium leading-relaxed" data-speakable>
            {content.whatIsAeo.answer}
          </p>
          <p className="mt-4 text-lg text-surface-600 leading-relaxed">
            {content.whatIsAeo.body}
          </p>
          <Link
            href={content.whatIsAeo.linkHref}
            className="mt-6 inline-flex items-center gap-2 font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
          >
            {content.whatIsAeo.linkText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </SectionContainer>

      {/* ─── Comparison: SEO vs AEO vs GEO (semantic table — AI-extractable) ─── */}
      <SectionContainer>
        <div className="max-w-3xl">
          <SectionHeader
            title={content.comparison.title}
            highlightWord={content.comparison.highlightWord}
            subtitle={content.comparison.intro}
          />
        </div>

        <div className="mt-8 lg:mt-12 overflow-x-auto rounded-2xl border border-surface-200">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-50">
                {content.comparison.columns.map((col: string) => (
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
              {content.comparison.rows.map(
                (row: { discipline: string; optimizesFor: string; whereWeShowUp: string }) => (
                  <tr key={row.discipline} className="border-b border-surface-200 last:border-0">
                    <th scope="row" className="px-6 py-5 align-top">
                      <Badge variant="outline" size="md">{row.discipline}</Badge>
                    </th>
                    <td className="px-6 py-5 align-top text-surface-700">{row.optimizesFor}</td>
                    <td className="px-6 py-5 align-top text-surface-700">{row.whereWeShowUp}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-lg text-surface-600 max-w-3xl leading-relaxed">
          {content.comparison.note}
        </p>
      </SectionContainer>

      {/* ─── Section 2: Problem ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.problems.title}
          highlightWord={content.problems.highlightWord}
          subtitle={content.problems.subtitle}
        />

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Rankings without pipeline — diverging lines chart */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center px-4" aria-hidden="true">
              <svg className="w-full h-16" viewBox="0 0 200 64" fill="none">
                <path
                  d="M10,48 C40,45 70,38 100,30 C130,22 160,16 190,8"
                  stroke="var(--color-surface-400)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M10,48 C40,50 70,52 100,51 C130,52 160,54 190,56"
                  stroke="var(--color-error)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="6 4"
                />
                <text x="192" y="8" fontSize="8" fill="var(--color-surface-400)" fontWeight="500">Traffic</text>
                <text x="192" y="58" fontSize="8" fill="var(--color-error)" fontWeight="500">Revenue</text>
              </svg>
            </div>
            <span className="block mt-4 text-7xl font-mono font-bold text-surface-100 leading-none select-none">
              {content.problems.items[0].number}
            </span>
            <h3 className="text-xl font-medium text-surface-900 -mt-4">
              {content.problems.items[0].title}
            </h3>
            <p className="mt-3 text-surface-600">{content.problems.items[0].description}</p>
          </Card>

          {/* Card 2: Invisible to AI engines — platform icons with "?" */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center gap-3 px-4" aria-hidden="true">
              {['ChatGPT', 'Perplexity', 'Google AI', 'Claude'].map((name) => {
                const icon = AI_PLATFORM_ICONS[name];
                return (
                  <div key={name} className="relative">
                    <div className="w-10 h-10 rounded-lg bg-white border border-surface-200 flex items-center justify-center">
                      {icon && (
                        <svg
                          className="w-5 h-5 text-surface-300"
                          viewBox={icon.viewBox}
                          dangerouslySetInnerHTML={{ __html: icon.path }}
                        />
                      )}
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-surface-200 flex items-center justify-center text-[8px] font-bold text-surface-500">
                      ?
                    </span>
                  </div>
                );
              })}
            </div>
            <span className="block mt-4 text-7xl font-mono font-bold text-surface-100 leading-none select-none">
              {content.problems.items[1].number}
            </span>
            <h3 className="text-xl font-medium text-surface-900 -mt-4">
              {content.problems.items[1].title}
            </h3>
            <p className="mt-3 text-surface-600">{content.problems.items[1].description}</p>
          </Card>

          {/* Card 3: Tactics without a system — scattered disconnected blocks */}
          <Card padding="lg" hover={false}>
            <div className="h-24 rounded-xl bg-surface-50 border border-surface-100 flex items-center justify-center relative overflow-hidden" aria-hidden="true">
              <svg className="w-full h-full" viewBox="0 0 200 96" fill="none">
                <rect x="20" y="15" width="28" height="14" rx="3" fill="var(--color-surface-200)" transform="rotate(-12 20 15)" />
                <rect x="70" y="50" width="24" height="12" rx="3" fill="var(--color-surface-300)" transform="rotate(8 70 50)" />
                <rect x="120" y="20" width="30" height="14" rx="3" fill="var(--color-surface-200)" transform="rotate(15 120 20)" />
                <rect x="45" y="70" width="22" height="12" rx="3" fill="var(--color-surface-200)" transform="rotate(-5 45 70)" />
                <rect x="160" y="55" width="26" height="12" rx="3" fill="var(--color-surface-300)" transform="rotate(-18 160 55)" />
                <rect x="100" y="65" width="20" height="10" rx="3" fill="var(--color-surface-200)" transform="rotate(10 100 65)" />
              </svg>
            </div>
            <span className="block mt-4 text-7xl font-mono font-bold text-surface-100 leading-none select-none">
              {content.problems.items[2].number}
            </span>
            <h3 className="text-xl font-medium text-surface-900 -mt-4">
              {content.problems.items[2].title}
            </h3>
            <p className="mt-3 text-surface-600">{content.problems.items[2].description}</p>
          </Card>
        </div>
      </SectionContainer>

      {/* ─── Section 3: Autopilot Approach (Dark) ─── */}
      <SectionContainer padding="lg" className="bg-surface-900 text-surface-300" id="how-it-works">
        <SectionHeader
          title={content.approach.title}
          highlightWord={content.approach.highlightWord}
          variant="dark"
        />

        <p className="mt-6 text-lg text-surface-300 max-w-3xl">
          {content.approach.intro}
        </p>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden lg:block mt-16">
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-px bg-surface-700" />

            <ol className="grid grid-cols-4 gap-8 list-none p-0 m-0">
              {content.approach.steps.map((step: { number: string; title: string; description: string }) => (
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
            {content.approach.steps.map((step: { number: string; title: string; description: string }) => (
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

      {/* ─── Section 4: Three Tracks (SEO / AEO / GEO) ─── */}
      <SectionContainer>
        <div className="max-w-3xl">
          <BulletLabel>{content.tracks.title}</BulletLabel>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight">
            {content.tracks.headline}
          </h2>
          <p className="mt-4 text-lg text-surface-600">
            {content.tracks.description}
          </p>
        </div>

        <div className="mt-8 lg:mt-12 border border-surface-200 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-surface-200">
            {/* SEO Column */}
            <div className="p-8 lg:p-12">
              <Badge variant="outline" size="md">{content.tracks.seo.label}</Badge>
              <h3 className="mt-4 text-xl font-medium text-surface-900">
                {content.tracks.seo.title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.tracks.seo.description}
              </p>
              <ul className="mt-6 space-y-3">
                {content.tracks.seo.items.map((item: string) => (
                  <li key={item} className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="var(--color-primary-100)" />
                      <path d="M6 10l3 3 5-5" stroke="var(--color-primary-600)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-surface-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AEO Column */}
            <div className="p-8 lg:p-12">
              <Badge variant="outline" size="md">{content.tracks.aeo.label}</Badge>
              <h3 className="mt-4 text-xl font-medium text-surface-900">
                {content.tracks.aeo.title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.tracks.aeo.description}
              </p>
              <ul className="mt-6 space-y-3">
                {content.tracks.aeo.items.map((item: string) => (
                  <li key={item} className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="var(--color-primary-100)" />
                      <path d="M6 10l3 3 5-5" stroke="var(--color-primary-600)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-surface-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* GEO Column */}
            <div className="p-8 lg:p-12">
              <Badge variant="outline" size="md">{content.tracks.geo.label}</Badge>
              <h3 className="mt-4 text-xl font-medium text-surface-900">
                {content.tracks.geo.title}
              </h3>
              <p className="mt-2 text-surface-600">
                {content.tracks.geo.description}
              </p>
              <ul className="mt-6 space-y-3">
                {content.tracks.geo.items.map((item: string) => (
                  <li key={item} className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="var(--color-primary-100)" />
                      <path d="M6 10l3 3 5-5" stroke="var(--color-primary-600)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-surface-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bridge row */}
          <div className="border-t border-surface-200 px-8 lg:px-12 py-6 text-center bg-surface-50">
            <p className="text-surface-600 max-w-2xl mx-auto">
              {content.tracks.bridge}
            </p>
          </div>
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

      {/* ─── Section 5: Full Program Scope ─── */}
      <SectionContainer>
        <SectionHeader
          title={content.capabilities.title}
          highlightWord={content.capabilities.highlightWord}
        />

        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.capabilities.items.map((item: { title: string; description: string }, i: number) => (
            <Card key={i} padding="lg" hover={false}>
              <h3 className="text-lg font-medium text-surface-900">
                {item.title}
              </h3>
              <p className="mt-3 text-surface-600">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      {/* ─── Pricing signal: How much does an AEO agency cost? (NEW) ─── */}
      <SectionContainer>
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900 leading-tight tracking-tight">
            {content.pricing.title}
          </h2>
          <p className="mt-6 text-lg text-surface-800 font-medium leading-relaxed" data-speakable>
            {content.pricing.answer}
          </p>
          <p className="mt-4 text-lg text-surface-600 leading-relaxed">
            {content.pricing.body}
          </p>
          <Link
            href={content.pricing.linkHref}
            className="mt-6 inline-flex items-center gap-2 font-medium text-primary-600 hover:text-primary-700 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
          >
            {content.pricing.linkText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </SectionContainer>

      {/* ─── Section 6: SEO & AEO by Industry ─── */}
      <SectionContainer>
        <SectionHeader
          title="SEO & AEO by Industry"
          highlightWord="Industry"
          subtitle="Every vertical has its own search dynamics and its own AI prompts. We build the SEO and AEO strategy around yours."
        />
        <div className="mt-8 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: '/seo-for/ecommerce', label: 'E-Commerce SEO', desc: 'Compete with Amazon and marketplace giants.' },
            { href: '/seo-for/healthcare', label: 'Healthcare SEO', desc: 'Navigate YMYL, E-E-A-T, and multi-location local search.' },
            { href: '/seo-for/saas', label: 'SaaS SEO', desc: 'Fix JavaScript rendering and build product-led content.' },
            { href: '/seo-for/startups', label: 'Startup SEO', desc: 'Build authority from zero on a lean budget.' },
            { href: '/seo-for/b2b', label: 'B2B SEO', desc: 'Align search with long sales cycles and buying committees.' },
            { href: '/seo-for/fintech', label: 'FinTech SEO', desc: 'Meet YMYL standards and build financial trust signals.' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 p-4 rounded-xl border border-surface-200 bg-white
                transition-all duration-200 hover:border-surface-300 hover:shadow-md
                focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
            >
              <div>
                <div className="font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
                  {item.label}
                </div>
                <div className="mt-1 text-sm text-surface-500">{item.desc}</div>
              </div>
              <svg
                className="w-5 h-5 flex-shrink-0 text-surface-400 group-hover:text-primary-500 transition-colors ml-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </SectionContainer>

      {/* ─── Is LoudFace right for you (fit test) ─── */}
      <SectionContainer>
        <SectionHeader
          title="Is LoudFace right for you?"
          highlightWord="right"
          subtitle="The honest fit test. We do our best work for some teams, and we are the wrong call for others."
        />
        <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl border border-surface-200 bg-white">
            <h3 className="text-lg font-medium text-surface-900">A strong fit if you are</h3>
            <ul className="mt-4 space-y-3">
              {[
                'B2B SaaS at Series A to C ($1M+ ARR) treating organic and AI search as a core growth channel',
                'A team that wants SEO, AEO/GEO, content, and Webflow as one program, not stitched-together vendors',
                'Trying to show up in ChatGPT, Perplexity, and Google AI Overviews, not only rank on Google',
                'A founder who wants share-of-answer and pipeline tracked, not just traffic',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-surface-700">
                  <span className="mt-0.5 flex-shrink-0 font-medium text-primary-600">✓</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-2xl border border-surface-200 bg-surface-50">
            <h3 className="text-lg font-medium text-surface-900">Not the right fit if you want</h3>
            <ul className="mt-4 space-y-3">
              {[
                'A single one-off blog post or a quick technical audit',
                'Guaranteed rankings or overnight results (AEO compounds over months)',
                'Paid ads or social only, with no organic or AI-search ambition',
                'The cheapest possible retainer over a measurable growth program',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-surface-500">
                  <span className="mt-0.5 flex-shrink-0 font-medium text-surface-400">✕</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionContainer>

      {/* ─── Testimonials ─── */}
      <TestimonialGrid
        testimonials={allTestimonials}
        title="What our clients say"
        highlightWord="clients"
      />

      {/* ─── FAQ ─── */}
      <FAQ
        title={content.faq.title}
        items={content.faq.items}
        showFooter
      />

      {/* ─── Related Services ─── */}
      <RelatedServices currentService="/services/seo-aeo" />

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
            {content.cta.subtitle}
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
          <p className="mt-6 text-sm text-surface-500">
            {content.cta.disclaimer}
          </p>
        </div>
      </SectionContainer>
    </>
  );
}
