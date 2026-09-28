import { notFound } from 'next/navigation';
import '../_concepts/concepts.css';
import { loadFixture } from '../_concepts/loadFixture';
import { ConceptA } from '../_concepts/ConceptA';
import { ConceptB } from '../_concepts/ConceptB';
import { ConceptC } from '../_concepts/ConceptC';
import { HEROES } from '../_concepts/Heroes';
import { VISUALS, VisualHero } from '../_concepts/Visuals';
import { VISUALS2 } from '../_concepts/Visuals2';
import { TwoColHero, VISUALS3 } from '../_concepts/Visuals3';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  const proposal = await loadFixture();
  if (variant === 'a') return <ConceptA proposal={proposal} />;
  if (variant === 'b') return <ConceptB proposal={proposal} />;
  if (variant === 'c') return <ConceptC proposal={proposal} />;
  const hero = variant.match(/^c-(h\d)$/)?.[1];
  if (hero && HEROES[hero]) {
    const Hero = HEROES[hero];
    return <ConceptC proposal={proposal} hero={<Hero proposal={proposal} />} />;
  }
  const vis = variant.match(/^c-(v\d)$/)?.[1];
  if (vis && (VISUALS[vis] || VISUALS2[vis])) {
    const V = VISUALS[vis] ?? VISUALS2[vis];
    return <ConceptC proposal={proposal} hero={<VisualHero proposal={proposal}><V /></VisualHero>} />;
  }
  const col = variant.match(/^c2-(v\d)$/)?.[1];
  if (col && VISUALS3[col]) {
    const V = VISUALS3[col];
    return <ConceptC proposal={proposal} hero={<TwoColHero proposal={proposal}><V /></TwoColHero>} />;
  }
  notFound();
}
