import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../about-v11/about.css';
import { getAboutV11Content, getHomeV11Content } from '@/lib/content-utils';
import { getHomeV11Data } from '../../../home-v11/data';
import { AboutV11 } from '../../../about-v11/AboutV11';

export const metadata: Metadata = { title: 'About v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 About page before /about switches over. */
export default async function AboutV11Preview() {
  const [c, home, data] = await Promise.all([getAboutV11Content(), getHomeV11Content(), getHomeV11Data()]);
  return <AboutV11 c={c} home={home} data={data} />;
}
