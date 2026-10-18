/**
 * Refresh the Delshad Legal case study on 18 Oct 2026: Google figures to 16 Oct
 * (Search Console final data), the clicks headline to the week of 4 Oct (the
 * last complete Sunday week), and the Ahrefs Domain Rating climb from 4.9 to 25.
 *
 * Arnel, 18 Oct 2026: the Tyler Perry case coverage was part of the work
 * (LoudFace kept pushing the case), so its effect on the domain belongs on the
 * page. The Domain Rating card replaces the AI share-of-voice card in slot 2
 * (no homepage tile reads that slot); the share of voice stays in the summary,
 * the body and the published-result rows with its dated 27 Sep window. The
 * enquiry and AI figures were not re-measured and keep their windows.
 *
 * Inputs:
 *   --gsc <JSON { mar: {days, clicks, impressions}, nonCelebrityWeeks:
 *     {weekStart: clicks}, daily: [[date, clicks, impressions, position], …] }>
 *     nonCelebrityWeeks sums daily page rows of sc-domain:delshadlegal.com that
 *     do not match the celebrity-page pattern of refresh-delshad-2026-09-28.mjs.
 *   --ahrefs <JSON { "YYYY-MM-DD": domainRating }> from the Ahrefs v3
 *     domain-rating endpoint (content-engine scripts/ahrefs-cli.mjs), read 18 Oct.
 * Raw counts never leave this script.
 *
 * Shipped figures (week of 7 Jun 52 clicks, week of 27 Sep 14.8×, the 3 Oct
 * chart point, 6.8× over 1–25 Sep) must reproduce, and every replaced sentence
 * must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-delshad-2026-10-18.mjs --gsc <f> --ahrefs <f> [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const arg = (k) => {
  const v = args[args.indexOf(k) + 1];
  if (!args.includes(k) || !v || v.startsWith('--')) throw new Error(`${k} <file> is required`);
  return v;
};
const g = JSON.parse(readFileSync(arg('--gsc'), 'utf8'));
const dr = JSON.parse(readFileSync(arg('--ahrefs'), 'utf8'));
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-delshad-legal-content-engine';
const END = '2026-10-16';
const r1 = (v) => Math.round(v * 10) / 10;

/* ── Search Console ─────────────────────────────────────────────────── */
const w = g.nonCelebrityWeeks;
const daily = g.daily.filter(([d]) => d <= END);
if (daily.at(-1)[0] !== END) throw new Error(`pull ends ${daily.at(-1)[0]}, need ${END}`);
const range = (a, b) => daily.filter(([d]) => d >= a && d <= b);
const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const wpos = (rs) => rs.reduce((t, r) => t + r[2] * r[3], 0) / sum(rs, 2);
const marClk = g.mar.clicks / g.mar.days;
const marImp = g.mar.impressions / g.mar.days;

if (w['2026-06-07'] !== 52) throw new Error(`week of 7 Jun = ${w['2026-06-07']}, shipped 52`);
if (r1(w['2026-09-27'] / w['2026-06-07']) !== 14.8) throw new Error('week of 27 Sep does not reproduce 14.8×');
const d03 = daily.find(([d]) => d === '2026-10-03');
if (Math.round((d03[1] / marClk) * 100) !== 829 || Math.round((d03[2] / marImp) * 100) !== 1002) throw new Error('3 Oct chart point does not reproduce');
const sep25 = range('2026-09-01', '2026-09-25');
if (r1(sum(sep25, 2) / sep25.length / marImp) !== 6.8) throw new Error('1–25 Sep impressions do not reproduce 6.8×');

const oct = range('2026-10-01', END);
const f = {
  clkWeek: r1(w['2026-10-04'] / w['2026-06-07']),
  octImp: r1(sum(oct, 2) / oct.length / marImp),
  octClk: r1(sum(oct, 1) / oct.length / marClk),
  octPos: r1(wpos(oct)),
};
const expectNew = { clkWeek: 14.9, octImp: 14.5, octClk: 13, octPos: 6.2 };
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);

