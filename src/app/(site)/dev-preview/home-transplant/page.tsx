import type { Metadata } from 'next';
import '../../../home-v3/home-v3.css';
import '../../../home-v3/instruments/instruments.css';
import '../../../../components/harvested/beautifului-tokens.css';

import { StickyScroll } from '@/components/harvested/aceternity/sticky-scroll-reveal';
import { Timeline } from '@/components/harvested/aceternity/timeline';
import { BentoGrid, BentoGridItem } from '@/components/harvested/aceternity/bento-grid';
import { AnimatedTestimonials } from '@/components/harvested/aceternity/animated-testimonials';
import { NumberTicker } from '@/components/harvested/magicui/number-ticker';
import { BarChart, Bar, BarXAxis, Grid, ChartTooltip, FunnelChart } from '@/components/charts';

/**
 * Preview-only route — a harvested-component transplant test of the
 * homepage sections. Every section below is a component pulled VERBATIM
 * from a public library's own registry source (see the file headers under
 * `src/components/harvested/` for the exact source + the short, itemised
 * list of permitted edits). Copy is real, taken from `src/app/home-v3/**`
 * (read-only) — nothing here is invented.
 *
 * Not indexed, and not linked from the live site.
 */
export const metadata: Metadata = {
  title: 'Home transplant — harvested component preview',
  robots: { index: false, follow: false },
};

/* ---------------------------------------------------------- 1. StickyScroll */

const STAGE_CONTENT = [
  {
    title: 'Find the terms that lead to a customer',
    description:
      'We score your category by route to revenue, not by search volume. That gives one term your homepage has to own, and the cluster of questions your buyers ask on the way there.',
    content: (
      <div className="flex h-full w-full items-center justify-center p-3">
        <BarChart data={[
          { term: 'Head term', score: 100 },
          { term: 'Problem', score: 62 },
          { term: 'Comparison', score: 44 },
          { term: 'Integration', score: 28 },
        ]} xDataKey="term">
          <Grid horizontal />
          <Bar dataKey="score" fill="var(--chart-line-primary)" lineCap="round" />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
      </div>
    ),
  },
  {
    title: 'Build pages Google can rank and a model can read',
    description:
      'Each term gets one page with one job, sitting under one parent. Clean structure is what lets a search engine rank you and lets a language model quote you without guessing.',
    content: (
      <div className="flex h-full w-full items-center justify-center p-3">
        <BarChart data={[
          { engine: 'ChatGPT', share: 82 },
          { engine: 'Gemini', share: 68 },
          { engine: 'Perplexity', share: 74 },
        ]} xDataKey="engine">
          <Grid horizontal />
          <Bar dataKey="share" fill="var(--chart-line-primary)" lineCap="round" />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
      </div>
    ),
  },
  {
    title: 'Become the source the AI answer names',
    description:
      'We track a fixed set of buyer prompts across the assistants your market uses, then work the pages, schema, and third-party mentions that decide who gets named in the answer.',
    content: (
      <div className="flex h-full w-full items-center justify-center p-3">
        <BarChart data={[
          { engine: 'ChatGPT', share: 82 },
          { engine: 'Gemini', share: 68 },
          { engine: 'Perplexity', share: 74 },
          { engine: 'AI Overviews', share: 41 },
        ]} xDataKey="engine">
          <Grid horizontal />
          <Bar dataKey="share" fill="var(--chart-line-primary)" lineCap="round" />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
      </div>
    ),
  },
  {
    title: 'Turn the visitors into booked calls',
    description:
      'Visibility is only half of it. We rebuild the pages that receive the traffic, then test them, so the growth shows up in your pipeline instead of your traffic chart.',
    content: (
      <div className="flex h-full w-full items-center justify-center p-3">
        <FunnelChart data={[
          { label: 'Organic visitors', value: 100 },
          { label: 'Read the page', value: 46 },
          { label: 'Reached the CTA', value: 19 },
          { label: 'Booked a call', value: 7 },
        ]} />
      </div>
    ),
  },
];

/* -------------------------------------------------------------- 2. Timeline */

