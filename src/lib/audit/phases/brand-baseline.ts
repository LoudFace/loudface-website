import type { BrandBaselineData, BrandQuery, PlatformResult } from '../types';
import { queryAllPlatforms, withConcurrency, TraceCollector } from '../dataforseo';
import { parseResponse } from '../analysis';
import { getBrandQueries } from '../prompts';

/**
 * Phase 1: Brand Baseline — raw data gathering.
 *
 * Runs 10 direct brand queries across 4 AI platforms and returns the raw
 * responses. `accurateInfo` / `inaccuracies` / `gaps` are populated by the
 * LLM-based extraction layer in pipeline.ts — not here. This function only
 * gathers data.
 */
export async function runBrandBaseline(
  companyName: string,
  domain: string,
  onProgress?: (pct: number) => Promise<void>,
  tracer?: TraceCollector,
): Promise<BrandBaselineData> {
  const prompts = getBrandQueries(companyName);
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
      await onProgress(Math.round((queries.length / prompts.length) * 35));
    }
  });

  const allResults = queries.flatMap((q) => q.results);
  const totalResponses = allResults.length;
  const mentionedCount = allResults.filter((r) => r.mentioned).length;
  const brandRecognitionScore = totalResponses > 0
    ? Math.round((mentionedCount / totalResponses) * 100)
    : 0;

  return {
    queries,
    brandRecognitionScore,
    accurateInfo: [],
    inaccuracies: [],
    gaps: [],
  };
}
