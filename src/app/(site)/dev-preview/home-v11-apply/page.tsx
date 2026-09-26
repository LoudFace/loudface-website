import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../careers-v11/careers.css';
import { fetchApplicationOpening } from '@/lib/careers-data';
import { getCareersV11Content, getHomeV11Content } from '@/lib/content-utils';
import { ApplyV11 } from '../../../careers-v11/ApplyV11';

export const metadata: Metadata = { title: 'Apply v11 preview', robots: { index: false, follow: false } };

/** Preview of the v11 /careers/apply page (same opening lookup as the live route). */
export default async function ApplyV11Preview({ searchParams }: { searchParams: Promise<{ opening?: string }> }) {
  const { opening } = await searchParams;
  const [c, home, openingResult] = await Promise.all([getCareersV11Content(), getHomeV11Content(), fetchApplicationOpening(opening)]);
  return <ApplyV11 c={c} home={home} openingResult={openingResult} />;
}
