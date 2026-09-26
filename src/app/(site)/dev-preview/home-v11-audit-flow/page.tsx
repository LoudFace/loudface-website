import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../audit-v11/audit.css';
import '../../../audit-v11/report/report.css';
import { getAiAuditContent, getAuditReportV11Content } from '@/lib/content-utils';
import { AuditProgressV11, AuditStartV11 } from '../../../audit-v11/report/AuditFlowV11';

export const metadata: Metadata = { title: 'Audit tool v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the audit tool's screens: ?screen=start (default), running, failed, slow. */
export default async function AuditFlowV11Preview({ searchParams }: { searchParams: Promise<{ screen?: string }> }) {
  const { screen = 'start' } = await searchParams;
  const [c, a] = await Promise.all([getAuditReportV11Content(), getAiAuditContent()]);
  if (screen === 'start') return <AuditStartV11 c={c} example={a.example} />;
  const state = screen === 'failed' ? 'failed' : screen === 'slow' ? 'slow' : 'running';
  return <AuditProgressV11 c={c} progress={46} phase="Identifying your competitors..." phaseNum="02" tagline={'Asking AI: "What\'s an alternative to [competitor]?"'} state={state} />;
}
