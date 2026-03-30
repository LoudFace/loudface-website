import { NextResponse } from 'next/server';
import { getAuditRecord } from '@/lib/audit/pipeline';

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

  return NextResponse.json(record, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
