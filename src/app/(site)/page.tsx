/**
 * Homepage — v3 design (componentized).
 *
 * The client-approved v3 redesign, composed from the home-v3 section components
 * inside the (site) group so it inherits the shared Header/Footer + PostHog/GTM/
 * Cal chrome. The shared Header renders in its dark-hero variant on `/` (wired in
 * (site)/layout.tsx). Bespoke styling is home-v3.css, imported route-scoped here
 * (it does NOT load on other (site) pages). Case-study screenshots come from
 * Sanity by slug (getHomeV3Images) with hardcoded fallbacks, so the page never
 * blanks even if the CMS is unreachable — which is why the old assertCmsData
 * build-guard is no longer needed on this route.
 *
 * SEO metadata + the speakable JSON-LD below are preserved verbatim from the
 * previous homepage. Previous implementation is in git history if a revert is
 * needed.
 */
import type { Metadata } from 'next';
import '../home-v3/home-v3.css';
import { HeroV3 } from '../home-v3/HeroV3';
import { LogosTicker } from '../home-v3/LogosTicker';
import { ProblemSection } from '../home-v3/ProblemSection';
import { WhatWeDo } from '../home-v3/WhatWeDo';
import { SelectedWork } from '../home-v3/SelectedWork';
import { ResultsNumbers } from '../home-v3/ResultsNumbers';
import { ProcessSteps } from '../home-v3/ProcessSteps';
import { FaqSection } from '../home-v3/FaqSection';
import { CoverCTA } from '../home-v3/CoverCTA';
import { FooterV3 } from '../home-v3/FooterV3';
import { HomepageV3Scripts } from '../homepage-v3/Scripts';
import { getHomeV3Images } from '../home-v3/data';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'B2B SaaS Web Design, SEO & Growth Agency',
  description:
    'Design, development, and growth for Series A+ SaaS companies. We ship your website on Webflow in weeks, then drive traffic and conversions with SEO and CRO.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'B2B SaaS Web Design, SEO & Growth Agency | LoudFace',
    description:
      'Design, development, and growth for Series A+ SaaS companies. We ship your website on Webflow in weeks, then drive traffic and conversions with SEO and CRO.',
    type: 'website',
    url: '/',
    siteName: 'LoudFace',
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'LoudFace - B2B SaaS Growth Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@loudface',
    title: 'B2B SaaS Web Design, SEO & Growth Agency | LoudFace',
    description:
      'Design, development, and growth for Series A+ SaaS companies. We ship your website on Webflow in weeks, then drive traffic and conversions with SEO and CRO.',
    images: ['/opengraph-image'],
  },
};

const speakableSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'LoudFace - B2B SaaS Web Design, SEO & Growth Agency',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '[data-speakable]'],
  },
  url: 'https://www.loudface.co',
};

export default async function HomePage() {
  const images = await getHomeV3Images();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* .hpv3 scopes the bespoke resets so they can't touch the shared Header/Footer.
          Fonts + tokens live (global) in home-v3.css now — no separate brand.css link. */}
      <div className="hpv3">
        <HeroV3 images={images} />
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

      <HomepageV3Scripts />
    </>
  );
}
