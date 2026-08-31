/**
 * Chart gallery for the case-study redesign — a decision surface, not a public
 * page. Every recipe Arnel shortlisted, rendered against real Peec AI data, so
 * the pick is made on how the charts read with our own numbers in them.
 *
 * Kept out of the index and out of the sitemap: it sits under /dev-preview
 * alongside the other in-progress surfaces.
 */
import type { Metadata } from 'next';
import './case-study-charts.css';
import { ChartGallery, EngineStrip } from './ChartGallery';
import { SOURCE_NOTE } from './data';

export const metadata: Metadata = {
  title: 'Case-study chart gallery',
  robots: { index: false, follow: false },
};

export default function CaseStudyChartsPage() {
  return (
    <main className="csc">
      <div className="csc-shell">
        <p className="csc-eyebrow">Case-study instruments · working draft</p>
        <h1 className="csc-h1">Thirteen ways to show an AI-search result</h1>
        <p className="csc-lede">
          Every chart below is drawn from our own Peec AI account — the same measurement we sell.
          Nothing is illustrative and nothing is indexed to a made-up baseline. Where a chart needed
          a series we do not hold, it was cut rather than filled with a plausible shape.
        </p>
        <p className="csc-lede">
          Colour is one indigo in five values. The engine is named by its own mark, so the series
          stay separable without relying on hue.
        </p>

        <EngineStrip />

        <ChartGallery />

        <p className="csc-source" style={{ marginTop: '2.5rem' }}>
          {SOURCE_NOTE} · 90 tracked buyer prompts · roughly 1,860 AI answers monitored a week
        </p>
      </div>
    </main>
  );
}
