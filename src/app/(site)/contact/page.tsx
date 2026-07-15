/**
 * Contact — v3 design (componentized). NET-NEW route.
 *
 * Faithful port of the approved contact-v3 "first-move" concept (electric hero
 * + booking panel + engagement thread), composed from the contact-v3 section
 * components inside the (site) group so it inherits the shared Header/Footer +
 * PostHog/GTM/Cal chrome. The shared Header renders in its dark-hero variant
 * on /contact (wired in (site)/layout.tsx), and the shared Footer is
 * suppressed there so only the v3 FooterV3 (same component as the other v3
 * pages) renders. Bespoke styling is contact-v3.css, imported route-scoped
 * here and scoped under .ctv3 via :where() so it can't leak onto shared chrome.
 *
 * There is deliberately NO contact form and NO newsletter form on this page —
 * the sole conversion mechanism is the Cal.com modal (data-cal-trigger →
 * CalHandler), plus a mailto escape hatch. The newsletter API is a known
 * silent no-op; do not add a form here that posts to it.
 *
 * Live Sanity data: the founder headshot (teamMember arnel-bukva, same fetch
 * the About page uses; initials fallback). SEO: canonical /contact,
 * BreadcrumbList + ContactPage JSON-LD — the ContactPage schema carries BOTH
 * office PostalAddresses (San Francisco previously had zero structured-data
 * presence anywhere on the site; this page fixes that) + a contactPoint with
 * the public email. FAQPage JSON-LD is generated from the same CONTACT_FAQ
 * items the accordion renders.
 *
 * NOTE: /contact previously 301-redirected to / (next.config.ts +
 * LEGACY_URL_MAP in seo-utils.ts). Both entries were removed (2026-07-15) so
 * this page can resolve. Do NOT re-add them.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import '../../contact-v3/contact-v3.css';
import { getContactFounder, CONTACT_FAQ, OFFICES, CONTACT_EMAIL } from '../../contact-v3/data';
import { HeroContact } from '../../contact-v3/HeroContact';
import { LogosMarquee } from '../../contact-v3/LogosMarquee';
import { NextSteps } from '../../contact-v3/NextSteps';
import { OfficesBand } from '../../contact-v3/OfficesBand';
import { Faq } from '../../contact-v3/Faq';
import { CoverCTA } from '../../contact-v3/CoverCTA';
import { FooterV3 } from '../../home-v3/FooterV3';
import { ContactV3Scripts } from '../../contact-v3/Scripts';

const SITE = 'https://www.loudface.co';

export const metadata: Metadata = {
  // The (site) layout's title template ("%s | LoudFace") appends the brand.
  title: 'Contact LoudFace — Book a 30-Minute Intro Call',
  description:
    'Book a free 30-minute intro call with LoudFace. We look at your B2B SaaS site together and tell you exactly what we would change — no forms, no pitch deck.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact LoudFace — Book a 30-Minute Intro Call | LoudFace',
    description:
      'Book a free 30-minute intro call with LoudFace. We look at your B2B SaaS site together and tell you exactly what we would change — no forms, no pitch deck.',
    type: 'website',
    url: '/contact',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Contact LoudFace' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'Contact LoudFace — Book a 30-Minute Intro Call | LoudFace',
    description:
      'Book a free 30-minute intro call with LoudFace. We look at your B2B SaaS site together and tell you exactly what we would change — no forms, no pitch deck.',
    images: ['/opengraph-image'],
  },
};

export default async function ContactPage() {
  const founder = await getContactFounder();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Contact' },
    ],
  };

  // ContactPage schema — the one place on the site where BOTH offices exist as
  // machine-readable PostalAddresses (the Organization schema in the root
  // layout only carries Dubai; the SF address was previously visible-only).
  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact LoudFace',
    description:
      'Book a free 30-minute intro call with LoudFace, the WebOps and growth team for B2B SaaS.',
    url: `${SITE}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'LoudFace',
      url: SITE,
      email: CONTACT_EMAIL,
      address: OFFICES.map((o) => o.schema),
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: CONTACT_EMAIL,
        availableLanguage: 'en',
      },
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CONTACT_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Contact LoudFace — Book a 30-Minute Intro Call',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]'],
    },
    url: `${SITE}/contact`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* .ctv3 scopes the bespoke resets so they can't touch the shared Header/Footer/Cal chrome. */}
      <div className="ctv3">
        <HeroContact />
        <LogosMarquee />
        <NextSteps />
        <OfficesBand founder={founder} />
        <Faq />
        <CoverCTA />
        {/* Shared v3 footer (same component as the homepage/About/Pricing/Services).
            Rendered inside .ctv3 so the re-scoped .ft footer CSS in contact-v3.css
            applies with full isolation — home-v3.css is NOT imported here. */}
        <FooterV3 />
      </div>

      <ContactV3Scripts />
    </>
  );
}
