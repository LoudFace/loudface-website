/**
 * The v11 industry views: each /seo-for/<industry> page's own copy mapped onto IndustryView, unchanged. SaaS and B2B
 * read their JSON (seo-for-saas.json, seo-for-b2b.json); the other industries read their Sanity `seoPage` document.
 * Server-only (Sanity client). The work each page shows is picked here by case-study slug: the vertical's own clients
 * first, then the nearest ones (a Sanity page carries no case studies of its own).
 */
import { fetchHomepageData, fetchItemBySlug } from '@/lib/cms-data';
import { getIndustryV11Content, getSeoForB2bContent, getSeoForSaasContent } from '@/lib/content-utils';
import type { HomepageData } from '@/lib/cms-data';
import type { SeoPage } from '@/lib/types';
import { extractFaqItems, extractPainPoints, extractStats, extractStrategySteps, getSeoForImages, toPlainText } from '../seo-for-v3/data';
import type { IndustryPost, IndustryView, IndustryWork } from './types';

/** Case studies per Sanity industry page, the vertical's own clients first. */
const WORK: Record<string, string[]> = {
  fintech: ['toku-ai-cited-pipeline', 'stealth-fintech-ai-visibility', 'liqid', 'zeiierman'],
  startups: ['genie-teacher-organic-growth', 'eraser', 'codeop', 'b2b-saas-brand-and-website-redesign-case-study'],
  ecommerce: ['montblanc', 'radisson-hotels-group', 'mr-grateful', 'brandfirm'],
  healthcare: ['dimer-health', 'institute-of-medical-physics', 'genie-teacher-organic-growth', 'codeop'],
  cybersecurity: ['hoxhunt', 'stealth-fintech-ai-visibility', 'eraser', 'dimer-health'],
  devtools: ['eraser', 'speckle', 'hoxhunt', 'codeop'],
};

/** The Sanity case studies as work cards: the client, its headline result and the study's cover. */
function cmsWork(cms: HomepageData, slugs: string[], images: Record<string, string>): IndustryWork[] {
  return slugs
    .map((slug) => cms.caseStudies.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({
      slug: s.slug,
      // a study with no client record is named by its title's first part ("Stealth Fintech: 0.53% to 8% …")
      client: (s.client && cms.clients.get(s.client)?.name) || s.name.split(':')[0],
      number: s['result-1---number'],
      title: s['result-1---title'],
      imageUrl: images[s.slug],
    }));
}

export async function saasView(): Promise<IndustryView> {
  const c = await getSeoForSaasContent();
  const slugs = c.caseStudies.items.map((s) => s.slug);
  const images = await getSeoForImages(slugs);
  return {
    key: 'saas',
    eyebrow: c.hero.eyebrow,
    h1: c.hero.headline,
    sub: c.hero.subheadline,
    work: c.caseStudies.items.map((s) => ({ slug: s.slug, client: s.name, title: s.metric, imageUrl: images[s.slug] })),
    workTitle: c.caseStudies.headline,
    painTitle: c.problem.label,
    pains: c.problem.items.map((p) => ({ title: p.title, sub: p.subtitle, desc: p.body })),
    layers: c.system.layers.map((l) => ({ title: l.title, subtitle: l.subtitle, items: l.items })),
    layersTitle: c.system.headline,
    layersLede: c.system.body,
    resultsTitle: c.numbers.headline,
    stats: c.numbers.stats,
    strategyTitle: c.howWeWork.headline,
    strategyLede: c.howWeWork.body,
    steps: c.howWeWork.steps.map((s) => ({ title: s.title, desc: s.description })),
    offer: { headline: c.ctaBreak.headline, sub: c.ctaBreak.subheadline, cta: c.ctaBreak.primaryCta, href: '/ai-audit' },
    posts: [],
    faqTitle: c.faq.label,
    faqItems: c.faq.items,
    ctaTitle: c.bottomCta.headline,
    ctaSubtitle: c.bottomCta.body,
  };
}

export async function b2bView(): Promise<IndustryView> {
  const c = await getSeoForB2bContent();
  const slugs = c.caseStudies.items.map((s) => s.slug);
  const images = await getSeoForImages(slugs);
  return {
    key: 'b2b',
    eyebrow: c.hero.eyebrow,
    h1: c.hero.headline,
    sub: c.hero.subheadline,
    work: c.caseStudies.items.map((s) => ({ slug: s.slug, client: s.name, title: s.metric, imageUrl: images[s.slug] })),
    workTitle: c.caseStudies.headline,
    painTitle: c.problem.label,
    pains: c.problem.items.map((p) => ({ title: p.title, sub: p.subtitle, desc: p.body })),
    resultsTitle: c.stats.headline,
    stats: c.stats.items,
    strategyTitle: c.howWeBuild.headline,
    strategyLede: c.howWeBuild.body,
    steps: c.howWeBuild.steps.map((s) => ({ title: s.title, desc: s.description })),
    offer: { headline: c.ctaBreak.headline, sub: c.ctaBreak.subheadline, cta: c.ctaBreak.primaryCta, href: '/ai-audit' },
    posts: c.relatedInsights.items.map((p) => ({ href: `/blog/${p.slug}`, title: p.title })),
    faqTitle: c.faq.label,
    faqItems: c.faq.items,
    ctaTitle: c.bottomCta.headline,
    ctaSubtitle: c.bottomCta.body,
  };
}

