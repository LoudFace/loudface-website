import { cache } from 'react';
import {
  getHomeV11Content, getIndustryV11Content, getNavContent, getSeoForArticleContent, SEO_FOR_ARTICLE_SLUGS,
} from '@/lib/content-utils';
import type { NavV11Data } from './NavV11';

/**
 * Everything the v11 menus read, built once per request for every layout and preview that draws the header: nav.json's
 * `v11` block, the homepage's AI-answers tile for the Services card, and the buyer question each industry page is
 * built around (its answer window in industry-v11.json, or the first row of a long read's question table). The
 * questions are read from those pages' own content, so the menu never keeps a second copy (2026-09-27, menu A).
 */
export const getNavV11Data = cache(async (): Promise<NavV11Data> => {
  const [nav, home, industry, articles] = await Promise.all([
    getNavContent(),
    getHomeV11Content(),
    getIndustryV11Content(),
    Promise.all(SEO_FOR_ARTICLE_SLUGS.map((slug) => getSeoForArticleContent<{ questions: { rows: string[][] } }>(slug))),
  ]);
  const questions: Record<string, string> = {};
  for (const [slug, chat] of Object.entries(industry.chat)) questions[`/seo-for/${slug}`] = chat.question;
  SEO_FOR_ARTICLE_SLUGS.forEach((slug, i) => { questions[`/seo-for/${slug}`] = articles[i].questions.rows[0][0]; });
  return { ...nav.v11, feature: { ...home.bento.tiles[0], chat: home.bento.chat }, questions };
});
