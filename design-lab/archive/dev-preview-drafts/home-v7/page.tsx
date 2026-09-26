import type { Metadata } from 'next';
import '../../../home-v3/home-v3.css';
import '../../../home-v3/instruments/instruments.css';
import { HeroV3, type HeroCopy } from '../../../home-v3/HeroV3';
import { LogosTicker } from '../../../home-v3/LogosTicker';
import { ProblemSection } from '../../../home-v3/ProblemSection';
import { SelectedWork } from '../../../home-v3/SelectedWork';
import { FaqSection } from '../../../home-v3/FaqSection';
import { CoverCTA } from '../../../home-v3/CoverCTA';
import { FooterV3 } from '../../../home-v3/FooterV3';
import { AnswerReadout } from '../../../home-v3/instruments/AnswerReadout';
import { SystemStages } from '../../../home-v3/instruments/SystemStages';
import { ResultsInstrument } from '../../../home-v3/instruments/ResultsInstrument';
import { ProcessArtifacts } from '../../../home-v3/instruments/ProcessArtifacts';
import { SystemMatrix } from '../../../home-v3/instruments/SystemMatrix';
import { HomepageV3Scripts } from '../../../homepage-v3/Scripts';
import { getHomeV3Images } from '../../../home-v3/data';
import { PLATES } from '../../../home-v3/_plates';

export const metadata: Metadata = {
  title: 'Homepage v7 — instrumented',
  robots: { index: false, follow: false },
};

/**
 * Homepage v7 — INSTRUMENTED.
 *
 * The v6 pass fixed the running order and the copy and changed nothing about
 * what the page actually SHOWS. Audited against the visual-asset gate, four of
 * its ten sections carried no asset at all — "what we do", the numbers, the
 * process and the FAQ were text, boxes and tinted cards, and two of them ran
 * back to back, which fails the page outright.
 *
 * v7 gives each of those four a drawn instrument. None of them is new work:
 * `src/app/home-v3/instruments/*` already holds them, built on the visx chart
 * library in `src/components/charts`, and the live homepage ships none of them.
 *
 *   what we do  → SystemStages     · four stages, each swapping a real chart
 *   the problem → AnswerReadout    · the "you are not in the answer" plate
 *   numbers     → ResultsInstrument· a 97.8 ring + the 288% bar over six months
 *   process     → ProcessArtifacts · each gate carries the artifact it produces
 *   comparison  → SystemMatrix     · the whole system against the alternatives
 *
 * Reference anchors from design-lab/harvest/2026-09-15: Giga (dark stage with a
 * metric rail), Function (a single instrument beside the step copy), Apollo and
 * Customer.io (a stat fused with the evidence for it).
 *
 * Asset per section, named:
 *   hero         · client product UI at true scale, dual-column marquee
 *   logo band    · real client wordmarks
 *   selected work· client product screenshots on brand colour plates
 *   numbers      · ring chart + bar chart (drawn geometry)
 *   what we do   · four swappable charts
 *   the problem  · blueprint plates + the answer-readout plate
 *   comparison   · the matrix as a drawn field, LoudFace row on electric stage
 *   process      · per-gate artifacts with sparkline charts
 *   FAQ          · deep focal panel + stat row  ← still the weakest, see below
 *   final CTA    · full-bleed cover photograph
 *   footer       · the wordmark as the graphic
 *
 * The FAQ is the one section still carrying no asset of its own. It sits between
 * the process instruments and the cover photograph, so it does not break the
 * two-in-a-row rule — but it is the next thing to fix, not something to claim is
 * finished.
 */

const HERO_V7: HeroCopy = {
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

/** Two narrow plates + the wide one, so the grid still tiles 2 + 1. */
const PLATES_V7 = [PLATES[0], PLATES[3], PLATES[4]].filter(Boolean);


/**
 * The instruments were authored for the concept-preview route, which supplies
 * the section chrome around them — eyebrow, heading, lede, ground. Dropped into
 * a page bare they render as unframed content on white, which is exactly how the
 * first v7 build came out. This is that chrome, nothing more.
 */
function Instrumented({
  ground, eyebrow, heading, lede, children,
}: {
  ground: 'light' | 'dark';
  eyebrow: string;
  heading: React.ReactNode;
  lede?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={`ci ${ground === 'dark' ? 'ci-dark' : 'ci-light'}`}>
      <div className="container">
        <div className="ci-head">
          <span className="ci-lede">{eyebrow}</span>
          <h2>{heading}</h2>
          {lede ? <p>{lede}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export default async function HomeV7Preview() {
  const images = await getHomeV3Images();

  return (
    <div className="hpv3">
      <HeroV3 images={images} copyOverride={HERO_V7} />
      <LogosTicker />

      {/* Proof first — named clients, live links, real figures. */}
      <SelectedWork images={images} />
      <Instrumented
        ground="light"
        eyebrow="Results"
        heading="Numbers, not adjectives"
        lede="Both figures already ship on this site — Toku's AI visibility and Dimer Health's conversion lift, drawn rather than asserted."
      >
        <ResultsInstrument />
      </Instrumented>

      {/* The system, shown as work rather than described as chips. */}
      <Instrumented
        ground="dark"
        eyebrow="What we do"
        heading="One system, four stages"
        lede="From the single term your homepage has to own, through to the page that turns a visitor into a booked call. Pick a stage to see what the work actually looks like."
      >
        <SystemStages />
      </Instrumented>

      {/* The diagnosis: three plates, then the answer plate that names the cost. */}
      <ProblemSection
        plates={PLATES_V7}
        eyebrow="What we find"
        heading={<>Three things we almost always find<span className="ghost">.</span></>}
        ruleTag="FIG.001–003 · FIELD NOTES FROM 200+ BUILDS"
        bandText="If one of these sounds familiar, that is usually where we start."
        showCta={false}
      />
      <Instrumented
        ground="light"
        eyebrow="The problem"
        heading="Your buyers are asking. The answer names someone else."
        lede="Buyers now open an assistant before they open a search engine. If your pages are not built to be quoted, the answer they get is a list of your competitors — and you never enter the conversation."
      >
        <AnswerReadout />
      </Instrumented>

      <Instrumented
        ground="dark"
        eyebrow="Why not the alternatives"
        heading="The whole system, not the pieces"
        lede="Most routes cover one part of it. The gaps are where the work quietly stops."
      >
        <SystemMatrix />
      </Instrumented>
      <Instrumented
        ground="light"
        eyebrow="The engagement"
        heading="What working with us looks like"
        lede="No 47-slide proposals. Four gates, and the thing each one produces."
      >
        <ProcessArtifacts />
      </Instrumented>

      <FaqSection />
      <CoverCTA />
      <FooterV3 />
      <HomepageV3Scripts />
    </div>
  );
}
