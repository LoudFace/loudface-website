/**
 * Write instruments.clickGrowth on the Delshad Legal case study: weekly Google clicks outside the celebrity-case
 * pages, indexed to the week of 7 Jun 2026 = 100. It is the series behind the study's clicks-per-week headline
 * (result2), so the homepage results card can chart the number it prints.
 *
 * Input: the same --gsc file as refresh-delshad-2026-10-09.mjs, with every Sunday-start week from 7 Jun in
 * nonCelebrityWeeks. The last point must reproduce the published result2Number, or nothing is written.
 *
 *   SANITY_API_TOKEN=… node scripts/instruments/set-delshad-click-growth-2026-10-09.mjs --gsc <f> [--write]
 */
import { createClient } from '@sanity/client';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const gscPath = args[args.indexOf('--gsc') + 1];
if (!gscPath || gscPath.startsWith('--')) throw new Error('--gsc <file> is required');
const token = process.env.SANITY_API_TOKEN;
if (!token) throw new Error('SANITY_API_TOKEN missing');
const client = createClient({ projectId: 'xjjjqhgt', dataset: 'production', apiVersion: '2025-03-29', token, useCdn: false });

const DOC_ID = 'caseStudy-delshad-legal-content-engine';
const w = JSON.parse(readFileSync(gscPath, 'utf8')).nonCelebrityWeeks;
const weeks = Object.keys(w).sort();
for (let i = 1; i < weeks.length; i++) {
  const gap = (Date.parse(weeks[i]) - Date.parse(weeks[i - 1])) / 864e5;
  if (gap !== 7) throw new Error(`weeks have a gap at ${weeks[i]}`);
}
if (weeks[0] !== '2026-06-07') throw new Error(`series starts ${weeks[0]}`);
const base = w[weeks[0]];
const points = weeks.map((week) => ({ _key: `cg-${week}`, week, value: Math.round((w[week] / base) * 100) }));

const doc = await client.getDocument(DOC_ID);
const last = `${Math.round(points.at(-1).value / 10) / 10}×`;
if (last !== doc.result2Number) throw new Error(`last point reads ${last}, result2Number is ${doc.result2Number}`);

const clickGrowth = {
  _type: 'object',
  baselineLabel: 'the week of 7 June',
  source: `Google Search Console · weekly, Sunday start · 7 Jun – ${new Date(Date.parse(weeks.at(-1)) + 6 * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}`,
  points,
};
console.log({ weeks: points.length, last, first: points[0], end: points.at(-1) });
if (!WRITE) { console.log('dry run: nothing written (add --write)'); process.exit(0); }
const res = await client.patch(DOC_ID).ifRevisionId(doc._rev).set({ 'instruments.clickGrowth': clickGrowth }).commit();
console.log(`patched ${res._id} rev ${res._rev}`);
