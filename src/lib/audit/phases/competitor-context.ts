import { z } from 'zod';
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
import { extractStructured } from '../extract-structured';

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

// ─── Entity-type-aware filter ──────────────────────────────────────

const ENTITY_TYPE_DESCRIPTIONS: Record<'product' | 'service' | 'brand', string> = {
  service:
    'a SERVICE business — an agency, consultancy, or service provider that does work for clients (web design, SEO, marketing, development, etc.). NOT a product, tool, platform, or reference site.',
  brand:
    'a CONSUMER BRAND — sells physical or digital products directly to consumers (apparel, beauty, food, electronics, subscriptions). NOT a B2B platform, a reference site, or a news outlet.',
  product:
    'a PRODUCT / PLATFORM — SaaS, software, a consumer app, or a marketplace. NOT an agency, reference site, or blog.',
};

const ClassificationSchema = z.object({
  domains: z.array(
    z.object({
      domain: z.string().describe('The domain being classified, exactly as provided.'),
      matches_entity_type: z
        .boolean()
        .describe('True only if this domain belongs to the same entity type as the audited brand.'),
      actual_type: z
        .string()
        .describe('One short label for what this domain actually is — e.g. "agency", "saas platform", "reference site", "news outlet", "ecommerce brand".'),
    }),
  ),
});

/**
 * Filter DataForSEO competitor candidates to only those that share the
 * audited brand's entity type. DFS keyword-overlap returns whatever ranks
 * for the brand's blog/content keywords — for agencies that often means
 * the TOOLS they write about (Webflow, Zapier, Figma), not actual rival
 * agencies. A single batched LLM call classifies all candidates in one pass.
 *
 * Two soft-fail behaviors:
 * 1. If the LLM errors or times out, return the unfiltered list.
 * 2. If the filter would drop the list below MIN_KEEP items, pad with the
 *    dropped candidates to preserve SOME competitive signal. The LLM
 *    classifier isn't perfect (e.g. it may read "flow.ninja" as a SaaS
 *    name) — a ruthless filter that blanks out the whole list is worse
 *    than one that keeps some imperfect matches as a baseline.
 */
const MIN_KEEP = 3;
async function filterCompetitorsByEntityType(
  candidates: CompetitorInfo[],
  entityType: 'product' | 'service' | 'brand',
  tracer?: TraceCollector,
): Promise<CompetitorInfo[]> {
  if (candidates.length === 0) return candidates;

  const description = ENTITY_TYPE_DESCRIPTIONS[entityType];
  const prompt = [
    `The audited brand is ${description}`,
    '',
    'Classify each domain below. Return matches_entity_type=true ONLY if it is the same kind of business.',
    'Be strict — a tool an agency writes about is NOT an agency. A review site is NOT a consumer brand.',
    '',
    'Domains:',
    ...candidates.map((c) => `- ${c.domain}`),
  ].join('\n');

  const result = await extractStructured({
    schema: ClassificationSchema,
    prompt,
    system:
      'You classify domains by business type. Return structured judgments — be strict about type matching.',
    model: 'anthropic/claude-haiku-4.5',
    maxOutputTokens: 512,
    temperature: 0,
    tag: 'competitor-discovery',
    tracer,
  });

  if (!result.value) {
    console.warn('[Audit] Entity-type filter failed, using unfiltered DFS list:', result.error);
    return candidates;
  }

  const verdictByDomain = new Map<string, { matches: boolean; actualType: string }>();
  for (const row of result.value.domains) {
    verdictByDomain.set(row.domain.toLowerCase(), {
      matches: row.matches_entity_type,
      actualType: row.actual_type,
    });
  }

  const kept: CompetitorInfo[] = [];
  const dropped: Array<{ domain: string; reason: string }> = [];
  for (const c of candidates) {
    const verdict = verdictByDomain.get(c.domain.toLowerCase());
    // Missing verdict = keep (fail open per-row so we don't silently lose candidates)
    if (!verdict || verdict.matches) {
      kept.push(c);
    } else {
      dropped.push({ domain: c.domain, reason: verdict.actualType });
    }
  }

  if (dropped.length) {
    console.log(
      `[Audit] Entity-type filter dropped ${dropped.length}/${candidates.length} candidates as non-${entityType}:`,
      dropped.map((d) => `${d.domain} (${d.reason})`).join(', '),
    );
  }

  // If the filter was too aggressive and we'd end up below MIN_KEEP, pad
  // back from the dropped list. Preserves at least a minimum competitive
  // set even when the LLM is uncertain or over-rejects.
  if (kept.length < MIN_KEEP && dropped.length > 0) {
    const droppedDomains = new Set(dropped.map((d) => d.domain.toLowerCase()));
    const padded = candidates.filter((c) =>
      droppedDomains.has(c.domain.toLowerCase()) && !kept.some((k) => k.domain === c.domain),
    );
    const needed = MIN_KEEP - kept.length;
    const padding = padded.slice(0, needed);
    if (padding.length) {
      console.log(
        `[Audit] Padding with ${padding.length} dropped candidates to preserve minimum competitive set:`,
        padding.map((p) => p.domain).join(', '),
      );
      kept.push(...padding);
    }
  }

  return kept;
}

