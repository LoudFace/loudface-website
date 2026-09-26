import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../careers-v11/careers.css';
import { getCareersV11Content, getHomeV11Content } from '@/lib/content-utils';
import { fetchOpenRoles } from '@/lib/careers-data';
import { CareersV11 } from '../../../careers-v11/CareersV11';

export const metadata: Metadata = { title: 'Careers v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 careers page before /careers switches over. */
export default async function CareersV11Preview() {
  const [home, fetched] = await Promise.all([getHomeV11Content(), fetchOpenRoles()]);
  // Local dev has no Notion token, so the list is 'unavailable' here; the board shows production's current state
  // (no open roles) instead. The live route passes the real result.
  const result = fetched.status === 'unavailable' ? { status: 'ok' as const, roles: [] } : fetched;
  const c = await getCareersV11Content();
  return <CareersV11 result={result} home={home} c={c} />;
}