function parseDeliverables(html: string): { title: string; description?: string }[] {
  const items = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? [];
  return items
    .map((item) => toPlainText(item))
    .filter(Boolean)
    .map((text) => {
      const split = text.match(/^([^:]{3,60}):\s*(.+)$/);
      return split ? { title: split[1].trim(), description: split[2].trim() } : { title: text };
    })
    .slice(0, 8);
}

/** A Sanity industry page (/seo-for/<slug>); null when the document does not exist. */
export async function cmsIndustryView(slug: string): Promise<IndustryView | null> {
  const [page, cms, labels] = await Promise.all([fetchItemBySlug<SeoPage>('seo-pages', slug), fetchHomepageData(), getIndustryV11Content().then((c) => c.labels)]);
  if (!page) return null;
  const industryName = page.industry ? cms.industries.get(page.industry)?.name : undefined;
  const slugs = WORK[slug] ?? cms.caseStudies.slice(0, 4).map((s) => s.slug);
  const images = await getSeoForImages(slugs);

  let posts: IndustryPost[] = [];
  const cat = (p: (typeof cms.blogPosts)[number]) => (p.category ? cms.categories.get(p.category)?.name : undefined);
  if (industryName) posts = cms.blogPosts.filter((p) => cat(p)?.toLowerCase().includes(industryName.toLowerCase())).slice(0, 3).map((p) => ({ href: `/blog/${p.slug}`, title: p.name, meta: cat(p) }));

  return {
    key: slug,
    eyebrow: `SEO for ${industryName ?? page.name}`,
    h1: page['hero-headline'] || page.name,
    lead: page['hero-subtitle'],
    sub: page['hero-description'],
    work: cmsWork(cms, slugs, images),
    workTitle: labels.workTitle,
    painTitle: page['pain-points-title'] || 'Common SEO challenges',
    pains: extractPainPoints(page),
    deliverables: page['deliverables'] ? parseDeliverables(page['deliverables']) : [],
    resultsTitle: page['results-title'] || 'Real results',
    stats: extractStats(page),
    strategyTitle: page['strategy-title'] || 'Our SEO approach',
    strategyLede: page['strategy-intro'],
    steps: extractStrategySteps(page).map((s) => ({ title: s.title, desc: s.desc })),
    proseTitle: `SEO for ${industryName ?? page.name}, in detail`,
    proseHtml: page['main-body'],
    posts,
    faqTitle: `SEO for ${industryName ?? page.name}: your questions answered`,
    faqItems: extractFaqItems(page),
    ctaTitle: page['cta-title'] || `Ready to grow ${page.name} search?`,
    ctaSubtitle: page['cta-subtitle'] || "Book a free SEO audit and we'll show you exactly what's holding your site back.",
  };
}

/** The hub's cards: each industry page with its lead client's cover and published result (one client per card). */
const HUB_LEAD: Record<string, string> = {
  saas: 'dimer-health', b2b: 'outbound-specialist', fintech: 'toku-ai-cited-pipeline', startups: 'genie-teacher-organic-growth',
  'ai-startups': 'eraser', cybersecurity: 'hoxhunt', devtools: 'speckle', healthcare: 'institute-of-medical-physics',
  'hr-tech': 'ceipal-wp-to-wf-migration', edtech: 'codeop', ecommerce: 'montblanc',
};
export interface HubCard { href: string; label: string; headline: string; study?: string; client?: string; number?: string; title?: string; imageUrl?: string }

export async function hubCards(other: { href: string; label: string }[], articleHeads: Record<string, string>): Promise<HubCard[]> {
  const [saas, b2b, cms] = await Promise.all([getSeoForSaasContent(), getSeoForB2bContent(), fetchHomepageData()]);
  const images = await getSeoForImages(Object.values(HUB_LEAD));
  const pages = await Promise.all(other.map((o) => o.href.split('/').pop() as string).map(async (key) => {
    if (key === 'saas') return saas.hero.headline;
    if (key === 'b2b') return b2b.hero.headline;
    if (articleHeads[key]) return articleHeads[key];
    const page = await fetchItemBySlug<SeoPage>('seo-pages', key);
    return page?.['hero-headline'] || page?.name || '';
  }));
  return other.map((o, i) => {
    const key = o.href.split('/').pop() as string;
    const s = cms.caseStudies.find((x) => x.slug === HUB_LEAD[key]);
    return {
      href: o.href,
      label: o.label,
      headline: pages[i],
      study: s?.slug,
      client: s ? (s.client && cms.clients.get(s.client)?.name) || s.name.split(':')[0] : undefined,
      number: s?.['result-1---number'],
      title: s?.['result-1---title'],
      imageUrl: s ? images[s.slug] : undefined,
    };
  });
}
