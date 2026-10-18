/**
 * Refresh the Genie Teacher case study to the seven days ending 16 Oct 2026
 * (Search Console final data reached 16 Oct on 18 Oct) and the Peec AI weekly
 * readings to the week of 5 Oct (the last complete Monday week).
 *
 * The lead and booking figures and the 30-day AI window keep their dated
 * late-September windows; they were not re-measured.
 *
 * Input: --gsc <JSON array of [date, clicks, impressions, position]>, a daily
 * pull of sc-domain:genieteacher.com from 13 Apr 2026. Raw counts never leave
 * this script: every published value is indexed to the average May 2026 day.
 *
 * Peec AI weekly readings (brand-report, Monday weeks, read 18 Oct 2026):
 *   21 Sep: visibility 9.75%, share of voice 13.04%, rank 1.5 (shipped, reproduced)
 *   28 Sep: visibility 10.55%, share of voice 13.68%, rank 1.6
 *    5 Oct: visibility 12.47%, share of voice 16.16%, rank 2.0
 *
 * Every shipped figure (226×, 35×, week position 6.5, 170×, 362×) is recomputed
 * from the new pull and must reproduce, and every replaced sentence must exist
 * exactly once, or nothing is written.
 *
 *   scripts/with-secrets.sh node scripts/instruments/refresh-genie-2026-10-18.mjs --gsc <f>          # dry run
 *   scripts/with-secrets.sh node scripts/instruments/refresh-genie-2026-10-18.mjs --gsc <f> --write  # patch
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const gscPath = args[args.indexOf('--gsc') + 1];
if (!gscPath || gscPath.startsWith('--')) throw new Error('--gsc <file> is required');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing (run through scripts/with-secrets.sh)');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-genie-teacher-organic-growth';
const END = '2026-10-16';
const WIN_START = '2026-10-10';

/* ── Search Console ─────────────────────────────────────────────────── */
const rows = JSON.parse(readFileSync(gscPath, 'utf8')).filter(([d]) => d <= END);
const range = (a, b) => rows.filter(([d]) => d >= a && d <= b);
const month = (m) => rows.filter(([d]) => d.startsWith(m));
const sum = (rs, i) => rs.reduce((t, r) => t + r[i], 0);
const wpos = (rs) => rs.reduce((t, r) => t + r[2] * r[3], 0) / sum(rs, 2);
const r1 = (v) => Math.round(v * 10) / 10;
if (rows.at(-1)[0] !== END) throw new Error(`pull ends ${rows.at(-1)[0]}, need ${END}`);

const apr = month('2026-04');
const may = month('2026-05');
const mayImp = sum(may, 2) / may.length;
const mayClk = sum(may, 1) / may.length;
const perDay = (rs) => sum(rs, 2) / rs.length / mayImp;
const sep = month('2026-09');
const oct = range('2026-10-01', END);
const win = range(WIN_START, END);
if (win.length !== 7) throw new Error('window is not 7 days');

// shipped figures must reproduce
const oldWeek = range('2026-09-28', '2026-10-04');
const shipped = {
  impWeek: Math.round(perDay(oldWeek)),
  clkWeek: Math.round(sum(oldWeek, 1) / (mayClk * 7)),
  posWeek: r1(wpos(oldWeek)),
  impSep: Math.round(perDay(sep)),
  sepVsApr: Math.round(sum(sep, 2) / sum(apr, 2)),
  idx04: Math.round((rows.find(([d]) => d === '2026-10-04')[2] / mayImp) * 100),
};
const expect = { impWeek: 226, clkWeek: 35, posWeek: 6.5, impSep: 170, sepVsApr: 362, idx04: 16927 };
for (const [k, e] of Object.entries(expect)) if (shipped[k] !== e) throw new Error(`shipped ${k} = ${e}, data says ${shipped[k]}`);

const f = {
  impWin: Math.round(perDay(win)),
  clkWin: Math.round(sum(win, 1) / (mayClk * 7)),
  posWin: r1(wpos(win)),
  octVsApr: Math.round(sum(oct, 2) / sum(apr, 2)),
  octPassesSep: sum(oct, 2) > sum(sep, 2),
  bestDay: rows.filter(([d]) => d >= '2026-10-01').reduce((a, b) => (b[2] > a[2] ? b : a)),
};
f.bestDayX = Math.round(f.bestDay[2] / mayImp);
const expectNew = { impWin: 370, clkWin: 50, posWin: 6, octVsApr: 369, octPassesSep: true, bestDayX: 594 };
for (const [k, e] of Object.entries(expectNew)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);
if (f.bestDay[0] !== '2026-10-16') throw new Error(`best day is ${f.bestDay[0]}`);

