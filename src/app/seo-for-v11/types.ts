/** The v11 industry page's view: every /seo-for/<industry> page maps its own copy (JSON or Sanity) onto this. */

export interface IndustryWork {
  slug: string;
  client: string;
  /** The published result: a figure and what it measures. */
  number?: string;
  title: string;
  imageUrl?: string;
}


export interface IndustryPost {
  href: string;
  title: string;
  meta?: string;
}

export interface IndustryView {
  /** The industry key: picks the example AI answer (industry-v11.json `chat`) and the results set (proof.tsx). */
  key: string;
  eyebrow: string;
  h1: string;
  /** One short line above the hero paragraph (a Sanity page's `hero-subtitle`). */
  lead?: string;
  sub?: string;
  work: IndustryWork[];
  workTitle: string;
  painTitle: string;
  painLede?: string;
  pains: { title: string; sub?: string; desc: string }[];
  /** The three-layer program (SaaS); a Sanity page lists its deliverables instead. */
  layers?: { title: string; subtitle: string; items: string[] }[];
  layersTitle?: string;
  layersLede?: string;
  deliverables?: { title: string; description?: string }[];
  resultsTitle: string;
  resultsLede?: string;
  stats: { value: string; label: string }[];
  strategyTitle: string;
  strategyLede?: string;
  steps: { title: string; desc: string }[];
  /** The mid-page offer (SaaS). */
  offer?: { headline: string; sub: string; cta: string; href: string };
  proseTitle?: string;
  proseHtml?: string;
  posts: IndustryPost[];
  faqTitle: string;
  faqItems: { question: string; answer: string }[];
  ctaTitle: string;
  ctaSubtitle: string;
}

/** A long-read industry page (seo-for-hr-tech.json, seo-for-ai-startups.json, seo-for-edtech.json). */
export interface ArticlePanel {
  title: string;
  stats: { value: string; label: string }[];
}
export interface SeoForArticle {
  meta: { title: string; description: string };
  hero: { eyebrow: string; h1: string; sub: string; primaryCta: string; secondaryCta: string };
  proof: { domain: string; image?: { src: string; alt: string }; panel?: ArticlePanel; note: string[] };
  answer: { label: string; text: string };
  intro: string[];
  questions: { title: string; columns: string[]; rows: string[][]; note: string };
  parts: { title: string; html: string; image?: { src: string; alt: string; caption?: string }; panel?: ArticlePanel }[];
  faq: { title: string; items: { question: string; answer: string }[] };
  cover: { label: string; title: string; text: string; cta: string };
}
