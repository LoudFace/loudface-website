/**
 * Give the Toku case study a monthly Google impressions series (instruments.indexedTrend) and its published figure
 * (instruments.publishedResult row "impressions"), so the homepage results rail can draw Toku (Arnel, 2026-10-10:
 * "why isn't Toku here?"). Both come from the study's own chart "Organic search impressions climb (Sep 2025 to Jan
 * 2026)": its monthly values are re-indexed to September 2025 = 100, and its last label (+335%) is the figure. Nothing is
 * typed: the script stops if that chart's title, months or final label change.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/set-toku-impressions-trend-2026-10-10.mjs [--write]
 */
import { createClient } from '@sanity/client';

const WRITE = process.argv.includes('--write');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token: process.env.SANITY_API_TOKEN, useCdn: false });
const DOC_ID = '0991ec36-3e3b-4b79-84ee-e7a46337be03';

const doc = await client.getDocument(DOC_ID);
if (doc?.slug?.current !== 'toku-ai-cited-pipeline') throw new Error('not the Toku case study');
const chart = doc.charts?.find((c) => c.title === 'Organic search impressions climb (Sep 2025 to Jan 2026)');
if (!chart) throw new Error('impressions chart not found');
const months = chart.data.map((d) => d.label);
if (months.join() !== 'Sep,Oct,Nov,Dec,Jan') throw new Error(`months are ${months.join()}`);
const figure = chart.data.at(-1).displayValue;
const base = chart.data[0].value;
const growth = Math.round((chart.data.at(-1).value / base - 1) * 100);
if (figure !== `+${growth}%`) throw new Error(`last label ${figure} does not match the values (+${growth}%)`);

const DATES = ['2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01', '2026-01-01'];
const indexedTrend = {
  _type: 'object',
  title: 'Google impressions per month, indexed to September 2025',
  baselineLabel: 'Sep 2025',
  startMonthIso: '2025-09',
  caption: `Monthly Google organic impressions over the core engagement window, September 2025 to January 2026, indexed to September = 100: ${figure} by January.`,
  points: chart.data.map((d, i) => ({ _key: `m-${i}`, _type: 'object', month: d.label, date: DATES[i], impressions: Math.round((d.value / base) * 100) })),
};
const row = { _key: 'impressions', _type: 'object', value: figure, unit: 'Google organic impressions a month, September 2025 → January 2026' };
const rows = (doc.instruments?.publishedResult?.rows ?? []).filter((r) => r._key !== 'impressions');

console.log(indexedTrend.points.map((p) => `${p.date} ${p.impressions}`).join('\n'), '\n', row);
if (!WRITE) { console.log('dry run'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev)
  .set({ 'instruments.indexedTrend': indexedTrend, 'instruments.gscSource': 'Google Search Console · monthly · Sep 2025 – Jan 2026', 'instruments.publishedResult.rows': [...rows, row] })
  .commit();
console.log(`patched rev ${res._rev}`);
