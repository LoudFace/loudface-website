import type { ReactNode } from 'react';
import type { HomeV11Content } from '@/lib/content-utils';
import { BarsCell } from '../service-v11/kit';
import { BrandfirmQuote, GenieQuote, TokuQuote, VideoProof } from '../service-v11/pages/shared';

/**
 * The industry pages' proof grid (the service template's cells), picked so no client figure already on the page
 * appears again. `avoid` holds the case-study slugs shown above it (hero cards, tiles, results). Two wide cells and
 * two narrow ones, alternating, as the approved CRO board.
 */
type Voices = HomeV11Content['testimonials'];

export function IndustryVoices({ t, avoid }: { t: Voices; avoid: string[] }): ReactNode {
  const has = (s: string) => avoid.includes(s);
  const wides: [boolean, ReactNode][] = [
    [!has('toku-ai-cited-pipeline'), <TokuQuote key="toku" t={t} wide />],
    [true, <VideoProof key="outbound" t={t} n={0} big="$1M+" cap="in sales from one landing page we designed" />],
    [true, <VideoProof key="reiterate" t={t} n={2} />],
  ];
  const narrows: [boolean, ReactNode][] = [
    [!has('dimer-health'), <BarsCell key="dimer" tag="Conversion rate" client="Dimer Health" big="288%" cap="Best conversion increase from a LoudFace program" before="Before" after="After six months" />],
    [!has('brandfirm'), <BrandfirmQuote key="brandfirm" t={t} />],
    [true, <GenieQuote key="genie" t={t} plain={has('genie-teacher-organic-growth')} />],
  ];
  const w = wides.filter(([ok]) => ok).map(([, n]) => n);
  const n = narrows.filter(([ok]) => ok).map(([, x]) => x);
  return <div className="cro-grid">{w[0]}{n[0]}{w[1]}{n[1]}</div>;
}
