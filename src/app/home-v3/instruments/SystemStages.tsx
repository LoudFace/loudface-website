'use client';

import { useId, useState } from 'react';
import { BarChart, Bar, BarXAxis, Grid, ChartTooltip, FunnelChart } from '@/components/charts';

/**
 * SystemStages — "one system, four stages". Each stage swaps a written
 * explanation AND a drawn instrument that shows that stage's work.
 *
 * Rev 3: the charts are Bklit UI components (bklit.com, MIT, visx + motion),
 * installed unmodified into src/components/charts — hand-drawn SVG charts were
 * the previous pass's mistake. The only change from stock Bklit is colour: its
 * `--chart-*` variables are re-pointed to the LoudFace indigo ramp in
 * instruments.css, which is how the library is meant to be themed.
 *
 * The page-architecture figure below is still a hand-drawn SVG, deliberately:
 * no component library carries a site-tree diagram, and faking one out of a
 * chart would be worse than drawing the diagram it actually is.
 *
 * Switcher structure was harvested from Aceternity's Tabs and then rebuilt.
 * Removed: the 3D card-stack behind the panel (a gimmick that flattens to one
 * card on our ground), `type:'spring', bounce:.3` and the `y:[0,40,0]` hop (both
 * overshoot — banned under calm-operator motion), and the library palette.
 * Added: a real tablist/tab/tabpanel contract with arrow-key roving focus, which
 * the harvested component had none of. Every panel stays in the DOM, so the full
 * text is served to crawlers and to a reader with JavaScript off.
 */

type Stage = {
  key: string;
  tab: string;
  title: string;
  body: string;
  includes: string[];
  instrument: React.ReactNode;
};

/* Shared SVG defs — one hatch pattern, referenced by every chart. */
function ChartDefs({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="1.4" opacity=".45" />
      </pattern>
    </defs>
  );
}

/* ---------------------------------------------------- 1. term map (bar chart) */

function TermMap() {
  const rows = [
    { term: 'Head term', score: 100 },
    { term: 'Problem', score: 62 },
    { term: 'Comparison', score: 44 },
    { term: 'Pricing', score: 34 },
    { term: 'Integration', score: 28 },
    { term: 'Alternative', score: 22 },
    { term: 'Use case', score: 17 },
    { term: 'Migration', score: 11 },
  ];

  return (
    <figure className="ip">
      <div className="ip-head">
        <h4>Term map</h4>
        <span className="ip-meta">64 terms scored</span>
      </div>
      <div className="ip-body">
        <BarChart data={rows} xDataKey="term" aspectRatio="2.3 / 1">
          <Grid horizontal />
          <Bar dataKey="score" fill="var(--chart-line-primary)" lineCap="round" />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
      </div>
      <figcaption className="ip-foot">+56 more terms scored in week 1 — illustrative shape.</figcaption>
    </figure>
  );
}

/* -------------------------------------------- 2. page architecture (diagram) */

