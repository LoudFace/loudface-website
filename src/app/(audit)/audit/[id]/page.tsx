import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAuditRecord, getRedis } from '@/lib/audit/pipeline';
import { getBenchmarkContext } from '@/lib/audit/benchmarks';
import { AuditProgress } from '../_components/AuditProgress';
import { AuditDeck } from '../_components/AuditDeck';

export const metadata: Metadata = {
  title: 'Your AI Visibility Audit',
};

export default async function AuditResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getAuditRecord(id);

  if (!record) {
    notFound();
  }

  // Still processing — show progress UI
  if (record.status === 'processing') {
    return (
      <AuditProgress
        id={id}
        initialProgress={record.progress}
        initialPhase={record.currentPhase}
      />
    );
  }

  // Failed
  if (record.status === 'failed') {
    return (
      <AuditProgress
        id={id}
        initialProgress={record.progress}
        initialPhase={record.currentPhase}
      />
    );
  }

  // Complete — render the audit deck
  if (!record.results) {
    notFound();
  }

  const entityConfidence = {
    low: record.diagnostics?.lowEntityConfidence === true,
    wrongEntityDescription: record.diagnostics?.wrongEntityDescription,
    brandRecognitionScore: record.results.brandBaseline.brandRecognitionScore,
  };

  const partialDataReason = record.diagnostics?.partialDataReason;

  // Pull benchmark context if the category has enough peer audits. Returns null
  // silently below the minimum sample size — ScorecardSlide just hides the
  // context block in that case.
  let benchmarkContext = null;
  try {
    const redis = await getRedis();
    benchmarkContext = await getBenchmarkContext(redis, record);
  } catch (err) {
    console.warn('[Audit page] Failed to load benchmark context:', err);
  }

  return (
    <AuditDeck
      results={record.results}
      companyName={record.input.companyName}
      domain={record.input.url}
      auditDate={record.completedAt || record.createdAt}
      entityConfidence={entityConfidence}
      partialDataReason={partialDataReason}
      benchmarkContext={benchmarkContext}
    />
  );
}
