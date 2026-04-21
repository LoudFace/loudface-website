import type {
  CompetitorContextData,
  CompetitorInfo,
  CompetitorQuery,
  PlatformResult,
} from '../types';
import {
  getCompetitors,
  queryAllPlatforms,
  withConcurrency,
  TraceCollector,
} from '../dataforseo';
import { parseResponse, filterDFSCompetitors } from '../analysis';
import { getCompetitorQueries } from '../prompts';

// ─── Known Competitors (hardcoded fallback) ─────────────────────────

/**
 * LoudFace's actual competitors — used when DataForSEO Labs has no keyword
 * overlap data for the audited domain. Much more accurate than asking ChatGPT
 * to guess competitors, which returns generic industry players.
 */
const KNOWN_COMPETITORS: Record<string, CompetitorInfo[]> = {
  'loudface.com': [
    { domain: 'npdigital.com', name: 'NP Digital', keywordIntersection: 0 },
    { domain: 'flowninja.co', name: 'FlowNinja', keywordIntersection: 0 },
    { domain: 'vezadigital.com', name: 'Veza Digital', keywordIntersection: 0 },
    { domain: 'broworks.co', name: 'Broworks', keywordIntersection: 0 },
    { domain: 'bx.studio', name: 'BX Studio', keywordIntersection: 0 },
  ],
};

/**
 * Phase 2: Competitor Context Analysis
 * Auto-detects competitors, then runs "alternative to" queries
 * to measure how often the brand gets recommended vs competitors.
 *
 * Uses a three-tier competitor resolution:
 * 1. DataForSEO Labs keyword-overlap competitors (filtered for relevance)
 * 2. AI-extracted competitors from Phase 1 responses (cross-validated)
 * 3. Hardcoded fallback for known domains
 */
