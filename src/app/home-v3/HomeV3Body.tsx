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
import { getHomepageV3Content } from '@/lib/content-utils';

/**
 * The homepage body, shared by the real homepage and the variant-preview route.
 *
 * Extracted so the live homepage can pass its request-time server assignment
 * and the review route can pass a fixed variant without duplicating the page.
 * This component only renders the supplied choice; it never swaps copy after
 * hydration, so the initial HTML remains the experiment source of truth.
 *
 * Async server component: fetches the homepage-v3 content tree once here and
 * hands each section its own slice, so every section's copy comes from the
 * content layer (src/data/content/homepage-v3.json) for the inline editor.
 */
export async function HomeV3Body({
  images,
  heroVariant = 'control',
  exposeHeroVariant = false,
}: {
  images?: HomeImages;
  heroVariant?: HeroVariant;
  exposeHeroVariant?: boolean;
}) {
  const content = await getHomepageV3Content();

  return (
    <div className="hpv3" data-lf-hv={exposeHeroVariant ? heroVariant : undefined}>
      <HeroV3 images={images} variant={heroVariant} content={content.hero} />
      <LogosTicker content={content.logos} />
      <ProblemSection content={content.problem} />
      <WhatWeDo content={content.whatWeDo} />
      <SelectedWork images={images} content={content.selectedWork} />
      <ResultsNumbers content={content.results} />
      <ProcessSteps content={content.process} />
      <FaqSection content={content.faq} />
      <CoverCTA content={content.coverCta} />
      <FooterV3 />
    </div>
  );
}
