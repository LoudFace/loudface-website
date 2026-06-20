import type { CategoryVisibilityData, CategoryQuery, PlatformResult } from '../types';
import { queryAllPlatforms, withConcurrency, TraceCollector } from '../dataforseo';
import { parseResponse } from '../analysis';
import { getCategoryQueries } from '../prompts';

/**
 * Phase 3: Category Visibility Analysis
 * Runs unbranded category queries to check if the brand appears
 * when users search for solutions without mentioning the brand.
 */
export async function runCategoryVisibility(
  companyName: string,
  domain: string,
  category: string,
  industry: string,
  onProgress?: (pct: number) => Promise<void>,
  entityType: 'product' | 'service' | 'brand' = 'product',
  tracer?: TraceCollector,
  buyerPersona?: string,
): Promise<CategoryVisibilityData> {
  const prompts = getCategoryQueries(category, industry, entityType, buyerPersona);
  const queries: CategoryQuery[] = [];

  await withConcurrency(prompts, 2, async (prompt) => {
    const platformResults = await queryAllPlatforms(prompt, 'category-visibility', tracer);

    const results: PlatformResult[] = Object.entries(platformResults).map(
      ([platform, outcome]) =>
        parseResponse(
          platform as PlatformResult['platform'],
          outcome.result,
          companyName,
          domain,
          outcome.status,
          outcome.errorMessage,
        ),
    );

    queries.push({ prompt, results });

    if (onProgress) {
      const progress = 70 + Math.round((queries.length / prompts.length) * 20);
      await onProgress(progress);
    }
  });

  // Category Discovery Rate: % of responses that mention the brand
  const allResults = queries.flatMap((q) => q.results);
  const measuredResults = allResults.filter((r) => r.responseStatus !== 'error' && r.responseStatus !== 'empty');
  const mentions = measuredResults.filter((r) => r.mentioned).length;
  const categoryDiscoveryRate = measuredResults.length > 0
    ? Math.round((mentions / measuredResults.length) * 100)
    : 0;

  return {
    queries,
    categoryDiscoveryRate,
    inferredCategory: category,
    inferredIndustry: industry,
  };
}
