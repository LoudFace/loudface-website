/**
 * End the Delshad Legal "Google impressions per day" chart at its highest drawn
 * point (Arnel, 18 Oct 2026: do not end the chart on a dip).
 *
 * The case page draws instruments.indexedTrend as a trailing 7-day mean
 * (src/app/case-v11/series.ts), so the chart ends on the day that mean peaks:
 * 7 Oct 2026, 16.2× the March average. Points after it are dropped from the
 * chart only; the text keeps its 1–16 October figure (14.5×), and the caption
 * names both the end day and the peak.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/trim-delshad-impressions-2026-10-18.mjs [--write]
 */
import { createClient } from '@sanity/client';

const WRITE = process.argv.includes('--write');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-delshad-legal-content-engine';
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
const it = doc.instruments.indexedTrend;
if (it.points.at(-1).date !== '2026-10-16') throw new Error(`chart ends ${it.points.at(-1).date}, expected 2026-10-16`);

// same trailing mean as the page draws
const v = it.points.map((p) => p.impressions);
const mean = v.map((_, i) => { const w = v.slice(Math.max(0, i - 6), i + 1); return w.reduce((a, b) => a + b, 0) / w.length; });
const peak = mean.reduce((m, x, i) => (x > mean[m] ? i : m), 0);
const peakDate = it.points[peak].date;
const peakX = Math.round(mean[peak] / 10) / 10;
if (peakDate !== '2026-10-07' || peakX !== 16.2) throw new Error(`peak is ${peakDate} at ${peakX}×, copy says 7 Oct at 16.2×`);

const from = 'then 14.5× over 1–16 October. Daily to 16 Oct 2026,';
if (it.caption.split(from).length !== 2) throw new Error('caption changed');
const indexedTrend = {
  ...it,
  points: it.points.slice(0, peak + 1),
  caption: it.caption.replace(from, 'then 14.5× over 1–16 October, with the seven days to 7 October at 16.2×, the high so far. Daily to 7 Oct 2026,'),
};

console.log({ peakDate, peakX, dropped: it.points.length - indexedTrend.points.length, caption: indexedTrend.caption });
if (!WRITE) { console.log('dry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set({ 'instruments.indexedTrend': indexedTrend }).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
