import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import '../../../seo-for-v3/hr-tech.css';
import { buildPageMetadata } from '@/lib/seo-utils';
import { HR_FAQ_ITEMS, HRTechPage } from '../../../seo-for-v3/HRTechPage';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'SEO, AEO and GEO for HR Tech SaaS',
  description: 'SEO, AEO and GEO for HR tech SaaS. Build a buyer-led discovery system for HRIS, ATS and payroll categories.',
  canonicalPath: '/seo-for/hr-tech',
});

const schemas = [
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' }, { '@type': 'ListItem', position: 2, name: 'SEO Services by Industry', item: 'https://www.loudface.co/seo-for' }, { '@type': 'ListItem', position: 3, name: 'SEO, AEO and GEO for HR Tech SaaS' }] },
  { '@context': 'https://schema.org', '@type': 'Service', name: 'SEO, AEO and GEO for HR Tech SaaS', description: 'Search and answer-engine strategy for HR tech SaaS websites, integrations, migrations, comparisons, and buyer questions.', provider: { '@type': 'Organization', name: 'LoudFace', url: 'https://www.loudface.co' }, areaServed: 'Worldwide', serviceType: 'Search Engine Optimization' },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: HR_FAQ_ITEMS.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
];

export default function HrTechPage() {
  return <div className="svcv3 hrv3">{schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}<HRTechPage /></div>;
}