export async function runCompetitorContext(
  companyName: string,
  domain: string,
  category: string,
  onProgress?: (pct: number) => Promise<void>,
  entityType: 'product' | 'service' | 'brand' = 'product',
  tracer?: TraceCollector,
  aiExtractedCompetitors: { name: string; mentionCount: number }[] = [],
): Promise<CompetitorContextData & { competitorSource: 'dataforseo-labs' | 'ai-extracted' | 'hardcoded' }> {
  // Step 1: Auto-detect competitors via DataForSEO Labs
  const rawCompetitors = await getCompetitors(domain, 10); // Request more, then filter
  const filteredDFS = filterDFSCompetitors(rawCompetitors, domain);

  let competitors: CompetitorInfo[] = filteredDFS.map((c) => ({
    domain: c.domain,
    name: extractCompanyName(c.domain),
    keywordIntersection: c.intersections,
  }));

  let competitorSource: 'dataforseo-labs' | 'ai-extracted' | 'hardcoded' = 'dataforseo-labs';

  // Cross-validate: check if AI-extracted competitors overlap with DataForSEO results
  const aiNames = aiExtractedCompetitors.map((c) => c.name.toLowerCase());
  const dfsOverlap = competitors.filter((c) =>
    aiNames.some((ai) =>
      c.name.toLowerCase().includes(ai) || ai.includes(c.name.toLowerCase()),
    ),
  );

  if (filteredDFS.length > 0 && dfsOverlap.length === 0 && aiExtractedCompetitors.length >= 2) {
    // DataForSEO returned results but NONE overlap with what AI considers competitors.
    // This usually means DFS returned keyword-overlap sites (exchanges, news) not real competitors.
    // Trust the AI-extracted competitors instead.
    // Threshold of 2: dominant brands (Stripe, Linear) often only get named alongside
    // a couple of direct competitors, and DFS results are frequently reference sites
    // (Investopedia, Nerdwallet) that share informational keywords but aren't rivals.
    console.log(`[Audit] DataForSEO competitors don't match AI-extracted ones. Using AI competitors.`);
    console.log(`[Audit]   DFS returned: ${competitors.map((c) => c.name).join(', ')}`);
    console.log(`[Audit]   AI extracted: ${aiExtractedCompetitors.map((c) => c.name).join(', ')}`);

    competitors = aiExtractedCompetitors
      .slice(0, 5)
      .map((c) => ({
        domain: guessDomain(c.name),
        name: c.name,
        keywordIntersection: 0,
      }));
    competitorSource = 'ai-extracted';
  } else if (filteredDFS.length === 0 && aiExtractedCompetitors.length >= 2) {
    // No DataForSEO results at all — use AI-extracted
    console.log(`[Audit] No DataForSEO competitors. Using AI-extracted.`);
    competitors = aiExtractedCompetitors
      .slice(0, 5)
      .map((c) => ({
        domain: guessDomain(c.name),
        name: c.name,
        keywordIntersection: 0,
      }));
    competitorSource = 'ai-extracted';
  } else if (competitors.length === 0) {
    // No DataForSEO, no AI-extracted — use hardcoded fallback
    const cleanDomain = domain.replace(/^www\./, '').toLowerCase();
    const known = KNOWN_COMPETITORS[cleanDomain];
    if (known) {
      console.log(`[Audit] Using hardcoded competitors for ${cleanDomain}`);
      competitors = known;
      competitorSource = 'hardcoded';
    } else {
      console.log(`[Audit] No competitors found for ${cleanDomain} (no DataForSEO, no AI data, no hardcoded list)`);
    }
  } else {
    // DataForSEO results look reasonable (some overlap with AI or AI has < 3 results)
    competitors = competitors.slice(0, 5);
  }

  if (onProgress) await onProgress(45);

  // Step 2: Run "alternative to [competitor]" queries
  // Pick top 3 competitors to keep cost reasonable
  const topCompetitors = competitors.slice(0, 3);
  const allPrompts: { prompt: string; competitor: string }[] = [];

  for (const comp of topCompetitors) {
    const prompts = getCompetitorQueries(comp.name, category, entityType);
    // Use first 2 prompts per competitor (6 total across 3 competitors)
    for (const prompt of prompts.slice(0, 2)) {
      allPrompts.push({ prompt, competitor: comp.name });
    }
  }

  const queries: CompetitorQuery[] = [];

  await withConcurrency(allPrompts, 2, async ({ prompt, competitor }) => {
    const platformResults = await queryAllPlatforms(prompt, 'competitor-context', tracer);

    const results: PlatformResult[] = Object.entries(platformResults).map(
      ([platform, result]) =>
        parseResponse(
          platform as PlatformResult['platform'],
          result,
          companyName,
          domain,
        ),
    );

    queries.push({ prompt, targetCompetitor: competitor, results });

    if (onProgress) {
      const progress = 45 + Math.round((queries.length / allPrompts.length) * 25);
      await onProgress(progress);
    }
  });

  // Recommendation rate = how often the brand is offered as an alternative
  // to a competitor when asked "what's an alternative to X?"
  const allResults = queries.flatMap((q) => q.results);
  const brandMentions = allResults.filter((r) => r.mentioned).length;
  const totalResults = allResults.length;
  const competitiveRecommendationRate = totalResults > 0
    ? Math.round((brandMentions / totalResults) * 100)
    : 0;

  // NOTE: shareOfVoiceByCompetitor is populated later in the pipeline from
  // Phase 3 (unbranded category) responses, where brand + competitors are
  // measured against the same prompts. Phase 2 "alternative to X" queries
  // are inherently biased in favor of competitor X, so they cannot produce
  // a fair SoV comparison. Initialize empty here.
  const shareOfVoiceByCompetitor: Record<string, number> = {};

  return {
    competitors,
    queries,
    competitiveRecommendationRate,
    shareOfVoiceByCompetitor,
    competitorSource,
  };
}

/**
 * Extract a readable company name from a domain.
 * e.g., "hubspot.com" → "HubSpot", "mailchimp.com" → "Mailchimp"
 */
function extractCompanyName(domain: string): string {
  const name = domain
    .replace(/^www\./, '')
    .replace(/\.(com|io|co|net|org|ai|app|dev)$/, '')
    .replace(/[-_]/g, ' ');

  // Capitalize first letter of each word
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * For AI-extracted competitors we don't know the real domain.
 * Return a slug that can be pattern-matched against AI responses
 * (URLs, mentions) without pretending it's a real TLD.
 * Example: "Webflow" → "webflow", "HubSpot" → "hubspot"
 */
function guessDomain(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9-]/g, '');
}
