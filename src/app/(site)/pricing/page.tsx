/**
 * Pricing — v3 design (componentized).
 *
 * Faithful port of the approved pricing-v3 "stage-tiers" hybrid concept,
 * composed from the pricing-v3 section components inside the (site) group so
 * it inherits the shared Header/Footer + PostHog/GTM/Cal chrome. The shared
 * Header renders in its dark-hero variant on /pricing (wired in
 * (site)/layout.tsx), and the shared Footer is suppressed there so only the
 * v3 FooterV3 (same component as the homepage/About) renders. Bespoke styling
 * is pricing-v3.css, imported route-scoped here and scoped under .prv3 via
 * :where() so it can't leak onto shared chrome.
 *
 * Live Sanity data: testimonials (getPricingTestimonials — Toku/Eraser/Icypeas
 * with headshots) and the client-logo marquee (same logo set as the homepage
 * band). SEO metadata is preserved from the previous pricing page; the
 * FAQPage schema is generated from the new FAQ content (PRICING_FAQ).
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../pricing-v3/pricing-v3.css';
import { getPricingTestimonials, PRICING_FAQ } from '../../pricing-v3/data';
import { HeroPricing } from '../../pricing-v3/HeroPricing';
import { LogosMarquee } from '../../pricing-v3/LogosMarquee';
import { HowItWorks } from '../../pricing-v3/HowItWorks';
import { Tracks } from '../../pricing-v3/Tracks';
import { Compare } from '../../pricing-v3/Compare';
import { Includes, SpecialArrangements } from '../../pricing-v3/Includes';
import { Exhibits } from '../../pricing-v3/Exhibits';
import { Faq } from '../../pricing-v3/Faq';
import { CoverCTA } from '../../pricing-v3/CoverCTA';
import { FooterV3 } from '../../home-v3/FooterV3';
import { PricingV3Scripts } from '../../pricing-v3/Scripts';

export const metadata: Metadata = {
  title: 'Pricing: Solo, Dual & Scale Autopilot Plans',
  description:
    'Pick your Autopilot tier: Solo for one focused track, Dual for Build + Growth in parallel, or Scale for multi-track velocity. Custom-scoped to your goals.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing: Solo, Dual & Scale Autopilot Plans | LoudFace',
    description:
      'Pick your Autopilot tier: Solo for one focused track, Dual for Build + Growth in parallel, or Scale for multi-track velocity. Custom-scoped to your goals.',
    type: 'website',
    url: '/pricing',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'LoudFace Pricing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Pricing: Solo, Dual & Scale Autopilot Plans | LoudFace',
    description:
      'Pick your Autopilot tier: Solo for one focused track, Dual for Build + Growth in parallel, or Scale for multi-track velocity. Custom-scoped to your goals.',
    images: ['/opengraph-image'],
  },
};

export default async function PricingPage() {
  const testimonials = await getPricingTestimonials();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' },
      { '@type': 'ListItem', position: 2, name: 'Pricing' },
    ],
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Pricing: Solo, Dual & Scale Autopilot Plans',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: 'https://www.loudface.co/pricing',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PRICING_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* .prv3 scopes the bespoke resets so they can't touch the shared Header/Footer/Cal chrome. */}
      <div className="prv3">
        <HeroPricing />
        <LogosMarquee />
        <HowItWorks />
        <Tracks />
        <Compare />
        <Includes />
        <SpecialArrangements />
        <Exhibits testimonials={testimonials} />
        <Faq />
        <CoverCTA />
        {/* Shared v3 footer (same component as the homepage/About). Rendered inside
            .prv3 so the re-scoped .ft footer CSS in pricing-v3.css applies with full
            isolation — home-v3.css is NOT imported here. */}
        <FooterV3 />
      </div>

      <PricingV3Scripts />
    </>
  );
}
