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

  return NextResponse.json(
    {
      status: record.status,
      progress: record.progress,
      currentPhase: record.currentPhase,
    },
    {
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
