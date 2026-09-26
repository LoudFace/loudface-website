/**
 * Contact — v11 (switched 2026-09-26).
 *
 * Composed from src/app/contact-v11 inside the (site) group: the booking card, what happens next (NextSteps, with
 * the example screens from pricing-v11.json), the offices, the FAQ. There is deliberately NO contact form and NO
 * newsletter form on this page; the conversion is the Cal.com modal (data-cal-trigger → CalHandler) plus a mailto
 * link. Copy in contact.json. SEO metadata and the JSON-LD (BreadcrumbList, ContactPage with both office addresses,
 * FAQPage from the same contact.json FAQ the page shows, speakable) are unchanged.
 *
 * NOTE: /contact previously 301-redirected to / (next.config.ts + LEGACY_URL_MAP in seo-utils.ts). Both entries were
 * removed (2026-07-15) so this page can resolve. Do NOT re-add them.
 */
export const revalidate = 60;

import type { Metadata } from 'next';
import { getContactContent, getHomeV11Content, getPricingV11Content } from '@/lib/content-utils';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/svc.css';
import '../../contact-v11/contact.css';
import { CONTACT_FAQ, OFFICES, CONTACT_EMAIL } from '../../contact-v3/data';
import { ContactV11 } from '../../contact-v11/ContactV11';

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
  const [c, home, x] = await Promise.all([getContactContent(), getHomeV11Content(), getPricingV11Content()]);

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
      {[breadcrumbSchema, contactPageSchema, faqSchema, speakableSchema].map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <ContactV11 c={c} home={home} steps={x.steps} />
    </>
  );
}
