import type { Metadata } from 'next';
import '../../../home-v3/home-v3.css';
import '../../../home-v3/instruments/instruments.css';
import '../../../../components/harvested/beautifului-tokens.css';
import './home-v4.css';

import { RingChart, Ring, RingCenter, BarChart, Bar, BarXAxis, Grid, ChartTooltip } from '@/components/charts';
import { SystemStages } from '../../../home-v3/instruments/SystemStages';
import { SystemMatrix } from '../../../home-v3/instruments/SystemMatrix';
import { CHIPS_HTML } from '../../../home-v3/_chips';
import { getHomeV3Images, type HomeImages } from '../../../home-v3/data';
import { Timeline } from '@/components/harvested/aceternity/timeline';
import { BentoGrid, BentoGridItem } from '@/components/harvested/aceternity/bento-grid';

/**
 * Preview-only route — the MERGED homepage concept. Replaces the two weaker
 * concept pages (home-instruments, home-transplant — both left untouched).
 *
 * Every section reuses a component from one of those two concepts, upgraded
 * per `~/.atelier/section-craft.md`. Where a source component (AnswerReadout,
 * ResultsInstrument) can't be extended without editing files under
 * `home-v3/**` — off limits for this build — its markup/data is recreated
 * locally instead of imported, so the original files stay byte-for-byte
 * untouched. SystemStages, SystemMatrix, Timeline, and BentoGrid are imported
 * and rendered verbatim.
 *
 * Not indexed, and not linked from the live site.
 */
export const metadata: Metadata = {
  title: 'Home v4 — merged concept preview',
  robots: { index: false, follow: false },
};

/* ============================================================ 1. THE PROBLEM
   AnswerReadout's two panels, recreated locally (rows/copy unchanged) with a
   dark chip strip added under each — the SAME chip markup/icons the live
   hero uses for "See what AI says about us" — plus one illustrative caption
   line per panel. */

type Row = { domain: string; state: 'cited' | 'absent'; you?: boolean };

const BEFORE: Row[] = [
  { domain: 'competitor-a.com', state: 'cited' },
  { domain: 'competitor-b.com', state: 'cited' },
  { domain: 'a-review-site.com', state: 'cited' },
  { domain: 'your-domain.com', state: 'absent', you: true },
];

const AFTER: Row[] = [
  { domain: 'your-domain.com', state: 'cited', you: true },
  { domain: 'competitor-a.com', state: 'cited' },
  { domain: 'competitor-b.com', state: 'cited' },
];

