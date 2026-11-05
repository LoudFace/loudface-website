/**
 * Refresh the Hayes Media case study to the week of 27 Oct – 2 Nov 2026, the newest complete Monday week
 * (Search Console final data reached 3 Nov on 5 Nov). The daily chart runs to 3 Nov.
 *
 * Same measures as the create script (create-hayes-media-2026-10-28.mjs): non-branded means a query without
 * "hayes", counted over the query+page rows Search Console names; baseline is the program's first week, 2–8 Sep.
 * The $6,000 deal, the $50M brand's call, the testimonial and the article counts are left alone (articles not
 * re-counted).
 *
 * Input: --gsc <the 5 Nov Executor pull: { weeks: { '2026-09-02' | '2026-10-20' | '2026-10-27': { queries,
 * queriesTop10, impressions } }, daily: [[date, clicks, impressions], …] from 2 Sep }>. Raw counts never leave
 * this script; only multiples are printed.
 *
 * Every shipped figure (5.4×, 7.5×, 5.1×, 2.3×, 3.9× on 26 Oct, all 55 chart points) must reproduce, and every
 * replaced sentence must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-hayes-media-2026-11-05.mjs --gsc <f> [--out <review.json>] [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const gscPath = args[args.indexOf('--gsc') + 1];
if (!args.includes('--gsc') || !gscPath || gscPath.startsWith('--')) throw new Error('--gsc <file> is required');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-hayes-media-organic-leads';
const WEEK_END = '2026-11-02';
const CHART_END = '2026-11-03';
const r1 = (v) => Math.round(v * 10) / 10;

/* ── Search Console ─────────────────────────────────────────────────── */
const g = JSON.parse(readFileSync(gscPath, 'utf8'));
const daily = g.daily.filter(([d]) => d <= CHART_END);
if (daily[0][0] !== '2026-09-02' || daily.at(-1)[0] !== CHART_END) throw new Error(`pull is ${daily[0][0]} – ${daily.at(-1)[0]}`);
const range = (a, b) => daily.filter(([d]) => d >= a && d <= b);
const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const day = (d) => daily.find(([x]) => x === d);
const first = range('2026-09-02', '2026-09-08');
const oldWk = range('2026-10-20', '2026-10-26');
const newWk = range('2026-10-27', WEEK_END);
if ([first, oldWk, newWk].some((w) => w.length !== 7)) throw new Error('all three weeks must be complete');
const baseImp = sum(first, 2) / 7;
const baseClk = sum(first, 1) / 7;
const { '2026-09-02': nb0, '2026-10-20': nbOld, '2026-10-27': nbNew } = g.weeks;
const nb = (w) => ({ queries: r1(w.queries / nb0.queries), top10: r1(w.queriesTop10 / nb0.queriesTop10), nbImp: r1(w.impressions / nb0.impressions) });
const point = ([date, c, i], n) => ({
  _key: `d-${n}`, date, month: new Date(`${date}T00:00:00Z`).toLocaleString('en', { month: 'short', timeZone: 'UTC' }),
  impressions: Math.round((i / baseImp) * 100), clicks: Math.round((c / baseClk) * 100),
});

// shipped figures must reproduce
const shipped = { ...nb(nbOld), allImp: r1(sum(oldWk, 2) / sum(first, 2)), oct26: r1(day('2026-10-26')[2] / baseImp) };
const expectOld = { queries: 5.4, top10: 7.5, nbImp: 5.1, allImp: 2.3, oct26: 3.9 };
for (const [k, e] of Object.entries(expectOld)) if (shipped[k] !== e) throw new Error(`shipped ${k} = ${e}, data says ${shipped[k]}`);

