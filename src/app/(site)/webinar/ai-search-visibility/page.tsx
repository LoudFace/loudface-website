/**
 * Webinar (AI search visibility masterclass) — v11 (switched 2026-09-26).
 *
 * Composed from src/app/webinar-v11 inside the (site) group: the title and the live consent gate (WebinarConsentGate,
 * registration unchanged) beside the ticket, takeaways beside the Toku answer, the speakers, the agenda drawn to
 * scale, and the audit. After hero.startsAt (webinar-ai-search.json) the page stops selling a seat and points to the
 * recording in the recap post. SEO metadata and the Event JSON-LD are unchanged.
 */
import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../audit-v11/audit.css';
import '../../../webinar-v11/webinar.css';
import { getAiAuditContent, getHomeV11Content, getWebinarAiSearchContent } from '@/lib/content-utils';
import { WebinarV11 } from '../../../webinar-v11/WebinarV11';
import { RIVERSIDE_REGISTRATION_URL } from './_components/config';

export const metadata: Metadata = {
  title: 'Why Your Website Is Invisible in AI Search — Live Masterclass | LoudFace',
  description:
    'A 50-minute live breakdown of the exact content architecture, on-page changes, and platform decisions that took Toku from 0 to 86% AI visibility. Thursday, July 9 · 11:00 AM ET.',
  alternates: {
    canonical: '/webinar/ai-search-visibility',
  },
  openGraph: {
    title: 'Why Your Website Is Invisible in AI Search — Live Masterclass',
    description:
      'See the exact strategy that took Toku from 0 to 86% AI visibility on its core buyer search prompt. Live + Q&A · July 9, 11:00 AM ET.',
    type: 'website',
    url: '/webinar/ai-search-visibility',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: ['https://www.loudface.co/opengraph-image'],
  },
};

const EVENT_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'Why Your Website Is Invisible in AI Search — and How to Fix It',
  description:
    'A 50-minute live masterclass with LoudFace founder Arnel Bukva and Natalie Sangkagalo, Head of Marketing at Toku — covering the exact strategy that took Toku from 0 to 86% AI visibility.',
  // July 9, 2026 is EDT (UTC-4) — must match the calendar link (15:00 UTC).
  startDate: '2026-07-09T11:00:00-04:00',
  endDate: '2026-07-09T12:00:00-04:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  // Required by Google for online events.
  location: {
    '@type': 'VirtualLocation',
    url: 'https://www.loudface.co/webinar/ai-search-visibility',
  },
  image: [
    'https://www.loudface.co/images/speakers/arnel-bukva.jpg',
    'https://www.loudface.co/images/speakers/ella-theisinger.jpg',
    'https://www.loudface.co/images/speakers/natalie-sangkagalo.jpg',
  ],
  performer: [
    { '@type': 'Person', name: 'Arnel Bukva' },
    { '@type': 'Person', name: 'Ella Theisinger' },
    { '@type': 'Person', name: 'Natalie Sangkagalo' },
  ],
  organizer: {
    '@type': 'Organization',
    name: 'LoudFace',
    url: 'https://www.loudface.co',
  },
  // Registration is handled off-site by Riverside; surface it to Google as a free offer.
  offers: {
    '@type': 'Offer',
    url: RIVERSIDE_REGISTRATION_URL,
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    validFrom: '2026-06-26T00:00:00-04:00',
  },
};

export default async function WebinarPage() {
  const [c, audit, home] = await Promise.all([getWebinarAiSearchContent(), getAiAuditContent(), getHomeV11Content()]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_JSON_LD) }}
      />
      <WebinarV11 c={c} audit={audit} home={home} />
    </>
  );
}
