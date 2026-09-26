import type { Metadata } from 'next';
import '../../../home-v3/home-v3.css';
import '../../../home-v3/results-wall.css';
import '../../../home-v3/capability-field.css';
import { HeroV3, type HeroCopy } from '../../../home-v3/HeroV3';
import { LogosTicker } from '../../../home-v3/LogosTicker';
import { ResultsWall } from '../../../home-v3/ResultsWall';
import { SelectedWork } from '../../../home-v3/SelectedWork';
import { CapabilityField } from '../../../home-v3/CapabilityField';
import { ProblemSection } from '../../../home-v3/ProblemSection';
import { ProcessSteps } from '../../../home-v3/ProcessSteps';
import { FaqSection } from '../../../home-v3/FaqSection';
import { CoverCTA } from '../../../home-v3/CoverCTA';
import { FooterV3 } from '../../../home-v3/FooterV3';
import { HomepageV3Scripts } from '../../../homepage-v3/Scripts';
import { getHomeV3Images } from '../../../home-v3/data';
import { PLATES } from '../../../home-v3/_plates';

export const metadata: Metadata = {
  title: 'Homepage v8 — results wall',
  robots: { index: false, follow: false },
};

/**
 * Homepage v8 — RESULTS FIRST, EDITORIAL.
 *
 * Asset plan, written before the markup (each section : its non-DOM asset :
 * the harvested tile it is designed against):
 *
 *   hero          · client product UI at true scale, dual marquee  · Clay
 *   logo band     · real client wordmarks                          · Readymag
 *   RESULTS WALL  · nine saturated client-brand colour fields      · Amplemarket
 *   selected work · client screenshots on brand plates             · (v3 canon)
 *   WHAT WE DO    · Toku's build cropped by the field's edge        · Locomotive
 *   the problem   · three authored blueprint SVG plates            · (v3 canon)
 *   process       · numbered gates on the night stage              · Trawelt
 *   FAQ           · deep focal panel + stat row                    · —
 *   final CTA     · full-bleed cover photograph                    · Mews
 *   footer        · the wordmark as the graphic                    · Slush
 *
 * Two sections carry no asset of their own — FAQ and process — and they are not
 * adjacent, so the page passes. Both are named as the remaining work rather than
 * quietly counted as finished.
 *
 * The brief was "lead with results and show them what we do", so the wall sits
 * directly under the logo strip: a named client result is on screen before any
 * argument is made. Amplemarket's tiles are pastel washes, which DESIGN.md bans,
 * so the mosaic keeps its structure and takes its colour from each client's own
 * brand field.
 */

const HERO_V8: HeroCopy = {
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

const PLATES_V8 = [PLATES[0], PLATES[3], PLATES[4]].filter(Boolean);

export default async function HomeV8Preview() {
  const images = await getHomeV3Images();

  return (
    <div className="hpv3">
      <HeroV3 images={images} copyOverride={HERO_V8} />
      <LogosTicker />

      {/* Results before argument — a named client figure inside the first screen after the fold. */}
      <ResultsWall />
      <SelectedWork images={images} />

      {/* What we do, as a colour field with typographic columns rather than cards. */}
      <CapabilityField />

      <ProblemSection
        plates={PLATES_V8}
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
