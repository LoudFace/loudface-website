import { createClient, type RedisClientType } from 'redis';
import type { AuditRecord, AuditResults, AuditDiagnostics, SlideDataQuality, ApiCallTrace } from './types';
import { runBrandBaseline } from './phases/brand-baseline';
import { runCompetitorContext } from './phases/competitor-context';
import { runCategoryVisibility } from './phases/category-visibility';
import { mentionsBrand } from './analysis';
import { scrapeGroundTruth } from './ground-truth';
import { extractPhase1Insights } from './extract-phase1';
import { TraceCollector } from './dataforseo';
import {
  calculateScores,
  calculatePlatformBreakdown,
  generateActionItems,
} from './scoring';

const AUDIT_TTL = 60 * 60 * 24 * 30; // 30 days

/**
 * Strip trailing filler words that slip past the LLM's word-count hint
 * ("digital marketing agency that" → "digital marketing agency"). Prevents
 * garbled query templates like "Top digital marketing agency that providers".
 */
function sanitizeCategory(raw: string): string {
  const trailingFillers = /\s+(that|which|for|with|of|and|the|a|an|in|on|to|by)$/i;
  let out = raw.trim().replace(/\s+/g, ' ');
  while (trailingFillers.test(out)) {
    out = out.replace(trailingFillers, '');
  }
  return out;
}

// ─── Redis Client (reuse across invocations in warm lambdas) ─────────

let redisClient: RedisClientType | null = null;

export async function getRedis(): Promise<RedisClientType> {
  if (redisClient?.isOpen) return redisClient;

  redisClient = createClient({ url: process.env.REDIS_URL! });
  redisClient.on('error', (err) => console.error('[Redis]', err));
  await redisClient.connect();
  return redisClient;
}

// ─── KV Helpers ─────────────────────────────────────────────────────

export async function getAuditRecord(id: string): Promise<AuditRecord | null> {
  const redis = await getRedis();
  const raw = await redis.get(`audit:${id}`);
  if (!raw) return null;
  return JSON.parse(raw) as AuditRecord;
}

export async function setAuditRecord(record: AuditRecord): Promise<void> {
  const redis = await getRedis();
  await redis.set(`audit:${record.id}`, JSON.stringify(record), { EX: AUDIT_TTL });
}

async function updateProgress(
  id: string,
  progress: number,
  currentPhase: string,
): Promise<void> {
  const record = await getAuditRecord(id);
  if (!record) return;
  record.progress = progress;
  record.currentPhase = currentPhase;
  await setAuditRecord(record);
}

// ─── Main Pipeline ──────────────────────────────────────────────────

/**
 * Run the full audit pipeline for a given audit ID.
 * Updates KV progress as it goes. Stores final results on completion.
 */
