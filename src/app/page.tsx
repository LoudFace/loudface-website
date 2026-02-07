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
import { asset } from '@/lib/assets';
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

  return (
    <>
      {/* Hero Section */}
      <Hero
        caseStudies={caseStudies}
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
        caseStudies={caseStudies}
        clients={clients}
        industries={industries}
        testimonials={testimonials}
      />

      {/* Audit Section */}
      <Audit />

      {/* Results Section (Bento Grid) */}
      <Results
        caseStudies={(() => {
          const targetSlugs = ['viaduct', 'dimer-health'];
          const picked = targetSlugs
            .map((slug) => caseStudies.find((s) => s.slug === slug))
            .filter(Boolean) as CaseStudy[];
          return picked.length === 2
            ? picked
            : caseStudies.filter((s) => s.featured && s.testimonial).slice(0, 2);
        })()}
        testimonial={
          (() => {
            const viaduct = caseStudies.find((s) => s.slug === 'viaduct');
            const studyWithTestimonial = viaduct?.testimonial
              ? viaduct
              : caseStudies.find((s) => s.featured && s.testimonial);
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
        posts={blogPosts}
        categories={Array.from(categories.values())}
        authors={Array.from(teamMembers.values())}
      />

      {/* FAQ Section */}
      <FAQ items={faqItems} />

      {/* CTA Section */}
      <CTA />

      {/* Webflow Enterprise Partner Badge */}
      <a
        href="https://webflow.com/@loudface"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 transition-opacity hover:opacity-80"
        aria-label="Webflow Enterprise Partner"
      >
        <img
          loading="lazy"
          src={asset('/images/Enterprise-Blue-Badge.webp')}
          alt="Webflow Enterprise Partner Badge"
          className="w-24 h-auto drop-shadow-lg"
        />
      </a>
    </>
  );
}
