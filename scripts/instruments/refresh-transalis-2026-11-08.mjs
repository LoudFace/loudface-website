/**
 * Refresh the Transalis case study's Google figures on 8 Nov 2026 with Search Console final data to 6 Nov, and take
 * 20 European countries out of the page-one and impressions figures.
 *
 * Why: on 28 Oct most client sites' Google impressions jumped on the same day in the same ~20 European countries,
 * with almost no clicks: not people. Arnel's decision (8 Nov): leave those countries out of the impression and
 * page-one figures, whole series, baseline included.
 *
 *   - Page one, countries out: the seven days to 6 Nov (31 Oct–6 Nov) are 2.5× the week the work began (8–14 Jun).
 *     The published 2.4× (28 Oct–3 Nov) reproduces with the countries in and with them out.
 *   - Non-branded impressions stay 1.7× (countries out, 31 Oct–6 Nov against 8–14 Jun).
 *   - Ahrefs Domain Rating was still 49 on 8 Nov → unchanged. The AI figures are unchanged (15 of the 73 Peec prompts
 *     have since been deleted in Peec, so they cannot be re-measured).
 *
 * Method: one Search Console pull per 7-day window with dimensions [query, country]. Non-branded = the query does not
 * contain "transalis", is not a "site:" search, has no "<" and is 10 words or fewer (the Pond rule for AI-agent
 * prompts). A query's position = its impression-weighted average position across its kept rows; page one = 10 or
 * better. Raw counts never leave this script.
 *
 * Input (gsc-cli --json, https://www.transalis.com/, rows[].keys = [query, country]):
 *   --base <8–14 Jun 2026>  --pub <28 Oct–3 Nov 2026>  --new <31 Oct–6 Nov 2026>
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-transalis-2026-11-08.mjs --base <f> --pub <f> --new <f> [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const argVal = (name) => {
  const v = args[args.indexOf(name) + 1];
  if (!args.includes(name) || !v || v.startsWith('--')) throw new Error(`${name} <file> is required`);
  return v;
};
const files = { base: argVal('--base'), pub: argVal('--pub'), now: argVal('--new') };
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });
const DOC_ID = 'caseStudy-transalis-ai-visibility';
// The 20 countries whose impressions jumped together on 28 Oct 2026 with almost no clicks (ISO 3166-1 alpha-3).
const EXCLUDED = new Set('deu fra esp ita nld aut prt irl bel dnk hun nor grc swe che pol rou cze fin rus'.split(' '));
if (EXCLUDED.size !== 20) throw new Error('expected 20 excluded countries');
const r1 = (v) => Math.round(v * 10) / 10;

/* ── Search Console ─────────────────────────────────────────────────── */
const keep = (s) => !/transalis/i.test(s) && !/^site:/i.test(s) && !s.includes('<') && s.trim().split(/\s+/).length <= 10;
const window7 = (path, countriesOut) => {
  const { rows } = JSON.parse(readFileSync(path, 'utf8'));
  if (rows.length >= 25000) throw new Error(`${path}: row cap reached`);
  if (rows.some((r) => r.keys.length !== 2)) throw new Error(`${path}: expected keys [query, country]`);
  const q = new Map();
  for (const r of rows) {
    const [query, country] = r.keys;
    if (!keep(query) || (countriesOut && EXCLUDED.has(country))) continue;
    const o = q.get(query) ?? { imp: 0, posW: 0 };
    o.imp += r.impressions; o.posW += r.position * r.impressions;
    q.set(query, o);
  }
  const qs = [...q.values()].filter((o) => o.imp > 0);
  return { page1: qs.filter((o) => o.posW / o.imp <= 10).length, imp: qs.reduce((t, o) => t + o.imp, 0) };
};
const ratio = (a, b) => ({ page1: r1(a.page1 / b.page1), imp: r1(a.imp / b.imp) });
const f = {
  pubIn: ratio(window7(files.pub, false), window7(files.base, false)),
  pubOut: ratio(window7(files.pub, true), window7(files.base, true)),
  newOut: ratio(window7(files.now, true), window7(files.base, true)),
};
const expect = { pubIn: { page1: 2.4, imp: 1.7 }, pubOut: { page1: 2.4, imp: 1.7 }, newOut: { page1: 2.5, imp: 1.7 } };
for (const [k, e] of Object.entries(expect)) for (const m of ['page1', 'imp']) if (f[k][m] !== e[m]) throw new Error(`copy says ${k}.${m} = ${e[m]}×, data says ${f[k][m]}×`);

