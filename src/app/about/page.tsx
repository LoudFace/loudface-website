/**
 * About Us Page
 *
 * Sections:
 * - Hero with CTA
 * - Counter stats (dark purple background)
 * - Our Journey
 * - Team grid with CMS integration + CTA card
 * - Awards (full-width border effect)
 * - FAQ
 * - Final CTA
 */
import type { Metadata } from 'next';
import Script from 'next/script';
import { fetchHomepageData, getAccessToken, getEmptyHomepageData } from '@/lib/cms-data';
import { getAboutContent } from '@/lib/content-utils';
import { asset } from '@/lib/assets';
import { Badge, BulletLabel, Button, SectionContainer, SectionHeader } from '@/components/ui';
import type { TeamMember, Client } from '@/lib/types';

export const metadata: Metadata = {
  title: 'About Us | Meet Our Team',
  description: "Learn about LoudFace, our mission, and the passionate team behind your next successful web project. Webflow Enterprise Partners with 7+ years of experience.",
  alternates: {
    canonical: '/about',
  },
};

export default async function AboutPage() {
  const content = getAboutContent();

  // Fetch CMS data for team members and clients
  const accessToken = getAccessToken();
  const cmsData = accessToken
    ? await fetchHomepageData(accessToken)
    : getEmptyHomepageData();

  const { teamMembers: teamMembersMap, allClients } = cmsData;

  // Convert Map to array for team members
  const teamMembers = teamMembersMap && teamMembersMap.size > 0
    ? Array.from(teamMembersMap.values()) as TeamMember[]
    : [];

  // Filter clients with logos
  const clientsWithLogos = allClients.filter(c => c['colored-logo']?.url) as Client[];

  // Helper to highlight words in headline
  function highlightWords(text: string, words: string[]): string {
    let result = text;
    words.forEach(word => {
      result = result.replace(new RegExp(`\\b${word}\\b`, 'gi'), `<span class="text-primary-600">${word}</span>`);
    });
    return result;
  }

  // Organization schema for SEO
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "LoudFace",
    "url": "https://www.loudface.co",
    "description": "Learn about LoudFace, our mission, and the passionate team behind your next successful web project.",
    "foundingDate": "2017",
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "minValue": 6
    }
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Hero Section */}
      <SectionContainer padding="lg">
        <div className="max-w-3xl mx-auto text-center">
          <Badge
            size="md"
            icon={<img src={asset(content.hero.badgeIcon)} alt="" className="w-6 h-6" loading="eager" />}
            className="mb-6"
          >
            {content.hero.badge}
          </Badge>

          {/* Headline with highlighted words */}
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-hero font-medium text-surface-900"
            dangerouslySetInnerHTML={{ __html: highlightWords(content.hero.headline, content.hero.highlightWords) }}
          />

          {/* Description */}
          <p className="mt-6 text-lg text-surface-600">
            {content.hero.description}
          </p>

          {/* CTA */}
          <div className="mt-8">
            <Button variant="primary" size="lg" calTrigger>
              {content.hero.ctaText}
            </Button>
          </div>
        </div>
      </SectionContainer>

      {/* Counter Section (Dark Purple Background) */}
      <SectionContainer className="bg-wine-950 text-wine-text">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.counter.stats.map((stat, index) => (
            <div key={index} className="border border-wine-border/30 rounded-lg p-8">
              <span className="text-4xl md:text-5xl font-medium text-white/60">{stat.number}</span>
              <h3 className="mt-2 text-sm font-medium text-wine-text">{stat.label}</h3>
              <p className="mt-6 text-wine-text/70 text-sm leading-relaxed">{stat.description}</p>
            </div>
          ))}
          {/* Award badge card */}
          <div className="bg-wine-900 rounded-lg p-8 flex items-center justify-center">
            <img
              src={asset(content.counter.awardBadge)}
              alt="10+ Best Website Creator 2024"
              className="max-w-full max-h-[22.5rem]"
              loading="lazy"
            />
          </div>
        </div>
      </SectionContainer>

      {/* Journey Section */}
      <SectionContainer padding="lg">
        <div>
          <SectionHeader
            eyebrow={content.journey.badge}
            title={content.journey.headline}
            subtitle={content.journey.description}
            className="[&_h2]:max-w-lg"
          />
        </div>
      </SectionContainer>

      {/* Team Section */}
      <SectionContainer>
        {/* Header with CTA aligned right */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-12">
          <div>
            <SectionHeader
              eyebrow={content.team.badge}
              title={content.team.title}
              highlightWord={content.team.highlightWord}
              subtitle={content.team.subtitle}
            />
          </div>
          <div className="flex-shrink-0">
            <Button variant="primary" size="lg" calTrigger>
              Book an intro call
            </Button>
          </div>
        </div>

        {/* Team grid (CMS-powered) */}
        {teamMembers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div key={member.id || index}>
                <div className="aspect-[300/280] bg-surface-100 rounded-xl overflow-hidden">
                  {member['profile-picture']?.url ? (
                    <img
                      src={member['profile-picture'].url}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading={index < 3 ? 'eager' : 'lazy'}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-surface-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-bold text-surface-900">{member.name}</h3>
                <p className="mt-1 text-surface-600">{member['job-title'] || ''}</p>
                {member['bio-summary'] && (
                  <p className="mt-3 text-surface-600 text-sm leading-relaxed">{member['bio-summary']}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Accepting new clients CTA card */}
        <div className="mt-12 bg-surface-100 border border-surface-200 rounded-xl p-10 lg:p-12">
          <div className="flex items-center gap-2 mb-4">
            <img src={asset('/images/green-circle.svg')} alt="" className="w-3 h-3" />
            <span className="text-sm font-medium text-surface-900">{content.team.ctaCard.indicator}</span>
          </div>
          <h3 className="text-xl font-bold text-surface-900">{content.team.ctaCard.headline}</h3>
          <p className="mt-2 text-surface-600 max-w-2xl">{content.team.ctaCard.description}</p>
          <div className="mt-6">
            <Button variant="primary" size="lg" calTrigger>
              {content.team.ctaCard.ctaText}
            </Button>
          </div>

          {/* Client logos grid */}
          {clientsWithLogos.length > 0 && (
            <div className="mt-10 pt-8 border-t border-surface-200">
              <div className="flex flex-wrap items-center gap-6">
                {clientsWithLogos.map((client) => (
                  <div
                    key={client.id}
                    className="w-20 h-8 flex items-center justify-center"
                  >
                    <img
                      src={client['colored-logo']?.url}
                      alt={client.name}
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionContainer>

      {/* Awards Section */}
      <SectionContainer padding="lg">
        <SectionHeader
          eyebrow={content.awards.badge}
          title={content.awards.title}
          subtitle={content.awards.description}
          className="[&_p]:max-w-2xl"
        />
        <div className="mt-8">
          <Button variant="primary" size="lg" calTrigger>
            {content.awards.ctaText}
          </Button>
        </div>
      </SectionContainer>

      {/* Full-width award cards */}
      <div className="border-t border-b border-surface-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-surface-200">
          {content.awards.items.map((award, index) => (
            <div key={index} className="p-10 lg:p-16">
              <img
                src={asset(award.icon)}
                alt=""
                className="w-16 h-16 mb-8"
                loading="lazy"
              />
              <h4 className="text-xl font-bold text-surface-900">{award.title}</h4>
              <p className="mt-2 text-surface-600">{award.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <SectionContainer>
        <SectionHeader
          title={content.faq.title}
          highlightWord={content.faq.highlightWord}
        />

        <div className="mt-8 max-w-3xl">
          <div className="divide-y divide-surface-200 border-y border-surface-200">
            {content.faq.items.map((item, index) => (
              <details key={index} className="group faq-details">
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none select-none hover:bg-surface-50 -mx-4 px-4 transition-colors focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 rounded-lg">
                  <span className="text-base md:text-lg font-medium text-surface-900 pr-4">
                    {item.question}
                  </span>
                  <span className="flex-shrink-0 w-6 h-6 relative" aria-hidden="true">
                    <span className="absolute top-1/2 left-0 w-6 h-0.5 bg-surface-400 -translate-y-1/2 transition-transform group-open:rotate-0"></span>
                    <span className="absolute top-1/2 left-0 w-6 h-0.5 bg-surface-400 -translate-y-1/2 rotate-90 transition-transform group-open:rotate-0"></span>
                  </span>
                </summary>
                <div className="pb-5 pr-10 text-surface-600 leading-relaxed overflow-hidden animate-fade-in">
                  <p>{item.answer}</p>
                </div>
              </details>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-8">
            <p className="text-surface-600">{content.faq.footerText}</p>
            <div className="mt-4">
              <Button variant="primary" size="lg" calTrigger>
                {content.faq.footerCtaText}
              </Button>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* Final CTA Section */}
      <SectionContainer padding="lg" className="bg-surface-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
            {content.finalCta.title}
          </h2>
          <p className="mt-6 text-lg text-surface-600">
            {content.finalCta.description}
          </p>
          <div className="mt-10">
            <Button variant="primary" size="lg" calTrigger>
              {content.finalCta.ctaText}
            </Button>
          </div>
        </div>
      </SectionContainer>
    </>
  );
}
