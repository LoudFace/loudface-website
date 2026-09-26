import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../audit-v11/audit.css';
import { getAiAuditContent, getHomeV11Content } from '@/lib/content-utils';
import { AuditPageV11 } from '../../../audit-v11/AuditPageV11';

export const metadata: Metadata = { title: 'AI audit v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 /ai-audit landing page before the live route switches over. */
export default async function AuditV11Preview() {
  const [c, home] = await Promise.all([getAiAuditContent(), getHomeV11Content()]);
  return <AuditPageV11 c={c} home={home} />;
}
