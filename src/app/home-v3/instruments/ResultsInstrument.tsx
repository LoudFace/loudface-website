'use client';

import { RingChart, Ring, RingCenter, BarChart, Bar, BarXAxis, Grid, ChartTooltip } from '@/components/charts';

/**
 * ResultsInstrument — "Numbers, not adjectives".
 *
 * Rev 3: the charts are Bklit UI components (bklit.com, MIT, visx + motion),
 * installed unmodified into src/components/charts. Nothing here re-implements a
 * chart. The only change from stock Bklit is colour: its `--chart-*` variables
 * are re-pointed to the LoudFace indigo ramp in instruments.css, which is how
 * the library is meant to be themed.
 *
 * Integrity, deliberate: both figures already ship on this site — Toku's 97.8%
 * AI visibility and Dimer Health's +288% conversions. Neither chart invents an
 * intermediate series: the ring shows one measured share, and the bar chart
 * shows the two measured states of one test. Chart ink is house indigo, never a
 * client brand colour (logged rule, 2026-08-19).
 */

/* One ring, not two: Bklit's RingCenter shows the SUM of the rings, so a second
   "not cited" slice would make the centre read 100 instead of the measured
   figure. A single 97.8-of-100 ring renders the remainder as the track anyway. */
const VISIBILITY = [{ label: 'Cited', value: 97.8, maxValue: 100 }];

/* Conversions on the rebuilt page against the control, indexed to control=100.
   +288% is the measured lift, so the rebuilt bar is 388. */
const CONVERSION = [
  { state: 'Control', conversions: 100 },
  { state: 'Rebuilt page', conversions: 388 },
];

const QUOTES = [
  {
    quote: 'It was very refreshing working with you compared to other agencies we’re working with.',
    who: 'Anthony Dean',
    org: 'Radisson Hotels Group',
  },
  {
    quote: 'We are extremely happy with the landing page LoudFace built for us on Webflow.',
    who: 'Daan Smit',
    org: 'CEO & Founder, Brandfirm',
  },
];

export function ResultsInstrument() {
  return (
    <div className="resi">
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

      <div className="resi-row">
        {QUOTES.map((q) => (
          <article key={q.who} className="resi-quote">
            <blockquote>“{q.quote}”</blockquote>
            <p className="resi-who">
              {q.who} <span>· {q.org}</span>
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