export async function runAudit(id: string): Promise<void> {
  const record = await getAuditRecord(id);
  if (!record) {
    console.error(`[Audit] Record not found: ${id}`);
    return;
  }

  const { companyName, url } = record.input;
  const domain = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');

  // Create a trace collector to track all API calls
  const tracer = new TraceCollector();
  const auditStart = Date.now();

  try {
    // ─── Ground Truth Scrape ──────────────────────────────────────
    // One fetch of the target site, used to anchor every downstream LLM
    // extraction against the brand's own story (disambiguation + claim-checking).
    await updateProgress(id, 1, 'Reading your website...');
    const groundTruth = await scrapeGroundTruth(url);
    if (!groundTruth) {
      console.warn(`[Audit] Ground-truth scrape failed for ${url} — extraction will run with domain only.`);
    } else {
      console.log(`[Audit] Ground truth confidence=${groundTruth.confidence}, title="${groundTruth.title.slice(0, 60)}"`);
    }

    // ─── Phase 1: Brand Baseline ──────────────────────────────────
    await updateProgress(id, 3, 'Analyzing brand recognition across AI platforms...');

    const brandBaseline = await runBrandBaseline(
      companyName,
      domain,
      async (pct) => {
        await updateProgress(
          id,
          pct,
          'Testing how AI platforms perceive your brand...',
        );
      },
      tracer,
    );

    // ─── Phase 1 Structured Extraction ────────────────────────────
    // Replaces ~900 lines of regex analysis with a single schema-constrained
    // LLM call grounded on the ground-truth scrape.
    await updateProgress(id, 38, 'Synthesizing Phase 1 findings...');
    const phase1 = await extractPhase1Insights({
      companyName,
      domain,
      groundTruth,
      brandBaseline,
      tracer,
    });

    // Fall back to conservative defaults if extraction fails entirely.
    const category = sanitizeCategory(
      phase1?.categorization.specific_category
        || phase1?.categorization.broad_category
        || 'business',
    );
    const inferredIndustry = sanitizeCategory(phase1?.categorization.industry || 'business');
    const richEntityType = phase1?.categorization.entity_type || 'other';
    // Downstream phases take a narrow 'product' | 'service' | 'brand' trio (query-template selector).
    // - 'service': agencies/publishers → "Best X agencies/providers"
    // - 'brand': consumer-brand/ecommerce/marketplace → "Best X brands" (no "software/tools/platforms")
    // - 'product': saas/other → "Best X software/tools"
    const entityType: 'product' | 'service' | 'brand' =
      richEntityType === 'agency' || richEntityType === 'publisher'
        ? 'service'
        : richEntityType === 'consumer-brand' || richEntityType === 'ecommerce' || richEntityType === 'marketplace'
          ? 'brand'
          : 'product';
    const categoryConfidence = phase1?.entity_disambiguation.confidence ?? 'low';
    const lowEntityConfidence =
      !phase1
      || phase1.entity_disambiguation.is_correct_entity === false
      || (brandBaseline.brandRecognitionScore < 10 && categoryConfidence === 'low');

    if (lowEntityConfidence) {
      console.log(
        `[Audit] Low entity confidence: ${phase1?.entity_disambiguation.wrong_entity_description || 'extraction unavailable'}`,
      );
    }

    // Overwrite the regex-derived findings with the structured extraction.
    // accurate/inaccurate/gaps become plain strings for UI compatibility —
    // the richer objects live on the extraction result if we want them later.
    if (phase1) {
      brandBaseline.accurateInfo = phase1.brand_knowledge.accurate_claims.map((c) => c.claim);
      brandBaseline.inaccuracies = phase1.brand_knowledge.inaccurate_claims.map(
        (c) => `${c.claim} (${c.why_wrong})`,
      );
      brandBaseline.gaps = phase1.brand_knowledge.knowledge_gaps;
    }

    // Competitors extracted from Phase 1 responses, used by Phase 2 as cross-validation.
    const aiCompetitors = (phase1?.competitors_mentioned ?? []).map((c) => ({
      name: c.name,
      mentionCount: c.mention_count,
    }));

    console.log(
      `[Audit] Phase 1 extraction: category="${category}", entityType="${entityType}", confidence="${categoryConfidence}", correctEntity=${phase1?.entity_disambiguation.is_correct_entity}, competitors=${aiCompetitors.map((c) => `${c.name}(${c.mentionCount})`).join(', ') || '(none)'}`,
    );

    // ─── Phase 2: Competitor Context ──────────────────────────────
    await updateProgress(id, 41, 'Identifying your competitors...');

    const competitorResult = await runCompetitorContext(
      companyName,
      domain,
      category,
      async (pct) => {
        await updateProgress(
          id,
          pct,
          'Measuring competitive recommendation rates...',
        );
      },
      entityType,
      tracer,
      aiCompetitors,
    );

    // Extract competitorSource for diagnostics, pass the rest as CompetitorContextData
    const { competitorSource, ...competitorContext } = competitorResult;

    // ─── Phase 3: Category Visibility ─────────────────────────────
    await updateProgress(id, 71, 'Testing category discovery queries...');

    const categoryVisibility = await runCategoryVisibility(
      companyName,
      domain,
      category,
      inferredIndustry,
      async (pct) => {
        await updateProgress(
          id,
          pct,
          'Checking your visibility in unbranded searches...',
        );
      },
      entityType,
      tracer,
    );

    // ─── Phase 3 SoV Population ───────────────────────────────────
    // For each competitor, count how many Phase 3 (unbranded category) responses
    // mention them. This is the only place brand + competitors are measured on
    // identical prompts, so it's the only fair Share of Voice comparison.
    //
    // Important: we use mentionsBrand() (not substring match) so short names
    // like "Slack" don't match "slackers" and domain roots match as whole tokens.
    const allPhase3Results = categoryVisibility.queries.flatMap((q) => q.results);
    const phase3Total = allPhase3Results.length;

    if (phase3Total > 0) {
      for (const comp of competitorContext.competitors) {
        let mentions = 0;
        for (const r of allPhase3Results) {
          if (!r.rawResponse) continue;
          if (mentionsBrand(r.rawResponse, comp.name, comp.domain)) {
            mentions++;
          }
        }
        competitorContext.shareOfVoiceByCompetitor[comp.name] = Math.round(
          (mentions / phase3Total) * 100,
        );
      }
    }

    // ─── Scoring ──────────────────────────────────────────────────
    await updateProgress(id, 91, 'Calculating your audit scores...');

    const scores = calculateScores(
      brandBaseline,
      competitorContext,
      categoryVisibility,
    );

    // Platform breakdown uses only Phase 1 (brand baseline) — branded queries where
    // we directly ask about the company. Phase 2/3 are unbranded/competitor queries
    // where the brand intentionally may not appear, which would deflate mention rates.
    const brandResults = brandBaseline.queries.flatMap((q) => q.results);
    const platformBreakdown = calculatePlatformBreakdown(brandResults, domain);

    // Generate action items
    const actionItems = generateActionItems(
      scores,
      brandBaseline,
      competitorContext,
      categoryVisibility,
    );

    const results: AuditResults = {
      scores,
      brandBaseline,
      competitorContext,
      categoryVisibility,
      platformBreakdown,
      actionItems,
    };

    // ─── Build Diagnostics ──────────────────────────────────────
    const traceSummary = tracer.getSummary();
    const slideData = buildSlideDataQuality(results, competitorSource, category, richEntityType);
    const wrongEntityDescription = phase1?.entity_disambiguation.is_correct_entity === false
      ? phase1.entity_disambiguation.wrong_entity_description
      : undefined;
    const partialDataReason = detectPartialData(tracer.getTraces());

    const diagnostics: AuditDiagnostics = {
      ...traceSummary,
      totalDurationMs: Date.now() - auditStart,
      traces: tracer.getTraces(),
      competitorSource,
      inferredCategory: category,
      inferredEntityType: richEntityType,
      categoryConfidence,
      lowEntityConfidence,
      wrongEntityDescription,
      partialDataReason,
      slideData,
    };

    if (partialDataReason) {
      console.warn(`[Audit] Partial data detected: ${partialDataReason}`);
    }

    // Log diagnostics summary
    console.log(`[Audit] Diagnostics: ${diagnostics.successfulCalls}/${diagnostics.totalApiCalls} calls succeeded, ${diagnostics.failedCalls} failed, ${diagnostics.emptyCalls} empty. Cost: $${diagnostics.totalCostUsd}. Duration: ${Math.round(diagnostics.totalDurationMs / 1000)}s`);

    // ─── Store Complete Results ────────────────────────────────────
    const completeRecord: AuditRecord = {
      ...record,
      status: 'complete',
      progress: 100,
      currentPhase: 'Audit complete',
      completedAt: new Date().toISOString(),
      results,
      diagnostics,
    };

    await setAuditRecord(completeRecord);
    console.log(`[Audit] Complete: ${id}`);
  } catch (err) {
    console.error(`[Audit] Failed: ${id}`, err);

    // Still save diagnostics on failure
    const traceSummary = tracer.getSummary();
    const diagnostics: AuditDiagnostics = {
      ...traceSummary,
      totalDurationMs: Date.now() - auditStart,
      traces: tracer.getTraces(),
      competitorSource: 'hardcoded',
      inferredCategory: '',
      inferredEntityType: '',
      slideData: {},
    };

    const failedRecord: AuditRecord = {
      ...record,
      status: 'failed',
      currentPhase: 'Audit failed',
      error: err instanceof Error ? err.message : 'Unknown error',
      diagnostics,
    };

    await setAuditRecord(failedRecord);
  }
}

