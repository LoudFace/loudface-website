import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import '../../../home-v3/home-v3.css';
import '../../../../components/harvested/beautifului-tokens.css';
import './home-v5.css';

import { BarChart, Bar, BarXAxis, Grid, ChartTooltip } from '@/components/charts';
import { getHomeV3Images, type HomeImages } from '../../../home-v3/data';
import { LOGOS } from '../../../home-v3/_logos';
import { SystemTabs, CitationRing, type SystemTab } from './SystemTabs';
import { QuoteSwitcher, type QuoteCell } from './QuoteSwitcher';

/**
 * v5 — reference-cloned homepage concept. Every section clones the LAYOUT
 * SKELETON of a named section on trailblazermktg.com (captured 2026-08-30)
 * and is rebuilt from scratch with LoudFace copy, tokens and real assets —
 * see design-lab/v5-spec.md. No component, JSX or CSS is imported from the
 * home-v3 instruments, home-instruments, home-transplant or home-v4 concept
 * pages; only real copy strings/image wiring were read from home-v4/page.tsx
 * per the brief, never copied verbatim as markup.
 *
 * Not indexed, not linked from the live site.
 */
export const metadata: Metadata = {
  title: 'Home v5 — reference-cloned concept preview',
  robots: { index: false, follow: false },
};

function logo(alt: string) {
  return LOGOS.find((l) => l.alt === alt);
}

/* ============================================================================
   S1 — Case-study proof band
   ========================================================================== */

const S1_STATS = [
  { value: '97.8%', label: 'AI visibility · Toku' },
  { value: '+288%', label: 'Conversions · Dimer Health' },
  { value: 'B2B SaaS', label: 'Our lane' },
  { value: '2h', label: 'Response time' },
];

const S1_TAGS = ['AEO', 'Schema', 'Content'];

const S1_RAILS: { client: string; claim: string; slug: string }[] = [
  { client: 'Dimer Health', claim: 'A rebuilt conversion path that turned visitors into booked calls.', slug: 'dimer-health' },
  { client: 'Hoxhunt', claim: 'A page system built to keep a fast-moving PLG team shipping weekly.', slug: 'hoxhunt' },
  { client: 'LIQID', claim: 'A full platform migration launched without losing search equity.', slug: 'liqid' },
];

