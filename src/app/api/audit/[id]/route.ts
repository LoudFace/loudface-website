import { NextResponse } from 'next/server';
import { getAuditRecord } from '@/lib/audit/pipeline';

/**
 * Public shape returned to the results page / any external caller of this
 * endpoint. Deliberately excludes:
 *   - `input.email` (PII — never leave the server for a publicly-guessable
 *     audit id)
 *   - `diagnostics.*` cost/tracing fields (totalCostUsd, traces, apiCallTrace,
 *     competitorSource, inferredCategory/EntityType) — internal economics and
 *     architecture details, not needed by any renderer
 *   - the raw `error` string — may contain internal error/stack detail
 *
 * The three diagnostics fields the results deck actually consumes
 * (`lowEntityConfidence`, `wrongEntityDescription`, `partialDataReason` — see
 * `src/app/(audit)/audit/[id]/page.tsx`) are carried over explicitly instead
 * of forwarding the whole `diagnostics` object.
 *
 * Note: the results PAGE itself reads Redis directly via `getAuditRecord`
 * server-side — it does not call this route — so this stripping only
 * affects this API endpoint's own callers.
 */
interface PublicAuditRecord {
  id: string;
  status: string;
  progress: number;
  currentPhase: string;
  createdAt: string;
  completedAt?: string;
  companyName: string;
  url: string;
  results?: unknown;
  entityConfidence?: {
    low: boolean;
    wrongEntityDescription?: string;
  };
  partialDataReason?: string;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const record = await getAuditRecord(id);

  if (!record) {
    return NextResponse.json(
      { error: 'Audit not found' },
      { status: 404 },
    );
  }

  // Don't return raw responses to keep payload small
  if (record.results) {
    for (const q of record.results.brandBaseline.queries) {
      for (const r of q.results) {
        delete r.rawResponse;
      }
    }
    for (const q of record.results.competitorContext.queries) {
      for (const r of q.results) {
        delete r.rawResponse;
      }
    }
    for (const q of record.results.categoryVisibility.queries) {
      for (const r of q.results) {
        delete r.rawResponse;
      }
    }
  }

  const publicRecord: PublicAuditRecord = {
    id: record.id,
    status: record.status,
    progress: record.progress,
    currentPhase: record.currentPhase,
    createdAt: record.createdAt,
    completedAt: record.completedAt,
    companyName: record.input.companyName,
    url: record.input.url,
    results: record.results,
    entityConfidence: record.diagnostics
      ? {
          low: record.diagnostics.lowEntityConfidence === true,
          wrongEntityDescription: record.diagnostics.wrongEntityDescription,
        }
      : undefined,
    partialDataReason: record.diagnostics?.partialDataReason,
  };

  return NextResponse.json(publicRecord, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
