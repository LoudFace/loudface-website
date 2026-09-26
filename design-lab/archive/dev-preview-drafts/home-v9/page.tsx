import type { Metadata } from 'next';
import '../../../home-v3/home-v3.css';
import '../../../home-v3/results-wall.css';
import '../../../home-v3/object-system.css';
import { HeroV3, type HeroCopy } from '../../../home-v3/HeroV3';
import { LogosTicker } from '../../../home-v3/LogosTicker';
import { ResultsWall } from '../../../home-v3/ResultsWall';
import { SelectedWork } from '../../../home-v3/SelectedWork';
import { ObjectSystem } from '../../../home-v3/ObjectSystem';
import { ProblemSection } from '../../../home-v3/ProblemSection';
import { ProcessSteps } from '../../../home-v3/ProcessSteps';
import { FaqSection } from '../../../home-v3/FaqSection';
import { CoverCTA } from '../../../home-v3/CoverCTA';
import { FooterV3 } from '../../../home-v3/FooterV3';
import { HomepageV3Scripts } from '../../../homepage-v3/Scripts';
import { getHomeV3Images } from '../../../home-v3/data';
import { PLATES } from '../../../home-v3/_plates';

export const metadata: Metadata = {
  title: 'Homepage v9 — object & stage',
  robots: { index: false, follow: false },
};

/**
 * Homepage v9 — OBJECT AND STAGE.
 *
 * Same brief as v8 — lead with results, then show what we do — but "what we do"
 * is carried by rendered objects and one live WebGL stage instead of type on a
 * colour field.
 *
 * Asset plan (section : asset : reference tile):
 *   hero          · client product UI at true scale            · Clay
 *   logo band     · real client wordmarks                      · Readymag
 *   RESULTS WALL  · nine client-brand colour fields            · Amplemarket
 *   selected work · client screenshots on brand plates         · (v3 canon)
 *   OBJECT ROW    · three studio object renders, one set       · SIGMA / Zellerfeld
 *   LIVE STAGE    · the Three.js monolith, running             · Koto / Shopify Editions
 *   the problem   · three authored blueprint SVG plates        · (v3 canon)
 *   process       · numbered gates on the night stage          · Trawelt
 *   FAQ           · deep focal panel + stat row                · —
 *   final CTA     · full-bleed cover photograph                · Mews
 *   footer        · the wordmark as the graphic                · Slush
 *
 * The three objects were generated as one set for this page. They are abstract
 * deliberately: invented photography of "a team collaborating" is exactly the
 * tell this pass exists to remove, and we do not have real photography of the
 * work itself.
 */

const HERO_V9: HeroCopy = {
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

const PLATES_V9 = [PLATES[0], PLATES[3], PLATES[4]].filter(Boolean);

export default async function HomeV9Preview() {
  const images = await getHomeV3Images();

  return (
    <div className="hpv3">
      <HeroV3 images={images} copyOverride={HERO_V9} />
      <LogosTicker />

      <ResultsWall />
      <SelectedWork images={images} />

      <ObjectSystem />

      <ProblemSection
        plates={PLATES_V9}
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