const bestInWeek = newWk.reduce((a, b) => (b[2] > a[2] ? b : a));
const f = {
  ...nb(nbNew),
  allImp: r1(sum(newWk, 2) / sum(first, 2)),
  bestDay: bestInWeek[0], bestDayX: r1(bestInWeek[2] / baseImp),
  chartEndX: r1(day(CHART_END)[2] / baseImp),
  clicksWk: r1(sum(newWk, 1) / sum(first, 1)),
};
// clicksWk < 1 keeps "site-wide clicks have not moved yet" true
const expectNew = { queries: 16.6, top10: 29.5, nbImp: 21.6, allImp: 7.9, bestDay: '2026-10-30', bestDayX: 11.6, chartEndX: 12, clicksWk: 0.7 };
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (await client.getDocument(`drafts.${DOC_ID}`)) throw new Error('an unpublished draft exists; publish or discard it first');
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
    'the non-branded searches that show Hayes Media grew 5.4× and the non-branded searches where it ranks on Google’s first page grew 7.5×, from the program’s first week (2–8 September 2026) to the week of 20 October.',
    'the non-branded searches that show Hayes Media grew 16.6× and the non-branded searches where it ranks on Google’s first page grew 29.5×, from the program’s first week (2–8 September 2026) to the week of 27 October.',
  ],
  ['<h3>Google: 5.4× the searches, 7.5× on page one</h3>', '<h3>Google: 16.6× the searches, 29.5× on page one</h3>'],
  ['<th>Program’s first week (2–8 Sep) → week of 20 Oct 2026</th>', '<th>Program’s first week (2–8 Sep) → week of 27 Oct 2026</th>'],
  [
    '<tr><td><strong>Non-branded searches that show Hayes Media</strong></td><td><strong>5.4×</strong></td></tr>',
    '<tr><td><strong>Non-branded searches that show Hayes Media</strong></td><td><strong>16.6×</strong></td></tr>',
  ],
  [
    '<tr><td><strong>Non-branded searches where it ranks on page one</strong></td><td><strong>7.5×</strong></td></tr>',
    '<tr><td><strong>Non-branded searches where it ranks on page one</strong></td><td><strong>29.5×</strong></td></tr>',
  ],
  ['<tr><td>Non-branded impressions</td><td>5.1×</td></tr>', '<tr><td>Non-branded impressions</td><td>21.6×</td></tr>'],
  ['<tr><td>All impressions, branded included</td><td>2.3×</td></tr>', '<tr><td>All impressions, branded included</td><td>7.9×</td></tr>'],
  [
    'The climb is steepest at the end of the window: impressions on 26 October ran 3.9× the first week’s daily average.',
    'The climb is steepest at the end of the window: the best day in it, 30 October, ran 11.6× the first week’s daily average.',
  ],
  [
    'Published 29 October 2026, with Search Console data to 26 October.',
    'Published 29 October 2026, with Search Console data to 26 October. Updated 5 November 2026 with Search Console data to 3 November.',
  ],
  [' Most of the fifty articles are under four weeks old.', ' Many of the fifty articles are only a few weeks old.'],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [
  [
    'grew 5.4× from the program’s first week (2–8 September 2026) to the week of 20 October, and the non-branded searches where it ranks on page one grew 7.5×.',
    'grew 16.6× from the program’s first week (2–8 September 2026) to the week of 27 October, and the non-branded searches where it ranks on page one grew 29.5×.',
  ],
], 'paragraphSummary');

/* Daily chart: every shipped point must reproduce, then extend to 3 Nov */
const it = doc.instruments.indexedTrend;
const recomputed = daily.map(point);
if (it.points.length !== 55 || it.points.at(-1).date !== '2026-10-26') throw new Error(`chart ends ${it.points.at(-1).date} with ${it.points.length} points`);
it.points.forEach((p, n) => {
  const q = recomputed[n];
  if (p._key !== q._key || p.date !== q.date || p.impressions !== q.impressions || p.clicks !== q.clicks) throw new Error(`chart point ${p._key} ${p.date} does not reproduce`);
});
const add = recomputed.slice(it.points.length);
const indexedTrend = {
  ...it,
  points: [...it.points, ...add],
  caption: swap(it.caption, [[
    'The seven days to 26 October averaged 2.3× that week, and 26 October alone 3.9×.',
    'The seven days to 2 November averaged 7.9× that week, and 3 November alone 12.0×.',
  ]], 'indexedTrend.caption'),
};

const pr = doc.instruments.publishedResult;
if (pr.rows.map((r) => r.value).join('|') !== '5.4×|7.5×|$6,000') throw new Error('publishedResult rows changed since 29 Oct');
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => {
    if (r._key === 'r-0') return { ...r, value: '16.6×', unit: swap(r.unit, [['2–8 Sep → week of 20 Oct', '2–8 Sep → week of 27 Oct']], 'publishedResult r-0') };
    if (r._key === 'r-1') return { ...r, value: '29.5×' };
    return r;
  }),
};

const faq = doc.faq.map((q) => (q._key === 'faq-3' ? { ...q, answer: swap(q.answer, [['Most of the articles are under four weeks old and still rank below the top ten', 'Many of the articles are only a few weeks old and still rank below the top ten']], 'faq-3') } : q));

const patch = {
  faq,
  result2Number: `${f.queries}×`,
  result2Title: swap(doc.result2Title, [['→ week of 20 Oct 2026', '→ week of 27 Oct 2026']], 'result2Title'),
  result3Number: `${f.top10}×`,
  paragraphSummary,
  mainBody,
  'instruments.indexedTrend': indexedTrend,
  'instruments.publishedResult': publishedResult,
  'instruments.gscSource': swap(doc.instruments.gscSource, [['2 Sep – 26 Oct 2026', '2 Sep – 3 Nov 2026']], 'gscSource'),
};

console.log(JSON.stringify({ shipped, fresh: f, added: add.map((p) => p.date) }, null, 1));
const outPath = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
if (outPath) writeFileSync(outPath, JSON.stringify({ before: doc, patch }, null, 1));
if (!WRITE) { console.log('\ndry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
