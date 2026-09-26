/**
 * ai-startups — the v11 industry long read (IndustryArticleV11, switched 2026-09-26). The copy moved unchanged into
 * seo-for-ai-startups.json. Metadata and the BreadcrumbList + Service JSON-LD are unchanged; the FAQPage JSON-LD reads the
 * same JSON FAQ the page shows.
 */
import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../case-v11/case.css';
import '../../../seo-for-v11/industry.css';
import { buildPageMetadata } from '@/lib/seo-utils';
import { getSeoForArticleContent, rawContent } from '@/lib/content-utils';
import { IndustryArticleV11 } from '../../../seo-for-v11/IndustryArticleV11';
import { relatedCards } from '../../../seo-for-v11/related';
import { getIndustryShell } from '../../../seo-for-v11/shell';
import type { SeoForArticle } from '../../../seo-for-v11/types';

// The FAQ this page shows, unmarked (JSON-LD never carries editing marks).
const FAQ_ITEMS = rawContent<SeoForArticle>('seo-for-ai-startups').faq.items;

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: 'SEO, AEO and GEO for AI Startups',
  description: 'SEO, AEO and GEO for AI startups. Build the data-handling, governance, accuracy and documentation pages a security reviewer checks before they buy.',
  canonicalPath: '/seo-for/ai-startups',
});

const schemas = [
  { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.loudface.co' }, { '@type': 'ListItem', position: 2, name: 'SEO Services by Industry', item: 'https://www.loudface.co/seo-for' }, { '@type': 'ListItem', position: 3, name: 'SEO, AEO and GEO for AI Startups' }] },
  { '@context': 'https://schema.org', '@type': 'Service', name: 'SEO, AEO and GEO for AI Startups', description: 'Search and answer-engine strategy for AI-native startup websites, covering data handling, AI governance, accuracy evidence, model-provider dependency, crawler eligibility, and developer documentation.', provider: { '@type': 'Organization', name: 'LoudFace', url: 'https://www.loudface.co' }, areaServed: 'Worldwide', serviceType: 'Search Engine Optimization' },
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ_ITEMS.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) },
];

export default async function AiStartupsRoutePage() {
  const [{ home, c, data, cards }, a] = await Promise.all([getIndustryShell(), getSeoForArticleContent<SeoForArticle>('ai-startups')]);
  return (
    <>
      {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <IndustryArticleV11 slug="ai-startups" a={a} c={c} home={home} data={data} related={relatedCards(cards, 'ai-startups', [])} />
    </>
  );
}
