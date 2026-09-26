import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../seo-for-v11/industry.css';
import { getHomeV11Content, getIndustryV11Content, getSeoForArticleContent, getSeoForHubContent, SEO_FOR_ARTICLE_SLUGS } from '@/lib/content-utils';
import { getHomeV11Data } from '../../../home-v11/data';
import { IndustryHubV11 } from '../../../seo-for-v11/IndustryHubV11';
import type { SeoForArticle } from '../../../seo-for-v11/types';
import { hubCards } from '../../../seo-for-v11/views';

export const metadata: Metadata = { title: 'Industries hub v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 /seo-for hub before the live route switches over. */
export default async function IndustriesV11Preview() {
  const [home, c, h, data] = await Promise.all([getHomeV11Content(), getIndustryV11Content(), getSeoForHubContent(), getHomeV11Data()]);
  const heads = Object.fromEntries(await Promise.all(SEO_FOR_ARTICLE_SLUGS.map(async (s) => [s, (await getSeoForArticleContent<SeoForArticle>(s)).hero.h1] as const)));
  const cards = await hubCards(c.other, heads);
  return <IndustryHubV11 h={h} cards={cards} c={c} home={home} data={data} />;
}
