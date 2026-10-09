/**
 * Lead the Delshad Legal case study with its hockey stick (Arnel, 2026-10-09: show the chart with the most impressive
 * trajectory). Google clicks per week outside the celebrity-case pages (14.8×, ending at its high) becomes result 1, and
 * AI share of voice (32.4%, which has eased since its September peak) becomes result 2. The case page, the case-studies
 * index and the homepage pick their chart from result 1, so they now draw the clicks series. Also titles that series.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/delshad-lead-with-clicks-2026-10-09.mjs [--write]
 */
import { createClient } from '@sanity/client';

const WRITE = process.argv.includes('--write');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token: process.env.SANITY_API_TOKEN, useCdn: false });
const DOC_ID = 'caseStudy-delshad-legal-content-engine';

const doc = await client.getDocument(DOC_ID);
if (!/^[\d.]+×$/.test(doc.result2Number) || !/clicks per week/i.test(doc.result2Title)) throw new Error(`result 2 is not the clicks figure: ${doc.result2Number} ${doc.result2Title}`);
if (!/share of voice/i.test(doc.result1Title)) throw new Error(`result 1 is not share of voice: ${doc.result1Title}`);
if (!doc.instruments?.clickGrowth?.points?.length) throw new Error('no clickGrowth series');
const patch = {
  result1Number: doc.result2Number, result1Title: doc.result2Title,
  result2Number: doc.result1Number, result2Title: doc.result1Title,
  'instruments.clickGrowth.title': 'Google clicks per week, outside the celebrity-case pages',
};
console.log(patch);
if (!WRITE) { console.log('dry run'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set(patch).commit();
console.log(`patched rev ${res._rev}`);
