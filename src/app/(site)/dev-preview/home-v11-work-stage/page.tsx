import type { Metadata } from 'next';
import '../../../home-v11/home-v11.css';
import '../../../service-v11/service-v11.css';
import '../../../service-v11/svc.css';
import '../../../work-v11/work.css';
import { fetchCaseStudyIndexData } from '@/lib/cms-data';
import type { CaseStudy } from '@/lib/types';
import { getHomeV11Content, getWorkV11Content } from '@/lib/content-utils';
import { WorkIndexV11 } from '../../../work-v11/WorkIndexV11';
import { getHomeV11Data } from '../../../home-v11/data';

export const metadata: Metadata = { title: 'Case studies index with chart rows on the stage', robots: { index: false, follow: false } };
export const revalidate = 3600;

/** The case studies index with the chart rows on the indigo stage (Arnel, 2026-09-27: "too white"), for its Paper board beside the current index. */
export default async function WorkIndexStagePreview() {
  const [c, home, cms, data] = await Promise.all([getWorkV11Content(), getHomeV11Content(), fetchCaseStudyIndexData(), getHomeV11Data()]);
  return <WorkIndexV11 c={c} home={home} data={data} studies={cms.caseStudies as (CaseStudy & { id: string })[]} clients={cms.clients} rows stage />;
}
