/**
 * Audit Validation Framework
 *
 * Systematically validates every data point in an audit report.
 * Each metric is documented with: what it measures, how it's calculated,
 * valid ranges, and common failure modes.
 *
 * Run via: npx tsx scripts/validate-audit.ts <audit-id>
 */

import type {
  AuditRecord,
  AuditResults,
  AuditScores,
  BrandBaselineData,
  CompetitorContextData,
  CategoryVisibilityData,
  PlatformBreakdown,
  PlatformResult,
  AIPlatform,
  AuditDiagnostics,
} from './types';

// ─── Types ──────────────────────────────────────────────────────────

export type Severity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  /** Which slide/metric this affects */
  metric: string;
  /** error = data is wrong, warning = suspicious, info = FYI */
  severity: Severity;
  /** What went wrong */
  message: string;
  /** Why this matters / what likely caused it */
  explanation: string;
  /** Suggested fix or investigation path */
  suggestion?: string;
}

export interface MetricValidation {
  /** Metric name */
  name: string;
  /** What this metric measures */
  description: string;
  /** How it's calculated (formula) */
  formula: string;
  /** The actual value */
  value: string | number;
  /** Expected range for healthy audits */
  expectedRange: string;
  /** Whether this metric passed validation */
  valid: boolean;
  /** Issues found during validation */
  issues: ValidationIssue[];
}

export interface ValidationReport {
  auditId: string;
  companyName: string;
  domain: string;
  timestamp: string;
  /** Overall health: pass, warn, fail */
  status: 'pass' | 'warn' | 'fail';
  /** Counts by severity */
  summary: { errors: number; warnings: number; infos: number };
  /** Per-metric validation results */
  metrics: MetricValidation[];
  /** All issues sorted by severity */
  allIssues: ValidationIssue[];
}

// ─── Constants ──────────────────────────────────────────────────────

const ALL_PLATFORMS: AIPlatform[] = ['chatgpt', 'claude', 'gemini', 'perplexity'];

// ─── Main Validator ─────────────────────────────────────────────────

/**
 * Validate a complete audit record and produce a structured report.
 */
export function validateAudit(record: AuditRecord): ValidationReport {
  const issues: ValidationIssue[] = [];
  const metrics: MetricValidation[] = [];

  // Basic record validation
  if (record.status !== 'complete' || !record.results) {
    issues.push({
      metric: 'Audit Status',
      severity: 'error',
      message: `Audit is "${record.status}", not "complete"`,
      explanation: record.error
        ? `Pipeline failed with: ${record.error}`
        : 'Audit has not finished processing or has no results.',
    });

    return buildReport(record, metrics, issues);
  }

  const results = record.results;
  const diagnostics = record.diagnostics;

  // ── Phase 1: Brand Baseline ──────────────────────────────────────
  metrics.push(...validateBrandBaseline(results.brandBaseline, record.input.companyName, issues));

  // ── Phase 2: Competitor Context ──────────────────────────────────
  metrics.push(...validateCompetitorContext(results.competitorContext, record.input.companyName, diagnostics, issues));

  // ── Phase 3: Category Visibility ─────────────────────────────────
  metrics.push(...validateCategoryVisibility(results.categoryVisibility, record.input.companyName, diagnostics, issues));

  // ── Scores ───────────────────────────────────────────────────────
  metrics.push(...validateScores(results.scores, results, issues));

  // ── Platform Breakdown ───────────────────────────────────────────
  metrics.push(...validatePlatformBreakdown(results.platformBreakdown, results.brandBaseline, issues));

  // ── Action Items ─────────────────────────────────────────────────
  metrics.push(...validateActionItems(results, issues));

  // ── Cross-phase consistency checks ───────────────────────────────
  metrics.push(...validateCrossPhaseConsistency(results, diagnostics, issues));

  // ── API call health ──────────────────────────────────────────────
  if (diagnostics) {
    metrics.push(...validateApiHealth(diagnostics, issues));
  }

  return buildReport(record, metrics, issues);
}

// ─── Phase 1 Validation ─────────────────────────────────────────────

