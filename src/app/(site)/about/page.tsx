/**
 * About — v3 design (componentized).
 *
 * Faithful port of the client-approved about-v3 composite, composed from the
 * about-v3 section components inside the (site) group so it inherits the shared
 * Header/Footer + PostHog/GTM/Cal chrome. The shared Header renders in its
 * dark-hero variant on /about (wired in (site)/layout.tsx), and the shared
 * Footer is suppressed there so only the v3 FooterV3 (same as the homepage)
 * renders. Bespoke
 * styling is about-v3.css, imported route-scoped here (it does NOT load on other
 * (site) pages) and scoped under .abv3 via :where() so it can't leak onto shared
 * chrome.
 *
 * Team members come live from Sanity (getAboutTeam) — the hero mosaic, the team
 * ladder, and the derived headcount figures all read from that array, so the
 * page stays correct as the team changes. Per-person fact/quote copy is
 * editorial (TEAM_COPY in ./data). SEO metadata (canonical) + the JSON-LD blocks
 * are preserved from the previous about page.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../about-v3/about-v3.css';
import { getAboutTeam } from '../../about-v3/data';
import { HeroAbout } from '../../about-v3/HeroAbout';
import { Ledger } from '../../about-v3/Ledger';
import { Story } from '../../about-v3/Story';
import { Team } from '../../about-v3/Team';
import { Values } from '../../about-v3/Values';
import { Awards } from '../../about-v3/Awards';
import { Faq } from '../../about-v3/Faq';
import { CoverCTA } from '../../about-v3/CoverCTA';
import { FooterV3 } from '../../home-v3/FooterV3';
import { AboutV3Scripts } from '../../about-v3/Scripts';

export const metadata: Metadata = {
  // No pipe + brand suffix here: the (site) layout's title template ("%s | LoudFace")
  // already appends " | LoudFace" — adding it again would double up the brand name.
  title: 'About LoudFace — AI-Native B2B SaaS Organic Growth',
  description:
    'Meet the AI-native B2B SaaS organic growth agency that gets companies discovered across Google and AI search, then turns visibility into customers.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About LoudFace | AI-Native B2B SaaS Organic Growth',
    description:
      'Meet the AI-native B2B SaaS organic growth agency that runs GEO, SEO, AEO, content, and conversion across client stacks.',
    type: 'website',
    url: '/about',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'About LoudFace' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'About LoudFace | AI-Native B2B SaaS Organic Growth',
    description:
      'Meet the AI-native B2B SaaS organic growth agency that runs GEO, SEO, AEO, content, and conversion across client stacks.',
    images: ['/opengraph-image'],
  },
};

export default async function AboutPage() {
  const team = await getAboutTeam();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'About' },
    ],
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'About LoudFace',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: 'https://www.loudface.co/about',
  };

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About LoudFace',
    description:
      'Meet LoudFace, an AI-native B2B SaaS organic growth agency that gets companies discovered across Google and AI search, then turns visibility into customers.',
    url: 'https://www.loudface.co/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: 'https://www.loudface.co',
      description:
        'AI-native B2B SaaS organic growth agency. GEO, SEO, AEO, content, and conversion lead the work. Webflow and other stacks support the program.',
      foundingDate: '2019',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Dubai',
        addressCountry: 'AE',
      },
      ...(team.length > 0 && {
        employee: team.map((member) => ({
          '@type': 'Person',
          name: member.name,
          jobTitle: member.role || undefined,
        })),
      }),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* .abv3 scopes the bespoke resets so they can't touch the shared Header/Footer/Cal chrome. */}
      <div className="abv3">
        <HeroAbout team={team} />
        <Ledger teamCount={team.length} />
        <Story team={team} />
        <Team team={team} />
        <Values />
        <Awards />
        <Faq teamCount={team.length} />
        <CoverCTA />
        {/* Shared v3 footer (same as the homepage). Rendered inside .abv3 so its
            re-scoped footer CSS in about-v3.css applies with full isolation —
            home-v3.css is NOT imported here (its global component classes would
            leak onto the about sections). */}
        <FooterV3 />
      </div>

      <AboutV3Scripts />
    </>
  );
}
