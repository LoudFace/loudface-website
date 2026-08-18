import { HeroV3, type HeroVariant } from './HeroV3';
import { LogosTicker } from './LogosTicker';
import { ProblemSection } from './ProblemSection';
import { WhatWeDo } from './WhatWeDo';
import { SelectedWork } from './SelectedWork';
import { ResultsNumbers } from './ResultsNumbers';
import { ProcessSteps } from './ProcessSteps';
import { FaqSection } from './FaqSection';
import { CoverCTA } from './CoverCTA';
import { FooterV3 } from './FooterV3';
import type { HomeImages } from './data';

/**
 * The homepage body, shared by the real homepage and the variant-preview route.
 *
 * Extracted so the live homepage can pass its request-time server assignment
 * and the review route can pass a fixed variant without duplicating the page.
 * This component only renders the supplied choice; it never swaps copy after
 * hydration, so the initial HTML remains the experiment source of truth.
 */
export function HomeV3Body({
  images,
  heroVariant = 'control',
}: {
  images?: HomeImages;
  heroVariant?: HeroVariant;
}) {
  return (
    <div className="hpv3">
      <HeroV3 images={images} variant={heroVariant} />
      <LogosTicker />
      <ProblemSection />
      <WhatWeDo />
      <SelectedWork images={images} />
      <ResultsNumbers />
      <ProcessSteps />
      <FaqSection />
      <CoverCTA />
      <FooterV3 />
    </div>
  );
}
