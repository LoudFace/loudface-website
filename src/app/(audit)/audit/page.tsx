import type { Metadata } from 'next';
import { getAiAuditContent, getAuditReportV11Content } from '@/lib/content-utils';
import '../../home-v11/home-v11.css';
import '../../service-v11/service-v11.css';
import '../../service-v11/svc.css';
import '../../audit-v11/audit.css';
import '../../audit-v11/report/report.css';
import { AuditStartV11 } from '../../audit-v11/report/AuditFlowV11';

/**
 * The audit tool's start page — v11 (switched 2026-09-26): the live AuditForm (submission unchanged) beside the four
 * steps the audit is about to run. Copy in audit-report-v11.json `start`.
 */
export const metadata: Metadata = {
  title: 'Free AI Visibility Audit',
};

export default async function AuditPage() {
  const [c, a] = await Promise.all([getAuditReportV11Content(), getAiAuditContent()]);
  return <AuditStartV11 c={c} example={a.example} />;
}
