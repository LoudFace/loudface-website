import type { Metadata } from 'next';
import '../../../service-v3/service-v3.css';
import '../../../seo-for-v3/ai-startups.css';
import { buildPageMetadata } from '@/lib/seo-utils';
import { AI_STARTUPS_FAQ_ITEMS, AIStartupsPage } from '../../../seo-for-v3/AIStartupsPage';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'SEO, AEO and GEO for AI Startups',
  description: 'SEO, AEO and GEO for AI startups. Build the data-handling, governance, accuracy and documentation pages a security reviewer checks before they buy.',
  canonicalPath: '/seo-for/ai-startups',
});

const schemas = [
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' }, { '@type': 'ListItem', position: 2, name: 'SEO Services by Industry', item: 'https://www.loudface.co/seo-for' }, { '@type': 'ListItem', position: 3, name: 'SEO, AEO and GEO for AI Startups' }] },
  { '@context': 'https://schema.org', '@type': 'Service', name: 'SEO, AEO and GEO for AI Startups', description: 'Search and answer-engine strategy for AI-native startup websites, covering data handling, AI governance, accuracy evidence, model-provider dependency, crawler eligibility, and developer documentation.', provider: { '@type': 'Organization', name: 'LoudFace', url: 'https://www.loudface.co' }, areaServed: 'Worldwide', serviceType: 'Search Engine Optimization' },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: AI_STARTUPS_FAQ_ITEMS.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
];

export default function AiStartupsRoutePage() {
  return <div className="svcv3 aisv3">{schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}<AIStartupsPage /></div>;
}
