/**
 * Homepage
 *
 * Data Sources:
 * - CMS: case-studies, clients, testimonials, blog, categories, team-members, industries
 * - JSON: faq-items.json, homepage-v2.json (via content layer)
 *
 * Components: Hero, Partners, ProblemCheckerA, CaseStudySlider, Audit, Results,
 *             Marketing, Approach, Knowledge, FAQ, CTA
 */
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { fetchHomepageData, getAccessToken, getEmptyHomepageData } from '@/lib/cms-data';
import { getFAQItemsContent, getHomepageV2Content } from '@/lib/content-utils';
import type { CaseStudy } from '@/lib/types';
import {
  Hero,
  Partners,
  ProblemCheckerA,
  Audit,
  Results,
  Marketing,
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

const Approach = dynamic(
  () => import('@/components/sections/Approach').then(m => ({ default: m.Approach })),
);

const Knowledge = dynamic(
  () => import('@/components/sections/Knowledge').then(m => ({ default: m.Knowledge })),
);

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  // FAQ items loaded from JSON content layer
  const faqItems = getFAQItemsContent().items;

  // V2 content for new sections (problem checker, process)
  const v2Content = getHomepageV2Content();

  // CMS Data Fetching
  const accessToken = getAccessToken();
  const cmsData = accessToken
    ? await fetchHomepageData(accessToken)
    : getEmptyHomepageData();

  // Destructure for easier template access
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
      {/* Hero Section */}
      <Hero
        scarcityText={`2 client slots open for ${currentQuarter}`}
        caseStudies={lightCaseStudies}
        clients={clients}
        industries={industries}
      />

      {/* Partners Section */}
      <Partners
        testimonials={allTestimonials}
        clients={allClients}
      />

      {/* Problem Checker */}
      <ProblemCheckerA
        heading={v2Content.problem.heading}
        items={v2Content.problem.items}
      />

      {/* Case Study Slider Section */}
      <CaseStudySlider
        caseStudies={sliderCaseStudies}
        testimonials={testimonials}
      />

      {/* Audit Section */}
      <Audit />

      {/* Results Section (Bento Grid) */}
      <Results
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

      {/* Marketing Section */}
      <Marketing />

      {/* Approach Section (Process + Stats) */}
      <Approach />

      {/* How We Work (Process Timeline) */}
      <SectionContainer>
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
            {v2Content.process.heading}
          </h2>
          <div className="h-4" />
          <p className="text-lg text-surface-600">
            {v2Content.process.subtitle}
          </p>
        </div>

        <div className="mt-12 lg:mt-16">
          {/* Desktop: horizontal timeline */}
          <div className="hidden md:block">
            {/* Timeline bar */}
            <div className="relative flex items-start justify-between mb-12">
              <div className="absolute top-4 left-0 right-0 h-px bg-surface-200" />
              {v2Content.process.steps.map((step) => (
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
              {v2Content.process.steps.map((step) => (
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
            {v2Content.process.steps.map((step) => (
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

      {/* Knowledge/Blog Section */}
      <Knowledge
        posts={lightBlogPosts}
        categories={Array.from(categories.values())}
        authors={Array.from(teamMembers.values())}
      />

      {/* FAQ Section */}
      <FAQ items={faqItems} />

      {/* CTA Section */}
      <CTA />

    </>
  );
}
