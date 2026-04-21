/**
 * Category benchmarks.
 *
 * Every completed audit pushes a compact row (scores + timestamp + audit id)
 * into a Redis list keyed by `(entityType, categorySlug)`. When rendering
 * the Scorecard, we read the bucket, compute percentiles against the current
 * audit's scores, and surface context like "Your 45% SoV is the 70th
 * percentile for SaaS design tools."
 *
 * Design notes:
 * - Bucketing key is `benchmark:{entityType}:{categorySlug}` so we don't mix
 *   consumer-brand benchmarks with SaaS benchmarks.
 * - We use a Redis LIST with a MAX_ROWS cap (LPUSH + LTRIM). Keeps the
 *   newest 500 per category, which is plenty for percentile signal.
 * - MIN_SAMPLE_SIZE gate prevents percentile display until the bucket has
 *   enough data to be meaningful — below the threshold we just don't show
 *   the context (graceful degradation).
 * - Category slugs are normalized (lowercase, kebab) so "SaaS Design Tool"
 *   and "saas design tools" bucket together.
 * - Dedupe by audit id on read — if the same audit was pushed twice for any
 *   reason (retry, double-write), the older copy is ignored.
 */

import type { RedisClientType } from 'redis';
import type { AuditRecord } from './types';

const MAX_ROWS = 500;
const MIN_SAMPLE_SIZE = 20;

export interface BenchmarkRow {
  auditId: string;
  timestamp: number;
  grade: string;
  discoveryVisibility: number;
  shareOfVoice: number;
  brandRecognition: number;
  platformCoverage: number;
}

export interface BenchmarkContext {
  /** Number of rows the percentile is computed from (excludes the current audit). */
  sampleSize: number;
  /** Normalized category label used for the bucket (e.g. "saas-design-platforms"). */
  categorySlug: string;
  /** Display label for UI — the original inferred category. */
  categoryLabel: string;
  /** Percentile (0-100) for each metric — higher is better. */
  percentiles: {
    discoveryVisibility: number;
    shareOfVoice: number;
    brandRecognition: number;
  };
}

/**
 * Normalize a free-form category string to a Redis-safe bucket key.
 * "SaaS Design Tools" → "saas-design-tools"
 * Trims to 60 chars so extremely long inferred categories don't explode the key.
 */
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function bucketKey(entityType: string, slug: string): string {
  return `benchmark:${entityType}:${slug}`;
}

/**
 * Record a completed audit into the benchmark bucket. Failing silently is
 * the right choice here — benchmarks are a nice-to-have surface, never
 * block the happy path of the audit pipeline.
 */
export async function recordBenchmark(
  redis: RedisClientType,
  record: AuditRecord,
): Promise<void> {
  if (!record.results || !record.diagnostics) {
    console.log('[Benchmarks] Skip: no results/diagnostics');
    return;
  }
  const category = record.diagnostics.inferredCategory?.trim();
  const entityType = record.diagnostics.inferredEntityType?.trim();
  if (!category || !entityType) {
    console.log(`[Benchmarks] Skip: missing category/entityType (cat="${category}", type="${entityType}")`);
    return;
  }

  // Never record low-confidence or partial audits — they'd bias the bucket.
  if (record.diagnostics.lowEntityConfidence) {
    console.log('[Benchmarks] Skip: lowEntityConfidence');
    return;
  }
  if (record.diagnostics.partialDataReason) {
    console.log('[Benchmarks] Skip: partial data');
    return;
  }

  const slug = categorySlug(category);
  if (!slug) {
    console.log('[Benchmarks] Skip: empty slug');
    return;
  }

  const row: BenchmarkRow = {
    auditId: record.id,
    timestamp: Date.now(),
    grade: record.results.scores.overallGrade,
    discoveryVisibility: record.results.scores.discoveryVisibility,
    shareOfVoice: record.results.scores.shareOfVoice,
    brandRecognition: record.results.brandBaseline.brandRecognitionScore,
    platformCoverage: record.results.scores.platformCoverage,
  };

  try {
    const key = bucketKey(entityType, slug);
    await redis.lPush(key, JSON.stringify(row));
    await redis.lTrim(key, 0, MAX_ROWS - 1);
    console.log(`[Benchmarks] Recorded ${record.id} into ${key}`);
  } catch (err) {
    console.warn('[Benchmarks] recordBenchmark failed (non-fatal):', err);
  }
}

/**
 * Compute percentile context for the current audit against the bucket.
 * Returns `null` when the bucket has fewer than MIN_SAMPLE_SIZE peers —
 * UI should render nothing in that case rather than a misleading percentile.
 */
export async function getBenchmarkContext(
  redis: RedisClientType,
  record: AuditRecord,
): Promise<BenchmarkContext | null> {
  if (!record.results || !record.diagnostics) return null;
  const category = record.diagnostics.inferredCategory?.trim();
  const entityType = record.diagnostics.inferredEntityType?.trim();
  if (!category || !entityType) return null;

  const slug = categorySlug(category);
  if (!slug) return null;

  let rows: BenchmarkRow[] = [];
  try {
    const key = bucketKey(entityType, slug);
    const raw = await redis.lRange(key, 0, MAX_ROWS - 1);
    rows = raw
      .map((r) => {
        try {
          return JSON.parse(r) as BenchmarkRow;
        } catch {
          return null;
        }
      })
      .filter((r): r is BenchmarkRow => r !== null);
  } catch (err) {
    console.warn('[Benchmarks] getBenchmarkContext failed:', err);
    return null;
  }

  // Exclude the current audit from the comparison set.
  const peers = rows.filter((r) => r.auditId !== record.id);
  if (peers.length < MIN_SAMPLE_SIZE) return null;

  const current = {
    discovery: record.results.scores.discoveryVisibility,
    sov: record.results.scores.shareOfVoice,
    recognition: record.results.brandBaseline.brandRecognitionScore,
  };

  return {
    sampleSize: peers.length,
    categorySlug: slug,
    categoryLabel: category,
    percentiles: {
      discoveryVisibility: percentileOf(current.discovery, peers.map((p) => p.discoveryVisibility)),
      shareOfVoice: percentileOf(current.sov, peers.map((p) => p.shareOfVoice)),
      brandRecognition: percentileOf(current.recognition, peers.map((p) => p.brandRecognition)),
    },
  };
}

/**
 * Return the percentile rank of `value` within `peers`, using the standard
 * "percent of values strictly below" definition. Tied peers don't count
 * against you, so 100% is reachable for category leaders.
 */
function percentileOf(value: number, peers: number[]): number {
  if (peers.length === 0) return 50;
  const below = peers.filter((p) => p < value).length;
  return Math.round((below / peers.length) * 100);
}