/* ── Document ───────────────────────────────────────────────────────── */
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
    "Genie Teacher's Google impressions per day rose 28× from May to August 2026, 170× across September, and 226× in the week of 28 September to 4 October (Google Search Console, to 4 Oct 2026). Clicks followed: that week brought 35× the clicks of an average May week, and the average position moved from 11.5 in August to 6.9 in September and 6.5 in that week.",
    "Genie Teacher's Google impressions per day rose 28× from May to August 2026, 170× across September, and 370× in the seven days to 16 October (Google Search Console, to 16 Oct 2026). Clicks followed: those seven days brought 50× the clicks of an average May week, and the average position moved from 11.5 in August to 6.9 in September and 6.0 in those seven days.",
  ],
  [
    'In AI search, visibility grew from 5.26% in the week of 25 May to 9.75% in the week of 21 September 2026, and share of voice from 2.26% to 13.0% (Peec AI), with an average mention rank between 1.0 and 1.6 since July.',
    'In AI search, visibility grew from 5.26% in the week of 25 May to 12.47% in the week of 5 October 2026, and share of voice from 2.26% to 16.2% (Peec AI), with an average mention rank between 1.0 and 2.0 since July.',
  ],
  [
    'and September brought 5.8× the impressions and 7.0× the clicks of August.',
    'and September brought 5.8× the impressions and 7.0× the clicks of August. The first sixteen days of October then brought more impressions than the whole of September.',
  ],
  ['(Google Search Console, root domain, to 30 September 2026)', '(Google Search Console, root domain, to 16 October 2026)'],
  [
    '<tr><td><strong>September</strong></td><td><strong>362×</strong></td></tr>',
    '<tr><td>September</td><td>362×</td></tr>\n<tr><td><strong>October, first 16 days</strong></td><td><strong>369×</strong></td></tr>',
  ],
  [
    'and September closed at 362×. Measured per day, impressions rose 28× from May to August and 170× across September; the week of 28 September to 4 October ran at 226× an average May day, and its best day, 1 October, at 284×.',
    'and September closed at 362×, a total the first sixteen days of October passed at 369×. Measured per day, impressions rose 28× from May to August and 170× across September; the seven days to 16 October ran at 370× an average May day, and the best day so far, 16 October, at 594×.',
  ],
  [
    'The week of 28 September to 4 October brought 35× the clicks of an average May week, September brought 7.0× the clicks of August, and the average position across the site moved from 11.5 in August to 6.9 in September (Google Search Console).',
    'The seven days to 16 October brought 50× the clicks of an average May week, September brought 7.0× the clicks of August, and the average position across the site moved from 11.5 in August to 6.9 in September and 6.0 in those seven days (Google Search Console).',
  ],
  ['<h3>AI visibility: a 28.39% peak, settling near 10%</h3>', '<h3>AI visibility: a 28.39% peak, a base near 10%, and a climb to 12.47%</h3>'],
  [
    'before settling between 8% and 11% from August into September (<strong>9.75%</strong> in the week of 21 September).',
    'before settling between 8% and 11% from August into September (<strong>9.75%</strong> in the week of 21 September), then climbing to <strong>12.47%</strong> in the week of 5 October.',
  ],
  ['The current level is where it has stabilised.', 'The August and September level was the stable base, and October is the first climb above it.'],
  ['<h3>Share of voice: 2.26% to 13.0%, mention rank holding</h3>', '<h3>Share of voice: 2.26% to 16.2%, named near the top</h3>'],
  [
    '<strong>2.26%</strong> in the week of 25 May 2026 to <strong>13.04%</strong> in the week of 21 September 2026, with an average mention rank between 1.0 and 1.6 every week since July.',
    '<strong>2.26%</strong> in the week of 25 May 2026 to <strong>16.16%</strong> in the week of 5 October 2026, with an average mention rank between 1.0 and 2.0 every week since July.',
  ],
  [
    'Updated 9 October 2026 with Search Console data to 4 October (the lead, booking and AI figures below were re-checked then and keep their late-September windows); previously updated 28 September with',
    'Updated 18 October 2026 with Search Console data to 16 October and Peec AI weekly readings to the week of 5 October (the lead and booking figures and the 30-day AI window keep their late-September windows); previously updated 9 October with Search Console data to 4 October, and 28 September with',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [
  [
    "Genie Teacher's Google impressions per day rose 28× from May to August 2026 and 226× by the week of 28 September to 4 October, clicks per week climbed 35× on the May average, and the average position moved from 11.5 in August to 6.9 in September.",
    "Genie Teacher's Google impressions per day rose 28× from May to August 2026 and 370× in the seven days to 16 October, clicks per week climbed 50× on the May average, and the average position moved from 11.5 in August to 6.0.",
  ],
  [
    'In AI search its visibility grew from 5.26% to 9.75% and its share of voice from 2.26% to 13.0% between the weeks of 25 May and 21 September 2026, at an average mention rank of 1.0 to 1.6 since July.',
    'In AI search its visibility grew from 5.26% to 12.47% and its share of voice from 2.26% to 16.2% between the weeks of 25 May and 5 October 2026, at an average mention rank of 1.0 to 2.0 since July.',
  ],
], 'paragraphSummary');

