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
): Promise<CategoryVisibilityData> {
  const prompts = getCategoryQueries(category, industry, entityType);
  const queries: CategoryQuery[] = [];

  await withConcurrency(prompts, 2, async (prompt) => {
    const platformResults = await queryAllPlatforms(prompt, 'category-visibility', tracer);

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

    if (onProgress) {
      const progress = 70 + Math.round((queries.length / prompts.length) * 20);
      await onProgress(progress);
    }
  });

  // Category Discovery Rate: % of responses that mention the brand
  const allResults = queries.flatMap((q) => q.results);
  const mentions = allResults.filter((r) => r.mentioned).length;
  const categoryDiscoveryRate = allResults.length > 0
    ? Math.round((mentions / allResults.length) * 100)
    : 0;

  return {
    queries,
    categoryDiscoveryRate,
    inferredCategory: category,
    inferredIndustry: industry,
  };
}