function ProblemPanel({
  title,
  meta,
  rows,
  foot,
}: {
  title: string;
  meta: string;
  rows: Row[];
  foot: React.ReactNode;
}) {
  return (
    <figure className="ip">
      <div className="ip-head">
        <h4>{title}</h4>
        <span className="ip-meta">{meta}</span>
      </div>
      <div className="ip-body">
        <p className="ans-prompt">
          <small>Buyer prompt</small>
          &ldquo;Best analytics platform for a Series B engineering team?&rdquo;
        </p>
        <ul className="ans-list">
          {rows.map((r, i) => (
            <li
              key={r.domain}
              className={[r.state === 'absent' ? 'is-absent' : '', r.you ? 'is-you' : ''].join(' ').trim() || undefined}
            >
              <span className="ans-rank">{r.state === 'absent' ? '—' : String(i + 1).padStart(2, '0')}</span>
              <span className="ans-domain">{r.domain}</span>
              <span className={`ans-chip ${r.state}`}>{r.state === 'absent' ? 'Not in the answer' : 'Cited'}</span>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="ip-foot">{foot}</figcaption>
      <div className="chip-strip">
        <div className="ai-row">
          <span className="ai-row-label">Same buyer prompt, asked across</span>
          <div className="ai-chips" dangerouslySetInnerHTML={{ __html: CHIPS_HTML }} />
        </div>
        <p className="panel-cap">Illustrative prompt — your set is built in week 1.</p>
      </div>
    </figure>
  );
}

function ProblemSection() {
  return (
    <div className="answer-pair">
      <ProblemPanel
        title="Answer sources, today"
        meta="Fig. 01"
        rows={BEFORE}
        foot={<>Asked across ChatGPT, Gemini, Perplexity, and Google AI Overviews.</>}
      />
      <ProblemPanel
        title="Answer sources, after the work"
        meta="Fig. 02"
        rows={AFTER}
        foot={
          <>
            <b>0 → 97.8%</b> visibility on the core prompt — measured on Toku.
          </>
        }
      />
    </div>
  );
}

/* ================================================== 2. WHAT WE DO — pull quote
   SystemStages renders verbatim (imported, untouched). One real pull-quote
   card sits underneath it — the Anthony Dean quote also used in section 4's
   sibling. SystemStages' tabs are mutually exclusive, so a single anchor
   quote below the whole component (rather than one per hidden tab panel) is
   the only way to pair a quote with this section without editing the
   component. */

function StagesQuote() {
  return (
    <div className="stage-quote">
      <blockquote>&ldquo;It was very refreshing working with you compared to other agencies we&rsquo;re working with.&rdquo;</blockquote>
      <footer>
        Anthony Dean <span>· Radisson Hotels Group</span>
      </footer>
    </div>
  );
}

/* ============================================== 3. NUMBERS, NOT ADJECTIVES
   The ring + bar plates from ResultsInstrument, recreated locally with the
   same data and markup, minus the quote row (both quotes relocate to
   sections 2 and 4) — so this section is the two chart plates full-width,
   side by side, only. */

const VISIBILITY = [{ label: 'Cited', value: 97.8, maxValue: 100 }];

const CONVERSION = [
  { state: 'Control', conversions: 100 },
  { state: 'Rebuilt page', conversions: 388 },
];

function ResultsCharts() {
  return (
    <div className="resi resi-charts-only">
      <div className="resi-pair">
        <figure className="ip">
          <div className="ip-head">
            <h4>AI visibility on the core buyer prompt</h4>
            <span className="ip-meta">Toku · AEO</span>
          </div>
          <div className="ip-body resi-ring">
            <RingChart data={VISIBILITY} size={240} strokeWidth={18}>
              {VISIBILITY.map((item, i) => (
                <Ring index={i} key={item.label} />
              ))}
              <RingCenter defaultLabel="% of prompts cited" formatOptions={{ maximumFractionDigits: 1, minimumFractionDigits: 1 }} />
            </RingChart>
            <div className="resi-side">
              <p className="resi-before">
                <b>0%</b>
                <span>Where they started — absent from the answer entirely.</span>
              </p>
              <p className="resi-after">
                <b>97.8%</b>
                <span>Share of the tracked prompt set that now names them.</span>
              </p>
            </div>
          </div>
          <figcaption className="ip-foot">
            Measured across the prompt set that decides their category, not a single lucky question.
          </figcaption>
        </figure>

        <figure className="ip">
          <div className="ip-head">
            <h4>Conversion test</h4>
            <span className="ip-meta">Dimer Health · 6 months</span>
          </div>
          <div className="ip-body">
            <BarChart data={CONVERSION} xDataKey="state">
              <Grid horizontal />
              <Bar dataKey="conversions" fill="var(--chart-line-primary)" lineCap="round" />
              <BarXAxis />
              <ChartTooltip />
            </BarChart>
          </div>
          <figcaption className="ip-foot">
            Conversions indexed to the control at 100. The rebuilt page ran <b>+288%</b> over six months of CRO work.
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

/* ===================================================== 4. THE ENGAGEMENT
   Aceternity Timeline (harvested, verbatim). Each entry's content is a dense
   mini-mock built from instruments.css's `.ip` / `.art-rows` plate classes.
   Second engagement quote (Daan Smit) follows the last entry. */

function ScopeSheetMock() {
  return (
    <figure className="ip tl-mock">
      <div className="ip-head">
        <h4>Scope sheet</h4>
        <span className="ip-meta">Fig. 05</span>
      </div>
      <div className="ip-body">
        <ul className="art-rows">
          <li>
            <span>Primary constraint identified</span>
            <b className="art-mark on">Scoped</b>
          </li>
          <li>
            <span>Work order, first 30 days</span>
            <b className="art-mark on">Scoped</b>
          </li>
          <li>
            <span>Monthly cost</span>
            <b className="art-mark on">Scoped</b>
          </li>
          <li>
            <span>What we would not touch yet</span>
            <b className="art-mark on">Scoped</b>
          </li>
          <li>
            <span>Kickoff call</span>
            <b className="art-mark filled">48h</b>
          </li>
        </ul>
      </div>
      <figcaption className="ip-foot">Sent within 48 hours of the strategy call.</figcaption>
    </figure>
  );
}

function AuditTableMock() {
  return (
    <figure className="ip tl-mock">
      <div className="ip-head">
        <h4>Audit table</h4>
        <span className="ip-meta">Fig. 06</span>
      </div>
      <div className="ip-body">
        <ul className="art-rows">
          <li>
            <span>Discovery</span>
            <b className="art-mark filled">Constraint</b>
          </li>
          <li className="is-blank">
            <span>Content</span>
            <b className="art-mark">Holding</b>
          </li>
          <li className="is-blank">
            <span>Conversion</span>
            <b className="art-mark">Holding</b>
          </li>
          <li className="is-blank">
            <span>Technical stack</span>
            <b className="art-mark">Holding</b>
          </li>
          <li className="is-blank">
            <span>Schema &amp; structured data</span>
            <b className="art-mark">Holding</b>
          </li>
        </ul>
        <p className="tl-more">+6 more line items — full list in your kickoff doc</p>
      </div>
      <figcaption className="ip-foot">Work starts at whichever row is the constraint.</figcaption>
    </figure>
  );
}

function ShippingLogMock() {
  return (
    <figure className="ip tl-mock">
      <div className="ip-head">
        <h4>Shipping log</h4>
        <span className="ip-meta">Fig. 07</span>
      </div>
      <div className="ip-body">
        <ul className="art-rows">
          <li>
            <span>Homepage rebuild</span>
            <b className="art-mark on">Live</b>
          </li>
          <li>
            <span>Pricing page</span>
            <b className="art-mark on">Live</b>
          </li>
          <li>
            <span>Case study template</span>
            <b className="art-mark on">Live</b>
          </li>
          <li>
            <span>Analytics baseline</span>
            <b className="art-mark">Running</b>
          </li>
          <li className="is-blank">
            <span>Blog category pages</span>
            <b className="art-mark">Queued</b>
          </li>
        </ul>
      </div>
      <figcaption className="ip-foot">Every deploy tracked in the shared changelog.</figcaption>
    </figure>
  );
}

function ReportMessageMock() {
  return (
    <div className="msg-mock">
      <div className="msg-head">
        <span className="msg-sender">LoudFace</span>
        <span className="msg-time">Monthly report</span>
      </div>
      <div className="msg-body">
        <div className="msg-row">
          <b>What we did</b>
          <p>The pages shipped and the tests run this month, in plain English.</p>
        </div>
        <div className="msg-row">
          <b>What moved</b>
          <p>Organic sessions and AI citations, tracked against your baseline.</p>
        </div>
        <div className="msg-row">
          <b>What is next</b>
          <p>The next constraint on the list — scoped and costed, same as week 0.</p>
        </div>
      </div>
    </div>
  );
}

const TIMELINE_DATA = [
  { title: 'Week 0', content: <ScopeSheetMock /> },
  { title: 'Weeks 1–4', content: <AuditTableMock /> },
  { title: 'Weeks 4–6', content: <ShippingLogMock /> },
  {
    title: 'Month 3+',
    content: (
      <>
        <ReportMessageMock />
        <div className="tl-quote">
          <blockquote>&ldquo;We are extremely happy with the landing page LoudFace built for us on Webflow.&rdquo;</blockquote>
          <footer>
            Daan Smit <span>· CEO &amp; Founder, Brandfirm</span>
          </footer>
        </div>
      </>
    ),
  },
];

/* ======================================================== 6. SELECTED WORK
   Aceternity BentoGrid (harvested, verbatim), wired with real case-study
   screenshots — the same slugs + hardcoded CDN fallbacks HeroV3 uses, so a
   Sanity fetch miss can never blank a tile. No invented clients or metrics:
   only Toku (0 → 97.8% AI visibility) and Dimer Health (+288% conversions)
   carry a metric, matching the two figures already measured on this site.
   Every other tile is name-only. A tile with no resolvable image is dropped
   rather than shown empty. */

const CDN = 'https://cdn.sanity.io/images/xjjjqhgt/production/';
const CROP = '?w=900&fm=webp&q=82';

type WorkTile = { slug: string; asset: string; client: string; metric?: string; big?: boolean; pos?: string };

const WORK_TILES: WorkTile[] = [
  // Toku's screenshot is a hero composite with a tall empty navy gradient
  // above the actual product/proof content — "center top" (the default every
  // other tile uses) crops straight into that dead space. Pin this one tile
  // to the bottom of the frame instead, where the browser mocks and the
  // 0 → 97.8% figure actually sit.
  { slug: 'toku-ai-cited-pipeline', asset: 'cafcfa6fadc9ea6d1d38391eda626fd12ff5e5a0-2880x1800.png', client: 'Toku', metric: '0 → 97.8% AI visibility', big: true, pos: 'center bottom' },
  { slug: 'dimer-health', asset: '467a77e9756e7890f1c62874d3388937727c4c6e-2880x1800.png', client: 'Dimer Health', metric: '+288% conversion lift', big: true },
  { slug: 'montblanc', asset: '9416b17af4983a14f8102906196363075cfd07ba-2880x1800.png', client: 'Montblanc' },
  { slug: 'hoxhunt', asset: 'ca8e0b9ee7bb6c5010f367586ed22def265a27a1-2880x1800.png', client: 'Hoxhunt' },
  { slug: 'radisson-hotels-group', asset: 'd7f6c041eab8e04c794c591227b7c4d9dfb94e86-2880x1800.png', client: 'Radisson' },
  { slug: 'liqid', asset: 'cafa9a84713495ea606a6b37badcc5691efac5a4-2880x1800.png', client: 'LIQID' },
  { slug: 'eraser', asset: 'f6e208a93b76d3fe7ed1fe83a7d8ea1dc29e5962-2880x1800.png', client: 'Eraser' },
  { slug: 'outbound-specialist', asset: '357651c0add5b9c0f1df95b591021decce87a8bc-2880x1800.png', client: 'Outbound' },
];

function srcFor(t: WorkTile, images: HomeImages) {
  const base = images[t.slug] ?? CDN + t.asset;
  return base ? base + CROP : null;
}

function SelectedWork({ images }: { images: HomeImages }) {
  const tiles = WORK_TILES.map((t) => ({ ...t, src: srcFor(t, images) })).filter((t) => t.src);

  return (
    <BentoGrid className="wk-bento md:grid-cols-4">
      {tiles.map((t) => (
        <BentoGridItem
          key={t.slug}
          className={t.big ? 'md:col-span-2' : undefined}
          header={
            <div
              className="wk-tile"
              style={{ backgroundImage: `url(${t.src})`, backgroundPosition: t.pos ?? 'center top' }}
            >
              <div className="wk-tile-meta">
                <span className="wk-tile-client">{t.client}</span>
                {t.metric && <span className="wk-tile-metric">{t.metric}</span>}
              </div>
            </div>
          }
        />
      ))}
    </BentoGrid>
  );
}

/* ========================================================================= */

export default async function HomeV4Preview() {
  const images = await getHomeV3Images();

  return (
    <main className="hpv3">
      <div className="ci ci-intro ci-light">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">Concept — merged</span>
            <h2>The best of both concepts, one page</h2>
            <p>
              Six sections, six different layouts, each carrying a working miniature of the thing it claims — replacing
              the two weaker concept pages this was built to merge.
            </p>
          </div>
        </div>
      </div>

      <section className="ci ci-light">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">The problem</span>
            <h2>Your buyers are asking. The answer names someone else.</h2>
            <p>
              Buyers now open an assistant before they open a search engine. If your pages are not built to be quoted,
              the answer they get is a list of your competitors — and you never enter the conversation.
            </p>
          </div>
          <ProblemSection />
        </div>
      </section>

      <section className="ci ci-dark">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">What we do</span>
            <h2>One system, four stages</h2>
            <p>
              From the single term your homepage has to own, through to the page that turns a visitor into a booked
              call. Pick a stage to see what the work actually looks like.
            </p>
          </div>
          <SystemStages />
          <StagesQuote />
        </div>
      </section>

      <section className="ci ci-light">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">Results</span>
            <h2>Numbers, not adjectives</h2>
          </div>
          <ResultsCharts />
        </div>
      </section>

      <section className="ci ci-light">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">The engagement</span>
            <h2>How an engagement works</h2>
            <p>
              No 47-slide proposals and no three-month discovery phase. Four gates, and what you receive at each one.
            </p>
          </div>
        </div>
        <div className="px-6 md:px-10 tl-wrap">
          <Timeline data={TIMELINE_DATA} />
        </div>
      </section>

      <section className="ci ci-dark">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">Why one partner</span>
            <h2>The whole system, not the pieces</h2>
            <p>
              Most routes sell you one part of it: the words, the links, the tool. We run the whole chain and answer for
              the outcome at the end of it.
            </p>
          </div>
          <SystemMatrix />
        </div>
      </section>

      <section className="ci ci-light">
        <div className="container">
          <div className="ci-head">
            <span className="ci-lede">Selected work</span>
            <h2>Named clients, measured results</h2>
          </div>
          <SelectedWork images={images} />
        </div>
      </section>
    </main>
  );
}
