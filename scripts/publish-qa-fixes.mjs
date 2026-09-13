/**
 * One-off: publish the copy-QA draft fixes (case-study titles, client name,
 * team bios, testimonial grammar). Transactionally promotes each draft to
 * published and deletes the draft, then reads the live value back to confirm.
 *
 * Run: node --env-file=.env.local scripts/publish-qa-fixes.mjs
 */
import { createClient } from '@sanity/client';

const token = process.env.SANITY_API_TOKEN;
if (!token) { console.error('Missing SANITY_API_TOKEN'); process.exit(1); }

const client = createClient({
  projectId: 'xjjjqhgt',
  dataset: 'production',
  apiVersion: '2025-03-29',
  token,
  useCdn: false,
});

const IDS = [
  ['imported-caseStudy-67bde53e2e9bd74f1a3f4080', 'Eraser title (SaaS)'],
  ['imported-caseStudy-67bde541752d61d0b9db084d', 'Sendswift title (SaaS)'],
  ['imported-caseStudy-67bde54015ae8b7e575d1528', 'LIQID title (HubSpot)'],
  ['imported-testimonial-67bdb4f33120ed8c4483b7bb', 'Testimonial name (Dominic)'],
  ['imported-teamMember-68d81ad0e04d54f2dbf656c2', 'David bio'],
  ['imported-teamMember-68d81bb7e8fe2e090f1c9e93', 'Rezwan bio'],
  ['imported-teamMember-68d81c68152f34538dc573e2', 'Andrea bio'],
  ['imported-testimonial-67bdb4f28827a78ac0cec68b', 'Christian quote'],
  ['imported-testimonial-67bdb4f816012c0c445015b2', 'Shin quote'],
];

const field = (d) => d.projectTitle ?? d.name ?? d.bioSummary ?? d.testimonialBody ?? '';

let ok = 0, skip = 0, fail = 0;
for (const [id, label] of IDS) {
  const draftId = `drafts.${id}`;
  try {
    const [pub, draft] = await Promise.all([
      client.getDocument(id).catch(() => null),
      client.getDocument(draftId).catch(() => null),
    ]);
    if (!draft) { console.log(`• SKIP  ${label} — no draft (already published?)`); skip++; continue; }
    const { _rev, _updatedAt, ...draftBody } = draft;
    const merged = { ...(pub || {}), ...draftBody, _id: id };
    delete merged._rev; delete merged._updatedAt;
    await client.transaction().createOrReplace(merged).delete(draftId).commit({ visibility: 'async' });
    const live = await client.getDocument(id);
    console.log(`✓ PUBLISHED  ${label}\n     → ${String(field(live)).replace(/<[^>]*>/g, '').trim().slice(0, 90)}`);
    ok++;
  } catch (e) {
    console.error(`✗ FAIL  ${label} — ${e.message}`);
    fail++;
  }
}
console.log(`\nDone: ${ok} published, ${skip} skipped, ${fail} failed.`);
process.exit(fail ? 1 : 0);