// ─── Partial-Data Detection ────────────────────────────────────────

/**
 * If any single phase had ≥30% of its calls fail or return empty, the
 * numbers derived from that phase are unreliable — the user should see a
 * banner explaining the gap so they don't treat a noisy grade as authoritative.
 *
 * Observed flake: Patagonia audit hit 40/41 Phase 1 HTTP 500s from DataForSEO
 * but the pipeline still produced a Grade A from Phase 2/3 data, giving a
 * misleading recognition=0% with a strong overall score.
 */
function detectPartialData(traces: ApiCallTrace[]): string | undefined {
  const phaseLabels: Record<ApiCallTrace['phase'], string> = {
    'brand-baseline': 'branded-query recognition',
    'competitor-context': 'competitor recommendation rate',
    'category-visibility': 'category visibility',
    'competitor-discovery': 'competitor discovery',
  };

  const byPhase = new Map<ApiCallTrace['phase'], { total: number; bad: number }>();
  for (const t of traces) {
    const phase = t.phase;
    if (!phase) continue;
    const entry = byPhase.get(phase) ?? { total: 0, bad: 0 };
    entry.total++;
    if (t.status === 'error' || t.status === 'empty') entry.bad++;
    byPhase.set(phase, entry);
  }

  const affected: string[] = [];
  for (const [phase, stats] of byPhase) {
    if (stats.total < 4) continue; // too small a sample for the ratio to be meaningful
    const badRatio = stats.bad / stats.total;
    if (badRatio >= 0.3) {
      const label = phaseLabels[phase] ?? phase;
      affected.push(`${label} (${stats.bad}/${stats.total} calls)`);
    }
  }

  if (affected.length === 0) return undefined;

  return `Some parts of this audit ran on partial data — ${affected.join(' and ')} could not be measured reliably. Results below reflect what we could capture; rerun for a fuller read.`;
}

