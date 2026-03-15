/**
 * Homepage
 *
 * Data Sources:
 * - CMS: case-studies, clients, testimonials, blog, categories, team-members, industries
 * - JSON: homepage.json (via content layer)
 *
 * Components: Hero, Partners, ProblemCheckerA, CaseStudySlider, Results,
 *             Knowledge, FAQ, CTA
 */
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { fetchHomepageData, getAccessToken, getEmptyHomepageData } from '@/lib/cms-data';
import { getHomepageContent } from '@/lib/content-utils';
import type { CaseStudy } from '@/lib/types';
import {
  Hero,
  Partners,
  ProblemCheckerA,
  Results,
  FAQ,
  CTA,
} from '@/components';
import {
  SectionContainer,
  Card,
} from '@/components/ui';

// Dynamic import below-fold carousel sections — defers their client JS
// out of the critical rendering window, reducing TBT on mobile.
// SSR is preserved (HTML renders normally), only JS hydration is deferred.
const CaseStudySlider = dynamic(
  () => import('@/components/sections/CaseStudySlider').then(m => ({ default: m.CaseStudySlider })),
);

const Knowledge = dynamic(
  () => import('@/components/sections/Knowledge').then(m => ({ default: m.Knowledge })),
);

export const metadata: Metadata = {
  title: 'B2B SaaS Web Design, SEO & Growth Agency',
  description:
    'Design, development, and growth for Series A+ SaaS companies. We ship your website on Webflow in weeks, then drive traffic and conversions with SEO and CRO.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'B2B SaaS Web Design, SEO & Growth Agency | LoudFace',
    description:
      'Design, development, and growth for Series A+ SaaS companies. We ship your website on Webflow in weeks, then drive traffic and conversions with SEO and CRO.',
    type: 'website',
    url: '/',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace - B2B SaaS Growth Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'B2B SaaS Web Design, SEO & Growth Agency | LoudFace',
    description:
      'Design, development, and growth for Series A+ SaaS companies. We ship your website on Webflow in weeks, then drive traffic and conversions with SEO and CRO.',
    images: ['/opengraph-image'],
  },
};