/* ── Ahrefs Domain Rating ───────────────────────────────────────────── */
const expectDr = { '2026-06-01': 4.9, '2026-07-01': 8, '2026-08-01': 10, '2026-10-01': 10, '2026-10-05': 25, '2026-10-18': 25 };
for (const [d, e] of Object.entries(expectDr)) if (dr[d] !== e) throw new Error(`copy says DR ${e} on ${d}, Ahrefs says ${dr[d]}`);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (doc.result1Number !== '14.8×' || doc.result2Number !== '32.4%') throw new Error('result cards changed since 9 Oct');

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
    'Google clicks per week outside the celebrity-case pages are 14.8× the week of 7 June, measured in Google Search Console for the week of 27 September,',
    'Google clicks per week outside the celebrity-case pages are 14.9× the week of 7 June, measured in Google Search Console for the week of 4 October,',
  ],
  [
    "the site's best complete month in Search Console's records. The demand reached the firm:",
    "the site's best complete month in Search Console's records. October went further: over 1–16 October, impressions per day ran 14.5× the March average and clicks per day 13×, and Ahrefs rates the domain at Domain Rating 25, up from 4.9 when the work began in June. The demand reached the firm:",
  ],
  [
    'Impressions per day are 6.8× the March average.</p>',
    'Impressions per day are 6.8× the March average. October went further: over 1–16 October, impressions per day ran 14.5× the March average and clicks per day 13×, at an average position of 6.2.</p>\n\n<h3>The domain went from Domain Rating 4.9 to 25</h3>\n<p>Ahrefs rated delshadlegal.com at Domain Rating 4.9 on 1 June 2026, the week the work began. It reached 8 by July and 10 by August, then 25 in the first week of October, where it stands on 18 October. Domain Rating is Ahrefs\' score for the strength of the sites that link to a domain. We kept pushing the firm\'s headline case as part of the program, and the October jump came as Ahrefs credited the coverage it earned, including a link from Deadline (Ahrefs Domain Rating 90).</p>',
  ],
  ['<td><strong>14.8× (week of 27 Sep)</strong></td>', '<td><strong>14.9× (week of 4 Oct)</strong></td>'],
  [
    'and 14.8× in the week of 27 September. The rise is spread',
    'and 14.8× in the week of 27 September, and held at 14.9× in the week of 4 October. The rise is spread',
  ],
  [
    'The second is honesty about what counts: we separated the news demand from the client demand in every report, because a traffic chart inflated by a celebrity lawsuit would flatter us and mislead the client. The numbers above exclude the famous case on purpose. The growth is the part the firm keeps.',
    "The second is working both kinds of demand. We kept pushing the firm's headline case, and the coverage it earned is behind the jump in its Domain Rating. We also report the client-question articles on their own, so the firm can see which growth turns into enquiries: the click figures above exclude the celebrity-case pages for that reason.",
  ],
  [
    'Updated 9 October 2026 with Search Console data to 3 October (the AI and enquiry figures were re-checked then and keep their late-September windows); previously updated',
    'Updated 18 October 2026 with Search Console data to 16 October and Ahrefs Domain Rating to 18 October (the AI and enquiry figures keep their late-September windows); previously updated 9 October with Search Console data to 3 October and',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [
  [
    'Google clicks per week outside the celebrity-case pages reached 14.8× the week of 7 June in the week of 27 September 2026,',
    'Google clicks per week outside the celebrity-case pages reached 14.9× the week of 7 June in the week of 4 October 2026,',
  ],
  [
    'run 2.7× the weeks before August.',
    'run 2.7× the weeks before August. Its Ahrefs Domain Rating went from 4.9 in June to 25 in October, and over 1–16 October site-wide impressions per day ran 14.5× the March average.',
  ],
], 'paragraphSummary');

const faq = doc.faq.map((q) => (q._key !== 'faq-3' ? q : { ...q, answer: swap(q.answer, [[
  'It drove the news traffic, and we report that separately on purpose. The headline numbers in this case study exclude the celebrity-case pages.',
  'It drove the news traffic, and that was part of the work: we kept pushing the case, and the coverage it earned took the domain from Ahrefs Domain Rating 4.9 to 25. The click figures in this case study still exclude the celebrity-case pages, to show the client-question articles on their own.',
]], 'faq-3') }));

/* Daily chart: extend from 4 Oct to 16 Oct on the March index */
const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== '2026-10-03') throw new Error(`chart ends ${last.date}`);
let n = Number(last._key.slice(2));
const add = daily.filter(([d]) => d > last.date).map(([d, c, i]) => ({
  _key: `d-${++n}`, date: d, month: 'Oct',
  clicks: Math.round((c / marClk) * 100), impressions: Math.round((i / marImp) * 100),
}));
const indexedTrend = {
  ...it,
  points: [...it.points, ...add],
  caption: swap(it.caption, [[
    'and 6.8× the March average over 1–25 September. Daily to 3 Oct 2026,',
    'and 6.8× the March average over 1–25 September, then 14.5× over 1–16 October. Daily to 16 Oct 2026,',
  ]], 'indexedTrend.caption'),
};

/* Weekly clicks outside the celebrity pages: add the week of 4 Oct */
const cg = doc.instruments.clickGrowth;
if (cg.points.at(-1).week !== '2026-09-27') throw new Error(`click series ends ${cg.points.at(-1).week}`);
const clickGrowth = {
  ...cg,
  points: [...cg.points, { _key: 'cg-2026-10-04', value: Math.round((w['2026-10-04'] / w['2026-06-07']) * 100), week: '2026-10-04' }],
  source: swap(cg.source, [['7 Jun – 3 Oct 2026', '7 Jun – 10 Oct 2026']], 'clickGrowth.source'),
};

const pr = doc.instruments.publishedResult;
const publishedResult = {
  ...pr,
  caption: swap(pr.caption, [['Sources: Peec AI, Google Search Console.', 'Sources: Peec AI, Google Search Console, Ahrefs.']], 'publishedResult.caption'),
  rows: [
    ...pr.rows.map((r) => (r._key !== 'r-2' ? r : {
      ...r,
      value: `${f.clkWeek}×`,
      unit: swap(r.unit, [['week of 7 Jun → week of 27 Sep', 'week of 7 Jun → week of 4 Oct']], 'publishedResult.unit'),
    })),
    { _key: 'r-3', unit: 'Ahrefs Domain Rating, 1 Jun → 18 Oct', value: '4.9 → 25' },
  ],
};

const patch = {
  result1Number: `${f.clkWeek}×`,
  result1Title: 'Google clicks per week outside the celebrity-case pages, week of 7 Jun → week of 4 Oct 2026',
  result2Number: '4.9 → 25',
  result2Title: 'Ahrefs Domain Rating, 1 Jun → 18 Oct 2026',
  paragraphSummary,
  mainBody,
  faq,
  'instruments.indexedTrend': indexedTrend,
  'instruments.clickGrowth': clickGrowth,
  'instruments.publishedResult': publishedResult,
  'instruments.gscSource': 'Google Search Console · indexed to Mar 2026 = 100 · to 16 Oct 2026',
};

console.log({ fresh: f, added: add.length, lastPoint: add.at(-1), weekPoint: clickGrowth.points.at(-1) });
if (!WRITE) { console.log('dry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
