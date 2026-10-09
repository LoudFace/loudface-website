/**
 * Refresh the LoudFace AEO case study with the eleven days after the published
 * window: 28 Sep – 8 Oct 2026, the same length as 18–28 Sep, on the same 141
 * non-branded prompts, three engines and 53 brands (Peec AI, read 9 Oct).
 *
 * Only the rank moves (3rd → 2nd). Visibility held (21.5% → 21.0%) and the
 * per-engine figures are flat, so the 0.13% → 21.5% and 38.8% headlines keep
 * their 18–28 Sep window; the new window is reported beside them.
 *
 * The Peec readings are inlined below (aggregate percentages only, no counts
 * beyond what the page already prints). The 27 and 28 Sep daily points must
 * reproduce the published chart, and every replaced passage must exist exactly
 * once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-loudface-aeo-2026-10-09.mjs [--write]
 */
import { createClient } from '@sanity/client';

const WRITE = process.argv.includes('--write');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-loudface-aeo-case-study';

/* Peec AI, non-branded tag, 141 prompts, openai-0 / google-0 / perplexity-0, 53 brands */
const WINDOW = { vis: 21.0, pos: 3.1, rank: 2, chatgpt: 37.5, aio: 13.5, perplexity: 11.9 };
const FIELD = [
  ['Omniscient', 34.3, 3.4],
  ['LoudFace', 21.0, 3.1],
  ['First Page Sage', 19.0, 4.0],
  ['Siege Media', 17.4, 4.1],
  ['iPullRank', 16.9, 3.8],
];
const CHECK = { '2026-09-27': 0.1868, '2026-09-28': 0.2162 };
const DAILY = {
  '2026-09-29': 0.1952, '2026-09-30': 0.1838, '2026-10-01': 0.2133, '2026-10-02': 0.2156, '2026-10-03': 0.2076,
  '2026-10-04': 0.2043, '2026-10-05': 0.2029, '2026-10-06': 0.1943, '2026-10-07': 0.237, '2026-10-08': 0.237,
};

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

const tc = doc.instruments.topicClimb;
for (const [d, v] of Object.entries(CHECK)) {
  const p = tc.points.find((x) => x.week === d);
  if (!p || p.value !== v) throw new Error(`daily point ${d}: published ${p?.value}, method gives ${v}`);
}
if (tc.points.at(-1).week !== '2026-09-28') throw new Error(`chart ends ${tc.points.at(-1).week}`);
const fps = FIELD.find(([b]) => b === 'First Page Sage')[1];
const gap = (WINDOW.vis - fps).toFixed(1);
const omniX = (FIELD[0][1] / WINDOW.vis).toFixed(1);
if (gap !== '2.0' || omniX !== '1.6') throw new Error(`copy says 2.0 points / 1.6×, data says ${gap} / ${omniX}`);

const fieldRows = FIELD.map(([b, v, p]) => (b === 'LoudFace'
  ? `<tr><td><strong>LoudFace</strong></td><td><strong>${v.toFixed(1)}%</strong></td><td><strong>${p.toFixed(1)}</strong></td></tr>`
  : `<tr><td>${b}</td><td>${v.toFixed(1)}%</td><td>${p.toFixed(1)}</td></tr>`)).join('\n');

const mainBody = swap(doc.mainBody, [
  [
    'to 21.5% over 18 to 28 September 2026 (Peec AI), 3rd of the 53 brands we track.',
    'to 21.5% over 18 to 28 September 2026 (Peec AI), 3rd of the 53 brands we track; over the next eleven days, 28 September to 8 October, it held at 21.0% and we moved up to 2nd.',
  ],
  [
    '<tr><td><strong>September 2026 (18 to 28, after the 17 September prompt cut)</strong></td><td><strong>21.5%</strong></td><td><strong>3.4</strong></td><td><strong>3rd</strong></td></tr>',
    '<tr><td>September 2026 (18 to 28, after the 17 September prompt cut)</td><td>21.5%</td><td>3.4</td><td>3rd</td></tr>\n<tr><td><strong>28 September to 8 October 2026</strong></td><td><strong>21.0%</strong></td><td><strong>3.1</strong></td><td><strong>2nd</strong></td></tr>',
  ],
  [
    'On visibility across non-branded prompts over 18 to 28 September we rank 3rd of the 53 brands on the board, up from 10th in August. First Page Sage is 0.2 points ahead of us.',
    `On visibility across non-branded prompts over 28 September to 8 October we rank 2nd of the 53 brands on the board, up from 3rd over 18 to 28 September and 10th in August. Only Omniscient is ahead; First Page Sage, 0.2 points ahead of us over 18 to 28 September, is now ${gap} points behind.`,
  ],
  [
    /<tr><th>Agency \(18 to 28 September 2026\)<\/th>[\s\S]*?<\/tbody>/.exec(doc.mainBody)?.[0] ?? '<<agency table not found>>',
    `<tr><th>Agency (28 September to 8 October 2026)</th><th>Visibility</th><th>Avg position</th></tr>\n</thead>\n<tbody>\n${fieldRows}\n</tbody>`,
  ],
  [
    'At an average position of 3.4, we are named earlier in the answer than both agencies ahead of us, including one that appears in about 1.6 times as many answers.',
    `At an average position of 3.1, we are named earlier in the answer than every agency on this table, including Omniscient, which appears in about ${omniX} times as many answers.`,
  ],
  [
    '<h2>Update, 29 September 2026:',
    `<h2>Update, 9 October 2026: second of 53</h2>\n\n<p>Over the eleven days from 28 September to 8 October, on the same 141 non-branded prompts, three engines and 53 brands, our visibility held at 21.0% (21.5% over 18 to 28 September) and we moved from 3rd to 2nd, as First Page Sage fell from 21.7% to 19.0%. Only Omniscient, at 34.3%, is ahead. Our average position when named improved from 3.4 to 3.1. ChatGPT named us in ${WINDOW.chatgpt}% of its answers, Google AI Overviews ${WINDOW.aio}% and Perplexity ${WINDOW.perplexity}%, level with the window before.</p>\n\n<h2>Update, 29 September 2026:`,
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [[
  'to 21.5% over 18 to 28 September 2026, 3rd of the 53 brands we track,',
  'to 21.5% over 18 to 28 September 2026, 3rd of the 53 brands we track (2nd over 28 September to 8 October, at 21.0%),',
]], 'paragraphSummary');

const pr = doc.instruments.publishedResult;
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => (r._key !== 'r-1' ? r : { ...r, value: '2nd of 53', unit: 'tracked brands, 28 Sep–8 Oct 2026, same prompts as 18–28 Sep (3rd then)' })),
};

let n = Number(tc.points.at(-1)._key.slice(2));
const topicClimb = {
  ...tc,
  points: [...tc.points, ...Object.entries(DAILY).map(([week, value]) => ({ _key: `d-${++n}`, week, value }))],
  caption: `${tc.caption} Over 28 September to 8 October it held at 21.0%.`,
};

const patch = {
  result2Number: '2nd of 53',
  result2Title: 'Rank among the 53 tracked brands on AI visibility, non-branded prompts, 28 Sep–8 Oct 2026; 3rd over 18–28 Sep, after the 17 Sep prompt cut; 10th in Aug',
  paragraphSummary,
  mainBody,
  'instruments.publishedResult': publishedResult,
  'instruments.topicClimb': topicClimb,
  'instruments.aiSource': 'Peec AI · non-branded prompts · 8 Apr – 8 Oct 2026',
};

console.log({ gap, omniX, added: Object.keys(DAILY).length, fieldRows });
if (!WRITE) { console.log('dry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