function PageArchitecture() {
  const cols = [140, 280, 420];
  return (
    <figure className="ip">
      <div className="ip-head">
        <h4>Page architecture</h4>
        <span className="ip-meta">Fig. 04</span>
      </div>
      <div className="ip-body">
        <svg viewBox="0 0 560 240" role="img" aria-label="A page tree: the homepage owns the category term, three cluster pages sit under it, and nine supporting pages sit under those.">
          {/* root */}
          <rect x={180} y={14} width={200} height={30} className="ser-bar" />
          <text x={280} y={33} textAnchor="middle" fill="#fff" className="ax" style={{ fontSize: 10.5 }}>
            Homepage · category term
          </text>

          {/* trunk + bus */}
          <line x1={280} y1={44} x2={280} y2={66} className="axis-line" />
          <line x1={cols[0]} y1={66} x2={cols[2]} y2={66} className="axis-line" />
          {cols.map((cx) => (
            <line key={cx} x1={cx} y1={66} x2={cx} y2={86} className="axis-line" />
          ))}

          {/* cluster row */}
          {['Use case', 'Comparison', 'Integration'].map((label, i) => (
            <g key={label}>
              <rect x={cols[i] - 62} y={86} width={124} height={28} fill="none" className="axis-line" />
              <text x={cols[i]} y={104} textAnchor="middle" className="ax-num" style={{ fontSize: 11 }}>
                {label}
              </text>
              <line x1={cols[i]} y1={114} x2={cols[i]} y2={134} className="axis-line" />
              <line x1={cols[i] - 44} y1={134} x2={cols[i] + 44} y2={134} className="axis-line" />
              {[-44, 0, 44].map((dx) => (
                <g key={dx}>
                  <line x1={cols[i] + dx} y1={134} x2={cols[i] + dx} y2={150} className="axis-line" />
                  <rect x={cols[i] + dx - 16} y={150} width={32} height={22} className="ser-ghost" />
                  <rect x={cols[i] + dx - 16} y={150} width={32} height={22} fill="none" className="grid-line" />
                </g>
              ))}
            </g>
          ))}

          <line x1={20} y1={200} x2={540} y2={200} className="grid-line" />
          <text x={20} y={222} className="ax">
            One page · one job · one parent
          </text>
          <text x={540} y={222} textAnchor="end" className="ax-num">
            13 pages
          </text>
        </svg>
      </div>
      <figcaption className="ip-foot">
        Clean structure is what lets a search engine rank you and a language model quote you without guessing.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------ 3. citation tracker (bar chart) */

function CitationTracker() {
  const engines = [
    { engine: 'ChatGPT', share: 82 },
    { engine: 'Gemini', share: 68 },
    { engine: 'Perplexity', share: 74 },
    { engine: 'AI Overviews', share: 41 },
  ];

  return (
    <figure className="ip">
      <div className="ip-head">
        <h4>Citation tracker</h4>
        <span className="ip-meta">Prompt set · 24 questions</span>
      </div>
      <div className="ip-body">
        <BarChart data={engines} xDataKey="engine" aspectRatio="2.6 / 1">
          <Grid horizontal />
          <Bar dataKey="share" fill="var(--chart-line-primary)" lineCap="round" />
          <BarXAxis />
          <ChartTooltip />
        </BarChart>
      </div>
      <figcaption className="ip-foot">
        Share of the tracked prompts where the answer names you, per assistant. Illustrative shape.
      </figcaption>
    </figure>
  );
}

/* --------------------------------------- 4. conversion test (bar comparison) */

function PipelineFunnel() {
  /* Proportions are an illustrative shape, and the caption says so. No client's
     real funnel numbers are published here. */
  const stages = [
    { label: 'Organic visitors', value: 100 },
    { label: 'Read the page', value: 46 },
    { label: 'Reached the CTA', value: 19 },
    { label: 'Booked a call', value: 7 },
  ];

  return (
    <figure className="ip">
      <div className="ip-head">
        <h4>Where the traffic goes</h4>
        <span className="ip-meta">Indexed to 100 visitors</span>
      </div>
      <div className="ip-body">
        <FunnelChart data={stages} />
      </div>
      <figcaption className="ip-foot">
        Visibility is only half of it. The page that receives the traffic decides the rest. Illustrative shape.
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- stages */

const STAGES: Stage[] = [
  {
    key: 'discover',
    tab: 'Find the demand',
    title: 'Find the terms that lead to a customer',
    body: 'We score your category by route to revenue, not by search volume. That gives one term your homepage has to own, and the cluster of questions your buyers ask on the way there.',
    includes: ['Category and positioning research', 'Buyer question mapping', 'Competitor gap analysis'],
    instrument: <TermMap />,
  },
  {
    key: 'rank',
    tab: 'Build the pages',
    title: 'Build pages Google can rank and a model can read',
    body: 'Each term gets one page with one job, sitting under one parent. Clean structure is what lets a search engine rank you and lets a language model quote you without guessing.',
    includes: ['Page and term architecture', 'Technical SEO', 'Content built to rank'],
    instrument: <PageArchitecture />,
  },
  {
    key: 'cite',
    tab: 'Get cited',
    title: 'Become the source the AI answer names',
    body: 'We track a fixed set of buyer prompts across the assistants your market uses, then work the pages, schema, and third-party mentions that decide who gets named in the answer.',
    includes: ['Prompt set and tracking', 'Schema and answer structure', 'Third-party mentions'],
    instrument: <CitationTracker />,
  },
  {
    key: 'convert',
    tab: 'Turn it into pipeline',
    title: 'Turn the visitors into booked calls',
    body: 'Visibility is only half of it. We rebuild the pages that receive the traffic, then test them, so the growth shows up in your pipeline instead of your traffic chart.',
    includes: ['Conversion copywriting', 'Page and UX rebuilds', 'Ongoing testing'],
    instrument: <PipelineFunnel />,
  },
];

export function SystemStages() {
  const [active, setActive] = useState(0);
  const uid = useId().replace(/:/g, '');

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const last = STAGES.length - 1;
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? last
          : e.key === 'ArrowRight'
            ? (active + 1) % STAGES.length
            : (active + last) % STAGES.length;
    setActive(next);
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  };

  return (
    <div className="stages">
      <div className="stage-tabs" role="tablist" aria-label="How the growth system works" onKeyDown={onKey}>
        {STAGES.map((s, i) => (
          <button
            key={s.key}
            id={`${uid}-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`${uid}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            className={`stage-tab${i === active ? ' is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            {s.tab}
          </button>
        ))}
      </div>

      <div className="stage-stack">
        {STAGES.map((s, i) => (
          <div
            key={s.key}
            id={`${uid}-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`${uid}-tab-${i}`}
            className={`stage-panel${i === active ? ' is-active' : ''}`}
            aria-hidden={i === active ? undefined : true}
          >
            <div className="stage-copy">
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <p className="stage-inc-label">What it covers</p>
              <ul className="stage-inc">
                {s.includes.map((inc) => (
                  <li key={inc}>{inc}</li>
                ))}
              </ul>
            </div>
            <div className="stage-inst">{s.instrument}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
