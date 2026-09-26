import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../audit-v11/audit.css';
import '../../../audit-v11/report/report.css';
import { getAuditReportV11Content, getHomeV11Content } from '@/lib/content-utils';
import { MOCK_RESULTS } from '../../../(audit)/audit/demo/mock';
import { AuditReportV11 } from '../../../audit-v11/report/AuditReportV11';

export const metadata: Metadata = { title: 'Audit report v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 audit report on the example results (the same data /audit/demo shows). */
export default async function AuditReportV11Preview() {
  const [c, home] = await Promise.all([getAuditReportV11Content(), getHomeV11Content()]);
  return <AuditReportV11 r={{ results: MOCK_RESULTS, companyName: 'Acme Corp', domain: 'https://acme.com', auditDate: '2026-03-26T12:00:00.000Z' }} c={c} home={home} />;
}