/**
 * Phase 2: Competitor Context Analysis
 * Auto-detects competitors, then runs "alternative to" queries
 * to measure how often the brand gets recommended vs competitors.
 *
 * Uses a three-tier competitor resolution:
 * 1. DataForSEO Labs keyword-overlap competitors (filtered for relevance +
 *    entity-type match — e.g. only agencies when auditing an agency)
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

  // Step 1.5: Entity-type filter. DFS keyword-overlap returns whatever ranks
  // for the brand's keywords — for agencies that's often the tools they
  // write about, not rival agencies. One Haiku call per audit classifies
  // all DFS candidates in a single batched prompt and drops mismatches.
  const dfsCandidates: CompetitorInfo[] = filteredDFS.map((c) => ({
    domain: c.domain,
    name: extractCompanyName(c.domain),
    keywordIntersection: c.intersections,
  }));
  const entityFilteredDFS = await filterCompetitorsByEntityType(dfsCandidates, entityType, tracer);

  let competitors: CompetitorInfo[] = entityFilteredDFS;

  let competitorSource: 'dataforseo-labs' | 'ai-extracted' | 'hardcoded' = 'dataforseo-labs';

  // AI-extracted candidates also need entity-type filtering: Phase 1 responses
  // sometimes name tools/libraries alongside the brand (e.g. Finsweet with
  // Relume, Flowbase, Memberstack — tools, not rival agencies). Run the same
  // filter before using these as the competitor set.
  const aiExtractedCandidates: CompetitorInfo[] = aiExtractedCompetitors
    .slice(0, 8)
    .map((c) => ({
      domain: guessDomain(c.name),
      name: c.name,
      keywordIntersection: 0,
    }));
  const filteredAiExtracted = aiExtractedCandidates.length > 0
    ? await filterCompetitorsByEntityType(aiExtractedCandidates, entityType, tracer)
    : [];

  // Cross-validate: check if AI-extracted competitors overlap with DataForSEO results
  const aiNames = aiExtractedCompetitors.map((c) => c.name.toLowerCase());
  const dfsOverlap = competitors.filter((c) =>
    aiNames.some((ai) =>
      c.name.toLowerCase().includes(ai) || ai.includes(c.name.toLowerCase()),
    ),
  );

  if (entityFilteredDFS.length > 0 && dfsOverlap.length === 0 && filteredAiExtracted.length >= 2) {
    // DataForSEO returned entity-matched results but NONE overlap with what AI considers
    // competitors. Usually means DFS found plausible lookalikes by keyword but AI knows
    // the real rivals. Trust the AI-extracted competitors instead.
    // Threshold of 2: dominant brands (Stripe, Linear) often only get named alongside
    // a couple of direct competitors.
    console.log(`[Audit] DataForSEO competitors don't match AI-extracted ones. Using AI competitors.`);
    console.log(`[Audit]   DFS returned: ${competitors.map((c) => c.name).join(', ')}`);
    console.log(`[Audit]   AI extracted: ${filteredAiExtracted.map((c) => c.name).join(', ')}`);

    competitors = filteredAiExtracted.slice(0, 5);
    competitorSource = 'ai-extracted';
  } else if (entityFilteredDFS.length === 0 && filteredAiExtracted.length >= 2) {
    // No DataForSEO results at all — use AI-extracted
    console.log(`[Audit] No DataForSEO competitors. Using AI-extracted.`);
    competitors = filteredAiExtracted.slice(0, 5);
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
