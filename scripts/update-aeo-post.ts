/**
 * Update "The Complete Guide to Answer Engine Optimization (AEO) in 2026"
 * with the v2 content revisions from Notion:
 *   - Intro callout shortened (Gemini removed from first line)
 *   - Benchmark subsection rewritten (agency leaderboard -> citation-source breakdown)
 *   - Rule 3 FAQ reference updated
 *   - Rule 4 two sentences reworded
 *   - Crawl-access paragraph reworded
 *   - Measurement-loop mistake paragraph reworded
 *   - What's next: agentic commerce and final "bet" paragraph reworded
 *   - LoudFace section: expanded positioning statement
 *   - visuals[aeo-agency-share-of-answer-chart] replaced with citation-source-breakdown-chart
 *   - lastUpdated bumped
 *
 * Run: npx tsx scripts/update-aeo-post.ts
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-03-29',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'raw',
});

const DOC_ID = '32d87708-ad43-4d72-8e91-2598dfbdf4fe';
const CONTENT_PATH = '/tmp/aeo-article-content.html';

const newVisual = {
  _key: 'citation-source-breakdown-chart',
  _type: 'blogVisual',
  type: 'chart',
  position: { anchor: 'after-h2', h2Index: 4 },
  alt: 'Horizontal bar chart showing where B2B SaaS citations come from: Review platforms 28%, Community and forums 22%, Editorial and trade media 18%, Vendor blogs and docs 15%, Independent analysis 10%, Primary research and data 7%',
  caption:
    'Share of citations by source type across 400+ audited AI answers on B2B SaaS buyer queries, 2025–2026.',
  chart: {
    kind: 'horizontalBar',
    title: 'Where B2B SaaS Citations Come From (Source-Type Breakdown)',
    xAxis: 'Share of citations (%)',
    yAxis: 'Source type',
    source:
      'LoudFace audit of 400+ AI answers across ChatGPT, Perplexity, Claude, and Google AI Overviews',
    data: [
      { _key: 'citation-source-breakdown-chart-row-0', label: 'Review platforms', unit: '%', value: 28 },
      { _key: 'citation-source-breakdown-chart-row-1', label: 'Community and forums', unit: '%', value: 22 },
      { _key: 'citation-source-breakdown-chart-row-2', label: 'Editorial and trade media', unit: '%', value: 18 },
      { _key: 'citation-source-breakdown-chart-row-3', label: 'Vendor blogs and docs', unit: '%', value: 15 },
      { _key: 'citation-source-breakdown-chart-row-4', label: 'Independent analysis', unit: '%', value: 10 },
      { _key: 'citation-source-breakdown-chart-row-5', label: 'Primary research and data', unit: '%', value: 7 },
    ],
  },
};

async function main() {
  const content = fs.readFileSync(CONTENT_PATH, 'utf8').trim();
  console.log(`[update-aeo-post] Loaded new content: ${content.length} chars`);

  // Fetch the published doc so we can mutate its visuals array in place.
  const existing = await sanity.getDocument(DOC_ID);
  if (!existing) {
    throw new Error(`Document ${DOC_ID} not found`);
  }
  const visuals = (existing.visuals as Array<{ _key: string; [k: string]: unknown }>) || [];
  const targetIdx = visuals.findIndex((v) => v._key === 'aeo-agency-share-of-answer-chart');
  if (targetIdx === -1) {
    throw new Error('Could not find aeo-agency-share-of-answer-chart in visuals array');
  }
  console.log(`[update-aeo-post] Replacing visuals[${targetIdx}] (aeo-agency-share-of-answer-chart) -> citation-source-breakdown-chart`);

  const nextVisuals = [...visuals];
  nextVisuals[targetIdx] = newVisual;

  const now = new Date().toISOString();

  // Patch the published document. Sanity will create/update a draft automatically
  // because the token is authenticated and we're not hitting an immutable field.
  const draftId = `drafts.${DOC_ID}`;

  // Create or replace the draft with the updated fields.
  await sanity
    .createIfNotExists({ ...existing, _id: draftId })
    .catch(() => null); // If draft already exists, ignore.

  const tx = sanity
    .patch(draftId)
    .set({
      content,
      visuals: nextVisuals,
      lastUpdated: now,
    });

  const result = await tx.commit();
  console.log(`[update-aeo-post] Draft patched. _rev=${result._rev}`);

  // Publish the draft.
  await sanity
    .transaction()
    .createOrReplace({ ...result, _id: DOC_ID })
    .delete(draftId)
    .commit();

  console.log(`[update-aeo-post] Published ${DOC_ID}`);
}

main().catch((err) => {
  console.error('[update-aeo-post] FAILED');
  console.error(err);
  process.exit(1);
});
