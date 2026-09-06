import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import '../../../seo-for-v3/edtech.css';
import { buildPageMetadata } from '@/lib/seo-utils';
import { EDTECH_FAQ_ITEMS, EdTechPage } from '../../../seo-for-v3/EdTechPage';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'SEO, AEO and GEO for EdTech SaaS',
  description: 'SEO, AEO and GEO for edtech SaaS. Build the evidence, privacy, rostering and procurement pages institutional buyers check before they buy.',
  canonicalPath: '/seo-for/edtech',
});

const schemas = [
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' }, { '@type': 'ListItem', position: 2, name: 'SEO Services by Industry', item: 'https://www.loudface.co/seo-for' }, { '@type': 'ListItem', position: 3, name: 'SEO, AEO and GEO for EdTech SaaS' }] },
  { '@context': 'https://schema.org', '@type': 'Service', name: 'SEO, AEO and GEO for EdTech SaaS', description: 'Search and answer-engine strategy for edtech SaaS websites, evidence pages, student data privacy, rostering integrations, comparisons, and institutional procurement questions.', provider: { '@type': 'Organization', name: 'LoudFace', url: 'https://www.loudface.co' }, areaServed: 'Worldwide', serviceType: 'Search Engine Optimization' },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: EDTECH_FAQ_ITEMS.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
];

export default function EdtechRoutePage() {
  return <div className="svcv3 edv3">{schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}<EdTechPage /></div>;
}