/* ── Document ───────────────────────────────────────────────────────── */
const doc = await client.getDocument(DOC_ID);
if (!doc) throw new Error(`no document ${DOC_ID}`);
if (await client.getDocument(`drafts.${DOC_ID}`)) throw new Error('an unpublished draft exists; resolve it first');
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
  ['<h3>Google: 2.4× the searches on page one</h3>', '<h3>Google: 2.5× the searches on page one</h3>'],
  [
    'In the seven days to 3 November 2026, the searches outside Transalis\'s own name where transalis.com ranks on Google\'s first page were 2.4× the week the work began (8 to 14 June), and impressions from those searches were 1.7× (Google Search Console). Searches written as AI-agent prompts are left out.',
    'In the seven days to 6 November 2026, the searches outside Transalis\'s own name where transalis.com ranks on Google\'s first page were 2.5× the week the work began (8 to 14 June), and impressions from those searches were 1.7× (Google Search Console). Searches written as AI-agent prompts are left out, and so are 20 European countries whose searches jumped together on 28 October with almost no clicks.',
  ],
  [
    'Google figures come from Google Search Console: the searches that do not contain "Transalis", in the week of 8 June and the seven days to 3 November 2026. Published 30 October 2026; updated 5 November 2026 with Search Console data to 3 November and Ahrefs Domain Rating to 5 November.',
    'Google figures come from Google Search Console: the searches that do not contain "Transalis", in the week of 8 June and the seven days to 6 November 2026. Published 30 October 2026; updated 5 November 2026 with Search Console data to 3 November and Ahrefs Domain Rating to 5 November; updated 8 November 2026 with Search Console data to 6 November; 20 European countries left out.',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [[
  'In Google Search, the searches outside its name where it ranks on page one grew 2.4× from the week the work began to the seven days to 3 November.',
  'In Google Search, the searches outside its name where it ranks on page one grew 2.5× from the week the work began to the seven days to 6 November.',
]], 'paragraphSummary');

const pr = doc.instruments.publishedResult;
if (pr.rows.map((r) => `${r._key}=${r.value}`).join('|') !== 'r-0=5.2% → 16.5%|r-1=6th → 5th of 10|r-2=7.7% → 24.2%|r-3=38 → 49|r-4=2.4×') throw new Error('publishedResult rows changed since 5 Nov');
const publishedResult = {
  ...pr,
  rows: pr.rows.map((r) => (r._key === 'r-4'
    ? { ...r, value: '2.5×', unit: swap(r.unit, [['8–14 Jun → 7 days to 3 Nov', '8–14 Jun → 7 days to 6 Nov']], 'r-4') }
    : r)),
};

const oldSource = 'Google Search Console · non-branded searches, 8–14 Jun 2026 → 28 Oct–3 Nov 2026';
if (doc.instruments.gscSource !== oldSource) throw new Error('gscSource changed since 5 Nov');

const patch = {
  mainBody,
  paragraphSummary,
  'instruments.publishedResult': publishedResult,
  'instruments.gscSource': 'Google Search Console · non-branded searches, 8–14 Jun 2026 → 31 Oct–6 Nov 2026 · 20 European countries left out',
};

console.log(JSON.stringify({ figures: f, r4: publishedResult.rows.find((r) => r._key === 'r-4'), gscSource: patch['instruments.gscSource'] }, null, 1));
if (!WRITE) { console.log('dry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
