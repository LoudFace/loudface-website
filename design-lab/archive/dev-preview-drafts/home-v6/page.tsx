import type { Metadata } from 'next';
import '../../../home-v3/home-v3.css';
import { HeroV3, type HeroCopy } from '../../../home-v3/HeroV3';
import { LogosTicker } from '../../../home-v3/LogosTicker';
import { ProblemSection } from '../../../home-v3/ProblemSection';
import { WhatWeDo } from '../../../home-v3/WhatWeDo';
import { SelectedWork } from '../../../home-v3/SelectedWork';
import { ResultsNumbers } from '../../../home-v3/ResultsNumbers';
import { ProcessSteps } from '../../../home-v3/ProcessSteps';
import { FaqSection } from '../../../home-v3/FaqSection';
import { CoverCTA } from '../../../home-v3/CoverCTA';
import { FooterV3 } from '../../../home-v3/FooterV3';
import { HomepageV3Scripts } from '../../../homepage-v3/Scripts';
import { getHomeV3Images } from '../../../home-v3/data';
import { PLATES } from '../../../home-v3/_plates';

export const metadata: Metadata = {
  title: 'Homepage v6 — edit pass',
  robots: { index: false, follow: false },
};

/**
 * Homepage v6 — an EDIT of the live v3 homepage, not a new design.
 *
 * v3's craft is not the problem; its density and running order are. The live
 * page spends ~3,900px arguing (problem catalog + what-we-do) before it shows a
 * single named client, repeats the same booking ask four times, and opens with a
 * 62-word hero sub that re-states the headline and lists four acronyms.
 *
 * Four changes, all subtractive or re-ordering — every section is the approved
 * v3 component, unmodified except through its own props:
 *
 *  1. PROOF BEFORE ARGUMENT. Selected work and the numbers move above the
 *     problem catalog. A Series A marketing lead meets named clients and real
 *     figures in the first screen and a half, not at 40% scroll.
 *  2. THE HERO MAKES ONE CLAIM. Headline keeps the two-step promise but stops
 *     repeating it in the sub; the sub is one sentence and drops GEO/AEO/CRO,
 *     which are our vocabulary, not the buyer's. Acronyms are introduced once,
 *     in "what we do", where they are defined by the work beside them.
 *  3. THE PROBLEM SECTION BECOMES A DIAGNOSIS, NOT A LECTURE. Five plates cut
 *     to the three that name a cost, reframed as what we find rather than what
 *     you did wrong — and it now lands AFTER the proof, so it reads as
 *     expertise instead of fear. Saves ~800px.
 *  4. ONE ASK PER PHASE. The booking CTA drops from four placements to three
 *     (hero, FAQ panel, cover) by removing the problem band's duplicate.
 *
 * Deliberately unchanged: palette, type, stage rhythm, every component's
 * internal composition. This is an editing pass, so the diff has to be legible
 * as editing.
 */

/**
 * One idea in the headline, one sentence underneath.
 *
 * Measured against a Mobbin harvest of 10 B2B SaaS hero sections (Clay, Intercom,
 * Ditto, Apollo, Maze, Contractbook, Customer.io, Square, Ploy) saved under
 * design-lab/harvest/2026-09-15/: every one of them runs a 4–8 word headline
 * carrying a single claim, and a sub of one or two lines. The live hero is 14
 * words across two sentences with a 62-word sub that restates the headline and
 * lists four acronyms.
 *
 * So the second promise moves out of the H1 and becomes the end of the sub,
 * where it still lands but stops competing with the first. GEO/AEO/CRO come out
 * entirely — they are our vocabulary, and "what we do" defines them beside the
 * work a screen later.
 */
const HERO_V6: HeroCopy = {
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

/**
 * Three plates, one per thing we actually sell, ending on the wide one so the
 * grid still tiles 2 + 1 the way the five-plate original did:
 *
 *   FIG.001  homepage says what you built, not why it matters  → positioning
 *   FIG.004  buyers ask AI who to shortlist, it names others   → AI visibility
 *   FIG.005  traffic arrives, conversion rate never moves      → conversion
 *
 * Dropped: the engineering-bottleneck plate (a Webflow argument, secondary on a
 * growth page) and the "redesigned six months ago, traffic flat" plate, which
 * says the same thing as FIG.005 with a weaker number.
 */
const PLATES_V6 = [PLATES[0], PLATES[3], PLATES[4]].filter(Boolean);

export default async function HomeV6Preview() {
  const images = await getHomeV3Images();

  return (
    <div className="hpv3">
      <HeroV3 images={images} copyOverride={HERO_V6} />
      <LogosTicker />

      {/* Proof first: named clients, live links, real figures. */}
      <SelectedWork images={images} />
      <ResultsNumbers />

      {/* Then the argument, now that there is a reason to believe it. */}
      <WhatWeDo />
      <ProblemSection
        plates={PLATES_V6}
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
