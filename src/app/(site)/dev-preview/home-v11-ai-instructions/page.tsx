import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/cro-sections.css';
import '../../../service-v11/svc.css';
import '../../../ai-instructions-v11/ai.css';
import { getAiInstructionsV11Content, getHomeV11Content } from '@/lib/content-utils';
import { AiInstructionsV11 } from '../../../ai-instructions-v11/AiInstructionsV11';

export const metadata: Metadata = { title: 'AI instructions v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** Preview of the v11 /ai-instructions page before the live route switches over. */
export default async function AiInstructionsV11Preview() {
  const [c, home] = await Promise.all([getAiInstructionsV11Content(), getHomeV11Content()]);
  return <AiInstructionsV11 c={c} home={home} />;
}
