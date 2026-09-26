import type { AuditResults } from '@/lib/audit/types';

/**
 * The example audit (a fictional company, Acme Corp, acme.com) shown at /audit/demo and in the v11 report preview.
 *
 * Every derived number follows from the answers below: it was computed with the live pipeline's own functions
 * (parseResponse and mentionsBrand in lib/audit/analysis.ts; calculateScores, calculatePlatformBreakdown and
 * generateActionItems in lib/audit/scoring.ts; the phase rates and the Phase 3 competitor rates as the phase files and
 * pipeline.ts compute them), with each snippet standing in for the full response, then written here as static values.
 * Phases: 6 branded prompts (getBrandQueries), 6 alternative-to prompts (2 for each of the top 3 of 5 tracked
 * competitors), 5 unbranded category prompts (getCategoryQueries). Edit an answer, and the numbers must be recomputed.
 * The knowledge-gap, accuracy and inaccuracy lines stand in for the Phase 1 extraction (an LLM call) and are written
 * to agree with the answers.
 */
export const MOCK_RESULTS: AuditResults = {
  scores: {
    brandRecognition: 88,
    discoveryVisibility: 35,
    shareOfVoice: 13,
    competitiveStanding: 4,
    competitiveStandingAvailable: true,
    competitorsTracked: 5,
    platformCoverage: 4,
    overallGrade: 'B',
  },
  brandBaseline: {
    queries: [
      {
        prompt: 'What is Acme Corp?',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp is a B2B SaaS platform that provides project management and team collaboration tools for mid-market companies...', sources: [{ url: 'https://www.g2.com/products/acme-corp/reviews', title: 'Acme Corp Reviews | G2' }] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp offers project management software designed for growing teams. They provide features like task tracking, time management, and reporting...', sources: [{ url: 'https://www.capterra.com/p/acme-corp/', title: 'Acme Corp Reviews | Capterra' }] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp is a well-known project management platform that competes with tools like Asana and Monday.com...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: true, sentiment: 'neutral', snippet: 'Acme Corp is a project management and collaboration platform founded in 2018, serving over 10,000 businesses...', sources: [{ url: 'https://acme.com', title: 'Acme Corp' }, { url: 'https://www.g2.com/products/acme-corp/reviews', title: 'Acme Corp Reviews | G2' }] },
        ],
      },
      {
        prompt: 'Acme Corp reviews and reputation',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp generally receives positive reviews for its ease of use and customer support...', sources: [{ url: 'https://www.g2.com/products/acme-corp/reviews', title: 'Acme Corp Reviews | G2' }] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Based on available information, Acme Corp has mixed reviews with users praising the interface but noting limited integrations...', sources: [{ url: 'https://www.capterra.com/p/acme-corp/', title: 'Acme Corp Reviews | Capterra' }] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'I don\'t have specific review data for this company. You might want to check G2 or Capterra for detailed reviews...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp holds a 4.3/5 rating on G2 with over 200 reviews. Users frequently praise the clean interface...', sources: [{ url: 'https://www.g2.com/products/acme-corp/reviews', title: 'Acme Corp Reviews | G2' }] },
        ],
      },
      {
        prompt: 'Is Acme Corp any good?',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp is considered a solid choice for teams looking for straightforward project management without the complexity of enterprise tools...', sources: [] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Whether Acme Corp is right for you depends on your specific needs. It excels at basic project management but may lack advanced features...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp is a decent project management tool, particularly for small to mid-size teams. However, larger organizations might find it limiting...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Yes, Acme Corp is generally well-regarded in the project management space, especially for its pricing and simplicity...', sources: [] },
        ],
      },
      {
        prompt: 'Acme Corp pricing and plans',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp offers three pricing tiers: Starter at $9/user/month, Professional at $19/user/month, and Enterprise with custom pricing...', sources: [{ url: 'https://www.capterra.com/p/acme-corp/', title: 'Acme Corp Reviews | Capterra' }] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'I don\'t have current pricing details for this company. I recommend visiting their website directly for the most up-to-date pricing...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp pricing starts at around $9 per user per month for the basic plan. They also offer a free trial...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: true, sentiment: 'neutral', snippet: 'Acme Corp offers a free tier for up to 5 users, with paid plans starting at $9/user/month...', sources: [{ url: 'https://acme.com/pricing', title: 'Pricing | Acme Corp' }] },
        ],
      },
      {
        prompt: 'Acme Corp vs competitors',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Compared to Asana and Monday.com, Acme Corp is more affordable but has fewer integrations. It\'s best suited for smaller teams...', sources: [] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp competes primarily with Asana, Monday.com, and ClickUp. Its main differentiators are pricing and ease of use...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'While Acme Corp offers competitive pricing, it lacks some advanced features found in Asana, Monday.com, and Jira...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp vs competitors: More affordable than Asana, simpler than Jira, but fewer integrations than Monday.com...', sources: [{ url: 'https://www.g2.com/products/acme-corp/reviews', title: 'Acme Corp Reviews | G2' }] },
        ],
      },
      {
        prompt: 'Who uses Acme Corp?',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp is used by over 10,000 businesses, primarily small to mid-market B2B companies in technology, marketing, and consulting...', sources: [{ url: 'https://www.g2.com/products/acme-corp/reviews', title: 'Acme Corp Reviews | G2' }] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'I don\'t have specific information about this company\'s customer base...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp serves various industries including technology, marketing agencies, and professional services firms...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: true, sentiment: 'neutral', snippet: 'Acme Corp is popular with startups and mid-market companies. Notable customers include several Y Combinator startups...', sources: [{ url: 'https://acme.com', title: 'Acme Corp' }] },
        ],
      },
    ],
    brandRecognitionScore: 88,
    accurateInfo: [
      'All four platforms describe Acme Corp as a project management platform for small and mid-size teams.',
      'ChatGPT, Gemini and Perplexity report the $9 per user per month starting price.',
      'Platforms place Acme Corp against Asana and Monday.com as the more affordable option.',
      'Praise for ease of use and the interface comes through in ChatGPT, Claude and Perplexity answers.',
    ],
    inaccuracies: [
      'Acme Corp lacks advanced features found in Asana, Monday.com and Jira (the site lists dependencies, automation and resource management)',
    ],
    gaps: [
      'Claude has no information on who uses Acme Corp, and no platform names a single customer.',
      'Claude could not state Acme Corp pricing and sent users to the website instead.',
    ],
    gapsWithSuggestions: [
      {
        gap: 'Claude has no information on who uses Acme Corp, and no platform names a single customer.',
        suggestedPath: '/customers',
      },
      {
        gap: 'Claude could not state Acme Corp pricing and sent users to the website instead.',
        suggestedPath: '/pricing',
      },
    ],
  },
  competitorContext: {
    competitors: [
      { domain: 'asana.com', name: 'Asana', keywordIntersection: 1250 },
      { domain: 'monday.com', name: 'Monday.com', keywordIntersection: 980 },
      { domain: 'clickup.com', name: 'ClickUp', keywordIntersection: 720 },
      { domain: 'notion.so', name: 'Notion', keywordIntersection: 540 },
      { domain: 'linear.app', name: 'Linear', keywordIntersection: 320 },
    ],
    queries: [
      {
        prompt: 'Best alternatives to Asana',
        targetCompetitor: 'Asana',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...alternatives to Asana include Monday.com, ClickUp, Notion, and Acme Corp...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...top Asana alternatives are Monday.com, ClickUp, Trello, and Wrike...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...consider Monday.com, ClickUp, or Basecamp as alternatives to Asana...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...Acme Corp is emerging as a popular Asana alternative, especially for budget-conscious teams...', sources: [] },
        ],
      },
      {
        prompt: 'What should I use instead of Asana?',
        targetCompetitor: 'Asana',
        results: [
          { platform: 'chatgpt', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Monday.com and ClickUp are the most popular alternatives...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...depending on your needs, Monday.com, Notion, or Linear might work...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...try Monday.com for similar features or Basecamp for simpler project management...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...if pricing is a concern, Acme Corp offers similar features at a lower price point...', sources: [] },
        ],
      },
      {
        prompt: 'Best alternatives to Monday.com',
        targetCompetitor: 'Monday.com',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...alternatives include Asana, ClickUp, Acme Corp, and Notion...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Asana, ClickUp, and Teamwork are strong Monday.com alternatives...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...consider Asana, Smartsheet, or Wrike as alternatives...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...Acme Corp and ClickUp both offer competitive alternatives to Monday.com...', sources: [] },
        ],
      },
      {
        prompt: 'What should I use instead of Monday.com?',
        targetCompetitor: 'Monday.com',
        results: [
          { platform: 'chatgpt', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Asana and ClickUp are the most recommended alternatives...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Asana offers the closest feature parity to Monday.com...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...options include Asana, ClickUp, Acme Corp, and Basecamp depending on team size...', sources: [] },
          { platform: 'perplexity', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Asana is the most common switch from Monday.com...', sources: [] },
        ],
      },
      {
        prompt: 'Best alternatives to ClickUp',
        targetCompetitor: 'ClickUp',
        results: [
          { platform: 'chatgpt', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Asana, Monday.com, and Notion are popular ClickUp alternatives...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Monday.com and Asana are the most feature-comparable alternatives to ClickUp...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...try Asana or Monday.com for a more polished experience...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...Acme Corp offers a simpler alternative to ClickUp for teams that find ClickUp overwhelming...', sources: [] },
        ],
      },
      {
        prompt: 'What should I use instead of ClickUp?',
        targetCompetitor: 'ClickUp',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...for simpler alternatives, consider Acme Corp or Basecamp. For feature parity, try Asana or Monday.com...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Asana and Monday.com provide similar capabilities with a cleaner interface...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Asana or Monday.com are the most popular alternatives to ClickUp...', sources: [] },
          { platform: 'perplexity', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Monday.com is the most common switch from ClickUp...', sources: [] },
        ],
      },
    ],
    competitiveRecommendationRate: 33,
    shareOfVoiceByCompetitor: { Asana: 90, 'Monday.com': 65, ClickUp: 50, Notion: 15, Linear: 25 },
  },
  categoryVisibility: {
    queries: [
      {
        prompt: 'Best project management software in 2026',
        results: [
          { platform: 'chatgpt', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'Top project management tools in 2026 include Asana, Monday.com, ClickUp, Jira, and Smartsheet...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'The best project management software depends on your needs. Popular options include Asana, Monday.com, ClickUp...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'Leading project management tools include Monday.com, Asana, ClickUp, Smartsheet, and Wrike...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'positive', snippet: '...top options include Asana, Monday.com, ClickUp, Acme Corp, and Notion. Acme Corp stands out for affordable pricing...', sources: [] },
        ],
      },
      {
        prompt: 'Top project management tools for SaaS',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...for SaaS teams, consider Linear, Jira, Asana, or Acme Corp for a more streamlined approach...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Linear and Jira are most popular for SaaS product teams. Asana works well for broader team management...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Jira, Linear, and Asana are the top choices for SaaS companies...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...Acme Corp is gaining traction among SaaS startups as an affordable alternative to Asana and Monday.com...', sources: [] },
        ],
      },
      {
        prompt: 'What project management solution should I use?',
        results: [
          { platform: 'chatgpt', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'The best project management solution depends on your team size and needs. For small teams, Trello or Basecamp. For growing teams, Asana or Monday.com...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'It depends on your requirements. For simplicity, try Basecamp. For comprehensive features, Asana or Monday.com. For development teams, Jira...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'Popular choices include Asana for marketing teams, Jira for development, and Monday.com for cross-functional teams...', sources: [] },
          { platform: 'perplexity', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...it comes down to budget and team size. Asana and Monday.com suit larger organizations, while ClickUp packs the most into its free plan...', sources: [] },
        ],
      },
      {
        prompt: 'Recommended project management platforms for businesses',
        results: [
          { platform: 'chatgpt', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'For businesses, I recommend Asana, Monday.com, or Smartsheet depending on your specific workflow needs...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'The top recommended platforms are Asana, Monday.com, ClickUp, and Microsoft Project...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...recommended platforms include Monday.com, Asana, ClickUp, Acme Corp, and Teamwork...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...top recommendations: Asana (enterprise), Monday.com (versatile), Acme Corp (mid-market value), ClickUp (feature-rich)...', sources: [] },
        ],
      },
      {
        prompt: 'Best project management for early-stage startups',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...for early-stage startups, Linear is excellent for product teams, Asana for marketing, and Acme Corp for an affordable all-in-one solution...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...early-stage startups often start with Notion or Linear, then move to Asana as the team grows...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...startups usually pick ClickUp, Trello or Notion for their generous free plans...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...Acme Corp is popular with early-stage startups for its low per-seat price, alongside ClickUp...', sources: [] },
        ],
      },
    ],
    categoryDiscoveryRate: 35,
    inferredCategory: 'project management',
    inferredIndustry: 'SaaS',
  },
  platformBreakdown: {
    chatgpt: {
      mentionRate: 100,
      citationRate: 0,
      sentiment: 'neutral',
      topMentions: [
        'Acme Corp is a B2B SaaS platform that provides project management and team collaboration tools for mid-market companies...',
        'Acme Corp generally receives positive reviews for its ease of use and customer support...',
        'Acme Corp is considered a solid choice for teams looking for straightforward project management without the complexity of enterprise tools...',
      ],
      insight: 'Recognizes you consistently but cites g2.com, capterra.com instead of your site — own the narrative with your own pages.',
      topCitedDomains: [{ domain: 'g2.com', count: 3, isOwn: false }, { domain: 'capterra.com', count: 1, isOwn: false }],
    },
    claude: {
      mentionRate: 67,
      citationRate: 0,
      sentiment: 'neutral',
      topMentions: [
        'Acme Corp offers project management software designed for growing teams. They provide features like task tracking, time management, and reporting...',
        'Based on available information, Acme Corp has mixed reviews with users praising the interface but noting limited integrations...',
        'Whether Acme Corp is right for you depends on your specific needs. It excels at basic project management but may lack advanced features...',
      ],
      insight: 'Recognizes you consistently but cites capterra.com instead of your site — own the narrative with your own pages.',
      topCitedDomains: [{ domain: 'capterra.com', count: 2, isOwn: false }],
    },
    gemini: {
      mentionRate: 83,
      citationRate: 0,
      sentiment: 'neutral',
      topMentions: [
        'Acme Corp is a well-known project management platform that competes with tools like Asana and Monday.com...',
        'Acme Corp is a decent project management tool, particularly for small to mid-size teams. However, larger organizations might find it limiting...',
        'Acme Corp pricing starts at around $9 per user per month for the basic plan. They also offer a free trial...',
      ],
      insight: 'Recognizes you consistently but does not cite your site — build content that answers these queries directly.',
      topCitedDomains: [],
    },
    perplexity: {
      mentionRate: 100,
      citationRate: 50,
      sentiment: 'neutral',
      topMentions: [
        'Acme Corp is a project management and collaboration platform founded in 2018, serving over 10,000 businesses...',
        'Acme Corp holds a 4.3/5 rating on G2 with over 200 reviews. Users frequently praise the clean interface...',
        'Yes, Acme Corp is generally well-regarded in the project management space, especially for its pricing and simplicity...',
      ],
      insight: 'Strong recognition and cites your own site directly — this platform is working for you.',
      topCitedDomains: [{ domain: 'acme.com', count: 3, isOwn: true }, { domain: 'g2.com', count: 3, isOwn: false }],
    },
  },
  actionItems: [
    {
      priority: 'high',
      title: 'Correct the biggest factual error',
      description: 'AI platforms are saying: "Acme Corp lacks advanced features found in Asana, Monday.com and Jira (the site lists dependencies, automation and resource management)" Fix the canonical page on your site (About, homepage, or the relevant product page) so the answer engines retrieve the correct fact from your own site.',
      linkedService: '/services/seo-aeo',
    },
    {
      priority: 'high',
      title: 'Publish /customers',
      description: 'AI is missing: "Claude has no information on who uses Acme Corp, and no platform names a single customer." Create this page on your site so AI has a canonical source to cite. Use the gap as the H1 question, answer directly in the first paragraph, and earn a few links to it.',
      linkedService: '/services/copywriting',
    },
    {
      priority: 'high',
      title: 'Become your own primary source',
      description: 'AI mentions you in 21 responses but only cites your site in 3 of them. You are not the canonical source on your own brand. Audit which pages AI could cite (about, pricing, products, case studies) and make them the authoritative answer — clear H1s and inline facts AI can quote.',
      linkedService: '/services/seo-aeo',
    },
    {
      priority: 'medium',
      title: 'Show up for "best project management" searches',
      description: 'You appear in only 35% of unbranded category queries. Publish a definitive "Best project management in 2026" page on your site and a comparison vs your top competitors. Asana is winning most of these queries — study which pages AI cites for them and match their depth.',
      linkedService: '/services/seo-aeo',
    },
    {
      priority: 'medium',
      title: 'Close the share-of-voice gap',
      description: 'Your share of voice is 13%. Build a "Why [your brand] over Asana" comparison page and earn coverage on the review sites AI is already citing for Asana.',
      linkedService: '/services/copywriting',
    },
  ],
};
