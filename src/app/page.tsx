/**
 * Homepage
 *
 * Data Sources:
 * - CMS: case-studies, clients, testimonials, blog, categories, team-members, industries
 * - JSON: faq-items.json (via content layer)
 *
 * Components: Hero, Partners, CaseStudySlider, Audit, Results,
 *             Marketing, Approach, Knowledge, FAQ, CTA
 */
import { fetchHomepageData, getAccessToken, getEmptyHomepageData } from '@/lib/cms-data';
import { getFAQItemsContent } from '@/lib/content-utils';
import type { CaseStudy } from '@/lib/types';
import {
  Hero,
  Partners,
  CaseStudySlider,
  Audit,
  Results,
  Marketing,
  Approach,
  Knowledge,
  FAQ,
  CTA,
} from '@/components';

export default async function HomePage() {
  // FAQ items loaded from JSON content layer
  const faqItems = getFAQItemsContent().items;

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

  return (
    <>
      {/* Hero Section */}
      <Hero
        caseStudies={lightCaseStudies}
        clients={clients}
        industries={industries}
      />

      {/* Partners Section */}
      <Partners
        testimonials={allTestimonials}
        clients={allClients}
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