export default async function HomePage() {
  const content = getHomepageContent();

  // CMS Data Fetching
  const accessToken = getAccessToken();
  const cmsData = accessToken
    ? await fetchHomepageData(accessToken)
    : getEmptyHomepageData();

  const {
    caseStudies,
    clients,
    allClients,
    testimonials,
    allTestimonials,
    blogPosts,
    categories,
    teamMembers,
    industries,
  } = cmsData;

  // Minimize data sent to client components (CaseStudySlider, Knowledge).
  // Next.js serializes all client-component props into inline <script> tags.
  // Without trimming, full article HTML per blog post + case study body inflated
  // the homepage to ~2.4 MB.

  // Strip rich-text body fields never used on the homepage
  const lightCaseStudies = caseStudies.map(({ 'main-body': _, ...rest }) => rest);

  // Knowledge carousel only needs a handful of recent posts, not all 60+
  const lightBlogPosts = blogPosts
    .slice(0, 6)
    .map(({ content: _, ...rest }) => rest);

  // CaseStudySlider only shows studies that have testimonials — pre-filter
  // server-side so we don't ship unused entries to the client
  const sliderCaseStudies = lightCaseStudies.filter(s => testimonials.has(s.id));

  const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

  return (
    <>
      {/* Hero */}
      <Hero
        headline={content.hero.headline}
        description={content.hero.description}
        ctaText={content.hero.ctaText}
        scarcityText={`2 client slots open for ${currentQuarter}`}
        aiLinksLabel={content.hero.aiLinksLabel}
        caseStudies={lightCaseStudies}
        clients={clients}
        industries={industries}
      />

      {/* Partners */}
      <Partners
        tagline={content.partners.tagline}
        testimonials={allTestimonials}
        clients={allClients}
      />

      {/* Problem Checker */}
      <ProblemCheckerA
        heading={content.problem.heading}
        items={content.problem.items}
      />

      {/* Two Tracks: Build + Grow */}
      <SectionContainer padding="lg" className="bg-surface-900 text-surface-300">
        <div className="max-w-3xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white">
            {content.tracks.heading}
          </h2>
          <div className="h-4" />
          <p className="text-lg text-surface-300">
            {content.tracks.intro}
          </p>
        </div>

        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Build Track */}
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-mono text-primary-400">{content.tracks.build.label}</span>
              <h3 className="text-2xl font-medium text-white">{content.tracks.build.title}</h3>
            </div>
            <p className="text-primary-400 font-medium mb-4">{content.tracks.build.subtitle}</p>
            <p className="text-surface-300 leading-relaxed mb-6">{content.tracks.build.body}</p>
            <p className="text-sm text-surface-400 italic mb-6">{content.tracks.build.detail}</p>
            <div className="border-t border-white/10 pt-6">
              <div className="flex flex-wrap gap-2">
                {content.tracks.build.capabilities.map((cap, i) => (
                  <span
                    key={i}
                    className="inline-block px-3 py-1.5 text-sm bg-white/5 text-surface-300 rounded-lg"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Grow Track */}
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-mono text-primary-400">{content.tracks.grow.label}</span>
              <h3 className="text-2xl font-medium text-white">{content.tracks.grow.title}</h3>
            </div>
            <p className="text-primary-400 font-medium mb-4">{content.tracks.grow.subtitle}</p>
            <p className="text-surface-300 leading-relaxed mb-6">{content.tracks.grow.body}</p>
            <p className="text-sm text-surface-400 italic mb-6">{content.tracks.grow.detail}</p>
            <div className="border-t border-white/10 pt-6">
              <div className="flex flex-wrap gap-2">
                {content.tracks.grow.capabilities.map((cap, i) => (
                  <span
                    key={i}
                    className="inline-block px-3 py-1.5 text-sm bg-white/5 text-surface-300 rounded-lg"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Connector line */}
        <div className="mt-10 md:mt-12 text-center">
          <p className="text-surface-400 text-lg italic max-w-2xl mx-auto">
            {content.tracks.connector}
          </p>
        </div>
      </SectionContainer>

      {/* Case Study Slider */}
      <CaseStudySlider
        title="The work speaks. Specifically."
        caseStudies={sliderCaseStudies}
        testimonials={testimonials}
      />

      {/* Results (Bento Grid) */}
      <Results
        title={content.results.heading}
        subtitle={content.results.subtitle}
        caseStudies={(() => {
          const targetSlugs = ['viaduct', 'dimer-health'];
          const picked = targetSlugs
            .map((slug) => lightCaseStudies.find((s) => s.slug === slug))
            .filter(Boolean) as CaseStudy[];
          return picked.length === 2
            ? picked
            : lightCaseStudies.filter((s) => s.featured && s.testimonial).slice(0, 2);
        })()}
        testimonial={
          (() => {
            const viaduct = lightCaseStudies.find((s) => s.slug === 'viaduct');
            const studyWithTestimonial = viaduct?.testimonial
              ? viaduct
              : lightCaseStudies.find((s) => s.featured && s.testimonial);
            return studyWithTestimonial?.testimonial
              ? testimonials.get(studyWithTestimonial.testimonial)
              : allTestimonials[0];
          })()
        }
        clients={clients}
      />

      {/* How We Work (Process Timeline) */}
      <SectionContainer>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
            {content.process.heading}
          </h2>
          <div className="h-4" />
          <p className="text-lg text-surface-600">
            {content.process.subtitle}
          </p>
        </div>

        <div className="mt-12 lg:mt-16">
          {/* Desktop: horizontal timeline */}
          <div className="hidden md:block">
            {/* Timeline bar */}
            <div className="relative flex items-start justify-between mb-12">
              <div className="absolute top-4 left-0 right-0 h-px bg-surface-200" />
              {content.process.steps.map((step) => (
                <div key={step.number} className="relative flex flex-col items-center w-1/4 px-2">
                  <div className="w-8 h-8 rounded-full bg-surface-900 text-white flex items-center justify-center text-sm font-mono font-medium z-10">
                    {step.number}
                  </div>
                  <span className="mt-2 text-xs font-mono text-surface-500 uppercase tracking-wider">
                    {step.timeline}
                  </span>
                </div>
              ))}
            </div>
            {/* Step cards */}
            <div className="grid grid-cols-4 gap-6">
              {content.process.steps.map((step) => (
                <Card key={step.number} hover={false}>
                  <h3 className="text-lg font-medium text-surface-900">{step.title}</h3>
                  <div className="h-3" />
                  <p className="text-surface-600 text-sm leading-relaxed">{step.body}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Mobile: vertical timeline */}
          <div className="md:hidden space-y-8">
            {content.process.steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-surface-900 text-white flex items-center justify-center text-sm font-mono font-medium shrink-0">
                    {step.number}
                  </div>
                  <div className="w-px flex-1 bg-surface-200 mt-2" />
                </div>
                <div className="pb-6">
                  <span className="text-xs font-mono text-surface-500 uppercase tracking-wider">
                    {step.timeline}
                  </span>
                  <h3 className="text-lg font-medium text-surface-900 mt-1">{step.title}</h3>
                  <p className="text-surface-600 mt-2 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* Stats */}
      <SectionContainer padding="sm" className="bg-surface-50">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
            {content.stats.heading}
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {content.stats.items.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-medium font-mono text-surface-900">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium text-surface-600 uppercase tracking-wider">
                {stat.label}
              </div>
              <div className="mt-2 text-sm text-surface-500">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* Knowledge/Blog */}
      <Knowledge
        title="Playbooks for SaaS marketing teams"
        highlightWord="Playbooks"
        description={content.blog.subtitle}
        posts={lightBlogPosts}
        categories={Array.from(categories.values())}
        authors={Array.from(teamMembers.values())}
      />

      {/* FAQ */}
      <FAQ
        title="Common questions about working with us"
        items={content.faq}
      />

      {/* CTA */}
      <CTA
        title={content.cta.title}
        subtitle={content.cta.subtitle}
        ctaText={content.cta.ctaText}
      />
    </>
  );
}