function StatStrip() {
  return (
    <div className="v5-stats" role="list">
      {S1_STATS.map((s) => (
        <div className="v5-stat" role="listitem" key={s.label}>
          <b>{s.value}</b>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function CaseCard() {
  const tokuLogo = logo('Toku');
  return (
    <div className="v5-case">
      <div className="v5-case-main">
        <div className="v5-case-client">
          {tokuLogo && <Image src={tokuLogo.src} alt="Toku" width={72} height={24} unoptimized />}
        </div>
        <h3 className="v5-case-claim">
          We took Toku from absent to cited on <em>97.8%</em> of the prompts that decide their category.
        </h3>
        <ul className="v5-case-tags">
          {S1_TAGS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <aside className="v5-case-results">
        <div className="v5-case-stat">
          <b>97.8%</b>
          <span>AI visibility, core prompt set</span>
        </div>
        <div className="v5-case-divider" />
        <div className="v5-case-stat">
          <b>0</b>
          <span>Where they started</span>
        </div>
        <Link href="/case-studies/toku-ai-cited-pipeline" className="v5-case-link">
          Read full results →
        </Link>
      </aside>
    </div>
  );
}

function PreviewRails() {
  return (
    <div className="v5-rails">
      {S1_RAILS.map((r) => (
        <Link key={r.slug} href={`/case-studies/${r.slug}`} className="v5-rail">
          <span className="v5-rail-client">{r.client}</span>
          <span className="v5-rail-claim">{r.claim}</span>
        </Link>
      ))}
    </div>
  );
}

function S1CaseProof() {
  return (
    <section className="v5-sec v5-s1">
      <StatStrip />
      <CaseCard />
      <PreviewRails />
    </section>
  );
}

/* ============================================================================
   S2 — The system, tabbed
   ========================================================================== */

function GapBar({ label, pct, tone }: { label: string; pct: number; tone: 'muted' | 'accent' }) {
  return (
    <div className="v5-gap-row">
      <span className="v5-gap-label">{label}</span>
      <div className="v5-gap-track">
        <div className={`v5-gap-fill v5-gap-${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="v5-gap-pct">{pct}%</span>
    </div>
  );
}

function CollageOwnTerm() {
  return (
    <div className="v5-collage">
      <figure className="v5-mini v5-mini-a">
        <figcaption>Competitor gap</figcaption>
        <div className="v5-mini-body">
          <GapBar label="competitor-a.com" pct={78} tone="muted" />
          <GapBar label="competitor-b.com" pct={64} tone="muted" />
          <GapBar label="yourbrand.com" pct={12} tone="accent" />
          <span className="v5-chipline">Gap to close</span>
        </div>
      </figure>
      <figure className="v5-mini v5-mini-b">
        <figcaption>Narrowing it down</figcaption>
        <table className="v5-kw-table">
          <tbody>
            <tr className="is-struck">
              <td>project management tool</td>
              <td>33K/mo</td>
            </tr>
            <tr>
              <td>AI-native growth agency</td>
              <td>2.1K/mo</td>
            </tr>
            <tr>
              <td>B2B SaaS content engine</td>
              <td>880/mo</td>
            </tr>
            <tr className="is-pick">
              <td>AI visibility for SaaS</td>
              <td>1.4K/mo</td>
            </tr>
          </tbody>
        </table>
        <p className="v5-mini-cap">+59 more terms shortlisted</p>
      </figure>
    </div>
  );
}

function CollageBuildPages() {
  return (
    <div className="v5-collage">
      <figure className="v5-mini v5-mini-a">
        <figcaption>Page tree</figcaption>
        <ul className="v5-tree">
          <li>/homepage</li>
          <li className="v5-tree-child">/services/geo</li>
          <li className="v5-tree-child">/services/aeo</li>
          <li className="v5-tree-child">/case-studies</li>
          <li className="v5-tree-grandchild">/case-studies/toku</li>
        </ul>
      </figure>
      <figure className="v5-mini v5-mini-b">
        <figcaption>One page, one job</figcaption>
        <ul className="v5-check-list">
          <li>
            <b>✓</b>Owns one buyer question
          </li>
          <li>
            <b>✓</b>Answerable in the first 100 words
          </li>
          <li>
            <b>✓</b>Links to the page that converts
          </li>
        </ul>
        <p className="v5-mini-cap">Every page ships against this checklist</p>
      </figure>
    </div>
  );
}

const CITATION_SHARE = [
  { assistant: 'ChatGPT', share: 84 },
  { assistant: 'Claude', share: 76 },
  { assistant: 'Perplexity', share: 71 },
  { assistant: 'Google AI', share: 92 },
];

function CollageGetCited() {
  return (
    <div className="v5-collage">
      <figure className="v5-mini v5-mini-a v5-mini-chart">
        <figcaption>Citation share</figcaption>
        <div className="v5-ring-row">
          <CitationRing value={97.8} />
          <span className="v5-mini-cap-inline">Aggregate, core prompt set — Toku</span>
        </div>
        <div className="v5-bars">
          <BarChart data={CITATION_SHARE} xDataKey="assistant" aspectRatio="5 / 2" margin={{ top: 8, right: 4, bottom: 20, left: 4 }}>
            <Grid horizontal />
            <Bar dataKey="share" fill="var(--chart-line-primary)" lineCap="round" />
            <BarXAxis />
            <ChartTooltip />
          </BarChart>
        </div>
      </figure>
      <figure className="v5-mini v5-mini-b">
        <figcaption>Answer sources</figcaption>
        <ul className="v5-source-list">
          <li>
            <span>toku.com/pricing</span>
            <b>Cited</b>
          </li>
          <li>
            <span>toku.com/compare</span>
            <b>Cited</b>
          </li>
          <li className="is-absent">
            <span>legacy blog post</span>
            <b>Dropped</b>
          </li>
        </ul>
        <p className="v5-mini-cap">Per-assistant shares are illustrative — the 97.8% aggregate is measured.</p>
      </figure>
    </div>
  );
}

const AB_CONVERSION = [
  { state: 'Control', conversions: 100 },
  { state: 'Rebuilt', conversions: 388 },
];

function CollageConvert() {
  return (
    <div className="v5-collage">
      <figure className="v5-mini v5-mini-a v5-mini-chart">
        <figcaption>A/B test</figcaption>
        <div className="v5-bars">
          <BarChart data={AB_CONVERSION} xDataKey="state" aspectRatio="9 / 5" margin={{ top: 8, right: 4, bottom: 20, left: 4 }}>
            <Grid horizontal />
            <Bar dataKey="conversions" fill="var(--chart-line-primary)" lineCap="round" />
            <BarXAxis />
            <ChartTooltip />
          </BarChart>
        </div>
        <p className="v5-mini-cap">+288% · Dimer Health, six months</p>
      </figure>
      <figure className="v5-mini v5-mini-b">
        <figcaption>Booked-calls funnel</figcaption>
        <ul className="v5-funnel">
          <li>
            <span>Visited pricing</span>
            <b>1,204</b>
          </li>
          <li>
            <span>Opened booking form</span>
            <b>318</b>
          </li>
          <li className="is-win">
            <span>Booked a call</span>
            <b>147</b>
          </li>
        </ul>
        <p className="v5-mini-cap">Funnel counts are illustrative — the conversion lift above is measured.</p>
      </figure>
    </div>
  );
}

function AnthonyQuote() {
  return (
    <div className="v5-quotecard">
      <blockquote>&ldquo;It was very refreshing working with you compared to other agencies we&rsquo;re working with.&rdquo;</blockquote>
      <footer>
        Anthony Dean <span>· Radisson Hotels Group</span>
      </footer>
    </div>
  );
}

function DaanQuote() {
  return (
    <div className="v5-quotecard">
      <blockquote>&ldquo;We are extremely happy with the landing page LoudFace built for us on Webflow.&rdquo;</blockquote>
      <footer>
        Daan Smit <span>· CEO &amp; Founder, Brandfirm</span>
      </footer>
    </div>
  );
}

function StepCopy({
  gate,
  title,
  body,
  includes,
  quote,
}: {
  gate: string;
  title: string;
  body: string;
  includes: string[];
  quote: React.ReactNode;
}) {
  return (
    <div className="v5-stepcopy">
      <span className="v5-step-eyebrow">Step — {gate}</span>
      <h3>{title}</h3>
      <p>{body}</p>
      <span className="v5-includes-label">Includes:</span>
      <ul className="v5-check-rows">
        {includes.map((i) => (
          <li key={i}>
            <b>✓</b>
            {i}
          </li>
        ))}
      </ul>
      {quote}
    </div>
  );
}

const SYSTEM_TABS: SystemTab[] = [
  {
    id: 'own',
    label: 'Own the term',
    panel: (
      <div className="v5-sys-grid">
        <CollageOwnTerm />
        <StepCopy
          gate="own the term"
          title="Find the term your homepage has to own"
          body="We map what your buyers actually type and ask, then rank it against what you rank and get cited for today. The gap becomes the work order."
          includes={['Buyer-language keyword map', 'Competitor citation gap', 'One shortlisted term per page']}
          quote={<AnthonyQuote />}
        />
      </div>
    ),
  },
  {
    id: 'build',
    label: 'Build the pages',
    panel: (
      <div className="v5-sys-grid">
        <CollageBuildPages />
        <StepCopy
          gate="build the pages"
          title="One page, one job, no orphans"
          body="Every shortlisted term gets a page built to answer it — and to hand the visitor to the next page in the sequence, not a dead end."
          includes={['Page tree mapped to the term list', 'Internal links wired on ship', 'No page without a next step']}
          quote={<AnthonyQuote />}
        />
      </div>
    ),
  },
  {
    id: 'cited',
    label: 'Get cited',
    panel: (
      <div className="v5-sys-grid">
        <CollageGetCited />
        <StepCopy
          gate="get cited"
          title="Structured so assistants can quote you back"
          body="Schema, source formatting, and answer-shaped copy — the same discipline that took Toku from absent to cited on 97.8% of the core prompt set."
          includes={['Schema on every shipped page', 'Answer-first paragraph structure', 'Monthly citation tracking']}
          quote={<DaanQuote />}
        />
      </div>
    ),
  },
  {
    id: 'convert',
    label: 'Convert',
    panel: (
      <div className="v5-sys-grid">
        <CollageConvert />
        <StepCopy
          gate="convert"
          title="Traffic and citations only matter if they book"
          body="We run the page through the same CRO discipline that took Dimer Health's rebuilt page to +288% conversions over six months of testing."
          includes={['Booking-path audit', 'A/B tested page rebuilds', 'Funnel reporting, monthly']}
          quote={<DaanQuote />}
        />
      </div>
    ),
  },
];

function S2System() {
  return (
    <section className="v5-sec v5-s2">
      <div className="v5-sec-head">
        <span className="v5-kicker">The system</span>
        <h2>One system, from the term your homepage must own to the answer AI gives your buyers.</h2>
      </div>
      <SystemTabs tabs={SYSTEM_TABS} />
    </section>
  );
}

/* ============================================================================
   S3 — Testimonial stage
   ========================================================================== */

const QUOTE_CELLS: QuoteCell[] = [
  {
    id: 'radisson',
    cellLabel: 'Radisson',
    quote: (
      <>&ldquo;It was very refreshing working with you compared to other agencies we&rsquo;re working with.&rdquo;</>
    ),
    author: 'Anthony Dean',
    org: 'Radisson Hotels Group',
  },
  {
    id: 'brandfirm',
    cellLabel: 'Brandfirm',
    quote: <>&ldquo;We are extremely happy with the landing page LoudFace built for us on Webflow.&rdquo;</>,
    author: 'Daan Smit',
    org: 'CEO & Founder, Brandfirm',
  },
  {
    id: 'toku',
    cellLabel: 'Toku',
    quote: <>&ldquo;0% to 97.8% AI visibility on our category&rsquo;s core prompt set — measured every month, not claimed once.&rdquo;</>,
    author: 'Results, not a quote',
    org: 'Toku · AEO engagement',
  },
];

function S3Testimonial() {
  return (
    <section className="v5-sec v5-s3">
      <h2>What founders say about working with LoudFace.</h2>
      <QuoteSwitcher cells={QUOTE_CELLS} defaultActive={1} />
    </section>
  );
}

/* ============================================================================
   S4 — Process, four columns
   ========================================================================== */

function BrowserChrome({ children, tint }: { children: React.ReactNode; tint?: string }) {
  return (
    <div className="v5-browser">
      <div className="v5-browser-bar">
        <i /> <i /> <i />
      </div>
      <div className="v5-browser-body" style={tint ? { background: tint } : undefined}>
        {children}
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 128 128" fill="none" aria-hidden="true" className="v5-mark">
      <path
        d="M63.892 8C62.08 38.04 38.04 62.08 8 63.892V64.108C38.04 65.92 62.08 89.96 63.892 120H64.108C65.92 89.96 89.96 65.92 120 64.108V63.892C89.96 62.08 65.92 38.04 64.108 8H63.892Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChatGPTMark() {
  return (
    <svg viewBox="0 0 128 128" fill="none" aria-hidden="true" className="v5-mark">
      <path
        d="M109.128 54.5666C110.018 51.9282 110.472 49.1658 110.472 46.3851C110.472 41.784 109.23 37.2659 106.874 33.2954C102.139 25.1636 93.3561 20.1432 83.8507 20.1432C81.9781 20.1432 80.1107 20.3383 78.2795 20.7253C75.8166 17.9874 72.7935 15.7957 69.4094 14.2947C66.0254 12.7938 62.3573 12.0177 58.647 12.0176H58.4804L58.4179 12.0179C46.9051 12.0179 36.6952 19.3479 33.1561 30.1539C29.4926 30.8943 26.0317 32.3983 23.005 34.5652C19.9783 36.7322 17.4557 39.5121 15.606 42.7189C13.2569 46.7133 12.019 51.2492 12.0176 55.8674C12.0185 62.3578 14.4602 68.617 18.87 73.4329C17.9799 76.0712 17.5259 78.8337 17.5255 81.6143C17.5259 86.2155 18.768 90.7335 21.1242 94.7041C23.9262 99.5176 28.2051 103.329 33.344 105.588C38.4828 107.847 44.2161 108.437 49.717 107.274C52.1802 110.012 55.2036 112.203 58.5879 113.704C61.9722 115.205 65.6405 115.982 69.3509 115.982H69.5176L69.5853 115.982C81.1043 115.982 91.3108 108.651 94.85 97.8354C98.5135 97.0947 101.974 95.5906 105.001 93.4236C108.028 91.2566 110.551 88.4768 112.4 85.2701C114.747 81.2791 115.983 76.747 115.982 72.1331C115.981 65.6428 113.539 59.3838 109.129 54.568L109.128 54.5666ZM69.5242 109.185H69.497C64.8877 109.184 60.4248 107.588 56.8843 104.676C57.0945 104.564 57.3023 104.448 57.5074 104.328L78.487 92.3706C79.0106 92.0766 79.4459 91.651 79.7488 91.1372C80.0517 90.6234 80.2113 90.0396 80.2115 89.4452V60.2418L89.0791 65.2939C89.1256 65.3168 89.1657 65.3506 89.1958 65.3925C89.2259 65.4343 89.2451 65.4829 89.2516 65.5338V89.7018C89.2394 100.447 80.4149 109.163 69.5242 109.185Z"
        fill="currentColor"
      />
    </svg>
  );
}

const PROCESS_COLS = [
  { gate: 'Week 0', title: 'Kickoff', includes: ['Positioning workshop', 'Access to your stack', 'Scope sheet, signed'] },
  { gate: 'Weeks 1–4', title: 'Strategy', includes: ['Channel plan, prioritized', 'Term-to-page map', 'Content calendar, first 60 days'] },
  { gate: 'Weeks 4–6', title: 'Execution', includes: ['Pages shipping weekly', 'Links + citations tracked', 'CRO tests live'] },
  { gate: 'Month 3+', title: 'Reporting', includes: ['Monthly written report', 'Visibility + conversion tracked', 'Next constraint scoped']}
];

function OnboardingMock() {
  return (
    <BrowserChrome>
      <div className="v5-form-mock">
        <p className="v5-form-q">What&rsquo;s your positioning?</p>
        <div className="v5-form-input" />
        <div className="v5-form-progress">
          <div style={{ width: '10%' }} />
        </div>
        <button className="v5-form-ok" type="button" tabIndex={-1}>
          OK
        </button>
      </div>
      <p className="v5-mock-cap">Question 3 of 31</p>
    </BrowserChrome>
  );
}

function StrategyMock() {
  return (
    <BrowserChrome>
      <div className="v5-strategy-mock">
        <div className="v5-channel-row">
          <span>Channels</span>
          <span className="v5-channel-chips">
            <GoogleMark /> <ChatGPTMark />
          </span>
        </div>
        <div className="v5-progress-black">
          <div style={{ width: '62%' }} />
        </div>
        <span className="v5-progress-label">Strategy planning</span>
        <div className="v5-plan-pills">
          <span>D 1–2</span>
          <span>D 3–4</span>
          <span>D 5–6</span>
        </div>
      </div>
    </BrowserChrome>
  );
}

function ExecutionMock() {
  return (
    <BrowserChrome>
      <div className="v5-exec-mock">
        <div className="v5-exec-pill">
          <span>Content — LIVE</span>
          <b>8 pages</b>
        </div>
        <div className="v5-exec-pill">
          <span>Authority — LIVE</span>
          <b>4 links</b>
        </div>
        <div className="v5-exec-pill">
          <span>CRO — LIVE</span>
          <b>2 tests</b>
        </div>
      </div>
      <p className="v5-mock-cap">Counts illustrative — every deploy is tracked in your shared changelog.</p>
    </BrowserChrome>
  );
}

function ReportingMock() {
  return (
    <BrowserChrome>
      <div className="v5-msg-mock">
        <div className="v5-msg-head">
          <span className="v5-msg-avatar">L</span>
          <div>
            <b>LoudFace</b>
            <span>1:39pm</span>
          </div>
        </div>
        <p className="v5-msg-text">Here&rsquo;s your monthly report:</p>
        <div className="v5-msg-stats">
          <span>97.8% visibility</span>
          <span>+288% conv.</span>
          <span>8 pages live</span>
        </div>
      </div>
    </BrowserChrome>
  );
}

const PROCESS_MOCKS = [OnboardingMock, StrategyMock, ExecutionMock, ReportingMock];

function S4Process() {
  return (
    <section className="v5-sec v5-s4">
      <div className="v5-sec-head">
        <span className="v5-kicker">The process</span>
        <h2>What working with us looks like</h2>
        <p>Structured, transparent, built to move fast.</p>
      </div>
      <div className="v5-process-rail" />
      <div className="v5-process-cols">
        {PROCESS_COLS.map((c, i) => {
          const Mock = PROCESS_MOCKS[i];
          return (
            <div className="v5-process-col" key={c.gate}>
              <div className="v5-process-gate">
                <span className="v5-process-node" />
                <span>{c.gate}</span>
              </div>
              <Mock />
              <h3>{c.title}</h3>
              <ul className="v5-check-rows">
                {c.includes.map((item) => (
                  <li key={item}>
                    <b>✓</b>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================================
   S5 — Comparison
   ========================================================================== */

type CompareMark = 'check' | 'partial' | 'x';

function Mark({ mark }: { mark: CompareMark }) {
  if (mark === 'check') return <span className="v5-mark-check">✓</span>;
  if (mark === 'partial') return <span className="v5-mark-partial">–</span>;
  return <span className="v5-mark-x">✕</span>;
}

const CRITERIA = ['Strategy & positioning', 'Content production', 'Technical SEO/AEO', 'Conversion design', 'Reporting'];

const COMPARE_ROWS: { name: string; descriptor: string; marks: CompareMark[]; solid?: boolean }[] = [
  {
    name: 'LoudFace',
    descriptor: 'The whole chain, run and answered for as one system.',
    marks: ['check', 'check', 'check', 'check', 'check'],
    solid: true,
  },
  {
    name: 'In-house marketer',
    descriptor: 'Owns strategy, but rarely has the bandwidth to ship pages weekly.',
    marks: ['check', 'partial', 'x', 'x', 'partial'],
  },
  {
    name: 'SEO tool subscription',
    descriptor: 'Surfaces the gap. Someone still has to close it.',
    marks: ['x', 'x', 'partial', 'x', 'partial'],
  },
  {
    name: 'Freelance specialist',
    descriptor: 'Strong in one lane — content, or links, or CRO, rarely all three.',
    marks: ['partial', 'partial', 'partial', 'partial', 'x'],
  },
];

function S5Comparison() {
  return (
    <section className="v5-sec v5-s5">
      <div className="v5-sec-head v5-sec-head-center">
        <span className="v5-kicker">Why one partner</span>
        <h2>The whole system, not the pieces</h2>
        <p>Most routes sell you one part of it: the words, the links, the tool. We run the whole chain and answer for the outcome.</p>
      </div>
      <div className="v5-compare-header">
        <span className="v5-compare-header-name" />
        {CRITERIA.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      <div className="v5-compare-rows">
        {COMPARE_ROWS.map((r) => (
          <div key={r.name} className={`v5-compare-row${r.solid ? ' is-solid' : ''}`}>
            <div className="v5-compare-name">
              <b>{r.name}</b>
              <span>{r.descriptor}</span>
            </div>
            <div className="v5-compare-marks">
              {r.marks.map((m, i) => (
                <Mark mark={m} key={CRITERIA[i]} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="v5-compare-foot">
        <span className="v5-dot" />
        Every path can work — one comes with the whole system.
      </p>
    </section>
  );
}

/* ============================================================================
   S6 — Selected work grid
   ========================================================================== */

const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
const CROP = '?w=1200&fm=webp&q=82';

const WORK_FEATURE = {
  slug: 'dimer-health',
  asset: '467a77e9756e7890f1c62874d3388937727c4c6e-2880x1800.png',
  client: 'Dimer Health',
  claim: 'A rebuilt conversion path took the booking rate up 288% inside six months.',
  metric: '+288% conversions',
  tags: ['CRO', 'A/B testing', 'Webflow'],
};

const WORK_STACK: { slug: string; asset: string; client: string; line: string }[] = [
  {
    slug: 'toku-ai-cited-pipeline',
    asset: 'cafcfa6fadc9ea6d1d38391eda626fd12ff5e5a0-2880x1800.png',
    client: 'Toku',
    line: '0 → 97.8% AI visibility on the core prompt set.',
  },
  { slug: 'montblanc', asset: '9416b17af4983a14f8102906196363075cfd07ba-2880x1800.png', client: 'Montblanc', line: 'Microsite pages built for a global launch.' },
  { slug: 'hoxhunt', asset: 'ca8e0b9ee7bb6c5010f367586ed22def265a27a1-2880x1800.png', client: 'Hoxhunt', line: 'A content system built to ship weekly.' },
];

function srcFor(slug: string, asset: string, images: HomeImages) {
  const base = images[slug] ?? CDN + asset;
  return base + CROP;
}

function S6SelectedWork({ images }: { images: HomeImages }) {
  return (
    <section className="v5-sec v5-s6">
      <div className="v5-sec-head v5-sec-head-row">
        <div>
          <span className="v5-kicker">Selected work</span>
          <h2>Named clients, measured results</h2>
        </div>
        <Link href="/case-studies" className="v5-explore-link">
          Explore all case studies →
        </Link>
      </div>
      <div className="v5-work-grid">
        <Link href={`/case-studies/${WORK_FEATURE.slug}`} className="v5-work-feature">
          <div className="v5-work-feature-copy">
            <span className="v5-work-feature-client">{WORK_FEATURE.client}</span>
            <h3>{WORK_FEATURE.claim}</h3>
            <ul className="v5-case-tags">
              {WORK_FEATURE.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <span className="v5-work-feature-metric">{WORK_FEATURE.metric}</span>
          </div>
          <div
            className="v5-work-feature-shot"
            style={{ backgroundImage: `url(${srcFor(WORK_FEATURE.slug, WORK_FEATURE.asset, images)})` }}
          />
        </Link>
        <div className="v5-work-stack">
          {WORK_STACK.map((w) => (
            <Link key={w.slug} href={`/case-studies/${w.slug}`} className="v5-work-compact">
              <div className="v5-work-compact-shot" style={{ backgroundImage: `url(${srcFor(w.slug, w.asset, images)})` }} />
              <div className="v5-work-compact-copy">
                <b>{w.client}</b>
                <span>{w.line}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================ */

export default async function HomeV5Preview() {
  const images = await getHomeV3Images();

  return (
    <main className="hpv3 v5">
      <div className="v5-intro">
        <div className="container">
          <span className="v5-kicker">Concept — v5</span>
          <h1>Six sections, six reference compositions, rebuilt in LoudFace tokens.</h1>
        </div>
      </div>

      <div className="container">
        <S1CaseProof />
      </div>

      <S2System />

      <S3Testimonial />

      <div className="container">
        <S4Process />
        <S5Comparison />
        <S6SelectedWork images={images} />
      </div>
    </main>
  );
}
