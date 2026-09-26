import { getHomeV11Content, getIndustryV11Content, getSeoForArticleContent, SEO_FOR_ARTICLE_SLUGS } from '@/lib/content-utils';
import { getHomeV11Data } from '../home-v11/data';
import type { SeoForArticle } from './types';
import { hubCards } from './views';

/**
 * What every v11 industry page and the /seo-for hub need besides their own view: the shared copy (industry-v11.json),
 * the homepage copy and charts, and one card for every industry page (the related cards and the hub read these).
 */
export async function getIndustryShell() {
  const [home, c, data] = await Promise.all([getHomeV11Content(), getIndustryV11Content(), getHomeV11Data()]);
  const heads = Object.fromEntries(
    await Promise.all(SEO_FOR_ARTICLE_SLUGS.map(async (s) => [s, (await getSeoForArticleContent<SeoForArticle>(s)).hero.h1] as const)),
  );
  const cards = await hubCards(c.other, heads);
  return { home, c, data, cards };
}
