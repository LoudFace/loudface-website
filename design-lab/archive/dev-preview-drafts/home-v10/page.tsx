import type { Metadata } from 'next';
import '../../../home-v3/home-v3.css';
import '../../../home-v3/results-wall.css';
import '../../../home-v3/isometric-system.css';
import { HeroV3, type HeroCopy } from '../../../home-v3/HeroV3';
import { LogosTicker } from '../../../home-v3/LogosTicker';
import { ResultsWall } from '../../../home-v3/ResultsWall';
import { SelectedWork } from '../../../home-v3/SelectedWork';
import { IsometricSystem } from '../../../home-v3/IsometricSystem';
import { ProblemSection } from '../../../home-v3/ProblemSection';
import { ProcessSteps } from '../../../home-v3/ProcessSteps';
import { FaqSection } from '../../../home-v3/FaqSection';
import { CoverCTA } from '../../../home-v3/CoverCTA';
import { FooterV3 } from '../../../home-v3/FooterV3';
import { HomepageV3Scripts } from '../../../homepage-v3/Scripts';
import { getHomeV3Images } from '../../../home-v3/data';
import { PLATES } from '../../../home-v3/_plates';

export const metadata: Metadata = {
  title: 'Homepage v10 — isometric system',
  robots: { index: false, follow: false },
};

/**
 * Homepage v10 — THE SYSTEM, DRAWN.
 *
 * Same opening as v8 and v9 — results first — and the same question answered a
 * third way. v8 says what we do in type on a colour field, v9 shows it as three
 * objects, v10 draws it as one diagram you can read in a single look.
 *
 * Asset plan (section : asset : reference tile):
 *   hero          · client product UI at true scale        · Clay
 *   logo band     · real client wordmarks                  · Readymag
 *   RESULTS WALL  · nine client-brand colour fields        · Amplemarket
 *   selected work · client screenshots on brand plates     · (v3 canon)
 *   THE SYSTEM    · authored isometric SVG, four layers    · Mercury / Rox
 *   the problem   · three authored blueprint SVG plates    · (v3 canon)
 *   process       · numbered gates on the night stage      · Trawelt
 *   FAQ           · deep focal panel + stat row            · —
 *   final CTA     · full-bleed cover photograph            · Mews
 *   footer        · the wordmark as the graphic            · Slush
 */

const HERO_V10: HeroCopy = {
  eyebrowLabel: 'AI-native organic growth',
  eyebrowNote: 'B2B SaaS',
  headline: <>Get found in Google and <span className="soft">AI answers.</span></>,
  sub: (
    <>
      We run organic growth for B2B SaaS and fintech — search, AI answers, content and conversion —
      and turn that visibility into customers.
    </>
  ),
};

const PLATES_V10 = [PLATES[0], PLATES[3], PLATES[4]].filter(Boolean);

export default async function HomeV10Preview() {
  const images = await getHomeV3Images();

  return (
    <div className="hpv3">
      <HeroV3 images={images} copyOverride={HERO_V10} />
      <LogosTicker />

      <ResultsWall />
      <SelectedWork images={images} />

      <IsometricSystem />

      <ProblemSection
        plates={PLATES_V10}
        eyebrow="What we find"
        heading={<>Three things we almost always find<span className="ghost">.</span></>}
        ruleTag="FIG.001–003 · FIELD NOTES FROM 200+ BUILDS"
        bandText="If one of these sounds familiar, that is usually where we start."
        showCta={false}
      />

      <ProcessSteps />
      <FaqSection />
      <CoverCTA />
      <FooterV3 />
      <HomepageV3Scripts />
    </div>
  );
}
