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
 * Extracted so a hero experiment can be reviewed on the real page composition
 * without the homepage itself having to read request-time input. `/` keeps
 * rendering statically with the control hero; only the preview route passes a
 * different variant.
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
