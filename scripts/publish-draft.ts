/**
 * Publish a blog post draft by slug. Transactionally replaces the published
 * document with the draft's content (minus the `drafts.` prefix) and deletes
 * the draft. Prints a link to the live page on success.
 *
 * Usage: npx tsx scripts/publish-draft.ts <slug>
 */

import { sanityClient } from './visuals/lib/sanity';

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: npx tsx scripts/publish-draft.ts <slug>');
    process.exit(1);
  }

  const client = sanityClient();

  // Find the published doc OR draft by slug. We need the published _id to
  // target; if there's no published version yet, we derive it from the draft.
  const [pub, draft] = await Promise.all([
    client.fetch(`*[_type == "blogPost" && !(_id in path("drafts.**")) && slug.current == $slug][0]{ _id }`, { slug }),
    client.fetch(`*[_type == "blogPost" && _id in path("drafts.**") && slug.current == $slug][0]`, { slug }),
  ]);

  if (!draft) {
    throw new Error(`No draft for slug "${slug}" — nothing to publish.`);
  }

  const publishedId = pub?._id ?? draft._id.replace(/^drafts\./, '');
  const draftId = draft._id;

  // Strip system fields — Sanity manages these on write.
  const { _rev, _createdAt, _updatedAt, ...draftBody } = draft;
  const publishedPayload = { ...draftBody, _id: publishedId };

  console.log(`→ Publishing "${draft.name ?? slug}"`);
  console.log(`  Draft:     ${draftId}`);
  console.log(`  Published: ${publishedId}`);
  console.log(`  Visuals:   ${(draft.visuals ?? []).length}`);

  await client
    .transaction()
    .createOrReplace(publishedPayload)
    .delete(draftId)
    .commit();

  console.log(`✓ Published.`);
  console.log(`  Live: https://www.loudface.co/blog/${slug}`);
}

main().catch((e) => {
  console.error('✗ Publish failed:');
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
