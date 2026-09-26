import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../service-v11/cro-sections.css';
import '../../../audit-v11/audit.css';
import '../../../methodology-v11/methodology.css';
import { getAiAuditContent, getHomeV11Content, getMethodologyV11Content } from '@/lib/content-utils';
import { MethodologyV11 } from '../../../methodology-v11/MethodologyV11';

export const metadata: Metadata = { title: 'Methodology v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 methodology page before /methodology switches over. */
export default async function MethodologyV11Preview() {
  const [c, home, audit] = await Promise.all([getMethodologyV11Content(), getHomeV11Content(), getAiAuditContent()]);
  return <MethodologyV11 c={c} home={home} audit={audit} />;
}
