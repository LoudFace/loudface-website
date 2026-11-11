/**
 * TradeMomentum, 11 Nov 2026: the clicks headline moves from Monday weeks to the highest seven days in a row
 * (Arnel's decision, 11 Nov 2026). The seven days to 9 Nov (3–9 Nov) brought 10.5x the clicks of the week the
 * engagement began (1–7 Sep 2025), the highest seven days on record; the highest Monday week is still 12 Oct (9.3x).
 * Clicks count every country, as before. Impressions, the charts and the AI figures are not touched.
 *
 * Input: --daily <gsc-cli JSON of sc-domain:trademomentum.org by date, final data covering 1 Sep 2025 → 9 Nov 2026:
 * { rows: [{ keys: [date], clicks }] }>. Raw counts never leave this script.
 *
 * The shipped 9.3x must reproduce, the new figure must match the copy and be the record, and every replaced sentence
 * must exist exactly once, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-trademomentum-clicks-2026-11-11.mjs --daily <f> [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const dailyPath = args[args.indexOf('--daily') + 1];
if (!args.includes('--daily') || !dailyPath || dailyPath.startsWith('--')) throw new Error('--daily <file> is required');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = '760323db-23d1-461e-ae13-f3877d00e24e';
const BASE_WEEK = '2025-09-01';
const END = '2026-11-09';
const OLD = '9.3x';
const NEW = '10.5x';
const HISTORY = `the week of 12 October had reached ${OLD}`;
const r1 = (v) => Math.round(v * 10) / 10;
const plus = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10);

/* ── Search Console ─────────────────────────────────────────────────── */
const all = JSON.parse(readFileSync(dailyPath, 'utf8')).rows
  .map((r) => [r.keys[0], r.clicks])
  .filter(([d]) => d >= BASE_WEEK && d <= END)
  .sort((a, b) => a[0].localeCompare(b[0]));
if (all[0][0] !== BASE_WEEK || all.at(-1)[0] !== END) throw new Error(`pull runs ${all[0][0]} → ${all.at(-1)[0]}, need ${BASE_WEEK} → ${END}`);
for (let i = 1; i < all.length; i++) if (all[i][0] !== plus(all[i - 1][0], 1)) throw new Error(`gap in the pull after ${all[i - 1][0]}`);
const seven = (end) => { const i = all.findIndex(([d]) => d === end); return all.slice(i - 6, i + 1).reduce((t, r) => t + r[1], 0); };
const base = seven(plus(BASE_WEEK, 6));
const peakEnd = all.slice(6).reduce((a, [d]) => (seven(d) > seven(a) ? d : a), all[6][0]);
const f = { shipped: r1(seven('2026-10-18') / base), now: r1(seven(END) / base), peakEnd };
const expect = { shipped: 9.3, now: 10.5, peakEnd: END };
for (const [k, e] of Object.entries(expect)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}, data says ${f[k]}`);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (await client.getDocument(`drafts.${DOC_ID}`)) throw new Error('an unpublished draft exists; resolve it first');
if (doc.result1Number !== OLD || doc.result1Title !== 'Google clicks per week, week of 1 Sep 2025 → week of 12 Oct 2026, its highest week') throw new Error('result1 changed since 11 Nov');
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
    `TradeMomentum's Google clicks per week grew ${OLD} from the week the engagement began, 1 to 7 September 2025, to the week of 12 October 2026, its highest week on record; the week after came in at 7.3x.`,
    `TradeMomentum's Google clicks per week grew ${NEW} from the week the engagement began, 1 to 7 September 2025, to the seven days to 9 November 2026, its highest seven days on record.`,
  ],
  [`Weekly Google clicks grew <strong>${OLD}</strong>`, `Weekly Google clicks grew <strong>${NEW}</strong>`],
  [
    'to the week of 12 October 2026, the highest week on record (updated 30 October 2026; the week of 21 September had reached 9.1x, and the week of 19 October came in at 7.3x).',
    `to the seven days to 9 November 2026, the highest seven days on record (updated 11 November 2026; ${HISTORY}).`,
  ],
  [
    `<tr><td>Google clicks/week</td><td>1 to 7 Sep 2025</td><td>12 to 18 Oct 2026</td><td><strong>${OLD}</strong></td></tr>`,
    `<tr><td>Google clicks/week</td><td>1 to 7 Sep 2025</td><td>3 to 9 Nov 2026</td><td><strong>${NEW}</strong></td></tr>`,
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [[
  `TradeMomentum's Google clicks per week grew ${OLD} from the week the engagement began, 1 to 7 September 2025, to the week of 12 October 2026, its highest week.`,
  `TradeMomentum's Google clicks per week grew ${NEW} from the week the engagement began, 1 to 7 September 2025, to the seven days to 9 November 2026, its highest seven days.`,
]], 'paragraphSummary');

const pr = doc.instruments.publishedResult;
if (pr.rows.find((r) => r._key === 'r-1')?.value !== OLD) throw new Error('publishedResult r-1 changed');
const publishedResult = {
  ...pr,
  caption: swap(pr.caption, [['week of 1 Sep 2025 to week of 12 Oct 2026', 'week of 1 Sep 2025 to the 7 days to 9 Nov 2026']], 'publishedResult.caption'),
  rows: pr.rows.map((r) => (r._key === 'r-1' ? { ...r, value: NEW } : r)),
};

const patch = {
  result1Number: NEW,
  result1Title: 'Google clicks per week, week of 1 Sep 2025 → 7 days to 9 Nov 2026, its highest seven days',
  mainBody,
  paragraphSummary,
  'instruments.publishedResult': publishedResult,
};
for (const q of doc.faq ?? []) if (/9\.3x|12 Oct/.test(`${q.question} ${q.answer}`)) throw new Error(`faq ${q._key} carries the old clicks figure; add it to this script`);
// the old figure may remain only in the one history clause
for (const [k, v] of Object.entries(patch)) if (JSON.stringify(v).replace(HISTORY, '').includes(OLD)) throw new Error(`${k} still carries ${OLD}`);

console.log(JSON.stringify({ figures: f, result1Title: patch.result1Title }, null, 1));
if (!WRITE) { console.log('dry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