function validateBrandBaseline(
  data: BrandBaselineData,
  companyName: string,
  issues: ValidationIssue[],
): MetricValidation[] {
  const metrics: MetricValidation[] = [];
  const allResults = data.queries.flatMap((q) => q.results);

  // 1. Brand Recognition Score
  const mentioned = allResults.filter((r) => r.mentioned).length;
  const total = allResults.length;
  const expectedRecognition = total > 0 ? Math.round((mentioned / total) * 100) : 0;

  const recognitionMetric: MetricValidation = {
    name: 'Brand Recognition Score',
    description: 'Percentage of Phase 1 responses (branded queries) where the brand name or domain appears in the AI response text.',
    formula: `(responses mentioning brand / total responses) * 100 = (${mentioned} / ${total}) * 100`,
    value: data.brandRecognitionScore,
    expectedRange: '20-100% for known brands, 0-20% for new/niche brands',
    valid: true,
    issues: [],
  };

  // Verify calculation matches
  if (data.brandRecognitionScore !== expectedRecognition) {
    const issue: ValidationIssue = {
      metric: 'Brand Recognition Score',
      severity: 'error',
      message: `Stored value (${data.brandRecognitionScore}%) doesn't match recalculated value (${expectedRecognition}%)`,
      explanation: 'The score stored in the record differs from what we get by recounting. This suggests a calculation bug.',
    };
    recognitionMetric.valid = false;
    recognitionMetric.issues.push(issue);
    issues.push(issue);
  }

  // Check for 0% recognition (likely ambiguous or unknown brand)
  if (data.brandRecognitionScore === 0 && total > 0) {
    const issue: ValidationIssue = {
      metric: 'Brand Recognition Score',
      severity: 'warning',
      message: `0% brand recognition across ${total} responses`,
      explanation: `No AI platform recognized "${companyName}" in any branded query. This usually means: (1) the brand is too new/small for AI training data, (2) the brand name is being confused with another entity, or (3) the API returned empty/error responses.`,
      suggestion: 'Check the raw responses to see if AI platforms discuss a different entity with the same name.',
    };
    recognitionMetric.issues.push(issue);
    issues.push(issue);
  }

  // Check for empty/error responses
  const emptyResponses = allResults.filter((r) => !r.rawResponse && !r.mentioned);
  if (emptyResponses.length > total * 0.3) {
    const issue: ValidationIssue = {
      metric: 'Brand Recognition Score',
      severity: 'warning',
      message: `${emptyResponses.length}/${total} responses are empty (no raw text)`,
      explanation: 'A high number of empty responses indicates API failures, which deflates the recognition score.',
      suggestion: 'Check diagnostics.traces for failed API calls.',
    };
    recognitionMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(recognitionMetric);

  // 2. Query count
  const queryCountMetric: MetricValidation = {
    name: 'Phase 1 Query Count',
    description: 'Number of branded queries sent (should be 10 per the prompt template).',
    formula: `getBrandQueries() returns 10 prompts`,
    value: data.queries.length,
    expectedRange: '10',
    valid: data.queries.length === 10,
    issues: [],
  };
  if (data.queries.length !== 10) {
    const issue: ValidationIssue = {
      metric: 'Phase 1 Query Count',
      severity: 'warning',
      message: `Expected 10 queries, got ${data.queries.length}`,
      explanation: 'Each branded query should hit 4 platforms. Missing queries mean incomplete data.',
    };
    queryCountMetric.issues.push(issue);
    issues.push(issue);
  }
  metrics.push(queryCountMetric);

  // 3. Responses per query (should be 4 — one per platform)
  for (const q of data.queries) {
    if (q.results.length !== 4) {
      const issue: ValidationIssue = {
        metric: 'Phase 1 Platform Coverage',
        severity: 'warning',
        message: `Query "${q.prompt.slice(0, 50)}" has ${q.results.length}/4 platform responses`,
        explanation: 'Each query should produce exactly 4 responses (ChatGPT, Claude, Gemini, Perplexity). Missing responses indicate API failures for specific platforms.',
      };
      issues.push(issue);
    }
  }

  // 4. Accurate Info quality
  const accurateInfoMetric: MetricValidation = {
    name: 'Accurate Info Extraction',
    description: 'Facts extracted from AI responses that are deemed relevant to the correct entity. Uses relevance scoring to filter out facts about different entities with the same brand name.',
    formula: 'Sentences from rawResponse where positiveSignalScore > 0 (after negativeSignal penalties), max 6 facts',
    value: `${data.accurateInfo.length} facts`,
    expectedRange: '1-6 facts for recognized brands, 0 for unrecognized brands',
    valid: true,
    issues: [],
  };

  if (data.brandRecognitionScore > 30 && data.accurateInfo.length === 0) {
    const issue: ValidationIssue = {
      metric: 'Accurate Info Extraction',
      severity: 'warning',
      message: `Brand is recognized (${data.brandRecognitionScore}%) but 0 accurate facts extracted`,
      explanation: 'The brand is mentioned in responses but the relevance filter rejected all sentences. This could mean: (1) all mentions are about a different entity with the same name, (2) positive signals are too narrow for this industry, or (3) responses lack factual statements.',
      suggestion: 'Inspect rawResponse text for mentions — are they about the right company?',
    };
    accurateInfoMetric.issues.push(issue);
    issues.push(issue);
  }

  // Check for wrong-entity contamination in accurate info
  const wrongEntityPatterns = [
    /helmet|biker|bone.?conduction|eyewear|glasses/i,
    /band|album|song|musician|recording artist/i,
    /tv channel|television|anime|tokusatsu/i,
    /cx platform|customer experience platform|contact center/i,
  ];
  for (const fact of data.accurateInfo) {
    for (const pattern of wrongEntityPatterns) {
      if (pattern.test(fact)) {
        const issue: ValidationIssue = {
          metric: 'Accurate Info Extraction',
          severity: 'error',
          message: `Wrong-entity fact leaked through: "${fact.slice(0, 80)}..."`,
          explanation: 'A fact about a different entity (same name) made it past the relevance filter. The negative signal list may need updating for this brand.',
          suggestion: 'Add the missing negative signals to extractAccurateInfo() in analysis.ts.',
        };
        accurateInfoMetric.valid = false;
        accurateInfoMetric.issues.push(issue);
        issues.push(issue);
      }
    }
  }

  metrics.push(accurateInfoMetric);

  // 5. Gaps & Inaccuracies
  const gapsMetric: MetricValidation = {
    name: 'Gaps & Inaccuracies',
    description: 'Knowledge gaps: platforms that don\'t mention or cite the brand. Inaccuracies: responses with negative sentiment.',
    formula: 'Gaps: per-platform mention/citation analysis across all queries. Inaccuracies: responses where sentiment === "negative".',
    value: `${data.gaps.length} gaps, ${data.inaccuracies.length} inaccuracies`,
    expectedRange: '0-5 gaps, 0-5 inaccuracies',
    valid: true,
    issues: [],
  };

  // Blanket statement check
  for (const gap of data.gaps) {
    if (/not cited by .+ across all/i.test(gap) && data.brandRecognitionScore === 0) {
      const issue: ValidationIssue = {
        metric: 'Gaps & Inaccuracies',
        severity: 'info',
        message: 'Citation gaps are expected when brand recognition is 0%',
        explanation: 'If no platform recognizes the brand, citation gaps are a natural consequence, not an independent finding.',
      };
      gapsMetric.issues.push(issue);
      issues.push(issue);
    }
  }

  metrics.push(gapsMetric);

  return metrics;
}

// ─── Phase 2 Validation ─────────────────────────────────────────────

function validateCompetitorContext(
  data: CompetitorContextData,
  companyName: string,
  diagnostics: AuditDiagnostics | undefined,
  issues: ValidationIssue[],
): MetricValidation[] {
  const metrics: MetricValidation[] = [];
  const allResults = data.queries.flatMap((q) => q.results);

  // 1. Competitor Source
  const source = diagnostics?.competitorSource ?? 'unknown';
  const competitorSourceMetric: MetricValidation = {
    name: 'Competitor Source',
    description: 'How competitors were identified. "dataforseo-labs" = keyword overlap API (best), "ai-extracted" = mined from Phase 1 AI responses (good), "hardcoded" = fallback list (only for known domains).',
    formula: 'Three-tier resolution: filtered DataForSEO Labs → AI-extracted from Phase 1 → hardcoded fallback',
    value: source,
    expectedRange: '"dataforseo-labs" or "ai-extracted"',
    valid: source !== 'hardcoded',
    issues: [],
  };

  if (source === 'hardcoded') {
    const issue: ValidationIssue = {
      metric: 'Competitor Source',
      severity: 'warning',
      message: 'Competitors came from hardcoded fallback list',
      explanation: 'Neither DataForSEO Labs nor AI extraction produced usable competitors. The hardcoded list only exists for a few known domains and may be inaccurate for others.',
      suggestion: 'Check if the domain has enough organic keyword data for DataForSEO Labs to return competitors.',
    };
    competitorSourceMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(competitorSourceMetric);

  // 2. Competitor Count
  const compCountMetric: MetricValidation = {
    name: 'Competitor Count',
    description: 'Number of competitors tracked in the audit.',
    formula: 'Top 5 from competitor resolution (only top 3 are queried in Phase 2)',
    value: data.competitors.length,
    expectedRange: '3-5',
    valid: data.competitors.length >= 1,
    issues: [],
  };

  if (data.competitors.length === 0) {
    const issue: ValidationIssue = {
      metric: 'Competitor Count',
      severity: 'error',
      message: 'No competitors identified',
      explanation: 'Phase 2 cannot function without competitors. All "alternative to" queries will be skipped.',
    };
    compCountMetric.valid = false;
    compCountMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(compCountMetric);

  // 3. Competitor Relevance check
  const compRelevanceMetric: MetricValidation = {
    name: 'Competitor Relevance',
    description: 'Whether identified competitors are actual business competitors (same industry/category) rather than keyword-overlap noise (exchanges, news sites, social media).',
    formula: 'Competitors filtered through NEVER_COMPETITOR_DOMAINS blocklist + AI cross-validation',
    value: data.competitors.map((c) => `${c.name} (${c.domain})`).join(', '),
    expectedRange: 'Companies in the same product/service category',
    valid: true,
    issues: [],
  };

  // Check for obvious non-competitors that slipped through
  const suspiciousDomainPatterns = [
    /exchange|swap|trade|casino|bet|porn|adult/i,
    /\.gov$|\.edu$/,
    /news|media|press|journal|times/i,
  ];
  for (const comp of data.competitors) {
    for (const pattern of suspiciousDomainPatterns) {
      if (pattern.test(comp.domain) || pattern.test(comp.name)) {
        const issue: ValidationIssue = {
          metric: 'Competitor Relevance',
          severity: 'warning',
          message: `Suspicious competitor: "${comp.name}" (${comp.domain})`,
          explanation: 'This looks like a news site, exchange, or non-business domain rather than an actual competitor.',
          suggestion: 'Add this domain pattern to NEVER_COMPETITOR_DOMAINS in analysis.ts.',
        };
        compRelevanceMetric.issues.push(issue);
        issues.push(issue);
      }
    }
  }

  metrics.push(compRelevanceMetric);

  // 4. Competitive Recommendation Rate
  const brandMentions = allResults.filter((r) => r.mentioned).length;
  const totalResults = allResults.length;
  const expectedRate = totalResults > 0 ? Math.round((brandMentions / totalResults) * 100) : 0;

  const recRateMetric: MetricValidation = {
    name: 'Competitive Recommendation Rate',
    description: 'How often the audited brand appears in "alternative to [competitor]" queries. Measures whether AI recommends this brand when users ask about competitors.',
    formula: `(brand mentions in competitor queries / total competitor query responses) * 100 = (${brandMentions} / ${totalResults}) * 100`,
    value: data.competitiveRecommendationRate,
    expectedRange: '0-50% (0% is common for niche brands, >50% means strong competitive presence)',
    valid: true,
    issues: [],
  };

  if (data.competitiveRecommendationRate !== expectedRate) {
    const issue: ValidationIssue = {
      metric: 'Competitive Recommendation Rate',
      severity: 'error',
      message: `Stored value (${data.competitiveRecommendationRate}%) doesn't match recalculated value (${expectedRate}%)`,
      explanation: 'Calculation mismatch — possible bug in pipeline.',
    };
    recRateMetric.valid = false;
    recRateMetric.issues.push(issue);
    issues.push(issue);
  }

  if (data.competitiveRecommendationRate === 0 && totalResults > 0) {
    const issue: ValidationIssue = {
      metric: 'Competitive Recommendation Rate',
      severity: 'info',
      message: `0% recommendation rate across ${totalResults} competitor query responses`,
      explanation: `"${companyName}" was never mentioned when asking for alternatives to its competitors. This is common for: (1) niche/new brands that AI hasn't been trained on, (2) brands in a different sub-category than their competitors, or (3) when competitor names are wrong (check Competitor Relevance).`,
      suggestion: 'This metric is valid if competitors are correct. A 0% rate simply means AI doesn\'t yet associate this brand with competitive queries.',
    };
    recRateMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(recRateMetric);

  // 5. Share of Voice by Competitor
  const sovMetric: MetricValidation = {
    name: 'Share of Voice by Competitor',
    description: 'For each competitor, what percentage of "alternative to [competitor]" responses mention that competitor. This is the COMPETITOR\'s mention rate in their own queries, not the audited brand\'s.',
    formula: '(responses mentioning competitor name/domain in their "alternative to" queries / total responses for that competitor) * 100',
    value: JSON.stringify(data.shareOfVoiceByCompetitor),
    expectedRange: '30-90% per competitor (competitors should appear in their own alternative queries)',
    valid: true,
    issues: [],
  };

  const allZeroSov = Object.values(data.shareOfVoiceByCompetitor).every((v) => v === 0);
  if (allZeroSov && Object.keys(data.shareOfVoiceByCompetitor).length > 0) {
    const issue: ValidationIssue = {
      metric: 'Share of Voice by Competitor',
      severity: 'warning',
      message: 'All competitors have 0% share of voice in their own queries',
      explanation: 'When asking "alternatives to X", none of the responses mention X itself. This could mean: (1) the competitor name matching is too strict (check if AI uses a different name/spelling), (2) the competitor names are wrong, or (3) all API calls for this phase failed.',
      suggestion: 'Inspect rawResponse text for Phase 2 queries — do the responses discuss these competitors under different names?',
    };
    sovMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(sovMetric);

  // 6. Query count
  const expectedQueries = Math.min(data.competitors.length, 3) * 2; // top 3 competitors * 2 prompts each
  const queryCountMetric: MetricValidation = {
    name: 'Phase 2 Query Count',
    description: 'Number of "alternative to" queries sent. Should be (min(competitors, 3) * 2 prompts per competitor).',
    formula: `min(${data.competitors.length}, 3) * 2 = ${expectedQueries}`,
    value: data.queries.length,
    expectedRange: `${expectedQueries}`,
    valid: data.queries.length === expectedQueries,
    issues: [],
  };
  if (data.queries.length !== expectedQueries) {
    const issue: ValidationIssue = {
      metric: 'Phase 2 Query Count',
      severity: 'warning',
      message: `Expected ${expectedQueries} queries, got ${data.queries.length}`,
      explanation: 'Missing queries means incomplete competitive data.',
    };
    queryCountMetric.issues.push(issue);
    issues.push(issue);
  }
  metrics.push(queryCountMetric);

  return metrics;
}

// ─── Phase 3 Validation ─────────────────────────────────────────────

function validateCategoryVisibility(
  data: CategoryVisibilityData,
  companyName: string,
  diagnostics: AuditDiagnostics | undefined,
  issues: ValidationIssue[],
): MetricValidation[] {
  const metrics: MetricValidation[] = [];
  const allResults = data.queries.flatMap((q) => q.results);

  // 1. Inferred Category
  const categoryMetric: MetricValidation = {
    name: 'Inferred Category',
    description: 'The product/service category used for unbranded "best X" queries. First tries extractSpecificCategory() (from "X is a [description]" patterns), falls back to inferCategory() (keyword bucket matching).',
    formula: 'extractSpecificCategory(Phase1 responses) || inferCategory(Phase1 responses)',
    value: data.inferredCategory,
    expectedRange: 'A specific, searchable category (e.g., "crypto payroll", "Webflow agency", "CRM software")',
    valid: true,
    issues: [],
  };

  // Check for overly broad categories
  const broadCategories = ['software', 'saas', 'fintech', 'technology', 'marketing', 'design', 'AI'];
  if (broadCategories.includes(data.inferredCategory.toLowerCase())) {
    const issue: ValidationIssue = {
      metric: 'Inferred Category',
      severity: 'warning',
      message: `Category "${data.inferredCategory}" is too broad`,
      explanation: `Broad categories like "${data.inferredCategory}" produce generic queries ("Best ${data.inferredCategory} software in 2026") that won't mention niche brands. This typically deflates Discovery Visibility to 0%.`,
      suggestion: 'Check if extractSpecificCategory() found a description but it was filtered out. The fallback inferCategory() only has broad buckets.',
    };
    categoryMetric.issues.push(issue);
    issues.push(issue);
  }

  // Check for suspiciously wrong categories
  if (data.inferredCategory.length < 3) {
    const issue: ValidationIssue = {
      metric: 'Inferred Category',
      severity: 'error',
      message: `Category "${data.inferredCategory}" is too short/empty`,
      explanation: 'Category extraction failed. Phase 3 queries will be meaningless.',
    };
    categoryMetric.valid = false;
    categoryMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(categoryMetric);

  // 2. Category Discovery Rate
  const mentions = allResults.filter((r) => r.mentioned).length;
  const total = allResults.length;
  const expectedRate = total > 0 ? Math.round((mentions / total) * 100) : 0;

  const discoveryMetric: MetricValidation = {
    name: 'Category Discovery Rate',
    description: 'Percentage of unbranded category queries where the brand appears. Measures whether AI recommends this brand when users search generically ("best X tools").',
    formula: `(mentions in category queries / total category responses) * 100 = (${mentions} / ${total}) * 100`,
    value: data.categoryDiscoveryRate,
    expectedRange: '0-40% for niche brands, 40-80% for category leaders',
    valid: true,
    issues: [],
  };

  if (data.categoryDiscoveryRate !== expectedRate) {
    const issue: ValidationIssue = {
      metric: 'Category Discovery Rate',
      severity: 'error',
      message: `Stored value (${data.categoryDiscoveryRate}%) doesn't match recalculated (${expectedRate}%)`,
      explanation: 'Calculation mismatch — possible bug.',
    };
    discoveryMetric.valid = false;
    discoveryMetric.issues.push(issue);
    issues.push(issue);
  }

  if (data.categoryDiscoveryRate === 0 && total > 0) {
    const issue: ValidationIssue = {
      metric: 'Category Discovery Rate',
      severity: 'info',
      message: `0% category discovery across ${total} responses`,
      explanation: `"${companyName}" was never mentioned in unbranded "${data.inferredCategory}" queries. This is expected if: (1) the category is too broad (check Inferred Category), (2) the brand is too niche for generic "best X" lists, or (3) AI hasn't been trained on this brand's category content.`,
      suggestion: 'If the category is wrong/too broad, this metric is misleading. Fix the category first.',
    };
    discoveryMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(discoveryMetric);

  // 3. Query count
  const queryCountMetric: MetricValidation = {
    name: 'Phase 3 Query Count',
    description: 'Number of unbranded category queries sent (should be 5).',
    formula: 'getCategoryQueries() returns 5 prompts',
    value: data.queries.length,
    expectedRange: '5',
    valid: data.queries.length === 5,
    issues: [],
  };
  if (data.queries.length !== 5) {
    const issue: ValidationIssue = {
      metric: 'Phase 3 Query Count',
      severity: 'warning',
      message: `Expected 5 queries, got ${data.queries.length}`,
      explanation: 'Missing queries means incomplete category visibility data.',
    };
    queryCountMetric.issues.push(issue);
    issues.push(issue);
  }
  metrics.push(queryCountMetric);

  // 4. Show the actual queries sent (for debugging category issues)
  const queriesSentMetric: MetricValidation = {
    name: 'Phase 3 Queries Sent',
    description: 'The actual unbranded queries that were sent. If the category is wrong, these queries won\'t be relevant.',
    formula: 'getCategoryQueries(inferredCategory, inferredIndustry, entityType)',
    value: data.queries.map((q) => q.prompt).join(' | '),
    expectedRange: 'Queries that a potential customer would actually search',
    valid: true,
    issues: [],
  };
  metrics.push(queriesSentMetric);

  return metrics;
}

// ─── Score Validation ───────────────────────────────────────────────

function validateScores(
  scores: AuditScores,
  results: AuditResults,
  issues: ValidationIssue[],
): MetricValidation[] {
  const metrics: MetricValidation[] = [];

  // 1. Discovery Visibility (recalculate to verify)
  const catResults = results.categoryVisibility.queries.flatMap((q) => q.results);
  const catMentions = catResults.filter((r) => r.mentioned).length;
  const expectedDV = catResults.length > 0 ? Math.round((catMentions / catResults.length) * 100) : 0;

  const dvMetric: MetricValidation = {
    name: 'Discovery Visibility Score',
    description: 'Executive scorecard metric. Percentage of Phase 3 (unbranded category) responses where the brand appears. This is the same as Category Discovery Rate.',
    formula: `(Phase 3 mentions / Phase 3 total) * 100 = (${catMentions} / ${catResults.length}) * 100`,
    value: scores.discoveryVisibility,
    expectedRange: '0-100',
    valid: scores.discoveryVisibility === expectedDV,
    issues: [],
  };

  if (scores.discoveryVisibility !== expectedDV) {
    const issue: ValidationIssue = {
      metric: 'Discovery Visibility Score',
      severity: 'error',
      message: `Score (${scores.discoveryVisibility}) doesn't match recalculated (${expectedDV})`,
      explanation: 'Calculation mismatch in scoring.ts.',
    };
    dvMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(dvMetric);

  // 2. Share of Voice (recalculate)
  const compResults = results.competitorContext.queries.flatMap((q) => q.results);
  const brandInComp = compResults.filter((r) => r.mentioned).length;
  const expectedSoV = compResults.length > 0 ? Math.round((brandInComp / compResults.length) * 100) : 0;

  const sovMetric: MetricValidation = {
    name: 'Share of Voice Score',
    description: 'Executive scorecard metric. Percentage of Phase 2 (competitor "alternative to") responses where the AUDITED BRAND appears. Measures how often AI recommends this brand in competitive contexts.',
    formula: `(brand mentions in competitor queries / total competitor responses) * 100 = (${brandInComp} / ${compResults.length}) * 100`,
    value: scores.shareOfVoice,
    expectedRange: '0-50% typical, 0% common for niche brands',
    valid: scores.shareOfVoice === expectedSoV,
    issues: [],
  };

  if (scores.shareOfVoice !== expectedSoV) {
    const issue: ValidationIssue = {
      metric: 'Share of Voice Score',
      severity: 'error',
      message: `Score (${scores.shareOfVoice}) doesn't match recalculated (${expectedSoV})`,
      explanation: 'Calculation mismatch in scoring.ts.',
    };
    sovMetric.issues.push(issue);
    issues.push(issue);
  }

  if (scores.shareOfVoice === 0 && scores.discoveryVisibility === 0) {
    const issue: ValidationIssue = {
      metric: 'Share of Voice Score',
      severity: 'info',
      message: 'Both SoV and Discovery Visibility are 0%',
      explanation: 'The brand has no presence in either competitive or category queries. This is a genuine finding if the brand is very niche, or indicates category/competitor detection issues if the brand should be known.',
    };
    sovMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(sovMetric);

  // 3. Competitive Standing
  const standingMetric: MetricValidation = {
    name: 'Competitive Standing',
    description: 'Rank among tracked competitors by mention rate. 1 = most mentioned. Based on comparing the brand\'s SoV against each competitor\'s SoV.',
    formula: 'Count competitors with SoV > brand SoV, add 1',
    value: `#${scores.competitiveStanding} of ${scores.competitorsTracked + 1}`,
    expectedRange: '1 to (competitors + 1)',
    valid: scores.competitiveStanding >= 1 && scores.competitiveStanding <= scores.competitorsTracked + 1,
    issues: [],
  };

  if (scores.competitiveStanding > scores.competitorsTracked + 1) {
    const issue: ValidationIssue = {
      metric: 'Competitive Standing',
      severity: 'error',
      message: `Rank ${scores.competitiveStanding} exceeds possible range (max ${scores.competitorsTracked + 1})`,
      explanation: 'Bug in ranking calculation.',
    };
    standingMetric.valid = false;
    standingMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(standingMetric);

  // 4. Platform Coverage
  const platformsMentioning = new Set<string>();
  for (const query of results.brandBaseline.queries) {
    for (const result of query.results) {
      if (result.mentioned) platformsMentioning.add(result.platform);
    }
  }

  const pcMetric: MetricValidation = {
    name: 'Platform Coverage',
    description: 'How many of the 4 AI platforms (ChatGPT, Claude, Gemini, Perplexity) mention the brand in at least one Phase 1 branded query.',
    formula: 'Count of unique platforms with at least 1 mention in Phase 1',
    value: `${scores.platformCoverage}/4 (${[...platformsMentioning].join(', ') || 'none'})`,
    expectedRange: '1-4 for known brands, 0 for unrecognized brands',
    valid: scores.platformCoverage === platformsMentioning.size,
    issues: [],
  };

  if (scores.platformCoverage !== platformsMentioning.size) {
    const issue: ValidationIssue = {
      metric: 'Platform Coverage',
      severity: 'error',
      message: `Score (${scores.platformCoverage}) doesn't match recalculated (${platformsMentioning.size})`,
      explanation: 'Calculation mismatch.',
    };
    pcMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(pcMetric);

  // 5. Overall Grade
  const expectedGrade = (() => {
    const v = scores.discoveryVisibility;
    const s = scores.shareOfVoice;
    if (v >= 70 && s >= 40) return 'A';
    if (v >= 50 && s >= 25) return 'B';
    if (v >= 30 && s >= 15) return 'C';
    if (v >= 15) return 'D';
    return 'F';
  })();

  const gradeMetric: MetricValidation = {
    name: 'Overall Grade',
    description: 'Letter grade based on Discovery Visibility and Share of Voice thresholds. A: DV>=70 & SoV>=40, B: DV>=50 & SoV>=25, C: DV>=30 & SoV>=15, D: DV>=15, F: everything else.',
    formula: `calculateGrade(discoveryVisibility=${scores.discoveryVisibility}, shareOfVoice=${scores.shareOfVoice})`,
    value: scores.overallGrade,
    expectedRange: 'A, B, C, D, or F',
    valid: scores.overallGrade === expectedGrade,
    issues: [],
  };

  if (scores.overallGrade !== expectedGrade) {
    const issue: ValidationIssue = {
      metric: 'Overall Grade',
      severity: 'error',
      message: `Grade "${scores.overallGrade}" doesn't match expected "${expectedGrade}"`,
      explanation: 'Bug in grade calculation.',
    };
    gradeMetric.valid = false;
    gradeMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(gradeMetric);

  return metrics;
}

// ─── Platform Breakdown Validation ──────────────────────────────────

function validatePlatformBreakdown(
  breakdown: PlatformBreakdown,
  brandBaseline: BrandBaselineData,
  issues: ValidationIssue[],
): MetricValidation[] {
  const metrics: MetricValidation[] = [];
  const allBrandResults = brandBaseline.queries.flatMap((q) => q.results);

  for (const platform of ALL_PLATFORMS) {
    const platformResults = allBrandResults.filter((r) => r.platform === platform);
    const expectedMentions = platformResults.filter((r) => r.mentioned).length;
    const expectedRate = platformResults.length > 0
      ? Math.round((expectedMentions / platformResults.length) * 100)
      : 0;

    const metric: MetricValidation = {
      name: `Platform: ${platform} Mention Rate`,
      description: `Percentage of Phase 1 branded queries where ${platform} mentions the brand. Based only on branded queries (not competitor/category queries).`,
      formula: `(${platform} mentions / ${platform} total in Phase 1) * 100 = (${expectedMentions} / ${platformResults.length}) * 100`,
      value: breakdown[platform].mentionRate,
      expectedRange: '0-100%',
      valid: breakdown[platform].mentionRate === expectedRate,
      issues: [],
    };

    if (breakdown[platform].mentionRate !== expectedRate) {
      const issue: ValidationIssue = {
        metric: `Platform: ${platform}`,
        severity: 'error',
        message: `Mention rate (${breakdown[platform].mentionRate}%) doesn't match recalculated (${expectedRate}%)`,
        explanation: 'Calculation mismatch in platform breakdown.',
      };
      metric.valid = false;
      metric.issues.push(issue);
      issues.push(issue);
    }

    if (platformResults.length === 0) {
      const issue: ValidationIssue = {
        metric: `Platform: ${platform}`,
        severity: 'warning',
        message: `No responses from ${platform} in Phase 1`,
        explanation: `All ${platform} API calls failed or returned empty. This platform's data is completely missing.`,
      };
      metric.issues.push(issue);
      issues.push(issue);
    }

    metrics.push(metric);
  }

  return metrics;
}

// ─── Action Items Validation ────────────────────────────────────────

function validateActionItems(
  results: AuditResults,
  issues: ValidationIssue[],
): MetricValidation[] {
  const metric: MetricValidation = {
    name: 'Action Items',
    description: 'Prioritized recommendations generated based on score thresholds and gaps. Rule-based: each rule checks a specific metric threshold.',
    formula: 'If inaccuracies > 0 → "Correct Inaccurate AI Information" (high). If platformCoverage < 3 → "Increase Platform Coverage" (high). If gaps > 0 → "Fill Knowledge Gaps" (high). If discoveryVisibility < 40 → "Improve Category Visibility" (medium). If shareOfVoice < 25 → "Boost Competitive Share of Voice" (medium). If mentionedButNotCited > 5 → "Improve Source Attribution" (medium). If grade === F → "Build AI Visibility From Scratch" (high). Max 6 items.',
    value: `${results.actionItems.length} items (${results.actionItems.filter((i) => i.priority === 'high').length} high, ${results.actionItems.filter((i) => i.priority === 'medium').length} medium)`,
    expectedRange: '1-6 items',
    valid: results.actionItems.length > 0,
    issues: [],
  };

  if (results.actionItems.length === 0) {
    const issue: ValidationIssue = {
      metric: 'Action Items',
      severity: 'warning',
      message: 'No action items generated',
      explanation: 'All metric thresholds passed (high scores across the board). This is rare — verify that scores are correct first.',
    };
    metric.issues.push(issue);
    issues.push(issue);
  }

  return [metric];
}

// ─── Cross-Phase Consistency ────────────────────────────────────────

function validateCrossPhaseConsistency(
  results: AuditResults,
  diagnostics: AuditDiagnostics | undefined,
  issues: ValidationIssue[],
): MetricValidation[] {
  const metrics: MetricValidation[] = [];

  // 1. Brand recognition vs discovery visibility consistency
  const recognition = results.brandBaseline.brandRecognitionScore;
  const discovery = results.scores.discoveryVisibility;

  const consistencyMetric: MetricValidation = {
    name: 'Recognition vs Discovery Consistency',
    description: 'Cross-check: if a brand is well-known (high Phase 1 recognition), it should also appear in some category queries (Phase 3). A big gap may indicate category inference issues.',
    formula: 'Compare brandRecognitionScore (Phase 1) vs discoveryVisibility (Phase 3)',
    value: `Recognition: ${recognition}%, Discovery: ${discovery}%`,
    expectedRange: 'Within ~30 percentage points for well-known brands',
    valid: true,
    issues: [],
  };

  if (recognition > 60 && discovery === 0) {
    const issue: ValidationIssue = {
      metric: 'Recognition vs Discovery',
      severity: 'warning',
      message: `High recognition (${recognition}%) but 0% discovery visibility`,
      explanation: 'AI platforms know this brand (Phase 1) but never mention it in category searches (Phase 3). This strongly suggests the inferred category is wrong or too broad — the "best X" queries aren\'t in the right product space.',
      suggestion: `Check if "${results.categoryVisibility.inferredCategory}" is the right category. If not, the specific category extraction may need industry-specific signals.`,
    };
    consistencyMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(consistencyMetric);

  // 2. Entity type consistency
  const entityType = diagnostics?.inferredEntityType;
  if (entityType) {
    const entityMetric: MetricValidation = {
      name: 'Entity Type',
      description: 'Whether the company is classified as a "product" (software/SaaS) or "service" (agency/consulting). Affects prompt templates used in Phase 2 and 3.',
      formula: 'Scored from Phase 1 responses: service signals (agency, consulting, studio) vs product signals (software, platform, tool, SaaS)',
      value: entityType,
      expectedRange: '"product" or "service"',
      valid: entityType === 'product' || entityType === 'service',
      issues: [],
    };
    metrics.push(entityMetric);
  }

  // 3. Total response count sanity check
  const totalP1 = results.brandBaseline.queries.flatMap((q) => q.results).length;
  const totalP2 = results.competitorContext.queries.flatMap((q) => q.results).length;
  const totalP3 = results.categoryVisibility.queries.flatMap((q) => q.results).length;
  const expectedP1 = results.brandBaseline.queries.length * 4; // 4 platforms per query
  const expectedP2 = results.competitorContext.queries.length * 4;
  const expectedP3 = results.categoryVisibility.queries.length * 4;

  const responseCountMetric: MetricValidation = {
    name: 'Response Completeness',
    description: 'Verify that each query produced 4 platform responses (no missing platforms).',
    formula: 'queries * 4 platforms = expected responses',
    value: `P1: ${totalP1}/${expectedP1}, P2: ${totalP2}/${expectedP2}, P3: ${totalP3}/${expectedP3}`,
    expectedRange: 'All ratios should be equal (no missing responses)',
    valid: totalP1 === expectedP1 && totalP2 === expectedP2 && totalP3 === expectedP3,
    issues: [],
  };

  const missingP1 = expectedP1 - totalP1;
  const missingP2 = expectedP2 - totalP2;
  const missingP3 = expectedP3 - totalP3;
  const totalMissing = missingP1 + missingP2 + missingP3;

  if (totalMissing > 0) {
    const issue: ValidationIssue = {
      metric: 'Response Completeness',
      severity: totalMissing > 5 ? 'warning' : 'info',
      message: `${totalMissing} missing platform responses across all phases`,
      explanation: 'Some API calls didn\'t return responses. This reduces data quality proportionally.',
    };
    responseCountMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(responseCountMetric);

  return metrics;
}

// ─── API Health Validation ──────────────────────────────────────────

function validateApiHealth(
  diagnostics: AuditDiagnostics,
  issues: ValidationIssue[],
): MetricValidation[] {
  const metrics: MetricValidation[] = [];

  const failRate = diagnostics.totalApiCalls > 0
    ? Math.round((diagnostics.failedCalls / diagnostics.totalApiCalls) * 100)
    : 0;

  const apiMetric: MetricValidation = {
    name: 'API Call Success Rate',
    description: 'Percentage of DataForSEO API calls that returned a valid response.',
    formula: `(successful / total) * 100 = (${diagnostics.successfulCalls} / ${diagnostics.totalApiCalls}) * 100`,
    value: `${100 - failRate}% (${diagnostics.successfulCalls}/${diagnostics.totalApiCalls} succeeded, ${diagnostics.failedCalls} failed, ${diagnostics.emptyCalls} empty)`,
    expectedRange: '>90% success rate',
    valid: failRate < 20,
    issues: [],
  };

  if (failRate >= 20) {
    const issue: ValidationIssue = {
      metric: 'API Health',
      severity: 'error',
      message: `${failRate}% API failure rate (${diagnostics.failedCalls}/${diagnostics.totalApiCalls} calls failed)`,
      explanation: 'High failure rate significantly degrades data quality. Check DataForSEO account status, credentials, and rate limits.',
    };
    apiMetric.issues.push(issue);
    issues.push(issue);
  } else if (failRate >= 10) {
    const issue: ValidationIssue = {
      metric: 'API Health',
      severity: 'warning',
      message: `${failRate}% API failure rate`,
      explanation: 'Some API calls failed. Results are mostly complete but may be missing data from specific platforms.',
    };
    apiMetric.issues.push(issue);
    issues.push(issue);
  }

  if (diagnostics.emptyCalls > diagnostics.totalApiCalls * 0.2) {
    const issue: ValidationIssue = {
      metric: 'API Health',
      severity: 'warning',
      message: `${diagnostics.emptyCalls} empty responses (API succeeded but returned no content)`,
      explanation: 'Empty responses count as "not mentioned" but may indicate the AI platform couldn\'t answer the query.',
    };
    apiMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(apiMetric);

  // Cost sanity check
  const costMetric: MetricValidation = {
    name: 'Audit Cost',
    description: 'Total DataForSEO API cost for this audit.',
    formula: 'Sum of all API call costs',
    value: `$${diagnostics.totalCostUsd.toFixed(2)}`,
    expectedRange: '$1-5 per audit',
    valid: diagnostics.totalCostUsd < 10,
    issues: [],
  };

  if (diagnostics.totalCostUsd > 10) {
    const issue: ValidationIssue = {
      metric: 'Audit Cost',
      severity: 'warning',
      message: `Audit cost $${diagnostics.totalCostUsd.toFixed(2)} — higher than expected`,
      explanation: 'Check for duplicate API calls or unexpectedly verbose responses.',
    };
    costMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(costMetric);

  // Duration check
  const durationSec = Math.round(diagnostics.totalDurationMs / 1000);
  const durationMetric: MetricValidation = {
    name: 'Audit Duration',
    description: 'Total wall-clock time for the audit pipeline.',
    formula: 'End time - start time',
    value: `${durationSec}s`,
    expectedRange: '60-180s',
    valid: durationSec < 300,
    issues: [],
  };

  if (durationSec > 250) {
    const issue: ValidationIssue = {
      metric: 'Audit Duration',
      severity: 'warning',
      message: `Audit took ${durationSec}s — approaching Vercel function timeout (300s)`,
      explanation: 'Long audits risk timing out. Check for slow API calls or retry loops.',
    };
    durationMetric.issues.push(issue);
    issues.push(issue);
  }

  metrics.push(durationMetric);

  return metrics;
}

// ─── Report Builder ─────────────────────────────────────────────────

function buildReport(
  record: AuditRecord,
  metrics: MetricValidation[],
  issues: ValidationIssue[],
): ValidationReport {
  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;
  const infos = issues.filter((i) => i.severity === 'info').length;

  // Sort issues: errors first, then warnings, then info
  const severityOrder: Record<Severity, number> = { error: 0, warning: 1, info: 2 };
  const sortedIssues = [...issues].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    auditId: record.id,
    companyName: record.input.companyName,
    domain: record.input.url,
    timestamp: new Date().toISOString(),
    status: errors > 0 ? 'fail' : warnings > 0 ? 'warn' : 'pass',
    summary: { errors, warnings, infos },
    metrics,
    allIssues: sortedIssues,
  };
}

// ─── Formatted Output ───────────────────────────────────────────────

/**
 * Format a validation report as a human-readable string.
 */
export function formatReport(report: ValidationReport): string {
  const lines: string[] = [];
  const bar = '═'.repeat(70);

  lines.push(bar);
  lines.push(`  AUDIT VALIDATION REPORT`);
  lines.push(`  ${report.companyName} (${report.domain})`);
  lines.push(`  Audit ID: ${report.auditId}`);
  lines.push(`  Validated: ${report.timestamp}`);
  lines.push(bar);

  // Status banner
  const statusIcon = report.status === 'pass' ? 'PASS' : report.status === 'warn' ? 'WARN' : 'FAIL';
  lines.push(`\n  Status: ${statusIcon}  |  ${report.summary.errors} errors, ${report.summary.warnings} warnings, ${report.summary.infos} info\n`);

  // Issues summary
  if (report.allIssues.length > 0) {
    lines.push('─'.repeat(70));
    lines.push('  ISSUES');
    lines.push('─'.repeat(70));

    for (const issue of report.allIssues) {
      const icon = issue.severity === 'error' ? 'ERR' : issue.severity === 'warning' ? 'WRN' : 'INF';
      lines.push(`\n  [${icon}] ${issue.metric}`);
      lines.push(`        ${issue.message}`);
      lines.push(`        Why: ${issue.explanation}`);
      if (issue.suggestion) {
        lines.push(`        Fix: ${issue.suggestion}`);
      }
    }
  }

  // Metric details
  lines.push('\n' + '─'.repeat(70));
  lines.push('  METRIC DETAILS');
  lines.push('─'.repeat(70));

  for (const m of report.metrics) {
    const status = m.valid ? 'OK' : 'XX';
    const valueStr = typeof m.value === 'string' && m.value.length > 60
      ? m.value.slice(0, 57) + '...'
      : String(m.value);
    lines.push(`\n  [${status}] ${m.name}: ${valueStr}`);
    lines.push(`       Desc: ${m.description}`);
    lines.push(`       Calc: ${m.formula}`);
    lines.push(`       Range: ${m.expectedRange}`);
    if (m.issues.length > 0) {
      for (const issue of m.issues) {
        lines.push(`       ^^ ${issue.severity.toUpperCase()}: ${issue.message}`);
      }
    }
  }

  lines.push('\n' + bar);

  return lines.join('\n');
}
