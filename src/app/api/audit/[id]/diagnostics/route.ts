import { NextResponse } from 'next/server';
import { getAuditRecord } from '@/lib/audit/pipeline';

/**
 * GET /api/audit/{id}/diagnostics
 * Returns full API call tracing data for debugging.
 * Shows every DataForSEO call: success/failure, tokens, cost, timing.
 *
 * Only available in development — disabled in production to avoid leaking
 * API cost data, prompts, and internal architecture details.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Diagnostics are only available in development' },
      { status: 403 },
    );
  }

  const { id } = await params;

  const record = await getAuditRecord(id);

  if (!record) {
    return NextResponse.json(
      { error: 'Audit not found' },
      { status: 404 },
    );
  }

  if (!record.diagnostics) {
    return NextResponse.json(
      {
        error: 'No diagnostics available (audit may have been run before tracing was added)',
        status: record.status,
        progress: record.progress,
      },
      { status: 200 },
    );
  }

  const d = record.diagnostics;

  // Build a human-readable summary
  const summary = {
    auditId: id,
    auditStatus: record.status,
    overview: {
      totalApiCalls: d.totalApiCalls,
      successfulCalls: d.successfulCalls,
      failedCalls: d.failedCalls,
      emptyCalls: d.emptyCalls,
      totalCostUsd: d.totalCostUsd,
      totalDurationSec: Math.round(d.totalDurationMs / 1000),
    },
    inference: {
      category: d.inferredCategory,
      entityType: d.inferredEntityType,
      competitorSource: d.competitorSource,
    },
    // Group traces by phase
    byPhase: groupByPhase(d.traces),
    // Group traces by platform
    byPlatform: groupByPlatform(d.traces),
    // Show all errors
    errors: d.traces.filter((t) => t.status === 'error').map((t) => ({
      platform: t.platform,
      phase: t.phase,
      prompt: t.prompt,
      error: t.errorMessage,
    })),
    // Per-slide data quality
    slideData: d.slideData ?? {},
    // Raw traces for detailed inspection
    traces: d.traces,
  };

  return NextResponse.json(summary, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

function groupByPhase(traces: Array<{ phase: string; status: string; platform: string; costUsd?: number; durationMs?: number }>) {
  const phases: Record<string, { total: number; success: number; failed: number; empty: number; cost: number; avgDuration: number }> = {};

  for (const t of traces) {
    if (!phases[t.phase]) {
      phases[t.phase] = { total: 0, success: 0, failed: 0, empty: 0, cost: 0, avgDuration: 0 };
    }
    const p = phases[t.phase];
    p.total++;
    if (t.status === 'success') p.success++;
    if (t.status === 'error') p.failed++;
    if (t.status === 'empty') p.empty++;
    p.cost += t.costUsd ?? 0;
    p.avgDuration += t.durationMs ?? 0;
  }

  // Convert avgDuration to actual average
  for (const p of Object.values(phases)) {
    p.avgDuration = p.total > 0 ? Math.round(p.avgDuration / p.total) : 0;
    p.cost = Math.round(p.cost * 10000) / 10000;
  }

  return phases;
}

function groupByPlatform(traces: Array<{ platform: string; status: string; costUsd?: number; durationMs?: number }>) {
  const platforms: Record<string, { total: number; success: number; failed: number; empty: number; cost: number; avgDuration: number }> = {};

  for (const t of traces) {
    if (!platforms[t.platform]) {
      platforms[t.platform] = { total: 0, success: 0, failed: 0, empty: 0, cost: 0, avgDuration: 0 };
    }
    const p = platforms[t.platform];
    p.total++;
    if (t.status === 'success') p.success++;
    if (t.status === 'error') p.failed++;
    if (t.status === 'empty') p.empty++;
    p.cost += t.costUsd ?? 0;
    p.avgDuration += t.durationMs ?? 0;
  }

  for (const p of Object.values(platforms)) {
    p.avgDuration = p.total > 0 ? Math.round(p.avgDuration / p.total) : 0;
    p.cost = Math.round(p.cost * 10000) / 10000;
  }

  return platforms;
}