const faq = doc.faq.map((q) => {
  if (q._key === 'faq-2') return { ...q, answer: swap(q.answer, [[
    'and the first twenty-five days of September 2026 brought 4.7× the impressions and 5.5× the clicks of the whole of August.',
    'September 2026 brought 5.8× the impressions and 7.0× the clicks of August, and the first sixteen days of October brought more impressions than all of September.',
  ]], 'faq-2') };
  if (q._key === 'faq-3') return { ...q, answer: swap(q.answer, [[
    'clicks per week are 35× the May 2026 average and the average position has moved from 11.5 in August to 6.9 in September.',
    'clicks per week are 50× the May 2026 average and the average position has moved from 11.5 in August to 6.0 in mid-October.',
  ]], 'faq-3') };
  return q;
});

/* Daily chart: extend from 5 Oct to 16 Oct on the same index */
const it = doc.instruments.indexedTrend;
const last = it.points.at(-1);
if (last.date !== '2026-10-04') throw new Error(`chart ends ${last.date}`);
let n = Number(last._key.slice(2));
const add = rows.filter(([d]) => d > last.date).map(([d, c, i]) => ({
  _key: `d-${++n}`, date: d, month: 'Oct',
  clicks: Math.round((c / mayClk) * 100), impressions: Math.round((i / mayImp) * 100),
}));
const indexedTrend = {
  ...it,
  points: [...it.points, ...add],
  caption: swap(it.caption, [[
    'the week of 28 September to 4 October ran at 226× (daily to 4 Oct).',
    'the seven days to 16 October ran at 370× (daily to 16 Oct).',
  ]], 'indexedTrend.caption'),
};

/* Peec weekly share of voice: add the weeks of 28 Sep and 5 Oct */
const tc = doc.instruments.topicClimb;
if (tc.points.at(-1).week !== '2026-09-21') throw new Error(`share-of-voice series ends ${tc.points.at(-1).week}`);
const topicClimb = {
  ...tc,
  points: [...tc.points, { _key: 'pt-11', value: 0.1368, week: '2026-09-28' }, { _key: 'pt-12', value: 0.1616, week: '2026-10-05' }],
  caption: swap(tc.caption, [['2.26% to 13.0%, 25 May to 27 Sep.', '2.26% to 16.2%, 25 May to 11 Oct.']], 'topicClimb.caption'),
};

const pr = doc.instruments.publishedResult;
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => ({
    'r-0': { ...r, unit: 'AI visibility, week of 25 May → week of 5 Oct', value: '5.26% → 12.47%' },
    'r-1': { ...r, value: '2.26% → 16.2%' },
    'r-2': { ...r, value: '1.0–2.0' },
  }[r._key] ?? r)),
};
if (pr.rows.map((r) => r.value).join('|') !== '5.26% → 9.75%|2.26% → 13.0%|1.0–1.6') throw new Error('publishedResult rows changed since 9 Oct');

const patch = {
  name: 'Genie Teacher: 370× Search Visibility',
  result1Number: `${f.impWin}×`,
  result1Title: 'Google impressions per day, May 2026 average → 7 days to 16 Oct 2026',
  result2Number: `${f.clkWin}×`,
  result2Title: 'Google clicks per week, May 2026 average → 7 days to 16 Oct 2026',
  paragraphSummary,
  mainBody,
  faq,
  'instruments.indexedTrend': indexedTrend,
  'instruments.topicClimb': topicClimb,
  'instruments.publishedResult': publishedResult,
  'instruments.gscSource': 'Google Search Console · indexed to May 2026 = 100 · to 16 Oct 2026',
  'instruments.aiSource': 'Peec AI · weekly to 11 Oct 2026, 30-day window to 27 Sep 2026',
};

console.log(JSON.stringify({ shipped, fresh: f, added: add.length }, null, 1));
if (!WRITE) { console.log('\ndry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
