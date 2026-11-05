/**
 * Give the Genie Teacher case study its own weekly clicks series (instruments.clickGrowth), 5 Nov 2026.
 *
 * Until now the "Google clicks per week" chart was summed from the daily indexedTrend points, which end on 22 Oct
 * where the impressions line peaks (never end a chart on a dip, Arnel, 18 Oct 2026). After the 5 Nov refresh the
 * clicks card reads 80× (7 days to 3 Nov) while that chart stopped in mid-October. caseSeries() prefers a published
 * clickGrowth series, so this one carries clicks to the newest complete week without moving the impressions chart.
 *
 * Same shape the page drew before: ISO weeks (Monday start), indexed to the week the engagement began (week of
 * 29 Jun, engagementStart 5 Jul) = 100, ending at the highest week. Raw counts never leave this script.
 *
 * Input: --gsc <gsc-cli --dimensions date --json for sc-domain:genieteacher.com, to 3 Nov 2026>.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/genie-click-growth-2026-11-05.mjs --gsc <f> [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const gscPath = args[args.indexOf('--gsc') + 1];
if (!args.includes('--gsc') || !gscPath || gscPath.startsWith('--')) throw new Error('--gsc <file> is required');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });
const DOC_ID = 'caseStudy-genie-teacher-organic-growth';
const FIRST = '2026-06-29';
const LAST = '2026-10-26'; // 26 Oct – 1 Nov, the newest complete Monday week in data to 3 Nov

const rows = JSON.parse(readFileSync(gscPath, 'utf8')).rows.map((r) => [r.keys[0], r.clicks]);
const byDay = new Map(rows);
const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const weeks = [];
for (let w = FIRST; w <= LAST; w = plus(w, 7)) {
  let t = 0;
  for (let i = 0; i < 7; i++) {
    const v = byDay.get(plus(w, i));
    if (v === undefined) throw new Error(`missing day ${plus(w, i)}`);
    t += v;
  }
  weeks.push([w, t]);
}
const base = weeks[0][1];
const points = weeks.map(([w, t]) => ({ _key: `cg-${w}`, week: w, value: Math.round((t / base) * 100) }));
const top = points.reduce((a, b) => (b.value > a.value ? b : a));
if (top.week !== LAST) throw new Error(`highest week is ${top.week}, not ${LAST}: end the series there`);

const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (doc.instruments.clickGrowth) throw new Error('clickGrowth already exists');
if (doc.result2Number !== '80×') throw new Error('expected the 5 Nov refresh (result2 80×) to be live first');

const clickGrowth = {
  _type: 'object',
  title: 'Google clicks per week',
  baselineLabel: 'the week the work began',
  source: 'Google Search Console · weekly, Monday start · 29 Jun – 1 Nov 2026',
  points,
};
console.log(JSON.stringify({ weeks: points.length, last: points.at(-1).week, lastIndex: points.at(-1).value }, null, 1));
if (!WRITE) { console.log('dry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set({ 'instruments.clickGrowth': clickGrowth }).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
