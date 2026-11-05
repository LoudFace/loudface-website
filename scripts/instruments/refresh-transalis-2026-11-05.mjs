/**
 * Add Google Search figures to the Transalis case study (5 Nov 2026) and move the Ahrefs Domain Rating to its
 * 5 Nov reading (49).
 *
 * The study launched on 2 Nov with AI figures only. Search Console (https://www.transalis.com/, final data to
 * 3 Nov) shows the non-branded searches where transalis.com ranks on Google's first page at 2.4× the week the
 * work began (8–14 Jun 2026), and non-branded impressions at 1.7× that week. The page-one count leads: many of
 * the new impressions sit at positions 25–80, the pattern of AI tools searching rather than people, so the
 * impressions figure is stated second and the name searches (mostly prompt-style queries) are left out.
 *
 * Method: one Search Console pull per 7-day window with dimension "query" (a whole-period date×query pull hits
 * the 25,000-row cap). Non-branded = the query does not contain "transalis", is not a "site:" search, has no "<"
 * and is 10 words or fewer (the Pond rule for AI-agent prompts). Page one = the query's average position in the
 * window is 10 or better. Raw counts never leave this script.
 *
 * Input: --dir <folder with 2026-06-08-query.json and 2026-10-28-query.json, gsc-cli --json output>.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/refresh-transalis-2026-11-05.mjs --dir <d> [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const dir = args[args.indexOf('--dir') + 1];
if (!args.includes('--dir') || !dir || dir.startsWith('--')) throw new Error('--dir <folder> is required');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });
const DOC_ID = 'caseStudy-transalis-ai-visibility';
const r1 = (v) => Math.round(v * 10) / 10;

/* ── Search Console ─────────────────────────────────────────────────── */
const keep = (s) => !/transalis/i.test(s) && !/^site:/i.test(s) && !s.includes('<') && s.trim().split(/\s+/).length <= 10;
const week = (start) => {
  const rows = JSON.parse(readFileSync(join(dir, `${start}-query.json`), 'utf8')).rows.filter((r) => keep(r.keys[0]));
  if (rows.length >= 25000) throw new Error(`${start}: row cap reached`);
  return { page1: rows.filter((r) => r.position <= 10).length, imp: rows.reduce((t, r) => t + r.impressions, 0) };
};
const base = week('2026-06-08');
const now = week('2026-10-28');
const f = { page1: r1(now.page1 / base.page1), imp: r1(now.imp / base.imp) };
const expect = { page1: 2.4, imp: 1.7 };
for (const [k, e] of Object.entries(expect)) if (f[k] !== e) throw new Error(`copy says ${k} = ${e}×, data says ${f[k]}×`);

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

const googleSection = `<h3>Google: 2.4× the searches on page one</h3>
<p>The same content lifted Transalis in Google Search. In the seven days to 3 November 2026, the searches outside Transalis's own name where transalis.com ranks on Google's first page were 2.4× the week the work began (8 to 14 June), and impressions from those searches were 1.7× (Google Search Console). Searches written as AI-agent prompts are left out.</p>

`;

const mainBody = swap(doc.mainBody, [
  ['<h3>The domain grew with it</h3>', `${googleSection}<h3>The domain grew with it</h3>`],
  [
    'Ahrefs rated transalis.com at Domain Rating 38 in June 2026, when the work began, and 48 in October.',
    'Ahrefs rated transalis.com at Domain Rating 38 in June 2026, when the work began, 48 in October and 49 on 5 November.',
  ],
  [
    'Published 30 October 2026.',
    'Google figures come from Google Search Console: the searches that do not contain "Transalis", in the week of 8 June and the seven days to 3 November 2026. Published 30 October 2026; updated 5 November 2026 with Search Console data to 3 November and Ahrefs Domain Rating to 5 November.',
  ],
], 'mainBody');

const paragraphSummary = swap(doc.paragraphSummary, [[
  'Windows: 27 July to 23 August and the seven days to 30 October 2026.',
  'Windows: 27 July to 23 August and the seven days to 30 October 2026. In Google Search, the searches outside its name where it ranks on page one grew 2.4× from the week the work began to the seven days to 3 November.',
]], 'paragraphSummary');

const pr = doc.instruments.publishedResult;
if (pr.rows.some((r) => r._key === 'r-4')) throw new Error('r-4 already exists');
const publishedResult = {
  ...pr,
  caption: swap(pr.caption, [['Sources: Peec AI (73 prompts on ChatGPT, Google AI Overviews and Perplexity), Ahrefs.', 'Sources: Peec AI (73 prompts on ChatGPT, Google AI Overviews and Perplexity), Google Search Console, Ahrefs.']], 'publishedResult.caption'),
  rows: [
    ...pr.rows.map((r) => (r._key === 'r-3' ? { ...r, value: swap(r.value, [['38 → 48', '38 → 49']], 'r-3'), unit: swap(r.unit, [['Jun → Oct 2026', 'Jun → 5 Nov 2026']], 'r-3') } : r)),
    { _key: 'r-4', value: '2.4×', unit: 'Non-branded Google searches ranking on page one, 8–14 Jun → 7 days to 3 Nov' },
  ],
};

const patch = {
  mainBody,
  paragraphSummary,
  'instruments.publishedResult': publishedResult,
  'instruments.gscSource': 'Google Search Console · non-branded searches, 8–14 Jun 2026 → 28 Oct–3 Nov 2026',
};

console.log(JSON.stringify({ figures: f }, null, 1));
if (!WRITE) { console.log('dry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
