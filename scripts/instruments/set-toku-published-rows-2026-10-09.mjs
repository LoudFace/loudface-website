/**
 * Give the Toku case study's further published figures a structured home (instruments.publishedResult.rows), so the
 * service pages that quote them (geo-agency, ai-overviews) read them from the CMS instead of typing them. Every value
 * is copied from the study's own body, and the script checks that each one still appears there before writing.
 * Single-value rows do not render on the case study page (publishedPairs only draws "x% → y%" rows).
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/set-toku-published-rows-2026-10-09.mjs [--write]
 */
import { createClient } from '@sanity/client';

const WRITE = process.argv.includes('--write');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = '0991ec36-3e3b-4b79-84ee-e7a46337be03';

/** [key, value, unit, a phrase the study's body must contain] */
const ROWS = [
  ['core-position', '3.1', 'average cited position on the core prompt, 30 days to 19 Aug 2026', 'average cited position of 3.1'],
  ['aio', '39.3%', 'Toku’s visibility in Google AI Overviews, 30 days to 19 August 2026: the second most-visible brand', '39.3% in the 30 days to 19 August 2026'],
  ['aio-deel', '43.1%', 'Deel, Google AI Overviews visibility, 30 days to 19 August 2026', 'behind Deel at 43.1%'],
  ['aio-remote', '35.9%', 'Remote, Google AI Overviews visibility, 30 days to 19 August 2026', 'ahead of Remote at 35.9%'],
  ['aio-share', '57%', 'of Toku’s total AI mentions came from Google AI Overviews, spring 2026, at average cited position 2.3', 'Google AI Overviews carries 57%'],
  ['engine-aio', '35%', 'Toku visibility in Google AI Overviews, spring 2026', '<td>Google AI Overviews</td><td>35%</td>'],
  ['engine-chatgpt', '11%', 'Toku visibility in ChatGPT, spring 2026', '<td>ChatGPT</td><td>11%</td>'],
  ['engine-perplexity', '10%', 'Toku visibility in Perplexity, spring 2026', '<td>Perplexity</td><td>10%</td>'],
];

const doc = await client.getDocument(DOC_ID);
if (doc?.slug?.current !== 'toku-ai-cited-pipeline') throw new Error('not the Toku case study');
const body = doc.mainBody.replace(/&rsquo;/g, '’');
for (const [key, , , phrase] of ROWS) if (!body.includes(phrase)) throw new Error(`body no longer says "${phrase}" (${key})`);
if (doc.instruments?.publishedResult) throw new Error('publishedResult already exists; merge by hand');

const publishedResult = {
  _type: 'object',
  caption: 'Further published figures from this study, for pages that quote them. Source: Peec AI.',
  rows: ROWS.map(([_key, value, unit]) => ({ _key, _type: 'object', value, unit })),
};
console.log(publishedResult.rows.map((r) => `${r._key}: ${r.value}`).join('\n'));
if (!WRITE) { console.log('dry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).setIfMissing({ instruments: { _type: 'object' } }).set({ 'instruments.publishedResult': publishedResult }).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
