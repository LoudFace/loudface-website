import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../audit-v11/audit.css';
import '../../../webinar-v11/webinar.css';
import { getAiAuditContent, getHomeV11Content, getWebinarAiSearchContent } from '@/lib/content-utils';
import { WebinarV11 } from '../../../webinar-v11/WebinarV11';

export const metadata: Metadata = { title: 'Webinar v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 webinar page before /webinar/ai-search-visibility switches over. */
export default async function WebinarV11Preview() {
  const [c, audit, home] = await Promise.all([getWebinarAiSearchContent(), getAiAuditContent(), getHomeV11Content()]);
  return <WebinarV11 c={c} audit={audit} home={home} />;
}
