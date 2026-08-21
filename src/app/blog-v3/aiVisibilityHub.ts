/**
 * AI Visibility hub — the editorial structure for the /blog/ai-visibility hub page.
 *
 * The hub is curated in code, not driven by a single flat CMS category: the value
 * is the CLUSTERING (Foundations → Playbooks → Data studies → Strategy → Agencies),
 * which a flat category field cannot express. Each entry is a published blog-post
 * slug; the page resolves them against the live blog posts and renders one card grid
 * per cluster. Slugs that no longer resolve are skipped, so a retired post never
 * breaks the page.
 *
 * Ordering inside each cluster is deliberate (strongest first). Cornerstones are
 * featured at the top and intentionally NOT repeated inside their home clusters.
 */

export interface HubCluster {
  title: string;
  highlightWord: string;
  blurb: string;
  slugs: string[];
}

export const AI_VISIBILITY_HERO = {
  eyebrow: 'Knowledge hub',
  title: 'AI Visibility',
  subtitle:
    'How B2B SaaS gets found, cited, and recommended in AI search — our guides, data studies, and playbooks.',
} as const;

/** Featured at the top under "Start here". Drawn from the clusters, shown once. */
export const AI_VISIBILITY_CORNERSTONES: string[] = [
  'answer-engine-optimization-guide-2026',
  'we-ran-aeo-on-ourselves',
  'share-of-answer',
  'how-to-get-named-in-ai-search',
];

export const AI_VISIBILITY_CLUSTERS: HubCluster[] = [
  {
    title: 'Foundations & guides',
    highlightWord: 'guides',
    blurb: 'How AI search actually works, and how to build for it.',
    slugs: [
      'how-to-structure-content-for-ai-extraction',
      '60-word-block-ai-overviews',
      'schema-markup-for-aeo-2026',
      'faqs-that-ai-search-engines-extract',
      'fan-out-queries',
      'ai-first-content-architecture',
      'aeo-strategies-that-work',
      'aeo-for-webflow-how-to-make-your-site-discoverable-by-ai-search-engines',
      'how-to-future-proof-your-webflow-website-for-search-and-ai-agents',
      'what-google-sge-and-ai-search-mean-for-webflow-sites-in-2026',
    ],
  },
  {
    title: 'Playbooks & how-to',
    highlightWord: 'how-to',
    blurb: 'Step-by-step moves to get named and cited in AI answers.',
    slugs: [
      'how-to-get-cited-in-chatgpt-b2b-saas',
      'how-fintech-companies-get-cited-in-ai-search',
      'share-of-answer-audit-90-minutes',
      'track-ai-bot-404s-cloudflare-notion',
      'seo-survival-playbook',
      'stop-410-url-decay-decision-tree',
      'seo-traffic-not-converting-pipeline',
    ],
  },
  {
    title: 'Data studies & indexes',
    highlightWord: 'indexes',
    blurb: 'Our original research on which brands AI engines actually name.',
    slugs: [
      'ai-answer-gap-b2b-saas-2026',
      'cybersecurity-saas-ai-visibility-index-2026',
      'devtools-ai-visibility-index-2026',
      'which-ai-engine-cites-fintech-brands',
      'hr-tech-ai-visibility-index-2026',
      'what-we-learned-running-ai-search-programs-b2b-saas',
      'ai-search-visibility-webinar-recap',
    ],
  },
  {
    title: 'Strategy & decisions',
    highlightWord: 'decisions',
    blurb: 'Where AI search fits, and what to prioritise first.',
    slugs: [
      'seo-vs-aeo-which-first-b2b-saas',
      'roi-math-seo-aeo-cro-b2b-saas',
      'the-invisible-quarter-aeo',
      'an-ai-visitor-is-not-a-google-visitor',
      'seo-vs-aeo-for-webflow',
    ],
  },
  {
    title: 'Agencies & buying guides',
    highlightWord: 'buying guides',
    blurb: 'Comparisons, pricing, and how to choose a partner.',
    slugs: [
      'best-aeo-agencies-2026',
      'best-aeo-agencies-b2b-saas-2026',
      'best-aeo-agency-fintech-companies-2026',
      'best-cybersecurity-saas-aeo-agencies-2026',
      'best-aeo-agencies-hr-tech-saas-2026',
      'best-health-tech-saas-seo-aeo-agencies-2026',
      'best-geo-agencies-b2b-saas-2026',
      'best-llm-seo-aeo-agencies-b2b-saas-2026',
      'best-aeo-tools-for-b2b-saas-2026',
      'best-b2b-saas-seo-agencies',
      'b2b-saas-seo-agency-comparison-2026',
      'best-alternatives-traditional-seo-agency-b2b-saas-2026',
      'aeo-agency-pricing-b2b-saas-2026',
      'aeo-consultant-vs-agency-2026',
      'aeo-agency-vs-in-house-b2b-saas',
      'how-to-measure-aeo-agency-roi',
      'how-to-choose-b2b-saas-seo-aeo-agency',
    ],
  },
];

/** Every slug the hub references, for a single resolve pass. */
export const AI_VISIBILITY_ALL_SLUGS: string[] = [
  ...AI_VISIBILITY_CORNERSTONES,
  ...AI_VISIBILITY_CLUSTERS.flatMap((c) => c.slugs),
];
