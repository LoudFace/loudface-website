/**
 * Services (hub) — v3 design (componentized).
 *
 * Net-new /services hub. Faithful port of the approved services-v3 "proof-stack"
 * concept (the shipped work argues the services; each exhibit credits the
 * services that built it, chips route to the child pages). Composed from the
 * services-v3 section components inside the (site) group so it inherits the
 * shared Header/Footer + PostHog/GTM/Cal chrome. The shared Header renders in
 * its dark-hero variant on /services (wired in (site)/layout.tsx), and the
 * shared Footer is suppressed there so only the v3 FooterV3 (same component as
 * the homepage/About/Pricing) renders. Bespoke styling is services-v3.css,
 * imported route-scoped here and scoped under .svv3 via :where() so it can't
 * leak onto shared chrome.
 *
 * Live Sanity data: the hero work-wall + the three exhibit screenshots come from
 * Sanity by slug (getServicesImages — the same helper/slug set the homepage
 * SelectedWork uses) with hardcoded CDN fallbacks. The 7-service directory rows,
 * the exhibit credit chips, and the clarifier all link to the real child routes.
 * SEO: canonical /services, BreadcrumbList + ItemList (7 services) + FAQPage
 * JSON-LD (the FAQ items are single-sourced with the accordion).
 *
 * NOTE: /services previously 301-redirected to /services/webflow (next.config.ts).
 * That redirect was removed so this hub can resolve. Do NOT re-add it.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../services-v3/services-v3.css';
import { getServicesImages, SERVICES_FAQ, SERVICES } from '../../services-v3/data';
import { HeroServices } from '../../services-v3/HeroServices';
import { LogosMarquee } from '../../services-v3/LogosMarquee';
import { Exhibits } from '../../services-v3/Exhibits';
import { ServicesIndex } from '../../services-v3/ServicesIndex';
import { Clarifier } from '../../services-v3/Clarifier';
import { Faq } from '../../services-v3/Faq';
import { CoverCTA } from '../../services-v3/CoverCTA';
import { FooterV3 } from '../../home-v3/FooterV3';
import { ServicesV3Scripts } from '../../services-v3/Scripts';

const SITE = 'https://www.loudface.co';

export const metadata: Metadata = {
  // The (site) layout's title template ("%s | LoudFace") appends the brand.
  title: 'Services: Webflow, SEO, AEO & GEO for B2B SaaS',
  description:
    'Seven services, one team, behind 200+ B2B SaaS websites — Webflow, SEO, AEO, GEO, CRO, UX/UI and copywriting. See the real work, then book a strategy call.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Services: Webflow, SEO, AEO & GEO for B2B SaaS | LoudFace',
    description:
      'Seven services, one team, behind 200+ B2B SaaS websites. See the real work — each site tagged with the services that shipped it — then follow the outcome to the service that did it.',
    type: 'website',
    url: '/services',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace Services' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Services: Webflow, SEO, AEO & GEO for B2B SaaS | LoudFace',
    description:
      'Seven services, one team, behind 200+ B2B SaaS websites — Webflow, SEO, AEO, GEO, CRO, UX/UI and copywriting.',
    images: ['/opengraph-image'],
  },
};

export default async function ServicesPage() {
  const images = await getServicesImages();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE}/services` },
    ],
  };

  const servicesListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'LoudFace services for B2B SaaS',
    description:
      'Seven services across two tracks — Build (Webflow, UX/UI, CRO, copywriting) and Growth (SEO & AEO, GEO, Growth Autopilot).',
    itemListElement: SERVICES.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.name,
      url: `${SITE}/services/${s.slug}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: SERVICES_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Services: Webflow, SEO, AEO & GEO for B2B SaaS',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: `${SITE}/services`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* .svv3 scopes the bespoke resets so they can't touch the shared Header/Footer/Cal chrome. */}
      <div className="svv3">
        <HeroServices images={images} />
        <LogosMarquee />
        <Exhibits images={images} />
        <ServicesIndex />
        <Clarifier />
        <Faq />
        <CoverCTA images={images} />
        {/* Shared v3 footer (same component as the homepage/About/Pricing). Rendered
            inside .svv3 so the re-scoped .ft footer CSS in services-v3.css applies
            with full isolation — home-v3.css is NOT imported here. */}
        <FooterV3 />
      </div>

      <ServicesV3Scripts />
    </>
  );
}
