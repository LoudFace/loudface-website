/**
 * Reorder the Delshad Legal summary so it opens with the clicks result the page now leads with (2026-10-09).
 *   SANITY_API_TOKEN=… node scripts/instruments/delshad-summary-2026-10-09.mjs [--write]
 */
import { createClient } from '@sanity/client';
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token: process.env.SANITY_API_TOKEN, useCdn: false });
const ID = 'caseStudy-delshad-legal-content-engine';
const doc = await client.getDocument(ID);
const OLD = "Delshad Legal holds 32.4% AI share of voice over the 30 days to 27 September 2026, first of 12 tracked Los Angeles employment firms at an average mention rank of 1.4, up from 0.13% in the week of 8 June. Google clicks per week outside the celebrity-case pages reached 14.8× the week of 7 June in the week of 27 September, case enquiries through the site run 2.7× the weeks before August, and visits sent by AI assistants were 6× June's in August.";
const NEW = "Delshad Legal's Google clicks per week outside the celebrity-case pages reached 14.8× the week of 7 June in the week of 27 September 2026, and case enquiries through the site run 2.7× the weeks before August. In AI search the firm holds 32.4% share of voice over the 30 days to 27 September, first of 12 tracked Los Angeles employment firms at an average mention rank of 1.4, up from 0.13% in the week of 8 June, and visits sent by AI assistants were 6× June's in August.";
if (doc.paragraphSummary !== OLD) { console.log('summary differs:\n' + doc.paragraphSummary); process.exit(1); }
if (!process.argv.includes('--write')) { console.log('ok, dry run'); process.exit(0); }
const r = await client.patch(ID).ifRevisionId(doc._rev).set({ paragraphSummary: NEW }).commit();
console.log('patched', r._rev);