const TIMELINE_DATA = [
  {
    title: 'Week 0',
    content: (
      <div className="bf-card bg-white p-6">
        <h4 className="font-heading text-lg font-medium text-surface-900">Strategy call</h4>
        <p className="mt-2 text-sm text-surface-600">
          Thirty minutes. You tell us what&rsquo;s broken and what you&rsquo;ve tried; we tell you honestly whether
          we&rsquo;re the right fit.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-surface-600">
          <li>What we&rsquo;d work on first — scoped</li>
          <li>What it costs, monthly — scoped</li>
          <li>What we would not touch yet — scoped</li>
          <li>Sent within 48 hours</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Weeks 1–4',
    content: (
      <div className="bf-card bg-white p-6">
        <h4 className="font-heading text-lg font-medium text-surface-900">Set the growth plan</h4>
        <p className="mt-2 text-sm text-surface-600">
          We audit discovery, content, conversion, and the stack. The work then starts at whichever one is the
          constraint.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-surface-600">
          <li>Discovery — constraint</li>
          <li>Content — constraint</li>
          <li>Conversion — holding</li>
          <li>Stack — holding</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Weeks 4–6',
    content: (
      <div className="bf-card bg-white p-6">
        <h4 className="font-heading text-lg font-medium text-surface-900">Ship and measure</h4>
        <p className="mt-2 text-sm text-surface-600">
          We ship the agreed work, set up analytics where needed, and fix a baseline. We track what connects to
          pipeline.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-surface-600">
          <li>Pages rebuilt — live</li>
          <li>Content published — live</li>
          <li>Analytics baseline — running</li>
          <li>Vanity dashboards — none</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Month 3+',
    content: (
      <div className="bf-card bg-white p-6">
        <h4 className="font-heading text-lg font-medium text-surface-900">Grow and optimise</h4>
        <p className="mt-2 text-sm text-surface-600">
          SEO, AEO, and CRO compound. You get a monthly report on what we did, what moved, and what is next.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-surface-600">
          <li>What we did — monthly</li>
          <li>What moved — monthly</li>
          <li>What is next — monthly</li>
        </ul>
      </div>
    ),
  },
];

/* --------------------------------------------------------- 3. Testimonials */

const TESTIMONIALS = [
  {
    quote:
      'It was very refreshing working with you compared to other agencies we’re working with.',
    name: 'Anthony Dean',
    designation: 'Radisson Hotels Group',
    src: 'https://cdn.sanity.io/images/xjjjqhgt/production/90fcd30f2058c1975d25c315ccef475997d07461-836x203.png?w=400&fm=png&q=80',
  },
  {
    quote: 'We are extremely happy with the landing page LoudFace built for us on Webflow.',
    name: 'Daan Smit',
    designation: 'CEO & Founder, Brandfirm',
    src: '/images/brandfirm.svg',
  },
];

export default function HomeTransplantPreview() {
  return (
    <main className="hpv3">
      <div className="ci ci-intro ci-light">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">Component transplant</span>
            <h2>Harvested sections, real copy</h2>
            <p>
              Every section below is a public-library component pulled verbatim from its own source and re-keyed to
              LoudFace tokens only — nothing rebuilt in-house.
            </p>
          </div>
        </div>
      </div>

      {/* ---- 1. What we do / one system, four stages — Aceternity StickyScroll ---- */}
      <section className="ci ci-dark">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">What we do</span>
            <h2>One system, four stages</h2>
            <p>
              From the single term your homepage has to own, through to the page that turns a visitor into a booked
              call.
            </p>
          </div>
        </div>
        <StickyScroll content={STAGE_CONTENT} />
      </section>

      {/* ---- 2. How an engagement works — Aceternity Timeline ---- */}
      <section className="ci ci-light">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">The engagement</span>
            <h2>How an engagement works</h2>
            <p>No 47-slide proposals and no three-month discovery phase. Four gates, and what you receive at each one.</p>
          </div>
        </div>
        {/* gutter wrapper — the component expects its demo page's outer padding */}
        <div className="px-6 md:px-10">
          <Timeline data={TIMELINE_DATA} />
        </div>
      </section>

      {/* ---- 3. Numbers, not adjectives — MagicUI NumberTicker + testimonials ---- */}
      <section className="ci ci-light">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">Results</span>
            <h2>Numbers, not adjectives</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="bf-window bg-white p-8 text-center">
              <p className="font-heading text-5xl font-medium text-primary-600">
                <NumberTicker value={97.8} decimalPlaces={1} />%
              </p>
              <p className="mt-2 text-sm text-surface-600">AI visibility on the core buyer prompt — Toku, AEO</p>
            </div>
            <div className="bf-window bg-white p-8 text-center">
              <p className="font-heading text-5xl font-medium text-primary-600">
                +<NumberTicker value={288} />%
              </p>
              <p className="mt-2 text-sm text-surface-600">Increase in conversions — Dimer Health, six months of CRO</p>
            </div>
          </div>
          <AnimatedTestimonials testimonials={TESTIMONIALS} />
        </div>
      </section>

      {/* ---- 4. Selected work — Aceternity BentoGrid ---- */}
      <section className="ci ci-light">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">Selected work</span>
            <h2>Named clients, measured results</h2>
          </div>
          <BentoGrid className="md:grid-cols-2">
            <BentoGridItem
              title="Toku"
              description="0 → 97.8% AI visibility on the core buyer prompt."
              header={
                <div className="flex h-full min-h-24 w-full items-center justify-center bf-card bg-primary-50 font-heading text-lg text-primary-700">
                  Toku · AEO
                </div>
              }
            />
            <BentoGridItem
              title="Dimer Health"
              description="+288% increase in conversions, measured over six months of CRO work."
              header={
                <div className="flex h-full min-h-24 w-full items-center justify-center bf-card bg-primary-50 font-heading text-lg text-primary-700">
                  Dimer Health · CRO
                </div>
              }
            />
          </BentoGrid>
        </div>
      </section>
    </main>
  );
}
