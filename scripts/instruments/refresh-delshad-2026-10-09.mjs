/**
 * Refresh the Delshad Legal case study's Google clicks headline to the week of
 * 27 Sep 2026 (Sunday-start, the last complete week on 9 Oct) and extend the
 * daily Google chart to 3 Oct.
 *
 * Only the Google clicks figure moves. On 9 Oct the 30-day AI share of voice
 * read 30.1% (published 32.4%) and enquiries 2.63× (published 2.7×), so those
 * keep their dated windows.
 *
 * Input: --gsc <JSON { mar: {days, clicks, impressions}, nonCelebrityWeeks:
 * {weekStart: clicks}, daily: [[date, clicks, impressions], …] from 25 Sep }>.
 * nonCelebrityWeeks sums daily page rows of sc-domain:delshadlegal.com that do
 * not match the celebrity-page pattern in refresh-delshad-2026-09-28.mjs
 * (/tyler-perry|dixon|jasmine|kingvicann|masked-singer|mario-barrett|derek|
 * rodriguez-v-perry/i). Raw counts never leave this script.
 *
 * Shipped weeks (7 Jun 52, 23 Aug 317, 30 Aug 292, 6 Sep 293, 13 Sep 7.6×) and
 * the 25 Sep chart point must reproduce, and every replaced sentence must exist
 * exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-delshad-2026-10-09.mjs --gsc <f> [--write]
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

const DOC_ID = 'caseStudy-delshad-legal-content-engine';
const END = '2026-10-03';

const g = JSON.parse(readFileSync(gscPath, 'utf8'));
const w = g.nonCelebrityWeeks;
const r1 = (v) => Math.round(v * 10) / 10;
for (const [s, v] of [['2026-06-07', 52], ['2026-08-23', 317], ['2026-08-30', 292], ['2026-09-06', 293]]) if (w[s] !== v) throw new Error(`week of ${s} = ${w[s]}, shipped ${v}`);
if (r1(w['2026-09-13'] / w['2026-06-07']) !== 7.6) throw new Error('week of 13 Sep does not reproduce 7.6×');
const marClk = g.mar.clicks / g.mar.days;
const marImp = g.mar.impressions / g.mar.days;
const d25 = g.daily.find(([d]) => d === '2026-09-25');
if (Math.round((d25[1] / marClk) * 100) !== 897 || Math.round((d25[2] / marImp) * 100) !== 930) throw new Error('25 Sep chart point does not reproduce');

const latest = r1(w['2026-09-27'] / w['2026-06-07']);
const prior = r1(w['2026-09-20'] / w['2026-06-07']);
if (latest !== 14.8 || prior !== 9.8) throw new Error(`copy says 9.8× then 14.8×, data says ${prior}× then ${latest}×`);

const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
const swap = (text, pairs, field) => {
  let out = text;
  for (const [from, to] of pairs) {
    const n = out.split(from).length - 1;
    if (n !== 1) throw new Error(`${field}: expected 1 match, found ${n}: "${from.slice(0, 90)}…"`);
    out = out.replace(from, to);
  }
  return out;
};

const mainBody = swap(doc.mainBody, [
  [
    'Google clicks per week outside the celebrity-case pages are 7.6× the week of 7 June, measured in Google Search Console for the week of 13 September,',
    'Google clicks per week outside the celebrity-case pages are 14.8× the week of 7 June, measured in Google Search Console for the week of 27 September,',
  ],
  ['<td><strong>7.6× (week of 13 Sep)</strong></td>', '<td><strong>14.8× (week of 27 Sep)</strong></td>'],
  [
    'then climbed to 7.6× in the week of 13 September; after three flat weeks, clicks are rising with impressions again.',
    'then climbed to 7.6× in the week of 13 September, 9.8× in the week of 20 September and 14.8× in the week of 27 September. The rise is spread across the employment-law articles (unemployment eligibility, sick leave, maternity leave, expense reimbursement, severance), not one page.',
  ],
  [
    'Updated 28 September 2026 with Search Console data to 25 September,',
    'Updated 9 October 2026 with Search Console data to 3 October (the AI and enquiry figures were re-checked then and keep their late-September windows); previously updated 28 September with Search Console data to 25 September,',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [[
  'Google clicks per week outside the celebrity-case pages are 7.6× the week of 7 June,',
  'Google clicks per week outside the celebrity-case pages reached 14.8× the week of 7 June in the week of 27 September,',
]], 'paragraphSummary');

const pr = doc.instruments.publishedResult;
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => (r._key !== 'r-2' ? r : {
    ...r,
    value: `${latest}×`,
    unit: swap(r.unit, [['week of 7 Jun → week of 13 Sep', 'week of 7 Jun → week of 27 Sep']], 'publishedResult.unit'),
  })),
};

const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== '2026-09-25') throw new Error(`chart ends ${last.date}`);
let n = Number(last._key.slice(2));
const add = g.daily.filter(([d]) => d > last.date && d <= END).map(([d, c, i]) => ({
  _key: `d-${++n}`, date: d, month: d.startsWith('2026-10') ? 'Oct' : 'Sep',
  clicks: Math.round((c / marClk) * 100), impressions: Math.round((i / marImp) * 100),
}));
const indexedTrend = { ...it, points: [...it.points, ...add], caption: swap(it.caption, [['Daily to 25 Sep 2026,', 'Daily to 3 Oct 2026,']], 'indexedTrend.caption') };

const patch = {
  result2Number: `${latest}×`,
  result2Title: 'Google clicks per week outside the celebrity-case pages, week of 7 Jun → week of 27 Sep 2026',
  paragraphSummary,
  mainBody,
  'instruments.publishedResult': publishedResult,
  'instruments.indexedTrend': indexedTrend,
  'instruments.gscSource': 'Google Search Console · indexed to Mar 2026 = 100 · to 3 Oct 2026',
};

console.log({ prior, latest, added: add.length, lastPoint: add.at(-1) });
if (!WRITE) { console.log('dry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