// ─── Slide Data Quality ─────────────────────────────────────────────

/**
 * Build per-slide data quality diagnostics.
 * Maps each slide to its data sources, whether it has data, and key metrics.
 */
function buildSlideDataQuality(
  results: AuditResults,
  competitorSource: string,
  category: string,
  entityType: string,
): Record<string, SlideDataQuality> {
  const { scores, brandBaseline, competitorContext, categoryVisibility, platformBreakdown, actionItems } = results;

  const allBrandResults = brandBaseline.queries.flatMap((q) => q.results);
  const allCompResults = competitorContext.queries.flatMap((q) => q.results);
  const allCatResults = categoryVisibility.queries.flatMap((q) => q.results);

  const brandMentioned = allBrandResults.filter((r) => r.mentioned).length;
  const brandTotal = allBrandResults.length;
  const compMentioned = allCompResults.filter((r) => r.mentioned).length;
  const compTotal = allCompResults.length;
  const catMentioned = allCatResults.filter((r) => r.mentioned).length;
  const catTotal = allCatResults.length;

  return {
    'Slide 1 – Scorecard': {
      hasData: true,
      status: `Grade ${scores.overallGrade}. All scores derived from API data.`,
      source: 'Calculated from all 3 phases',
      metrics: {
        discoveryVisibility: scores.discoveryVisibility,
        shareOfVoice: scores.shareOfVoice,
        platformCoverage: scores.platformCoverage,
        competitiveStanding: scores.competitiveStanding,
        overallGrade: scores.overallGrade,
      },
    },
    'Slide 3 – Brand Baseline': {
      hasData: brandTotal > 0,
      status: `${brandMentioned}/${brandTotal} responses mention the brand (${brandBaseline.brandRecognitionScore}%). ${brandBaseline.queries.length} queries × 4 platforms.`,
      source: 'Phase 1: 10 branded queries via DataForSEO LLM Responses Live',
      metrics: {
        queries: brandBaseline.queries.length,
        totalResponses: brandTotal,
        mentions: brandMentioned,
        recognitionScore: brandBaseline.brandRecognitionScore,
      },
    },
    'Slide 4 – What AI Gets Right': {
      hasData: brandBaseline.accurateInfo.length > 0,
      status: brandBaseline.accurateInfo.length > 0
        ? `${brandBaseline.accurateInfo.length} relevant facts extracted. Filtered for entity relevance (excluded non-matching entities with same name).`
        : 'No accurate facts could be extracted. AI responses may not contain factual claims about the brand, or all mentions refer to different entities.',
      source: 'Phase 1 raw responses → relevance-scored sentence extraction',
      metrics: {
        factsExtracted: brandBaseline.accurateInfo.length,
        responsesWithMentions: allBrandResults.filter((r) => r.mentioned && r.rawResponse).length,
      },
    },
    'Slide 5 – Gaps & Inaccuracies': {
      hasData: brandBaseline.gaps.length > 0 || brandBaseline.inaccuracies.length > 0,
      status: `${brandBaseline.gaps.length} gaps, ${brandBaseline.inaccuracies.length} inaccuracies identified.`,
      source: 'Phase 1: platform mention/citation analysis',
      metrics: {
        gaps: brandBaseline.gaps.length,
        inaccuracies: brandBaseline.inaccuracies.length,
      },
    },
    'Slide 6 – Competitor Context': {
      hasData: competitorContext.competitors.length > 0,
      status: `${competitorContext.competitors.length} competitors tracked (source: ${competitorSource}). ${compMentioned}/${compTotal} competitor query responses mention the brand.`,
      source: competitorSource === 'dataforseo-labs'
        ? 'DataForSEO Labs Competitors Domain API → LLM Responses'
        : `Hardcoded competitor list → Phase 2: ${competitorContext.queries.length} queries via LLM Responses`,
      metrics: {
        competitors: competitorContext.competitors.length,
        competitorSource,
        recommendationRate: competitorContext.competitiveRecommendationRate,
        queriesRun: competitorContext.queries.length,
        brandMentionsInCompQueries: compMentioned,
      },
    },
    'Slide 7 – Competitive Gap (Share of Voice)': {
      hasData: Object.keys(competitorContext.shareOfVoiceByCompetitor).length > 0,
      status: `Share of voice calculated for ${Object.keys(competitorContext.shareOfVoiceByCompetitor).length} competitors. Brand SoV: ${scores.shareOfVoice}%.`,
      source: 'Phase 2: competitor query responses analyzed for brand vs competitor mentions',
      metrics: {
        brandShareOfVoice: scores.shareOfVoice,
        ...competitorContext.shareOfVoiceByCompetitor,
      },
    },
    'Slide 8 – Category Visibility': {
      hasData: catTotal > 0,
      status: `${catMentioned}/${catTotal} unbranded category responses mention the brand. Category: "${category}" (${entityType}). Discovery rate: ${categoryVisibility.categoryDiscoveryRate}%.`,
      source: `Phase 3: ${categoryVisibility.queries.length} unbranded queries via LLM Responses`,
      metrics: {
        inferredCategory: category,
        entityType,
        discoveryRate: categoryVisibility.categoryDiscoveryRate,
        queriesRun: categoryVisibility.queries.length,
        mentions: catMentioned,
        totalResponses: catTotal,
      },
    },
    'Slide 10 – Platform Breakdown': {
      hasData: true,
      status: 'Calculated from Phase 1 (branded queries only). Mention rate = % of branded queries where the platform mentions the brand.',
      source: 'Phase 1 results grouped by platform',
      metrics: {
        chatgpt_mentionRate: platformBreakdown.chatgpt.mentionRate,
        claude_mentionRate: platformBreakdown.claude.mentionRate,
        gemini_mentionRate: platformBreakdown.gemini.mentionRate,
        perplexity_mentionRate: platformBreakdown.perplexity.mentionRate,
      },
    },
    'Slide 13 – Action Plan': {
      hasData: actionItems.length > 0,
      status: `${actionItems.length} action items generated based on score thresholds.`,
      source: 'Rule-based generation from scores and gap analysis',
      metrics: {
        totalItems: actionItems.length,
        highPriority: actionItems.filter((i) => i.priority === 'high').length,
        mediumPriority: actionItems.filter((i) => i.priority === 'medium').length,
      },
    },
  };
}
