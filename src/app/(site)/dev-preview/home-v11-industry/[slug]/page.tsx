import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '../../../../home-v11/home-v11.css';
import '../../../../service-v11/service-v11.css';
import '../../../../service-v11/cro-sections.css';
import '../../../../service-v11/svc.css';
import '../../../../case-v11/case.css';
import '../../../../seo-for-v11/industry.css';
import { getHomeV11Content, getIndustryV11Content, getSeoForArticleContent, SEO_FOR_ARTICLE_SLUGS, type SeoForArticleSlug } from '@/lib/content-utils';
import { getHomeV11Data } from '../../../../home-v11/data';
import { IndustryArticleV11 } from '../../../../seo-for-v11/IndustryArticleV11';
import { IndustryPageV11 } from '../../../../seo-for-v11/IndustryPageV11';
import type { SeoForArticle } from '../../../../seo-for-v11/types';
import { relatedCards } from '../../../../seo-for-v11/related';
import { b2bView, cmsIndustryView, hubCards, saasView } from '../../../../seo-for-v11/views';

export const metadata: Metadata = { title: 'Industry page v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 industry pages on any /seo-for/<slug>: the three long reads, SaaS and B2B from JSON, the rest
 *  from Sanity. */
export default async function IndustryV11Preview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [home, c, data] = await Promise.all([getHomeV11Content(), getIndustryV11Content(), getHomeV11Data()]);
  const heads = Object.fromEntries(await Promise.all(SEO_FOR_ARTICLE_SLUGS.map(async (s) => [s, (await getSeoForArticleContent<SeoForArticle>(s)).hero.h1] as const)));
  const all = await hubCards(c.other, heads);
  if ((SEO_FOR_ARTICLE_SLUGS as string[]).includes(slug)) {
    const a = await getSeoForArticleContent<SeoForArticle>(slug as SeoForArticleSlug);
    return <IndustryArticleV11 slug={slug} a={a} c={c} home={home} data={data} related={relatedCards(all, slug, [])} />;
  }
  const view = slug === 'saas' ? await saasView() : slug === 'b2b' ? await b2bView() : await cmsIndustryView(slug);
  if (!view) notFound();
  return <IndustryPageV11 v={view} c={c} home={home} data={data} related={relatedCards(all, slug, view.work.map((w) => w.slug))} />;
}
