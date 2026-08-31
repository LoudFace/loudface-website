'use client';

/**
 * The second board: traditional Google search.
 *
 * Deliberately a SEPARATE band from the AI one rather than more cells bolted
 * onto it. The two answer different questions — "does AI name them" and "does
 * Google rank them" — and mixing them into one grid makes a reader work out
 * which metric belongs to which engine. Two boards, same visual language, AI
 * first because that is the differentiated story and Google second because it
 * is the proof the same work compounds.
 *
 * The last cell is the join between them: the pages Google ranks are largely
 * the same pages AI cites. That overlap is the argument, and it only becomes
 * visible when both boards sit on one page.
 *
 * Numbers are indexed or share-based, never absolute counts — see data.ts.
 */

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  Background,
  ChartTooltip,
  Grid,
  XAxis,
} from '@/components/charts';
import { GoogleMark } from '@/app/case-detail-v3/EngineMarks';
import { GSC_SOURCE_NOTE, gscHeadline, gscMonthly, gscTopPages } from './data';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* Formatted by hand — `toLocaleDateString` resolves against the runtime's
   locale data, which differs between the server and the browser. */
const fmtMonth = (d: unknown) =>
  d instanceof Date ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : undefined;

/*
 * Client confidentiality: no exact click or impression totals on a public case
 * study. The series is indexed to Sep = 100, but the default tooltip printed
 * that index bare — "impressions 1,497" is indistinguishable from a real count
 * to anyone reading it. Printed as a multiple of the baseline instead.
 */
const asMultiple = (indexed: unknown) => {
  const n = Number(indexed);
  if (!Number.isFinite(n)) return '—';
  return `${(n / 100).toFixed(1)}× Sep`;
};

function Arrow() {
  return (
    <svg className="cin-arrow" width="24" height="10" viewBox="0 0 36 15" fill="none" aria-hidden="true">
      <path d="M1 7.5H25.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M23.5 1.4 35 7.5l-11.5 6.1z" fill="currentColor" />
    </svg>
  );
}

export function SearchInstruments({ clientName = 'TradeMomentum' }: { clientName?: string }) {
  const series = useMemo(
    () =>
      gscMonthly.map((m, i) => ({
        date: new Date(Date.UTC(2025, 8 + i, 1)),
        impressions: m.impressions,
        clicks: m.clicks,
      })),
    []
  );

  const overlap = gscTopPages.filter((p) => p.alsoCitedByAI);


  return (
    <div className="cin">
      <section className="cin-band" aria-label="Google search results">
        <header className="cin-head">
          <div>
            <p className="cin-eyebrow cin-eyebrow--marked">
              <GoogleMark size={14} />
              By the numbers · Google search
            </p>
            <h2 className="cin-title">And the same work compounding in Google</h2>
          </div>
          <p className="cin-source">{GSC_SOURCE_NOTE}</p>
        </header>

        <div className="cin-row cin-row--top">
          <div className="cin-cell cin-cell--chart">
            <div className="cin-cell-head">
              <p className="cin-cell-label">Impressions and clicks · indexed, Sep 2025 = 100</p>
              <div className="cin-legend">
                <span className="cin-legend-item">
                  <span className="cin-legend-rule" style={{ background: 'var(--chart-3)' }} />
                  Impressions
                </span>
                <span className="cin-legend-item">
                  <span className="cin-legend-rule" style={{ background: 'var(--chart-1)' }} />
                  Clicks
                </span>
              </div>
            </div>
            <div className="cin-cell-body">
              <div className="cin-plot">
                <AreaChart
                  data={series}
                  aspectRatio=""
                  style={{ height: '100%' }}
                  margin={{ top: 6, right: 8, bottom: 26, left: 8 }}
                >
                  <Background pattern="dots" opacity={0.6} />
                  <Grid horizontal />
                  <Area dataKey="impressions" fillOpacity={0.22} strokeWidth={2} stroke="var(--chart-3)" />
                  <Area dataKey="clicks" fillOpacity={0.3} strokeWidth={2} stroke="var(--chart-1)" />
                  <XAxis />
                  <ChartTooltip
                    content={({ point }) => (
                      <div className="cin-tip">
                        <p className="cin-tip-title">{fmtMonth(point.date)}</p>
                        <ul className="cin-tip-rows">
                          <li>
                            <span className="cin-tip-rule" style={{ background: 'var(--chart-3)' }} />
                            <span className="cin-tip-label">Impressions</span>
                            <span className="cin-tip-value">{asMultiple(point.impressions)}</span>
                          </li>
                          <li>
                            <span className="cin-tip-rule" style={{ background: 'var(--chart-1)' }} />
                            <span className="cin-tip-label">Clicks</span>
                            <span className="cin-tip-value">{asMultiple(point.clicks)}</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  />
                </AreaChart>
              </div>
            </div>
            <p className="cin-cell-foot">
              August is the first 24 days only. Impressions outran clicks — the pages entered far more
              results before climbing high enough in them to be clicked.
            </p>
          </div>

          <div className="cin-cell">
            <p className="cin-cell-label">Over {gscHeadline.window}</p>
            <div className="cin-cell-body">
              <div className="cin-figure">
                <span className="cin-figure-value">{gscHeadline.impressionsMultiple}×</span>
                <span className="cin-figure-unit">impressions</span>
              </div>
              <div className="cin-figure" style={{ marginTop: '0.875rem' }}>
                <span className="cin-figure-value">{gscHeadline.clicksMultiple}×</span>
                <span className="cin-figure-unit">clicks</span>
              </div>
              <div className="cin-transition" style={{ marginTop: '0.875rem' }}>
                <span>average position {gscHeadline.positionFrom}</span>
                <Arrow />
                <span>{gscHeadline.positionTo}</span>
              </div>
            </div>
            <p className="cin-cell-foot">
              {overlap.length} of the ten strongest pages in Google are also pages AI names when buyers ask
              — the same asset earning twice.
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}
