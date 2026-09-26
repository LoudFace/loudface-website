import type { Metadata } from 'next';
import { getAuditReportV11Content, getHomeV11Content } from '@/lib/content-utils';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../audit-v11/audit.css';
import '../../../audit-v11/report/report.css';
import { MOCK_RESULTS } from './mock';
import { AuditReportV11 } from '../../../audit-v11/report/AuditReportV11';

export const metadata: Metadata = {
  title: 'Audit Demo',
};

/** The example report (Acme Corp) in the v11 report template; the numbers follow the pipeline's own scoring (mock.ts). */
export default async function AuditDemoPage() {
  const [c, home] = await Promise.all([getAuditReportV11Content(), getHomeV11Content()]);
  return (
    <AuditReportV11
      r={{ results: MOCK_RESULTS, companyName: 'Acme Corp', domain: 'https://acme.com', auditDate: '2026-03-26T12:00:00.000Z' }}
      c={c}
      home={home}
    />
  );
}
