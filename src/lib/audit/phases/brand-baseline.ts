import type { BrandBaselineData, BrandQuery, PlatformResult } from '../types';
import { queryAllPlatforms, withConcurrency, TraceCollector } from '../dataforseo';
import { parseResponse, extractAccurateInfo, extractGaps } from '../analysis';
import { getBrandQueries } from '../prompts';

/**
 * Phase 1: Brand Baseline Analysis
 * Runs 10 direct brand queries across 4 AI platforms.
 * Tests how AI platforms perceive and represent the brand.
 */
export async function runBrandBaseline(
  companyName: string,
  domain: string,
  industry?: string,
  onProgress?: (pct: number) => Promise<void>,
  tracer?: TraceCollector,
): Promise<BrandBaselineData> {
  const prompts = getBrandQueries(companyName, industry);
  const queries: BrandQuery[] = [];

  // Run queries 2 at a time (each query hits 4 platforms in parallel)
  await withConcurrency(prompts, 2, async (prompt) => {
    const platformResults = await queryAllPlatforms(prompt, 'brand-baseline', tracer);

    const results: PlatformResult[] = Object.entries(platformResults).map(
      ([platform, result]) =>
        parseResponse(
          platform as PlatformResult['platform'],
          result,
          companyName,
          domain,
        ),
    );

    queries.push({ prompt, results });

    // Report progress (each query is ~4% of total audit)
    if (onProgress) {
      await onProgress(Math.round((queries.length / prompts.length) * 40));
    }
  });

  // Flatten all results for analysis
  const allResults = queries.flatMap((q) => q.results);

  // Calculate recognition score: % of all responses that mention the brand
  const totalResponses = allResults.length;
  const mentionedCount = allResults.filter((r) => r.mentioned).length;
  const brandRecognitionScore = totalResponses > 0
    ? Math.round((mentionedCount / totalResponses) * 100)
    : 0;

  // Extract what AI gets right and wrong
  const accurateInfo = extractAccurateInfo(allResults, companyName, domain, industry);
  const { inaccuracies, gaps } = extractGaps(queries);

  return {
    queries,
    brandRecognitionScore,
    accurateInfo,
    inaccuracies,
    gaps,
  };
}
