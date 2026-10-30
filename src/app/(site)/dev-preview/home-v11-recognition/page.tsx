import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../recognition-v11/recognition.css';
import { getHomeV11Content, getRecognitionV11Content } from '@/lib/content-utils';
import { RecognitionV11 } from '../../../recognition-v11/RecognitionV11';
import { getRecognitionData } from '../../../recognition-v11/data';

export const metadata: Metadata = { title: 'Recognition v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the /recognition honours design (2026-10-30). Not linked; the live route does not exist yet. */
export default async function RecognitionV11Preview() {
  const [c, home, d] = await Promise.all([getRecognitionV11Content(), getHomeV11Content(), getRecognitionData()]);
  return <RecognitionV11 c={c} home={home} d={d} />;
}
