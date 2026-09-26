import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '../../../../../home-v11/home-v11.css';
import '../../../../../service-v11/service-v11.css';
import '../../../../../service-v11/cro-sections.css';
import '../../../../../service-v11/svc.css';
import '../../../../../case-v11/case.css';
import { getHomeV11Content } from '@/lib/content-utils';
import { getCaseView } from '../../../../../case-v11/view';
import { CaseStudyV11, type CaseHero } from '../../../../../case-v11/CaseStudyV11';

export const metadata: Metadata = { title: 'Case study v11 preview', robots: { index: false, follow: false } };
export const revalidate = 3600;

const HEROES: CaseHero[] = ['report', 'result', 'site'];

/** The case study preview with a named hero: /…/<slug>/report (the default), /…/<slug>/result or /…/<slug>/site. */
export default async function CaseV11HeroPreview({ params }: { params: Promise<{ slug: string; hero: string }> }) {
  const { slug, hero } = await params;
  if (!HEROES.includes(hero as CaseHero)) notFound();
  const [v, home] = await Promise.all([getCaseView(slug), getHomeV11Content()]);
  if (!v) notFound();
  return <CaseStudyV11 v={v} home={home} hero={hero as CaseHero} />;
}
