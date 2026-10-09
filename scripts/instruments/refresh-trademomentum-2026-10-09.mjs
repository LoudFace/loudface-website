/**
 * Refresh the TradeMomentum case study's weekly-clicks headline to the week of
 * 21 Sep 2026, its highest week, and extend the daily Google chart to 4 Oct
 * (the last complete week on 9 Oct). The week after the high is published too.
 *
 * Only the clicks headline moves. The AI figures were re-measured on 9 Oct:
 * "trading communities" visibility is still 49.2% at its peak and lower since,
 * and the cited position is unchanged, so they keep their dated windows.
 *
 * Input: --gsc <JSON { dec: {days, clicks, impressions}, baselineWeek: {start,
 * clicks}, daily: [[date, clicks, impressions], …] from 14 Sep 2026 }>, pulled
 * from sc-domain:trademomentum.org. Raw counts never leave this script.
 *
 * The shipped 8.3x and the 25 Sep chart point must reproduce, and every
 * replaced sentence must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-trademomentum-2026-10-09.mjs --gsc <f> [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const gscPath = args[args.indexOf('--gsc') + 1];
if (!gscPath || gscPath.startsWith('--')) throw new Error('--gsc <file> is required');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = '760323db-23d1-461e-ae13-f3877d00e24e';
const END = '2026-10-04';

const g = JSON.parse(readFileSync(gscPath, 'utf8'));
const decClk = g.dec.clicks / g.dec.days;
const decImp = g.dec.impressions / g.dec.days;
const base = g.baselineWeek.clicks;
const week = (start) => {
  const days = g.daily.filter(([d]) => d >= start && d < new Date(Date.parse(`${start}T00:00:00Z`) + 7 * 864e5).toISOString().slice(0, 10));
  if (days.length !== 7) throw new Error(`week of ${start} has ${days.length} days`);
  return days.reduce((t, [, c]) => t + c, 0);
};
const r1 = (v) => Math.round(v * 10) / 10;

// shipped figures must reproduce
const day25 = g.daily.find(([d]) => d === '2026-09-25');
if (r1(week('2026-09-14') / base) !== 8.3) throw new Error(`week of 14 Sep = ${week('2026-09-14') / base}x, shipped 8.3x`);
if (Math.round((day25[1] / decClk) * 100) !== 510 || Math.round((day25[2] / decImp) * 100) !== 1425) throw new Error('25 Sep chart point does not reproduce');

const high = r1(week('2026-09-21') / base);
const after = r1(week('2026-09-28') / base);
if (high !== 9.1 || after !== 7) throw new Error(`copy says 9.1x then 7.0x, data says ${high}x then ${after}x`);
if (week('2026-09-21') <= week('2026-09-14')) throw new Error('week of 21 Sep is not the high');

const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
const swap = (text, pairs, field) => {
  let out = text;
  for (const [from, to, count = 1] of pairs) {
    const n = out.split(from).length - 1;
    if (n !== count) throw new Error(`${field}: expected ${count} match(es), found ${n}: "${from.slice(0, 90)}…"`);
    out = out.split(from).join(to);
  }
  return out;
};

const mainBody = swap(doc.mainBody, [
  [
    "TradeMomentum's Google clicks per week grew 8.3x from the week the engagement began, 1 to 7 September 2025, to the week of 14 September 2026, and the curve ends at its high.",
    "TradeMomentum's Google clicks per week grew 9.1x from the week the engagement began, 1 to 7 September 2025, to the week of 21 September 2026, its highest week on record; the week after held at 7.0x.",
  ],
  [
    'Weekly Google clicks grew <strong>8.3x</strong> from 1 to 7 September 2025, the week the engagement began, to the week of 14 September 2026, and that latest complete week is the highest on record rather than a plateau.',
    'Weekly Google clicks grew <strong>9.1x</strong> from 1 to 7 September 2025, the week the engagement began, to the week of 21 September 2026, the highest week on record (updated 9 October 2026; the week of 28 September came in at 7.0x).',
  ],
  ['<td>14 to 20 Sep 2026</td><td><strong>8.3x</strong></td>', '<td>21 to 27 Sep 2026</td><td><strong>9.1x</strong></td>'],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [[
  'grew 8.3x from the week the engagement began, 1 to 7 September 2025, to the week of 14 September 2026, ending at its high.',
  'grew 9.1x from the week the engagement began, 1 to 7 September 2025, to the week of 21 September 2026, its highest week.',
]], 'paragraphSummary');

const pr = doc.instruments.publishedResult;
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => (r._key !== 'r-1' ? r : { ...r, value: swap(r.value, [['8.3x', '9.1x']], 'publishedResult') })),
  caption: swap(pr.caption, [['clicks per week, week of 1 Sep 2025 to week of 14 Sep 2026;', 'clicks per week, week of 1 Sep 2025 to week of 21 Sep 2026;']], 'publishedResult.caption'),
};

const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== '2026-09-25') throw new Error(`chart ends ${last.date}`);
let n = Number(last._key.slice(2));
const add = g.daily.filter(([d]) => d > last.date && d <= END).map(([d, c, i]) => ({
  _key: `d-${++n}`, date: d, month: d.startsWith('2026-10') ? 'Oct' : 'Sep',
  clicks: Math.round((c / decClk) * 100), impressions: Math.round((i / decImp) * 100),
}));
const indexedTrend = { ...it, points: [...it.points, ...add], caption: swap(it.caption, [['Daily to 25 Sep 2026,', 'Daily to 4 Oct 2026,']], 'indexedTrend.caption') };

const patch = {
  result1Number: `${high}x`,
  result1Title: 'Google clicks per week, week of 1 Sep 2025 → week of 21 Sep 2026, its highest week',
  paragraphSummary,
  mainBody,
  'instruments.publishedResult': publishedResult,
  'instruments.indexedTrend': indexedTrend,
  'instruments.gscSource': 'Google Search Console · indexed to Dec 2025 = 100 · to 4 Oct 2026',
};

console.log({ high, after, added: add.length, lastPoint: add.at(-1) });
if (!WRITE) { console.log('dry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
