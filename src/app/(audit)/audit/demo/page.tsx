import type { Metadata } from 'next';
import type { AuditResults } from '@/lib/audit/types';
import { AuditDeck } from '../_components/AuditDeck';

export const metadata: Metadata = {
  title: 'Audit Demo',
};

const MOCK_RESULTS: AuditResults = {
  scores: {
    discoveryVisibility: 35,
    shareOfVoice: 18,
    competitiveStanding: 3,
    competitorsTracked: 5,
    platformCoverage: 3,
    overallGrade: 'C',
  },
  brandBaseline: {
    queries: [
      {
        prompt: 'What is Acme Corp?',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: true, sentiment: 'positive', snippet: 'Acme Corp is a B2B SaaS platform that provides project management and team collaboration tools for mid-market companies...', sources: [{ url: 'https://acme.com', title: 'Acme Corp' }] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp offers project management software designed for growing teams. They provide features like task tracking, time management, and reporting...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: true, sentiment: 'positive', snippet: 'Acme Corp is a well-known project management platform that competes with tools like Asana and Monday.com...', sources: [{ url: 'https://acme.com/features', title: 'Features' }] },
          { platform: 'perplexity', mentioned: true, cited: true, sentiment: 'positive', snippet: 'Acme Corp is a project management and collaboration platform founded in 2018, serving over 10,000 businesses...', sources: [{ url: 'https://acme.com', title: 'Acme Corp' }, { url: 'https://g2.com/products/acme', title: 'G2 Reviews' }] },
        ],
      },
      {
        prompt: 'Tell me about Acme Corp',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'positive', snippet: 'Acme Corp is a project management solution that has gained traction among mid-size B2B companies...', sources: [] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp provides cloud-based project management tools with features for task assignment, progress tracking...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp is a SaaS company offering project management solutions. Their platform includes kanban boards, Gantt charts...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: true, sentiment: 'positive', snippet: 'Acme Corp is a growing project management platform known for its intuitive interface and affordable pricing...', sources: [{ url: 'https://acme.com/about', title: 'About Acme' }] },
        ],
      },
      {
        prompt: 'Acme Corp reviews and reputation',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'positive', snippet: 'Acme Corp generally receives positive reviews for its ease of use and customer support...', sources: [] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Based on available information, Acme Corp has mixed reviews with users praising the interface but noting limited integrations...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'I don\'t have specific review data for this company. You might want to check G2 or Capterra for detailed reviews...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: true, sentiment: 'positive', snippet: 'Acme Corp holds a 4.3/5 rating on G2 with over 200 reviews. Users frequently praise the clean interface...', sources: [{ url: 'https://g2.com/products/acme', title: 'G2' }] },
        ],
      },
      {
        prompt: 'Is Acme Corp any good?',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'positive', snippet: 'Acme Corp is considered a solid choice for teams looking for straightforward project management without the complexity of enterprise tools...', sources: [] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Whether Acme Corp is right for you depends on your specific needs. It excels at basic project management but may lack advanced features...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp is a decent project management tool, particularly for small to mid-size teams. However, larger organizations might find it limiting...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'positive', snippet: 'Yes, Acme Corp is generally well-regarded in the project management space, especially for its pricing and simplicity...', sources: [] },
        ],
      },
      {
        prompt: 'Acme Corp pricing and plans',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp offers three pricing tiers: Starter at $9/user/month, Professional at $19/user/month, and Enterprise with custom pricing...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'I don\'t have current pricing details for Acme Corp. I recommend visiting their website directly for the most up-to-date pricing...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp pricing starts at around $9 per user per month for the basic plan. They also offer a free trial...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: true, sentiment: 'neutral', snippet: 'Acme Corp offers a free tier for up to 5 users, with paid plans starting at $9/user/month...', sources: [{ url: 'https://acme.com/pricing', title: 'Pricing' }] },
        ],
      },
      {
        prompt: 'What does Acme Corp do?',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp develops cloud-based project management and team collaboration software for businesses...', sources: [] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp provides a project management platform that helps teams organize, track, and manage their work...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp is a software company that builds project management tools for B2B companies...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp is a B2B SaaS company that offers project management and workflow automation tools...', sources: [] },
        ],
      },
      {
        prompt: 'Acme Corp vs competitors',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Compared to Asana and Monday.com, Acme Corp is more affordable but has fewer integrations. It\'s best suited for smaller teams...', sources: [] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp competes primarily with Asana, Monday.com, and ClickUp. Its main differentiators are pricing and ease of use...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'negative', snippet: 'While Acme Corp offers competitive pricing, it lacks some advanced features found in Asana, Monday.com, and Jira...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp vs competitors: More affordable than Asana, simpler than Jira, but fewer integrations than Monday.com...', sources: [] },
        ],
      },
      {
        prompt: 'Who uses Acme Corp?',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'positive', snippet: 'Acme Corp is used by over 10,000 businesses, primarily small to mid-market B2B companies in technology, marketing, and consulting...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'I don\'t have specific information about Acme Corp\'s customer base...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp serves various industries including technology, marketing agencies, and professional services firms...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: true, sentiment: 'positive', snippet: 'Acme Corp is popular with startups and mid-market companies. Notable customers include several Y Combinator startups...', sources: [{ url: 'https://acme.com/customers', title: 'Customers' }] },
        ],
      },
      {
        prompt: 'Acme Corp features and capabilities',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'positive', snippet: 'Key features include task management, kanban boards, Gantt charts, time tracking, and team collaboration tools...', sources: [] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp features include project templates, task dependencies, reporting dashboards, and a mobile app...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp offers standard project management features including boards, lists, timelines, and basic automation...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: true, sentiment: 'positive', snippet: 'Acme Corp\'s platform includes AI-powered task prioritization, resource management, and customizable workflows...', sources: [{ url: 'https://acme.com/features', title: 'Features' }] },
        ],
      },
      {
        prompt: 'Should I use Acme Corp for project management?',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'positive', snippet: 'Acme Corp is a good choice if you need an affordable, easy-to-use project management tool for a small to mid-size team...', sources: [] },
          { platform: 'claude', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'Acme Corp could be a good fit depending on your needs. It\'s strong for basic project management but consider alternatives if you need advanced features...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: 'For straightforward project management, Acme Corp is worth considering. However, for complex enterprise workflows, you might want to look at Jira or Asana...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'positive', snippet: 'Acme Corp is well-suited for teams of 5-50 people who want clean project management without enterprise complexity...', sources: [] },
        ],
      },
    ],
    brandRecognitionScore: 88,
    accurateInfo: [
      'Acme Corp is correctly identified as a B2B SaaS project management platform across all major AI platforms.',
      'Pricing information is generally accurate — AI platforms correctly report the $9/user/month starting price.',
      'AI platforms correctly position Acme Corp as a mid-market solution competing with Asana and Monday.com.',
      'Customer support quality is consistently mentioned as a positive differentiator.',
    ],
    inaccuracies: [
      '...Acme Corp lacks some advanced features found in Asana, Monday.com, and Jira — this understates recent feature additions...',
    ],
    gaps: [
      'Website not cited as source by: claude',
      'Not recognized by: gemini (for review queries)',
    ],
  },
  competitorContext: {
    competitors: [
      { domain: 'asana.com', name: 'Asana', keywordIntersection: 1250 },
      { domain: 'monday.com', name: 'Monday', keywordIntersection: 980 },
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
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'positive', snippet: '...Acme Corp is emerging as a popular Asana alternative, especially for budget-conscious teams...', sources: [] },
        ],
      },
      {
        prompt: 'What should I use instead of Asana?',
        targetCompetitor: 'Asana',
        results: [
          { platform: 'chatgpt', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Monday.com and ClickUp are the most popular alternatives...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...depending on your needs, Monday.com, Notion, or Linear might work...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...try Monday.com for similar features or Basecamp for simpler project management...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'positive', snippet: '...if pricing is a concern, Acme Corp offers similar features at a lower price point...', sources: [] },
        ],
      },
      {
        prompt: 'Best alternatives to Monday.com',
        targetCompetitor: 'Monday',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...alternatives include Asana, ClickUp, Acme Corp, and Notion...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Asana, ClickUp, and Teamwork are strong Monday.com alternatives...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...consider Asana, Smartsheet, or Wrike as alternatives...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'positive', snippet: '...Acme Corp and ClickUp both offer competitive alternatives to Monday.com...', sources: [] },
        ],
      },
      {
        prompt: 'What should I use instead of Monday.com?',
        targetCompetitor: 'Monday',
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
    competitiveRecommendationRate: 29,
    shareOfVoiceByCompetitor: {
      Asana: 72,
      Monday: 65,
      ClickUp: 48,
    },
  },
  categoryVisibility: {
    queries: [
      {
        prompt: 'Best project management software in 2026',
        results: [
          { platform: 'chatgpt', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'Top project management tools in 2026 include Asana, Monday.com, ClickUp, Jira, and Notion...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'The best project management software depends on your needs. Popular options include Asana, Monday.com, ClickUp...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'Leading project management tools include Monday.com, Asana, ClickUp, Smartsheet, and Wrike...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...top options include Asana, Monday.com, ClickUp, Acme Corp, and Notion. Acme Corp stands out for affordable pricing...', sources: [] },
        ],
      },
      {
        prompt: 'Top project management tools for SaaS',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'positive', snippet: '...for SaaS teams, consider Linear, Jira, Asana, or Acme Corp for a more streamlined approach...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Linear and Jira are most popular for SaaS product teams. Asana works well for broader team management...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Jira, Linear, and Asana are the top choices for SaaS companies...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'positive', snippet: '...Acme Corp is gaining traction among SaaS startups as an affordable alternative to Asana and Monday.com...', sources: [] },
        ],
      },
      {
        prompt: 'What project management solution should I use?',
        results: [
          { platform: 'chatgpt', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'The best project management solution depends on your team size and needs. For small teams, Trello or Basecamp. For growing teams, Asana or Monday.com...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'It depends on your requirements. For simplicity, try Basecamp. For comprehensive features, Asana or Monday.com. For development teams, Jira or Linear...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'Popular choices include Asana for marketing teams, Jira for development, and Monday.com for cross-functional teams...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...consider your budget and team size. Acme Corp offers good value for mid-size teams, while Asana and Monday.com suit larger organizations...', sources: [] },
        ],
      },
      {
        prompt: 'Recommended project management platforms for businesses',
        results: [
          { platform: 'chatgpt', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'For businesses, I recommend Asana, Monday.com, or Smartsheet depending on your specific workflow needs...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: 'The top recommended platforms are Asana, Monday.com, ClickUp, and Microsoft Project...', sources: [] },
          { platform: 'gemini', mentioned: true, cited: false, sentiment: 'neutral', snippet: '...recommended platforms include Monday.com, Asana, ClickUp, Acme Corp, and Teamwork...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'positive', snippet: '...top recommendations: Asana (enterprise), Monday.com (versatile), Acme Corp (mid-market value), ClickUp (feature-rich)...', sources: [] },
        ],
      },
      {
        prompt: 'Which project management tool is best for SaaS companies?',
        results: [
          { platform: 'chatgpt', mentioned: true, cited: false, sentiment: 'positive', snippet: '...for SaaS companies, Linear is excellent for product teams, Asana for marketing, and Acme Corp for an affordable all-in-one solution...', sources: [] },
          { platform: 'claude', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...Jira and Linear are most popular among SaaS companies for product development. Asana is common for broader team coordination...', sources: [] },
          { platform: 'gemini', mentioned: false, cited: false, sentiment: 'neutral', snippet: '...SaaS companies typically choose between Jira, Linear, Asana, or Monday.com based on team function...', sources: [] },
          { platform: 'perplexity', mentioned: true, cited: false, sentiment: 'positive', snippet: '...Acme Corp is increasingly popular with SaaS startups due to its competitive pricing and modern interface...', sources: [] },
        ],
      },
    ],
    categoryDiscoveryRate: 35,
    inferredCategory: 'project management',
    inferredIndustry: 'SaaS',
  },
  platformBreakdown: {
    chatgpt: {
      mentionRate: 70,
      citationRate: 10,
      sentiment: 'positive',
      topMentions: [
        '...Acme Corp is a B2B SaaS platform that provides project management...',
        '...alternatives to Asana include Monday.com, ClickUp, Notion, and Acme Corp...',
      ],
    },
    claude: {
      mentionRate: 45,
      citationRate: 0,
      sentiment: 'neutral',
      topMentions: [
        '...Acme Corp offers project management software designed for growing teams...',
      ],
    },
    gemini: {
      mentionRate: 55,
      citationRate: 8,
      sentiment: 'neutral',
      topMentions: [
        '...Acme Corp is a well-known project management platform...',
        '...options include Asana, ClickUp, Acme Corp, and Basecamp...',
      ],
    },
    perplexity: {
      mentionRate: 90,
      citationRate: 35,
      sentiment: 'positive',
      topMentions: [
        '...Acme Corp is a growing project management platform known for its intuitive interface...',
        '...Acme Corp is gaining traction among SaaS startups...',
      ],
    },
  },
  actionItems: [
    {
      priority: 'high',
      title: 'Fill Knowledge Gaps',
      description: 'AI platforms are missing key information about your brand. Create comprehensive, well-structured content covering your products, pricing, use cases, and differentiators.',
      linkedService: '/services/copywriting',
    },
    {
      priority: 'high',
      title: 'Increase Platform Coverage',
      description: 'Your brand is only recognized by 3 of 4 major AI platforms. Build presence through authoritative content, PR mentions, and directory listings that AI models use as training data.',
      linkedService: '/services/seo-aeo',
    },
    {
      priority: 'medium',
      title: 'Improve Category Visibility',
      description: 'When users search for solutions in your category, you appear in only 35% of AI responses. Create definitive category content and comparisons to establish authority.',
      linkedService: '/services/seo-aeo',
    },
    {
      priority: 'medium',
      title: 'Boost Competitive Share of Voice',
      description: 'Your brand appears in only 18% of competitive queries. Build comparison pages, earn review site mentions, and create differentiation content.',
      linkedService: '/services/copywriting',
    },
    {
      priority: 'medium',
      title: 'Improve Source Attribution',
      description: 'AI platforms mention your brand but rarely cite your website directly. Optimize your site structure, add schema markup, and build authoritative backlinks to become a primary source.',
      linkedService: '/services/seo-aeo',
    },
  ],
};

export default function AuditDemoPage() {
  return (
    <AuditDeck
      results={MOCK_RESULTS}
      companyName="Acme Corp"
      domain="https://acme.com"
      auditDate="2026-03-26T12:00:00.000Z"
    />
  );
}
